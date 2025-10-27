// import ScreenWrapper from '@/components/ScreenWrapper';
// import { Picker } from '@react-native-picker/picker';
// import { useFocusEffect } from '@react-navigation/native';
// import { useRouter } from 'expo-router';
// import { useCallback, useState } from 'react';
// import {
//   Alert,
//   Button,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TextInput,
//   View,
//   useColorScheme
// } from 'react-native';
// import {
//   SaleItem,
//   StockItem,
//   getSaleItems,
//   getStockItems,
//   saveSaleItem,
//   updateStockQuantity
// } from '../../../lib/storage';

// export default function RecordSale() {
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';

//   // State variables
//   const [itemName, setItemName] = useState<string>('');
//   const [quantity, setQuantity] = useState<string>('');
//   const [buyerName, setBuyerName] = useState<string>('');
//   const [price, setPrice] = useState<string>('');
//   const [paid, setPaid] = useState('');

//   const [stockItems, setStockItems] = useState<StockItem[]>([]);
//   const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

//   // Load stock items and sale items
//   useFocusEffect(
//     useCallback(() => {
//       const loadData = async () => {
//         try {
//           const stock = await getStockItems();
//           const sales = await getSaleItems();
//           setStockItems(stock);
//           setSaleItems(sales);
//           setItemName('');
//           setQuantity('');
//           setBuyerName('');
//           setPrice('');
//           setPaid('');
//         } catch (error) {
//           // console.error("Failed to load items:", (error.message));
//           Alert.alert("Error", "Failed to load items");
//         }
//       };
//       loadData();
//     }, [])
//   );

//   // Filtered stock items (only those with quantity > 0)
//   const filteredStockItems = stockItems.filter(item => item.quantity > 0);

//   // Handle Record Sale
//   const handleRecordSale = async () => {
//   const stockItem = stockItems.find(
//     (item) => item.name.toLowerCase() === itemName.trim().toLowerCase()
//   );

//   if (!stockItem) {
//     Alert.alert('Error', 'Item not found in stock');
//     return;
//   }

//   const qty = parseInt(quantity);
//   const pr = parseFloat(price);

//   if (isNaN(qty) || qty <= 0) {
//     Alert.alert('Error', 'Please enter a valid quantity');
//     return;
//   }

//   if (isNaN(pr) || pr <= 0) {
//     Alert.alert('Error', 'Please enter a valid price');
//     return;
//   }

//   if (qty > stockItem.quantity) {
//     Alert.alert('Error', 'Not enough stock for this item');
//     return;
//   }

//   try {
//     // ✅ Create a new Sale Item
//     const newSaleItem: Omit<SaleItem, 'id'> = {
//       name: itemName,
//       quantity: qty,
//       date: new Date().toISOString(),
//       buyerName,
//       price: pr,
//       paid: false
//     };

//     await saveSaleItem(newSaleItem);

//     // ✅ Update Stock Quantity
//     const newQuantity = stockItem.quantity - qty;
//     await updateStockQuantity(stockItem.id, newQuantity);

//     Alert.alert('Sale Recorded', `Successfully sold ${quantity} ${itemName}(s)`);
//     router.replace('../../(tabs)/saleList');
//   } catch (error: any) {
//     console.error("Failed to record sale:", error.message);
//     Alert.alert("Error", "Failed to record sale");
//   }
// };
//   return (
//       <ScreenWrapper>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.label}>Item Name:</Text>
//         <View style={[styles.pickerWrapper, isDark && styles.pickerWrapperDark]}>
//           <Picker
//             selectedValue={itemName}
//             onValueChange={(value) => setItemName(value)}
//             dropdownIconColor={isDark ? 'white' : 'black'}
//             style={{ color: isDark ? '#fff' : '#000' }}
//           >
//             <Picker.Item label="Select Item" value="" />
//             {filteredStockItems.map((item) => (
//               <Picker.Item key={item.id} label={item.name} value={item.name} />
//             ))}
//           </Picker>
//         </View>

//         <Text style={styles.label}>Quantity:</Text>
//         <TextInput
//           value={quantity}
//           onChangeText={setQuantity}
//           placeholder="Enter quantity"
//           keyboardType="numeric"
//           style={[styles.input, isDark && styles.inputDark]}
//           placeholderTextColor={isDark ? '#ccc' : '#888'}
//         />

//         <Text style={styles.label}>Buyer's Name:</Text>
//         <TextInput
//           value={buyerName}
//           onChangeText={setBuyerName}
//           placeholder="Enter buyer's name"
//           style={[styles.input, isDark && styles.inputDark]}
//           placeholderTextColor={isDark ? '#ccc' : '#888'}
//         />

//         <Text style={styles.label}>Price (£):</Text>
//         <TextInput
//           value={price}
//           onChangeText={setPrice}
//           placeholder="Enter price"
//           keyboardType="numeric"
//           style={[styles.input, isDark && styles.inputDark]}
//           placeholderTextColor={isDark ? '#ccc' : '#888'}
//         />

