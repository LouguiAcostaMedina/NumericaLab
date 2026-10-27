import { describe, it, expect } from 'vitest';
import {
  trapecio_compuesto,
  compositeTrapezoid,
  calculateTrapezoidIntegration,
  DOCENTE_CASE_EXACT_REFERENCE,
  DOCENTE_CASE_PRESET,
} from '../trapezoid';

describe('Integración Numérica - Regla del Trapecio (Sesión 12)', () => {
  describe('Función reutilizable trapecio_compuesto y alias', () => {
    it('debe calcular la regla del trapecio simple para n = 1', () => {
      // f(t) = t^2 en [0, 2].
      // T_1 = ((2 - 0)/2) * [0^2 + 2^2] = 1 * [0 + 4] = 4
      const result = trapecio_compuesto((t) => t * t, 0, 2, 1);
      expect(result).toBeCloseTo(4, 8);

      // Alias compositeTrapezoid debe devolver el mismo valor
      const aliasResult = compositeTrapezoid((t) => t * t, 0, 2, 1);
      expect(aliasResult).toBe(result);
    });

    it('debe integrar exactamente polinomios de grado <= 1', () => {
      // Función constante f(t) = 5 en [0, 10] -> Integral = 50
      const constantResult = trapecio_compuesto('5', 0, 10, 4, 't');
      expect(constantResult).toBeCloseTo(50, 8);

      // Función lineal f(t) = 2*t + 3 en [1, 5] -> Integral = [t^2 + 3t]_1^5 = (25 + 15) - (1 + 3) = 36
      const linearResult = trapecio_compuesto((t) => 2 * t + 3, 1, 5, 2);
      expect(linearResult).toBeCloseTo(36, 8);
    });

    it('debe rechazar n menor a 1 o no entero', () => {
      expect(() => trapecio_compuesto((t) => t, 0, 1, 0)).toThrow(
        /entero positivo/
      );
      expect(() => trapecio_compuesto((t) => t, 0, 1, -2)).toThrow(
        /entero positivo/
      );
      expect(() => trapecio_compuesto((t) => t, 0, 1, 2.5)).toThrow(
        /entero positivo/
      );
    });

    it('debe rechazar n mayor al límite seguro de 100,000', () => {
      expect(() => trapecio_compuesto((t) => t, 0, 1, 200000)).toThrow(
        /excede el límite máximo permitido/
      );
    });

    it('debe rechazar límites no finitos o intervalo invertido', () => {
      expect(() => trapecio_compuesto((t) => t, NaN, 1, 4)).toThrow(
        /valores numéricos finitos/
      );
      expect(() => trapecio_compuesto((t) => t, 5, 2, 4)).toThrow(
        /menor que el límite superior/
      );
      expect(() => trapecio_compuesto((t) => t, 3, 3, 4)).toThrow(
        /menor que el límite superior/
      );
    });

    it('debe rechazar funciones que generen indeterminación o valores no finitos en los nodos', () => {
      // f(t) = 1/t en [0, 1] presenta división por cero en t0 = 0
      expect(() => trapecio_compuesto((t) => 1 / t, 0, 1, 4)).toThrow(
        /no finito/
      );
    });
  });

  describe('Caso Obligatorio del Docente: Transmisión de Datos R(t)', () => {
    // R(t) = 10 + 5*sen(pi*t/4) + e^(0.15t)
    // a = 0, b = 12, n = 4
    // R en Mbps, integral en Mb.
    const fTeacher = (t: number) =>
      10 + 5 * Math.sin((Math.PI * t) / 4) + Math.exp(0.15 * t);

    it('debe calcular exactamente los valores de los 5 nodos para n = 4', () => {
      const resp = calculateTrapezoidIntegration({
        expression: '10 + 5*sin(pi*t/4) + exp(0.15*t)',
        a: 0,
        b: 12,
        n: 4,
        variableName: 't',
        exactValue: DOCENTE_CASE_EXACT_REFERENCE,
        units: { rateUnit: 'Mbps', integralUnit: 'Mb', variableUnit: 's' },
      });

      expect(resp.success).toBe(true);
      expect(resp.h).toBe(3);
      expect(resp.nodes.length).toBe(5);

      // t0 = 0 -> R(0) = 11
      expect(resp.nodes[0].t).toBe(0);
      expect(resp.nodes[0].ft).toBeCloseTo(11, 6);
      expect(resp.nodes[0].weight).toBe(0.5);

      // t1 = 3 -> R(3) = 10 + 5*sqrt(2)/2 + e^0.45 ≈ 15.103846
      expect(resp.nodes[1].t).toBe(3);
      expect(resp.nodes[1].ft).toBeCloseTo(15.103846091423, 6);
      expect(resp.nodes[1].weight).toBe(1.0);

      // t2 = 6 -> R(6) = 10 - 5 + e^0.9 ≈ 7.459603
      expect(resp.nodes[2].t).toBe(6);
      expect(resp.nodes[2].ft).toBeCloseTo(7.459603111157, 6);
      expect(resp.nodes[2].weight).toBe(1.0);

      // t3 = 9 -> R(9) = 10 + 5*sqrt(2)/2 + e^1.35 ≈ 17.392959
      expect(resp.nodes[3].t).toBe(9);
      expect(resp.nodes[3].ft).toBeCloseTo(17.39295943663, 6);
      expect(resp.nodes[3].weight).toBe(1.0);

      // t4 = 12 -> R(12) = 10 + e^1.8 ≈ 16.049647
      expect(resp.nodes[4].t).toBe(12);
      expect(resp.nodes[4].ft).toBeCloseTo(16.049647464413, 6);
      expect(resp.nodes[4].weight).toBe(0.5);
    });

    it('debe coincidir con la referencia calculada independientemente para n = 4', () => {
      // Referencia docente: T_4 ≈ 160.443697114248; error ≈ 5.953014762523; 3.577603604891 %
      const T4 = trapecio_compuesto(fTeacher, 0, 12, 4);
      expect(T4).toBeCloseTo(160.443697114248, 6);

      const exactD = DOCENTE_CASE_EXACT_REFERENCE; // ≈ 166.396711876771
      expect(exactD).toBeCloseTo(166.396711876771, 6);

      const absError = Math.abs(exactD - T4);
      expect(absError).toBeCloseTo(5.953014762523, 6);

      const pctError = (100 * absError) / exactD;
      expect(pctError).toBeCloseTo(3.577603604891, 6);
    });

    it('debe soportar la expresión tipográfica con sen, π, e^(0,15t) y ·', () => {
      // Probar que el MathParser normaliza correctamente la notación del docente
      const result = trapecio_compuesto(
        '10 + 5·sen(πt/4) + e^(0,15t)',
        0,
        12,
        4,
        't'
      );
      expect(result).toBeCloseTo(160.443697114248, 6);
    });
  });

  describe('Tabla de Análisis de Convergencia (n = 4, 10, 50, 100, 1000)', () => {
    const expr = '10 + 5*sin(pi*t/4) + exp(0.15*t)';
    const exactD = DOCENTE_CASE_EXACT_REFERENCE;

    it('n = 10: T_10 ≈ 165.530824072070, error ≈ 0.865887804702, 0.520375550055 %', () => {
      const T10 = trapecio_compuesto(expr, 0, 12, 10, 't');
      expect(T10).toBeCloseTo(165.53082407207, 6);

      const errorAbs = Math.abs(exactD - T10);
      expect(errorAbs).toBeCloseTo(0.865887804702, 6);

      const errorPct = (100 * errorAbs) / exactD;
      expect(errorPct).toBeCloseTo(0.520375550055, 6);
    });

    it('n = 50: T_50 ≈ 166.362626089151, error ≈ 0.034085787620, 0.020484652152 %', () => {
      const T50 = trapecio_compuesto(expr, 0, 12, 50, 't');
      expect(T50).toBeCloseTo(166.362626089151, 6);

      const errorAbs = Math.abs(exactD - T50);
      expect(errorAbs).toBeCloseTo(0.03408578762, 6);

      const errorPct = (100 * errorAbs) / exactD;
      expect(errorPct).toBeCloseTo(0.020484652152, 6);
    });

    it('n = 100: T_100 ≈ 166.388194634868, error ≈ 0.008517241903, 0.005118635944 %', () => {
      const T100 = trapecio_compuesto(expr, 0, 12, 100, 't');
      expect(T100).toBeCloseTo(166.388194634868, 6);

      const errorAbs = Math.abs(exactD - T100);
      expect(errorAbs).toBeCloseTo(0.008517241903, 6);

      const errorPct = (100 * errorAbs) / exactD;
      expect(errorPct).toBeCloseTo(0.005118635944, 6);
    });

    it('n = 1000: T_1000 ≈ 166.396626718217, error ≈ 0.000085158554, 0.000051178027 %', () => {
      const T1000 = trapecio_compuesto(expr, 0, 12, 1000, 't');
      expect(T1000).toBeCloseTo(166.396626718217, 6);

      const errorAbs = Math.abs(exactD - T1000);
      expect(errorAbs).toBeCloseTo(0.000085158554, 6);

      const errorPct = (100 * errorAbs) / exactD;
      expect(errorPct).toBeCloseTo(0.000051178027, 6);
    });

    it('calculateTrapezoidIntegration debe incluir la tabla completa de convergencia', () => {
      const response = calculateTrapezoidIntegration({
        expression: DOCENTE_CASE_PRESET.expression,
        a: DOCENTE_CASE_PRESET.a,
        b: DOCENTE_CASE_PRESET.b,
        n: DOCENTE_CASE_PRESET.n,
        variableName: 't',
        exactValue: DOCENTE_CASE_PRESET.exactValue,
        exactExpressionDescription: DOCENTE_CASE_PRESET.exactExpressionDescription,
        isTheoreticalExact: true,
        convergenceNValues: [4, 10, 50, 100, 1000],
      });

      expect(response.success).toBe(true);
      expect(response.convergenceTable).toBeDefined();
      expect(response.convergenceTable?.length).toBe(5);

      const [r4, r10, r50, r100, r1000] = response.convergenceTable!;

      expect(r4.n).toBe(4);
      expect(r4.Tn).toBeCloseTo(160.443697, 4);

      expect(r10.n).toBe(10);
      expect(r10.Tn).toBeCloseTo(165.530824, 4);

      expect(r50.n).toBe(50);
      expect(r50.Tn).toBeCloseTo(166.362626, 4);

      expect(r100.n).toBe(100);
      expect(r100.Tn).toBeCloseTo(166.388195, 4);

      expect(r1000.n).toBe(1000);
      expect(r1000.Tn).toBeCloseTo(166.396627, 4);
    });
  });

  describe('Pasos pedagógicos y arquitectura manualProcedure', () => {
    it('debe generar los 5 pasos manuales en formato KaTeX', () => {
      const response = calculateTrapezoidIntegration({
        expression: '10 + 5*sin(pi*t/4) + exp(0.15*t)',
        a: 0,
        b: 12,
        n: 4,
        variableName: 't',
        exactValue: DOCENTE_CASE_EXACT_REFERENCE,
      });

      expect(response.manualProcedure).toBeDefined();
      expect(response.manualProcedure?.length).toBe(5);

      // Verificar tipos y contenido de pasos
      expect(response.manualProcedure?.[0].id).toBe('step-interval-setup');
      expect(response.manualProcedure?.[1].id).toBe('step-node-evaluation');
      expect(response.manualProcedure?.[2].id).toBe('step-general-formula');
      expect(response.manualProcedure?.[3].id).toBe('step-numerical-substitution');
      expect(response.manualProcedure?.[4].id).toBe('step-final-result');

      // Paso 3 debe mencionar Newton-Cotes orden 1
      expect(response.manualProcedure?.[2].description).toContain('Newton-Cotes');
    });
  });
});
