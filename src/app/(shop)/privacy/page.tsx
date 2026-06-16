import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Privacybeleid — Smart Buy Store' };

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacybeleid"
      intro="Smart Buy Store respecteert je privacy en verwerkt je persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG). Hieronder lees je hoe we met je gegevens omgaan."
    >
      <ContentSection title="1. Wie zijn wij?">
        <p>
          Smart Buy Store V.O.F. is verwerkingsverantwoordelijke voor de verwerking van je persoonsgegevens.
        </p>
        <p>
          Newtonweg 15, 8013 RD Zwolle
          <br />
          KvK 42000760
          <br />
          E-mail:{' '}
          <a href="mailto:info@smartbuystore.nl" className="text-primary underline hover:no-underline">
            info@smartbuystore.nl
          </a>
        </p>
      </ContentSection>

      <ContentSection title="2. Welke gegevens verwerken we?">
        <p>Afhankelijk van je gebruik van de webshop verwerken we onder meer:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>NAW-gegevens (naam, adres, woonplaats) voor bezorging en facturatie;</li>
          <li>contactgegevens (e-mailadres, telefoonnummer);</li>
          <li>bestel- en betaalgegevens;</li>
          <li>accountgegevens als je een account aanmaakt;</li>
          <li>technische gegevens (zoals IP-adres) en, met toestemming, cookies.</li>
        </ul>
      </ContentSection>

      <ContentSection title="3. Waarvoor gebruiken we je gegevens?">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>het verwerken en bezorgen van je bestelling (uitvoering overeenkomst);</li>
          <li>klantenservice en communicatie over je bestelling;</li>
          <li>het voldoen aan wettelijke verplichtingen (zoals de fiscale bewaarplicht);</li>
          <li>verbetering van de webshop en — alleen met toestemming — marketing.</li>
        </ul>
      </ContentSection>

      <ContentSection title="4. Delen met derden">
        <p>
          We delen je gegevens alleen wanneer dat nodig is voor onze dienstverlening of wettelijk verplicht is,
          bijvoorbeeld met onze bezorgpartner, onze betaaldienstverlener (Mollie) en onze hostingpartner. Met
          deze partijen zijn waar nodig verwerkersovereenkomsten gesloten. We verkopen je gegevens nooit.
        </p>
      </ContentSection>

      <ContentSection title="5. Bewaartermijnen">
        <p>
          We bewaren je gegevens niet langer dan nodig. Voor de financiële administratie geldt een wettelijke
          bewaarplicht van 7 jaar. Accountgegevens bewaren we zolang je account actief is.
        </p>
      </ContentSection>

      <ContentSection title="6. Cookies">
        <p>
          Onze website gebruikt cookies. Lees ons{' '}
          <a href="/cookiebeleid" className="text-primary underline hover:no-underline">
            cookiebeleid
          </a>{' '}
          voor meer informatie en het beheren van je voorkeuren.
        </p>
      </ContentSection>

      <ContentSection title="7. Je rechten">
        <p>
          Je hebt het recht op inzage, correctie, verwijdering en overdracht van je gegevens, en je kunt bezwaar
          maken tegen verwerking of je toestemming intrekken. Stuur hiervoor een e-mail naar{' '}
          <a href="mailto:info@smartbuystore.nl" className="text-primary underline hover:no-underline">
            info@smartbuystore.nl
          </a>
          . Je hebt ook het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens.
        </p>
      </ContentSection>

      <ContentSection title="8. Beveiliging">
        <p>
          We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen tegen
          verlies of onrechtmatig gebruik.
        </p>
      </ContentSection>

      <ContentSection title="9. Wijzigingen">
        <p>
          We kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest actuele versie vind je altijd op
          deze pagina.
        </p>
        <p className="text-muted">Laatst bijgewerkt: mei 2026.</p>
      </ContentSection>
    </ContentPage>
  );
}
