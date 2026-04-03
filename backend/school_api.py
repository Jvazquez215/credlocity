"""
CROA Ethics School API
Manages courses, lessons, quizzes, certificates, badges, discussions, and chat
for the credit repair industry education platform.
"""

from fastapi import APIRouter, HTTPException, Header, WebSocket, WebSocketDisconnect
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from uuid import uuid4
import json
from revenue_tracker import log_revenue

school_router = APIRouter(prefix="/school", tags=["School"])

db = None

def set_db(database):
    global db
    db = database


# ==================== AUTH HELPERS ====================

async def get_student(token=None, authorization=None):
    """Get student from JWT token."""
    from auth import decode_token
    tk = token
    if not tk and authorization:
        tk = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    if not tk:
        return None
    payload = decode_token(tk)
    if not payload:
        return None
    email = payload.get("sub")
    if not email:
        return None
    student = await db.school_students.find_one({"email": email}, {"_id": 0})
    return student


async def get_admin_user(token=None, authorization=None):
    """Get admin user from JWT token (admin/super_admin only)."""
    from auth import decode_token
    tk = token
    if not tk and authorization:
        tk = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    if not tk:
        return None
    payload = decode_token(tk)
    if not payload:
        return None
    user = await db.users.find_one({"email": payload.get("sub")}, {"_id": 0})
    if user and user.get("role") in ["admin", "super_admin"]:
        return user
    return None


async def get_school_user(token=None, authorization=None):
    """Get any CMS user with school access (admin, super_admin, or guest_teacher)."""
    from auth import decode_token
    tk = token
    if not tk and authorization:
        tk = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    if not tk:
        return None
    payload = decode_token(tk)
    if not payload:
        return None
    user = await db.users.find_one({"email": payload.get("sub")}, {"_id": 0})
    if user and user.get("role") in ["admin", "super_admin", "guest_teacher"]:
        return user
    return None


# ==================== STUDENT AUTH ====================

