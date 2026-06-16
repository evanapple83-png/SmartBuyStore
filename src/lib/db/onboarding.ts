import { getSupabaseServer } from '@/lib/supabase/server';
import { getStoreSettings } from '@/lib/db/settings';

export type OnboardingStep = { key: string; label: string; done: boolean; href: string };

export async function getOnboardingStatus(): Promise<{ steps: OnboardingStep[]; complete: boolean }> {
  const supabase = getSupabaseServer();
  const settings = await getStoreSettings();

  let productCount = 0;
  let courierCount = 0;
  try {
    const [{ count: pc }, { count: cc }] = await Promise.all([
      supabase.from('sbs_products').select('id', { count: 'exact', head: true }),
      supabase.from('sbs_profiles').select('id', { count: 'exact', head: true }).eq('role', 'delivery').eq('is_active', true),
    ]);
    productCount = pc || 0;
    courierCount = cc || 0;
  } catch { /* defensief */ }

  const settingsDone = !!(settings.company_btw && settings.company_phone && settings.company_street);

  const steps: OnboardingStep[] = [
    { key: 'settings', label: 'Vul je bedrijfsgegevens in (BTW, telefoon, adres)', done: settingsDone, href: '/admin/instellingen' },
    { key: 'products', label: 'Voeg je eerste product(en) toe', done: productCount > 0, href: '/admin/producten/nieuw' },
    { key: 'courier', label: 'Maak minimaal één bezorger aan', done: courierCount > 0, href: '/admin/accounts' },
    { key: 'mollie', label: 'Koppel Mollie voor online betalingen', done: !!process.env.MOLLIE_API_KEY, href: '/admin/help' },
    { key: 'mail', label: 'Koppel e-mail (Mailgun) voor automatische mails', done: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN), href: '/admin/help' },
  ];

  return { steps, complete: steps.every((s) => s.done) };
}
