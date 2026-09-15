import type { Metadata } from "next";
import { Sidebar } from "../components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "NuméricaLab | Análisis Numérico Web",
  description: "Plataforma interactiva para la resolución de ecuaciones no lineales y sistemas lineales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="h-full bg-background text-foreground font-sans flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar Component (Handles both Mobile Header/Drawer and Desktop Sidebar) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Main Topbar (Desktop) */}
          <header className="hidden lg:flex h-16 border-b border-border items-center justify-between px-8 bg-surface/80 backdrop-blur-md flex-shrink-0 z-10 sticky top-0">
            <h2 className="text-sm font-semibold text-foreground-muted">
              Analizador Numérico v2.0
            </h2>
            <div className="flex items-center gap-4 text-xs font-medium bg-surface-secondary px-3 py-1.5 rounded-full text-foreground-muted border border-border">
              <span>Next.js 16</span>
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              <span>Online</span>
            </div>
          </header>

          {/* Page Container */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative w-full">
            <div className="max-w-6xl mx-auto space-y-8 w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

