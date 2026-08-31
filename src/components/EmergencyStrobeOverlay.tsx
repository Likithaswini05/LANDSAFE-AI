import React, { useState, useEffect } from 'react';
import { Shelter } from '../types';
import { startSosBeacon, stopSosBeacon, isSosActive } from '../lib/audioService';
import { 
  Volume2, 
  VolumeX, 
  X, 
  Radio, 
  Compass, 
  ShieldAlert, 
  Zap, 
  Eye, 
  MapPin, 
  Navigation,
  Sparkles
} from 'lucide-react';

interface EmergencyStrobeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  nearestShelter?: Shelter | null;
}

export const EmergencyStrobeOverlay: React.FC<EmergencyStrobeOverlayProps> = ({
  isOpen,
  onClose,
  nearestShelter,
}) => {
  const [strobeActive, setStrobeActive] = useState(false);
  const [strobeColor, setStrobeColor] = useState<'white' | 'red' | 'amber'>('white');
  const [sosAudio, setSosAudio] = useState(false);
  const [flashPhase, setFlashPhase] = useState(0);

  // Strobe flashing interval
  useEffect(() => {
    let timer: any = null;
    if (strobeActive) {
      timer = setInterval(() => {
        setFlashPhase(prev => (prev + 1) % 2);
      }, 140);
    } else {
      setFlashPhase(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [strobeActive]);

  useEffect(() => {
    return () => {
      stopSosBeacon();
    };
  }, []);

  if (!isOpen) return null;

  const toggleAudioSos = () => {
    if (sosAudio) {
      stopSosBeacon();
      setSosAudio(false);
    } else {
      const active = startSosBeacon((state) => setSosAudio(state));
      setSosAudio(active);
    }
  };

  const handleClose = () => {
    stopSosBeacon();
    setSosAudio(false);
    setStrobeActive(false);
    onClose();
  };

  const getBackgroundColor = () => {
    if (!strobeActive) return 'bg-slate-950/95';
    if (flashPhase === 0) {
      if (strobeColor === 'white') return 'bg-white text-slate-950';
      if (strobeColor === 'red') return 'bg-red-600 text-white';
      return 'bg-amber-400 text-slate-950';
    }
    return 'bg-slate-950 text-white';
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 transition-colors duration-75 ${getBackgroundColor()} backdrop-blur-md`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-red-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-spin" />
              <span>TACTICAL EMERGENCY DISTRESS BEACON</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              High-Visibility Strobe & Acoustic SOS
            </h1>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 hover:bg-slate-800 transition-colors text-white cursor-pointer shadow-xl"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Tactical HUD & Controls */}
      <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto my-auto space-y-6 z-10">
        {/* Nearest Shelter Vector HUD */}
        {nearestShelter && (
          <div className="w-full bg-slate-900/90 border border-slate-700 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Navigation className="w-4 h-4 text-emerald-400 animate-bounce" />
                NEAREST SAFE RETREAT HAVEN
              </span>
              <span>BEARING: 312° NW</span>
            </div>
            <div className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>{nearestShelter.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center pt-1">
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Direct Distance</div>
                <div className="text-xl font-black font-mono text-emerald-400">
                  {nearestShelter.distanceKm} km
                </div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Est. Walking Escape</div>
                <div className="text-xl font-black font-mono text-amber-400">
                  {Math.round(nearestShelter.distanceKm * 12)} mins
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Primary Strobe Toggle Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => setStrobeActive(!strobeActive)}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm tracking-wide uppercase transition-all shadow-2xl flex items-center justify-center gap-3 cursor-pointer ${
              strobeActive
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-900/80 ring-4 ring-red-400/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-900/50'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>{strobeActive ? 'Stop Optical Flash Strobe' : 'Activate Optical Flash Strobe'}</span>
          </button>

          <button
            onClick={toggleAudioSos}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm tracking-wide uppercase transition-all shadow-2xl flex items-center justify-center gap-3 cursor-pointer ${
              sosAudio
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-bounce ring-4 ring-amber-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {sosAudio ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span>{sosAudio ? 'Mute Morse SOS Siren' : 'Transmit Morse SOS Audio'}</span>
          </button>
        </div>

        {/* Color Palette Switcher for Strobe */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-mono">Flash Tone:</span>
          <button
            onClick={() => setStrobeColor('white')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              strobeColor === 'white' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            White (Search & Rescue)
          </button>
          <button
            onClick={() => setStrobeColor('red')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              strobeColor === 'red' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Red (Tactical Hazard)
          </button>
          <button
            onClick={() => setStrobeColor('amber')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              strobeColor === 'amber' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Amber (Warning)
          </button>
        </div>
      </div>

      {/* Bottom Instructions Footer */}
      <div className="text-center text-xs text-slate-400 font-mono z-10 max-w-lg mx-auto bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80">
        Hold screen upright toward open sky or mountain road. Flashes are visible to helicopter searchlights and night patrols up to 3.5 km away.
      </div>
    </div>
  );
};
