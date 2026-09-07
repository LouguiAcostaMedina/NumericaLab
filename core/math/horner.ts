import { ComplexNumber } from '../domain/types';
import { ComplexUtils } from './complexUtils';

/**
 * Evaluación de polinomios y división sintética (deflación) utilizando el Esquema de Horner.
 */
export class HornerScheme {
  /**
   * Evalúa el polinomio P(z) en el punto z usando el esquema de Horner.
   * Coeficientes ordenados de mayor a menor grado: [a_n, a_{n-1}, ..., a_0].
   * 
   * @param coeffs Coeficientes del polinomio (reales o complejos)
   * @param z Punto de evaluación
   * @returns Resultado P(z) como ComplexNumber
   */
  static evaluate(
    coeffs: (number | ComplexNumber)[],
    z: number | ComplexNumber
  ): ComplexNumber {
    if (coeffs.length === 0) return { re: 0, im: 0 };

    let result: ComplexNumber = ComplexUtils.toComplex(coeffs[0]);
    const zComp = ComplexUtils.toComplex(z);

    for (let i = 1; i < coeffs.length; i++) {
      const c = ComplexUtils.toComplex(coeffs[i]);
      // result = c + z * result
      result = ComplexUtils.add(c, ComplexUtils.mul(zComp, result));
    }

    return result;
  }

  /**
   * Realiza la división sintética del polinomio P(z) entre (z - root).
   * Retorna los coeficientes del polinomio cociente Q(z) de grado (n-1) y el residuo P(root).
   * 
   * @param coeffs Coeficientes del polinomio de grado n [a_n, a_{n-1}, ..., a_0]
   * @param root Valor de la raíz r a deflactar
   * @returns Objeto con los coeficientes del cociente Q(z) de grado n-1 y el residuo
   */
  static deflate(
    coeffs: (number | ComplexNumber)[],
    root: number | ComplexNumber
  ): { quotient: ComplexNumber[]; remainder: ComplexNumber } {
    if (coeffs.length <= 1) {
      return {
        quotient: [],
        remainder: coeffs.length === 1 ? ComplexUtils.toComplex(coeffs[0]) : { re: 0, im: 0 },
      };
    }

    const n = coeffs.length - 1;
    const quotient: ComplexNumber[] = new Array(n);
    const zRoot = ComplexUtils.toComplex(root);

    // b_n = a_n
    let current = ComplexUtils.toComplex(coeffs[0]);
    quotient[0] = current;

    for (let i = 1; i < n; i++) {
      const coeff = ComplexUtils.toComplex(coeffs[i]);
      // b_k = a_k + root * b_{k+1}
      current = ComplexUtils.add(coeff, ComplexUtils.mul(zRoot, current));
      quotient[i] = current;
    }

    // Residuo = a_0 + root * b_1
    const lastCoeff = ComplexUtils.toComplex(coeffs[n]);
    const remainder = ComplexUtils.add(lastCoeff, ComplexUtils.mul(zRoot, current));

    return { quotient, remainder };
  }
}
