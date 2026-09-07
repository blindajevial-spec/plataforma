import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustodyChain } from '../types';
import {
  Microscope,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck2,
  Thermometer,
  QrCode,
  Lock,
  ArrowRight,
  Upload,
  Search,
  ExternalLink,
  FileText
} from 'lucide-react';

export const LaboratoryPortalView: React.FC = () => {
  const { custodyChains, confirmLabResult, tests, currentUser } = useApp();

  const [selectedCustody, setSelectedCustody] = useState<CustodyChain | null>(
    custodyChains[0] || null
  );
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lab confirmation action modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmedResult, setConfirmedResult] = useState<CustodyChain['confirmedResult']>('positivo_thc');
  const [labNotes, setLabNotes] = useState('');

  const filteredChains = custodyChains.filter((c) => {
    return (
      c.sampleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.securitySealNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExecuteConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustody) return;

    confirmLabResult(selectedCustody.id, confirmedResult, labNotes);
    setIsConfirmModalOpen(false);
  };

  const associatedTest = tests.find((t) => t.id === selectedCustody?.testId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
            RF-008 & RF-009 • CADENA DE CUSTODIA & CONFIRMACIÓN GC-MS
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            Acreditación ISP / NCh-ISO 17025
          </span>
        </div>
        <h1 className="text-xl font-bold text-white mt-1">
          Portal de Laboratorio Clínico y Cadena de Custodia
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Trazabilidad inviolable de muestras biológicas: recepción con validación de precinto térmico, contraprueba por Espectrometría de Masas (GC-MS) y emisión de informe legal con firma electrónica avanzada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Samples List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Microscope className="w-4 h-4 text-amber-400" />
              Muestras en Custodia ({custodyChains.length})
            </h2>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar código de tubo o precinto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredChains.map((c) => {
              const isSelected = selectedCustody?.id === c.id;
              const isConfirmed = c.status === 'confirmado_lab';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustody(c)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-amber-400">{c.sampleCode}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-[11px] space-y-0.5 text-slate-300">
                    <p>Muestra: <span className="font-semibold text-slate-100">{c.sampleType}</span></p>
                    <p className="text-[10px] text-slate-400 font-mono">Precinto: {c.securitySealNumber}</p>
                    <p className="text-[10px] text-slate-400">{c.collectedAt}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Sample Dossier & Lab Execution */}
        <div className="lg:col-span-2 space-y-5">
          {selectedCustody ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Top Dossier Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-amber-400">
                      {selectedCustody.sampleCode}
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {selectedCustody.id.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Laboratorio Destino: <span className="text-slate-200 font-semibold">{selectedCustody.labName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-amber-600/20 transition cursor-pointer"
                  >
                    <Microscope className="w-4 h-4" />
                    <span>Emitir Dictamen Laboratorio</span>
                  </button>
                </div>
              </div>

              {/* 1. Cadena de Custodia en Terreno */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  1. Registro de Toma de Muestra en Terreno
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/50 p-3 rounded-xl space-y-1.5 border border-slate-750">
                    <p className="text-[11px] text-slate-400">Recolectada por Operador:</p>
                    <p className="font-bold text-slate-100">{selectedCustody.collectedBy}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Fecha: {selectedCustody.collectedAt}</p>
                  </div>

                  <div className="bg-slate-800/50 p-3 rounded-xl space-y-1.5 border border-slate-750">
                    <p className="text-[11px] text-slate-400">Precinto y Temperatura:</p>
                    <p className="font-mono font-bold text-amber-300">{selectedCustody.securitySealNumber}</p>
                    <p className="text-slate-300 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                      Temp. Inicial: {selectedCustody.sampleTemperatureCelsius}°C (Rango válido 32°C - 38°C)
                    </p>
                  </div>
                </div>

                {associatedTest && (
                  <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-750 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Conductor Donante:</span>
                      <p className="font-bold text-slate-100">{associatedTest.driverName} (RUT: {associatedTest.driverRut})</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      ✓ Firma de Consentimiento Verificada
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Estado de Análisis Cuantitativo de Laboratorio */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-blue-400" />
                  2. Resultado Toxicológico de Confirmación (GC-MS)
                </h3>

                <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Método de Análisis:</span>
                    <span className="font-bold font-mono text-slate-200">
                      {selectedCustody.analysisMethod || 'Cromatografía de Gases acoplada a Espectrometría de Masas (GC-MS)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Resultado Oficial Emitido:</span>
                    <span className={`font-mono font-extrabold px-2.5 py-1 rounded text-xs uppercase ${
                      selectedCustody.confirmedResult === 'negativo'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : selectedCustody.confirmedResult
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {selectedCustody.confirmedResult ? selectedCustody.confirmedResult.toUpperCase() : 'PENDIENTE DE CONFIRMACIÓN'}
                    </span>
                  </div>

                  {selectedCustody.labReportUrl && (
                    <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Informe PDF Firmado Digitalmente:</span>
                      <a
                        href="#download"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Descargando Informe Toxicológico Oficial de Laboratorio (PDF con firma digital avanzada).');
                        }}
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Descargar Informe Oficial</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              Seleccione una muestra para inspeccionar su cadena de custodia.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Emitir Dictamen Laboratorio */}
      {isConfirmModalOpen && selectedCustody && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-base text-white">
                  Emisión de Informe Toxicológico de Laboratorio
                </h2>
              </div>
            </div>

            <form onSubmit={handleExecuteConfirmation} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-750">
                <p className="text-slate-400">Muestra: <span className="font-mono font-bold text-white">{selectedCustody.sampleCode}</span></p>
                <p className="text-slate-400">Precinto: <span className="font-mono text-slate-200">{selectedCustody.securitySealNumber}</span></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Dictamen Final de Confirmación (GC-MS) *
                </label>
                <select
                  value={confirmedResult}
                  onChange={(e) => setConfirmedResult(e.target.value as CustodyChain['confirmedResult'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold"
                >
                  <option value="negativo">NEGATIVO (Contraprueba Absolutoria - No se detectan metabolitos)</option>
                  <option value="positivo_thc">CONFIRMADO POSITIVO: THC (Tetrahidrocannabinol {'>'} 15 ng/mL)</option>
                  <option value="positivo_coc">CONFIRMADO POSITIVO: Cocaína / Benzoilecgonina ({'>'} 20 ng/mL)</option>
                  <option value="positivo_multiple">CONFIRMADO POSITIVO: Policonsumo de Sustancias</option>
                  <option value="muestra_adulterada">MUESTRA RECHAZADA: Muestra Adulterada o Fuera de Parámetros Físicos</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Observaciones Técnicas y Firma del Bioquímico / Toxicólogo Responsable
                </label>
                <textarea
                  rows={3}
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  placeholder="Se confirma presencia de metabolito carboxi-THC mediante GC-MS calibrado. Informe emitido para fines laborales legales..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Firmar y Emitir Informe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
