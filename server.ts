import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Institutional Knowledge Context for RAG Grounding
const INSTITUTIONAL_RULES_CONTEXT = `
You are the autonomous Institutional Service Delivery AI for Siksha 'O' Anusandhan (SOA) Deemed to be University / Academic Institution.
You operate strictly under Human-in-the-Loop (HITL) governance.
Core University Policies:
1. CERTIFICATE SERVICES:
   - Bonafide Certificate: Auto-approved if enrolled with 0 disciplinary flags and valid ID. Turnaround: 5 mins.
   - Official Transcript: Requires zero financial dues (Tuition & Library) and min 75% attendance in past 2 semesters. Fee: ₹500. Turnaround: 24 hrs. Consequential action -> MUST require Registrar / Dean HITL approval.
   - Degree NOC / Character Certificate: Requires clearance from Proctorial Board and Hostel Warden.
2. LABORATORY BOOKINGS:
   - High-Performance AI Cluster (NVIDIA A100/H100): Requires active approved research project code, supervisor endorsement, and safety training cert. Max slot: 8 hours. Consequential action -> MUST require Lab Director HITL approval.
   - Advanced Robotics & VLSI Lab: Slots open 8:00 AM - 8:00 PM on weekdays. Cannot overlap with scheduled undergraduate course timetables.
3. MAINTENANCE & CAMPUS SERVICES:
   - High Severity (Water leakage near power mains, AC compressor smoke, fire alarm, elevator stuck): Immediate emergency dispatch, notification to Estate Officer, automated safety isolation request requiring Warden/Supervisor HITL signoff.
   - Standard Maintenance (Wi-Fi router reboot, furniture repair, tube light change): Auto-scheduled within 48h SLA.
4. ACADEMIC APPEALS & GRIEVANCE ESCALATION:
   - Attendance shortage (<75%): Eligible for condonation up to 65% ONLY with verified medical board certificate (Clause 4.2B) or approved university sports/cultural representation.
   - Re-evaluation / Grade grievance: Requires fee deposit and formal assignment to external evaluator by Academic Board.
`;

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SOA S1 Human-in-the-Loop Agentic AI Engine',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Agent processing endpoint
app.post('/api/agent/process', async (req, res) => {
  try {
    const {
      userPrompt,
      category,
      language = 'en',
      studentProfile,
      attachedDocs = [],
    } = req.body;

    const gemini = getGeminiClient();

    if (gemini && process.env.GEMINI_API_KEY) {
      const systemInstruction = `
${INSTITUTIONAL_RULES_CONTEXT}

Analyze the user's service request:
User Input: "${userPrompt}"
Selected Category: ${category || 'General'}
Detected Language: ${language}
Student Profile: ${JSON.stringify(studentProfile || { name: 'Aarav Sharma', regNo: 'SOA2023-CS-084', department: 'Computer Science & Engineering', semester: '6th', attendance: '73.5%', duesPending: 1200, disciplineClear: true })}

CRITICAL DIRECTIVES:
1. Multi-Step Plan: Formulate 4 to 6 logical autonomous steps (e.g. Validate Identity -> Query Institutional DB -> Check Policy Conflicts -> Determine Risk & Consequence -> Route for Human Approval / Execution -> Record Audit Hash).
2. Uncertainty & Policy Conflict Detection: Check if anything conflicts with university policy (e.g., unpaid dues blocking transcripts, attendance below 75%, lab schedule clashes, unauthorized budget debit). Never fabricate answers. If uncertain or conflicting, explicitly identify the exact policy clause, the deficiency, and the remedy.
3. Human-in-the-Loop (HITL) Consequence Assessment: Determine if this request requires human signoff before execution. High-impact operations (transcripts, GPU quotas, safety shutdowns, disciplinary actions, grade appeals) MUST require HITL approval.
4. Output STRICT JSON format adhering to the schema below.

JSON Response Schema:
{
  "requestSummary": "string (clear summary of user request)",
  "intentCategory": "certificate" | "lab_booking" | "maintenance" | "grievance" | "general",
  "confidenceScore": number (0.0 to 1.0),
  "detectedLanguage": "string",
  "languageResponseText": "string (empathetic, structured response in the user's chosen language)",
  "planSteps": [
    {
      "stepId": 1,
      "name": "string",
      "description": "string",
      "status": "completed" | "in_progress" | "pending" | "waiting_approval" | "failed",
      "toolUsed": "string (e.g. SIS_Database_Query, Policy_Rule_Validator, Conflict_Detector, Asset_Scheduler, Notary_Signer)",
      "outputSummary": "string"
    }
  ],
  "policyConflict": {
    "hasConflict": boolean,
    "severity": "none" | "low" | "medium" | "high" | "critical",
    "policyClause": "string",
    "description": "string",
    "remedy": "string"
  },
  "uncertaintyDetected": {
    "isUncertain": boolean,
    "missingInformation": ["string"],
    "clarificationQuestion": "string"
  },
  "hitlRequired": boolean,
  "hitlDetails": {
    "approvalRole": "string (e.g. Registrar, Dean of Academics, Lab Incharge, Hostel Warden, Maintenance Supervisor)",
    "consequenceLevel": "Low" | "Moderate" | "High" | "Critical",
    "financialImpact": "string",
    "academicImpact": "string",
    "safetyOrFacilityImpact": "string",
    "actionTitle": "string",
    "actionDescription": "string",
    "recommendedDecision": "APPROVE" | "CONDITIONAL" | "REJECT",
    "riskAnalysis": "string"
  },
  "generatedArtifact": {
    "type": "none" | "certificate" | "lab_pass" | "maintenance_workorder" | "appeal_dossier",
    "title": "string",
    "referenceNumber": "string",
    "payloadDetails": "string"
  },
  "auditLogEntry": {
    "actionId": "string",
    "timestamp": "string",
    "agentReasoning": "string",
    "simulatedSha256": "string"
  }
}
`;

      const response = await gemini.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed, engine: 'gemini-3.7-flash' });
    }

    // Fallback deterministic intelligent rule engine if Gemini key not set
    const fallbackData = generateDeterministicAgentResponse(
      userPrompt,
      category,
      language,
      studentProfile
    );
    return res.json({ success: true, data: fallbackData, engine: 'deterministic-institutional-engine' });
  } catch (error: any) {
    console.error('Agent processing error:', error);
    // Return robust fallback data on error
    const fallbackData = generateDeterministicAgentResponse(
      req.body.userPrompt || '',
      req.body.category || 'general',
      req.body.language || 'en',
      req.body.studentProfile
    );
    return res.json({
      success: true,
      data: fallbackData,
      warning: error.message,
      engine: 'deterministic-institutional-engine',
    });
  }
});

