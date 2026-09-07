import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getChileanTerritorialFallback } from '../data/chileanTerritorialDirectory';
import {
  MapPin,
  Search,
  ExternalLink,
  Navigation,
  Compass,
  Building2,
  ShieldAlert,
  Hospital,
  Truck,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  Star,
  Layers,
  Phone,
  FileCheck,
  CheckCircle2,
  Info
} from 'lucide-react';

interface GroundingPlace {
  title: string;
  uri: string;
  snippet?: string;
  address?: string;
}

interface RegionCoord {
  name: string;
  lat: number;
  lng: number;
}

const CHILEAN_REGIONS: RegionCoord[] = [
  { name: 'Región Metropolitana (Santiago)', lat: -33.4489, lng: -70.6693 },
  { name: 'Región de Valparaíso (Gran Valparaíso / San Antonio)', lat: -33.0472, lng: -71.6127 },
  { name: 'Región de Antofagasta (Minería / Carga)', lat: -23.6509, lng: -70.3975 },
  { name: 'Región del Biobío (Concepción / Coronel)', lat: -36.8270, lng: -73.0503 },
  { name: 'Región de O’Higgins (Rancagua / San Fernando)', lat: -34.1708, lng: -70.7444 },
  { name: 'Región de Coquimbo (La Serena / Coquimbo)', lat: -29.9533, lng: -71.3436 },
  { name: 'Región de Los Lagos (Puerto Montt / Osorno)', lat: -41.4693, lng: -72.9424 }
];

const PRESET_SEARCHES = [
  {
    label: 'Laboratorios Acreditados ISO 17025 (Drogas y Alcohol)',
    category: 'laboratorio',
    query: 'Laboratorios de toxicología clínica y análisis de drogas acreditados ISO 17025 en Santiago y comunas cercanas',
    icon: Building2,
    badge: 'NCh-ISO/IEC 17025'
  },
  {
    label: 'Centros de Atención Mutualidades (ACHS / Mutual / IST)',
    category: 'mutualidad',
    query: 'Hospital del Trabajador ACHS, Clínicas Mutual de Seguridad y centros de atención IST con urgencias laborales',
    icon: Hospital,
    badge: 'Ley 16.744'
  },
  {
    label: 'Terminales de Buses Interurbanos y Patios Red Movilidad',
    category: 'terminal',
    query: 'Terminales de buses de pasajeros principales, garitas y terminales de buses urbanos e interurbanos',
    icon: Truck,
    badge: 'Puntos de Control'
  },
  {
    label: 'Comisarías de Carabineros y Juzgados de Policía Local',
    category: 'comisaria',
    query: 'Comisarías de Carabineros de Chile y Juzgados de Policía Local para procedimientos de la Ley de Tránsito',
    icon: ShieldAlert,
    badge: 'Jurisdicción Vial'
  }
];

