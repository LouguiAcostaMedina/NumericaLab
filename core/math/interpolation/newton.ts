import { InterpolationPoint, NewtonInterpolationResult, ProcedureStep } from '../../domain/types';
import * as math from 'mathjs';

function multiplyPolynomials(p1: number[], p2: number[]): number[] {
  if (p1.length === 0 || p2.length === 0) return [];
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] += p1[i] * p2[j];
    }
  }
  return result;
}

function addPolynomials(p1: number[], p2: number[]): number[] {
  const maxLength = Math.max(p1.length, p2.length);
  const result = new Array(maxLength).fill(0);
  for (let i = 0; i < maxLength; i++) {
    const val1 = i < p1.length ? p1[i] : 0;
    const val2 = i < p2.length ? p2[i] : 0;
    result[i] = val1 + val2;
  }
  return result;
}

function toFractionStr(num: number): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f = math.fraction(num) as any;
    if (Number(f.d) === 1) return (Number(f.s) * Number(f.n)).toString();
    if (Number(f.d) > 10000) return num.toFixed(6).replace(/\.?0+$/, ''); 
    return `${Number(f.s) * Number(f.n)}/${Number(f.d)}`;
  } catch {
    return num.toFixed(6).replace(/\.?0+$/, '');
  }
}

function buildPolynomialString(coeffs: number[], decimals = 6, useFractions = true): string {
  let str = '';
  let maxDegree = coeffs.length - 1;
  while (maxDegree > 0 && Math.abs(coeffs[maxDegree]) < 1e-10) {
    maxDegree--;
  }

  for (let i = maxDegree; i >= 0; i--) {
    const c = coeffs[i];
    if (Math.abs(c) < 1e-10 && maxDegree > 0) continue;
    
    const sign = c < 0 ? ' - ' : (str ? ' + ' : '');
    const absC = Math.abs(c);
    
    let coeffStr = '';
    if (absC !== 1 || i === 0) {
      coeffStr = useFractions ? toFractionStr(absC) : absC.toFixed(decimals).replace(/\.?0+$/, '');
    }

    let term = '';
    if (i === 0) {
      term = (absC === 1 && coeffStr === '') ? '1' : coeffStr;
    } else if (i === 1) {
      term = `${coeffStr}x`;
    } else {
      term = `${coeffStr}x^${i}`;
    }

    if (str === '' && c < 0) {
      str += `-${term}`;
    } else {
      str += `${sign}${term}`;
    }
  }
  return str || '0';
}

/**
 * Calcula el polinomio interpolador de Newton mediante diferencias divididas.
 */
