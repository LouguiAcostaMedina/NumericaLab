import { describe, it, expect } from 'vitest';
import { calculateLagrange } from '../lagrange';

describe('Interpolación de Lagrange', () => {
  it('Debe interpolar el caso de la actividad autónoma (Sesión 8) correctamente', () => {
    const points = [
      { x: 2, y: 150 },
      { x: 4, y: 85 },
      { x: 8, y: 50 },
      { x: 12, y: 70 }
    ];
    const result = calculateLagrange(points, 6);
    
    expect(result.success).toBe(true);
    // P3(6) = 55.25
    expect(Math.abs((result.interpolatedValue ?? 0) - 55.25) < 1e-6).toBe(true);
    
    // coeficientes esperados:
    // a3 = -43/192 approx -0.22395833
    // a2 = 227/32 approx 7.09375
    // a1 = -1651/24 approx -68.7916666
    // a0 = 261
    const coeffs = result.polynomialCoefficients;
    expect(Math.abs(coeffs[3] - (-43/192)) < 1e-6).toBe(true);
    expect(Math.abs(coeffs[2] - (227/32)) < 1e-6).toBe(true);
    expect(Math.abs(coeffs[1] - (-1651/24)) < 1e-6).toBe(true);
    expect(Math.abs(coeffs[0] - 261) < 1e-6).toBe(true);
  });

  it('Debe verificar la propiedad de interpolación (Pn(xi) = yi)', () => {
    const points = [
      { x: -1, y: 15 },
      { x: 0, y: 8 },
      { x: 3, y: -1 }
    ];
    const result = calculateLagrange(points);
    expect(result.success).toBe(true);
    
    for (const v of result.verification) {
      expect(v.isCorrect).toBe(true);
    }
    
    // polinomio esperado P2(x) = x^2 - 6x + 8
    const coeffs = result.polynomialCoefficients;
    expect(Math.abs(coeffs[2] - 1) < 1e-6).toBe(true);
    expect(Math.abs(coeffs[1] - (-6)) < 1e-6).toBe(true);
    expect(Math.abs(coeffs[0] - 8) < 1e-6).toBe(true);
  });

  it('Debe rechazar puntos con x repetidos', () => {
    const points = [
      { x: 2, y: 150 },
      { x: 4, y: 85 },
      { x: 4, y: 50 },
      { x: 12, y: 70 }
    ];
    const result = calculateLagrange(points, 6);
    expect(result.success).toBe(false);
    expect(result.errorMessage?.includes('mismo valor x')).toBe(true);
  });

  it('Debe funcionar con menos de 3 puntos (Interpolación lineal)', () => {
    const points = [
      { x: 1, y: 10 },
      { x: 3, y: 20 }
    ];
    const result = calculateLagrange(points, 2);
    expect(result.success).toBe(true);
    expect(Math.abs((result.interpolatedValue ?? 0) - 15) < 1e-6).toBe(true);
  });
});
