import React, { useState, useEffect } from 'react';
import { Shelter } from '../types';
import { startSosBeacon, stopSosBeacon, isSosActive } from '../lib/audioService';
import { 
  WifiOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  Home, 
  CheckSquare, 
  Download, 
  Printer, 
  X, 
  ShieldAlert, 
  Radio, 
  Flame, 
  Compass, 
  AlertTriangle 
} from 'lucide-react';

interface OfflineEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelters: Shelter[];
  onOpenStrobe?: () => void;
  onOpenSurvivalManual?: () => void;
}

export const OfflineEmergencyModal: React.FC<OfflineEmergencyModalProps> = ({
  isOpen,
  onClose,
  shelters,
  onOpenStrobe,
  onOpenSurvivalManual,
}) => {
  const [sosRunning, setSosRunning] = useState(false);

  useEffect(() => {
    return () => {
      stopSosBeacon();
    };
  }, []);

  if (!isOpen) return null;

  const toggleSos = () => {
    if (sosRunning) {
      stopSosBeacon();
      setSosRunning(false);
    } else {
      const started = startSosBeacon((active) => setSosRunning(active));
      setSosRunning(started);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>Offline Emergency Survival Kit</span>
              </div>
              <h2 className="text-xl font-bold text-white">Cached Disaster Safety Information</h2>
            </div>
          </div>
          <button
            onClick={() => {
              stopSosBeacon();
              setSosRunning(false);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Offline Acoustic SOS Beacon */}
          <div className={`p-5 rounded-2xl border transition-all ${
            sosRunning
              ? 'bg-red-950/50 border-red-500 animate-pulse'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Acoustic Emergency SOS Whistle Transmitter</span>
                </div>
                <p className="text-xs text-slate-300">
                  Generates an international Morse Code (... --- ...) acoustic beacon at maximum frequency to alert nearby rescue teams without internet.
                </p>
              </div>

              <button
                onClick={toggleSos}
                className={`py-2.5 px-5 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  sosRunning
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950 animate-bounce'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
                }`}
              >
                {sosRunning ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{sosRunning ? 'Stop SOS Siren' : 'Activate SOS Whistle'}</span>
              </button>
            </div>
          </div>

          {/* Cached Safe Shelters */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Offline Safe Shelters Directory (Cached Locally)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shelters.map((sh) => (
                <div key={sh.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="font-bold text-white">{sh.name}</div>
                  <div className="text-slate-400 text-[11px]">{sh.address}</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1 pt-1">
                    <Phone className="w-3 h-3" />
                    <span>{sh.contactPhone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Offline Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Immediate Landslide Evacuation Steps</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <span><strong>Stay Away from the Slide Path:</strong> Direct debris flows follow stream channels and ravines. Move to higher ground perpendicular to the slide path.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <span><strong>Listen for Unusual Sounds:</strong> Snapping trees, rumbling boulders, or sudden surges of muddy creek water indicate imminent failure.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <span><strong>Curled Position:</strong> If trapped or debris hits, curl into a tight ball and protect your head to create an air pocket.</span>
              </div>
            </div>
          </div>

          {/* Emergency Helpline Numbers */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-white">Emergency Dispatch Numbers (Always Save to Phonebook):</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Police & Rescue</div>
                <div className="font-bold font-mono text-sm text-red-400">112</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Disaster Helpline</div>
                <div className="font-bold font-mono text-sm text-amber-400">1077</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Ambulance</div>
                <div className="font-bold font-mono text-sm text-emerald-400">108</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Fire Service</div>
                <div className="font-bold font-mono text-sm text-cyan-400">101</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenStrobe && (
              <button
                onClick={onOpenStrobe}
                className="bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Distress Strobe</span>
              </button>
            )}
            {onOpenSurvivalManual && (
              <button
                onClick={onOpenSurvivalManual}
                className="bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Survival Manual</span>
              </button>
            )}
          </div>
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Survival Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
