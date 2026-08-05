// // lib/appwriteInvoiceService.ts
// import { database } from "@/appwrite";
// import type { Invoice, InvoiceItem } from "@/types/invoice";
// import { ID, Permission, Query, Role } from "react-native-appwrite";
// import { getLocal, setLocal } from "./storage";

// const DATABASE_ID =
//   process.env.EXPO_PUBLIC_DATABASE_ID || "68215d2a00260d43fd49";

// const INVOICES_COLLECTION_ID =
//   process.env.EXPO_PUBLIC_INVOICES_COLLECTION_ID || "invoices";

// const INVOICE_ITEMS_COLLECTION_ID =
//   process.env.EXPO_PUBLIC_INVOICE_ITEMS_COLLECTION_ID || "invoiceItems";

// const INVOICE_STORAGE_KEY = "invoices";

// const nowISO = (): string => new Date().toISOString();

// const invoicePermissions = (userId: string) => [
//   Permission.read(Role.user(userId)),
//   Permission.update(Role.user(userId)),
//   Permission.delete(Role.user(userId)),
// ];

// const removeAppwriteSystemFields = <T extends Record<string, any>>(
//   value: T
// ): Record<string, any> => {
//   const {
//     $id,
//     $createdAt,
//     $updatedAt,
//     $permissions,
//     $databaseId,
//     $collectionId,
//     ...clean
//   } = value;

//   return clean;
// };



// /* -------------------------------------------------------------------------- */
// /*                          DOCUMENT SERIALISATION                            */
// /* -------------------------------------------------------------------------- */

// function invoiceToDocument(invoice: Invoice, userId: string) {
//   return {
//     localId: invoice.id,
//     userId,

//     invoiceNumber: invoice.invoiceNumber,
//     status: invoice.status,

//     invoiceDate: invoice.invoiceDate,
//     dueDate: invoice.dueDate || null,

//     purchaseOrderNumber: invoice.purchaseOrderNumber || null,
//     reference: invoice.reference || null,

//     customerName: invoice.customerName,
//     customerCompany: invoice.customerCompany || null,
//     customerEmail: invoice.customerEmail || null,
//     customerPhone: invoice.customerPhone || null,
//     billingAddress: invoice.billingAddress || null,
//     shippingAddress: invoice.shippingAddress || null,
//     customerTaxNumber: invoice.customerTaxNumber || null,

//     currencyCode: invoice.currencyCode,
//     currencySymbol: invoice.currencySymbol,
//     locale: invoice.locale,

//     taxEnabled: invoice.taxEnabled,
//     taxLabel: invoice.taxLabel,
//     pricesIncludeTax: invoice.pricesIncludeTax,

//     subtotal: invoice.subtotal,
//     itemDiscountTotal: invoice.itemDiscountTotal,
//     invoiceDiscountType: invoice.invoiceDiscountType || null,
//     invoiceDiscountValue: invoice.invoiceDiscountValue,
//     invoiceDiscountAmount: invoice.invoiceDiscountAmount,

//     shippingAmount: invoice.shippingAmount,
//     taxTotal: invoice.taxTotal,
//     roundingAdjustment: invoice.roundingAdjustment,
//     grandTotal: invoice.grandTotal,
//     amountPaid: invoice.amountPaid,
//     balanceDue: invoice.balanceDue,

//     paymentMethod: invoice.paymentMethod || null,
//     paymentDate: invoice.paymentDate || null,
//     paymentReference: invoice.paymentReference || null,

//     notes: invoice.notes || null,
//     paymentTerms: invoice.paymentTerms || null,
//     paymentInstructions: invoice.paymentInstructions || null,
//     termsAndConditions: invoice.termsAndConditions || null,

//     stockReductionTrigger: invoice.stockReductionTrigger,
//     stockProcessed: invoice.stockProcessed,

//     createdAt: invoice.createdAt,
//     updatedAt: invoice.updatedAt,
//     sentAt: invoice.sentAt || null,
//     paidAt: invoice.paidAt || null,
//     cancelledAt: invoice.cancelledAt || null,

//     syncedAt: nowISO(),
//   };
// }

// function itemToDocument(
//   item: InvoiceItem,
//   invoice: Invoice,
//   invoiceCloudId: string,
//   userId: string
// ) {
//   return {
//     localId: item.id,
//     invoiceLocalId: invoice.id,
//     invoiceCloudId,
//     userId,

//     sourceType: item.sourceType,
//     stockId: item.stockId || null,

//     productName: item.productName,
//     sku: item.sku || null,
//     description: item.description || null,

//     quantity: item.quantity,
//     unit: item.unit || null,
//     unitPrice: item.unitPrice,

//     discountType: item.discountType || null,
//     discountValue: item.discountValue,
//     discountAmount: item.discountAmount,

//     taxRate: item.taxRate,
//     taxName: item.taxName || null,
//     taxExempt: item.taxExempt,

//     subtotal: item.subtotal,
//     taxableAmount: item.taxableAmount,
//     taxAmount: item.taxAmount,
//     total: item.total,

//     stockProcessed: item.stockProcessed,
//     stockProcessedQuantity: item.stockProcessedQuantity,

//     createdAt: invoice.createdAt,
//     updatedAt: invoice.updatedAt,
//   };
// }

