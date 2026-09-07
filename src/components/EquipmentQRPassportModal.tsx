import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Equipment, EquipmentServiceRecord } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  QrCode,
  Calendar,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Printer,
  PlusCircle,
  Clock,
  Building2,
  Gauge,
  Cpu,
  Hash,
  Award,
  Sparkles,
  Info
} from 'lucide-react';

interface EquipmentQRPassportModalProps {
  equipment: Equipment;
  onClose: () => void;
  onCalibrate?: (equipment: Equipment) => void;
}

export const EquipmentQRPassportModal: React.FC<EquipmentQRPassportModalProps> = ({
  equipment,
  onClose,
  onCalibrate
}) => {
  const { addEquipmentServiceRecord, currentUser, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'passport' | 'history' | 'new_service' | 'sticker'>('passport');
  const [showCertPreview, setShowCertPreview] = useState<EquipmentServiceRecord | null>(null);

  // New Service Record Form State
  const [serviceType, setServiceType] = useState<EquipmentServiceRecord['type']>('calibracion_periodica');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().substring(0, 10));
  const [serviceLab, setServiceLab] = useState('Metrología y Precisión Chile S.A. (Acreditado INN LE-810)');
  const [serviceCertNumber, setServiceCertNumber] = useState(`CERT-MET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [technicianName, setTechnicianName] = useState(currentUser.name || 'Ing. Carlos Henríquez (Metrólogo)');
  const [serviceResult, setServiceResult] = useState<EquipmentServiceRecord['result']>('aprobado_conforme');
  const [serviceNextDue, setServiceNextDue] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().substring(0, 10);
  });
  const [serviceObservations, setServiceObservations] = useState(
    'Calibración metrológica semestral con gas patrón etanol trazable NIST / OIML R 126. Curva de calibración conforme con repetibilidad superior al 99.8%.'
  );
  const [serviceDeviation, setServiceDeviation] = useState<number>(0.001);

  // Unique QR payload identifier for field auditing
  const qrPayload = `https://blindajevial.cl/metrologia/equipos?id=${equipment.id}&sn=${encodeURIComponent(equipment.serialNumber)}&base=${encodeURIComponent(equipment.assignedBase)}`;

  // Calibration expiration math (Assuming current date is ~Aug/Sept 2026)
  const calculateDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = new Date('2026-08-31').getTime(); // App timeline
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = calculateDaysRemaining(equipment.nextCalibrationDate);
  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    showToast('Enlace de auditoría QR copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`qr-svg-${equipment.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${equipment.serialNumber}_BlindajeVial.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        showToast('Código QR descargado en alta resolución PNG.');
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintSticker = () => {
    window.print();
  };

  const handleSaveServiceRecord = (e: React.FormEvent) => {
    e.preventDefault();
    addEquipmentServiceRecord(equipment.id, {
      date: serviceDate,
      type: serviceType,
      laboratory: serviceLab,
      certificateNumber: serviceCertNumber,
      technicianName,
      result: serviceResult,
      observations: serviceObservations,
      nextCalibrationDueDate: serviceNextDue,
      deviationGramsPerLiter: Number(serviceDeviation),
      certificatePdfUrl: `https://metrologia.cl/certificados/${serviceCertNumber}.pdf`
    });

    setActiveTab('history');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header with Device Identity & Status */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl shrink-0">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  PASAPORTE DIGITAL DE METROLOGÍA
                </span>
                {equipment.code && (
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {equipment.code}
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    isExpired
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isExpiringSoon
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isExpired
                    ? 'DESCALIBRADO • INHABILITADO'
                    : isExpiringSoon
                    ? `VENCE EN ${daysRemaining} DÍAS`
                    : 'CALIBRADO • VIGENTE'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                {equipment.brandModel}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>S/N: <strong className="text-blue-400">{equipment.serialNumber}</strong></span>
                <span>•</span>
                <span>Base: <strong className="text-slate-200">{equipment.assignedBase}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('passport')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'passport'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ficha & Código QR</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historial de Servicios ({equipment.serviceHistory?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('new_service')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'new_service'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Calibración / Servicio</span>
          </button>

          <button
            onClick={() => setActiveTab('sticker')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sticker'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Etiqueta QR Industrial</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* TAB 1: PASSPORT & QR CODE VIEW */}
          {activeTab === 'passport' && (
            <div className="space-y-6">
              
              {/* Highlight Card: Next Calibration & Countdown */}
              <div
                className={`rounded-2xl p-5 border shadow-lg ${
                  isExpired
                    ? 'bg-rose-950/30 border-rose-700/50'
                    : isExpiringSoon
                    ? 'bg-amber-950/30 border-amber-700/50'
                    : 'bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border-blue-700/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>PRÓXIMA FECHA LÍMITE DE CALIBRACIÓN METROLÓGICA</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white flex items-baseline gap-3">
                      <span>{equipment.nextCalibrationDate}</span>
                      <span
                        className={`text-xs font-sans font-bold px-3 py-1 rounded-full ${
                          isExpired
                            ? 'bg-rose-600 text-white'
                            : isExpiringSoon
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isExpired
                          ? `¡VENCIDO HACE ${Math.abs(daysRemaining)} DÍAS!`
                          : isExpiringSoon
                          ? `¡Vence pronto! (${daysRemaining} días)`
                          : `Vigente (${daysRemaining} días restantes)`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Laboratorio Certificador:{' '}
                      <strong className="text-slate-200">
                        {equipment.calibrationLab || 'Dräger Safety Chile / Metrología y Precisión S.A.'}
                      </strong>
                      {equipment.calibrationCertificateNumber && (
                        <span> • Certificado N° <strong className="font-mono text-blue-300">{equipment.calibrationCertificateNumber}</strong></span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('new_service')}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md flex items-center gap-2"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Calibrar Ahora</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: QR Code Panel & Device Specifications */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* QR Code Presentation Box */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-between text-center space-y-4">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-semibold text-slate-300">Código QR Único del Dispositivo</span>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">
                      ISO/IEC 18004
                    </span>
                  </div>

                  {/* QR SVG with White Background for scanning clarity */}
                  <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                    <QRCodeSVG
                      id={`qr-svg-${equipment.id}`}
                      value={qrPayload}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Escanee este código con cualquier teléfono, tablet o lector de garita para abrir esta hoja de vida y validar vigencia en terreno.
                    </p>

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={handleDownloadQR}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                        title="Descargar imagen PNG"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>PNG</span>
                      </button>

                      <button
                        onClick={handleCopyLink}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                        title="Copiar URL directa de verificación"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                        <span>{copied ? 'Copiado' : 'Copiar URL'}</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('sticker')}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        title="Generar Etiqueta Industrial para Imprimir"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Etiqueta</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications & Metrological Details */}
                <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-blue-400" />
                      <span>Especificaciones Técnicas y Metrológicas</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Tipo: {equipment.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px]">Tipo de Sensor:</span>
                      <p className="font-semibold text-slate-100">
                        {equipment.sensorType || 'Sensor Electroquímico Fuel Cell 1/4"'}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px]">Versión de Firmware / Lote:</span>
                      <p className="font-mono font-semibold text-blue-300">
                        {equipment.firmwareVersion || 'v4.12.08-CL'}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px]">Última Calibración Registrada:</span>
                      <p className="font-mono font-semibold text-slate-100">
                        {equipment.lastCalibrationDate}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px]">Periodicidad Exigida:</span>
                      <p className="font-semibold text-slate-100">
                        Semestral (6 meses) • OIML R 126
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px]">Total Pruebas Realizadas:</span>
                      <p className="font-mono font-semibold text-emerald-400">
                        {equipment.totalTestsPerformed || 1250} tests
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px]">Tolerancia de Desviación:</span>
                      <p className="font-mono font-semibold text-slate-100">
                        ±0.002 g/L (Conforme INN LE-810)
                      </p>
                    </div>
                  </div>

                  {/* Legal standard note */}
                  <div className="p-3 bg-blue-950/30 border border-blue-800/30 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      <strong>Cumplimiento Normativo RF-010 & Ley Emilia:</strong> Todo etilómetro o alcolock con calibración vencida queda automáticamente inhabilitado para despacho de conductores y bloqueado en el sistema preventivo.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: COMPLETE SERVICE & CALIBRATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Historial Metrológico y Hoja de Vida de Servicio</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Registro inalterable de cada calibración, mantenimiento preventivo y verificación técnica realizada a la unidad {equipment.serialNumber}.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('new_service')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Añadir Registro</span>
                </button>
              </div>

              {/* Service Records Timeline */}
              {(!equipment.serviceHistory || equipment.serviceHistory.length === 0) ? (
                <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6 space-y-2">
                  <Wrench className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No hay registros de servicio anteriores</p>
                  <p className="text-xs text-slate-500">Haga clic en &quot;Añadir Registro&quot; para registrar la primera calibración.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipment.serviceHistory.map((record, index) => {
                    const isCalib = record.type === 'calibracion_periodica' || record.type === 'ajuste_metrologico';
                    return (
                      <div
                        key={record.id || index}
                        className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-sm space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-sm font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                              {record.date}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                record.type === 'calibracion_periodica'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                  : record.type === 'cambio_sensor_fuel_cell'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                                  : record.type === 'actualizacion_firmware'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              }`}
                            >
                              {record.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {record.result.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                            {record.certificateNumber && (
                              <span className="bg-slate-900 text-blue-300 px-2 py-0.5 rounded border border-slate-800">
                                Cert: {record.certificateNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 text-[11px] block">Laboratorio / Entidad:</span>
                            <strong className="text-slate-200">{record.laboratory}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Técnico / Metrólogo:</span>
                            <span className="text-slate-300">{record.technicianName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Próxima Vigencia Asignada:</span>
                            <span className="font-mono font-bold text-amber-400">{record.nextCalibrationDueDate}</span>
                          </div>
                        </div>

                        {/* Observations */}
                        <div className="bg-slate-900/60 p-3 rounded-xl text-xs text-slate-300 border border-slate-800/40">
                          <p className="text-[11px] text-slate-400 mb-0.5 font-semibold">Observaciones Metrológicas:</p>
                          <p className="leading-relaxed">{record.observations}</p>
                          {record.deviationGramsPerLiter !== undefined && (
                            <p className="mt-1 text-[11px] font-mono text-emerald-400">
                              Desviación medida: <strong>{record.deviationGramsPerLiter} g/L</strong>
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setShowCertPreview(record)}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 transition cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>Ver Certificado PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGISTER NEW CALIBRATION / SERVICE */}
          {activeTab === 'new_service' && (
            <form onSubmit={handleSaveServiceRecord} className="space-y-4 bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-400" />
                  <span>Registrar Nuevo Evento de Calibración o Mantenimiento</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ingrese los datos del nuevo certificado metrológico emitido para actualizar la fecha de vigencia del equipo {equipment.serialNumber}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Servicio *</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as EquipmentServiceRecord['type'])}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="calibracion_periodica">Calibración Periódica Semestral (OIML R 126)</option>
                    <option value="mantenimiento_preventivo">Mantenimiento Preventivo y Limpieza Neumática</option>
                    <option value="cambio_sensor_fuel_cell">Reemplazo de Celda Fuel-Cell / Sensor</option>
                    <option value="ajuste_metrologico">Ajuste de Cero y Calibración con Gas Patrón</option>
                    <option value="actualizacion_firmware">Actualización de Firmware Encriptado</option>
                    <option value="verificacion_terreno">Verificación de Campo con Simulador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fecha de Ejecución *</label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Laboratorio Metrológico Certificador *</label>
                  <input
                    type="text"
                    required
                    value={serviceLab}
                    onChange={(e) => setServiceLab(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-blue-500"
                    placeholder="Ej. Metrología y Precisión Chile S.A. / Dräger Chile"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">N° Certificado Oficial de Calibración *</label>
                  <input
                    type="text"
                    required
                    value={serviceCertNumber}
                    onChange={(e) => setServiceCertNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Metrólogo / Técnico Responsable *</label>
                  <input
                    type="text"
                    required
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Resultado de la Calibración *</label>
                  <select
                    value={serviceResult}
                    onChange={(e) => setServiceResult(e.target.value as EquipmentServiceRecord['result'])}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="aprobado_conforme">Aprobado y Conforme (Apto para Servicio Evidencial)</option>
                    <option value="ajustado_conforme">Ajustado y Conforme</option>
                    <option value="rechazado_fuera_tolerancia">Rechazado (Fuera de Tolerancia / Bloqueado)</option>
                    <option value="en_proceso">En Proceso de Ensayo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nueva Fecha de Próximo Vencimiento (Semestral) *</label>
                  <input
                    type="date"
                    required
                    value={serviceNextDue}
                    onChange={(e) => setServiceNextDue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold text-amber-400 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Desviación Medida (g/L de Etanol)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={serviceDeviation}
                    onChange={(e) => setServiceDeviation(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1 text-xs">Observaciones Técnicas y Trazabilidad NIST / INN</label>
                <textarea
                  rows={3}
                  value={serviceObservations}
                  onChange={(e) => setServiceObservations(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('passport')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Guardar y Actualizar Vigencia</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: INDUSTRIAL QR STICKER & PRINT PREVIEW */}
          {activeTab === 'sticker' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Printer className="w-4 h-4 text-blue-400" />
                    <span>Etiqueta Industrial de Calibración para Dispositivo</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Formato estándar homologado para adhesivo de seguridad en garitas, maletines Dräger y vehículos con Alcolock.
                  </p>
                </div>

                <button
                  onClick={handlePrintSticker}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Etiqueta</span>
                </button>
              </div>

              {/* Physical Sticker Container Preview */}
              <div className="flex justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800">
                <div
                  id="printable-sticker"
                  className="w-[340px] bg-white text-slate-900 border-2 border-slate-900 rounded-2xl p-4 shadow-2xl flex flex-col justify-between space-y-3 relative overflow-hidden"
                >
                  {/* Watermark header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                        BV
                      </div>
                      <div>
                        <p className="text-[11px] font-black tracking-tight leading-none text-slate-900">BLINDAJE VIAL 360</p>
                        <p className="text-[8px] font-semibold text-slate-600 leading-none mt-0.5">SELLO METROLÓGICO ISO 37301</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                      RF-010
                    </span>
                  </div>

                  {/* Middle Content */}
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-white border border-slate-300 rounded-lg shrink-0">
                      <QRCodeSVG
                        value={qrPayload}
                        size={84}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="text-[10px] space-y-1 overflow-hidden">
                      <p className="font-bold text-slate-900 truncate leading-tight">{equipment.brandModel}</p>
                      <p className="font-mono text-blue-800 font-bold text-[9px] truncate">S/N: {equipment.serialNumber}</p>
                      <div className="border-t border-slate-200 pt-1 space-y-0.5">
                        <p className="text-[8px] text-slate-600">Calibrado: <strong className="text-slate-900 font-mono">{equipment.lastCalibrationDate}</strong></p>
                        <p className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 rounded inline-block">
                          Vence: <span className="font-mono">{equipment.nextCalibrationDate}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sticker Footer */}
                  <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between text-[8px] text-slate-600 font-medium">
                    <span>Base: {equipment.assignedBase.substring(0, 18)}</span>
                    <span className="font-mono">ID: {equipment.id}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400">
                <p>💡 Tip: Para fijar en equipos Dräger o en el parabrisas de tractocamiones, imprima en papel autoadhesivo vinílico resistente a hidrocarburos.</p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Embedded Certificate PDF Viewer Modal Preview */}
      {showCertPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Certificado Oficial de Calibración Metrológica
                </h3>
              </div>
              <button
                onClick={() => setShowCertPreview(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-inner space-y-4 font-sans text-xs border border-slate-200">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold tracking-tight uppercase text-slate-900">{showCertPreview.laboratory}</h4>
                  <p className="text-[10px] text-slate-600">División de Metrología Legal e Industrial • Acreditación INN LE-810</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-xs font-bold text-blue-900">{showCertPreview.certificateNumber}</p>
                  <p className="text-[10px] text-slate-500">Fecha: {showCertPreview.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Instrumento Calibrado:</span>
                  <strong className="text-slate-900">{equipment.brandModel}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Número de Serie (S/N):</span>
                  <strong className="font-mono text-slate-900">{equipment.serialNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Metrólogo Firmante:</span>
                  <span className="text-slate-800">{showCertPreview.technicianName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Próxima Recalibración:</span>
                  <strong className="font-mono text-rose-700">{showCertPreview.nextCalibrationDueDate}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-700">Dictamen Metrológico:</span>
                <p className="text-slate-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg leading-relaxed">
                  {showCertPreview.observations}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-300 text-[10px] text-slate-500">
                <span>Trazabilidad NIST / SRM 2899a • OIML R 126</span>
                <span className="font-bold text-emerald-800">ESTADO: CONFORME Y APTO</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  showToast('Descargando archivo digital del certificado...');
                  setShowCertPreview(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PDF Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
