import Link from 'next/link';
import {
  LayoutDashboard, ShoppingBag, Users, Box, Folder, Award, Star, Tag, FileText,
  Mail, Truck, UserCog, Settings, MessageSquare, Upload, BookOpen,
} from 'lucide-react';

export const metadata = { title: 'Handleiding · Admin' };

type Item = { icon: any; title: string; href?: string; what: string; tasks: string[] };

const sections: Item[] = [
  {
    icon: LayoutDashboard, title: 'Dashboard', href: '/admin',
    what: 'Je startpunt: omzet, bestellingen, bezoekers en signalen in één oogopslag.',
    tasks: ['Bekijk omzet per dag/7/30 dagen en de gemiddelde orderwaarde', 'Zie hoeveel bestellingen nog verwerkt moeten worden', 'Volg bezoekers, populaire pagina\'s en producten', 'Houd lage voorraad in de gaten'],
  },
  {
    icon: ShoppingBag, title: 'Bestellingen', href: '/admin/bestellingen',
    what: 'Alle bestellingen met hun status. Hier verwerk je een order van betaald tot bezorgd.',
    tasks: ['Zoek op bestelnummer, naam of e-mail; filter op status', 'Open een bestelling en werk de status bij (In behandeling → Ingepland → Bezorgd → Afgerond)', 'Elke wijziging komt in het statuslogboek', 'Voeg een interne notitie of bezorgdatum toe'],
  },
  {
    icon: Box, title: 'Producten', href: '/admin/producten',
    what: 'Je assortiment. Voeg producten toe, bewerk prijzen, foto\'s en voorraad.',
    tasks: ['Nieuw product: vul naam, artikelnummer, prijs, merk, categorie en voorraad in', 'Upload een productfoto (of plak een URL)', 'Voorraad wordt automatisch afgeboekt bij verkoop; bij 0 toont het product als uitverkocht', 'Importeer je hele assortiment in één keer via CSV (knop “Importeren”)'],
  },
  {
    icon: Folder, title: 'Categorieën & Merken', href: '/admin/categorieen',
    what: 'De indeling van je winkel. Producten koppel je aan een categorie en een merk.',
    tasks: ['Maak categorieën aan (Koelkasten, Wasmachines…) en merken (Samsung, Bosch…)', 'Zet inactief om iets te verbergen zonder producten te verwijderen'],
  },
  {
    icon: Star, title: 'Reviews', href: '/admin/reviews',
    what: 'Klanten beoordelen producten. Reviews komen binnen ter controle voordat ze online gaan.',
    tasks: ['Publiceer of wijs nieuwe reviews af', 'Reviews van klanten die het product kochten krijgen een “geverifieerd”-label', 'Alleen gepubliceerde reviews zijn zichtbaar in de webshop'],
  },
  {
    icon: Tag, title: 'Kortingscodes', href: '/admin/kortingscodes',
    what: 'Acties en kortingen. Klanten voeren de code in tijdens het afrekenen.',
    tasks: ['Maak een code (% of vast bedrag), met min-bedrag, geldigheid en max-gebruik', 'Zie per code hoe vaak die is gebruikt en hoeveel omzet het opleverde', 'De meest effectieve code krijgt een “Top”-label'],
  },
  {
    icon: Truck, title: 'Bezorgplanning', href: '/admin/bezorgplanning',
    what: 'Plan bezorgingen per dag en wijs een bezorger toe.',
    tasks: ['Kies een bezorgdatum — de klant krijgt automatisch “gepland” of (bij vandaag) “onderweg”', 'Wijs een bezorger toe; die ziet bij inloggen alleen de eigen ritten', 'Markeer een bestelling als bezorgd'],
  },
  {
    icon: FileText, title: 'Facturen', href: '/admin/facturen',
    what: 'Elke betaalde bestelling krijgt automatisch een factuur.',
    tasks: ['Open een factuur en print of sla op als PDF', 'Bedrijfsgegevens op de factuur komen uit Instellingen'],
  },
  {
    icon: Mail, title: 'E-mailtemplates', href: '/admin/e-mailtemplates',
    what: 'De automatische e-mails aan klanten (bevestiging, betaald, onderweg, bezorgd…).',
    tasks: ['Pas de teksten aan met {{variabelen}} die automatisch ingevuld worden', 'Zet een template aan of uit'],
  },
  {
    icon: MessageSquare, title: 'Berichten', href: '/admin/berichten',
    what: 'Berichten via het contactformulier op de website.',
    tasks: ['Lees en beantwoord berichten', 'Markeer als gelezen'],
  },
  {
    icon: UserCog, title: 'Team', href: '/admin/accounts',
    what: 'Je medewerkers en hun rechten.',
    tasks: ['Voeg een teamlid toe met rol Admin, Staff of Bezorger', 'Admin = alles · Staff = bestellingen/producten/facturen · Bezorger = alleen bezorgplanning'],
  },
  {
    icon: Settings, title: 'Instellingen', href: '/admin/instellingen',
    what: 'Bedrijfsgegevens die op facturen, in de footer en op de site verschijnen.',
    tasks: ['Vul naam, adres, BTW-nummer, KvK, IBAN en telefoon in', 'Stel de retour-/afhandelvergoeding voor groot witgoed in'],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-primary mb-1"><BookOpen size={20} /><span className="text-xs font-semibold uppercase tracking-wide">Handleiding</span></div>
        <h1 className="text-2xl font-bold text-foreground">Zo gebruik je het beheerpaneel</h1>
        <p className="text-sm text-muted">Een korte uitleg per onderdeel. Klik een sectie open voor de belangrijkste taken.</p>
      </div>

      <div className="space-y-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <details key={s.title} className="group bg-surface border border-border rounded-[12px] overflow-hidden">
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none hover:bg-background">
                <div className="w-9 h-9 rounded-[10px] bg-primary/5 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">{s.title}</div>
                  <div className="text-xs text-muted truncate">{s.what}</div>
                </div>
                <span className="text-muted group-open:rotate-90 transition-transform">›</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <ul className="space-y-1.5 text-sm text-foreground/85 ml-12">
                  {s.tasks.map((t) => <li key={t} className="list-disc">{t}</li>)}
                </ul>
                {s.href && (
                  <div className="ml-12 mt-3">
                    <Link href={s.href} className="text-xs font-semibold text-primary hover:underline">Naar {s.title} →</Link>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>

      <div className="mt-6 rounded-[12px] border border-primary/15 bg-primary/5 p-4 text-sm text-foreground">
        <strong>Tip:</strong> begin met <Link href="/admin/instellingen" className="text-primary underline">Instellingen</Link> (je bedrijfsgegevens),
        voeg dan je eerste <Link href="/admin/producten/nieuw" className="text-primary underline">producten</Link> toe en maak een
        <Link href="/admin/accounts" className="text-primary underline"> bezorger</Link> aan. De checklist op het dashboard helpt je op weg.
      </div>
    </div>
  );
}
