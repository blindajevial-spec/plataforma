import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TestRecord, DrugType, DrugPanelResult } from '../types';
import { SafetyAlertsEmailModal } from './SafetyAlertsEmailModal';
import { exportRawTestingDataCSV, exportTestsToExcel } from '../utils/exportManager';
import { AdminExportBackupModal } from './AdminExportBackupModal';
import {
  FlaskConical,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Printer,
  ShieldCheck,
  Calendar,
  User,
  Truck,
  FileBadge,
  Eye,
  Mail,
  Send,
  ShieldAlert,
  QrCode,
  FileSpreadsheet,
  Download,
  ChevronDown,
  Settings,
  Layers
} from 'lucide-react';

interface TestingViewProps {
  onOpenNewTestModal: () => void;
  onViewTestDetails: (test: TestRecord) => void;
  onOpenQRScanner?: () => void;
}

export const TestingView: React.FC<TestingViewProps> = ({ onOpenNewTestModal, onViewTestDetails, onOpenQRScanner }) => {
  const { tests, drivers, equipment, safetyRiskThresholds, safetyManagerRecipients, currentCompany, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSafetyEmailModalOpen, setIsSafetyEmailModalOpen] = useState(false);
  const [testToAlert, setTestToAlert] = useState<TestRecord | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isAdminBackupModalOpen, setIsAdminBackupModalOpen] = useState(false);

  const activeSafetyManagers = safetyManagerRecipients.filter((r) => r.active).length;

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverRut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = filterReason === 'all' || t.reason === filterReason;
    const matchesStatus = filterStatus === 'all' || t.overallStatus === filterStatus;
    return matchesSearch && matchesReason && matchesStatus;
  });

  const totalTests = tests.length;
  const aptos = tests.filter((t) => t.overallStatus === 'apto_despacho').length;
  const bloqueados = tests.filter((t) => t.overallStatus === 'no_apto_bloqueado').length;

  // Handler to export tests to Excel (.xlsx)
  const handleDownloadExcel = (mode: 'filtered' | 'all' = 'filtered') => {
    try {
      const recordsToExport = mode === 'filtered' ? filteredTests : tests;
      if (recordsToExport.length === 0) {
        showToast('No hay registros de controles para exportar con los filtros seleccionados.');
        return;
      }

      const fileName = exportTestsToExcel(currentCompany, recordsToExport, {
        filenamePrefix: mode === 'filtered' ? 'Controles_Toxicológicos_Filtrados' : 'Controles_Toxicológicos_Completo'
      });

      showToast(`✓ Datos de controles (${recordsToExport.length} actas) exportados en Excel (.xlsx): ${fileName}`);
    } catch (err) {
      console.error('Error exporting tests to Excel:', err);
      showToast('Error al exportar los datos de controles en formato Excel.');
    }
  };

  // Handler to export tests to CSV for Excel / PowerBI
  const handleDownloadCSV = (mode: 'filtered' | 'all' = 'filtered') => {
    try {
      const recordsToExport = mode === 'filtered' ? filteredTests : tests;
      if (recordsToExport.length === 0) {
        showToast('No hay registros de controles para exportar con los filtros seleccionados.');
        return;
      }

      const fileName = exportRawTestingDataCSV(currentCompany, recordsToExport, {
        filenamePrefix: mode === 'filtered' ? 'Controles_Toxicológicos_Filtrados' : 'Controles_Toxicológicos_Base_Completa',
        sourceContext: 'TestingView',
        filterAppliedDescription: mode === 'filtered' ? `Filtro: ${filterReason} / ${filterStatus}` : 'Todos'
      });

      showToast(`✓ Datos de controles (${recordsToExport.length} actas) exportados en CSV para Excel/PowerBI: ${fileName}`);
    } catch (err) {
      console.error('Error exporting tests to CSV:', err);
      showToast('Error al exportar los datos de controles en formato CSV.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Title and New Test Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
              RF-006 & RF-007 • TOLERANCIA CERO
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Registro de Controles de Alcohol y Drogas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro digital inalterable de alcohotest (0.00 g/L) y paneles toxicológicos de 6 drogas con firma y cadena de custodia
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Download & Export Action for Excel (.xlsx) and CSV */}
          <div className="relative inline-flex rounded-xl shadow-lg shadow-emerald-600/15">
            <button
              id="download-export-testing-btn"
              onClick={() => handleDownloadExcel('filtered')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-l-xl transition cursor-pointer shadow-sm border border-emerald-500/30"
              title="Descargar datos de controles en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Exportar Excel</span>
              <span className="text-[9px] bg-white/20 text-white font-mono px-1.5 py-0.5 rounded font-bold">
                {filteredTests.length}
              </span>
            </button>
            <button
              id="download-export-testing-toggle"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="bg-teal-700 hover:bg-teal-600 text-white px-2.5 py-2.5 rounded-r-xl border-l border-teal-500/40 border-t border-b border-r border-emerald-500/30 transition cursor-pointer flex items-center justify-center"
              title="Opciones de exportación en Excel (.xlsx) o CSV"
              aria-label="Opciones de exportación"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options */}
            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-84 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Exportación para Gestión Administrativa</span>
                  <span className="text-emerald-400 font-mono text-[9px]">Excel / CSV</span>
                </div>
                
                {/* Excel Option: Filtered */}
                <button
                  id="download-excel-filtered-option"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    handleDownloadExcel('filtered');
                  }}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Descargar Excel (.xlsx) Filtrados</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                        {filteredTests.length} actas
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Libro Excel con formato de columnas para los {filteredTests.length} registros visibles
                    </p>
                  </div>
                </button>

                {/* Excel Option: All */}
                <button
                  id="download-excel-all-option"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    handleDownloadExcel('all');
                  }}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Descargar Excel (.xlsx) Base Completa</span>
                      <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1 rounded font-mono">
                        {tests.length} actas
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Exporta el 100% del historial de alcohotest y drogas en hoja de cálculo
                    </p>
                  </div>
                </button>

                {/* CSV Option: Filtered */}
                <button
                  id="download-csv-filtered-option"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    handleDownloadCSV('filtered');
                  }}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer border-t border-slate-800"
                >
                  <Download className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Exportar CSV (RFC-4180 BOM)</span>
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded font-mono">
                        PowerBI / DB
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Formato plano delimitado por comas con codificación UTF-8 para análisis de datos
                    </p>
                  </div>
                </button>

                {/* Advanced Modal Trigger */}
                <button
                  id="open-admin-export-modal-option"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    setIsAdminBackupModalOpen(true);
                  }}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-left transition text-blue-200 cursor-pointer border border-blue-800/40 mt-1"
                >
                  <Layers className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Centro de Respaldos Avanzado...</span>
                      <span className="text-[9px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-bold">
                        Nuevo
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-300/80">
                      Personalizar rango de fechas, bases operacionales o generar Respaldo Maestro Multitab
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setTestToAlert(null);
              setIsSafetyEmailModalOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
            title="Configuración de Umbrales de Riesgo y Disparo Automático por Correo"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Alertas por Correo a Prevención</span>
            <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {safetyRiskThresholds.autoTriggerEnabled ? 'Auto ON' : 'Pausado'}
            </span>
          </button>

          {onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              title="Escanear Código QR de Credencial de Conductor con Cámara"
            >
              <QrCode className="w-4 h-4" />
              <span>Escanear Credencial Garita (QR)</span>
            </button>
          )}

          <button
            onClick={onOpenNewTestModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Control Preventivo</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Exámenes Registrados</span>
            <p className="text-2xl font-extrabold text-white mt-1">{totalTests}</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Aptos para Despacho (0.00 g/L)</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{aptos}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">No Aptos / Bloqueo Preventivo</span>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{bloqueados}</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por conductor, RUT o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los Motivos</option>
            <option value="Pre-turno">Pre-turno</option>
            <option value="Aleatorio">Aleatorio</option>
            <option value="Post-incidente">Post-incidente</option>
            <option value="Sospecha fundada">Sospecha fundada</option>
            <option value="Reintegro laboral">Reintegro laboral</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los Resultados</option>
            <option value="apto_despacho">Apto para Despacho</option>
            <option value="no_apto_bloqueado">No Apto / Bloqueado</option>
          </select>

          <button
            onClick={() => handleDownloadCSV('filtered')}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            title={`Descargar ${filteredTests.length} registros filtrados en CSV para Excel`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV ({filteredTests.length})</span>
          </button>
        </div>
      </div>

      {/* Test Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Código / Fecha</th>
                <th className="px-4 py-3">Conductor (RUT)</th>
                <th className="px-4 py-3">Base / Vehículo</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Alcohol (g/L)</th>
                <th className="px-4 py-3">Panel Drogas</th>
                <th className="px-4 py-3">Dictamen / Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-800/50 transition">
                    {/* Código y Fecha */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-mono font-bold text-blue-400">{test.code}</p>
                      <span className="text-[10px] text-slate-400">{test.timestamp}</span>
                    </td>

                    {/* Conductor */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-100">{test.driverName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">RUT: {test.driverRut}</p>
                    </td>

                    {/* Base y Vehículo */}
                    <td className="px-4 py-3.5">
                      <p className="text-slate-300">{test.driverBase}</p>
                      {test.vehiclePlate ? (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                          Pat: {test.vehiclePlate}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Sin vehículo</span>
                      )}
                    </td>

                    {/* Motivo */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-700">
                        {test.reason}
                      </span>
                    </td>

                    {/* Alcohol */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold ${
                          test.alcoholValueGramsPerLiter === 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {test.alcoholValueGramsPerLiter.toFixed(2)} g/L
                        </span>
                        <span className="text-[9px] text-slate-400">
                          ({test.alcoholStatus === 'negativo' ? '0.00' : 'ALTO'})
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 truncate max-w-[120px]">
                        {test.alcoholDeviceModel}
                      </p>
                    </td>

                    {/* Panel Drogas */}
                    <td className="px-4 py-3.5">
                      {test.drugsTested ? (
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            test.drugsOverallStatus === 'negativo'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {test.drugsOverallStatus === 'negativo' ? '6-Panel Negativo' : 'Presunto Positivo'}
                          </span>
                          {test.drugPanelResults.some((p) => p.result === 'presunto_positivo') && (
                            <p className="text-[10px] text-rose-400 font-medium mt-0.5">
                              Reactivo: {test.drugPanelResults.filter((p) => p.result === 'presunto_positivo').map((p) => p.drug).join(', ')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No realizado</span>
                      )}
                    </td>

                    {/* Estado Final */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${
                          test.overallStatus === 'apto_despacho'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {test.overallStatus === 'apto_despacho' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            APTO DESPACHO
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-rose-400" />
                            BLOQUEO ACTIVO
                          </>
                        )}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {test.overallStatus === 'no_apto_bloqueado' && (
                          <button
                            onClick={() => {
                              setTestToAlert(test);
                              setIsSafetyEmailModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer"
                            title="Disparar o inspeccionar alerta de correo para este caso"
                          >
                            <Mail className="w-3.5 h-3.5 text-red-400" />
                            <span>Alerta Correo</span>
                          </button>
                        )}
                        <button
                          onClick={() => onViewTestDetails(test)}
                          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer"
                          title="Ver Acta Oficial y Certificado de Examen"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Ver Acta</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Alerts by Email Modal */}
      <SafetyAlertsEmailModal
        isOpen={isSafetyEmailModalOpen}
        onClose={() => {
          setIsSafetyEmailModalOpen(false);
          setTestToAlert(null);
        }}
        initialTestToAlert={testToAlert}
      />

      {/* Admin Export & Backup Modal */}
      <AdminExportBackupModal
        isOpen={isAdminBackupModalOpen}
        onClose={() => setIsAdminBackupModalOpen(false)}
        initialType="tests"
      />
    </div>
  );
};
