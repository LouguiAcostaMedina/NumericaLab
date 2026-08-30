import * as math from 'mathjs';

/**
 * Clase utilitaria para parsear, evaluar y derivar expresiones matemáticas
 * usando la librería mathjs de manera segura.
 */
export class MathParser {
  /**
   * Evalúa una expresión matemática dada con un conjunto de variables.
   * @param expression Expresión matemática en string (ej: 'x^3 - x - 1')
   * @param variables Objeto con las variables y sus valores (ej: { x: 1.5 })
   * @returns El resultado de la evaluación numérica
   */
  static evaluate(expression: string, variables: Record<string, number>): number {
    try {
      const parsed = math.parse(expression);
      const compiled = parsed.compile();
      const result = compiled.evaluate(variables);
      
      if (typeof result !== 'number') {
        // En caso de que sea un objeto de mathjs (como Fraction, Unit, etc.), intentamos obtener el valor numérico
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
   * @param expression Expresión matemática en string (ej: 'x^3 - x - 1')
   * @param variable Nombre de la variable con respecto a la cual derivar (por defecto 'x')
   * @returns La expresión de la derivada como un string
   */
  static derivative(expression: string, variable: string = 'x'): string {
    try {
      const derived = math.derivative(expression, variable);
      return derived.toString();
    } catch (error: any) {
      throw new Error(`Error al calcular la derivada simbólica de "${expression}": ${error.message}`);
    }
  }
}
