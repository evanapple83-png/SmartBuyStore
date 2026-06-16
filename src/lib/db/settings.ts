import { unstable_cache } from 'next/cache';
import { getSupabasePublic } from '@/lib/supabase/server';

/**
 * Winkelinstellingen (key-value) uit sbs_settings.
 * Defensief: ontbrekende tabel mag niets laten crashen — geeft defaults terug.
 */

export type StoreSettings = {
  company_name: string;
  company_legal: string;
  company_email: string;
  company_phone: string;
  company_street: string;
  company_postal: string;
  company_city: string;
  company_country: string;
  company_kvk: string;
  company_btw: string;
  company_iban: string;
  invoice_footer: string;
  return_fee_large: string; // retour-/afhandelvergoeding groot witgoed (euro, als tekst)
};

export const SETTINGS_DEFAULTS: StoreSettings = {
  company_name: 'Smart Buy Store',
  company_legal: 'Smart Buy Store B.V.',
  company_email: 'info@smartbuystore.nl',
  company_phone: '',
  company_street: '',
  company_postal: '',
  company_city: '',
  company_country: 'Nederland',
  company_kvk: '',
  company_btw: 'NL869225455B01',
  company_iban: '',
  invoice_footer: 'Bedankt voor je bestelling bij Smart Buy Store.',
  return_fee_large: '',
};

/**
 * Instellingen worden gecached (revalidate 5 min, tag 'store-settings') en via
 * de cookie-loze publieke client gelezen. Zo blokkeren ze geen statische
 * rendering en kosten ze niet bij elke pageload een DB-round-trip. Wijzigingen
 * via updateStoreSettings roepen revalidateTag('store-settings') aan.
 */
export const getStoreSettings = unstable_cache(
  async (): Promise<StoreSettings> => {
    try {
      const supabase = getSupabasePublic();
      const { data, error } = await supabase.from('sbs_settings').select('key, value');
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data ?? []) {
        // Lege waarden negeren: anders overschrijft een leeg DB-veld de default
        // (bv. een nog niet ingevuld BTW-nummer zou het juiste nummer verbergen).
        const value = row.value as string | null;
        if (value != null && value.trim() !== '') map[row.key as string] = value;
      }
      return { ...SETTINGS_DEFAULTS, ...map } as StoreSettings;
    } catch (err) {
      console.warn('getStoreSettings fallback (tabel ontbreekt?):', err);
      return { ...SETTINGS_DEFAULTS };
    }
  },
  ['store-settings'],
  { revalidate: 300, tags: ['store-settings'] }
);
