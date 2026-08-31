import React, { useState } from 'react';
import { EvacuationRouteOption, Shelter } from '../types';
import { INITIAL_EVACUATION_ROUTES } from '../lib/mockData';
import { 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Footprints, 
  Mountain, 
  Compass, 
  CheckCircle2, 
  Download, 
  Layers, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface EvacuationRoutePlannerProps {
  shelters: Shelter[];
  onNavigateToShelter?: (shelterId: string) => void;
}

export const EvacuationRoutePlanner: React.FC<EvacuationRoutePlannerProps> = ({
  shelters,
  onNavigateToShelter,
}) => {
  const [routes] = useState<EvacuationRouteOption[]>(INITIAL_EVACUATION_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(INITIAL_EVACUATION_ROUTES[0].id);
  const [downloadedGpx, setDownloadedGpx] = useState(false);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const handleDownloadOfflineRoute = () => {
    const routeData = JSON.stringify(selectedRoute, null, 2);
    const blob = new Blob([routeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evacuation-route-${selectedRoute.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedGpx(true);
    setTimeout(() => setDownloadedGpx(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>AI Dynamic Hazard Avoidance Navigation</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Multi-Hazard Evacuation Route Calculator
          </h3>
          <p className="text-xs text-slate-400">
            Calculates high-ground escape routes strictly bypassing saturated debris flow gullies and flooded bridges.
          </p>
        </div>

        <button
          onClick={handleDownloadOfflineRoute}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>{downloadedGpx ? 'Route Saved Offline!' : 'Cache Offline Route'}</span>
        </button>
      </div>

      {/* Route Cards Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-slate-950 border-emerald-500 shadow-xl ring-2 ring-emerald-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{route.title}</span>
                    {route.isRecommended && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>To: {route.shelterName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">Safety Index</div>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    {route.safetyScore}/100
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 text-center font-mono">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Distance</div>
                  <div className="text-xs font-bold text-slate-200">{route.distanceKm} km</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Est. Walk</div>
                  <div className="text-xs font-bold text-amber-400">{route.estWalkTimeMin} mins</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Elevation</div>
                  <div className="text-xs font-bold text-cyan-400">+{route.elevationGain}m</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Detailed Briefing & Waypoints */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Hazard Mitigation & Route Intelligence</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Highland Bedrock Corridor</span>
        </div>

        <div className="space-y-2">
          {selectedRoute.hazardAvoidanceNotes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>

        {/* Step-by-Step Waypoint Guidance */}
        <div className="border-t border-slate-900 pt-4 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">
            Turn-by-Turn Waypoints & Compass Bearings:
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold font-mono text-[10px] shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">Depart Origin High Ground</div>
                <div className="text-slate-400 text-[11px]">Follow state highway ridge path (Bearing 290° WNW) for 600m.</div>
              </div>
              <span className="font-mono text-emerald-400 text-[11px]">Safe</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold font-mono text-[10px] shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">Rubber Plantation Plateau Bypass</div>
                <div className="text-slate-400 text-[11px]">Stay on paved elevated road. Avoid descending into tea factory drainage ravine.</div>
              </div>
              <span className="font-mono text-emerald-400 text-[11px]">800m</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold font-mono text-[10px] shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">Arrival at {selectedRoute.shelterName}</div>
                <div className="text-slate-400 text-[11px]">Check-in at Registration Desk A for relief supplies and medical triage.</div>
              </div>
              <span className="font-mono text-cyan-400 text-[11px]">Destination</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
