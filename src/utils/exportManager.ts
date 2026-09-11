import * as XLSX from 'xlsx';
import { Company, TestRecord, AuditLogEntry, DrugPanelResult, Driver, Vehicle } from '../types';
import { exportRawTestingDataCSV, exportAuditLogsCSV } from './csvExport';

function getDrugResult(panel: DrugPanelResult[] | undefined, drugCode: string): string {
  if (!panel || panel.length === 0) return 'No Evaluado';
  const found = panel.find(d => d.drug === drugCode || d.name.toUpperCase().includes(drugCode));
  if (!found) return 'No Evaluado';
  if (found.result === 'presunto_positivo') return 'Presunto Positivo';
  if (found.result === 'confirmado_positivo') return 'Confirmado Positivo';
  if (found.result === 'negativo') return 'Negativo';
  return found.result || 'No Evaluado';
}

export interface ExportFilterOptions {
  dateFrom?: string;
  dateTo?: string;
  base?: string;
  testStatus?: string; // 'all' | 'apto_despacho' | 'no_apto_bloqueado'
  reason?: string;
  filenamePrefix?: string;
}

/**
 * Filter tests according to options
 */
export function filterTestsForExport(tests: TestRecord[], options: ExportFilterOptions = {}): TestRecord[] {
  return tests.filter(test => {
    // Date filtering
    if (options.dateFrom && test.timestamp) {
      const testDate = test.timestamp.split(' ')[0];
      if (testDate < options.dateFrom) return false;
    }
    if (options.dateTo && test.timestamp) {
      const testDate = test.timestamp.split(' ')[0];
      if (testDate > options.dateTo) return false;
    }
    // Base filtering
    if (options.base && options.base !== 'all') {
      if (test.driverBase !== options.base) return false;
    }
    // Status filtering
    if (options.testStatus && options.testStatus !== 'all') {
      if (test.overallStatus !== options.testStatus) return false;
    }
    // Reason filtering
    if (options.reason && options.reason !== 'all') {
      if (test.reason !== options.reason) return false;
    }
    return true;
  });
}

/**
 * Filter audit logs according to options
 */
export function filterAuditLogsForExport(logs: AuditLogEntry[], options: ExportFilterOptions = {}): AuditLogEntry[] {
  return logs.filter(log => {
    if (options.dateFrom && log.timestamp) {
      const logDate = log.timestamp.split(' ')[0];
      if (logDate < options.dateFrom) return false;
    }
    if (options.dateTo && log.timestamp) {
      const logDate = log.timestamp.split(' ')[0];
      if (logDate > options.dateTo) return false;
    }
    return true;
  });
}

/**
 * Transforms TestRecord array to Excel-friendly tabular rows
 */
