// app/screens/EditStockItem.tsx
import ScreenWrapper from '@/components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks'; // ✅ Correct import path
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { deleteStockItem, getStockItem, getStockItems, saveStockMovement, updateStockItem } from '../../../lib/storage';


const EditStockItem: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // ✅ Correct way to get the ID

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [lowStockAlert, setLowStockAlert] = useState('');
  const [idealStockLevel, setIdealStockLevel] = useState('');
  const [supplierName, setSupplierName] = useState('');

  const colorScheme = useColorScheme(); // ✅ detect dark/light mode
  const textColor = colorScheme === 'dark' ? '#fff' : '#000'; // ✅ adapt text
  const bgColor = colorScheme === 'dark' ? '#222' : '#fff'; // ✅ adapt field background


  useEffect(() => {
    if (!id) return;
    
    const loadItem = async () => {
      const items = await getStockItems();
      const item = items.find((i) => i.id === id);
      if (item) {
        setName(item.name);
        setQuantity(item.quantity);
        setCategory(item.category);
        setCostPrice(item.costPrice || 0);
        setLowStockAlert(item.lowStockAlert ? String(item.lowStockAlert) : '');
        setIdealStockLevel(item.idealStockLevel ? String(item.idealStockLevel) : '');
        setSupplierName(item.supplierName || '');
      }
    };
    loadItem();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) {
      Alert.alert("Error", "Item ID is missing.");
      return;
    }

    try {
      const existingItem = await getStockItem(id as string);

      if (!existingItem) {
        Alert.alert("Error", "Stock item not found.");
        return;
      }

      const oldQty = Number(existingItem.quantity || 0);
      const newQty = Number(quantity || 0);
      const difference = newQty - oldQty;

      const response = await updateStockItem(id as string, {
        name,
        quantity: newQty,
        category,
        costPrice,
        lowStockAlert: lowStockAlert ? Number(lowStockAlert) : undefined,
        idealStockLevel: idealStockLevel ? Number(idealStockLevel) : undefined,
        supplierName,
      });

      if (response) {
        if (difference !== 0) {
          await saveStockMovement({
            stockItemId: existingItem.id,
            itemName: name || existingItem.name,
            type: difference > 0 ? "IN" : "OUT",
            quantity: Math.abs(difference),
            source: "ADJUSTMENT",
            sourceLabel:
              difference > 0
                ? "Stock updated - quantity increased"
                : "Stock updated - quantity decreased",
            balanceAfter: newQty,
            referenceId: existingItem.id,
            referenceType: "ADJUSTMENT",
            note: "Stock quantity changed from Edit Stock screen",
          });
        }

        Alert.alert("Stock Item Updated Successfully");
        router.back();
      } else {
        Alert.alert("Failed to Update Stock Item");
      }
    } catch (error: any) {
      console.error("Failed to update stock item:", error);
      Alert.alert("Error", error.message || "Failed to update stock item.");
    }
  };

  const handleDelete = async () => {
    if (!id) {
      Alert.alert("Error", "Item ID is missing.");
      return;
    }

    try {
      const existingItem = await getStockItem(id as string);

      if (!existingItem) {
        Alert.alert("Error", "Stock item not found.");
        return;
      }

      const deletedQty = Number(existingItem.quantity || 0);

      await deleteStockItem(id as string);

      if (deletedQty > 0) {
        await saveStockMovement({
          stockItemId: existingItem.id,
          itemName: existingItem.name,
          type: "OUT",
          quantity: deletedQty,
          source: "MANUAL_CORRECTION",
          sourceLabel: "Stock item deleted",
          balanceAfter: 0,
          referenceId: existingItem.id,
          referenceType: "STOCK",
          note: "Stock item deleted from Edit Stock screen",
        });
      }

      Alert.alert("Deleted", "Stock deleted.");
      router.replace("/(tabs)/stockList");
    } catch (error: any) {
      console.error("Failed to delete stock item:", error);
      Alert.alert("Error", error.message || "Failed to delete stock item.");
    }
  };
  return (
    <ScreenWrapper scroll backgroundColor="#0d1b2a">
      <LinearGradient
        colors={["#0d1b2a", "#1b263b", "#415a77"]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Edit Stock Item</Text>
            <Text style={styles.subtitle}>
              Update item details, stock levels and supplier information.
            </Text>

            <Text style={styles.label}>Category</Text>
            <TextInput
              placeholder="Enter category"
              placeholderTextColor="#94a3b8"
              value={category}
              onChangeText={setCategory}
              style={styles.input}
            />

            <Text style={styles.label}>Item Name</Text>
            <TextInput
              placeholder="Enter item name"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  placeholder="Qty"
                  placeholderTextColor="#94a3b8"
                  value={String(quantity)}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  onChangeText={(text) => setQuantity(Number(text) || 0)}
                  style={styles.input}
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>Cost Price</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  value={String(costPrice)}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  onChangeText={(text) => setCostPrice(Number(text) || 0)}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Low Stock Alert</Text>
                <TextInput
                  placeholder="Alert level"
                  placeholderTextColor="#94a3b8"
                  value={lowStockAlert}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  onChangeText={setLowStockAlert}
                  style={styles.input}
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>Ideal Stock Level</Text>
                <TextInput
                  placeholder="Ideal level"
                  placeholderTextColor="#94a3b8"
                  value={idealStockLevel}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  onChangeText={setIdealStockLevel}
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.label}>Supplier Name</Text>
            <TextInput
              placeholder="Enter supplier name"
              placeholderTextColor="#94a3b8"
              value={supplierName}
              onChangeText={setSupplierName}
              style={styles.input}
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                <LinearGradient
                  colors={["#22c55e", "#15803d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Update Stock</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleDelete}>
                <LinearGradient
                  colors={["#ef4444", "#b91c1c"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Delete Item</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScreenWrapper>
  );
     
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    minHeight: "100%",
  },

  container: {
    padding: 16,
    paddingBottom: 140,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  keyboardView: {
    flex: 1,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 10,
    color: "#e5e7eb",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.95)",
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  half: {
    flex: 1,
  },

  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },

  button: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  gradientButton: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
});

export default EditStockItem;
