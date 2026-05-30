import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';
import { getStoreSettings } from '@/lib/db/settings';

export const metadata: Metadata = { title: 'Retourvoorwaarden — Smart Buy Store' };

const ol = 'list-decimal pl-5 flex flex-col gap-1.5 marker:text-muted marker:font-semibold';

function formatFee(raw: string): string | null {
  const n = Number(String(raw).replace(',', '.').replace(/[^0-9.]/g, ''));
  if (!raw || isNaN(n) || n <= 0) return null;
  return `€ ${n.toFixed(2).replace('.', ',')}`;
}

export default async function RetourPage() {
  const settings = await getStoreSettings();
  const fee = formatFee(settings.return_fee_large);
  return (
    <ContentPage
      title="Retourvoorwaarden"
      intro="Hieronder lees je de voorwaarden waaronder Smart Buy Store retouren accepteert. Houd je hieraan, dan verloopt je retour vlot. Producten die niet aan deze voorwaarden voldoen, kunnen wij weigeren of onder aftrek van waardevermindering verwerken."
    >
      <ContentSection title="1. Retour aanmelden">
        <ol className={ol}>
          <li>Je meldt een retour <strong>binnen 30 dagen</strong> na ontvangst aan via <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">info@sbsnl.nl</a> of telefonisch, onder vermelding van je <strong>bestelnummer</strong> en de reden.</li>
          <li>Een retour die niet vooraf is aangemeld en door ons bevestigd, nemen wij niet in behandeling.</li>
          <li>Na onze bevestiging stuur je het product binnen <strong>14 dagen</strong> retour of houd je het klaar voor ophalen.</li>
        </ol>
      </ContentSection>

      <ContentSection title="2. Voorwaarden waaraan een retour moet voldoen">
        <ol className={ol}>
          <li>Het product is <strong>ongebruikt</strong>; je mag het uitsluitend kort beoordelen zoals in een winkel.</li>
          <li>Het product is <strong>onbeschadigd en compleet</strong>, met alle accessoires, documentatie en toebehoren.</li>
          <li>Het product wordt aangeboden in de <strong>originele, onbeschadigde verpakking</strong>.</li>
          <li>Je kunt een geldig <strong>aankoopbewijs</strong> (bestelnummer) overleggen.</li>
          <li>Voor retouren na de wettelijke bedenktijd van 14 dagen (dag 15 t/m 30) gelden de eisen onder 2.1 en 2.3 als harde voorwaarde: zonder originele verpakking en ongebruikte staat kunnen wij de retour weigeren.</li>
        </ol>
      </ContentSection>

      <ContentSection title="3. Kosten van het retourneren">
        <ol className={ol}>
          <li>De kosten en het risico van de retourzending of het ophalen zijn <strong>voor jouw rekening</strong>.</li>
          <li>Voor groot witgoed brengen wij een <strong>retour- en afhandelvergoeding</strong>{fee ? <> van <strong>{fee}</strong></> : ''} in rekening{fee ? '' : '; het bedrag melden we je vooraf bij de aanmelding'}.</li>
          <li>Retourneer je slechts een deel van je bestelling, dan worden de oorspronkelijke bezorgkosten niet vergoed.</li>
        </ol>
      </ContentSection>

      <ContentSection title="4. Gebruik, schade & waardevermindering">
        <ol className={ol}>
          <li>Heb je het product méér gebruikt dan nodig om het te beoordelen, of is het <strong>beschadigd, incompleet of zonder originele verpakking</strong>, dan brengen wij de <strong>waardevermindering</strong> in mindering op je terugbetaling.</li>
          <li>Eventuele transportschade meld je <strong>binnen 24 uur</strong> na ontvangst, met foto's. Later gemelde schade kunnen wij niet als transportschade aanmerken.</li>
        </ol>
      </ContentSection>

      <ContentSection title="5. Uitgesloten van retour">
        <ol className={ol}>
          <li>Op maat gemaakte of speciaal voor jou bestelde producten.</li>
          <li>Verzegelde producten waarvan de verzegeling om hygiënische redenen na levering is verbroken.</li>
          <li>Apparaten die zijn geïnstalleerd, aangesloten of in gebruik genomen, voor zover deze daardoor niet meer in nieuwstaat verkeren. In dat geval geldt een waardevermindering of kan de retour worden geweigerd.</li>
        </ol>
      </ContentSection>

      <ContentSection title="6. Terugbetaling">
        <ol className={ol}>
          <li>Wij verwerken de terugbetaling <strong>na ontvangst en controle</strong> van het product, binnen de daarvoor geldende termijn.</li>
          <li>We betalen terug via hetzelfde betaalmiddel, <strong>onder aftrek</strong> van eventuele waardevermindering en de retour- en afhandelkosten.</li>
          <li>Wij mogen wachten met terugbetalen totdat wij het product retour hebben ontvangen.</li>
        </ol>
      </ContentSection>

      <ContentSection title="7. Slotbepaling">
        <p className="text-muted">
          Deze voorwaarden laten je dwingendrechtelijke consumentenrechten onverlet. Heb je een vraag over je retour?
          Neem dan contact met ons op via <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">info@sbsnl.nl</a>.
          Laatst bijgewerkt: 30 mei 2026.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
