import React, { useState, useRef, useEffect } from 'react';
import { Equipment } from '../types';
import { useApp } from '../context/AppContext';
import {
  Camera,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Video,
  VideoOff
} from 'lucide-react';

interface EquipmentQRScannerProps {
  onSelectEquipment: (equipment: Equipment) => void;
  onClose: () => void;
}

export const EquipmentQRScanner: React.FC<EquipmentQRScannerProps> = ({
  onSelectEquipment,
  onClose
}) => {
  const { equipment, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'camera' | 'simulator' | 'search'>('simulator');
  const [searchTerm, setSearchTerm] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningSim, setIsScanningSim] = useState(false);
  const [simulatedScannedItem, setSimulatedScannedItem] = useState<Equipment | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera start / stop logic
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Cámara no soportada en este entorno de navegador.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'No se pudo acceder a la cámara del dispositivo (posiblemente bloqueada por permisos o ejecución en iFrame). Utilice el Simulador de Escaneo en Terreno.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const handleSimulateScan = (eq: Equipment) => {
    setIsScanningSim(true);
    setSimulatedScannedItem(eq);

    // Audio / visual simulated beep
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }

    setTimeout(() => {
      setIsScanningSim(false);
      showToast(`Código QR verificado: ${eq.brandModel} (${eq.serialNumber})`);
      onSelectEquipment(eq);
    }, 700);
  };

  const filteredEquipment = equipment.filter((eq) => {
    const term = searchTerm.toLowerCase();
    return (
      eq.brandModel.toLowerCase().includes(term) ||
      eq.serialNumber.toLowerCase().includes(term) ||
      eq.assignedBase.toLowerCase().includes(term) ||
      (eq.code && eq.code.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Escáner de Código QR de Dispositivos
              </h2>
              <p className="text-xs text-slate-400">
                Auditoría en terreno de vigencia metrológica y hoja de vida de servicio
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador de Escaneo en Garita</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'camera'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Cámara en Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Búsqueda por S/N</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: SIMULATOR (Quick Click to inspect any device) */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-2xl flex items-start gap-3 text-xs text-blue-200">
                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Simulación de Escaneo Móvil en Garita / Control Terreno</p>
                  <p className="text-[11px] text-blue-300 mt-0.5">
                    Haga clic en cualquiera de los equipos del parque para simular la lectura óptica de su etiqueta QR adhesiva y desplegar su ficha metrológica inmediata.
                  </p>
                </div>
              </div>

              {/* Scanning visual state overlay if active */}
              {isScanningSim && simulatedScannedItem && (
                <div className="p-6 bg-slate-950 border-2 border-blue-500 rounded-2xl text-center space-y-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                    <QrCode className="w-6 h-6 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Leyendo Código QR de {simulatedScannedItem.serialNumber}...
                  </h4>
                  <p className="text-xs text-emerald-400 font-mono">
                    ✓ Decodificando certificado metrológico y vigencia semestral
                  </p>
                </div>
              )}

              {/* Device Quick List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {equipment.map((eq) => {
                  const isCalibrated = eq.status === 'calibrado_optimo' || eq.status === 'calibrado';
                  return (
                    <button
                      key={eq.id}
                      onClick={() => handleSimulateScan(eq)}
                      disabled={isScanningSim}
                      className="w-full bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-3.5 text-left transition flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-slate-900 border border-slate-800 group-hover:border-blue-500/40 text-blue-400 rounded-xl shrink-0">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white group-hover:text-blue-300 truncate">
                              {eq.brandModel}
                            </span>
                            {eq.code && (
                              <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                                {eq.code}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            S/N: <strong className="text-slate-300">{eq.serialNumber}</strong> • {eq.assignedBase}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border block ${
                              isCalibrated
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {eq.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Vence: {eq.nextCalibrationDate}
                          </span>
                        </div>
                        <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CAMERA SCANNER */}
          {activeTab === 'camera' && (
            <div className="space-y-4 text-center">
              <div className="relative w-full aspect-video sm:aspect-4/3 max-h-[320px] bg-black rounded-2xl overflow-hidden border-2 border-slate-700 flex items-center justify-center mx-auto">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    {/* Scanner Target Frame */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-blue-400 rounded-3xl relative shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        {/* Laser scan line animation */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_12px_#60a5fa]" />
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <VideoOff className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400 max-w-sm">
                      {cameraError || 'Cámara no inicializada.'}
                    </p>
                    <button
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Intentar Activar Cámara
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                <p>💡 Apunte la cámara hacia el código QR pegado en el alcoholímetro, kit o parabrisas del vehículo.</p>
              </div>

              {/* Quick test buttons under camera */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 mb-2">O pruebe un escaneo simulado directo:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {equipment.slice(0, 3).map((eq) => (
                    <button
                      key={eq.id}
                      onClick={() => handleSimulateScan(eq)}
                      className="text-xs bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      Escanear {eq.serialNumber}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEARCH BY S/N OR CODE */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por S/N (ej: DRAG-6820, ILOCK-7K), modelo o base..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredEquipment.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-500">
                    No se encontraron dispositivos que coincidan con la búsqueda.
                  </p>
                ) : (
                  filteredEquipment.map((eq) => (
                    <button
                      key={eq.id}
                      onClick={() => onSelectEquipment(eq)}
                      className="w-full bg-slate-950 hover:bg-slate-800/90 border border-slate-800 rounded-xl p-3 text-left transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{eq.brandModel}</p>
                        <p className="text-[11px] font-mono text-blue-400 mt-0.5">S/N: {eq.serialNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">{eq.assignedBase}</span>
                        <span className="text-[11px] text-amber-400 font-mono font-bold">Vence: {eq.nextCalibrationDate}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
