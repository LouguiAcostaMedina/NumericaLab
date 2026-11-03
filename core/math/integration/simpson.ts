import {
  SimpsonNode,
  SimpsonConvergenceRow,
  SimpsonErrorBoundAnalysis,
  SimpsonMethodResponse,
  SimpsonMethodType,
  ProcedureStep,
} from '../../domain/types';
import { MathParser } from '../MathParser';

export interface SimpsonCalculationOptions {
  methodType?: SimpsonMethodType; // 'simpson13' | 'simpson38'
  expression?: string | ((t: number) => number);
  a?: number;
  b?: number;
  n?: number;
  variableName?: string;
  exactValue?: number;
  exactExpressionDescription?: string;
  isTheoreticalExact?: boolean;
  units?: {
    rateUnit?: string;
    integralUnit?: string;
    variableUnit?: string;
  };
  mFicha?: number;       // Cota del dato proporcionado en la ficha (ej: 0.45)
  mValid?: number;       // Cota conservadora matemáticamente válida (ej: 5.131103802)
  convergenceNValues?: number[];
  isTabular?: boolean;
  tabularPoints?: { x: number; y: number }[];
}

/**
 * Constante del valor analítico exacto para la Actividad Autónoma (Sesión 13):
 * P(t) = 10 + 5*t*sen(pi*t/6) + e^(0.2t) en [0, 6] horas.
 * E = 60 + 180/pi + 5*(e^1.2 - 1) ≈ 128.896364126765 kWh.
 */
export const SIMPSON13_AUTONOMOUS_EXACT_REFERENCE =
  60 + 180 / Math.PI + 5 * (Math.exp(1.2) - 1);

/**
 * Preset oficial para la Actividad Autónoma Obligatoria (Sesión 13 - Simpson 1/3)
 */
export const SIMPSON13_AUTONOMOUS_PRESET = {
  methodType: 'simpson13' as SimpsonMethodType,
  expression: '10 + 5*t*sin(pi*t/6) + exp(0.2*t)',
  displayExpression: '10 + 5t·sen(πt/6) + e^(0,2t)',
  a: 0,
  b: 6,
  n: 6,
  variableName: 't',
  units: {
    rateUnit: 'kW',
    integralUnit: 'kWh',
    variableUnit: 'h',
  },
  exactValue: SIMPSON13_AUTONOMOUS_EXACT_REFERENCE,
  exactExpressionDescription:
    'E = 60 + \\frac{180}{\\pi} + 5(e^{1.2} - 1) \\approx 128.896364 \\text{ kWh}',
  isTheoreticalExact: true,
  mFicha: 0.45,
  mValid: 5.131103802,
  convergenceNValues: [2, 4, 6, 12, 24],
};

/**
 * Preset para el caso de datos tabulados de la Guía Teórica (Simpson 3/8)
 * x (m) = [0, 5, 10, 15, 20, 25, 30]
 * f(x) (m) = [2.1, 2.4, 2.9, 3.0, 2.8, 2.5, 2.2]
 * Área compuesta con n=6 es 78.9375 m².
 */
export const SIMPSON38_TABULAR_PRESET = {
  methodType: 'simpson38' as SimpsonMethodType,
  isTabular: true,
  points: [
    { x: 0, y: 2.1 },
    { x: 5, y: 2.4 },
    { x: 10, y: 2.9 },
    { x: 15, y: 3.0 },
    { x: 20, y: 2.8 },
    { x: 25, y: 2.5 },
    { x: 30, y: 2.2 },
  ],
  a: 0,
  b: 30,
  n: 6,
  variableName: 'x',
  units: {
    rateUnit: 'm',
    integralUnit: 'm²',
    variableUnit: 'm',
  },
  expectedArea: 78.9375,
};

/**
 * Presets de práctica de la guía teórica
 */
export const PRACTICE_PRESETS = {
  invX: {
    expression: '1/x',
    displayExpression: '1/x',
    a: 3,
    b: 3.6,
    n: 2,
    variableName: 'x',
    exactValue: Math.log(3.6 / 3), // ln(1.2) ≈ 0.18232155679
    exactExpressionDescription: 'I = \\int_3^{3.6} \\frac{1}{x} dx = \\ln(1.2) \\approx 0.182322',
  },
  expX: {
    expression: 'exp(x)',
    displayExpression: 'e^x',
    a: 0,
    b: 1,
    n: 2,
    variableName: 'x',
    exactValue: Math.E - 1, // ≈ 1.718281828459
    exactExpressionDescription: 'I = \\int_0^1 e^x dx = e - 1 \\approx 1.718282',
  },
  sqrtRational: {
    expression: '1/sqrt(1 + x^2)',
    displayExpression: '1/\\sqrt{1+x^2}',
    a: 0,
    b: 4,
    n: 8,
    variableName: 'x',
    exactValue: Math.asinh(4), // ln(4 + sqrt(17)) ≈ 2.09471254726
    exactExpressionDescription: 'I = \\int_0^4 \\frac{1}{\\sqrt{1+x^2}} dx = \\operatorname{arsinh}(4) \\approx 2.094713',
  },
};

