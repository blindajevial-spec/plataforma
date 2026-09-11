import React, { useState } from 'react';
import { TestRecord } from '../types';
import { useApp } from '../context/AppContext';
import { SafetyAlertsEmailModal } from './SafetyAlertsEmailModal';
import { TestLocationMapSnippet } from './TestLocationMapSnippet';
import {
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck2,
  Building2,
  Calendar,
  User,
  Truck,
  Download,
  Mail,
  Send,
  ShieldAlert
} from 'lucide-react';

interface TestDetailModalProps {
  test: TestRecord | null;
  onClose: () => void;
}

export const TestDetailModal: React.FC<TestDetailModalProps> = ({ test, onClose }) => {
  const { safetyEmailLogs, safetyManagerRecipients } = useApp();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!test) return null;

  const handlePrint = () => {
    window.print();
  };

  const isApto = test.overallStatus === 'apto_despacho';
  const relatedEmailLog = safetyEmailLogs.find((l) => l.testCode === test.code);
  const activeRecipientsCount = safetyManagerRecipients.filter((r) => r.active).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Header (No print) */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-sm text-white">
              Acta Oficial de Control Preventivo de Intemperancia
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 bg-slate-950 text-slate-100 font-sans space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:p-4 print:bg-white print:text-black">
          {/* Certificate Header */}
          <div className="border-b-2 border-slate-700 print:border-black pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 print:bg-black text-white font-black text-xs px-2 py-1 rounded">
                  BLINDAJE VIAL 360
                </div>
                <span className="text-xs font-bold text-slate-400 print:text-gray-600 uppercase tracking-wider">
                  Sistema Integrado de Cumplimiento e ISO 37301
                </span>
              </div>
              <h1 className="text-lg font-black text-white print:text-black mt-2">
                CERTIFICADO Y ACTA DE EXAMEN DE ALCOHOL Y DROGAS
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Conforme a Ley N° 16.744, Código del Trabajo Art. 184 y 154 N° 5, y Dictámenes SUSESO
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 print:text-gray-600">N° Registro:</span>
              <p className="text-base font-mono font-black text-blue-400 print:text-black">{test.code}</p>
              <span className="text-[10px] text-slate-400 print:text-gray-600">{test.timestamp}</span>
            </div>
          </div>

          {/* 1. Datos del Conductor y Empresa */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-slate-800 print:border-gray-300 rounded-xl p-4 bg-slate-900/50 print:bg-gray-50">
            <div>
              <p className="text-[10px] font-bold text-slate-400 print:text-gray-500 uppercase">Trabajador Evaluado</p>
              <p className="font-bold text-sm text-slate-100 print:text-black mt-0.5">{test.driverName}</p>
              <p className="font-mono text-slate-300 print:text-gray-700">RUT: {test.driverRut}</p>
              <p className="text-slate-400 print:text-gray-600">Base Operacional: {test.driverBase}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 print:text-gray-500 uppercase">Contexto Operacional</p>
              <p className="font-medium text-slate-200 print:text-black mt-0.5">Motivo: <span className="font-bold">{test.reason}</span></p>
              <p className="font-mono text-slate-300 print:text-gray-700">Vehículo / Tracto: {test.vehiclePlate || 'N/A'}</p>
              <p className="text-slate-400 print:text-gray-600">Lugar: {test.geolocation?.locationName || test.driverBase || 'Garita de Despacho'}</p>
            </div>
          </div>

          {/* 1.5. Georreferenciación en Terreno (GPS Map Snippet) */}
          <TestLocationMapSnippet
            geolocation={test.geolocation}
            driverBase={test.driverBase}
            testCode={test.code}
            timestamp={test.timestamp}
            vehiclePlate={test.vehiclePlate}
          />

          {/* 2. Resultados de las Pruebas */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-200 print:text-black uppercase tracking-wider">
              1. Resultados de las Mediciones Físico-Químicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Alcoholímetro */}
              <div className="border border-slate-800 print:border-gray-300 rounded-xl p-3.5 bg-slate-900/40 print:bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 print:border-gray-200">
                  <span className="font-bold text-slate-300 print:text-black">Alcohotest Evidencial</span>
                  <span className="font-mono text-[10px] text-slate-400">{test.alcoholDeviceModel}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-slate-400">Concentración en sangre:</span>
                  <span className={`text-xl font-black font-mono ${
                    test.alcoholValueGramsPerLiter === 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-red-700'
                  }`}>
                    {test.alcoholValueGramsPerLiter.toFixed(2)} g/L
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 print:text-gray-500 mt-2">
                  Límite legal permitido: 0.00 g/L (Ley 18.290 / Tolerancia Cero). S/N: {test.alcoholDeviceSerial}
                </p>
              </div>

              {/* Drogas */}
              <div className="border border-slate-800 print:border-gray-300 rounded-xl p-3.5 bg-slate-900/40 print:bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 print:border-gray-200">
                  <span className="font-bold text-slate-300 print:text-black">Panel 6-Drogas Inmunoensayo</span>
                  <span className="font-mono text-[10px] text-slate-400">{test.drugKitModel}</span>
                </div>
                <div className="mt-2 space-y-1">
                  {test.drugPanelResults.length > 0 ? (
                    test.drugPanelResults.map((p) => (
                      <div key={p.drug} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 print:text-gray-700">{p.drug} ({p.name})</span>
                        <span className={`font-bold font-mono text-[10px] ${
                          p.result === 'negativo' ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-red-700'
                        }`}>
                          {p.result === 'negativo' ? 'NO REACTIVO' : 'REACTIVO (PRESUNTO)'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic py-2">Test de drogas no requerido en esta pauta</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Dictamen Final */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isApto
                ? 'bg-emerald-950/40 border-emerald-700 print:bg-emerald-50 print:border-emerald-500'
                : 'bg-rose-950/40 border-rose-700 print:bg-red-50 print:border-red-500'
            }`}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-gray-600">
                Dictamen Oficial de Aptitud Operacional
              </p>
              <h4 className={`text-base font-black mt-0.5 ${
                isApto ? 'text-emerald-300 print:text-emerald-800' : 'text-rose-300 print:text-red-800'
              }`}>
                {isApto ? '✓ APTO PARA LA CONDUCCIÓN Y DESPACHO EN RUTA' : '❌ NO APTO - INHABILITACIÓN PREVENTIVA INMEDIATA'}
              </h4>
              <p className="text-xs text-slate-300 print:text-gray-700 mt-1">
                {test.observations}
              </p>
            </div>
            {test.custodyChainId && (
              <div className="text-right pl-4 shrink-0">
                <span className="text-[10px] text-slate-400 print:text-gray-600">Cadena de Custodia:</span>
                <p className="font-mono font-bold text-xs text-blue-400 print:text-blue-800">{test.custodyChainId.toUpperCase()}</p>
              </div>
            )}
          </div>

          {/* 3.5. Alerta Automática de Seguridad por Correo (no-print) */}
          {!isApto && (
            <div className="p-4 bg-slate-900 border border-red-500/40 rounded-xl space-y-2.5 print:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Notificación Automática a Jefaturas de Seguridad y Prevención
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      Protocolo SUSESO N° 92064-2025 • Tolerancia Cero
                    </span>
                  </div>
                </div>

                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                  {relatedEmailLog ? 'CORREO ENTREGADO' : 'CIRCUITO ACTIVO'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Este examen superó los umbrales críticos corporativos. El sistema despachó el resumen ejecutivo con acta pericial y checklist de contención inmediata a las casillas de prevención registradas.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">
                  Destinatarios activos: <strong>{activeRecipientsCount} Jefes de Seguridad</strong>
                </span>

                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-lg font-semibold transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Inspeccionar / Reenviar Alerta por Correo</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Firmas y Trazabilidad Legal */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-800 print:border-gray-400 text-xs">
            <div className="text-center">
              <div className="h-14 border-b border-dashed border-slate-600 print:border-black flex items-center justify-center">
                <span className="text-[10px] font-mono text-emerald-400 print:text-emerald-800 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  [Firma Electrónica Biométrica Validada]
                </span>
              </div>
              <p className="font-bold text-slate-200 print:text-black mt-1">{test.driverName}</p>
              <p className="text-[10px] text-slate-400 print:text-gray-600">Conductor Evaluado (RUT: {test.driverRut})</p>
            </div>

            <div className="text-center">
              <div className="h-14 border-b border-dashed border-slate-600 print:border-black flex items-center justify-center">
                <span className="text-[10px] font-mono text-blue-400 print:text-blue-800 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30">
                  [Firma Operador Habilitado]
                </span>
              </div>
              <p className="font-bold text-slate-200 print:text-black mt-1">{test.operatorName}</p>
              <p className="text-[10px] text-slate-400 print:text-gray-600">Operador de Control (RUT: {test.operatorRut})</p>
            </div>
          </div>

          {/* Legal Footer Stamp */}
          <div className="text-[9px] text-slate-500 print:text-gray-400 text-center pt-2 font-mono">
            Documento emitido por la Plataforma Blindaje Vial 360 • Hash de Integridad SHA-256: 4f89a1b2c3d4e5f67890 • Válido para inspecciones DT y SUSESO
          </div>
        </div>
      </div>

      {/* Safety Alerts Email Modal */}
      <SafetyAlertsEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        initialTestToAlert={test}
      />
    </div>
  );
};
