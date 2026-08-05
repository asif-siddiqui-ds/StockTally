// // // lib/invoiceStorage.ts
// // import { getCachedUserId } from "@/context/AuthContext";
// // import { recalculateInvoice } from "@/lib/invoiceCalculations";
// // import {
// //     getLocal,
// //     getStockItems,
// //     saveStockMovement,
// //     setLocal,
// //     updateStockQuantity,
// // } from "@/lib/storage";
// // import type {
// //     CreateInvoiceInput,
// //     Invoice,
// //     InvoiceItem,
// //     InvoiceStatus,
// //     StockReductionTrigger,
// // } from "@/types/invoice";

// // const INVOICE_STORAGE_KEY = "invoices";

// // /* -------------------------------------------------------------------------- */
// // /*                                  HELPERS                                   */
// // /* -------------------------------------------------------------------------- */

// // const createLocalId = (): string =>
// //   `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// // const getCurrentUserId = async (): Promise<string> =>
// //   (await getCachedUserId()) || "guest";

// // const normalizePrefix = (prefix?: string): string => {
// //   const cleaned = String(prefix || "INV")
// //     .trim()
// //     .replace(/[^a-zA-Z0-9_-]/g, "")
// //     .toUpperCase();

// //   return cleaned || "INV";
// // };

// // const shouldProcessStockForStatus = (
// //   trigger: StockReductionTrigger,
// //   status: InvoiceStatus
// // ): boolean => {
// //   if (trigger === "never") return false;
// //   if (trigger === "created") return true;
// //   if (trigger === "sent") {
// //     return ["sent", "unpaid", "partially_paid", "paid", "overdue"].includes(
// //       status
// //     );
// //   }
// //   if (trigger === "paid") return status === "paid";

// //   return false;
// // };

// // const buildInvoiceItems = (items: InvoiceItem[]): InvoiceItem[] =>
// //   items.map((item) => ({
// //     ...item,
// //     id: item.id || createLocalId(),
// //     discountValue: Number(item.discountValue || 0),
// //     discountAmount: Number(item.discountAmount || 0),
// //     taxRate: Number(item.taxRate || 0),
// //     taxExempt: Boolean(item.taxExempt),
// //     stockProcessed: Boolean(item.stockProcessed),
// //     stockProcessedQuantity: Number(item.stockProcessedQuantity || 0),
// //   }));

// // /* -------------------------------------------------------------------------- */
// // /*                              READ OPERATIONS                               */
// // /* -------------------------------------------------------------------------- */

// // export async function getAllInvoices(): Promise<Invoice[]> {
// //   return await getLocal<Invoice>(INVOICE_STORAGE_KEY);
// // }

// // export async function getInvoices(): Promise<Invoice[]> {
// //   const userId = await getCurrentUserId();
// //   const all = await getAllInvoices();

// //   return all
// //     .filter((invoice) => invoice.userId === userId)
// //     .sort(
// //       (a, b) =>
// //         new Date(b.updatedAt || b.createdAt).getTime() -
// //         new Date(a.updatedAt || a.createdAt).getTime()
// //     );
// // }

// // export async function getInvoiceById(
// //   id: string
// // ): Promise<Invoice | null> {
// //   const userId = await getCurrentUserId();
// //   const all = await getAllInvoices();

// //   return (
// //     all.find(
// //       (invoice) =>
// //         (invoice.id === id || invoice.cloudId === id) &&
// //         invoice.userId === userId
// //     ) ?? null
// //   );
// // }

// // export async function getInvoiceByNumber(
// //   invoiceNumber: string
// // ): Promise<Invoice | null> {
// //   const userId = await getCurrentUserId();
// //   const target = invoiceNumber.trim().toLowerCase();
// //   const all = await getAllInvoices();

// //   return (
// //     all.find(
// //       (invoice) =>
// //         invoice.userId === userId &&
// //         invoice.invoiceNumber.trim().toLowerCase() === target
// //     ) ?? null
// //   );
// // }

// // export async function invoiceNumberExists(
// //   invoiceNumber: string,
// //   excludeInvoiceId?: string
// // ): Promise<boolean> {
// //   const userId = await getCurrentUserId();
// //   const target = invoiceNumber.trim().toLowerCase();
// //   const all = await getAllInvoices();

// //   return all.some(
// //     (invoice) =>
// //       invoice.userId === userId &&
// //       invoice.id !== excludeInvoiceId &&
// //       invoice.invoiceNumber.trim().toLowerCase() === target
// //   );
// // }

// // /* -------------------------------------------------------------------------- */
// // /*                           INVOICE NUMBER GENERATOR                         */
// // /* -------------------------------------------------------------------------- */

// // export async function getNextInvoiceNumber(
// //   prefix = "INV",
// //   padding = 4
// // ): Promise<string> {
// //   const userId = await getCurrentUserId();
// //   const safePrefix = normalizePrefix(prefix);
// //   const all = await getAllInvoices();

// //   const pattern = new RegExp(`^${safePrefix}-(\\d+)$`, "i");

// //   const highest = all
// //     .filter((invoice) => invoice.userId === userId)
// //     .reduce((max, invoice) => {
// //       const match = invoice.invoiceNumber.match(pattern);
// //       if (!match) return max;

// //       const current = Number(match[1]);
// //       return Number.isFinite(current) ? Math.max(max, current) : max;
// //     }, 0);

// //   return `${safePrefix}-${String(highest + 1).padStart(padding, "0")}`;
// // }

// // /* -------------------------------------------------------------------------- */
// // /*                              CREATE INVOICE                                */
// // /* -------------------------------------------------------------------------- */

// // export async function saveInvoice(
// //   input: CreateInvoiceInput,
// //   status: InvoiceStatus = "draft"
// // ): Promise<Invoice> {
// //   const userId = await getCurrentUserId();

// //   if (!input.customerName?.trim()) {
// //     throw new Error("Customer name is required.");
// //   }

// //   if (!input.invoiceNumber?.trim()) {
// //     throw new Error("Invoice number is required.");
// //   }

// //   if (!input.items?.length) {
// //     throw new Error("Add at least one product or service.");
// //   }

// //   if (await invoiceNumberExists(input.invoiceNumber)) {
// //     throw new Error(`Invoice number ${input.invoiceNumber} already exists.`);
// //   }

// //   const now = new Date().toISOString();

// //   const invoice: Invoice = {
// //     id: createLocalId(),
// //     cloudId: undefined,
// //     userId,

// //     invoiceNumber: input.invoiceNumber.trim(),
// //     status,

// //     invoiceDate: input.invoiceDate || now,
// //     dueDate: input.dueDate,

// //     purchaseOrderNumber: input.purchaseOrderNumber?.trim(),
// //     reference: input.reference?.trim(),

// //     customerName: input.customerName.trim(),
// //     customerCompany: input.customerCompany?.trim(),
// //     customerEmail: input.customerEmail?.trim(),
// //     customerPhone: input.customerPhone?.trim(),

// //     billingAddress: input.billingAddress?.trim(),
// //     shippingAddress: input.shippingAddress?.trim(),
// //     customerTaxNumber: input.customerTaxNumber?.trim(),

// //     currencyCode: input.currencyCode || "GBP",
// //     currencySymbol: input.currencySymbol || "£",
// //     locale: input.locale || "en-GB",

// //     taxEnabled: Boolean(input.taxEnabled),
// //     taxLabel: input.taxLabel || "Tax",
// //     pricesIncludeTax: Boolean(input.pricesIncludeTax),

// //     items: buildInvoiceItems(input.items),

// //     subtotal: 0,
// //     itemDiscountTotal: 0,

// //     invoiceDiscountType: input.invoiceDiscountType,
// //     invoiceDiscountValue: Number(input.invoiceDiscountValue || 0),
// //     invoiceDiscountAmount: 0,

// //     shippingAmount: Number(input.shippingAmount || 0),
// //     taxTotal: 0,
// //     roundingAdjustment: Number(input.roundingAdjustment || 0),
// //     grandTotal: 0,

// //     amountPaid: 0,
// //     balanceDue: 0,

// //     notes: input.notes?.trim(),
// //     paymentTerms: input.paymentTerms?.trim(),
// //     paymentInstructions: input.paymentInstructions?.trim(),
// //     termsAndConditions: input.termsAndConditions?.trim(),

// //     stockReductionTrigger: input.stockReductionTrigger || "sent",
// //     stockProcessed: false,

// //     createdAt: now,
// //     updatedAt: now,
// //     sentAt: undefined,
// //     paidAt: undefined,
// //     cancelledAt: undefined,

// //     synced: false,
// //     syncedAt: "",
// //   };

// //   const calculated = recalculateInvoice(invoice);
// //   const all = await getAllInvoices();

