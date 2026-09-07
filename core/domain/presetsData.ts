import { EngineeringPreset } from './history';

/**
 * Catálogo Oficial de Presets de Ingeniería y Casos de Estudio Académicos de 1-Clic.
 */
export const ENGINEERING_PRESETS: EngineeringPreset[] = [
  {
    id: 'iir-stability-main',
    name: 'Análisis de Estabilidad de Filtro IIR',
    category: 'Filtro IIR',
    description: 'Polinomio característico con polos cerca del círculo unitario. Requiere Müller con 3 semillas para analizar la estabilidad BI-BO.',
    methodId: 'polynomials',
    expression: 'x^4 + x^3 - 3*x^2 - x + 2',
    params: {
      x0: 0,
      x1: 0.5,
      x2: 1.0,
      tolerance: 0.001,
      maxIterations: 100,
      decimals: 6,
    },
    expectedBehavior: 'Determina si todos los polos del filtro yacen dentro del disco unitario |z| < 1.',
  },
  {
    id: 'butterworth-4th-preset',
    name: 'Filtro Butterworth IIR 4to Orden',
    category: 'Filtro IIR',
    description: 'Filtro digital pasa-bajas de respuesta plana en banda de paso.',
    methodId: 'polynomials',
    expression: 'z^4 - 0.6*z^3 + 0.25*z^2 - 0.2*z + 0.05',
    params: {
      x0: -0.5,
      x1: 0,
      x2: 0.5,
      tolerance: 0.0001,
      maxIterations: 100,
      decimals: 6,
    },
    expectedBehavior: 'Filtro Estable. Todas sus raíces complejas tienen magnitud |z| < 1.0.',
  },
  {
    id: 'mechanical-vibration-preset',
    name: 'Resonancia en Vibraciones Mecánicas',
    category: 'Vibraciones',
    description: 'Ecuación de frecuencias naturales en sistemas masa-resorte con amortiguamiento.',
    methodId: 'newton',
    expression: 'x^3 - 3*x^2 + 5*x - 3',
    params: {
      x0: 1.5,
      x1: 2.0,
      x2: 2.5,
      tolerance: 0.0001,
      maxIterations: 50,
      decimals: 6,
    },
    expectedBehavior: 'Calcula los modos propios de oscilación y amortiguamiento crítico.',
  },
  {
    id: 'chemical-equilibrium-preset',
    name: 'Equilibrio Químico (Reacción Reversible)',
    category: 'Química',
    description: 'Cálculo de la concentración molar en equilibrio $K_c$.',
    methodId: 'bisection',
    expression: 'x^3 - 0.5*x^2 - 1.25*x + 0.375',
    params: {
      a: 0,
      b: 1,
      x0: 0.5,
      tolerance: 0.0001,
      maxIterations: 100,
      decimals: 6,
    },
    expectedBehavior: 'Garantiza convergencia en el rango físico de concentraciones positivas [0, 1].',
  },
];
