import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Truck, Wrench, Recycle, PackageCheck, Building2, ArrowRight, Check, Clock,
  WashingMachine, Refrigerator, CookingPot, AirVent, Coins, Info,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Installatieservice — Smart Buy Store',
  description: 'Gratis bezorgd én vakkundig geïnstalleerd door ons eigen team. Bekijk per categorie wat we voor je doen en waar je op moet letten.',
};

const HERO = 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1600&q=70&auto=format&fit=crop';
const INSTALL = 'https://images.unsplash.com/photo-1586208958839-06c17cacdf08?w=1200&q=70&auto=format&fit=crop';
const CLOSING = 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1600&q=70&auto=format&fit=crop';

const included = [
  { icon: Truck, title: 'Bezorgd door ons eigen team', text: 'Geen externe koeriers — onze eigen specialisten bezorgen en installeren.' },
  { icon: Wrench, title: 'Vakkundig geïnstalleerd', text: 'We plaatsen het apparaat, sluiten water, afvoer en stroom aan en testen de werking.' },
  { icon: PackageCheck, title: 'Opgeruimd achtergelaten', text: 'Al het verpakkingsmateriaal nemen we direct weer mee.' },
  { icon: Recycle, title: 'Oud apparaat gratis mee', text: 'Je oude apparaat voeren we kosteloos af. Zo heb je nergens omkijken naar.' },
];

type Cat = { icon: any; title: string; rules: string[]; accent?: boolean };
const categories: Cat[] = [
  {
    icon: WashingMachine,
    title: 'Wasmachines & drogers',
    rules: [
      'Aansluitingen voor water, afvoer en stroom moeten aanwezig en bereikbaar zijn.',
      'We verwijderen de transportbeveiliging, sluiten aan en draaien een kort testprogramma.',
    ],
  },
  {
    icon: Refrigerator,
    title: 'Koelkasten & vriezers',
    rules: [
      'Lever het apparaat bij vervanging leeg en schoon aan.',
      'Na plaatsing laten we het toestel eerst rechtop staan; we vertellen je hoelang je moet wachten voor je het aanzet.',
    ],
  },
  {
    icon: Refrigerator,
    title: 'Amerikaanse koelkasten',
    accent: true,
    rules: [
      'Bezorging én installatie van een Amerikaanse koelkast: € 75 (vanwege gewicht, afmeting en extra handling).',
      'Vanwege gewicht en afmeting bezorgen en plaatsen we deze uitsluitend op de begane grond.',
      'Een water-/ijsaansluiting sluiten we alleen aan als er op de plek al een tappunt aanwezig is.',
      'Controleer vooraf of het apparaat door deuren, gangen en trappenhuis past.',
    ],
  },
  {
    icon: Wrench,
    title: 'Vaatwassers',
    rules: [
      'Een bestaande water-, afvoer- en stroomaansluiting is nodig.',
      'Vrijstaand plaatsen we direct; voor onder het aanrecht moet de ruimte vrij en op maat zijn.',
    ],
  },
  {
    icon: CookingPot,
    title: 'Fornuizen & kookplaten',
    rules: [
      'Elektrische toestellen sluiten we aan op een passende groep.',
      'Een gasaansluiting laten we over aan een erkend installateur — zo blijft je garantie geldig.',
    ],
  },
  {
    icon: AirVent,
    title: 'Inbouw & afzuigkappen',
    rules: [
      'De nis of uitsparing moet op maat en voorbereid zijn.',
      'Een oud inbouwapparaat bouwen we uit en nemen we mee. Afzuigkappen met buitenafvoer vragen een bestaand afvoerkanaal.',
    ],
  },
];

const surcharges = [
  {
    title: 'Woning met trekschakelaar',
    price: '+ € 25',
    text: 'Woningen met een trekschakelaar vragen extra specialisme om veilig aan te sluiten. Daarvoor rekenen we eenmalig € 25 bovenop de gratis installatie.',
  },
  {
    title: 'Amerikaanse koelkast',
    price: '€ 75',
    text: 'Bezorging én installatie van een Amerikaanse koelkast kost € 75, vanwege het gewicht, de afmeting en de extra handling. Plaatsing uitsluitend op de begane grond.',
  },
];

const conditions = [
  'Er is een vrije, veilige doorgang naar de plek van bestemming (deuren, gangen en trappenhuis).',
  'De benodigde aansluitingen (water, afvoer, elektra of gas) zijn aanwezig en bereikbaar op de plek.',
  'Koel- en vriesapparaten lever je bij vervanging leeg en schoon aan.',
  'Er is iemand van 18 jaar of ouder aanwezig om de levering in ontvangst te nemen.',
  'Bezorging gaat tot maximaal de 4e verdieping. Hoger, of een pand zonder passende lift? Neem vooraf contact op.',
  'Amerikaanse koelkasten plaatsen we uitsluitend op de begane grond.',
  'Gasaansluitingen laten we over aan een erkend installateur.',
];

const steps = [
  'Bestel je apparaat en kies — op werkdagen vóór 11:00 — voor bezorging dezelfde dag.',
  'Je ontvangt een bevestiging met het bezorgvenster.',
  'Ons eigen team bezorgt, plaatst en sluit aan, en test of alles naar behoren werkt.',
  'We nemen het verpakkingsmateriaal en — gratis — je oude apparaat weer mee.',
];

