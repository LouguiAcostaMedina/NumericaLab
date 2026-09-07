import { FalsePositionIteration, MethodResponse } from '../domain/types';
import { MathParser } from './MathParser';
import { MethodRecommender } from './methodRecommender';
import { PrecisionUtils } from './precisionUtils';

/**
 * Resuelve la raíz de una función usando el método de Falsa Posición.
 * 
 * @param expression Expresión matemática (ej: 'x^3 - x - 1')
 * @param xlInitial Límite inferior del intervalo (xl)
 * @param xuInitial Límite superior del intervalo (xu)
 * @param tolerance Tolerancia del error relativo porcentual (%)
 * @param maxIterations Número máximo de iteraciones
 * @param decimals Precisión decimal (6, 8, 10, 12)
 */
export function calculateFalsePosition(
  expression: string,
  xlInitial: number,
  xuInitial: number,
  tolerance: number,
  maxIterations: number,
  decimals: number = 6
): MethodResponse<FalsePositionIteration> {
  const recommendation = MethodRecommender.recommend(expression, { a: xlInitial, b: xuInitial });
  const semanticValidation = MathParser.validateSemantic(expression, 'false-position', { a: xlInitial, b: xuInitial });

  try {
    let xl = xlInitial;
    let xu = xuInitial;

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

    if (xl >= xu) {
      return {
        success: false,
        errorMessage: 'El límite inferior "xl" debe ser menor que el límite superior "xu".',
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    let fxl = MathParser.evaluate(expression, { x: xl });
    let fxu = MathParser.evaluate(expression, { x: xu });

    if (fxl === 0) {
      return {
        success: true,
        root: PrecisionUtils.round(xl, decimals),
        iterations: [
          {
            iteration: 1,
            xl: PrecisionUtils.round(xl, decimals),
            xu: PrecisionUtils.round(xu, decimals),
            xr: PrecisionUtils.round(xl, decimals),
            fxl: PrecisionUtils.round(fxl, decimals),
            fxu: PrecisionUtils.round(fxu, decimals),
            fxr: PrecisionUtils.round(fxl, decimals),
            error: 0,
          },
        ],
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    if (fxu === 0) {
      return {
        success: true,
        root: PrecisionUtils.round(xu, decimals),
        iterations: [
          {
            iteration: 1,
            xl: PrecisionUtils.round(xl, decimals),
            xu: PrecisionUtils.round(xu, decimals),
            xr: PrecisionUtils.round(xu, decimals),
            fxl: PrecisionUtils.round(fxl, decimals),
            fxu: PrecisionUtils.round(fxu, decimals),
            fxr: PrecisionUtils.round(fxu, decimals),
            error: 0,
          },
        ],
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    if (Math.sign(fxl) === Math.sign(fxu)) {
      return {
        success: false,
        errorMessage: `El intervalo [${xl}, ${xu}] no cumple con el Teorema del Valor Intermedio. f(xl) = ${PrecisionUtils.format(fxl, decimals)}, f(xu) = ${PrecisionUtils.format(fxu, decimals)}. Se requiere cambio de signo.`,
        precisionConfig: { decimals },
        semanticValidation,
        recommendation,
      };
    }

    const iterations: FalsePositionIteration[] = [];
    let xr = 0;
    let xrOld = 0;
    let error: number | null = null;
    let fxr = 0;
    const eps = PrecisionUtils.getEpsilon(decimals);

    for (let iter = 1; iter <= maxIterations; iter++) {
      const denominator = fxl - fxu;

      if (Math.abs(denominator) < 1e-15) {
        return {
          success: false,
          errorMessage: `El método de Falsa Posición falló por división por cero en la iteración ${iter}. f(xl) = ${PrecisionUtils.format(fxl, decimals)}, f(xu) = ${PrecisionUtils.format(fxu, decimals)}.`,
          iterations,
          precisionConfig: { decimals },
          semanticValidation,
          recommendation,
        };
      }

      xr = xu - (fxu * (xl - xu)) / denominator;
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
        xl: PrecisionUtils.round(xl, decimals),
        xu: PrecisionUtils.round(xu, decimals),
        xr: PrecisionUtils.round(xr, decimals),
        fxl: PrecisionUtils.round(fxl, decimals),
        fxu: PrecisionUtils.round(fxu, decimals),
        fxr: PrecisionUtils.round(fxr, decimals),
        error,
      });

      if (error !== null && error < tolerance) {
        break;
      }

      if (Math.abs(fxr) < eps) {
        break;
      }

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
      root: PrecisionUtils.round(xr, decimals),
      iterations,
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error.message || 'Error inesperado durante el cálculo por Falsa Posición.',
      precisionConfig: { decimals },
      semanticValidation,
      recommendation,
    };
  }
}
