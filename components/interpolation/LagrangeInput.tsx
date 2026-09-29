import React, { useState } from 'react';

export interface InterpolationPointInput {
  id: string;
  x: string;
  y: string;
}

interface LagrangeInputProps {
  isLoading: boolean;
  onSubmit: (points: { x: number; y: number }[], xEval?: number) => void;
}

const DEFAULT_POINTS: InterpolationPointInput[] = [
  { id: '1', x: '2', y: '150' },
  { id: '2', x: '4', y: '85' },
  { id: '3', x: '8', y: '50' },
  { id: '4', x: '12', y: '70' }
];

export function LagrangeInput({ isLoading, onSubmit }: LagrangeInputProps) {
  const [points, setPoints] = useState<InterpolationPointInput[]>(DEFAULT_POINTS);
  const [xEval, setXEval] = useState<string>('6');
  const [error, setError] = useState<string | null>(null);

  const handleAddPoint = () => {
    setPoints([...points, { id: Math.random().toString(36).substr(2, 9), x: '', y: '' }]);
  };

  const handleRemovePoint = (id: string, index: number) => {
    if (points.length <= 2) {
      setError('Se requieren al menos dos puntos para realizar una interpolación.');
      return;
    }
    setPoints(points.filter((p) => p.id !== id));
  };

  const handlePointChange = (id: string, field: 'x' | 'y', value: string) => {
    setPoints(points.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    setError(null);
  };

  const loadExample = () => {
    setPoints(DEFAULT_POINTS);
    setXEval('6');
    setError(null);
  };

  const parseNumber = (val: string): number | null => {
    if (!val || val.trim() === '') return null;
    const parsed = Number(val.replace(',', '.'));
    if (isNaN(parsed) || !isFinite(parsed)) return null;
    return parsed;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPoints: { x: number; y: number }[] = [];
    
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.x.trim() === '') {
        setError(`Falta el valor x del punto P${i}.`);
        return;
      }
      const xVal = parseNumber(p.x);
      if (xVal === null) {
        setError(`'${p.x}' no es un valor numérico válido para x${i}.`);
        return;
      }
      if (!isFinite(xVal) || Math.abs(xVal) > 1e100) {
        setError(`El valor ingresado en x${i} excede el rango numérico permitido.`);
        return;
      }
      
      if (p.y.trim() === '') {
        setError(`Falta el valor y del punto P${i}.`);
        return;
      }
      const yVal = parseNumber(p.y);
      if (yVal === null) {
        setError(`'${p.y}' no es un valor numérico válido para y${i}.`);
        return;
      }
      if (!isFinite(yVal) || Math.abs(yVal) > 1e100) {
        setError(`El valor ingresado en y${i} excede el rango numérico permitido.`);
        return;
      }
      
      parsedPoints.push({ x: xVal, y: yVal });
    }

    if (parsedPoints.length < 2) {
      setError('Se requieren al menos dos puntos para realizar una interpolación.');
      return;
    }

    let parsedXEval: number | undefined = undefined;
    if (xEval.trim() !== '') {
      parsedXEval = parseNumber(xEval) ?? undefined;
      if (parsedXEval === undefined) {
        setError('El punto de evaluación debe ser un número válido.');
        return;
      }
    } else {
      setError('Ingrese el punto x donde desea evaluar el polinomio.');
      return;
    }

    onSubmit(parsedPoints, parsedXEval);
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 md:p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">Puntos de Interpolación</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center px-2">
            <span className="w-8 text-xs font-bold text-foreground-muted uppercase">Punto</span>
            <span className="text-xs font-bold text-foreground-muted uppercase text-center">X (xi)</span>
            <span className="text-xs font-bold text-foreground-muted uppercase text-center">Y (yi)</span>
            <span className="w-8"></span>
          </div>
          
          {points.map((p, index) => (
            <div key={p.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
              <span className="w-8 text-sm font-mono text-foreground font-medium text-center">
                P{index}
              </span>
              <input
                type="text"
                value={p.x}
                onChange={(e) => handlePointChange(p.id, 'x', e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="x"
                aria-label={`Valor x del punto P${index}`}
              />
              <input
                type="text"
                value={p.y}
                onChange={(e) => handlePointChange(p.id, 'y', e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="y"
                aria-label={`Valor y del punto P${index}`}
              />
              <button
                type="button"
                onClick={() => handleRemovePoint(p.id, index)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus:outline-none"
                aria-label={`Eliminar punto P${index}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddPoint}
          className="w-full py-2 border-2 border-dashed border-border rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          + Agregar Punto
        </button>

        <div className="pt-4 border-t border-border">
          <label className="block text-sm font-bold text-foreground mb-2">
            Punto a Evaluar (x)
          </label>
          <input
            type="text"
            value={xEval}
            onChange={(e) => {
              setXEval(e.target.value);
              setError(null);
            }}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            placeholder="Ej: 6"
            aria-label="Punto de evaluación"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={loadExample}
            className="flex-1 py-3 px-4 bg-surface-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-colors border border-border"
          >
            Cargar ejemplo de la actividad
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Calculando...' : 'Interpolar'}
          </button>
        </div>
      </form>
    </div>
  );
}