/**
 * Evalúa una función o expresión matemática dada en un nodo de forma segura.
 */
export function evaluateAtNode(
  f: ((t: number) => number) | string,
  tVal: number,
  variable: string = 't'
): number {
  if (typeof f === 'function') {
    const val = f(tVal);
    if (!Number.isFinite(val) || Number.isNaN(val)) {
      throw new Error(
        `La función evaluada devolvió un valor no finito (${val}) en el punto ${variable} = ${tVal}.`
      );
    }
    return val;
  }

  try {
    const val = MathParser.evaluate(f, {
      [variable]: tVal,
      t: tVal,
      x: tVal,
    });
    if (!Number.isFinite(val) || Number.isNaN(val)) {
      throw new Error(
        `La expresión "${f}" produjo un valor no finito (${val}) en el nodo ${variable} = ${tVal}.`
      );
    }
    return val;
  } catch (err: unknown) {
    throw new Error(
      `Error al evaluar la expresión en ${variable} = ${tVal}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

/**
 * Valida los parámetros comunes de integración [a, b] y n.
 */
function validateIntegrationLimits(a: number, b: number): void {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error(
      `Los límites de integración [a, b] deben ser valores numéricos finitos. Se recibió: a=${a}, b=${b}.`
    );
  }

  if (a >= b) {
    throw new Error(
      `El límite inferior a (${a}) debe ser estrictamente menor que el límite superior b (${b}).`
    );
  }
}

/**
 * Función matemática pura reutilizable para la Regla de Simpson 1/3 Compuesto.
 *
 * Exige n entero, positivo y par (mínimo 2). Si es impar, lanza una excepción clara.
 * Usa h = (b-a)/n y coeficientes [1, 4, 2, 4, ..., 2, 4, 1]:
 *
 * S_n = (h/3) [ f(x_0) + 4 * sum_{i impar} f(x_i) + 2 * sum_{i par interior} f(x_i) + f(x_n) ]
 *
 * @param f Función evaluable (JavaScript callback o string matemático)
 * @param a Límite inferior de integración
 * @param b Límite superior de integración
 * @param n Número entero positivo y par de subintervalos (n ≥ 2)
 * @param variable Nombre de la variable independiente (default: 't')
 * @returns El valor aproximado de la integral S_n
 */
export function simpson13_compuesto(
  f: ((t: number) => number) | string,
  a: number,
  b: number,
  n: number,
  variable: string = 't'
): number {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    throw new Error(
      `El número de subintervalos n debe ser un entero positivo mayor o igual a 2. Se recibió: ${n}.`
    );
  }

  if (n % 2 !== 0) {
    throw new Error(
      `La Regla de Simpson 1/3 Compuesto requiere obligatoriamente que el número de subintervalos n sea par (múltiplo de 2). Se recibió n = ${n}, que es impar.`
    );
  }

  if (n < 2) {
    throw new Error(
      `El número de subintervalos n debe ser un entero positivo mayor o igual a 2. Se recibió: ${n}.`
    );
  }

  if (n > 100000) {
    throw new Error(
      `El número de subintervalos n (${n}) excede el límite máximo permitido (100,000) para garantizar estabilidad computacional.`
    );
  }

  validateIntegrationLimits(a, b);

  const h = (b - a) / n;
  const f0 = evaluateAtNode(f, a, variable);
  const fn = evaluateAtNode(f, b, variable);

  let sumOdd = 0;   // Coeficiente 4: i = 1, 3, 5, ..., n-1
  let sumEven = 0;  // Coeficiente 2: i = 2, 4, 6, ..., n-2

  for (let i = 1; i < n; i++) {
    const ti = a + i * h;
    const fti = evaluateAtNode(f, ti, variable);
    if (i % 2 === 1) {
      sumOdd += fti;
    } else {
      sumEven += fti;
    }
  }

  const Sn = (h / 3) * (f0 + 4 * sumOdd + 2 * sumEven + fn);
  return Sn;
}

/**
 * Aliases para Simpson 1/3 Compuesto
 */
export const simpson13Compuesto = simpson13_compuesto;
export const compositeSimpson13 = simpson13_compuesto;

/**
 * Regla de Simpson 3/8 Simple (n = 3)
 *
 * S_{3/8} = (3h/8) * [ f(x0) + 3*f(x1) + 3*f(x2) + f(x3) ]
 */
export function simpson38_simple(
  f: ((t: number) => number) | string,
  a: number,
  b: number,
  variable: string = 't'
): number {
  return simpson38_compuesto(f, a, b, 3, variable);
}

/**
 * Función matemática pura reutilizable para la Regla de Simpson 3/8 Compuesto.
 *
 * Exige n entero positivo y múltiplo de 3 (mínimo 3).
 * Coeficientes: 1 en extremos, 2 en índices interiores múltiplos de 3, y 3 en los demás.
 *
 * S_{3/8} = (3h/8) [ f(x0) + 3 * sum_{i no mult 3} f(xi) + 2 * sum_{i mult 3 interior} f(xi) + f(xn) ]
 *
 * @param f Función evaluable
 * @param a Límite inferior
 * @param b Límite superior
 * @param n Número entero positivo múltiplo de 3 (3, 6, 9, 12, ...)
 * @param variable Nombre de la variable
 */
export function simpson38_compuesto(
  f: ((t: number) => number) | string,
  a: number,
  b: number,
  n: number,
  variable: string = 't'
): number {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    throw new Error(
      `El número de subintervalos n debe ser un entero positivo. Se recibió: ${n}.`
    );
  }

  if (n % 3 !== 0) {
    throw new Error(
      `La Regla de Simpson 3/8 Compuesto requiere obligatoriamente que el número de subintervalos n sea un múltiplo positivo de 3 (3, 6, 9, 12, ...). Se recibió n = ${n}, que no es múltiplo de 3.`
    );
  }

  if (n < 3) {
    throw new Error(
      `El número de subintervalos n debe ser mayor o igual a 3. Se recibió: ${n}.`
    );
  }

  if (n > 100000) {
    throw new Error(
      `El número de subintervalos n (${n}) excede el límite máximo permitido (100,000) para garantizar estabilidad computacional.`
    );
  }

  validateIntegrationLimits(a, b);

  const h = (b - a) / n;
  const f0 = evaluateAtNode(f, a, variable);
  const fn = evaluateAtNode(f, b, variable);

  let sumOthers = 0;     // Coeficiente 3 (i no múltiplo de 3)
  let sumMult3Inner = 0; // Coeficiente 2 (i múltiplo de 3 interior: 3, 6, ..., n-3)

  for (let i = 1; i < n; i++) {
    const ti = a + i * h;
    const fti = evaluateAtNode(f, ti, variable);
    if (i % 3 === 0) {
      sumMult3Inner += fti;
    } else {
      sumOthers += fti;
    }
  }

  const Sn = ((3 * h) / 8) * (f0 + 3 * sumOthers + 2 * sumMult3Inner + fn);
  return Sn;
}

/**
 * Aliases para Simpson 3/8 Compuesto
 */
export const simpson38Compuesto = simpson38_compuesto;
export const compositeSimpson38 = simpson38_compuesto;

/**
 * Función para calcular integración numérica a partir de datos tabulados equiespaciados.
 */
export function integrateTabularPoints(
  points: { x: number; y: number }[],
  methodType: SimpsonMethodType = 'simpson38'
): {
  result: number;
  h: number;
  n: number;
  nodes: SimpsonNode[];
} {
  if (!points || points.length < (methodType === 'simpson13' ? 3 : 4)) {
    throw new Error(
      `Se requieren al menos ${methodType === 'simpson13' ? 3 : 4} puntos tabulados para ${
        methodType === 'simpson13' ? 'Simpson 1/3 (n ≥ 2)' : 'Simpson 3/8 (n ≥ 3)'
      }. Se recibieron ${points ? points.length : 0} puntos.`
    );
  }

  // Ordenar puntos por x ascendente
  const sorted = [...points].sort((p1, p2) => p1.x - p2.x);
  const n = sorted.length - 1;

  if (methodType === 'simpson13' && n % 2 !== 0) {
    throw new Error(
      `La Regla de Simpson 1/3 requiere un número par de subintervalos (número impar de puntos). Se tienen ${sorted.length} puntos (n = ${n}), lo cual es impar.`
    );
  }

  if (methodType === 'simpson38' && n % 3 !== 0) {
    throw new Error(
      `La Regla de Simpson 3/8 requiere que n sea múltiplo de 3 (número de puntos = múltiplo de 3 + 1). Se tienen ${sorted.length} puntos (n = ${n}), no divisible por 3.`
    );
  }

  // Comprobar que los puntos estén equiespaciados
  const h = sorted[1].x - sorted[0].x;
  if (h <= 0) {
    throw new Error(
      `Los puntos tabulados deben tener coordenadas x crecientes estrictas. Se detectó paso h = ${h}.`
    );
  }

  const TOLERANCE = 1e-6;
  for (let i = 1; i < sorted.length - 1; i++) {
    const step = sorted[i + 1].x - sorted[i].x;
    if (Math.abs(step - h) > TOLERANCE) {
      throw new Error(
        `Los puntos tabulados no están equiespaciados. El intervalo entre x_${i} (${sorted[i].x}) y x_${i + 1} (${sorted[i + 1].x}) es ${step}, mientras que el paso base es h = ${h}.`
      );
    }
  }

  const nodes: SimpsonNode[] = [];
  let weightedSum = 0;

  if (methodType === 'simpson13') {
    for (let i = 0; i <= n; i++) {
      const pt = sorted[i];
      let coefficient = 1;
      if (i === 0 || i === n) {
        coefficient = 1;
      } else if (i % 2 === 1) {
        coefficient = 4;
      } else {
        coefficient = 2;
      }

      const termContribution = pt.y * coefficient;
      weightedSum += termContribution;

      nodes.push({
        i,
        t: pt.x,
        ft: pt.y,
        coefficient,
        weight: (coefficient * h) / 3,
        termContribution,
      });
    }

    const result = (h / 3) * weightedSum;
    return { result, h, n, nodes };
  } else {
    // Simpson 3/8
    for (let i = 0; i <= n; i++) {
      const pt = sorted[i];
      let coefficient = 1;
      if (i === 0 || i === n) {
        coefficient = 1;
      } else if (i % 3 === 0) {
        coefficient = 2;
      } else {
        coefficient = 3;
      }

      const termContribution = pt.y * coefficient;
      weightedSum += termContribution;

      nodes.push({
        i,
        t: pt.x,
        ft: pt.y,
        coefficient,
        weight: (coefficient * 3 * h) / 8,
        termContribution,
      });
    }

    const result = ((3 * h) / 8) * weightedSum;
    return { result, h, n, nodes };
  }
}

/**
 * Calcula la cota de error teórico para Simpson 1/3 o 3/8 dado un valor M.
 *
 * Simpson 1/3: |E_t| <= (b-a) * h^4 * M / 180
 * Simpson 3/8: |E_t| <= (b-a) * h^4 * M / 80
 */
export function calculateSimpsonErrorBound(
  bMinusA: number,
  h: number,
  m: number,
  methodType: SimpsonMethodType = 'simpson13'
): number {
  if (methodType === 'simpson13') {
    return (bMinusA * Math.pow(h, 4) * m) / 180;
  } else {
    return (bMinusA * Math.pow(h, 4) * m) / 80;
  }
}

/**
 * Orquestador principal de cálculo de Integración por Reglas de Simpson (1/3 y 3/8).
 * Genera la respuesta completa con procedimiento paso a paso, tabla de nodos,
 * tabla de análisis de convergencia, cotas teóricas de error y puntos de trazado.
 */
export function calculateSimpsonIntegration(
  options: SimpsonCalculationOptions
): SimpsonMethodResponse {
  const {
    methodType = 'simpson13',
    expression,
    a = 0,
    b = 0,
    n = 6,
    variableName = 't',
    exactValue,
    exactExpressionDescription,
    isTheoreticalExact = false,
    units,
    mFicha,
    mValid,
    convergenceNValues = methodType === 'simpson13'
      ? [2, 4, 6, 12, 24]
      : [3, 6, 9, 12, 24],
    isTabular = false,
    tabularPoints,
  } = options;

  const expressionStr =
    typeof expression === 'string'
      ? expression
      : isTabular
      ? 'Datos tabulados'
      : `f(${variableName})`;

  const emptyResponse: SimpsonMethodResponse = {
    success: false,
    methodType,
    functionExpression: expressionStr,
    variableName,
    a,
    b,
    n,
    h: 0,
    Sn: 0,
    units,
    nodes: [],
    curvePoints: [],
  };

  // CASO DE DATOS TABULADOS
  if (isTabular) {
    if (!tabularPoints || tabularPoints.length === 0) {
      return {
        ...emptyResponse,
        errorMessage:
          'Se seleccionó el modo de datos tabulados pero no se proporcionaron puntos.',
      };
    }

    try {
      const tabularResult = integrateTabularPoints(tabularPoints, methodType);
      const computedA = tabularPoints[0].x;
      const computedB = tabularPoints[tabularPoints.length - 1].x;

      // Generar pasos de resolución manual para datos tabulados
      const manualProcedure: ProcedureStep[] = [];

      manualProcedure.push({
        id: 'step-tabular-setup',
        type: 'SYSTEM_SETUP',
        title: 'Paso 1: Identificación de Datos Tabulados y Paso h',
        description: `Se tienen ${tabularPoints.length} puntos en el intervalo [${computedA}, ${computedB}] divididos en n = ${tabularResult.n} subintervalos.`,
        mathExpression: `h = x_{1} - x_{0} = ${tabularResult.h.toFixed(4).replace(/\\.?0+$/, '')}`,
      });

      manualProcedure.push({
        id: 'step-tabular-formula',
        type: 'FORMULA_DERIVATION',
        title: `Paso 2: Formulación de la Regla de ${
          methodType === 'simpson13' ? 'Simpson 1/3' : 'Simpson 3/8'
        } Compuesto`,
        description:
          methodType === 'simpson13'
            ? 'Aproxima los subintervalos tomados de a dos mediante parábolas de segundo orden (coeficientes 1, 4, 2, 4, ..., 1).'
            : 'Aproxima los subintervalos tomados de a tres mediante polinomios cúbicos de tercer orden (coeficientes 1, 3, 3, 2, ..., 1).',
        mathExpression:
          methodType === 'simpson13'
            ? `S_{${tabularResult.n}} = \\frac{h}{3} \\left[ f(x_0) + 4\\sum f(x_{\\text{impar}}) + 2\\sum f(x_{\\text{par}}) + f(x_{${tabularResult.n}}) \\right]`
            : `S_{${tabularResult.n}} = \\frac{3h}{8} \\left[ f(x_0) + 3\\sum f(x_{\\text{no } 3k}) + 2\\sum f(x_{3k}) + f(x_{${tabularResult.n}}) \\right]`,
      });

      const termsPreview = tabularResult.nodes
        .map((node) => `${node.coefficient} \\cdot (${node.ft})`)
        .join(' + ');

      manualProcedure.push({
        id: 'step-tabular-substitution',
        type: 'ITERATION_SUBSTITUTION',
        title: 'Paso 3: Sustitución de Valores Tabulados',
        description: 'Multiplicación de cada ordenada por su coeficiente correspondiente y suma total.',
        mathExpression:
          methodType === 'simpson13'
            ? `S_{${tabularResult.n}} = \\frac{${tabularResult.h}}{3} \\left[ ${termsPreview} \\right] = ${tabularResult.result.toFixed(6)}`
            : `S_{${tabularResult.n}} = \\frac{3(${tabularResult.h})}{8} \\left[ ${termsPreview} \\right] = ${tabularResult.result.toFixed(6)}`,
      });

      const unitLabel = units?.integralUnit ? `\\text{ ${units.integralUnit}}` : '';
      manualProcedure.push({
        id: 'step-tabular-result',
        type: 'FINAL_RESULT',
        title: 'Paso 4: Resultado Final de la Integración',
        description: `El área calculada a partir de los datos tabulados mediante ${
          methodType === 'simpson13' ? 'Simpson 1/3' : 'Simpson 3/8'
        } es:`,
        mathExpression: `S_{${tabularResult.n}} = ${tabularResult.result.toFixed(6)} ${unitLabel}`,
      });

      return {
        success: true,
        methodType,
        functionExpression: 'Datos Tabulados',
        variableName,
        a: computedA,
        b: computedB,
        n: tabularResult.n,
        h: tabularResult.h,
        Sn: tabularResult.result,
        isTabular: true,
        tabularPoints,
        units,
        nodes: tabularResult.nodes,
        manualProcedure,
        curvePoints: tabularPoints,
      };
    } catch (err: unknown) {
      return {
        ...emptyResponse,
        errorMessage: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // CASO DE FUNCIÓN ANALÍTICA
  if (!expression) {
    return {
      ...emptyResponse,
      errorMessage: 'Se requiere una función matemática para realizar la integración.',
    };
  }

  // Validaciones de n según el método
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    return {
      ...emptyResponse,
      errorMessage: `El número de subintervalos n debe ser un entero positivo. Se recibió: ${n}.`,
    };
  }

  if (methodType === 'simpson13') {
    if (n < 2) {
      return {
        ...emptyResponse,
        errorMessage:
          'La Regla de Simpson 1/3 requiere al menos n = 2 subintervalos para formar la parábola interpolante inicial.',
      };
    }
    if (n % 2 !== 0) {
      return {
        ...emptyResponse,
        errorMessage: `⚠️ Regla de Simpson 1/3 requiere un número PAR de subintervalos (múltiplo de 2). Se recibió n = ${n} (impar). Cada parábola de Simpson 1/3 abarca exactamente 2 subintervalos consecutivos, por lo que n debe ser divisible por 2 (ej: 2, 4, 6, 8, 12, 24).`,
      };
    }
  } else {
    // Simpson 3/8
    if (n < 3) {
      return {
        ...emptyResponse,
        errorMessage:
          'La Regla de Simpson 3/8 requiere al menos n = 3 subintervalos para formar el polinomio cúbico inicial.',
      };
    }
    if (n % 3 !== 0) {
      return {
        ...emptyResponse,
        errorMessage: `⚠️ Regla de Simpson 3/8 requiere que n sea un múltiplo positivo de 3. Se recibió n = ${n}. Cada polinomio cúbico de Simpson 3/8 abarca 3 subintervalos consecutivos, por lo que n debe ser divisible por 3 (ej: 3, 6, 9, 12, 15, ...).`,
      };
    }
  }

  if (n > 100000) {
    return {
      ...emptyResponse,
      errorMessage: `El número de subintervalos n (${n}) excede el límite máximo permitido (100,000).`,
    };
  }

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return {
      ...emptyResponse,
      errorMessage: `Los límites de integración [a, b] deben ser valores numéricos finitos. Se recibió: a=${a}, b=${b}.`,
    };
  }

  if (a >= b) {
    return {
      ...emptyResponse,
      errorMessage: `El límite inferior a (${a}) debe ser estrictamente menor que el límite superior b (${b}).`,
    };
  }

  try {
    const h = (b - a) / n;
    const nodes: SimpsonNode[] = [];
    let weightedSum = 0;

    for (let i = 0; i <= n; i++) {
      const ti = a + i * h;
      const ft = evaluateAtNode(expression, ti, variableName);

      let coefficient = 1;
      let effectiveWeight = 1;

      if (methodType === 'simpson13') {
        if (i === 0 || i === n) {
          coefficient = 1;
        } else if (i % 2 === 1) {
          coefficient = 4;
        } else {
          coefficient = 2;
        }
        effectiveWeight = (coefficient * h) / 3;
      } else {
        // Simpson 3/8
        if (i === 0 || i === n) {
          coefficient = 1;
        } else if (i % 3 === 0) {
          coefficient = 2;
        } else {
          coefficient = 3;
        }
        effectiveWeight = (coefficient * 3 * h) / 8;
      }

      const termContribution = ft * coefficient;
      weightedSum += termContribution;

      nodes.push({
        i,
        t: ti,
        ft,
        coefficient,
        weight: effectiveWeight,
        termContribution,
      });
    }

    const Sn =
      methodType === 'simpson13'
        ? (h / 3) * weightedSum
        : ((3 * h) / 8) * weightedSum;

    // PROCEDIMIENTO PASO A PASO DETALLADO (Manual Procedure con KaTeX)
    const manualProcedure: ProcedureStep[] = [];

    // Paso 1: Configuración
    manualProcedure.push({
      id: 'step-interval-setup',
      type: 'SYSTEM_SETUP',
      title: 'Paso 1: Parámetros del Intervalo y Tamaño de Paso (h)',
      description:
        methodType === 'simpson13'
          ? `Intervalo [${a}, ${b}], n = ${n} subintervalos equiespaciados (n es par: satisface el requisito de Simpson 1/3).`
          : `Intervalo [${a}, ${b}], n = ${n} subintervalos equiespaciados (n es múltiplo de 3: satisface el requisito de Simpson 3/8).`,
      mathExpression: `h = \\frac{b - a}{n} = \\frac{${b} - ${a}}{${n}} = ${h.toFixed(6).replace(/\\.?0+$/, '')}`,
    });

    // Paso 2: Evaluación de Nodos
    const nodesPreview = nodes
      .slice(0, 7)
      .map(
        (node) =>
          `t_{${node.i}} = ${node.t.toFixed(4).replace(/\\.?0+$/, '')} \\implies f(t_{${node.i}}) = ${node.ft.toFixed(6)}`
      )
      .join(' \\newline\n');

    manualProcedure.push({
      id: 'step-node-evaluation',
      type: 'FORMULA_DERIVATION',
      title: `Paso 2: Evaluación Funcional en los ${nodes.length} Nodos`,
      description: `Se calcula cada nodo t_i = a + i \\cdot h y se evalúa la función en cada uno de ellos.`,
      mathExpression:
        nodes.length <= 7
          ? nodesPreview
          : `${nodesPreview} \\newline\n\\vdots \\quad (\\text{${nodes.length - 7} nodos adicionales})`,
    });

    // Paso 3: Formulación
    manualProcedure.push({
      id: 'step-general-formula',
      type: 'FORMULA_DERIVATION',
      title: `Paso 3: Formulación de la Regla de ${
        methodType === 'simpson13' ? 'Simpson 1/3 Compuesto' : 'Simpson 3/8 Compuesto'
      }`,
      description:
        methodType === 'simpson13'
          ? 'Simpson 1/3 interpola parábolas de segundo orden (fórmulas cerradas de Newton-Cotes de grado 2). Requiere n par y asigna pesos [1, 4, 2, 4, ..., 2, 4, 1].'
          : 'Simpson 3/8 interpola polinomios cúbicos de tercer orden (fórmulas cerradas de Newton-Cotes de grado 3). Requiere n divisible por 3 y asigna pesos [1, 3, 3, 2, ..., 1].',
      mathExpression:
        methodType === 'simpson13'
          ? `S_{${n}} = \\frac{h}{3} \\left[ f(t_0) + 4\\sum_{i \\text{ impar}} f(t_i) + 2\\sum_{i \\text{ par int}} f(t_i) + f(t_{${n}}) \\right]`
          : `S_{${n}} = \\frac{3h}{8} \\left[ f(t_0) + 3\\sum_{i \\ne 3k} f(t_i) + 2\\sum_{i = 3k} f(t_i) + f(t_{${n}}) \\right]`,
    });

    // Paso 4: Sustitución
    let substitutionInside = '';
    if (nodes.length <= 7) {
      substitutionInside = nodes
        .map((node) => {
          if (node.coefficient === 1) {
            return `${node.ft.toFixed(6)}`;
          }
          return `${node.coefficient} \\cdot (${node.ft.toFixed(6)})`;
        })
        .join(' + ');
    } else {
      const first = `${nodes[0].ft.toFixed(6)}`;
      const second = `${nodes[1].coefficient} \\cdot (${nodes[1].ft.toFixed(6)})`;
      const last = `${nodes[n].ft.toFixed(6)}`;
      substitutionInside = `${first} + ${second} + \\cdots + ${last}`;
    }

    manualProcedure.push({
      id: 'step-numerical-substitution',
      type: 'ITERATION_SUBSTITUTION',
      title: 'Paso 4: Sustitución Numérica y Suma Ponderada',
      description:
        methodType === 'simpson13'
          ? `Sustitución de los nodos ponderados en la fórmula multiplicando por el factor h/3 = ${h}/3.`
          : `Sustitución de los nodos ponderados en la fórmula multiplicando por el factor 3h/8 = 3(${h})/8.`,
      mathExpression:
        methodType === 'simpson13'
          ? `S_{${n}} = \\frac{${h.toFixed(4).replace(/\\.?0+$/, '')}}{3} \\left[ ${substitutionInside} \\right] = ${Sn.toFixed(8)}`
          : `S_{${n}} = \\frac{3(${h.toFixed(4).replace(/\\.?0+$/, '')})}{8} \\left[ ${substitutionInside} \\right] = ${Sn.toFixed(8)}`,
    });

    // Paso 5: Resultado Final y Cotas
    const unitLabel = units?.integralUnit ? `\\text{ ${units.integralUnit}}` : '';
    let finalMath = `S_{${n}} \\approx ${Sn.toFixed(8)} ${unitLabel}`;

    if (exactValue !== undefined && Number.isFinite(exactValue)) {
      const absErr = Math.abs(exactValue - Sn);
      const relErrPct = (100 * absErr) / Math.abs(exactValue);
      finalMath += ` \\newline\n\\text{Error Absoluto Real } |E - S_{${n}}| \\approx ${absErr.toFixed(8)} ${unitLabel} \\newline\n\\text{Error Porcentual } \\varepsilon_p \\approx ${relErrPct.toFixed(6)}\\%`;
    }

    // Análisis de Cotas Teóricas
    let errorBoundAnalysis: SimpsonErrorBoundAnalysis | undefined = undefined;
    const bMinusA = b - a;

    if (methodType === 'simpson13') {
      const formulaLatex = `|E_t| \\le \\frac{(b-a)h^4}{180} M`;
      const bound045 = mFicha !== undefined
        ? calculateSimpsonErrorBound(bMinusA, h, mFicha, 'simpson13')
        : undefined;
      const boundValid = mValid !== undefined
        ? calculateSimpsonErrorBound(bMinusA, h, mValid, 'simpson13')
        : undefined;

      errorBoundAnalysis = {
        formulaLatex,
        mFicha: mFicha !== undefined && bound045 !== undefined
          ? {
              mValue: mFicha,
              bound: bound045,
              label: 'Resultado usando el dato proporcionado en la ficha',
              note: `Con M ≈ ${mFicha} kW/h⁴ sale una cota calculada de ${bound045.toFixed(6)} kWh. Nota matemática crítica: este M no acota la cuarta derivada de P(t) en [0, 6] (|P⁽⁴⁾(0)| ≈ 2.869 kW/h⁴), y el error real para n=6 (${
                exactValue ? Math.abs(exactValue - Sn).toFixed(6) : '0.024831'
              } kWh) supera esta cota. Por ello no garantiza el error máximo para esta función.`,
              isGuaranteed: false,
            }
          : undefined,
        mValid: mValid !== undefined && boundValid !== undefined
          ? {
              mValue: mValid,
              bound: boundValid,
              label: 'Cota superior matemáticamente garantizada (M válido)',
              note: `Con M = ${mValid} kW/h⁴ (cota conservadora verificable de max |P⁽⁴⁾(t)| en [0, 6]), la cota de error para n=6 es ≤ ${boundValid.toFixed(6)} kWh, garantizando rigurosamente que el error real queda acotado.`,
              isGuaranteed: true,
            }
          : undefined,
        hasValidM: mValid !== undefined,
        missingMMessage:
          mFicha === undefined && mValid === undefined
            ? 'Para funciones generales, si no se conoce una cota válida de la cuarta derivada M = max|f⁽⁴⁾(x)| en [a, b], se requiere especificar M para calcular la cota teórica.'
            : undefined,
      };

      if (bound045 !== undefined) {
        finalMath += ` \\newline\n\\text{Cota teórica (dato ficha M=0.45): } |E_t| \\le ${bound045.toFixed(6)} ${unitLabel} \\text{ (no garantizada)}`;
      }
      if (boundValid !== undefined) {
        finalMath += ` \\newline\n\\text{Cota garantizada (M=5.1311): } |E_t| \\le ${boundValid.toFixed(6)} ${unitLabel}`;
      }
    } else {
      // Simpson 3/8
      const formulaLatex = `|E_t| \\le \\frac{(b-a)h^4}{80} M`;
      const boundValid = mValid !== undefined
        ? calculateSimpsonErrorBound(bMinusA, h, mValid, 'simpson38')
        : undefined;

      errorBoundAnalysis = {
        formulaLatex,
        mValid: mValid !== undefined && boundValid !== undefined
          ? {
              mValue: mValid,
              bound: boundValid,
              label: 'Cota de error teórico Simpson 3/8',
              note: `Con M = ${mValid}, la cota teórica de Simpson 3/8 es ≤ ${boundValid.toFixed(6)}.`,
              isGuaranteed: true,
            }
          : undefined,
        hasValidM: mValid !== undefined,
        missingMMessage:
          mValid === undefined
            ? 'Para estimar la cota de error teórico de Simpson 3/8 se requiere especificar una cota M = max|f⁽⁴⁾(x)|.'
            : undefined,
      };
    }

    manualProcedure.push({
      id: 'step-final-result',
      type: 'FINAL_RESULT',
      title: 'Paso 5: Resultado Final y Estimación de Error',
      description: `El valor numérico de la integral calculada mediante ${
        methodType === 'simpson13' ? 'Simpson 1/3 Compuesto' : 'Simpson 3/8 Compuesto'
      } es:`,
      mathExpression: finalMath,
    });

    // TABLA DE ANÁLISIS DE CONVERGENCIA
    const convergenceTable: SimpsonConvergenceRow[] = [];
    if (convergenceNValues && convergenceNValues.length > 0) {
      for (const currentN of convergenceNValues) {
        try {
          if (methodType === 'simpson13' && currentN % 2 !== 0) continue;
          if (methodType === 'simpson38' && currentN % 3 !== 0) continue;

          const currentH = (b - a) / currentN;
          const currentSn =
            methodType === 'simpson13'
              ? simpson13_compuesto(expression, a, b, currentN, variableName)
              : simpson38_compuesto(expression, a, b, currentN, variableName);

          let absErr: number | undefined = undefined;
          let relErrPct: number | undefined = undefined;

          if (exactValue !== undefined && Number.isFinite(exactValue)) {
            absErr = Math.abs(exactValue - currentSn);
            relErrPct = (100 * absErr) / Math.abs(exactValue);
          }

          const bound045 = mFicha !== undefined
            ? calculateSimpsonErrorBound(bMinusA, currentH, mFicha, methodType)
            : undefined;

          const boundVal = mValid !== undefined
            ? calculateSimpsonErrorBound(bMinusA, currentH, mValid, methodType)
            : undefined;

          convergenceTable.push({
            n: currentN,
            h: currentH,
            Sn: currentSn,
            exactValue,
            absoluteError: absErr,
            relativeErrorPercent: relErrPct,
            errorBoundM045: bound045,
            errorBoundValidM: boundVal,
          });
        } catch {
          // Ignorar si un valor de n falla
        }
      }
    }

    // Puntos analíticos para la gráfica continua (120 puntos)
    const curvePoints: { x: number; y: number }[] = [];
    const sampleCount = 120;
    const dx = (b - a) / sampleCount;
    for (let k = 0; k <= sampleCount; k++) {
      const cx = a + k * dx;
      try {
        const cy = evaluateAtNode(expression, cx, variableName);
        curvePoints.push({ x: cx, y: cy });
      } catch {
        // En caso de punto singular
      }
    }

    return {
      success: true,
      methodType,
      functionExpression: expressionStr,
      variableName,
      a,
      b,
      n,
      h,
      Sn,
      units,
      nodes,
      manualProcedure,
      convergenceTable,
      exactReference:
        exactValue !== undefined
          ? {
              value: exactValue,
              expressionDescription:
                exactExpressionDescription ||
                `Integral analítica exacta = ${exactValue}`,
              isTheoreticalExact,
            }
          : undefined,
      errorBoundAnalysis,
      curvePoints,
    };
  } catch (err: unknown) {
    return {
      ...emptyResponse,
      errorMessage:
        err instanceof Error
          ? err.message
          : String(err) || 'Error desconocido al calcular la integral con Simpson.',
    };
  }
}