export default function BezorgingPage() {
  return (
    <div className="pb-16">
      {/* ── Hero met eigen logo over foto ── */}
      <section className="relative">
        <div className="relative h-[340px] md:h-[420px] w-full overflow-hidden">
          <Image src={HERO} alt="Keuken met ingebouwde apparaten" fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/75 to-primary/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div className="max-w-xl text-white">
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="text-2xl font-display font-black tracking-tight">
                    Smartbuy<span className="text-accent">store</span>
                  </span>
                  <span className="text-[11px] font-semibold bg-white/15 border border-white/25 rounded-full px-2.5 py-0.5">
                    Installatieservice
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-black leading-tight tracking-tight mb-3">
                  Gratis bezorgd én vakkundig geïnstalleerd
                </h1>
                <p className="text-white/80 leading-relaxed mb-6">
                  Door ons eigen team — niet door een externe koerier. Inclusief aansluiten, testen,
                  verpakking opruimen en je oude apparaat gratis meenemen.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge icon={Clock}>Vandaag besteld, vandaag bezorgd</Badge>
                  <Badge icon={Truck}>Eigen bezorgteam</Badge>
                  <Badge icon={Recycle}>Gratis afvoer</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* ── Wat we voor je doen ── */}
        <section className="py-12 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-foreground mb-2">Wat we voor je doen</h2>
            <p className="text-sm text-muted mb-6">Bij elk apparaat hoort onze complete service — altijd gratis, altijd door eigen mensen.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {included.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-success/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-success" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{title}</div>
                    <div className="text-xs text-muted leading-relaxed">{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden border border-border">
            <Image src={INSTALL} alt="Installatie van een keukenapparaat" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </section>

        {/* ── Bezorgregel-band ── */}
        <section className="mb-10 rounded-[16px] bg-primary/5 border border-primary/15 p-5 flex items-start gap-3">
          <Building2 size={20} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <strong>Tot en met de 4e verdieping</strong> bezorgen en plaatsen we zonder gedoe. Woon je hoger of is er
            geen (passende) lift? <Link href="/contact" className="text-primary underline hover:no-underline">Neem vooraf even contact op</Link> —
            dan bekijken we samen de mogelijkheden. <strong>Amerikaanse koelkasten</strong> plaatsen we uitsluitend op de begane grond.
          </p>
        </section>

        {/* ── Meerkosten in bepaalde situaties ── */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-display font-extrabold text-foreground">Wanneer rekenen we wél kosten?</h2>
          </div>
          <p className="text-sm text-muted mb-6">
            Onze bezorging en installatie zijn standaard gratis. In twee specifieke situaties vragen we vooraf een
            duidelijke meerprijs — geen verrassingen achteraf.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {surcharges.map((s) => (
              <div key={s.title} className="rounded-[14px] border border-accent/30 bg-accent/[0.03] p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-[10px] bg-accent/10 flex items-center justify-center shrink-0">
                      <Coins size={20} className="text-accent" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                  </div>
                  <span className="text-sm font-display font-black text-accent whitespace-nowrap">{s.price}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>Twijfel je of een van deze situaties op jou van toepassing is? Neem gerust vooraf even contact op, dan rekenen we het samen door.</span>
          </p>
        </section>

        {/* ── Installatie per categorie ── */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-extrabold text-foreground mb-1">Installatie per categorie</h2>
          <p className="text-sm text-muted mb-6">Per soort apparaat gelden eigen aandachtspunten. Zo weet je precies wat je kunt verwachten.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className={`rounded-[14px] border p-5 ${c.accent ? 'border-accent/30 bg-accent/[0.03]' : 'border-border bg-surface'}`}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${c.accent ? 'bg-accent/10' : 'bg-primary/5'}`}>
                      <Icon size={20} className={c.accent ? 'text-accent' : 'text-primary'} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{c.title}</h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {c.rules.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                        <Check size={14} className={`shrink-0 mt-0.5 ${c.accent ? 'text-accent' : 'text-success'}`} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Voorwaarden + Zo werkt het ── */}
        <section className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="rounded-[14px] border border-border bg-surface p-6">
            <h2 className="text-lg font-display font-bold text-foreground mb-4">Voorwaarden voor een vlotte installatie</h2>
            <ol className="list-decimal pl-5 flex flex-col gap-2 text-sm text-foreground/85 marker:text-muted marker:font-semibold">
              {conditions.map((c) => <li key={c}>{c}</li>)}
            </ol>
          </div>
          <div className="rounded-[14px] border border-border bg-surface p-6">
            <h2 className="text-lg font-display font-bold text-foreground mb-4">Zo werkt het</h2>
            <ol className="list-decimal pl-5 flex flex-col gap-2 text-sm text-foreground/85 marker:text-muted marker:font-semibold">
              {steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <Link
              href="/afvoer"
              className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:underline"
            >
              Meer over gratis afvoer oud apparaat <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── Closing band met foto ── */}
        <section className="relative rounded-[18px] overflow-hidden">
          <div className="relative h-[220px] md:h-[260px]">
            <Image src={CLOSING} alt="Moderne keuken" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-6 md:px-10 text-white max-w-lg">
                <h2 className="text-2xl font-display font-black mb-2">Klaar voor een zorgeloze installatie?</h2>
                <p className="text-white/80 text-sm mb-5">
                  Check op de productpagina via je postcode of zelfde-dag bezorging mogelijk is.
                </p>
                <Link
                  href="/winkel"
                  className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-accent/90"
                >
                  Bekijk het assortiment <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 border border-white/20 rounded-full px-3 py-1">
      <Icon size={13} /> {children}
    </span>
  );
}