// function documentToInvoice(
//   document: Record<string, any>,
//   items: InvoiceItem[]
// ): Invoice {
//   return {
//     id: document.localId || document.$id,
//     cloudId: document.$id,
//     userId: document.userId,

//     invoiceNumber: document.invoiceNumber || "",
//     status: document.status || "draft",

//     invoiceDate: document.invoiceDate || document.$createdAt,
//     dueDate: document.dueDate || undefined,

//     purchaseOrderNumber: document.purchaseOrderNumber || undefined,
//     reference: document.reference || undefined,

//     customerName: document.customerName || "",
//     customerCompany: document.customerCompany || undefined,
//     customerEmail: document.customerEmail || undefined,
//     customerPhone: document.customerPhone || undefined,
//     billingAddress: document.billingAddress || undefined,
//     shippingAddress: document.shippingAddress || undefined,
//     customerTaxNumber: document.customerTaxNumber || undefined,

//     currencyCode: document.currencyCode || "GBP",
//     currencySymbol: document.currencySymbol || "£",
//     locale: document.locale || "en-GB",

//     taxEnabled: Boolean(document.taxEnabled),
//     taxLabel: document.taxLabel || "Tax",
//     pricesIncludeTax: Boolean(document.pricesIncludeTax),

//     items,

//     subtotal: Number(document.subtotal || 0),
//     itemDiscountTotal: Number(document.itemDiscountTotal || 0),
//     invoiceDiscountType: document.invoiceDiscountType || undefined,
//     invoiceDiscountValue: Number(document.invoiceDiscountValue || 0),
//     invoiceDiscountAmount: Number(document.invoiceDiscountAmount || 0),

//     shippingAmount: Number(document.shippingAmount || 0),
//     taxTotal: Number(document.taxTotal || 0),
//     roundingAdjustment: Number(document.roundingAdjustment || 0),
//     grandTotal: Number(document.grandTotal || 0),
//     amountPaid: Number(document.amountPaid || 0),
//     balanceDue: Number(document.balanceDue || 0),

//     paymentMethod: document.paymentMethod || undefined,
//     paymentDate: document.paymentDate || undefined,
//     paymentReference: document.paymentReference || undefined,

//     notes: document.notes || undefined,
//     paymentTerms: document.paymentTerms || undefined,
//     paymentInstructions: document.paymentInstructions || undefined,
//     termsAndConditions: document.termsAndConditions || undefined,

//     stockReductionTrigger: document.stockReductionTrigger || "sent",
//     stockProcessed: Boolean(document.stockProcessed),

//     createdAt: document.createdAt || document.$createdAt,
//     updatedAt: document.updatedAt || document.$updatedAt,
//     sentAt: document.sentAt || undefined,
//     paidAt: document.paidAt || undefined,
//     cancelledAt: document.cancelledAt || undefined,

//     synced: true,
//     syncedAt: document.syncedAt || nowISO(),
//   };
// }

// function documentToInvoiceItem(document: Record<string, any>): InvoiceItem {
//   return {
//     id: document.localId || document.$id,
//     cloudId: document.$id,

//     sourceType: document.sourceType || "custom",
//     stockId: document.stockId || undefined,

//     productName: document.productName || "",
//     sku: document.sku || undefined,
//     description: document.description || undefined,

//     quantity: Number(document.quantity || 0),
//     unit: document.unit || undefined,
//     unitPrice: Number(document.unitPrice || 0),

//     discountType: document.discountType || undefined,
//     discountValue: Number(document.discountValue || 0),
//     discountAmount: Number(document.discountAmount || 0),

//     taxRate: Number(document.taxRate || 0),
//     taxName: document.taxName || undefined,
//     taxExempt: Boolean(document.taxExempt),

//     subtotal: Number(document.subtotal || 0),
//     taxableAmount: Number(document.taxableAmount || 0),
//     taxAmount: Number(document.taxAmount || 0),
//     total: Number(document.total || 0),

//     stockProcessed: Boolean(document.stockProcessed),
//     stockProcessedQuantity: Number(
//       document.stockProcessedQuantity || 0
//     ),
//   };
// }

// /* -------------------------------------------------------------------------- */
// /*                              CLOUD HELPERS                                 */
// /* -------------------------------------------------------------------------- */

// async function findDocumentByLocalId(
//   collectionId: string,
//   localId: string,
//   userId: string
// ): Promise<Record<string, any> | null> {
//   const response = await database.listDocuments(
//     DATABASE_ID,
//     collectionId,
//     [
//       Query.equal("localId", localId),
//       Query.equal("userId", userId),
//       Query.limit(1),
//     ]
//   );

//   return response.documents[0] || null;
// }

// async function upsertInvoiceDocument(
//   invoice: Invoice,
//   userId: string
// ): Promise<string> {
//   const data = invoiceToDocument(invoice, userId);

//   let cloudId = invoice.cloudId;

//   if (!cloudId) {
//     const existing = await findDocumentByLocalId(
//       INVOICES_COLLECTION_ID,
//       invoice.id,
//       userId
//     );
//     cloudId = existing?.$id;
//   }

//   if (cloudId) {
//     await database.updateDocument(
//       DATABASE_ID,
//       INVOICES_COLLECTION_ID,
//       cloudId,
//       data
//     );

