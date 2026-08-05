// app/screens/stock/stockOutHistory.tsx

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
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  SlideInRight,
  SlideOutRight,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type MainFilter = "All" | "Sales" | "Consumed";
type PaymentFilter = "All" | "Paid" | "Unpaid";
type SortOrder = "asc" | "desc";
type RecordType = "quick_sale" | "bulk_sale" | "consumed";

type HistoryRecord = {
  id: string;
  recordType: RecordType;
  salesId?: string;
  batchId?: string;
  movementId?: string;
  stockItemId?: string;
  title: string;
  date: string;
  timestamp: number;
  paid?: boolean;
  total: number;
  totalItems: number;
  balanceAfter?: number;
  unit?: string;
  sourceLabel?: string;
  note?: string;
  items?: any[];
  rawMovement?: any;
};

type StockOutCardProps = {
  record: HistoryRecord;
  money: (amount: number) => string;
  locale: string;
  onView: (record: HistoryRecord) => void;
  onDeleteSale: (record: HistoryRecord) => void;
  onTogglePaid: (record: HistoryRecord) => void;
  onReverseConsumed: (record: HistoryRecord) => void;
  onOpenActions: (record: HistoryRecord) => void;
};

const parseTimestamp = (value?: string): number => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getGroupId = (sale: any): string =>
  String(
    sale.batchId ||
      sale.salesId ||
      sale.saleId ||
      sale.id ||
      sale.$id ||
      "",
  );

