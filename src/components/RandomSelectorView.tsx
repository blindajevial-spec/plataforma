import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RandomSelectionBatch } from '../types';
import {
  Dices,
  Play,
  History,
  ShieldCheck,
  CheckCircle2,
  Users,
  QrCode,
  Printer,
  Sparkles,
  FileCheck2,
  Calendar,
  Lock
} from 'lucide-react';

export const RandomSelectorView: React.FC = () => {
  const {
    drivers,
    randomBatches,
    runRandomSelection,
    currentCompany,
    currentUser,
    addTestRecord
  } = useApp();

  const [selectedBase, setSelectedBase] = useState<string>('all');
  const [samplePercentage, setSamplePercentage] = useState<number>(15);
  const [lastGeneratedBatch, setLastGeneratedBatch] = useState<RandomSelectionBatch | null>(
    randomBatches[0] || null
  );
  const [selectedBatchForInspection, setSelectedBatchForInspection] = useState<RandomSelectionBatch | null>(
    randomBatches[0] || null
  );

  // Available unique bases
  const bases = Array.from(new Set(drivers.map((d) => d.assignedBase)));

  const eligibleDriversCount = drivers.filter(
    (d) => (selectedBase === 'all' || d.assignedBase === selectedBase) && d.status === 'habilitado'
  ).length;

  const estimatedSelectionCount = Math.max(1, Math.ceil((eligibleDriversCount * samplePercentage) / 100));

  const handleExecuteSorteo = () => {
    const batch = runRandomSelection(selectedBase, samplePercentage);
    setLastGeneratedBatch(batch);
    setSelectedBatchForInspection(batch);
  };

  const currentBatch = selectedBatchForInspection || lastGeneratedBatch || randomBatches[0];
  const selectedDriversInBatch = drivers.filter((d) => currentBatch?.selectedDriverIds.includes(d.id));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">
            RF-005 • MOTOR ALEATORIO DESPERSONALIZADO
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            Código del Trabajo Art. 154 N° 5 & SUSESO Circ. 3.335
          </span>
        </div>
        <h1 className="text-xl font-bold text-white mt-1">
          Motor Automático de Selección Aleatoria Inopinada
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Algoritmo criptográfico pseudo-aleatorio transparente con hash inalterable para garantizar imparcialidad ante sindicatos y la Dirección del Trabajo (DT).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sorteo Parameters Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Dices className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-sm text-white">Configurar Parámetros de Sorteo</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Base Selector */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Base Operacional / Faena Minera
              </label>
              <select
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="all">Todas las Bases Operacionales</option>
                {bases.map((base) => (
                  <option key={base} value={base}>
                    {base}
                  </option>
                ))}
              </select>
            </div>

            {/* Percentage Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300">
                  Porcentaje de Muestra de Dotación
                </label>
                <span className="font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800 text-xs">
                  {samplePercentage}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={samplePercentage}
                onChange={(e) => setSamplePercentage(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>5% (Mínimo)</span>
                <span>15% (Recomendado SUSESO)</span>
                <span>50%</span>
              </div>
            </div>

            {/* Computation Simulation Box */}
            <div className="bg-slate-800/60 border border-slate-750 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Conductores elegibles activos:</span>
                <span className="font-bold text-white font-mono">{eligibleDriversCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Conductores a citar en este sorteo:</span>
                <span className="font-bold text-purple-400 font-mono text-sm">{estimatedSelectionCount}</span>
              </div>
              <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                ✓ Exclusión automática de conductores con licencia médica o bloqueo activo.
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteSorteo}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer text-xs uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Ejecutar Selección Aleatoria</span>
            </button>
          </div>

          {/* Legal Compliance Guarantee */}
          <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-[11px] text-purple-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p>
              Cumple el principio de no discriminación arbitraria del Art. 2 del Código del Trabajo chileno.
            </p>
          </div>
        </div>

        {/* Right Column: Selected Batch Details & Citation List */}
        <div className="lg:col-span-2 space-y-5">
          {currentBatch ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              {/* Batch Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-purple-400">
                      {currentBatch.batchNumber}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {currentBatch.base}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded uppercase">
                      {currentBatch.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Generado el {currentBatch.createdAt} por {currentBatch.executedBy}
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Nómina de Citación</span>
                </button>
              </div>

              {/* Seed Hash Security Badge */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-slate-400 font-mono text-[11px] shrink-0">Semilla Criptográfica SHA-256:</span>
                  <code className="text-purple-300 font-mono text-[10px] truncate">
                    {currentBatch.seedHash}
                  </code>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold shrink-0 ml-2">✓ Verificable</span>
              </div>

              {/* Selected Drivers Citation Table */}
              <div>
                <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2">
                  Conductores Citados a Control Inopinado ({selectedDriversInBatch.length})
                </h3>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                  {selectedDriversInBatch.map((driver, idx) => {
                    const isTested = currentBatch.completedDriverIds.includes(driver.id);
                    return (
                      <div
                        key={driver.id}
                        className="p-3.5 bg-slate-850 hover:bg-slate-800 flex items-center justify-between gap-3 text-xs transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-300 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                            {idx + 1}
                          </span>
                          <img
                            src={driver.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={driver.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-100">{driver.fullName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              RUT: {driver.rut} • Licencia: {driver.licenseClass.join('/')} • Base: {driver.assignedBase}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isTested ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Examen Realizado
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-1 rounded">
                              Pendiente de Test
                            </span>
                          )}
                          <QrCode className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              Seleccione o ejecute un sorteo para ver la nómina citada.
            </div>
          )}

          {/* Historical Batches List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              Historial de Sorteos Registrados ({randomBatches.length})
            </h3>

            <div className="space-y-2">
              {randomBatches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBatchForInspection(b)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                    currentBatch?.id === b.id
                      ? 'bg-purple-950/40 border-purple-600 text-purple-200'
                      : 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold">{b.batchNumber}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({b.base})</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{b.createdAt} • {b.samplePercentage}% muestra</p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold">{b.totalSelected} citados</span>
                    <span className="text-[10px] text-purple-400 block font-mono">
                      {b.seedHash.slice(0, 14)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
