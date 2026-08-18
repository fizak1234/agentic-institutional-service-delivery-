import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Volume2,
  RefreshCw,
  Wallet,
  Building,
  Cpu,
  Flame,
  FileText,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import {
  GeneratedArtifact,
  PlanStep,
  PolicyConflict,
  ServiceRequestRecord,
  StudentProfile,
} from '../../types';
import { SAMPLE_PROMPT_TEMPLATES } from '../../data/mockData';
import { WorkflowGraphVisualizer } from '../WorkflowGraphVisualizer';

interface StudentPortalProps {
  student: StudentProfile;
  activeRequests: ServiceRequestRecord[];
  onSubmitNewRequest: (prompt: string, category: string, language: string) => Promise<void>;
  isLoading: boolean;
  selectedRequest: ServiceRequestRecord | null;
  onSelectRequest: (req: ServiceRequestRecord) => void;
  onOpenHitlModal: (req: ServiceRequestRecord) => void;
  onOpenCertificateModal: (req: ServiceRequestRecord) => void;
  onOpenAuditTrail: (req: ServiceRequestRecord) => void;
  currentLanguage: string;
  onSettleDues: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  activeRequests,
  onSubmitNewRequest,
  isLoading,
  selectedRequest,
  onSelectRequest,
  onOpenHitlModal,
  onOpenCertificateModal,
  onOpenAuditTrail,
  currentLanguage,
  onSettleDues,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('certificate');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    await onSubmitNewRequest(inputText, selectedCategory, currentLanguage);
    setInputText('');
  };

  const handleApplyTemplate = (template: (typeof SAMPLE_PROMPT_TEMPLATES)[0]) => {
    setInputText(template.prompt);
    setSelectedCategory(template.category);
  };

  const handleSpeakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentDisplayReq = selectedRequest || activeRequests[0];

  return (
    <div className="space-y-6">
      {/* Student Profile Quick Stats Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-12 h-12 rounded-2xl border-2 border-indigo-500/50 object-cover shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">{student.name}</h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                  {student.regNo}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {student.department} • {student.semester} • {student.hostelBlock} ({student.roomNo})
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex-1 md:flex-initial">
              <span className="text-slate-400 text-[10px] block">Academic CGPA</span>
              <span className="text-sm font-bold text-indigo-300">{student.cgpa} / 10.0</span>
            </div>

            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex-1 md:flex-initial">
              <span className="text-slate-400 text-[10px] block">Attendance (Agg.)</span>
              <span className={`text-sm font-bold ${student.attendanceFloat >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {student.attendance}
              </span>
            </div>

            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between gap-3 flex-1 md:flex-initial">
              <div>
                <span className="text-slate-400 text-[10px] block">Pending Dues</span>
                <span className={`text-sm font-bold ${student.duesPending > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{student.duesPending}
                </span>
              </div>
              {student.duesPending > 0 && (
                <button
                  id="btn-settle-dues"
                  onClick={onSettleDues}
                  className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 rounded-lg transition-all"
                  title="Simulate Clearing Library Dues"
                >
                  Pay ERP Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Request Composer & Active Plan | Right: Request History & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Natural Language Input + Benchmark Templates */}
        <div className="lg:col-span-7 space-y-5">
          {/* Conversational Request Composer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Autonomous Institutional Service Agent
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    State your request naturally in any supported language
                  </p>
                </div>
              </div>

              {/* Category selector pill */}
              <div className="flex items-center space-x-1 text-xs">
                {(['certificate', 'lab_booking', 'maintenance', 'grievance'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  id="input-service-request"
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g., I urgently need my official academic transcript for my German visa appointment... OR Book 4x A100 GPUs on research cluster tonight..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                  <span className="flex items-center space-x-1 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini 3.7 + Deterministic By-Laws</span>
                  </span>
                </div>

                <button
                  id="btn-submit-request"
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-900/40 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Planning Autonomous Workflow...</span>
                    </>
                  ) : (
                    <>
                      <span>Dispatch Agent</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Benchmark Scenarios Quick Launchers */}
            <div className="mt-4 pt-3.5 border-t border-slate-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                ⚡ Hackathon Benchmark Scenarios (1-Click Test)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_PROMPT_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="text-left p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-bold text-slate-300 group-hover:text-indigo-300">
                        {tmpl.title}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{tmpl.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Request Execution Pipeline Visualizer */}
          {currentDisplayReq && (
            <div className="space-y-4">
              <WorkflowGraphVisualizer
                status={currentDisplayReq.status}
                planSteps={currentDisplayReq.planSteps}
                policyConflict={currentDisplayReq.policyConflict}
                hitlRequired={currentDisplayReq.hitlRequired}
                onOpenHitl={() => onOpenHitlModal(currentDisplayReq)}
              />

              {/* Policy Conflict Alert if present */}
              {currentDisplayReq.policyConflict.hasConflict && (
                <div className="bg-amber-950/40 border border-amber-600/60 rounded-2xl p-4 text-xs text-amber-200 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Policy Conflict Detected: {currentDisplayReq.policyConflict.policyClause}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-900/60 text-amber-300 rounded border border-amber-700">
                      Preventing Hallucination
                    </span>
                  </div>
                  <p className="text-amber-100/90 leading-relaxed">
                    {currentDisplayReq.policyConflict.description}
                  </p>
                  <div className="bg-amber-900/30 p-2.5 rounded-lg border border-amber-700/50 flex items-center justify-between">
                    <span>
                      <strong>Remedy Action:</strong> {currentDisplayReq.policyConflict.remedy}
                    </span>
                    {student.duesPending > 0 && (
                      <button
                        onClick={onSettleDues}
                        className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 shadow transition-all ml-2 whitespace-nowrap"
                      >
                        Clear Dues Now
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Multi-Step Autonomous Plan Execution Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Autonomous Multi-Step Plan & Tool Invocations
                    </h3>
                  </div>

                  <button
                    onClick={() => handleSpeakResponse(currentDisplayReq.languageResponseText)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 transition-all ${
                      isSpeaking
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isSpeaking ? 'Stop Audio' : 'Audio Readout'}</span>
                  </button>
                </div>

                {/* Localized Response Text */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  {currentDisplayReq.languageResponseText}
                </div>

                {/* Step-by-step Plan Accordion / Timeline */}
                <div className="space-y-2.5">
                  {currentDisplayReq.planSteps.map((step) => {
                    const isDone = step.status === 'completed';
                    const isWaiting = step.status === 'waiting_approval';
                    return (
                      <div
                        key={step.stepId}
                        onClick={() => {
                          if (isWaiting) {
                            onOpenHitlModal(currentDisplayReq);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                          isWaiting
                            ? 'bg-amber-950/20 border-amber-600/50 shadow-sm cursor-pointer hover:border-amber-400 hover:bg-amber-950/30'
                            : isDone
                            ? 'bg-slate-950/60 border-slate-800'
                            : 'bg-slate-950/30 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                              isWaiting
                                ? 'bg-amber-500 text-slate-950 animate-pulse'
                                : isDone
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {step.stepId}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 flex items-center space-x-2">
                              <span>{step.name}</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-900 border border-slate-800 text-slate-400 rounded">
                                {step.toolUsed}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5">{step.description}</p>
                            <div className="mt-1 text-[11px] text-slate-300 font-medium bg-slate-900/60 px-2 py-1 rounded border border-slate-800/80 inline-block">
                              Output: {step.outputSummary}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {isWaiting && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenHitlModal(currentDisplayReq);
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md shadow-sm flex items-center space-x-1 cursor-pointer transition-all"
                            >
                              <span>HITL Required</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {isDone && (
                            <span className="text-emerald-400 font-medium text-[11px] flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* HITL Action Callout if waiting approval */}
                {currentDisplayReq.status === 'waiting_approval' && (
                  <div
                    onClick={() => onOpenHitlModal(currentDisplayReq)}
                    className="bg-amber-950/30 border border-amber-600/40 hover:border-amber-500 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer transition-all shadow-md"
                  >
                    <div className="flex items-center space-x-3 text-xs text-amber-200">
                      <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
                      <div>
                        <strong>Human-in-the-Loop Gate Engaged:</strong> Consequential action halted for{' '}
                        <span className="underline font-bold text-white">
                          {currentDisplayReq.hitlDetails.approvalRole}
                        </span>{' '}
                        sign-off. (Click to Review)
                      </div>
                    </div>

                    <button
                      id="btn-open-hitl-signoff"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHitlModal(currentDisplayReq);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Review as {currentDisplayReq.hitlDetails.approvalRole.split(' ')[0]}</span>
                    </button>
                  </div>
                )}

                {/* Completed Artifact & Audit Trail Triggers */}
                {(currentDisplayReq.status === 'approved' || currentDisplayReq.status === 'completed') && (
                  <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 text-xs text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <strong>Action Successfully Executed:</strong> Approved by{' '}
                        <span className="font-bold text-white">
                          {currentDisplayReq.hitlDetails.decidedBy || currentDisplayReq.hitlDetails.approvalRole}
                        </span>
                        . Cryptographic hash recorded in ledger.
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onOpenCertificateModal(currentDisplayReq)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center space-x-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>View Official Document</span>
                      </button>
                      <button
                        onClick={() => onOpenAuditTrail(currentDisplayReq)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Audit Log</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active & Past Request Portfolio */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Service Requests ({activeRequests.length})
              </h3>
              <span className="text-[11px] text-indigo-400 font-medium">
                Live Status Track
              </span>
            </div>

            <div className="space-y-3">
              {activeRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                const isWaiting = req.status === 'waiting_approval';
                const isDone = req.status === 'approved' || req.status === 'completed';

                return (
                  <div
                    key={req.id}
                    onClick={() => onSelectRequest(req)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-white line-clamp-1">
                        {req.title}
                      </span>
                      <span
                        onClick={(e) => {
                          if (isWaiting) {
                            e.stopPropagation();
                            onOpenHitlModal(req);
                          }
                        }}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase whitespace-nowrap ${
                          isWaiting
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse hover:bg-amber-500 hover:text-slate-950'
                            : isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                      {req.rawPrompt}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                      <span className="font-mono">{req.trackingNumber}</span>
                      <div className="flex items-center space-x-2">
                        {isWaiting && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenHitlModal(req);
                            }}
                            className="text-amber-400 hover:underline font-bold flex items-center space-x-0.5"
                          >
                            <span>Sign-off</span>
                          </button>
                        )}
                        {isDone && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCertificateModal(req);
                            }}
                            className="text-emerald-400 hover:underline font-semibold flex items-center space-x-0.5"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>Pass/Transcript</span>
                          </button>
                        )}
                        <span className="text-indigo-400 font-semibold flex items-center">
                          Details <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
