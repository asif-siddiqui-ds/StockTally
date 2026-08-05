// // lib/storage.ts
// import { getCachedUserId } from "@/context/AuthContext";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// /* -------------------------------------------------------------------------- */
// /*                                   TYPES                                    */
// /* -------------------------------------------------------------------------- */
// export interface StockItem {
//   id: string;
//   name: string;
//   category: string;
//   quantity: number;
//   barcode?: string;
//   unit?: string;
//   costPrice?: number;
//   lowStockAlert?: number;
//   idealStockLevel?: number;
//   supplierName?: string;
//   paid?: boolean;
//   date: string;
//   userId: string;
//   syncedAt: string;
//   synced: boolean;
// }

// export interface SaleItem {
//   id: string;
//   salesId: string;
//   batchId?: string;
//   stockItemId: string;
//   name: string;
//   quantity: number;
//   buyerName: string;
//   price: number;
//   date: string;
//   userId: string;
//   paid: boolean;
//   type?: "bulk_sale" | "single_sale";
//   syncedAt: string;
//   synced: boolean;
// }

// export type ReturnStatus =
//   | "back_to_stock"
//   | "pending_return"
//   | "returned_to_supplier"
//   | "no_stock_change";

// export interface ReturnItem {
//   id: string;
//   stockItemId: string;
//   name: string;
//   quantity: number;
//   reason: string;
//   date: string;
//   status?: ReturnStatus;
//   userId: string;
//   syncedAt: string;
//   synced: boolean;
// }

// export interface ReturnStockItem {
//   id: string;
//   stockItemId: string;
//   returnItemId: string;
//   name: string;
//   category?: string;
//   quantity: number;
//   reason: string;
//   supplierName?: string;
//   date: string;
//   userId: string;
//   syncedAt: string;
//   synced: boolean;
// }


// /* -------------------------------------------------------------------------- */
// /*                              LOCAL STORAGE I/O                             */
// /* -------------------------------------------------------------------------- */
// export async function getLocal<T>(key: string): Promise<T[]> {
//   try {
//     const data = await AsyncStorage.getItem(key);
//     return data ? JSON.parse(data) : [];
//   } catch (err) {
//     console.error(`❌ Failed to read local key ${key}`, err);
//     return [];
//   }
// }

// export async function setLocal<T>(key: string, value: T[]): Promise<void> {
//   try {
//     await AsyncStorage.setItem(key, JSON.stringify(value));
//   } catch (err) {
//     console.error(`❌ Failed to write local key ${key}`, err);
//   }
// }

// /* -------------------------------------------------------------------------- */
// /*                                STOCK ITEMS                                */
// /* -------------------------------------------------------------------------- */
// export async function getStockItems(): Promise<StockItem[]> {
//   return await getLocal<StockItem>("stock");
// }
// export async function getStockItem(id: string): Promise<StockItem | null> {
//     const all = await getLocal<StockItem>("stock");
//     return all.find((s) => s.id === id) ?? null;
// }

// export async function saveStockItem(
//   item: Omit<StockItem, "id" | "userId" | "date">
// ): Promise<StockItem> {
//   const userId = (await getCachedUserId()) || "guest";
//   const all = await getStockItems();
//   const newItem: StockItem = {
//     ...item,
//     id: Date.now().toString(),
//     date: new Date().toISOString(),
//     userId,
//   };
//   all.push(newItem);
//   await setLocal("stock", all);
//   return newItem;
// }

// export async function updateStockItem(
//   id: string,
//   updates: Partial<StockItem>
// ): Promise<StockItem | null> {
//   const all = await getStockItems();
//   const i = all.findIndex((s) => s.id === id);
//   if (i === -1) return null;
//   all[i] = { ...all[i], ...updates };
//   await setLocal("stock", all);
//   return all[i];
// }

// export async function deleteStockItem(id: string): Promise<void> {
//   const all = await getStockItems();
//   await setLocal("stock", all.filter((s) => s.id !== id));
// }

// export async function updateStockQuantity(
//   id: string,
//   newQuantity: number
// ): Promise<StockItem | null> {
//     const all = await getLocal<StockItem>("stock");
//     const index = all.findIndex((s) => s.id === id);
//     if (index === -1) return null;
//     all[index].quantity = newQuantity;
//     await setLocal("stock", all);
//     return all[index];
//   }

// /* -------------------------------------------------------------------------- */
// /*                                 SALE ITEMS                                */
// /* -------------------------------------------------------------------------- */

// export const normalizeDate = (value: string | Date): string => {
//   try {
//     if (!value) return new Date().toLocaleDateString();

//     // 🧠 Handle already localized format (e.g. "29/10/2025")
//     if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
//       return value; // ✅ already in correct format
//     }

//     // 🧠 Handle ISO or other date formats
//     const parsed = new Date(value);
//     if (!isNaN(parsed.getTime())) {
//       return parsed.toLocaleDateString();
//     }

//     // 🧠 Handle fallback parsing for UK-style strings manually
//     const parts = typeof value === "string" ? value.split("/") : [];
//     if (parts.length === 3) {
//       const [day, month, year] = parts.map((p) => parseInt(p, 10));
//       const parsedDate = new Date(year, month - 1, day);
//       if (!isNaN(parsedDate.getTime())) {
//         return parsedDate.toLocaleDateString();
//       }
//     }

