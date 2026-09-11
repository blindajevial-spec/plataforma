import { ComplianceDocumentApprovalLog } from '../types';
import { serializeBlockPayload, fallbackSha256, generateVerificationFolio } from '../utils/susesoCrypto';

interface RawInitialBlockDef {
  timestamp: string;
  timestampEpoch: number;
  userId: string;
  userName: string;
  userRut: string;
  userRole: string;
  userEmail: string;
  companyId: string;
  companyName: string;
  companyRut: string;
  documentId: string;
  documentCode: string;
  documentTitle: string;
  documentVersion: string;
  documentCategory: ComplianceDocumentApprovalLog['documentCategory'];
  approvalAction: ComplianceDocumentApprovalLog['approvalAction'];
  approvalStatus: ComplianceDocumentApprovalLog['approvalStatus'];
  susesoClauseRef: string;
  legalFramework: string;
  signatureAlgorithm: string;
  timeStampingAuthority: string;
  certificateAuthority: string;
  ipAddress: string;
  sessionTokenHash: string;
  approvalObservations: string;
  auditAttestationStatement: string;
}

const RAW_APPROVALS: RawInitialBlockDef[] = [
  {
    timestamp: '2026-08-30 08:30:15 CLT',
    timestampEpoch: 1788078615000,
    userId: 'usr-compliance-01',
    userName: 'Dra. Marcela Fuenzalida R.',
    userRut: '14.892.401-2',
    userRole: 'Compliance Officer (Oficial de Cumplimiento)',
    userEmail: 'marcela.fuenzalida@transandinacargo.cl',
    companyId: 'comp-transandina',
    companyName: 'Transandina Cargo SpA',
    companyRut: '76.432.198-5',
    documentId: 'doc-suseso-manual',
    documentCode: 'MANUAL-SUSESO-92064',
    documentTitle: 'Manual de Cumplimiento Normativo: Programa Integral de Alcohol y Drogas (8 Tomos / 250 pp)',
    documentVersion: 'v2.0-2026',
    documentCategory: 'manual_suseso',
    approvalAction: 'visado_cumplimiento_suseso',
    approvalStatus: 'aprobado_conforme',
    susesoClauseRef: 'Dictamen SUSESO N.º 92064-2025 (02/07/2025) • Circular 3331 SUSESO',
    legalFramework: 'Ley N° 16.744 / Art. 184 Código del Trabajo / ISO 37301',
    signatureAlgorithm: 'ECDSA-SHA256 (NIST P-256)',
    timeStampingAuthority: 'TSA RFC 3161 - Servidor Horario Oficial SHOA / Subtel Chile',
    certificateAuthority: 'PKI e-CertChile / Acreditado Subsecretaría de Economía',
    ipAddress: '190.161.44.12',
    sessionTokenHash: 'TOK-SHA-98a1b2c3d4e5f6789012345678901234',
    approvalObservations: 'Visado técnico y jurídico de los 8 tomos del manual. Se constata incorporación de los 8 principios vinculantes de la SUSESO: finalidad preventiva, no discriminación, despersonalización (sorteo aleatorio), proporcionalidad y resguardo estricto de datos sensibles.',
    auditAttestationStatement: 'Doy fe de que el presente documento técnico satisface todas las exigencias vinculantes de la SUSESO para controles preventivos de intemperancia en empresas de transporte terrestre de carga.'
  },
  {
    timestamp: '2026-08-31 10:15:22 CLT',
    timestampEpoch: 1788171322000,
    userId: 'usr-gerencia-01',
    userName: 'Ignacio Larraín Matte',
    userRut: '11.458.920-K',
    userRole: 'Gerente General Ejecutivo',
    userEmail: 'ignacio.larrain@transandinacargo.cl',
    companyId: 'comp-transandina',
    companyName: 'Transandina Cargo SpA',
    companyRut: '76.432.198-5',
    documentId: 'doc-01',
    documentCode: 'POL-AD-2026',
    documentTitle: 'Política Corporativa de Prevención de Alcohol y Drogas en el Transporte de Carga y Pasajeros',
    documentVersion: 'v3.2',
    documentCategory: 'politica_corporativa',
    approvalAction: 'aprobacion_formal_directorio',
    approvalStatus: 'aprobado_conforme',
    susesoClauseRef: 'Art. 184 Código del Trabajo • Deber General de Protección Eficaz',
    legalFramework: 'Ley N° 18.290 de Tránsito / Ley N° 20.580 (Tolerancia Cero) / Ley 16.744',
    signatureAlgorithm: 'RSA-4096 / SHA-256 (Firma Avanzada Ley 19.799)',
    timeStampingAuthority: 'TSA RFC 3161 - Servidor Horario Oficial SHOA / Subtel Chile',
    certificateAuthority: 'Acepta S.A. PKI Root Entrust',
    ipAddress: '190.161.44.10',
    sessionTokenHash: 'TOK-SHA-1234567890abcdef1234567890abcdef',
    approvalObservations: 'Aprobación formal por el Directorio de Transandina Cargo SpA. Se ratifica la tolerancia cero estricta (0.00 g/L de alcohol en sangre y aire espirado) y prohibición absoluta de estupefacientes en turnos de conducción.',
    auditAttestationStatement: 'Certifico en representación legal del empleador la vigencia y obligatoriedad incondicional de la Política de Tolerancia Cero para el 100% de la dotación operativa.'
  },
  {
    timestamp: '2026-09-01 14:45:00 CLT',
    timestampEpoch: 1788273900000,
    userId: 'usr-prev-01',
    userName: 'Ing. Rodrigo Sepúlveda V.',
    userRut: '15.342.981-4',
    userRole: 'Jefe de Prevención de Riesgos (Sernageomin B / SNS)',
    userEmail: 'rodrigo.sepulveda@transandinacargo.cl',
    companyId: 'comp-transandina',
    companyName: 'Transandina Cargo SpA',
    companyRut: '76.432.198-5',
    documentId: 'doc-02',
    documentCode: 'RIOHS-CLAUS-DROGAS',
    documentTitle: 'Reglamento Interno: Anexo Normativo de Controles Preventivos Despersonalizados (Art. 154 N° 5)',
    documentVersion: 'v4.0',
    documentCategory: 'reglamento_riohs',
    approvalAction: 'ratificacion_comite_paritario',
    approvalStatus: 'aprobado_conforme',
    susesoClauseRef: 'Art. 154 N° 5 Código del Trabajo • Dictamen Ord. N° 855/08 DT',
    legalFramework: 'Código del Trabajo / Dictamen SUSESO 92064-2025 / DS 40 MinTrab',
    signatureAlgorithm: 'ECDSA-SHA256 (NIST P-256)',
    timeStampingAuthority: 'TSA RFC 3161 - Servidor Horario Oficial SHOA / Subtel Chile',
    certificateAuthority: 'PKI e-CertChile / Subtel Acreditado',
    ipAddress: '190.161.44.18',
    sessionTokenHash: 'TOK-SHA-a8b7c6d5e4f3a2b10987654321fedcba',
    approvalObservations: 'Aprobación del anexo específico del RIOHS previa consulta y ratificación por el Comité Paritario de Higiene y Seguridad (CPHS) de Faena El Teniente y Base Central. Registro de depósito ante la Inspección del Trabajo acreditado bajo folio DT-2026-89104.',
    auditAttestationStatement: 'Se certifica que la reglamentación interna cumple con la exigencia de contener mecanismos de control objetivos, generales y despersonalizados, respetando la dignidad del trabajador.'
  },
  {
    timestamp: '2026-09-02 11:20:44 CLT',
    timestampEpoch: 1788348044000,
    userId: 'usr-lab-01',
    userName: 'Dra. Patricia Alarcón H.',
    userRut: '13.784.102-3',
    userRole: 'Directora Técnica Laboratorio Toxicológico UC-Christus',
    userEmail: 'p.alarcon@laboratorio.cl',
    companyId: 'comp-transandina',
    companyName: 'Transandina Cargo SpA',
    companyRut: '76.432.198-5',
    documentId: 'doc-03',
    documentCode: 'PRT-CUSTODIA-02',
    documentTitle: 'Protocolo Operativo de Toma de Muestras y Cadena de Custodia Toxicológica Inalterable',
    documentVersion: 'v2.1',
    documentCategory: 'cadena_custodia',
    approvalAction: 'firma_electronica_fea',
    approvalStatus: 'aprobado_conforme',
    susesoClauseRef: 'NCh-ISO/IEC 17025:2017 • Circular Técnica N° B21/33 ISP Chile',
    legalFramework: 'Ley N° 19.799 sobre Documentos Electrónicos / Dictamen SUSESO 92064-2025',
    signatureAlgorithm: 'RSA-4096 / SHA-256 FEA (Firma Avanzada Acreditada)',
    timeStampingAuthority: 'TSA RFC 3161 - Servidor Horario Oficial SHOA / Subtel Chile',
    certificateAuthority: 'FirmaGob SEGPRES / Certinet Chile S.A.',
    ipAddress: '200.89.68.45',
    sessionTokenHash: 'TOK-SHA-ff00ee11dd22cc33bb44aa5599887766',
    approvalObservations: 'Validación del circuito de cadena de custodia biológica en dos etapas: screening salival in-situ con tubo de preservación buffer y derivación inmediata bajo sello inviolable para confirmación GC/MS y LC-MS/MS con contramuestra refrigerada.',
    auditAttestationStatement: 'Certifico la plena validez técnica y forense del protocolo para asegurar idoneidad probatoria ante la Superintendencia de Seguridad Social y Tribunales del Trabajo.'
  },
  {
    timestamp: '2026-09-03 09:05:12 CLT',
    timestampEpoch: 1788426312000,
    userId: 'usr-compliance-01',
    userName: 'Dra. Marcela Fuenzalida R.',
    userRut: '14.892.401-2',
    userRole: 'Compliance Officer (Oficial de Cumplimiento)',
    userEmail: 'marcela.fuenzalida@transandinacargo.cl',
    companyId: 'comp-transandina',
    companyName: 'Transandina Cargo SpA',
    companyRut: '76.432.198-5',
    documentId: 'doc-consent-suseso',
    documentCode: 'FORM-CONSENT-BIO-2026',
    documentTitle: 'Formulario de Consentimiento Informado y Tratamiento de Datos Sensibles (Ley N° 19.628)',
    documentVersion: 'v2.0',
    documentCategory: 'consentimiento_informado',
    approvalAction: 'visado_cumplimiento_suseso',
    approvalStatus: 'aprobado_conforme',
    susesoClauseRef: 'Ley N° 19.628 sobre Protección de la Vida Privada • Principio de Reserva Médica SUSESO',
    legalFramework: 'Ley N° 20.584 de Derechos y Deberes de los Pacientes / Dictamen SUSESO 92064-2025',
    signatureAlgorithm: 'ECDSA-SHA256 (NIST P-256)',
    timeStampingAuthority: 'TSA RFC 3161 - Servidor Horario Oficial SHOA / Subtel Chile',
    certificateAuthority: 'PKI e-CertChile / Subtel Acreditado',
    ipAddress: '190.161.44.12',
    sessionTokenHash: 'TOK-SHA-445566778899aabbccddeeff00112233',
    approvalObservations: 'Aprobación del formato de consentimiento con ClaveÚnica o firma biométrica. Se asegura que los resultados médicos permanezcan bajo secreto profesional y solo se transmita al empleador el dictamen operativo binario (Apto / No Apto).',
    auditAttestationStatement: 'Constato que el instrumento resguarda de manera irrestricta los derechos fundamentales de los conductores y da cumplimiento a los estándares de la Circular 3331 SUSESO.'
  },
  {
    timestamp: '2026-09-04 16:10:33 CLT',
    timestampEpoch: 1788538233000,
    userId: 'usr-auditor-01',
    userName: 'Víctor Hugo Contreras',
    userRut: '12.984.331-5',
    userRole: 'Auditor Líder ISO 37301 & Perito Metrológico',
    userEmail: 'v.contreras@auditoriacompliance.cl',
    companyId: 'comp-transandina',
    companyName: 'Transandina Cargo SpA',
    companyRut: '76.432.198-5',
    documentId: 'doc-calib-eq02',
    documentCode: 'CERT-MET-2026-0782',
    documentTitle: 'Certificado de Calibración Metrológica Vigente: Alcotest Portátil Dräger 7510 OIML R 126',
    documentVersion: 'v1.0',
    documentCategory: 'calibracion_metrologica',
    approvalAction: 'inspeccion_auditor_externo',
    approvalStatus: 'aprobado_conforme',
    susesoClauseRef: 'Norma Técnica OIML R 126 • Exigencia Metrológica SUSESO para Instrumentos Probatorios',
    legalFramework: 'Decreto N° 54 INN / Ley de Tránsito 18.290 / Directrices de Calibración 2026',
    signatureAlgorithm: 'RSA-4096 / SHA-256 FEA (Firma Avanzada Acreditada)',
    timeStampingAuthority: 'TSA RFC 3161 - Servidor Horario Oficial SHOA / Subtel Chile',
    certificateAuthority: 'E-Sign Chile S.A. PKI Entrust',
    ipAddress: '186.104.112.90',
    sessionTokenHash: 'TOK-SHA-99887766554433221100ffeeddccbbaa',
    approvalObservations: 'Auditoría metrológica de trazabilidad documental. Equipo DRAG-7510-CL-1044 calibrado por Metrología y Precisión Chile S.A. (acreditado INN LE-810) con desviación comprobada de 0.000 g/L y vencimiento 15/12/2026.',
    auditAttestationStatement: 'Certifico la plena validez legal y metrológica del certificado de calibración frente a auditorías de la Superintendencia de Seguridad Social y fiscalizaciones laborales.'
  },
  {
    timestamp: '2026-09-05 17:30:19 CLT',
    timestampEpoch: 1788629419000,
    userId: 'usr-prev-01',
    userName: 'Ing. Rodrigo Sepúlveda V.',
    userRut: '15.342.981-4',
    userRole: 'Jefe de Prevención de Riesgos (Sernageomin B / SNS)',
    userEmail: 'rodrigo.sepulveda@transandinacargo.cl',
    companyId: 'comp-transandina',
    companyName: 'Transandina Cargo SpA',
    companyRut: '76.432.198-5',
    documentId: 'doc-miper-2026',
    documentCode: 'RSK-MIPER-TRANS-2026',
    documentTitle: 'Matriz MIPER de Riesgos Viales y Evaluación de Intemperancia en Transporte de Alta Montaña',
    documentVersion: 'v3.0',
    documentCategory: 'matriz_riesgo',
    approvalAction: 'visado_cumplimiento_suseso',
    approvalStatus: 'aprobado_conforme',
    susesoClauseRef: 'ISO 39001:2012 Cláusula 6.2 • DS 40 Art. 21 Obligación de Informar',
    legalFramework: 'Ley N° 16.744 de Accidentes del Trabajo / Código del Trabajo Art. 184',
    signatureAlgorithm: 'ECDSA-SHA256 (NIST P-256)',
    timeStampingAuthority: 'TSA RFC 3161 - Servidor Horario Oficial SHOA / Subtel Chile',
    certificateAuthority: 'PKI e-CertChile / Subtel Acreditado',
    ipAddress: '190.161.44.18',
    sessionTokenHash: 'TOK-SHA-33221100aabbccddeeff445566778899',
    approvalObservations: 'Actualización y re-evaluación del riesgo residual para 84 rutas troncales y operaciones en faenas mineras. Controles de alcolock, cámaras IA de fatiga y despachos aleatorios con score residual en rango "Bajo" (2/25).',
    auditAttestationStatement: 'Doy fe técnica de la suficiencia y efectividad de las medidas preventivas implementadas en la matriz MIPER conforme al deber general de seguridad.'
  },
  {
    timestamp: '2026-09-07 12:00:58 CLT',
    timestampEpoch: 1788782458000,
    userId: 'usr-company-admin',
    userName: 'Roberto Cárdenas Silva',
    userRut: '10.892.401-2',
    userRole: 'Administrador de Flota & Operaciones',
    userEmail: 'roberto.cardenas@transandinacargo.cl',
    companyId: 'comp-transandina',
    companyName: 'Transandina Cargo SpA',
    companyRut: '76.432.198-5',
    documentId: 'doc-psico-2026',
    documentCode: 'DOC-PSICO-MUTUAL-2026',
    documentTitle: 'Consolidado de Exámenes Psicosensotécnicos Rigurosos de Conductores de Flota (Mutualidad ACHS)',
    documentVersion: 'v1.2',
    documentCategory: 'psicotecnico_mutual',
    approvalAction: 'revalidacion_periodica_anual',
    approvalStatus: 'aprobado_conforme',
    susesoClauseRef: 'Ley 18.290 Art. 13 • Batería de Exámenes Psicotécnicos de Rigor para Choferes Profesionales',
    legalFramework: 'Decreto Supremo N° 170 MinTrans / Circular N° 3530 SUSESO',
    signatureAlgorithm: 'ECDSA-SHA256 (NIST P-256)',
    timeStampingAuthority: 'TSA RFC 3161 - Servidor Horario Oficial SHOA / Subtel Chile',
    certificateAuthority: 'PKI e-CertChile / Subtel Acreditado',
    ipAddress: '190.161.44.15',
    sessionTokenHash: 'TOK-SHA-7766554433221100aabbccddeeff9988',
    approvalObservations: 'Visado y re-certificación del 100% de las vigencias psicotécnicas de los 42 conductores activos. Cuatro casos con revalidación programada a 30 días con alertas automatizadas.',
    auditAttestationStatement: 'Certifico la verificación individual de aptitud psicosensotécnica para toda la dotación de conductores asignados a tractocamiones y transporte de carga pesada.'
  }
];

