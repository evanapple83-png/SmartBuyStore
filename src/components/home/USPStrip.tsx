import { Zap, Wrench, Truck, Users } from 'lucide-react';

const usps = [
  {
    icon: Zap,
    title: 'Zelfde dag bezorging',
    desc: 'Besteld voor 12:00? Vandaag nog in huis. Gegarandeerd.',
    color: 'text-accent bg-accent/10',
  },
  {
    icon: Wrench,
    title: 'Gratis installatie',
    desc: 'Bij elk apparaat. Coolblue rekent €79–€149. Wij: altijd gratis.',
    color: 'text-success bg-success/10',
  },
  {
    icon: Truck,
    title: 'Eigen bezorgteam',
    desc: 'Geen PostNL. Onze eigen mensen, directe communicatie.',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: Users,
    title: 'Gratis afvoer',
    desc: 'Oud apparaat mee? Wij nemen het gratis mee. Geen gedoe.',
    color: 'text-warm bg-warm/10',
  },
];

export function USPStrip() {
  return (
    <section className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {usps.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
