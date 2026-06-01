import { Suspense } from 'react';
import { VerifyClient } from './VerifyClient';

export const metadata = { title: 'E-mail bevestigen · Smart Buy Store' };

export default function VerifyPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-surface border border-border rounded-[12px] p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">E-mail bevestigen</h1>
        <p className="text-sm text-muted mb-6">
          Een moment — we ronden de bevestiging van je account af.
        </p>
        <Suspense fallback={<div className="text-sm text-muted">Laden…</div>}>
          <VerifyClient />
        </Suspense>
      </div>
    </div>
  );
}
