import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl p-8 md:p-12 shadow-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-9xl font-extrabold select-none p-4">
          f(x)=0
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="bg-cyan-500/10 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-cyan-500/20">
            Fase 2: UI e Integración
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Resolución de Ecuaciones No Lineales
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
            Bienvenido a <span className="text-white font-semibold">NuméricaLab</span>, una calculadora y visualizador interactivo de métodos numéricos para encontrar raíces reales de funciones continuas.
          </p>
        </div>
      </div>

      {/* Grid of Methods */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Method 1: Bisection */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-cyan-500/10 text-cyan-500 rounded-lg flex items-center justify-center text-2xl font-bold">
              ⚖️
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Método de Bisección
            </h3>
            <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">
              Un método cerrado que garantiza convergencia si la función es continua en un intervalo $[a, b]$ y si los signos en los extremos son opuestos ($f(a) \cdot f(b) &lt; 0$). Se basa en dividir repetidamente el intervalo a la mitad.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/bisection"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              Comenzar Cálculo →
            </Link>
          </div>
        </div>

        {/* Method 2: False Position */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-lg flex items-center justify-center text-2xl font-bold">
              📉
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Falsa Posición
            </h3>
            <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">
              Método cerrado alternativo a bisección. Utiliza una interpolación lineal entre los extremos del intervalo para encontrar una aproximación de la raíz de forma más rápida.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/false-position"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Comenzar Cálculo →
            </Link>
          </div>
        </div>

        {/* Method 3: Newton-Raphson */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center text-2xl font-bold">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Newton-Raphson
            </h3>
            <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">
              Un método abierto de convergencia cuadrática (muy rápido) que utiliza aproximaciones basadas en la recta tangente de la función. Requiere un valor inicial $x_0$ y la derivada simbólica $f'(x)$.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/newton"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Comenzar Cálculo →
            </Link>
          </div>
        </div>

        {/* Method 4: Fixed Point */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center text-2xl font-bold">
              🎯
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Punto Fijo
            </h3>
            <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">
              Método abierto que transforma $f(x) = 0$ en la forma equivalente $x = g(x)$ y busca la intersección de $g(x)$ con la recta $y = x$ de manera iterativa. Requiere una semilla $x_0$.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/fixed-point"
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Comenzar Cálculo →
            </Link>
          </div>
        </div>

        {/* Method 5: Secant */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center text-2xl font-bold">
              📏
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Método de la Secante
            </h3>
            <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">
              Variante del método de Newton que reemplaza la derivada por una aproximación en base a dos semillas anteriores {"$x_{i-1}$ y $x_i$"}, ideal si la derivada analítica es compleja o costosa.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/secant"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Comenzar Cálculo →
            </Link>
          </div>
        </div>

        {/* Method 6: Müller & Polynomial Roots */}
        <div className="bg-gradient-to-br from-zinc-900 to-cyan-950 text-white rounded-xl p-6 border border-cyan-500/30 shadow-lg flex flex-col justify-between hover:shadow-cyan-500/10 transition-all duration-200 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center justify-center text-2xl font-bold border border-cyan-500/30">
              🎯
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Müller & Filtros IIR</span>
              <span className="text-[10px] bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full font-mono uppercase">Nuevo</span>
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Encuentra raíces reales y complejas mediante parabolas interpolantes. Incluye acotación de Lagrange, Descartes, deflación de Horner y análisis de estabilidad para filtros IIR (|z| &lt; 1).
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <Link
              href="/polynomials"
              className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300"
            >
              Iniciar Análisis Complejo →
            </Link>
          </div>
        </div>
      </div>

      {/* Instructions / Summary */}
      <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-xl p-6 space-y-4">
        <h4 className="font-bold text-zinc-900 dark:text-white">Instrucciones de Uso General</h4>
        <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400 text-sm">
          <li>Selecciona un método en el menú lateral izquierdo o mediante las tarjetas superiores.</li>
          <li>Ingresa la función matemática en notación estándar de javascript/mathjs (ej: <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">x^3 - x - 1</code> o <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">sin(x) - x/2</code>).</li>
          <li>Define el intervalo inicial (Bisección) o la semilla inicial (Newton-Raphson).</li>
          <li>Ajusta la tolerancia (en %) y el límite de iteraciones según sea necesario.</li>
          <li>Presiona <strong>"Calcular"</strong> para ver el desglose detallado paso a paso en la tabla de iteraciones.</li>
        </ul>
      </div>
    </div>
  );
}
