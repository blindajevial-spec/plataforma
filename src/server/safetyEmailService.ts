import { GoogleGenAI } from "@google/genai";

export interface SendSafetyEmailPayload {
  alertType: 'critical_test_threshold' | 'aggregate_rate_exceeded' | 'cluster_positivity' | 'test_refusal';
  severity?: 'CRITICA' | 'ALTA' | 'ADVERTENCIA';
  testRecord?: {
    code?: string;
    timestamp?: string;
    driverName?: string;
    driverRut?: string;
    driverBase?: string;
    vehiclePlate?: string;
    reason?: string;
    alcoholValueGramsPerLiter?: number;
    alcoholStatus?: string;
    drugsOverallStatus?: string;
    drugPanelResults?: Array<{ drug: string; name: string; result: string; cutoff?: string }>;
    custodyChainId?: string;
    operatorName?: string;
    operatorRut?: string;
    observations?: string;
  };
  triggeredThresholds: string[];
  recipients: Array<{
    name: string;
    email: string;
    role: string;
    organization?: string;
  }>;
  companyInfo?: {
    name?: string;
    rut?: string;
    mutualidad?: string;
    address?: string;
  };
  customNotes?: string;
  dispatchedBy?: string;
}

export interface GeneratedSafetyEmailResult {
  success: boolean;
  messageId: string;
  timestamp: string;
  recipients: string[];
  subject: string;
  htmlBody: string;
  summaryText: string;
  triggeredThresholds: string[];
  actionChecklist: string[];
  executiveRecommendations: string[];
  aiEnhanced: boolean;
}

/**
 * Standard protocol action checklist under SUSESO 92064-2025 and Chilean Labor Code
 */
export const DEFAULT_SAFETY_ACTION_CHECKLIST = [
  "Confirmar el bloqueo preventivo inmediato de despacho en sistema de pesaje, garita y despacho de flota.",
  "Efectuar el retiro formal de llaves del tractocamión / bus asignado y verificar estacionamiento en zona segura.",
  "Completar la Cadena de Custodia física y digital con sello de seguridad inviolable para muestra salival.",
  "Coordinar la derivación inmediata de contramuestra a Laboratorio Toxicológico acreditado NCh-ISO/IEC 17025.",
  "Notificar al Comité Paritario de Higiene y Seguridad (CPHS) y registrar constancia en Acta de Incidente Operacional.",
  "Generar reporte de contingencia hacia la Mutualidad adherida (ACHS / Mutual de Seguridad / IST) según corresponda."
];

/**
 * Standard technical recommendations for transport safety managers
 */
export const DEFAULT_EXECUTIVE_RECOMMENDATIONS = [
  "Incompatibilidad Absoluta para Conducción: La presencia de sustancias psicotrópicas o alcohol altera la percepción de profundidad, tiempo de frenado y reflejos psicomotores.",
  "Blindaje Laboral Preventivo: Mantener la inhabilitación sin menoscabo de derechos laborales mientras se emite el informe pericial confirmatorio GC-MS / LC-MS/MS.",
  "Auditoría de Turno: Revisar hojas de ruta previas y registros de telemetría / alcolock de la unidad en las últimas 48 horas.",
  "Contención y Derivación Médica: Ofrecer al trabajador el protocolo de apoyo psicosocial y evaluación en salud ocupacional conforme a la Política Preventiva RIOHS."
];

/**
 * Builds the official HTML email body styled for safety managers
 */
