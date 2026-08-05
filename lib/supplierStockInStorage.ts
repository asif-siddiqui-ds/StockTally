import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStockItems, StockItem } from "@/lib/storage";
import {
  SupplierPaymentStatus,
  SupplierStockIn,
} from "@/types/supplierStockIn";

const STORAGE_KEY = "stocktally_supplier_stock_in";
const MIGRATION_KEY = "stocktally_supplier_stock_in_migration_v1";

const createId = (): string =>
  `supplier_stock_in_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

const normaliseNumber = (value: unknown): number => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const saveAllSupplierStockInRecords = async (
  records: SupplierStockIn[],
): Promise<void> => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records),
  );
};

export const getSupplierStockInRecords =
  async (): Promise<SupplierStockIn[]> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);

      if (!raw) return [];

      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) return [];

      return (parsed as SupplierStockIn[]).sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      );
    } catch (error) {
      console.error(
        "Failed to load supplier stock-in records:",
        error,
      );
      return [];
    }
  };

export type SaveSupplierStockInInput = Omit<
  SupplierStockIn,
  "id" | "synced" | "syncedAt"
>;

export const saveSupplierStockIn = async (
  input: SaveSupplierStockInInput,
): Promise<SupplierStockIn> => {
  const records = await getSupplierStockInRecords();

  const quantity = normaliseNumber(input.quantity);
  const unitCost = normaliseNumber(input.unitCost);

  const record: SupplierStockIn = {
    ...input,
    id: createId(),
    cloudId: undefined,
    quantity,
    unitCost,
    totalCost:
      input.totalCost !== undefined
        ? normaliseNumber(input.totalCost)
        : quantity * unitCost,
    paymentStatus: input.paymentStatus,
    date: input.date || new Date().toISOString(),
    paidAt:
      input.paymentStatus === "paid"
        ? input.paidAt || new Date().toISOString()
        : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false,
    syncedAt: "",
  };

  await saveAllSupplierStockInRecords([...records, record]);
  return record;
};

export const getSupplierStockInById = async (
  recordId: string,
): Promise<SupplierStockIn | null> => {
  const records = await getSupplierStockInRecords();
  return records.find((record) => record.id === recordId) || null;
};

export const getStockInBySupplier = async (
  supplierId: string,
  supplierName?: string,
): Promise<SupplierStockIn[]> => {
  const records = await getSupplierStockInRecords();
  const normalisedName =
    supplierName?.trim().toLowerCase() || "";

  return records.filter((record) => {
    if (
      record.supplierId &&
      record.supplierId === supplierId
    ) {
      return true;
    }

    return (
      !record.supplierId &&
      Boolean(normalisedName) &&
      record.supplierName?.trim().toLowerCase() ===
        normalisedName
    );
  });
};

export const updateSupplierStockInStatus = async (
  recordId: string,
  paymentStatus: SupplierPaymentStatus,
): Promise<SupplierStockIn> => {
  const records = await getSupplierStockInRecords();
  const index = records.findIndex(
    (record) => record.id === recordId,
  );

  if (index === -1) {
    throw new Error("Stock-in record not found.");
  }

  const updated: SupplierStockIn = {
    ...records[index],
    paymentStatus,
    paidAt:
      paymentStatus === "paid"
        ? new Date().toISOString()
        : undefined,
    updatedAt: new Date().toISOString(),
    synced: false,
    syncedAt: "",
  };

  const next = [...records];
  next[index] = updated;
  await saveAllSupplierStockInRecords(next);

  return updated;
};

export const deleteSupplierStockIn = async (
  recordId: string,
): Promise<void> => {
  const records = await getSupplierStockInRecords();
  await saveAllSupplierStockInRecords(
    records.filter((record) => record.id !== recordId),
  );
};

/**
 * Creates one opening stock-in record per legacy StockItem.
 *
 * This cannot reconstruct separate historic deliveries. It only creates
 * an opening supplier balance using the current quantity, current cost
 * price and legacy paid flag.
 */
export const migrateLegacySupplierStockInOnce =
  async (): Promise<number> => {
    const completed = await AsyncStorage.getItem(MIGRATION_KEY);

    if (completed === "true") return 0;

    const [stockItems, existingRecords] = await Promise.all([
      getStockItems(),
      getSupplierStockInRecords(),
    ]);

    const migrated: SupplierStockIn[] = [];

    for (const item of stockItems as StockItem[]) {
      const alreadyExists = existingRecords.some(
        (record) => record.stockItemId === item.id,
      );

      if (alreadyExists) continue;

      const hasSupplier =
        Boolean(item.supplierId) ||
        Boolean(item.supplierName?.trim());

      if (!hasSupplier) continue;

      const quantity = normaliseNumber(item.quantity);
      const unitCost = normaliseNumber(item.costPrice);

      const legacyPaid =
        (item as StockItem & { paid?: boolean }).paid !== false;

      migrated.push({
        id: createId(),
        stockItemId: item.id,
        itemName: item.name,
        supplierId: item.supplierId || undefined,
        supplierName: item.supplierName || "",
        quantity,
        unit: item.unit || "pcs",
        unitCost,
        totalCost: quantity * unitCost,
        paymentStatus: legacyPaid ? "paid" : "unpaid",
        date:
          (item as StockItem & { date?: string }).date ||
          new Date().toISOString(),
        paidAt: legacyPaid ? new Date().toISOString() : undefined,
        note: "Migrated from legacy stock record",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
        syncedAt: "",
      });
    }

    if (migrated.length > 0) {
      await saveAllSupplierStockInRecords([...existingRecords, ...migrated]);
    }

    await AsyncStorage.setItem(MIGRATION_KEY, "true");
    return migrated.length;
  };


export const markSupplierStockInSynced = async (
  id: string,
  cloudId: string,
  syncedAt = new Date().toISOString(),
): Promise<void> => {
  const records = await getSupplierStockInRecords();

  await saveAllSupplierStockInRecords(
    records.map((record) =>
      record.id === id
        ? {
            ...record,
            cloudId,
            synced: true,
            syncedAt,
          }
        : record,
    ),
  );
};

export const replaceSupplierStockInForUser = async (
  userId: string,
  cloudRecords: SupplierStockIn[],
): Promise<void> => {
  const localRecords = await getSupplierStockInRecords();

  const otherUsers = localRecords.filter(
    (record) =>
      record.userId &&
      record.userId !== userId &&
      record.userId !== "guest",
  );

  const localUnsynced = localRecords.filter(
    (record) =>
      (!record.userId ||
        record.userId === userId ||
        record.userId === "guest") &&
      !record.synced,
  );

  const cloudLocalIds = new Set(
    cloudRecords.map((record) => record.id),
  );

  const preservedUnsynced = localUnsynced.filter(
    (record) => !cloudLocalIds.has(record.id),
  );

  await saveAllSupplierStockInRecords([
    ...otherUsers,
    ...preservedUnsynced,
    ...cloudRecords,
  ]);
};
