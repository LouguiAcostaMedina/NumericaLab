import { NewtonIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';

/**
 * Resuelve la raíz de una función usando el método de Newton-Raphson.
 * 
 * @param expression Expresión matemática (ej: 'x^3 - x - 1')
 * @param x0 Valor inicial (semilla)
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @returns Estructura MethodResponse con la raíz y el desglose de iteraciones
 */
export function calculateNewtonRaphson(
  expression: string,
  x0: number,
  tolerance: number,
  maxIterations: number
): MethodResponse<NewtonIteration> {
  try {
    // Validación de entradas básicas
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

    // Calcular la derivada simbólica
    let derivativeExpression: string;
    try {
      derivativeExpression = MathParser.derivative(expression, 'x');
    } catch (err: any) {
      return {
        success: false,
        errorMessage: `No se pudo calcular la derivada simbólica de la función. Detalle: ${err.message}`,
      };
    }

    const iterations: NewtonIteration[] = [];
    let xi = x0;
    let xiNext = 0;
    let error: number | null = null;
    let hasConverged = false;

    for (let iter = 1; iter <= maxIterations; iter++) {
      const fxi = MathParser.evaluate(expression, { x: xi });
      const dfxi = MathParser.evaluate(derivativeExpression, { x: xi });

      // Control de excepciones: división por cero o derivada extremadamente cercana a cero
      if (Math.abs(dfxi) < 1e-15) {
        return {
          success: false,
          errorMessage: `El método de Newton-Raphson falló debido a que la derivada evaluada es cero o extremadamente cercana a cero (f'(xi) = ${dfxi}) en la iteración ${iter} (x = ${xi}). Se detuvo para evitar división por cero.`,
          iterations, // Devolvemos las iteraciones calculadas hasta ahora
        };
      }

      // Calcular el siguiente valor aproximado
      xiNext = xi - fxi / dfxi;

      // Calcular el error relativo porcentual aproximado
      if (xiNext !== 0) {
        error = Math.abs((xiNext - xi) / xiNext) * 100;
      } else {
        error = 0; // Evitar división por cero si xiNext es exactamente cero
      }

      iterations.push({
        iteration: iter,
        xi,
        fxi,
        dfxi,
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

      // 2. Si el error porcentual es menor que la tolerancia
      if (error < tolerance) {
        hasConverged = true;
        break;
      }

      // Actualizar xi para la siguiente iteración
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
      errorMessage: error.message || 'Error inesperado durante el cálculo por Newton-Raphson.',
    };
  }
}
