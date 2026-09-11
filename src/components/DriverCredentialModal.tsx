import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Driver, TestRecord } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  QrCode,
  ShieldCheck,
  Award,
  AlertTriangle,
  Calendar,
  Truck,
  Building2,
  Printer,
  Download,
  RotateCw,
  ScanLine,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';

interface DriverCredentialModalProps {
  driver: Driver;
  isOpen: boolean;
  onClose: () => void;
  onScanThisDriver?: (driver: Driver) => void;
}

export const DriverCredentialModal: React.FC<DriverCredentialModalProps> = ({
  driver,
  isOpen,
  onClose,
  onScanThisDriver
}) => {
  const { currentCompany, tests, showToast } = useApp();
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');

  if (!isOpen) return null;

  // Find recent test for this driver
  const recentTest = tests
    .filter((t) => t.driverId === driver.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  // Folio calculation
  const cleanRut = driver.rut.replace(/[^0-9kK]/g, '');
  const credentialFolio = `CRED-${cleanRut}-2026`;

  // Payload for QR Code
  const qrPayload = JSON.stringify({
    system: 'BlindajeVial360',
    type: 'DRIVER_CREDENTIAL_ID',
    driverId: driver.id,
    rut: driver.rut,
    fullName: driver.fullName,
    companyId: currentCompany.id,
    companyName: currentCompany.fantasyName,
    companyRut: currentCompany.rut,
    assignedBase: driver.assignedBase,
    licenseClass: driver.licenseClass,
    licenseExpiry: driver.licenseExpiry,
    status: driver.status,
    lastTestDate: recentTest?.timestamp || driver.lastTestDate || 'Sin test reciente',
    lastTestResult: recentTest ? (recentTest.alcoholValueGramsPerLiter === 0 && recentTest.drugsOverallStatus === 'negativo' ? 'negativo' : 'positivo_o_pendiente') : (driver.lastTestResult || 'pendiente'),
    credentialFolio,
    verifyUrl: `https://blindajevial.cl/verify?driver=${driver.id}&rut=${driver.rut}`
  });

  const isBlocked = driver.status === 'bloqueado_preventivo';

  const handlePrint = () => {
    window.print();
    showToast('Preparando impresión de credencial digital...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Credencial Digital de Seguridad Vial</span>
                <span className="text-[10px] font-mono bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
                  {credentialFolio}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pase de Garita con Código QR Dinámico • Ley 16.744 / SUSESO
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCardSide('front')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                cardSide === 'front'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Anverso (Foto & QR)
            </button>
            <button
              onClick={() => setCardSide('back')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                cardSide === 'back'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Reverso (Normativa & Firmas)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onScanThisDriver && (
              <button
                onClick={() => onScanThisDriver(driver)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow cursor-pointer text-[11px]"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Simular Escaneo en Garita</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
              title="Imprimir Credencial"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Body Display */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center">
          
          {/* Physical Badge Container */}
          <div className="w-full max-w-[440px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl p-5 relative overflow-hidden">
            
            {/* Top Lanyard punch hole & security header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-black tracking-wider text-white uppercase block leading-tight">
                    BLINDAJE VIAL 360
                  </span>
                  <span className="text-[9px] text-blue-400 font-semibold block">
                    PASE OFICIAL DE CONTROL EN GARITA
                  </span>
                </div>
              </div>

              {/* Lanyard slot badge */}
              <div className="w-10 h-2 bg-slate-800 rounded-full border border-slate-700" />
            </div>

            {cardSide === 'front' ? (
              <div className="space-y-4">
                {/* Photo & QR Row */}
                <div className="flex items-center justify-between gap-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  {/* Photo */}
                  <div className="relative">
                    <img
                      src={driver.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160'}
                      alt={driver.fullName}
                      className="w-24 h-28 object-cover rounded-xl border-2 border-slate-700 shadow-md"
                    />
                    <span
                      className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                        isBlocked ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      title={isBlocked ? 'Bloqueado' : 'Habilitado'}
                    />
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl shadow-lg shrink-0">
                    <QRCodeSVG
                      value={qrPayload}
                      size={104}
                      level="H"
                      includeMargin={false}
                    />
                    <span className="text-[9px] font-mono text-slate-800 font-bold mt-1 tracking-wider">
                      ESCANEAR QR
                    </span>
                  </div>
                </div>

                {/* Driver Info Block */}
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Conductor Autorizado
                    </span>
                    <h3 className="text-base font-extrabold text-white leading-tight">
                      {driver.fullName}
                    </h3>
                    <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                      RUT: {driver.rut}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Empresa / Razón Social:</span>
                      <span className="font-bold text-slate-200 truncate block">
                        {currentCompany.fantasyName}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Base Operacional:</span>
                      <span className="font-bold text-slate-200 truncate block">
                        {driver.assignedBase}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Licencias Vigentes:</span>
                      <div className="flex gap-1 mt-0.5">
                        {driver.licenseClass.map((lic) => (
                          <span
                            key={lic}
                            className="bg-blue-600 text-white font-mono text-[9px] px-1.5 py-0.2 rounded font-bold"
                          >
                            {lic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Psicotécnico Riguroso:</span>
                      <span className="font-mono text-slate-200 font-bold">
                        Vence: {driver.psychotechnicalExpiry}
                      </span>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                      isBlocked
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isBlocked ? (
                        <Lock className="w-4 h-4 text-rose-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>
                        {isBlocked
                          ? 'BLOQUEO PREVENTIVO ACTIVO'
                          : 'HABILITADO PARA DESPACHO'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono opacity-80">
                      {recentTest ? `Test: ${recentTest.timestamp.slice(0, 10)}` : 'Sin test hoy'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Back Side of Badge */
              <div className="space-y-3.5 text-xs text-slate-300 py-1">
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Marco Regulatorio y Cumplimiento</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Credencial sujeta a los estándares de la Ley 16.744 sobre Accidentes del Trabajo, Ley 18.290 de Tránsito, Ley 20.580 (Tolerancia Cero Alcohol) y Circular SUSESO 3331.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Disposiciones Operativas en Garita:
                  </span>
                  <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside">
                    <li>Exhibir obligatoriamente en control de acceso a base y pre-despacho.</li>
                    <li>Someterse a control de alcohotest y panel de drogas aleatorio o pre-turno.</li>
                    <li>La negativa injustificada genera bloqueo preventivo inmediato (Art. 184 C. del Trabajo).</li>
                  </ul>
                </div>

                {/* Signatures Row */}
                <div className="pt-3 border-t border-slate-800 flex justify-between gap-4 text-center">
                  <div className="flex-1">
                    <div className="h-9 border-b border-dashed border-slate-700 flex items-center justify-center">
                      <span className="text-[9px] font-mono text-slate-500 italic">Firma Registrada</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1">Firma Conductor</span>
                  </div>

                  <div className="flex-1">
                    <div className="h-9 border-b border-dashed border-slate-700 flex items-center justify-center">
                      <span className="text-[9px] font-mono text-blue-400 font-bold">FEA Ley 19.799</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1">Prevención de Riesgos</span>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <p className="text-[9px] text-slate-500 font-mono">
                    Folio Único: {credentialFolio} • Sistema Blindaje Vial 360
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Security Hologram Ribbon */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-slate-300">SEGURIDAD VIAL CHILE</span>
              </div>
              <span className="font-mono text-[9px] text-slate-500">
                DICTAMEN SUSESO 92064-2025
              </span>
            </div>

          </div>

          <p className="text-xs text-slate-400 mt-4 text-center max-w-sm">
            💡 Puede apuntar la cámara de su dispositivo móvil o el escáner de garita directamente a este código QR para verificar al instante el estado toxicológico.
          </p>

        </div>

      </div>
    </div>
  );
};