// //   all.push(calculated);
// //   await setLocal(INVOICE_STORAGE_KEY, all);

// //   if (
// //     shouldProcessStockForStatus(
// //       calculated.stockReductionTrigger,
// //       calculated.status
// //     )
// //   ) {
// //     return await processInvoiceStock(calculated.id);
// //   }

// //   return calculated;
// // }

// // /* -------------------------------------------------------------------------- */
// // /*                              UPDATE INVOICE                                */
// // /* -------------------------------------------------------------------------- */

// // export async function updateInvoice(
// //   id: string,
// //   updates: Partial<Invoice>
// // ): Promise<Invoice | null> {
// //   const userId = await getCurrentUserId();
// //   const all = await getAllInvoices();

// //   const index = all.findIndex(
// //     (invoice) => invoice.id === id && invoice.userId === userId
// //   );

// //   if (index === -1) return null;

// //   const current = all[index];

// //   if (
// //     updates.invoiceNumber &&
// //     updates.invoiceNumber !== current.invoiceNumber &&
// //     (await invoiceNumberExists(updates.invoiceNumber, id))
// //   ) {
// //     throw new Error(
// //       `Invoice number ${updates.invoiceNumber} already exists.`
// //     );
// //   }

// //   const merged: Invoice = {
// //     ...current,
// //     ...updates,
// //     id: current.id,
// //     cloudId: current.cloudId,
// //     userId: current.userId,
// //     items: updates.items
// //       ? buildInvoiceItems(updates.items)
// //       : current.items,
// //     updatedAt: new Date().toISOString(),
// //     synced: false,
// //     syncedAt: "",
// //   };

// //   const calculated = recalculateInvoice(merged);
// //   all[index] = calculated;

// //   await setLocal(INVOICE_STORAGE_KEY, all);

// //   if (
// //     !calculated.stockProcessed &&
// //     shouldProcessStockForStatus(
// //       calculated.stockReductionTrigger,
// //       calculated.status
// //     )
// //   ) {
// //     return await processInvoiceStock(calculated.id);
// //   }

// //   return calculated;
// // }

// // export async function deleteInvoice(id: string): Promise<void> {
// //   const userId = await getCurrentUserId();
// //   const all = await getAllInvoices();

// //   const invoice = all.find(
// //     (item) => item.id === id && item.userId === userId
// //   );

// //   if (!invoice) return;

// //   if (invoice.stockProcessed) {
// //     throw new Error(
// //       "This invoice has already reduced stock and cannot be deleted. Cancel it instead."
// //     );
// //   }

// //   await setLocal(
// //     INVOICE_STORAGE_KEY,
// //     all.filter(
// //       (item) => !(item.id === id && item.userId === userId)
// //     )
// //   );
// // }

// // export async function saveAllInvoices(
// //   invoices: Invoice[]
// // ): Promise<void> {
// //   await setLocal(INVOICE_STORAGE_KEY, invoices);
// // }

// // /* -------------------------------------------------------------------------- */
// // /*                             STATUS OPERATIONS                              */
// // /* -------------------------------------------------------------------------- */

// // export async function markInvoiceAsSent(
// //   id: string
// // ): Promise<Invoice | null> {
// //   return await updateInvoice(id, {
// //     status: "sent",
// //     sentAt: new Date().toISOString(),
// //   });
// // }

// // export async function markInvoiceAsPaid(
// //   id: string,
// //   amountPaid?: number
// // ): Promise<Invoice | null> {
// //   const invoice = await getInvoiceById(id);
// //   if (!invoice) return null;

// //   const paid = amountPaid ?? invoice.grandTotal;

// //   return await updateInvoice(id, {
// //     status: paid >= invoice.grandTotal ? "paid" : "partially_paid",
// //     amountPaid: Math.max(0, Number(paid || 0)),
// //     paidAt:
// //       paid >= invoice.grandTotal
// //         ? new Date().toISOString()
// //         : invoice.paidAt,
// //   });
// // }

// // export async function cancelInvoice(
// //   id: string
// // ): Promise<Invoice | null> {
// //   const invoice = await getInvoiceById(id);
// //   if (!invoice) return null;

// //   if (invoice.stockProcessed) {
// //     throw new Error(
// //       "Stock was already processed for this invoice. A stock reversal or credit-note workflow is required."
// //     );
// //   }

// //   return await updateInvoice(id, {
// //     status: "cancelled",
// //     cancelledAt: new Date().toISOString(),
// //   });
// // }

// // /* -------------------------------------------------------------------------- */
// // /*                           STOCK PROCESSING                                 */
// // /* -------------------------------------------------------------------------- */

// // export async function processInvoiceStock(
// //   invoiceId: string
// // ): Promise<Invoice> {
// //   const userId = await getCurrentUserId();
// //   const allInvoices = await getAllInvoices();

// //   const invoiceIndex = allInvoices.findIndex(
// //     (invoice) =>
// //       invoice.id === invoiceId && invoice.userId === userId
// //   );

// //   if (invoiceIndex === -1) {
// //     throw new Error("Invoice not found.");
// //   }

// //   const invoice = allInvoices[invoiceIndex];

// //   if (invoice.stockProcessed) {
// //     return invoice;
// //   }

// //   const stockItems = await getStockItems();

// //   const stockLines = invoice.items.filter(
// //     (item) =>
// //       item.sourceType === "stock" &&
// //       Boolean(item.stockId) &&
// //       Number(item.quantity) > 0 &&
// //       !item.stockProcessed
// //   );

// //   // Validate every stock line before changing any quantity.
// //   for (const line of stockLines) {
// //     const stock = stockItems.find(
// //       (item) => item.id === line.stockId
// //     );

// //     if (!stock) {
// //       throw new Error(
// //         `Stock item "${line.productName}" could not be found.`
// //       );
// //     }

// //     const quantityToProcess =
// //       Number(line.quantity) -
// //       Number(line.stockProcessedQuantity || 0);

// //     if (quantityToProcess <= 0) continue;

// //     if (stock.quantity < quantityToProcess) {
// //       throw new Error(
// //         `Insufficient stock for "${line.productName}". Available: ${stock.quantity}, required: ${quantityToProcess}.`
// //       );
// //     }
// //   }

// //   const processedItems: InvoiceItem[] = [...invoice.items];

// //   for (let index = 0; index < processedItems.length; index += 1) {
// //     const line = processedItems[index];

// //     if (
// //       line.sourceType !== "stock" ||
// //       !line.stockId ||
// //       line.stockProcessed
// //     ) {
// //       continue;
// //     }

// //     const stock = stockItems.find(
// //       (item) => item.id === line.stockId
// //     );

// //     if (!stock) continue;

// //     const alreadyProcessed = Number(
// //       line.stockProcessedQuantity || 0
// //     );

// //     const quantityToProcess =
// //       Number(line.quantity) - alreadyProcessed;

// //     if (quantityToProcess <= 0) {
// //       processedItems[index] = {
// //         ...line,
// //         stockProcessed: true,
// //         stockProcessedQuantity: Number(line.quantity),
// //       };
// //       continue;
// //     }

// //     const newBalance = stock.quantity - quantityToProcess;

// //     await updateStockQuantity(stock.id, newBalance);

// //     await saveStockMovement({
// //       stockItemId: stock.id,
// //       itemName: stock.name,
// //       type: "OUT",
// //       quantity: quantityToProcess,
// //       source: "INVOICE",
// //       sourceLabel: `Invoice ${invoice.invoiceNumber}`,
// //       balanceAfter: newBalance,
// //       referenceId: invoice.id,
// //       referenceType: "INVOICE",
// //       note: invoice.customerName
// //         ? `Invoice issued to ${invoice.customerName}`
// //         : undefined,
// //     });

// //     stock.quantity = newBalance;

// //     processedItems[index] = {
// //       ...line,
// //       stockProcessed: true,
// //       stockProcessedQuantity: Number(line.quantity),
// //     };
// //   }

// //   const updatedInvoice: Invoice = {
// //     ...invoice,
// //     items: processedItems,
// //     stockProcessed: processedItems
// //       .filter((item) => item.sourceType === "stock")
// //       .every((item) => item.stockProcessed),
// //     updatedAt: new Date().toISOString(),
// //     synced: false,
// //     syncedAt: "",
// //   };

// //   allInvoices[invoiceIndex] = updatedInvoice;
// //   await setLocal(INVOICE_STORAGE_KEY, allInvoices);

// //   return updatedInvoice;
// // }

// // /* -------------------------------------------------------------------------- */
// // /*                                SYNC HELPERS                                */
// // /* -------------------------------------------------------------------------- */

