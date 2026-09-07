import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  Check,
  CheckCircle2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Building2,
  FileCheck,
  FileText,
  Clock,
  Coins,
  AlertTriangle,
  Scale,
  Users,
  Truck,
  Layers,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Dices,
  TestTube,
  PenTool,
  Award,
  Gavel,
  PieChart as PieChartIcon,
  Play,
  RotateCcw,
  Sliders
} from 'lucide-react';

interface BlindajeVialPresentationDeckProps {
  onNavigateView?: (view: string) => void;
}

export const BlindajeVialPresentationDeck: React.FC<BlindajeVialPresentationDeckProps> = ({
  onNavigateView
}) => {
  const { currentCompany } = useApp();
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slides' | 'continuous'>('slides');

  // Interactive calculator inside slide 8/9
  const [simulatedFleet, setSimulatedFleet] = useState<number>(45);

  const totalSlides = 12;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlide((prev) => Math.max(prev - 1, 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slideTitles = [
    'Portada Oficial Blindaje Vial',
    'Endurecimiento Ley de Tránsito (Boletín 17.118-15)',
    'Propuesta de Valor & Blindaje Operacional',
    'Ciclo Mensual de 4 Pasos',
    'Alineación Normativa 100% Defendible',
    'Plataforma SaaS Blindaje Vial®',
    'Protocolo ante Resultado Positivo',
    'Suscripción Mensual Escalable (CLP + IVA)',
    'Análisis Costo-Beneficio & ROI',
    'Segmentos de Mercado & Clientes Objetivo',
    'Roadmap de Despliegue en 14 Días Hábiles',
    'Contacto & Agendamiento Auditoría Inicial'
  ];

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-7 bg-rose-600 rounded-full" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Deck de Presentación Oficial • Blindaje Vial SpA</span>
              <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                12 SLIDES HD
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Formato ejecutivo estandarizado para presentación a Gerencias Generales, Directorios y Comités de Operaciones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('slides')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'slides' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Modo Lámina a Lámina
            </button>
            <button
              onClick={() => setViewMode('continuous')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'continuous' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Documento Continuo
            </button>
          </div>

          {/* Slide Navigation in Slides Mode */}
          {viewMode === 'slides' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 1))}
                disabled={currentSlide === 1}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Lámina Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono font-bold text-slate-200 text-xs">
                {currentSlide} / {totalSlides}
              </span>
              <button
                onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides))}
                disabled={currentSlide === totalSlides}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Lámina Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Slide Selector Pill Bar (when in slides mode) */}
      {viewMode === 'slides' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            const slideNum = idx + 1;
            return (
              <button
                key={slideNum}
                onClick={() => setCurrentSlide(slideNum)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  currentSlide === slideNum
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                #{slideNum} {slideTitles[idx].split(' ')[0]}
              </button>
            );
          })}
        </div>
      )}

      {/* Presentation Canvas Container */}
      <div className="bg-slate-950/70 p-2 sm:p-6 rounded-3xl border border-slate-800 flex justify-center">
        {viewMode === 'slides' ? (
          <div className="w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden border border-slate-200/20 bg-white">
            <SlideRenderer slideIndex={currentSlide} simulatedFleet={simulatedFleet} setSimulatedFleet={setSimulatedFleet} />
          </div>
        ) : (
          <div className="w-full max-w-5xl space-y-8">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <div key={idx} className="shadow-2xl rounded-2xl overflow-hidden border border-slate-200/20 bg-white">
                <div className="bg-slate-900 text-slate-400 px-4 py-1 text-[11px] font-mono flex justify-between border-b border-slate-800">
                  <span>LÁMINA {idx + 1} DE 12</span>
                  <span>{slideTitles[idx]}</span>
                </div>
                <SlideRenderer slideIndex={idx + 1} simulatedFleet={simulatedFleet} setSimulatedFleet={setSimulatedFleet} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Presentation Footer / Controls */}
      {viewMode === 'slides' && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Navegación:</span>
            <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px] font-mono text-slate-300">←</kbd>
            <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px] font-mono text-slate-300">→</kbd>
            <span className="text-slate-500 hidden sm:inline">o barra espaciadora</span>
          </div>

          <div className="font-semibold text-slate-300">
            {currentSlide}. {slideTitles[currentSlide - 1]}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// INDIVIDUAL SLIDE RENDERER
