'use client';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, Zap, Headphones, Heart, Phone } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { SearchBox } from './SearchBox';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/categorie/koelkasten', label: 'Koelkasten' },
  { href: '/categorie/wasmachines', label: 'Wasmachines' },
  { href: '/categorie/vaatwassers', label: 'Vaatwassers' },
  { href: '/categorie/koken', label: 'Koken & Bakken' },
  { href: '/categorie/drogers', label: 'Drogers' },
  { href: '/merken', label: 'Merken' },
];

export function Header({ phone }: { phone?: string }) {
  const { totalItems, openCart } = useCart();
  const { count: wishlistCount, open: openWishlist } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 cursor-pointer">
            <span className="text-xl font-display font-black text-primary tracking-tight">
              Smartbuy<span className="text-accent">store</span>
            </span>
            <span className="hidden sm:block text-xs font-semibold text-muted border-l border-border pl-2">
              Witgoed Specialist
            </span>
          </Link>

          {/* Search bar */}
          <SearchBox className="flex-1 max-w-xl hidden md:block" />

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-[12px] hover:bg-background transition-colors cursor-pointer"
              aria-label="Zoeken"
            >
              <Search size={20} className="text-foreground" />
            </button>

            {phone ? (
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="hidden lg:flex items-center gap-1.5 p-2 rounded-[12px] hover:bg-background transition-colors cursor-pointer"
              >
                <Phone size={20} className="text-success" />
                <span className="text-sm font-semibold text-foreground">{phone}</span>
              </a>
            ) : (
              <Link
                href="/contact"
                className="hidden lg:flex items-center gap-1.5 p-2 rounded-[12px] hover:bg-background transition-colors cursor-pointer"
              >
                <Headphones size={20} className="text-foreground" />
                <span className="text-sm font-medium text-foreground">Klantenservice</span>
              </Link>
            )}

            <button
              onClick={openWishlist}
              className="relative hidden sm:flex items-center p-2 rounded-[12px] hover:bg-background transition-colors cursor-pointer"
              aria-label={`Verlanglijst openen${wishlistCount > 0 ? `, ${wishlistCount} producten` : ''}`}
            >
              <Heart size={20} className="text-foreground" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </button>

            <Link
              href="/account"
              className="hidden sm:flex items-center gap-1.5 p-2 rounded-[12px] hover:bg-background transition-colors cursor-pointer"
            >
              <User size={20} className="text-foreground" />
              <span className="text-sm font-medium text-foreground">Account</span>
            </Link>

            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-[12px] hover:bg-primary/90 transition-colors cursor-pointer"
              aria-label={`Winkelwagen openen${totalItems > 0 ? `, ${totalItems} artikelen` : ''}`}
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:block text-sm font-semibold">Winkelwagen</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-[12px] hover:bg-background transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 pb-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary hover:bg-background rounded-[8px] transition-all duration-150 cursor-pointer"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/aanbiedingen"
            className="ml-2 flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-accent hover:bg-accent/10 rounded-[8px] transition-all duration-150 cursor-pointer"
          >
            <Zap size={14} className="fill-accent" />
            Aanbiedingen
          </Link>
        </nav>
      </div>

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-border pt-3">
          <SearchBox autoFocus />
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-border px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-background rounded-[8px] transition-all duration-150 cursor-pointer"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/aanbiedingen"
            onClick={() => setMenuOpen(false)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-accent hover:bg-accent/10 rounded-[8px] transition-all duration-150 cursor-pointer'
            )}
          >
            <Zap size={14} className="fill-accent" />
            Aanbiedingen
          </Link>

          <div className="border-t border-border my-2" />

          <Link
            href="/verlanglijst"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-background rounded-[8px] transition-all duration-150 cursor-pointer"
          >
            <Heart size={16} />
            Verlanglijst
            {wishlistCount > 0 && (
              <span className="ml-auto bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-background rounded-[8px] transition-all duration-150 cursor-pointer"
          >
            <User size={16} />
            Account
          </Link>
        </nav>
      )}
    </header>
  );
}
