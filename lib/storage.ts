// lib/storage.ts
import { getCachedUserId } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  barcode?: string;
  unit?: string;
  costPrice?: number;
  lowStockAlert?: number;
  idealStockLevel?: number;
  supplierName?: string;
  paid?: boolean;
  date: string;
  userId: string;
  syncedAt: string;
  synced: boolean;
}

export interface SaleItem {
  id: string;
  salesId: string;
  batchId?: string;
  stockItemId: string;
  name: string;
  quantity: number;
  buyerName: string;
  price: number;
  date: string;
  userId: string;
  paid: boolean;
  type?: "bulk_sale" | "single_sale";
  syncedAt: string;
  synced: boolean;
}

export type ReturnStatus =
  | "back_to_stock"
  | "pending_return"
  | "returned_to_supplier"
  | "no_stock_change";

export interface ReturnItem {
  id: string;
  stockItemId: string;
  name: string;
  quantity: number;
  reason: string;
  date: string;
  status?: ReturnStatus;
  userId: string;
  syncedAt: string;
  synced: boolean;
}

export interface ReturnStockItem {
  id: string;
  stockItemId: string;
  returnItemId: string;
  name: string;
  category?: string;
  quantity: number;
  reason: string;
  supplierName?: string;
  date: string;
  userId: string;
  syncedAt: string;
  synced: boolean;
}


/* -------------------------------------------------------------------------- */
/*                              LOCAL STORAGE I/O                             */
/* -------------------------------------------------------------------------- */
export async function getLocal<T>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error(`❌ Failed to read local key ${key}`, err);
    return [];
  }
}

export async function setLocal<T>(key: string, value: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`❌ Failed to write local key ${key}`, err);
  }
}

/* -------------------------------------------------------------------------- */
/*                                STOCK ITEMS                                */
/* -------------------------------------------------------------------------- */
export async function getStockItems(): Promise<StockItem[]> {
  return await getLocal<StockItem>("stock");
}
export async function getStockItem(id: string): Promise<StockItem | null> {
    const all = await getLocal<StockItem>("stock");
    return all.find((s) => s.id === id) ?? null;
}

export async function saveStockItem(
  item: Omit<StockItem, "id" | "userId" | "date">
): Promise<StockItem> {
  const userId = (await getCachedUserId()) || "guest";
  const all = await getStockItems();
  const newItem: StockItem = {
    ...item,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    userId,
  };
  all.push(newItem);
  await setLocal("stock", all);
  return newItem;
}

export async function updateStockItem(
  id: string,
  updates: Partial<StockItem>
): Promise<StockItem | null> {
  const all = await getStockItems();
  const i = all.findIndex((s) => s.id === id);
  if (i === -1) return null;
  all[i] = { ...all[i], ...updates };
  await setLocal("stock", all);
  return all[i];
}

export async function deleteStockItem(id: string): Promise<void> {
  const all = await getStockItems();
  await setLocal("stock", all.filter((s) => s.id !== id));
}

export async function updateStockQuantity(
  id: string,
  newQuantity: number
): Promise<StockItem | null> {
    const all = await getLocal<StockItem>("stock");
    const index = all.findIndex((s) => s.id === id);
    if (index === -1) return null;
    all[index].quantity = newQuantity;
    await setLocal("stock", all);
    return all[index];
  }

/* -------------------------------------------------------------------------- */
/*                                 SALE ITEMS                                */
/* -------------------------------------------------------------------------- */

export const normalizeDate = (value: string | Date): string => {
  try {
    if (!value) return new Date().toLocaleDateString();

    // 🧠 Handle already localized format (e.g. "29/10/2025")
    if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      return value; // ✅ already in correct format
    }

    // 🧠 Handle ISO or other date formats
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString();
    }

    // 🧠 Handle fallback parsing for UK-style strings manually
    const parts = typeof value === "string" ? value.split("/") : [];
    if (parts.length === 3) {
      const [day, month, year] = parts.map((p) => parseInt(p, 10));
      const parsedDate = new Date(year, month - 1, day);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString();
      }
    }

    return new Date().toLocaleDateString(); // last fallback
  } catch {
    return new Date().toLocaleDateString();
  }
};

// storage.ts
export const normalizeDateStrict = (value: string | Date): string => {
  try {
    if (!value) return ""; // don't inject "today" anymore

    // already UK dd/mm/yyyy
    if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      return value;
    }

    // parse ISO or other formats
    const parsed = new Date(value as any);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString();
    }

    // try manual dd/mm/yyyy reparse
    if (typeof value === "string") {
      const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const [, d, mth, y] = m;
        const dt = new Date(Number(y), Number(mth) - 1, Number(d));
        if (!Number.isNaN(dt.getTime())) return dt.toLocaleDateString();
      }
    }

    // 🚫 do not replace with today — return original as-is
    return String(value);
  } catch {
    return String(value);
  }
};


