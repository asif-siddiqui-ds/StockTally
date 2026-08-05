// lib/appwriteQuoteService.ts

import { database } from "@/appwrite";
import {
  getQuotes,
  markQuoteSynced,
  replaceQuotesForUser,
  saveAllQuotes,
} from "@/lib/quoteStorage";
import type {
  Quote,
  QuoteItem,
  QuoteStatus,
} from "@/types/quote";
import {
  ID,
  Permission,
  Query,
  Role,
} from "react-native-appwrite";

const DATABASE_ID =
  process.env.EXPO_PUBLIC_DATABASE_ID ||
  "68215d2a00260d43fd49";

const QUOTES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_QUOTES_COLLECTION_ID ||
  "quotes";

const nowISO = (): string => new Date().toISOString();

const permissions = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

const optional = (
  value?: string | null,
): string | null => {
  const cleaned = String(value ?? "").trim();
  return cleaned || null;
};

const safeNumber = (
  value: unknown,
  fallback = 0,
): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normaliseStatus = (
  value: unknown,
): QuoteStatus => {
  const allowed: QuoteStatus[] = [
    "draft",
    "sent",
    "accepted",
    "rejected",
    "expired",
    "converted",
    "cancelled",
  ];

  return allowed.includes(value as QuoteStatus)
    ? (value as QuoteStatus)
    : "draft";
};

const parseItems = (value: unknown): QuoteItem[] => {
  if (Array.isArray(value)) return value as QuoteItem[];

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? (parsed as QuoteItem[])
      : [];
  } catch {
    return [];
  }
};

export function quoteToDocument(
  quote: Quote,
  userId: string,
): Record<string, unknown> {
  return {
    localId: quote.id,
    userId,
    quoteNumber: quote.quoteNumber,
    reference: optional(quote.reference),
    status: quote.status,
    quoteDate: quote.quoteDate,
    expiryDate: optional(quote.expiryDate),
    customerId: optional(quote.customerId),
    customerName: quote.customerName || "",
    customerCompany: optional(
      quote.customerCompany,
    ),
    customerEmail: optional(quote.customerEmail),
    customerPhone: optional(quote.customerPhone),
    customerAddress: optional(
      quote.customerAddress,
    ),
    notes: optional(quote.notes),
    terms: optional(quote.terms),
    currencyCode: quote.currencyCode || "GBP",
    currencySymbol: quote.currencySymbol || "£",
    locale: quote.locale || "en-GB",
    subtotal: safeNumber(quote.subtotal),
    discountTotal: safeNumber(
      quote.discountTotal,
    ),
    taxTotal: safeNumber(quote.taxTotal),
    grandTotal: safeNumber(quote.grandTotal),
    itemsJson: JSON.stringify(quote.items || []),
    convertedInvoiceId: optional(
      quote.convertedInvoiceId,
    ),
    convertedAt: optional(quote.convertedAt),
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    syncedAt: nowISO(),
  };
}

export function documentToQuote(
  document: Record<string, any>,
): Quote {
  return {
    id: document.localId || document.$id,
    cloudId: document.$id,
    userId: document.userId || "guest",
    quoteNumber: document.quoteNumber || "",
    reference: document.reference || undefined,
    status: normaliseStatus(document.status),
    quoteDate:
      document.quoteDate || document.$createdAt,
    expiryDate: document.expiryDate || undefined,
    customerId: document.customerId || undefined,
    customerName: document.customerName || "",
    customerCompany:
      document.customerCompany || undefined,
    customerEmail: document.customerEmail || undefined,
    customerPhone: document.customerPhone || undefined,
    customerAddress:
      document.customerAddress || undefined,
    notes: document.notes || undefined,
    terms: document.terms || undefined,
    currencyCode: document.currencyCode || "GBP",
    currencySymbol: document.currencySymbol || "£",
    locale: document.locale || "en-GB",
    subtotal: safeNumber(document.subtotal),
    discountTotal: safeNumber(
      document.discountTotal,
    ),
    taxTotal: safeNumber(document.taxTotal),
    grandTotal: safeNumber(document.grandTotal),
    items: parseItems(
      document.itemsJson ?? document.items,
    ),
    convertedInvoiceId:
      document.convertedInvoiceId || undefined,
    convertedAt: document.convertedAt || undefined,
    createdAt:
      document.createdAt || document.$createdAt,
    updatedAt:
      document.updatedAt || document.$updatedAt,
    synced: true,
    syncedAt: document.syncedAt || nowISO(),
  };
}

