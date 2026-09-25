import { solveJacobi, solveGaussSeidel } from '../core/math/linear-systems/iterative';
import { Matrix, Vector, IterativeMethodConfig } from '../core/domain/types';

function assertAlmostEqual(actual: number, expected: number, tolerance: number = 1e-4, message: string) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Assertion failed: ${message}. Expected ~${expected}, got ${actual}`);
  }
}

function testJacobiActividadAutonoma() {
  console.log("--- Test Jacobi: Actividad Autónoma (4x4) ---");
  const A: Matrix = [
    [10, -2, -1,  0],
    [-1,  8,  0, -2],
    [-2,  0, 12, -3],
    [ 0, -1, -2,  9]
  ];
  const B: Vector = [15, 18, 25, 20];
  const config: IterativeMethodConfig = {
    initialVector: [0, 0, 0, 0],
    tolerance: 1e-4,
    maxIterations: 100
  };

  const result = solveJacobi(A, B, config);
  
  if (!result.success) {
    throw new Error("Jacobi falló al converger.");
  }
  if (!result.convergenceAnalysis.strictlyDiagonallyDominant) {
    throw new Error("La matriz debería ser estrictamente diagonal dominante.");
  }

  console.log(`Iteraciones requeridas: ${result.iterationCount}`);
  console.log(`Solución final: [${result.solution.map(x => x.toFixed(5)).join(', ')}]`);
  console.log(`Error final: ${result.finalError.toExponential(4)}`);
  console.log(`Residuo final: ${result.finalResidual.toExponential(4)}`);

  // Expected approximate results: [2.5136, 3.3995, 3.3375, 3.3415]
  assertAlmostEqual(result.solution[0], 2.5137, 1e-3, "x1 no coincide");
  assertAlmostEqual(result.solution[1], 3.3996, 1e-3, "x2 no coincide");
  assertAlmostEqual(result.solution[2], 3.3377, 1e-3, "x3 no coincide");
  assertAlmostEqual(result.solution[3], 3.3417, 1e-3, "x4 no coincide");
  
  console.log("✓ Test Actividad Autónoma pasado exitosamente.\n");
}

function testJacobiGuiaPractica() {
  console.log("--- Test Jacobi: Guía Práctica (3x3) ---");
  const A: Matrix = [
    [5, 1, 1],
    [3, 4, 1],
    [3, 3, 6]
  ];
  const B: Vector = [5, 6, 0];
  const config: IterativeMethodConfig = {
    initialVector: [0, 0, 0],
    tolerance: 1e-4, // no importa mucho, compararemos iteraciones
    maxIterations: 4
  };

  const result = solveJacobi(A, B, config);
  
  console.log(`Resultados tras 4 iteraciones: [${result.solution.map(x => x.toFixed(5)).join(', ')}]`);
  
  // Revisamos iteración 4
  const it4 = result.iterations[4].x;
  assertAlmostEqual(it4[0], 0.8875, 1e-4, "it4 x1 no coincide");
  assertAlmostEqual(it4[1], 0.85625, 1e-4, "it4 x2 no coincide");
  assertAlmostEqual(it4[2], -1.19375, 1e-4, "it4 x3 no coincide");

  console.log("✓ Test Jacobi Guía Práctica pasado exitosamente.\n");
}

function testGaussSeidelGuiaPractica() {
  console.log("--- Test Gauss-Seidel: Guía Práctica (3x3) ---");
  const A: Matrix = [
    [10, 2, 1],
    [1, 5, 1],
    [2, 3, 10]
  ];
  const B: Vector = [7, -8, 6];
  const config: IterativeMethodConfig = {
    initialVector: [0.7, -1.6, 0.6],
    tolerance: 1e-2,
    maxIterations: 100
  };

  const result = solveGaussSeidel(A, B, config);
  
  if (!result.success) {
    throw new Error("Gauss-Seidel falló al converger.");
  }
  
  console.log(`Iteraciones requeridas: ${result.iterationCount}`);
  console.log(`Solución final: [${result.solution.map(x => x.toFixed(5)).join(', ')}]`);
  
  // The solution is [1, -2, 1]
  assertAlmostEqual(result.solution[0], 1.0, 1e-2, "x1 no coincide");
  assertAlmostEqual(result.solution[1], -2.0, 1e-2, "x2 no coincide");
  assertAlmostEqual(result.solution[2], 1.0, 1e-2, "x3 no coincide");
  
  if (!result.sassenfeldAnalysis?.guaranteesConvergence) {
    throw new Error("El criterio de Sassenfeld debería garantizar convergencia.");
  }
  console.log(`Max(beta) = ${result.sassenfeldAnalysis.betaMax.toFixed(4)}`);
  
  console.log("✓ Test Gauss-Seidel Guía Práctica pasado exitosamente.\n");
}

function testDiagonalCero() {
  console.log("--- Test: Manejo de Diagonal Cero ---");
  const A: Matrix = [
    [0, 1],
    [1, 0]
  ];
  const B: Vector = [2, 3];
  const config: IterativeMethodConfig = { initialVector: [0,0], tolerance: 1e-4, maxIterations: 10 };

  const result = solveJacobi(A, B, config);
  
  if (result.success || result.status !== 'zero_diagonal') {
    throw new Error("El método debería fallar con status 'zero_diagonal'.");
  }
  console.log("✓ Test Diagonal Cero pasado exitosamente (fallo capturado correctamente).\n");
}

async function runTests() {
  try {
    testJacobiActividadAutonoma();
    testJacobiGuiaPractica();
    testGaussSeidelGuiaPractica();
    testDiagonalCero();
    console.log("=================================================");
    console.log("🏆 TODOS LOS TESTS HAN SIDO SUPERADOS CON ÉXITO.");
    console.log("=================================================");
  } catch (error) {
    console.error("❌ ERROR EN LOS TESTS:");
    console.error(error);
    process.exit(1);
  }
}

runTests();
