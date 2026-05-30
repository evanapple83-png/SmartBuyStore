import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Garantie — Smart Buy Store' };

const ol = 'list-decimal pl-5 flex flex-col gap-1.5 marker:text-muted marker:font-semibold';

export default function GarantiePage() {
  return (
    <ContentPage
      title="Garantie"
      intro="Op elk apparaat heb je wettelijke garantie — een deugdelijk product dat doet wat je er redelijkerwijs van mag verwachten. Daarnaast geldt vaak nog de garantie van de fabrikant."
    >
      <ContentSection title="1. Wettelijke garantie (conformiteit)">
        <ol className={ol}>
          <li>Je hebt altijd recht op een <strong>deugdelijk product</strong>: het moet de eigenschappen bezitten die je bij normaal gebruik redelijkerwijs mag verwachten.</li>
          <li>Er is <strong>geen vaste termijn</strong>. Hoe lang de wettelijke garantie geldt, hangt af van onder meer het type product, de prijs en de verwachte levensduur. Bij duurdere apparaten is dit vaak (ruim) langer dan twee jaar.</li>
          <li>Gaat een product binnen de verwachte levensduur kapot zonder dat dit jouw schuld is, dan lossen wij dit <strong>kosteloos</strong> op: repareren, vervangen of (gedeeltelijk) terugbetalen — binnen een redelijke termijn en zonder kosten voor reparatie, verzending, voorrijden of verwijdering.</li>
          <li>Lukt herstel of vervanging niet of niet binnen een redelijke termijn, dan mag je de koop ontbinden en heb je recht op (gedeeltelijke) terugbetaling.</li>
          <li><strong>Bewijslast:</strong> gaat er in het <strong>eerste jaar</strong> na aankoop iets mis, dan gaan we ervan uit dat het gebrek er bij levering al was — wij moeten dan aantonen dat het door verkeerd gebruik komt. Na het eerste jaar ligt de bewijslast bij jou.</li>
        </ol>
      </ContentSection>

      <ContentSection title="2. Verwachte levensduur per producttype">
        <p>De wettelijke garantie kent geen vaste termijn. Onderstaande termijnen zijn <strong>indicatieve richtlijnen</strong> voor wat je gemiddeld mag verwachten; de werkelijke verwachting hangt af van prijs, model en gebruik.</p>
        <ol className={ol}>
          <li><strong>Koelkasten &amp; vriezers</strong> — circa 10 jaar</li>
          <li><strong>Wasmachines</strong> — circa 7 à 8 jaar (de ACM gaat ervan uit dat een wasmachine van € 400 minimaal 8 jaar meegaat)</li>
          <li><strong>Wasdrogers</strong> — circa 7 jaar</li>
          <li><strong>Vaatwassers</strong> — circa 7 à 8 jaar</li>
          <li><strong>Ovens, kookplaten &amp; overige inbouwapparatuur</strong> — circa 10 jaar</li>
        </ol>
      </ContentSection>

      <ContentSection title="3. Fabrieksgarantie (extra)">
        <ol className={ol}>
          <li>Naast je wettelijke garantie geldt op de meeste apparaten een <strong>fabrieks- of commerciële garantie</strong> van de fabrikant.</li>
          <li>Deze garantie komt <strong>bovenop</strong> je wettelijke rechten en beperkt die nooit. Een mededeling als "2 jaar garantie" doet dus niets af aan je wettelijke garantie.</li>
          <li>De termijn en voorwaarden verschillen per merk en model en staan vermeld bij de specificaties van het product.</li>
        </ol>
      </ContentSection>

      <ContentSection title="4. Zo vraag je garantie aan">
        <ol className={ol}>
          <li>Mail naar <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">info@sbsnl.nl</a> of bel ons, met je <strong>bestelnummer</strong> en een omschrijving van het probleem (en indien mogelijk een foto of video).</li>
          <li>We beoordelen je melding en plannen reparatie, vervanging of terugbetaling in.</li>
          <li>Voor herstel onder de wettelijke garantie betaal je niets.</li>
        </ol>
      </ContentSection>

      <ContentSection title="Goed om te weten">
        <p className="text-muted">
          Deze informatie is gebaseerd op het Nederlandse consumentenrecht (onder meer artikel 7:17 van het
          Burgerlijk Wetboek over conformiteit) en de uitleg van de Autoriteit Consument &amp; Markt (ACM / ConsuWijzer).
          Je wettelijke rechten blijven altijd van toepassing, ook als een fabrieksgarantie is verlopen.
          Laatst bijgewerkt: 30 mei 2026.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
