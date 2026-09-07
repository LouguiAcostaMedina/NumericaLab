'use client';

import React, { useState, useEffect } from 'react';
import { MathParser } from '../core/math/MathParser';
import { MethodRecommender } from '../core/math/methodRecommender';
import { HistoryDrawer } from './HistoryDrawer';
import { MethodRecommendation, SemanticValidationResult } from '../core/domain/types';
import { CalculationHistoryItem } from '../core/domain/history';

interface MethodFormProps {
  method: 'bisection' | 'newton' | 'false-position' | 'fixed-point' | 'secant';
  isLoading?: boolean;
  onSubmit: (data: {
    expression: string;
    a?: number;
    b?: number;
    x0?: number;
    x1?: number;
    tolerance: number;
    maxIterations: number;
    decimals: number;
  }) => void;
}

export function MethodForm({ method, isLoading = false, onSubmit }: MethodFormProps) {
  const [expression, setExpression] = useState('x^3 - x - 1');
  const [tolerance, setTolerance] = useState('0.0001');
  const [maxIterations, setMaxIterations] = useState('100');
  const [decimals, setDecimals] = useState('6');

  // Parámetros específicos de Bisección / Falsa Posición
  const [a, setA] = useState('1');
  const [b, setB] = useState('2');

  // Parámetros específicos de Newton / Punto Fijo / Secante
  const [x0, setX0] = useState('1.5');
  const [x1, setX1] = useState('2');

  const [recommendation, setRecommendation] = useState<MethodRecommendation | null>(null);
  const [semanticVal, setSemanticVal] = useState<SemanticValidationResult | null>(null);

  // Defaults inteligentes por método
  const resetToSmartDefaults = () => {
    switch (method) {
      case 'bisection':
      case 'false-position':
        setExpression('x^3 - x - 1');
        setA('1');
        setB('2');
        setTolerance('0.0001');
        setMaxIterations('100');
        break;
      case 'fixed-point':
        setExpression('(x + 1)^(1/3)');
        setX0('1.5');
        setTolerance('0.0001');
        setMaxIterations('100');
        break;
      case 'newton':
        setExpression('x^3 - x - 1');
        setX0('1.5');
        setTolerance('0.0001');
        setMaxIterations('100');
        break;
      case 'secant':
        setExpression('x^3 - x - 1');
        setX0('1');
        setX1('2');
        setTolerance('0.0001');
        setMaxIterations('100');
        break;
    }
  };

  useEffect(() => {
    resetToSmartDefaults();
  }, [method]);

  // Cargar ítem del Historial
  const handleSelectHistoryItem = (item: CalculationHistoryItem) => {
    setExpression(item.expression);
    setTolerance(item.params.tolerance.toString());
    setMaxIterations(item.params.maxIterations.toString());
    setDecimals((item.params.decimals || 6).toString());

    if (item.params.a !== undefined) setA(item.params.a.toString());
    if (item.params.b !== undefined) setB(item.params.b.toString());
    if (item.params.x0 !== undefined) setX0(item.params.x0.toString());
    if (item.params.x1 !== undefined) setX1(item.params.x1.toString());
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!expression.trim()) {
        setRecommendation(null);
        setSemanticVal(null);
        return;
      }

      const pA = parseFloat(a);
      const pB = parseFloat(b);
      const pX0 = parseFloat(x0);
      const pX1 = parseFloat(x1);

      const params = {
        a: !isNaN(pA) ? pA : undefined,
        b: !isNaN(pB) ? pB : undefined,
        x0: !isNaN(pX0) ? pX0 : undefined,
        x1: !isNaN(pX1) ? pX1 : undefined,
      };

      const rec = MethodRecommender.recommend(expression, params);
      setRecommendation(rec);

      const val = MathParser.validateSemantic(expression, method, params);
      setSemanticVal(val);
    }, 250);

    return () => clearTimeout(timer);
  }, [expression, a, b, x0, x1, method]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expression.trim()) return;

    const parsedTol = parseFloat(tolerance);
    const parsedMaxIter = parseInt(maxIterations, 10);
    const parsedDecimals = parseInt(decimals, 10);

    if (isNaN(parsedTol) || parsedTol <= 0) {
      alert('La tolerancia debe ser un número positivo mayor que cero.');
      return;
    }

    if (isNaN(parsedMaxIter) || parsedMaxIter <= 0) {
      alert('El número máximo de iteraciones debe ser mayor que cero.');
      return;
    }

    if (method === 'bisection' || method === 'false-position') {
      const parsedA = parseFloat(a);
      const parsedB = parseFloat(b);

      if (isNaN(parsedA) || isNaN(parsedB)) {
        alert('Por favor ingresa valores numéricos válidos para los límites.');
        return;
      }

      if (parsedA >= parsedB) {
        alert('El límite inferior debe ser menor que el límite superior.');
        return;
      }

      onSubmit({
        expression,
        a: parsedA,
        b: parsedB,
        tolerance: parsedTol,
        maxIterations: parsedMaxIter,
        decimals: parsedDecimals,
      });
    } else if (method === 'secant') {
      const parsedX0 = parseFloat(x0);
      const parsedX1 = parseFloat(x1);

      if (isNaN(parsedX0) || isNaN(parsedX1)) {
        alert('Por favor ingresa valores numéricos válidos para las semillas.');
        return;
      }

      onSubmit({
        expression,
        x0: parsedX0,
        x1: parsedX1,
        tolerance: parsedTol,
        maxIterations: parsedMaxIter,
        decimals: parsedDecimals,
      });
    } else {
      const parsedX0 = parseFloat(x0);

      if (isNaN(parsedX0)) {
        alert('Por favor ingresa un valor numérico válido para la aproximación inicial.');
        return;
      }

      onSubmit({
        expression,
        x0: parsedX0,
        tolerance: parsedTol,
        maxIterations: parsedMaxIter,
        decimals: parsedDecimals,
      });
    }
  };

  const getButtonStyle = () => {
    switch (method) {
      case 'bisection':
        return 'bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-500 text-white';
      case 'false-position':
        return 'bg-teal-600 hover:bg-teal-500 focus:ring-teal-500 text-white';
      case 'newton':
        return 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500 text-white';
      case 'fixed-point':
        return 'bg-purple-600 hover:bg-purple-500 focus:ring-purple-500 text-white';
      case 'secant':
        return 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500 text-white';
    }
  };

  const getFocusStyle = () => {
    switch (method) {
      case 'bisection':
        return 'focus:ring-cyan-500/50';
      case 'false-position':
        return 'focus:ring-teal-500/50';
      case 'newton':
        return 'focus:ring-blue-500/50';
      case 'fixed-point':
        return 'focus:ring-purple-500/50';
      case 'secant':
        return 'focus:ring-indigo-500/50';
    }
  };

  const isFixedPoint = method === 'fixed-point';
  const isBisectionOrFalsePos = method === 'bisection' || method === 'false-position';
  const isSecant = method === 'secant';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6 animate-fade-in"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span>⚙️</span> Configuración del Método
        </h3>

        <div className="flex items-center gap-2">
          <HistoryDrawer onSelectHistoryItem={handleSelectHistoryItem} />

          <button
            type="button"
            onClick={resetToSmartDefaults}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            title="Reestablecer valores de entrada por defecto recomendados"
          >
            <span>🔄</span> Defaults
          </button>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Precisión:</span>
            <select
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              className="bg-transparent text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="10">10</option>
              <option value="12">12</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input: Función f(x) o g(x) */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {isFixedPoint ? 'Función Despejada g(x)' : 'Función f(x)'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder={isFixedPoint ? 'ej: (x + 1)^(1/3)' : 'ej: x^3 - x - 1'}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-mono"
            />
            <span className="absolute right-3 top-2.5 text-zinc-400 text-sm pointer-events-none">
              {isFixedPoint ? '= x' : '= 0'}
            </span>
          </div>
          <p className="text-2xs text-zinc-400">
            {isFixedPoint
              ? 'Despeje tal que x = g(x). Permite notación científica (ej: 1.5e-3*x).'
              : 'Soporta notación científica (ej: 1e-4*x^2 + 2x - 1.5).'}
          </p>
        </div>

        {/* Notificación de Sugerencia Automática */}
        {recommendation && (
          <div className="md:col-span-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <span className="text-base">💡</span>
            <div>
              <span className="font-bold">Sugerencia Automática:</span> {recommendation.reason}
            </div>
          </div>
        )}

        {/* Alerta de Validación Semántica Algorítmica */}
        {semanticVal && semanticVal.severity !== 'info' && (
          <div
            className={`md:col-span-2 p-3 rounded-lg text-xs flex items-start gap-2.5 border ${
              semanticVal.severity === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
            }`}
          >
            <span className="text-base">{semanticVal.severity === 'error' ? '🚫' : '⚠️'}</span>
            <div>
              <span className="font-bold">
                {semanticVal.severity === 'error' ? 'Fallo Algorítmico Prevenido:' : 'Advertencia de Divergencia:'}
              </span>{' '}
              {semanticVal.message}
              {semanticVal.suggestion && (
                <div className="mt-1 font-medium underline">{semanticVal.suggestion}</div>
              )}
            </div>
          </div>
        )}

        {/* Inputs dinámicos */}
        {isBisectionOrFalsePos && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {method === 'bisection' ? 'Límite Inferior (a)' : 'Límite Inferior (xl)'}
              </label>
              <input
                type="number"
                step="any"
                value={a}
                onChange={(e) => setA(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 ${getFocusStyle()} transition-all font-mono`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {method === 'bisection' ? 'Límite Superior (b)' : 'Límite Superior (xu)'}
              </label>
              <input
                type="number"
                step="any"
                value={b}
                onChange={(e) => setB(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 ${getFocusStyle()} transition-all font-mono`}
              />
            </div>
          </>
        )}

        {isSecant && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Semilla Inicial (x0)
              </label>
              <input
                type="number"
                step="any"
                value={x0}
                onChange={(e) => setX0(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 ${getFocusStyle()} transition-all font-mono`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Semilla Inicial (x1)
              </label>
              <input
                type="number"
                step="any"
                value={x1}
                onChange={(e) => setX1(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 ${getFocusStyle()} transition-all font-mono`}
              />
            </div>
          </>
        )}

        {!isBisectionOrFalsePos && !isSecant && (
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Aproximación Inicial (x0)
            </label>
            <input
              type="number"
              step="any"
              value={x0}
              onChange={(e) => setX0(e.target.value)}
              required
              className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 ${getFocusStyle()} transition-all font-mono`}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Tolerancia del Error ε (%)
          </label>
          <input
            type="number"
            step="any"
            value={tolerance}
            onChange={(e) => setTolerance(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Iteraciones Máximas
          </label>
          <input
            type="number"
            value={maxIterations}
            onChange={(e) => setMaxIterations(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-mono"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${getButtonStyle()} ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Procesando...
          </>
        ) : (
          '🔢 Calcular Raíz'
        )}
      </button>
    </form>
  );
}
