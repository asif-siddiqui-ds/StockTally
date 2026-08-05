// // lib/invoicePdf.ts
// import type { CompanyProfile } from "@/lib/storage";
// import type { Invoice } from "@/types/invoice";

// const escapeHtml = (value?: string | number | null): string =>
//   String(value ?? "")
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");

// const nl2br = (value?: string | null): string =>
//   escapeHtml(value).replace(/\n/g, "<br />");

// const formatDate = (value?: string): string => {
//   if (!value) return "—";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return escapeHtml(value);
//   }

//   return date.toLocaleDateString(undefined, {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatMoney = (
//   amount: number,
//   invoice: Invoice
// ): string => {
//   try {
//     return new Intl.NumberFormat(invoice.locale || "en-GB", {
//       style: "currency",
//       currency: invoice.currencyCode || "GBP",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(Number(amount || 0));
//   } catch {
//     return `${invoice.currencySymbol || ""}${Number(
//       amount || 0
//     ).toFixed(2)}`;
//   }
// };

// const statusLabel = (status: Invoice["status"]): string =>
//   ({
//     draft: "DRAFT",
//     sent: "SENT",
//     unpaid: "UNPAID",
//     partially_paid: "PART PAID",
//     paid: "PAID",
//     overdue: "OVERDUE",
//     cancelled: "CANCELLED",
//   })[status] || status.toUpperCase();

// export const buildInvoiceA4Html = ({
//   invoice,
//   companyProfile,
//   logoSource,
// }: {
//   invoice: Invoice;
//   companyProfile: CompanyProfile | null;
//   /**
//    * A display-ready URL or base64 data URI.
//    * Do not pass an Appwrite file ID here.
//    */
//   logoSource?: string;
// }): string => {
//   const companyName =
//     companyProfile?.companyName || "Your Company";
//   const companyAddress = companyProfile?.address || "";
//   const companyPhone = companyProfile?.phoneNumber || "";
//   const companyEmail =
//     (companyProfile as any)?.companyEmail || "";
//   const website = (companyProfile as any)?.website || "";
//   const taxRegistrationNumber =
//     (companyProfile as any)?.taxRegistrationNumber || "";

//   const bankName = (companyProfile as any)?.bankName || "";
//   const bankAccountName =
//     (companyProfile as any)?.bankAccountName || "";
//   const bankAccountNumber =
//     (companyProfile as any)?.bankAccountNumber || "";
//   const bankSortCode =
//     (companyProfile as any)?.bankSortCode || "";
//   const bankIban = (companyProfile as any)?.bankIban || "";
//   const bankSwiftCode =
//     (companyProfile as any)?.bankSwiftCode || "";

//   const footerMessage =
//     (companyProfile as any)?.invoiceFooterMessage ||
//     "Thank you for your business.";

//   const accent =
//     (companyProfile as any)?.invoiceAccentColor || "#1f4e78";

//   const rows = invoice.items
//     .map(
//       (item, index) => `
//         <tr>
//           <td class="center">${index + 1}</td>
//           <td>
//             <div class="item-name">${escapeHtml(
//               item.productName
//             )}</div>
//             ${
//               item.description
//                 ? `<div class="item-description">${nl2br(
//                     item.description
//                   )}</div>`
//                 : ""
//             }
//           </td>
//           <td class="center">${escapeHtml(item.quantity)}</td>
//           <td class="center">${escapeHtml(item.unit || "item")}</td>
//           <td class="right">${escapeHtml(
//             formatMoney(item.unitPrice, invoice)
//           )}</td>
//           <td class="right">${escapeHtml(
//             item.discountValue > 0
//               ? item.discountType === "percentage"
//                 ? `${item.discountValue}%`
//                 : formatMoney(item.discountAmount, invoice)
//               : "—"
//           )}</td>
//           <td class="center">${
//             invoice.taxEnabled && !item.taxExempt
//               ? `${escapeHtml(item.taxRate)}%`
//               : "—"
//           }</td>
//           <td class="right strong">${escapeHtml(
//             formatMoney(item.total, invoice)
//           )}</td>
//         </tr>
//       `
//     )
//     .join("");

//   const paymentDetails = [
//     bankAccountName
//       ? `<div><strong>Account name:</strong> ${escapeHtml(
//           bankAccountName
//         )}</div>`
//       : "",
//     bankName
//       ? `<div><strong>Bank:</strong> ${escapeHtml(bankName)}</div>`
//       : "",
//     bankSortCode
//       ? `<div><strong>Sort code:</strong> ${escapeHtml(
//           bankSortCode
//         )}</div>`
//       : "",
//     bankAccountNumber
//       ? `<div><strong>Account number:</strong> ${escapeHtml(
//           bankAccountNumber
//         )}</div>`
//       : "",
//     bankIban
//       ? `<div><strong>IBAN:</strong> ${escapeHtml(bankIban)}</div>`
//       : "",
//     bankSwiftCode
//       ? `<div><strong>SWIFT/BIC:</strong> ${escapeHtml(
//           bankSwiftCode
//         )}</div>`
//       : "",
//     `<div><strong>Payment reference:</strong> ${escapeHtml(
//       invoice.invoiceNumber
//     )}</div>`,
//   ]
//     .filter(Boolean)
//     .join("");

