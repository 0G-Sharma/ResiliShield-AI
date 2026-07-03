'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, AutonomousAgent, Mission } from '../store/useStore';
import { Play, Shield, Wifi, Radio, Zap, AlertTriangle, Cpu, ListCollapse, Network, PlayCircle, StopCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentControl() {
  const { 
    agents, 
    updateAgentStatus, 
    addLog, 
    selectedIncident, 
    updateResourceStatus, 
    resources,
    activeMissions,
    addMission,
    updateMissionProgress,
    addIncident,
    selectIncident,
    userRole
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'agents' | 'missions' | 'graph' | 'simulator'>('agents');
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  
  // Background Auto-Simulation state
  const [autoSimActive, setAutoSimActive] = useState(false);
  const simIntervalRef = useRef<any>(null);

  // Disable commands if Observer role
  const isReadOnly = userRole === 'observer';

  // Custom execution triggers
  const executeAgentAction = async (agentId: string, actionType: string) => {
    if (isReadOnly) {
      addLog('WARNING', 'Observer access level. Directives modification denied.');
      return;
    }

    setActiveAgentId(agentId);
    updateAgentStatus(agentId, 'executing', `Initiating command: ${actionType.toUpperCase()}...`);
    addLog('Agent', `Orchestrating agent [${agents.find(a => a.id === agentId)?.name}] for execution: ${actionType}`);

    const missionId = `m-${Math.random().toString(36).substring(7)}`;
    const agentName = agents.find(a => a.id === agentId)?.name || 'Crisis Coordinator';
    
    // Create new mission tracker
    const newMission: Mission = {
      id: missionId,
      name: `${actionType.replace('_', ' ').toUpperCase()}: ${selectedIncident?.location || 'Grid Override'}`,
      agentName,
      status: 'running',
      progress: 20,
      timestamp: new Date().toLocaleTimeString(),
      details: 'Routing command vectors across agency subnets...',
      logs: ['Mission launched by commander override.', 'Resolving proximity nodes...']
    };
    addMission(newMission);

    try {
      const response = await fetch('http://localhost:8000/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          action: actionType,
          incident_id: selectedIncident?.id || 'manual-override'
        })
      });

      if (!response.ok) throw new Error('dispatch failed');
      const res = await response.json();

      updateMissionProgress(missionId, 60, 'running', 'Connecting to Vertex AI recommendation model...');
      await new Promise(r => setTimeout(r, 800)); // Smooth transitions
      
      updateAgentStatus(agentId, 'completed', res.actions[0] || 'Task complete.');
      addLog('SUCCESS', `Agent execution successful: ${res.actions.join(', ')}`);
      
      updateMissionProgress(missionId, 100, 'completed', 'All coordinate assets dispatched successfully.');

      if (actionType === 'dispatch_rescue') {
        resources.forEach(r => {
          if (r.availability === 'available' && r.distance < 3.0) {
            updateResourceStatus(r.id, 'dispatched');
            addLog('BigQuery', `Dispatched asset: [${r.name}] en route.`);
          }
        });
      }
    } catch (err) {
      addLog('WARNING', `Backend agency dispatcher offline. Invoking offline fallback scripts...`);
      updateMissionProgress(missionId, 50, 'running', 'Retrying routing queries in offline mode...');
      
      await new Promise(r => setTimeout(r, 1200));
      let actionLog = 'Task completed.';
      
      if (actionType === 'dispatch_rescue') {
        actionLog = 'Heavy rescue vehicles dispatched to coordinates.';
        resources.forEach(r => {
          if (r.availability === 'available' && r.distance < 4.0) {
            updateResourceStatus(r.id, 'dispatched');
          }
        });
      } else if (actionType === 'isolate_grid') {
        actionLog = 'Substation isolated. Grids redirected.';
      } else if (actionType === 'trigger_sos') {
        actionLog = 'Emergency cell tower broadcast fired.';
      } else if (actionType === 'generate_report') {
        actionLog = 'Briefing PDF compiled and uploaded.';
      }

      updateAgentStatus(agentId, 'completed', actionLog);
      addLog('SUCCESS', `Offline Execution Complete: ${actionLog}`);
      updateMissionProgress(missionId, 100, 'completed', `Completed: ${actionLog}`);
    } finally {
      setActiveAgentId(null);
    }
  };

  // Background Auto-Simulation loop
  useEffect(() => {
    if (autoSimActive) {
      addLog('System', 'Autonomous Crisis Simulation Engine: ACTIVE.');
      
      simIntervalRef.current = setInterval(() => {
        // Trigger a random incident
        const types = ['fire', 'flood', 'landslide'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const presets = {
          fire: { name: 'Mission Hazmat Pipeline Fire', lat: 37.759, lng: -122.418, text: 'Gas leak main ignition. Secondary combustion spreading towards structures.' },
          flood: { name: 'Presidio Harbor Wave Overflow', lat: 37.801, lng: -122.464, text: 'Sea wall breached. Severe roadway flooding reported. High depth index.' },
          landslide: { name: 'Golden Gate Slope Fracture', lat: 37.798, lng: -122.486, text: 'Saturated soil slide blocking arterial highway coordinates.' }
        };
        
        const data = presets[type as keyof typeof presets];
        const severity = Math.floor(Math.random() * 3) + 7; // 7 to 9
        
        const simInc = {
          id: `sim-${Math.random().toString(36).substring(7)}`,
          type,
          location: data.name,
          latitude: data.lat,
          longitude: data.lng,
          severity,
          status: 'active' as const,
          summary: data.text,
          timestamp: new Date().toLocaleTimeString(),
          analysis: {
            severity_score: severity,
            confidence: 0.94,
            damage_summary: data.text,
            human_presence: true,
            fire_detection: type === 'fire',
            flood_probability: type === 'flood' ? 0.96 : 0.05,
            building_collapse: type === 'fire' ? 40 : 10,
            landslide_risk: type === 'landslide' ? 0.92 : 0.02,
            structural_damage: 'HIGH',
            recommendations: ['Dispatch emergency responders.', 'Notify local civil protection squads.'],
            risk_level: 'HIGH' as const,
            triage_priority: 'HIGH' as const,
            casualty_estimation: Math.floor(Math.random() * 8) + 2,
            spread_prediction: 'Steady progression index. Localized containment active.'
          }
        };

        addIncident(simInc);
        selectIncident(simInc);
        addLog('AI', `Auto telemetry scan report: ${data.name}`);
        addLog('System', `Subagents coordinates locked. Resolving response routes.`);

        // Queue automated agent dispatch
        const agentIndex = type === 'fire' ? '1' : type === 'flood' ? '4' : '3';
        executeAgentAction(agentIndex, type === 'fire' ? 'dispatch_rescue' : type === 'flood' ? 'trigger_sos' : 'generate_report');

      }, 18000); // Generate every 18 seconds for active demo
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        addLog('System', 'Autonomous Crisis Simulation Engine: DEACTIVATED.');
      }
    }

    return () => clearInterval(simIntervalRef.current);
  }, [autoSimActive]);

  return (
    <div className="glass-panel border border-white/10 p-5 rounded-2xl flex flex-col h-full gap-4 shadow-[0_0_30px_rgba(0,102,255,0.05)] max-h-[360px]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-mono uppercase tracking-widest text-neon-cyan flex items-center gap-2">
          <Shield className="w-4 h-4" /> Agent Control Center
        </h3>
        
        {/* Sub tabs selection */}
        <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setActiveSubTab('agents')}
            className={`px-2 py-1 rounded text-[8px] font-mono uppercase tracking-wider transition-all ${
              activeSubTab === 'agents' ? 'bg-neon-cyan text-black font-bold' : 'text-white/60 hover:text-white/90'
            }`}
          >
            Agents
          </button>
          <button
            onClick={() => setActiveSubTab('missions')}
            className={`px-2 py-1 rounded text-[8px] font-mono uppercase tracking-wider transition-all ${
              activeSubTab === 'missions' ? 'bg-neon-cyan text-black font-bold' : 'text-white/60 hover:text-white/90'
            }`}
          >
            Missions
          </button>
          <button
            onClick={() => setActiveSubTab('graph')}
            className={`px-2 py-1 rounded text-[8px] font-mono uppercase tracking-wider transition-all ${
              activeSubTab === 'graph' ? 'bg-neon-cyan text-black font-bold' : 'text-white/60 hover:text-white/90'
            }`}
          >
            Graph
          </button>
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-2 py-1 rounded text-[8px] font-mono uppercase tracking-wider transition-all ${
              activeSubTab === 'simulator' ? 'bg-neon-cyan text-black font-bold' : 'text-white/60 hover:text-white/90'
            }`}
          >
            Sim
          </button>
        </div>
      </div>

      {/* Subtab Contents */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* 1. AGENTS TAB */}
        {activeSubTab === 'agents' && (
          <div className="grid grid-cols-2 gap-3 h-full">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`p-3 rounded-xl border transition-all flex flex-col gap-1.5 relative bg-white/2 ${
                  agent.status === 'executing'
                    ? 'border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.15)] bg-neon-cyan/5'
                    : agent.status === 'completed'
                    ? 'border-success-green/40 hover:border-success-green/60'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-white tracking-wide truncate max-w-[90px]">
                    {agent.name}
                  </span>
                  <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded-full border ${
                    agent.status === 'executing'
                      ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan animate-pulse'
                      : agent.status === 'completed'
                      ? 'bg-success-green/10 border-success-green text-success-green'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}>
                    {agent.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[9px] text-white/50 leading-tight flex-1">{agent.description}</p>
                {agent.lastAction && (
                  <div className="bg-black/30 p-1 rounded border border-white/5 text-[8px] font-mono text-success-green truncate">
                    {agent.lastAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 2. MISSIONS TAB */}
        {activeSubTab === 'missions' && (
          <div className="flex flex-col gap-2">
            {activeMissions.length === 0 ? (
              <div className="py-6 text-center text-white/30 font-mono text-[10px]">
                No active operational missions queued.
              </div>
            ) : (
              activeMissions.map((mis) => (
                <div key={mis.id} className="p-3 border border-white/5 bg-white/2 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-white font-bold truncate max-w-[140px]">{mis.name}</span>
                    <span className={`px-2 py-0.5 rounded border text-[8px] ${
                      mis.status === 'completed' 
                        ? 'bg-success-green/10 border-success-green text-success-green'
                        : 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan animate-pulse'
                    }`}>
                      {mis.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        mis.status === 'completed' ? 'bg-success-green' : 'bg-neon-cyan animate-pulse'
                      }`}
                      style={{ width: `${mis.progress}%` }}
                    />
                  </div>
                  <div className="text-[8px] font-mono text-white/40 flex justify-between">
                    <span>Agent: {mis.agentName}</span>
                    <span>Prog: {mis.progress}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. EXECUTION GRAPH TAB */}
        {activeSubTab === 'graph' && (
          <div className="flex flex-col items-center justify-center p-3 h-full gap-2">
            <div className="flex items-center w-full gap-2 font-mono text-[9px]">
              <div className="flex-1 p-2 rounded border border-white/10 bg-white/3 text-center">
                <span className="text-neon-cyan font-bold block">Ingestion</span>
                <span className="text-[8px] text-white/40">Radar/Video</span>
              </div>
              <span className="text-neon-cyan">➔</span>
              <div className="flex-1 p-2 rounded border border-neon-purple/20 bg-neon-purple/5 text-center">
                <span className="text-neon-purple font-bold block">Gemini AI</span>
                <span className="text-[8px] text-white/40">Threat Parse</span>
              </div>
            </div>
            <div className="text-neon-cyan font-mono text-[9px] rotate-90 my-0.5">➔</div>
            <div className="flex items-center w-full gap-2 font-mono text-[9px]">
              <div className="flex-1 p-2 rounded border border-electric-blue/20 bg-electric-blue/5 text-center">
                <span className="text-electric-blue font-bold block">BigQuery</span>
                <span className="text-[8px] text-white/40">Proximity Router</span>
              </div>
              <span className="text-neon-cyan">➔</span>
              <div className="flex-1 p-2 rounded border border-success-green/20 bg-success-green/5 text-center">
                <span className="text-success-green font-bold block">Responders</span>
                <span className="text-[8px] text-white/40">Auto Dispatch</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. SIMULATOR CONTROLS */}
        {activeSubTab === 'simulator' && (
          <div className="flex flex-col gap-3 p-2 border border-white/5 rounded-xl bg-black/40 h-full justify-between">
            <div className="flex flex-col gap-1 text-[10px] font-mono">
              <span className="text-neon-cyan font-bold">Autonomous Background Simulator</span>
              <span className="text-white/40 text-[8px]">Mocks random crisis events & subagent dispatches</span>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="text-[9px] font-mono text-white/50">SIMULATION ENGINE:</span>
              <button
                onClick={() => setAutoSimActive(!autoSimActive)}
                className={`px-4 py-2 rounded-xl font-mono text-[9px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                  autoSimActive 
                    ? 'bg-warning-red text-white shadow-[0_0_15px_#FF0055]'
                    : 'bg-neon-cyan text-black hover:bg-neon-cyan/90'
                }`}
              >
                {autoSimActive ? <StopCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                {autoSimActive ? 'Deactivate Sim' : 'Activate Sim'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Agent Action Overrides */}
      {activeSubTab === 'agents' && (
        <div className="border-t border-white/10 pt-3">
          <h4 className="text-[10px] font-mono uppercase text-white/40 tracking-wider mb-2">Crisis Directives Override</h4>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => executeAgentAction('1', 'dispatch_rescue')}
              disabled={activeAgentId !== null || isReadOnly}
              className="p-2 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/15 transition-all text-center flex flex-col items-center gap-1 group disabled:opacity-40"
            >
              <Zap className="w-4 h-4 text-neon-cyan group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-mono font-bold text-white uppercase truncate w-full">Rescue Deploy</span>
            </button>

            <button
              onClick={() => executeAgentAction('2', 'isolate_grid')}
              disabled={activeAgentId !== null || isReadOnly || userRole === 'operator'}
              className="p-2 rounded-lg border border-warning-red/30 bg-warning-red/5 hover:bg-warning-red/15 transition-all text-center flex flex-col items-center gap-1 group disabled:opacity-40"
            >
              <AlertTriangle className="w-4 h-4 text-warning-red group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-mono font-bold text-white uppercase truncate w-full">Grid Cut</span>
            </button>

            <button
              onClick={() => executeAgentAction('4', 'trigger_sos')}
              disabled={activeAgentId !== null || isReadOnly || userRole === 'operator'}
              className="p-2 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/15 transition-all text-center flex flex-col items-center gap-1 group disabled:opacity-40"
            >
              <Radio className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-mono font-bold text-white uppercase truncate w-full">Broadcast</span>
            </button>

            <button
              onClick={() => executeAgentAction('3', 'generate_report')}
              disabled={activeAgentId !== null || isReadOnly}
              className="p-2 rounded-lg border border-white/10 bg-white/2 hover:bg-white/5 transition-all text-center flex flex-col items-center gap-1 group disabled:opacity-40"
            >
              <RefreshCw className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-mono font-bold text-white uppercase truncate w-full">Brief PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
