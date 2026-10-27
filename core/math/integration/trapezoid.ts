import {
  TrapezoidNode,
  ConvergenceAnalysisRow,
  TrapezoidMethodResponse,
  ProcedureStep,
} from '../../domain/types';
import { MathParser } from '../MathParser';

export interface TrapezoidCalculationOptions {
  expression: string | ((t: number) => number);
  a: number;
  b: number;
  n: number;
  variableName?: string;
  exactValue?: number;
  exactExpressionDescription?: string;
  isTheoreticalExact?: boolean;
  units?: {
    rateUnit?: string;
    integralUnit?: string;
    variableUnit?: string;
  };
  convergenceNValues?: number[];
}

/**
 * Constante del valor exacto teórico para el caso del docente (Sesión 12):
 * R(t) = 10 + 5*sen(pi*t/4) + e^(0.15t) en [0, 12] segundos.
 * D = 120 + 40/pi + (e^1.8 - 1)/0.15 ≈ 166.396711876771 Mb.
 */
export const DOCENTE_CASE_EXACT_REFERENCE = 120 + 40 / Math.PI + (Math.exp(1.8) - 1) / 0.15;

export const DOCENTE_CASE_PRESET = {
  expression: '10 + 5*sin(pi*t/4) + exp(0.15*t)',
  displayExpression: '10 + 5·sen(πt/4) + e^(0,15t)',
  a: 0,
  b: 12,
  n: 4,
  variableName: 't',
  units: {
    rateUnit: 'Mbps',
    integralUnit: 'Mb',
    variableUnit: 's',
  },
  exactValue: DOCENTE_CASE_EXACT_REFERENCE,
  exactExpressionDescription: 'D = 120 + \\frac{40}{\\pi} + \\frac{e^{1.8} - 1}{0.15} \\approx 166.396712 \\text{ Mb}',
  isTheoreticalExact: true,
};

/**
 * Evalúa una función (sea función nativa o expresión en string) de forma segura en un punto dado t.
 */
function evaluateAtNode(
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
 * Función matemática pura reutilizable para la Regla del Trapecio Compuesto.
 * 
 * Para h = (b-a)/n y t_i = a + i*h:
 * T_n = h [ f(t_0)/2 + sum_{i=1}^{n-1} f(t_i) + f(t_n)/2 ]
 * 
 * Con n = 1, corresponde a la regla del trapecio simple:
 * T_1 = ((b-a)/2) * [ f(a) + f(b) ]
 * 
 * @param f Función evaluable (función JavaScript o string matemático)
 * @param a Límite inferior de integración
 * @param b Límite superior de integración
 * @param n Número entero positivo de subintervalos
 * @param variable Nombre de la variable independiente (default: 't')
 * @returns El valor aproximado de la integral T_n
 */
export function trapecio_compuesto(
  f: ((t: number) => number) | string,
  a: number,
  b: number,
  n: number,
  variable: string = 't'
): number {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    throw new Error(
      `El número de subintervalos n debe ser un entero positivo mayor o igual a 1. Se recibió: ${n}.`
    );
  }

  if (n > 100000) {
    throw new Error(
      `El número de subintervalos n (${n}) excede el límite máximo permitido (100,000) para garantizar estabilidad computacional.`
    );
  }

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

  const h = (b - a) / n;

  // Evaluar nodos extremos
  const f0 = evaluateAtNode(f, a, variable);
  const fn = evaluateAtNode(f, b, variable);

  let innerSum = 0;
  for (let i = 1; i < n; i++) {
    const ti = a + i * h;
    const fti = evaluateAtNode(f, ti, variable);
    innerSum += fti;
  }

  const Tn = h * (f0 / 2 + innerSum + fn / 2);
  return Tn;
}

/**
 * Alias para trapecio_compuesto en convención camelCase de TypeScript.
 */
export const compositeTrapezoid = trapecio_compuesto;

/**
 * Calcula la integración numérica por trapecio compuesto con todos los detalles
 * arquitectónicos del proyecto: tabla de nodos, pasos manuales detallados (KaTeX),
 * tabla de análisis de convergencia y puntos para renderizado gráfico.
 */
