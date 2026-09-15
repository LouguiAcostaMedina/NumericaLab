import { Matrix, Vector, LinearSystemValidation } from '../../domain/types';

/**
 * Valida un sistema de ecuaciones lineales AX = B.
 * Comprueba que:
 * 1. A y B existen
 * 2. Todos los valores son numéricos y finitos
 * 3. A es una matriz cuadrada (todas las filas tienen la misma longitud n, y hay n filas)
 * 4. B tiene exactamente n elementos
 */
export function validateSquareSystem(A: Matrix, B: Vector): LinearSystemValidation {
  if (!A || !B) {
    return { isValid: false, message: 'La matriz A o el vector B no están definidos.' };
  }

  const numRowsA = A.length;
  if (numRowsA === 0) {
    return { isValid: false, message: 'La matriz A está vacía.' };
  }

  const numColsA = A[0].length;
  if (numRowsA !== numColsA) {
    return { isValid: false, message: `La matriz A no es cuadrada. Dimensiones actuales: ${numRowsA}x${numColsA}.` };
  }

  if (B.length !== numRowsA) {
    return { isValid: false, message: `El vector B tiene longitud ${B.length}, pero debería tener ${numRowsA} para coincidir con la matriz A.` };
  }

  for (let i = 0; i < numRowsA; i++) {
    if (A[i].length !== numColsA) {
      return { isValid: false, message: `La matriz A es irregular. La fila ${i + 1} no tiene ${numColsA} elementos.` };
    }

    for (let j = 0; j < numColsA; j++) {
      const val = A[i][j];
      if (typeof val !== 'number' || !Number.isFinite(val) || Number.isNaN(val)) {
        return { isValid: false, message: `Valor inválido en A[${i}][${j}]. Asegúrate de ingresar números finitos.` };
      }
    }
  }

  for (let i = 0; i < B.length; i++) {
    const val = B[i];
    if (typeof val !== 'number' || !Number.isFinite(val) || Number.isNaN(val)) {
      return { isValid: false, message: `Valor numérico inválido en B[${i}]. Asegúrate de ingresar números finitos.` };
    }
  }

  return { isValid: true };
}