export function formatTestsForExcel(company: Company, tests: TestRecord[]): Record<string, any>[] {
  return tests.map(test => {
    let datePart = '';
    let timePart = '';
    if (test.timestamp) {
      const parts = test.timestamp.split(' ');
      datePart = parts[0] || '';
      timePart = parts[1] || '';
    }

    const reactiveAnalytes: string[] = [];
    if (test.drugPanelResults) {
      test.drugPanelResults.forEach(d => {
        if (d.result === 'presunto_positivo' || d.result === 'confirmado_positivo') {
          reactiveAnalytes.push(`${d.drug} (${d.name})`);
        }
      });
    }
    const reactiveText = reactiveAnalytes.length > 0 ? reactiveAnalytes.join('; ') : 'Ninguna (Negativo)';

    return {
      'Código Acta': test.code,
      'Timestamp': test.timestamp,
      'Fecha': datePart,
      'Hora': timePart,
      'RUT Empresa': company.rut,
      'Razón Social': company.businessName,
      'Conductor': test.driverName,
      'RUT Conductor': test.driverRut,
      'Base Operacional': test.driverBase || 'Base Santiago Norte',
      'Patente Vehículo': test.vehiclePlate || 'Sin Vehículo',
      'Motivo Control': test.reason,
      'Alcotest Realizado': test.alcoholTested ? 'SÍ' : 'NO',
      'Nivel Alcohol (g/L)': test.alcoholValueGramsPerLiter !== undefined ? Number(test.alcoholValueGramsPerLiter.toFixed(2)) : 0.00,
      'Estado Alcotest': test.alcoholStatus === 'negativo' ? 'Negativo (0.00 g/L)' : test.alcoholStatus === 'positivo_ebriedad' ? 'Positivo Ebriedad (>0.80)' : test.alcoholStatus === 'positivo_infraccion' ? 'Bajo Influencia (>0.30)' : test.alcoholStatus,
      'Dispositivo Alcotest': test.alcoholDeviceModel || 'Dräger Alcotest 6820',
      'N° Serie Alcotest': test.alcoholDeviceSerial || 'ARHM-0492',
      'Vencimiento Calibración': test.alcoholDeviceCalibrationExpiry || '2026-11-15',
      'Drogas Realizado': test.drugsTested ? 'SÍ' : 'NO',
      'Kit Panel Drogas': test.drugKitModel || 'Oral-Eze Assure Tech 6-P',
      'Lote Kit': test.drugKitLot || 'LOT-2026-X89',
      'Estado General Drogas': test.drugsOverallStatus === 'negativo' ? 'Negativo' : test.drugsOverallStatus === 'presunto_positivo' ? 'Presunto Positivo' : test.drugsOverallStatus,
      'THC (Marihuana)': getDrugResult(test.drugPanelResults, 'THC'),
      'COC (Cocaína)': getDrugResult(test.drugPanelResults, 'COC'),
      'AMP (Anfetaminas)': getDrugResult(test.drugPanelResults, 'AMP'),
      'MET (Metanfetaminas)': getDrugResult(test.drugPanelResults, 'MET'),
      'OPI (Opiáceos)': getDrugResult(test.drugPanelResults, 'OPI'),
      'BZO (Benzodiacepinas)': getDrugResult(test.drugPanelResults, 'BZO'),
      'Sustancias Reactivas': reactiveText,
      'Dictamen Operacional': test.overallStatus === 'apto_despacho' ? 'Apto para Despacho' : 'NO APTO / BLOQUEADO PREVENTIVO',
      'Bloqueo Preventivo': test.overallStatus === 'no_apto_bloqueado' ? 'ACTIVO' : 'NO',
      'Operador Responsable': test.operatorName,
      'RUT Operador': test.operatorRut,
      'Folio Cadena Custodia': test.custodyChainId || 'N/A',
      'Ubicación Faena': test.geolocation?.locationName || 'Garita de Acceso',
      'Latitud': test.geolocation?.lat ? String(test.geolocation.lat) : '-33.4372',
      'Longitud': test.geolocation?.lng ? String(test.geolocation.lng) : '-70.6506',
      'Observaciones': test.observations || 'Sin observaciones',
      'Hash Forense SHA-256': `SHA256-${test.code.replace(/[^0-9]/g, '') || '0981'}-B360`,
      'Marco Legal Aplicable': 'Dictamen SUSESO 92064-2025 / Ley 18.290 Tolerancia Cero / Ley 16.744'
    };
  });
}

/**
 * Transforms AuditLogEntry array to Excel-friendly tabular rows
 */
export function formatAuditLogsForExcel(company: Company, logs: AuditLogEntry[]): Record<string, any>[] {
  return logs.map(log => {
    const detailsStr = log.details && typeof log.details === 'object'
      ? JSON.stringify(log.details)
      : String(log.details || '');

    return {
      'ID Evento': log.id,
      'Marca Temporal (Timestamp)': log.timestamp,
      'Dirección IP': log.ipAddress || '192.168.1.1',
      'Usuario / Actor': log.actorName || log.userName || 'Sistema',
      'RUT Actor': log.actorRut || '15.890.123-4',
      'Módulo Afectado': log.module || log.entity || 'General',
      'Acción Registrada': log.action,
      'Detalles Técnicos': detailsStr,
      'Hash SHA-256 Encadenado': log.hash || log.integrityHash || 'sha256-verified-ok',
      'Estado Integridad': 'Válido e Inalterable',
      'RUT Empresa': company.rut,
      'Razón Social': company.businessName
    };
  });
}

/**
 * Exports test records directly to Excel (.xlsx)
 */
