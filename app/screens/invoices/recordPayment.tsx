// app/screens/invoices/recordPayment.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import {
  addInvoicePayment,
  getInvoiceById,
} from "@/lib/invoiceStorage";
import type {
  Invoice,
  InvoicePaymentMethod,
} from "@/types/invoice";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  Stack,
  useLocalSearchParams,
} from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

let DateTimePickerModal: any = null;

if (Platform.OS !== "web") {
  try {
    DateTimePickerModal =
      require("react-native-modal-datetime-picker").default;
  } catch {
    console.warn("DateTimePickerModal not available");
  }
}

const PAYMENT_METHODS: Array<{
  value: InvoicePaymentMethod;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { value: "cash", label: "Cash", icon: "cash-outline" },
  { value: "card", label: "Card", icon: "card-outline" },
  {
    value: "bank_transfer",
    label: "Bank transfer",
    icon: "swap-horizontal-outline",
  },
  { value: "cheque", label: "Cheque", icon: "document-outline" },
  { value: "online", label: "Online", icon: "globe-outline" },
  { value: "other", label: "Other", icon: "ellipsis-horizontal" },
];

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

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const parseMoney = (value: string): number => {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return 0;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const RecordPaymentScreen = () => {
  const params = useLocalSearchParams<{ id?: string }>();

  const invoiceId =
    typeof params.id === "string" ? params.id : undefined;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<InvoicePaymentMethod>("bank_transfer");
  const [paymentDate, setPaymentDate] = useState(
    toDateOnly(new Date())
  );
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const loaded = await getInvoiceById(invoiceId);

      if (!loaded) {
        Alert.alert(
          "Invoice not found",
          "This invoice may have been deleted."
        );
        return;
      }

      if (loaded.status === "cancelled") {
        Alert.alert(
          "Payment unavailable",
          "A payment cannot be recorded against a cancelled invoice."
        );
      }

      setInvoice(loaded);
      setAmount(
        Number(loaded.balanceDue || 0) > 0
          ? Number(loaded.balanceDue).toFixed(2)
          : ""
      );
    } catch (error) {
      console.error("❌ Failed to load invoice:", error);
      Alert.alert(
        "Unable to load invoice",
        "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: number): string => {
    try {
      return new Intl.NumberFormat(invoice?.locale || "en-GB", {
        style: "currency",
        currency: invoice?.currencyCode || "GBP",
      }).format(Number(value || 0));
    } catch {
      return `${invoice?.currencySymbol || "£"}${Number(
        value || 0
      ).toFixed(2)}`;
    }
  };

  const paymentAmount = useMemo(
    () => parseMoney(amount),
    [amount]
  );

  const remainingBalance = useMemo(() => {
    if (!invoice) return 0;

    return Math.max(
      0,
      Number(invoice.balanceDue || 0) - paymentAmount
    );
  }, [invoice, paymentAmount]);

  const useFullBalance = () => {
    if (!invoice) return;
    setAmount(Number(invoice.balanceDue || 0).toFixed(2));
  };

  const validate = (): boolean => {
    if (!invoice) {
      Alert.alert(
        "Invoice unavailable",
        "Please return and try again."
      );
      return false;
    }

    if (invoice.status === "cancelled") {
      Alert.alert(
        "Payment unavailable",
        "A payment cannot be recorded against a cancelled invoice."
      );
      return false;
    }

    if (Number(invoice.balanceDue || 0) <= 0) {
      Alert.alert(
        "Nothing to pay",
        "This invoice has no outstanding balance."
      );
      return false;
    }

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      Alert.alert(
        "Invalid amount",
        "Enter a payment amount greater than zero."
      );
      return false;
    }

    if (paymentAmount > Number(invoice.balanceDue || 0)) {
      Alert.alert(
        "Amount too high",
        `The payment cannot exceed the outstanding balance of ${formatMoney(
          invoice.balanceDue
        )}.`
      );
      return false;
    }

    return true;
  };

  const savePayment = async () => {
    if (!validate() || !invoice) return;

    try {
      setSaving(true);

      const updated = await addInvoicePayment({
        invoiceId: invoice.id,
        amount: paymentAmount,
        method: paymentMethod,
        paymentDate,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        "Payment recorded",
        `${formatMoney(
          paymentAmount
        )} was recorded against ${invoice.invoiceNumber}.`,
        [
          {
            text: "View invoice",
            onPress: () =>
              router.replace({
                pathname: "/screens/invoices/view",
                params: { id: updated.id },
              }),
          },
          {
            text: "Invoice list",
            onPress: () =>
              router.replace(
                "/screens/invoices/invoiceList"
              ),
          },
        ]
      );
    } catch (error) {
      console.error("❌ Failed to record payment:", error);
      Alert.alert(
        "Unable to record payment",
        error instanceof Error
          ? error.message
          : "Please check the details and try again."
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

  if (!invoice) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.emptyContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={46}
                color="#fca5a5"
              />
              <Text style={styles.emptyTitle}>
                Invoice unavailable
              </Text>
              <Text style={styles.emptyText}>
                Return to the invoice list and try again.
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  Go back
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  const customerLabel =
    invoice.customerCompany?.trim() ||
    invoice.customerName?.trim() ||
    "Unnamed customer";

  const isFullyPaid = Number(invoice.balanceDue || 0) <= 0;
  const isCancelled = invoice.status === "cancelled";
  const formDisabled = isFullyPaid || isCancelled;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Record Payment",
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
                      Record Payment
                    </Text>
                    <Text style={styles.pageSubtitle}>
                      Add a full or partial customer payment
                    </Text>
                  </View>
                </View>

                <View style={styles.invoiceCard}>
                  <View style={styles.invoiceTopRow}>
                    <View style={styles.invoiceIcon}>
                      <Ionicons
                        name="receipt-outline"
                        size={24}
                        color="#bfdbfe"
                      />
                    </View>

                    <View style={styles.invoiceTextBlock}>
                      <Text style={styles.invoiceNumber}>
                        {invoice.invoiceNumber}
                      </Text>
                      <Text style={styles.customerName}>
                        {customerLabel}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        invoice.status === "paid"
                          ? styles.paidBadge
                          : invoice.status === "cancelled"
                          ? styles.cancelledBadge
                          : styles.openBadge,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {invoice.status
                          .replace("_", " ")
                          .toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.invoiceDivider} />

                  <View style={styles.summaryRow}>
                    <SummaryValue
                      label="Invoice total"
                      value={formatMoney(invoice.grandTotal)}
                    />
                    <SummaryValue
                      label="Already paid"
                      value={formatMoney(invoice.amountPaid)}
                    />
                    <SummaryValue
                      label="Outstanding"
                      value={formatMoney(invoice.balanceDue)}
                      highlight
                    />
                  </View>
                </View>

                {formDisabled ? (
                  <View style={styles.noticeCard}>
                    <Ionicons
                      name={
                        isCancelled
                          ? "close-circle-outline"
                          : "checkmark-circle-outline"
                      }
                      size={23}
                      color={
                        isCancelled ? "#fca5a5" : "#86efac"
                      }
                    />

                    <View style={styles.noticeTextBlock}>
                      <Text style={styles.noticeTitle}>
                        {isCancelled
                          ? "Invoice cancelled"
                          : "Invoice fully paid"}
                      </Text>
                      <Text style={styles.noticeText}>
                        {isCancelled
                          ? "Payments cannot be added to this invoice."
                          : "There is no outstanding balance to collect."}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                          Payment amount
                        </Text>

                        <TouchableOpacity
                          onPress={useFullBalance}
                          style={styles.fullBalanceButton}
                        >
                          <Text style={styles.fullBalanceText}>
                            Use full balance
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.label}>Amount received</Text>

                      <View style={styles.moneyInputWrapper}>
                        <Text style={styles.currencySymbol}>
                          {invoice.currencySymbol || "£"}
                        </Text>

                        <TextInput
                          value={amount}
                          onChangeText={setAmount}
                          style={styles.moneyInput}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor="#64748b"
                        />
                      </View>

                      <View style={styles.balancePreview}>
                        <View>
                          <Text style={styles.balancePreviewLabel}>
                            Remaining after payment
                          </Text>
                          <Text style={styles.balancePreviewHint}>
                            The invoice status updates automatically
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.balancePreviewValue,
                            remainingBalance <= 0 &&
                              styles.balanceCleared,
                          ]}
                        >
                          {formatMoney(remainingBalance)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        Payment details
                      </Text>

                      <Text style={styles.label}>
                        Payment date
                      </Text>

                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={styles.dateInput}
                      >
                        <Text style={styles.dateText}>
                          {displayDate(paymentDate)}
                        </Text>
                        <Ionicons
                          name="calendar-outline"
                          size={19}
                          color="#bfdbfe"
                        />
                      </TouchableOpacity>

                      <Text style={styles.label}>
                        Payment method
                      </Text>

                      <View style={styles.methodGrid}>
                        {PAYMENT_METHODS.map((method) => {
                          const selected =
                            paymentMethod === method.value;

                          return (
                            <TouchableOpacity
                              key={method.value}
                              activeOpacity={0.85}
                              onPress={() =>
                                setPaymentMethod(method.value)
                              }
                              style={[
                                styles.methodButton,
                                selected &&
                                  styles.methodButtonSelected,
                              ]}
                            >
                              <Ionicons
                                name={method.icon}
                                size={18}
                                color={
                                  selected
                                    ? "#0f172a"
                                    : "#cbd5e1"
                                }
                              />
                              <Text
                                style={[
                                  styles.methodText,
                                  selected &&
                                    styles.methodTextSelected,
                                ]}
                              >
                                {method.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <Text style={styles.label}>
                        Payment reference
                      </Text>
                      <TextInput
                        value={reference}
                        onChangeText={setReference}
                        style={styles.input}
                        placeholder="Transaction, receipt or cheque reference"
                        placeholderTextColor="#94a3b8"
                      />

                      <Text style={styles.label}>Notes</Text>
                      <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        style={[
                          styles.input,
                          styles.multilineInput,
                        ]}
                        placeholder="Optional internal payment note"
                        placeholderTextColor="#94a3b8"
                        multiline
                        textAlignVertical="top"
                      />
                    </View>

                    <View style={styles.infoCard}>
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color="#93c5fd"
                      />
                      <Text style={styles.infoText}>
                        Recording this payment will update the
                        invoice balance and change its status to
                        Part Paid or Paid automatically.
                      </Text>
                    </View>
                  </>
                )}

                <View style={styles.bottomActions}>
                  <TouchableOpacity
                    disabled={saving}
                    onPress={() => router.back()}
                    style={styles.secondaryButton}
                  >
                    <Ionicons
                      name="close-outline"
                      size={19}
                      color="#dbeafe"
                    />
                    <Text style={styles.secondaryButtonText}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  {!formDisabled ? (
                    <TouchableOpacity
                      disabled={saving}
                      onPress={savePayment}
                      style={[
                        styles.primaryButton,
                        saving && styles.disabledButton,
                      ]}
                    >
                      {saving ? (
                        <ActivityIndicator
                          size="small"
                          color="#0f172a"
                        />
                      ) : (
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#0f172a"
                        />
                      )}

                      <Text style={styles.primaryButtonText}>
                        Record payment
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </ScreenWrapper>

      {DateTimePickerModal ? (
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          date={new Date(paymentDate)}
          maximumDate={new Date()}
          onConfirm={(date: Date) => {
            setShowDatePicker(false);
            setPaymentDate(toDateOnly(date));
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      ) : null}
    </>
  );
};

const SummaryValue = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.summaryValue}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text
      style={[
        styles.summaryAmount,
        highlight && styles.summaryAmountHighlight,
      ]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

export default RecordPaymentScreen;

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
  loadingText: { color: "#cbd5e1", fontSize: 14 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 14,
  },
  emptyText: {
    color: "#cbd5e1",
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
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
    fontSize: 26,
    fontWeight: "800",
  },
  pageSubtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 2,
  },
  invoiceCard: {
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    backgroundColor: "rgba(15,23,42,0.57)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.14)",
  },
  invoiceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  invoiceIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
  },
  invoiceTextBlock: { flex: 1 },
  invoiceNumber: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
  },
  customerName: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 3,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  openBadge: { backgroundColor: "rgba(245,158,11,0.17)" },
  paidBadge: { backgroundColor: "rgba(34,197,94,0.17)" },
  cancelledBadge: { backgroundColor: "rgba(239,68,68,0.17)" },
  statusText: {
    color: "#e2e8f0",
    fontSize: 9,
    fontWeight: "900",
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.15)",
    marginVertical: 14,
  },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryValue: { flex: 1 },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  summaryAmount: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 5,
  },
  summaryAmountHighlight: { color: "#fcd34d" },
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    padding: 14,
    borderRadius: 15,
    marginBottom: 14,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.17)",
  },
  noticeTextBlock: { flex: 1 },
  noticeTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
  noticeText: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  section: {
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    backgroundColor: "rgba(15,23,42,0.54)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.14)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
  },
  fullBalanceButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(59,130,246,0.16)",
    marginBottom: 12,
  },
  fullBalanceText: {
    color: "#bfdbfe",
    fontSize: 10,
    fontWeight: "800",
  },
  label: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 8,
  },
  moneyInputWrapper: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.64)",
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.3)",
    overflow: "hidden",
  },
  currencySymbol: {
    color: "#bfdbfe",
    fontSize: 22,
    fontWeight: "800",
    paddingLeft: 14,
  },
  moneyInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 23,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  balancePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(30,41,59,0.6)",
  },
  balancePreviewLabel: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "700",
  },
  balancePreviewHint: {
    color: "#94a3b8",
    fontSize: 9,
    marginTop: 3,
  },
  balancePreviewValue: {
    color: "#fcd34d",
    fontSize: 16,
    fontWeight: "900",
  },
  balanceCleared: { color: "#86efac" },
  dateInput: {
    minHeight: 48,
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
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  methodButton: {
    width: "48.5%",
    minHeight: 46,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 10,
    backgroundColor: "rgba(15,23,42,0.48)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  methodButtonSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  methodText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
  },
  methodTextSelected: { color: "#0f172a" },
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
  multilineInput: { minHeight: 94 },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 13,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: "rgba(59,130,246,0.12)",
  },
  infoText: {
    flex: 1,
    color: "#bfdbfe",
    fontSize: 11,
    lineHeight: 17,
  },
  bottomActions: { flexDirection: "row", gap: 10 },
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
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
  disabledButton: { opacity: 0.65 },
});
