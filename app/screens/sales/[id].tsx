// import LockedScreen from '@/components/LockedScreen';
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useProUser } from '@/lib/ProUserContext';
// import { deleteSaleItem, getSaleItem, getStockItem, updateSaleItem, updateStockQuantity } from '@/lib/storage';
// import * as Print from 'expo-print';
// import { useRouter } from 'expo-router';
// import { useSearchParams } from 'expo-router/build/hooks';
// import * as Sharing from 'expo-sharing';
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
//   View
// } from 'react-native';
// import { getCompanyProfile } from '@/lib/storage';
// import { useAuth } from '@/context/AuthContext'; // so we get current user


// const EditSaleRecord = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const id = searchParams.get('id');

//   const { isProUser, loading } = useProUser();
//   if (loading) return null;
//   if (!isProUser) return <LockedScreen />; // 🔒 Entire screen is Pro-only


//   // 🚀 State Variables
//   const [stockItemId, setStockItemId] = useState('');
//   const [name, setName] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [originalQuantity, setOriginalQuantity] = useState(0);
//   const [price, setPrice] = useState('');
//   const [buyerName, setBuyerName] = useState('');
//   const [paid, setPaid] = useState(false);
//   const [stockQuantity, setStockQuantity] = useState(0);
//   const [saleDate, setSaleDate] = useState('');

//   // 🔄 Load the sale record and associated stock item
//   useEffect(() => {
//     const loadSaleRecord = async () => {
//       if (id) {
//         try {
//           const sale = await getSaleItem(id as string);
//           console.log("✅ Fetched Sale Record:", sale);
//           if (sale) {
//             setName(sale.name);
//             setStockItemId(sale.stockItemId);
//             setQuantity(String(sale.quantity));
//             setOriginalQuantity(sale.quantity);
//             setPrice(String(sale.price));
//             setBuyerName(sale.buyerName);
//             setPaid(sale.paid);
//             setSaleDate(new Date(sale.date).toLocaleDateString());

//             // 🔍 Fetch the associated stock item
//             const stockItem = await getStockItem(sale.stockItemId);
//             if (stockItem) {
//               console.log("✅ Fetched Stock Item:", stockItem);
//               setStockQuantity(stockItem.quantity);
//             } else {
//               Alert.alert("Error", "Stock item not found.");
//             }
//           }
//         } catch (error) {
//           console.error("❌ Error loading sale record:", error.message);
//           Alert.alert("Error", "Failed to load sale record.");
//         }
//       }
//     };

//     loadSaleRecord();
//   }, [id]);

//   // ✅ Handle Save Logic
//   const handleSave = async () => {
//     if (!quantity || !price || !buyerName) {
//       Alert.alert("Error", "Please fill all the fields.");
//       return;
//     }

//     if (!/^[1-9]\d*$/.test(quantity)) {
//       Alert.alert("Error", "Quantity must be a positive integer.");
//       return;
//     }

//     try {
      

//         console.log("🚀 Starting Update Process...");
//         const newQuantity = parseInt(quantity);

//       if(stockQuantity){

//         // 🔄 Update Stock Quantity
//         const quantityDifference = newQuantity - originalQuantity;
//         const adjustedStockQuantity = stockQuantity - quantityDifference;

//         if (adjustedStockQuantity < 0) {
//           Alert.alert(
//             "Error",
//             `Not enough stock. Available: ${stockQuantity}`
//           );
//           return;
//         }

//         const stockUpdateSuccess = await updateStockQuantity(stockItemId, adjustedStockQuantity);

//         if (!stockUpdateSuccess) {
//           Alert.alert("Error", "Failed to update stock quantity.");
//           return;
//         }
//       }

//       // ✅ Update Sale Record
//       await updateSaleItem(id as string, {
//         name,
//         stockItemId,
//         quantity: newQuantity,
//         price: Number(price),
//         buyerName,
//         paid,
//       });

//       console.log("✅ Sale Record updated successfully.");
//       Alert.alert("Success", "Sale record updated successfully.");
//       router.replace('../../(tabs)/saleList');
//     } catch (error) {
//       console.error("❌ Error during update:", error.message);
//       Alert.alert("Error", "Failed to update sale record.");
//     }
//   };
//   const { user } = useAuth();
//   // 🖨️ Print invoice with company branding
//   const handlePrint = async () => {
//     try {
//       let profile = null;
//       if (user) {
//         profile = await getCompanyProfile(user.$id);
//       }
//     const companyName = profile?.companyName || "My Business";
//     const address = profile?.address || "123 Default Street";
//     const phone = profile?.phone || "000-000-0000";
//     const logoUrl = profile?.logo ? `https://cloud.appwrite.io/v1/storage/buckets/${YOUR_BUCKET_ID}/files/${profile.logo}/view?project=${YOUR_PROJECT_ID}` : null;

