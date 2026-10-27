'use client';

import React, { useState, useEffect } from 'react';
import { MathParser } from '../../core/math/MathParser';
import { DOCENTE_CASE_PRESET } from '../../core/math/integration/trapezoid';

export interface TrapezoidFormData {
  expression: string;
  a: number;
  b: number;
  n: number;
  variableName: string;
  exactValue?: number;
  exactExpressionDescription?: string;
  isTheoreticalExact?: boolean;
  units?: {
    rateUnit?: string;
    integralUnit?: string;
    variableUnit?: string;
  };
}

interface TrapezoidFormProps {
  isLoading: boolean;
  onSubmit: (data: TrapezoidFormData) => void;
}

export function TrapezoidForm({ isLoading, onSubmit }: TrapezoidFormProps) {
  const [expression, setExpression] = useState(DOCENTE_CASE_PRESET.expression);
  const [a, setA] = useState<string>(DOCENTE_CASE_PRESET.a.toString());
  const [b, setB] = useState<string>(DOCENTE_CASE_PRESET.b.toString());
  const [n, setN] = useState<string>(DOCENTE_CASE_PRESET.n.toString());
  const [variableName, setVariableName] = useState('t');
  const [rateUnit, setRateUnit] = useState('Mbps');
  const [integralUnit, setIntegralUnit] = useState('Mb');
  const [variableUnit, setVariableUnit] = useState('s');

  const [exactValueStr, setExactValueStr] = useState<string>(
    DOCENTE_CASE_PRESET.exactValue.toFixed(6)
  );
  const [exactDescription, setExactDescription] = useState(
    DOCENTE_CASE_PRESET.exactExpressionDescription
  );
  const [hasExactReference, setHasExactReference] = useState(true);

  // Validación de sintaxis en vivo con debounce
  const [syntaxStatus, setSyntaxStatus] = useState<{
    isValid: boolean;
    error?: string;
    normalized?: string;
  }>({ isValid: true });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!expression.trim()) {
        setSyntaxStatus({ isValid: false, error: 'Ingresa una expresión matemática.' });
        return;
      }
      const res = await MathParser.parseAsync(expression);
      setSyntaxStatus(res);
    }, 250);

    return () => clearTimeout(timer);
  }, [expression]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedA = parseFloat(a);
    const parsedB = parseFloat(b);
    const parsedN = parseInt(n, 10);
    const parsedExact = hasExactReference && exactValueStr.trim() !== ''
      ? parseFloat(exactValueStr)
      : undefined;

    onSubmit({
      expression,
      a: parsedA,
      b: parsedB,
      n: parsedN,
      variableName,
      exactValue: parsedExact,
      exactExpressionDescription: hasExactReference ? exactDescription : undefined,
      isTheoreticalExact: hasExactReference,
      units: {
        rateUnit: rateUnit.trim() || undefined,
        integralUnit: integralUnit.trim() || undefined,
        variableUnit: variableUnit.trim() || undefined,
      },
    });
  };

  const loadDocentePreset = () => {
    setExpression(DOCENTE_CASE_PRESET.expression);
    setA(DOCENTE_CASE_PRESET.a.toString());
    setB(DOCENTE_CASE_PRESET.b.toString());
    setN(DOCENTE_CASE_PRESET.n.toString());
    setVariableName('t');
    setRateUnit('Mbps');
    setIntegralUnit('Mb');
    setVariableUnit('s');
    setHasExactReference(true);
    setExactValueStr(DOCENTE_CASE_PRESET.exactValue.toFixed(6));
    setExactDescription(DOCENTE_CASE_PRESET.exactExpressionDescription);
  };

  const loadSimpleTrapezoidPreset = () => {
    setExpression('x^2');
    setA('0');
    setB('2');
    setN('1');
    setVariableName('x');
    setRateUnit('');
    setIntegralUnit('');
    setVariableUnit('');
    setHasExactReference(true);
    setExactValueStr((8 / 3).toFixed(6)); // integral de x^2 en [0, 2] = 8/3 ≈ 2.666667
    setExactDescription('I = \\int_0^2 x^2 dx = \\frac{8}{3} \\approx 2.666667');
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
            Configura la función a integrar, límites e intervalos
          </p>
        </div>
      </div>

      {/* Botones de Presets Rápidos */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider block">
          Casos Predefinidos
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadDocentePreset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>⭐</span>
            <span>Caso Docente (Sesión 12: R(t))</span>
          </button>
          <button
            type="button"
            onClick={loadSimpleTrapezoidPreset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-secondary text-foreground hover:bg-border/60 transition-colors border border-border/50"
          >
            <span>📐</span>
            <span>Trapecio Simple (n=1, x²)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input de la Función */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Función f({variableName}) o R({variableName})
            </label>
            <span className="text-[11px] text-foreground-muted">
              Soporta <code className="bg-surface-secondary px-1 py-0.5 rounded text-accent">sen</code>, <code className="bg-surface-secondary px-1 py-0.5 rounded text-accent">π</code>, <code className="bg-surface-secondary px-1 py-0.5 rounded text-accent">exp</code>, <code className="bg-surface-secondary px-1 py-0.5 rounded text-accent">e^x</code>
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="Ej: 10 + 5*sin(pi*t/4) + exp(0.15*t)"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner"
              required
            />
          </div>

          {/* Validación sintáctica en vivo */}
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
              Límite Inferior (a)
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
              Límite Superior (b)
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
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Subintervalos (n)
            </label>
            <input
              type="number"
              min="1"
              max="100000"
              step="1"
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Unidades y Variable */}
        <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border/50 space-y-3">
          <span className="text-xs font-semibold text-foreground block">
            Unidades y Variables Físicas (Opcional)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-foreground-muted block mb-1">Variable</label>
              <input
                type="text"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                maxLength={2}
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-foreground-muted block mb-1">Unidad Var.</label>
              <input
                type="text"
                value={variableUnit}
                onChange={(e) => setVariableUnit(e.target.value)}
                placeholder="s"
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-foreground-muted block mb-1">Tasa f(t)</label>
              <input
                type="text"
                value={rateUnit}
                onChange={(e) => setRateUnit(e.target.value)}
                placeholder="Mbps"
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-foreground-muted block mb-1">Integral T_n</label>
              <input
                type="text"
                value={integralUnit}
                onChange={(e) => setIntegralUnit(e.target.value)}
                placeholder="Mb"
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Valor de Referencia Exacto (Opcional para cálculo de Error Real) */}
        <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Referencia Exacta para Cálculo de Error
            </span>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={hasExactReference}
                onChange={(e) => setHasExactReference(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Habilitar valor exacto</span>
            </label>
          </div>

          {hasExactReference && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-foreground-muted block mb-1">
                  Valor Numérico Exacto (D)
                </label>
                <input
                  type="number"
                  step="any"
                  value={exactValueStr}
                  onChange={(e) => setExactValueStr(e.target.value)}
                  placeholder="166.396712"
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-foreground-muted block mb-1">
                  Descripción Teórica
                </label>
                <input
                  type="text"
                  value={exactDescription}
                  onChange={(e) => setExactDescription(e.target.value)}
                  placeholder="D = 120 + 40/pi + (e^1.8 - 1)/0.15"
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground font-mono text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={isLoading || !syntaxStatus.isValid}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 active:scale-[0.99] transition-all text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Calculando Integración Numérica...</span>
            </>
          ) : (
            <>
              <span>∫</span>
              <span>Calcular Trapecio Compuesto</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
