export type RoleType =
  | 'superadmin'
  | 'company_admin'
  | 'compliance_officer'
  | 'prevencionista'
  | 'supervisor'
  | 'test_operator'
  | 'laboratorio'
  | 'auditor'
  | 'gerencia';

export type NavView =
  | 'dashboard'
  | 'integral_service'
  | 'specifications'
  | 'tests'
  | 'random_selection'
  | 'drivers_fleet'
  | 'lab_portal'
  | 'compliance_matrix'
  | 'risks'
  | 'audits'
  | 'documents'
  | 'equipment'
  | 'reports'
  | 'audit_logs'
  | 'architecture'
  | 'api'
  | 'image_studio'
  | 'maps_locator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  companyId: string;
  companyName: string;
  avatar?: string;
  rut: string;
}

export interface Company {
  id: string;
  rut: string;
  businessName: string;
  fantasyName: string;
  economicActivity: string;
  mutualidad: 'ACHS' | 'Mutual de Seguridad' | 'IST' | 'ISL';
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  activeDriversCount: number;
  activeVehiclesCount: number;
  complianceScore: number;
  status: 'active' | 'suspended' | 'audit_pending';
}

export interface Driver {
  id: string;
  companyId: string;
  rut: string;
  fullName: string;
  birthDate: string;
  phone: string;
  email: string;
  licenseClass: ('A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'B')[];
  licenseExpiry: string;
  psychotechnicalExpiry: string; // Examen psicotécnico riguroso
  assignedBase: string;
  status: 'habilitado' | 'bloqueado_preventivo' | 'licencia_medica' | 'en_evaluacion';
  lastTestDate?: string;
  lastTestResult?: 'negativo' | 'positivo_alcohol' | 'positivo_drogas' | 'no_concluyente';
  totalTests: number;
  avatar?: string;
}

export type DriverDocumentType =
  | 'licencia_conducir'
  | 'psicotecnico_mutual'
  | 'consentimiento_suseso'
  | 'anexo_riohs_alcohol'
  | 'odi_riesgos'
  | 'hoja_vida_conductor'
  | 'certificado_antecedentes'
  | 'induccion_alcolock';

export type DigitalSignatureStatus =
  | 'valida_fea' // Firma Electrónica Avanzada (Ley 19.799)
  | 'valida_fes' // Firma Electrónica Simple / ClaveÚnica
  | 'pendiente_firma' // Requiere firma del conductor
  | 'invalida_revocada'; // Certificado revocado o hash alterado

export interface DriverDocument {
  id: string;
  companyId: string;
  driverId: string;
  driverName: string;
  driverRut: string;
  type: DriverDocumentType;
  title: string;
  code: string;
  issuingEntity: string;
  issueDate: string;
  expiryDate: string; // YYYY-MM-DD
  fileSize: string;
  fileName?: string;
  status: 'vigente' | 'por_vencer' | 'vencido';
  // Digital Signature details
  signatureStatus: DigitalSignatureStatus;
  signerName?: string;
  signerRut?: string;
  signedAt?: string;
  signatureHash?: string; // SHA-256
  certificateAuthority?: string; // E-CertChile, Acepta, FirmaGob, Seguridata
  timestampAuthority?: string; // TSA RFC 3161
  isMandatoryForDispatch: boolean; // Si vence o no tiene firma, bloquea despacho
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  certificateSerialNumber?: string;
  algorithm?: string;
}

export interface Vehicle {
  id: string;
  companyId: string;
  plate: string;
  type: 'Tractocamión' | 'Semirremolque / Rampla' | 'Bus Interurbano' | 'Camión Aljibe' | 'Van de Personal';
  brandModel: string;
  year: number;
  technicalReviewExpiry: string;
  soapExpiry: string;
  assignedDriverId?: string;
  hasAlcolock: boolean;
  alcolockStatus?: 'calibrado' | 'bloqueado' | 'requiere_calibracion';
  lastOdometerKm: number;
  status: 'operativo' | 'en_mantencion' | 'bloqueado_seguridad';
}

export type DrugType = 'THC' | 'COC' | 'AMP' | 'MET' | 'OPI' | 'BZO';

export interface DrugPanelResult {
  drug: DrugType;
  name: string;
  cutoff: string;
  result: 'negativo' | 'presunto_positivo' | 'confirmado_positivo' | 'invalido';
}

export interface CustodyChain {
  id: string;
  testId: string;
  sampleCode: string;
  sampleType: 'Saliva' | 'Orina' | 'Sangre';
  collectedAt: string;
  collectedBy: string;
  witnessName?: string;
  sampleTemperatureCelsius: number;
  securitySealNumber: string;
  donorSignatureTimestamp: string;
  donorSigned: boolean;
  labId?: string;
  labName?: string;
  receptionAtLabTimestamp?: string;
  receptionConfirmedBy?: string;
  analysisMethod?: 'GC-MS' | 'LC-MS/MS' | 'Inmunoensayo Cuantitativo';
  confirmedResult?: 'negativo' | 'positivo_thc' | 'positivo_coc' | 'positivo_multiple' | 'muestra_adulterada';
  labReportUrl?: string;
  status: 'en_custodia_terreno' | 'en_transito_lab' | 'en_analisis' | 'confirmado_lab' | 'muestra_rechazada';
}

export interface TestRecord {
  id: string;
  code: string;
  companyId: string;
  driverId: string;
  driverName: string;
  driverRut: string;
  driverBase: string;
  vehiclePlate?: string;
  reason: 'Aleatorio' | 'Pre-turno' | 'Post-incidente' | 'Sospecha fundada' | 'Reintegro laboral';
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorRut: string;
  
