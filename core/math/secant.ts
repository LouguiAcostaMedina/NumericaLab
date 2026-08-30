import { SecantIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';

/**
 * Resuelve la raíz de una función usando el método de la Secante.
 * Requiere dos aproximaciones iniciales (x0 y x1) y no necesita derivada.
 * 
 * @param expression Expresión matemática f(x) (ej: 'x^3 - x - 1')
 * @param x0 Primer valor semilla inicial
 * @param x1 Segundo valor semilla inicial
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @returns Estructura MethodResponse con la raíz y el desglose de iteraciones
 */
export function calculateSecant(
  expression: string,
  x0: number,
  x1: number,
  tolerance: number,
  maxIterations: number
): MethodResponse<SecantIteration> {
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

    const iterations: SecantIteration[] = [];
    let xiMinus1 = x0;
    let xi = x1;
    let xiNext = 0;
    let error: number | null = null;
    let hasConverged = false;

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
        };
      }

      const denominator = fxi - fxiMinus1;

      // Control de excepciones: división por cero
      if (Math.abs(denominator) < 1e-15) {
        return {
          success: false,
          errorMessage: `El método de la Secante falló por división por cero en la iteración ${iter}. f(x_i) = ${fxi}, f(x_{i-1}) = ${fxiMinus1} son idénticos o extremadamente cercanos.`,
          iterations,
        };
      }

      // Fórmula del método de la Secante
      xiNext = xi - (fxi * (xi - xiMinus1)) / denominator;

      // Calcular el error relativo porcentual aproximado
      if (xiNext !== 0) {
        error = Math.abs((xiNext - xi) / xiNext) * 100;
      } else {
        error = 0;
      }

      iterations.push({
        iteration: iter,
        xiMinus1,
        xi,
        fxiMinus1,
        fxi,
        xiNext,
        error,
      });

      // Criterios de parada
      // 1. Si fxi es prácticamente cero (raíz exacta encontrada en xi)
      if (Math.abs(fxi) < 1e-15) {
        xiNext = xi; // La raíz es xi
        hasConverged = true;
        break;
      }

      // 2. Si el error relativo porcentual es menor que la tolerancia
      if (error < tolerance) {
        hasConverged = true;
        break;
      }

      // Actualizar variables para el siguiente paso
      xiMinus1 = xi;
      xi = xiNext;
    }

    return {
      success: true,
      root: xiNext,
      iterations,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error.message || 'Error inesperado durante el cálculo por el método de la Secante.',
    };
  }
}
