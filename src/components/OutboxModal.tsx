import React, { useState } from 'react';
import { OfflineOutboxItem, NetworkMode } from '../types';
import { 
  Wifi, 
  WifiOff, 
  Send, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Trash2, 
  RefreshCw, 
  Radio, 
  X, 
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface OutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkMode: NetworkMode;
  outboxItems: OfflineOutboxItem[];
  onSyncAll: () => Promise<void>;
  onClearItem: (id: string) => void;
}

export const OutboxModal: React.FC<OutboxModalProps> = ({
  isOpen,
  onClose,
  networkMode,
  outboxItems,
  onSyncAll,
  onClearItem,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  if (!isOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    await onSyncAll();
    setIsSyncing(false);
    setSyncDone(true);
    setTimeout(() => setSyncDone(false), 3000);
  };

  const pendingItems = outboxItems.filter(item => !item.synced);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>OFFLINE MESH OUTBOX & SYNC QUEUE</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Pending Local Records ({pendingItems.length})
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

        {/* Network Status Pill */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {networkMode === 'online' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Wifi className="w-4 h-4" />
                <span>Network Connected: Cloud Gateway Ready</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <WifiOff className="w-4 h-4" />
                <span>Offline Mode: Queuing in Encrypted IndexedDB</span>
              </span>
            )}
          </div>

          <span className="font-mono text-slate-500 text-[11px]">
            AES-256 Envelope Signed
          </span>
        </div>

        {/* Outbox Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {syncDone && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold">Sync Completed!</div>
                <div>All local records were successfully pushed to the Cloud Database.</div>
              </div>
            </div>
          )}

          {outboxItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.synced
                  ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                  : 'bg-slate-950 border-cyan-500/30 text-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-xs text-white">{item.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Created: {item.createdAt} • LoRa Relay Hops: {item.meshRelayHops}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.synced ? (
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Synced</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Queued</span>
                    </span>
                  )}

                  <button
                    onClick={() => onClearItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Remove record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {outboxItems.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              Your offline outbox is empty. All emergency data is synchronized.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {pendingItems.length} unsynchronized records
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing || pendingItems.length === 0}
            className={`py-2.5 px-5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              pendingItems.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing with Cloud...' : 'Sync Outbox Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
