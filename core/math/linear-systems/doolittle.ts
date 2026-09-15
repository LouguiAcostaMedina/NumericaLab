import { Matrix, Vector, DoolittleFactorization, DoolittleSolution, DoolittleResult } from '../../domain/types';
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

    return {
      success: true,
      originalA: A,
      originalB: B,
      factorization,
      solution
    };
  } catch (error: any) {
    return {
      success: false,
      originalA: A,
      originalB: B,
      errorMessage: error.message || 'Error desconocido durante la factorización de Doolittle.'
    };
  }
}
