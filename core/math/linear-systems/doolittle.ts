import { Matrix, Vector, DoolittleFactorization, DoolittleSolution, DoolittleResult, ProcedureStep } from '../../domain/types';
import { createIdentityMatrix, multiplyMatrix, multiplyMatrixVector, areMatricesAlmostEqual, areVectorsAlmostEqual } from './matrix-utils';
import { forwardSubstitution, backwardSubstitution } from './substitutions';

const PIVOT_TOLERANCE = 1e-12;
const VERIFICATION_TOLERANCE = 1e-8;

/**
 * Realiza la factorización LU de la matriz A utilizando el método de Doolittle.
 * A = LU donde L es triangular inferior con 1s en la diagonal, y U es triangular superior.
 * @param A Matriz cuadrada n x n a factorizar.
 */
export function factorizeDoolittle(A: Matrix): DoolittleFactorization {
  const n = A.length;
  const L = createIdentityMatrix(n);
  const U = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    // Calcular la fila i de U
    for (let j = i; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < i; k++) {
        sum += L[i][k] * U[k][j];
      }
      U[i][j] = A[i][j] - sum;
    }

    // Calcular la columna i de L
    for (let j = i + 1; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < i; k++) {
        sum += L[j][k] * U[k][i];
      }

      if (Math.abs(U[i][i]) < PIVOT_TOLERANCE) {
        throw new Error(`La factorización LU mediante Doolittle sin pivoteo no puede continuar porque se encontró un pivote nulo o numéricamente cercano a cero en la posición U[${i}][${i}].`);
      }

      L[j][i] = (A[j][i] - sum) / U[i][i];
    }
  }

  return { L, U };
}

/**
 * Resuelve el sistema AX = B asumiendo que A ya fue factorizada en L y U.
 * Reutiliza las matrices L y U para calcular un nuevo vector B.
 */
export function solveWithLU(L: Matrix, U: Matrix, B: Vector, originalA: Matrix): DoolittleSolution {
  // 1. Sustitución hacia adelante: LY = B
  const Y = forwardSubstitution(L, B);

  // 2. Sustitución hacia atrás: UX = Y
  const X = backwardSubstitution(U, Y);

  // 3. Verificaciones
  const LU = multiplyMatrix(L, U);
  const isFactorizationVerified = areMatricesAlmostEqual(originalA, LU, VERIFICATION_TOLERANCE);

  const AX = multiplyMatrixVector(originalA, X);
  const isSolutionVerified = areVectorsAlmostEqual(B, AX, VERIFICATION_TOLERANCE);

  return {
    Y,
    X,
    isFactorizationVerified,
    isSolutionVerified
  };
}

/**
 * Orquesta el proceso completo de Doolittle para un sistema AX = B.
 * Factoriza A y luego resuelve para B.
 */
export function solveDoolittle(A: Matrix, B: Vector): DoolittleResult {
  try {
    const factorization = factorizeDoolittle(A);
    const solution = solveWithLU(factorization.L, factorization.U, B, A);

    const manualProcedure: ProcedureStep[] = [
      {
        id: 'doolittle-1',
        type: 'MATRIX_CALCULATION',
        title: 'Paso 1: Construcción de Matriz L',
        description: 'La matriz triangular inferior L se construye colocando 1s en la diagonal y los multiplicadores m_{ij} correspondientes a las operaciones de reducción.',
        matrixData: factorization.L
      },
      {
        id: 'doolittle-2',
        type: 'MATRIX_CALCULATION',
        title: 'Paso 2: Construcción de Matriz U',
        description: 'La matriz triangular superior U es el resultado de la reducción gaussiana directa (sin escalado).',
        matrixData: factorization.U
      },
      {
        id: 'doolittle-3',
        type: 'ITERATION_SUBSTITUTION',
        title: 'Paso 3: Sustitución Hacia Adelante (LY = B)',
        description: `Resolvemos el sistema LY = B para hallar el vector intermedio Y. Resultado: Y = [${solution.Y.map(y => y.toFixed(4)).join(', ')}]`,
        mathExpression: 'L \\cdot Y = B'
      },
      {
        id: 'doolittle-4',
        type: 'ITERATION_SUBSTITUTION',
        title: 'Paso 4: Sustitución Hacia Atrás (UX = Y)',
        description: `Resolvemos el sistema UX = Y para hallar el vector solución X. Resultado: X = [${solution.X.map(x => x.toFixed(4)).join(', ')}]`,
        mathExpression: 'U \\cdot X = Y'
      }
    ];

    return {
      success: true,
      originalA: A,
      originalB: B,
      factorization,
      solution,
      manualProcedure
    };
  } catch (error: unknown) {
    return {
      success: false,
      originalA: A,
      originalB: B,
      errorMessage: (error instanceof Error ? error.message : String(error)) || 'Error desconocido durante la factorización de Doolittle.'
    };
  }
}