// Helper for deterministic rule engine
function generateDeterministicAgentResponse(
  userPrompt: string,
  category: string,
  language: string,
  studentProfile: any = {}
) {
  const promptLower = userPrompt.toLowerCase();
  const profile = studentProfile || {
    name: 'Aarav Sharma',
    regNo: 'SOA2023-CS-084',
    duesPending: 1200,
    attendance: '73.5%',
  };

  const isTranscript = promptLower.includes('transcript') || promptLower.includes('marksheet') || promptLower.includes('grade');
  const isLab = promptLower.includes('lab') || promptLower.includes('hpc') || promptLower.includes('cluster') || promptLower.includes('gpu') || promptLower.includes('robotics');
  const isMaintenance = promptLower.includes('ac') || promptLower.includes('leak') || promptLower.includes('wifi') || promptLower.includes('plumbing') || promptLower.includes('light') || promptLower.includes('smoke') || promptLower.includes('repair');
  const isGrievance = promptLower.includes('grievance') || promptLower.includes('appeal') || promptLower.includes('attendance') || promptLower.includes('fee') || promptLower.includes('dispute');

  const randomHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const now = new Date().toISOString();

  if (isTranscript) {
    const hasDueConflict = (profile.duesPending || 0) > 0;
    return {
      requestSummary: 'Official Academic Transcript & Sealed Dossier Issuance Request',
      intentCategory: 'certificate',
      confidenceScore: 0.98,
      detectedLanguage: language,
      languageResponseText: `I have analyzed your request for an Official Academic Transcript for ${profile.name} (${profile.regNo}). Before issuing the sealed transcript, the system cross-verified your institutional records. A policy condition was detected: pending library/hostel dues of ₹${profile.duesPending}. A Human-in-the-Loop approval workflow has been routed to the Registrar's Office with a conditional settlement option.`,
      planSteps: [
        {
          stepId: 1,
          name: 'Identity & Student Record Retrieval',
          description: 'Queried SOA Central SIS Database for academic standing & registration ID.',
          status: 'completed',
          toolUsed: 'SIS_Database_Query',
          outputSummary: `Verified ${profile.name}, Reg: ${profile.regNo}, Semester 6 CS.`,
        },
        {
          stepId: 2,
          name: 'Financial Clearance & Policy Check',
          description: 'Evaluated Section 3.1 of Academic By-Laws (Zero-Dues Policy for Official Transcripts).',
          status: 'completed',
          toolUsed: 'Policy_Rule_Validator',
          outputSummary: hasDueConflict ? `Policy Conflict Flagged: ₹${profile.duesPending} outstanding library dues.` : 'Financial clearance verified.',
        },
        {
          stepId: 3,
          name: 'Consequence & Risk Evaluation',
          description: 'Calculated institutional consequence score for issuing sealed legal credential.',
          status: 'completed',
          toolUsed: 'Risk_Impact_Analyzer',
          outputSummary: 'High Consequential Impact: Legal University Seal & Grade Certification.',
        },
        {
          stepId: 4,
          name: 'Human-in-the-Loop Gate & Registrar Routing',
          description: 'Created mandatory human verification package with clearance override parameters.',
          status: 'waiting_approval',
          toolUsed: 'HITL_Routing_Gateway',
          outputSummary: 'Awaiting digital signoff from Registrar Office / Finance Dean.',
        },
        {
          stepId: 5,
          name: 'Cryptographic Transcript Generation & Dispatch',
          description: 'Pending human authorization to generate SHA-256 watermarked PDF.',
          status: 'pending',
          toolUsed: 'Official_Notary_Signer',
          outputSummary: 'Queued for post-approval execution.',
        },
      ],
      policyConflict: {
        hasConflict: hasDueConflict,
        severity: 'medium',
        policyClause: 'Academic By-Law Section 3.1 & Fee Regulation Code 14',
        description: `Official transcripts cannot be released autonomously with pending university liabilities (Current balance: ₹${profile.duesPending}).`,
        remedy: 'Settle dues online via Student ERP Wallet or request conditional waiver approval from Finance Dean.',
      },
      uncertaintyDetected: {
        isUncertain: false,
        missingInformation: [],
        clarificationQuestion: '',
      },
      hitlRequired: true,
      hitlDetails: {
        approvalRole: 'Registrar & Finance Controller',
        consequenceLevel: 'High',
        financialImpact: `Transcript Fee ₹500 + Pending Dues ₹${profile.duesPending}`,
        academicImpact: 'Official certified grade sheet legally representing University GPA 8.92',
        safetyOrFacilityImpact: 'None',
        actionTitle: 'Authorize Official Sealed Transcript Issuance with Conditional Clearance',
        actionDescription: `Confirm issuance of sealed 6-Semester Transcript for ${profile.name} (${profile.regNo}) with provisional clearance or payment deduction authorization.`,
        recommendedDecision: hasDueConflict ? 'CONDITIONAL' : 'APPROVE',
        riskAnalysis: 'Releasing official credentials without clearance violates audited ISO-9001 university verification protocols.',
      },
      generatedArtifact: {
        type: 'certificate',
        title: 'Official Academic Transcript (Provisional Draft)',
        referenceNumber: `SOA-TRANS-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        payloadDetails: 'Student: Aarav Sharma | CGPA: 8.92 | Total Credits: 142 | SOA Deemed University Examination Division',
      },
      auditLogEntry: {
        actionId: `ACT-TRANS-${Date.now()}`,
        timestamp: now,
        agentReasoning: 'Checked Academic By-Laws Section 3.1. Detected ₹1200 library fine. Halted autonomous transcript minting. Dispatched HITL packet to Registrar.',
        simulatedSha256: randomHash,
      },
    };
  }

  if (isLab) {
    return {
      requestSummary: 'AI & High-Performance Computing (HPC) GPU Cluster Slot Allocation',
      intentCategory: 'lab_booking',
      confidenceScore: 0.96,
      detectedLanguage: language,
      languageResponseText: `I have received your booking request for the AI High-Performance GPU Cluster (4x NVIDIA A100 Nodes). The agentic scheduler verified your safety credentials, active research grant code, and schedule compatibility. Because this consumes high-value shared compute capacity (12 hours @ 400W/node), a Human-in-the-Loop review has been routed to Lab Director Dr. S. K. Mohapatra.`,
      planSteps: [
        {
          stepId: 1,
          name: 'Prerequisite & Safety Verification',
          description: 'Checked user GPU Lab Safety Certification & Active Project Authorization.',
          status: 'completed',
          toolUsed: 'Lab_Prerequisite_Checker',
          outputSummary: 'Safety Cert: Level-2 Certified (Expires Dec 2026).',
        },
        {
          stepId: 2,
          name: 'Cluster Schedule & Resource Quota Check',
          description: 'Queried SLURM Cluster Scheduler for Node 04-07 availability.',
          status: 'completed',
          toolUsed: 'SLURM_Cluster_Scheduler',
          outputSummary: 'Nodes available 18:00 - 06:00. No conflict with UG practical hours.',
        },
        {
          stepId: 3,
          name: 'Consequential Impact & Power Assessment',
          description: 'Calculated GPU compute allocation load and energy footprint.',
          status: 'completed',
          toolUsed: 'Compute_Impact_Assessor',
          outputSummary: 'Allocation: 4x A100 80GB VRAM, Est. Compute Credit Consumption: 480 GPU-hrs.',
        },
        {
          stepId: 4,
          name: 'Human-in-the-Loop Gate for Lab Director',
          description: 'Routed authorization ticket to Dr. S. K. Mohapatra (Head of AI & HPC Labs).',
          status: 'waiting_approval',
          toolUsed: 'HITL_Routing_Gateway',
          outputSummary: 'Awaiting faculty approval to grant SLURM SSH credentials.',
        },
        {
          stepId: 5,
          name: 'Issue Secure Access Token & Workstation Pass',
          description: 'Will generate Kerberos cluster key and QR biometric access pass once approved.',
          status: 'pending',
          toolUsed: 'SLURM_Access_Token_Generator',
          outputSummary: 'Staged for execution.',
        },
      ],
      policyConflict: {
        hasConflict: false,
        severity: 'none',
        policyClause: 'HPC Laboratory Usage Guidelines 2025 (Rule 8.4)',
        description: 'Compliant with student research allocation limits. Requires supervisor signature.',
        remedy: 'Supervisor notification dispatched automatically.',
      },
      uncertaintyDetected: {
        isUncertain: false,
        missingInformation: [],
        clarificationQuestion: '',
      },
      hitlRequired: true,
      hitlDetails: {
        approvalRole: 'Lab Director / HPC Facility Manager',
        consequenceLevel: 'Moderate',
        financialImpact: 'Est. Compute Value: ₹4,800 (Drawn from Department Research Grant CS-2026-AI)',
        academicImpact: 'Enables Deep Learning model training for IEEE Conference Paper Submission',
        safetyOrFacilityImpact: '4x A100 GPU cluster thermal load monitored via IoT BMS',
        actionTitle: 'Approve High-Performance GPU Cluster Allocation (4x NVIDIA A100 - 12h)',
        actionDescription: `Approve compute reservation for Aarav Sharma under Project 'Autonomous Multilingual Agent' from 18:00 to 06:00 on Node hpc-node-04.`,
        recommendedDecision: 'APPROVE',
        riskAnalysis: 'High resource reservation. Risk of job hang without supervisor monitoring.',
      },
      generatedArtifact: {
        type: 'lab_pass',
        title: 'HPC AI Cluster Digital Access Pass',
        referenceNumber: `SOA-HPC-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
        payloadDetails: 'Cluster: NVIDIA A100-SXM4 | Node: hpc-04 | User: SOA2023-CS-084 | Expiry: Tomorrow 06:00',
      },
      auditLogEntry: {
        actionId: `ACT-HPC-${Date.now()}`,
        timestamp: now,
        agentReasoning: 'Validated Level-2 HPC credentials. Verified SLURM slot availability. Routed to Lab Director Dr. Mohapatra for HITL validation.',
        simulatedSha256: randomHash,
      },
    };
  }

  if (isMaintenance) {
    const isEmergency = promptLower.includes('smoke') || promptLower.includes('leak') || promptLower.includes('fire') || promptLower.includes('shock');
    return {
      requestSummary: isEmergency ? 'CRITICAL: Hostel Electrical / AC Unit Emergency Work Order' : 'Campus Infrastructure & Maintenance Service Request',
      intentCategory: 'maintenance',
      confidenceScore: 0.99,
      detectedLanguage: language,
      languageResponseText: isEmergency
        ? `⚠️ EMERGENCY ACTION INITIATED: The AI Agent detected high-risk electrical/thermal symptoms in your report. The Autonomous Facility System has triggered an immediate emergency maintenance dispatch to Hostel Block 4, notified the Chief Warden, and created an urgent HITL authorization for electrical isolation.`
        : `Your maintenance ticket has been registered. The autonomous system classified the task, assigned technician Manoj Swain (ID: TECH-304), and scheduled service within the 24-hour SLA.`,
      planSteps: [
        {
          stepId: 1,
          name: 'Hazard & Urgency Classification',
          description: 'Evaluated ticket keywords against Campus Safety & Disaster Protocol matrix.',
          status: 'completed',
          toolUsed: 'Hazard_Classifier',
          outputSummary: isEmergency ? 'Severity Level 1 (Emergency Hazard - Potential Fire/Water Contact)' : 'Severity Level 3 (Routine Maintenance)',
        },
        {
          stepId: 2,
          name: 'Automated Facility Dispatch & Tech Assignment',
          description: 'Located closest available certified technician on the active campus roster.',
          status: 'completed',
          toolUsed: 'Workforce_Dispatch_Engine',
          outputSummary: 'Assigned Senior Electrician Manoj Swain (ETA: 12 minutes).',
        },
        {
          stepId: 3,
          name: 'Human-in-the-Loop Emergency Authorization',
          description: isEmergency ? 'Requested immediate safety breaker shutdown approval from Hostel Warden.' : 'Auto-scheduled inspection window.',
          status: isEmergency ? 'waiting_approval' : 'completed',
          toolUsed: 'HITL_Safety_Gate',
          outputSummary: isEmergency ? 'Awaiting Chief Warden / Estate Officer confirmation.' : 'Auto-approved under standard SLA policy.',
        },
        {
          stepId: 4,
          name: 'Auditable SMS & Push Alert Dispatch',
          description: 'Notified room occupants, hostel caretaker, and safety command center.',
          status: 'completed',
          toolUsed: 'Campus_Notification_Broadcaster',
          outputSummary: 'Broadcasted to Security Desk & Maintenance Supervisor.',
        },
      ],
      policyConflict: {
        hasConflict: false,
        severity: 'none',
        policyClause: 'SOA Campus Safety Protocol 2025 - Clause 9 (Electrical & Thermal Incidents)',
        description: 'Mandatory emergency escalation protocol activated.',
        remedy: 'Evacuate immediate proximity of smoking appliance until technician arrives.',
      },
      uncertaintyDetected: {
        isUncertain: false,
        missingInformation: [],
        clarificationQuestion: '',
      },
      hitlRequired: isEmergency,
      hitlDetails: {
        approvalRole: 'Hostel Chief Warden & Estate Safety Officer',
        consequenceLevel: isEmergency ? 'Critical' : 'Low',
        financialImpact: 'Est. Emergency Repair Cost: ₹1,500 (Covered under Campus AMC)',
        academicImpact: 'None',
        safetyOrFacilityImpact: 'Prevents electrical short-circuit risk in multi-occupant student dormitory.',
        actionTitle: 'Authorize Emergency Power Isolation & High-Priority Maintenance Entry',
        actionDescription: 'Permit maintenance crew to perform immediate breaker trip and hardware replacement in Room 402, Block-4.',
        recommendedDecision: 'APPROVE',
        riskAnalysis: 'Delay in power isolation could trigger secondary breaker trips affecting entire wing.',
      },
      generatedArtifact: {
        type: 'maintenance_workorder',
        title: 'Emergency Maintenance Dispatch Ticket #WO-2026-8841',
        referenceNumber: `WO-SOA-EMERG-${Math.floor(1000 + Math.random() * 9000)}`,
        payloadDetails: 'Location: Hostel-4, Room 402 | Tech: Manoj Swain | Priority: CRITICAL | SLA: 15 Mins',
      },
      auditLogEntry: {
        actionId: `ACT-MAINT-${Date.now()}`,
        timestamp: now,
        agentReasoning: isEmergency ? 'Detected smoke/thermal risk. Triggered Level-1 safety protocol and routed HITL breaker isolation approval to Warden.' : 'Routine ticket logged and assigned.',
        simulatedSha256: randomHash,
      },
    };
  }

  // Default Grievance / Academic appeal scenario
  return {
    requestSummary: 'Academic Grievance & Attendance Shortage Condonation Appeal',
    intentCategory: 'grievance',
    confidenceScore: 0.94,
    detectedLanguage: language,
    languageResponseText: `I have analyzed your academic appeal regarding the 73.5% attendance in CSE-302. Under University Academic By-Laws Section 4.2, the minimum threshold is 75.0%. However, Section 4.2B allows condonation up to 65% for verified medical hospitalization or university-approved technical fest representation. The agent has verified your medical submission and prepared a structured appeal packet for the Academic Dean & Grievance Board.`,
    planSteps: [
      {
        stepId: 1,
        name: 'Grievance Categorization & Record Match',
        description: 'Categorized under Academic Assessment & Attendance Discrepancy.',
        status: 'completed',
        toolUsed: 'Grievance_NLP_Classifier',
        outputSummary: 'Subject: CSE-302 Distributed Systems (Current: 73.5%, Required: 75.0%).',
      },
      {
        stepId: 2,
        name: 'Policy Exemption Clause Matching',
        description: 'Checked University Academic Regulation 4.2B (Medical & Official Duty Condonation).',
        status: 'completed',
        toolUsed: 'Policy_Rule_Validator',
        outputSummary: 'Eligible for Medical Condonation upon verification of Chief Medical Officer endorsement.',
      },
      {
        stepId: 3,
        name: 'Conflict & Fraud Prevention Analysis',
        description: 'Cross-referenced hospital date stamps with biometric gate logs.',
        status: 'completed',
        toolUsed: 'Biometric_Cross_Auditor',
        outputSummary: 'No anomalies detected in date timestamps.',
      },
      {
        stepId: 4,
        name: 'Human-in-the-Loop Dean of Academics Escalation',
        description: 'Prepared digital case file with attendance recalculation projection.',
        status: 'waiting_approval',
        toolUsed: 'HITL_Routing_Gateway',
        outputSummary: 'Awaiting decision from Dean of Academics Prof. P. K. Nanda.',
      },
      {
        stepId: 5,
        name: 'ERP Attendance Override & Admit Card Unlock',
        description: 'Staged to update Exam Portal once Dean grants condonation approval.',
        status: 'pending',
        toolUsed: 'ERP_Attendance_Updater',
        outputSummary: 'Queued for post-approval execution.',
      },
    ],
    policyConflict: {
      hasConflict: true,
      severity: 'medium',
      policyClause: 'Academic By-Law Section 4.2 (75% Mandatory Attendance Threshold)',
      description: 'Current attendance of 73.5% triggers automatic exam debarment unless condoned under Rule 4.2B.',
      remedy: 'Medical Board verification attached. Requires Dean of Academics approval before exam hall ticket generation.',
    },
    uncertaintyDetected: {
      isUncertain: false,
      missingInformation: [],
      clarificationQuestion: '',
    },
    hitlRequired: true,
    hitlDetails: {
      approvalRole: 'Dean of Academics & Grievance Board',
      consequenceLevel: 'High',
      financialImpact: 'Condonation Processing Fee ₹300 (Payable upon approval)',
      academicImpact: 'Allows student to appear for End-Semester Examinations without year-back penalty',
      safetyOrFacilityImpact: 'None',
      actionTitle: 'Authorize 1.5% Medical Attendance Condonation under Clause 4.2B',
      actionDescription: `Approve attendance adjustment from 73.5% to eligible 75.0% for Aarav Sharma (SOA2023-CS-084) based on SUM Hospital Medical Board Slip #MED-8832.`,
      recommendedDecision: 'APPROVE',
      riskAnalysis: 'Precedent-setting academic decision. Verified with attending physician records to ensure strict compliance.',
    },
    generatedArtifact: {
      type: 'appeal_dossier',
      title: 'Formal Academic Grievance Dossier #GRV-2026-441',
      referenceNumber: `SOA-GRV-${Math.floor(1000 + Math.random() * 9000)}`,
      payloadDetails: 'Student: Aarav Sharma | Subject: Distributed Systems | Medical Slip: #MED-8832 | Status: Escalated to Dean',
    },
    auditLogEntry: {
      actionId: `ACT-GRV-${Date.now()}`,
      timestamp: now,
      agentReasoning: 'Identified 73.5% attendance deficit. Verified eligibility under Rule 4.2B with SUM Hospital documentation. Routed to Academic Dean for HITL approval.',
      simulatedSha256: randomHash,
    },
  };
}

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOA S1 Agentic AI Platform running on http://localhost:${PORT}`);
  });
}

startServer();
