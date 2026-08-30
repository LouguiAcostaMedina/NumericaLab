/**
 * Representa el resultado de una iteración individual en el método de Bisección.
 */
export interface BisectionIteration {
  iteration: number;
  a: number;
  b: number;
  xr: number;      // Punto medio (aproximación de la raíz)
  fa: number;      // f(a)
  fb: number;      // f(b)
  fxr: number;     // f(xr)
  error: number | null; // Error relativo porcentual aproximado (%)
}

/**
 * Representa el resultado de una iteración individual en el método de Newton-Raphson.
 */
export interface NewtonIteration {
  iteration: number;
  xi: number;      // Valor actual de x
  fxi: number;     // f(xi)
  dfxi: number;    // f'(xi) (derivada de f evaluada en xi)
  xiNext: number;  // Siguiente aproximación x_{i+1}
  error: number | null; // Error relativo porcentual aproximado (%)
}

/**
 * Estructura de respuesta estándar para cualquier método numérico.
 */
export interface MethodResponse<T> {
  success: boolean;
  root?: number;
  iterations?: T[];
  errorMessage?: string;
}

/**
 * Representa el resultado de una iteración individual en el método de Falsa Posición.
 */
export interface FalsePositionIteration {
  iteration: number;
  xl: number;      // Límite inferior (a)
  xu: number;      // Límite superior (b)
  xr: number;      // Raíz estimada por falsa posición
  fxl: number;     // f(xl)
  fxu: number;     // f(xu)
  fxr: number;     // f(xr)
  error: number | null; // Error relativo porcentual aproximado (%)
}

/**
 * Representa el resultado de una iteración individual en el método de Punto Fijo.
 */
export interface FixedPointIteration {
  iteration: number;
  xi: number;      // Valor actual de x
  gxi: number;     // g(xi) (siguiente aproximación)
  error: number | null; // Error relativo porcentual aproximado (%)
}

/**
 * Representa el resultado de una iteración individual en el método de la Secante.
 */
export interface SecantIteration {
  iteration: number;
  xiMinus1: number; // x_{i-1}
  xi: number;       // x_i
  fxiMinus1: number; // f(x_{i-1})
  fxi: number;       // f(x_i)
  xiNext: number;    // x_{i+1} (siguiente aproximación)
  error: number | null; // Error relativo porcentual aproximado (%)
}
