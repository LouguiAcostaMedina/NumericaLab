import { IIRFilterStabilityResult } from '../domain/types';
import { PolynomialSolver } from './polynomialSolver';

export interface IIRFilterPreset {
  id: string;
  name: string;
  description: string;
  coefficients: number[];
  expectedStatus: 'ESTABLE' | 'MARGINALMENTE_ESTABLE' | 'INESTABLE';
}

/**
 * Análisis de Ingeniería: Evaluación de Estabilidad de Filtros Digitales IIR.
 */
export class IIRFilterAnalyzer {
  /**
   * Colección de presets predeterminados de Filtros IIR para análisis instantáneo.
   */
  static readonly PRESETS: IIRFilterPreset[] = [
    {
      id: 'butterworth-4th',
      name: 'Filtro Butterworth Pasa-Bajas (4to Orden)',
      description: 'Filtro de audio estable con polos distribuidos dentro del círculo unitario (|z| < 1).',
      coefficients: [1, -2.5691, 2.7093, -1.3323, 0.2541],
      expectedStatus: 'ESTABLE',
    },
    {
      id: 'chebyshev-2nd',
      name: 'Filtro Chebyshev Tipo I (2do Orden)',
      description: 'Filtro IIR de selectividad rápida con respuesta estable.',
      coefficients: [1, -1.143, 0.4128],
      expectedStatus: 'ESTABLE',
    },
    {
      id: 'unstable-iir',
      name: 'Filtro IIR Inestable (Polo Fuera del Círculo Unitario)',
      description: 'Filtro con realimentación excesiva; al menos un polo tiene módulo |z| > 1.',
      coefficients: [1, -2.2, 1.7, -0.4],
      expectedStatus: 'INESTABLE',
    },
    {
      id: 'marginal-iir',
      name: 'Resonador IIR Marginal (Polos en |z| = 1)',
      description: 'Filtro oscilatorio no amortiguado con polos situados sobre el círculo unitario.',
      coefficients: [1, 0, 0, -1],
      expectedStatus: 'MARGINALMENTE_ESTABLE',
    },
  ];

  /**
   * Analiza la estabilidad de un filtro IIR a partir de los coeficientes del denominador A(z).
   * 
   * @param denominatorCoefficients Coeficientes [a_0, a_1, ..., a_n] de A(z)
   * @param filterName Nombre o descripción del filtro
   * @param tolerance Tolerancia del solucionador de Müller
   */
  static analyzeStability(
    denominatorCoefficients: number[],
    filterName: string = 'Filtro IIR Personalizado',
    tolerance: number = 1e-6
  ): IIRFilterStabilityResult {
    const solverRes = PolynomialSolver.solveFromCoefficients(denominatorCoefficients, tolerance);

    if (!solverRes.success || solverRes.roots.length === 0) {
      return {
        filterName,
        denominatorCoefficients,
        degree: 0,
        poles: [],
        maxMagnitude: 0,
        isStable: false,
        stabilityStatus: 'INESTABLE',
        summary: `Error en el cálculo de polos: ${solverRes.errorMessage}`,
        descartes: solverRes.descartes,
        lagrange: solverRes.lagrange,
      };
    }

    const poles = solverRes.roots;
    let maxMag = 0;

    poles.forEach((pole) => {
      if (pole.magnitude > maxMag) {
        maxMag = pole.magnitude;
      }
    });

    let stabilityStatus: 'ESTABLE' | 'MARGINALMENTE_ESTABLE' | 'INESTABLE' = 'ESTABLE';
    let isStable = false;
    let summary = '';

    // Criterios de Estabilidad de Causalidad
    const EPS = 1e-4;
    if (maxMag < 1 - EPS) {
      stabilityStatus = 'ESTABLE';
      isStable = true;
      summary = `El filtro IIR es ESTABLE. El radio espectral máximo es |z|_max = ${maxMag.toFixed(4)} < 1.0. Todos los ${poles.length} polos del sistema residen estrictamente en el interior del círculo unitario en el plano Z.`;
    } else if (Math.abs(maxMag - 1.0) <= EPS) {
      stabilityStatus = 'MARGINALMENTE_ESTABLE';
      isStable = false;
      summary = `El filtro IIR es MARGINALMENTE ESTABLE. Existen polos con módulo |z| ≈ 1.0 (máximo |z| = ${maxMag.toFixed(4)}). El sistema presenta oscilaciones mantenidas no amortiguadas.`;
    } else {
      stabilityStatus = 'INESTABLE';
      isStable = false;
      summary = `El filtro IIR es INESTABLE. Al menos un polo posee un módulo |z| = ${maxMag.toFixed(4)} > 1.0 (fuera del círculo unitario), lo que genera divergencia en la respuesta al impulso y saturación numérica.`;
    }

    return {
      filterName,
      denominatorCoefficients: solverRes.coefficients,
      degree: solverRes.degree,
      poles,
      maxMagnitude: maxMag,
      isStable,
      stabilityStatus,
      summary,
      descartes: solverRes.descartes,
      lagrange: solverRes.lagrange,
    };
  }
}
