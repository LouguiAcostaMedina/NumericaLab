import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SidebarLink } from "../components/SidebarLink";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Métodos Numéricos Web",
  description: "Plataforma interactiva para la resolución de ecuaciones no lineales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col h-full z-10">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-800 bg-zinc-950">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white tracking-wide">
              <span className="text-xl">🧮</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                NuméricaLab
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <div>
              <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Inicio
              </p>
              <SidebarLink href="/" activeColor="gray">
                🏠 Panel Principal
              </SidebarLink>
            </div>

            <div>
              <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Métodos Cerrados
              </p>
              <div className="space-y-1">
                <SidebarLink href="/bisection" activeColor="cyan">
                  ⚖️ Método de Bisección
                </SidebarLink>
                <SidebarLink href="/false-position" activeColor="teal">
                  📉 Falsa Posición
                </SidebarLink>
              </div>
            </div>

            <div>
              <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Métodos Abiertos
              </p>
              <div className="space-y-1">
                <SidebarLink href="/newton" activeColor="blue">
                  ⚡ Newton-Raphson
                </SidebarLink>
                <SidebarLink href="/fixed-point" activeColor="purple">
                  🎯 Punto Fijo
                </SidebarLink>
                <SidebarLink href="/secant" activeColor="indigo">
                  📏 Método de la Secante
                </SidebarLink>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 text-center text-xs text-zinc-500">
            Fase 3: Core & Gráficas
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Main Topbar */}
          <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 bg-white dark:bg-zinc-900/50 flex-shrink-0">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Analizador de Métodos Numéricos v1.0
            </h2>
            <div className="flex items-center gap-4 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full text-zinc-600 dark:text-zinc-300">
              <span>Next.js 16</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Online</span>
            </div>
          </header>

          {/* Page Container */}
          <main className="flex-1 overflow-y-auto p-8 relative">
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