export function calculateTrapezoidIntegration(
  options: TrapezoidCalculationOptions
): TrapezoidMethodResponse {
  const {
    expression,
    a,
    b,
    n,
    variableName = 't',
    exactValue,
    exactExpressionDescription,
    isTheoreticalExact = false,
    units,
    convergenceNValues = [4, 10, 50, 100, 1000],
  } = options;

  const expressionStr =
    typeof expression === 'string'
      ? expression
      : `f(${variableName})`;

  const emptyResponse: TrapezoidMethodResponse = {
    success: false,
    functionExpression: expressionStr,
    variableName,
    a,
    b,
    n,
    h: 0,
    Tn: 0,
    units,
    nodes: [],
    curvePoints: [],
    trapezoidSegments: [],
  };

  // Validaciones preliminares
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    return {
      ...emptyResponse,
      errorMessage: `El número de subintervalos n debe ser un número entero positivo (n ≥ 1). Se recibió: ${n}.`,
    };
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
      errorMessage: `Los límites de integración [a, b] deben ser valores numéricos finitos. Se recibió a=${a}, b=${b}.`,
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
    const nodes: TrapezoidNode[] = [];
    let weightedSum = 0;

    for (let i = 0; i <= n; i++) {
      const ti = a + i * h;
      const ft = evaluateAtNode(expression, ti, variableName);
      const isEndpoint = i === 0 || i === n;
      const weight = isEndpoint ? 0.5 : 1.0;
      const coefficient = isEndpoint ? 1 : 2;
      const termContribution = ft * weight;

      nodes.push({
        i,
        t: ti,
        ft,
        weight,
        coefficient,
        termContribution,
      });

      weightedSum += termContribution;
    }

    const Tn = h * weightedSum;

    // Generar pasos de resolución manual paso a paso (manualProcedure)
    const manualProcedure: ProcedureStep[] = [];

    // Paso 1: Configuración del problema y cálculo del ancho de subintervalo h
    manualProcedure.push({
      id: 'step-interval-setup',
      type: 'SYSTEM_SETUP',
      title: 'Paso 1: Parámetros del Intervalo y Tamaño de Paso (h)',
      description: `Se define el intervalo de integración [${a}, ${b}] y se divide en n = ${n} subintervalos equiespaciados.`,
      mathExpression: `h = \\frac{b - a}{n} = \\frac{${b} - ${a}}{${n}} = ${h.toFixed(6).replace(/\\.?0+$/, '')}`,
    });

    // Paso 2: Evaluación en los nodos de la partición
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
      title: `Paso 2: Evaluación de Nodos t_i (i = 0, ..., ${n})`,
      description: `Se calcula cada nodo t_i = a + i \\cdot h y se evalúa la función en cada punto. Se tienen ${nodes.length} nodos en total.`,
      mathExpression:
        nodes.length <= 7
          ? nodesPreview
          : `${nodesPreview} \\newline\n\\vdots \\quad (\\text{${nodes.length - 7} nodos adicionales calculados})`,
    });

    // Paso 3: Formulación general y relación con Newton-Cotes
    manualProcedure.push({
      id: 'step-general-formula',
      type: 'FORMULA_DERIVATION',
      title: 'Paso 3: Formulación de la Regla del Trapecio Compuesto',
      description:
        'La regla del trapecio compuesta aproxima la función por segmentos lineales entre nodos adyacentes y suma las áreas de los trapecios resultantes. Corresponde a las fórmulas cerradas de Newton-Cotes de orden 1.',
      mathExpression: `T_{${n}} = h \\left[ \\frac{f(t_0)}{2} + \\sum_{i=1}^{${n}-1} f(t_i) + \\frac{f(t_{${n}})}{2} \\right] = \\frac{h}{2} \\left[ f(t_0) + 2 \\sum_{i=1}^{${n}-1} f(t_i) + f(t_{${n}}) \\right]`,
    });

    // Paso 4: Sustitución de valores numéricos
    let substitutionInside = '';
    if (n === 1) {
      substitutionInside = `\\frac{${nodes[0].ft.toFixed(6)}}{2} + \\frac{${nodes[1].ft.toFixed(6)}}{2}`;
    } else if (n <= 5) {
      const parts = nodes.map((node, idx) => {
        if (idx === 0 || idx === n) {
          return `\\frac{${node.ft.toFixed(6)}}{2}`;
        }
        return `${node.ft.toFixed(6)}`;
      });
      substitutionInside = parts.join(' + ');
    } else {
      const first = `\\frac{${nodes[0].ft.toFixed(6)}}{2}`;
      const second = `${nodes[1].ft.toFixed(6)}`;
      const last = `\\frac{${nodes[n].ft.toFixed(6)}}{2}`;
      substitutionInside = `${first} + ${second} + \\cdots + ${last}`;
    }

    manualProcedure.push({
      id: 'step-numerical-substitution',
      type: 'ITERATION_SUBSTITUTION',
      title: 'Paso 4: Sustitución Numérica en la Fórmula',
      description: `Se multiplican los nodos interiores por peso 1.0 (o factor 2) y los nodos extremos por 0.5 (o factor 1), sumando las contribuciones ponderadas.`,
      mathExpression: `T_{${n}} = ${h.toFixed(4).replace(/\\.?0+$/, '')} \\left[ ${substitutionInside} \\right] = ${Tn.toFixed(8)}`,
    });

    // Paso 5: Resultado final y error de referencia (si existe)
    const unitLabel = units?.integralUnit ? `\\text{ ${units.integralUnit}}` : '';
    let finalMath = `T_{${n}} \\approx ${Tn.toFixed(6)} ${unitLabel}`;

    if (exactValue !== undefined && Number.isFinite(exactValue)) {
      const absErr = Math.abs(exactValue - Tn);
      const relErrPct = (100 * absErr) / Math.abs(exactValue);
      finalMath += ` \\newline\n\\text{Error Absoluto Real } |D - T_{${n}}| \\approx ${absErr.toFixed(6)} ${unitLabel} \\newline\n\\text{Error Porcentual } \\varepsilon_p \\approx ${relErrPct.toFixed(6)}\\%`;
    }

    manualProcedure.push({
      id: 'step-final-result',
      type: 'FINAL_RESULT',
      title: 'Paso 5: Resultado Final y Análisis de Error',
      description: `El valor numérico aproximado de la integral definida en [${a}, ${b}] mediante trapecio compuesto es:`,
      mathExpression: finalMath,
    });

    // Tabla de análisis de convergencia
    const convergenceTable: ConvergenceAnalysisRow[] = [];
    if (convergenceNValues && convergenceNValues.length > 0) {
      for (const currentN of convergenceNValues) {
        if (currentN >= 1 && currentN <= 100000) {
          try {
            const currentH = (b - a) / currentN;
            const currentTn = trapecio_compuesto(expression, a, b, currentN, variableName);

            let absoluteError: number | undefined = undefined;
            let relativeErrorPercent: number | undefined = undefined;

            if (exactValue !== undefined && Number.isFinite(exactValue)) {
              absoluteError = Math.abs(exactValue - currentTn);
              relativeErrorPercent = (100 * absoluteError) / Math.abs(exactValue);
            }

            convergenceTable.push({
              n: currentN,
              h: currentH,
              Tn: currentTn,
              exactValue,
              absoluteError,
              relativeErrorPercent,
            });
          } catch {
            // Ignorar si un n extremo falla
          }
        }
      }
    }

    // Puntos para trazar la curva analítica continua en la gráfica (120 puntos de muestreo)
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

    // Segmentos rectos entre nodos que forman los trapecios
    const trapezoidSegments: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      trapezoidSegments.push({
        x1: nodes[i].t,
        y1: nodes[i].ft,
        x2: nodes[i + 1].t,
        y2: nodes[i + 1].ft,
      });
    }

    return {
      success: true,
      functionExpression: expressionStr,
      variableName,
      a,
      b,
      n,
      h,
      Tn,
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
                `Integral exacta de referencia = ${exactValue}`,
              isTheoreticalExact,
            }
          : undefined,
      curvePoints,
      trapezoidSegments,
    };
  } catch (err: unknown) {
    return {
      ...emptyResponse,
      errorMessage:
        err instanceof Error ? err.message : String(err) || 'Error desconocido al calcular la integral.',
    };
  }
}
