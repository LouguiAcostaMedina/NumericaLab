'use client';

import React, { useState, useEffect } from 'react';
import { MathParser } from '../../core/math/MathParser';
import {
  SIMPSON13_AUTONOMOUS_PRESET,
  SIMPSON38_TABULAR_PRESET,
  PRACTICE_PRESETS,
} from '../../core/math/integration/simpson';
import { SimpsonMethodType } from '../../core/domain/types';

export interface SimpsonFormData {
  methodType: SimpsonMethodType;
  isTabular: boolean;
  expression: string;
  a: number;
  b: number;
  n: number;
  variableName: string;
  exactValue?: number;
  exactExpressionDescription?: string;
  isTheoreticalExact?: boolean;
  mFicha?: number;
  mValid?: number;
  units?: {
    rateUnit?: string;
    integralUnit?: string;
    variableUnit?: string;
  };
  tabularPoints?: { x: number; y: number }[];
}

interface SimpsonFormProps {
  isLoading: boolean;
  defaultMethodType?: SimpsonMethodType;
  onSubmit: (data: SimpsonFormData) => void;
}

export function SimpsonForm({
  isLoading,
  defaultMethodType = 'simpson13',
  onSubmit,
}: SimpsonFormProps) {
  const [methodType, setMethodType] = useState<SimpsonMethodType>(defaultMethodType);
  const [isTabular, setIsTabular] = useState<boolean>(false);

  // Estados para modo analítico
  const [expression, setExpression] = useState(SIMPSON13_AUTONOMOUS_PRESET.expression);
  const [a, setA] = useState<string>(SIMPSON13_AUTONOMOUS_PRESET.a.toString());
  const [b, setB] = useState<string>(SIMPSON13_AUTONOMOUS_PRESET.b.toString());
  const [n, setN] = useState<string>(SIMPSON13_AUTONOMOUS_PRESET.n.toString());
  const [variableName, setVariableName] = useState('t');
  const [rateUnit, setRateUnit] = useState('kW');
  const [integralUnit, setIntegralUnit] = useState('kWh');
  const [variableUnit, setVariableUnit] = useState('h');

  // Parámetros de referencia exacta y cotas M
  const [exactValueStr, setExactValueStr] = useState<string>(
    SIMPSON13_AUTONOMOUS_PRESET.exactValue.toFixed(6)
  );
  const [exactDescription, setExactDescription] = useState(
    SIMPSON13_AUTONOMOUS_PRESET.exactExpressionDescription
  );
  const [hasExactReference, setHasExactReference] = useState(true);
  const [mFichaStr, setMFichaStr] = useState<string>(
    SIMPSON13_AUTONOMOUS_PRESET.mFicha.toString()
  );
  const [mValidStr, setMValidStr] = useState<string>(
    SIMPSON13_AUTONOMOUS_PRESET.mValid.toString()
  );

  // Estados para modo de datos tabulados
  const [tabularPoints, setTabularPoints] = useState<Array<{ id: string; x: string; y: string }>>(
    SIMPSON38_TABULAR_PRESET.points.map((p, idx) => ({
      id: String(idx + 1),
      x: String(p.x),
      y: String(p.y),
    }))
  );

  // Validación de sintaxis en vivo con debounce
  const [syntaxStatus, setSyntaxStatus] = useState<{
    isValid: boolean;
    error?: string;
    normalized?: string;
  }>({ isValid: true });

  useEffect(() => {
    if (isTabular) return;
    const timer = setTimeout(async () => {
      if (!expression.trim()) {
        setSyntaxStatus({ isValid: false, error: 'Ingresa una expresión matemática.' });
        return;
      }
      const res = await MathParser.parseAsync(expression);
      setSyntaxStatus(res);
    }, 250);

    return () => clearTimeout(timer);
  }, [expression, isTabular]);

  // Validación en vivo de n
  const parsedN = parseInt(n, 10);
  const isNOdd = !isNaN(parsedN) && parsedN % 2 !== 0;
  const isNNotMult3 = !isNaN(parsedN) && parsedN % 3 !== 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isTabular) {
      const parsedPoints = tabularPoints
        .map((p) => ({
          x: parseFloat(p.x),
          y: parseFloat(p.y),
        }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y));

      onSubmit({
        methodType,
        isTabular: true,
        expression: 'Datos Tabulados',
        a: parsedPoints.length > 0 ? parsedPoints[0].x : 0,
        b: parsedPoints.length > 0 ? parsedPoints[parsedPoints.length - 1].x : 0,
        n: parsedPoints.length > 0 ? parsedPoints.length - 1 : 0,
        variableName,
        tabularPoints: parsedPoints,
        units: {
          rateUnit: rateUnit.trim() || undefined,
          integralUnit: integralUnit.trim() || undefined,
          variableUnit: variableUnit.trim() || undefined,
        },
      });
      return;
    }

    const parsedA = parseFloat(a);
    const parsedB = parseFloat(b);
    const parsedExact =
      hasExactReference && exactValueStr.trim() !== ''
        ? parseFloat(exactValueStr)
        : undefined;

    const parsedMFicha = mFichaStr.trim() !== '' ? parseFloat(mFichaStr) : undefined;
    const parsedMValid = mValidStr.trim() !== '' ? parseFloat(mValidStr) : undefined;

    onSubmit({
      methodType,
      isTabular: false,
      expression,
      a: parsedA,
      b: parsedB,
      n: parsedN,
      variableName,
      exactValue: parsedExact,
      exactExpressionDescription: hasExactReference ? exactDescription : undefined,
      isTheoreticalExact: hasExactReference,
      mFicha: parsedMFicha,
      mValid: parsedMValid,
      units: {
        rateUnit: rateUnit.trim() || undefined,
        integralUnit: integralUnit.trim() || undefined,
        variableUnit: variableUnit.trim() || undefined,
      },
    });
  };

  // Cargadores de Presets
  const loadAutonomousPreset = () => {
    setMethodType('simpson13');
    setIsTabular(false);
    setExpression(SIMPSON13_AUTONOMOUS_PRESET.expression);
    setA(SIMPSON13_AUTONOMOUS_PRESET.a.toString());
    setB(SIMPSON13_AUTONOMOUS_PRESET.b.toString());
    setN(SIMPSON13_AUTONOMOUS_PRESET.n.toString());
    setVariableName('t');
    setRateUnit('kW');
    setIntegralUnit('kWh');
    setVariableUnit('h');
    setHasExactReference(true);
    setExactValueStr(SIMPSON13_AUTONOMOUS_PRESET.exactValue.toFixed(6));
    setExactDescription(SIMPSON13_AUTONOMOUS_PRESET.exactExpressionDescription);
    setMFichaStr(SIMPSON13_AUTONOMOUS_PRESET.mFicha.toString());
    setMValidStr(SIMPSON13_AUTONOMOUS_PRESET.mValid.toString());
  };

  const loadSimpson38TabularPreset = () => {
    setMethodType('simpson38');
    setIsTabular(true);
    setTabularPoints(
      SIMPSON38_TABULAR_PRESET.points.map((p, idx) => ({
        id: String(idx + 1),
        x: String(p.x),
        y: String(p.y),
      }))
    );
    setVariableName('x');
    setRateUnit('m');
    setIntegralUnit('m²');
    setVariableUnit('m');
  };

  const loadPracticePreset = (key: keyof typeof PRACTICE_PRESETS) => {
    const p = PRACTICE_PRESETS[key];
    setIsTabular(false);
    setExpression(p.expression);
    setA(p.a.toString());
    setB(p.b.toString());
    setN(p.n.toString());
    setVariableName(p.variableName);
    setRateUnit('');
    setIntegralUnit('');
    setVariableUnit('');
    setHasExactReference(true);
    setExactValueStr(p.exactValue.toFixed(6));
    setExactDescription(p.exactExpressionDescription);
    setMFichaStr('');
    setMValidStr('');
  };

  const handleAddPoint = () => {
    const lastX =
      tabularPoints.length > 0 ? parseFloat(tabularPoints[tabularPoints.length - 1].x) : 0;
    const step =
      tabularPoints.length >= 2
        ? parseFloat(tabularPoints[1].x) - parseFloat(tabularPoints[0].x)
        : 1;
    const nextX = !isNaN(lastX) && !isNaN(step) ? lastX + step : '';

    setTabularPoints([
      ...tabularPoints,
      {
        id: Math.random().toString(36).substring(2, 9),
        x: String(nextX),
        y: '0',
      },
    ]);
  };

  const handleRemovePoint = (id: string) => {
    if (tabularPoints.length <= 4) return;
    setTabularPoints(tabularPoints.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="p-1.5 bg-primary/10 rounded-lg text-primary text-sm">⚙️</span>
            <span>Parámetros de Integración</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Configuración de método, función, partición y cotas de error
          </p>
        </div>
      </div>

      {/* Selector de Método (Simpson 1/3 vs Simpson 3/8) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider block">
          Método de Integración (Sesión 13)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMethodType('simpson13');
              if (parseInt(n, 10) % 2 !== 0) setN('6');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
              methodType === 'simpson13'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-surface-secondary text-foreground-muted border-border hover:bg-border/60'
            }`}
          >
            <span>Simpson 1/3 Compuesto</span>
            <span className="text-[10px] font-normal opacity-90">n par (mínimo 2)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMethodType('simpson38');
              if (parseInt(n, 10) % 3 !== 0) setN('6');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
              methodType === 'simpson38'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-surface-secondary text-foreground-muted border-border hover:bg-border/60'
            }`}
          >
            <span>Simpson 3/8 Compuesto</span>
            <span className="text-[10px] font-normal opacity-90">n múltiplo de 3</span>
          </button>
        </div>
      </div>

      {/* Selector de Modo: Función Analítica vs Datos Tabulados */}
      <div className="flex rounded-xl bg-surface-secondary/70 p-1 border border-border/50 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setIsTabular(false)}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            !isTabular ? 'bg-surface text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          Función Analítica f(t)
        </button>
        <button
          type="button"
          onClick={() => setIsTabular(true)}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            isTabular ? 'bg-surface text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          Datos Tabulados (Puntos)
        </button>
      </div>

      {/* Presets Rápidos */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider block">
          Casos Predefinidos y Guía
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadAutonomousPreset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>⭐</span>
            <span>Actividad Autónoma: P(t) [0, 6] h</span>
          </button>

          <button
            type="button"
            onClick={loadSimpson38TabularPreset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>🌊</span>
            <span>Guía Simpson 3/8: Canal (78.9375 m²)</span>
          </button>

          <button
            type="button"
            onClick={() => loadPracticePreset('invX')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-secondary text-foreground hover:bg-border/60 transition-colors border border-border/50"
          >
            1/x [3, 3.6]
          </button>

          <button
            type="button"
            onClick={() => loadPracticePreset('expX')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-secondary text-foreground hover:bg-border/60 transition-colors border border-border/50"
          >
            e^x [0, 1]
          </button>

          <button
            type="button"
            onClick={() => loadPracticePreset('sqrtRational')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-secondary text-foreground hover:bg-border/60 transition-colors border border-border/50"
          >
            1/√(1+x²) [0, 4]
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isTabular ? (
          <>
            {/* Input de la Función */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Función f({variableName}) o P({variableName})
                </label>
                <span className="text-[11px] text-foreground-muted">
                  Soporta <code className="bg-surface-secondary px-1 py-0.5 rounded text-accent">sen</code>, <code className="bg-surface-secondary px-1 py-0.5 rounded text-accent">π</code>, <code className="bg-surface-secondary px-1 py-0.5 rounded text-accent">e^(0,2t)</code>, <code className="bg-surface-secondary px-1 py-0.5 rounded text-accent">√</code>
                </span>
              </div>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Ej: 10 + 5*t*sin(pi*t/6) + exp(0.2*t)"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner"
                required
              />

              {!syntaxStatus.isValid && syntaxStatus.error && (
                <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                  <span>⚠️</span>
                  <span>{syntaxStatus.error}</span>
                </p>
              )}
              {syntaxStatus.isValid && syntaxStatus.normalized && (
                <p className="text-[11px] text-foreground-muted flex items-center gap-1 mt-1 font-mono">
                  <span className="text-success">✓</span>
                  <span>Interpretado como: {syntaxStatus.normalized}</span>
                </p>
              )}
            </div>

            {/* Límites de Integración [a, b] y Subintervalos n */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Límite a
                </label>
                <input
                  type="number"
                  step="any"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Límite b
                </label>
                <input
                  type="number"
                  step="any"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Subintervalos (n)</span>
                  {methodType === 'simpson13' && (
                    <span className="text-[10px] text-primary font-bold">PAR</span>
                  )}
                  {methodType === 'simpson38' && (
                    <span className="text-[10px] text-primary font-bold">MÚLTIPLO 3</span>
                  )}
                </label>
                <input
                  type="number"
                  min={methodType === 'simpson13' ? 2 : 3}
                  step={methodType === 'simpson13' ? 2 : 3}
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:ring-2 transition-all ${
                    (methodType === 'simpson13' && isNOdd) ||
                    (methodType === 'simpson38' && isNNotMult3)
                      ? 'border-error ring-1 ring-error/50 bg-error/5'
                      : 'border-border focus:ring-primary/50 focus:border-primary'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Alertas preventivas en vivo de paridad o divisibilidad */}
            {methodType === 'simpson13' && isNOdd && (
              <div className="p-3 bg-error/10 border border-error/30 text-error rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                <span className="text-base mt-0.5">⚠️</span>
                <div>
                  <p className="font-bold">n = {n} es impar</p>
                  <p className="text-[11px] leading-relaxed mt-0.5">
                    La regla de Simpson 1/3 requiere obligatoriamente que el número de subintervalos n sea <strong>par (múltiplo de 2)</strong>, porque cada parábola interpolante requiere 2 subintervalos contiguos (3 puntos). Corrige a n = 2, 4, 6, 8, 12, etc.
                  </p>
                </div>
              </div>
            )}

            {methodType === 'simpson38' && isNNotMult3 && (
              <div className="p-3 bg-error/10 border border-error/30 text-error rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                <span className="text-base mt-0.5">⚠️</span>
                <div>
                  <p className="font-bold">n = {n} no es divisible por 3</p>
                  <p className="text-[11px] leading-relaxed mt-0.5">
                    La regla de Simpson 3/8 requiere que n sea <strong>múltiplo positivo de 3</strong>, porque cada polinomio cúbico requiere 3 subintervalos contiguos (4 puntos). Corrige a n = 3, 6, 9, 12, etc.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Modo de Datos Tabulados */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Tabla de Puntos (x_i, y_i)
              </label>
              <button
                type="button"
                onClick={handleAddPoint}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                + Añadir Punto
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {tabularPoints.map((pt, idx) => (
                <div key={pt.id} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground-muted w-6 text-right">
                    i={idx}:
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={pt.x}
                    onChange={(e) => {
                      const newPts = [...tabularPoints];
                      newPts[idx].x = e.target.value;
                      setTabularPoints(newPts);
                    }}
                    placeholder="x_i"
                    className="w-1/2 px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-mono"
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    value={pt.y}
                    onChange={(e) => {
                      const newPts = [...tabularPoints];
                      newPts[idx].y = e.target.value;
                      setTabularPoints(newPts);
                    }}
                    placeholder="f(x_i)"
                    className="w-1/2 px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-mono"
                    required
                  />
                  {tabularPoints.length > 4 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(pt.id)}
                      className="text-error hover:text-error/80 p-1 text-xs"
                      title="Eliminar fila"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-foreground-muted">
              Total puntos: {tabularPoints.length} (n = {tabularPoints.length - 1} subintervalos). Los puntos deben estar equiespaciados.
            </p>
          </div>
        )}

        {/* Sección de Cotas de Error Teórico (M) */}
        {!isTabular && (
          <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border/50 space-y-3">
            <span className="text-xs font-semibold text-foreground block">
              Parámetros de Cotas de Error Teórico |E_t| ≤ (b-a)h⁴M / {methodType === 'simpson13' ? '180' : '80'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-foreground-muted block mb-1">
                  M Ficha (ej: 0.45 kW/h⁴)
                </label>
                <input
                  type="number"
                  step="any"
                  value={mFichaStr}
                  onChange={(e) => setMFichaStr(e.target.value)}
                  placeholder="Dato de la ficha"
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-mono"
                />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">
                  Dato del enunciado (no garantiza acotación)
                </span>
              </div>
              <div>
                <label className="text-[11px] font-bold text-foreground-muted block mb-1">
                  M Válido (ej: 5.131103802 kW/h⁴)
                </label>
                <input
                  type="number"
                  step="any"
                  value={mValidStr}
                  onChange={(e) => setMValidStr(e.target.value)}
                  placeholder="Cota verificable max |f⁽⁴⁾|"
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-mono"
                />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Cota matemáticamente garantizada
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Unidades y Variable */}
        <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border/50 space-y-3">
          <span className="text-xs font-semibold text-foreground block">
            Unidades Físicas (Opcional)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted uppercase block mb-1">
                Variable
              </label>
              <input
                type="text"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-mono text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted uppercase block mb-1">
                Tasa f({variableName})
              </label>
              <input
                type="text"
                value={rateUnit}
                onChange={(e) => setRateUnit(e.target.value)}
                placeholder="ej: kW"
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-mono text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted uppercase block mb-1">
                Integral
              </label>
              <input
                type="text"
                value={integralUnit}
                onChange={(e) => setIntegralUnit(e.target.value)}
                placeholder="ej: kWh"
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-mono text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted uppercase block mb-1">
                Eje X
              </label>
              <input
                type="text"
                value={variableUnit}
                onChange={(e) => setVariableUnit(e.target.value)}
                placeholder="ej: h"
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-mono text-center"
              />
            </div>
          </div>
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isLoading || (!isTabular && !syntaxStatus.isValid)}
          className="w-full py-3.5 px-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="animate-spin text-sm">⏳</span>
              <span>Calculando Integración...</span>
            </>
          ) : (
            <>
              <span>∫</span>
              <span>
                Calcular por{' '}
                {methodType === 'simpson13' ? 'Simpson 1/3' : 'Simpson 3/8'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
