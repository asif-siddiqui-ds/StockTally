import ScreenWrapper from '@/components/ScreenWrapper';
import { getSaleItems, getStockItems, saveSaleItem, updateStockQuantity } from '@/lib/storage';
import { isGuest } from '@/utils/guest';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const MAX_GUEST_SALES = 50;

const RecordSale = () => {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [stockItemId, setStockItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [buyerName, setBuyerName] = useState('');
  const [saleItems, setSaleItems] = useState<any[]>([]); // multiple items
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#fff' : '#333';

  // ✅ Fetch stock items
  useEffect(() => {
    const fetchStockItems = async () => {
      const items = await getStockItems();
      setStockItems(items || []);
    };
    fetchStockItems();
  }, []);

  // 🧩 Validate item before adding
  const validateItem = () => {
    if (!stockItemId || quantity === '' || price === '') {
      Alert.alert("Error", "Please select an item and enter quantity and price.");
      return false;
    }
    const stockItem = stockItems.find((item) => item.id === stockItemId);
    if (!stockItem) {
      Alert.alert("Error", "Selected stock item not found.");
      return false;
    }
    if (quantity > stockItem.quantity) {
      Alert.alert("Error", "Quantity exceeds available stock.");
      return false;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      Alert.alert("Error", "Quantity must be a positive integer.");
      return false;
    }
    return true;
  };

  // ➕ Add Item
  const handleAddItem = () => {
    if (!validateItem()) return;

    const selectedStock = stockItems.find((item) => item.id === stockItemId);
    const newItem = {
      stockItemId,
      name: selectedStock?.name || '',
      quantity,
      price,
    };
    setSaleItems([...saleItems, newItem]);

    // reset form
    setStockItemId('');
    setItemName('');
    setQuantity('');
    setPrice('');

    Alert.alert("✅ Added", `${selectedStock?.name} added to sale.`);
  };

  // 💾 Save Sale (popup for Paid/Unpaid)
  const handleSaveSale = async () => {
    if (await isGuest()) {
      const currentSales = await getSaleItems();
      if (currentSales.length >= MAX_GUEST_SALES) {
        Alert.alert(
          "Limit Reached",
          `You can only record up to ${MAX_GUEST_SALES} sales in the free version. Upgrade to Pro for unlimited access.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Upgrade", onPress: () => router.push('/paywall') },
          ]
        );
        return;
      }
    }

    if (!buyerName) {
      Alert.alert("Error", "Please enter buyer name.");
      return;
    }

    if (saleItems.length === 0) {
      Alert.alert("Error", "Please add at least one item before saving.");
      return;
    }

    // ✅ Ask user whether sale is paid or unpaid
    Alert.alert(
      "Payment Status",
      "Mark this sale as Paid or Unpaid?",
      [
        {
          text: "Unpaid",
          onPress: () => saveSale(false),
          style: "destructive",
        },
        {
          text: "Paid",
          onPress: () => saveSale(true),
        },
      ],
      { cancelable: false }
    );
  };

  // 💾 Save logic
  const saveSale = async (paidStatus: boolean) => {
    try {
      for (const item of saleItems) {
        await saveSaleItem({
          stockItemId: item.stockItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          buyerName,
          paid: paidStatus,
          // date: new Date().toISOString(),
        });

        // Update stock
        const stockItem = stockItems.find((s) => s.id === item.stockItemId);
        if (stockItem) {
          const newQuantity = stockItem.quantity - item.quantity;
          await updateStockQuantity(item.stockItemId, newQuantity);
        }
      }

      Alert.alert("✅ Success", paidStatus ? "Paid sale recorded." : "Unpaid sale recorded.");
      router.replace('../../(tabs)/saleList');
    } catch (err) {
      console.error("❌ Error saving sale:", err);
      Alert.alert("Error", "Failed to record sale.");
    }
  };

  return (
    <ScreenWrapper>
      <LinearGradient colors={["#bbc5d0ff", "#1b263b", "#415a77"]} style={styles.gradient}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.form}>
              {/* 🧾 Stock Dropdown */}
              <Dropdown
                style={[styles.dropdown]}
                data={stockItems.map((item) => ({
                  label: `${item.name} (${item.quantity} in stock)`,
                  value: item.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder="Select Stock Item"
                value={stockItemId}
                onChange={(item) => {
                  setStockItemId(item.value);
                  const selectedItem = stockItems.find((s) => s.id === item.value);
                  if (selectedItem) setItemName(selectedItem.name);
                }}
              />

              <Text style={styles.label}>Quantity</Text>
              <TextInput
                value={quantity === '' ? '' : String(quantity)}
                onChangeText={(val) => setQuantity(val === '' ? '' : parseInt(val))}
                keyboardType="numeric"
                style={styles.input}
                placeholder="Enter quantity"
              />

              <Text style={styles.label}>Price</Text>
              <TextInput
                value={price === '' ? '' : String(price)}
                onChangeText={(val) => setPrice(val === '' ? '' : parseFloat(val))}
                keyboardType="numeric"
                style={styles.input}
                placeholder="Enter price"
              />

              <Text style={styles.label}>Buyer Name</Text>
              <TextInput
                value={buyerName}
                onChangeText={setBuyerName}
                style={styles.input}
                placeholder="Enter buyer name"
              />

              {/* ✅ Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <TouchableOpacity onPress={handleAddItem} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={['#2196F3', '#0D47A1']}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>+ Add More Item</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSaveSale} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={['#4CAF50', '#2E7D32']}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>Save Sale</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* 🧾 Preview */}
              {saleItems.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 10 }}>
                    Added Items:
                  </Text>
                  {saleItems.map((item, idx) => (
                    <View key={idx} style={styles.itemPreview}>
                      <Text style={{ color: textColor }}>
                        {idx + 1}. {item.name} - {item.quantity} x £{item.price}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: { padding: 20, gap: 10 },
  form: { backgroundColor: "rgba(239, 230, 230, 1)", borderRadius: 16, padding: 20 },
  label: { fontSize: 18, fontWeight: '600', marginTop: 20 },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  dropdown: { height: 50, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10 },
  gradientButton: { borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 30},
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  itemPreview: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 5,
  },
});

export default RecordSale;
