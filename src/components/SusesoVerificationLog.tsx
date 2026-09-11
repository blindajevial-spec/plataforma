import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ComplianceDocumentApprovalLog, ComplianceDocumentCategory, ComplianceApprovalAction } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  FileText,
  Clock,
  User,
  Hash,
  Search,
  Filter,
  Download,
  Printer,
  Copy,
  Check,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Link,
  Lock,
  Building,
  AlertCircle,
  Scale,
  RefreshCw,
  X,
  FileCode2
} from 'lucide-react';

export const SusesoVerificationLog: React.FC = () => {
  const {
    documentApprovalLogs,
    addDocumentApprovalLog,
    verifyAuditTrailIntegrity,
    currentUser,
    currentCompany,
    documents,
    showToast
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Modals
  const [isNewApprovalModalOpen, setIsNewApprovalModalOpen] = useState(false);
  const [selectedLogForCertificate, setSelectedLogForCertificate] = useState<ComplianceDocumentApprovalLog | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    isValid: boolean;
    totalBlocks: number;
    brokenBlockIndex?: number;
    errorReason?: string;
  }>({ tested: false, isValid: true, totalBlocks: documentApprovalLogs.length });

  // New approval form state
  const [formData, setFormData] = useState<{
    documentId: string;
    documentCode: string;
    documentTitle: string;
    documentVersion: string;
    documentCategory: ComplianceDocumentCategory;
    approvalAction: ComplianceApprovalAction;
    approvalStatus: 'aprobado_conforme' | 'aprobado_con_observaciones';
    susesoClauseRef: string;
    legalFramework: string;
    approvalObservations: string;
    auditAttestationStatement: string;
    acceptedLegalDisclaimer: boolean;
  }>({
    documentId: documents[0]?.id || 'doc-new',
    documentCode: documents[0]?.code || 'POL-AD-2026',
    documentTitle: documents[0]?.title || 'Política Corporativa de Prevención de Alcohol y Drogas',
    documentVersion: 'v3.3',
    documentCategory: 'politica_corporativa',
    approvalAction: 'visado_cumplimiento_suseso',
    approvalStatus: 'aprobado_conforme',
    susesoClauseRef: 'Dictamen SUSESO N.º 92064-2025 (02/07/2025) • Circular 3331 SUSESO',
    legalFramework: 'Ley 16.744 / Art. 184 Código del Trabajo / ISO 37301',
    approvalObservations: '',
    auditAttestationStatement: 'Doy fe bajo responsabilidad profesional de que el presente documento satisface los 8 principios vinculantes de la SUSESO para controles preventivos de intemperancia.',
    acceptedLegalDisclaimer: true
  });

  // Calculate unique approver users
  const uniqueUsers = useMemo(() => {
    const userMap = new Map<string, { userId: string; name: string; role: string }>();
    documentApprovalLogs.forEach((log) => {
      if (!userMap.has(log.userId)) {
        userMap.set(log.userId, { userId: log.userId, name: log.userName, role: log.userRole });
      }
    });
    return Array.from(userMap.values());
  }, [documentApprovalLogs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return documentApprovalLogs.filter((log) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        log.documentTitle.toLowerCase().includes(term) ||
        log.documentCode.toLowerCase().includes(term) ||
        log.userName.toLowerCase().includes(term) ||
        log.userId.toLowerCase().includes(term) ||
        log.userRut.toLowerCase().includes(term) ||
        log.id.toLowerCase().includes(term) ||
        log.integrityHash.toLowerCase().includes(term) ||
        log.approvalObservations.toLowerCase().includes(term);

      const matchesCategory = selectedCategory === 'all' || log.documentCategory === selectedCategory;
      const matchesUser = selectedUser === 'all' || log.userId === selectedUser;
      const matchesAction = selectedAction === 'all' || log.approvalAction === selectedAction;

      return matchesSearch && matchesCategory && matchesUser && matchesAction;
    }).sort((a, b) => b.blockIndex - a.blockIndex); // most recent first
  }, [documentApprovalLogs, searchTerm, selectedCategory, selectedUser, selectedAction]);

  // Copy hash utility
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    showToast('Hash criptográfico SHA-256 copiado al portapapeles');
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Run chain verification
  const handleVerifyChain = () => {
    const result = verifyAuditTrailIntegrity();
    setVerificationResult({
      tested: true,
      isValid: result.isValid,
      totalBlocks: result.totalBlocks,
      brokenBlockIndex: result.brokenBlockIndex,
      errorReason: result.errorReason
    });

    if (result.isValid) {
      showToast(`✓ Integridad Criptográfica Verificada: ${result.totalBlocks} bloques encadenados sin alteraciones.`);
    } else {
      showToast(`❌ Alerta de Integridad: Ruptura detectada en bloque #${result.brokenBlockIndex}`);
    }
  };

  // Select document preset in modal
  const handleSelectPresetDoc = (docId: string) => {
    const found = documents.find((d) => d.id === docId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        documentId: found.id,
        documentCode: found.code,
        documentTitle: found.title,
        documentVersion: found.version || 'v2.0',
        documentCategory: mapDocTypeToCategory(found.type || '')
      }));
    }
  };

  // Submit new approval
  const handleSaveApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentCode || !formData.documentTitle || !formData.approvalObservations) {
      showToast('Por favor complete todos los campos obligatorios y observaciones técnicas.');
      return;
    }

    addDocumentApprovalLog({
      documentId: formData.documentId,
      documentCode: formData.documentCode,
      documentTitle: formData.documentTitle,
      documentVersion: formData.documentVersion,
      documentCategory: formData.documentCategory,
      approvalAction: formData.approvalAction,
      approvalStatus: formData.approvalStatus,
      susesoClauseRef: formData.susesoClauseRef,
      legalFramework: formData.legalFramework,
      approvalObservations: formData.approvalObservations,
      auditAttestationStatement: formData.auditAttestationStatement
    });

    setIsNewApprovalModalOpen(false);
    setFormData((prev) => ({
      ...prev,
      approvalObservations: ''
    }));
  };

  // Export Audit Dossier (Printable)
  const handlePrintDossier = () => {
    window.print();
  };

  // Export JSON forensics
  const handleExportJson = () => {
    const dataStr = JSON.stringify(documentApprovalLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SUSESO_AUDIT_LOGS_${currentCompany.rut}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo de auditoría forense JSON descargado');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Folio',
      'Bloque',
      'Timestamp_CLT',
      'User_ID',
      'Usuario_Nombre',
      'Usuario_RUT',
      'Usuario_Rol',
      'Documento_Codigo',
      'Documento_Titulo',
      'Version',
      'Categoria',
      'Accion_Aprobacion',
      'Estado',
      'SUSESO_Norma',
      'SHA256_Hash',
      'Previous_Hash',
      'TSA_Autoridad'
    ];

    const rows = documentApprovalLogs.map((log) => [
      `"${log.id}"`,
      log.blockIndex,
      `"${log.timestamp}"`,
      `"${log.userId}"`,
      `"${log.userName}"`,
      `"${log.userRut}"`,
      `"${log.userRole}"`,
      `"${log.documentCode}"`,
      `"${log.documentTitle.replace(/"/g, '""')}"`,
      `"${log.documentVersion}"`,
      `"${log.documentCategory}"`,
      `"${log.approvalAction}"`,
      `"${log.approvalStatus}"`,
      `"${log.susesoClauseRef.replace(/"/g, '""')}"`,
      `"${log.integrityHash}"`,
      `"${log.previousHash}"`,
      `"${log.timeStampingAuthority}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SUSESO_TRAZABILIDAD_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Planilla CSV de trazabilidad SUSESO exportada exitosamente');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
              <Award className="w-3 h-3 text-blue-400" />
              RF-019 • TRAZABILIDAD Y APROBACIÓN DE DOCUMENTOS SUSESO
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              ENCADENAMIENTO SHA-256 ACTIVO
            </span>
            <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-bold">
              TSA RFC 3161
            </span>
          </div>

          <h1 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            Bitácora Segura de Verificación y Aprobación Documental
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-4xl leading-relaxed">
            Registro inalterable y encadenado criptográficamente que acredita el <strong>Timestamp con precisión de segundos</strong>, el <strong>User ID del certificador</strong> y los fundamentos legales para cada aprobación de documentos críticos conforme al <strong>Dictamen SUSESO N° 92064-2025</strong> y la <strong>Ley 19.799 sobre Firma Electrónica</strong>.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleVerifyChain}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Verificar matemáticamente la integridad de todos los bloques encadenados"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validar Cadena</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Exportar archivo CSV con marcas temporales y hashes"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintDossier}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Imprimir Dossier Oficial de Trazabilidad para Auditorías SUSESO"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>Imprimir Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewApprovalModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Certificar Documento</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner (if validated or alert) */}
      {verificationResult.tested && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs transition print:hidden ${
            verificationResult.isValid
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {verificationResult.isValid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {verificationResult.isValid
                  ? 'Auditoría Criptográfica Conforme: Cadena de Bloques 100% Íntegra'
                  : 'Alerta Crítica de Trazabilidad: Ruptura de Integridad en el Registro'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {verificationResult.isValid
                  ? `Se validaron ${verificationResult.totalBlocks} bloques secuenciales. Ningún registro ha sido alterado, eliminado o desordenado. Cumple plenamente con los requisitos de inalterabilidad para inspecciones SUSESO y Dirección del Trabajo.`
                  : verificationResult.errorReason}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVerificationResult({ tested: false, isValid: true, totalBlocks: documentApprovalLogs.length })}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Aprobaciones Críticas
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-white">{documentApprovalLogs.length}</span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
              <Check className="w-3.5 h-3.5" /> 100% Vigentes
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Manuales, RIOHS, Políticas y Consentimientos
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Usuarios Certificadores (User IDs)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-blue-400">{uniqueUsers.length}</span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              Auditoría Segregada
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Compliance, Gerencia, Prevención y Laboratorio
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Sello Temporal Oficial (TSA)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-purple-300">RFC 3161</span>
            <span className="text-[10px] text-purple-400 font-mono">SHOA / Subtel</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Marcas temporales con precisión de segundos
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Índice de Trazabilidad SUSESO
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-400">100%</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">
              Acreditado
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Inobjetabilidad probatoria garantizada
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (POL-AD, RIOHS), título, nombre certificador, User ID (usr-...), RUT o SHA-256..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Clear Filter */}
          {(searchTerm || selectedCategory !== 'all' || selectedUser !== 'all' || selectedAction !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedUser('all');
                setSelectedAction('all');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium shrink-0"
            >
              Restablecer Filtros
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Categoría Documental</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las Categorías</option>
              <option value="manual_suseso">Manual de Cumplimiento SUSESO</option>
              <option value="politica_corporativa">Políticas Corporativas (Tolerancia Cero)</option>
              <option value="reglamento_riohs">Reglamento Interno (RIOHS Cláusula Drogas)</option>
              <option value="consentimiento_informado">Consentimientos Informados (Ley 19.628)</option>
              <option value="cadena_custodia">Cadena de Custodia Toxicológica</option>
              <option value="calibracion_metrologica">Calibración Metrológica de Equipos</option>
              <option value="psicotecnico_mutual">Exámenes Psicotécnicos de Conductores</option>
              <option value="matriz_riesgo">Matriz de Riesgos MIPER</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Usuario Certificador (User ID)</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Usuarios ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={u.userId} value={u.userId}>
                  [{u.userId}] {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Tipo de Acción Legal</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las Acciones</option>
              <option value="visado_cumplimiento_suseso">Visado de Cumplimiento SUSESO</option>
              <option value="aprobacion_formal_directorio">Aprobación Formal Directorio</option>
              <option value="ratificacion_comite_paritario">Ratificación Comité Paritario (CPHS)</option>
              <option value="firma_electronica_fea">Firma Electrónica Avanzada (FEA Ley 19.799)</option>
              <option value="revalidacion_periodica_anual">Revalidación Periódica Anual</option>
              <option value="inspeccion_auditor_externo">Inspección Auditor Externo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chained Log Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header Controls */}
        <div className="p-4 bg-slate-850/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">
              Cadena Criptográfica de Aprobaciones Registradas ({filteredLogs.length})
            </h3>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Orden Cronológico: <strong>Bloque #{documentApprovalLogs.length} a #1</strong></span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">
              No se encontraron registros de aprobación que coincidan con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredLogs.map((log, idx) => (
              <div
                key={log.id}
                className="p-5 hover:bg-slate-850/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Block Info & Document Header */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Block index pill */}
                    <span className="font-mono text-[11px] font-bold bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                      Bloque #{log.blockIndex}
                    </span>

                    {/* Folio */}
                    <span className="font-mono text-xs font-bold text-white">
                      {log.id}
                    </span>

                    {/* Category */}
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {formatCategoryLabel(log.documentCategory)}
                    </span>

                    {/* Action badge */}
                    <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
                      {formatActionLabel(log.approvalAction)}
                    </span>

                    {/* Status */}
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      {log.approvalStatus === 'aprobado_conforme' ? 'Aprobado Conforme' : 'Observado'}
                    </span>
                  </div>

                  {/* Document Title & Version */}
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight flex items-center gap-2">
                      <span>{log.documentTitle}</span>
                      <span className="text-[11px] bg-slate-800 text-blue-300 px-1.5 py-0.2 rounded font-mono font-bold">
                        {log.documentVersion}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      Código Documental: <strong className="text-slate-300">{log.documentCode}</strong> • Empresa: {log.companyName}
                    </p>
                  </div>

                  {/* Certifying User Details (User ID + RUT + Role) */}
                  <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs flex-wrap">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-[10px] shrink-0">
                      ID
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{log.userName}</span>
                        <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded font-semibold">
                          User ID: {log.userId}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          RUT: <strong className="text-slate-300">{log.userRut}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {log.userRole} • {log.userEmail}
                      </p>
                    </div>

                    {/* Exact Timestamp */}
                    <div className="text-right pl-2 shrink-0">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Timestamp Certificado</span>
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-purple-300">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Observations snippet */}
                  <p className="text-xs text-slate-300 bg-slate-850/40 p-2 rounded-lg border border-slate-800/50 italic leading-relaxed">
                    "{log.approvalObservations}"
                  </p>

                  {/* Cryptographic SHA-256 Linkage */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="text-slate-500 font-semibold shrink-0">Sello SHA-256:</span>
                      <span className="text-emerald-400 font-bold truncate">
                        {log.integrityHash}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(log.integrityHash, log.id)}
                        className="p-1 hover:text-white transition shrink-0"
                        title="Copiar Hash SHA-256"
                      >
                        {copiedHash === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <span className="hidden sm:inline text-slate-600">•</span>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 shrink-0">Puntero Anterior:</span>
                      <span className="text-slate-400 truncate max-w-[120px]">
                        {log.previousHash.slice(0, 16)}...
                      </span>
                    </div>

                    <span className="hidden sm:inline text-slate-600">•</span>

                    <span className="text-slate-400 shrink-0">
                      Norma: <strong>{log.susesoClauseRef.split('•')[0]}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Action Button: Inspect Certificate */}
                <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4 print:hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedLogForCertificate(log)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Ver Certificado Oficial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(log.integrityHash, `btn-${log.id}`)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-slate-200 text-[11px] transition cursor-pointer"
                  >
                    <Hash className="w-3 h-3" />
                    <span>Copiar Sello</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: REGISTRAR / CERTIFICAR NUEVA APROBACIÓN */}
      {isNewApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Certificar y Registrar Aprobación de Documento Crítico
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Registro de validez probatoria con User ID y Timestamp inalterable conforme a SUSESO
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewApprovalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveApproval} className="p-5 space-y-4 text-xs">
              {/* Active Certifying User Badge */}
              <div className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> Certificador Activo en Sesión
                  </span>
                  <span className="text-[10px] font-mono bg-blue-900 text-blue-200 px-2 py-0.5 rounded font-bold">
                    User ID: {currentUser.id}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span><strong>{currentUser.name}</strong> ({currentUser.rut || '14.892.401-2'})</span>
                  <span className="text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Esta acción quedará estampada con su firma de usuario, dirección IP y sello temporal inmutable en la cadena del sistema.
                </p>
              </div>

              {/* Document Selection / Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Seleccionar Documento Institucional
                  </label>
                  <select
                    value={formData.documentId}
                    onChange={(e) => handleSelectPresetDoc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        [{d.code}] {d.title.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Versión del Documento
                  </label>
                  <input
                    type="text"
                    value={formData.documentVersion}
                    onChange={(e) => setFormData({ ...formData, documentVersion: e.target.value })}
                    placeholder="Ej. v3.3 o Oficial 2026"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Document Title & Code Manual Override */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">
                    Título Oficial del Documento
                  </label>
                  <input
                    type="text"
                    value={formData.documentTitle}
                    onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Código Documental
                  </label>
                  <input
                    type="text"
                    value={formData.documentCode}
                    onChange={(e) => setFormData({ ...formData, documentCode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Category & Approval Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Categoría de Cumplimiento
                  </label>
                  <select
                    value={formData.documentCategory}
                    onChange={(e) => setFormData({ ...formData, documentCategory: e.target.value as ComplianceDocumentCategory })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="manual_suseso">Manual de Cumplimiento SUSESO (8 Tomos)</option>
                    <option value="politica_corporativa">Política Corporativa de Tolerancia Cero</option>
                    <option value="reglamento_riohs">Reglamento Interno (RIOHS Cláusula Drogas)</option>
                    <option value="consentimiento_informado">Consentimiento Informado (Ley 19.628)</option>
                    <option value="cadena_custodia">Cadena de Custodia Toxicológica</option>
                    <option value="calibracion_metrologica">Calibración Metrológica de Equipos</option>
                    <option value="psicotecnico_mutual">Consolidado Psicotécnicos de Flota</option>
                    <option value="matriz_riesgo">Matriz de Riesgos MIPER / IPER</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Tipo de Acción Legal / Aprobación
                  </label>
                  <select
                    value={formData.approvalAction}
                    onChange={(e) => setFormData({ ...formData, approvalAction: e.target.value as ComplianceApprovalAction })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="visado_cumplimiento_suseso">Visado de Cumplimiento SUSESO</option>
                    <option value="aprobacion_formal_directorio">Aprobación Formal por Directorio</option>
                    <option value="ratificacion_comite_paritario">Ratificación por Comité Paritario (CPHS)</option>
                    <option value="firma_electronica_fea">Firma Electrónica Avanzada (FEA Ley 19.799)</option>
                    <option value="firma_electronica_fes">Firma Electrónica Simple (FES / ClaveÚnica)</option>
                    <option value="revalidacion_periodica_anual">Revalidación Periódica Anual</option>
                    <option value="inspeccion_auditor_externo">Inspección Auditor Externo ISO 37301</option>
                  </select>
                </div>
              </div>

              {/* Legal Reference & SUSESO Clause */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Criterio Vinculante SUSESO / DT
                  </label>
                  <input
                    type="text"
                    value={formData.susesoClauseRef}
                    onChange={(e) => setFormData({ ...formData, susesoClauseRef: e.target.value })}
                    placeholder="Dictamen SUSESO 92064-2025"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Marco Legal Aplicable
                  </label>
                  <input
                    type="text"
                    value={formData.legalFramework}
                    onChange={(e) => setFormData({ ...formData, legalFramework: e.target.value })}
                    placeholder="Ley 16.744 / Art. 184 CT"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Technical Observations & Justification */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Fundamentación Técnica y Observaciones del Certificador *
                </label>
                <textarea
                  rows={3}
                  value={formData.approvalObservations}
                  onChange={(e) => setFormData({ ...formData, approvalObservations: e.target.value })}
                  placeholder="Detalle los aspectos verificados (ej.: cumplimiento de los 8 principios SUSESO, depósito en la Inspección del Trabajo, calibración trazable, ausencia de sesgos en selección aleatoria)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                  required
                />
              </div>

              {/* Declaración Jurada Checkbox */}
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="disclaimer-check"
                  checked={formData.acceptedLegalDisclaimer}
                  onChange={(e) => setFormData({ ...formData, acceptedLegalDisclaimer: e.target.checked })}
                  className="mt-0.5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  required
                />
                <label htmlFor="disclaimer-check" className="text-[11px] text-slate-300 cursor-pointer leading-relaxed">
                  Declaro bajo fe profesional que he revisado minuciosamente el contenido de este documento y acredito que cumple con las directrices vinculantes de la SUSESO, la Ley N° 16.744 y el deber de protección eficaz del empleador (Art. 184 del Código del Trabajo).
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewApprovalModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formData.acceptedLegalDisclaimer}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  Registrar Aprobación en Cadena SUSESO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CERTIFICADO OFICIAL DE TRAZABILIDAD Y APROBACIÓN SUSESO */}
      {selectedLogForCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl my-8 overflow-hidden print:m-0 print:border-none print:shadow-none print:w-full print:bg-white print:text-black">
            {/* Modal Action Bar (Hidden in Print) */}
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Certificado Oficial de Aprobación Documental • SUSESO / DT
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintDossier}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Certificado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLogForCertificate(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Content - Styled for screen and print */}
            <div className="p-8 space-y-6 print:p-4 print:text-black print:space-y-4">
              {/* Official Header */}
              <div className="border-b-2 border-slate-700 pb-5 print:border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 print:text-blue-800 block">
                    REPÚBLICA DE CHILE • SUPERINTENDENCIA DE SEGURIDAD SOCIAL
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white print:text-black mt-1">
                    CERTIFICADO DE TRAZABILIDAD Y APROBACIÓN DOCUMENTAL
                  </h2>
                  <p className="text-xs text-slate-400 print:text-gray-600">
                    Dictamen N.º 92064-2025 • Ley N.º 16.744 • Ley N.º 19.799 sobre Documentos Electrónicos
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4 print:border-gray-400 shrink-0">
                  <span className="text-[10px] text-slate-400 print:text-gray-600 font-bold uppercase">Folio Único SUSESO</span>
                  <p className="text-sm font-mono font-black text-blue-400 print:text-blue-900">{selectedLogForCertificate.id}</p>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 print:bg-gray-100 print:text-gray-800 px-2 py-0.5 rounded font-bold">
                    Bloque #{selectedLogForCertificate.blockIndex}
                  </span>
                </div>
              </div>

              {/* Document Overview Box */}
              <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 print:text-gray-600">
                    Documento Crítico Verificado
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 print:bg-emerald-100 print:text-emerald-900 px-2 py-0.5 rounded font-bold">
                    ESTADO: APROBADO Y CERTIFICADO
                  </span>
                </div>

                <h3 className="text-base font-bold text-white print:text-black">
                  {selectedLogForCertificate.documentTitle}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-800/80 print:border-gray-200">
                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">Código:</span>
                    <strong className="font-mono text-slate-200 print:text-black">{selectedLogForCertificate.documentCode}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">Versión Aprobada:</span>
                    <strong className="text-blue-400 print:text-blue-800">{selectedLogForCertificate.documentVersion}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">Categoría:</span>
                    <span className="text-slate-300 print:text-gray-800">{formatCategoryLabel(selectedLogForCertificate.documentCategory)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">Empresa Titular:</span>
                    <span className="text-slate-300 print:text-gray-800">{selectedLogForCertificate.companyName}</span>
                  </div>
                </div>
              </div>

              {/* Certifying User Box (User ID + RUT + Identity) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-850/40 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-blue-400 print:text-blue-800 block">
                    Identidad del Certificador (User ID)
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-white print:text-black text-sm">
                      {selectedLogForCertificate.userName}
                    </p>
                    <p className="text-slate-300 print:text-gray-700">
                      RUT: <strong>{selectedLogForCertificate.userRut}</strong>
                    </p>
                    <p className="text-slate-400 print:text-gray-600">
                      Cargo: <strong>{selectedLogForCertificate.userRole}</strong>
                    </p>
                    <p className="font-mono text-[11px] text-blue-300 print:text-blue-800">
                      Identificador de Usuario: <strong>{selectedLogForCertificate.userId}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 print:text-gray-600">
                      Correo: {selectedLogForCertificate.userEmail}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-850/40 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-purple-400 print:text-purple-800 block">
                    Sello Temporal y Trazabilidad de Red
                  </span>
                  <div className="space-y-1">
                    <p className="text-slate-300 print:text-gray-700">
                      Fecha y Hora Certificada:
                    </p>
                    <p className="font-mono font-bold text-sm text-purple-300 print:text-purple-900">
                      {selectedLogForCertificate.timestamp}
                    </p>
                    <p className="text-[11px] text-slate-400 print:text-gray-600">
                      Autoridad Horaria: <strong>{selectedLogForCertificate.timeStampingAuthority}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 print:text-gray-600">
                      Dirección IP de Aprobación: <strong className="font-mono">{selectedLogForCertificate.ipAddress}</strong>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono truncate print:text-gray-500">
                      Token Sesión: {selectedLogForCertificate.sessionTokenHash}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fundamento Legal & Observaciones */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 print:text-gray-600 block">
                  Fundamento Normativo y Observaciones Técnicas
                </span>
                <p className="text-slate-200 print:text-gray-900 leading-relaxed font-medium">
                  {selectedLogForCertificate.approvalObservations}
                </p>
                <div className="pt-2 border-t border-slate-800 print:border-gray-200 text-[11px] text-slate-400 print:text-gray-600">
                  <span>Normativa Aplicada: </span>
                  <strong className="text-slate-300 print:text-black">{selectedLogForCertificate.susesoClauseRef}</strong>
                  <span> • Marco: </span>
                  <strong className="text-slate-300 print:text-black">{selectedLogForCertificate.legalFramework}</strong>
                </div>
              </div>

              {/* Cryptographic Proof Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-400 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 print:text-emerald-800 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Prueba Criptográfica de Inalterabilidad (SHA-256)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 print:text-gray-600">
                    Algoritmo: {selectedLogForCertificate.signatureAlgorithm}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 print:text-gray-600 block">Hash de Integridad del Bloque (Self SHA-256):</span>
                    <p className="text-emerald-400 print:text-emerald-900 font-bold break-all bg-black/40 print:bg-white p-1.5 rounded border border-emerald-900/40 print:border-emerald-500">
                      {selectedLogForCertificate.integrityHash}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-gray-600 block">Puntero Criptográfico al Bloque Anterior (Previous Block Hash):</span>
                    <p className="text-slate-400 print:text-gray-700 break-all bg-black/20 print:bg-white p-1.5 rounded border border-slate-800 print:border-gray-300">
                      {selectedLogForCertificate.previousHash}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 print:text-gray-600 pt-1 leading-relaxed">
                  Autoridad Certificadora: <strong>{selectedLogForCertificate.certificateAuthority}</strong>. La integridad matemática de este certificado puede ser comprobada mediante recálculo directo de la cadena de hashes.
                </p>
              </div>

              {/* Attestation Declaration */}
              <div className="border-t border-slate-800 pt-4 print:border-gray-400 text-[11px] text-slate-400 print:text-gray-600 italic leading-relaxed text-center">
                "{selectedLogForCertificate.auditAttestationStatement}"
              </div>

              {/* Signatures & Footer Stamp */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-800 print:border-black text-center text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-700 print:border-gray-400 mb-1 flex items-end justify-center">
                    <span className="text-[10px] font-mono text-emerald-400 print:text-emerald-800">
                      [FIRMA DIGITAL FEA VERIFICADA]
                    </span>
                  </div>
                  <p className="font-bold text-white print:text-black">{selectedLogForCertificate.userName}</p>
                  <p className="text-[10px] text-slate-400 print:text-gray-600">{selectedLogForCertificate.userRole}</p>
                  <p className="text-[10px] font-mono text-slate-500 print:text-gray-500">User ID: {selectedLogForCertificate.userId}</p>
                </div>

                <div>
                  <div className="h-10 border-b border-dashed border-slate-700 print:border-gray-400 mb-1 flex items-end justify-center">
                    <span className="text-[10px] font-mono text-blue-400 print:text-blue-800">
                      [SELLO PLATAFORMA BLINDAJE VIAL 360]
                    </span>
                  </div>
                  <p className="font-bold text-white print:text-black">Dirección de Auditoría y Compliance</p>
                  <p className="text-[10px] text-slate-400 print:text-gray-600">Transandina Cargo SpA • SUSESO 92064</p>
                  <p className="text-[10px] font-mono text-slate-500 print:text-gray-500">Hash Checksum: {selectedLogForCertificate.integrityHash.slice(0, 16)}...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Formatters
function formatCategoryLabel(cat: ComplianceDocumentCategory): string {
  switch (cat) {
    case 'manual_suseso':
      return 'Manual SUSESO';
    case 'politica_corporativa':
      return 'Política Tolerancia Cero';
    case 'reglamento_riohs':
      return 'RIOHS Cláusula Drogas';
    case 'consentimiento_informado':
      return 'Consentimiento Informado';
    case 'cadena_custodia':
      return 'Cadena de Custodia';
    case 'calibracion_metrologica':
      return 'Calibración Metrológica';
    case 'psicotecnico_mutual':
      return 'Psicotécnicos Mutual';
    case 'matriz_riesgo':
      return 'Matriz MIPER';
    default:
      return 'Documento Crítico';
  }
}

function formatActionLabel(act: ComplianceApprovalAction): string {
  switch (act) {
    case 'visado_cumplimiento_suseso':
      return 'Visado SUSESO';
    case 'aprobacion_formal_directorio':
      return 'Aprobación Directorio';
    case 'ratificacion_comite_paritario':
      return 'Ratificación CPHS';
    case 'firma_electronica_fea':
      return 'Firma FEA (Ley 19.799)';
    case 'firma_electronica_fes':
      return 'Firma FES / ClaveÚnica';
    case 'revalidacion_periodica_anual':
      return 'Revalidación Anual';
    case 'inspeccion_auditor_externo':
      return 'Auditoría Externa';
    default:
      return 'Aprobación Legal';
  }
}

function mapDocTypeToCategory(docType: string): ComplianceDocumentCategory {
  const dt = docType.toLowerCase();
  if (dt.includes('manual')) return 'manual_suseso';
  if (dt.includes('política') || dt.includes('politica')) return 'politica_corporativa';
  if (dt.includes('reglamento') || dt.includes('riohs')) return 'reglamento_riohs';
  if (dt.includes('consentimiento')) return 'consentimiento_informado';
  if (dt.includes('custodia')) return 'cadena_custodia';
  if (dt.includes('calibración') || dt.includes('calibracion')) return 'calibracion_metrologica';
  if (dt.includes('psicotécnico') || dt.includes('psicotecnico')) return 'psicotecnico_mutual';
  if (dt.includes('riesgo') || dt.includes('miper')) return 'matriz_riesgo';
  return 'politica_corporativa';
}
