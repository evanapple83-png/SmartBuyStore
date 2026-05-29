import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Retourneren — Smart Buy Store' };

export default function RetourPage() {
  return (
    <ContentPage
      title="Retourneren"
      intro="Niet helemaal tevreden? Je hebt 30 dagen bedenktijd. We maken retourneren zo makkelijk mogelijk."
    >
      <ContentSection title="30 dagen retourrecht">
        <p>
          Je mag je bestelling binnen 30 dagen na ontvangst zonder opgaaf van reden retourneren. Het product
          moet onbeschadigd en compleet zijn, inclusief toebehoren.
        </p>
      </ContentSection>

      <ContentSection title="Hoe retourneer je?">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>
            Mail naar{' '}
            <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">
              info@sbsnl.nl
            </a>{' '}
            met je bestelnummer en de reden van retour.
          </li>
          <li>We plannen samen het ophalen of de retourzending in.</li>
          <li>Na ontvangst en controle storten we het aankoopbedrag binnen 14 dagen terug.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Uitzonderingen">
        <p>
          Het herroepingsrecht geldt niet voor producten die om hygiënische redenen of door maatwerk zijn
          uitgesloten. Bij twijfel helpen we je graag verder.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
