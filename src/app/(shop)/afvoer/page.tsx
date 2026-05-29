import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Afvoer oud apparaat — Smart Buy Store' };

export default function AfvoerPage() {
  return (
    <ContentPage
      title="Afvoer oud apparaat"
      intro="We nemen je oude apparaat gratis mee als we je nieuwe komen bezorgen. Geen gedoe, geen extra kosten."
    >
      <ContentSection title="Gratis meegenomen">
        <p>
          Bij de bezorging van je nieuwe apparaat nemen we je oude exemplaar kosteloos mee. Geef bij het
          afrekenen aan dat je hier gebruik van wilt maken.
        </p>
      </ContentSection>

      <ContentSection title="Hoe bereid je het voor?">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Maak het apparaat leeg en, waar mogelijk, schoon.</li>
          <li>Koppel het los van water en/of stroom als dat veilig kan.</li>
          <li>Zorg dat het apparaat bereikbaar staat voor ons bezorgteam.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Verantwoord verwerkt">
        <p>
          Ingenomen apparaten worden op een verantwoorde, milieuvriendelijke manier gerecycled volgens de
          geldende regelgeving.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