//     return cloudId;
//   }

//   const created = await database.createDocument(
//     DATABASE_ID,
//     INVOICES_COLLECTION_ID,
//     ID.unique(),
//     data,
//     invoicePermissions(userId)
//   );

//   return created.$id;
// }

// async function syncInvoiceItems(
//   invoice: Invoice,
//   invoiceCloudId: string,
//   userId: string
// ): Promise<void> {
//   const cloudResponse = await database.listDocuments(
//     DATABASE_ID,
//     INVOICE_ITEMS_COLLECTION_ID,
//     [
//       Query.equal("invoiceLocalId", invoice.id),
//       Query.equal("userId", userId),
//       Query.limit(5000),
//     ]
//   );

//   const existingByLocalId = new Map(
//     cloudResponse.documents.map((doc) => [doc.localId, doc])
//   );

//   const currentLocalIds = new Set(invoice.items.map((item) => item.id));

//   for (const item of invoice.items) {
//     const data = itemToDocument(
//       item,
//       invoice,
//       invoiceCloudId,
//       userId
//     );

//     const existing =
//       existingByLocalId.get(item.id) ||
//       (item.cloudId
//         ? cloudResponse.documents.find(
//             (document) => document.$id === item.cloudId
//           )
//         : undefined);

//     if (existing?.$id) {
//       await database.updateDocument(
//         DATABASE_ID,
//         INVOICE_ITEMS_COLLECTION_ID,
//         existing.$id,
//         data
//       );
//     } else {
//       await database.createDocument(
//         DATABASE_ID,
//         INVOICE_ITEMS_COLLECTION_ID,
//         ID.unique(),
//         data,
//         invoicePermissions(userId)
//       );
//     }
//   }

//   // Remove cloud lines that the user deleted locally.
//   for (const cloudItem of cloudResponse.documents) {
//     if (!currentLocalIds.has(cloudItem.localId)) {
//       await database.deleteDocument(
//         DATABASE_ID,
//         INVOICE_ITEMS_COLLECTION_ID,
//         cloudItem.$id
//       );
//     }
//   }
// }

// /* -------------------------------------------------------------------------- */
// /*                               UPLOAD                                       */
// /* -------------------------------------------------------------------------- */

// export async function uploadUnsyncedInvoices(
//   userId: string
// ): Promise<void> {
//   const allInvoices =
//     (await getLocal<Invoice>(INVOICE_STORAGE_KEY)) || [];

//   const updated: Invoice[] = [];

//   for (const original of allInvoices) {
//     if (
//       original.userId !== userId &&
//       original.userId !== "guest"
//     ) {
//       updated.push(original);
//       continue;
//     }

//     if (original.synced && original.userId === userId) {
//       updated.push(original);
//       continue;
//     }

//     try {
//       const invoice: Invoice = {
//         ...original,
//         userId,
//       };

//       const cloudId = await upsertInvoiceDocument(invoice, userId);

//       await syncInvoiceItems(invoice, cloudId, userId);

//       updated.push({
//         ...invoice,
//         cloudId,
//         synced: true,
//         syncedAt: nowISO(),
//       });
//     } catch (error) {
//       console.error(
//         `❌ Invoice upload failed (${original.invoiceNumber})`,
//         error
//       );

//       updated.push({
//         ...original,
//         userId:
//           original.userId === "guest" ? userId : original.userId,
//         synced: false,
//       });
//     }
//   }

//   await setLocal(INVOICE_STORAGE_KEY, updated);
// }

// /* -------------------------------------------------------------------------- */
// /*                               DOWNLOAD                                     */
// /* -------------------------------------------------------------------------- */

// export async function downloadCloudInvoices(
//   userId: string
// ): Promise<void> {
//   const localInvoices =
//     (await getLocal<Invoice>(INVOICE_STORAGE_KEY)) || [];

//   const [invoiceResponse, itemResponse] = await Promise.all([
//     database.listDocuments(DATABASE_ID, INVOICES_COLLECTION_ID, [
//       Query.equal("userId", userId),
//       Query.orderDesc("updatedAt"),
//       Query.limit(5000),
//     ]),
//     database.listDocuments(
//       DATABASE_ID,
//       INVOICE_ITEMS_COLLECTION_ID,
//       [
//         Query.equal("userId", userId),
//         Query.limit(5000),
//       ]
//     ),
//   ]);

//   const itemGroups = new Map<string, InvoiceItem[]>();

//   for (const rawDocument of itemResponse.documents) {
//     const document = removeAppwriteSystemFields(rawDocument);
//     const invoiceLocalId = document.invoiceLocalId;

//     if (!itemGroups.has(invoiceLocalId)) {
//       itemGroups.set(invoiceLocalId, []);
//     }

//     itemGroups
//       .get(invoiceLocalId)!
//       .push(documentToInvoiceItem(rawDocument));
//   }

//   const cloudInvoices = invoiceResponse.documents.map((document) =>
//     documentToInvoice(
//       document,
//       itemGroups.get(document.localId || document.$id) || []
//     )
//   );

//   const cloudByLocalId = new Map(
//     cloudInvoices.map((invoice) => [invoice.id, invoice])
//   );

//   const mergedForUser: Invoice[] = [];

