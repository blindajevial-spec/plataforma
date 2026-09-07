import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Driver, Vehicle } from '../types';
import { DriverRiskRadar } from './DriverRiskRadar';
import {
  Users,
  Truck,
  PlusCircle,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  Edit2,
  Gauge,
  X,
  Radar,
  Sparkles
} from 'lucide-react';

export const DriversAndFleetView: React.FC = () => {
  const {
    drivers,
    vehicles,
    addDriver,
    updateDriver,
    toggleDriverStatus,
    addVehicle,
    updateVehicle,
    currentCompany,
    tests,
    alerts
  } = useApp();

  const [activeTab, setActiveTab] = useState<'drivers' | 'fleet'>('drivers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBase, setFilterBase] = useState('all');

  const [selectedRadarDriverId, setSelectedRadarDriverId] = useState<string>(
    drivers[0]?.id || 'drv-01'
  );
  const [showRadarSection, setShowRadarSection] = useState(true);

  const activeRadarDriver =
    drivers.find((d) => d.id === selectedRadarDriverId) || drivers[0];

  // Modals
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [lockModalDriver, setLockModalDriver] = useState<Driver | null>(null);
  const [lockReason, setLockReason] = useState('');

  // Form State for new driver
  const [newDriver, setNewDriver] = useState({
    rut: '',
    fullName: '',
    birthDate: '1988-05-12',
    phone: '+56 9 ',
    email: '',
    licenseClass: ['A5', 'A2'] as Driver['licenseClass'],
    licenseExpiry: '2028-12-31',
    psychotechnicalExpiry: '2027-06-30',
    assignedBase: 'Base Santiago Norte',
    status: 'habilitado' as Driver['status'],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'
  });

  // Form State for new vehicle
  const [newVehicle, setNewVehicle] = useState({
    companyId: currentCompany.id,
    plate: '',
    type: 'Tractocamión' as Vehicle['type'],
    brandModel: 'Scania R500 V8',
    year: 2024,
    technicalReviewExpiry: '2027-05-30',
    soapExpiry: '2027-03-31',
    hasAlcolock: true,
    alcolockStatus: 'calibrado' as Vehicle['alcolockStatus'],
    lastOdometerKm: 125000,
    status: 'operativo' as Vehicle['status']
  });

  const bases = Array.from(new Set(drivers.map((d) => d.assignedBase)));

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.rut.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBase = filterBase === 'all' || d.assignedBase === filterBase;
    return matchesSearch && matchesBase;
  });

  const filteredVehicles = vehicles.filter((v) => {
    return (
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brandModel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.rut || !newDriver.fullName) return;

    addDriver({
      ...newDriver,
      companyId: currentCompany.id
    });
    setIsDriverModalOpen(false);
    setNewDriver({
      rut: '',
      fullName: '',
      birthDate: '1988-05-12',
      phone: '+56 9 ',
      email: '',
      licenseClass: ['A5'],
      licenseExpiry: '2028-12-31',
      psychotechnicalExpiry: '2027-06-30',
      assignedBase: 'Base Santiago Norte',
      status: 'habilitado',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'
    });
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.plate) return;

    addVehicle({
      ...newVehicle,
      companyId: currentCompany.id
    });
    setIsVehicleModalOpen(false);
  };

  const handleConfirmLockToggle = () => {
    if (!lockModalDriver) return;
    const newStatus =
      lockModalDriver.status === 'bloqueado_preventivo' ? 'habilitado' : 'bloqueado_preventivo';
    toggleDriverStatus(lockModalDriver.id, newStatus, lockReason);
    setLockModalDriver(null);
    setLockReason('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
              RF-003 & RF-004 • GESTIÓN DE DOTACIÓN Y FLOTA
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Conductores y Flota Vehicular Blindada
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro con validación de psicotécnico riguroso, historial de exámenes, bloqueo preventivo y telemetría de Alcolock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'drivers' ? (
            <button
              onClick={() => setIsDriverModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Conductor</span>
            </button>
          ) : (
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Vehículo</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'drivers'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Conductores ({drivers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Flota de Vehículos ({vehicles.length})</span>
          </button>
        </div>

        {/* Search & Base filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={activeTab === 'drivers' ? 'Buscar conductor o RUT...' : 'Buscar patente o modelo...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {activeTab === 'drivers' && (
            <div className="flex items-center gap-2">
              <select
                value={filterBase}
                onChange={(e) => setFilterBase(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas las Bases</option>
                {bases.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowRadarSection(!showRadarSection)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  showRadarSection
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Mostrar u ocultar el diagrama de radar de riesgo"
              >
                <Radar className="w-3.5 h-3.5" />
                <span>{showRadarSection ? 'Ocultar Radar' : 'Ver Radar de Riesgo'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content: Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          {/* Visual Radar Risk Profile Section */}
          {showRadarSection && activeRadarDriver && (
            <DriverRiskRadar
              selectedDriver={activeRadarDriver}
              onSelectDriver={(d) => setSelectedRadarDriverId(d.id)}
              drivers={drivers}
              tests={tests}
              vehicles={vehicles}
              alerts={alerts}
              onToggleStatus={(d) => {
                setLockModalDriver(d);
                setLockReason('');
              }}
            />
          )}

          {/* Drivers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((driver) => {
              const isBlocked = driver.status === 'bloqueado_preventivo';
              const isSelectedForRadar = driver.id === selectedRadarDriverId;
              const assignedVeh = vehicles.find((v) => v.assignedDriverId === driver.id);

              return (
                <div
                  key={driver.id}
                  className={`bg-slate-900 border rounded-2xl p-4 shadow-sm transition flex flex-col justify-between ${
                    isSelectedForRadar
                      ? 'ring-2 ring-blue-500/80 border-blue-500/50 shadow-blue-500/10'
                      : isBlocked
                      ? 'border-rose-600/80 bg-rose-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top Bar of Card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={driver.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={driver.fullName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700 shadow"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-white leading-tight">{driver.fullName}</h3>
                          <p className="text-[11px] text-slate-400 font-mono">RUT: {driver.rut}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isBlocked
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {driver.status.replace('_', ' ')}
                        </span>
                        {isSelectedForRadar && (
                          <span className="text-[9px] font-mono text-blue-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            En Radar
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="mt-3.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-300 bg-slate-800/40 p-2 rounded-lg">
                        <span className="text-slate-400 text-[11px]">Base:</span>
                        <span className="font-medium">{driver.assignedBase}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300 bg-slate-800/40 p-2 rounded-lg">
                        <span className="text-slate-400 text-[11px]">Licencias Vigentes:</span>
                        <div className="flex gap-1">
                          {driver.licenseClass.map((lic) => (
                            <span key={lic} className="bg-blue-600/30 text-blue-300 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                              {lic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-slate-300 bg-slate-800/40 p-2 rounded-lg">
                        <span className="text-slate-400 text-[11px]">Examen Psicotécnico:</span>
                        <span className="font-mono text-[11px] text-slate-200">
                          Vence: {driver.psychotechnicalExpiry}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300 bg-slate-800/40 p-2 rounded-lg">
                        <span className="text-slate-400 text-[11px]">Total Controles:</span>
                        <span className="font-bold text-white font-mono">{driver.totalTests} realizados</span>
                      </div>

                      {assignedVeh && (
                        <div className="flex items-center justify-between text-blue-300 bg-blue-950/40 border border-blue-800/50 p-2 rounded-lg">
                          <span className="text-[11px]">Vehículo Habitual:</span>
                          <span className="font-bold font-mono text-xs">{assignedVeh.plate} ({assignedVeh.brandModel})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedRadarDriverId(driver.id);
                        setShowRadarSection(true);
                        setTimeout(() => {
                          document.getElementById('driver-risk-radar-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isSelectedForRadar
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-slate-800/90 hover:bg-slate-800 text-blue-300 border border-blue-500/30'
                      }`}
                      title="Analizar perfil de riesgo en gráfico de radar"
                    >
                      <Radar className="w-3.5 h-3.5 text-blue-400" />
                      <span>Radar de Riesgo</span>
                    </button>

                    <button
                      onClick={() => {
                        setLockModalDriver(driver);
                        setLockReason('');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isBlocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {isBlocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Habilitar</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Bloquear</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content: Fleet Tab */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => {
            const assignedDriver = drivers.find((d) => d.id === vehicle.assignedDriverId);
            const isOperational = vehicle.status === 'operativo';

            return (
              <div
                key={vehicle.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {vehicle.plate}
                        </span>
                        <span className="text-xs font-bold text-slate-300">{vehicle.year}</span>
                      </div>
                      <h3 className="font-semibold text-xs text-slate-200 mt-1">{vehicle.brandModel}</h3>
                      <p className="text-[10px] text-slate-400">{vehicle.type}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isOperational
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Vehicle specs */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300 bg-slate-800/40 p-2 rounded-lg">
                      <span className="text-slate-400 text-[11px]">Odómetro:</span>
                      <span className="font-mono font-bold">{vehicle.lastOdometerKm.toLocaleString('es-CL')} km</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 bg-slate-800/40 p-2 rounded-lg">
                      <span className="text-slate-400 text-[11px]">Revisión Técnica:</span>
                      <span className="font-mono text-[11px]">Vence: {vehicle.technicalReviewExpiry}</span>
                    </div>

                    {/* Alcolock Integration status */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/30 border border-purple-800/40 text-purple-200">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[11px] font-semibold">Alcolock Cabina:</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-900/60">
                        {vehicle.hasAlcolock ? vehicle.alcolockStatus : 'No instalado'}
                      </span>
                    </div>

                    {assignedDriver && (
                      <div className="flex items-center justify-between text-slate-300 bg-slate-800/40 p-2 rounded-lg">
                        <span className="text-slate-400 text-[11px]">Conductor Asignado:</span>
                        <span className="font-bold text-xs truncate">{assignedDriver.fullName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>SOAP: Vigente ({vehicle.soapExpiry})</span>
                  <span className="text-emerald-400 font-medium">GPS Activo</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Driver */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Registrar Nuevo Conductor Profesional</h2>
              <button onClick={() => setIsDriverModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Marcelo Morales Valdés"
                  value={newDriver.fullName}
                  onChange={(e) => setNewDriver({ ...newDriver, fullName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">RUT Conductor *</label>
                  <input
                    type="text"
                    required
                    placeholder="15.890.123-4"
                    value={newDriver.rut}
                    onChange={(e) => setNewDriver({ ...newDriver, rut: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Base Operacional</label>
                  <select
                    value={newDriver.assignedBase}
                    onChange={(e) => setNewDriver({ ...newDriver, assignedBase: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Base Santiago Norte">Base Santiago Norte</option>
                    <option value="Faena El Teniente">Faena El Teniente</option>
                    <option value="Base San Antonio Puerto">Base San Antonio Puerto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Vencimiento Psicotécnico *</label>
                  <input
                    type="date"
                    required
                    value={newDriver.psychotechnicalExpiry}
                    onChange={(e) => setNewDriver({ ...newDriver, psychotechnicalExpiry: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Vencimiento Licencia *</label>
                  <input
                    type="date"
                    required
                    value={newDriver.licenseExpiry}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Guardar Conductor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Lock/Unlock Reason */}
      {lockModalDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-sm text-white">
                {lockModalDriver.status === 'bloqueado_preventivo'
                  ? 'Rehabilitación de Conductor'
                  : 'Bloqueo Preventivo de Despacho'}
              </h2>
            </div>

            <p className="text-xs text-slate-300">
              Conductor: <span className="font-bold text-white">{lockModalDriver.fullName}</span> (RUT: {lockModalDriver.rut})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo / Justificación Legal (Queda registrado en Bitácora Inalterable):
              </label>
              <textarea
                rows={3}
                placeholder="Indicar contraprueba de laboratorio negativa, fin de suspensión médica, o sospecha fundada..."
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setLockModalDriver(null)}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLockToggle}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
              >
                Confirmar Cambio de Estado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
