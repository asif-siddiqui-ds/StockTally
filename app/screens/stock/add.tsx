// import ScreenWrapper from '@/components/ScreenWrapper';
// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
// import { StockItem, saveStockItem } from '../../../lib/storage';

// const AddStockItem: React.FC = () => {
//   const [category, setCategory] = useState('');
//   const [name, setName] = useState('');
//   const [quantity, setQuantity] = useState(0);

//   const handleSave = async () => {
//     // Create a new item **without the id field**
//     const newItem: Omit<StockItem, 'id'> = {
//       category,
//       name,
//       quantity,
//       date: new Date().toISOString(), // Ensure date is in ISO format
//     };

//     try {
//       await saveStockItem(newItem);
//       Alert.alert("Stock Item Added Successfully");
//       router.push('../(tabs)/stockList');
//     } catch (error: any) {
//       console.error("Failed to add Stock Item:", error.message);
//       Alert.alert("Failed to Add Stock Item");
//     }
//   };

//   return (
//     <ScreenWrapper>
//     <View style={styles.container}>
//       <TextInput placeholder="Category" onChangeText={setCategory} style={styles.input} />
//       <TextInput placeholder="Name" onChangeText={setName} style={styles.input} />
//       <TextInput
//         placeholder="Quantity"
//         keyboardType="numeric"
//         onChangeText={(text) => setQuantity(Number(text))}
//         style={styles.input}
//       />
//       <Button title="Save" onPress={handleSave} />
//     </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
// });

// export default AddStockItem;

// import ScreenWrapper from '@/components/ScreenWrapper';
// import { isGuest } from '@/utils/guest';
// import { Picker } from '@react-native-picker/picker';
// import { router } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   Button,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   TextInput
// } from 'react-native';
// import {
//   StockItem,
//   getStockItems,
//   saveStockItem,
//   updateStockItem,
// } from '../../../lib/storage';

// const AddStockItem: React.FC = () => {
//   // State variables
//   const [category, setCategory] = useState('');
//   const [name, setName] = useState('');
//   const [quantity, setQuantity] = useState(0);
//   const [stockItems, setStockItems] = useState<StockItem[]>([]);
//   const [selectedItemId, setSelectedItemId] = useState('');
//   const [selectedCategoryId, setSelectedCategoryId] = useState('');

//   // Fetch existing stock items
//   useEffect(() => {
//     const fetchStockItems = async () => {
//       const items = await getStockItems();
//       if (items) {
//         setStockItems(items);
//       }
//     };

//     fetchStockItems();
//   }, []);

//   // Handle Save Logic
//   const handleSave = async () => {
//     if (await isGuest()) {
//       const stock = await getStockItems();
//       if (stock.length >= 10) {
//         Alert.alert(
//           "Limit Reached",
//           "Free plan allows up to 10 stock items. Upgrade to Pro for unlimited.",
//           [
//             { text: "Cancel", style: "cancel" },
//             { text: "Upgrade", onPress: () => router.push('/paywall') }
//           ]
//         );
//         return;
//       }
//     }
//   if (quantity <= 0) {
//     Alert.alert('Validation Error', 'Quantity must be a positive integer.');
//     return;
//   }

//   if (name.trim() === '') {
//     Alert.alert('Validation Error', 'Name cannot be empty.');
//     return;
//   }

//   if (category.trim() === '') {
//     Alert.alert('Validation Error', 'Category cannot be empty.');
//     return;
//   }

//   try {

//     if (selectedItemId) {
//       // ✅ Update existing stock item
//       const existingItem = stockItems.find((item) => item.id === selectedItemId);
      
//       if (existingItem) {
//         await updateStockItem(selectedItemId, {
//           quantity: existingItem.quantity + quantity,
//           category: existingItem.category,
//         });

//         Alert.alert('Stock Item Updated Successfully');
//       }
//     } else {
//       // ✅ Create a new item without needing an ID
//       await saveStockItem({
//         category,
//         name,
//         quantity,
//         date: new Date().toISOString(),
//       });
//       Alert.alert('Stock Item Added Successfully');
//     }
//     // Redirect to stock list
//     router.replace("/(tabs)/stockList");