//   for (const local of localInvoices.filter(
//     (invoice) => invoice.userId === userId
//   )) {
//     const cloud = cloudByLocalId.get(local.id);

//     // Keep unsynced local edits. Otherwise, accept the cloud version.
//     if (!local.synced) {
//       mergedForUser.push(local);
//       cloudByLocalId.delete(local.id);
//       continue;
//     }

//     if (cloud) {
//       mergedForUser.push(cloud);
//       cloudByLocalId.delete(local.id);
//     } else {
//       mergedForUser.push(local);
//     }
//   }

//   mergedForUser.push(...cloudByLocalId.values());

//   const otherUsers = localInvoices.filter(
//     (invoice) => invoice.userId !== userId
//   );

//   await setLocal(INVOICE_STORAGE_KEY, [
//     ...otherUsers,
//     ...mergedForUser,
//   ]);
// }

// /* -------------------------------------------------------------------------- */
// /*                              COMPLETE SYNC                                 */
// /* -------------------------------------------------------------------------- */

// export async function syncInvoices(userId: string): Promise<void> {
//   console.log("🧾 Syncing invoices...");

//   await uploadUnsyncedInvoices(userId);
//   await downloadCloudInvoices(userId);

//   console.log("✅ Invoice sync complete");
// }

// lib/appwriteInvoiceService.ts
import { database } from "@/appwrite";
import type {
  Invoice,
  InvoiceItem,
  InvoicePayment,
  InvoicePaymentMethod,
} from "@/types/invoice";
import { ID, Permission, Query, Role } from "react-native-appwrite";
import { getLocal, setLocal } from "./storage";

const DATABASE_ID =
  process.env.EXPO_PUBLIC_DATABASE_ID || "68215d2a00260d43fd49";

const INVOICES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_INVOICES_COLLECTION_ID || "invoices";

const INVOICE_ITEMS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_INVOICE_ITEMS_COLLECTION_ID || "invoiceItems";

const INVOICE_PAYMENTS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_INVOICE_PAYMENTS_COLLECTION_ID ||
  "invoicePayments";

const INVOICE_STORAGE_KEY = "invoices";
const INVOICE_PAYMENT_STORAGE_KEY = "invoicePayments";

const nowISO = (): string => new Date().toISOString();

const invoicePermissions = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

const removeAppwriteSystemFields = <T extends Record<string, any>>(
  value: T
): Record<string, any> => {
  const {
    $id,
    $createdAt,
    $updatedAt,
    $permissions,
    $databaseId,
    $collectionId,
    ...clean
  } = value;

  return clean;
};

const roundMoney = (value: number): number =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const sortPaymentsNewestFirst = (
  payments: InvoicePayment[]
): InvoicePayment[] =>
  [...payments].sort(
    (a, b) =>
      new Date(b.paymentDate || b.createdAt).getTime() -
      new Date(a.paymentDate || a.createdAt).getTime()
  );

const derivePaymentStatus = (
  invoice: Invoice,
  amountPaid: number
): Invoice["status"] => {
  if (invoice.status === "cancelled") return "cancelled";
  if (invoice.status === "draft" && amountPaid <= 0) return "draft";

  const grandTotal = roundMoney(invoice.grandTotal);
  const paid = roundMoney(amountPaid);

  if (grandTotal > 0 && paid >= grandTotal) return "paid";
  if (paid > 0) return "partially_paid";
  if (invoice.status === "overdue") return "overdue";

  return invoice.status === "sent" ? "unpaid" : invoice.status;
};

const applyPaymentSummary = (
  invoice: Invoice,
  payments: InvoicePayment[]
): Invoice => {
  const sorted = sortPaymentsNewestFirst(payments);
  const totalPaid = roundMoney(
    sorted.reduce(
      (sum, payment) => sum + Math.max(0, Number(payment.amount || 0)),
      0
    )
  );
  const grandTotal = roundMoney(invoice.grandTotal);
  const amountPaid = Math.min(grandTotal, totalPaid);
  const balanceDue = roundMoney(Math.max(0, grandTotal - amountPaid));
  const status = derivePaymentStatus(invoice, amountPaid);
  const latestPayment = sorted[0];

  return {
    ...invoice,
    payments: sorted,
    amountPaid,
    balanceDue,
    status,
    paidAt:
      status === "paid"
        ? latestPayment?.paymentDate || invoice.paidAt || nowISO()
        : undefined,

    // Legacy fields retained while create/edit/PDF screens are migrated.
    paymentMethod: latestPayment?.method || invoice.paymentMethod,
    paymentDate: latestPayment?.paymentDate || invoice.paymentDate,
    paymentReference:
      latestPayment?.reference || invoice.paymentReference,
  };
};

/* -------------------------------------------------------------------------- */
/*                          DOCUMENT SERIALISATION                            */
/* -------------------------------------------------------------------------- */

