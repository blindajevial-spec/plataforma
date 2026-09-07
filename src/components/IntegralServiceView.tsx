import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BlindajeVialPresentationDeck } from './BlindajeVialPresentationDeck';
import {
  Briefcase,
  ShieldCheck,
  Calculator,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Scale,
  Users,
  Truck,
  Sparkles,
  Printer,
  Copy,
  Check,
  Building,
  Clock,
  AlertTriangle,
  FileCheck2,
  DollarSign,
  ChevronRight,
  FileText,
  FileCode,
  Tv
} from 'lucide-react';
import { SusesoManualModal } from './SusesoManualModal';
import { BrandLogo } from './BrandLogo';

interface IntegralServiceViewProps {
  onNavigate?: (view: string) => void;
}

export const IntegralServiceView: React.FC<IntegralServiceViewProps> = ({ onNavigate }) => {
  const { currentCompany } = useApp();

  const [activeTab, setActiveTab] = useState<'deck' | 'proposal' | 'calculator' | 'diagnosis' | 'sla' | 'contract'>('deck');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Calculator State
  const [fleetSize, setFleetSize] = useState<number>(45);
  const [industryType, setIndustryType] = useState<'pasajeros' | 'carga_peligrosa' | 'mineria' | 'carga_general'>('carga_peligrosa');
  const [selectedPlan, setSelectedPlan] = useState<'operativo' | 'blindaje_estandar' | 'blindaje_total_360'>('blindaje_total_360');
  const [copiedContract, setCopiedContract] = useState(false);

  // Diagnosis State
  const [diagnosisAnswers, setDiagnosisAnswers] = useState<Record<string, boolean>>({
    riohs_updated: true,
    drager_calibrated: true,
    random_crypto: false,
    saliva_panel: true,
    gcms_contract: false,
    training_annual: true,
    data_privacy: false
  });

  const diagnosisQuestions = [
    { id: 'riohs_updated', title: 'Reglamento Interno (RIOHS) depositado ante DT con cláusula específica de controles (Art. 154 N° 5)', weight: 15 },
    { id: 'drager_calibrated', title: 'Alcoholímetros evidenciales con certificado de calibración vigente < 180 días', weight: 15 },
    { id: 'random_crypto', title: 'Mecanismo de sorteo aleatorio inopinado despersonalizado (Algoritmo SHA-256 o similar)', weight: 15 },
    { id: 'saliva_panel', title: 'Uso de paneles salivales rápidos de 6 drogas con puntos de corte validados por ISP', weight: 15 },
    { id: 'gcms_contract', title: 'Convenio formal con Laboratorio de Toxicología Acreditado para confirmación GC-MS / LC-MS', weight: 15 },
    { id: 'training_annual', title: 'Programa anual de capacitación para conductores y Comité Paritario con registro formal', weight: 10 },
    { id: 'data_privacy', title: 'Protocolo de resguardo de datos médicos sensibles y consentimientos informados (Ley 19.628)', weight: 15 }
  ];

  const totalScore = diagnosisQuestions.reduce((acc, q) => acc + (diagnosisAnswers[q.id] ? q.weight : 0), 0);

  // Financial calculations
  const baseMonthlyPerDriver = {
    operativo: 18500,
    blindaje_estandar: 34900,
    blindaje_total_360: 52000
  }[selectedPlan];

  const monthlyServiceCostCLP = fleetSize * baseMonthlyPerDriver;
  const estimatedFinePerDriverDT = 60 * 67000; // 60 UTM approx $4.020.000
  const annualInsuranceSavingsCLP = Math.round(fleetSize * 180000 * 0.35); // Ahorro en rebaja de cotización adicional DS 67
  const potentialLitigationRiskSavingsCLP = 150000000; // Mitigación de demandas indemnizatorias

  const handleCopyContract = () => {
    const contractText = `PROPUESTA TÉCNICO-COMERCIAL & CONVENIO DE SERVICIO INTEGRAL DE COMPLIANCE
PROGRAMA BLINDAJE VIAL 360 (DICTAMEN SUSESO N.º 92064-2025)

CLIENTE: ${currentCompany.businessName} (RUT: ${currentCompany.rut})
DOTACIÓN CONTRATADA: ${fleetSize} conductores / operadores de flota crítica
PLAN SELECCIONADO: ${selectedPlan.toUpperCase()}
VALOR MENSUAL: $${monthlyServiceCostCLP.toLocaleString('es-CL')} + IVA

ALCANCE DEL SERVICIO INTEGRAL:
1. Implementación de Software de Trazabilidad Blindaje Vial 360 con algoritmos de aleatoriedad criptográfica SHA-256.
2. Suministro en comodato de alcoholímetros evidenciales Dräger con mantención y calibración semestral garantizada.
3. Abastecimiento mensual de paneles salivales rápidos de 6 drogas (THC, COC, AMP, MET, OPI, BZO) con certificación ISP.
4. Redacción e ingreso del anexo de modificación del RIOHS ante la Dirección del Trabajo (Art. 154 N° 5).
5. Cobertura de contrapruebas confirmatorias en Laboratorio de Toxicología Acreditado bajo Cadena de Custodia.
6. Capacitación anual presencial/online con diplomas digitales y códigos QR de verificación para toda la dotación.
7. Asesoría técnico-pericial y dossier probatorio frente a fiscalizaciones de la Dirección del Trabajo, SUSESO o Mutualidades.

Firma Representante Legal: _______________________
Firma Blindaje Vial 360 SpA: _______________________
Fecha: ${new Date().toLocaleDateString('es-CL')}`;

    navigator.clipboard.writeText(contractText);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <BrandLogo size="lg" showText={false} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold font-mono bg-[#0056B3] text-white px-3 py-1 rounded-lg shadow">
                    PROYECTO SERVICIO INTEGRAL B2B
                  </span>
                  <span className="text-xs font-mono bg-slate-800 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-lg">
                    Dictamen SUSESO N.º 92064-2025 • Ley N.º 16.744
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mt-1">
                  Servicio Integral de Tests, Metrología & Blindaje Normativo
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              No solo vendemos insumos o dispositivos: entregamos una <strong>solución integral llave en mano</strong> que abarca diagnóstico de madurez, actualización de Reglamentos Internos (RIOHS), equipamiento evidencial Dräger, trazabilidad digital inalterable, capacitación certificada y respaldo pericial ante fiscalizaciones.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>8/8 Principios SUSESO Cumplidos</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Depósito Garantizado ante DT</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Confirmación GC-MS Acreditada</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {onNavigate && (
              <button
                onClick={() => onNavigate('specifications')}
                className="flex items-center justify-center gap-2 bg-[#0056B3] hover:bg-blue-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xl shadow-blue-600/30 transition cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-white" />
                <span>Matriz Especificaciones (54)</span>
              </button>
            )}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xl transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ver Manual SUSESO (8 Tomos)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('calculator');
              }}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs px-5 py-3 rounded-2xl transition cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Cotizar Plan para mi Flota</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('deck')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'deck'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className="w-4 h-4 text-blue-200" />
          <span>Deck de Presentación Oficial (12 Láminas)</span>
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-md">OFICIAL</span>
        </button>

        <button
          onClick={() => setActiveTab('proposal')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'proposal'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Pilares de Servicio</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Cotizador B2B & Retorno (ROI)</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnosis')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'diagnosis'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Diagnóstico de Madurez (Gap Analysis)</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'sla'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Entregables & SLAs</span>
        </button>

        <button
          onClick={() => setActiveTab('contract')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'contract'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Modelo de Contrato & Firma</span>
        </button>
      </div>

      {/* TAB CONTENT 0: OFFICIAL 12-SLIDES PRESENTATION DECK */}
      {activeTab === 'deck' && (
        <BlindajeVialPresentationDeck onNavigateView={onNavigate} />
      )}

      {/* TAB CONTENT 1: PROPOSAL OVERVIEW */}
      {activeTab === 'proposal' && (
        <div className="space-y-6">
          {/* 6 Value Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/20 mb-3">
                  01
                </div>
                <h3 className="font-bold text-base text-white">Diagnóstico Técnico-Jurídico</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Evaluación inicial de la matriz de riesgos IPER, contratos de trabajo, reglamentos internos y estado metrológico del instrumental existente.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-blue-400 flex items-center justify-between">
                <span>Entregable:</span>
                <span className="font-semibold text-white">Informe Gap Analysis</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/20 mb-3">
                  02
                </div>
                <h3 className="font-bold text-base text-white">Redacción & Depósito RIOHS</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Elaboración de la cláusula específica de controles preventivos según el Dictamen SUSESO 92064-2025 y gestión de depósito ante la Dirección del Trabajo.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-indigo-400 flex items-center justify-between">
                <span>Entregable:</span>
                <span className="font-semibold text-white">Comprobante DT Art. 154 N° 5</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/20 mb-3">
                  03
                </div>
                <h3 className="font-bold text-base text-white">Equipamiento Dräger en Comodato</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Suministro de alcoholímetros Dräger 6820 evidenciales calibrados y abastecimiento continuo de paneles salivales de 6 drogas con puntos de corte ISP.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-teal-400 flex items-center justify-between">
                <span>Entregable:</span>
                <span className="font-semibold text-white">Certificados INN / NIST Semestrales</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/20 mb-3">
                  04
                </div>
                <h3 className="font-bold text-base text-white">Software BV360 & Sorteo SHA-256</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Acceso a la plataforma cloud para registro digital de pruebas pre-turno, motor criptográfico de sorteo inopinado y bóveda con hash inalterable.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-amber-400 flex items-center justify-between">
                <span>Entregable:</span>
                <span className="font-semibold text-white">Portal Web & App Garitas</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/20 mb-3">
                  05
                </div>
                <h3 className="font-bold text-base text-white">Laboratorio GC-MS & Cadena de Custodia</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Convenio preferencial con laboratorio clínico toxicológico acreditado para confirmación instrumental de presuntos positivos y resguardo de contramuestra.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-purple-400 flex items-center justify-between">
                <span>Entregable:</span>
                <span className="font-semibold text-white">Informe Pericial Cuantitativo</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm border border-rose-500/20 mb-3">
                  06
                </div>
                <h3 className="font-bold text-base text-white">Capacitación & Acompañamiento Pericial</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Malla formativa anual con diplomas y códigos QR de verificación para conductores, más representación técnica ante fiscalizaciones de DT, SERNAGEOMIN o SUSESO.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-rose-400 flex items-center justify-between">
                <span>Entregable:</span>
                <span className="font-semibold text-white">Diplomas QR & Dossier Legal DT</span>
              </div>
            </div>
          </div>

          {/* Implementation Timeline Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                PLAN DE PUESTA EN MARCHA
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Cronograma de Implementación Integral (30 Días Garantizados)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Despliegue ordenado y certificado sin interrumpir la continuidad operativa de la flota.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
                <div className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded w-fit">
                  SEMANA 1 (DÍAS 1-7)
                </div>
                <h4 className="text-sm font-bold text-white">Diagnóstico & RIOHS</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Levantamiento de dotación crítica, auditoría de antecedentes, redacción de la cláusula RIOHS y envío formal de depósito a la DT.
                </p>
                <div className="pt-2 text-[10px] text-slate-400 font-mono">
                  Hito: Cláusula DT Ingresada
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
                <div className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded w-fit">
                  SEMANA 2 (DÍAS 8-14)
                </div>
                <h4 className="text-sm font-bold text-white">Metrología & Software</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Entrega de alcoholímetros Dräger con certificados vigentes, insumos salivales, configuración de bases en el software y asignación de roles.
                </p>
                <div className="pt-2 text-[10px] text-slate-400 font-mono">
                  Hito: Equipos en Garitas
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
                <div className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded w-fit">
                  SEMANA 3 (DÍAS 15-21)
                </div>
                <h4 className="text-sm font-bold text-white">Capacitación & Difusión</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Inducción a la dotación de conductores, entrenamiento a operadores de test en garitas y presentación formal al Comité Paritario.
                </p>
                <div className="pt-2 text-[10px] text-slate-400 font-mono">
                  Hito: Diplomas QR Emitidos
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
                <div className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                  SEMANA 4 (DÍAS 22-30)
                </div>
                <h4 className="text-sm font-bold text-white">Salida en Vivo & Sorteo</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Inicio del control pre-turno diario, ejecución del primer sorteo aleatorio criptográfico y emisión del primer informe mensual para Gerencia.
                </p>
                <div className="pt-2 text-[10px] text-slate-400 font-mono">
                  Hito: Empresa 100% Blindada
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: B2B ROI & PRICING CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">PARÁMETROS OPERACIONALES</span>
              <h3 className="text-lg font-bold text-white mt-1">Configuración de Flota</h3>
            </div>

            {/* Fleet Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Dotación de Conductores Críticos:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{fleetSize} Choferes</span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10 (Flota Pequeña)</span>
                <span>100 (Mediana)</span>
                <span>300+ (Gran Empresa)</span>
              </div>
            </div>

            {/* Industry Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Rubro Operacional:</label>
              <select
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="carga_peligrosa">Transporte de Sustancias Peligrosas (D.S. 298)</option>
                <option value="mineria">Transporte en Gran Minería / Faenas SERNAGEOMIN</option>
                <option value="pasajeros">Transporte Interurbano & Pasajeros (D.S. 212)</option>
                <option value="carga_general">Carga General & Distribución Logística</option>
              </select>
            </div>

            {/* Plan Tier Selector */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-300">Nivel de Servicio Requerido:</label>
              
              <div
                onClick={() => setSelectedPlan('operativo')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedPlan === 'operativo'
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Plan Operativo Básico</span>
                  <span className="text-xs font-mono font-bold text-blue-400">$18.500/chofer</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Control pre-turno + alcoholímetros Dräger + bitácora digital.
                </p>
              </div>

              <div
                onClick={() => setSelectedPlan('blindaje_estandar')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedPlan === 'blindaje_estandar'
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Plan Blindaje Estándar</span>
                  <span className="text-xs font-mono font-bold text-blue-400">$34.900/chofer</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pre-turno + Sorteo SHA-256 + RIOHS DT + Paneles salivales 15% mensual.
                </p>
              </div>

              <div
                onClick={() => setSelectedPlan('blindaje_total_360')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedPlan === 'blindaje_total_360'
                    ? 'bg-gradient-to-r from-blue-600/25 to-indigo-600/25 border-blue-400 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-xs text-white">Plan Blindaje Total 360</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">$52.000/chofer</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Servicio Integral Completo: Equipos Dräger, Saliva 6 drogas, Lab GC-MS, Capacitación QR y Asesoría Pericial DT.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & ROI Result Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">PRESUPUESTO ESTIMADO B2B</span>
                  <h3 className="text-xl font-bold text-white">
                    {selectedPlan === 'blindaje_total_360'
                      ? 'Plan Blindaje Total 360 (Solución Integral)'
                      : selectedPlan === 'blindaje_estandar'
                      ? 'Plan Blindaje Estándar'
                      : 'Plan Operativo Básico'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculado para dotación de {fleetSize} conductores en {currentCompany.businessName}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                    ${monthlyServiceCostCLP.toLocaleString('es-CL')}{' '}
                    <span className="text-xs font-normal text-slate-400">CLP/mes + IVA</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    ${(monthlyServiceCostCLP * 12).toLocaleString('es-CL')} CLP Anualizado
                  </span>
                </div>
              </div>

              {/* ROI & Risk Mitigation Analysis Grid */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Análisis de Retorno de Inversión (ROI) y Mitigación de Pérdidas
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">Ahorro en Rebaja D.S. 67</span>
                    <p className="text-base font-bold text-emerald-400 font-mono">
                      -${annualInsuranceSavingsCLP.toLocaleString('es-CL')}{' '}
                      <span className="text-[10px] font-normal text-slate-400">/año</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Disminución de tasa de cotización adicional en Mutualidad por cero siniestralidad.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">Blindaje ante Multas DT</span>
                    <p className="text-base font-bold text-blue-400 font-mono">
                      Hasta ${(estimatedFinePerDriverDT * 3).toLocaleString('es-CL')}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Evita sanciones de hasta 60 UTM por falta de RIOHS conforme al Dictamen 92064.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">Mitigación Civil & Penal</span>
                    <p className="text-base font-bold text-purple-400 font-mono">
                      +$150.000.000
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Acreditación de debida diligencia patronal eximente de responsabilidad en juicio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Garantía de Depósito Aprobado ante Dirección del Trabajo</span>
                </div>

                <button
                  onClick={() => setActiveTab('contract')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generar Contrato de Servicio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: MATURITY DIAGNOSIS (GAP ANALYSIS) */}
      {activeTab === 'diagnosis' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                HERRAMIENTA DE AUTOEVALUACIÓN SUSESO
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Diagnóstico de Madurez Normativa y Detección de Brechas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Revise el estado actual de su empresa frente a las 7 exigencias críticas del Dictamen SUSESO 92064-2025.
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-extrabold font-mono text-white">
                <span className={totalScore >= 85 ? 'text-emerald-400' : totalScore >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                  {totalScore}%
                </span>
                <span className="text-xs text-slate-400 font-normal"> / 100%</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {totalScore >= 85 ? 'Cumplimiento Avanzado' : totalScore >= 50 ? 'Riesgo Moderado' : 'Vulnerabilidad Crítica'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {diagnosisQuestions.map((q) => {
              const isChecked = !!diagnosisAnswers[q.id];
              return (
                <div
                  key={q.id}
                  onClick={() => setDiagnosisAnswers({ ...diagnosisAnswers, [q.id]: !isChecked })}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                    isChecked
                      ? 'bg-blue-600/10 border-blue-500/40 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                        isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{q.title}</span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-blue-400 shrink-0">
                    +{q.weight} pts
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">¿Cómo alcanzar el 100% de Cumplimiento?</h4>
                <p className="text-[11px] text-slate-400">
                  El Servicio Integral Blindaje Vial 360 cierra automáticamente todas las brechas detectadas en 30 días.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('proposal')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
            >
              Ver Plan de Cierre
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: SLAS & DELIVERABLES */}
      {activeTab === 'sla' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase">
              COMPROMISOS OPERACIONALES (SLA)
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Matriz de Entregables y Acuerdos de Nivel de Servicio
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tiempos de respuesta y estándares técnicos contractuales garantizados por Blindaje Vial 360.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 pr-4">COMPONENTE DEL SERVICIO</th>
                  <th className="pb-3 px-4">ENTREGABLE FORMAL</th>
                  <th className="pb-3 px-4">FRECUENCIA / PLAZO</th>
                  <th className="pb-3 pl-4 text-right">ESTÁNDAR VINCULANTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-white">Controles Pre-Turno Diarios</td>
                  <td className="py-3.5 px-4 font-mono text-blue-400">Pase Digital de Despacho</td>
                  <td className="py-3.5 px-4">Tiempo real (&lt; 2 min/chofer)</td>
                  <td className="py-3.5 pl-4 text-right font-mono text-emerald-400">0.00 g/L Tolerancia Cero</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-white">Sorteo Aleatorio Inopinado</td>
                  <td className="py-3.5 px-4 font-mono text-blue-400">Acta Notariada Criptográfica</td>
                  <td className="py-3.5 px-4">Mensual (15% dotación activa)</td>
                  <td className="py-3.5 pl-4 text-right font-mono text-emerald-400">Algoritmo SHA-256</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-white">Control Post-Accidente</td>
                  <td className="py-3.5 px-4 font-mono text-blue-400">Acta de Investigación DIAT</td>
                  <td className="py-3.5 px-4">Respuesta &lt; 2 horas en ruta</td>
                  <td className="py-3.5 pl-4 text-right font-mono text-emerald-400">Ley 16.744 Art. 76</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-white">Calibración de Instrumental</td>
                  <td className="py-3.5 px-4 font-mono text-blue-400">Certificado Metrológico Oficial</td>
                  <td className="py-3.5 px-4">Semestral (&lt; 180 días)</td>
                  <td className="py-3.5 pl-4 text-right font-mono text-emerald-400">NCh-ISO 17025 / INN</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-white">Confirmación en Laboratorio</td>
                  <td className="py-3.5 px-4 font-mono text-blue-400">Informe Cuantitativo GC-MS</td>
                  <td className="py-3.5 px-4">&lt; 48 a 72 horas hábiles</td>
                  <td className="py-3.5 pl-4 text-right font-mono text-emerald-400">Cadena de Custodia Inviolable</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-white">Soporte ante Fiscalización DT</td>
                  <td className="py-3.5 px-4 font-mono text-blue-400">Dossier Probatorio Consolidado</td>
                  <td className="py-3.5 px-4">Inmediato (&lt; 2 horas)</td>
                  <td className="py-3.5 pl-4 text-right font-mono text-emerald-400">100% Trazabilidad Legal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: CONTRACT & EXPORT */}
      {activeTab === 'contract' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">DOCUMENTO CONTRACTUAL</span>
              <h2 className="text-xl font-bold text-white mt-1">
                Convenio de Prestación de Servicios de Blindaje Normativo
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generado automáticamente para {currentCompany.businessName} (RUT: {currentCompany.rut})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyContract}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
              >
                {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedContract ? 'Copiado' : 'Copiar Texto'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Convenio</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-xs text-slate-300 space-y-4 leading-relaxed whitespace-pre-wrap">
            {`CONTRATO DE PRESTACIÓN DE SERVICIOS INTEGRALES DE PREVENCIÓN Y COMPLIANCE
PROGRAMA BLINDAJE VIAL 360 • DICTAMEN SUSESO N.º 92064-2025

En Santiago de Chile, a ${new Date().toLocaleDateString('es-CL')}, entre:

1. BLINDAJE VIAL 360 SpA, RUT 77.492.110-8, en adelante "El Proveedor de Compliance"; y
2. ${currentCompany.businessName.toUpperCase()}, RUT ${currentCompany.rut}, representada legalmente por don/doña Gerente General, en adelante "La Empresa de Transporte".

PRIMERO: ANTECEDENTES Y PROPÓSITO
El presente contrato tiene por objeto la implementación y operación del Programa Integral de Prevención de Alcohol y Drogas para la dotación de ${fleetSize} conductores profesionales de La Empresa de Transporte, en estricto cumplimiento del Dictamen N.º 92064-2025 de la Superintendencia de Seguridad Social (SUSESO), la Ley N.º 16.744 y el artículo 184 del Código del Trabajo.

SEGUNDO: SERVICIOS Y ENTREGABLES INCLUIDOS
El Proveedor se compromete a suministrar:
a) Software Cloud Blindaje Vial 360 con algoritmo criptográfico SHA-256 para sorteos aleatorios inopinados y bóveda con hash inalterable.
b) Alcoholímetros Dräger Alcotest 6820 evidenciales en comodato con mantención y calibración semestral certificada.
c) Paneles salivales rápidos de 6 drogas (THC, COC, AMP, MET, OPI, BZO) con puntos de corte homologados por el ISP.
d) Redacción, adecuación y gestión de depósito del anexo al RIOHS ante la Dirección del Trabajo (Art. 154 N° 5).
e) Convenio de contraprueba confirmatoria en Laboratorio de Toxicología Acreditado (GC-MS / LC-MS) bajo Cadena de Custodia.
f) Capacitación anual continua con diploma individual y código QR de verificación de competencias para cada conductor.
g) Respaldo pericial y técnico inmediato ante fiscalizaciones de la DT, SUSESO o juicios laborales.

TERCERO: HONORARIOS Y FORMA DE PAGO
La Empresa de Transporte pagará un valor mensual de $${monthlyServiceCostCLP.toLocaleString('es-CL')} CLP más IVA, pagadero dentro de los primeros 5 días hábiles de cada mes calendario.

CUARTO: CONFIDENCIALIDAD Y PROTECCIÓN DE DATOS
Ambas partes declaran que los resultados de las pruebas constituyen datos sensibles de salud protegidos por la Ley N.º 19.628, obligándose a mantener estricta reserva médica.

____________________________________            ____________________________________
    REPRESENTANTE LEGAL CLIENTE                     BLINDAJE VIAL 360 SpA
 RUT: ${currentCompany.rut}                         RUT: 77.492.110-8`}
          </div>
        </div>
      )}

      {/* Suseso Manual Modal Component */}
      <SusesoManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
