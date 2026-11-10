'use client';

import React, { useState, useEffect } from 'react';
import { MathParser } from '../../core/math/MathParser';
import {
  ODE_AUTONOMOUS_PRESET,
  ODE_PRACTICE_PRESETS,
} from '../../core/math/ode/pvi';
import {
  OdeMethodType,
  OdeEquationMode,
} from '../../core/domain/types';

export interface OdeFormData {
  equationMode: OdeEquationMode;
  expressionF: string;
  expressionM?: string;
  expressionN?: string;
  x0: number;
  y0: number;
  xTarget: number;
  h: number;
  stepAdjustmentMode: 'exact_n' | 'partial_last_step';
  methods: OdeMethodType[];
  exactExpression?: string;
  exactDerivationExplanation?: string;
}

interface OdeFormProps {
  isLoading: boolean;
  onSubmit: (data: OdeFormData) => void;
}

export function OdeForm({ isLoading, onSubmit }: OdeFormProps) {
  // Modo de ecuación
  const [equationMode, setEquationMode] = useState<OdeEquationMode>('differential');

  // Expresiones
  const [expressionF, setExpressionF] = useState<string>(
    ODE_AUTONOMOUS_PRESET.expressionF || 'x/y - y/x'
  );
  const [expressionM, setExpressionM] = useState<string>(
    ODE_AUTONOMOUS_PRESET.expressionM || 'y^2 - x^2'
  );
  const [expressionN, setExpressionN] = useState<string>(
    ODE_AUTONOMOUS_PRESET.expressionN || 'x*y'
  );

  // Condiciones iniciales y dominio
  const [x0Str, setX0Str] = useState<string>(ODE_AUTONOMOUS_PRESET.x0.toString());
  const [y0Str, setY0Str] = useState<string>(ODE_AUTONOMOUS_PRESET.y0.toString());
  const [xTargetStr, setXTargetStr] = useState<string>(ODE_AUTONOMOUS_PRESET.xTarget.toString());
  const [hStr, setHStr] = useState<string>(ODE_AUTONOMOUS_PRESET.h.toString());

  // Ajuste de paso
  const [stepAdjustmentMode, setStepAdjustmentMode] = useState<'exact_n' | 'partial_last_step'>('exact_n');

  // Métodos seleccionados (por defecto los 4 métodos para comparativa completa)
  const [selectedMethods, setSelectedMethods] = useState<Record<OdeMethodType, boolean>>({
    euler: true,
    heun: true,
    rk3: true,
    rk4: true,
  });

  // Solución analítica exacta
  const [hasExact, setHasExact] = useState<boolean>(true);
  const [exactExpr, setExactExpr] = useState<string>(ODE_AUTONOMOUS_PRESET.exactExpression || '');
  const [exactDerivation, setExactDerivation] = useState<string>(
    ODE_AUTONOMOUS_PRESET.exactDerivationExplanation || ''
  );

  // Validación de sintaxis
  const [syntaxStatusF, setSyntaxStatusF] = useState<{ isValid: boolean; error?: string }>({
    isValid: true,
  });
  const [syntaxStatusM, setSyntaxStatusM] = useState<{ isValid: boolean; error?: string }>({
    isValid: true,
  });
  const [syntaxStatusN, setSyntaxStatusN] = useState<{ isValid: boolean; error?: string }>({
    isValid: true,
  });
  const [syntaxStatusExact, setSyntaxStatusExact] = useState<{ isValid: boolean; error?: string }>({
    isValid: true,
  });

  // Validación reactiva
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (equationMode === 'derivative') {
        if (!expressionF.trim()) {
          setSyntaxStatusF({ isValid: false, error: 'Ingresa f(x, y).' });
        } else {
          const res = await MathParser.parseAsync(expressionF);
          setSyntaxStatusF(res);
        }
      } else {
        if (!expressionM.trim()) {
          setSyntaxStatusM({ isValid: false, error: 'Ingresa M(x, y).' });
        } else {
          const resM = await MathParser.parseAsync(expressionM);
          setSyntaxStatusM(resM);
        }

        if (!expressionN.trim()) {
          setSyntaxStatusN({ isValid: false, error: 'Ingresa N(x, y).' });
        } else {
          const resN = await MathParser.parseAsync(expressionN);
          setSyntaxStatusN(resN);
        }
      }

      if (hasExact && exactExpr.trim()) {
        const resEx = await MathParser.parseAsync(exactExpr);
        setSyntaxStatusExact(resEx);
      } else {
        setSyntaxStatusExact({ isValid: true });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [equationMode, expressionF, expressionM, expressionN, hasExact, exactExpr]);

  // Selección de presets
  const applyPreset = (presetKey: 'autonomous' | 'ejemplo1' | 'ejemplo2' | 'ejemplo3') => {
    if (presetKey === 'autonomous') {
      setEquationMode('differential');
      setExpressionM('y^2 - x^2');
      setExpressionN('x*y');
      setExpressionF('x/y - y/x');
      setX0Str('1');
      setY0Str('2');
      setXTargetStr('1.2');
      setHStr('0.1');
      setHasExact(true);
      setExactExpr(ODE_AUTONOMOUS_PRESET.exactExpression || '');
      setExactDerivation(ODE_AUTONOMOUS_PRESET.exactDerivationExplanation || '');
      setStepAdjustmentMode('exact_n');
      setSelectedMethods({ euler: true, heun: true, rk3: true, rk4: true });
      return;
    }

    const pr = ODE_PRACTICE_PRESETS[presetKey];
    if (!pr) return;

    setEquationMode('derivative');
    setExpressionF(pr.expressionF);
    setX0Str(pr.x0.toString());
    setY0Str(pr.y0.toString());
    setXTargetStr(pr.xTarget.toString());
    setHStr(pr.h.toString());
    setStepAdjustmentMode('exact_n');
    setSelectedMethods({ euler: true, heun: true, rk3: true, rk4: true });

    if (pr.exactExpression) {
      setHasExact(true);
      setExactExpr(pr.exactExpression);
      setExactDerivation(pr.exactDerivationExplanation || '');
    } else {
      setHasExact(false);
      setExactExpr('');
      setExactDerivation('');
    }
  };

  const toggleMethod = (method: OdeMethodType) => {
    setSelectedMethods((prev) => {
      const next = { ...prev, [method]: !prev[method] };
      // Evitar que todos queden desmarcados
      const anyActive = Object.values(next).some(Boolean);
      return anyActive ? next : prev;
    });
  };

  const selectAllMethods = () => {
    setSelectedMethods({ euler: true, heun: true, rk3: true, rk4: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const x0 = parseFloat(x0Str);
    const y0 = parseFloat(y0Str);
    const xTarget = parseFloat(xTargetStr);
    const h = parseFloat(hStr);

    if (isNaN(x0) || isNaN(y0) || isNaN(xTarget) || isNaN(h)) {
      alert('Por favor verifica que x0, y0, x objetivo y h sean valores numéricos válidos.');
      return;
    }

    if (h <= 0) {
      alert('El tamaño de paso h debe ser estrictamente positivo (h > 0).');
      return;
    }

    if (xTarget <= x0) {
      alert('El valor objetivo x_objetivo debe ser estrictamente mayor a la condición inicial x0.');
      return;
    }

    const activeList = (Object.keys(selectedMethods) as OdeMethodType[]).filter(
      (m) => selectedMethods[m]
    );

    if (activeList.length === 0) {
      alert('Debes seleccionar al menos un método numérico.');
      return;
    }

    // Si está en modo diferencial y f(x, y) está vacía o el usuario no la escribió directamente,
    // derivamos la representación visual f = -(M)/(N)
    let effF = expressionF;
    if (equationMode === 'differential') {
      effF = `-(${expressionM})/(${expressionN})`;
    }

    onSubmit({
      equationMode,
      expressionF: effF,
      expressionM: equationMode === 'differential' ? expressionM : undefined,
      expressionN: equationMode === 'differential' ? expressionN : undefined,
      x0,
      y0,
      xTarget,
      h,
      stepAdjustmentMode,
      methods: activeList,
      exactExpression: hasExact && exactExpr.trim() ? exactExpr.trim() : undefined,
      exactDerivationExplanation: hasExact ? exactDerivation : undefined,
    });
  };

  return (
    <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-6">
      {/* Selector de Presets de la Guía y Actividad */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
            Casos y Ejemplos de Estudio (Sesión 14)
          </span>
          <span className="text-[11px] text-primary font-medium">1 clic para autocompletar</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => applyPreset('autonomous')}
            className="text-left p-3 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-all text-xs font-medium space-y-1 group"
          >
            <div className="flex items-center justify-between text-primary font-bold">
              <span>⭐ Actividad Obligatoria</span>
              <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded font-mono">Sesión 14</span>
            </div>
            <p className="text-foreground text-[11px] font-mono truncate">
              (y²-x²)dx + xy dy = 0
            </p>
            <p className="text-foreground-muted text-[10px]">
              x₀=1, y₀=2, x_obj=1.2, h=0.1
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('ejemplo1')}
            className="text-left p-3 rounded-xl border border-border bg-surface-secondary/40 hover:bg-surface-secondary transition-all text-xs font-medium space-y-1"
          >
            <div className="flex items-center justify-between text-foreground font-semibold">
              <span>📐 Práctica 1 (Diap. 20, 28)</span>
            </div>
            <p className="text-foreground text-[11px] font-mono truncate">y&apos; = x + y</p>
            <p className="text-foreground-muted text-[10px]">x₀=0, y₀=1, x_obj=1.0, h=0.2</p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('ejemplo2')}
            className="text-left p-3 rounded-xl border border-border bg-surface-secondary/40 hover:bg-surface-secondary transition-all text-xs font-medium space-y-1"
          >
            <div className="flex items-center justify-between text-foreground font-semibold">
              <span>📐 Práctica 2 (Diap. 23)</span>
            </div>
            <p className="text-foreground text-[11px] font-mono truncate">y&apos; = 2xy</p>
            <p className="text-foreground-muted text-[10px]">x₀=1, y₀=1, x_obj=1.5, h=0.1</p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('ejemplo3')}
            className="text-left p-3 rounded-xl border border-border bg-surface-secondary/40 hover:bg-surface-secondary transition-all text-xs font-medium space-y-1"
          >
            <div className="flex items-center justify-between text-foreground font-semibold">
              <span>📐 Práctica 3 (Diap. 29, 32)</span>
            </div>
            <p className="text-foreground text-[11px] font-mono truncate">y&apos; = e^(x+y)</p>
            <p className="text-foreground-muted text-[10px]">x₀=1, y₀=0, x_obj=1.2, h=0.1</p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de Modo de Ecuación */}
        <div className="border border-border/60 rounded-xl p-4 bg-surface-secondary/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Formato de la EDO
            </span>
            <div className="inline-flex rounded-lg bg-surface border border-border p-1 text-xs">
              <button
                type="button"
                onClick={() => setEquationMode('derivative')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  equationMode === 'derivative'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                Derivada y&apos; = f(x, y)
              </button>
              <button
                type="button"
                onClick={() => setEquationMode('differential')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  equationMode === 'differential'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                Diferenciales M dx + N dy = 0
              </button>
            </div>
          </div>

          {/* Campos según modo de ecuación */}
          {equationMode === 'derivative' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Función de pendiente y&apos; = f(x, y)</span>
                <span className="text-[11px] text-foreground-muted font-mono">
                  Ej: x/y - y/x, x + y, 2*x*y, exp(x+y)
                </span>
              </label>
              <input
                type="text"
                value={expressionF}
                onChange={(e) => setExpressionF(e.target.value)}
                placeholder="x/y - y/x"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
              {!syntaxStatusF.isValid && (
                <p className="text-xs text-error font-medium">{syntaxStatusF.error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Función M(x, y)</span>
                    <span className="text-[11px] text-foreground-muted font-mono">término de dx</span>
                  </label>
                  <input
                    type="text"
                    value={expressionM}
                    onChange={(e) => setExpressionM(e.target.value)}
                    placeholder="y^2 - x^2"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                  {!syntaxStatusM.isValid && (
                    <p className="text-xs text-error font-medium">{syntaxStatusM.error}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Función N(x, y)</span>
                    <span className="text-[11px] text-foreground-muted font-mono">término de dy</span>
                  </label>
                  <input
                    type="text"
                    value={expressionN}
                    onChange={(e) => setExpressionN(e.target.value)}
                    placeholder="x*y"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                  {!syntaxStatusN.isValid && (
                    <p className="text-xs text-error font-medium">{syntaxStatusN.error}</p>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-foreground-muted flex items-start gap-2">
                <span className="text-primary font-bold">ℹ️</span>
                <span>
                  Conversión automática a forma explícita:{' '}
                  <code className="text-primary font-mono font-bold">y&apos; = -M(x, y) / N(x, y)</code>.
                  Si <code className="font-mono">N(x, y) = 0</code> en cualquier nodo, el software abortará de forma segura informando la indeterminación.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Parámetros Numéricos: x0, y0, xTarget, h */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">x₀ (Condición inicial)</label>
            <input
              type="number"
              step="any"
              value={x0Str}
              onChange={(e) => setX0Str(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">y₀ = y(x₀)</label>
            <input
              type="number"
              step="any"
              value={y0Str}
              onChange={(e) => setY0Str(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">x Objetivo</label>
            <input
              type="number"
              step="any"
              value={xTargetStr}
              onChange={(e) => setXTargetStr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Tamaño de paso h</label>
            <input
              type="number"
              step="any"
              min="0.000001"
              value={hStr}
              onChange={(e) => setHStr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
        </div>

        {/* Modo de ajuste si (xTarget - x0)/h no es entero */}
        <div className="p-4 rounded-xl border border-border bg-surface-secondary/20 space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Estrategia de Partición del Intervalo [x₀, x_objetivo]</span>
            <span className="text-[11px] text-foreground-muted">Manejo de divisiones no enteras</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label
              className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                stepAdjustmentMode === 'exact_n'
                  ? 'border-primary bg-primary/10 text-foreground font-medium'
                  : 'border-border bg-surface text-foreground-muted hover:border-foreground-muted/50'
              }`}
            >
              <input
                type="radio"
                name="stepAdj"
                checked={stepAdjustmentMode === 'exact_n'}
                onChange={() => setStepAdjustmentMode('exact_n')}
                className="mt-0.5 text-primary"
              />
              <div>
                <p className="font-bold text-foreground">Ajustar a n entero (Recomendado)</p>
                <p className="text-[11px] text-foreground-muted">
                  Calcula n = ⌈(x_obj - x₀)/h⌉ y usa h uniforme = (x_obj - x₀)/n para mantener la consistencia del orden del método.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                stepAdjustmentMode === 'partial_last_step'
                  ? 'border-primary bg-primary/10 text-foreground font-medium'
                  : 'border-border bg-surface text-foreground-muted hover:border-foreground-muted/50'
              }`}
            >
              <input
                type="radio"
                name="stepAdj"
                checked={stepAdjustmentMode === 'partial_last_step'}
                onChange={() => setStepAdjustmentMode('partial_last_step')}
                className="mt-0.5 text-primary"
              />
              <div>
                <p className="font-bold text-foreground">Último paso parcial</p>
                <p className="text-[11px] text-foreground-muted">
                  Mantiene h nominal en los primeros pasos y reduce el último tramo h_final = x_obj - x_previo para alcanzar el objetivo exacto.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Métodos Numéricos a calcular */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Métodos a resolver y comparar
            </span>
            <button
              type="button"
              onClick={selectAllMethods}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Marcar todos (4)
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <label
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedMethods.euler
                  ? 'border-blue-500/50 bg-blue-500/10 text-foreground font-semibold'
                  : 'border-border bg-surface text-foreground-muted'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMethods.euler}
                onChange={() => toggleMethod('euler')}
                className="rounded text-blue-500"
              />
              <div>
                <p className="font-bold text-blue-600 dark:text-blue-400">Euler</p>
                <p className="text-[10px] text-foreground-muted">Orden 1 • 1 eval/paso</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedMethods.heun
                  ? 'border-amber-500/50 bg-amber-500/10 text-foreground font-semibold'
                  : 'border-border bg-surface text-foreground-muted'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMethods.heun}
                onChange={() => toggleMethod('heun')}
                className="rounded text-amber-500"
              />
              <div>
                <p className="font-bold text-amber-600 dark:text-amber-400">Heun (Mejorado)</p>
                <p className="text-[10px] text-foreground-muted">Orden 2 • 2 eval/paso</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedMethods.rk3
                  ? 'border-purple-500/50 bg-purple-500/10 text-foreground font-semibold'
                  : 'border-border bg-surface text-foreground-muted'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMethods.rk3}
                onChange={() => toggleMethod('rk3')}
                className="rounded text-purple-500"
              />
              <div>
                <p className="font-bold text-purple-600 dark:text-purple-400">Runge-Kutta 3</p>
                <p className="text-[10px] text-foreground-muted">Orden 3 • Diapositiva 31</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedMethods.rk4
                  ? 'border-rose-500/50 bg-rose-500/10 text-foreground font-semibold'
                  : 'border-border bg-surface text-foreground-muted'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMethods.rk4}
                onChange={() => toggleMethod('rk4')}
                className="rounded text-rose-500"
              />
              <div>
                <p className="font-bold text-rose-600 dark:text-rose-400">Runge-Kutta 4</p>
                <p className="text-[10px] text-foreground-muted">Orden 4 • Clásico (Diap. 33)</p>
              </div>
            </label>
          </div>
        </div>

        {/* Sección Solución Exacta Opcional */}
        <div className="border border-border/70 rounded-xl p-4 bg-surface-secondary/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
              <input
                type="checkbox"
                checked={hasExact}
                onChange={(e) => setHasExact(e.target.checked)}
                className="rounded text-primary"
              />
              <span>Proporcionar Solución Analítica Exacta y(x)</span>
            </label>
            <span className="text-[11px] text-foreground-muted">
              Permite calcular error absoluto y error relativo porcentual
            </span>
          </div>

          {hasExact && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Expresión analítica y(x)</span>
                  <span className="text-[11px] text-foreground-muted font-mono">
                    Ej: sqrt(x^2/2 + 3.5/x^2), 2*exp(x) - x - 1
                  </span>
                </label>
                <input
                  type="text"
                  value={exactExpr}
                  onChange={(e) => setExactExpr(e.target.value)}
                  placeholder="sqrt(x^2/2 + 3.5/x^2)"
                  className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {!syntaxStatusExact.isValid && (
                  <p className="text-xs text-error font-medium">{syntaxStatusExact.error}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Derivación / Justificación de la solución analítica
                </label>
                <textarea
                  rows={2}
                  value={exactDerivation}
                  onChange={(e) => setExactDerivation(e.target.value)}
                  placeholder="Explicación del método de separación de variables, sustitución homogénea, etc."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-wide shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Calculando métodos de EDO...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Calcular y Comparar Métodos Numéricos</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