async function findDocument(
  quote: Pick<Quote, "id" | "cloudId">,
  userId: string,
): Promise<Record<string, any> | null> {
  if (quote.cloudId) {
    try {
      return await database.getDocument(
        DATABASE_ID,
        QUOTES_COLLECTION_ID,
        quote.cloudId,
      );
    } catch {
      // Continue with localId lookup.
    }
  }

  const response = await database.listDocuments(
    DATABASE_ID,
    QUOTES_COLLECTION_ID,
    [
      Query.equal("localId", quote.id),
      Query.equal("userId", userId),
      Query.limit(1),
    ],
  );

  return response.documents[0] || null;
}

export async function upsertQuoteToCloud(
  quote: Quote,
  userId: string,
): Promise<Quote> {
  const existing = await findDocument(quote, userId);
  const payload = quoteToDocument(
    {
      ...quote,
      userId,
    },
    userId,
  );

  const document = existing?.$id
    ? await database.updateDocument(
        DATABASE_ID,
        QUOTES_COLLECTION_ID,
        existing.$id,
        payload,
      )
    : await database.createDocument(
        DATABASE_ID,
        QUOTES_COLLECTION_ID,
        ID.unique(),
        payload,
        permissions(userId),
      );

  return {
    ...quote,
    cloudId: document.$id,
    userId,
    synced: true,
    syncedAt: document.syncedAt || nowISO(),
  };
}

export interface QuoteUploadResult {
  uploaded: number;
  failed: number;
  failures: Array<{
    quoteId: string;
    quoteNumber: string;
    message: string;
  }>;
}

export async function uploadUnsyncedQuotes(
  userId: string,
): Promise<QuoteUploadResult> {
  const all = await getQuotes();
  const next: Quote[] = [];
  const failures: QuoteUploadResult["failures"] =
    [];
  let uploaded = 0;

  for (const quote of all) {
    const belongs =
      quote.userId === userId ||
      quote.userId === "guest" ||
      !quote.userId;

    if (!belongs) {
      next.push(quote);
      continue;
    }

    if (
      quote.synced &&
      quote.userId === userId &&
      quote.cloudId
    ) {
      next.push(quote);
      continue;
    }

    try {
      next.push(
        await upsertQuoteToCloud(
          {
            ...quote,
            userId,
            synced: false,
          },
          userId,
        ),
      );
      uploaded += 1;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown quote sync error";

      next.push({
        ...quote,
        userId,
        synced: false,
        syncedAt: undefined,
      });

      failures.push({
        quoteId: quote.id,
        quoteNumber:
          quote.quoteNumber || "Unnumbered quote",
        message,
      });
    }
  }

  await saveAllQuotes(next);

  return {
    uploaded,
    failed: failures.length,
    failures,
  };
}

export interface QuoteDownloadResult {
  downloaded: number;
  preservedLocalUnsynced: number;
}

export async function downloadCloudQuotes(
  userId: string,
): Promise<QuoteDownloadResult> {
  const local = await getQuotes();

  const response = await database.listDocuments(
    DATABASE_ID,
    QUOTES_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.orderDesc("updatedAt"),
      Query.limit(5000),
    ],
  );

  const cloud = response.documents.map(documentToQuote);

  const preservedLocalUnsynced = local.filter(
    (quote) =>
      (quote.userId === userId ||
        quote.userId === "guest" ||
        !quote.userId) &&
      !quote.synced,
  ).length;

  await replaceQuotesForUser(userId, cloud);

  return {
    downloaded: cloud.length,
    preservedLocalUnsynced,
  };
}

export async function syncQuotes(userId: string) {
  const upload = await uploadUnsyncedQuotes(userId);
  const download = await downloadCloudQuotes(userId);

  return { upload, download };
}

export async function syncQuoteById(
  quoteId: string,
  userId: string,
): Promise<Quote | null> {
  const quote = (await getQuotes()).find(
    (item) =>
      item.id === quoteId ||
      item.cloudId === quoteId,
  );

  if (!quote) return null;

  const synced = await upsertQuoteToCloud(
    {
      ...quote,
      userId,
      synced: false,
    },
    userId,
  );

  await markQuoteSynced(
    quote.id,
    synced.cloudId!,
    synced.syncedAt,
  );

  return synced;
}

export async function deleteQuoteFromCloud(
  quote: Pick<Quote, "id" | "cloudId">,
  userId: string,
): Promise<void> {
  const existing = await findDocument(quote, userId);

  if (!existing?.$id) return;

  await database.deleteDocument(
    DATABASE_ID,
    QUOTES_COLLECTION_ID,
    existing.$id,
  );
}
