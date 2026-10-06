import { describe, it, expect } from 'vitest';
import { calculateNewtonInterpolation } from '../newton';

describe('Newton Interpolation (Divided Differences)', () => {
  it('should require at least two points', () => {
    const result = calculateNewtonInterpolation([{ x: 1, y: 2 }]);
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('al menos dos puntos');
  });

  it('should reject points with duplicate x values', () => {
    const result = calculateNewtonInterpolation([
      { x: 1, y: 2 },
      { x: 1, y: 5 },
    ]);
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('nodos xi repetidos');
  });

  it('should correctly solve the required session 9 activity case', () => {
    // x = [1, 2, 4, 7]
    // y = [45, 65, 110, 220]
    // Interpolate at x = 5 -> should be 139
    const points = [
      { x: 1, y: 45 },
      { x: 2, y: 65 },
      { x: 4, y: 110 },
      { x: 7, y: 220 },
    ];
    
    const result = calculateNewtonInterpolation(points, 5);
    
    expect(result.success).toBe(true);
    expect(result.interpolatedValue).toBeCloseTo(139, 5);
    
    // Check points verification P(xi) = yi
    expect(result.verification.length).toBe(4);
    expect(result.verification[0].isCorrect).toBe(true);
    expect(result.verification[0].calculated).toBeCloseTo(45, 5);
    expect(result.verification[1].calculated).toBeCloseTo(65, 5);
    expect(result.verification[2].calculated).toBeCloseTo(110, 5);
    expect(result.verification[3].calculated).toBeCloseTo(220, 5);

    // Simplified polynomial expected approx: P3(x) = 0.333333x^3 - 1.5x^2 + 22.166667x + 24
    // Checking coefficients array [a0, a1, a2, a3] -> 24, 22.166667, -1.5, 0.333333
    expect(result.polynomialCoefficients[0]).toBeCloseTo(24, 5);
    expect(result.polynomialCoefficients[1]).toBeCloseTo(133/6, 5); // 22.166666...
    expect(result.polynomialCoefficients[2]).toBeCloseTo(-1.5, 5);
    expect(result.polynomialCoefficients[3]).toBeCloseTo(1/3, 5); // 0.333333...
  });

  it('should interpolate 3 points (quadratic)', () => {
    // x = [-1, 0, 3]
    // f(x) = [15, 8, -1]
    const points = [
      { x: -1, y: 15 },
      { x: 0, y: 8 },
      { x: 3, y: -1 },
    ];
    
    const result = calculateNewtonInterpolation(points);
    expect(result.success).toBe(true);
    expect(result.verification.every(v => v.isCorrect)).toBe(true);
  });

  it('should extrapolate out of bounds', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 4 }, // y = x^2
    ];
    
    const result = calculateNewtonInterpolation(points, 3);
    expect(result.success).toBe(true);
    expect(result.interpolatedValue).toBeCloseTo(9, 5);
  });

  it('should handle unordered points gracefully', () => {
    const points = [
      { x: 2, y: 4 },
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    
    const result = calculateNewtonInterpolation(points, 3);
    expect(result.success).toBe(true);
    expect(result.interpolatedValue).toBeCloseTo(9, 5);
  });
});
