'use client';

import React, { useEffect, useState } from 'react';
import { CalculationHistoryItem } from '../core/domain/history';
import { HistoryStorage } from '../core/utils/historyStorage';

interface HistoryDrawerProps {
  onSelectHistoryItem: (item: CalculationHistoryItem) => void;
}

/**
 * Panel desplegable de Historial de Sesiones guardado en localStorage.
 */
export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ onSelectHistoryItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);

  const loadHistory = () => {
    setHistory(HistoryStorage.getHistory());
  };

  useEffect(() => {
    loadHistory();
  }, [isOpen]);

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de que deseas borrar todo el historial de sesiones?')) {
      HistoryStorage.clearAll();
      loadHistory();
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    HistoryStorage.removeEntry(id);
    loadHistory();
  };

  return (
    <div className="relative">
      {/* Botón flotante para abrir el historial */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
      >
        <span>📜</span>
        <span>Historial de Sesión ({history.length})</span>
        <span className="text-[10px] text-zinc-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Popover / Panel del Historial */}
      {isOpen && (
        <div className="absolute right-0 top-10 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-4 space-y-3 animate-fade-in max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>🕒</span> Historial Reciente (localStorage)
            </h4>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[10px] text-rose-500 hover:underline font-semibold cursor-pointer"
              >
                Limpiar Todo
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">
              No hay cálculos guardados en esta sesión aún.
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    setIsOpen(false);
                  }}
                  className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:border-cyan-500/50 transition-all cursor-pointer group text-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      {item.methodName}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveItem(e, item.id)}
                        className="text-zinc-400 hover:text-rose-500 text-xs px-1"
                        title="Eliminar registro"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <p className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 truncate mt-1">
                    {item.expression}
                  </p>

                  {item.rootSummary && (
                    <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Raíz: {item.rootSummary}</span>
                      <span>Iter: {item.iterationsCount ?? 'N/A'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
