import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Garantievoorwaarden — Smart Buy Store' };

const ol = 'list-decimal pl-5 flex flex-col gap-1.5 marker:text-muted marker:font-semibold';

export default function GarantiePage() {
  return (
    <ContentPage
      title="Garantievoorwaarden"
      intro="Op onze apparaten geldt de garantie van de fabrikant. Hieronder lees je wat hier wel en niet onder valt en wat wij van je vragen bij een garantieclaim."
    >
      <ContentSection title="1. Wat valt onder garantie">
        <ol className={ol}>
          <li>De garantie dekt <strong>materiaal- en fabricagefouten</strong> die optreden bij normaal huishoudelijk gebruik, binnen de garantieperiode van de fabrikant.</li>
          <li>Bij een terecht garantieberoep zorgen wij voor reparatie of vervanging. Wij bepalen welke oplossing wordt toegepast.</li>
        </ol>
      </ContentSection>

      <ContentSection title="2. Wat valt niet onder garantie">
        <ol className={ol}>
          <li>Schade door verkeerd of onzorgvuldig gebruik, ongevallen, vallen, stoten, vocht, bliksem, over- of onderspanning, of onjuiste plaatsing.</li>
          <li>Schade aan of slijtage van glas, email, kunststof onderdelen, verlichting, filters, manchetten, rubbers en andere aan slijtage onderhevige delen, tenzij sprake is van een aantoonbare fabricagefout.</li>
          <li>Cosmetische schade (krassen, deuken, kleurverschil) die niet <strong>binnen 24 uur</strong> na levering is gemeld.</li>
          <li>Gebreken ontstaan door zelf (de)monteren, aansluiten, aanpassen of repareren, of door reparatie door niet-erkende derden.</li>
          <li>Gebreken die voortkomen uit de huisinstallatie (elektra, gas, water of afvoer) of uit externe oorzaken buiten het apparaat.</li>
          <li>Normaal onderhoud, normale slijtage en verbruiksartikelen.</li>
          <li>Niet-technische storingen, zoals verstoppingen, vergeten voorwerpen in de machine of onjuiste instellingen.</li>
          <li>Apparaten die zakelijk of bovenmatig intensief zijn gebruikt, of die niet meer in het bezit zijn van de oorspronkelijke koper.</li>
        </ol>
      </ContentSection>

      <ContentSection title="3. Aansluiting en installatie">
        <ol className={ol}>
          <li>Elektrische fornuizen, kookplaten en gasapparatuur dienen door een <strong>erkend installateur</strong> te worden aangesloten.</li>
          <li>Sluit je een apparaat zelf aan en ontstaat hierdoor schade (bijvoorbeeld kortsluiting of brand), dan is dit voor eigen rekening en risico.</li>
        </ol>
      </ContentSection>

      <ContentSection title="4. Een garantieclaim indienen">
        <ol className={ol}>
          <li>Meld een storing via <a href="mailto:info@smartbuystore.nl" className="text-primary underline hover:no-underline">info@smartbuystore.nl</a> onder vermelding van je <strong>bestelnummer</strong>, een omschrijving van het probleem en — indien mogelijk — foto's of video.</li>
          <li>Wij beoordelen de melding en plannen vervolgens onderzoek, reparatie of vervanging in.</li>
          <li>Stellen wij vast dat er <strong>geen sprake is van een garantiegebrek</strong> (bijvoorbeeld door verkeerd gebruik of een van de uitsluitingen onder 2), dan kunnen wij onderzoeks- en voorrijkosten in rekening brengen.</li>
        </ol>
      </ContentSection>

      <ContentSection title="5. Slotbepaling">
        <p className="text-muted">
          Deze voorwaarden laten je dwingendrechtelijke consumentenrechten onverlet. Voor een terecht en aantoonbaar
          fabricage- of materiaalgebrek dragen wij uiteraard zorg. Laatst bijgewerkt: 30 mei 2026.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
