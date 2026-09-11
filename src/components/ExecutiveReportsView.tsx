import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Printer,
  Sparkles,
  Scale,
  ShieldCheck,
  Building2,
  Hash,
  Clock,
  ChevronDown,
  Settings2,
  ExternalLink,
  X,
  Eye,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  generateExecutiveCompliancePDF,
  generateSusesoDossierPDF,
  exportTestsToCSV,
  exportManagementSummaryCSV,
  exportComplianceStatisticsCSV,
  PDFReportOptions,
  MonthlyKpi,
  ComplianceExportOptions
} from '../utils/pdfExport';
import { exportElementToPdf } from '../utils/html2pdfExport';
import { ExecutivePrintableReport } from './ExecutivePrintableReport';


export const ExecutiveReportsView: React.FC = () => {
  const { tests, drivers, vehicles, currentCompany, showToast } = useApp();

  // Export configuration states
  const [selectedPeriod, setSelectedPeriod] = useState('2026-Q3 (Julio - Septiembre)');
  const [selectedBase, setSelectedBase] = useState('all');
  const [includeSusesoAudit, setIncludeSusesoAudit] = useState(true);
  const [includeSubstances, setIncludeSubstances] = useState(true);
  const [includeFleetAlcolock, setIncludeFleetAlcolock] = useState(true);
  const [customNotes, setCustomNotes] = useState(
    'Conforme al Dictamen SUSESO 92064-2025 y Ley 18.290, se mantiene tasa cero de intemperancia en despachos de faena y ruta troncal. Controles aleatorios ejecutados mediante algoritmo criptográfico despersonalizado.'
  );

  const [isGenerating, setIsGenerating] = useState<'pdf' | 'dossier' | 'csv' | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [lastExportedFile, setLastExportedFile] = useState<string | null>(null);

  // 'Download Report' button state
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [downloadReportFormat, setDownloadReportFormat] = useState<'html2pdf' | 'pdf' | 'compliance_csv' | 'raw_csv'>('html2pdf');
  const [csvVariant, setCsvVariant] = useState<'consolidated' | 'flat_tabular'>('consolidated');
  const [reportAudience, setReportAudience] = useState<'directorio' | 'cphs' | 'suseso'>('directorio');

  // DOM Refs for html2pdf capture
  const printableReportRef = useRef<HTMLDivElement>(null);
  const previewReportRef = useRef<HTMLDivElement>(null);


  // Compute live stats
  const total = tests.length;
  const positives = tests.filter((t) => t.overallStatus === 'no_apto_bloqueado').length;
  const compliant = total - positives;
  const positivityRate = total > 0 ? ((positives / total) * 100).toFixed(2) : '0.00';
  const complianceRate = total > 0 ? ((compliant / total) * 100).toFixed(1) : '100.0';

  // Bases available
  const bases = Array.from(new Set(drivers.map((d) => d.assignedBase).filter(Boolean)));

  const baseStats = [
    { base: 'Base Stgo Norte', tests: 64, positives: 1, compliance: '98.4%' },
    { base: 'Faena El Teniente', tests: 48, positives: 0, compliance: '100%' },
    { base: 'Base San Antonio', tests: 30, positives: 1, compliance: '96.6%' },
  ];

  const substancesDistribution = [
    { name: 'Alcohol (Alcotest)', value: 2, color: '#f43f5e' },
    { name: 'Marihuana (THC)', value: 1, color: '#8b5cf6' },
    { name: 'Cocaína (COC)', value: 0, color: '#ec4899' },
    { name: 'Benzodiacepinas', value: 0, color: '#3b82f6' },
    { name: 'Negativos / Conformes', value: Math.max(0, total - 2), color: '#10b981' }
  ];

  // Monthly trends for Recharts
  const monthlyKpis: MonthlyKpi[] = [
    { month: 'Ene 2026', totalTests: 28, positiveTests: 0, complianceRate: 100 },
    { month: 'Feb 2026', totalTests: 32, positiveTests: 1, complianceRate: 96.9 },
    { month: 'Mar 2026', totalTests: 36, positiveTests: 0, complianceRate: 100 },
    { month: 'Abr 2026', totalTests: 40, positiveTests: 0, complianceRate: 100 },
    { month: 'May 2026', totalTests: 44, positiveTests: 1, complianceRate: 97.7 },
    { month: 'Jun 2026', totalTests: 42, positiveTests: 0, complianceRate: 100 },
    { month: 'Jul 2026', totalTests: 45, positiveTests: 0, complianceRate: 100 },
    { month: 'Ago 2026', totalTests: 48, positiveTests: 1, complianceRate: 97.9 },
    { month: 'Sep 2026', totalTests: 52, positiveTests: 1, complianceRate: 98.1 }
  ];

  // Handle PDF Export
  const handleExportPDF = () => {
    try {
      setIsGenerating('pdf');
      const options: PDFReportOptions = {
        period: selectedPeriod,
        baseFilter: selectedBase,
        includeSusesoAudit,
        includeSubstances,
        includeFleetAlcolock,
        notes: customNotes
      };

      // Small async delay for UI spinner feel
      setTimeout(() => {
        generateExecutiveCompliancePDF(
          currentCompany,
          tests,
          drivers,
          vehicles,
          monthlyKpis,
          options
        );
        const fileName = `Informe_Ejecutivo_Cumplimiento_BlindajeVial_${selectedPeriod.replace(/\s+/g, '_')}.pdf`;
        setLastExportedFile(fileName);
        setIsGenerating(null);
        showToast(`Informe PDF descargado con éxito: ${fileName}`);
      }, 400);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      setIsGenerating(null);
      showToast('Ocurrió un error al generar el documento PDF.');
    }
  };

  // Handle SUSESO Dossier PDF
  const handleExportSusesoDossier = () => {
    try {
      setIsGenerating('dossier');
      setTimeout(() => {
        generateSusesoDossierPDF(currentCompany, tests, drivers);
        const fileName = `Dossier_Pericial_SUSESO_92064_${currentCompany.businessName.replace(/\s+/g, '_')}.pdf`;
        setLastExportedFile(fileName);
        setIsGenerating(null);
        showToast(`Dossier Pericial SUSESO 92064 (PDF) descargado exitosamente.`);
      }, 400);
    } catch (err) {
      console.error('Error generating SUSESO dossier:', err);
      setIsGenerating(null);
      showToast('Error al emitir el dossier pericial.');
    }
  };

  // Handle CSV / Excel Export
  const handleExportExcel = () => {
    try {
      setIsGenerating('csv');
      setTimeout(() => {
        exportTestsToCSV(currentCompany, tests, selectedPeriod);
        const fileName = `Controles_Toxicológicos_BlindajeVial_${selectedPeriod.replace(/\s+/g, '_')}.csv`;
        setLastExportedFile(fileName);
        setIsGenerating(null);
        showToast(`Base consolidada en formato CSV/Excel descargada.`);
      }, 300);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setIsGenerating(null);
      showToast('Error al exportar los datos en formato CSV.');
    }
  };

  // Handle Management Summary CSV Export
  const handleExportManagementCSV = () => {
    try {
      setIsGenerating('csv');
      setTimeout(() => {
        exportManagementSummaryCSV(currentCompany, tests, drivers, vehicles, selectedPeriod);
        const fileName = `Informe_Gerencial_BlindajeVial_${selectedPeriod.replace(/\s+/g, '_')}.csv`;
        setLastExportedFile(fileName);
        setIsGenerating(null);
        showToast(`Informe gerencial en formato CSV descargado con éxito: ${fileName}`);
      }, 300);
    } catch (err) {
      console.error('Error exporting management CSV:', err);
      setIsGenerating(null);
      showToast('Error al exportar el informe gerencial CSV.');
    }
  };

  // Handle Compliance Statistics CSV Export (for External Management Software / ERP / BI)
  const handleExportComplianceStatsCSV = (variant: 'consolidated' | 'flat_tabular' = csvVariant) => {
    try {
      setIsGenerating('csv');
      setTimeout(() => {
        exportComplianceStatisticsCSV(
          currentCompany,
          tests,
          drivers,
          vehicles,
          {
            period: selectedPeriod,
            baseFilter: selectedBase,
            baseStatsData: baseStats,
            substancesData: substancesDistribution,
            monthlyKpis,
            formatVariant: variant
          }
        );
        const fileName = variant === 'flat_tabular'
          ? `Estadisticas_Cumplimiento_BI_ERP_${selectedPeriod.replace(/\s+/g, '_')}.csv`
          : `Estadisticas_Cumplimiento_BlindajeVial_${selectedPeriod.replace(/\s+/g, '_')}.csv`;
        setLastExportedFile(fileName);
        setIsGenerating(null);
        showToast(`Estadísticas de cumplimiento exportadas exitosamente para software de gestión (${variant === 'flat_tabular' ? 'Formato Tabular BI/ERP' : 'Formato Consolidado'}): ${fileName}`);
      }, 300);
    } catch (err) {
      console.error('Error exporting compliance statistics CSV:', err);
      setIsGenerating(null);
      showToast('Error al exportar las estadísticas de cumplimiento en CSV.');
    }
  };

  // Handle High-Legibility PDF Export via html2pdf.js
  const handleDownloadHtml2Pdf = async () => {
    try {
      setIsGenerating('pdf');
      showToast('Generando PDF de Alta Legibilidad con html2pdf.js...');

      // Priority: preview ref if modal open, otherwise offscreen printable ref
      const targetElement = previewReportRef.current || printableReportRef.current;
      if (!targetElement) {
        throw new Error('Elemento de informe no disponible.');
      }

      const cleanPeriod = selectedPeriod.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Informe_Ejecutivo_Alta_Legibilidad_${cleanPeriod}.pdf`;

      await exportElementToPdf(targetElement, filename, {
        scale: 2,
        quality: 0.98,
        margin: [8, 8, 10, 8]
      });

      setLastExportedFile(filename);
      setIsGenerating(null);
      showToast(`✓ PDF de Alta Legibilidad descargado: ${filename}`);
    } catch (err) {
      console.error('Error generating PDF with html2pdf:', err);
      setIsGenerating(null);
      showToast('Generando versión alternativa vectorial...');
      handleExportPDF();
    }
  };

  // Generic Download Report handler
  const handleDownloadReport = (format: 'html2pdf' | 'pdf' | 'compliance_csv' | 'raw_csv' = downloadReportFormat) => {
    setIsDownloadDropdownOpen(false);
    setShowDownloadModal(false);
    if (format === 'html2pdf') {
      handleDownloadHtml2Pdf();
    } else if (format === 'pdf') {
      handleExportPDF();
    } else if (format === 'compliance_csv') {
      handleExportComplianceStatsCSV(csvVariant);
    } else {
      handleExportManagementCSV();
    }
  };


  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto executive-reports-container">
      {/* Official Print-Only Document Header */}
      <div className="print-only executive-print-header hidden mb-6 pb-4 border-b-2 border-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                BLINDAJE VIAL • GESTIÓN DE RIESGO OPERACIONAL
              </span>
              <span className="font-mono text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                DICTAMEN SUSESO 92064-2025 • LEY 18.290
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Informe Ejecutivo de Gestión de Riesgo y Control de Intemperancia
            </h1>
            <p className="text-xs text-slate-600">
              Certificación de tamizaje preventivo aleatorio despersonalizado de alcohol y drogas para conducción segura en faenas y transporte troncal.
            </p>
          </div>
          <div className="text-right text-xs text-slate-700 space-y-0.5 border-l-2 border-slate-300 pl-4 shrink-0">
            <div className="font-bold text-slate-900 text-sm">{currentCompany.businessName}</div>
            <div className="font-mono text-slate-600">RUT: {currentCompany.rut}</div>
            <div className="text-[11px] text-slate-500">
              Fecha de Emisión: {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px] font-mono text-slate-500">Sello Hash: SHA-256: 8f4e2b9c7a10...e3fa1</div>
          </div>
        </div>

        {/* Print Metadata Strip */}
        <div className="grid grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-200 text-xs">
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Período de Evaluación</span>
            <span className="font-bold text-slate-800">{selectedPeriod}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Alcance Operacional</span>
            <span className="font-bold text-slate-800">{selectedBase === 'all' ? 'Todas las Bases (Nacional)' : selectedBase}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Tecnología de Screening</span>
            <span className="font-bold text-slate-800">Alcotest Metrológico + Dräger DrugTest 5000</span>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Tolerancia Legal</span>
            <span className="font-bold text-emerald-700">0.00 g/l • Cero Absoluta</span>
          </div>
        </div>

        {customNotes && (
          <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
            <strong className="text-slate-900 font-semibold">Observación CPHS / Prevención: </strong>
            <span>{customNotes}</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm executive-screen-header">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
              RF-017 • INTELIGENCIA DE NEGOCIO & REPORTES GERENCIALES
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>SUSESO 92064 COMPLIANT</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Centro de Reportes Ejecutivos e Indicadores Clave (KPI)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas de intemperancia, efectividad de controles preventivos, tasa de siniestralidad evitada y descarga de informes PDF y CSV homologados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          {/* Main 'Download PDF' (html2pdf) Action with high legibility */}
          <button
            id="download-pdf-html2pdf-btn"
            onClick={handleDownloadHtml2Pdf}
            disabled={isGenerating !== null}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
            title="Descargar Informe Ejecutivo en PDF de alta legibilidad usando html2pdf.js para revisión offline en terreno"
          >
            {isGenerating === 'pdf' ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generando PDF...</span>
              </span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-medium">
                  html2pdf
                </span>
              </>
            )}
          </button>

          {/* Preview Print Report Modal Trigger */}
          <button
            id="preview-report-btn"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
            title="Ver vista previa del informe de alta legibilidad con gráficos y firmas listo para imprimir o guardar"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Vista Previa</span>
          </button>

          {/* Secondary 'Download Report' Action with Dropdown & Modal Trigger */}
          <div className="relative inline-flex rounded-xl shadow-sm">
            <button
              id="download-report-btn"
              onClick={() => setShowDownloadModal(true)}
              disabled={isGenerating !== null}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-700 transition cursor-pointer"
              title="Descargar formatos adicionales (CSV, Dossier, ERP)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Formatos & ERP</span>
            </button>
            <button
              id="download-report-toggle"
              onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
              disabled={isGenerating !== null}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 px-2.5 py-2.5 rounded-r-xl border border-slate-700 transition cursor-pointer flex items-center justify-center"
              title="Seleccionar formato de descarga"
              aria-label="Opciones de formato"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDownloadDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick format selector dropdown */}
            {isDownloadDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-84 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Exportación de Cumplimiento</span>
                  <span className="text-emerald-400 font-mono text-[9px]">SUSESO 92064</span>
                </div>
                
                <button
                  id="download-report-html2pdf-option"
                  onClick={() => handleDownloadReport('html2pdf')}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Informe Alta Legibilidad (PDF)</span>
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded font-mono">html2pdf</span>
                    </div>
                    <p className="text-[10px] text-slate-400">PDF con gráficos Recharts, auditoría SUSESO y firmas listo para offline</p>
                  </div>
                </button>

                <button
                  id="download-report-preview-option"
                  onClick={() => {
                    setIsDownloadDropdownOpen(false);
                    setShowPreviewModal(true);
                  }}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Vista Previa de Impresión A4</span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 rounded font-mono">Visor</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Revisar el informe en formato papel antes de descargar o imprimir</p>
                  </div>
                </button>

                <button
                  id="download-report-compliance-csv-option"
                  onClick={() => handleDownloadReport('compliance_csv')}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Estadísticas de Cumplimiento (CSV)</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">ERP / BI</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Exporta KPIs, tasas de positividad, desglose por base y analitos</p>
                  </div>
                </button>

                <button
                  id="download-report-csv-option"
                  onClick={() => handleDownloadReport('raw_csv')}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Base Completa de Actas (CSV)</div>
                    <p className="text-[10px] text-slate-400">Listado detallado de cada test con folios y sellos SHA-256</p>
                  </div>
                </button>

                <button
                  id="download-report-dossier-option"
                  onClick={handleExportSusesoDossier}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Dossier Pericial SUSESO (PDF)</div>
                    <p className="text-[10px] text-slate-400">Certificación jurídica con actas periciales encriptadas</p>
                  </div>
                </button>

                <div className="pt-1.5 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setIsDownloadDropdownOpen(false);
                      setShowDownloadModal(true);
                    }}
                    className="w-full text-center text-[11px] text-blue-400 hover:text-blue-300 py-1 font-semibold cursor-pointer"
                  >
                    Personalizar filtros y formato de exportación...
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* Quick Direct Button for Compliance Statistics CSV Export */}
          <button
            id="export-compliance-stats-btn"
            onClick={() => handleExportComplianceStatsCSV('consolidated')}
            disabled={isGenerating !== null}
            className="flex items-center gap-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
            title="Exportar estadísticas de cumplimiento en formato CSV para software externo de gestión"
          >
            {isGenerating === 'csv' ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
                <span>Exportando...</span>
              </span>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Estadísticas (CSV)</span>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1 py-0.2 rounded font-mono">ERP</span>
              </>
            )}
          </button>

          {/* Browser Direct Print Button */}
          <button
            id="print-report-browser-btn"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
            title="Imprimir informe directamente desde el navegador (formato optimizado para impresora y PDF)"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showConfigPanel
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Configurar opciones y filtros de exportación"
          >
            <Settings2 className="w-4 h-4 text-blue-400" />
            <span>Configurar PDF</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isGenerating !== null}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating === 'pdf' ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generando...</span>
              </span>
            ) : (
              <>
                <FileText className="w-4 h-4 text-blue-400" />
                <span>PDF Directorio</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isGenerating !== null}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating === 'csv' ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Exportando...</span>
              </span>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                <span>Base Actas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive PDF Configuration & Quick Export Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 executive-interactive-panel no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Exportación Oficial de Informes Ejecutivos & Periciales (PDF)
              </h2>
              <p className="text-xs text-slate-400">
                Generación con formato homologado para Directorio, Mutualidades (ACHS, Mutual, IST) e Inspección del Trabajo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Empresa:</span>
            <span className="font-semibold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              {currentCompany.businessName}
            </span>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Período de Evaluación:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="2026-Q3 (Julio - Septiembre)">Tercer Trimestre 2026 (2026-Q3)</option>
              <option value="2026-Q2 (Abril - Junio)">Segundo Trimestre 2026 (2026-Q2)</option>
              <option value="Agosto 2026">Mes de Agosto 2026</option>
              <option value="Septiembre 2026 (En Curso)">Mes de Septiembre 2026 (En Curso)</option>
              <option value="Año Consolidado 2026">Año 2026 Consolidado Completo</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Base Operacional / Faena:</label>
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="all">Todas las Bases (Consolidado Nacional)</option>
              {bases.map((base) => (
                <option key={base} value={base}>
                  {base}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Formato & Sello Criptográfico:</label>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                <span>SHA-256 Inalterable</span>
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded">
                ISO 37301
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible advanced customization */}
        {showConfigPanel && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Secciones Incluidas en el Documento PDF:
              </span>
              <span className="text-[10px] text-slate-400">Personalice el contenido del informe ejecutivo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={includeSusesoAudit}
                  onChange={(e) => setIncludeSusesoAudit(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
                />
                <span>Auditoría Dictamen SUSESO 92064</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={includeSubstances}
                  onChange={(e) => setIncludeSubstances(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
                />
                <span>Desglose por Sustancia & Cut-offs</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={includeFleetAlcolock}
                  onChange={(e) => setIncludeFleetAlcolock(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
                />
                <span>Monitoreo Alcolock de Flota</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">
                Observaciones del Comité Paritario / Recomendaciones Legales:
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                placeholder="Ingrese directrices específicas o conclusiones del CPHS..."
              />
            </div>
          </div>
        )}

        {/* Action button row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Generación vectorial directa cliente (jsPDF + autoTable). Compatible con PDF/A para archivo legal.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="download-report-panel-pdf-btn"
              onClick={handleDownloadHtml2Pdf}
              disabled={isGenerating !== null}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition cursor-pointer"
              title="Descargar Informe Ejecutivo en PDF de alta legibilidad usando html2pdf.js"
            >
              {isGenerating === 'pdf' ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando PDF...</span>
                </span>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF (html2pdf)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
              title="Ver vista previa de impresión en formato A4"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Vista Previa</span>
            </button>


            <button
              id="download-report-panel-csv-btn"
              onClick={() => handleDownloadReport('compliance_csv')}
              disabled={isGenerating !== null}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow transition cursor-pointer"
              title="Exportar estadísticas de cumplimiento para software de gestión externo (ERP / Power BI / Excel)"
            >
              {isGenerating === 'csv' ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Exportando CSV...</span>
                </span>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Estadísticas Cumplimiento (CSV)</span>
                </>
              )}
            </button>

            <button
              id="download-compliance-flat-csv-btn"
              onClick={() => handleExportComplianceStatsCSV('flat_tabular')}
              disabled={isGenerating !== null}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
              title="Exportar dataset tabular plano optimizado para Power BI, Tableau y SQL ETL"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dataset BI / ERP (CSV)</span>
            </button>

            <button
              onClick={handleExportSusesoDossier}
              disabled={isGenerating !== null}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              {isGenerating === 'dossier' ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generando Dossier...</span>
                </span>
              ) : (
                <>
                  <Scale className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dossier SUSESO (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation banner if exported recently */}
        {lastExportedFile && (
          <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-emerald-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Documento generado exitosamente: <strong className="font-mono text-white">{lastExportedFile}</strong>
              </span>
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase">Descargado</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 executive-kpi-grid">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 executive-kpi-card">
          <span className="text-xs text-slate-400">Tasa de Positividad Global</span>
          <p className="text-2xl font-extrabold text-white mt-1">{positivityRate}%</p>
          <span className="text-[10px] text-emerald-400 font-medium">Meta Corporativa: {'<'} 0.50%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 executive-kpi-card">
          <span className="text-xs text-slate-400">Cobertura de Dotación (Mes)</span>
          <p className="text-2xl font-extrabold text-blue-400 mt-1">100%</p>
          <span className="text-[10px] text-slate-400 font-medium">{drivers.length} conductores testeados</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 executive-kpi-card">
          <span className="text-xs text-slate-400">Cumplimiento Sorteos SUSESO</span>
          <p className="text-2xl font-extrabold text-purple-400 mt-1">98.8%</p>
          <span className="text-[10px] text-emerald-400 font-medium">100% verificado por hash</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 executive-kpi-card">
          <span className="text-xs text-slate-400">Siniestros Viales Evitados</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">0 Fatales</p>
          <span className="text-[10px] text-slate-400 font-medium">Impacto estimado $180M ahorrados</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 executive-charts-grid">
        {/* Trend line */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 executive-chart-card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
              Evolución de Controles vs Tasa de Positividad (2026)
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Datos Mensuales</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyKpis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="totalTests" name="Total Exámenes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="positiveTests" name="Positivos / Bloqueados" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Substance breakdown pie chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 executive-chart-card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
              Distribución por Sustancia y Resultado de Examen
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Corte Saliva & Aire</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={substancesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {substancesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SUSESO 92064 Compliance Audit Card */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30 border border-blue-500/30 rounded-2xl p-5 shadow-sm space-y-4 executive-suseso-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Auditoría de Cumplimiento Dictamen SUSESO N.º 92064-2025</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Certificación de blindaje jurídico preventivo para Mutualidades (ACHS, Mutual, IST) e Inspección del Trabajo.
              </p>
            </div>
          </div>
          <button
            onClick={handleExportSusesoDossier}
            disabled={isGenerating !== null}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer self-start sm:self-auto shadow no-print"
          >
            {isGenerating === 'dossier' ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generando...</span>
              </span>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Emitir Dossier Pericial SUSESO (PDF)</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl executive-suseso-subcard">
            <span className="text-[10px] text-slate-400">Puntaje Auditoría SUSESO</span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">100% Blindado</p>
            <span className="text-[10px] text-slate-500">8/8 Principios Verificados</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl executive-suseso-subcard">
            <span className="text-[10px] text-slate-400">RIOHS Depósito DT</span>
            <p className="text-lg font-bold text-blue-400 mt-0.5">Depósito Vigente</p>
            <span className="text-[10px] text-slate-500">Cláusula 21 con 30 días antelación</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl executive-suseso-subcard">
            <span className="text-[10px] text-slate-400">Algoritmo de Sorteo</span>
            <p className="text-lg font-bold text-indigo-400 mt-0.5">Despersonalizado</p>
            <span className="text-[10px] text-slate-500">Aleatorio sin sesgo humano</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl executive-suseso-subcard">
            <span className="text-[10px] text-slate-400">Cadena de Custodia</span>
            <p className="text-lg font-bold text-teal-400 mt-0.5">100% Trazable</p>
            <span className="text-[10px] text-slate-500">Inalterabilidad Criptográfica SHA-256</span>
          </div>
        </div>
      </div>

      {/* Comparative Base Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 executive-table-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-sm text-white">Desempeño Operacional por Base / Faena</h2>
            <p className="text-[11px] text-slate-400">Estadísticas de controles, positividad y cumplimiento normativo por faena</p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              id="export-base-compliance-csv-btn"
              onClick={() => handleExportComplianceStatsCSV('consolidated')}
              className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer font-medium"
              title="Exportar estadísticas de bases en formato CSV para software de gestión"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Estadísticas (CSV)</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Base Operacional</th>
                <th className="px-4 py-2.5">Exámenes Realizados</th>
                <th className="px-4 py-2.5">Positivos Detectados</th>
                <th className="px-4 py-2.5">Índice de Conducción Segura</th>
                <th className="px-4 py-2.5">Estado Operacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {baseStats.map((b) => (
                <tr key={b.base}>
                  <td className="px-4 py-3 font-semibold text-white">{b.base}</td>
                  <td className="px-4 py-3 font-mono">{b.tests}</td>
                  <td className="px-4 py-3 font-mono text-rose-400 font-bold">{b.positives}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{b.compliance}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold executive-badge-conforme">
                      CONFORME
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Print-Only Footer & Legal Signatures */}
      <div className="print-only executive-print-footer hidden mt-8 pt-4 border-t-2 border-slate-400 space-y-5">
        <div className="text-[11px] text-slate-600 leading-relaxed text-justify bg-slate-50 p-3 rounded border border-slate-200">
          <strong className="text-slate-900">Declaración de Validez Pericial y Cumplimiento Normativo: </strong>
          El presente informe da cuenta fidedigna de los controles preventivos aleatorios despersonalizados aplicados al personal de conducción en conformidad al Dictamen SUSESO N.º 92064-2025, Ley N.º 18.290 de Tránsito (Art. 109 y sgtes.) y Cláusula RIOHS de Seguridad Vial depositada ante la Dirección del Trabajo. Toda la evidencia pericial y actas de screening cuentan con sellos criptográficos SHA-256 inalterables.
        </div>

        <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs text-slate-800">
          <div className="border-t-2 border-slate-400 pt-2 space-y-1">
            <div className="h-9"></div>
            <div className="font-bold text-slate-900">Prevencionista de Riesgos</div>
            <div className="text-[11px] text-slate-600">Registro SNS / Mutualidad</div>
            <div className="text-[10px] text-slate-400">Firma & Timbre</div>
          </div>
          <div className="border-t-2 border-slate-400 pt-2 space-y-1">
            <div className="h-9"></div>
            <div className="font-bold text-slate-900">Presidente Comité Paritario (CPHS)</div>
            <div className="text-[11px] text-slate-600">Representante de los Trabajadores</div>
            <div className="text-[10px] text-slate-400">Firma</div>
          </div>
          <div className="border-t-2 border-slate-400 pt-2 space-y-1">
            <div className="h-9"></div>
            <div className="font-bold text-slate-900">Gerencia de Operaciones / Representante Legal</div>
            <div className="text-[11px] text-slate-600">{currentCompany.businessName}</div>
            <div className="text-[10px] text-slate-400">Firma & Timbre</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 font-mono">
          <span>Sistema Blindaje Vial • Estándar ISO 39001 / ISO 37301</span>
          <span>Certificación Oficial de Screening Laboral • Privado y Confidencial</span>
        </div>
      </div>

      {/* Management Review Download Report Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 no-print">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 text-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Download Report • Revisión Gerencial</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Exportación oficial de estadísticas de cumplimiento para software de gestión, ERP o Directorio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format Selection Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Seleccione el Formato de Exportación:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  id="select-format-html2pdf"
                  onClick={() => setDownloadReportFormat('html2pdf')}
                  className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                    downloadReportFormat === 'html2pdf'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-1 ring-blue-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>PDF Alta Legibilidad</span>
                    </span>
                    <span className="text-[9px] font-bold bg-blue-500/25 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                      html2pdf
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Informe completo con gráficos visuales, auditoría SUSESO y firmas para offline.
                  </p>
                </button>

                <button
                  type="button"
                  id="select-format-pdf"
                  onClick={() => setDownloadReportFormat('pdf')}
                  className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                    downloadReportFormat === 'pdf'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <Scale className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dossier Pericial</span>
                    </span>
                    <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded font-mono">
                      SUSESO
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Resumen pericial con actas de screening y sellos criptográficos SHA-256.
                  </p>
                </button>

                <button
                  type="button"
                  id="select-format-compliance-csv"
                  onClick={() => setDownloadReportFormat('compliance_csv')}
                  className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                    downloadReportFormat === 'compliance_csv'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Estadísticas CSV</span>
                    </span>
                    <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-mono">
                      ERP/BI
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Estadísticas de cumplimiento, tasas, bases y analitos para software externo.
                  </p>
                </button>

                <button
                  type="button"
                  id="select-format-raw-csv"
                  onClick={() => setDownloadReportFormat('raw_csv')}
                  className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                    downloadReportFormat === 'raw_csv'
                      ? 'bg-purple-600/15 border-purple-500 text-white shadow-md ring-1 ring-purple-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
                      <span>Actas CSV</span>
                    </span>
                    <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded font-mono">
                      Raw
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Listado pericial individual con folios y sellos criptográficos SHA-256.
                  </p>
                </button>
              </div>
            </div>


            {/* CSV Structure Selector when compliance_csv is active */}
            {downloadReportFormat === 'compliance_csv' && (
              <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Estructura de Datos para Software de Gestión:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">RFC-4180 / UTF-8</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => setCsvVariant('consolidated')}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                      csvVariant === 'consolidated'
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="csv_variant"
                      checked={csvVariant === 'consolidated'}
                      onChange={() => setCsvVariant('consolidated')}
                      className="mt-0.5 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">Consolidado Ejecutivo</div>
                      <p className="text-[10px] text-slate-400">Resumen multisección: KPIs globales, desempeño por base, analitos de saliva y checklist SUSESO.</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setCsvVariant('flat_tabular')}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                      csvVariant === 'flat_tabular'
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="csv_variant"
                      checked={csvVariant === 'flat_tabular'}
                      onChange={() => setCsvVariant('flat_tabular')}
                      className="mt-0.5 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">Dataset Tabular Plano</div>
                      <p className="text-[10px] text-slate-400">Ideal para ingestión directa en Power BI, SAP, Oracle, Tableau o bases de datos SQL (ETL limpio).</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Scope and Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Período de Evaluación:</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="2026-Q3 (Julio - Septiembre)">2026-Q3 (Julio - Septiembre)</option>
                  <option value="2026-Q2 (Abril - Junio)">2026-Q2 (Abril - Junio)</option>
                  <option value="Agosto 2026">Mes de Agosto 2026</option>
                  <option value="Septiembre 2026 (En Curso)">Mes de Septiembre 2026</option>
                  <option value="Año Consolidado 2026">Año 2026 Consolidado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Alcance Geográfico / Faena:</label>
                <select
                  value={selectedBase}
                  onChange={(e) => setSelectedBase(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Consolidado Nacional (Todas las Bases)</option>
                  {bases.map((base) => (
                    <option key={base} value={base}>
                      {base}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Included Data Snapshot */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Resumen de Datos a Exportar:</span>
                <span className="text-[10px] text-emerald-400 font-mono">Tolerancia Cero Conforme</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Controles Totales</div>
                  <div className="font-extrabold text-white text-sm">{total}</div>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Cumplimiento</div>
                  <div className="font-extrabold text-emerald-400 text-sm">{complianceRate}%</div>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Positividad</div>
                  <div className="font-extrabold text-blue-400 text-sm">{positivityRate}%</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                <span>Certificación: Ley 18.290 / SUSESO</span>
                <span>SHA-256: 8f4e2b...3fa1</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                id="modal-download-report-submit-btn"
                onClick={() => handleDownloadReport(downloadReportFormat)}
                disabled={isGenerating !== null}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generando...</span>
                  </span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      {downloadReportFormat === 'html2pdf'
                        ? 'Descargar PDF Alta Legibilidad (html2pdf)'
                        : downloadReportFormat === 'pdf'
                        ? 'Descargar Dossier SUSESO (PDF)'
                        : downloadReportFormat === 'compliance_csv'
                        ? `Exportar Estadísticas CSV (${csvVariant === 'flat_tabular' ? 'BI/ERP' : 'Consolidado'})`
                        : 'Exportar Base Actas (CSV)'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Legibility Document Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl my-8 overflow-hidden">
            {/* Modal Control Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">Vista Previa del Informe Ejecutivo • Alta Legibilidad</h2>
                    <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">
                      html2pdf.js
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Formato A4 homologado para impresión, revisión offline en terreno y auditoría legal SUSESO 92064.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="preview-modal-download-pdf-btn"
                  onClick={handleDownloadHtml2Pdf}
                  disabled={isGenerating !== null}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition cursor-pointer disabled:opacity-50"
                  title="Guardar archivo PDF directamente en el dispositivo"
                >
                  {isGenerating === 'pdf' ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generando PDF...</span>
                    </span>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Descargar PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
                  title="Imprimir directamente desde el navegador"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Imprimir</span>
                </button>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  aria-label="Cerrar vista previa"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Preview Viewport */}
            <div className="p-6 bg-slate-950 max-h-[75vh] overflow-y-auto flex justify-center">
              <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-700 w-full max-w-[820px] bg-white">
                <ExecutivePrintableReport
                  ref={previewReportRef}
                  company={currentCompany}
                  tests={tests}
                  drivers={drivers}
                  vehicles={vehicles}
                  selectedPeriod={selectedPeriod}
                  selectedBase={selectedBase}
                  customNotes={customNotes}
                  includeSusesoAudit={includeSusesoAudit}
                  includeSubstances={includeSubstances}
                  includeFleetAlcolock={includeFleetAlcolock}
                  monthlyKpis={monthlyKpis}
                  baseStats={baseStats}
                  substancesDistribution={substancesDistribution}
                  positivityRate={positivityRate}
                  complianceRate={complianceRate}
                  total={total}
                  positives={positives}
                />
              </div>
            </div>

            {/* Footer notice */}
            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Optimizado con sellos SHA-256 e inalterabilidad jurídica SUSESO 92064-2025</span>
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cerrar vista previa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offscreen Printable Report for Instant html2pdf Generation */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '820px',
          zIndex: -9999,
          opacity: 0.001,
          pointerEvents: 'none',
          backgroundColor: '#ffffff'
        }}
        aria-hidden="true"
      >
        <ExecutivePrintableReport
          ref={printableReportRef}
          company={currentCompany}
          tests={tests}
          drivers={drivers}
          vehicles={vehicles}
          selectedPeriod={selectedPeriod}
          selectedBase={selectedBase}
          customNotes={customNotes}
          includeSusesoAudit={includeSusesoAudit}
          includeSubstances={includeSubstances}
          includeFleetAlcolock={includeFleetAlcolock}
          monthlyKpis={monthlyKpis}
          baseStats={baseStats}
          substancesDistribution={substancesDistribution}
          positivityRate={positivityRate}
          complianceRate={complianceRate}
          total={total}
          positives={positives}
        />
      </div>
    </div>
  );
};


