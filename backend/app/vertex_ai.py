from typing import Dict, Any, Optional
import random

def simulate_gemini_analysis(threat_type: str, description: str) -> Dict[str, Any]:
    """
    Simulates a Google Vertex AI Gemini 1.5 Flash multimodal call.
    Parses details and produces a structured threat telemetry profile.
    """
    threat_type = threat_type.lower()
    
    # Defaults
    severity_score = 5
    confidence = round(random.uniform(0.88, 0.97), 2)
    human_presence = True
    fire_detection = False
    flood_probability = 0.05
    building_collapse = 10.0
    landslide_risk = 0.05
    structural_damage = "LOW"
    recommendations = []
    
    casualty_estimation = 2
    spread_prediction = "Steady containment index. Spread risk is currently low."
    evacuation_plan = ["Clear surrounding sidewalks.", "Direct traffic away from primary coordinate corridor."]
    triage_priority = "MEDIUM"
    
    if "fire" in threat_type or "smoke" in description.lower():
        severity_score = 9
        fire_detection = True
        building_collapse = 45.0
        structural_damage = "CRITICAL"
        recommendations = [
          "Deploy fire suppression drones and heavy structural engines.",
          "Evacuate SOMA sector 4-B immediately.",
          "Command Aegis Sentinel to establish medical coordination channels."
        ]
        casualty_estimation = random.randint(12, 28)
        spread_prediction = "Wind-driven progression active. Expected spread rate: 2.1m/s northeast vectors."
        evacuation_plan = [
            "Primary Egress: Harrison St Expressway (Northbound)",
            "Fallback Routing: Folsom St Grid Bypass",
            "Target Assembly Point: SOMA Sector 3 Disaster Shelter"
        ]
        triage_priority = "CRITICAL"
        
    elif "flood" in threat_type or "water" in description.lower() or "overflow" in description.lower():
        severity_score = 8
        flood_probability = 0.98
        building_collapse = 15.0
        structural_damage = "HIGH"
        recommendations = [
          "Establish high-volume water pump corridor.",
          "Broadcast cell warning signals to marina residents.",
          "Dispatch rescue inflatables to Marina boulevard."
        ]
        casualty_estimation = random.randint(4, 9)
        spread_prediction = "Tidal surge swell rising. Inundation expansion calculated at 0.5m depth per hour."
        evacuation_plan = [
            "Primary Egress: Marina Boulevard Bypass (Westbound)",
            "Fallback Routing: Lombard St Transit Corridor",
            "Target Assembly Point: Fort Mason Safe Zone Center"
        ]
        triage_priority = "HIGH"
        
    elif "landslide" in threat_type or "soil" in description.lower() or "slide" in description.lower():
        severity_score = 7
        landslide_risk = 0.95
        building_collapse = 65.0
        structural_damage = "HIGH"
        recommendations = [
          "Mobilize geological hazard surveillance drones.",
          "Isolate Twin Peaks secondary transport links.",
          "Deploy mudslide retaining structures."
        ]
        casualty_estimation = random.randint(3, 7)
        spread_prediction = "Hillside slope saturation high. Secondary landslide displacement risk index: 88% probability."
        evacuation_plan = [
            "Primary Egress: Twin Peaks Blvd Southbound Bypass",
            "Fallback Routing: Portola Drive Inbound Highway",
            "Target Assembly Point: Glen Park Station Emergency Shelter"
        ]
        triage_priority = "HIGH"
        
    else:
        # Default or other hazard
        severity_score = 6
        structural_damage = "MEDIUM"
        recommendations = [
          "Deploy aerial monitoring drones to establish baseline.",
          "Maintain dispatch standby queues."
        ]
        casualty_estimation = random.randint(1, 3)
        spread_prediction = "Containment index stable. Expected hazard radius localized to 50m boundaries."
        evacuation_plan = [
            "Primary Egress: Nearest arterial corridor",
            "Fallback Routing: Local grid routes"
        ]
        triage_priority = "MEDIUM"

    risk_level = "CRITICAL" if severity_score >= 8 else "HIGH" if severity_score >= 5 else "MEDIUM"
    
    damage_summary = (
        f"Vertex AI analysis identified active {threat_type} hazard coordinates. "
        f"Telemetry reports: {description} "
        f"Structural integrity categorized as {structural_damage} (Risk index: {building_collapse}% displacement potential)."
    )

    return {
        "severity_score": severity_score,
        "confidence": confidence,
        "damage_summary": damage_summary,
        "human_presence": human_presence,
        "fire_detection": fire_detection,
        "flood_probability": flood_probability,
        "building_collapse": building_collapse,
        "landslide_risk": landslide_risk,
        "structural_damage": structural_damage,
        "recommendations": recommendations,
        "risk_level": risk_level,
        "casualty_estimation": casualty_estimation,
        "spread_prediction": spread_prediction,
        "evacuation_plan": evacuation_plan,
        "triage_priority": triage_priority
    }

