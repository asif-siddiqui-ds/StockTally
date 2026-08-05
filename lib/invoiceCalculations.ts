import {
    DiscountType,
    Invoice,
    InvoiceItem,
    InvoiceStatus,
} from "@/types/invoice";

const safeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
};

export const roundMoney = (value: number): number => {
  return Math.round((safeNumber(value) + Number.EPSILON) * 100) / 100;
};

export const calculateDiscountAmount = ({
  baseAmount,
  discountType,
  discountValue,
}: {
  baseAmount: number;
  discountType?: DiscountType;
  discountValue?: number;
}): number => {
  const safeBaseAmount = Math.max(0, safeNumber(baseAmount));
  const safeDiscountValue = Math.max(0, safeNumber(discountValue));

  if (!discountType || safeDiscountValue <= 0) {
    return 0;
  }

  if (discountType === "percentage") {
    const percentage = Math.min(safeDiscountValue, 100);

    return roundMoney(safeBaseAmount * (percentage / 100));
  }

  return roundMoney(Math.min(safeDiscountValue, safeBaseAmount));
};

export const calculateInvoiceItem = (
  item: InvoiceItem,
  pricesIncludeTax = false,
  taxEnabled = true
): InvoiceItem => {
  const quantity = Math.max(0, safeNumber(item.quantity));
  const unitPrice = Math.max(0, safeNumber(item.unitPrice));

  const taxRate =
    taxEnabled && !item.taxExempt
      ? Math.max(0, safeNumber(item.taxRate))
      : 0;

  const grossLineAmount = roundMoney(quantity * unitPrice);

  let subtotal = grossLineAmount;
  let taxAmount = 0;

  /*
   * Inclusive pricing example:
   * A £120 price with 20% VAT contains £20 VAT.
   */
  if (pricesIncludeTax && taxRate > 0) {
    taxAmount = roundMoney(
      grossLineAmount - grossLineAmount / (1 + taxRate / 100)
    );

    subtotal = roundMoney(grossLineAmount - taxAmount);
  }

  const discountBase = pricesIncludeTax
    ? grossLineAmount
    : subtotal;

  const discountAmount = calculateDiscountAmount({
    baseAmount: discountBase,
    discountType: item.discountType,
    discountValue: item.discountValue,
  });

  if (pricesIncludeTax) {
    const discountedGross = roundMoney(
      Math.max(0, grossLineAmount - discountAmount)
    );

    if (taxRate > 0) {
      taxAmount = roundMoney(
        discountedGross -
          discountedGross / (1 + taxRate / 100)
      );

      subtotal = roundMoney(discountedGross - taxAmount);
    } else {
      subtotal = discountedGross;
      taxAmount = 0;
    }

    return {
      ...item,
      quantity,
      unitPrice,
      discountValue: Math.max(0, safeNumber(item.discountValue)),
      discountAmount,
      taxRate,
      subtotal,
      taxableAmount: subtotal,
      taxAmount,
      total: discountedGross,
    };
  }

  const taxableAmount = roundMoney(
    Math.max(0, subtotal - discountAmount)
  );

  taxAmount =
    taxRate > 0
      ? roundMoney(taxableAmount * (taxRate / 100))
      : 0;

  return {
    ...item,
    quantity,
    unitPrice,
    discountValue: Math.max(0, safeNumber(item.discountValue)),
    discountAmount,
    taxRate,
    subtotal,
    taxableAmount,
    taxAmount,
    total: roundMoney(taxableAmount + taxAmount),
  };
};

export interface InvoiceTotals {
  subtotal: number;
  itemDiscountTotal: number;
  invoiceDiscountAmount: number;
  shippingAmount: number;
  taxTotal: number;
  roundingAdjustment: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
}

