// app/screens/stock/viewStockOut.tsx

import ScreenWrapper from "@/components/ScreenWrapper";
import { useCompanyProfile } from "@/context/CompanyProfileContext";
import { formatCurrencyFromProfile } from "@/lib/currency";
import {
  getSaleItems,
  getStockItem,
  getStockMovements,
  saveAllSales,
  saveStockMovement,
  updateStockQuantity,
} from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type RecordType = "quick_sale" | "bulk_sale" | "consumed";

type StockOutDetails = {
  type: RecordType;
  id: string;
  title: string;
  date: string;
  paid?: boolean;
  items: any[];
  movement?: any;
  total: number;
  totalItems: number;
  unit?: string;
  balanceAfter?: number;
  note?: string;
};

const firstParam = (
  value: string | string[] | undefined,
): string => (Array.isArray(value) ? value[0] || "" : value || "");

const getGroupId = (sale: any): string =>
  String(
    sale.batchId ||
      sale.salesId ||
      sale.saleId ||
      sale.id ||
      sale.$id ||
      "",
  );

const getMovementId = (movement: any): string =>
  String(
    movement.id ||
      movement.$id ||
      movement.movementId ||
      movement.referenceId ||
      "",
  );

const InfoRow = ({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text
      style={[
        styles.infoValue,
        strong && styles.infoValueStrong,
      ]}
    >
      {value}
    </Text>
  </View>
);

const ViewStockOutScreen: React.FC = () => {
  const params = useLocalSearchParams<{
    type?: string | string[];
    salesId?: string | string[];
    batchId?: string | string[];
    movementId?: string | string[];
  }>();

  const { companyProfile } = useCompanyProfile();
  const locale = companyProfile?.locale || "en-GB";
  const money = (amount: number) =>
    formatCurrencyFromProfile(
      amount,
      companyProfile ?? undefined,
    );

  const requestedType = firstParam(params.type) as RecordType;
  const requestedId =
    firstParam(params.movementId) ||
    firstParam(params.batchId) ||
    firstParam(params.salesId);

  const [details, setDetails] =
    useState<StockOutDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);

      if (!requestedId) {
        setDetails(null);
        return;
      }

      if (requestedType === "consumed") {
        const movements = await getStockMovements();

        const movement = movements.find(
          (item: any) =>
            getMovementId(item) === requestedId ||
            String(item.referenceId || "") === requestedId,
        );

        if (!movement) {
          setDetails(null);
          return;
        }

        setDetails({
          type: "consumed",
          id: requestedId,

          title:
            movement.itemName ||
            "Consumed Stock",

          date:
            movement.dateTime || "",

          items: [],
          movement,

          total: 0,

          totalItems: Number(
            movement.quantity || 0,
          ),

          unit: "units",

          balanceAfter:
            movement.balanceAfter === undefined
              ? undefined
              : Number(
                  movement.balanceAfter,
                ),

          note: movement.note,
        });

        return;
      }

      const sales = await getSaleItems();

      const matched = sales.filter(
        (sale: any) => getGroupId(sale) === requestedId,
      );

      if (matched.length === 0) {
        setDetails(null);
        return;
      }

      const first = matched[0];
      const isBulk =
        requestedType === "bulk_sale" ||
        first.type === "bulk_sale" ||
        Boolean(first.batchId);

      setDetails({
        type: isBulk ? "bulk_sale" : "quick_sale",
        id: requestedId,
        title:
          first.buyerName ||
          (isBulk ? "Bulk Sale" : "Quick Sale"),
        date:
          first.date || "",
        paid: matched.every((sale: any) => sale.paid !== false),
        items: matched,
        total: matched.reduce(
          (sum: number, item: any) =>
            sum +
            Number(item.price || 0) *
              Number(item.quantity || 0),
          0,
        ),
        totalItems: matched.reduce(
          (sum: number, item: any) =>
            sum + Number(item.quantity || 0),
          0,
        ),
      });
    } catch (error) {
      console.error("Failed to load stock out details:", error);
      Alert.alert("Error", "Could not load stock out details.");
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, [requestedId, requestedType]);

  useFocusEffect(
    useCallback(() => {
      void loadDetails();
    }, [loadDetails]),
  );

  const typeLabel = useMemo(() => {
    if (!details) return "";
    if (details.type === "consumed") return "Consumed In-House";
    return details.type === "bulk_sale"
      ? "Bulk Sale"
      : "Quick Sale";
  }, [details]);

  const handleEdit = () => {
    if (
      !details ||
      details.type !== "quick_sale"
    ) {
      return;
    }

    router.push({
      pathname: "/screens/sales/editSale",
      params: {
        type: "quick_sale",
        salesId: details.id,
      },
    });
  };

  const togglePaid = async () => {
    if (!details || details.type === "consumed") return;

    try {
      setWorking(true);

      const sales = await getSaleItems();

      await saveAllSales(
        sales.map((sale: any) =>
          getGroupId(sale) === details.id
            ? {
                ...sale,
                paid: !details.paid,
                synced: false,
                syncedAt: "",
              }
            : sale,
        ),
      );

      await loadDetails();
    } catch (error) {
      console.error("Failed to update payment status:", error);
      Alert.alert("Error", "Could not update payment status.");
    } finally {
      setWorking(false);
    }
  };

  const deleteSale = async () => {
    if (!details || details.type === "consumed") return;

    try {
      setWorking(true);

      const sales = await getSaleItems();
      const matched = sales.filter(
        (sale: any) => getGroupId(sale) === details.id,
      );

      for (const item of matched) {
        const stock = await getStockItem(item.stockItemId);
        if (!stock) continue;

        const restoredQuantity = Number(item.quantity || 0);
        const restoredBalance =
          Number(stock.quantity || 0) + restoredQuantity;

        await updateStockQuantity(
          item.stockItemId,
          restoredBalance,
        );

        await saveStockMovement({
          stockItemId: item.stockItemId,
          itemName: item.name || stock.name,
          type: "IN",
          quantity: restoredQuantity,
          source: "ADJUSTMENT",
          sourceLabel: "Sale deleted - stock restored",
          balanceAfter: restoredBalance,
          referenceId: details.id,
          referenceType: "SALE",
          note: `${
            details.type === "bulk_sale"
              ? "Bulk sale"
              : "Quick sale"
          } deleted from stock out details`,
        });
      }

      await saveAllSales(
        sales.filter(
          (sale: any) => getGroupId(sale) !== details.id,
        ),
      );

      Alert.alert(
        "Deleted",
        "Sale deleted and stock restored.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("Failed to delete sale:", error);
      Alert.alert("Error", "Could not delete the sale.");
    } finally {
      setWorking(false);
    }
  };

  const confirmDelete = () => {
    if (!details || details.type === "consumed") return;

    Alert.alert(
      "Delete Sale",
      "Delete this sale and restore all related stock?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteSale(),
        },
      ],
    );
  };

  const restoreConsumed = async () => {
    if (
      !details ||
      details.type !== "consumed" ||
      !details.movement?.stockItemId
    ) {
      return;
    }

    const originalMovementId = getMovementId(details.movement);

    const movements = await getStockMovements();
    const alreadyReversed = movements.some(
      (item: any) =>
        item.source === "ADJUSTMENT" &&
        item.sourceLabel ===
          "Consumed stock reversed - stock restored" &&
        String(item.referenceId) === originalMovementId,
    );

    if (alreadyReversed) {
      Alert.alert(
        "Already Restored",
        "This consumed record has already been reversed.",
      );
      return;
    }

    Alert.alert(
      "Restore Consumed Stock",
      `Return ${details.totalItems} ${
        details.unit || "units"
      } of ${details.title} to stock?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            try {
              setWorking(true);

              const stock = await getStockItem(
                details.movement.stockItemId,
              );

              if (!stock) {
                Alert.alert(
                  "Error",
                  "The related stock item no longer exists.",
                );
                return;
              }

              const restoredBalance =
                Number(stock.quantity || 0) +
                Number(details.totalItems || 0);

              await updateStockQuantity(
                details.movement.stockItemId,
                restoredBalance,
              );

              await saveStockMovement({
                stockItemId: details.movement.stockItemId,
                itemName: details.title,
                type: "IN",
                quantity: Number(details.totalItems || 0),
                source: "ADJUSTMENT",
                sourceLabel:
                  "Consumed stock reversed - stock restored",
                balanceAfter: restoredBalance,
                referenceId: originalMovementId,
                referenceType: "STOCK",
                note: "Reversal of consumed in-house stock",
              });

              Alert.alert(
                "Stock Restored",
                "Consumed stock was returned successfully.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ],
              );
            } catch (error) {
              console.error(
                "Failed to restore consumed stock:",
                error,
              );
              Alert.alert(
                "Error",
                "Could not restore the consumed stock.",
              );
            } finally {
              setWorking(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenWrapper backgroundColor="#0d1b2a">
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>
              Loading stock out details...
            </Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  if (!details) {
    return (
      <ScreenWrapper backgroundColor="#0d1b2a">
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <View style={styles.center}>
            <Text style={styles.notFoundIcon}>📭</Text>
            <Text style={styles.notFoundTitle}>
              Record not found
            </Text>
            <Text style={styles.notFoundText}>
              This stock out record may have been removed.
            </Text>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  const isConsumed = details.type === "consumed";

  return (
    <ScreenWrapper backgroundColor="#0d1b2a">
      <LinearGradient
        colors={["#0d1b2a", "#1b263b", "#415a77"]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#ffffff"
              />
            </TouchableOpacity>

            <View style={styles.headerTextArea}>
              <Text style={styles.title}>Stock Out Details</Text>
              <Text style={styles.subtitle}>{typeLabel}</Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.summaryTitleArea}>
                <Text style={styles.recordTitle}>
                  {details.title}
                </Text>

                <Text style={styles.dateText}>
                  {details.date
                    ? new Date(details.date).toLocaleString(locale)
                    : "Date unavailable"}
                </Text>
              </View>

              <Text
                style={[
                  styles.typeBadge,
                  isConsumed
                    ? styles.consumedBadge
                    : details.type === "bulk_sale"
                      ? styles.bulkBadge
                      : styles.quickBadge,
                ]}
              >
                {typeLabel}
              </Text>
            </View>

            {!isConsumed ? (
              <View style={styles.paymentRow}>
                <Text style={styles.infoLabel}>Payment</Text>
                <Text
                  style={[
                    styles.paymentBadge,
                    {
                      backgroundColor: details.paid
                        ? "#16a34a"
                        : "#dc2626",
                    },
                  ]}
                >
                  {details.paid ? "Paid" : "Unpaid"}
                </Text>
              </View>
            ) : null}
          </View>

          {isConsumed ? (
            <>
              <View style={styles.detailsCard}>
                <InfoRow
                  label="Quantity consumed"
                  value={`${details.totalItems} ${
                    details.unit || "units"
                  }`}
                />

                {typeof details.balanceAfter === "number" ? (
                  <InfoRow
                    label="Balance after"
                    value={`${details.balanceAfter} ${
                      details.unit || "units"
                    }`}
                  />
                ) : null}

                <InfoRow
                  label="Source"
                  value={
                    details.movement?.sourceLabel ||
                    "Consumed in-house"
                  }
                />

                {details.note ? (
                  <InfoRow label="Note" value={details.note} />
                ) : null}
              </View>

              <TouchableOpacity
                disabled={working}
                style={[
                  styles.primaryButton,
                  styles.restoreButton,
                  working && styles.disabledButton,
                ]}
                onPress={() => void restoreConsumed()}
              >
                <Ionicons
                  name="return-up-back"
                  size={20}
                  color="#ffffff"
                />
                <Text style={styles.primaryButtonText}>
                  Restore Stock
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Items</Text>

              {details.items.map((item, index) => {
                const quantity = Number(item.quantity || 0);
                const price = Number(item.price || 0);

                return (
                  <View
                    key={`${item.id || item.$id || index}`}
                    style={styles.itemCard}
                  >
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemName}>
                        {item.name || "Unnamed item"}
                      </Text>

                      <Text style={styles.itemTotal}>
                        {money(quantity * price)}
                      </Text>
                    </View>

                    <Text style={styles.itemMeta}>
                      {quantity} × {money(price)}
                    </Text>
                  </View>
                );
              })}

              <View style={styles.totalCard}>
                <InfoRow
                  label="Total quantity"
                  value={String(details.totalItems)}
                />
                <View style={styles.divider} />
                <InfoRow
                  label="Total"
                  value={money(details.total)}
                  strong
                />
              </View>

              <View style={styles.actionGrid}>
                {details.type === "quick_sale" ? (
                  <TouchableOpacity
                    disabled={working}
                    style={[
                      styles.actionButton,
                      styles.editButton,
                      working && styles.disabledButton,
                    ]}
                    onPress={handleEdit}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color="#ffffff"
                    />

                    <Text style={styles.actionButtonText}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  disabled={working}
                  style={[
                    styles.actionButton,
                    styles.paymentButton,
                    working && styles.disabledButton,
                  ]}
                  onPress={() => void togglePaid()}
                >
                  <Ionicons
                    name={
                      details.paid
                        ? "close-circle-outline"
                        : "checkmark-circle-outline"
                    }
                    size={20}
                    color="#ffffff"
                  />

                  <Text style={styles.actionButtonText}>
                    {details.paid
                      ? "Mark Unpaid"
                      : "Mark Paid"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                disabled={working}
                style={[
                  styles.primaryButton,
                  styles.deleteButton,
                  working && styles.disabledButton,
                ]}
                onPress={confirmDelete}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="#ffffff"
                />
                <Text style={styles.primaryButtonText}>
                  Delete Sale & Restore Stock
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 50,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: "#cbd5e1",
    marginTop: 12,
  },
  notFoundIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  notFoundTitle: {
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "900",
  },
  notFoundText: {
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 7,
    lineHeight: 21,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerTextArea: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: { width: 42 },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 3,
  },
  summaryCard: {
    backgroundColor: "rgba(15,23,42,0.68)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    padding: 16,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  summaryTitleArea: {
    flex: 1,
    paddingRight: 12,
  },
  recordTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
  },
  dateText: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 6,
  },
  typeBadge: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  quickBadge: { backgroundColor: "#2563eb" },
  bulkBadge: { backgroundColor: "#0f766e" },
  consumedBadge: { backgroundColor: "#ea580c" },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  paymentBadge: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    paddingRight: 10,
  },
  itemTotal: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  itemMeta: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 6,
  },
  detailsCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
  },
  totalCard: {
    backgroundColor: "rgba(15,23,42,0.72)",
    borderRadius: 16,
    padding: 15,
    marginTop: 6,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 7,
  },
  infoLabel: {
    flex: 1,
    color: "#94a3b8",
    fontSize: 13,
  },
  infoValue: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  infoValueStrong: {
    fontSize: 17,
    fontWeight: "900",
    color: "#86efac",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.11)",
    marginVertical: 4,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  editButton: { backgroundColor: "#2563eb" },
  paymentButton: { backgroundColor: "#0f766e" },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 13,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  deleteButton: { backgroundColor: "#b91c1c" },
  restoreButton: { backgroundColor: "#ea580c" },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  disabledButton: { opacity: 0.6 },
});

export default ViewStockOutScreen;