//     return new Date().toLocaleDateString(); // last fallback
//   } catch {
//     return new Date().toLocaleDateString();
//   }
// };

// // storage.ts
// export const normalizeDateStrict = (value: string | Date): string => {
//   try {
//     if (!value) return ""; // don't inject "today" anymore

//     // already UK dd/mm/yyyy
//     if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
//       return value;
//     }

//     // parse ISO or other formats
//     const parsed = new Date(value as any);
//     if (!Number.isNaN(parsed.getTime())) {
//       return parsed.toLocaleDateString();
//     }

//     // try manual dd/mm/yyyy reparse
//     if (typeof value === "string") {
//       const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
//       if (m) {
//         const [, d, mth, y] = m;
//         const dt = new Date(Number(y), Number(mth) - 1, Number(d));
//         if (!Number.isNaN(dt.getTime())) return dt.toLocaleDateString();
//       }
//     }

//     // 🚫 do not replace with today — return original as-is
//     return String(value);
//   } catch {
//     return String(value);
//   }
// };


// export async function getSaleItems(): Promise<SaleItem[]> {
//   return await getLocal<SaleItem>("sales");
  
// }

// export async function getSaleItem(id: string): Promise<SaleItem | null> {
//     const all = await getLocal<SaleItem>("sales");
//   return all.find((s) => s.id === id) ?? null;
// }
// // 🆕 Save a new sale item (no date normalization)
// export async function saveSaleItem(
//   item: Omit<SaleItem, "id" | "userId" | "date">
// ): Promise<SaleItem> {
//   const userId = (await getCachedUserId()) || "guest";
//   const all = await getSaleItems();

//   const newItem: SaleItem = {
//     ...item,
//     id: Date.now().toString(),
//     // Use current ISO date only for brand-new entries
//     date: new Date().toISOString(),
//     batchId: "",
//     userId,
//   };

//   all.push(newItem);
//   await setLocal("sales", all);
//   return newItem;
// }

// // ✏️ Update an existing sale item (no normalization)
// export async function updateSaleItem(
//   id: string,
//   updates: Partial<SaleItem>
// ): Promise<SaleItem | null> {
//   const all = await getSaleItems();
//   const index = all.findIndex((s) => s.id === id);
//   if (index === -1) return null;

//   const updatedItem: SaleItem = {
//     ...all[index],
//     ...updates,
//     // Preserve existing date unless caller explicitly passes a new one
//     date: updates.date ?? all[index].date,
//   };

//   all[index] = updatedItem;
//   await setLocal("sales", all);
//   return updatedItem;
// }

// export async function deleteSaleItem(id: string): Promise<void> {
//   const all = await getSaleItems();
//   await setLocal("sales", all.filter((s) => s.id !== id));
// }

// // ✅ Overwrite all sale records (used for delete/update)
// export async function saveAllSales(sales: any[]) {
//   try {
//     // 🧹 Normalize dates before saving
//     const cleanedSales = sales.map((s) => ({
//       ...s,
//       date: new Date().toISOString(),
//     }));

//     await AsyncStorage.setItem("sales", JSON.stringify(cleanedSales));
//     console.log("✅ Saved sales with normalized dates:", cleanedSales.length);
//   } catch (err) {
//     console.error("❌ Error saving all sales:", err);
//   }
// }



// /* -------------------------------------------------------------------------- */
// /*                                RETURN ITEMS                               */
// /* -------------------------------------------------------------------------- */
// export async function getReturnItems(): Promise<ReturnItem[]> {
//   return await getLocal<ReturnItem>("returns");
// }

// export async function getReturnItem(id: string): Promise<ReturnItem | null> {
//     const all = await getLocal<ReturnItem>("returns");
//     return all.find((s) => s.id === id) ?? null;
// }
// export async function saveReturnItem(
//   item: Omit<ReturnItem, "id" | "userId" | "date">
// ): Promise<ReturnItem> {
//   const userId = (await getCachedUserId()) || "guest";
//   const all = await getReturnItems();
//   const newItem: ReturnItem = {
//     ...item,
//     id: Date.now().toString(),
//     date: new Date().toISOString(),
//     userId,
//   };
//   all.push(newItem);
//   await setLocal("returns", all);
//   return newItem;
// }

// export async function updateReturnItem(
//   id: string,
//   updates: Partial<ReturnItem>
// ): Promise<ReturnItem | null> {
//     const all = await getLocal<ReturnItem>("returns");
//     const index = all.findIndex((r) => r.id === id);
//     if (index === -1) return null;

//     all[index] = { ...all[index], ...updates };
//     await setLocal("returns", all);
//     return all[index];
// }

// export async function deleteReturnItem(id: string): Promise<void> {
//   const all = await getReturnItems();
//   await setLocal("returns", all.filter((r) => r.id !== id));
// }

// /* -------------------------------------------------------------------------- */
// /*                                RETURN STOCK ITEMS                               */
// /* -------------------------------------------------------------------------- */

// export async function getReturnStockItems(): Promise<ReturnStockItem[]> {
//   return await getLocal<ReturnStockItem>("returnStockItems");
// }

