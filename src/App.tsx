import React, { useState } from 'react';
import {
  DEFAULT_STUDENT_PROFILE,
  INITIAL_BENCHMARK_SCENARIOS,
  VERIFIED_KNOWLEDGE_BASE,
} from './data/mockData';
import {
  AuditLogEntry,
  KnowledgeBaseItem,
  ServiceRequestRecord,
  StudentProfile,
  UserRole,
} from './types';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/RoleViews/StudentPortal';
import { ApproverPortal } from './components/RoleViews/ApproverPortal';
import { AdminAuditPortal } from './components/RoleViews/AdminAuditPortal';
import { HitlApprovalModal } from './components/HitlApprovalModal';
import { CertificatePreviewModal } from './components/CertificatePreviewModal';
import { AuditTrailDrawer } from './components/AuditTrailDrawer';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { processAgentRequest } from './services/agentApi';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  detail?: string;
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);
  const [requests, setRequests] = useState<ServiceRequestRecord[]>(INITIAL_BENCHMARK_SCENARIOS);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestRecord | null>(INITIAL_BENCHMARK_SCENARIOS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modal States
  const [isHitlModalOpen, setIsHitlModalOpen] = useState(false);
  const [activeHitlRequest, setActiveHitlRequest] = useState<ServiceRequestRecord | null>(null);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [activeCertRequest, setActiveCertRequest] = useState<ServiceRequestRecord | null>(null);

  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [activeAuditRequest, setActiveAuditRequest] = useState<ServiceRequestRecord | undefined>(undefined);

  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  // Helper: Show toast
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string, detail?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastNotification = { id, type, title, message, detail };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Pending HITL Count
  const pendingApprovalsCount = requests.filter((r) => r.status === 'waiting_approval').length;

  // Handler: Submit New Service Request via Agent Engine
  const handleSubmitNewRequest = async (
    prompt: string,
    category: string,
    language: string
  ) => {
    setIsLoading(true);
    try {
      const result = await processAgentRequest({
        userPrompt: prompt,
        category,
        language,
        studentProfile,
      });

      const newId = `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`;
      const trackingCode = `SOA-REQ-${category.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const initialAuditBlock: AuditLogEntry = {
        blockIndex: 0,
        actionId: result.auditLogEntry?.actionId || `ACT-INIT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'AUTONOMOUS_ORCHESTRATOR',
        eventType: 'INTENT_PARSED',
        agentReasoning: result.auditLogEntry?.agentReasoning || 'Request parsed and evaluated against university by-laws.',
        toolUsed: 'Agentic_Orchestration_Kernel',
        simulatedSha256: result.auditLogEntry?.simulatedSha256 || '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        status: 'verified',
      };

      const newRecord: ServiceRequestRecord = {
        id: newId,
        trackingNumber: trackingCode,
        title: result.requestSummary || prompt.slice(0, 50) + '...',
        category: (result.intentCategory as any) || category || 'certificate',
        student: studentProfile,
        rawPrompt: prompt,
        language: language || 'en',
        createdAt: new Date().toISOString(),
        status: result.hitlRequired ? 'waiting_approval' : 'completed',
        confidenceScore: result.confidenceScore || 0.96,
        planSteps: result.planSteps || [],
        policyConflict: result.policyConflict || { hasConflict: false, severity: 'none', policyClause: '', description: '', remedy: '' },
        uncertaintyDetected: result.uncertaintyDetected || { isUncertain: false, missingInformation: [], clarificationQuestion: '' },
        hitlRequired: result.hitlRequired !== false,
        hitlDetails: result.hitlDetails || {
          approvalRole: 'Department Head / Designated Officer',
          consequenceLevel: 'Moderate',
          financialImpact: 'Standard operational processing',
          academicImpact: 'Institutional service fulfillment',
          safetyOrFacilityImpact: 'Maintains university standards',
          actionTitle: 'Authorize Workflow Execution',
          actionDescription: 'Permit autonomous agent execution.',
          recommendedDecision: 'APPROVE',
          riskAnalysis: 'Routine workflow requiring authorized departmental verification.',
          status: 'pending',
        },
        generatedArtifact: result.generatedArtifact || {
          type: 'certificate',
          title: 'Institutional Service Document',
          referenceNumber: `SOA-DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          payloadDetails: 'Processed successfully.',
        },
        auditTrail: [initialAuditBlock],
        languageResponseText: result.languageResponseText || 'Your request has been successfully analyzed.',
      };

      setRequests((prev) => [newRecord, ...prev]);
      setSelectedRequest(newRecord);

      if (result.hitlRequired) {
        showToast(
          'info',
          'HITL Authorization Gate Engaged',
          `Request #${trackingCode} is waiting for human officer sign-off.`
        );
      } else {
        showToast(
          'success',
          'Autonomous Workflow Completed',
          `Action executed autonomously without policy conflicts.`
        );
      }
    } catch (error) {
      console.error('Failed to submit agent request:', error);
      showToast('error', 'Error Processing Request', 'Simulation engine fallback was triggered.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: HITL Approval
  const handleApproveHitl = (requestId: string, notes: string, approverName: string) => {
    const now = new Date().toISOString();
    const newHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    let approvedReqTitle = '';
    let simulationMsg = '';
    let category = '';

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;

        approvedReqTitle = req.title;
        category = req.category;

        // Determine specific simulated action outcome message
        if (category === 'lab_booking') {
          simulationMsg = '✓ Laboratory booking confirmed — AI Lab — 2:00 PM – 4:00 PM (Node hpc-04 assigned)';
        } else if (category === 'certificate') {
          simulationMsg = '✓ Certificate request approved and submitted — Official Transcript Sealed';
        } else if (category === 'maintenance') {
          simulationMsg = '✓ Maintenance request submitted — Emergency Tech Dispatched (SLA 15m)';
        } else {
          simulationMsg = '✓ Attendance Condonation approved — ERP Updated';
        }

        // Progress all plan steps
        const updatedSteps = req.planSteps.map((step) => {
          if (step.status === 'waiting_approval' || step.name.toLowerCase().includes('hitl') || step.name.toLowerCase().includes('approval')) {
            return {
              ...step,
              status: 'completed' as const,
              outputSummary: `Approved by ${approverName} at ${new Date(now).toLocaleTimeString()}. Digital signature sealed.`,
            };
          }
          if (step.status === 'pending') {
            return {
              ...step,
              status: 'completed' as const,
              outputSummary: `Autonomous execution finalized: ${simulationMsg}`,
            };
          }
          return step;
        });

        // Add verified audit log entry
        const newAuditBlock: AuditLogEntry = {
          blockIndex: req.auditTrail.length,
          actionId: `ACT-HITL-APPROVE-${Date.now()}`,
          timestamp: now,
          actor: approverName,
          eventType: 'HITL_APPROVED',
          agentReasoning: `Human approval received. Approver: ${approverName}. Action: ${req.hitlDetails.actionTitle}. Status: APPROVED. Timestamp: ${now}. Note: "${notes}"`,
          toolUsed: 'Digital_Notary_Seal',
          simulatedSha256: newHash,
          previousHash: req.auditTrail[req.auditTrail.length - 1]?.simulatedSha256 || '0x0000000000000000',
          status: 'verified',
        };

        const updatedReq: ServiceRequestRecord = {
          ...req,
          status: 'approved',
          planSteps: updatedSteps,
          hitlDetails: {
            ...req.hitlDetails,
            status: 'approved',
            approverNotes: notes,
            decidedAt: now,
            decidedBy: approverName,
          },
          generatedArtifact: req.generatedArtifact
            ? {
                ...req.generatedArtifact,
                signedTimestamp: now,
                digitalSeal: `SEAL_VERIFIED_${approverName.toUpperCase().slice(0, 12)}`,
                payloadDetails: `${req.generatedArtifact.payloadDetails} • Authorized by ${approverName}`,
              }
            : undefined,
          auditTrail: [...req.auditTrail, newAuditBlock],
        };

        if (selectedRequest?.id === requestId) {
          setSelectedRequest(updatedReq);
        }
        return updatedReq;
      })
    );

    // Show Success Toast with simulated action outcome
    showToast(
      'success',
      'Human Approval Received & Action Executed',
      simulationMsg || `✓ Request "${approvedReqTitle}" approved and completed.`,
      `Approver: ${approverName} • Status: APPROVED`
    );
  };

  // Handler: HITL Rejection
  const handleRejectHitl = (requestId: string, reason: string, approverName: string) => {
    const now = new Date().toISOString();
    const newHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    let rejectedReqTitle = '';

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;

        rejectedReqTitle = req.title;

        // Mark steps as halted/rejected
        const updatedSteps = req.planSteps.map((step) => {
          if (step.status === 'waiting_approval') {
            return {
              ...step,
              status: 'rejected' as any,
              outputSummary: `Rejected by ${approverName}. Reason: ${reason}`,
            };
          }
          if (step.status === 'pending') {
            return {
              ...step,
              status: 'rejected' as any,
              outputSummary: 'Execution halted due to approver rejection.',
            };
          }
          return step;
        });

        const newAuditBlock: AuditLogEntry = {
          blockIndex: req.auditTrail.length,
          actionId: `ACT-HITL-REJECT-${Date.now()}`,
          timestamp: now,
          actor: approverName,
          eventType: 'HITL_REJECTED',
          agentReasoning: `Human approval rejected. Approver: ${approverName}. Reason: "${reason}". Status: REJECTED. Timestamp: ${now}. Workflow halted.`,
          toolUsed: 'HITL_Governance_Halt',
          simulatedSha256: newHash,
          previousHash: req.auditTrail[req.auditTrail.length - 1]?.simulatedSha256 || '0x0000000000000000',
          status: 'verified',
        };

        const updatedReq: ServiceRequestRecord = {
          ...req,
          status: 'rejected',
          planSteps: updatedSteps,
          hitlDetails: {
            ...req.hitlDetails,
            status: 'rejected',
            approverNotes: reason,
            decidedAt: now,
            decidedBy: approverName,
          },
          auditTrail: [...req.auditTrail, newAuditBlock],
        };

        if (selectedRequest?.id === requestId) {
          setSelectedRequest(updatedReq);
        }
        return updatedReq;
      })
    );

    // Show Rejection Toast
    showToast(
      'error',
      'Human Approval Rejected',
      `Request "${rejectedReqTitle}" was rejected by ${approverName}. Action halted.`,
      `Reason: ${reason}`
    );
  };

  // Direct Approval helper for Approver Portal
  const handleDirectApprove = (req: ServiceRequestRecord) => {
    const approverName = req.hitlDetails.approvalRole.includes('Registrar')
      ? 'Prof. B. B. Pradhan (Registrar, SOA)'
      : req.hitlDetails.approvalRole.includes('Lab')
      ? 'Dr. S. K. Mohapatra (Director, HPC & AI Labs)'
      : req.hitlDetails.approvalRole.includes('Warden')
      ? 'Dr. R. K. Nayak (Chief Hostel Warden)'
      : 'Prof. P. K. Nanda (Dean of Academic Affairs)';

    handleApproveHitl(req.id, 'One-click quick approval granted via Approval Center.', approverName);
  };

  // Direct Rejection helper for Approver Portal
  const handleDirectReject = (req: ServiceRequestRecord) => {
    const approverName = req.hitlDetails.approvalRole.includes('Registrar')
      ? 'Prof. B. B. Pradhan (Registrar, SOA)'
      : req.hitlDetails.approvalRole.includes('Lab')
      ? 'Dr. S. K. Mohapatra (Director, HPC & AI Labs)'
      : req.hitlDetails.approvalRole.includes('Warden')
      ? 'Dr. R. K. Nayak (Chief Hostel Warden)'
      : 'Prof. P. K. Nanda (Dean of Academic Affairs)';

    handleRejectHitl(req.id, 'Rejected by authorized officer in Approval Center.', approverName);
  };

  // Handler: HITL Modification
  const handleModifyHitl = (requestId: string, modifiedDetails: string, approverName: string) => {
    handleApproveHitl(requestId, `Approved with parameter modifications: ${modifiedDetails}`, approverName);
  };

  // Handler: Settle student dues simulation
  const handleSettleDues = () => {
    setStudentProfile((prev) => ({
      ...prev,
      duesPending: 0,
    }));
    showToast('success', 'ERP Wallet Payment Succeeded', '₹1,200 Library Dues cleared. Policy condition fulfilled!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col space-y-2.5 max-w-md w-full pointer-events-none px-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-2xl border flex items-start justify-between gap-3 animate-in slide-in-from-top duration-300 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/80 text-emerald-100 ring-1 ring-emerald-500/30'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/80 text-rose-100 ring-1 ring-rose-500/30'
                : 'bg-slate-900/95 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/30'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              <div>
                <div className="font-bold text-xs text-white">{toast.title}</div>
                <div className="text-xs text-slate-200 mt-0.5">{toast.message}</div>
                {toast.detail && (
                  <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800">
                    {toast.detail}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenKnowledgeBase={() => setIsKnowledgeModalOpen(true)}
        onOpenAuditTrail={() => {
          setActiveAuditRequest(undefined);
          setIsAuditDrawerOpen(true);
        }}
      />

      {/* Main Role Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'student' && (
          <StudentPortal
            student={studentProfile}
            activeRequests={requests}
            onSubmitNewRequest={handleSubmitNewRequest}
            isLoading={isLoading}
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
            onOpenHitlModal={(req) => {
              setActiveHitlRequest(req);
              setIsHitlModalOpen(true);
            }}
            onOpenCertificateModal={(req) => {
              setActiveCertRequest(req);
              setIsCertModalOpen(true);
            }}
            onOpenAuditTrail={(req) => {
              setActiveAuditRequest(req);
              setIsAuditDrawerOpen(true);
            }}
            currentLanguage={currentLanguage}
            onSettleDues={handleSettleDues}
          />
        )}

        {currentRole === 'approver' && (
          <ApproverPortal
            requests={requests}
            onOpenHitlModal={(req) => {
              setActiveHitlRequest(req);
              setIsHitlModalOpen(true);
            }}
            onDirectApprove={handleDirectApprove}
            onDirectReject={handleDirectReject}
            onOpenCertificateModal={(req) => {
              setActiveCertRequest(req);
              setIsCertModalOpen(true);
            }}
            onOpenAuditTrail={(req) => {
              setActiveAuditRequest(req);
              setIsAuditDrawerOpen(true);
            }}
          />
        )}

        {currentRole === 'admin' && (
          <AdminAuditPortal
            requests={requests}
            onOpenAuditTrail={(req) => {
              setActiveAuditRequest(req);
              setIsAuditDrawerOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>SOAIDEATHON-S1 Prototype</strong> • Human-in-the-Loop Agentic AI for Autonomous Institutional Service Delivery
          </div>
          <div className="text-[11px] text-slate-600">
            Powered by Gemini 3.7 Flash & Audited Institutional Knowledge RAG
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {activeHitlRequest && (
        <HitlApprovalModal
          request={activeHitlRequest}
          isOpen={isHitlModalOpen}
          onClose={() => setIsHitlModalOpen(false)}
          onApprove={handleApproveHitl}
          onReject={handleRejectHitl}
          onModify={handleModifyHitl}
        />
      )}

      {activeCertRequest && (
        <CertificatePreviewModal
          request={activeCertRequest}
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
        />
      )}

      <AuditTrailDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        selectedRequest={activeAuditRequest}
        allRequests={requests}
      />

      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onSelectPolicyForPrompt={(prompt, cat) => {
          setCurrentRole('student');
          handleSubmitNewRequest(prompt, cat, currentLanguage);
        }}
      />
    </div>
  );
}