// // export async function getUnsyncedInvoices(): Promise<Invoice[]> {
// //   const userId = await getCurrentUserId();
// //   const all = await getAllInvoices();

// //   return all.filter(
// //     (invoice) => invoice.userId === userId && !invoice.synced
// //   );
// // }

// // export async function markInvoiceSynced(
// //   id: string,
// //   cloudId?: string,
// //   syncedAt = new Date().toISOString()
// // ): Promise<void> {
// //   const userId = await getCurrentUserId();
// //   const all = await getAllInvoices();

// //   const updated = all.map((invoice) =>
// //     invoice.id === id && invoice.userId === userId
// //       ? {
// //           ...invoice,
// //           cloudId: cloudId || invoice.cloudId,
// //           synced: true,
// //           syncedAt,
// //         }
// //       : invoice
// //   );

// //   await setLocal(INVOICE_STORAGE_KEY, updated);
// // }

// // export async function linkGuestInvoicesToUser(
// //   userId: string
// // ): Promise<void> {
// //   const all = await getAllInvoices();
// //   let changed = false;

// //   const updated = all.map((invoice) => {
// //     if (invoice.userId !== "guest") return invoice;

// //     changed = true;

// //     return {
// //       ...invoice,
// //       userId,
// //       synced: false,
// //       syncedAt: "",
// //       updatedAt: new Date().toISOString(),
// //     };
// //   });

// //   if (changed) {
// //     await setLocal(INVOICE_STORAGE_KEY, updated);
// //   }
// // }

// // export async function clearInvoices(): Promise<void> {
// //   const userId = await getCurrentUserId();
// //   const all = await getAllInvoices();

// //   const remaining = all.filter(
// //     (invoice) => invoice.userId !== userId
// //   );

// //   await setLocal(INVOICE_STORAGE_KEY, remaining);
// // }

// // lib/invoiceStorage.ts
// import { getCachedUserId } from "@/context/AuthContext";
// import { recalculateInvoice } from "@/lib/invoiceCalculations";
// import {
//   getLocal,
//   getStockItems,
//   saveStockMovement,
//   setLocal,
//   updateStockQuantity,
// } from "@/lib/storage";
// import type {
//   CreateInvoiceInput,
//   Invoice,
//   InvoiceItem,
//   InvoiceStatus,
//   StockReductionTrigger,
// } from "@/types/invoice";

// const INVOICE_STORAGE_KEY = "invoices";

// /* -------------------------------------------------------------------------- */
// /*                                  HELPERS                                   */
// /* -------------------------------------------------------------------------- */

// const createLocalId = (): string =>
//   `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// const getCurrentUserId = async (): Promise<string> =>
//   (await getCachedUserId()) || "guest";

// const normalizePrefix = (prefix?: string): string => {
//   const cleaned = String(prefix || "INV")
//     .trim()
//     .replace(/[^a-zA-Z0-9_-]/g, "")
//     .toUpperCase();

//   return cleaned || "INV";
// };

// const shouldProcessStockForStatus = (
//   trigger: StockReductionTrigger,
//   status: InvoiceStatus
// ): boolean => {
//   if (trigger === "never") return false;
//   if (trigger === "created") return true;
//   if (trigger === "sent") {
//     return ["sent", "unpaid", "partially_paid", "paid", "overdue"].includes(
//       status
//     );
//   }
//   if (trigger === "paid") return status === "paid";

//   return false;
// };

// const buildInvoiceItems = (items: InvoiceItem[]): InvoiceItem[] =>
//   items.map((item) => ({
//     ...item,
//     id: item.id || createLocalId(),
//     discountValue: Number(item.discountValue || 0),
//     discountAmount: Number(item.discountAmount || 0),
//     taxRate: Number(item.taxRate || 0),
//     taxExempt: Boolean(item.taxExempt),
//     stockProcessed: Boolean(item.stockProcessed),
//     stockProcessedQuantity: Number(item.stockProcessedQuantity || 0),
//   }));

// /* -------------------------------------------------------------------------- */
// /*                              READ OPERATIONS                               */
// /* -------------------------------------------------------------------------- */

// export async function getAllInvoices(): Promise<Invoice[]> {
//   return await getLocal<Invoice>(INVOICE_STORAGE_KEY);
// }

// export async function getInvoices(): Promise<Invoice[]> {
//   const userId = await getCurrentUserId();
//   const all = await getAllInvoices();

//   return all
//     .filter((invoice) => invoice.userId === userId)
//     .sort(
//       (a, b) =>
//         new Date(b.updatedAt || b.createdAt).getTime() -
//         new Date(a.updatedAt || a.createdAt).getTime()
//     );
// }

// export async function getInvoiceById(
//   id: string
// ): Promise<Invoice | null> {
//   const userId = await getCurrentUserId();
//   const all = await getAllInvoices();

//   return (
//     all.find(
//       (invoice) =>
//         (invoice.id === id || invoice.cloudId === id) &&
//         invoice.userId === userId
//     ) ?? null
//   );
// }

// export async function getInvoiceByNumber(
//   invoiceNumber: string
// ): Promise<Invoice | null> {
//   const userId = await getCurrentUserId();
//   const target = invoiceNumber.trim().toLowerCase();
//   const all = await getAllInvoices();

//   return (
//     all.find(
//       (invoice) =>
//         invoice.userId === userId &&
//         invoice.invoiceNumber.trim().toLowerCase() === target
//     ) ?? null
//   );
// }

// export async function invoiceNumberExists(
//   invoiceNumber: string,
//   excludeInvoiceId?: string
// ): Promise<boolean> {
//   const userId = await getCurrentUserId();
//   const target = invoiceNumber.trim().toLowerCase();
//   const all = await getAllInvoices();

//   return all.some(
//     (invoice) =>
//       invoice.userId === userId &&
//       invoice.id !== excludeInvoiceId &&
//       invoice.invoiceNumber.trim().toLowerCase() === target
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                           INVOICE NUMBER GENERATOR                         */
// /* -------------------------------------------------------------------------- */

// export async function getNextInvoiceNumber(
//   prefix = "INV",
//   padding = 4
// ): Promise<string> {
//   const userId = await getCurrentUserId();
//   const safePrefix = normalizePrefix(prefix);
//   const all = await getAllInvoices();

//   const pattern = new RegExp(`^${safePrefix}-(\\d+)$`, "i");

//   const highest = all
//     .filter((invoice) => invoice.userId === userId)
//     .reduce((max, invoice) => {
//       const match = invoice.invoiceNumber.match(pattern);
//       if (!match) return max;

//       const current = Number(match[1]);
//       return Number.isFinite(current) ? Math.max(max, current) : max;
//     }, 0);

//   return `${safePrefix}-${String(highest + 1).padStart(padding, "0")}`;
// }

// /* -------------------------------------------------------------------------- */
// /*                              CREATE INVOICE                                */
// /* -------------------------------------------------------------------------- */

// export async function saveInvoice(
//   input: CreateInvoiceInput,
//   status: InvoiceStatus = input.status || "draft"
// ): Promise<Invoice> {
//   const userId = await getCurrentUserId();

//   if (!input.customerName?.trim()) {
//     throw new Error("Customer name is required.");
//   }

//   if (!input.invoiceNumber?.trim()) {
//     throw new Error("Invoice number is required.");
//   }

//   if (!input.items?.length) {
//     throw new Error("Add at least one product or service.");
//   }

//   if (await invoiceNumberExists(input.invoiceNumber)) {
//     throw new Error(`Invoice number ${input.invoiceNumber} already exists.`);
//   }

//   const now = new Date().toISOString();

//   const invoice: Invoice = {
//     id: createLocalId(),
//     cloudId: undefined,
//     userId,

//     invoiceNumber: input.invoiceNumber.trim(),
//     status,

//     invoiceDate: input.invoiceDate || now,
//     dueDate: input.dueDate,

//     purchaseOrderNumber: input.purchaseOrderNumber?.trim(),
//     reference: input.reference?.trim(),

//     customerName: input.customerName.trim(),
//     customerCompany: input.customerCompany?.trim(),
//     customerEmail: input.customerEmail?.trim(),
//     customerPhone: input.customerPhone?.trim(),

//     billingAddress: input.billingAddress?.trim(),
//     shippingAddress: input.shippingAddress?.trim(),
//     customerTaxNumber: input.customerTaxNumber?.trim(),

//     currencyCode: input.currencyCode || "GBP",
//     currencySymbol: input.currencySymbol || "£",
//     locale: input.locale || "en-GB",

//     taxEnabled: Boolean(input.taxEnabled),
//     taxLabel: input.taxLabel || "Tax",
//     pricesIncludeTax: Boolean(input.pricesIncludeTax),