// export async function getReturnStockItem(
//   id: string
// ): Promise<ReturnStockItem | null> {
//   const all = await getLocal<ReturnStockItem>("returnStockItems");
//   return all.find((s) => s.id === id) ?? null;
// }

// export async function saveReturnStockItem(
//   item: Omit<ReturnStockItem, "id" | "userId" | "date">
// ): Promise<ReturnStockItem> {
//   const userId = (await getCachedUserId()) || "guest";
//   const all = await getReturnStockItems();

//   const newItem: ReturnStockItem = {
//     ...item,
//     id: Date.now().toString(),
//     date: new Date().toISOString(),
//     userId,
//   };

//   all.push(newItem);
//   await setLocal("returnStockItems", all);
//   return newItem;
// }

// export async function updateReturnStockItem(
//   id: string,
//   updates: Partial<ReturnStockItem>
// ): Promise<ReturnStockItem | null> {
//   const all = await getLocal<ReturnStockItem>("returnStockItems");
//   const index = all.findIndex((r) => r.id === id);
//   if (index === -1) return null;

//   all[index] = { ...all[index], ...updates };
//   await setLocal("returnStockItems", all);
//   return all[index];
// }

// export async function deleteReturnStockItem(id: string): Promise<void> {
//   const all = await getReturnStockItems();
//   await setLocal(
//     "returnStockItems",
//     all.filter((r) => r.id !== id)
//   );
// }
// /* -------------------------------------------------------------------------- */
// /*                             COMPANY  PROFILE                              */
// /* -------------------------------------------------------------------------- */

// import { database, Query, storage } from "@/appwrite";

// const DATABASE_ID = "68215d2a00260d43fd49";
// const COMPANY_COLLECTION_ID = "companyprofile";
// const LOGO_BUCKET_ID = "68215d59001c82087763";

// export interface CompanyProfile {
//   id: string;

//   companyName: string;
//   address: string;
//   phoneNumber: string;

//   businessType: string;
//   country: string;
//   region: string;

//   currencyCode: string;
//   currencySymbol: string;
//   locale: string;

//   logoLocal: string;
//   logoCloud: string;

//   userId?: string | null;

//   synced: boolean;
//   syncedAt: string;
// }

// type SaveCompanyProfileInput = Omit<
//   CompanyProfile,
//   "id" | "synced" | "syncedAt"
// >;

// /**
//  * Returns the current user's company profile.
//  * - Prefers local data first
//  * - Falls back to Appwrite cloud
//  * - Caches cloud profile locally without deleting other profiles
//  */
// export async function getCompanyProfile(
//   id: string
// ): Promise<CompanyProfile | null> {
//   try {
//     const localProfiles =
//       (await getLocal<CompanyProfile>("companyprofile")) || [];

//     const localProfile = localProfiles.find((p) => p.userId === id);

//     if (localProfile) {
//       if (!localProfile.logoLocal && localProfile.logoCloud) {
//         localProfile.logoLocal = storage
//           .getFilePreview(LOGO_BUCKET_ID, localProfile.logoCloud)
//           .toString();
//       }

//       return localProfile;
//     }

//     const res = await database.listDocuments(
//       DATABASE_ID,
//       COMPANY_COLLECTION_ID,
//       [
//         Query.equal("userId", id),
//         Query.orderDesc("$createdAt"),
//         Query.limit(1),
//       ]
//     );

//     if (res.total === 0) return null;

//     const doc = res.documents[0];

//     const profile: CompanyProfile = {
//       id: doc.$id,

//       companyName: doc.companyName || "",
//       address: doc.address || "",
//       phoneNumber: doc.phoneNumber || "",

//       businessType: doc.businessType || "",
//       country: doc.country || "",
//       region: doc.region || "",

//       currencyCode: doc.currencyCode || "GBP",
//       currencySymbol: doc.currencySymbol || "£",
//       locale: doc.locale || "en-GB",

//       userId: doc.userId || id,

//       logoCloud: doc.logoCloud || "",
//       logoLocal: doc.logoCloud
//         ? storage.getFilePreview(LOGO_BUCKET_ID, doc.logoCloud).toString()
//         : "",

//       synced: true,
//       syncedAt: doc.syncedAt || new Date().toISOString(),
//     };

//     const filteredProfiles = localProfiles.filter((p) => p.userId !== id);

//     await setLocal("companyprofile", [...filteredProfiles, profile]);

//     return profile;
//   } catch (err) {
//     console.error("❌ getCompanyProfile() failed:", err);
//     return null;
//   }
// }

// /**
//  * Saves company profile locally first.
//  * syncAllData should later push it to Appwrite.
//  */
// export async function saveCompanyProfile(
//   item: SaveCompanyProfileInput
// ): Promise<CompanyProfile> {
//   const userId = (await getCachedUserId()) || "guest";

//   const profiles =
//     (await getLocal<CompanyProfile>("companyprofile")) || [];

//   const existingIndex = profiles.findIndex((p) => p.userId === userId);
//   const existing = existingIndex >= 0 ? profiles[existingIndex] : null;

//   const newProfile: CompanyProfile = {
//     id: existing?.id || Date.now().toString(),

//     companyName: item.companyName || existing?.companyName || "",
//     address: item.address || existing?.address || "",
//     phoneNumber: item.phoneNumber || existing?.phoneNumber || "",

