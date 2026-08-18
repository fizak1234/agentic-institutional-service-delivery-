import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Edit3,
  Scale,
  DollarSign,
  GraduationCap,
  Flame,
  UserCheck,
  FileText,
  KeyRound,
  AlertOctagon,
  Sparkles,
  Search,
  BookOpen,
  Info,
  Clock,
  Layers,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ServiceRequestRecord } from '../types';

interface HitlApprovalModalProps {
  request: ServiceRequestRecord;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: string, notes: string, approverName: string) => void;
  onReject: (requestId: string, reason: string, approverName: string) => void;
  onModify: (requestId: string, modifiedDetails: string, approverName: string) => void;
}

export const HitlApprovalModal: React.FC<HitlApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onModify,
}) => {
  const [approverName, setApproverName] = useState(
    request.hitlDetails.approvalRole.includes('Registrar')
      ? 'Prof. B. B. Pradhan (Registrar, SOA)'
      : request.hitlDetails.approvalRole.includes('Lab')
      ? 'Dr. S. K. Mohapatra (Director, HPC & AI Labs)'
      : request.hitlDetails.approvalRole.includes('Warden')
      ? 'Dr. R. K. Nayak (Chief Hostel Warden)'
      : 'Prof. P. K. Nanda (Dean of Academic Affairs)'
  );
  const [approverNotes, setApproverNotes] = useState(
    request.hitlDetails.recommendedDecision === 'CONDITIONAL'
      ? 'Approved conditionally under verified administrative bylaws.'
      : 'Verified institutional compliance. Authorized digital release.'
  );
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modifiedAction, setModifiedAction] = useState(request.hitlDetails.actionDescription);

  if (!isOpen) return null;

  const hitl = request.hitlDetails;
  const isCritical = hitl.consequenceLevel === 'Critical';
  const isHigh = hitl.consequenceLevel === 'High';
  const confidencePercent = Math.round((request.confidenceScore || 0.96) * 100);

  const handleApproveClick = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#10b981', '#f59e0b'],
    });
    onApprove(request.id, approverNotes, approverName);
    onClose();
  };

  const handleRejectClick = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    const finalReason = rejectReason.trim() || approverNotes || 'Rejected by designated authority upon policy review.';
    onReject(request.id, finalReason, approverName);
    setShowRejectInput(false);
    onClose();
  };

  const handleModifyClick = () => {
    onModify(request.id, modifiedAction, approverName);
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header - Required Title: Human Approval Required */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isCritical
              ? 'bg-rose-950/60 border-rose-800/80'
              : isHigh
              ? 'bg-amber-950/50 border-amber-800/80'
              : 'bg-indigo-950/50 border-indigo-800/80'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl ${
                isCritical
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : isHigh
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              }`}
            >
              {isCritical ? (
                <AlertOctagon className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/90 text-white border border-slate-700">
                  Risk Level: {hitl.consequenceLevel}
                </span>
                <span className="text-xs font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                  Request ID: {request.trackingNumber}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Human Approval Required
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status & Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Status</span>
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{request.status.replace('_', ' ').toUpperCase()}</span>
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">AI Confidence</span>
              <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{confidencePercent}% Validated</span>
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Risk Assessment</span>
              <span className={`text-xs font-bold mt-0.5 block ${isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-blue-400'}`}>
                {hitl.consequenceLevel} Impact
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Designated Role</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">
                {hitl.approvalRole}
              </span>
            </div>
          </div>

          {/* User / Requester Details */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>User / Requester Profile</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Reg No: <strong className="text-slate-200">{request.student.regNo}</strong>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-3">
                <img
                  src={request.student.avatar}
                  alt={request.student.name}
                  className="w-10 h-10 rounded-full border border-slate-600 object-cover"
                />
                <div>
                  <div className="font-semibold text-slate-100 text-sm">
                    {request.student.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {request.student.department} • {request.student.semester} • Hostel {request.student.hostelBlock} ({request.student.roomNo})
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-xs text-right">
                <div>
                  <span className="text-slate-400 block text-[10px]">CGPA</span>
                  <span className="font-bold text-slate-200">{request.student.cgpa} / 10.0</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Attendance</span>
                  <span className={`font-bold ${request.student.attendanceFloat >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{request.student.attendance}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ERP Dues</span>
                  <span className={`font-bold ${request.student.duesPending > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>₹{request.student.duesPending}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Original User Request & AI-Detected Intent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Original User Request</span>
              </div>
              <p className="text-xs text-slate-200 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 italic leading-relaxed">
                &ldquo;{request.rawPrompt}&rdquo;
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI-Detected Intent</span>
              </div>
              <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                <div className="font-bold text-indigo-300 capitalize">{request.category.replace('_', ' ')} Processing</div>
                <div className="text-slate-300 text-[11px]">{request.title}</div>
              </div>
            </div>
          </div>

          {/* Proposed Action */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide flex items-center space-x-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Proposed Action</span>
              </span>
              <span className="text-xs font-medium text-slate-400">
                Action: <strong className="text-slate-200">{hitl.actionTitle}</strong>
              </span>
            </div>
            {isEditing ? (
              <textarea
                value={modifiedAction}
                onChange={(e) => setModifiedAction(e.target.value)}
                className="w-full bg-slate-900 border border-indigo-500 rounded-lg p-2 text-slate-200 text-xs mt-2 focus:ring-1 focus:ring-indigo-400"
                rows={3}
              />
            ) : (
              <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                {hitl.actionDescription}
              </p>
            )}
          </div>

          {/* AI-Generated Action Plan */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide flex items-center space-x-1 mb-2.5">
              <Layers className="w-3.5 h-3.5" />
              <span>AI-Generated Action Plan</span>
            </span>
            <div className="space-y-2">
              {request.planSteps.map((step) => (
                <div
                  key={step.stepId}
                  className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                    step.status === 'waiting_approval'
                      ? 'bg-amber-950/30 border-amber-600/50'
                      : step.status === 'completed'
                      ? 'bg-slate-900/80 border-slate-800'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {step.stepId}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">{step.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Tool: {step.toolUsed}</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">Output: {step.outputSummary}</div>
                    </div>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase whitespace-nowrap ${
                      step.status === 'waiting_approval'
                        ? 'bg-amber-500 text-slate-950'
                        : step.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {step.status === 'waiting_approval' ? 'HITL Required' : step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Institutional Policy Used */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400 uppercase mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Verified Institutional Policy Used</span>
            </div>
            <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 rounded">
                  {request.policyConflict.policyClause || 'Academic & Research By-Laws §3.1 / §4.2'}
                </span>
                <span className="font-semibold text-slate-200">
                  {request.policyConflict.hasConflict ? 'Policy Conflict Intercepted' : 'Institutional Code Verified'}
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {request.policyConflict.description || 'Action parameters verified against university statutes and operating procedures.'}
              </p>
            </div>
          </div>

          {/* Reason Why Human Approval is Required */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-400 uppercase mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Reason Why Human Approval is Required</span>
            </div>
            <p className="text-xs text-slate-300 bg-slate-900/70 p-3 rounded-lg border border-slate-800 leading-relaxed mb-3">
              {hitl.riskAnalysis}
            </p>

            {/* Impact Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-semibold text-[11px] block">Financial Liability</span>
                <span className="text-slate-300 text-[11px]">{hitl.financialImpact}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-blue-400 font-semibold text-[11px] block">Academic Credential</span>
                <span className="text-slate-300 text-[11px]">{hitl.academicImpact}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-rose-400 font-semibold text-[11px] block">Safety / Infrastructure</span>
                <span className="text-slate-300 text-[11px]">{hitl.safetyOrFacilityImpact}</span>
              </div>
            </div>
          </div>

          {/* Approver Sign-off Inputs */}
          <div className="bg-slate-800/30 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Authorized Officer (Digital Signatory)
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Official Decision Notes / Condition
                </label>
                <input
                  type="text"
                  value={approverNotes}
                  onChange={(e) => setApproverNotes(e.target.value)}
                  placeholder="e.g. Verified compliance. Authorized digital release."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Optional Rejection Reason Field when reject is clicked */}
            {showRejectInput && (
              <div className="p-3 bg-rose-950/40 border border-rose-700 rounded-lg animate-in fade-in space-y-1.5">
                <label className="block text-xs font-bold text-rose-300">
                  Rejection Reason (Optional / Explanatory)
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Unsettled financial dues require physical cashier counter clearance."
                  className="w-full bg-slate-950 border border-rose-600 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls - Functional [Approve] and [Reject] */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                id="btn-modify-hitl"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Modify Parameters</span>
              </button>
            ) : (
              <button
                id="btn-save-modify-hitl"
                onClick={handleModifyClick}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Save & Approve Modified</span>
              </button>
            )}

            <button
              id="btn-reject-hitl"
              onClick={handleRejectClick}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 flex items-center space-x-1.5 cursor-pointer transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>{showRejectInput ? 'Confirm Reject' : 'Reject'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-approve-sign-hitl"
              onClick={handleApproveClick}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/40 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
