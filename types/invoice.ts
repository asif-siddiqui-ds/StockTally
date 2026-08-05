// // types/invoice.ts
// export type InvoiceStatus =
//   | "draft"
//   | "sent"
//   | "unpaid"
//   | "partially_paid"
//   | "paid"
//   | "overdue"
//   | "cancelled";

// export type InvoiceItemSource = "stock" | "custom" | "service";
// export type DiscountType = "percentage" | "fixed";
// export type StockReductionTrigger = "created" | "sent" | "paid" | "never";

// export type InvoicePaymentMethod =
//   | "cash"
//   | "card"
//   | "bank_transfer"
//   | "cheque"
//   | "online"
//   | "other";

// export interface InvoiceItem {
//   id: string;
//   cloudId?: string;

//   sourceType: InvoiceItemSource;
//   stockId?: string;

//   productName: string;
//   sku?: string;
//   description?: string;

//   quantity: number;
//   unit?: string;
//   unitPrice: number;

//   discountType?: DiscountType;
//   discountValue: number;
//   discountAmount: number;

//   taxRate: number;
//   taxName?: string;
//   taxExempt: boolean;

//   subtotal: number;
//   taxableAmount: number;
//   taxAmount: number;
//   total: number;

//   stockProcessed: boolean;
//   stockProcessedQuantity: number;
// }

// export interface Invoice {
//   id: string;
//   cloudId?: string;
//   userId?: string | null;

//   invoiceNumber: string;
//   status: InvoiceStatus;

//   invoiceDate: string;
//   dueDate?: string;

//   purchaseOrderNumber?: string;
//   reference?: string;

//   customerName: string;
//   customerCompany?: string;
//   customerEmail?: string;
//   customerPhone?: string;

//   billingAddress?: string;
//   shippingAddress?: string;
//   customerTaxNumber?: string;

//   currencyCode: string;
//   currencySymbol: string;
//   locale: string;

//   taxEnabled: boolean;
//   taxLabel: string;
//   pricesIncludeTax: boolean;

//   items: InvoiceItem[];

//   subtotal: number;
//   itemDiscountTotal: number;

//   invoiceDiscountType?: DiscountType;
//   invoiceDiscountValue: number;
//   invoiceDiscountAmount: number;

//   shippingAmount: number;
//   taxTotal: number;
//   roundingAdjustment: number;
//   grandTotal: number;

//   amountPaid: number;
//   balanceDue: number;

//   paymentMethod?: InvoicePaymentMethod;
//   paymentDate?: string;
//   paymentReference?: string;

//   notes?: string;
//   paymentTerms?: string;
//   paymentInstructions?: string;
//   termsAndConditions?: string;

//   stockReductionTrigger: StockReductionTrigger;
//   stockProcessed: boolean;

//   createdAt: string;
//   updatedAt: string;
//   sentAt?: string;
//   paidAt?: string;
//   cancelledAt?: string;

//   synced: boolean;
//   syncedAt?: string;
// }

// export interface CreateInvoiceInput {
//   invoiceNumber: string;
//   invoiceDate: string;
//   dueDate?: string;

//   customerName: string;
//   customerCompany?: string;
//   customerEmail?: string;
//   customerPhone?: string;

//   billingAddress?: string;
//   shippingAddress?: string;
//   customerTaxNumber?: string;

//   purchaseOrderNumber?: string;
//   reference?: string;

//   currencyCode: string;
//   currencySymbol: string;
//   locale: string;

//   taxEnabled: boolean;
//   taxLabel: string;
//   pricesIncludeTax: boolean;

//   items: InvoiceItem[];

//   invoiceDiscountType?: DiscountType;
//   invoiceDiscountValue?: number;

//   shippingAmount?: number;
//   roundingAdjustment?: number;

//   status?: InvoiceStatus;
//   amountPaid?: number;
//   paymentMethod?: InvoicePaymentMethod;
//   paymentDate?: string;
//   paymentReference?: string;

//   notes?: string;
//   paymentTerms?: string;
//   paymentInstructions?: string;
//   termsAndConditions?: string;

//   stockReductionTrigger?: StockReductionTrigger;
// }

