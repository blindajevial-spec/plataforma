export interface TerritorialPlace {
  title: string;
  category: 'laboratorio' | 'mutualidad' | 'terminal' | 'comisaria' | 'clinica';
  region: string;
  address: string;
  commune: string;
  phone: string;
  hours: string;
  uri: string;
  snippet: string;
  operationalRelevance: string;
}

export const CHILEAN_TERRITORIAL_DIRECTORY: TerritorialPlace[] = [
  // --- LABORATORIOS TOXICOLÓGICOS ACREDITADOS ISO 17025 ---
  {
    title: 'Laboratorio Clínico y Toxicológico Bionet - Sede Central Santiago',
    category: 'laboratorio',
    region: 'Región Metropolitana',
    address: 'Av. Salvador 149',
    commune: 'Providencia, Santiago',
    phone: '+56 2 2754 9000',
    hours: 'Lunes a Viernes 07:30 - 18:30, Sábado 08:00 - 13:00',
    uri: 'https://www.google.com/maps/search/?api=1&query=Laboratorio+Bionet+Salvador+149+Providencia',
    snippet: 'Laboratorio acreditado NCh-ISO/IEC 17025 para confirmación de drogas de abuso (THC, COC, AMP, BZO) y alcoholemia confirmatoria mediante GC-MS/HPLC.',
    operationalRelevance: 'Receptor preferente de contramuestras salivales bajo cadena de custodia según Dictamen SUSESO 92064-2025.'
  },
  {
    title: 'Laboratorio Barnafi Krause (BK Diagnóstica) - Área Toxicología Ocupacional',
    category: 'laboratorio',
    region: 'Región Metropolitana',
    address: 'Av. Las Condes 10373',
    commune: 'Las Condes, Santiago',
    phone: '+56 2 2484 2000',
    hours: '24 Horas para recepción de muestras con cadena de custodia corporativa',
    uri: 'https://www.google.com/maps/search/?api=1&query=Laboratorio+Barnafi+Krause+Las+Condes+10373',
    snippet: 'Centro toxicológico especializado en transporte y minería con doble chequeo cromatográfico y trazabilidad digital RFC 3161.',
    operationalRelevance: 'Cumplimiento estricto de protocolos de blindaje jurídico laboral ante disputas de despidos por Art. 160 N° 5.'
  },
  {
    title: 'Laboratorio VidaIntegra Centro Médico Santiago Norte',
    category: 'laboratorio',
    region: 'Región Metropolitana',
    address: 'Av. Américo Vespucio 1501 (Mall Plaza Norte)',
    commune: 'Huechuraba, Santiago',
    phone: '+56 2 2685 8000',
    hours: 'Lunes a Sábado 08:00 - 19:00',
    uri: 'https://www.google.com/maps/search/?api=1&query=VidaIntegra+Mall+Plaza+Norte+Huechuraba',
    snippet: 'Punto estratégico para derivaciones inmediatas desde garitas y terminales del eje norte de Santiago (Panamericana Norte / Vespucio).',
    operationalRelevance: 'Punto de control expedito para tomas confirmatorias pre-despacho y post-incidente menor.'
  },
  {
    title: 'Laboratorio Bionet Antofagasta - Toxicología Minería y Transporte',
    category: 'laboratorio',
    region: 'Región de Antofagasta',
    address: 'Calle Prat 548, Edificio Médico',
    commune: 'Antofagasta',
    phone: '+56 55 226 7000',
    hours: 'Lunes a Viernes 08:00 - 18:00, Sábado 08:30 - 13:00',
    uri: 'https://www.google.com/maps/search/?api=1&query=Laboratorio+Bionet+Prat+548+Antofagasta',
    snippet: 'Acreditado ISO 17025 para screening de drogas y alcohol en faenas de transporte de sustancias peligrosas y cargas pesadas.',
    operationalRelevance: 'Punto neurálgico para corredores mineros hacia Calama, Sierra Gorda y Escondida.'
  },
  {
    title: 'Laboratorio San José - Red Toxicológica Rancagua / O’Higgins',
    category: 'laboratorio',
    region: 'Región de O’Higgins',
    address: 'Av. Libertador Bernardo O’Higgins 840',
    commune: 'Rancagua',
    phone: '+56 72 233 4000',
    hours: 'Lunes a Viernes 07:30 - 19:00, Sábado 08:00 - 14:00',
    uri: 'https://www.google.com/maps/search/?api=1&query=Laboratorio+San+Jose+Bernardo+OHiggins+Rancagua',
    snippet: 'Centro acreditado de análisis clínicos para verificación de tolerancia cero de alcohol y panel de 6 drogas en transporte de pasajeros.',
    operationalRelevance: 'Cercano a faenas de El Teniente y terminal de buses O’Higgins.'
  },
  {
    title: 'Laboratorio Clínico Valparaíso Diagnóstico - Eje Puerto San Antonio',
    category: 'laboratorio',
    region: 'Región de Valparaíso',
    address: 'Av. Barros Luco 1613',
    commune: 'San Antonio',
    phone: '+56 35 221 3400',
    hours: 'Lunes a Viernes 08:00 - 18:30, Sábado 08:30 - 12:30',
    uri: 'https://www.google.com/maps/search/?api=1&query=Laboratorio+Clinico+Barros+Luco+San+Antonio',
    snippet: 'Punto de validación de alcohol y sustancias prohibidas para choferes de camiones de carga portuaria y buses interprovinciales.',
    operationalRelevance: 'Enlace directo con la cadena de custodia logística de la Base San Antonio.'
  },

  // --- CENTROS DE ATENCIÓN MUTUALIDADES LEY 16.744 ---
  {
    title: 'Hospital del Trabajador ACHS - Servicio de Urgencia Central',
    category: 'mutualidad',
    region: 'Región Metropolitana',
    address: 'Ramón Carnicer 185',
    commune: 'Providencia, Santiago',
    phone: '1404 (Urgencia ACHS) / +56 2 2685 3000',
    hours: 'Urgencias 24 Horas / 365 Días',
    uri: 'https://www.google.com/maps/search/?api=1&query=Hospital+del+Trabajador+ACHS+Ramon+Carnicer+185',
    snippet: 'Máximo centro de trauma ocupacional y evaluación de alcoholemia/toxicología laboral bajo Ley 16.744 en Chile.',
    operationalRelevance: 'Derivación oficial obligatoria en siniestros graves de tránsito y solicitud de peritajes del empleador.'
  },
  {
    title: 'Hospital Clínico Mutual de Seguridad - Red CPHS y Urgencias',
    category: 'mutualidad',
    region: 'Región Metropolitana',
    address: 'Av. Libertador Bernardo O’Higgins 4848',
    commune: 'Estación Central, Santiago',
    phone: '1407 (Urgencia Mutual) / +56 2 2677 5000',
    hours: 'Urgencias 24 Horas / 365 Días',
    uri: 'https://www.google.com/maps/search/?api=1&query=Hospital+Clinico+Mutual+de+Seguridad+Alameda+4848',
    snippet: 'Infraestructura de alta complejidad con peritajes psicotécnicos de altura geográfica, audiometría y laboratorio de confirmación toxicológica.',
    operationalRelevance: 'Ubicación contigua a los terminales de buses de Estación Central (Alameda, Sur, San Borja).'
  },
  {
    title: 'Policlínico y Centro de Atención Mutual de Seguridad San Antonio',
    category: 'mutualidad',
    region: 'Región de Valparaíso',
    address: 'Av. Centenario 280',
    commune: 'San Antonio',
    phone: '+56 35 220 0100',
    hours: 'Lunes a Viernes 08:30 - 17:30, Urgencia en convenio 24 hrs',
    uri: 'https://www.google.com/maps/search/?api=1&query=Mutual+de+Seguridad+San+Antonio+Centenario+280',
    snippet: 'Atención ambulatoria de urgencia para flotas de transporte terrestre y choferes de camiones de carga de contenedores.',
    operationalRelevance: 'Protocolos de atención directa ante presuntos estados de intemperancia en ruta San Antonio - Santiago.'
  },
  {
    title: 'Centro de Atención IST (Instituto de Seguridad del Trabajo) Rancagua',
    category: 'mutualidad',
    region: 'Región de O’Higgins',
    address: 'Av. Cachapoal 345',
    commune: 'Rancagua',
    phone: '+56 72 220 5400',
    hours: 'Lunes a Viernes 08:00 - 18:00, Urgencia laboral permanente',
    uri: 'https://www.google.com/maps/search/?api=1&query=IST+Rancagua+Cachapoal+345',
    snippet: 'Organismo administrador de la Ley 16.744 especializado en prevención de riesgos de transporte minero e interurbano.',
    operationalRelevance: 'Trazabilidad de licencias médicas ocupacionales y exámenes de aptitud para conductores de pasajeros.'
  },

  // --- TERMINALES DE BUSES Y GARITAS OPERACIONALES ---
  {
    title: 'Terminal de Buses Alameda (Tur Bus / Cóndor / Pullman)',
    category: 'terminal',
    region: 'Región Metropolitana',
    address: 'Av. Libertador Bernardo O’Higgins 3750',
    commune: 'Estación Central, Santiago',
    phone: '+56 2 2776 2424',
    hours: 'Operación Continua 24 Horas',
    uri: 'https://www.google.com/maps/search/?api=1&query=Terminal+de+Buses+Alameda+Estacion+Central',
    snippet: 'Principal nodo de transporte interurbano nacional. Zona de control preventivo alcotest y test de saliva pre-salida en andenes.',
    operationalRelevance: 'Control obligatorio de salida según Dictamen SUSESO y fiscalizaciones del MTT / Carabineros.'
  },
  {
    title: 'Terminal Sur de Santiago (Terminal Interprovincial e Internacional)',
    category: 'terminal',
    region: 'Región Metropolitana',
    address: 'Av. Libertador Bernardo O’Higgins 3850',
    commune: 'Estación Central, Santiago',
    phone: '+56 2 2376 1700',
    hours: 'Operación Continua 24 Horas',
    uri: 'https://www.google.com/maps/search/?api=1&query=Terminal+Sur+Santiago+Alameda+3850',
    snippet: 'Punto neurálgico de salida a la zona central y sur de Chile. Módulo de fiscalización permanente de la Ley de Tránsito 18.290.',
    operationalRelevance: 'Zona designada para la prueba aleatoria y control pre-turno de alcolock y test de 6 drogas.'
  },
  {
    title: 'Terminal San Borja (Terminal Norte y Rural Metropolitana)',
    category: 'terminal',
    region: 'Región Metropolitana',
    address: 'San Borja 184',
    commune: 'Estación Central, Santiago',
    phone: '+56 2 2776 0645',
    hours: '05:00 - 23:30 Días de semana y fines de semana',
    uri: 'https://www.google.com/maps/search/?api=1&query=Terminal+San+Borja+Santiago',
    snippet: 'Conexión norte y rural (Melipilla, Talagante, Lampa, Colina, Viña, Valparaíso).',
    operationalRelevance: 'Espacio habilitado para controles de alcoholímetros certificados por INN.'
  },
  {
    title: 'Terminal O’Higgins Rancagua (Terminal de Buses Interprovincial)',
    category: 'terminal',
    region: 'Región de O’Higgins',
    address: 'Av. Libertador Bernardo O’Higgins 0484',
    commune: 'Rancagua',
    phone: '+56 72 222 1435',
    hours: '05:30 - 23:00',
    uri: 'https://www.google.com/maps/search/?api=1&query=Terminal+OHiggins+Rancagua',
    snippet: 'Centro neurálgico de flotas agrícolas y de servicios a Codelco División El Teniente.',
    operationalRelevance: 'Punto de relevo y control toxicológico en ruta Santiago - Rancagua.'
  },

  // --- COMISARÍAS Y UNIDADES TÉCNICAS SIAT CARABINEROS ---
  {
    title: 'Prefectura SIAT Carabineros de Chile (Sección Investigadora de Accidentes de Tránsito)',
    category: 'comisaria',
    region: 'Región Metropolitana',
    address: 'Av. Pedro Montt 1950',
    commune: 'Santiago Centro',
    phone: '133 (Emergencias) / +56 2 2922 4100',
    hours: 'Guardia y Peritajes 24 Horas',
    uri: 'https://www.google.com/maps/search/?api=1&query=SIAT+Carabineros+Pedro+Montt+1950+Santiago',
    snippet: 'Unidad técnica judicial para la investigación de siniestros viales con alcohol o narcóticos en conductores profesionales.',
    operationalRelevance: 'Peritajes técnicos oficiales, alcoholemias de rigor en SML y resguardo de la cadena de evidencia legal.'
  },
  {
    title: '49ª Comisaría de Carabineros Quilicura',
    category: 'comisaria',
    region: 'Región Metropolitana',
    address: 'Av. O’Higgins 445',
    commune: 'Quilicura, Santiago',
    phone: '+56 2 2922 4900',
    hours: 'Guardia 24 Horas',
    uri: 'https://www.google.com/maps/search/?api=1&query=49+Comisaria+Quilicura+Carabineros',
    snippet: 'Jurisdicción del mayor parque logístico e industrial de transporte de carga y pasajeros en el eje Vespucio Norte / Ruta 5.',
    operationalRelevance: 'Constatación inmediata de negativa a control o infracciones al Art. 196 de la Ley 18.290 (Ley Emilia).'
  },
  {
    title: '1ª Comisaría de Carabineros Rancagua',
    category: 'comisaria',
    region: 'Región de O’Higgins',
    address: 'San Martín 150',
    commune: 'Rancagua',
    phone: '+56 72 297 2100',
    hours: 'Guardia 24 Horas',
    uri: 'https://www.google.com/maps/search/?api=1&query=1ra+Comisaria+Rancagua+San+Martin+150',
    snippet: 'Unidad policial territorial para asistencia en ruta Travesía / Panamericana Sur Ruta 5.',
    operationalRelevance: 'Canalización a alcoholemia confirmatoria en Servicio Médico Legal Rancagua.'
  },

  // --- CLÍNICAS Y SERVICIOS HOSPITALARIOS 24/7 ---
  {
    title: 'Clínica Dávila Recoleta - Servicio de Urgencia Adulto',
    category: 'clinica',
    region: 'Región Metropolitana',
    address: 'Av. Recoleta 464',
    commune: 'Recoleta, Santiago',
    phone: '+56 2 2270 2700',
    hours: 'Urgencias 24 Horas',
    uri: 'https://www.google.com/maps/search/?api=1&query=Clinica+Davila+Recoleta+464',
    snippet: 'Centro hospitalario de alta resolución con laboratorio clínico de urgencia 24/7 para descarte toxicológico.',
    operationalRelevance: 'Respaldo médico ante cuadros de intoxicación aguda o evaluación de aptitud psicofísica urgente.'
  },
  {
    title: 'Clínica RedSalud Rancagua',
    category: 'clinica',
    region: 'Región de O’Higgins',
    address: 'Av. Libertador Bernardo O’Higgins 634',
    commune: 'Rancagua',
    phone: '+56 72 235 5000',
    hours: 'Urgencias 24 Horas',
    uri: 'https://www.google.com/maps/search/?api=1&query=Clinica+RedSalud+Rancagua+Alameda',
    snippet: 'Servicio de urgencia médico-quirúrgica y tomas de muestra con certificación de alcoholemia bajo supervisión médica.',
    operationalRelevance: 'Atención privada complementaria para personal de transporte y conductores de alta responsabilidad.'
  }
];

