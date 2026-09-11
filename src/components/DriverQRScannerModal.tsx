import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { useApp } from '../context/AppContext';
import { Driver, TestRecord, Equipment } from '../types';
import { DriverCredentialModal } from './DriverCredentialModal';
import { useNetworkAndOffline } from '../hooks/useNetworkAndOffline';
import { enqueueOfflineAction, getCachedDriversSnapshot } from '../utils/offlineSyncManager';
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
  VideoOff,
  User,
  Truck,
  FlaskConical,
  Gauge,
  Lock,
  Unlock,
  Calendar,
  Clock,
  FileCheck2,
  FileBadge,
  Upload,
  Zap,
  Sliders,
  Printer,
  ChevronRight,
  Award,
  Wifi,
  WifiOff,
  Database,
  Users,
  CheckCheck,
  FileSpreadsheet,
  Trash2,
  PlayCircle,
  Eye
} from 'lucide-react';

export interface ShiftScannedEntry {
  id: string;
  driver: Driver;
  scannedAt: string;
  timestamp: string;
  recentTest?: TestRecord;
  clearanceVerdict: 'apto' | 'bloqueado' | 'requiere_test' | 'documento_vencido';
  authorized: boolean;
}

export const calculateDriverClearance = (
  driver: Driver,
  allTests: TestRecord[]
): {
  recentTest?: TestRecord;
  verdict: 'apto' | 'bloqueado' | 'requiere_test' | 'documento_vencido';
  isBlocked: boolean;
  hasRecentPositive: boolean;
  hasExpiredLicense: boolean;
  hasExpiredPsychotechnical: boolean;
} => {
  const recentTest = allTests
    .filter((t) => t.driverId === driver.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const isBlocked = driver.status === 'bloqueado_preventivo';
  const hasRecentPositive =
    !!recentTest &&
    (recentTest.alcoholValueGramsPerLiter > 0 ||
      recentTest.alcoholStatus !== 'negativo' ||
      recentTest.drugsOverallStatus === 'presunto_positivo' ||
      recentTest.drugsOverallStatus === 'confirmado_positivo');

  const hasExpiredPsychotechnical = new Date(driver.psychotechnicalExpiry).getTime() < Date.now();
  const hasExpiredLicense = new Date(driver.licenseExpiry).getTime() < Date.now();

  let verdict: 'apto' | 'bloqueado' | 'requiere_test' | 'documento_vencido' = 'apto';
  if (isBlocked || hasRecentPositive) {
    verdict = 'bloqueado';
  } else if (hasExpiredLicense || hasExpiredPsychotechnical) {
    verdict = 'documento_vencido';
  } else if (!recentTest) {
    verdict = 'requiere_test';
  } else {
    verdict = 'apto';
  }

  return {
    recentTest,
    verdict,
    isBlocked,
    hasRecentPositive,
    hasExpiredLicense,
    hasExpiredPsychotechnical
  };
};

interface DriverQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTestForDriver?: (driverId: string) => void;
}

