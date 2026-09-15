import { Matrix, Vector } from '../../domain/types';

/**
 * Multiplica una matriz A (m x n) por una matriz B (n x p)
 * @returns Matriz resultante C (m x p)
 */
export function multiplyMatrix(A: Matrix, B: Matrix): Matrix {
  const m = A.length;
  const n = A[0].length;
  const p = B[0].length;

  if (B.length !== n) {
    throw new Error('El número de columnas de A debe ser igual al número de filas de B para multiplicar matrices.');
  }

  const result: Matrix = Array(m).fill(0).map(() => Array(p).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

/**
 * Multiplica una matriz A (m x n) por un vector V (n x 1)
 * @returns Vector resultante (m x 1)
 */
export function multiplyMatrixVector(A: Matrix, V: Vector): Vector {
  const m = A.length;
  const n = A[0].length;

  if (V.length !== n) {
    throw new Error('El número de columnas de la matriz debe coincidir con el tamaño del vector.');
  }

  const result: Vector = Array(m).fill(0);

  for (let i = 0; i < m; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += A[i][j] * V[j];
    }
    result[i] = sum;
  }

  return result;
}

/**
 * Verifica si dos matrices son numéricamente casi iguales dadas una tolerancia.
 */
export function areMatricesAlmostEqual(A: Matrix, B: Matrix, tolerance: number = 1e-10): boolean {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    return false;
  }

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0].length; j++) {
      if (Math.abs(A[i][j] - B[i][j]) > tolerance) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Verifica si dos vectores son numéricamente casi iguales dadas una tolerancia.
 */
export function areVectorsAlmostEqual(V1: Vector, V2: Vector, tolerance: number = 1e-10): boolean {
  if (V1.length !== V2.length) return false;

  for (let i = 0; i < V1.length; i++) {
    if (Math.abs(V1[i] - V2[i]) > tolerance) {
      return false;
    }
  }

  return true;
}

/**
 * Crea una matriz identidad de tamaño n x n.
 */
export function createIdentityMatrix(n: number): Matrix {
  const identity: Matrix = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    identity[i][i] = 1;
  }
  return identity;
}
