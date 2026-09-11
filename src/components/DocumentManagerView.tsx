import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentItem, DriverDocument, DriverDocumentType, DigitalSignatureStatus } from '../types';
import { SusesoManualModal } from './SusesoManualModal';
import { DriverDocValidationModal } from './documents/DriverDocValidationModal';
import { DriverDocRenewModal } from './documents/DriverDocRenewModal';
import { DriverDocSignModal } from './documents/DriverDocSignModal';
import { DriverDocUploadModal } from './documents/DriverDocUploadModal';
import { SusesoVerificationLog } from './SusesoVerificationLog';
import {
  calculateExpiryStatus,
  analyzeSignature,
  formatDocType,
  SYSTEM_DATE
} from '../utils/documentValidation';
import {
  FolderLock,
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  FileBadge,
  Eye,
  BookOpen,
  Scale,
  X,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Calendar,
  User,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  AlertCircle,
  BadgeAlert,
  ChevronRight
} from 'lucide-react';

export const DocumentManagerView: React.FC = () => {
  const {
    documents,
    driverDocuments,
    drivers,
    addDocument,
    addDriverDocument,
    verifyDriverDocumentSignature,
    verifyAllDriverDocuments,
    renewDriverDocumentExpiry,
    signDriverDocument,
    documentApprovalLogs,
    currentCompany,
    currentUser,
    showToast
  } = useApp();

  // Active Tab: 'driver_docs' | 'institutional_docs' | 'suseso_verification_log'
  const [activeTab, setActiveTab] = useState<'driver_docs' | 'institutional_docs' | 'suseso_verification_log'>('driver_docs');

  // Filters for Driver Documents
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedDriverFilter, setSelectedDriverFilter] = useState('all');
  const [selectedExpiryFilter, setSelectedExpiryFilter] = useState<'all' | 'vigente' | 'por_vencer' | 'vencido'>('all');
  const [selectedSignatureFilter, setSelectedSignatureFilter] = useState<'all' | 'valida_fea' | 'valida_fes' | 'pendiente_firma'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  // Filters for Institutional Documents
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDriverUploadModalOpen, setIsDriverUploadModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [activeManualChapter, setActiveManualChapter] = useState('cap-01');
  const [selectedDocPreview, setSelectedDocPreview] = useState<DocumentItem | null>(null);

  // Driver Doc modals
  const [validatingDoc, setValidatingDoc] = useState<DriverDocument | null>(null);
  const [renewingDoc, setRenewingDoc] = useState<DriverDocument | null>(null);
  const [signingDoc, setSigningDoc] = useState<DriverDocument | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // New institutional doc form state
  const [newDoc, setNewDoc] = useState<Partial<DocumentItem>>({
    title: '',
    category: 'protocolo',
    code: `DOC-2026-${documents.length + 1}`,
    version: '1.0',
    expiryDate: '2027-12-31',
    status: 'vigente',
    fileSize: '1.2 MB'
  });

  // Calculate high-level compliance metrics for Driver Documents
  const driverDocMetrics = useMemo(() => {
    let validSignaturesCount = 0;
    let pendingSignaturesCount = 0;
    let expiredCount = 0;
    let expiringSoonCount = 0;
    let validCount = 0;

    driverDocuments.forEach((doc) => {
      const exp = calculateExpiryStatus(doc.expiryDate);
      if (exp.status === 'vencido') expiredCount++;
      else if (exp.status === 'por_vencer') expiringSoonCount++;
      else validCount++;

      const sig = analyzeSignature(doc.signatureStatus, doc.signatureHash);
      if (sig.isValid) validSignaturesCount++;
      if (sig.isPending) pendingSignaturesCount++;
    });

    const total = driverDocuments.length;
    const signatureComplianceRate = total > 0 ? Math.round((validSignaturesCount / total) * 100) : 100;
    const expiryComplianceRate = total > 0 ? Math.round((validCount / total) * 100) : 100;

    return {
      total,
      validSignaturesCount,
      pendingSignaturesCount,
      expiredCount,
      expiringSoonCount,
      validCount,
      signatureComplianceRate,
      expiryComplianceRate
    };
  }, [driverDocuments]);

  // Filtered Driver Documents
  const filteredDriverDocs = useMemo(() => {
    return driverDocuments.filter((doc) => {
      const term = driverSearch.toLowerCase();
      const matchesSearch =
        doc.title.toLowerCase().includes(term) ||
        doc.driverName.toLowerCase().includes(term) ||
        doc.driverRut.toLowerCase().includes(term) ||
        doc.code.toLowerCase().includes(term) ||
        doc.issuingEntity.toLowerCase().includes(term);

      const matchesDriver = selectedDriverFilter === 'all' || doc.driverId === selectedDriverFilter;

      const exp = calculateExpiryStatus(doc.expiryDate);
      const matchesExpiry = selectedExpiryFilter === 'all' || exp.status === selectedExpiryFilter;

      const matchesSignature =
        selectedSignatureFilter === 'all' || doc.signatureStatus === selectedSignatureFilter;

      const matchesType = selectedTypeFilter === 'all' || doc.type === selectedTypeFilter;

      return matchesSearch && matchesDriver && matchesExpiry && matchesSignature && matchesType;
    });
  }, [
    driverDocuments,
    driverSearch,
    selectedDriverFilter,
    selectedExpiryFilter,
    selectedSignatureFilter,
    selectedTypeFilter
  ]);

  // Filtered Institutional Documents
  const institutionalCategories = Array.from(new Set(documents.map((d) => d.category || 'general')));
  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'all' || (d.category || 'general') === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenDoc = (doc: DocumentItem) => {
    if (doc.code.includes('SUSESO') || doc.code.includes('MANUAL')) {
      setActiveManualChapter('cap-01');
      setIsManualModalOpen(true);
    } else {
      setSelectedDocPreview(doc);
    }
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title) return;

    addDocument({
      companyId: currentCompany.id,
      title: newDoc.title,
      category: newDoc.category || 'protocolo',
      code: newDoc.code || `DOC-2026-${documents.length + 1}`,
      version: newDoc.version || '1.0',
      uploadedAt: '2026-09-06',
      expiryDate: newDoc.expiryDate || '2027-12-31',
      uploadedBy: currentUser.name,
      fileSize: '2.4 MB',
      status: 'vigente'
    });

    setIsUploadModalOpen(false);
  };

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2500);
  };

  const handleNotifyDriver = (doc: DriverDocument) => {
    showToast(`Notificación preventiva enviada a ${doc.driverName} (${doc.driverRut}) para regularización de ${doc.title}.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Primary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/30">
              RF-016 • BÓVEDA DOCUMENTAL Y FIRMA ELECTRÓNICA
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              Ley N.º 19.799 • Dictamen SUSESO 92064-2025
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
              Fecha Sistema: {SYSTEM_DATE}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1.5">
            Gestor Documental y Evidencia Legal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Validación criptográfica de firmas digitales (FEA/FES) y control preventivo de vencimiento en expedientes de conductores y protocolos de intemperancia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeTab === 'driver_docs' ? (
            <>
              <button
                onClick={verifyAllDriverDocuments}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
                title="Ejecutar auditoría criptográfica masiva de firmas digitales"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Auditar Todas las Firmas</span>
              </button>

              <button
                onClick={() => setIsDriverUploadModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Cargar Documento Conductor</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setActiveManualChapter('cap-01');
                  setIsManualModalOpen(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Abrir Manual SUSESO (8 Tomos)</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Subir Documento</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('driver_docs')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'driver_docs'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Documentos de Conductores (Legajos y Validación)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'driver_docs' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {driverDocuments.length}
          </span>
          {driverDocMetrics.expiredCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Hay documentos vencidos" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('institutional_docs')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'institutional_docs'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bóveda Institucional y SUSESO</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'institutional_docs' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('suseso_verification_log')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'suseso_verification_log'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Bitácora de Verificación SUSESO (RF-019)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'suseso_verification_log' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {documentApprovalLogs.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DRIVER DOCUMENTS VALIDATION & MANAGEMENT                           */}
      {/* ========================================================================= */}
      {activeTab === 'driver_docs' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Metrics & Semáforo Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Total Documents */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Total Legajos</span>
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{driverDocMetrics.total}</div>
              <p className="text-[10px] text-slate-400 mt-1">Expedientes de choferes</p>
            </div>

            {/* Firmas Digitales Válidas */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Firmas Válidas (FEA/FES)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {driverDocMetrics.validSignaturesCount}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  ({driverDocMetrics.signatureComplianceRate}%)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Ley N.º 19.799 acreditadas</p>
            </div>

            {/* Firmas Pendientes */}
            <div className={`border rounded-2xl p-4 shadow-sm ${
              driverDocMetrics.pendingSignaturesCount > 0
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Firmas Pendientes</span>
                <KeyRound className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">
                {driverDocMetrics.pendingSignaturesCount}
              </div>
              <p className="text-[10px] text-amber-300/80 mt-1">Requieren firma del titular</p>
            </div>

            {/* Por Vencer (<= 30 días) */}
            <div className={`border rounded-2xl p-4 shadow-sm ${
              driverDocMetrics.expiringSoonCount > 0
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Por Vencer (≤ 30d)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">
                {driverDocMetrics.expiringSoonCount}
              </div>
              <p className="text-[10px] text-amber-300/80 mt-1">Alerta preventiva activa</p>
            </div>

            {/* Vencidos (Inhabilita despacho) */}
            <div className={`border rounded-2xl p-4 shadow-sm ${
              driverDocMetrics.expiredCount > 0
                ? 'bg-rose-950/30 border-rose-500/50'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Vencidos (Crítico)</span>
                <BadgeAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400">
                {driverDocMetrics.expiredCount}
              </div>
              <p className="text-[10px] text-rose-300/80 mt-1">Inhabilita despacho a ruta</p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              {/* Text search */}
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por conductor, RUT, código o título..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Conductor dropdown */}
                <select
                  value={selectedDriverFilter}
                  onChange={(e) => setSelectedDriverFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todos los Conductores ({drivers.length})</option>
                  {drivers.map((drv) => (
                    <option key={drv.id} value={drv.id}>
                      {drv.fullName} ({drv.rut})
                    </option>
                  ))}
                </select>

                {/* Expiry filter */}
                <select
                  value={selectedExpiryFilter}
                  onChange={(e) => setSelectedExpiryFilter(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Toda Vigencia</option>
                  <option value="vigente">Vigentes (&gt; 30 días)</option>
                  <option value="por_vencer">Por Vencer (≤ 30 días)</option>
                  <option value="vencido">Vencidos (Caducados)</option>
                </select>

                {/* Signature status filter */}
                <select
                  value={selectedSignatureFilter}
                  onChange={(e) => setSelectedSignatureFilter(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todas las Firmas</option>
                  <option value="valida_fea">Firma FEA Válida (Avanzada)</option>
                  <option value="valida_fes">Firma FES Válida (Simple)</option>
                  <option value="pendiente_firma">Pendiente de Firma</option>
                </select>

                {/* Type filter */}
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todos los Tipos</option>
                  <option value="licencia_conducir">Licencia Conducir</option>
                  <option value="psicotecnico_mutual">Psicotécnico Mutual</option>
                  <option value="consentimiento_suseso">Consentimiento SUSESO</option>
                  <option value="anexo_riohs_alcohol">Anexo RIOHS Alcohol</option>
                  <option value="odi_riesgos">ODI DS 40</option>
                  <option value="hoja_vida_conductor">Hoja de Vida Conductor</option>
                </select>

                {(driverSearch || selectedDriverFilter !== 'all' || selectedExpiryFilter !== 'all' || selectedSignatureFilter !== 'all' || selectedTypeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setDriverSearch('');
                      setSelectedDriverFilter('all');
                      setSelectedExpiryFilter('all');
                      setSelectedSignatureFilter('all');
                      setSelectedTypeFilter('all');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 cursor-pointer"
                  >
                    Restablecer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Driver Documents Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDriverDocs.map((doc) => {
              const expAnalysis = calculateExpiryStatus(doc.expiryDate);
              const sigAnalysis = analyzeSignature(doc.signatureStatus, doc.signatureHash);

              return (
                <div
                  key={doc.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4 transition flex flex-col justify-between ${
                    expAnalysis.isExpired
                      ? 'border-rose-500/50 bg-gradient-to-b from-rose-950/15 to-slate-900'
                      : expAnalysis.isCritical
                      ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/15 to-slate-900'
                      : sigAnalysis.isPending
                      ? 'border-amber-500/40 bg-slate-900'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Section: Driver & Document Identification */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
                          {doc.driverName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{doc.driverName}</span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                              {doc.driverRut}
                            </span>
                          </div>
                          <p className="text-[11px] text-blue-400 font-medium mt-0.5">
                            {formatDocType(doc.type)} • Folio: <span className="font-mono">{doc.code}</span>
                          </p>
                        </div>
                      </div>

                      {/* Document Type Badge */}
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 shrink-0">
                        {doc.fileName || `${doc.code}.pdf`}
                      </span>
                    </div>

                    <h3 className="font-semibold text-xs text-slate-200 mt-2.5 leading-snug">
                      {doc.title}
                    </h3>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <span className="text-slate-500">Emisor:</span>
                      <span className="text-slate-300 font-medium">{doc.issuingEntity}</span>
                    </div>
                  </div>

                  {/* Dual Validation Panels: Expiry Date & Digital Signature */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Expiration Status Panel */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        expAnalysis.isExpired
                          ? 'bg-rose-950/30 border-rose-500/40'
                          : expAnalysis.isCritical
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Vigencia</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${expAnalysis.badgeClass}`}>
                          {expAnalysis.label}
                        </span>
                      </div>
                      <div className="text-[11px] space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Vence:</span>
                          <span className="font-mono font-bold text-slate-200">{doc.expiryDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Emisión:</span>
                          <span className="font-mono text-slate-400">{doc.issueDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Digital Signature Status Panel */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        sigAnalysis.isValid
                          ? 'bg-blue-950/20 border-blue-500/40'
                          : sigAnalysis.isPending
                          ? 'bg-amber-950/25 border-amber-500/40'
                          : 'bg-rose-950/30 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                          <span>Firma Digital</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${sigAnalysis.badgeClass}`}>
                          {sigAnalysis.label}
                        </span>
                      </div>
                      <div className="text-[11px] space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Titular:</span>
                          <span className="text-slate-200 truncate max-w-[100px] text-[10px]">
                            {doc.signerName || 'Pendiente'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Tipo:</span>
                          <span className="text-slate-300 font-medium text-[10px]">{sigAnalysis.typeLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Hash Bar (if signed) */}
                  {doc.signatureHash ? (
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 text-slate-400 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-500">SHA-256:</span>
                        <span className="text-emerald-400 truncate">{doc.signatureHash.substring(0, 24)}...</span>
                      </div>
                      <button
                        onClick={() => handleCopyHash(doc.id, doc.signatureHash || '')}
                        className="text-slate-400 hover:text-white shrink-0 cursor-pointer p-1 rounded hover:bg-slate-800"
                        title="Copiar Hash SHA-256"
                      >
                        {copiedHashId === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-950/20 p-2 rounded-xl border border-amber-500/30 flex items-center justify-between gap-2 text-[10px]">
                      <span className="text-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Documento pendiente de firma electrónica por el conductor.</span>
                      </span>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setValidatingDoc(doc)}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-800"
                        title="Abrir inspector pericial de firma digital y sello de tiempo"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Validar Firma</span>
                      </button>

                      <button
                        onClick={() => setRenewingDoc(doc)}
                        className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-800"
                        title="Actualizar fecha de vencimiento y folio de certificado"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Renovar Vigencia</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {sigAnalysis.isPending && (
                        <button
                          onClick={() => setSigningDoc(doc)}
                          className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 py-1.5 px-3 rounded-xl shadow cursor-pointer"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Firmar</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleNotifyDriver(doc)}
                        className="text-xs text-slate-400 hover:text-slate-200 py-1 px-2 rounded-lg hover:bg-slate-800 cursor-pointer"
                        title="Enviar alerta preventiva al conductor"
                      >
                        Notificar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDriverDocs.length === 0 && (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No se encontraron documentos con los filtros seleccionados</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Pruebe ajustando el término de búsqueda o seleccione &quot;Todos los Conductores&quot; y &quot;Toda Vigencia&quot;.
                </p>
                <button
                  onClick={() => {
                    setDriverSearch('');
                    setSelectedDriverFilter('all');
                    setSelectedExpiryFilter('all');
                    setSelectedSignatureFilter('all');
                    setSelectedTypeFilter('all');
                  }}
                  className="px-4 py-2 bg-slate-800 text-blue-400 text-xs font-semibold rounded-xl hover:bg-slate-750 transition"
                >
                  Restablecer Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INSTITUTIONAL VAULT & SUSESO MANUAL (8 TOMOS)                      */}
      {/* ========================================================================= */}
      {activeTab === 'institutional_docs' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Filter and Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por título o código de documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 capitalize"
              >
                <option value="all">Todas las Categorías</option>
                {institutionalCategories.map((c) => (
                  <option key={String(c)} value={String(c)} className="capitalize">
                    {String(c).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const isVigente = doc.status === 'vigente';
              const isSusesoManual = doc.code.includes('SUSESO') || doc.code.includes('MANUAL');

              return (
                <div
                  key={doc.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-3 transition flex flex-col justify-between ${
                    isSusesoManual
                      ? 'border-blue-500/40 bg-gradient-to-b from-blue-950/20 to-slate-900'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className={`p-2.5 rounded-xl ${isSusesoManual ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/10 text-blue-400'}`}>
                        {isSusesoManual ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isVigente
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white mt-3 leading-snug">{doc.title}</h3>
                    <p className="text-[11px] font-mono text-blue-400 mt-0.5">{doc.code} • v{doc.version}</p>
                    {doc.legalBasis && (
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        <strong className="text-slate-300">Base:</strong> {doc.legalBasis}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Categoría:</span>
                      <span className="capitalize text-slate-200 font-medium">{doc.type || (doc.category ? doc.category.replace('_', ' ') : 'General')}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Vencimiento:</span>
                      <span className="font-mono text-slate-200">{doc.expiryDate || 'Indefinido'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Aprobado por:</span>
                      <span className="text-slate-300 truncate max-w-[150px]">{doc.approvedBy || doc.uploadedBy}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">{doc.fileSize || '1.5 MB'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDoc(doc)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isSusesoManual ? 'Leer Manual' : 'Ver'}</span>
                        </button>
                        <button
                          onClick={() => showToast(`Descargando copia autorizada: ${doc.title}`)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SUSESO VERIFICATION LOG & AUDIT TRAIL (RF-019)                     */}
      {/* ========================================================================= */}
      {activeTab === 'suseso_verification_log' && (
        <div className="animate-in fade-in duration-150">
          <SusesoVerificationLog />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION                                                            */}
      {/* ========================================================================= */}

      {/* 1. Cryptographic Signature Validation & Expiry Audit Inspector Modal */}
      <DriverDocValidationModal
        document={validatingDoc}
        onClose={() => setValidatingDoc(null)}
        onVerifyNow={(docId) => {
          verifyDriverDocumentSignature(docId);
          // Update local state copy
          const updated = driverDocuments.find((d) => d.id === docId);
          if (updated) setValidatingDoc(updated);
        }}
        onSignNow={(doc) => setSigningDoc(doc)}
        onRenewNow={(doc) => setRenewingDoc(doc)}
      />

      {/* 2. Expiry Renewal Modal */}
      <DriverDocRenewModal
        document={renewingDoc}
        onClose={() => setRenewingDoc(null)}
        onRenew={(docId, newExpiryDate, issuingEntity, newFolio) => {
          renewDriverDocumentExpiry(docId, newExpiryDate, issuingEntity, newFolio);
        }}
      />

      {/* 3. Fast Digital Signature Modal */}
      <DriverDocSignModal
        document={signingDoc}
        onClose={() => setSigningDoc(null)}
        onSign={(docId, signerName, signerRut, certType) => {
          signDriverDocument(docId, signerName, signerRut, certType);
        }}
      />

      {/* 4. Upload Driver Document Modal */}
      <DriverDocUploadModal
        isOpen={isDriverUploadModalOpen}
        onClose={() => setIsDriverUploadModalOpen(false)}
        drivers={drivers}
        companyId={currentCompany.id}
        onUpload={(docData) => {
          addDriverDocument(docData);
        }}
      />

      {/* 5. Institutional Document Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-blue-400">{selectedDocPreview.code} • v{selectedDocPreview.version}</span>
                <h2 className="font-bold text-base text-white">{selectedDocPreview.title}</h2>
              </div>
              <button onClick={() => setSelectedDocPreview(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Aprobación: <strong>{selectedDocPreview.approvedBy}</strong></span>
                <span>Última Revisión: <strong>{selectedDocPreview.lastReviewDate}</strong></span>
              </div>
              <p className="leading-relaxed">
                Documento en custodia digital oficial bajo el estándar ISO 37301 y Dictamen SUSESO 92064-2025. Registrado para la empresa <strong>{currentCompany.businessName}</strong> con hash de inalterabilidad.
              </p>
              <div className="pt-2 font-mono text-[10px] text-blue-400 bg-slate-900 p-2 rounded border border-slate-800 break-all">
                SHA-256: {selectedDocPreview.digitalSignatureHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer hover:bg-slate-700"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => showToast(`Descargando documento oficial: ${selectedDocPreview.title}`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Copia Certificada</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Upload Institutional Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Subir Documento de Cumplimiento</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título del Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Protocolo de Testeo Aleatorio SUSESO 2026"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as DocumentItem['category'] })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="politica">Política / RIOHS</option>
                    <option value="protocolo">Protocolo Operacional</option>
                    <option value="calibracion">Certificado Calibración</option>
                    <option value="consentimiento">Consentimiento Informado</option>
                    <option value="informe_legal">Informe Legal / Pericial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={newDoc.expiryDate}
                    onChange={(e) => setNewDoc({ ...newDoc, expiryDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center space-y-2 hover:border-blue-500 transition cursor-pointer">
                <Upload className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">Arrastre el archivo PDF o haga clic para seleccionar</p>
                <p className="text-[10px] text-slate-500">Admite PDF, DOCX, XLSX firmados digitalmente (Hasta 50MB)</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Subir y Custodiar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. SUSESO Manual Reader Modal */}
      <SusesoManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        initialChapterId={activeManualChapter}
      />
    </div>
  );
};
