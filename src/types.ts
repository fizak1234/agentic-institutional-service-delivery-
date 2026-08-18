export type UserRole = 'student' | 'approver' | 'admin' | 'auditor';

export type RequestCategory = 'all' | 'certificate' | 'lab_booking' | 'maintenance' | 'grievance';

export interface StudentProfile {
  id: string;
  name: string;
  regNo: string;
  email: string;
  department: string;
  semester: string;
  cgpa: number;
  attendance: string;
  attendanceFloat: number;
  duesPending: number;
  hostelBlock: string;
  roomNo: string;
  researchProject?: string;
  safetyCertLevel: string;
  avatar: string;
}

export interface PlanStep {
  stepId: number;
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'waiting_approval' | 'failed';
  toolUsed: string;
  outputSummary: string;
}

export interface PolicyConflict {
  hasConflict: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  policyClause: string;
  description: string;
  remedy: string;
}

export interface UncertaintyDetection {
  isUncertain: boolean;
  missingInformation: string[];
  clarificationQuestion: string;
}

export interface HitlDetails {
  approvalRole: string;
  consequenceLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  financialImpact: string;
  academicImpact: string;
  safetyOrFacilityImpact: string;
  actionTitle: string;
  actionDescription: string;
  recommendedDecision: 'APPROVE' | 'CONDITIONAL' | 'REJECT';
  riskAnalysis: string;
  status?: 'pending' | 'approved' | 'rejected' | 'modified';
  approverNotes?: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface GeneratedArtifact {
  type: 'none' | 'certificate' | 'lab_pass' | 'maintenance_workorder' | 'appeal_dossier';
  title: string;
  referenceNumber: string;
  payloadDetails: string;
  qrCodeUrl?: string;
  signedTimestamp?: string;
  digitalSeal?: string;
}

export interface AuditLogEntry {
  blockIndex: number;
  actionId: string;
  timestamp: string;
  actor: string;
  eventType: 'INTENT_PARSED' | 'POLICY_EVALUATION' | 'HITL_PROPOSED' | 'HITL_APPROVED' | 'HITL_REJECTED' | 'WORKFLOW_EXECUTED' | 'ARTIFACT_SEALED';
  agentReasoning: string;
  toolUsed?: string;
  simulatedSha256: string;
  previousHash: string;
  status: 'verified' | 'tamper_proof';
}

export interface ServiceRequestRecord {
  id: string;
  trackingNumber: string;
  title: string;
  category: 'certificate' | 'lab_booking' | 'maintenance' | 'grievance';
  student: StudentProfile;
  rawPrompt: string;
  language: string;
  createdAt: string;
  status: 'planning' | 'waiting_approval' | 'approved' | 'executing' | 'completed' | 'rejected' | 'conflict_flagged';
  confidenceScore: number;
  planSteps: PlanStep[];
  policyConflict: PolicyConflict;
  uncertaintyDetected: UncertaintyDetection;
  hitlRequired: boolean;
  hitlDetails: HitlDetails;
  generatedArtifact?: GeneratedArtifact;
  auditTrail: AuditLogEntry[];
  languageResponseText: string;
}

export interface KnowledgeBaseItem {
  id: string;
  category: 'academic' | 'laboratory' | 'maintenance' | 'hostel' | 'grievance';
  title: string;
  clauseCode: string;
  summary: string;
  fullText: string;
  effectiveDate: string;
  authority: string;
  tags: string[];
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}
