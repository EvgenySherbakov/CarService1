import { Config } from '@/constants/config';

/** Format a number as BRL (or another configured currency) for display. */
export function formatAmount(amount: number, currency = Config.currency): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Config.currencyDisplay} ${amount.toFixed(0)}`;
  }
}
