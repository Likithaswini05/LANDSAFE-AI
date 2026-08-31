import React, { useState, useEffect } from 'react';
import { GeotechSensorFeed, AreaZone } from '../types';
import { INITIAL_IOT_SENSORS } from '../lib/mockData';
import { 
  Activity, 
  Radio, 
  AlertTriangle, 
  ShieldCheck, 
  Battery, 
  RefreshCw, 
  Zap, 
  Sliders, 
  CheckCircle2, 
  ArrowUpRight, 
  Waves,
  Cpu
} from 'lucide-react';

interface GeotechSensorMonitorProps {
  zones: AreaZone[];
  selectedZone: AreaZone;
  onTriggerAlarm?: (sensor: GeotechSensorFeed) => void;
}

export const GeotechSensorMonitor: React.FC<GeotechSensorMonitorProps> = ({
  zones,
  selectedZone,
  onTriggerAlarm,
}) => {
  const [sensors, setSensors] = useState<GeotechSensorFeed[]>(INITIAL_IOT_SENSORS);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>(selectedZone.id);
  const [simulatingSurge, setSimulatingSurge] = useState(false);

  // Live telemetry pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev =>
        prev.map(s => {
          // Slight jitter
          const delta = (Math.random() - 0.48) * (s.sensorType === 'acoustic_emission' ? 8 : 0.8);
          const newVal = Math.max(0, +(s.currentVal + delta).toFixed(2));
          const newWaveform = [...s.waveform.slice(1), newVal];
          
          let status: GeotechSensorFeed['status'] = 'normal';
          if (newVal >= s.thresholdCritical) status = 'critical';
          else if (newVal >= s.thresholdWarning) status = 'warning';

          return {
            ...s,
            currentVal: newVal,
            waveform: newWaveform,
            status,
            lastPacketTime: 'Just now (Live Mesh)'
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleSimulateSurge = () => {
    setSimulatingSurge(true);
    setSensors(prev =>
      prev.map(s => {
        if (s.zoneId === activeZoneFilter) {
          const surgeVal = +(s.thresholdCritical * 1.25).toFixed(2);
          return {
            ...s,
            currentVal: surgeVal,
            waveform: [...s.waveform.slice(1), surgeVal],
            status: 'critical',
            lastPacketTime: 'Just now (CRITICAL THRESHOLD BREACH)'
          };
        }
        return s;
      })
    );
    setTimeout(() => setSimulatingSurge(false), 5000);
  };

  const handleResetCalibration = () => {
    setSensors(INITIAL_IOT_SENSORS);
  };

  const filteredSensors = sensors.filter(s => s.zoneId === activeZoneFilter);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Wireless Subsurface Sensor Telemetry Stream</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            IoT Geotechnical Inclinometer & Piezometer Array
          </h3>
          <p className="text-xs text-slate-400">
            Subsurface vibrating wire pore transducers, continuous shear displacement sensors, and acoustic fracture receivers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleSimulateSurge}
            disabled={simulatingSurge}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              simulatingSurge
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{simulatingSurge ? 'Surge Injected!' : 'Simulate Pore Surge'}</span>
          </button>

          <button
            onClick={handleResetCalibration}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Reset Sensor Baselines"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Zone Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80 pt-1">
        <span className="text-xs text-slate-400 font-mono shrink-0">Sensor Cluster:</span>
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setActiveZoneFilter(zone.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeZoneFilter === zone.id
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {zone.name}
          </button>
        ))}
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSensors.map((sensor) => {
          const statusColors: Record<GeotechSensorFeed['status'], { bg: string; text: string; ring: string }> = {
            normal: { bg: 'bg-emerald-950/60 border-emerald-800/60', text: 'text-emerald-400', ring: 'border-emerald-500/20' },
            warning: { bg: 'bg-amber-950/60 border-amber-800/60', text: 'text-amber-400', ring: 'border-amber-500/20' },
            critical: { bg: 'bg-red-950/60 border-red-800/60', text: 'text-red-400', ring: 'border-red-500/40 ring-2 ring-red-500/20' },
          };
          const style = statusColors[sensor.status];

          return (
            <div
              key={sensor.sensorId}
              className={`p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3 relative overflow-hidden transition-all ${style.ring}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono text-slate-400">{sensor.sensorId}</div>
                  <div className="font-bold text-white text-sm mt-0.5">{sensor.label}</div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${style.bg} ${style.text}`}>
                  {sensor.status}
                </span>
              </div>

              {/* Value Display */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl font-black font-mono tracking-tight text-white">
                    {sensor.currentVal}
                  </span>
                  <span className="text-xs text-slate-400 font-mono ml-1.5">{sensor.unit}</span>
                </div>

                <div className="text-right text-[10px] font-mono text-slate-400">
                  <div>Warning: &gt;{sensor.thresholdWarning}{sensor.unit}</div>
                  <div className="text-red-400">Crit: &gt;{sensor.thresholdCritical}{sensor.unit}</div>
                </div>
              </div>

              {/* Sparkline Waveform */}
              <div className="h-12 w-full bg-slate-900/80 rounded-xl p-1.5 flex items-end gap-1.5 border border-slate-800/60">
                {sensor.waveform.map((val, idx) => {
                  const maxVal = Math.max(...sensor.waveform, sensor.thresholdCritical);
                  const heightPercent = Math.min(100, Math.max(15, (val / maxVal) * 100));
                  const isCrit = val >= sensor.thresholdCritical;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-t transition-all duration-300 ${
                        isCrit ? 'bg-red-500' : val >= sensor.thresholdWarning ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  );
                })}
              </div>

              {/* Footer Specs */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900 font-mono">
                <div className="flex items-center gap-1">
                  <Battery className="w-3 h-3 text-slate-500" />
                  <span>{sensor.batteryPercent}% LiFePO4</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {sensor.lastPacketTime}
                </div>
              </div>
            </div>
          );
        })}

        {filteredSensors.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500 text-xs">
            No sensor telemetry probes deployed in this specific sector.
          </div>
        )}
      </div>
    </div>
  );
};
