import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Resource

DATABASE_URL = "sqlite:///./resilishield.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pandas Simulation representing BigQuery resources tables
def init_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    # Check if resources are already loaded to prevent duplicate appending
    existing = db.query(Resource).first()
    if not existing:
        # Construct Pandas DataFrame simulating BigQuery database exports
        data = {
            "id": ["res-1", "res-2", "res-3", "res-4", "res-5", "res-6"],
            "name": [
                "General Trauma MedCenter",
                "SOMA Fire House Station 3",
                "Metro Police Sector 5 Depot",
                "St. Mary Temporary Shelter A",
                "Aerial Rescue Drone Squad B",
                "Heavy Rescue Unit Alpha"
            ],
            "type": [
                "hospital",
                "fire_station",
                "police_station",
                "shelter",
                "drone",
                "rescue_unit"
            ],
            "latitude": [37.79, 37.77, 37.74, 37.76, 37.80, 37.72],
            "longitude": [-122.42, -122.40, -122.46, -122.44, -122.47, -122.41],
            "capacity": ["82%", "90%", "Available", "45/200 beds", "4 Active", "En Route"],
            "availability": ["available", "available", "available", "available", "available", "available"],
            "distance": [1.8, 2.2, 4.1, 3.5, 5.2, 6.7],
            "eta": ["4 min", "6 min", "11 min", "9 min", "3 min", "14 min"],
            "priority": ["HIGH", "CRITICAL", "MEDIUM", "HIGH", "CRITICAL", "HIGH"]
        }
        
        df = pd.DataFrame(data)
        
        # Write to SQLite database using pandas to_sql
        df.to_sql(name="resources", con=engine, if_exists="append", index=False)
        db.commit()
    db.close()
