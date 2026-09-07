import * as math from 'mathjs';
import { SemanticValidationResult } from '../domain/types';

/**
 * Clase utilitaria para parsear, evaluar y derivar expresiones matemáticas
 * usando la librería mathjs de manera segura, asíncrona y con tolerancia a notaciones avanzadas.
 */
export class MathParser {
  /**
   * Pre-normaliza expresiones matemáticas soportando notación científica (1e-5, 2.5E-3)
   * y multiplicación implícita (2x, 3.5z^2).
   */
  static normalizeExpression(expression: string): string {
    if (!expression || expression.trim() === '') return '';

    let expr = expression.trim();

    // Reemplazar notación científica con exponente 'e' o 'E' si es necesario
    // math.js maneja 1e-5 nativamente, pero aseguramos espacios limpios
    expr = expr.replace(/(\d+)\s*e\s*([+-]?\d+)/gi, '$1e$2');

    // Multiplicación implícita entre constantes y variables (ej: 2x -> 2*x, 3.5z -> 3.5*z)
    expr = expr.replace(/(\d+(\.\d+)?)\s*([a-zA-Z])/g, '$1*$3');

    // Multiplicación implícita entre variables y paréntesis (ej: x(x-1) -> x*(x-1))
    expr = expr.replace(/([a-zA-Z0-9_]+)\s*\(/g, (match, p1) => {
      // Si p1 es el nombre de una función conocida (sin, cos, exp, log, sqrt), no insertar *
      const knownFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'exp', 'log', 'ln', 'sqrt', 'abs'];
      if (knownFunctions.includes(p1.toLowerCase())) {
        return `${p1}(`;
      }
      return `${p1}*(`;
    });

    return expr;
  }

