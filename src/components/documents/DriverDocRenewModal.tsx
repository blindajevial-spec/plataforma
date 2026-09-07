import React, { useState } from 'react';
import { DriverDocument } from '../../types';
import { formatDocType, calculateExpiryStatus } from '../../utils/documentValidation';
import {
  Calendar,
  X,
  FileCheck,
  Building,
  Hash,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface DriverDocRenewModalProps {
  document: DriverDocument | null;
  onClose: () => void;
  onRenew: (docId: string, newExpiryDate: string, issuingEntity?: string, newFolio?: string) => void;
}

export const DriverDocRenewModal: React.FC<DriverDocRenewModalProps> = ({
  document,
  onClose,
  onRenew
}) => {
  if (!document) return null;

  // Default suggested new expiry date: 1 year from now (or 2 years for license)
  const defaultNextDate = document.type === 'licencia_conducir' ? '2031-09-06' : '2027-09-06';

  const [newExpiryDate, setNewExpiryDate] = useState(defaultNextDate);
  const [newFolio, setNewFolio] = useState(document.code);
  const [newIssuingEntity, setNewIssuingEntity] = useState(document.issuingEntity);
  const [observations, setObservations] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpiryDate) return;

    onRenew(document.id, newExpiryDate, newIssuingEntity, newFolio);
    onClose();
  };

  const currentAnalysis = calculateExpiryStatus(document.expiryDate);
  const nextAnalysis = calculateExpiryStatus(newExpiryDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Gestión de Vigencias
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Renovación de Fecha de Vencimiento</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-300">
          {/* Target Document Card */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white">{document.title}</span>
              <span className="text-[10px] font-mono text-blue-400">{document.code}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Conductor: <strong className="text-slate-200">{document.driverName}</strong> ({document.driverRut})
            </p>
            <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/80">
              <span className="text-slate-400">Vigencia actual:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentAnalysis.badgeClass}`}>
                {document.expiryDate} ({currentAnalysis.label})
              </span>
            </div>
          </div>

          {/* New Expiration Date Field */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1 flex items-center justify-between">
              <span>Nueva Fecha de Vencimiento *</span>
              <span className="text-[10px] text-emerald-400 font-normal">
                {nextAnalysis.daysRemaining > 0 ? `+${nextAnalysis.daysRemaining} días de vigencia` : ''}
              </span>
            </label>
            <input
              type="date"
              required
              min="2026-09-07"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Seleccione la fecha de caducidad estipulada en el nuevo certificado de revalidación.
            </p>
          </div>

          {/* New Folio and Entity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">N.º Folio / Certificado</label>
              <input
                type="text"
                required
                value={newFolio}
                onChange={(e) => setNewFolio(e.target.value)}
                placeholder="Ej: PSI-ACHS-2026-9921"
                className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Entidad Emisora</label>
              <input
                type="text"
                required
                value={newIssuingEntity}
                onChange={(e) => setNewIssuingEntity(e.target.value)}
                placeholder="Ej: ACHS / Mutual / Dirección Tránsito"
                className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Observaciones de Revalidación (Opcional)</label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej: Aprobado sin observaciones visuales ni sensoriales en centro del conductor."
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-slate-200 text-xs focus:outline-none resize-none"
            />
          </div>

          {/* Audit Notice */}
          <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl flex items-start gap-2 text-[11px] text-blue-300">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              La renovación se registrará en el registro inalterable de auditoría (ISO 37301) y sincronizará la habilitación del conductor en la flota.
            </span>
          </div>

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
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/20 transition cursor-pointer"
            >
              Confirmar Renovación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
