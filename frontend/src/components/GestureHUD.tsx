'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Radio, ShieldCheck, CloudSun, Maximize2, Trash2, RotateCcw, Lock, Unlock, Sliders } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Widget {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
}

const WIDGET_TEMPLATES: Widget[] = [
  { id: 'diag', title: 'Telemetry Health', icon: Cpu, color: 'text-success-green', defaultWidth: 260, defaultHeight: 180 },
  { id: 'radar', title: 'Tactical Radar Scan', icon: ShieldCheck, color: 'text-neon-cyan', defaultWidth: 280, defaultHeight: 200 },
  { id: 'weather', title: 'Satellite Weather', icon: CloudSun, color: 'text-orange-400', defaultWidth: 250, defaultHeight: 160 },
  { id: 'bulletin', title: 'Crisis Dispatch Wire', icon: Radio, color: 'text-warning-red', defaultWidth: 260, defaultHeight: 180 }
];

export default function GestureHUD() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { addLog } = useStore();

  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(['diag', 'radar', 'weather', 'bulletin']);
  const [positions, setPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [sizes, setSizes] = useState<{ [key: string]: 'sm' | 'md' | 'lg' }>({});
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedActive = localStorage.getItem('hud_active_widgets');
      const savedPositions = localStorage.getItem('hud_positions');
      const savedSizes = localStorage.getItem('hud_sizes');
      const savedLock = localStorage.getItem('hud_locked');

      if (savedActive) setActiveWidgetIds(JSON.parse(savedActive));
      if (savedPositions) setPositions(JSON.parse(savedPositions));
      if (savedSizes) setSizes(JSON.parse(savedSizes));
      if (savedLock) setIsLocked(JSON.parse(savedLock));
    }
  }, []);

  const saveLayout = (
    newActive: string[],
    newPos: typeof positions,
    newSizes: typeof sizes,
    lockState: boolean
  ) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hud_active_widgets', JSON.stringify(newActive));
      localStorage.setItem('hud_positions', JSON.stringify(newPos));
      localStorage.setItem('hud_sizes', JSON.stringify(newSizes));
      localStorage.setItem('hud_locked', JSON.stringify(lockState));
    }
  };

  const toggleWidget = (id: string) => {
    setActiveWidgetIds(prev => {
      const next = prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id];
      saveLayout(next, positions, sizes, isLocked);
      addLog('System', `HUD Widget toggled: ${id.toUpperCase()}`);
      return next;
    });
  };

  const updatePosition = (id: string, x: number, y: number) => {
    setPositions(prev => {
      const next = { ...prev, [id]: { x, y } };
      saveLayout(activeWidgetIds, next, sizes, isLocked);
      return next;
    });
  };

  const cycleSize = (id: string) => {
    if (isLocked) return;
    setSizes(prev => {
      const current = prev[id] || 'md';
      const nextSize: 'sm' | 'md' | 'lg' = current === 'sm' ? 'md' : current === 'md' ? 'lg' : 'sm';
      const next: { [key: string]: 'sm' | 'md' | 'lg' } = { ...prev, [id]: nextSize };
      saveLayout(activeWidgetIds, positions, next, isLocked);
      addLog('System', `Resized widget [${id.toUpperCase()}] to [${nextSize.toUpperCase()}]`);
      return next;
    });
  };

  const resetLayout = () => {
    const defaultPos = {
      diag: { x: 30, y: 30 },
      radar: { x: 340, y: 30 },
      weather: { x: 30, y: 250 },
      bulletin: { x: 340, y: 250 }
    };
    const defaultSizes = { diag: 'md' as const, radar: 'md' as const, weather: 'md' as const, bulletin: 'md' as const };
    setPositions(defaultPos);
    setSizes(defaultSizes);
    setActiveWidgetIds(['diag', 'radar', 'weather', 'bulletin']);
    setIsLocked(false);
    saveLayout(['diag', 'radar', 'weather', 'bulletin'], defaultPos, defaultSizes, false);
    addLog('System', 'Reset HUD telemetry grid coordinates to default.');
  };

  const getWidgetDimensions = (widget: Widget) => {
    const size = sizes[widget.id] || 'md';
    let multiplier = 1;
    if (size === 'sm') multiplier = 0.8;
    if (size === 'lg') multiplier = 1.25;

    return {
      width: Math.round(widget.defaultWidth * multiplier),
      height: Math.round(widget.defaultHeight * multiplier)
    };
  };

  return (
    <div className="relative w-full h-full min-h-[520px] glass-panel border border-white/10 rounded-3xl overflow-hidden flex flex-col p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-3 mb-4 gap-3">
        <div>
          <h3 className="text-sm font-mono uppercase tracking-widest text-neon-cyan flex items-center gap-2">
            <Maximize2 className="w-4 h-4" /> Gesture HUD Workspace
          </h3>
          <p className="text-[10px] font-mono text-white/40 mt-0.5">DRAG & REPOSITION FLOATING HUD COMMAND WIDGETS</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {WIDGET_TEMPLATES.map(w => {
            const Icon = w.icon;
            const isActive = activeWidgetIds.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={`px-2 py-1 rounded-lg border font-mono text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
                    : 'border-white/10 bg-white/2 text-white/40 hover:text-white/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {w.title.split(' ')[0]}
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <button
            onClick={() => {
              const nextLock = !isLocked;
              setIsLocked(nextLock);
              saveLayout(activeWidgetIds, positions, sizes, nextLock);
              addLog('System', `HUD widgets positioning ${nextLock ? 'LOCKED' : 'UNLOCKED'}.`);
            }}
            className={`p-1.5 rounded-lg border transition-all ${
              isLocked 
                ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' 
                : 'border-white/10 hover:bg-white/5 text-white/60'
            }`}
            title={isLocked ? 'Unlock Layout Coordinates' : 'Lock Layout Coordinates'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={resetLayout}
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/60 transition-all"
            title="Reset Widgets Layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 w-full bg-[#03030c] relative rounded-2xl overflow-hidden grid-bg border border-white/5 min-h-[400px]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5">
          <span className="text-3xl font-mono uppercase tracking-widest text-electric-blue">COMMANDER GRID SHELL</span>
        </div>

        {WIDGET_TEMPLATES.map((widget, idx) => {
          if (!activeWidgetIds.includes(widget.id)) return null;
          const WidgetIcon = widget.icon;
          const { width, height } = getWidgetDimensions(widget);
          const currentPos = positions[widget.id] || { x: 30 + idx * 40, y: 30 + idx * 30 };
          const sizeLabel = sizes[widget.id] || 'md';

          return (
            <motion.div
              key={widget.id}
              drag={!isLocked}
              dragConstraints={containerRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const nextX = currentPos.x + info.offset.x;
                const nextY = currentPos.y + info.offset.y;
                updatePosition(widget.id, nextX, nextY);
              }}
              initial={false}
              animate={{
                x: currentPos.x,
                y: currentPos.y,
                width,
                height
              }}
              whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing' }}
              className="absolute glass-panel-glow border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col justify-between overflow-hidden"
              style={{
                touchAction: 'none'
              }}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 select-none cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-1.5">
                  <WidgetIcon className={`w-3.5 h-3.5 ${widget.color} ${!isLocked ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-mono font-bold text-white/90 truncate max-w-[130px] uppercase">
                    {widget.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => cycleSize(widget.id)}
                    disabled={isLocked}
                    className={`p-1 rounded text-white/30 hover:text-neon-cyan transition-colors disabled:opacity-30 flex items-center gap-0.5`}
                    title="Cycle Widget Sizing"
                  >
                    <Sliders className="w-2.5 h-2.5" />
                    <span className="text-[7px] font-mono uppercase">{sizeLabel}</span>
                  </button>

                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className="text-white/30 hover:text-warning-red transition-colors p-1"
                    title="Remove Widget"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[9px] flex flex-col gap-2">
                {widget.id === 'diag' && (
                  <>
                    <div className="flex justify-between items-center text-white/60">
                      <span>GEMINI SUITE INDEX:</span>
                      <span className="text-success-green font-bold">14ms</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span>BIGQUERY QUEUES:</span>
                      <span className="text-neon-cyan font-bold">0 Active</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span>SECURE WEB TELEMETRY:</span>
                      <span className="text-success-green font-bold">ONLINE</span>
                    </div>
                  </>
                )}
                {widget.id === 'radar' && (
                  <div className="flex-1 flex items-center justify-center relative min-h-[90px] overflow-hidden">
                    <div className="absolute w-20 h-20 rounded-full border border-neon-cyan/20 flex items-center justify-center">
                      <div className="absolute w-12 h-12 rounded-full border border-neon-cyan/10" />
                      <div className="w-1 h-1 bg-neon-cyan rounded-full animate-ping" />
                    </div>
                  </div>
                )}
                {widget.id === 'bulletin' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="border-l-2 border-warning-red pl-1.5">
                      <p className="font-bold text-white uppercase">Red Alert Cal Fire</p>
                      <p className="text-[8px] text-white/50">Winds increasing at coastlines.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
