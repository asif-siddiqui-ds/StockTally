import ScreenWrapper from "@/components/ScreenWrapper";
import {
  deleteReturnStockItem,
  getReturnStockItems,
  ReturnStockItem,
  updateReturnItem,
} from "@/lib/storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ReturnStockListScreen = () => {
  const [items, setItems] = useState<ReturnStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const data = await getReturnStockItems();

      const sorted = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setItems(sorted);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Could not load supplier return list."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
  };

  const markReturnedToSupplier = async (item: ReturnStockItem) => {
    Alert.alert(
        "Returned to Supplier?",
        `${item.name} will be cleared from Supplier Return List. The return history will remain in Returns List.`,
        [
        { text: "Cancel", style: "cancel" },
        {
            text: "Confirm",
            style: "destructive",
            onPress: async () => {
            try {
                await updateReturnItem(item.returnItemId, {
                status: "returned_to_supplier",
                });

                await deleteReturnStockItem(item.id);
                await loadItems();

                Alert.alert("Done", "Item marked as returned to supplier.");
            } catch (error: any) {
                Alert.alert("Error", error.message || "Could not update return status.");
            }
            },
        },
        ]
    );
};

  const shareList = async () => {
    if (items.length === 0) {
      Alert.alert(
        "No Items",
        "There are no items waiting to be returned to supplier."
      );
      return;
    }

    const message = [
      "StockTally Supplier Return List",
      "",
      ...items.map((item, index) => {
        return `${index + 1}. ${item.name}
        Quantity: ${item.quantity}
        Reason: ${item.reason}
        Category: ${item.category || "Uncategorised"}
        Supplier: ${item.supplierName || "Not added"}
        Added: ${new Date(item.date).toLocaleDateString("en-GB")}`;
      }),
    ].join("\n\n");

    await Share.share({ message });
  };

  const renderItem = ({ item }: { item: ReturnStockItem }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.category}>
              {item.category || "Uncategorised"}
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>TO RETURN</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>{item.quantity}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Reason</Text>
          <Text style={styles.value}>{item.reason}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Supplier</Text>
          <Text style={styles.value}>{item.supplierName || "Not added"}</Text>
        </View>

        <Text style={styles.date}>
          Added: {new Date(item.date).toLocaleDateString("en-GB")}
        </Text>

        <TouchableOpacity
          style={styles.returnedButton}
          onPress={() => markReturnedToSupplier(item)}
        >
          <Text style={styles.returnedButtonText}>Returned to Supplier</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading supplier returns...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Supplier Returns</Text>
            <Text style={styles.subtitle}>
              {items.length} item{items.length === 1 ? "" : "s"} waiting to be returned
            </Text>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={shareList}>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No supplier returns</Text>
            <Text style={styles.emptyText}>
              Damaged, expired or faulty items marked for supplier return will appear here.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/screens/returns/record")}
            >
              <Text style={styles.primaryButtonText}>Record Return</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "600",
  },
  shareButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  shareText: {
    color: "#fff",
    fontWeight: "900",
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  category: {
    color: "#6b7280",
    marginTop: 3,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#f97316",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    gap: 10,
  },
  label: {
    color: "#6b7280",
    fontWeight: "800",
  },
  value: {
    color: "#111827",
    fontWeight: "800",
    maxWidth: "60%",
    textAlign: "right",
  },
  date: {
    color: "#6b7280",
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
  },
  returnedButton: {
    marginTop: 14,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  returnedButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 10,
  },
});

export default ReturnStockListScreen;