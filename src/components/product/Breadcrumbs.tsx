import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Kruimelpad" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link href={c.href} className="hover:text-primary transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className={last ? 'text-foreground font-medium' : undefined} aria-current={last ? 'page' : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight size={14} className="text-border" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
