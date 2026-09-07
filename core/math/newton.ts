import { NewtonIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';
import { MethodRecommender } from './methodRecommender';
import { PrecisionUtils } from './precisionUtils';

/**
 * Resuelve la raíz de una función usando el método de Newton-Raphson.
 * 
 * @param expression Expresión matemática (ej: 'x^3 - x - 1')
 * @param x0 Valor inicial (semilla)
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @param decimals Precisión decimal (6, 8, 10, 12)
 */
export function calculateNewtonRaphson(
  expression: string,
  x0: number,
  tolerance: number,
  maxIterations: number,
  decimals: number = 6
): MethodResponse<NewtonIteration> {
  // Generar recomendación y validación semántica algorítmica previa
  const recommendation = MethodRecommender.recommend(expression, { x0 });
  const semanticValidation = MathParser.validateSemantic(expression, 'newton', { x0 });

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

    let derivativeExpression: string;
    try {
      derivativeExpression = MathParser.derivative(expression, 'x');
    } catch (err: any) {
      return {
        success: false,
        errorMessage: `No se pudo calcular la derivada simbólica de la función. Detalle: ${err.message}`,
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    const iterations: NewtonIteration[] = [];
    let xi = x0;
    let xiNext = 0;
    let error: number | null = null;
    const eps = PrecisionUtils.getEpsilon(decimals);

    for (let iter = 1; iter <= maxIterations; iter++) {
      const fxi = MathParser.evaluate(expression, { x: xi });
      const dfxi = MathParser.evaluate(derivativeExpression, { x: xi });

      if (Math.abs(dfxi) < 1e-15) {
        return {
          success: false,
          errorMessage: `El método de Newton-Raphson falló debido a que la derivada evaluada es cero (f'(xi) = ${dfxi}) en x = ${PrecisionUtils.round(xi, decimals)}. Se detuvo para evitar división por cero.`,
          iterations,
          precisionConfig: { decimals },
          semanticValidation,
          recommendation,
        };
      }

      xiNext = xi - fxi / dfxi;

      if (xiNext !== 0) {
        error = PrecisionUtils.round(Math.abs((xiNext - xi) / xiNext) * 100, decimals);
      } else {
        error = 0;
      }

      iterations.push({
        iteration: iter,
        xi: PrecisionUtils.round(xi, decimals),
        fxi: PrecisionUtils.round(fxi, decimals),
        dfxi: PrecisionUtils.round(dfxi, decimals),
        xiNext: PrecisionUtils.round(xiNext, decimals),
        error,
      });

      if (Math.abs(fxi) < eps || (error !== null && error < tolerance)) {
        xiNext = PrecisionUtils.round(xiNext, decimals);
        break;
      }

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
      errorMessage: error.message || 'Error inesperado durante el cálculo por Newton-Raphson.',
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  }
}
