/**
 * Representa un registro del historial de cálculo guardado en localStorage.
 */
export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  methodId: string;
  methodName: string;
  expression: string;
  params: {
    a?: number;
    b?: number;
    x0?: number;
    x1?: number;
    x2?: number;
    tolerance: number;
    maxIterations: number;
    decimals: number;
  };
  rootSummary?: string;
  iterationsCount?: number;
  success: boolean;
  tag?: string;
}

/**
 * Representa un Preset de Ingeniería preconfigurado de un solo clic.
 */
export interface EngineeringPreset {
  id: string;
  name: string;
  category: 'Filtro IIR' | 'Vibraciones' | 'Química' | 'Estructuras';
  description: string;
  methodId: 'polynomials' | 'muller' | 'bisection' | 'newton' | 'secant' | 'false-position' | 'fixed-point';
  expression: string;
  params: {
    x0?: number;
    x1?: number;
    x2?: number;
    a?: number;
    b?: number;
    tolerance: number;
    maxIterations: number;
    decimals: number;
  };
  expectedBehavior: string;
}
