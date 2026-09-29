'use client';

import React from 'react';
import { ProcedureStep } from '../../core/domain/types';

interface ProcedureStepRendererProps {
  step: ProcedureStep;
}

export function ProcedureStepRenderer({ step }: ProcedureStepRendererProps) {
  
  const renderFormula = (expr: string) => {
    // For now, simple mono text rendering. Can be upgraded to KaTeX later.
    return (
      <div className="bg-surface-secondary border border-border rounded-lg p-4 overflow-x-auto my-2">
        <code className="text-sm font-mono text-primary whitespace-nowrap">
          {expr}
        </code>
      </div>
    );
  };

  const renderMatrix = (matrix: number[][]) => {
    return (
      <div className="bg-surface-secondary border border-border rounded-lg p-4 overflow-x-auto my-2">
        <table className="border-collapse mx-auto">
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => (
                  <td key={j} className="px-4 py-2 border border-border/50 text-center font-mono text-sm">
                    {val.toFixed(4).replace(/\.0000$/, '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {step.mathExpression && renderFormula(step.mathExpression)}
      {step.matrixData && renderMatrix(step.matrixData)}
    </div>
  );
}
