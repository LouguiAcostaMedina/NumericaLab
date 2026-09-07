import { MethodRecommendation } from '../domain/types';
import { MathParser } from './MathParser';
import { DescartesLagrange } from './descartesLagrange';
import { PolynomialSolver } from './polynomialSolver';

/**
 * Sistema de Sugerencia Automática de Métodos Numéricos.
 * Analiza la función o polinomio ingresado, su grado, derivadas e intervalos
 * para recomendar el método numérico con mayor garantía de convergencia y valor pedagógico.
 */
export class MethodRecommender {
  /**
   * Analiza la expresión matemática y sus parámetros de entrada para generar una recomendación.
   */
  static recommend(
    expression: string,
    params: {
      a?: number;
      b?: number;
      x0?: number;
      x1?: number;
      gExpression?: string;
    } = {}
  ): MethodRecommendation {
    const expr = expression.trim();
    if (!expr) {
      return {
        recommendedMethodId: 'bisection',
        recommendedMethodName: 'Bisección',
        confidence: 'baja',
        reason: 'Ingresa una función o polinomio para recibir una recomendación automática.',
      };
    }

    // 1. Verificar si es un Polinomio Puro mediante PolynomialSolver
    try {
      const coeffs = PolynomialSolver.parsePolynomialString(expr);
      const degree = coeffs.length - 1;

      if (degree >= 3) {
        const descartes = DescartesLagrange.analyzeDescartes(coeffs);
        const hasComplexPotential = descartes.minComplexRoots > 0 || (descartes.maxPositiveRoots === 0 && descartes.maxNegativeRoots === 0);

        return {
          recommendedMethodId: 'polynomials',
          recommendedMethodName: 'Método de Müller (Polinomios)',
          confidence: 'alta',
          reason: `Se detectó un polinomio de Grado ${degree}. El Método de Müller es ideal para polinomios de grado superior ya que encuentra raíces reales y complejas mediante deflación sintética de Horner.${
            hasComplexPotential ? ' (Se presumen raíces complejas por la Regla de Descartes).' : ''
          }`,
          alternativeMethodId: 'newton',
          alternativeMethodName: 'Newton-Raphson',
        };
      }
    } catch {
      // No es un polinomio puro simple, continuar análisis transcripcional/general
    }

    // 2. Evaluar Bracketing Interval [a, b] si se proporcionaron a y b
    if (params.a !== undefined && params.b !== undefined && !isNaN(params.a) && !isNaN(params.b)) {
      try {
        const fa = MathParser.evaluate(expr, { x: params.a });
        const fb = MathParser.evaluate(expr, { x: params.b });

        if (fa * fb < 0) {
          return {
            recommendedMethodId: 'bisection',
            recommendedMethodName: 'Método de Bisección',
            confidence: 'alta',
            reason: `El intervalo [${params.a}, ${params.b}] cumple el Teorema de Bolzano (f(a)·f(b) = ${(fa * fb).toExponential(2)} < 0). Bisección o Falsa Posición garantizan convergencia segura.`,
            alternativeMethodId: 'false-position',
            alternativeMethodName: 'Falsa Posición',
          };
        } else {
          return {
            recommendedMethodId: 'newton',
            recommendedMethodName: 'Newton-Raphson',
            confidence: 'media',
            reason: `El intervalo [${params.a}, ${params.b}] NO tiene cambio de signo en sus extremos (f(a)·f(b) >= 0). Se sugiere Newton-Raphson usando una semilla x0 individual o ajustar el intervalo.`,
            alternativeMethodId: 'secant',
            alternativeMethodName: 'Método de la Secante',
          };
        }
      } catch {
        // Ignorar si falla la evaluación inicial
      }
    }

    // 3. Evaluar Derivabilidad para Newton-Raphson vs Secante
    try {
      const derivedStr = MathParser.derivative(expr, 'x');
      if (derivedStr && derivedStr !== '0') {
        const x0Val = params.x0 ?? 1.0;
        const dfx0 = MathParser.evaluate(derivedStr, { x: x0Val });

        if (Math.abs(dfx0) > 1e-6) {
          return {
            recommendedMethodId: 'newton',
            recommendedMethodName: 'Newton-Raphson',
            confidence: 'alta',
            reason: `La función admite derivada simbólica (f'(x) = ${derivedStr}) y f'(${x0Val}) ≠ 0. Newton-Raphson ofrece convergencia cuadrática (muy rápida).`,
            alternativeMethodId: 'secant',
            alternativeMethodName: 'Método de la Secante',
          };
        } else {
          return {
            recommendedMethodId: 'secant',
            recommendedMethodName: 'Método de la Secante',
            confidence: 'media',
            reason: `La derivada de la función se anula o es casi cero cerca de x0=${x0Val}. Se recomienda la Secante para evitar división por cero.`,
            alternativeMethodId: 'bisection',
            alternativeMethodName: 'Bisección',
          };
        }
      }
    } catch {
      // Si la derivada falla o no es posible simbólicamente
      return {
        recommendedMethodId: 'secant',
        recommendedMethodName: 'Método de la Secante',
        confidence: 'media',
        reason: 'No se pudo obtener una derivada simbólica cerrada de la función. El método de la Secante aproxima la derivada mediante diferencias finitas sin requerir f\'(x).',
        alternativeMethodId: 'bisection',
        alternativeMethodName: 'Bisección',
      };
    }

    // Default Fallback
    return {
      recommendedMethodId: 'bisection',
      recommendedMethodName: 'Bisección',
      confidence: 'media',
      reason: 'Método cerrado básico de convergencia garantizada si se elige un intervalo apropiado.',
      alternativeMethodId: 'newton',
      alternativeMethodName: 'Newton-Raphson',
    };
  }
}
