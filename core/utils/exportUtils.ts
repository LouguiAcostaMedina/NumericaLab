import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { PolynomialSolverResult, IIRFilterStabilityResult } from '../domain/types';
import { ComplexUtils } from '../math/complexUtils';

/**
 * Utilidades para exportación de informes técnicos a PDF y Excel (.xlsx).
 */
export class ExportUtils {
  /**
   * Exporta el informe técnico completo de raíces de polinomio e IIR a PDF.
   */
  static exportPolynomialToPDF(
    result: PolynomialSolverResult,
    iirResult?: IIRFilterStabilityResult | null
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Encabezado del documento
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('NuméricaLab - Informe Técnico de Análisis Polinómico', 14, 15);

    let yPos = 32;

    // Sección 1: Información del Polinomio
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Especificación del Polinomio', 14, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ecuación P(z): ${result.polynomialString}`, 14, yPos);
    yPos += 5;
    doc.text(`Grado n: ${result.degree}`, 14, yPos);
    yPos += 5;
    doc.text(`Coeficientes [a_n ... a_0]: [${result.coefficients.join(', ')}]`, 14, yPos);
    yPos += 5;
    doc.text(`Tiempo de Ejecución: ${result.executionTimeMs} ms`, 14, yPos);
    yPos += 10;

    // Sección 2: Delimitación Teórica (Descartes y Lagrange)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Delimitación Teórica y Acotación (Descartes & Lagrange)', 14, yPos);
    yPos += 6;

    const descartesData = [
      ['Regla de los Signos en P(z)', `${result.descartes.signChangesP} variación(es)`],
      ['Regla de los Signos en P(-z)', `${result.descartes.signChangesPNeg} variación(es)`],
      ['Máx. Raíces Reales Positivas', `${result.descartes.maxPositiveRoots} (posibles: ${result.descartes.positiveRootsPossibilities.join(', ')})`],
      ['Máx. Raíces Reales Negativas', `${result.descartes.maxNegativeRoots} (posibles: ${result.descartes.negativeRootsPossibilities.join(', ')})`],
      ['Ceros en z = 0', `${result.descartes.zeroRootsCount}`],
      ['Mín. Raíces Complejas Esperadas', `${result.descartes.minComplexRoots}`],
      ['Cota Superior Lagrange (Real +)', `${result.lagrange.lagrangeUpperReal}`],
      ['Cota Inferior Lagrange (Real -)', `${result.lagrange.lagrangeLowerReal}`],
      ['Radio de Cauchy (Plano Complejo)', `${result.lagrange.cauchyRadius}`],
      ['Radio Global Recomendado', `${result.lagrange.globalBound}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Métrica / Análisis Teórico', 'Resultado']],
      body: descartesData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Sección 3: Raíces Encontradas mediante Método de Müller y Deflación
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Raíces Encontradas (Método de Müller & Deflación de Horner)', 14, yPos);
    yPos += 6;

    const rootRows = result.roots.map((r) => [
      `z_${r.rootIndex}`,
      ComplexUtils.format(r.root, 6),
      `${r.magnitude}`,
      `${r.iterations.length}`,
      `${r.iterations.length > 0 ? (r.iterations[r.iterations.length - 1].error?.toFixed(6) ?? '0.000000') + '%' : 'N/A'}`,
      r.converged ? 'Sí' : 'No',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Raíz', 'Valor Complejo (re + im*i)', 'Módulo |z|', 'Iteraciones', 'Error Relativo %', 'Convergencia']],
      body: rootRows,
      theme: 'striped',
      headStyles: { fillColor: [14, 116, 144] }, // cyan-700
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Si existe análisis de Filtro IIR
    if (iirResult) {
      if (yPos > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Análisis de Ingeniería: Estabilidad de Filtro Digital IIR', 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Filtro: ${iirResult.filterName}`, 14, yPos);
      yPos += 5;
      doc.text(`Estado de Estabilidad: ${iirResult.stabilityStatus}`, 14, yPos);
      yPos += 5;
      doc.text(`Radio Espectral Máximo (|z|_max): ${iirResult.maxMagnitude.toFixed(6)}`, 14, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'italic');
      doc.text(iirResult.summary, 14, yPos, { maxWidth: pageWidth - 28 });
    }

    doc.save(`Informe_Polinomio_Muller_${Date.now()}.pdf`);
  }

  /**
   * Exporta la tabla de convergencia e informe a formato Excel (.xlsx).
   */
  static exportPolynomialToExcel(result: PolynomialSolverResult): void {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen de Raíces
    const rootsSummary = result.roots.map((r) => ({
      Raíz: `z_${r.rootIndex}`,
      'Parte Real': r.root.re,
      'Parte Imaginaria': r.root.im,
      'Formato Rectangular': ComplexUtils.format(r.root, 6),
      'Módulo |z|': r.magnitude,
      Iteraciones: r.iterations.length,
      'Error Final (%)': r.iterations.length > 0 ? r.iterations[r.iterations.length - 1].error : 0,
      Convergencia: r.converged ? 'Sí' : 'No',
    }));

    const wsRoots = XLSX.utils.json_to_sheet(rootsSummary);
    XLSX.utils.book_append_sheet(wb, wsRoots, 'Resumen de Raíces');

    // Hoja 2: Delimitación Teórica
    const descartesRows = [
      { Métrica: 'Ecuación P(z)', Valor: result.polynomialString },
      { Métrica: 'Grado n', Valor: result.degree },
      { Métrica: 'Variaciones Signo P(z)', Valor: result.descartes.signChangesP },
      { Métrica: 'Variaciones Signo P(-z)', Valor: result.descartes.signChangesPNeg },
      { Métrica: 'Máx. Reales Positivas', Valor: result.descartes.maxPositiveRoots },
      { Métrica: 'Máx. Reales Negativas', Valor: result.descartes.maxNegativeRoots },
      { Métrica: 'Mín. Complejas', Valor: result.descartes.minComplexRoots },
      { Métrica: 'Cota Lagrange Superior Real', Valor: result.lagrange.lagrangeUpperReal },
      { Métrica: 'Cota Lagrange Inferior Real', Valor: result.lagrange.lagrangeLowerReal },
      { Métrica: 'Radio Cauchy Complejo', Valor: result.lagrange.cauchyRadius },
    ];
    const wsTheoretical = XLSX.utils.json_to_sheet(descartesRows);
    XLSX.utils.book_append_sheet(wb, wsTheoretical, 'Análisis Teórico');

    // Hoja 3: Desglose de Iteraciones de Müller (Tabla Completa de Convergencia)
    const iterationsData: any[] = [];
    result.roots.forEach((r) => {
      r.iterations.forEach((it) => {
        iterationsData.push({
          Raíz: `z_${r.rootIndex}`,
          Iteración: it.iteration,
          'z0 (re)': it.z0.re,
          'z0 (im)': it.z0.im,
          'z1 (re)': it.z1.re,
          'z1 (im)': it.z1.im,
          'z2 (re)': it.z2.re,
          'z2 (im)': it.z2.im,
          'z3 (Aproximación re)': it.z3.re,
          'z3 (Aproximación im)': it.z3.im,
          'Residuo |f(z3)|': ComplexUtils.abs(it.fz3),
          'Error Relativo (%)': it.error,
        });
      });
    });

    const wsIterations = XLSX.utils.json_to_sheet(iterationsData);
    XLSX.utils.book_append_sheet(wb, wsIterations, 'Tabla de Convergencia');

    XLSX.writeFile(wb, `Analisis_Polinomico_Muller_${Date.now()}.xlsx`);
  }
}
