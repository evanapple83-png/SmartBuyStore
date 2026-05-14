export const metadata = { title: 'Dashboard · Smart Buy Admin' };

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
      <p className="text-sm text-muted mb-6">Welkom in het beheerpaneel.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Nieuwe bestellingen vandaag', value: '—' },
          { label: 'Te bezorgen vandaag', value: '—' },
          { label: 'Omzet vandaag (excl. btw)', value: '€ —' },
          { label: 'Onbetaald > 24 uur', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-[12px] p-4">
            <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-sm font-semibold text-foreground mb-2">Werkt!</h2>
        <p className="text-sm text-muted">
          De basis-structuur staat. Bestellingen, klanten, producten en facturen worden ingevuld in FASE 5–8.
        </p>
      </div>
    </div>
  );
}
