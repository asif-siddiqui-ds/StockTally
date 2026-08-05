// // types/quote.ts

// export type QuoteStatus =
//   | "draft"
//   | "sent"
//   | "accepted"
//   | "rejected"
//   | "expired"
//   | "converted"
//   | "cancelled";

// export type QuoteItemType = "stock" | "custom";

// export type QuoteItem = {
//   id: string;
//   quoteId?: string;
//   itemType: QuoteItemType;
//   name: string;
//   stockItemId?: string;
//   customerName: string;
//   description?: string;
//   quantity: number;
//   unitPrice: number;
//   taxRate: number;
//   discountType?: "percentage" | "fixed";
//   discountValue?: number;
//   lineSubtotal: number;
//   lineDiscount: number;
//   lineTax: number;
//   lineTotal: number;
//   createdAt: string;
//   updatedAt: string;
// };

// export type Quote = {
//   id: string;
//   cloudId?: string;
//   userId?: string | null;
//   quoteNumber: string;
//   reference?: string;
//   status: QuoteStatus;
//   quoteDate: string;
//   expiryDate?: string;
//   customerId?: string;
//   customerName: string;
//   customerCompany?: string;
//   customerEmail?: string;
//   customerPhone?: string;
//   customerAddress?: string;
//   notes?: string;
//   terms?: string;
//   currencyCode: string;
//   currencySymbol: string;
//   locale: string;
//   subtotal: number;
//   discountTotal: number;
//   taxTotal: number;
//   grandTotal: number;
//   items: QuoteItem[];
//   convertedInvoiceId?: string;
//   convertedAt?: string;
//   createdAt: string;
//   updatedAt: string;
//   synced?: boolean;
//   syncedAt?: string;
// };

// export type CreateQuoteInput = Omit<
//   Quote,
//   | "id"
//   | "createdAt"
//   | "updatedAt"
//   | "convertedInvoiceId"
//   | "convertedAt"
// >;

// export type UpdateQuoteInput = Partial<
//   Omit<Quote, "id" | "createdAt">
// >;

// export const getQuoteCustomerLabel = (
//   quote: Pick<Quote, "customerCompany" | "customerName">
// ): string =>
//   quote.customerCompany?.trim() ||
//   quote.customerName?.trim() ||
//   "Unnamed customer";

// export const isQuoteExpired = (
//   quote: Pick<Quote, "expiryDate" | "status">
// ): boolean => {
//   if (!quote.expiryDate) return false;

//   if (
//     ["accepted", "rejected", "converted", "cancelled"].includes(
//       quote.status
//     )
//   ) {
//     return false;
//   }

//   const expiry = new Date(quote.expiryDate);
//   const today = new Date();

//   expiry.setHours(23, 59, 59, 999);
//   today.setHours(0, 0, 0, 0);

//   return expiry.getTime() < today.getTime();
// };

// types/quote.ts

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted"
  | "cancelled";

export type QuoteItemType = "stock" | "custom";

export type QuoteItem = {
  id: string;
  quoteId?: string;

  itemType: QuoteItemType;

  name: string;
  description?: string;

  stockItemId?: string;

  quantity: number;
  unitPrice: number;
  taxRate: number;

  discountType?: "percentage" | "fixed";
  discountValue?: number;

  lineSubtotal: number;
  lineDiscount: number;
  lineTax: number;
  lineTotal: number;

  createdAt: string;
  updatedAt: string;
};

export type Quote = {
  id: string;
  cloudId?: string;
  userId?: string | null;

  quoteNumber: string;
  reference?: string;
  status: QuoteStatus;

  quoteDate: string;
  expiryDate?: string;

  customerId?: string;
  customerName: string;
  customerCompany?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;

  notes?: string;
  terms?: string;

  currencyCode: string;
  currencySymbol: string;
  locale: string;

  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;

  items: QuoteItem[];

  convertedInvoiceId?: string;
  convertedAt?: string;

  createdAt: string;
  updatedAt: string;

  synced?: boolean;
  syncedAt?: string;
};

export type CreateQuoteInput = Omit<
  Quote,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "convertedInvoiceId"
  | "convertedAt"
>;

export type UpdateQuoteInput = Partial<
  Omit<Quote, "id" | "createdAt">
>;

export const getQuoteCustomerLabel = (
  quote: Pick<Quote, "customerCompany" | "customerName">
): string =>
  quote.customerCompany?.trim() ||
  quote.customerName?.trim() ||
  "Unnamed customer";

export const isQuoteExpired = (
  quote: Pick<Quote, "expiryDate" | "status">
): boolean => {
  if (!quote.expiryDate) return false;

  if (
    ["accepted", "rejected", "converted", "cancelled"].includes(
      quote.status
    )
  ) {
    return false;
  }

  const expiry = new Date(quote.expiryDate);
  const today = new Date();

  expiry.setHours(23, 59, 59, 999);
  today.setHours(0, 0, 0, 0);

  return expiry.getTime() < today.getTime();
};