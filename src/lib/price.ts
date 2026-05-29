export function hasDiscount(currentPrice: number, originalPrice: number | null): boolean {
  return originalPrice !== null && originalPrice > currentPrice;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Premium Dutch retail format: hele euro's tonen als "1.499,-",
 * bedragen met centen als "1.499,95". Voor weergave op kaarten/PDP.
 */
export function formatPriceShort(price: number): string {
  const isWhole = Number.isInteger(price);
  if (isWhole) {
    return `${price.toLocaleString('nl-NL')},-`;
  }
  return price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function calcSavingsPercent(currentPrice: number, originalPrice: number): number {
  return Math.round((1 - currentPrice / originalPrice) * 100);
}

export function calcSavingsAmount(currentPrice: number, originalPrice: number): number {
  return originalPrice - currentPrice;
}
