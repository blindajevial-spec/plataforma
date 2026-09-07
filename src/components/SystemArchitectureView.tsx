import React, { useState } from 'react';
import {
  Layers,
  Users,
  Smartphone,
  Globe,
  Server,
  ShieldCheck,
  Cpu,
  Database,
  Network,
  Radio,
  ArrowDown,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Zap,
  Activity,
  Code2,
  RefreshCw,
  Terminal,
  ExternalLink,
  Wifi,
  Workflow
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SystemArchitectureView: React.FC = () => {
  const { currentCompany } = useApp();
  const [selectedLayer, setSelectedLayer] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(-1);
  const [selectedSimulationScenario, setSelectedSimulationScenario] = useState<'positive_test' | 'random_draw' | 'custody_sync'>('positive_test');
  const [apiEndpointSelected, setApiEndpointSelected] = useState<string>('eval_test');
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // 7 Tiers Definition as requested:
  // USUARIOS -> FRONTEND -> API GATEWAY -> BACKEND MICROSERVICES -> MOTOR DE COMPLIANCE + RIESGO -> BASE DE DATOS + DATA LAKE -> INTEGRACIONES EXTERNAS
  const architectureLayers = [
    {
      id: 1,
      tierCode: 'TIER-1',
      title: 'USUARIOS',
      subtitle: 'Actores del Sistema & Autenticación Multi-Rol',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      status: 'Online • 9 Roles RBAC',
      uptime: '100%',
      latency: '< 5ms',
      summary: 'Gestión de identidades con control de acceso basado en roles (RBAC), autenticación con ClaveÚnica / RUT, 2FA y firma biométrica en terreno.',
      components: [
        { name: 'Superadministrador', desc: 'Control multi-empresa, auditoría global y parametrización' },
        { name: 'Administrador Empresa', desc: 'Control de flota, conductores, contratos y turnos' },
        { name: 'Compliance Officer (ISO 37301)', desc: 'Matriz legal, dictámenes SUSESO y no conformidades' },
        { name: 'Prevencionista de Riesgos (DS 40)', desc: 'Matriz MIPER, mapa de calor y protocolos' },
        { name: 'Supervisor Operacional', desc: 'Despacho de vehículos y control de relevos en ruta' },
        { name: 'Operador de Terreno', desc: 'Toma de alcohotest evidencial Dräger y paneles de drogas' },
        { name: 'Laboratorio Toxicológico', desc: 'Recepción LIMS, confirmación GC-MS y contraprueba' },
        { name: 'Auditor Externo / Mutualidad', desc: 'Verificación de trazabilidad y actas digitales' },
        { name: 'Gerencia General', desc: 'KPIs estratégicos de intemperancia y siniestralidad evitada' }
      ],
      protocols: ['OAuth2 + OIDC', 'JWT RS256', 'WebAuthn Biometría', 'ClaveÚnica GOB']
    },
    {
      id: 2,
      tierCode: 'TIER-2',
      title: 'FRONTEND (Web + Mobile)',
      subtitle: 'Interfaces de Usuario Progresivas & Offline-First',
      icon: Globe,
      color: 'from-cyan-600 to-emerald-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      status: 'PWA v2.4.0 • Offline Ready',
      uptime: '99.99%',
      latency: '14ms',
      summary: 'Suite web responsive para escritorio gerencial y aplicación móvil PWA para terreno con soporte offline, escaneo de cédula de identidad chilena (PDF417) y sincronización BLE con alcoholímetros.',
      components: [
        { name: 'Portal Web SPA Gerencial', desc: 'React 18 + Vite + Tailwind + Recharts + ISO Dashboard' },
        { name: 'Mobile PWA Terreno (Operadores)', desc: 'Optimizado para tablets rugerizadas y smartphones en garita' },
        { name: 'Escáner Cédula Chilena (PDF417)', desc: 'Lectura óptica instantánea de RUT, serie y fecha de nacimiento' },
        { name: 'Módulo de Firma Biométrica', desc: 'Captura de firma en pantalla con hash temporal y coordenadas GPS' },
        { name: 'Motor Offline IndexedDB', desc: 'Almacenamiento local seguro en caso de faenas sin cobertura 4G/5G' }
      ],
      protocols: ['HTTPS / TLS 1.3', 'IndexedDB Storage', 'Web Bluetooth API (BLE)', 'Service Workers']
    },
    {
      id: 3,
      tierCode: 'TIER-3',
      title: 'API GATEWAY',
      subtitle: 'Seguridad Perimetral, Enrutamiento & Rate Limiting',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-amber-600',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      status: 'Gateway Activo • WAF OWASP Top 10',
      uptime: '99.999%',
      latency: '3ms',
      summary: 'Punto de entrada único protegido por WAF, validación criptográfica de tokens JWT, balanceo de carga, rate limiting de 1.000 req/min y proxy reverso hacia microservicios.',
      components: [
        { name: 'Kong / Envoy API Gateway', desc: 'Enrutamiento dinámico inteligente y terminación SSL/TLS' },
        { name: 'Web Application Firewall (WAF)', desc: 'Protección contra inyecciones SQL, XSS, CSRF y DDoS' },
        { name: 'JWT Auth & RBAC Interceptor', desc: 'Inspección de permisos de usuario antes de llegar al backend' },
        { name: 'Rate Limiter & Circuit Breaker', desc: 'Aislamiento de fallos y control de consumo por cliente' },
        { name: 'OpenAPI 3.0 / Swagger Engine', desc: 'Documentación viva y contrato de datos tipado' }
      ],
      protocols: ['HTTP/2 & HTTP/3', 'gRPC-Web Proxy', 'CORS Enforced', 'mTLS Inter-service']
    },
    {
      id: 4,
      tierCode: 'TIER-4',
      title: 'BACKEND MICROSERVICES',
      subtitle: 'Servicios Distribuidos Especializados de Negocio',
      icon: Server,
      color: 'from-amber-600 to-rose-600',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      status: '7 Microservicios en Kubernetes',
      uptime: '99.98%',
      latency: '8ms',
      summary: 'Arquitectura desacoplada de microservicios contenerizados en Docker/K8s para procesar la lógica de negocio con alta disponibilidad y escalabilidad automática.',
      components: [
        { name: 'auth-identity-svc', desc: 'Gestión de sesiones, tokens, permisos y roles RBAC' },
        { name: 'testing-controller-svc', desc: 'Ingesta de tests evidenciales, lectura de sensor y cálculo de g/L' },
        { name: 'fleet-interlock-svc', desc: 'Gestión de conductores, licencias, psicotécnicos y bloqueo de flota' },
        { name: 'random-selector-svc', desc: 'Generador PRNG despersonalizado con seed criptográfico auditado' },
        { name: 'custody-chain-svc', desc: 'Trazabilidad de muestras LIMS, control de precintos y temperatura' },
        { name: 'metrology-calib-svc', desc: 'Control de vigencia semestral de etilómetros Dräger e inhabilitación' },
        { name: 'alert-dispatcher-svc', desc: 'Envío de notificaciones inmediatas por WhatsApp/SMS ante positivo' }
      ],
      protocols: ['gRPC / Protocol Buffers', 'RESTful JSON', 'Kafka / RabbitMQ Event Bus', 'Redis Pub/Sub']
    },
    {
      id: 5,
      tierCode: 'TIER-5',
      title: 'MOTOR DE COMPLIANCE + RIESGO',
      subtitle: 'Motor de Reglas de Negocio & Algoritmos de Bloqueo',
      icon: Cpu,
      color: 'from-rose-600 to-purple-600',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      status: 'Motor Reglas V3.2 • Latencia < 50ms',
      uptime: '100%',
      latency: '2ms',
      summary: 'Cerebro normativo que evalúa en milisegundos las leyes chilenas (Ley 16.744, Ley Emilia, Código del Trabajo Art. 184/154, SUSESO) y activa el Interlock de Bloqueo Inmediato ante intemperancia.',
      components: [
        { name: 'Motor de Reglas Ley Emilia', desc: 'Tolerancia Cero (0.00 g/L): clasifica bajo influencia o estado de ebriedad' },
        { name: 'Safety Interlock Dispatcher', desc: 'Inhabilita al conductor en el ERP/TMS en < 50ms ante resultado no conforme' },
        { name: 'Evaluador MIPER Continuo', desc: 'Cálculo dinámico de Probabilidad x Consecuencia y Riesgo Residual' },
        { name: 'Validador de Sorteo SUSESO', desc: 'Asegura que el sorteo cumpla con la Circular 3.335 sin discriminación' },
        { name: 'Generador de Actas Jurídicas', desc: 'Redacción automática del Acta de Hallazgo con firma para Comité Paritario' }
      ],
      protocols: ['Reglas DRL / JSON Engine', 'SHA-256 Seed Proofs', 'Firma Criptográfica', 'Async Event Triggers']
    },
    {
      id: 6,
      tierCode: 'TIER-6',
      title: 'BASE DE DATOS + DATA LAKE',
      subtitle: 'Persistencia ACID, Repositorio de Evidencias & Blockchain',
      icon: Database,
      color: 'from-purple-600 to-indigo-600',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      status: 'PostgreSQL HA + S3 Encrypted + Ledger',
      uptime: '99.999%',
      latency: '4ms',
      summary: 'Capa de almacenamiento híbrida: Base relacional PostgreSQL para datos transaccionales, Data Lake de documentos y curvas de etilómetro, y Hash Chain inalterable para peritaje penal/laboral.',
      components: [
        { name: 'PostgreSQL Relacional (Cloud SQL)', desc: 'Tablas ACID con particionamiento mensual y réplica geográfica' },
        { name: 'Data Lake S3 / Cloud Storage', desc: 'PDFs firmados, certificados Dräger y curvas cromatográficas' },
        { name: 'Ledger Inalterable SHA-256', desc: 'Encadenamiento criptográfico forense contra alteraciones de fecha/resultado' },
        { name: 'Caché Redis en Memoria', desc: 'Caché de sesiones, estados de bloqueo de conductores y tokens' }
      ],
      protocols: ['PostgreSQL Wire Protocol', 'S3 API (AES-256 SSE)', 'Redis Protocol (RESP)', 'SHA-256 Hash Chain']
    },
    {
      id: 7,
      tierCode: 'TIER-7',
      title: 'INTEGRACIONES EXTERNAS',
      subtitle: 'Dispositivos IoT, LIMS Toxicológicos, GPS & Entidades Fiscalizadoras',
      icon: Network,
      color: 'from-indigo-600 to-blue-700',
      badgeColor: 'bg-blue-600/20 text-blue-200 border-blue-500/40',
      status: '8 Conectores Activos',
      uptime: '99.95%',
      latency: '25ms',
      summary: 'Hub de integración bidireccional con hardware de terreno, laboratorios clínicos, plataformas telemáticas de camiones (CAN Bus/GPS) y entidades reguladoras chilenas.',
      components: [
        { name: 'Alcoholímetros Dräger (BLE / USB)', desc: 'Alcotest 6820 / 7510 con lectura de curvas de aliento' },
        { name: 'Alcolocks Vehiculares (CAN Bus)', desc: 'Dräger Interlock 7000 conectado al corta-corriente del motor' },
        { name: 'Laboratorios Toxicológicos (LIMS)', desc: 'Bionet, Megasalud, Bioslab vía HL7 / REST API' },
        { name: 'Sistemas GPS / TMS de Flota', desc: 'Samsara, Geotab, Webfleet, Wisetrack, SAP ERP' },
        { name: 'Entidades Mutuales & Reguladoras', desc: 'ACHS, Mutual de Seguridad, IST, SUSESO, Dirección del Trabajo' }
      ],
      protocols: ['Bluetooth BLE GATT', 'CAN Bus SAE J1939', 'HL7 / FHIR v4', 'Webhooks HMAC-SHA256']
    }
  ];

  // Simulation Scenarios
  const simulationScenarios = {
    positive_test: {
      title: 'Detección de Intemperancia & Interlock de Despacho',
      steps: [
        { layer: 1, title: 'Conductor & Operador', desc: 'Conductor José Morales (RUT 14.890.123-5) ingresa a turno en Garita Santiago Norte.' },
        { layer: 2, title: 'Frontend Mobile PWA', desc: 'Operador escanea cédula, selecciona equipo Dräger Alcotest 6820 y ejecuta test de aliento.' },
        { layer: 7, title: 'Dispositivo IoT Dräger', desc: 'Alcoholímetro transmite vía BLE valor: 0.28 g/L (Bajo influencia del alcohol).' },
        { layer: 3, title: 'API Gateway', desc: 'POST /api/v1/tests/eval recibido con JWT firmado y coordenadas GPS verificadas.' },
        { layer: 4, title: 'Backend Microservices', desc: 'testing-service procesa payload y solicita evaluación urgente al motor de compliance.' },
        { layer: 5, title: 'Motor Compliance + Riesgo', desc: 'REGLA DISPARADA: Ley Emilia Art. 193 bis. Dictamen: NO APTO / BLOQUEADO INMEDIATO.' },
        { layer: 6, title: 'Base de Datos + Data Lake', desc: 'Transacción ACID: Conductor marcado "bloqueado_preventivo". Se acuña bloque SHA-256 en el Ledger.' },
        { layer: 7, title: 'Integraciones Externas', desc: 'Webhook dispara bloqueo en Samsara/Webfleet (inmovilizador de camión) y alerta WhatsApp a Jefe de Turno.' }
      ]
    },
    random_draw: {
      title: 'Sorteo Aleatorio Criptográfico SUSESO',
      steps: [
        { layer: 1, title: 'Prevencionista de Riesgos', desc: 'Solicita sorteo del 20% de dotación activa para Faena El Teniente.' },
        { layer: 2, title: 'Frontend Web Gerencial', desc: 'Envía parámetros del sorteo con firma digital del responsable.' },
        { layer: 3, title: 'API Gateway', desc: 'POST /api/v1/random-selection/draw validado con rol "prevencionista".' },
        { layer: 4, title: 'Microservicio Random-Selector', desc: 'Genera semilla PRNG (Seed Hash SHA-256) combinando timestamp atómico y blockhash.' },
        { layer: 5, title: 'Motor de Compliance', desc: 'Verifica cumplimiento de Dictamen SUSESO Circular 3.335 (Despersonalización absoluta).' },
        { layer: 6, title: 'Base de Datos Transaccional', desc: 'Crea lote con 10 conductores seleccionados y almacena prueba matemática inalterable.' },
        { layer: 7, title: 'Integraciones Externas', desc: 'Notifica a supervisores de base para citación inmediata a toma de muestra en garita.' }
      ]
    },
    custody_sync: {
      title: 'Sincronización LIMS con Laboratorio Toxicológico',
      steps: [
        { layer: 1, title: 'Operador de Garita', desc: 'Recolecta muestra de saliva con precinto Nº SEC-9941 y toma firma del donante.' },
        { layer: 2, title: 'Frontend Mobile', desc: 'Registra temperatura (36.5 ºC) y despacha valija térmica a laboratorio acreditado.' },
        { layer: 3, title: 'API Gateway', desc: 'POST /api/v1/custody/dispatch autentica la entrega con token de mensajería.' },
        { layer: 4, title: 'Microservicio Custody-Chain', desc: 'Actualiza estado a "en_transito_lab" y emite QR de custodia biológica.' },
        { layer: 7, title: 'LIMS Laboratorio Externo', desc: 'Recepción en laboratorio Bionet S.A., confirmación GC-MS inyectada vía HL7.' },
        { layer: 5, title: 'Motor de Compliance', desc: 'Cruza resultado presunto vs confirmatorio cuantitativo (THC-COOH 15 ng/mL).' },
        { layer: 6, title: 'Base de Datos + Data Lake', desc: 'Almacena informe pericial firmado digitalmente con validez ante Juzgado de Letras del Trabajo.' }
      ]
    }
  };

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(0);

    const steps = simulationScenarios[selectedSimulationScenario].steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setSimulationStep(currentStep);
        setSelectedLayer(steps[currentStep].layer - 1);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulating(false);
          setSimulationStep(-1);
        }, 1500);
      }
    }, 1200);
  };

  // Mock API requests for the Interactive API Gateway
  const handleTestApi = () => {
    setApiLoading(true);
    setTimeout(() => {
      if (apiEndpointSelected === 'eval_test') {
        setApiResponse({
          status: 200,
          success: true,
          executionTimeMs: 14.8,
          timestamp: new Date().toISOString(),
          data: {
            testCode: 'TEST-2026-9041',
            driverRut: '14.890.123-5',
            alcoholGramsPerLiter: 0.28,
            alcoholVerdict: 'positivo_infraccion',
            drugsVerdict: 'negativo',
            overallStatus: 'no_apto_bloqueado',
            complianceViolation: 'Ley Emilia Art. 193 bis / Código del Trabajo Art. 184',
            interlockTriggered: true,
            vehicleInterlockSignal: 'CAN_BUS_DISABLE_IGNITION',
            auditHashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
          }
        });
      } else if (apiEndpointSelected === 'random_draw') {
        setApiResponse({
          status: 201,
          success: true,
          executionTimeMs: 22.4,
          timestamp: new Date().toISOString(),
          data: {
            batchId: 'BATCH-2026-0831',
            base: 'Faena El Teniente',
            eligibleDriversCount: 52,
            selectedDriversCount: 11,
            sampleRatio: '21.1%',
            algorithm: 'SHA-256 Cryptographic PRNG',
            susesoComplianceVerified: true,
            seedHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
          }
        });
      } else if (apiEndpointSelected === 'interlock_status') {
        setApiResponse({
          status: 200,
          success: true,
          executionTimeMs: 6.2,
          timestamp: new Date().toISOString(),
          data: {
            plate: 'KJ-88-21',
            truckModel: 'Volvo FH 540 6x4',
            assignedDriver: 'José Morales Contreras',
            driverStatus: 'bloqueado_preventivo',
            interlockStatus: 'BLOCKED_ACTIVE',
            canBusSignal: '0x00_ENGINE_CRANK_INHIBITED',
            gpsTrackerSync: 'Webfleet API connected',
            lastSyncAt: new Date().toISOString()
          }
        });
      }
      setApiLoading(false);
    }, 450);
  };

  const activeLayerData = architectureLayers[selectedLayer];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
              ARQUITECTURA EMPRESARIAL • STACK DE 7 CAPAS
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 border border-emerald-500/30">
              <Activity className="w-3 h-3" /> SLA GLOBAL 99.99%
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Topología del Sistema & Flujo de Datos End-to-End
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mapeo interactivo del flujo: Usuarios → Frontend → API Gateway → Microservicios → Motor Compliance + Riesgo → Base de Datos + Data Lake → Integraciones Externas.
          </p>
        </div>

        {/* Simulation Scenario Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSimulationScenario}
            onChange={(e) => setSelectedSimulationScenario(e.target.value as any)}
            disabled={isSimulating}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="positive_test">Escenario 1: Alcotest Positivo & Interlock de Bloqueo</option>
            <option value="random_draw">Escenario 2: Sorteo Criptográfico SUSESO</option>
            <option value="custody_sync">Escenario 3: Sincronización Cadena de Custodia LIMS</option>
          </select>

          <button
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl shadow transition cursor-pointer ${
              isSimulating
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Simulando Paquete...' : 'Simular Flujo'}</span>
          </button>
        </div>
      </div>

      {/* Interactive 7-Tier Architecture Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Workflow className="w-4 h-4 text-blue-400" />
            Diagrama de Arquitectura en Cascada (7 Capas)
          </h2>
          <span className="text-[11px] text-slate-400">
            Haga clic en cualquier nivel para inspeccionar especificaciones técnicas
          </span>
        </div>

        {/* Simulation Progress Ribbon */}
        {isSimulating && (
          <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 animate-spin" />
              <div>
                <span className="font-bold text-white">
                  Paso {simulationStep + 1} de {simulationScenarios[selectedSimulationScenario].steps.length}:{' '}
                </span>
                <span className="text-blue-300">
                  {simulationScenarios[selectedSimulationScenario].steps[simulationStep]?.title}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              {simulationScenarios[selectedSimulationScenario].steps[simulationStep]?.desc}
            </p>
          </div>
        )}

        {/* Visual Stack Cards */}
        <div className="space-y-2.5">
          {architectureLayers.map((layer, index) => {
            const Icon = layer.icon;
            const isSelected = selectedLayer === index;
            const isCurrentSimStep = isSimulating && simulationScenarios[selectedSimulationScenario].steps[simulationStep]?.layer === layer.id;

            return (
              <div key={layer.id} className="relative">
                <div
                  onClick={() => setSelectedLayer(index)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCurrentSimStep
                      ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20'
                      : isSelected
                      ? 'border-blue-500 bg-slate-800/90 shadow-md shadow-blue-500/10'
                      : 'border-slate-800 bg-slate-850 hover:bg-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  {/* Left Layer Label */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${layer.color} text-white shadow-md flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                          {layer.tierCode}
                        </span>
                        <h3 className="font-bold text-sm text-white">{layer.title}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${layer.badgeColor}`}>
                          {layer.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 truncate max-w-xl">{layer.subtitle}</p>
                    </div>
                  </div>

                  {/* Right Metrics */}
                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <div className="hidden sm:block text-right">
                      <span className="text-[10px] text-slate-400 block">SLA</span>
                      <span className="text-emerald-400 font-bold">{layer.uptime}</span>
                    </div>
                    <div className="hidden sm:block text-right">
                      <span className="text-[10px] text-slate-400 block">Latencia</span>
                      <span className="text-blue-400 font-bold">{layer.latency}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="text-[11px] font-sans">Detalle</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Flow Connector Arrow between tiers */}
                {index < architectureLayers.length - 1 && (
                  <div className="flex justify-center -my-1 py-0.5 relative z-10">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                      <ArrowDown className="w-3 h-3 text-blue-400" />
                      <span>{layer.protocols[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Layer Deep-Dive & Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layer Specification (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400">{activeLayerData.tierCode}</span>
                <h3 className="font-bold text-base text-white">{activeLayerData.title}</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">{activeLayerData.summary}</p>
            </div>
            <span className={`text-xs font-mono px-2.5 py-1 rounded border ${activeLayerData.badgeColor}`}>
              {activeLayerData.status}
            </span>
          </div>

          {/* Subcomponents Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Componentes & Módulos Implementados
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeLayerData.components.map((c, i) => (
                <div key={i} className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1">
                  <p className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{c.name}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Protocols */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Protocolos & Estándares:</span>
            {activeLayerData.protocols.map((p, i) => (
              <span key={i} className="text-[10px] font-mono bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive API Gateway & Endpoint Tester (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs text-slate-200 uppercase">API Gateway Explorer</h3>
              </div>
              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                HTTPS LIVE
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Pruebe en tiempo real las respuestas del API Gateway y la orquestación de microservicios:
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Seleccionar Endpoint</label>
              <select
                value={apiEndpointSelected}
                onChange={(e) => {
                  setApiEndpointSelected(e.target.value);
                  setApiResponse(null);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="eval_test">POST /api/v1/tests/eval (Evaluación Alcotest)</option>
                <option value="random_draw">POST /api/v1/random-selection/draw (Sorteo SUSESO)</option>
                <option value="interlock_status">GET /api/v1/interlock/truck/KJ-88-21 (Estado CAN-Bus)</option>
              </select>
            </div>

            <button
              onClick={handleTestApi}
              disabled={apiLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              {apiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Ejecutar Request en API Gateway</span>
            </button>
          </div>

          {/* Response Payload Viewer */}
          <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-850">
              <span>Status: {apiResponse ? `${apiResponse.status} OK` : 'Waiting execution'}</span>
              <span>{apiResponse ? `${apiResponse.executionTimeMs} ms` : '0 ms'}</span>
            </div>
            <pre className="text-[10px] text-emerald-300 font-mono max-h-48 overflow-y-auto pt-1 leading-tight">
              {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// Presione "Ejecutar Request" para simular payload...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
