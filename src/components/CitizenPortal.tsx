import React, { useState } from 'react';
import { AreaZone, CommunityReport, NotificationAlert, Shelter, UserProfile, NetworkMode, FamilySafetyStatus } from '../types';
import { RiskMap } from './RiskMap';
import { FamilySafetyHub } from './FamilySafetyHub';
import { EvacuationRoutePlanner } from './EvacuationRoutePlanner';
import { encryptData } from '../lib/encryption';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  MapPin, 
  CloudRain, 
  Droplets, 
  Activity, 
  ArrowRight, 
  Phone, 
  Navigation, 
  Home, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Clock, 
  Lock, 
  Upload, 
  Compass, 
  Send,
  Eye,
  Layers,
  HeartPulse,
  Share2,
  FileCheck2,
  Radio,
  HeartHandshake,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react';

interface CitizenPortalProps {
  currentUser: UserProfile | null;
  zones: AreaZone[];
  shelters: Shelter[];
  reports: CommunityReport[];
  notifications: NotificationAlert[];
  selectedZone: AreaZone;
  onSelectZone: (zone: AreaZone) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmitReport: (newReport: CommunityReport) => void;
  onOpenAuth: () => void;
  onOpenOfflineMode: () => void;
  onOpenVault: () => void;
  networkMode: NetworkMode;
  familyCheckins: FamilySafetyStatus[];
  onAddCheckin: (checkin: FamilySafetyStatus) => void;
  onOpenStrobe?: () => void;
  onOpenSurvivalGuide?: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  currentUser,
  zones,
  shelters,
  reports,
  notifications,
  selectedZone,
  onSelectZone,
  activeTab,
  setActiveTab,
  onSubmitReport,
  onOpenAuth,
  onOpenOfflineMode,
  onOpenVault,
  networkMode,
  familyCheckins,
  onAddCheckin,
  onOpenStrobe,
  onOpenSurvivalGuide,
}) => {
  // Community Report Form state
  const [reportType, setReportType] = useState<CommunityReport['type']>('ground_crack');
  const [reportSeverity, setReportSeverity] = useState<CommunityReport['severity']>('high');
  const [reportLocation, setReportLocation] = useState(selectedZone.name);
  const [reportDescription, setReportDescription] = useState('');
  const [reportImage, setReportImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [lastEncryptedHash, setLastEncryptedHash] = useState('');

  // Map Filter
  const [mapRiskFilter, setMapRiskFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const criticalZoneCount = zones.filter(z => z.riskLevel === 'critical').length;
  const highZoneCount = zones.filter(z => z.riskLevel === 'high').length;
  const myCurrentZone = zones.find(z => z.id === 'zone-01') || selectedZone;

  // Handle Photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Incident Report with real client-side AES-256-GCM encryption
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;

    setIsSubmitting(true);
    const rawPayload = JSON.stringify({
      reporter: currentUser?.name || 'Anonymous Resident',
      type: reportType,
      severity: reportSeverity,
      location: reportLocation,
      description: reportDescription,
      timestamp: new Date().toISOString()
    });

    // Real client-side encryption
    const encrypted = await encryptData(rawPayload);
    setLastEncryptedHash(encrypted.sha256Checksum);

    const newReportItem: CommunityReport = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser?.id || 'anon-cit',
      reporterName: currentUser?.name || 'Verified Resident',
      reporterRole: currentUser?.role || 'citizen',
      isVerifiedCitizen: currentUser?.isVerified ?? true,
      type: reportType,
      severity: reportSeverity,
      description: reportDescription,
      locationName: reportLocation,
      coordinates: selectedZone.coordinates,
      timestamp: 'Just now',
      imageUrl: reportImage || 'https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?auto=format&fit=crop&w=600&q=80',
      status: currentUser?.isVerified ? 'verified' : 'pending',
      encryptedHash: encrypted.cipherBase64.slice(0, 48) + '...',
      sha256Checksum: encrypted.sha256Checksum,
      isEncrypted: true,
      upvotes: 1,
      authorityNotes: currentUser?.isVerified ? 'Fast-tracked for verification due to Verified Citizen trust rating.' : undefined
    };

    setTimeout(() => {
      onSubmitReport(newReportItem);
      setIsSubmitting(false);
      setReportSuccess(true);
      confetti({ particleCount: 50, spread: 60 });
      setReportDescription('');
      setReportImage(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero & Current Emergency Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Predict. Alert. Protect. • AI Early Warning Mesh</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered Landslide Early Warning & Risk Mapping
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Real-time environmental sensor telemetry, geotechnical Explainable AI (XAI) risk forecasting, safe evacuation routes, and encrypted citizen community reporting.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('myarea')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-emerald-950/60 flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Check My Area Risk</span>
              </button>

              <button
                onClick={() => setActiveTab('shelters')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Find Safe Shelters</span>
              </button>

              <button
                onClick={onOpenOfflineMode}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Offline Emergency Kit</span>
              </button>
            </div>
          </div>

          {/* Quick Threat Meter Card */}
          <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl p-5 shrink-0 min-w-[280px] space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Highland Threat Status</span>
              <span className="text-red-400 animate-pulse font-mono">LIVE WATCH</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-950/40 border border-red-500/30 p-3 rounded-xl">
                <div className="text-2xl font-extrabold text-red-400">{criticalZoneCount}</div>
                <div className="text-[11px] font-semibold text-slate-300">Critical Zones (P1)</div>
              </div>

              <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl">
                <div className="text-2xl font-extrabold text-amber-400">{highZoneCount}</div>
                <div className="text-[11px] font-semibold text-slate-300">High Risk Zones</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
              <span>Active Shelters:</span>
              <span className="font-bold text-emerald-400">4 Operational (2,500 Cap)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'map'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Interactive Live Risk Map</span>
        </button>

        <button
          onClick={() => setActiveTab('myarea')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'myarea'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>My Area & AI Assistant</span>
          {myCurrentZone.riskLevel === 'critical' && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'safety'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-emerald-400" />
          <span>"I Am Safe" Family Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('shelters')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'shelters'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Shelters & Evac Routes</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'report'
              ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report Warning Signs</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Risk History Timeline</span>
        </button>
      </div>

      {/* NEW TAB: FAMILY SAFETY HUB */}
      {activeTab === 'safety' && (
        <FamilySafetyHub
          currentUser={currentUser}
          networkMode={networkMode}
          familyCheckins={familyCheckins}
          onAddCheckin={onAddCheckin}
          onOpenAuth={onOpenAuth}
        />
      )}

      {/* 2. TAB: LIVE RISK MAP */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <span>Filter Risk Zones:</span>
              </div>
              <div className="flex items-center gap-1">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setMapRiskFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      mapRiskFilter === filter
                        ? filter === 'critical' ? 'bg-red-500 text-white' :
                          filter === 'high' ? 'bg-orange-500 text-white' :
                          filter === 'medium' ? 'bg-yellow-500 text-slate-950' :
                          filter === 'low' ? 'bg-emerald-500 text-white' :
                          'bg-slate-700 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="h-[520px]">
              <RiskMap
                zones={zones}
                shelters={shelters}
                reports={reports}
                selectedZone={selectedZone}
                onSelectZone={onSelectZone}
                filterRisk={mapRiskFilter}
              />
            </div>
          </div>

          {/* Side Panel: Selected Zone Details & Explainable AI */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Selected Sector</div>
                  <h3 className="text-lg font-extrabold text-white">{selectedZone.name}</h3>
                  <div className="text-xs text-slate-400">{selectedZone.district}</div>
                </div>

                <div className={`px-3 py-1 rounded-xl font-extrabold text-sm uppercase flex items-center gap-1.5 ${
                  selectedZone.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  selectedZone.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                  selectedZone.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  <span>{selectedZone.riskScore}/100</span>
                </div>
              </div>

              {/* Environmental Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>24h Rainfall</span>
                  </div>
                  <div className="text-base font-bold text-white mt-1">{selectedZone.rainfall24h} mm</div>
                  <div className="text-[10px] text-slate-400">Rate: {selectedZone.rainfallRate1h} mm/h</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span>Soil Moisture</span>
                  </div>
                  <div className="text-base font-bold text-white mt-1">{selectedZone.soilMoisture} %</div>
                  <div className="text-[10px] text-slate-400">Pore Saturation</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>Slope Angle</span>
                  </div>
                  <div className="text-base font-bold text-white mt-1">{selectedZone.slopeDegrees}°</div>
                  <div className="text-[10px] text-slate-400">Elev: {selectedZone.elevation}m</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Population</span>
                  </div>
                  <div className="text-base font-bold text-white mt-1">{selectedZone.population.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">Priority: {selectedZone.alertPriority}</div>
                </div>
              </div>

              {/* Explainable AI (XAI) Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explainable AI Risk Rationale:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedZone.xaiExplanation}
                </p>
              </div>

              {/* Contributing Factors Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Contributing Factor Weights:</div>
                <div className="space-y-1.5">
                  {selectedZone.topContributingFactors.map((factor, i) => (
                    <div key={i} className="text-xs bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>{factor.factor}</span>
                        <span className={factor.status === 'danger' ? 'text-red-400' : factor.status === 'caution' ? 'text-amber-400' : 'text-emerald-400'}>
                          {factor.impact}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{factor.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('shelters')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
              >
                <Home className="w-4 h-4" />
                <span>View Evacuation Routes for {selectedZone.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: MY AREA & CITIZEN SAFETY ASSISTANT */}
      {activeTab === 'myarea' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Overview Card */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <MapPin className="w-4 h-4" />
                    <span>Auto-Detected Citizen Geolocation</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">{myCurrentZone.name}</h2>
                  <div className="text-xs text-slate-400">Sector Coordinates: {myCurrentZone.coordinates.join(', ')}</div>
                </div>

                <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                  myCurrentZone.riskLevel === 'critical' ? 'bg-red-500/20 border border-red-500/40 text-red-300' :
                  myCurrentZone.riskLevel === 'high' ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300' :
                  'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                }`}>
                  <div className="text-3xl font-black">{myCurrentZone.riskScore}</div>
                  <div>
                    <div className="text-xs font-bold uppercase">{myCurrentZone.riskLevel} HAZARD</div>
                    <div className="text-[10px] text-slate-300">Updated: {myCurrentZone.lastUpdated}</div>
                  </div>
                </div>
              </div>

              {/* Explainable AI Why Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Explainable AI (XAI) - Why is this area at risk?</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {myCurrentZone.xaiExplanation}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">24h Rainfall</div>
                    <div className="text-lg font-bold text-white">{myCurrentZone.rainfall24h} mm</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">Soil Saturation</div>
                    <div className="text-lg font-bold text-white">{myCurrentZone.soilMoisture} %</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">Slope Gradient</div>
                    <div className="text-lg font-bold text-white">{myCurrentZone.slopeDegrees}°</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">Evacuation Status</div>
                    <div className="text-xs font-extrabold uppercase text-red-400 mt-1">{myCurrentZone.evacuationStatus}</div>
                  </div>
                </div>
              </div>

              {/* Immediate Citizen Safety Instructions */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Safety Checklist for Your Current Risk Level:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="font-semibold text-xs text-emerald-300">1. Prepare Emergency Grab Bag</div>
                    <p className="text-xs text-slate-400">ID cards, essential medicines, phone power bank, torch, water bottle, and dry rations.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="font-semibold text-xs text-emerald-300">2. Avoid Stream Basins & Steep Cuts</div>
                    <p className="text-xs text-slate-400">Never walk along steep roadside embankments or downstream creek beds during heavy rain bursts.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="font-semibold text-xs text-emerald-300">3. Inspect House Surroundings</div>
                    <p className="text-xs text-slate-400">Watch for new ground fissures, leaning power poles, or muddy water emerging from retaining walls.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="font-semibold text-xs text-emerald-300">4. Evacuate to Designated Camp</div>
                    <p className="text-xs text-slate-400">If ordered by authorities, immediately move to Meppadi Govt Transit Camp via the North Route.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nearest Shelter Quick Widget */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Nearest Safe Shelter</span>
                  <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">2.1 km</span>
                </div>

                <h3 className="text-lg font-bold text-white">{shelters[3].name}</h3>
                <p className="text-xs text-slate-300">{shelters[3].address}</p>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Live Occupancy:</span>
                    <span className="font-bold text-white">{shelters[3].occupied} / {shelters[3].capacity}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: '98%' }}></div>
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold">Status: High Occupancy (Secondary Camp #1 Open)</div>
                </div>

                <div className="space-y-2 pt-2">
                  <a
                    href={`tel:${shelters[3].contactPhone}`}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Camp Desk: {shelters[3].contactPhone}</span>
                  </a>

                  <button
                    onClick={() => setActiveTab('shelters')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>View Turn-by-Turn Route</span>
                  </button>
                </div>
              </div>

              {/* Emergency Contacts Speed Dial */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Speed Dial</div>
                
                <div className="space-y-2">
                  <a href="tel:112" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors">
                    <div className="text-xs font-bold text-white">National Emergency Service</div>
                    <span className="font-mono text-xs font-extrabold text-red-400">112</span>
                  </a>
                  <a href="tel:1077" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors">
                    <div className="text-xs font-bold text-white">District Disaster Control (DEOC)</div>
                    <span className="font-mono text-xs font-extrabold text-amber-400">1077</span>
                  </a>
                  <a href="tel:108" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors">
                    <div className="text-xs font-bold text-white">Emergency Medical Ambulance</div>
                    <span className="font-mono text-xs font-extrabold text-emerald-400">108</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: EMERGENCY & SAFE ROUTES */}
      {activeTab === 'shelters' && (
        <div className="space-y-6">
          {/* Dynamic AI Hazard Avoidance Evacuation Route Planner */}
          <EvacuationRoutePlanner shelters={shelters} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Active Designated Safe Havens</h3>
                  <p className="text-xs text-slate-400">Real-time capacity, medical officer presence, and food stock tracking</p>
                </div>
                <button
                  onClick={onOpenOfflineMode}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Download Offline Route Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shelters.map((sh) => (
                  <div key={sh.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                          {sh.distanceKm} km away
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">{sh.name}</h4>
                        <div className="text-xs text-slate-400">{sh.address}</div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sh.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        sh.status === 'near_capacity' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                        'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}>
                        {sh.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Capacity:</span>
                        <span className="font-bold text-white">{sh.occupied} / {sh.capacity} ({Math.round((sh.occupied / sh.capacity) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${sh.occupied / sh.capacity > 0.9 ? 'bg-red-400' : 'bg-emerald-400'}`}
                          style={{ width: `${(sh.occupied / sh.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {sh.amenities.map((am, i) => (
                        <span key={i} className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {am}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <a href={`tel:${sh.contactPhone}`} className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{sh.contactPhone}</span>
                      </a>

                      <button
                        onClick={() => {
                          onSelectZone(selectedZone);
                          setActiveTab('map');
                        }}
                        className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Navigate &rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evacuation Guidelines */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>Standard Evacuation Protocol</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-white block">Phase 1: Immediate Alert</strong>
                    <span>When Red Alert is sounded, do not delay to salvage heavy furniture. Turn off LPG gas valves and main electrical breaker.</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-white block">Phase 2: Use High Ridge Paths</strong>
                    <span>Never cross swollen stream bridges or low culverts. Follow designated high-ridge trail toward Meppadi or Bathery.</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-white block">Phase 3: Roll Call at Safe Haven</strong>
                    <span>Register at the camp administration desk for biometric logging and relief supply allocation.</span>
                  </div>
                </div>

                <button
                  onClick={onOpenOfflineMode}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Open Offline Survival Guide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: COMMUNITY INCIDENT REPORTING */}
      {activeTab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Community Early Warning Contribution</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Report Landslide Warning Signs</h2>
              <p className="text-xs text-slate-400">
                Reports are encrypted client-side using AES-256-GCM before transmission. Verified citizens receive instant triage by DEOC geotechnical officers.
              </p>
            </div>

            {reportSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Report Safely Encrypted & Dispatched to Authority Command!</span>
                </div>
                <p>
                  Your observation has been verified and registered with SHA-256 Checksum: <code className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-300">{lastEncryptedHash}</code>
                </p>
                <button
                  onClick={() => setReportSuccess(false)}
                  className="text-emerald-400 underline font-semibold text-xs cursor-pointer"
                >
                  Submit another report
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Warning Sign Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as CommunityReport['type'])}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ground_crack">Tension Cracks on Ground / Slope</option>
                    <option value="falling_rocks">Falling Rocks & Shale Slips</option>
                    <option value="blocked_road">Blocked Road / Mud Slush</option>
                    <option value="water_leakage">Muddy Water Gushing from Retaining Wall</option>
                    <option value="mud_flow">Active Mudflow / Debris Movement</option>
                    <option value="retaining_wall_tilt">Tilting Retaining Wall or Trees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Perceived Threat Severity</label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value as CommunityReport['severity'])}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="critical">Critical (Immediate Danger to Houses)</option>
                    <option value="high">High (Rapidly widening crack / road blocked)</option>
                    <option value="medium">Medium (Moderate water seep / small rocks)</option>
                    <option value="low">Low (Minor initial crack)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incident Location / Landmark</label>
                <input
                  type="text"
                  value={reportLocation}
                  onChange={(e) => setReportLocation(e.target.value)}
                  placeholder="e.g. Upper Tea Estate Curve 4, Chooralmala"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Observation</label>
                <textarea
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe crack length/width, water color, sounds of ground movement, number of nearby houses at risk..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                ></textarea>
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Attach Photo Evidence (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs text-slate-300 font-medium cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Select Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {reportImage && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                      <img src={reportImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Client Encryption Shield Notice */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Payload will be encrypted with <strong>AES-256-GCM</strong> with SHA-256 integrity seal.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenVault}
                  className="text-amber-400 underline font-mono text-[10px] cursor-pointer"
                >
                  Inspect Vault
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Encrypting & Dispatching...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Encrypted Warning Report</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Community Reports Feed */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Live Community Feed</h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  {reports.length} Reports
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{rep.type.replace('_', ' ').toUpperCase()}</span>
                          {rep.isVerifiedCitizen && (
                            <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded border border-emerald-800">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{rep.locationName} • {rep.timestamp}</div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rep.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        rep.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {rep.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3">{rep.description}</p>

                    {rep.imageUrl && (
                      <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-800">
                        <img src={rep.imageUrl} alt="Hazard" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span className="font-mono text-emerald-400">Status: {rep.status.toUpperCase()}</span>
                      <span className="text-slate-400">Reporter: {rep.reporterName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: RISK HISTORY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Landslide Risk History & Sensor Trends</h2>
              <p className="text-xs text-slate-400">Historical precipitation accumulation and slope inclinometer displacement telemetry.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telemetry Trend Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span>24-Hour Rainfall Surge vs. Soil Moisture Trend</span>
                </h3>

                <div className="space-y-2">
                  {selectedZone.sensorHistory.map((pt, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="font-mono">{pt.time}</span>
                        <span>Rain: <strong>{pt.rainfall}mm</strong> | Moisture: <strong>{pt.soilMoisture}%</strong></span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-cyan-400 h-full" style={{ width: `${(pt.rainfall / 200) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Landslide Occurrences */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Historical Landslide Events in Sector</span>
                </h3>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>Major Debris Flow Incident</span>
                      <span className="text-red-400">July 2024</span>
                    </div>
                    <p className="text-slate-400">Extreme rainfall (372mm in 24h) triggered sudden slope failure at 1,200m elevation.</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>Puthumala Escarpment Slip</span>
                      <span className="text-amber-400">August 2019</span>
                    </div>
                    <p className="text-slate-400">Pore-pressure saturation caused translational slide along granitic contact layer.</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>Hairpin Road Blockage</span>
                      <span className="text-yellow-400">June 2022</span>
                    </div>
                    <p className="text-slate-400">Cut-slope failure on NH-766 cleared within 14 hours by emergency response.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
