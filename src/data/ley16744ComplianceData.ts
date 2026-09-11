import { LegalNormItem } from '../types';

export interface Ley16744ChecklistItem {
  id: string;
  code: string;
  legalBody: string;
  article: string;
  title: string;
  requirement: string;
  applicability: string;
  auditGuideline: string;
  suggestedEvidence: string;
  penaltyRisk: string;
  sourceUrl: string;
  category: 'alcohol_drogas' | 'accidentes_trabajo' | 'enfermedades_profesionales' | 'comites_paritarios' | 'deber_proteccion' | 'mutualidades';
  isMandatory: boolean;
  officialRefYear: number;
}

export interface Ley16744GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
  relevance?: string;
}

export interface Ley16744SearchResult {
  success: boolean;
  query: string;
  summary: string;
  checklistItems: Ley16744ChecklistItem[];
  sources: Ley16744GroundingSource[];
  timestamp: string;
  isGroundedWithGoogleSearch: boolean;
  groundingModel: string;
}

export const OFFICIAL_LEY_16744_CHECKLIST: Ley16744ChecklistItem[] = [
  {
    id: 'chk-16744-01',
    code: 'SUSESO-92064-2025',
    legalBody: 'Dictamen SUSESO',
    article: 'Dictamen N.º 92064-2025 (Julio 2025)',
    title: 'Doctrina de Exámenes Preventivos de Alcohol y Drogas en el Transporte',
    requirement: 'Facultad y deber del empleador bajo la Ley 16.744 y Art. 184 CT de aplicar test de alcohol y drogas en saliva a conductores, bajo 8 principios rectores: finalidad estrictamente preventiva, respeto irrestricto a la dignidad y pudor, no discriminación arbitraria, sorteo aleatorio despersonalizado, proporcionalidad del medio, estricta reserva de datos médicos sensibles (Ley 19.628), cadena de custodia inalterable y derivación a la Mutualidad.',
    applicability: 'Empresas de transporte de carga, pasajeros, buses interurbanos, faenas mineras y distribución urbana.',
    auditGuideline: 'Fiscalizadores de SUSESO y Dirección del Trabajo (DT) verifican que el algoritmo de selección sea pseudoaleatorio no manipulable, exista consentimiento previo en RIOHS y se garantice el derecho a contraprueba en laboratorio acreditado (NCh-ISO 17025).',
    suggestedEvidence: 'Anexo RIOHS con toma de razón DT, Acta Notarial o Algoritmo de Sorteo Verificable, Registro Digital de Consentimiento y Actas de Cadena de Custodia.',
    penaltyRisk: 'Invalidez legal del despido disciplinario por tutela laboral (vulneración de derechos fundamentales), multas DT de hasta 60 UTM y rechazo de cobertura por parte del Organismo Administrador.',
    sourceUrl: 'https://www.suseso.cl/normativa/jurisprudencia/',
    category: 'alcohol_drogas',
    isMandatory: true,
    officialRefYear: 2025
  },
  {
    id: 'chk-16744-02',
    code: 'LEY-16744-ART66',
    legalBody: 'Ley N° 16.744',
    article: 'Art. 66 y DS N° 54',
    title: 'Comité Paritario de Higiene y Seguridad (CPHS) en Faenas de Transporte',
    requirement: 'Toda empresa o faena con más de 25 trabajadores debe contar con CPHS activo. En el transporte de carga y pasajeros, el Comité debe participar en la aprobación del programa de prevención de consumo de sustancias, analizar causas de accidentes vehiculares y supervisar el cumplimiento de los controles pre-turno.',
    applicability: 'Empresas de transporte con más de 25 colaboradores en sus bases o terminales operacionales.',
    auditGuideline: 'La Dirección del Trabajo y el SEREMI de Salud exigen las 12 actas mensuales ordinarias, registro de votación de constitución, nómina de miembros titulares/suplentes y plan anual de trabajo aprobado.',
    suggestedEvidence: 'Libro de Actas CPHS digital o firmado, Certificado de Constitución emitido por DT/Mutualidad y Programa Anual de Prevención de Riesgos.',
    penaltyRisk: 'Multas de 10 a 60 UTM por base o sucursal. Imposibilidad de rebajar la cotización adicional diferenciada ante la Mutualidad.',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=28650',
    category: 'comites_paritarios',
    isMandatory: true,
    officialRefYear: 2024
  },
  {
    id: 'chk-16744-03',
    code: 'CT-ART184',
    legalBody: 'Código del Trabajo',
    article: 'Art. 184 y Art. 184 bis',
    title: 'Deber General de Protección Eficaz y Suspensión de Faena por Riesgo Grave',
    requirement: 'El empleador está legalmente obligado a tomar todas las providencias necesarias para proteger eficazmente la vida y salud de los trabajadores. El Art. 184 bis impone la obligación inmediata de suspender las labores y despachos cuando exista riesgo grave e inminente (p.ej. conductor con hálito alcohólico o reactivo a drogas).',
    applicability: 'Totalidad de las faenas, rutas, terminales de despacho y vehículos de la empresa.',
    auditGuideline: 'En caso de accidente con conductor bajo efectos de sustancias, la DT y Tribunales Laborales evalúan si la empresa tenía un sistema de control previo efectivo. La falta de control constituye negligencia inexcusable del empleador.',
    suggestedEvidence: 'Matriz IPER de Riesgos Viales, Protocolo de Bloqueo Preventivo Inmediato y Registros digitales de Alcotest pre-turno con trazabilidad horaria.',
    penaltyRisk: 'Clausura de garitas/terminales, multas gravísimas de la DT (hasta 60 UTM por trabajador afectado), demandas por daño moral y responsabilidad civil/penal solidaria de la plana ejecutiva.',
    sourceUrl: 'https://www.dt.gob.cl/legislacion/1624/w3-article-95556.html',
    category: 'deber_proteccion',
    isMandatory: true,
    officialRefYear: 2025
  },
  {
    id: 'chk-16744-04',
    code: 'DS-40-ART21-ODI',
    legalBody: 'Decreto Supremo N° 40',
    article: 'Art. 21 Obligación de Informar (ODI / DAS)',
    title: 'Información Oportuna de Riesgos Específicos de Conducción y Consumo',
    requirement: 'Los empleadores tienen la obligación de informar a todos los conductores sobre los riesgos que entrañan sus labores, los métodos de trabajo correctos y las medidas preventivas. Debe detallar explícitamente los efectos de la fatiga, somnolencia, alcohol y psicotrópicos en el tiempo de reacción vehicular.',
    applicability: '100% de los conductores contratados, subcontratados y personal de patio.',
    auditGuideline: 'Se audita que cada carpeta de conductor cuente con el documento ODI firmado digital o físicamente antes del primer turno en carretera, con actualización mínima anual.',
    suggestedEvidence: 'Documentos ODI firmados mediante Firma Electrónica Simple/Avanzada (Ley 19.799) con hash SHA-256 inalterable y fecha cierta.',
    penaltyRisk: 'Pérdida inmediata de juicios laborales de indemnización de perjuicios por accidentes del trabajo (reversión de la carga de la prueba en contra de la empresa).',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=8270',
    category: 'accidentes_trabajo',
    isMandatory: true,
    officialRefYear: 2024
  },
  {
    id: 'chk-16744-05',
    code: 'SUSESO-CIRC3335',
    legalBody: 'Dictámenes SUSESO',
    article: 'Circular N° 3.335 & Compendio Normas Seguro Ley 16.744',
    title: 'Protocolo de Cadena de Custodia y Contraprueba Toxicológica',
    requirement: 'Garantía del debido proceso en la detección de drogas en fluidos orales: toma de muestra en presencia de testigo, uso de sellos numerados de seguridad inviolables, temperatura adecuada de almacenamiento, transporte a laboratorio clínico/toxicológico con acreditación NCh-ISO 17025 y derecho del trabajador a solicitar contraprueba de la alícuota de resguardo.',
    applicability: 'Toda muestra biológica reactiva obtenida en controles preventivos de terreno.',
    auditGuideline: 'Peritajes judiciales y SUSESO exigen la trazabilidad de cada traspaso de la muestra física desde el recolector hasta el director técnico del laboratorio.',
    suggestedEvidence: 'Formulario de Cadena de Custodia Foliado y Digitalizado, Certificado de Acreditación INN del Laboratorio confirmatorio (GC-MS / LC-MS/MS).',
    penaltyRisk: 'Nulidad absoluta del resultado analítico, reincorporación forzosa del conductor desvinculado e indemnizaciones agravadas por daño moral.',
    sourceUrl: 'https://www.suseso.cl/normativa/compendio/',
    category: 'alcohol_drogas',
    isMandatory: true,
    officialRefYear: 2025
  },
  {
    id: 'chk-16744-06',
    code: 'LEY-18290-ART110',
    legalBody: 'Ley N° 18.290 de Tránsito',
    article: 'Art. 110, 111 y Leyes 20.580 / 20.770 (Ley Emilia)',
    title: 'Tolerancia Cero de Alcohol y Estupefacientes para Licencias Profesionales',
    requirement: 'Prohibición taxativa de conducir bajo la influencia del alcohol (desde 0.01 g/L) o en estado de ebriedad (0.8 g/L o superior), así como bajo la influencia de sustancias estupefacientes o psicotrópicas. En el transporte profesional (licencias clases A1, A2, A3, A4, A5), la tolerancia legal y reglamentaria de las empresas es 0.00 g/L.',
    applicability: 'Conductores de vehículos de transporte escolar, de pasajeros, carga general, sobredimensión y sustancias peligrosas.',
    auditGuideline: 'Equipos de control de aliento deben contar con calibración periódica vigente respaldada por laboratorio metrológico reconocido (NCh-ISO 17025 / OIML R 126).',
    suggestedEvidence: 'Certificados de calibración de etilómetros/alcotest con vencimiento menor a 6 meses o 1.000 pruebas, y libro de registros metrológicos.',
    penaltyRisk: 'Cancelación definitiva de la licencia de conducir del chofer, decomiso del vehículo y responsabilidad civil extracontractual solidaria de la empresa ante terceros perjudicados.',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=29708',
    category: 'alcohol_drogas',
    isMandatory: true,
    officialRefYear: 2024
  },
  {
    id: 'chk-16744-07',
    code: 'DS-67-COTIZACION',
    legalBody: 'Decreto Supremo N° 67',
    article: 'Art. 1 al 15 - Evaluación de Siniestralidad Efectiva',
    title: 'Tasa de Siniestralidad Efectiva y Cotización Adicional Diferenciada',
    requirement: 'Cálculo bienal que realizan las Mutualidades (ACHS, Mutual, IST, ISL) sobre los días de licencia laboral y muertes causadas por accidentes del trabajo y de trayecto. Un programa preventivo eficaz permite eximir o rebajar la cotización adicional diferenciada del 0.00% al 3.40% de la planilla de remuneraciones.',
    applicability: 'Gerencia de Finanzas, Recursos Humanos y Prevención de Riesgos de la empresa.',
    auditGuideline: 'Las empresas deben acreditar ante su Mutualidad el funcionamiento continuo del CPHS, Departamento de Prevención y RIOHS actualizado para acceder a exención o rebaja.',
    suggestedEvidence: 'Resolución de Siniestralidad de la Mutualidad, Cartola Médica Histórica y Programa de Control de Pérdidas Operacionales.',
    penaltyRisk: 'Recargo de cotización adicional hasta un 6.80% adicional sobre el total imponible de la empresa en caso de siniestralidad descontrolada.',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=15340',
    category: 'mutualidades',
    isMandatory: true,
    officialRefYear: 2024
  },
  {
    id: 'chk-16744-08',
    code: 'DS-594-ART42',
    legalBody: 'Decreto Supremo N° 594',
    article: 'Art. 42 y Art. 53 - Condiciones Sanitarias y Ergonomía en Faenas',
    title: 'Condiciones Sanitarias Básicas, Hidratación y Descanso de Tripulaciones',
    requirement: 'Disposición de agua potable para consumo en ruta, acceso a servicios higiénicos higienizados en garitas y terminales, y garantía de tiempos de descanso ininterrumpido en viajes de larga distancia para mitigar la fatiga acumulada en cabina.',
    applicability: 'Bases operacionales, garitas de despacho, terminales y literas de tractocamiones.',
    auditGuideline: 'Inspecciones conjuntas de SEREMI de Salud y DT en puntos de relevo de tripulaciones y garitas de descanso.',
    suggestedEvidence: 'Protocolo de Descanso y Bitácoras de Relevo según Art. 25 bis del Código del Trabajo, Resoluciones Sanitarias de Garitas.',
    penaltyRisk: 'Sumarios sanitarios de SEREMI de Salud con multas de hasta 1.000 UTM y paralización de terminales de transbordo.',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=16774',
    category: 'enfermedades_profesionales',
    isMandatory: true,
    officialRefYear: 2024
  }
];

