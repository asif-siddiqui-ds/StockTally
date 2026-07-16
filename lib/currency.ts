import { CompanyProfile } from "./storage";

export function formatCurrencyFromProfile(
  amount: number,
  profile?: Partial<CompanyProfile>
) {
  const currencyCode = profile?.currencyCode || "GBP";
  const locale = profile?.locale || "en-GB";

  return formatCurrency(amount, currencyCode, locale);
}

// export function formatCurrency(
//   amount: number,
//   currencyCode: string = "GBP",
//   locale: string = "en-GB"
// ) {
//   try {
//     return new Intl.NumberFormat(locale, {
//       style: "currency",
//       currency: currencyCode,
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(amount || 0);
//   } catch (error) {
//     console.warn("Currency formatting failed:", error);

//     return `${currencyCode} ${(amount || 0).toFixed(2)}`;
//   }
// }

export function formatCurrency(
  amount: number,
  currencyCode = "GBP",
  locale = "en-GB"
) {
  try {
    const isWholeNumber = Number.isInteger(amount);

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currencyCode} ${amount.toLocaleString()}`;
  }
}