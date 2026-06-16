import type { Metadata } from 'next';
import { Mail, MapPin, Building2, Clock, Phone } from 'lucide-react';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';
import { getStoreSettings } from '@/lib/db/settings';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = { title: 'Contact — Smart Buy Store' };

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const email = settings.company_email || 'info@smartbuystore.nl';

  return (
    <ContentPage
      title="Contact"
      intro="Een vraag over een product, je bestelling of bezorging? We helpen je graag persoonlijk verder."
    >
      <ContentSection title="Stuur ons een bericht">
        <p>Vul het formulier in — we reageren doorgaans binnen één werkdag.</p>
        <ContactForm />
      </ContentSection>

      <ContentSection title="Direct contact">
        <ul className="flex flex-col gap-2 not-prose">
          <li className="flex items-start gap-2">
            <Mail size={16} className="text-primary shrink-0 mt-0.5" />
            <a href={`mailto:${email}`} className="text-primary underline hover:no-underline">{email}</a>
          </li>
          {settings.company_phone && (
            <li className="flex items-start gap-2">
              <Phone size={16} className="text-primary shrink-0 mt-0.5" />
              <a href={`tel:${settings.company_phone.replace(/\s/g, '')}`} className="text-primary underline hover:no-underline">
                {settings.company_phone}
              </a>
            </li>
          )}
        </ul>
      </ContentSection>

      <ContentSection title="Bedrijfsgegevens">
        <ul className="flex flex-col gap-2 not-prose">
          <li className="flex items-start gap-2">
            <Building2 size={16} className="text-primary shrink-0 mt-0.5" />
            <span>{settings.company_legal || 'Smart Buy Store V.O.F.'} — KvK {settings.company_kvk || '42000760'}{settings.company_btw ? ` — BTW ${settings.company_btw}` : ''}</span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
            <span>
              {settings.company_street ? `${settings.company_street}, ${settings.company_postal} ${settings.company_city}` : 'Newtonweg 15, 8013 RD Zwolle'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Clock size={16} className="text-primary shrink-0 mt-0.5" />
            <span>Bestel vóór 11:00 op werkdagen voor bezorging dezelfde dag.</span>
          </li>
        </ul>
      </ContentSection>
    </ContentPage>
  );
}
