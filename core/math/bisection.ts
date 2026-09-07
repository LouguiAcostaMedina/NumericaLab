import { BisectionIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';
import { MethodRecommender } from './methodRecommender';
import { PrecisionUtils } from './precisionUtils';

/**
 * Resuelve la raíz de una función usando el método de Bisección.
 * 
 * @param expression Expresión matemática (ej: 'x^3 - x - 1')
 * @param aInitial Límite inferior del intervalo
 * @param bInitial Límite superior del intervalo
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @param decimals Precisión decimal (6, 8, 10, 12)
 */
export function calculateBisection(
  expression: string,
  aInitial: number,
  bInitial: number,
  tolerance: number,
  maxIterations: number,
  decimals: number = 6
): MethodResponse<BisectionIteration> {
  const recommendation = MethodRecommender.recommend(expression, { a: aInitial, b: bInitial });
  const semanticValidation = MathParser.validateSemantic(expression, 'bisection', { a: aInitial, b: bInitial });

  try {
    let a = aInitial;
    let b = bInitial;

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

    if (a >= b) {
      return {
        success: false,
        errorMessage: 'El límite inferior "a" debe ser estrictamente menor que el límite superior "b".',
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    let fa = MathParser.evaluate(expression, { x: a });
    let fb = MathParser.evaluate(expression, { x: b });

    if (fa === 0) {
      return {
        success: true,
        root: PrecisionUtils.round(a, decimals),
        iterations: [
          {
            iteration: 1,
            a: PrecisionUtils.round(a, decimals),
            b: PrecisionUtils.round(b, decimals),
            xr: PrecisionUtils.round(a, decimals),
            fa: PrecisionUtils.round(fa, decimals),
            fb: PrecisionUtils.round(fb, decimals),
            fxr: PrecisionUtils.round(fa, decimals),
            error: 0,
          },
        ],
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    if (fb === 0) {
      return {
        success: true,
        root: PrecisionUtils.round(b, decimals),
        iterations: [
          {
            iteration: 1,
            a: PrecisionUtils.round(a, decimals),
            b: PrecisionUtils.round(b, decimals),
            xr: PrecisionUtils.round(b, decimals),
            fa: PrecisionUtils.round(fa, decimals),
            fb: PrecisionUtils.round(fb, decimals),
            fxr: PrecisionUtils.round(fb, decimals),
            error: 0,
          },
        ],
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    if (Math.sign(fa) === Math.sign(fb)) {
      return {
        success: false,
        errorMessage: `El intervalo [${a}, ${b}] no cumple con el Teorema del Valor Intermedio (f(a) y f(b) deben tener signos opuestos). f(a) = ${PrecisionUtils.format(fa, decimals)}, f(b) = ${PrecisionUtils.format(fb, decimals)}.`,
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    const iterations: BisectionIteration[] = [];
    let xr = 0;
    let xrOld = 0;
    let error: number | null = null;
    let fxr = 0;
    const eps = PrecisionUtils.getEpsilon(decimals);

    for (let iter = 1; iter <= maxIterations; iter++) {
      xr = (a + b) / 2;
      fxr = MathParser.evaluate(expression, { x: xr });

      if (iter > 1) {
        if (xr !== 0) {
          error = PrecisionUtils.round(Math.abs((xr - xrOld) / xr) * 100, decimals);
        } else {
          error = 0;
        }
      } else {
        error = null;
      }

      iterations.push({
        iteration: iter,
        a: PrecisionUtils.round(a, decimals),
        b: PrecisionUtils.round(b, decimals),
        xr: PrecisionUtils.round(xr, decimals),
        fa: PrecisionUtils.round(fa, decimals),
        fb: PrecisionUtils.round(fb, decimals),
        fxr: PrecisionUtils.round(fxr, decimals),
        error,
      });

      if (error !== null && error < tolerance) {
        break;
      }

      if (Math.abs(fxr) < eps) {
        break;
      }

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
      root: PrecisionUtils.round(xr, decimals),
      iterations,
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error.message || 'Error inesperado durante el cálculo por Bisección.',
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  }
}
