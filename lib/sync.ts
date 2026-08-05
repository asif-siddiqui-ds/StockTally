// lib/sync.ts

import { database, ID, Query, storage } from "@/appwrite";
import * as FileSystem from "expo-file-system/legacy";

import { syncCustomers } from "@/lib/appwriteCustomerService";
import { syncInvoices } from "@/lib/appwriteInvoiceService";
import { syncQuotes } from "@/lib/appwriteQuoteService";
import { syncSuppliers } from "@/lib/appwriteSupplierService";
import { syncSupplierStockIn } from "@/lib/appwriteSupplierStockInService";

import { getLocal, setLocal } from "@/lib/storage";

const DATABASE_ID =
  process.env.EXPO_PUBLIC_DATABASE_ID ||
  "68215d2a00260d43fd49";

const STOCK_COLLECTION_ID =
  process.env.EXPO_PUBLIC_STOCK_COLLECTION_ID ||
  "68215de900192d30006e";

const SALE_COLLECTION_ID =
  process.env.EXPO_PUBLIC_SALE_COLLECTION_ID ||
  "68215e09000dab34a3e5";

const RETURN_COLLECTION_ID =
  process.env.EXPO_PUBLIC_RETURN_COLLECTION_ID ||
  "returns";

const COMPANY_COLLECTION_ID =
  process.env.EXPO_PUBLIC_COMPANY_COLLECTION_ID ||
  "companyprofile";

const STOCK_MOVEMENT_COLLECTION_ID =
  process.env.EXPO_PUBLIC_STOCK_MOVEMENT_COLLECTION_ID ||
  "stockmovement";

const LOGO_BUCKET_ID =
  process.env.EXPO_PUBLIC_LOGO_BUCKET_ID ||
  "68215d59001c82087763";

const APPWRITE_PROJECT_ID =
  process.env.EXPO_PUBLIC_PROJECT_ID ||
  "68215c9f00161f204345";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type SyncModuleName =
  | "companyProfile"
  | "stock"
  | "stockMovements"
  | "customers"
  | "suppliers"
  | "supplierStockIn"
  | "invoices"
  | "quotes"
  | "sales"
  | "returns";

export interface SyncModuleResult {
  module: SyncModuleName;
  success: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  result?: unknown;
  error?: string;
}

export interface FullSyncResult {
  success: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  completed: number;
  failed: number;
  modules: SyncModuleResult[];
}

export type SyncProgressCallback = (
  completed: number,
  total: number,
  currentModule: SyncModuleName,
  result?: SyncModuleResult
) => void;

type LegacySyncConfig = {
  module: SyncModuleName;
  collectionId: string;
  storageKey: string;
  orderField?: string;
};

type SyncTask = {
  name: SyncModuleName;
  run: () => Promise<unknown>;
};

/* -------------------------------------------------------------------------- */
/*                                UTILITIES                                   */
/* -------------------------------------------------------------------------- */

function nowISO(): string {
  return new Date().toISOString();
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function normaliseDate(value?: string | null): string {
  if (!value) return nowISO();

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.toISOString();
  }

  const parts = value.split("/");

  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    const parsed = new Date(year, month - 1, day);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return nowISO();
}

function stripAppwriteMetadata(
  item: Record<string, any>
): Record<string, any> {
  const {
    id,
    cloudId,
    logoLocal,
    $id,
    $createdAt,
    $updatedAt,
    $permissions,
    $databaseId,
    $collectionId,
    ...data
  } = item;

  return data;
}

function getLogoPreviewUrl(fileId?: string): string | null {
  if (!fileId) return null;

  return String(
    storage.getFilePreview(
      LOGO_BUCKET_ID,
      fileId
    )
  );
}

/* -------------------------------------------------------------------------- */
/*                              LOGO UPLOAD                                   */
/* -------------------------------------------------------------------------- */

