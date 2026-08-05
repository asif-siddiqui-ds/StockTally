// types/supplier.ts

export type SupplierType =
  | "business"
  | "individual";

export type SupplierPaymentTerms =
  | "due_on_receipt"
  | "net_7"
  | "net_14"
  | "net_30"
  | "net_45"
  | "net_60"
  | "custom";

export interface Supplier {
  id: string;
  cloudId?: string;
  userId: string;

  type: SupplierType;

  companyName?: string;
  contactName: string;

  email?: string;
  phone?: string;
  website?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;

  taxNumber?: string;

  currencyCode?: string;
  currencySymbol?: string;
  locale?: string;

  paymentTerms: SupplierPaymentTerms;
  customPaymentTermDays?: number;

  openingBalance?: number;
  creditLimit?: number;

  notes?: string;
  supplierCode?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  synced: boolean;
  syncedAt?: string;
}

export interface CreateSupplierInput {
  userId: string;

  type?: SupplierType;

  companyName?: string;
  contactName: string;

  email?: string;
  phone?: string;
  website?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;

  taxNumber?: string;

  currencyCode?: string;
  currencySymbol?: string;
  locale?: string;

  paymentTerms?: SupplierPaymentTerms;
  customPaymentTermDays?: number;

  openingBalance?: number;
  creditLimit?: number;

  notes?: string;
  supplierCode?: string;

  isActive?: boolean;
}

export interface UpdateSupplierInput {
  type?: SupplierType;

  companyName?: string;
  contactName?: string;

  email?: string;
  phone?: string;
  website?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;

  taxNumber?: string;

  currencyCode?: string;
  currencySymbol?: string;
  locale?: string;

  paymentTerms?: SupplierPaymentTerms;
  customPaymentTermDays?: number;

  openingBalance?: number;
  creditLimit?: number;

  notes?: string;
  supplierCode?: string;

  isActive?: boolean;
}

/**
 * Values used directly by SupplierForm.
 *
 * Unlike Supplier, all text fields are required here so
 * React Native TextInput values are never undefined.
 */
export interface SupplierFormValues {
  userId: string;
  type: SupplierType;

  companyName: string;
  contactName: string;
  supplierCode: string;

  email: string;
  phone: string;
  website: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;

  taxNumber: string;

  currencyCode: string;
  currencySymbol: string;
  locale: string;

  paymentTerms: SupplierPaymentTerms;
  customPaymentTermDays: number;

  openingBalance: number;
  creditLimit: number;

  notes: string;
  isActive: boolean;
}

export interface SupplierSummary {
  supplierId: string;
  supplierName: string;

  purchaseCount: number;

  totalPurchased: number;
  totalPaid: number;

  outstandingBalance: number;
  overdueBalance: number;

  lastPurchaseDate?: string;
  lastPaymentDate?: string;
}

export interface SupplierOption {
  label: string;
  value: string;
  supplier: Supplier;
}

export const DEFAULT_SUPPLIER_PAYMENT_TERMS:
  SupplierPaymentTerms = "net_30";

export const emptySupplierFormValues:
  SupplierFormValues = {
  userId: "guest",
  type: "business",

  companyName: "",
  contactName: "",
  supplierCode: "",

  email: "",
  phone: "",
  website: "",

  addressLine1: "",
  addressLine2: "",
  city: "",
  county: "",
  postcode: "",
  country: "",

  taxNumber: "",

  currencyCode: "GBP",
  currencySymbol: "£",
  locale: "en-GB",

  paymentTerms:
    DEFAULT_SUPPLIER_PAYMENT_TERMS,

  customPaymentTermDays: 30,

  openingBalance: 0,
  creditLimit: 0,

  notes: "",
  isActive: true,
};

export const SUPPLIER_PAYMENT_TERM_LABELS:
  Record<SupplierPaymentTerms, string> = {
  due_on_receipt: "Due on receipt",
  net_7: "7 days",
  net_14: "14 days",
  net_30: "30 days",
  net_45: "45 days",
  net_60: "60 days",
  custom: "Custom",
};

export const getSupplierDisplayName = (
  supplier: Supplier
): string => {
  const companyName =
    supplier.companyName?.trim();

  const contactName =
    supplier.contactName?.trim();

  if (companyName) {
    return companyName;
  }

  if (contactName) {
    return contactName;
  }

  return "Unnamed supplier";
};

export const getSupplierSecondaryLabel = (
  supplier: Supplier
): string | undefined => {
  const companyName =
    supplier.companyName?.trim();

  const contactName =
    supplier.contactName?.trim();

  if (companyName && contactName) {
    return contactName;
  }

  if (supplier.email?.trim()) {
    return supplier.email.trim();
  }

  if (supplier.phone?.trim()) {
    return supplier.phone.trim();
  }

  return undefined;
};

export const getSupplierPaymentTermDays = (
  supplier: Pick<
    Supplier,
    | "paymentTerms"
    | "customPaymentTermDays"
  >
): number => {
  switch (supplier.paymentTerms) {
    case "due_on_receipt":
      return 0;

    case "net_7":
      return 7;

    case "net_14":
      return 14;

    case "net_30":
      return 30;

    case "net_45":
      return 45;

    case "net_60":
      return 60;

    case "custom":
      return Math.max(
        0,
        Number(
          supplier.customPaymentTermDays ||
            0
        )
      );

    default:
      return 30;
  }
};

export const calculateSupplierDueDate = (
  purchaseDate: string | Date,
  supplier: Pick<
    Supplier,
    | "paymentTerms"
    | "customPaymentTermDays"
  >
): string => {
  const date =
    purchaseDate instanceof Date
      ? new Date(purchaseDate)
      : new Date(purchaseDate);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  date.setDate(
    date.getDate() +
      getSupplierPaymentTermDays(
        supplier
      )
  );

  return date.toISOString();
};