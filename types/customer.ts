// types/customer.ts

export type CustomerType = "business" | "individual";

export type CustomerPaymentTerms =
  | "due_on_receipt"
  | "net_7"
  | "net_14"
  | "net_30"
  | "net_45"
  | "net_60"
  | "custom";

export interface Customer {
  /**
   * Stable local identifier used by invoices and local storage.
   */
  id: string;

  /**
   * Appwrite document ID once the customer has been synced.
   */
  cloudId?: string;

  /**
   * Owner of this customer record.
   * Guest records may temporarily use "guest" until account migration.
   */
  userId: string;

  type: CustomerType;

  /**
   * Business/trading name.
   * For an individual customer this may be left blank.
   */
  companyName?: string;

  /**
   * Main customer or contact person name.
   */
  contactName: string;

  email?: string;
  phone?: string;

  /**
   * First line and optional second line are kept separately so invoice
   * formatting remains predictable.
   */
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;

  /**
   * Optional VAT/GST/tax registration number.
   */
  taxNumber?: string;

  /**
   * ISO currency code and display symbol used as this customer's defaults.
   */
  currencyCode?: string;
  currencySymbol?: string;
  locale?: string;

  paymentTerms: CustomerPaymentTerms;

  /**
   * Used only when paymentTerms === "custom".
   */
  customPaymentTermDays?: number;

  notes?: string;

  /**
   * Optional internal reference, account code or customer number.
   */
  customerCode?: string;

  /**
   * Allows a customer to be hidden without deleting invoice history.
   */
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  /**
   * Offline-first sync metadata.
   */
  synced: boolean;
  syncedAt?: string;
}

export interface CreateCustomerInput {
  userId: string;
  type?: CustomerType;
  companyName?: string;
  contactName: string;
  email?: string;
  phone?: string;
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
  paymentTerms?: CustomerPaymentTerms;
  customPaymentTermDays?: number;
  notes?: string;
  customerCode?: string;
  isActive?: boolean;
}

export interface UpdateCustomerInput {
  type?: CustomerType;
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
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
  paymentTerms?: CustomerPaymentTerms;
  customPaymentTermDays?: number;
  notes?: string;
  customerCode?: string;
  isActive?: boolean;
}

export interface CustomerSummary {
  customerId: string;
  customerName: string;
  invoiceCount: number;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  overdueBalance: number;
  lastInvoiceDate?: string;
  lastPaymentDate?: string;
}

export interface CustomerOption {
  label: string;
  value: string;
  customer: Customer;
}

export const DEFAULT_CUSTOMER_PAYMENT_TERMS: CustomerPaymentTerms = "net_30";

export const CUSTOMER_PAYMENT_TERM_LABELS: Record<
  CustomerPaymentTerms,
  string
> = {
  due_on_receipt: "Due on receipt",
  net_7: "7 days",
  net_14: "14 days",
  net_30: "30 days",
  net_45: "45 days",
  net_60: "60 days",
  custom: "Custom",
};

export const getCustomerDisplayName = (customer: Customer): string => {
  const companyName = customer.companyName?.trim();
  const contactName = customer.contactName?.trim();

  if (companyName) return companyName;
  if (contactName) return contactName;

  return "Unnamed customer";
};

export const getCustomerSecondaryLabel = (
  customer: Customer
): string | undefined => {
  const companyName = customer.companyName?.trim();
  const contactName = customer.contactName?.trim();

  if (companyName && contactName) return contactName;
  if (customer.email?.trim()) return customer.email.trim();
  if (customer.phone?.trim()) return customer.phone.trim();

  return undefined;
};

export const getCustomerPaymentTermDays = (
  customer: Pick<Customer, "paymentTerms" | "customPaymentTermDays">
): number => {
  switch (customer.paymentTerms) {
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
      return Math.max(0, Number(customer.customPaymentTermDays || 0));
    default:
      return 30;
  }
};

export const calculateCustomerDueDate = (
  invoiceDate: string | Date,
  customer: Pick<Customer, "paymentTerms" | "customPaymentTermDays">
): string => {
  const date =
    invoiceDate instanceof Date ? new Date(invoiceDate) : new Date(invoiceDate);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  date.setDate(date.getDate() + getCustomerPaymentTermDays(customer));
  return date.toISOString();
};
