import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { safeRedirectPath } from '@/lib/utils';

export const metadata = {
  title: 'Inloggen · Smart Buy Store',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; error?: string };
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-surface border border-border rounded-[12px] p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Inloggen</h1>
        <p className="text-sm text-muted mb-6">
          Log in met je e-mailadres en wachtwoord.
        </p>

        <LoginForm redirectTo={safeRedirectPath(searchParams.redirect, '/account')} />

        <div className="mt-6 pt-6 border-t border-border text-sm text-center space-y-2">
          <div>
            <Link href="/account/wachtwoord-vergeten" className="text-primary hover:underline">
              Wachtwoord vergeten?
            </Link>
          </div>
          <div className="text-muted">
            Nog geen account?{' '}
            <Link href="/account/register" className="text-primary font-medium hover:underline">
              Maak er één aan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