//     const html = `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             h1 { text-align: center; }
//             .details { margin-bottom: 20px; }
//             .details p { margin: 5px 0; }
//             table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
//             th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
//             th { background-color: #4CAF50; color: white; }
//             .logo { width: 100px; height: auto; margin-bottom: 15px; }
//           </style>
//         </head>
//         <body>
//            ${logoUrl ? `<div class="logo"><img src="${logoUrl}" width="120"/></div>` : ""}
//           <h1>Sale Invoice</h1>
//           <div class="details">
//             <p><strong>Company:</strong> ${companyName}</p>
//             <p><strong>Address:</strong> ${address}</p>
//             <p><strong>Phone:</strong> ${phone}</p>
//             <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
//             <p><strong>Sale Date:</strong> ${saleDate}</p>
//             <p><strong>Buyer:</strong> ${buyerName}</p>
//           </div>
//           <table>
//             <tr>
//               <th>Item Name</th>
//               <th>Quantity</th>
//               <th>Unit Price (£)</th>
//               <th>Total (£)</th>
//             </tr>
//             <tr>
//               <td>${name}</td>
//               <td>${quantity}</td>
//               <td>£${parseFloat(price).toFixed(2)}</td>
//               <td>£${(parseFloat(price) * parseInt(quantity)).toFixed(2)}</td>
//             </tr>
//           </table>
//           <h3>Total Amount: £${(parseFloat(price) * parseInt(quantity)).toFixed(2)}</h3>
//         </body>
//       </html>
//     `;

//     const { uri } = await Print.printToFileAsync({ html });
//     await Sharing.shareAsync(uri);
//   };

//   const handleDelete = () => {
//   Alert.alert(
//     "Confirm Deletion",
//     "Are you sure you want to delete this sale record?",
//     [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {

//             if(stockQuantity) {
//               const restoredStock = stockQuantity + originalQuantity;
//               const stockUpdated = await updateStockQuantity(stockItemId, restoredStock);
//               if (!stockUpdated) {
//                 Alert.alert("Error", "Failed to restore stock quantity.");
//                 return;
//               }
//             }

//             const deleted = await deleteSaleItem(id as string);
//             if (!deleted) {
//               Alert.alert("Error", "Failed to delete sale record.");
//               return;
//             }

//             Alert.alert("Success", "Sale record deleted.");
//             router.replace('../../(tabs)/saleList');
//           } catch (error) {
//             console.error("❌ Deletion Error:", error);
//             Alert.alert("Error", "Something went wrong during deletion.");
//           }
//         },
//       },
//     ]
//   );
// };


//   return (
//     <ScreenWrapper>
//       <SafeAreaView>
//       <ScrollView>
//         <View style={styles.container}>
//           <Text style={styles.label}>Item Name:</Text>
//           <TextInput
//             style={styles.input}
//             value={name}
//             editable={false}
//           />

//           <Text style={styles.label}>Quantity:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter quantity"
//             value={quantity}
//             keyboardType="numeric"
//             onChangeText={setQuantity}
//           />

//           <Text style={styles.label}>Price:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter price"
//             value={price}
//             keyboardType="numeric"
//             onChangeText={setPrice}
//           />

//           <Text style={styles.label}>Buyer Name:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter buyer's name"
//             value={buyerName}
//             onChangeText={setBuyerName}
//           />

//           <View style={styles.switchContainer}>
//             <Text style={styles.switchLabel}>Paid:</Text>
//             <Switch value={paid} onValueChange={setPaid} />
//           </View>

//           <View style={styles.buttonContainer}>
//             <TouchableOpacity style={styles.button} onPress={handleSave}>
//               <Text style={styles.buttonText}>Update Record</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
//               <Text style={styles.buttonText}>Delete Record</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={{ marginVertical: 10 }} onPress={handleDelete}>
//               <Text style={styles.buttonText}>Edit Company Profile</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
//               <Text style={styles.buttonText}>Print Record</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//       </SafeAreaView>
//     </ScreenWrapper>
//   );
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
//   buttonContainer: {
//     width: '80%',
//     gap: 15,
//   },
//   button: {
//     backgroundColor: '#4CAF50',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     marginTop: 10,
    
