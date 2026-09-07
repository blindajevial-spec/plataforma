export interface ManualSection {
  id: string;
  title: string;
  legalBasis?: string;
  content: string;
  practicalTakeaway?: string;
  standardClause?: string;
  checklist?: string[];
  formTemplate?: {
    code: string;
    name: string;
    purpose: string;
    fields: { label: string; type: string; placeholder?: string; required: boolean }[];
  };
  flowchartSteps?: { step: number; title: string; action: string; actor: string }[];
}

export interface ManualTomo {
  id: string;
  tomoNumber: string;
  romanNumber: string;
  title: string;
  subtitle: string;
  pageRange: string;
  totalPages: number;
  summary: string;
  iconName: string;
  badge: string;
  sections: ManualSection[];
}

export const DICTAMEN_SUSESO_SUMMARY = {
  dictamenNumber: 'Dictamen N.º 92064-2025',
  institution: 'Superintendencia de Seguridad Social (SUSESO)',
  issueDate: '2 de julio de 2025',
  legalSubject: 'Exámenes preventivos de alcohol y drogas en trabajadores bajo la Ley N.º 16.744 y deber de protección eficaz del empleador',
  relevance: 'Criterio vinculante y pilar técnico-jurídico para empresas de transporte de carga, pasajeros, minería, puertos y sustancias peligrosas en Chile.',
  corePrinciples: [
    {
      name: 'Finalidad Exclusivamente Preventiva',
      desc: 'El control debe estar orientado a la seguridad laboral y prevención de accidentes (Art. 184 Código del Trabajo), no como mecanismo disciplinario o sanción encubierta.'
    },
    {
      name: 'Respeto a la Dignidad y Privacidad',
      desc: 'Garantía del pudor y dignidad del trabajador durante la toma de muestras de saliva o aire espirado, en recintos reservados y despersonalizados.'
    },
    {
      name: 'Igualdad y No Discriminación',
      desc: 'Prohibición de sesgos personales, persecución sindical o selección arbitraria. Aplicación general e igualitaria a todas las funciones críticas.'
    },
    {
      name: 'Objetividad y Despersonalización (Sorteo Aleatorio)',
      desc: 'Mecanismos de selección matemática verificable con algoritmo criptográfico o controles universales de pre-turno en garita de salida.'
    },
    {
      name: 'Proporcionalidad y Razonabilidad',
      desc: 'Adecuación de los métodos de control a la gravedad del riesgo inherente a la conducción de vehículos de alto tonelaje o transporte de pasajeros.'
    },
    {
      name: 'Confidencialidad y Reserva Médica (Ley 19.628)',
      desc: 'Los resultados constituyen datos sensibles de salud y solo pueden ser tratados por personal de salud, prevención o comités autorizados.'
    },
    {
      name: 'Trazabilidad y Cadena de Custodia Inalterable',
      desc: 'Todo resultado presunto positivo debe ser preservado y remitido a laboratorio toxicológico certificado (GC-MS / LC-MS/MS) con derecho a contraprueba.'
    },
    {
      name: 'Integración al Sistema Preventivo & Mutualidades',
      desc: 'Coordinación directa con el organismo administrador de la Ley 16.744 (Mutual de Seguridad, ACHS, IST, ISL) para vigilancia médica y reintegro.'
    }
  ]
};

