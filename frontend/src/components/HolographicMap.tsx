'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Resource, Incident } from '../store/useStore';
import { MapPin, ShieldAlert, Crosshair, Navigation, Activity, Compass, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dimensions of our tactical layout coordinates
const MAP_WIDTH = 800;
const MAP_HEIGHT = 450;

// Coordinate projections (San Francisco-like grid mapped to SVG 800x450)
const latRange = { min: 37.70, max: 37.82 };
const lngRange = { min: -122.52, max: -122.36 };

function projectCoords(lat: number, lng: number) {
  const x = ((lng - lngRange.min) / (lngRange.max - lngRange.min)) * MAP_WIDTH;
  // SVG Y goes down, so flip Y
  const y = MAP_HEIGHT - ((lat - latRange.min) / (latRange.max - latRange.min)) * MAP_HEIGHT;
  return { x, y };
}

export default function HolographicMap() {
  const { incidents, selectedIncident, resources, selectIncident, setResources, radarSweepActive } = useStore();
  const [hoveredNode, setHoveredNode] = useState<{ x: number; y: number; title: string; subtitle: string; status: string } | null>(null);
  const [mapCenter, setMapCenter] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [scale, setScale] = useState(1);

  // Default mock resources inside bounds
  const defaultResources: Resource[] = [
    { id: 'res-1', name: 'General Trauma MedCenter', type: 'hospital', latitude: 37.79, longitude: -122.42, capacity: '82%', availability: 'available', distance: 1.8, eta: '4 min', priority: 'HIGH' },
    { id: 'res-2', name: 'SOMA Fire House Station 3', type: 'fire_station', latitude: 37.77, longitude: -122.40, capacity: '90%', availability: 'available', distance: 2.2, eta: '6 min', priority: 'CRITICAL' },
    { id: 'res-3', name: 'Metro Police Sector 5 Depot', type: 'police_station', latitude: 37.74, longitude: -122.46, capacity: 'Available', availability: 'available', distance: 4.1, eta: '11 min', priority: 'MEDIUM' },
    { id: 'res-4', name: 'St. Mary Temporary Shelter A', type: 'shelter', latitude: 37.76, longitude: -122.44, capacity: '45/200 beds', availability: 'available', distance: 3.5, eta: '9 min', priority: 'HIGH' },
    { id: 'res-5', name: 'Aerial Rescue Drone Squad B', type: 'drone', latitude: 37.80, longitude: -122.47, capacity: '4 Active', availability: 'available', distance: 5.2, eta: '3 min', priority: 'CRITICAL' },
    { id: 'res-6', name: 'Heavy Rescue Unit Alpha', type: 'rescue_unit', latitude: 37.72, longitude: -122.41, capacity: 'En Route', availability: 'available', distance: 6.7, eta: '14 min', priority: 'HIGH' },
  ];

  useEffect(() => {
    if (resources.length === 0) {
      setResources(defaultResources);
    }
  }, [resources, setResources]);

  // Adjust view when selectedIncident changes
  useEffect(() => {
    if (selectedIncident) {
      const { x, y } = projectCoords(selectedIncident.latitude, selectedIncident.longitude);
      setMapCenter({ x, y });
      setScale(1.35);
    } else {
      setMapCenter({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
      setScale(1);
    }
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-full glass-panel border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,102,255,0.08)]">
      {/* Top HUD Stats */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="glass-panel px-3 py-1.5 rounded-lg border border-neon-cyan/20 flex items-center gap-2 pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-neon-cyan">TAC MAP V4.5 ACTIVE</span>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => { setScale(prev => Math.min(prev + 0.15, 2.2)); }} 
            className="w-8 h-8 rounded-lg glass-panel hover:bg-white/5 flex items-center justify-center text-neon-cyan font-mono text-sm border border-white/10"
          >
            +
          </button>
          <button 
            onClick={() => { setScale(prev => Math.max(prev - 0.15, 0.85)); }} 
            className="w-8 h-8 rounded-lg glass-panel hover:bg-white/5 flex items-center justify-center text-neon-cyan font-mono text-sm border border-white/10"
          >
            -
          </button>
          <button 
            onClick={() => { setScale(1); selectIncident(null); }} 
            className="px-3 h-8 rounded-lg glass-panel hover:bg-white/5 flex items-center justify-center text-[9px] uppercase font-mono tracking-widest text-white border border-white/10"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 w-full bg-[#03030d] relative overflow-hidden cursor-grab active:cursor-grabbing">
        {/* Holographic background coordinate grid */}
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-25" />

        {/* Tactical Crosshair under center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-15">
          <Crosshair className="w-56 h-56 text-electric-blue animate-pulse-slow" />
        </div>

        <motion.div
          animate={{
            x: MAP_WIDTH / 2 - mapCenter.x * scale,
            y: MAP_HEIGHT / 2 - mapCenter.y * scale,
            scale: scale
          }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          className="origin-center w-[800px] h-[450px] relative"
        >
          <svg
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="absolute inset-0 pointer-events-none"
          >
            <defs>
              {/* Threat radial heatmaps */}
              <radialGradient id="threat-heat-critical" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF0055" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#FF0055" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FF0055" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="threat-heat-high" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF9900" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#FF9900" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FF9900" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Shoreline / Background sector shapes */}
            <path
              d="M-50 200 C150 180, 250 120, 320 50 C380 -10, 500 -50, 850 -50 L850 500 L-50 500 Z"
              fill="rgba(0, 102, 255, 0.015)"
              stroke="rgba(0, 102, 255, 0.06)"
              strokeWidth="1.5"
            />

            {/* Grid Coordinates (vertical lines) */}
            {Array.from({ length: 9 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={(i + 1) * (MAP_WIDTH / 10)}
                y1={0}
                x2={(i + 1) * (MAP_WIDTH / 10)}
                y2={MAP_HEIGHT}
                stroke="rgba(0, 102, 255, 0.02)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Grid Coordinates (horizontal lines) */}
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={(i + 1) * (MAP_HEIGHT / 6)}
                x2={MAP_WIDTH}
                y2={(i + 1) * (MAP_HEIGHT / 6)}
                stroke="rgba(0, 102, 255, 0.02)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Tactical Radar Sweep Wedges */}
            {radarSweepActive && (
              <g className="radar-sweep-group">
                <line
                  x1={MAP_WIDTH / 2}
                  y1={MAP_HEIGHT / 2}
                  x2={MAP_WIDTH / 2 + 350}
                  y2={MAP_HEIGHT / 2}
                  stroke="#00F3FF"
                  strokeWidth="0.8"
                  strokeOpacity="0.45"
                  className="radar-sweep-line"
                />
                <circle
                  cx={MAP_WIDTH / 2}
                  cy={MAP_HEIGHT / 2}
                  r="350"
                  fill="none"
                  stroke="rgba(0, 243, 255, 0.02)"
                  strokeWidth="1"
                />
              </g>
            )}

            {/* Heatmap Danger Hotspots */}
            {incidents.map((inc) => {
              if (inc.status !== 'active') return null;
              const { x, y } = projectCoords(inc.latitude, inc.longitude);
              const heatId = inc.severity >= 8 ? 'url(#threat-heat-critical)' : 'url(#threat-heat-high)';
              const radius = inc.severity * 10 + 20;

              return (
                <circle
                  key={`heat-${inc.id}`}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={heatId}
                  className="animate-pulse"
                  style={{ animationDuration: '3.5s' }}
                />
              );
            })}

            {/* Concentric Search Radius indicator */}
            {selectedIncident && (
              <g>
                {(() => {
                  const { x, y } = projectCoords(selectedIncident.latitude, selectedIncident.longitude);
                  return (
                    <>
                      <circle
                        cx={x}
                        cy={y}
                        r="60"
                        fill="none"
                        stroke="#00F3FF"
                        strokeWidth="1"
                        strokeDasharray="3 6"
                        strokeOpacity="0.6"
                        className="animate-[radar_15s_linear_infinite]"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="100"
                        fill="none"
                        stroke="#00F3FF"
                        strokeWidth="0.5"
                        strokeDasharray="4 8"
                        strokeOpacity="0.3"
                        className="animate-[radar_25s_linear_infinite_reverse]"
                      />
                    </>
                  );
                })()}
              </g>
            )}

            {/* Curved Bezier Routing & Tracers */}
            {selectedIncident && (
              <>
                {resources
                  .filter(r => r.availability === 'dispatched' || r.type === 'drone')
                  .map((res, idx) => {
                    const from = projectCoords(res.latitude, res.longitude);
                    const to = projectCoords(selectedIncident.latitude, selectedIncident.longitude);
                    
                    // Bezier control point to curve the path upward
                    const cx = (from.x + to.x) / 2;
                    const cy = Math.min(from.y, to.y) - 45;
                    const pathD = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;

                    return (
                      <g key={`path-${idx}`}>
                        {/* Static glow path */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={res.type === 'drone' ? '#00FFAA' : '#0066FF'}
                          strokeWidth="1.2"
                          strokeOpacity="0.4"
                        />
                        {/* Dot Tracer following the path */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={res.type === 'drone' ? '#00FFAA' : '#00F3FF'}
                          strokeWidth="2.2"
                          strokeDasharray="5 45"
                          className="animate-[dash_2s_linear_infinite]"
                          style={{ strokeDashoffset: 50 }}
                        />
                      </g>
                    );
                  })}
              </>
            )}

            {/* Evacuation Route Arrow Guides */}
            {selectedIncident && (
              <g>
                {(() => {
                  const incCoords = projectCoords(selectedIncident.latitude, selectedIncident.longitude);
                  // Route outward to safe shelter (e.g. res-4)
                  const shelter = resources.find(r => r.type === 'shelter');
                  if (!shelter) return null;
                  const sheCoords = projectCoords(shelter.latitude, shelter.longitude);

                  const cx = (incCoords.x + sheCoords.x) / 2 + 25;
                  const cy = (incCoords.y + sheCoords.y) / 2 + 25;

                  return (
                    <path
                      d={`M ${incCoords.x} ${incCoords.y} Q ${cx} ${cy} ${sheCoords.x} ${sheCoords.y}`}
                      fill="none"
                      stroke="#00FFAA"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                      strokeOpacity="0.8"
                      className="animate-[dash_1s_linear_infinite_reverse]"
                    />
                  );
                })()}
              </g>
            )}

            {/* Pulsing Threat Rings */}
            {incidents.map((inc) => {
              if (inc.status !== 'active') return null;
              const { x, y } = projectCoords(inc.latitude, inc.longitude);
              const color = inc.severity >= 8 ? '#FF0055' : '#FF9900';
              
              return (
                <g key={`rings-${inc.id}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="25"
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    strokeOpacity="0.3"
                    className="animate-ping"
                    style={{ animationDuration: '3s' }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="50"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    strokeOpacity="0.15"
                    className="animate-ping"
                    style={{ animationDuration: '4.5s' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Resource Markers */}
          {resources.map((res) => {
            const { x, y } = projectCoords(res.latitude, res.longitude);
            const isDispatched = res.availability === 'dispatched';
            
            return (
              <motion.div
                key={res.id}
                style={{ left: x, top: y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer z-20"
                onMouseEnter={() => setHoveredNode({ 
                  x, 
                  y, 
                  title: res.name, 
                  subtitle: `${res.type.replace('_', ' ').toUpperCase()} | Distance: ${res.distance} km`, 
                  status: `Capacity: ${res.capacity} | ETA: ${res.eta}` 
                })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isDispatched 
                    ? 'bg-success-green/20 border border-success-green shadow-[0_0_12px_#00FFAA]' 
                    : 'bg-electric-blue/20 border border-electric-blue/50 hover:border-neon-cyan hover:shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                }`}>
                  {res.type === 'hospital' && <Activity className="w-3.5 h-3.5 text-neon-cyan" />}
                  {res.type === 'fire_station' && <ShieldAlert className="w-3.5 h-3.5 text-warning-red" />}
                  {res.type === 'police_station' && <Navigation className="w-3.5 h-3.5 text-electric-blue" />}
                  {res.type === 'shelter' && <MapPin className="w-3.5 h-3.5 text-white" />}
                  {res.type === 'drone' && <div className="w-2 h-2 bg-success-green rounded-full animate-pulse" />}
                  {res.type === 'rescue_unit' && <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" />}
                </div>
              </motion.div>
            );
          })}

          {/* Incident Threat Markers */}
          {incidents.map((inc) => {
            const { x, y } = projectCoords(inc.latitude, inc.longitude);
            const isSelected = selectedIncident?.id === inc.id;
            
            return (
              <motion.div
                key={inc.id}
                style={{ left: x, top: y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer z-30"
                onClick={() => selectIncident(isSelected ? null : inc)}
                onMouseEnter={() => setHoveredNode({
                  x,
                  y,
                  title: `Threat ID: ${inc.id.substring(0, 8)}`,
                  subtitle: `Type: ${inc.type.toUpperCase()} | Severity: ${inc.severity}/10`,
                  status: `Threat Level: ${inc.severity >= 8 ? 'CRITICAL' : 'HIGH'} | Status: ${inc.status.toUpperCase()}`
                })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className={`p-1.5 rounded-xl border flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-warning-red/20 border-warning-red shadow-[0_0_20px_#FF0055] scale-125'
                    : 'bg-warning-red/10 border-warning-red/40 hover:scale-110 hover:border-warning-red'
                }`}>
                  <ShieldAlert className={`w-4 h-4 ${inc.severity >= 8 ? 'text-warning-red animate-pulse' : 'text-warning-orange'}`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Hover Tooltip display */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none glass-panel-glow p-3 rounded-lg border border-neon-cyan/30 z-40 max-w-[280px]"
              style={{
                left: Math.max(10, Math.min(MAP_WIDTH - 290, hoveredNode.x * scale + (MAP_WIDTH / 2 - mapCenter.x * scale) + 15)),
                top: Math.max(10, Math.min(MAP_HEIGHT - 130, hoveredNode.y * scale + (MAP_HEIGHT / 2 - mapCenter.y * scale) - 80))
              }}
            >
              <h4 className="text-xs font-mono font-bold text-neon-cyan tracking-wider truncate">{hoveredNode.title}</h4>
              <p className="text-[10px] font-mono text-white/70 mt-1">{hoveredNode.subtitle}</p>
              <div className="h-[1px] bg-white/10 my-1.5" />
              <p className="text-[10px] font-mono text-success-green font-semibold">{hoveredNode.status}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Footer telemetries */}
      <div className="glass-panel border-t border-white/5 py-2.5 px-4 flex items-center justify-between text-[10px] font-mono text-white/50 bg-[#03030d]/50">
        <div className="flex gap-4">
          <span>LAT LIMITS: {latRange.min}°N - {latRange.max}°N</span>
          <span>LNG LIMITS: {lngRange.min}°W - {lngRange.max}°W</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
            DRONES: {resources.filter(r => r.type === 'drone').length} ACTIVE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-warning-red animate-pulse" />
            INCIDENTS: {incidents.filter(i => i.status === 'active').length} UNRESOLVED
          </span>
        </div>
      </div>

      {/* Inject animations in a style tag directly since Tailwind v4 handles animations inline */}
      <style jsx global>{`
        .radar-sweep-line {
          transform-origin: 400px 225px;
          animation: radar-spin 6s linear infinite;
        }
        @keyframes radar-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
}

