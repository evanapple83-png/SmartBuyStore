import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Bezorging & Installatie — Smart Buy Store' };

export default function BezorgingPage() {
  return (
    <ContentPage
      title="Bezorging & installatie"
      intro="Bestel je vóór 12:00, dan bezorgen we vandaag nog — door ons eigen bezorgteam, professioneel geïnstalleerd. Altijd gratis."
    >
      <ContentSection title="Zelfde dag bezorgd">
        <p>
          Bestel je op een werkdag vóór 12:00, dan leveren we je apparaat dezelfde dag. Je ontvangt een
          bevestiging met het bezorgvenster. Via de postcodecheck op de productpagina zie je direct of zelfde
          dag bezorging mogelijk is.
        </p>
      </ContentSection>

      <ContentSection title="Gratis professionele installatie">
        <p>Bij elk apparaat hoort gratis installatie door onze eigen specialisten. Dat houdt in:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>we plaatsen het apparaat op de juiste plek;</li>
          <li>we sluiten water en afvoer aan indien aanwezig;</li>
          <li>we testen of alles naar behoren werkt;</li>
          <li>we nemen al het verpakkingsmateriaal mee.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Eigen bezorgteam">
        <p>
          Geen externe koeriers: onze eigen mensen bezorgen en installeren. Zo houden we korte lijnen en directe
          communicatie over je levering.
        </p>
      </ContentSection>

      <ContentSection title="Gratis afvoer oud apparaat">
        <p>
          We nemen je oude apparaat gratis mee. Lees meer op de pagina{' '}
          <a href="/afvoer" className="text-primary underline hover:no-underline">
            afvoer oud apparaat
          </a>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
