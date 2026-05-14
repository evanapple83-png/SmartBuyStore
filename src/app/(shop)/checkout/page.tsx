import { getSupabaseServer } from '@/lib/supabase/server';
import { CheckoutForm } from './CheckoutForm';

export const metadata = { title: 'Afrekenen · Smart Buy Store' };

export default async function CheckoutPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let prefill: { name?: string; email?: string; phone?: string } = {};
  if (user) {
    const { data: profile } = await supabase
      .from('sbs_profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single();
    prefill = {
      name: profile?.full_name || '',
      email: user.email || '',
      phone: profile?.phone || '',
    };
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-black text-foreground mb-6">Afrekenen</h1>
      <CheckoutForm prefill={prefill} />
    </div>
  );
}
