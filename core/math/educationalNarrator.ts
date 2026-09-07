import { PolynomialSolverResult, IIRFilterStabilityResult, MethodResponse, BisectionIteration, NewtonIteration, MullerIteration } from '../domain/types';
import { PrecisionUtils } from './precisionUtils';

export interface EducationalNarrative {
  title: string;
  summaryNarrative: string;
  stepNarratives: { step: number; text: string; details?: string }[];
  engineeringInsight: string;
}

/**
 * Motor Narrativo Educativo para Generar Explicaciones Paso a Paso en Lenguaje Natural.
 */
export class EducationalNarrator {
  /**
   * Genera una narrativa pedagógica estructurada para la resolución de polinomios / Método de Müller / IIR.
   */
  static narratePolynomialSolution(
    result: PolynomialSolverResult,
    iirResult?: IIRFilterStabilityResult | null
  ): EducationalNarrative {
    const degree = result.degree;
    const descartes = result.descartes;
    const lagrange = result.lagrange;
    const roots = result.roots;

    // Conclusión en lenguaje natural
    const maxMag = Math.max(...roots.map((r) => r.magnitude));
    const isStable = maxMag < 1.0;
    const isMarginal = Math.abs(maxMag - 1.0) < 1e-4;

    let stabilitySummary = '';
    if (iirResult) {
      stabilitySummary = `Evaluando la magnitud de los polos, se concluye que el filtro digital IIR es ${
        isStable ? 'ESTABLE' : isMarginal ? 'MARGINALMENTE ESTABLE' : 'INESTABLE'
      }, ya que el polo de mayor módulo es |z|_max = ${maxMag.toFixed(
        4
      )}, el cual es ${isStable ? 'estrictamente menor que 1.0 (dentro del círculo unitario)' : 'mayor o igual a 1.0 (fuera del disco unitario)'}.`;
    } else {
      stabilitySummary = `El algoritmo de Müller identificó exitosamente las ${roots.length} raíces del polinomio de grado ${degree}.`;
    }

    const summaryNarrative = `El Método de Müller y la Deflación Sintética de Horner procesaron el polinomio P(z) = ${
      result.polynomialString
    }. Según la Regla de los Signos de Descartes, se anticipaban hasta ${
      descartes.maxPositiveRoots
    } raíces reales positivas y ${descartes.maxNegativeRoots} reales negativas, con al menos ${
      descartes.minComplexRoots
    } raíces complejas. Todas las raíces encontradas están dentro del radio de acotación de Lagrange |z| ≤ ${
      lagrange.globalBound
    }. ${stabilitySummary}`;

    // Desglose paso a paso pedagógico por cada raíz hallada
    const stepNarratives: { step: number; text: string; details?: string }[] = [];

    roots.forEach((rootItem, idx) => {
      const isComplex = Math.abs(rootItem.root.im) > 1e-6;
      const rootStr = PrecisionUtils.formatComplex(rootItem.root, 4);

      stepNarratives.push({
        step: idx + 1,
        text: `Búsqueda de Raíz z_${rootItem.rootIndex}: Convergió en ${
          rootItem.iterations.length
        } iteración(es) hacia z = ${rootStr} (|z| = ${rootItem.magnitude}).`,
        details: isComplex
          ? `La parábola de Müller detectó un discriminante negativo (D < 0), realizando un salto al plano complejo para hallar el par conjugado.`
          : `La raíz permaneció en el eje de los números reales (Im(z) = 0).`,
      });
    });

    const engineeringInsight = `En la práctica de ingeniería de telecomunicaciones y procesamiento de señales, ubicar las raíces en el plano complejo Z permite garantizar que la respuesta al impulso del sistema H(z) decaiga exponencialmente a cero sin oscilaciones divergentes.`;

    return {
      title: 'Modo Educativo: Análisis Narrativo del Polinomio & Filtro IIR',
      summaryNarrative,
      stepNarratives,
      engineeringInsight,
    };
  }

