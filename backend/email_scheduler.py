"""
Email Scheduler for Live Class Reminders
Schedules 24hr and 1hr reminders for registered students.
Currently logs to console (connect real email service later).
"""

import asyncio
import logging
from datetime import datetime, timezone, timedelta

logger = logging.getLogger("email_scheduler")

db = None

def set_db(database):
    global db
    db = database


async def check_and_send_reminders():
    """Check for upcoming live classes and send reminders."""
    if db is None:
        return

    now = datetime.now(timezone.utc)
    one_hour = now + timedelta(hours=1, minutes=5)
    twenty_four = now + timedelta(hours=24, minutes=5)

    # Find classes in next 24h that haven't had reminders
    classes = await db.school_live_classes.find({
        "status": "scheduled",
        "scheduled_at": {"$gte": now.isoformat(), "$lte": twenty_four.isoformat()}
    }, {"_id": 0}).to_list(None)

    for live_class in classes:
        class_time = datetime.fromisoformat(live_class["scheduled_at"].replace("Z", "+00:00")) if "T" in live_class.get("scheduled_at", "") else None
        if not class_time:
            continue

        hours_until = (class_time - now).total_seconds() / 3600
        reminder_type = None

        # 24hr reminder (between 23-25 hours)
        if 23 <= hours_until <= 25 and not live_class.get("reminder_24h_sent"):
            reminder_type = "24h"
        # 1hr reminder (between 0.5-1.5 hours)
        elif 0.5 <= hours_until <= 1.5 and not live_class.get("reminder_1h_sent"):
            reminder_type = "1h"

        if reminder_type:
            await _send_class_reminders(live_class, reminder_type)
            await db.school_live_classes.update_one(
                {"id": live_class["id"]},
                {"$set": {f"reminder_{reminder_type}_sent": True}}
            )


async def _send_class_reminders(live_class, reminder_type):
    """Send reminder notifications to all registered students."""
    student_ids = live_class.get("registered_students", [])
    if not student_ids:
        return

    platform_label = "Zoom" if live_class.get("platform") == "zoom" else "Google Meet"
    time_label = "in 24 hours" if reminder_type == "24h" else "in 1 hour"
    now = datetime.now(timezone.utc).isoformat()

    for sid in student_ids:
        student = await db.school_students.find_one({"id": sid}, {"_id": 0, "email": 1, "full_name": 1})
        if not student:
            continue

        notification = {
            "id": f"reminder-{live_class['id']}-{sid}-{reminder_type}",
            "student_id": sid,
            "class_id": live_class["id"],
            "type": f"class_reminder_{reminder_type}",
            "subject": f"Reminder: {live_class['title']} starts {time_label}",
            "body": f"Hi {student.get('full_name', 'Student')}, your live class '{live_class['title']}' on {platform_label} starts {time_label}. Join here: {live_class.get('meeting_link', 'Link TBD')}",
            "email": student.get("email", ""),
            "meeting_link": live_class.get("meeting_link", ""),
            "status": "sent",
            "sent_at": now,
            "created_at": now,
        }

        # Store notification
        await db.school_notifications.update_one(
            {"id": notification["id"]},
            {"$set": notification},
            upsert=True
        )

        # Log (replace with real email service)
        logger.info(
            f"EMAIL REMINDER [{reminder_type}]: To {student.get('email')} - "
            f"'{live_class['title']}' starts {time_label} - "
            f"Link: {live_class.get('meeting_link', 'N/A')}"
        )


async def start_scheduler():
    """Background task that checks for reminders every 5 minutes."""
    logger.info("Email scheduler started - checking reminders every 5 minutes")
    while True:
        try:
            await check_and_send_reminders()
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
        await asyncio.sleep(300)  # Check every 5 minutes
