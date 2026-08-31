import React, { useState } from 'react';
import { NotificationAlert } from '../types';
import { Bell, X, Check, Volume2, VolumeX, ShieldAlert, AlertTriangle, Info, MapPin } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationAlert[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectNotificationArea?: (areaId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectNotificationArea,
  soundEnabled,
  onToggleSound,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'critical') return n.severity === 'critical';
    if (filter === 'warning') return n.severity === 'warning';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Disaster Notifications</h3>
              <div className="text-[11px] text-slate-400 font-mono">{unreadCount} Unread Alerts</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg border transition-colors ${
                soundEnabled ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title="Toggle Audio Alert Chime"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills & Mark All Read */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                filter === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                filter === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Advisories
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">No notifications in this category</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onMarkAsRead(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  !item.isRead
                    ? item.severity === 'critical'
                      ? 'bg-red-950/30 border-red-500/50 shadow-md shadow-red-950/30'
                      : 'bg-slate-800/90 border-slate-700 shadow-md'
                    : 'bg-slate-950/70 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.severity === 'critical' ? (
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    ) : item.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.timestamp}</span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.message}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-amber-300">
                    {item.broadcastedBy}
                  </span>

                  {item.areaId && onSelectNotificationArea && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNotificationArea(item.areaId!);
                        onClose();
                      }}
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>View Sector</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
