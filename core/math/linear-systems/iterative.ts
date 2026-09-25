import {
  Matrix,
  Vector,
  IterativeMethodConfig,
  IterativeResult,
  IterationRecord,
  ConvergenceAnalysis,
  SassenfeldAnalysis,
  EDDRowAnalysis,
} from '../../domain/types';

const ZERO_TOLERANCE = 1e-12;

/**
 * Calculates the infinity norm of the residual vector r = Ax - b
 */
export function calculateResidualNorm(A: Matrix, x: Vector, b: Vector): number {
  const n = A.length;
  let maxResidual = 0;
  for (let i = 0; i < n; i++) {
    let ax_i = 0;
    for (let j = 0; j < n; j++) {
      ax_i += A[i][j] * x[j];
    }
    const residual = Math.abs(ax_i - b[i]);
    if (residual > maxResidual) {
      maxResidual = residual;
    }
  }
  return maxResidual;
}

/**
 * Analyzes the Strictly Diagonally Dominant (EDD) condition of a matrix A.
 */
export function analyzeConvergence(A: Matrix): ConvergenceAnalysis {
  const n = A.length;
  let strictlyDiagonallyDominant = true;
  const rows: EDDRowAnalysis[] = [];

  for (let i = 0; i < n; i++) {
    const diagonalValue = Math.abs(A[i][i]);
    let offDiagonalSum = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        offDiagonalSum += Math.abs(A[i][j]);
      }
    }
    
    // Para EDD, |a_ii| > sum(|a_ij|)
    // Usamos una tolerancia para evitar problemas numéricos al comparar flotantes
    const satisfies = diagonalValue > offDiagonalSum + ZERO_TOLERANCE;
    if (!satisfies) {
      strictlyDiagonallyDominant = false;
    }

    rows.push({
      row: i,
      diagonalValue,
      offDiagonalSum,
      satisfies
    });
  }

  return {
    strictlyDiagonallyDominant,
    rows,
    convergenceGuaranteedByEDD: strictlyDiagonallyDominant,
    message: strictlyDiagonallyDominant 
      ? "La matriz es estrictamente diagonal dominante por filas. Esta condición es suficiente para garantizar la convergencia."
      : "⚠ La matriz no es estrictamente diagonal dominante. Por este criterio no puede garantizarse la convergencia, aunque el método todavía podría converger."
  };
}

/**
 * Calculates the Sassenfeld criterion for Gauss-Seidel convergence.
 */
export function calculateSassenfeld(A: Matrix): SassenfeldAnalysis {
  const n = A.length;
  const betas: number[] = new Array(n).fill(0);
  let betaMax = 0;

  for (let i = 0; i < n; i++) {
    const a_ii = Math.abs(A[i][i]);
    if (a_ii < ZERO_TOLERANCE) {
      return {
        betas: [],
        betaMax: Infinity,
        guaranteesConvergence: false,
        message: "No se puede calcular el criterio de Sassenfeld debido a un cero en la diagonal."
      };
    }

    let currentBetaSum = 0;
    for (let j = 0; j < n; j++) {
      if (j < i) {
        currentBetaSum += Math.abs(A[i][j]) * betas[j];
      } else if (j > i) {
        currentBetaSum += Math.abs(A[i][j]);
      }
    }
    
    betas[i] = currentBetaSum / a_ii;
    if (betas[i] > betaMax) {
      betaMax = betas[i];
    }
  }

  const guaranteesConvergence = betaMax < 1;

  return {
    betas,
    betaMax,
    guaranteesConvergence,
    message: guaranteesConvergence
      ? "✓ El criterio de Sassenfeld garantiza convergencia para Gauss-Seidel."
      : "El criterio de Sassenfeld no permite garantizar la convergencia."
  };
}

function calculateRelativeError(newVal: number, oldVal: number): number {
  if (Math.abs(newVal) > ZERO_TOLERANCE) {
    return Math.abs(newVal - oldVal) / Math.abs(newVal);
  }
  if (Math.abs(newVal) <= ZERO_TOLERANCE && Math.abs(oldVal) <= ZERO_TOLERANCE) {
    return 0;
  }
  return Infinity;
}