export async function getSaleItems(): Promise<SaleItem[]> {
  return await getLocal<SaleItem>("sales");
  
}

export async function getSaleItem(id: string): Promise<SaleItem | null> {
    const all = await getLocal<SaleItem>("sales");
  return all.find((s) => s.id === id) ?? null;
}
// 🆕 Save a new sale item (no date normalization)
export async function saveSaleItem(
  item: Omit<SaleItem, "id" | "userId" | "date">
): Promise<SaleItem> {
  const userId = (await getCachedUserId()) || "guest";
  const all = await getSaleItems();

  const newItem: SaleItem = {
    ...item,
    id: Date.now().toString(),
    // Use current ISO date only for brand-new entries
    date: new Date().toISOString(),
    batchId: "",
    userId,
  };

  all.push(newItem);
  await setLocal("sales", all);
  return newItem;
}

// ✏️ Update an existing sale item (no normalization)
export async function updateSaleItem(
  id: string,
  updates: Partial<SaleItem>
): Promise<SaleItem | null> {
  const all = await getSaleItems();
  const index = all.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updatedItem: SaleItem = {
    ...all[index],
    ...updates,
    // Preserve existing date unless caller explicitly passes a new one
    date: updates.date ?? all[index].date,
  };

  all[index] = updatedItem;
  await setLocal("sales", all);
  return updatedItem;
}

export async function deleteSaleItem(id: string): Promise<void> {
  const all = await getSaleItems();
  await setLocal("sales", all.filter((s) => s.id !== id));
}

// ✅ Overwrite all sale records (used for delete/update)
export async function saveAllSales(sales: any[]) {
  try {
    // 🧹 Normalize dates before saving
    const cleanedSales = sales.map((s) => ({
      ...s,
      date: new Date().toISOString(),
    }));

    await AsyncStorage.setItem("sales", JSON.stringify(cleanedSales));
    console.log("✅ Saved sales with normalized dates:", cleanedSales.length);
  } catch (err) {
    console.error("❌ Error saving all sales:", err);
  }
}



/* -------------------------------------------------------------------------- */
/*                                RETURN ITEMS                               */
/* -------------------------------------------------------------------------- */
export async function getReturnItems(): Promise<ReturnItem[]> {
  return await getLocal<ReturnItem>("returns");
}

export async function getReturnItem(id: string): Promise<ReturnItem | null> {
    const all = await getLocal<ReturnItem>("returns");
    return all.find((s) => s.id === id) ?? null;
}
export async function saveReturnItem(
  item: Omit<ReturnItem, "id" | "userId" | "date">
): Promise<ReturnItem> {
  const userId = (await getCachedUserId()) || "guest";
  const all = await getReturnItems();
  const newItem: ReturnItem = {
    ...item,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    userId,
  };
  all.push(newItem);
  await setLocal("returns", all);
  return newItem;
}

export async function updateReturnItem(
  id: string,
  updates: Partial<ReturnItem>
): Promise<ReturnItem | null> {
    const all = await getLocal<ReturnItem>("returns");
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return null;

    all[index] = { ...all[index], ...updates };
    await setLocal("returns", all);
    return all[index];
}

export async function deleteReturnItem(id: string): Promise<void> {
  const all = await getReturnItems();
  await setLocal("returns", all.filter((r) => r.id !== id));
}

/* -------------------------------------------------------------------------- */
/*                                RETURN STOCK ITEMS                               */
/* -------------------------------------------------------------------------- */

export async function getReturnStockItems(): Promise<ReturnStockItem[]> {
  return await getLocal<ReturnStockItem>("returnStockItems");
}

export async function getReturnStockItem(
  id: string
): Promise<ReturnStockItem | null> {
  const all = await getLocal<ReturnStockItem>("returnStockItems");
  return all.find((s) => s.id === id) ?? null;
}

export async function saveReturnStockItem(
  item: Omit<ReturnStockItem, "id" | "userId" | "date">
): Promise<ReturnStockItem> {
  const userId = (await getCachedUserId()) || "guest";
  const all = await getReturnStockItems();

  const newItem: ReturnStockItem = {
    ...item,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    userId,
  };

  all.push(newItem);
  await setLocal("returnStockItems", all);
  return newItem;
}

export async function updateReturnStockItem(
  id: string,
  updates: Partial<ReturnStockItem>
): Promise<ReturnStockItem | null> {
  const all = await getLocal<ReturnStockItem>("returnStockItems");
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return null;

  all[index] = { ...all[index], ...updates };
  await setLocal("returnStockItems", all);
  return all[index];
}

