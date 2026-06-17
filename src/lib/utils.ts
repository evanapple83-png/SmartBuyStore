import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Maakt een redirect-parameter veilig tegen open-redirect aanvallen.
 * Alleen interne paden ('/...') zijn toegestaan; protocol-relatieve URLs
 * ('//evil.com'), backslash-trucs en absolute URLs vallen terug op `fallback`.
 */
export function safeRedirectPath(value: string | undefined | null, fallback: string): string {
  if (!value) return fallback;
  // Moet met één enkele slash beginnen (geen '//' of '/\' → externe host).
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  // Geen control characters / whitespace die parsing kunnen omzeilen.
  if (/[\x00-\x1f\x7f]/.test(value)) return fallback;
  return value;
}
