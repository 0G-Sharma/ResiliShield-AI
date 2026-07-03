import os
import uuid
import datetime
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from .database import get_db, init_db, engine
from .models import Incident, Resource, AgentLog
from .schemas import (
    IncidentCreate, IncidentResponse, ResourceResponse,
    AgentDispatch, AgentResponse, SosRequest, ReportRequest
)
from .vertex_ai import simulate_gemini_analysis
from .agents import AgentDevelopmentKit

app = FastAPI(title="ResiliShield AI Engine", version="1.0.0")

# Enable Cross-Origin Resource Sharing (CORS) for local Next.js client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Real-time WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Respond to client pings
            await websocket.send_json({"type": "PONG", "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.on_event("startup")
def startup_event():
    # Scaffold tables and pre-populate mock BigQuery records
    init_db()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "services": {
            "sqlite": "online",
            "gemini_emulator": "online",
            "bigquery_simulator": "online"
        }
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Ingests satellite, video, audio, or PDF file feeds.
    Saves file details and logs telemetry stream.
    """
    file_id = str(uuid.uuid4())
    # Ensure temporary folder exists inside workspace for upload tracking
    os.makedirs("./temp_uploads", exist_ok=True)
    file_path = f"./temp_uploads/{file_id}_{file.filename}"
    
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File save error: {str(e)}"
        )
        
    await manager.broadcast({
        "type": "NEW_LOG",
        "payload": {
            "sender": "System",
            "message": f"Media feed uploaded: [ {file.filename} ] via ingestion scanner."
        }
    })

    return {
        "file_id": file_id,
        "filename": file.filename,
        "size_bytes": len(content),
        "status": "INGESTED",
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/analyze", response_model=IncidentResponse)
async def analyze_threat(payload: IncidentCreate, db: Session = Depends(get_db)):
    """
    Ingests coordinates, queries Vertex AI (Gemini 1.5 Flash mockup),
    stores incident details in SQLite, and invokes Autonomous Agent response.
    """
    incident_id = "inc-" + str(uuid.uuid4())[:8]
    
    # Run simulated Gemini multimodal analysis
    analysis_data = simulate_gemini_analysis(payload.type, payload.description)
    
    # Save the incident record
    new_incident = Incident(
        id=incident_id,
        type=payload.type,
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
        severity=analysis_data["severity_score"],
        summary=analysis_data["damage_summary"],
        status="active"
    )
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    
    # Build full schema response containing analysis parameters
    response = IncidentResponse(
        id=new_incident.id,
        type=new_incident.type,
        location=new_incident.location,
        latitude=new_incident.latitude,
        longitude=new_incident.longitude,
        severity=new_incident.severity,
        status=new_incident.status,
        summary=new_incident.summary,
        timestamp=new_incident.timestamp,
        analysis=analysis_data
    )
    
    # Broadcast the new incident real-time to all dashboard sessions
    await manager.broadcast({
        "type": "NEW_INCIDENT",
        "payload": response.dict()
    })
    
    return response

@app.get("/resources", response_model=List[ResourceResponse])
def get_resources(lat: Optional[float] = None, lng: Optional[float] = None, db: Session = Depends(get_db)):
    """
    Queries BigQuery resource tables (using sqlite + pandas loader).
    Optionally computes proximity if query coords are present.
    """
    resources = db.query(Resource).all()
    
    # If coordinate telemetry is provided, dynamically update distance relative to target
    if lat is not None and lng is not None:
        for res in resources:
            # Quick Manhattan/Euclidean distance simulation (111 km per degree lat)
            dy = (res.latitude - lat) * 111.0
            dx = (res.longitude - lng) * 88.0
            dist = round((dy**2 + dx**2)**0.5, 1)
            res.distance = dist
            # Estimate ETA (1.5 minutes per km response time + dispatch buffer)
            res.eta = f"{int(dist * 1.5) + 2} min"
            
    return resources

@app.post("/dispatch", response_model=AgentResponse)
async def execute_agent_dispatch(payload: AgentDispatch, db: Session = Depends(get_db)):
    """
    Coordinates and executes autonomous crisis response actions.
    Updates logs and modifies resource states.
    """
    # 1. Fetch incident detail to retrieve severity
    incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    severity = incident.severity if incident else 8 # default to high if manual
    location = incident.location if incident else "Target Coordinates"
    
    # 2. Run Autonomous Agent Developer Kit logic
    agent_result = AgentDevelopmentKit.execute_critical_response(
        severity=severity,
        incident_id=payload.incident_id,
        location=location
    )
    
    # 3. Log actions to AgentLog table
    for act in agent_result["actions"]:
        log_id = "log-" + str(uuid.uuid4())[:8]
        new_log = AgentLog(
            id=log_id,
            agent_id=payload.agent_id,
            agent_name=agent_result["agent"],
            action=payload.action,
            status="completed",
            details=act
        )
        db.add(new_log)
        
        await manager.broadcast({
            "type": "NEW_LOG",
            "payload": {
                "sender": "Agent",
                "message": f"[{agent_result['agent']}] Executed: {act}"
            }
        })
        
    # 4. If dispatch rescue was called, set nearby resources availability to dispatched
    if payload.action == "dispatch_rescue":
        nearby_resources = db.query(Resource).filter(Resource.availability == "available").all()
        for r in nearby_resources:
            r.availability = "dispatched"
            await manager.broadcast({
                "type": "RESOURCE_UPDATE",
                "payload": {
                    "id": r.id,
                    "name": r.name,
                    "status": "dispatched"
                }
            })
            
    db.commit()
    
    return AgentResponse(
        status="SUCCESS",
        agent=agent_result["agent"],
        timestamp=agent_result["timestamp"],
        actions=agent_result["actions"]
    )

@app.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Compiles operational telemetry metrics for dashboard visualization.
    """
    incidents = db.query(Incident).order_by(Incident.timestamp.desc()).all()
    resources = db.query(Resource).all()
    logs = db.query(AgentLog).order_by(AgentLog.timestamp.desc()).limit(15).all()
    
    active_incidents = len([i for i in incidents if i.status == "active"])
    dispatched_resources = len([r for r in resources if r.availability == "dispatched"])
    
    return {
        "incidents": incidents,
        "resources": resources,
        "metrics": {
            "total_incidents": len(incidents),
            "active_incidents": active_incidents,
            "total_resources": len(resources),
            "dispatched_resources": dispatched_resources,
            "system_health": "100%"
        },
        "agent_logs": [
            {
                "timestamp": l.timestamp,
                "agent": l.agent_name,
                "action": l.action,
                "details": l.details
            } for l in logs
        ]
    }

@app.get("/incidents", response_model=List[IncidentResponse])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.timestamp.desc()).all()

@app.post("/sos")
async def trigger_manual_sos(payload: SosRequest, db: Session = Depends(get_db)):
    """
    Direct physical override SOS trigger.
    Sends broadcast alerts to Aegis Sentinel queues.
    """
    incident_id = "sos-" + str(uuid.uuid4())[:8]
    new_incident = Incident(
        id=incident_id,
        type="emergency",
        location=f"SOS Coords: {payload.latitude}, {payload.longitude}",
        latitude=payload.latitude,
        longitude=payload.longitude,
        severity=10,
        summary=f"COMMANDER MANUAL SOS OVERRIDE: {payload.details}",
        status="active"
    )
    db.add(new_incident)
    
    # Fire Agent direct dispatch
    agent_result = AgentDevelopmentKit.execute_critical_response(
        severity=10,
        incident_id=incident_id,
        location="SOS Grid"
    )
    
    for act in agent_result["actions"]:
        new_log = AgentLog(
            id="log-" + str(uuid.uuid4())[:8],
            agent_id="agent-sos",
            agent_name="SOSCoordinatorAgent",
            action="sos_override",
            status="completed",
            details=act
        )
        db.add(new_log)
        
        await manager.broadcast({
            "type": "NEW_LOG",
            "payload": {
                "sender": "SUCCESS",
                "message": f"[SOS Override] Action triggered: {act}"
            }
        })
        
    db.commit()
    
    await manager.broadcast({
        "type": "NEW_INCIDENT",
        "payload": {
            "id": incident_id,
            "type": "emergency",
            "location": f"SOS Coords: {payload.latitude}, {payload.longitude}",
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "severity": 10,
            "status": "active",
            "summary": f"COMMANDER MANUAL SOS OVERRIDE: {payload.details}",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    })
    
    return {
        "status": "SOS_BROADCAST_ACTIVE",
        "incident_id": incident_id,
        "actions_triggered": agent_result["actions"]
    }

@app.post("/report")
def generate_incident_report(payload: ReportRequest, db: Session = Depends(get_db)):
    """
    Simulates incident briefing report compilation.
    Exports database summaries and saves logs.
    """
    incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    report_id = "rep-" + str(uuid.uuid4())[:8]
    return {
        "report_id": report_id,
        "incident_id": payload.incident_id,
        "compile_status": "READY_FOR_DOWNLOAD",
        "download_url": f"https://resilishield-ai.onrender.com/reports/{report_id}.{payload.format}",
        "timestamp": datetime.datetime.now().isoformat()
    }