//     items: buildInvoiceItems(input.items),

//     subtotal: 0,
//     itemDiscountTotal: 0,

//     invoiceDiscountType: input.invoiceDiscountType,
//     invoiceDiscountValue: Number(input.invoiceDiscountValue || 0),
//     invoiceDiscountAmount: 0,

//     shippingAmount: Number(input.shippingAmount || 0),
//     taxTotal: 0,
//     roundingAdjustment: Number(input.roundingAdjustment || 0),
//     grandTotal: 0,

//     amountPaid: Math.max(0, Number(input.amountPaid || 0)),
//     balanceDue: 0,

//     paymentMethod: input.paymentMethod,
//     paymentDate: input.paymentDate,
//     paymentReference: input.paymentReference?.trim(),

//     notes: input.notes?.trim(),
//     paymentTerms: input.paymentTerms?.trim(),
//     paymentInstructions: input.paymentInstructions?.trim(),
//     termsAndConditions: input.termsAndConditions?.trim(),

//     stockReductionTrigger: input.stockReductionTrigger || "sent",
//     stockProcessed: false,

//     createdAt: now,
//     updatedAt: now,
//     sentAt: undefined,
//     paidAt: undefined,
//     cancelledAt: undefined,

//     synced: false,
//     syncedAt: "",
//   };

//   let calculated = recalculateInvoice(invoice);

//   if (status === "paid") {
//     calculated = {
//       ...calculated,
//       status: "paid",
//       amountPaid: calculated.grandTotal,
//       balanceDue: 0,
//       paidAt: input.paymentDate || now,
//       paymentDate: input.paymentDate || now,
//     };
//   } else if (status === "partially_paid") {
//     const safeAmountPaid = Math.min(
//       calculated.grandTotal,
//       Math.max(0, Number(input.amountPaid || 0))
//     );

//     calculated = {
//       ...calculated,
//       status:
//         safeAmountPaid >= calculated.grandTotal
//           ? "paid"
//           : "partially_paid",
//       amountPaid: safeAmountPaid,
//       balanceDue: Math.max(
//         0,
//         calculated.grandTotal - safeAmountPaid
//       ),
//       paidAt:
//         safeAmountPaid >= calculated.grandTotal
//           ? input.paymentDate || now
//           : undefined,
//       paymentDate: input.paymentDate || now,
//     };
//   } else if (status === "unpaid") {
//     calculated = {
//       ...calculated,
//       status: "unpaid",
//       amountPaid: 0,
//       balanceDue: calculated.grandTotal,
//       paidAt: undefined,
//     };
//   }

//   const all = await getAllInvoices();

//   all.push(calculated);
//   await setLocal(INVOICE_STORAGE_KEY, all);

//   if (
//     shouldProcessStockForStatus(
//       calculated.stockReductionTrigger,
//       calculated.status
//     )
//   ) {
//     return await processInvoiceStock(calculated.id);
//   }

//   return calculated;
// }

// /* -------------------------------------------------------------------------- */
// /*                              UPDATE INVOICE                                */
// /* -------------------------------------------------------------------------- */

// export async function updateInvoice(
//   id: string,
//   updates: Partial<Invoice>
// ): Promise<Invoice | null> {
//   const userId = await getCurrentUserId();
//   const all = await getAllInvoices();

//   const index = all.findIndex(
//     (invoice) => invoice.id === id && invoice.userId === userId
//   );

//   if (index === -1) return null;

//   const current = all[index];

//   if (
//     updates.invoiceNumber &&
//     updates.invoiceNumber !== current.invoiceNumber &&
//     (await invoiceNumberExists(updates.invoiceNumber, id))
//   ) {
//     throw new Error(
//       `Invoice number ${updates.invoiceNumber} already exists.`
//     );
//   }

//   const merged: Invoice = {
//     ...current,
//     ...updates,
//     id: current.id,
//     cloudId: current.cloudId,
//     userId: current.userId,
//     items: updates.items
//       ? buildInvoiceItems(updates.items)
//       : current.items,
//     updatedAt: new Date().toISOString(),
//     synced: false,
//     syncedAt: "",
//   };

//   let calculated = recalculateInvoice(merged);

//   if (updates.status === "paid") {
//     calculated = {
//       ...calculated,
//       status: "paid",
//       amountPaid: calculated.grandTotal,
//       balanceDue: 0,
//       paidAt:
//         updates.paymentDate ||
//         updates.paidAt ||
//         current.paidAt ||
//         new Date().toISOString(),
//     };
//   } else if (updates.status === "partially_paid") {
//     const safeAmountPaid = Math.min(
//       calculated.grandTotal,
//       Math.max(0, Number(updates.amountPaid ?? merged.amountPaid ?? 0))
//     );

//     calculated = {
//       ...calculated,
//       status:
//         safeAmountPaid >= calculated.grandTotal
//           ? "paid"
//           : "partially_paid",
//       amountPaid: safeAmountPaid,
//       balanceDue: Math.max(
//         0,
//         calculated.grandTotal - safeAmountPaid
//       ),
//       paidAt:
//         safeAmountPaid >= calculated.grandTotal
//           ? updates.paymentDate ||
//             updates.paidAt ||
//             current.paidAt ||
//             new Date().toISOString()
//           : undefined,
//     };
//   } else if (updates.status === "unpaid") {
//     calculated = {
//       ...calculated,
//       status: "unpaid",
//       amountPaid: 0,
//       balanceDue: calculated.grandTotal,
//       paidAt: undefined,
//     };
//   }

//   all[index] = calculated;

//   await setLocal(INVOICE_STORAGE_KEY, all);

//   if (
//     !calculated.stockProcessed &&
//     shouldProcessStockForStatus(
//       calculated.stockReductionTrigger,
//       calculated.status
//     )
//   ) {
//     return await processInvoiceStock(calculated.id);
//   }

//   return calculated;
// }

// export async function deleteInvoice(id: string): Promise<void> {
//   const userId = await getCurrentUserId();
//   const all = await getAllInvoices();

//   const invoice = all.find(
//     (item) => item.id === id && item.userId === userId
//   );

//   if (!invoice) return;

//   if (invoice.stockProcessed) {
//     throw new Error(
//       "This invoice has already reduced stock and cannot be deleted. Cancel it instead."
//     );
//   }

//   await setLocal(
//     INVOICE_STORAGE_KEY,
//     all.filter(
//       (item) => !(item.id === id && item.userId === userId)
//     )
//   );
// }

// export async function saveAllInvoices(
//   invoices: Invoice[]
// ): Promise<void> {
//   await setLocal(INVOICE_STORAGE_KEY, invoices);
// }

// /* -------------------------------------------------------------------------- */
// /*                             STATUS OPERATIONS                              */
// /* -------------------------------------------------------------------------- */

// export async function markInvoiceAsSent(
//   id: string
// ): Promise<Invoice | null> {
//   return await updateInvoice(id, {
//     status: "sent",
//     sentAt: new Date().toISOString(),
//   });
// }

// export async function markInvoiceAsPaid(
//   id: string,
//   amountPaid?: number
// ): Promise<Invoice | null> {
//   const invoice = await getInvoiceById(id);
//   if (!invoice) return null;

//   const paid = amountPaid ?? invoice.grandTotal;

//   return await updateInvoice(id, {
//     status: paid >= invoice.grandTotal ? "paid" : "partially_paid",
//     amountPaid: Math.max(0, Number(paid || 0)),
//     paidAt:
//       paid >= invoice.grandTotal
//         ? new Date().toISOString()
//         : invoice.paidAt,
//   });
// }

// export async function cancelInvoice(
//   id: string
// ): Promise<Invoice | null> {
//   const invoice = await getInvoiceById(id);
//   if (!invoice) return null;

//   if (invoice.stockProcessed) {
//     throw new Error(
//       "Stock was already processed for this invoice. A stock reversal or credit-note workflow is required."
//     );
//   }

//   return await updateInvoice(id, {
//     status: "cancelled",
//     cancelledAt: new Date().toISOString(),
//   });
// }

// /* -------------------------------------------------------------------------- */
// /*                           STOCK PROCESSING                                 */
// /* -------------------------------------------------------------------------- */

// export async function processInvoiceStock(
//   invoiceId: string
// ): Promise<Invoice> {
//   const userId = await getCurrentUserId();
//   const allInvoices = await getAllInvoices();

//   const invoiceIndex = allInvoices.findIndex(
//     (invoice) =>
//       invoice.id === invoiceId && invoice.userId === userId
//   );

//   if (invoiceIndex === -1) {
//     throw new Error("Invoice not found.");
//   }

//   const invoice = allInvoices[invoiceIndex];

