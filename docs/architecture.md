# ResiliShield AI - Architecture & Spec Sheet

This document maps out the system architecture, ER relational data models, sequence patterns, and GCP resource layers of the platform.

---

## 1. Cloud-Native Architecture Diagram

```mermaid
graph TD
    User([Emergency Command Team]) -->|Ingests Data| FE[Next.js App on Cloud Run]
    FE -->|Transmits Media| BE[FastAPI Engine on Cloud Run]
    
    subgraph Google Cloud Platform
        BE -->|Base64 Multimodal Payload| Vertex[Vertex AI Gemini 1.5 Flash]
        BE -->|Relational Data Query| BQ[(BigQuery Resource Pool)]
        BE -->|Triggers Directives| ADK[Agent Development Kit / Cloud Functions]
        BE -->|Saves SQLite Telemetry| DB[(Cloud SQL / Persistent Telemetry Database)]
    end

    ADK -->|Isolates Power Grid| PowerGrid[Smart Power Grid API]
    ADK -->|Broadcasting warning| CellularSystem[Civic Broadcast Cell Towers]
    ADK -->|Dispatches vehicles| RescueFleet[Emergency Dispatch Fleet API]
```

---

## 2. Telemetry Ingestion Sequence Diagram

The following chart diagrams the execution thread when a commander drops drone footage or telemetry feeds.

```mermaid
sequenceDiagram
    autonumber
    actor Commander as Tactical Operator
    participant FE as Frontend Dashboard
    participant BE as FastAPI Backend
    participant Gemini as Vertex AI Gemini
    participant BQ as BigQuery / SQLite
    participant ADK as Agent SDK Coordinator

    Commander->>FE: Ingest Satellite/Drone Feed
    FE->>BE: POST /analyze (telemetry metadata)
    BE->>Gemini: Parse segments via Gemini 1.5 Flash
    Gemini-->>BE: Return Threat Analysis (Severity, coordinates, casualties)
    BE->>BQ: Fetch nearest assets by distance
    BQ-->>BE: Return sorted ambulances, stations, shelters
    Note over BE: If Severity >= 8, initiate ADK trigger pipeline
    BE->>ADK: Fire Autonomous Operations
    par Parallel Subagents execution
        ADK->>ADK: Isolate Grid Power
        ADK->>ADK: Broadcast Cell SOS alert
        ADK->>ADK: Dispatch Medical Helicopters
    end
    ADK-->>BE: Return success metrics
    BE-->>FE: Stream WebSocket logs & render incident
    FE-->>Commander: Holographic Map Waypoint updates
```

---

## 3. Entity-Relationship (ER) Schema

```mermaid
erDiagram
    INCIDENT {
        string id PK
        string type
        string location
        float latitude
        float longitude
        int severity
        string status
        string summary
        string timestamp
    }
    RESOURCE {
        string id PK
        string name
        string type
        float latitude
        float longitude
        string capacity
        string availability
        float distance
        string eta
        string priority
    }
    AGENT_LOG {
        string id PK
        string agent_id
        string agent_name
        string action
        string status
        string timestamp
        string details
    }
    INCIDENT ||--o| AGENT_LOG : "triggers log records"
```

---

## 4. API Specification

### `POST /analyze`
*   **Request Payload**:
    ```json
    {
      "type": "fire",
      "location": "SOMA District",
      "latitude": 37.777,
      "longitude": -122.412,
      "description": "Engulfed structures with thick dark smoke."
    }
    ```
*   **Response Payload**:
    ```json
    {
      "id": "inc-32fa4c",
      "severity": 9,
      "status": "active",
      "summary": "Vertex AI assessment: Heavy smoke engulfing structural foundations.",
      "analysis": {
        "confidence": 0.95,
        "human_presence": true,
        "fire_detection": true,
        "flood_probability": 0.05,
        "risk_level": "CRITICAL"
      }
    }
    ```

### `POST /dispatch`
*   **Request Payload**:
    ```json
    {
      "agent_id": "1",
      "action": "dispatch_rescue",
      "incident_id": "inc-32fa4c"
    }
    ```
*   **Response Payload**:
    ```json
    {
      "status": "SUCCESS",
      "agent": "CrisisCoordinatorAgent",
      "timestamp": "2026-07-03 11:42:00",
      "actions": [
        "Aegis Sentinel dispatched trauma helicopters and rescue trucks."
      ]
    }
    ```
