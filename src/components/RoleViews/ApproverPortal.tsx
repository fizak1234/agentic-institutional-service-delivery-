import React, { useState } from 'react';
import {
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Scale,
  Flame,
  DollarSign,
  GraduationCap,
  FileCheck,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  BookOpen,
  Eye,
  KeyRound,
} from 'lucide-react';
import { ServiceRequestRecord } from '../../types';

interface ApproverPortalProps {
  requests: ServiceRequestRecord[];
  onOpenHitlModal: (req: ServiceRequestRecord) => void;
  onDirectApprove: (req: ServiceRequestRecord) => void;
  onDirectReject: (req: ServiceRequestRecord) => void;
  onOpenCertificateModal: (req: ServiceRequestRecord) => void;
  onOpenAuditTrail: (req: ServiceRequestRecord) => void;
}

export const ApproverPortal: React.FC<ApproverPortalProps> = ({
  requests,
  onOpenHitlModal,
  onDirectApprove,
  onDirectReject,
  onOpenCertificateModal,
  onOpenAuditTrail,
}) => {
  const [filterTab, setFilterTab] = useState<'pending' | 'critical' | 'all' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingRequests = requests.filter((r) => r.status === 'waiting_approval');
  const criticalRequests = requests.filter(
    (r) => r.hitlDetails.consequenceLevel === 'Critical' || r.hitlDetails.consequenceLevel === 'High'
  );
  const approvedRequests = requests.filter(
    (r) => r.status === 'approved' || r.status === 'completed'
  );

  const displayedRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hitlDetails.approvalRole.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'pending') return r.status === 'waiting_approval';
    if (filterTab === 'critical')
      return r.hitlDetails.consequenceLevel === 'Critical' || r.hitlDetails.consequenceLevel === 'High';
    if (filterTab === 'approved') return r.status === 'approved' || r.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Approver Header & Role Selector Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  Institutional Approval Center
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-md shadow-sm">
                  {pendingRequests.length} Pending Approvals
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Human-in-the-Loop Gateway: Review, authorize, or reject autonomous agent actions
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student, role, tracking #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              filterTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approvals ({pendingRequests.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('critical')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              filterTab === 'critical'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Critical / High Liability ({criticalRequests.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              filterTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorized History ({approvedRequests.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              filterTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>All Records ({requests.length})</span>
          </button>
        </div>
      </div>

      {/* HITL Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayedRequests.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="font-bold text-white text-sm">All Clear! No pending requests in this queue.</div>
            <p className="text-xs text-slate-500 mt-1">
              Switch back to the Student portal to submit or benchmark a new institutional workflow.
            </p>
          </div>
        ) : (
          displayedRequests.map((req) => {
            const hitl = req.hitlDetails;
            const isPending = req.status === 'waiting_approval';
            const isCritical = hitl.consequenceLevel === 'Critical';
            const isHigh = hitl.consequenceLevel === 'High';
            const confidencePercent = Math.round((req.confidenceScore || 0.96) * 100);

            return (
              <div
                key={req.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between ${
                  isPending
                    ? isCritical
                      ? 'border-rose-600/70 bg-slate-900/95 ring-1 ring-rose-500/40'
                      : isHigh
                      ? 'border-amber-600/70 bg-slate-900/95 ring-1 ring-amber-500/40'
                      : 'border-indigo-600/50 bg-slate-900/95'
                    : 'border-slate-800 bg-slate-900/60 opacity-90'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Metadata Header: Request Title, Request ID, Risk Level */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                              : isHigh
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          }`}
                        >
                          Risk Level: {hitl.consequenceLevel}
                        </span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          ID: {req.trackingNumber}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {req.title}
                      </h3>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
                      {hitl.approvalRole.split(' ')[0]}
                    </span>
                  </div>

                  {/* Requester & AI Confidence Info */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <img
                        src={req.student.avatar}
                        alt={req.student.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-slate-200">{req.student.name}</div>
                        <div className="text-[10px] text-slate-400">{req.student.regNo} • {req.student.department}</div>
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <div className="text-indigo-300 font-bold flex items-center justify-end space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Confidence: {confidencePercent}%</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        CGPA: <strong>{req.student.cgpa}</strong> • Dues: <strong>₹{req.student.duesPending}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Proposed Action */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90 text-xs">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                      Proposed Action:
                    </span>
                    <div className="font-semibold text-slate-200">{hitl.actionTitle}</div>
                    <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                      {hitl.actionDescription}
                    </p>
                  </div>

                  {/* Policy Used */}
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 text-xs flex items-start space-x-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        Policy Used:
                      </span>{' '}
                      <span className="text-[11px] text-slate-300 font-medium">
                        {req.policyConflict.policyClause || 'Academic & Research By-Laws §3.1 / §4.2'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {req.policyConflict.description || 'Verified against institutional code of conduct and safety regulations.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons: [Review] [Approve] [Reject] */}
                <div className="pt-4 mt-4 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenAuditTrail(req)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
                  >
                    Ledger Trace
                  </button>

                  <div className="flex items-center space-x-2">
                    {isPending ? (
                      <>
                        <button
                          id={`btn-review-${req.id}`}
                          onClick={() => onOpenHitlModal(req)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1 cursor-pointer transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Review</span>
                        </button>

                        <button
                          id={`btn-reject-direct-${req.id}`}
                          onClick={() => onDirectReject(req)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 flex items-center space-x-1 cursor-pointer transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Reject</span>
                        </button>

                        <button
                          id={`btn-approve-direct-${req.id}`}
                          onClick={() => onDirectApprove(req)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/30 flex items-center space-x-1 cursor-pointer transition-all transform hover:-translate-y-0.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onOpenCertificateModal(req)}
                        className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>View Authorized Proof</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