//   const logoUrl =
//     logoSource &&
//     (/^data:image\//i.test(logoSource) ||
//       /^https?:\/\//i.test(logoSource))
//       ? logoSource
//       : "";

//   return `
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8" />
// <meta name="viewport" content="width=device-width, initial-scale=1.0" />
// <style>
//   @page {
//     size: A4;
//     margin: 0;
//   }

//   * {
//     box-sizing: border-box;
//   }

//   body {
//     margin: 0;
//     padding: 0;
//     background: #ffffff;
//     color: #1f2937;
//     font-family: Arial, Helvetica, sans-serif;
//     font-size: 10.5px;
//     line-height: 1.45;
//   }

//   .page {
//     width: 210mm;
//     min-height: 297mm;
//     padding: 12mm;
//     margin: 0 auto;
//     background: #ffffff;
//   }

//   .invoice-shell {
//     min-height: 273mm;
//     border: 1.2px solid #26384d;
//     position: relative;
//     padding: 10mm 9mm 12mm;
//   }

//   .top-line {
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     height: 5px;
//     background: ${accent};
//   }

//   .header {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//     gap: 22px;
//     padding-top: 4mm;
//     padding-bottom: 7mm;
//     border-bottom: 1px solid #cbd5e1;
//   }

//   .company-block {
//     display: flex;
//     gap: 12px;
//     align-items: flex-start;
//     width: 56%;
//   }

//   .logo {
//     width: 54px;
//     height: 54px;
//     object-fit: contain;
//     border: 1px solid #d5dce5;
//     padding: 4px;
//     background: #fff;
//   }

//   .company-name {
//     margin: 0 0 4px;
//     font-size: 18px;
//     line-height: 1.15;
//     font-weight: 700;
//     color: #102a43;
//   }

//   .company-meta {
//     color: #52606d;
//     font-size: 9.5px;
//   }

//   .invoice-heading {
//     width: 40%;
//     text-align: right;
//   }

//   .invoice-title {
//     margin: 0;
//     font-size: 30px;
//     line-height: 1;
//     font-weight: 800;
//     letter-spacing: 1.4px;
//     color: ${accent};
//   }

//   .status {
//     display: inline-block;
//     margin-top: 8px;
//     padding: 5px 11px;
//     border: 1px solid ${accent};
//     color: ${accent};
//     font-size: 9px;
//     font-weight: 700;
//     letter-spacing: 0.7px;
//   }

//   .info-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 0;
//     margin-top: 7mm;
//     border: 1px solid #b8c2cc;
//   }

//   .info-panel {
//     padding: 10px 12px;
//     min-height: 88px;
//   }

//   .info-panel + .info-panel {
//     border-left: 1px solid #b8c2cc;
//   }

//   .panel-title {
//     margin-bottom: 6px;
//     font-size: 9px;
//     font-weight: 700;
//     letter-spacing: 0.8px;
//     color: ${accent};
//     text-transform: uppercase;
//   }

//   .customer-name {
//     font-size: 12px;
//     font-weight: 700;
//     color: #1f2937;
//     margin-bottom: 3px;
//   }

//   .invoice-meta {
//     margin-top: 7mm;
//     border-collapse: collapse;
//     width: 100%;
//   }

//   .invoice-meta td {
//     border: 1px solid #b8c2cc;
//     padding: 7px 8px;
//   }

//   .invoice-meta .label {
//     width: 14%;
//     font-size: 8.5px;
//     font-weight: 700;
//     color: #52606d;
//     text-transform: uppercase;
//     background: #f5f7fa;
//   }

//   .invoice-meta .value {
//     width: 19%;
//     font-weight: 600;
//     color: #1f2937;
//   }

//   .items-table {
//     width: 100%;
//     border-collapse: collapse;
//     margin-top: 7mm;
//     table-layout: fixed;
//   }

//   .items-table th {
//     background: ${accent};
//     color: white;
//     border: 1px solid ${accent};
//     padding: 7px 5px;
//     font-size: 8.5px;
//     font-weight: 700;
//     letter-spacing: 0.35px;
//     text-transform: uppercase;
//   }

//   .items-table td {
//     border: 1px solid #b8c2cc;
//     padding: 7px 5px;
//     vertical-align: top;
//     font-size: 9.3px;
//   }

//   .items-table tr {
//     page-break-inside: avoid;
//   }

