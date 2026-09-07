import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditProgram, FindingItem, Equipment } from '../types';
import { EquipmentCertificationCalendar } from './EquipmentCertificationCalendar';
import {
  ClipboardCheck,
  PlusCircle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  User,
  Calendar as CalendarIcon,
  FileText,
  ShieldCheck,
  Sparkles,
  X,
  Gauge,
  Scale,
  Building2,
  FileCheck2
} from 'lucide-react';

export const AuditsAndCAPAView: React.FC = () => {
  const { audits, findings, equipment, createFinding, updateFindingStatus, currentCompany, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'calendar' | 'findings' | 'audits' | 'dossier'>('calendar');
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);

  const [newFinding, setNewFinding] = useState<Partial<FindingItem>>({
    auditId: 'aud-02',
    standardClause: 'ISO 37301:2021 Cláusula 7.1.3 & NCh-ISO/IEC 17025',
    type: 'No Conformidad Menor',
    description: '',
    evidence: '',
    rootCauseAnalysis: '',
    correctiveAction: '',
    dueDate: '2026-09-30',
    assignedTo: 'Ingeniero Prevención de Riesgos',
    status: 'abierta'
  });

  const handleSaveFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinding.description || !newFinding.correctiveAction) return;

    createFinding({
      auditId: newFinding.auditId || 'aud-02',
      standardClause: newFinding.standardClause || 'ISO 37301 Cláusula 7.1.3',
      type: newFinding.type || 'No Conformidad Menor',
      description: newFinding.description,
      evidence: newFinding.evidence || 'Acta de fiscalización metrológica',
      rootCauseAnalysis: newFinding.rootCauseAnalysis || 'Desviación en reprogramación de calibración',
      correctiveAction: newFinding.correctiveAction,
      dueDate: newFinding.dueDate || '2026-09-30',
      assignedTo: newFinding.assignedTo || currentUser.name,
      status: 'abierta'
    });

    setIsFindingModalOpen(false);
  };

  const handleGenerateCAPAFromCalendar = (eq: Equipment) => {
    setActiveTab('findings');
  };

  const openFindingsCount = findings.filter((f) => f.status === 'abierta').length;
  const inProgressFindingsCount = findings.filter((f) => f.status === 'en_implementacion').length;
  const closedFindingsCount = findings.filter((f) => f.status === 'cerrada').length;

  const today = new Date(2026, 7, 31);
  const expiringOrExpiredCount = equipment.filter((eq) => {
    const expDate = new Date(eq.nextCalibrationDate);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
              RF-014 & RF-015 • AUDITORÍA, FISCALIZACIÓN & METROLOGÍA
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Auditoría, Fiscalización & Calendario Metrológico de Equipos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión integral de vencimientos de calibraciones (NCh-ISO/IEC 17025), auditorías de cumplimiento (ISO 37301) y planes de acción correctiva (CAPA).
          </p>
        </div>

        <button
          onClick={() => setIsFindingModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Hallazgo / CAPA</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Calibraciones por Vencer/Vencidas</span>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{expiringOrExpiredCount}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Hallazgos Abiertos</span>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{openFindingsCount}</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">En Implementación</span>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1">{inProgressFindingsCount}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Acciones Cerradas con Eficacia</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{closedFindingsCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-blue-300" />
          <span>Calendario de Vencimientos Metrológicos ({equipment.length})</span>
          {expiringOrExpiredCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {expiringOrExpiredCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('findings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'findings'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Hallazgos y Acciones Correctivas ({findings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'audits'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Programa de Auditorías ({audits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'dossier'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Dossier Fiscalización SUSESO / DT</span>
        </button>
      </div>

      {/* Tab 1: Equipment Certification Expiration Calendar */}
      {activeTab === 'calendar' && (
        <EquipmentCertificationCalendar onGenerateCAPA={handleGenerateCAPAFromCalendar} />
      )}

      {/* Tab 2: Findings List */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {findings.map((f) => {
            const isClosed = f.status === 'cerrada';
            return (
              <div
                key={f.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                        {f.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {f.standardClause}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white mt-1">{f.description}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        f.type === 'No Conformidad Mayor'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {f.type}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        f.status === 'cerrada'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : f.status === 'en_implementacion'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {f.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* 5 Whys / Root Cause & CAPA Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-750 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400">Análisis Causa Raíz (5 Porqués):</p>
                    <p className="text-slate-200">{f.rootCauseAnalysis || 'En proceso de análisis por el equipo prevencionista.'}</p>
                    <p className="text-[10px] text-slate-400 pt-1">Evidencia: {f.evidence}</p>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-750 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400">Plan de Acción Correctivo (CAPA):</p>
                    <p className="text-emerald-300 font-medium">{f.correctiveAction}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Responsable: <strong className="text-slate-200">{f.assignedTo}</strong></span>
                      <span>Plazo: <strong className="text-slate-200">{f.dueDate}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs flex-wrap gap-2">
                  <span className="text-[10px] text-slate-400">Auditoría Asociada: {f.auditId.toUpperCase()}</span>

                  <div className="flex items-center gap-2">
                    {f.status !== 'cerrada' && (
                      <button
                        onClick={() => updateFindingStatus(f.id, 'cerrada')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        ✓ Cerrar Hallazgo y Verificar Eficacia
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Audits List */}
      {activeTab === 'audits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {audits.map((a) => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                    {a.type}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-1.5">{a.title}</h3>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {a.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl">
                <p>Auditor Líder: <span className="font-semibold text-white">{a.leadAuditor || a.auditorLeader}</span></p>
                <p>Fechas Auditoría: <span className="font-mono text-slate-200">{a.startDate} al {a.endDate}</span></p>
                <p>Alcance: <span className="text-slate-400">{a.scope || 'Faenas operacionales y garitas de control'}</span></p>
                <p>Puntaje Conformidad: <span className="font-bold text-emerald-400">{a.score}%</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Fiscalization Dossier */}
      {activeTab === 'dossier' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
                Dossier de Evidencias para Fiscalizaciones de Autoridad
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compendio de documentos listos para presentación inmediata ante la Dirección del Trabajo (DT), SUSESO, Seremi de Salud y Carabineros.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full">
              ESTADO: 100% AUDITABLE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-blue-400">1. Metrología y Equipos</span>
              <h4 className="font-bold text-sm text-white">Certificados de Calibración NCh 17025</h4>
              <p className="text-xs text-slate-400">
                Informes de calibración semestral de etilómetros Dräger 6820 y certificados de Alcolocks Interlock 7000 emitidos por laboratorio acreditado INN.
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                ✓ {equipment.filter(e => e.status !== 'descalibrado_fuera_servicio').length} de {equipment.length} certificados vigentes
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-indigo-400">2. Legal y Laboral</span>
              <h4 className="font-bold text-sm text-white">RIOHS Depósito DT & SUSESO 92064</h4>
              <p className="text-xs text-slate-400">
                Cláusula N° 21 del Reglamento Interno autorizando controles aleatorios preventivos con reserva de datos según Ley N° 19.628.
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                ✓ Depósito Electrónico DT N° 45192-2026
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-amber-400">3. Cadena de Custodia</span>
              <h4 className="font-bold text-sm text-white">Trazabilidad Criptográfica SHA-256</h4>
              <p className="text-xs text-slate-400">
                Actas digitales con firma electrónica del conductor, precinto de seguridad numerado y recepción confirmada en laboratorio GC-MS.
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                ✓ 100% de actas respaldadas en bóveda inalterable
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Finding */}
      {isFindingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Registrar Nuevo Hallazgo / Acción CAPA</h2>
              <button onClick={() => setIsFindingModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFinding} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cláusula Normativa / Estándar *</label>
                <input
                  type="text"
                  required
                  value={newFinding.standardClause}
                  onChange={(e) => setNewFinding({ ...newFinding, standardClause: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Hallazgo</label>
                  <select
                    value={newFinding.type}
                    onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value as FindingItem['type'] })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="No Conformidad Mayor">No Conformidad Mayor</option>
                    <option value="No Conformidad Menor">No Conformidad Menor</option>
                    <option value="Oportunidad de Mejora">Oportunidad de Mejora</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fecha Límite Cierre</label>
                  <input
                    type="date"
                    required
                    value={newFinding.dueDate}
                    onChange={(e) => setNewFinding({ ...newFinding, dueDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descripción del Hallazgo *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detallar la desviación encontrada respecto al procedimiento..."
                  value={newFinding.description}
                  onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Análisis Causa Raíz</label>
                <textarea
                  rows={2}
                  placeholder="Aplicación de metodología 5 Porqués o Diagrama Ishikawa..."
                  value={newFinding.rootCauseAnalysis}
                  onChange={(e) => setNewFinding({ ...newFinding, rootCauseAnalysis: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Acción Correctiva Comprometida *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Acción concreta para eliminar la causa raíz..."
                  value={newFinding.correctiveAction}
                  onChange={(e) => setNewFinding({ ...newFinding, correctiveAction: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFindingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Guardar Hallazgo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