export function calculateNewtonInterpolation(points: InterpolationPoint[], xEval?: number): NewtonInterpolationResult {
  const n = points.length;
  
  const emptyResult = {
    success: false,
    points,
    dividedDifferencesTable: [],
    coefficients: [],
    polynomialExpression: "",
    simplifiedPolynomial: "",
    polynomialCoefficients: [],
    curvePoints: [],
    verification: []
  };

  if (n < 2) {
    return { 
      ...emptyResult,
      errorMessage: "Se requieren al menos dos puntos para realizar una interpolación.", 
    };
  }
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(points[i].x - points[j].x) < 1e-10) {
        return { 
          ...emptyResult,
          errorMessage: `No es posible construir el polinomio de Newton porque existen nodos xi repetidos (P${i} y P${j} tienen x = ${points[i].x}).`, 
        };
      }
    }
  }

  // Construir la tabla de diferencias divididas
  // table[j][i] será la j-ésima diferencia dividida comenzando en el índice i
  const table: number[][] = [];
  table[0] = points.map(p => p.y); // Fila 0: f(xi)

  for (let j = 1; j < n; j++) {
    table[j] = [];
    for (let i = 0; i < n - j; i++) {
      table[j][i] = (table[j - 1][i + 1] - table[j - 1][i]) / (points[i + j].x - points[i].x);
    }
  }

  // Los coeficientes son el primer elemento de cada fila de diferencias divididas
  const coefficients = table.map(row => row[0]);

  // Construir la expresión del polinomio de Newton y el polinomio expandido
  let polynomialExpression = `${coefficients[0].toPrecision(6)}`;
  let expandedCoeffs: number[] = [coefficients[0]];

  for (let j = 1; j < n; j++) {
    const c = coefficients[j];
    let termExpr = '';
    
    // (x - x0)(x - x1)...
    let currentTermPoly: number[] = [1];
    for (let i = 0; i < j; i++) {
      const xi = points[i].x;
      const sign = xi < 0 ? '+' : '-';
      const absXi = Math.abs(xi);
      termExpr += `(x ${sign} ${absXi})`;
      
      currentTermPoly = multiplyPolynomials(currentTermPoly, [-xi, 1]);
    }

    const cStr = c < 0 ? `- ${Math.abs(c).toPrecision(6)}` : `+ ${c.toPrecision(6)}`;
    polynomialExpression += ` ${cStr}${termExpr}`;

    const termPolyScaled = currentTermPoly.map(coeff => coeff * c);
    expandedCoeffs = addPolynomials(expandedCoeffs, termPolyScaled);
  }

  const simplifiedPolynomial = buildPolynomialString(expandedCoeffs, 6, true);

  // Evaluación
  let interpolatedValue: number | undefined = undefined;
  if (xEval !== undefined && !isNaN(xEval)) {
    // Evaluar usando forma de Newton para mayor precisión (o Horner invertido)
    let result = coefficients[n - 1];
    for (let j = n - 2; j >= 0; j--) {
      result = result * (xEval - points[j].x) + coefficients[j];
    }
    interpolatedValue = result;
  }
  
  // Verificación Pn(xi) == yi
  const verification = points.map((p) => {
    let result = coefficients[n - 1];
    for (let j = n - 2; j >= 0; j--) {
      result = result * (p.x - points[j].x) + coefficients[j];
    }
    const isCorrect = Math.abs(result - p.y) < 1e-6;
    return { point: p, calculated: result, isCorrect };
  });

  // Generación de puntos para la gráfica
  const curvePoints: InterpolationPoint[] = [];
  const minX = Math.min(...points.map(p => p.x), xEval !== undefined ? xEval : Infinity);
  const maxX = Math.max(...points.map(p => p.x), xEval !== undefined ? xEval : -Infinity);
  
  const range = Math.max(maxX - minX, 1);
  const startX = minX - range * 0.15;
  const endX = maxX + range * 0.15;
  const steps = 150;
  
  for (let s = 0; s <= steps; s++) {
    const x = startX + (s / steps) * (endX - startX);
    let y = coefficients[n - 1];
    for (let j = n - 2; j >= 0; j--) {
      y = y * (x - points[j].x) + coefficients[j];
    }
    curvePoints.push({ x, y });
  }

  const manualProcedure: ProcedureStep[] = [];
  
  // Construcción de la matriz visual para la tabla
  // Rellenar con NaN o 0 para que sea rectangular
  const matrixData: number[][] = [];
  for (let i = 0; i < n; i++) {
    const rowData: number[] = [points[i].x];
    for (let j = 0; j < n; j++) {
      if (table[j] && table[j][i] !== undefined) {
        rowData.push(table[j][i]);
      } else {
        // En ProcedureStepRenderer podemos manejar NaN como celda vacía o ignorarlo
        rowData.push(NaN); 
      }
    }
    matrixData.push(rowData);
  }

  manualProcedure.push({
    id: 'newton-1',
    type: 'MATRIX_CALCULATION',
    title: 'Paso 1: Tabla de Diferencias Divididas',
    description: 'Calculamos las diferencias divididas sucesivas. La primera columna es x, la segunda es f(x). Los coeficientes del polinomio corresponden a la primera fila (o diagonal superior).',
    matrixData: matrixData
  });

  manualProcedure.push({
    id: 'newton-2',
    type: 'FORMULA_DERIVATION',
    title: 'Paso 2: Construcción del Polinomio P(x)',
    description: 'Tomamos los coeficientes de la primera fila de la tabla y formamos el polinomio de Newton multiplicando por los términos (x - xi).',
    mathExpression: `P_{${n-1}}(x) = ${polynomialExpression}`
  });

  manualProcedure.push({
    id: 'newton-3',
    type: 'FINAL_RESULT',
    title: 'Paso 3: Polinomio Simplificado',
    description: 'Se desarrolla el producto y se suman los términos semejantes para presentar la forma canónica del polinomio.',
    mathExpression: `P_{${n-1}}(x) = ${simplifiedPolynomial}`
  });

  if (interpolatedValue !== undefined && xEval !== undefined) {
    manualProcedure.push({
      id: 'newton-4',
      type: 'ITERATION_SUBSTITUTION',
      title: 'Paso 4: Evaluación Numérica',
      description: `Sustituimos el punto x = ${xEval} en el polinomio para obtener el valor interpolado.`,
      mathExpression: `P_{${n-1}}(${xEval}) = ${interpolatedValue}`
    });
  }

  return {
    success: true,
    points,
    evaluationPoint: xEval,
    dividedDifferencesTable: table,
    coefficients,
    polynomialExpression,
    simplifiedPolynomial,
    polynomialCoefficients: expandedCoeffs,
    interpolatedValue,
    curvePoints,
    verification,
    manualProcedure
  };
}
