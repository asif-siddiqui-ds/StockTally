// lib/quoteStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  CreateQuoteInput,
  Quote,
  QuoteStatus,
  UpdateQuoteInput,
} from "@/types/quote";

const QUOTES_STORAGE_KEY = "@stocktally_quotes_v1";

const createId = (): string =>
  `quote_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const normaliseNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normaliseQuote = (quote: Quote): Quote => ({
  ...quote,
  cloudId: quote.cloudId || undefined,
  userId: quote.userId || "guest",
  subtotal: normaliseNumber(quote.subtotal),
  discountTotal: normaliseNumber(quote.discountTotal),
  taxTotal: normaliseNumber(quote.taxTotal),
  grandTotal: normaliseNumber(quote.grandTotal),
  synced: Boolean(quote.synced),
  syncedAt: quote.syncedAt || undefined,
  items: Array.isArray(quote.items)
    ? quote.items.map((item) => ({
        ...item,
        quantity: normaliseNumber(item.quantity),
        unitPrice: normaliseNumber(item.unitPrice),
        taxRate: normaliseNumber(item.taxRate),
        discountValue: normaliseNumber(item.discountValue),
        lineSubtotal: normaliseNumber(item.lineSubtotal),
        lineDiscount: normaliseNumber(item.lineDiscount),
        lineTax: normaliseNumber(item.lineTax),
        lineTotal: normaliseNumber(item.lineTotal),
      }))
    : [],
});

export const saveAllQuotes = async (
  quotes: Quote[]
): Promise<void> => {
  await AsyncStorage.setItem(
    QUOTES_STORAGE_KEY,
    JSON.stringify(quotes.map(normaliseQuote))
  );
};

export const getQuotes = async (): Promise<Quote[]> => {
  try {
    const raw = await AsyncStorage.getItem(QUOTES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normaliseQuote)
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
  } catch (error) {
    console.error("❌ Failed to load quotes:", error);
    return [];
  }
};

export const getQuoteById = async (
  id: string
): Promise<Quote | null> => {
  const quotes = await getQuotes();
  return (
    quotes.find(
      (quote) => quote.id === id || quote.cloudId === id
    ) || null
  );
};

export const getNextQuoteNumber = async (): Promise<string> => {
  const quotes = await getQuotes();

  const highest = quotes.reduce((max, quote) => {
    const match = quote.quoteNumber.match(/(\d+)$/);
    const number = match ? Number(match[1]) : 0;
    return Math.max(max, number);
  }, 0);

  return `QUO-${String(highest + 1).padStart(5, "0")}`;
};

export const createQuote = async (
  input: CreateQuoteInput
): Promise<Quote> => {
  const quotes = await getQuotes();
  const now = new Date().toISOString();

  const quote: Quote = normaliseQuote({
    ...input,
    id: createId(),
    userId: input.userId || "guest",
    createdAt: now,
    updatedAt: now,
    synced: false,
  });

  await saveAllQuotes([quote, ...quotes]);
  return quote;
};

export const updateQuote = async (
  id: string,
  updates: UpdateQuoteInput
): Promise<Quote> => {
  const quotes = await getQuotes();
  const index = quotes.findIndex(
    (quote) => quote.id === id || quote.cloudId === id
  );

  if (index < 0) {
    throw new Error("Quote not found.");
  }

  const updatedQuote = normaliseQuote({
    ...quotes[index],
    ...updates,
    id: quotes[index].id,
    cloudId: quotes[index].cloudId,
    createdAt: quotes[index].createdAt,
    updatedAt: new Date().toISOString(),
    synced: false,
    syncedAt: undefined,
  });

  const nextQuotes = [...quotes];
  nextQuotes[index] = updatedQuote;
  await saveAllQuotes(nextQuotes);

  return updatedQuote;
};

export const updateQuoteStatus = async (
  id: string,
  status: QuoteStatus
): Promise<Quote> => updateQuote(id, { status });

export const markQuoteConverted = async (
  id: string,
  invoiceId: string
): Promise<Quote> =>
  updateQuote(id, {
    status: "converted",
    convertedInvoiceId: invoiceId,
    convertedAt: new Date().toISOString(),
  });

export const markQuoteSynced = async (
  id: string,
  cloudId: string,
  syncedAt = new Date().toISOString()
): Promise<void> => {
  const quotes = await getQuotes();

  await saveAllQuotes(
    quotes.map((quote) =>
      quote.id === id
        ? {
            ...quote,
            cloudId,
            synced: true,
            syncedAt,
          }
        : quote
    )
  );
};

export const replaceQuotesForUser = async (
  userId: string,
  cloudQuotes: Quote[]
): Promise<void> => {
  const localQuotes = await getQuotes();

  const otherUsers = localQuotes.filter(
    (quote) =>
      quote.userId !== userId && quote.userId !== "guest"
  );

  const localUnsynced = localQuotes.filter(
    (quote) =>
      (quote.userId === userId || quote.userId === "guest") &&
      !quote.synced
  );

  const cloudLocalIds = new Set(
    cloudQuotes.map((quote) => quote.id)
  );

  const preservedUnsynced = localUnsynced.filter(
    (quote) => !cloudLocalIds.has(quote.id)
  );

  await saveAllQuotes([
    ...otherUsers,
    ...preservedUnsynced,
    ...cloudQuotes,
  ]);
};

export const deleteQuote = async (id: string): Promise<void> => {
  const quotes = await getQuotes();
  await saveAllQuotes(
    quotes.filter(
      (quote) => quote.id !== id && quote.cloudId !== id
    )
  );
};