//   .items-table th:nth-child(1) { width: 5%; }
//   .items-table th:nth-child(2) { width: 35%; }
//   .items-table th:nth-child(3) { width: 7%; }
//   .items-table th:nth-child(4) { width: 8%; }
//   .items-table th:nth-child(5) { width: 12%; }
//   .items-table th:nth-child(6) { width: 10%; }
//   .items-table th:nth-child(7) { width: 8%; }
//   .items-table th:nth-child(8) { width: 15%; }

//   .item-name {
//     font-weight: 700;
//     color: #1f2937;
//   }

//   .item-description {
//     margin-top: 2px;
//     color: #6b7280;
//     font-size: 8.7px;
//     line-height: 1.35;
//   }

//   .center {
//     text-align: center;
//   }

//   .right {
//     text-align: right;
//   }

//   .strong {
//     font-weight: 700;
//   }

//   .lower-grid {
//     display: grid;
//     grid-template-columns: 1.3fr 0.9fr;
//     gap: 12px;
//     margin-top: 7mm;
//     align-items: start;
//   }

//   .notes-panel {
//     border: 1px solid #b8c2cc;
//     padding: 10px 11px;
//     min-height: 120px;
//   }

//   .notes-section + .notes-section {
//     margin-top: 11px;
//     padding-top: 9px;
//     border-top: 1px solid #e1e7ef;
//   }

//   .section-label {
//     margin-bottom: 4px;
//     color: ${accent};
//     font-size: 8.5px;
//     font-weight: 700;
//     letter-spacing: 0.6px;
//     text-transform: uppercase;
//   }

//   .totals-table {
//     width: 100%;
//     border-collapse: collapse;
//     border: 1px solid #b8c2cc;
//   }

//   .totals-table td {
//     padding: 7px 9px;
//     border-bottom: 1px solid #e0e6ed;
//     font-size: 9.5px;
//   }

//   .totals-table td:last-child {
//     text-align: right;
//     font-weight: 700;
//   }

//   .totals-table .grand-total td {
//     padding-top: 10px;
//     padding-bottom: 10px;
//     background: ${accent};
//     color: #ffffff;
//     font-size: 12.5px;
//     font-weight: 800;
//     border-bottom: none;
//   }

//   .balance-row td {
//     font-weight: 700;
//     color: #9f1239;
//   }

//   .footer {
//     position: absolute;
//     left: 9mm;
//     right: 9mm;
//     bottom: 6mm;
//     border-top: 1px solid #cbd5e1;
//     padding-top: 5px;
//     display: flex;
//     justify-content: space-between;
//     color: #6b7280;
//     font-size: 8px;
//   }

//   .muted {
//     color: #6b7280;
//   }

//   @media print {
//     body {
//       -webkit-print-color-adjust: exact;
//       print-color-adjust: exact;
//     }

//     .page {
//       width: 210mm;
//       min-height: 297mm;
//     }
//   }
// </style>
// </head>
// <body>
//   <div class="page">
//     <div class="invoice-shell">
//       <div class="top-line"></div>

//       <div class="header">
//         <div class="company-block">
//           ${
//             logoUrl
//               ? `<img class="logo" src="${escapeHtml(
//                   logoUrl
//                 )}" alt="Company logo" onerror="this.style.display='none'" />`
//               : ""
//           }
//           <div>
//             <div class="company-name">${escapeHtml(companyName)}</div>
//             <div class="company-meta">
//               ${companyAddress ? `${nl2br(companyAddress)}<br />` : ""}
//               ${companyPhone ? `Tel: ${escapeHtml(companyPhone)}<br />` : ""}
//               ${companyEmail ? `${escapeHtml(companyEmail)}<br />` : ""}
//               ${website ? `${escapeHtml(website)}<br />` : ""}
//               ${
//                 taxRegistrationNumber
//                   ? `${escapeHtml(invoice.taxLabel)} No: ${escapeHtml(
//                       taxRegistrationNumber
//                     )}`
//                   : ""
//               }
//             </div>
//           </div>
//         </div>

//         <div class="invoice-heading">
//           <div class="invoice-title">INVOICE</div>
//           <div class="status">${escapeHtml(
//             statusLabel(invoice.status)
//           )}</div>
//         </div>
//       </div>

//       <table class="invoice-meta">
//         <tr>
//           <td class="label">Invoice No.</td>
//           <td class="value">${escapeHtml(invoice.invoiceNumber)}</td>
//           <td class="label">Invoice Date</td>
//           <td class="value">${escapeHtml(formatDate(invoice.invoiceDate))}</td>
//           <td class="label">Due Date</td>
//           <td class="value">${escapeHtml(formatDate(invoice.dueDate))}</td>
//         </tr>
//         <tr>
//           <td class="label">PO Number</td>
//           <td class="value">${escapeHtml(
//             invoice.purchaseOrderNumber || "—"
//           )}</td>
//           <td class="label">Reference</td>
//           <td class="value">${escapeHtml(invoice.reference || "—")}</td>
//           <td class="label">Currency</td>
//           <td class="value">${escapeHtml(invoice.currencyCode)}</td>
//         </tr>
//       </table>

