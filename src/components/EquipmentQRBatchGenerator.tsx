import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Equipment } from '../types';
import { useApp } from '../context/AppContext';
import {
  Printer,
  Download,
  CheckSquare,
  Square,
  Filter,
  X,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

interface EquipmentQRBatchGeneratorProps {
  onClose: () => void;
  onSelectEquipmentForView: (equipment: Equipment) => void;
}

export const EquipmentQRBatchGenerator: React.FC<EquipmentQRBatchGeneratorProps> = ({
  onClose,
  onSelectEquipmentForView
}) => {
  const { equipment, showToast } = useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>(equipment.map((e) => e.id));
  const [selectedBase, setSelectedBase] = useState<string>('all');
  const [tagFormat, setTagFormat] = useState<'standard' | 'compact' | 'parabrisas'>('standard');

  const bases = Array.from(new Set(equipment.map((e) => e.assignedBase)));

  const filteredEquipment = equipment.filter((eq) => {
    if (selectedBase !== 'all' && eq.assignedBase !== selectedBase) return false;
    return true;
  });

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredEquipment.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEquipment.map((e) => e.id));
    }
  };

  const handleToggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedEquipmentList = equipment.filter((eq) => selectedIds.includes(eq.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full uppercase">
                  CENTRO DE ROTULACIÓN Y ETIQUETAS QR
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {selectedEquipmentList.length} seleccionados
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Generador e Impresión Masiva de Etiquetas Metrológicas
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={selectedEquipmentList.length === 0}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Etiquetas ({selectedEquipmentList.length})</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-slate-950/60 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 font-semibold transition cursor-pointer"
            >
              {selectedIds.length === filteredEquipment.length ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{selectedIds.length === filteredEquipment.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Filtrar por Base:</span>
              <select
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs"
              >
                <option value="all">Todas las Bases / Faenas</option>
                {bases.map((base) => (
                  <option key={base} value={base}>{base}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Formato de Etiqueta:</span>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setTagFormat('standard')}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                  tagFormat === 'standard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Estándar 60x40mm
              </button>
              <button
                onClick={() => setTagFormat('compact')}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                  tagFormat === 'compact' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Compacto 40x40mm
              </button>
              <button
                onClick={() => setTagFormat('parabrisas')}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                  tagFormat === 'parabrisas' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sello Alcolock
              </button>
            </div>
          </div>
        </div>

        {/* Printable Grid Preview */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Vista previa de impresión en hoja de corte (haga clic en una etiqueta para abrir su pasaporte):</span>
            <span className="text-blue-400 font-mono">Compatible con papel autoadhesivo Avery / Brother / Zebra</span>
          </div>

          {selectedEquipmentList.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/40 rounded-2xl border border-slate-800 p-6 space-y-2">
              <QrCode className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No hay equipos seleccionados para imprimir</p>
              <p className="text-xs text-slate-500">Seleccione al menos un dispositivo en la barra superior.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedEquipmentList.map((eq) => {
                const qrPayload = `https://blindajevial.cl/metrologia/equipos?id=${eq.id}&sn=${encodeURIComponent(eq.serialNumber)}`;
                return (
                  <div
                    key={eq.id}
                    className="relative group bg-white text-slate-950 border-2 border-slate-900 rounded-2xl p-4 shadow-md flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xl hover:border-blue-600 transition"
                    onClick={() => onSelectEquipmentForView(eq)}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center font-black text-[10px]">
                          BV
                        </div>
                        <span className="text-[10px] font-extrabold tracking-tight">BLINDAJE VIAL 360</span>
                      </div>
                      <span className="text-[8px] font-bold bg-slate-100 text-slate-700 px-1 rounded border border-slate-300">
                        {eq.code || 'RF-010'}
                      </span>
                    </div>

                    {/* QR Code & Information */}
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-white border border-slate-300 rounded-lg shrink-0">
                        <QRCodeSVG
                          value={qrPayload}
                          size={70}
                          level="M"
                          includeMargin={false}
                        />
                      </div>

                      <div className="text-[9px] space-y-0.5 overflow-hidden">
                        <p className="font-bold text-slate-900 leading-tight truncate">{eq.brandModel}</p>
                        <p className="font-mono text-blue-800 font-bold">S/N: {eq.serialNumber}</p>
                        <p className="text-slate-600 truncate">{eq.assignedBase}</p>
                        <p className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded inline-block">
                          Próx. Calib: <strong className="font-mono">{eq.nextCalibrationDate}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[8px] text-slate-500">
                      <span>Metrología Legal INN LE-810</span>
                      <span className="font-semibold text-blue-700 group-hover:underline">Ver Ficha →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
