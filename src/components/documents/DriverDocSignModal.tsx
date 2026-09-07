import React, { useState } from 'react';
import { DriverDocument } from '../../types';
import { formatDocType } from '../../utils/documentValidation';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  FileText,
  User,
  Hash
} from 'lucide-react';

interface DriverDocSignModalProps {
  document: DriverDocument | null;
  onClose: () => void;
  onSign: (docId: string, signerName: string, signerRut: string, certType: 'valida_fea' | 'valida_fes') => void;
}

export const DriverDocSignModal: React.FC<DriverDocSignModalProps> = ({
  document,
  onClose,
  onSign
}) => {
  if (!document) return null;

  const [signatureType, setSignatureType] = useState<'valida_fea' | 'valida_fes'>('valida_fea');
  const [signerName, setSignerName] = useState(document.driverName);
  const [signerRut, setSignerRut] = useState(document.driverRut);
  const [pinOrToken, setPinOrToken] = useState('8942');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSign(document.id, signerName, signerRut, signatureType);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                Ley N.º 19.799 sobre Firma Electrónica
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Suscripción Digital de Documento</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSignSubmit} className="p-6 space-y-4 text-xs text-slate-300">
          {/* Document Summary */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <span className="text-[10px] font-mono text-blue-400">{document.code} • {formatDocType(document.type)}</span>
            <h3 className="font-bold text-sm text-white">{document.title}</h3>
            <p className="text-[11px] text-slate-400">
              Titular: <strong className="text-slate-200">{document.driverName}</strong> ({document.driverRut})
            </p>
          </div>

          {/* Signature Type Selector */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-200">Modalidad de Firma Electrónica</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSignatureType('valida_fea')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  signatureType === 'valida_fea'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>FEA Avanzada</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Dispositivo criptográfico acreditado por Ministerio de Economía (E-CertChile).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSignatureType('valida_fes')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  signatureType === 'valida_fes'
                    ? 'bg-cyan-600/20 border-cyan-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-400">
                  <Lock className="w-4 h-4" />
                  <span>FES ClaveÚnica</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Autenticación de identidad mediante ClaveÚnica Segpres y código OTP.
                </p>
              </button>
            </div>
          </div>

          {/* Signer Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nombre del Suscriptor</label>
              <input
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">RUT Suscriptor</label>
              <input
                type="text"
                required
                value={signerRut}
                onChange={(e) => setSignerRut(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* PIN / Token */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              {signatureType === 'valida_fea' ? 'PIN Dispositivo Token Criptográfico' : 'Clave de Seguridad ClaveÚnica'}
            </label>
            <input
              type="password"
              required
              value={pinOrToken}
              onChange={(e) => setPinOrToken(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none font-mono tracking-widest"
              placeholder="••••"
            />
          </div>

          {/* Legal acceptance checkbox */}
          <label className="flex items-start gap-2.5 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-400 leading-tight">
              Certifico la veracidad de la suscripción electrónica conforme a la Ley N.º 19.799 y autorizo la emisión del sello de tiempo inalterable SHA-256 en custodia de Biovigilancia 360°.
            </span>
          </label>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || !acceptedTerms}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Estampando Firma Digital...' : 'Firmar Digitalmente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