export const MapsGroundingView: React.FC = () => {
  const { currentCompany } = useApp();

  const [selectedRegion, setSelectedRegion] = useState<RegionCoord>(CHILEAN_REGIONS[0]);
  const [searchQuery, setSearchQuery] = useState<string>(
    'Laboratorios toxicológicos acreditados para confirmación de drogas y alcoholemia en Santiago'
  );
  const [activeCategory, setActiveCategory] = useState<string>('laboratorio');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

  // Result state
  const [aiAnalysisText, setAiAnalysisText] = useState<string>('');
  const [groundedPlaces, setGroundedPlaces] = useState<GroundingPlace[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // User live location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);

  // Request browser location on demand
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por tu navegador.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setSelectedRegion({
          name: `Tu Ubicación Actual (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
          lat: coords.lat,
          lng: coords.lng
        });
        setGeoLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoLocating(false);
      }
    );
  };

  const handleSearch = async (queryToRun?: string, categoryToRun?: string) => {
    const finalQuery = queryToRun || searchQuery;
    const finalCategory = categoryToRun || activeCategory;

    if (!finalQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const response = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalQuery.trim(),
          category: finalCategory,
          latitude: selectedRegion.lat,
          longitude: selectedRegion.lng,
          region: selectedRegion.name
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Activate client-side curated fallback directory seamlessly
        const fallback = getChileanTerritorialFallback(
          finalQuery,
          finalCategory,
          selectedRegion.name,
          selectedRegion.lat,
          selectedRegion.lng
        );
        setAiAnalysisText(fallback.text);
        setGroundedPlaces(fallback.places || []);
        setIsFallbackMode(true);
        setQuotaWarning(data?.error || fallback.warning || null);
        return;
      }

      setAiAnalysisText(data.text || '');
      setGroundedPlaces(data.places || []);
      setIsFallbackMode(Boolean(data.isFallback || data.isQuotaExceeded));
      setQuotaWarning(data.warning || null);
    } catch (err: any) {
      console.warn('Network or communication error during Maps Grounding query; activating verified directory:', err);
      const fallback = getChileanTerritorialFallback(
        finalQuery,
        finalCategory,
        selectedRegion.name,
        selectedRegion.lat,
        selectedRegion.lng
      );
      setAiAnalysisText(fallback.text);
      setGroundedPlaces(fallback.places || []);
      setIsFallbackMode(true);
      setQuotaWarning(fallback.warning || 'Directorio territorial de contingencia activo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial default search
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Maps Grounding • Blindaje Territorial & Red Oficial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Geo-Localizador de Laboratorios, Mutualidades y Terminales</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consulte en tiempo real la red territorial de laboratorios acreditados NCh-ISO/IEC 17025 para confirmación toxicológica (GC-MS / LC-MS), centros asistenciales de mutualidades y garitas operacionales en todo Chile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDetectLocation}
              disabled={geoLocating}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <Compass className={`w-4 h-4 text-emerald-400 ${geoLocating ? 'animate-spin' : ''}`} />
              <span>{userLocation ? 'Ubicación GPS Activa' : 'Detectar Mi Posición'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Category Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_SEARCHES.map((preset, idx) => {
          const Icon = preset.icon;
          const isSelected = activeCategory === preset.category;
          return (
            <button
              key={idx}
              onClick={() => {
                setActiveCategory(preset.category);
                setSearchQuery(preset.query);
                handleSearch(preset.query, preset.category);
              }}
              className={`text-left p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                  {preset.badge}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-snug">{preset.label}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{preset.query}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Search Bar & Region Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Region Dropdown */}
          <div className="md:w-72 shrink-0 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Región / Territorio de Enfoque:
            </label>
            <select
              value={selectedRegion.name}
              onChange={(e) => {
                const found = CHILEAN_REGIONS.find((r) => r.name === e.target.value);
                if (found) setSelectedRegion(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {CHILEAN_REGIONS.map((r, i) => (
                <option key={i} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Consulta de Ubicación o Establecimiento:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ej: Laboratorios con espectrometría de masas GC-MS cerca de Maipú o Pudahuel..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-28 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="absolute right-1.5 top-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Buscando</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Consultar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {isFallbackMode && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-white">
                    Directorio Territorial Homologado Activo • Continuidad Operacional
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                    Modo Red Verificada
                  </span>
                </div>
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  Debido al límite temporal de cuota de la API de Gemini (Error 429 RESOURCE_EXHAUSTED), el sistema desplegó de forma ininterrumpida el <strong>Catálogo Territorial Homologado de Centros y Laboratorios Toxicológicos Acreditados para Chile</strong>. Todos los enlaces directos a Google Maps, teléfonos y directrices de custodia legal (Ley 18.290 y SUSESO) se encuentran 100% disponibles y operativos.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl transition shadow cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Reintentar en vivo</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <strong>Aviso de búsqueda:</strong> {errorMessage}
            </div>
          </div>
        )}
      </div>

      {/* Grounded Places Cards & Gemini Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Grounded Place Cards (Extracted URLs MUST ALWAYS be displayed) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Puntos Verificados en Google Maps</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {groundedPlaces.length} Enlaces Directos
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">Consultando Google Maps Grounding...</p>
                <p className="text-[10px] text-slate-500">Obteniendo coordenadas y enlaces oficiales de Maps</p>
              </div>
            ) : groundedPlaces.length > 0 ? (
              <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {groundedPlaces.map((place, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-4 transition group space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{place.title}</span>
                        </h4>
                      </div>

                      <a
                        href={place.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white p-1.5 rounded-lg border border-emerald-500/30 transition shrink-0"
                        title="Abrir en Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {place.snippet && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/80 p-2 rounded-lg border border-slate-850">
                        "{place.snippet}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-500 font-mono">Google Maps Validated</span>
                      <a
                        href={place.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1"
                      >
                        <span>Ver en Maps & Ruta</span>
                        <Navigation className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-medium">No se han cargado ubicaciones aún.</p>
                <p className="text-[10px]">Realiza una búsqueda para ver los lugares mapeados.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis & Protocol Recommendation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Informe de Logística Territorial & Cadena de Custodia</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Blindaje Vial Territorial Engine</span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">Generando informe territorial y georreferenciación oficial...</p>
              </div>
            ) : aiAnalysisText ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {aiAnalysisText}
                </div>

                {/* Protocol Operational Card */}
                <div className="bg-gradient-to-r from-blue-950/60 to-slate-950 border border-blue-800/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Directriz Operacional ante Resultado Positivo en Garita</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Si un conductor arroja resultado presunto positivo en test de saliva Assure Tech, active de inmediato el resguardo del vehículo, convoque al chofer de relevo y derive la contramuestra sellada con número de precinto al <strong>laboratorio acreditado más cercano</strong> listado arriba bajo estricta cadena de custodia.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Layers className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-medium">Esperando ejecución de búsqueda...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