export async function deleteReturnStockItem(id: string): Promise<void> {
  const all = await getReturnStockItems();
  await setLocal(
    "returnStockItems",
    all.filter((r) => r.id !== id)
  );
}
/* -------------------------------------------------------------------------- */
/*                             COMPANY  PROFILE                              */
/* -------------------------------------------------------------------------- */

import { database, Query, storage } from "@/appwrite";

const DATABASE_ID = "68215d2a00260d43fd49";
const COMPANY_COLLECTION_ID = "companyprofile";
const LOGO_BUCKET_ID = "68215d59001c82087763";

export interface CompanyProfile {
  id: string;

  companyName: string;
  address: string;
  phoneNumber: string;

  businessType: string;
  country: string;
  region: string;

  currencyCode: string;
  currencySymbol: string;
  locale: string;

  logoLocal: string;
  logoCloud: string;

  userId?: string | null;

  synced: boolean;
  syncedAt: string;
}

type SaveCompanyProfileInput = Omit<
  CompanyProfile,
  "id" | "synced" | "syncedAt"
>;

/**
 * Returns the current user's company profile.
 * - Prefers local data first
 * - Falls back to Appwrite cloud
 * - Caches cloud profile locally without deleting other profiles
 */
export async function getCompanyProfile(
  id: string
): Promise<CompanyProfile | null> {
  try {
    const localProfiles =
      (await getLocal<CompanyProfile>("companyprofile")) || [];

    const localProfile = localProfiles.find((p) => p.userId === id);

    if (localProfile) {
      if (!localProfile.logoLocal && localProfile.logoCloud) {
        localProfile.logoLocal = storage
          .getFilePreview(LOGO_BUCKET_ID, localProfile.logoCloud)
          .toString();
      }

      return localProfile;
    }

    const res = await database.listDocuments(
      DATABASE_ID,
      COMPANY_COLLECTION_ID,
      [
        Query.equal("userId", id),
        Query.orderDesc("$createdAt"),
        Query.limit(1),
      ]
    );

    if (res.total === 0) return null;

    const doc = res.documents[0];

    const profile: CompanyProfile = {
      id: doc.$id,

      companyName: doc.companyName || "",
      address: doc.address || "",
      phoneNumber: doc.phoneNumber || "",

      businessType: doc.businessType || "",
      country: doc.country || "",
      region: doc.region || "",

      currencyCode: doc.currencyCode || "GBP",
      currencySymbol: doc.currencySymbol || "£",
      locale: doc.locale || "en-GB",

      userId: doc.userId || id,

      logoCloud: doc.logoCloud || "",
      logoLocal: doc.logoCloud
        ? storage.getFilePreview(LOGO_BUCKET_ID, doc.logoCloud).toString()
        : "",

      synced: true,
      syncedAt: doc.syncedAt || new Date().toISOString(),
    };

    const filteredProfiles = localProfiles.filter((p) => p.userId !== id);

    await setLocal("companyprofile", [...filteredProfiles, profile]);

    return profile;
  } catch (err) {
    console.error("❌ getCompanyProfile() failed:", err);
    return null;
  }
}

/**
 * Saves company profile locally first.
 * syncAllData should later push it to Appwrite.
 */
export async function saveCompanyProfile(
  item: SaveCompanyProfileInput
): Promise<CompanyProfile> {
  const userId = (await getCachedUserId()) || "guest";

  const profiles =
    (await getLocal<CompanyProfile>("companyprofile")) || [];

  const existingIndex = profiles.findIndex((p) => p.userId === userId);
  const existing = existingIndex >= 0 ? profiles[existingIndex] : null;

  const newProfile: CompanyProfile = {
    id: existing?.id || Date.now().toString(),

    companyName: item.companyName || existing?.companyName || "",
    address: item.address || existing?.address || "",
    phoneNumber: item.phoneNumber || existing?.phoneNumber || "",

    businessType: item.businessType || existing?.businessType || "",
    country: item.country || existing?.country || "",
    region: item.region || existing?.region || "",

    currencyCode: item.currencyCode || existing?.currencyCode || "GBP",
    currencySymbol: item.currencySymbol || existing?.currencySymbol || "£",
    locale: item.locale || existing?.locale || "en-GB",

    logoLocal: item.logoLocal ?? existing?.logoLocal ?? "",
    logoCloud: item.logoCloud ?? existing?.logoCloud ?? "",

    userId,

    synced: false,
    syncedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    profiles[existingIndex] = newProfile;
  } else {
    profiles.push(newProfile);
  }

  await setLocal("companyprofile", profiles);

  console.log("✅ Company profile saved locally:", newProfile);

  return newProfile;
}

