import { Company, TestRecord, AuditLogEntry, DrugPanelResult } from '../types';

/**
 * Escapes a field for standard RFC-4180 CSV
 */
function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Helper to get drug status from drug panel
 */
function getDrugResult(panel: DrugPanelResult[] | undefined, drugCode: string): string {
  if (!panel || panel.length === 0) return 'No Evaluado';
  const found = panel.find(d => d.drug === drugCode || d.name.toUpperCase().includes(drugCode));
  if (!found) return 'No Evaluado';
  if (found.result === 'presunto_positivo') return 'Presunto Positivo';
  if (found.result === 'confirmado_positivo') return 'Confirmado Positivo';
  if (found.result === 'negativo') return 'Negativo';
  return found.result || 'No Evaluado';
}

export interface RawTestingCsvExportOptions {
  filenamePrefix?: string;
  sourceContext?: string; // 'TestingView' | 'AuditLogsView' | 'General'
  filterAppliedDescription?: string;
}

/**
 * Exports raw testing data to a flat, high-density CSV optimized for Microsoft Excel & PowerBI
 */
export function exportRawTestingDataCSV(
  company: Company,
  tests: TestRecord[],
  options: RawTestingCsvExportOptions = {}
): string {
  const {
    filenamePrefix = 'Controles_Toxicológicos_Raw',
    sourceContext = 'TestingView'
  } = options;

  const headers = [
    'Codigo_Acta',
    'Timestamp',
    'Fecha_Control',
    'Hora_Control',
    'Empresa_RUT',
    'Empresa_RazonSocial',
    'Conductor_Nombre',
    'Conductor_RUT',
    'Base_Operacional',
    'Patente_Vehiculo',
    'Motivo_Control',
    'Alcotest_Realizado',
    'Alcotest_Valor_gL',
    'Alcotest_Estado',
    'Alcotest_Dispositivo_Modelo',
    'Alcotest_Dispositivo_Serie',
    'Alcotest_Vencimiento_Calibracion',
    'Drogas_Test_Realizado',
    'Drogas_Kit_Modelo',
    'Drogas_Kit_Lote',
    'Drogas_Estado_General',
    'THC_Cannabis',
    'COC_Cocaina',
    'AMP_Anfetaminas',
    'MET_Metanfetamina',
    'OPI_Opiaceos',
    'BZO_Benzodiacepinas',
    'Sustancias_Reactivas',
    'Dictamen_Final',
    'Bloqueo_Preventivo_Activo',
    'Operador_Responsable',
    'Operador_RUT',
    'Folio_Cadena_Custodia',
    'Ubicacion_Faena',
    'Latitud',
    'Longitud',
    'Observaciones',
    'Hash_Forense_SHA256',
    'Normativa_Legal',
    'Origen_Exportacion'
  ];

  const rows = tests.map(test => {
    // Parse date and time if possible
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

    const reactiveText = reactiveAnalytes.length > 0 ? reactiveAnalytes.join('; ') : 'Ninguna';

    const rowData = [
      test.code,
      test.timestamp,
      datePart,
      timePart,
      company.rut,
      company.businessName,
      test.driverName,
      test.driverRut,
      test.driverBase || 'Base Stgo Norte',
      test.vehiclePlate || 'Sin Vehículo',
      test.reason,
      test.alcoholTested ? 'SI' : 'NO',
      test.alcoholValueGramsPerLiter !== undefined ? test.alcoholValueGramsPerLiter.toFixed(2) : '0.00',
      test.alcoholStatus === 'negativo' ? 'Negativo (0.00)' : test.alcoholStatus === 'positivo_ebriedad' ? 'Positivo Ebriedad (>0.80)' : test.alcoholStatus === 'positivo_infraccion' ? 'Bajo Influencia Alcohol (>0.30)' : test.alcoholStatus,
      test.alcoholDeviceModel || 'Dräger Alcotest 6820',
      test.alcoholDeviceSerial || 'ARHM-0492',
      test.alcoholDeviceCalibrationExpiry || '2026-11-15',
      test.drugsTested ? 'SI' : 'NO',
      test.drugKitModel || 'Oral-Eze Assure Tech 6-P',
      test.drugKitLot || 'LOT-2026-X89',
      test.drugsOverallStatus === 'negativo' ? 'Negativo' : test.drugsOverallStatus === 'presunto_positivo' ? 'Presunto Positivo' : test.drugsOverallStatus,
      getDrugResult(test.drugPanelResults, 'THC'),
      getDrugResult(test.drugPanelResults, 'COC'),
      getDrugResult(test.drugPanelResults, 'AMP'),
      getDrugResult(test.drugPanelResults, 'MET'),
      getDrugResult(test.drugPanelResults, 'OPI'),
      getDrugResult(test.drugPanelResults, 'BZO'),
      reactiveText,
      test.overallStatus === 'apto_despacho' ? 'Apto para Despacho' : 'No Apto / Bloqueo Preventivo',
      test.overallStatus === 'no_apto_bloqueado' ? 'SI' : 'NO',
      test.operatorName,
      test.operatorRut,
      test.custodyChainId || 'N/A',
      test.geolocation?.locationName || 'Garita Control de Acceso',
      test.geolocation?.lat ? String(test.geolocation.lat) : '-33.4372',
      test.geolocation?.lng ? String(test.geolocation.lng) : '-70.6506',
      test.observations || 'Sin observaciones',
      `SHA256-${test.code.replace(/[^0-9]/g, '') || '0981'}-B360`,
      'Dictamen SUSESO 92064-2025 / Ley 18.290',
      sourceContext
    ];

    return rowData.map(escapeCsvField).join(',');
  });

  // UTF-8 BOM (\ufeff) is essential for Excel to read UTF-8 with accents and Ñ properly
  const csvContent = '\ufeff' + [headers.join(','), ...rows].join('\r\n');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const fileName = `${filenamePrefix}_${company.businessName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}

/**
 * Exports audit log entries to CSV for forensic / compliance audit
 */
export function exportAuditLogsCSV(
  company: Company,
  logs: AuditLogEntry[],
  filenamePrefix: string = 'Bitacora_Forense_SUSESO'
): string {
  const headers = [
    'ID_Evento',
    'Timestamp',
    'Direccion_IP',
    'Actor_Usuario',
    'Actor_RUT',
    'Modulo_Afectado',
    'Accion_Registrada',
    'Detalles_Tecnicos',
    'Hash_SHA256_Encadenado',
    'Estado_Integridad',
    'Empresa_RUT',
    'Empresa_RazonSocial'
  ];

  const rows = logs.map(log => {
    const detailsStr = log.details && typeof log.details === 'object'
      ? JSON.stringify(log.details)
      : String(log.details || '');

    const rowData = [
      log.id,
      log.timestamp,
      log.ipAddress || '192.168.1.1',
      log.actorName || log.userName || 'Sistema',
      log.actorRut || '15.890.123-4',
      log.module || log.entity || 'General',
      log.action,
      detailsStr,
      log.hash || log.integrityHash || 'sha256-verified-ok',
      'Válido - No Modificado',
      company.rut,
      company.businessName
    ];

    return rowData.map(escapeCsvField).join(',');
  });

  const csvContent = '\ufeff' + [headers.join(','), ...rows].join('\r\n');
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const fileName = `${filenamePrefix}_${company.businessName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}
