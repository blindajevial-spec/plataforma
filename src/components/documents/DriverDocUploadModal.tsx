import React, { useState } from 'react';
import { Driver, DriverDocument, DriverDocumentType, DigitalSignatureStatus } from '../../types';
import { formatDocType } from '../../utils/documentValidation';
import {
  Upload,
  X,
  Calendar,
  FileText,
  User,
  ShieldCheck,
  Building,
  Hash,
  CheckCircle2
} from 'lucide-react';

interface DriverDocUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  companyId: string;
  onUpload: (docData: Omit<DriverDocument, 'id'>) => void;
}

export const DriverDocUploadModal: React.FC<DriverDocUploadModalProps> = ({
  isOpen,
  onClose,
  drivers,
  companyId,
  onUpload
}) => {
  if (!isOpen) return null;

  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [docType, setDocType] = useState<DriverDocumentType>('licencia_conducir');
  const [title, setTitle] = useState('');
  const [code, setCode] = useState(`DOC-DRV-${Date.now().toString().slice(-4)}`);
  const [issuingEntity, setIssuingEntity] = useState('Dirección de Tránsito');
  const [issueDate, setIssueDate] = useState('2026-09-01');
  const [expiryDate, setExpiryDate] = useState('2028-09-01');
  const [signatureStatus, setSignatureStatus] = useState<DigitalSignatureStatus>('valida_fea');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isMandatoryForDispatch, setIsMandatoryForDispatch] = useState(true);

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  const handleDocTypeChange = (newType: DriverDocumentType) => {
    setDocType(newType);
    switch (newType) {
      case 'licencia_conducir':
        setTitle('Licencia de Conducir Profesional');
        setIssuingEntity('Dirección de Tránsito Municipal');
        setExpiryDate('2029-09-06');
        break;
      case 'psicotecnico_mutual':
        setTitle('Examen Psicotécnico Riguroso Mutualidad');
        setIssuingEntity('Asociación Chilena de Seguridad (ACHS)');
        setExpiryDate('2027-09-06');
        break;
      case 'consentimiento_suseso':
        setTitle('Consentimiento Informado Toxicológico SUSESO 92064');
        setIssuingEntity('Transportes TransAndina SpA / SUSESO');
        setExpiryDate('2027-12-31');
        break;
      case 'anexo_riohs_alcohol':
        setTitle('Anexo RIOHS Art. 154 N° 5 Cláusula Alcohol y Drogas');
        setIssuingEntity('Departamento de Prevención de Riesgos');
        setExpiryDate('2027-03-01');
        break;
      case 'odi_riesgos':
        setTitle('Obligación de Informar (ODI) DS 40 Art 21');
        setIssuingEntity('Prevención de Riesgos y SSO');
        setExpiryDate('2027-09-06');
        break;
      case 'hoja_vida_conductor':
        setTitle('Hoja de Vida del Conductor (HVC)');
        setIssuingEntity('Servicio de Registro Civil e Identificación');
        setExpiryDate('2026-10-06');
        break;
      case 'certificado_antecedentes':
        setTitle('Certificado de Antecedentes Fines Especiales');
        setIssuingEntity('Servicio de Registro Civil e Identificación');
        setExpiryDate('2026-11-06');
        break;
      case 'induccion_alcolock':
        setTitle('Certificado Inducción y Protocolo Alcolock / Fatiga');
        setIssuingEntity('Escuela de Conducción TransAndina');
        setExpiryDate('2027-09-06');
        break;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    const effectiveTitle = title || formatDocType(docType);
    const now = new Date().toISOString();
    const hash = Array.from(selectedDriver.rut + now + code).map((c) => c.charCodeAt(0).toString(16)).join('').slice(0, 64);

    onUpload({
      companyId,
      driverId: selectedDriver.id,
      driverName: selectedDriver.fullName,
      driverRut: selectedDriver.rut,
      type: docType,
      title: effectiveTitle,
      code,
      issuingEntity,
      issueDate,
      expiryDate,
      fileSize: '1.6 MB',
      fileName: selectedFileName || `${code}_${selectedDriver.rut}.pdf`,
      status: new Date(expiryDate) > new Date('2026-09-06') ? 'vigente' : 'vencido',
      signatureStatus,
      signerName: signatureStatus !== 'pendiente_firma' ? selectedDriver.fullName : undefined,
      signerRut: signatureStatus !== 'pendiente_firma' ? selectedDriver.rut : undefined,
      signedAt: signatureStatus !== 'pendiente_firma' ? now.replace('T', ' ').substring(0, 19) : undefined,
      signatureHash: signatureStatus !== 'pendiente_firma' ? hash : undefined,
      certificateAuthority: signatureStatus === 'valida_fea' ? 'E-CertChile CA Sub-Root 2024' : signatureStatus === 'valida_fes' ? 'FirmaGob ClaveÚnica' : undefined,
      timestampAuthority: signatureStatus !== 'pendiente_firma' ? 'TSA RFC 3161 Chile' : undefined,
      certificateSerialNumber: `CERT-${Date.now().toString(16).toUpperCase()}`,
      algorithm: 'SHA-256 with RSA 2048-bit',
      isMandatoryForDispatch,
      verifiedAt: '2026-09-06 17:00',
      verifiedBy: 'Custodia Digital Biovigilancia 360°'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                Expediente Digital de Flota
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Cargar Documento de Conductor</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-300 overflow-y-auto">
          {/* Driver Selection */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1">Conductor Titular *</label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
            >
              {drivers.map((drv) => (
                <option key={drv.id} value={drv.id}>
                  {drv.fullName} — RUT: {drv.rut} ({drv.assignedBase})
                </option>
              ))}
            </select>
          </div>

          {/* Document Type & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Tipo de Documento *</label>
              <select
                value={docType}
                onChange={(e) => handleDocTypeChange(e.target.value as DriverDocumentType)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
              >
                <option value="licencia_conducir">Licencia de Conducir Profesional</option>
                <option value="psicotecnico_mutual">Examen Psicotécnico Riguroso</option>
                <option value="consentimiento_suseso">Consentimiento SUSESO 92064</option>
                <option value="anexo_riohs_alcohol">Anexo RIOHS Cláusula 21</option>
                <option value="odi_riesgos">Obligación de Informar (ODI)</option>
                <option value="hoja_vida_conductor">Hoja de Vida del Conductor (HVC)</option>
                <option value="certificado_antecedentes">Certificado Antecedentes</option>
                <option value="induccion_alcolock">Inducción Alcolock / Fatiga</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1">Folio / Código Documento</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1">Título del Documento *</label>
            <input
              type="text"
              required
              value={title || formatDocType(docType)}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
            />
          </div>

          {/* Issuing Entity */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1">Entidad Emisora Oficial</label>
            <input
              type="text"
              required
              value={issuingEntity}
              onChange={(e) => setIssuingEntity(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
            />
          </div>

          {/* Dates: Issue and Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Fecha de Emisión</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Fecha de Vencimiento *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Signature Option */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1">Firma Digital Inicial</label>
            <select
              value={signatureStatus}
              onChange={(e) => setSignatureStatus(e.target.value as DigitalSignatureStatus)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
            >
              <option value="valida_fea">Firma Electrónica Avanzada (FEA) - Válida</option>
              <option value="valida_fes">Firma Electrónica Simple (FES / ClaveÚnica) - Válida</option>
              <option value="pendiente_firma">Pendiente de Firma por el Conductor</option>
            </select>
          </div>

          {/* Mandatory for dispatch */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isMandatoryForDispatch}
              onChange={(e) => setIsMandatoryForDispatch(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-300 text-xs">
              Documento obligatorio para el despacho operacional a ruta (bloqueo preventivo en caso de vencimiento).
            </span>
          </label>

          {/* File Upload Box (drag and drop and click) */}
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-5 text-center transition cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-7 h-7 text-blue-400 mx-auto mb-1.5" />
            <p className="text-xs text-white font-semibold">
              {selectedFileName ? `Archivo seleccionado: ${selectedFileName}` : 'Arrastra o haz clic para adjuntar el PDF oficial'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Formatos admitidos: PDF con firma criptográfica (hasta 25 MB)</p>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              Custodiar y Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
