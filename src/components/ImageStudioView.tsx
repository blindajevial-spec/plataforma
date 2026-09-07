import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Tag,
  Copy,
  Layers,
  Palette,
  Maximize2,
  Eye,
  Trash2,
  FileCheck
} from 'lucide-react';

interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  timestamp: string;
  type: 'creation' | 'edition';
  category: string;
}

export const ImageStudioView: React.FC = () => {
  const { currentCompany } = useApp();

  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16' | '3:4'>('16:9');
  const [imageSize, setImageSize] = useState<'1K' | '512px' | '2K'>('1K');
  const [stylePreset, setStylePreset] = useState<string>('corporativo_industrial');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<GeneratedImageItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // For Edit Mode: Source Image
  const [sourceImageBase64, setSourceImageBase64] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery of generated assets
  const [gallery, setGallery] = useState<GeneratedImageItem[]>([
    {
      id: 'default-1',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      prompt: 'Afiche oficial de Tolerancia Cero Alcohol y Drogas para garita de buses con logo de Blindaje Vial',
      aspectRatio: '16:9',
      timestamp: '2026-08-30 08:30',
      type: 'creation',
      category: 'Señalética Garita'
    },
    {
      id: 'default-2',
      url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
      prompt: 'Infografía técnica paso a paso para test de saliva Assure Tech 5-8 min con trazabilidad digital',
      aspectRatio: '16:9',
      timestamp: '2026-08-29 14:15',
      type: 'creation',
      category: 'Infografía Protocolo'
    }
  ]);

  // Industry Presets for Blindaje Vial
  const presets = [
    {
      title: 'Señalética Garita Tolerancia Cero',
      category: 'Señalética',
      prompt: 'Letrero industrial de alta visibilidad para terminal de buses: "ZONA DE CONTROL PREVENTIVO TOLERANCIA CERO ALCOHOL Y DROGAS - LEY DE TRÁNSITO & RIOHS", fondo azul cobalto institucional con bordes reflectantes y escudo de seguridad Blindaje Vial.',
      aspectRatio: '16:9' as const
    },
    {
      title: 'Infografía Toma de Muestra Assure Tech',
      category: 'Protocolo',
      prompt: 'Infografía técnica paso a paso del protocolo de test de saliva rápida Assure Tech (recolección 5-8 min, testigo neutral, lectura no invasiva, registro con firma electrónica y hash SHA-256).',
      aspectRatio: '16:9' as const
    },
    {
      title: 'Sello de Parabrisas "Flota Blindada"',
      category: 'Certificación',
      prompt: 'Emblema circular o sticker de seguridad para parabrisas de bus de pasajeros: "FLOTA BLINDADA - CONTROLES PREVENTIVOS ALEATORIOS AUDITADOS ISO 37301", colores azul marino, plateado y holograma de protección.',
      aspectRatio: '1:1' as const
    },
    {
      title: 'Afiche Concientización de Choferes',
      category: 'Prevención',
      prompt: 'Campaña de seguridad vial para sala de conductores: "Tu seguridad y la de tus pasajeros es primero. Programa de bienestar laboral y tolerancia cero. Conduce protegido."',
      aspectRatio: '3:4' as const
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImageBase64(reader.result as string);
      setSourceImageName(file.name);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setPrompt(preset.prompt);
    setAspectRatio(preset.aspectRatio);
  };

  const handleGenerateOrEdit = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Por favor ingresa una descripción o instrucción para la IA.');
      return;
    }

    if (mode === 'edit' && !sourceImageBase64) {
      setErrorMessage('Para el modo de edición, debes cargar una imagen base de referencia.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          baseImageBase64: mode === 'edit' ? sourceImageBase64 : undefined,
          aspectRatio,
          imageSize,
          style: stylePreset
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo generar la imagen con Gemini.');
      }

      const newItem: GeneratedImageItem = {
        id: `img-${Date.now()}`,
        url: data.imageUrl,
        prompt: prompt.trim(),
        aspectRatio,
        timestamp: new Date().toLocaleString('es-CL'),
        type: mode === 'edit' ? 'edition' : 'creation',
        category: mode === 'edit' ? 'Edición con IA' : 'Generación Directa'
      };

      setCurrentResult(newItem);
      setGallery((prev) => [newItem, ...prev]);
    } catch (err: any) {
      console.error('Error generating image:', err);
      setErrorMessage(err.message || 'Error al conectar con la API de generación de imágenes de Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Gemini 3.1 Flash Image Preview • Motor Creativo & Técnico</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Blindaje Studio • Generador y Editor Visual</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Cree y edite material gráfico oficial para garitas, señalética de terminales, campañas de prevención de fatiga/drogas, sellos de parabrisas e infografías de protocolos RIOHS con inteligencia artificial.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-right">
              <span className="text-[10px] text-slate-400 block font-mono">EMPRESA ACTIVA</span>
              <span className="text-xs font-bold text-white">{currentCompany.fantasyName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Creator & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
            {/* Mode Switch: Create vs Edit */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setMode('create')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition cursor-pointer ${
                    mode === 'create'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Crear Nueva Imagen</span>
                </button>
                <button
                  onClick={() => setMode('edit')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition cursor-pointer ${
                    mode === 'edit'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Editar Imagen Existente</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 hidden sm:inline-block font-mono">
                {mode === 'create' ? 'Text-to-Image HD' : 'Image-to-Image Edit'}
              </span>
            </div>

            {/* If Edit Mode: Upload Image section */}
            {mode === 'edit' && (
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>1. Imagen Base para Modificar:</span>
                  {sourceImageBase64 && (
                    <button
                      onClick={() => {
                        setSourceImageBase64(null);
                        setSourceImageName(null);
                      }}
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>
                  )}
                </label>

                {sourceImageBase64 ? (
                  <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <img
                      src={sourceImageBase64}
                      alt="Base Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{sourceImageName || 'imagen_cargada.png'}</p>
                      <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Imagen cargada y lista para edición con IA</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-900/50 hover:bg-slate-900"
                  >
                    <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-200">
                      Haz clic para subir una foto de garita, acta, logo o señalética
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP hasta 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>{mode === 'create' ? 'Descripción de la Imagen (Prompt):' : '2. Instrucción de Edición:'}</span>
                <span className="text-[11px] text-slate-400 font-normal">Soporta lenguaje natural en español</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'create'
                    ? 'Ej: Señalética moderna de alta visibilidad para terminal de buses con texto "ZONA DE CONTROL PREVENTIVO DE ALCOHOL Y DROGAS - TOLERANCIA CERO"...'
                    : 'Ej: Agrega un marco perimetral reflectante amarillo/negro con el logo de Blindaje Vial y un sello de certificación ISO 37301...'
                }
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Quick Presets Bar */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Plantillas Rápidas para Transporte:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-600 transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition">
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{preset.aspectRatio}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              {/* Aspect Ratio */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Proporción</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="16:9">16:9 (Panorámico / Banner)</option>
                  <option value="1:1">1:1 (Cuadrado / Sello)</option>
                  <option value="4:3">4:3 (Estándar)</option>
                  <option value="3:4">3:4 (Afiche Vertical)</option>
                  <option value="9:16">9:16 (Historia / Móvil)</option>
                </select>
              </div>

              {/* Resolution / Image Size */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Resolución</label>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="1K">1K HD (1024px)</option>
                  <option value="2K">2K Ultra HD (2048px)</option>
                  <option value="512px">512px (Rápido)</option>
                </select>
              </div>

              {/* Style Preset */}
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Estilo Visual</label>
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="corporativo_industrial">Corporativo Industrial</option>
                  <option value="fotorealista_hd">Fotorealista Real</option>
                  <option value="infografia_vectorial">Infografía Técnica</option>
                  <option value="senaletica_vial">Señalética Vial MOP</option>
                </select>
              </div>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <strong>Error en la generación:</strong> {errorMessage}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              onClick={handleGenerateOrEdit}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
                  <span>Procesando con Gemini 3.1 Flash Image...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>{mode === 'create' ? 'Generar Imagen con IA' : 'Aplicar Edición a la Imagen'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Output & Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Vista Previa del Resultado</span>
              </h3>
              {currentResult && (
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  GENERADO
                </span>
              )}
            </div>

            {/* Image Preview Box */}
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 min-h-[280px] flex items-center justify-center relative">
              {isLoading ? (
                <div className="text-center p-8 space-y-3">
                  <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-200">Sintetizando píxeles con Gemini 3.1...</p>
                  <p className="text-[10px] text-slate-400">Aplicando formato {aspectRatio} y estilo {stylePreset}</p>
                </div>
              ) : currentResult ? (
                <div className="relative group w-full">
                  <img
                    src={currentResult.url}
                    alt="Gemini Output"
                    className="w-full h-auto object-contain max-h-[380px] mx-auto"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleDownload(currentResult.url, `blindaje-vial-${currentResult.id}`)}
                      className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl shadow-lg transition cursor-pointer"
                      title="Descargar PNG"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSourceImageBase64(currentResult.url);
                        setSourceImageName(`edicion_${currentResult.id}.png`);
                        setMode('edit');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl shadow-lg transition cursor-pointer"
                      title="Usar como base para nueva edición"
                    >
                      <Wand2 className="w-5 h-5 text-amber-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 space-y-2 text-slate-500">
                  <Palette className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs font-medium">No hay imagen generada aún</p>
                  <p className="text-[10px]">Configura tu prompt a la izquierda y presiona "Generar Imagen"</p>
                </div>
              )}
            </div>

            {/* Details & Actions for Active Image */}
            {currentResult && (
              <div className="space-y-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Proporción: <strong>{currentResult.aspectRatio}</strong></span>
                    <span>Hora: <strong>{currentResult.timestamp}</strong></span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-900 p-2 rounded-lg border border-slate-850">
                    "{currentResult.prompt}"
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(currentResult.url, `blindaje-vial-${currentResult.id}`)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Imagen PNG</span>
                  </button>

                  <button
                    onClick={() => handleCopyPrompt(currentResult.prompt)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                    title="Copiar prompt"
                  >
                    <Copy className="w-4 h-4 text-blue-400" />
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery of Generated & Certified Assets */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              <span>Galería de Activos Gráficos & Señalética Blindaje Vial</span>
            </h3>
            <p className="text-xs text-slate-400">
              Historial de piezas generadas listas para impresión en garitas, talleres y terminales.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{gallery.length} elementos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden group hover:border-blue-600 transition flex flex-col justify-between"
            >
              <div className="relative h-40 bg-slate-900 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-[10px] font-bold text-blue-300 px-2 py-0.5 rounded border border-slate-800">
                  {item.category}
                </span>
                <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono text-slate-300 px-1.5 py-0.5 rounded">
                  {item.aspectRatio}
                </span>
              </div>

              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 line-clamp-2 leading-snug">
                  {item.prompt}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[10px] text-slate-500">
                  <span>{item.timestamp}</span>
                  <button
                    onClick={() => handleDownload(item.url, `blindaje-${item.id}`)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