//   },
//   deleteButton: {
//     backgroundColor: '#FF0000',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     marginTop: 10,
    
//   },
//   printButton: {
//     backgroundColor: '#0000FF',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     marginTop: 10,
    
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default EditSaleRecord;

// import LockedScreen from '@/components/LockedScreen';
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import { useProUser } from '@/lib/ProUserContext';
// import {
//   deleteSaleItem,
//   getCompanyProfile,
//   getSaleItem,
//   getStockItem,
//   updateSaleItem,
//   updateStockQuantity
// } from '@/lib/storage';
// import * as Print from 'expo-print';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import * as Sharing from 'expo-sharing';
// import React, { useEffect, useState } from 'react';

// import {
//   ActivityIndicator,
//   Alert,
//   Button,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';

// const EditSaleRecord: React.FC = () => {
//   const params = useLocalSearchParams();
//   const id = params.id as string | undefined;
//   const router = useRouter();
//   const { user } = useAuth();
//   const { isProUser, loading } = useProUser();

//   // 🔒 Auth check
//   if (!user) {
//     router.replace('./auth/login'); // send to login if not logged in
//     return null;
//   }

//   // 🔒 Pro check
//   if (loading) return <ActivityIndicator />;
//   if (!isProUser) return <LockedScreen />;
  
//   // 🚀 State Variables
//   const [stockItemId, setStockItemId] = useState('');
//   const [name, setName] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [originalQuantity, setOriginalQuantity] = useState(0);
//   const [price, setPrice] = useState('');
//   const [buyerName, setBuyerName] = useState('');
//   const [paid, setPaid] = useState(false);
//   const [stockQuantity, setStockQuantity] = useState(0);
//   const [saleDate, setSaleDate] = useState('');



//   // 🔄 Load the sale record and associated stock item
//   useEffect(() => {
//     const loadSaleRecord = async () => {
//       if (id) {
//         try {
//           const sale = await getSaleItem(id as string);
//           if (sale) {
//             setName(sale.name);
//             setStockItemId(sale.stockItemId);
//             setQuantity(String(sale.quantity));
//             setOriginalQuantity(sale.quantity);
//             setPrice(String(sale.price));
//             setBuyerName(sale.buyerName);
//             setPaid(sale.paid);
//             setSaleDate(new Date(sale.date).toLocaleDateString());

//             // 🔍 Fetch the associated stock item
//             const stockItem = await getStockItem(sale.stockItemId);
//             if (stockItem) {
//               setStockQuantity(stockItem.quantity);
//             } else {
//               Alert.alert("Error", "Stock item not found.");
//             }
//           }
//         } catch (error: any) {
//           console.error("❌ Error loading sale record:", error.message);
//           Alert.alert("Error", "Failed to load sale record.");
//         }
//       }
//     };

//     loadSaleRecord();
//   }, [id]);

//   // ✅ Handle Save Logic
//   const handleSave = async () => {
//     if (!quantity || !price || !buyerName) {
//       Alert.alert("Error", "Please fill all the fields.");
//       return;
//     }

//     if (!/^[1-9]\d*$/.test(quantity)) {
//       Alert.alert("Error", "Quantity must be a positive integer.");
//       return;
//     }

//     try {
//       const newQuantity = parseInt(quantity);
//       const quantityDifference = newQuantity - originalQuantity;
//       const adjustedStockQuantity = stockQuantity - quantityDifference;

//       if (adjustedStockQuantity < 0) {
//         Alert.alert("Error", `Not enough stock. Available: ${stockQuantity}`);
//         return;
//       }

//       const stockUpdateSuccess = await updateStockQuantity(stockItemId, adjustedStockQuantity);

//       if (!stockUpdateSuccess) {
//         Alert.alert("Error", "Failed to update stock quantity.");
//         return;
//       }

//       await updateSaleItem(id as string, {
//         name,
//         stockItemId,
//         quantity: newQuantity,
//         price: Number(price),
//         buyerName,
//         paid,
//       });

