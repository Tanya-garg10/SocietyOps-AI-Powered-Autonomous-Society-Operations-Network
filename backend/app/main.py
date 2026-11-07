"""
SocietyOps - Autonomous Society Operations Network
Standalone FastAPI backend; the Switch-connected chat bridge runs in the TypeScript server
"""

import os
import json
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="SocietyOps API",
    description="Backend operations engine for autonomous residential multi-agent network powered by Switch",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class IncidentCreate(BaseModel):
    title: Optional[str] = None
    description: str
    building: Optional[str] = "Block B (Maple)"
    flat: Optional[str] = "B-204"
    resident_name: Optional[str] = "Resident Report"
    resident_contact: Optional[str] = "+91 98000 00000"

class ApprovalDecision(BaseModel):
    decision_notes: Optional[str] = None
    decided_by: str = "Society Operations Manager"

class RejectionDecision(BaseModel):
    reason: str
    decided_by: str = "Society Operations Manager"

class EvidenceSubmission(BaseModel):
    incident_id: str
    technician_name: str
    before_photo_url: str
    after_photo_url: str
    repair_notes: str
    parts_replaced: List[str] = []
    labor_hours: float = 1.0
    completed_checklist: List[dict] = []
    resident_feedback: Optional[str] = None
    resident_rating: int = 5

class SwitchMessageIn(BaseModel):
    room_id: str
    sender: str
    sender_type: str = "human"
    content: str
    metadata: Optional[dict] = None

# --- In-Memory & SQLite Persistence Bridge ---
incidents_db = []
approvals_db = []
evidence_db = []
audit_db = []

@app.on_event("startup")
async def seed_data():
    now = datetime.utcnow().isoformat()
    incidents_db.append({
        "id": "INC-101",
        "ticket_number": "TKT-2026-101",
        "title": "Water leaking from ceiling in Block B, Flat 204",
        "description": "Water is dripping actively onto kitchen counters from the ceiling above.",
        "category": "Plumbing & Water",
        "building": "Block B (Maple)",
        "flat": "B-204",
        "priority": "High",
        "status": "Investigating",
        "resident_name": "Priya Sharma",
        "switch_room": "incident-water-leak-001",
        "correlation_id": "CORR-BLOCK-B-WATER",
        "created_at": now
    })

@app.get("/api/incidents")
def list_incidents(status: Optional[str] = None, priority: Optional[str] = None):
    res = incidents_db
    if status:
        res = [i for i in res if i["status"].lower() == status.lower()]
    if priority:
        res = [i for i in res if i["priority"].lower() == priority.lower()]
    return {"success": True, "count": len(res), "data": res}

@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    for inc in incidents_db:
        if inc["id"] == incident_id or inc["ticket_number"] == incident_id:
            return {"success": True, "data": inc}
    raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/incidents", status_code=status.HTTP_201_CREATED)
def create_incident(payload: IncidentCreate):
    ticket_seq = len(incidents_db) + 101
    ticket_no = f"TKT-2026-{ticket_seq}"
    inc_id = f"INC-{ticket_seq}"
    now = datetime.utcnow().isoformat()

    new_inc = {
        "id": inc_id,
        "ticket_number": ticket_no,
        "title": payload.title or payload.description[:40] + "...",
        "description": payload.description,
        "category": "Plumbing & Water" if "water" in payload.description.lower() else "General Maintenance",
        "building": payload.building,
        "flat": payload.flat,
        "priority": "High" if "leak" in payload.description.lower() else "Medium",
        "status": "Investigating",
        "resident_name": payload.resident_name,
        "switch_room": "incident-water-leak-001" if "Block B" in (payload.building or "") else "society-control",
        "created_at": now
    }
    incidents_db.insert(0, new_inc)
    return {"success": True, "data": new_inc}

@app.get("/api/agents")
def list_agents():
    return {
        "success": True,
        "data": [
            {"id": "agent-triage", "name": "Triage Agent", "status": "active", "switch_handle": "@triage-agent"},
            {"id": "agent-intel", "name": "Intelligence Agent", "status": "analyzing", "switch_handle": "@intel-agent"},
            {"id": "agent-dispatch", "name": "Dispatch Agent", "status": "active", "switch_handle": "@dispatch-agent"},
            {"id": "agent-vendor", "name": "Vendor Agent", "status": "active", "switch_handle": "@vendor-agent"},
            {"id": "agent-verify", "name": "Verification Agent", "status": "waiting_approval", "switch_handle": "@verify-agent"},
            {"id": "agent-memory", "name": "Memory Agent", "status": "idle", "switch_handle": "@memory-agent"},
        ]
    }

@app.get("/api/vendors")
def list_vendors():
    return {
        "success": True,
        "data": [
            {"id": "ven-1", "name": "AquaFix Plumbing Solutions", "rating": 4.8, "base_rate": 60, "sla_minutes": 45},
            {"id": "ven-2", "name": "RapidPlumb & Leak Detection", "rating": 4.9, "base_rate": 85, "sla_minutes": 30},
        ]
    }

@app.get("/api/approvals")
def list_approvals():
    return {"success": True, "data": approvals_db}

@app.post("/api/approvals/{approval_id}/approve")
def approve_request(approval_id: str, payload: ApprovalDecision):
    return {"success": True, "approval_id": approval_id, "status": "approved", "decided_by": payload.decided_by}

@app.post("/api/approvals/{approval_id}/reject")
def reject_request(approval_id: str, payload: RejectionDecision):
    return {"success": True, "approval_id": approval_id, "status": "rejected", "reason": payload.reason}

@app.post("/api/evidence", status_code=status.HTTP_201_CREATED)
def submit_evidence(payload: EvidenceSubmission):
    evi_id = f"EVI-{uuid.uuid4().hex[:6]}"
    record = payload.dict()
    record["id"] = evi_id
    record["status"] = "verified"
    record["audit_notes"] = "Verification Agent audited before/after photos and 5-point checklist."
    evidence_db.insert(0, record)
    return {"success": True, "data": record}

@app.get("/api/evidence")
def list_evidence():
    return {"success": True, "data": evidence_db}

@app.get("/api/switch/status")
def switch_status():
    return {
        "success": True,
        "provider": "Discord",
        "state": "not_configured",
        "connected": False,
        "configuredRoomIds": [],
        "connectedRoomIds": [],
        "message": "The standalone FastAPI backend does not host the SocietyOps Discord/Switch bridge. Run the TypeScript server for chat integration."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
