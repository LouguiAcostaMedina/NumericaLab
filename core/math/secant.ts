import { SecantIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';
import { MethodRecommender } from './methodRecommender';
import { PrecisionUtils } from './precisionUtils';

/**
 * Resuelve la raíz de una función usando el método de la Secante.
 * 
 * @param expression Expresión matemática f(x) (ej: 'x^3 - x - 1')
 * @param x0 Primer valor semilla inicial
 * @param x1 Segundo valor semilla inicial
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @param decimals Precisión decimal (6, 8, 10, 12)
 */
export function calculateSecant(
  expression: string,
  x0: number,
  x1: number,
  tolerance: number,
  maxIterations: number,
  decimals: number = 6
): MethodResponse<SecantIteration> {
  const recommendation = MethodRecommender.recommend(expression, { x0, x1 });
  const semanticValidation = MathParser.validateSemantic(expression, 'secant', { x0, x1 });

  if (semanticValidation.severity === 'error') {
    return {
      success: false,
      errorMessage: semanticValidation.message,
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  }

  try {
    if (maxIterations <= 0) {
      return {
        success: false,
        errorMessage: 'El número máximo de iteraciones debe ser un entero mayor que cero.',
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    if (tolerance <= 0) {
      return {
        success: false,
        errorMessage: 'La tolerancia debe ser un número positivo mayor que cero.',
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    const iterations: SecantIteration[] = [];
    let xiMinus1 = x0;
    let xi = x1;
    let xiNext = 0;
    let error: number | null = null;
    const eps = PrecisionUtils.getEpsilon(decimals);

    for (let iter = 1; iter <= maxIterations; iter++) {
      let fxiMinus1: number;
      let fxi: number;

      try {
        fxiMinus1 = MathParser.evaluate(expression, { x: xiMinus1 });
        fxi = MathParser.evaluate(expression, { x: xi });
      } catch (err: any) {
        return {
          success: false,
          errorMessage: `Error al evaluar la función. Detalle: ${err.message}`,
          iterations,
          precisionConfig: { decimals },
          semanticValidation,
          recommendation,
        };
      }

      const denominator = fxi - fxiMinus1;

      if (Math.abs(denominator) < 1e-15) {
        return {
          success: false,
          errorMessage: `El método de la Secante falló por división por cero en la iteración ${iter}. f(x_i) = ${PrecisionUtils.format(fxi, decimals)}, f(x_{i-1}) = ${PrecisionUtils.format(fxiMinus1, decimals)} son idénticos o extremadamente cercanos.`,
          iterations,
          precisionConfig: { decimals },
          semanticValidation,
          recommendation,
        };
      }

      xiNext = xi - (fxi * (xi - xiMinus1)) / denominator;

      if (xiNext !== 0) {
        error = PrecisionUtils.round(Math.abs((xiNext - xi) / xiNext) * 100, decimals);
      } else {
        error = 0;
      }

      iterations.push({
        iteration: iter,
        xiMinus1: PrecisionUtils.round(xiMinus1, decimals),
        xi: PrecisionUtils.round(xi, decimals),
        fxiMinus1: PrecisionUtils.round(fxiMinus1, decimals),
        fxi: PrecisionUtils.round(fxi, decimals),
        xiNext: PrecisionUtils.round(xiNext, decimals),
        error,
      });

      if (Math.abs(fxi) < eps || (error !== null && error < tolerance)) {
        xiNext = PrecisionUtils.round(xiNext, decimals);
        break;
      }

      xiMinus1 = xi;
      xi = xiNext;
    }

    return {
      success: true,
      root: PrecisionUtils.round(xiNext, decimals),
      iterations,
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error.message || 'Error inesperado durante el cálculo por el método de la Secante.',
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  }
}
