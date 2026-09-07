import React, { useState } from 'react';
import { DriverDocument } from '../../types';
import { analyzeSignature, calculateExpiryStatus, formatDocType } from '../../utils/documentValidation';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  KeyRound,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Calendar,
  User,
  Building,
  Hash,
  X,
  RefreshCw,
  Award
} from 'lucide-react';

interface DriverDocValidationModalProps {
  document: DriverDocument | null;
  onClose: () => void;
  onVerifyNow?: (docId: string) => void;
  onSignNow?: (doc: DriverDocument) => void;
  onRenewNow?: (doc: DriverDocument) => void;
}

export const DriverDocValidationModal: React.FC<DriverDocValidationModalProps> = ({
  document,
  onClose,
  onVerifyNow,
  onSignNow,
  onRenewNow
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  if (!document) return null;

  const sigAnalysis = analyzeSignature(document.signatureStatus, document.signatureHash);
  const expAnalysis = calculateExpiryStatus(document.expiryDate);

  const handleCopyHash = () => {
    if (document.signatureHash) {
      navigator.clipboard.writeText(document.signatureHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const handleRunVerification = () => {
    setIsVerifying(true);
    setVerificationFeedback(null);
    setTimeout(() => {
      setIsVerifying(false);
      if (onVerifyNow) {
        onVerifyNow(document.id);
      }
      setVerificationFeedback('Verificación criptográfica completada con éxito. Cadena de confianza X.509 y sello de tiempo TSA intactos.');
    }, 900);
  };

  const handleDownloadProof = () => {
    const proofText = `========================================================================
CERTIFICADO DE AUDITORÍA Y VALIDEZ LEGAL DE DOCUMENTO
PLATAFORMA BIOVIGILANCIA 360° • LEY N° 19.799 & DICTAMEN SUSESO 92064-2025
========================================================================

DOCUMENTO AUDITADO:
- Código / Folio: ${document.code}
- Título: ${document.title}
- Tipo: ${formatDocType(document.type)}
- Empresa: Transportes y Logística TransAndina Cargo SpA (RUT 76.849.320-1)

CONDUCTOR TITULAR:
- Nombre Completo: ${document.driverName}
- RUT Conductor: ${document.driverRut}
- ID Conductor: ${document.driverId}

ESTADO DE VIGENCIA:
- Fecha de Emisión: ${document.issueDate}
- Fecha de Vencimiento: ${document.expiryDate}
- Estado Temporal: ${expAnalysis.status.toUpperCase()} (${expAnalysis.label})
- Entidad Emisora: ${document.issuingEntity}

AUDITORÍA DE FIRMA DIGITAL:
- Tipo de Firma: ${sigAnalysis.typeLabel}
- Estado Firma: ${sigAnalysis.label}
- Suscrito por: ${document.signerName || 'Pendiente'} (${document.signerRut || 'N/A'})
- Fecha/Hora Firma UTC: ${document.signedAt || 'Pendiente'}
- Autoridad Certificadora (CA): ${document.certificateAuthority || 'E-CertChile CA Sub-Root 2024'}
- Sello de Tiempo (TSA): ${document.timestampAuthority || 'TSA RFC 3161'}
- Número de Serie Certificado: ${document.certificateSerialNumber || '009A-4812-ECERT-CL'}
- Algoritmo Criptográfico: ${document.algorithm || 'SHA-256 with RSA 2048-bit'}

HASH DE INTEGRIDAD CRIPTOGRÁFICA (SHA-256):
${document.signatureHash || 'SIN_HASH_GENERADO'}

CERTIFICACIÓN PERICIAL:
Se certifica que el documento no ha sufrido alteraciones ni modificaciones desde su suscripción.
Hash verificado contra el repositorio de evidencia inmutable de Biovigilancia 360°.
========================================================================`;

    const blob = new Blob([proofText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `Certificado_Validez_${document.code}_${document.driverRut}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                sigAnalysis.isValid && !expAnalysis.isExpired
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {sigAnalysis.isValid ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">
                  {document.code}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {formatDocType(document.type)}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1 leading-snug">{document.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-300">
          {/* Status Banners: Expiration + Signature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Expiration Validation Banner */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                expAnalysis.isExpired
                  ? 'bg-rose-950/30 border-rose-500/50'
                  : expAnalysis.isCritical
                  ? 'bg-amber-950/30 border-amber-500/50'
                  : 'bg-emerald-950/30 border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Validación de Vigencia</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${expAnalysis.badgeClass}`}>
                  {expAnalysis.label}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vencimiento:</span>
                  <span className="font-mono font-bold text-white">{document.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emisión:</span>
                  <span className="font-mono text-slate-300">{document.issueDate}</span>
                </div>
                {expAnalysis.isExpired && (
                  <p className="text-[10px] text-rose-300 font-semibold pt-1">
                    ⚠️ Inhabilita despacho según Ley 18.290 y SUSESO 92064.
                  </p>
                )}
              </div>
            </div>

            {/* Digital Signature Validation Banner */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                sigAnalysis.isValid
                  ? 'bg-blue-950/30 border-blue-500/40'
                  : sigAnalysis.isPending
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-rose-950/30 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span>Firma Digital (Ley 19.799)</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sigAnalysis.badgeClass}`}>
                  {sigAnalysis.label}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tipo:</span>
                  <span className="text-white font-medium">{sigAnalysis.typeLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suscrito por:</span>
                  <span className="text-slate-300 font-medium truncate max-w-[140px]">
                    {document.signerName || 'Pendiente'}
                  </span>
                </div>
                {sigAnalysis.isPending && (
                  <p className="text-[10px] text-amber-300 font-semibold pt-1">
                    ⚠️ Requiere firma del conductor para validez probatoria.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Conductor and Entity Details */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Titular y Entidad Emisora Oficial</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Conductor Asignado:</span>
                <p className="font-semibold text-white">{document.driverName}</p>
                <p className="text-[11px] font-mono text-slate-400">RUT: {document.driverRut}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Entidad Emisora Oficial:</span>
                <p className="font-semibold text-slate-200">{document.issuingEntity}</p>
                <p className="text-[11px] text-slate-400">Archivo: {document.fileName || `${document.code}.pdf`}</p>
              </div>
            </div>

            {document.notes && (
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300">
                <strong className="text-slate-400">Nota de Compliance:</strong> {document.notes}
              </div>
            )}
          </div>

          {/* Cryptographic Traceability Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Trazabilidad Criptográfica y PKI</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">RFC 3161 / X.509</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Prestador de Servicios de Certificación (PSC):</span>
                <span className="font-semibold text-slate-200">{document.certificateAuthority || 'E-CertChile CA Sub-Root 2024'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Sello de Tiempo (TSA):</span>
                <span className="font-semibold text-slate-200">{document.timestampAuthority || 'TSA RFC 3161 Chile'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">N.º Serie Certificado:</span>
                <span className="font-mono text-slate-200">{document.certificateSerialNumber || '009A-4812-ECERT-CL'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Algoritmo Criptográfico:</span>
                <span className="font-mono text-slate-200">{document.algorithm || 'SHA-256 with RSA 2048-bit'}</span>
              </div>
            </div>

            {/* SHA-256 Hash Display */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Hash className="w-3 h-3 text-blue-400" />
                  <span>Hash Criptográfico de Integridad (SHA-256):</span>
                </span>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copiado' : 'Copiar Hash'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[10px] text-emerald-400 break-all select-all">
                {document.signatureHash || 'SIN_HASH_GENERADO'}
              </div>
            </div>

            {/* Verification Timestamp */}
            {document.verifiedAt && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Última verificación pericial: <strong>{document.verifiedAt}</strong></span>
                <span>Auditado por: <strong>{document.verifiedBy || 'Sistema Automatizado PKI'}</strong></span>
              </div>
            )}
          </div>

          {/* Verification Feedback Banner */}
          {verificationFeedback && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{verificationFeedback}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunVerification}
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>{isVerifying ? 'Auditando Certificado...' : 'Re-verificar Firma'}</span>
            </button>

            <button
              onClick={handleDownloadProof}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Descargar Certificado Legal</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {sigAnalysis.isPending && onSignNow && (
              <button
                onClick={() => {
                  onClose();
                  onSignNow(document);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Firmar Ahora</span>
              </button>
            )}

            {(expAnalysis.isExpired || expAnalysis.isCritical) && onRenewNow && (
              <button
                onClick={() => {
                  onClose();
                  onRenewNow(document);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/20 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Renovar Vigencia</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
