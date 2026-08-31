import React from 'react';
import { UserProfile, NotificationAlert, NetworkMode } from '../types';
import { 
  Shield, 
  User, 
  Bell, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  Database, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  LogOut, 
  Activity,
  Layers,
  MapPin,
  FileText,
  LifeBuoy,
  Radio,
  Zap,
  BookOpen,
  HeartHandshake,
  Navigation,
  Sparkles,
  Inbox
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentPortal: 'citizen' | 'authority';
  onSwitchPortal: (portal: 'citizen' | 'authority') => void;
  onOpenAuth: (tab?: 'citizen' | 'authority') => void;
  onLogout: () => void;
  notifications: NotificationAlert[];
  onOpenNotifications: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  networkMode: NetworkMode;
  onToggleNetworkMode: () => void;
  outboxCount: number;
  onOpenOutbox: () => void;
  onOpenOfflineMode: () => void;
  onOpenVault: () => void;
  onOpenStrobe: () => void;
  onOpenSurvivalGuide: () => void;
  activeCitizenTab: string;
  setActiveCitizenTab: (tab: string) => void;
  activeAuthorityTab: string;
  setActiveAuthorityTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentPortal,
  onSwitchPortal,
  onOpenAuth,
  onLogout,
  notifications,
  onOpenNotifications,
  soundEnabled,
  onToggleSound,
  networkMode,
  onToggleNetworkMode,
  outboxCount,
  onOpenOutbox,
  onOpenOfflineMode,
  onOpenVault,
  onOpenStrobe,
  onOpenSurvivalGuide,
  activeCitizenTab,
  setActiveCitizenTab,
  activeAuthorityTab,
  setActiveAuthorityTab,
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isAuthorityRole = currentUser?.role && currentUser.role !== 'citizen';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner / System Telemetry & Mode Control Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Network Mode Status Pill */}
          <button
            onClick={onToggleNetworkMode}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold transition-all cursor-pointer border ${
              networkMode === 'online'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                : 'bg-amber-950/90 text-amber-300 border-amber-700/80 hover:bg-amber-900 animate-pulse'
            }`}
            title="Click to toggle between Online Cloud Sync & Offline Field Mesh Mode"
          >
            {networkMode === 'online' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <Wifi className="w-3 h-3" />
                <span>ONLINE (Cloud Live)</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE (Mesh Active)</span>
              </>
            )}
          </button>

          {/* Outbox Badge if items pending */}
          {outboxCount > 0 && (
            <button
              onClick={onOpenOutbox}
              className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-700 text-cyan-300 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold hover:bg-cyan-900 transition-colors cursor-pointer"
              title="View queued offline reports & telemetry"
            >
              <Inbox className="w-3 h-3" />
              <span>{outboxCount} Queued Outbox</span>
            </button>
          )}

          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400 font-mono">
            {networkMode === 'online' ? 'Real-Time Inclinometers & Weather Live' : 'Local IndexedDB Cache & P2P Radio Relay'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Night Distress Strobe Launcher */}
          <button
            onClick={onOpenStrobe}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer font-bold"
            title="Emergency Strobe Light & Directional Rescue HUD"
          >
            <Zap className="w-3 h-3 text-red-400 animate-bounce" />
            <span className="hidden md:inline">SOS Strobe</span>
          </button>

          {/* Field Survival Manual */}
          <button
            onClick={onOpenSurvivalGuide}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="Offline Field Manual & Geotechnical Checklist"
          >
            <BookOpen className="w-3 h-3 text-amber-400" />
            <span className="hidden lg:inline">Survival Manual</span>
          </button>

          <button
            onClick={onOpenVault}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Encrypted Database Storage & Zero-Knowledge Verification"
          >
            <Lock className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline font-mono">AES-256 Vault</span>
          </button>

          <button
            onClick={onOpenOfflineMode}
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
            title="Offline Emergency Survival Pack & Quick Directory"
          >
            <Radio className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Tactical Kit</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSwitchPortal(currentPortal)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <Shield className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  LANDSAFE <span className="text-amber-400">AI</span>
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700">v2.5</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide font-medium hidden sm:block">
                Online & Offline Disaster Shield
              </p>
            </div>
          </div>

          {/* Portal Switcher Pill */}
          <div className="hidden lg:flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl ml-4">
            <button
              onClick={() => onSwitchPortal('citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPortal === 'citizen'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => {
                if (!isAuthorityRole && !currentUser) {
                  onOpenAuth('authority');
                } else {
                  onSwitchPortal('authority');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPortal === 'authority'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Authority Command</span>
              {isAuthorityRole && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>}
            </button>
          </div>
        </div>

        {/* Center Navigation Links depending on active portal */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto max-w-2xl">
          {currentPortal === 'citizen' ? (
            <>
              <button
                onClick={() => setActiveCitizenTab('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeCitizenTab === 'map' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                Live Risk Map
              </button>
              <button
                onClick={() => setActiveCitizenTab('myarea')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeCitizenTab === 'myarea' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                My Area Risk
              </button>
              <button
                onClick={() => setActiveCitizenTab('safety')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeCitizenTab === 'safety' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <span>"I Am Safe" Hub</span>
              </button>
              <button
                onClick={() => setActiveCitizenTab('shelters')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeCitizenTab === 'shelters' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                Safe Shelters & Routes
              </button>
              <button
                onClick={() => setActiveCitizenTab('report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeCitizenTab === 'report' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                Report Warning Signs
              </button>
              <button
                onClick={() => setActiveCitizenTab('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeCitizenTab === 'timeline' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                Risk History
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveAuthorityTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeAuthorityTab === 'overview' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                Command Center
              </button>
              <button
                onClick={() => setActiveAuthorityTab('priority')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeAuthorityTab === 'priority' ? 'bg-slate-800 text-red-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                Priority Alerts
              </button>
              <button
                onClick={() => setActiveAuthorityTab('sensors')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeAuthorityTab === 'sensors' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>IoT Sensors</span>
              </button>
              <button
                onClick={() => setActiveAuthorityTab('triage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeAuthorityTab === 'triage' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                Citizen Triage
              </button>
              <button
                onClick={() => setActiveAuthorityTab('simulator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeAuthorityTab === 'simulator' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                AI What-If
              </button>
              <button
                onClick={() => setActiveAuthorityTab('backup')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeAuthorityTab === 'backup' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white'
                }`}
              >
                Cloud Backup
              </button>
            </>
          )}
        </nav>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Alert Chime Sound: ON' : 'Alert Chime Sound: MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Real-time Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Real-time Disaster Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-lg shadow-red-500/50 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Account / Auth Trigger */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                  <span>{currentUser.name}</span>
                  {currentUser.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Verified Account" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {currentUser.role === 'citizen' ? (
                    <span className="text-emerald-400">Verified Citizen</span>
                  ) : (
                    <span className="text-amber-400">{currentUser.badgeId || 'Authority'}</span>
                  )}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
                title="Sign Out / Switch Profile"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <button
                onClick={() => onOpenAuth('citizen')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-all shadow-md shadow-emerald-950 cursor-pointer"
              >
                Citizen Login
              </button>
              <button
                onClick={() => onOpenAuth('authority')}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer"
              >
                Authority Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Portal & Sub-Navigation Bar */}
      <div className="flex md:hidden items-center justify-between px-4 py-2 bg-slate-900 border-t border-slate-800 text-xs overflow-x-auto gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onSwitchPortal('citizen')}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
              currentPortal === 'citizen' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => {
              if (!isAuthorityRole && !currentUser) {
                onOpenAuth('authority');
              } else {
                onSwitchPortal('authority');
              }
            }}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
              currentPortal === 'authority' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            Command
          </button>
        </div>

        {/* Mobile quick links */}
        <div className="flex items-center gap-1 shrink-0">
          {currentPortal === 'citizen' ? (
            <>
              <button
                onClick={() => setActiveCitizenTab('map')}
                className={`px-2 py-1 rounded text-[11px] ${activeCitizenTab === 'map' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
              >
                Map
              </button>
              <button
                onClick={() => setActiveCitizenTab('safety')}
                className={`px-2 py-1 rounded text-[11px] ${activeCitizenTab === 'safety' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
              >
                I Am Safe
              </button>
              <button
                onClick={() => setActiveCitizenTab('shelters')}
                className={`px-2 py-1 rounded text-[11px] ${activeCitizenTab === 'shelters' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
              >
                Shelters
              </button>
              <button
                onClick={() => setActiveCitizenTab('report')}
                className={`px-2 py-1 rounded text-[11px] ${activeCitizenTab === 'report' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'}`}
              >
                Report
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveAuthorityTab('overview')}
                className={`px-2 py-1 rounded text-[11px] ${activeAuthorityTab === 'overview' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveAuthorityTab('priority')}
                className={`px-2 py-1 rounded text-[11px] ${activeAuthorityTab === 'priority' ? 'bg-slate-800 text-red-400' : 'text-slate-400'}`}
              >
                Alerts
              </button>
              <button
                onClick={() => setActiveAuthorityTab('sensors')}
                className={`px-2 py-1 rounded text-[11px] ${activeAuthorityTab === 'sensors' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
              >
                Sensors
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
