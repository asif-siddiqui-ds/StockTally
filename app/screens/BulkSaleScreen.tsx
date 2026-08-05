
import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getStockItems,
  saveSaleItem,
  saveStockMovement,
  updateStockQuantity,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type BulkSaleItem = {
  id: string;
  name: string;
  category?: string;
  stockQty: number;
  sellQty: number;
  price: number;
};

const BulkSaleScreen = () => {
  const [items, setItems] = useState<BulkSaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      const stock = await getStockItems();

      const mapped: BulkSaleItem[] = stock
        .filter((item: any) => Number(item.quantity || 0) > 0)
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          stockQty: Number(item.quantity || 0),
          sellQty: 0,
          price: Number(item.price || item.sellingPrice || 0),
        }));

      setItems(mapped);
    } catch (error: any) {
      Alert.alert("Load Failed", error.message || "Could not load stock items.");
    } finally {
      setLoading(false);
    }
  };

  const updateSellQty = (id: string, value: string) => {
    const qty = Number(value) || 0;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, sellQty: qty } : item))
    );
  };

  const updatePrice = (id: string, value: string) => {
    const price = Number(value) || 0;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price } : item))
    );
  };

  const selectedItems = useMemo(() => {
    return items.filter((item) => item.sellQty > 0);
  }, [items]);

  const totalProducts = selectedItems.length;

  const totalUnitsSold = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.sellQty, 0);
  }, [selectedItems]);

  const totalSaleValue = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + item.sellQty * Number(item.price || 0),
      0
    );
  }, [selectedItems]);

  const processBulkSale = async () => {
    if (selectedItems.length === 0) {
      Alert.alert("No Sales Entered", "Please enter sold quantities.");
      return;
    }

    const invalidItem = selectedItems.find(
      (item) => Number(item.sellQty) > Number(item.stockQty)
    );

    if (invalidItem) {
      Alert.alert(
        "Not Enough Stock",
        `${invalidItem.name} only has ${invalidItem.stockQty} in stock.`
      );
      return;
    }

    Alert.alert(
      "Process Bulk Sale",
      `${totalProducts} product(s) will be processed.\n\nTotal Units: ${totalUnitsSold}\nEstimated Value: £${totalSaleValue.toFixed(
        2
      )}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const batchId = `bulk_${Date.now()}`;
              const now = new Date().toISOString();

              for (const item of selectedItems) {
                const soldQty = Number(item.sellQty || 0);
                const currentStockQty = Number(item.stockQty || 0);
                const newBalance = currentStockQty - soldQty;

                await saveSaleItem({
                  salesId: batchId,
                  batchId,
                  stockItemId: item.id,
                  name: item.name,
                  quantity: soldQty,
                  price: Number(item.price || 0),
                  buyerName: "Bulk Sale",
                  paid: true,
                  type: "bulk_sale",
                  date: now,
                  synced: false,
                  syncedAt: "",
                } as any);

                await updateStockQuantity(item.id, newBalance);

                await saveStockMovement({
                  stockItemId: item.id,
                  itemName: item.name,
                  type: "OUT",
                  quantity: soldQty,
                  source: "BULK_SALE",
                  sourceLabel: "Bulk sale",
                  balanceAfter: newBalance,
                  referenceId: batchId,
                  referenceType: "SALE",
                  note: `Bulk sale processed. Batch ID: ${batchId}`,
                });
              }

              Alert.alert(
                "Bulk Sale Completed",
                `${totalProducts} product(s) processed successfully.`
              );

              router.replace("/screens/stock/stockOutHistory");
            } catch (error: any) {
              Alert.alert(
                "Bulk Sale Failed",
                error.message || "Could not process bulk sale."
              );
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: BulkSaleItem }) => {
    const remaining = Number(item.stockQty) - Number(item.sellQty || 0);
    const lineTotal = Number(item.sellQty || 0) * Number(item.price || 0);
    const lowRemaining = remaining <= 5 && item.sellQty > 0;

    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>

            {!!item.category && <Text style={styles.category}>{item.category}</Text>}
          </View>

          <View style={[styles.stockBadge, item.stockQty <= 5 ? styles.lowBadge : styles.normalBadge]}>
            <Text style={styles.stockBadgeText}>{item.stockQty} in stock</Text>
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Qty Sold</Text>
            <TextInput
              value={item.sellQty > 0 ? String(item.sellQty) : ""}
              onChangeText={(text) => updateSellQty(item.id, text)}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              keyboardAppearance="dark"
              placeholder="0"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sale Price</Text>
            <TextInput
              value={item.price > 0 ? String(item.price) : ""}
              onChangeText={(text) => updatePrice(item.id, text)}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              keyboardAppearance="dark"
              placeholder="0.00"
              style={styles.input}
            />
          </View>

          <View style={styles.remainingContainer}>
            <Text style={styles.remainingLabel}>Left</Text>
            <Text style={[styles.remainingValue, lowRemaining && { color: "#dc2626" }]}>
              {remaining}
            </Text>
          </View>
        </View>

        {item.sellQty > 0 && (
          <View style={styles.lineTotalBox}>
            <Text style={styles.lineTotalLabel}>Line Total</Text>
            <Text style={styles.lineTotalValue}>£{lineTotal.toFixed(2)}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading stock items...</Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
        <SafeAreaView style={{ flex: 1, paddingBottom: Platform.OS === "android" ? 45 : 0 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Bulk Sale Entry</Text>
              <Text style={styles.subtitle}>
                Enter sold quantities and sale prices for multiple products.
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{totalProducts}</Text>
                <Text style={styles.summaryLabel}>Products</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{totalUnitsSold}</Text>
                <Text style={styles.summaryLabel}>Units Sold</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>£{totalSaleValue.toFixed(0)}</Text>
                <Text style={styles.summaryLabel}>Value</Text>
              </View>
            </View>

            {items.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No stock available</Text>
                <Text style={styles.emptyText}>
                  Add stock first before recording bulk sales.
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push("/screens/stock/add")}
                >
                  <Text style={styles.emptyButtonText}>Add Stock</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{
                  padding: 16,
                  paddingBottom: 300,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            )}

            <View style={styles.bottomBar}>
              <TouchableOpacity activeOpacity={0.9} onPress={processBulkSale}>
                <LinearGradient
                  colors={["#16a34a", "#15803d"]}
                  style={styles.processButton}
                >
                  <Text style={styles.processButtonText}>Process Bulk Sale</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    marginTop: 6,
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  summaryNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#cbd5e1",
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  category: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 13,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  normalBadge: {
    backgroundColor: "#dbeafe",
  },
  lowBadge: {
    backgroundColor: "#fee2e2",
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: "#f9fafb",
  },
  remainingContainer: {
    marginLeft: 10,
    alignItems: "center",
    width: 62,
  },
  remainingLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    fontWeight: "700",
  },
  remainingValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#16a34a",
  },
  lineTotalBox: {
    marginTop: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lineTotalLabel: {
    color: "#6b7280",
    fontWeight: "800",
  },
  lineTotalValue: {
    color: "#111827",
    fontWeight: "900",
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  processButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  processButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 14,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptyText: {
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },
  emptyButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
});

export default BulkSaleScreen;