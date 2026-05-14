import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata = { title: 'Wachtwoord vergeten · Smart Buy Store' };

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-surface border border-border rounded-[12px] p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Wachtwoord vergeten</h1>
        <p className="text-sm text-muted mb-6">
          Vul je e-mailadres in. Als het bekend is sturen we je een link om een nieuw wachtwoord in te stellen.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
