import { FixedPointIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';

/**
 * Resuelve la raíz de una ecuación usando el método de Punto Fijo.
 * Requiere la función despejada g(x) tal que x = g(x).
 * 
 * @param gExpression Expresión matemática despejada g(x) (ej: '(x + 1)^(1/3)')
 * @param x0 Valor semilla inicial
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @returns Estructura MethodResponse con la raíz y el desglose de iteraciones
 */
export function calculateFixedPoint(
  gExpression: string,
  x0: number,
  tolerance: number,
  maxIterations: number
): MethodResponse<FixedPointIteration> {
  try {
    // Validación de entradas
    if (maxIterations <= 0) {
      return {
        success: false,
        errorMessage: 'El número máximo de iteraciones debe ser un entero mayor que cero.',
      };
    }

    if (tolerance <= 0) {
      return {
        success: false,
        errorMessage: 'La tolerancia debe ser un número positivo mayor que cero.',
      };
    }

    const iterations: FixedPointIteration[] = [];
    let xi = x0;
    let gxi = 0;
    let error: number | null = null;
    let hasConverged = false;

    for (let iter = 1; iter <= maxIterations; iter++) {
      try {
        gxi = MathParser.evaluate(gExpression, { x: xi });
      } catch (err: any) {
        return {
          success: false,
          errorMessage: `Error al evaluar g(x) en x = ${xi}. Detalle: ${err.message}`,
          iterations,
        };
      }

      // Validar divergencia extrema (valores no reales, infinitos o indeterminados)
      if (isNaN(gxi) || !isFinite(gxi) || Math.abs(gxi) > 1e15) {
        return {
          success: false,
          errorMessage: `El método de Punto Fijo divergió abruptamente en la iteración ${iter} (x_i = ${xi}, g(x_i) = ${gxi}).`,
          iterations,
        };
      }

      // Calcular error relativo porcentual aproximado
      if (gxi !== 0) {
        error = Math.abs((gxi - xi) / gxi) * 100;
      } else {
        error = 0;
      }

      iterations.push({
        iteration: iter,
        xi,
        gxi,
        error,
      });

      // Criterios de parada
      // 1. Tolerancia alcanzada
      if (error < tolerance) {
        hasConverged = true;
        break;
      }

      // 2. Convergencia exacta (punto fijo perfecto g(x) = x)
      if (Math.abs(gxi - xi) < 1e-15) {
        hasConverged = true;
        break;
      }

      // Actualizar xi para la siguiente iteración
      xi = gxi;
    }

    return {
      success: true,
      root: gxi,
      iterations,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error.message || 'Error inesperado durante el cálculo por Punto Fijo.',
    };
  }
}