//       <div class="info-grid">
//         <div class="info-panel">
//           <div class="panel-title">Bill To</div>
//           <div class="customer-name">${escapeHtml(
//             invoice.customerName
//           )}</div>
//           ${
//             invoice.customerCompany
//               ? `<div>${escapeHtml(invoice.customerCompany)}</div>`
//               : ""
//           }
//           ${invoice.billingAddress ? `<div>${nl2br(invoice.billingAddress)}</div>` : ""}
//           ${invoice.customerEmail ? `<div>${escapeHtml(invoice.customerEmail)}</div>` : ""}
//           ${invoice.customerPhone ? `<div>${escapeHtml(invoice.customerPhone)}</div>` : ""}
//           ${
//             invoice.customerTaxNumber
//               ? `<div>${escapeHtml(invoice.taxLabel)} No: ${escapeHtml(
//                   invoice.customerTaxNumber
//                 )}</div>`
//               : ""
//           }
//         </div>

//         <div class="info-panel">
//           <div class="panel-title">Ship To</div>
//           <div class="customer-name">${escapeHtml(
//             invoice.customerName
//           )}</div>
//           ${
//             invoice.customerCompany
//               ? `<div>${escapeHtml(invoice.customerCompany)}</div>`
//               : ""
//           }
//           ${
//             invoice.shippingAddress
//               ? `<div>${nl2br(invoice.shippingAddress)}</div>`
//               : `<div class="muted">Same as billing address</div>`
//           }
//         </div>
//       </div>

//       <table class="items-table">
//         <thead>
//           <tr>
//             <th>No.</th>
//             <th>Description</th>
//             <th>Qty</th>
//             <th>Unit</th>
//             <th>Unit Price</th>
//             <th>Discount</th>
//             <th>${escapeHtml(invoice.taxLabel)}</th>
//             <th>Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${rows}
//         </tbody>
//       </table>

//       <div class="lower-grid">
//         <div class="notes-panel">
//           ${
//             invoice.paymentInstructions || paymentDetails
//               ? `
//                 <div class="notes-section">
//                   <div class="section-label">Payment Details</div>
//                   <div>
//                     ${
//                       invoice.paymentInstructions
//                         ? nl2br(invoice.paymentInstructions)
//                         : paymentDetails
//                     }
//                   </div>
//                 </div>
//               `
//               : ""
//           }

//           ${
//             invoice.paymentTerms
//               ? `
//                 <div class="notes-section">
//                   <div class="section-label">Payment Terms</div>
//                   <div>${nl2br(invoice.paymentTerms)}</div>
//                 </div>
//               `
//               : ""
//           }

//           ${
//             invoice.notes
//               ? `
//                 <div class="notes-section">
//                   <div class="section-label">Notes</div>
//                   <div>${nl2br(invoice.notes)}</div>
//                 </div>
//               `
//               : ""
//           }

//           ${
//             invoice.termsAndConditions
//               ? `
//                 <div class="notes-section">
//                   <div class="section-label">Terms & Conditions</div>
//                   <div>${nl2br(invoice.termsAndConditions)}</div>
//                 </div>
//               `
//               : ""
//           }
//         </div>

//         <table class="totals-table">
//           <tr>
//             <td>Subtotal</td>
//             <td>${escapeHtml(formatMoney(invoice.subtotal, invoice))}</td>
//           </tr>
//           ${
//             invoice.itemDiscountTotal > 0
//               ? `
//                 <tr>
//                   <td>Item discounts</td>
//                   <td>- ${escapeHtml(
//                     formatMoney(invoice.itemDiscountTotal, invoice)
//                   )}</td>
//                 </tr>
//               `
//               : ""
//           }
//           ${
//             invoice.invoiceDiscountAmount > 0
//               ? `
//                 <tr>
//                   <td>Invoice discount</td>
//                   <td>- ${escapeHtml(
//                     formatMoney(
//                       invoice.invoiceDiscountAmount,
//                       invoice
//                     )
//                   )}</td>
//                 </tr>
//               `
//               : ""
//           }
//           ${
//             invoice.shippingAmount > 0
//               ? `
//                 <tr>
//                   <td>Shipping</td>
//                   <td>${escapeHtml(
//                     formatMoney(invoice.shippingAmount, invoice)
//                   )}</td>
//                 </tr>
//               `
//               : ""
//           }
//           ${
//             invoice.taxEnabled
//               ? `
//                 <tr>
//                   <td>${escapeHtml(invoice.taxLabel)}</td>
//                   <td>${escapeHtml(
//                     formatMoney(invoice.taxTotal, invoice)
//                   )}</td>
//                 </tr>
//               `
//               : ""
//           }
//           ${
//             invoice.roundingAdjustment !== 0
//               ? `
//                 <tr>
//                   <td>Rounding</td>
//                   <td>${escapeHtml(
//                     formatMoney(invoice.roundingAdjustment, invoice)
//                   )}</td>
//                 </tr>
//               `
//               : ""
//           }
//           <tr class="grand-total">
//             <td>Total</td>
//             <td>${escapeHtml(formatMoney(invoice.grandTotal, invoice))}</td>
//           </tr>
//           ${
//             invoice.amountPaid > 0
//               ? `
//                 <tr>
//                   <td>Amount paid</td>
//                   <td>${escapeHtml(
//                     formatMoney(invoice.amountPaid, invoice)
//                   )}</td>
//                 </tr>
//               `
//               : ""
//           }
//           <tr class="balance-row">
//             <td>Balance due</td>
//             <td>${escapeHtml(formatMoney(invoice.balanceDue, invoice))}</td>
//           </tr>
//         </table>
//       </div>