//   } catch (error: any) {
//     console.error('Failed to save Stock Item:', error.message);
//     Alert.alert('Failed to save Stock Item');
//   }
// };


//   return (
//     <ScreenWrapper>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={{ padding: 20 }}>
//         <Picker
//           selectedValue={selectedItemId}
//           onValueChange={(value) => {
//             setSelectedItemId(value);

//             if (value !== '') {
//               const selectedItem = stockItems.find((item) => item.id === value);
//               if (selectedItem) {
//                 setName(selectedItem.name);
//                 setCategory(selectedItem.category);
//                 setQuantity(0); // Reset the quantity to avoid confusion
//               }
//             } else {
//               // If "New Item" is selected, reset inputs
//               setName('');
//               setCategory('');
//               setQuantity(0);
//             }
//           }}
//           style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
//         >
//           <Picker.Item label="New Stock Item" value="" />
//           {stockItems.map((item) => (
//             <Picker.Item key={item.id} label={item.name} value={item.id} />
//           ))}
//         </Picker>
//         <Picker
//           selectedValue={selectedCategoryId}
//           onValueChange={(value) => {
//             setSelectedCategoryId(value);
//             if (value !== '') {
//               const selectedCatItem = stockItems.find((item) => item.id === value);
//               if (selectedCatItem) {
//                 setCategory(selectedCatItem.category);
//                 setName(''); // Reset name if category chosen separately
//                 setQuantity(0);
//               }
//             }
//           }}
//           style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
//         >
//         <Picker.Item label="New Category" value="" />
//         {stockItems.map((item) => (
//           <Picker.Item key={item.id} label={item.category} value={item.id} />
//         ))}
//         </Picker>

//         <TextInput
//           placeholder="Category"
//           value={category}
//           onChangeText={setCategory}
//           style={styles.input}
//           editable={!selectedItemId} // Disable if an item is selected
//         />

//         <TextInput
//           placeholder="Name"
//           value={name}
//           onChangeText={setName}
//           style={styles.input}
//           editable={!selectedItemId} // Disable if an item is selected
//         />

//         <TextInput
//           placeholder="Quantity"
//           keyboardType="numeric"
//           onChangeText={(text) => setQuantity(Number(text))}
//           value={String(quantity)}
//           style={styles.input}
//         />

//         <Button title={selectedItemId ? "Update Stock" : "Add Stock"} onPress={handleSave} />
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


// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     padding: 20,
// //   },
// //   input: {
// //     height: 40,
// //     borderColor: '#ccc',
// //     borderWidth: 1,
// //     marginBottom: 15,
// //     paddingHorizontal: 10,
// //     borderRadius: 5,
// //   },
// // });

// export default AddStockItem;

import ScreenWrapper from '@/components/ScreenWrapper';
import { isGuest } from '@/utils/guest';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import {
  getStockItems,
  saveStockItem,
  StockItem,
  updateStockItem,
} from '../../../lib/storage';