function invoiceToDocument(invoice: Invoice, userId: string) {
  return {
    localId: invoice.id,
    userId,

    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,

    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate || null,

    purchaseOrderNumber: invoice.purchaseOrderNumber || null,
    reference: invoice.reference || null,

    customerName: invoice.customerName,
    customerCompany: invoice.customerCompany || null,
    customerEmail: invoice.customerEmail || null,
    customerPhone: invoice.customerPhone || null,
    billingAddress: invoice.billingAddress || null,
    shippingAddress: invoice.shippingAddress || null,
    customerTaxNumber: invoice.customerTaxNumber || null,

    currencyCode: invoice.currencyCode,
    currencySymbol: invoice.currencySymbol,
    locale: invoice.locale,

    taxEnabled: invoice.taxEnabled,
    taxLabel: invoice.taxLabel,
    pricesIncludeTax: invoice.pricesIncludeTax,

    subtotal: invoice.subtotal,
    itemDiscountTotal: invoice.itemDiscountTotal,
    invoiceDiscountType: invoice.invoiceDiscountType || null,
    invoiceDiscountValue: invoice.invoiceDiscountValue,
    invoiceDiscountAmount: invoice.invoiceDiscountAmount,

    shippingAmount: invoice.shippingAmount,
    taxTotal: invoice.taxTotal,
    roundingAdjustment: invoice.roundingAdjustment,
    grandTotal: invoice.grandTotal,
    amountPaid: invoice.amountPaid,
    balanceDue: invoice.balanceDue,

    // Retained temporarily for backward compatibility.
    paymentMethod: invoice.paymentMethod || null,
    paymentDate: invoice.paymentDate || null,
    paymentReference: invoice.paymentReference || null,

    notes: invoice.notes || null,
    paymentTerms: invoice.paymentTerms || null,
    paymentInstructions: invoice.paymentInstructions || null,
    termsAndConditions: invoice.termsAndConditions || null,

    stockReductionTrigger: invoice.stockReductionTrigger,
    stockProcessed: invoice.stockProcessed,

    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
    sentAt: invoice.sentAt || null,
    paidAt: invoice.paidAt || null,
    cancelledAt: invoice.cancelledAt || null,

    syncedAt: nowISO(),
  };
}