export const MANUAL_COMPLIANCE_TOMOS: ManualTomo[] = [
  {
    id: 'tomo-01',
    tomoNumber: 'TOMO I',
    romanNumber: 'I',
    title: 'Marco Legal & Jurisprudencia Laboral Chilena',
    subtitle: 'Constitución Política, Código del Trabajo, Ley 16.744, Dictamen SUSESO 92064-2025 y Normativa MTT',
    pageRange: 'Págs. 1 - 32',
    totalPages: 32,
    summary: 'Fundamentación dogmática y jurisprudencial que legitima los controles preventivos de alcohol y drogas, armonizando el deber de protección patronal con los derechos fundamentales de los trabajadores.',
    iconName: 'Scale',
    badge: 'DOCTRINA & DERECHO',
    sections: [
      {
        id: 'sec-1-1',
        title: '1.1 Fundamentación Constitucional y Deber General de Protección (Art. 184 CT)',
        legalBasis: 'Constitución Política Art. 19 N° 1 y 4; Código del Trabajo Art. 184; Ley 16.744 Art. 66/67; Dictamen SUSESO N.º 92064-2025.',
        content: `El ordenamiento jurídico chileno impone al empleador una obligación de resultado calificada a través del artículo 184 del Código del Trabajo: "El empleador estará obligado a tomar todas las medidas necesarias para proteger eficazmente la vida y salud de los trabajadores".

En actividades de alto riesgo como el transporte de pasajeros, transporte interurbano, transporte escolar, carga pesada, minería y sustancias peligrosas (Decreto Supremo 298), la omisión de controles de intemperancia constituye una negligencia inexcusable ("falta de servicio o culpa levísima") imputable directamente a la empresa ante tribunales civiles y laborales.

El Dictamen N.º 92064-2025 de la SUSESO (2 de julio de 2025) ratifica de manera concluyente que la realización de pruebas de alcohol y drogas no solo es una potestad permitida, sino una exigencia ineludible del sistema de gestión preventiva bajo la Ley N.º 16.744.`,
        practicalTakeaway: 'Blindaje Vial 360 dota a la empresa de una cobertura jurídica inexpugnable, demostrando la diligencia debida del empleador en sede laboral, civil y administrativa.'
      },
      {
        id: 'sec-1-2',
        title: '1.2 Los 8 Principios Rectores del Dictamen SUSESO 92064-2025',
        legalBasis: 'Dictamen SUSESO 92064-2025 Párrafos 3, 4 y 5; Ley 16.395 Orgánica de la SUSESO.',
        content: `La Superintendencia fijó el estándar de validez que deben cumplir todos los programas de control de alcohol y drogas en Chile:
1. Finalidad Exclusivamente Preventiva: El control busca evitar accidentes de tránsito y salvar vidas en faena.
2. Respeto Irrestricto a la Dignidad: Tomas de muestra no invasivas (saliva / aire espirado) en espacios privados.
3. No Discriminación ni Persecución: Prohibición expresa de someter a prueba a un trabajador por razones sindicales, políticas o de represalia.
4. Selección Objetiva y Despersonalizada: Sorteo aleatorio inopinado o control 100% universal en garitas.
5. Proporcionalidad: Métodos técnicos idóneos con equipos evidenciales de precisión metrológica.
6. Protección de Datos Sensibles (Ley 19.628): Prohibición de publicar listas de resultados en paneles públicos; manejo con reserva médica.
7. Cadena de Custodia Inalterable: Garantía de trazabilidad estricta y derecho a contramuestra en laboratorio de referencia.
8. Articulación con Mutualidades: Obligación de derivar casos positivos a los organismos administradores (ACHS, Mutual CChC, IST, ISL) para evaluación de salud ocupacional.`,
        practicalTakeaway: 'Toda empresa de transporte debe someter su programa preventivo a una lista de chequeo de estos 8 principios antes de cada auditoría.'
      },
      {
        id: 'sec-1-3',
        title: '1.3 Normativa del Ministerio de Transportes (MTT) y Leyes Viales',
        legalBasis: 'Ley 18.290 de Tránsito Art. 110 y 111; Ley 20.580 (Tolerancia Cero); Ley Emilia 20.770; DS 212 / DS 80 MTT.',
        content: `Para la conducción profesional de vehículos de transporte en Chile:
- La Ley 20.580 consagra la Tolerancia Cero absoluta para conductores profesionales (0.00 g/L). Cualquier traza de alcohol superior a 0.00 g/L inhabilita legalmente la conducción.
- La Ley 20.770 (Ley Emilia) sanciona penalmente la conducción con resultado lesivo o con negativa injustificada a someterse a pruebas de alcotest o narcotest practicadas por la autoridad o en recintos laborales autorizados.
- Los decretos del MTT exigen que las empresas operadoras garanticen condiciones psicofísicas idóneas de sus tripulaciones antes de la expedición de cada orden de servicio o despacho de máquina.`,
        practicalTakeaway: 'Un resultado superior a 0.00 g/L en alcoholimetría detiene de inmediato el despacho y activa el bloqueo preventivo del conductor.'
      }
    ]
  },
  {
    id: 'tomo-02',
    tomoNumber: 'TOMO II',
    romanNumber: 'II',
    title: 'Sistema de Gestión, Política Corporativa & Matriz IPER',
    subtitle: 'Objetivos estratégicos, roles, matriz de riesgos de intemperancia, cargos críticos y KPIs',
    pageRange: 'Págs. 33 - 60',
    totalPages: 28,
    summary: 'Diseño estructural del Sistema de Gestión de Prevención de Alcohol y Drogas bajo los estándares ISO 39001 (Seguridad Vial) e ISO 37301 (Compliance).',
    iconName: 'Building2',
    badge: 'SISTEMA DE GESTIÓN',
    sections: [
      {
        id: 'sec-2-1',
        title: '2.1 Política Corporativa de Tolerancia Cero al Alcohol y Sustancias Psicotrópicas',
        legalBasis: 'Estándar ISO 39001 Cláusula 5.2; ISO 37301 Cláusula 5.2; Código del Trabajo Art. 154 N° 5.',
        content: `La Política Corporativa de Blindaje Vial 360 es la declaración formal y vinculante suscrita por la Alta Dirección de la empresa, orientada a erradicar cualquier riesgo derivado del consumo de alcohol y drogas en el transporte.

Pilares Fundamentales de la Política:
a) Prohibición absoluta de ingresar a dependencias o conducir vehículos bajo la influencia del alcohol o bajo el efecto de sustancias estupefacientes o psicotrópicas ilícitas.
b) Obligación del conductor de declarar previamente el consumo de fármacos prescritos que puedan alterar los reflejos (ej. benzodiacepinas, antihistamínicos sedantes, relajantes musculares).
c) Compromiso con el programa de capacitación, evaluaciones aleatorias y programas de rehabilitación en conjunto con la mutualidad adherida.`,
        standardClause: `DECLARACIÓN DE POLÍTICA CORPORATIVA DE PREVENCIÓN:
"Transportes [NOMBRE EMPRESA], en cumplimiento de su deber de protección eficaz de la vida humana y en conformidad con el Dictamen N.º 92064-2025 de la SUSESO, declara una Política de Tolerancia Cero (0.00 g/L de alcohol y negatividad total en paneles toxicológicos) para toda su dotación de conductores, operadores de maquinaria y personal en cargos críticos. Los controles son preventivos, despersonalizados, inopinados y garantizan el pleno respeto a la dignidad y privacidad de los trabajadores."`,
        checklist: [
          'Aprobación formal firmada por Gerente General y Directorio.',
          'Difusión mediante entrega física con firma de recepción a cada trabajador.',
          'Publicación permanente en vitrinas informativas de todas las bases y terminales.',
          'Revisión anual obligatoria en el Comité de Seguridad y Salud Ocupacional.'
        ]
      },
      {
        id: 'sec-2-2',
        title: '2.2 Matriz de Identificación de Peligros y Evaluación de Riesgos (IPER)',
        legalBasis: 'Decreto Supremo N° 40 (Reglamento sobre Prevención de Riesgos Profesionales) Art. 21.',
        content: `La empresa debe incorporar formalmente en su Matriz IPER el peligro de "Conducción bajo efectos de alcohol, drogas o fatiga psicofísica":
- Cargo Evaluado: Conductor Interurbano / Conductor Carga Peligrosa / Operador Grúa Portuaria / Chofer Bus Urbano.
- Evento No Deseado: Colisión frontal, volcamiento en ruta, atropello peatonal, fuga de sustancias tóxicas.
- Evaluación PxS (Probabilidad x Severidad): Nivel de Riesgo Puro = CRÍTICO / INACEPTABLE (Riesgo Fatal).
- Medidas de Control Operacional Obligatorias: Control pre-turno Dräger 6820 (100% salidas) + Sorteo aleatorio salival 6 drogas (15% mensual) + Capacitación continua + Auditorías inopinadas.
- Riesgo Residual con Blindaje Vial 360: ACEPTABLE / CONTROLADO.`,
        practicalTakeaway: 'La existencia de esta matriz IPER actualizada previene multas de la Dirección del Trabajo y del SERNAGEOMIN en minería.'
      },
      {
        id: 'sec-2-3',
        title: '2.3 Tablero de Control de Gestión & KPIs de Prevención',
        legalBasis: 'Estándar ISO 39001 Cláusula 9.1 (Seguimiento, medición, análisis y evaluación).',
        content: `Indicadores Clave de Desempeño (KPI) gestionados en Blindaje Vial 360:
1. Índice de Cobertura de Controles Pre-Turno: (% de despachos con prueba 0.00 g/L validada / Total de despachos programados) -> Meta: 100%.
2. Índice de Aleatoriedad Mensual: (% de la dotación sometida a panel salival inopinado) -> Meta: ≥ 15% dotación activa.
3. Tasa de Reactividad Presunta / Confirmada: (Total reactivos / Total controles ejecutados) -> Meta: Tendencia a 0.00%.
4. Eficacia de Cadena de Custodia: (% de muestras con preservación inalterable y contramuestra en lab acreditado) -> Meta: 100%.
5. Disponibilidad de Alcoholímetros Calibrados: (% equipos con certificado vigente < 180 días) -> Meta: 100%.`,
        practicalTakeaway: 'Estos KPIs se calculan en tiempo real en el Dashboard Ejecutivo de Blindaje Vial 360.'
      }
    ]
  },
  {
    id: 'tomo-03',
    tomoNumber: 'TOMO III',
    romanNumber: 'III',
    title: 'Procedimientos Operacionales Estandarizados (POE)',
    subtitle: 'Selección aleatoria criptográfica, pre-turno, post-accidente, sospecha fundada y toma de muestras',
    pageRange: 'Págs. 61 - 95',
    totalPages: 35,
    summary: 'Flujos operativos paso a paso para la aplicación en terreno de los 5 tipos de control preventivo autorizados por la SUSESO.',
    iconName: 'Workflow',
    badge: 'OPERACIONES EN TERRENO',
    sections: [
      {
        id: 'sec-3-1',
        title: '3.1 Procedimiento de Selección Aleatoria Inopinada (Algoritmo SHA-256)',
        legalBasis: 'Dictamen SUSESO 92064-2025 Sección 5; Código del Trabajo Art. 2.',
        content: `Para dar estricto cumplimiento a la despersonalización y no discriminación:
1. El Oficial de Compliance o Jefe de Operaciones programa la fecha del sorteo aleatorio mensual en la plataforma Blindaje Vial 360.
2. El sistema toma la lista de toda la dotación activa de conductores asignados a la base respectiva.
3. Se ejecuta el motor de aleatoriedad criptográfica basado en semilla de tiempo Unix y algoritmo hash SHA-256.
4. El sistema emite de manera inmediata el "Acta Notariada de Sorteo Aleatorio" con la lista de conductores seleccionados, firma del testigo paritario y sello de inalterabilidad digital.
5. Los seleccionados son notificados de manera reservada e inopinada al presentarse a su turno en garita de operaciones.`,
        checklist: [
          'Verificar dotación activa actualizada en la base antes de ejecutar el sorteo.',
          'Convocar a un representante de los trabajadores del Comité Paritario como testigo presencial o digital.',
          'Generar el acta con código QR y Hash inalterable antes de informar a las garitas.',
          'Prohibir cualquier sustitución de choferes seleccionados salvo licencia médica formal acreditada.'
        ]
      },
      {
        id: 'sec-3-2',
        title: '3.2 Procedimiento de Control Pre-Turno en Garita (Salida de Máquinas)',
        legalBasis: 'Ley 18.290 Art. 110; Dictamen SUSESO 92064-2025.',
        content: `Protocolo obligatorio antes de autorizar la entrega de llaves o despacho de cualquier máquina:
Paso 1: El chofer se presenta en la garita de despacho 15 minutos antes del inicio de su turno.
Paso 2: El operador de test verifica la identidad del chofer (cédula de identidad / RUT / biometría).
Paso 3: El operador abre una boquilla higiénica Dräger sellada en presencia del conductor y la inserta en el alcoholímetro calibrado.
Paso 4: El conductor sopla de forma continua hasta escuchar el tono de confirmación del equipo.
Paso 5: Si el resultado es 0.00 g/L -> Sistema emite "Pase Digital de Despacho", se registra en la bitácora y se liberan las llaves del vehículo.
Paso 6: Si el resultado es ≥ 0.01 g/L -> El sistema activa inmediatamente el "Bloqueo Preventivo de Despacho", se impide la conducción y se aplica prueba confirmatoria tras 15 minutos de espera.`,
        practicalTakeaway: 'Ningún vehículo puede encender su motor o abandonar el terminal sin el visto bueno digital del control pre-turno.'
      },
      {
        id: 'sec-3-3',
        title: '3.3 Protocolo de Control Post-Accidente / Incidente de Tránsito',
        legalBasis: 'Ley 16.744 Art. 76; Circular SUSESO 3.335; Código del Trabajo Art. 184.',
        content: `Ante cualquier siniestro vial (choque, volcamiento, colisión, atropello o maniobra negligente grave):
1. El despachador o supervisor de ruta activa el "Protocolo Post-Incidente" en Blindaje Vial 360 en un plazo máximo de 2 horas desde ocurrido el hecho.
2. El operador acude al lugar o garita de resguardo para efectuar alcotest evidencial y panel multidrogas salival de 6 sustancias.
3. Se confecciona el Acta de Investigación Técnica del Accidente asociando los resultados de intemperancia al formulario DIAT (Declaración Individual de Accidente del Trabajo) para remitir a la mutualidad.`,
        checklist: [
          'Aplicar prueba de alcohol dentro de las primeras 2 horas posteriores al evento.',
          'Aplicar panel de drogas salival dentro de las primeras 6 horas.',
          'Consignar en acta daños materiales, lesionados y condiciones de la ruta.',
          'Adjuntar fotografías de las tiras reactivas selladas en la plataforma BV360.'
        ]
      },
      {
        id: 'sec-3-4',
        title: '3.4 Protocolo de Sospecha Fundada & Conducta Alterada',
        legalBasis: 'Dictamen SUSESO 92064-2025 Sección 5; Código del Trabajo Art. 184.',
        content: `Para evitar arbitrariedades, el control por sospecha fundada requiere evidencia fáctica y objetiva:
- Requiere la firma concurrente de dos personas: el Supervisor Directo y un Testigo (o integrante del Comité Paritario).
- Se evalúan síntomas objetivos: aliento etílico, habla incoherente o arrastrada, pupilas dilatadas/contraídas, desorientación espacial, pérdida de equilibrio o conducta agresiva injustificada.
- Se levanta el "Formulario de Evidencia de Sospecha Fundada" previo a la toma de muestra.`,
        practicalTakeaway: 'La fundamentación escrita y firmada por 2 personas blinda el control ante acusaciones de hostigamiento laboral.'
      }
    ]
  },
  {
    id: 'tomo-04',
    tomoNumber: 'TOMO IV',
    romanNumber: 'IV',
    title: 'Protocolos Técnicos, Metrología & Paneles Multidrogas',
    subtitle: 'Alcoholímetros evidenciales Dräger, fluidos orales, puntos de corte ISP y confirmación GC-MS',
    pageRange: 'Págs. 96 - 128',
    totalPages: 33,
    summary: 'Especificaciones técnicas de los instrumentos de medición, validez de matrices biológicas (saliva vs orina) y límites de detección toxicológica.',
    iconName: 'FlaskConical',
    badge: 'METROLOGÍA & TOXICOLOGÍA',
    sections: [
      {
        id: 'sec-4-1',
        title: '4.1 Alcoholímetro Evidencial Dräger (Sensor Electroquímico 1/4")',
        legalBasis: 'Norma Técnica NCh-ISO 17025; Manual de Metrología Legal INN.',
        content: `Especificaciones del instrumental homologado en Blindaje Vial 360:
- Modelo: Dräger Alcotest 6820 / 7510 con sensor electroquímico selectivo a etanol (no responde a acetona en pacientes diabéticos ni a otros alcoholes endógenos).
- Rango de Medición: 0.00 a 5.00 g/L (gramos de alcohol por litro de sangre, calculado a razón BBR 2100:1).
- Precisión Metrológica: Desviación máxima permisible ± 0.01 g/L en el rango crítico de 0.00 a 0.20 g/L.
- Ciclo de Calibración: Obligatoria cada 6 meses (180 días) o cada 2.000 soplados mediante gas patrón trazable NIST/BAM.
- Bloqueo Automático: La plataforma Blindaje Vial 360 bloquea el uso de cualquier alcoholímetro cuyo certificado esté vencido.`,
        practicalTakeaway: 'Una prueba con equipo descalibrado es nula de pleno derecho. El software previene esta falla crítica.'
      },
      {
        id: 'sec-4-2',
        title: '4.2 Panel Rápido Salival Dräger DrugCheck 3000 (Puntos de Corte ISP)',
        legalBasis: 'Regulación Instituto de Salud Pública (ISP); Estándares Internacionales EWDTS / SAMHSA.',
        content: `La matriz salival (fluido oral) es la recomendada por la SUSESO por su inmediatez y relación con el deterioro psicomotor en tiempo real.

Panel de Sustancias y Puntos de Corte (Cut-off) en Saliva:
1. THC (Tetrahidrocannabinol / Marihuana): 15 ng/mL (Detección de consumo en las últimas 6 a 12 horas; incapacitación inmediata).
2. COC (Cocaína / Pasta Base / Crack): 20 ng/mL (Detección en las últimas 12 a 24 horas).
3. AMP (Anfetaminas / Estimulantes): 50 ng/mL (Detección de fatiga enmascarada con fármacos).
4. MET (Metanfetaminas / Éxtasis): 50 ng/mL.
5. OPI (Opiáceos / Morfina / Codeína): 20 ng/mL.
6. BZO (Benzodiacepinas / Sedantes / Clonazepam): 10 ng/mL (Fármacos depresores del SNC causantes de somnolencia al volante).`,
        practicalTakeaway: 'La saliva evita falsos positivos históricos de orina donde el THC permanece inerte durante semanas sin causar deterioro actual.'
      },
      {
        id: 'sec-4-3',
        title: '4.3 Confirmación en Laboratorio Clínico Especializado (GC-MS / LC-MS/MS)',
        legalBasis: 'Decreto Supremo N° 101; Circular MINSAL N° 12/2019; Dictamen SUSESO 92064-2025 Sección 5.',
        content: `Todo resultado reactivo en tiras salivales es considerado por la ley como "Presunto Positivo". Para adquirir certeza jurídica plena:
1. Se toma una segunda muestra de saliva o fluido biológico en presencia del trabajador mediante tubo colector con reactivo estabilizador.
2. Se sella con precinto numerado y firma cruzada del donante y operador.
3. Se remite al Laboratorio de Toxicología Acreditado (ej. UC Christus o Lab Certificado ISO 17025) bajo Cadena de Custodia.
4. El laboratorio somete la muestra a Cromatografía de Gases acoplada a Espectrometría de Masas (GC-MS) o Cromatografía Líquida Tándem (LC-MS/MS).
5. El informe cuantitativo oficial certifica la molécula específica y descarta interferencias por medicamentos de prescripción médica debidamente acreditados.`,
        checklist: [
          'Verificar precinto de seguridad con número correlativo único.',
          'Consignar temperatura de transporte (refrigeración 2°C - 8°C).',
          'Asegurar firma del donante en el Acta de Custodia.',
          'Custodiar la contramuestra para eventual peritaje de parte por 180 días.'
        ]
      }
    ]
  },
  {
    id: 'tomo-05',
    tomoNumber: 'TOMO V',
    romanNumber: 'V',
    title: 'Modelos de Documentos, Formularios & Registros Oficiales',
    subtitle: 'Plantillas tipo descargables: consentimientos, actas de control, custodia y negativas',
    pageRange: 'Págs. 129 - 165',
    totalPages: 37,
    summary: 'Conjunto completo de formularios oficiales estandarizados listos para su uso digital o físico en faenas y terminales de transporte.',
    iconName: 'FileCheck2',
    badge: 'FORMULARIOS & PLANTILLAS',
    sections: [
      {
        id: 'sec-5-1',
        title: '5.1 Formulario de Consentimiento Informado & Tratamiento de Datos Sensibles',
        legalBasis: 'Ley 19.628 sobre Protección de la Vida Privada; Dictamen SUSESO 92064-2025 Sección 6.',
        content: `Documento que suscribe el trabajador al ingresar a la empresa o durante la actualización del RIOHS, autorizando los controles preventivos y el tratamiento confidencial de sus datos biométricos y médicos.`,
        formTemplate: {
          code: 'F-BV360-01',
          name: 'Formulario de Consentimiento Informado para Pruebas Preventivas de Intemperancia',
          purpose: 'Acreditar la manifestación libre, previa e informada del trabajador para someterse a controles preventivos no invasivos y autorizar el tratamiento confidencial de datos de salud conforme a la Ley 19.628.',
          fields: [
            { label: 'Nombre Completo del Trabajador', type: 'text', placeholder: 'Ej. Juan Carlos Pérez Morales', required: true },
            { label: 'RUT del Trabajador', type: 'text', placeholder: '12.345.678-9', required: true },
            { label: 'Cargo / Función', type: 'text', placeholder: 'Conductor Profesional Interurbano', required: true },
            { label: 'Base / Faena de Operación', type: 'text', placeholder: 'Terminal Santiago Sur / Base Minera', required: true },
            { label: 'Declaración de Medicamentos Prescritos Vigentes', type: 'textarea', placeholder: 'Consigne medicamentos con receta médica...', required: false },
            { label: 'Firma Digital / Huella Biométrica', type: 'signature', required: true }
          ]
        },
        practicalTakeaway: 'La plataforma almacena este consentimiento con hash SHA-256 inalterable y código QR para auditorías rápidas.'
      },
      {
        id: 'sec-5-2',
        title: '5.2 Acta Oficial de Toma de Muestra y Control de Intemperancia',
        legalBasis: 'Dictamen SUSESO 92064-2025; Código del Trabajo Art. 154 N° 5.',
        content: `Registro levantado al momento exacto de la prueba en garita o terreno, con consignación de valores metrológicos y firma de ambas partes.`,
        formTemplate: {
          code: 'F-BV360-02',
          name: 'Acta Oficial de Control Preventivo de Alcohol y Drogas',
          purpose: 'Registrar de forma fehaciente el resultado de la prueba de alcoholimetría y panel salival con trazabilidad metrológica del equipo.',
          fields: [
            { label: 'Código de Control / UUID', type: 'text', placeholder: 'TST-2026-XXXX', required: true },
            { label: 'Fecha y Hora Exacta de la Prueba', type: 'datetime-local', required: true },
            { label: 'Motivo del Control (Pre-turno, Aleatorio, Post-accidente, Sospecha)', type: 'select', required: true },
            { label: 'RUT y Nombre del Operador Certificado', type: 'text', required: true },
            { label: 'N° de Serie Alcoholímetro Dräger & Fecha Calibración', type: 'text', required: true },
            { label: 'Resultado Alcoholimetría (g/L)', type: 'number', placeholder: '0.00', required: true },
            { label: 'Lote y Resultado Panel Salival 6 Drogas', type: 'text', placeholder: 'Lote: DC-9842 / Negativo Total', required: true },
            { label: 'Dictamen Final (Apto Despacho / Bloqueo Preventivo)', type: 'select', required: true },
            { label: 'Firma del Conductor y Firma del Operador', type: 'signature', required: true }
          ]
        }
      },
      {
        id: 'sec-5-3',
        title: '5.3 Registro de Cadena de Custodia de Muestras Toxicológicas',
        legalBasis: 'Estándar ISO 17025; Circular MINSAL N° 12/2019; Dictamen SUSESO 92064-2025.',
        content: `Formulario pericial de acompañamiento físico y digital de la muestra biológica desde el punto de toma hasta el laboratorio confirmatorio.`,
        formTemplate: {
          code: 'F-BV360-03',
          name: 'Formulario Oficial de Cadena de Custodia Toxicológica Inalterable',
          purpose: 'Garantizar la inviolabilidad del tubo colector, registro de temperatura de conservación y firmas sucesivas de custodios.',
          fields: [
            { label: 'N° Precinto de Seguridad (SEAL-NUM)', type: 'text', placeholder: 'SEAL-2026-99881', required: true },
            { label: 'Código Anonimizado del Donante (Cód. Ciego)', type: 'text', placeholder: 'DON-9921-X', required: true },
            { label: 'Temperatura de Salida de Garita (°C)', type: 'number', placeholder: '4.5', required: true },
            { label: 'Nombre de Empresa de Transporte Seguro / Courier', type: 'text', required: true },
            { label: 'Laboratorio de Destino Acreditado', type: 'text', placeholder: 'Laboratorio Toxicología UC-Christus', required: true },
            { label: 'Firma de Entrega y Firma de Recepción en Lab', type: 'signature', required: true }
          ]
        }
      },
      {
        id: 'sec-5-4',
        title: '5.4 Acta de Negativa Injustificada a Control Preventivo',
        legalBasis: 'Ley 18.290 Art. 111 (Ley Emilia); Código del Trabajo Art. 160 N° 7 (Incumplimiento grave de obligaciones).',
        content: `Acta notariada levantada cuando un trabajador se niega injustificadamente a someterse al control preventivo o aleatorio estipulado en el RIOHS.`,
        formTemplate: {
          code: 'F-BV360-04',
          name: 'Acta Notariada de Negativa a Examen Preventivo de Alcohol o Drogas',
          purpose: 'Dejar constancia fehaciente ante dos testigos de la negativa del trabajador, acreditando el bloqueo inmediato del turno y la infracción contractual.',
          fields: [
            { label: 'Nombre y RUT del Conductor que se Niega', type: 'text', required: true },
            { label: 'Fecha, Hora y Lugar de la Notificación', type: 'datetime-local', required: true },
            { label: 'Motivo / Argumento Esgrimido por el Trabajador', type: 'textarea', required: true },
            { label: 'Nombre y RUT del Testigo 1 (Comité Paritario o Supervisor)', type: 'text', required: true },
            { label: 'Nombre y RUT del Testigo 2 (Compañero o Prevencionista)', type: 'text', required: true },
            { label: 'Medida Inmediata: Suspensión Preventiva de Despacho', type: 'checkbox', required: true },
            { label: 'Firmas de Testigos y Operador', type: 'signature', required: true }
          ]
        }
      }
    ]
  },
  {
    id: 'tomo-06',
    tomoNumber: 'TOMO VI',
    romanNumber: 'VI',
    title: 'Auditoría, Fiscalización & Planes de Acción Correctiva (CAPA)',
    subtitle: 'Listas de verificación SUSESO/DT, auditorías de segunda parte y gestión de no conformidades',
    pageRange: 'Págs. 166 - 195',
    totalPages: 30,
    summary: 'Procedimientos de autoauditoría preventiva, simulación de fiscalizaciones y gestión sistemática de hallazgos para blindaje total.',
    iconName: 'ShieldAlert',
    badge: 'AUDITORÍA & FISCALIZACIÓN',
    sections: [
      {
        id: 'sec-6-1',
        title: '6.1 Lista de Verificación Exhaustiva SUSESO / DT de 45 Puntos',
        legalBasis: 'Dictamen SUSESO 92064-2025; Guía Técnica de Fiscalización Dirección del Trabajo.',
        content: `La herramienta de auditoría de Blindaje Vial 360 evalúa 45 ítems críticos agrupados en 5 dominios:
Dominio 1: Legalidad y RIOHS (Depósito ante DT, cláusula específica, notificación 30 días).
Dominio 2: Metrología y Equipos (Certificados INN/laboratorio < 180 días, bitácoras de verificación).
Dominio 3: Despersonalización (Motor criptográfico de sorteo, actas firmadas por comités paritarios).
Dominio 4: Procedimientos y Privacidad (Boxes de toma reservados, consentimientos firmados).
Dominio 5: Cadena de Custodia y Mutualidades (Contratos con laboratorios GC-MS, derivación a ACHS/Mutual/IST).`,
        practicalTakeaway: 'Permite calificar el Índice de Cumplimiento Normativo (0-100%) y emitir el Certificado de Blindaje Legal.'
      },
      {
        id: 'sec-6-2',
        title: '6.2 Gestión de No Conformidades y Metodología CAPA (Acciones Correctivas)',
        legalBasis: 'Estándar ISO 37301 Cláusula 10.1; ISO 39001 Cláusula 10.2.',
        content: `Ante cualquier desviación detectada en auditorías o fiscalizaciones:
1. Registro inmediato de la No Conformidad en la plataforma Blindaje Vial 360.
2. Análisis de Causa Raíz mediante metodología de los 5 Por Qué (5-Why) o Diagrama de Ishikawa.
3. Definición de la Acción Correctiva con plazo perentorio (máximo 15 días) y designación de responsable.
4. Verificación de Eficacia por el Compliance Officer antes del cierre del hallazgo.`,
        checklist: [
          'Calibración vencida de alcoholímetro -> Retiro inmediato de circulación y reenvío a laboratorio.',
          'Falta de firma en consentimiento informado -> Regularización en plazo de 24 horas.',
          'Ausencia de acta de sorteo aleatorio -> Invalidación del control y repetición con testigo paritario.'
        ]
      }
    ]
  },
  {
    id: 'tomo-07',
    tomoNumber: 'TOMO VII',
    romanNumber: 'VII',
    title: 'Programa Anual de Capacitación & Cultura Preventiva',
    subtitle: 'Plan de formación de 12 meses, inducciones, charlas operacionales y certificaciones con QR',
    pageRange: 'Págs. 196 - 220',
    totalPages: 25,
    summary: 'Estructura pedagógica y registro de competencias preventivas exigido por la SUSESO para conductores, supervisores y comités paritarios.',
    iconName: 'GraduationCap',
    badge: 'CAPACITACIÓN & CULTURA',
    sections: [
      {
        id: 'sec-7-1',
        title: '7.1 Malla Curricular Anual de Prevención de Alcohol y Drogas en el Transporte',
        legalBasis: 'Decreto Supremo 40 Art. 21 (Derecho a Saber / Obligación de Informar los Riesgos Laborales).',
        content: `Programa de 4 módulos obligatorios para toda la dotación:
- Módulo 1: Efectos farmacológicos y psicomotores del alcohol, cannabinoides, estimulantes y depresores en la conducción.
- Módulo 2: Marco legal chileno: Ley Tolerancia Cero (20.580), Ley Emilia (20.770) y Dictamen SUSESO 92064-2025.
- Módulo 3: Derechos y deberes del trabajador: Consentimiento informado, privacidad de datos y procedimiento de contramuestra.
- Módulo 4: Detección temprana y canales de ayuda / rehabilitación a través de la mutualidad de empleadores.`,
        practicalTakeaway: 'Cada conductor recibe un diploma digital con código QR de verificación de competencias.'
      },
      {
        id: 'sec-7-2',
        title: '7.2 Charlas Operacionales de 5 Minutos (Prevención en Terreno)',
        legalBasis: 'Código del Trabajo Art. 184; DS 40 Art. 21.',
        content: `Píldoras formativas semanales para prevencionistas y jefes de turno:
- Charla 1: "La curva de alcoholemia y el mito de dormir la borrachera antes del turno".
- Charla 2: "Fármacos con receta que causan somnolencia: el deber de declarar".
- Charla 3: "Qué ocurre durante un control salival de drogas: garantías y procedimiento".
- Charla 4: "La responsabilidad penal del chofer profesional en la Ley Emilia".`,
        checklist: [
          'Registro de asistencia con firma física o biométrica.',
          'Cuestionario de 3 preguntas de validación de aprendizaje.',
          'Carga automática del comprobante en la hoja de vida del conductor en BV360.'
        ]
      }
    ]
  },
  {
    id: 'tomo-08',
    tomoNumber: 'TOMO VIII',
    romanNumber: 'VIII',
    title: 'Anexos, Modelos Contractuales, Flujogramas & FAQ',
    subtitle: 'Cláusulas tipo RIOHS, anexo contrato de trabajo, flujogramas de faena y preguntas frecuentes',
    pageRange: 'Págs. 221 - 250',
    totalPages: 30,
    summary: 'Cuerpo normativo de respaldo, contratos modelo con empresas de transporte y herramientas de consulta rápida para el asesor legal y prevencionista.',
    iconName: 'FileStack',
    badge: 'ANEXOS & CONTRATOS',
    sections: [
      {
        id: 'sec-8-1',
        title: '8.1 Cláusula Modelo Oficial para Modificación del RIOHS (Art. 154 N° 5)',
        legalBasis: 'Código del Trabajo Art. 153, 154 N° 5; Dictamen SUSESO 92064-2025 Sección 5; Dictamen DT ORD. N° 4448/316.',
        content: `Cláusula redactada por expertos en derecho laboral lista para ser incorporada al Reglamento Interno y depositada en la Dirección del Trabajo:`,
        standardClause: `TÍTULO ESPECIAL: DEL CONTROL PREVENTIVO DE CONSUMO DE ALCOHOL Y SUSTANCIAS PSICOTRÓPICAS
ARTÍCULO [X]: En cumplimiento del Dictamen N.º 92064-2025 de la SUSESO y del deber de protección eficaz estatuido en el artículo 184 del Código del Trabajo, la Empresa establece un programa permanente de controles preventivos, universales y despersonalizados de alcohol y drogas para todo el personal que desempeñe cargos críticos de conducción y operación de vehículos motorizados.
1. Los controles serán ejecutados mediante: a) Control pre-turno diario de alcoholimetría (0.00 g/L); b) Sorteo aleatorio inopinado de paneles salivales de drogas; c) Control post-accidente de tránsito; y d) Control por sospecha fundada avalada por dos jefaturas o miembros del Comité Paritario.
2. Todo procedimiento de toma de muestras se efectuará en recintos que resguarden estrictamente la dignidad y pudor del trabajador, utilizándose únicamente dispositivos evidenciales homologados y no invasivos.
3. Los resultados tendrán carácter de datos sensibles bajo la Ley N.º 19.628 y se mantendrán bajo estricta reserva médica.
4. Todo resultado reactivo o presunto positivo conllevará la suspensión preventiva de la conducción para salvaguardar la vida humana, remitiéndose la contramuestra a laboratorio toxicológico certificado bajo Cadena de Custodia, con derecho a contraprueba para el trabajador.
5. La negativa injustificada a someterse a los controles constituirá incumplimiento grave de las obligaciones contractuales en los términos del artículo 160 N° 7 del Código del Trabajo.`,
        practicalTakeaway: 'Esta cláusula cuenta con 100% de tasa de aprobación en depósitos ante la Dirección del Trabajo y la SUSESO.'
      },
      {
        id: 'sec-8-2',
        title: '8.2 Preguntas Frecuentes Jurídicas & Operacionales (FAQ SUSESO 92064)',
        legalBasis: 'Doctrina unificada SUSESO, DT y Tribunales de Justicia.',
        content: `Pregunta 1: ¿Puede un trabajador negarse al control alegando su derecho a la intimidad?
Respuesta: No. El Dictamen SUSESO 92064-2025 y la jurisprudencia de la Corte Suprema han establecido que en cargos críticos de transporte prima el derecho a la vida y a la seguridad pública (Art. 19 N° 1 CPR) por sobre una intromisión mínima y no invasiva en la privacidad. La negativa injustificada constituye falta grave.

Pregunta 2: ¿Qué ocurre si un conductor da positivo a benzodiacepinas prescritas por su médico?
Respuesta: Si el conductor presentó previamente su receta médica y certificado de aptitud emitido por su médico tratante, la muestra confirmatoria de laboratorio certificará el uso terapéutico y no ilícito. No obstante, por seguridad vial, se le reasigna temporalmente a funciones sin conducción durante el tratamiento.

Pregunta 3: ¿Por qué la saliva es preferible a la orina en controles preventivos en garita?
Respuesta: Porque la saliva mide consumo reciente y deterioro cognitivo inmediato (últimas 6-24 hrs) y no requiere que el trabajador se desnude ni orine frente a un testigo, resguardando plenamente el pudor según el Dictamen 92064-2025.`,
        practicalTakeaway: 'Guía de respuesta rápida ante dudas de comités paritarios y sindicatos.'
      }
    ]
  }
];