//       Alert.alert("Success", "Sale record updated successfully.");
//       router.push("/screens/sales/saleList"); // go back to sale list
//     } catch (error: any) {
//       console.error("❌ Error during update:", error.message);
//       Alert.alert("Error", "Failed to update sale record.");
//     }
//   };

//   // 🗑️ Handle Delete
//   const handleDelete = async () => {
//     try {
//       await deleteSaleItem(id as string);
//       Alert.alert("Deleted", "Sale record deleted successfully.");
//       router.push("/screens/sales/saleList");
//     } catch (error: any) {
//       console.error("❌ Error deleting sale record:", error.message);
//       Alert.alert("Error", "Failed to delete sale record.");
//     }
//   };

//   // 🧾 Handle Print Invoice with Company Branding
//   const handlePrint = async () => {
//     try {
//       let profile = null;
//       if (user) {
//         profile = await getCompanyProfile(user.$id);
//       }

//       const companyName = profile?.companyName || "My Business";
//       const address = profile?.address || "123 Default Street";
//       const phone = profile?.phone || "000-000-0000";
//       const logoUrl = profile?.logo
//         ? `https://cloud.appwrite.io/v1/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${profile.logo}/view?project=${process.env.EXPO_PUBLIC_PROJECT_ID}`
//         : null;

//       const html = `
//         <html>
//           <head>
//             <style>
//               body { font-family: Arial, sans-serif; padding: 20px; }
//               h1 { text-align: center; }
//               .details { margin-bottom: 20px; }
//               .details p { margin: 5px 0; }
//               table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
//               th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
//               th { background-color: #4CAF50; color: white; }
//               .logo { text-align: center; margin-bottom: 20px; }
//             </style>
//           </head>
//           <body>
//             ${logoUrl ? `<div class="logo"><img src="${logoUrl}" width="120"/></div>` : ""}
//             <h1>Sale Invoice</h1>
//             <div class="details">
//               <p><strong>Company:</strong> ${companyName}</p>
//               <p><strong>Address:</strong> ${address}</p>
//               <p><strong>Phone:</strong> ${phoneNumber}</p>
//               <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
//               <p><strong>Sale Date:</strong> ${saleDate}</p>
//               <p><strong>Buyer:</strong> ${buyerName}</p>
//             </div>
//             <table>
//               <tr>
//                 <th>Item Name</th>
//                 <th>Quantity</th>
//                 <th>Unit Price (£)</th>
//                 <th>Total (£)</th>
//               </tr>
//               <tr>
//                 <td>${name}</td>
//                 <td>${quantity}</td>
//                 <td>£${parseFloat(price).toFixed(2)}</td>
//                 <td>£${(parseFloat(price) * parseInt(quantity)).toFixed(2)}</td>
//               </tr>
//             </table>
//             <h3>Total Amount: £${(parseFloat(price) * parseInt(quantity)).toFixed(2)}</h3>
//           </body>
//         </html>
//       `;

//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri);
//     } catch (error) {
//       console.error("❌ Error printing invoice:", error);
//     }
//   };

//   return (
//     <ScreenWrapper>
//       <SafeAreaView>
//         <ScrollView>
//           <View style={styles.container}>
//             <Text style={styles.label}>Item Name:</Text>
//             <TextInput style={styles.input} value={name} editable={false} />

//             <Text style={styles.label}>Quantity:</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter quantity"
//               value={quantity}
//               keyboardType="numeric"
//               onChangeText={setQuantity}
//             />

//             <Text style={styles.label}>Price:</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter price"
//               value={price}
//               keyboardType="numeric"
//               onChangeText={setPrice}
//             />

//             <Text style={styles.label}>Buyer Name:</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter buyer's name"
//               value={buyerName}
//               onChangeText={setBuyerName}
//             />

//             <View style={styles.switchContainer}>
//               <Text style={styles.switchLabel}>Paid:</Text>
//               <Switch value={paid} onValueChange={setPaid} />
//             </View>

//             <View style={styles.buttonContainer}>
//               <TouchableOpacity style={styles.button} onPress={handleSave}>
//                 <Text style={styles.buttonText}>Update Sale Record</Text>
//               </TouchableOpacity>

