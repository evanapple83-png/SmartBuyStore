import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Garantie — Smart Buy Store' };

export default function GarantiePage() {
  return (
    <ContentPage
      title="Garantie"
      intro="Op al onze apparaten zit garantie. Mocht er iets zijn, dan helpen we je snel en persoonlijk."
    >
      <ContentSection title="Fabrieksgarantie">
        <p>
          Op elk apparaat is minimaal de garantie van de fabrikant van toepassing. De garantietermijn verschilt
          per merk en model en staat vermeld bij de specificaties van het product.
        </p>
      </ContentSection>

      <ContentSection title="Je wettelijke rechten">
        <p>
          Naast de fabrieksgarantie heb je altijd recht op een deugdelijk product (wettelijke conformiteit). Een
          apparaat moet doen wat je er redelijkerwijs van mag verwachten gedurende de verwachte levensduur.
        </p>
      </ContentSection>

      <ContentSection title="Garantie aanvragen">
        <p>
          Een storing of defect? Mail naar{' '}
          <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">
            info@sbsnl.nl
          </a>{' '}
          met je bestelnummer en een omschrijving (en indien mogelijk een foto of video). We zorgen voor een
          snelle afhandeling.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
