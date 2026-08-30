import { BisectionIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';

/**
 * Resuelve la raíz de una función usando el método de Bisección.
 * 
 * @param expression Expresión matemática (ej: 'x^3 - x - 1')
 * @param aInitial Límite inferior del intervalo
 * @param bInitial Límite superior del intervalo
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @returns Estructura MethodResponse con la raíz y el desglose de iteraciones
 */
export function calculateBisection(
  expression: string,
  aInitial: number,
  bInitial: number,
  tolerance: number,
  maxIterations: number
): MethodResponse<BisectionIteration> {
  try {
    let a = aInitial;
    let b = bInitial;

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

    if (a >= b) {
      return {
        success: false,
        errorMessage: 'El límite inferior "a" debe ser menor que el límite superior "b".',
      };
    }

    // Evaluar extremos iniciales
    let fa = MathParser.evaluate(expression, { x: a });
    let fb = MathParser.evaluate(expression, { x: b });

    // Comprobar si los extremos ya son raíces exactas
    if (fa === 0) {
      return {
        success: true,
        root: a,
        iterations: [
          {
            iteration: 1,
            a,
            b,
            xr: a,
            fa,
            fb,
            fxr: fa,
            error: 0,
          },
        ],
      };
    }

    if (fb === 0) {
      return {
        success: true,
        root: b,
        iterations: [
          {
            iteration: 1,
            a,
            b,
            xr: b,
            fa,
            fb,
            fxr: fb,
            error: 0,
          },
        ],
      };
    }

    // Teorema de Bolzano: f(a) y f(b) deben cambiar de signo
    if (Math.sign(fa) === Math.sign(fb)) {
      return {
        success: false,
        errorMessage: `El intervalo [${a}, ${b}] no cumple con el Teorema del Valor Intermedio (f(a) y f(b) deben tener signos opuestos). f(a) = ${fa.toFixed(6)}, f(b) = ${fb.toFixed(6)}.`,
      };
    }

    const iterations: BisectionIteration[] = [];
    let xr = 0;
    let xrOld = 0;
    let error: number | null = null;
    let fxr = 0;

    for (let iter = 1; iter <= maxIterations; iter++) {
      xr = (a + b) / 2;
      fxr = MathParser.evaluate(expression, { x: xr });

      // Calcular error relativo porcentual aproximado
      if (iter > 1) {
        if (xr !== 0) {
          error = Math.abs((xr - xrOld) / xr) * 100;
        } else {
          error = 0; // Evitar división por cero si xr es exactamente cero
        }
      } else {
        error = null; // No hay aproximación anterior en la iteración 1
      }

      iterations.push({
        iteration: iter,
        a,
        b,
        xr,
        fa,
        fb,
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
      if (Math.sign(fa) * Math.sign(fxr) < 0) {
        b = xr;
        fb = fxr;
      } else {
        a = xr;
        fa = fxr;
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
      errorMessage: error.message || 'Error inesperado durante el cálculo por Bisección.',
    };
  }
}
