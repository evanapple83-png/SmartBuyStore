import Link from 'next/link';
import { Mail, MapPin, CreditCard } from 'lucide-react';

const winkelLinks = [
  { href: '/categorie/koelkasten', label: 'Koelkasten' },
  { href: '/categorie/wasmachines', label: 'Wasmachines' },
  { href: '/categorie/vaatwassers', label: 'Vaatwassers' },
  { href: '/categorie/koken', label: 'Koken & Bakken' },
  { href: '/categorie/drogers', label: 'Drogers' },
  { href: '/aanbiedingen', label: 'Aanbiedingen' },
];

const serviceLinks = [
  { href: '/bezorging-installatie', label: 'Bezorging & Installatie' },
  { href: '/retour', label: 'Retour' },
  { href: '/garantie', label: 'Garantie' },
  { href: '/afvoer', label: 'Afvoer oud apparaat' },
  { href: '/faq', label: 'Veelgestelde vragen' },
];

const infoLinks = [
  { href: '/over-ons', label: 'Over ons' },
  { href: '/contact', label: 'Contact' },
  { href: '/account', label: 'Mijn bestellingen' },
  { href: '/privacy', label: 'Privacybeleid' },
  { href: '/voorwaarden', label: 'Algemene voorwaarden' },
  { href: '/cookiebeleid', label: 'Cookiebeleid' },
];

const paymentMethods = ['iDEAL', 'Visa', 'Mastercard', 'PayPal', 'Klarna', 'Afterpay', 'Maestro'];

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 — Brand */}
          <div>
            <div className="text-xl font-display font-black mb-3">
              Smart<span className="text-accent">Buy</span> Store
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Uw witgoed specialist voor snelle bezorging, gratis installatie en afvoer van uw oude apparaat. Lokaal team, directe service.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-success shrink-0" />
                <a href="mailto:info@sbsnl.nl" className="hover:text-white transition-colors cursor-pointer">
                  info@sbsnl.nl
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-success shrink-0 mt-0.5" />
                <span>Newtonweg 15, 8013 RD Zwolle</span>
              </div>
            </div>
          </div>

          {/* Column 2 — Winkel */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide mb-4 text-white/90">Winkel</h4>
            <ul className="flex flex-col gap-2">
              {winkelLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Service */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide mb-4 text-white/90">Service</h4>
            <ul className="flex flex-col gap-2">
              {serviceLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Info */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide mb-4 text-white/90">Info</h4>
            <ul className="flex flex-col gap-2">
              {infoLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © 2026 Smart Buy Store V.O.F. — KvK 42000760 — Alle rechten voorbehouden
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <CreditCard size={14} className="text-white/40" />
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
