'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Search, Terminal, Zap, Trash2, Layout, Radio, ShieldAlert, Cpu, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandItem {
  id: string;
  name: string;
  description: string;
  shortcut?: string;
  action: () => void;
  icon: React.ComponentType<any>;
  category: 'Actions' | 'Navigation' | 'System';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { 
    setActiveTab, 
    clearLogs, 
    addLog, 
    setRadarSweepActive, 
    radarSweepActive,
    setUserRole,
    resetAll,
    incidents,
    addIncident,
    selectIncident
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const runSimulation = (type: 'earthquake' | 'storm') => {
    const lat = type === 'earthquake' ? 37.754 : 37.803;
    const lng = type === 'earthquake' ? -122.446 : -122.438;
    const severity = type === 'earthquake' ? 10 : 8;
    const summary = type === 'earthquake' 
      ? 'CRITICAL TELEMETRY: Magnitude 6.7 seismic event detected near Twin Peaks epicenter. Severe structural displacement predicted.'
      : 'COASTAL STORM ALERT: High tide swell surge inundating marina sea wall. High current velocities reported.';

    const newInc = {
      id: `sim-${Math.random().toString(36).substring(7)}`,
      type: type === 'earthquake' ? 'landslide' : 'flood',
      location: type === 'earthquake' ? 'Twin Peaks Epicenter' : 'Marina Sea Wall',
      latitude: lat,
      longitude: lng,
      severity: severity,
      status: 'active' as const,
      summary,
      timestamp: new Date().toLocaleTimeString(),
      analysis: {
        severity_score: severity,
        confidence: 0.96,
        damage_summary: summary,
        human_presence: true,
        fire_detection: false,
        flood_probability: type === 'storm' ? 0.98 : 0.1,
        building_collapse: type === 'earthquake' ? 75 : 15,
        landslide_risk: type === 'earthquake' ? 0.92 : 0.05,
        structural_damage: severity >= 9 ? 'CRITICAL' : 'HIGH',
        recommendations: [
          'Evacuate high-density structures immediately.',
          'Isolate primary power grids.',
          'Dispatch tactical air support units.'
        ],
        risk_level: 'CRITICAL' as const
      }
    };
    addIncident(newInc);
    selectIncident(newInc);
    addLog('System', `Scenario Simulator: Broadcasted ${type.toUpperCase()} alert details.`);
    addLog('SUCCESS', `Epicenter mapped. Autonomous Sentinel dispatches queued.`);
  };

  const commands: CommandItem[] = [
    {
      id: 'sos',
      name: 'Trigger Manual SOS override',
      description: 'Fires full-alert direct cellular and satellite broadcast streams',
      shortcut: 'S',
      category: 'Actions',
      icon: ShieldAlert,
      action: () => {
        addLog('WARNING', 'COMMANDER MANUAL OVERRIDE: Global SOS triggered.');
        // Trigger generic SOS incident
        const sosInc = {
          id: `sos-${Math.random().toString(36).substring(7)}`,
          type: 'emergency',
          location: 'SOS Broadcast Center',
          latitude: 37.777,
          longitude: -122.412,
          severity: 10,
          status: 'active' as const,
          summary: 'COMMANDER MANUAL OVERRIDE ACTIVE: Global distress beacon broadcasted to emergency responders.',
          timestamp: new Date().toLocaleTimeString(),
          analysis: {
            severity_score: 10,
            confidence: 0.99,
            damage_summary: 'Commander initiated direct physical overrides.',
            human_presence: true,
            fire_detection: true,
            flood_probability: 0.5,
            building_collapse: 50,
            landslide_risk: 0.5,
            structural_damage: 'HIGH',
            recommendations: ['Mobilize all available responders.'],
            risk_level: 'CRITICAL' as const
          }
        };
        addIncident(sosInc);
        selectIncident(sosInc);
        addLog('SUCCESS', 'SOS signal active. Tactical operations locked.');
      }
    },
    {
      id: 'sim-eq',
      name: 'Simulate Twin Peaks Earthquake',
      description: 'Simulates a magnitude 6.7 seismic event with landslide threat',
      category: 'Actions',
      icon: Radio,
      action: () => runSimulation('earthquake')
    },
    {
      id: 'sim-st',
      name: 'Simulate Marina Sea Wave Surge',
      description: 'Simulates ocean storm overflow and electrical grid failures',
      category: 'Actions',
      icon: Radio,
      action: () => runSimulation('storm')
    },
    {
      id: 'nav-overview',
      name: 'Go to HUD Overview Tab',
      description: 'Switch to tactical map and intake scan dashboard',
      shortcut: '1',
      category: 'Navigation',
      icon: Layout,
      action: () => setActiveTab('overview')
    },
    {
      id: 'nav-workspace',
      name: 'Go to Gesture Workspace Tab',
      description: 'Switch to floating HUD widgets layout editor',
      shortcut: '2',
      category: 'Navigation',
      icon: Layout,
      action: () => setActiveTab('workspace')
    },
    {
      id: 'nav-analytics',
      name: 'Go to Operations Analytics Tab',
      description: 'Switch to charts, delay trends and resource plots',
      shortcut: '3',
      category: 'Navigation',
      icon: Layout,
      action: () => setActiveTab('analytics')
    },
    {
      id: 'clear-telemetry',
      name: 'Flush Command Logs',
      description: 'Clears the console log stream history list',
      category: 'System',
      icon: Trash2,
      action: () => {
        clearLogs();
        addLog('System', 'Log stream successfully flushed.');
      }
    },
    {
      id: 'toggle-radar',
      name: `Toggle Radar Sweep: ${radarSweepActive ? 'Disable' : 'Enable'}`,
      description: 'Toggles the animated radar sweep path display',
      category: 'System',
      icon: Terminal,
      action: () => {
        setRadarSweepActive(!radarSweepActive);
        addLog('System', `Tactical radar scan sweep ${!radarSweepActive ? 'activated' : 'deactivated'}.`);
      }
    },
    {
      id: 'reset-state',
      name: 'Reset System Telemetry',
      description: 'Reset all active incidents, agents and resource status',
      category: 'System',
      icon: Cpu,
      action: () => resetAll()
    },
    {
      id: 'log-out',
      name: 'Terminate Operation Role (Logout)',
      description: 'Switch to role selection startup sequence screen',
      category: 'System',
      icon: LogOut,
      action: () => setUserRole(null)
    }
  ];

  // Filter commands
  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            ref={containerRef}
            className="w-full max-w-xl glass-panel-glow border border-neon-cyan/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[420px]"
          >
            {/* Search Input bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-black/40">
              <Search className="w-4 h-4 text-neon-cyan" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or navigate options..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-white/20 outline-none border-none font-mono"
              />
              <span className="text-[9px] font-mono border border-white/20 bg-white/5 px-2 py-0.5 rounded text-white/40">
                ESC to exit
              </span>
            </div>

            {/* List Section */}
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar bg-black/10">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-white/40 font-mono text-xs">
                  No telemetry commands match "{search}"
                </div>
              ) : (
                // Group by Category
                (['Actions', 'Navigation', 'System'] as const).map(cat => {
                  const catCommands = filteredCommands.filter(c => c.category === cat);
                  if (catCommands.length === 0) return null;

                  return (
                    <div key={cat} className="flex flex-col mb-3">
                      <span className="text-[8px] font-mono font-bold text-white/30 uppercase tracking-widest px-3 py-1.5">
                        {cat}
                      </span>
                      {catCommands.map(cmd => {
                        const globalIndex = filteredCommands.indexOf(cmd);
                        const isSelected = globalIndex === selectedIndex;
                        const CmdIcon = cmd.icon;

                        return (
                          <button
                            key={cmd.id}
                            onClick={() => {
                              cmd.action();
                              onClose();
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-mono transition-all border ${
                              isSelected
                                ? 'bg-neon-cyan/10 border-neon-cyan/20 text-white'
                                : 'bg-transparent border-transparent text-white/60 hover:text-white/80'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg border ${
                                isSelected ? 'border-neon-cyan/30 bg-neon-cyan/10' : 'border-white/5 bg-white/2'
                              }`}>
                                <CmdIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-neon-cyan' : 'text-slate-400'}`} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold">{cmd.name}</span>
                                <span className="text-[9px] text-white/40">{cmd.description}</span>
                              </div>
                            </div>

                            {cmd.shortcut && (
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] border border-white/10 bg-white/3 px-1.5 py-0.5 rounded text-white/40">
                                  ALT
                                </span>
                                <span className="text-[8px] border border-white/10 bg-white/3 px-1.5 py-0.5 rounded text-white/40">
                                  {cmd.shortcut}
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
