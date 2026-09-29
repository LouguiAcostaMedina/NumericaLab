'use client';

import React, { useState } from 'react';
import { ProcedureStep } from '../../core/domain/types';
import { ProcedureStepRenderer } from './ProcedureStepRenderer';

interface ManualSolutionViewProps {
  steps?: ProcedureStep[];
}

export function ManualSolutionView({ steps }: ManualSolutionViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden mt-6 animate-fade-in">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-surface-secondary/50 hover:bg-surface-secondary transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📘</span>
          <h3 className="text-lg font-bold text-foreground">Ver resolución manual paso a paso</h3>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-border space-y-8 bg-background">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {index !== steps.length - 1 && (
                <div className="absolute left-4 top-10 bottom-[-32px] w-0.5 bg-border z-0"></div>
              )}
              
              <div className="flex gap-4 relative z-10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                  {index + 1}
                </div>
                <div className="flex-grow pt-1">
                  <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                  <p className="text-sm text-foreground-muted mb-3">{step.description}</p>
                  
                  <ProcedureStepRenderer step={step} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
