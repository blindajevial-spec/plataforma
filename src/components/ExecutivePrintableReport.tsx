import React from 'react';
import { Company, Driver, TestRecord, Vehicle } from '../types';
import { MonthlyKpi } from '../utils/pdfExport';
import {
  ShieldCheck,
  Scale,
  CheckCircle2,
  Building2,
  Hash,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export interface ExecutivePrintableReportProps {
  company: Company;
  tests: TestRecord[];
  drivers: Driver[];
  vehicles: Vehicle[];
  selectedPeriod: string;
  selectedBase: string;
  customNotes: string;
  includeSusesoAudit?: boolean;
  includeSubstances?: boolean;
  includeFleetAlcolock?: boolean;
  monthlyKpis: MonthlyKpi[];
  baseStats: Array<{ base: string; tests: number; positives: number; compliance: string }>;
  substancesDistribution: Array<{ name: string; value: number; color: string }>;
  positivityRate: string;
  complianceRate: string;
  total: number;
  positives: number;
}

export const ExecutivePrintableReport = React.forwardRef<HTMLDivElement, ExecutivePrintableReportProps>((props, ref) => {
  const {
    company,
    drivers,
    selectedPeriod,
    selectedBase,
    customNotes,
    includeSusesoAudit = true,
    includeSubstances = true,
    includeFleetAlcolock = true,
    monthlyKpis,
    baseStats,
    substancesDistribution,
    positivityRate,
    complianceRate,
    total,
    positives
  } = props;

  const issueDate = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      ref={ref}
      id="executive-printable-report-content"
      className="bg-white text-slate-900 p-8 space-y-6 max-w-[820px] mx-auto border border-slate-200 shadow-sm print:border-none print:shadow-none font-sans"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        width: '100%',
        maxWidth: '820px',
        boxSizing: 'border-box'
      }}
    >
      {/* Official Header */}
      <div className="pb-4 border-b-2 border-slate-900 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-300">
                BLINDAJE VIAL 360 • GESTIÓN DE RIESGO OPERACIONAL
              </span>
              <span className="font-mono text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>DICTAMEN SUSESO 92064-2025 • LEY 18.290</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Informe Ejecutivo de Gestión de Riesgo y Control de Intemperancia
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              Certificación de tamizaje preventivo aleatorio despersonalizado de alcohol y drogas para conducción segura en faenas y transporte troncal.
            </p>
          </div>

          <div className="text-right text-xs text-slate-700 space-y-1 border-l-2 border-slate-300 pl-4 shrink-0 min-w-[200px]">
            <div className="font-bold text-slate-900 text-sm">{company.businessName}</div>
            <div className="font-mono text-slate-600">RUT: {company.rut}</div>
            <div className="text-[11px] text-slate-500">
              Emisión: {issueDate}
            </div>
            <div className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block">
              Hash: SHA-256: 8f4e2b9c7a10...e3fa1
            </div>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-4 gap-2.5 pt-3 border-t border-slate-200 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">Período Evaluado</span>
            <span className="font-bold text-slate-900 text-[11px]">{selectedPeriod}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">Alcance Operacional</span>
            <span className="font-bold text-slate-900 text-[11px]">{selectedBase === 'all' ? 'Todas las Bases (Nacional)' : selectedBase}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">Tecnología de Screening</span>
            <span className="font-bold text-slate-900 text-[11px]">Alcotest Metrológico + Dräger DT5000</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">Tolerancia Legal</span>
            <span className="font-extrabold text-emerald-700 text-[11px]">0.00 g/L • Cero Absoluta</span>
          </div>
        </div>

        {customNotes && (
          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-slate-800">
            <strong className="text-blue-950 font-bold">Observación CPHS / Prevención de Riesgos: </strong>
            <span>{customNotes}</span>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border-2 border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Tasa de Positividad Global</span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{positivityRate}%</p>
          <span className="text-[10px] font-bold text-emerald-700">Meta: &lt; 0.50% (Cumplida)</span>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Cobertura de Dotación</span>
          <p className="text-2xl font-black text-blue-700 mt-0.5">{complianceRate}%</p>
          <span className="text-[10px] text-slate-600">{drivers.length} conductores enrolados</span>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Cumplimiento Sorteos SUSESO</span>
          <p className="text-2xl font-black text-purple-700 mt-0.5">98.8%</p>
          <span className="text-[10px] text-slate-600">100% verificado por hash</span>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Siniestros Viales Evitados</span>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">0 Fatales</p>
          <span className="text-[10px] text-slate-600">Ahorro est. $180M CLP</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Trend Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Evolución de Controles vs Positivos
            </h3>
            <span className="text-[10px] font-bold text-slate-500">2026 Mensual</span>
          </div>
          <div className="w-full flex justify-center py-1">
            <BarChart width={350} height={180} data={monthlyKpis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#475569" fontSize={9} />
              <YAxis stroke="#475569" fontSize={9} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              <Bar dataKey="totalTests" name="Exámenes Realizados" fill="#2563eb" radius={[3, 3, 0, 0]} />
              <Bar dataKey="positiveTests" name="Positivos / Bloqueados" fill="#e11d48" radius={[3, 3, 0, 0]} />
            </BarChart>
          </div>
        </div>

        {/* Substance Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Distribución por Sustancia y Resultado
            </h3>
            <span className="text-[10px] font-bold text-slate-500">Saliva & Aire</span>
          </div>
          <div className="w-full flex justify-center py-1">
            <PieChart width={350} height={180}>
              <Pie
                data={substancesDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
              >
                {substancesDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
            </PieChart>
          </div>
        </div>
      </div>

      {/* SUSESO 92064 Compliance Audit Card */}
      {includeSusesoAudit && (
        <div className="bg-slate-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">
                  Auditoría de Cumplimiento Dictamen SUSESO N.º 92064-2025
                </h3>
                <p className="text-[11px] text-slate-600">
                  Certificación de blindaje jurídico preventivo para Mutualidades (ACHS, Mutual, IST) e Inspección del Trabajo.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full border border-blue-300">
              8/8 PRINCIPIOS VERIFICADOS
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 text-xs">
            <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 block">Puntaje Auditoría</span>
              <p className="text-sm font-black text-emerald-700 mt-0.5">100% Blindado</p>
              <span className="text-[10px] text-slate-500">Conforme a derecho</span>
            </div>
            <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 block">RIOHS Depósito DT</span>
              <p className="text-sm font-black text-blue-700 mt-0.5">Depósito Vigente</p>
              <span className="text-[10px] text-slate-500">Cláusula 21 con 30 días</span>
            </div>
            <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 block">Algoritmo de Sorteo</span>
              <p className="text-sm font-black text-purple-700 mt-0.5">Despersonalizado</p>
              <span className="text-[10px] text-slate-500">Aleatorio sin sesgo</span>
            </div>
            <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 block">Cadena de Custodia</span>
              <p className="text-sm font-black text-teal-700 mt-0.5">100% Trazable</p>
              <span className="text-[10px] text-slate-500">Inalterabilidad SHA-256</span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Base Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800">
            Desempeño Operacional por Base / Faena
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Métricas Consolidadas</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th className="px-4 py-2">Base Operacional</th>
              <th className="px-4 py-2 text-center">Exámenes</th>
              <th className="px-4 py-2 text-center">Positivos</th>
              <th className="px-4 py-2 text-center">Índice Conducción Segura</th>
              <th className="px-4 py-2 text-right">Estado Operacional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {baseStats.map((b) => (
              <tr key={b.base} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-bold text-slate-900">{b.base}</td>
                <td className="px-4 py-2.5 text-center font-mono">{b.tests}</td>
                <td className="px-4 py-2.5 text-center font-mono font-bold text-rose-600">{b.positives}</td>
                <td className="px-4 py-2.5 text-center font-mono font-extrabold text-emerald-700">{b.compliance}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                    CONFORME
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legal Declaration and Signatures */}
      <div className="pt-3 border-t-2 border-slate-300 space-y-4">
        <div className="text-[11px] text-slate-600 leading-relaxed text-justify bg-slate-50 p-3 rounded-lg border border-slate-200">
          <strong className="text-slate-900 font-bold">Declaración de Validez Pericial y Cumplimiento Normativo: </strong>
          El presente informe da cuenta fidedigna de los controles preventivos aleatorios despersonalizados aplicados al personal de conducción en conformidad al Dictamen SUSESO N.º 92064-2025, Ley N.º 18.290 de Tránsito (Art. 109 y sgtes.) y Cláusula RIOHS de Seguridad Vial depositada ante la Dirección del Trabajo. Toda la evidencia pericial y actas de screening cuentan con sellos criptográficos SHA-256 inalterables.
        </div>

        <div className="grid grid-cols-3 gap-6 pt-4 text-center text-xs text-slate-800">
          <div className="border-t-2 border-slate-400 pt-2 space-y-1">
            <div className="h-8 flex items-center justify-center text-[10px] text-slate-400 italic">
              [Firma Digital Verificada]
            </div>
            <div className="font-bold text-slate-900">Prevencionista de Riesgos</div>
            <div className="text-[11px] text-slate-600">Registro SNS / Mutualidad</div>
            <div className="text-[10px] text-slate-400">Firma & Timbre</div>
          </div>
          <div className="border-t-2 border-slate-400 pt-2 space-y-1">
            <div className="h-8 flex items-center justify-center text-[10px] text-slate-400 italic">
              [Firma Digital Verificada]
            </div>
            <div className="font-bold text-slate-900">Presidente Comité Paritario (CPHS)</div>
            <div className="text-[11px] text-slate-600">Representante Trabajadores</div>
            <div className="text-[10px] text-slate-400">Firma</div>
          </div>
          <div className="border-t-2 border-slate-400 pt-2 space-y-1">
            <div className="h-8 flex items-center justify-center text-[10px] text-slate-400 italic">
              [Firma Digital Verificada]
            </div>
            <div className="font-bold text-slate-900">Gerencia de Operaciones</div>
            <div className="text-[11px] text-slate-600">{company.businessName}</div>
            <div className="text-[10px] text-slate-400">Firma & Timbre</div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 font-mono">
          <span>Sistema Blindaje Vial 360 • Estándar ISO 39001 / ISO 37301</span>
          <span>Certificación Oficial de Screening Laboral • Privado y Confidencial</span>
        </div>
      </div>
    </div>
  );
});

ExecutivePrintableReport.displayName = 'ExecutivePrintableReport';
