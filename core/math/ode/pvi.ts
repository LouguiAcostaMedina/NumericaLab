import {
  OdeMethodType,
  OdeEquationMode,
  OdeStepDetail,
  OdeHeunStepDetail,
  OdeRk3StepDetail,
  OdeRk4StepDetail,
  OdeMethodResult,
  OdeComparisonRow,
  OdeCalculationResponse,
  ProcedureStep,
} from '../../domain/types';
import { MathParser } from '../MathParser';

export interface OdeCalculationOptions {
  equationMode?: OdeEquationMode;
  expressionF?: string;          // f(x, y) para y' = f(x, y)
  expressionM?: string;          // M(x, y) para M dx + N dy = 0
  expressionN?: string;          // N(x, y) para M dx + N dy = 0
  x0: number;
  y0: number;
  xTarget: number;
  h: number;
  selectedMethods?: OdeMethodType[]; // ['euler', 'heun', 'rk3', 'rk4']
  stepAdjustmentMode?: 'exact_n' | 'partial_last_step';
  exactExpression?: string;
  exactDerivationExplanation?: string;
  maxSteps?: number;
}

/**
 * Preset Oficial para la Actividad Autónoma Obligatoria (Sesión 14)
 * (y² - x²)dx + xy dy = 0, y(1) = 2, x = 1.2, h = 0.1
 */
export const ODE_AUTONOMOUS_PRESET: OdeCalculationOptions & {
  title: string;
  expectedReferenceValues: {
    exact: number;
    euler: number;
    eulerRelErrorPct: number;
    heun: number;
    heunRelErrorPct: number;
    rk3: number;
    rk4: number;
  };
} = {
  title: 'Actividad Autónoma (Sesión 14): (y² - x²)dx + xy dy = 0',
  equationMode: 'differential',
  expressionM: 'y^2 - x^2',
  expressionN: 'x*y',
  expressionF: 'x/y - y/x',
  x0: 1,
  y0: 2,
  xTarget: 1.2,
  h: 0.1,
  selectedMethods: ['euler', 'heun', 'rk3', 'rk4'],
  stepAdjustmentMode: 'exact_n',
  exactExpression: 'sqrt(x^2/2 + 3.5/x^2)',
  exactDerivationExplanation:
    'La ecuación (y² - x²)dx + xy dy = 0 es una EDO homogénea de grado 2. Al despejar dy/dx se tiene y\' = (x² - y²)/(xy) = x/y - y/x. Mediante la sustitución canónica y = vx (donde dy/dx = v + x dv/dx), la ecuación se transforma en separable: x dv/dx = (1 - 2v²)/v. Separando variables e integrando: -(1/4)ln|1 - 2v²| = ln|x| + C, lo que equivale a |1 - 2(y/x)²| = C/x⁴, de donde y² = x²/2 + K/x². Imponiendo la condición inicial y(1) = 2: 2² = 1/2 + K ⇒ K = 3.5. Por consiguiente, la solución analítica exacta positiva es y(x) = √(x²/2 + 3.5/x²).',
  expectedReferenceValues: {
    exact: 1.77498043807687,
    euler: 1.741277641277641,
    eulerRelErrorPct: 1.8987700414,
    heun: 1.775806670950786,
    heunRelErrorPct: 0.0465488439,
    rk3: 1.77494374730347,
    rk4: 1.774981595499526,
  },
};

/**
 * Presets de Práctica de la Guía Teórica (Sesión 14)
 */
