import React from 'react';
import { useApp } from '../context/AppContext';
import { NavView } from '../types';
import {
  LayoutDashboard,
  FlaskConical,
  Dices,
  Users,
  Microscope,
  Scale,
  AlertOctagon,
  ClipboardCheck,
  FileText,
  Gauge,
  FileSpreadsheet,
  History,
  Layers,
  Code2,
  BookOpen,
  Briefcase,
  FileCode,
  Sparkles,
  MapPin,
  ShieldCheck,
  ScanLine
} from 'lucide-react';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenSusesoManual?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, onOpenSusesoManual }) => {
  const { tests, custodyChains, findings, equipment, drivers } = useApp();

  const activeBlockedCount = drivers.filter((d) => d.status === 'bloqueado_preventivo').length;
  const labPendingCount = custodyChains.filter((c) => c.status === 'en_analisis' || c.status === 'en_custodia_terreno').length;
  const openFindingsCount = findings.filter((f) => f.status !== 'verificada_cerrada' && f.status !== 'cerrada').length;
  const equipmentAlertCount = equipment.filter((e) => e.status !== 'calibrado' && e.status !== 'calibrado_optimo').length;

  const navItems: {
    id: NavView;
    label: string;
    rfCode: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard Ejecutivo', rfCode: 'RF-016', icon: LayoutDashboard },
    {
      id: 'integral_service',
      label: 'Servicio Integral B2B',
      rfCode: 'PROYECTO',
      icon: Briefcase,
      badge: 1,
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      id: 'image_studio',
      label: 'Blindaje Studio (IA)',
      rfCode: 'IMAGE-AI',
      icon: Sparkles,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'maps_locator',
      label: 'Geo-Localizador & Labs',
      rfCode: 'MAPS-AI',
      icon: MapPin,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'specifications',
      label: 'Matriz Especificaciones (54)',
      rfCode: 'SPECS-KPI',
      icon: FileCode,
      badge: 54,
      badgeColor: 'bg-indigo-500 text-white'
    },
    {
      id: 'tests',
      label: 'Controles Alcohol & Drogas',
      rfCode: 'RF-006/7',
      icon: FlaskConical,
      badge: activeBlockedCount > 0 ? activeBlockedCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'driver_qr_scanner',
      label: 'Control Garita / Escáner QR',
      rfCode: 'GARITA-QR',
      icon: ScanLine,
      badge: 'CÁMARA',
      badgeColor: 'bg-emerald-600 text-white'
    },
    { id: 'random_selection', label: 'Selección Aleatoria', rfCode: 'RF-005', icon: Dices },
    { id: 'drivers_fleet', label: 'Conductores y Flota', rfCode: 'RF-003/4', icon: Users },
    {
      id: 'lab_portal',
      label: 'Portal Laboratorio & Custodia',
      rfCode: 'RF-008/9',
      icon: Microscope,
      badge: labPendingCount > 0 ? labPendingCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950'
    },
    { id: 'compliance_matrix', label: 'Motor Compliance & Matriz', rfCode: 'RF-011/12', icon: Scale },
    { id: 'risks', label: 'Matriz de Riesgos IPER', rfCode: 'RF-013', icon: AlertOctagon },
    {
      id: 'audits',
      label: 'Auditorías & Hallazgos CAPA',
      rfCode: 'RF-014/15',
      icon: ClipboardCheck,
      badge: openFindingsCount > 0 ? openFindingsCount : undefined,
      badgeColor: 'bg-indigo-500 text-white'
    },
    { id: 'documents', label: 'Gestión Documental & Firmas', rfCode: 'RF-010/19', icon: FileText },
    {
      id: 'equipment',
      label: 'Equipos & Calibración',
      rfCode: 'Metrología',
      icon: Gauge,
      badge: equipmentAlertCount > 0 ? equipmentAlertCount : undefined,
      badgeColor: 'bg-rose-600 text-white'
    },
    { id: 'reports', label: 'Reportes SUSESO / DT / PDF', rfCode: 'RF-017', icon: FileSpreadsheet },
    { id: 'audit_logs', label: 'Bitácora Inalterable (Audit Log)', rfCode: 'RF-020', icon: History },
    {
      id: 'suseso_verification_log',
      label: 'Trazabilidad SUSESO (RF-019)',
      rfCode: 'Dictamen',
      icon: ShieldCheck,
      badge: 'SUSESO',
      badgeColor: 'bg-emerald-600 text-white'
    },
    { id: 'architecture', label: 'Arquitectura & Flujo (7 Capas)', rfCode: 'SYSTEM', icon: Layers },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-57px)]">
      {/* Scope navigation list */}
      <div className="p-3 overflow-y-auto flex-1 space-y-1">
        <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Módulos del Sistema
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition group text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      item.badgeColor || 'bg-blue-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                    isActive ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.rfCode}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ISO / Regulatory Compliance Footer Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <button
          onClick={onOpenSusesoManual || (() => onSelectView('compliance_matrix'))}
          className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 border border-blue-500/40 rounded-xl transition text-left cursor-pointer group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-500/20 text-blue-300 rounded-lg group-hover:scale-105 transition">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white leading-tight">Manual SUSESO (8 Tomos)</p>
              <p className="text-[9px] text-blue-300 font-mono">Dictamen 92064 (250 pp)</p>
            </div>
          </div>
          <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-bold">
            LEER
          </span>
        </button>

        <div className="bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 rounded-xl p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-slate-200">Blindaje Normativo Activo</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Alineado con ISO 37301, Ley 16.744, Tolerancia Cero y SUSESO.
          </p>
          <div className="mt-2 flex items-center justify-between text-[9px] text-blue-400 font-mono">
            <span>Cifrado SHA-256</span>
            <span>Trazabilidad 100%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

