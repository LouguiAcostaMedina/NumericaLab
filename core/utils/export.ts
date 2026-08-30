import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Diccionario para mapear las claves técnicas en español descriptivo en las cabeceras.
 */
const headerMapping: Record<string, string> = {
  iteration: 'Iteración',
  a: 'a (Lím. Inferior)',
  b: 'b (Lím. Superior)',
  xr: 'xr (Aproximación)',
  fa: 'f(a)',
  fb: 'f(b)',
  fxr: 'f(xr)',
  xl: 'xl (Lím. Inferior)',
  xu: 'xu (Lím. Superior)',
  fxl: 'f(xl)',
  fxu: 'f(xu)',
  xi: 'xi (Valor Actual)',
  fxi: 'f(xi)',
  dfxi: 'df(xi)',
  xiNext: 'xi+1 (Siguiente)',
  gxi: 'g(xi)',
  xiMinus1: 'xi-1 (Semilla 0)',
  fxiMinus1: 'f(xi-1)',
  error: 'Error Relativo (%)',
};

/**
 * Formatea un valor numérico para exportaciones
 */
function formatValue(val: any): string {
  if (val === null || val === undefined) return 'N/A';
  if (typeof val === 'number') {
    if (val === 0) return '0';
    const abs = Math.abs(val);
    if (abs < 1e-4) {
      return val.toExponential(6);
    }
    return val.toFixed(6);
  }
  return String(val);
}

/**
 * Genera y descarga un archivo CSV con soporte de BOM para caracteres UTF-8 en Excel.
 */
export function exportToCSV(data: any[], method: string): void {
  if (!data || data.length === 0) return;

  const rawHeaders = Object.keys(data[0]);
  const translatedHeaders = rawHeaders.map((h) => headerMapping[h] || h);

  const csvRows = [
    translatedHeaders.join(','),
    ...data.map((row) =>
      rawHeaders
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return 'N/A';
          const formatted = typeof val === 'number' ? val.toString() : `"${val}"`;
          return formatted;
        })
        .join(',')
    ),
  ];

  // Agregar el BOM \uFEFF para que Excel identifique correctamente la codificación UTF-8
  const csvContent = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `resultados_${method}.csv`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera y descarga un archivo de Excel (.xlsx) mapeando los encabezados.
 */
export function exportToExcel(data: any[], method: string): void {
  if (!data || data.length === 0) return;

  // Traducir las filas a un objeto con cabeceras formateadas
  const mappedData = data.map((row) => {
    const newRow: any = {};
    Object.keys(row).forEach((key) => {
      const translated = headerMapping[key] || key;
      newRow[translated] = row[key] === null || row[key] === undefined ? 'N/A' : row[key];
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(mappedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Iteraciones');
  
  // Guardar archivo xlsx
  XLSX.writeFile(workbook, `resultados_${method}.xlsx`);
}

/**
 * Genera y descarga un reporte en PDF de alta calidad con jspdf y jspdf-autotable.
 */
export function exportToPDF(data: any[], method: string, methodName: string): void {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();
  const rawHeaders = Object.keys(data[0]);
  const translatedHeaders = rawHeaders.map((h) => headerMapping[h] || h);

  // Mapear los valores de las filas para visualización en el PDF
  const rows = data.map((row) =>
    rawHeaders.map((h) => formatValue(row[h]))
  );

  // Título del documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(24, 24, 27); // zinc-900
  doc.text(`Reporte de Iteraciones: ${methodName}`, 14, 20);

  // Subtítulo con fecha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(113, 113, 122); // zinc-500
  const dateStr = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generado el ${dateStr} - Software de Métodos Numéricos`, 14, 26);

  // Línea divisoria
  doc.setDrawColor(228, 228, 231); // zinc-200
  doc.line(14, 30, 196, 30);

  // Dibujar tabla
  autoTable(doc, {
    startY: 35,
    head: [translatedHeaders],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [39, 39, 42], // zinc-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [63, 63, 70], // zinc-700
    },
    columnStyles: {
      0: { halign: 'center' }, // Iteración centrada
    },
    margin: { top: 35, right: 14, bottom: 15, left: 14 },
    styles: {
      font: 'helvetica',
      cellPadding: 2,
    },
  });

  // Guardar archivo PDF
  doc.save(`resultados_${method}.pdf`);
}
