import React from 'react';
import { useApp } from '../context/AppContext';
import { NavView } from '../types';
import { RealTimeMetricsPanel } from './RealTimeMetricsPanel';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  FlaskConical,
  Gauge,
  FileCheck2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Dices,
  PlusCircle,
  FileSpreadsheet,
  Briefcase,
  FileCode,
  Sparkles,
  MapPin
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (view: NavView) => void;
  onOpenNewTestModal?: () => void;
  onOpenNewTest?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewTestModal,
  onOpenNewTest
}) => {
  const openModal = onOpenNewTestModal || onOpenNewTest || (() => {});
  const {
    currentCompany,
    drivers,
    vehicles,
    tests,
    equipment,
    legalNorms,
    risks,
    findings,
    documents,
    alerts
  } = useApp();

  // Metrics calculations
  const totalDrivers = drivers.length;
  const blockedDrivers = drivers.filter((d) => d.status === 'bloqueado_preventivo');
  const activeVehicles = vehicles.filter((v) => v.status === 'operativo').length;
  const calibratedEquipment = equipment.filter((e) => e.status === 'calibrado_optimo').length;
  const expiredEquipment = equipment.filter((e) => e.status !== 'calibrado_optimo').length;

  const totalTestsCount = tests.length;
  const positiveTestsCount = tests.filter(
    (t) => t.alcoholStatus !== 'negativo' || t.drugsOverallStatus === 'presunto_positivo' || t.drugsOverallStatus === 'confirmado_positivo'
  ).length;
  const positivityRate = totalTestsCount > 0 ? ((positiveTestsCount / totalTestsCount) * 100).toFixed(1) : '0.0';

  const criticalFindings = findings.filter((f) => f.type === 'No Conformidad Mayor' && f.status !== 'verificada_cerrada').length;
  const openFindings = findings.filter((f) => f.status !== 'verificada_cerrada').length;

  const compliantNormsCount = legalNorms.filter((n) => n.complianceLevel === 'cumple_total').length;
  const compliancePercentage = Math.round((compliantNormsCount / (legalNorms.length || 1)) * 100);

  // Recharts Monthly trend data
  const monthlyData = [
    { mes: 'Mar', controles: 45, positivos: 0, compliance: 92 },
    { mes: 'Abr', controles: 52, positivos: 1, compliance: 94 },
    { mes: 'May', controles: 60, positivos: 0, compliance: 95 },
    { mes: 'Jun', controles: 58, positivos: 1, compliance: 93 },
    { mes: 'Jul', controles: 74, positivos: 0, compliance: 96 },
    { mes: 'Ago', controles: totalTestsCount + 48, positivos: positiveTestsCount + 1, compliance: compliancePercentage },
  ];

  // Test Reasons breakdown
  const reasonsData = [
    { name: 'Pre-turno', value: 58, color: '#3b82f6' },
    { name: 'Aleatorio', value: 34, color: '#8b5cf6' },
    { name: 'Post-incidente', value: 5, color: '#f59e0b' },
    { name: 'Sospecha fundada', value: 3, color: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Executive Overview & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {currentCompany.fantasyName}
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              RUT {currentCompany.rut}
            </span>
            <span className="text-[11px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-medium border border-emerald-500/30">
              Mutualidad: {currentCompany.mutualidad}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Dashboard Ejecutivo de Prevención y Cumplimiento
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo continuo conforme a Ley N° 16.744, SUSESO, Tolerancia Cero e ISO 37301
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('integral_service')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>Servicio Integral B2B</span>
          </button>

          <button
            onClick={() => onNavigate('image_studio')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>Blindaje Studio (IA)</span>
          </button>

          <button
            onClick={() => onNavigate('maps_locator')}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-300" />
            <span>Geo-Localizador & Labs</span>
          </button>

          <button
            onClick={() => onNavigate('specifications')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>Especificaciones (54)</span>
          </button>

          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Control</span>
          </button>

          <button
            onClick={() => onNavigate('random_selection')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <Dices className="w-4 h-4 text-purple-400" />
            <span>Sorteo Aleatorio</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Reporte SUSESO</span>
          </button>
        </div>
      </div>

      {/* Real-Time Metrics Command Station */}
      <RealTimeMetricsPanel
        onNavigate={onNavigate}
        onOpenNewTestModal={openModal}
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Legal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cumplimiento Legal (ISO 37301)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{compliancePercentage}%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2.4% vs mes anterior
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${compliancePercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {compliantNormsCount} de {legalNorms.length} requisitos normativos al 100%
          </p>
        </div>

        {/* Conductores y Estado de Despacho */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Dotación de Conductores</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalDrivers}</span>
            <span className="text-xs font-medium text-slate-400">conductores activos</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {totalDrivers - blockedDrivers.length} Habilitados
            </span>
            {blockedDrivers.length > 0 ? (
              <span className="text-rose-400 font-bold flex items-center gap-1 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                <Lock className="w-3 h-3" /> {blockedDrivers.length} Bloqueados
              </span>
            ) : (
              <span className="text-slate-400">0 bloqueos</span>
            )}
          </div>
        </div>

        {/* Tasa de Positividad & Controles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Controles & Tasa Positividad</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalTestsCount}</span>
            <span className="text-xs font-medium text-slate-400">tests en plataforma</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-300">Positividad:</span>
            <span className={`font-bold font-mono px-2 py-0.5 rounded ${
              Number(positivityRate) === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {positivityRate}% ({positiveTestsCount} casos)
            </span>
          </div>
        </div>

        {/* Calibración Metrológica & Hallazgos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Calibración & Hallazgos</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{calibratedEquipment}/{equipment.length}</span>
            <span className="text-xs font-medium text-slate-400">equipos vigentes</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-300">Hallazgos CAPA:</span>
            <span className={`font-semibold px-2 py-0.5 rounded ${
              criticalFindings > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {openFindings} abiertos ({criticalFindings} críticos)
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Active Block Alert Callout (if any driver blocked) */}
      {blockedDrivers.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 to-slate-900 border border-rose-600/70 rounded-2xl p-4 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-rose-950/40">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600 text-white rounded-xl shadow-md">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-rose-200">
                Acción Preventiva Inmediata: Conductor con Despacho Inhabilitado
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                {blockedDrivers[0].fullName} (RUT: {blockedDrivers[0].rut}) - Reactivo a sustancias. Cadena de custodia enviada a Laboratorio UC-Christus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('lab')}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Ver Cadena de Custodia
            </button>
            <button
              onClick={() => onNavigate('tests')}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition"
            >
              Ver Acta de Examen
            </button>
          </div>
        </div>
      )}

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base text-white">Evolución Mensual de Controles y Cumplimiento</h2>
              <p className="text-xs text-slate-400">Controles preventivos ejecutados vs índice de cumplimiento legal (%)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Controles
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> % Cumplimiento
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="mes" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="controles" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Controles" />
                <Bar dataKey="compliance" fill="#10b981" radius={[4, 4, 0, 0]} name="% Cumplimiento" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Motivos de Examen Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-base text-white">Distribución por Motivo</h2>
            <p className="text-xs text-slate-400">Controles por causal reglamentaria</p>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reasonsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {reasonsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {reasonsData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Superpowers Banner: Blindaje Studio & Google Maps Grounding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Blindaje Studio Image AI */}
        <div className="bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-900 border border-blue-800/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Gemini 3.1 Flash Image
              </span>
              <span className="text-xs text-blue-300/80 font-mono">Motor Visual IA</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
              Blindaje Studio • Generación y Edición Gráfica
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cree y personalice con IA letreros de tolerancia cero para garitas, infografías de protocolos de saliva y afiches preventivos de fatiga para conductores.
            </p>
          </div>
          <button
            onClick={() => onNavigate('image_studio')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Abrir Estudio Visual con IA</span>
          </button>
        </div>

        {/* Card 2: Maps Grounding Labs & Garitas */}
        <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-800/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Google Maps Grounding
              </span>
              <span className="text-xs text-emerald-300/80 font-mono">Gemini 3.7 Flash</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
              Geo-Localizador de Laboratorios & Garitas
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consulte en tiempo real la red territorial de laboratorios acreditados ISO 17025 para confirmación toxicológica, mutualidades y terminales de buses en Chile.
            </p>
          </div>
          <button
            onClick={() => onNavigate('maps_locator')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Consultar Mapa Territorial de Labs</span>
          </button>
        </div>
      </div>

      {/* Operational Highlights Grid: Recent Tests & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Test Records */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-blue-400" />
              Últimos Controles Registrados
            </h2>
            <button
              onClick={() => onNavigate('tests')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Ver todos ({tests.length}) →
            </button>
          </div>

          <div className="space-y-2">
            {tests.slice(0, 4).map((test) => (
              <div
                key={test.id}
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-750 rounded-xl flex items-center justify-between gap-3 text-xs transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{test.driverName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{test.driverRut}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>{test.reason}</span>
                    <span>•</span>
                    <span>{test.timestamp}</span>
                    <span>•</span>
                    <span className="font-mono">{test.code}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                      test.overallStatus === 'apto_despacho'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {test.overallStatus === 'apto_despacho' ? 'APTO DESPACHO' : 'BLOQUEADO'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Alc: {test.alcoholValueGramsPerLiter.toFixed(2)} g/L
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory & Metrology Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Estado de Cumplimiento Crítico
            </h2>
            <button
              onClick={() => onNavigate('compliance')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Matriz Completa →
            </button>
          </div>

          <div className="space-y-2.5">
            {legalNorms.slice(0, 4).map((norm) => (
              <div
                key={norm.id}
                className="p-3 bg-slate-800/60 border border-slate-750 rounded-xl text-xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 truncate">{norm.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {norm.body} • {norm.article}
                  </p>
                </div>

                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                    norm.complianceLevel === 'cumple_total'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : norm.complianceLevel === 'cumple_parcial'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {norm.complianceLevel === 'cumple_total'
                    ? '100% CUMPLE'
                    : norm.complianceLevel === 'cumple_parcial'
                    ? 'PARCIAL (ACCIÓN)'
                    : 'NO CUMPLE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
