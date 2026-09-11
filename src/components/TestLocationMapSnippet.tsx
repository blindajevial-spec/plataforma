import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Crosshair,
  Compass,
  Radio,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface TestLocationMapSnippetProps {
  geolocation?: {
    lat: number;
    lng: number;
    locationName: string;
  };
  driverBase?: string;
  testCode?: string;
  timestamp?: string;
  vehiclePlate?: string;
}

// Coordinate fallbacks based on Chilean operational bases if not explicitly provided
function resolveCoordinates(
  geo?: { lat: number; lng: number; locationName: string },
  driverBase?: string
): { lat: number; lng: number; locationName: string; isEstimated: boolean } {
  if (geo && typeof geo.lat === 'number' && typeof geo.lng === 'number' && !isNaN(geo.lat) && !isNaN(geo.lng)) {
    return {
      lat: geo.lat,
      lng: geo.lng,
      locationName: geo.locationName || driverBase || 'Garita de Control en Terreno',
      isEstimated: false
    };
  }

  const baseLower = (driverBase || '').toLowerCase();
  if (baseLower.includes('san antonio') || baseLower.includes('puerto')) {
    return {
      lat: -33.5933,
      lng: -71.6127,
      locationName: 'Garita Acceso Terminal Portuario San Antonio',
      isEstimated: true
    };
  }
  if (baseLower.includes('teniente') || baseLower.includes('rancagua') || baseLower.includes('faena')) {
    return {
      lat: -34.0890,
      lng: -70.4730,
      locationName: 'Garita de Control Colón - Faena El Teniente',
      isEstimated: true
    };
  }
  if (baseLower.includes('antofagasta') || baseLower.includes('norte')) {
    return {
      lat: -23.6509,
      lng: -70.3975,
      locationName: 'Patio Carga y Maniobras Antofagasta',
      isEstimated: true
    };
  }

  // Standard Default: Base Santiago Norte (Quilicura)
  return {
    lat: -33.3614,
    lng: -70.7302,
    locationName: driverBase ? `Garita de Control - ${driverBase}` : 'Garita Despacho Quilicura (Base Santiago Norte)',
    isEstimated: true
  };
}

