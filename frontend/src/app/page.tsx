'use client';

import React from 'react';
import Link from 'next/link';
import CanvasGlobe from '../components/CanvasGlobe';
import { Shield, Target, Cpu, CloudLightning, Activity, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050510] text-slate-100 flex flex-col items-center justify-between overflow-hidden">
      {/* Background vector grids */}
      <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-electric-blue/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-neon-cyan/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl px-8 py-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.4)]">
            <Shield className="w-5 h-5 text-neon-cyan" />
          </div>
          <span className="font-mono text-lg font-bold tracking-widest bg-gradient-to-r from-white via-slate-100 to-neon-cyan bg-clip-text text-transparent">
            RESILISHIELD AI
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="glass-panel px-4 py-2 rounded-xl text-xs font-mono tracking-widest text-neon-cyan border border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/20 transition-all uppercase">
            Initialize HUD Console ❯
          </Link>
        </nav>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-7xl px-8 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-16">
        {/* Left: Text & CTA */}
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-neon-cyan uppercase">AUTONOMOUS ORCHESTRATION LAYER</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1] font-sans">
            Next-Gen Autonomous <br />
            <span className="bg-gradient-to-r from-neon-cyan via-electric-blue to-purple-500 bg-clip-text text-transparent">
              Disaster Response
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
            ResiliShield AI is an intelligent coordination platform orchestrating autonomous subagents, real-time Gemini threat analysis, and BigQuery response recommendations to mitigate disasters in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-neon-cyan text-black font-bold font-mono tracking-wider text-xs uppercase hover:bg-neon-cyan/85 hover:shadow-[0_0_25px_#00F3FF] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" /> Deploy Operations
            </Link>
            
            <a
              href="#architecture"
              className="px-8 py-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 transition-all font-bold font-mono text-xs uppercase text-center flex items-center justify-center"
            >
              Read Spec
            </a>
          </div>

          {/* Stats Overlay */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 mt-4 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-xl font-mono font-bold text-white">99.8%</p>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-1">Resolution Rate</p>
            </div>
            <div>
              <p className="text-xl font-mono font-bold text-neon-cyan">2.1s</p>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-1">Dispatch Speed</p>
            </div>
            <div>
              <p className="text-xl font-mono font-bold text-success-green">0.5m</p>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-1">Average ETA</p>
            </div>
          </div>
        </div>

        {/* Right: Floating Canvas Globe */}
        <div className="w-full flex items-center justify-center relative min-h-[400px]">
          <div className="absolute inset-0 bg-radial-at-c from-electric-blue/10 to-transparent pointer-events-none" />
          <div className="w-[380px] h-[380px] relative glass-panel-glow border border-white/5 rounded-full p-2 animate-float">
            <CanvasGlobe />
          </div>
        </div>
      </main>

      {/* Interactive Core Architecture Section */}
      <section id="architecture" className="w-full border-t border-white/5 bg-[#03030b] relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-8 flex flex-col gap-10">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-xs font-mono text-neon-cyan uppercase tracking-widest mb-2">Technical Overview</h2>
            <h3 className="text-2xl font-semibold text-white tracking-tight">System Data Telemetry Flow</h3>
            <p className="text-slate-500 text-xs mt-2 font-mono">AUTONOMOUS ORCHESTRATION PIPELINE SPEC</p>
          </div>

          {/* Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 glass-panel rounded-2xl border border-white/5 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-neon-cyan font-bold">STAGE 01</span>
              <h4 className="text-xs font-bold font-mono uppercase text-white tracking-wider">Ingestion scanner</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Drag-and-drop satellite imaging, audio streams, and drone scans are fed directly into the intake engine.
              </p>
            </div>

            <div className="p-5 glass-panel rounded-2xl border border-white/5 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-[#BD00FF] font-bold">STAGE 02</span>
              <h4 className="text-xs font-bold font-mono uppercase text-white tracking-wider">Gemini analyzer</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Vertex AI executes model classifications, assessing structural load, damage indices, and human thermal traces.
              </p>
            </div>

            <div className="p-5 glass-panel rounded-2xl border border-white/5 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-electric-blue font-bold">STAGE 03</span>
              <h4 className="text-xs font-bold font-mono uppercase text-white tracking-wider">BigQuery routing</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Proximity algorithms query resource database pools to isolate nearest ambulances, clinics, and helipads.
              </p>
            </div>

            <div className="p-5 glass-panel rounded-2xl border border-white/5 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-success-green font-bold">STAGE 04</span>
              <h4 className="text-xs font-bold font-mono uppercase text-white tracking-wider">Autonomous mitigation</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Subagents execute targeted directives—shutting down grid panels, firing warnings, and routing squads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl px-8 py-6 flex items-center justify-between border-t border-white/5 text-[9px] font-mono text-slate-600 relative z-10 bg-[#050510]/80">
        <span>© {new Date().getFullYear()} RESILISHIELD AI INC. ALL RIGHTS RESERVED.</span>
        <span>DEPLOYMENT STATUS: SECURE TELEMETRY ACTIVE</span>
      </footer>
    </div>
  );
}
