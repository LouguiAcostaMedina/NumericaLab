import { FixedPointIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';
import { MethodRecommender } from './methodRecommender';
import { PrecisionUtils } from './precisionUtils';

/**
 * Resuelve la raíz de una ecuación usando el método de Punto Fijo.
 * Requiere la función despejada g(x) tal que x = g(x).
 * 
 * @param gExpression Expresión matemática despejada g(x) (ej: '(x + 1)^(1/3)')
 * @param x0 Valor semilla inicial
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @param decimals Precisión decimal (6, 8, 10, 12)
 */
export function calculateFixedPoint(
  gExpression: string,
  x0: number,
  tolerance: number,
  maxIterations: number,
  decimals: number = 6
): MethodResponse<FixedPointIteration> {
  const recommendation = MethodRecommender.recommend(gExpression, { x0, gExpression });
  const semanticValidation = MathParser.validateSemantic(gExpression, 'fixed-point', { x0, gExpression });

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

    const iterations: FixedPointIteration[] = [];
    let xi = x0;
    let gxi = 0;
    let error: number | null = null;
    const eps = PrecisionUtils.getEpsilon(decimals);

    for (let iter = 1; iter <= maxIterations; iter++) {
      try {
        gxi = MathParser.evaluate(gExpression, { x: xi });
      } catch (err: any) {
        return {
          success: false,
          errorMessage: `Error al evaluar g(x) en x = ${PrecisionUtils.format(xi, decimals)}. Detalle: ${err.message}`,
          iterations,
          precisionConfig: { decimals },
          semanticValidation,
          recommendation,
        };
      }

      if (isNaN(gxi) || !isFinite(gxi) || Math.abs(gxi) > 1e15) {
        return {
          success: false,
          errorMessage: `El método de Punto Fijo divergió en la iteración ${iter} (x_i = ${PrecisionUtils.format(xi, decimals)}, g(x_i) = ${PrecisionUtils.format(gxi, decimals)}).`,
          iterations,
          precisionConfig: { decimals },
          semanticValidation,
          recommendation,
        };
      }

      if (gxi !== 0) {
        error = PrecisionUtils.round(Math.abs((gxi - xi) / gxi) * 100, decimals);
      } else {
        error = 0;
      }

      iterations.push({
        iteration: iter,
        xi: PrecisionUtils.round(xi, decimals),
        gxi: PrecisionUtils.round(gxi, decimals),
        error,
      });

      if (error < tolerance || Math.abs(gxi - xi) < eps) {
        break;
      }

      xi = gxi;
    }

    return {
      success: true,
      root: PrecisionUtils.round(gxi, decimals),
      iterations,
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error.message || 'Error inesperado durante el cálculo por Punto Fijo.',
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  }
}