// types/invoice.ts
export type InvoiceStatus =
  | "draft"
  | "sent"
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type InvoiceItemSource = "stock" | "custom" | "service";
export type DiscountType = "percentage" | "fixed";
export type StockReductionTrigger = "created" | "sent" | "paid" | "never";

export type InvoicePaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "cheque"
  | "online"
  | "other";

export interface InvoicePayment {
  /**
   * Local payment ID.
   */
  id: string;

  /**
   * Appwrite payment document ID after cloud sync.
   */
  cloudId?: string;

  invoiceId: string;
  userId?: string | null;

  amount: number;
  method: InvoicePaymentMethod;
  paymentDate: string;

  reference?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;

  synced: boolean;
  syncedAt?: string;
}

export interface CreateInvoicePaymentInput {
  invoiceId: string;
  amount: number;
  method: InvoicePaymentMethod;
  paymentDate: string;
  reference?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  cloudId?: string;

  sourceType: InvoiceItemSource;
  stockId?: string;

  productName: string;
  sku?: string;
  description?: string;

  quantity: number;
  unit?: string;
  unitPrice: number;

  discountType?: DiscountType;
  discountValue: number;
  discountAmount: number;

  taxRate: number;
  taxName?: string;
  taxExempt: boolean;

  subtotal: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;

  stockProcessed: boolean;
  stockProcessedQuantity: number;
}

export interface Invoice {
  id: string;
  cloudId?: string;
  userId?: string | null;

  invoiceNumber: string;
  status: InvoiceStatus;

  invoiceDate: string;
  dueDate?: string;

  purchaseOrderNumber?: string;
  reference?: string;

  customerId?: string;

  customerName: string;
  customerCompany?: string;
  customerEmail?: string;
  customerPhone?: string;

  billingAddress?: string;
  shippingAddress?: string;
  customerTaxNumber?: string;

  currencyCode: string;
  currencySymbol: string;
  locale: string;

  taxEnabled: boolean;
  taxLabel: string;
  pricesIncludeTax: boolean;

  items: InvoiceItem[];

  subtotal: number;
  itemDiscountTotal: number;

  invoiceDiscountType?: DiscountType;
  invoiceDiscountValue: number;
  invoiceDiscountAmount: number;

  shippingAmount: number;
  taxTotal: number;
  roundingAdjustment: number;
  grandTotal: number;

  amountPaid: number;
  balanceDue: number;

  /**
   * Full payment history. During migration this is optional so existing
   * locally stored invoices continue to load safely.
   */
  payments?: InvoicePayment[];

  /**
   * Legacy single-payment fields retained temporarily while existing
   * create/edit screens are migrated to InvoicePayment records.
   */
  paymentMethod?: InvoicePaymentMethod;
  paymentDate?: string;
  paymentReference?: string;

  notes?: string;
  paymentTerms?: string;
  paymentInstructions?: string;
  termsAndConditions?: string;

  stockReductionTrigger: StockReductionTrigger;
  stockProcessed: boolean;

  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  paidAt?: string;
  cancelledAt?: string;

  synced: boolean;
  syncedAt?: string;
}

export interface CreateInvoiceInput {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;

  customerId?: string;

  customerName: string;
  customerCompany?: string;
  customerEmail?: string;
  customerPhone?: string;

  billingAddress?: string;
  shippingAddress?: string;
  customerTaxNumber?: string;

  purchaseOrderNumber?: string;
  reference?: string;

  currencyCode: string;
  currencySymbol: string;
  locale: string;

  taxEnabled: boolean;
  taxLabel: string;
  pricesIncludeTax: boolean;

  items: InvoiceItem[];

  invoiceDiscountType?: DiscountType;
  invoiceDiscountValue?: number;

  shippingAmount?: number;
  roundingAdjustment?: number;

  status?: InvoiceStatus;
  amountPaid?: number;
  paymentMethod?: InvoicePaymentMethod;
  paymentDate?: string;
  paymentReference?: string;

  notes?: string;
  paymentTerms?: string;
  paymentInstructions?: string;
  termsAndConditions?: string;

  stockReductionTrigger?: StockReductionTrigger;
}
8