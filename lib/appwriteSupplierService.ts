// lib/appwriteSupplierService.ts

import { database } from "@/appwrite";
import {
  getSuppliers,
  markSupplierSynced,
  replaceSuppliersForUser,
  saveAllSuppliers,
} from "@/lib/supplierStorage";
import type {
  Supplier,
  SupplierPaymentTerms,
  SupplierType,
} from "@/types/supplier";
import {
  ID,
  Permission,
  Query,
  Role,
} from "react-native-appwrite";

const DATABASE_ID =
  process.env.EXPO_PUBLIC_DATABASE_ID ||
  "68215d2a00260d43fd49";

const SUPPLIERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_SUPPLIERS_COLLECTION_ID ||
  "suppliers";

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

const safeBoolean = (
  value: unknown,
  fallback = false,
): boolean => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const supplierType = (value: unknown): SupplierType =>
  value === "individual" ? "individual" : "business";

const paymentTerms = (
  value: unknown,
): SupplierPaymentTerms => {
  const allowed: SupplierPaymentTerms[] = [
    "due_on_receipt",
    "net_7",
    "net_14",
    "net_30",
    "net_45",
    "net_60",
    "custom",
  ];

  return allowed.includes(value as SupplierPaymentTerms)
    ? (value as SupplierPaymentTerms)
    : "net_30";
};

export function supplierToDocument(
  supplier: Supplier,
  userId: string,
): Record<string, unknown> {
  return {
    localId: supplier.id,
    userId,
    type: supplier.type || "business",
    companyName: optional(supplier.companyName),
    contactName: supplier.contactName || "",
    email: optional(supplier.email),
    phone: optional(supplier.phone),
    website: optional(supplier.website),
    addressLine1: optional(supplier.addressLine1),
    addressLine2: optional(supplier.addressLine2),
    city: optional(supplier.city),
    county: optional(supplier.county),
    postcode: optional(supplier.postcode),
    country: optional(supplier.country),
    taxNumber: optional(supplier.taxNumber),
    currencyCode: supplier.currencyCode || "GBP",
    currencySymbol: supplier.currencySymbol || "£",
    locale: supplier.locale || "en-GB",
    paymentTerms: supplier.paymentTerms || "net_30",
    customPaymentTermDays:
      supplier.paymentTerms === "custom"
        ? Math.max(
            0,
            Math.round(
              supplier.customPaymentTermDays || 0,
            ),
          )
        : null,
    openingBalance: safeNumber(
      supplier.openingBalance,
      0,
    ),
    creditLimit: safeNumber(supplier.creditLimit, 0),
    notes: optional(supplier.notes),
    supplierCode: optional(supplier.supplierCode),
    isActive: supplier.isActive !== false,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
    syncedAt: nowISO(),
  };
}

export function documentToSupplier(
  document: Record<string, any>,
): Supplier {
  const terms = paymentTerms(document.paymentTerms);

  return {
    id: document.localId || document.$id,
    cloudId: document.$id,
    userId: document.userId || "guest",
    type: supplierType(document.type),
    companyName: document.companyName || undefined,
    contactName: document.contactName || "",
    email: document.email || undefined,
    phone: document.phone || undefined,
    website: document.website || undefined,
    addressLine1: document.addressLine1 || undefined,
    addressLine2: document.addressLine2 || undefined,
    city: document.city || undefined,
    county: document.county || undefined,
    postcode: document.postcode || undefined,
    country: document.country || undefined,
    taxNumber: document.taxNumber || undefined,
    currencyCode: document.currencyCode || "GBP",
    currencySymbol: document.currencySymbol || "£",
    locale: document.locale || "en-GB",
    paymentTerms: terms,
    customPaymentTermDays:
      terms === "custom"
        ? Math.max(
            0,
            Math.round(
              safeNumber(
                document.customPaymentTermDays,
                0,
              ),
            ),
          )
        : undefined,
    openingBalance: safeNumber(
      document.openingBalance,
      0,
    ),
    creditLimit: safeNumber(document.creditLimit, 0),
    notes: document.notes || undefined,
    supplierCode: document.supplierCode || undefined,
    isActive: safeBoolean(document.isActive, true),
    createdAt:
      document.createdAt || document.$createdAt,
    updatedAt:
      document.updatedAt || document.$updatedAt,
    synced: true,
    syncedAt: document.syncedAt || nowISO(),
  };
}

