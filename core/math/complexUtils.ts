import * as math from 'mathjs';
import { ComplexNumber } from '../domain/types';
import { PrecisionUtils } from './precisionUtils';

/**
 * Utilitarios de álgebra compleja para el algoritmo de Müller y Horner.
 */
export class ComplexUtils {
  /**
   * Convierte un número (real o math.Complex o ComplexNumber) a ComplexNumber plano.
   */
  static toComplex(val: number | math.Complex | ComplexNumber): ComplexNumber {
    if (typeof val === 'number') {
      return { re: val, im: 0 };
    }
    if ('re' in val && 'im' in val) {
      return { re: val.re, im: val.im };
    }
    const c = val as any;
    return { re: c.re ?? 0, im: c.im ?? 0 };
  }

  /**
   * Convierte un ComplexNumber a math.Complex de mathjs.
   */
  static toMathComplex(c: ComplexNumber | number): math.Complex {
    if (typeof c === 'number') {
      return math.complex(c, 0);
    }
    return math.complex(c.re, c.im);
  }

  /**
   * Suma: z1 + z2
   */
  static add(a: ComplexNumber | number, b: ComplexNumber | number): ComplexNumber {
    const res = math.add(this.toMathComplex(a), this.toMathComplex(b)) as math.Complex;
    return { re: res.re, im: res.im };
  }

  /**
   * Resta: z1 - z2
   */
  static sub(a: ComplexNumber | number, b: ComplexNumber | number): ComplexNumber {
    const res = math.subtract(this.toMathComplex(a), this.toMathComplex(b)) as math.Complex;
    return { re: res.re, im: res.im };
  }

  /**
   * Multiplicación: z1 * z2
   */
  static mul(a: ComplexNumber | number, b: ComplexNumber | number): ComplexNumber {
    const res = math.multiply(this.toMathComplex(a), this.toMathComplex(b)) as math.Complex;
    return { re: res.re, im: res.im };
  }

  /**
   * División: z1 / z2
   */
  static div(a: ComplexNumber | number, b: ComplexNumber | number): ComplexNumber {
    const res = math.divide(this.toMathComplex(a), this.toMathComplex(b)) as math.Complex;
    return { re: res.re, im: res.im };
  }

  /**
   * Raíz cuadrada: sqrt(z)
   */
  static sqrt(a: ComplexNumber | number): ComplexNumber {
    const res = math.sqrt(this.toMathComplex(a)) as math.Complex;
    return { re: res.re, im: res.im };
  }

  /**
   * Módulo: |z|
   */
  static abs(a: ComplexNumber | number): number {
    return Math.hypot(typeof a === 'number' ? a : a.re, typeof a === 'number' ? 0 : a.im);
  }

  /**
   * Formatea un número complejo a string con la precisión decimal exacta solicitada (ej: "2.500000 + 3.100000i").
   */
  static format(c: ComplexNumber | number, precision: number = 6): string {
    const comp = this.toComplex(c);
    return PrecisionUtils.formatComplex(comp, precision);
  }
}