async function uploadCompanyLogo(
  logoLocal?: string,
  currentCloudLogo?: string
): Promise<string | undefined> {
  if (!logoLocal) return currentCloudLogo;

  try {
    const fileInfo =
      await FileSystem.getInfoAsync(logoLocal);

    if (!fileInfo.exists) {
      return currentCloudLogo;
    }

    const fileId = ID.unique();

    const response = await FileSystem.uploadAsync(
      `${storage.client.config.endpoint}/storage/buckets/${LOGO_BUCKET_ID}/files`,
      logoLocal,
      {
        httpMethod: "POST",
        uploadType:
          FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "file",
        parameters: { fileId },
        headers: {
          "X-Appwrite-Project": APPWRITE_PROJECT_ID,
        },
      }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `Logo upload returned status ${response.status}`
      );
    }

    const parsed = JSON.parse(response.body);

    return (
      parsed.$id ||
      parsed.$fileId ||
      currentCloudLogo
    );
  } catch (error) {
    console.warn("⚠️ Company logo upload failed:", error);
    return currentCloudLogo;
  }
}

/* -------------------------------------------------------------------------- */
/*                       LEGACY GENERIC UPLOAD                                */
/* -------------------------------------------------------------------------- */

export async function uploadUnsynced(
  arr: any[],
  collectionId: string,
  storageKey: string,
  userId: string
): Promise<{
  uploaded: number;
  failed: number;
}> {
  const updatedItems: any[] = [];
  let uploaded = 0;
  let failed = 0;

  for (const item of arr || []) {
    const belongsToCurrentUser =
      !item.userId ||
      item.userId === "guest" ||
      item.userId === userId;

    if (!belongsToCurrentUser) {
      updatedItems.push(item);
      continue;
    }

    const requiresUpload =
      item.userId === "guest" ||
      !item.userId ||
      !item.synced;

    if (!requiresUpload) {
      updatedItems.push(item);
      continue;
    }

    try {
      const data = stripAppwriteMetadata(item);

      let logoCloud = data.logoCloud;

      if (collectionId === COMPANY_COLLECTION_ID) {
        logoCloud = await uploadCompanyLogo(
          item.logoLocal,
          data.logoCloud
        );
      }

      if (data.date) {
        data.date = normaliseDate(data.date);
      }

      if (data.dateTime) {
        data.dateTime = normaliseDate(data.dateTime);
      }

      if (data.createdAt) {
        data.createdAt = normaliseDate(
          data.createdAt
        );
      }

      if (data.updatedAt) {
        data.updatedAt = normaliseDate(
          data.updatedAt
        );
      }

      const syncedAt = nowISO();

      const created = await database.createDocument(
        DATABASE_ID,
        collectionId,
        ID.unique(),
        {
          ...data,
          logoCloud,
          userId,
          syncedAt,
          synced: true,
        }
      );

      updatedItems.push({
        ...item,

        // Keep the local ID stable so other local records
        // referencing it are not broken.
        id: item.id,

        cloudId: created.$id,
        userId,
        logoCloud,
        synced: true,
        syncedAt,

        // Preserve local display values.
        date: item.date,
        dateTime: item.dateTime,
      });

      uploaded += 1;
    } catch (error) {
      console.error(
        `❌ Upload failed (${collectionId})`,
        error
      );

      updatedItems.push({
        ...item,
        userId:
          item.userId === "guest" || !item.userId
            ? userId
            : item.userId,
        synced: false,
      });

      failed += 1;
    }
  }

  await setLocal(storageKey, updatedItems);

  return { uploaded, failed };
}

/* -------------------------------------------------------------------------- */
/*                      LEGACY GENERIC DOWNLOAD                               */
/* -------------------------------------------------------------------------- */

