import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  Truck,
  Gauge,
  UserCheck,
  Lock,
  Unlock,
  Activity,
  History,
  Info,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Driver, TestRecord, Vehicle, AlertItem } from '../types';

export interface DriverRiskData {
  driver: Driver;
  scores: {
    alcohol: number;
    drugs: number;
    psychotechnical: number;
    alcolock: number;
    attendance: number;
    roadSafety: number;
  };
  radarPoints: Array<{
    dimension: string;
    shortName: string;
    score: number;
    benchmark: number;
    fullMark: number;
    status: 'optimo' | 'advertencia' | 'critico';
  }>;
  overallScore: number;
  riskLevel: 'bajo' | 'moderado' | 'alto' | 'critico';
  riskLabel: string;
  incidents: Array<{
    id: string;
    date: string;
    title: string;
    type: 'positivo_droga' | 'alcolock_bloqueo' | 'vencimiento_psicotecnico' | 'exceso_jornada' | 'frenada_brusca' | 'control_conforme';
    severity: 'critica' | 'alta' | 'media' | 'baja' | 'info';
    description: string;
    mitigationAction?: string;
  }>;
  summaryMetrics: {
    totalTests: number;
    negativeTests: number;
    positiveTests: number;
    daysToPsychotechnicalExpiry: number;
    alcolockStatus: string;
    assignedPlate?: string;
    assignedModel?: string;
  };
}

interface DriverRiskRadarProps {
  selectedDriver: Driver;
  onSelectDriver: (driver: Driver) => void;
  drivers: Driver[];
  tests: TestRecord[];
  vehicles: Vehicle[];
  alerts?: AlertItem[];
  onToggleStatus?: (driver: Driver) => void;
  onOpenNewTestModal?: () => void;
}

