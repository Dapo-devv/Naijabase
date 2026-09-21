import { useNaijaBase } from "../context/NaijaBaseContext";
import {
  formatCurrency,
  getCurrencySymbol,
  getCurrency,
} from "../utils/constants";

/**
 * Custom hook to get the current user's currency preference
 * and a format function that automatically uses their currency.
 *
 * Usage:
 *   const { format, symbol, code } = useCurrency();
 *   <p>{format(monthlySpend)}</p>
 */
export function useCurrency() {
  const { currentUser } = useNaijaBase();
  const code = currentUser?.data?.currency || "USD";
  const currency = getCurrency(code);

  return {
    code,
    symbol: currency.symbol,
    name: currency.name,
    flag: currency.flag,
    format: (amount) => formatCurrency(amount, code),
  };
}
