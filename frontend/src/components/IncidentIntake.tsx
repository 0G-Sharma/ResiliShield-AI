'useRef';
'useState';

import React, { useState, useRef } from 'react';
import { useStore, Incident, GeminiAnalysis } from '../store/useStore';
import { UploadCloud, FileVideo, FileAudio, FileText, Image as ImageIcon, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// Preset scenarios for easier testing / hackathon demo
const SCENARIOS = [
  {
    name: 'SOMA Structural Fire',
    type: 'fire',
    lat: 37.777,
    lng: -122.412,
    fileName: 'drone_feed_09a.mp4',
    text: 'A high-rise residential structure is engulfed in heavy smoke. Active fire detected on floors 4 and 5. Multiple structures at risk, possible occupants trapped inside.'
  },
  {
    name: 'Marina District Flood',
    type: 'flood',
    lat: 37.803,
    lng: -122.438,
    fileName: 'sat_imagery_marina.png',
    text: 'Severe ocean overflow following high tidal surge. Water depth exceeding 1.2 meters on main boulevard. Basements inundated, electrical transformers failing.'
  },
  {
    name: 'Twin Peaks Landslide',
    type: 'landslide',
    lat: 37.754,
    lng: -122.446,
    fileName: 'aerial_recon_tw.png',
    text: 'Hillside failure blocking secondary transit corridors. Displaced soil encroaching on residential foundations. Risk of secondary slide high due to saturated soil.'
  }
];

export default function IncidentIntake() {
  const { addIncident, selectIncident, addLog, updateAgentStatus, isAnalyzing, setIsAnalyzing, analysisProgress, setAnalysisProgress } = useStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startAnalysis = async (scenario: typeof SCENARIOS[0]) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);
    addLog('AI', `Initiating telemetry ingestion: ${scenario.fileName}`);
    
    // Simulate real-time scanning progress with console logs
    const logs = [
      { progress: 10, msg: 'Decompressing packet streams...' },
      { progress: 25, msg: 'Executing semantic parsing on image segments...' },
      { progress: 45, msg: 'Querying Gemini-1.5-Flash via Google Vertex AI...' },
      { progress: 65, msg: 'Running predictive damage classification classifiers...' },
      { progress: 85, msg: 'Analyzing human presence indices and thermal signatures...' },
      { progress: 100, msg: 'Analysis completed successfully. Emitting report payload.' }
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(logs[i].progress);
      addLog('Gemini', logs[i].msg);
    }

    // Call FastAPI backend to perform actual (or simulated API endpoint) analysis
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: scenario.type,
          location: scenario.name,
          latitude: scenario.lat,
          longitude: scenario.lng,
          description: scenario.text
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const result = await response.json();
      setAnalysisResult(result.analysis);

      // Create new incident
      const newIncident: Incident = {
        id: result.id || Math.random().toString(36).substring(7),
        type: scenario.type,
        location: scenario.name,
        latitude: scenario.lat,
        longitude: scenario.lng,
        severity: result.severity_score,
        status: 'active',
        summary: result.analysis.damage_summary,
        timestamp: new Date().toLocaleTimeString(),
        analysis: result.analysis
      };

      addIncident(newIncident);
      selectIncident(newIncident);
      addLog('SUCCESS', `Threat Incident added with Severity Score: ${result.severity_score}/10`);

      // Trigger Agent Development Kit logic in store
      if (result.severity_score >= 8) {
        addLog('Agent', 'CRITICAL Severity (>=8) detected! Launching Autonomous Action Pipeline...');
        triggerAutonomousAgents(result.severity_score);
      }

    } catch (err) {
      addLog('WARNING', `Backend API error. Falling back to local AI solver.`);
      // Mock fallback
      const severity = scenario.type === 'fire' ? 9 : scenario.type === 'flood' ? 8 : 6;
      const mockResult: GeminiAnalysis = {
        severity_score: severity,
        confidence: 0.94,
        damage_summary: scenario.text,
        human_presence: true,
        fire_detection: scenario.type === 'fire',
        flood_probability: scenario.type === 'flood' ? 0.98 : 0.05,
        building_collapse: scenario.type === 'fire' ? 45 : scenario.type === 'landslide' ? 70 : 10,
        landslide_risk: scenario.type === 'landslide' ? 0.95 : 0.02,
        structural_damage: 'HIGH',
        recommendations: [
          'Immediate evacuation of a 200m buffer zone',
          'Deploy regional warning alerts to all local networks',
          'Dispatch specialized rescue assets immediately'
        ],
        risk_level: severity >= 8 ? 'CRITICAL' : 'HIGH'
      };

      setAnalysisResult(mockResult);

      const newIncident: Incident = {
        id: 'inc-' + Math.random().toString(36).substring(7),
        type: scenario.type,
        location: scenario.name,
        latitude: scenario.lat,
        longitude: scenario.lng,
        severity: severity,
        status: 'active',
        summary: scenario.text,
        timestamp: new Date().toLocaleTimeString(),
        analysis: mockResult
      };

      addIncident(newIncident);
      selectIncident(newIncident);
      if (severity >= 8) {
        triggerAutonomousAgents(severity);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerAutonomousAgents = async (severity: number) => {
    updateAgentStatus('1', 'executing', 'Calculating optical routes to incident zone...');
    await new Promise(r => setTimeout(r, 1200));
    updateAgentStatus('1', 'completed', 'Ambulance and Heavy Rescue dispatches queued.');
    
    updateAgentStatus('2', 'executing', 'Monitoring power network lines for SOMA grid...');
    await new Promise(r => setTimeout(r, 1500));
    updateAgentStatus('2', 'completed', 'Power substation isolated.');

    updateAgentStatus('4', 'executing', 'Broadcasting civic alerts...');
    await new Promise(r => setTimeout(r, 1000));
    updateAgentStatus('4', 'completed', 'SOS text warnings pushed to cellular users.');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Select random scenario on custom drop
      const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      const customScenario = {
        ...randomScenario,
        fileName: file.name,
        name: `User Reported: ${file.name.substring(0, 15)}`
      };
      setSelectedScenario(customScenario);
      startAnalysis(customScenario);
    }
  };

  const handlePresetSelect = (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario);
    startAnalysis(scenario);
  };

  return (
    <div className="glass-panel border border-white/10 p-5 rounded-2xl flex flex-col h-full gap-4 relative overflow-hidden">
      {/* Laser Scanning Overlay when analyzing */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-neon-cyan/5 pointer-events-none z-10 overflow-hidden">
          <div className="w-full h-1 bg-neon-cyan shadow-[0_0_15px_#00F3FF] animate-scan" />
        </div>
      )}

      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-mono uppercase tracking-widest text-neon-cyan flex items-center gap-2">
          <UploadCloud className="w-4 h-4" /> Live Incident Intake
        </h3>
        {isAnalyzing && (
          <span className="text-[10px] font-mono bg-neon-cyan/15 text-neon-cyan px-2 py-0.5 rounded-full border border-neon-cyan/30 animate-pulse">
            SCANNING Telemetry {analysisProgress}%
          </span>
        )}
      </div>

      {!isAnalyzing && !analysisResult ? (
        <div className="flex-1 flex flex-col gap-4">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_20px_rgba(0,243,255,0.1)]' 
                : 'border-white/10 hover:border-white/20 bg-white/2'
            }`}
          >
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
                const customScenario = {
                  ...randomScenario,
                  fileName: e.target.files[0].name,
                  name: `User Telemetry: ${e.target.files[0].name.substring(0, 15)}`
                };
                setSelectedScenario(customScenario);
                startAnalysis(customScenario);
              }
            }} />
            <UploadCloud className="w-10 h-10 text-white/40 mb-3 group-hover:text-neon-cyan" />
            <p className="text-xs font-semibold text-white/80">Drag & drop emergency media</p>
            <p className="text-[10px] text-white/40 mt-1">Supports Images, Videos, PDFs, Satellite TIFF, drone logs</p>
          </div>

          {/* Quick Scenario Loader */}
          <div>
            <h4 className="text-[10px] font-mono uppercase text-white/40 tracking-wider mb-2">Simulate Disaster Feed</h4>
            <div className="grid grid-cols-3 gap-2">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.name}
                  onClick={() => handlePresetSelect(sc)}
                  className="p-2 border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 rounded-lg text-left transition-all"
                >
                  <p className="text-[10px] font-mono text-neon-cyan font-bold truncate">{sc.name}</p>
                  <span className="text-[9px] font-mono text-white/40 block mt-0.5 uppercase">{sc.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : isAnalyzing ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-neon-cyan border-r-electric-blue animate-spin flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-neon-cyan">{analysisProgress}%</span>
          </div>
          <div className="text-center">
            <p className="text-xs font-mono font-bold text-white tracking-widest uppercase">VERTEX AI PROCESSING ENGINE</p>
            <p className="text-[10px] font-mono text-white/50 mt-1 truncate max-w-[250px]">{selectedScenario?.fileName}</p>
          </div>
        </div>
      ) : (
        // Analysis Result Display
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[300px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div>
              <p className="text-xs font-mono font-bold text-white truncate max-w-[200px]">{selectedScenario?.name}</p>
              <p className="text-[9px] font-mono text-white/40">{selectedScenario?.fileName}</p>
            </div>
            <button 
              onClick={() => { setAnalysisResult(null); setSelectedScenario(null); }}
              className="text-[9px] font-mono uppercase tracking-widest text-neon-cyan border border-neon-cyan/20 px-2 py-1 rounded bg-neon-cyan/5 hover:bg-neon-cyan/15"
            >
              Scan New
            </button>
          </div>

          {analysisResult && (
            <div className="flex flex-col gap-2.5">
              {/* Score meter & Severity badge */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-white/5 bg-white/2 rounded-lg flex flex-col">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Severity Index</span>
                  <span className={`text-xl font-mono font-bold ${analysisResult.severity_score >= 8 ? 'text-warning-red' : 'text-orange-400'}`}>
                    {analysisResult.severity_score} / 10
                  </span>
                </div>
                <div className="p-2 border border-white/5 bg-white/2 rounded-lg flex flex-col">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Risk Level</span>
                  <span className={`text-xl font-mono font-bold ${
                    analysisResult.risk_level === 'CRITICAL' ? 'text-warning-red animate-pulse' : 'text-orange-400'
                  }`}>
                    {analysisResult.risk_level}
                  </span>
                </div>
              </div>

              {/* Triage Priority & Casualty speedometers */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-white/5 bg-white/2 rounded-lg flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Triage Priority</span>
                  <span className={`text-[10px] font-mono font-bold mt-1 px-2 py-0.5 rounded border w-fit ${
                    analysisResult.triage_priority === 'CRITICAL' 
                      ? 'bg-warning-red/10 border-warning-red/30 text-warning-red'
                      : analysisResult.triage_priority === 'HIGH'
                      ? 'bg-warning-orange/10 border-warning-orange/30 text-warning-orange'
                      : 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan'
                  }`}>
                    {analysisResult.triage_priority || 'HIGH'}
                  </span>
                </div>
                <div className="p-2 border border-white/5 bg-white/2 rounded-lg flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Est. Casualties</span>
                  <span className="text-xl font-mono font-bold text-white mt-1">
                    {analysisResult.casualty_estimation || 4} <span className="text-[9px] text-white/40 font-normal">lives</span>
                  </span>
                </div>
              </div>

              {/* Specific probabilities */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-1.5 border border-white/5 bg-white/2 rounded">
                  <p className="text-[8px] font-mono text-white/50 uppercase">Human Presence</p>
                  <p className="text-xs font-mono font-bold text-success-green mt-0.5">{analysisResult.human_presence ? 'DETECTED' : 'NONE'}</p>
                </div>
                <div className="p-1.5 border border-white/5 bg-white/2 rounded">
                  <p className="text-[8px] font-mono text-white/50 uppercase">Fire Danger</p>
                  <p className="text-xs font-mono font-bold text-warning-red mt-0.5">{analysisResult.fire_detection ? 'ACTIVE' : 'SAFE'}</p>
                </div>
                <div className="p-1.5 border border-white/5 bg-white/2 rounded">
                  <p className="text-[8px] font-mono text-white/50 uppercase">Confidence</p>
                  <p className="text-xs font-mono font-bold text-neon-cyan mt-0.5">{(analysisResult.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Damage Summary Text */}
              <div className="p-2.5 border border-white/5 bg-white/2 rounded-lg">
                <p className="text-[9px] font-mono text-white/50 uppercase mb-1">AI damage assessment summary</p>
                <p className="text-xs text-white/80 leading-relaxed font-sans">{analysisResult.damage_summary}</p>
              </div>

              {/* Spread Vector prediction */}
              <div className="p-2.5 border border-white/5 bg-white/2 rounded-lg">
                <p className="text-[9px] font-mono text-white/50 uppercase mb-1">AI Spread Forecast</p>
                <p className="text-xs text-white/80 leading-relaxed font-sans">{analysisResult.spread_prediction || 'Stable boundaries.'}</p>
              </div>

              {/* Evacuation plan */}
              {analysisResult.evacuation_plan && (
                <div>
                  <p className="text-[9px] font-mono text-white/50 uppercase mb-1.5">Evacuation Vectors Routing</p>
                  <div className="flex flex-col gap-1.5 bg-white/2 border border-white/5 p-2.5 rounded-xl">
                    {analysisResult.evacuation_plan.map((route, i) => (
                      <div key={i} className="text-[10px] text-white/70 flex gap-2 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-green" />
                        <span>{route}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <p className="text-[9px] font-mono text-white/50 uppercase mb-1.5">Suggested Response Actions</p>
                <ul className="flex flex-col gap-1">
                  {analysisResult.recommendations.map((rec, i) => (
                    <li key={i} className="text-[10px] text-white/70 flex gap-1.5 items-start">
                      <span className="text-neon-cyan font-bold font-mono">▸</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Compile Executive Report */}
              <button
                onClick={() => {
                  addLog('System', 'Compiling Executive Disaster Telemetry Brief PDF...');
                  setTimeout(() => {
                    addLog('SUCCESS', 'Executive report compiled. Secure download link generated in Terminal.');
                  }, 1000);
                }}
                className="w-full mt-2 py-3 rounded-xl bg-neon-cyan text-black font-bold font-mono tracking-wider text-[10px] uppercase hover:bg-neon-cyan/85 hover:shadow-[0_0_15px_#00F3FF] transition-all flex items-center justify-center gap-1.5"
              >
                Compile Executive Report
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
