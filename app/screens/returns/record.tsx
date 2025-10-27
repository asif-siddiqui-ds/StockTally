// import ScreenWrapper from '@/components/ScreenWrapper';
// import { Picker } from '@react-native-picker/picker';
// import { router } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   Button,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   TextInput,
//   useColorScheme,
// } from 'react-native';
// import {
//   getStockItems,
//   saveReturnItem,
//   updateStockQuantity,
// } from '../../../lib/storage';


// const RecordReturnScreen: React.FC = () => {
//   const [selectedItemId, setSelectedItemId] = useState('');
//   const [stockItems, setStockItems] = useState<StockItem[]>([]);
//   const [name, setName] = useState('');
//   const [quantity, setQuantity] = useState(0);
//   const [reason, setReason] = useState('');
//   const scheme = useColorScheme();

//   const colorScheme = useColorScheme(); // ✅ detect dark/light mode
//   const textColor = colorScheme === 'dark' ? '#fff' : '#000'; // ✅ adapt text
//   const bgColor = colorScheme === 'dark' ? '#222' : '#fff'; // ✅ adapt field background
    


//   // Fetch stock items
//   useEffect(() => {
//     const fetchStock = async () => {
//       const items = await getStockItems();
//       if (items) setStockItems(items);
//     };
//     fetchStock();
//   }, []);

//   const handleSave = async () => {
//   if (!selectedItemId || quantity <= 0 || reason.trim() === '') {
//     Alert.alert("Error", "Please fill all fields.");
//     return;
//   }

//   try {
//     const stockItem = stockItems.find((item) => item.id === selectedItemId);
//     if (!stockItem) {
//       Alert.alert("Error", "Stock item not found.");
//       return;
//     }

//     // ✅ Ask the user if they want to adjust stock
//     Alert.alert(
//       "Adjust Stock?",
//       "Do you want to reduce stock quantity for this return?",
//       [
//         {
//           text: "No",
//           onPress: async () => {
//             // 🚫 Do not adjust stock, just save return
//             await saveReturnItem({
//               stockItemId: stockItem.id,
//               name: stockItem.name,
//               quantity,
//               reason,
//               date: new Date().toISOString(),
//             });

//             if (quantity > stockItem.quantity) {
//               Alert.alert("Error", `Not enough stock. Available: ${stockItem.quantity}`);
//               return;
//             }

//             Alert.alert("Success", "Return recorded (stock unchanged).");
//             router.replace("/(tabs)/returnsList");
//           },
//           style: "cancel",
//         },
//         {
//           text: "Yes",
//           onPress: async () => {
//             // ✅ Adjust stock (subtract quantity)
//             if (quantity > stockItem.quantity) {
//               Alert.alert("Error", `Not enough stock. Available: ${stockItem.quantity}`);
//               return;
//             }

//             await updateStockQuantity(stockItem.id, stockItem.quantity - quantity);

//             await saveReturnItem({
//               stockItemId: stockItem.id,
//               name: stockItem.name,
//               quantity,
//               reason,
//               date: new Date().toISOString(),
//             });

//             Alert.alert("Success", "Return recorded and stock updated.");
//             router.replace("/(tabs)/returnsList");
//           },
//         },
//       ]
//     );
//   } catch (error: any) {
//     console.error("❌ Error saving return:", error);
//     Alert.alert("Error", "Failed to save return record.");
//   }
// };



//   return (
//     <ScreenWrapper>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={{ padding: 20 }}>
//           <Picker
//             selectedValue={selectedItemId}
//             onValueChange={(value) => {
//               setSelectedItemId(value);
//               if (value) {
//                 const selected = stockItems.find((i) => i.id === value);
//                 if (selected) setName(selected.name);
//               } else {
//                 setName('');
//               }
//             }}
//             style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 15 }}
//           >
//             <Picker.Item style={[{ color: textColor }]} label="Select Stock Item" value="" />
//             {stockItems.map((item) => (
//               <Picker.Item key={item.id} label={item.name} value={item.id} />
//             ))}
//           </Picker>

//           <TextInput
//             placeholder="Quantity"
//             placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
//             keyboardType="numeric"
//             onChangeText={(text) => setQuantity(Number(text))}
//             value={quantity ? String(quantity) : ''}
//             style={[styles.input, { color: textColor, backgroundColor: bgColor }]}
//           />