const StockOutCard = ({
  record,
  money,
  locale,
  onView,
  onDeleteSale,
  onTogglePaid,
  onReverseConsumed,
  onOpenActions,
}: StockOutCardProps) => {
  const translateX = useSharedValue(0);
  const isConsumed = record.recordType === "consumed";
  const isBulk = record.recordType === "bulk_sale";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value < -100) {
        if (isConsumed) runOnJS(onView)(record);
        else runOnJS(onDeleteSale)(record);
      } else if (translateX.value > 100) {
        if (isConsumed) runOnJS(onReverseConsumed)(record);
        else runOnJS(onTogglePaid)(record);
      }
      translateX.value = withTiming(0);
    });

  const tapGesture = Gesture.Tap()
    .maxDistance(10)
    .onEnd((_event, success) => {
      if (success) runOnJS(onView)(record);
    });

  const typeLabel = isConsumed
    ? "Consumed"
    : isBulk
      ? "Bulk Sale"
      : "Quick Sale";

  return (
    <GestureDetector gesture={Gesture.Race(panGesture, tapGesture)}>
      <Animated.View
        entering={SlideInRight}
        exiting={SlideOutRight}
        style={[styles.cardContainer, animatedStyle]}
      >
        <View style={styles.swipeBackground}>
          <View
            style={[
              styles.bgLeft,
              isConsumed && styles.restoreBackground,
            ]}
          >
            <Text style={styles.bgText}>
              {isConsumed
                ? "↩ Restore Stock"
                : record.paid
                  ? "Mark Unpaid"
                  : "Mark Paid"}
            </Text>
          </View>

          <View
            style={[
              styles.bgRight,
              isConsumed && styles.viewBackground,
            ]}
          >
            <Text style={styles.bgText}>
              {isConsumed ? "View Details" : "🗑 Delete"}
            </Text>
          </View>
        </View>

        <View style={[styles.card, isConsumed && styles.consumedCard]}>
          <View style={styles.cardTop}>
            <View style={styles.cardTitleArea}>
              <Text style={styles.recordTitle} numberOfLines={2}>
                {record.title}
              </Text>

              <View style={styles.typeRow}>
                <Text
                  style={[
                    styles.typeBadge,
                    isConsumed
                      ? styles.consumedBadge
                      : isBulk
                        ? styles.bulkBadge
                        : styles.quickBadge,
                  ]}
                >
                  {typeLabel}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              {!isConsumed ? (
                <Text
                  style={[
                    styles.paymentBadge,
                    {
                      backgroundColor: record.paid
                        ? "#4CAF50"
                        : "#F44336",
                    },
                  ]}
                >
                  {record.paid ? "Paid" : "Unpaid"}
                </Text>
              ) : null}

              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => onOpenActions(record)}
                accessibilityRole="button"
                accessibilityLabel="Open stock out actions"
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardBottom}>
            <Text style={styles.date}>
              {record.timestamp
                ? new Date(record.timestamp).toLocaleDateString(locale)
                : "Date unavailable"}
            </Text>

            <Text style={styles.itemCount}>
              {record.totalItems} {record.unit || "units"}
            </Text>

            <Text style={styles.total}>
              {isConsumed ? "Internal Use" : money(record.total)}
            </Text>
          </View>

          {isConsumed && typeof record.balanceAfter === "number" ? (
            <Text style={styles.balanceText}>
              Balance after: {record.balanceAfter}{" "}
              {record.unit || "units"}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const StockOutHistoryScreen: React.FC = () => {
  const router = useRouter();
  const { companyProfile } = useCompanyProfile();

  const locale = companyProfile?.locale || "en-GB";
  const money = (amount: number) =>
    formatCurrencyFromProfile(
      amount,
      companyProfile ?? undefined,
    );

  const [allRecords, setAllRecords] = useState<HistoryRecord[]>([]);
  const [mainFilter, setMainFilter] = useState<MainFilter>("All");
  const [paymentFilter, setPaymentFilter] =
    useState<PaymentFilter>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const indicatorAnim = useSharedValue(0);
  const mainFilters: MainFilter[] = ["All", "Sales", "Consumed"];

  const groupSales = useCallback((sales: any[]): HistoryRecord[] => {
    const groups: Record<string, any> = {};

    for (const sale of sales || []) {
      const groupId = getGroupId(sale);
      if (!groupId) continue;

      if (!groups[groupId]) {
        const isBulk =
          sale.type === "bulk_sale" || Boolean(sale.batchId);

        const date =
          sale.date ||
          sale.dateTime ||
          sale.createdAt ||
          sale.$createdAt ||
          "";

        groups[groupId] = {
          id: groupId,
          recordType: isBulk ? "bulk_sale" : "quick_sale",
          salesId: sale.salesId || (!isBulk ? groupId : undefined),
          batchId: sale.batchId || (isBulk ? groupId : undefined),
          title:
            sale.buyerName ||
            (isBulk ? "Bulk Sale" : "Quick Sale"),
          paid: sale.paid ?? true,
          date,
          timestamp: parseTimestamp(date),
          items: [],
        };
      }

      groups[groupId].items.push(sale);
    }

    return Object.values(groups).map((group: any) => ({
      ...group,
      total: group.items.reduce(
        (sum: number, item: any) =>
          sum +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0,
      ),
      totalItems: group.items.reduce(
        (sum: number, item: any) =>
          sum + Number(item.quantity || 0),
        0,
      ),
    }));
  }, []);

  const mapConsumedMovements = useCallback(
    (movements: any[]): HistoryRecord[] =>
      (movements || [])
        .filter(
          (movement) =>
            movement.type === "OUT" &&
            movement.source === "STOCK_USED",
        )
        .map((movement, index) => {
          const date =
            movement.date ||
            movement.dateTime ||
            movement.createdAt ||
            movement.$createdAt ||
            "";

          const movementId = String(
            movement.id ||
              movement.$id ||
              movement.movementId ||
              movement.referenceId ||
              `consumed-${movement.stockItemId}-${date}-${index}`,
          );

          return {
            id: movementId,
            recordType: "consumed" as const,
            movementId,
            stockItemId: movement.stockItemId,
            title:
              movement.itemName ||
              movement.name ||
              "Consumed Stock",
            date,
            timestamp: parseTimestamp(date),
            total: 0,
            totalItems: Number(movement.quantity || 0),
            balanceAfter:
              movement.balanceAfter === undefined
                ? undefined
                : Number(movement.balanceAfter),
            unit: movement.unit || "units",
            sourceLabel:
              movement.sourceLabel || "Consumed in-house",
            note: movement.note,
            rawMovement: movement,
          };
        }),
    [],
  );

  const loadRecords = useCallback(async () => {
    try {
      setRefreshing(true);

      const [sales, movements] = await Promise.all([
        getSaleItems(),
        getStockMovements(),
      ]);

      setAllRecords([
        ...groupSales(sales || []),
        ...mapConsumedMovements(movements || []),
      ]);
    } catch (error) {
      console.error("Failed to load stock out history:", error);
      Alert.alert("Error", "Could not load stock out history.");
    } finally {
      setRefreshing(false);
    }
  }, [groupSales, mapConsumedMovements]);

  useFocusEffect(
    useCallback(() => {
      void loadRecords();
    }, [loadRecords]),
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    let filtered = allRecords.filter((record) => {
      const dateText = record.timestamp
        ? new Date(record.timestamp)
            .toLocaleDateString(locale)
            .toLowerCase()
        : "";

      const typeText =
        record.recordType === "consumed"
          ? "consumed internal use"
          : record.recordType === "bulk_sale"
            ? "bulk sale"
            : "quick sale";

      return (
        record.title.toLowerCase().includes(normalizedQuery) ||
        dateText.includes(normalizedQuery) ||
        typeText.includes(normalizedQuery)
      );
    });

    if (mainFilter === "Sales") {
      filtered = filtered.filter(
        (record) => record.recordType !== "consumed",
      );
    } else if (mainFilter === "Consumed") {
      filtered = filtered.filter(
        (record) => record.recordType === "consumed",
      );
    }

    if (paymentFilter === "Paid") {
      filtered = filtered.filter(
        (record) =>
          record.recordType !== "consumed" &&
          record.paid === true,
      );
    } else if (paymentFilter === "Unpaid") {
      filtered = filtered.filter(
        (record) =>
          record.recordType !== "consumed" &&
          record.paid === false,
      );
    }

    return [...filtered].sort((a, b) =>
      sortOrder === "asc"
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp,
    );
  }, [
    allRecords,
    locale,
    mainFilter,
    paymentFilter,
    searchQuery,
    sortOrder,
  ]);

  const summary = useMemo(
    () => ({
      saleCount: allRecords.filter(
        (record) => record.recordType !== "consumed",
      ).length,
      consumedCount: allRecords.filter(
        (record) => record.recordType === "consumed",
      ).length,
    }),
    [allRecords],
  );

  const handleMainFilter = (
    index: number,
    filter: MainFilter,
  ) => {
    setMainFilter(filter);

    if (filter === "Consumed") {
      setPaymentFilter("All");
    }

    indicatorAnim.value = withTiming(
      index * (100 / mainFilters.length),
    );
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    width: `${100 / mainFilters.length}%`,
    left: `${indicatorAnim.value}%`,
  }));

  const handleView = (record: HistoryRecord) => {
    router.push({
      pathname: "/screens/stock/viewStockOut",
      params:
        record.recordType === "consumed"
          ? {
              type: "consumed",
              movementId: record.movementId || record.id,
            }
          : record.recordType === "bulk_sale"
            ? {
                type: "bulk_sale",
                batchId: record.batchId || record.id,
              }
            : {
                type: "quick_sale",
                salesId: record.salesId || record.id,
              },
    });
  };

  const handleEdit = (record: HistoryRecord) => {
    if (record.recordType === "consumed") {
      Alert.alert(
        "Not Editable",
        "Restore this consumed record and create a new one instead.",
      );
      return;
    }

    if (record.recordType === "bulk_sale") {
      Alert.alert(
        "Bulk Sale Editing",
        "Bulk sales cannot currently be edited. Delete this sale to restore the stock, then record it again.",
      );
      return;
    }

    router.push({
      pathname: "/screens/sales/editSale",
      params: {
        type: "quick_sale",
        salesId: record.salesId || record.id,
      },
    });
  };

  const handleTogglePaid = async (record: HistoryRecord) => {
    if (record.recordType === "consumed") return;

    try {
      const sales = await getSaleItems();
      const targetGroupId =
        record.batchId || record.salesId || record.id;

      await saveAllSales(
        sales.map((sale: any) =>
          getGroupId(sale) === String(targetGroupId)
            ? {
                ...sale,
                paid: !record.paid,
                synced: false,
                syncedAt: "",
              }
            : sale,
        ),
      );

      await loadRecords();
    } catch (error) {
      console.error("Failed to update payment status:", error);
      Alert.alert("Error", "Could not update payment status.");
    }
  };

  const deleteSale = async (record: HistoryRecord) => {
    const sales = await getSaleItems();
    const targetGroupId =
      record.batchId || record.salesId || record.id;

    const matched = sales.filter(
      (sale: any) => getGroupId(sale) === String(targetGroupId),
    );

    if (matched.length === 0) {
      Alert.alert("Not Found", "This sale no longer exists.");
      return;
    }

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
        referenceId: String(targetGroupId),
        referenceType: "SALE",
        note: `${
          record.recordType === "bulk_sale"
            ? "Bulk sale"
            : "Quick sale"
        } deleted from stock out history`,
      });
    }

    await saveAllSales(
      sales.filter(
        (sale: any) =>
          getGroupId(sale) !== String(targetGroupId),
      ),
    );

    Alert.alert("Deleted", "Sale deleted and stock restored.");
    await loadRecords();
  };

  const confirmDeleteSale = (record: HistoryRecord) => {
    Alert.alert(
      "Delete Stock Out",
      `Delete this ${
        record.recordType === "bulk_sale"
          ? "bulk sale"
          : "quick sale"
      }? Stock will be restored.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteSale(record),
        },
      ],
    );
  };

  const reverseConsumed = async (record: HistoryRecord) => {
    if (
      record.recordType !== "consumed" ||
      !record.stockItemId
    ) {
      return;
    }

    const movement = record.rawMovement;
    const originalMovementId = String(
      movement?.id ||
        movement?.$id ||
        movement?.movementId ||
        movement?.referenceId ||
        record.movementId ||
        record.id,
    );

    const alreadyReversed = (await getStockMovements()).some(
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
      `Return ${record.totalItems} ${
        record.unit || "units"
      } of ${record.title} to stock?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            try {
              const stock = await getStockItem(record.stockItemId!);

              if (!stock) {
                Alert.alert(
                  "Error",
                  "The related stock item no longer exists.",
                );
                return;
              }

              const restoredQuantity = Number(
                record.totalItems || 0,
              );
              const restoredBalance =
                Number(stock.quantity || 0) +
                restoredQuantity;

              await updateStockQuantity(
                record.stockItemId!,
                restoredBalance,
              );

              await saveStockMovement({
                stockItemId: record.stockItemId!,
                itemName: record.title,
                type: "IN",
                quantity: restoredQuantity,
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
              );

              await loadRecords();
            } catch (error) {
              console.error(
                "Failed to reverse consumed stock:",
                error,
              );
              Alert.alert(
                "Error",
                "Could not restore the consumed stock.",
              );
            }
          },
        },
      ],
    );
  };

  const openActions = (record: HistoryRecord) => {
    if (record.recordType === "consumed") {
      Alert.alert("Consumed Stock Actions", record.title, [
        {
          text: "View Details",
          onPress: () => handleView(record),
        },
        {
          text: "Restore Stock",
          onPress: () => void reverseConsumed(record),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);

      return;
    }

    if (record.recordType === "bulk_sale") {
      Alert.alert("Bulk Sale Actions", record.title, [
        {
          text: "View Details",
          onPress: () => handleView(record),
        },
        {
          text: record.paid
            ? "Mark Unpaid"
            : "Mark Paid",
          onPress: () =>
            void handleTogglePaid(record),
        },
        {
          text: "Delete & Restore Stock",
          style: "destructive",
          onPress: () =>
            confirmDeleteSale(record),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);

      return;
    }

    Alert.alert("Quick Sale Actions", record.title, [
      {
        text: "View Details",
        onPress: () => handleView(record),
      },
      {
        text: "Edit Sale",
        onPress: () => handleEdit(record),
      },
      {
        text: record.paid
          ? "Mark Unpaid"
          : "Mark Paid",
        onPress: () =>
          void handleTogglePaid(record),
      },
      {
        text: "Delete & Restore Stock",
        style: "destructive",
        onPress: () =>
          confirmDeleteSale(record),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScreenWrapper backgroundColor="#0d1b2a">
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <View style={styles.headerArea}>
            <Text style={styles.screenTitle}>
              Stock Out History
            </Text>

            <Text style={styles.screenSubtitle}>
              Quick sales, bulk sales and stock consumed in-house.
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>
                  {summary.saleCount}
                </Text>
                <Text style={styles.summaryLabel}>Sales</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>
                  {summary.consumedCount}
                </Text>
                <Text style={styles.summaryLabel}>
                  Consumed
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.actionTouchable}
                onPress={() =>
                  router.push("/screens/sales/record")
                }
              >
                <LinearGradient
                  colors={["#2563eb", "#1d4ed8"]}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionIcon}>⚡</Text>
                  <Text style={styles.actionText}>
                    Quick Sale
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.actionTouchable}
                onPress={() =>
                  router.push("/screens/BulkSaleScreen")
                }
              >
                <LinearGradient
                  colors={["#0f766e", "#14b8a6"]}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionIcon}>📦</Text>
                  <Text style={styles.actionText}>Bulk Sale</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterArea}>
            <TextInput
              placeholder="Search buyer, product, date or type"
              placeholderTextColor="#b8c1cc"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <View style={styles.toggleContainer}>
              {mainFilters.map((filter, index) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() =>
                    handleMainFilter(index, filter)
                  }
                  style={styles.toggleButton}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mainFilter === filter
                        ? styles.toggleTextActive
                        : styles.toggleTextInactive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}

              <Animated.View
                style={[
                  styles.toggleIndicator,
                  indicatorStyle,
                ]}
              />
            </View>

            <View style={styles.dropdownRow}>
              <Dropdown
                style={[styles.dropdown, styles.dropdownHalf]}
                containerStyle={styles.dropdownMenu}
                selectedTextStyle={styles.dropdownText}
                itemTextStyle={styles.dropdownItemText}
                placeholderStyle={styles.dropdownText}
                data={[
                  { label: "All Payments", value: "All" },
                  { label: "Paid", value: "Paid" },
                  { label: "Unpaid", value: "Unpaid" },
                ]}
                labelField="label"
                valueField="value"
                value={paymentFilter}
                disable={mainFilter === "Consumed"}
                onChange={(item) =>
                  setPaymentFilter(item.value as PaymentFilter)
                }
              />

              <Dropdown
                style={[styles.dropdown, styles.dropdownHalf]}
                containerStyle={styles.dropdownMenu}
                selectedTextStyle={styles.dropdownText}
                itemTextStyle={styles.dropdownItemText}
                placeholderStyle={styles.dropdownText}
                data={[
                  { label: "Newest", value: "desc" },
                  { label: "Oldest", value: "asc" },
                ]}
                labelField="label"
                valueField="value"
                value={sortOrder}
                onChange={(item) =>
                  setSortOrder(item.value as SortOrder)
                }
              />
            </View>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadRecords()}
                tintColor="#ffffff"
              />
            }
          >
            {filteredRecords.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>
                  No stock out records found
                </Text>
                <Text style={styles.emptyText}>
                  Try changing the search or filter.
                </Text>
              </View>
            ) : (
              filteredRecords.map((record) => (
                <StockOutCard
                  key={`${record.recordType}-${record.id}`}
                  record={record}
                  money={money}
                  locale={locale}
                  onView={handleView}
                  onDeleteSale={confirmDeleteSale}
                  onTogglePaid={handleTogglePaid}
                  onReverseConsumed={reverseConsumed}
                  onOpenActions={openActions}
                />
              ))
            )}
          </ScrollView>
        </LinearGradient>
      </ScreenWrapper>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1 },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  screenTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  screenSubtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  summaryNumber: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  actionTouchable: { flex: 1 },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: { fontSize: 22, marginBottom: 3 },
  actionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  filterArea: {
    backgroundColor: "rgba(20,30,50,0.96)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 10,
  },
  searchInput: {
    height: 43,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    paddingHorizontal: 14,
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.13)",
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  toggleText: {
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },
  toggleTextActive: { color: "#ffffff" },
  toggleTextInactive: { color: "#aeb8c6" },
  toggleIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: "#FFD700",
  },
  dropdownRow: { flexDirection: "row", gap: 10 },
  dropdown: {
    height: 42,
    borderRadius: 18,
    backgroundColor: "rgba(240,233,233,0.95)",
    paddingHorizontal: 12,
  },
  dropdownHalf: { flex: 1 },
  dropdownMenu: {
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownText: {
    color: "#263238",
    fontSize: 13,
    fontWeight: "700",
  },
  dropdownItemText: { color: "#263238", fontSize: 13 },
  list: { flex: 1 },
  scrollContainer: { padding: 18, paddingBottom: 100 },
  cardContainer: {
    position: "relative",
    marginBottom: 16,
  },
  swipeBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
  },
  bgLeft: {
    flex: 1,
    height: "100%",
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    paddingLeft: 22,
  },
  bgRight: {
    flex: 1,
    height: "100%",
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 22,
  },
  restoreBackground: { backgroundColor: "#ea580c" },
  viewBackground: { backgroundColor: "#475569" },
  bgText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#45556e",
    borderRadius: 16,
    padding: 16,
  },
  consumedCard: {
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.55)",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  cardTitleArea: { flex: 1, paddingRight: 10 },
  cardActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  recordTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  typeBadge: {
    color: "#ffffff",
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 11,
  },
  quickBadge: { backgroundColor: "#2563eb" },
  bulkBadge: { backgroundColor: "#0f766e" },
  consumedBadge: { backgroundColor: "#ea580c" },
  paymentBadge: {
    color: "#ffffff",
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 11,
  },
  moreButton: {
    width: 34,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  date: { color: "#dddddd", fontSize: 13, flex: 1 },
  itemCount: {
    color: "#ffffff",
    fontSize: 13,
    flex: 1,
    textAlign: "center",
    fontWeight: "700",
  },
  total: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
    textAlign: "right",
  },
  balanceText: {
    color: "#fed7aa",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 45,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: "#cbd5e1",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
});

export default StockOutHistoryScreen;