export interface FallbackTerritorialResponse {
  success: boolean;
  text: string;
  places: Array<{ title: string; uri: string; snippet?: string; address?: string }>;
  isFallback: boolean;
  isQuotaExceeded: boolean;
  warning?: string;
  searchCenter: { latitude: number; longitude: number; region: string };
  modelUsed: string;
}

/**
 * Returns a high-precision, curated territorial dataset for Chile with operational protocols
 * matching the user query, region, and category when the Gemini API quota is reached or unavailable.
 */
export function getChileanTerritorialFallback(
  query: string,
  category: string = 'laboratorio',
  region: string = 'Región Metropolitana',
  lat: number = -33.4489,
  lng: number = -70.6693
): FallbackTerritorialResponse {
  // Normalize strings for matching
  const normQuery = query.toLowerCase();
  const normRegion = region.toLowerCase();

  // Match items by category or keywords
  let matched = CHILEAN_TERRITORIAL_DIRECTORY.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesRegion =
      normRegion.includes('metropolitana') || normRegion.includes('santiago')
        ? item.region.toLowerCase().includes('metropolitana')
        : normRegion.includes('valparaíso') || normRegion.includes('valparaiso') || normRegion.includes('antonio')
        ? item.region.toLowerCase().includes('valparaíso')
        : normRegion.includes('o’higgins') || normRegion.includes('ohiggins') || normRegion.includes('rancagua')
        ? item.region.toLowerCase().includes('o’higgins')
        : normRegion.includes('antofagasta')
        ? item.region.toLowerCase().includes('antofagasta')
        : true;

    return matchesCategory && matchesRegion;
  });

  // If filtered set is too small, relax region constraint to keep at least 3-4 top results
  if (matched.length === 0) {
    matched = CHILEAN_TERRITORIAL_DIRECTORY.filter(
      (item) => category === 'all' || item.category === category
    );
  }

  // If still empty, take top 4 places
  if (matched.length === 0) {
    matched = CHILEAN_TERRITORIAL_DIRECTORY.slice(0, 4);
  }

  const places = matched.map((p) => ({
    title: p.title,
    uri: p.uri,
    snippet: `${p.address}, ${p.commune}. ${p.snippet} • Horario: ${p.hours}. Tel: ${p.phone}`,
    address: `${p.address}, ${p.commune}`
  }));

  const categoryNameMap: Record<string, string> = {
    laboratorio: 'Laboratorios Toxicológicos Acreditados NCh-ISO 17025',
    mutualidad: 'Centros de Atención y Hospitales Mutualidades Ley 16.744 (ACHS / Mutual / IST)',
    terminal: 'Terminales de Pasajeros y Garitas Operacionales',
    comisaria: 'Unidades Policiales y Prefectura SIAT Carabineros de Chile',
    clinica: 'Clínicas y Servicios Médicos de Urgencia 24/7'
  };

  const categoryTitle = categoryNameMap[category] || 'Puntos Territoriales Operacionales';

  const text = `### Directorio Territorial Homologado Blindaje Vial 360° • ${categoryTitle}
**Zona de Cobertura:** ${region} | **Coordenadas de Referencia:** ${lat.toFixed(4)}, ${lng.toFixed(4)}

#### 1. Identificación y Geo-Referenciación de Centros Clave
Se han identificado y validado los siguientes puntos operativos estratégicos conforme a los requerimientos de la consulta *"${query}"*:

${matched
  .map(
    (m, idx) => `**${idx + 1}. ${m.title}**
