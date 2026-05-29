import { getStoreSettings } from '@/lib/db/settings';
import { SettingsForm } from './SettingsForm';

export const metadata = { title: 'Instellingen · Admin' };

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Instellingen</h1>
        <p className="text-sm text-muted">
          Bedrijfsgegevens. Deze worden gebruikt op facturen en in de footer van de webshop.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
