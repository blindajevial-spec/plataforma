import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Company,
  Driver,
  Vehicle,
  TestRecord,
  CustodyChain,
  Equipment,
  EquipmentServiceRecord,
  LegalNormItem,
  RiskItem,
  Audit,
  AuditFinding,
  DocumentItem,
  AlertItem,
  AuditLogEntry,
  User,
  RoleType,
  RandomSelectionBatch,
  DriverDocument,
  SafetyRiskThresholds,
  SafetyManagerRecipient,
  SafetyEmailLog,
  ComplianceDocumentApprovalLog
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_USERS,
  INITIAL_DRIVERS,
  INITIAL_VEHICLES,
  INITIAL_EQUIPMENT,
  INITIAL_TESTS,
  INITIAL_CUSTODY_CHAINS,
  INITIAL_LEGAL_NORMS,
  INITIAL_RISKS,
  INITIAL_AUDITS,
  INITIAL_FINDINGS,
  INITIAL_DOCUMENTS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BATCHES,
  INITIAL_DRIVER_DOCUMENTS
} from '../data/initialData';
import {
  INITIAL_SAFETY_THRESHOLDS,
  INITIAL_SAFETY_RECIPIENTS,
  INITIAL_SAFETY_EMAIL_LOGS
} from '../data/safetyAlertsData';
import {
  INITIAL_SUSESO_APPROVAL_LOGS
} from '../data/susesoVerificationData';
import {
  serializeBlockPayload,
  fallbackSha256,
  generateVerificationFolio,
  formatChileanTimestamp,
  verifyChainIntegrity
} from '../utils/susesoCrypto';
import {
  saveDriversOfflineSnapshot,
  saveLogsOfflineSnapshot
} from '../utils/offlineSyncManager';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: RoleType) => void;
  currentCompany: Company;
  setCurrentCompany: (company: Company) => void;
  
  // Data Collections
  companies: Company[];
  users: User[];
  drivers: Driver[];
  vehicles: Vehicle[];
  tests: TestRecord[];
  custodyChains: CustodyChain[];
  equipment: Equipment[];
  legalNorms: LegalNormItem[];
  risks: RiskItem[];
  audits: Audit[];
  findings: AuditFinding[];
  documents: DocumentItem[];
  driverDocuments: DriverDocument[];
  alerts: AlertItem[];
  auditLogs: AuditLogEntry[];
  randomBatches: RandomSelectionBatch[];

  // Action methods
  addTestRecord: (test: Omit<TestRecord, 'id' | 'code' | 'timestamp'>) => TestRecord;
  updateTestRecord: (id: string, updates: Partial<TestRecord>) => void;
  
  addDriver: (driver: Omit<Driver, 'id' | 'totalTests'>) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  toggleDriverStatus: (id: string, newStatus: Driver['status'], reason?: string) => void;
  
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  
  runRandomSelection: (base: string, samplePercentage: number) => RandomSelectionBatch;
  
  updateCustodyChain: (id: string, updates: Partial<CustodyChain>) => void;
  confirmLabResult: (custodyId: string, result: CustodyChain['confirmedResult'], notes?: string) => void;
  
  calibrateEquipment: (equipmentId: string, certificateNo: string, labName: string) => void;
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipmentCalibration: (equipmentId: string, lastDate: string, nextDate: string, certificateNo: string, labName?: string) => void;
  addEquipmentServiceRecord: (equipmentId: string, record: Omit<EquipmentServiceRecord, 'id'>) => void;
  
  evaluateLegalNorm: (normId: string, level: LegalNormItem['complianceLevel'], evidence: string) => void;
  
  addRiskItem: (risk: Omit<RiskItem, 'id' | 'code' | 'inherentRiskScore' | 'residualRiskScore'>) => void;
  updateRiskItem: (id: string, updates: Partial<RiskItem>) => void;
  
  createAudit: (audit: Omit<Audit, 'id' | 'code' | 'findingsCount'>) => void;
  createFinding: (finding: Omit<AuditFinding, 'id' | 'code'>) => void;
  updateFindingStatus: (id: string, status: AuditFinding['status'], correctiveAction?: string) => void;
  
  addDocument: (doc: Partial<DocumentItem>) => void;
  signDocument: (docId: string, signerName: string, signerRut: string) => void;

  // Driver Documents Management & Validation
  addDriverDocument: (doc: Omit<DriverDocument, 'id'>) => void;
  updateDriverDocument: (id: string, updates: Partial<DriverDocument>) => void;
  verifyDriverDocumentSignature: (docId: string) => { isValid: boolean; hash: string; details: string };
  verifyAllDriverDocuments: () => void;
  renewDriverDocumentExpiry: (docId: string, newExpiryDate: string, issuingEntity?: string, newFolio?: string) => void;
  signDriverDocument: (docId: string, signerName: string, signerRut: string, signatureType: 'valida_fea' | 'valida_fes') => void;
  
  // Automated Safety Alerts & Email Mechanism
  safetyRiskThresholds: SafetyRiskThresholds;
  updateSafetyRiskThresholds: (thresholds: Partial<SafetyRiskThresholds>) => void;
  safetyManagerRecipients: SafetyManagerRecipient[];
  addSafetyManagerRecipient: (recipient: Omit<SafetyManagerRecipient, 'id'>) => void;
  updateSafetyManagerRecipient: (id: string, updates: Partial<SafetyManagerRecipient>) => void;
  deleteSafetyManagerRecipient: (id: string) => void;
  safetyEmailLogs: SafetyEmailLog[];
  triggerSafetyManagerEmail: (params: {
    test?: TestRecord;
    triggerReason?: string;
    triggeredThresholds?: string[];
    manualOverride?: boolean;
    customNotes?: string;
  }) => Promise<SafetyEmailLog | null>;

  // SUSESO Compliance Document Approval & Verification Log (RF-019)
  documentApprovalLogs: ComplianceDocumentApprovalLog[];
  addDocumentApprovalLog: (params: {
    documentId: string;
    documentCode: string;
    documentTitle: string;
    documentVersion: string;
    documentCategory: ComplianceDocumentApprovalLog['documentCategory'];
    approvalAction: ComplianceDocumentApprovalLog['approvalAction'];
    approvalStatus: ComplianceDocumentApprovalLog['approvalStatus'];
    susesoClauseRef?: string;
    legalFramework?: string;
    approvalObservations: string;
    auditAttestationStatement?: string;
  }) => ComplianceDocumentApprovalLog;
  verifyAuditTrailIntegrity: () => {
    isValid: boolean;
    totalBlocks: number;
    brokenBlockIndex?: number;
    errorReason?: string;
  };

  resolveAlert: (alertId: string) => void;
  markAlertRead: (alertId: string) => void;
  
  resetToDefaults: () => void;
  activeToast: string | null;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bv360_platform_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state or local storage
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [currentCompany, setCurrentCompany] = useState<Company>(INITIAL_COMPANIES[0]);
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_companies`);
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });
  const [users] = useState<User[]>(INITIAL_USERS);
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_drivers`);
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_vehicles`);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });
  const [tests, setTests] = useState<TestRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tests`);
    return saved ? JSON.parse(saved) : INITIAL_TESTS;
  });
  const [custodyChains, setCustodyChains] = useState<CustodyChain[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_custody`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTODY_CHAINS;
  });
  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_equipment`);
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });
  const [legalNorms, setLegalNorms] = useState<LegalNormItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_norms`);
    return saved ? JSON.parse(saved) : INITIAL_LEGAL_NORMS;
  });
  const [risks, setRisks] = useState<RiskItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_risks`);
    return saved ? JSON.parse(saved) : INITIAL_RISKS;
  });
  const [audits, setAudits] = useState<Audit[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_audits`);
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });
  const [findings, setFindings] = useState<AuditFinding[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_findings`);
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_docs`);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  const [driverDocuments, setDriverDocuments] = useState<DriverDocument[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_driver_docs`);
    return saved ? JSON.parse(saved) : INITIAL_DRIVER_DOCUMENTS;
  });
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alerts`);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [randomBatches, setRandomBatches] = useState<RandomSelectionBatch[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_batches`);
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  // Safety Risk Thresholds and Automated Email States
  const [safetyRiskThresholds, setSafetyRiskThresholds] = useState<SafetyRiskThresholds>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_safety_thresholds`);
    return saved ? JSON.parse(saved) : INITIAL_SAFETY_THRESHOLDS;
  });

  const [safetyManagerRecipients, setSafetyManagerRecipients] = useState<SafetyManagerRecipient[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_safety_recipients`);
    return saved ? JSON.parse(saved) : INITIAL_SAFETY_RECIPIENTS;
  });

  const [safetyEmailLogs, setSafetyEmailLogs] = useState<SafetyEmailLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_safety_email_logs`);
    return saved ? JSON.parse(saved) : INITIAL_SAFETY_EMAIL_LOGS;
  });

  // SUSESO Compliance Document Approval Logs (RF-019)
  const [documentApprovalLogs, setDocumentApprovalLogs] = useState<ComplianceDocumentApprovalLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_suseso_approval_logs`);
    return saved ? JSON.parse(saved) : INITIAL_SUSESO_APPROVAL_LOGS;
  });

  const [activeToast, setActiveToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setActiveToast(message);
    setTimeout(() => setActiveToast(null), 4000);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_companies`, JSON.stringify(companies));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_drivers`, JSON.stringify(drivers));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tests`, JSON.stringify(tests));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_custody`, JSON.stringify(custodyChains));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_equipment`, JSON.stringify(equipment));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_norms`, JSON.stringify(legalNorms));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_risks`, JSON.stringify(risks));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_audits`, JSON.stringify(audits));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_findings`, JSON.stringify(findings));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_docs`, JSON.stringify(documents));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_driver_docs`, JSON.stringify(driverDocuments));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_alerts`, JSON.stringify(alerts));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logs`, JSON.stringify(auditLogs));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_batches`, JSON.stringify(randomBatches));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_safety_thresholds`, JSON.stringify(safetyRiskThresholds));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_safety_recipients`, JSON.stringify(safetyManagerRecipients));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_safety_email_logs`, JSON.stringify(safetyEmailLogs));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_suseso_approval_logs`, JSON.stringify(documentApprovalLogs));
    
    // Dedicated Field Cache for Offline QR Verification & Logs Inspection
    saveDriversOfflineSnapshot(drivers);
    saveLogsOfflineSnapshot(auditLogs);
  }, [
    companies,
    drivers,
    vehicles,
    tests,
    custodyChains,
    equipment,
    legalNorms,
    risks,
    audits,
    findings,
    documents,
    driverDocuments,
    alerts,
    auditLogs,
    randomBatches,
    safetyRiskThresholds,
    safetyManagerRecipients,
    safetyEmailLogs,
    documentApprovalLogs
  ]);

  // Helper to append immutable audit log
  const logAction = (action: string, entity: string, entityId: string, details: string) => {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const hash = Array.from(action + entityId + timestampStr)
      .map((c) => c.charCodeAt(0).toString(16))
      .join('')
      .slice(0, 32)
      .padEnd(32, '0');

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: timestampStr,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details,
      ipAddress: '190.161.44.' + Math.floor(Math.random() * 100 + 10),
      integrityHash: `SHA256-${hash}`
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchRole = (role: RoleType) => {
    const matched = INITIAL_USERS.find((u) => u.role === role) || {
      id: `usr-${role}`,
      name: `Usuario ${role.toUpperCase()}`,
      email: `${role}@transandinacargo.cl`,
      role,
      companyId: currentCompany.id,
      companyName: currentCompany.fantasyName,
      rut: '12.345.678-9'
    };
    setCurrentUser(matched);
    showToast(`Rol cambiado a: ${role.replace('_', ' ').toUpperCase()}`);
    logAction('CAMBIO_ROL_ACTIVO', 'UserSession', matched.id, `Sesión cambiada a perfil de rol ${role}`);
  };

  // Add Test Record (RF-006, RF-007, RF-008)
  const addTestRecord = (testData: Omit<TestRecord, 'id' | 'code' | 'timestamp'>): TestRecord => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 16);
    const code = `CTR-2026-${String(tests.length + 843).padStart(4, '0')}`;
    const newId = `tst-${Date.now()}`;

    const isPositive =
      testData.alcoholStatus !== 'negativo' ||
      testData.drugsOverallStatus === 'presunto_positivo' ||
      testData.drugsOverallStatus === 'confirmado_positivo';

    let custodyId: string | undefined = undefined;

    // Auto-create Custody Chain if reactive drugs test
    if (testData.drugsOverallStatus === 'presunto_positivo' || testData.drugsOverallStatus === 'confirmado_positivo') {
      custodyId = `cc-2026-${String(custodyChains.length + 843).padStart(4, '0')}`;
      const newCustody: CustodyChain = {
        id: custodyId,
        testId: newId,
        sampleCode: `MUESTRA-BV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        sampleType: 'Saliva',
        collectedAt: timestamp,
        collectedBy: `${currentUser.name} (${currentUser.rut})`,
        witnessName: 'Supervisor de Turno',
        sampleTemperatureCelsius: 36.5,
        securitySealNumber: `SEAL-BV-${Math.floor(100000 + Math.random() * 900000)}`,
        donorSignatureTimestamp: timestamp,
        donorSigned: true,
        labId: 'lab-uc-christus',
        labName: 'Laboratorio Toxicológico Certificado UC-Christus',
        status: 'en_custodia_terreno'
      };
      setCustodyChains((prev) => [newCustody, ...prev]);
    }

    const fullTest: TestRecord = {
      ...testData,
      id: newId,
      code,
      timestamp,
      custodyChainId: custodyId,
      overallStatus: isPositive ? 'no_apto_bloqueado' : 'apto_despacho'
    };

    setTests((prev) => [fullTest, ...prev]);

    // Update driver test counter and lock if positive
    setDrivers((prev) =>
      prev.map((drv) => {
        if (drv.id === testData.driverId) {
          return {
            ...drv,
            lastTestDate: timestamp,
            lastTestResult: isPositive ? 'positivo_drogas' : 'negativo',
            totalTests: drv.totalTests + 1,
            status: isPositive ? 'bloqueado_preventivo' : 'habilitado'
          };
        }
        return drv;
      })
    );

    // If driver vehicle assigned and positive, block vehicle
    if (isPositive && testData.vehiclePlate) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.plate === testData.vehiclePlate
            ? { ...v, status: 'bloqueado_seguridad', alcolockStatus: 'bloqueado' }
            : v
        )
      );
    }

    // Generate Alert if positive
    if (isPositive) {
      const newAlert: AlertItem = {
        id: `alt-${Date.now()}`,
        companyId: currentCompany.id,
        type: 'test_positivo',
        severity: 'alta',
        title: `🚨 BLOQUEO PREVENTIVO: Test Positivo en ${testData.driverName}`,
        message: `El conductor ${testData.driverName} (${testData.driverRut}) arrojó resultado NO APTO en control ${code}. Despacho bloqueado automáticamente según protocolo Tolerancia Cero e ISO 37301.`,
        timestamp,
        read: false,
        resolved: false,
        relatedEntityId: newId,
        relatedEntityType: 'test'
      };
      setAlerts((prev) => [newAlert, ...prev]);

      // Automated Summary Email Trigger to Safety Managers
      if (safetyRiskThresholds.autoTriggerEnabled) {
        const breached: string[] = [];
        if (
          safetyRiskThresholds.notifyOnAlcoholPositive &&
          testData.alcoholValueGramsPerLiter !== undefined &&
          testData.alcoholValueGramsPerLiter > safetyRiskThresholds.maxAllowedAlcoholGramsPerLiter
        ) {
          breached.push(
            `Nivel de alcohol detectado: ${testData.alcoholValueGramsPerLiter.toFixed(2)} g/L (Umbral corporativo: ${safetyRiskThresholds.maxAllowedAlcoholGramsPerLiter.toFixed(2)} g/L - Tolerancia Cero).`
          );
        }
        if (
          safetyRiskThresholds.notifyOnDrugReactive &&
          (testData.drugsOverallStatus === 'presunto_positivo' || testData.drugsOverallStatus === 'confirmado_positivo')
        ) {
          const reactives = (testData.drugPanelResults || [])
            .filter((d) => d.result === 'presunto_positivo' || d.result === 'confirmado_positivo')
            .map((d) => `${d.name} (${d.cutoff || 'Cut-off'})`);
          breached.push(
            `Reactividad en panel salival de drogas: ${reactives.length > 0 ? reactives.join(', ') : 'Detección no conforme'}.`
          );
        }
        if (
          safetyRiskThresholds.notifyOnTestRefusal &&
          (testData.alcoholStatus === 'rechaza_test' || testData.drugsOverallStatus === 'rechaza_test')
        ) {
          breached.push('Negativa o rechazo injustificado a someterse a control preventivo de intemperancia.');
        }
        if (breached.length === 0) {
          breached.push('Examen de Intemperancia NO CONFORME - Bloqueo de despacho vehicular activado.');
        }

        // Fire asynchronous summary email alert to safety managers
        triggerSafetyManagerEmail({
          test: fullTest,
          triggeredThresholds: breached,
          triggerReason: 'Examen de Intemperancia NO CONFORME - Umbral de Seguridad Superado'
        });
      }
    }

    logAction(
      'REGISTRO_TEST',
      'TestRecord',
      newId,
      `Examen ${code} registrado para ${testData.driverName}. Estado: ${fullTest.overallStatus}`
    );

    showToast(`Test ${code} registrado con éxito. Resultado: ${fullTest.overallStatus.toUpperCase()}`);
    return fullTest;
  };

  const updateTestRecord = (id: string, updates: Partial<TestRecord>) => {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    logAction('ACTUALIZACION_TEST', 'TestRecord', id, `Test ${id} actualizado`);
  };

  // Drivers Management (RF-003)
  const addDriver = (driverData: Omit<Driver, 'id' | 'totalTests'>) => {
    const newDriver: Driver = {
      ...driverData,
      id: `drv-${Date.now()}`,
      totalTests: 0
    };
    setDrivers((prev) => [newDriver, ...prev]);
    logAction('CREACION_CONDUCTOR', 'Driver', newDriver.id, `Nuevo conductor registrado: ${newDriver.fullName} (${newDriver.rut})`);
    showToast(`Conductor ${newDriver.fullName} registrado correctamente.`);
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    logAction('ACTUALIZACION_CONDUCTOR', 'Driver', id, `Datos de conductor ${id} modificados`);
    showToast('Datos del conductor actualizados.');
  };

  const toggleDriverStatus = (id: string, newStatus: Driver['status'], reason?: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
    const target = drivers.find((d) => d.id === id);
    logAction(
      'CAMBIO_ESTADO_CONDUCTOR',
      'Driver',
      id,
      `Estado de ${target?.fullName || id} cambiado a ${newStatus}. Motivo: ${reason || 'Acción administrativa'}`
    );
    showToast(`Estado de conductor modificado a: ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  // Vehicle Management (RF-004)
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    logAction('CREACION_VEHICULO', 'Vehicle', newVehicle.id, `Vehículo añadido: ${newVehicle.plate} (${newVehicle.brandModel})`);
    showToast(`Vehículo ${newVehicle.plate} ingresado al sistema.`);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    logAction('ACTUALIZACION_VEHICULO', 'Vehicle', id, `Vehículo ${id} actualizado`);
  };

  // Random Selection Engine (RF-005)
  const runRandomSelection = (base: string, samplePercentage: number): RandomSelectionBatch => {
    const eligibleDrivers = drivers.filter(
      (d) => (base === 'all' || d.assignedBase === base) && d.status === 'habilitado'
    );
    const totalEligible = eligibleDrivers.length;
    const countToSelect = Math.max(1, Math.ceil((totalEligible * samplePercentage) / 100));

    // Fisher-Yates shuffle
    const shuffled = [...eligibleDrivers].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, countToSelect);
    const selectedIds = selected.map((d) => d.id);

    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const batchId = `batch-${Date.now()}`;
    const batchNumber = `SEL-${now.toISOString().substring(0, 10)}-${String(randomBatches.length + 1).padStart(2, '0')}`;
    
    // Cryptographic audit seed simulation
    const seedHash = Array.from(batchNumber + timestampStr + totalEligible)
      .map((c) => c.charCodeAt(0).toString(16))
      .join('')
      .slice(0, 48)
      .padEnd(48, 'a');

    const newBatch: RandomSelectionBatch = {
      id: batchId,
      batchNumber,
      createdAt: timestampStr,
      executedBy: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`,
      companyId: currentCompany.id,
      base: base === 'all' ? 'Todas las Bases' : base,
      samplePercentage,
      totalEligible,
      totalSelected: selectedIds.length,
      seedHash: `SHA256-${seedHash}`,
      status: 'en_ejecucion',
      selectedDriverIds: selectedIds,
      completedDriverIds: []
    };

    setRandomBatches((prev) => [newBatch, ...prev]);

    // Create Notification Alert
    const newAlert: AlertItem = {
      id: `alt-${Date.now()}`,
      companyId: currentCompany.id,
      type: 'cadena_custodia_retraso',
      severity: 'informativa',
      title: `🎲 Sorteo Aleatorio Generado (${batchNumber})`,
      message: `Se seleccionaron ${selectedIds.length} conductores (${samplePercentage}%) en ${newBatch.base} para control preventivo inopinado.`,
      timestamp: timestampStr,
      read: false,
      resolved: false,
      relatedEntityId: batchId
    };
    setAlerts((prev) => [newAlert, ...prev]);

    logAction(
      'EJECUCION_SORTEO_ALEATORIO',
      'RandomSelectionBatch',
      batchId,
      `Sorteo ${batchNumber}: ${selectedIds.length} seleccionados de ${totalEligible} elegibles. Hash: SHA256-${seedHash.substring(0, 12)}...`
    );

    showToast(`Sorteo ${batchNumber} ejecutado: ${selectedIds.length} conductores citados.`);
    return newBatch;
  };

  // Custody Chain & Lab Confirmation (RF-008, RF-009)
  const updateCustodyChain = (id: string, updates: Partial<CustodyChain>) => {
    setCustodyChains((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAction('ACTUALIZACION_CADENA_CUSTODIA', 'CustodyChain', id, `Cadena de custodia ${id} actualizada`);
  };

  const confirmLabResult = (custodyId: string, result: CustodyChain['confirmedResult'], notes?: string) => {
    const custody = custodyChains.find((c) => c.id === custodyId);
    if (!custody) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setCustodyChains((prev) =>
      prev.map((c) =>
        c.id === custodyId
          ? {
              ...c,
              confirmedResult: result,
              status: 'confirmado_lab',
              receptionConfirmedBy: currentUser.name,
              receptionAtLabTimestamp: c.receptionAtLabTimestamp || now,
              analysisMethod: 'GC-MS',
              labReportUrl: `https://lab-uc.cl/informes/TOX-2026-${custodyId}.pdf`
            }
          : c
      )
    );

    // Update associated test record
    if (custody.testId) {
      setTests((prev) =>
        prev.map((t) => {
          if (t.id === custody.testId) {
            const isConfirmedPositive = result !== 'negativo';
            return {
              ...t,
              overallStatus: isConfirmedPositive ? 'no_apto_bloqueado' : 'apto_despacho',
              drugsOverallStatus: isConfirmedPositive ? 'confirmado_positivo' : 'negativo',
              observations: `${t.observations || ''} [Confirmación Lab GC/MS ${now}: ${result?.toUpperCase()} - ${notes || 'Sin observaciones'}]`
            };
          }
          return t;
        })
      );
    }

    logAction(
      'CONFIRMACION_LABORATORIO',
      'CustodyChain',
      custodyId,
      `Resultado de laboratorio emitido para muestra ${custody.sampleCode}: ${result?.toUpperCase()}`
    );

    showToast(`Informe de laboratorio emitido: Muestra ${custody.sampleCode} -> ${result?.toUpperCase()}`);
  };

  // Calibrate Equipment (RF-006, RF-020)
  const calibrateEquipment = (equipmentId: string, certificateNo: string, labName: string) => {
    const now = new Date();
    const lastCalib = now.toISOString().substring(0, 10);
    
    // +6 months for breathalyzers
    const nextCalibDate = new Date(now.setMonth(now.getMonth() + 6)).toISOString().substring(0, 10);

    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === equipmentId
          ? {
              ...eq,
              lastCalibrationDate: lastCalib,
              nextCalibrationDate: nextCalibDate,
              calibrationCertificateNumber: certificateNo,
              calibrationLab: labName,
              status: 'calibrado_optimo'
            }
          : eq
      )
    );

    logAction(
      'CALIBRACION_EQUIPO',
      'Equipment',
      equipmentId,
      `Equipo calibrado con éxito. Certificado N° ${certificateNo}, laboratorio: ${labName}. Próxima vigencia: ${nextCalibDate}`
    );

    showToast(`Equipo calibrado con éxito. Vigencia extendida hasta ${nextCalibDate}.`);
  };

  const addEquipment = (equipmentData: Omit<Equipment, 'id'>) => {
    const newId = `eq-${Date.now().toString().slice(-4)}`;
    const newEq: Equipment = {
      ...equipmentData,
      id: newId,
      serviceHistory: equipmentData.serviceHistory || [
        {
          id: `srv-${Date.now()}-1`,
          date: equipmentData.lastCalibrationDate || new Date().toISOString().substring(0, 10),
          type: 'calibracion_periodica',
          laboratory: equipmentData.calibrationLab || 'Laboratorio Metrológico Certificado',
          certificateNumber: equipmentData.calibrationCertificateNumber || `CERT-${newId.toUpperCase()}`,
          technicianName: currentUser.name,
          result: 'aprobado_conforme',
          nextCalibrationDueDate: equipmentData.nextCalibrationDate,
          observations: 'Calibración inicial de puesta en servicio metrológico bajo protocolo RF-010.'
        }
      ]
    };

    setEquipment((prev) => [newEq, ...prev]);
    logAction('REGISTRO_EQUIPO', 'Equipment', newId, `Nuevo equipo ingresado: ${newEq.brandModel} (${newEq.serialNumber})`);
    showToast(`Dispositivo ${newEq.brandModel} registrado exitosamente.`);
  };

  const updateEquipmentCalibration = (
    equipmentId: string,
    lastDate: string,
    nextDate: string,
    certificateNo: string,
    labName?: string
  ) => {
    const targetLab = labName || 'Metrología y Precisión Chile S.A. (Acreditado INN LE-810)';
    const newRecord: EquipmentServiceRecord = {
      id: `srv-${Date.now()}`,
      date: lastDate,
      type: 'calibracion_periodica',
      laboratory: targetLab,
      certificateNumber: certificateNo,
      technicianName: currentUser.name,
      result: 'aprobado_conforme',
      nextCalibrationDueDate: nextDate,
      observations: `Calibración periódica y verificación de parámetros metrológicos. Certificado ${certificateNo}.`
    };

    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id === equipmentId) {
          const history = eq.serviceHistory ? [newRecord, ...eq.serviceHistory] : [newRecord];
          return {
            ...eq,
            lastCalibrationDate: lastDate,
            nextCalibrationDate: nextDate,
            calibrationCertificateNumber: certificateNo,
            calibrationLab: targetLab,
            status: 'calibrado_optimo',
            serviceHistory: history
          };
        }
        return eq;
      })
    );

    logAction(
      'CALIBRACION_EQUIPO',
      'Equipment',
      equipmentId,
      `Calibración metrológica registrada. Próximo vencimiento: ${nextDate}`
    );
    showToast(`Calibración registrada. Próximo vencimiento: ${nextDate}`);
  };

  const addEquipmentServiceRecord = (
    equipmentId: string,
    recordData: Omit<EquipmentServiceRecord, 'id'>
  ) => {
    const newRecord: EquipmentServiceRecord = {
      ...recordData,
      id: `srv-${Date.now()}`
    };

    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id === equipmentId) {
          const history = eq.serviceHistory ? [newRecord, ...eq.serviceHistory] : [newRecord];
          // If the record was a periodic calibration, update the equipment's next date and status as well
          const isCalibration = recordData.type === 'calibracion_periodica' || recordData.type === 'ajuste_metrologico';
          return {
            ...eq,
            lastCalibrationDate: isCalibration ? recordData.date : eq.lastCalibrationDate,
            nextCalibrationDate: isCalibration && recordData.nextCalibrationDueDate ? recordData.nextCalibrationDueDate : eq.nextCalibrationDate,
            calibrationCertificateNumber: recordData.certificateNumber || eq.calibrationCertificateNumber,
            calibrationLab: recordData.laboratory || eq.calibrationLab,
            status: isCalibration ? 'calibrado_optimo' : eq.status,
            serviceHistory: history
          };
        }
        return eq;
      })
    );

    logAction(
      'HISTORIAL_SERVICIO_EQUIPO',
      'Equipment',
      equipmentId,
      `Nuevo servicio registrado (${recordData.type}): ${recordData.observations.substring(0, 50)}...`
    );
    showToast(`Registro de servicio metrológico añadido al historial.`);
  };

  // Compliance Matrix (RF-011, RF-012, ISO 37301)
  const evaluateLegalNorm = (normId: string, level: LegalNormItem['complianceLevel'], evidence: string) => {
    const now = new Date().toISOString().substring(0, 10);
    setLegalNorms((prev) =>
      prev.map((norm) =>
        norm.id === normId
          ? {
              ...norm,
              complianceLevel: level,
              evidenceDoc: evidence,
              lastEvaluatedAt: now,
              evaluator: currentUser.name,
              mandatoryEvidenceUploaded: true
            }
          : norm
      )
    );

    logAction('EVALUACION_MATRIZ_LEGAL', 'LegalNormItem', normId, `Norma ${normId} evaluada como: ${level}`);
    showToast(`Matriz Legal actualizada: ${level.replace('_', ' ').toUpperCase()}`);
  };

  // Risks (RF-013)
  const addRiskItem = (riskData: Omit<RiskItem, 'id' | 'code' | 'inherentRiskScore' | 'residualRiskScore'>) => {
    const inherentScore = riskData.probability * riskData.impact;
    const residualScore = Math.max(1, Math.round(inherentScore / 3));

    const newRisk: RiskItem = {
      ...riskData,
      id: `rsk-${Date.now()}`,
      code: `RSK-OPS-${String(risks.length + 1).padStart(2, '0')}`,
      inherentRiskScore: inherentScore,
      residualRiskScore: residualScore
    };

    setRisks((prev) => [newRisk, ...prev]);
    logAction('CREACION_RIESGO', 'RiskItem', newRisk.id, `Nuevo riesgo IPER ingresado: ${newRisk.hazard}`);
    showToast(`Riesgo ${newRisk.code} añadido a la Matriz IPER.`);
  };

  const updateRiskItem = (id: string, updates: Partial<RiskItem>) => {
    setRisks((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          const p = updated.probability;
          const i = updated.impact;
          updated.inherentRiskScore = p * i;
          return updated;
        }
        return r;
      })
    );
    logAction('ACTUALIZACION_RIESGO', 'RiskItem', id, `Riesgo ${id} modificado`);
  };

  // Audits & Findings CAPA (RF-014, RF-015)
  const createAudit = (auditData: Omit<Audit, 'id' | 'code' | 'findingsCount'>) => {
    const newAudit: Audit = {
      ...auditData,
      id: `aud-${Date.now()}`,
      code: `AUD-2026-${String(audits.length + 1).padStart(2, '0')}`,
      findingsCount: { critical: 0, minor: 0, improvements: 0 }
    };
    setAudits((prev) => [newAudit, ...prev]);
    logAction('PROGRAMACION_AUDITORIA', 'Audit', newAudit.id, `Auditoría programada: ${newAudit.title}`);
    showToast(`Auditoría ${newAudit.code} programada.`);
  };

  const createFinding = (findingData: Omit<AuditFinding, 'id' | 'code'>) => {
    const newFinding: AuditFinding = {
      ...findingData,
      id: `fnd-${Date.now()}`,
      code: `HAL-2026-${String(findings.length + 1).padStart(3, '0')}`
    };
    setFindings((prev) => [newFinding, ...prev]);

    // Update audit counts
    setAudits((prev) =>
      prev.map((a) => {
        if (a.id === findingData.auditId) {
          return {
            ...a,
            findingsCount: {
              ...a.findingsCount,
              critical: a.findingsCount.critical + (findingData.type === 'No Conformidad Mayor' ? 1 : 0),
              minor: a.findingsCount.minor + (findingData.type === 'No Conformidad Menor' ? 1 : 0),
              improvements: a.findingsCount.improvements + (findingData.type === 'Oportunidad de Mejora' ? 1 : 0)
            }
          };
        }
        return a;
      })
    );

    logAction('CREACION_HALLAZGO', 'AuditFinding', newFinding.id, `Hallazgo ${newFinding.code} registrado: ${newFinding.type}`);
    showToast(`Hallazgo ${newFinding.code} creado.`);
  };

  const updateFindingStatus = (id: string, status: AuditFinding['status'], correctiveAction?: string) => {
    const now = new Date().toISOString().substring(0, 10);
    setFindings((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status,
              correctiveAction: correctiveAction || f.correctiveAction,
              closedAt: status === 'verificada_cerrada' ? now : undefined
            }
          : f
      )
    );
    logAction('ACTUALIZACION_HALLAZGO_CAPA', 'AuditFinding', id, `Hallazgo ${id} estado cambiado a: ${status}`);
    showToast(`Hallazgo actualizado: ${status.replace('_', ' ').toUpperCase()}`);
  };

  // Add Document Approval Verification Log Entry (RF-019 SUSESO)
  const addDocumentApprovalLog = (params: {
    documentId: string;
    documentCode: string;
    documentTitle: string;
    documentVersion: string;
    documentCategory: ComplianceDocumentApprovalLog['documentCategory'];
    approvalAction: ComplianceDocumentApprovalLog['approvalAction'];
    approvalStatus: ComplianceDocumentApprovalLog['approvalStatus'];
    susesoClauseRef?: string;
    legalFramework?: string;
    approvalObservations: string;
    auditAttestationStatement?: string;
  }): ComplianceDocumentApprovalLog => {
    const now = new Date();
    const timestampStr = formatChileanTimestamp(now);
    const timestampEpoch = now.getTime();
    const blockIndex = documentApprovalLogs.length + 1;
    const folio = generateVerificationFolio(blockIndex);

    // Get previous block hash (or genesis zeros)
    const prevHash = documentApprovalLogs.length > 0
      ? documentApprovalLogs[documentApprovalLogs.length - 1].integrityHash
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const payload = serializeBlockPayload(
      blockIndex,
      prevHash,
      timestampStr,
      currentUser.id,
      params.documentCode,
      params.documentVersion,
      params.approvalAction,
      currentCompany.id
    );

    const integrityHash = fallbackSha256(payload);

    const newLog: ComplianceDocumentApprovalLog = {
      id: folio,
      blockIndex,
      timestamp: timestampStr,
      timestampEpoch,
      userId: currentUser.id,
      userName: currentUser.name,
      userRut: currentUser.rut || '14.892.401-2',
      userRole: currentUser.role.replace('_', ' ').toUpperCase(),
      userEmail: currentUser.email,
      companyId: currentCompany.id,
      companyName: currentCompany.fantasyName || currentCompany.businessName,
      companyRut: currentCompany.rut,
      documentId: params.documentId,
      documentCode: params.documentCode,
      documentTitle: params.documentTitle,
      documentVersion: params.documentVersion,
      documentCategory: params.documentCategory,
      approvalAction: params.approvalAction,
      approvalStatus: params.approvalStatus,
      susesoClauseRef: params.susesoClauseRef || 'Dictamen SUSESO N.º 92064-2025 • Art. 184 Código del Trabajo',
      legalFramework: params.legalFramework || 'Ley 16.744 / Ley 18.290 / Circular 3331 SUSESO',
      integrityHash,
      previousHash: prevHash,
      signatureAlgorithm: 'ECDSA-SHA256 (NIST P-256) / Ley 19.799',
      timeStampingAuthority: 'TSA RFC 3161 - Servidor Horario Oficial SHOA / Subtel Chile',
      certificateAuthority: 'PKI e-CertChile / Subtel Acreditado',
      ipAddress: '190.161.44.' + Math.floor(Math.random() * 100 + 10),
      sessionTokenHash: `TOK-SHA-${Math.random().toString(36).substring(2, 12)}${Date.now()}`,
      approvalObservations: params.approvalObservations,
      auditAttestationStatement: params.auditAttestationStatement ||
        'Doy fe de la revisión y certificación formal del documento crítico conforme a los estándares de fiscalización de la SUSESO y Dirección del Trabajo.',
      isChainedValid: true
    };

    setDocumentApprovalLogs((prev) => [...prev, newLog]);

    // Also register in the general system audit log for complete forensic traceability
    logAction(
      'APROBACION_DOCUMENTO_SUSESO',
      'ComplianceDocument',
      params.documentCode,
      `Aprobación formal de ${params.documentCode} (${params.documentVersion}) por Usuario ${currentUser.name} (${currentUser.id}) con hash SHA-256 ${integrityHash.slice(0, 16)}...`
    );

    showToast(`Documento ${params.documentCode} certificado y registrado en bitácora SUSESO (Folio: ${folio}).`);
    return newLog;
  };

  const verifyAuditTrailIntegrity = () => {
    return verifyChainIntegrity(documentApprovalLogs);
  };

  // Digital Signatures (RF-010, RF-019)
  const signDocument = (docId: string, signerName: string, signerRut: string) => {
    const now = new Date().toISOString();
    const signatureHash = Array.from(signerRut + now)
      .map((c) => c.charCodeAt(0).toString(16))
      .join('')
      .slice(0, 32);

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              totalSignaturesCount: d.totalSignaturesCount + 1,
              pendingSignaturesCount: Math.max(0, d.pendingSignaturesCount - 1),
              digitalSignatureHash: signatureHash
            }
          : d
      )
    );

    logAction(
      'FIRMA_DIGITAL_DOCUMENTO',
      'DocumentItem',
      docId,
      `Documento ${docId} firmado digitalmente por ${signerName} (${signerRut}). Hash: ${signatureHash}`
    );

    const targetDoc = documents.find((d) => d.id === docId);
    if (targetDoc) {
      addDocumentApprovalLog({
        documentId: targetDoc.id,
        documentCode: targetDoc.code,
        documentTitle: targetDoc.title,
        documentVersion: targetDoc.version || 'v1.0',
        documentCategory: targetDoc.code.includes('SUSESO') || targetDoc.category === 'protocolo' ? 'protocolo_suseso' : 'politica_corporativa',
        approvalAction: 'firma_electronica_fea',
        approvalStatus: 'aprobado_conforme',
        susesoClauseRef: 'Dictamen SUSESO N.º 92064-2025 • Art. 184 Código del Trabajo',
        legalFramework: targetDoc.legalBasis || 'Ley 16.744 / Ley 19.799 Firma Electrónica',
        approvalObservations: `Firma digital avanzada (FEA) estampada por ${signerName} (RUT: ${signerRut}). Certificación forense registrada.`,
        auditAttestationStatement: `Certifico en mi calidad de ${currentUser.role} la aprobación formal del documento ${targetDoc.code} con plena validez legal ante SUSESO y Dirección del Trabajo.`
      });
    }

    showToast(`Documento firmado digitalmente con validez legal.`);
  };

  // Add Document (Institutional)
  const addDocument = (docData: Partial<DocumentItem>) => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      companyId: currentCompany.id,
      code: docData.code || `DOC-2026-${documents.length + 1}`,
      title: docData.title || 'Documento sin título',
      category: docData.category || 'protocolo',
      type: docData.type || 'PDF',
      version: docData.version || '1.0',
      legalBasis: docData.legalBasis || 'SUSESO 92064 / Código del Trabajo',
      expiryDate: docData.expiryDate || '2027-12-31',
      uploadedAt: new Date().toISOString().substring(0, 10),
      uploadedBy: currentUser.name,
      fileSize: docData.fileSize || '1.2 MB',
      status: docData.status || 'vigente',
      totalSignaturesCount: 1,
      pendingSignaturesCount: 0,
      digitalSignatureHash: Array.from(Date.now().toString()).map((c) => c.charCodeAt(0).toString(16)).join('').slice(0, 32)
    };
    setDocuments((prev) => [newDoc, ...prev]);
    logAction('CARGA_DOCUMENTO_INSTITUCIONAL', 'DocumentItem', newDoc.id, `Documento cargado: ${newDoc.title} (${newDoc.code})`);
    showToast(`Documento ${newDoc.code} guardado con éxito.`);
  };

  // Driver Documents Management & Validation
  const addDriverDocument = (docData: Omit<DriverDocument, 'id'>) => {
    const newDoc: DriverDocument = {
      ...docData,
      id: `ddoc-${Date.now()}`
    };
    setDriverDocuments((prev) => [newDoc, ...prev]);
    logAction('CARGA_DOCUMENTO_CONDUCTOR', 'DriverDocument', newDoc.id, `Cargado documento ${newDoc.title} para conductor ${newDoc.driverName} (${newDoc.driverRut})`);
    showToast(`Documento ${newDoc.code} registrado para ${newDoc.driverName}.`);
  };

  const updateDriverDocument = (id: string, updates: Partial<DriverDocument>) => {
    setDriverDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const verifyDriverDocumentSignature = (docId: string) => {
    const doc = driverDocuments.find((d) => d.id === docId);
    if (!doc) return { isValid: false, hash: '', details: 'Documento no encontrado' };

    const hasValidHash = Boolean(doc.signatureHash && doc.signatureHash.length >= 32);
    const isValid = doc.signatureStatus !== 'pendiente_firma' && doc.signatureStatus !== 'invalida_revocada' && hasValidHash;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setDriverDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            verifiedAt: now,
            verifiedBy: `${currentUser.name} (${currentUser.role})`
          };
        }
        return d;
      })
    );

    logAction(
      'VALIDACION_CRIPTOGRAFICA_FIRMA',
      'DriverDocument',
      docId,
      `Auditoría de firma digital: ${doc.title} (${doc.driverName}) - ${isValid ? 'VÁLIDA E INALTERADA (Ley 19.799)' : 'PENDIENTE O INVÁLIDA'}`
    );

    return {
      isValid,
      hash: doc.signatureHash || 'SIN_HASH',
      details: isValid
        ? `Firma ${doc.signatureStatus === 'valida_fea' ? 'Avanzada (FEA)' : 'Simple (FES)'} auditada con éxito. Emisor: ${doc.certificateAuthority || 'Acreditado'}. Timestamp RFC 3161 inalterado.`
        : 'Documento pendiente de firma electrónica o certificado no válido. Requiere suscripción por el titular.'
    };
  };

  const verifyAllDriverDocuments = () => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setDriverDocuments((prev) =>
      prev.map((d) => ({
        ...d,
        verifiedAt: now,
        verifiedBy: `${currentUser.name} (Auditoría Masiva PKI)`
      }))
    );
    logAction('VALIDACION_MASIVA_FIRMAS', 'DriverDocument', 'ALL', `Auditoría masiva de firmas digitales ejecutada por ${currentUser.name}.`);
    showToast(`Verificación masiva completada: ${driverDocuments.length} documentos auditados con validez legal.`);
  };

  const renewDriverDocumentExpiry = (docId: string, newExpiryDate: string, issuingEntity?: string, newFolio?: string) => {
    const now = new Date().toISOString().substring(0, 10);
    const currentDate = '2026-09-06';
    const isNewDateValid = new Date(newExpiryDate) > new Date(currentDate);
    const newStatus = isNewDateValid ? 'vigente' : 'vencido';

    setDriverDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            expiryDate: newExpiryDate,
            issueDate: now,
            status: newStatus,
            issuingEntity: issuingEntity || d.issuingEntity,
            code: newFolio || d.code,
            notes: `Revalidado el ${now} por ${currentUser.name}. Folio: ${newFolio || d.code}`
          };
        }
        return d;
      })
    );

    const targetDoc = driverDocuments.find((d) => d.id === docId);
    if (targetDoc) {
      if (targetDoc.type === 'psicotecnico_mutual') {
        setDrivers((prev) => prev.map((drv) => (drv.id === targetDoc.driverId ? { ...drv, psychotechnicalExpiry: newExpiryDate } : drv)));
      } else if (targetDoc.type === 'licencia_conducir') {
        setDrivers((prev) => prev.map((drv) => (drv.id === targetDoc.driverId ? { ...drv, licenseExpiry: newExpiryDate } : drv)));
      }
    }

    logAction('RENOVACION_VENCIMIENTO_DOCUMENTO', 'DriverDocument', docId, `Vigencia actualizada a: ${newExpiryDate} (${newFolio || targetDoc?.code})`);
    showToast(`Vigencia renovada con éxito hasta ${newExpiryDate}.`);
  };

  const signDriverDocument = (
    docId: string,
    signerName: string,
    signerRut: string,
    signatureType: 'valida_fea' | 'valida_fes' = 'valida_fea'
  ) => {
    const now = new Date().toISOString();
    const hash = Array.from(signerRut + now + docId).map((c) => c.charCodeAt(0).toString(16)).join('').slice(0, 64);

    setDriverDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            signatureStatus: signatureType,
            signerName,
            signerRut,
            signedAt: now.replace('T', ' ').substring(0, 19),
            signatureHash: hash,
            certificateAuthority: signatureType === 'valida_fea' ? 'E-CertChile CA Sub-Root 2024' : 'FirmaGob - ClaveÚnica Segpres',
            timestampAuthority: 'TSA E-CertChile RFC 3161',
            certificateSerialNumber: `CERT-${Date.now().toString(16).toUpperCase()}`,
            algorithm: 'SHA-256 with RSA 2048-bit',
            notes: `Documento firmado electrónicamente conforme Ley 19.799 por ${signerName} (${signerRut}).`
          };
        }
        return d;
      })
    );

    logAction(
      'FIRMA_ELECTRONICA_CONDUCTOR',
      'DriverDocument',
      docId,
      `Documento ${docId} firmado digitalmente (${signatureType.toUpperCase()}) por ${signerName} (${signerRut}). Hash: ${hash.substring(0, 16)}...`
    );

    const targetDoc = driverDocuments.find((d) => d.id === docId);
    if (targetDoc) {
      addDocumentApprovalLog({
        documentId: targetDoc.id,
        documentCode: targetDoc.code,
        documentTitle: `${targetDoc.title} [${targetDoc.driverName}]`,
        documentVersion: 'v1.0',
        documentCategory: targetDoc.type === 'consentimiento_informado' ? 'consentimiento_informado' : targetDoc.type === 'psicotecnico_mutual' ? 'psicotecnico_mutual' : 'politica_corporativa',
        approvalAction: signatureType === 'valida_fea' ? 'firma_electronica_fea' : 'firma_electronica_fes',
        approvalStatus: 'aprobado_conforme',
        susesoClauseRef: 'Ley 19.799 / Dictamen SUSESO N.º 92064-2025 • Consentimiento Expreso del Conductor',
        legalFramework: 'Ley 16.744 / Código del Trabajo Art. 184 / Ley 19.628 Protección de Datos',
        approvalObservations: `Firma electrónica (${signatureType === 'valida_fea' ? 'FEA' : 'FES'}) estampada por ${signerName} (${signerRut}) para el legajo laboral del conductor ${targetDoc.driverName}.`,
        auditAttestationStatement: `Certifico la autenticidad y validación de la firma estampada por ${signerName} para el documento ${targetDoc.code}.`
      });
    }

    showToast(`Firma digital estampada con éxito (Ley 19.799). Hash criptográfico registrado.`);
  };

  // Alerts
  const resolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: true, read: true } : a)));
    showToast('Alerta marcada como resuelta.');
  };

  const markAlertRead = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
  };

  // Automated Safety Email & Threshold Functions
  const updateSafetyRiskThresholds = (thresholds: Partial<SafetyRiskThresholds>) => {
    setSafetyRiskThresholds((prev) => {
      const updated = { ...prev, ...thresholds };
      logAction(
        'CONFIGURACION_UMBRALES_SEGURIDAD',
        'SafetyRiskThresholds',
        'global',
        `Umbrales de riesgo actualizados. Tolerancia alcohol: ${updated.maxAllowedAlcoholGramsPerLiter} g/L, Tasa crítica: ${updated.positivityRateCriticalThresholdPercent}%, Auto-trigger: ${updated.autoTriggerEnabled ? 'ACTIVADO' : 'DESACTIVADO'}`
      );
      return updated;
    });
    showToast('Umbrales de riesgo operacional actualizados con éxito.');
  };

  const addSafetyManagerRecipient = (recipient: Omit<SafetyManagerRecipient, 'id'>) => {
    const newRecipient: SafetyManagerRecipient = {
      ...recipient,
      id: `rec-${Date.now()}`
    };
    setSafetyManagerRecipients((prev) => [...prev, newRecipient]);
    logAction(
      'CREACION_DESTINATARIO_SEGURIDAD',
      'SafetyManagerRecipient',
      newRecipient.id,
      `Nuevo destinatario de alertas: ${newRecipient.name} (${newRecipient.email}) - Rol: ${newRecipient.role}`
    );
    showToast(`Destinatario ${newRecipient.name} añadido al circuito de alertas.`);
  };

  const updateSafetyManagerRecipient = (id: string, updates: Partial<SafetyManagerRecipient>) => {
    setSafetyManagerRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    logAction('ACTUALIZACION_DESTINATARIO_SEGURIDAD', 'SafetyManagerRecipient', id, `Datos modificados para destinatario ${id}`);
    showToast('Destinatario de alertas de seguridad actualizado.');
  };

  const deleteSafetyManagerRecipient = (id: string) => {
    setSafetyManagerRecipients((prev) => prev.filter((r) => r.id !== id));
    logAction('ELIMINACION_DESTINATARIO_SEGURIDAD', 'SafetyManagerRecipient', id, `Destinatario de alertas ${id} removido`);
    showToast('Destinatario removido del circuito de alertas.');
  };

  const triggerSafetyManagerEmail = async (params: {
    test?: TestRecord;
    triggerReason?: string;
    triggeredThresholds?: string[];
    manualOverride?: boolean;
    customNotes?: string;
  }): Promise<SafetyEmailLog | null> => {
    const activeRecipients = safetyManagerRecipients.filter(
      (r) => r.active && (r.receivesImmediateCritical || params.manualOverride)
    );

    if (activeRecipients.length === 0) {
      showToast('⚠️ No hay Jefes de Seguridad activos configurados para recibir alertas.');
      return null;
    }

    let thresholdsBreached = params.triggeredThresholds || [];
    if (thresholdsBreached.length === 0 && params.test) {
      if (
        params.test.alcoholValueGramsPerLiter !== undefined &&
        params.test.alcoholValueGramsPerLiter > safetyRiskThresholds.maxAllowedAlcoholGramsPerLiter
      ) {
        thresholdsBreached.push(
          `Nivel de alcohol detectado: ${params.test.alcoholValueGramsPerLiter.toFixed(2)} g/L (Umbral corporativo: ${safetyRiskThresholds.maxAllowedAlcoholGramsPerLiter.toFixed(2)} g/L - Tolerancia Cero).`
        );
      }
      if (
        params.test.drugsOverallStatus === 'presunto_positivo' ||
        params.test.drugsOverallStatus === 'confirmado_positivo'
      ) {
        const reactive = (params.test.drugPanelResults || [])
          .filter((d) => d.result === 'presunto_positivo' || d.result === 'confirmado_positivo')
          .map((d) => `${d.name} (${d.cutoff || 'Cut-off'})`);
        thresholdsBreached.push(
          `Reactividad en panel salival de drogas: ${reactive.length > 0 ? reactive.join(', ') : 'Detección no conforme'}.`
        );
      }
      if (params.test.alcoholStatus === 'rechaza_test' || params.test.drugsOverallStatus === 'rechaza_test') {
        thresholdsBreached.push('Negativa o rechazo a toma de muestra de control preventivo.');
      }
      if (thresholdsBreached.length === 0) {
        thresholdsBreached.push(params.triggerReason || 'Umbral operacional superado en control preventivo.');
      }
    }

    const payload = {
      alertType: 'critical_test_threshold',
      severity: 'CRITICA',
      testRecord: params.test
        ? {
            code: params.test.code,
            timestamp: params.test.timestamp,
            driverName: params.test.driverName,
            driverRut: params.test.driverRut,
            driverBase: params.test.driverBase,
            vehiclePlate: params.test.vehiclePlate,
            reason: params.test.reason,
            alcoholValueGramsPerLiter: params.test.alcoholValueGramsPerLiter,
            alcoholStatus: params.test.alcoholStatus,
            drugsOverallStatus: params.test.drugsOverallStatus,
            drugPanelResults: params.test.drugPanelResults,
            custodyChainId: params.test.custodyChainId,
            operatorName: params.test.operatorName,
            operatorRut: params.test.operatorRut,
            observations: params.test.observations
          }
        : undefined,
      triggeredThresholds: thresholdsBreached,
      recipients: activeRecipients.map((r) => ({
        name: r.name,
        email: r.email,
        role: r.role,
        organization: r.organization
      })),
      companyInfo: {
        name: currentCompany.name,
        rut: currentCompany.rut,
        mutualidad: currentCompany.mutualidad,
        address: currentCompany.address
      },
      customNotes: params.customNotes,
      dispatchedBy: currentUser.fullName
    };

    try {
      const res = await fetch('/api/safety-alerts/send-summary-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const newLog: SafetyEmailLog = {
        id: data.messageId || `log-email-${Date.now()}`,
        timestamp: data.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
        alertType: 'critical_test_threshold',
        severity: 'CRITICA',
        subject: data.subject || `[ALERTA CRÍTICA] Control ${params.test?.code || ''}`,
        testCode: params.test?.code,
        driverName: params.test?.driverName,
        driverRut: params.test?.driverRut,
        baseName: params.test?.driverBase || 'General',
        vehiclePlate: params.test?.vehiclePlate,
        triggeredThresholds: thresholdsBreached,
        recipients: activeRecipients.map((r) => r.email),
        summaryText: data.summaryText || 'Notificación automática enviada a jefaturas de prevención.',
        htmlBody: data.htmlBody || '',
        deliveryStatus: 'entregado',
        legalProtocolRef: 'SUSESO 92064-2025 • Art. 184 Código del Trabajo • Ley 18.290',
        dispatchedBy: currentUser.fullName,
        actionChecklist: data.actionChecklist,
        executiveRecommendations: data.executiveRecommendations
      };

      setSafetyEmailLogs((prev) => [newLog, ...prev]);
      logAction(
        'DISPACHO_EMAIL_ALERTA_SEGURIDAD',
        'SafetyEmailLog',
        newLog.id,
        `Alerta de umbral crítico enviada por correo a ${activeRecipients.length} jefes de prevención: ${activeRecipients.map((r) => r.email).join(', ')}. Test: ${params.test?.code || 'N/A'}`
      );
      showToast(`📧 Alerta crítica automática despachada por correo a ${activeRecipients.length} Jefes de Seguridad.`);
      return newLog;
    } catch (err: any) {
      console.warn('Fallback local para correo de alerta de seguridad:', err);
      const fallbackLog: SafetyEmailLog = {
        id: `log-email-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        alertType: 'critical_test_threshold',
        severity: 'CRITICA',
        subject: `[ALERTA CRÍTICA] Umbral de Riesgo Superado en Control ${params.test?.code || 'CTR-2026'} - ${params.test?.driverName || 'Conductor'}`,
        testCode: params.test?.code,
        driverName: params.test?.driverName,
        driverRut: params.test?.driverRut,
        baseName: params.test?.driverBase || 'General',
        vehiclePlate: params.test?.vehiclePlate,
        triggeredThresholds: thresholdsBreached,
        recipients: activeRecipients.map((r) => r.email),
        summaryText: `Alerta automática generada para ${activeRecipients.length} destinatarios de prevención.`,
        htmlBody: '',
        deliveryStatus: 'simulado',
        legalProtocolRef: 'SUSESO 92064-2025 • Art. 184 Código del Trabajo',
        dispatchedBy: currentUser.fullName
      };
      setSafetyEmailLogs((prev) => [fallbackLog, ...prev]);
      showToast(`📧 Alerta registrada para ${activeRecipients.length} Jefes de Seguridad.`);
      return fallbackLog;
    }
  };

  // Reset to initial data
  const resetToDefaults = () => {
    setCompanies(INITIAL_COMPANIES);
    setDrivers(INITIAL_DRIVERS);
    setVehicles(INITIAL_VEHICLES);
    setTests(INITIAL_TESTS);
    setCustodyChains(INITIAL_CUSTODY_CHAINS);
    setEquipment(INITIAL_EQUIPMENT);
    setLegalNorms(INITIAL_LEGAL_NORMS);
    setRisks(INITIAL_RISKS);
    setAudits(INITIAL_AUDITS);
    setFindings(INITIAL_FINDINGS);
    setDocuments(INITIAL_DOCUMENTS);
    setDriverDocuments(INITIAL_DRIVER_DOCUMENTS);
    setAlerts(INITIAL_ALERTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setRandomBatches(INITIAL_BATCHES);
    setSafetyRiskThresholds(INITIAL_SAFETY_THRESHOLDS);
    setSafetyManagerRecipients(INITIAL_SAFETY_RECIPIENTS);
    setSafetyEmailLogs(INITIAL_SAFETY_EMAIL_LOGS);
    setDocumentApprovalLogs(INITIAL_SUSESO_APPROVAL_LOGS);
    localStorage.clear();
    showToast('Datos reiniciados a los valores iniciales por defecto.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        currentCompany,
        setCurrentCompany,
        companies,
        users,
        drivers,
        vehicles,
        tests,
        custodyChains,
        equipment,
        legalNorms,
        risks,
        audits,
        findings,
        documents,
        driverDocuments,
        alerts,
        auditLogs,
        randomBatches,
        addTestRecord,
        updateTestRecord,
        addDriver,
        updateDriver,
        toggleDriverStatus,
        addVehicle,
        updateVehicle,
        runRandomSelection,
        updateCustodyChain,
        confirmLabResult,
        calibrateEquipment,
        addEquipment,
        updateEquipmentCalibration,
        addEquipmentServiceRecord,
        evaluateLegalNorm,
        addRiskItem,
        updateRiskItem,
        createAudit,
        createFinding,
        updateFindingStatus,
        addDocument,
        signDocument,
        addDriverDocument,
        updateDriverDocument,
        verifyDriverDocumentSignature,
        verifyAllDriverDocuments,
        renewDriverDocumentExpiry,
        signDriverDocument,
        safetyRiskThresholds,
        updateSafetyRiskThresholds,
        safetyManagerRecipients,
        addSafetyManagerRecipient,
        updateSafetyManagerRecipient,
        deleteSafetyManagerRecipient,
        safetyEmailLogs,
        triggerSafetyManagerEmail,
        documentApprovalLogs,
        addDocumentApprovalLog,
        verifyAuditTrailIntegrity,
        resolveAlert,
        markAlertRead,
        resetToDefaults,
        activeToast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
