import React, { useState, useMemo } from 'react';
import { SPECIFICATIONS_DATA, SpecificationItem } from '../data/specificationsData';
import { BrandLogo } from './BrandLogo';
import {
  FileCode,
  Search,
  Filter,
  CheckCircle2,
  Download,
  ShieldCheck,
  Cpu,
  Scale,
  Activity,
  GraduationCap,
  Lock,
  Headphones,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  Palette
} from 'lucide-react';

export const SpecificationsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<SpecificationItem | null>(SPECIFICATIONS_DATA[0]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'styleguide' | 'summary'>('matrix');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(SPECIFICATIONS_DATA.map((item) => item.category));
    return ['all', ...Array.from(set)];
  }, []);

  // Filtered items
  const filteredData = useMemo(() => {
    return SPECIFICATIONS_DATA.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.normativeOrTech.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kpis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSrc = selectedSource === 'all' || item.source === selectedSource;

      return matchesSearch && matchesCat && matchesSrc;
    });
  }, [searchTerm, selectedCategory, selectedSource]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Categoría',
      'Componente',
      'Tipo de Documento o Servicio',
      'Descripción Detallada',
      'Indicadores de Desempeño (KPIs)',
      'Normativa o Tecnología Aplicada',
      'Frecuencia o Duración',
      'Fuente',
      'Estado'
    ];

    const rows = filteredData.map((d) => [
      d.id,
      `"${d.category}"`,
      `"${d.component}"`,
      `"${d.serviceType.replace(/"/g, '""')}"`,
      `"${d.description.replace(/"/g, '""')}"`,
      `"${d.kpis.replace(/"/g, '""')}"`,
      `"${d.normativeOrTech.replace(/"/g, '""')}"`,
      `"${d.frequencyOrDuration.replace(/"/g, '""')}"`,
      `"${d.source}"`,
      `"${d.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BlindajeVial360_Especificaciones_Tecnicas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tecnología':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'Legal y Normativo':
        return <Scale className="w-4 h-4 text-purple-400" />;
      case 'Operaciones':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'Capacitación':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'Seguridad de la Información':
        return <Lock className="w-4 h-4 text-rose-400" />;
      case 'Soporte y SLA':
        return <Headphones className="w-4 h-4 text-teal-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner with Brand Logo */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <BrandLogo size="lg" showText={false} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold font-mono bg-[#0056B3] text-white px-3 py-1 rounded-lg shadow">
                    MATRIZ OFICIAL DE ESPECIFICACIONES
                  </span>
                  <span className="text-xs font-mono bg-slate-800 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-lg">
                    54 Módulos & Entregables Verificados
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Especificaciones Técnicas, Legales y Operativas
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Consolidado normativo y técnico de <strong>Blindaje Vial 360</strong>. Incluye los estándares de homologación (Alcolocks, Dräger 6820, Assure Tech), normativas chilenas (Ley 18.290, Ley 19.628, Ley 21.638, Art. 184 CT), arquitectura tecnológica (AES-256, TLS 1.3, API REST, SHA-256) y Acuerdos de Nivel de Servicio (SLA 99.5%).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 bg-[#0056B3] hover:bg-blue-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xl shadow-blue-600/30 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Matriz (CSV)</span>
            </button>
            <button
              onClick={() => setActiveTab('styleguide')}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs px-5 py-3 rounded-2xl transition cursor-pointer"
            >
              <Palette className="w-4 h-4 text-rose-400" />
              <span>Guía de Estilo & Logo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Matriz de Especificaciones ({filteredData.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('styleguide')}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'styleguide'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Identidad & Guía de Estilo Oficial</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Resumen Ejecutivo de Cobertura</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 px-3">
          Mostrando <strong>{filteredData.length}</strong> de <strong>{SPECIFICATIONS_DATA.length}</strong> especificaciones
        </div>
      </div>

      {/* TAB 1: SPECIFICATIONS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por tecnología, normativa, KPI, o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Select */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Categoría:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas las Categorías ({SPECIFICATIONS_DATA.length})</option>
                {categories
                  .filter((c) => c !== 'all')
                  .map((c) => (
                    <option key={c} value={c}>
                      {c} ({SPECIFICATIONS_DATA.filter((i) => i.category === c).length})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left List */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2 max-h-[750px] overflow-y-auto">
              {filteredData.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                          #{item.id}
                        </span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-medium text-slate-300">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-white">{item.serviceType}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                      <span>{item.normativeOrTech.split(';')[0]}</span>
                      <span className="text-blue-400">{item.source}</span>
                    </div>
                  </div>
                );
              })}

              {filteredData.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No se encontraron especificaciones con los filtros actuales.
                </div>
              )}
            </div>

            {/* Right Detail Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 sticky top-20">
              {selectedItem ? (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-blue-400">
                          ESPECIFICACIÓN #{selectedItem.id}
                        </span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                          {selectedItem.source}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{selectedItem.serviceType}</h3>
                      <span className="text-xs text-slate-400">{selectedItem.component}</span>
                    </div>

                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      {selectedItem.status}
                    </span>
                  </div>

                  {/* Description Box */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      DESCRIPCIÓN OPERACIONAL & TÉCNICA
                    </label>
                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-200 leading-relaxed">
                      {selectedItem.description}
                    </div>
                  </div>

                  {/* KPIs Box */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      INDICADORES DE DESEMPEÑO (KPIS)
                    </label>
                    <div className="bg-slate-950 border border-emerald-500/20 p-3.5 rounded-2xl text-xs text-emerald-300 leading-relaxed font-mono">
                      {selectedItem.kpis}
                    </div>
                  </div>

                  {/* Normative / Technology Box */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-blue-400 font-bold flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      NORMATIVA O TECNOLOGÍA APLICADA
                    </label>
                    <div className="bg-slate-950 border border-blue-500/20 p-3.5 rounded-2xl text-xs text-blue-200 leading-relaxed">
                      {selectedItem.normativeOrTech}
                    </div>
                  </div>

                  {/* Frequency & Duration */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                      FRECUENCIA O DURACIÓN
                    </label>
                    <div className="bg-slate-950 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-300 font-mono">
                      {selectedItem.frequencyOrDuration}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Seleccione una especificación de la lista para ver todos sus detalles.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STYLE GUIDE & OFFICIAL BRANDING */}
      {activeTab === 'styleguide' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                GUÍA DE ESTILO OFICIAL (ESPECIFICACIÓN #66 / FUENTE 21)
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Manual de Identidad Visual & Logotipo Oficial Blindaje Vial 360
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Definición de colores corporativos, tipografía, emblema heráldico de seguridad vial y reglas de aplicación.
              </p>
            </div>

            {/* Logo Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo on Dark Canvas */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Aplicación en Fondo Oscuro (Principal)</span>
                <BrandLogo size="xl" showText={true} />
                <span className="text-[11px] text-slate-500 font-mono">Software SaaS • Dashboard Ejecutivo</span>
              </div>

              {/* Logo on Light Canvas */}
              <div className="bg-slate-100 border border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-[10px] font-mono text-slate-600 uppercase font-bold">Aplicación en Fondo Claro / Impreso</span>
                <div className="flex items-center gap-3">
                  <BrandLogo size="lg" showText={false} variant="light" />
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-lg text-slate-900 font-sans tracking-wide">
                      BLINDAJE VIAL <span className="text-[#0056B3]">360</span>
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      Seguridad Vial & Compliance ISO 37301
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-600 font-mono">Actas Digitales • Informes Periciales PDF</span>
              </div>

              {/* Vector Details */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">Significado del Emblema Heráldico</span>
                <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Escudo Metálico 3D:</strong> Blindaje y protección jurídica y física frente a siniestros.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Checkmark Blanco:</strong> Verificación de aptitud técnica, resultado negativo y conformidad DT.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Arco Horizonte/Carretera:</strong> Enfoque integral en el transporte y operación en ruta.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Corporate Palette Cards */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Paleta Cromática Oficial y Códigos Hexadecimales
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-full h-12 rounded-xl bg-[#0056B3] flex items-center justify-center font-mono font-bold text-xs text-white shadow-inner">
                    #0056B3
                  </div>
                  <h4 className="text-xs font-bold text-white">Azul Seguridad Primario</h4>
                  <p className="text-[10px] text-slate-400">
                    Color representativo de la marca, botones primarios y encabezados.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-full h-12 rounded-xl bg-[#C41E3A] flex items-center justify-center font-mono font-bold text-xs text-white shadow-inner">
                    #C41E3A
                  </div>
                  <h4 className="text-xs font-bold text-white">Rojo Alerta / Bloqueo</h4>
                  <p className="text-[10px] text-slate-400">
                    Positivos presuntivos, bloqueos preventivos y alertas críticas de seguridad.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-full h-12 rounded-xl bg-emerald-600 flex items-center justify-center font-mono font-bold text-xs text-white shadow-inner">
                    #059669
                  </div>
                  <h4 className="text-xs font-bold text-white">Verde Apto / Habilitado</h4>
                  <p className="text-[10px] text-slate-400">
                    Controles negativos (0.00 g/L), pases de despacho y certificados válidos.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-full h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-200 shadow-inner">
                    #0F172A
                  </div>
                  <h4 className="text-xs font-bold text-white">Gris Pizarra Oscuro</h4>
                  <p className="text-[10px] text-slate-400">
                    Fondo de alto contraste para garitas nocturnas y terminales de despacho.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTIVE SUMMARY */}
      {activeTab === 'summary' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase">
              ALCANCE INTEGRAL DEL PROYECTO
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Resumen de Cobertura Tecnológica, Jurídica y Operativa
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono text-blue-400 font-bold">TECNOLOGÍA E INSTRUMENTAL</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Alcoholímetros Dräger 6820 calibrados bajo NCh-ISO 17025, paneles salivales rápidos de 6 drogas Assure Tech con registro ISP y dispositivos Alcolocks para bloqueo preventivo de ignición.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono text-purple-400 font-bold">MARCO JURÍDICO & SUSESO</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Conformidad integral con el Dictamen SUSESO 92064-2025, Código del Trabajo Art. 184 y 154 N° 5, Ley Emilia (20.770), Ley de Tolerancia Cero (20.580) y Ley de Protección de la Vida Privada (19.628).
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold">SOFTWARE & CRIPTOGRAFÍA</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Motor de sorteo aleatorio inopinado con semilla criptográfica SHA-256, bóveda inalterable AES-256, actas con geolocalización GPS, timestamp digital y API RESTful para integración con sistemas de RRHH/TMS.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
