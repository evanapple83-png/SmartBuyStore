import { Star } from 'lucide-react';

const reviews = [
  {
    text: 'Koelkast op dinsdag besteld voor 12:00. Om 15:00 al geïnstalleerd en werkt perfect. Ongelooflijk snel.',
    name: 'Marcel K.',
    city: 'Amsterdam',
    rating: 5,
  },
  {
    text: 'Eindelijk een webshop die doet wat ze beloven. Gratis installatie = écht gratis. Geen kleine lettertjes.',
    name: 'Sandra P.',
    city: 'Utrecht',
    rating: 5,
  },
  {
    text: 'Oude koelkast meegenomen, nieuwe geïnstalleerd, alles in 30 minuten. Geen gedoe, geen rommel.',
    name: 'Johan R.',
    city: 'Rotterdam',
    rating: 5,
  },
];

export function ReviewsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Trustpilot score */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={24} className="fill-warm text-warm" />
              ))}
            </div>
            <span className="text-3xl font-display font-black text-foreground">4.8</span>
          </div>
          <p className="text-muted text-sm">
            Gebaseerd op <strong className="text-foreground">2.400+</strong> beoordelingen
          </p>
          <h2 className="text-2xl font-display font-black text-foreground mt-4">
            Wat onze klanten zeggen
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(({ text, name, city, rating }) => (
            <div
              key={name}
              className="bg-surface rounded-[12px] border border-border p-6 hover:shadow-md transition-all duration-200"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= rating ? 'fill-warm text-warm' : 'fill-none text-gray-300'}
                  />
                ))}
              </div>

              <p className="text-sm text-foreground leading-relaxed mb-4 italic">
                &ldquo;{text}&rdquo;
              </p>

              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted">{city}</p>
                </div>
                <span className="ml-auto text-xs bg-success/10 text-success font-bold px-2 py-0.5 rounded-pill">
                  Geverifieerd
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