export const calculateInvoiceTotals = ({
  items,
  pricesIncludeTax,
  taxEnabled,
  invoiceDiscountType,
  invoiceDiscountValue,
  shippingAmount,
  roundingAdjustment,
  amountPaid,
}: {
  items: InvoiceItem[];
  pricesIncludeTax: boolean;
  taxEnabled: boolean;
  invoiceDiscountType?: DiscountType;
  invoiceDiscountValue?: number;
  shippingAmount?: number;
  roundingAdjustment?: number;
  amountPaid?: number;
}): {
  calculatedItems: InvoiceItem[];
  totals: InvoiceTotals;
} => {
  const calculatedItems = items.map((item) =>
    calculateInvoiceItem(item, pricesIncludeTax, taxEnabled)
  );

  const subtotal = roundMoney(
    calculatedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    )
  );

  const itemDiscountTotal = roundMoney(
    calculatedItems.reduce(
      (sum, item) => sum + item.discountAmount,
      0
    )
  );

  const taxBeforeInvoiceDiscount = roundMoney(
    calculatedItems.reduce(
      (sum, item) => sum + item.taxAmount,
      0
    )
  );

  const lineTotals = roundMoney(
    calculatedItems.reduce(
      (sum, item) => sum + item.total,
      0
    )
  );

  /*
   * The invoice-level discount is applied after all line-item totals.
   *
   * In a later tax-reporting phase, we can distribute this discount
   * proportionally across different tax bands.
   */
  const invoiceDiscountAmount = calculateDiscountAmount({
    baseAmount: lineTotals,
    discountType: invoiceDiscountType,
    discountValue: invoiceDiscountValue,
  });

  const safeShippingAmount = roundMoney(
    Math.max(0, safeNumber(shippingAmount))
  );

  const safeRoundingAdjustment = roundMoney(
    safeNumber(roundingAdjustment)
  );

  const grandTotal = roundMoney(
    Math.max(
      0,
      lineTotals -
        invoiceDiscountAmount +
        safeShippingAmount +
        safeRoundingAdjustment
    )
  );

  const safeAmountPaid = roundMoney(
    Math.max(0, safeNumber(amountPaid))
  );

  const balanceDue = roundMoney(
    Math.max(0, grandTotal - safeAmountPaid)
  );

  return {
    calculatedItems,
    totals: {
      subtotal,
      itemDiscountTotal,
      invoiceDiscountAmount,
      shippingAmount: safeShippingAmount,
      taxTotal: taxBeforeInvoiceDiscount,
      roundingAdjustment: safeRoundingAdjustment,
      grandTotal,
      amountPaid: safeAmountPaid,
      balanceDue,
    },
  };
};

export const deriveInvoiceStatus = ({
  currentStatus,
  grandTotal,
  amountPaid,
  dueDate,
}: {
  currentStatus?: InvoiceStatus;
  grandTotal: number;
  amountPaid: number;
  dueDate?: string;
}): InvoiceStatus => {
  if (currentStatus === "draft") {
    return "draft";
  }

  if (currentStatus === "cancelled") {
    return "cancelled";
  }

  const safeGrandTotal = Math.max(0, safeNumber(grandTotal));
  const safeAmountPaid = Math.max(0, safeNumber(amountPaid));

  if (safeGrandTotal > 0 && safeAmountPaid >= safeGrandTotal) {
    return "paid";
  }

  if (safeAmountPaid > 0) {
    return "partially_paid";
  }

  if (dueDate) {
    const dueTime = new Date(dueDate).getTime();
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (
      Number.isFinite(dueTime) &&
      dueTime < today.getTime()
    ) {
      return "overdue";
    }
  }

  return currentStatus === "sent" ? "sent" : "unpaid";
};

export const recalculateInvoice = (
  invoice: Invoice
): Invoice => {
  const { calculatedItems, totals } = calculateInvoiceTotals({
    items: invoice.items,
    pricesIncludeTax: invoice.pricesIncludeTax,
    taxEnabled: invoice.taxEnabled,
    invoiceDiscountType: invoice.invoiceDiscountType,
    invoiceDiscountValue: invoice.invoiceDiscountValue,
    shippingAmount: invoice.shippingAmount,
    roundingAdjustment: invoice.roundingAdjustment,
    amountPaid: invoice.amountPaid,
  });

  return {
    ...invoice,
    items: calculatedItems,
    ...totals,
    status: deriveInvoiceStatus({
      currentStatus: invoice.status,
      grandTotal: totals.grandTotal,
      amountPaid: totals.amountPaid,
      dueDate: invoice.dueDate,
    }),
    updatedAt: new Date().toISOString(),
    synced: false,
  };
};