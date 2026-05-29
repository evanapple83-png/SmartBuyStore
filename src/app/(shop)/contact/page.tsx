import type { Metadata } from 'next';
import { Mail, MapPin, Building2, Clock } from 'lucide-react';
import { ContentPage, ContentSection } from '@/components/legal/ContentPage';

export const metadata: Metadata = { title: 'Contact — Smart Buy Store' };

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      intro="Een vraag over een product, je bestelling of bezorging? We helpen je graag persoonlijk verder."
    >
      <ContentSection title="Mail ons">
        <p>
          De snelste manier om ons te bereiken is via e-mail. We reageren doorgaans binnen één werkdag.
        </p>
        <div className="pt-1">
          <a
            href="mailto:info@sbsnl.nl"
            className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-accent/90 transition-colors"
          >
            <Mail size={16} />
            info@sbsnl.nl
          </a>
        </div>
      </ContentSection>

      <ContentSection title="Bedrijfsgegevens">
        <ul className="flex flex-col gap-2">
          <li className="flex items-start gap-2">
            <Building2 size={16} className="text-primary shrink-0 mt-0.5" />
            <span>Smart Buy Store V.O.F. — KvK 42000760</span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
            <span>Newtonweg 15, 8013 RD Zwolle</span>
          </li>
          <li className="flex items-start gap-2">
            <Mail size={16} className="text-primary shrink-0 mt-0.5" />
            <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">
              info@sbsnl.nl
            </a>
          </li>
          <li className="flex items-start gap-2">
            <Clock size={16} className="text-primary shrink-0 mt-0.5" />
            <span>Bestel vóór 12:00 op werkdagen voor bezorging dezelfde dag.</span>
          </li>
        </ul>
      </ContentSection>
    </ContentPage>
  );
}
