# Hackathon Pitch & Demo Playbook

This document outlines the presentation slide structure, script, and step-by-step demo instructions for presenting ResiliShield AI.

---

## 1. Hackathon Pitch Structure

### Slide 1: The Hook (Problem)
*   **Title**: Seconds Cost Lives
*   **Description**: In disaster mitigation, delays in parsing satellite logs, identifying trapping coordinates, and dispatching vehicles are lethal. Conventional emergency response relies on human routing lines, causing dispatch delays of 10–25 minutes.

### Slide 2: The Solution (ResiliShield AI)
*   **Title**: ResiliShield AI — The Autonomous Coordinator
*   **Description**: A premium, state-of-the-art emergency command hub that integrates Google Vertex AI Gemini models to scan satellite and drone feeds in real-time, queries BigQuery resource databases to compute proximity metrics, and executes automated subagents to isolate grids, push cell alert waves, and route fleets in 2 seconds.

### Slide 3: Core Capabilities
*   **Tactical Map HUD**: Apple Vision Pro-styled glassmorphic vector overview mapping hospital beds, shelter occupancy, warning zones, and real-time drone corridors.
*   **Multimodal Gemini Engine**: Simulates Gemini 1.5 Flash parsing image/video formats, predicting collapse risk indices, and identifying thermal human presence.
*   **Autonomous Agent SDK**: Triggers emergency safety tasks autonomously when severity scores >= 8.

---

## 2. Interactive Demo Walkthrough Script

### Step 1: Initialize Dashboard
1. Spin up the application locally: `docker-compose up --build` or launch separate instances.
2. Open the Landing Page at `http://localhost:3000`. Show the custom spinning `CanvasGlobe` grid, representing global telemetry systems.
3. Click "Initialize HUD Console" to open the command deck at `/dashboard`.

### Step 2: Intake File Telemetry
1. Point to the "Live Incident Intake" widget.
2. Under "Simulate Disaster Feed," click **SOMA Structural Fire**.
3. Point out the glowing neon green laser sweep scanning the file and the progress bar counting up.
4. Review the "Command Telemetry Stream" terminal. Live logs stream:
   - `[SYS] Ingesting drone_feed_09a.mp4...`
   - `[GEM] Querying Gemini-1.5-Flash via Google Vertex AI...`
   - `[SYS] Ingest complete. Severity: 9/10.`

### Step 3: View Map Waypoints & Proximity Rankings
1. Show the Holographic Map. A waypoint representing the SOMA Fire appears with circular threat waves pulsing in crimson.
2. Under "Resource Allocator," highlight that assets are now ranked relative to the active target. Note the top resource: **SOMA Fire House Station 3 (Distance: 2.2 km, ETA: 6 min)**.
3. Click the "Dispatch" override button. Show that its status updates to **EN ROUTE**.

### Step 4: Inspect Autonomous Agent Pipeline
1. Click the **Workspace** tab. Highlight the draggable widgets in the sandbox workspace.
2. Focus on the "Agent Control Center" on the right. Note that **Volt Guard** (Infrastructure Isolator) and **Civic Alert** (SMS Broadcaster) have automatically changed state from *idle* to *completed*.
3. Read the agent logs:
   - `Volt Guard successfully isolated the power grid for SOMA District.`
   - `Civic Alert broadcasted warning alerts to cellular devices.`
   
### Step 5: Speak with the AI Assistant
1. Click the floating microphone button in the bottom right corner.
2. Type or select the preset command: `Query medical beds available near SOMA`.
3. The chatbot replies: `Retrieved medical facility capacities from BigQuery: General Trauma MedCenter is at 82% capacity.`

---

## 3. Anticipated Judges Q&A

**Q1: How does the system simulate BigQuery and Vertex AI without live API accounts?**
*   *Answer*: We build a full pandas-simulated data layer inside FastAPI representing BigQuery tables and route them to a SQLite relational cache. Vertex AI is simulated using a Gemini 1.5 Flash parser that maps telemetry details onto structured Pydantic response payloads.

**Q2: What prevents autonomous agents from triggering false alarms?**
*   *Answer*: The Agent Development Kit uses a strict severity threshold (Severity >= 8) validated by Gemini's confidence metric. Lower severity alerts require manual dispatcher confirmation before dispatch.
