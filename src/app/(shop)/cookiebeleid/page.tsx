import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';
import { CookiePreferencesButton } from './CookiePolicyActions';

export const metadata: Metadata = { title: 'Cookiebeleid — Smart Buy Store' };

export default function CookiebeleidPage() {
  return (
    <ContentPage
      title="Cookiebeleid"
      intro="Hieronder lees je welke cookies Smart Buy Store gebruikt en hoe je je voorkeuren beheert."
    >
      <ContentSection title="Wat zijn cookies?">
        <p>
          Cookies zijn kleine bestanden die op je apparaat worden opgeslagen wanneer je onze website bezoekt.
          Ze helpen de winkel te laten werken en stellen ons (met jouw toestemming) in staat om de website te
          verbeteren en relevante advertenties te tonen.
        </p>
      </ContentSection>

      <ContentSection title="Welke cookies gebruiken we?">
        <p>
          <strong>Noodzakelijke cookies</strong> — nodig om de website te laten functioneren, zoals je
          winkelwagen, verlanglijst en het afrekenproces. Deze worden altijd geplaatst en vereisen geen
          toestemming.
        </p>
        <p>
          <strong>Analytische cookies</strong> — verzamelen anonieme statistieken over hoe de website wordt
          gebruikt, zodat we hem kunnen verbeteren. Worden alleen geplaatst met jouw toestemming.
        </p>
        <p>
          <strong>Marketingcookies</strong> — maken het mogelijk om je gepersonaliseerde advertenties te tonen
          (bijvoorbeeld voor producten die je bekeek), ook op andere websites en social media. Worden alleen
          geplaatst met jouw toestemming.
        </p>
      </ContentSection>

      <ContentSection title="Je toestemming beheren">
        <p>
          Bij je eerste bezoek vragen we je toestemming. Je kunt je keuze op elk moment wijzigen of intrekken
          via de knop hieronder.
        </p>
        <div className="pt-1">
          <CookiePreferencesButton />
        </div>
      </ContentSection>

      <ContentSection title="Vragen?">
        <p>
          Heb je vragen over ons cookiegebruik? Mail naar{' '}
          <a href="mailto:info@smartbuystore.nl" className="text-primary underline hover:no-underline">
            info@smartbuystore.nl
          </a>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