export async function downloadCloudData(
  collectionId: string,
  storageKey: string,
  userId: string,
  orderField = "$createdAt"
): Promise<{
  downloaded: number;
  preservedLocalUnsynced: number;
}> {
  const localData =
    (await getLocal<any>(storageKey)) || [];

  const response = await database.listDocuments(
    DATABASE_ID,
    collectionId,
    [
      Query.equal("userId", userId),
      Query.orderDesc(orderField),
      Query.limit(5000),
    ]
  );

  const cloudDocs = response.documents.map(
    (document) => {
      const localId =
        document.localId ||
        document.id ||
        document.$id;

      const mapped: any = {
        ...document,
        id: localId,
        cloudId: document.$id,
        userId,
        synced: true,
        syncedAt:
          document.syncedAt || nowISO(),
      };

      if (collectionId === COMPANY_COLLECTION_ID) {
        const logoCloud =
          document.logoCloud || null;

        const localMatch = localData.find(
          (localItem: any) =>
            localItem.id === localId ||
            localItem.cloudId === document.$id
        );

        mapped.logoCloud = logoCloud;
        mapped.logoLocal =
          localMatch?.logoLocal ||
          (logoCloud
            ? getLogoPreviewUrl(logoCloud)
            : null);
      }

      return mapped;
    }
  );

  const cloudLocalIds = new Set(
    cloudDocs.map((item) => item.id)
  );

  const cloudIds = new Set(
    cloudDocs
      .map((item) => item.cloudId)
      .filter(Boolean)
  );

  const localUnsynced = localData.filter(
    (localItem: any) =>
      (!localItem.userId ||
        localItem.userId === userId ||
        localItem.userId === "guest") &&
      !localItem.synced
  );

  const preservedLocalUnsynced =
    localUnsynced.filter(
      (localItem: any) =>
        !cloudLocalIds.has(localItem.id) &&
        !cloudIds.has(localItem.cloudId)
    );

  const otherUsers = localData.filter(
    (localItem: any) =>
      localItem.userId &&
      localItem.userId !== userId &&
      localItem.userId !== "guest"
  );

  await setLocal(storageKey, [
    ...otherUsers,
    ...preservedLocalUnsynced,
    ...cloudDocs,
  ]);

  return {
    downloaded: cloudDocs.length,
    preservedLocalUnsynced:
      preservedLocalUnsynced.length,
  };
}

/* -------------------------------------------------------------------------- */
/*                        LEGACY MODULE WRAPPER                               */
/* -------------------------------------------------------------------------- */

async function syncLegacyModule(
  config: LegacySyncConfig,
  userId: string
): Promise<{
  upload: {
    uploaded: number;
    failed: number;
  };
  download: {
    downloaded: number;
    preservedLocalUnsynced: number;
  };
}> {
  const local =
    (await getLocal<any>(config.storageKey)) || [];

  const upload = await uploadUnsynced(
    local,
    config.collectionId,
    config.storageKey,
    userId
  );

  const download = await downloadCloudData(
    config.collectionId,
    config.storageKey,
    userId,
    config.orderField
  );

  return { upload, download };
}

/* -------------------------------------------------------------------------- */
/*                           MODULE-SPECIFIC TASKS                             */
/* -------------------------------------------------------------------------- */

async function syncCompanyProfile(
  userId: string
) {
  return syncLegacyModule(
    {
      module: "companyProfile",
      collectionId: COMPANY_COLLECTION_ID,
      storageKey: "companyprofile",
    },
    userId
  );
}

async function syncStock(userId: string) {
  return syncLegacyModule(
    {
      module: "stock",
      collectionId: STOCK_COLLECTION_ID,
      storageKey: "stock",
    },
    userId
  );
}

async function syncStockMovements(
  userId: string
) {
  return syncLegacyModule(
    {
      module: "stockMovements",
      collectionId:
        STOCK_MOVEMENT_COLLECTION_ID,
      storageKey: "stockMovements",
      orderField: "dateTime",
    },
    userId
  );
}

async function syncSales(userId: string) {
  return syncLegacyModule(
    {
      module: "sales",
      collectionId: SALE_COLLECTION_ID,
      storageKey: "sales",
    },
    userId
  );
}

async function syncReturns(userId: string) {
  return syncLegacyModule(
    {
      module: "returns",
      collectionId: RETURN_COLLECTION_ID,
      storageKey: "returns",
    },
    userId
  );
}

/* -------------------------------------------------------------------------- */
/*                              TASK RUNNER                                   */
/* -------------------------------------------------------------------------- */

