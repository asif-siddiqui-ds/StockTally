// lib/appwriteSupplierStockInService.ts

import { database } from "@/appwrite";
import {
  getSupplierStockInRecords,
  markSupplierStockInSynced,
  replaceSupplierStockInForUser,
  saveAllSupplierStockInRecords,
} from "@/lib/supplierStockInStorage";
import type {
  SupplierPaymentStatus,
  SupplierStockIn,
} from "@/types/supplierStockIn";
import {
  ID,
  Permission,
  Query,
  Role,
} from "react-native-appwrite";

const DATABASE_ID =
  process.env.EXPO_PUBLIC_DATABASE_ID ||
  "68215d2a00260d43fd49";

const COLLECTION_ID =
  process.env
    .EXPO_PUBLIC_SUPPLIER_STOCK_IN_COLLECTION_ID ||
  "supplier_stock_in";

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

const paymentStatus = (
  value: unknown,
): SupplierPaymentStatus =>
  value === "paid" ? "paid" : "unpaid";

export function supplierStockInToDocument(
  record: SupplierStockIn,
  userId: string,
): Record<string, unknown> {
  return {
    localId: record.id,
    userId,
    stockItemId: record.stockItemId,
    itemName: record.itemName,
    supplierId: optional(record.supplierId),
    supplierName: optional(record.supplierName),
    quantity: safeNumber(record.quantity),
    unit: optional(record.unit),
    unitCost: safeNumber(record.unitCost),
    totalCost: safeNumber(record.totalCost),
    paymentStatus: record.paymentStatus,
    date: record.date,
    paidAt: optional(record.paidAt),
    note: optional(record.note),
    createdAt:
      record.createdAt || record.date || nowISO(),
    updatedAt:
      record.updatedAt || record.date || nowISO(),
    syncedAt: nowISO(),
  };
}

export function documentToSupplierStockIn(
  document: Record<string, any>,
): SupplierStockIn {
  return {
    id: document.localId || document.$id,
    cloudId: document.$id,
    userId: document.userId || "guest",
    stockItemId: document.stockItemId || "",
    itemName: document.itemName || "",
    supplierId: document.supplierId || undefined,
    supplierName:
      document.supplierName || undefined,
    quantity: safeNumber(document.quantity),
    unit: document.unit || undefined,
    unitCost: safeNumber(document.unitCost),
    totalCost: safeNumber(document.totalCost),
    paymentStatus: paymentStatus(
      document.paymentStatus,
    ),
    date: document.date || document.$createdAt,
    paidAt: document.paidAt || undefined,
    note: document.note || undefined,
    createdAt:
      document.createdAt || document.$createdAt,
    updatedAt:
      document.updatedAt || document.$updatedAt,
    synced: true,
    syncedAt: document.syncedAt || nowISO(),
  };
}

async function findDocument(
  record: Pick<
    SupplierStockIn,
    "id" | "cloudId"
  >,
  userId: string,
): Promise<Record<string, any> | null> {
  if (record.cloudId) {
    try {
      return await database.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        record.cloudId,
      );
    } catch {
      // Continue with localId lookup.
    }
  }

  const response = await database.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    [
      Query.equal("localId", record.id),
      Query.equal("userId", userId),
      Query.limit(1),
    ],
  );

  return response.documents[0] || null;
}

export async function upsertSupplierStockInToCloud(
  record: SupplierStockIn,
  userId: string,
): Promise<SupplierStockIn> {
  const existing = await findDocument(record, userId);
  const payload = supplierStockInToDocument(
    {
      ...record,
      userId,
    },
    userId,
  );

  const document = existing?.$id
    ? await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existing.$id,
        payload,
      )
    : await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        payload,
        permissions(userId),
      );

  return {
    ...record,
    cloudId: document.$id,
    userId,
    synced: true,
    syncedAt: document.syncedAt || nowISO(),
  };
}

export interface SupplierStockInUploadResult {
  uploaded: number;
  failed: number;
  failures: Array<{
    recordId: string;
    itemName: string;
    message: string;
  }>;
}

export async function uploadUnsyncedSupplierStockIn(
  userId: string,
): Promise<SupplierStockInUploadResult> {
  const all = await getSupplierStockInRecords();
  const next: SupplierStockIn[] = [];
  const failures: SupplierStockInUploadResult["failures"] =
    [];
  let uploaded = 0;

  for (const record of all) {
    const belongs =
      record.userId === userId ||
      record.userId === "guest" ||
      !record.userId;

    if (!belongs) {
      next.push(record);
      continue;
    }

    if (
      record.synced &&
      record.userId === userId &&
      record.cloudId
    ) {
      next.push(record);
      continue;
    }

    try {
      next.push(
        await upsertSupplierStockInToCloud(
          {
            ...record,
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
          : "Unknown supplier stock-in sync error";

      next.push({
        ...record,
        userId,
        synced: false,
        syncedAt: undefined,
      });

      failures.push({
        recordId: record.id,
        itemName: record.itemName || "Unnamed item",
        message,
      });
    }
  }

  await saveAllSupplierStockInRecords(next);

  return {
    uploaded,
    failed: failures.length,
    failures,
  };
}

export interface SupplierStockInDownloadResult {
  downloaded: number;
  preservedLocalUnsynced: number;
}

export async function downloadCloudSupplierStockIn(
  userId: string,
): Promise<SupplierStockInDownloadResult> {
  const local = await getSupplierStockInRecords();

  const response = await database.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.orderDesc("updatedAt"),
      Query.limit(5000),
    ],
  );

  const cloud = response.documents.map(
    documentToSupplierStockIn,
  );

  const preservedLocalUnsynced = local.filter(
    (record) =>
      (!record.userId ||
        record.userId === userId ||
        record.userId === "guest") &&
      !record.synced,
  ).length;

  await replaceSupplierStockInForUser(
    userId,
    cloud,
  );

  return {
    downloaded: cloud.length,
    preservedLocalUnsynced,
  };
}

export async function syncSupplierStockIn(
  userId: string,
) {
  const upload =
    await uploadUnsyncedSupplierStockIn(userId);
  const download =
    await downloadCloudSupplierStockIn(userId);

  return { upload, download };
}

export async function syncSupplierStockInById(
  recordId: string,
  userId: string,
): Promise<SupplierStockIn | null> {
  const record = (
    await getSupplierStockInRecords()
  ).find(
    (item) =>
      item.id === recordId ||
      item.cloudId === recordId,
  );

  if (!record) return null;

  const synced =
    await upsertSupplierStockInToCloud(
      {
        ...record,
        userId,
        synced: false,
      },
      userId,
    );

  await markSupplierStockInSynced(
    record.id,
    synced.cloudId!,
    synced.syncedAt,
  );

  return synced;
}

export async function deleteSupplierStockInFromCloud(
  record: Pick<
    SupplierStockIn,
    "id" | "cloudId"
  >,
  userId: string,
): Promise<void> {
  const existing = await findDocument(record, userId);

  if (!existing?.$id) return;

  await database.deleteDocument(
    DATABASE_ID,
    COLLECTION_ID,
    existing.$id,
  );
}