export async function hasCompanyProfile(): Promise<boolean> {
  const userId = (await getCachedUserId()) || "guest";
  const profile = await getCompanyProfile(userId);

  return !!profile?.companyName && !!profile?.currencyCode;
}

export async function linkGuestCompanyProfileToUser(userId: string) {
  const profiles = (await getLocal<CompanyProfile>("companyprofile")) || [];

  const guestIndex = profiles.findIndex((p) => p.userId === "guest");
  const userIndex = profiles.findIndex((p) => p.userId === userId);

  if (guestIndex === -1) return;

  const guestProfile = profiles[guestIndex];

  if (userIndex >= 0) {
    profiles[userIndex] = {
      ...profiles[userIndex],
      ...guestProfile,
      id: profiles[userIndex].id,
      userId,
      synced: false,
      syncedAt: new Date().toISOString(),
    };

    profiles.splice(guestIndex, 1);
  } else {
    profiles[guestIndex] = {
      ...guestProfile,
      userId,
      synced: false,
      syncedAt: new Date().toISOString(),
    };
  }

  await setLocal("companyprofile", profiles);

  console.log("✅ Guest company profile linked to user:", userId);
}
/* -------------------------------------------------------------------------- */
/*                             STOCK MOVEMENTS                                */
/* -------------------------------------------------------------------------- */

export type StockMovementType = "IN" | "OUT" | "NO_CHANGE";

export type StockMovementSource =
  | "NEW_STOCK"
  | "QUICK_SALE"
  | "BULK_SALE"
  | "CUSTOMER_RETURN"
  | "STOCK_USED"
  | "RETURN_TO_SUPPLIER"
  | "ADJUSTMENT"
  | "DAMAGED"
  | "EXPIRED"
  | "MANUAL_CORRECTION";

export type StockMovementReferenceType =
  | "STOCK"
  | "SALE"
  | "RETURN"
  | "ADJUSTMENT"
  | "SUPPLIER_RETURN"
  | "OTHER";

export interface StockMovement {
  id: string;
  stockItemId: string;
  itemName: string;
  dateTime: string;
  type: StockMovementType;
  quantity: number;
  source: StockMovementSource;
  sourceLabel: string;
  balanceAfter: number;
  referenceId?: string;
  referenceType?: StockMovementReferenceType;
  note?: string;
  userId: string;
  syncedAt: string;
  synced: boolean;
}

export async function getStockMovements(): Promise<StockMovement[]> {
  return await getLocal<StockMovement>("stockMovements");
}

export async function getStockMovement(
  id: string
): Promise<StockMovement | null> {
  const all = await getLocal<StockMovement>("stockMovements");
  return all.find((m) => m.id === id) ?? null;
}

export async function saveStockMovement(
  movement: Omit<
    StockMovement,
    "id" | "userId" | "dateTime" | "syncedAt" | "synced"
  >
): Promise<StockMovement> {
  const userId = (await getCachedUserId()) || "guest";
  const all = await getStockMovements();

  const newMovement: StockMovement = {
    ...movement,
    id: Date.now().toString(),
    dateTime: new Date().toISOString(),
    userId,
    syncedAt: "",
    synced: false,
  };

  all.push(newMovement);
  await setLocal("stockMovements", all);

  return newMovement;
}

export async function updateStockMovement(
  id: string,
  updates: Partial<Omit<StockMovement, "id" | "userId">>
): Promise<StockMovement | null> {
  const all = await getStockMovements();
  const index = all.findIndex((m) => m.id === id);

  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
    id: all[index].id,
    userId: all[index].userId,
    synced: false,
    syncedAt: "",
  };

  await setLocal("stockMovements", all);

  return all[index];
}

export async function deleteStockMovement(id: string): Promise<void> {
  const all = await getStockMovements();
  await setLocal(
    "stockMovements",
    all.filter((m) => m.id !== id)
  );
}

export async function saveAllStockMovements(
  movements: StockMovement[]
): Promise<void> {
  await setLocal("stockMovements", movements);
}

export async function clearStockMovements(): Promise<void> {
  await AsyncStorage.removeItem("stockMovements");
}

export async function markStockMovementSynced(
  id: string,
  syncedAt: string = new Date().toISOString()
): Promise<void> {
  const all = await getStockMovements();

  const updated = all.map((m) =>
    m.id === id
      ? {
          ...m,
          synced: true,
          syncedAt,
        }
      : m
  );

  await setLocal("stockMovements", updated);
}

export async function getUnsyncedStockMovements(): Promise<StockMovement[]> {
  const all = await getStockMovements();
  return all.filter((m) => !m.synced);
}