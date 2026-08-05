import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getReturnStockItems,
  getStockItems,
  StockItem,
} from "@/lib/storage";
import {
  getStockInBySupplier,
  migrateLegacySupplierStockInOnce,
  updateSupplierStockInStatus,
} from "@/lib/supplierStockInStorage";
import {
  deactivateSupplier,
  getSupplierById,
  reactivateSupplier,
} from "@/lib/supplierStorage";
import { getSupplierDisplayName, type Supplier } from "@/types/supplier";
import { SupplierStockIn } from "@/types/supplierStockIn";
import { useFocusEffect } from "@react-navigation/native";
import {
  router,
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
  FlatList,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


type Summary = {
  stockItems: number;
  stockQuantity: number;
  currentStockValue: number;

  outstandingPayment: number;
  unpaidDeliveries: number;
  paidDeliveries: number;
  totalPurchases: number;

  waiting: number;
  withSupplier: number;
  credited: number;
  replaced: number;
  rejected: number;
  closed: number;
};

const emptySummary: Summary = {
  stockItems: 0,
  stockQuantity: 0,
  currentStockValue: 0,

  outstandingPayment: 0,
  unpaidDeliveries: 0,
  paidDeliveries: 0,
  totalPurchases: 0,

  waiting: 0,
  withSupplier: 0,
  credited: 0,
  replaced: 0,
  rejected: 0,
  closed: 0,
};

const SupplierViewScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [supplier, setSupplier] = useState<Supplier | null>(
    null,
  );
  const [supplierStock, setSupplierStock] = useState<
    StockItem[]
  >([]);
  const [stockInRecords, setStockInRecords] = useState<
    SupplierStockIn[]
  >([]);
  const [summary, setSummary] =
    useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [stockModalVisible, setStockModalVisible] =
    useState(false);
  const [historyModalVisible, setHistoryModalVisible] =
    useState(false);

  const belongsToSupplier = useCallback(
    (
      item: {
        supplierId?: string;
        supplierName?: string;
      },
      supplierRecord: Supplier,
    ) => {
      if (
        item.supplierId &&
        item.supplierId === supplierRecord.id
      ) {
        return true;
      }

      return (
        !item.supplierId &&
        Boolean(item.supplierName) &&
        item.supplierName?.trim().toLowerCase() ===
          getSupplierDisplayName(supplierRecord).trim().toLowerCase()
      );
    },
    [],
  );

  const load = useCallback(async () => {
    if (!id) {
      Alert.alert("Error", "Supplier ID is missing.");
      router.back();
      return;
    }

    try {
      setLoading(true);

      // Safe one-time opening-balance migration for old stock records.
      await migrateLegacySupplierStockInOnce();

      const record = await getSupplierById(id);

      if (!record) {
        Alert.alert(
          "Not Found",
          "Supplier could not be found.",
        );
        router.back();
        return;
      }

      const [stock, returns, purchases] = await Promise.all([
        getStockItems(),
        getReturnStockItems(),
        getStockInBySupplier(
          record.id,
          record.companyName,
        ),
      ]);

      const matchingStock = stock.filter((item) =>
        belongsToSupplier(item, record),
      );
      const matchingReturns = returns.filter((item) =>
        belongsToSupplier(item, record),
      );

      const currentStockValue = matchingStock.reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0) *
            Number(item.costPrice || 0),
        0,
      );

      const unpaidPurchases = purchases.filter(
        (purchase) =>
          purchase.paymentStatus === "unpaid",
      );

      setSupplier(record);
      setSupplierStock(matchingStock);
      setStockInRecords(purchases);

      setSummary({
        stockItems: matchingStock.length,
        stockQuantity: matchingStock.reduce(
          (total, item) =>
            total + Number(item.quantity || 0),
          0,
        ),
        currentStockValue,

        outstandingPayment: unpaidPurchases.reduce(
          (total, purchase) =>
            total + Number(purchase.totalCost || 0),
          0,
        ),
        unpaidDeliveries: unpaidPurchases.length,
        paidDeliveries: purchases.filter(
          (purchase) =>
            purchase.paymentStatus === "paid",
        ).length,
        totalPurchases: purchases.reduce(
          (total, purchase) =>
            total + Number(purchase.totalCost || 0),
          0,
        ),

        waiting: matchingReturns.filter(
          (item) => item.status === "pending_return",
        ).length,
        withSupplier: matchingReturns.filter(
          (item) =>
            item.status === "returned_to_supplier" ||
            item.status === "accepted",
        ).length,
        credited: matchingReturns.filter(
          (item) => item.status === "credited",
        ).length,
        replaced: matchingReturns.filter(
          (item) => item.status === "replaced",
        ).length,
        rejected: matchingReturns.filter(
          (item) => item.status === "rejected",
        ).length,
        closed: matchingReturns.filter(
          (item) => item.status === "closed",
        ).length,
      });
    } catch (error: any) {
      console.error("Could not load supplier:", error);
      Alert.alert(
        "Error",
        error.message || "Could not load supplier.",
      );
    } finally {
      setLoading(false);
    }
  }, [belongsToSupplier, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const money = useCallback(
    (value: number) =>
      `${supplier?.currencySymbol || "£"}${Number(
        value || 0,
      ).toFixed(2)}`,
    [supplier?.currencySymbol],
  );

  const address = useMemo(() => {
    if (!supplier) return "";

    return [
      supplier.addressLine1,
      supplier.addressLine2,
      supplier.city,
      supplier.county,
      supplier.postcode,
      supplier.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [supplier]);

  const markPaid = (record: SupplierStockIn) => {
    Alert.alert(
      "Mark Delivery Paid?",
      `${record.itemName}: ${money(record.totalCost)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Paid",
          onPress: async () => {
            try {
              await updateSupplierStockInStatus(
                record.id,
                "paid",
              );
              await load();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message ||
                  "Could not update payment status.",
              );
            }
          },
        },
      ],
    );
  };

  const toggleStatus = () => {
    if (!supplier) return;

    Alert.alert(
      supplier.isActive
        ? "Deactivate Supplier?"
        : "Reactivate Supplier?",
      "The supplier record, stock and payment history will be retained.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: supplier.isActive
            ? "Deactivate"
            : "Reactivate",
          style: supplier.isActive
            ? "destructive"
            : "default",
          onPress: async () => {
            if (supplier.isActive) {
              await deactivateSupplier(supplier.id);
            } else {
              await reactivateSupplier(supplier.id);
            }
            await load();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loading}>
            Loading supplier...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!supplier) return null;

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {supplier.companyName}
            </Text>
            <Text style={styles.subtitle}>
              Supplier stock and payment account
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/screens/suppliers/edit",
                params: { id: supplier.id },
              })
            }
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.outstandingCard}>
          <Text style={styles.outstandingLabel}>
            Outstanding Payment
          </Text>
          <Text style={styles.outstandingHelp}>
            Total of all unpaid stock deliveries
          </Text>
          <Text
            style={[
              styles.outstandingValue,
              summary.outstandingPayment > 0
                ? styles.amountDue
                : styles.amountPaid,
            ]}
          >
            {money(summary.outstandingPayment)}
          </Text>
          <Text style={styles.outstandingDetail}>
            {summary.unpaidDeliveries} unpaid{" "}
            {summary.unpaidDeliveries === 1
              ? "delivery"
              : "deliveries"}
          </Text>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setHistoryModalVisible(true)}
          >
            <Text style={styles.historyButtonText}>
              View Purchase & Payment History
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <Card
            label="Current products"
            value={String(summary.stockItems)}
            detail={`${summary.stockQuantity} units`}
          />
          <Card
            label="Current stock value"
            value={money(summary.currentStockValue)}
          />
          <Card
            label="Total purchases"
            value={money(summary.totalPurchases)}
          />
          <Card
            label="Paid deliveries"
            value={String(summary.paidDeliveries)}
          />
        </View>

        <Section title="Current stock">
          {supplierStock.length > 0 ? (
            <>
              <Row
                label="Products"
                value={String(summary.stockItems)}
              />
              <Row
                label="Quantity"
                value={`${summary.stockQuantity} units`}
              />
              <Row
                label="Stock value"
                value={money(summary.currentStockValue)}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setStockModalVisible(true)}
              >
                <Text style={styles.primaryButtonText}>
                  View Current Stock
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.emptyText}>
              No current stock is linked to this supplier.
            </Text>
          )}
        </Section>

        <Section title="Contact details">
          <Row
            label="Contact"
            value={supplier.contactName || "Not added"}
          />
          <Row
            label="Supplier code"
            value={supplier.supplierCode || "Not added"}
          />
          <Row
            label="Phone"
            value={supplier.phone || "Not added"}
          />
          <Row
            label="Email"
            value={supplier.email || "Not added"}
          />
          <Row
            label="Website"
            value={supplier.website || "Not added"}
          />
          <Row
            label="Address"
            value={address || "Not added"}
          />

          <View style={styles.quickRow}>
            {supplier.phone ? (
              <TouchableOpacity
                style={styles.quick}
                onPress={() =>
                  Linking.openURL(`tel:${supplier.phone}`)
                }
              >
                <Text style={styles.quickText}>Call</Text>
              </TouchableOpacity>
            ) : null}

            {supplier.email ? (
              <TouchableOpacity
                style={styles.quick}
                onPress={() =>
                  Linking.openURL(`mailto:${supplier.email}`)
                }
              >
                <Text style={styles.quickText}>Email</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Section>

        <Section title="Return history">
          <Row
            label="Waiting to return"
            value={String(summary.waiting)}
          />
          <Row
            label="With supplier"
            value={String(summary.withSupplier)}
          />
          <Row
            label="Credited"
            value={String(summary.credited)}
          />
          <Row
            label="Replaced"
            value={String(summary.replaced)}
          />
          <Row
            label="Rejected"
            value={String(summary.rejected)}
          />
          <Row
            label="Closed"
            value={String(summary.closed)}
          />
        </Section>

        {supplier.notes ? (
          <Section title="Notes">
            <Text style={styles.notes}>{supplier.notes}</Text>
          </Section>
        ) : null}

        <TouchableOpacity
          style={[
            styles.statusButton,
            supplier.isActive
              ? styles.deactivateButton
              : styles.reactivateButton,
          ]}
          onPress={toggleStatus}
        >
          <Text style={styles.statusButtonText}>
            {supplier.isActive
              ? "Deactivate Supplier"
              : "Reactivate Supplier"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={stockModalVisible}
        animationType="slide"
        onRequestClose={() => setStockModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <ModalHeader
            title="Current Stock"
            subtitle={getSupplierDisplayName(supplier)}
            onClose={() => setStockModalVisible(false)}
          />

          <FlatList
            data={supplierStock}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No current stock.
              </Text>
            }
            renderItem={({ item }) => {
              const quantity = Number(item.quantity || 0);
              const unitCost = Number(item.costPrice || 0);

              return (
                <View style={styles.listCard}>
                  <Text style={styles.listTitle}>
                    {item.name}
                  </Text>
                  <Text style={styles.listSub}>
                    {item.category || "Uncategorised"}
                  </Text>
                  <View style={styles.detailRow}>
                    <SmallDetail
                      label="Quantity"
                      value={`${quantity} ${item.unit || "pcs"}`}
                    />
                    <SmallDetail
                      label="Cost"
                      value={money(unitCost)}
                    />
                    <SmallDetail
                      label="Value"
                      value={money(quantity * unitCost)}
                    />
                  </View>
                </View>
              );
            }}
          />
        </SafeAreaView>
      </Modal>

      <Modal
        visible={historyModalVisible}
        animationType="slide"
        onRequestClose={() =>
          setHistoryModalVisible(false)
        }
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <ModalHeader
            title="Purchase History"
            subtitle={getSupplierDisplayName(supplier)}
            onClose={() => setHistoryModalVisible(false)}
          />

          <View style={styles.historySummary}>
            <Card
              label="Outstanding"
              value={money(summary.outstandingPayment)}
            />
            <Card
              label="Unpaid deliveries"
              value={String(summary.unpaidDeliveries)}
            />
          </View>

          <FlatList
            data={stockInRecords}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No stock deliveries recorded.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.listCard}>
                <View style={styles.purchaseHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>
                      {item.itemName}
                    </Text>
                    <Text style={styles.listSub}>
                      {new Date(item.date).toLocaleDateString(
                        "en-GB",
                      )}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.paymentBadge,
                      item.paymentStatus === "paid"
                        ? styles.paidBadge
                        : styles.unpaidBadge,
                    ]}
                  >
                    <Text style={styles.paymentBadgeText}>
                      {item.paymentStatus === "paid"
                        ? "Paid"
                        : "Unpaid"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.purchaseLine}>
                  {item.quantity} {item.unit || "pcs"} ×{" "}
                  {money(item.unitCost)}
                </Text>
                <Text style={styles.purchaseTotal}>
                  {money(item.totalCost)}
                </Text>

                {item.note ? (
                  <Text style={styles.purchaseNote}>
                    {item.note}
                  </Text>
                ) : null}

                {item.paymentStatus === "unpaid" ? (
                  <TouchableOpacity
                    style={styles.markPaidButton}
                    onPress={() => markPaid(item)}
                  >
                    <Text style={styles.markPaidText}>
                      Mark Paid
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </ScreenWrapper>
  );
};

const Card = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    {detail ? (
      <Text style={styles.cardDetail}>{detail}</Text>
    ) : null}
  </View>
);

const Row = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const Section = ({
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

const SmallDetail = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.smallDetail}>
    <Text style={styles.smallLabel}>{label}</Text>
    <Text style={styles.smallValue}>{value}</Text>
  </View>
);

const ModalHeader = ({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) => (
  <View style={styles.modalHeader}>
    <View style={{ flex: 1 }}>
      <Text style={styles.modalTitle}>{title}</Text>
      <Text style={styles.modalSubtitle}>{subtitle}</Text>
    </View>
    <TouchableOpacity
      style={styles.closeButton}
      onPress={onClose}
    >
      <Text style={styles.closeText}>Close</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  content: {
    backgroundColor: "#f8fafc",
    padding: 18,
    paddingBottom: 140,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerContent: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: { color: "#6b7280", marginTop: 4 },
  editButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 17,
    paddingVertical: 11,
  },
  editText: { color: "#fff", fontWeight: "900" },
  outstandingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 17,
    marginBottom: 14,
  },
  outstandingLabel: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
  },
  outstandingHelp: { color: "#6b7280", marginTop: 3 },
  outstandingValue: {
    fontSize: 30,
    fontWeight: "900",
    marginTop: 14,
  },
  amountDue: { color: "#dc2626" },
  amountPaid: { color: "#16a34a" },
  outstandingDetail: {
    color: "#6b7280",
    marginTop: 3,
    fontWeight: "600",
  },
  historyButton: {
    backgroundColor: "#111827",
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  historyButtonText: { color: "#fff", fontWeight: "900" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  card: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
  },
  cardLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "800",
  },
  cardValue: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },
  cardDetail: { color: "#6b7280", marginTop: 2, fontSize: 12 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 7,
  },
  rowLabel: { color: "#6b7280", fontWeight: "800", flex: 1 },
  rowValue: {
    color: "#111827",
    fontWeight: "700",
    flex: 1.4,
    textAlign: "right",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  primaryButtonText: { color: "#fff", fontWeight: "900" },
  quickRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  quick: {
    flex: 1,
    backgroundColor: "#e0e7ff",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  quickText: { color: "#1d4ed8", fontWeight: "900" },
  notes: { color: "#4b5563", lineHeight: 21 },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 24,
  },
  statusButton: {
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
  },
  deactivateButton: { backgroundColor: "#dc2626" },
  reactivateButton: { backgroundColor: "#16a34a" },
  statusButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { color: "#6b7280", marginTop: 10 },
  modalSafeArea: { flex: 1, backgroundColor: "#f8fafc" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
  },
  modalSubtitle: { color: "#6b7280", marginTop: 2 },
  closeButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  closeText: { color: "#111827", fontWeight: "900" },
  historySummary: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
  listContent: { padding: 16, paddingBottom: 100 },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 15,
    marginBottom: 12,
  },
  listTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
  },
  listSub: { color: "#6b7280", marginTop: 3 },
  detailRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  smallDetail: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
  },
  smallLabel: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "800",
  },
  smallValue: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  purchaseHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  paymentBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  paidBadge: { backgroundColor: "#16a34a" },
  unpaidBadge: { backgroundColor: "#dc2626" },
  paymentBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  purchaseLine: { color: "#4b5563", marginTop: 12 },
  purchaseTotal: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },
  purchaseNote: {
    color: "#6b7280",
    marginTop: 5,
    fontStyle: "italic",
  },
  markPaidButton: {
    backgroundColor: "#16a34a",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 13,
  },
  markPaidText: { color: "#fff", fontWeight: "900" },
});

export default SupplierViewScreen;