//         {/* ✅ Switch to toggle Paid status */}
//       <View style={styles.switchContainer}>
//         <Text style={styles.switchLabel}>Paid:</Text>
//         <Switch value={paid} onValueChange={setPaid} />
//       </View>

//         <View style={{ marginTop: 20 }}>
//           <Button title="Record Sale" onPress={handleRecordSale} />
//         </View>
//       </ScrollView>
//       </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 15,
//     paddingBottom: 80,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 3,
//     fontWeight: '600',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 14,
//     fontSize: 16,
//     borderRadius: 8,
//     backgroundColor: '#fff',
//     color: '#000',
//   },
//   inputDark: {
//     backgroundColor: '#1e1e1e',
//     borderColor: '#444',
//     color: '#fff',
//   },
//   pickerWrapper: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     backgroundColor: '#fff',
//   },
//   pickerWrapperDark: {
//     backgroundColor: '#1e1e1e',
//     borderColor: '#444',
//   },
//   switchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   switchLabel: {
//     marginRight: 10,
//     fontSize: 16,
//   },
// });
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { getStockItems, saveSaleItem, updateStockQuantity } from '@/lib/storage';
// import { Picker } from '@react-native-picker/picker';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// const RecordSale = () => {
//   const [itemName, setItemName] = useState('');
//   const [stockItemId, setStockItemId] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [price, setPrice] = useState('');
//   const [buyerName, setBuyerName] = useState('');
//   const [paid, setPaid] = useState(false);
//   const [stockItems, setStockItems] = useState([]);
//   // const [selectedItem, setSelectedItem] = useState('');
//   const router = useRouter();
  

//   // 🔄 Fetch Stock Items on Load
//   useEffect(() => {
//     const fetchStockItems = async () => {
//       const items = await getStockItems();
//       setStockItems(items);
//     };

//     fetchStockItems();
//   }, []);

//   // ✅ Handle Save
//   const handleSave = async () => {
//   if (!stockItemId || !quantity || !price || !buyerName) {
//     Alert.alert("Error", "Please fill all the fields.");
//     console.log("⚠️ Missing field data");
//     return;
//   }

//   if (!/^[1-9]\d*$/.test(quantity)) {
//     Alert.alert("Error", "Quantity must be a positive integer.");
//     console.log("⚠️ Quantity is not a positive integer.");
//     return;
//   }

//   try {
//     console.log("📦 Stock Item ID:", stockItemId);
//     console.log("💰 Quantity:", quantity);
//     console.log("🧾 Price:", price);
//     console.log("👤 Buyer Name:", buyerName);

//     // Fetch the selected stock item
//     const stockItem = stockItems.find((item) => item.id === stockItemId);

//     if (!stockItem) {
//       Alert.alert('Error', 'Selected stock item not found.');
//       console.error("❌ Stock item not found for ID:", stockItemId);
//       return;
//     }
//     console.log("✅ Stock Item Fetched:", stockItem);

//     const qty = parseInt(quantity);
//     if (qty > stockItem.quantity) {
//       Alert.alert("Error", "Quantity exceeds available stock.");
//       console.log("⚠️ Quantity exceeds stock");
//       return;
//     }

//     // 🔄 Update stock quantity
    

//     // ✅ Save Sale Item
//     const SaveSaleScuccess = await saveSaleItem({
//       stockItemId: stockItemId,
//       name: stockItem.name,
//       quantity: qty,
//       price: Number(price),
//       date: new Date().toISOString(),
//       buyerName,
//       paid,
//     });

//     if (SaveSaleScuccess) {
//       const newQuantity = stockItem.quantity - qty;
//       const updateSuccess = await updateStockQuantity(stockItemId, newQuantity);
//       if (!updateSuccess) {
//         Alert.alert("Error", "Failed to update stock quantity.");
//       return;
//       }
//     }

//     console.log("✅ Sale Item saved successfully.");
//     Alert.alert("Success", "Sale item recorded successfully.");
//     // router.replace('../../(tabs)/saleList');
//   } catch (error) {
//     console.error("❌ Error during sale save:", error.message);
//     Alert.alert("Error", "Failed to record sale item.");
//   }
// };

//   return (
//     <ScreenWrapper>
//     <SafeAreaView style={{ flex: 1 }}>
//     <ScrollView contentContainerStyle={{ padding: 20 }}>
//       {/* <Text style={{ fontSize: 18, marginBottom: 10 }}>Record Sale</Text> */}

//       <Text>Item Name:</Text>
//       <Picker
//         selectedValue={stockItemId}
//         onValueChange={(value) => {
//           console.log("🔄 Picker Value Changed:", value);
//           setStockItemId(value);
//         }}
//         style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
//       >
//         <Picker.Item label="Select an item" value="" />
//         {stockItems.map((item) => (
//           <Picker.Item key={item.id} label={item.name} value={item.id} />
//         ))}
//       </Picker>

//       <Text>Buyer Name:</Text>
//       <TextInput
//         value={buyerName}
//         onChangeText={setBuyerName}
//         style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 8 }}
//       />

