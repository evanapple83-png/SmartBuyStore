import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Retourneren & herroepingsrecht — Smart Buy Store' };

const ol = 'list-decimal pl-5 flex flex-col gap-1.5 marker:text-muted marker:font-semibold';

export default function RetourPage() {
  return (
    <ContentPage
      title="Retourneren & herroepingsrecht"
      intro="Je hebt wettelijk 14 dagen bedenktijd. Bij Smart Buy Store krijg je daar bovenop een ruimere termijn van 30 dagen. Hieronder lees je precies hoe het werkt."
    >
      <ContentSection title="1. Wettelijke bedenktijd van 14 dagen">
        <ol className={ol}>
          <li>Je hebt een wettelijke bedenktijd van <strong>14 dagen</strong>. Deze gaat in op de dag nadat je het product hebt ontvangen (bij een bestelling met meerdere producten: de dag na ontvangst van het laatste product).</li>
          <li>Binnen deze 14 dagen mag je de koop <strong>zonder opgaaf van reden</strong> ontbinden (herroepen).</li>
          <li>Je meldt de herroeping per e-mail, telefoon of via het contactformulier, of met het <strong>modelformulier voor herroeping</strong> (zie onderaan deze pagina).</li>
          <li>Na je melding heb je nog eens <strong>14 dagen</strong> de tijd om het product terug te sturen of te laten ophalen.</li>
        </ol>
      </ContentSection>

      <ContentSection title="2. Onze ruimere retourtermijn van 30 dagen">
        <p>Bovenop je wettelijke recht geven wij je extra tijd. Deze coulanceregeling staat los van — en beperkt nooit — je wettelijke bedenktijd van 14 dagen.</p>
        <ol className={ol}>
          <li>Je kunt je bestelling tot <strong>30 dagen</strong> na ontvangst retourneren.</li>
          <li>Het product is <strong>onbeschadigd en compleet</strong>, inclusief alle toebehoren en (waar mogelijk) de originele verpakking.</li>
          <li>Voor de extra periode (dag 15 t/m 30) vragen we dat het product <strong>ongebruikt en in nieuwstaat</strong> is.</li>
        </ol>
      </ContentSection>

      <ContentSection title="3. Uitproberen & waardevermindering">
        <ol className={ol}>
          <li>Je mag het apparaat uitpakken en uitproberen zoals je dat in een winkel zou doen, om de aard, eigenschappen en werking te beoordelen.</li>
          <li>Gebruik je het product méér dan daarvoor nodig is en daalt het daardoor in waarde, dan mogen wij die <strong>waardevermindering</strong> bij je in rekening brengen.</li>
        </ol>
      </ContentSection>

      <ContentSection title="4. Zo retourneer je">
        <ol className={ol}>
          <li>Mail naar <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">info@sbsnl.nl</a> of bel ons, met je <strong>bestelnummer</strong> en (optioneel) de reden.</li>
          <li>We plannen samen het ophalen of de retourzending in.</li>
          <li>Stuur het product compleet en goed verpakt retour, of houd het klaar voor ophalen.</li>
          <li>Na ontvangst en controle handelen we de terugbetaling af (zie punt 5).</li>
        </ol>
      </ContentSection>

      <ContentSection title="5. Terugbetaling">
        <ol className={ol}>
          <li>We betalen je binnen <strong>14 dagen</strong> nadat je de koop hebt herroepen terug.</li>
          <li>We vergoeden ook de standaard bezorgkosten die je hebt betaald. Koos je voor een duurdere verzendmethode, dan vergoeden we het bedrag van de standaardmethode.</li>
          <li>Terugbetaling gebeurt met <strong>hetzelfde betaalmiddel</strong> als waarmee je betaalde, zonder dat dit je extra kosten oplevert (tenzij je uitdrukkelijk anders afspreekt).</li>
          <li>We mogen wachten met terugbetalen tot we het product retour hebben ontvangen, of tot je hebt aangetoond dat je het hebt teruggestuurd.</li>
        </ol>
      </ContentSection>

      <ContentSection title="6. Kosten van het retourneren">
        <ol className={ol}>
          <li>De directe kosten van het terugsturen of ophalen zijn voor jouw rekening. We informeren je vooraf over het bedrag.</li>
          <li>Stuur je maar een deel van je bestelling terug, dan worden de oorspronkelijke bezorgkosten niet vergoed.</li>
        </ol>
      </ContentSection>

      <ContentSection title="7. Uitzonderingen op het herroepingsrecht">
        <p>Voor een beperkt aantal producten geldt het wettelijke herroepingsrecht niet:</p>
        <ol className={ol}>
          <li>Op maat gemaakte of duidelijk voor jou persoonlijk bestemde producten.</li>
          <li>Verzegelde producten die om gezondheids- of hygiënische redenen niet geschikt zijn om te worden teruggestuurd, als de verzegeling na levering is verbroken.</li>
          <li>Producten die na levering door hun aard onherroepelijk vermengd zijn met andere zaken.</li>
        </ol>
        <p className="text-muted">Twijfel je of jouw product hieronder valt? Neem gerust contact met ons op — we helpen je graag.</p>
      </ContentSection>

      <ContentSection title="8. Modelformulier voor herroeping">
        <p>Je bent niet verplicht dit formulier te gebruiken, maar het mag. Stuur het ingevuld naar <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">info@sbsnl.nl</a>.</p>
        <div className="bg-surface border border-border rounded-[10px] p-4 text-sm text-foreground/80 leading-relaxed">
          <p className="mb-2">Aan: Smart Buy Store, Newtonweg 15, 8013 RD Zwolle, info@sbsnl.nl</p>
          <p className="mb-2">— Ik/Wij* deel/delen* u hierbij mede dat ik/wij* onze overeenkomst betreffende de verkoop van de volgende producten herroep/herroepen*:</p>
          <p className="mb-1">— Besteld op* / ontvangen op*: …</p>
          <p className="mb-1">— Bestelnummer: …</p>
          <p className="mb-1">— Naam consument(en): …</p>
          <p className="mb-1">— Adres consument(en): …</p>
          <p className="mb-1">— Datum: …</p>
          <p className="mb-1">— Handtekening (alleen bij papieren formulier): …</p>
          <p className="text-muted mt-2">* Doorhalen wat niet van toepassing is.</p>
        </div>
      </ContentSection>

      <ContentSection title="Goed om te weten">
        <p className="text-muted">
          Deze voorwaarden zijn opgesteld op basis van het Nederlandse consumentenrecht (onder meer de artikelen
          6:230o tot en met 6:230s van het Burgerlijk Wetboek) en de informatie van de Autoriteit Consument &amp; Markt
          (ACM / ConsuWijzer). Je wettelijke rechten blijven altijd van toepassing. Laatst bijgewerkt: 30 mei 2026.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
