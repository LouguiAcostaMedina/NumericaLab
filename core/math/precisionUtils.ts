import { ComplexNumber } from '../domain/types';

/**
 * Utilidades para el control de precisión matemática de 6, 8, 10, 12+ decimales
 * y formateo estandarizado pedagógico.
 */
export class PrecisionUtils {
  /**
   * Redondea un valor numérico a un número exacto de decimales de precisión.
   * Evita problemas de imprecisión en de coma flotante binaria (e.g. 0.1 + 0.2 = 0.30000000000000004).
   */
  static round(val: number, decimals: number = 6): number {
    if (isNaN(val) || !isFinite(val)) return val;
    const factor = Math.pow(10, decimals);
    return Math.round((val + Number.EPSILON) * factor) / factor;
  }

  /**
   * Formatea un número como string con la precisión configurada (mínimo 6 decimales por defecto).
   */
  static format(
    val: number | null | undefined,
    decimals: number = 6,
    useScientificNotation: boolean = false
  ): string {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    if (!isFinite(val)) return val > 0 ? '+Infinity' : '-Infinity';

    const rounded = this.round(val, decimals);

    if (useScientificNotation || (Math.abs(rounded) > 0 && Math.abs(rounded) < Math.pow(10, -decimals + 1))) {
      return rounded.toExponential(decimals);
    }

    return rounded.toFixed(decimals);
  }

  /**
   * Formatea un número complejo rectangular en notación estándar a + bi con la precisión indicada.
   */
  static formatComplex(z: ComplexNumber, decimals: number = 6): string {
    const cleaned = this.cleanComplex(z, decimals);
    const reStr = this.format(cleaned.re, decimals);
    const absIm = Math.abs(cleaned.im);
    const imStr = this.format(absIm, decimals);

    if (absIm === 0) {
      return reStr;
    }

    if (cleaned.re === 0) {
      return cleaned.im < 0 ? `-${imStr}i` : `${imStr}i`;
    }

    const sign = cleaned.im < 0 ? '-' : '+';
    return `${reStr} ${sign} ${imStr}i`;
  }

  /**
   * Elimina partes im/re residuales por debajo del umbral de tolerancia eps.
   */
  static cleanComplex(z: ComplexNumber, decimals: number = 6): ComplexNumber {
    const eps = this.getEpsilon(decimals);
    let re = z.re;
    let im = z.im;

    if (Math.abs(re) < eps) re = 0;
    if (Math.abs(im) < eps) im = 0;

    return {
      re: this.round(re, decimals),
      im: this.round(im, decimals),
    };
  }

  /**
   * Obtiene la tolerancia epsilon correspondiente a los decimales configurados.
   */
  static getEpsilon(decimals: number = 6): number {
    return Math.pow(10, -decimals);
  }
}
