import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Veelgestelde vragen — Smart Buy Store' };

const faqs = [
  {
    q: 'Wanneer wordt mijn apparaat bezorgd?',
    a: 'Bestel je op een werkdag vóór 11:00, dan bezorgen we vandaag nog. Het exacte bezorgvenster zie je via de postcodecheck en in je bevestiging.',
  },
  {
    q: 'Wat valt onder de gratis installatie?',
    a: 'We plaatsen het apparaat, sluiten water/afvoer aan waar van toepassing, testen de werking en nemen het verpakkingsmateriaal mee.',
  },
  {
    q: 'Kan mijn oude apparaat worden meegenomen?',
    a: 'Ja. Ons eigen bezorgteam neemt je oude apparaat gratis mee bij de levering — geef dit aan bij het afrekenen.',
  },
  {
    q: 'Kan ik achteraf betalen?',
    a: 'Ja, je kunt veilig betalen met iDEAL, Klarna (achteraf), Visa of Mastercard tijdens het afrekenen.',
  },
  {
    q: 'Wat als het apparaat niet past of bevalt?',
    a: 'Je hebt 30 dagen retourrecht. Past het apparaat niet of voldoet het niet, dan nemen we het kosteloos retour.',
  },
  {
    q: 'Hoe zit het met garantie?',
    a: 'Op elk apparaat zit minimaal de fabrieksgarantie, plus je wettelijke recht op een deugdelijk product. Zie onze garantiepagina.',
  },
  {
    q: 'Hoe neem ik contact op?',
    a: 'Mail naar info@smartbuystore.nl met je vraag of bestelnummer. We reageren zo snel mogelijk.',
  },
];

export default function FaqPage() {
  return (
    <ContentPage title="Veelgestelde vragen" intro="De meest gestelde vragen over bestellen, bezorgen, installeren en retourneren.">
      {faqs.map((f) => (
        <ContentSection key={f.q} title={f.q}>
          <p>{f.a}</p>
        </ContentSection>
      ))}
    </ContentPage>
  );
}
