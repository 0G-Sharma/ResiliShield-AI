'useRef';
'useState';

import React from 'react';
import { useStore, Resource } from '../store/useStore';
import { Truck, Activity, ShieldCheck, MapPin, Compass, Navigation } from 'lucide-react';

export default function ResourceRecommender() {
  const { resources, selectedIncident, updateResourceStatus, addLog } = useStore();

  const handleManualDispatch = (resourceId: string, resourceName: string) => {
    updateResourceStatus(resourceId, 'dispatched');
    addLog('BigQuery', `Direct commander manual dispatch initiated for: [${resourceName}]`);
    addLog('SUCCESS', `Asset [${resourceName}] confirmed en route. Telemetry updated.`);
  };

  // Sort resources by distance. If an incident is active, we simulate the distance relative to the incident center.
  const sortedResources = [...resources].sort((a, b) => {
    return a.distance - b.distance;
  });

  return (
    <div className="glass-panel border border-white/10 p-5 rounded-2xl flex flex-col h-full gap-4 shadow-[0_0_30px_rgba(0,102,255,0.05)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-mono uppercase tracking-widest text-neon-cyan flex items-center gap-2">
          <Navigation className="w-4 h-4 animate-pulse" /> Resource Allocator
        </h3>
        <span className="text-[10px] font-mono text-white/40">BIGQUERY DEPLOYMENT MODEL</span>
      </div>

      {selectedIncident && (
        <div className="bg-electric-blue/10 border border-electric-blue/30 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[9px] font-mono text-neon-cyan uppercase font-bold">Proximity Targeting Active</span>
          <p className="text-[11px] text-white/80 leading-snug">
            Emergency assets ranked by distance to target: <span className="font-bold text-white">{selectedIncident.location}</span>.
          </p>
        </div>
      )}

      {/* List of assets */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[300px]">
        {sortedResources.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <span className="text-xs text-white/40 font-mono">Telemetry database offline. Select or report an incident to query.</span>
          </div>
        ) : (
          sortedResources.map((res) => {
            const isAvailable = res.availability === 'available';
            const isDispatched = res.availability === 'dispatched';

            return (
              <div
                key={res.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all bg-white/2 ${
                  isDispatched
                    ? 'border-success-green/30 bg-success-green/2'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Left side details */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    res.type === 'hospital' 
                      ? 'bg-neon-cyan/15 text-neon-cyan' 
                      : res.type === 'fire_station' 
                      ? 'bg-warning-red/15 text-warning-red' 
                      : 'bg-electric-blue/15 text-electric-blue'
                  }`}>
                    {res.type === 'hospital' && <Activity className="w-4 h-4" />}
                    {res.type === 'fire_station' && <Truck className="w-4 h-4" />}
                    {res.type === 'police_station' && <ShieldCheck className="w-4 h-4" />}
                    {res.type === 'shelter' && <MapPin className="w-4 h-4" />}
                    {res.type === 'drone' && <Compass className="w-4 h-4" />}
                    {res.type === 'rescue_unit' && <Truck className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white tracking-wide leading-tight truncate max-w-[170px]">{res.name}</span>
                    <span className="text-[9px] font-mono text-white/40 mt-0.5">
                      ETA: {res.eta} | Proximity: {res.distance} km
                    </span>
                    <span className="text-[9px] font-mono text-white/40">
                      Capacity: {res.capacity}
                    </span>
                  </div>
                </div>

                {/* Right side trigger button */}
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full border ${
                    isDispatched
                      ? 'bg-success-green/10 border-success-green/30 text-success-green'
                      : isAvailable
                      ? 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    {isDispatched ? 'EN ROUTE' : 'STANDBY'}
                  </span>

                  {isAvailable && (
                    <button
                      onClick={() => handleManualDispatch(res.id, res.name)}
                      className="text-[9px] font-mono uppercase bg-neon-cyan/10 border border-neon-cyan/30 px-2 py-0.5 rounded hover:bg-neon-cyan hover:text-black transition-all font-bold"
                    >
                      Dispatch
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