//     businessType: item.businessType || existing?.businessType || "",
//     country: item.country || existing?.country || "",
//     region: item.region || existing?.region || "",

//     currencyCode: item.currencyCode || existing?.currencyCode || "GBP",
//     currencySymbol: item.currencySymbol || existing?.currencySymbol || "£",
//     locale: item.locale || existing?.locale || "en-GB",

//     logoLocal: item.logoLocal ?? existing?.logoLocal ?? "",
//     logoCloud: item.logoCloud ?? existing?.logoCloud ?? "",

//     userId,

//     synced: false,
//     syncedAt: new Date().toISOString(),
//   };

//   if (existingIndex >= 0) {
//     profiles[existingIndex] = newProfile;
//   } else {
//     profiles.push(newProfile);
//   }

//   await setLocal("companyprofile", profiles);

//   console.log("✅ Company profile saved locally:", newProfile);

//   return newProfile;
// }

// export async function hasCompanyProfile(): Promise<boolean> {
//   const userId = (await getCachedUserId()) || "guest";
//   const profile = await getCompanyProfile(userId);

//   return !!profile?.companyName && !!profile?.currencyCode;
// }

// export async function linkGuestCompanyProfileToUser(userId: string) {
//   const profiles = (await getLocal<CompanyProfile>("companyprofile")) || [];

//   const guestIndex = profiles.findIndex((p) => p.userId === "guest");
//   const userIndex = profiles.findIndex((p) => p.userId === userId);

//   if (guestIndex === -1) return;

//   const guestProfile = profiles[guestIndex];

//   if (userIndex >= 0) {
//     profiles[userIndex] = {
//       ...profiles[userIndex],
//       ...guestProfile,
//       id: profiles[userIndex].id,
//       userId,
//       synced: false,
//       syncedAt: new Date().toISOString(),
//     };

//     profiles.splice(guestIndex, 1);
//   } else {
//     profiles[guestIndex] = {
//       ...guestProfile,
//       userId,
//       synced: false,
//       syncedAt: new Date().toISOString(),
//     };
//   }

//   await setLocal("companyprofile", profiles);

//   console.log("✅ Guest company profile linked to user:", userId);
// }
// /* -------------------------------------------------------------------------- */
// /*                             STOCK MOVEMENTS                                */
// /* -------------------------------------------------------------------------- */

// export type StockMovementType = "IN" | "OUT" | "NO_CHANGE";

// export type StockMovementSource =
//   | "NEW_STOCK"
//   | "QUICK_SALE"
//   | "BULK_SALE"
//   | "CUSTOMER_RETURN"
//   | "STOCK_USED"
//   | "RETURN_TO_SUPPLIER"
//   | "ADJUSTMENT"
//   | "DAMAGED"
//   | "EXPIRED"
//   | "MANUAL_CORRECTION"
//   | "INVOICE";

// export type StockMovementReferenceType =
//   | "STOCK"
//   | "SALE"
//   | "RETURN"
//   | "ADJUSTMENT"
//   | "SUPPLIER_RETURN"
//   | "OTHER"
//   | "INVOICE";

// export interface StockMovement {
//   id: string;
//   stockItemId: string;
//   itemName: string;
//   dateTime: string;
//   type: StockMovementType;
//   quantity: number;
//   source: StockMovementSource;
//   sourceLabel: string;
//   balanceAfter: number;
//   referenceId?: string;
//   referenceType?: StockMovementReferenceType;
//   note?: string;
//   userId: string;
//   syncedAt: string;
//   synced: boolean;
// }

// export async function getStockMovements(): Promise<StockMovement[]> {
//   return await getLocal<StockMovement>("stockMovements");
// }

// export async function getStockMovement(
//   id: string
// ): Promise<StockMovement | null> {
//   const all = await getLocal<StockMovement>("stockMovements");
//   return all.find((m) => m.id === id) ?? null;
// }

// export async function saveStockMovement(
//   movement: Omit<
//     StockMovement,
//     "id" | "userId" | "dateTime" | "syncedAt" | "synced"
//   >
// ): Promise<StockMovement> {
//   const userId = (await getCachedUserId()) || "guest";
//   const all = await getStockMovements();

//   const newMovement: StockMovement = {
//     ...movement,
//     id: Date.now().toString(),
//     dateTime: new Date().toISOString(),
//     userId,
//     syncedAt: "",
//     synced: false,
//   };

//   all.push(newMovement);
//   await setLocal("stockMovements", all);

//   return newMovement;
// }

// export async function updateStockMovement(
//   id: string,
//   updates: Partial<Omit<StockMovement, "id" | "userId">>
// ): Promise<StockMovement | null> {
//   const all = await getStockMovements();
//   const index = all.findIndex((m) => m.id === id);

//   if (index === -1) return null;

//   all[index] = {
//     ...all[index],
//     ...updates,
//     id: all[index].id,
//     userId: all[index].userId,
//     synced: false,
//     syncedAt: "",
//   };

//   await setLocal("stockMovements", all);

//   return all[index];
// }

// export async function deleteStockMovement(id: string): Promise<void> {
//   const all = await getStockMovements();
//   await setLocal(
//     "stockMovements",
//     all.filter((m) => m.id !== id)
//   );
// }

