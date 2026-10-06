import Link from 'next/link';

interface MethodCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  isNew?: boolean;
  isDisabled?: boolean;
}

export function MethodCard({ title, description, href, icon, isNew, isDisabled }: MethodCardProps) {
  if (isDisabled) {
    return (
      <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between opacity-50 cursor-not-allowed">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-surface-secondary text-foreground-muted rounded-xl flex items-center justify-center text-2xl shadow-inner border border-border">
            {icon}
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <span>{title}</span>
            <span className="text-[10px] bg-border/50 text-foreground-muted px-2 py-0.5 rounded-full font-mono uppercase tracking-widest border border-border">
              Próximamente
            </span>
          </h3>
          <p className="text-foreground-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className="group outline-none block h-full">
      <div className="bg-surface/80 backdrop-blur-md rounded-2xl p-6 border border-border shadow-sm flex flex-col h-full justify-between hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 relative overflow-hidden">
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="space-y-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 text-primary rounded-xl flex items-center justify-center text-2xl shadow-inner border border-primary/10 group-hover:scale-110 group-hover:shadow-primary/20 transition-all duration-300">
            {icon}
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
            <span>{title}</span>
            {isNew && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono uppercase tracking-widest border border-primary/20">
                Nuevo
              </span>
            )}
          </h3>
          <p className="text-foreground-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-primary font-medium text-sm group-hover:opacity-100 opacity-70 transition-opacity relative z-10">
          <span className="flex items-center gap-1.5">
            Abrir Calculadora <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