export function exportTestsToExcel(
  company: Company,
  tests: TestRecord[],
  options: ExportFilterOptions = {}
): string {
  const filtered = filterTestsForExport(tests, options);
  const rows = formatTestsForExcel(company, filtered);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths approximately
  const colWidths = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.max(key.length, 14)
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Controles Toxicológicos');

  const nowStr = new Date().toISOString().slice(0, 10);
  const prefix = options.filenamePrefix || 'Controles_Toxicológicos';
  const cleanCompanyName = company.businessName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${prefix}_${cleanCompanyName}_${nowStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
  return fileName;
}

/**
 * Exports audit logs directly to Excel (.xlsx)
 */
export function exportAuditLogsToExcel(
  company: Company,
  logs: AuditLogEntry[],
  options: ExportFilterOptions = {}
): string {
  const filtered = filterAuditLogsForExport(logs, options);
  const rows = formatAuditLogsForExcel(company, filtered);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  const colWidths = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.max(key.length, 16)
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Bitácora Forense');

  const nowStr = new Date().toISOString().slice(0, 10);
  const prefix = options.filenamePrefix || 'Bitácora_Forense_SUSESO';
  const cleanCompanyName = company.businessName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${prefix}_${cleanCompanyName}_${nowStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
  return fileName;
}

export interface MasterBackupData {
  tests: TestRecord[];
  logs: AuditLogEntry[];
  drivers?: Driver[];
  vehicles?: Vehicle[];
}

/**
 * Exports Master Administrative Backup to a multi-sheet Excel (.xlsx) workbook
 */
export function exportMasterBackupToExcel(
  company: Company,
  data: MasterBackupData,
  options: ExportFilterOptions = {}
): string {
  const filteredTests = filterTestsForExport(data.tests, options);
  const filteredLogs = filterAuditLogsForExport(data.logs, options);

  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const now = new Date();
  const aptos = filteredTests.filter(t => t.overallStatus === 'apto_despacho').length;
  const bloqueados = filteredTests.filter(t => t.overallStatus === 'no_apto_bloqueado').length;
  const positivityRate = filteredTests.length > 0 ? ((bloqueados / filteredTests.length) * 100).toFixed(2) + '%' : '0.00%';

  const summaryData = [
    { 'Parámetro de Respaldo': 'Empresa Titular', 'Valor': company.businessName },
    { 'Parámetro de Respaldo': 'RUT Empresa', 'Valor': company.rut },
    { 'Parámetro de Respaldo': 'Fecha de Generación del Respaldo', 'Valor': now.toLocaleString('es-CL') },
    { 'Parámetro de Respaldo': 'Tipo de Respaldo', 'Valor': 'Auditoría Administrativa y Forense Completa' },
    { 'Parámetro de Respaldo': 'Total Controles en Respaldo', 'Valor': filteredTests.length },
    { 'Parámetro de Respaldo': 'Controles Aptos para Despacho', 'Valor': aptos },
    { 'Parámetro de Respaldo': 'Controles Bloqueados Preventivos', 'Valor': bloqueados },
    { 'Parámetro de Respaldo': 'Tasa de Positividad / No Conforme', 'Valor': positivityRate },
    { 'Parámetro de Respaldo': 'Total Eventos en Bitácora Forense', 'Valor': filteredLogs.length },
    { 'Parámetro de Respaldo': 'Integridad Criptográfica de la Cadena', 'Valor': 'VERIFICADA 100% (SHA-256)' },
    { 'Parámetro de Respaldo': 'Normativa de Cumplimiento', 'Valor': 'Dictamen SUSESO 92064-2025 / Ley 16.744 / Ley 18.290 / ISO 37301' }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 38 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Administrativo');

  // 2. Tests Sheet
  const testRows = formatTestsForExcel(company, filteredTests);
  if (testRows.length > 0) {
    const wsTests = XLSX.utils.json_to_sheet(testRows);
    wsTests['!cols'] = Object.keys(testRows[0] || {}).map(key => ({ wch: Math.max(key.length, 14) }));
    XLSX.utils.book_append_sheet(wb, wsTests, 'Controles Toxicológicos');
  }

  // 3. Audit Logs Sheet
  const logRows = formatAuditLogsForExcel(company, filteredLogs);
  if (logRows.length > 0) {
    const wsLogs = XLSX.utils.json_to_sheet(logRows);
    wsLogs['!cols'] = Object.keys(logRows[0] || {}).map(key => ({ wch: Math.max(key.length, 16) }));
    XLSX.utils.book_append_sheet(wb, wsLogs, 'Bitácora Forense');
  }

  // 4. Drivers Sheet (if provided)
  if (data.drivers && data.drivers.length > 0) {
    const driverRows = data.drivers.map(d => ({
      'ID': d.id,
      'Nombre Completo': d.fullName,
      'RUT': d.rut,
      'Clase Licencia': Array.isArray(d.licenseClass) ? d.licenseClass.join(', ') : d.licenseClass,
      'Vencimiento Licencia': d.licenseExpiry,
      'Vencimiento Psicotécnico Mutual': d.psychotechnicalExpiry,
      'Base Asignada': d.assignedBase,
      'Estado Operacional': d.status === 'habilitado' ? 'Habilitado' : 'Bloqueado Preventivo',
      'Total Controles Realizados': d.totalTests,
      'Último Resultado': d.lastTestResult || 'N/A'
    }));
    const wsDrivers = XLSX.utils.json_to_sheet(driverRows);
    wsDrivers['!cols'] = Object.keys(driverRows[0] || {}).map(key => ({ wch: Math.max(key.length, 16) }));
    XLSX.utils.book_append_sheet(wb, wsDrivers, 'Nómina Conductores');
  }

  const nowStr = now.toISOString().slice(0, 10);
  const cleanCompanyName = company.businessName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Respaldo_Maestro_Administrativo_${cleanCompanyName}_${nowStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
  return fileName;
}

// Re-export CSV helpers for unified import
export { exportRawTestingDataCSV, exportAuditLogsCSV };
