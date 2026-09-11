import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SafetyManagerRecipient, SafetyEmailLog, TestRecord } from '../types';
import {
  X,
  Mail,
  ShieldAlert,
  Sliders,
  Users,
  History,
  Send,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  RefreshCw,
  Clock,
  Building,
  Check,
  Zap,
  Info,
  ChevronRight,
  FileCheck2,
  Phone
} from 'lucide-react';

interface SafetyAlertsEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTestToAlert?: TestRecord | null;
}

export const SafetyAlertsEmailModal: React.FC<SafetyAlertsEmailModalProps> = ({
  isOpen,
  onClose,
  initialTestToAlert = null
}) => {
  const {
    safetyRiskThresholds,
    updateSafetyRiskThresholds,
    safetyManagerRecipients,
    addSafetyManagerRecipient,
    updateSafetyManagerRecipient,
    deleteSafetyManagerRecipient,
    safetyEmailLogs,
    triggerSafetyManagerEmail,
    tests,
    currentCompany
  } = useApp();

  const [activeTab, setActiveTab] = useState<'thresholds' | 'recipients' | 'history' | 'simulator'>(
    initialTestToAlert ? 'simulator' : 'thresholds'
  );

  // Local state for thresholds form
  const [thresholdsForm, setThresholdsForm] = useState(safetyRiskThresholds);
  const [hasUnsavedThresholds, setHasUnsavedThresholds] = useState(false);

  // Local state for adding recipient modal/form
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(null);
  const [newRecipientForm, setNewRecipientForm] = useState({
    name: '',
    email: '',
    role: 'Prevencionista de Riesgos',
    organization: 'Depto. Prevención de Riesgos',
    phone: '+56 9 ',
    active: true,
    receivesImmediateCritical: true,
    receivesShiftSummary: true
  });

  // Local state for simulator
  const [selectedTestId, setSelectedTestId] = useState<string>(
    initialTestToAlert?.id || tests.find((t) => t.overallStatus === 'no_apto_bloqueado')?.id || tests[0]?.id || ''
  );
  const [simulatedAlcohol, setSimulatedAlcohol] = useState<number>(0.35);
  const [simulatedDrug, setSimulatedDrug] = useState<string>('THC');
  const [simulatedCustomNote, setSimulatedCustomNote] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SafetyEmailLog | null>(null);

  // Local state for Email Preview modal
  const [viewingEmailLog, setViewingEmailLog] = useState<SafetyEmailLog | null>(null);

  if (!isOpen) return null;

  const handleSaveThresholds = () => {
    updateSafetyRiskThresholds(thresholdsForm);
    setHasUnsavedThresholds(false);
  };

  const handleCreateOrUpdateRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientForm.name.trim() || !newRecipientForm.email.trim()) return;

    if (editingRecipientId) {
      updateSafetyManagerRecipient(editingRecipientId, newRecipientForm);
      setEditingRecipientId(null);
    } else {
      addSafetyManagerRecipient(newRecipientForm);
    }

    setNewRecipientForm({
      name: '',
      email: '',
      role: 'Prevencionista de Riesgos',
      organization: 'Depto. Prevención de Riesgos',
      phone: '+56 9 ',
      active: true,
      receivesImmediateCritical: true,
      receivesShiftSummary: true
    });
    setIsAddingRecipient(false);
  };

  const handleStartEditRecipient = (recipient: SafetyManagerRecipient) => {
    setEditingRecipientId(recipient.id);
    setNewRecipientForm({
      name: recipient.name,
      email: recipient.email,
      role: recipient.role,
      organization: recipient.organization,
      phone: recipient.phone || '+56 9 ',
      active: recipient.active,
      receivesImmediateCritical: recipient.receivesImmediateCritical,
      receivesShiftSummary: recipient.receivesShiftSummary
    });
    setIsAddingRecipient(true);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    const selectedTest = tests.find((t) => t.id === selectedTestId);
    const breached: string[] = [];

    if (simulatedAlcohol > 0) {
      breached.push(
        `Nivel de alcohol detectado: ${simulatedAlcohol.toFixed(2)} g/L (Umbral corporativo: ${safetyRiskThresholds.maxAllowedAlcoholGramsPerLiter.toFixed(2)} g/L - Tolerancia Cero).`
      );
    }
    if (simulatedDrug && simulatedDrug !== 'ninguna') {
      breached.push(`Reactividad presunta en panel salival de drogas: ${simulatedDrug} (Cut-off SUSESO/SAMHSA superado).`);
    }
    breached.push('Activación de protocolo inmediato de inhabilitación de despacho de tractocamión / bus.');

    try {
      const result = await triggerSafetyManagerEmail({
        test: selectedTest,
        triggerReason: 'Simulación de Umbral Crítico Operacional',
        triggeredThresholds: breached,
        manualOverride: true,
        customNotes: simulatedCustomNote
      });
      setSimulationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const activeRecipientsCount = safetyManagerRecipients.filter((r) => r.active).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Sistema de Alertas y Umbrales Críticos por Correo
                </h2>
                <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  SUSESO 92064-2025
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Notificación automatizada a Jefes de Seguridad, Oficiales de Cumplimiento y Comités Paritarios ante eventos de riesgo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <span className={`w-2 h-2 rounded-full ${safetyRiskThresholds.autoTriggerEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300">
                Auto-Trigger: <strong>{safetyRiskThresholds.autoTriggerEnabled ? 'ACTIVO' : 'PAUSADO'}</strong>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 gap-2">
          <button
            onClick={() => setActiveTab('thresholds')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'thresholds'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Configuración de Umbrales</span>
            {hasUnsavedThresholds && (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Cambios sin guardar" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('recipients')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'recipients'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Destinatarios de Seguridad</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeRecipientsCount} activos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial de Envíos</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {safetyEmailLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'simulator'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Simulador & Disparo Manual</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: THRESHOLDS CONFIGURATION */}
          {activeTab === 'thresholds' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">
                    Definición de Disparadores Automáticos (Trigger Rules)
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Cuando un examen de screening ingresado en el sistema supera cualquiera de estos umbrales, el servidor genera de inmediato un correo oficial estructurado con sello criptográfico, informe de inhabilitación y checklist de acción inmediata, despachándolo a todos los Jefes de Seguridad activos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Numerical Thresholds */}
                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Umbrales Numéricos y Cuantitativos
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tolerancia Máxima de Alcohol Permitida (g/L en sangre/aire):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0.00"
                        max="0.80"
                        value={thresholdsForm.maxAllowedAlcoholGramsPerLiter}
                        onChange={(e) => {
                          setThresholdsForm({
                            ...thresholdsForm,
                            maxAllowedAlcoholGramsPerLiter: parseFloat(e.target.value) || 0
                          });
                          setHasUnsavedThresholds(true);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono w-28 focus:outline-hidden focus:border-blue-500"
                      />
                      <span className="text-xs text-slate-400">
                        g/L (Actualmente: <strong>0.00 = Tolerancia Cero Estricta</strong>)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cualquier medición superior a este valor inhabilita inmediatamente al conductor y detona el envío automático de alerta.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tasa Crítica de Positividad Corporativa Máxima (%):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.05"
                        min="0.10"
                        max="5.00"
                        value={thresholdsForm.positivityRateCriticalThresholdPercent}
                        onChange={(e) => {
                          setThresholdsForm({
                            ...thresholdsForm,
                            positivityRateCriticalThresholdPercent: parseFloat(e.target.value) || 0.5
                          });
                          setHasUnsavedThresholds(true);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono w-28 focus:outline-hidden focus:border-blue-500"
                      />
                      <span className="text-xs text-slate-400">% de no conformidad en la flota</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Si la tasa acumulada de positividad en una faena supera este umbral, se envía un correo de advertencia gerencial por desvío de meta ISO 39001.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Detección de Cluster Operacional por Turno:
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="10"
                        value={thresholdsForm.shiftClusterAlertCount}
                        onChange={(e) => {
                          setThresholdsForm({
                            ...thresholdsForm,
                            shiftClusterAlertCount: parseInt(e.target.value) || 2
                          });
                          setHasUnsavedThresholds(true);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono w-28 focus:outline-hidden focus:border-blue-500"
                      />
                      <span className="text-xs text-slate-400">casos no aptos en una misma jornada</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Genera alerta de contingencia roja al evidenciarse dos o más conductores inhabilitados en el mismo turno de faena.
                    </p>
                  </div>
                </div>

                {/* Column 2: Event Triggers & Switches */}
                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Disparadores de Eventos Específicos
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-850 transition">
                      <input
                        type="checkbox"
                        checked={thresholdsForm.autoTriggerEnabled}
                        onChange={(e) => {
                          setThresholdsForm({ ...thresholdsForm, autoTriggerEnabled: e.target.checked });
                          setHasUnsavedThresholds(true);
                        }}
                        className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Disparo Automático Global Activado</span>
                          <span className="bg-emerald-900/80 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                            Recomendado
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Habilita el motor en tiempo real que despacha correos tan pronto se registra un examen no conforme.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-850 transition">
                      <input
                        type="checkbox"
                        checked={thresholdsForm.notifyOnAlcoholPositive}
                        onChange={(e) => {
                          setThresholdsForm({ ...thresholdsForm, notifyOnAlcoholPositive: e.target.checked });
                          setHasUnsavedThresholds(true);
                        }}
                        className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">
                          Notificar de Inmediato ante Alcohotest Positivo (&gt; umbral)
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Envía el correo ejecutivo con el valor exacto de alcohol y certificado del equipo Dräger.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-850 transition">
                      <input
                        type="checkbox"
                        checked={thresholdsForm.notifyOnDrugReactive}
                        onChange={(e) => {
                          setThresholdsForm({ ...thresholdsForm, notifyOnDrugReactive: e.target.checked });
                          setHasUnsavedThresholds(true);
                        }}
                        className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">
                          Notificar ante Panel Salival Reactivo a Drogas
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Detona aviso de reactividad para THC, Cocaína, Anfetaminas, Metanfetaminas, Opiáceos o Benzodiacepinas.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-850 transition">
                      <input
                        type="checkbox"
                        checked={thresholdsForm.notifyOnTestRefusal}
                        onChange={(e) => {
                          setThresholdsForm({ ...thresholdsForm, notifyOnTestRefusal: e.target.checked });
                          setHasUnsavedThresholds(true);
                        }}
                        className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">
                          Notificar ante Rechazo o Negativa Injustificada del Trabajador
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Genera acta de alerta legal por presunción de intemperancia según dictámenes SUSESO y RIOHS.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-850 transition">
                      <input
                        type="checkbox"
                        checked={thresholdsForm.notifyOnPostIncident}
                        onChange={(e) => {
                          setThresholdsForm({ ...thresholdsForm, notifyOnPostIncident: e.target.checked });
                          setHasUnsavedThresholds(true);
                        }}
                        className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">
                          Prioridad Crítica en Controles Post-Incidente / Cuasi-Accidente
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Marca la notificación con máxima prioridad y activa de inmediato la cadena pericial hacia la Mutualidad.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setThresholdsForm(safetyRiskThresholds);
                    setHasUnsavedThresholds(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
                >
                  Restablecer Valores
                </button>

                <button
                  type="button"
                  onClick={handleSaveThresholds}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Parámetros de Umbrales de Seguridad</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RECIPIENTS MANAGEMENT */}
          {activeTab === 'recipients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Directorio de Jefaturas y Oficiales Notificados
                  </h3>
                  <p className="text-xs text-slate-400">
                    Destinatarios de correo electrónico que reciben el informe ejecutivo cada vez que se supera un umbral.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingRecipientId(null);
                    setNewRecipientForm({
                      name: '',
                      email: '',
                      role: 'Prevencionista de Riesgos',
                      organization: 'Depto. Prevención de Riesgos',
                      phone: '+56 9 ',
                      active: true,
                      receivesImmediateCritical: true,
                      receivesShiftSummary: true
                    });
                    setIsAddingRecipient(!isAddingRecipient);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingRecipient ? 'Cancelar' : 'Agregar Destinatario'}</span>
                </button>
              </div>

              {/* Add / Edit Form */}
              {isAddingRecipient && (
                <form
                  onSubmit={handleCreateOrUpdateRecipient}
                  className="bg-slate-800/80 border border-blue-500/50 rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      {editingRecipientId ? 'Editar Destinatario de Alertas' : 'Registrar Nuevo Destinatario'}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Notificaciones seguras bajo protocolo RFC 5322
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nombre Completo y Título:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Ing. Roberto Cárdenas Silva"
                        value={newRecipientForm.name}
                        onChange={(e) => setNewRecipientForm({ ...newRecipientForm, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Correo Electrónico Corporativo:
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@transandinacargo.cl o gmail.com"
                        value={newRecipientForm.email}
                        onChange={(e) => setNewRecipientForm({ ...newRecipientForm, email: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Cargo / Rol Funcional:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Jefe de Prevención SNS / Oficial de Cumplimiento"
                        value={newRecipientForm.role}
                        onChange={(e) => setNewRecipientForm({ ...newRecipientForm, role: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Departamento / Organización:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Depto. Prevención de Riesgos / Mutualidad ACHS"
                        value={newRecipientForm.organization}
                        onChange={(e) => setNewRecipientForm({ ...newRecipientForm, organization: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRecipientForm.active}
                        onChange={(e) => setNewRecipientForm({ ...newRecipientForm, active: e.target.checked })}
                        className="rounded border-slate-600 text-blue-600"
                      />
                      <span>Destinatario Activo</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRecipientForm.receivesImmediateCritical}
                        onChange={(e) =>
                          setNewRecipientForm({
                            ...newRecipientForm,
                            receivesImmediateCritical: e.target.checked
                          })
                        }
                        className="rounded border-slate-600 text-blue-600"
                      />
                      <span>Recibe Alertas Críticas Inmediatas</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRecipientForm.receivesShiftSummary}
                        onChange={(e) =>
                          setNewRecipientForm({
                            ...newRecipientForm,
                            receivesShiftSummary: e.target.checked
                          })
                        }
                        className="rounded border-slate-600 text-blue-600"
                      />
                      <span>Recibe Resumen de Turno / Tasa Positividad</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={() => setIsAddingRecipient(false)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow"
                    >
                      {editingRecipientId ? 'Actualizar Destinatario' : 'Guardar Destinatario'}
                    </button>
                  </div>
                </form>
              )}

              {/* Recipients List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safetyManagerRecipients.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border transition ${
                      rec.active
                        ? 'bg-slate-800/60 border-slate-700/80'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            rec.active
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {rec.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{rec.name}</h4>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                rec.active
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {rec.active ? 'ACTIVO' : 'PAUSADO'}
                            </span>
                          </div>
                          <p className="text-[11px] text-blue-400 font-mono mt-0.5">{rec.email}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{rec.role}</p>
                          <p className="text-[10px] text-slate-400">{rec.organization}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditRecipient(rec)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSafetyManagerRecipient(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rec.receivesImmediateCritical ? 'bg-red-400' : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-slate-400">
                          {rec.receivesImmediateCritical ? 'Alertas Inmediatas: SÍ' : 'Alertas Inmediatas: NO'}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          updateSafetyManagerRecipient(rec.id, {
                            active: !rec.active
                          })
                        }
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded transition ${
                          rec.active
                            ? 'text-amber-400 hover:bg-amber-950/30'
                            : 'text-emerald-400 hover:bg-emerald-950/30'
                        }`}
                      >
                        {rec.active ? 'Pausar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HISTORY & AUDIT LOG */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Historial de Correos Automáticos Despachados
                  </h3>
                  <p className="text-xs text-slate-400">
                    Registro auditable con sello de tiempo, código de examen, lista de destinatarios y copia fiel del acta enviada.
                  </p>
                </div>
              </div>

              {safetyEmailLogs.length === 0 ? (
                <div className="text-center py-12 bg-slate-850/50 border border-slate-800 rounded-xl">
                  <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No hay registros de correos despachados aún.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Los correos se generarán automáticamente ante exámenes no conformes o mediante el simulador.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {safetyEmailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-850 border border-slate-700/80 rounded-xl p-4 hover:border-slate-600 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded tracking-wider ${
                              log.severity === 'CRITICA'
                                ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                                : 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {log.severity}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            {log.testCode || 'CONTROL GENERAL'}
                          </span>
                          <span className="text-xs text-slate-400">• {log.baseName}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {log.timestamp}
                          </span>
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {log.deliveryStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="py-2.5">
                        <h4 className="text-xs font-bold text-slate-200">{log.subject}</h4>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {log.triggeredThresholds.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-red-950/60 text-red-300 border border-red-800/60 px-2 py-0.5 rounded"
                            >
                              ⚠️ {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="text-slate-400 text-[11px] truncate max-w-md">
                          <strong>Destinatarios ({log.recipients.length}):</strong>{' '}
                          {log.recipients.join(', ')}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setViewingEmailLog(log)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Correo Enviado</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SIMULATOR & MANUAL TRIGGER */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 space-y-1">
                  <p className="font-bold text-amber-100">
                    Módulo de Verificación y Disparo Manual de Alertas
                  </p>
                  <p className="leading-relaxed">
                    Permite a los prevencionistas y auditores probar el circuito completo de notificación hacia las casillas de correo configuradas (incluyendo <strong>blindajevial@gmail.com</strong>), evaluando el formato del acta, el checklist de contingencia y el sello criptográfico.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Simulation Form */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-700 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span>Configurar Escenario de Control a Notificar</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Seleccionar Examen Real del Sistema:
                    </label>
                    <select
                      value={selectedTestId}
                      onChange={(e) => setSelectedTestId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    >
                      {tests.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.code} - {t.driverName} ({t.overallStatus === 'no_apto_bloqueado' ? 'BLOQUEADO' : 'APTO'}) - {t.reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Alcoholemia Detectada:
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.00"
                        max="2.50"
                        value={simulatedAlcohol}
                        onChange={(e) => setSimulatedAlcohol(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Reactividad en Drogas:
                      </label>
                      <select
                        value={simulatedDrug}
                        onChange={(e) => setSimulatedDrug(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        <option value="THC (Marihuana / Tetrahidrocannabinol)">THC (Marihuana 15 ng/mL)</option>
                        <option value="COC (Cocaína / Benzoilecgonina)">COC (Cocaína 20 ng/mL)</option>
                        <option value="AMP (Anfetaminas)">AMP (Anfetaminas 50 ng/mL)</option>
                        <option value="BZO (Benzodiacepinas)">BZO (Benzodiacepinas 10 ng/mL)</option>
                        <option value="Multi-panel (THC + Cocaína)">Multi-panel (THC + Cocaína)</option>
                        <option value="ninguna">Sin reactividad (Negativo)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nota Adicional para el Comité de Seguridad (Opcional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Conductor interceptado en garita de Quilicura antes de iniciar ruta a Valparaíso. Unidad bloqueada."
                      value={simulatedCustomNote}
                      onChange={(e) => setSimulatedCustomNote(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={handleRunSimulation}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-lg transition"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Despachando correo a {activeRecipientsCount} destinatarios...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Disparar Alerta Crítica a Prevención por Correo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Simulation Output / Preview */}
                <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-700 flex items-center justify-between">
                      <span>Resultado del Despacho y Recibo de Entrega</span>
                      {simulationResult && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                          ID: {simulationResult.id}
                        </span>
                      )}
                    </h4>

                    {simulationResult ? (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs space-y-1">
                          <div className="flex items-center gap-2 text-emerald-300 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Correo Automático Despachado con Éxito</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">
                            El servidor procesó el evento y generó la plantilla oficial conforme a SUSESO 92064-2025.
                          </p>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="text-slate-400">
                            <strong>Asunto:</strong> <span className="text-white font-medium">{simulationResult.subject}</span>
                          </div>
                          <div className="text-slate-400">
                            <strong>Fecha/Hora:</strong> <span className="text-slate-200 font-mono">{simulationResult.timestamp}</span>
                          </div>
                          <div className="text-slate-400">
                            <strong>Destinatarios notificados:</strong>
                            <ul className="mt-1 pl-4 list-disc text-blue-300 font-mono text-[11px] space-y-0.5">
                              {simulationResult.recipients.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {simulationResult.actionChecklist && (
                          <div className="mt-2 p-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-[11px]">
                            <div className="font-bold text-slate-200 mb-1">Checklist de Prevención Activado:</div>
                            <ul className="list-decimal pl-4 space-y-0.5 text-slate-300">
                              {simulationResult.actionChecklist.slice(0, 3).map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p>Configure el escenario a la izquierda y presione "Disparar Alerta Crítica".</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Se generará la vista previa en vivo y el comprobante de notificación.
                        </p>
                      </div>
                    )}
                  </div>

                  {simulationResult && (
                    <div className="pt-4 border-t border-slate-700 mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Protocolo: SUSESO 92064-2025 • SHA-256
                      </span>
                      <button
                        onClick={() => setViewingEmailLog(simulationResult)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Abrir Correo Oficial Renderizado</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentCompany.name}</span>
            <span>•</span>
            <span>Mutualidad: {currentCompany.mutualidad}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>

      {/* Rendered Email Inspection Sub-Modal */}
      {viewingEmailLog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]">
            
            {/* Email Modal Header */}
            <div className="px-6 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Inspección de Correo Enviado a Jefaturas de Prevención
                </h3>
              </div>
              <button
                onClick={() => setViewingEmailLog(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Meta Bar */}
            <div className="px-6 py-3 bg-slate-850 border-b border-slate-700 text-xs space-y-1">
              <div>
                <span className="text-slate-400">De: </span>
                <span className="text-slate-200 font-semibold">
                  Blindaje Vial 360 &lt;alertas-operacionales@blindajevial.cl&gt;
                </span>
              </div>
              <div>
                <span className="text-slate-400">Para: </span>
                <span className="text-blue-300 font-mono text-[11px]">
                  {viewingEmailLog.recipients.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Asunto: </span>
                <span className="text-white font-bold">{viewingEmailLog.subject}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                <span>Fecha: {viewingEmailLog.timestamp}</span>
                <span>•</span>
                <span>Sello SHA-256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
              </div>
            </div>

            {/* Rendered HTML or Text Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 text-slate-900">
              {viewingEmailLog.htmlBody ? (
                <div
                  dangerouslySetInnerHTML={{ __html: viewingEmailLog.htmlBody }}
                  className="rounded-lg overflow-hidden shadow-xs"
                />
              ) : (
                <div className="bg-white p-6 rounded-lg border border-slate-300 shadow font-mono text-xs whitespace-pre-wrap text-slate-800">
                  {viewingEmailLog.summaryText}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Dictamen SUSESO N° 92064-2025 • Validez Pericial Acreditada
              </span>
              <button
                onClick={() => setViewingEmailLog(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
