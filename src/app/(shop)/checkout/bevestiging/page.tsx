import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const metadata = { title: 'Bestelling ontvangen · Smart Buy Store' };

export default function BevestigingPage({ searchParams }: { searchParams: { order?: string } }) {
  const orderNumber = searchParams.order || '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle2 size={56} className="mx-auto text-emerald-600 mb-4" />
      <h1 className="text-3xl font-display font-black text-foreground mb-2">Bedankt voor je bestelling!</h1>
      {orderNumber && (
        <p className="text-sm text-muted mb-4">
          Je bestelnummer is <strong className="font-mono text-foreground">{orderNumber}</strong>.
        </p>
      )}
      <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-5 text-left text-sm text-amber-900 mb-6">
        <strong className="block mb-1">Betaling volgt nog</strong>
        We zijn de online betaalmethode aan het inrichten. Je krijgt binnenkort per e-mail de betaallink toegestuurd waarmee je de bestelling kunt afronden. Tot die tijd is de bestelling gereserveerd.
      </div>
      <p className="text-sm text-muted mb-8">
        Heb je vragen? Mail naar info@smart-buy-store.nl of bel ons.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/account/bestellingen" className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-primary/90">
          Mijn bestellingen
        </Link>
        <Link href="/" className="text-sm font-semibold px-5 py-2.5 rounded-[10px] border border-border hover:bg-surface">
          Naar homepage
        </Link>
      </div>
    </div>
  );
}
