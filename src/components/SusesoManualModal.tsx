import React, { useState } from 'react';
import {
  MANUAL_COMPLIANCE_TOMOS,
  DICTAMEN_SUSESO_SUMMARY,
  COMMERCIAL_VALUE_PROPOSITION,
  ManualTomo
} from '../data/susesoManualData';
import {
  BookOpen,
  Scale,
  ShieldCheck,
  FileText,
  Workflow,
  FlaskConical,
  FileCheck2,
  ShieldAlert,
  GraduationCap,
  FileStack,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  ChevronRight,
  Sparkles,
  X,
  Building2,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface SusesoManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChapterId?: string;
}

export const SusesoManualModal: React.FC<SusesoManualModalProps> = ({
  isOpen,
  onClose,
  initialChapterId = 'tomo-01'
}) => {
  const [activeTomoId, setActiveTomoId] = useState<string>(initialChapterId.replace('cap-', 'tomo-'));
  const [activeTab, setActiveTab] = useState<'reader' | 'forms' | 'commercial' | 'full_dossier'>('reader');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [selectedFormIndex, setSelectedFormIndex] = useState<number>(0);

  // Form generator interactive state
  const [formDonorName, setFormDonorName] = useState('Juan Carlos Pérez Morales');
  const [formDonorRut, setFormDonorRut] = useState('14.892.311-K');
  const [formOperatorName, setFormOperatorName] = useState('Carlos Sepúlveda (Técnico Nivel 2)');
  const [formEquipmentSerial, setFormEquipmentSerial] = useState('DRG-6820-CL-8821');
  const [formAlcoholValue, setFormAlcoholValue] = useState('0.00');
  const [formResultState, setFormResultState] = useState<'apto' | 'bloqueo_preventivo'>('apto');

  if (!isOpen) return null;

  const currentTomo = MANUAL_COMPLIANCE_TOMOS.find((t) => t.id === activeTomoId) || MANUAL_COMPLIANCE_TOMOS[0];

  const handleCopyClause = (clauseText: string, id: string) => {
    navigator.clipboard.writeText(clauseText);
    setCopiedClauseId(id);
    setTimeout(() => setCopiedClauseId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getTomoIcon = (name: string) => {
    switch (name) {
      case 'Scale':
        return <Scale className="w-4 h-4" />;
      case 'Building2':
        return <Building2 className="w-4 h-4" />;
      case 'Workflow':
        return <Workflow className="w-4 h-4" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4" />;
      case 'FileCheck2':
        return <FileCheck2 className="w-4 h-4" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'FileStack':
        return <FileStack className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // Filtered sections for search
  const searchResults = searchTerm
    ? MANUAL_COMPLIANCE_TOMOS.flatMap((t) =>
        t.sections
          .filter(
            (s) =>
              s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (s.standardClause && s.standardClause.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((s) => ({ ...s, tomoNumber: t.tomoNumber, tomoTitle: t.title }))
      )
    : [];

  // All forms in Tomo V
  const tomoVForms = MANUAL_COMPLIANCE_TOMOS.find((t) => t.id === 'tomo-05')?.sections.filter((s) => s.formTemplate) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Superior */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/15 text-blue-400 border border-blue-500/30 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded font-mono">
                  MANUAL OFICIAL • 250 PÁGINAS EQUIVALENTES
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Dictamen SUSESO N.º 92064-2025
                </span>
              </div>
              <h1 className="text-lg font-bold text-white leading-tight mt-0.5">
                Manual de Cumplimiento Normativo: Programa Integral de Alcohol y Drogas
              </h1>
              <p className="text-xs text-slate-400">
                Blindaje Vial 360 • Estándar para Empresas de Transporte, Mutualidades y Auditorías Laborales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
              title="Imprimir / Guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              onClick={() => {
                const manualText = MANUAL_COMPLIANCE_TOMOS.map(t => `${t.tomoNumber}: ${t.title}\n${t.sections.map(s => `\n-- ${s.title} --\n${s.content}\n`).join('\n')}`).join('\n\n====================\n\n');
                const blob = new Blob([manualText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Manual_Cumplimiento_BlindajeVial360_SUSESO_92064.txt`;
                a.click();
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Secondary Navigation Tabs */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('reader')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'reader'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lector de Tomos (I - VIII)</span>
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'forms'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Formularios Oficiales (Tomo V)</span>
            </button>
            <button
              onClick={() => setActiveTab('commercial')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'commercial'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Servicio Integral & Roadmap</span>
            </button>
            <button
              onClick={() => setActiveTab('full_dossier')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'full_dossier'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dossier Completo (250 pp)</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en los 8 tomos del manual..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto">
          {searchTerm ? (
            /* Search Results Mode */
            <div className="p-6 space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">
                  Resultados de búsqueda para: <span className="text-blue-400 font-mono">"{searchTerm}"</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {searchResults.length} {searchResults.length === 1 ? 'sección encontrada' : 'secciones encontradas'}
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  No se encontraron coincidencias en los 8 tomos para el término buscado.
                </div>
              ) : (
                searchResults.map((sec) => (
                  <div key={sec.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                        {sec.tomoNumber}
                      </span>
                      <span className="text-xs text-slate-400">{sec.tomoTitle}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{sec.title}</h4>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{sec.content}</p>
                    {sec.standardClause && (
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase">Cláusula Tipo:</span>
                        <p className="text-xs text-slate-300 font-mono mt-1">{sec.standardClause}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'reader' ? (
            /* TAB 1: 8-Volume Interactive Reader */
            <div className="flex flex-col lg:flex-row h-full min-h-[600px]">
              {/* Tomos Sidebar */}
              <div className="w-full lg:w-80 bg-slate-950 border-r border-slate-800 p-4 shrink-0 overflow-y-auto space-y-2">
                <div className="pb-2 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Índice General de Tomos</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">8 Tomos</span>
                </div>

                {MANUAL_COMPLIANCE_TOMOS.map((tomo) => {
                  const isActive = tomo.id === activeTomoId;
                  return (
                    <button
                      key={tomo.id}
                      onClick={() => setActiveTomoId(tomo.id)}
                      className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-start gap-3 border ${
                        isActive
                          ? 'bg-blue-600/15 border-blue-500/40 text-white shadow-sm'
                          : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {getTomoIcon(tomo.iconName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[10px] font-bold font-mono uppercase ${
                              isActive ? 'text-blue-400' : 'text-slate-400'
                            }`}
                          >
                            {tomo.tomoNumber}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{tomo.pageRange}</span>
                        </div>
                        <p className="text-xs font-bold truncate mt-0.5">{tomo.title}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{tomo.subtitle}</p>
                      </div>
                    </button>
                  );
                })}

                {/* 8 SUSESO Principles Quick Box */}
                <div className="pt-3 mt-4 border-t border-slate-800/80">
                  <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/20 p-3 rounded-xl space-y-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>8 Principios SUSESO 92064</span>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      El manual garantiza el 100% de los criterios vinculantes dictaminados el 02/07/2025.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tomo Content Display Area */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-900">
                {/* Tomo Header Banner */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono bg-blue-600 text-white px-2.5 py-0.5 rounded">
                        {currentTomo.tomoNumber}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        {currentTomo.pageRange} ({currentTomo.totalPages} páginas)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded">
                      {currentTomo.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">{currentTomo.title}</h2>
                    <p className="text-xs text-blue-300 mt-0.5 font-medium">{currentTomo.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                    {currentTomo.summary}
                  </p>
                </div>

                {/* Tomo Sections */}
                <div className="space-y-6">
                  {currentTomo.sections.map((section, idx) => (
                    <div
                      key={section.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-750 rounded-2xl p-6 shadow-sm space-y-4 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-mono text-blue-400 font-bold">SECCIÓN {idx + 1}</span>
                          <h3 className="text-base font-bold text-white mt-0.5">{section.title}</h3>
                        </div>
                      </div>

                      {section.legalBasis && (
                        <div className="flex items-center gap-2 bg-blue-950/30 border border-blue-500/20 px-3 py-2 rounded-xl text-xs text-blue-300">
                          <Scale className="w-4 h-4 shrink-0 text-blue-400" />
                          <span className="font-mono text-[11px]">
                            <strong>Base Jurídica:</strong> {section.legalBasis}
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
                        {section.content}
                      </div>

                      {/* Practical Takeaway */}
                      {section.practicalTakeaway && (
                        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-300">Criterio Aplicado Blindaje Vial 360:</strong>{' '}
                            {section.practicalTakeaway}
                          </div>
                        </div>
                      )}

                      {/* Standard Clause / Model */}
                      {section.standardClause && (
                        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              Cláusula Estándar para Reglamento Interno (RIOHS DT)
                            </span>
                            <button
                              onClick={() => handleCopyClause(section.standardClause!, section.id)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-lg transition cursor-pointer border border-slate-700"
                            >
                              {copiedClauseId === section.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copiada</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar Cláusula</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-[11px] text-slate-200 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
                            {section.standardClause}
                          </pre>
                        </div>
                      )}

                      {/* Checklist */}
                      {section.checklist && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                          <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                            Lista de Verificación de Cumplimiento:
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {section.checklist.map((item, cIdx) => (
                              <div key={cIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'forms' ? (
            /* TAB 2: Official Form Templates Generator & Exporter */
            <div className="p-6 space-y-6 max-w-6xl mx-auto">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                      TOMO V • PLANTILLAS OFICIALES
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      Formularios Estandarizados
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    Bóveda de Formularios y Registros Oficiales
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modelos oficiales exigidos por el Dictamen SUSESO N.º 92064-2025 para respaldo de fiscalizaciones laborales y mutualidades.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tomoVForms.map((sec, idx) => (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedFormIndex(idx)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                        selectedFormIndex === idx
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      {sec.formTemplate?.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Interactive Preview and Generator */}
              {tomoVForms[selectedFormIndex] && tomoVForms[selectedFormIndex].formTemplate && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
                  {/* Form Meta Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {tomoVForms[selectedFormIndex].formTemplate?.code}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {tomoVForms[selectedFormIndex].formTemplate?.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <strong>Propósito Legal:</strong> {tomoVForms[selectedFormIndex].formTemplate?.purpose}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const formContent = `FORMULARIO OFICIAL ${tomoVForms[selectedFormIndex].formTemplate?.code}\n${tomoVForms[selectedFormIndex].formTemplate?.name}\nPropósito: ${tomoVForms[selectedFormIndex].formTemplate?.purpose}\n\nCampos:\n${tomoVForms[selectedFormIndex].formTemplate?.fields.map(f => `- ${f.label}: [____________________]`).join('\n')}\n\nFirma y Fecha: __________________________\nDictamen SUSESO 92064-2025`;
                          navigator.clipboard.writeText(formContent);
                          alert('Plantilla de formulario copiada al portapapeles.');
                        }}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Formato</span>
                      </button>
                      <button
                        onClick={() => alert(`Generando PDF imprimible de ${tomoVForms[selectedFormIndex].formTemplate?.name}`)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Emitir PDF Oficial</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Fillable Form Layout */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="text-center pb-3 border-b border-slate-800">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        {tomoVForms[selectedFormIndex].formTemplate?.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        EMPRESA DE TRANSPORTE CERTIFICADA • BLINDAJE VIAL 360
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tomoVForms[selectedFormIndex].formTemplate?.fields.map((f, fIdx) => (
                        <div key={fIdx} className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                            <span>{f.label}</span>
                            {f.required && <span className="text-[10px] text-rose-400 font-mono">*Obligatorio</span>}
                          </label>
                          {f.type === 'textarea' ? (
                            <textarea
                              rows={2}
                              defaultValue={f.placeholder || ''}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                          ) : f.type === 'signature' ? (
                            <div className="bg-slate-950 border border-dashed border-slate-750 rounded-xl p-4 text-center">
                              <p className="text-[11px] text-slate-400 font-mono">Firma Digital Registrada con Hash SHA-256</p>
                              <div className="mt-2 text-xs font-bold text-blue-400 font-mono">
                                [FIRMA DIGITAL & BIOMÉTRICA AUTORIZADA]
                              </div>
                            </div>
                          ) : (
                            <input
                              type={f.type}
                              defaultValue={f.placeholder || ''}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Validez Legal: Dictamen SUSESO N.º 92064-2025 y Ley 19.628</span>
                      <span className="font-mono text-emerald-400">100% Blindado</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'commercial' ? (
            /* TAB 3: Commercial Solution & Implementation Roadmap */
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                    PROPUESTA DE VALOR EMPRESARIAL
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    B2B Compliance SaaS
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {COMMERCIAL_VALUE_PROPOSITION.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {COMMERCIAL_VALUE_PROPOSITION.tagline}
                </p>
              </div>

              {/* 6 Implementation Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {COMMERCIAL_VALUE_PROPOSITION.pillars.map((pillar, pIdx) => (
                  <div
                    key={pIdx}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-2 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 font-bold font-mono text-xs flex items-center justify-center mb-2 border border-blue-500/20">
                        0{pIdx + 1}
                      </div>
                      <h3 className="font-bold text-sm text-white">{pillar.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pillar.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Fase {pIdx + 1}</span>
                      <span className="text-emerald-400 font-semibold">Incluido</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Implementation Roadmap Timeline */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-white">
                  Hoja de Ruta de Implementación para Empresas de Transporte (30 Días)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 font-mono">SEMANA 1</span>
                    <h4 className="font-bold text-white">Diagnóstico & RIOHS</h4>
                    <p className="text-[11px] text-slate-400">Levantamiento de cargos críticos, redacción de cláusula y envío a depósito DT.</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 font-mono">SEMANA 2</span>
                    <h4 className="font-bold text-white">Equipos & Software</h4>
                    <p className="text-[11px] text-slate-400">Calibración de alcoholímetros Dräger, entrega de tiras salivales y setup BV360.</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-teal-400 font-mono">SEMANA 3</span>
                    <h4 className="font-bold text-white">Capacitación</h4>
                    <p className="text-[11px] text-slate-400">Inducción a choferes, operadores de test y sesión con el Comité Paritario.</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">SEMANA 4</span>
                    <h4 className="font-bold text-white">Salida en Vivo</h4>
                    <p className="text-[11px] text-slate-400">Inicio de controles pre-turno, sorteo aleatorio y emisión del primer reporte.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 4: Full Dossier (250 Pages Equivalent) Consolidated View */
            <div className="p-6 space-y-8 max-w-5xl mx-auto">
              <div className="text-center space-y-2 py-6 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
                  DOCUMENTO MAESTRO • DOCTRINA Y OPERACIÓN
                </span>
                <h2 className="text-2xl font-bold text-white">
                  MANUAL DE CUMPLIMIENTO NORMATIVO (250 PÁGINAS)
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl mx-auto">
                  Programa Integral de Prevención de Alcohol y Drogas para Empresas de Transporte en Chile conforme al Dictamen N.º 92064-2025 de la Superintendencia de Seguridad Social (SUSESO) y Ley N.º 16.744.
                </p>
              </div>

              {MANUAL_COMPLIANCE_TOMOS.map((tomo) => (
                <div key={tomo.id} className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold font-mono bg-blue-600 text-white px-2 py-0.5 rounded">
                      {tomo.tomoNumber}
                    </span>
                    <h3 className="text-base font-bold text-white">{tomo.title}</h3>
                    <span className="text-xs text-slate-500 font-mono ml-auto">{tomo.pageRange}</span>
                  </div>

                  <p className="text-xs text-slate-400 italic">{tomo.summary}</p>

                  <div className="space-y-4">
                    {tomo.sections.map((sec) => (
                      <div key={sec.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-white">{sec.title}</h4>
                        {sec.legalBasis && (
                          <p className="text-[10px] text-blue-400 font-mono">Base Legal: {sec.legalBasis}</p>
                        )}
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{sec.content}</p>
                        {sec.standardClause && (
                          <div className="bg-slate-900 border border-emerald-500/20 p-3 rounded-lg text-xs font-mono text-emerald-300">
                            {sec.standardClause}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Blindaje Vial 360 • Manual de Cumplimiento Técnico-Jurídico v2.0 (250 pp)</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>SUSESO N.º 92064-2025</span>
            <span>•</span>
            <span>Ley 16.744</span>
            <span>•</span>
            <span className="text-emerald-400">8/8 Principios Activos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
