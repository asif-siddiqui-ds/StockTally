// lib/quotePdf.ts
import type { CompanyProfile } from "@/lib/storage";
import type { Quote } from "@/types/quote";

const escapeHtml = (
  value?: string | number | null
): string =>
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

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (
  amount: number,
  quote: Quote
): string => {
  try {
    return new Intl.NumberFormat(
      quote.locale || "en-GB",
      {
        style: "currency",
        currency: quote.currencyCode || "GBP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(Number(amount || 0));
  } catch {
    return `${quote.currencySymbol || "£"}${Number(
      amount || 0
    ).toFixed(2)}`;
  }
};

const statusLabel = (status: Quote["status"]): string =>
  ({
    draft: "DRAFT",
    sent: "SENT",
    accepted: "ACCEPTED",
    rejected: "REJECTED",
    expired: "EXPIRED",
    converted: "CONVERTED",
    cancelled: "CANCELLED",
  })[status] || String(status).toUpperCase();

export const buildQuoteA4Html = ({
  quote,
  companyProfile,
  logoSource,
}: {
  quote: Quote;
  companyProfile: CompanyProfile | null;
  logoSource?: string;
}): string => {
  const companyName =
    companyProfile?.companyName || "Your Company";
  const companyAddress = companyProfile?.address || "";
  const companyPhone =
    companyProfile?.phoneNumber || "";
  const companyEmail =
    (companyProfile as any)?.companyEmail || "";
  const website =
    (companyProfile as any)?.website || "";
  const taxRegistrationNumber =
    (companyProfile as any)?.taxRegistrationNumber || "";

  const footerMessage =
    (companyProfile as any)?.quoteFooterMessage ||
    (companyProfile as any)?.invoiceFooterMessage ||
    "Thank you for considering our quotation.";

  const accent =
    (companyProfile as any)?.invoiceAccentColor ||
    "#1f4e78";

  const taxLabel =
    (quote as any).taxLabel || "VAT";

  const quoteItems = Array.isArray(quote.items)
    ? quote.items
    : [];

  const rows = quoteItems
    .map((item: any, index: number) => {
      const discountValue = Number(
        item.discountValue || 0
      );
      const discountAmount = Number(
        item.discountAmount || 0
      );
      const discountType =
        item.discountType || "percentage";

      const discountDisplay =
        discountValue > 0
          ? discountType === "percentage"
            ? `${discountValue}%`
            : formatMoney(
                discountAmount || discountValue,
                quote
              )
          : "—";

      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>
            <div class="item-name">${escapeHtml(
              item.name
            )}</div>
            ${
              item.description
                ? `<div class="item-description">${nl2br(
                    item.description
                  )}</div>`
                : ""
            }
          </td>
          <td class="center">${escapeHtml(
            item.quantity
          )}</td>
          <td class="center">${escapeHtml(
            item.unit || "item"
          )}</td>
          <td class="right">${escapeHtml(
            formatMoney(
              Number(item.unitPrice || 0),
              quote
            )
          )}</td>
          <td class="right">${escapeHtml(
            discountDisplay
          )}</td>
          <td class="center">${
            Number(item.taxRate || 0) > 0
              ? `${escapeHtml(item.taxRate)}%`
              : "—"
          }</td>
          <td class="right strong">${escapeHtml(
            formatMoney(
              Number(item.lineTotal || 0),
              quote
            )
          )}</td>
        </tr>
      `;
    })
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
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>
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

  .quote-shell {
    min-height: 273mm;
    border: 1.2px solid #26384d;
    position: relative;
    padding: 10mm 9mm 16mm;
  }

  .top-line {
    position: absolute;
    inset: 0 0 auto;
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
    background: #ffffff;
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

  .quote-heading {
    width: 40%;
    text-align: right;
  }

  .quote-title {
    margin: 0;
    font-size: 28px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: 1.2px;
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

  .quote-meta {
    margin-top: 7mm;
    border-collapse: collapse;
    width: 100%;
  }

  .quote-meta td {
    border: 1px solid #b8c2cc;
    padding: 7px 8px;
  }

  .quote-meta .label {
    width: 14%;
    font-size: 8.5px;
    font-weight: 700;
    color: #52606d;
    text-transform: uppercase;
    background: #f5f7fa;
  }

  .quote-meta .value {
    width: 19%;
    font-weight: 600;
    color: #1f2937;
  }

  .customer-panel {
    margin-top: 7mm;
    border: 1px solid #b8c2cc;
    padding: 10px 12px;
    min-height: 90px;
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

  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 7mm;
    table-layout: fixed;
  }

  .items-table th {
    background: ${accent};
    color: #ffffff;
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

  .acceptance-box {
    margin-top: 7mm;
    border: 1px solid #b8c2cc;
    padding: 10px 12px;
    page-break-inside: avoid;
  }

  .signature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 18px;
  }

  .signature-line {
    border-top: 1px solid #64748b;
    padding-top: 4px;
    color: #64748b;
    font-size: 8.5px;
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

  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="quote-shell">
      <div class="top-line"></div>

      <div class="header">
        <div class="company-block">
          ${
            logoUrl
              ? `<img
                   class="logo"
                   src="${escapeHtml(logoUrl)}"
                   alt="Company logo"
                   onerror="this.style.display='none'"
                 />`
              : ""
          }

          <div>
            <div class="company-name">
              ${escapeHtml(companyName)}
            </div>

            <div class="company-meta">
              ${
                companyAddress
                  ? `${nl2br(companyAddress)}<br />`
                  : ""
              }
              ${
                companyPhone
                  ? `Tel: ${escapeHtml(companyPhone)}<br />`
                  : ""
              }
              ${
                companyEmail
                  ? `${escapeHtml(companyEmail)}<br />`
                  : ""
              }
              ${
                website
                  ? `${escapeHtml(website)}<br />`
                  : ""
              }
              ${
                taxRegistrationNumber
                  ? `${escapeHtml(taxLabel)} No: ${escapeHtml(
                      taxRegistrationNumber
                    )}`
                  : ""
              }
            </div>
          </div>
        </div>

        <div class="quote-heading">
          <div class="quote-title">QUOTATION</div>
          <div class="status">
            ${escapeHtml(statusLabel(quote.status))}
          </div>
        </div>
      </div>

      <table class="quote-meta">
        <tr>
          <td class="label">Quote No.</td>
          <td class="value">
            ${escapeHtml(quote.quoteNumber)}
          </td>
          <td class="label">Quote Date</td>
          <td class="value">
            ${escapeHtml(formatDate(quote.quoteDate))}
          </td>
          <td class="label">Valid Until</td>
          <td class="value">
            ${escapeHtml(formatDate(quote.expiryDate))}
          </td>
        </tr>

        <tr>
          <td class="label">Reference</td>
          <td class="value">
            ${escapeHtml(quote.reference || "—")}
          </td>
          <td class="label">Currency</td>
          <td class="value">
            ${escapeHtml(quote.currencyCode || "GBP")}
          </td>
          <td class="label">Status</td>
          <td class="value">
            ${escapeHtml(statusLabel(quote.status))}
          </td>
        </tr>
      </table>

      <div class="customer-panel">
        <div class="panel-title">Prepared For</div>

        <div class="customer-name">
          ${escapeHtml(
            quote.customerCompany ||
              quote.customerName
          )}
        </div>

        ${
          quote.customerCompany &&
          quote.customerName
            ? `<div>${escapeHtml(
                quote.customerName
              )}</div>`
            : ""
        }

        ${
          quote.customerAddress
            ? `<div>${nl2br(
                quote.customerAddress
              )}</div>`
            : ""
        }

        ${
          quote.customerEmail
            ? `<div>${escapeHtml(
                quote.customerEmail
              )}</div>`
            : ""
        }

        ${
          quote.customerPhone
            ? `<div>${escapeHtml(
                quote.customerPhone
              )}</div>`
            : ""
        }
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
            <th>${escapeHtml(taxLabel)}</th>
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
            quote.notes
              ? `
                <div class="notes-section">
                  <div class="section-label">Notes</div>
                  <div>${nl2br(quote.notes)}</div>
                </div>
              `
              : ""
          }

          ${
            quote.terms
              ? `
                <div class="notes-section">
                  <div class="section-label">
                    Terms & Conditions
                  </div>
                  <div>${nl2br(quote.terms)}</div>
                </div>
              `
              : ""
          }

          <div class="notes-section">
            <div class="section-label">
              Quote Validity
            </div>
            <div>
              This quotation is valid until
              ${escapeHtml(
                formatDate(quote.expiryDate)
              )}.
            </div>
          </div>
        </div>

        <table class="totals-table">
          <tr>
            <td>Subtotal</td>
            <td>
              ${escapeHtml(
                formatMoney(quote.subtotal, quote)
              )}
            </td>
          </tr>

          ${
            Number(quote.discountTotal || 0) > 0
              ? `
                <tr>
                  <td>Discount</td>
                  <td>
                    - ${escapeHtml(
                      formatMoney(
                        quote.discountTotal,
                        quote
                      )
                    )}
                  </td>
                </tr>
              `
              : ""
          }

          ${
            Number(quote.taxTotal || 0) > 0
              ? `
                <tr>
                  <td>${escapeHtml(taxLabel)}</td>
                  <td>
                    ${escapeHtml(
                      formatMoney(
                        quote.taxTotal,
                        quote
                      )
                    )}
                  </td>
                </tr>
              `
              : ""
          }

          <tr class="grand-total">
            <td>Total</td>
            <td>
              ${escapeHtml(
                formatMoney(
                  quote.grandTotal,
                  quote
                )
              )}
            </td>
          </tr>
        </table>
      </div>

      <div class="acceptance-box">
        <div class="section-label">
          Customer Acceptance
        </div>

        <div>
          I confirm acceptance of this quotation and
          authorise the work or supply described above.
        </div>

        <div class="signature-grid">
          <div class="signature-line">
            Name / Signature
          </div>
          <div class="signature-line">
            Date
          </div>
        </div>
      </div>

      <div class="footer">
        <div>${escapeHtml(footerMessage)}</div>
        <div>
          ${escapeHtml(companyName)} •
          ${escapeHtml(quote.quoteNumber)} • Page 1
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};
