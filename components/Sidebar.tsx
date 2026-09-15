'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SidebarLink } from './SidebarLink';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header (Only visible on small screens) */}
      <header className="lg:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-background shrink-0 sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground tracking-tight" onClick={closeSidebar}>
          <span className="text-xl">∿</span>
          <span>NuméricaLab<span className="text-primary">.</span></span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-surface-secondary text-foreground hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col h-full transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Desktop Sidebar Header */}
        <div className="hidden lg:flex h-16 items-center px-6 border-b border-border bg-background">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground tracking-tight">
            <span className="text-primary text-2xl font-serif">∫</span>
            <span>NuméricaLab<span className="text-primary">.</span></span>
          </Link>
        </div>

        {/* Mobile Sidebar Logo (visible only when drawer is open) */}
        <div className="flex lg:hidden h-16 items-center justify-between px-6 border-b border-border bg-background">
          <span className="font-bold text-lg text-foreground tracking-tight">Menú</span>
          <button onClick={closeSidebar} className="text-foreground-muted hover:text-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          <div>
            <p className="px-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-3">
              Inicio
            </p>
            <div onClick={closeSidebar}>
              <SidebarLink href="/">
                Panel Principal
              </SidebarLink>
            </div>
          </div>

          <div>
            <p className="px-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-3">
              Raíces de Ecuaciones
            </p>
            <div className="space-y-1" onClick={closeSidebar}>
              <SidebarLink href="/bisection">
                Bisección
              </SidebarLink>
              <SidebarLink href="/false-position">
                Falsa Posición
              </SidebarLink>
              <SidebarLink href="/newton">
                Newton-Raphson
              </SidebarLink>
              <SidebarLink href="/fixed-point">
                Punto Fijo
              </SidebarLink>
              <SidebarLink href="/secant">
                Secante
              </SidebarLink>
              <SidebarLink href="/polynomials">
                Müller (Polinomios)
              </SidebarLink>
            </div>
          </div>

          <div>
            <p className="px-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-3">
              Sistemas Lineales
            </p>
            <div className="space-y-1" onClick={closeSidebar}>
              <SidebarLink href="/sistemas-lineales/doolittle">
                Factorización LU (Doolittle)
              </SidebarLink>
              {/* Espacio para futuros métodos */}
              <div className="px-3 py-2 text-xs text-foreground-muted font-medium opacity-50 cursor-not-allowed">
                Eliminación de Gauss (Pronto)
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-surface-secondary text-center text-xs text-foreground-muted font-medium">
          v1.0.0
        </div>
      </aside>
    </>
  );
}
