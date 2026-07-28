/**
 * Formats an amount for compact display, abbreviating millions/billions
 * (e.g. 1,500,000 -> "1.5M", 2,300,000,000 -> "2.3B"). Amounts under a
 * million are shown with full thousand separators, unabbreviated.
 */
export function formatMoney(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);

  if (abs >= 1_000_000_000) {
    return `${sign}${trimDecimal(abs / 1_000_000_000)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${trimDecimal(abs / 1_000_000)}M`;
  }
  return amount.toLocaleString();
}

function trimDecimal(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}
