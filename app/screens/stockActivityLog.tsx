import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useFocusEffect, useRouter } from "expo-router";
import {
  getStockMovements,
  StockMovement,
  StockMovementType,
} from "@/lib/storage";
import ScreenWrapper from "@/components/ScreenWrapper";

let DateTimePickerModal: any = null;

if (Platform.OS !== "web") {
  try {
    DateTimePickerModal =
      require("react-native-modal-datetime-picker").default;
  } catch {
    console.warn("DateTimePickerModal not available");
  }
}

type DateRangeFilter = "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

export default function StockActivityLogScreen() {
  const router = useRouter();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | StockMovementType>("ALL");

  const [dateRange, setDateRange] = useState<DateRangeFilter>("ALL");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const loadMovements = async () => {
    const data = await getStockMovements();

    const sorted = [...data].sort(
      (a, b) =>
        new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

    setMovements(sorted);
  };

  useFocusEffect(
    useCallback(() => {
      loadMovements();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMovements();
    setRefreshing(false);
  };

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

  const endOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const weekRange = (ref: Date) => {
    const weekStartsOn = 1;
    const d = new Date(ref);
    const diff = (d.getDay() - weekStartsOn + 7) % 7;

    const from = startOfDay(
      new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff)
    );

    const to = endOfDay(
      new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6)
    );

    return { from, to };
  };

  const monthRange = (ref: Date) => {
    const from = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);

    const to = new Date(
      ref.getFullYear(),
      ref.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return { from, to };
  };

  const getDateRange = () => {
    const today = new Date();

    if (dateRange === "DAILY") {
      return { from: startOfDay(today), to: endOfDay(today) };
    }

    if (dateRange === "WEEKLY") {
      return weekRange(today);
    }

    if (dateRange === "MONTHLY") {
      return monthRange(today);
    }

    if (dateRange === "CUSTOM") {
      return {
        from: startOfDay(startDate),
        to: endOfDay(endDate),
      };
    }

    return { from: null, to: null };
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const productOptions = useMemo(() => {
    const uniqueProducts = Array.from(
      new Set(movements.map((m) => m.itemName).filter(Boolean))
    ).sort();

    return [
      { label: "All Products", value: "ALL" },
      ...uniqueProducts.map((name) => ({
        label: name,
        value: name,
      })),
    ];
  }, [movements]);

  const sourceOptions = useMemo(() => {
    const uniqueSources = Array.from(
      new Set(movements.map((m) => m.sourceLabel).filter(Boolean))
    ).sort();

    return [
      { label: "All Sources", value: "ALL" },
      ...uniqueSources.map((source) => ({
        label: source,
        value: source,
      })),
    ];
  }, [movements]);

  const filteredMovements = useMemo(() => {
    const { from, to } = getDateRange();

    return movements.filter((m) => {
      const movementDate = new Date(m.dateTime);

      const matchesProduct =
        selectedProduct === "ALL" || m.itemName === selectedProduct;

      const matchesSource =
        selectedSource === "ALL" || m.sourceLabel === selectedSource;

      const matchesType = typeFilter === "ALL" || m.type === typeFilter;

      const matchesDate =
        !from || !to
          ? true
          : movementDate.getTime() >= from.getTime() &&
            movementDate.getTime() <= to.getTime();

      return matchesProduct && matchesSource && matchesType && matchesDate;
    });
  }, [
    movements,
    selectedProduct,
    selectedSource,
    typeFilter,
    dateRange,
    startDate,
    endDate,
  ]);

  const totals = useMemo(() => {
    const totalIn = filteredMovements
      .filter((m) => m.type === "IN")
      .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

    const totalOut = filteredMovements
      .filter((m) => m.type === "OUT")
      .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

    const noChange = filteredMovements
      .filter((m) => m.type === "NO_CHANGE")
      .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

    return {
      totalIn,
      totalOut,
      noChange,
      netMovement: totalIn - totalOut,
    };
  }, [filteredMovements]);

  const clearFilters = () => {
    setSelectedProduct("ALL");
    setSelectedSource("ALL");
    setTypeFilter("ALL");
    setDateRange("ALL");
    setStartDate(new Date());
    setEndDate(new Date());
  };

  return (
    <ScreenWrapper scroll backgroundColor="#f4f6f9">
      <View style={styles.container}>
        <Text style={styles.title}>Stock Activity Log</Text>

        <View style={styles.filterBox}>
          <Text style={styles.filterLabel}>Product</Text>
          <Dropdown
            style={styles.dropdown}
            data={productOptions}
            labelField="label"
            valueField="value"
            placeholder="Select product"
            search
            searchPlaceholder="Search product..."
            value={selectedProduct}
            onChange={(item) => setSelectedProduct(item.value)}
          />

          {/* <Text style={styles.filterLabel}>Source</Text>
          <Dropdown
            style={styles.dropdown}
            data={sourceOptions}
            labelField="label"
            valueField="value"
            placeholder="Select source"
            search
            searchPlaceholder="Search source..."
            value={selectedSource}
            onChange={(item) => setSelectedSource(item.value)}
          /> */}

          <Text style={styles.filterLabel}>Movement Type</Text>
          <View style={styles.typeRow}>
            {["ALL", "IN", "OUT", "NO_CHANGE"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  typeFilter === type && styles.activeTypeButton,
                ]}
                onPress={() => setTypeFilter(type as "ALL" | StockMovementType)}
              >
                <Text
                  style={[
                    styles.typeText,
                    typeFilter === type && styles.activeTypeText,
                  ]}
                >
                  {type === "NO_CHANGE" ? "NO CHANGE" : type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Date Range</Text>
          <View style={styles.typeRow}>
            {["ALL", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.typeButton,
                  dateRange === range && styles.activeTypeButton,
                ]}
                onPress={() => setDateRange(range as DateRangeFilter)}
              >
                <Text
                  style={[
                    styles.typeText,
                    dateRange === range && styles.activeTypeText,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {dateRange === "CUSTOM" && DateTimePickerModal && (
            <View style={styles.dateRangeRow}>
              <TouchableOpacity
                style={styles.dateColumn}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateBtn}>Start</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateColumn}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateBtn}>End</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={showStartPicker}
                mode="date"
                onConfirm={(date: Date) => {
                  setShowStartPicker(false);
                  setStartDate(date);
                }}
                onCancel={() => setShowStartPicker(false)}
              />

              <DateTimePickerModal
                isVisible={showEndPicker}
                mode="date"
                onConfirm={(date: Date) => {
                  setShowEndPicker(false);
                  setEndDate(date);
                }}
                onCancel={() => setShowEndPicker(false)}
              />
            </View>
          )}

          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total IN</Text>
            <Text style={styles.inValue}>{totals.totalIn}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total OUT</Text>
            <Text style={styles.outValue}>{totals.totalOut}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={styles.summaryValue}>{totals.netMovement}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>No Change</Text>
            <Text style={styles.noChangeValue}>{totals.noChange}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.dateCell]}>Date/Time</Text>
              <Text style={[styles.headerCell, styles.itemCell]}>Item</Text>
              <Text style={[styles.headerCell, styles.typeCell]}>IN/OUT</Text>
              <Text style={[styles.headerCell, styles.qtyCell]}>Qty</Text>
              <Text style={[styles.headerCell, styles.sourceCell]}>Source</Text>
              <Text style={[styles.headerCell, styles.balanceCell]}>
                Balance
              </Text>
            </View>

            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {filteredMovements.map((m) => (
                <View key={m.id} style={styles.row}>
                  <Text style={[styles.cell, styles.dateCell]}>
                    {new Date(m.dateTime).toLocaleString("en-GB")}
                  </Text>

                  <Text style={[styles.cell, styles.itemCell]} numberOfLines={2}>
                    {m.itemName}
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.typeCell,
                      m.type === "IN"
                        ? styles.inText
                        : m.type === "OUT"
                        ? styles.outText
                        : styles.noChangeText,
                    ]}
                  >
                    {m.type === "NO_CHANGE" ? "NO CHANGE" : m.type}
                  </Text>

                  <Text style={[styles.cell, styles.qtyCell]}>{m.quantity}</Text>

                  <Text style={[styles.cell, styles.sourceCell]} numberOfLines={2}>
                    {m.sourceLabel}
                  </Text>

                  <Text style={[styles.cell, styles.balanceCell]}>
                    {m.balanceAfter}
                  </Text>
                </View>
              ))}

              {filteredMovements.length === 0 && (
                <Text style={styles.emptyText}>No stock movement found.</Text>
              )}
            </ScrollView>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1b263b",
    textAlign: "center",
    marginBottom: 12,
  },
  filterBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1b263b",
    marginBottom: 6,
    marginTop: 6,
  },
  dropdown: {
    height: 48,
    backgroundColor: "#f1f3f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  typeButton: {
    backgroundColor: "#e9ecef",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeTypeButton: {
    backgroundColor: "#1b263b",
  },
  typeText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 12,
  },
  activeTypeText: {
    color: "#fff",
  },
  dateRangeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  dateColumn: {
    flex: 1,
    backgroundColor: "#f1f3f5",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  dateBtn: {
    color: "#2563eb",
    fontWeight: "800",
  },
  dateValue: {
    color: "#111827",
    marginTop: 4,
    fontWeight: "600",
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: "#dfe6e9",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  clearButtonText: {
    fontWeight: "700",
    color: "#1b263b",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#555",
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1b263b",
  },
  inValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  outValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#c62828",
  },
  noChangeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f57c00",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#1b263b",
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerCell: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    paddingHorizontal: 8,
  },
  cell: {
    color: "#222",
    fontSize: 13,
    paddingHorizontal: 8,
  },
  dateCell: {
    width: 165,
  },
  itemCell: {
    width: 145,
    fontWeight: "600",
  },
  typeCell: {
    width: 105,
  },
  qtyCell: {
    width: 70,
  },
  sourceCell: {
    width: 240,
  },
  balanceCell: {
    width: 95,
  },
  inText: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
  outText: {
    color: "#c62828",
    fontWeight: "bold",
  },
  noChangeText: {
    color: "#f57c00",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#666",
    fontSize: 15,
  },
  backButton: {
    backgroundColor: "#1b263b",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontWeight: "bold",
  },
});