/**
 * Solves a linear system using the Jacobi method.
 */
export function solveJacobi(A: Matrix, b: Vector, config: IterativeMethodConfig): IterativeResult {
  const n = A.length;
  const convergence = analyzeConvergence(A);
  
  let currentX = [...config.initialVector];
  const iterations: IterationRecord[] = [];
  
  iterations.push({
    iteration: 0,
    x: [...currentX],
    relativeErrors: new Array(n).fill(0),
    maxRelativeError: 0,
    residualNorm: calculateResidualNorm(A, currentX, b)
  });

  for (let k = 1; k <= config.maxIterations; k++) {
    const nextX = new Array(n).fill(0);
    const relativeErrors = new Array(n).fill(0);
    let maxRelativeError = 0;
    let hasInvalidNumber = false;

    for (let i = 0; i < n; i++) {
      const a_ii = A[i][i];
      if (Math.abs(a_ii) <= ZERO_TOLERANCE) {
        return {
          success: false,
          method: 'jacobi',
          originalA: A,
          originalB: b,
          config,
          convergenceAnalysis: convergence,
          iterations,
          iterationCount: k - 1,
          finalError: iterations[k - 1].maxRelativeError,
          finalResidual: iterations[k - 1].residualNorm || 0,
          solution: currentX,
          status: 'zero_diagonal',
          errorMessage: `No es posible despejar x${i + 1} porque el coeficiente diagonal a${i + 1}${i + 1} es cero o numéricamente cercano a cero. Sugerencia: Reordena las ecuaciones si existe otra disposición que produzca una diagonal válida.`
        };
      }

      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          sum += A[i][j] * currentX[j];
        }
      }

      nextX[i] = (b[i] - sum) / a_ii;
      
      if (!Number.isFinite(nextX[i]) || Number.isNaN(nextX[i])) {
        hasInvalidNumber = true;
      } else {
        relativeErrors[i] = calculateRelativeError(nextX[i], currentX[i]);
        if (relativeErrors[i] > maxRelativeError) {
          maxRelativeError = relativeErrors[i];
        }
      }
    }

    if (hasInvalidNumber || !Number.isFinite(maxRelativeError)) {
      return {
        success: false,
        method: 'jacobi',
        originalA: A,
        originalB: b,
        config,
        convergenceAnalysis: convergence,
        iterations,
        iterationCount: k - 1,
        finalError: iterations[k - 1].maxRelativeError,
        finalResidual: iterations[k - 1].residualNorm || 0,
        solution: currentX,
        status: 'numerical_error',
        errorMessage: `El proceso presentó inestabilidad numérica en la iteración ${k}.`
      };
    }

    const residualNorm = calculateResidualNorm(A, nextX, b);
    iterations.push({
      iteration: k,
      x: [...nextX],
      relativeErrors,
      maxRelativeError,
      residualNorm
    });

    currentX = nextX;

    if (maxRelativeError < config.tolerance) {
      return {
        success: true,
        method: 'jacobi',
        originalA: A,
        originalB: b,
        config,
        convergenceAnalysis: convergence,
        iterations,
        iterationCount: k,
        finalError: maxRelativeError,
        finalResidual: residualNorm,
        solution: currentX,
        status: 'converged'
      };
    }
  }

  return {
    success: true,
    method: 'jacobi',
    originalA: A,
    originalB: b,
    config,
    convergenceAnalysis: convergence,
    iterations,
    iterationCount: config.maxIterations,
    finalError: iterations[iterations.length - 1].maxRelativeError,
    finalResidual: iterations[iterations.length - 1].residualNorm || 0,
    solution: currentX,
    status: 'max_iterations',
    errorMessage: "Se alcanzó el número máximo de iteraciones sin satisfacer la tolerancia indicada."
  };
}

/**
 * Solves a linear system using the Gauss-Seidel method.
 */
