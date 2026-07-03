# ResiliShield AI
### Autonomous AI-Powered Disaster Response & Emergency Coordination Platform

ResiliShield AI is an intelligent operations command deck designed to minimize critical emergency response delays. The platform utilizes Google Vertex AI (Gemini 1.5 Flash) models for real-time visual threat analysis, queries BigQuery telemetry tables to determine optimal response assets, and executes autonomous agent directives to manage local utilities, alerts, and vehicle dispatches.

---

## 🛠️ Advanced Technology Stack

*   **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Zustand (Global State Engine), Framer Motion (Glassmorphic animations & Draggable widgets), Recharts (Real-time telemetry plots)
*   **Backend**: Python 3.10+, FastAPI, WebSockets (Real-time server-to-client event streaming), Pydantic, SQLAlchemy ORM, SQLite Database, Pandas (BigQuery simulation)
*   **DevOps**: Docker, Docker Compose, GitHub Actions (CI/CD to Cloud Run)

---

## 🔑 Role-Based Access Controls

The platform features an Apple Vision Pro styled login portal with 4 custom credentials selectors:
*   **Commander**: Full write access, allowing direct grid isolation, global SOS broadcasts, and manual subagent overrides.
*   **Operator**: Dispatching authority, access to ingestion scanners, but grid overrides and broadcast capabilities are locked.
*   **Observer**: Read-only telemetry readout, providing access to map visualizers, logs, and analytical charts without write capabilities.
*   **Demo Mode**: Pre-loaded sandbox environment with simulation triggers.

---

## 🛰️ Production Capabilities

*   **Next-Gen Tactical Map**: Custom SVG mapping projection supporting animated radar sweep sectors, radial-gradient heatmaps, Bezier curved routing, moving rescue unit dot tracers, concentric search-radius rings, and active evacuation arrow paths.
*   **Background Simulation Engine**: Fully automated simulation module that periodically generates emergency alerts, runs Vertex AI hazard parsing, and dispatches subagents in real-time.
*   **Command Palette (Ctrl + K)**: Fusion search overlay that coordinates navigation, resets system states, activates radar sweeps, and triggers simulated disasters (e.g. Twin Peaks Earthquake, Marina Sea Wave Surge).
*   **Global Keyboard Shortcuts**:
    *   `Ctrl + K`: Toggle command palette search.
    *   `Alt + 1`: Load Overview Tab.
    *   `Alt + 2`: Load Gesture Workspace Tab.
    *   `Alt + 3`: Load Operations Analytics Tab.
*   **Voice Assistant**: Integrated speech-to-text recognition and text-to-speech synthesize voice command modules to check hospital beds, isolate power grids, and report disaster metrics hands-free.

---

## ⚙️ System Requirements & Environment Variables

Copy the `.env.example` file in the root directory to `.env`:

```env
# Frontend Config
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend Config
ENV=development
PORT=8000

# Google Cloud Platform (Optional - Required for live GCP integration)
GCP_PROJECT_ID=resilishield-ai-prod
GCP_LOCATION=us-central1
GCP_APPLICATION_CREDENTIALS=/path/to/credentials.json
VERTEX_AI_GEMINI_MODEL=gemini-1.5-flash
VERTEX_AI_API_KEY=your_vertex_ai_secret_key
```

---

## 🚀 Quick Start Instructions

You can run the entire platform using **Docker Compose** or by launching the services **Manually**.

### Option A: Run via Docker Compose (Recommended)

1. Make sure you have Docker and Docker Compose installed.
2. In the root directory of the project, run:
   ```bash
   docker-compose up --build
   ```
3. Once running, access the services:
   *   **Frontend Client**: [http://localhost:3000](http://localhost:3000)
   *   **FastAPI Backend Server**: [http://localhost:8000](http://localhost:8000)
   *   **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Manual Local Setup (Without Docker)

#### 1. Launch FastAPI Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server using Uvicorn:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### 2. Launch Next.js Frontend

1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔍 Verification & Demonstration Flow

1.  **Authorize Session**: Access the platform, choose your operations role (e.g. **Commander**), and enter the operations center.
2.  **Ingest a Scenario**: Under the **Overview** tab, select a pre-configured incident (e.g. **SOMA Structural Fire**) in the Ingestion widget to start scanning.
3.  **Inspect AI Scoreboard**: Observe the expanded Vertex AI analysis results including estimated casualties, structural damage level, spread rate predictions, and evacuation routing checkpoints.
4.  **Confirm Map Telemetry**: Watch the tactical map center on the threat coordinates, showing pulsing concentric heatwaves, active evacuation vectors, and Bezier route lines with active dot tracers.
5.  **Autonomous Coordination**: Under the **Workspace** tab, review the active subagent dispatches and timeline progress bars, and hover over widgets in the sandbox grid to resize or reposition them.
6.  **Real-Time Simulators**: Hit `Ctrl + K` to open the command palette. Search for `/simulate` and run the **Twin Peaks Earthquake** simulation. Watch the live database populate, map update, and logs stream instantly via WebSockets!

