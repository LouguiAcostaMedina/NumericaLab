import { ComplexNumber, MullerIteration, PolynomialRoot } from '../domain/types';
import { ComplexUtils } from './complexUtils';
import { HornerScheme } from './horner';
import { PrecisionUtils } from './precisionUtils';

/**
 * Implementación del Método de Müller con soporte nativo de Números Complejos.
 * Permite la transición fluida de semillas 100% reales a raíces complejas en el plano Z.
 */
export class MullerMethod {
  /**
   * Resuelve una raíz individual de un polinomio P(z) = 0 usando el Método de Müller.
   */
  static findSingleRoot(
    coeffs: (number | ComplexNumber)[],
    initialZ0: ComplexNumber = { re: -1, im: 0 },
    initialZ1: ComplexNumber = { re: 0, im: 0 },
    initialZ2: ComplexNumber = { re: 1, im: 0 },
    tolerance: number = 1e-6,
    maxIterations: number = 100,
    rootIndex: number = 1,
    decimals: number = 6
  ): PolynomialRoot {
    const iterations: MullerIteration[] = [];
    let z0 = { ...initialZ0 };
    let z1 = { ...initialZ1 };
    let z2 = { ...initialZ2 };

    // Si los puntos iniciales son idénticos, perturbamos con componente imaginario para romper simetría
    if (ComplexUtils.abs(ComplexUtils.sub(z1, z0)) < 1e-10) {
      z0 = ComplexUtils.sub(z1, { re: 0.5, im: 0.1 });
    }
    if (ComplexUtils.abs(ComplexUtils.sub(z2, z1)) < 1e-10) {
      z2 = ComplexUtils.add(z1, { re: 0.5, im: -0.1 });
    }

    let z3: ComplexNumber = { ...z2 };
    let converged = false;

    for (let iter = 1; iter <= maxIterations; iter++) {
      const fz0 = HornerScheme.evaluate(coeffs, z0);
      const fz1 = HornerScheme.evaluate(coeffs, z1);
      const fz2 = HornerScheme.evaluate(coeffs, z2);

      // Diferencias finitas h0 y h1
      let h0 = ComplexUtils.sub(z1, z0);
      let h1 = ComplexUtils.sub(z2, z1);

      if (ComplexUtils.abs(h0) < 1e-14) h0 = { re: 1e-10, im: 1e-10 };
      if (ComplexUtils.abs(h1) < 1e-14) h1 = { re: 1e-10, im: 1e-10 };

      // delta0 y delta1
      const delta0 = ComplexUtils.div(ComplexUtils.sub(fz1, fz0), h0);
      const delta1 = ComplexUtils.div(ComplexUtils.sub(fz2, fz1), h1);

      // Coeficientes a, b, c de la parábola
      const hSum = ComplexUtils.add(h1, h0);
      const a = ComplexUtils.div(ComplexUtils.sub(delta1, delta0), hSum);
      const b = ComplexUtils.add(delta1, ComplexUtils.mul(a, h1));
      const c = { ...fz2 };

      // Discriminante D = sqrt(b^2 - 4ac)
      const bSquared = ComplexUtils.mul(b, b);
      const fourAC = ComplexUtils.mul(4, ComplexUtils.mul(a, c));
      const disc = ComplexUtils.sqrt(ComplexUtils.sub(bSquared, fourAC));

      // Elección del signo para maximizar el denominador (evitar cancelación sustractiva)
      const den1 = ComplexUtils.add(b, disc);
      const den2 = ComplexUtils.sub(b, disc);

      const denMax = ComplexUtils.abs(den1) >= ComplexUtils.abs(den2) ? den1 : den2;

      // Si el denominador es prácticamente cero, evitamos división por cero
      let dx: ComplexNumber;
      if (ComplexUtils.abs(denMax) < 1e-15) {
        dx = { re: 1e-5, im: 1e-5 };
      } else {
        // dx = 2c / denMax
        const twoC = ComplexUtils.mul(2, c);
        dx = ComplexUtils.div(twoC, denMax);
      }

      // Nueva aproximación z3 = z2 - dx
      z3 = ComplexUtils.sub(z2, dx);

      // Transición limpia de real a complejo: limpiar residuos numéricos insignificantes
      z3 = PrecisionUtils.cleanComplex(z3, decimals);
      const fz3 = HornerScheme.evaluate(coeffs, z3);

      // Error relativo porcentual aproximado |z3 - z2| / |z3| * 100%
      let error: number | null = null;
      const magZ3 = ComplexUtils.abs(z3);
      const diffMag = ComplexUtils.abs(dx);

      if (magZ3 > 1e-12) {
        error = PrecisionUtils.round((diffMag / magZ3) * 100, decimals);
      } else {
        error = PrecisionUtils.round(diffMag * 100, decimals);
      }

      iterations.push({
        iteration: iter,
        z0: PrecisionUtils.cleanComplex(z0, decimals),
        z1: PrecisionUtils.cleanComplex(z1, decimals),
        z2: PrecisionUtils.cleanComplex(z2, decimals),
        z3: PrecisionUtils.cleanComplex(z3, decimals),
        fz3: PrecisionUtils.cleanComplex(fz3, decimals),
        a: PrecisionUtils.cleanComplex(a, decimals),
        b: PrecisionUtils.cleanComplex(b, decimals),
        c: PrecisionUtils.cleanComplex(c, decimals),
        discriminant: PrecisionUtils.cleanComplex(disc, decimals),
        error,
      });

      // Criterios de convergencia
      if (ComplexUtils.abs(fz3) < PrecisionUtils.getEpsilon(decimals) || (error !== null && error < tolerance)) {
        converged = true;
        break;
      }

      // Desplazamiento de puntos para la siguiente iteración
      z0 = { ...z1 };
      z1 = { ...z2 };
      z2 = { ...z3 };
    }

    const finalRoot = PrecisionUtils.cleanComplex(z3, decimals);

    return {
      rootIndex,
      root: finalRoot,
      magnitude: PrecisionUtils.round(ComplexUtils.abs(finalRoot), decimals),
      iterations,
      converged,
    };
  }
}
