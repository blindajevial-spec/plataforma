import html2pdf from 'html2pdf.js';

export interface ExportPdfCustomOptions {
  filename?: string;
  margin?: number | [number, number] | [number, number, number, number];
  quality?: number;
  scale?: number;
}

export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
  customOptions?: ExportPdfCustomOptions
): Promise<void> {
  const margin: [number, number, number, number] =
    Array.isArray(customOptions?.margin) && customOptions.margin.length === 4
      ? (customOptions.margin as [number, number, number, number])
      : [8, 8, 10, 8];

  const opt = {
    margin,
    filename,
    image: { type: 'jpeg' as const, quality: customOptions?.quality ?? 0.98 },
    html2canvas: {
      scale: customOptions?.scale ?? 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy']
    }
  };

  // Execute html2pdf promise chain
  await (html2pdf() as any).set(opt).from(element).save();
}


