import React from 'react';
import {
  BrainCircuit,
  Search,
  AlertTriangle,
  Scale,
  UserCheck,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { PlanStep, PolicyConflict } from '../types';

interface WorkflowGraphVisualizerProps {
  status: string;
  planSteps?: PlanStep[];
  policyConflict?: PolicyConflict;
  hitlRequired?: boolean;
  onOpenHitl?: () => void;
}

export const WorkflowGraphVisualizer: React.FC<WorkflowGraphVisualizerProps> = ({
  status,
  policyConflict,
  hitlRequired = true,
  onOpenHitl,
}) => {
  const isWaiting = status === 'waiting_approval';
  const isApproved = status === 'approved' || status === 'completed';

  const steps = [
    {
      id: 'step-1',
      title: 'Intent & NLP',
      subtitle: 'Multilingual & Entity Parsing',
      icon: BrainCircuit,
      color: 'blue',
      isDone: true,
      isActive: false,
    },
    {
      id: 'step-2',
      title: 'Knowledge RAG',
      subtitle: 'By-Laws & SIS Retrieval',
      icon: Search,
      color: 'indigo',
      isDone: true,
      isActive: false,
    },
    {
      id: 'step-3',
      title: 'Policy Conflict Check',
      subtitle: policyConflict?.hasConflict ? 'Conflict Flagged' : 'Rules Verified',
      icon: AlertTriangle,
      color: policyConflict?.hasConflict ? 'amber' : 'emerald',
      isDone: true,
      isWarning: policyConflict?.hasConflict,
    },
    {
      id: 'step-4',
      title: 'Consequence Matrix',
      subtitle: 'Impact & Liability Score',
      icon: Scale,
      color: 'purple',
      isDone: true,
    },
    {
      id: 'step-5',
      title: 'HITL Gate',
      subtitle: isWaiting
        ? 'Awaiting Sign-off (Click)'
        : isApproved
        ? 'Human Authorized'
        : 'Governance Active',
      icon: UserCheck,
      color: 'amber',
      isDone: isApproved,
      isActive: isWaiting,
      isClickable: isWaiting && Boolean(onOpenHitl),
    },
    {
      id: 'step-6',
      title: 'Execution & Hash Seal',
      subtitle: status === 'completed' ? 'Immutable Sealed' : 'Post-Approval Task',
      icon: Lock,
      color: 'emerald',
      isDone: status === 'completed',
      isActive: status === 'approved' || status === 'executing',
    },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Autonomous Agent Execution Pipeline & HITL Guardrails
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic policy checking prevents hallucinations • High-consequence actions halt for human sign-off
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>RAG Verified</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-400 font-medium">SHA-256 Auditable</span>
        </div>
      </div>

      {/* Pipeline node grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              onClick={() => {
                if (s.isClickable && onOpenHitl) {
                  onOpenHitl();
                }
              }}
              className={`relative rounded-xl p-3 border transition-all flex flex-col justify-between ${
                s.isActive
                  ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-900/20 ring-1 ring-amber-500/40 cursor-pointer hover:border-amber-400'
                  : s.isWarning
                  ? 'bg-amber-950/20 border-amber-600/60'
                  : s.isDone
                  ? 'bg-slate-800/80 border-slate-700'
                  : 'bg-slate-900/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    s.isActive
                      ? 'bg-amber-500 text-slate-950 animate-bounce'
                      : s.isWarning
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : s.isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  0{idx + 1}
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-200 truncate">
                  {s.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {s.subtitle}
                </div>
              </div>

              {/* Status footer pill */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                {s.isActive ? (
                  <span className="text-amber-400 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Click to Review</span>
                  </span>
                ) : s.isWarning ? (
                  <span className="text-amber-400 font-semibold">Conflict Flag</span>
                ) : s.isDone ? (
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="text-slate-500">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
