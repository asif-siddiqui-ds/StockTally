// import ScreenWrapper from "@/components/ScreenWrapper";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React from "react";
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const StockMoveScreen = () => {
//   return (
//     <ScreenWrapper>
//       <LinearGradient
//         colors={["#0d1b2a", "#1b263b", "#415a77"]}
//         style={styles.gradient}
//       >
//         <SafeAreaView style={styles.safeArea}>
//           <View style={styles.container}>
//             <Text style={styles.title}>Stock Move</Text>
//             <Text style={styles.subtitle}>
//               Choose how you want to record stock going out.
//             </Text>

//             <TouchableOpacity
//               activeOpacity={0.9}
//               onPress={() => router.push("/screens/sales/record")}
//             >
//               <LinearGradient
//                 colors={["#2563eb", "#1d4ed8"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.optionCard}
//               >
//                 <Text style={styles.icon}>⚡</Text>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.optionTitle}>Single / Quick Sale</Text>
//                   <Text style={styles.optionText}>
//                     Record single sale and reduce stock immediately.
//                   </Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity
//               activeOpacity={0.9}
//               onPress={() => router.push("/screens/BulkSaleScreen")}
//             >
//               <LinearGradient
//                 colors={["#0f766e", "#14b8a6"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.optionCard}
//               >
//                 <Text style={styles.icon}>📦</Text>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.optionTitle}>Bulk Sale</Text>
//                   <Text style={styles.optionText}>
//                     Enter multiple sold items together, ideal for end-of-day stock updates.
//                   </Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity
//               activeOpacity={0.9}
//               onPress={() => router.push("/screens/BulkSaleScreen")}
//             >
//               <LinearGradient
//                 colors={["#0f766e", "#14b8a6"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.optionCard}
//               >
//                 <Text style={styles.icon}>📦</Text>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.optionTitle}>Consumed</Text>
//                   <Text style={styles.optionText}>
//                     Enter stock consumed in-house.
//                   </Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity
//               activeOpacity={0.8}
//               style={styles.historyButton}
//               onPress={() => router.push("/(tabs)/stockConsumption")}
//             >
//               <Text style={styles.historyText}>View Sale / Stock Out History</Text>
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       </LinearGradient>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   safeArea: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     padding: 22,
//     justifyContent: "center",
//   },
//   title: {
//     color: "#fff",
//     fontSize: 32,
//     fontWeight: "900",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   subtitle: {
//     color: "#cbd5e1",
//     fontSize: 16,
//     textAlign: "center",
//     lineHeight: 22,
//     marginBottom: 28,
//   },
//   optionCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 20,
//     borderRadius: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.25,
//     shadowOffset: { width: 0, height: 5 },
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   icon: {
//     fontSize: 34,
//     marginRight: 16,
//   },
//   optionTitle: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "900",
//     marginBottom: 5,
//   },
//   optionText: {
//     color: "#e0f2fe",
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   historyButton: {
//     marginTop: 8,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.25)",
//     paddingVertical: 14,
//     borderRadius: 16,
//     alignItems: "center",
//   },
//   historyText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "800",
//   },
// });

// export default StockMoveScreen;

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getStockItems,
  saveStockMovement,
  updateStockQuantity,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const StockMoveScreen = () => {
  const [showConsumedForm, setShowConsumedForm] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [selectedStockId, setSelectedStockId] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    loadStockItems();
  }, []);

  const loadStockItems = async () => {
    const items = await getStockItems();
    setStockItems(items || []);
  };

  const handleSaveConsumed = async () => {
    const selectedItem = stockItems.find((item) => item.id === selectedStockId);
    const consumedQty = Number(quantity);

    if (!selectedItem) {
      Alert.alert("Validation Error", "Please select a stock item.");
      return;
    }

    if (!consumedQty || consumedQty <= 0) {
      Alert.alert("Validation Error", "Please enter a valid quantity.");
      return;
    }

    if (consumedQty > Number(selectedItem.quantity || 0)) {
      Alert.alert("Validation Error", "Consumed quantity exceeds available stock.");
      return;
    }

    try {
      const newBalance = Number(selectedItem.quantity || 0) - consumedQty;

      await updateStockQuantity(selectedItem.id, newBalance);

      await saveStockMovement({
        stockItemId: selectedItem.id,
        itemName: selectedItem.name,
        type: "OUT",
        quantity: consumedQty,
        source: "CONSUMED",
        sourceLabel: "Consumed in-house",
        balanceAfter: newBalance,
        referenceId: selectedItem.id,
        referenceType: "STOCK",
        note: "Stock consumed in-house",
      });

      Alert.alert("Success", "Consumed stock recorded successfully.");

      setSelectedStockId("");
      setQuantity("");
      setShowConsumedForm(false);
      await loadStockItems();
    } catch (error) {
      console.error("Consumed stock error:", error);
      Alert.alert("Error", "Failed to record consumed stock.");
    }
  };

  return (
    <ScreenWrapper>
      <LinearGradient
        colors={["#0d1b2a", "#1b263b", "#415a77"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text style={styles.title}>Stock Move</Text>
            <Text style={styles.subtitle}>
              Choose how you want to record stock going out.
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/screens/sales/record")}
            >
              <LinearGradient
                colors={["#2563eb", "#1d4ed8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionCard}
              >
                <Text style={styles.icon}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Single / Quick Sale</Text>
                  <Text style={styles.optionText}>
                    Record single sale and reduce stock immediately.
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/screens/BulkSaleScreen")}
            >
              <LinearGradient
                colors={["#0f766e", "#14b8a6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionCard}
              >
                <Text style={styles.icon}>📦</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Bulk Sale</Text>
                  <Text style={styles.optionText}>
                    Enter multiple sold items together, ideal for end-of-day stock updates.
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowConsumedForm((prev) => !prev)}
            >
              <LinearGradient
                colors={["#7c2d12", "#ea580c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionCard}
              >
                <Text style={styles.icon}>🏠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Consumed In-House</Text>
                  <Text style={styles.optionText}>
                    Reduce stock used internally by the business.
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {showConsumedForm && (
              <View style={styles.consumedForm}>
                <Text style={styles.formTitle}>Record Consumed Stock</Text>

                <Text style={styles.label}>Select Stock Item</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={stockItems.map((item) => ({
                    label: `${item.name} (${item.quantity} ${item.unit || "units"} available)`,
                    value: item.id,
                  }))}
                  labelField="label"
                  valueField="value"
                  placeholder="Select item"
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.selectedText}
                  value={selectedStockId}
                  onChange={(item) => setSelectedStockId(item.value)}
                />

                <Text style={styles.label}>Quantity Consumed</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  placeholder="Enter quantity"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleSaveConsumed}
                >
                  <LinearGradient
                    colors={["#dc2626", "#991b1b"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Save Consumed Stock</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.historyButton}
              onPress={() => router.push("/(tabs)/stockConsumption")}
            >
              <Text style={styles.historyText}>View Sale / Stock Out History</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    padding: 22,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 6,
  },
  icon: {
    fontSize: 34,
    marginRight: 16,
  },
  optionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 5,
  },
  optionText: {
    color: "#e0f2fe",
    fontSize: 14,
    lineHeight: 20,
  },
  consumedForm: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  dropdown: {
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  placeholder: {
    color: "#64748b",
    fontSize: 14,
  },
  selectedText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#111827",
    fontSize: 15,
    marginBottom: 14,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  historyButton: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  historyText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default StockMoveScreen;