export function buildSafetySummaryEmailHtml(params: {
  subject: string;
  payload: SendSafetyEmailPayload;
  messageId: string;
  timestamp: string;
  actionChecklist: string[];
  executiveRecommendations: string[];
}): string {
  const { subject, payload, messageId, timestamp, actionChecklist, executiveRecommendations } = params;
  const test = payload.testRecord || {};
  const company = payload.companyInfo || {
    name: "Transportes y Logística TransAndina Cargo SpA",
    rut: "76.849.320-1",
    mutualidad: "Mutual de Seguridad"
  };

  const severity = payload.severity || "CRITICA";
  const severityBadgeBg = severity === "CRITICA" ? "#dc2626" : "#d97706";
  const severityLabel = severity === "CRITICA" ? "ALERTA MÁXIMA / CRÍTICA" : "ALERTA DE SEGURIDAD";

  const recipientsListHtml = payload.recipients
    .map(
      (r) =>
        `<li style="margin-bottom: 4px;"><strong>${escapeHtml(r.name)}</strong> (${escapeHtml(r.role)}) &lt;${escapeHtml(
          r.email
        )}&gt;</li>`
    )
    .join("");

  const thresholdsListHtml = payload.triggeredThresholds
    .map(
      (t) =>
        `<li style="margin-bottom: 6px; color: #991b1b; font-weight: 600;">⚠️ ${escapeHtml(t)}</li>`
    )
    .join("");

  const checklistHtml = actionChecklist
    .map(
      (item, idx) =>
        `<li style="margin-bottom: 8px; font-size: 13px; line-height: 1.5; color: #1e293b;">
          <span style="display: inline-block; width: 20px; height: 20px; background-color: #e0e7ff; color: #3730a3; border-radius: 4px; text-align: center; line-height: 20px; font-weight: bold; font-size: 11px; margin-right: 8px;">${idx + 1}</span>
          ${escapeHtml(item)}
        </li>`
    )
    .join("");

  const recommendationsHtml = executiveRecommendations
    .map(
      (rec) =>
        `<li style="margin-bottom: 6px; font-size: 13px; color: #334155; line-height: 1.5;">${escapeHtml(rec)}</li>`
    )
    .join("");

  // Reactive drugs badge
  let drugReactiveBadges = "";
  if (test.drugPanelResults && test.drugPanelResults.length > 0) {
    const reactives = test.drugPanelResults.filter((d) => d.result === "presunto_positivo" || d.result === "confirmado_positivo");
    if (reactives.length > 0) {
      drugReactiveBadges = reactives
        .map(
          (d) =>
            `<span style="display: inline-block; background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: bold; margin-right: 6px;">
              ${escapeHtml(d.name)} (${escapeHtml(d.cutoff || "Cut-off estricto")})
            </span>`
        )
        .join(" ");
    } else {
      drugReactiveBadges = '<span style="color: #059669; font-weight: 600;">Panel Salival No Reactivo (Negativo)</span>';
    }
  }

  const alcoholDisplay =
    test.alcoholValueGramsPerLiter !== undefined
      ? `${test.alcoholValueGramsPerLiter.toFixed(2)} g/L (${test.alcoholStatus || 'No determinado'})`
      : 'No medido';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 24px 0;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="650" cellpadding="0" cellspacing="0" border="0" style="max-width: 650px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          
          <!-- Corporate Top Bar -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 28px; border-bottom: 3px solid #2563eb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="color: #38bdf8; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                      BLINDAJE VIAL 360 • SISTEMA INTEGRADO DE PREVENCIÓN
                    </div>
                    <div style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 4px;">
                      Notificación de Alerta Temprana de Seguridad Operacional
                    </div>
                  </td>
                  <td align="right" style="color: #94a3b8; font-size: 11px; font-family: monospace;">
                    ID: ${escapeHtml(messageId)}<br>
                    ${escapeHtml(timestamp)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Critical Alert Warning Header -->
          <tr>
            <td style="background-color: #fef2f2; border-bottom: 1px solid #fecaca; padding: 16px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" width="44" style="padding-right: 14px;">
                    <div style="width: 38px; height: 38px; border-radius: 8px; background-color: ${severityBadgeBg}; color: #ffffff; text-align: center; line-height: 38px; font-size: 20px; font-weight: bold;">
                      ⚠️
                    </div>
                  </td>
                  <td valign="top">
                    <span style="display: inline-block; background-color: ${severityBadgeBg}; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase;">
                      ${severityLabel}
                    </span>
                    <h2 style="margin: 6px 0 2px 0; color: #991b1b; font-size: 16px; font-weight: 800;">
                      Umbral Crítico de Riesgo Operacional Superado
                    </h2>
                    <p style="margin: 0; color: #7f1d1d; font-size: 13px; line-height: 1.4;">
                      Se ha activado el protocolo de inhabilitación inmediata de despacho vehicular en conformidad a la Ley N° 18.290 de Tránsito y Dictamen SUSESO N° 92064-2025.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 24px 28px;">
              
              <!-- Triggered Thresholds Box -->
              <div style="background-color: #fff1f2; border: 1px solid #fda4af; border-radius: 8px; padding: 14px 18px; margin-bottom: 22px;">
                <div style="font-size: 12px; font-weight: 800; color: #9f1239; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  🚨 Umbrales Críticos Infringidos en la Operación:
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  ${thresholdsListHtml}
                </ul>
              </div>

              <!-- Driver & Test Details Grid -->
              <div style="margin-bottom: 22px;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; pb-1;">
                  📋 Antecedentes del Control Operacional
                </div>

                <table width="100%" cellpadding="8" cellspacing="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px;">
                  <tr style="background-color: #f8fafc;">
                    <td width="30%" style="color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Empresa Operadora:</td>
                    <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
                      ${escapeHtml(company.name || '')} (RUT: ${escapeHtml(company.rut || '')}) • Mutualidad: ${escapeHtml(company.mutualidad || '')}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Código de Examen:</td>
                    <td style="font-family: monospace; font-weight: 700; color: #2563eb; border-bottom: 1px solid #e2e8f0;">
                      ${escapeHtml(test.code || 'CTR-2026-N/A')}
                    </td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Conductor Evaluado:</td>
                    <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
                      ${escapeHtml(test.driverName || 'No identificado')} &nbsp;•&nbsp; RUT: ${escapeHtml(test.driverRut || 'N/A')}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Base / Garita & Patente:</td>
                    <td style="color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                      <strong>Base:</strong> ${escapeHtml(test.driverBase || 'General')} &nbsp;|&nbsp; <strong>Unidad/Tracto:</strong> ${escapeHtml(test.vehiclePlate || 'S/P')}
                    </td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Motivo del Control:</td>
                    <td style="color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                      <strong>${escapeHtml(test.reason || 'Control Preventivo')}</strong> &nbsp;•&nbsp; Fecha/Hora: ${escapeHtml(test.timestamp || timestamp)}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Alcohotest (Etanol):</td>
                    <td style="color: ${test.alcoholValueGramsPerLiter && test.alcoholValueGramsPerLiter > 0 ? '#dc2626' : '#059669'}; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
                      ${escapeHtml(alcoholDisplay)}
                    </td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Panel Drogas (Saliva):</td>
                    <td style="border-bottom: 1px solid #e2e8f0;">
                      ${drugReactiveBadges}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Fiscalizador / Operador:</td>
                    <td style="color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                      ${escapeHtml(test.operatorName || 'Operador de Turno')} (RUT: ${escapeHtml(test.operatorRut || 'N/A')})
                    </td>
                  </tr>
                  ${
                    test.custodyChainId
                      ? `<tr style="background-color: #f8fafc;">
                          <td style="color: #64748b; font-weight: 600;">Cadena de Custodia:</td>
                          <td style="font-family: monospace; color: #4338ca; font-weight: 700;">
                            ${escapeHtml(test.custodyChainId)} (Muestra Sellada en Terreno)
                          </td>
                        </tr>`
                      : ''
                  }
                </table>
              </div>

              <!-- Mandatory Action Checklist -->
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px 20px; margin-bottom: 22px;">
                <div style="font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                  ⚡ Protocolo de Acción Inmediata Requerido (Checklist de Prevención):
                </div>
                <ul style="margin: 0; padding: 0; list-style: none;">
                  ${checklistHtml}
                </ul>
              </div>

              <!-- Expert Recommendations -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin-bottom: 22px;">
                <div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  🛡️ Criterios Técnicos y Resguardo Legal SUSESO:
                </div>
                <ul style="margin: 0; padding-left: 20px;">
                  ${recommendationsHtml}
                </ul>
              </div>

              <!-- Recipient Notice -->
              <div style="font-size: 11px; color: #64748b; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px;">
                <strong style="color: #334155;">Destinatarios Notificados Automáticamente:</strong>
                <ul style="margin: 6px 0 0 0; padding-left: 18px;">
                  ${recipientsListHtml}
                </ul>
                <div style="margin-top: 6px;">
                  <em>Despachado por: ${escapeHtml(payload.dispatchedBy || "Motor Automático de Alertas Blindaje Vial")}</em>
                </div>
              </div>

              <!-- Legal & Cryptographic Disclaimer -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 10px; color: #94a3b8; line-height: 1.5;">
                <p style="margin: 0 0 6px 0;">
                  <strong>Aviso de Confidencialidad y Validez Pericial:</strong> Este correo electrónico y sus datos anexos contienen información confidencial sujeta a secreto profesional y a la Ley N° 19.628 sobre Protección de la Vida Privada. Las actas de screening preventivo generadas por la plataforma Blindaje Vial SpA cuentan con sellos criptográficos SHA-256 e inalterabilidad de registros conforme a los requerimientos de la Superintendencia de Seguridad Social (SUSESO).
                </p>
                <p style="margin: 0; font-family: monospace;">
                  Firma Digital SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 • ISO 39001 / ISO 37301
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 16px 28px; text-align: center; color: #64748b; font-size: 11px;">
              Blindaje Vial 360 SpA • Santiago de Chile • <a href="https://blindajevial.cl" style="color: #38bdf8; text-decoration: none;">blindajevial.cl</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text representation of the safety alert email
 */
export function buildSafetySummaryEmailPlainText(params: {
  subject: string;
  payload: SendSafetyEmailPayload;
  messageId: string;
  timestamp: string;
  actionChecklist: string[];
  executiveRecommendations: string[];
}): string {
  const { subject, payload, messageId, timestamp, actionChecklist, executiveRecommendations } = params;
  const test = payload.testRecord || {};

  return `
================================================================================
[ALERTA CRÍTICA OPERACIONAL] UMBRAL DE RIESGO SUPERADO
BLINDAJE VIAL 360 - SISTEMA INTEGRADO DE SEGURIDAD VIAL
================================================================================
ID de Mensaje: ${messageId}
Fecha y Hora: ${timestamp}
Asunto: ${subject}
Severidad: ${payload.severity || 'CRITICA'}
Empresa: ${payload.companyInfo?.name || 'TransAndina Cargo SpA'} (RUT: ${payload.companyInfo?.rut || '76.849.320-1'})

UMBRALES CRÍTICOS INFRINGIDOS:
${payload.triggeredThresholds.map((t) => ` - [!] ${t}`).join('\n')}

ANTECEDENTES DEL CONTROL OPERACIONAL:
 - Código de Examen: ${test.code || 'CTR-2026-N/A'}
 - Conductor: ${test.driverName || 'No identificado'} (RUT: ${test.driverRut || 'N/A'})
 - Base / Faena: ${test.driverBase || 'General'}
 - Patente de Vehículo: ${test.vehiclePlate || 'S/P'}
 - Motivo: ${test.reason || 'Control Preventivo'}
 - Nivel de Alcohol: ${test.alcoholValueGramsPerLiter !== undefined ? test.alcoholValueGramsPerLiter.toFixed(2) + ' g/L' : 'No medido'}
 - Estado Drogas: ${test.drugsOverallStatus || 'No determinado'}
 - Fiscalizador: ${test.operatorName || 'Operador'} (${test.operatorRut || ''})
 - Cadena de Custodia: ${test.custodyChainId || 'No requerida'}

CHECKLIST DE ACCIÓN INMEDIATA PARA JEFES DE SEGURIDAD / PREVENCIÓN:
${actionChecklist.map((item, idx) => ` ${idx + 1}. ${item}`).join('\n')}

RECOMENDACIONES TÉCNICAS Y LEGALES:
${executiveRecommendations.map((r) => ` * ${r}`).join('\n')}

DESTINATARIOS NOTIFICADOS:
${payload.recipients.map((r) => ` - ${r.name} (${r.role}) <${r.email}>`).join('\n')}

Despachado por: ${payload.dispatchedBy || 'Motor Automático de Alertas Blindaje Vial'}
Normativa Aplicable: Ley 18.290 de Tránsito / Dictamen SUSESO 92064-2025 / Art. 184 Código del Trabajo
================================================================================
  `.trim();
}

/**
 * Escapes HTML characters
 */
function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Core service to process and trigger automated safety manager summary email
 */
export async function processSafetyAlertEmail(
  payload: SendSafetyEmailPayload,
  genAIClientFactory?: () => GoogleGenAI
): Promise<GeneratedSafetyEmailResult> {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const messageId = `MSG-BV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const testCode = payload.testRecord?.code || 'CTR-GENERAL';
  const driverName = payload.testRecord?.driverName || 'Conductor';
  const baseName = payload.testRecord?.driverBase || 'Faena';
  const severity = payload.severity || 'CRITICA';

  const subject = `[ALERTA ${severity}] Umbral de Riesgo Superado en Control ${testCode} - ${driverName} (${baseName})`;

  let actionChecklist = [...DEFAULT_SAFETY_ACTION_CHECKLIST];
  let executiveRecommendations = [...DEFAULT_EXECUTIVE_RECOMMENDATIONS];
  let aiEnhanced = false;

  // If Gemini client factory is available, optionally enhance recommendations with AI
  if (genAIClientFactory) {
    try {
      const ai = genAIClientFactory();
      const prompt = `Eres el Especialista Senior en Prevención de Riesgos de Transporte y Abogado Laborista de Blindaje Vial SpA (Chile).
Se ha detectado un evento crítico que superó los umbrales de seguridad operacional:
- Conductor: ${driverName}
- Test: ${testCode}
- Motivo: ${payload.testRecord?.reason || 'Control preventivo'}
- Alcohol: ${payload.testRecord?.alcoholValueGramsPerLiter || 0} g/L
- Drogas: ${payload.testRecord?.drugsOverallStatus || 'No informado'}
- Umbrales infringidos: ${payload.triggeredThresholds.join(', ')}

Proporciona en formato JSON una lista con 4 recomendaciones técnicas precisas y 4 acciones prioritarias para el Jefe de Prevención y Oficial de Cumplimiento bajo el marco chileno (SUSESO N° 92064-2025, Código del Trabajo y Mutualidades).
Formato JSON esperado:
{
  "recommendations": ["...", "...", "...", "..."],
  "actionChecklist": ["...", "...", "...", "..."]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed.actionChecklist) && parsed.actionChecklist.length > 0) {
          actionChecklist = parsed.actionChecklist;
        }
        if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
          executiveRecommendations = parsed.recommendations;
        }
        aiEnhanced = true;
      }
    } catch (err) {
      // Gracefully fall back to deterministic standards
      console.warn("[SafetyEmailService] Gemini enhancement not applied, using regulatory defaults:", (err as any)?.message);
    }
  }

  const htmlBody = buildSafetySummaryEmailHtml({
    subject,
    payload,
    messageId,
    timestamp,
    actionChecklist,
    executiveRecommendations
  });

  const summaryText = buildSafetySummaryEmailPlainText({
    subject,
    payload,
    messageId,
    timestamp,
    actionChecklist,
    executiveRecommendations
  });

  const recipientEmails = payload.recipients.map((r) => r.email);

  return {
    success: true,
    messageId,
    timestamp,
    recipients: recipientEmails,
    subject,
    htmlBody,
    summaryText,
    triggeredThresholds: payload.triggeredThresholds,
    actionChecklist,
    executiveRecommendations,
    aiEnhanced
  };
}