  /**
   * Genera narrativa pedagógica para métodos numéricos en una variable real.
   */
  static narrateRealMethod<T>(
    methodId: 'bisection' | 'newton' | 'secant' | 'false-position' | 'fixed-point',
    response: MethodResponse<T>,
    expression: string
  ): EducationalNarrative {
    const iterations = response.iterations || [];
    const root = response.root ?? 0;
    const totalSteps = iterations.length;

    let title = '';
    let summaryNarrative = '';
    let engineeringInsight = '';

    switch (methodId) {
      case 'bisection':
        title = 'Modo Educativo: Método de Bisección (Cerrado)';
        summaryNarrative = `El Método de Bisección evaluó la función f(x) = ${expression}. Comenzó verificando el Teorema del Valor Intermedio (Bolzano) para garantizar que f(a) y f(b) tuvieran signos opuestos. Tras halvar iterativamente el intervalo ${totalSteps} veces, se logró una aproximación de la raíz en x ≈ ${PrecisionUtils.format(root, 6)}.`;
        engineeringInsight = 'Bisección es el método más robusto cuando se cuenta con un intervalo inicial con cambio de signo, asegurando convergencia lineal constante sin fallos por derivadas nulas.';
        break;
      case 'newton':
        title = 'Modo Educativo: Método de Newton-Raphson (Abierto)';
        summaryNarrative = `Newton-Raphson utilizó la recta tangente f'(x) para proyectar iterativamente x_{k+1} = x_k - f(x_k)/f'(x_k). En solo ${totalSteps} iteración(es), la aproximación convergió cuadráticamente hacia la raíz x ≈ ${PrecisionUtils.format(root, 6)}.`;
        engineeringInsight = 'Newton-Raphson duplica el número de dígitos exactos de precisión en cada iteración cuando se inicia cerca de la raíz y la derivada no se anula.';
        break;
      case 'secant':
        title = 'Modo Educativo: Método de la Secante (Abierto)';
        summaryNarrative = `La Secante aproximó la derivada mediante la pendiente de la recta secante entre dos puntos iniciales. En ${totalSteps} iteraciones, convergió exitosamente hacia x ≈ ${PrecisionUtils.format(root, 6)}.`;
        engineeringInsight = 'Ideal cuando la derivada simbólica f\'(x) es costosa de evaluar o computacionalmente compleja.';
        break;
      case 'false-position':
        title = 'Modo Educativo: Método de Falsa Posición';
        summaryNarrative = `Falsa Posición conectó los extremos del intervalo con una recta secante, hallando la intersección en x_r en ${totalSteps} pasos hasta alcanzar la raíz x ≈ ${PrecisionUtils.format(root, 6)}.`;
        engineeringInsight = 'Combina la garantía de convergencia de un método cerrado con la rapidez de interpolación lineal.';
        break;
      case 'fixed-point':
        title = 'Modo Educativo: Método de Punto Fijo';
        summaryNarrative = `Se reformuló la ecuación como x = g(x) = ${expression}. En ${totalSteps} pasos iterativos x_{k+1} = g(x_k), se halló el punto de intersección con la recta de identidad en x ≈ ${PrecisionUtils.format(root, 6)}.`;
        engineeringInsight = 'Requiere que |g\'(x)| < 1 en el entorno de la raíz para garantizar que la iteración sea una contracción convergente.';
        break;
    }

    const stepNarratives = iterations.slice(0, 5).map((it: any) => ({
      step: it.iteration,
      text: `Iteración ${it.iteration}: Aproximación x = ${PrecisionUtils.format(it.xr ?? it.xiNext ?? it.xi, 6)}, Error E_a = ${it.error !== null ? it.error.toFixed(4) + '%' : 'N/A'}.`,
    }));

    return {
      title,
      summaryNarrative,
      stepNarratives,
      engineeringInsight,
    };
  }
}
