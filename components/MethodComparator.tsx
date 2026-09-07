'use client';

import React, { useState } from 'react';
import { calculateBisection } from '../core/math/bisection';
import { calculateNewtonRaphson } from '../core/math/newton';
import { calculateFalsePosition } from '../core/math/falsePosition';
import { calculateSecant } from '../core/math/secant';
import { PrecisionUtils } from '../core/math/precisionUtils';

interface MethodComparatorProps {
  initialExpression?: string;
}

/**
 * Vista Comparadora de Métodos Numéricos simultáneos (ej. Bisección vs Newton-Raphson).
 */
export const MethodComparator: React.FC<MethodComparatorProps> = ({
  initialExpression = 'x^3 - x - 1',
}) => {
  const [expression, setExpression] = useState(initialExpression);
  const [methodA, setMethodA] = useState<'bisection' | 'newton' | 'false-position' | 'secant'>('bisection');
  const [methodB, setMethodB] = useState<'bisection' | 'newton' | 'false-position' | 'secant'>('newton');

  const [tolerance, setTolerance] = useState('0.0001');
  const [maxIter, setMaxIter] = useState('100');
  const [decimals, setDecimals] = useState('6');

  // Parámetros
  const [a, setA] = useState('1');
  const [b, setB] = useState('2');
  const [x0, setX0] = useState('1.5');
  const [x1, setX1] = useState('2');

  const [resA, setResA] = useState<any | null>(null);
  const [resB, setResB] = useState<any | null>(null);

  const runSolver = (mId: string) => {
    const tol = parseFloat(tolerance) || 0.0001;
    const maxI = parseInt(maxIter, 10) || 100;
    const dec = parseInt(decimals, 10) || 6;
    const pA = parseFloat(a);
    const pB = parseFloat(b);
    const pX0 = parseFloat(x0);
    const pX1 = parseFloat(x1);

    switch (mId) {
      case 'bisection':
        return calculateBisection(expression, pA, pB, tol, maxI, dec);
      case 'newton':
        return calculateNewtonRaphson(expression, pX0, tol, maxI, dec);
      case 'false-position':
        return calculateFalsePosition(expression, pA, pB, tol, maxI, dec);
      case 'secant':
        return calculateSecant(expression, pX0, pX1, tol, maxI, dec);
      default:
        return null;
    }
  };

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    const rA = runSolver(methodA);
    const rB = runSolver(methodB);
    setResA(rA);
    setResB(rB);
  };

  const getMethodName = (m: string) => {
    switch (m) {
      case 'bisection': return 'Bisección';
      case 'newton': return 'Newton-Raphson';
      case 'false-position': return 'Falsa Posición';
      case 'secant': return 'Secante';
      default: return m;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
            <span>⚖️</span> Comparador Simultáneo de Métodos Numéricos
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Evalúa la velocidad de convergencia y número de iteraciones entre dos métodos simultáneos.
          </p>
        </div>
      </div>

      <form onSubmit={handleCompare} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Función f(x):
            </label>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Método A:
            </label>
            <select
              value={methodA}
              onChange={(e) => setMethodA(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white outline-none"
            >
              <option value="bisection">Bisección</option>
              <option value="false-position">Falsa Posición</option>
              <option value="newton">Newton-Raphson</option>
              <option value="secant">Secante</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Método B:
            </label>
            <select
              value={methodB}
              onChange={(e) => setMethodB(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white outline-none"
            >
              <option value="newton">Newton-Raphson</option>
              <option value="bisection">Bisección</option>
              <option value="false-position">Falsa Posición</option>
              <option value="secant">Secante</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="block font-semibold text-zinc-500 mb-1">Intervalo [a, b]:</span>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                value={a}
                onChange={(e) => setA(e.target.value)}
                className="w-1/2 px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded font-mono"
                placeholder="a"
              />
              <input
                type="number"
                step="any"
                value={b}
                onChange={(e) => setB(e.target.value)}
                className="w-1/2 px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded font-mono"
                placeholder="b"
              />
            </div>
          </div>

          <div>
            <span className="block font-semibold text-zinc-500 mb-1">Semilla (x0):</span>
            <input
              type="number"
              step="any"
              value={x0}
              onChange={(e) => setX0(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded font-mono"
              placeholder="x0"
            />
          </div>

          <div>
            <span className="block font-semibold text-zinc-500 mb-1">Tolerancia (%):</span>
            <input
              type="number"
              step="any"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded font-mono"
            />
          </div>

          <div>
            <span className="block font-semibold text-zinc-500 mb-1">Precisión:</span>
            <select
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded font-mono"
            >
              <option value="6">6 decimals</option>
              <option value="8">8 decimals</option>
              <option value="10">10 decimals</option>
              <option value="12">12 decimals</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow transition-all cursor-pointer"
        >
          ⚡ Ejecutar Comparación Simultánea
        </button>
      </form>

      {/* Resultados Comparativos */}
      {resA && resB && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs animate-fade-in">
          {/* Resultado Método A */}
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
            <h5 className="font-bold text-cyan-700 dark:text-cyan-300 text-sm">
              Método A: {getMethodName(methodA)}
            </h5>
            {resA.success ? (
              <div className="space-y-1 font-mono text-zinc-800 dark:text-zinc-200">
                <p><strong>Raíz:</strong> {PrecisionUtils.format(resA.root, Number(decimals))}</p>
                <p><strong>Iteraciones:</strong> {resA.iterations?.length}</p>
                <p><strong>Estado:</strong> Exitoso</p>
              </div>
            ) : (
              <p className="text-rose-500 font-semibold">{resA.errorMessage}</p>
            )}
          </div>

          {/* Resultado Método B */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
            <h5 className="font-bold text-purple-700 dark:text-purple-300 text-sm">
              Método B: {getMethodName(methodB)}
            </h5>
            {resB.success ? (
              <div className="space-y-1 font-mono text-zinc-800 dark:text-zinc-200">
                <p><strong>Raíz:</strong> {PrecisionUtils.format(resB.root, Number(decimals))}</p>
                <p><strong>Iteraciones:</strong> {resB.iterations?.length}</p>
                <p><strong>Estado:</strong> Exitoso</p>
              </div>
            ) : (
              <p className="text-rose-500 font-semibold">{resB.errorMessage}</p>
            )}
          </div>

          {/* Conclusión de Eficiencia */}
          {resA.success && resB.success && (
            <div className="md:col-span-2 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-sans leading-relaxed">
              <span className="font-bold text-zinc-900 dark:text-white">🏆 Conclusión de Convergencia: </span>
              {resA.iterations.length < resB.iterations.length ? (
                <span>
                  <strong>{getMethodName(methodA)}</strong> convergió más rápido ({resA.iterations.length} iters vs {resB.iterations.length} iters de {getMethodName(methodB)}).
                </span>
              ) : resB.iterations.length < resA.iterations.length ? (
                <span>
                  <strong>{getMethodName(methodB)}</strong> convergió más rápido ({resB.iterations.length} iters vs {resA.iterations.length} iters de {getMethodName(methodA)}).
                </span>
              ) : (
                <span>Ambos métodos alcanzaron la tolerancia en el mismo número de iteraciones ({resA.iterations.length} iters).</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
