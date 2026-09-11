import React, { useState } from 'react';
import { useNetworkAndOffline } from '../hooks/useNetworkAndOffline';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  X,
  Clock,
  ShieldCheck,
  ServerOff,
  Layers,
  Sparkles
} from 'lucide-react';

export const OfflineStatusBanner: React.FC = () => {
  const {
    isOnline,
    realOnline,
    simulatedOffline,
    setSimulatedOffline,
    pendingQueue,
    cacheStats,
    isSyncing,
    syncOfflineQueue
  } = useNetworkAndOffline();

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);

  return (
    <>
      {/* Top Floating Field Connectivity Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Indicator Chip */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border transition ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-amber-950/90 text-amber-200 border-amber-500 shadow-md'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[11px]">En Línea • Servidor Conectado</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <WifiOff className="w-3.5 h-3.5" />
                <span className="text-[11px]">
                  Modo Terreno Fuera de Línea • Caché Local Activo ({cacheStats.driversCount} choferes)
                </span>
              </>
            )}
          </div>

          {/* Pending Queue Badge */}
          {pendingQueue.length > 0 && (
            <button
              onClick={() => setShowQueueModal(true)}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-lg text-[11px] font-semibold transition cursor-pointer"
            >
              <Clock className="w-3 h-3 text-blue-400" />
              <span>
                {pendingQueue.length} {pendingQueue.length === 1 ? 'evento local' : 'eventos locales'} por sincronizar
              </span>
            </button>
          )}

          {/* Test Offline Mode Simulation Toggle */}
          <button
            onClick={() => setSimulatedOffline(!simulatedOffline)}
            className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer ${
              simulatedOffline
                ? 'bg-amber-600 text-white border-amber-400 font-bold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Simular pérdida de conectividad 4G/WiFi en terreno para validar funcionamiento offline"
          >
            {simulatedOffline ? '⚡ Simulador Offline: ACTIVO' : 'Probar Modo Sin Conexión'}
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Manual Sync Button if pending actions */}
          {pendingQueue.length > 0 && isOnline && (
            <button
              onClick={() => syncOfflineQueue()}
              disabled={isSyncing}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shadow disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Lote'}</span>
            </button>
          )}

          {/* Local Cache Info Button */}
          <button
            onClick={() => setShowQueueModal(true)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
            title="Ver estado de memoria caché local y cola de garita"
          >
            <Database className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">Caché Terreno</span>
          </button>

          {/* PWA Install Button (if installable and not already installed) */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shadow-xs"
              title="Instalar Blindaje Vial 360 como aplicación de escritorio o móvil"
            >
              <Download className="w-3 h-3" />
              <span>Instalar App</span>
            </button>
          )}

          {/* iOS Safari Guide Button */}
          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-blue-400" />
              <span>Instalar en iOS</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instalar en iPhone o iPad</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Para operar en terreno sin conexión con acceso directo en pantalla de inicio:
              </p>
            </div>
            <ol className="text-xs text-slate-300 text-left bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-400">1.</span>
                <span>Toque el botón <strong>Compartir</strong> en la barra inferior de Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-400">2.</span>
                <span>Deslice hacia abajo y seleccione <strong>"Agregar a Inicio"</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-400">3.</span>
                <span>Abra el icono desde su pantalla de inicio para ejecutar en modo autónomo de garita.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Offline Storage & Queue Management Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Memoria Caché Local y Respaldo Operativo
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Estrategia de continuidad para controles de garita con conectividad inestable
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQueueModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Cache Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Conductores en Caché</span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {cacheStats.driversCount}
                  </span>
                  <span className="text-[9px] text-emerald-400">Listos para escaneo offline</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Registros de Bitácora</span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {cacheStats.logsCount}
                  </span>
                  <span className="text-[9px] text-blue-400">Consulta histórica inmediata</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block">Último Guardado Local</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {cacheStats.lastCachedAt ? `${cacheStats.lastCachedAt} CLT` : 'Al iniciar app'}
                  </span>
                  <span className="text-[9px] text-slate-400">Persistencia activa</span>
                </div>
              </div>

              {/* Service Worker Information */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white text-xs">Service Worker de Terreno Activo</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    El shell de la plataforma, el motor óptico `jsQR`, los estilos y los componentes del visor de bitácora están precacheados en el navegador. La aplicación cargará y verificará credenciales aun sin conexión a la red.
                  </p>
                </div>
              </div>

              {/* Offline Actions Queue List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-300">
                    Cola de Eventos Generados Fuera de Línea ({pendingQueue.length})
                  </span>
                  {pendingQueue.length > 0 && isOnline && (
                    <button
                      onClick={() => syncOfflineQueue()}
                      disabled={isSyncing}
                      className="text-blue-400 hover:text-blue-300 font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Sincronizar Todo Ahora</span>
                    </button>
                  )}
                </div>

                {pendingQueue.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pendingQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{item.driverName}</span>
                            <span className="text-[10px] font-mono text-blue-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                              {item.driverRut}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.details}</p>
                          <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                            {item.timestamp} • Operador: {item.operatorName}
                          </span>
                        </div>

                        <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-2 py-1 rounded border border-amber-500/40 shrink-0">
                          Pendiente
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 text-slate-400">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <span>Todos los eventos de garita están sincronizados con la base central.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowQueueModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