export function solveGaussSeidel(A: Matrix, b: Vector, config: IterativeMethodConfig): IterativeResult {
  const n = A.length;
  const convergence = analyzeConvergence(A);
  const sassenfeld = calculateSassenfeld(A);
  
  const currentX = [...config.initialVector];
  const iterations: IterationRecord[] = [];
  
  iterations.push({
    iteration: 0,
    x: [...currentX],
    relativeErrors: new Array(n).fill(0),
    maxRelativeError: 0,
    residualNorm: calculateResidualNorm(A, currentX, b)
  });

  for (let k = 1; k <= config.maxIterations; k++) {
    const previousX = [...currentX];
    const relativeErrors = new Array(n).fill(0);
    let maxRelativeError = 0;
    let hasInvalidNumber = false;

    for (let i = 0; i < n; i++) {
      const a_ii = A[i][i];
      if (Math.abs(a_ii) <= ZERO_TOLERANCE) {
        return {
          success: false,
          method: 'gauss-seidel',
          originalA: A,
          originalB: b,
          config,
          convergenceAnalysis: convergence,
          sassenfeldAnalysis: sassenfeld,
          iterations,
          iterationCount: k - 1,
          finalError: iterations[k - 1].maxRelativeError,
          finalResidual: iterations[k - 1].residualNorm || 0,
          solution: previousX,
          status: 'zero_diagonal',
          errorMessage: `No es posible despejar x${i + 1} porque el coeficiente diagonal a${i + 1}${i + 1} es cero o numéricamente cercano a cero. Sugerencia: Reordena las ecuaciones si existe otra disposición que produzca una diagonal válida.`
        };
      }

      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          sum += A[i][j] * currentX[j];
        }
      }

      currentX[i] = (b[i] - sum) / a_ii;
      
      if (!Number.isFinite(currentX[i]) || Number.isNaN(currentX[i])) {
        hasInvalidNumber = true;
      } else {
        relativeErrors[i] = calculateRelativeError(currentX[i], previousX[i]);
        if (relativeErrors[i] > maxRelativeError) {
          maxRelativeError = relativeErrors[i];
        }
      }
    }

    if (hasInvalidNumber || !Number.isFinite(maxRelativeError)) {
      return {
        success: false,
        method: 'gauss-seidel',
        originalA: A,
        originalB: b,
        config,
        convergenceAnalysis: convergence,
        sassenfeldAnalysis: sassenfeld,
        iterations,
        iterationCount: k - 1,
        finalError: iterations[k - 1].maxRelativeError,
        finalResidual: iterations[k - 1].residualNorm || 0,
        solution: previousX,
        status: 'numerical_error',
        errorMessage: `El proceso presentó inestabilidad numérica en la iteración ${k}.`
      };
    }

    const residualNorm = calculateResidualNorm(A, currentX, b);
    iterations.push({
      iteration: k,
      x: [...currentX],
      relativeErrors,
      maxRelativeError,
      residualNorm
    });

    if (maxRelativeError < config.tolerance) {
      return {
        success: true,
        method: 'gauss-seidel',
        originalA: A,
        originalB: b,
        config,
        convergenceAnalysis: convergence,
        sassenfeldAnalysis: sassenfeld,
        iterations,
        iterationCount: k,
        finalError: maxRelativeError,
        finalResidual: residualNorm,
        solution: [...currentX],
        status: 'converged'
      };
    }
  }

  return {
    success: true,
    method: 'gauss-seidel',
    originalA: A,
    originalB: b,
    config,
    convergenceAnalysis: convergence,
    sassenfeldAnalysis: sassenfeld,
    iterations,
    iterationCount: config.maxIterations,
    finalError: iterations[iterations.length - 1].maxRelativeError,
    finalResidual: iterations[iterations.length - 1].residualNorm || 0,
    solution: [...currentX],
    status: 'max_iterations',
    errorMessage: "Se alcanzó el número máximo de iteraciones sin satisfacer la tolerancia indicada."
  };
}
