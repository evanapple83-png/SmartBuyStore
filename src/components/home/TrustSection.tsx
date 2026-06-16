import { Clock, Wrench, RotateCcw, Shield, Truck, Phone } from 'lucide-react';

const trustBlocks = [
  {
    icon: Clock,
    title: 'Zelfde dag bezorging',
    desc: 'Besteld voor 11:00 = vandaag bezorgd. Eigen team, geen externe bezorgdienst.',
    stat: '< 24u',
    color: 'text-accent bg-accent/10',
  },
  {
    icon: Wrench,
    title: 'Gratis installatie',
    desc: 'Professionele installatie bij elk apparaat. Altijd gratis, geen verrassingen.',
    stat: '100% gratis',
    color: 'text-success bg-success/10',
  },
  {
    icon: RotateCcw,
    title: 'Gratis afvoer',
    desc: 'Oud apparaat wordt gratis meegenomen en milieuvriendelijk verwerkt.',
    stat: '0,- kosten',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: Shield,
    title: 'Garantie',
    desc: 'Fabrieksgarantie op alle producten. Problemen? Wij lossen het op.',
    stat: '2 jaar',
    color: 'text-warm bg-warm/10',
  },
  {
    icon: Truck,
    title: 'Eigen bezorgteam',
    desc: 'Geen PostNL of externe partijen. Direct contact met onze bezorgers.',
    stat: '1 team',
    color: 'text-success bg-success/10',
  },
  {
    icon: Phone,
    title: 'Persoonlijke service',
    desc: 'Vragen? Onze specialisten staan voor u klaar. Altijd een persoon, nooit een bot.',
    stat: 'Altijd bereikbaar',
    color: 'text-primary bg-primary/10',
  },
];

export function TrustSection() {
  return (
    <section className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-display font-black text-foreground mb-2">
            Waarom Smart Buy Store?
          </h2>
          <p className="text-muted text-sm max-w-xl mx-auto">
            Wij concurreren niet op prijs alleen. Wij winnen op totale waarde: snelheid, service en gemak.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustBlocks.map(({ icon: Icon, title, desc, stat, color }) => (
            <div
              key={title}
              className="p-6 rounded-[12px] border border-border bg-background hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <div className="text-2xl font-display font-black text-foreground mb-1">{stat}</div>
              <h3 className="font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