//           <TextInput
//             placeholder="Reason (e.g., Damaged, Returned)"
//             placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
//             value={reason}
//             onChangeText={setReason}
//             style={styles.input}
//           />

//           <Button title="Save Return" onPress={handleSave} />
//         </ScrollView>
//       </SafeAreaView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
// });

// export default RecordReturnScreen;

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getStockItems,
  saveReturnItem,
  updateStockQuantity,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const RecordReturnScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#fff' : '#333';
  const bgColor = isDark ? '#1e1e1e' : '#f9f9f9';
  const borderColor = isDark ? '#555' : '#ccc';

  const [stockItems, setStockItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");


  // ✅ Fetch stock items
  useEffect(() => {
    const fetchStock = async () => {
      const items = await getStockItems();
      if (items) setStockItems(items);
    };
    fetchStock();
  }, []);

  // ✅ Save logic
  const handleSave = async () => {
    if (!selectedItemId || quantity === "" || !reason.trim()) {
      Alert.alert("Error", "Please fill all fields before saving.");
      return;
    }

    const stockItem = stockItems.find((item) => item.id === selectedItemId);
    if (!stockItem) {
      Alert.alert("Error", "Selected stock item not found.");
      return;
    }

    if (quantity > stockItem.quantity) {
      Alert.alert("Error", `Not enough stock. Available: ${stockItem.quantity}`);
      return;
    }

    Alert.alert(
      "Adjust Stock?",
      "Do you want to adjust stock quantity for this return?",
      [
        {
          text: "No",
          style: "cancel",
          onPress: async () => {
            await saveReturnItem({
              stockItemId: stockItem.id,
              name: stockItem.name,
              quantity,
              reason,
              date: new Date().toISOString(),
            });
            Alert.alert("Success", "Return recorded (stock unchanged).");
            router.replace("/(tabs)/returnsList");
          },
        },
        {
          text: "Decrease",
          onPress: async () => {
            await updateStockQuantity(stockItem.id, stockItem.quantity - quantity);
            await saveReturnItem({
              stockItemId: stockItem.id,
              name: stockItem.name,
              quantity,
              reason,
              date: new Date().toISOString(),
            });
            Alert.alert("Success", "Return recorded and stock updated.");
            router.replace("/(tabs)/returnsList");
          },
        },
        {
          text: "Increase",
          onPress: async () => {
            await updateStockQuantity(stockItem.id, stockItem.quantity + quantity);
            await saveReturnItem({
              stockItemId: stockItem.id,
              name: stockItem.name,
              quantity,
              reason,
              date: new Date().toISOString(),
            });
            Alert.alert("Success", "Return recorded and stock updated.");
            router.replace("/(tabs)/returnsList");
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
           {/* 🧾 Stock Item Dropdown */}
          <Dropdown
            style={[styles.dropdown, { borderColor }]}
            data={stockItems.map((item) => ({
              label: `${item.name} (${item.quantity} in stock)`,
              value: item.id,
            }))}
            labelField="label"
            valueField="value"
            placeholder="Select Stock Item"
            value={selectedItemId}
            onChange={(item) => {
              setSelectedItemId(item.value);
              const selectedItem = stockItems.find((s) => s.id === item.value);
              
            }}
          />
          {/* ✅ Quantity Input */}
          <Text style={[styles.label]}>Quantity</Text>
          <TextInput
            value={quantity === "" ? "" : String(quantity)}
            onChangeText={(text) => setQuantity(text === "" ? "" : parseInt(text))}
            keyboardType="numeric"
            style={[styles.input]}
            placeholder="Enter quantity"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
          />

          {/* ✅ Reason Input */}
          <Text style={[styles.label]}>Reason for Return</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            style={[
              styles.input,
              { height: 80 },
            ]}
            placeholder="Enter reason (e.g., Damaged, Returned)"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
            multiline
          />

          {/* ✅ Save Button */}
          <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
            <LinearGradient
              colors={["#4CAF50", "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Save Return</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    gap: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  stockListContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
  },
  stockItem: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  stockItemSelected: {
    backgroundColor: "#4CAF50",
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  gradientButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
    dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default RecordReturnScreen;