@school_router.post("/auth/register")
async def register_student(data: dict):
    """Register a new student (free)."""
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()
    company_name = data.get("company_name", "").strip()

    if not email or not password or not full_name:
        raise HTTPException(status_code=400, detail="Email, password, and full name are required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = await db.school_students.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    from auth import get_password_hash, create_access_token
    student = {
        "id": str(uuid4()),
        "email": email,
        "password_hash": get_password_hash(password),
        "full_name": full_name,
        "company_name": company_name,
        "role": "student",
        "is_active": True,
        "enrolled_courses": [],
        "completed_courses": [],
        "certificates": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.school_students.insert_one(student)
    student.pop("_id", None)

    token = create_access_token(data={"sub": email, "role": "student"}, expires_delta=timedelta(days=7))

    return {
        "access_token": token,
        "student": {k: v for k, v in student.items() if k != "password_hash"}
    }


@school_router.post("/auth/login")
async def login_student(data: dict):
    """Student login."""
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    student = await db.school_students.find_one({"email": email}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    from auth import verify_password, create_access_token
    if not verify_password(password, student.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not student.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token(data={"sub": email, "role": "student"}, expires_delta=timedelta(days=7))

    # Track login history
    login_now = datetime.now(timezone.utc).isoformat()
    await db.school_students.update_one(
        {"email": email},
        {
            "$set": {"last_login": login_now},
            "$push": {"login_history": {"$each": [{"timestamp": login_now}], "$slice": -100}}
        }
    )

    return {
        "access_token": token,
        "student": {k: v for k, v in student.items() if k != "password_hash"}
    }


@school_router.get("/auth/me")
async def get_student_profile(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get current student profile."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"student": {k: v for k, v in student.items() if k != "password_hash"}}


# ==================== COURSES ====================

@school_router.get("/courses")
async def list_courses(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """List all published courses (public, but enrollment status shown if authenticated)."""
    courses = await db.school_courses.find(
        {"status": "published"},
        {"_id": 0, "lessons": 0}
    ).sort("order", 1).to_list(None)

    student = await get_student(token, authorization)
    if student:
        enrolled_ids = student.get("enrolled_courses", [])
        completed_ids = student.get("completed_courses", [])
        for c in courses:
            c["is_enrolled"] = c["id"] in enrolled_ids
            c["is_completed"] = c["id"] in completed_ids

    return {"courses": courses}


@school_router.get("/courses/{course_id}")
async def get_course(course_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get course detail with lessons."""
    course = await db.school_courses.find_one({"id": course_id, "status": "published"}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    student = await get_student(token, authorization)
    if student:
        course["is_enrolled"] = course_id in student.get("enrolled_courses", [])
        course["is_completed"] = course_id in student.get("completed_courses", [])

        # Get quiz attempt if any
        attempt = await db.school_quiz_attempts.find_one(
            {"student_id": student["id"], "course_id": course_id},
            {"_id": 0}
        )
        course["quiz_attempt"] = attempt
    else:
        # Don't show full lesson content for unauthenticated
        if "lessons" in course:
            for lesson in course["lessons"]:
                lesson["content"] = lesson.get("content", "")[:200] + "..."

    return {"course": course}


@school_router.post("/courses/{course_id}/enroll")
async def enroll_course(course_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Enroll in a course."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    course = await db.school_courses.find_one({"id": course_id, "status": "published"}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course_id in student.get("enrolled_courses", []):
        return {"message": "Already enrolled"}

    # Check if paid course
    if course.get("price", 0) > 0 and not course.get("is_free", True):
        raise HTTPException(status_code=402, detail="Payment required for this course")

    # Create enrollment
    enrollment = {
        "id": str(uuid4()),
        "student_id": student["id"],
        "course_id": course_id,
        "course_title": course.get("title", ""),
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
        "progress": {"lessons_completed": [], "quiz_passed": False}
    }
    await db.school_enrollments.insert_one(enrollment)

    await db.school_students.update_one(
        {"id": student["id"]},
        {"$addToSet": {"enrolled_courses": course_id}}
    )

    return {"message": "Enrolled successfully", "enrollment": {k: v for k, v in enrollment.items() if k != "_id"}}


# ==================== LESSONS ====================

@school_router.get("/courses/{course_id}/lessons/{lesson_index}")
async def get_lesson(course_id: str, lesson_index: int, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get a specific lesson. Must be enrolled."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if course_id not in student.get("enrolled_courses", []):
        raise HTTPException(status_code=403, detail="You must enroll in this course first")

    course = await db.school_courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lessons = course.get("lessons", [])
    if lesson_index < 0 or lesson_index >= len(lessons):
        raise HTTPException(status_code=404, detail="Lesson not found")

    return {
        "lesson": lessons[lesson_index],
        "lesson_index": lesson_index,
        "total_lessons": len(lessons),
        "course_title": course.get("title", "")
    }


@school_router.post("/courses/{course_id}/lessons/{lesson_index}/complete")
async def complete_lesson(course_id: str, lesson_index: int, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Mark a lesson as completed."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    await db.school_enrollments.update_one(
        {"student_id": student["id"], "course_id": course_id},
        {"$addToSet": {"progress.lessons_completed": lesson_index}}
    )
    return {"message": "Lesson marked complete"}


# ==================== QUIZZES ====================

@school_router.get("/courses/{course_id}/quiz")
async def get_quiz(course_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get quiz questions for a course (without answers)."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if course_id not in student.get("enrolled_courses", []):
        raise HTTPException(status_code=403, detail="Enroll first")

    course = await db.school_courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    quiz = course.get("quiz", {})
    questions = quiz.get("questions", [])

    # Strip correct answers
    safe_questions = []
    for q in questions:
        safe_questions.append({
            "id": q["id"],
            "question": q["question"],
            "options": q["options"],
            "explanation": None  # Only shown after submission
        })

    return {
        "quiz": {
            "course_id": course_id,
            "course_title": course.get("title", ""),
            "total_questions": len(questions),
            "passing_score": quiz.get("passing_score", 80),
            "questions": safe_questions
        }
    }


@school_router.post("/courses/{course_id}/quiz/submit")
async def submit_quiz(course_id: str, data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Submit quiz answers and get results."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    answers = data.get("answers", {})  # {question_id: selected_option_index}

    course = await db.school_courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    quiz = course.get("quiz", {})
    questions = quiz.get("questions", [])
    passing_score = quiz.get("passing_score", 80)

    # Grade
    correct = 0
    results = []
    for q in questions:
        student_answer = answers.get(q["id"])
        is_correct = student_answer == q.get("correct_answer")
        if is_correct:
            correct += 1
        results.append({
            "question_id": q["id"],
            "question": q["question"],
            "student_answer": student_answer,
            "correct_answer": q["correct_answer"],
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    score = round((correct / len(questions)) * 100, 1) if questions else 0
    passed = score >= passing_score

    attempt = {
        "id": str(uuid4()),
        "student_id": student["id"],
        "student_name": student.get("full_name", ""),
        "course_id": course_id,
        "course_title": course.get("title", ""),
        "score": score,
        "correct": correct,
        "total": len(questions),
        "passed": passed,
        "passing_score": passing_score,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }

    # Save or update attempt (keep best score)
    existing = await db.school_quiz_attempts.find_one(
        {"student_id": student["id"], "course_id": course_id}
    )
    if existing:
        if score > existing.get("score", 0):
            await db.school_quiz_attempts.update_one(
                {"student_id": student["id"], "course_id": course_id},
                {"$set": attempt}
            )
    else:
        await db.school_quiz_attempts.insert_one(attempt)

    # If passed, issue certificate and update enrollment
    certificate = None
    badge_html = None
    if passed:
        await db.school_enrollments.update_one(
            {"student_id": student["id"], "course_id": course_id},
            {"$set": {"progress.quiz_passed": True, "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
        await db.school_students.update_one(
            {"id": student["id"]},
            {"$addToSet": {"completed_courses": course_id}}
        )

        # Generate certificate
        cert = await _issue_certificate(student, course, score)
        certificate = cert

        # Generate badge HTML
        badge_html = _generate_badge_html(student, course, cert["id"])

    attempt.pop("_id", None)
    return {
        "attempt": attempt,
        "results": results,
        "passed": passed,
        "score": score,
        "certificate": certificate,
        "badge_html": badge_html
    }


async def _issue_certificate(student, course, score):
    """Create a certificate record."""
    cert_id = str(uuid4())[:8].upper()
    cert = {
        "id": cert_id,
        "student_id": student["id"],
        "student_name": student.get("full_name", ""),
        "company_name": student.get("company_name", ""),
        "course_id": course["id"],
        "course_title": course.get("title", ""),
        "course_short_name": course.get("short_name", ""),
        "score": score,
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "verification_url": f"https://www.credlocity.com/verify/{cert_id}"
    }
    await db.school_certificates.insert_one(cert)
    cert.pop("_id", None)

    # Also add to student record
    await db.school_students.update_one(
        {"id": student["id"]},
        {"$addToSet": {"certificates": {"cert_id": cert_id, "course_id": course["id"], "course_title": course.get("title", ""), "issued_at": cert["issued_at"]}}}
    )
    return cert


def _generate_badge_html(student, course, cert_id):
    """Generate beautiful embeddable trust badge with SEO-optimized backlink and schema markup."""
    short = course.get("short_name", "CERT")
    name = student.get("company_name") or student.get("full_name", "")
    badge_color = course.get("badge_color", "#1a365d")
    accent = course.get("badge_accent", "#c6a035")
    course_title = course.get("title", "Compliance Certification")

    html = f'''<!-- Credlocity Ethics School - {course_title} Trust Badge -->
<!-- Installation: Copy this entire code block and paste into your website's HTML -->
<div itemscope itemtype="https://schema.org/EducationalOccupationalCredential" style="display:inline-block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;text-align:center;max-width:240px;">
  <meta itemprop="credentialCategory" content="Certificate" />
  <meta itemprop="name" content="{course_title}" />
  <div style="background:linear-gradient(145deg,{badge_color} 0%,#0f1f33 100%);border-radius:16px;padding:24px 22px 20px;color:white;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.1);overflow:hidden;">
    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,{accent},transparent,{accent});"></div>
    <div style="position:absolute;top:10px;right:10px;width:36px;height:36px;border:2px solid {accent};border-radius:50%;display:flex;align-items:center;justify-content:center;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="{accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <div style="width:42px;height:42px;border-radius:10px;background:rgba(255,255,255,0.08);border:1.5px solid {accent};display:flex;align-items:center;justify-content:center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="{accent}" stroke-width="2" stroke-linecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/></svg>
      </div>
      <div style="text-align:left;">
        <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:{accent};font-weight:600;">Verified</div>
        <div style="font-size:15px;font-weight:800;letter-spacing:0.5px;line-height:1.1;" itemprop="about">{short}</div>
      </div>
    </div>
    <div style="width:100%;height:1px;background:linear-gradient(90deg,transparent,{accent},transparent);margin:8px 0;"></div>
    <div style="font-size:13px;font-weight:600;line-height:1.3;margin-bottom:4px;" itemprop="recognizedBy">{name}</div>
    <div style="font-size:10px;opacity:0.7;margin-bottom:10px;">{course_title}</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 12px;background:rgba(255,255,255,0.06);border-radius:8px;border:1px solid rgba(255,255,255,0.08);">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="{accent}" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
      <a href="https://www.credlocity.com/school" rel="dofollow" title="Credlocity CROA Ethics School - Credit Repair Compliance Training" style="color:{accent};font-size:10px;text-decoration:none;font-weight:600;letter-spacing:0.3px;" itemprop="url">Credlocity Ethics School</a>
    </div>
    <div style="font-size:8px;margin-top:8px;opacity:0.35;">ID: {cert_id[:12]}</div>
  </div>
</div>
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalCredential",
  "name": "{course_title}",
  "credentialCategory": "Certificate",
  "recognizedBy": {{
    "@type": "Organization",
    "name": "Credlocity",
    "url": "https://www.credlocity.com"
  }},
  "about": {{
    "@type": "Course",
    "name": "{course_title}",
    "provider": {{
      "@type": "Organization",
      "name": "Credlocity CROA Ethics School",
      "url": "https://www.credlocity.com/school"
    }}
  }}
}}
</script>'''
    return html


# ==================== CERTIFICATES ====================

@school_router.get("/certificates")
async def get_my_certificates(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get all certificates for the current student."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    certs = await db.school_certificates.find(
        {"student_id": student["id"]}, {"_id": 0}
    ).sort("issued_at", -1).to_list(None)

    return {"certificates": certs}


@school_router.get("/certificates/{cert_id}")
async def get_certificate(cert_id: str):
    """Get certificate details (public for verification)."""
    cert = await db.school_certificates.find_one({"id": cert_id}, {"_id": 0})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"certificate": cert}


@school_router.get("/certificates/{cert_id}/badge-html")
async def get_badge_html(cert_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get the embeddable badge HTML for a certificate."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    cert = await db.school_certificates.find_one({"id": cert_id, "student_id": student["id"]}, {"_id": 0})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    course = await db.school_courses.find_one({"id": cert["course_id"]}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    badge_html = _generate_badge_html(student, course, cert_id)
    return {"badge_html": badge_html, "certificate": cert}


# ==================== CERTIFICATE PDF ====================

@school_router.get("/certificates/{cert_id}/pdf")
async def download_certificate_pdf(cert_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Generate and return certificate PDF."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    cert = await db.school_certificates.find_one({"id": cert_id, "student_id": student["id"]}, {"_id": 0})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    from reportlab.lib.pagesizes import landscape, letter
    from reportlab.lib import colors
    from reportlab.pdfgen import canvas as pdf_canvas
    from reportlab.lib.units import inch
    from io import BytesIO
    from fastapi.responses import StreamingResponse

    buffer = BytesIO()
    width, height = landscape(letter)
    c = pdf_canvas.Canvas(buffer, pagesize=landscape(letter))

    # Background
    c.setFillColor(colors.HexColor("#0f172a"))
    c.rect(0, 0, width, height, fill=1)

    # Gold border
    c.setStrokeColor(colors.HexColor("#c6a035"))
    c.setLineWidth(4)
    c.rect(30, 30, width - 60, height - 60, fill=0)
    c.setLineWidth(1)
    c.rect(40, 40, width - 80, height - 80, fill=0)

    # Header
    c.setFillColor(colors.HexColor("#c6a035"))
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 80, "CREDLOCITY ETHICS SCHOOL")

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(width / 2, height - 130, "Certificate of Completion")

    # Divider
    c.setStrokeColor(colors.HexColor("#c6a035"))
    c.setLineWidth(2)
    c.line(width / 2 - 100, height - 145, width / 2 + 100, height - 145)

    # Body
    c.setFillColor(colors.HexColor("#94a3b8"))
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 180, "This certifies that")

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 220, cert.get("student_name", ""))

    if cert.get("company_name"):
        c.setFillColor(colors.HexColor("#94a3b8"))
        c.setFont("Helvetica", 12)
        c.drawCentredString(width / 2, height - 245, cert["company_name"])

    c.setFillColor(colors.HexColor("#94a3b8"))
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 275, "has successfully completed the")

    c.setFillColor(colors.HexColor("#c6a035"))
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 310, cert.get("course_title", ""))

    c.setFillColor(colors.HexColor("#94a3b8"))
    c.setFont("Helvetica", 12)
    c.drawCentredString(width / 2, height - 340, f"Score: {cert.get('score', 0)}%  |  Issued: {cert.get('issued_at', '')[:10]}  |  Certificate ID: {cert_id}")

    # Footer
    c.setFillColor(colors.HexColor("#475569"))
    c.setFont("Helvetica", 9)
    c.drawCentredString(width / 2, 60, "Verified at www.credlocity.com  |  Credlocity Ethics School")

    c.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=certificate-{cert_id}.pdf"}
    )


# ==================== DISCUSSIONS ====================

@school_router.get("/courses/{course_id}/discussions")
async def get_discussions(course_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get discussion threads for a course."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    threads = await db.school_discussions.find(
        {"course_id": course_id, "parent_id": None},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(None)

    # Get reply counts
    for t in threads:
        t["reply_count"] = await db.school_discussions.count_documents({"parent_id": t["id"]})

    return {"discussions": threads}


@school_router.post("/courses/{course_id}/discussions")
async def create_discussion(course_id: str, data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Create a discussion thread or reply."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    content = data.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content is required")

    post = {
        "id": str(uuid4()),
        "course_id": course_id,
        "parent_id": data.get("parent_id"),
        "author_id": student["id"],
        "author_name": student.get("full_name", ""),
        "author_company": student.get("company_name", ""),
        "content": content,
        "likes": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.school_discussions.insert_one(post)
    post.pop("_id", None)
    return {"discussion": post}


@school_router.get("/courses/{course_id}/discussions/{thread_id}/replies")
async def get_replies(course_id: str, thread_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get replies to a discussion thread."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    replies = await db.school_discussions.find(
        {"parent_id": thread_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(None)

    return {"replies": replies}


# ==================== CHAT ====================

@school_router.get("/courses/{course_id}/chat")
async def get_chat_messages(course_id: str, limit: int = 50, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get recent chat messages for a course."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    messages = await db.school_chat.find(
        {"course_id": course_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(None)

    messages.reverse()
    return {"messages": messages}


@school_router.post("/courses/{course_id}/chat")
async def send_chat_message(course_id: str, data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Send a chat message."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")

    content = data.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message is required")

    msg = {
        "id": str(uuid4()),
        "course_id": course_id,
        "author_id": student["id"],
        "author_name": student.get("full_name", ""),
        "content": content[:1000],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.school_chat.insert_one(msg)
    msg.pop("_id", None)
    return {"message": msg}


# ==================== ADMIN ENDPOINTS ====================

@school_router.get("/admin/students")
async def admin_list_students(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """List all students (admin only)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    students = await db.school_students.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(None)
    return {"students": students, "total": len(students)}


@school_router.get("/admin/courses")
async def admin_list_courses(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """List all courses for admin (including drafts)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    courses = await db.school_courses.find({}, {"_id": 0}).sort("order", 1).to_list(None)
    return {"courses": courses}


@school_router.get("/admin/stats")
async def admin_stats(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get school statistics."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    total_students = await db.school_students.count_documents({})
    total_enrollments = await db.school_enrollments.count_documents({})
    total_certificates = await db.school_certificates.count_documents({})
    total_completions = await db.school_enrollments.count_documents({"completed_at": {"$ne": None}})
    pending_courses = await db.school_courses.count_documents({"status": "pending_approval"})

    return {
        "stats": {
            "total_students": total_students,
            "total_enrollments": total_enrollments,
            "total_certificates": total_certificates,
            "total_completions": total_completions,
            "pending_courses": pending_courses,
            "completion_rate": round((total_completions / total_enrollments * 100) if total_enrollments > 0 else 0, 1)
        }
    }


# ==================== ADMIN COURSE MANAGEMENT ====================

@school_router.post("/admin/courses")
async def admin_create_course(data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Create a new course. Admins publish immediately; guest teachers create as pending_approval."""
    user = await get_school_user(token, authorization)
    if not user:
        raise HTTPException(status_code=403, detail="School access required")

    title = data.get("title", "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Course title is required")

    is_admin = user.get("role") in ["admin", "super_admin"]
    status_val = "published" if is_admin else "pending_approval"

    course = {
        "id": str(uuid4()),
        "title": title,
        "description": data.get("description", ""),
        "short_name": data.get("short_name", title[:10].upper()),
        "duration": data.get("duration", "Self-paced"),
        "is_free": data.get("is_free", True),
        "price": data.get("price", 0),
        "badge_color": data.get("badge_color", "#1a365d"),
        "badge_accent": data.get("badge_accent", "#c6a035"),
        "passing_score": data.get("passing_score", 80),
        "total_questions": 0,
        "order": data.get("order", 99),
        "status": status_val,
        "lessons": data.get("lessons", []),
        "quiz": data.get("quiz", {"questions": [], "passing_score": data.get("passing_score", 80)}),
        "created_by": user.get("id", ""),
        "created_by_name": user.get("full_name", ""),
        "created_by_role": user.get("role", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    # Update total_questions from quiz
    course["total_questions"] = len(course["quiz"].get("questions", []))

    await db.school_courses.insert_one(course)
    course.pop("_id", None)
    return {"course": course, "message": f"Course created as '{status_val}'"}


@school_router.put("/admin/courses/{course_id}")
async def admin_update_course(course_id: str, data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Update a course. Guest teachers can only edit their own pending courses."""
    user = await get_school_user(token, authorization)
    if not user:
        raise HTTPException(status_code=403, detail="School access required")

    course = await db.school_courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    is_admin = user.get("role") in ["admin", "super_admin"]

    # Guest teachers can only edit their own pending courses
    if not is_admin:
        if course.get("created_by") != user.get("id"):
            raise HTTPException(status_code=403, detail="You can only edit your own courses")
        if course.get("status") not in ["pending_approval", "rejected"]:
            raise HTTPException(status_code=403, detail="Published courses can only be edited by admins")

    update_fields = {}
    for field in ["title", "description", "short_name", "duration", "is_free", "price",
                   "badge_color", "badge_accent", "passing_score", "order", "lessons", "quiz"]:
        if field in data:
            update_fields[field] = data[field]

    if "quiz" in update_fields:
        update_fields["total_questions"] = len(update_fields["quiz"].get("questions", []))
        if "passing_score" not in update_fields:
            update_fields.setdefault("passing_score", update_fields["quiz"].get("passing_score", 80))

    # Admins can change status directly
    if is_admin and "status" in data:
        update_fields["status"] = data["status"]

    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.school_courses.update_one({"id": course_id}, {"$set": update_fields})

    updated = await db.school_courses.find_one({"id": course_id}, {"_id": 0})
    return {"course": updated, "message": "Course updated"}


@school_router.put("/admin/courses/{course_id}/approve")
async def admin_approve_course(course_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Approve a pending course (admin only)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    course = await db.school_courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    await db.school_courses.update_one(
        {"id": course_id},
        {"$set": {
            "status": "published",
            "approved_by": admin.get("id", ""),
            "approved_by_name": admin.get("full_name", ""),
            "approved_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Course approved and published"}


@school_router.put("/admin/courses/{course_id}/reject")
async def admin_reject_course(course_id: str, data: dict = None, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Reject a pending course with optional reason (admin only)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    course = await db.school_courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    reason = (data or {}).get("reason", "")
    await db.school_courses.update_one(
        {"id": course_id},
        {"$set": {
            "status": "rejected",
            "rejection_reason": reason,
            "rejected_by": admin.get("id", ""),
            "rejected_by_name": admin.get("full_name", ""),
            "rejected_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Course rejected", "reason": reason}


@school_router.delete("/admin/courses/{course_id}")
async def admin_delete_course(course_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Delete a course (admin only)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await db.school_courses.delete_one({"id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")

    # Clean up enrollments, attempts, and certificates
    await db.school_enrollments.delete_many({"course_id": course_id})
    await db.school_quiz_attempts.delete_many({"course_id": course_id})

    return {"message": "Course deleted"}


# ==================== GUEST TEACHER ENDPOINTS ====================

@school_router.get("/admin/my-courses")
async def admin_my_courses(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get courses created by the current user (for guest teachers)."""
    user = await get_school_user(token, authorization)
    if not user:
        raise HTTPException(status_code=403, detail="School access required")

    is_admin = user.get("role") in ["admin", "super_admin"]
    if is_admin:
        # Admins see all
        courses = await db.school_courses.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    else:
        courses = await db.school_courses.find(
            {"created_by": user.get("id", "")}, {"_id": 0}
        ).sort("created_at", -1).to_list(None)

    return {"courses": courses}


# ==================== TEACHER TRUST BADGE ====================

@school_router.get("/admin/teacher-badge")
async def get_teacher_badge(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Generate Teacher Trust Badge for a guest teacher with approved courses."""
    user = await get_school_user(token, authorization)
    if not user:
        raise HTTPException(status_code=403, detail="School access required")

    # Count approved courses by this teacher
    approved_count = await db.school_courses.count_documents({
        "created_by": user.get("id", ""),
        "status": "published"
    })

    if approved_count == 0:
        raise HTTPException(status_code=404, detail="No approved courses found. Badge requires at least one published course.")

    badge_html = _generate_teacher_badge_html(user, approved_count)
    return {"badge_html": badge_html, "approved_courses": approved_count}


def _generate_teacher_badge_html(user, approved_count):
    """Generate embeddable Teacher Trust Badge HTML with Credlocity backlink."""
    name = user.get("full_name", "Teacher")

    html = f'''<!-- Credlocity Ethics School - Verified Teacher Badge -->
<div style="display:inline-block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;max-width:220px;">
  <div style="background:#1e3a5f;border:3px solid #3b82f6;border-radius:12px;padding:16px 20px;color:white;position:relative;">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#3b82f6;margin-bottom:6px;">Verified Teacher</div>
    <div style="font-size:16px;font-weight:700;line-height:1.2;margin-bottom:4px;">{name}</div>
    <div style="width:40px;height:2px;background:#3b82f6;margin:8px auto;"></div>
    <div style="font-size:10px;opacity:0.9;line-height:1.3;">{approved_count} Published Course{"s" if approved_count != 1 else ""}</div>
    <div style="font-size:9px;margin-top:8px;opacity:0.7;">CROA Ethics School</div>
    <div style="font-size:8px;margin-top:2px;opacity:0.5;">Credlocity Verified</div>
    <!-- Backlink for SEO - do not remove -->
    <a href="https://www.credlocity.com" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);border:0;" aria-hidden="true" tabindex="-1">Credlocity Credit Repair Education</a>
  </div>
</div>'''
    return html


# ==================== GUEST TEACHER MANAGEMENT (ADMIN ONLY) ====================

@school_router.get("/admin/teachers")
async def admin_list_teachers(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """List all guest teachers (admin only)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    teachers = await db.users.find(
        {"role": "guest_teacher"}, {"_id": 0, "hashed_password": 0}
    ).sort("created_at", -1).to_list(None)

    # Enrich with course counts
    for t in teachers:
        t["total_courses"] = await db.school_courses.count_documents({"created_by": t.get("id", "")})
        t["published_courses"] = await db.school_courses.count_documents({"created_by": t.get("id", ""), "status": "published"})
        t["pending_courses"] = await db.school_courses.count_documents({"created_by": t.get("id", ""), "status": "pending_approval"})

    return {"teachers": teachers, "total": len(teachers)}


@school_router.post("/admin/teachers")
async def admin_create_teacher(data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Create a guest teacher account (admin only)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()

    if not email or not password or not full_name:
        raise HTTPException(status_code=400, detail="Email, password, and full name are required")

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    from auth import get_password_hash
    teacher = {
        "id": str(uuid4()),
        "email": email,
        "hashed_password": get_password_hash(password),
        "full_name": full_name,
        "role": "guest_teacher",
        "is_active": True,
        "bio": data.get("bio", ""),
        "specialization": data.get("specialization", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(teacher)
    teacher.pop("_id", None)
    teacher.pop("hashed_password", None)

    return {"teacher": teacher, "message": "Guest teacher account created"}


@school_router.get("/admin/pending-courses")
async def admin_pending_courses(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get all courses pending approval (admin only)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    courses = await db.school_courses.find(
        {"status": "pending_approval"}, {"_id": 0}
    ).sort("created_at", -1).to_list(None)

    return {"courses": courses, "total": len(courses)}




# ==================== STUDENT DETAIL PROFILE (ADMIN) ====================

@school_router.get("/admin/students/{student_id}")
async def admin_get_student_detail(student_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get comprehensive student profile for admin view."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    student = await db.school_students.find_one({"id": student_id}, {"_id": 0, "password_hash": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Enrollments
    enrollments = await db.school_enrollments.find({"student_id": student_id}, {"_id": 0}).to_list(None)
    for e in enrollments:
        course = await db.school_courses.find_one({"id": e.get("course_id")}, {"_id": 0, "title": 1, "short_name": 1})
        e["course_title"] = course.get("title", "") if course else ""
        e["course_short_name"] = course.get("short_name", "") if course else ""

    # Certificates
    certificates = await db.school_certificates.find({"student_id": student_id}, {"_id": 0}).to_list(None)

    # Payment plans
    payment_plans = await db.school_payment_plans.find({"student_id": student_id}, {"_id": 0}).to_list(None)
    for plan in payment_plans:
        payments = await db.school_payment_records.find({"plan_id": plan["id"]}, {"_id": 0}).sort("payment_date", -1).to_list(None)
        plan["payments"] = payments

    # Live class registrations
    registered_classes = await db.school_live_classes.find(
        {"registered_students": student_id}, {"_id": 0, "registered_students": 0}
    ).to_list(None)

    # Determine missed classes (past scheduled_at but student was registered)
    now = datetime.now(timezone.utc).isoformat()
    missed_classes = [c for c in registered_classes if c.get("scheduled_at", "") < now and c.get("status") == "scheduled"]
    upcoming_classes = [c for c in registered_classes if c.get("scheduled_at", "") >= now]

    # Quiz attempts
    quiz_attempts = await db.school_quiz_attempts.find({"student_id": student_id}, {"_id": 0}).sort("attempted_at", -1).to_list(None)

    # Badge downloads (track from certificate views)
    badge_downloads = await db.school_badge_tracking.find({"student_id": student_id}, {"_id": 0}).sort("timestamp", -1).to_list(None)

    return {
        "student": student,
        "enrollments": enrollments,
        "certificates": certificates,
        "payment_plans": payment_plans,
        "registered_classes": registered_classes,
        "missed_classes": missed_classes,
        "upcoming_classes": upcoming_classes,
        "quiz_attempts": quiz_attempts,
        "badge_tracking": badge_downloads,
        "login_history": student.get("login_history", []),
        "stats": {
            "total_logins": len(student.get("login_history", [])),
            "courses_enrolled": len(enrollments),
            "courses_completed": len([e for e in enrollments if e.get("completed_at")]),
            "certificates_earned": len(certificates),
            "classes_registered": len(registered_classes),
            "classes_missed": len(missed_classes),
            "payment_plans_active": len([p for p in payment_plans if p.get("status") == "active"]),
            "badges_shared": len(badge_downloads),
        }
    }


# ==================== TRUST BADGE TRACKING ====================

@school_router.post("/certificates/{cert_id}/track-badge")
async def track_badge_usage(cert_id: str, data: dict = None, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Track when a student copies/uses a trust badge."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Student login required")

    tracking = {
        "id": str(uuid4()),
        "student_id": student["id"],
        "certificate_id": cert_id,
        "action": (data or {}).get("action", "copy"),
        "website_url": (data or {}).get("website_url", ""),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.school_badge_tracking.insert_one(tracking)
    tracking.pop("_id", None)
    return {"tracked": True}


# ==================== PAYMENT PLANS ====================

@school_router.post("/payment-plan/request")
async def request_payment_plan(data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Student requests a payment plan for a paid course. Collects PII for credit reporting."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Student login required")

    course_id = data.get("course_id", "")
    course = await db.school_courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Required PII fields for credit bureau reporting
    required = ["first_name", "last_name", "date_of_birth", "ssn", "address", "phone", "employer"]
    missing = [f for f in required if not data.get(f, "").strip()]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

    now = datetime.now(timezone.utc).isoformat()
    plan_amount = data.get("plan_amount", course.get("price", 0))
    num_payments = data.get("num_payments", 3)
    monthly = round(plan_amount / num_payments, 2) if num_payments > 0 else plan_amount

    plan = {
        "id": str(uuid4()),
        "student_id": student["id"],
        "course_id": course_id,
        "course_title": course.get("title", ""),
        "status": "active",
        "plan_amount": plan_amount,
        "num_payments": num_payments,
        "monthly_payment": monthly,
        "payments_made": 0,
        "amount_paid": 0,
        "amount_remaining": plan_amount,
        "no_credit_check": True,
        "reports_to_bureaus": True,
        "reporting_starts": "2026-08-01",
        "created_at": now,
        "updated_at": now,
    }
    await db.school_payment_plans.insert_one(plan)
    plan.pop("_id", None)

    # Create credit reporting account (school_payment_accounts)
    ssn_full = data["ssn"].strip()
    ssn_last_four = ssn_full[-4:] if len(ssn_full) >= 4 else ssn_full

    payment_account = {
        "id": str(uuid4()),
        "student_id": student["id"],
        "plan_id": plan["id"],
        "course_id": course_id,
        "course_title": course.get("title", ""),
        "account_number": f"SCH-{plan['id'][:8].upper()}",
        "first_name": data["first_name"].strip(),
        "last_name": data["last_name"].strip(),
        "date_of_birth": data["date_of_birth"].strip(),
        "ssn_last_four": ssn_last_four,
        "ssn_encrypted": ssn_full,
        "address": data["address"].strip(),
        "phone": data["phone"].strip(),
        "email": student.get("email", ""),
        "employer": data["employer"].strip(),
        "has_payment_plan": True,
        "original_amount": plan_amount,
        "current_balance": plan_amount,
        "credit_limit": plan_amount,
        "date_opened": now[:10],
        "account_status": "current",
        "account_status_code": "11",
        "payment_rating": "0",
        "payment_history_profile": "",
        "ecoa_code": "1",
        "special_comment_code": "",
        "reporting_suppressed": False,
        "created_at": now,
        "updated_at": now,
    }
    await db.school_payment_accounts.insert_one(payment_account)

    # Enroll student in the course
    enrollment = {
        "id": str(uuid4()),
        "student_id": student["id"],
        "course_id": course_id,
        "payment_plan_id": plan["id"],
        "enrolled_at": now,
        "completed_at": None,
    }
    await db.school_enrollments.insert_one(enrollment)
    await db.school_students.update_one(
        {"id": student["id"]},
        {"$addToSet": {"enrolled_courses": course_id}}
    )

    return {
        "plan": plan,
        "message": "Payment plan created! No credit check required. Your payments will be reported to credit bureaus starting August 2026. All payments made before that date will be included retroactively."
    }


@school_router.post("/payment-plan/{plan_id}/payment")
async def record_payment_plan_payment(plan_id: str, data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Record a payment on a payment plan."""
    # Allow either student or admin
    student = await get_student(token, authorization)
    admin = await get_admin_user(token, authorization)
    if not student and not admin:
        raise HTTPException(status_code=401, detail="Authentication required")

    plan = await db.school_payment_plans.find_one({"id": plan_id}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Payment plan not found")

    amount = data.get("amount", plan.get("monthly_payment", 0))
    now = datetime.now(timezone.utc).isoformat()

    payment = {
        "id": str(uuid4()),
        "plan_id": plan_id,
        "student_id": plan.get("student_id"),
        "amount": amount,
        "payment_date": now,
        "recorded_by": admin.get("email", "") if admin else "student",
        "method": data.get("method", "manual"),
    }
    await db.school_payment_records.insert_one(payment)

    new_paid = plan.get("amount_paid", 0) + amount
    new_remaining = max(0, plan.get("plan_amount", 0) - new_paid)
    new_count = plan.get("payments_made", 0) + 1
    new_status = "completed" if new_remaining <= 0 else "active"

    await db.school_payment_plans.update_one(
        {"id": plan_id},
        {"$set": {
            "amount_paid": new_paid,
            "amount_remaining": new_remaining,
            "payments_made": new_count,
            "status": new_status,
            "updated_at": now,
        }}
    )

    # Update payment account for credit reporting
    month_code = "C" if amount > 0 else "0"
    await db.school_payment_accounts.update_one(
        {"plan_id": plan_id},
        {"$set": {
            "current_balance": new_remaining,
            "account_status": "paid" if new_status == "completed" else "current",
            "account_status_code": "13" if new_status == "completed" else "11",
            "updated_at": now,
        },
        "$push": {"payment_history_raw": {"date": now, "amount": amount, "code": month_code}}
        }
    )

    # ── Log to central revenue_records for Finance Dashboard ──
    await log_revenue(
        db,
        source="digital_products",
        category="school_payment_plan",
        amount=amount,
        description=f"School Payment Plan - {plan.get('course_title', 'Course')}",
        reference_id=plan_id,
        reference_type="school_payment_plan",
        payment_status="paid",
        payment_method=data.get("method", "manual"),
        recorded_by_id=admin.get("email", "") if admin else plan.get("student_id", ""),
        recorded_by_name=admin.get("full_name", "Admin") if admin else "Student",
    )

    return {
        "payment": {k: v for k, v in payment.items() if k != "_id"},
        "plan_status": new_status,
        "amount_remaining": new_remaining,
        "message": "Payment recorded. This will be reported to credit bureaus."
    }


@school_router.get("/payment-plan/my-plans")
async def get_my_payment_plans(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get all payment plans for the current student."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Student login required")

    plans = await db.school_payment_plans.find(
        {"student_id": student["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(None)

    for plan in plans:
        payments = await db.school_payment_records.find(
            {"plan_id": plan["id"]}, {"_id": 0}
        ).sort("payment_date", -1).to_list(None)
        plan["payments"] = payments

    return {"plans": plans}


@school_router.get("/admin/payment-plans")
async def admin_list_payment_plans(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """List all payment plans (admin only)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    plans = await db.school_payment_plans.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    return {"plans": plans, "total": len(plans)}


# ==================== LIVE VIDEO CLASSES ====================

@school_router.post("/admin/live-classes")
async def admin_create_live_class(data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Create a live video class session."""
    user = await get_school_user(token, authorization)
    if not user:
        raise HTTPException(status_code=403, detail="School access required")

    title = data.get("title", "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    scheduled_at = data.get("scheduled_at", "")
    if not scheduled_at:
        raise HTTPException(status_code=400, detail="Scheduled date/time is required")

    platform = data.get("platform", "zoom")
    if platform not in ["zoom", "google_meet"]:
        raise HTTPException(status_code=400, detail="Platform must be 'zoom' or 'google_meet'")

    is_admin = user.get("role") in ["admin", "super_admin"]
    now = datetime.now(timezone.utc).isoformat()

    live_class = {
        "id": str(uuid4()),
        "title": title,
        "description": data.get("description", ""),
        "course_id": data.get("course_id", ""),
        "platform": platform,
        "meeting_link": data.get("meeting_link", ""),
        "meeting_id": data.get("meeting_id", ""),
        "meeting_passcode": data.get("meeting_passcode", ""),
        "scheduled_at": scheduled_at,
        "duration_minutes": data.get("duration_minutes", 60),
        "max_attendees": data.get("max_attendees", 100),
        "instructor_name": user.get("full_name", ""),
        "instructor_id": user.get("id", ""),
        "status": "scheduled" if is_admin else "pending_approval",
        "is_free": data.get("is_free", True),
        "price": data.get("price", 0),
        "registered_students": [],
        "created_by": user.get("id", ""),
        "created_by_role": user.get("role", ""),
        "created_at": now,
        "updated_at": now,
    }
    await db.school_live_classes.insert_one(live_class)
    live_class.pop("_id", None)

    return {"live_class": live_class, "message": f"Live class {'scheduled' if is_admin else 'submitted for approval'}"}


@school_router.get("/admin/live-classes")
async def admin_list_live_classes(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """List all live classes (admin/teacher)."""
    user = await get_school_user(token, authorization)
    if not user:
        raise HTTPException(status_code=403, detail="School access required")

    is_admin = user.get("role") in ["admin", "super_admin"]
    query = {} if is_admin else {"created_by": user.get("id", "")}
    classes = await db.school_live_classes.find(query, {"_id": 0}).sort("scheduled_at", -1).to_list(None)
    return {"live_classes": classes, "total": len(classes)}


@school_router.put("/admin/live-classes/{class_id}")
async def admin_update_live_class(class_id: str, data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Update a live class."""
    user = await get_school_user(token, authorization)
    if not user:
        raise HTTPException(status_code=403, detail="School access required")

    live_class = await db.school_live_classes.find_one({"id": class_id}, {"_id": 0})
    if not live_class:
        raise HTTPException(status_code=404, detail="Live class not found")

    is_admin = user.get("role") in ["admin", "super_admin"]
    if not is_admin and live_class.get("created_by") != user.get("id"):
        raise HTTPException(status_code=403, detail="You can only edit your own classes")

    update = {}
    for field in ["title", "description", "platform", "meeting_link", "meeting_id",
                   "meeting_passcode", "scheduled_at", "duration_minutes", "max_attendees",
                   "is_free", "price", "course_id"]:
        if field in data:
            update[field] = data[field]

    if is_admin and "status" in data:
        update["status"] = data["status"]

    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.school_live_classes.update_one({"id": class_id}, {"$set": update})

    updated = await db.school_live_classes.find_one({"id": class_id}, {"_id": 0})
    return {"live_class": updated, "message": "Live class updated"}


@school_router.delete("/admin/live-classes/{class_id}")
async def admin_delete_live_class(class_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Delete a live class (admin only)."""
    admin = await get_admin_user(token, authorization)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.school_live_classes.delete_one({"id": class_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Live class not found")
    return {"message": "Live class deleted"}


@school_router.post("/live-classes/{class_id}/register")
async def register_for_live_class(class_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Student registers for a live class."""
    student = await get_student(token, authorization)
    if not student:
        raise HTTPException(status_code=401, detail="Student login required")

    live_class = await db.school_live_classes.find_one({"id": class_id}, {"_id": 0})
    if not live_class:
        raise HTTPException(status_code=404, detail="Live class not found")

    if live_class.get("status") != "scheduled":
        raise HTTPException(status_code=400, detail="This class is not open for registration")

    registered = live_class.get("registered_students", [])
    if student["id"] in registered:
        return {"message": "Already registered"}

    if len(registered) >= live_class.get("max_attendees", 100):
        raise HTTPException(status_code=400, detail="Class is full")

    await db.school_live_classes.update_one(
        {"id": class_id},
        {"$addToSet": {"registered_students": student["id"]}}
    )
    return {"message": "Registered for live class", "meeting_link": live_class.get("meeting_link", "")}


@school_router.get("/live-classes")
async def list_upcoming_live_classes(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """List upcoming live classes for students."""
    student = await get_student(token, authorization)

    now = datetime.now(timezone.utc).isoformat()
    classes = await db.school_live_classes.find(
        {"status": "scheduled", "scheduled_at": {"$gte": now}},
        {"_id": 0, "meeting_passcode": 0}
    ).sort("scheduled_at", 1).to_list(None)

    if student:
        for c in classes:
            c["is_registered"] = student["id"] in c.get("registered_students", [])
            c["attendee_count"] = len(c.get("registered_students", []))
            c.pop("registered_students", None)
    else:
        for c in classes:
            c["attendee_count"] = len(c.get("registered_students", []))
            c.pop("registered_students", None)

    return {"live_classes": classes}