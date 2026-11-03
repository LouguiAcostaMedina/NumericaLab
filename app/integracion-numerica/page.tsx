'use client';

import React from 'react';
import { MethodCard } from '../../components/MethodCard';

export default function IntegracionNumericaHubPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 mb-3">
          <span>Unidad 3</span>
          <span>•</span>
          <span>Integración Numérica</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
          Métodos de Integración Numérica (Cuadratura)
        </h1>
        <p className="text-foreground-muted text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
          Módulo completo para aproximar integrales definidas de funciones analíticas y datos tabulados mediante fórmulas cerradas de Newton-Cotes de órdenes 1, 2 y 3.
        </p>
      </div>

      {/* Grid de Métodos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MethodCard
          title="Regla del Trapecio (Sesión 12)"
          description="Aproximación lineal por segmentos rectilíneos y trapecios (Newton-Cotes de orden 1). Análisis de convergencia O(h²) y caso de transmisión de datos R(t)."
          icon="📐"
          href="/integracion-numerica/trapecio"
        />

        <MethodCard
          title="Simpson 1/3 Compuesto (Sesión 13)"
          description="Aproximación parabólica cuadrática (Newton-Cotes de orden 2). Requiere n par con coeficientes [1, 4, 2, 4, ..., 1]. Incluye Actividad Autónoma de potencia eléctrica P(t), referencias numéricas y análisis de cotas con M."
          icon="⚡"
          href="/integracion-numerica/simpson-1-3"
          isNew
        />

        <MethodCard
          title="Simpson 3/8 (Sesión 13)"
          description="Aproximación por polinomios cúbicos (Newton-Cotes de orden 3). Exige n múltiplo de 3 con coeficientes [1, 3, 3, 2, ..., 1]. Soporta funciones analíticas y datos tabulados equiespaciados (caso del canal de agua: 78.9375 m²)."
          icon="🌊"
          href="/integracion-numerica/simpson-3-8"
          isNew
        />
      </div>

      {/* Cuadro Comparativo de los Métodos */}
      <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <span>📊</span>
          <span>Comparativa de Fórmulas Cerradas de Newton-Cotes</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/40 text-foreground-muted text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Método</th>
                <th className="py-3 px-4 font-bold">Grado Polinomio</th>
                <th className="py-3 px-4 font-bold">Condición de Partición</th>
                <th className="py-3 px-4 font-bold">Patrón de Coeficientes</th>
                <th className="py-3 px-4 font-bold">Orden del Error</th>
                <th className="py-3 px-4 font-bold">Cota Teórica |E_t|</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground">
              <tr className="hover:bg-surface-secondary/40 transition-colors">
                <td className="py-3 px-4 font-bold text-primary">Trapecio Compuesto</td>
                <td className="py-3 px-4">Grado 1 (Lineal)</td>
                <td className="py-3 px-4">n ≥ 1</td>
                <td className="py-3 px-4 text-accent">[1, 2, 2, ..., 2, 1]</td>
                <td className="py-3 px-4">O(h²)</td>
                <td className="py-3 px-4">(b-a)h²M₂ / 12</td>
              </tr>
              <tr className="hover:bg-surface-secondary/40 transition-colors bg-amber-500/5">
                <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                  Simpson 1/3 Compuesto
                </td>
                <td className="py-3 px-4">Grado 2 (Parabólico)</td>
                <td className="py-3 px-4 font-bold text-error">n es PAR (n ≥ 2)</td>
                <td className="py-3 px-4 text-accent">[1, 4, 2, 4, ..., 2, 4, 1]</td>
                <td className="py-3 px-4">O(h⁴)</td>
                <td className="py-3 px-4">(b-a)h⁴M₄ / 180</td>
              </tr>
              <tr className="hover:bg-surface-secondary/40 transition-colors bg-blue-500/5">
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  Simpson 3/8 Compuesto
                </td>
                <td className="py-3 px-4">Grado 3 (Cúbico)</td>
                <td className="py-3 px-4 font-bold text-error">n MÚLTIPLO DE 3 (n ≥ 3)</td>
                <td className="py-3 px-4 text-accent">[1, 3, 3, 2, 3, 3, 2, ..., 1]</td>
                <td className="py-3 px-4">O(h⁴)</td>
                <td className="py-3 px-4">(b-a)h⁴M₄ / 80</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
