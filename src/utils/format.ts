export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function formatToman(value: number): string {
  return `${formatNumber(value)} تومان`;
}