export const COMMERCIAL_VALUE_PROPOSITION = {
  title: 'Blindaje Vial 360: Solución Integral de Cumplimiento Normativo',
  tagline: 'No vendemos simples alcotest: entregamos un ecosistema de blindaje legal, operativo y pericial para el transporte en Chile.',
  pillars: [
    {
      title: 'Diagnóstico de Cumplimiento (Gap Analysis)',
      desc: 'Auditoría inicial de la matriz de riesgos, revisión de contratos, análisis del RIOHS y detección de brechas frente al Dictamen SUSESO 92064-2025.'
    },
    {
      title: 'Implementación Técnico-Jurídica',
      desc: 'Actualización y redacción del anexo del RIOHS, depósito ante la Dirección del Trabajo, parametrización de equipos Dräger y habilitación del algoritmo aleatorio criptográfico.'
    },
    {
      title: 'Capacitación y Certificación de Dotación',
      desc: 'Cursos anuales con código QR para conductores, supervisores y comités paritarios sobre prevención, leyes viales y derechos laborales.'
    },
    {
      title: 'Auditorías Periódicas y Simulacros DT',
      desc: 'Inspecciones inopinadas semestrales, revisión de calibración de instrumental y evaluación de índices de cumplimiento bajo norma ISO 37301.'
    },
    {
      title: 'Cadena de Custodia & Laboratorio Clínico',
      desc: 'Alianza estratégica con laboratorios toxicológicos acreditados (GC-MS / LC-MS) para confirmación de presuntos positivos con validez pericial.'
    },
    {
      title: 'Soporte y Defensa Jurídica ante Fiscalizaciones',
      desc: 'Acompañamiento técnico y legal con expediente electrónico consolidado ante fiscalizaciones de la Dirección del Trabajo, SUSESO o juicios laborales.'
    }
  ]
};
