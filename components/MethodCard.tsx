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
      <div className="bg-surface rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between opacity-60 cursor-not-allowed">
        <div className="space-y-3">
          <div className="w-10 h-10 bg-surface-secondary text-foreground-muted rounded-lg flex items-center justify-center text-xl font-bold">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>{title}</span>
            <span className="text-[9px] bg-border text-foreground-muted px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">
              Pronto
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
    <Link href={href} className="group outline-none">
      <div className="bg-surface rounded-xl p-5 border border-border shadow-sm flex flex-col h-full justify-between hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2">
        <div className="space-y-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
            <span>{title}</span>
            {isNew && (
              <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">
                Nuevo
              </span>
            )}
          </h3>
          <p className="text-foreground-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-primary font-semibold text-sm group-hover:opacity-100 opacity-80 transition-opacity">
          <span>Comenzar →</span>
        </div>
      </div>
    </Link>
  );
}
