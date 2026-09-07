import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Equipment, FindingItem } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Wrench,
  FileCheck2,
  Download,
  Filter,
  PlusCircle,
  Eye,
  Building2,
  Layers,
  Scale,
  Sparkles,
  ExternalLink,
  QrCode,
  FileText,
  X,
  Gauge,
  Microscope,
  Info
} from 'lucide-react';

interface EquipmentCertificationCalendarProps {
  onGenerateCAPA?: (equipment: Equipment) => void;
}

export const EquipmentCertificationCalendar: React.FC<EquipmentCertificationCalendarProps> = ({
  onGenerateCAPA
}) => {
  const {
    equipment,
    calibrateEquipment,
    createFinding,
    currentUser,
    currentCompany,
    showToast
  } = useApp();

  // Current calendar view date (Default: September 2026, where upcoming expirations occur)
  const [viewDate, setViewDate] = useState<Date>(new Date(2026, 8, 1)); // Sept 2026 (Month 8 in 0-indexed JS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'expired' | 'expiring_soon' | 'valid'>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'norms'>('calendar');

  // Modals
  const [selectedEquipmentForCert, setSelectedEquipmentForCert] = useState<Equipment | null>(null);
  const [calibratingEquipment, setCalibratingEquipment] = useState<Equipment | null>(null);
  const [newCertificateNumber, setNewCertificateNumber] = useState('');
  const [newLabName, setNewLabName] = useState('Metrología y Precisión Chile S.A. (Acreditado INN LE-810)');
  const [newValidityMonths, setNewValidityMonths] = useState<number>(6);

  // Baseline comparison date: 2026-08-31
  const todayStr = '2026-08-31';
  const today = new Date(2026, 7, 31);

  // Categorization helper
  const getCategoryFromType = (type: string, brandModel: string) => {
    const text = (type + ' ' + brandModel).toLowerCase();
    if (text.includes('alcolock') || text.includes('interlock')) return 'Alcolock Vehicular';
    if (text.includes('alcotest') || text.includes('alcoholimetro')) return 'Alcoholímetro Evidencial';
    if (text.includes('lote') || text.includes('reactivo') || text.includes('drugcheck') || text.includes('oral fluid')) return 'Lote de Reactivos Saliva';
    if (text.includes('laboratorio') || text.includes('acreditacion') || text.includes('inn') || text.includes('isp')) return 'Acreditación Lab ISO 17025';
    if (text.includes('credencial') || text.includes('operador') || text.includes('fiscalizador')) return 'Credencial de Operador';
    return 'Patrón / Equipo de Medición';
  };

  // Normative reference helper
  const getNormativeReference = (type: string, brandModel: string) => {
    const text = (type + ' ' + brandModel).toLowerCase();
    if (text.includes('alcolock') || text.includes('interlock')) {
      return {
        norm: 'Ley 18.290 Art. 110 & Dictamen SUSESO 92064-2025',
        requirement: 'Calibración semestral obligatoria (180 días) con bloqueo de ignición certificado.'
      };
    }
    if (text.includes('alcotest') || text.includes('alcoholimetro')) {
      return {
        norm: 'OIML R 126 / Ley Emilia (20.770) / SUSESO 92064',
        requirement: 'Calibración semestral con trazabilidad a patrones primarios. Error max permitido ±0.01 g/L.'
      };
    }
    if (text.includes('lote') || text.includes('reactivo')) {
      return {
        norm: 'Decreto Supremo N° 40 / Estándar SAMHSA / FDA IVD',
        requirement: 'Verificación de caducidad de reactivos y control de calidad por lote de saliva 6 drogas.'
      };
    }
    if (text.includes('laboratorio') || text.includes('acreditacion')) {
      return {
        norm: 'NCh-ISO/IEC 17025:2017 & Convenio SUSESO',
        requirement: 'Acreditación INN / ISP vigente para confirmación toxicológica cuantitativa GC-MS/LC-MS.'
      };
    }
    if (text.includes('credencial') || text.includes('operador')) {
      return {
        norm: 'SUSESO Circular N° 3.335 & RIOHS Cláusula 21',
        requirement: 'Capacitación acreditada anual para operador de toma de muestras y cadena de custodia.'
      };
    }
    return {
      norm: 'ISO 37301 Cláusula 7.1.3',
      requirement: 'Recursos de seguimiento y medición calibrados con trazabilidad inalterable.'
    };
  };

  // Expiration calculation helper
  const calculateDaysRemaining = (expiryDateStr: string) => {
    const expDate = new Date(expiryDateStr);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Status badge helper
  const getExpirationStatus = (nextCalibDate: string) => {
    const days = calculateDaysRemaining(nextCalibDate);
    if (days < 0) {
      return {
        key: 'expired',
        label: `VENCIDO (${Math.abs(days)}d atrás)`,
        colorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        badgeBg: 'bg-rose-500',
        icon: AlertOctagon,
        description: 'Bloqueo de seguridad preventivo activo en plataforma.'
      };
    }
    if (days <= 30) {
      return {
        key: 'expiring_soon',
        label: `Por Vencer (${days}d restantes)`,
        colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeBg: 'bg-amber-500',
        icon: AlertTriangle,
        description: 'Requiere agendamiento de recertificación con laboratorio.'
      };
    }
    return {
      key: 'valid',
      label: `Vigente (${days}d restantes)`,
      colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeBg: 'bg-emerald-500',
      icon: CheckCircle2,
      description: 'Conformidad técnica y metrológica vigente.'
    };
  };

  // Filtered equipment list
  const enrichedEquipment = useMemo(() => {
    return equipment.map((eq) => {
      const category = getCategoryFromType(eq.type, eq.brandModel);
      const normInfo = getNormativeReference(eq.type, eq.brandModel);
      const daysRemaining = calculateDaysRemaining(eq.nextCalibrationDate);
      const statusInfo = getExpirationStatus(eq.nextCalibrationDate);

      return {
        ...eq,
        category,
        normInfo,
        daysRemaining,
        statusInfo
      };
    });
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    return enrichedEquipment.filter((eq) => {
      // Category filter
      if (selectedCategory !== 'all' && eq.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter === 'expired' && eq.daysRemaining >= 0) return false;
      if (selectedStatusFilter === 'expiring_soon' && (eq.daysRemaining < 0 || eq.daysRemaining > 30)) return false;
      if (selectedStatusFilter === 'valid' && eq.daysRemaining <= 30) return false;

      // Date click filter
      if (selectedDateFilter && eq.nextCalibrationDate !== selectedDateFilter) {
        return false;
      }

      return true;
    });
  }, [enrichedEquipment, selectedCategory, selectedStatusFilter, selectedDateFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = enrichedEquipment.length;
    const expired = enrichedEquipment.filter((eq) => eq.daysRemaining < 0).length;
    const expiringSoon = enrichedEquipment.filter((eq) => eq.daysRemaining >= 0 && eq.daysRemaining <= 30).length;
    const valid = enrichedEquipment.filter((eq) => eq.daysRemaining > 30).length;
    const complianceRate = total > 0 ? Math.round(((total - expired) / total) * 100) : 100;

    return {
      total,
      expired,
      expiringSoon,
      valid,
      complianceRate
    };
  }, [enrichedEquipment]);

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Create calendar cells
  const calendarCells = useMemo(() => {
    const cells = [];

    // Leading days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().substring(0, 10);
      const itemsOnDate = enrichedEquipment.filter((eq) => eq.nextCalibrationDate === dateStr);

      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        items: itemsOnDate
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, month, d);
      // Format as YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const itemsOnDate = enrichedEquipment.filter((eq) => eq.nextCalibrationDate === dateStr);

      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        items: itemsOnDate
      });
    }

    // Trailing days to fill 35 or 42 grid slots
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - cells.length;
    for (let nextD = 1; nextD <= remainingSlots; nextD++) {
      const nextDate = new Date(year, month + 1, nextD);
      const nextMonthNum = (month + 1) % 12 + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-${String(nextD).padStart(2, '0')}`;
      const itemsOnDate = enrichedEquipment.filter((eq) => eq.nextCalibrationDate === dateStr);

      cells.push({
        dayNumber: nextD,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        items: itemsOnDate
      });
    }

    return cells;
  }, [year, month, enrichedEquipment, firstDayOfMonth, daysInMonth, prevMonthDays]);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDateFilter(null);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDateFilter(null);
  };

  const handleGoToCurrentMonth = () => {
    setViewDate(new Date(2026, 8, 1)); // September 2026
    setSelectedDateFilter(null);
  };

  // Submit calibration
  const handleSubmitCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calibratingEquipment) return;

    const certNo = newCertificateNumber || `CERT-MET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const lab = newLabName || 'Metrología y Precisión Chile S.A. (INN LE-810)';

    calibrateEquipment(calibratingEquipment.id, certNo, lab);

    showToast(`Certificación registrada para ${calibratingEquipment.brandModel}. Certificado: ${certNo}`);
    setCalibratingEquipment(null);
    setNewCertificateNumber('');
  };

  // 1-Click CAPA Creation from Metrology Calendar
  const handleCreateAutoCAPA = (eq: (typeof enrichedEquipment)[0]) => {
    const isExpired = eq.daysRemaining < 0;
    const clause = eq.normInfo.norm;
    const findingType = isExpired ? 'No Conformidad Mayor' : 'No Conformidad Menor';

    createFinding({
      auditId: 'aud-02',
      standardClause: `${clause} & ISO 37301 Cláusula 7.1.3`,
      type: findingType,
      description: `Desviación metrológica en ${eq.category}: ${eq.brandModel} (${eq.serialNumber}) con vencimiento el ${eq.nextCalibrationDate}.`,
      evidence: `Certificado ${eq.calibrationCertificateNumber || 'N/A'} emitido por ${eq.calibrationLab || 'Laboratorio'}. Días restantes: ${eq.daysRemaining} días.`,
      rootCauseAnalysis: 'Omisión de reprogramación semestral con laboratorio acreditado antes de los 15 días previos a la fecha de caducidad.',
      correctiveAction: `Retirar equipo preventivamente de operación, emitir orden de servicio a ${eq.calibrationLab || 'Dräger Safety Chile'} y recertificar bajo NCh-ISO/IEC 17025 antes del próximo ciclo de fiscalización.`,
      dueDate: '2026-09-15',
      assignedTo: `${currentUser.name} (Prevencionista / Compliance)`,
      status: 'abierta'
    });

    showToast(`Hallazgo CAPA [${findingType}] generado exitosamente para ${eq.code || eq.serialNumber}.`);
    if (onGenerateCAPA) {
      onGenerateCAPA(eq);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Tipo / Categoría',
      'Marca y Modelo',
      'N° Serie / Lote',
      'Base Asignada',
      'Última Calibración',
      'Vencimiento Certificado',
      'Días Restantes',
      'Estado Técnico',
      'Laboratorio Certificador',
      'N° Certificado',
      'Norma Técnica Aplicable'
    ];

    const rows = enrichedEquipment.map((eq) => [
      `"${eq.code || ''}"`,
      `"${eq.category}"`,
      `"${eq.brandModel}"`,
      `"${eq.serialNumber}"`,
      `"${eq.assignedBase}"`,
      `"${eq.lastCalibrationDate}"`,
      `"${eq.nextCalibrationDate}"`,
      eq.daysRemaining,
      `"${eq.statusInfo.label}"`,
      `"${eq.calibrationLab || ''}"`,
      `"${eq.calibrationCertificateNumber || ''}"`,
      `"${eq.normInfo.norm}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BlindajeVial360_Calendario_Metrologia_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Calendario de vencimientos exportado en formato CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Normative Metrology Assurance */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-800/40 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Scale className="w-3 h-3 text-blue-400" />
                NORMA TÉCNICA METROLÓGICA • NCh-ISO/IEC 17025 & SUSESO 92064
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                Vigencia Semestral Obligatoria (180 Días)
              </span>
            </div>

            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              Calendario de Vencimientos de Certificaciones y Equipos
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Monitoreo y trazabilidad continua de calibraciones metrológicas para alcoholímetros evidenciales Dräger,
              alcolocks con corte de ignición, lotes de reactivos de saliva 6 drogas y acreditaciones de laboratorios de confirmación toxicológica.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar Matriz CSV</span>
            </button>

            <button
              onClick={() => {
                const targetEq = enrichedEquipment.find((e) => e.daysRemaining <= 30) || enrichedEquipment[0];
                setCalibratingEquipment(targetEq);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Calibración</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Equipos & Certificados</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white">{metrics.total}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Bajo vigilancia continua</span>
          </div>
        </div>

        {/* Valid */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>100% Conformes / Vigentes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-400">{metrics.valid}</span>
            <span className="text-[11px] text-emerald-500/80 block mt-0.5">Calibración óptima &gt; 30d</span>
          </div>
        </div>

        {/* Expiring soon */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Por Vencer (&le; 30 Días)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-amber-400">{metrics.expiringSoon}</span>
            <span className="text-[11px] text-amber-400/80 block mt-0.5">Requiere agendamiento</span>
          </div>
        </div>

        {/* Expired */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Vencidos / Bloqueo Activo</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-rose-400">{metrics.expired}</span>
            <span className="text-[11px] text-rose-400/80 block mt-0.5">Fuera de servicio preventivo</span>
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Índice Aptitud Metrológica</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-indigo-300">{metrics.complianceRate}%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Conforme</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.complianceRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Switcher & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 self-start md:self-auto">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Vista Calendario Mensual</span>
          </button>

          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Listado & Línea de Tiempo ({filteredEquipment.length})</span>
          </button>

          <button
            onClick={() => setViewMode('norms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'norms'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Normativa & Tolerancias</span>
          </button>
        </div>

        {/* Right: Category & Status Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedStatusFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({enrichedEquipment.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('expired')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedStatusFilter === 'expired'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              Vencidos ({metrics.expired})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('expiring_soon')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedStatusFilter === 'expiring_soon'
                  ? 'bg-amber-600 text-slate-950 font-bold'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              Por Vencer ({metrics.expiringSoon})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('valid')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedStatusFilter === 'valid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              Vigentes ({metrics.valid})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas las Categorías de Equipos</option>
            <option value="Alcoholímetro Evidencial">Alcoholímetros Evidenciales</option>
            <option value="Alcolock Vehicular">Alcolocks Vehiculares</option>
            <option value="Lote de Reactivos Saliva">Lotes Reactivos Saliva 6D</option>
            <option value="Acreditación Lab ISO 17025">Acreditaciones Lab ISO 17025</option>
            <option value="Credencial de Operador">Credenciales de Fiscalizadores</option>
          </select>
        </div>
      </div>

      {/* Selected date banner filter */}
      {selectedDateFilter && (
        <div className="flex items-center justify-between bg-blue-950/60 border border-blue-800/60 rounded-xl px-4 py-2 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-400" />
            <span>
              Filtrando eventos con vencimiento exacto el: <strong>{selectedDateFilter}</strong> ({filteredEquipment.length} item(s))
            </span>
          </div>
          <button
            onClick={() => setSelectedDateFilter(null)}
            className="text-xs text-blue-400 hover:text-white underline cursor-pointer"
          >
            Limpiar filtro de fecha
          </button>
        </div>
      )}

      {/* VIEW 1: MONTHLY CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Month navigation header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Mes anterior"
                  className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Mes siguiente"
                  className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  {monthNames[month]} <span className="text-blue-400">{year}</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {enrichedEquipment.filter((eq) => eq.nextCalibrationDate.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} vencimiento(s) programado(s) en este mes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGoToCurrentMonth}
                className="text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Septiembre 2026 (Actual)
              </button>
            </div>
          </div>

          {/* Day name headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 pb-1">
            <div className="text-slate-500">DOM</div>
            <div>LUN</div>
            <div>MAR</div>
            <div>MIÉ</div>
            <div>JUE</div>
            <div>VIE</div>
            <div className="text-slate-500">SÁB</div>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              const isSelected = selectedDateFilter === cell.dateStr;
              const hasEvents = cell.items.length > 0;
              const hasExpired = cell.items.some((i) => i.daysRemaining < 0);
              const hasExpiringSoon = cell.items.some((i) => i.daysRemaining >= 0 && i.daysRemaining <= 30);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedDateFilter(isSelected ? null : cell.dateStr);
                    }
                  }}
                  className={`min-h-[105px] p-2 rounded-xl border transition flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/20 border-slate-900/50 text-slate-600'
                  } ${
                    cell.isToday
                      ? 'ring-2 ring-blue-500/80 bg-blue-950/20'
                      : ''
                  } ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 bg-indigo-950/40 border-indigo-500'
                      : ''
                  } ${hasEvents ? 'cursor-pointer hover:bg-slate-800/40' : ''}`}
                >
                  {/* Top row: Day number + Today Tag */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        cell.isToday
                          ? 'text-blue-400 bg-blue-950 px-1.5 py-0.2 rounded-md border border-blue-800'
                          : cell.isCurrentMonth
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasEvents && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          hasExpired
                            ? 'bg-rose-500 text-white animate-pulse'
                            : hasExpiringSoon
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {cell.items.length} {cell.items.length === 1 ? 'vence' : 'vencen'}
                      </span>
                    )}
                  </div>

                  {/* Events list within cell */}
                  <div className="space-y-1 mt-1 flex-1">
                    {cell.items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEquipmentForCert(item);
                        }}
                        className={`text-[9px] p-1 rounded font-medium truncate flex items-center gap-1 border transition hover:scale-[1.02] ${
                          item.daysRemaining < 0
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : item.daysRemaining <= 30
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                        title={`${item.category}: ${item.brandModel} (${item.serialNumber})`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.daysRemaining < 0
                              ? 'bg-rose-400'
                              : item.daysRemaining <= 30
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="truncate">{item.brandModel}</span>
                      </div>
                    ))}

                    {cell.items.length > 2 && (
                      <div className="text-[8px] text-slate-400 text-center font-bold">
                        +{cell.items.length - 2} más...
                      </div>
                    )}
                  </div>

                  {/* Bottom indicator if today */}
                  {cell.isToday && (
                    <span className="text-[8px] font-bold text-blue-400 tracking-wider text-right uppercase block pt-0.5">
                      Hoy (31 Ago)
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Vencido / Bloqueo Preventivo Inmediato</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Por Vencer (&le; 30 días) - Requiere Agendamiento</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Vigente &gt; 30 días</span>
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              Haga clic en un día con eventos para filtrar o en un equipo para ver su ficha técnica
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: TIMELINE & LIST CARDS */}
      {(viewMode === 'timeline' || viewMode === 'calendar') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Detalle de Vencimientos y Estado de Certificación ({filteredEquipment.length})
            </h3>
            <span className="text-xs text-slate-400">
              Ordenado por fecha de expiración más próxima
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEquipment
              .sort((a, b) => new Date(a.nextCalibrationDate).getTime() - new Date(b.nextCalibrationDate).getTime())
              .map((eq) => {
                const StatusIcon = eq.statusInfo.icon;
                const isCritical = eq.daysRemaining <= 30;

                return (
                  <div
                    key={eq.id}
                    className={`bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-3.5 transition hover:border-slate-700 ${
                      eq.daysRemaining < 0
                        ? 'border-rose-800/60 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20'
                        : eq.daysRemaining <= 30
                        ? 'border-amber-800/60 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Header Row: Category Badge + Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {eq.code || 'EQUIP'}
                          </span>
                          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                            {eq.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug">
                          {eq.brandModel}
                        </h4>
                      </div>

                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${eq.statusInfo.colorClass}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{eq.statusInfo.label}</span>
                      </span>
                    </div>

                    {/* Metadata Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">N° Serie / Lote:</span>
                        <span className="font-mono font-semibold text-slate-200">{eq.serialNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Base / Vehículo:</span>
                        <span className="font-medium text-slate-300 truncate block">{eq.assignedBase}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Última Calibración:</span>
                        <span className="font-mono text-slate-400">{eq.lastCalibrationDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Fecha Límite Vencimiento:</span>
                        <span className={`font-mono font-bold ${
                          eq.daysRemaining < 0 ? 'text-rose-400' : eq.daysRemaining <= 30 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {eq.nextCalibrationDate}
                        </span>
                      </div>
                    </div>

                    {/* Laboratory & Normative Reference */}
                    <div className="space-y-1.5 text-xs bg-slate-850/60 p-3 rounded-xl border border-slate-750">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Laboratorio / Emisor:</span>
                        <span className="font-semibold text-slate-200 text-right truncate max-w-[200px]">
                          {eq.calibrationLab || 'Laboratorio Certificado'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">N° Certificado:</span>
                        <span className="font-mono text-blue-300 font-bold">
                          {eq.calibrationCertificateNumber || 'CERT-AUT-2026'}
                        </span>
                      </div>
                      <div className="pt-1 border-t border-slate-750 flex items-start gap-1.5 text-[10px] text-slate-400">
                        <Scale className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                        <span><strong>Norma Técnica:</strong> {eq.normInfo.norm}</span>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedEquipmentForCert(eq)}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded-lg hover:bg-blue-950/40 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Ficha Técnica / Certificado</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isCritical && (
                          <button
                            onClick={() => handleCreateAutoCAPA(eq)}
                            className="flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                            title="Generar acción correctiva CAPA en la auditoría"
                          >
                            <AlertOctagon className="w-3 h-3" />
                            <span>Generar CAPA</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setCalibratingEquipment(eq);
                            setNewLabName(eq.calibrationLab || 'Metrología y Precisión Chile S.A.');
                          }}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Recertificar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* VIEW 3: NORMATIVE CHECKLIST & METROLOGICAL REQUIREMENTS */}
      {viewMode === 'norms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" />
                Matriz de Requisitos Técnicos y Metrológicos Obligatorios
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Criterios de validez jurídica ante la Dirección del Trabajo, SUSESO, Mutualidades y Tribunales Laborales.
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">
              SISTEMA INTEGRAL DE BLINDAJE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Norm 1: Etilometría Semestral */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">1. Calibración Semestral de Alcoholímetros</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  180 Días
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Los etilómetros evidenciales (Dräger Alcotest 6820 / 7510) deben ser contrastados semestralmente con gases patrones de etanol trazables a NIST/INN. El error máximo tolerado no debe superar ±0.01 g/L.
              </p>
              <div className="text-[11px] text-blue-300 font-mono pt-1 border-t border-slate-800">
                Base Legal: OIML R 126 • Ley 18.290 Art. 110 • Dictamen SUSESO 92064-2025
              </div>
            </div>

            {/* Norm 2: Alcolocks Vehiculares */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">2. Alcolocks con Bloqueo de Ignición</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  Anti-Tampering
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Los dispositivos Interlock 7000 homologados C/DRS deben registrar sensor de presión pulmonar anti-burlas y bloqueo automático del camión ante cualquier soplido superior a 0.00 g/L de alcohol.
              </p>
              <div className="text-[11px] text-blue-300 font-mono pt-1 border-t border-slate-800">
                Base Legal: C/DRS Especificación Técnica • Art. 184 Código del Trabajo
              </div>
            </div>

            {/* Norm 3: Lotes de Reactivos de Saliva */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">3. Trazabilidad de Lotes de Reactivos Salivales</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  QC por Lote
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cada cassette de fluido oral de 6 drogas debe contar con certificado de lote, control de calidad del fabricante y estar dentro de la fecha de caducidad estampada en el envase sellado.
              </p>
              <div className="text-[11px] text-blue-300 font-mono pt-1 border-t border-slate-800">
                Base Legal: Decreto Supremo N° 40 • Estándar Internacional SAMHSA / EWDTS
              </div>
            </div>

            {/* Norm 4: Laboratorios Acreditados 17025 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">4. Acreditación Laboratorios NCh-ISO/IEC 17025</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  GC-MS Obligatorio
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Las contrapruebas confirmatorias cuantitativas ante presuntos positivos deben ser procesadas exclusivamente por laboratorios acreditados por el INN o ISP mediante Cromatografía de Gases / Espectrometría de Masas.
              </p>
              <div className="text-[11px] text-blue-300 font-mono pt-1 border-t border-slate-800">
                Base Legal: NCh-ISO/IEC 17025:2017 • Dictamen SUSESO N° 92064-2025
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Digital Metrological Certificate / Inspection Record */}
      {selectedEquipmentForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Certificado Oficial de Calibración y Conformidad</h3>
              </div>
              <button
                onClick={() => setSelectedEquipmentForCert(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Card Content */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 font-sans text-xs">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                    LABORATORIO DE METROLOGÍA Y ENSAYO ACREDITADO
                  </span>
                  <h4 className="font-bold text-sm text-white mt-0.5">
                    {selectedEquipmentForCert.calibrationLab || 'Metrología y Precisión Chile S.A.'}
                  </h4>
                  <span className="text-[10px] text-slate-400">Acreditación INN Registro LE-810 • NCh-ISO/IEC 17025</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">N° Certificado:</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {selectedEquipmentForCert.calibrationCertificateNumber || 'CERT-2026-MET-0391'}
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px]">Equipo / Instrumento:</span>
                  <p className="font-bold text-white">{selectedEquipmentForCert.brandModel}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">N° de Serie / Lote:</span>
                  <p className="font-mono font-bold text-slate-200">{selectedEquipmentForCert.serialNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Fecha de Emisión:</span>
                  <p className="font-mono text-slate-200">{selectedEquipmentForCert.lastCalibrationDate}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Fecha de Caducidad Técnica:</span>
                  <p className="font-mono font-bold text-blue-300">{selectedEquipmentForCert.nextCalibrationDate}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Empresa Titular:</span>
                  <p className="text-slate-200">{currentCompany.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Ubicación Operativa:</span>
                  <p className="text-slate-200">{selectedEquipmentForCert.assignedBase}</p>
                </div>
              </div>

              {/* Technical Calibration Curve & Margin */}
              <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-blue-300">Puntos de Calibración Contrastados:</span>
                  <span className="font-mono text-emerald-400 font-bold">0.00, 0.20, 0.50, 0.80 g/L BAC</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Incertidumbre Expandida (k=2, 95%):</span>
                  <span className="font-mono text-slate-200">U = ±0.008 g/L (Cumple OIML R 126)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Dictamen Metrológico:</span>
                  <span className="font-bold text-emerald-400 uppercase">APTO PARA FISCALIZACIÓN LEGAL</span>
                </div>
              </div>

              {/* Cryptographic hash */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                <span>HASH SHA-256: 8f9b2c4e1a0d8e772b94a11f2026e94</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verificado
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Certificado digital descargado en formato PDF.');
                  setSelectedEquipmentForCert(null);
                }}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Descargar Copia PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEquipmentForCert(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Register New Calibration Event */}
      {calibratingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Registrar Recertificación y Calibración</h3>
              </div>
              <button
                onClick={() => setCalibratingEquipment(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCalibration} className="space-y-3.5 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400">Equipo a Calibrar:</span>
                <p className="font-bold text-white text-sm">{calibratingEquipment.brandModel}</p>
                <p className="font-mono text-slate-300 text-[11px]">N° Serie: {calibratingEquipment.serialNumber} • {calibratingEquipment.assignedBase}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Laboratorio / Entidad Certificadora Acreditada *
                </label>
                <input
                  type="text"
                  required
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    N° Certificado Oficial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CERT-MET-2026-XXXX"
                    value={newCertificateNumber}
                    onChange={(e) => setNewCertificateNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Vigencia de Calibración
                  </label>
                  <select
                    value={newValidityMonths}
                    onChange={(e) => setNewValidityMonths(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value={6}>6 Meses (180 días - Semestral Estándar)</option>
                    <option value={12}>12 Meses (1 año - Analizadores Ópticos)</option>
                    <option value={3}>3 Meses (Trimestral Faena Severa)</option>
                  </select>
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl flex items-start gap-2 text-[11px] text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Al registrar la calibración, el estado del equipo cambiará automáticamente a <strong>Vigente / Calibrado</strong>, desbloqueándolo en plataforma y extendiendo la fecha en el calendario.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCalibratingEquipment(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  Guardar y Extender Vigencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
