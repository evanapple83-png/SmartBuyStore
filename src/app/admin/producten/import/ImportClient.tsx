'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { importProducts, type ImportResult } from '@/lib/db/import-actions';

const TEMPLATE_HEADER = 'name,sku,slug,brand,category,current_price,original_price,stock_count,short_description,energy_label,is_hidden';
const TEMPLATE_ROWS = [
  'Samsung RB34 koelkast,SAM-RB34,,Samsung,koelkasten,499,599,8,No Frost koel-vriescombinatie,A,nee',
  'Bauknecht wasmachine 8kg,BAU-W8,,Bauknecht,wasmachines,429,,5,1400 toeren 8 kg,B,nee',
];

export function ImportClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function downloadTemplate() {
    const csv = [TEMPLATE_HEADER, ...TEMPLATE_ROWS].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'producten-import-voorbeeld.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setResult(null);
    const file = inputRef.current?.files?.[0];
    if (!file) { setError('Kies eerst een CSV-bestand.'); return; }
    const fd = new FormData();
    fd.set('file', file);
    start(async () => {
      const r = await importProducts(fd);
      if (!r.ok) { setError(r.error || 'Import mislukt'); return; }
      setResult(r);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-surface border border-border rounded-[12px] p-5">
        <h2 className="text-sm font-bold text-foreground mb-2">1. Download het voorbeeldbestand</h2>
        <p className="text-sm text-muted mb-3">
          Vul de kolommen in (verplicht: <code className="bg-background px-1 rounded">name</code> en{' '}
          <code className="bg-background px-1 rounded">current_price</code>). <strong>brand</strong> en{' '}
          <strong>category</strong> mogen de naam of de slug zijn. Bestaat een <strong>sku</strong> of <strong>slug</strong> al,
          dan wordt het product bijgewerkt; anders aangemaakt.
        </p>
        <button onClick={downloadTemplate} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <Download size={15} /> producten-import-voorbeeld.csv
        </button>
      </div>

      <form onSubmit={onSubmit} className="bg-surface border border-border rounded-[12px] p-5">
        <h2 className="text-sm font-bold text-foreground mb-3">2. Upload je ingevulde CSV</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-[10px] hover:bg-background">
            <FileText size={15} /> {fileName || 'Kies CSV-bestand'}
          </button>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} />
          <button type="submit" disabled={pending} className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[10px] hover:bg-primary/90 disabled:opacity-50">
            <Upload size={15} /> {pending ? 'Importeren...' : 'Importeren'}
          </button>
        </div>
        {error && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>}
      </form>

      {result && (
        <div className="bg-surface border border-border rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-foreground">Import voltooid</h2>
          </div>
          <div className="flex gap-4 text-sm mb-3">
            <span><strong className="text-emerald-700">{result.created}</strong> aangemaakt</span>
            <span><strong className="text-blue-700">{result.updated}</strong> bijgewerkt</span>
            <span><strong className={result.errors.length ? 'text-red-700' : 'text-muted'}>{result.errors.length}</strong> fout(en)</span>
          </div>
          {result.errors.length > 0 && (
            <div className="border border-amber-200 bg-amber-50 rounded-[8px] p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mb-1"><AlertTriangle size={13} /> Niet verwerkte rijen</div>
              <ul className="text-xs text-amber-900 space-y-0.5 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => <li key={i}>Rij {e.row}: {e.message}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
