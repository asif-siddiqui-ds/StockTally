// app/screens/invoices/paymentHistory.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import {
  addInvoicePayment,
  deleteInvoicePayment,
  getInvoiceById,
  getInvoicePayments,
} from "@/lib/invoiceStorage";
import type {
  Invoice,
  InvoicePayment,
  InvoicePaymentMethod,
} from "@/types/invoice";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  { value: "cheque", label: "Cheque", icon: "document-text-outline" },
  { value: "online", label: "Online", icon: "globe-outline" },
  { value: "other", label: "Other", icon: "ellipsis-horizontal-outline" },
];

const formatDate = (value?: string): string => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value?: string): string => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMethod = (method: InvoicePaymentMethod) =>
  PAYMENT_METHODS.find((item) => item.value === method) ||
  PAYMENT_METHODS[PAYMENT_METHODS.length - 1];

const PaymentHistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<InvoicePaymentMethod>("bank_transfer");
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  useEffect(() => {
    loadData();
  }, [invoiceId]);

  const sortedPayments = useMemo(
    () =>
      [...payments].sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() -
          new Date(a.paymentDate).getTime()
      ),
    [payments]
  );

  const loadData = async () => {
    if (!invoiceId) {
      Alert.alert("Invoice not found", "No invoice ID was provided.");
      router.back();
      return;
    }

    try {
      setLoading(true);

      const invoiceRecord = await getInvoiceById(invoiceId);

      if (!invoiceRecord) {
        Alert.alert(
          "Invoice not found",
          "This invoice could not be loaded."
        );
        router.back();
        return;
      }

      const paymentRecords = await getInvoicePayments(invoiceRecord.id);
      const refreshedInvoice = await getInvoiceById(invoiceRecord.id);

      setInvoice(
        refreshedInvoice
          ? { ...refreshedInvoice, payments: paymentRecords }
          : { ...invoiceRecord, payments: paymentRecords }
      );
      setPayments(paymentRecords);
    } catch (error) {
      console.error("❌ Failed to load payment history:", error);
      Alert.alert(
        "Unable to load payments",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const money = (amount: number): string => {
    if (!invoice) return `£${Number(amount || 0).toFixed(2)}`;

    try {
      return new Intl.NumberFormat(invoice.locale || "en-GB", {
        style: "currency",
        currency: invoice.currencyCode || "GBP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(amount || 0));
    } catch {
      return `${invoice.currencySymbol || "£"}${Number(amount || 0).toFixed(2)}`;
    }
  };

  const resetPaymentForm = () => {
    setPaymentAmount("");
    setPaymentMethod("bank_transfer");
    setPaymentDate(new Date());
    setPaymentReference("");
    setPaymentNotes("");
    setShowPaymentDatePicker(false);
  };

  const openPaymentModal = () => {
    if (!invoice || invoice.balanceDue <= 0) return;

    setPaymentAmount(Number(invoice.balanceDue || 0).toFixed(2));
    setPaymentMethod("bank_transfer");
    setPaymentDate(new Date());
    setPaymentReference("");
    setPaymentNotes("");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    if (processing) return;
    setShowPaymentModal(false);
    resetPaymentForm();
  };

  const handleAddPayment = async () => {
    if (!invoice) return;

    const amount = Number(paymentAmount.replace(",", "."));

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(
        "Invalid amount",
        "Enter a payment amount greater than zero."
      );
      return;
    }

    if (amount > Number(invoice.balanceDue || 0) + 0.001) {
      Alert.alert(
        "Payment too high",
        `The payment cannot exceed the outstanding balance of ${money(
          invoice.balanceDue
        )}.`
      );
      return;
    }

    try {
      setProcessing(true);

      const updated = await addInvoicePayment({
        invoiceId: invoice.id,
        amount,
        method: paymentMethod,
        paymentDate: paymentDate.toISOString(),
        reference: paymentReference.trim() || undefined,
        notes: paymentNotes.trim() || undefined,
      });

      const paymentRecords = await getInvoicePayments(invoice.id);

      setInvoice({ ...updated, payments: paymentRecords });
      setPayments(paymentRecords);
      setShowPaymentModal(false);
      resetPaymentForm();

      Alert.alert(
        "Payment recorded",
        `${money(amount)} has been added successfully.`
      );
    } catch (error) {
      console.error("❌ Failed to add payment:", error);
      Alert.alert(
        "Unable to record payment",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePayment = (payment: InvoicePayment) => {
    if (!invoice) return;

    Alert.alert(
      "Delete payment?",
      `Remove the ${money(payment.amount)} payment recorded on ${formatDate(
        payment.paymentDate
      )}? The invoice totals and status will be recalculated.`,
      [
        { text: "Keep payment", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessing(true);

              const updated = await deleteInvoicePayment(
                invoice.id,
                payment.id
              );
              const paymentRecords = await getInvoicePayments(invoice.id);

              setInvoice({ ...updated, payments: paymentRecords });
              setPayments(paymentRecords);
            } catch (error) {
              console.error("❌ Failed to delete payment:", error);
              Alert.alert(
                "Unable to delete payment",
                error instanceof Error
                  ? error.message
                  : "Please try again."
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
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
              Loading payment history...
            </Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  if (!invoice) return null;

  const canAddPayment =
    invoice.status !== "cancelled" &&
    invoice.status !== "draft" &&
    Number(invoice.balanceDue || 0) > 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <View
            style={[
              styles.container,
              {
                paddingTop: Math.max(insets.top + 6, 14),
                paddingBottom: Math.max(insets.bottom + 8, 12),
              },
            ]}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <Ionicons name="arrow-back" size={22} color="#e2e8f0" />
              </TouchableOpacity>

              <View style={styles.headerText}>
                <Text style={styles.title}>Payment history</Text>
                <Text style={styles.subtitle}>
                  {invoice.invoiceNumber} · {invoice.customerName}
                </Text>
              </View>

              <TouchableOpacity
                disabled={!canAddPayment || processing}
                onPress={openPaymentModal}
                style={[
                  styles.headerAddButton,
                  !canAddPayment && styles.disabledButton,
                ]}
              >
                <Ionicons
                  name={
                    invoice.balanceDue <= 0
                      ? "checkmark-circle-outline"
                      : "add"
                  }
                  size={22}
                  color={canAddPayment ? "#0f172a" : "#94a3b8"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Invoice total</Text>
                  <Text style={styles.summaryValue}>
                    {money(invoice.grandTotal)}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Amount paid</Text>
                  <Text style={styles.summaryPaid}>
                    {money(invoice.amountPaid)}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.balanceRow}>
                <View>
                  <Text style={styles.balanceLabel}>Outstanding balance</Text>
                  <Text
                    style={[
                      styles.balanceValue,
                      invoice.balanceDue <= 0 && styles.balanceSettled,
                    ]}
                  >
                    {money(invoice.balanceDue)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    invoice.balanceDue <= 0 && styles.statusBadgePaid,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      invoice.balanceDue <= 0 && styles.statusTextPaid,
                    ]}
                  >
                    {invoice.status.replace(/_/g, " ").toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All payments</Text>
              <Text style={styles.sectionCount}>
                {payments.length} {payments.length === 1 ? "payment" : "payments"}
              </Text>
            </View>

            {sortedPayments.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="receipt-outline"
                    size={34}
                    color="#bfdbfe"
                  />
                </View>
                <Text style={styles.emptyTitle}>No payments recorded</Text>
                <Text style={styles.emptyText}>
                  Add the first payment when the customer makes a full or
                  partial payment.
                </Text>

                {canAddPayment && (
                  <TouchableOpacity
                    onPress={openPaymentModal}
                    style={styles.emptyAddButton}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#0f172a"
                    />
                    <Text style={styles.emptyAddButtonText}>
                      Add first payment
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {sortedPayments.map((payment, index) => {
                  const method = getMethod(payment.method);

                  return (
                    <View key={payment.id} style={styles.paymentCard}>
                      <View style={styles.timelineColumn}>
                        <View style={styles.paymentIcon}>
                          <Ionicons
                            name={method.icon}
                            size={20}
                            color="#bfdbfe"
                          />
                        </View>

                        {index < sortedPayments.length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </View>

                      <View style={styles.paymentContent}>
                        <View style={styles.paymentTopRow}>
                          <View style={styles.paymentTitleBlock}>
                            <Text style={styles.paymentAmount}>
                              {money(payment.amount)}
                            </Text>
                            <Text style={styles.paymentMethod}>
                              {method.label}
                            </Text>
                          </View>

                          <TouchableOpacity
                            disabled={processing}
                            onPress={() => handleDeletePayment(payment)}
                            style={styles.deleteButton}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#fca5a5"
                            />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.dateRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#94a3b8"
                          />
                          <Text style={styles.paymentDate}>
                            {formatDate(payment.paymentDate)}
                            {formatTime(payment.paymentDate)
                              ? ` at ${formatTime(payment.paymentDate)}`
                              : ""}
                          </Text>
                        </View>

                        {!!payment.reference && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Reference</Text>
                            <Text
                              style={styles.detailValue}
                              selectable
                            >
                              {payment.reference}
                            </Text>
                          </View>
                        )}

                        {!!payment.notes && (
                          <View style={styles.notesBox}>
                            <Text style={styles.notesLabel}>Notes</Text>
                            <Text style={styles.notesText}>
                              {payment.notes}
                            </Text>
                          </View>
                        )}

                        <View style={styles.syncRow}>
                          <Ionicons
                            name={
                              payment.synced
                                ? "cloud-done-outline"
                                : "cloud-upload-outline"
                            }
                            size={13}
                            color={payment.synced ? "#86efac" : "#fcd34d"}
                          />
                          <Text
                            style={[
                              styles.syncText,
                              payment.synced
                                ? styles.syncTextDone
                                : styles.syncTextPending,
                            ]}
                          >
                            {payment.synced
                              ? "Synced"
                              : "Waiting to sync"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {canAddPayment && sortedPayments.length > 0 && (
              <TouchableOpacity
                disabled={processing}
                onPress={openPaymentModal}
                style={styles.floatingAddButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={21}
                  color="#0f172a"
                />
                <Text style={styles.floatingAddButtonText}>
                  Add another payment
                </Text>
              </TouchableOpacity>
            )}

            {processing && !showPaymentModal && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="small" color="#0f172a" />
                <Text style={styles.processingText}>Updating...</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </ScreenWrapper>

      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={closePaymentModal}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalDismissArea}
            onPress={closePaymentModal}
          />

          <View
            style={[
              styles.paymentModal,
              { paddingBottom: Math.max(insets.bottom + 18, 24) },
            ]}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add payment</Text>
                <Text style={styles.modalSubtitle}>
                  Outstanding balance: {money(invoice.balanceDue)}
                </Text>
              </View>

              <TouchableOpacity
                disabled={processing}
                onPress={closePaymentModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={22} color="#e2e8f0" />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.fieldLabel}>Amount</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencyPrefix}>
                  {invoice.currencySymbol || "£"}
                </Text>
                <TextInput
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  style={styles.amountInput}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#64748b"
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() =>
                    setPaymentAmount(
                      Number(invoice.balanceDue || 0).toFixed(2)
                    )
                  }
                  style={styles.fullBalanceButton}
                >
                  <Text style={styles.fullBalanceText}>Full balance</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Payment method</Text>
              <View style={styles.methodGrid}>
                {PAYMENT_METHODS.map((method) => {
                  const selected = paymentMethod === method.value;

                  return (
                    <TouchableOpacity
                      key={method.value}
                      activeOpacity={0.85}
                      onPress={() => setPaymentMethod(method.value)}
                      style={[
                        styles.methodButton,
                        selected && styles.methodButtonSelected,
                      ]}
                    >
                      <Ionicons
                        name={method.icon}
                        size={18}
                        color={selected ? "#0f172a" : "#cbd5e1"}
                      />
                      <Text
                        style={[
                          styles.methodButtonText,
                          selected && styles.methodButtonTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Payment date</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShowPaymentDatePicker(true)}
                style={styles.dateButton}
              >
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#bfdbfe"
                />
                <Text style={styles.dateButtonText}>
                  {formatDate(paymentDate.toISOString())}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#94a3b8"
                />
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Reference (optional)</Text>
              <TextInput
                value={paymentReference}
                onChangeText={setPaymentReference}
                style={styles.textInput}
                placeholder="Transaction or cheque reference"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput
                value={paymentNotes}
                onChangeText={setPaymentNotes}
                style={[styles.textInput, styles.notesInput]}
                placeholder="Add a note about this payment"
                placeholderTextColor="#64748b"
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={processing}
                onPress={handleAddPayment}
                style={[
                  styles.savePaymentButton,
                  processing && styles.disabledButton,
                ]}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#0f172a" />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#0f172a"
                  />
                )}
                <Text style={styles.savePaymentButtonText}>
                  {processing ? "Recording..." : "Record payment"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {DateTimePickerModal && (
        <DateTimePickerModal
          isVisible={showPaymentDatePicker}
          mode="date"
          date={paymentDate}
          maximumDate={new Date()}
          onConfirm={(date: Date) => {
            setPaymentDate(date);
            setShowPaymentDatePicker(false);
          }}
          onCancel={() => setShowPaymentDatePicker(false)}
        />
      )}
    </>
  );
};

export default PaymentHistoryScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.52)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  headerText: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 21,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 2,
  },
  headerAddButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
  },
  disabledButton: {
    opacity: 0.5,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
    backgroundColor: "rgba(15,23,42,0.54)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.14)",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 5,
  },
  summaryPaid: {
    color: "#86efac",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.18)",
    marginVertical: 14,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabel: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  balanceValue: {
    color: "#fcd34d",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 3,
  },
  balanceSettled: {
    color: "#86efac",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(245,158,11,0.16)",
    borderWidth: 1,
    borderColor: "rgba(252,211,77,0.24)",
  },
  statusBadgePaid: {
    backgroundColor: "rgba(34,197,94,0.16)",
    borderColor: "rgba(134,239,172,0.24)",
  },
  statusText: {
    color: "#fcd34d",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  statusTextPaid: {
    color: "#86efac",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
  },
  sectionCount: {
    color: "#94a3b8",
    fontSize: 11,
  },
  listContent: {
    paddingBottom: 90,
  },
  paymentCard: {
    flexDirection: "row",
  },
  timelineColumn: {
    width: 48,
    alignItems: "center",
  },
  paymentIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.18)",
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.2)",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    minHeight: 34,
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  paymentContent: {
    flex: 1,
    borderRadius: 16,
    padding: 13,
    marginBottom: 11,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.12)",
  },
  paymentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  paymentTitleBlock: {
    flex: 1,
  },
  paymentAmount: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
  },
  paymentMethod: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(127,29,29,0.24)",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  paymentDate: {
    color: "#94a3b8",
    fontSize: 11,
  },
  detailRow: {
    marginTop: 11,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "rgba(15,23,42,0.52)",
  },
  detailLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detailValue: {
    color: "#e2e8f0",
    fontSize: 12,
    marginTop: 4,
  },
  notesBox: {
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "rgba(59,130,246,0.1)",
  },
  notesLabel: {
    color: "#93c5fd",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  notesText: {
    color: "#dbeafe",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 11,
  },
  syncText: {
    fontSize: 9,
    fontWeight: "700",
  },
  syncTextDone: {
    color: "#86efac",
  },
  syncTextPending: {
    color: "#fcd34d",
  },
  emptyCard: {
    flex: 1,
    minHeight: 330,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "rgba(15,23,42,0.45)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.12)",
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 17,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },
  emptyAddButton: {
    minHeight: 46,
    borderRadius: 13,
    paddingHorizontal: 16,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#dbeafe",
  },
  emptyAddButtonText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800",
  },
  floatingAddButton: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 10,
    minHeight: 52,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#dbeafe",
  },
  floatingAddButtonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "800",
  },
  processingOverlay: {
    position: "absolute",
    right: 18,
    top: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#dbeafe",
  },
  processingText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,6,23,0.74)",
  },
  modalDismissArea: {
    flex: 1,
  },
  paymentModal: {
    maxHeight: "88%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: "#172337",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.14)",
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 13,
    backgroundColor: "rgba(148,163,184,0.48)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 3,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  fieldLabel: {
    color: "#dbeafe",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
    marginTop: 2,
  },
  amountInputWrapper: {
    minHeight: 54,
    borderRadius: 14,
    paddingHorizontal: 13,
    marginBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.62)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  currencyPrefix: {
    color: "#bfdbfe",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    paddingVertical: 12,
  },
  fullBalanceButton: {
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: "rgba(59,130,246,0.18)",
  },
  fullBalanceText: {
    color: "#bfdbfe",
    fontSize: 10,
    fontWeight: "800",
  },
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 17,
  },
  methodButton: {
    width: "31.5%",
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "rgba(15,23,42,0.5)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  methodButtonSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  methodButtonText: {
    flexShrink: 1,
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "800",
  },
  methodButtonTextSelected: {
    color: "#0f172a",
  },
  dateButton: {
    minHeight: 50,
    borderRadius: 13,
    paddingHorizontal: 13,
    marginBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(15,23,42,0.62)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  dateButtonText: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
  },
  textInput: {
    minHeight: 50,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 17,
    color: "#f8fafc",
    fontSize: 13,
    backgroundColor: "rgba(15,23,42,0.62)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  notesInput: {
    minHeight: 86,
  },
  savePaymentButton: {
    minHeight: 52,
    borderRadius: 14,
    marginTop: 2,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#dbeafe",
  },
  savePaymentButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
});
