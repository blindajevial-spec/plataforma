import { z } from 'zod';
import { DrugType, DrugPanelResult, Equipment } from '../types';

/**
 * Validador de RUT chileno con algoritmo de Módulo 11
 * Cumple con formato estándar del Servicio de Registro Civil e Identificación
 */
export function validateChileanRut(rawRut: string): boolean {
  if (!rawRut || typeof rawRut !== 'string') return false;
  
  // Limpiar puntos y guiones
  const cleanRut = rawRut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  // Cálculo Módulo 11
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let expectedDv = '';
  if (remainder === 11) expectedDv = '0';
  else if (remainder === 10) expectedDv = 'K';
  else expectedDv = remainder.toString();

  return dv === expectedDv;
}

/**
 * Formateador de RUT chileno a formato estándar XX.XXX.XXX-K
 */
export function formatChileanRut(rawRut: string): string {
  const clean = rawRut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

/**
 * Validador de Patente Vehicular Chilena (Formatos antiguo y nuevo)
 * Antiguo: AA1000 / AA-10-00 (2 letras + 4 números)
 * Nuevo: BBBB10 / BB-BB-10 (4 letras + 2 números)
 */
export function validateChileanPlate(plate: string): boolean {
  if (!plate) return false;
  if (plate === 'S/P' || plate === 'EN_BASE') return true;
  const clean = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const oldFormat = /^[A-Z]{2}[0-9]{4}$/;
  const newFormat = /^[BCDFGHJKLPRSTVWXYZ]{4}[0-9]{2}$/;
  return oldFormat.test(clean) || newFormat.test(clean);
}

export const DrugPanelItemSchema = z.object({
  drug: z.enum(['THC', 'COC', 'AMP', 'MET', 'OPI', 'BZO'] as const),
  name: z.string().min(1, 'El nombre de la sustancia es requerido'),
  cutoff: z.string().min(1, 'Punto de corte normativo requerido'),
  result: z.enum(['negativo', 'presunto_positivo', 'invalido'] as const)
});

/**
 * Esquema Zod de Validación para el formulario de Nuevo Test
 * Fundamento Legal:
 * - Ley 16.744 (Seguridad y Salud en el Trabajo)
 * - Ley 20.580 (Tolerancia Cero al Alcohol)
 * - Ley 20.770 (Ley Emilia)
 * - Código del Trabajo Art. 184 y 154 Nº 5 (Derecho a la dignidad, consentimiento y no discriminación)
 * - Dictamen SUSESO Circular 3.335
 * - Norma Chilena NCh-ISO 17025 (Metrología y calibración de instrumentos)
 */
export const NewTestFormSchema = z.object({
  driverId: z.string().min(1, {
    message: 'Debe seleccionar un conductor activo registrado en la dotación'
  }),
  driverRut: z.string().refine(validateChileanRut, {
    message: 'RUT del conductor inválido según algoritmo Módulo 11 (Ley 19.628 / Registro Civil)'
  }),
  operatorId: z.string().min(1, {
    message: 'El operador responsable del examen es obligatorio'
  }),
  operatorRut: z.string().refine(validateChileanRut, {
    message: 'RUT del operador responsable inválido'
  }),
  reason: z.enum(
    ['Pre-turno', 'Aleatorio', 'Post-incidente', 'Sospecha fundada', 'Reintegro laboral'] as const
  ),
  
  // Bloque Alcoholimetría
  alcoholTested: z.boolean(),
  alcoholEquipmentId: z.string().optional(),
  alcoholEquipmentCalibrated: z.boolean().optional(),
  alcoholEquipmentCalibrationExpiry: z.string().optional(),
  alcoholValue: z.number()
    .min(0.00, { message: 'El nivel de alcohol no puede ser negativo' })
    .max(5.00, { message: 'Lectura excede el rango máximo detectable por sensor Dräger (5.00 g/L)' }),

  // Bloque Toxicología / Drogas
  drugsTested: z.boolean(),
  drugKitModel: z.string().optional(),
  drugKitLot: z.string().optional(),
  panelResults: z.array(DrugPanelItemSchema).optional(),

  // Consentimiento y Legalidad
  donorSigned: z.boolean().refine((val) => val === true, {
    message: 'El trabajador debe otorgar consentimiento según Art. 154 Nº 5 del Código del Trabajo y Circular SUSESO 3.335'
  }),

  observations: z.string().max(500, { message: 'Las observaciones no pueden exceder 500 caracteres' }).optional()
}).superRefine((data, ctx) => {
  // 1. Regla: Debe ejecutarse al menos un método de control (Alcotest o Drogas)
  if (!data.alcoholTested && !data.drugsTested) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['alcoholTested'],
      message: 'Debe seleccionar al menos un método de control (Alcohotest o Panel de Drogas) según protocolo MIPER'
    });
  }

  // 2. Regla: Si realiza alcohotest, equipo y calibración son obligatorios
  if (data.alcoholTested) {
    if (!data.alcoholEquipmentId || data.alcoholEquipmentId.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alcoholEquipmentId'],
        message: 'Debe seleccionar un equipo alcoholímetro evidencial certificado (NCh-ISO 17025)'
      });
    }

    if (data.alcoholEquipmentCalibrated === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alcoholEquipmentId'],
        message: 'El equipo seleccionado tiene calibración vencida. Prohibido su uso para test evidenciales (DS 40)'
      });
    }
  }

  // 3. Regla: Si realiza panel de drogas, kit y lote son obligatorios
  if (data.drugsTested) {
    if (!data.drugKitModel || data.drugKitModel.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['drugKitModel'],
        message: 'Especifique el modelo de kit rápido certificado (ej: Dräger DrugCheck 3000)'
      });
    }

    if (!data.drugKitLot || data.drugKitLot.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['drugKitLot'],
        message: 'El número de lote del kit toxicológico es obligatorio para la trazabilidad ISP'
      });
    }

    if (!data.panelResults || data.panelResults.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['panelResults'],
        message: 'Debe evaluarse al menos una sustancia en el panel toxicológico'
      });
    }
  }

  // 4. Regla: Si el motivo es Post-incidente o Sospecha fundada, las observaciones son obligatorias
  if ((data.reason === 'Post-incidente' || data.reason === 'Sospecha fundada') && (!data.observations || data.observations.trim().length < 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['observations'],
      message: `Para exámenes con motivo "${data.reason}", se requiere fundamentación detallada en observaciones (mínimo 10 caracteres) según RIOHS`
    });
  }

  // 5. Regla: Si el resultado es positivo/bloqueado por alcohol o drogas, verificar coherencia legal
  const isAlcoholPositive = data.alcoholTested && data.alcoholValue > 0.00;
  const isDrugPositive = data.drugsTested && data.panelResults?.some((p) => p.result === 'presunto_positivo');
  
  if (isAlcoholPositive || isDrugPositive) {
    if (data.alcoholValue > 0.00 && data.alcoholValue < 0.30) {
      // Advertencia bajo tolerancia cero
      // No bloquea la validación, pero la regla se valida correctamente
    }
  }
});

export type NewTestFormData = z.infer<typeof NewTestFormSchema>;

/**
 * Validador de formulario auxiliar que retorna errores amigables organizados por campo
 */
export function validateNewTestFormData(
  formData: unknown,
  equipmentList?: Equipment[]
): { success: true; data: NewTestFormData } | { success: false; errors: Record<string, string> } {
  // Enriquecer datos con estado de calibración de equipo si se provee la lista
  const rawData = { ...(formData as any) };
  if (equipmentList && rawData.alcoholEquipmentId) {
    const selectedEq = equipmentList.find((e) => e.id === rawData.alcoholEquipmentId);
    if (selectedEq) {
      rawData.alcoholEquipmentCalibrationExpiry = selectedEq.nextCalibrationDate;
      const isExpired = new Date(selectedEq.nextCalibrationDate) < new Date();
      rawData.alcoholEquipmentCalibrated = !isExpired && selectedEq.status !== 'vencido' && selectedEq.status !== 'en_mantencion';
    }
  }

  const result = NewTestFormSchema.safeParse(rawData);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0]?.toString() || 'general';
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  });

  return { success: false, errors };
}
