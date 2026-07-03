'useRef';
'useState';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';

const severityTrendsData = [
  { day: '06-27', Fire: 3, Flood: 1, Landslide: 0 },
  { day: '06-28', Fire: 4, Flood: 2, Landslide: 1 },
  { day: '06-29', Fire: 6, Flood: 5, Landslide: 2 },
  { day: '06-30', Fire: 8, Flood: 4, Landslide: 3 },
  { day: '07-01', Fire: 5, Flood: 6, Landslide: 4 },
  { day: '07-02', Fire: 9, Flood: 8, Landslide: 5 },
  { day: '07-03', Fire: 7, Flood: 9, Landslide: 6 }
];

const responseTimeData = [
  { name: 'Fire Engine', dispatch: 2.4, arrival: 4.8 },
  { name: 'Ambulance', dispatch: 1.8, arrival: 5.2 },
  { name: 'Police Cruiser', dispatch: 1.1, arrival: 3.5 },
  { name: 'Rescue Drone', dispatch: 0.5, arrival: 2.1 },
  { name: 'Helicopter', dispatch: 3.5, arrival: 8.4 }
];

const severityDistribution = [
  { name: 'Level 8-10 (Critical)', value: 4, color: '#FF0055' },
  { name: 'Level 5-7 (High)', value: 8, color: '#FF9900' },
  { name: 'Level 1-4 (Medium)', value: 12, color: '#00F3FF' }
];

export default function AnalyticsHUD() {
  return (
    <div className="glass-panel border border-white/10 p-5 rounded-2xl flex flex-col h-full gap-5 shadow-[0_0_30px_rgba(0,102,255,0.05)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-mono uppercase tracking-widest text-neon-cyan flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Operations Analytics
        </h3>
        <span className="text-[10px] font-mono text-white/40">REAL-TIME TELEMETRY PLOT</span>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {/* Chart 1: Proximity/Response Delay Area Chart */}
        <div className="p-4 border border-white/5 bg-white/2 rounded-2xl flex flex-col gap-2 min-h-[220px]">
          <span className="text-[10px] font-mono text-white/60 flex items-center gap-1.5 uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-neon-cyan" /> Severity Trends Index
          </span>
          <div className="flex-1 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={severityTrendsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFire" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0055" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF0055" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFlood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
                <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ background: 'rgba(5,5,15,0.95)', border: '1px solid rgba(0,243,255,0.2)', fontSize: '9px', fontFamily: 'monospace', color: '#fff' }} />
                <Area type="monotone" dataKey="Fire" stroke="#FF0055" strokeWidth={1.5} fillOpacity={1} fill="url(#colorFire)" />
                <Area type="monotone" dataKey="Flood" stroke="#0066FF" strokeWidth={1.5} fillOpacity={1} fill="url(#colorFlood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Asset Dispatch Latency Bar Chart */}
        <div className="p-4 border border-white/5 bg-white/2 rounded-2xl flex flex-col gap-2 min-h-[220px]">
          <span className="text-[10px] font-mono text-white/60 flex items-center gap-1.5 uppercase">
            <Activity className="w-3.5 h-3.5 text-success-green animate-pulse" /> Response Time (Min)
          </span>
          <div className="flex-1 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
                <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ background: 'rgba(5,5,15,0.95)', border: '1px solid rgba(0,243,255,0.2)', fontSize: '9px', fontFamily: 'monospace', color: '#fff' }} />
                <Bar dataKey="dispatch" fill="#00FFAA" radius={[2, 2, 0, 0]} />
                <Bar dataKey="arrival" fill="#0066FF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Distribution Donut Pie Chart */}
        <div className="p-4 border border-white/5 bg-white/2 rounded-2xl flex flex-col gap-2 min-h-[220px]">
          <span className="text-[10px] font-mono text-white/60 flex items-center gap-1.5 uppercase">
            <PieIcon className="w-3.5 h-3.5 text-orange-400" /> Hazard Proportions
          </span>
          <div className="flex-1 min-h-[140px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityDistribution.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(5,5,15,0.95)', border: '1px solid rgba(0,243,255,0.2)', fontSize: '9px', fontFamily: 'monospace', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend inside the chart or side */}
            <div className="absolute right-0 bottom-0 text-[8px] font-mono flex flex-col gap-1.5 p-1 bg-black/40 rounded border border-white/5">
              {severityDistribution.map((d, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-white/60">{d.name.split(' ')[0]}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
