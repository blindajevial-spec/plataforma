import { DriverDocument, DigitalSignatureStatus } from '../types';

/**
 * Reference system date for BV360: September 06, 2026
 */
export const SYSTEM_DATE = '2026-09-06';

export interface ExpiryAnalysis {
  daysRemaining: number;
  status: 'vigente' | 'por_vencer' | 'vencido';
  label: string;
  badgeClass: string;
  isExpired: boolean;
  isCritical: boolean;
}

/**
 * Calculates days remaining and expiration status relative to the current system date.
 */
export function calculateExpiryStatus(expiryDateStr: string, currentDateStr: string = SYSTEM_DATE): ExpiryAnalysis {
  const expiry = new Date(expiryDateStr);
  const current = new Date(currentDateStr);

  // Difference in milliseconds
  const diffTime = expiry.getTime() - current.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    const daysAgo = Math.abs(daysRemaining);
    return {
      daysRemaining,
      status: 'vencido',
      label: daysAgo === 0 ? 'Vence hoy' : `Vencido hace ${daysAgo} día${daysAgo !== 1 ? 's' : ''}`,
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse',
      isExpired: true,
      isCritical: true
    };
  }

  if (daysRemaining <= 30) {
    return {
      daysRemaining,
      status: 'por_vencer',
      label: daysRemaining === 0 ? 'Vence hoy' : `Vence en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`,
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      isExpired: false,
      isCritical: true
    };
  }

  return {
    daysRemaining,
    status: 'vigente',
    label: `Vigente (${daysRemaining} días)`,
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    isExpired: false,
    isCritical: false
  };
}

export interface SignatureAnalysis {
  isValid: boolean;
  isPending: boolean;
  label: string;
  description: string;
  badgeClass: string;
  typeLabel: string;
}

/**
 * Analyzes the digital signature status of a document
 */
export function analyzeSignature(status: DigitalSignatureStatus, hash?: string): SignatureAnalysis {
  const hasHash = Boolean(hash && hash.length >= 16);

  switch (status) {
    case 'valida_fea':
      return {
        isValid: hasHash,
        isPending: false,
        label: 'Firma FEA Válida',
        description: 'Firma Electrónica Avanzada acreditada por el Ministerio de Economía (Ley 19.799)',
        badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
        typeLabel: 'FEA (Avanzada)'
      };
    case 'valida_fes':
      return {
        isValid: hasHash,
        isPending: false,
        label: 'Firma FES Válida',
        description: 'Firma Electrónica Simple con autenticación ClaveÚnica Segpres / OTP',
        badgeClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
        typeLabel: 'FES (Simple)'
      };
    case 'pendiente_firma':
      return {
        isValid: false,
        isPending: true,
        label: 'Pendiente de Firma',
        description: 'El documento requiere la suscripción digital obligatoria del conductor',
        badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
        typeLabel: 'Pendiente'
      };
    case 'invalida_revocada':
    default:
      return {
        isValid: false,
        isPending: false,
        label: 'Firma Inválida / Revocada',
        description: 'Certificado revocado en lista CRL o alteración detectada en hash SHA-256',
        badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
        typeLabel: 'No Válida'
      };
  }
}

/**
 * Format document type to human-readable label
 */
export function formatDocType(type: DriverDocument['type']): string {
  switch (type) {
    case 'licencia_conducir':
      return 'Licencia Profesional';
    case 'psicotecnico_mutual':
      return 'Psicotécnico Riguroso';
    case 'consentimiento_suseso':
      return 'Consentimiento SUSESO';
    case 'anexo_riohs_alcohol':
      return 'Anexo RIOHS Alcohol/Drogas';
    case 'odi_riesgos':
      return 'Obligación de Informar (ODI)';
    case 'hoja_vida_conductor':
      return 'Hoja de Vida (HVC)';
    case 'certificado_antecedentes':
      return 'Certificado Antecedentes';
    case 'induccion_alcolock':
      return 'Inducción Alcolock/Fatiga';
    default:
      return 'Documento';
  }
}