// export async function saveAllStockMovements(
//   movements: StockMovement[]
// ): Promise<void> {
//   await setLocal("stockMovements", movements);
// }

// export async function clearStockMovements(): Promise<void> {
//   await AsyncStorage.removeItem("stockMovements");
// }

// export async function markStockMovementSynced(
//   id: string,
//   syncedAt: string = new Date().toISOString()
// ): Promise<void> {
//   const all = await getStockMovements();

//   const updated = all.map((m) =>
//     m.id === id
//       ? {
//           ...m,
//           synced: true,
//           syncedAt,
//         }
//       : m
//   );

//   await setLocal("stockMovements", updated);
// }

// export async function getUnsyncedStockMovements(): Promise<StockMovement[]> {
//   const all = await getStockMovements();
//   return all.filter((m) => !m.synced);
// }

// lib/storage.ts
import { getCachedUserId } from "@/context/AuthContext";
import { recalculateInvoice } from "@/lib/invoiceCalculations";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
} from "@/types/invoice";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
export interface StockItem {
  id: string;
  supplierId?: string;
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
  | "accepted"
  | "credited"
  | "replaced"
  | "rejected"
  | "closed"
  | "no_stock_change";

export interface ReturnItem {
  id: string;
  stockItemId: string;
  supplierId?: string;
  supplierName?: string;
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
  unit?: string;

  reason: string;

  supplierId?: string;
  supplierName?: string;

  unitCost?: number;
  returnValue?: number;

  status: ReturnStatus;

  returnedAt?: string;
  resolvedAt?: string;

  replacementQuantity?: number;
  replacementReference?: string;

