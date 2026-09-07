import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NavView } from '../types';
import {
  Activity,
  ClipboardCheck,
  Gauge,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
  Zap,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
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
  Cell
} from 'recharts';

interface RealTimeMetricsPanelProps {
  onNavigate: (view: NavView) => void;
  onOpenNewTestModal?: () => void;
}

export const RealTimeMetricsPanel: React.FC<RealTimeMetricsPanelProps> = ({
  onNavigate,
  onOpenNewTestModal
}) => {
  const { audits, findings, equipment, tests, drivers } = useApp();
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '24h'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date(2026, 7, 31, 17, 57));

  // Reference date in app scenario: Aug 31, 2026
  const refDate = new Date(2026, 7, 31);

  // Trigger brief visual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  // 1. STATS: Pending Audits & CAPA
  const auditMetrics = useMemo(() => {
    const pendingAudits = audits.filter(
      (a) => a.status === 'en_curso' || a.status === 'programada' || a.status === 'planificada' || a.status === 'pendiente'
    );
    const activeAudits = audits.filter((a) => a.status === 'en_curso');
    const closedAudits = audits.filter((a) => a.status === 'cerrada' || a.status === 'completada');
    
    const openFindings = findings.filter((f) => f.status !== 'cerrada');
    const criticalFindings = findings.filter(
      (f) => (f.type === 'No Conformidad Mayor' || f.type === 'critico') && f.status !== 'cerrada'
    );
    const inProgressFindings = findings.filter((f) => f.status === 'en_implementacion' || f.status === 'abierta');

    const averageAuditScore = audits.length > 0
      ? Math.round(audits.reduce((acc, a) => acc + (a.score || 90), 0) / audits.length)
      : 92;

    return {
      totalAudits: audits.length,
      pendingCount: pendingAudits.length,
      activeCount: activeAudits.length,
      closedCount: closedAudits.length,
      openFindingsCount: openFindings.length,
      criticalFindingsCount: criticalFindings.length,
      inProgressFindingsCount: inProgressFindings.length,
      averageScore: averageAuditScore,
      pendingList: pendingAudits
    };
  }, [audits, findings]);

  // 2. STATS: Equipment Calibration & Certifications
  const equipmentMetrics = useMemo(() => {
    let overdueCount进 = 0;
    let expiringIn30DaysCount = 0;
    let validCount = 0;

    const overdueList: typeof equipment = [];
    const expiringList: typeof equipment = [];

    equipment.forEach((eq) => {
      const expDate = new Date(eq.nextCalibrationDate);
      const diffTime = expDate.getTime() - refDate.getTime();
      const diffDays作成 = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays作成 < 0 || eq.status === 'descalibrado_fuera_servicio' || eq.status === 'vencido') {
        overdueCount进++;
        overdueList.push(eq);
      } else if (diffDays作成 <= 30 || eq.status === 'proximo_a_vencer') {
        expiringIn30DaysCount++;
        expiringList.push(eq);
      } else {
        validCount++;
      }
    });

    const totalEq = equipment.length || 1;
    const certificationHealthRate = Math.round(((totalEq - overdueCount进) / totalEq) * 100);

    // Categories breakdown
    const alcolocks = equipment.filter((e) => e.type.toLowerCase().includes('alcolock') || e.type.toLowerCase().includes('interlock'));
    const breathalyzers = equipment.filter((e) => e.type.toLowerCase().includes('etilómetro') || e.type.toLowerCase().includes('alcotest'));
    const drugKits = equipment.filter((e) => e.type.toLowerCase().includes('saliva') || e.type.toLowerCase().includes('reactivo'));
    const labAccreditations深受 = equipment.filter((e) => e.type.toLowerCase().includes('laboratorio') || e.type.toLowerCase().includes('acreditación'));

    return {
      total: equipment.length,
      overdueCount: overdueCount进,
      expiringIn30DaysCount,
      validCount,
      certificationHealthRate,
      overdueList,
      expiringList,
      alcolocksCount: alcolocks.length,
      breathalyzersCount: breathalyzers.length,
      drugKitsCount: drugKits.length,
      labsCount: labAccreditations深受.length
    };
  }, [equipment, refDate]);

  // 3. STATS: Recent Test Compliance Rates
  const testMetrics = useMemo(() => {
    const totalTests = tests.length || 1;
    const aptoDespacho = tests.filter((t) => t.overallStatus === 'apto_despacho');
    const blockedNonCompliant = tests.filter((t) => t.overallStatus === 'no_apto_bloqueado');
    const pendingLabConfirm = tests.filter((t) => t.overallStatus === 'en_espera_lab');

    // Alcohol 0.00 Compliance
    const zeroAlcoholTests = tests.filter(
      (t) => t.alcoholTested && (t.alcoholStatus === 'negativo' || t.alcoholValueGramsPerLiter === 0)
    );
    const alcoholComplianceRate = tests.filter((t) => t.alcoholTested).length > 0
      ? ((zeroAlcoholTests.length / tests.filter((t) => t.alcoholTested).length) * 100).toFixed(1)
      : '100.0';

    // Drugs Saliva Non-Reactivity
    const drugsTestedCount = tests.filter((t) => t.drugsTested).length;
    const cleanDrugsTests = tests.filter((t) => t.drugsTested && t.drugsOverallStatus === 'negativo');
    const drugComplianceRate = drugsTestedCount > 0
      ? ((cleanDrugsTests.length / drugsTestedCount) * 100).toFixed(1)
      : '100.0';

    // Overall test compliance rate
    const overallComplianceRate = ((aptoDespacho.length / totalTests) * 100).toFixed(1);

    // Breakdown by test reason
    const preShiftTests = tests.filter((t) => t.reason === 'Pre-turno');
    const preShiftCompliant = preShiftTests.filter((t) => t.overallStatus === 'apto_despacho').length;
    const preShiftRate = preShiftTests.length > 0 ? Math.round((preShiftCompliant / preShiftTests.length) * 100) : 100;

    const randomTests = tests.filter((t) => t.reason === 'Aleatorio');
    const randomCompliant = randomTests.filter((t) => t.overallStatus === 'apto_despacho').length;
    const randomRatevol = randomTests.length > 0 ? Math.round((randomCompliant / randomTests.length) * 100) : 100;

    const postIncidentTests = tests.filter((t) => t.reason === 'Post-incidente');
    const postIncidentCompliant = postIncidentTests.filter((t) => t.overallStatus === 'apto_despacho').length;
    const postIncidentRate = postIncidentTests.length > 0 ? Math.round((postIncidentCompliant / postIncidentTests.length) * 100) : 100;

    return {
      totalTests: tests.length,
      aptoCount: aptoDespacho.length,
      blockedCount: blockedNonCompliant.length,
      pendingLabCount: pendingLabConfirm.length,
      overallComplianceRate,
      alcoholComplianceRate,
      drugComplianceRate,
      preShiftCount: preShiftTests.length,
      preShiftRate,
      randomCount: randomTests.length,
      randomRate: randomRatevol,
      postIncidentCount: postIncidentTests.length,
      postIncidentRate
    };
  }, [tests]);

  // Mini Chart data for quick compliance breakdown
  const complianceBreakdownData = [
    { name: 'Alcohol 0.00 g/L', rate: parseFloat(testMetrics.alcoholComplianceRate), target: 100, fill: '#10b981' },
    { name: 'Panel Drogas Saliva', rate: parseFloat(testMetrics.drugComplianceRate), target: 100, fill: '#6366f1' },
    { name: 'Calibración Equipos', rate: equipmentMetrics.certificationHealthRate, target: 100, fill: '#f59e0b' },
    { name: 'Auditorías Conformidad', rate: auditMetrics.averageScore, target: 95, fill: '#3b82f6' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-5 backdrop-blur-xs">
      {/* Real-time Header & Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Métricas en Tiempo Real & Monitor de Control Operativo
              </h2>
              <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Estado consolidado de auditorías ISO 37301, calibraciones metrológicas y tasa de aptitud en despacho
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                timeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                timeFilter === '7d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Últimos 7 Días
            </button>
            <button
              onClick={() => setTimeFilter('24h')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                timeFilter === '24h' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Turno Actual
            </button>
          </div>

          <button
            onClick={handleRefresh}
            title="Sincronizar telemetría de garitas y alcolocks"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
        </div>
      </div>

      {/* 3 Core Summary Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARD 1: PENDING AUDITS & CAPA */}
        <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4" />
                Auditorías & Planes CAPA
              </span>
              <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                ISO 37301
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white">{auditMetrics.pendingCount}</span>
                <span className="text-xs text-slate-400 ml-2">auditorías pendientes</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-indigo-300">{auditMetrics.activeCount} en ejecución</span>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-xs pt-3 border-t border-slate-850">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Hallazgos CAPA Abiertos:
                </span>
                <span className="font-bold text-amber-300 font-mono">{auditMetrics.openFindingsCount}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  No Conformidades Mayores:
                </span>
                <span className={`font-bold font-mono px-1.5 py-0.2 rounded text-[11px] ${
                  auditMetrics.criticalFindingsCount > 0
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {auditMetrics.criticalFindingsCount} críticas
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Puntaje Auditoría Promedio:</span>
                <span className="font-bold text-emerald-400 font-mono">{auditMetrics.averageScore}%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-850">
            <button
              onClick={() => onNavigate('audits')}
              className="w-full flex items-center justify-between text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition py-1 cursor-pointer"
            >
              <span>Ver Auditorías y Hallazgos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* CARD 2: OVERDUE EQUIPMENT CERTIFICATIONS */}
        <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                Certificaciones Metrológicas
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                NCh 17025
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className={`text-3xl font-extrabold ${equipmentMetrics.overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {equipmentMetrics.overdueCount}
                </span>
                <span className="text-xs text-slate-400 ml-2">equipos vencidos</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-amber-400 font-mono">
                  {equipmentMetrics.expiringIn30DaysCount} por vencer (≤30d)
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-xs pt-3 border-t border-slate-850">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Vigencia Metrológica Global:</span>
                <span className="font-bold text-emerald-400 font-mono">{equipmentMetrics.certificationHealthRate}%</span>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    equipmentMetrics.certificationHealthRate >= 90
                      ? 'bg-emerald-500'
                      : equipmentMetrics.certificationHealthRate >= 75
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${equipmentMetrics.certificationHealthRate}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Alcolocks Vehiculares</span>
                  <span className="font-bold text-white font-mono">{equipmentMetrics.alcolocksCount} activos</span>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Etilómetros Dräger</span>
                  <span className="font-bold text-white font-mono">{equipmentMetrics.breathalyzersCount} en garitas</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-850">
            <button
              onClick={() => onNavigate('audits')}
              className="w-full flex items-center justify-between text-xs font-semibold text-amber-400 hover:text-amber-300 transition py-1 cursor-pointer"
            >
              <span>Ver Calendario de Vencimientos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* CARD 3: RECENT TEST COMPLIANCE RATES */}
        <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4" />
                Tasa de Aptitud & Controles
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                TOLERANCIA CERO
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-emerald-400">
                  {testMetrics.overallComplianceRate}%
                </span>
                <span className="text-xs text-slate-400 ml-2">aptos para despacho</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-300 font-mono">
                  {testMetrics.aptoCount}/{testMetrics.totalTests} tests
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-xs pt-3 border-t border-slate-850">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Alcohotest Negativo (0.00 g/L):
                </span>
                <span className="font-bold text-emerald-300 font-mono">{testMetrics.alcoholComplianceRate}%</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  Saliva Drogas No Reactivo:
                </span>
                <span className="font-bold text-indigo-300 font-mono">{testMetrics.drugComplianceRate}%</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Casos Bloqueados en Garita:
                </span>
                <span className="font-bold text-rose-400 font-mono">{testMetrics.blockedCount} retenidos</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-850">
            <button
              onClick={() => onNavigate('tests')}
              className="w-full flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition py-1 cursor-pointer"
            >
              <span>Ver Registro de Controles</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

      </div>

      {/* Compliance Benchmark Bar & Operational Breakdown */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Índices de Conformidad Operativa en Tiempo Real</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Meta Corporativa: 100%</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Medición continua de pre-turnos garita, sorteos aleatorios mensuales y calibraciones bajo norma NCh 17025.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-slate-400">Pre-Turno:</span>
            <span className="font-mono font-bold text-emerald-400">{testMetrics.preShiftRate}%</span>
            <span className="text-[10px] text-slate-500">({testMetrics.preShiftCount} tests)</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-slate-400">Aleatorio:</span>
            <span className="font-mono font-bold text-indigo-400">{testMetrics.randomRate}%</span>
            <span className="text-[10px] text-slate-500">({testMetrics.randomCount} tests)</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-slate-400">Post-Incidente:</span>
            <span className="font-mono font-bold text-emerald-400">{testMetrics.postIncidentRate}%</span>
            <span className="text-[10px] text-slate-500">({testMetrics.postIncidentCount} tests)</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-slate-400">Metrología:</span>
            <span className="font-mono font-bold text-amber-400">{equipmentMetrics.certificationHealthRate}%</span>
            <span className="text-[10px] text-slate-500">({equipmentMetrics.total} equipos)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
