import * as math from 'mathjs';
import { ComplexNumber, PolynomialRoot, PolynomialSolverResult } from '../domain/types';
import { ComplexUtils } from './complexUtils';
import { DescartesLagrange } from './descartesLagrange';
import { HornerScheme } from './horner';
import { MullerMethod } from './muller';
import { PrecisionUtils } from './precisionUtils';

/**
 * Orquestador completo para la resolución de Polinomios de grado n.
 * Combina Regla de Descartes, Cotas de Lagrange, Método de Müller y Deflación de Horner.
 */
export class PolynomialSolver {
  /**
   * Resuelve todas las n raíces de un polinomio dado sus coeficientes [a_n, a_{n-1}, ..., a_0].
   */
  static solveFromCoefficients(
    coeffs: number[],
    tolerance: number = 1e-6,
    maxIterations: number = 100,
    decimals: number = 6
  ): PolynomialSolverResult {
    const startTime = performance.now();

    if (!coeffs || coeffs.length <= 1) {
      return {
        success: false,
        polynomialString: '',
        coefficients: coeffs || [],
        degree: 0,
        descartes: DescartesLagrange.analyzeDescartes([]),
        lagrange: DescartesLagrange.calculateBounds([]),
        roots: [],
        errorMessage: 'El polinomio debe tener al menos grado 1 (mínimo 2 coeficientes).',
      };
    }

    // Normalizar descartando ceros iniciales si a_n == 0
    let cleanCoeffs = [...coeffs];
    while (cleanCoeffs.length > 1 && Math.abs(cleanCoeffs[0]) < 1e-12) {
      cleanCoeffs.shift();
    }

    const degree = cleanCoeffs.length - 1;
    const polyStr = this.formatPolynomialString(cleanCoeffs);

    // 1. Fase 1: Descartes y Lagrange
    const descartes = DescartesLagrange.analyzeDescartes(cleanCoeffs);
    const lagrange = DescartesLagrange.calculateBounds(cleanCoeffs);

    // 2. Fases 2 y 3: Müller + Deflación Sintética de Horner
    const roots: PolynomialRoot[] = [];
    let currentCoeffs: (number | ComplexNumber)[] = [...cleanCoeffs];

    // Puntos semilla ajustables basados en la cota de Lagrange
    const bound = Math.max(1, lagrange.globalBound);

    for (let rIdx = 1; rIdx <= degree; rIdx++) {
      // Definir semillas variadas para evitar converger a la misma raíz
      const angle0 = ((rIdx * 2 * Math.PI) / degree) - Math.PI / 4;
      const angle2 = angle0 + (2 * Math.PI) / 3;

      const z0: ComplexNumber = { re: -bound * 0.5 * Math.cos(angle0), im: bound * 0.5 * Math.sin(angle0) };
      const z1: ComplexNumber = { re: 0, im: 0 };
      const z2: ComplexNumber = { re: bound * 0.5 * Math.cos(angle2), im: bound * 0.5 * Math.sin(angle2) };

      // Buscar raíz individual con Müller
      const rootRes = MullerMethod.findSingleRoot(
        currentCoeffs,
        z0,
        z1,
        z2,
        tolerance,
        maxIterations,
        rIdx,
        decimals
      );

      // Limpieza de tolerancia para números casi reales
      let cleanedRoot = PrecisionUtils.cleanComplex(rootRes.root, decimals);
      rootRes.root = cleanedRoot;
      rootRes.magnitude = PrecisionUtils.round(ComplexUtils.abs(cleanedRoot), decimals);

      // Deflactar el polinomio si aún quedan raíces por encontrar
      if (currentCoeffs.length > 2) {
        const deflation = HornerScheme.deflate(currentCoeffs, cleanedRoot);
        rootRes.deflatedCoefficients = deflation.quotient;
        currentCoeffs = deflation.quotient;
      }

      roots.push(rootRes);
    }

    const endTime = performance.now();

    return {
      success: true,
      polynomialString: polyStr,
      coefficients: cleanCoeffs,
      degree,
      descartes,
      lagrange,
      roots,
      executionTimeMs: Number((endTime - startTime).toFixed(2)),
    };
  }

