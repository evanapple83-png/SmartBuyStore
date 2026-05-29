import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Algemene voorwaarden — Smart Buy Store' };

export default function VoorwaardenPage() {
  return (
    <ContentPage
      title="Algemene voorwaarden"
      intro="Deze voorwaarden zijn van toepassing op alle bestellingen bij Smart Buy Store. Lees ze zorgvuldig door voordat je een bestelling plaatst."
    >
      <ContentSection title="1. Wie zijn wij?">
        <p>
          Smart Buy Store V.O.F., gevestigd aan de Newtonweg 15, 8013 RD Zwolle, ingeschreven bij de Kamer van
          Koophandel onder nummer 42000760. Contact:{' '}
          <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">
            info@sbsnl.nl
          </a>
          .
        </p>
      </ContentSection>

      <ContentSection title="2. Prijzen">
        <p>
          Alle prijzen zijn in euro&apos;s en inclusief btw, tenzij anders vermeld. Installatie, bezorging en de
          afvoer van je oude apparaat zijn gratis. We behouden ons het recht voor prijzen te wijzigen;
          kennelijke fouten binden ons niet.
        </p>
      </ContentSection>

      <ContentSection title="3. Bestellen en betalen">
        <p>
          De overeenkomst komt tot stand zodra wij je bestelling bevestigen. Betalen kan veilig via iDEAL,
          Klarna, Visa en Mastercard. Bestel je vóór 12:00, dan streven we naar bezorging dezelfde dag.
        </p>
      </ContentSection>

      <ContentSection title="4. Bezorging en installatie">
        <p>
          Bezorging en professionele installatie worden uitgevoerd door ons eigen bezorgteam. Bezorgvensters
          zijn indicatief. Zorg dat de bezorglocatie goed bereikbaar is en het apparaat geplaatst kan worden.
        </p>
      </ContentSection>

      <ContentSection title="5. Herroepingsrecht (30 dagen retour)">
        <p>
          Je hebt het recht je bestelling binnen 30 dagen na ontvangst zonder opgaaf van reden te retourneren.
          Het product moet onbeschadigd en compleet zijn. Neem voor een retour contact op via{' '}
          <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">
            info@sbsnl.nl
          </a>
          . Het herroepingsrecht geldt niet voor producten die om hygiënische redenen of door maatwerk zijn
          uitgesloten.
        </p>
      </ContentSection>

      <ContentSection title="6. Garantie">
        <p>
          Op alle apparaten is minimaal de wettelijke (fabrieks)garantie van toepassing. Je houdt daarnaast
          altijd je wettelijke rechten op een deugdelijk product (conformiteit).
        </p>
      </ContentSection>

      <ContentSection title="7. Aansprakelijkheid">
        <p>
          Onze aansprakelijkheid is beperkt tot het bedrag van je bestelling, behoudens opzet of grove
          nalatigheid en voor zover dwingend recht niet anders bepaalt.
        </p>
      </ContentSection>

      <ContentSection title="8. Klachten en toepasselijk recht">
        <p>
          Heb je een klacht? Mail naar{' '}
          <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">
            info@sbsnl.nl
          </a>{' '}
          en we zoeken samen naar een oplossing. Op alle overeenkomsten is Nederlands recht van toepassing.
        </p>
        <p className="text-muted">Laatst bijgewerkt: mei 2026.</p>
      </ContentSection>
    </ContentPage>
  );
}