//   if (invoice.stockProcessed) {
//     return invoice;
//   }

//   const stockItems = await getStockItems();

//   const stockLines = invoice.items.filter(
//     (item) =>
//       item.sourceType === "stock" &&
//       Boolean(item.stockId) &&
//       Number(item.quantity) > 0 &&
//       !item.stockProcessed
//   );

//   // Validate every stock line before changing any quantity.
//   for (const line of stockLines) {
//     const stock = stockItems.find(
//       (item) => item.id === line.stockId
//     );

//     if (!stock) {
//       throw new Error(
//         `Stock item "${line.productName}" could not be found.`
//       );
//     }

//     const quantityToProcess =
//       Number(line.quantity) -
//       Number(line.stockProcessedQuantity || 0);

//     if (quantityToProcess <= 0) continue;

//     if (stock.quantity < quantityToProcess) {
//       throw new Error(
//         `Insufficient stock for "${line.productName}". Available: ${stock.quantity}, required: ${quantityToProcess}.`
//       );
//     }
//   }

//   const processedItems: InvoiceItem[] = [...invoice.items];

//   for (let index = 0; index < processedItems.length; index += 1) {
//     const line = processedItems[index];

//     if (
//       line.sourceType !== "stock" ||
//       !line.stockId ||
//       line.stockProcessed
//     ) {
//       continue;
//     }

//     const stock = stockItems.find(
//       (item) => item.id === line.stockId
//     );

//     if (!stock) continue;

//     const alreadyProcessed = Number(
//       line.stockProcessedQuantity || 0
//     );

//     const quantityToProcess =
//       Number(line.quantity) - alreadyProcessed;

//     if (quantityToProcess <= 0) {
//       processedItems[index] = {
//         ...line,
//         stockProcessed: true,
//         stockProcessedQuantity: Number(line.quantity),
//       };
//       continue;
//     }

//     const newBalance = stock.quantity - quantityToProcess;

//     await updateStockQuantity(stock.id, newBalance);

//     await saveStockMovement({
//       stockItemId: stock.id,
//       itemName: stock.name,
//       type: "OUT",
//       quantity: quantityToProcess,
//       source: "INVOICE",
//       sourceLabel: `Invoice ${invoice.invoiceNumber}`,
//       balanceAfter: newBalance,
//       referenceId: invoice.id,
//       referenceType: "INVOICE",
//       note: invoice.customerName
//         ? `Invoice issued to ${invoice.customerName}`
//         : undefined,
//     });

//     stock.quantity = newBalance;

//     processedItems[index] = {
//       ...line,
//       stockProcessed: true,
//       stockProcessedQuantity: Number(line.quantity),
//     };
//   }

//   const updatedInvoice: Invoice = {
//     ...invoice,
//     items: processedItems,
//     stockProcessed: processedItems
//       .filter((item) => item.sourceType === "stock")
//       .every((item) => item.stockProcessed),
//     updatedAt: new Date().toISOString(),
//     synced: false,
//     syncedAt: "",
//   };

//   allInvoices[invoiceIndex] = updatedInvoice;
//   await setLocal(INVOICE_STORAGE_KEY, allInvoices);

//   return updatedInvoice;
// }

// /* -------------------------------------------------------------------------- */
// /*                                SYNC HELPERS                                */
// /* -------------------------------------------------------------------------- */

// export async function getUnsyncedInvoices(): Promise<Invoice[]> {
//   const userId = await getCurrentUserId();
//   const all = await getAllInvoices();

//   return all.filter(
//     (invoice) => invoice.userId === userId && !invoice.synced
//   );
// }

// export async function markInvoiceSynced(
//   id: string,
//   cloudId?: string,
//   syncedAt = new Date().toISOString()
// ): Promise<void> {
//   const userId = await getCurrentUserId();
//   const all = await getAllInvoices();

//   const updated = all.map((invoice) =>
//     invoice.id === id && invoice.userId === userId
//       ? {
//           ...invoice,
//           cloudId: cloudId || invoice.cloudId,
//           synced: true,
//           syncedAt,
//         }
//       : invoice
//   );

//   await setLocal(INVOICE_STORAGE_KEY, updated);
// }

// export async function linkGuestInvoicesToUser(
//   userId: string
// ): Promise<void> {
//   const all = await getAllInvoices();
//   let changed = false;

//   const updated = all.map((invoice) => {
//     if (invoice.userId !== "guest") return invoice;

//     changed = true;

//     return {
//       ...invoice,
//       userId,
//       synced: false,
//       syncedAt: "",
//       updatedAt: new Date().toISOString(),
//     };
//   });

//   if (changed) {
//     await setLocal(INVOICE_STORAGE_KEY, updated);
//   }
// }

// export async function clearInvoices(): Promise<void> {
//   const userId = await getCurrentUserId();
//   const all = await getAllInvoices();

//   const remaining = all.filter(
//     (invoice) => invoice.userId !== userId
//   );

//   await setLocal(INVOICE_STORAGE_KEY, remaining);
// }

// lib/invoiceStorage.ts
import { getCachedUserId } from "@/context/AuthContext";
import { recalculateInvoice } from "@/lib/invoiceCalculations";
import {
  getLocal,
  getStockItems,
  saveStockMovement,
  setLocal,
  updateStockQuantity,
} from "@/lib/storage";
import type {
  CreateInvoiceInput,
  CreateInvoicePaymentInput,
  Invoice,
  InvoiceItem,
  InvoicePayment,
  InvoicePaymentMethod,
  InvoiceStatus,
  StockReductionTrigger,
} from "@/types/invoice";

const INVOICE_STORAGE_KEY = "invoices";
const INVOICE_PAYMENT_STORAGE_KEY = "invoicePayments";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const createLocalId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getCurrentUserId = async (): Promise<string> =>
  (await getCachedUserId()) || "guest";

const normalizePrefix = (prefix?: string): string => {
  const cleaned = String(prefix || "INV")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toUpperCase();

  return cleaned || "INV";
};

const shouldProcessStockForStatus = (
  trigger: StockReductionTrigger,
  status: InvoiceStatus
): boolean => {
  if (trigger === "never") return false;
  if (trigger === "created") return true;
  if (trigger === "sent") {
    return ["sent", "unpaid", "partially_paid", "paid", "overdue"].includes(
      status
    );
  }
  if (trigger === "paid") return status === "paid";

  return false;
};

const buildInvoiceItems = (items: InvoiceItem[]): InvoiceItem[] =>
  items.map((item) => ({
    ...item,
    id: item.id || createLocalId(),
    discountValue: Number(item.discountValue || 0),
    discountAmount: Number(item.discountAmount || 0),
    taxRate: Number(item.taxRate || 0),
    taxExempt: Boolean(item.taxExempt),
    stockProcessed: Boolean(item.stockProcessed),
    stockProcessedQuantity: Number(item.stockProcessedQuantity || 0),
  }));

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
): InvoiceStatus => {
  if (invoice.status === "cancelled") return "cancelled";

  const grandTotal = roundMoney(invoice.grandTotal);
  const paid = roundMoney(amountPaid);

  if (grandTotal > 0 && paid >= grandTotal) return "paid";
  if (paid > 0) return "partially_paid";

  if (invoice.status === "draft") return "draft";
  if (invoice.status === "overdue") return "overdue";

  return invoice.sentAt || invoice.status === "sent" ? "unpaid" : "unpaid";
};

const applyPaymentSummary = (
  invoice: Invoice,
  payments: InvoicePayment[]
): Invoice => {
  const sortedPayments = sortPaymentsNewestFirst(payments);
  const totalPaid = roundMoney(
    sortedPayments.reduce(
      (total, payment) => total + Math.max(0, Number(payment.amount || 0)),
      0
    )
  );
  const grandTotal = roundMoney(invoice.grandTotal);
  const amountPaid = Math.min(grandTotal, totalPaid);
  const balanceDue = roundMoney(Math.max(0, grandTotal - amountPaid));
  const status = derivePaymentStatus(invoice, amountPaid);
  const latestPayment = sortedPayments[0];

  return {
    ...invoice,
    status,
    amountPaid,
    balanceDue,
    payments: sortedPayments,
    paidAt:
      status === "paid"
        ? latestPayment?.paymentDate || invoice.paidAt || new Date().toISOString()
        : undefined,

    // Keep these legacy fields populated until create/edit/PDF screens are
    // fully migrated to the payment-history model.
    paymentMethod: latestPayment?.method || invoice.paymentMethod,
    paymentDate: latestPayment?.paymentDate || invoice.paymentDate,
    paymentReference: latestPayment?.reference || invoice.paymentReference,
  };
};

