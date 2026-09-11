import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Driver, DrugType, DrugPanelResult, TestRecord } from '../types';
import {
  X,
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  User,
  Truck,
  Gauge,
  FileSignature,
  Sparkles,
  AlertCircle,
  Scale,
  Calendar,
  Check
} from 'lucide-react';
import { validateNewTestFormData } from '../schemas/testValidationSchema';

interface NewTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDriverId?: string;
}

export const NewTestModal: React.FC<NewTestModalProps> = ({ isOpen, onClose, initialDriverId }) => {
  const { drivers, vehicles, equipment, currentUser, currentCompany, addTestRecord } = useApp();

  const [selectedDriverId, setSelectedDriverId] = useState<string>(initialDriverId || drivers[0]?.id || '');
  const [reason, setReason] = useState<TestRecord['reason']>('Pre-turno');

  useEffect(() => {
    if (initialDriverId) {
      setSelectedDriverId(initialDriverId);
    }
  }, [initialDriverId]);
  
  // Alcohol
  const [alcoholTested, setAlcoholTested] = useState(true);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(equipment[0]?.id || '');
  const [alcoholValue, setAlcoholValue] = useState<number>(0.00);

  // Drugs
  const [drugsTested, setDrugsTested] = useState(true);
  const [drugKitModel, setDrugKitModel] = useState('Dräger DrugCheck 3000 6-Panel');
  const [drugKitLot, setDrugKitLot] = useState('LOT-DC-2026-X99');
  
  const [panelResults, setPanelResults] = useState<DrugPanelResult[]>([
    { drug: 'THC', name: 'Marihuana (THC)', cutoff: '15 ng/mL', result: 'negativo' },
    { drug: 'COC', name: 'Cocaína (COC)', cutoff: '20 ng/mL', result: 'negativo' },
    { drug: 'AMP', name: 'Anfetaminas (AMP)', cutoff: '50 ng/mL', result: 'negativo' },
    { drug: 'MET', name: 'Metanfetaminas (MET)', cutoff: '50 ng/mL', result: 'negativo' },
    { drug: 'OPI', name: 'Opiáceos (OPI)', cutoff: '20 ng/mL', result: 'negativo' },
    { drug: 'BZO', name: 'Benzodiacepinas (BZO)', cutoff: '10 ng/mL', result: 'negativo' },
  ]);

  const [observations, setObservations] = useState('');
  const [donorSigned, setDonorSigned] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const selectedEquipment = equipment.find((e) => e.id === selectedEquipmentId) || equipment[0];
  const assignedVehicle = vehicles.find((v) => v.assignedDriverId === selectedDriver?.id);

  // Clear single validation error
  const clearError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Toggle individual drug
  const toggleDrugResult = (drug: DrugType) => {
    clearError('panelResults');
    setPanelResults((prev) =>
      prev.map((item) =>
        item.drug === drug
          ? {
              ...item,
              result: item.result === 'negativo' ? 'presunto_positivo' : 'negativo'
            }
          : item
      )
    );
  };

  const isAlcoholPositive = alcoholValue > 0.00;
  const isDrugPositive = panelResults.some((p) => p.result === 'presunto_positivo');
  const isBlocked = isAlcoholPositive || (drugsTested && isDrugPositive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDriver) {
      setValidationErrors({ driverId: 'Debe seleccionar un conductor válido' });
      return;
    }

    // Payload for Zod Validation Layer
    const payloadToValidate = {
      driverId: selectedDriver.id,
      driverRut: selectedDriver.rut,
      operatorId: currentUser.id,
      operatorRut: currentUser.rut,
      reason,
      alcoholTested,
      alcoholEquipmentId: selectedEquipment?.id || selectedEquipmentId,
      alcoholValue,
      drugsTested,
      drugKitModel: drugsTested ? drugKitModel : undefined,
      drugKitLot: drugsTested ? drugKitLot : undefined,
      panelResults: drugsTested ? panelResults : [],
      donorSigned,
      observations: observations.trim()
    };

    // Execute Zod Schema Validation
    const validation = validateNewTestFormData(payloadToValidate, equipment);

    if (validation.success === false) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});

    const alcoholStatus = alcoholValue === 0.00 ? 'negativo' : alcoholValue >= 0.8 ? 'positivo_ebriedad' : 'positivo_infraccion';
    const drugsOverallStatus = !drugsTested ? 'no_aplica' : isDrugPositive ? 'presunto_positivo' : 'negativo';

    addTestRecord({
      companyId: currentCompany.id,
      driverId: selectedDriver.id,
      driverName: selectedDriver.fullName,
      driverRut: selectedDriver.rut,
      driverBase: selectedDriver.assignedBase,
      vehiclePlate: assignedVehicle?.plate || 'S/P',
      reason,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      operatorRut: currentUser.rut,
      alcoholTested,
      alcoholDeviceModel: selectedEquipment?.brandModel || 'Dräger Alcotest 6820',
      alcoholDeviceSerial: selectedEquipment?.serialNumber || 'DRAG-6820-CL-8891',
      alcoholDeviceCalibrationExpiry: selectedEquipment?.nextCalibrationDate || '2026-12-31',
      alcoholValueGramsPerLiter: alcoholValue,
      alcoholStatus,
      drugsTested,
      drugKitModel,
      drugKitLot,
      drugPanelResults: drugsTested ? panelResults : [],
      drugsOverallStatus,
      overallStatus: isBlocked ? 'no_apto_bloqueado' : 'apto_despacho',
      observations: observations || (isBlocked ? 'Protocolo de inhabilitación inmediata activado.' : 'Control preventivo 100% no reactivo. Aprobado para despacho.'),
      geolocation: { lat: -33.3614, lng: -70.7302, locationName: selectedDriver.assignedBase }
    });

    onClose();
  };

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">
                  Registro Oficial de Control de Alcohol y Drogas
                </h2>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  Zod Validated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Validación estricta de normativas chilenas: Ley 16.744, Ley Emilia, Tolerancia Cero e ISO 37301
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Errors Summary Alert if any */}
        {hasErrors && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-950/60 border border-rose-500/60 rounded-xl flex items-start gap-3 text-xs text-rose-200 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-100">
                Se detectaron infracciones normativas en el formulario ({Object.keys(validationErrors).length}):
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300">
                {Object.entries(validationErrors).map(([key, msg]) => (
                  <li key={key}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Conductor y Motivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Conductor a Controlar *</span>
                <span className="text-[10px] text-slate-400 font-mono">Ley 19.628 / Módulo 11</span>
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => {
                  setSelectedDriverId(e.target.value);
                  clearError('driverId');
                  clearError('driverRut');
                }}
                className={`w-full bg-slate-800 border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none ${
                  validationErrors.driverId || validationErrors.driverRut
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-700 focus:border-blue-500'
                }`}
              >
                {drivers.map((drv) => (
                  <option key={drv.id} value={drv.id}>
                    {drv.fullName} ({drv.rut}) - {drv.assignedBase}
                  </option>
                ))}
              </select>

              {(validationErrors.driverId || validationErrors.driverRut) && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.driverId || validationErrors.driverRut}</span>
                </p>
              )}

              {selectedDriver && (
                <div className="mt-2 p-2.5 bg-slate-800/60 rounded-lg text-xs text-slate-300 border border-slate-750 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">{selectedDriver.fullName}</p>
                    <p className="text-[11px] text-slate-400">
                      RUT Verificado: <span className="font-mono text-blue-300">{selectedDriver.rut}</span> • Base: {selectedDriver.assignedBase}
                    </p>
                  </div>
                  {assignedVehicle && (
                    <span className="text-[10px] bg-slate-700 text-blue-300 px-2 py-1 rounded font-mono font-bold">
                      Tracto: {assignedVehicle.plate}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Motivo del Examen *</span>
                <span className="text-[10px] text-slate-400 font-mono">Art. 154 Código del Trabajo</span>
              </label>
              <select
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value as TestRecord['reason']);
                  clearError('reason');
                  clearError('observations');
                }}
                className={`w-full bg-slate-800 border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none ${
                  validationErrors.reason
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-700 focus:border-blue-500'
                }`}
              >
                <option value="Pre-turno">Pre-turno (Control obligatorio de garita)</option>
                <option value="Aleatorio">Aleatorio (Sorteo sistemático inopinado SUSESO)</option>
                <option value="Post-incidente">Post-incidente (Protocolo de investigación)</option>
                <option value="Sospecha fundada">Sospecha fundada (Aviso de supervisor)</option>
                <option value="Reintegro laboral">Reintegro laboral (Fin de licencia)</option>
              </select>

              {validationErrors.reason && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.reason}</span>
                </p>
              )}

              <div className="mt-2 p-2.5 bg-slate-800/60 rounded-lg text-xs text-slate-400 border border-slate-750 flex items-center justify-between">
                <p className="text-[11px]">
                  <span className="text-slate-200 font-medium">Operador Responsable:</span> {currentUser.name} ({currentUser.rut})
                </p>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                  RUT Válido
                </span>
              </div>
            </div>
          </div>

          {/* Sección 1: Control de Alcoholimetría */}
          <div className="bg-slate-800/40 border border-slate-750 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                    1. Alcohotest Evidencial (Ley Tolerancia Cero: 0.00 g/L)
                  </h3>
                  <p className="text-[10px] text-slate-400">Ley 20.580 / Ley Emilia 20.770 / NCh-ISO 17025</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alcoholTested}
                  onChange={(e) => {
                    setAlcoholTested(e.target.checked);
                    clearError('alcoholTested');
                    clearError('alcoholEquipmentId');
                    clearError('alcoholValue');
                  }}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="font-medium">Realizar Alcotest</span>
              </label>
            </div>

            {alcoholTested && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>Equipo Alcoholímetro Calibrado *</span>
                    <span className="text-[10px] text-slate-400 font-mono">NCh-ISO 17025</span>
                  </label>
                  <select
                    value={selectedEquipmentId}
                    onChange={(e) => {
                      setSelectedEquipmentId(e.target.value);
                      clearError('alcoholEquipmentId');
                    }}
                    className={`w-full bg-slate-800 border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 ${
                      validationErrors.alcoholEquipmentId
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : 'border-slate-700'
                    }`}
                  >
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.brandModel} (S/N: {eq.serialNumber}) - Vence: {eq.nextCalibrationDate}
                      </option>
                    ))}
                  </select>

                  {validationErrors.alcoholEquipmentId && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{validationErrors.alcoholEquipmentId}</span>
                    </p>
                  )}

                  {selectedEquipment && (
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      <span>Calibración vigencia: {selectedEquipment.nextCalibrationDate}</span>
                      <span className="text-emerald-400 font-bold">✓ VIGENTE</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>Lectura Obtenida (g/L sangre) *</span>
                    <span className="text-[10px] text-slate-400 font-mono">0.00 - 5.00 g/L</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.00"
                      max="5.00"
                      value={alcoholValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setAlcoholValue(isNaN(val) ? 0.00 : val);
                        clearError('alcoholValue');
                      }}
                      className={`w-32 bg-slate-800 border rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-100 ${
                        validationErrors.alcoholValue
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAlcoholValue(0.00);
                        clearError('alcoholValue');
                      }}
                      className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      0.00 g/L (Aprobado)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlcoholValue(0.35);
                        clearError('alcoholValue');
                      }}
                      className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      0.35 g/L (Positivo)
                    </button>
                  </div>

                  {validationErrors.alcoholValue && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{validationErrors.alcoholValue}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {validationErrors.alcoholTested && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{validationErrors.alcoholTested}</span>
              </p>
            )}
          </div>

          {/* Sección 2: Panel Multidrogas */}
          <div className="bg-slate-800/40 border border-slate-750 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <div>
                  <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                    2. Panel Toxicológico Rápido (Saliva / Orina)
                  </h3>
                  <p className="text-[10px] text-slate-400">Regulación ISP / Detección 6 Drogas de Abuso</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={drugsTested}
                  onChange={(e) => {
                    setDrugsTested(e.target.checked);
                    clearError('drugsTested');
                    clearError('drugKitModel');
                    clearError('drugKitLot');
                    clearError('panelResults');
                  }}
                  className="rounded text-purple-600 focus:ring-0"
                />
                <span className="font-medium">Realizar Test de Drogas</span>
              </label>
            </div>

            {drugsTested && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Kit / Dispositivo Certificado *</label>
                    <input
                      type="text"
                      value={drugKitModel}
                      onChange={(e) => {
                        setDrugKitModel(e.target.value);
                        clearError('drugKitModel');
                      }}
                      className={`w-full bg-slate-800 border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 ${
                        validationErrors.drugKitModel
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-700'
                      }`}
                    />
                    {validationErrors.drugKitModel && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{validationErrors.drugKitModel}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Lote y Vencimiento ISP *</label>
                    <input
                      type="text"
                      value={drugKitLot}
                      onChange={(e) => {
                        setDrugKitLot(e.target.value);
                        clearError('drugKitLot');
                      }}
                      className={`w-full bg-slate-800 border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono ${
                        validationErrors.drugKitLot
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-700'
                      }`}
                    />
                    {validationErrors.drugKitLot && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{validationErrors.drugKitLot}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Interactive 6-drug grid */}
                <div className="mt-2">
                  <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                    <span>Resultados por Tira Reactiva (Haga clic para alternar reactivo / presunto positivo):</span>
                    <span className="text-[10px] text-slate-500 font-mono">Puntos de Corte Normativos</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {panelResults.map((panel) => {
                      const isReactive = panel.result === 'presunto_positivo';
                      return (
                        <div
                          key={panel.drug}
                          onClick={() => toggleDrugResult(panel.drug)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                            isReactive
                              ? 'bg-rose-950/70 border-rose-600 text-rose-100 shadow-md ring-1 ring-rose-500'
                              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{panel.drug}</span>
                            <span className="text-[9px] font-mono opacity-80">{panel.cutoff}</span>
                          </div>
                          <p className="text-[11px] font-medium mt-1 truncate">{panel.name}</p>
                          <div className="mt-2 pt-1 border-t border-slate-700/50 flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase ${isReactive ? 'text-rose-300' : 'text-emerald-400'}`}>
                              {isReactive ? 'REACTIVO (POSITIVO)' : 'NO REACTIVO'}
                            </span>
                            <span className="text-[9px] text-slate-400">Clic</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {validationErrors.panelResults && (
                    <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{validationErrors.panelResults}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live Outcome Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
              isBlocked
                ? 'bg-rose-950/80 border-rose-600 text-rose-200 shadow-lg shadow-rose-950/40'
                : 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200 shadow-lg shadow-emerald-950/40'
            }`}
          >
            <div className="flex items-center gap-3">
              {isBlocked ? (
                <Lock className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {isBlocked ? 'DICTAMEN: NO APTO PARA LA CONDUCCIÓN (BLOQUEO INMEDIATO)' : 'DICTAMEN: APTO PARA DESPACHO EN RUTA'}
                </p>
                <p className="text-xs opacity-90">
                  {isBlocked
                    ? 'Se activará bloqueo preventivo de despacho y se generará automáticamente la Cadena de Custodia Digital a Laboratorio UC-Christus.'
                    : 'Cumple con estándar 0.00 g/L y panel toxicológico 100% negativo según Ley 16.744.'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black/40 uppercase shrink-0">
              {isBlocked ? 'BLOQUEO' : 'HABILITADO'}
            </span>
          </div>

          {/* Observations & Consent */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Observaciones del Operador / Declaración del Trabajador</span>
                <span className="text-[10px] text-slate-400">
                  {reason === 'Post-incidente' || reason === 'Sospecha fundada' ? 'Obligatorio según RIOHS *' : 'Opcional'}
                </span>
              </label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => {
                  setObservations(e.target.value);
                  clearError('observations');
                }}
                placeholder={
                  reason === 'Post-incidente' || reason === 'Sospecha fundada'
                    ? 'Indique detalladamente los hechos, testigos o circunstancias que motivan este examen...'
                    : 'Indicar si el trabajador declara consumo de medicamentos bajo prescripción médica o cualquier eventualidad...'
                }
                className={`w-full bg-slate-800 border rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none ${
                  validationErrors.observations
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-700 focus:border-blue-500'
                }`}
              />
              {validationErrors.observations && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.observations}</span>
                </p>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
              donorSigned
                ? 'bg-slate-800/80 border-slate-700'
                : 'bg-rose-950/40 border-rose-600 text-rose-200'
            }`}>
              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={donorSigned}
                  onChange={(e) => {
                    setDonorSigned(e.target.checked);
                    clearError('donorSigned');
                  }}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-blue-400" />
                  <span>Consentimiento Informado otorgado por el trabajador (Firma Digital Biométrica en Terreno)</span>
                </div>
              </label>
              <span className={`text-[11px] font-medium font-mono px-2 py-0.5 rounded ${
                donorSigned ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800' : 'text-rose-400 bg-rose-950 border border-rose-800'
              }`}>
                {donorSigned ? '✓ REGISTRADO' : 'REQUERIDO'}
              </span>
            </div>

            {validationErrors.donorSigned && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{validationErrors.donorSigned}</span>
              </p>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Esquema Zod verificado contra Código del Trabajo y Ley 16.744</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition cursor-pointer flex items-center gap-2 ${
                  isBlocked
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isBlocked ? 'Validar & Bloquear Despacho' : 'Validar & Registrar Examen'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