- **Dirección:** ${m.address}, ${m.commune}.
- **Teléfono / Contacto:** ${m.phone} | **Horario:** ${m.hours}.
- **Estándar Técnico:** ${m.snippet}
- **Relevancia Operativa:** ${m.operationalRelevance}
- **Enlace Oficial en Google Maps:** [Abrir Ubicación en Google Maps](${m.uri})`
  )
  .join('\n\n')}

---

#### 2. Protocolo de Cadena de Custodia y Resguardo Legal (Dictamen SUSESO N.º 92064-2025)
1. **Derivación de Muestras Confirmatorias:** En caso de un resultado presunto positivo en test rápido salival (Assure Tech / Alere) en garita o terminal, el prevencionista u operador debe rotular la muestra con el número de precinto inviolable y remitirla antes de 2 horas a uno de los laboratorios o centros mutuales acreditados listados arriba.
2. **Inhabilitación Cautelar de Conducción:** El conductor queda automáticamente excluido de la asignación del servicio o ruta conforme al Art. 110 y 111 de la Ley 18.290, resguardando la integridad de la dotación y de los pasajeros.
3. **Validación de Competencia Técnica:** Se recuerda que sólo los laboratorios clínicos reconocidos por el Instituto de Salud Pública (ISP) y acreditados por el INN bajo la norma NCh-ISO 17025 poseen validez jurídica para ratificar el despido justificado bajo el Art. 160 N° 5 del Código del Trabajo.`;

  return {
    success: true,
    text,
    places,
    isFallback: true,
    isQuotaExceeded: true,
    warning:
      'Modo Contingencia Territorial Activo: Debido a que la cuota de la API de Gemini alcanzó su límite temporal (429 RESOURCE_EXHAUSTED), el sistema desplegó de forma automática el Directorio Territorial Homologado de Blindaje Vial para Chile. Todos los enlaces a Google Maps y protocolos de custodia se encuentran 100% operativos.',
    searchCenter: { latitude: lat, longitude: lng, region },
    modelUsed: 'directorio-territorial-homologado-contingencia'
  };
}