const createPaymentRecord = (
  input: CreateInvoicePaymentInput,
  userId: string,
  now = new Date().toISOString()
): InvoicePayment => ({
  id: createLocalId(),
  cloudId: undefined,
  invoiceId: input.invoiceId,
  userId,
  amount: roundMoney(Math.max(0, Number(input.amount || 0))),
  method: input.method,
  paymentDate: input.paymentDate || now,
  reference: input.reference?.trim() || undefined,
  notes: input.notes?.trim() || undefined,
  createdAt: now,
  updatedAt: now,
  synced: false,
  syncedAt: "",
});

async function getPaymentsForInvoiceAndUser(
  invoiceId: string,
  userId: string
): Promise<InvoicePayment[]> {
  const allPayments = await getAllInvoicePayments();

  return sortPaymentsNewestFirst(
    allPayments.filter(
      (payment) =>
        payment.invoiceId === invoiceId && payment.userId === userId
    )
  );
}

async function ensureLegacyPaymentRecord(
  invoice: Invoice,
  userId: string
): Promise<InvoicePayment[]> {
  const existing = await getPaymentsForInvoiceAndUser(invoice.id, userId);

  if (existing.length > 0 || Number(invoice.amountPaid || 0) <= 0) {
    return existing;
  }

  const now = new Date().toISOString();
  const legacyPayment = createPaymentRecord(
    {
      invoiceId: invoice.id,
      amount: Math.min(
        Number(invoice.grandTotal || 0),
        Number(invoice.amountPaid || 0)
      ),
      method: invoice.paymentMethod || "other",
      paymentDate:
        invoice.paymentDate || invoice.paidAt || invoice.updatedAt || now,
      reference: invoice.paymentReference || "Migrated existing payment",
      notes: "Created automatically from the previous single-payment record.",
    },
    userId,
    now
  );

  const allPayments = await getAllInvoicePayments();
  allPayments.push(legacyPayment);
  await setLocal(INVOICE_PAYMENT_STORAGE_KEY, allPayments);

  return [legacyPayment];
}

/* -------------------------------------------------------------------------- */
/*                              READ OPERATIONS                               */
/* -------------------------------------------------------------------------- */

export async function getAllInvoices(): Promise<Invoice[]> {
  return (await getLocal<Invoice>(INVOICE_STORAGE_KEY)) || [];
}

export async function getAllInvoicePayments(): Promise<InvoicePayment[]> {
  return (await getLocal<InvoicePayment>(INVOICE_PAYMENT_STORAGE_KEY)) || [];
}

export async function getInvoices(): Promise<Invoice[]> {
  const userId = await getCurrentUserId();
  const all = await getAllInvoices();

  return all
    .filter((invoice) => invoice.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
}

export async function getInvoiceById(
  id: string
): Promise<Invoice | null> {
  const userId = await getCurrentUserId();
  const all = await getAllInvoices();

  const invoice =
    all.find(
      (item) =>
        (item.id === id || item.cloudId === id) &&
        item.userId === userId
    ) ?? null;

  if (!invoice) return null;

  const payments = await getPaymentsForInvoiceAndUser(invoice.id, userId);

  return payments.length > 0
    ? applyPaymentSummary(invoice, payments)
    : { ...invoice, payments: [] };
}

export async function getInvoiceByNumber(
  invoiceNumber: string
): Promise<Invoice | null> {
  const userId = await getCurrentUserId();
  const target = invoiceNumber.trim().toLowerCase();
  const all = await getAllInvoices();

  return (
    all.find(
      (invoice) =>
        invoice.userId === userId &&
        invoice.invoiceNumber.trim().toLowerCase() === target
    ) ?? null
  );
}

export async function invoiceNumberExists(
  invoiceNumber: string,
  excludeInvoiceId?: string
): Promise<boolean> {
  const userId = await getCurrentUserId();
  const target = invoiceNumber.trim().toLowerCase();
  const all = await getAllInvoices();

  return all.some(
    (invoice) =>
      invoice.userId === userId &&
      invoice.id !== excludeInvoiceId &&
      invoice.invoiceNumber.trim().toLowerCase() === target
  );
}

/* -------------------------------------------------------------------------- */
/*                           INVOICE NUMBER GENERATOR                         */
/* -------------------------------------------------------------------------- */

export async function getNextInvoiceNumber(
  prefix = "INV",
  padding = 4
): Promise<string> {
  const userId = await getCurrentUserId();
  const safePrefix = normalizePrefix(prefix);
  const all = await getAllInvoices();

  const pattern = new RegExp(`^${safePrefix}-(\\d+)$`, "i");

  const highest = all
    .filter((invoice) => invoice.userId === userId)
    .reduce((max, invoice) => {
      const match = invoice.invoiceNumber.match(pattern);
      if (!match) return max;

      const current = Number(match[1]);
      return Number.isFinite(current) ? Math.max(max, current) : max;
    }, 0);

  return `${safePrefix}-${String(highest + 1).padStart(padding, "0")}`;
}

/* -------------------------------------------------------------------------- */
/*                              CREATE INVOICE                                */
/* -------------------------------------------------------------------------- */

export async function saveInvoice(
  input: CreateInvoiceInput,
  status: InvoiceStatus = input.status || "draft"
): Promise<Invoice> {
  const userId = await getCurrentUserId();

  if (!input.customerName?.trim()) {
    throw new Error("Customer name is required.");
  }

  if (!input.invoiceNumber?.trim()) {
    throw new Error("Invoice number is required.");
  }

  if (!input.items?.length) {
    throw new Error("Add at least one product or service.");
  }

  if (await invoiceNumberExists(input.invoiceNumber)) {
    throw new Error(`Invoice number ${input.invoiceNumber} already exists.`);
  }

  const now = new Date().toISOString();

  const invoice: Invoice = {
    id: createLocalId(),
    cloudId: undefined,
    userId,

    invoiceNumber: input.invoiceNumber.trim(),
    status,

    invoiceDate: input.invoiceDate || now,
    dueDate: input.dueDate,

    purchaseOrderNumber: input.purchaseOrderNumber?.trim(),
    reference: input.reference?.trim(),

    customerId: input.customerId?.trim() || undefined,

    customerName: input.customerName.trim(),
    customerCompany: input.customerCompany?.trim(),
    customerEmail: input.customerEmail?.trim(),
    customerPhone: input.customerPhone?.trim(),

    billingAddress: input.billingAddress?.trim(),
    shippingAddress: input.shippingAddress?.trim(),
    customerTaxNumber: input.customerTaxNumber?.trim(),

    currencyCode: input.currencyCode || "GBP",
    currencySymbol: input.currencySymbol || "£",
    locale: input.locale || "en-GB",

    taxEnabled: Boolean(input.taxEnabled),
    taxLabel: input.taxLabel || "Tax",
    pricesIncludeTax: Boolean(input.pricesIncludeTax),

    items: buildInvoiceItems(input.items),

    subtotal: 0,
    itemDiscountTotal: 0,

    invoiceDiscountType: input.invoiceDiscountType,
    invoiceDiscountValue: Number(input.invoiceDiscountValue || 0),
    invoiceDiscountAmount: 0,

    shippingAmount: Number(input.shippingAmount || 0),
    taxTotal: 0,
    roundingAdjustment: Number(input.roundingAdjustment || 0),
    grandTotal: 0,

    amountPaid: Math.max(0, Number(input.amountPaid || 0)),
    balanceDue: 0,
    payments: [],

    paymentMethod: input.paymentMethod,
    paymentDate: input.paymentDate,
    paymentReference: input.paymentReference?.trim(),

    notes: input.notes?.trim(),
    paymentTerms: input.paymentTerms?.trim(),
    paymentInstructions: input.paymentInstructions?.trim(),
    termsAndConditions: input.termsAndConditions?.trim(),

    stockReductionTrigger: input.stockReductionTrigger || "sent",
    stockProcessed: false,

    createdAt: now,
    updatedAt: now,
    sentAt: undefined,
    paidAt: undefined,
    cancelledAt: undefined,

    synced: false,
    syncedAt: "",
  };

  let calculated = recalculateInvoice(invoice);

  if (status === "paid") {
    calculated = {
      ...calculated,
      status: "paid",
      amountPaid: calculated.grandTotal,
      balanceDue: 0,
      paidAt: input.paymentDate || now,
      paymentDate: input.paymentDate || now,
    };
  } else if (status === "partially_paid") {
    const safeAmountPaid = Math.min(
      calculated.grandTotal,
      Math.max(0, Number(input.amountPaid || 0))
    );

    calculated = {
      ...calculated,
      status:
        safeAmountPaid >= calculated.grandTotal
          ? "paid"
          : "partially_paid",
      amountPaid: safeAmountPaid,
      balanceDue: Math.max(
        0,
        calculated.grandTotal - safeAmountPaid
      ),
      paidAt:
        safeAmountPaid >= calculated.grandTotal
          ? input.paymentDate || now
          : undefined,
      paymentDate: input.paymentDate || now,
    };
  } else if (status === "unpaid") {
    calculated = {
      ...calculated,
      status: "unpaid",
      amountPaid: 0,
      balanceDue: calculated.grandTotal,
      paidAt: undefined,
    };
  }

  let initialPayments: InvoicePayment[] = [];

  if (Number(calculated.amountPaid || 0) > 0) {
    const initialPayment = createPaymentRecord(
      {
        invoiceId: calculated.id,
        amount: calculated.amountPaid,
        method: input.paymentMethod || "other",
        paymentDate: input.paymentDate || now,
        reference: input.paymentReference,
        notes: "Initial payment recorded when the invoice was created.",
      },
      userId,
      now
    );

    const allPayments = await getAllInvoicePayments();
    allPayments.push(initialPayment);
    await setLocal(INVOICE_PAYMENT_STORAGE_KEY, allPayments);
    initialPayments = [initialPayment];
    calculated = applyPaymentSummary(calculated, initialPayments);
  } else {
    calculated = { ...calculated, payments: [] };
  }

  const all = await getAllInvoices();
  all.push(calculated);
  await setLocal(INVOICE_STORAGE_KEY, all);

  if (
    shouldProcessStockForStatus(
      calculated.stockReductionTrigger,
      calculated.status
    )
  ) {
    return await processInvoiceStock(calculated.id);
  }

  return calculated;
}

/* -------------------------------------------------------------------------- */
/*                              UPDATE INVOICE                                */
/* -------------------------------------------------------------------------- */

export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>
): Promise<Invoice | null> {
  const userId = await getCurrentUserId();
  const all = await getAllInvoices();

  const index = all.findIndex(
    (invoice) => invoice.id === id && invoice.userId === userId
  );

  if (index === -1) return null;

  const current = all[index];
  const existingPayments = await ensureLegacyPaymentRecord(current, userId);

  if (
    updates.invoiceNumber &&
    updates.invoiceNumber !== current.invoiceNumber &&
    (await invoiceNumberExists(updates.invoiceNumber, id))
  ) {
    throw new Error(
      `Invoice number ${updates.invoiceNumber} already exists.`
    );
  }

  const merged: Invoice = {
    ...current,
    ...updates,
    id: current.id,
    cloudId: current.cloudId,
    userId: current.userId,
    items: updates.items
      ? buildInvoiceItems(updates.items)
      : current.items,
    updatedAt: new Date().toISOString(),
    synced: false,
    syncedAt: "",
  };

  let calculated = recalculateInvoice(merged);

  if (existingPayments.length > 0) {
    calculated = applyPaymentSummary(calculated, existingPayments);
  } else if (updates.status === "paid") {
    const payment = createPaymentRecord(
      {
        invoiceId: current.id,
        amount: calculated.grandTotal,
        method: updates.paymentMethod || current.paymentMethod || "other",
        paymentDate:
          updates.paymentDate ||
          updates.paidAt ||
          current.paidAt ||
          new Date().toISOString(),
        reference: updates.paymentReference || current.paymentReference,
        notes: "Payment created from the invoice edit screen.",
      },
      userId
    );

    const allPayments = await getAllInvoicePayments();
    allPayments.push(payment);
    await setLocal(INVOICE_PAYMENT_STORAGE_KEY, allPayments);
    calculated = applyPaymentSummary(calculated, [payment]);
  } else if (updates.status === "partially_paid") {
    const safeAmountPaid = Math.min(
      calculated.grandTotal,
      Math.max(0, Number(updates.amountPaid ?? merged.amountPaid ?? 0))
    );

    if (safeAmountPaid > 0) {
      const payment = createPaymentRecord(
        {
          invoiceId: current.id,
          amount: safeAmountPaid,
          method: updates.paymentMethod || current.paymentMethod || "other",
          paymentDate: updates.paymentDate || new Date().toISOString(),
          reference: updates.paymentReference || current.paymentReference,
          notes: "Partial payment created from the invoice edit screen.",
        },
        userId
      );

      const allPayments = await getAllInvoicePayments();
      allPayments.push(payment);
      await setLocal(INVOICE_PAYMENT_STORAGE_KEY, allPayments);
      calculated = applyPaymentSummary(calculated, [payment]);
    } else {
      calculated = {
        ...calculated,
        status: "unpaid",
        amountPaid: 0,
        balanceDue: calculated.grandTotal,
        payments: [],
        paidAt: undefined,
      };
    }
  } else if (updates.status === "unpaid") {
    calculated = {
      ...calculated,
      status: "unpaid",
      amountPaid: 0,
      balanceDue: calculated.grandTotal,
      payments: [],
      paidAt: undefined,
    };
  }

  all[index] = calculated;

  await setLocal(INVOICE_STORAGE_KEY, all);

  if (
    !calculated.stockProcessed &&
    shouldProcessStockForStatus(
      calculated.stockReductionTrigger,
      calculated.status
    )
  ) {
    return await processInvoiceStock(calculated.id);
  }

  return calculated;
}

