// export default SaleList;
import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getSaleItems,
  getStockItem,
  saveAllSales,
  updateStockQuantity,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  SlideInRight,
  SlideOutRight,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";


const SaleCard = ({ sale, onView, onDelete, onToggle }: any) => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isBulk = sale.type === "bulk_sale" || sale.batchId;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      if (translateX.value < -100) runOnJS(onDelete)(sale);
      else if (translateX.value > 100) runOnJS(onToggle)(sale);
      translateX.value = withTiming(0);
    });

  const tapGesture = Gesture.Tap()
    .maxDistance(10)
    .onEnd((_e, success) => {
      if (success) runOnJS(onView)(sale);
    });

  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        entering={SlideInRight}
        exiting={SlideOutRight}
        style={[styles.cardContainer, animatedStyle]}
      >
        <View style={styles.swipeBackground}>
          <View style={styles.bgLeft}>
            <Text style={styles.bgText}>
              {sale.paid ? "Mark Unpaid" : "Mark Paid"}
            </Text>
          </View>
          <View style={styles.bgRight}>
            <Text style={styles.bgText}>🗑️ Delete</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.buyerName}>
                {sale.buyerName || "Stock Out"}
              </Text>

              <View style={styles.typeRow}>
                <Text style={[styles.typeBadge, isBulk ? styles.bulkBadge : styles.quickBadge]}>
                  {isBulk ? "Bulk Sale" : "Quick Sale"}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.badge,
                { backgroundColor: sale.paid ? "#4CAF50" : "#F44336" },
              ]}
            >
              {sale.paid ? "Paid" : "Unpaid"}
            </Text>
          </View>

          <View style={styles.cardBottom}>
            <Text style={styles.date}>
              {new Date(sale.date).toLocaleDateString("en-GB")}
            </Text>
            <Text style={styles.itemCount}>{sale.totalItems} units</Text>
            <Text style={styles.total}>£{sale.total.toFixed(2)}</Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const SaleList = () => {
  const [allSales, setAllSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<"All" | "Paid" | "Unpaid">("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#fff";

  const indicatorAnim = useSharedValue(0);
  const filterOptions: ("All" | "Paid" | "Unpaid")[] = ["All", "Paid", "Unpaid"];

  const loadSales = async () => {
    try {
      setRefreshing(true);

      const sales = await getSaleItems();

      if (!sales || sales.length === 0) {
        setAllSales([]);
        setFilteredSales([]);
        return;
      }

      const grouped = groupSales(sales);
      const sorted = sortSales(grouped, sortOrder);

      setAllSales(sorted);
      applyFilters(sorted, searchQuery, activeFilter);
    } finally {
      setRefreshing(false);
    }
  };

  const groupSales = (sales: any[]) => {
    const groups: Record<string, any> = {};

    for (const s of sales) {
      const groupId = s.batchId || s.salesId || s.saleId || s.id;

      if (!groups[groupId]) {
        groups[groupId] = {
          salesId: s.salesId || groupId,
          batchId: s.batchId,
          buyerName: s.buyerName || (s.type === "bulk_sale" ? "Bulk Sale" : "Quick Sale"),
          paid: s.paid ?? true,
          date: s.date,
          type: s.type || (s.batchId ? "bulk_sale" : "single_sale"),
          items: [],
        };
      }

      groups[groupId].items.push(s);
    }

    return Object.values(groups).map((g: any) => ({
      ...g,
      total: g.items.reduce(
        (sum: number, i: any) => sum + Number(i.price || 0) * Number(i.quantity || 0),
        0
      ),
      totalItems: g.items.reduce(
        (sum: number, i: any) => sum + Number(i.quantity || 0),
        0
      ),
    }));
  };

  const sortSales = (sales: any[], order: "asc" | "desc") =>
    [...sales].sort((a, b) =>
      order === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const applyFilters = (
    base: any[],
    query: string,
    filter: "All" | "Paid" | "Unpaid"
  ) => {
    const q = query.toLowerCase();

    let filtered = base.filter((s) => {
      const name = String(s.buyerName || "").toLowerCase();
      const date = new Date(s.date).toLocaleDateString("en-GB");
      const type = s.type === "bulk_sale" ? "bulk sale" : "quick sale";

      return name.includes(q) || date.includes(q) || type.includes(q);
    });

    if (filter === "Paid") filtered = filtered.filter((s) => s.paid);
    if (filter === "Unpaid") filtered = filtered.filter((s) => !s.paid);

    setFilteredSales(sortSales(filtered, sortOrder));
  };

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [sortOrder])
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(allSales, text, activeFilter);
  };

  const handleTabPress = (index: number, filter: "All" | "Paid" | "Unpaid") => {
    setActiveFilter(filter);
    applyFilters(allSales, searchQuery, filter);
    indicatorAnim.value = withTiming(index * (100 / filterOptions.length));
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    width: `${100 / filterOptions.length}%`,
    left: `${indicatorAnim.value}%`,
  }));

  const handleSortChange = (order: "asc" | "desc") => {
    setSortOrder(order);
    const reSorted = sortSales(filteredSales.length ? filteredSales : allSales, order);
    setFilteredSales(reSorted);
  };

  const handleQuickSale = () => router.push("/screens/sales/record");

  const handleBulkSale = () => router.push("/screens/BulkSaleScreen");

  const handleViewSale = (sale: any) =>
    router.push({
      pathname: "/screens/sales/viewSaleScreen",
      params: { salesId: sale.salesId || sale.batchId, type: sale.type },
    });

  const handleTogglePaid = async (sale: any) => {
    const all = await getSaleItems();

    const updated = all.map((s) => {
      const groupId = s.batchId || s.salesId || s.id;
      const saleGroupId = sale.batchId || sale.salesId;

      return groupId === saleGroupId ? { ...s, paid: !sale.paid } : s;
    });

    await saveAllSales(updated);
    loadSales();
  };

  const handleDeleteSale = async (sale: any) => {
    try {
      const allSalesData = await getSaleItems();

      const saleGroupId = sale.batchId || sale.salesId;

      const matched = allSalesData.filter((i) => {
        const groupId = i.batchId || i.salesId || i.id;
        return groupId === saleGroupId;
      });

      const updated = allSalesData.filter((i) => {
        const groupId = i.batchId || i.salesId || i.id;
        return groupId !== saleGroupId;
      });

      await saveAllSales(updated);

      for (const item of matched) {
        const stock = await getStockItem(item.stockItemId);
        if (stock) {
          await updateStockQuantity(
            item.stockItemId,
            Number(stock.quantity) + Number(item.quantity)
          );
        }
      }

      Alert.alert("Deleted", "Stock out record deleted and stock restored.");
      loadSales();
    } catch {
      Alert.alert("Error", "Could not delete stock out record.");
    }
  };

  const confirmDelete = (sale: any) =>
    Alert.alert(
      "Delete Stock Out",
      `Delete this ${sale.type === "bulk_sale" ? "bulk sale" : "quick sale"} record? Stock will be restored.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteSale(sale),
        },
      ]
    );

  return (
      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          {/* <SafeAreaView style={{ flex: 1 }}> */}
            <View style={styles.headerArea}>
              <Text style={styles.screenTitle}>Stock Out History</Text>
              <Text style={styles.screenSubtitle}>
                Record quick sales, bulk sales and review stock movement.
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{ flex: 1 }}
                  onPress={handleQuickSale}
                >
                  <LinearGradient
                    colors={["#2563eb", "#1d4ed8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionIcon}>⚡</Text>
                    <Text style={styles.actionText}>Quick Sale</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{ flex: 1 }}
                  onPress={handleBulkSale}
                >
                  <LinearGradient
                    colors={["#0f766e", "#14b8a6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionIcon}>📦</Text>
                    <Text style={styles.actionText}>Bulk Sale</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stickyHeader}>
              <TextInput
                placeholder="Search by buyer, date or type"
                placeholderTextColor="#bbb"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
              />

              <View style={styles.toggleContainer}>
                {filterOptions.map((f, i) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => handleTabPress(i, f)}
                    style={styles.toggleButton}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        { color: activeFilter === f ? "#fff" : "#bbb" },
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}

                <Animated.View style={[styles.toggleIndicator, indicatorStyle]} />
              </View>

              <Dropdown
                style={styles.dropdown}
                placeholder="Sort"
                placeholderStyle={styles.dropdownPlaceholder}
                data={[
                  { label: "Newest", value: "desc" },
                  { label: "Oldest", value: "asc" },
                ]}
                labelField="label"
                valueField="value"
                value={sortOrder}
                onChange={(item) => handleSortChange(item.value)}
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadSales} />
              }
            >
              {filteredSales.length === 0 ? (
                <Text style={{ color: textColor, textAlign: "center", marginTop: 40 }}>
                  No stock out records found.
                </Text>
              ) : (
                filteredSales.map((sale, idx) => (
                  <SaleCard
                    key={`${sale.batchId || sale.salesId}-${idx}`}
                    sale={sale}
                    onView={handleViewSale}
                    onDelete={confirmDelete}
                    onToggle={handleTogglePaid}
                  />
                ))
              )}
            </ScrollView>
          {/* </SafeAreaView> */}
        </LinearGradient>
      </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  screenTitle: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
  },

  screenSubtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 14,
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  scrollContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },

  stickyHeader: {
    backgroundColor: "rgba(20,30,50,0.95)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 10,
  },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    marginBottom: 10,
    marginTop: 5,
  },

  toggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },

  toggleText: {
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
  },

  toggleIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: "#FFD700",
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    paddingHorizontal: 14,
    color: "#fff",
    height: 42,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 8,
  },

  dropdown: {
    height: 42,
    borderRadius: 20,
    backgroundColor: "rgba(240,233,233,0.93)",
    paddingHorizontal: 12,
  },

  dropdownPlaceholder: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },

  cardContainer: {
    position: "relative",
    marginBottom: 20,
  },

  swipeBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
  },

  bgLeft: {
    flex: 1,
    backgroundColor: "#2E7D32",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    justifyContent: "center",
    paddingLeft: 25,
  },

  bgRight: {
    flex: 1,
    backgroundColor: "#E53935",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 25,
  },

  bgText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  card: {
    backgroundColor: "#45556e",
    borderRadius: 16,
    padding: 16,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  buyerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },

  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },

  typeBadge: {
    color: "#fff",
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 11,
  },

  quickBadge: {
    backgroundColor: "#2563eb",
  },

  bulkBadge: {
    backgroundColor: "#0f766e",
  },

  badge: {
    color: "#fff",
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 11,
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  date: {
    color: "#ddd",
    fontSize: 14,
    flex: 1,
  },

  itemCount: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
  },

  total: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    textAlign: "right",
  },
});

export default SaleList;