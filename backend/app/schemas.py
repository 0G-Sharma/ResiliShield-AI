from pydantic import BaseModel, Field
from typing import List, Optional

class GeminiAnalysisSchema(BaseModel):
    severity_score: int
    confidence: float
    damage_summary: str
    human_presence: bool
    fire_detection: bool
    flood_probability: float
    building_collapse: float
    landslide_risk: float
    structural_damage: str
    recommendations: List[str]
    risk_level: str

class IncidentCreate(BaseModel):
    type: str
    location: str
    latitude: float
    longitude: float
    description: str

class IncidentResponse(BaseModel):
    id: str
    type: str
    location: str
    latitude: float
    longitude: float
    severity: int
    status: str
    summary: str
    timestamp: str
    analysis: Optional[GeminiAnalysisSchema] = None

    class Config:
        from_attributes = True

class ResourceResponse(BaseModel):
    id: str
    name: str
    type: str
    latitude: float
    longitude: float
    capacity: str
    availability: str
    distance: float
    eta: str
    priority: str

    class Config:
        from_attributes = True

class AgentDispatch(BaseModel):
    agent_id: str
    action: str
    incident_id: str

class AgentResponse(BaseModel):
    status: str
    agent: str
    timestamp: str
    actions: List[str]

class SosRequest(BaseModel):
    latitude: float
    longitude: float
    details: str

class ReportRequest(BaseModel):
    incident_id: str
    format: str = "pdf"