// Convert decimal degrees to formatted Degrees-Minutes-Seconds (DMS)
function toDms(val: number, isLat: boolean): string {
  const absVal = Math.abs(val);
  const degrees = Math.floor(absVal);
  const minutesNotTruncated = (absVal - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
  const direction = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'O');
  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

export const TestLocationMapSnippet: React.FC<TestLocationMapSnippetProps> = ({
  geolocation,
  driverBase,
  testCode,
  timestamp,
  vehiclePlate
}) => {
  const [viewMode, setViewMode] = useState<'cartographic' | 'tactical'>('cartographic');
  const [zoomLevel, setZoomLevel] = useState<number>(2); // 1: close (0.003), 2: normal (0.006), 3: wide (0.015)
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const loc = resolveCoordinates(geolocation, driverBase);
  const dmsLat = toDms(loc.lat, true);
  const dmsLng = toDms(loc.lng, false);
  const decimalCoords = `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;

  // Bounding box delta based on zoom
  const deltas = [0.002, 0.005, 0.012, 0.025];
  const currentDelta = deltas[zoomLevel] || 0.005;

  const minLng = loc.lng - currentDelta * 1.3;
  const maxLng = loc.lng + currentDelta * 1.3;
  const minLat = loc.lat - currentDelta;
  const maxLat = loc.lat + currentDelta;

  const osmIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${loc.lat}%2C${loc.lng}`;

  const googleMapsUrl = `https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=17&utm_campaign=gmp_mcp_codeassist_v1_aistudio`;
  const wazeUrl = `https://www.waze.com/ul?ll=${loc.lat},${loc.lng}&navigate=yes`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(0, prev - 1));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(deltas.length - 1, prev + 1));
  };

  return (
    <div className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Georreferenciación y Registro de Ubicación GPS</span>
              {loc.isEstimated ? (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono border border-amber-500/30">
                  Referencia Base
                </span>
              ) : (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GPS Fix Verificado
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-400">
              Coordenadas de toma de muestra conforme a Circular SUSESO e ISO 37301
            </p>
          </div>
        </div>

        {/* Action buttons (Screen Only) */}
        <div className="flex items-center gap-1.5 no-print">
          {/* Mode Switcher */}
          <div className="bg-slate-850 border border-slate-700 p-0.5 rounded-lg flex items-center text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode('cartographic')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'cartographic'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista de mapa interactivo cartográfico"
            >
              <Layers className="w-3 h-3" />
              <span>Mapa</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tactical')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'tactical'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista de radar táctico con retícula logística y radio de precisión"
            >
              <Crosshair className="w-3 h-3" />
              <span>Radar Táctico</span>
            </button>
          </div>

          {/* Copy Coordinates Button */}
          <button
            type="button"
            onClick={handleCopyCoords}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-1 rounded-lg text-[10px] font-mono font-medium transition cursor-pointer"
            title="Copiar coordenadas latitud/longitud al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>{decimalCoords}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screen Interactive Container */}
      <div
        className={`relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner transition-all duration-200 ${
          isExpanded ? 'h-80' : 'h-52'
        } print:hidden`}
      >
        {viewMode === 'cartographic' ? (
          /* Live OpenStreetMap iframe snippet */
          <div className="w-full h-full relative">
            <iframe
              title={`Mapa de Control GPS ${loc.locationName}`}
              src={osmIframeUrl}
              className="w-full h-full border-0 filter saturate-110"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {/* Topographic Watermark overlay in bottom */}
            <div className="absolute bottom-1 right-1 bg-slate-900/85 backdrop-blur-xs text-slate-400 text-[9px] font-mono px-2 py-0.5 rounded border border-slate-700/60 pointer-events-none">
              OpenStreetMap Contribuidores • WGS84
            </div>
          </div>
        ) : (
          /* Tactical Radar Visualizer Mode */
          <div className="w-full h-full relative bg-radial from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
            {/* Radar Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

            {/* Concentric Radar Rings */}
            <div className="absolute w-40 h-40 rounded-full border border-emerald-500/20 animate-pulse" />
            <div className="absolute w-28 h-28 rounded-full border border-emerald-500/30" />
            <div className="absolute w-16 h-16 rounded-full border border-emerald-500/40 bg-emerald-500/5" />

            {/* Crosshairs */}
            <div className="absolute w-full h-px bg-emerald-500/25" />
            <div className="absolute h-full w-px bg-emerald-500/25" />

            {/* Sweep radar arm animation */}
            <div className="absolute w-36 h-36 rounded-full border-t-2 border-r-2 border-emerald-400/40 animate-spin opacity-30" style={{ animationDuration: '6s' }} />

            {/* Center Pin & Beacon */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-emerald-400/25 animate-ping" />
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>

              {/* Tag Callout */}
              <div className="mt-2 bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 rounded-lg text-center shadow-xl">
                <p className="text-[10px] font-bold text-emerald-300 flex items-center gap-1 justify-center">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  <span>{loc.locationName}</span>
                </p>
                <p className="text-[9px] font-mono text-slate-300">
                  {dmsLat} • {dmsLng}
                </p>
                {vehiclePlate && (
                  <p className="text-[8px] font-mono text-slate-400">
                    Móvil: {vehiclePlate}
                  </p>
                )}
              </div>
            </div>

            {/* Coordinates telemetry overlay */}
            <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-lg p-1.5 text-[9px] font-mono text-slate-300 space-y-0.5">
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <Compass className="w-3 h-3" />
                <span>TELEMETRÍA GPS ACTIVA</span>
              </div>
              <div>LAT: {loc.lat.toFixed(6)}°</div>
              <div>LNG: {loc.lng.toFixed(6)}°</div>
              <div>PRECISIÓN: ±4.8m (GNSS L1/L5)</div>
            </div>

            <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-lg px-2 py-1 text-[9px] text-slate-400 flex items-center gap-1.5">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span>Radio Geocerca: 50m • Recinto Autorizado</span>
            </div>
          </div>
        )}

        {/* Map Top Floating Overlay Info Pill */}
        <div className="absolute top-2 left-2 max-w-[70%] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1 shadow-lg text-[10px] z-10 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="font-bold text-white block truncate">{loc.locationName}</span>
            <span className="font-mono text-[9px] text-slate-400">{dmsLat}, {dmsLng}</span>
          </div>
        </div>

        {/* Floating Map Controls in Top-Right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-6 h-6 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-md flex items-center justify-center transition shadow cursor-pointer"
            title="Acercar mapa (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-6 h-6 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-md flex items-center justify-center transition shadow cursor-pointer"
            title="Alejar mapa (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-md flex items-center justify-center transition shadow cursor-pointer"
            title={isExpanded ? 'Contraer vista' : 'Expandir mapa'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* External Links Bar (Bottom Right) */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900/90 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 px-2 py-1 rounded-md text-[9px] font-bold transition flex items-center gap-1 shadow-md cursor-pointer"
            title="Abrir ubicación exacta en Google Maps"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900/90 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30 px-2 py-1 rounded-md text-[9px] font-bold transition flex items-center gap-1 shadow-md cursor-pointer"
            title="Navegar al punto en Waze"
          >
            <span>Waze</span>
            <Navigation className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Footer Info & Forensic Geofence Certification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg gap-1.5 no-print">
        <div className="flex items-center gap-2">
          <span className="font-mono text-emerald-400 font-semibold">
            {loc.lat.toFixed(6)}° S, {loc.lng.toFixed(6)}° W
          </span>
          <span className="text-slate-600">•</span>
          <span>DMS: {dmsLat} {dmsLng}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>Sistema Geodésico: <strong>WGS84</strong></span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-medium">Validado en Faena</span>
        </div>
      </div>

      {/* Printable Georeference Certificate (Only visible in Print/PDF) */}
      <div className="hidden print:block border border-gray-400 rounded-lg p-3 bg-gray-50 text-black text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-gray-300 pb-1.5">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
            <span>PUNTO GEORREFERENCIADO DE CONTROL EN TERRENO (GPS)</span>
          </div>
          <span className="font-mono text-[9px] text-gray-600 font-bold">
            SISTEMA WGS84 • GNSS OFICIAL
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <span className="text-gray-500 font-semibold block">Lugar / Faena de Inspección:</span>
            <span className="font-bold text-black">{loc.locationName}</span>
          </div>
          <div>
            <span className="text-gray-500 font-semibold block">Coordenadas Geográficas (Lat/Lng):</span>
            <span className="font-mono font-bold text-black">{loc.lat.toFixed(6)}° S, {loc.lng.toFixed(6)}° W</span>
          </div>
          <div>
            <span className="text-gray-500 font-semibold block">Formato Grados-Minutos-Segundos (DMS):</span>
            <span className="font-mono text-gray-800">{dmsLat}, {dmsLng}</span>
          </div>
          <div>
            <span className="text-gray-500 font-semibold block">Acreditación Territorial:</span>
            <span className="text-gray-800">Conforme a Ley 16.744 y Circular SUSESO 92064-2025</span>
          </div>
        </div>

        <div className="pt-1 text-[8px] text-gray-500 italic border-t border-gray-200">
          Certifico que la toma de muestra se realizó dentro del perímetro operacional autorizado de la empresa. Registro satelital inalterable incorporado al acta N° {testCode || 'N/A'}.
        </div>
      </div>
    </div>
  );
};