async function runSyncTask(
  task: SyncTask
): Promise<SyncModuleResult> {
  const startedAt = nowISO();
  const startedMs = Date.now();

  console.log(`🔄 Syncing ${task.name}...`);

  try {
    const result = await task.run();
    const finishedAt = nowISO();

    console.log(`✅ ${task.name} sync complete`);

    return {
      module: task.name,
      success: true,
      startedAt,
      finishedAt,
      durationMs: Date.now() - startedMs,
      result,
    };
  } catch (error) {
    const finishedAt = nowISO();
    const message = errorMessage(error);

    console.error(
      `❌ ${task.name} sync failed:`,
      error
    );

    return {
      module: task.name,
      success: false,
      startedAt,
      finishedAt,
      durationMs: Date.now() - startedMs,
      error: message,
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                            FULL SYNC MANAGER                               */
/* -------------------------------------------------------------------------- */

export async function syncAllData(
  userId: string,
  onProgress?: SyncProgressCallback
): Promise<FullSyncResult> {
  if (!userId || userId === "guest") {
    throw new Error(
      "A valid signed-in user ID is required for cloud sync."
    );
  }

  const startedAt = nowISO();
  const startedMs = Date.now();

  console.log("🔄 Starting StockTally full sync...");

  /*
   * Order matters:
   *
   * 1. Company profile supplies business defaults.
   * 2. Stock must exist before stock movements.
   * 3. Customers and suppliers must exist before
   *    invoices, quotes and supplier purchases.
   * 4. Supplier stock-in depends on stock and suppliers.
   * 5. Invoices and quotes may reference customers.
   * 6. Sales and returns run last because they may
   *    reference stock and customer records.
   */
  const tasks: SyncTask[] = [
    {
      name: "companyProfile",
      run: () => syncCompanyProfile(userId),
    },
    {
      name: "stock",
      run: () => syncStock(userId),
    },
    {
      name: "stockMovements",
      run: () => syncStockMovements(userId),
    },
    {
      name: "customers",
      run: () => syncCustomers(userId),
    },
    {
      name: "suppliers",
      run: () => syncSuppliers(userId),
    },
    {
      name: "supplierStockIn",
      run: () => syncSupplierStockIn(userId),
    },
    {
      name: "invoices",
      run: () => syncInvoices(userId),
    },
    {
      name: "quotes",
      run: () => syncQuotes(userId),
    },
    {
      name: "sales",
      run: () => syncSales(userId),
    },
    {
      name: "returns",
      run: () => syncReturns(userId),
    },
  ];

  const modules: SyncModuleResult[] = [];

  for (let index = 0; index < tasks.length; index += 1) {
    const task = tasks[index];
    const result = await runSyncTask(task);

    modules.push(result);

    onProgress?.(
      index + 1,
      tasks.length,
      task.name,
      result
    );
  }

  const failed = modules.filter(
    (module) => !module.success
  ).length;

  const finishedAt = nowISO();

  const summary: FullSyncResult = {
    success: failed === 0,
    startedAt,
    finishedAt,
    durationMs: Date.now() - startedMs,
    completed: modules.length - failed,
    failed,
    modules,
  };

  if (failed === 0) {
    console.log("✅ StockTally full sync complete");
  } else {
    console.warn(
      `⚠️ StockTally sync finished with ${failed} failed module(s)`
    );
  }

  return summary;
}

/* -------------------------------------------------------------------------- */
/*                         TARGETED MODULE SYNC                               */
/* -------------------------------------------------------------------------- */

export async function syncSelectedModules(
  userId: string,
  moduleNames: SyncModuleName[],
  onProgress?: SyncProgressCallback
): Promise<FullSyncResult> {
  if (!userId || userId === "guest") {
    throw new Error(
      "A valid signed-in user ID is required for cloud sync."
    );
  }

  const availableTasks: Record<
    SyncModuleName,
    () => Promise<unknown>
  > = {
    companyProfile: () =>
      syncCompanyProfile(userId),
    stock: () => syncStock(userId),
    stockMovements: () =>
      syncStockMovements(userId),
    customers: () => syncCustomers(userId),
    suppliers: () => syncSuppliers(userId),
    supplierStockIn: () =>
      syncSupplierStockIn(userId),
    invoices: () => syncInvoices(userId),
    quotes: () => syncQuotes(userId),
    sales: () => syncSales(userId),
    returns: () => syncReturns(userId),
  };

  const uniqueModules = [
    ...new Set(moduleNames),
  ];

  const tasks: SyncTask[] = uniqueModules.map(
    (name) => ({
      name,
      run: availableTasks[name],
    })
  );

  const startedAt = nowISO();
  const startedMs = Date.now();
  const modules: SyncModuleResult[] = [];

  for (let index = 0; index < tasks.length; index += 1) {
    const task = tasks[index];
    const result = await runSyncTask(task);

    modules.push(result);

    onProgress?.(
      index + 1,
      tasks.length,
      task.name,
      result
    );
  }

  const failed = modules.filter(
    (module) => !module.success
  ).length;

  return {
    success: failed === 0,
    startedAt,
    finishedAt: nowISO(),
    durationMs: Date.now() - startedMs,
    completed: modules.length - failed,
    failed,
    modules,
  };
}
