import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoleType, NavView } from '../types';
import { BrandLogo } from './BrandLogo';
import { SafetyAlertsEmailModal } from './SafetyAlertsEmailModal';
import { AdminExportBackupModal } from './AdminExportBackupModal';
import {
  ShieldCheck,
  AlertTriangle,
  Bell,
  Building2,
  UserCheck,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Lock,
  Smartphone,
  Layers,
  ExternalLink,
  FileCode,
  Mail,
  QrCode,
  FileSpreadsheet
} from 'lucide-react';

interface NavbarProps {
  onNavigate?: (view: NavView) => void;
  onToggleMobileMode?: () => void;
  isMobileMode?: boolean;
  onOpenDriverQRScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onToggleMobileMode, isMobileMode = false, onOpenDriverQRScanner }) => {
  const {
    currentUser,
    switchRole,
    currentCompany,
    setCurrentCompany,
    companies,
    alerts,
    resolveAlert,
    markAlertRead,
    drivers,
    resetToDefaults,
    activeToast
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [safetyEmailModalOpen, setSafetyEmailModalOpen] = useState(false);
  const [exportBackupModalOpen, setExportBackupModalOpen] = useState(false);

  const blockedDrivers = drivers.filter((d) => d.status === 'bloqueado_preventivo');
  const unreadAlerts = alerts.filter((a) => !a.read);
  const criticalAlerts = alerts.filter((a) => a.severity === 'alta' && !a.resolved);

  const rolesList: { id: RoleType; label: string; desc: string; icon: string }[] = [
    { id: 'superadmin', label: 'Superadministrador', desc: 'Control total de la plataforma y multi-empresa', icon: '👑' },
    { id: 'company_admin', label: 'Administrador Empresa', desc: 'Gestión integral de flota y conductores', icon: '🏢' },
    { id: 'compliance_officer', label: 'Compliance Officer', desc: 'Gestión normativa ISO 37301 y SUSESO', icon: '⚖️' },
    { id: 'prevencionista', label: 'Prevencionista de Riesgos', desc: 'Matriz IPER, inspecciones y seguridad', icon: '🦺' },
    { id: 'supervisor', label: 'Supervisor Operacional', desc: 'Despachos de flota y turnos en ruta', icon: '🚚' },
    { id: 'test_operator', label: 'Operador de Test', desc: 'Toma de alcohotest y paneles de drogas', icon: '🧪' },
    { id: 'laboratorio', label: 'Laboratorio Clínico', desc: 'Confirmación cromatográfica GC/MS', icon: '🔬' },
    { id: 'auditor', label: 'Auditor de Cumplimiento', desc: 'Auditorías internas y seguimiento CAPA', icon: '📋' },
    { id: 'gerencia', label: 'Gerencia General', desc: 'KPIs estratégicos e indicadores ejecutivos', icon: '📊' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5">
      {/* Active Toast Notification */}
      {activeToast && (
        <div className="fixed top-3 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-sm font-medium border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{activeToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity with Official Shield Logo */}
        <div
          onClick={() => onNavigate?.('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <BrandLogo size="md" showText={true} />
          <span className="hidden xl:inline-block text-[10px] bg-[#0056B3]/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
            CHILE • ISO 37301
          </span>
        </div>

        {/* Center: Company Selector & Emergency Block status */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Company Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setCompanyDropdownOpen(!companyDropdownOpen);
                setRoleDropdownOpen(false);
                setAlertsOpen(false);
              }}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[150px] truncate">{currentCompany.fantasyName}</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                {currentCompany.rut}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {companyDropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Empresas Habilitadas
                </p>
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCurrentCompany(c);
                      setCompanyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                      currentCompany.id === c.id
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-100">{c.fantasyName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">RUT: {c.rut} • {c.mutualidad}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                      {c.complianceScore}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Lock Alert Banner */}
          {blockedDrivers.length > 0 ? (
            <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-600/60 text-rose-200 px-3 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>{blockedDrivers.length} Conductor(es) con Bloqueo de Despacho Activo</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 px-2.5 py-1.5 rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Flota 100% Habilitada</span>
            </div>
          )}
        </div>

        {/* Right Actions: Architecture, Mobile Toggle, Alerts, Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Driver QR Scanner Action */}
          {onOpenDriverQRScanner && (
            <button
              onClick={onOpenDriverQRScanner}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Escanear Código QR de Conductor en Garita"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[11px]">Escanear QR Garita</span>
            </button>
          )}

          {/* Quick Architecture Button */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('architecture')}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition cursor-pointer"
              title="Ver Diagrama de Arquitectura de 7 Capas"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Arquitectura (7 Capas)</span>
            </button>
          )}

          {/* Field Operator Mobile View Toggle */}
          {onToggleMobileMode && (
            <button
              onClick={onToggleMobileMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                isMobileMode
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
              title="Cambiar a Modo Operador en Terreno (Tablet / Móvil)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isMobileMode ? 'Vista Escritorio' : 'Modo Operador'}</span>
            </button>
          )}

          {/* Admin Backups & Exports Quick Action */}
          <button
            onClick={() => setExportBackupModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs transition cursor-pointer text-slate-200"
            title="Centro de Respaldos Administrativos (CSV / Excel)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline text-[11px] font-medium">Respaldos Excel/CSV</span>
          </button>

          {/* Safety Alerts by Email Quick Action */}
          <button
            onClick={() => setSafetyEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs transition cursor-pointer text-slate-200"
            title="Gestor de Alertas Críticas por Correo a Prevención"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline text-[11px] font-medium">Alertas Prevención</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Alerts Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setAlertsOpen(!alertsOpen);
                setRoleDropdownOpen(false);
                setCompanyDropdownOpen(false);
              }}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition"
              title="Centro de Alertas de Cumplimiento"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {alertsOpen && (
              <div className="absolute top-full mt-1.5 right-0 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-xs text-slate-200">Alertas del Sistema ({alerts.length})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {criticalAlerts.length} críticas activas
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 mt-2 pr-1">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No hay alertas registradas</p>
                  ) : (
                    alerts.slice(0, 6).map((alt) => (
                      <div
                        key={alt.id}
                        onClick={() => markAlertRead(alt.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          alt.severity === 'alta'
                            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                            : alt.severity === 'media'
                            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300'
                        } ${!alt.read ? 'ring-1 ring-blue-500/50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-semibold text-[11px] leading-tight">{alt.title}</p>
                          <span className="text-[9px] text-slate-400 shrink-0">{alt.timestamp.slice(11, 16)}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{alt.message}</p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                          <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.2 rounded bg-black/40">
                            {alt.severity}
                          </span>
                          {!alt.resolved ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resolveAlert(alt.id);
                              }}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium underline"
                            >
                              Resolver
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">Resuelta</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setCompanyDropdownOpen(false);
                setAlertsOpen(false);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs transition"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-blue-400/50"
              />
              <div className="text-left hidden md:block">
                <p className="font-medium text-slate-200 text-xs leading-none">{currentUser.name}</p>
                <span className="text-[10px] font-semibold text-blue-400 leading-none capitalize">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute top-full mt-1.5 right-0 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Cambiar Perfil de Usuario (9 Roles)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Cambie de perfil para auditar vistas y permisos específicos
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-1">
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        switchRole(r.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 transition ${
                        currentUser.role === r.id
                          ? 'bg-blue-600 text-white font-medium shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base shrink-0">{r.icon}</span>
                      <div className="overflow-hidden">
                        <p className="font-medium text-xs truncate">{r.label}</p>
                        <p className={`text-[10px] truncate ${currentUser.role === r.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={resetToDefaults}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition"
            title="Reiniciar datos a valores iniciales"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Safety Alerts Email Modal */}
      <SafetyAlertsEmailModal
        isOpen={safetyEmailModalOpen}
        onClose={() => setSafetyEmailModalOpen(false)}
      />

      {/* Admin Export & Backup Modal */}
      <AdminExportBackupModal
        isOpen={exportBackupModalOpen}
        onClose={() => setExportBackupModalOpen(false)}
        initialType="master"
      />
    </header>
  );
};