//               <View style={{ marginVertical: 10 }} />
//               <Button title="Delete Sale Record" color="red" onPress={handleDelete} />
//               <View style={{ marginVertical: 10 }} />
//               <Button title="Print Invoice" color="#4CAF50" onPress={handlePrint} />
//             </View>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   label: { fontSize: 16, marginBottom: 5, fontWeight: '500' },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
//   switchLabel: { marginRight: 10, fontSize: 16 },
//   buttonContainer: { width: '100%', marginTop: 20, gap: 15 },
//   button: {
//     backgroundColor: '#4CAF50',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// });

// export default EditSaleRecord;

import ScreenWrapper from '@/components/ScreenWrapper';
import { useAuth } from '@/context/AuthContext';
import { useProUser } from '@/context/ProUserContext';
import { getInvoiceLogoUri } from '@/lib/logo';
import {
  deleteSaleItem,
  getCompanyProfile,
  getSaleItem,
  getStockItem,
  updateSaleItem,
  updateStockQuantity,
} from '@/lib/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
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

const EditSaleRecord: React.FC = () => {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { isProUser, loading } = useProUser();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#fff' : '#333';
  const bgColor = isDark ? '#1e1e1e' : '#f9f9f9';
  const borderColor = isDark ? '#555' : '#ccc';

  // State
  const [stockItemId, setStockItemId] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const [price, setPrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [paid, setPaid] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [saleDate, setSaleDate] = useState('');
  const [taxRate, setTaxRate] = useState("5");
  const [discount, setDiscount] = useState("0");

  // 🔄 Load sale record
  useEffect(() => {
    const loadSale = async () => {
      try {
        const sale = await getSaleItem(id);
        if (sale) {
          setName(sale.name);
          setStockItemId(sale.stockItemId);
          setQuantity(String(sale.quantity));
          setOriginalQuantity(sale.quantity);
          setPrice(String(sale.price));
          setBuyerName(sale.buyerName);
          setPaid(sale.paid);
          setSaleDate(new Date(sale.date).toLocaleDateString());
          const stock = await getStockItem(sale.stockItemId);
          if (stock) setStockQuantity(stock.quantity);
        }
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to load sale record.');
      }
    };
    if (id) loadSale();
  }, [id]);

  // ✅ Update Sale
  const handleSave = async () => {
    if (!quantity || !price || !buyerName) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (!/^[1-9]\d*$/.test(quantity)) {
      Alert.alert('Error', 'Quantity must be a positive integer.');
      return;
    }

    try {
      const newQty = parseInt(quantity);
      const diff = newQty - originalQuantity;
      const adjusted = stockQuantity - diff;
      if (adjusted < 0) {
        Alert.alert('Error', `Not enough stock. Available: ${stockQuantity}`);
        return;
      }

      await updateStockQuantity(stockItemId, adjusted);
      await updateSaleItem(id, { name, stockItemId, quantity: newQty, price: Number(price), buyerName, paid });
      Alert.alert('✅ Success', 'Sale record updated successfully.');
      router.replace('/saleList');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update sale record.');
    }
  };

  // 🗑️ Delete
  const handleDelete = async () => {
    try {
      await updateStockQuantity(stockItemId, stockQuantity + originalQuantity);
      await deleteSaleItem(id);
      Alert.alert('Deleted', 'Sale record deleted successfully.');
      router.replace('/saleList');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to delete sale record.');
    }
  };

  // 🧾 Invoice
  // ✅ Helper: format currency by locale
const formatCurrency = (value: number, currency: string = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);

// ✅ Helper: generate and persist invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const stored = await AsyncStorage.getItem("invoice_counter");
  const next = stored ? parseInt(stored) + 1 : 1;
  await AsyncStorage.setItem("invoice_counter", next.toString());
  return `INV-${year}-${String(next).padStart(3, "0")}`;
};

const handleInvoice = async (mode: "preview" | "print") => {
  try {
    const userId = user?.$id || "guest";
    const profile = await getCompanyProfile(id);

    // 🧩 Company Info (fallbacks for guests)
    const companyName = profile?.companyName || (isProUser ? "My Business" : "StockTally Invoice");
    const address = profile?.address || "";
    const phone = profile?.phoneNumber || "";

    // 🧾 Auto invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // 💰 Invoice Calculations
    const totalValue = parseFloat(price) * parseInt(quantity);
    const total = formatCurrency(totalValue, "GBP");
    const logoUri = await getInvoiceLogoUri(profile);

    // 🧾 Professional Modern Template
    const html = `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            padding: 24px;
            margin: 0;
            background-color: #fff;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            padding: 30px;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 100px;
            border-radius: 8px;
          }
          h2 {
            text-align: center;
            margin-bottom: 10px;
            color: #007AFF;
          }
          .company-info {
            text-align: center;
            font-size: 13px;
            color: #555;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #007AFF;
            color: #fff;
            font-weight: 600;
            text-align: left;
            padding: 10px;
          }
          td {
            border: 1px solid #ddd;
            padding: 10px;
            font-size: 14px;
          }
          .totals {
            text-align: right;
            font-size: 16px;
            font-weight: bold;
            padding-top: 10px;
            color: #007AFF;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #888;
          }
          .buyer {
            margin-top: 15px;
            font-size: 14px;
            color: #444;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            ${
              isProUser && logoUri
                ? `<img src="${logoUri}" alt="Company Logo" />`
                : `<div style="font-size:22px;font-weight:bold;color:#007AFF;">StockTally</div>`
            }
          </div>

          <h2>Sale Invoice</h2>

          <div class="company-info">
            ${
              isProUser
                ? `<strong>${companyName}</strong><br>${address}<br>${phone}`
                : `<em>Upgrade to Pro to add your company branding</em>`
            }
          </div>

          <div class="buyer">
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <p><strong>Buyer:</strong> ${buyerName || "N/A"}</p>
            <p><strong>Date:</strong> ${saleDate || new Date().toLocaleDateString()}</p>
          </div>

          <table>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
            <tr>
              <td>${name}</td>
              <td>${quantity}</td>
              <td>${formatCurrency(parseFloat(price), "GBP")}</td>
              <td>${total}</td>
            </tr>
          </table>

          <div class="totals">Grand Total: ${total}</div>

          <div class="footer">
            ${
              isProUser
                ? "Thank you for your business!"
                : "Generated with StockTally — upgrade to Pro for custom invoices."
            }
          </div>
        </div>
      </body>
      </html>
    `;

    // 🖨️ Handle print or share
    if (mode === "preview") {
      await Print.printAsync({ html });
    } else {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    }
  } catch (err) {
    console.error("❌ Invoice generation failed:", err);
    Alert.alert("Error", "Failed to generate invoice. Please try again.");
  }
};




  if (loading) return <ActivityIndicator />;

  return (
    <ScreenWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={[styles.label]}>Item Name</Text>
          <TextInput value={name} editable={false} style={[styles.input]} />

          <Text style={[styles.label]}>Quantity</Text>
          <TextInput value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={[styles.input]} />

          <Text style={[styles.label]}>Price</Text>
          <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={[styles.input]} />

          <Text style={[styles.label]}>Buyer Name</Text>
          <TextInput value={buyerName} onChangeText={setBuyerName} style={[styles.input]} />

          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel]}>{paid ? "🟢 Paid" : "🔴 Not Paid"}</Text>
            <Switch style={[styles.switch]} value={paid} onValueChange={setPaid}
              thumbColor="#b8c2b1ed" trackColor={{ false: "#FF3B30", true: "#34C759" }} />
          </View>
          

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            {/* Row: Update + Delete */}
            <View style={styles.rowButtons}>
              <TouchableOpacity style={[styles.halfButton, { flex: 1, marginRight: 8 }]} onPress={handleSave}>
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Update Sale</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.halfButton, { flex: 1, marginLeft: 8 }]} onPress={handleDelete}>
                <LinearGradient
                  colors={['#d9534f', '#c9302c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Delete Sale</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Print & Share Invoice */}
            <TouchableOpacity style={styles.button} onPress={() => handleInvoice('print')}>
              <LinearGradient
                colors={['#00b894', '#00997b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Print & Share Invoice</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 👑 Company Branding Button */}
            <TouchableOpacity
              style={[styles.brandButton, { backgroundColor: '#FFD700', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
              onPress={() =>
                isProUser
                  ? router.push('/screens/CompanyProfileScreen')
                  : router.push('/paywall')
              }
            >
              <MaterialCommunityIcons name="crown" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={[styles.buttonText, { color: '#000', fontWeight: '700' }]}>
                {isProUser ? 'Add Company Branding' : 'Unlock Company Branding'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, },
  switchLabel: { fontSize: 16, marginRight: 10 },
  switch: {}, 
  buttonGroup: { marginTop: 20, gap: 15 },
    rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  halfButton: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  brandButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

});

export default EditSaleRecord;
