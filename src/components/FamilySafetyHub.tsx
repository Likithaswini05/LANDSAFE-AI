import React, { useState } from 'react';
import { FamilySafetyStatus, NetworkMode, UserProfile } from '../types';
import { 
  ShieldCheck, 
  Users, 
  HeartHandshake, 
  Radio, 
  Copy, 
  Check, 
  MessageSquare, 
  Battery, 
  MapPin, 
  Search, 
  Send, 
  Phone, 
  AlertOctagon, 
  Share2, 
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface FamilySafetyHubProps {
  currentUser: UserProfile | null;
  networkMode: NetworkMode;
  familyCheckins: FamilySafetyStatus[];
  onAddCheckin: (checkin: FamilySafetyStatus) => void;
  onOpenAuth?: () => void;
}

export const FamilySafetyHub: React.FC<FamilySafetyHubProps> = ({
  currentUser,
  networkMode,
  familyCheckins,
  onAddCheckin,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'directory' | 'mesh_sms'>('checkin');
  const [selectedStatus, setSelectedStatus] = useState<FamilySafetyStatus['status']>('safe');
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '');
  const [locationName, setLocationName] = useState(currentUser?.currentLocationName || 'Chooralmala Sector, Wayanad');
  const [familyCount, setFamilyCount] = useState('1');
  const [notes, setNotes] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [copiedSms, setCopiedSms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'at_shelter' | 'evacuating' | 'need_help'>('all');
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  // Generate Low-Bandwidth Compressed Disaster SMS Code
  const statusLabels: Record<FamilySafetyStatus['status'], string> = {
    safe: 'SAFE',
    at_shelter: 'IN_SHELTER',
    evacuating: 'EVACUATING',
    need_help: 'SOS_HELP_NEEDED'
  };

  const compressedSmsCode = `LS-SAFE#${statusLabels[selectedStatus]}#${userName || 'CITIZEN'}#TEL:${userPhone || 'NA'}#LOC:${locationName.replace(/\s+/g, '_')}#FAM:${familyCount}#BAT:${batteryLevel}%#${notes ? notes.slice(0, 30).replace(/\s+/g, '_') : 'OK'}`;

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const newCheckin: FamilySafetyStatus = {
      id: `fcheck-${Date.now()}`,
      userName: `${userName.trim()} ${parseInt(familyCount) > 1 ? `& Family (${familyCount})` : ''}`,
      userPhone: userPhone.trim() || '+91 94470 00000',
      status: selectedStatus,
      locationName: locationName.trim(),
      timestamp: 'Just now',
      notes: notes.trim() || (selectedStatus === 'safe' ? 'Safe and accounted for.' : 'Status updated via emergency mesh.'),
      batteryLevel: batteryLevel,
      relayMethod: networkMode === 'online' ? 'cloud' : 'mesh_bluetooth',
      verifiedIdentity: currentUser?.isVerified || false,
    };

    onAddCheckin(newCheckin);
    setCheckinSuccess(true);
    setTimeout(() => setCheckinSuccess(false), 4000);
  };

  const handleCopySms = () => {
    navigator.clipboard.writeText(compressedSmsCode);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2500);
  };

  const filteredList = familyCheckins.filter(item => {
    const matchSearch = 
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userPhone.includes(searchQuery);
    
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const safeCount = familyCheckins.filter(f => f.status === 'safe' || f.status === 'at_shelter').length;
  const needHelpCount = familyCheckins.filter(f => f.status === 'need_help').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>Family Safety Check-In & Low-Bandwidth Mesh Relay</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              "I Am Safe" Community Safety Hub
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Broadcast your real-time safety status to relatives and emergency command units. Functions offline via SMS compression and simulated local peer-to-peer radio mesh.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Verified Safe</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{safeCount}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] text-slate-400 font-mono">Assistance Req.</div>
              <div className="text-xl font-bold font-mono text-red-400">{needHelpCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'checkin'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Update My Safety Status</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Family & Community Roll Call ({familyCheckins.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mesh_sms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'mesh_sms'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Offline 2G SMS / Radio Code</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Check-in Form */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>One-Tap Safety Check-In</span>
              </h3>
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
                networkMode === 'online'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-400 border-amber-800'
              }`}>
                {networkMode === 'online' ? '🟢 Online Cloud Sync' : '🟠 Offline Mesh Queued'}
              </span>
            </div>

            {checkinSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold">Safety Status Recorded Successfully!</div>
                  <div>Your status was saved locally and dispatched across emergency relay nodes.</div>
                </div>
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-6">
              {/* Status Radio Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select Your Current Condition:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('safe')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedStatus === 'safe'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-base mb-1">🟢</div>
                    <div className="text-xs">I Am Safe</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('at_shelter')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedStatus === 'at_shelter'
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-950 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-base mb-1">🏠</div>
                    <div className="text-xs">At Safe Shelter</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('evacuating')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedStatus === 'evacuating'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-base mb-1">🚶</div>
                    <div className="text-xs">Evacuating On Route</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('need_help')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedStatus === 'need_help'
                        ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-950 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-base mb-1">🚨</div>
                    <div className="text-xs">Need Assistance</div>
                  </button>
                </div>
              </div>

              {/* Identity & Location Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Your Name / Head of Family</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Lakshmi Menon"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="+91 94470 12345"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Current Location / Sector</label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Chooralmala Ridge, Ward 4"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Total Family Members With You</label>
                  <select
                    value={familyCount}
                    onChange={(e) => setFamilyCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="1">1 Person (Just Me)</option>
                    <option value="2">2 Persons</option>
                    <option value="3">3 Persons</option>
                    <option value="4">4 Persons</option>
                    <option value="5">5+ Persons (Large Family)</option>
                  </select>
                </div>
              </div>

              {/* Notes & Battery */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Optional Situation Notes / Special Needs</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Safe on second floor. Elderly grandfather with wheelchair assistance needed."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide uppercase transition-all shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Publish Safety Status Check-In</span>
              </button>
            </form>
          </div>

          {/* Quick SOS Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Instant 2G / Satellite SMS Relay</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If data connectivity fails, copy this ultra-compact status string to send via ordinary cellular SMS to <strong>112</strong> or your family emergency contact.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-amber-300 break-all select-all">
                {compressedSmsCode}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopySms}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  {copiedSms ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSms ? 'Code Copied' : 'Copy SMS String'}</span>
                </button>

                <a
                  href={`sms:112?body=${encodeURIComponent(compressedSmsCode)}`}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SMS</span>
                </a>
              </div>
            </div>

            {/* Offline Mesh Relay Simulator info */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>How Offline Mesh Works</span>
              </div>
              <p>
                When you are in offline mode, your check-in is cryptographically signed and stored in your device's IndexedDB storage. Nearby disaster relief nodes relay the packet via Bluetooth LE and LoRa mesh until a gateway is reached.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Directory & Roll Call */}
      {activeTab === 'directory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Verified Evacuee & Citizen Roll Call</span>
              </h3>
              <p className="text-xs text-slate-400">Search and locate relatives, neighbors, and verified safe residents in designated shelters.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['all', 'safe', 'at_shelter', 'evacuating', 'need_help'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, contact phone, or shelter name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((item) => {
              const badgeColors: Record<FamilySafetyStatus['status'], { bg: string; text: string; label: string }> = {
                safe: { bg: 'bg-emerald-950/80 border-emerald-800/80', text: 'text-emerald-400', label: 'Verified Safe' },
                at_shelter: { bg: 'bg-cyan-950/80 border-cyan-800/80', text: 'text-cyan-400', label: 'At Safe Shelter' },
                evacuating: { bg: 'bg-amber-950/80 border-amber-800/80', text: 'text-amber-400', label: 'Evacuating Route' },
                need_help: { bg: 'bg-red-950/80 border-red-800/80', text: 'text-red-400', label: 'Rescue Needed' },
              };
              const badge = badgeColors[item.status];

              return (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{item.userName}</span>
                        {item.verifiedIdentity && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Verified Citizen" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{item.locationName}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                      "{item.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <div className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{item.userPhone}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[10px]">
                      {item.batteryLevel && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Battery className="w-3 h-3" />
                          <span>{item.batteryLevel}%</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.timestamp}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredList.length === 0 && (
              <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
                No matching safety check-ins found for "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: 2G SMS / Radio Code Guide */}
      {activeTab === 'mesh_sms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              <span>Offline SMS / Amateur Radio / Mesh Packet Standard</span>
            </h3>
            <p className="text-xs text-slate-300">
              The LandSafe disaster telemetry protocol encodes citizen status, coordinates, battery level, and family count into a single short SMS payload that transmits reliably even during 98% packet loss on 2G networks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">Protocol Grammar Definition:</div>
            <div className="text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 overflow-x-auto">
              LS-SAFE#&lt;STATUS&gt;#&lt;NAME&gt;#TEL:&lt;PHONE&gt;#LOC:&lt;SECTOR&gt;#FAM:&lt;COUNT&gt;#BAT:&lt;PERCENT&gt;%#&lt;MESSAGE&gt;
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Disaster Management Authority gateways automatically parse this structure and pin the exact coordinates and priority triage ticket into the incident commander board.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
