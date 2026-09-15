'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

export function SidebarLink({ href, children }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-98 cursor-pointer ${
        isActive 
          ? 'bg-primary/10 text-primary border-l-4 border-primary rounded-l-none font-semibold'
          : 'hover:bg-surface-secondary hover:text-foreground text-foreground-muted'
      }`}
    >
      {children}
    </Link>
  );
}
