'use client';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Product } from '@/types/product';

const WISHLIST_KEY = 'sbs_wishlist';

interface WishlistContextValue {
  items: Product[];
  toggle: (product: Product) => void;
  remove: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  count: number;
  /** Drawer state */
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // accepteer alleen volledige product-objecten (oude versie bewaarde id-strings)
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((x) => x && typeof x === 'object' && 'id' in x));
        }
      }
    } catch {
      /* corrupt storage — start leeg */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const toggle = useCallback((product: Product) => {
    setItems((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => items.some((p) => p.id === productId), [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggle,
        remove,
        isInWishlist,
        count: items.length,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist moet binnen een <WishlistProvider> gebruikt worden');
  return ctx;
}
