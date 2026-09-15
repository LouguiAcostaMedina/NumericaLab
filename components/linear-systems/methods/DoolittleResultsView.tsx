'use client';

import React, { useState } from 'react';
import { Matrix, Vector, DoolittleResult } from '../../../core/domain/types';

interface DoolittleResultsViewProps {
  result: DoolittleResult;
  onSolveNewB: (newB: Vector) => void;
}

const MatrixView = ({ matrix, label }: { matrix: Matrix; label: string }) => (
  <div className="flex flex-col items-center p-4 bg-surface rounded-xl border border-border">
    <span className="text-xs font-bold text-foreground-muted mb-2 uppercase tracking-widest">{label}</span>
    <div className="flex border-l-2 border-r-2 border-foreground-muted px-2">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))` }}>
        {matrix.map((row, i) =>
          row.map((val, j) => (
            <div key={`${i}-${j}`} className="w-12 h-8 flex items-center justify-center font-mono text-sm text-foreground">
              {Number.isInteger(val) ? val : val.toFixed(4)}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const VectorView = ({ vector, label, highlight = false }: { vector: Vector; label: string; highlight?: boolean }) => (
  <div className={`flex flex-col items-center p-4 rounded-xl border ${
    highlight 
      ? 'bg-primary/10 border-primary/30' 
      : 'bg-surface border-border'
  }`}>
    <span className={`text-xs font-bold mb-2 uppercase tracking-widest ${
      highlight ? 'text-primary' : 'text-foreground-muted'
    }`}>
      {label}
    </span>
    <div className="flex flex-col gap-2 border-l-2 border-r-2 border-foreground-muted px-3 py-1">
      {vector.map((val, i) => (
        <div key={i} className={`h-8 flex items-center justify-center font-mono text-sm font-bold ${
          highlight ? 'text-primary' : 'text-foreground'
        }`}>
          {Number.isInteger(val) ? val : val.toFixed(4)}
        </div>
      ))}
    </div>
  </div>
);

export function DoolittleResultsView({ result, onSolveNewB }: DoolittleResultsViewProps) {
  const [newBValues, setNewBValues] = useState<string[]>(
    Array(result.originalB.length).fill('')
  );

  if (!result.success || !result.factorization || !result.solution) {
    return (
      <div className="p-6 bg-error/10 border border-error/30 rounded-xl text-error">
        <h3 className="font-bold mb-2">Error en la Factorización</h3>
        <p className="text-sm">{result.errorMessage}</p>
      </div>
    );
  }

  const { L, U } = result.factorization;
  const { Y, X, isFactorizationVerified, isSolutionVerified } = result.solution;

  const handleNewBSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedB: Vector = [];
    for (let i = 0; i < newBValues.length; i++) {
      const val = parseFloat(newBValues[i]);
      if (isNaN(val)) {
        alert(`Por favor, ingresa un valor numérico válido en la fila ${i+1}`);
        return;
      }
      parsedB.push(val);
    }
    onSolveNewB(parsedB);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap gap-4">
        <div className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
          isFactorizationVerified 
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-warning/10 border-warning/30 text-warning'
        }`}>
          <span>{isFactorizationVerified ? '✓' : '⚠️'}</span>
          <span>Factorización Verificada (LU ≈ A)</span>
        </div>
        
        <div className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
          isSolutionVerified 
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-warning/10 border-warning/30 text-warning'
        }`}>
          <span>{isSolutionVerified ? '✓' : '⚠️'}</span>
          <span>Solución Verificada (AX ≈ B)</span>
        </div>
      </div>

      {/* Step 1: LU Factorization */}
      <section className="bg-surface rounded-xl p-6 border border-border shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Paso 1: Factorización A = LU</h3>
        <p className="text-sm text-foreground-muted mb-6">
          La matriz original A se descompone en una matriz triangular inferior L (con unos en la diagonal principal) y una matriz triangular superior U.
        </p>
        
        <div className="flex flex-wrap items-center gap-6 overflow-x-auto pb-4">
          <MatrixView matrix={result.originalA} label="Matriz A" />
          <span className="text-2xl font-bold text-foreground-muted">=</span>
          <MatrixView matrix={L} label="Matriz L (Lower)" />
          <span className="text-2xl font-bold text-foreground-muted">×</span>
          <MatrixView matrix={U} label="Matriz U (Upper)" />
        </div>
      </section>

      {/* Step 2: Forward Substitution */}
      <section className="bg-surface rounded-xl p-6 border border-border shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Paso 2: Sustitución Hacia Adelante (LY = B)</h3>
        <p className="text-sm text-foreground-muted mb-6">
          Se resuelve el sistema intermedio utilizando la matriz L y el vector B para encontrar Y.
        </p>
        
        <div className="flex flex-wrap items-center gap-6 overflow-x-auto pb-4">
          <MatrixView matrix={L} label="Matriz L" />
          <span className="text-2xl font-bold text-foreground-muted">×</span>
          <VectorView vector={Y} label="Vector Y" />
          <span className="text-2xl font-bold text-foreground-muted">=</span>
          <VectorView vector={result.originalB} label="Vector B" />
        </div>
      </section>

      {/* Step 3: Backward Substitution */}
      <section className="bg-surface rounded-xl p-6 border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <span className="text-6xl font-black text-foreground-muted">X</span>
        </div>
        
        <h3 className="text-lg font-bold text-foreground mb-4">Paso 3: Sustitución Hacia Atrás (UX = Y)</h3>
        <p className="text-sm text-foreground-muted mb-6">
          Finalmente, se resuelve el sistema utilizando la matriz U y el vector intermedio Y para encontrar el vector solución X.
        </p>
        
        <div className="flex flex-wrap items-center gap-6 overflow-x-auto pb-4">
          <MatrixView matrix={U} label="Matriz U" />
          <span className="text-2xl font-bold text-foreground-muted">×</span>
          <VectorView vector={X} label="Vector X (Solución)" highlight />
          <span className="text-2xl font-bold text-foreground-muted">=</span>
          <VectorView vector={Y} label="Vector Y" />
        </div>
      </section>

      {/* Reutilización de LU */}
      <section className="bg-primary/5 rounded-xl p-6 border border-primary/20">
        <h3 className="text-lg font-bold text-primary mb-2">Resolver con otro vector B</h3>
        <p className="text-sm text-primary/80 mb-6">
          Ingresa un nuevo vector de términos independientes para resolver el sistema reutilizando las matrices L y U previamente calculadas (sin volver a factorizar A).
        </p>
        
        <form onSubmit={handleNewBSubmit} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex gap-2 p-3 bg-surface rounded-lg border border-border">
            {newBValues.map((val, i) => (
              <div key={`new-b-${i}`} className="flex flex-col gap-1 items-center">
                <label className="text-xs font-mono text-foreground-muted">B{i+1}</label>
                <input
                  type="number"
                  step="any"
                  value={val}
                  onChange={(e) => {
                    const newVals = [...newBValues];
                    newVals[i] = e.target.value;
                    setNewBValues(newVals);
                  }}
                  required
                  className="w-16 h-10 text-center rounded bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                />
              </div>
            ))}
          </div>
          
          <button
            type="submit"
            className="h-10 px-6 rounded-lg font-bold text-sm bg-primary hover:bg-primary/90 text-white transition-all shadow-sm flex items-center justify-center"
          >
            Resolver de nuevo
          </button>
        </form>
      </section>
    </div>
  );
}
