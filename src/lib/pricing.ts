export function computeFinalPrice(input: any) {
  const base = Number(input?.basePrice) || 0;
  const vm = Number(input?.viewMarkupPercent) || 0;
  const qm = Number(input?.qualityMarkupPercent) || 0;
  const fm = Number(input?.floorMarkupPercent) || 0;
  const final =
    base +
    base * (vm / 100) +
    base * (qm / 100) +
    base * (fm / 100);
  return Math.max(0, Math.round(final * 100) / 100);
}

export function computeTimeSharePrice(finalPrice: number, maxShares?: number) {
  const ms = Number(maxShares) || 0;
  if (!finalPrice || !ms) return 0;
  return Math.round((finalPrice / ms) * 100) / 100;
}
