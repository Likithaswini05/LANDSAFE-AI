import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Droplet, 
  HeartPulse, 
  Eye, 
  Compass, 
  ShieldAlert, 
  Printer, 
  Download,
  Share2
} from 'lucide-react';

interface SurvivalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStrobe?: () => void;
}

export const SurvivalGuideModal: React.FC<SurvivalGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenStrobe,
}) => {
  const [activeTopic, setActiveTopic] = useState<'early_warning' | 'crack_gauge' | 'first_aid' | 'water_purify'>('early_warning');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
                OFFLINE GEOTECHNICAL SURVIVAL GUIDE
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Field Protocols & Landslide Emergency Manual
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Selector Tabs */}
        <div className="flex items-center gap-2 p-4 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTopic('early_warning')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTopic === 'early_warning'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Pre-Slide Natural Warnings</span>
          </button>

          <button
            onClick={() => setActiveTopic('crack_gauge')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTopic === 'crack_gauge'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Ground Crack Gauge DIY</span>
          </button>

          <button
            onClick={() => setActiveTopic('first_aid')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTopic === 'first_aid'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Crush Injury & Trauma Aid</span>
          </button>

          <button
            onClick={() => setActiveTopic('water_purify')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTopic === 'water_purify'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>Emergency Water Purification</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          {activeTopic === 'early_warning' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold text-sm">Critical Environmental Warning Signs:</div>
                <p>Observe these subtle slope signals before a catastrophic slope collapse occurs:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="text-red-400">🚨</span> Sudden Stream Turbidity
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    If a crystal-clear hill spring suddenly turns chocolate brown or murky with silt, subsurface soil piping is underway. Evacuate immediately.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="text-red-400">🪵</span> Tilted Utility Poles & Trees
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    "J-shaped" tree trunks or telephone poles tilting downhill indicate active creeping regolith displacement.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="text-red-400">🚪</span> Sticking Doors & Windows
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Door frames jamming or new diagonal wall cracks appearing inside homes indicate foundation shearing.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="text-red-400">🔊</span> Rumbling Subterranean Sounds
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    A deep freight-train roar or crackling root noises signify high-velocity debris avalanche inception.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'crack_gauge' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold text-sm">How to Monitor Tension Cracks with Wooden Stakes:</div>
                <p>When tension cracks form in soil or paved yards, build this simple tell-tale gauge:</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <span>Drive two rigid wooden stakes 30cm deep on opposite sides of the crack.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span>Stretch a piece of string or tape measure tautly between the two stakes and mark the millimeter line.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span>Check every 2 hours during rainfall. <strong>If crack width expands by &gt;5mm in 2 hours</strong>, catastrophic failure is imminent. Sound emergency whistle and evacuate.</span>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'first_aid' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-red-400 font-bold text-sm">Crush Injury & Trauma Field Protocols:</div>
                <p>Crucial steps when rescuing persons pinned under mud or collapsed debris:</p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white">1. Beware of Sudden Release (Crush Syndrome)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    If an extremity has been compressed for &gt;2 hours, release can cause sudden reperfusion of potassium toxins. Keep victim warm and hydrate orally with clean electrolyte water if conscious before extraction.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white">2. Airway Clearance from Fine Silt & Mud</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Clear mouth and nostrils immediately with clean cloth. Position in stable recovery position on side to avoid mud aspiration.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'water_purify' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-cyan-400 font-bold text-sm">Emergency Water Purification in Flood & Mud Zones:</div>
                <p>Never drink untreated flood or surface runoff water. Use one of these methods:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">Cloth Filtration + Rolling Boil</div>
                  <p className="text-slate-400 text-[11px]">
                    Filter silty water through 4 layers of clean cotton sari/t-shirt. Bring to a rolling boil for minimum 3 minutes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">Solar UV Disinfection (SODIS)</div>
                  <p className="text-slate-400 text-[11px]">
                    Fill clear PET bottles with filtered water. Place horizontally on corrugated tin roof in sunlight for 6 hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {onOpenStrobe && (
            <button
              onClick={() => {
                onClose();
                onOpenStrobe();
              }}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Launch Night Distress Strobe</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer ml-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print Survival Manual</span>
          </button>
        </div>
      </div>
    </div>
  );
};