export async function deleteInvoice(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const all = await getAllInvoices();

  const invoice = all.find(
    (item) => item.id === id && item.userId === userId
  );

  if (!invoice) return;

  if (invoice.stockProcessed) {
    throw new Error(
      "This invoice has already reduced stock and cannot be deleted. Cancel it instead."
    );
  }

  await setLocal(
    INVOICE_STORAGE_KEY,
    all.filter(
      (item) => !(item.id === id && item.userId === userId)
    )
  );

  const allPayments = await getAllInvoicePayments();
  await setLocal(
    INVOICE_PAYMENT_STORAGE_KEY,
    allPayments.filter(
      (payment) =>
        !(payment.invoiceId === id && payment.userId === userId)
    )
  );
}

export async function saveAllInvoices(
  invoices: Invoice[]
): Promise<void> {
  await setLocal(INVOICE_STORAGE_KEY, invoices);
}

/* -------------------------------------------------------------------------- */
/*                            PAYMENT OPERATIONS                              */
/* -------------------------------------------------------------------------- */

export async function getInvoicePayments(
  invoiceId: string
): Promise<InvoicePayment[]> {
  const userId = await getCurrentUserId();
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  return await ensureLegacyPaymentRecord(invoice, userId);
}

export async function recalculateInvoicePayments(
  invoiceId: string,
  migrateLegacyPayment = true
): Promise<Invoice | null> {
  const userId = await getCurrentUserId();
  const allInvoices = await getAllInvoices();
  const invoiceIndex = allInvoices.findIndex(
    (invoice) =>
      (invoice.id === invoiceId || invoice.cloudId === invoiceId) &&
      invoice.userId === userId
  );

  if (invoiceIndex === -1) return null;

  const current = allInvoices[invoiceIndex];
  const payments = migrateLegacyPayment
    ? await ensureLegacyPaymentRecord(current, userId)
    : await getPaymentsForInvoiceAndUser(current.id, userId);
  const updated = {
    ...applyPaymentSummary(current, payments),
    updatedAt: new Date().toISOString(),
    synced: false,
    syncedAt: "",
  };

  allInvoices[invoiceIndex] = updated;
  await setLocal(INVOICE_STORAGE_KEY, allInvoices);

  if (
    !updated.stockProcessed &&
    shouldProcessStockForStatus(
      updated.stockReductionTrigger,
      updated.status
    )
  ) {
    return await processInvoiceStock(updated.id);
  }

  return updated;
}

export async function addInvoicePayment(
  input: CreateInvoicePaymentInput
): Promise<Invoice> {
  const userId = await getCurrentUserId();
  const invoice = await getInvoiceById(input.invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  if (invoice.status === "cancelled") {
    throw new Error("A payment cannot be added to a cancelled invoice.");
  }

  const amount = roundMoney(Number(input.amount || 0));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const existingPayments = await ensureLegacyPaymentRecord(invoice, userId);
  const currentPaid = roundMoney(
    existingPayments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    )
  );
  const currentBalance = roundMoney(
    Math.max(0, Number(invoice.grandTotal || 0) - currentPaid)
  );

  if (amount > currentBalance) {
    throw new Error(
      `Payment cannot exceed the outstanding balance of ${invoice.currencySymbol}${currentBalance.toFixed(2)}.`
    );
  }

  const payment = createPaymentRecord(
    {
      ...input,
      invoiceId: invoice.id,
      amount,
    },
    userId
  );

  const allPayments = await getAllInvoicePayments();
  allPayments.push(payment);
  await setLocal(INVOICE_PAYMENT_STORAGE_KEY, allPayments);

  const updated = await recalculateInvoicePayments(invoice.id);

  if (!updated) {
    throw new Error("Payment was saved, but the invoice could not be updated.");
  }

  return updated;
}

