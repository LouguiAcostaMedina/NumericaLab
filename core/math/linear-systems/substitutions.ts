import { Matrix, Vector } from '../../domain/types';

/**
 * Resuelve LY = B mediante sustitución hacia adelante.
 * L debe ser una matriz triangular inferior con unos en la diagonal principal.
 */
export function forwardSubstitution(L: Matrix, B: Vector): Vector {
  const n = L.length;
  const Y: Vector = Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) {
      sum += L[i][j] * Y[j];
    }
    // Asumimos l_ii = 1 para Doolittle, pero para ser genérico (ej. Cholesky):
    Y[i] = (B[i] - sum) / L[i][i];
  }

  return Y;
}

/**
 * Resuelve UX = Y mediante sustitución hacia atrás.
 * U debe ser una matriz triangular superior.
 */
export function backwardSubstitution(U: Matrix, Y: Vector): Vector {
  const n = U.length;
  const X: Vector = Array(n).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += U[i][j] * X[j];
    }
    X[i] = (Y[i] - sum) / U[i][i];
  }

  return X;
}
