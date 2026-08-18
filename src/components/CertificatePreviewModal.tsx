import React from 'react';
import {
  FileCheck,
  Download,
  Printer,
  ShieldCheck,
  QrCode,
  Lock,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { ServiceRequestRecord } from '../types';

interface CertificatePreviewModalProps {
  request: ServiceRequestRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  request,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const artifact = request.generatedArtifact;
  const isTranscript = artifact?.type === 'certificate';
  const isLabPass = artifact?.type === 'lab_pass';
  const isWorkOrder = artifact?.type === 'maintenance_workorder';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSim = () => {
    alert(`Downloading verified cryptographic PDF: ${artifact?.referenceNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Official Generated Artifact & Digital Proof
              </h3>
              <p className="text-xs text-slate-400">
                Ref: {artifact?.referenceNumber} • Tamper-Evident Hash Sealed
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

        {/* Certificate Paper Render Area */}
        <div className="p-6 overflow-y-auto bg-slate-950/50 flex justify-center">
          <div className="w-full bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-2xl border-4 border-double border-slate-300 relative overflow-hidden font-serif">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg]">
              <span className="text-6xl font-black uppercase tracking-widest text-slate-900">
                SOA UNIVERSITY VERIFIED
              </span>
            </div>

            {/* University Header */}
            <div className="text-center border-b-2 border-indigo-900 pb-4 mb-4">
              <div className="inline-flex items-center space-x-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-indigo-900 text-white flex items-center justify-center text-xs font-bold">
                  SOA
                </div>
                <span className="text-lg font-bold tracking-tight text-indigo-950 font-sans">
                  SIKSHA &apos;O&apos; ANUSANDHAN
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-widest text-slate-600 font-sans font-semibold">
                (Deemed to be University Declared U/S 3 of UGC Act, 1956)
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                Khandagiri Square, Bhubaneswar, Odisha - 751030
              </p>
            </div>

            {/* Document Title Banner */}
            <div className="text-center my-4">
              <span className="px-4 py-1 bg-indigo-50 border border-indigo-200 text-indigo-950 font-sans font-bold text-xs uppercase tracking-wider rounded-md">
                {artifact?.title || 'Official Institutional Credential'}
              </span>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                DOCUMENT NO: {artifact?.referenceNumber}
              </p>
            </div>

            {/* Document Body */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-800 font-sans my-5">
              {isTranscript && (
                <>
                  <p>
                    This is to certify that <strong>{request.student.name}</strong> (Registration No:{' '}
                    <strong>{request.student.regNo}</strong>), a bonafide student of{' '}
                    <strong>{request.student.department}</strong>, has successfully completed 6 semesters of the
                    B.Tech curriculum with a Cumulative Grade Point Average (CGPA) of{' '}
                    <strong>{request.student.cgpa} / 10.00</strong>.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-2 text-[11px]">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Total Credits Earned: <strong>142</strong></div>
                      <div>Academic Standing: <strong>First Class Exemplary</strong></div>
                      <div>Disciplinary Status: <strong>Clear / Zero Flags</strong></div>
                      <div>Attendance Verification: <strong>Satisfactory</strong></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 italic">
                    This electronic transcript is issued autonomously under audited Human-in-the-Loop authorization by the Office of the Registrar.
                  </p>
                </>
              )}

              {isLabPass && (
                <>
                  <p>
                    <strong>High-Performance AI Computing Cluster Authorization:</strong>
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] space-y-1.5">
                    <div>User: <strong>{request.student.name}</strong> ({request.student.regNo})</div>
                    <div>Allocated Resource: <strong>4x NVIDIA A100-SXM4 80GB (Node hpc-04)</strong></div>
                    <div>Research Grant ID: <strong>{request.student.researchProject}</strong></div>
                    <div>Authorized Time Window: <strong>18:00 to 06:00 (12 Hours)</strong></div>
                    <div>Kerberos Access Port: <strong>SSH Port 2204 • Key Sealed</strong></div>
                  </div>
                </>
              )}

              {isWorkOrder && (
                <>
                  <p>
                    <strong>Emergency Maintenance Dispatch Order:</strong>
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] space-y-1">
                    <div>Location: <strong>Hostel Block 4, Room 402</strong></div>
                    <div>Assigned Technician: <strong>Manoj Swain (ID: TECH-304)</strong></div>
                    <div>Priority Level: <strong className="text-rose-700">CRITICAL SAFETY (15 Min SLA)</strong></div>
                    <div>Action: <strong>Power Breaker Isolation & AC Compressor Replacement</strong></div>
                  </div>
                </>
              )}

              {!isTranscript && !isLabPass && !isWorkOrder && (
                <p>{artifact?.payloadDetails}</p>
              )}
            </div>

            {/* Bottom Signatures & QR Seal */}
            <div className="border-t border-slate-200 pt-4 mt-6 flex items-end justify-between font-sans text-[10px]">
              <div className="flex items-center space-x-2">
                <div className="w-14 h-14 bg-slate-100 border border-slate-300 p-1 flex items-center justify-center rounded">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Scan to Verify</div>
                  <div className="text-[9px] text-slate-500 font-mono">soa.ac.in/verify</div>
                  <div className="text-[9px] text-emerald-700 font-semibold flex items-center space-x-0.5 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Cryptographically Signed</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-serif italic text-indigo-900 font-bold text-xs mb-1">
                  {request.hitlDetails.decidedBy || 'Prof. B. B. Pradhan'}
                </div>
                <div className="font-bold text-slate-900">{request.hitlDetails.approvalRole}</div>
                <div className="text-slate-500">Siksha &apos;O&apos; Anusandhan University</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Date: {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Fingerprint: {request.auditTrail?.[0]?.simulatedSha256?.slice(0, 18)}...</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadSim}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow-md shadow-indigo-900/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