//       <Text>Quantity:</Text>
//       <TextInput
//         value={String(quantity)}
//         onChangeText={(value) => setQuantity(Number(value))}
//         keyboardType="numeric"
//         style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 8 }}
//       />

//       <Text>Price:</Text>
//       <TextInput
//         value={String(price)}
//         onChangeText={(value) => setPrice(Number(value))}
//         keyboardType="numeric"
//         style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 8 }}
//       />

//       {/* ✅ Switch to toggle Paid status */}
//       <View style={styles.switchContainer}>
//         <Text style={styles.switchLabel}>Paid:</Text>
//         <Switch value={paid} onValueChange={setPaid} />
//       </View>

//       <TouchableOpacity
//         style={styles.recordButton} onPress={handleSave}
//       >
//         <Text style={styles.recordButtonText}>Save Sale</Text>
//       </TouchableOpacity>

//     </ScrollView>
//   </SafeAreaView>
//   </ScreenWrapper>
// );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 5,
//     fontWeight: '500',
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   switchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   switchLabel: {
//     marginRight: 10,
//     fontSize: 16,
//   },
//   picker: {
//     height: 50,
//     marginBottom: 15,
//   },
//   // recordButton: {
//   //   position: 'absolute',
//   //   top: 20,
//   //   right: 20,
//   //   backgroundColor: '#007BFF',
//   //   borderRadius: 30,
//   //   paddingVertical: 15,
//   //   paddingHorizontal: 20,
//   //   elevation: 2,
//   // },
//   recordButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   // buttonContainer: {
//   //   width: '80%',
//   //   gap: 15,
//   // },
//   recordButton: {
//     marginTop: 20,
//     backgroundColor: '#4CAF50',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
// });

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
  Switch,
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
  const [paid, setPaid] = useState(false);
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#fff' : '#333';
  const bgColor = isDark ? '#1e1e1e' : '#f9f9f9';
  const borderColor = isDark ? '#555' : '#ccc';
  

  // ✅ Fetch stock items
  useEffect(() => {
    const fetchStockItems = async () => {
      const items = await getStockItems();
      setStockItems(items || []);
    };
    fetchStockItems();
  }, []);

  // ✅ Save Sale
  const handleSave = async () => {
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

    if (!stockItemId || quantity === '' || price === '' || !buyerName) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      Alert.alert("Error", "Quantity must be a positive integer.");
      return;
    }

    try {
      const stockItem = stockItems.find((item) => item.id === stockItemId);
      if (!stockItem) {
        Alert.alert("Error", "Selected stock item not found.");
        return;
      }

      if (quantity > stockItem.quantity) {
        Alert.alert("Error", "Quantity exceeds available stock.");
        return;
      }

      // ✅ Save sale record
      await saveSaleItem({
        stockItemId,
        name: itemName,
        quantity,
        price,
        date: new Date().toISOString(),
        buyerName,
        paid,
      });

      // ✅ Update stock
      const newQuantity = stockItem.quantity - quantity;
      await updateStockQuantity(stockItemId, newQuantity);

      Alert.alert("✅ Success", "Sale recorded successfully.");
      router.replace('../../(tabs)/saleList');
    } catch (error) {
      console.error("❌ Failed to save sale item:", error);
      Alert.alert("Error", "Failed to record sale.");
    }
  };

  return (
    <ScreenWrapper>
      <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.form}>
         {/* 🧾 Stock Item Dropdown */}
          <Dropdown
            style={[styles.dropdown, { borderColor: '#ccc' }]}
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
              if (selectedItem) {
                setItemName(selectedItem.name); // if you’re storing it
              }
            }}
          />


          {/* ✅ Input Fields */}
          <Text style={[styles.label]}>Buyer Name</Text>
          <TextInput
            value={buyerName}
            onChangeText={setBuyerName}
            style={[styles.input]}
            placeholder="Enter buyer name"
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          />

          <Text style={[styles.label]}>Quantity</Text>
          <TextInput
            value={quantity === '' ? '' : String(quantity)}
            onChangeText={(val) => setQuantity(val === '' ? '' : parseInt(val))}
            keyboardType="numeric"
            style={[styles.input]}
            placeholder="Enter quantity"
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          />

          <Text style={[styles.label]}>Price</Text>
          <TextInput
            value={price === '' ? '' : String(price)}
            onChangeText={(val) => setPrice(val === '' ? '' : parseFloat(val))}
            keyboardType="numeric"
            style={[styles.input]}
            placeholder="Enter price"
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          />

          {/* ✅ Paid Switch */}
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel]}>Paid:</Text>
            <Switch value={paid} onValueChange={setPaid} />
          </View>

          {/* ✅ Save Button */}
          <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Save Sale</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  label: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 5},
  stockListContainer: {
    borderWidth: 4,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    
  },
  stockItem: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  stockItemSelected: {
    backgroundColor: '#4CAF50',
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#ccc',
    fontWeight: '600'
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  switchLabel: {
    marginRight: 10,
    fontSize: 18,
    fontWeight: '600'
  },
  gradientButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.27)",
    borderRadius: 16,
    padding: 20,
  }, 
});

export default RecordSale;