export async function deleteInvoicePayment(
  invoiceId: string,
  paymentId: string
): Promise<Invoice> {
  const userId = await getCurrentUserId();
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  const allPayments = await getAllInvoicePayments();
  const payment = allPayments.find(
    (item) =>
      (item.id === paymentId || item.cloudId === paymentId) &&
      item.invoiceId === invoice.id &&
      item.userId === userId
  );

  if (!payment) {
    throw new Error("Payment not found.");
  }

  await setLocal(
    INVOICE_PAYMENT_STORAGE_KEY,
    allPayments.filter((item) => item.id !== payment.id)
  );

  const updated = await recalculateInvoicePayments(invoice.id, false);

  if (!updated) {
    throw new Error("Payment was deleted, but the invoice could not be updated.");
  }

  return updated;
}

export async function getUnsyncedInvoicePayments(): Promise<InvoicePayment[]> {
  const userId = await getCurrentUserId();
  const allPayments = await getAllInvoicePayments();

  return allPayments.filter(
    (payment) => payment.userId === userId && !payment.synced
  );
}

export async function markInvoicePaymentSynced(
  id: string,
  cloudId?: string,
  syncedAt = new Date().toISOString()
): Promise<void> {
  const userId = await getCurrentUserId();
  const allPayments = await getAllInvoicePayments();

  await setLocal(
    INVOICE_PAYMENT_STORAGE_KEY,
    allPayments.map((payment) =>
      payment.id === id && payment.userId === userId
        ? {
            ...payment,
            cloudId: cloudId || payment.cloudId,
            synced: true,
            syncedAt,
          }
        : payment
    )
  );
}

/* -------------------------------------------------------------------------- */
/*                             STATUS OPERATIONS                              */
/* -------------------------------------------------------------------------- */

export async function markInvoiceAsSent(
  id: string
): Promise<Invoice | null> {
  return await updateInvoice(id, {
    status: "sent",
    sentAt: new Date().toISOString(),
  });
}

export async function markInvoiceAsPaid(
  id: string,
  amountPaid?: number,
  method: InvoicePaymentMethod = "other"
): Promise<Invoice | null> {
  const invoice = await getInvoiceById(id);
  if (!invoice) return null;

  const amount = roundMoney(
    amountPaid ?? Number(invoice.balanceDue || invoice.grandTotal || 0)
  );

  if (amount <= 0) return invoice;

  return await addInvoicePayment({
    invoiceId: invoice.id,
    amount,
    method,
    paymentDate: new Date().toISOString(),
    reference: "Marked as paid",
  });
}

export async function cancelInvoice(
  id: string
): Promise<Invoice | null> {
  const invoice = await getInvoiceById(id);
  if (!invoice) return null;

  if (invoice.stockProcessed) {
    throw new Error(
      "Stock was already processed for this invoice. A stock reversal or credit-note workflow is required."
    );
  }

  return await updateInvoice(id, {
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  });
}

/* -------------------------------------------------------------------------- */
/*                           STOCK PROCESSING                                 */
/* -------------------------------------------------------------------------- */

export async function processInvoiceStock(
  invoiceId: string
): Promise<Invoice> {
  const userId = await getCurrentUserId();
  const allInvoices = await getAllInvoices();

  const invoiceIndex = allInvoices.findIndex(
    (invoice) =>
      invoice.id === invoiceId && invoice.userId === userId
  );

  if (invoiceIndex === -1) {
    throw new Error("Invoice not found.");
  }

  const invoice = allInvoices[invoiceIndex];

  if (invoice.stockProcessed) {
    return invoice;
  }

  const stockItems = await getStockItems();

  const stockLines = invoice.items.filter(
    (item) =>
      item.sourceType === "stock" &&
      Boolean(item.stockId) &&
      Number(item.quantity) > 0 &&
      !item.stockProcessed
  );

  // Validate every stock line before changing any quantity.
  for (const line of stockLines) {
    const stock = stockItems.find(
      (item) => item.id === line.stockId
    );

    if (!stock) {
      throw new Error(
        `Stock item "${line.productName}" could not be found.`
      );
    }

    const quantityToProcess =
      Number(line.quantity) -
      Number(line.stockProcessedQuantity || 0);

    if (quantityToProcess <= 0) continue;

    if (stock.quantity < quantityToProcess) {
      throw new Error(
        `Insufficient stock for "${line.productName}". Available: ${stock.quantity}, required: ${quantityToProcess}.`
      );
    }
  }

  const processedItems: InvoiceItem[] = [...invoice.items];

  for (let index = 0; index < processedItems.length; index += 1) {
    const line = processedItems[index];

    if (
      line.sourceType !== "stock" ||
      !line.stockId ||
      line.stockProcessed
    ) {
      continue;
    }

    const stock = stockItems.find(
      (item) => item.id === line.stockId
    );

    if (!stock) continue;

    const alreadyProcessed = Number(
      line.stockProcessedQuantity || 0
    );

    const quantityToProcess =
      Number(line.quantity) - alreadyProcessed;

    if (quantityToProcess <= 0) {
      processedItems[index] = {
        ...line,
        stockProcessed: true,
        stockProcessedQuantity: Number(line.quantity),
      };
      continue;
    }

    const newBalance = stock.quantity - quantityToProcess;

    await updateStockQuantity(stock.id, newBalance);

    await saveStockMovement({
      stockItemId: stock.id,
      itemName: stock.name,
      type: "OUT",
      quantity: quantityToProcess,
      source: "INVOICE",
      sourceLabel: `Invoice ${invoice.invoiceNumber}`,
      balanceAfter: newBalance,
      referenceId: invoice.id,
      referenceType: "INVOICE",
      note: invoice.customerName
        ? `Invoice issued to ${invoice.customerName}`
        : undefined,
    });

    stock.quantity = newBalance;

    processedItems[index] = {
      ...line,
      stockProcessed: true,
      stockProcessedQuantity: Number(line.quantity),
    };
  }

  const updatedInvoice: Invoice = {
    ...invoice,
    items: processedItems,
    stockProcessed: processedItems
      .filter((item) => item.sourceType === "stock")
      .every((item) => item.stockProcessed),
    updatedAt: new Date().toISOString(),
    synced: false,
    syncedAt: "",
  };

  allInvoices[invoiceIndex] = updatedInvoice;
  await setLocal(INVOICE_STORAGE_KEY, allInvoices);

  return updatedInvoice;
}

/* -------------------------------------------------------------------------- */
/*                                SYNC HELPERS                                */
/* -------------------------------------------------------------------------- */

export async function getUnsyncedInvoices(): Promise<Invoice[]> {
  const userId = await getCurrentUserId();
  const all = await getAllInvoices();

  return all.filter(
    (invoice) => invoice.userId === userId && !invoice.synced
  );
}

export async function markInvoiceSynced(
  id: string,
  cloudId?: string,
  syncedAt = new Date().toISOString()
): Promise<void> {
  const userId = await getCurrentUserId();
  const all = await getAllInvoices();

  const updated = all.map((invoice) =>
    invoice.id === id && invoice.userId === userId
      ? {
          ...invoice,
          cloudId: cloudId || invoice.cloudId,
          synced: true,
          syncedAt,
        }
      : invoice
  );

  await setLocal(INVOICE_STORAGE_KEY, updated);
}

export async function linkGuestInvoicesToUser(
  userId: string
): Promise<void> {
  const all = await getAllInvoices();
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
    await setLocal(INVOICE_STORAGE_KEY, updated);
  }

  const allPayments = await getAllInvoicePayments();
  let paymentsChanged = false;
  const updatedPayments = allPayments.map((payment) => {
    if (payment.userId !== "guest") return payment;

    paymentsChanged = true;
    return {
      ...payment,
      userId,
      synced: false,
      syncedAt: "",
      updatedAt: new Date().toISOString(),
    };
  });

  if (paymentsChanged) {
    await setLocal(INVOICE_PAYMENT_STORAGE_KEY, updatedPayments);
  }
}

export async function clearInvoices(): Promise<void> {
  const userId = await getCurrentUserId();
  const all = await getAllInvoices();

  const remaining = all.filter(
    (invoice) => invoice.userId !== userId
  );

  await setLocal(INVOICE_STORAGE_KEY, remaining);

  const allPayments = await getAllInvoicePayments();
  await setLocal(
    INVOICE_PAYMENT_STORAGE_KEY,
    allPayments.filter((payment) => payment.userId !== userId)
  );
}
