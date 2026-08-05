import ScreenWrapper from "@/components/ScreenWrapper";
import {
  archiveCustomer,
  getCustomerById,
  restoreCustomer,
} from "@/lib/customerStorage";
import { getInvoices } from "@/lib/invoiceStorage";
import {
  CUSTOMER_PAYMENT_TERM_LABELS,
  getCustomerDisplayName,
  type Customer,
} from "@/types/customer";
import type { Invoice } from "@/types/invoice";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CustomerDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] =
    useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const [loadedCustomer, allInvoices] =
        await Promise.all([
          getCustomerById(id),
          getInvoices(),
        ]);

      setCustomer(loadedCustomer);

      setInvoices(
        allInvoices.filter(
          (invoice) =>
            invoice.customerId === loadedCustomer?.id
        )
      );
    } catch (error) {
      console.error("Customer details failed:", error);
      Alert.alert(
        "Unable to load customer",
        "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const summary = useMemo(() => {
    return invoices.reduce(
      (result, invoice) => ({
        invoiceCount: result.invoiceCount + 1,
        totalInvoiced:
          result.totalInvoiced +
          Number(invoice.grandTotal || 0),
        totalPaid:
          result.totalPaid +
          Number(invoice.amountPaid || 0),
        outstanding:
          result.outstanding +
          Number(invoice.balanceDue || 0),
      }),
      {
        invoiceCount: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        outstanding: 0,
      }
    );
  }, [invoices]);

  const formatMoney = (amount: number) => {
    try {
      return new Intl.NumberFormat(
        customer?.locale || "en-GB",
        {
          style: "currency",
          currency: customer?.currencyCode || "GBP",
        }
      ).format(amount);
    } catch {
      return `${customer?.currencySymbol || "£"}${amount.toFixed(
        2
      )}`;
    }
  };

  const handleArchive = () => {
    if (!customer) return;

    const action = customer.isActive
      ? "Archive"
      : "Restore";

    Alert.alert(
      `${action} customer`,
      customer.isActive
        ? "The customer will remain linked to previous invoices."
        : "The customer will appear in the active customer list again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          onPress: async () => {
            if (customer.isActive) {
              await archiveCustomer(customer.id);
            } else {
              await restoreCustomer(customer.id);
            }

            await loadData();
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
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color="#bfdbfe"
            />
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  if (!customer) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <View style={styles.loading}>
            <Text style={styles.emptyText}>
              Customer not found.
            </Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  const displayName = getCustomerDisplayName(customer);

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false }}
      />

      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={21}
                    color="#e2e8f0"
                  />
                </TouchableOpacity>

                <View style={styles.headerText}>
                  <Text style={styles.title}>
                    {displayName}
                  </Text>
                  <Text style={styles.subtitle}>
                    {customer.customerCode ||
                      "Customer details"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname:
                        "/screens/customers/edit",
                      params: { id: customer.id },
                    })
                  }
                  style={styles.iconButton}
                >
                  <Ionicons
                    name="create-outline"
                    size={21}
                    color="#bfdbfe"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.statusRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {customer.type === "business"
                      ? "Business"
                      : "Individual"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    customer.isActive
                      ? styles.activeBadge
                      : styles.archivedBadge,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {customer.isActive
                      ? "Active"
                      : "Archived"}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryGrid}>
                <SummaryCard
                  label="Total invoiced"
                  value={formatMoney(summary.totalInvoiced)}
                />
                <SummaryCard
                  label="Total paid"
                  value={formatMoney(summary.totalPaid)}
                />
                <SummaryCard
                  label="Outstanding"
                  value={formatMoney(summary.outstanding)}
                />
                <SummaryCard
                  label="Invoices"
                  value={String(summary.invoiceCount)}
                />
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={() =>
                    router.push({
                      pathname:
                        "/screens/invoices/create",
                      params: {
                        customerId: customer.id,
                      },
                    })
                  }
                >
                  <Ionicons
                    name="document-text-outline"
                    size={19}
                    color="#0f172a"
                  />
                  <Text style={styles.primaryActionText}>
                    Create invoice
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={() =>
                    router.push({
                      pathname:
                        "/screens/customers/edit",
                      params: { id: customer.id },
                    })
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color="#dbeafe"
                  />
                  <Text style={styles.secondaryActionText}>
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>

              <InfoSection title="Contact">
                <InfoRow
                  label="Contact name"
                  value={customer.contactName}
                />
                <InfoRow
                  label="Email"
                  value={customer.email}
                />
                <InfoRow
                  label="Phone"
                  value={customer.phone}
                />
              </InfoSection>

              <InfoSection title="Business details">
                <InfoRow
                  label="Company"
                  value={customer.companyName}
                />
                <InfoRow
                  label="Tax number"
                  value={customer.taxNumber}
                />
                <InfoRow
                  label="Payment terms"
                  value={
                    CUSTOMER_PAYMENT_TERM_LABELS[
                      customer.paymentTerms
                    ]
                  }
                />
              </InfoSection>

              <InfoSection title="Invoices">
                {invoices.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No invoices for this customer yet.
                  </Text>
                ) : (
                  invoices.slice(0, 10).map((invoice) => (
                    <TouchableOpacity
                      key={invoice.id}
                      style={styles.invoiceRow}
                      onPress={() =>
                        router.push({
                          pathname:
                            "/screens/invoices/view",
                          params: { id: invoice.id },
                        })
                      }
                    >
                      <View style={styles.invoiceText}>
                        <Text style={styles.invoiceNumber}>
                          {invoice.invoiceNumber}
                        </Text>
                        <Text style={styles.invoiceStatus}>
                          {invoice.status.replace(
                            "_",
                            " "
                          )}
                        </Text>
                      </View>

                      <Text style={styles.invoiceAmount}>
                        {formatMoney(invoice.grandTotal)}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </InfoSection>

              <TouchableOpacity
                onPress={handleArchive}
                style={styles.archiveButton}
              >
                <Ionicons
                  name={
                    customer.isActive
                      ? "archive-outline"
                      : "refresh-outline"
                  }
                  size={18}
                  color={
                    customer.isActive
                      ? "#fca5a5"
                      : "#86efac"
                  }
                />

                <Text
                  style={[
                    styles.archiveText,
                    !customer.isActive &&
                      styles.restoreText,
                  ]}
                >
                  {customer.isActive
                    ? "Archive customer"
                    : "Restore customer"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </ScreenWrapper>
    </>
  );
};

const SummaryCard = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const InfoSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>
      {value?.trim() || "—"}
    </Text>
  </View>
);

export default CustomerDetailsScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 45,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 13,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  headerText: { flex: 1 },
  title: {
    color: "#f8fafc",
    fontSize: 23,
    fontWeight: "900",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: "rgba(59,130,246,0.18)",
  },
  activeBadge: {
    backgroundColor: "rgba(34,197,94,0.16)",
  },
  archivedBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  badgeText: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "800",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 14,
  },
  summaryCard: {
    width: "48%",
    minHeight: 82,
    borderRadius: 15,
    padding: 13,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.14)",
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 7,
  },
  actionRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 14,
  },
  primaryAction: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#dbeafe",
  },
  primaryActionText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryAction: {
    minWidth: 95,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(15,23,42,0.52)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.28)",
  },
  secondaryActionText: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "800",
  },
  section: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "rgba(15,23,42,0.54)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.13)",
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.12)",
  },
  infoLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  infoValue: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.13)",
  },
  invoiceText: { flex: 1 },
  invoiceNumber: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "800",
  },
  invoiceStatus: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 3,
    textTransform: "capitalize",
  },
  invoiceAmount: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "900",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  archiveButton: {
    minHeight: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
    backgroundColor: "rgba(239,68,68,0.1)",
  },
  archiveText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "800",
  },
  restoreText: {
    color: "#86efac",
  },
});