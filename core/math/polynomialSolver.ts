import * as math from 'mathjs';
import { ComplexNumber, PolynomialRoot, PolynomialSolverResult, MullerIteration, SeedsInput } from '../domain/types';
import { ComplexUtils } from './complexUtils';
import { DescartesLagrange } from './descartesLagrange';
import { HornerScheme } from './horner';
import { MullerMethod } from './muller';
import { PrecisionUtils } from './precisionUtils';

/**
 * Orquestador completo para la resolución de Polinomios de grado n.
 * Combina Regla de Descartes, Cotas de Lagrange, Método de Müller y Deflación de Horner con Purificación de Raíces.
 */
export class PolynomialSolver {
  /**
   * Resuelve todas las n raíces de un polinomio dado sus coeficientes [a_n, a_{n-1}, ..., a_0].
   */
  static solveFromCoefficients(
    coeffs: number[],
    tolerance: number = 1e-6,
    maxIterations: number = 100,
    decimals: number = 6,
    seedsInput?: SeedsInput
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

    // 2. Fases 2 y 3: Müller + Deflación Sintética de Horner + Purificación
    const roots: PolynomialRoot[] = [];
    let currentCoeffs: (number | ComplexNumber)[] = [...cleanCoeffs];

    // Puntos semilla ajustables basados en la cota de Lagrange
    const bound = Math.max(1, lagrange.globalBound);
    const useCustom = Boolean(seedsInput?.useCustomSeeds);

    for (let rIdx = 1; rIdx <= degree; rIdx++) {
      const remainingDegree = currentCoeffs.length - 1;

      // CASO ESPECIAL CRÍTICO: Deflación a grado 1 (A*z + B = 0 => z = -B/A exacto)
      if (remainingDegree === 1) {
        const A = ComplexUtils.toComplex(currentCoeffs[0]);
        const B = ComplexUtils.toComplex(currentCoeffs[1]);

        // Raíz analítica directa exacta: z = -B / A
        const negB = ComplexUtils.mul(-1, B);
        const exactRoot = ComplexUtils.div(negB, A);
        let cleanedRoot = PrecisionUtils.cleanComplex(exactRoot, decimals);

        // Purificación final sobre el polinomio original
        cleanedRoot = this.purifyRoot(cleanCoeffs, cleanedRoot, decimals);

        const fzExact = HornerScheme.evaluate(cleanCoeffs, cleanedRoot);

        const iterationItem: MullerIteration = {
          iteration: 1,
          z0: cleanedRoot,
          z1: cleanedRoot,
          z2: cleanedRoot,
          z3: cleanedRoot,
          fz3: PrecisionUtils.cleanComplex(fzExact, decimals),
          a: { re: 0, im: 0 },
          b: PrecisionUtils.cleanComplex(A, decimals),
          c: PrecisionUtils.cleanComplex(B, decimals),
          discriminant: { re: 0, im: 0 },
          error: 0.0, // Error 0% garantizado para el residuo lineal
        };

        const rootRes: PolynomialRoot = {
          rootIndex: rIdx,
          root: cleanedRoot,
          magnitude: PrecisionUtils.round(ComplexUtils.abs(cleanedRoot), decimals),
          iterations: [iterationItem],
          converged: true,
          deflatedCoefficients: [],
          isPurified: true,
        };

        roots.push(rootRes);
        break;
      }

      // CASO GENERAL: Grado >= 2
      let z0: ComplexNumber;
      let z1: ComplexNumber;
      let z2: ComplexNumber;

      if (rIdx === 1 && useCustom) {
        // Usar estrictamente las semillas ingresadas por el usuario
        const seed0 = seedsInput?.z0 ?? seedsInput?.x0 ?? 0;
        const seed1 = seedsInput?.z1 ?? seedsInput?.x1 ?? 0.5;
        const seed2 = seedsInput?.z2 ?? seedsInput?.x2 ?? 1.0;

        z0 = ComplexUtils.toComplex(seed0);
        z1 = ComplexUtils.toComplex(seed1);
        z2 = ComplexUtils.toComplex(seed2);
      } else {
        // Autogeneración usando distribución angular sobre la cota de Lagrange
        const angle0 = ((rIdx * 2 * Math.PI) / degree) - Math.PI / 4;
        const angle2 = angle0 + (2 * Math.PI) / 3;

        z0 = { re: -bound * 0.5 * Math.cos(angle0), im: bound * 0.5 * Math.sin(angle0) };
        z1 = { re: 0, im: 0 };
        z2 = { re: bound * 0.5 * Math.cos(angle2), im: bound * 0.5 * Math.sin(angle2) };
      }

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

      // Limpieza y purificación de la raíz encontrada sobre el polinomio original
      let cleanedRoot = PrecisionUtils.cleanComplex(rootRes.root, decimals);
      cleanedRoot = this.purifyRoot(cleanCoeffs, cleanedRoot, decimals);

      rootRes.root = cleanedRoot;
      rootRes.magnitude = PrecisionUtils.round(ComplexUtils.abs(cleanedRoot), decimals);
      rootRes.isPurified = true;

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
   * Purifica una raíz encontrada ejecutando un refinamiento sobre el polinomio original P(z)
   * para mitigar la propagación de errores numéricos por deflación sintética sucesiva.
   */
  static purifyRoot(
    originalCoeffs: (number | ComplexNumber)[],
    root: ComplexNumber,
    decimals: number = 6
  ): ComplexNumber {
    const fzInitial = HornerScheme.evaluate(originalCoeffs, root);
    if (ComplexUtils.abs(fzInitial) < 1e-12) {
      return PrecisionUtils.cleanComplex(root, decimals);
    }

    const mag = ComplexUtils.abs(root);
    const delta = mag > 1e-4 ? mag * 1e-5 : 1e-5;

    const z0 = ComplexUtils.add(root, { re: delta, im: delta * 0.05 });
    const z1 = ComplexUtils.sub(root, { re: delta, im: -delta * 0.05 });
    const z2 = root;

    const refined = MullerMethod.findSingleRoot(
      originalCoeffs,
      z0,
      z1,
      z2,
      Math.pow(10, -(decimals + 3)),
      3,
      1,
      decimals + 2
    );

    const fzRefined = HornerScheme.evaluate(originalCoeffs, refined.root);

    if (ComplexUtils.abs(fzRefined) <= ComplexUtils.abs(fzInitial)) {
      return PrecisionUtils.cleanComplex(refined.root, decimals);
    }

    return PrecisionUtils.cleanComplex(root, decimals);
  }

  /**
   * Resuelve un polinomio ingresado como expresión string (ej: "z^4 - 0.6*z^3 + 0.25*z^2 - 0.2*z + 0.05").
   */
  static solveFromString(
    polyString: string,
    tolerance: number = 1e-6,
    maxIterations: number = 100,
    decimals: number = 6,
    seedsInput?: SeedsInput
  ): PolynomialSolverResult {
    try {
      const coeffs = this.parsePolynomialString(polyString);
      const res = this.solveFromCoefficients(coeffs, tolerance, maxIterations, decimals, seedsInput);
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
