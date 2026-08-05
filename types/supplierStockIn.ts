export type SupplierPaymentStatus = "paid" | "unpaid";

export interface SupplierStockIn {
  id: string;
  cloudId?: string;

  stockItemId: string;
  itemName: string;

  supplierId?: string;
  supplierName?: string;

  quantity: number;
  unit?: string;

  unitCost: number;
  totalCost: number;

  paymentStatus: SupplierPaymentStatus;

  date: string;
  paidAt?: string;

  note?: string;
  userId?: string;

  createdAt?: string;
  updatedAt?: string;

  synced: boolean;
  syncedAt?: string;
}
