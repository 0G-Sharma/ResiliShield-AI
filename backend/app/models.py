from sqlalchemy import Column, String, Float, Integer, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(Integer, nullable=False)
    status = Column(String, default="active") # active, resolving, mitigated
    summary = Column(Text, nullable=True)
    timestamp = Column(String, default=lambda: datetime.datetime.now().strftime("%I:%M:%S %p"))

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # hospital, fire_station, police_station, shelter, drone, rescue_unit
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(String, nullable=True)
    availability = Column(String, default="available") # available, dispatched, offline
    distance = Column(Float, default=0.0)
    eta = Column(String, nullable=True)
    priority = Column(String, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW

class AgentLog(Base):
    __tablename__ = "agent_logs"
    
    id = Column(String, primary_key=True, index=True)
    agent_id = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    status = Column(String, nullable=False) # idle, executing, completed, offline
    timestamp = Column(String, default=lambda: datetime.datetime.now().strftime("%I:%M:%S %p"))
    details = Column(Text, nullable=True)