export const ODE_PRACTICE_PRESETS = {
  ejemplo1: {
    title: 'Guía Diapositiva 20: y\' = x + y, y(0) = 1 (h = 0.2)',
    equationMode: 'derivative' as OdeEquationMode,
    expressionF: 'x + y',
    x0: 0,
    y0: 1,
    xTarget: 1.0,
    h: 0.2,
    selectedMethods: ['euler', 'heun', 'rk3', 'rk4'] as OdeMethodType[],
    stepAdjustmentMode: 'exact_n' as const,
    exactExpression: '2*exp(x) - x - 1',
    exactDerivationExplanation:
      'Ecuación lineal de primer orden y\' - y = x. Factor integrante μ(x) = e^(-x). Multiplicando: d/dx[y e^(-x)] = x e^(-x). Integrando por partes: y e^(-x) = -x e^(-x) - e^(-x) + C ⇒ y(x) = C e^x - x - 1. Con y(0) = 1 ⇒ 1 = C - 1 ⇒ C = 2. Solución exacta: y(x) = 2e^x - x - 1.',
  },
  ejemplo2: {
    title: 'Guía Diapositiva 23: y\' = 2xy, y(1) = 1 (h = 0.1)',
    equationMode: 'derivative' as OdeEquationMode,
    expressionF: '2*x*y',
    x0: 1,
    y0: 1,
    xTarget: 1.5,
    h: 0.1,
    selectedMethods: ['euler', 'heun', 'rk3', 'rk4'] as OdeMethodType[],
    stepAdjustmentMode: 'exact_n' as const,
    exactExpression: 'exp(x^2 - 1)',
    exactDerivationExplanation:
      'Ecuación de variables separables: dy/y = 2x dx. Integrando ambos lados: ln|y| = x² + C ⇒ y(x) = K e^(x²). Con y(1) = 1 ⇒ 1 = K e¹ ⇒ K = e^(-1). Solución exacta: y(x) = e^(x² - 1).',
  },
  ejemplo3: {
    title: 'Guía Diapositivas 29/32: y\' = e^(x+y), y(1) = 0 (h = 0.1)',
    equationMode: 'derivative' as OdeEquationMode,
    expressionF: 'exp(x + y)',
    x0: 1,
    y0: 0,
    xTarget: 1.2,
    h: 0.1,
    selectedMethods: ['euler', 'heun', 'rk3', 'rk4'] as OdeMethodType[],
    stepAdjustmentMode: 'exact_n' as const,
    exactExpression: '-log(1 + exp(1) - exp(x))',
    exactDerivationExplanation:
      'Ecuación separable: y\' = e^x e^y ⇒ e^(-y) dy = e^x dx. Integrando: -e^(-y) = e^x + C. Con y(1) = 0 ⇒ -e⁰ = e¹ + C ⇒ -1 = e + C ⇒ C = -(1 + e). Por tanto: e^(-y) = 1 + e - e^x ⇒ y(x) = -ln(1 + e - e^x).',
  },
};

/**
 * Función evaluadora de pendientes dy/dx con detección rigurosa de singularidades y divisiones entre cero.
 */
