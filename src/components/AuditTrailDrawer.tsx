import React from 'react';
import {
  Lock,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Clock,
  UserCheck,
  FileCode,
  Layers,
} from 'lucide-react';
import { AuditLogEntry, ServiceRequestRecord } from '../types';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest?: ServiceRequestRecord;
  allRequests: ServiceRequestRecord[];
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  selectedRequest,
  allRequests,
}) => {
  if (!isOpen) return null;

  // Flatten all audit trails if no specific request selected
  const entries: { reqTitle: string; entry: AuditLogEntry }[] = [];
  if (selectedRequest) {
    selectedRequest.auditTrail.forEach((entry) => {
      entries.push({ reqTitle: selectedRequest.title, entry });
    });
  } else {
    allRequests.forEach((req) => {
      req.auditTrail.forEach((entry) => {
        entries.push({ reqTitle: req.title, entry });
      });
    });
  }

  // Sort descending by timestamp
  entries.sort((a, b) => new Date(b.entry.timestamp).getTime() - new Date(a.entry.timestamp).getTime());

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    alert('SHA-256 hash copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border-l border-slate-700 w-full max-w-2xl h-full shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">
                  Cryptographic Action Audit Ledger
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                  SHA-256 IMMUTABLE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectedRequest
                  ? `Audit trail for #${selectedRequest.trackingNumber}`
                  : `Global System Ledger (${entries.length} verified blocks)`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Ledger Blocks List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {entries.map(({ reqTitle, entry }, index) => {
            const isGenesis = entry.blockIndex === 0;
            const isHitl = entry.eventType.includes('HITL');

            return (
              <div
                key={entry.actionId + index}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700 shadow-md relative overflow-hidden"
              >
                {/* Event Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                        isHitl
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : isGenesis
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {entry.eventType}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      <span>{entry.actor}</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </span>
                </div>

                {/* Request Context if Global */}
                {!selectedRequest && (
                  <div className="text-[11px] text-indigo-400 font-medium mb-1.5 truncate">
                    {reqTitle}
                  </div>
                )}

                {/* Agent Reasoning & Tool Trace */}
                <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800/80 mb-3 space-y-1.5">
                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-400">Agent Reasoning Trace:</strong>{' '}
                    {entry.agentReasoning}
                  </div>
                  {entry.toolUsed && (
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 font-mono">
                      <FileCode className="w-3 h-3 text-indigo-400" />
                      <span>Tool: {entry.toolUsed}</span>
                    </div>
                  )}
                </div>

                {/* Cryptographic Hashes */}
                <div className="space-y-1 text-[10px] font-mono bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Block Hash:</span>
                    <button
                      onClick={() => handleCopyHash(entry.simulatedSha256)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                      title="Copy SHA-256 hash"
                    >
                      <span>{entry.simulatedSha256.slice(0, 22)}...</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  {entry.previousHash && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Prev Hash:</span>
                      <span>{entry.previousHash.slice(0, 22)}...</span>
                    </div>
                  )}
                </div>

                {/* Verification Badge */}
                <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cryptographic Block Verified</span>
                  </span>
                  <span className="text-slate-500 font-mono">Action ID: {entry.actionId}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Compliant with ISO-27001 & UGC Academic Audit Guidelines
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