  // Alcohol
  alcoholTested: boolean;
  alcoholDeviceModel: string;
  alcoholDeviceSerial: string;
  alcoholDeviceCalibrationExpiry: string;
  alcoholValueGramsPerLiter: number;
  alcoholStatus: 'negativo' | 'positivo_infraccion' | 'positivo_ebriedad' | 'rechaza_test';
  
  // Drogas
  drugsTested: boolean;
  drugKitModel: string;
  drugKitLot: string;
  drugPanelResults: DrugPanelResult[];
  drugsOverallStatus: 'negativo' | 'presunto_positivo' | 'confirmado_positivo' | 'rechaza_test' | 'no_aplica';

  // Overall Decision
  overallStatus: 'apto_despacho' | 'no_apto_bloqueado' | 'en_espera_lab' | 'invalido';
  observations?: string;
  custodyChainId?: string;
  geolocation?: { lat: number; lng: number; locationName: string };
  evidencePhotoUrl?: string;
}

export interface RandomSelectionBatch {
  id: string;
  batchNumber: string;
  createdAt: string;
  executedBy: string;
  companyId: string;
  base: string;
  samplePercentage: number;
  totalEligible: number;
  totalSelected: number;
  seedHash: string;
  status: 'generada' | 'en_ejecucion' | 'completada';
  selectedDriverIds: string[];
  completedDriverIds: string[];
}

export interface EquipmentServiceRecord {
  id: string;
  date: string;
  type: 'calibracion_periodica' | 'mantenimiento_preventivo' | 'cambio_sensor_fuel_cell' | 'ajuste_metrologico' | 'actualizacion_firmware' | 'verificacion_terreno';
  laboratory: string;
  certificateNumber?: string;
  technicianName: string;
  result: 'aprobado_conforme' | 'ajustado_conforme' | 'rechazado_fuera_tolerancia' | 'en_proceso';
  observations: string;
  nextCalibrationDueDate: string;
  deviationGramsPerLiter?: number;
  certificatePdfUrl?: string;
}

export interface Equipment {
  id: string;
  companyId: string;
  code?: string;
  type: string;
  brandModel: string;
  serialNumber: string;
  assignedBase: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  calibrationCertificateNumber?: string;
  calibrationCertificateUrl?: string;
  calibrationLab?: string;
  status: string;
  manufacturingYear?: number;
  sensorType?: string;
  firmwareVersion?: string;
  totalTestsPerformed?: number;
  qrPayloadUrl?: string;
  serviceHistory?: EquipmentServiceRecord[];
}

export interface LegalNormItem {
  id: string;
  code: string;
  body: string;
  article: string;
  title: string;
  requirement: string;
  applicability: string;
  complianceLevel: 'cumple_total' | 'cumple_parcial' | 'no_cumple' | 'en_revision' | string;
  evidenceDoc: string;
  lastEvaluatedAt: string;
  evaluator: string;
  mandatoryEvidenceUploaded: boolean;
}

export interface RiskItem {
  id: string;
  companyId: string;
  code: string;
  process: string;
  dangerHazard?: string;
  hazard?: string;
  consequence?: string;
  eventConsequence?: string;
  inherentProbability?: number;
  probability?: number;
  inherentImpact?: number;
  impact?: number;
  inherentRiskScore?: number;
  inherentScore?: number;
  inherentLevel?: string;
  riskCategory?: string;
  mitigationControls?: string;
  controls?: string[] | string;
  residualProbability?: number;
  residualImpact?: number;
  residualRiskScore?: number;
  residualScore?: number;
  residualLevel?: string;
  residualRiskCategory?: string;
  responsible?: string;
  owner?: string;
  status: string;
  lastReviewDate?: string;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  code: string;
  standardClause: string;
  type: string;
  description: string;
  evidence: string;
  status: string;
  assignedTo: string;
  dueDate: string;
  correctiveAction?: string;
  rootCauseAnalysis?: string;
  closedAt?: string;
}

export type FindingItem = AuditFinding;

export interface Audit {
  id: string;
  code?: string;
  companyId?: string;
  title: string;
  type: string;
  leadAuditor?: string;
  auditorLeader?: string;
  startDate?: string;
  endDate?: string;
  scheduledDate?: string;
  score?: number;
  scope?: string;
  status: string;
  findingsCount?: number | {
    critical: number;
    minor: number;
    improvements: number;
  };
}

export type AuditProgram = Audit;

export interface DocumentItem {
  id: string;
  companyId: string;
  code: string;
  title: string;
  category?: string;
  type?: string;
  version: string;
  legalBasis?: string;
  expiryDate?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  fileSize?: string;
  status: string;
  lastReviewDate?: string;
  approvedBy?: string;
  digitalSignatureHash?: string;
  totalSignaturesCount?: number;
  pendingSignaturesCount?: number;
  url?: string;
}

export interface AlertItem {
  id: string;
  companyId: string;
  type: string;
  severity: 'alta' | 'media' | 'informativa';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  resolved: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'test' | 'driver' | 'equipment' | 'audit' | 'custody' | string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  actorId?: string;
  userName?: string;
  actorName?: string;
  userRole?: string;
  actorRole?: string;
  actorRut?: string;
  module?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details: any;
  ipAddress: string;
  integrityHash?: string;
  hash?: string;
}

export type AuditLog = AuditLogEntry;