//       <div class="footer">
//         <div>${escapeHtml(footerMessage)}</div>
//         <div>${escapeHtml(companyName)} • ${escapeHtml(
//     invoice.invoiceNumber
//   )} • Page 1</div>
//       </div>
//     </div>
//   </div>
// </body>
// </html>
//   `.trim();
// };

// lib/invoicePdf.ts
import type { CompanyProfile } from "@/lib/storage";
import type { Invoice } from "@/types/invoice";

const escapeHtml = (value?: string | number | null): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const nl2br = (value?: string | null): string =>
  escapeHtml(value).replace(/\n/g, "<br />");

const formatDate = (value?: string): string => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(value);
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (
  amount: number,
  invoice: Invoice
): string => {
  try {
    return new Intl.NumberFormat(invoice.locale || "en-GB", {
      style: "currency",
      currency: invoice.currencyCode || "GBP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${invoice.currencySymbol || ""}${Number(
      amount || 0
    ).toFixed(2)}`;
  }
};

const statusLabel = (status: Invoice["status"]): string =>
  ({
    draft: "DRAFT",
    sent: "SENT",
    unpaid: "UNPAID",
    partially_paid: "PART PAID",
    paid: "PAID",
    overdue: "OVERDUE",
    cancelled: "CANCELLED",
  })[status] || status.toUpperCase();

export const buildInvoiceA4Html = ({
  invoice,
  companyProfile,
  logoSource,
}: {
  invoice: Invoice;
  companyProfile: CompanyProfile | null;
  /**
   * A display-ready URL or base64 data URI.
   * Do not pass an Appwrite file ID here.
   */
  logoSource?: string;
}): string => {
  const companyName =
    companyProfile?.companyName || "Your Company";
  const companyAddress = companyProfile?.address || "";
  const companyPhone = companyProfile?.phoneNumber || "";
  const companyEmail =
    (companyProfile as any)?.companyEmail || "";
  const website = (companyProfile as any)?.website || "";
  const taxRegistrationNumber =
    (companyProfile as any)?.taxRegistrationNumber || "";

  const bankName = (companyProfile as any)?.bankName || "";
  const bankAccountName =
    (companyProfile as any)?.bankAccountName || "";
  const bankAccountNumber =
    (companyProfile as any)?.bankAccountNumber || "";
  const bankSortCode =
    (companyProfile as any)?.bankSortCode || "";
  const bankIban = (companyProfile as any)?.bankIban || "";
  const bankSwiftCode =
    (companyProfile as any)?.bankSwiftCode || "";

  const footerMessage =
    (companyProfile as any)?.invoiceFooterMessage ||
    "Thank you for your business.";

  const accent =
    (companyProfile as any)?.invoiceAccentColor || "#1f4e78";

  const rows = invoice.items
    .map(
      (item, index) => `
        <tr>
          <td class="center">${index + 1}</td>
          <td>
            <div class="item-name">${escapeHtml(
              item.productName
            )}</div>
            ${
              item.description
                ? `<div class="item-description">${nl2br(
                    item.description
                  )}</div>`
                : ""
            }
          </td>
          <td class="center">${escapeHtml(item.quantity)}</td>
          <td class="center">${escapeHtml(item.unit || "item")}</td>
          <td class="right">${escapeHtml(
            formatMoney(item.unitPrice, invoice)
          )}</td>
          <td class="right">${escapeHtml(
            item.discountValue > 0
              ? item.discountType === "percentage"
                ? `${item.discountValue}%`
                : formatMoney(item.discountAmount, invoice)
              : "—"
          )}</td>
          <td class="center">${
            invoice.taxEnabled && !item.taxExempt
              ? `${escapeHtml(item.taxRate)}%`
              : "—"
          }</td>
          <td class="right strong">${escapeHtml(
            formatMoney(item.total, invoice)
          )}</td>
        </tr>
      `
    )
    .join("");

  const paymentDetails = [
    bankAccountName
      ? `<div><strong>Account name:</strong> ${escapeHtml(
          bankAccountName
        )}</div>`
      : "",
    bankName
      ? `<div><strong>Bank:</strong> ${escapeHtml(bankName)}</div>`
      : "",
    bankSortCode
      ? `<div><strong>Sort code:</strong> ${escapeHtml(
          bankSortCode
        )}</div>`
      : "",
    bankAccountNumber
      ? `<div><strong>Account number:</strong> ${escapeHtml(
          bankAccountNumber
        )}</div>`
      : "",
    bankIban
      ? `<div><strong>IBAN:</strong> ${escapeHtml(bankIban)}</div>`
      : "",
    bankSwiftCode
      ? `<div><strong>SWIFT/BIC:</strong> ${escapeHtml(
          bankSwiftCode
        )}</div>`
      : "",
    `<div><strong>Payment reference:</strong> ${escapeHtml(
      invoice.invoiceNumber
    )}</div>`,
  ]
    .filter(Boolean)
    .join("");

  const logoUrl =
    logoSource &&
    (/^data:image\//i.test(logoSource) ||
      /^https?:\/\//i.test(logoSource))
      ? logoSource
      : "";

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @page {
    size: A4;
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #1f2937;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5px;
    line-height: 1.45;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 12mm;
    margin: 0 auto;
    background: #ffffff;
  }

  .invoice-shell {
    min-height: 273mm;
    border: 1.2px solid #26384d;
    position: relative;
    padding: 10mm 9mm 12mm;
  }

  .top-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: ${accent};
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 22px;
    padding-top: 4mm;
    padding-bottom: 7mm;
    border-bottom: 1px solid #cbd5e1;
  }

  .company-block {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    width: 56%;
  }

  .logo {
    width: 54px;
    height: 54px;
    object-fit: contain;
    border: 1px solid #d5dce5;
    padding: 4px;
    background: #fff;
  }

  .company-name {
    margin: 0 0 4px;
    font-size: 18px;
    line-height: 1.15;
    font-weight: 700;
    color: #102a43;
  }

  .company-meta {
    color: #52606d;
    font-size: 9.5px;
  }

  .invoice-heading {
    width: 40%;
    text-align: right;
  }

  .invoice-title {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: 1.4px;
    color: ${accent};
  }

  .status {
    display: inline-block;
    margin-top: 8px;
    padding: 5px 11px;
    border: 1px solid ${accent};
    color: ${accent};
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.7px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    margin-top: 7mm;
    border: 1px solid #b8c2cc;
  }

  .info-panel {
    padding: 10px 12px;
    min-height: 88px;
  }

  .info-panel + .info-panel {
    border-left: 1px solid #b8c2cc;
  }

  .panel-title {
    margin-bottom: 6px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    color: ${accent};
    text-transform: uppercase;
  }

  .customer-name {
    font-size: 12px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 3px;
  }

  .invoice-meta {
    margin-top: 7mm;
    border-collapse: collapse;
    width: 100%;
  }

  .invoice-meta td {
    border: 1px solid #b8c2cc;
    padding: 7px 8px;
  }

  .invoice-meta .label {
    width: 14%;
    font-size: 8.5px;
    font-weight: 700;
    color: #52606d;
    text-transform: uppercase;
    background: #f5f7fa;
  }

  .invoice-meta .value {
    width: 19%;
    font-weight: 600;
    color: #1f2937;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 7mm;
    table-layout: fixed;
  }

  .items-table th {
    background: ${accent};
    color: white;
    border: 1px solid ${accent};
    padding: 7px 5px;
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.35px;
    text-transform: uppercase;
  }

  .items-table td {
    border: 1px solid #b8c2cc;
    padding: 7px 5px;
    vertical-align: top;
    font-size: 9.3px;
  }

  .items-table tr {
    page-break-inside: avoid;
  }

  .items-table th:nth-child(1) { width: 5%; }
  .items-table th:nth-child(2) { width: 35%; }
  .items-table th:nth-child(3) { width: 7%; }
  .items-table th:nth-child(4) { width: 8%; }
  .items-table th:nth-child(5) { width: 12%; }
  .items-table th:nth-child(6) { width: 10%; }
  .items-table th:nth-child(7) { width: 8%; }
  .items-table th:nth-child(8) { width: 15%; }

  .item-name {
    font-weight: 700;
    color: #1f2937;
  }

  .item-description {
    margin-top: 2px;
    color: #6b7280;
    font-size: 8.7px;
    line-height: 1.35;
  }

  .center {
    text-align: center;
  }

  .right {
    text-align: right;
  }

  .strong {
    font-weight: 700;
  }

  .lower-grid {
    display: grid;
    grid-template-columns: 1.3fr 0.9fr;
    gap: 12px;
    margin-top: 7mm;
    align-items: start;
  }

  .notes-panel {
    border: 1px solid #b8c2cc;
    padding: 10px 11px;
    min-height: 120px;
  }

  .notes-section + .notes-section {
    margin-top: 11px;
    padding-top: 9px;
    border-top: 1px solid #e1e7ef;
  }

  .section-label {
    margin-bottom: 4px;
    color: ${accent};
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }

  .totals-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #b8c2cc;
  }

  .totals-table td {
    padding: 7px 9px;
    border-bottom: 1px solid #e0e6ed;
    font-size: 9.5px;
  }

  .totals-table td:last-child {
    text-align: right;
    font-weight: 700;
  }

  .totals-table .grand-total td {
    padding-top: 10px;
    padding-bottom: 10px;
    background: ${accent};
    color: #ffffff;
    font-size: 12.5px;
    font-weight: 800;
    border-bottom: none;
  }

  .balance-row td {
    font-weight: 700;
    color: #9f1239;
  }

  .footer {
    position: absolute;
    left: 9mm;
    right: 9mm;
    bottom: 6mm;
    border-top: 1px solid #cbd5e1;
    padding-top: 5px;
    display: flex;
    justify-content: space-between;
    color: #6b7280;
    font-size: 8px;
  }

  .muted {
    color: #6b7280;
  }

  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
    }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="invoice-shell">
      <div class="top-line"></div>

      <div class="header">
        <div class="company-block">
          ${
            logoUrl
              ? `<img class="logo" src="${escapeHtml(
                  logoUrl
                )}" alt="Company logo" onerror="this.style.display='none'" />`
              : ""
          }
          <div>
            <div class="company-name">${escapeHtml(companyName)}</div>
            <div class="company-meta">
              ${companyAddress ? `${nl2br(companyAddress)}<br />` : ""}
              ${companyPhone ? `Tel: ${escapeHtml(companyPhone)}<br />` : ""}
              ${companyEmail ? `${escapeHtml(companyEmail)}<br />` : ""}
              ${website ? `${escapeHtml(website)}<br />` : ""}
              ${
                taxRegistrationNumber
                  ? `${escapeHtml(invoice.taxLabel)} No: ${escapeHtml(
                      taxRegistrationNumber
                    )}`
                  : ""
              }
            </div>
          </div>
        </div>

        <div class="invoice-heading">
          <div class="invoice-title">INVOICE</div>
          <div class="status">${escapeHtml(
            statusLabel(invoice.status)
          )}</div>
        </div>
      </div>

      <table class="invoice-meta">
        <tr>
          <td class="label">Invoice No.</td>
          <td class="value">${escapeHtml(invoice.invoiceNumber)}</td>
          <td class="label">Invoice Date</td>
          <td class="value">${escapeHtml(formatDate(invoice.invoiceDate))}</td>
          <td class="label">Due Date</td>
          <td class="value">${escapeHtml(formatDate(invoice.dueDate))}</td>
        </tr>
        <tr>
          <td class="label">PO Number</td>
          <td class="value">${escapeHtml(
            invoice.purchaseOrderNumber || "—"
          )}</td>
          <td class="label">Reference</td>
          <td class="value">${escapeHtml(invoice.reference || "—")}</td>
          <td class="label">Currency</td>
          <td class="value">${escapeHtml(invoice.currencyCode)}</td>
        </tr>
      </table>

      <div class="info-grid">
        <div class="info-panel">
          <div class="panel-title">Bill To</div>
          <div class="customer-name">${escapeHtml(
            invoice.customerName
          )}</div>
          ${
            invoice.customerCompany
              ? `<div>${escapeHtml(invoice.customerCompany)}</div>`
              : ""
          }
          ${invoice.billingAddress ? `<div>${nl2br(invoice.billingAddress)}</div>` : ""}
          ${invoice.customerEmail ? `<div>${escapeHtml(invoice.customerEmail)}</div>` : ""}
          ${invoice.customerPhone ? `<div>${escapeHtml(invoice.customerPhone)}</div>` : ""}
          ${
            invoice.customerTaxNumber
              ? `<div>${escapeHtml(invoice.taxLabel)} No: ${escapeHtml(
                  invoice.customerTaxNumber
                )}</div>`
              : ""
          }
        </div>

        <div class="info-panel">
          <div class="panel-title">Ship To</div>
          <div class="customer-name">${escapeHtml(
            invoice.customerName
          )}</div>
          ${
            invoice.customerCompany
              ? `<div>${escapeHtml(invoice.customerCompany)}</div>`
              : ""
          }
          ${
            invoice.shippingAddress
              ? `<div>${nl2br(invoice.shippingAddress)}</div>`
              : `<div class="muted">Same as billing address</div>`
          }
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Unit Price</th>
            <th>Discount</th>
            <th>${escapeHtml(invoice.taxLabel)}</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="lower-grid">
        <div class="notes-panel">
          ${
            invoice.paymentInstructions || paymentDetails
              ? `
                <div class="notes-section">
                  <div class="section-label">Payment Details</div>
                  <div>
                    ${
                      invoice.paymentInstructions
                        ? nl2br(invoice.paymentInstructions)
                        : paymentDetails
                    }
                  </div>
                </div>
              `
              : ""
          }

          ${
            invoice.paymentMethod || invoice.paymentDate || invoice.paymentReference
              ? `
                <div class="notes-section">
                  <div class="section-label">Payment Record</div>
                  ${
                    invoice.paymentMethod
                      ? `<div><strong>Method:</strong> ${escapeHtml(
                          invoice.paymentMethod
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (letter) =>
                              letter.toUpperCase()
                            )
                        )}</div>`
                      : ""
                  }
                  ${
                    invoice.paymentDate
                      ? `<div><strong>Date:</strong> ${escapeHtml(
                          formatDate(invoice.paymentDate)
                        )}</div>`
                      : ""
                  }
                  ${
                    invoice.paymentReference
                      ? `<div><strong>Reference:</strong> ${escapeHtml(
                          invoice.paymentReference
                        )}</div>`
                      : ""
                  }
                </div>
              `
              : ""
          }

          ${
            invoice.paymentTerms
              ? `
                <div class="notes-section">
                  <div class="section-label">Payment Terms</div>
                  <div>${nl2br(invoice.paymentTerms)}</div>
                </div>
              `
              : ""
          }

          ${
            invoice.notes
              ? `
                <div class="notes-section">
                  <div class="section-label">Notes</div>
                  <div>${nl2br(invoice.notes)}</div>
                </div>
              `
              : ""
          }

          ${
            invoice.termsAndConditions
              ? `
                <div class="notes-section">
                  <div class="section-label">Terms & Conditions</div>
                  <div>${nl2br(invoice.termsAndConditions)}</div>
                </div>
              `
              : ""
          }
        </div>

        <table class="totals-table">
          <tr>
            <td>Subtotal</td>
            <td>${escapeHtml(formatMoney(invoice.subtotal, invoice))}</td>
          </tr>
          ${
            invoice.itemDiscountTotal > 0
              ? `
                <tr>
                  <td>Item discounts</td>
                  <td>- ${escapeHtml(
                    formatMoney(invoice.itemDiscountTotal, invoice)
                  )}</td>
                </tr>
              `
              : ""
          }
          ${
            invoice.invoiceDiscountAmount > 0
              ? `
                <tr>
                  <td>Invoice discount</td>
                  <td>- ${escapeHtml(
                    formatMoney(
                      invoice.invoiceDiscountAmount,
                      invoice
                    )
                  )}</td>
                </tr>
              `
              : ""
          }
          ${
            invoice.shippingAmount > 0
              ? `
                <tr>
                  <td>Shipping</td>
                  <td>${escapeHtml(
                    formatMoney(invoice.shippingAmount, invoice)
                  )}</td>
                </tr>
              `
              : ""
          }
          ${
            invoice.taxEnabled
              ? `
                <tr>
                  <td>${escapeHtml(invoice.taxLabel)}</td>
                  <td>${escapeHtml(
                    formatMoney(invoice.taxTotal, invoice)
                  )}</td>
                </tr>
              `
              : ""
          }
          ${
            invoice.roundingAdjustment !== 0
              ? `
                <tr>
                  <td>Rounding</td>
                  <td>${escapeHtml(
                    formatMoney(invoice.roundingAdjustment, invoice)
                  )}</td>
                </tr>
              `
              : ""
          }
          <tr class="grand-total">
            <td>Total</td>
            <td>${escapeHtml(formatMoney(invoice.grandTotal, invoice))}</td>
          </tr>
          ${
            invoice.amountPaid > 0
              ? `
                <tr>
                  <td>Amount paid</td>
                  <td>${escapeHtml(
                    formatMoney(invoice.amountPaid, invoice)
                  )}</td>
                </tr>
              `
              : ""
          }
          <tr class="balance-row">
            <td>Balance due</td>
            <td>${escapeHtml(formatMoney(invoice.balanceDue, invoice))}</td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <div>${escapeHtml(footerMessage)}</div>
        <div>${escapeHtml(companyName)} • ${escapeHtml(
    invoice.invoiceNumber
  )} • Page 1</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};