/**
 * Builds mathematically chained initial verification log entries.
 * Ensures that block N references the exact hash of block N-1.
 */
export function buildChainedInitialApprovalLogs(): ComplianceDocumentApprovalLog[] {
  const result: ComplianceDocumentApprovalLog[] = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  RAW_APPROVALS.forEach((raw, idx) => {
    const blockIndex = idx + 1;
    const folio = generateVerificationFolio(blockIndex);
    
    // Serialize and compute deterministic SHA-256 hash
    const payload = serializeBlockPayload(
      blockIndex,
      prevHash,
      raw.timestamp,
      raw.userId,
      raw.documentCode,
      raw.documentVersion,
      raw.approvalAction,
      raw.companyId
    );
    const integrityHash = fallbackSha256(payload);

    const logEntry: ComplianceDocumentApprovalLog = {
      id: folio,
      blockIndex,
      timestamp: raw.timestamp,
      timestampEpoch: raw.timestampEpoch,
      userId: raw.userId,
      userName: raw.userName,
      userRut: raw.userRut,
      userRole: raw.userRole,
      userEmail: raw.userEmail,
      companyId: raw.companyId,
      companyName: raw.companyName,
      companyRut: raw.companyRut,
      documentId: raw.documentId,
      documentCode: raw.documentCode,
      documentTitle: raw.documentTitle,
      documentVersion: raw.documentVersion,
      documentCategory: raw.documentCategory,
      approvalAction: raw.approvalAction,
      approvalStatus: raw.approvalStatus,
      susesoClauseRef: raw.susesoClauseRef,
      legalFramework: raw.legalFramework,
      integrityHash,
      previousHash: prevHash,
      signatureAlgorithm: raw.signatureAlgorithm,
      timeStampingAuthority: raw.timeStampingAuthority,
      certificateAuthority: raw.certificateAuthority,
      ipAddress: raw.ipAddress,
      sessionTokenHash: raw.sessionTokenHash,
      approvalObservations: raw.approvalObservations,
      auditAttestationStatement: raw.auditAttestationStatement,
      isChainedValid: true
    };

    result.push(logEntry);
    prevHash = integrityHash; // chain forward
  });

  return result;
}

export const INITIAL_SUSESO_APPROVAL_LOGS: ComplianceDocumentApprovalLog[] = buildChainedInitialApprovalLogs();
