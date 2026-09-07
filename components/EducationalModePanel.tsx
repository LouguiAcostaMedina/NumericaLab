'use client';

import React, { useState } from 'react';
import { EducationalNarrative } from '../core/math/educationalNarrator';

interface EducationalModePanelProps {
  narrative: EducationalNarrative;
}

/**
 * Panel con Toggle de Modo Educativo para desplegar narrativas en lenguaje natural.
 */
export const EducationalModePanel: React.FC<EducationalModePanelProps> = ({ narrative }) => {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <h4 className="font-bold text-base text-zinc-900 dark:text-white">
            {narrative.title}
          </h4>
        </div>

        {/* Switch / Toggle de Modo Educativo */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Modo Educativo:
          </span>
          <button
            type="button"
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              isEnabled ? 'bg-cyan-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {isEnabled ? (
        <div className="space-y-4 text-xs animate-fade-in">
          {/* Narrativa Principal de Resumen */}
          <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
            <span className="font-bold block mb-1 text-cyan-800 dark:text-cyan-300 text-sm">
              📝 Conclusión Académica Redactada:
            </span>
            {narrative.summaryNarrative}
          </div>

          {/* Desglose Paso a Paso */}
          {narrative.stepNarratives.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-zinc-700 dark:text-zinc-300 text-xs uppercase tracking-wider">
                Desglose Iterativo Paso a Paso:
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {narrative.stepNarratives.map((step) => (
                  <div
                    key={step.step}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5"
                  >
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950 px-2 py-0.5 rounded text-[11px] font-mono">
                      #{step.step}
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-zinc-900 dark:text-white">{step.text}</p>
                      {step.details && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">{step.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insight de Ingeniería */}
          {narrative.engineeringInsight && (
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-200 leading-relaxed">
              <span className="font-bold">💡 Aplicación en Ingeniería:</span> {narrative.engineeringInsight}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-zinc-400 italic">
          El Modo Educativo está pausado. Haz clic en el switch para activar las explicaciones paso a paso en lenguaje natural.
        </p>
      )}
    </div>
  );
};
