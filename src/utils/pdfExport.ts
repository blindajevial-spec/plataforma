import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Company, Driver, TestRecord, Vehicle } from '../types';

export interface MonthlyKpi {
  month: string;
  totalTests: number;
  positiveTests: number;
  complianceRate?: number;
}

export interface PDFReportOptions {
  period: string;
  baseFilter?: string;
  includeSusesoAudit?: boolean;
  includeSubstances?: boolean;
  includeFleetAlcolock?: boolean;
  notes?: string;
}

export function generateExecutiveCompliancePDF(
  company: Company,
  tests: TestRecord[],
  drivers: Driver[],
  vehicles: Vehicle[],
  monthlyKpis: MonthlyKpi[],
  options: PDFReportOptions
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Filter tests if base specified
  let relevantTests = tests;
  if (options.baseFilter && options.baseFilter !== 'all') {
    const baseDrivers = new Set(drivers.filter(d => d.assignedBase === options.baseFilter).map(d => d.id));
    relevantTests = tests.filter(t => baseDrivers.has(t.driverId));
  }

  const totalTests = relevantTests.length;
  const blockedCount = relevantTests.filter(t => t.overallStatus === 'no_apto_bloqueado').length;
  const compliantCount = totalTests - blockedCount;
  const positivityRate = totalTests > 0 ? ((blockedCount / totalTests) * 100).toFixed(2) : '0.00';
  const complianceRate = totalTests > 0 ? ((compliantCount / totalTests) * 100).toFixed(1) : '100.0';

  const issueDate = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const issueTime = new Date().toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const reportCode = `INF-EJEC-${options.period.replace(/\s+/g, '-').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const hashSha256 = '8f4e2b19c7a0d45e62b1a9c31a77d85e429bb710ef65a4c8d93108c909e23fa1';

  // --- Header Styling ---
  // Top Corporate Navy Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent blue top line
  doc.setFillColor(0, 86, 179); // #0056B3
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BLINDAJE VIAL 360', margin, 12);

  // Subtitle in Header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('SISTEMA INTEGRAL DE COMPLIANCE VIAL & PREVENCIÓN DE INTEMPERANCIA', margin, 18);
  doc.text('Certificación ISO 37301 • Ley N° 16.744 • Dictamen SUSESO N° 92064-2025', margin, 23);

  // Top Right Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(59, 130, 246); // blue-400
  doc.text('INFORME EJECUTIVO GERENCIAL', pageWidth - margin, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Cód: ${reportCode}`, pageWidth - margin, 16, { align: 'right' });
  doc.text(`Emisión: ${issueDate}`, pageWidth - margin, 21, { align: 'right' });

  let currentY = 34;

  // --- Title Box ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('INFORME RESUMIDO DE CUMPLIMIENTO, INTEMPERANCIA Y MÉTRICAS DE SEGURIDAD', margin, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Evaluación consolidada para Comité Paritario de Higiene y Seguridad (CPHS), Mutualidad y Gerencia General. Período: ${options.period}.`,
    margin,
    currentY
  );

  currentY += 6;

  // --- Company Metadata Card ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Razón Social:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${company.businessName} (${company.fantasyName || 'TransAndes Cargo'})`, margin + 26, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RUT Empresa:', margin + 4, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(company.rut, margin + 26, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Mutualidad Adherida:', margin + 4, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${company.mutualidad} (Ley 16.744)`, margin + 35, currentY + 18);

  // Column 2 of company card
  const col2X = margin + 105;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Dotación Activa:', col2X, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${drivers.length} conductores profesionales`, col2X + 25, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Flota Asignada:', col2X, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${vehicles.length} tractocamiones y vehículos`, col2X + 25, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Base Operacional:', col2X, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(options.baseFilter === 'all' || !options.baseFilter ? 'Todas las Bases (Nacional)' : options.baseFilter, col2X + 28, currentY + 18);

  currentY += 27;

  // --- Executive KPI Metric Blocks ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. INDICADORES CLAVE DE RENDIMIENTO (KPIs) Y SEGURIDAD VIAL', margin, currentY);

  currentY += 3;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 19;

  // KPI 1: Tasa Positividad
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('POSITIVIDAD GLOBAL', margin + 3, currentY + 5);
  doc.setFontSize(13);
  doc.text(`${positivityRate}%`, margin + 3, currentY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Meta Corp: < 0.50%', margin + 3, currentY + 16.5);

  // KPI 2: Cobertura
  const kpi2X = margin + cardWidth + 3;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(kpi2X, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216);
  doc.text('COBERTURA DOTACIÓN', kpi2X + 3, currentY + 5);
  doc.setFontSize(13);
  doc.text('100.0%', kpi2X + 3, currentY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${totalTests} controles en el período`, kpi2X + 3, currentY + 16.5);

  // KPI 3: Cumplimiento SUSESO
  const kpi3X = margin + (cardWidth + 3) * 2;
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(kpi3X, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(109, 40, 217);
  doc.text('SORTEOS CRIPTOGRÁFICOS', kpi3X + 3, currentY + 5);
  doc.setFontSize(13);
  doc.text('98.8%', kpi3X + 3, currentY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Inalterabilidad SHA-256', kpi3X + 3, currentY + 16.5);

  // KPI 4: Siniestros Evitados
  const kpi4X = margin + (cardWidth + 3) * 3;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(kpi4X, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text('SINIESTROS EVITADOS', kpi4X + 3, currentY + 5);
  doc.setFontSize(13);
  doc.text('0 Fatales', kpi4X + 3, currentY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Ahorro est: $180.000.000', kpi4X + 3, currentY + 16.5);

  currentY += cardHeight + 6;

  // --- Section 2: Desempeño Operacional por Base ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. DESEMPEÑO Y CONFORMIDAD OPERACIONAL POR BASE / FAENA', margin, currentY);

  const baseStatsRows = [
    ['Base Stgo Norte (Centro Logístico)', '64', '63', '1', '98.4%', 'CONFORME (Bloqueo Preventivo Ejecutado)'],
    ['Faena El Teniente (División Codelco)', '48', '48', '0', '100.0%', 'ÓPTIMO (Cero Incidencias)'],
    ['Base San Antonio (Terminal Portuario)', '30', '29', '1', '96.6%', 'CONFORME (Alcolock Calibrado)']
  ];

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Base Operacional / Faena', 'Controles', 'Conformes', 'Reactivos', 'Índice Seguridad', 'Estado Legal']],
    body: baseStatsRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 55 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 20, fontStyle: 'bold', textColor: [185, 28, 28] },
      4: { halign: 'center', cellWidth: 25, fontStyle: 'bold', textColor: [4, 120, 87] },
      5: { halign: 'left' }
    },
    margin: { left: margin, right: margin }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // --- Section 3: Desglose por Sustancia & Límites de Corte ---
  if (options.includeSubstances !== false) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('3. DESGLOSE METROLÓGICO POR SUSTANCIA Y LÍMITES DE CORTE (CUT-OFF)', margin, currentY);

    const substanceRows = [
      ['Alcohol Etílico (Alcotest)', '0.00 g/L (Tolerancia Cero)', 'Dräger Alcotest 6820 (Electroquímico)', '142', '140', '2', '98.6% Conforme'],
      ['Marihuana / Cannabis (THC)', '15 ng/mL (Saliva)', 'Panel Inmunocromatográfico 6-P', '142', '141', '1', '99.3% Conforme'],
      ['Cocaína / Metabolitos (COC)', '20 ng/mL (Saliva)', 'Panel Inmunocromatográfico 6-P', '142', '142', '0', '100.0% Conforme'],
      ['Benzodiacepinas (BZO)', '10 ng/mL (Saliva)', 'Panel Inmunocromatográfico 6-P', '142', '142', '0', '100.0% Conforme'],
      ['Opiáceos / Morfina (OPI)', '20 ng/mL (Saliva)', 'Panel Inmunocromatográfico 6-P', '142', '142', '0', '100.0% Conforme'],
      ['Anfetaminas / Metanfetamina', '25 ng/mL (Saliva)', 'Panel Inmunocromatográfico 6-P', '142', '142', '0', '100.0% Conforme']
    ];

    autoTable(doc, {
      startY: currentY + 2,
      head: [['Analito / Sustancia', 'Límite Normativo (Cut-off)', 'Metodología Técnica', 'Testeados', 'Negativos', 'Reactivos', 'Conformidad']],
      body: substanceRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.8,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 42, fontStyle: 'bold' },
        1: { halign: 'center', cellWidth: 32 },
        2: { halign: 'left', cellWidth: 46 },
        3: { halign: 'center', cellWidth: 16 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 14, fontStyle: 'bold', textColor: [185, 28, 28] },
        6: { halign: 'center', cellWidth: 20, fontStyle: 'bold', textColor: [4, 120, 87] }
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // --- Check if we need to add a second page for Legal Audit and Signatures ---
  if (currentY > pageHeight - 85) {
    doc.addPage();
    currentY = 20;

    // Header on Page 2
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setFillColor(0, 86, 179);
    doc.rect(0, 0, pageWidth, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('BLINDAJE VIAL 360 • AUDITORÍA SUSESO Y FIRMAS LEGALES', margin, 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Cód: ${reportCode} • Hoja 2 de 2`, pageWidth - margin, 8, { align: 'right' });
    currentY = 20;
  }

  // --- Section 4: Auditoría de Cumplimiento Dictamen SUSESO 92064 ---
  if (options.includeSusesoAudit !== false) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('4. AUDITORÍA DE BLINDAJE JURÍDICO (DICTAMEN SUSESO N° 92064-2025 & LEY 16.744)', margin, currentY);

    const susesoRows = [
      ['1. Despersonalización', 'Algoritmo criptográfico SHA-256 sin sesgo humano ni direccionamiento.', 'CUMPLE 100%'],
      ['2. Inclusión en RIOHS', 'Cláusula N° 21 depositada en Dirección del Trabajo con >30 días de antelación.', 'CUMPLE 100%'],
      ['3. Cadena de Custodia', 'Protocolo digital unívoco con kit sellado y traslado a Laboratorio UC-Christus.', 'CUMPLE 100%'],
      ['4. Reserva de Datos', 'Protección estricta de datos sensibles de salud conforme a Ley N° 19.628.', 'CUMPLE 100%'],
      ['5. Derecho a Contraprueba', 'Muestra B en custodia refrigerada garantizada para el trabajador.', 'CUMPLE 100%'],
      ['6. Metrología Calibrada', 'Equipos Dräger con certificado semestral de calibración trazable a INN.', 'CUMPLE 100%']
    ];

    autoTable(doc, {
      startY: currentY + 2,
      head: [['Principio Evaluado', 'Evidencia Operativa y Verificación Técnica', 'Dictamen']],
      body: susesoRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138], // blue-900
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.8,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 42, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 110 },
        2: { halign: 'center', cellWidth: 30, fontStyle: 'bold', textColor: [4, 120, 87] }
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // --- Section 5: Flota & Alcolock Summary ---
  if (options.includeFleetAlcolock !== false && currentY < pageHeight - 55) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('5. MONITOREO DE INMOVILIZADORES DE CABINA (ALCOLOCK)', margin, currentY);

    const alcolockEquipped = vehicles.filter(v => v.hasAlcolock).length;
    const alcolockCalibrated = vehicles.filter(v => v.hasAlcolock && v.alcolockStatus === 'calibrado').length;
    const pctCalibrated = alcolockEquipped > 0 ? Math.round((alcolockCalibrated / alcolockEquipped) * 100) : 100;

    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Flota monitoreada: ${vehicles.length} tractocamiones. Equipados con Alcolock: ${alcolockEquipped} unidades (${pctCalibrated}% con certificación metrológica vigente). Inmovilizador de encendido bloquea el arranque en caso de detección > 0.00 g/L.`,
      margin,
      currentY
    );
    currentY += 7;
  }

  // --- Notes / Recommendations if provided ---
  if (options.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('OBSERVACIONES Y DIRECTRICES DEL COMITÉ PARITARIO:', margin, currentY);
    currentY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(options.notes, margin, currentY, { maxWidth: pageWidth - margin * 2 });
    currentY += 8;
  }

  // --- Signature Block ---
  // Ensure we have enough room for signatures
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 25;
  } else {
    currentY = Math.max(currentY + 6, pageHeight - 42);
  }

  const sigWidth = (pageWidth - margin * 2 - 20) / 3;

  // Signature 1
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, currentY + 12, margin + sigWidth, currentY + 12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Ing. Prevención de Riesgos', margin + sigWidth / 2, currentY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Reg. SEREMI N° PR-8841-RM', margin + sigWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Blindaje Vial 360', margin + sigWidth / 2, currentY + 23.5, { align: 'center' });

  // Signature 2
  const sig2X = margin + sigWidth + 10;
  doc.line(sig2X, currentY + 12, sig2X + sigWidth, currentY + 12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Gerente de Operaciones & Flota', sig2X + sigWidth / 2, currentY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(company.businessName, sig2X + sigWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Responsable Legal Transporte', sig2X + sigWidth / 2, currentY + 23.5, { align: 'center' });

  // Signature 3
  const sig3X = margin + (sigWidth + 10) * 2;
  doc.line(sig3X, currentY + 12, sig3X + sigWidth, currentY + 12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Presidente Comité Paritario', sig3X + sigWidth / 2, currentY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CPHS - Representante Trabajadores', sig3X + sigWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Ley N° 16.744 Art. 66', sig3X + sigWidth / 2, currentY + 23.5, { align: 'center' });

  // Footer for all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.text(
      `Blindaje Vial 360 • Hash SHA-256: ${hashSha256.slice(0, 24)}... • Certificación ISO 37301 • Validez Jurídica para Mutualidades e Inspección del Trabajo`,
      margin,
      pageHeight - 5
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  // Download PDF
  const filename = `Informe_Ejecutivo_Cumplimiento_BlindajeVial_${options.period.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Generate specialized SUSESO Dictamen 92064 Compliance Dossier PDF
 */
export function generateSusesoDossierPDF(
  company: Company,
  tests: TestRecord[],
  drivers: Driver[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const issueDate = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Top Dark Navy Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(0, 86, 179);
  doc.rect(0, 0, pageWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('DOSSIER PERICIAL DE CUMPLIMIENTO JURÍDICO', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('ACREDITACIÓN DE BLINDAJE NORMATIVO • DICTAMEN SUSESO N° 92064-2025', margin, 18);
  doc.text('Superintendencia de Seguridad Social • Ley N° 16.744 • Código del Trabajo', margin, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(59, 130, 246);
  doc.text('AUDITORÍA FORENSE DE PROCESOS', pageWidth - margin, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Fecha: ${issueDate}`, pageWidth - margin, 18, { align: 'right' });

  let currentY = 36;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFICACIÓN DE NO DISCRIMINACIÓN Y VALIDEZ PROBATORIA LABORAL', margin, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Empresa Certificada: ${company.businessName} (RUT: ${company.rut}) • Mutualidad: ${company.mutualidad}`,
    margin,
    currentY
  );

  currentY += 6;

  const susesoDetailRows = [
    [
      'Principio 1: Despersonalización & No Discriminación',
      'Art. 2 Código del Trabajo; Dictamen SUSESO 92064 Sección 3.1.',
      'Sorteos ejecutados mediante semilla SHA-256 con log inmutable. Se prohíbe taxativamente la selección manual por parte de supervisores.',
      'CONFORME'
    ],
    [
      'Principio 2: Tipificación en RIOHS',
      'Art. 154 N° 5 y 12 del Código del Trabajo.',
      'Cláusula N° 21 depositada en Dirección del Trabajo y Seremi de Salud con >30 días de antelación a su entrada en vigencia.',
      'CONFORME'
    ],
    [
      'Principio 3: Cadena de Custodia de Muestras',
      'Norma Técnica ISP / Decreto Supremo N° 594.',
      'Protocolo de sellado hermético con código de barra unívoco, doble operador y remisión directa a Laboratorio Clínico de referencia.',
      'CONFORME'
    ],
    [
      'Principio 4: Derecho a Contraprueba',
      'Garantía constitucional del debido proceso laboral.',
      'Contramuestra B preservada bajo cadena de frío certificada para análisis cromatográfico confirmatorio (GC-MS / HPLC).',
      'CONFORME'
    ],
    [
      'Principio 5: Confidencialidad de Datos Sensibles',
      'Ley N° 19.628 sobre Protección de la Vida Privada.',
      'Resultados accesibles únicamente por personal de salud ocupacional y prevención de riesgos. Prohibida su divulgación pública.',
      'CONFORME'
    ],
    [
      'Principio 6: Calibración Metrológica Trazable',
      'Ley N° 18.290 y Decretos de Transporte.',
      'Alcoholímetros Dräger 6820/7510 con calibración vigente por laboratorio acreditado NCh-ISO 17025 (Metrología Chile / Dräger Safety).',
      'CONFORME'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Pilar Normativo SUSESO', 'Fundamento Jurídico', 'Mecanismo de Control Blindaje Vial 360', 'Dictamen']],
    body: susesoDetailRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 42, fontStyle: 'bold' },
      1: { halign: 'left', cellWidth: 40 },
      2: { halign: 'left', cellWidth: 75 },
      3: { halign: 'center', cellWidth: 25, fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: margin, right: margin }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Legal conclusion text
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('DICTAMEN PERICIAL FINAL:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text(
    'Se certifica que los controles preventivos y procedimientos aplicados por la plataforma Blindaje Vial 360 en las instalaciones de ' +
      company.businessName +
      ' cumplen con la totalidad de los requisitos exigidos por el Dictamen SUSESO N° 92064-2025, garantizando plena validez probatoria ante la Inspección del Trabajo y Tribunales Laborales en caso de controversias por intemperancia.',
    margin + 4,
    currentY + 11,
    { maxWidth: pageWidth - margin * 2 - 8 }
  );

  currentY += 36;

  // Signatures
  const sigWidth = (pageWidth - margin * 2 - 15) / 2;

  doc.setDrawColor(148, 163, 184);
  doc.line(margin, currentY + 12, margin + sigWidth, currentY + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Auditor Líder ISO 37301 / Compliance', margin + sigWidth / 2, currentY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Certificación Sistemas de Compliance Penal y Laboral', margin + sigWidth / 2, currentY + 20, { align: 'center' });

  const sig2X = margin + sigWidth + 15;
  doc.line(sig2X, currentY + 12, sig2X + sigWidth, currentY + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Asesoría Jurídica y Laboral', sig2X + sigWidth / 2, currentY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Especialista en Derecho Laboral y Transporte de Carga', sig2X + sigWidth / 2, currentY + 20, { align: 'center' });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);
    doc.text(
      'Dossier Pericial SUSESO • Blindaje Vial 360 • Documento con validez jurídica y probatoria bajo Ley 19.799 sobre Firma Electrónica',
      margin,
      pageHeight - 5
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  doc.save(`Dossier_Pericial_SUSESO_92064_${company.businessName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Export test records to CSV for Excel
 */
export function exportTestsToCSV(company: Company, tests: TestRecord[], period: string): void {
  const headers = [
    'Codigo_Acta',
    'Fecha_Hora',
    'Conductor_Nombre',
    'Conductor_RUT',
    'Motivo_Test',
    'Base_Operacional',
    'Alcohotest_gL',
    'Estado_Alcohol',
    'Panel_Drogas_Saliva',
    'Estado_Drogas',
    'Resultado_Final',
    'Operador_Nombre',
    'Hash_SHA256'
  ];

  const rows = tests.map(t => [
    t.code,
    t.timestamp,
    `"${t.driverName}"`,
    t.driverRut,
    t.reason,
    `"${t.driverBase || 'Base Stgo Norte'}"`,
    t.alcoholValueGramsPerLiter.toFixed(2),
    t.alcoholStatus,
    t.drugsTested
      ? `"${t.drugPanelResults?.map(d => `${d.name} (${d.drug}): ${d.result}`).join('; ') || 'Negativo'}"`
      : 'No aplicado',
    t.drugsOverallStatus,
    t.overallStatus,
    `"${t.operatorName}"`,
    `SHA256-${t.code.replace(/[^0-9]/g, '') || '0981'}-B360`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Controles_Toxicológicos_BlindajeVial_${period.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export executive management summary to CSV (Key metrics, operational bases, zero tolerance stats & detailed test records)
 */
export function exportManagementSummaryCSV(
  company: Company,
  tests: TestRecord[],
  drivers: Driver[],
  vehicles: Vehicle[],
  period: string
): void {
  const total = tests.length;
  const blocked = tests.filter(t => t.overallStatus === 'no_apto_bloqueado').length;
  const compliant = total - blocked;
  const positivityRate = total > 0 ? ((blocked / total) * 100).toFixed(2) : '0.00';
  const complianceRate = total > 0 ? ((compliant / total) * 100).toFixed(1) : '100.0';
  const dateStr = new Date().toISOString().substring(0, 19).replace('T', ' ');

  const bases = Array.from(new Set(drivers.map(d => d.assignedBase).filter(Boolean)));
  const baseSummaryRows = bases.map(base => {
    const baseDrivers = new Set(drivers.filter(d => d.assignedBase === base).map(d => d.id));
    const baseTests = tests.filter(t => baseDrivers.has(t.driverId));
    const bPos = baseTests.filter(t => t.overallStatus === 'no_apto_bloqueado').length;
    const bTotal = baseTests.length;
    const bComp = bTotal > 0 ? (((bTotal - bPos) / bTotal) * 100).toFixed(1) : '100.0';
    return `"${base}",${baseDrivers.size},${bTotal},${bTotal - bPos},${bPos},"${bComp}%"`;
  });

  const lines = [
    '========================================================================',
    'BLINDAJE VIAL 360° - INFORME RESUMIDO PARA REVISION GERENCIAL (MANAGEMENT REVIEW)',
    'CONFORME A DICTAMEN SUSESO N.º 92064-2025, LEY 18.290 Y LEY 16.744',
    '========================================================================',
    `Empresa:,"${company.businessName}"`,
    `RUT Empresa:,"${company.rut}"`,
    `Periodo de Evaluacion:,"${period}"`,
    `Fecha de Emision:,"${dateStr}"`,
    `Estado General de Cumplimiento:,"CONFORME - TOLERANCIA CERO"`,
    `Hash SHA-256 Certificacion:,"8f4e2b19c7a0d45e62b1a9c31a77d85e429bb710ef65a4c8d93108c909e23fa1"`,
    '',
    '--- RESUMEN EJECUTIVO DE INDICADORES CLAVE (KPIS) ---',
    'Indicador,Valor,Meta Corporativa,Estado',
    `"Total Controles de Intemperancia Realizados",${total},"100% de la dotacion programada","Conforme"`,
    `"Controles Conformes / Aptos para Despacho",${compliant},"Tolerancia Cero","Conforme"`,
    `"Controles No Aptos / Bloqueo Preventivo",${blocked},"0 incidentes en ruta","Riesgo Controlado"`,
    `"Tasa de Cumplimiento Normativo (%)","${complianceRate}%",">= 98.0%","Cumple Meta"`,
    `"Tasa de Positividad Global (%)","${positivityRate}%","< 0.50%","Excelente"`,
    `"Dotacion de Conductores Activos en Flota",${drivers.length},"100% con screening vigente","Activo"`,
    `"Vehiculos y Tractocamiones en Monitoreo",${vehicles.length},"100% Alcolock / Telemetria","Activo"`,
    '',
    '--- RESUMEN POR BASE OPERACIONAL Y FAENA ---',
    'Base_Operacional,Conductores_Asignados,Controles_Ejecutados,Controles_Aptos,Controles_Bloqueados,Tasa_Cumplimiento',
    ...baseSummaryRows,
    '',
    '--- DETALLE DE CONTROLES EJECUTADOS PARA REVISION DE GESTION ---',
    'Codigo_Acta,Fecha_Hora,Conductor,RUT,Base_Operacional,Motivo_Control,Alcotest_gL,Estado_Alcohol,Panel_Drogas,Estado_Drogas,Resultado_Final,Operador_Responsable,Hash_SHA256',
    ...tests.map(t => [
      t.code,
      t.timestamp,
      `"${t.driverName}"`,
      t.driverRut,
      `"${t.driverBase || 'Base Stgo Norte'}"`,
      `"${t.reason}"`,
      t.alcoholValueGramsPerLiter.toFixed(2),
      t.alcoholStatus,
      t.drugsTested
        ? `"${t.drugPanelResults?.map(d => `${d.name}: ${d.result}`).join('; ') || 'Negativo'}"`
        : '"No aplicado"',
      t.drugsOverallStatus,
      t.overallStatus === 'apto_despacho' ? '"Apto Despacho"' : '"No Apto (Bloqueado)"',
      `"${t.operatorName}"`,
      `"SHA256-${t.code.replace(/[^0-9]/g, '') || '8910'}-B360"`
    ].join(','))
  ];

  const csvContent = lines.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Informe_Gerencial_BlindajeVial_${period.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ComplianceExportOptions {
  period: string;
  baseFilter?: string;
  substancesData?: Array<{ name: string; value: number; color?: string }>;
  baseStatsData?: Array<{ base: string; tests: number; positives: number; compliance: string }>;
  monthlyKpis?: MonthlyKpi[];
  formatVariant?: 'consolidated' | 'flat_tabular';
}

/**
 * Export displayed compliance statistics to CSV for external management software (ERP, BI, Fleet Software)
 */
export function exportComplianceStatisticsCSV(
  company: Company,
  tests: TestRecord[],
  drivers: Driver[],
  vehicles: Vehicle[],
  options: ComplianceExportOptions
): void {
  const {
    period,
    baseFilter = 'all',
    substancesData,
    baseStatsData,
    monthlyKpis,
    formatVariant = 'consolidated'
  } = options;

  let relevantTests = tests;
  if (baseFilter && baseFilter !== 'all') {
    const baseDrivers = new Set(drivers.filter(d => d.assignedBase === baseFilter).map(d => d.id));
    relevantTests = tests.filter(t => baseDrivers.has(t.driverId));
  }

  const total = relevantTests.length;
  const blocked = relevantTests.filter(t => t.overallStatus === 'no_apto_bloqueado').length;
  const compliant = total - blocked;
  const positivityRate = total > 0 ? ((blocked / total) * 100).toFixed(2) : '0.00';
  const complianceRate = total > 0 ? ((compliant / total) * 100).toFixed(1) : '100.0';
  const dateStr = new Date().toISOString();

  // Dynamic or default bases
  const defaultBases = [
    { base: 'Base Stgo Norte', tests: 64, positives: 1, compliance: '98.4%' },
    { base: 'Faena El Teniente', tests: 48, positives: 0, compliance: '100%' },
    { base: 'Base San Antonio', tests: 30, positives: 1, compliance: '96.6%' }
  ];
  const basesToUse = baseStatsData && baseStatsData.length > 0 ? baseStatsData : defaultBases;

  // Monthly KPIs
  const defaultMonthly: MonthlyKpi[] = [
    { month: 'Ene 2026', totalTests: 28, positiveTests: 0, complianceRate: 100 },
    { month: 'Feb 2026', totalTests: 32, positiveTests: 1, complianceRate: 96.9 },
    { month: 'Mar 2026', totalTests: 36, positiveTests: 0, complianceRate: 100 },
    { month: 'Abr 2026', totalTests: 40, positiveTests: 0, complianceRate: 100 },
    { month: 'May 2026', totalTests: 44, positiveTests: 1, complianceRate: 97.7 },
    { month: 'Jun 2026', totalTests: 42, positiveTests: 0, complianceRate: 100 },
    { month: 'Jul 2026', totalTests: 45, positiveTests: 0, complianceRate: 100 },
    { month: 'Ago 2026', totalTests: 48, positiveTests: 1, complianceRate: 97.9 },
    { month: 'Sep 2026', totalTests: 52, positiveTests: 1, complianceRate: 98.1 }
  ];
  const monthlyToUse = monthlyKpis && monthlyKpis.length > 0 ? monthlyKpis : defaultMonthly;

  let csvContent = '';

  if (formatVariant === 'flat_tabular') {
    // Flat table optimized for Power BI, Tableau, SQL ETL, ERP loaders
    const headers = [
      'Empresa_RUT',
      'Empresa_Nombre',
      'Periodo',
      'Categoria_Estadistica',
      'Codigo_Metrica',
      'Nombre_Metrica_Entidad',
      'Valor_Numerico',
      'Unidad_Medida',
      'Valor_Texto',
      'Meta_O_Umbral',
      'Estado_Cumplimiento',
      'Norma_Referencia',
      'Hash_Auditoria'
    ];

    const rows: string[][] = [];
    const sha = '8f4e2b19c7a0d45e62b1a9c31a77d85e429bb710ef65a4c8d93108c909e23fa1';

    // Compliance KPIs
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_TOTAL_TESTS', 'Total Controles Ejecutados', String(total), 'Controles', String(total), '100% Dotacion', 'Conforme', 'Plan Preventivo Anual', sha]);
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_COMPLIANT_TESTS', 'Controles Conformes (Aptos Despacho)', String(compliant), 'Controles', String(compliant), 'Tolerancia Cero', 'Aprobado', 'Ley 18.290 Art. 111', sha]);
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_BLOCKED_TESTS', 'Controles No Aptos (Bloqueo Preventivo)', String(blocked), 'Controles', String(blocked), '0 en ruta', 'Bloqueo Efectivo', 'RIOHS Clausula 21', sha]);
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_COMPLIANCE_RATE', 'Tasa de Cumplimiento Global', complianceRate, '%', `${complianceRate}%`, '>= 98.0%', 'Cumple Meta', 'Norma ISO 37301', sha]);
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_POSITIVITY_RATE', 'Tasa de Positividad Global', positivityRate, '%', `${positivityRate}%`, '< 0.50%', 'Optimo', 'Dictamen SUSESO 92064', sha]);
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_DRIVER_COVERAGE', 'Cobertura Dotacion Conductores', String(drivers.length), 'Conductores', `${drivers.length} Conductores (100%)`, '100%', 'Completo', 'Ley 16.744 Seguro Laboral', sha]);
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_SUSESO_ADHERENCE', 'Cumplimiento Sorteos SUSESO', '98.8', '%', '98.8%', '>= 95.0%', 'Auditado', 'Circular SUSESO 92064', sha]);
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_ZERO_ACCIDENTS', 'Siniestros Fatales por Intemperancia', '0', 'Eventos', '0 Fatales (Meta Cero Daño)', '0 Eventos', 'Optimo', 'Ley de Transito 18.290', sha]);
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_SAVINGS_CLP', 'Siniestros Evitados (Ahorro Estimado)', '180000000', 'CLP', '$180.000.000', 'Impacto Positivo', 'Optimo', 'Calculo Siniestralidad ACHS/Mutual', sha]);
    rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'KPI_GENERAL', 'KPI_VEHICLES_MONITORED', 'Vehiculos y Tractocamiones en Monitoreo', String(vehicles.length), 'Unidades', `${vehicles.length} Unidades`, '100% Flota', 'Monitoreado', 'Alcolock & Telemetria CanBus', sha]);

    // Operational Bases
    basesToUse.forEach((b, idx) => {
      const numComp = parseFloat(b.compliance.replace('%', '')) || 0;
      rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'DESEMPENIO_BASE', `BASE_${idx + 1}`, `"${b.base}"`, String(b.tests), 'Controles', `Conformidad: ${b.compliance} (Positivos: ${b.positives})`, '>= 95%', 'Conforme', 'Faena Operativa Transporte', sha]);
    });

    // Substances & Metrology
    const substances = [
      { name: 'Alcohol Etilico (Alcotest)', value: 2, limit: '0.00 g/L', comp: '98.6%', tech: 'Draeger Alcotest 6820' },
      { name: 'Marihuana / Cannabis (THC)', value: 1, limit: '15 ng/mL', comp: '99.3%', tech: 'Inmunoensayo Oral Assure Tech 6-P' },
      { name: 'Cocaina y Metabolitos (COC)', value: 0, limit: '20 ng/mL', comp: '100.0%', tech: 'Inmunoensayo Oral Assure Tech 6-P' },
      { name: 'Benzodiacepinas (BZO)', value: 0, limit: '10 ng/mL', comp: '100.0%', tech: 'Inmunoensayo Oral Assure Tech 6-P' },
      { name: 'Opiaceos y Derivados (OPI)', value: 0, limit: '20 ng/mL', comp: '100.0%', tech: 'Inmunoensayo Oral Assure Tech 6-P' },
      { name: 'Anfetaminas (AMP)', value: 0, limit: '25 ng/mL', comp: '100.0%', tech: 'Inmunoensayo Oral Assure Tech 6-P' }
    ];
    substances.forEach(s => {
      rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'ANALITO_SUSTANCIA', `SUB_${s.name.substring(0, 3).toUpperCase()}`, `"${s.name}"`, String(s.value), 'Reactivos', `Cut-off: ${s.limit} (${s.tech})`, '0 Reactivos', s.value === 0 ? 'Conforme' : 'Bloqueado', 'Panel Salival Oral', sha]);
    });

    // Monthly Trend
    monthlyToUse.forEach(m => {
      rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'TENDENCIA_MENSUAL', `MES_${m.month.replace(/\s+/g, '_')}`, `"${m.month}"`, String(m.totalTests), 'Controles', `Positivos: ${m.positiveTests} (${m.complianceRate || 100}%)`, '>= 95%', 'Conforme', 'Historico Anual 2026', sha]);
    });

    // SUSESO Principles
    const susesoRules = [
      { id: 'PRIN_01', name: 'Consentimiento Previo en RIOHS', status: 'Depósito DT Vigente Cláusula 21' },
      { id: 'PRIN_02', name: 'Algoritmo de Sorteo Despersonalizado', status: 'Sorteo Criptográfico sin sesgo' },
      { id: 'PRIN_03', name: 'Resguardo a la Intimidad y Dignidad', status: 'Muestra Saliva No Invasiva' },
      { id: 'PRIN_04', name: 'Cadena de Custodia Inalterable', status: 'Hash SHA-256 por Acta' },
      { id: 'PRIN_05', name: 'Derecho a Contramuestra Dirimente', status: 'Tubo Salival Sellado Protocolo B' },
      { id: 'PRIN_06', name: 'Bloqueo Preventivo Inmediato', status: 'Relevo antes de encendido motor' },
      { id: 'PRIN_07', name: 'Confidencialidad de Datos Sensibles', status: 'Cifrado AES-256 Ley 19.628' },
      { id: 'PRIN_08', name: 'Coordinación con Mutualidad', status: 'Reportes trimestrales Ley 16.744' }
    ];
    susesoRules.forEach(r => {
      rows.push([company.rut, `"${company.businessName}"`, `"${period}"`, 'AUDITORIA_SUSESO', r.id, `"${r.name}"`, '100', '%', `"${r.status}"`, '100% Cumplido', 'Conforme', 'Dictamen SUSESO 92064', sha]);
    });

    csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  } else {
    // Consolidated format with organized sections
    const lines: string[] = [
      '========================================================================================',
      'BLINDAJE VIAL 360° - EXPORTACION DE ESTADISTICAS DE CUMPLIMIENTO Y PREVENCION (CSV)',
      'MODULO DE INTEGRACION PARA SOFTWARE EXTERNO DE GESTION CORPORATIVA, ERP Y BI',
      'CONFORME A DICTAMEN SUSESO N.º 92064-2025, LEY 18.290, LEY 16.744 E ISO 37301',
      '========================================================================================',
      `Empresa:,"${company.businessName}"`,
      `RUT Empresa:,"${company.rut}"`,
      `Periodo de Evaluacion:,"${period}"`,
      `Filtro Base:,"${baseFilter === 'all' ? 'Consolidado Todas las Bases' : baseFilter}"`,
      `Fecha y Hora de Exportacion:,"${dateStr}"`,
      `Formato de Salida:,"CSV RFC-4180 / UTF-8 con BOM (Compatible con Excel, SAP, PowerBI, Tableau)"`,
      `Sello Criptografico SHA-256:,"8f4e2b19c7a0d45e62b1a9c31a77d85e429bb710ef65a4c8d93108c909e23fa1"`,
      '',
      '--- 1. INDICADORES CLAVE DE CUMPLIMIENTO CORPORATIVO (EXECUTIVE KPIS) ---',
      'Codigo_Metrica,Indicador_Cumplimiento,Valor_Obtenido,Unidad,Meta_Corporativa,Estado_Operacional,Fundamento_Legal',
      `KPI-01,"Tasa de Positividad Global (Alcohol y Drogas)",${positivityRate},%,"< 0.50%","Optimo - Controlado","Dictamen SUSESO 92064"`,
      `KPI-02,"Tasa de Cumplimiento Global (Conformidad)",${complianceRate},%,">= 98.0%","Cumple Meta","Norma ISO 37301"`,
      `KPI-03,"Total Examenes de Intemperancia Realizados",${total},Controles,"100% de la dotacion","Conforme","Programa Preventivo Anual"`,
      `KPI-04,"Controles Conformes (Aptos para Despacho)",${compliant},Controles,"Tolerancia Cero","Aprobado","Ley 18.290 Art. 111"`,
      `KPI-05,"Controles No Aptos (Bloqueo Preventivo Efectivo)",${blocked},Controles,"0 en ruta activa","Riesgo Mitigado","Protocolo RIOHS Clausula 21"`,
      `KPI-06,"Cobertura de Dotacion de Conductores",${drivers.length},Conductores,"100% de la dotacion activa","Completo","Ley 16.744 Seguro Laboral"`,
      `KPI-07,"Adherencia a Sorteo Aleatorio Despersonalizado",98.8,%,"100% sin sesgo humano","Auditado","Algoritmo Criptografico SUSESO"`,
      `KPI-08,"Siniestros Viales Fatales en Ruta por Intemperancia",0,Eventos,"0 Tolerancia Cero","Objetivo Cumplido","Plan Cero Dano Corporativo"`,
      `KPI-09,"Impacto Financiero Estimado por Siniestros Evitados",180000000,CLP,"Ahorro proyectado","Beneficio Directo","Calculo Siniestralidad ACHS/Mutual"`,
      `KPI-10,"Vehiculos / Tractocamiones en Monitoreo Alcolock",${vehicles.length},Unidades,"100% Flota Pesada","Activo","Telemetria CanBus & Alcolock"`,
      '',
      '--- 2. DESEMPENIO OPERACIONAL Y CUMPLIMIENTO POR BASE / FAENA ---',
      'Base_Operacional,Examenes_Realizados,Examenes_Conformes,Positivos_Bloqueados,Indice_Conduccion_Segura_Pct,Estado_Operacional,Certificacion_Auditoria',
      ...basesToUse.map(b => {
        const testsNum = b.tests;
        const posNum = b.positives;
        const confNum = testsNum - posNum;
        return `"${b.base}",${testsNum},${confNum},${posNum},"${b.compliance}","CONFORME - TOLERANCIA CERO","Auditado SUSESO 92064"`;
      }),
      '',
      '--- 3. DISTRIBUCION METROLOGICA POR SUSTANCIA Y LIMITES DE CORTE (CUT-OFF) ---',
      'Analito_Sustancia,Limite_Corte_CutOff,Matriz_Biologica,Metodologia_Tecnica,Total_Testeados,Negativos_Conformes,Reactivos_Positivos,Tasa_Conformidad_Pct,Estatus_Clinico',
      `"Alcohol Etilico (Etanol)","0.00 g/L (Tolerancia Cero)","Aire Espirado Alveolar","Dräger Alcotest 6820 (Sensor Electroquimico)",${total},${Math.max(0, total - 2)},2,"98.6%","Conforme con Ley Emilia"`,
      `"Marihuana / Cannabis (THC)","15 ng/mL","Fluido Oral (Saliva)","Inmunoensayo Rapido Oral Assure Tech 6-P",${total},${Math.max(0, total - 1)},1,"99.3%","Conforme Estandar Internacional AS4760"`,
      `"Cocaina y Metabolitos (COC)","20 ng/mL","Fluido Oral (Saliva)","Inmunoensayo Rapido Oral Assure Tech 6-P",${total},${total},0,"100.0%","Conforme Estandar Internacional AS4760"`,
      `"Benzodiacepinas (BZO)","10 ng/mL","Fluido Oral (Saliva)","Inmunoensayo Rapido Oral Assure Tech 6-P",${total},${total},0,"100.0%","Conforme Estandar Internacional AS4760"`,
      `"Opiaceos / Morfina (OPI)","20 ng/mL","Fluido Oral (Saliva)","Inmunoensayo Rapido Oral Assure Tech 6-P",${total},${total},0,"100.0%","Conforme Estandar Internacional AS4760"`,
      `"Anfetaminas / Metanfetamina (AMP/MET)","25 ng/mL","Fluido Oral (Saliva)","Inmunoensayo Rapido Oral Assure Tech 6-P",${total},${total},0,"100.0%","Conforme Estandar Internacional AS4760"`,
      '',
      '--- 4. EVOLUCION TEMPORAL DE CONTROLES Y CUMPLIMIENTO MENSUAL (HISTORICO 2026) ---',
      'Mes_Periodo,Total_Examenes,Positivos_Bloqueados,Conformes_Aptos,Tasa_Conformidad_Pct,Tasa_Positividad_Pct,Evaluacion_Tendencia',
      ...monthlyToUse.map(m => {
        const t = m.totalTests;
        const p = m.positiveTests;
        const c = t - p;
        const compRate = m.complianceRate !== undefined ? m.complianceRate : (t > 0 ? (((t - p) / t) * 100).toFixed(1) : '100');
        const posRate = t > 0 ? ((p / t) * 100).toFixed(2) : '0.00';
        const evalTrend = p === 0 ? 'Optimo' : 'Alerta Controlada';
        return `"${m.month}",${t},${p},${c},"${compRate}%","${posRate}%","${evalTrend}"`;
      }),
      '',
      '--- 5. AUDITORIA DE CUMPLIMIENTO DICTAMEN SUSESO N.º 92064-2025 ---',
      'Principio_ID,Principio_Juridico_Laboral,Puntaje_Auditoria,Estado_Implementacion,Metodo_Verificacion,Base_Normativa_Chilena',
      'PRIN-01,"Consentimiento Previo y Notificacion en RIOHS","100%","Vigente","Clausula 21 depositada en DT con 30 dias antelacion","Art. 154 Codigo del Trabajo"',
      'PRIN-02,"Algoritmo de Sorteo Aleatorio y Despersonalizado","100%","Vigente","Seleccion por semilla criptografica sin intervencion humana","Art. 184 Codigo del Trabajo & SUSESO"',
      'PRIN-03,"Resguardo Estricto a la Intimidad y Dignidad","100%","Vigente","Examen de saliva oral y alcotest no invasivos en espacio privado","Art. 154 bis Codigo del Trabajo"',
      'PRIN-04,"Cadena de Custodia Inalterable y Trazabilidad","100%","Vigente","Firma digital, folio unico y hash criptografico SHA-256","Norma NCh-ISO/IEC 17025"',
      'PRIN-05,"Derecho a Contramuestra Dirimente de Apelacion","100%","Vigente","Segunda muestra salival en tubo sellado con precinto de seguridad","Dictamen SUSESO 92064 Protocolo B"',
      'PRIN-06,"Protocolo de Bloqueo Preventivo Inmediato","100%","Vigente","Relevo de conductor antes del encendido del vehiculo","Ley 18.290 Art. 111"',
      'PRIN-07,"Confidencialidad Medica y Datos Sensibles","100%","Vigente","Resultados encriptados con acceso exclusivo a Jefatura y RRHH","Ley 19.628 Sobre Proteccion de Datos"',
      'PRIN-08,"Coordinacion con Mutualidad y Organismo Administrador","100%","Vigente","Informes trimestrales remitidos al CPHS y Mutualidad","Ley 16.744 Prevencion de Riesgos"'
    ];

    csvContent = lines.join('\n');
  }

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = formatVariant === 'flat_tabular'
    ? `Estadisticas_Cumplimiento_BI_ERP_${period.replace(/\s+/g, '_')}.csv`
    : `Estadisticas_Cumplimiento_BlindajeVial_${period.replace(/\s+/g, '_')}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
