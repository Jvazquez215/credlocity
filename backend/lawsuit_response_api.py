"""
Lawsuit Response & Pro Se Center API
Handles consumer lawsuit response cases and pro se filing document generation.
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Header
from motor.motor_asyncio import AsyncIOMotorClient
from auth import decode_token

lawsuit_response_router = APIRouter(prefix="/lawsuit-response", tags=["Lawsuit Response"])

mongo_url = os.environ['MONGO_URL']
db_name = os.environ.get('DB_NAME', 'credlocity')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Common and uncommon reasons for dismissal
DISMISSAL_REASONS = [
    {"id": "lack_personal_jurisdiction", "label": "Lack of Personal Jurisdiction", "category": "common", "description": "Court lacks jurisdiction over the defendant's person."},
    {"id": "lack_subject_matter_jurisdiction", "label": "Lack of Subject Matter Jurisdiction", "category": "common", "description": "Court lacks authority to hear this type of case."},
    {"id": "improper_venue", "label": "Improper Venue", "category": "common", "description": "Case was filed in the wrong court or geographic location."},
    {"id": "insufficient_service_of_process", "label": "Insufficient Service of Process", "category": "common", "description": "Defendant was not properly served with the lawsuit."},
    {"id": "failure_to_state_a_claim", "label": "Failure to State a Claim", "category": "common", "description": "Complaint fails to allege facts sufficient to state a legal claim (FRCP 12(b)(6))."},
    {"id": "statute_of_limitations", "label": "Statute of Limitations Expired", "category": "common", "description": "The time period to file the lawsuit has passed."},
    {"id": "standing", "label": "Lack of Standing", "category": "common", "description": "Plaintiff does not have sufficient stake or legal right to bring the claim."},
    {"id": "failure_to_join_necessary_party", "label": "Failure to Join a Necessary Party", "category": "common", "description": "A required party was not included in the lawsuit (FRCP 12(b)(7))."},
    {"id": "res_judicata", "label": "Res Judicata (Claim Preclusion)", "category": "common", "description": "The same claim was already decided in a prior lawsuit."},
    {"id": "collateral_estoppel", "label": "Collateral Estoppel (Issue Preclusion)", "category": "common", "description": "A specific issue was already decided in a prior case."},
    {"id": "failure_to_prosecute", "label": "Failure to Prosecute", "category": "common", "description": "Plaintiff has failed to take necessary steps to move the case forward."},
    {"id": "voluntary_dismissal", "label": "Voluntary Dismissal by Plaintiff", "category": "common", "description": "Plaintiff voluntarily requests dismissal of the case."},
    {"id": "arbitration_clause", "label": "Mandatory Arbitration Clause", "category": "common", "description": "Contract requires disputes to be resolved through arbitration, not court."},
    {"id": "lack_of_evidence", "label": "Lack of Sufficient Evidence", "category": "common", "description": "Plaintiff cannot produce enough evidence to support their claims."},
    {"id": "improper_plaintiff", "label": "Improper Plaintiff / Real Party in Interest", "category": "uncommon", "description": "The person filing is not the proper party to bring the claim."},
    {"id": "sovereign_immunity", "label": "Sovereign Immunity", "category": "uncommon", "description": "Government entity is immune from being sued without consent."},
    {"id": "diplomatic_immunity", "label": "Diplomatic Immunity", "category": "uncommon", "description": "Foreign diplomat is immune from civil litigation."},
    {"id": "forum_non_conveniens", "label": "Forum Non Conveniens", "category": "uncommon", "description": "Another court is more appropriate for the case."},
    {"id": "abstention_doctrine", "label": "Abstention Doctrine", "category": "uncommon", "description": "Federal court declines jurisdiction in favor of state court."},
    {"id": "mootness", "label": "Mootness", "category": "uncommon", "description": "The controversy no longer exists or has been resolved."},
    {"id": "ripeness", "label": "Lack of Ripeness", "category": "uncommon", "description": "The dispute is not yet ready for judicial resolution."},
    {"id": "laches", "label": "Laches (Unreasonable Delay)", "category": "uncommon", "description": "Plaintiff unreasonably delayed filing, causing prejudice to defendant."},
    {"id": "accord_satisfaction", "label": "Accord and Satisfaction", "category": "uncommon", "description": "The parties already settled the dispute."},
    {"id": "discharge_bankruptcy", "label": "Discharge in Bankruptcy", "category": "uncommon", "description": "Debt was discharged through bankruptcy proceedings."},
    {"id": "duress", "label": "Duress / Unconscionability", "category": "uncommon", "description": "Agreement was entered into under duress or is unconscionable."},
    {"id": "illegality", "label": "Illegality of Contract", "category": "uncommon", "description": "The underlying contract is illegal and unenforceable."},
    {"id": "fdcpa_violation_by_plaintiff", "label": "FDCPA Violation by Plaintiff (Debt Collector)", "category": "uncommon", "description": "Debt collector violated the Fair Debt Collection Practices Act in bringing the suit."},
    {"id": "robo_signing", "label": "Robo-Signing / Lack of Authentication", "category": "uncommon", "description": "Documents supporting the claim were not properly authenticated."},
    {"id": "broken_chain_of_title", "label": "Broken Chain of Title / Assignment", "category": "uncommon", "description": "Plaintiff cannot prove valid ownership/assignment of the debt."},
    {"id": "failure_to_mitigate", "label": "Failure to Mitigate Damages", "category": "uncommon", "description": "Plaintiff failed to take reasonable steps to reduce damages."},
    {"id": "unclean_hands", "label": "Unclean Hands Doctrine", "category": "uncommon", "description": "Plaintiff engaged in inequitable conduct related to the matter."},
]

VIOLATION_TYPES = [
    {"id": "fcra", "label": "FCRA (Fair Credit Reporting Act)", "statutes": ["15 U.S.C. § 1681 et seq."]},
    {"id": "fdcpa", "label": "FDCPA (Fair Debt Collection Practices Act)", "statutes": ["15 U.S.C. § 1692 et seq."]},
    {"id": "croa", "label": "CROA (Credit Repair Organizations Act)", "statutes": ["15 U.S.C. § 1679 et seq."]},
    {"id": "ucc", "label": "UCC (Uniform Commercial Code)", "statutes": ["UCC Articles 3, 9"]},
    {"id": "tila", "label": "TILA (Truth in Lending Act)", "statutes": ["15 U.S.C. § 1601 et seq."]},
    {"id": "tcpa", "label": "TCPA (Telephone Consumer Protection Act)", "statutes": ["47 U.S.C. § 227"]},
    {"id": "state_consumer_protection", "label": "State Consumer Protection Laws", "statutes": ["Varies by state"]},
    {"id": "state_udap", "label": "State UDAP (Unfair/Deceptive Acts)", "statutes": ["Varies by state"]},
]

CASE_STATUSES = [
    "New", "Under Review", "Answer Drafted", "Answer Filed",
    "Motion to Dismiss Filed", "Discovery Phase", "Mediation/Settlement",
    "Trial Pending", "Dismissed", "Settled", "Judgment Entered", "Appeal Filed", "Closed"
]

COURT_TYPES = ["State Court", "Federal Court", "Small Claims Court", "Bankruptcy Court"]


async def _get_user(authorization: Optional[str]):
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        return None
    return await db.users.find_one({"email": payload.get("sub")}, {"_id": 0})


# ==================== REFERENCE DATA ====================

@lawsuit_response_router.get("/dismissal-reasons")
async def get_dismissal_reasons():
    return {"reasons": DISMISSAL_REASONS}


@lawsuit_response_router.get("/violation-types")
async def get_violation_types():
    return {"types": VIOLATION_TYPES}


@lawsuit_response_router.get("/case-statuses")
async def get_case_statuses():
    return {"statuses": CASE_STATUSES}


@lawsuit_response_router.get("/court-types")
async def get_court_types():
    return {"types": COURT_TYPES}


# ==================== LAWSUIT RESPONSE CASES ====================

@lawsuit_response_router.get("/cases")
async def list_cases(authorization: Optional[str] = Header(None), status: Optional[str] = None):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    query = {}
    if status:
        query["status"] = status
    cases = await db.lawsuit_response_cases.find(query, {"_id": 0}).sort("created_at", -1).to_list(None)
    return {"cases": cases, "total": len(cases)}


@lawsuit_response_router.get("/cases/{case_id}")
async def get_case(case_id: str, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    case = await db.lawsuit_response_cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@lawsuit_response_router.post("/cases")
async def create_case(data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    case = {
        "id": str(uuid.uuid4()),
        "defendant_name": data.get("defendant_name", ""),
        "plaintiff_name": data.get("plaintiff_name", ""),
        "case_number": data.get("case_number", ""),
        "court_type": data.get("court_type", "State Court"),
        "court_name": data.get("court_name", ""),
        "state": data.get("state", ""),
        "county": data.get("county", ""),
        "date_filed": data.get("date_filed", ""),
        "date_served": data.get("date_served", ""),
        "answer_due_date": data.get("answer_due_date", ""),
        "dismissal_reasons": data.get("dismissal_reasons", []),
        "status": data.get("status", "New"),
        "notes": data.get("notes", []),
        "filings": data.get("filings", []),
        "plaintiff_attorney": data.get("plaintiff_attorney", ""),
        "plaintiff_attorney_address": data.get("plaintiff_attorney_address", ""),
        "claim_amount": data.get("claim_amount", ""),
        "account_number": data.get("account_number", ""),
        "original_creditor": data.get("original_creditor", ""),
        "created_by": user.get("email", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    # Insert without explicitly setting _id - let MongoDB auto-generate it
    result = await db.lawsuit_response_cases.insert_one(case.copy())
    return case


@lawsuit_response_router.put("/cases/{case_id}")
async def update_case(case_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    existing = await db.lawsuit_response_cases.find_one({"id": case_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Case not found")

    update = {k: v for k, v in data.items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    update["updated_by"] = user.get("email", "")

    await db.lawsuit_response_cases.update_one({"id": case_id}, {"$set": update})
    updated = await db.lawsuit_response_cases.find_one({"id": case_id}, {"_id": 0})
    return updated


@lawsuit_response_router.delete("/cases/{case_id}")
async def delete_case(case_id: str, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    result = await db.lawsuit_response_cases.delete_one({"id": case_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"deleted": True}


# ==================== CASE NOTES ====================

@lawsuit_response_router.post("/cases/{case_id}/notes")
async def add_note(case_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    note = {
        "id": str(uuid.uuid4()),
        "content": data.get("content", ""),
        "author": user.get("full_name", user.get("email", "")),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.lawsuit_response_cases.update_one(
        {"id": case_id},
        {"$push": {"notes": note}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return note


@lawsuit_response_router.delete("/cases/{case_id}/notes/{note_id}")
async def delete_note(case_id: str, note_id: str, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    await db.lawsuit_response_cases.update_one(
        {"id": case_id},
        {"$pull": {"notes": {"id": note_id}}}
    )
    return {"deleted": True}


# ==================== CASE FILINGS ====================

@lawsuit_response_router.post("/cases/{case_id}/filings")
async def add_filing(case_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    filing = {
        "id": str(uuid.uuid4()),
        "title": data.get("title", ""),
        "filing_type": data.get("filing_type", ""),
        "date_filed": data.get("date_filed", ""),
        "description": data.get("description", ""),
        "filed_by": user.get("full_name", user.get("email", "")),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.lawsuit_response_cases.update_one(
        {"id": case_id},
        {"$push": {"filings": filing}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return filing


# ==================== PRO SE CENTER ====================

@lawsuit_response_router.get("/prose-cases")
async def list_prose_cases(authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    cases = await db.prose_cases.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    return {"cases": cases, "total": len(cases)}


@lawsuit_response_router.get("/prose-cases/{case_id}")
async def get_prose_case(case_id: str, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    case = await db.prose_cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@lawsuit_response_router.post("/prose-cases")
async def create_prose_case(data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    case = {
        "id": str(uuid.uuid4()),
        # Client info
        "client_name": data.get("client_name", ""),
        "client_address": data.get("client_address", ""),
        "client_city": data.get("client_city", ""),
        "client_state": data.get("client_state", ""),
        "client_zip": data.get("client_zip", ""),
        "client_phone": data.get("client_phone", ""),
        "client_email": data.get("client_email", ""),
        # Defendant (who they're suing)
        "defendant_name": data.get("defendant_name", ""),
        "defendant_address": data.get("defendant_address", ""),
        "defendant_type": data.get("defendant_type", ""),  # credit bureau, debt collector, creditor
        # Case details
        "violation_types": data.get("violation_types", []),
        "court_type": data.get("court_type", "Federal Court"),
        "court_district": data.get("court_district", ""),
        "filing_state": data.get("filing_state", ""),
        "claim_description": data.get("claim_description", ""),
        "damages_sought": data.get("damages_sought", ""),
        "statutory_damages": data.get("statutory_damages", True),
        "actual_damages": data.get("actual_damages", ""),
        "relief_requested": data.get("relief_requested", []),
        # Incident details
        "dispute_dates": data.get("dispute_dates", []),
        "credit_bureaus_involved": data.get("credit_bureaus_involved", []),
        "account_numbers": data.get("account_numbers", []),
        "harm_description": data.get("harm_description", ""),
        # Status
        "status": data.get("status", "Draft"),
        "notes": data.get("notes", []),
        "generated_documents": [],
        "created_by": user.get("email", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    # Insert without explicitly setting _id - let MongoDB auto-generate it
    result = await db.prose_cases.insert_one(case.copy())
    return case


@lawsuit_response_router.put("/prose-cases/{case_id}")
async def update_prose_case(case_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    existing = await db.prose_cases.find_one({"id": case_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Case not found")

    update = {k: v for k, v in data.items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.prose_cases.update_one({"id": case_id}, {"$set": update})
    updated = await db.prose_cases.find_one({"id": case_id}, {"_id": 0})
    return updated


@lawsuit_response_router.delete("/prose-cases/{case_id}")
async def delete_prose_case(case_id: str, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    result = await db.prose_cases.delete_one({"id": case_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"deleted": True}
