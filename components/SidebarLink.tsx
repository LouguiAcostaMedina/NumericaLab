'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLinkProps {
  href: string;
  activeColor: 'cyan' | 'teal' | 'blue' | 'purple' | 'indigo' | 'gray';
  children: React.ReactNode;
}

export function SidebarLink({ href, activeColor, children }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  // Mapa de estilos activos según la sección
  const activeStyles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-500 rounded-l-none font-semibold',
    teal: 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 rounded-l-none font-semibold',
    blue: 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500 rounded-l-none font-semibold',
    purple: 'bg-purple-500/10 text-purple-400 border-l-4 border-purple-500 rounded-l-none font-semibold',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500 rounded-l-none font-semibold',
    gray: 'bg-zinc-800 text-white font-semibold',
  };

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-98 cursor-pointer ${
        isActive 
          ? activeStyles[activeColor]
          : 'hover:bg-zinc-800 hover:text-white text-zinc-400'
      }`}
    >
      {children}
    </Link>
  );
}
