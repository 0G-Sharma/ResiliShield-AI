'useRef';
'useState';
'useEffect';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Mic, Send, MessageSquare, X, Volume2, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_QUERIES = [
  'Query medical beds available near SOMA',
  'Isolate power grid zones around Mission',
  'Retrieve status report for Marina District flood'
];

export default function VoiceAssistant() {
  const { 
    chatMessages, 
    addChatMessage, 
    chatOpen, 
    setChatOpen, 
    voiceActive, 
    setVoiceActive, 
    addLog,
    resources,
    incidents
  } = useStore();

  const [inputVal, setInputVal] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatOpen]);

  const processChatCommand = (query: string) => {
    addChatMessage('user', query);
    setInputVal('');
    addLog('System', `Voice agent processing instruction: "${query}"`);

    setTimeout(() => {
      let reply = "I'm analyzing the telemetry database to resolve this query. Please standby.";
      const clean = query.toLowerCase();

      if (clean.includes('bed') || clean.includes('medical') || clean.includes('hospital')) {
        const hospitals = resources.filter(r => r.type === 'hospital');
        const hospitalStatus = hospitals.map(h => `${h.name} is at ${h.capacity} capacity`).join(', ');
        reply = `Retrieved medical facility capacities from BigQuery: ${hospitalStatus || 'No hospitals identified inside active zones.'}`;
      } else if (clean.includes('power') || clean.includes('grid') || clean.includes('isolate')) {
        reply = "Volt Guard subagent indicates high-voltage substations in SOMA sector 4-B have been successfully isolated. Backup power routed to SOMA trauma center.";
      } else if (clean.includes('marina') || clean.includes('flood') || clean.includes('report')) {
        const floodInc = incidents.find(i => i.type === 'flood' || i.location.toLowerCase().includes('marina'));
        if (floodInc) {
          reply = `Gemini Intelligence Report for Marina Flood: Severity is ${floodInc.severity}/10. Risk levels are CRITICAL. Evacuation corridors have been dispatched.`;
        } else {
          reply = "Currently monitoring Marina sector. No major telemetry overflow indicators reported within the last 15 minutes.";
        }
      }

      addChatMessage('assistant', reply);
      addLog('Gemini', `Voice assistant response emitted.`);
      
      // Play a high-tech beep sound if speech synthesis is desired
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && voiceActive) {
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    }, 1000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    processChatCommand(inputVal.trim());
  };

  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog('WARNING', 'Speech recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceActive(true);
      addLog('System', 'Voice commander active. Capture stream streaming...');
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      addLog('System', `Voice parsed: "${speechToText}"`);
      processChatCommand(speechToText);
    };

    recognition.onerror = () => {
      setVoiceActive(false);
      addLog('WARNING', 'Voice command capture timed out or encountered error.');
    };

    recognition.onend = () => {
      setVoiceActive(false);
    };

    recognition.start();
  };

  const toggleVoiceMode = () => {
    const nextState = !voiceActive;
    if (nextState) {
      startSpeechRecognition();
    } else {
      setVoiceActive(false);
      addLog('System', 'Voice command capture offline.');
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={toggleVoiceMode}
          className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-2xl transition-all ${
            voiceActive
              ? 'border-warning-red bg-warning-red/20 text-warning-red shadow-[0_0_20px_rgba(255,0,85,0.4)] animate-pulse'
              : 'border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/35 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]'
          }`}
          title="Toggle Voice Assistant"
        >
          <Mic className="w-5.5 h-5.5" />
        </button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white shadow-2xl transition-all flex items-center justify-center"
        >
          {chatOpen ? <X className="w-5.5 h-5.5" /> : <MessageSquare className="w-5.5 h-5.5 text-neon-cyan" />}
        </button>
      </div>

      {/* Floating Chat Box Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-22 right-6 w-90 h-112 glass-panel-glow border border-neon-cyan/20 rounded-2xl flex flex-col shadow-2xl z-50 overflow-hidden"
          >
            {/* Box Header */}
            <div className="bg-black/60 border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-neon-cyan" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">Emergency Voice Core</span>
              </div>
              {voiceActive && (
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-success-green animate-bounce" />
                  <span className="text-[8px] font-mono text-success-green uppercase">Audio feedback active</span>
                </span>
              )}
            </div>

            {/* Simulated Voice wave ripple when listening */}
            {voiceActive && (
              <div className="bg-warning-red/5 py-1.5 px-4 flex items-center justify-center gap-2 border-b border-white/5 overflow-hidden">
                <span className="text-[8px] font-mono text-warning-red uppercase tracking-widest animate-pulse">MIC Telemetry streaming</span>
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-warning-red rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 h-5 bg-warning-red rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 h-2 bg-warning-red rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1 h-4 bg-warning-red rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto no-scrollbar flex flex-col gap-3 bg-black/20">
              {chatMessages.map((msg, i) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={i}
                    className={`flex gap-2 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                  >
                    <div className={`p-1.5 rounded-full border ${
                      isUser ? 'border-neon-cyan/40 bg-neon-cyan/5 text-neon-cyan' : 'border-white/10 bg-white/5 text-white/40'
                    } h-fit`}>
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div className={`p-2.5 rounded-2xl border text-xs leading-relaxed ${
                      isUser
                        ? 'bg-neon-cyan/5 border-neon-cyan/20 text-white rounded-tr-none'
                        : 'bg-white/2 border-white/5 text-white/80 rounded-tl-none'
                    }`}>
                      {msg.text}
                      <span className="text-[7px] font-mono text-white/30 block mt-1 text-right">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Preset Query Chips */}
            <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex flex-col gap-1.5">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Select Tactical Query</span>
              <div className="flex flex-col gap-1">
                {PRESET_QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => processChatCommand(q)}
                    className="p-1 text-left border border-white/5 hover:border-neon-cyan/25 hover:bg-neon-cyan/5 rounded text-[9px] font-mono text-neon-cyan truncate transition-all"
                  >
                    ❯ {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Text input form */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black flex gap-2">
              <input
                type="text"
                placeholder="Type query override command..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 bg-white/3 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-neon-cyan"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-lg bg-neon-cyan hover:bg-neon-cyan/80 text-black flex items-center justify-center transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
