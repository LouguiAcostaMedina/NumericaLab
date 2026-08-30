'use client';

import React, { useState, useEffect } from 'react';

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
  }) => void;
}

export function MethodForm({ method, isLoading = false, onSubmit }: MethodFormProps) {
  // Estados para los inputs con valores por defecto recomendados
  const [expression, setExpression] = useState('x^3 - x - 1');
  const [tolerance, setTolerance] = useState('0.0001');
  const [maxIterations, setMaxIterations] = useState('100');
  
  // Parámetros específicos de Bisección / Falsa Posición
  const [a, setA] = useState('1');
  const [b, setB] = useState('2');

  // Parámetros específicos de Newton / Punto Fijo / Secante
  const [x0, setX0] = useState('1.5');
  const [x1, setX1] = useState('2');

  // Si cambia el método, reseteamos a valores recomendados para facilitar las pruebas
  useEffect(() => {
    switch (method) {
      case 'bisection':
      case 'false-position':
        setExpression('x^3 - x - 1');
        setA('1');
        setB('2');
        break;
      case 'fixed-point':
        setExpression('(x + 1)^(1/3)');
        setX0('1.5');
        break;
      case 'newton':
        setExpression('x^3 - x - 1');
        setX0('1.5');
        break;
      case 'secant':
        setExpression('x^3 - x - 1');
        setX0('1');
        setX1('2');
        break;
    }
  }, [method]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas de cliente
    if (!expression.trim()) return;
    
    const parsedTol = parseFloat(tolerance);
    const parsedMaxIter = parseInt(maxIterations, 10);

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
      });
    }
  };

  // Determinar estilos de botones según el método
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
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
        <span>⚙️</span> Configuración del Método
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input: Función f(x) o g(x) */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {isFixedPoint ? 'Función Despejada $g(x)$' : 'Función $f(x)$'}
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
              ? 'Despeje tal que x = g(x). Ejemplo: (x + 1)^(1/3).' 
              : 'Utiliza la sintaxis estándar de mathjs. Ej: x^3 - x - 1.'}
          </p>
        </div>

        {/* Inputs dinámicos */}
        {isBisectionOrFalsePos && (
          <>
            {/* Límite Inferior (a / xl) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {method === 'bisection' ? 'Límite Inferior ($a$)' : 'Límite Inferior ($x_l$)'}
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
            {/* Límite Superior (b / xu) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {method === 'bisection' ? 'Límite Superior ($b$)' : 'Límite Superior ($x_u$)'}
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
            {/* Semilla 0 (x0) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Semilla Inicial ($x_0$)
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
            {/* Semilla 1 (x1) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Semilla Inicial ($x_1$)
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
          /* Aproximación Inicial (x0) */
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Aproximación Inicial ($x_0$)
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

        {/* Tolerancia */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Tolerancia del Error $\varepsilon$ (%)
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

        {/* Iteraciones Máximas */}
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
