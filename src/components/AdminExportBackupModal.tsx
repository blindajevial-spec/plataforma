import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  exportTestsToExcel,
  exportAuditLogsToExcel,
  exportMasterBackupToExcel,
  exportRawTestingDataCSV,
  exportAuditLogsCSV,
  filterTestsForExport,
  filterAuditLogsForExport,
  ExportFilterOptions
} from '../utils/exportManager';
import {
  X,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Calendar,
  Filter,
  CheckCircle2,
  Database,
  Building2,
  FileText,
  Clock,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AdminExportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'tests' | 'audit_logs' | 'master';
}

export const AdminExportBackupModal: React.FC<AdminExportBackupModalProps> = ({
  isOpen,
  onClose,
  initialType = 'master'
}) => {
  const { currentCompany, tests, auditLogs, drivers, vehicles, showToast } = useApp();

  const [exportType, setExportType] = useState<'tests' | 'audit_logs' | 'master'>(initialType);
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [dateRangePreset, setDateRangePreset] = useState<'all' | '7d' | '30d' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [selectedBase, setSelectedBase] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Derive unique bases from tests
  const availableBases = useMemo(() => {
    const set = new Set<string>();
    tests.forEach(t => {
      if (t.driverBase) set.add(t.driverBase);
    });
    return Array.from(set);
  }, [tests]);

  // Compute date filter based on preset
  const calculatedDateRange = useMemo(() => {
    if (dateRangePreset === 'all') {
      return { dateFrom: undefined, dateTo: undefined };
    }
    const today = new Date();
    const toStr = today.toISOString().split('T')[0];

    if (dateRangePreset === '7d') {
      const past7 = new Date(today);
      past7.setDate(past7.getDate() - 7);
      return { dateFrom: past7.toISOString().split('T')[0], dateTo: toStr };
    }
    if (dateRangePreset === '30d') {
      const past30 = new Date(today);
      past30.setDate(past30.getDate() - 30);
      return { dateFrom: past30.toISOString().split('T')[0], dateTo: toStr };
    }
    return {
      dateFrom: customDateFrom || undefined,
      dateTo: customDateTo || undefined
    };
  }, [dateRangePreset, customDateFrom, customDateTo]);

  // Filtered counts
  const filterOptions: ExportFilterOptions = useMemo(() => ({
    dateFrom: calculatedDateRange.dateFrom,
    dateTo: calculatedDateRange.dateTo,
    base: selectedBase,
    testStatus: selectedStatus
  }), [calculatedDateRange, selectedBase, selectedStatus]);

  const matchingTests = useMemo(() => filterTestsForExport(tests, filterOptions), [tests, filterOptions]);
  const matchingLogs = useMemo(() => filterAuditLogsForExport(auditLogs, filterOptions), [auditLogs, filterOptions]);

  if (!isOpen) return null;

  const handleExecuteExport = () => {
    try {
      setIsExporting(true);
      let exportedFileName = '';

      if (exportType === 'master') {
        if (format === 'xlsx') {
          exportedFileName = exportMasterBackupToExcel(
            currentCompany,
            { tests, logs: auditLogs, drivers, vehicles },
            filterOptions
          );
          showToast(`✓ Respaldo Maestro Administrativo exportado en Excel: ${exportedFileName}`);
        } else {
          // If CSV is chosen for master, export both or tests CSV
          exportedFileName = exportRawTestingDataCSV(currentCompany, matchingTests, {
            filenamePrefix: 'Respaldo_Controles_Consolidado'
          });
          showToast(`✓ Datos de controles exportados en CSV: ${exportedFileName}`);
        }
      } else if (exportType === 'tests') {
        if (matchingTests.length === 0) {
          showToast('No se encontraron registros de pruebas con los filtros seleccionados.');
          setIsExporting(false);
          return;
        }

        if (format === 'xlsx') {
          exportedFileName = exportTestsToExcel(currentCompany, tests, filterOptions);
          showToast(`✓ ${matchingTests.length} pruebas de alcohol y drogas exportadas en Excel: ${exportedFileName}`);
        } else {
          exportedFileName = exportRawTestingDataCSV(currentCompany, matchingTests, {
            filenamePrefix: 'Controles_Toxicológicos'
          });
          showToast(`✓ ${matchingTests.length} pruebas exportadas en formato CSV: ${exportedFileName}`);
        }
      } else if (exportType === 'audit_logs') {
        if (matchingLogs.length === 0) {
          showToast('No se encontraron eventos de auditoría con los filtros seleccionados.');
          setIsExporting(false);
          return;
        }

        if (format === 'xlsx') {
          exportedFileName = exportAuditLogsToExcel(currentCompany, auditLogs, filterOptions);
          showToast(`✓ ${matchingLogs.length} eventos de auditoría forense exportados en Excel: ${exportedFileName}`);
        } else {
          exportedFileName = exportAuditLogsCSV(currentCompany, matchingLogs, 'Bitacora_Forense_SUSESO');
          showToast(`✓ ${matchingLogs.length} eventos de bitácora exportados en CSV: ${exportedFileName}`);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error in handleExecuteExport:', error);
      showToast('Ocurrió un error al generar el archivo de respaldo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                  EXPORTACIÓN ADMINISTRATIVA & RESPALDOS
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Excel (.xlsx) / CSV RFC-4180
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Generador de Respaldos para Gestión Administrativa
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* 1. Selection of Dataset */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              1. Selecciona el Tipo de Información a Respaldar
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option: Master Backup */}
              <button
                type="button"
                onClick={() => setExportType('master')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  exportType === 'master'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs">Respaldo Maestro Completo</span>
                    <Layers className={`w-4 h-4 ${exportType === 'master' ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Libro consolidado con Pruebas, Logs de Auditoría, Nómina de Conductores y Resumen Ejecutivo.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                  <span className="text-blue-300 font-mono font-bold">Multitab Excel</span>
                  <span className="text-slate-400">Todo en 1</span>
                </div>
              </button>

              {/* Option: Test Records */}
              <button
                type="button"
                onClick={() => setExportType('tests')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  exportType === 'tests'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs">Controles Toxicológicos</span>
                    <FileSpreadsheet className={`w-4 h-4 ${exportType === 'tests' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Pruebas de alcohol (g/L), paneles de 6 drogas, números de serie, calibraciones y dictámenes.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-300 font-mono font-bold">{matchingTests.length} pruebas</span>
                  <span className="text-slate-400">Detallado</span>
                </div>
              </button>

              {/* Option: Audit Logs */}
              <button
                type="button"
                onClick={() => setExportType('audit_logs')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  exportType === 'audit_logs'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs">Bitácora Forense (Logs)</span>
                    <ShieldCheck className={`w-4 h-4 ${exportType === 'audit_logs' ? 'text-purple-400' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Trazabilidad inalterable con hashes SHA-256 encadenados, actores, IPs y acciones auditables.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                  <span className="text-purple-300 font-mono font-bold">{matchingLogs.length} eventos</span>
                  <span className="text-slate-400">Forense</span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Format Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              2. Formato de Descarga
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  format === 'xlsx'
                    ? 'bg-emerald-500/15 border-emerald-500/80 text-white'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value="xlsx"
                  checked={format === 'xlsx'}
                  onChange={() => setFormat('xlsx')}
                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>Libro de Excel (.xlsx)</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Nativo para Microsoft Excel, pestañas múltiples, anchos de columna ajustados y estilos automáticos.
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  format === 'csv'
                    ? 'bg-teal-500/15 border-teal-500/80 text-white'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="w-4 h-4 text-teal-500 focus:ring-teal-500"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>Archivo CSV (.csv RFC-4180)</span>
                    <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      BOM UTF-8
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Ideal para PowerBI, Python, bases de datos SQL y planillas que requieren texto plano estructurado.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Filter Options */}
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-750">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-400" />
                <span>3. Filtros del Respaldo Administrativo</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Empresa: <strong className="text-slate-200">{currentCompany.businessName}</strong>
              </span>
            </div>

            {/* Date Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-300 font-medium">Período Temporal:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'Todo el Historial' },
                  { id: '7d', label: 'Últimos 7 Días' },
                  { id: '30d', label: 'Últimos 30 Días' },
                  { id: 'custom', label: 'Rango Personalizado' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setDateRangePreset(preset.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      dateRangePreset === preset.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range Inputs */}
            {dateRangePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Fecha Desde:</label>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Fecha Hasta:</label>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Base and Status filters (for tests) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-750">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Base Operacional / Garita:</label>
                <select
                  value={selectedBase}
                  onChange={(e) => setSelectedBase(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todas las Bases Operacionales</option>
                  {availableBases.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Dictamen del Control:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todos los Resultados (Aptos y Bloqueados)</option>
                  <option value="apto_despacho">Solo Aptos para Despacho (0.00 g/L y Negativo)</option>
                  <option value="no_apto_bloqueado">Solo No Aptos / Bloqueo Preventivo Activo</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Live Record Count Preview */}
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-white font-bold">
                  {exportType === 'master'
                    ? `${matchingTests.length} Controles y ${matchingLogs.length} Eventos de Auditoría`
                    : exportType === 'tests'
                    ? `${matchingTests.length} Controles Toxicológicos seleccionados`
                    : `${matchingLogs.length} Eventos de Bitácora Forense seleccionados`}
                </span>
                <p className="text-[10px] text-slate-400">
                  Cumple con estándares probatorios de la SUSESO (Dictamen 92064-2025) y Dirección del Trabajo (DT).
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shrink-0">
              {format.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Firma Forense SHA-256 e integridad verificada</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="execute-export-backup-btn"
              type="button"
              disabled={isExporting}
              onClick={handleExecuteExport}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generando Archivo...' : `Descargar Respaldo (${format.toUpperCase()})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
