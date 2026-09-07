import { DescartesResult, LagrangeBoundResult } from '../domain/types';

/**
 * Análisis teórico preliminar: Regla de los Signos de Descartes y Cotas de Lagrange / Cauchy.
 */
export class DescartesLagrange {
  /**
   * Analiza el número de variaciones de signo en P(x) y P(-x) aplicando la Regla de Descartes.
   * Coeficientes ordenados de mayor a menor grado: [a_n, a_{n-1}, ..., a_0].
   */
  static analyzeDescartes(coeffs: number[]): DescartesResult {
    if (coeffs.length === 0) {
      return {
        signChangesP: 0,
        signChangesPNeg: 0,
        maxPositiveRoots: 0,
        positiveRootsPossibilities: [0],
        maxNegativeRoots: 0,
        negativeRootsPossibilities: [0],
        zeroRootsCount: 0,
        minComplexRoots: 0,
        degree: 0,
      };
    }

    const n = coeffs.length - 1;

    // 1. Contar raíces en x = 0 (coeficientes cero al final)
    let zeroRootsCount = 0;
    let trimmedCoeffs = [...coeffs];
    while (trimmedCoeffs.length > 0 && Math.abs(trimmedCoeffs[trimmedCoeffs.length - 1]) < 1e-12) {
      zeroRootsCount++;
      trimmedCoeffs.pop();
    }

    if (trimmedCoeffs.length <= 1) {
      return {
        signChangesP: 0,
        signChangesPNeg: 0,
        maxPositiveRoots: 0,
        positiveRootsPossibilities: [0],
        maxNegativeRoots: 0,
        negativeRootsPossibilities: [0],
        zeroRootsCount: n,
        minComplexRoots: 0,
        degree: n,
      };
    }

    // 2. Variaciones de signo en P(x)
    const signChangesP = this.countSignChanges(trimmedCoeffs);
    const positiveRootsPossibilities: number[] = [];
    for (let v = signChangesP; v >= 0; v -= 2) {
      positiveRootsPossibilities.push(v);
    }

    // 3. Variaciones de signo en P(-x)
    // Para P(-x), los coeficientes de potencias impares cambian de signo
    const degreeP = trimmedCoeffs.length - 1;
    const pNegCoeffs = trimmedCoeffs.map((c, i) => {
      const power = degreeP - i;
      return power % 2 !== 0 ? -c : c;
    });

    const signChangesPNeg = this.countSignChanges(pNegCoeffs);
    const negativeRootsPossibilities: number[] = [];
    for (let v = signChangesPNeg; v >= 0; v -= 2) {
      negativeRootsPossibilities.push(v);
    }

    // 4. Estimación de raíces complejas mínimas
    // Grado total no nulo = degreeP
    const maxRealNotZero = signChangesP + signChangesPNeg;
    const minComplex = Math.max(0, degreeP - maxRealNotZero);

    return {
      signChangesP,
      signChangesPNeg,
      maxPositiveRoots: signChangesP,
      positiveRootsPossibilities,
      maxNegativeRoots: signChangesPNeg,
      negativeRootsPossibilities,
      zeroRootsCount,
      minComplexRoots: minComplex,
      degree: n,
    };
  }

  /**
   * Calcula las Cotas de Lagrange y Cauchy para delimitar las raíces en la recta real y plano complejo.
   * Coeficientes ordenados de mayor a menor grado: [a_n, a_{n-1}, ..., a_0].
   */
  static calculateBounds(coeffs: number[]): LagrangeBoundResult {
    if (coeffs.length <= 1 || Math.abs(coeffs[0]) < 1e-12) {
      return {
        lagrangeUpperReal: 0,
        lagrangeLowerReal: 0,
        cauchyRadius: 0,
        globalBound: 0,
      };
    }

    const n = coeffs.length - 1;
    let a_n = coeffs[0];

    // Normalizar si a_n < 0 para que el coeficiente principal sea positivo
    let normCoeffs = coeffs.map((c) => (a_n < 0 ? -c : c));
    a_n = normCoeffs[0];

    // 1. Cota Superior de Lagrange para Raíces Reales Positivas
    const lagrangeUpperReal = this.lagrangeSingleBound(normCoeffs);

    // 2. Cota Inferior para Raíces Reales Negativas
    // Evaluamos en P(-x) para obtener el límite positivo de (-x)
    const pNegCoeffs = normCoeffs.map((c, i) => {
      const power = n - i;
      return power % 2 !== 0 ? -c : c;
    });

    let pNegNorm = pNegCoeffs[0] < 0 ? pNegCoeffs.map((c) => -c) : pNegCoeffs;
    const lagrangeUpperNeg = this.lagrangeSingleBound(pNegNorm);
    const lagrangeLowerReal = -lagrangeUpperNeg;

    // 3. Radio de Cauchy para el Plano Complejo: R = 1 + max(|a_i|) / |a_n| para i < n
    let maxCoeff = 0;
    for (let i = 1; i <= n; i++) {
      const absC = Math.abs(coeffs[i]);
      if (absC > maxCoeff) maxCoeff = absC;
    }
    const cauchyRadius = 1 + maxCoeff / Math.abs(coeffs[0]);

    // Cota global recomendada para el radio del gráfico complejo
    const globalBound = Math.max(
      lagrangeUpperReal,
      lagrangeUpperNeg,
      cauchyRadius
    );

    return {
      lagrangeUpperReal: Number(lagrangeUpperReal.toFixed(4)),
      lagrangeLowerReal: Number(lagrangeLowerReal.toFixed(4)),
      cauchyRadius: Number(cauchyRadius.toFixed(4)),
      globalBound: Number(globalBound.toFixed(4)),
    };
  }

  /**
   * Helper para contar variaciones de signo en una secuencia de coeficientes no nulos.
   */
  private static countSignChanges(coeffs: number[]): number {
    const nonZero = coeffs.filter((c) => Math.abs(c) >= 1e-12);
    let count = 0;
    for (let i = 0; i < nonZero.length - 1; i++) {
      if ((nonZero[i] > 0 && nonZero[i + 1] < 0) || (nonZero[i] < 0 && nonZero[i + 1] > 0)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Helper para la cota de Lagrange B = 1 + (K / a_n)^(1/k)
   */
  private static lagrangeSingleBound(normCoeffs: number[]): number {
    const n = normCoeffs.length - 1;
    const a_n = normCoeffs[0];

    // Encontrar primer coeficiente negativo desde la izquierda
    let k = -1; // exponente k = n - m
    let K = 0;  // Máximo valor absoluto de coeficientes negativos

    for (let i = 1; i <= n; i++) {
      if (normCoeffs[i] < 0) {
        if (k === -1) {
          k = i; // i representa la distancia desde el coeficiente principal (n - m)
        }
        const absVal = Math.abs(normCoeffs[i]);
        if (absVal > K) {
          K = absVal;
        }
      }
    }

    if (k === -1 || K === 0) {
      return 0; // No hay coeficientes negativos, no hay raíces reales positivas
    }

    return 1 + Math.pow(K / a_n, 1 / k);
  }
}
