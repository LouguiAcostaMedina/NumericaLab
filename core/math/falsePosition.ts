import { FalsePositionIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';

/**
 * Resuelve la raíz de una función usando el método de Falsa Posición.
 * 
 * @param expression Expresión matemática (ej: 'x^3 - x - 1')
 * @param xlInitial Límite inferior del intervalo (xl)
 * @param xuInitial Límite superior del intervalo (xu)
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @returns Estructura MethodResponse con la raíz y el desglose de iteraciones
 */
export function calculateFalsePosition(
  expression: string,
  xlInitial: number,
  xuInitial: number,
  tolerance: number,
  maxIterations: number
): MethodResponse<FalsePositionIteration> {
  try {
    let xl = xlInitial;
    let xu = xuInitial;

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

    if (xl >= xu) {
      return {
        success: false,
        errorMessage: 'El límite inferior "xl" debe ser menor que el límite superior "xu".',
      };
    }

    // Evaluar extremos iniciales
    let fxl = MathParser.evaluate(expression, { x: xl });
    let fxu = MathParser.evaluate(expression, { x: xu });

    // Comprobar si los extremos ya son raíces exactas
    if (fxl === 0) {
      return {
        success: true,
        root: xl,
        iterations: [
          {
            iteration: 1,
            xl,
            xu,
            xr: xl,
            fxl,
            fxu,
            fxr: fxl,
            error: 0,
          },
        ],
      };
    }

    if (fxu === 0) {
      return {
        success: true,
        root: xu,
        iterations: [
          {
            iteration: 1,
            xl,
            xu,
            xr: xu,
            fxl,
            fxu,
            fxr: fxu,
            error: 0,
          },
        ],
      };
    }

    // Teorema de Bolzano: f(xl) y f(xu) deben cambiar de signo
    if (Math.sign(fxl) === Math.sign(fxu)) {
      return {
        success: false,
        errorMessage: `El intervalo [${xl}, ${xu}] no cumple con el Teorema del Valor Intermedio. f(xl) = ${fxl.toFixed(6)}, f(xu) = ${fxu.toFixed(6)}. Se requiere cambio de signo.`,
      };
    }

    const iterations: FalsePositionIteration[] = [];
    let xr = 0;
    let xrOld = 0;
    let error: number | null = null;
    let fxr = 0;

    for (let iter = 1; iter <= maxIterations; iter++) {
      const denominator = fxl - fxu;

      // Evitar división por cero
      if (Math.abs(denominator) < 1e-15) {
        return {
          success: false,
          errorMessage: `El método de Falsa Posición falló por división por cero en la iteración ${iter}. f(xl) = ${fxl}, f(xu) = ${fxu}.`,
          iterations,
        };
      }

      // Fórmula de Falsa Posición
      xr = xu - (fxu * (xl - xu)) / denominator;
      fxr = MathParser.evaluate(expression, { x: xr });

      // Calcular error relativo porcentual aproximado
      if (iter > 1) {
        if (xr !== 0) {
          error = Math.abs((xr - xrOld) / xr) * 100;
        } else {
          error = 0; // Evitar división por cero si xr es exactamente cero
        }
      } else {
        error = null;
      }

      iterations.push({
        iteration: iter,
        xl,
        xu,
        xr,
        fxl,
        fxu,
        fxr,
        error,
      });

      // Criterios de parada
      // 1. Tolerancia alcanzada
      if (error !== null && error < tolerance) {
        break;
      }
      // 2. Raíz exacta encontrada
      if (Math.abs(fxr) < 1e-15) {
        break;
      }

      // Actualizar el intervalo según el cambio de signo
      if (Math.sign(fxl) * Math.sign(fxr) < 0) {
        xu = xr;
        fxu = fxr;
      } else {
        xl = xr;
        fxl = fxr;
      }

      xrOld = xr;
    }

    return {
      success: true,
      root: xr,
      iterations,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error.message || 'Error inesperado durante el cálculo por Falsa Posición.',
    };
  }
}