export function evaluateOdeSlope(
  fInput: string | ((x: number, y: number) => number),
  xVal: number,
  yVal: number,
  options?: {
    isDifferential?: boolean;
    exprM?: string;
    exprN?: string;
  }
): number {
  if (typeof fInput === 'function') {
    const val = fInput(xVal, yVal);
    if (!Number.isFinite(val) || Number.isNaN(val)) {
      throw new Error(
        `La función derivada devolvió un valor no finito (${val}) en el punto (x = ${xVal}, y = ${yVal}).`
      );
    }
    return val;
  }

  // Si proviene de forma diferencial M(x,y)dx + N(x,y)dy = 0
  if (options?.isDifferential && options.exprM && options.exprN) {
    const scope = {
      x: xVal,
      y: yVal,
      t: xVal,
      xy: xVal * yVal,
      yx: xVal * yVal,
    };

    let valM: number;
    let valN: number;

    try {
      valM = MathParser.evaluate(options.exprM, scope);
    } catch (err: unknown) {
      throw new Error(
        `Error al evaluar M(x, y) = "${options.exprM}" en (x=${xVal}, y=${yVal}): ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    try {
      valN = MathParser.evaluate(options.exprN, scope);
    } catch (err: unknown) {
      throw new Error(
        `Error al evaluar N(x, y) = "${options.exprN}" en (x=${xVal}, y=${yVal}): ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    if (Math.abs(valN) < 1e-15) {
      throw new Error(
        `División entre cero detectada en N(x, y): N(${xVal}, ${yVal}) = ${valN} ≈ 0. La ecuación diferencial M dx + N dy = 0 presenta una singularidad vertical en este punto donde dy/dx no está definida.`
      );
    }

    const slope = -valM / valN;
    if (!Number.isFinite(slope) || Number.isNaN(slope)) {
      throw new Error(
        `El cociente -M/N produjo un valor no finito (${slope}) en (x=${xVal}, y=${yVal}).`
      );
    }
    return slope;
  }

  // Evaluación directa de f(x, y)
  try {
    const scope = {
      x: xVal,
      y: yVal,
      t: xVal,
      xy: xVal * yVal,
      yx: xVal * yVal,
    };
    const slope = MathParser.evaluate(fInput, scope);
    if (!Number.isFinite(slope) || Number.isNaN(slope)) {
      throw new Error(
        `La expresión de la pendiente "${fInput}" produjo un valor no finito (${slope}) en el punto (x=${xVal}, y=${yVal}).`
      );
    }
    return slope;
  } catch (err: unknown) {
    throw new Error(
      `Error al evaluar f(x, y) en (x=${xVal}, y=${yVal}): ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

/**
 * Evalúa la solución analítica exacta si está disponible.
 */
export function evaluateExactSolution(
  exactExpr: string | ((x: number) => number) | undefined,
  xVal: number
): number | undefined {
  if (!exactExpr) return undefined;

  if (typeof exactExpr === 'function') {
    const val = exactExpr(xVal);
    return Number.isFinite(val) && !Number.isNaN(val) ? val : undefined;
  }

  try {
    const val = MathParser.evaluate(exactExpr, { x: xVal, t: xVal });
    return Number.isFinite(val) && !Number.isNaN(val) ? val : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Calcula el error absoluto y relativo porcentual de forma rigurosa.
 * Si exactVal es 0, el error relativo se marca como indefinido para no incurrir en división por cero.
 */
export function computeErrors(approxVal: number, exactVal?: number): {
  absoluteError?: number;
  relativeErrorPercent?: number;
  isExactZero?: boolean;
} {
  if (exactVal === undefined || !Number.isFinite(exactVal)) {
    return {};
  }

  const absoluteError = Math.abs(exactVal - approxVal);

  if (Math.abs(exactVal) < 1e-15) {
    return {
      absoluteError,
      relativeErrorPercent: undefined,
      isExactZero: true,
    };
  }

  const relativeErrorPercent = (absoluteError / Math.abs(exactVal)) * 100;
  return {
    absoluteError,
    relativeErrorPercent,
    isExactZero: false,
  };
}

// ============================================================================
// FUNCIONES PURAS DE UN PASO (PVI STEP ENGINES)
// ============================================================================

/**
 * Paso individual del Método de Euler (Euler-Cauchy):
 * y_{i+1} = y_i + h * f(x_i, y_i)
 */
export function eulerStep(
  f: (x: number, y: number) => number,
  x: number,
  y: number,
  h: number
): { yNext: number; slope: number } {
  const slope = f(x, y);
  const yNext = y + h * slope;
  return { yNext, slope };
}

/**
 * Paso individual del Método de Euler Mejorado (Heun / Predictor-Corrector):
 * Predictor: y_{i+1}^{(0)} = y_i + h * f(x_i, y_i)
 * Corrector: y_{i+1} = y_i + (h/2) * [ f(x_i, y_i) + f(x_{i+1}, y_{i+1}^{(0)}) ]
 */
export function heunStep(
  f: (x: number, y: number) => number,
  x: number,
  y: number,
  h: number
): {
  yNext: number;
  slope: number;
  heunDetail: OdeHeunStepDetail;
} {
  const slopeInitial = f(x, y);
  const yPredictor = y + h * slopeInitial;
  const slopePredictor = f(x + h, yPredictor);
  const slopeAverage = (slopeInitial + slopePredictor) / 2;
  const yNext = y + h * slopeAverage;

  return {
    yNext,
    slope: slopeAverage,
    heunDetail: {
      yPredictor,
      slopeInitial,
      slopePredictor,
      slopeAverage,
    },
  };
}

/**
 * Paso individual del Método de Runge-Kutta de orden 3 (RK3)
 * Fórmula exacta de la Diapositiva 31:
 * k1 = f(x_n, y_n)
 * k2 = f(x_n + h/2, y_n + (h/2)*k1)
 * k3 = f(x_n + h, y_n - h*k1 + 2*h*k2)
 * y_{n+1} = y_n + (h/6)*(k1 + 4*k2 + k3)
 */
export function rk3Step(
  f: (x: number, y: number) => number,
  x: number,
  y: number,
  h: number
): {
  yNext: number;
  slope: number;
  rk3Detail: OdeRk3StepDetail;
} {
  const k1 = f(x, y);
  const k2 = f(x + h / 2, y + (h / 2) * k1);
  const k3 = f(x + h, y - h * k1 + 2 * h * k2);
  const weightedSlope = (k1 + 4 * k2 + k3) / 6;
  const yNext = y + h * weightedSlope;

  return {
    yNext,
    slope: weightedSlope,
    rk3Detail: {
      k1,
      k2,
      k3,
      weightedSlope,
    },
  };
}

/**
 * Paso individual del Método de Runge-Kutta de orden 4 (RK4 Clásico)
 * Fórmula exacta de la Diapositiva 33:
 * k1 = f(x_i, y_i)
 * k2 = f(x_i + h/2, y_i + (h/2)*k1)
 * k3 = f(x_i + h/2, y_i + (h/2)*k2)
 * k4 = f(x_i + h, y_i + h*k3)
 * y_{i+1} = y_i + (h/6)*(k1 + 2*k2 + 2*k3 + k4)
 */
export function rk4Step(
  f: (x: number, y: number) => number,
  x: number,
  y: number,
  h: number
): {
  yNext: number;
  slope: number;
  rk4Detail: OdeRk4StepDetail;
} {
  const k1 = f(x, y);
  const k2 = f(x + h / 2, y + (h / 2) * k1);
  const k3 = f(x + h / 2, y + (h / 2) * k2);
  const k4 = f(x + h, y + h * k3);
  const weightedSlope = (k1 + 2 * k2 + 2 * k3 + k4) / 6;
  const yNext = y + h * weightedSlope;

  return {
    yNext,
    slope: weightedSlope,
    rk4Detail: {
      k1,
      k2,
      k3,
      k4,
      weightedSlope,
    },
  };
}

// ============================================================================
// RESOLUTOR POR MÉTODO INDIVIDUAL CON PASOS KA-TEX
// ============================================================================

/**
 * Ejecuta una trayectoria completa para un método numérico dado y construye los pasos manuales.
 */
export function solveSingleOdeMethod(
  methodType: OdeMethodType,
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xTarget: number,
  hSteps: number[],
  exactExpr?: string | ((x: number) => number),
  formulaSummary?: string
): OdeMethodResult {
  const methodNames: Record<OdeMethodType, { name: string; order: number; evals: number }> = {
    euler: { name: 'Método de Euler', order: 1, evals: 1 },
    heun: { name: 'Método de Euler Mejorado (Heun)', order: 2, evals: 2 },
    rk3: { name: 'Runge-Kutta 3er Orden (RK3)', order: 3, evals: 3 },
    rk4: { name: 'Runge-Kutta 4to Orden (RK4)', order: 4, evals: 4 },
  };

  const meta = methodNames[methodType];
  const steps: OdeStepDetail[] = [];
  const manualProcedure: ProcedureStep[] = [];

  let currentX = x0;
  let currentY = y0;
  let totalEvaluations = 0;

  // Paso 0: Configuración inicial
  const initialExact = evaluateExactSolution(exactExpr, currentX);
  const initialErrors = computeErrors(currentY, initialExact);

  manualProcedure.push({
    id: `setup-${methodType}`,
    type: 'SYSTEM_SETUP',
    title: `Paso 0: Parámetros Iniciales del PVI (${meta.name})`,
    description: `Punto inicial (x₀, y₀) = (${x0}, ${y0}). Objetivo: aproximar y(${xTarget}). Número de pasos previstos: ${hSteps.length}. Orden de convergencia global: O(h^${meta.order}).`,
    mathExpression: `x_0 = ${x0}, \\quad y_0 = ${y0}, \\quad x_{\\text{objetivo}} = ${xTarget}`,
  });

  for (let i = 0; i < hSteps.length; i++) {
    const stepH = hSteps[i];
    const isPartial = Math.abs(currentX + stepH - xTarget) < 1e-12 && i === hSteps.length - 1;

    let yNext = 0;
    let slope = 0;
    let heunDetail: OdeHeunStepDetail | undefined = undefined;
    let rk3Detail: OdeRk3StepDetail | undefined = undefined;
    let rk4Detail: OdeRk4StepDetail | undefined = undefined;

    switch (methodType) {
      case 'euler': {
        const res = eulerStep(f, currentX, currentY, stepH);
        yNext = res.yNext;
        slope = res.slope;
        totalEvaluations += 1;

        if (i < 2 || i === hSteps.length - 1) {
          manualProcedure.push({
            id: `iter-${methodType}-${i + 1}`,
            type: 'ITERATION_SUBSTITUTION',
            title: `Iteración ${i + 1}: de x = ${currentX.toFixed(4).replace(/\.?0+$/, '')} a x = ${(currentX + stepH).toFixed(4).replace(/\.?0+$/, '')}`,
            description: `Se calcula la pendiente en el punto actual y se proyecta linealmente con paso h = ${stepH}.`,
            mathExpression: `f(x_{${i}}, y_{${i}}) = f(${currentX.toFixed(4).replace(/\.?0+$/, '')}, ${currentY.toFixed(6)}) = ${slope.toFixed(6)} \\newline\ny_{${i + 1}} = ${currentY.toFixed(6)} + (${stepH}) \\cdot (${slope.toFixed(6)}) = ${yNext.toFixed(8)}`,
          });
        }
        break;
      }

      case 'heun': {
        const res = heunStep(f, currentX, currentY, stepH);
        yNext = res.yNext;
        slope = res.slope;
        heunDetail = res.heunDetail;
        totalEvaluations += 2;

        if (i < 2 || i === hSteps.length - 1) {
          manualProcedure.push({
            id: `iter-${methodType}-${i + 1}`,
            type: 'ITERATION_SUBSTITUTION',
            title: `Iteración ${i + 1}: Heun (Predictor-Corrector) en [${currentX.toFixed(4).replace(/\.?0+$/, '')}, ${(currentX + stepH).toFixed(4).replace(/\.?0+$/, '')}]`,
            description: `1) Predictor de Euler y_{${i+1}}^{(0)}. 2) Evaluación de pendiente en el predictor. 3) Corrector promediado.`,
            mathExpression: `\\text{Predictor: } y_{${i + 1}}^{(0)} = ${currentY.toFixed(6)} + (${stepH})(${heunDetail.slopeInitial.toFixed(6)}) = ${heunDetail.yPredictor.toFixed(6)} \\newline\n\\text{Pendiente futura: } f(x_{${i + 1}}, y_{${i + 1}}^{(0)}) = ${heunDetail.slopePredictor.toFixed(6)} \\newline\n\\text{Corrector: } y_{${i + 1}} = ${currentY.toFixed(6)} + \\frac{${stepH}}{2} [${heunDetail.slopeInitial.toFixed(6)} + (${heunDetail.slopePredictor.toFixed(6)})] = ${yNext.toFixed(8)}`,
          });
        }
        break;
      }

      case 'rk3': {
        const res = rk3Step(f, currentX, currentY, stepH);
        yNext = res.yNext;
        slope = res.slope;
        rk3Detail = res.rk3Detail;
        totalEvaluations += 3;

        if (i < 2 || i === hSteps.length - 1) {
          manualProcedure.push({
            id: `iter-${methodType}-${i + 1}`,
            type: 'ITERATION_SUBSTITUTION',
            title: `Iteración ${i + 1}: RK3 (Diapositiva 31) en [${currentX.toFixed(4).replace(/\.?0+$/, '')}, ${(currentX + stepH).toFixed(4).replace(/\.?0+$/, '')}]`,
            description: `Cálculo de las 3 pendientes intermedias k₁, k₂, k₃ y combinación ponderada (k₁ + 4k₂ + k₃)/6.`,
            mathExpression: `k_1 = f(${currentX.toFixed(4).replace(/\.?0+$/, '')}, ${currentY.toFixed(6)}) = ${rk3Detail.k1.toFixed(6)} \\newline\nk_2 = f(${currentX.toFixed(4).replace(/\.?0+$/, '')} + \\frac{${stepH}}{2}, ${currentY.toFixed(6)} + \\frac{${stepH}}{2} k_1) = ${rk3Detail.k2.toFixed(6)} \\newline\nk_3 = f(${currentX.toFixed(4).replace(/\.?0+$/, '')} + ${stepH}, ${currentY.toFixed(6)} - (${stepH}) k_1 + 2(${stepH}) k_2) = ${rk3Detail.k3.toFixed(6)} \\newline\ny_{${i + 1}} = ${currentY.toFixed(6)} + \\frac{${stepH}}{6} [${rk3Detail.k1.toFixed(6)} + 4(${rk3Detail.k2.toFixed(6)}) + ${rk3Detail.k3.toFixed(6)}] = ${yNext.toFixed(8)}`,
          });
        }
        break;
      }

      case 'rk4': {
        const res = rk4Step(f, currentX, currentY, stepH);
        yNext = res.yNext;
        slope = res.slope;
        rk4Detail = res.rk4Detail;
        totalEvaluations += 4;

        if (i < 2 || i === hSteps.length - 1) {
          manualProcedure.push({
            id: `iter-${methodType}-${i + 1}`,
            type: 'ITERATION_SUBSTITUTION',
            title: `Iteración ${i + 1}: RK4 Clásico (Diapositiva 33) en [${currentX.toFixed(4).replace(/\.?0+$/, '')}, ${(currentX + stepH).toFixed(4).replace(/\.?0+$/, '')}]`,
            description: `Cálculo de las 4 pendientes k₁, k₂, k₃, k₄ y promedio ponderado simétrico (k₁ + 2k₂ + 2k₃ + k₄)/6.`,
            mathExpression: `k_1 = ${rk4Detail.k1.toFixed(6)}, \\quad k_2 = ${rk4Detail.k2.toFixed(6)} \\newline\nk_3 = ${rk4Detail.k3.toFixed(6)}, \\quad k_4 = ${rk4Detail.k4.toFixed(6)} \\newline\ny_{${i + 1}} = ${currentY.toFixed(6)} + \\frac{${stepH}}{6} [k_1 + 2k_2 + 2k_3 + k_4] = ${yNext.toFixed(8)}`,
          });
        }
        break;
      }
    }

    const exactAtCurrent = evaluateExactSolution(exactExpr, currentX);
    const errsAtCurrent = computeErrors(currentY, exactAtCurrent);

    steps.push({
      step: i,
      x: currentX,
      y: currentY,
      h: stepH,
      slope,
      yNext,
      isPartialStep: isPartial,
      exactValue: exactAtCurrent,
      absoluteError: errsAtCurrent.absoluteError,
      relativeErrorPercent: errsAtCurrent.relativeErrorPercent,
      isExactZero: errsAtCurrent.isExactZero,
      heunDetail,
      rk3Detail,
      rk4Detail,
    });

    currentX = currentX + stepH;
    currentY = yNext;
  }

  // Nodo final en xTarget
  const finalExact = evaluateExactSolution(exactExpr, currentX);
  const finalErrs = computeErrors(currentY, finalExact);

  steps.push({
    step: hSteps.length,
    x: currentX,
    y: currentY,
    h: 0,
    slope: 0,
    yNext: currentY,
    exactValue: finalExact,
    absoluteError: finalErrs.absoluteError,
    relativeErrorPercent: finalErrs.relativeErrorPercent,
    isExactZero: finalErrs.isExactZero,
  });

  // Paso final resumen
  let finalMath = `y(${currentX.toFixed(4).replace(/\.?0+$/, '')}) \\approx ${currentY.toFixed(8)}`;
  if (finalExact !== undefined) {
    finalMath += ` \\newline\ny_{\\text{exacto}}(${currentX.toFixed(4).replace(/\.?0+$/, '')}) \\approx ${finalExact.toFixed(8)} \\newline\n\\text{Error Absoluto } |y - y_{\\text{num}}| \\approx ${finalErrs.absoluteError?.toFixed(8)} \\newline\n\\text{Error Relativo } \\varepsilon_r \\approx ${finalErrs.relativeErrorPercent?.toFixed(6)}\\%`;
  }

  manualProcedure.push({
    id: `final-${methodType}`,
    type: 'FINAL_RESULT',
    title: `Resultado Final mediante ${meta.name}`,
    description: `Aproximación alcanzada al punto objetivo tras ${hSteps.length} pasos numéricos.`,
    mathExpression: finalMath,
  });

  return {
    methodType,
    methodName: meta.name,
    order: meta.order,
    evaluationsPerStep: meta.evals,
    totalEvaluations,
    steps,
    finalY: currentY,
    finalExact,
    finalAbsError: finalErrs.absoluteError,
    finalRelErrorPercent: finalErrs.relativeErrorPercent,
    manualProcedure,
  };
}

// ============================================================================
// ORQUESTADOR PRINCIPAL PARA RESOLVER PVI
// ============================================================================

export function solveOdePvi(options: OdeCalculationOptions): OdeCalculationResponse {
  const {
    equationMode = 'derivative',
    expressionF = '',
    expressionM = '',
    expressionN = '',
    x0,
    y0,
    xTarget,
    h,
    selectedMethods = ['euler', 'heun', 'rk3', 'rk4'],
    stepAdjustmentMode = 'exact_n',
    exactExpression,
    exactDerivationExplanation,
    maxSteps = 50000,
  } = options;

  // Respuestas vacías por defecto ante errores
  const baseResponse: OdeCalculationResponse = {
    success: false,
    equationMode,
    expressionF: expressionF || '',
    expressionM,
    expressionN,
    x0,
    y0,
    xTarget,
    nominalH: h,
    totalSteps: 0,
    stepAdjustmentMode,
    exactExpression,
    exactDerivationExplanation,
    results: {},
    comparisonTable: [],
  };

  // 1. Validaciones básicas de parámetros numéricos
  if (!Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(xTarget)) {
    return {
      ...baseResponse,
      errorMessage: `Los puntos iniciales (x₀, y₀) y el objetivo x_target deben ser números reales finitos. Se recibió: x₀=${x0}, y₀=${y0}, x_target=${xTarget}.`,
    };
  }

  if (!Number.isFinite(h) || h <= 0) {
    return {
      ...baseResponse,
      errorMessage: `El tamaño de paso h debe ser estrictamente positivo (h > 0). Se recibió: h=${h}.`,
    };
  }

  if (Math.abs(xTarget - x0) < 1e-12) {
    return {
      ...baseResponse,
      errorMessage: `El punto objetivo x_target (${xTarget}) coincide con la condición inicial x₀ (${x0}). No se requiere integración.`,
    };
  }

  if (xTarget < x0) {
    return {
      ...baseResponse,
      errorMessage: `El punto objetivo x_target (${xTarget}) es menor que el punto inicial x₀ (${x0}). Actualmente el módulo está configurado para integración hacia adelante (x_target > x₀).`,
    };
  }

  // 2. Validación de expresiones según el modo
  let effectiveFExpression = expressionF;
  if (equationMode === 'differential') {
    if (!expressionM || expressionM.trim() === '' || !expressionN || expressionN.trim() === '') {
      return {
        ...baseResponse,
        errorMessage: 'En el modo diferencial se deben proporcionar ambas funciones M(x, y) y N(x, y).',
      };
    }
    effectiveFExpression = `-(${expressionM}) / (${expressionN})`;
  } else {
    if (!expressionF || expressionF.trim() === '') {
      return {
        ...baseResponse,
        errorMessage: 'Debe ingresar una función f(x, y) para resolver la EDO y\' = f(x, y).',
      };
    }
  }

  // Función evaluadora encapsulada
  const fEvaluator = (xVal: number, yVal: number): number => {
    return evaluateOdeSlope(
      effectiveFExpression,
      xVal,
      yVal,
      equationMode === 'differential'
        ? { isDifferential: true, exprM: expressionM, exprN: expressionN }
        : undefined
    );
  };

  // 3. Verificación de prueba de evaluación en el punto inicial
  try {
    fEvaluator(x0, y0);
  } catch (err: unknown) {
    return {
      ...baseResponse,
      errorMessage: `Fallo al evaluar la pendiente en la condición inicial (x₀=${x0}, y₀=${y0}): ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  // 4. Determinación de la partición de pasos
  const distance = xTarget - x0;
  const rawN = distance / h;
  const hSteps: number[] = [];

  if (stepAdjustmentMode === 'exact_n') {
    // Si el usuario elige forzar n entero exacto
    const nInt = Math.max(1, Math.round(rawN));
    if (nInt > maxSteps) {
      return {
        ...baseResponse,
        errorMessage: `El número de pasos calculado (${nInt}) excede el límite máximo permitido (${maxSteps}). Aumente el tamaño de paso h.`,
      };
    }
    const adjustedH = distance / nInt;
    for (let k = 0; k < nInt; k++) {
      hSteps.push(adjustedH);
    }
  } else {
    // Modo paso parcial: pasos fijos de tamaño h, y si sobra un residuo, un paso parcial al final
    const fullStepsCount = Math.floor(distance / h);
    if (fullStepsCount > maxSteps) {
      return {
        ...baseResponse,
        errorMessage: `El número de pasos (${fullStepsCount}) excede el límite permitido (${maxSteps}).`,
      };
    }

    for (let k = 0; k < fullStepsCount; k++) {
      hSteps.push(h);
    }

    const remaining = distance - fullStepsCount * h;
    if (remaining > 1e-10) {
      hSteps.push(remaining); // Último paso parcial identificado
    }
  }

  // 5. Ejecutar los métodos seleccionados
  const results: Partial<Record<OdeMethodType, OdeMethodResult>> = {};
  const comparisonTable: OdeComparisonRow[] = [];

  const methodsToRun: OdeMethodType[] =
    selectedMethods && selectedMethods.length > 0
      ? selectedMethods
      : ['euler', 'heun', 'rk3', 'rk4'];

  try {
    for (const m of methodsToRun) {
      const res = solveSingleOdeMethod(
        m,
        fEvaluator,
        x0,
        y0,
        xTarget,
        hSteps,
        exactExpression
      );
      results[m] = res;

      comparisonTable.push({
        methodType: m,
        methodName: res.methodName,
        order: res.order,
        approxValue: res.finalY,
        absoluteError: res.finalAbsError,
        relativeErrorPercent: res.finalRelErrorPercent,
        evaluationsPerStep: res.evaluationsPerStep,
        totalEvaluations: res.totalEvaluations,
      });
    }
  } catch (err: unknown) {
    return {
      ...baseResponse,
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }

  // 6. Puntos continuos de la solución exacta para la gráfica (100 puntos)
  const curvePointsExact: { x: number; y: number }[] = [];
  if (exactExpression) {
    const samplePoints = 100;
    const dx = distance / samplePoints;
    for (let s = 0; s <= samplePoints; s++) {
      const cx = x0 + s * dx;
      const cy = evaluateExactSolution(exactExpression, cx);
      if (cy !== undefined && Number.isFinite(cy)) {
        curvePointsExact.push({ x: cx, y: cy });
      }
    }
  }

  return {
    success: true,
    equationMode,
    expressionF: effectiveFExpression,
    expressionM: equationMode === 'differential' ? expressionM : undefined,
    expressionN: equationMode === 'differential' ? expressionN : undefined,
    x0,
    y0,
    xTarget,
    nominalH: h,
    totalSteps: hSteps.length,
    stepAdjustmentMode,
    exactExpression,
    exactDerivationExplanation,
    results,
    comparisonTable,
    curvePointsExact: curvePointsExact.length > 0 ? curvePointsExact : undefined,
  };
}
