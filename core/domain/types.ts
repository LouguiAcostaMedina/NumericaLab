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
 * Configuración de precisión decimal para cálculos y renderizado.
 */
export interface PrecisionConfig {
  decimals: number; // 6, 8, 10, 12, etc. (default: 6)
  useScientificNotation?: boolean;
}

/**
 * Resultado de validación semántica algorítmica previa a la ejecución.
 */
export interface SemanticValidationResult {
  isValid: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  details?: Record<string, any>;
}

/**
 * Recomendación automática del método numérico ideal según la función y parámetros.
 */
export interface MethodRecommendation {
  recommendedMethodId: string;
  recommendedMethodName: string;
  confidence: 'alta' | 'media' | 'baja';
  reason: string;
  alternativeMethodId?: string;
  alternativeMethodName?: string;
}

/**
 * Estructura de respuesta estándar para cualquier método numérico.
 */
export interface MethodResponse<T> {
  success: boolean;
  root?: number;
  iterations?: T[];
  errorMessage?: string;
  precisionConfig?: PrecisionConfig;
  semanticValidation?: SemanticValidationResult;
  recommendation?: MethodRecommendation;
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

/**
 * Representa un número complejo en formato rectangular (re + im*i).
 */
export interface ComplexNumber {
  re: number;
  im: number;
}

/**
 * Resultado del análisis de la Regla de los Signos de Descartes.
 */
export interface DescartesResult {
  signChangesP: number;        // Variaciones de signo en P(x)
  signChangesPNeg: number;     // Variaciones de signo en P(-x)
  maxPositiveRoots: number;    // Máximo número de raíces reales positivas
  positiveRootsPossibilities: number[]; // Posibilidades de raíces reales positivas (ej: [3, 1])
  maxNegativeRoots: number;    // Máximo número de raíces reales negativas
  negativeRootsPossibilities: number[]; // Posibilidades de raíces reales negativas (ej: [2, 0])
  zeroRootsCount: number;      // Número de raíces en x = 0
  minComplexRoots: number;     // Mínimo número de raíces complejas esperadas
  degree: number;              // Grado del polinomio
}

/**
 * Resultado del cálculo de Cotas de Lagrange y Cauchy para delimitar las raíces.
 */
export interface LagrangeBoundResult {
  lagrangeUpperReal: number;   // Cota superior de Lagrange para raíces reales positivas B = 1 + (K/an)^(1/k)
  lagrangeLowerReal: number;   // Cota inferior de Lagrange para raíces reales negativas
  cauchyRadius: number;        // Radio global de Cauchy R = 1 + max(|ai|)/|an| en el plano complejo
  globalBound: number;         // Cota global recomendada para la región del plano complejo
}

/**
 * Representa una iteración individual del método de Müller.
 */
export interface MullerIteration {
  iteration: number;
  z0: ComplexNumber;
  z1: ComplexNumber;
  z2: ComplexNumber;
  z3: ComplexNumber;
  fz3: ComplexNumber;
  a: ComplexNumber;
  b: ComplexNumber;
  c: ComplexNumber;
  discriminant: ComplexNumber;
  error: number | null;       // Error relativo porcentual aproximado (%)
}

export interface SeedsInput {
  useCustomSeeds?: boolean;
  z0?: ComplexNumber | number;
  z1?: ComplexNumber | number;
  z2?: ComplexNumber | number;
  x0?: number;
  x1?: number;
  x2?: number;
}

/**
 * Resultado individual de una raíz encontrada por Müller (con deflación).
 */
export interface PolynomialRoot {
  rootIndex: number;           // Índice de la raíz (1..n)
  root: ComplexNumber;         // Valor numérico de la raíz hallada
  magnitude: number;           // Módulo |z|
  iterations: MullerIteration[]; // Historial de iteraciones hasta la convergencia
  converged: boolean;
  deflatedCoefficients?: (number | ComplexNumber)[]; // Coeficientes tras deflación
  isPurified?: boolean;        // Indica si la raíz fue purificada sobre el polinomio original
}

/**
 * Respuesta completa de la solución de un polinomio de grado n.
 */
export interface PolynomialSolverResult {
  success: boolean;
  polynomialString: string;
  coefficients: number[];
  degree: number;
  descartes: DescartesResult;
  lagrange: LagrangeBoundResult;
  roots: PolynomialRoot[];
  errorMessage?: string;
  executionTimeMs?: number;
}

/**
 * Resultado del análisis de estabilidad para Filtro Digital IIR.
 */
export interface IIRFilterStabilityResult {
  filterName: string;
  denominatorCoefficients: number[];
  degree: number;
  poles: PolynomialRoot[];
  maxMagnitude: number;
  isStable: boolean;
  stabilityStatus: 'ESTABLE' | 'MARGINALMENTE_ESTABLE' | 'INESTABLE';
  summary: string;
  descartes: DescartesResult;
  lagrange: LagrangeBoundResult;
}

// ============================================================================
// Tipos para Sistemas de Ecuaciones Lineales
// ============================================================================

export type Matrix = number[][];
export type Vector = number[];

export interface LinearSystemValidation {
  isValid: boolean;
  message?: string;
}

export interface DoolittleFactorization {
  L: Matrix;
  U: Matrix;
}

export interface DoolittleSolution {
  Y: Vector; // Resultado intermedio de LY = B
  X: Vector; // Resultado final de UX = Y
  isFactorizationVerified: boolean; // LU ≈ A
  isSolutionVerified: boolean; // AX ≈ B
}

export interface DoolittleResult {
  success: boolean;
  originalA: Matrix;
  originalB: Vector;
  factorization?: DoolittleFactorization;
  solution?: DoolittleSolution;
  errorMessage?: string;
}