  /**
   * Procesa y valida una expresión matemática de forma asíncrona (non-blocking microtask)
   * para permitir debounce sin bloquear la UI ni la escritura.
   */
  static async parseAsync(
    expression: string
  ): Promise<{ isValid: boolean; normalized: string; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const normalized = this.normalizeExpression(expression);
          if (!normalized) {
            resolve({ isValid: false, normalized: '', error: 'La expresión está vacía.' });
            return;
          }

          const parsed = math.parse(normalized);
          // Verificar compilabilidad
          parsed.compile();

          resolve({ isValid: true, normalized });
        } catch (err: any) {
          resolve({
            isValid: false,
            normalized: expression,
            error: err.message || 'Error de sintaxis en la expresión matemática.',
          });
        }
      }, 0);
    });
  }

  /**
   * Evalúa una expresión matemática dada con un conjunto de variables.
   */
  static evaluate(expression: string, variables: Record<string, number>): number {
    try {
      const normalized = this.normalizeExpression(expression);
      const parsed = math.parse(normalized);
      const compiled = parsed.compile();
      const result = compiled.evaluate(variables);

      if (typeof result !== 'number') {
        if (result && typeof result === 'object' && 'toNumber' in result) {
          const num = (result as any).toNumber();
          if (typeof num === 'number' && !isNaN(num) && isFinite(num)) {
            return num;
          }
        }
        throw new Error('El resultado de la evaluación no es un número real.');
      }

      if (isNaN(result) || !isFinite(result)) {
        throw new Error('El resultado de la evaluación es indeterminado o infinito.');
      }

      return result;
    } catch (error: any) {
      throw new Error(`Error al evaluar la expresión "${expression}": ${error.message}`);
    }
  }

  /**
   * Obtiene la derivada simbólica de una expresión con respecto a una variable.
   */
  static derivative(expression: string, variable: string = 'x'): string {
    try {
      const normalized = this.normalizeExpression(expression);
      const derived = math.derivative(normalized, variable);
      return derived.toString();
    } catch (error: any) {
      throw new Error(`Error al calcular la derivada simbólica de "${expression}": ${error.message}`);
    }
  }

  /**
   * Realiza validación semántica algorítmica previa a la ejecución para prevenir
   * divisiones por cero, intervalos inválidos o estancamientos.
   */
  static validateSemantic(
    expression: string,
    methodId: string,
    params: {
      a?: number;
      b?: number;
      x0?: number;
      x1?: number;
      gExpression?: string;
    } = {}
  ): SemanticValidationResult {
    const expr = this.normalizeExpression(expression);

    if (!expr) {
      return {
        isValid: false,
        severity: 'error',
        message: 'No se ingresó ninguna función para analizar.',
      };
    }

    try {
      // 1. Validar sintaxis general de la expresión
      math.parse(expr).compile();
    } catch (err: any) {
      return {
        isValid: false,
        severity: 'error',
        message: `Sintaxis no válida: ${err.message}`,
      };
    }

    // 2. Validación semántica específica por método numérico
    switch (methodId) {
      case 'newton': {
        const x0 = params.x0 ?? 0;
        try {
          const dfStr = this.derivative(expr, 'x');
          const dfx0 = this.evaluate(dfStr, { x: x0 });

          if (Math.abs(dfx0) < 1e-12) {
            return {
              isValid: false,
              severity: 'error',
              message: `Detección Preventiva: La derivada f'(${x0}) es prácticamente 0 (${dfx0}). Newton-Raphson fallará por división por cero en la primera iteración.`,
              suggestion: 'Cambia el valor inicial x0 a un punto donde f\'(x) ≠ 0.',
              details: { dfx0, x0 },
            };
          }
        } catch (err: any) {
          return {
            isValid: true,
            severity: 'warning',
            message: `No se pudo precambiar f'(${x0}): ${err.message}. El método intentará evaluar derivación numérica.`,
          };
        }
        break;
      }

      case 'bisection':
      case 'false-position': {
        const a = params.a;
        const b = params.b;
        if (a !== undefined && b !== undefined) {
          if (a >= b) {
            return {
              isValid: false,
              severity: 'error',
              message: `Límite inferior a (${a}) debe ser estrictamente menor que b (${b}).`,
              suggestion: 'Asegúrate de que a < b.',
            };
          }

          try {
            const fa = this.evaluate(expr, { x: a });
            const fb = this.evaluate(expr, { x: b });

            if (fa * fb > 0) {
              return {
                isValid: false,
                severity: 'warning',
                message: `Violación del Teorema de Bolzano: f(${a}) = ${fa.toFixed(4)} y f(${b}) = ${fb.toFixed(4)} tienen el mismo signo (f(a)·f(b) > 0). No se garantiza la existencia de una raíz en este intervalo.`,
                suggestion: 'Selecciona un intervalo [a, b] donde la función cambie de signo.',
                details: { fa, fb, product: fa * fb },
              };
            }
          } catch (err: any) {
            return {
              isValid: false,
              severity: 'error',
              message: `Error al pre-evaluar f(a) o f(b): ${err.message}`,
            };
          }
        }
        break;
      }

      case 'secant': {
        const x0 = params.x0 ?? 0;
        const x1 = params.x1 ?? 1;
        try {
          const fx0 = this.evaluate(expr, { x: x0 });
          const fx1 = this.evaluate(expr, { x: x1 });

          if (Math.abs(fx1 - fx0) < 1e-14) {
            return {
              isValid: false,
              severity: 'error',
              message: `f(${x0}) y f(${x1}) producen valores idénticos (${fx0}). La Secante sufrirá división por cero en el denominador (f(x1) - f(x0) = 0).`,
              suggestion: 'Elige dos semillas iniciales x0 y x1 con valores f(x) distintos.',
              details: { fx0, fx1 },
            };
          }
        } catch (err: any) {
          return {
            isValid: false,
            severity: 'error',
            message: `Error evaluando f(x0) o f(x1) para Secante: ${err.message}`,
          };
        }
        break;
      }

      case 'fixed-point': {
        const gExpr = params.gExpression || expr;
        const x0 = params.x0 ?? 0;
        try {
          const dgStr = this.derivative(gExpr, 'x');
          const dgx0 = this.evaluate(dgStr, { x: x0 });

          if (Math.abs(dgx0) >= 1) {
            return {
              isValid: true,
              severity: 'warning',
              message: `Advertencia de Divergencia: |g'(${x0})| = ${Math.abs(dgx0).toFixed(4)} >= 1. El Criterio de Punto Fijo indica posible divergencia.`,
              suggestion: 'Reformula g(x) tal que |g\'(x)| < 1 en el entorno de la raíz.',
              details: { dgx0 },
            };
          }
        } catch {
          // Ignorar si no se puede evaluar g'(x)
        }
        break;
      }
    }

    return {
      isValid: true,
      severity: 'info',
      message: 'Validación semántica algorítmica exitosa.',
    };
  }
}
