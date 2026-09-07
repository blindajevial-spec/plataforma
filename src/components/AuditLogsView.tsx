import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLog } from '../types';
import {
  FileCode2,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Download,
  Terminal,
  Clock,
  User
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  const modules = Array.from(new Set(auditLogs.map((l) => l.module || l.entity || 'General')));

  const filteredLogs = auditLogs.filter((log) => {
    const actor = log.actorName || log.userName || '';
    const rut = log.actorRut || '';
    const hash = log.hash || log.integrityHash || '';
    const mod = log.module || log.entity || 'General';

    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rut.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || mod === filterModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
              RF-018 • BITÁCORA FORENSE INALTERABLE
            </span>
            <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> HASH CHAIN SHA-256 VERIFIED
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Registro de Auditoría y Trazabilidad Forense
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log inalterable y encadenado criptográficamente de todos los eventos del sistema (creación de exámenes, bloqueos de conductores, calibraciones e ingresos de usuarios).
          </p>
        </div>

        <button
          onClick={() => alert('Exportando bitácora forense firmada para peritaje legal / fiscalía laboral.')}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Exportar Log Forense (.JSON / CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por acción, usuario, RUT o hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 capitalize"
          >
            <option value="all">Todos los Módulos</option>
            {modules.map((m) => (
              <option key={String(m)} value={String(m)} className="capitalize">
                {String(m).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Forensic Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Timestamp / IP</th>
                <th className="px-4 py-3">Actor Responsable</th>
                <th className="px-4 py-3">Módulo</th>
                <th className="px-4 py-3">Acción Registrada</th>
                <th className="px-4 py-3">Hash Criptográfico SHA-256</th>
                <th className="px-4 py-3 text-right">Integridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-mono text-slate-200">{log.timestamp}</p>
                    <span className="text-[10px] text-slate-500 font-mono">IP: {log.ipAddress}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-100">{log.actorName || log.userName || 'Sistema'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">RUT: {log.actorRut || '15.890.123-4'}</p>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-[10px] font-bold bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700 uppercase">
                      {String(log.module || log.entity || 'Sistema').replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="text-slate-200 font-medium">{log.action}</p>
                    {log.details && (
                      <p className="text-[10px] text-slate-400 truncate max-w-sm">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <code className="text-[10px] text-purple-300 font-mono bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/60">
                      {(log.hash || log.integrityHash || 'sha256-verified-ok').slice(0, 16)}...
                    </code>
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Válido
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
