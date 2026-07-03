'useRef';
'useEffect';

import React, { useEffect, useRef } from 'react';
import { useStore, TerminalLog } from '../store/useStore';
import { Terminal, Trash2 } from 'lucide-react';

export default function TerminalLogs() {
  const { logs, clearLogs } = useStore();
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (sender: TerminalLog['sender']) => {
    switch (sender) {
      case 'Gemini':
        return 'text-neon-cyan';
      case 'BigQuery':
        return 'text-electric-blue';
      case 'Agent':
        return 'text-orange-400';
      case 'SUCCESS':
        return 'text-success-green font-bold';
      case 'WARNING':
        return 'text-warning-red font-bold animate-pulse';
      case 'AI':
        return 'text-[#BD00FF]';
      default:
        return 'text-white/60';
    }
  };

  return (
    <div className="glass-panel border border-white/10 rounded-2xl flex flex-col h-full bg-[#03030d] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Console Header */}
      <div className="bg-black/40 border-b border-white/5 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">Command Telemetry Stream</span>
        </div>
        <button
          onClick={clearLogs}
          className="text-white/40 hover:text-white/80 transition-colors p-1"
          title="Clear console log stream"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Log Feed */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar font-mono text-[10px] flex flex-col gap-1.5 min-h-[120px] max-h-[220px]">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 items-start leading-relaxed border-b border-white/2 pb-1">
            <span className="text-white/30">[{log.timestamp}]</span>
            <span className={`uppercase font-bold ${getLogColor(log.sender)}`}>
              {log.sender === 'System' ? 'SYS' : log.sender === 'Gemini' ? 'GEM' : log.sender === 'BigQuery' ? 'BQ' : log.sender === 'Agent' ? 'AGT' : log.sender}
            </span>
            <span className="text-white/30">❯</span>
            <span className="text-white/90 flex-1 break-all select-all">{log.message}</span>
          </div>
        ))}
        {/* Pulsing blinking command prompt cursor */}
        <div className="flex gap-2 items-center text-white/40">
          <span>[{new Date().toLocaleTimeString()}]</span>
          <span>SYS</span>
          <span>❯</span>
          <span className="w-1.5 h-3 bg-neon-cyan animate-pulse" />
        </div>
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
}
