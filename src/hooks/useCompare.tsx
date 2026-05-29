'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product } from '@/types/product';

const MAX_COMPARE = 4;

interface CompareContextValue {
  items: Product[];
  toggle: (p: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  canAdd: boolean;
  max: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback((p: Product) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === p.id)) return prev.filter((i) => i.id !== p.id);
      if (prev.length >= MAX_COMPARE) return prev; // negeer boven max
      return [...prev, p];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const isSelected = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  return (
    <CompareContext.Provider
      value={{
        items,
        toggle,
        remove,
        clear,
        isSelected,
        canAdd: items.length < MAX_COMPARE,
        max: MAX_COMPARE,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare moet binnen een <CompareProvider> gebruikt worden');
  return ctx;
}