  notes?: string;

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
  item: Omit<StockItem, "id" | "userId" | "date" | "synced" | "syncedAt" >
): Promise<StockItem> {
  const userId = (await getCachedUserId()) || "guest";
  const all = await getStockItems();
  const now = new Date().toISOString();
  const newItem: StockItem = {
    ...item,
    id: `stock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: now,
    userId,
    synced: false,
    syncedAt: "",
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
    id: `sale_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
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
    id: `return_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
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
  companyEmail: string;
  address: string;
  phoneNumber: string;
  website: string;
  taxRegistrationNumber: string;

  businessType: string;
  country: string;
  region: string;

  currencyCode: string;
  currencySymbol: string;
  locale: string;

  taxEnabled: boolean;
  taxLabel: string;
  defaultTaxRate: number;
  pricesIncludeTax: boolean;

  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankSortCode: string;
  bankIban: string;
  bankSwiftCode: string;

  defaultPaymentTerms: string;
  defaultInvoiceNotes: string;
  defaultPaymentInstructions: string;
  defaultTermsAndConditions: string;
  invoiceFooterMessage: string;

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
      companyEmail: doc.companyEmail || "",
      website: doc.website || "",
      taxRegistrationNumber: doc.taxRegistrationNumber || "",

      taxEnabled: Boolean(doc.taxEnabled),
      taxLabel: doc.taxLabel || "Tax",
      defaultTaxRate: Number(doc.defaultTaxRate || 0),
      pricesIncludeTax: Boolean(doc.pricesIncludeTax),

      bankName: doc.bankName || "",
      bankAccountName: doc.bankAccountName || "",
      bankAccountNumber: doc.bankAccountNumber || "",
      bankSortCode: doc.bankSortCode || "",
      bankIban: doc.bankIban || "",
      bankSwiftCode: doc.bankSwiftCode || "",

      defaultPaymentTerms:
        doc.defaultPaymentTerms || "Payment due within 30 days.",
      defaultInvoiceNotes: doc.defaultInvoiceNotes || "",
      defaultPaymentInstructions:
        doc.defaultPaymentInstructions || "",
      defaultTermsAndConditions:
        doc.defaultTermsAndConditions || "",
      invoiceFooterMessage:
        doc.invoiceFooterMessage || "Thank you for your business.",
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

    companyEmail:
      item.companyEmail ?? existing?.companyEmail ?? "",
    website: item.website ?? existing?.website ?? "",
    taxRegistrationNumber:
      item.taxRegistrationNumber ??
      existing?.taxRegistrationNumber ??
      "",

    taxEnabled:
      item.taxEnabled ?? existing?.taxEnabled ?? false,
    taxLabel: item.taxLabel ?? existing?.taxLabel ?? "Tax",
    defaultTaxRate:
      item.defaultTaxRate ?? existing?.defaultTaxRate ?? 0,
    pricesIncludeTax:
      item.pricesIncludeTax ??
      existing?.pricesIncludeTax ??
      false,

    bankName: item.bankName ?? existing?.bankName ?? "",
    bankAccountName:
      item.bankAccountName ?? existing?.bankAccountName ?? "",
    bankAccountNumber:
      item.bankAccountNumber ??
      existing?.bankAccountNumber ??
      "",
    bankSortCode:
      item.bankSortCode ?? existing?.bankSortCode ?? "",
    bankIban: item.bankIban ?? existing?.bankIban ?? "",
    bankSwiftCode:
      item.bankSwiftCode ?? existing?.bankSwiftCode ?? "",

    defaultPaymentTerms:
      item.defaultPaymentTerms ??
      existing?.defaultPaymentTerms ??
      "Payment due within 30 days.",
    defaultInvoiceNotes:
      item.defaultInvoiceNotes ??
      existing?.defaultInvoiceNotes ??
      "",
    defaultPaymentInstructions:
      item.defaultPaymentInstructions ??
      existing?.defaultPaymentInstructions ??
      "",
    defaultTermsAndConditions:
      item.defaultTermsAndConditions ??
      existing?.defaultTermsAndConditions ??
      "",
    invoiceFooterMessage:
      item.invoiceFooterMessage ??
      existing?.invoiceFooterMessage ??
      "Thank you for your business.",

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
  | "MANUAL_CORRECTION"
  | "SUPPLIER_REPLACEMENT"
  | "INVOICE";
  

export type StockMovementReferenceType =
  | "STOCK"
  | "SALE"
  | "RETURN"
  | "ADJUSTMENT"
  | "SUPPLIER_RETURN"
  | "OTHER"
  | "INVOICE";

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


/* -------------------------------------------------------------------------- */
/*                                  INVOICES                                  */
/* -------------------------------------------------------------------------- */

const INVOICES_STORAGE_KEY = "invoices";

const createLocalId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const getCurrentStorageUserId = async (): Promise<string> =>
  (await getCachedUserId()) || "guest";

const belongsToCurrentUser = (
  recordUserId: string | null | undefined,
  currentUserId: string
): boolean => {
  if (!recordUserId) return currentUserId === "guest";
  return recordUserId === currentUserId;
};

/**
 * Returns invoices belonging to the currently active local user.
 */
export async function getInvoices(): Promise<Invoice[]> {
  const userId = await getCurrentStorageUserId();
  const all = await getLocal<Invoice>(INVOICES_STORAGE_KEY);

  return all
    .filter((invoice) => belongsToCurrentUser(invoice.userId, userId))
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
}

/**
 * Returns every locally stored invoice.
 * Intended for sync/migration utilities rather than normal screens.
 */
export async function getAllInvoices(): Promise<Invoice[]> {
  return await getLocal<Invoice>(INVOICES_STORAGE_KEY);
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const userId = await getCurrentStorageUserId();
  const all = await getLocal<Invoice>(INVOICES_STORAGE_KEY);

  return (
    all.find(
      (invoice) =>
        (invoice.id === id || invoice.cloudId === id) &&
        belongsToCurrentUser(invoice.userId, userId)
    ) ?? null
  );
}

export async function getInvoiceByNumber(
  invoiceNumber: string
): Promise<Invoice | null> {
  const normalized = invoiceNumber.trim().toLowerCase();
  const invoices = await getInvoices();

  return (
    invoices.find(
      (invoice) => invoice.invoiceNumber.trim().toLowerCase() === normalized
    ) ?? null
  );
}

export async function invoiceNumberExists(
  invoiceNumber: string,
  excludeInvoiceId?: string
): Promise<boolean> {
  const existing = await getInvoiceByNumber(invoiceNumber);

  if (!existing) return false;
  if (!excludeInvoiceId) return true;

  return existing.id !== excludeInvoiceId;
}

const buildInvoiceItems = (items: InvoiceItem[]): InvoiceItem[] =>
  items.map((item) => ({
    ...item,
    id: item.id || createLocalId("invoice_item"),
    sourceType: item.sourceType || "custom",
    stockId: item.stockId || undefined,
    productName: item.productName?.trim() || "Unnamed item",
    sku: item.sku?.trim() || undefined,
    description: item.description?.trim() || undefined,
    quantity: Number(item.quantity) || 0,
    unit: item.unit?.trim() || undefined,
    unitPrice: Number(item.unitPrice) || 0,
    discountValue: Number(item.discountValue) || 0,
    discountAmount: Number(item.discountAmount) || 0,
    taxRate: Number(item.taxRate) || 0,
    taxExempt: Boolean(item.taxExempt),
    subtotal: Number(item.subtotal) || 0,
    taxableAmount: Number(item.taxableAmount) || 0,
    taxAmount: Number(item.taxAmount) || 0,
    total: Number(item.total) || 0,
    stockProcessed: Boolean(item.stockProcessed),
    stockProcessedQuantity: Number(item.stockProcessedQuantity) || 0,
  }));

export async function saveInvoice(
  input: CreateInvoiceInput,
  status: InvoiceStatus = "draft"
): Promise<Invoice> {
  const userId = await getCurrentStorageUserId();
  const all = await getLocal<Invoice>(INVOICES_STORAGE_KEY);
  const now = new Date().toISOString();

  if (!input.invoiceNumber?.trim()) {
    throw new Error("Invoice number is required.");
  }

  if (
    all.some(
      (invoice) =>
        belongsToCurrentUser(invoice.userId, userId) &&
        invoice.invoiceNumber.trim().toLowerCase() ===
          input.invoiceNumber.trim().toLowerCase()
    )
  ) {
    throw new Error(`Invoice number ${input.invoiceNumber} already exists.`);
  }

  const draft: Invoice = {
    id: createLocalId("invoice"),
    cloudId: undefined,
    userId,

    invoiceNumber: input.invoiceNumber.trim(),
    status,

    invoiceDate: input.invoiceDate || now,
    dueDate: input.dueDate || undefined,

    purchaseOrderNumber: input.purchaseOrderNumber?.trim() || undefined,
    reference: input.reference?.trim() || undefined,

    customerName: input.customerName?.trim() || "",
    customerCompany: input.customerCompany?.trim() || undefined,
    customerEmail: input.customerEmail?.trim() || undefined,
    customerPhone: input.customerPhone?.trim() || undefined,
    billingAddress: input.billingAddress?.trim() || undefined,
    shippingAddress: input.shippingAddress?.trim() || undefined,
    customerTaxNumber: input.customerTaxNumber?.trim() || undefined,

    currencyCode: input.currencyCode || "GBP",
    currencySymbol: input.currencySymbol || "£",
    locale: input.locale || "en-GB",

    taxEnabled: Boolean(input.taxEnabled),
    taxLabel: input.taxLabel?.trim() || "Tax",
    pricesIncludeTax: Boolean(input.pricesIncludeTax),

    items: buildInvoiceItems(input.items || []),

    subtotal: 0,
    itemDiscountTotal: 0,
    invoiceDiscountType: input.invoiceDiscountType,
    invoiceDiscountValue: Number(input.invoiceDiscountValue) || 0,
    invoiceDiscountAmount: 0,
    shippingAmount: Number(input.shippingAmount) || 0,
    taxTotal: 0,
    roundingAdjustment: Number(input.roundingAdjustment) || 0,
    grandTotal: 0,
    amountPaid: 0,
    balanceDue: 0,

    notes: input.notes?.trim() || undefined,
    paymentTerms: input.paymentTerms?.trim() || undefined,
    paymentInstructions: input.paymentInstructions?.trim() || undefined,
    termsAndConditions: input.termsAndConditions?.trim() || undefined,

    stockReductionTrigger: input.stockReductionTrigger || "sent",
    stockProcessed: false,

    createdAt: now,
    updatedAt: now,
    synced: false,
    syncedAt: "",
  };

  const calculated = recalculateInvoice(draft);
  all.push(calculated);
  await setLocal(INVOICES_STORAGE_KEY, all);

  if (calculated.stockReductionTrigger === "created" && status !== "draft") {
    return await processInvoiceStock(calculated.id);
  }

  return calculated;
}

export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>
): Promise<Invoice | null> {
  const userId = await getCurrentStorageUserId();
  const all = await getLocal<Invoice>(INVOICES_STORAGE_KEY);

  const index = all.findIndex(
    (invoice) =>
      (invoice.id === id || invoice.cloudId === id) &&
      belongsToCurrentUser(invoice.userId, userId)
  );

  if (index === -1) return null;

  const current = all[index];

  if (
    updates.invoiceNumber &&
    updates.invoiceNumber.trim().toLowerCase() !==
      current.invoiceNumber.trim().toLowerCase()
  ) {
    const duplicate = all.some(
      (invoice, invoiceIndex) =>
        invoiceIndex !== index &&
        belongsToCurrentUser(invoice.userId, userId) &&
        invoice.invoiceNumber.trim().toLowerCase() ===
          updates.invoiceNumber!.trim().toLowerCase()
    );

    if (duplicate) {
      throw new Error(`Invoice number ${updates.invoiceNumber} already exists.`);
    }
  }

  const merged: Invoice = {
    ...current,
    ...updates,
    id: current.id,
    cloudId: updates.cloudId ?? current.cloudId,
    userId: current.userId || userId,
    invoiceNumber:
      updates.invoiceNumber?.trim() || current.invoiceNumber,
    items: updates.items
      ? buildInvoiceItems(updates.items)
      : current.items,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
    synced: false,
    syncedAt: "",
  };

  const calculated = recalculateInvoice(merged);
  all[index] = calculated;
  await setLocal(INVOICES_STORAGE_KEY, all);

  return calculated;
}

export async function saveAllInvoices(invoices: Invoice[]): Promise<void> {
  await setLocal(INVOICES_STORAGE_KEY, invoices);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const userId = await getCurrentStorageUserId();
  const all = await getLocal<Invoice>(INVOICES_STORAGE_KEY);

  const invoice = all.find(
    (item) =>
      (item.id === id || item.cloudId === id) &&
      belongsToCurrentUser(item.userId, userId)
  );

  if (!invoice) return false;

  if (invoice.stockProcessed) {
    throw new Error(
      "This invoice has already changed stock and cannot be deleted directly. Cancel or reverse it instead."
    );
  }

  await setLocal(
    INVOICES_STORAGE_KEY,
    all.filter((item) => item.id !== invoice.id)
  );

  return true;
}

export async function getUnsyncedInvoices(): Promise<Invoice[]> {
  const invoices = await getInvoices();
  return invoices.filter((invoice) => !invoice.synced);
}

export async function markInvoiceSynced(
  id: string,
  cloudId?: string,
  syncedAt: string = new Date().toISOString()
): Promise<Invoice | null> {
  const userId = await getCurrentStorageUserId();
  const all = await getLocal<Invoice>(INVOICES_STORAGE_KEY);

  const index = all.findIndex(
    (invoice) =>
      (invoice.id === id || invoice.cloudId === id) &&
      belongsToCurrentUser(invoice.userId, userId)
  );

  if (index === -1) return null;

  all[index] = {
    ...all[index],
    cloudId: cloudId ?? all[index].cloudId,
    synced: true,
    syncedAt,
  };

  await setLocal(INVOICES_STORAGE_KEY, all);
  return all[index];
}

export async function getNextInvoiceNumber(
  prefix = "INV",
  minimumDigits = 4
): Promise<string> {
  const invoices = await getInvoices();
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedPrefix}-(\\d+)$`, "i");

  const highest = invoices.reduce((max, invoice) => {
    const match = invoice.invoiceNumber.trim().match(pattern);
    if (!match) return max;

    const number = Number(match[1]);
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0);

  return `${prefix}-${String(highest + 1).padStart(minimumDigits, "0")}`;
}

export async function markInvoiceAsSent(
  id: string
): Promise<Invoice | null> {
  const now = new Date().toISOString();

  const updated = await updateInvoice(id, {
    status: "sent",
    sentAt: now,
  });

  if (!updated) return null;

  if (updated.stockReductionTrigger === "sent" && !updated.stockProcessed) {
    return await processInvoiceStock(updated.id);
  }

  return updated;
}

export async function markInvoiceAsPaid(
  id: string,
  amountPaid?: number
): Promise<Invoice | null> {
  const invoice = await getInvoiceById(id);
  if (!invoice) return null;

  const paidAmount =
    amountPaid === undefined ? invoice.grandTotal : Math.max(0, amountPaid);

  const updated = await updateInvoice(invoice.id, {
    amountPaid: paidAmount,
    status:
      paidAmount >= invoice.grandTotal ? "paid" : "partially_paid",
    paidAt:
      paidAmount >= invoice.grandTotal
        ? new Date().toISOString()
        : invoice.paidAt,
  });

  if (!updated) return null;

  if (updated.stockReductionTrigger === "paid" && !updated.stockProcessed) {
    return await processInvoiceStock(updated.id);
  }

  return updated;
}

/**
 * Reduces inventory for stock-backed invoice lines and creates activity-log
 * records. Custom products and service lines never affect stock.
 *
 * The operation validates every stock line before writing anything, preventing
 * a partially processed invoice when one item has insufficient quantity.
 */
export async function processInvoiceStock(
  invoiceId: string
): Promise<Invoice> {
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    throw new Error("Invoice was not found.");
  }

  if (invoice.stockProcessed) {
    return invoice;
  }

  const stockLines = invoice.items.filter(
    (item) =>
      item.sourceType === "stock" &&
      item.stockId &&
      !item.stockProcessed &&
      item.quantity > 0
  );

  if (stockLines.length === 0) {
    const updated = await updateInvoice(invoice.id, {
      stockProcessed: true,
    });

    if (!updated) throw new Error("Unable to update invoice.");
    return updated;
  }

  const allStock = await getStockItems();

  for (const line of stockLines) {
    const stockItem = allStock.find((item) => item.id === line.stockId);

    if (!stockItem) {
      throw new Error(
        `Stock item "${line.productName}" could not be found.`
      );
    }

    if (stockItem.quantity < line.quantity) {
      throw new Error(
        `Not enough stock for "${line.productName}". Available: ${stockItem.quantity}, required: ${line.quantity}.`
      );
    }
  }

  const updatedItems = invoice.items.map((item) => ({ ...item }));

  for (const line of stockLines) {
    const stockIndex = allStock.findIndex((item) => item.id === line.stockId);
    const invoiceItemIndex = updatedItems.findIndex(
      (item) => item.id === line.id
    );

    const newBalance = allStock[stockIndex].quantity - line.quantity;
    allStock[stockIndex] = {
      ...allStock[stockIndex],
      quantity: newBalance,
      synced: false,
      syncedAt: "",
    };

    await saveStockMovement({
      stockItemId: allStock[stockIndex].id,
      itemName: allStock[stockIndex].name,
      type: "OUT",
      quantity: line.quantity,
      source: "INVOICE",
      sourceLabel: `Invoice ${invoice.invoiceNumber}`,
      balanceAfter: newBalance,
      referenceId: invoice.id,
      referenceType: "INVOICE",
      note: invoice.customerName
        ? `Customer: ${invoice.customerName}`
        : undefined,
    });

    updatedItems[invoiceItemIndex] = {
      ...updatedItems[invoiceItemIndex],
      stockProcessed: true,
      stockProcessedQuantity: line.quantity,
    };
  }

  await setLocal("stock", allStock);

  const updatedInvoice = await updateInvoice(invoice.id, {
    items: updatedItems,
    stockProcessed: true,
  });

  if (!updatedInvoice) {
    throw new Error("Stock was updated, but the invoice could not be updated.");
  }

  return updatedInvoice;
}

/**
 * Moves a guest user's invoices to a newly authenticated user.
 */
export async function linkGuestInvoicesToUser(userId: string): Promise<void> {
  const all = await getLocal<Invoice>(INVOICES_STORAGE_KEY);
  let changed = false;

  const updated = all.map((invoice) => {
    if (invoice.userId !== "guest") return invoice;

    changed = true;
    return {
      ...invoice,
      userId,
      synced: false,
      syncedAt: "",
      updatedAt: new Date().toISOString(),
    };
  });

  if (changed) {
    await setLocal(INVOICES_STORAGE_KEY, updated);
  }
}