export const DriverQRScannerModal: React.FC<DriverQRScannerModalProps> = ({
  isOpen,
  onClose,
  onOpenNewTestForDriver
}) => {
  const {
    drivers,
    tests,
    equipment,
    currentCompany,
    currentUser,
    toggleDriverStatus,
    logAction,
    showToast
  } = useApp();

  const { isOnline, cacheStats } = useNetworkAndOffline();

  // Navigation tabs within scanner
  const [activeTab, setActiveTab] = useState<'camera' | 'simulator' | 'upload' | 'credentials'>('camera');
  
  // Camera stream state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Verification result state
  const [scannedDriver, setScannedDriver] = useState<Driver | null>(null);
  const [scannedRawData, setScannedRawData] = useState<string | null>(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [gateAuthorizationSuccess, setGateAuthorizationSuccess] = useState(false);

  // Bulk Scanning State
  const [isBulkScanMode, setIsBulkScanMode] = useState<boolean>(false);
  const [bulkShiftDrivers, setBulkShiftDrivers] = useState<ShiftScannedEntry[]>([]);
  const [lastScannedFeedback, setLastScannedFeedback] = useState<{
    driver: Driver;
    verdict: 'apto' | 'bloqueado' | 'requiere_test' | 'documento_vencido';
    isDuplicate: boolean;
  } | null>(null);

  // Anti-chatter / duplicate cooldown for camera frame detection
  const lastScannedQrRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);
  const feedbackTimeoutRef = useRef<any>(null);
  
  // Modal for showing credential badge of a driver
  const [credentialModalDriver, setCredentialModalDriver] = useState<Driver | null>(null);

  // Quick search in simulator tab
  const [simSearchTerm, setSimSearchTerm] = useState('');

  // Refs for camera and animation frame loop
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Sound chime synthesizer on scan detection
  const playScanBeep = useCallback((isSuccess = true) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      if (isSuccess) {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12); // E6
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }, []);

  // Parse QR text to find corresponding driver
  const parseQRAndMatchDriver = useCallback((qrText: string): Driver | null => {
    if (!qrText || typeof qrText !== 'string') return null;

    const trimmed = qrText.trim();
    // Fallback to offline cached snapshot if drivers is empty
    const pool = (drivers && drivers.length > 0) ? drivers : (getCachedDriversSnapshot() || []);

    // 1. Try parsing JSON payload
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.driverId) {
        const found = pool.find((d) => d.id === parsed.driverId);
        if (found) return found;
      }
      if (parsed.rut) {
        const cleanRut = parsed.rut.replace(/[^0-9kK]/g, '').toLowerCase();
        const found = pool.find((d) => d.rut.replace(/[^0-9kK]/g, '').toLowerCase() === cleanRut);
        if (found) return found;
      }
    } catch (e) {
      // Not JSON, continue to string matchers
    }

    // 2. Check if text contains URL query params (e.g., ?driver=drv-01 or ?rut=154829304)
    if (trimmed.includes('driver=') || trimmed.includes('rut=')) {
      const driverMatch = trimmed.match(/[?&]driver=([^&]+)/);
      if (driverMatch && driverMatch[1]) {
        const found = pool.find((d) => d.id === driverMatch[1]);
        if (found) return found;
      }
      const rutMatch = trimmed.match(/[?&]rut=([^&]+)/);
      if (rutMatch && rutMatch[1]) {
        const cleanParamRut = rutMatch[1].replace(/[^0-9kK]/g, '').toLowerCase();
        const found = pool.find((d) => d.rut.replace(/[^0-9kK]/g, '').toLowerCase() === cleanParamRut);
        if (found) return found;
      }
    }

    // 3. Check for raw driver ID (e.g., drv-01, drv-02)
    const directIdFound = pool.find((d) => d.id.toLowerCase() === trimmed.toLowerCase());
    if (directIdFound) return directIdFound;

    // 4. Check for RUT format in string (e.g., 15.482.930-4 or 15482930-4)
    const cleanInputRut = trimmed.replace(/[^0-9kK]/g, '').toLowerCase();
    if (cleanInputRut.length >= 7) {
      const directRutFound = pool.find(
        (d) => d.rut.replace(/[^0-9kK]/g, '').toLowerCase() === cleanInputRut
      );
      if (directRutFound) return directRutFound;
    }

    // 5. Check if driver fullName is matched inside the QR string
    const nameFound = pool.find((d) =>
      trimmed.toLowerCase().includes(d.fullName.toLowerCase())
    );
    if (nameFound) return nameFound;

    return null;
  }, [drivers]);

  // Handler when a QR code is detected
  const handleQRCodeDetected = useCallback((data: string) => {
    if (isProcessingScan) return;
    setIsProcessingScan(true);
    setScannedRawData(data);

    const matchedDriver = parseQRAndMatchDriver(data);

    if (matchedDriver) {
      const clearance = calculateDriverClearance(matchedDriver, tests);

      if (isBulkScanMode) {
        // BULK SCANNING MODE: Keep camera active, register driver to shift roster
        setBulkShiftDrivers((prev) => {
          const isAlreadyInShift = prev.some((e) => e.driver.id === matchedDriver.id);

          if (isAlreadyInShift) {
            playScanBeep(false);
            setLastScannedFeedback({
              driver: matchedDriver,
              verdict: clearance.verdict,
              isDuplicate: true
            });
            showToast(`⚠️ ${matchedDriver.fullName} ya fue registrado en la nómina de este turno.`);
            return prev;
          }

          playScanBeep(true);
          setLastScannedFeedback({
            driver: matchedDriver,
            verdict: clearance.verdict,
            isDuplicate: false
          });
          showToast(`✓ [Turno Diario] Registrado: ${matchedDriver.fullName} - ${clearance.verdict.toUpperCase().replace('_', ' ')}`);

          logAction(
            'REGISTRO_TURNO_MASIVO',
            'Driver',
            matchedDriver.id,
            `Enrolamiento masivo en garita para turno diario. Conductor: ${matchedDriver.fullName} (${matchedDriver.rut}) - Dictamen: ${clearance.verdict}`
          );

          const newEntry: ShiftScannedEntry = {
            id: `shift-${Date.now()}-${matchedDriver.id}`,
            driver: matchedDriver,
            scannedAt: new Date().toLocaleTimeString('es-CL'),
            timestamp: new Date().toISOString(),
            recentTest: clearance.recentTest,
            clearanceVerdict: clearance.verdict,
            authorized: clearance.verdict === 'apto'
          };
          return [newEntry, ...prev];
        });

        if (feedbackTimeoutRef.current) {
          clearTimeout(feedbackTimeoutRef.current);
        }
        feedbackTimeoutRef.current = setTimeout(() => {
          setLastScannedFeedback(null);
        }, 3200);
      } else {
        // STANDARD SINGLE-SCAN INSPECTION MODE
        playScanBeep(true);
        setScannedDriver(matchedDriver);
        setGateAuthorizationSuccess(false);
        showToast(`Credencial verificada: ${matchedDriver.fullName}`);
        
        logAction(
          'ESCANEO_QR_GARITA',
          'Driver',
          matchedDriver.id,
          `Escaneo óptico de credencial QR en garita. Conductor: ${matchedDriver.fullName} (${matchedDriver.rut}) - Estado: ${matchedDriver.status}`
        );
      }
    } else {
      playScanBeep(false);
      showToast('Código QR no corresponde a un conductor registrado.');
    }

    setTimeout(() => {
      setIsProcessingScan(false);
    }, isBulkScanMode ? 600 : 800);
  }, [isProcessingScan, parseQRAndMatchDriver, playScanBeep, showToast, logAction, isBulkScanMode, tests]);

  // Real-time video frame scanning loop using jsQR
  const scanVideoFrame = useCallback(() => {
    if (!videoRef.current || !cameraActive) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }

      // Size canvas to video
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        
        // Scan with jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data && !isProcessingScan && (!scannedDriver || isBulkScanMode)) {
          const now = Date.now();
          if (
            isBulkScanMode &&
            code.data === lastScannedQrRef.current &&
            now - lastScannedTimeRef.current < 2500
          ) {
            // Cooldown against repetitive trigger of identical QR in front of lens
            if (cameraActive) {
              animationFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
            }
            return;
          }

          lastScannedQrRef.current = code.data;
          lastScannedTimeRef.current = now;
          handleQRCodeDetected(code.data);

          if (!isBulkScanMode) {
            return;
          }
        }
      }
    }

    if (cameraActive && (!scannedDriver || isBulkScanMode)) {
      animationFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
    }
  }, [cameraActive, isProcessingScan, scannedDriver, isBulkScanMode, handleQRCodeDetected]);

  // Start Camera Stream
  const startCamera = async (deviceId?: string) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'La API de cámara (getUserMedia) no está disponible en este navegador o entorno.'
        );
        return;
      }

      // List devices for camera switcher
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const vDevices = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(vDevices);
      } catch (e) {
        // Enumerate devices not permitted or non-fatal
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check for torch/flashlight support
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setCameraActive(true);
      animationFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let errorMsg = 'No se pudo acceder a la cámara del dispositivo.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg =
          'Permiso de cámara denegado por el navegador. Habilite el permiso de cámara en los ajustes del sitio o utilice el simulador de garita.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No se detectó ninguna cámara de video disponible en este equipo.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'La cámara está siendo utilizada por otra aplicación.';
      }
      setCameraError(errorMsg);
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchEnabled(false);
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextTorch = !torchEnabled;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setTorchEnabled(nextTorch);
      } catch (e) {
        console.warn('Torch error:', e);
      }
    }
  };

  // Effect to manage camera lifecycle
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && (!scannedDriver || isBulkScanMode)) {
      startCamera(selectedDeviceId);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [isOpen, activeTab, scannedDriver, isBulkScanMode, selectedDeviceId]);

  // Restart scan loop if scannedDriver is cleared
  const handleResetScanner = () => {
    setScannedDriver(null);
    setScannedRawData(null);
    setGateAuthorizationSuccess(false);
    if (activeTab === 'camera') {
      startCamera(selectedDeviceId);
    }
  };

  // Image file QR scanner (upload photo)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code && code.data) {
            handleQRCodeDetected(code.data);
          } else {
            playScanBeep(false);
            showToast('No se detectó ningún código QR legible en la imagen seleccionada.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Authorize gate clearance for single driver
  const handleAuthorizeGateExit = (driver: Driver) => {
    setGateAuthorizationSuccess(true);
    playScanBeep(true);

    if (!isOnline) {
      enqueueOfflineAction({
        type: 'GATE_CLEARANCE',
        driverId: driver.id,
        driverName: driver.fullName,
        driverRut: driver.rut,
        operatorName: currentUser.name,
        operatorRut: currentUser.rut,
        details: `Autorización de salida en garita validada en MODO FUERA DE LÍNEA (Alcohotest 0.00 g/L y panel toxicológico negativo).`
      });
      showToast(`✓ [Caché Local Fuera de Línea] Despacho de ${driver.fullName} guardado en Cola Segura.`);
    } else {
      showToast(`Paso por Garita AUTORIZADO para ${driver.fullName}. Despacho validado.`);
      logAction(
        'DESPACHO_AUTORIZADO_GARITA',
        'Driver',
        driver.id,
        `Autorización de salida en garita validada por ${currentUser.name} (${currentUser.role}). Conductor: ${driver.fullName} (${driver.rut}) - Alcohotest 0.00 g/L y drogas negativo.`
      );
    }
  };

  // Bulk Shift Session Actions
  const handleAuthorizeAllAptos = () => {
    const unapprovedAptos = bulkShiftDrivers.filter(
      (e) => e.clearanceVerdict === 'apto' && !e.authorized
    );
    if (unapprovedAptos.length === 0) {
      showToast('Todos los conductores aptos ya se encuentran autorizados.');
      return;
    }

    setBulkShiftDrivers((prev) =>
      prev.map((e) => (e.clearanceVerdict === 'apto' ? { ...e, authorized: true } : e))
    );
    playScanBeep(true);
    showToast(`✓ Se autorizó el despacho masivo de ${unapprovedAptos.length} conductor(es) apto(s).`);

    logAction(
      'DESPACHO_MASIVO_TURNO',
      'Driver',
      currentUser.id,
      `Autorización masiva en garita para ${unapprovedAptos.length} conductores del turno diario por ${currentUser.name}`
    );
  };

  const handleToggleAuthorizeEntry = (entryId: string) => {
    setBulkShiftDrivers((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          const nextAuth = !e.authorized;
          showToast(
            nextAuth
              ? `✓ Despacho autorizado: ${e.driver.fullName}`
              : `Autorización revocada: ${e.driver.fullName}`
          );
          return { ...e, authorized: nextAuth };
        }
        return e;
      })
    );
  };

  const handleRemoveShiftEntry = (entryId: string) => {
    setBulkShiftDrivers((prev) => prev.filter((e) => e.id !== entryId));
    showToast('Conductor removido de la nómina del turno.');
  };

  const handleClearShiftList = () => {
    if (bulkShiftDrivers.length === 0) return;
    setBulkShiftDrivers([]);
    setLastScannedFeedback(null);
    showToast('Nómina de turno diario reiniciada.');
  };

  const handleExportShiftCSV = () => {
    if (bulkShiftDrivers.length === 0) {
      showToast('No hay conductores en la nómina del turno para exportar.');
      return;
    }

    const headers = [
      'N°',
      'Hora Escaneo',
      'Fecha',
      'RUT Conductor',
      'Nombre Completo',
      'Base Operacional',
      'Estado Laboral',
      'Dictamen Turno',
      'Despacho Autorizado',
      'Alcohotest (g/L)',
      'Estado Alcohol',
      'Panel 6 Drogas',
      'Licencias',
      'Vencimiento Licencia',
      'Vencimiento Psicotécnico',
      'Operador Garita',
      'Empresa'
    ];

    const rows = bulkShiftDrivers.map((entry, idx) => {
      const d = entry.driver;
      const t = entry.recentTest;
      return [
        idx + 1,
        entry.scannedAt,
        new Date(entry.timestamp).toLocaleDateString('es-CL'),
        d.rut,
        `"${d.fullName.replace(/"/g, '""')}"`,
        `"${d.assignedBase.replace(/"/g, '""')}"`,
        d.status,
        entry.clearanceVerdict.toUpperCase(),
        entry.authorized ? 'SI' : 'NO',
        t ? t.alcoholValueGramsPerLiter.toFixed(2) : '0.00',
        t ? t.alcoholStatus : 'SIN TEST',
        t ? t.drugsOverallStatus : 'SIN TEST',
        `"${d.licenseClass.join(', ')}"`,
        d.licenseExpiry,
        d.psychotechnicalExpiry,
        `"${currentUser.name.replace(/"/g, '""')}"`,
        `"${currentCompany.fantasyName.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `Nomina_Turno_Garita_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`✓ Nómina exportada a CSV (${bulkShiftDrivers.length} conductores).`);
  };

  if (!isOpen) return null;

  // Selected driver's most recent alcohol/drug test record
  const recentTest: TestRecord | undefined = scannedDriver
    ? tests
        .filter((t) => t.driverId === scannedDriver.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : undefined;

  // Analysis of the driver test status
  const isDriverBlocked = scannedDriver?.status === 'bloqueado_preventivo';
  const hasRecentPositive =
    recentTest &&
    (recentTest.alcoholValueGramsPerLiter > 0 ||
      recentTest.alcoholStatus !== 'negativo' ||
      recentTest.drugsOverallStatus === 'presunto_positivo' ||
      recentTest.drugsOverallStatus === 'confirmado_positivo');

  const hasExpiredPsychotechnical = scannedDriver
    ? new Date(scannedDriver.psychotechnicalExpiry).getTime() < Date.now()
    : false;

  const hasExpiredLicense = scannedDriver
    ? new Date(scannedDriver.licenseExpiry).getTime() < Date.now()
    : false;

  // Overall Clearance Verdict
  let clearanceVerdict: 'apto' | 'bloqueado' | 'requiere_test' | 'documento_vencido' = 'apto';
  if (isDriverBlocked || hasRecentPositive) {
    clearanceVerdict = 'bloqueado';
  } else if (hasExpiredLicense || hasExpiredPsychotechnical) {
    clearanceVerdict = 'documento_vencido';
  } else if (!recentTest) {
    clearanceVerdict = 'requiere_test';
  } else {
    clearanceVerdict = 'apto';
  }

  // Tally counts for bulk shift roster
  const aptosInShift = bulkShiftDrivers.filter((e) => e.clearanceVerdict === 'apto').length;
  const pendingTestInShift = bulkShiftDrivers.filter((e) => e.clearanceVerdict === 'requiere_test').length;
  const blockedInShift = bulkShiftDrivers.filter(
    (e) => e.clearanceVerdict === 'bloqueado' || e.clearanceVerdict === 'documento_vencido'
  ).length;
  const authorizedInShift = bulkShiftDrivers.filter((e) => e.authorized).length;

  // Filtered drivers for simulator
  const filteredSimDrivers = drivers.filter((d) => {
    const term = simSearchTerm.toLowerCase();
    return (
      d.fullName.toLowerCase().includes(term) ||
      d.rut.toLowerCase().includes(term) ||
      d.assignedBase.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-slate-700 rounded-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all duration-300 ${
          isBulkScanMode ? 'max-w-5xl' : 'max-w-3xl'
        }`}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  Control de Garita & Escáner QR
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  EN VIVO • SUSESO / DT
                </span>
                {isOnline ? (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700/60">
                    <Wifi className="w-3 h-3" /> Red 4G/WiFi
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-950 text-amber-200 font-bold px-2 py-0.5 rounded-full border border-amber-500 shadow-sm animate-pulse">
                    <WifiOff className="w-3 h-3" /> Modo Fuera de Línea
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Verificación óptica instantánea de aptitud toxicológica, alcohotest (0.00 g/L) y legajo laboral
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Bulk Scanning Mode Toggle Switch */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition shadow-inner ${
                isBulkScanMode
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-bold text-white flex items-center justify-end gap-1">
                  <Zap
                    className={`w-3.5 h-3.5 transition ${
                      isBulkScanMode
                        ? 'text-emerald-400 fill-emerald-400 animate-pulse'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>Escaneo Masivo</span>
                </span>
                <span className="text-[9px] font-mono opacity-80 hidden sm:inline">
                  {isBulkScanMode ? 'Cámara Continua' : 'Modo Individual'}
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isBulkScanMode}
                onClick={() => {
                  const next = !isBulkScanMode;
                  setIsBulkScanMode(next);
                  if (next && scannedDriver) {
                    setScannedDriver(null);
                    startCamera(selectedDeviceId);
                  }
                  showToast(
                    next
                      ? '⚡ Escaneo Masivo ACTIVADO: La cámara se mantendrá activa tras cada lectura para registrar el turno.'
                      : 'Modo individual restaurado.'
                  );
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isBulkScanMode ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-700'
                }`}
                title="Activar / Desactivar Escaneo Masivo para Turno Diario"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isBulkScanMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
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
        </div>

        {/* Navigation Tabs (if no driver currently inspected) */}
        {!scannedDriver && (
          <div className="flex items-center gap-1.5 p-2.5 bg-slate-950/70 border-b border-slate-800 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('camera')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'camera'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Cámara en Vivo</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Simulador de Credenciales</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Subir Foto / Archivo QR</span>
            </button>

            <button
              onClick={() => setActiveTab('credentials')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'credentials'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileBadge className="w-4 h-4 text-blue-400" />
              <span>Pases Digitales con QR</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* ========================================================================= */}
          {/* VERIFIED DRIVER DOSSIER VIEW (Displayed when a QR has been scanned)       */}
          {/* ========================================================================= */}
          {scannedDriver ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Operational Verdict Banner */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg ${
                  clearanceVerdict === 'apto'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : clearanceVerdict === 'bloqueado'
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                    : clearanceVerdict === 'documento_vencido'
                    ? 'bg-amber-950/70 border-amber-500 text-amber-200'
                    : 'bg-blue-950/60 border-blue-500 text-blue-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                      clearanceVerdict === 'apto'
                        ? 'bg-emerald-500 text-white'
                        : clearanceVerdict === 'bloqueado'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : clearanceVerdict === 'documento_vencido'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {clearanceVerdict === 'apto' && <CheckCircle2 className="w-7 h-7" />}
                    {clearanceVerdict === 'bloqueado' && <Lock className="w-7 h-7" />}
                    {clearanceVerdict === 'documento_vencido' && <AlertTriangle className="w-7 h-7" />}
                    {clearanceVerdict === 'requiere_test' && <Clock className="w-7 h-7" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/40">
                        RESOLUCIÓN EN GARITA
                      </span>
                      <span className="text-[10px] font-mono opacity-80">
                        {new Date().toLocaleTimeString('es-CL')} CLT
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold mt-0.5 leading-tight text-white">
                      {clearanceVerdict === 'apto' && 'HABILITADO • APTO PARA SALIDA / DESPACHO'}
                      {clearanceVerdict === 'bloqueado' && 'BLOQUEO PREVENTIVO ACTIVO • SALIDA PROHIBIDA'}
                      {clearanceVerdict === 'documento_vencido' && 'RECHAZADO • DOCUMENTO CRÍTICO VENCIDO'}
                      {clearanceVerdict === 'requiere_test' && 'CONTROL PRE-TURNO REQUERIDO'}
                    </h3>
                    <p className="text-xs opacity-90 mt-1 max-w-xl">
                      {clearanceVerdict === 'apto' &&
                        'Cumple estándar Tolerancia Cero (0.00 g/L de alcohol), panel de 6 drogas negativo y legajo de licencias al día.'}
                      {clearanceVerdict === 'bloqueado' &&
                        'No autorizado para conducir bajo Art. 184 del Código del Trabajo por resultado positivo o sanción disciplinaria vigente.'}
                      {clearanceVerdict === 'documento_vencido' &&
                        'Examen psicotécnico de la mutualidad o licencia de conducir expirada. Bloqueo automático de asignación de ruta.'}
                      {clearanceVerdict === 'requiere_test' &&
                        'El conductor no registra control toxicológico en las últimas 24 horas. Realice el test de garita antes de despachar.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetScanner}
                  className="px-3 py-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl border border-slate-700 transition text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Escanear Otro</span>
                </button>
              </div>

              {/* Gate Authorization Alert if successfully confirmed */}
              {gateAuthorizationSuccess && (
                <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/60 rounded-2xl flex items-center gap-3 text-xs text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">
                      ✓ Despacho Registrado en Bitácora Inalterable
                    </span>
                    <span className="text-[11px] text-emerald-300">
                      Se ha timbrado electrónicamente el pase del conductor {scannedDriver.fullName} por el operador en garita.
                    </span>
                  </div>
                </div>
              )}

              {/* Main 2-Column Grid: Driver Profile & Recent Tests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column 1: Driver Ficha */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-400" />
                      <span>Ficha del Conductor</span>
                    </span>
                    <button
                      onClick={() => setCredentialModalDriver(scannedDriver)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Ver Credencial</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <img
                      src={scannedDriver.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                      alt={scannedDriver.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{scannedDriver.fullName}</h4>
                      <p className="text-xs font-mono font-semibold text-blue-400">RUT: {scannedDriver.rut}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{scannedDriver.assignedBase}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 text-slate-300">
                      <span className="text-slate-400 text-[11px]">Empresa:</span>
                      <span className="font-semibold text-white">{currentCompany.fantasyName}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 text-slate-300">
                      <span className="text-slate-400 text-[11px]">Licencias Vigentes:</span>
                      <div className="flex gap-1">
                        {scannedDriver.licenseClass.map((lic) => (
                          <span
                            key={lic}
                            className="bg-blue-600/40 text-blue-300 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold"
                          >
                            {lic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 text-slate-300">
                      <span className="text-slate-400 text-[11px]">Vencimiento Licencia:</span>
                      <span className={`font-mono font-bold ${hasExpiredLicense ? 'text-rose-400' : 'text-slate-200'}`}>
                        {scannedDriver.licenseExpiry} {hasExpiredLicense && '(VENCIDA)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 text-slate-300">
                      <span className="text-slate-400 text-[11px]">Psicotécnico Mutual:</span>
                      <span className={`font-mono font-bold ${hasExpiredPsychotechnical ? 'text-rose-400' : 'text-slate-200'}`}>
                        {scannedDriver.psychotechnicalExpiry} {hasExpiredPsychotechnical && '(VENCIDO)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 text-slate-300">
                      <span className="text-slate-400 text-[11px]">Total Controles Históricos:</span>
                      <span className="font-mono font-bold text-white">
                        {scannedDriver.totalTests} realizados
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Most Recent Alcohol & Drug Test Status */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-emerald-400" />
                      <span>Último Control de Alcohol & Drogas</span>
                    </span>
                    {recentTest && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {recentTest.code}
                      </span>
                    )}
                  </div>

                  {recentTest ? (
                    <div className="space-y-2.5 text-xs">
                      {/* Test Metadata */}
                      <div className="flex items-center justify-between text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                        <span className="text-slate-400 text-[11px]">Fecha y Hora:</span>
                        <span className="font-mono font-bold text-white">{recentTest.timestamp}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                        <span className="text-slate-400 text-[11px]">Motivo del Test:</span>
                        <span className="font-semibold text-blue-400">{recentTest.reason}</span>
                      </div>

                      {/* Alcohol measurement */}
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px] font-semibold">Alcohotest Evidencial:</span>
                          <span
                            className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                              recentTest.alcoholValueGramsPerLiter === 0
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {recentTest.alcoholValueGramsPerLiter.toFixed(2)} g/L ({recentTest.alcoholStatus.toUpperCase()})
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Equipo: {recentTest.alcoholDeviceModel} (S/N: {recentTest.alcoholDeviceSerial}) • Calibración Vigente
                        </p>
                      </div>

                      {/* Drugs measurement */}
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px] font-semibold">Panel Tox. 6 Drogas:</span>
                          <span
                            className={`font-mono text-[11px] font-black px-2 py-0.5 rounded uppercase ${
                              recentTest.drugsOverallStatus === 'negativo'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {recentTest.drugsOverallStatus.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Substances badges */}
                        <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                          {recentTest.drugPanelResults.map((dp) => (
                            <div
                              key={dp.drug}
                              className={`px-1.5 py-1 rounded text-center font-mono font-bold ${
                                dp.result === 'negativo'
                                  ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                                  : 'bg-rose-950/60 border border-rose-600 text-rose-300 animate-pulse'
                              }`}
                            >
                              <span>{dp.drug}: </span>
                              <span>{dp.result === 'negativo' ? 'NEG' : 'POS'}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Kit: {recentTest.drugKitModel} ({recentTest.drugKitLot})
                        </p>
                      </div>

                      {/* Operator */}
                      <div className="flex items-center justify-between text-slate-400 text-[11px] px-1">
                        <span>Operador Responsable:</span>
                        <span className="font-semibold text-slate-300">{recentTest.operatorName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-3 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                      <Clock className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-xs text-amber-200 font-semibold">
                        Este conductor no registra controles toxicológicos recientes en el sistema.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Debe practicarse un control de alcohotest y panel de drogas antes de autorizar la salida en garita.
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {clearanceVerdict === 'apto' && (
                    <button
                      onClick={() => handleAuthorizeGateExit(scannedDriver)}
                      disabled={gateAuthorizationSuccess}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer ${
                        gateAuthorizationSuccess
                          ? 'bg-emerald-700 text-white cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {gateAuthorizationSuccess ? 'Despacho Ya Autorizado' : 'Autorizar Despacho Inmediato'}
                      </span>
                    </button>
                  )}

                  {onOpenNewTestForDriver && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNewTestForDriver(scannedDriver.id);
                      }}
                      className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow transition cursor-pointer"
                    >
                      <FlaskConical className="w-4 h-4" />
                      <span>Tomar Test Pre-Turno In-Situ</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const nextStatus = isDriverBlocked ? 'activo' : 'bloqueado_preventivo';
                      const reason = isDriverBlocked
                        ? 'Desbloqueo tras revisión médica/garita'
                        : 'Bloqueo preventivo en control de garita por sospecha o resultado anómalo';
                      toggleDriverStatus(scannedDriver.id, nextStatus as any, reason);
                      setScannedDriver({
                        ...scannedDriver,
                        status: nextStatus as any
                      });
                      if (!isOnline) {
                        enqueueOfflineAction({
                          type: 'PREVENTIVE_BLOCK',
                          driverId: scannedDriver.id,
                          driverName: scannedDriver.fullName,
                          driverRut: scannedDriver.rut,
                          operatorName: currentUser.name,
                          operatorRut: currentUser.rut,
                          details: reason
                        });
                        showToast(`✓ [Caché Local Fuera de Línea] Acción de bloqueo/habilitación encolada.`);
                      }
                    }}
                    className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                      isDriverBlocked
                        ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-600'
                        : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-600'
                    }`}
                  >
                    {isDriverBlocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Habilitar Conductor</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Bloquear Preventivamente</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCredentialModalDriver(scannedDriver)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ver Credencial QR</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* ========================================================================= */
            /* SCANNER MODES VIEW (Camera, Simulator, Upload, Cards)                    */
            /* ========================================================================= */
            <div className="space-y-4">
              
              {/* TAB 1: LIVE CAMERA SCANNER */}
              {activeTab === 'camera' && (
                <div className={isBulkScanMode ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 text-left' : 'space-y-4 text-center'}>
                  
                  {/* Viewfinder Column */}
                  <div className={isBulkScanMode ? 'lg:col-span-6 space-y-3' : 'space-y-4'}>
                    {/* Viewfinder Window */}
                    <div className="relative w-full aspect-video sm:aspect-4/3 max-h-[380px] bg-black rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center mx-auto">
                      {cameraActive ? (
                        <>
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            playsInline
                            muted
                          />

                          {/* Visual Scanning Viewfinder Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-blue-400/80 rounded-3xl relative shadow-[0_0_40px_rgba(59,130,246,0.35)]">
                              {/* Animated Laser Scanning Line */}
                              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_15px_#22d3ee]" />
                              
                              {/* Corner Viewfinder Markers */}
                              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-cyan-400 rounded-tl-lg" />
                              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-cyan-400 rounded-tr-lg" />
                              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-cyan-400 rounded-bl-lg" />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-cyan-400 rounded-br-lg" />

                              {/* Center Target Indicator */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[11px] font-mono text-cyan-300 font-bold bg-slate-950/80 px-2.5 py-1 rounded-full border border-cyan-500/40">
                                  {isBulkScanMode ? 'Cámara Continua Activa' : 'Apunte al QR de la Credencial'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Top Live Camera Controls */}
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            {hasTorch && (
                              <button
                                onClick={toggleTorch}
                                className={`p-2 rounded-xl transition cursor-pointer shadow ${
                                  torchEnabled
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-slate-900/80 text-white hover:bg-slate-800'
                                }`}
                                title="Activar Linterna"
                              >
                                <Zap className="w-4 h-4" />
                              </button>
                            )}

                            {videoDevices.length > 1 && (
                              <select
                                value={selectedDeviceId}
                                onChange={(e) => setSelectedDeviceId(e.target.value)}
                                className="bg-slate-900/80 text-white text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-700"
                              >
                                {videoDevices.map((d, i) => (
                                  <option key={d.deviceId || i} value={d.deviceId}>
                                    {d.label || `Cámara ${i + 1}`}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Last Scanned Quick Overlay Notification in Bulk Mode */}
                          {isBulkScanMode && lastScannedFeedback && (
                            <div className="absolute bottom-3 inset-x-3 bg-slate-950/95 border border-emerald-500/50 rounded-2xl p-2.5 shadow-2xl animate-in slide-in-from-bottom-2 duration-200 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <img
                                  src={lastScannedFeedback.driver.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                                  alt={lastScannedFeedback.driver.fullName}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                                />
                                <div className="overflow-hidden">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-white truncate">
                                      {lastScannedFeedback.driver.fullName}
                                    </span>
                                    {lastScannedFeedback.isDuplicate ? (
                                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                                        Duplicado
                                      </span>
                                    ) : (
                                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                                        Enrolado
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {lastScannedFeedback.driver.rut} • Dictamen:{' '}
                                    <strong
                                      className={
                                        lastScannedFeedback.verdict === 'apto'
                                          ? 'text-emerald-400'
                                          : lastScannedFeedback.verdict === 'requiere_test'
                                          ? 'text-blue-400'
                                          : 'text-rose-400'
                                      }
                                    >
                                      {lastScannedFeedback.verdict.toUpperCase().replace('_', ' ')}
                                    </strong>
                                  </p>
                                </div>
                              </div>
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-6 text-center space-y-3 max-w-md">
                          <VideoOff className="w-12 h-12 text-slate-500 mx-auto" />
                          <h4 className="text-sm font-bold text-white">Cámara no inicializada</h4>
                          <p className="text-xs text-slate-400">
                            {cameraError ||
                              'Para escanear en tiempo real, conceda permiso de acceso a la cámara o utilice el simulador de garita.'}
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                              onClick={() => startCamera(selectedDeviceId)}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow"
                            >
                              Activar Cámara
                            </button>
                            <button
                              onClick={() => setActiveTab('simulator')}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                            >
                              Usar Simulador
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <p className="text-left">
                        {isBulkScanMode
                          ? '⚡ Escaneo continuo activo. Presente las credenciales una tras otra sin interrupción.'
                          : '💡 Sostenga la credencial física o la pantalla de su teléfono frente al lente. Detección instantánea.'}
                      </p>
                      <span className="text-[10px] font-mono bg-slate-900 px-2 py-1 rounded text-slate-300 shrink-0 border border-slate-800 ml-2">
                        jsQR v1.4 • SHA-256
                      </span>
                    </div>

                    {/* Quick simulation buttons below camera */}
                    <div className="pt-1">
                      <p className="text-[11px] font-semibold text-slate-400 mb-2">
                        {isBulkScanMode
                          ? 'O haga clic para enrolar conductores rápidamente al turno:'
                          : 'O pruebe un escaneo simulado directo con conductores reales:'}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {drivers.slice(0, 5).map((d) => (
                          <button
                            key={d.id}
                            onClick={() => handleQRCodeDetected(`drv:${d.id}|rut:${d.rut}`)}
                            className="text-xs bg-slate-950 hover:bg-blue-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:border-blue-500 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                d.status === 'habilitado' ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                            <span>
                              {d.fullName.split(' ')[0]} {d.fullName.split(' ')[1]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BULK SCANNING ROSTER COLUMN */}
                  {isBulkScanMode && (
                    <div className="lg:col-span-6 flex flex-col space-y-3 bg-slate-950/80 border border-slate-800 rounded-3xl p-4">
                      {/* Roster Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-emerald-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">Nómina de Turno Diario</h3>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                                {bulkShiftDrivers.length} Registrados
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Registro continuo de garita sin cierre de cámara
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {bulkShiftDrivers.length > 0 && (
                            <button
                              onClick={handleClearShiftList}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                              title="Limpiar Nómina de Turno"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Summary Badges Bar */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Aptos</span>
                          <span className="font-bold font-mono text-emerald-400 text-sm">{aptosInShift}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Req. Test</span>
                          <span className="font-bold font-mono text-blue-400 text-sm">{pendingTestInShift}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Bloqueados/Venc.</span>
                          <span className="font-bold font-mono text-rose-400 text-sm">{blockedInShift}</span>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleAuthorizeAllAptos}
                          disabled={aptosInShift === 0}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>Autorizar Todos los Aptos</span>
                        </button>

                        <button
                          onClick={handleExportShiftCSV}
                          disabled={bulkShiftDrivers.length === 0}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs py-2 px-3 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                          title="Descargar Planilla CSV del Turno"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <span className="hidden sm:inline">CSV</span>
                        </button>
                      </div>

                      {/* Scanned Shift Drivers List */}
                      <div className="flex-1 max-h-[290px] overflow-y-auto space-y-2 pr-1">
                        {bulkShiftDrivers.length === 0 ? (
                          <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                            <QrCode className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                            <p className="text-xs font-semibold text-slate-300">
                              Escáner Continuo en Espera
                            </p>
                            <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                              Presente las credenciales físicas frente a la cámara o utilice los botones de conductores de prueba para ir enrolando la nómina del turno.
                            </p>
                          </div>
                        ) : (
                          bulkShiftDrivers.map((entry) => {
                            const d = entry.driver;
                            const t = entry.recentTest;

                            return (
                              <div
                                key={entry.id}
                                className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-2.5 transition flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <img
                                    src={d.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                                    alt={d.fullName}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                                  />
                                  <div className="overflow-hidden">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-white truncate">{d.fullName}</span>
                                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1 py-0.2 rounded border border-slate-800">
                                        {d.rut}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                      <span>Hora: <strong className="text-slate-300">{entry.scannedAt}</strong></span>
                                      <span>• Base: {d.assignedBase}</span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                      {/* Verdict Pill */}
                                      <span
                                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                          entry.clearanceVerdict === 'apto'
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                            : entry.clearanceVerdict === 'requiere_test'
                                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                        }`}
                                      >
                                        {entry.clearanceVerdict === 'apto' && 'Apto Despacho'}
                                        {entry.clearanceVerdict === 'requiere_test' && 'Req. Test Pre-Turno'}
                                        {entry.clearanceVerdict === 'bloqueado' && 'Bloqueado'}
                                        {entry.clearanceVerdict === 'documento_vencido' && 'Doc. Vencido'}
                                      </span>

                                      {/* Recent test indicator */}
                                      {t ? (
                                        <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                                          Alc: {t.alcoholValueGramsPerLiter.toFixed(2)} g/L
                                        </span>
                                      ) : (
                                        <span className="text-[9px] text-amber-300 font-semibold">
                                          Sin test 24h
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Authorized state toggle */}
                                  <button
                                    onClick={() => handleToggleAuthorizeEntry(entry.id)}
                                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                                      entry.authorized
                                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                                    }`}
                                    title="Alternar autorización de despacho"
                                  >
                                    {entry.authorized ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Autorizado</span>
                                      </>
                                    ) : (
                                      <span>Pendiente</span>
                                    )}
                                  </button>

                                  {/* Quick Test if requires test */}
                                  {entry.clearanceVerdict === 'requiere_test' && onOpenNewTestForDriver && (
                                    <button
                                      onClick={() => {
                                        onClose();
                                        onOpenNewTestForDriver(d.id);
                                      }}
                                      className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                                      title="Tomar Test Pre-Turno ahora"
                                    >
                                      <FlaskConical className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* View single dossier */}
                                  <button
                                    onClick={() => setScannedDriver(d)}
                                    className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition"
                                    title="Ver Ficha Detallada"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Remove single entry */}
                                  <button
                                    onClick={() => handleRemoveShiftEntry(entry.id)}
                                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-950 rounded-lg transition"
                                    title="Quitar de nómina"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: FIELD CREDENTIAL SIMULATOR */}
              {activeTab === 'simulator' && (
                <div className="space-y-4">
                  {isBulkScanMode && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-200">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white block">
                            Modo Escaneo Masivo Activo ({bulkShiftDrivers.length} enrolados en turno)
                          </span>
                          <span className="text-[11px] text-emerald-300">
                            Haga clic en los conductores para enrolarlos sucesivamente sin detenerse ni cerrar la vista.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setActiveTab('camera')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Ver Nómina & Cámara
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-2xl flex items-start gap-3 text-xs text-blue-200">
                    <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Simulador de Control en Garita (Paso de Turno)</p>
                      <p className="text-[11px] text-blue-300 mt-0.5">
                        Haga clic en cualquiera de los conductores para simular la lectura del código QR de su credencial oficial y auditar en milisegundos su alcohotest, panel toxicológico y vigencia de licencias.
                      </p>
                    </div>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={simSearchTerm}
                      onChange={(e) => setSimSearchTerm(e.target.value)}
                      placeholder="Filtrar conductor por nombre, RUT o base operacional..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Drivers Grid */}
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {filteredSimDrivers.map((driver) => {
                      const driverRecentTest = tests
                        .filter((t) => t.driverId === driver.id)
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

                      const isBlocked = driver.status === 'bloqueado_preventivo';

                      return (
                        <button
                          key={driver.id}
                          onClick={() => handleQRCodeDetected(`drv:${driver.id}|rut:${driver.rut}`)}
                          className="w-full bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-3 text-left transition flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <img
                              src={driver.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                              alt={driver.fullName}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white group-hover:text-blue-300 truncate">
                                  {driver.fullName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                                  {driver.rut}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Base: <strong className="text-slate-300">{driver.assignedBase}</strong> • Licencias: {driver.licenseClass.join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className="text-right">
                              <span
                                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border block ${
                                  isBlocked
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}
                              >
                                {driver.status.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {driverRecentTest
                                  ? `Test: ${driverRecentTest.alcoholValueGramsPerLiter.toFixed(2)} g/L`
                                  : 'Sin test hoy'}
                              </span>
                            </div>

                            <div className="p-2 bg-blue-600/20 group-hover:bg-blue-600 text-blue-400 group-hover:text-white rounded-xl transition">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: UPLOAD QR PHOTO */}
              {activeTab === 'upload' && (
                <div className="space-y-4 text-center py-4">
                  <div className="p-8 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-3xl bg-slate-950/60 transition flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/30">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Suba una imagen de la Credencial o Código QR
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Arrastre un archivo JPG, PNG o fotografía tomada desde su teléfono móvil para decodificar automáticamente el estado.
                      </p>
                    </div>

                    <label className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow cursor-pointer transition flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      <span>Seleccionar Imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 4: DIGITAL CREDENTIALS BATCH GALLERY */}
              {activeTab === 'credentials' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span>Haga clic en cualquier conductor para ver e imprimir su credencial oficial con QR:</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {drivers.length} Conductores
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {drivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-blue-500/60 transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={driver.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                            alt={driver.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate">{driver.fullName}</h4>
                            <p className="text-[10px] font-mono text-blue-400">{driver.rut}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setCredentialModalDriver(driver)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
                          >
                            Ver Pase
                          </button>
                          <button
                            onClick={() => handleQRCodeDetected(`drv:${driver.id}|rut:${driver.rut}`)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition cursor-pointer"
                            title="Escanear en Garita"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Individual Driver Credential Modal */}
      {credentialModalDriver && (
        <DriverCredentialModal
          driver={credentialModalDriver}
          isOpen={true}
          onClose={() => setCredentialModalDriver(null)}
          onScanThisDriver={(driver) => {
            setCredentialModalDriver(null);
            handleQRCodeDetected(`drv:${driver.id}|rut:${driver.rut}`);
          }}
        />
      )}

    </div>
  );
};