// ==========================================
interface SlideRendererProps {
  slideIndex: number;
  simulatedFleet: number;
  setSimulatedFleet: (val: number) => void;
}

const SlideRenderer: React.FC<SlideRendererProps> = ({
  slideIndex,
  simulatedFleet,
  setSimulatedFleet
}) => {
  const { currentCompany } = useApp();
  switch (slideIndex) {
    // ---------------------------------------------------------
    // SLIDE 1: PORTADA
    // ---------------------------------------------------------
    case 1:
      return (
        <div className="bg-[#0b5cbe] text-white min-h-[540px] p-8 sm:p-14 flex flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top spacer */}
          <div />

          {/* Center Main Header */}
          <div className="text-center space-y-5 my-auto z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase text-white drop-shadow-sm font-sans">
              BLINDAJE VIAL SPA
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-blue-100 max-w-2xl mx-auto leading-snug">
              Suscripción de Control Preventivo Aleatorio para Transporte Público de Pasajeros
            </p>

            <div className="pt-4 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-blue-100 flex-wrap">
              <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">Prevención Operacional</span>
              <span>•</span>
              <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">Trazabilidad Documental</span>
              <span>•</span>
              <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">Cumplimiento Legal</span>
            </div>
          </div>

          {/* Footer Information */}
          <div className="pt-8 border-t border-blue-400/30 text-center text-xs text-blue-100/90 font-medium z-10">
            <p className="tracking-wide">contacto@blindajevial.cl | +56 9 8452 9100 | www.blindajevial.cl</p>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 2: ENDURECIMIENTO DE LA LEY
    // ---------------------------------------------------------
    case 2:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight">
                Un escenario que cambió: endurecimiento de la Ley de Tránsito
              </h2>
            </div>

            {/* Grid with 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Column: Bullet points */}
              <div className="md:col-span-7 space-y-4 text-sm sm:text-base text-slate-700 font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Multas graves:</strong> Aumento drástico de 8-20 UTM a 100-200 UTM.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Cancelación de licencia:</strong> Ejecución inmediata en la 2ª reincidencia (antes 3ª).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Exposición empresarial:</strong> Alto riesgo en concesión, reputación y continuidad de flota.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Control preventivo:</strong> Ya no es una opción, es un costo crítico de operación.
                  </div>
                </div>
              </div>

              {/* Right Column: Comparative Table */}
              <div className="md:col-span-5">
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-md bg-white">
                  <div className="grid grid-cols-3 bg-[#0b5cbe] text-white text-xs sm:text-sm font-bold text-center py-3 px-2">
                    <div>Sanción</div>
                    <div>Ley Vigente</div>
                    <div>Boletín 17.118-15</div>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                    <div className="grid grid-cols-3 py-3 px-2 text-center items-center bg-slate-50/70">
                      <div className="font-bold text-slate-900 text-left pl-2">Multa Máxima</div>
                      <div className="text-slate-600">~ $1.3M</div>
                      <div className="font-extrabold text-rose-600 text-base">~ $13.0M</div>
                    </div>

                    <div className="grid grid-cols-3 py-3 px-2 text-center items-center">
                      <div className="font-bold text-slate-900 text-left pl-2">Cancelación Licencia</div>
                      <div className="text-slate-600">3ª Infracción</div>
                      <div className="font-extrabold text-rose-600">2ª Infracción</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Marco Jurídico y Sancionatorio</span>
            <span>2 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 3: PROPUESTA DE VALOR / ESCUDO
    // ---------------------------------------------------------
    case 3:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight leading-tight">
                No vendemos tests.<br />
                Vendemos blindaje operacional documentado.
              </h2>
            </div>

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-6">
              {/* Left Column: Bullet Points */}
              <div className="md:col-span-7 space-y-4 text-sm sm:text-base text-slate-700 font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Programa de control aleatorio, trazable y auditable.</div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Dispositivo Assure Tech: detección en saliva (5-8 min).</div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Selección despersonalizada con algoritmo auditable.</div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Actas digitales con timestamp y geolocalización.</div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Asesoría jurídica alineada a la Dirección del Trabajo.</div>
                </div>
              </div>

              {/* Right Column: Blue Shield Graphic */}
              <div className="md:col-span-5 flex justify-center items-center">
                <div className="relative w-48 h-56 sm:w-56 sm:h-64 flex items-center justify-center">
                  <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-xl">
                    <path
                      d="M 100 10 L 190 45 C 190 140, 100 230, 100 230 C 100 230, 10 140, 10 45 Z"
                      fill="#0b5cbe"
                    />
                    <path
                      d="M 100 20 L 180 50 C 180 135, 100 215, 100 215 C 100 215, 20 135, 20 50 Z"
                      fill="#1d72db"
                    />
                  </svg>
                  <ShieldCheck className="absolute w-20 h-20 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Propuesta de Valor</span>
            <span>3 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 4: CICLO MENSUAL DE 4 PASOS
    // ---------------------------------------------------------
    case 4:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight">
                Ciclo Mensual de Blindaje Vial (4 Pasos)
              </h2>
            </div>

            {/* 4 Cards Grid with Top Blue Highlight Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Step 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-1.5 bg-[#0b5cbe]" />
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="w-12 h-12 bg-blue-100 text-[#0b5cbe] rounded-xl flex items-center justify-center mx-auto mb-1">
                    <Dices className="w-6 h-6" />
                  </div>
                  <h3 className="text-center font-extrabold text-base text-[#003e8c]">
                    1. Selección
                  </h3>
                  <p className="text-xs text-slate-600 text-center leading-relaxed flex-1">
                    Semilla auditable que genera código de supervisor sin nombres previos.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-1.5 bg-[#0b5cbe]" />
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="w-12 h-12 bg-blue-100 text-[#0b5cbe] rounded-xl flex items-center justify-center mx-auto mb-1">
                    <TestTube className="w-6 h-6" />
                  </div>
                  <h3 className="text-center font-extrabold text-base text-[#003e8c]">
                    2. Aplicación
                  </h3>
                  <p className="text-xs text-slate-600 text-center leading-relaxed flex-1">
                    Zona reservada + testigo neutral + test rápido Assure Tech.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-1.5 bg-[#0b5cbe]" />
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="w-12 h-12 bg-blue-100 text-[#0b5cbe] rounded-xl flex items-center justify-center mx-auto mb-1">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <h3 className="text-center font-extrabold text-base text-[#003e8c]">
                    3. Registro
                  </h3>
                  <p className="text-xs text-slate-600 text-center leading-relaxed flex-1">
                    Acta digital inmediata cargada a plataforma en menos de 2 horas.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-1.5 bg-[#0b5cbe]" />
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="w-12 h-12 bg-blue-100 text-[#0b5cbe] rounded-xl flex items-center justify-center mx-auto mb-1">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-center font-extrabold text-base text-[#003e8c]">
                    4. Gestión
                  </h3>
                  <p className="text-xs text-slate-600 text-center leading-relaxed flex-1">
                    Negativo: Archivo | Positivo: Protocolo de derivación confirmatoria.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Flujo Operacional</span>
            <span>4 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 5: ALINEACIÓN NORMATIVA 100% DEFENSIBLE
    // ---------------------------------------------------------
    case 5:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight">
                Alineación normativa 100% defensible
              </h2>
            </div>

            {/* Grid with 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Graphic: Gavel / Legal Approval Concept */}
              <div className="md:col-span-5 bg-gradient-to-br from-slate-100 to-blue-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner relative">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-3">
                  <Scale className="w-10 h-10" />
                </div>
                <div className="bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs mb-2">
                  APPROVED
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Respaldo Jurídico Laboral</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Dictámenes Dirección del Trabajo & SUSESO N° 92.064
                </p>
              </div>

              {/* Right Column: Bullets */}
              <div className="md:col-span-7 space-y-3.5 text-sm sm:text-base text-slate-700 font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Control preventivo enfocado en seguridad,</strong> NO sancionatorio per se.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    Garantía de aleatoriedad, despersonalización y proporcionalidad.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    Incorporación expresa en el <strong className="text-slate-900 font-bold">RIOHS</strong> (anexo técnico incluido).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    Protección estricta de datos sensibles de salud (<strong className="text-slate-900 font-bold">Ley 19.628</strong>).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    Protocolo de derivación a laboratorios acreditados.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Blindaje Jurídico Laboral</span>
            <span>5 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 6: PLATAFORMA SAAS BLINDAJE VIAL
    // ---------------------------------------------------------
    case 6:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight">
                Plataforma SaaS Blindaje Vial®
              </h2>
            </div>

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left: Bullets */}
              <div className="md:col-span-6 space-y-4 text-sm sm:text-base text-slate-700 font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Algoritmo criptográfico:</strong> Fecha + RUT + Hash único.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Trazabilidad total:</strong> Firma electrónica y geolocalización.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Dashboard Ejecutivo:</strong> Cobertura y tendencias en tiempo real.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Bóveda Encriptada:</strong> Acceso por roles (Jurídico, RRHH, Prevención).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>
                    <strong className="text-slate-900 font-bold">Integración:</strong> Compatible con SAP, Oracle y software de flotas.
                  </div>
                </div>
              </div>

              {/* Right: SaaS Dashboard Graphic */}
              <div className="md:col-span-6">
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-bold text-blue-400">Panel Central de Flota</span>
                    <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded">95% Eficiencia</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Flota en Ruta</span>
                      <span className="text-lg font-bold text-white">63 Buses</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">✓ 100% Testeados</span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Tiempo Promedio</span>
                      <span className="text-lg font-bold text-amber-300">5 - 8 min</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Test de Saliva Rápido</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-300 text-[11px]">Bóveda de Actas con Hash SHA-256</span>
                    </div>
                    <span className="font-mono text-emerald-400 text-[10px]">VERIFICADO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Arquitectura Tecnológica SaaS</span>
            <span>6 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 7: PROTOCOLO ANTE RESULTADO POSITIVO
    // ---------------------------------------------------------
    case 7:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight">
                Protocolo ante Resultado Positivo
              </h2>
            </div>

            {/* Structured Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-md bg-white my-6">
              <div className="grid grid-cols-12 bg-[#0b5cbe] text-white text-xs sm:text-sm font-bold py-3 px-4">
                <div className="col-span-3">Fase</div>
                <div className="col-span-5">Acción Inmediata</div>
                <div className="col-span-4">Resguardo Legal</div>
              </div>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
                <div className="grid grid-cols-12 py-3.5 px-4 items-center bg-slate-50/50">
                  <div className="col-span-3 font-bold text-slate-900">Detección</div>
                  <div className="col-span-5 text-slate-700">Retiro de funciones de conducción</div>
                  <div className="col-span-4 text-blue-700 font-semibold">Medida preventiva de seguridad</div>
                </div>

                <div className="grid grid-cols-12 py-3.5 px-4 items-center">
                  <div className="col-span-3 font-bold text-slate-900">Custodia</div>
                  <div className="col-span-5 text-slate-700">Activación de cadena de custodia</div>
                  <div className="col-span-4 text-blue-700 font-semibold">Trato reservado y confidencial</div>
                </div>

                <div className="grid grid-cols-12 py-3.5 px-4 items-center bg-slate-50/50">
                  <div className="col-span-3 font-bold text-slate-900">Confirmación</div>
                  <div className="col-span-5 text-slate-700">Derivación a laboratorio NCh-ISO/IEC 17025</div>
                  <div className="col-span-4 text-blue-700 font-semibold">Garantía de debido proceso</div>
                </div>
              </div>
            </div>

            {/* Warning callout */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>⚠️ El test rápido es un tamizaje preventivo,</strong> NO constituye prueba sancionatoria definitiva.
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Protocolo Operacional y Legal</span>
            <span>7 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 8: SUSCRIPCIÓN MENSUAL ESCALABLE
    // ---------------------------------------------------------
    case 8:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight">
                Suscripción mensual escalable (CLP + IVA)
              </h2>
            </div>

            {/* Pricing Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-md bg-white my-4">
              <div className="grid grid-cols-12 bg-[#0b5cbe] text-white text-xs sm:text-sm font-bold text-center py-3.5 px-4">
                <div className="col-span-3 text-left">Plan</div>
                <div className="col-span-3">Vehículos</div>
                <div className="col-span-2">Tests / Mes</div>
                <div className="col-span-2">Máquinas</div>
                <div className="col-span-2 text-right">Precio Mensual</div>
              </div>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
                {/* Básico */}
                <div className="grid grid-cols-12 py-3.5 px-4 items-center text-center">
                  <div className="col-span-3 text-left font-bold text-slate-900">Básico</div>
                  <div className="col-span-3 text-slate-600">≤ 30</div>
                  <div className="col-span-2 text-slate-600">20</div>
                  <div className="col-span-2 text-slate-600">1</div>
                  <div className="col-span-2 text-right font-extrabold text-slate-900">$ 700.000</div>
                </div>

                {/* Pro */}
                <div className="grid grid-cols-12 py-3.5 px-4 items-center text-center bg-blue-50/70 border-y border-blue-200">
                  <div className="col-span-3 text-left font-extrabold text-[#003e8c] flex items-center gap-1.5">
                    <span>Pro</span>
                    <span className="text-amber-500 text-xs">⭐</span>
                  </div>
                  <div className="col-span-3 font-bold text-slate-900">31 - 80</div>
                  <div className="col-span-2 font-bold text-slate-900">60</div>
                  <div className="col-span-2 font-bold text-slate-900">3</div>
                  <div className="col-span-2 text-right font-black text-[#003e8c] text-base">$ 2.100.000</div>
                </div>

                {/* Premium */}
                <div className="grid grid-cols-12 py-3.5 px-4 items-center text-center">
                  <div className="col-span-3 text-left font-bold text-slate-900">Premium</div>
                  <div className="col-span-3 text-slate-600">81 +</div>
                  <div className="col-span-2 text-slate-600">120</div>
                  <div className="col-span-2 text-slate-600">5</div>
                  <div className="col-span-2 text-right font-extrabold text-slate-900">$ 4.200.000</div>
                </div>
              </div>
            </div>

            {/* Bottom Row Note */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 pt-3 gap-2">
              <p>
                <strong>Incluye:</strong> Capacitación, reportes, soporte jurídico y actualizaciones.
              </p>
              <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-800">
                Test adicional: <strong>$ 40.000</strong>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Estructura Comercial</span>
            <span>8 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 9: ¿POR QUÉ INVERTIR HOY? (ROI)
    // ---------------------------------------------------------
    case 9:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight">
                ¿Por qué invertir hoy?
              </h2>
            </div>

            {/* Bar Charts Comparison */}
            <div className="space-y-4 my-6">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>1 Multa Grave (200 UTM)</span>
                  <span className="text-rose-600">$ 13.000.000</span>
                </div>
                <div className="w-full bg-slate-100 h-8 rounded-full overflow-hidden p-0.5">
                  <div className="bg-rose-600 h-full rounded-full flex items-center justify-end pr-3 text-white text-xs font-bold w-[50%]">
                    $ 13.000.000
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Suscripción Anual Pro</span>
                  <span className="text-[#0b5cbe]">$ 25.200.000</span>
                </div>
                <div className="w-full bg-slate-100 h-8 rounded-full overflow-hidden p-0.5">
                  <div className="bg-[#0b5cbe] h-full rounded-full flex items-center justify-end pr-3 text-white text-xs font-bold w-[85%]">
                    $ 25.200.000
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Pillars / Value Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-center space-y-1">
                <h4 className="font-bold text-sm text-[#003e8c]">Seguro Operacional</h4>
                <p className="text-xs text-slate-600">Equivale al ~1% del costo de un conductor.</p>
              </div>

              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-center space-y-1">
                <h4 className="font-bold text-sm text-[#003e8c]">Continuidad</h4>
                <p className="text-xs text-slate-600">Evita paralizaciones de &gt;$50M/mes.</p>
              </div>

              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-center space-y-1">
                <h4 className="font-bold text-sm text-[#003e8c]">Diligencia Debida</h4>
                <p className="text-xs text-slate-600">Protección ante demandas laborales.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Justificación Financiera</span>
            <span>9 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 10: ¿PARA QUIÉN ES BLINDAJE VIAL?
    // ---------------------------------------------------------
    case 10:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight">
                ¿Para quién es Blindaje Vial?
              </h2>
            </div>

            {/* 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Bullets */}
              <div className="md:col-span-7 space-y-4 text-sm sm:text-base text-slate-700 font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Transporte público (buses, minibuses, colectivos).</div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Transporte escolar y traslado de personal.</div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Logística con flotas mayores a 10 vehículos.</div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Concesionarias con exigencias de licitación estatal.</div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-rose-600 font-black text-lg">✓</span>
                  <div>Empresas que buscan demostrar Diligencia Debida.</div>
                </div>
              </div>

              {/* Right Illustration / Bus Terminal Photo Card */}
              <div className="md:col-span-5">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 text-white relative">
                  <div className="h-48 bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-800 p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <Truck className="w-8 h-8 text-blue-400" />
                      <span className="bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded">ALTO IMPACTO</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">Terminales y Faenas</h4>
                      <p className="text-xs text-slate-300">Control preventivo en origen para despacho seguro de flota.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Mercado Objetivo</span>
            <span>10 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 11: DESPLIEGUE EN 14 DÍAS HÁBILES
    // ---------------------------------------------------------
    case 11:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header with Red Bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-rose-600 rounded-xs shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003e8c] tracking-tight">
                Despliegue en 14 días hábiles
              </h2>
            </div>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              {/* Card 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-1.5 bg-[#0b5cbe]" />
                <div className="p-6 space-y-4 text-center flex-1 flex flex-col">
                  <div className="w-14 h-14 bg-blue-100 text-[#0b5cbe] rounded-2xl flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-lg text-[#003e8c]">
                    Semana 1: Legal
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed flex-1">
                    Auditoría de RIOHS y firma de anexos de confidencialidad.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-1.5 bg-[#0b5cbe]" />
                <div className="p-6 space-y-4 text-center flex-1 flex flex-col">
                  <div className="w-14 h-14 bg-blue-100 text-[#0b5cbe] rounded-2xl flex items-center justify-center mx-auto">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-lg text-[#003e8c]">
                    Semana 2: Setup
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed flex-1">
                    Instalación de plataforma, capacitación de supervisores y marcha blanca.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-1.5 bg-[#0b5cbe]" />
                <div className="p-6 space-y-4 text-center flex-1 flex flex-col">
                  <div className="w-14 h-14 bg-blue-100 text-[#0b5cbe] rounded-2xl flex items-center justify-center mx-auto">
                    <Play className="w-7 h-7 text-[#0b5cbe]" />
                  </div>
                  <h3 className="font-extrabold text-lg text-[#003e8c]">
                    Go-Live
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed flex-1">
                    Inicio de controles aleatorios con validez legal completa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Blindaje Vial SpA • Plan de Implementación</span>
            <span>11 / 12</span>
          </div>
        </div>
      );

    // ---------------------------------------------------------
    // SLIDE 12: CIERRE / CONTACTO
    // ---------------------------------------------------------
    case 12:
      return (
        <div className="bg-white text-slate-800 min-h-[540px] p-8 sm:p-14 flex flex-col justify-between text-center relative select-none">
          <div />

          {/* Main Call to action */}
          <div className="space-y-6 max-w-xl mx-auto my-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#003e8c] tracking-tight">
              ¿Listo para blindar su operación?
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-600">
              Agende hoy su auditoría normativa inicial sin costo.
            </p>

            <div className="pt-4 space-y-2 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-[#0b5cbe]" />
                <span>contacto@blindajevial.cl</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-[#0b5cbe]" />
                <span>+56 9 8452 9100</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Globe className="w-4 h-4 text-[#0b5cbe]" />
                <span>www.blindajevial.cl</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => alert(`Solicitud de Auditoría Inicial registrada con éxito para ${currentCompany?.businessName || 'su empresa'}. Un asesor legal de Blindaje Vial se pondrá en contacto.`)}
                className="bg-[#0b5cbe] hover:bg-[#094ca0] text-white font-bold px-8 py-3 rounded-full text-sm shadow-xl shadow-blue-600/30 transition transform hover:scale-105 cursor-pointer"
              >
                Agendar Auditoría Gratuita
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 text-xs text-slate-400">
            <span>Blindaje Vial SpA © 2026 - Santiago, Chile</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};
