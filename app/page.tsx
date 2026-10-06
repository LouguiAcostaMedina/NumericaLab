import Link from "next/link";
import { MethodCard } from "../components/MethodCard";

export default function Home() {
  return (
    <div className="space-y-12 animate-fade-in pb-12">
      
      {/* Hero Section */}
      <section className="bg-surface/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl shadow-black/5 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="space-y-6 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 shadow-inner">
            <span>Análisis Numérico</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">NuméricaLab</span>
          </h1>
          <p className="text-foreground-muted text-base md:text-lg leading-relaxed">
            Plataforma interactiva para visualizar y calcular métodos numéricos. Encuentra raíces de ecuaciones no lineales y resuelve sistemas matriciales con explicaciones paso a paso.
          </p>
        </div>
        <div className="hidden md:flex text-[12rem] text-primary/5 select-none font-serif leading-none drop-shadow-sm relative z-10">
          ∫
        </div>
      </section>

      {/* Category: Raíces de Ecuaciones */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="text-2xl font-bold text-foreground">Raíces de Ecuaciones</h2>
          <p className="text-sm text-foreground-muted mt-1">Métodos cerrados y abiertos para f(x) = 0</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <MethodCard 
            title="Bisección"
            description="Método cerrado, seguro y convergente. Corta el intervalo a la mitad evaluando cambios de signo."
            icon="⚖️"
            href="/bisection"
          />
          <MethodCard 
            title="Falsa Posición"
            description="Variante de bisección. Usa una recta secante para aproximar la raíz y converger más rápido."
            icon="📉"
            href="/false-position"
          />
          <MethodCard 
            title="Newton-Raphson"
            description="Método abierto muy rápido. Utiliza la derivada de la función para trazar tangentes iterativas."
            icon="⚡"
            href="/newton"
          />
          <MethodCard 
            title="Punto Fijo"
            description="Despeja x de f(x)=0 formando g(x). Converge si la derivada de g(x) es menor a 1."
            icon="🎯"
            href="/fixed-point"
          />
          <MethodCard 
            title="Secante"
            description="Similar a Newton pero no requiere derivada analítica. Aproxima la tangente con dos puntos previos."
            icon="📏"
            href="/secant"
          />
          <MethodCard 
            title="Müller & Polinomios"
            description="Encuentra raíces reales y complejas mediante parábolas interpolantes. Ideal para polinomios."
            icon="🔄"
            href="/polynomials"
          />
        </div>
      </section>

      {/* Category: Sistemas Lineales */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="text-2xl font-bold text-foreground">Sistemas de Ecuaciones Lineales</h2>
          <p className="text-sm text-foreground-muted mt-1">Resolución matricial de sistemas AX = B</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <MethodCard 
            title="Factorización LU (Doolittle)"
            description="Descompone la matriz A en dos matrices triangulares L y U para resolver múltiples vectores B."
            icon="🔢"
            href="/sistemas-lineales/doolittle"
            isNew
          />
          <MethodCard 
            title="Eliminación de Gauss"
            description="Transforma el sistema lineal en una matriz triangular superior para resolver por sustitución."
            icon="📐"
            href="#"
            isDisabled
          />
          <MethodCard 
            title="Gauss-Jordan"
            description="Reduce la matriz extendida hasta obtener la matriz identidad y directamente la solución."
            icon="🪄"
            href="#"
            isDisabled
          />
          <MethodCard 
            title="Gauss-Seidel"
            description="Método iterativo que requiere una matriz diagonalmente dominante para asegurar convergencia."
            icon="🔄"
            href="#"
            isDisabled
          />
        </div>
      </section>

      {/* Category: Interpolación */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="text-2xl font-bold text-foreground">Interpolación</h2>
          <p className="text-sm text-foreground-muted mt-1">Aproximación de funciones mediante polinomios</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <MethodCard 
            title="Interpolación de Lagrange"
            description="Construye un polinomio que pasa exactamente por un conjunto de puntos y permite estimar valores intermedios."
            icon="📈"
            href="/interpolacion/lagrange"
            isNew
          />
        </div>
      </section>
      
      {/* Help / Instructions Footer */}
      <section className="bg-surface-secondary rounded-xl p-6 border border-border text-sm">
        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <span>💡</span> Instrucciones Rápidas
        </h4>
        <ul className="list-disc pl-5 space-y-1.5 text-foreground-muted">
          <li>Selecciona el tipo de problema a resolver en las categorías superiores.</li>
          <li>Usa notación estándar matemática (ej: <code className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded border border-border">sin(x) - x/2</code>) para las funciones.</li>
          <li>En sistemas lineales, puedes reutilizar la misma matriz ingresando un nuevo vector B de forma rápida.</li>
          <li>Todos los resultados detallan paso a paso el procedimiento numérico realizado.</li>
        </ul>
      </section>

    </div>
  );
}
