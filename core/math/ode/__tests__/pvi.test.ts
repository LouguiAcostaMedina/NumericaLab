import { describe, it, expect } from 'vitest';
import {
  eulerStep,
  heunStep,
  rk3Step,
  rk4Step,
  evaluateOdeSlope,
  computeErrors,
  solveOdePvi,
  ODE_AUTONOMOUS_PRESET,
  ODE_PRACTICE_PRESETS,
} from '../pvi';

describe('Ecuaciones Diferenciales Ordinarias (EDO - PVI, Sesión 14)', () => {
  describe('Motores puros de un paso (Step Engines)', () => {
    // Función de prueba: f(x, y) = x + y
    const fLinear = (x: number, y: number) => x + y;

    it('Euler: debe calcular y_{i+1} = y_i + h * f(x_i, y_i)', () => {
      // x0 = 0, y0 = 1, h = 0.2
      // f(0, 1) = 1 -> y1 = 1 + 0.2 * 1 = 1.2
      const res = eulerStep(fLinear, 0, 1, 0.2);
      expect(res.slope).toBeCloseTo(1.0, 9);
      expect(res.yNext).toBeCloseTo(1.2, 9);
    });

    it('Heun: debe calcular predictor, pendientes y corrector promediado', () => {
      // x0 = 0, y0 = 1, h = 0.2
      // slopeInitial = 1.0
      // yPredictor = 1 + 0.2 * 1 = 1.2
      // slopePredictor = f(0.2, 1.2) = 1.4
      // slopeAverage = (1 + 1.4) / 2 = 1.2
      // yNext = 1 + 0.2 * 1.2 = 1.24
      const res = heunStep(fLinear, 0, 1, 0.2);
      expect(res.heunDetail.slopeInitial).toBeCloseTo(1.0, 9);
      expect(res.heunDetail.yPredictor).toBeCloseTo(1.2, 9);
      expect(res.heunDetail.slopePredictor).toBeCloseTo(1.4, 9);
      expect(res.heunDetail.slopeAverage).toBeCloseTo(1.2, 9);
      expect(res.yNext).toBeCloseTo(1.24, 9);
    });

    it('RK3: debe calcular k1, k2, k3 con la fórmula exacta de la diapositiva 31', () => {
      // x0 = 0, y0 = 1, h = 0.2
      // k1 = f(0, 1) = 1
      // k2 = f(0 + 0.1, 1 + 0.1*1) = f(0.1, 1.1) = 1.2
      // k3 = f(0 + 0.2, 1 - 0.2*1 + 2*0.2*1.2) = f(0.2, 1 - 0.2 + 0.48) = f(0.2, 1.28) = 1.48
      // weightedSlope = (1 + 4*1.2 + 1.48) / 6 = (1 + 4.8 + 1.48)/6 = 7.28 / 6 = 1.2133333333
      // yNext = 1 + 0.2 * (7.28/6) = 1 + 0.2426666667 = 1.2426666667
      const res = rk3Step(fLinear, 0, 1, 0.2);
      expect(res.rk3Detail.k1).toBeCloseTo(1.0, 9);
      expect(res.rk3Detail.k2).toBeCloseTo(1.2, 9);
      expect(res.rk3Detail.k3).toBeCloseTo(1.48, 9);
      expect(res.rk3Detail.weightedSlope).toBeCloseTo(7.28 / 6, 9);
      expect(res.yNext).toBeCloseTo(1 + 0.2 * (7.28 / 6), 9);
    });

    it('RK4: debe calcular k1, k2, k3, k4 con la fórmula de la diapositiva 33', () => {
      // x0 = 0, y0 = 1, h = 0.2
      // k1 = f(0, 1) = 1
      // k2 = f(0.1, 1 + 0.1*1) = f(0.1, 1.1) = 1.2
      // k3 = f(0.1, 1 + 0.1*1.2) = f(0.1, 1.12) = 1.22
      // k4 = f(0.2, 1 + 0.2*1.22) = f(0.2, 1.244) = 1.444
      // weightedSlope = (1 + 2*1.2 + 2*1.22 + 1.444)/6 = (1 + 2.4 + 2.44 + 1.444)/6 = 7.284/6 = 1.214
      // yNext = 1 + 0.2 * 1.214 = 1.2428
      const res = rk4Step(fLinear, 0, 1, 0.2);
      expect(res.rk4Detail.k1).toBeCloseTo(1.0, 9);
      expect(res.rk4Detail.k2).toBeCloseTo(1.2, 9);
      expect(res.rk4Detail.k3).toBeCloseTo(1.22, 9);
      expect(res.rk4Detail.k4).toBeCloseTo(1.444, 9);
      expect(res.rk4Detail.weightedSlope).toBeCloseTo(1.214, 9);
      expect(res.yNext).toBeCloseTo(1.2428, 9);
    });
  });

  describe('Actividad Autónoma Obligatoria (Sesión 14)', () => {
    // (y² - x²)dx + xy dy = 0, y(1) = 2, x = 1.2, h = 0.1
    // f(x, y) = x/y - y/x
    const expected = ODE_AUTONOMOUS_PRESET.expectedReferenceValues;

    it('debe calcular la solución exacta analítica positiva y(1.2) ≈ 1.774980438076870', () => {
      const resp = solveOdePvi(ODE_AUTONOMOUS_PRESET);
      expect(resp.success).toBe(true);

      const exactAt12 = resp.results.euler?.steps[2].exactValue;
      expect(exactAt12).toBeDefined();
      expect(exactAt12).toBeCloseTo(expected.exact, 9);
    });

    it('Euler: debe calcular los 2 pasos exactos y coincidir con la referencia (1.741277641277641, ~1.89877%)', () => {
      const resp = solveOdePvi(ODE_AUTONOMOUS_PRESET);
      const euler = resp.results.euler;
      expect(euler).toBeDefined();

      // Paso 1: de x=1 a x=1.1
      // f(1, 2) = 1/2 - 2/1 = -1.5
      // y1 = 2 + 0.1 * (-1.5) = 1.85
      const step1 = euler!.steps[0];
      expect(step1.x).toBeCloseTo(1.0, 9);
      expect(step1.y).toBeCloseTo(2.0, 9);
      expect(step1.slope).toBeCloseTo(-1.5, 9);
      expect(step1.yNext).toBeCloseTo(1.85, 9);

      // Paso 2: de x=1.1 a x=1.2
      // f(1.1, 1.85) = 1.1/1.85 - 1.85/1.1 = -885/814 ≈ -1.087223587223587
      // y2 = 1.85 + 0.1 * (-885/814) = 7087/4070 ≈ 1.741277641277641
      const step2 = euler!.steps[1];
      expect(step2.x).toBeCloseTo(1.1, 9);
      expect(step2.y).toBeCloseTo(1.85, 9);
      expect(step2.slope).toBeCloseTo(-885 / 814, 9);
      expect(step2.yNext).toBeCloseTo(expected.euler, 9);

      // Valor final en x=1.2
      expect(euler!.finalY).toBeCloseTo(expected.euler, 9);
      expect(euler!.finalRelErrorPercent).toBeCloseTo(expected.eulerRelErrorPct, 6);
    });

    it('Heun: debe calcular predictor/corrector en ambos pasos y coincidir con la referencia (1.775806670950786, ~0.04655%)', () => {
      const resp = solveOdePvi(ODE_AUTONOMOUS_PRESET);
      const heun = resp.results.heun;
      expect(heun).toBeDefined();

      // Paso 1 (x=1.0 a x=1.1):
      // Predictor y1^(0) = 1.85
      // y1 = 2 + 0.05 * (-1.5 + f(1.1, 1.85)) ≈ 1.870638820638821
      const step1 = heun!.steps[0];
      expect(step1.heunDetail?.yPredictor).toBeCloseTo(1.85, 9);
      expect(step1.yNext).toBeCloseTo(1.870638820638821, 9);

      // Paso 2 (x=1.1 a x=1.2):
      // y2 ≈ 1.775806670950786
      const step2 = heun!.steps[1];
      expect(step2.yNext).toBeCloseTo(expected.heun, 9);

      // Valor final en x=1.2
      expect(heun!.finalY).toBeCloseTo(expected.heun, 9);
      expect(heun!.finalRelErrorPercent).toBeCloseTo(expected.heunRelErrorPct, 6);
    });

    it('RK3: debe coincidir con la referencia numérica (≈ 1.774943747303470)', () => {
      const resp = solveOdePvi(ODE_AUTONOMOUS_PRESET);
      const rk3 = resp.results.rk3;
      expect(rk3).toBeDefined();
      expect(rk3!.finalY).toBeCloseTo(expected.rk3, 9);
      expect(rk3!.finalRelErrorPercent).toBeLessThan(0.01);
    });

    it('RK4: debe coincidir con la referencia numérica clásica (≈ 1.774981595499526)', () => {
      const resp = solveOdePvi(ODE_AUTONOMOUS_PRESET);
      const rk4 = resp.results.rk4;
      expect(rk4).toBeDefined();
      expect(rk4!.finalY).toBeCloseTo(expected.rk4, 9);
      expect(rk4!.finalRelErrorPercent).toBeLessThan(0.001);
    });

    it('debe construir la tabla comparativa con los 4 métodos ordenados por orden de precisión', () => {
      const resp = solveOdePvi(ODE_AUTONOMOUS_PRESET);
      expect(resp.comparisonTable.length).toBe(4);

      const [e, h, r3, r4] = resp.comparisonTable;
      expect(e.methodType).toBe('euler');
      expect(e.order).toBe(1);

      expect(h.methodType).toBe('heun');
      expect(h.order).toBe(2);

      expect(r3.methodType).toBe('rk3');
      expect(r3.order).toBe(3);

      expect(r4.methodType).toBe('rk4');
      expect(r4.order).toBe(4);

      // RK4 debe ser más preciso que Euler y Heun
      expect(r4.absoluteError!).toBeLessThan(h.absoluteError!);
      expect(h.absoluteError!).toBeLessThan(e.absoluteError!);
    });
  });

  describe('Forma diferencial M(x, y)dx + N(x, y)dy = 0 y detección de singularidades', () => {
    it('debe convertir correctamente -M/N y evaluar la solución', () => {
      const resp = solveOdePvi({
        equationMode: 'differential',
        expressionM: 'y^2 - x^2',
        expressionN: 'x*y',
        x0: 1,
        y0: 2,
        xTarget: 1.2,
        h: 0.1,
        selectedMethods: ['euler'],
      });

      expect(resp.success).toBe(true);
      expect(resp.results.euler?.finalY).toBeCloseTo(1.741277641277641, 9);
    });

    it('debe detenerse con error claro si N(x, y) = 0 en la condición inicial', () => {
      const resp = solveOdePvi({
        equationMode: 'differential',
        expressionM: 'y^2 - x^2',
        expressionN: 'x*y',
        x0: 0, // x0 = 0 hace N(0, 2) = 0
        y0: 2,
        xTarget: 1.0,
        h: 0.1,
      });

      expect(resp.success).toBe(false);
      expect(resp.errorMessage).toMatch(/División entre cero detectada en N\(x, y\)/i);
    });

    it('debe rechazar funciones diferenciales vacías o incompletas', () => {
      const resp = solveOdePvi({
        equationMode: 'differential',
        expressionM: '',
        expressionN: 'x*y',
        x0: 1,
        y0: 2,
        xTarget: 1.2,
        h: 0.1,
      });

      expect(resp.success).toBe(false);
      expect(resp.errorMessage).toMatch(/ambas funciones M\(x, y\) y N\(x, y\)/i);
    });
  });

  describe('Casos de la Guía Teórica (Sesión 14)', () => {
    it('Ejemplo 1: y\' = x + y, y(0) = 1 en [0, 1] con h = 0.2', () => {
      const resp = solveOdePvi(ODE_PRACTICE_PRESETS.ejemplo1);
      expect(resp.success).toBe(true);

      // Comprobar tabla de la diapositiva 21 (Euler):
      // x=0.2 -> 1.20000
      // x=0.4 -> 1.48000
      // x=0.6 -> 1.85600
      // x=0.8 -> 2.34720
      // x=1.0 -> 2.97664
      const euler = resp.results.euler!;
      expect(euler.steps[0].yNext).toBeCloseTo(1.2, 5);
      expect(euler.steps[1].yNext).toBeCloseTo(1.48, 5);
      expect(euler.steps[2].yNext).toBeCloseTo(1.856, 5);
      expect(euler.steps[3].yNext).toBeCloseTo(2.3472, 5);
      expect(euler.steps[4].yNext).toBeCloseTo(2.97664, 5);

      // Comprobar diapositiva 28 (Heun):
      // x=1.0 -> 3.40542
      const heun = resp.results.heun!;
      expect(heun.finalY).toBeCloseTo(3.40542, 5);
    });

    it('Ejemplo 2: y\' = 2xy, y(1) = 1 hasta x = 1.5 con h = 0.1 (Diapositiva 23)', () => {
      const resp = solveOdePvi(ODE_PRACTICE_PRESETS.ejemplo2);
      expect(resp.success).toBe(true);

      const exact = Math.exp(1.5 * 1.5 - 1); // e^(1.25) ≈ 3.490342957
      expect(resp.results.rk4?.finalExact).toBeCloseTo(exact, 6);
      expect(resp.results.rk4?.finalY).toBeCloseTo(exact, 3);
    });

    it('Ejemplo 3: y\' = e^(x+y), y(1) = 0 hasta x = 1.2 con h = 0.1 (Diapositivas 29/32)', () => {
      const resp = solveOdePvi(ODE_PRACTICE_PRESETS.ejemplo3);
      expect(resp.success).toBe(true);

      // Solución exacta: y(1.2) = -ln(1 + e - e^1.2) ≈ 0.920928
      const exactVal = -Math.log(1 + Math.E - Math.exp(1.2));
      expect(resp.results.rk3?.finalExact).toBeCloseTo(exactVal, 5);
      expect(resp.results.rk3?.finalY).toBeCloseTo(exactVal, 2);
    });
  });

  describe('Validaciones de frontera y manejo riguroso de errores', () => {
    it('debe rechazar h negativo o cero', () => {
      const resp = solveOdePvi({
        expressionF: 'x + y',
        x0: 0,
        y0: 1,
        xTarget: 1,
        h: -0.1,
      });
      expect(resp.success).toBe(false);
      expect(resp.errorMessage).toMatch(/estrictamente positivo/i);
    });

    it('debe rechazar xTarget <= x0 en modo directo hacia adelante', () => {
      const resp = solveOdePvi({
        expressionF: 'x + y',
        x0: 2,
        y0: 1,
        xTarget: 1,
        h: 0.1,
      });
      expect(resp.success).toBe(false);
      expect(resp.errorMessage).toMatch(/menor que el punto inicial/i);
    });

    it('debe manejar adecuadamente valores verdaderos cero sin dividir entre cero', () => {
      const err = computeErrors(0.005, 0.0);
      expect(err.absoluteError).toBe(0.005);
      expect(err.relativeErrorPercent).toBeUndefined();
      expect(err.isExactZero).toBe(true);
    });

    it('debe soportar modo de paso parcial cuando (xTarget - x0)/h no es entero', () => {
      // x0 = 0, xTarget = 0.25, h = 0.1 -> pasos: 0.1, 0.1, 0.05
      const resp = solveOdePvi({
        expressionF: '1', // y' = 1 -> y = x
        x0: 0,
        y0: 0,
        xTarget: 0.25,
        h: 0.1,
        stepAdjustmentMode: 'partial_last_step',
        selectedMethods: ['euler'],
      });

      expect(resp.success).toBe(true);
      expect(resp.totalSteps).toBe(3);
      expect(resp.results.euler?.steps[0].h).toBe(0.1);
      expect(resp.results.euler?.steps[1].h).toBe(0.1);
      expect(resp.results.euler?.steps[2].h).toBeCloseTo(0.05, 9);
      expect(resp.results.euler?.steps[2].isPartialStep).toBe(true);
      expect(resp.results.euler?.finalY).toBeCloseTo(0.25, 9);
    });
  });
});
