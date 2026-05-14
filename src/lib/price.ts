export function hasDiscount(currentPrice: number, originalPrice: number | null): boolean {
  return originalPrice !== null && originalPrice > currentPrice;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function calcSavingsPercent(currentPrice: number, originalPrice: number): number {
  return Math.round((1 - currentPrice / originalPrice) * 100);
}

export function calcSavingsAmount(currentPrice: number, originalPrice: number): number {
  return originalPrice - currentPrice;
}
