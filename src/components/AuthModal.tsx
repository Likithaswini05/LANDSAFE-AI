import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_CITIZEN_USER, DEMO_AUTHORITY_USER } from '../lib/mockData';
import { Shield, User, Lock, Key, CheckCircle, Award, Building, Sparkles, X, Phone, Mail, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  defaultTab?: 'citizen' | 'authority';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  defaultTab = 'citizen',
}) => {
  const [activeTab, setActiveTab] = useState<'citizen' | 'authority'>(defaultTab);

  // Citizen Form State
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenVerifyToggle, setCitizenVerifyToggle] = useState(true);

  // Authority Form State
  const [authBadgeId, setAuthBadgeId] = useState('');
  const [authDepartment, setAuthDepartment] = useState('State Disaster Management Authority (SDMA)');
  const [authRole, setAuthRole] = useState<UserRole>('incident_commander');
  const [authSecurityPass, setAuthSecurityPass] = useState('');
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `usr-cit-${Date.now().toString().slice(-4)}`,
      name: citizenName.trim() || 'Praveen Kumar',
      email: citizenEmail.trim() || 'praveen.citizen@kerala.res.in',
      phone: citizenPhone.trim() || '+91 94472 88192',
      role: 'citizen',
      isVerified: citizenVerifyToggle,
      verificationBadgeNumber: citizenVerifyToggle ? `IN-KL-CIT-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      trustedReporterScore: citizenVerifyToggle ? 95 : 60,
      currentLocationName: 'Chooralmala Sector, Wayanad',
      currentCoordinates: [11.5390, 76.1650],
      emergencyContacts: [
        { name: 'Family Emergency Line', relation: 'Family', phone: '+91 98470 55443' },
        { name: 'District Disaster Control Room', relation: 'Govt DEOC', phone: '1077' }
      ]
    };

    if (citizenVerifyToggle) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    }

    onLogin(newUser);
    onClose();
  };

  const handleAuthoritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const badge = authBadgeId.trim() || 'SDMA-IC-9021';
    
    const newUser: UserProfile = {
      id: `usr-auth-${Date.now().toString().slice(-4)}`,
      name: authRole === 'incident_commander' ? 'Cmdr. Rajesh K. Varma' : authRole === 'geotech_analyst' ? 'Dr. Anita Shenoy (Lead Geologist)' : 'Officer Arun Krishnan',
      email: `${badge.toLowerCase()}@sdma.gov.in`,
      phone: '+91 94479 99001',
      role: authRole,
      isVerified: true,
      badgeId: badge,
      department: authDepartment,
      assignedSector: 'Wayanad High Hazard Zone (Sector-A)',
      verificationBadgeNumber: `GOV-AUTH-SEAL-${badge}`,
    };

    confetti({ particleCount: 75, spread: 70, origin: { y: 0.7 } });
    onLogin(newUser);
    onClose();
  };

  const handleQuickDemoCitizen = () => {
    onLogin(DEMO_CITIZEN_USER);
    onClose();
  };

  const handleQuickDemoAuthority = (role: UserRole) => {
    const authorityProfile: UserProfile = {
      ...DEMO_AUTHORITY_USER,
      role: role,
      name: role === 'incident_commander' ? 'Cmdr. Rajesh K. Varma' : role === 'geotech_analyst' ? 'Dr. Anita Shenoy (Lead Geologist)' : 'Admin A. K. Nambiar',
      badgeId: role === 'incident_commander' ? 'SDMA-IC-9021' : role === 'geotech_analyst' ? 'GSI-GEO-4412' : 'GOV-ADMIN-001',
    };
    onLogin(authorityProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with Portal Switcher */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>LandSafe AI Secure Authentication</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">Choose Portal Access</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-2 gap-2 bg-slate-950/40 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('citizen')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'citizen'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Citizen / Public Access</span>
          </button>

          <button
            onClick={() => setActiveTab('authority')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'authority'
                ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-lg shadow-amber-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Authority & Disaster Command</span>
          </button>
        </div>

        {/* Tab 1: Citizen Portal */}
        {activeTab === 'citizen' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-emerald-300">Citizen Safety Experience:</span> Access real-time local hazard maps, live shelter capacity, evacuation navigation, and submit encrypted ground warning reports with priority verification.
              </div>
            </div>

            <form onSubmit={handleCitizenSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Lakshmi Menon"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone (for SMS Alerts)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="+91 98471 23456"
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="lakshmi.citizen@example.com"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Verified Account Badge Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Enable Verified Citizen Account Badge</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Provides priority incident report triage & instant push alerts.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={citizenVerifyToggle}
                  onChange={(e) => setCitizenVerifyToggle(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Enter Citizen Safety Portal</span>
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-400 mb-2 font-medium">Quick 1-Click Demo Citizen:</div>
              <button
                onClick={handleQuickDemoCitizen}
                className="w-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs py-2 px-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold text-white">Lakshmi Menon</span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">Verified Citizen</span>
                </div>
                <span className="text-slate-400 text-[11px]">Chooralmala Sector &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Authority Command Portal */}
        {activeTab === 'authority' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-amber-300">Restricted Authority Access:</span> Incident Commanders, Geotechnical Analysts, and Emergency Responders have elevated privileges to broadcast mass alerts, order evacuations, and trigger cloud backups.
              </div>
            </div>

            <form onSubmit={handleAuthoritySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Agency Badge ID</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. SDMA-IC-9021"
                      value={authBadgeId}
                      onChange={(e) => setAuthBadgeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Command Role</label>
                  <select
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="incident_commander">Incident Commander (Operations Head)</option>
                    <option value="geotech_analyst">Lead Geotechnical AI Analyst</option>
                    <option value="authority_officer">Field Response Officer (NDRF / Police)</option>
                    <option value="admin">District Operations Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department / Organization</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={authDepartment}
                    onChange={(e) => setAuthDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">2FA Security Token / Master Passkey</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={authSecurityPass}
                    onChange={(e) => setAuthSecurityPass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Authorize & Enter Command Center</span>
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 font-medium">Quick 1-Click Role Presets:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickDemoAuthority('incident_commander')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-xs text-amber-300">Cmdr. Rajesh Varma</div>
                  <div className="text-[10px] text-slate-400">Incident Commander (SDMA)</div>
                </button>
                <button
                  onClick={() => handleQuickDemoAuthority('geotech_analyst')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-xs text-cyan-300">Dr. Anita Shenoy</div>
                  <div className="text-[10px] text-slate-400">Lead Geotechnical Analyst (GSI)</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
