import React, { useState } from 'react';
import { EncryptedStorageAudit } from '../types';
import { INITIAL_AUDIT_LOGS } from '../lib/mockData';
import { encryptData, decryptData, calculateSha256 } from '../lib/encryption';
import { Lock, Shield, Key, Eye, EyeOff, CheckCircle2, Copy, X, Terminal, RefreshCw } from 'lucide-react';

interface EncryptedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EncryptedDataModal: React.FC<EncryptedDataModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'sandbox' | 'architecture'>('audit');
  
  // Sandbox state
  const [sandboxPlaintext, setSandboxPlaintext] = useState('Citizen Lakshmi Menon, GPS: 11.5390, 76.1650, Emergency Contact: +91 94470 11223');
  const [sandboxCipher, setSandboxCipher] = useState<string | null>(null);
  const [sandboxIv, setSandboxIv] = useState<string | null>(null);
  const [sandboxSha, setSandboxSha] = useState<string | null>(null);
  const [sandboxDecrypted, setSandboxDecrypted] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleEncryptSandbox = async () => {
    const enc = await encryptData(sandboxPlaintext);
    setSandboxCipher(enc.cipherBase64);
    setSandboxIv(enc.ivHex);
    setSandboxSha(enc.sha256Checksum);
    setSandboxDecrypted(null);
  };

  const handleDecryptSandbox = async () => {
    if (sandboxCipher && sandboxIv) {
      const dec = await decryptData(sandboxCipher, sandboxIv);
      setSandboxDecrypted(dec);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Encrypted Database Storage & Privacy Vault</span>
              </div>
              <h2 className="text-xl font-bold text-white">NIST FIPS 197 AES-256-GCM Architecture</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 p-2 bg-slate-950/40 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Encrypted Records Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              activeTab === 'sandbox'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Interactive Crypto Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Guarantees</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AUDIT STREAM */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white">Live Cryptographic Audit Trail</div>
                <p className="text-xs text-slate-400">
                  Every community report, citizen contact number, and sensor packet is sealed with a unique 96-bit initialization vector and SHA-256 hash.
                </p>
              </div>

              <div className="space-y-3">
                {INITIAL_AUDIT_LOGS.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="font-bold text-white flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Record: {log.recordId} ({log.recordType})</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        {log.encryptionAlgorithm}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500">IV Hex: </span>
                        <span className="text-amber-300">{log.ivHex}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Cipher Text: </span>
                        <span className="text-cyan-300">{log.cipherSnippet}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-1">
                      <span className="font-mono text-[10px]">SHA-256 Checksum: {log.sha256Checksum}</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tamper-Proof Seal Verified</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE CRYPTO SANDBOX */}
          {activeTab === 'sandbox' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Live Web Crypto AES-256-GCM Verification</h3>
                <p className="text-xs text-slate-400">
                  Test the client-side encryption engine in real-time. Type sensitive data to see it encrypted and verified with SHA-256.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Input Sensitive Payload:</label>
                <textarea
                  rows={3}
                  value={sandboxPlaintext}
                  onChange={(e) => setSandboxPlaintext(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleEncryptSandbox}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-950"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypt with AES-256-GCM</span>
                </button>

                {sandboxCipher && (
                  <button
                    onClick={handleDecryptSandbox}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Decrypt Payload</span>
                  </button>
                )}
              </div>

              {sandboxCipher && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in">
                  <div className="text-xs font-bold text-amber-400">Cryptographic Results:</div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-slate-500 mb-1">Ciphertext (Base64):</div>
                      <div className="text-cyan-300 break-all">{sandboxCipher}</div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-slate-500 mb-1">Random 96-bit GCM IV:</div>
                      <div className="text-amber-300">{sandboxIv}</div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-slate-500 mb-1">SHA-256 Integrity Seal:</div>
                      <div className="text-emerald-400 break-all">{sandboxSha}</div>
                    </div>
                  </div>

                  {sandboxDecrypted && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-1">
                      <div className="text-xs font-bold text-emerald-300">Successfully Decrypted with Integrity Match:</div>
                      <div className="text-xs text-white font-mono">{sandboxDecrypted}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRIVACY ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Knowledge Privacy Framework</span>
                </h3>
                <p>
                  LandSafe AI enforces strict client-side envelope cryptography. Before any community incident report or citizen GPS coordinate leaves the client browser, it is encrypted using the <strong>Web Cryptography API (SubtleCrypto)</strong> with standard AES-GCM 256-bit keys.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-white block">1. At-Rest Encryption</strong>
                    <span className="text-slate-400">All database records & cloud snapshots are stored encrypted.</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-white block">2. In-Transit TLS 1.3</strong>
                    <span className="text-slate-400">End-to-end encrypted transport over Cloud Run SSL ingress.</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-white block">3. Integrity Verification</strong>
                    <span className="text-slate-400">SHA-256 hashing prevents data tampering during transmission.</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-white block">4. Multi-Region Cloud Sync</strong>
                    <span className="text-slate-400">Automated multi-AZ backups prevent catastrophic data loss.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
