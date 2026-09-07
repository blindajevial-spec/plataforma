import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { Equipment } from '../types';
import { EquipmentQRPassportModal } from './EquipmentQRPassportModal';
import { EquipmentQRScanner } from './EquipmentQRScanner';
import { EquipmentQRBatchGenerator } from './EquipmentQRBatchGenerator';
import {
  Gauge,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Wrench,
  FileCheck2,
  Calendar,
  ShieldCheck,
  Download,
  QrCode,
  Printer,
  Camera,
  Layers,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  X,
  Activity,
  CircleDot,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

export const EquipmentView: React.FC = () => {
  const { equipment, addEquipment, updateEquipmentCalibration, currentCompany } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedEqForCalib, setSelectedEqForCalib] = useState<Equipment | null>(null);
  const [selectedEqForPassport, setSelectedEqForPassport] = useState<Equipment | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBatchGeneratorOpen, setIsBatchGeneratorOpen] = useState(false);

  const [newCalibDate, setNewCalibDate] = useState('2027-02-28');
  const [calibLab, setCalibLab] = useState('Metrología y Precisión Chile S.A. (Acreditado INN LE-810)');

  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    brandModel: 'Dräger Alcotest 6820 Evidencial',
    serialNumber: 'DRAG-6820-CL-',
    type: 'alcoholimetro',
    assignedBase: 'Base Santiago Norte',
    status: 'calibrado_optimo',
    lastCalibrationDate: '2026-03-01',
    nextCalibrationDate: '2026-09-01',
    calibrationCertificateUrl: '#',
    calibrationCertificateNumber: 'CERT-MET-2026-NEW',
    calibrationLab: 'Metrología y Precisión Chile S.A.'
  });

  // Calculate days remaining math relative to current date (Aug/Sept 2026 timeline)
  const calculateDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = new Date('2026-08-31').getTime();
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  };

  // Stats calculation
  const totalCount = equipment.length;
  const validCount = equipment.filter((e) => {
    const days = calculateDaysRemaining(e.nextCalibrationDate);
    return days > 30;
  }).length;
  const expiringSoonCount = equipment.filter((e) => {
    const days = calculateDaysRemaining(e.nextCalibrationDate);
    return days > 0 && days <= 30;
  }).length;
  const expiredCount = equipment.filter((e) => {
    const days = calculateDaysRemaining(e.nextCalibrationDate);
    return days <= 0;
  }).length;

  const filteredEquipment = equipment.filter((eq) => {
    const days = calculateDaysRemaining(eq.nextCalibrationDate);
    const matchesSearch =
      eq.brandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.assignedBase.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.code && eq.code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      selectedTypeFilter === 'all' ||
      (selectedTypeFilter === 'alcotest' && (eq.type.toLowerCase().includes('alcotest') || eq.type.toLowerCase().includes('alcoholimetro'))) ||
      (selectedTypeFilter === 'alcolock' && eq.type.toLowerCase().includes('alcolock')) ||
      (selectedTypeFilter === 'drogas' && (eq.type.toLowerCase().includes('drug') || eq.type.toLowerCase().includes('saliva') || eq.type.toLowerCase().includes('lote'))) ||
      (selectedTypeFilter === 'laboratorio' && (eq.type.toLowerCase().includes('laboratorio') || eq.type.toLowerCase().includes('patrón')));

    let matchesStatus = true;
    if (selectedStatusFilter === 'valid') {
      matchesStatus = days > 30;
    } else if (selectedStatusFilter === 'expiring_soon') {
      matchesStatus = days > 0 && days <= 30;
    } else if (selectedStatusFilter === 'expired') {
      matchesStatus = days <= 0;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipment.serialNumber) return;

    addEquipment({
      companyId: currentCompany.id,
      brandModel: newEquipment.brandModel || 'Dräger Alcotest',
      serialNumber: newEquipment.serialNumber,
      type: newEquipment.type || 'alcoholimetro',
      assignedBase: newEquipment.assignedBase || 'Base Santiago Norte',
      status: newEquipment.status || 'calibrado_optimo',
      lastCalibrationDate: newEquipment.lastCalibrationDate || '2026-03-01',
      nextCalibrationDate: newEquipment.nextCalibrationDate || '2026-09-01',
      calibrationCertificateUrl: '#',
      calibrationCertificateNumber: newEquipment.calibrationCertificateNumber || `CERT-MET-${newEquipment.serialNumber}`,
      calibrationLab: newEquipment.calibrationLab || 'Metrología y Precisión Chile S.A.'
    });

    setIsNewModalOpen(false);
  };

  const handleSaveCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqForCalib) return;

    updateEquipmentCalibration(
      selectedEqForCalib.id,
      new Date().toISOString().split('T')[0],
      newCalibDate,
      `CERT-MET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      calibLab
    );

    setSelectedEqForCalib(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner with Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider">
              RF-010 • METROLOGÍA & CÓDIGOS QR
            </span>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
              OIML R 126 • INN LE-810
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Gestión Metrológica y Pasaporte QR de Equipos
          </h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Cada etilómetro Dräger, Alcolock vehicular y analizador óptico cuenta con un código QR único que despliega su próxima fecha de calibración semestral y su historial completo de servicios inalterable.
          </p>
        </div>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
            title="Escanear código QR de un dispositivo físico en terreno"
          >
            <Camera className="w-4 h-4 text-blue-200" />
            <span>Escanear QR de Equipo</span>
          </button>

          <button
            onClick={() => setIsBatchGeneratorOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl transition cursor-pointer"
            title="Generar e imprimir etiquetas QR autoadhesivas en lote"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Centro de Etiquetas QR</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Registrar Dispositivo</span>
          </button>
        </div>
      </div>

      {/* TARJETA DE ESTADO VISUAL (SEMÁFORO METROLÓGICO) */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-5">
          {/* Header of Semáforo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Semáforo Metrológico de Control en Tiempo Real
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                  {totalCount} Dispositivos Totales
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Estado de Vigencia y Certificación de Equipos</span>
              </h2>
            </div>

            {/* Quick Reset or Status Notice */}
            <div className="flex items-center gap-2">
              {selectedStatusFilter !== 'all' ? (
                <button
                  onClick={() => setSelectedStatusFilter('all')}
                  className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-xl transition font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Filtro (Ver Todos)</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Parque {Math.round(((validCount) / (totalCount || 1)) * 100)}% Operativo</span>
                </span>
              )}
            </div>
          </div>

          {/* Interactive Semáforo 3-Pillars Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Visual Physical Traffic Light Graphic Housing */}
            <div className="lg:col-span-3 bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex sm:flex-col items-center justify-around gap-3 shadow-inner">
              <div className="text-center hidden sm:block">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-widest block">
                  SEMÁFORO DE VIGENCIA
                </span>
                <span className="text-[9px] text-slate-500">Haz clic en un estado</span>
              </div>

              {/* 3 Circular Traffic Lights Unit */}
              <div className="bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 rounded-2xl flex sm:flex-col gap-2.5 shadow-2xl items-center">
                
                {/* 🔴 RED LIGHT (Vencido) */}
                <button
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'expired' ? 'all' : 'expired')}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative group ${
                    selectedStatusFilter === 'expired'
                      ? 'ring-4 ring-rose-500/50 scale-110 shadow-lg shadow-rose-500/50 bg-rose-600'
                      : expiredCount > 0
                      ? 'bg-rose-600 shadow-md shadow-rose-600/40 hover:scale-105'
                      : 'bg-rose-950/40 border border-rose-900/50 opacity-40 hover:opacity-75'
                  }`}
                  title="Filtrar por Vencidos / Inhabilitados"
                >
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                  {expiredCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-950 border border-rose-500 text-rose-300 text-[9px] font-bold font-mono px-1 rounded-full">
                      {expiredCount}
                    </span>
                  )}
                </button>

                {/* 🟡 YELLOW / AMBER LIGHT (Próximo a Vencer) */}
                <button
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'expiring_soon' ? 'all' : 'expiring_soon')}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative group ${
                    selectedStatusFilter === 'expiring_soon'
                      ? 'ring-4 ring-amber-500/50 scale-110 shadow-lg shadow-amber-500/50 bg-amber-500'
                      : expiringSoonCount > 0
                      ? 'bg-amber-500 shadow-md shadow-amber-500/40 hover:scale-105'
                      : 'bg-amber-950/40 border border-amber-900/50 opacity-40 hover:opacity-75'
                  }`}
                  title="Filtrar por Próximos a Vencer (≤ 30 días)"
                >
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                  {expiringSoonCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-950 border border-amber-500 text-amber-300 text-[9px] font-bold font-mono px-1 rounded-full">
                      {expiringSoonCount}
                    </span>
                  )}
                </button>

                {/* 🟢 GREEN LIGHT (Al Día) */}
                <button
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'valid' ? 'all' : 'valid')}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative group ${
                    selectedStatusFilter === 'valid'
                      ? 'ring-4 ring-emerald-500/50 scale-110 shadow-lg shadow-emerald-500/50 bg-emerald-500'
                      : validCount > 0
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/40 hover:scale-105'
                      : 'bg-emerald-950/40 border border-emerald-900/50 opacity-40 hover:opacity-75'
                  }`}
                  title="Filtrar por Al Día / Calibración Vigente"
                >
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                  {validCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-950 border border-emerald-500 text-emerald-300 text-[9px] font-bold font-mono px-1 rounded-full">
                      {validCount}
                    </span>
                  )}
                </button>

              </div>

              <div className="text-[10px] text-slate-400 font-mono text-center hidden sm:block">
                Filtro Activo: <strong className="text-white uppercase">{selectedStatusFilter === 'valid' ? 'Al Día' : selectedStatusFilter === 'expiring_soon' ? 'Próx. a Vencer' : selectedStatusFilter === 'expired' ? 'Vencidos' : 'Todos'}</strong>
              </div>
            </div>

            {/* 3 Detail Status Cards for each light state */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* 🟢 Card: AL DÍA */}
              <div
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'valid' ? 'all' : 'valid')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  selectedStatusFilter === 'valid'
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-900/30 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse" />
                    <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                      Al Día
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    &gt; 30 días
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono">{validCount}</span>
                    <span className="text-xs text-emerald-400 font-medium">
                      ({totalCount ? Math.round((validCount / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Calibración vigente y conforme. Aprobados para toma de muestras y despacho.
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-900/30 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                  <span>{selectedStatusFilter === 'valid' ? '✓ Filtro aplicado' : 'Clic para ver equipos'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 🟡 Card: PRÓXIMO A VENCER */}
              <div
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'expiring_soon' ? 'all' : 'expiring_soon')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  selectedStatusFilter === 'expiring_soon'
                    ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-900/30 ring-2 ring-amber-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/50 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      Próximo a Vencer
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    ≤ 30 días
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono">{expiringSoonCount}</span>
                    <span className="text-xs text-amber-400 font-medium">
                      ({totalCount ? Math.round((expiringSoonCount / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Alerta preventiva. Requiere agendar calibración en laboratorio INN LE-810.
                  </p>
                </div>

                <div className="pt-2 border-t border-amber-900/30 flex items-center justify-between text-[10px] text-amber-400 font-semibold">
                  <span>{selectedStatusFilter === 'expiring_soon' ? '✓ Filtro aplicado' : 'Clic para ver equipos'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 🔴 Card: VENCIDO */}
              <div
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'expired' ? 'all' : 'expired')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  selectedStatusFilter === 'expired'
                    ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-900/30 ring-2 ring-rose-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-rose-500/50 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/80 ${expiredCount > 0 ? 'animate-ping' : ''}`} />
                    <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                      Vencido
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                    ≤ 0 días
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono">{expiredCount}</span>
                    <span className="text-xs text-rose-400 font-medium">
                      ({totalCount ? Math.round((expiredCount / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Inhabilitado automáticamente. Prohibido su uso para despachos bajo norma RF-010.
                  </p>
                </div>

                <div className="pt-2 border-t border-rose-900/30 flex items-center justify-between text-[10px] text-rose-400 font-semibold">
                  <span>{selectedStatusFilter === 'expired' ? '✓ Filtro aplicado' : 'Clic para ver equipos'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>

          </div>

          {/* Proportional Distribution Health Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-semibold">Distribución de Estados del Parque</span>
              <span>
                {validCount} Al Día • {expiringSoonCount} Próximos • {expiredCount} Vencidos
              </span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
              {validCount > 0 && (
                <div
                  style={{ width: `${(validCount / totalCount) * 100}%` }}
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                  title={`Al Día: ${validCount} equipos (${Math.round((validCount / totalCount) * 100)}%)`}
                />
              )}
              {expiringSoonCount > 0 && (
                <div
                  style={{ width: `${(expiringSoonCount / totalCount) * 100}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Próximos a Vencer: ${expiringSoonCount} equipos (${Math.round((expiringSoonCount / totalCount) * 100)}%)`}
                />
              )}
              {expiredCount > 0 && (
                <div
                  style={{ width: `${(expiredCount / totalCount) * 100}%` }}
                  className="bg-rose-600 h-full rounded-r-full transition-all duration-500"
                  title={`Vencidos: ${expiredCount} equipos (${Math.round((expiredCount / totalCount) * 100)}%)`}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por S/N, modelo, base o código..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Type Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto text-xs">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Tipo:</span>
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
                selectedTypeFilter === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({equipment.length})
            </button>
            <button
              onClick={() => setSelectedTypeFilter('alcotest')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
                selectedTypeFilter === 'alcotest'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Alcotest Portátiles
            </button>
            <button
              onClick={() => setSelectedTypeFilter('alcolock')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
                selectedTypeFilter === 'alcolock'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Alcolocks Vehiculares
            </button>
            <button
              onClick={() => setSelectedTypeFilter('drogas')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
                selectedTypeFilter === 'drogas'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Drogas & Reactivos
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold">Estado:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="all">Todos los Estados</option>
              <option value="valid">Vigentes (&gt; 30 días)</option>
              <option value="expiring_soon">Próximos a Vencer (≤ 30 días)</option>
              <option value="expired">Vencidos / Descalibrados</option>
            </select>
          </div>

        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEquipment.map((eq) => {
          const daysRemaining = calculateDaysRemaining(eq.nextCalibrationDate);
          const isExpired = daysRemaining <= 0;
          const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
          const qrPayload = `https://blindajevial.cl/metrologia/equipos?id=${eq.id}&sn=${encodeURIComponent(eq.serialNumber)}`;
          const historyCount = eq.serviceHistory?.length || 0;

          return (
            <div
              key={eq.id}
              className={`bg-slate-900 border rounded-3xl p-5 shadow-lg space-y-4 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                isExpired
                  ? 'border-rose-600/70 bg-gradient-to-b from-rose-950/20 via-slate-900 to-slate-900'
                  : isExpiringSoon
                  ? 'border-amber-600/70 bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-900'
                  : 'border-slate-800 hover:border-blue-500/60'
              }`}
            >
              <div className="space-y-3">
                {/* Card Top: Type & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        {eq.code || 'EQ-MET'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300">
                        {eq.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {/* Mini Traffic Light Visual Dot Pill */}
                    <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800" title={`Semáforo: ${isExpired ? 'Vencido' : isExpiringSoon ? 'Próximo a Vencer' : 'Al Día'}`}>
                      <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-rose-500 shadow-sm shadow-rose-500 animate-pulse' : 'bg-rose-950/60'}`} />
                      <span className={`w-2 h-2 rounded-full ${isExpiringSoon ? 'bg-amber-400 shadow-sm shadow-amber-400 animate-pulse' : 'bg-amber-950/60'}`} />
                      <span className={`w-2 h-2 rounded-full ${!isExpired && !isExpiringSoon ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-emerald-950/60'}`} />
                      <span className="text-[9px] font-mono font-bold text-slate-400 ml-1 uppercase">
                        {isExpired ? 'VENCIDO' : isExpiringSoon ? 'POR VENCER' : 'AL DÍA'}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        isExpired
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isExpiringSoon
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {isExpired
                        ? 'INHABILITADO'
                        : isExpiringSoon
                        ? 'RECALIBRAR PRONTO'
                        : 'CALIBRADO'}
                    </span>
                  </div>
                </div>

                {/* Equipment Brand & Model */}
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-blue-300 transition leading-snug">
                    {eq.brandModel}
                  </h3>
                  <p className="text-xs text-blue-400 font-mono mt-0.5">
                    S/N: <strong>{eq.serialNumber}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ubicación: <strong className="text-slate-200">{eq.assignedBase}</strong>
                  </p>
                </div>

                {/* QR Code Presentation Box with Click-to-Scan Passport */}
                <div
                  onClick={() => setSelectedEqForPassport(eq)}
                  className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer transition shadow-inner group/qr"
                >
                  <div className="p-1.5 bg-white rounded-xl shadow-md shrink-0">
                    <QRCodeSVG
                      value={qrPayload}
                      size={54}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>PASAPORTE QR DIGITAL</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold truncate mt-0.5">
                      Ver Ficha Metrológica
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>{historyCount} calibraciones registradas</span>
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover/qr:text-blue-400 group-hover/qr:translate-x-0.5 transition" />
                </div>
              </div>

              {/* Calibration Metadata & Countdown Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                
                {/* Last Calibration */}
                <div className="flex items-center justify-between text-slate-300 bg-slate-950/40 px-3 py-2 rounded-xl">
                  <span className="text-slate-400 text-[11px]">Última Calibración:</span>
                  <span className="font-mono text-slate-200">{eq.lastCalibrationDate}</span>
                </div>

                {/* Next Calibration Countdown Highlight */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                    isExpired
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      : isExpiringSoon
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Próximo Vencimiento:</span>
                  </span>
                  <div className="text-right">
                    <span className="font-mono font-bold block text-sm">
                      {eq.nextCalibrationDate}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isExpired
                          ? 'text-rose-400'
                          : isExpiringSoon
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {isExpired
                        ? `Vencido hace ${Math.abs(daysRemaining)}d`
                        : `${daysRemaining} días restantes`}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedEqForPassport(eq)}
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold px-2.5 py-1.5 hover:bg-blue-500/10 rounded-xl transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pasaporte QR</span>
                  </button>

                  <button
                    onClick={() => setSelectedEqForCalib(eq)}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Registrar Calibración</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: QR PASSPORT & METROLOGY SHEET */}
      {selectedEqForPassport && (
        <EquipmentQRPassportModal
          equipment={selectedEqForPassport}
          onClose={() => setSelectedEqForPassport(null)}
          onCalibrate={(eq) => {
            setSelectedEqForPassport(null);
            setSelectedEqForCalib(eq);
          }}
        />
      )}

      {/* MODAL: QR SCANNER (CAMERA & SIMULATOR) */}
      {isScannerOpen && (
        <EquipmentQRScanner
          onSelectEquipment={(eq) => {
            setIsScannerOpen(false);
            setSelectedEqForPassport(eq);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* MODAL: BATCH QR GENERATOR & PRINTING */}
      {isBatchGeneratorOpen && (
        <EquipmentQRBatchGenerator
          onClose={() => setIsBatchGeneratorOpen(false)}
          onSelectEquipmentForView={(eq) => {
            setIsBatchGeneratorOpen(false);
            setSelectedEqForPassport(eq);
          }}
        />
      )}

      {/* MODAL: QUICK REGISTER CALIBRATION */}
      {selectedEqForCalib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-base text-white">Registrar Calibración Metrológica</h2>
              </div>
              <button onClick={() => setSelectedEqForCalib(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCalibration} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="font-bold text-slate-100">{selectedEqForCalib.brandModel}</p>
                <p className="font-mono text-blue-400">S/N: {selectedEqForCalib.serialNumber}</p>
                <p className="text-[11px] text-slate-400 mt-1">Base: {selectedEqForCalib.assignedBase}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Laboratorio Metrológico Certificador *</label>
                <input
                  type="text"
                  required
                  value={calibLab}
                  onChange={(e) => setCalibLab(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nuevo Vencimiento de Calibración (Semestral) *</label>
                <input
                  type="date"
                  required
                  value={newCalibDate}
                  onChange={(e) => setNewCalibDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold text-amber-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEqForCalib(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Confirmar y Habilitar Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NUEVO EQUIPO */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Registrar Nuevo Equipo Alcoholímetro / Alcolock</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Marca y Modelo *</label>
                <input
                  type="text"
                  required
                  value={newEquipment.brandModel}
                  onChange={(e) => setNewEquipment({ ...newEquipment, brandModel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Número de Serie (S/N) *</label>
                  <input
                    type="text"
                    required
                    value={newEquipment.serialNumber}
                    onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Equipo</label>
                  <select
                    value={newEquipment.type}
                    onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value as Equipment['type'] })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Alcotest Portátil">Alcotest Portátil</option>
                    <option value="Alcolock Vehicular">Alcolock Vehicular Fijo</option>
                    <option value="DrugTest Kit Reader">Lector Óptico de Drogas</option>
                    <option value="Lote Reactivos Saliva">Lote Reactivos Saliva</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Base Asignada</label>
                  <select
                    value={newEquipment.assignedBase}
                    onChange={(e) => setNewEquipment({ ...newEquipment, assignedBase: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Base Santiago Norte (Garita Control)">Base Santiago Norte (Garita)</option>
                    <option value="Faena Minera El Teniente">Faena Minera El Teniente</option>
                    <option value="Base San Antonio Puerto">Base San Antonio Puerto</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Próximo Vencimiento Calibración *</label>
                  <input
                    type="date"
                    required
                    value={newEquipment.nextCalibrationDate}
                    onChange={(e) => setNewEquipment({ ...newEquipment, nextCalibrationDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Guardar y Generar Código QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
