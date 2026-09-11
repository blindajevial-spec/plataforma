import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskItem } from '../types';
import { SafetyAlertsEmailModal } from './SafetyAlertsEmailModal';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  Sparkles,
  X,
  Mail
} from 'lucide-react';

export const RiskManagementView: React.FC = () => {
  const { risks, addRisk, updateRisk, currentCompany, safetyRiskThresholds } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState('all');
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ prob: number; imp: number } | null>(null);
  const [isSafetyEmailModalOpen, setIsSafetyEmailModalOpen] = useState(false);

  // Modal
  const [isNewRiskModalOpen, setIsNewRiskModalOpen] = useState(false);
  const [newRisk, setNewRisk] = useState<Partial<RiskItem>>({
    code: `RSK-00${risks.length + 1}`,
    process: 'Transporte Carretero y Logística',
    dangerHazard: '',
    consequence: '',
    inherentProbability: 4,
    inherentImpact: 5,
    mitigationControls: '',
    residualProbability: 2,
    residualImpact: 2,
    responsible: 'Jefe Prevención de Riesgos',
    status: 'en_control'
  });

  const filteredRisks = risks.filter((r) => {
    const matchesSearch =
      r.dangerHazard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.consequence.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedRiskCategory === 'all' || r.process === selectedRiskCategory;
    const matchesCell =
      !selectedHeatmapCell ||
      (r.residualProbability === selectedHeatmapCell.prob && r.residualImpact === selectedHeatmapCell.imp);
    return matchesSearch && matchesCategory && matchesCell;
  });

  const getRiskBadgeColor = (level: RiskItem['residualLevel']) => {
    switch (level) {
      case 'Crítico':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Alto':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medio':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'Bajo':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRisk.dangerHazard || !newRisk.consequence) return;

    const inherentProb = newRisk.inherentProbability || 3;
    const inherentImp = newRisk.inherentImpact || 3;
    const inhScore = inherentProb * inherentImp;
    const inherentLevel = inhScore >= 15 ? 'Crítico' : inhScore >= 10 ? 'Alto' : inhScore >= 5 ? 'Medio' : 'Bajo';

    const resProb = newRisk.residualProbability || 2;
    const resImp = newRisk.residualImpact || 2;
    const resScore = resProb * resImp;
    const residualLevel = resScore >= 15 ? 'Crítico' : resScore >= 10 ? 'Alto' : resScore >= 5 ? 'Medio' : 'Bajo';

    addRisk({
      companyId: currentCompany.id,
      code: newRisk.code || `RSK-00${risks.length + 1}`,
      process: newRisk.process || 'Operaciones',
      dangerHazard: newRisk.dangerHazard,
      consequence: newRisk.consequence,
      inherentProbability: inherentProb,
      inherentImpact: inherentImp,
      inherentScore: inhScore,
      inherentLevel,
      mitigationControls: newRisk.mitigationControls || 'Controles estándar Blindaje Vial 360',
      residualProbability: resProb,
      residualImpact: resImp,
      residualScore: resScore,
      residualLevel,
      responsible: newRisk.responsible || 'Prevención de Riesgos',
      status: 'en_control',
      lastReviewDate: '2026-08-30'
    });

    setIsNewRiskModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
              RF-013 • GESTIÓN DE RIESGOS ISO 37301 & ISO 39001
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Matriz de Riesgos Operacionales y Viales (MIPER)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluación dinámica de riesgos de intemperancia, fatiga, cadenas de custodia y fallas operacionales con cálculo de riesgo inherente vs residual.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setIsSafetyEmailModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
            title="Configuración de Umbrales Críticos y Disparo Automático por Correo"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Umbrales & Alertas por Correo</span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              SUSESO
            </span>
          </button>

          <button
            onClick={() => setIsNewRiskModalOpen(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Nuevo Riesgo</span>
          </button>
        </div>
      </div>

      {/* Heatmap & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap 5x5 Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Matriz Residual 5x5 (Probabilidad x Severidad)
            </h2>
            {selectedHeatmapCell && (
              <button
                onClick={() => setSelectedHeatmapCell(null)}
                className="text-[10px] text-blue-400 hover:underline"
              >
                Limpiar Filtro
              </button>
            )}
          </div>

          {/* 5x5 Grid */}
          <div className="space-y-1.5 text-center">
            <div className="text-[10px] text-slate-400 font-semibold mb-1">▲ Probabilidad / Frecuencia</div>
            {[5, 4, 3, 2, 1].map((prob) => (
              <div key={prob} className="flex items-center gap-1.5">
                <span className="w-4 text-[10px] font-mono text-slate-400 font-bold">{prob}</span>
                {[1, 2, 3, 4, 5].map((imp) => {
                  const score = prob * imp;
                  const count = risks.filter(
                    (r) => r.residualProbability === prob && r.residualImpact === imp
                  ).length;
                  const isSelected =
                    selectedHeatmapCell?.prob === prob && selectedHeatmapCell?.imp === imp;

                  let cellColor = 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300';
                  if (score >= 15) cellColor = 'bg-rose-950/80 border-rose-700 text-rose-300';
                  else if (score >= 10) cellColor = 'bg-amber-950/80 border-amber-700 text-amber-300';
                  else if (score >= 6) cellColor = 'bg-yellow-950/70 border-yellow-700 text-yellow-300';

                  return (
                    <button
                      key={imp}
                      onClick={() =>
                        setSelectedHeatmapCell(
                          isSelected ? null : { prob, imp }
                        )
                      }
                      className={`flex-1 h-9 rounded-lg border flex items-center justify-center font-bold text-xs transition cursor-pointer ${cellColor} ${
                        isSelected ? 'ring-2 ring-white scale-105' : 'hover:scale-102'
                      }`}
                    >
                      {count > 0 ? count : ''}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-1 pl-5 text-[10px] text-slate-400 font-mono">
              <span className="flex-1">1 (Leve)</span>
              <span className="flex-1">2</span>
              <span className="flex-1">3</span>
              <span className="flex-1">4</span>
              <span className="flex-1">5 (Crítico)</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">Impacto / Severidad ►</div>
          </div>
        </div>

        {/* Risk Mitigation Stats */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            Efectividad de Mitigación (Riesgo Inherente vs Residual)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-750">
              <span className="text-[10px] text-slate-400">Riesgos Identificados</span>
              <p className="text-xl font-extrabold text-white mt-0.5">{risks.length}</p>
            </div>

            <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-800/40">
              <span className="text-[10px] text-rose-300">Críticos Inherentemente</span>
              <p className="text-xl font-extrabold text-rose-400 mt-0.5">
                {risks.filter((r) => r.inherentLevel === 'Crítico').length}
              </p>
            </div>

            <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/40">
              <span className="text-[10px] text-emerald-300">Críticos Residuales</span>
              <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {risks.filter((r) => r.residualLevel === 'Crítico').length}
              </p>
            </div>

            <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-800/40">
              <span className="text-[10px] text-blue-300">Tasa Mitigación</span>
              <p className="text-xl font-extrabold text-blue-400 mt-0.5">85%</p>
            </div>
          </div>

          {/* Quick Info text */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-750 text-xs text-slate-300 leading-relaxed">
            <p>
              <strong>Blindaje Vial 360</strong> aplica controles en la fuente (Alcohotest 0.00 pre-turno, Alcolock satelital en camiones y aleatoriedad SUSESO), reduciendo los riesgos críticos iniciales a nivel bajo/medio controlado.
            </p>
          </div>
        </div>
      </div>

      {/* Risks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Inventario de Peligros y Medidas de Control</h2>
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar peligro o medida de control..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Código / Proceso</th>
                <th className="px-4 py-3">Peligro y Consecuencia</th>
                <th className="px-4 py-3 text-center">Riesgo Inicial</th>
                <th className="px-4 py-3">Medidas de Mitigación / Control</th>
                <th className="px-4 py-3 text-center">Riesgo Residual</th>
                <th className="px-4 py-3">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredRisks.map((risk) => (
                <tr key={risk.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-mono font-bold text-rose-400">{risk.code}</p>
                    <span className="text-[10px] text-slate-400">{risk.process}</span>
                  </td>

                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="font-bold text-slate-100">{risk.dangerHazard}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{risk.consequence}</p>
                  </td>

                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {risk.inherentLevel} ({risk.inherentScore})
                    </span>
                  </td>

                  <td className="px-4 py-3.5 max-w-sm">
                    <p className="text-slate-300 text-xs">{risk.mitigationControls}</p>
                  </td>

                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRiskBadgeColor(risk.residualLevel)}`}>
                      {risk.residualLevel} ({risk.residualScore})
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-medium text-slate-200">{risk.responsible}</p>
                    <span className="text-[10px] text-slate-500">{risk.lastReviewDate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Risk */}
      {isNewRiskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Registrar Evaluación de Riesgo (MIPER)</h2>
              <button onClick={() => setIsNewRiskModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRisk} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Peligro Identificado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Conducción en ruta bajo efecto de sustancias estimulantes"
                  value={newRisk.dangerHazard}
                  onChange={(e) => setNewRisk({ ...newRisk, dangerHazard: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Consecuencia / Daño Potencial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Volcamiento, daño a terceros, fatalidad, sanción legal"
                  value={newRisk.consequence}
                  onChange={(e) => setNewRisk({ ...newRisk, consequence: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Probabilidad Inherente (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRisk.inherentProbability}
                    onChange={(e) => setNewRisk({ ...newRisk, inherentProbability: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Severidad Inherente (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRisk.inherentImpact}
                    onChange={(e) => setNewRisk({ ...newRisk, inherentImpact: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Medidas de Control & Mitigación *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej: Testeo aleatorio 15%, alcolock en camión, bloqueo automático"
                  value={newRisk.mitigationControls}
                  onChange={(e) => setNewRisk({ ...newRisk, mitigationControls: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Probabilidad Residual (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRisk.residualProbability}
                    onChange={(e) => setNewRisk({ ...newRisk, residualProbability: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Severidad Residual (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRisk.residualImpact}
                    onChange={(e) => setNewRisk({ ...newRisk, residualImpact: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRiskModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
                >
                  Guardar Riesgo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safety Alerts Email Modal */}
      <SafetyAlertsEmailModal
        isOpen={isSafetyEmailModalOpen}
        onClose={() => setIsSafetyEmailModalOpen(false)}
      />
    </div>
  );
};
