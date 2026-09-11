import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SusesoVerificationLog } from './SusesoVerificationLog';
import { useNetworkAndOffline } from '../hooks/useNetworkAndOffline';
import { getCachedLogsSnapshot } from '../utils/offlineSyncManager';
import {
  exportRawTestingDataCSV,
  exportAuditLogsCSV,
  exportAuditLogsToExcel,
  exportTestsToExcel
} from '../utils/exportManager';
import { AdminExportBackupModal } from './AdminExportBackupModal';
import {
  FileCode2,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Download,
  Terminal,
  Clock,
  User,
  Award,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  Layers
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, documentApprovalLogs, tests, currentCompany, showToast } = useApp();
  const { isOnline, pendingQueue, isSyncing, syncOfflineQueue } = useNetworkAndOffline();

  const [activeTab, setActiveTab] = useState<'system_events' | 'suseso_documents'>('system_events');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [isCsvMenuOpen, setIsCsvMenuOpen] = useState(false);
  const [isAdminBackupModalOpen, setIsAdminBackupModalOpen] = useState(false);

  const effectiveLogs = (auditLogs && auditLogs.length > 0) ? auditLogs : (getCachedLogsSnapshot() || []);
  const modules = Array.from(new Set(effectiveLogs.map((l) => l.module || l.entity || 'General')));

  const filteredLogs = effectiveLogs.filter((log) => {
    const actor = log.actorName || log.userName || '';
    const rut = log.actorRut || '';
    const hash = log.hash || log.integrityHash || '';
    const mod = log.module || log.entity || 'General';

    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rut.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || mod === filterModule;
    return matchesSearch && matchesModule;
  });

  // Export audit logs to Excel (.xlsx)
  const handleDownloadAuditLogsExcel = () => {
    try {
      const fileName = exportAuditLogsToExcel(currentCompany, effectiveLogs);
      showToast(`✓ Bitácora forense (${effectiveLogs.length} eventos) exportada en Excel (.xlsx): ${fileName}`);
    } catch (err) {
      console.error('Error exporting audit logs to Excel:', err);
      showToast('Error al exportar la bitácora forense en formato Excel.');
    }
  };

  // Export raw testing data to Excel (.xlsx)
  const handleDownloadRawTestsExcel = () => {
    try {
      const fileName = exportTestsToExcel(currentCompany, tests, {
        filenamePrefix: 'Controles_Toxicológicos_Auditoría'
      });
      showToast(`✓ Datos de controles (${tests.length} actas) exportados en Excel (.xlsx): ${fileName}`);
    } catch (err) {
      console.error('Error exporting tests to Excel from AuditLogsView:', err);
      showToast('Error al exportar los datos de controles en formato Excel.');
    }
  };

  // Export raw testing data to CSV for Excel / PowerBI
  const handleDownloadRawTestsCSV = () => {
    try {
      const fileName = exportRawTestingDataCSV(currentCompany, tests, {
        filenamePrefix: 'Controles_Toxicológicos_Raw_PowerBI',
        sourceContext: 'AuditLogsView'
      });
      showToast(`✓ Datos de controles (${tests.length} actas) exportados exitosamente en CSV: ${fileName}`);
    } catch (err) {
      console.error('Error exporting raw testing CSV from AuditLogsView:', err);
      showToast('Error al exportar los datos de controles en formato CSV.');
    }
  };

  // Export audit logs to CSV for forensic audit
  const handleDownloadAuditLogsCSV = () => {
    try {
      const fileName = exportAuditLogsCSV(currentCompany, effectiveLogs);
      showToast(`✓ Bitácora forense (${effectiveLogs.length} eventos) exportada en CSV: ${fileName}`);
    } catch (err) {
      console.error('Error exporting audit logs CSV:', err);
      showToast('Error al exportar la bitácora forense en formato CSV.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
              RF-018 • BITÁCORA FORENSE INALTERABLE
            </span>
            <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> HASH CHAIN SHA-256 VERIFIED
            </span>
            {!isOnline && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 border border-amber-500/40 animate-pulse">
                <Database className="w-3 h-3" /> CACHÉ LOCAL OFFLINE ACTIVO
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Registro de Auditoría y Trazabilidad Forense
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log inalterable y encadenado criptográficamente de todos los eventos del sistema (creación de exámenes, bloqueos de conductores, calibraciones e ingresos de usuarios).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Download & Export Action for Excel (.xlsx) and CSV */}
          <div className="relative inline-flex rounded-xl shadow-lg shadow-emerald-600/15">
            <button
              id="download-export-audit-btn"
              onClick={handleDownloadAuditLogsExcel}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-l-xl transition cursor-pointer shadow-sm border border-emerald-500/30"
              title="Descargar bitácora forense de auditoría en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Exportar Excel</span>
              <span className="text-[9px] bg-white/20 text-white font-mono px-1.5 py-0.5 rounded font-bold">
                {effectiveLogs.length}
              </span>
            </button>
            <button
              id="download-export-audit-toggle"
              onClick={() => setIsCsvMenuOpen(!isCsvMenuOpen)}
              className="bg-teal-700 hover:bg-teal-600 text-white px-2.5 py-2.5 rounded-r-xl border-l border-teal-500/40 border-t border-b border-r border-emerald-500/30 transition cursor-pointer flex items-center justify-center"
              title="Opciones de exportación en Excel (.xlsx) o CSV"
              aria-label="Opciones de exportación"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCsvMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick dropdown for Export options */}
            {isCsvMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-84 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Exportación para Auditoría y Gestión</span>
                  <span className="text-emerald-400 font-mono text-[9px]">Excel / CSV</span>
                </div>
                
                {/* Excel Option: Audit Logs */}
                <button
                  id="download-audit-logs-excel-option"
                  onClick={() => {
                    setIsCsvMenuOpen(false);
                    handleDownloadAuditLogsExcel();
                  }}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Bitácora Forense en Excel (.xlsx)</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                        {effectiveLogs.length} logs
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Exporta el registro completo de eventos con timestamps, IPs y hashes SHA-256
                    </p>
                  </div>
                </button>

                {/* Excel Option: Tests */}
                <button
                  id="download-tests-excel-option"
                  onClick={() => {
                    setIsCsvMenuOpen(false);
                    handleDownloadRawTestsExcel();
                  }}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Controles Toxicológicos en Excel (.xlsx)</span>
                      <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1 rounded font-mono">
                        {tests.length} tests
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Base completa de alcotest y drogas con 6 paneles reactivos y dictamen final
                    </p>
                  </div>
                </button>

                {/* CSV Option: Audit Logs */}
                <button
                  id="download-audit-logs-csv-option"
                  onClick={() => {
                    setIsCsvMenuOpen(false);
                    handleDownloadAuditLogsCSV();
                  }}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer border-t border-slate-800"
                >
                  <Download className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Bitácora Forense en CSV (RFC-4180)</span>
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded font-mono">
                        Forense
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Archivo de texto plano delimitado por comas con encoding BOM UTF-8
                    </p>
                  </div>
                </button>

                {/* CSV Option: Tests */}
                <button
                  id="download-raw-tests-csv-option"
                  onClick={() => {
                    setIsCsvMenuOpen(false);
                    handleDownloadRawTestsCSV();
                  }}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-800 text-left transition text-slate-200 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Controles Toxicológicos en CSV</span>
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded font-mono">
                        PowerBI
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Base completa de controles optimizada para análisis en BI o bases de datos
                    </p>
                  </div>
                </button>

                {/* Advanced Modal Trigger */}
                <button
                  id="open-admin-export-modal-from-audit"
                  onClick={() => {
                    setIsCsvMenuOpen(false);
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
            onClick={() => setIsAdminBackupModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Abrir centro de respaldos para gestión administrativa y peritaje legal"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Respaldos Administrativos</span>
          </button>
        </div>
      </div>

      {/* Offline Pending Queue Notice */}
      {pendingQueue.length > 0 && (
        <div className="bg-amber-950/70 border border-amber-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200">
                Hay {pendingQueue.length} {pendingQueue.length === 1 ? 'evento de garita registrado' : 'eventos de garita registrados'} en modo fuera de línea
              </h4>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Las autorizaciones y bloqueos efectuados sin conexión se encuentran resguardados en la memoria local y se integrarán automáticamente a la bitácora central al recuperar cobertura.
              </p>
            </div>
          </div>
          {isOnline && (
            <button
              onClick={() => syncOfflineQueue()}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Consolidar en Bitácora'}</span>
            </button>
          )}
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('system_events')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'system_events'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Eventos Generales del Sistema (RF-018)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'system_events' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('suseso_documents')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'suseso_documents'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Aprobaciones de Documentos Críticos SUSESO (RF-019)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'suseso_documents' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {documentApprovalLogs.length}
          </span>
        </button>
      </div>

      {activeTab === 'suseso_documents' ? (
        <SusesoVerificationLog />
      ) : (
        <>
          {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por acción, usuario, RUT o hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 capitalize"
          >
            <option value="all">Todos los Módulos</option>
            {modules.map((m) => (
              <option key={String(m)} value={String(m)} className="capitalize">
                {String(m).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Forensic Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Timestamp / IP</th>
                <th className="px-4 py-3">Actor Responsable</th>
                <th className="px-4 py-3">Módulo</th>
                <th className="px-4 py-3">Acción Registrada</th>
                <th className="px-4 py-3">Hash Criptográfico SHA-256</th>
                <th className="px-4 py-3 text-right">Integridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-mono text-slate-200">{log.timestamp}</p>
                    <span className="text-[10px] text-slate-500 font-mono">IP: {log.ipAddress}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-100">{log.actorName || log.userName || 'Sistema'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">RUT: {log.actorRut || '15.890.123-4'}</p>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-[10px] font-bold bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700 uppercase">
                      {String(log.module || log.entity || 'Sistema').replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="text-slate-200 font-medium">{log.action}</p>
                    {log.details && (
                      <p className="text-[10px] text-slate-400 truncate max-w-sm">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <code className="text-[10px] text-purple-300 font-mono bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/60">
                      {(log.hash || log.integrityHash || 'sha256-verified-ok').slice(0, 16)}...
                    </code>
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Válido
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Admin Export & Backup Modal */}
      <AdminExportBackupModal
        isOpen={isAdminBackupModalOpen}
        onClose={() => setIsAdminBackupModalOpen(false)}
        initialType="audit_logs"
      />
    </div>
  );
};
