// app/screens/invoices/edit.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { getCachedUserId } from "@/context/AuthContext";
import {
  calculateInvoiceItem,
  calculateInvoiceTotals,
} from "@/lib/invoiceCalculations";
import {
  getInvoiceById,
  updateInvoice,
} from "@/lib/invoiceStorage";
import {
  CompanyProfile,
  getCompanyProfile,
  getStockItems,
  StockItem,
} from "@/lib/storage";
import type {
  DiscountType,
  InvoiceItem,
  InvoicePaymentMethod,
  InvoiceStatus,
  StockReductionTrigger,
} from "@/types/invoice";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

let DateTimePickerModal: any = null;

if (Platform.OS !== "web") {
  try {
    DateTimePickerModal =
      require("react-native-modal-datetime-picker").default;
  } catch {
    console.warn("DateTimePickerModal not available");
  }
}

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createBlankItem = (
  taxRate = 0,
  taxName = "Tax"
): InvoiceItem => ({
  id: makeId(),
  sourceType: "custom",
  productName: "",
  description: "",
  quantity: 1,
  unit: "item",
  unitPrice: 0,
  discountType: "percentage",
  discountValue: 0,
  discountAmount: 0,
  taxRate,
  taxName,
  taxExempt: false,
  subtotal: 0,
  taxableAmount: 0,
  taxAmount: 0,
  total: 0,
  stockProcessed: false,
  stockProcessedQuantity: 0,
});

const toInputNumber = (value: string): number => {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return 0;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toDateOnly = (date: Date): string =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0
  ).toISOString();

const displayDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EditInvoiceScreen = () => {
  const params = useLocalSearchParams<{ id?: string }>();
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  const wizardSteps = [
    { number: 1, label: "Invoice" },
    { number: 2, label: "Customer" },
    { number: 3, label: "Items" },
    { number: 4, label: "Payment" },
    { number: 5, label: "Review" },
  ];

  const [companyProfile, setCompanyProfile] =
    useState<CompanyProfile | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    toDateOnly(new Date())
  );
  const [dueDate, setDueDate] = useState(
    toDateOnly(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  );

  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [customerTaxNumber, setCustomerTaxNumber] = useState("");
  const [purchaseOrderNumber, setPurchaseOrderNumber] =
    useState("");
  const [reference, setReference] = useState("");

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxLabel, setTaxLabel] = useState("Tax");
  const [pricesIncludeTax, setPricesIncludeTax] =
    useState(false);
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);

  const [items, setItems] = useState<InvoiceItem[]>([
    createBlankItem(),
  ]);

  const [invoiceDiscountType, setInvoiceDiscountType] =
    useState<DiscountType>("percentage");
  const [invoiceDiscountValue, setInvoiceDiscountValue] =
    useState(0);
  const [shippingAmount, setShippingAmount] = useState(0);
  const [roundingAdjustment, setRoundingAdjustment] = useState(0);

  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [paymentInstructions, setPaymentInstructions] =
    useState("");
  const [termsAndConditions, setTermsAndConditions] =
    useState("");

  const [stockReductionTrigger, setStockReductionTrigger] =
    useState<StockReductionTrigger>("sent");

  const [paymentStatus, setPaymentStatus] =
    useState<Extract<
      InvoiceStatus,
      "unpaid" | "partially_paid" | "paid"
    >>("unpaid");
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] =
    useState<InvoicePaymentMethod>("bank_transfer");
  const [paymentDate, setPaymentDate] = useState(
    toDateOnly(new Date())
  );
  const [paymentReference, setPaymentReference] =
    useState("");
  const [showPaymentDatePicker, setShowPaymentDatePicker] =
    useState(false);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const [targetItemId, setTargetItemId] = useState<string | null>(
    null
  );

  const [showInvoiceDatePicker, setShowInvoiceDatePicker] =
    useState(false);
  const [showDueDatePicker, setShowDueDatePicker] =
    useState(false);

  useEffect(() => {
    initialise();
  }, [invoiceId]);

  const initialise = async () => {
    try {
      if (!invoiceId) {
        Alert.alert(
          "Invoice not found",
          "No invoice ID was provided."
        );
        router.back();
        return;
      }

      setLoading(true);

      const userId = (await getCachedUserId()) || "guest";

      const [profile, stock, existingInvoice] = await Promise.all([
        getCompanyProfile(userId),
        getStockItems(),
        getInvoiceById(invoiceId),
      ]);

      if (!existingInvoice) {
        Alert.alert(
          "Invoice not found",
          "This invoice could not be loaded."
        );
        router.back();
        return;
      }

      setCompanyProfile(profile);
      setStockItems(stock);

      setInvoiceNumber(existingInvoice.invoiceNumber);
      setInvoiceDate(existingInvoice.invoiceDate);
      setDueDate(
        existingInvoice.dueDate ||
          toDateOnly(
            new Date(
              new Date(existingInvoice.invoiceDate).getTime() +
                30 * 24 * 60 * 60 * 1000
            )
          )
      );

      setCustomerName(existingInvoice.customerName || "");
      setCustomerCompany(existingInvoice.customerCompany || "");
      setCustomerEmail(existingInvoice.customerEmail || "");
      setCustomerPhone(existingInvoice.customerPhone || "");
      setBillingAddress(existingInvoice.billingAddress || "");
      setShippingAddress(existingInvoice.shippingAddress || "");
      setSameAsBilling(
        !existingInvoice.shippingAddress ||
          existingInvoice.shippingAddress ===
            existingInvoice.billingAddress
      );
      setCustomerTaxNumber(
        existingInvoice.customerTaxNumber || ""
      );
      setPurchaseOrderNumber(
        existingInvoice.purchaseOrderNumber || ""
      );
      setReference(existingInvoice.reference || "");

      setTaxEnabled(existingInvoice.taxEnabled);
      setTaxLabel(existingInvoice.taxLabel || "Tax");
      setPricesIncludeTax(existingInvoice.pricesIncludeTax);

      const profileTaxRate = Number(
        (profile as any)?.defaultTaxRate ??
          existingInvoice.items[0]?.taxRate ??
          0
      );
      setDefaultTaxRate(profileTaxRate);

      setItems(
        existingInvoice.items?.length
          ? existingInvoice.items
          : [
              createBlankItem(
                profileTaxRate,
                existingInvoice.taxLabel || "Tax"
              ),
            ]
      );

      setInvoiceDiscountType(
        existingInvoice.invoiceDiscountType || "percentage"
      );
      setInvoiceDiscountValue(
        existingInvoice.invoiceDiscountValue || 0
      );
      setShippingAmount(existingInvoice.shippingAmount || 0);
      setRoundingAdjustment(
        existingInvoice.roundingAdjustment || 0
      );

      setNotes(existingInvoice.notes || "");
      setPaymentTerms(existingInvoice.paymentTerms || "");
      setPaymentInstructions(
        existingInvoice.paymentInstructions || ""
      );
      setTermsAndConditions(
        existingInvoice.termsAndConditions || ""
      );
      setStockReductionTrigger(
        existingInvoice.stockReductionTrigger || "sent"
      );

      setPaymentStatus(
        existingInvoice.status === "paid"
          ? "paid"
          : existingInvoice.status === "partially_paid"
          ? "partially_paid"
          : "unpaid"
      );
      setAmountPaid(existingInvoice.amountPaid || 0);
      setPaymentMethod(
        existingInvoice.paymentMethod || "bank_transfer"
      );
      setPaymentDate(
        existingInvoice.paymentDate ||
          existingInvoice.paidAt ||
          toDateOnly(new Date())
      );
      setPaymentReference(
        existingInvoice.paymentReference || ""
      );
    } catch (error) {
      console.error("❌ Invoice setup failed:", error);
      Alert.alert(
        "Unable to edit invoice",
        "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculated = useMemo(() => {
    return calculateInvoiceTotals({
      items,
      pricesIncludeTax,
      taxEnabled,
      invoiceDiscountType,
      invoiceDiscountValue,
      shippingAmount,
      roundingAdjustment,
      amountPaid: 0,
    });
  }, [
    invoiceDiscountType,
    invoiceDiscountValue,
    items,
    pricesIncludeTax,
    roundingAdjustment,
    shippingAmount,
    taxEnabled,
  ]);

  const formatMoney = (amount: number): string => {
    try {
      return new Intl.NumberFormat(
        companyProfile?.locale || "en-GB",
        {
          style: "currency",
          currency: companyProfile?.currencyCode || "GBP",
        }
      ).format(Number(amount || 0));
    } catch {
      return `${
        companyProfile?.currencySymbol || "£"
      }${Number(amount || 0).toFixed(2)}`;
    }
  };

  const updateItem = (
    id: string,
    updates: Partial<InvoiceItem>
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? calculateInvoiceItem(
              { ...item, ...updates },
              pricesIncludeTax,
              taxEnabled
            )
          : item
      )
    );
  };

  const addCustomItem = () => {
    setItems((current) => [
      ...current,
      createBlankItem(defaultTaxRate, taxLabel),
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      Alert.alert(
        "At least one item required",
        "An invoice must contain at least one product or service."
      );
      return;
    }

    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const duplicateItem = (item: InvoiceItem) => {
    setItems((current) => [
      ...current,
      {
        ...item,
        id: makeId(),
        stockProcessed: false,
        stockProcessedQuantity: 0,
      },
    ]);
  };

  const openStockPicker = (itemId: string) => {
    setTargetItemId(itemId);
    setStockSearch("");
    setShowStockModal(true);
  };

  const selectStockItem = (stock: StockItem) => {
    if (!targetItemId) return;

    updateItem(targetItemId, {
      sourceType: "stock",
      stockId: stock.id,
      productName: stock.name,
      description: stock.category || "",
      unit: stock.unit || "item",
      unitPrice: Number(stock.costPrice || 0),
      quantity: 1,
      taxRate: defaultTaxRate,
      taxName: taxLabel,
    });

    setShowStockModal(false);
    setTargetItemId(null);
  };

  const filteredStock = useMemo(() => {
    const query = stockSearch.trim().toLowerCase();

    if (!query) return stockItems;

    return stockItems.filter((item) =>
      [item.name, item.category, item.barcode]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [stockItems, stockSearch]);

  const validate = (): boolean => {
    if (!invoiceNumber.trim()) {
      Alert.alert(
        "Invoice number required",
        "Enter an invoice number."
      );
      return false;
    }

    if (!customerName.trim()) {
      Alert.alert(
        "Customer required",
        "Enter the customer or business name."
      );
      return false;
    }

    const invalidItem = items.find(
      (item) =>
        !item.productName.trim() ||
        Number(item.quantity) <= 0 ||
        Number(item.unitPrice) < 0
    );

    if (invalidItem) {
      Alert.alert(
        "Check invoice items",
        "Every item needs a name, quantity above zero and a valid price."
      );
      return false;
    }

    if (
      paymentStatus === "partially_paid" &&
      (amountPaid <= 0 ||
        amountPaid >= calculated.totals.grandTotal)
    ) {
      Alert.alert(
        "Check amount paid",
        "For a partially paid invoice, enter an amount greater than zero and less than the invoice total."
      );
      return false;
    }

    return true;
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      if (!invoiceNumber.trim()) {
        Alert.alert(
          "Invoice number required",
          "Enter an invoice number before continuing."
        );
        return false;
      }

      return true;
    }

    if (currentStep === 2) {
      if (!customerName.trim()) {
        Alert.alert(
          "Customer required",
          "Enter the customer or business name before continuing."
        );
        return false;
      }

      return true;
    }

    if (currentStep === 3) {
      const invalidItem = items.find(
        (item) =>
          !item.productName.trim() ||
          Number(item.quantity) <= 0 ||
          Number(item.unitPrice) < 0
      );

      if (invalidItem) {
        Alert.alert(
          "Check invoice items",
          "Every item needs a name, quantity above zero and a valid price."
        );
        return false;
      }

      return true;
    }

    if (currentStep === 4) {
      if (
        paymentStatus === "partially_paid" &&
        (amountPaid <= 0 ||
          amountPaid >= calculated.totals.grandTotal)
      ) {
        Alert.alert(
          "Check amount paid",
          "For a partially paid invoice, enter an amount greater than zero and less than the invoice total."
        );
        return false;
      }

      return true;
    }

    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((step) => Math.min(step + 1, 5));
  };

  const goBack = () => {
    if (currentStep === 1) {
      router.back();
      return;
    }

    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const handleSave = async (
    mode: "save" | "preview"
  ) => {
    if (!validate() || !invoiceId) return;

    try {
      setSaving(true);

      const updated = await updateInvoice(invoiceId, {
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate,
        dueDate,

        customerName: customerName.trim(),
        customerCompany: customerCompany.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        billingAddress: billingAddress.trim(),
        shippingAddress: sameAsBilling
          ? billingAddress.trim()
          : shippingAddress.trim(),
        customerTaxNumber: customerTaxNumber.trim(),

        purchaseOrderNumber: purchaseOrderNumber.trim(),
        reference: reference.trim(),

        currencyCode: companyProfile?.currencyCode || "GBP",
        currencySymbol:
          companyProfile?.currencySymbol || "£",
        locale: companyProfile?.locale || "en-GB",

        taxEnabled,
        taxLabel,
        pricesIncludeTax,

        items: calculated.calculatedItems,

        invoiceDiscountType,
        invoiceDiscountValue,

        shippingAmount,
        roundingAdjustment,

        notes: notes.trim(),
        paymentTerms: paymentTerms.trim(),
        paymentInstructions: paymentInstructions.trim(),
        termsAndConditions: termsAndConditions.trim(),

        stockReductionTrigger,
      });

      if (!updated) {
        throw new Error("Invoice could not be updated.");
      }

      if (mode === "preview") {
        router.replace({
          pathname: "/screens/invoices/view",
          params: { id: updated.id },
        });
      } else {
        Alert.alert(
          "Invoice updated",
          `${updated.invoiceNumber} was updated successfully.`,
          [
            {
              text: "View invoice",
              onPress: () =>
                router.replace({
                  pathname: "/screens/invoices/view",
                  params: { id: updated.id },
                }),
            },
          ]
        );
      }
    } catch (error) {
      console.error("❌ Update invoice failed:", error);
      Alert.alert(
        "Unable to update invoice",
        error instanceof Error
          ? error.message
          : "Please check the form and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#bfdbfe" />
            <Text style={styles.loadingText}>
              Loading invoice...
            </Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Invoice",
          headerShown: false,
        }}
      />

      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <SafeAreaView
            style={styles.safeArea}
            edges={["top", "bottom"]}
          >
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={
              Platform.OS === "ios" ? "padding" : undefined
            }
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={22}
                    color="#e2e8f0"
                  />
                </TouchableOpacity>

                <View style={styles.headerTextBlock}>
                  <Text style={styles.pageTitle}>
                    Edit Invoice
                  </Text>
                  <Text style={styles.pageSubtitle}>
                    Update invoice details and preview the A4 document
                  </Text>
                </View>
              </View>

              <View style={styles.wizardProgress}>
                {wizardSteps.map((step, index) => {
                  const active = currentStep === step.number;
                  const complete = currentStep > step.number;

                  return (
                    <React.Fragment key={step.number}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          if (step.number <= currentStep) {
                            setCurrentStep(step.number);
                          }
                        }}
                        style={styles.wizardStep}
                      >
                        <View
                          style={[
                            styles.wizardCircle,
                            active && styles.wizardCircleActive,
                            complete && styles.wizardCircleComplete,
                          ]}
                        >
                          {complete ? (
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color="#0f172a"
                            />
                          ) : (
                            <Text
                              style={[
                                styles.wizardCircleText,
                                active &&
                                  styles.wizardCircleTextActive,
                              ]}
                            >
                              {step.number}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.wizardStepLabel,
                            active &&
                              styles.wizardStepLabelActive,
                          ]}
                          numberOfLines={1}
                        >
                          {step.label}
                        </Text>
                      </TouchableOpacity>

                      {index < wizardSteps.length - 1 && (
                        <View
                          style={[
                            styles.wizardLine,
                            currentStep > step.number &&
                              styles.wizardLineComplete,
                          ]}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>

              <View style={styles.a4Notice}>
                <View style={styles.a4Icon}>
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color="#0f172a"
                  />
                </View>

                <View style={styles.a4TextBlock}>
                  <Text style={styles.a4Title}>
                    Professional A4 layout
                  </Text>
                  <Text style={styles.a4Text}>
                    Your final invoice will use a bordered A4
                    template with a structured header, item
                    table, totals, payment details and footer.
                  </Text>
                </View>
              </View>

              {currentStep === 1 && (
                <>
              <Section title="Invoice details">
                <FieldLabel label="Invoice number" required />
                <TextInput
                  value={invoiceNumber}
                  onChangeText={setInvoiceNumber}
                  style={styles.input}
                  placeholder="INV-0001"
                  placeholderTextColor="#94a3b8"
                />

                <View style={styles.twoColumns}>
                  <View style={styles.column}>
                    <FieldLabel label="Invoice date" />
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() =>
                        setShowInvoiceDatePicker(true)
                      }
                    >
                      <Text style={styles.dateText}>
                        {displayDate(invoiceDate)}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#bfdbfe"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.column}>
                    <FieldLabel label="Due date" />
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() =>
                        setShowDueDatePicker(true)
                      }
                    >
                      <Text style={styles.dateText}>
                        {displayDate(dueDate)}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#bfdbfe"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <FieldLabel label="Purchase order number" />
                <TextInput
                  value={purchaseOrderNumber}
                  onChangeText={setPurchaseOrderNumber}
                  style={styles.input}
                  placeholder="Optional PO number"
                  placeholderTextColor="#94a3b8"
                />

                <FieldLabel label="Reference" />
                <TextInput
                  value={reference}
                  onChangeText={setReference}
                  style={styles.input}
                  placeholder="Optional internal reference"
                  placeholderTextColor="#94a3b8"
                />
              </Section>

              </>
              )}

              {currentStep === 2 && (
                <>
              <Section title="Bill to">
                <FieldLabel
                  label="Customer or business name"
                  required
                />
                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  style={styles.input}
                  placeholder="Customer name"
                  placeholderTextColor="#94a3b8"
                />

                <FieldLabel label="Company name" />
                <TextInput
                  value={customerCompany}
                  onChangeText={setCustomerCompany}
                  style={styles.input}
                  placeholder="Optional company name"
                  placeholderTextColor="#94a3b8"
                />

                <View style={styles.twoColumns}>
                  <View style={styles.column}>
                    <FieldLabel label="Email" />
                    <TextInput
                      value={customerEmail}
                      onChangeText={setCustomerEmail}
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.column}>
                    <FieldLabel label="Phone" />
                    <TextInput
                      value={customerPhone}
                      onChangeText={setCustomerPhone}
                      style={styles.input}
                      placeholder="Phone"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <FieldLabel label="Billing address" />
                <TextInput
                  value={billingAddress}
                  onChangeText={setBillingAddress}
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Full billing address"
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                />

                <View style={styles.switchRow}>
                  <View style={styles.switchTextBlock}>
                    <Text style={styles.switchTitle}>
                      Shipping address same as billing
                    </Text>
                    <Text style={styles.switchSubtitle}>
                      Turn off to enter a separate address
                    </Text>
                  </View>
                  <Switch
                    value={sameAsBilling}
                    onValueChange={setSameAsBilling}
                  />
                </View>

                {!sameAsBilling && (
                  <>
                    <FieldLabel label="Shipping address" />
                    <TextInput
                      value={shippingAddress}
                      onChangeText={setShippingAddress}
                      style={[
                        styles.input,
                        styles.multilineInput,
                      ]}
                      placeholder="Full shipping address"
                      placeholderTextColor="#94a3b8"
                      multiline
                      textAlignVertical="top"
                    />
                  </>
                )}

                <FieldLabel
                  label={`Customer ${taxLabel} number`}
                />
                <TextInput
                  value={customerTaxNumber}
                  onChangeText={setCustomerTaxNumber}
                  style={styles.input}
                  placeholder={`Optional ${taxLabel} number`}
                  placeholderTextColor="#94a3b8"
                />
              </Section>

              </>
              )}

              {currentStep === 3 && (
                <>
              <Section
                title="Products and services"
                rightElement={
                  <TouchableOpacity
                    onPress={addCustomItem}
                    style={styles.sectionAddButton}
                  >
                    <Ionicons
                      name="add"
                      size={17}
                      color="#0f172a"
                    />
                    <Text style={styles.sectionAddText}>
                      Add item
                    </Text>
                  </TouchableOpacity>
                }
              >
                {items.map((item, index) => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>
                        Item {index + 1}
                      </Text>

                      <View style={styles.itemHeaderActions}>
                        <TouchableOpacity
                          onPress={() => duplicateItem(item)}
                          style={styles.smallIconButton}
                        >
                          <Ionicons
                            name="copy-outline"
                            size={17}
                            color="#bfdbfe"
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => removeItem(item.id)}
                          style={styles.smallIconButton}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={17}
                            color="#fca5a5"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.itemSourceRow}>
                      <TouchableOpacity
                        onPress={() =>
                          updateItem(item.id, {
                            sourceType: "custom",
                            stockId: undefined,
                          })
                        }
                        style={[
                          styles.sourceButton,
                          item.sourceType !== "stock" &&
                            styles.sourceButtonSelected,
                        ]}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color={
                            item.sourceType !== "stock"
                              ? "#0f172a"
                              : "#cbd5e1"
                          }
                        />
                        <Text
                          style={[
                            styles.sourceText,
                            item.sourceType !== "stock" &&
                              styles.sourceTextSelected,
                          ]}
                        >
                          Custom
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          openStockPicker(item.id)
                        }
                        style={[
                          styles.sourceButton,
                          item.sourceType === "stock" &&
                            styles.sourceButtonSelected,
                        ]}
                      >
                        <Ionicons
                          name="cube-outline"
                          size={16}
                          color={
                            item.sourceType === "stock"
                              ? "#0f172a"
                              : "#cbd5e1"
                          }
                        />
                        <Text
                          style={[
                            styles.sourceText,
                            item.sourceType === "stock" &&
                              styles.sourceTextSelected,
                          ]}
                        >
                          Stock list
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <FieldLabel
                      label="Product or service"
                      required
                    />
                    <TextInput
                      value={item.productName}
                      onChangeText={(value) =>
                        updateItem(item.id, {
                          productName: value,
                        })
                      }
                      style={styles.input}
                      placeholder="Product or service name"
                      placeholderTextColor="#94a3b8"
                    />

                    <FieldLabel label="Description" />
                    <TextInput
                      value={item.description || ""}
                      onChangeText={(value) =>
                        updateItem(item.id, {
                          description: value,
                        })
                      }
                      style={[
                        styles.input,
                        styles.itemDescriptionInput,
                      ]}
                      placeholder="Optional description"
                      placeholderTextColor="#94a3b8"
                      multiline
                      textAlignVertical="top"
                    />

                    <View style={styles.threeColumns}>
                      <View style={styles.thirdColumn}>
                        <FieldLabel label="Quantity" />
                        <TextInput
                          value={String(item.quantity)}
                          onChangeText={(value) =>
                            updateItem(item.id, {
                              quantity: toInputNumber(value),
                            })
                          }
                          style={styles.input}
                          keyboardType="decimal-pad"
                          placeholder="1"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>

                      <View style={styles.thirdColumn}>
                        <FieldLabel label="Unit" />
                        <TextInput
                          value={item.unit || ""}
                          onChangeText={(value) =>
                            updateItem(item.id, {
                              unit: value,
                            })
                          }
                          style={styles.input}
                          placeholder="item"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>

                      <View style={styles.thirdColumn}>
                        <FieldLabel label="Unit price" />
                        <TextInput
                          value={String(item.unitPrice)}
                          onChangeText={(value) =>
                            updateItem(item.id, {
                              unitPrice: toInputNumber(value),
                            })
                          }
                          style={styles.input}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>
                    </View>

                    <View style={styles.twoColumns}>
                      <View style={styles.column}>
                        <FieldLabel label="Discount" />
                        <View style={styles.compoundInput}>
                          <TextInput
                            value={String(
                              item.discountValue || 0
                            )}
                            onChangeText={(value) =>
                              updateItem(item.id, {
                                discountValue:
                                  toInputNumber(value),
                              })
                            }
                            style={styles.compoundTextInput}
                            keyboardType="decimal-pad"
                          />
                          <TouchableOpacity
                            style={styles.compoundSuffix}
                            onPress={() =>
                              updateItem(item.id, {
                                discountType:
                                  item.discountType ===
                                  "percentage"
                                    ? "fixed"
                                    : "percentage",
                              })
                            }
                          >
                            <Text style={styles.compoundSuffixText}>
                              {item.discountType ===
                              "percentage"
                                ? "%"
                                : companyProfile?.currencySymbol ||
                                  "£"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.column}>
                        <FieldLabel label={taxLabel} />
                        <View style={styles.compoundInput}>
                          <TextInput
                            value={String(item.taxRate || 0)}
                            onChangeText={(value) =>
                              updateItem(item.id, {
                                taxRate: toInputNumber(value),
                              })
                            }
                            editable={taxEnabled}
                            style={[
                              styles.compoundTextInput,
                              !taxEnabled &&
                                styles.disabledInput,
                            ]}
                            keyboardType="decimal-pad"
                          />
                          <View style={styles.compoundSuffix}>
                            <Text
                              style={styles.compoundSuffixText}
                            >
                              %
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {item.sourceType === "stock" &&
                    Boolean(item.stockId) ? (
                      <View style={styles.stockInfo}>
                          <Ionicons
                            name="information-circle-outline"
                            size={17}
                            color="#93c5fd"
                          />
                          <Text style={styles.stockInfoText}>
                            Available stock:{" "}
                            {stockItems.find(
                              (stock) =>
                                stock.id === item.stockId
                            )?.quantity ?? "—"}
                          </Text>
                      </View>
                    ) : null}

                    <View style={styles.lineTotalRow}>
                      <Text style={styles.lineTotalLabel}>
                        Line total
                      </Text>
                      <Text style={styles.lineTotalValue}>
                        {formatMoney(
                          calculateInvoiceItem(
                            item,
                            pricesIncludeTax,
                            taxEnabled
                          ).total
                        )}
                      </Text>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={addCustomItem}
                  style={styles.largeAddButton}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color="#dbeafe"
                  />
                  <Text style={styles.largeAddButtonText}>
                    Add another product or service
                  </Text>
                </TouchableOpacity>
              </Section>

              <Section title={`${taxLabel} and totals`}>
                <View style={styles.switchRow}>
                  <View style={styles.switchTextBlock}>
                    <Text style={styles.switchTitle}>
                      Enable {taxLabel}
                    </Text>
                    <Text style={styles.switchSubtitle}>
                      Add tax to applicable invoice items
                    </Text>
                  </View>
                  <Switch
                    value={taxEnabled}
                    onValueChange={setTaxEnabled}
                  />
                </View>

                {taxEnabled && (
                  <View style={styles.switchRow}>
                    <View style={styles.switchTextBlock}>
                      <Text style={styles.switchTitle}>
                        Prices include {taxLabel}
                      </Text>
                      <Text style={styles.switchSubtitle}>
                        Unit prices already include tax
                      </Text>
                    </View>
                    <Switch
                      value={pricesIncludeTax}
                      onValueChange={setPricesIncludeTax}
                    />
                  </View>
                )}

                <View style={styles.twoColumns}>
                  <View style={styles.column}>
                    <FieldLabel label="Invoice discount" />
                    <View style={styles.compoundInput}>
                      <TextInput
                        value={String(invoiceDiscountValue)}
                        onChangeText={(value) =>
                          setInvoiceDiscountValue(
                            toInputNumber(value)
                          )
                        }
                        style={styles.compoundTextInput}
                        keyboardType="decimal-pad"
                      />
                      <TouchableOpacity
                        style={styles.compoundSuffix}
                        onPress={() =>
                          setInvoiceDiscountType((current) =>
                            current === "percentage"
                              ? "fixed"
                              : "percentage"
                          )
                        }
                      >
                        <Text style={styles.compoundSuffixText}>
                          {invoiceDiscountType === "percentage"
                            ? "%"
                            : companyProfile?.currencySymbol ||
                              "£"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.column}>
                    <FieldLabel label="Shipping" />
                    <TextInput
                      value={String(shippingAmount)}
                      onChangeText={(value) =>
                        setShippingAmount(
                          toInputNumber(value)
                        )
                      }
                      style={styles.input}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <FieldLabel label="Rounding adjustment" />
                <TextInput
                  value={String(roundingAdjustment)}
                  onChangeText={(value) =>
                    setRoundingAdjustment(
                      toInputNumber(value)
                    )
                  }
                  style={styles.input}
                  keyboardType="numbers-and-punctuation"
                />

                <View style={styles.totalPanel}>
                  <TotalRow
                    label="Subtotal"
                    value={formatMoney(
                      calculated.totals.subtotal
                    )}
                  />
                  <TotalRow
                    label="Item discounts"
                    value={`- ${formatMoney(
                      calculated.totals.itemDiscountTotal
                    )}`}
                  />
                  <TotalRow
                    label="Invoice discount"
                    value={`- ${formatMoney(
                      calculated.totals
                        .invoiceDiscountAmount
                    )}`}
                  />
                  <TotalRow
                    label="Shipping"
                    value={formatMoney(
                      calculated.totals.shippingAmount
                    )}
                  />
                  <TotalRow
                    label={taxLabel}
                    value={formatMoney(
                      calculated.totals.taxTotal
                    )}
                  />
                  <View style={styles.totalDivider} />
                  <TotalRow
                    label="Grand total"
                    value={formatMoney(
                      calculated.totals.grandTotal
                    )}
                    strong
                  />
                </View>
              </Section>

              </>
              )}

              {currentStep === 4 && (
                <>
              <Section title="Payment status">
                <Text style={styles.explainer}>
                  Record whether this invoice is unpaid, partly paid
                  or fully paid at the time of saving.
                </Text>

                <View style={styles.paymentStatusRow}>
                  {(
                    [
                      ["unpaid", "Unpaid"],
                      ["partially_paid", "Part paid"],
                      ["paid", "Paid"],
                    ] as const
                  ).map(([value, label]) => {
                    const selected = paymentStatus === value;

                    return (
                      <TouchableOpacity
                        key={value}
                        onPress={() => {
                          setPaymentStatus(value);

                          if (value === "unpaid") {
                            setAmountPaid(0);
                          }

                          if (value === "paid") {
                            setAmountPaid(
                              calculated.totals.grandTotal
                            );
                          }
                        }}
                        style={[
                          styles.paymentStatusButton,
                          selected &&
                            styles.paymentStatusButtonSelected,
                        ]}
                      >
                        <Ionicons
                          name={
                            value === "paid"
                              ? "checkmark-circle-outline"
                              : value === "partially_paid"
                              ? "pie-chart-outline"
                              : "time-outline"
                          }
                          size={17}
                          color={
                            selected ? "#0f172a" : "#cbd5e1"
                          }
                        />
                        <Text
                          style={[
                            styles.paymentStatusText,
                            selected &&
                              styles.paymentStatusTextSelected,
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {paymentStatus !== "unpaid" && (
                  <>
                    <FieldLabel label="Amount paid" />
                    <TextInput
                      value={String(
                        paymentStatus === "paid"
                          ? calculated.totals.grandTotal
                          : amountPaid
                      )}
                      onChangeText={(value) =>
                        setAmountPaid(toInputNumber(value))
                      }
                      editable={paymentStatus === "partially_paid"}
                      style={[
                        styles.input,
                        paymentStatus === "paid" &&
                          styles.disabledInput,
                      ]}
                      keyboardType="decimal-pad"
                    />

                    <FieldLabel label="Payment date" />
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() =>
                        setShowPaymentDatePicker(true)
                      }
                    >
                      <Text style={styles.dateText}>
                        {displayDate(paymentDate)}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#bfdbfe"
                      />
                    </TouchableOpacity>

                    <FieldLabel label="Payment method" />
                    <View style={styles.methodGrid}>
                      {(
                        [
                          ["cash", "Cash"],
                          ["card", "Card"],
                          ["bank_transfer", "Bank transfer"],
                          ["cheque", "Cheque"],
                          ["online", "Online"],
                          ["other", "Other"],
                        ] as Array<
                          [InvoicePaymentMethod, string]
                        >
                      ).map(([value, label]) => {
                        const selected =
                          paymentMethod === value;

                        return (
                          <TouchableOpacity
                            key={value}
                            onPress={() =>
                              setPaymentMethod(value)
                            }
                            style={[
                              styles.methodButton,
                              selected &&
                                styles.methodButtonSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.methodText,
                                selected &&
                                  styles.methodTextSelected,
                              ]}
                            >
                              {label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <FieldLabel label="Payment reference" />
                    <TextInput
                      value={paymentReference}
                      onChangeText={setPaymentReference}
                      style={styles.input}
                      placeholder="Transaction or receipt reference"
                      placeholderTextColor="#94a3b8"
                    />
                  </>
                )}
              </Section>

              </>
              )}

              {currentStep === 5 && (
                <>
              <Section title="Payment and notes">
                <FieldLabel label="Payment terms" />
                <TextInput
                  value={paymentTerms}
                  onChangeText={setPaymentTerms}
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Payment due within 30 days"
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                />

                <FieldLabel label="Payment instructions" />
                <TextInput
                  value={paymentInstructions}
                  onChangeText={setPaymentInstructions}
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Bank or payment details"
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                />

                <FieldLabel label="Notes" />
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Optional message to customer"
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                />

                <FieldLabel label="Terms and conditions" />
                <TextInput
                  value={termsAndConditions}
                  onChangeText={setTermsAndConditions}
                  style={[
                    styles.input,
                    styles.largeMultilineInput,
                  ]}
                  placeholder="Invoice terms and conditions"
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                />
              </Section>

              </>
              )}

              {currentStep === 4 && (
                <>
              <Section title="Stock handling">
                <Text style={styles.explainer}>
                  Choose when stock-linked invoice items should
                  reduce inventory.
                </Text>

                {(
                  [
                    ["created", "When invoice is created"],
                    ["sent", "When invoice is marked sent"],
                    ["paid", "When invoice is marked paid"],
                    ["never", "Never reduce stock"],
                  ] as Array<[StockReductionTrigger, string]>
                ).map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.radioRow}
                    onPress={() =>
                      setStockReductionTrigger(value)
                    }
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        stockReductionTrigger === value &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {stockReductionTrigger === value && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </Section>

              </>
              )}

              {currentStep === 5 && (
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewTitle}>
                        Invoice summary
                      </Text>
                      <Text style={styles.reviewSubtitle}>
                        Check the key details before saving
                      </Text>
                    </View>
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color="#bfdbfe"
                    />
                  </View>

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Invoice</Text>
                    <Text style={styles.reviewValue}>
                      {invoiceNumber}
                    </Text>
                  </View>

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Customer</Text>
                    <Text style={styles.reviewValue}>
                      {customerName || "—"}
                    </Text>
                  </View>

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Items</Text>
                    <Text style={styles.reviewValue}>
                      {items.length}
                    </Text>
                  </View>

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Payment</Text>
                    <Text style={styles.reviewValue}>
                      {paymentStatus === "paid"
                        ? "Paid"
                        : paymentStatus === "partially_paid"
                        ? "Part paid"
                        : "Unpaid"}
                    </Text>
                  </View>

                  <View style={styles.reviewDivider} />

                  <View style={styles.reviewTotalRow}>
                    <Text style={styles.reviewTotalLabel}>
                      Grand total
                    </Text>
                    <Text style={styles.reviewTotalValue}>
                      {formatMoney(
                        calculated.totals.grandTotal
                      )}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.bottomActions}>
                <TouchableOpacity
                  disabled={saving}
                  onPress={goBack}
                  style={styles.secondaryButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color="#dbeafe"
                  />
                  <Text style={styles.secondaryButtonText}>
                    {currentStep === 1 ? "Cancel" : "Back"}
                  </Text>
                </TouchableOpacity>

                {currentStep < 5 ? (
                  <TouchableOpacity
                    disabled={saving}
                    onPress={goNext}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>
                      Continue
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#0f172a"
                    />
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      disabled={saving}
                      onPress={() => handleSave("save")}
                      style={styles.secondaryButton}
                    >
                      {saving ? (
                        <ActivityIndicator
                          size="small"
                          color="#dbeafe"
                        />
                      ) : (
                        <Ionicons
                          name="save-outline"
                          size={18}
                          color="#dbeafe"
                        />
                      )}
                      <Text style={styles.secondaryButtonText}>
                        Save changes
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={saving}
                      onPress={() => handleSave("preview")}
                      style={styles.primaryButton}
                    >
                      {saving ? (
                        <ActivityIndicator
                          size="small"
                          color="#0f172a"
                        />
                      ) : (
                        <Ionicons
                          name="document-text-outline"
                          size={18}
                          color="#0f172a"
                        />
                      )}
                      <Text style={styles.primaryButtonText}>
                        Preview A4
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        </LinearGradient>
      </ScreenWrapper>

            {DateTimePickerModal ? (
        <>
          <DateTimePickerModal
            isVisible={showInvoiceDatePicker}
            mode="date"
            date={new Date(invoiceDate)}
            onConfirm={(date: Date) => {
              setShowInvoiceDatePicker(false);
              setInvoiceDate(toDateOnly(date));
            }}
            onCancel={() => setShowInvoiceDatePicker(false)}
          />

          <DateTimePickerModal
            isVisible={showDueDatePicker}
            mode="date"
            date={new Date(dueDate)}
            minimumDate={new Date(invoiceDate)}
            onConfirm={(date: Date) => {
              setShowDueDatePicker(false);
              setDueDate(toDateOnly(date));
            }}
            onCancel={() => setShowDueDatePicker(false)}
          />

          <DateTimePickerModal
            isVisible={showPaymentDatePicker}
            mode="date"
            date={new Date(paymentDate)}
            maximumDate={new Date()}
            onConfirm={(date: Date) => {
              setShowPaymentDatePicker(false);
              setPaymentDate(toDateOnly(date));
            }}
            onCancel={() => setShowPaymentDatePicker(false)}
          />
        </>
      ) : null}

      <Modal
        visible={showStockModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStockModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.stockModal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Select stock item
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose a product from your inventory
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowStockModal(false)}
                style={styles.modalClose}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#e2e8f0"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color="#94a3b8"
              />
              <TextInput
                value={stockSearch}
                onChangeText={setStockSearch}
                style={styles.searchInput}
                placeholder="Search stock"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <FlatList
              data={filteredStock}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.stockListContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectStockItem(item)}
                  style={styles.stockRow}
                >
                  <View style={styles.stockIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={20}
                      color="#bfdbfe"
                    />
                  </View>

                  <View style={styles.stockTextBlock}>
                    <Text style={styles.stockName}>
                      {item.name}
                    </Text>
                    <Text style={styles.stockMeta}>
                      {item.category || "Uncategorised"} •{" "}
                      {item.quantity} {item.unit || "units"}
                    </Text>
                  </View>

                  <Text style={styles.stockPrice}>
                    {formatMoney(item.costPrice || 0)}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.stockEmpty}>
                  <Ionicons
                    name="cube-outline"
                    size={35}
                    color="#94a3b8"
                  />
                  <Text style={styles.stockEmptyText}>
                    No stock items found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const Section = ({
  title,
  rightElement,
  children,
}: {
  title: string;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rightElement ?? null}
    </View>
    {children}
  </View>
);

const FieldLabel = ({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) => (
  <Text style={styles.label}>
    {label}
    {required ? <Text style={styles.required}> *</Text> : null}
  </Text>
);

const TotalRow = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <View style={styles.totalRow}>
    <Text
      style={[
        styles.totalLabel,
        strong && styles.totalLabelStrong,
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.totalValue,
        strong && styles.totalValueStrong,
      ]}
    >
      {value}
    </Text>
  </View>
);

export default EditInvoiceScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.48)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    marginRight: 12,
  },
  headerTextBlock: { flex: 1 },
  pageTitle: {
    color: "#f8fafc",
    fontSize: 27,
    fontWeight: "800",
  },
  pageSubtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 2,
  },
  a4Notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#dbeafe",
    marginBottom: 16,
  },
  a4Icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  a4TextBlock: { flex: 1 },
  a4Title: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },
  a4Text: {
    color: "#334155",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  wizardProgress: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  wizardStep: {
    width: 54,
    alignItems: "center",
  },
  wizardCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(148,163,184,0.45)",
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  wizardCircleActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  wizardCircleComplete: {
    backgroundColor: "#bfdbfe",
    borderColor: "#bfdbfe",
  },
  wizardCircleText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800",
  },
  wizardCircleTextActive: {
    color: "#0f172a",
  },
  wizardStepLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 5,
    textAlign: "center",
  },
  wizardStepLabelActive: {
    color: "#f8fafc",
  },
  wizardLine: {
    flex: 1,
    height: 2,
    marginTop: 14,
    backgroundColor: "rgba(148,163,184,0.25)",
  },
  wizardLineComplete: {
    backgroundColor: "#bfdbfe",
  },
  reviewCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "rgba(15,23,42,0.58)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.15)",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  reviewTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
  },
  reviewSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
  },
  reviewLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  reviewValue: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  reviewDivider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.18)",
    marginVertical: 8,
  },
  reviewTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewTotalLabel: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
  },
  reviewTotalValue: {
    color: "#dbeafe",
    fontSize: 19,
    fontWeight: "900",
  },
  section: {
    backgroundColor: "rgba(15,23,42,0.54)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.14)",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
  },
  sectionAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dbeafe",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  sectionAddText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800",
  },
  label: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 7,
  },
  required: { color: "#fca5a5" },
  input: {
    minHeight: 47,
    borderRadius: 12,
    backgroundColor: "rgba(15,23,42,0.6)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    color: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 88,
  },
  largeMultilineInput: {
    minHeight: 120,
  },
  itemDescriptionInput: {
    minHeight: 72,
  },
  disabledInput: {
    opacity: 0.5,
  },
  twoColumns: {
    flexDirection: "row",
    gap: 10,
  },
  column: { flex: 1 },
  threeColumns: {
    flexDirection: "row",
    gap: 8,
  },
  thirdColumn: { flex: 1 },
  dateInput: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    backgroundColor: "rgba(15,23,42,0.6)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    paddingHorizontal: 12,
  },
  dateText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    paddingVertical: 9,
  },
  switchTextBlock: { flex: 1 },
  switchTitle: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "700",
  },
  switchSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  itemCard: {
    borderRadius: 15,
    padding: 13,
    backgroundColor: "rgba(30,41,59,0.58)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },
  itemTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
  itemHeaderActions: {
    flexDirection: "row",
    gap: 7,
  },
  smallIconButton: {
    width: 33,
    height: 33,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  itemSourceRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 7,
  },
  sourceButton: {
    flex: 1,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 11,
    backgroundColor: "rgba(15,23,42,0.48)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.17)",
  },
  sourceButtonSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  sourceText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
  },
  sourceTextSelected: { color: "#0f172a" },
  compoundInput: {
    minHeight: 47,
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(15,23,42,0.6)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  compoundTextInput: {
    flex: 1,
    color: "#f8fafc",
    paddingHorizontal: 12,
    fontSize: 14,
  },
  compoundSuffix: {
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(148,163,184,0.18)",
  },
  compoundSuffixText: {
    color: "#bfdbfe",
    fontSize: 13,
    fontWeight: "800",
  },
  stockInfo: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(59,130,246,0.12)",
    marginTop: 10,
  },
  stockInfoText: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "600",
  },
  lineTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
    
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.16)",
  },
  lineTotalLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },
  lineTotalValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
  },
  largeAddButton: {
    minHeight: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(191,219,254,0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  largeAddButtonText: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "700",
  },
  totalPanel: {
    marginTop: 15,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 9,
  },
  totalLabel: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  totalValue: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
  },
  totalLabelStrong: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
  },
  totalValueStrong: {
    color: "#dbeafe",
    fontSize: 18,
    fontWeight: "900",
  },
  totalDivider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.18)",
    marginBottom: 10,
  },
  explainer: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
  },
  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#bfdbfe",
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#bfdbfe",
  },
  radioLabel: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
  },
  paymentStatusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  paymentStatusButton: {
    flex: 1,
    minHeight: 43,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    backgroundColor: "rgba(15,23,42,0.48)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  paymentStatusButtonSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  paymentStatusText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
  },
  paymentStatusTextSelected: {
    color: "#0f172a",
  },
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  methodButton: {
    minWidth: "30%",
    flexGrow: 1,
    minHeight: 39,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    backgroundColor: "rgba(15,23,42,0.48)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
  },
  methodButtonSelected: {
    backgroundColor: "rgba(59,130,246,0.24)",
    borderColor: "rgba(147,197,253,0.42)",
  },
  methodText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "700",
  },
  methodTextSelected: {
    color: "#dbeafe",
  },
  bottomActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 3,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  secondaryButtonText: {
    color: "#dbeafe",
    fontSize: 14,
    fontWeight: "800",
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#dbeafe",
  },
  primaryButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
  dateModalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 6, 23, 0.62)",
  },
  dateModalCard: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 18,
    overflow: "hidden",
  },
  dateModalHeader: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#cbd5e1",
  },
  dateModalHeaderButton: {
    minWidth: 64,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dateModalTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  dateModalCancelText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "600",
  },
  dateModalDoneText: {
    color: "#1d4ed8",
    fontSize: 15,
    fontWeight: "800",
  },
  dateModalPicker: {
    alignSelf: "stretch",
    height: 216,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,6,23,0.72)",
  },
  stockModal: {
    height: "82%",
    backgroundColor: "#111827",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 9,
  },
  modalHandle: {
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#475569",
    alignSelf: "center",
    marginBottom: 13,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#f8fafc",
    fontSize: 19,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(51,65,85,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(30,41,59,0.9)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 14,
  },
  stockListContent: {
    
    paddingBottom: 30,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "rgba(30,41,59,0.72)",
    marginBottom: 9,
  },
  stockIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.15)",
  },
  stockTextBlock: { flex: 1 },
  stockName: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  stockMeta: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 3,
  },
  stockPrice: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "800",
  },
  stockEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  stockEmptyText: {
    color: "#94a3b8",
    fontSize: 13,
  },
});
