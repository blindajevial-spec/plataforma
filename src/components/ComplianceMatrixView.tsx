import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LegalNormItem } from '../types';
import { SusesoManualModal } from './SusesoManualModal';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Upload,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BookOpen,
  FileText
} from 'lucide-react';

export const ComplianceMatrixView: React.FC = () => {
  const { legalNorms, evaluateLegalNorm, currentUser, createFinding } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBody, setFilterBody] = useState('all');
  const [selectedNorm, setSelectedNorm] = useState<LegalNormItem | null>(null);
  const [evaluationLevel, setEvaluationLevel] = useState<LegalNormItem['complianceLevel']>('cumple_total');
  const [evidenceText, setEvidenceText] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualChapterId, setManualChapterId] = useState('cap-01');

  const bodies = Array.from(new Set(legalNorms.map((n) => n.body)));

  const filteredNorms = legalNorms.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBody = filterBody === 'all' || n.body === filterBody;
    return matchesSearch && matchesBody;
  });

  const compliantCount = legalNorms.filter((n) => n.complianceLevel === 'cumple_total').length;
  const partialCount = legalNorms.filter((n) => n.complianceLevel === 'cumple_parcial').length;
  const nonCompliantCount = legalNorms.filter((n) => n.complianceLevel === 'no_cumple').length;
  const globalScore = Math.round((compliantCount / (legalNorms.length || 1)) * 100);

  const handleOpenEvaluation = (norm: LegalNormItem) => {
    setSelectedNorm(norm);
    setEvaluationLevel(norm.complianceLevel);
    setEvidenceText(norm.evidenceDoc || '');
  };

  const handleOpenManual = (chapterId: string = 'cap-01') => {
    setManualChapterId(chapterId);
    setIsManualModalOpen(true);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNorm) return;

    evaluateLegalNorm(selectedNorm.id, evaluationLevel, evidenceText);

    // If partial or non-compliant, auto create a CAPA Finding
    if (evaluationLevel !== 'cumple_total') {
      createFinding({
        auditId: 'aud-02',
        standardClause: `${selectedNorm.body} - ${selectedNorm.article}`,
        type: evaluationLevel === 'no_cumple' ? 'No Conformidad Mayor' : 'No Conformidad Menor',
        description: `Brecha detectada en cumplimiento de ${selectedNorm.title}: ${selectedNorm.requirement.slice(0, 120)}...`,
        evidence: evidenceText || 'Evidencia no proporcionada en la evaluación de la matriz.',
        status: 'abierta',
        assignedTo: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`,
        dueDate: '2026-09-15',
        correctiveAction: 'Plan de regularización documental y actualización de protocolos.',
        rootCauseAnalysis: 'Falta de auditoría periódica de cumplimiento.'
      });
    }

    setSelectedNorm(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
              RF-011 & RF-012 • MOTOR DE COMPLIANCE CHILENO
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              ISO 37301 Sistema de Gestión de Cumplimiento
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Matriz Legal & Motor de Compliance Normativo
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluación automatizada del Dictamen SUSESO N.º 92064-2025, Ley 16.744, Art. 184 Código del Trabajo, Tolerancia Cero y cláusulas ISO 37301.
          </p>
        </div>

        <button
          onClick={() => handleOpenManual('tomo-01')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Manual de Cumplimiento SUSESO (8 Tomos / 250 pp)</span>
        </button>
      </div>

      {/* Featured Banner: Dictamen SUSESO 92064-2025 */}
      <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/30 border border-blue-500/30 rounded-2xl p-5 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl shrink-0 mt-0.5">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                  DOCTRINA OFICIAL SUSESO 02/07/2025
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  Dictamen N.º 92064-2025 • Ley 16.744
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                Pilar Técnico-Jurídico de Blindaje Vial 360: Exámenes Preventivos de Alcohol y Drogas
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                La SUSESO ratifica que el empleador está jurídicamente facultado y obligado por el deber de protección (Art. 184 CT) a efectuar controles preventivos de intemperancia en el transporte, siempre que se garantice el respeto a los derechos fundamentales y los 8 principios rectores.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => handleOpenManual('cap-01')}
              className="flex items-center justify-center gap-1.5 bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer shadow"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ver Doctrina Completa</span>
            </button>
            <button
              onClick={() => handleOpenManual('cap-02')}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cláusula RIOHS DT</span>
            </button>
          </div>
        </div>

        {/* 8 Principles Quick Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">1. Fin Preventivo</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">2. Dignidad & Pudor</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">3. No Discriminación</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">4. Sorteo Aleatorio</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">5. Proporcionalidad</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">6. Reserva Médica</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">7. Cadena Custodia</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">8. Mutualidades 16.744</span>
          </div>
        </div>
      </div>

      {/* Global Compliance Score & Breakdown Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Cumplimiento Global</span>
            <p className="text-2xl font-extrabold text-white mt-1">{globalScore}%</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">100% Cumplido</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{compliantCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Cumple Parcial (Alerta)</span>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{partialCount}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">No Cumple (Crítico)</span>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{nonCompliantCount}</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar norma, artículo o requisito legal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterBody}
            onChange={(e) => setFilterBody(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los Cuerpos Legales</option>
            {bodies.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legal Matrix Items Grid */}
      <div className="space-y-3">
        {filteredNorms.map((norm) => {
          const isCompliant = norm.complianceLevel === 'cumple_total';
          const isPartial = norm.complianceLevel === 'cumple_parcial';

          return (
            <div
              key={norm.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-sm transition space-y-3 ${
                !isCompliant && !isPartial
                  ? 'border-rose-600/80 bg-rose-950/20'
                  : isPartial
                  ? 'border-amber-600/60 bg-amber-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800 font-mono">
                      {norm.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {norm.body} • {norm.article}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-1">{norm.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                      isCompliant
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isPartial
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {norm.complianceLevel.replace('_', ' ')}
                  </span>

                  <button
                    onClick={() => handleOpenEvaluation(norm)}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Evaluar / Evidencia
                  </button>
                </div>
              </div>

              {/* Requirement description */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-750">
                <span className="font-semibold text-slate-200">Requisito Exigido: </span>
                {norm.requirement}
              </p>

              {/* Evidence and Evaluator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Evidencia Digital: <strong className="text-slate-200">{norm.evidenceDoc}</strong></span>
                </div>
                <span>Evaluado el {norm.lastEvaluatedAt} por {norm.evaluator}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Evaluar Norma Legal */}
      {selectedNorm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-blue-400">{selectedNorm.code}</span>
                <h2 className="font-bold text-base text-white">{selectedNorm.title}</h2>
              </div>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nivel de Cumplimiento Normativo *
                </label>
                <select
                  value={evaluationLevel}
                  onChange={(e) => setEvaluationLevel(e.target.value as LegalNormItem['complianceLevel'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold"
                >
                  <option value="cumple_total">100% CUMPLE TOTAL (Conforme con la Ley)</option>
                  <option value="cumple_parcial">CUMPLE PARCIAL (Requiere Acción Correctiva)</option>
                  <option value="no_cumple">NO CUMPLE (No Conformidad Mayor Inmediata)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Documento / Registro de Evidencia Digital Adjunto
                </label>
                <textarea
                  rows={3}
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="Detallar nombre de archivo, número de resolución DT, acta de comité paritario o enlace..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {evaluationLevel !== 'cumple_total' && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Se creará automáticamente una Acción Correctiva (CAPA) en el módulo de Auditorías.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedNorm(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Guardar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual de Cumplimiento SUSESO Modal */}
      <SusesoManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        initialChapterId={manualChapterId}
      />
    </div>
  );
};