export const LEY_16744_SEARCH_PROMPT_TEMPLATE = `Actúa como el Auditor Jurídico Principal de Seguridad Ocupacional y Compliance Vial de Blindaje Vial SpA en Chile.
El usuario requiere verificar la versión más reciente del checklist normativo de la Ley 16.744 sobre Accidentes del Trabajo y Enfermedades Profesionales, integrando:
1. Dictámenes recientes de la SUSESO (Superintendencia de Seguridad Social), en particular el Dictamen N.º 92064-2025 y las circulares aplicables al control preventivo de drogas y alcohol en conductores de carga y pasajeros.
2. Obligaciones vigentes de la Dirección del Trabajo (DT) respecto al Art. 184 del Código del Trabajo (deber de protección eficaz y Art. 184 bis sobre riesgo grave e inminente).
3. Decretos Supremos complementarios: DS N° 40 (ODI), DS N° 54 (Comités Paritarios de Higiene y Seguridad CPHS), DS N° 67 (Siniestralidad Efectiva y rebaja de cotización adicional) y DS N° 594 (condiciones ergonómicas y descanso).
4. Tolerancia Cero de la Ley de Tránsito N° 18.290 (Art. 110, 111 y Ley Emilia) y la exigencia metrológica de equipos de alcohotest calibrados (NCh-ISO 17025).

Por favor realiza la búsqueda en Google para consultar la normativa chilena vigente en los portales oficiales (suseso.cl, bcn.cl LeyChile, dt.gob.cl, mutualidades ACHS/Mutual/IST).

Estructura tu respuesta en:
1. SÍNTESIS NORMATIVA VINCULANTE: Resumen ejecutivo del estado del arte normativo chileno para flotas y transporte (con énfasis en la obligatoriedad de controles preventivos despersonalizados).
2. CHECKLIST DETALLADO DE CUMPLIMIENTO: Un listado de ítems normativos prioritarios con:
   - Código identificador (p.ej. SUSESO-92064-2025, LEY-16744-ART66, CT-ART184, DS-40-ODI, etc.)
   - Cuerpo legal y artículo
   - Título de la exigencia
   - Requisito obligatorio exacto
   - Pauta de fiscalización SUSESO/DT
   - Evidencia documental exigida (p.ej. Anexo RIOHS, Actas CPHS, Certificado Calibración Dräger)
   - Riesgo sancionatorio o multas asociadas en Chile (UTM o recargo DS 67)
3. FUENTES OFICIALES CITADAS: URLs y resoluciones oficiales encontradas.`;
