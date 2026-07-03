'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import HolographicMap from '../../components/HolographicMap';
import IncidentIntake from '../../components/IncidentIntake';
import AgentControl from '../../components/AgentControl';
import ResourceRecommender from '../../components/ResourceRecommender';
import TerminalLogs from '../../components/TerminalLogs';
import GestureHUD from '../../components/GestureHUD';
import AnalyticsHUD from '../../components/AnalyticsHUD';
import VoiceAssistant from '../../components/VoiceAssistant';
import CommandPalette from '../../components/CommandPalette';
import { 
  Shield, 
  LayoutGrid, 
  BarChart2, 
  Radio, 
  Activity, 
  Compass, 
  LogOut, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  HeartPulse, 
  Lock,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { 
    activeTab, 
    setActiveTab, 
    incidents, 
    setIncidents, 
    resources, 
    setResources, 
    addLog,
    userRole,
    setUserRole,
    agents,
    addIncident,
    selectIncident,
    updateResourceStatus
  } = useStore();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Load initial telemetry data on mount
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch('http://localhost:8000/dashboard');
        if (response.ok) {
          const data = await response.json();
          setIncidents(data.incidents);
          setResources(data.resources);
          addLog('System', `Connected to backend agency. Loaded ${data.incidents.length} incidents and ${data.resources.length} resources.`);
        }
      } catch (err) {
        addLog('WARNING', 'FastAPI backend unreachable. Utilizing in-memory state engine.');
      }
    };
    fetchTelemetry();
  }, [setIncidents, setResources, addLog]);

  // Real-time WebSocket connection
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWS = () => {
      ws = new WebSocket('ws://localhost:8000/ws');
      
      ws.onopen = () => {
        addLog('System', 'Secure Realtime Telemetry WebSocket stream connected.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_INCIDENT') {
            addIncident(data.payload);
            selectIncident(data.payload);
            addLog('Gemini', `Realtime threat telemetry received: [${data.payload.location}]`);
          } else if (data.type === 'RESOURCE_UPDATE') {
            updateResourceStatus(data.payload.id, data.payload.status);
            addLog('BigQuery', `Realtime asset update: [${data.payload.name}] set to ${data.payload.status}.`);
          } else if (data.type === 'NEW_LOG') {
            addLog(data.payload.sender, data.payload.message);
          }
        } catch (e) {
          // ignore parsing issues
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWS, 5000);
      };
      
      ws.onerror = () => {
        ws.close();
      };
    };

    connectWS();
    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [addIncident, selectIncident, updateResourceStatus, addLog]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette (Ctrl + K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      
      // Tab Navigation (Alt + 1, Alt + 2, Alt + 3)
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setActiveTab('overview');
        addLog('System', 'HUD navigation: Overview loaded.');
      }
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        setActiveTab('workspace');
        addLog('System', 'HUD navigation: Workspace loaded.');
      }
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        setActiveTab('analytics');
        addLog('System', 'HUD navigation: Analytics loaded.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, addLog]);

  // Calculate top KPI numbers
  const activeIncidentCount = incidents.filter(i => i.status === 'active').length;
  const dispatchedResourceCount = resources.filter(r => r.availability === 'dispatched').length;
  const executingAgentCount = agents.filter(a => a.status === 'executing').length;
  const systemHealth = activeIncidentCount > 0 ? `${Math.max(65, 100 - activeIncidentCount * 12)}%` : '100%';

  // 1. Sleek Login Page Render
  if (userRole === null) {
    return (
      <div className="relative min-h-screen bg-[#03030d] text-slate-100 flex items-center justify-center overflow-hidden">
        {/* Animated backdrop grids */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-electric-blue/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-neon-cyan/5 blur-[130px] pointer-events-none" />

        {/* Central Auth HUD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md p-8 glass-panel-glow border border-neon-cyan/20 rounded-3xl z-10 flex flex-col gap-6 shadow-[0_0_50px_rgba(0,243,255,0.05)]"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)]">
              <Shield className="w-6 h-6 text-neon-cyan" />
            </div>
            <h2 className="text-sm font-mono font-bold tracking-widest text-white uppercase mt-2">
              ResiliShield Operational HUD
            </h2>
            <p className="text-[10px] font-mono text-neon-cyan/60 uppercase tracking-widest">
              Secure Sentinel Authentication Decryption
            </p>
          </div>

          <div className="h-[1px] bg-white/10" />

          {/* Role selector buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setUserRole('commander');
                addLog('System', 'Commander operational credentials verified. Access granted.');
              }}
              className="group p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-neon-cyan/5 hover:border-neon-cyan transition-all text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan group-hover:scale-105 transition-transform">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold font-mono text-white group-hover:text-neon-cyan transition-colors">COMMANDER PORTAL</p>
                  <p className="text-[9px] text-white/50 font-mono mt-0.5">Full capabilities & system overrides</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neon-cyan/40 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all">❯❯</span>
            </button>

            <button
              onClick={() => {
                setUserRole('operator');
                addLog('System', 'Operator dispatcher credentials verified. Access granted.');
              }}
              className="group p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-electric-blue/5 hover:border-electric-blue transition-all text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-electric-blue/10 border border-electric-blue/20 text-electric-blue group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold font-mono text-white group-hover:text-electric-blue transition-colors">OPERATOR DISPATCH</p>
                  <p className="text-[9px] text-white/50 font-mono mt-0.5">Feed intake & resource scheduling</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-electric-blue/40 group-hover:text-electric-blue group-hover:translate-x-1 transition-all">❯❯</span>
            </button>

            <button
              onClick={() => {
                setUserRole('observer');
                addLog('System', 'Observer feed initialized. Read-only monitoring active.');
              }}
              className="group p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/20 transition-all text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 group-hover:scale-105 transition-transform">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold font-mono text-white">OBSERVER TELEMETRY</p>
                  <p className="text-[9px] text-white/50 font-mono mt-0.5">Read-only maps & sensor readings</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all">❯❯</span>
            </button>

            <button
              onClick={() => {
                setUserRole('demo');
                addLog('System', 'Demo simulation launched. Scenarios configured.');
              }}
              className="group p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-neon-purple/5 hover:border-neon-purple transition-all text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold font-mono text-white group-hover:text-neon-purple transition-colors">SANDBOX DEMO MODE</p>
                  <p className="text-[9px] text-white/50 font-mono mt-0.5">Pre-configured testing simulation</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neon-purple/40 group-hover:text-neon-purple group-hover:translate-x-1 transition-all">❯❯</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Main Dashboard Page Render
  return (
    <div className="min-h-screen bg-[#03030d] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* HUD Background vectors */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-electric-blue/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-neon-cyan/5 blur-[120px] pointer-events-none" />

      {/* Dashboard Top Header bar */}
      <header className="w-full border-b border-white/10 bg-black/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-xl bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.3)]">
            <Shield className="w-4 h-4 text-neon-cyan" />
          </Link>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold tracking-widest text-white uppercase">RESILISHIELD AI</span>
            <span className="text-[8px] font-mono text-neon-cyan tracking-wider uppercase mt-0.5">
              COMMAND OPERATIONS CENTER v4.2 | {userRole.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-neon-cyan text-black font-bold shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                : 'text-white/60 hover:text-white/95'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'workspace'
                ? 'bg-neon-cyan text-black font-bold shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                : 'text-white/60 hover:text-white/95'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Workspace
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-neon-cyan text-black font-bold shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                : 'text-white/60 hover:text-white/95'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </div>

        {/* Header Telemetries / Exit */}
        <div className="flex items-center gap-4">
          {/* Command Palette Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="px-2.5 py-1.5 rounded-lg glass-panel hover:border-neon-cyan flex items-center gap-2 font-mono text-[9px] text-white/70"
            title="Search Commands (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="hidden sm:inline">COMMANDS</span>
            <kbd className="hidden md:inline px-1 border border-white/20 bg-white/5 rounded text-[8px]">Ctrl K</kbd>
          </button>

          <button
            onClick={() => setUserRole(null)}
            className="w-8 h-8 rounded-lg glass-panel hover:bg-warning-red/20 border border-white/10 hover:border-warning-red flex items-center justify-center text-white/60 hover:text-warning-red transition-all"
            title="Log Out Operations"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid Viewport */}
      <main className="flex-1 w-full max-w-8xl mx-auto px-6 py-6 z-30 relative flex flex-col gap-6">
        {/* Top Ticker alerts */}
        <div className="w-full glass-panel border-l-4 border-l-warning-red py-2 px-4 rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-warning-red animate-pulse" />
            <span className="font-bold text-white uppercase tracking-wider">CIVIC BROADCAST ACTIVE:</span>
            <span className="text-white/80">Evacuation routes computed for coastal zones. Active drones deploying.</span>
          </div>
          <span className="text-[10px] text-white/40 hidden md:block">UPDATE: {new Date().toLocaleDateString()}</span>
        </div>

        {/* Animated KPI Cards Section */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-panel p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-warning-red/10 border border-warning-red/20 text-warning-red">
              <AlertTriangle className={`w-5 h-5 ${activeIncidentCount > 0 ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Active Threats</span>
              <span className="text-xl font-mono font-bold text-white mt-0.5">{activeIncidentCount}</span>
            </div>
            {activeIncidentCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-warning-red animate-ping" />
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-panel p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-success-green/10 border border-success-green/20 text-success-green">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Assets Dispatched</span>
              <span className="text-xl font-mono font-bold text-success-green mt-0.5">{dispatchedResourceCount}</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-panel p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-orange-400/10 border border-orange-400/20 text-orange-400">
              <Cpu className={`w-5 h-5 ${executingAgentCount > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Executing Agents</span>
              <span className="text-xl font-mono font-bold text-orange-400 mt-0.5">{executingAgentCount}</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-panel p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">System Integrity</span>
              <span className="text-xl font-mono font-bold text-neon-cyan mt-0.5">{systemHealth}</span>
            </div>
          </motion.div>
        </section>

        {/* Dynamic content rendering based on activeTab */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch min-h-[500px]">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Left Main View (3/4 grid size) */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="flex-1 min-h-[400px]">
                  <HolographicMap />
                </div>
              </div>

              {/* Right Sidebar View (1/4 grid size) */}
              <div className="flex flex-col gap-6">
                <div className="flex-1 min-h-[250px]">
                  <IncidentIntake />
                </div>
                <div className="min-h-[200px]">
                  <TerminalLogs />
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Gesture Workspace */}
          {activeTab === 'workspace' && (
            <>
              <div className="lg:col-span-3 flex flex-col">
                <GestureHUD />
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex-1 min-h-[280px]">
                  <AgentControl />
                </div>
                <div className="min-h-[200px]">
                  <TerminalLogs />
                </div>
              </div>
            </>
          )}

          {/* Tab 3: Operations Analytics */}
          {activeTab === 'analytics' && (
            <>
              <div className="lg:col-span-3 flex flex-col">
                <AnalyticsHUD />
              </div>
              <div className="flex flex-col">
                <ResourceRecommender />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Command Palette Overlay modal */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Floating chatbot assistant portal */}
      <VoiceAssistant />
    </div>
  );
}

