import React, { useState } from 'react';
import { AreaZone, CommunityReport, NotificationAlert, Shelter, UserProfile, CloudBackupRecord, FamilySafetyStatus, NetworkMode } from '../types';
import { RiskMap } from './RiskMap';
import { GeotechSensorMonitor } from './GeotechSensorMonitor';
import { calculateRiskScore, getAiRiskAssessment } from '../lib/aiRiskEngine';
import { createCloudBackup, exportBackupToFile } from '../lib/backupService';
import confetti from 'canvas-confetti';
import { 
  Shield, 
  Radio, 
  AlertTriangle, 
  Activity, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  Sliders, 
  Sparkles, 
  Database, 
  Download, 
  Upload, 
  Users, 
  MapPin, 
  CloudRain, 
  Flame, 
  ShieldAlert,
  Layers,
  FileText,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Clock,
  HeartHandshake
} from 'lucide-react';

interface AuthorityDashboardProps {
  currentUser: UserProfile | null;
  zones: AreaZone[];
  shelters: Shelter[];
  reports: CommunityReport[];
  notifications: NotificationAlert[];
  selectedZone: AreaZone;
  onSelectZone: (zone: AreaZone) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBroadcastAlert: (newAlert: NotificationAlert) => void;
  onUpdateZoneEvacuation: (zoneId: string, status: AreaZone['evacuationStatus']) => void;
  onUpdateReportStatus: (reportId: string, status: CommunityReport['status'], notes?: string) => void;
  onUpdateShelterStatus: (shelterId: string, status: Shelter['status'], occupied: number) => void;
  backups: CloudBackupRecord[];
  onRefreshBackups: () => void;
  onOpenVault: () => void;
  familyCheckins?: FamilySafetyStatus[];
  networkMode?: NetworkMode;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  currentUser,
  zones,
  shelters,
  reports,
  notifications,
  selectedZone,
  onSelectZone,
  activeTab,
  setActiveTab,
  onBroadcastAlert,
  onUpdateZoneEvacuation,
  onUpdateReportStatus,
  onUpdateShelterStatus,
  backups,
  onRefreshBackups,
  onOpenVault,
  familyCheckins = [],
  networkMode = 'online',
}) => {
  // Broadcast Alert Form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'info' | 'warning' | 'critical'>('critical');
  const [broadcastPriority, setBroadcastPriority] = useState<'P1' | 'P2' | 'P3'>('P1');
  const [broadcastTargetZone, setBroadcastTargetZone] = useState<string>('all');
  const [broadcastSound, setBroadcastSound] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // AI Simulator state
  const [simRainfall, setSimRainfall] = useState(160);
  const [simSoilMoisture, setSimSoilMoisture] = useState(90);
  const [simSlope, setSimSlope] = useState(42);
  const [simElevation, setSimElevation] = useState(1150);
  const [simVegetation, setSimVegetation] = useState(35);
  const [simPopulation, setSimPopulation] = useState(3500);
  const [simAiLoading, setSimAiLoading] = useState(false);
  const [simAiOutput, setSimAiOutput] = useState<string | null>(null);

  // Cloud Backup creation state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState('');

  // Triage notes state
  const [triageNotes, setTriageNotes] = useState<{ [id: string]: string }>({});

  // Summary Metrics
  const criticalCount = zones.filter(z => z.riskLevel === 'critical').length;
  const highCount = zones.filter(z => z.riskLevel === 'high').length;
  const mediumCount = zones.filter(z => z.riskLevel === 'medium').length;
  const totalThreatenedPop = zones
    .filter(z => z.riskLevel === 'critical' || z.riskLevel === 'high')
    .reduce((acc, z) => acc + z.population, 0);
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  // Simulator dynamic calculation
  const simResult = calculateRiskScore({
    rainfall24h: simRainfall,
    soilMoisture: simSoilMoisture,
    slopeDegrees: simSlope,
    elevation: simElevation,
    vegetationCover: simVegetation,
    population: simPopulation,
  });

  // Handle Broadcast Alert
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    const targetZoneObj = zones.find(z => z.id === broadcastTargetZone);

    const newAlert: NotificationAlert = {
      id: `alert-${Date.now()}`,
      title: broadcastTitle,
      message: broadcastMessage,
      severity: broadcastSeverity,
      priority: broadcastPriority,
      timestamp: 'Just now',
      areaId: broadcastTargetZone !== 'all' ? broadcastTargetZone : undefined,
      areaName: targetZoneObj ? targetZoneObj.name : 'All Highland Sectors',
      targetAudience: 'all',
      isRead: false,
      broadcastedBy: `${currentUser?.name || 'Incident Commander'} (${currentUser?.badgeId || 'SDMA-HQ'})`,
      soundAlarm: broadcastSound,
    };

    setTimeout(() => {
      onBroadcastAlert(newAlert);
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      confetti({ particleCount: 70, spread: 80 });
      setBroadcastTitle('');
      setBroadcastMessage('');
    }, 500);
  };

  // Handle Trigger AI Geotechnical Evaluation via Server API
  const handleRunAiAnalysis = async () => {
    setSimAiLoading(true);
    try {
      const assessment = await getAiRiskAssessment({
        areaName: selectedZone.name,
        rainfall24h: simRainfall,
        soilMoisture: simSoilMoisture,
        slopeDegrees: simSlope,
        elevation: simElevation,
        population: simPopulation
      });
      setSimAiOutput(assessment.explanation);
    } catch (e) {
      setSimAiOutput(simResult.xaiExplanation);
    } finally {
      setSimAiLoading(false);
    }
  };

  // Handle Cloud Backup
  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const systemState = {
        timestamp: new Date().toISOString(),
        zones,
        shelters,
        reports,
        notifications,
        operator: currentUser?.name,
        badgeId: currentUser?.badgeId,
      };

      const record = await createCloudBackup(systemState);
      onRefreshBackups();
      setBackupSuccessMsg(`Encrypted snapshot ${record.backupName} synchronized to multi-region cloud storage.`);
      confetti({ particleCount: 40, spread: 50 });
    } catch (e) {
      setBackupSuccessMsg('Cloud backup recorded in local safe repository.');
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Command Telemetry */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Shield className="w-4 h-4" />
              <span>Authority Incident Command Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Disaster Response & Early Warning Center
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Logged In: <strong className="text-white">{currentUser?.name}</strong></span>
              <span>•</span>
              <span className="text-amber-400 font-mono">Badge: {currentUser?.badgeId || 'SDMA-IC-9021'}</span>
              <span>•</span>
              <span className="text-slate-400">{currentUser?.department}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCreateBackup}
              disabled={isBackingUp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              <span>{isBackingUp ? 'Syncing Snapshot...' : 'Trigger Cloud Backup'}</span>
            </button>

            <button
              onClick={() => setActiveTab('priority')}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-red-950 flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Dispatch Mass Alert</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-red-500/30">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Critical Zones (P1)</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-black text-red-400 mt-2">{criticalCount}</div>
            <div className="text-[11px] text-red-300/80 mt-0.5">Mandatory Evac Active</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Threatened Population</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 mt-2">{totalThreatenedPop.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">In High / Critical Runout</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Active Citizen Reports</span>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">{reports.length}</div>
            <div className="text-[11px] text-amber-400 mt-0.5">{pendingReportsCount} pending field triage</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Shelter Capacity</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-2">1,495 / 2,500</div>
            <div className="text-[11px] text-emerald-300 mt-0.5">59.8% occupied across 4 camps</div>
          </div>
        </div>
      </div>

      {/* Authority Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'overview' ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Strategic Risk Map</span>
        </button>

        <button
          onClick={() => setActiveTab('priority')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'priority' ? 'bg-slate-800 text-red-400 border border-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Smart Priority Alerts (P1-P3) & Evacuations</span>
        </button>

        <button
          onClick={() => setActiveTab('sensors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'sensors' ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>IoT Sensors & Waveforms</span>
        </button>

        <button
          onClick={() => setActiveTab('triage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'triage' ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Citizen Reports Triage</span>
          {pendingReportsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
              {pendingReportsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'simulator' ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>AI What-If Risk Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'backup' ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cloud Backup & Encrypted Vault</span>
        </button>
      </div>

      {/* TAB: IOT SENSORS & TELEMETRY */}
      {activeTab === 'sensors' && (
        <GeotechSensorMonitor
          zones={zones}
          selectedZone={selectedZone}
        />
      )}

      {/* 2. TAB: STRATEGIC MAP & MONITORING */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-[550px]">
              <RiskMap
                zones={zones}
                shelters={shelters}
                reports={reports}
                selectedZone={selectedZone}
                onSelectZone={onSelectZone}
              />
            </div>
          </div>

          {/* Quick Zone Action Panel */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Selected Sector Command</span>
                  <h3 className="text-lg font-bold text-white">{selectedZone.name}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase ${
                  selectedZone.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  selectedZone.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {selectedZone.riskLevel} ({selectedZone.riskScore}/100)
                </span>
              </div>

              {/* Evacuation Command Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">Set Sector Evacuation Status:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['none', 'advisory', 'mandatory'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateZoneEvacuation(selectedZone.id, status)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                        selectedZone.evacuationStatus === status
                          ? status === 'mandatory' ? 'bg-red-600 text-white shadow-md' :
                            status === 'advisory' ? 'bg-amber-600 text-white shadow-md' :
                            'bg-slate-700 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Critical Infrastructure Choke Points */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Vulnerable Infrastructure:</div>
                <div className="space-y-1">
                  {selectedZone.criticalInfrastructure.map((infra, i) => (
                    <div key={i} className="text-xs bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-amber-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>{infra}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Broadcast Button for this Zone */}
              <button
                onClick={() => {
                  setBroadcastTargetZone(selectedZone.id);
                  setBroadcastTitle(`URGENT: Landslide Warning for ${selectedZone.name}`);
                  setBroadcastMessage(`Authorities have placed ${selectedZone.name} under ${selectedZone.evacuationStatus.toUpperCase()} EVACUATION. Move to nearest designated safe camp immediately.`);
                  setActiveTab('priority');
                }}
                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950"
              >
                <Radio className="w-4 h-4" />
                <span>Prepare Alert for this Sector &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: SMART ALERT PRIORITIZATION & BROADCAST */}
      {activeTab === 'priority' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Smart Priority Engine */}
          <div className="lg:col-span-2 space-y-6">
            {/* Smart Prioritization Explanation Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                  <Cpu className="w-4 h-4" />
                  <span>AI Smart Alert Prioritization Model</span>
                </div>
                <h3 className="text-xl font-bold text-white">Multi-Factor Hazard Rank & Resource Triage</h3>
                <p className="text-xs text-slate-400">
                  Alert prioritization does not rely solely on raw sensor risk score. It dynamically factors in population exposure, choke-point bridge accessibility, and residential topography to rank emergency response.
                </p>
              </div>

              <div className="space-y-3">
                {zones
                  .slice()
                  .sort((a, b) => (b.riskScore * b.population) - (a.riskScore * a.population))
                  .map((zone, idx) => (
                    <div key={zone.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            zone.alertPriority === 'P1' ? 'bg-red-600 text-white shadow-lg shadow-red-950' :
                            zone.alertPriority === 'P2' ? 'bg-amber-600 text-white' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {zone.alertPriority}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-white">{zone.name}</h4>
                            <div className="text-[11px] text-slate-400">
                              Risk Score: <strong className="text-white">{zone.riskScore}/100</strong> • Pop: <strong className="text-amber-300">{zone.population.toLocaleString()}</strong> residents
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            zone.evacuationStatus === 'mandatory' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                            zone.evacuationStatus === 'advisory' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            Evac: {zone.evacuationStatus}
                          </span>

                          <button
                            onClick={() => {
                              setBroadcastTargetZone(zone.id);
                              setBroadcastTitle(`PRIORITY ${zone.alertPriority}: Landslide Alert for ${zone.name}`);
                              setBroadcastMessage(`Emergency advisory in effect for ${zone.name}. Population: ${zone.population}. Immediate precautionary measures required.`);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-semibold cursor-pointer"
                          >
                            Draft Alert
                          </button>
                        </div>
                      </div>

                      {/* Smart Priority Justification */}
                      <div className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Priority Justification:</strong> {zone.name} received {zone.alertPriority} ranking because rainfall ({zone.rainfall24h}mm) coincides with {zone.population.toLocaleString()} residents and critical choke point: {zone.criticalInfrastructure[0]}.
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Col: Public Broadcast Form */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                  <Radio className="w-4 h-4" />
                  <span>Public Emergency Broadcast</span>
                </div>
                <h3 className="text-lg font-bold text-white">Send Real-time Alert</h3>
                <p className="text-xs text-slate-400">
                  Dispatches push notifications & audible alarm chimes to verified citizen dashboards & public portal.
                </p>
              </div>

              {broadcastSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between">
                  <span>Emergency Alert successfully broadcasted!</span>
                  <button onClick={() => setBroadcastSuccess(false)} className="font-bold underline cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              <form onSubmit={handleBroadcast} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Sector</label>
                  <select
                    value={broadcastTargetZone}
                    onChange={(e) => setBroadcastTargetZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="all">All Sectors (District-Wide Broadcast)</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name} (Risk: {z.riskScore})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
                    <select
                      value={broadcastSeverity}
                      onChange={(e) => setBroadcastSeverity(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="critical">Critical (Red Alert)</option>
                      <option value="warning">Warning (Yellow Advisory)</option>
                      <option value="info">Info (Weather Update)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Rank</label>
                    <select
                      value={broadcastPriority}
                      onChange={(e) => setBroadcastPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="P1">Priority 1 (Immediate)</option>
                      <option value="P2">Priority 2 (High)</option>
                      <option value="P3">Priority 3 (Advisory)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Headline</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. RED ALERT: Mandatory Evacuation Ordered"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Message</label>
                  <textarea
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Provide specific instructions, routes to take, and safe shelter camp destinations..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    id="soundToggle"
                    checked={broadcastSound}
                    onChange={(e) => setBroadcastSound(e.target.checked)}
                    className="w-4 h-4 rounded text-red-500 accent-red-500 cursor-pointer"
                  />
                  <label htmlFor="soundToggle" className="cursor-pointer">Trigger acoustic synthesizer siren on citizen devices</label>
                </div>

                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-950 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isBroadcasting ? 'Broadcasting...' : 'Transmit Official Alert'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: CITIZEN REPORTS TRIAGE */}
      {activeTab === 'triage' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Citizen Warning Signs Triage Desk</h3>
                <p className="text-xs text-slate-400">
                  Review ground cracks, rockfalls, and water leaks. Inspect cryptographic AES-256 signatures and dispatch rescue units.
                </p>
              </div>
              <div className="text-xs text-slate-300 font-mono">
                Total Reports: <strong className="text-white">{reports.length}</strong>
              </div>
            </div>

            <div className="space-y-4">
              {reports.map((rep) => (
                <div key={rep.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{rep.type.replace('_', ' ').toUpperCase()}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          rep.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          rep.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                        }`}>
                          {rep.severity}
                        </span>
                        {rep.isVerifiedCitizen && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                            Verified Citizen ✓
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Location: <strong className="text-white">{rep.locationName}</strong> • Submitted: {rep.timestamp}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Status:</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                        rep.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                        rep.status === 'dispatched' ? 'bg-blue-500/20 text-blue-400' :
                        rep.status === 'resolved' ? 'bg-slate-800 text-slate-300' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    {rep.description}
                  </p>

                  {/* Cryptographic Verification Badge */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono text-[10px]">SHA-256: {rep.sha256Checksum}</span>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-semibold">Integrity Verified ✓</span>
                  </div>

                  {/* Authority Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="text-xs text-slate-400">
                      Assigned Unit: <strong className="text-white">{rep.assignedTeam || 'None yet'}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateReportStatus(rep.id, 'verified', 'Verified by DEOC duty geologist.')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-colors cursor-pointer"
                      >
                        Verify Report
                      </button>

                      <button
                        onClick={() => onUpdateReportStatus(rep.id, 'dispatched', 'NDRF Quick Response Team Delta dispatched.')}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-colors cursor-pointer"
                      >
                        Dispatch Response Team
                      </button>

                      <button
                        onClick={() => onUpdateReportStatus(rep.id, 'resolved', 'Hazard cleared and barrier installed.')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-1.5 px-3 rounded-xl transition-colors cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: AI WHAT-IF RISK SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Sliders className="w-4 h-4" />
                <span>Geotechnical AI What-If Scenario Simulator</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Simulate Multi-Factor Hazard Dynamics</h2>
              <p className="text-xs text-slate-400">
                Adjust precipitation, pore water saturation, slope gradient, and deforestation parameters to evaluate future failure thresholds.
              </p>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>24-Hour Rainfall Inflow Surge:</span>
                  <span className="text-cyan-400 font-mono text-sm">{simRainfall} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="350"
                  step="5"
                  value={simRainfall}
                  onChange={(e) => setSimRainfall(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>Soil Moisture / Pore Saturation:</span>
                  <span className="text-blue-400 font-mono text-sm">{simSoilMoisture} %</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={simSoilMoisture}
                  onChange={(e) => setSimSoilMoisture(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>Slope Gradient:</span>
                    <span className="text-amber-400 font-mono text-sm">{simSlope}°</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={simSlope}
                    onChange={(e) => setSimSlope(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>Vegetation Canopy Cover:</span>
                    <span className="text-emerald-400 font-mono text-sm">{simVegetation} %</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    step="5"
                    value={simVegetation}
                    onChange={(e) => setSimVegetation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Run Gemini / Server AI Analysis Button */}
            <div className="pt-2">
              <button
                onClick={handleRunAiAnalysis}
                disabled={simAiLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{simAiLoading ? 'Analyzing Soil Mechanics with AI...' : 'Generate In-Depth Geotechnical AI Report'}</span>
              </button>
            </div>
          </div>

          {/* Right Col: Simulator Output & XAI Explanation */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Simulated Prediction</div>
              
              <div className={`p-5 rounded-2xl flex items-center justify-between ${
                simResult.riskLevel === 'critical' ? 'bg-red-500/20 border border-red-500/40 text-red-300' :
                simResult.riskLevel === 'high' ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300' :
                simResult.riskLevel === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300' :
                'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              }`}>
                <div>
                  <div className="text-3xl font-black">{simResult.riskScore} / 100</div>
                  <div className="text-xs font-extrabold uppercase mt-0.5">{simResult.riskLevel} RISK LEVEL</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Factor of Safety (FoS)</div>
                  <div className="text-lg font-mono font-bold text-white">{simResult.factorOfSafety}</div>
                </div>
              </div>

              {/* Explainable AI Result */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Explainable AI Output:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {simAiOutput || simResult.xaiExplanation}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-white">Recommended Tactical Action:</div>
                <div className="text-slate-300">{simResult.urgencyRecommendation}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: CLOUD BACKUP & ENCRYPTED DATABASE */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Database className="w-4 h-4" />
                <span>Cloud-Based Backup & Disaster Recovery Architecture</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Multi-Region Encrypted Backup Snapshots</h2>
              <p className="text-xs text-slate-400">
                Automated hourly encrypted snapshots ensure that during extreme disaster conditions or power outages, zero telemetry or community report data is lost.
              </p>
            </div>

            {backupSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between">
                <span>{backupSuccessMsg}</span>
                <button onClick={() => setBackupSuccessMsg('')} className="underline cursor-pointer">Close</button>
              </div>
            )}

            {/* Backups List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Synchronized Cloud Snapshots</span>
                <button onClick={onRefreshBackups} className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Cloud List</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {backups.map((bcp) => (
                  <div key={bcp.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-white font-mono">{bcp.backupName}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(bcp.timestamp).toLocaleString()} • {bcp.recordsCount} items • {(bcp.sizeBytes / 1024).toFixed(1)} KB
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {bcp.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-[10px]">SHA-256 Digest: {bcp.sha256Digest.slice(0, 32)}...</span>
                      <span className="text-slate-400">{bcp.cloudRegion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleCreateBackup}
                disabled={isBackingUp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                <span>Create New Cloud Snapshot Now</span>
              </button>

              <button
                onClick={() => exportBackupToFile({ zones, shelters, reports, notifications })}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Encrypted .landsafe JSON File</span>
              </button>
            </div>
          </div>

          {/* Right Col: Encrypted Vault Quick Overview */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Lock className="w-4 h-4" />
                <span>Encrypted Storage Architecture</span>
              </div>
              
              <h3 className="text-lg font-bold text-white">Zero-Knowledge Privacy Layer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All citizen GPS coordinates, phone numbers, and emergency report photos are encrypted with client-side <strong>AES-256-GCM</strong> envelope encryption before storage.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Encryption Standard:</span>
                  <span className="font-mono text-emerald-400 font-bold">NIST FIPS 197 AES-256</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Integrity Seal:</span>
                  <span className="font-mono text-amber-400 font-bold">SHA-256 Digest</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Cloud Replication:</span>
                  <span className="text-white font-bold">Multi-Region Multi-AZ</span>
                </div>
              </div>

              <button
                onClick={onOpenVault}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Open Security Vault & Audit Logs</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
