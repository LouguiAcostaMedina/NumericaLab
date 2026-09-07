'use client';

import React, { useState } from 'react';

interface EducationalTooltipProps {
  term: string;
  explanation: string;
}

/**
 * Tooltip educativo estandarizado con icono de ayuda para explicar conceptos técnicos.
 */
export const EducationalTooltip: React.FC<EducationalTooltipProps> = ({ term, explanation }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{term}</span>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="w-4 h-4 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800 text-[10px] font-bold flex items-center justify-center cursor-pointer hover:bg-cyan-200 dark:hover:bg-cyan-900 transition-colors"
        aria-label={`Explicación de ${term}`}
      >
        ?
      </button>

      {isVisible && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs rounded-xl shadow-xl z-50 pointer-events-none animate-fade-in border border-zinc-700 dark:border-zinc-300 leading-relaxed font-sans">
          <span className="font-bold block mb-1 text-cyan-400 dark:text-cyan-700">{term}</span>
          {explanation}
        </span>
      )}
    </span>
  );
};