const AddStockItem: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#fff' : '#333';
  const bgColor = isDark ? '#1e1e1e' : '#f9f9f9';
  const borderColor = isDark ? '#555' : '#ccc';

  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Fetch existing stock items
  useEffect(() => {
    const fetchStockItems = async () => {
      const items = await getStockItems();
      if (items) setStockItems(items);
    };
    fetchStockItems();
  }, []);

  // Handle Save Logic
  const handleSave = async () => {
    if (await isGuest()) {
      const stock = await getStockItems();
      if (stock.length >= 10) {
        Alert.alert(
          'Limit Reached',
          'Free plan allows up to 10 stock items. Upgrade to Pro for unlimited.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/paywall') },
          ]
        );
        return;
      }
    }

    if (quantity <= 0) {
      Alert.alert('Validation Error', 'Quantity must be a positive integer.');
      return;
    }
    if (name.trim() === '') {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }
    if (category.trim() === '') {
      Alert.alert('Validation Error', 'Category cannot be empty.');
      return;
    }

    try {
      if (selectedItemId !== 'new') {
        const existingItem = stockItems.find((item) => item.id === selectedItemId);
        if (existingItem) {
          await updateStockItem(selectedItemId, {
            quantity: existingItem.quantity + quantity,
            category: existingItem.category,
          });
          Alert.alert('Stock Item Updated Successfully');
        }
      } else {
        await saveStockItem({
          category,
          name,
          quantity,
          date: new Date().toISOString(),
        });
        Alert.alert('Stock Item Added Successfully');
      }
      router.replace('/(tabs)/stockList');
    } catch (error: any) {
      console.error('Failed to save Stock Item:', error.message);
      Alert.alert('Failed to save Stock Item');
    }
  };

  return (
    <ScreenWrapper>
      {/* <LinearGradient colors={["#6583a4ff", "#1b263b", "#415a77"]} style={styles.gradient}> */}
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container]}>
         {/* 🔹 Stock Item Dropdown */}
         <View style={styles.form}>
          <Text style={[styles.label]}>Item</Text>
          <Dropdown
            style={[styles.dropdown, { borderColor }]}
            data={[
              { label: '➕ Add New Stock Item', value: 'new' },
              ...stockItems.map((item) => ({
                label: item.name,
                value: item.id,
              })),
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Stock Item"
            value={selectedItemId}
            onChange={(item) => {
              setSelectedItemId(item.value);

              if (item.value !== 'new' && item.value !== '') {
                const selectedItem = stockItems.find((s) => s.id === item.value);
                if (selectedItem) {
                  setName(selectedItem.name);
                  setCategory(selectedItem.category);
                  setSelectedCategoryId(selectedItem.category);
                  setQuantity(0);
                }
              } else {
                setName('');
                setCategory('');
                setSelectedCategoryId('');
                setQuantity(0);
              }
            }}
          />

          {/* ✏️ Show only when “Add New Stock Item” selected */}
          {selectedItemId === 'new' && (
            <>
              <TextInput
                placeholder="Enter item name"
                placeholderTextColor='#ccc'
                value={name}
                onChangeText={setName}
                style={[styles.input]}
              />
            </>
          )}

          {/* 🔹 Category Dropdown */}
          <Text style={[styles.label]}>Category</Text>
          <Dropdown
            style={[styles.dropdown, { borderColor }]}
            data={[
              { label: '➕ Add New Category', value: 'new' },
              ...Array.from(new Set(stockItems.map((item) => item.category))).map((cat) => ({
                label: cat,
                value: cat,
              })),
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Category"
            value={selectedCategoryId}
            onChange={(item) => {
              setSelectedCategoryId(item.value);
              if (item.value !== 'new') {
                setCategory(item.value);
              } else {
                setCategory('');
              }
            }}
          />

          {/* ✏️ Show only when “Add New Category” selected */}
          {selectedCategoryId === 'new' && (
            <>
              <TextInput
                placeholder="Enter new category"
                placeholderTextColor='#ccc'
                value={category}
                onChangeText={setCategory}
                style={[styles.input]}
              />
            </>
          )}

          <Text style={[styles.label]}>Quantity</Text>
          <TextInput
            placeholder="Enter quantity"
            placeholderTextColor='#ccc'
            keyboardType="numeric"
            value={String(quantity)}
            onChangeText={(text) => setQuantity(Number(text))}
            style={[styles.input]}
          />
         

          {/* Gradient Button */}
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <LinearGradient
              colors={selectedItemId ? ['#4CAF50', '#45A049'] : ['#0275d8', '#025aa5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                {selectedItemId !== 'new' ? 'Update Stock' : 'Add Stock'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* </LinearGradient> */}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    padding: 20,
    gap: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  dropdown: {
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 15,
  },
  button: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    marginTop: 20,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
    form: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
  },
});

export default AddStockItem;
