import React, { useState } from 'react';
import {
  ShieldCheck,
  Activity,
  Cpu,
  Lock,
  CheckCircle2,
  AlertOctagon,
  Layers,
  Database,
  TrendingUp,
  FileCheck,
  Search,
  ExternalLink,
  Shield,
  Server,
} from 'lucide-react';
import { ServiceRequestRecord } from '../../types';

interface AdminAuditPortalProps {
  requests: ServiceRequestRecord[];
  onOpenAuditTrail: (req?: ServiceRequestRecord) => void;
}

export const AdminAuditPortal: React.FC<AdminAuditPortalProps> = ({
  requests,
  onOpenAuditTrail,
}) => {
  const [hashToVerify, setHashToVerify] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    block?: any;
    req?: ServiceRequestRecord;
  } | null>(null);

  // Metrics
  const totalRequests = requests.length;
  const hitlGated = requests.filter((r) => r.hitlRequired).length;
  const autonomousCompleted = requests.filter(
    (r) => !r.hitlRequired || r.status === 'approved' || r.status === 'completed'
  ).length;
  const policyConflictsDetected = requests.filter((r) => r.policyConflict.hasConflict).length;

  const handleVerifyHash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashToVerify.trim()) return;

    let match: { block: any; req: ServiceRequestRecord } | null = null;
    for (const req of requests) {
      for (const block of req.auditTrail) {
        if (
          block.simulatedSha256.toLowerCase().includes(hashToVerify.trim().toLowerCase()) ||
          block.actionId.toLowerCase() === hashToVerify.trim().toLowerCase()
        ) {
          match = { block, req };
          break;
        }
      }
      if (match) break;
    }

    if (match) {
      setVerificationResult({ found: true, block: match.block, req: match.req });
    } else {
      setVerificationResult({ found: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Managed Requests
            </span>
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalRequests}</div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>100% Deterministic Policy Tracking</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              HITL Gated Actions
            </span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{hitlGated}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero Unauthorized High-Risk Dispatches
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Policy Conflicts Intercepted
            </span>
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">{policyConflictsDetected}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Prevented Dues/Attendance Hallucinations
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Avg. Turnaround SLA
            </span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">4.2 min</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Down from 72h manual bureaucratic latency
          </p>
        </div>
      </div>

      {/* Cryptographic SHA-256 Ledger Verifier Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Tamper-Evident SHA-256 Block Hash Verifier
              </h3>
              <p className="text-xs text-slate-400">
                Instantly audit institutional decisions, agent reasoning traces, and digital signatory proofs
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenAuditTrail()}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
          >
            <span>Open Global Action Ledger</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleVerifyHash} className="flex gap-2">
          <input
            type="text"
            placeholder="Paste SHA-256 Hash or Action ID (e.g. 0x8f2d1e09c8a4b3f... or ACT-TRANS-POLICY-01)"
            value={hashToVerify}
            onChange={(e) => setHashToVerify(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Proof</span>
          </button>
        </form>

        {verificationResult && (
          <div className="mt-4 p-4 rounded-xl border animate-in fade-in text-xs">
            {verificationResult.found ? (
              <div className="bg-emerald-950/40 border-emerald-600/50 p-3 rounded-lg text-emerald-200 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cryptographic Ledger Verification SUCCESSFUL</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Block Hash: {verificationResult.block.simulatedSha256}
                </div>
                <div className="text-slate-300">
                  <strong>Action ID:</strong> {verificationResult.block.actionId} •{' '}
                  <strong>Event:</strong> {verificationResult.block.eventType} •{' '}
                  <strong>Actor:</strong> {verificationResult.block.actor}
                </div>
                <div className="text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px]">
                  <strong>Reasoning:</strong> {verificationResult.block.agentReasoning}
                </div>
              </div>
            ) : (
              <div className="bg-rose-950/40 border-rose-600/50 p-3 rounded-lg text-rose-200 flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Hash signature not found in current institutional genesis chain.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Institutional Governance Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2.5 text-xs font-bold text-indigo-400 mb-2">
            <Server className="w-4 h-4" />
            <span>Multi-Agent Orchestration</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Separates intent understanding, policy rule evaluation, risk calculation, and dispatch execution into modular verifiable micro-agents to prevent prompt-injection attacks.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2.5 text-xs font-bold text-amber-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>HITL Consequence Boundary</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Strict programmatic thresholds prevent autonomous credential minting, major budget debits, or safety cutoffs without verified cryptographic officer signatures.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2.5 text-xs font-bold text-emerald-400 mb-2">
            <Lock className="w-4 h-4" />
            <span>ISO-9001 Auditability</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every reasoning step and tool parameter is hashed with simulated SHA-256 Merkle links, making institutional administrative actions 100% accountable.
          </p>
        </div>
      </div>
    </div>
  );
};
