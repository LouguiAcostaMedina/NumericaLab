'use client';

import React, { useState } from 'react';
import { Matrix, Vector } from '../../core/domain/types';

interface LinearSystemInputProps {
  isLoading?: boolean;
  onSubmit: (A: Matrix, B: Vector, size: number, x0?: Vector, tolerance?: number, maxIterations?: number) => void;
  title?: string;
  defaultSize?: number;
  isIterative?: boolean;
}

export function LinearSystemInput({ isLoading = false, onSubmit, title = "Configuración del Sistema AX = B", defaultSize = 3, isIterative = false }: LinearSystemInputProps) {
  const [size, setSize] = useState<number>(defaultSize);
  const [matrixA, setMatrixA] = useState<string[][]>(() => 
    Array(defaultSize).fill(0).map(() => Array(defaultSize).fill(''))
  );
  const [vectorB, setVectorB] = useState<string[]>(() => Array(defaultSize).fill(''));
  const [vectorX0, setVectorX0] = useState<string[]>(() => Array(defaultSize).fill('0'));
  const [tolerance, setTolerance] = useState<string>('1e-4');
  const [maxIterations, setMaxIterations] = useState<string>('100');

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);

    setMatrixA((prevA) => {
      const newA = Array(newSize).fill(0).map(() => Array(newSize).fill(''));
      for (let i = 0; i < Math.min(prevA.length, newSize); i++) {
        for (let j = 0; j < Math.min(prevA[i].length, newSize); j++) {
          newA[i][j] = prevA[i][j];
        }
      }
      return newA;
    });

    setVectorB((prevB) => {
      const newB = Array(newSize).fill('');
      for (let i = 0; i < Math.min(prevB.length, newSize); i++) {
        newB[i] = prevB[i];
      }
      return newB;
    });

    setVectorX0((prevX0) => {
      const newX0 = Array(newSize).fill('0');
      for (let i = 0; i < Math.min(prevX0.length, newSize); i++) {
        newX0[i] = prevX0[i] !== '' ? prevX0[i] : '0';
      }
      return newX0;
    });
  };

  const handleMatrixChange = (row: number, col: number, value: string) => {
    setMatrixA(prev => {
      const newA = [...prev];
      newA[row] = [...newA[row]];
      newA[row][col] = value;
      return newA;
    });
  };

  const handleVectorChange = (row: number, value: string) => {
    setVectorB(prev => {
      const newB = [...prev];
      newB[row] = value;
      return newB;
    });
  };

  const handleVectorX0Change = (row: number, value: string) => {
    setVectorX0(prev => {
      const newX0 = [...prev];
      newX0[row] = value;
      return newX0;
    });
  };

  const loadExample = () => {
    setSize(3);
    setMatrixA([
      ['4', '2', '1'],
      ['12', '10', '5'],
      ['-8', '8', '7']
    ]);
    setVectorB(['14', '46', '26']);
    setVectorX0(['0', '0', '0']);
    setTolerance('1e-4');
    setMaxIterations('100');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar y parsear a números
    const parsedA: Matrix = [];
    const parsedB: Vector = [];

    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        const val = parseFloat(matrixA[i][j]);
        if (isNaN(val)) {
          alert(`Por favor, ingresa un valor numérico en A[${i+1}][${j+1}]`);
          return;
        }
        row.push(val);
      }
      parsedA.push(row);

      const valB = parseFloat(vectorB[i]);
      if (isNaN(valB)) {
        alert(`Por favor, ingresa un valor numérico en B[${i+1}]`);
        return;
      }
      parsedB.push(valB);
    }

    if (isIterative) {
      const parsedX0: Vector = [];
      for (let i = 0; i < size; i++) {
        const valX0 = parseFloat(vectorX0[i]);
        if (isNaN(valX0)) {
          alert(`Por favor, ingresa un valor numérico en X0[${i+1}]`);
          return;
        }
        parsedX0.push(valX0);
      }

      const parsedTolerance = parseFloat(tolerance);
      if (isNaN(parsedTolerance) || parsedTolerance <= 0) {
        alert('La tolerancia debe ser un número positivo mayor que cero.');
        return;
      }

      const parsedMaxIter = parseInt(maxIterations, 10);
      if (isNaN(parsedMaxIter) || parsedMaxIter <= 0) {
        alert('El máximo de iteraciones debe ser un entero positivo.');
        return;
      }

      onSubmit(parsedA, parsedB, size, parsedX0, parsedTolerance, parsedMaxIter);
    } else {
      onSubmit(parsedA, parsedB, size);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span>⚙️</span> {title}
        </h3>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadExample}
            className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            title="Cargar ejemplo (3x3)"
          >
            <span>📝</span> Cargar Ejemplo
          </button>
          
          <div className="flex items-center gap-2 bg-surface-secondary px-3 py-1.5 rounded-lg border border-border">
            <label className="text-[11px] font-medium text-foreground-muted uppercase tracking-wider">
              Tamaño (n):
            </label>
            <select
              value={size}
              onChange={(e) => handleSizeChange(parseInt(e.target.value, 10))}
              className="bg-transparent text-sm font-bold text-foreground focus:outline-none cursor-pointer"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n} × {n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-4 min-w-max">
          {/* Matriz A */}
          <div className="space-y-2">
            <div className="text-center text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-4">
              Matriz A (Coeficientes)
            </div>
            
            <div className="relative p-4 border-l-2 border-r-2 border-foreground-muted rounded-sm">
              {matrixA.length === size && matrixA.map((row, i) => (
                <div key={`row-${i}`} className="flex gap-2 mb-2 last:mb-0">
                  {row.map((val, j) => (
                    <input
                      key={`a-${i}-${j}`}
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                      placeholder={`a${i+1}${j+1}`}
                      required
                      className="w-16 h-10 text-center rounded bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Símbolo = */}
          <div className="flex flex-col justify-center h-full pt-12 px-2">
            <span className="text-2xl text-foreground-muted font-bold">=</span>
          </div>

          {/* Vector B */}
          <div className="space-y-2">
            <div className="text-center text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-4">
              Vector B
            </div>
            
            <div className="relative p-4 border-l-2 border-r-2 border-foreground-muted rounded-sm">
              {vectorB.length === size && vectorB.map((val, i) => (
                <div key={`b-${i}`} className="flex mb-2 last:mb-0">
                  <input
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => handleVectorChange(i, e.target.value)}
                    placeholder={`b${i+1}`}
                    required
                    className="w-16 h-10 text-center rounded bg-primary/5 border border-primary/20 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm font-bold"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Configuración Iterativa */}
          {isIterative && (
            <>
              <div className="flex flex-col justify-center h-full pt-12 px-2">
                <div className="h-full border-l border-border/50"></div>
              </div>
              
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-4">
                  Vector Inicial x⁽⁰⁾
                </div>
                
                <div className="relative p-4 border-l-2 border-r-2 border-foreground-muted rounded-sm bg-surface-secondary/50">
                  {vectorX0.length === size && vectorX0.map((val, i) => (
                    <div key={`x0-${i}`} className="flex mb-2 last:mb-0">
                      <input
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleVectorX0Change(i, e.target.value)}
                        placeholder={`x0_${i+1}`}
                        required
                        className="w-16 h-10 text-center rounded bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isIterative && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground">Tolerancia (ε)</label>
            <input
              type="number"
              step="any"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              placeholder="Ej: 1e-4"
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <p className="text-xs text-foreground-muted">Error relativo máximo aceptado.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground">Iteraciones máximas</label>
            <input
              type="number"
              min="1"
              step="1"
              value={maxIterations}
              onChange={(e) => setMaxIterations(e.target.value)}
              placeholder="Ej: 100"
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <p className="text-xs text-foreground-muted">Límite para evitar bucles infinitos.</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background bg-primary hover:bg-primary/90 focus:ring-primary text-white ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Procesando Sistema...
          </>
        ) : (
          '🔢 Resolver Sistema'
        )}
      </button>
    </form>
  );
}
