import ScreenWrapper from "@/components/ScreenWrapper";
import { getReturnItems, ReturnItem } from "@/lib/storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function ReturnListScreen() {
  const [items, setItems] = useState<ReturnItem[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const bgColor = colorScheme === "dark" ? "#121212" : "#f5f5f5";
  const cardColor = colorScheme === "dark" ? "#1e1e1e" : "#fff";

  // 🔄 Load Return Items
  useFocusEffect(
    useCallback(() => {
      const loadItems = async () => {
        try {
          const allItems = await getReturnItems();
          setItems(allItems);
        } catch (error) {
          Alert.alert("Error", "Failed to load return items.");
        }
      };
      loadItems();
    }, [])
  );

  // 🧭 Navigate to Edit
  const handleEdit = (id: string) => {
    router.push(`/screens/returns/${id}`);
  };

  // 📦 Render Each Return Card
  const renderItem = ({ item }: { item: ReturnItem }) => {
    const dateObj = new Date(item.date);
    const dateStr = `${dateObj.getDate().toString().padStart(2, "0")}/${(
      dateObj.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${dateObj.getFullYear().toString().slice(-2)}`;

    return (
      <TouchableOpacity
        onPress={() => handleEdit(item.id)}
        activeOpacity={0.9}
        style={styles.cardShadow}
      >
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: textColor }]}>📦</Text>
              <Text
                style={[
                  styles.cardText,
                  { color: textColor, fontWeight: "600", fontSize: 16 },
                ]}
              >
                {item.name}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                item.status === "pending_return"
                  ? styles.pendingBadge
                  : item.status === "returned_to_supplier"
                  ? styles.returnedBadge
                  : item.status === "back_to_stock"
                  ? styles.backToStockBadge
                  : styles.noStockChangeBadge,
              ]}
            >
              <Text style={styles.badgeText}>
                {item.status === "pending_return"
                  ? "Pending Return"
                  : item.status === "returned_to_supplier"
                  ? "Returned to Supplier"
                  : item.status === "back_to_stock"
                  ? "Back to Stock"
                  : "No Stock Change"}
              </Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>📅</Text>
            <Text style={[styles.cardText, { color: textColor }]}>{dateStr}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: textColor }]}>🔢</Text>
            <Text style={[styles.cardText, { color: textColor }]}>
              Quantity: {item.quantity}
            </Text>
          </View>

          {item.reason ? (
            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { color: textColor }]}>💬</Text>
              <Text style={[styles.cardText, { color: textColor }]}>
                {item.reason}
              </Text>
            </View>
          ) : null}
        
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
      
      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={{ flex: 1 }}
          onPress={() => router.push("/screens/returns/record")}
        >
          <LinearGradient
            colors={["#16a34a", "#15803d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>↩️</Text>
            <Text style={styles.actionText}>Add Return</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={{ flex: 1 }}
          onPress={() => router.push("/screens/ReturnStockListScreen")}
        >
          <LinearGradient
            colors={["#1e3a8a", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>🏭</Text>
            <Text style={styles.actionText}>Supplier</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={[styles.container]}>
        {/* ✅ List of Returns */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                color: textColor,
                marginTop: 30,
                fontSize: 16,
              }}
            >
              No return items available.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 15 }}
        />
      </View>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },

  actionButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },

  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 8,
  },
  card: {
    borderRadius: 10,
    padding: 15,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  cardLabel: {
    width: 25,
    fontSize: 16,
  },
  cardText: {
    fontSize: 15,
    flexShrink: 1,
  },
  addButtonWrapper: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderRadius: 30,
    overflow: "hidden",
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  supplierButton: {
    marginTop: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#2563eb",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "800",
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  cardTop: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },

  pendingBadge: {
    backgroundColor: "#f97316", // orange
  },

  returnedBadge: {
    backgroundColor: "#6b7280", // grey
  },

  backToStockBadge: {
    backgroundColor: "#2563eb", // blue
  },

  noStockChangeBadge: {
    backgroundColor: "#16a34a", // green
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  supplierText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
