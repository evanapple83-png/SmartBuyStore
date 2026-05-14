import { CheckCircle, Truck, Wrench, Users } from 'lucide-react';

export default function OverOnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-black text-foreground mb-4">
          Over Smart Buy Store
        </h1>
        <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
          Wij zijn de lokale witgoed specialist die service levert die grote ketens simpelweg niet kunnen bieden.
        </p>
      </div>

      <div className="prose max-w-none mb-12">
        <div className="bg-surface rounded-[20px] border border-border p-8 mb-8">
          <h2 className="text-xl font-display font-black text-foreground mb-4">Ons verhaal</h2>
          <p className="text-muted leading-relaxed mb-4">
            Smart Buy Store is opgericht vanuit één overtuiging: de klant verdient meer dan een doos voor de deur.
            Bij de grote ketens koopt u een koelkast en wacht u 2–3 werkdagen op bezorging — zelf installeren,
            zelf oud apparaat wegbrengen.
          </p>
          <p className="text-muted leading-relaxed">
            Wij doen het anders. Vandaag besteld voor 12:00? Vandaag bezorgd, geïnstalleerd en oud apparaat meegenomen.
            Gratis. Altijd.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: Truck, title: 'Eigen bezorgteam', desc: 'Geen PostNL. Onze eigen mensen rijden elke levering.' },
            { icon: Wrench, title: 'Gratis installatie', desc: 'Bij elk apparaat. Geen kleine lettertjes, geen extra kosten.' },
            { icon: CheckCircle, title: 'Geen tussenpersonen', desc: 'Van inkoop tot installatie: één team, één verantwoordelijkheid.' },
            { icon: Users, title: 'Lokale specialist', desc: 'Persoonlijk advies van mensen die witgoed kennen.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-surface rounded-[12px] border border-border p-6">
              <Icon size={24} className="text-success mb-3" />
              <h3 className="font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
