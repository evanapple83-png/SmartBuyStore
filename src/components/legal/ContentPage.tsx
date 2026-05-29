import { Breadcrumbs, type Crumb } from '@/components/product/Breadcrumbs';

/**
 * Gedeelde layout voor content-/juridische pagina's:
 * breadcrumbs + titel + optionele intro + prose-content.
 */
export function ContentPage({
  title,
  intro,
  breadcrumbs,
  children,
}: {
  title: string;
  intro?: string;
  breadcrumbs?: Crumb[];
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Breadcrumbs items={breadcrumbs ?? [{ label: 'Home', href: '/' }, { label: title }]} />

      <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight mb-3">{title}</h1>
      {intro && <p className="text-muted leading-relaxed mb-8">{intro}</p>}

      <div className="content-prose flex flex-col gap-6 text-sm text-foreground/85 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

/** Sectiekop + body binnen een ContentPage. */
export function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-display font-bold text-foreground">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