function itemToDocument(
  item: InvoiceItem,
  invoice: Invoice,
  invoiceCloudId: string,
  userId: string
) {
  return {
    localId: item.id,
    invoiceLocalId: invoice.id,
    invoiceCloudId,
    userId,

    sourceType: item.sourceType,
    stockId: item.stockId || null,

    productName: item.productName,
    sku: item.sku || null,
    description: item.description || null,

    quantity: item.quantity,
    unit: item.unit || null,
    unitPrice: item.unitPrice,

    discountType: item.discountType || null,
    discountValue: item.discountValue,
    discountAmount: item.discountAmount,

    taxRate: item.taxRate,
    taxName: item.taxName || null,
    taxExempt: item.taxExempt,

    subtotal: item.subtotal,
    taxableAmount: item.taxableAmount,
    taxAmount: item.taxAmount,
    total: item.total,

    stockProcessed: item.stockProcessed,
    stockProcessedQuantity: item.stockProcessedQuantity,

    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

function paymentToDocument(
  payment: InvoicePayment,
  invoiceCloudId: string,
  userId: string
) {
  return {
    localId: payment.id,
    invoiceLocalId: payment.invoiceId,
    invoiceCloudId,
    userId,

    amount: roundMoney(payment.amount),
    method: payment.method,
    paymentDate: payment.paymentDate,
    reference: payment.reference || null,
    notes: payment.notes || null,

    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    syncedAt: nowISO(),
  };
}

function documentToInvoice(
  document: Record<string, any>,
  items: InvoiceItem[],
  payments: InvoicePayment[]
): Invoice {
  const invoice: Invoice = {
    id: document.localId || document.$id,
    cloudId: document.$id,
    userId: document.userId,

    invoiceNumber: document.invoiceNumber || "",
    status: document.status || "draft",

    invoiceDate: document.invoiceDate || document.$createdAt,
    dueDate: document.dueDate || undefined,

    purchaseOrderNumber: document.purchaseOrderNumber || undefined,
    reference: document.reference || undefined,

    customerName: document.customerName || "",
    customerCompany: document.customerCompany || undefined,
    customerEmail: document.customerEmail || undefined,
    customerPhone: document.customerPhone || undefined,
    billingAddress: document.billingAddress || undefined,
    shippingAddress: document.shippingAddress || undefined,
    customerTaxNumber: document.customerTaxNumber || undefined,

    currencyCode: document.currencyCode || "GBP",
    currencySymbol: document.currencySymbol || "£",
    locale: document.locale || "en-GB",

    taxEnabled: Boolean(document.taxEnabled),
    taxLabel: document.taxLabel || "Tax",
    pricesIncludeTax: Boolean(document.pricesIncludeTax),

    items,
    payments: sortPaymentsNewestFirst(payments),

    subtotal: Number(document.subtotal || 0),
    itemDiscountTotal: Number(document.itemDiscountTotal || 0),
    invoiceDiscountType: document.invoiceDiscountType || undefined,
    invoiceDiscountValue: Number(document.invoiceDiscountValue || 0),
    invoiceDiscountAmount: Number(document.invoiceDiscountAmount || 0),

    shippingAmount: Number(document.shippingAmount || 0),
    taxTotal: Number(document.taxTotal || 0),
    roundingAdjustment: Number(document.roundingAdjustment || 0),
    grandTotal: Number(document.grandTotal || 0),
    amountPaid: Number(document.amountPaid || 0),
    balanceDue: Number(document.balanceDue || 0),

    paymentMethod: document.paymentMethod || undefined,
    paymentDate: document.paymentDate || undefined,
    paymentReference: document.paymentReference || undefined,

    notes: document.notes || undefined,
    paymentTerms: document.paymentTerms || undefined,
    paymentInstructions: document.paymentInstructions || undefined,
    termsAndConditions: document.termsAndConditions || undefined,

    stockReductionTrigger: document.stockReductionTrigger || "sent",
    stockProcessed: Boolean(document.stockProcessed),

    createdAt: document.createdAt || document.$createdAt,
    updatedAt: document.updatedAt || document.$updatedAt,
    sentAt: document.sentAt || undefined,
    paidAt: document.paidAt || undefined,
    cancelledAt: document.cancelledAt || undefined,

    synced: true,
    syncedAt: document.syncedAt || nowISO(),
  };

  return payments.length > 0
    ? applyPaymentSummary(invoice, payments)
    : invoice;
}

function documentToInvoiceItem(document: Record<string, any>): InvoiceItem {
  return {
    id: document.localId || document.$id,
    cloudId: document.$id,

    sourceType: document.sourceType || "custom",
    stockId: document.stockId || undefined,

    productName: document.productName || "",
    sku: document.sku || undefined,
    description: document.description || undefined,

    quantity: Number(document.quantity || 0),
    unit: document.unit || undefined,
    unitPrice: Number(document.unitPrice || 0),

    discountType: document.discountType || undefined,
    discountValue: Number(document.discountValue || 0),
    discountAmount: Number(document.discountAmount || 0),

    taxRate: Number(document.taxRate || 0),
    taxName: document.taxName || undefined,
    taxExempt: Boolean(document.taxExempt),

    subtotal: Number(document.subtotal || 0),
    taxableAmount: Number(document.taxableAmount || 0),
    taxAmount: Number(document.taxAmount || 0),
    total: Number(document.total || 0),

    stockProcessed: Boolean(document.stockProcessed),
    stockProcessedQuantity: Number(
      document.stockProcessedQuantity || 0
    ),
  };
}

function documentToInvoicePayment(
  document: Record<string, any>
): InvoicePayment {
  return {
    id: document.localId || document.$id,
    cloudId: document.$id,
    invoiceId: document.invoiceLocalId,
    userId: document.userId,

    amount: Number(document.amount || 0),
    method: (document.method || "other") as InvoicePaymentMethod,
    paymentDate:
      document.paymentDate || document.createdAt || document.$createdAt,
    reference: document.reference || undefined,
    notes: document.notes || undefined,

    createdAt: document.createdAt || document.$createdAt,
    updatedAt: document.updatedAt || document.$updatedAt,
    synced: true,
    syncedAt: document.syncedAt || nowISO(),
  };
}

/* -------------------------------------------------------------------------- */
/*                              CLOUD HELPERS                                 */
/* -------------------------------------------------------------------------- */

async function findDocumentByLocalId(
  collectionId: string,
  localId: string,
  userId: string
): Promise<Record<string, any> | null> {
  const response = await database.listDocuments(
    DATABASE_ID,
    collectionId,
    [
      Query.equal("localId", localId),
      Query.equal("userId", userId),
      Query.limit(1),
    ]
  );

  return response.documents[0] || null;
}

async function upsertInvoiceDocument(
  invoice: Invoice,
  userId: string
): Promise<string> {
  const data = invoiceToDocument(invoice, userId);

  let cloudId = invoice.cloudId;

  if (!cloudId) {
    const existing = await findDocumentByLocalId(
      INVOICES_COLLECTION_ID,
      invoice.id,
      userId
    );
    cloudId = existing?.$id;
  }

  if (cloudId) {
    await database.updateDocument(
      DATABASE_ID,
      INVOICES_COLLECTION_ID,
      cloudId,
      data
    );

    return cloudId;
  }

  const created = await database.createDocument(
    DATABASE_ID,
    INVOICES_COLLECTION_ID,
    ID.unique(),
    data,
    invoicePermissions(userId)
  );

  return created.$id;
}

async function syncInvoiceItems(
  invoice: Invoice,
  invoiceCloudId: string,
  userId: string
): Promise<void> {
  const cloudResponse = await database.listDocuments(
    DATABASE_ID,
    INVOICE_ITEMS_COLLECTION_ID,
    [
      Query.equal("invoiceLocalId", invoice.id),
      Query.equal("userId", userId),
      Query.limit(5000),
    ]
  );

  const existingByLocalId = new Map(
    cloudResponse.documents.map((document) => [
      document.localId,
      document,
    ])
  );

  const currentLocalIds = new Set(
    invoice.items.map((item) => item.id)
  );

  for (const item of invoice.items) {
    const data = itemToDocument(item, invoice, invoiceCloudId, userId);

    const existing =
      existingByLocalId.get(item.id) ||
      (item.cloudId
        ? cloudResponse.documents.find(
            (document) => document.$id === item.cloudId
          )
        : undefined);

    if (existing?.$id) {
      await database.updateDocument(
        DATABASE_ID,
        INVOICE_ITEMS_COLLECTION_ID,
        existing.$id,
        data
      );
    } else {
      await database.createDocument(
        DATABASE_ID,
        INVOICE_ITEMS_COLLECTION_ID,
        ID.unique(),
        data,
        invoicePermissions(userId)
      );
    }
  }

  for (const cloudItem of cloudResponse.documents) {
    if (!currentLocalIds.has(cloudItem.localId)) {
      await database.deleteDocument(
        DATABASE_ID,
        INVOICE_ITEMS_COLLECTION_ID,
        cloudItem.$id
      );
    }
  }
}

async function syncInvoicePayments(
  invoice: Invoice,
  payments: InvoicePayment[],
  invoiceCloudId: string,
  userId: string
): Promise<InvoicePayment[]> {
  const cloudResponse = await database.listDocuments(
    DATABASE_ID,
    INVOICE_PAYMENTS_COLLECTION_ID,
    [
      Query.equal("invoiceLocalId", invoice.id),
      Query.equal("userId", userId),
      Query.limit(5000),
    ]
  );

  const existingByLocalId = new Map(
    cloudResponse.documents.map((document) => [
      document.localId,
      document,
    ])
  );

  const currentLocalIds = new Set(
    payments.map((payment) => payment.id)
  );
  const syncedPayments: InvoicePayment[] = [];
  const syncedAt = nowISO();

  for (const payment of payments) {
    const data = paymentToDocument(payment, invoiceCloudId, userId);

    const existing =
      existingByLocalId.get(payment.id) ||
      (payment.cloudId
        ? cloudResponse.documents.find(
            (document) => document.$id === payment.cloudId
          )
        : undefined);

    let cloudId = payment.cloudId;

    if (existing?.$id) {
      cloudId = existing.$id;
      await database.updateDocument(
        DATABASE_ID,
        INVOICE_PAYMENTS_COLLECTION_ID,
        existing.$id,
        data
      );
    } else {
      const created = await database.createDocument(
        DATABASE_ID,
        INVOICE_PAYMENTS_COLLECTION_ID,
        ID.unique(),
        data,
        invoicePermissions(userId)
      );
      cloudId = created.$id;
    }

    syncedPayments.push({
      ...payment,
      cloudId,
      userId,
      synced: true,
      syncedAt,
    });
  }

  // A cloud payment absent locally is treated as deleted locally.
  for (const cloudPayment of cloudResponse.documents) {
    if (!currentLocalIds.has(cloudPayment.localId)) {
      await database.deleteDocument(
        DATABASE_ID,
        INVOICE_PAYMENTS_COLLECTION_ID,
        cloudPayment.$id
      );
    }
  }

  return syncedPayments;
}

/* -------------------------------------------------------------------------- */
/*                               UPLOAD                                       */
/* -------------------------------------------------------------------------- */

export async function uploadUnsyncedInvoices(
  userId: string
): Promise<void> {
  const allInvoices =
    (await getLocal<Invoice>(INVOICE_STORAGE_KEY)) || [];
  const allPayments =
    (await getLocal<InvoicePayment>(INVOICE_PAYMENT_STORAGE_KEY)) || [];

  const updatedInvoices: Invoice[] = [];
  const updatedPayments: InvoicePayment[] = [...allPayments];

  for (const original of allInvoices) {
    if (original.userId !== userId && original.userId !== "guest") {
      updatedInvoices.push(original);
      continue;
    }

    const invoicePayments = allPayments.filter(
      (payment) =>
        payment.invoiceId === original.id &&
        (payment.userId === userId || payment.userId === "guest")
    );

    const hasUnsyncedPayments = invoicePayments.some(
      (payment) => !payment.synced || payment.userId === "guest"
    );

    // A synced invoice must still be processed when a payment changed or was
    // deleted, so payment creation/update/deletion reaches Appwrite.
    if (
      original.synced &&
      original.userId === userId &&
      !hasUnsyncedPayments &&
      (original.payments?.length ?? invoicePayments.length) ===
        invoicePayments.length
    ) {
      updatedInvoices.push(original);
      continue;
    }

    try {
      let invoice: Invoice = {
        ...original,
        userId,
      };

      const normalisedPayments = invoicePayments.map((payment) => ({
        ...payment,
        userId,
      }));

      invoice = applyPaymentSummary(invoice, normalisedPayments);

      const cloudId = await upsertInvoiceDocument(invoice, userId);

      await syncInvoiceItems(invoice, cloudId, userId);

      const syncedPayments = await syncInvoicePayments(
        invoice,
        normalisedPayments,
        cloudId,
        userId
      );

      for (const syncedPayment of syncedPayments) {
        const index = updatedPayments.findIndex(
          (payment) => payment.id === syncedPayment.id
        );

        if (index >= 0) {
          updatedPayments[index] = syncedPayment;
        } else {
          updatedPayments.push(syncedPayment);
        }
      }

      const syncedInvoice = applyPaymentSummary(
        {
          ...invoice,
          cloudId,
          synced: true,
          syncedAt: nowISO(),
        },
        syncedPayments
      );

      updatedInvoices.push(syncedInvoice);
    } catch (error) {
      console.error(
        `❌ Invoice upload failed (${original.invoiceNumber})`,
        error
      );

      updatedInvoices.push({
        ...original,
        userId: original.userId === "guest" ? userId : original.userId,
        synced: false,
      });

      for (let index = 0; index < updatedPayments.length; index += 1) {
        const payment = updatedPayments[index];
        if (
          payment.invoiceId === original.id &&
          payment.userId === "guest"
        ) {
          updatedPayments[index] = {
            ...payment,
            userId,
            synced: false,
          };
        }
      }
    }
  }

  await Promise.all([
    setLocal(INVOICE_STORAGE_KEY, updatedInvoices),
    setLocal(INVOICE_PAYMENT_STORAGE_KEY, updatedPayments),
  ]);
}

/* -------------------------------------------------------------------------- */
/*                               DOWNLOAD                                     */
/* -------------------------------------------------------------------------- */

export async function downloadCloudInvoices(
  userId: string
): Promise<void> {
  const localInvoices =
    (await getLocal<Invoice>(INVOICE_STORAGE_KEY)) || [];
  const localPayments =
    (await getLocal<InvoicePayment>(INVOICE_PAYMENT_STORAGE_KEY)) || [];

  const [invoiceResponse, itemResponse, paymentResponse] =
    await Promise.all([
      database.listDocuments(DATABASE_ID, INVOICES_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.orderDesc("updatedAt"),
        Query.limit(5000),
      ]),
      database.listDocuments(DATABASE_ID, INVOICE_ITEMS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.limit(5000),
      ]),
      database.listDocuments(
        DATABASE_ID,
        INVOICE_PAYMENTS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.orderDesc("paymentDate"),
          Query.limit(5000),
        ]
      ),
    ]);

  const itemGroups = new Map<string, InvoiceItem[]>();

  for (const rawDocument of itemResponse.documents) {
    const document = removeAppwriteSystemFields(rawDocument);
    const invoiceLocalId = document.invoiceLocalId;

    if (!itemGroups.has(invoiceLocalId)) {
      itemGroups.set(invoiceLocalId, []);
    }

    itemGroups
      .get(invoiceLocalId)!
      .push(documentToInvoiceItem(rawDocument));
  }

  const cloudPayments = paymentResponse.documents.map(
    documentToInvoicePayment
  );
  const cloudPaymentsById = new Map(
    cloudPayments.map((payment) => [payment.id, payment])
  );

  // Preserve unsynced local changes. Synced local payments are replaced by
  // the cloud copy. New cloud payments are appended.
  const mergedPaymentsForUser: InvoicePayment[] = [];

  for (const local of localPayments.filter(
    (payment) => payment.userId === userId
  )) {
    const cloud = cloudPaymentsById.get(local.id);

    if (!local.synced) {
      mergedPaymentsForUser.push(local);
      cloudPaymentsById.delete(local.id);
      continue;
    }

    if (cloud) {
      mergedPaymentsForUser.push(cloud);
      cloudPaymentsById.delete(local.id);
    }
    // If a synced local payment no longer exists in cloud, omit it.
  }

  mergedPaymentsForUser.push(...cloudPaymentsById.values());

  const paymentGroups = new Map<string, InvoicePayment[]>();

  for (const payment of mergedPaymentsForUser) {
    if (!paymentGroups.has(payment.invoiceId)) {
      paymentGroups.set(payment.invoiceId, []);
    }
    paymentGroups.get(payment.invoiceId)!.push(payment);
  }

  const cloudInvoices = invoiceResponse.documents.map((document) => {
    const localId = document.localId || document.$id;

    return documentToInvoice(
      document,
      itemGroups.get(localId) || [],
      paymentGroups.get(localId) || []
    );
  });

  const cloudByLocalId = new Map(
    cloudInvoices.map((invoice) => [invoice.id, invoice])
  );

  const mergedInvoicesForUser: Invoice[] = [];

  for (const local of localInvoices.filter(
    (invoice) => invoice.userId === userId
  )) {
    const cloud = cloudByLocalId.get(local.id);
    const payments = paymentGroups.get(local.id) || [];

    // Keep unsynced invoice edits; still attach the current payment summary.
    if (!local.synced) {
      mergedInvoicesForUser.push(applyPaymentSummary(local, payments));
      cloudByLocalId.delete(local.id);
      continue;
    }

    if (cloud) {
      mergedInvoicesForUser.push(cloud);
      cloudByLocalId.delete(local.id);
    }
    // If a synced local invoice no longer exists in cloud, omit it.
  }

  mergedInvoicesForUser.push(...cloudByLocalId.values());

  const otherUsersInvoices = localInvoices.filter(
    (invoice) => invoice.userId !== userId
  );
  const otherUsersPayments = localPayments.filter(
    (payment) => payment.userId !== userId
  );

  await Promise.all([
    setLocal(INVOICE_STORAGE_KEY, [
      ...otherUsersInvoices,
      ...mergedInvoicesForUser,
    ]),
    setLocal(INVOICE_PAYMENT_STORAGE_KEY, [
      ...otherUsersPayments,
      ...mergedPaymentsForUser,
    ]),
  ]);
}

/* -------------------------------------------------------------------------- */
/*                              COMPLETE SYNC                                 */
/* -------------------------------------------------------------------------- */

export async function syncInvoices(userId: string): Promise<void> {
  console.log("🧾 Syncing invoices, items and payments...");

  await uploadUnsyncedInvoices(userId);
  await downloadCloudInvoices(userId);

  console.log("✅ Invoice sync complete");
}
