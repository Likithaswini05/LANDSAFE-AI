import React, { useState, useEffect } from 'react';
import { 
  AreaZone, 
  CommunityReport, 
  NotificationAlert, 
  Shelter, 
  UserProfile, 
  CloudBackupRecord,
  NetworkMode,
  OfflineOutboxItem,
  FamilySafetyStatus
} from './types';
import { 
  INITIAL_ZONES, 
  INITIAL_SHELTERS, 
  INITIAL_REPORTS, 
  INITIAL_NOTIFICATIONS, 
  DEMO_CITIZEN_USER, 
  DEMO_AUTHORITY_USER,
  INITIAL_FAMILY_CHECKINS
} from './lib/mockData';
import { getStoredBackups } from './lib/backupService';
import { playAlertChime } from './lib/audioService';
import { Navbar } from './components/Navbar';
import { CitizenPortal } from './components/CitizenPortal';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { EncryptedDataModal } from './components/EncryptedDataModal';
import { OfflineEmergencyModal } from './components/OfflineEmergencyModal';
import { EmergencyStrobeOverlay } from './components/EmergencyStrobeOverlay';
import { SurvivalGuideModal } from './components/SurvivalGuideModal';
import { OutboxModal } from './components/OutboxModal';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';

export default function App() {
  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEMO_CITIZEN_USER);
  const [currentPortal, setCurrentPortal] = useState<'citizen' | 'authority'>('citizen');

  // Network & Offline Outbox State
  const [networkMode, setNetworkMode] = useState<NetworkMode>('online');
  const [outboxItems, setOutboxItems] = useState<OfflineOutboxItem[]>([
    {
      id: 'outbox-1',
      type: 'family_checkin',
      title: 'Safety Check-in for Rahul Sharma',
      createdAt: '5 mins ago',
      data: { status: 'safe', location: 'Meppadi High School' },
      synced: false,
      meshRelayHops: 2,
    }
  ]);

  // Core Geological & Disaster State
  const [zones, setZones] = useState<AreaZone[]>(INITIAL_ZONES);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [reports, setReports] = useState<CommunityReport[]>(INITIAL_REPORTS);
  const [notifications, setNotifications] = useState<NotificationAlert[]>(INITIAL_NOTIFICATIONS);
  const [selectedZone, setSelectedZone] = useState<AreaZone>(INITIAL_ZONES[0]);
  const [backups, setBackups] = useState<CloudBackupRecord[]>([]);
  const [familyCheckins, setFamilyCheckins] = useState<FamilySafetyStatus[]>(INITIAL_FAMILY_CHECKINS);

  // Navigation Tabs State
  const [activeCitizenTab, setActiveCitizenTab] = useState<string>('map');
  const [activeAuthorityTab, setActiveAuthorityTab] = useState<string>('overview');

  // Audio Chime State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals Visibility
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'citizen' | 'authority'>('citizen');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [isOfflineOpen, setIsOfflineOpen] = useState<boolean>(false);
  const [isStrobeOpen, setIsStrobeOpen] = useState<boolean>(false);
  const [isSurvivalGuideOpen, setIsSurvivalGuideOpen] = useState<boolean>(false);
  const [isOutboxOpen, setIsOutboxOpen] = useState<boolean>(false);

  // Banner Broadcast Alert Toast
  const [latestUrgentAlert, setLatestUrgentAlert] = useState<NotificationAlert | null>(null);

  // Fetch Cloud Backups on Mount
  useEffect(() => {
    getStoredBackups().then(res => setBackups(res));
  }, []);

  // Toggle Network Mode (Online Cloud ⇄ Offline Mesh)
  const handleToggleNetworkMode = () => {
    setNetworkMode(prev => {
      const next = prev === 'online' ? 'offline' : 'online';
      // Post notification
      const modeNotif: NotificationAlert = {
        id: `notif-${Date.now()}`,
        title: next === 'offline' ? 'System Switched to OFFLINE MESH Mode' : 'System Connected: ONLINE Cloud Sync Active',
        message: next === 'offline' 
          ? 'Data will be safely queued in encrypted local storage and broadcast via LoRa/P2P mesh.' 
          : 'Local outbox will automatically synchronize with cloud servers.',
        severity: next === 'offline' ? 'warning' : 'info',
        priority: 'P2',
        timestamp: 'Just now',
        targetAudience: 'all',
        isRead: false,
        broadcastedBy: 'System Mode Controller'
      };
      setNotifications(n => [modeNotif, ...n]);
      return next;
    });
  };

  // Sync all outbox items
  const handleSyncOutbox = async () => {
    // Simulate network transmission delay
    await new Promise(r => setTimeout(r, 1200));
    setOutboxItems(prev => prev.map(item => ({ ...item, synced: true })));
    setNetworkMode('online');
  };

  // Clear single outbox item
  const handleClearOutboxItem = (id: string) => {
    setOutboxItems(prev => prev.filter(item => item.id !== id));
  };

  // Add Family Checkin
  const handleAddCheckin = (newCheckin: FamilySafetyStatus) => {
    setFamilyCheckins(prev => [newCheckin, ...prev]);

    // If offline, also append to outbox
    if (networkMode === 'offline') {
      const outboxEntry: OfflineOutboxItem = {
        id: `outbox-${Date.now()}`,
        type: 'family_checkin',
        title: `Safety Check-in: ${newCheckin.userName} (${newCheckin.status.toUpperCase()})`,
        createdAt: 'Just now',
        data: newCheckin,
        synced: false,
        meshRelayHops: 1,
      };
      setOutboxItems(prev => [outboxEntry, ...prev]);
    }
  };

  // Portal switch handler
  const handleSwitchPortal = (portal: 'citizen' | 'authority') => {
    if (portal === 'authority' && currentUser?.role === 'citizen') {
      setAuthDefaultTab('authority');
      setIsAuthOpen(true);
      return;
    }
    setCurrentPortal(portal);
  };

  // Auth handler
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'citizen') {
      setCurrentPortal('citizen');
    } else {
      setCurrentPortal('authority');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPortal('citizen');
    setActiveCitizenTab('map');
  };

  const handleOpenAuth = (tab: 'citizen' | 'authority' = 'citizen') => {
    setAuthDefaultTab(tab);
    setIsAuthOpen(true);
  };

  // Community report submission
  const handleSubmitReport = (newReport: CommunityReport) => {
    setReports(prev => [newReport, ...prev]);

    if (networkMode === 'offline') {
      const outboxEntry: OfflineOutboxItem = {
        id: `outbox-${Date.now()}`,
        type: 'report',
        title: `Report: ${newReport.type.replace('_', ' ').toUpperCase()} at ${newReport.locationName}`,
        createdAt: 'Just now',
        data: newReport,
        synced: false,
        meshRelayHops: 1,
      };
      setOutboxItems(prev => [outboxEntry, ...prev]);
    }

    // Create system notification for authorities
    const alertNotif: NotificationAlert = {
      id: `notif-${Date.now()}`,
      title: `New Citizen Warning: ${newReport.type.replace('_', ' ').toUpperCase()}`,
      message: `${newReport.reporterName} reported ${newReport.description.slice(0, 100)}... at ${newReport.locationName}`,
      severity: newReport.severity === 'critical' ? 'critical' : newReport.severity === 'high' ? 'warning' : 'info',
      priority: newReport.severity === 'critical' ? 'P1' : 'P2',
      timestamp: 'Just now',
      targetAudience: 'authorities',
      isRead: false,
      broadcastedBy: 'Citizen Early Warning Mesh'
    };

    setNotifications(prev => [alertNotif, ...prev]);
    if (soundEnabled) {
      playAlertChime(alertNotif.severity);
    }
  };

  // Broadcast alert from Authority
  const handleBroadcastAlert = (newAlert: NotificationAlert) => {
    setNotifications(prev => [newAlert, ...prev]);
    setLatestUrgentAlert(newAlert);
    if (soundEnabled) {
      playAlertChime(newAlert.severity);
    }
  };

  // Zone evacuation status update
  const handleUpdateZoneEvacuation = (zoneId: string, status: AreaZone['evacuationStatus']) => {
    setZones(prev =>
      prev.map(z => {
        if (z.id === zoneId) {
          return {
            ...z,
            evacuationStatus: status,
            lastUpdated: 'Just now (Command Order)',
          };
        }
        return z;
      })
    );

    if (selectedZone.id === zoneId) {
      setSelectedZone(prev => ({ ...prev, evacuationStatus: status }));
    }
  };

  // Report status update
  const handleUpdateReportStatus = (reportId: string, status: CommunityReport['status'], notes?: string) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status,
            authorityNotes: notes || r.authorityNotes,
            assignedTeam: status === 'dispatched' ? 'NDRF Quick Response Team Delta' : r.assignedTeam
          };
        }
        return r;
      })
    );
  };

  // Shelter status update
  const handleUpdateShelterStatus = (shelterId: string, status: Shelter['status'], occupied: number) => {
    setShelters(prev =>
      prev.map(s => {
        if (s.id === shelterId) {
          return {
            ...s,
            status,
            occupied,
          };
        }
        return s;
      })
    );
  };

  // Notifications read handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleSelectNotificationArea = (areaId: string) => {
    const target = zones.find(z => z.id === areaId);
    if (target) {
      setSelectedZone(target);
      if (currentPortal === 'citizen') {
        setActiveCitizenTab('map');
      } else {
        setActiveAuthorityTab('overview');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentPortal={currentPortal}
        onSwitchPortal={handleSwitchPortal}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        networkMode={networkMode}
        onToggleNetworkMode={handleToggleNetworkMode}
        outboxCount={outboxItems.filter(i => !i.synced).length}
        onOpenOutbox={() => setIsOutboxOpen(true)}
        onOpenOfflineMode={() => setIsOfflineOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenStrobe={() => setIsStrobeOpen(true)}
        onOpenSurvivalGuide={() => setIsSurvivalGuideOpen(true)}
        activeCitizenTab={activeCitizenTab}
        setActiveCitizenTab={setActiveCitizenTab}
        activeAuthorityTab={activeAuthorityTab}
        setActiveAuthorityTab={setActiveAuthorityTab}
      />

      {/* Floating Urgent Broadcast Alert Banner (if triggered) */}
      {latestUrgentAlert && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-3 shadow-xl flex items-center justify-between z-30 animate-fade-in border-b border-red-500/50">
          <div className="max-w-7xl mx-auto flex items-center gap-3 w-full">
            <ShieldAlert className="w-5 h-5 shrink-0 animate-bounce" />
            <div className="text-xs sm:text-sm font-semibold flex-1">
              <strong className="uppercase font-black tracking-wide mr-2">[{latestUrgentAlert.priority} ALERT]:</strong>
              <span>{latestUrgentAlert.title} — {latestUrgentAlert.message}</span>
            </div>
            <button
              onClick={() => setLatestUrgentAlert(null)}
              className="p-1 hover:bg-black/20 rounded-lg transition-colors cursor-pointer text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPortal === 'citizen' ? (
          <CitizenPortal
            currentUser={currentUser}
            zones={zones}
            shelters={shelters}
            reports={reports}
            notifications={notifications}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            activeTab={activeCitizenTab}
            setActiveTab={setActiveCitizenTab}
            onSubmitReport={handleSubmitReport}
            onOpenAuth={() => handleOpenAuth('citizen')}
            onOpenOfflineMode={() => setIsOfflineOpen(true)}
            onOpenVault={() => setIsVaultOpen(true)}
            networkMode={networkMode}
            familyCheckins={familyCheckins}
            onAddCheckin={handleAddCheckin}
            onOpenStrobe={() => setIsStrobeOpen(true)}
            onOpenSurvivalGuide={() => setIsSurvivalGuideOpen(true)}
          />
        ) : (
          <AuthorityDashboard
            currentUser={currentUser}
            zones={zones}
            shelters={shelters}
            reports={reports}
            notifications={notifications}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            activeTab={activeAuthorityTab}
            setActiveTab={setActiveAuthorityTab}
            onBroadcastAlert={handleBroadcastAlert}
            onUpdateZoneEvacuation={handleUpdateZoneEvacuation}
            onUpdateReportStatus={handleUpdateReportStatus}
            onUpdateShelterStatus={handleUpdateShelterStatus}
            backups={backups}
            onRefreshBackups={() => getStoredBackups().then(res => setBackups(res))}
            onOpenVault={() => setIsVaultOpen(true)}
            familyCheckins={familyCheckins}
            networkMode={networkMode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">LandSafe AI</span>
            <span>•</span>
            <span>AI-Powered Landslide Early Warning & Risk Mapping System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsVaultOpen(true)} className="hover:text-cyan-400 transition-colors cursor-pointer">
              AES-256 Vault
            </button>
            <span>•</span>
            <button onClick={() => setIsOutboxOpen(true)} className="hover:text-cyan-400 transition-colors cursor-pointer">
              Outbox ({outboxItems.filter(i => !i.synced).length})
            </button>
            <span>•</span>
            <button onClick={() => setIsSurvivalGuideOpen(true)} className="hover:text-amber-400 transition-colors cursor-pointer">
              Survival Manual
            </button>
            <span>•</span>
            <button onClick={() => setIsStrobeOpen(true)} className="hover:text-red-400 transition-colors cursor-pointer">
              Distress Strobe
            </button>
            <span>•</span>
            <span>Emergency: 1077 / 112</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        defaultTab={authDefaultTab}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectNotificationArea={handleSelectNotificationArea}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      <EncryptedDataModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />

      <OfflineEmergencyModal
        isOpen={isOfflineOpen}
        onClose={() => setIsOfflineOpen(false)}
        shelters={shelters}
        onOpenStrobe={() => {
          setIsOfflineOpen(false);
          setIsStrobeOpen(true);
        }}
        onOpenSurvivalManual={() => {
          setIsOfflineOpen(false);
          setIsSurvivalGuideOpen(true);
        }}
      />

      {/* Emergency Strobe and Directional Beacon Overlay */}
      <EmergencyStrobeOverlay
        isOpen={isStrobeOpen}
        onClose={() => setIsStrobeOpen(false)}
        shelters={shelters}
      />

      {/* Field Geotechnical Survival Guide Modal */}
      <SurvivalGuideModal
        isOpen={isSurvivalGuideOpen}
        onClose={() => setIsSurvivalGuideOpen(false)}
        onOpenStrobe={() => setIsStrobeOpen(true)}
      />

      {/* Offline Outbox & Mesh Queue Modal */}
      <OutboxModal
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
        networkMode={networkMode}
        outboxItems={outboxItems}
        onSyncAll={handleSyncOutbox}
        onClearItem={handleClearOutboxItem}
      />
    </div>
  );
}
