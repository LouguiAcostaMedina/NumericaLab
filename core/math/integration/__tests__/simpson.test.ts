import { describe, it, expect } from 'vitest';
import {
  simpson13_compuesto,
  simpson13Compuesto,
  compositeSimpson13,
  simpson38_simple,
  simpson38_compuesto,
  simpson38Compuesto,
  compositeSimpson38,
  integrateTabularPoints,
  calculateSimpsonIntegration,
  calculateSimpsonErrorBound,
  SIMPSON13_AUTONOMOUS_EXACT_REFERENCE,
  SIMPSON13_AUTONOMOUS_PRESET,
  SIMPSON38_TABULAR_PRESET,
  PRACTICE_PRESETS,
} from '../simpson';
import { trapecio_compuesto } from '../trapezoid';

describe('Integración Numérica - Regla de Simpson 1/3 y Simpson 3/8 (Sesión 13)', () => {
  describe('Simpson 1/3 Compuesto: Función pura, validaciones y precisión polinomial', () => {
    it('debe calcular la regla simple para n = 2 en f(x) = x^2 en [0, 2]', () => {
      // Integral analítica: [x^3/3]_0^2 = 8/3 ≈ 2.66666667
      // Simpson 1/3 con n=2: h = 1.
      // S_2 = (1/3) * [0^2 + 4*(1^2) + 2^2] = (1/3)*[0 + 4 + 4] = 8/3
      const result = simpson13_compuesto((x) => x * x, 0, 2, 2);
      expect(result).toBeCloseTo(8 / 3, 10);

      // Alias
      expect(simpson13Compuesto((x) => x * x, 0, 2, 2)).toBe(result);
      expect(compositeSimpson13((x) => x * x, 0, 2, 2)).toBe(result);
    });

    it('debe integrar exactamente polinomios de grado <= 3 (precisión de orden 3)', () => {
      // f(x) = x^3 en [0, 2] -> Integral = [x^4/4]_0^2 = 4
      const cubicResult = simpson13_compuesto((x) => Math.pow(x, 3), 0, 2, 2);
      expect(cubicResult).toBeCloseTo(4.0, 10);

      // f(x) = 4*x^3 - 6*x^2 + 5*x - 3 en [1, 3]
      // Primitiva: x^4 - 2x^3 + 2.5x^2 - 3x
      // F(3) = 81 - 54 + 22.5 - 9 = 40.5
      // F(1) = 1 - 2 + 2.5 - 3 = -1.5
      // Integral = 40.5 - (-1.5) = 42
      const poly = (x: number) => 4 * Math.pow(x, 3) - 6 * Math.pow(x, 2) + 5 * x - 3;
      const polyResult = simpson13_compuesto(poly, 1, 3, 4);
      expect(polyResult).toBeCloseTo(42.0, 9);
    });

    it('debe lanzar excepción clara cuando n es impar', () => {
      expect(() => simpson13_compuesto((x) => x, 0, 1, 1)).toThrow(/par/i);
      expect(() => simpson13_compuesto((x) => x, 0, 1, 3)).toThrow(/par/i);
      expect(() => simpson13_compuesto((x) => x, 0, 1, 5)).toThrow(/par/i);
    });

    it('debe rechazar n menor a 2 o no entero', () => {
      expect(() => simpson13_compuesto((x) => x, 0, 1, 0)).toThrow(/entero positivo/i);
      expect(() => simpson13_compuesto((x) => x, 0, 1, -4)).toThrow(/entero positivo/i);
      expect(() => simpson13_compuesto((x) => x, 0, 1, 2.4)).toThrow(/entero positivo/i);
    });

    it('debe rechazar límites invertidos o no finitos', () => {
      expect(() => simpson13_compuesto((x) => x, 2, 1, 4)).toThrow(/menor que el límite superior/i);
      expect(() => simpson13_compuesto((x) => x, NaN, 1, 4)).toThrow(/finitos/i);
    });
  });

  describe('Actividad Autónoma Obligatoria: Potencia Eléctrica P(t) (Sesión 13)', () => {
    // P(t) = 10 + 5t·sen(πt/6) + e^(0,2t) en [0, 6] horas
    const fPower = (t: number) =>
      10 + 5 * t * Math.sin((Math.PI * t) / 6) + Math.exp(0.2 * t);

    it('debe evaluar correctamente los nodos individuales para n = 6 con h = 1', () => {
      const resp = calculateSimpsonIntegration({
        methodType: 'simpson13',
        expression: '10 + 5*t*sin(pi*t/6) + exp(0.2*t)',
        a: 0,
        b: 6,
        n: 6,
        variableName: 't',
        units: { rateUnit: 'kW', integralUnit: 'kWh', variableUnit: 'h' },
        exactValue: SIMPSON13_AUTONOMOUS_EXACT_REFERENCE,
        mFicha: 0.45,
        mValid: 5.131103802,
      });

      expect(resp.success).toBe(true);
      expect(resp.h).toBe(1);
      expect(resp.nodes.length).toBe(7);

      // t0 = 0 -> P(0) = 10 + 0 + 1 = 11. Coef = 1
      expect(resp.nodes[0].t).toBe(0);
      expect(resp.nodes[0].ft).toBeCloseTo(11.0, 6);
      expect(resp.nodes[0].coefficient).toBe(1);

      // t1 = 1 -> P(1) = 10 + 5*(0.5) + e^0.2 ≈ 13.721402758. Coef = 4
      expect(resp.nodes[1].t).toBe(1);
      expect(resp.nodes[1].ft).toBeCloseTo(13.72140275816, 6);
      expect(resp.nodes[1].coefficient).toBe(4);

      // t2 = 2 -> P(2) = 10 + 10*(sqrt(3)/2) + e^0.4 ≈ 20.152078735. Coef = 2
      expect(resp.nodes[2].t).toBe(2);
      expect(resp.nodes[2].ft).toBeCloseTo(20.15207873549, 6);
      expect(resp.nodes[2].coefficient).toBe(2);

      // t3 = 3 -> P(3) = 10 + 15*(1) + e^0.6 ≈ 26.822118800. Coef = 4
      expect(resp.nodes[3].t).toBe(3);
      expect(resp.nodes[3].ft).toBeCloseTo(26.82211880039, 6);
      expect(resp.nodes[3].coefficient).toBe(4);

      // t4 = 4 -> P(4) = 10 + 20*(sqrt(3)/2) + e^0.8 ≈ 29.546048929. Coef = 2
      expect(resp.nodes[4].t).toBe(4);
      expect(resp.nodes[4].ft).toBeCloseTo(29.54604892918, 6);
      expect(resp.nodes[4].coefficient).toBe(2);

      // t5 = 5 -> P(5) = 10 + 25*(0.5) + e^1.0 ≈ 25.218281828. Coef = 4
      expect(resp.nodes[5].t).toBe(5);
      expect(resp.nodes[5].ft).toBeCloseTo(25.21828182846, 6);
      expect(resp.nodes[5].coefficient).toBe(4);

      // t6 = 6 -> P(6) = 10 + 30*(0) + e^1.2 ≈ 13.320116923. Coef = 1
      expect(resp.nodes[6].t).toBe(6);
      expect(resp.nodes[6].ft).toBeCloseTo(13.32011692274, 6);
      expect(resp.nodes[6].coefficient).toBe(1);
    });

    it('debe coincidir con las referencias numéricas independientes de la actividad', () => {
      // Referencia analítica exacta: E = 60 + 180/pi + 5(e^1.2 - 1) ≈ 128.896364126765 kWh
      const exact = SIMPSON13_AUTONOMOUS_EXACT_REFERENCE;
      expect(exact).toBeCloseTo(128.896364126765, 9);

      // n = 2: S ≈ 131.608592124299 kWh
      const s2 = simpson13_compuesto(fPower, 0, 6, 2);
      expect(s2).toBeCloseTo(131.608592124299, 9);

      // n = 4: S ≈ 129.027507970418 kWh
      const s4 = simpson13_compuesto(fPower, 0, 6, 4);
      expect(s4).toBeCloseTo(129.027507970418, 9);

      // n = 6: S ≈ 128.921195316703 kWh
      const s6 = simpson13_compuesto(fPower, 0, 6, 6);
      expect(s6).toBeCloseTo(128.921195316703, 9);

      // n = 12: S ≈ 128.897878140195 kWh
      const s12 = simpson13_compuesto(fPower, 0, 6, 12);
      expect(s12).toBeCloseTo(128.897878140195, 9);

      // n = 24: S ≈ 128.896458175876 kWh
      const s24 = simpson13_compuesto(fPower, 0, 6, 24);
      expect(s24).toBeCloseTo(128.896458175876, 9);
    });

    it('debe verificar la cota de la ficha M=0.45 y la cota válida M=5.131103802 para n=6', () => {
      const bMinusA = 6;
      const h = 1;
      const exact = SIMPSON13_AUTONOMOUS_EXACT_REFERENCE;
      const s6 = simpson13_compuesto(fPower, 0, 6, 6);
      const realError = Math.abs(exact - s6); // ≈ 0.024831189938

      expect(realError).toBeCloseTo(0.02483119, 7);

      // Cota con dato de la ficha M = 0.45: (6 * 1^4 * 0.45) / 180 = 0.015 kWh
      const boundFicha = calculateSimpsonErrorBound(bMinusA, h, 0.45, 'simpson13');
      expect(boundFicha).toBeCloseTo(0.015, 6);

      // Demostración crítica: el error real es mayor que la cota de la ficha (0.024831 > 0.015)
      expect(realError).toBeGreaterThan(boundFicha);

      // Cota con M válido = 5.131103802: (6 * 1^4 * 5.131103802) / 180 ≈ 0.171036793 kWh
      const boundValid = calculateSimpsonErrorBound(bMinusA, h, 5.131103802, 'simpson13');
      expect(boundValid).toBeCloseTo(0.171036793, 7);

      // La cota válida sí garantiza matemáticamente el error (0.171036793 > 0.024831)
      expect(boundValid).toBeGreaterThan(realError);
    });

    it('debe soportar la sintaxis con sen, π, e^(0,2t) y ·', () => {
      const result = simpson13_compuesto(
        '10 + 5t·sen(πt/6) + e^(0,2t)',
        0,
        6,
        6,
        't'
      );
      expect(result).toBeCloseTo(128.921195316703, 9);
    });
  });

  describe('Simpson 3/8: Simple, Compuesto y Datos Tabulados (Sesión 13)', () => {
    it('debe calcular Simpson 3/8 simple con n = 3 para f(x) = x^3 en [0, 3] y verificar aliases', () => {
      // Integral analítica: [x^4/4]_0^3 = 81/4 = 20.25
      const s38 = simpson38_simple((x) => Math.pow(x, 3), 0, 3);
      expect(s38).toBeCloseTo(20.25, 10);

      // Aliases
      expect(simpson38Compuesto((x) => Math.pow(x, 3), 0, 3, 3)).toBe(s38);
      expect(compositeSimpson38((x) => Math.pow(x, 3), 0, 3, 3)).toBe(s38);
    });

    it('debe exigir que n sea múltiplo de 3 en Simpson 3/8 compuesto', () => {
      expect(() => simpson38_compuesto((x) => x, 0, 1, 2)).toThrow(/múltiplo.*3/i);
      expect(() => simpson38_compuesto((x) => x, 0, 1, 4)).toThrow(/múltiplo.*3/i);
      expect(() => simpson38_compuesto((x) => x, 0, 1, 5)).toThrow(/múltiplo.*3/i);
      expect(() => simpson38_compuesto((x) => x, 0, 1, 7)).toThrow(/múltiplo.*3/i);

      // n = 3, 6, 9 deben ser aceptados
      expect(() => simpson38_compuesto((x) => x, 0, 1, 3)).not.toThrow();
      expect(() => simpson38_compuesto((x) => x, 0, 1, 6)).not.toThrow();
      expect(() => simpson38_compuesto((x) => x, 0, 1, 9)).not.toThrow();
    });

    it('debe resolver el caso de datos tabulados de la guía teórica: Área = 78.9375 m²', () => {
      // x (m) = [0, 5, 10, 15, 20, 25, 30]
      // f(x) (m) = [2.1, 2.4, 2.9, 3.0, 2.8, 2.5, 2.2]
      // n = 6, h = 5 m.
      // S_3/8 = (3*5/8) * [ 2.1 + 3*(2.4 + 2.9) + 2*(3.0) + 3*(2.8 + 2.5) + 2.2 ]
      // = (15/8) * [ 2.1 + 15.9 + 6.0 + 15.9 + 2.2 ] = (1.875) * 42.1 = 78.9375 m²
      const points = SIMPSON38_TABULAR_PRESET.points;
      const res = integrateTabularPoints(points, 'simpson38');

      expect(res.n).toBe(6);
      expect(res.h).toBe(5);
      expect(res.result).toBeCloseTo(78.9375, 8);
    });

    it('debe rechazar datos tabulados si los nodos no están equiespaciados', () => {
      const nonEquispaced = [
        { x: 0, y: 1 },
        { x: 2, y: 2 },
        { x: 5, y: 3 }, // salto de 3 en lugar de 2
        { x: 7, y: 4 },
      ];
      expect(() => integrateTabularPoints(nonEquispaced, 'simpson38')).toThrow(
        /equiespaciados/i
      );
    });
  });

  describe('Paso 4: Verificación de Ejemplos de Práctica y Teoría (Trapecio y Simpson)', () => {
    it('Trapecio: debe resolver integral de 3 a 3.6 de (1/x) dx con n=1 ≈ 0.1833333333', () => {
      const res = trapecio_compuesto('1/x', 3, 3.6, 1, 'x');
      expect(res).toBeCloseTo(0.1833333333, 8);
    });

    it('Trapecio: debe resolver integral de 0 a 1 de e^x dx con n=1 ≈ 1.8591409142', () => {
      const res = trapecio_compuesto('exp(x)', 0, 1, 1, 'x');
      expect(res).toBeCloseTo(1.8591409142, 8);
    });

    it('Trapecio: debe resolver integral de 0 a 4 de 1/√(1+x²) con n=1, 2, 8', () => {
      const expr = '1/sqrt(1 + x^2)';
      const t1 = trapecio_compuesto(expr, 0, 4, 1, 'x');
      expect(t1).toBeCloseTo(2.4850712501, 8);

      const t2 = trapecio_compuesto(expr, 0, 4, 2, 'x');
      expect(t2).toBeCloseTo(2.1369628160, 8);

      const t8 = trapecio_compuesto(expr, 0, 4, 8, 'x');
      expect(t8).toBeCloseTo(2.0935275733, 8);
    });

    it('Simpson 1/3: debe resolver 1/sqrt(1+x^2) en [0, 4] con n=8 con alta convergencia', () => {
      const s8 = simpson13_compuesto('1/sqrt(1 + x^2)', 0, 4, 8, 'x');
      const exact = Math.asinh(4); // ln(4 + sqrt(17)) ≈ 2.09471254726
      expect(s8).toBeCloseTo(exact, 2);
      expect(s8).toBeCloseTo(2.0940981127, 8);
    });

    it('debe evaluar correctamente expresiones con símbolos tipográficos √ y ²', () => {
      const res = simpson13_compuesto('1/√(1+x²)', 0, 4, 8, 'x');
      expect(res).toBeCloseTo(2.0940981127, 8);
    });

    it('debe exponer configuraciones válidas en los presets predefinidos', () => {
      expect(SIMPSON13_AUTONOMOUS_PRESET.n).toBe(6);
      expect(SIMPSON13_AUTONOMOUS_PRESET.a).toBe(0);
      expect(SIMPSON13_AUTONOMOUS_PRESET.b).toBe(6);
      expect(PRACTICE_PRESETS.invX.a).toBe(3);
      expect(PRACTICE_PRESETS.expX.b).toBe(1);
      expect(PRACTICE_PRESETS.sqrtRational.n).toBe(8);
    });
  });
});
