import Link from 'next/link';
import { RegisterForm } from './RegisterForm';

export const metadata = { title: 'Account aanmaken · Smart Buy Store' };

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-surface border border-border rounded-[12px] p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Account aanmaken</h1>
        <p className="text-sm text-muted mb-6">
          Maak een account aan om je bestellingen en facturen te beheren.
        </p>

        <RegisterForm />

        <div className="mt-6 pt-6 border-t border-border text-sm text-center text-muted">
          Heb je al een account?{' '}
          <Link href="/account/login" className="text-primary font-medium hover:underline">
            Inloggen
          </Link>
        </div>
      </div>
    </div>
  );
}