export const DriverRiskRadar: React.FC<DriverRiskRadarProps> = ({
  selectedDriver,
  onSelectDriver,
  drivers,
  tests,
  vehicles,
  alerts = [],
  onToggleStatus
}) => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'tests' | 'mitigation'>('incidents');

  // Calculate detailed risk data for the selected driver
  const riskData: DriverRiskData = useMemo(() => {
    const driverTests = tests.filter(
      (t) => t.driverId === selectedDriver.id || t.driverRut === selectedDriver.rut
    );
    const assignedVeh = vehicles.find((v) => v.assignedDriverId === selectedDriver.id);

    // Calculate days until psychotechnical expires (based on reference current date Sept 2026)
    const refDate = new Date('2026-09-06').getTime();
    const psychoDate = new Date(selectedDriver.psychotechnicalExpiry).getTime();
    const daysToPsycho = Math.round((psychoDate - refDate) / (1000 * 60 * 60 * 24));

    // Specific deterministic calculation per driver with dynamic fallback
    let alcoholScore = 100;
    let drugsScore = 100;
    let psychoScore = 95;
    let alcolockScore = 94;
    let attendanceScore = 95;
    let roadSafetyScore = 93;
    const incidentsList: DriverRiskData['incidents'] = [];

    // Check tests in context
    const hasDrugPositive = driverTests.some(
      (t) =>
        t.drugsOverallStatus === 'presunto_positivo' ||
        t.drugsOverallStatus === 'confirmado_positivo' ||
        t.drugPanelResults?.some(
          (d) => d.result === 'presunto_positivo' || d.result === 'confirmado_positivo'
        )
    );
    const hasAlcoholPositive = driverTests.some(
      (t) => t.alcoholStatus !== 'negativo' || t.alcoholValueGramsPerLiter > 0
    );
    const hasRefusal = driverTests.some(
      (t) => t.alcoholStatus === 'rechaza_test' || t.drugsOverallStatus === 'rechaza_test'
    );

    // 1. Alcohol Score
    if (hasRefusal) {
      alcoholScore = 0;
    } else if (hasAlcoholPositive) {
      alcoholScore = 20;
    } else {
      alcoholScore = 100;
    }

    // 2. Drug Screen Score
    if (hasRefusal) {
      drugsScore = 0;
    } else if (hasDrugPositive || selectedDriver.id === 'drv-02') {
      drugsScore = 22;
    } else {
      drugsScore = 98;
    }

    // 3. Psychotechnical Score
    if (daysToPsycho < 0) {
      psychoScore = 25; // Expired
    } else if (daysToPsycho <= 10) {
      psychoScore = 42; // Imminent expiry
    } else if (daysToPsycho <= 30) {
      psychoScore = 65; // Warning
    } else {
      psychoScore = 96;
    }

    // 4. Alcolock & Telemetry Score
    if (assignedVeh?.alcolockStatus === 'bloqueado' || assignedVeh?.status === 'bloqueado_seguridad') {
      alcolockScore = 28;
    } else if (!assignedVeh?.hasAlcolock) {
      alcolockScore = 75;
    } else if (assignedVeh?.alcolockStatus === 'requiere_calibracion') {
      alcolockScore = 60;
    } else {
      alcolockScore = 95;
    }

    // 5. Attendance / Test regularity
    if (selectedDriver.totalTests >= 20) {
      attendanceScore = 98;
    } else if (selectedDriver.totalTests >= 10) {
      attendanceScore = 92;
    } else {
      attendanceScore = 80;
    }

    // 6. Road Safety & Hours
    if (selectedDriver.status === 'bloqueado_preventivo') {
      roadSafetyScore = 55;
    } else if (daysToPsycho <= 10) {
      roadSafetyScore = 82;
    } else {
      roadSafetyScore = 94;
    }

    // Custom incidents tailored to driver profiles in initialData
    if (selectedDriver.id === 'drv-02') {
      // Cristian Alejandro Vera
      drugsScore = 22;
      psychoScore = 42;
      alcolockScore = 28;
      roadSafetyScore = 52;
      attendanceScore = 74;

      incidentsList.push(
        {
          id: 'inc-01',
          date: '2026-08-30 06:46',
          title: 'Reactividad a THC en Test Aleatorio Salivar',
          type: 'positivo_droga',
          severity: 'critica',
          description:
            'Test CTR-2026-0842 arrojó reactivo presunto para Marihuana (THC 15 ng/mL). Activación de Protocolo de Cadena de Custodia N° CC-2026-0842 enviada a Laboratorio UC-Christus.',
          mitigationAction: 'Bloqueo preventivo de despacho según RIOHS Cláusula 21 hasta informe GC-MS confirmatorio.'
        },
        {
          id: 'inc-02',
          date: '2026-08-26 11:30',
          title: 'No Conformidad Mayor Alcolock Cabina (HAL-2026-001)',
          type: 'alcolock_bloqueo',
          severity: 'alta',
          description:
            'Tractocamión asignado Volvo LP-XT-89 presentó certificado de calibración semestral de Alcolock vencido. Vehículo bloqueado en patio.',
          mitigationAction: 'Revisión técnica y calibración metrológica agendada en terreno con Metrología Chile.'
        },
        {
          id: 'inc-03',
          date: '2026-08-15 08:00',
          title: 'Alerta Preventiva: Psicotécnico Riguroso por Vencer',
          type: 'vencimiento_psicotecnico',
          severity: 'media',
          description: 'Examen psicotécnico riguroso Ley 18.290 vence el 12/09/2026 (en 6 días). Requiere reevaluación.',
          mitigationAction: 'Agendamiento de hora médica en Mutualidad de Seguridad.'
        }
      );
    } else if (selectedDriver.id === 'drv-04') {
      // Felipe Andrés Poblete Toro
      psychoScore = 40;
      roadSafetyScore = 80;
      attendanceScore = 82;

      incidentsList.push(
        {
          id: 'inc-04',
          date: '2026-09-02 09:00',
          title: 'Vencimiento Inminente de Psicotécnico Riguroso',
          type: 'vencimiento_psicotecnico',
          severity: 'alta',
          description:
            'El certificado psicotécnico de Felipe Poblete venció el 02/09/2026. Legalmente no puede operar camiones de carga de alto tonelaje sin renovación.',
          mitigationAction: 'Suspender asignación de rutas largas hasta emisión de nuevo certificado psicotécnico.'
        },
        {
          id: 'inc-05',
          date: '2026-08-14 17:35',
          title: 'Evento Telemetría: Frenado Brusco en Ruta 78',
          type: 'frenada_brusca',
          severity: 'baja',
          description: 'Desaceleración > 12 km/h/s registrada por GPS telemático en acceso a San Antonio. Sin daños materiales.',
          mitigationAction: 'Retroalimentación formativa en conducción a la defensiva con supervisor de flota.'
        },
        {
          id: 'inc-06',
          date: '2026-08-25 14:10',
          title: 'Control Pre-Turno Conforme',
          type: 'control_conforme',
          severity: 'info',
          description: 'Alcotest 0.00 g/L Tolerancia Cero y panel saliva 6 drogas 100% no reactivo en Garita San Antonio.',
          mitigationAction: 'Habilitado normalmente para despacho de contenedores.'
        }
      );
    } else if (selectedDriver.id === 'drv-01') {
      // Jorge Eduardo Muñoz
      incidentsList.push(
        {
          id: 'inc-07',
          date: '2026-08-30 06:15',
          title: 'Control Pre-Turno 100% Conforme',
          type: 'control_conforme',
          severity: 'info',
          description: 'Alcotest 0.00 g/L (Dräger 6820) y Panel Salivar 6-Drogas no reactivo. Despacho autorizado con carga química.',
          mitigationAction: 'Cumplimiento ejemplar verificado por Prevención de Riesgos.'
        },
        {
          id: 'inc-08',
          date: '2026-07-20 10:00',
          title: 'Revalidación de Licencia Clase A5 Conforme',
          type: 'control_conforme',
          severity: 'info',
          description: 'Exámenes médicos y psicotécnicos en ACHS aprobados sin restricciones visuales ni motoras.',
          mitigationAction: 'Registro ingresado en plataforma con vigencia hasta Octubre 2026.'
        }
      );
    } else {
      // Default incidents for other clean drivers
      incidentsList.push(
        {
          id: `inc-${selectedDriver.id}-1`,
          date: selectedDriver.lastTestDate || '2026-08-29 08:00',
          title: 'Control Preventivo Toxicológico Conforme',
          type: 'control_conforme',
          severity: 'info',
          description: `Último examen realizado con resultado ${selectedDriver.lastTestResult || 'negativo'} (0.00 g/L y 0 drogas detectadas).`,
          mitigationAction: 'Habilitado conforme a matriz ISO 37301.'
        },
        {
          id: `inc-${selectedDriver.id}-2`,
          date: '2026-08-01 09:30',
          title: 'Verificación de Bitácora y Descanso Art. 25 bis CT',
          type: 'control_conforme',
          severity: 'info',
          description: 'Cumplimiento riguroso de tiempos de conducción continua (< 5 horas) y pausas de descanso en ruta.',
          mitigationAction: 'Registro telemático conforme en plataforma.'
        }
      );
    }

    // Weighted Overall Score calculation
    const weightedScore = Math.round(
      alcoholScore * 0.25 +
      drugsScore * 0.25 +
      psychoScore * 0.15 +
      alcolockScore * 0.15 +
      attendanceScore * 0.10 +
      roadSafetyScore * 0.10
    );

    let riskLevel: DriverRiskData['riskLevel'] = 'bajo';
    let riskLabel = 'Bajo Riesgo • Conductor Apto';

    if (weightedScore < 60 || selectedDriver.status === 'bloqueado_preventivo') {
      riskLevel = 'critico';
      riskLabel = 'Alto Riesgo • Despacho Bloqueado';
    } else if (weightedScore < 75 || daysToPsycho <= 10) {
      riskLevel = 'moderado';
      riskLabel = 'Riesgo Moderado • Alerta Preventiva';
    } else if (weightedScore < 85) {
      riskLevel = 'moderado';
      riskLabel = 'Riesgo Controlado • Conforme';
    } else {
      riskLevel = 'bajo';
      riskLabel = 'Bajo Riesgo • Conductor Certificado';
    }

    const radarPoints = [
      {
        dimension: 'Alcoholemia (0.00 g/L)',
        shortName: 'Alcoholemia',
        score: alcoholScore,
        benchmark: 90,
        fullMark: 100,
        status: alcoholScore >= 90 ? 'optimo' : alcoholScore >= 70 ? 'advertencia' : 'critico'
      },
      {
        dimension: 'Tamizaje Drogas (Saliva)',
        shortName: 'Drogas 6-P',
        score: drugsScore,
        benchmark: 90,
        fullMark: 100,
        status: drugsScore >= 90 ? 'optimo' : drugsScore >= 70 ? 'advertencia' : 'critico'
      },
      {
        dimension: 'Psicotécnico & Licencia',
        shortName: 'Psicotécnico',
        score: psychoScore,
        benchmark: 85,
        fullMark: 100,
        status: psychoScore >= 85 ? 'optimo' : psychoScore >= 60 ? 'advertencia' : 'critico'
      },
      {
        dimension: 'Alcolock & Telemetría',
        shortName: 'Alcolock',
        score: alcolockScore,
        benchmark: 85,
        fullMark: 100,
        status: alcolockScore >= 85 ? 'optimo' : alcolockScore >= 60 ? 'advertencia' : 'critico'
      },
      {
        dimension: 'Adherencia a Controles',
        shortName: 'Adherencia',
        score: attendanceScore,
        benchmark: 85,
        fullMark: 100,
        status: attendanceScore >= 85 ? 'optimo' : attendanceScore >= 70 ? 'advertencia' : 'critico'
      },
      {
        dimension: 'Seguridad en Ruta & Horas',
        shortName: 'Seguridad Ruta',
        score: roadSafetyScore,
        benchmark: 85,
        fullMark: 100,
        status: roadSafetyScore >= 85 ? 'optimo' : roadSafetyScore >= 70 ? 'advertencia' : 'critico'
      }
    ] as DriverRiskData['radarPoints'];

    return {
      driver: selectedDriver,
      scores: {
        alcohol: alcoholScore,
        drugs: drugsScore,
        psychotechnical: psychoScore,
        alcolock: alcolockScore,
        attendance: attendanceScore,
        roadSafety: roadSafetyScore
      },
      radarPoints,
      overallScore: weightedScore,
      riskLevel,
      riskLabel,
      incidents: incidentsList,
      summaryMetrics: {
        totalTests: selectedDriver.totalTests,
        negativeTests: selectedDriver.totalTests - (hasDrugPositive ? 1 : 0),
        positiveTests: hasDrugPositive ? 1 : 0,
        daysToPsychotechnicalExpiry: daysToPsycho,
        alcolockStatus: assignedVeh?.hasAlcolock ? assignedVeh.alcolockStatus || 'calibrado' : 'Sin Alcolock',
        assignedPlate: assignedVeh?.plate,
        assignedModel: assignedVeh?.brandModel
      }
    };
  }, [selectedDriver, tests, vehicles]);

  // Color scheme based on risk score
  const isCritical = riskData.riskLevel === 'critico';
  const isModerate = riskData.riskLevel === 'moderado';

  const radarColor = isCritical ? '#F43F5E' : isModerate ? '#F59E0B' : '#10B981';
  const badgeBg = isCritical
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : isModerate
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  const driverTestsList = tests.filter(
    (t) => t.driverId === selectedDriver.id || t.driverRut === selectedDriver.rut
  );

  return (
    <div
      id="driver-risk-radar-panel"
      className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6 transition-all"
    >
      {/* Top Header & Driver Quick Switcher */}
      <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/30 uppercase tracking-wider">
              <Activity className="w-3 h-3 text-blue-400" />
              MATRIZ METROLÓGICA DE RIESGO INDIVIDUAL • LEY 16.744 & ISO 37301
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeBg}`}>
              {riskData.riskLabel}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Perfil de Riesgo y Confiabilidad del Conductor</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            Gráfico de radar multidimensional que pondera controles de alcoholemia, paneles de drogas en saliva,
            vigencia de examen psicotécnico riguroso y telemetría de Alcolock en cabina.
          </p>
        </div>

        {/* Driver Selector Dropdown / Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
            Seleccionar Conductor:
          </label>
          <div className="relative">
            <select
              value={selectedDriver.id}
              onChange={(e) => {
                const found = drivers.find((d) => d.id === e.target.value);
                if (found) onSelectDriver(found);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 pr-8 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} ({d.rut}) - {d.status === 'bloqueado_preventivo' ? 'BLOQUEADO' : 'HABILITADO'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Radar & Score Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Visual Recharts Radar Chart */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner min-h-[360px]">
          <div className="w-full flex items-center justify-between px-2 mb-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Diagrama Polar de Aptitud Operacional (6 Ejes)</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: radarColor }} />
                {selectedDriver.fullName.split(' ')[0]}
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-400" />
                Estándar Seguro (85%)
              </span>
            </div>
          </div>

          <div className="w-full h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={riskData.radarPoints}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="dimension"
                  stroke="#94A3B8"
                  tick={{ fill: '#CBD5E1', fontSize: 10, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="#475569"
                  tick={{ fill: '#64748B', fontSize: 9 }}
                />
                {/* Safe Fleet Benchmark Polygon */}
                <Radar
                  name="Estándar Seguro (ISO 37301)"
                  dataKey="benchmark"
                  stroke="#10B981"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="#10B981"
                  fillOpacity={0.08}
                />
                {/* Driver Polygon */}
                <Radar
                  name={selectedDriver.fullName}
                  dataKey="score"
                  stroke={radarColor}
                  strokeWidth={2.5}
                  fill={radarColor}
                  fillOpacity={0.35}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.dimension}</p>
                          <div className="flex items-center justify-between gap-4 text-slate-300 font-mono">
                            <span>Puntaje Conductor:</span>
                            <span className="font-bold text-white text-sm">{data.score}/100</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-slate-400 font-mono text-[11px]">
                            <span>Estándar Tolerancia Cero:</span>
                            <span className="text-emerald-400">{data.benchmark}/100</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                            Estado: {data.score >= 85 ? 'Óptimo Conforme' : data.score >= 60 ? 'Advertencia Preventiva' : 'Crítico / No Conforme'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/60 px-2">
            <span>Escala: 0 (Riesgo Crítico) a 100 (Seguridad Absoluta)</span>
            <span>Metodología: Tolerancia Cero Chile</span>
          </div>
        </div>

        {/* Right Column: Driver Executive Profile & Metric Bars */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Driver Card Header */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={selectedDriver.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={selectedDriver.fullName}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-700 shadow"
              />
              <div>
                <h3 className="text-base font-bold text-white leading-tight">{selectedDriver.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">RUT: {selectedDriver.rut}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded font-medium">
                    {selectedDriver.assignedBase}
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono">
                    Lic: {selectedDriver.licenseClass.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Score Dial */}
            <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 w-22">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Índice Aptitud</span>
              <span
                className="text-2xl font-black font-mono leading-none my-0.5"
                style={{ color: radarColor }}
              >
                {riskData.overallScore}
              </span>
              <span className="text-[9px] text-slate-500 font-mono">de 100</span>
            </div>
          </div>

          {/* 6 Dimension Breakdown Bars */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1 border-b border-slate-800">
              <span>Desglose por Dimensión de Riesgo</span>
              <span className="text-[10px] text-slate-500 font-mono">Score / 100</span>
            </div>

            {riskData.radarPoints.map((pt) => {
              const barColor =
                pt.score >= 85 ? 'bg-emerald-500' : pt.score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <div key={pt.dimension} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 text-[11px] font-medium">{pt.dimension}</span>
                    <span className="font-mono font-bold text-xs" style={{ color: pt.score >= 85 ? '#34D399' : pt.score >= 60 ? '#FBBF24' : '#FB7185' }}>
                      {pt.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${pt.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Alert & Quick Action */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              isCritical
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                : isModerate
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isCritical ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              ) : isModerate ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div>
                <p className="font-bold leading-tight">
                  {isCritical
                    ? 'Bloqueo Preventivo Activo'
                    : isModerate
                    ? 'Vigilancia Preventiva Recomendada'
                    : 'Apto para Despacho en Rutas Críticas'}
                </p>
                <p className="text-[11px] opacity-80">
                  {isCritical
                    ? 'Inhabilitado de despacho hasta aclaración legal de muestras.'
                    : isModerate
                    ? 'Atención a vencimiento psicotécnico o telemetría.'
                    : 'Cumple 100% normativa Ley 16.744 y SUSESO.'}
                </p>
              </div>
            </div>

            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(selectedDriver)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  isCritical
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {selectedDriver.status === 'bloqueado_preventivo' ? 'Gestionar Bloqueo' : 'Suspender Despacho'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Evidence, History, & Incidents */}
      <div className="border-t border-slate-800 bg-slate-950/80 px-6 pt-4 pb-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Incidentes & Eventos de Seguridad ({riskData.incidents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial de Controles ({driverTestsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mitigation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'mitigation'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Directrices de Mitigación SUSESO</span>
          </button>
        </div>

        {/* Tab 1: Safety Incidents */}
        {activeTab === 'incidents' && (
          <div className="space-y-3">
            {riskData.incidents.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3">No hay incidentes de seguridad registrados para este conductor.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskData.incidents.map((inc) => {
                  const severityStyle =
                    inc.severity === 'critica'
                      ? 'border-rose-700/60 bg-rose-950/20 text-rose-300'
                      : inc.severity === 'alta'
                      ? 'border-amber-700/60 bg-amber-950/20 text-amber-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300';

                  return (
                    <div
                      key={inc.id}
                      className={`border rounded-xl p-3.5 space-y-2 flex flex-col justify-between ${severityStyle}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono text-slate-400">{inc.date}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              inc.severity === 'critica'
                                ? 'bg-rose-500/30 text-rose-200'
                                : inc.severity === 'alta'
                                ? 'bg-amber-500/30 text-amber-200'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-white leading-snug">{inc.title}</h4>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{inc.description}</p>
                      </div>

                      {inc.mitigationAction && (
                        <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-1.5">
                          <span className="font-semibold text-blue-400 shrink-0">Acción Legal:</span>
                          <span>{inc.mitigationAction}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Test History */}
        {activeTab === 'tests' && (
          <div className="space-y-2">
            {driverTestsList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                <span>No hay registros detallados de test en el sistema para este conductor. Total declarado: {selectedDriver.totalTests} pruebas en bitácora.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono">
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Fecha / Hora</th>
                      <th className="py-2 px-3">Motivo</th>
                      <th className="py-2 px-3">Alcohotest</th>
                      <th className="py-2 px-3">Panel Drogas Saliva</th>
                      <th className="py-2 px-3">Estado Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {driverTestsList.map((test) => {
                      const isTestBlocked = test.overallStatus === 'no_apto_bloqueado';
                      return (
                        <tr key={test.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-mono text-blue-400 font-bold">{test.code}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">{test.timestamp}</td>
                          <td className="py-2.5 px-3 text-slate-300">
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-medium">
                              {test.reason}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-slate-200">
                              {test.alcoholTested ? `${test.alcoholValueGramsPerLiter.toFixed(2)} g/L` : 'No realizado'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                test.drugsOverallStatus === 'presunto_positivo' || test.drugsOverallStatus === 'confirmado_positivo'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {test.drugsOverallStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                isTestBlocked
                                  ? 'bg-rose-500/30 text-rose-200 font-black'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {test.overallStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Mitigation Guidelines */}
        {activeTab === 'mitigation' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protocolo de Actuación Legal y Gestión de Confiabilidad (Dictamen SUSESO 92064)</span>
            </h4>
            <ul className="space-y-2 list-disc list-inside text-slate-400 text-[11px]">
              <li>
                <strong className="text-slate-200">Despersonalización y Aleatoriedad:</strong> Los controles periódicos deben aplicarse mediante el sorteo criptográfico de aleatoriedad para evitar acusaciones de acoso laboral (Art. 2 CT).
              </li>
              <li>
                <strong className="text-slate-200">Presunto Positivo y Cadena de Custodia:</strong> Ante reactividad salivar en tiras rápidas, el conductor debe ser relevado preventivamente de despacho con derecho a contraprueba en laboratorio certificado por el ISP (Art. 184 CT).
              </li>
              <li>
                <strong className="text-slate-200">Vigencia Psicotécnica:</strong> Todo conductor profesional en faenas mineras o carga peligrosa debe renovar su examen psicotécnico riguroso en su Mutualidad (ACHS / Mutual de Seguridad / IST) al menos 15 días antes de su vencimiento.
              </li>
              <li>
                <strong className="text-slate-200">Telemetría Alcolock:</strong> El dispositivo interlock bloquea el encendido del motor ante registros superiores a 0.00 g/L, enviando alerta telemática inmediata a la central de monitoreo.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