async function findDocument(
  supplier: Pick<Supplier, "id" | "cloudId">,
  userId: string,
): Promise<Record<string, any> | null> {
  if (supplier.cloudId) {
    try {
      return await database.getDocument(
        DATABASE_ID,
        SUPPLIERS_COLLECTION_ID,
        supplier.cloudId,
      );
    } catch {
      // Continue with localId lookup.
    }
  }

  const response = await database.listDocuments(
    DATABASE_ID,
    SUPPLIERS_COLLECTION_ID,
    [
      Query.equal("localId", supplier.id),
      Query.equal("userId", userId),
      Query.limit(1),
    ],
  );

  return response.documents[0] || null;
}

export async function upsertSupplierToCloud(
  supplier: Supplier,
  userId: string,
): Promise<Supplier> {
  const existing = await findDocument(
    supplier,
    userId,
  );

  const payload = supplierToDocument(
    {
      ...supplier,
      userId,
    },
    userId,
  );

  const document = existing?.$id
    ? await database.updateDocument(
        DATABASE_ID,
        SUPPLIERS_COLLECTION_ID,
        existing.$id,
        payload,
      )
    : await database.createDocument(
        DATABASE_ID,
        SUPPLIERS_COLLECTION_ID,
        ID.unique(),
        payload,
        permissions(userId),
      );

  return {
    ...supplier,
    cloudId: document.$id,
    userId,
    synced: true,
    syncedAt: document.syncedAt || nowISO(),
  };
}

export interface SupplierUploadResult {
  uploaded: number;
  failed: number;
  failures: Array<{
    supplierId: string;
    supplierName: string;
    message: string;
  }>;
}

export async function uploadUnsyncedSuppliers(
  userId: string,
): Promise<SupplierUploadResult> {
  const all = await getSuppliers();
  const next: Supplier[] = [];
  const failures: SupplierUploadResult["failures"] =
    [];
  let uploaded = 0;

  for (const supplier of all) {
    const belongs =
      supplier.userId === userId ||
      supplier.userId === "guest" ||
      !supplier.userId;

    if (!belongs) {
      next.push(supplier);
      continue;
    }

    if (
      supplier.synced &&
      supplier.userId === userId &&
      supplier.cloudId
    ) {
      next.push(supplier);
      continue;
    }

    try {
      next.push(
        await upsertSupplierToCloud(
          {
            ...supplier,
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
          : "Unknown supplier sync error";

      next.push({
        ...supplier,
        userId,
        synced: false,
        syncedAt: undefined,
      });

      failures.push({
        supplierId: supplier.id,
        supplierName:
          supplier.companyName ||
          supplier.contactName ||
          "Unnamed supplier",
        message,
      });
    }
  }

  await saveAllSuppliers(next);

  return {
    uploaded,
    failed: failures.length,
    failures,
  };
}

export interface SupplierDownloadResult {
  downloaded: number;
  preservedLocalUnsynced: number;
}

export async function downloadCloudSuppliers(
  userId: string,
): Promise<SupplierDownloadResult> {
  const local = await getSuppliers();

  const response = await database.listDocuments(
    DATABASE_ID,
    SUPPLIERS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.orderDesc("updatedAt"),
      Query.limit(5000),
    ],
  );

  const cloud = response.documents.map(
    documentToSupplier,
  );

  const preservedLocalUnsynced = local.filter(
    (supplier) =>
      (supplier.userId === userId ||
        supplier.userId === "guest") &&
      !supplier.synced,
  ).length;

  await replaceSuppliersForUser(userId, cloud);

  return {
    downloaded: cloud.length,
    preservedLocalUnsynced,
  };
}

export async function syncSuppliers(userId: string) {
  const upload = await uploadUnsyncedSuppliers(userId);
  const download =
    await downloadCloudSuppliers(userId);

  return { upload, download };
}

export async function syncSupplierById(
  supplierId: string,
  userId: string,
): Promise<Supplier | null> {
  const supplier = (await getSuppliers()).find(
    (item) =>
      item.id === supplierId ||
      item.cloudId === supplierId,
  );

  if (!supplier) return null;

  const synced = await upsertSupplierToCloud(
    {
      ...supplier,
      userId,
      synced: false,
    },
    userId,
  );

  await markSupplierSynced(
    supplier.id,
    synced.cloudId!,
    synced.syncedAt,
  );

  return synced;
}

export async function deleteSupplierFromCloud(
  supplier: Pick<Supplier, "id" | "cloudId">,
  userId: string,
): Promise<void> {
  const existing = await findDocument(
    supplier,
    userId,
  );

  if (!existing?.$id) return;

  await database.deleteDocument(
    DATABASE_ID,
    SUPPLIERS_COLLECTION_ID,
    existing.$id,
  );
}
