import { SafetyRiskThresholds, SafetyManagerRecipient, SafetyEmailLog } from '../types';

export const INITIAL_SAFETY_THRESHOLDS: SafetyRiskThresholds = {
  maxAllowedAlcoholGramsPerLiter: 0.00, // Tolerancia Cero absoluta (Ley 18.290 / Ley Emilia)
  positivityRateCriticalThresholdPercent: 0.50, // Meta Corporativa ISO 39001 / SUSESO (< 0.50%)
  shiftClusterAlertCount: 2, // 2 o más no aptos en una faena/turno
  notifyOnAlcoholPositive: true,
  notifyOnDrugReactive: true,
  notifyOnTestRefusal: true,
  notifyOnPostIncident: true,
  autoTriggerEnabled: true,
};

export const INITIAL_SAFETY_RECIPIENTS: SafetyManagerRecipient[] = [
  {
    id: 'rec-01',
    name: 'Ing. Rodrigo Sepúlveda',
    email: 'prevencion@transandinacargo.cl',
    role: 'Jefe de Prevención de Riesgos',
    phone: '+56 9 7841 2290',
    organization: 'Depto. Prevención de Riesgos (Reg. SNS 42.190)',
    active: true,
    receivesImmediateCritical: true,
    receivesShiftSummary: true,
  },
  {
    id: 'rec-02',
    name: 'Dra. Marcela Fuenzalida',
    email: 'compliance@transandinacargo.cl',
    role: 'Oficial de Cumplimiento Normativo',
    phone: '+56 9 8452 1104',
    organization: 'Dirección Legal & Cumplimiento SUSESO / ISO 37301',
    active: true,
    receivesImmediateCritical: true,
    receivesShiftSummary: true,
  },
  {
    id: 'rec-03',
    name: 'Gonzalo Navarro R.',
    email: 'operaciones@transandinacargo.cl',
    role: 'Supervisor General de Operaciones y Flota',
    phone: '+56 9 6732 9908',
    organization: 'Gerencia de Operaciones y Transporte',
    active: true,
    receivesImmediateCritical: true,
    receivesShiftSummary: false,
  },
  {
    id: 'rec-04',
    name: 'Comité Paritario CPHS',
    email: 'cphs.seguridad@transandinacargo.cl',
    role: 'Presidente CPHS (Representante Trabajadores)',
    phone: '+56 9 5541 3320',
    organization: 'Comité Paritario de Higiene y Seguridad',
    active: true,
    receivesImmediateCritical: true,
    receivesShiftSummary: true,
  },
  {
    id: 'rec-05',
    name: 'Auditoría & Centro de Monitoreo',
    email: 'blindajevial@gmail.com',
    role: 'Auditor de Seguridad Operacional',
    phone: '+56 2 2899 4400',
    organization: 'Centro de Control Blindaje Vial 360',
    active: true,
    receivesImmediateCritical: true,
    receivesShiftSummary: true,
  },
];

export const INITIAL_SAFETY_EMAIL_LOGS: SafetyEmailLog[] = [
  {
    id: 'log-email-01',
    timestamp: '2026-08-30 06:46',
    alertType: 'critical_test_threshold',
    severity: 'CRITICA',
    subject: '[ALERTA CRÍTICA] Umbral de Riesgo Superado en Control CTR-2026-0842 - Cristian Alejandro Vera Carrasco (Base Santiago Norte)',
    testCode: 'CTR-2026-0842',
    driverName: 'Cristian Alejandro Vera Carrasco',
    driverRut: '16.890.312-7',
    baseName: 'Base Santiago Norte',
    vehiclePlate: 'LP-XT-89',
    triggeredThresholds: [
      'Reactividad presunta en panel salival de drogas: Marihuana (THC 15 ng/mL)',
      'Activación de bloqueo inmediato de despacho vehicular por protocolo Tolerancia Cero',
      'Custodia de muestra salival requerida para contra-verificación en laboratorio NCh-ISO 17025',
    ],
    recipients: [
      'prevencion@transandinacargo.cl',
      'compliance@transandinacargo.cl',
      'operaciones@transandinacargo.cl',
      'cphs.seguridad@transandinacargo.cl',
      'blindajevial@gmail.com',
    ],
    summaryText: 'Alerta automática despachada a Jefes de Seguridad. Conductor Cristian Vera con examen reactivo a THC en control aleatorio de turno. Despacho inhabilitado.',
    htmlBody: '',
    deliveryStatus: 'entregado',
    legalProtocolRef: 'SUSESO 92064-2025 • Art. 184 Código del Trabajo • Ley 18.290',
    dispatchedBy: 'Motor Automático de Alertas Blindaje Vial',
    actionChecklist: [
      'Confirmar bloqueo en garita de pesaje y retiro de llaves de tracto LP-XT-89',
      'Sellar contramuestra salival con precinto de seguridad e iniciar cadena de custodia CC-2026-0842',
      'Notificar a Mutual de Seguridad y convocar reunión extraordinaria del CPHS',
    ],
    executiveRecommendations: [
      'Incompatibilidad absoluta para la conducción de transporte de carga peligrosa',
      'Preservar la confidencialidad médica según Ley 19.628',
      'Remitir muestra a Laboratorio UC-Christus para confirmación GC-MS',
    ],
  },
];
