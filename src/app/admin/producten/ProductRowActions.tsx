'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Edit } from 'lucide-react';
import { toggleProductHidden } from '@/lib/db/product-actions';

export function ProductRowActions({ id, isHidden }: { id: string; isHidden: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function handleToggle() {
    start(async () => {
      await toggleProductHidden(id, !isHidden);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-1">
      <Link
        href={`/admin/producten/${id}`}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px] transition-colors"
      >
        <Edit size={12} />
        Bewerken
      </Link>
      <button
        onClick={handleToggle}
        disabled={pending}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px] transition-colors disabled:opacity-50"
      >
        {isHidden ? (
          <>
            <Eye size={12} />
            Zichtbaar maken
          </>
        ) : (
          <>
            <EyeOff size={12} />
            Verbergen
          </>
        )}
      </button>
    </div>
  );
}