  /**
   * Resuelve un polinomio ingresado como expresión string (ej: "z^4 - 0.6*z^3 + 0.25*z^2 - 0.2*z + 0.05").
   */
  static solveFromString(
    polyString: string,
    tolerance: number = 1e-6,
    maxIterations: number = 100,
    decimals: number = 6
  ): PolynomialSolverResult {
    try {
      const coeffs = this.parsePolynomialString(polyString);
      const res = this.solveFromCoefficients(coeffs, tolerance, maxIterations, decimals);
      res.polynomialString = polyString;
      return res;
    } catch (err: any) {
      return {
        success: false,
        polynomialString: polyString,
        coefficients: [],
        degree: 0,
        descartes: DescartesLagrange.analyzeDescartes([]),
        lagrange: DescartesLagrange.calculateBounds([]),
        roots: [],
        errorMessage: err.message || 'Error al parsear el polinomio.',
      };
    }
  }

  /**
   * Convierte una cadena polinómica a un arreglo de coeficientes [a_n, ..., a_0].
   * Soporta variables 'x' o 'z'.
   */
  static parsePolynomialString(polyStr: string): number[] {
    if (!polyStr || polyStr.trim() === '') {
      throw new Error('La expresión del polinomio está vacía.');
    }

    try {
      // Normalizar la expresión para mathjs (remplazar 'z' por 'x' temporalmente para derivación de mathjs si fuera necesario)
      let expr = polyStr.trim().replace(/-\s+/g, '- ').replace(/\+\s+/g, '+ ');
      const varName = expr.includes('z') ? 'z' : 'x';

      const parsed = math.parse(expr);

      let currentExpr = parsed;
      let degree = 0;

      while (degree <= 20) {
        try {
          const derived = math.derivative(currentExpr, varName);
          if (derived.toString() === '0') {
            break;
          }
          currentExpr = derived;
          degree++;
        } catch {
          break;
        }
      }

      if (degree === 0) {
        const num = math.evaluate(expr);
        if (typeof num === 'number') return [num];
        throw new Error(`No se detectó la variable "${varName}" en la expresión.`);
      }

      // Evaluar coeficientes derivando $k$ veces y evaluando en $varName=0$: $a_k = P^{(k)}(0) / k!$
      const coeffs: number[] = new Array(degree + 1).fill(0);
      let temp = parsed;

      for (let k = 0; k <= degree; k++) {
        const valAtZero = temp.evaluate({ [varName]: 0 });
        const factorial = this.factorial(k);
        const coeffK = valAtZero / factorial;
        coeffs[degree - k] = PrecisionUtils.round(coeffK, 10);

        if (k < degree) {
          temp = math.derivative(temp, varName);
        }
      }

      return coeffs;
    } catch (err: any) {
      throw new Error(`Sintaxis polinómica no válida: ${err.message}. Ejemplo válido: "z^4 - 0.6*z^3 + 0.25*z^2 - 0.2*z + 0.05"`);
    }
  }

  /**
   * Helper para formatear los coeficientes a string "a_n*z^n + ... + a_0"
   */
  static formatPolynomialString(coeffs: number[]): string {
    const n = coeffs.length - 1;
    const parts: string[] = [];

    for (let i = 0; i <= n; i++) {
      const c = coeffs[i];
      if (Math.abs(c) < 1e-10) continue;

      const power = n - i;
      const absC = Math.abs(c);
      const sign = c < 0 ? '-' : parts.length > 0 ? '+' : '';

      let term = '';
      if (power === 0) {
        term = `${absC}`;
      } else if (power === 1) {
        term = absC === 1 ? 'z' : `${absC}z`;
      } else {
        term = absC === 1 ? `z^${power}` : `${absC}z^${power}`;
      }

      parts.push(`${sign} ${term}`.trim());
    }

    return parts.length > 0 ? parts.join(' ') : '0';
  }

  private static factorial(n: number): number {
    if (n <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }
}
