import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AreaZone, CommunityReport, Shelter } from '../types';
import { Layers, ShieldCheck, AlertTriangle, Home, MapPin, Eye, Compass, CloudRain } from 'lucide-react';

interface RiskMapProps {
  zones: AreaZone[];
  shelters: Shelter[];
  reports: CommunityReport[];
  selectedZone: AreaZone | null;
  onSelectZone: (zone: AreaZone) => void;
  showEvacuationRoute?: boolean;
  filterRisk?: 'all' | 'critical' | 'high' | 'medium' | 'low';
}

export const RiskMap: React.FC<RiskMapProps> = ({
  zones,
  shelters,
  reports,
  selectedZone,
  onSelectZone,
  showEvacuationRoute = true,
  filterRisk = 'all',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [showShelters, setShowShelters] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showRoutes, setShowRoutes] = useState(showEvacuationRoute);
  const [radarEffect, setRadarEffect] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Wayanad Highland sector
    const map = L.map(mapContainerRef.current, {
      center: [11.6085, 76.1280],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom OpenStreetMap / Carto Dark Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Draw Risk Zones
    zones
      .filter((zone) => {
        if (filterRisk === 'all') return true;
        if (filterRisk === 'critical') return zone.riskLevel === 'critical';
        if (filterRisk === 'high') return zone.riskLevel === 'high';
        if (filterRisk === 'medium') return zone.riskLevel === 'medium';
        if (filterRisk === 'low') return zone.riskLevel === 'low';
        return true;
      })
      .forEach((zone) => {
        const isSelected = selectedZone?.id === zone.id;
        const color =
          zone.riskLevel === 'critical'
            ? '#ef4444'
            : zone.riskLevel === 'high'
            ? '#f97316'
            : zone.riskLevel === 'medium'
            ? '#eab308'
            : '#22c55e';

        const fillColor =
          zone.riskLevel === 'critical'
            ? '#dc2626'
            : zone.riskLevel === 'high'
            ? '#ea580c'
            : zone.riskLevel === 'medium'
            ? '#ca8a04'
            : '#16a34a';

        // Draw hazard buffer circle
        const circle = L.circle(zone.coordinates, {
          radius: zone.riskScore > 80 ? 2800 : zone.riskScore > 50 ? 2200 : 1600,
          color: color,
          weight: isSelected ? 3 : 2,
          opacity: 0.85,
          fillColor: fillColor,
          fillOpacity: zone.riskLevel === 'critical' ? 0.35 : 0.22,
          dashArray: zone.riskLevel === 'critical' ? '4, 4' : undefined,
        });

        circle.on('click', () => {
          onSelectZone(zone);
        });

        circle.addTo(layers);

        // Custom HTML Marker Pin
        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${
              zone.riskLevel === 'critical'
                ? `<div class="absolute w-12 h-12 rounded-full bg-red-500/30 animate-ping"></div>`
                : ''
            }
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border-2 text-white font-bold text-xs transition-transform hover:scale-110 ${
              isSelected ? 'ring-4 ring-white scale-110' : ''
            }" style="background-color: ${color}; border-color: #ffffff;">
              <span>${zone.riskScore}</span>
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap bg-slate-900/90 backdrop-blur-sm text-slate-100 text-[11px] font-semibold px-2 py-0.5 rounded shadow border border-slate-700 pointer-events-none">
              ${zone.name}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-risk-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker(zone.coordinates, { icon: customIcon });

        marker.bindPopup(`
          <div class="p-2 space-y-2 min-w-[240px]">
            <div class="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span class="font-bold text-sm text-white">${zone.name}</span>
              <span class="px-2 py-0.5 text-xs font-semibold rounded uppercase ${
                zone.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                zone.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                zone.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }">${zone.riskLevel} (${zone.riskScore}/100)</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5 text-xs text-slate-300">
              <div>🌧️ Rain 24h: <strong class="text-white">${zone.rainfall24h}mm</strong></div>
              <div>💧 Soil Moisture: <strong class="text-white">${zone.soilMoisture}%</strong></div>
              <div>📐 Slope: <strong class="text-white">${zone.slopeDegrees}°</strong></div>
              <div>👥 Pop: <strong class="text-white">${zone.population.toLocaleString()}</strong></div>
            </div>
            <p class="text-xs text-slate-300 line-clamp-2 bg-slate-800/60 p-1.5 rounded border border-slate-700">
              ${zone.xaiExplanation}
            </p>
            <button id="btn-zone-${zone.id}" class="w-full mt-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-1.5 px-3 rounded transition-colors text-center cursor-pointer">
              Inspect AI Telemetry & Safety Actions
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-zone-${zone.id}`);
          if (btn) {
            btn.onclick = () => onSelectZone(zone);
          }
        });

        marker.addTo(layers);
      });

    // 2. Draw Safe Shelters
    if (showShelters) {
      shelters.forEach((shelter) => {
        const shelterHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap bg-emerald-950 text-emerald-200 text-[10px] font-medium px-1.5 py-0.5 rounded shadow border border-emerald-700 pointer-events-none">
              ${shelter.name.split(' ')[0]}
            </div>
          </div>
        `;

        const shelterIcon = L.divIcon({
          html: shelterHtml,
          className: 'custom-shelter-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(shelter.coordinates, { icon: shelterIcon });
        marker.bindPopup(`
          <div class="p-2 space-y-1.5 min-w-[220px]">
            <div class="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <span>${shelter.name}</span>
            </div>
            <div class="text-xs text-slate-300">${shelter.address}</div>
            <div class="bg-slate-800/80 p-2 rounded text-xs space-y-1">
              <div class="flex justify-between">
                <span>Capacity:</span>
                <span class="font-bold text-white">${shelter.occupied} / ${shelter.capacity} (${Math.round((shelter.occupied / shelter.capacity) * 100)}%)</span>
              </div>
              <div class="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div class="bg-emerald-400 h-full" style="width: ${(shelter.occupied / shelter.capacity) * 100}%"></div>
              </div>
              <div class="text-[11px] text-slate-400 pt-1">
                📞 Emergency Desk: <strong>${shelter.contactPhone}</strong>
              </div>
            </div>
          </div>
        `);
        marker.addTo(layers);
      });
    }

    // 3. Draw Community Reports
    if (showReports) {
      reports.forEach((rep) => {
        const reportColor = rep.severity === 'critical' ? '#ef4444' : rep.severity === 'high' ? '#f97316' : '#eab308';
        const reportHtml = `
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md border border-white animate-bounce" style="background-color: ${reportColor};">
            ⚠️
          </div>
        `;
        const repIcon = L.divIcon({
          html: reportHtml,
          className: 'custom-report-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(rep.coordinates, { icon: repIcon });
        marker.bindPopup(`
          <div class="p-2 space-y-1.5 min-w-[200px]">
            <div class="flex items-center justify-between text-xs font-bold text-white">
              <span>${rep.type.replace('_', ' ').toUpperCase()}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">${rep.timestamp}</span>
            </div>
            <p class="text-xs text-slate-200">${rep.description}</p>
            <div class="text-[10px] text-slate-400">Reporter: ${rep.reporterName} ${rep.isVerifiedCitizen ? '✓ (Verified)' : ''}</div>
          </div>
        `);
        marker.addTo(layers);
      });
    }

    // 4. Draw Evacuation Routes (from Critical/High zones to nearest open shelters)
    if (showRoutes && selectedZone) {
      const nearestShelter = selectedZone.sheltersNearby?.[0] || shelters[0];
      if (nearestShelter) {
        const routeLine = L.polyline([selectedZone.coordinates, nearestShelter.coordinates], {
          color: '#10b981',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85,
        });
        routeLine.bindTooltip(`Safe Evacuation Route to ${nearestShelter.name}`, { sticky: true });
        routeLine.addTo(layers);
      }
    }
  }, [zones, shelters, reports, selectedZone, filterRisk, showShelters, showReports, showRoutes]);

  // Center on selected zone
  useEffect(() => {
    if (selectedZone && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedZone.coordinates, 13, {
        duration: 1.2,
      });
    }
  }, [selectedZone]);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] z-0" />

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow-xl text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-200 pr-2 border-r border-slate-700">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Layers:</span>
        </div>

        <button
          onClick={() => setShowShelters(!showShelters)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium ${
            showShelters ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Safe Shelters</span>
        </button>

        <button
          onClick={() => setShowReports(!showReports)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium ${
            showReports ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Citizen Reports</span>
        </button>

        <button
          onClick={() => setShowRoutes(!showRoutes)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium ${
            showRoutes ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Evac Routes</span>
        </button>

        <button
          onClick={() => setRadarEffect(!radarEffect)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium ${
            radarEffect ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>Doppler Radar</span>
        </button>
      </div>

      {/* Weather Radar Sweep Effect Simulation */}
      {radarEffect && (
        <div className="pointer-events-none absolute inset-0 z-5 overflow-hidden opacity-20">
          <div className="w-[180%] h-[180%] -left-[40%] -top-[40%] absolute rounded-full border border-cyan-400/30 animate-radar bg-gradient-to-tr from-transparent via-cyan-500/10 to-transparent"></div>
        </div>
      )}

      {/* Risk Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5">
        <div className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">Hazard Risk Scale</div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-400/40"></span>
          <span>Critical / High Hazard (60 - 100)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-400/40"></span>
          <span>Medium Risk / Caution (35 - 59)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40"></span>
          <span>Low Risk / Safe Zone (0 - 34)</span>
        </div>
      </div>
    </div>
  );
};
