import { InterpolationPoint, LagrangeBasis, LagrangeResult } from '../../domain/types';
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
    if (Number(f.d) > 10000) return num.toFixed(6).replace(/\.?0+$/, ''); // Evitar denominadores gigantes por precisión flotante
    return `${Number(f.s) * Number(f.n)}/${Number(f.d)}`;
  } catch {
    return num.toFixed(6).replace(/\.?0+$/, '');
  }
}

function buildPolynomialString(coeffs: number[], decimals = 6, useFractions = true): string {
  let str = '';
  // Eliminar ceros a la derecha (términos de mayor grado con coeficiente ~0)
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

    // Para el primer término negativo
    if (str === '' && c < 0) {
      str += `-${term}`;
    } else {
      str += `${sign}${term}`;
    }
  }
  return str || '0';
}

/**
 * Calcula el polinomio interpolador de Lagrange.
 * Complejidad de evaluación: O(n^2) según requerimiento.
 */
export function calculateLagrange(points: InterpolationPoint[], xEval?: number): LagrangeResult {
  const n = points.length;
  
  if (n < 2) {
    return { 
      success: false, 
      errorMessage: "Se requieren al menos dos puntos para realizar una interpolación.", 
      points, 
      basisPolynomials: [], 
      polynomialExpression: "", 
      simplifiedPolynomial: "", 
      polynomialCoefficients: [], 
      curvePoints: [], 
      verification: [] 
    };
  }
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(points[i].x - points[j].x) < 1e-10) {
        return { 
          success: false, 
          errorMessage: `No es posible construir el polinomio de Lagrange porque los nodos P${i} y P${j} tienen el mismo valor x = ${points[i].x}. Los valores xi deben ser distintos para evitar denominadores iguales a cero en los polinomios base.`, 
          points, 
          basisPolynomials: [], 
          polynomialExpression: "", 
          simplifiedPolynomial: "", 
          polynomialCoefficients: [], 
          curvePoints: [], 
          verification: [] 
        };
      }
    }
  }

  const basisPolynomials: LagrangeBasis[] = [];
  let polynomialCoefficients: number[] = [];

  // Construir polinomios base y coeficientes de Pn(x)
  for (let k = 0; k < n; k++) {
    const xk = points[k].x;
    const yk = points[k].y;
    
    let denominator = 1;
    const numeratorFactors: number[] = [];
    let lkCoeffs: number[] = [1];
    
    const basisExprParts = [];
    
    for (let i = 0; i < n; i++) {
      if (i !== k) {
        const xi = points[i].x;
        denominator *= (xk - xi);
        numeratorFactors.push(xi);
        
        lkCoeffs = multiplyPolynomials(lkCoeffs, [-xi, 1]); // [ -xi, 1 ] representa (x - xi)
        
        const sign = xi < 0 ? '+' : '-';
        const absXi = Math.abs(xi);
        basisExprParts.push(`((x ${sign} ${absXi}) / (${xk} ${sign} ${absXi}))`);
      }
    }
    
    const basisExpr = basisExprParts.join(' * ');
    
    const lkExpandedCoeffs = lkCoeffs.map(c => c / denominator);
    
    basisPolynomials.push({
      index: k,
      numeratorFactors,
      denominator,
      basisExpression: basisExpr,
      expandedNumerator: buildPolynomialString(lkCoeffs, 6, false) // Numerador expandido
    });
    
    const termCoeffs = lkExpandedCoeffs.map(c => c * yk);
    polynomialCoefficients = addPolynomials(polynomialCoefficients, termCoeffs);
  }

  // Evaluación manual mediante bucles anidados O(n^2) - REQUERIMIENTO OBLIGATORIO
  let interpolatedValue: number | undefined = undefined;
  if (xEval !== undefined && !isNaN(xEval)) {
    let result = 0;
    for (let k = 0; k < n; k++) {
      let Lk = 1;
      for (let i = 0; i < n; i++) {
        if (i !== k) {
          Lk *= (xEval - points[i].x) / (points[k].x - points[i].x);
        }
      }
      result += points[k].y * Lk;
    }
    interpolatedValue = result;
  }
  
  const polynomialExpression = basisPolynomials.map((b, k) => `${points[k].y} * L${k}(x)`).join(' + ');
  const simplifiedPolynomial = buildPolynomialString(polynomialCoefficients, 6, true);
  
  // Verificación Pn(xi) == yi
  const verification = points.map((p) => {
    let result = 0;
    for (let k = 0; k < n; k++) {
      let Lk = 1;
      for (let i = 0; i < n; i++) {
        if (i !== k) {
          Lk *= (p.x - points[i].x) / (points[k].x - points[i].x);
        }
      }
      result += points[k].y * Lk;
    }
    const isCorrect = Math.abs(result - p.y) < 1e-6; // Tolerancia
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
    let y = 0;
    // Evaluación por Horner
    for (let i = polynomialCoefficients.length - 1; i >= 0; i--) {
      y = y * x + polynomialCoefficients[i];
    }
    curvePoints.push({ x, y });
  }

  return {
    success: true,
    points,
    evaluationPoint: xEval,
    basisPolynomials,
    polynomialExpression,
    simplifiedPolynomial,
    polynomialCoefficients,
    interpolatedValue,
    curvePoints,
    verification
  };
}
