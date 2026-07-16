// // import LockedScreen from '@/components/LockedScreen';
// // import ScreenWrapper from '@/components/ScreenWrapper';
// // import { useProUser } from '@/lib/ProUserContext';
// // import { deleteSaleItem, getSaleItem, getStockItem, updateSaleItem, updateStockQuantity } from '@/lib/storage';
// // import * as Print from 'expo-print';
// // import { useRouter } from 'expo-router';
// // import { useSearchParams } from 'expo-router/build/hooks';
// // import * as Sharing from 'expo-sharing';
// // import React, { useEffect, useState } from 'react';
// // import {
// //   Alert,
// //   SafeAreaView,
// //   ScrollView,
// //   StyleSheet,
// //   Switch,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View
// // } from 'react-native';
// // import { getCompanyProfile } from '@/lib/storage';
// // import { useAuth } from '@/context/AuthContext'; // so we get current user


// // const EditSaleRecord = () => {
// //   const router = useRouter();
// //   const searchParams = useSearchParams();
// //   const id = searchParams.get('id');

// //   const { isProUser, loading } = useProUser();
// //   if (loading) return null;
// //   if (!isProUser) return <LockedScreen />; // 🔒 Entire screen is Pro-only


// //   // 🚀 State Variables
// //   const [stockItemId, setStockItemId] = useState('');
// //   const [name, setName] = useState('');
// //   const [quantity, setQuantity] = useState('');
// //   const [originalQuantity, setOriginalQuantity] = useState(0);
// //   const [price, setPrice] = useState('');
// //   const [buyerName, setBuyerName] = useState('');
// //   const [paid, setPaid] = useState(false);
// //   const [stockQuantity, setStockQuantity] = useState(0);
// //   const [saleDate, setSaleDate] = useState('');

// //   // 🔄 Load the sale record and associated stock item
// //   useEffect(() => {
// //     const loadSaleRecord = async () => {
// //       if (id) {
// //         try {
// //           const sale = await getSaleItem(id as string);
// //           console.log("✅ Fetched Sale Record:", sale);
// //           if (sale) {
// //             setName(sale.name);
// //             setStockItemId(sale.stockItemId);
// //             setQuantity(String(sale.quantity));
// //             setOriginalQuantity(sale.quantity);
// //             setPrice(String(sale.price));
// //             setBuyerName(sale.buyerName);
// //             setPaid(sale.paid);
// //             setSaleDate(new Date(sale.date).toLocaleDateString());

// //             // 🔍 Fetch the associated stock item
// //             const stockItem = await getStockItem(sale.stockItemId);
// //             if (stockItem) {
// //               console.log("✅ Fetched Stock Item:", stockItem);
// //               setStockQuantity(stockItem.quantity);
// //             } else {
// //               Alert.alert("Error", "Stock item not found.");
// //             }
// //           }
// //         } catch (error) {
// //           console.error("❌ Error loading sale record:", error.message);
// //           Alert.alert("Error", "Failed to load sale record.");
// //         }
// //       }
// //     };

// //     loadSaleRecord();
// //   }, [id]);

// //   // ✅ Handle Save Logic
// //   const handleSave = async () => {
// //     if (!quantity || !price || !buyerName) {
// //       Alert.alert("Error", "Please fill all the fields.");
// //       return;
// //     }

// //     if (!/^[1-9]\d*$/.test(quantity)) {
// //       Alert.alert("Error", "Quantity must be a positive integer.");
// //       return;
// //     }

// //     try {
      

// //         console.log("🚀 Starting Update Process...");
// //         const newQuantity = parseInt(quantity);

// //       if(stockQuantity){

// //         // 🔄 Update Stock Quantity
// //         const quantityDifference = newQuantity - originalQuantity;
// //         const adjustedStockQuantity = stockQuantity - quantityDifference;

// //         if (adjustedStockQuantity < 0) {
// //           Alert.alert(
// //             "Error",
// //             `Not enough stock. Available: ${stockQuantity}`
// //           );
// //           return;
// //         }

// //         const stockUpdateSuccess = await updateStockQuantity(stockItemId, adjustedStockQuantity);

// //         if (!stockUpdateSuccess) {
// //           Alert.alert("Error", "Failed to update stock quantity.");
// //           return;
// //         }
// //       }

// //       // ✅ Update Sale Record
// //       await updateSaleItem(id as string, {
// //         name,
// //         stockItemId,
// //         quantity: newQuantity,
// //         price: Number(price),
// //         buyerName,
// //         paid,
// //       });

// //       console.log("✅ Sale Record updated successfully.");
// //       Alert.alert("Success", "Sale record updated successfully.");
// //       router.replace('../../(tabs)/saleList');
// //     } catch (error) {
// //       console.error("❌ Error during update:", error.message);
// //       Alert.alert("Error", "Failed to update sale record.");
// //     }
// //   };
// //   const { user } = useAuth();
// //   // 🖨️ Print invoice with company branding
// //   const handlePrint = async () => {
// //     try {
// //       let profile = null;
// //       if (user) {
// //         profile = await getCompanyProfile(user.$id);
// //       }
// //     const companyName = profile?.companyName || "My Business";
// //     const address = profile?.address || "123 Default Street";
// //     const phone = profile?.phone || "000-000-0000";
// //     const logoUrl = profile?.logo ? `https://cloud.appwrite.io/v1/storage/buckets/${YOUR_BUCKET_ID}/files/${profile.logo}/view?project=${YOUR_PROJECT_ID}` : null;

// //     const html = `
// //       <html>
// //         <head>
// //           <style>
// //             body { font-family: Arial, sans-serif; padding: 20px; }
// //             h1 { text-align: center; }
// //             .details { margin-bottom: 20px; }
// //             .details p { margin: 5px 0; }
// //             table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
// //             th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
// //             th { background-color: #4CAF50; color: white; }
// //             .logo { width: 100px; height: auto; margin-bottom: 15px; }
// //           </style>
// //         </head>
// //         <body>
// //            ${logoUrl ? `<div class="logo"><img src="${logoUrl}" width="120"/></div>` : ""}
// //           <h1>Sale Invoice</h1>
// //           <div class="details">
// //             <p><strong>Company:</strong> ${companyName}</p>
// //             <p><strong>Address:</strong> ${address}</p>
// //             <p><strong>Phone:</strong> ${phone}</p>
// //             <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
// //             <p><strong>Sale Date:</strong> ${saleDate}</p>
// //             <p><strong>Buyer:</strong> ${buyerName}</p>
// //           </div>
// //           <table>
// //             <tr>
// //               <th>Item Name</th>
// //               <th>Quantity</th>
// //               <th>Unit Price (£)</th>
// //               <th>Total (£)</th>
// //             </tr>
// //             <tr>
// //               <td>${name}</td>
// //               <td>${quantity}</td>
// //               <td>£${parseFloat(price).toFixed(2)}</td>
// //               <td>£${(parseFloat(price) * parseInt(quantity)).toFixed(2)}</td>
// //             </tr>
// //           </table>
// //           <h3>Total Amount: £${(parseFloat(price) * parseInt(quantity)).toFixed(2)}</h3>
// //         </body>
// //       </html>
// //     `;

// //     const { uri } = await Print.printToFileAsync({ html });
// //     await Sharing.shareAsync(uri);
// //   };

// //   const handleDelete = () => {
// //   Alert.alert(
// //     "Confirm Deletion",
// //     "Are you sure you want to delete this sale record?",
// //     [
// //       { text: "Cancel", style: "cancel" },
// //       {
// //         text: "Delete",
// //         style: "destructive",
// //         onPress: async () => {
// //           try {

// //             if(stockQuantity) {
// //               const restoredStock = stockQuantity + originalQuantity;
// //               const stockUpdated = await updateStockQuantity(stockItemId, restoredStock);
// //               if (!stockUpdated) {
// //                 Alert.alert("Error", "Failed to restore stock quantity.");
// //                 return;
// //               }
// //             }

// //             const deleted = await deleteSaleItem(id as string);
// //             if (!deleted) {
// //               Alert.alert("Error", "Failed to delete sale record.");
// //               return;
// //             }

// //             Alert.alert("Success", "Sale record deleted.");
// //             router.replace('../../(tabs)/saleList');
// //           } catch (error) {
// //             console.error("❌ Deletion Error:", error);
// //             Alert.alert("Error", "Something went wrong during deletion.");
// //           }
// //         },
// //       },
// //     ]
// //   );
// // };


// //   return (
// //     <ScreenWrapper>
// //       <SafeAreaView>
// //       <ScrollView>
// //         <View style={styles.container}>
// //           <Text style={styles.label}>Item Name:</Text>
// //           <TextInput
// //             style={styles.input}
// //             value={name}
// //             editable={false}
// //           />

// //           <Text style={styles.label}>Quantity:</Text>
// //           <TextInput
// //             style={styles.input}
// //             placeholder="Enter quantity"
// //             value={quantity}
// //             keyboardType="numeric"
// //             onChangeText={setQuantity}
// //           />

// //           <Text style={styles.label}>Price:</Text>
// //           <TextInput
// //             style={styles.input}
// //             placeholder="Enter price"
// //             value={price}
// //             keyboardType="numeric"
// //             onChangeText={setPrice}
// //           />

// //           <Text style={styles.label}>Buyer Name:</Text>
// //           <TextInput
// //             style={styles.input}
// //             placeholder="Enter buyer's name"
// //             value={buyerName}
// //             onChangeText={setBuyerName}
// //           />

// //           <View style={styles.switchContainer}>
// //             <Text style={styles.switchLabel}>Paid:</Text>
// //             <Switch value={paid} onValueChange={setPaid} />
// //           </View>

// //           <View style={styles.buttonContainer}>
// //             <TouchableOpacity style={styles.button} onPress={handleSave}>
// //               <Text style={styles.buttonText}>Update Record</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
// //               <Text style={styles.buttonText}>Delete Record</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity style={{ marginVertical: 10 }} onPress={handleDelete}>
// //               <Text style={styles.buttonText}>Edit Company Profile</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
// //               <Text style={styles.buttonText}>Print Record</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </ScrollView>
// //       </SafeAreaView>
// //     </ScreenWrapper>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     padding: 20,
// //   },
// //   label: {
// //     fontSize: 16,
// //     marginBottom: 5,
// //     fontWeight: '500',
// //   },
// //   input: {
// //     height: 40,
// //     borderColor: '#ccc',
// //     borderWidth: 1,
// //     marginBottom: 15,
// //     paddingHorizontal: 10,
// //     borderRadius: 5,
// //   },
// //   switchContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 15,
// //   },
// //   switchLabel: {
// //     marginRight: 10,
// //     fontSize: 16,
// //   },
// //   buttonContainer: {
// //     width: '80%',
// //     gap: 15,
// //   },
// //   button: {
// //     backgroundColor: '#4CAF50',
// //     paddingVertical: 15,
// //     alignItems: 'center',
// //     borderRadius: 8,
// //     marginTop: 10,
    
// //   },
// //   deleteButton: {
// //     backgroundColor: '#FF0000',
// //     paddingVertical: 15,
// //     alignItems: 'center',
// //     borderRadius: 8,
// //     marginTop: 10,
    
// //   },
// //   printButton: {
// //     backgroundColor: '#0000FF',
// //     paddingVertical: 15,
// //     alignItems: 'center',
// //     borderRadius: 8,
// //     marginTop: 10,
    
// //   },
// //   buttonText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// // });

// // export default EditSaleRecord;

// // import LockedScreen from '@/components/LockedScreen';
// // import ScreenWrapper from '@/components/ScreenWrapper';
// // import { useAuth } from '@/context/AuthContext';
// // import { useProUser } from '@/lib/ProUserContext';
// // import {
// //   deleteSaleItem,
// //   getCompanyProfile,
// //   getSaleItem,
// //   getStockItem,
// //   updateSaleItem,
// //   updateStockQuantity
// // } from '@/lib/storage';
// // import * as Print from 'expo-print';
// // import { useLocalSearchParams, useRouter } from 'expo-router';
// // import * as Sharing from 'expo-sharing';
// // import React, { useEffect, useState } from 'react';

// // import {
// //   ActivityIndicator,
// //   Alert,
// //   Button,
// //   SafeAreaView,
// //   ScrollView,
// //   StyleSheet,
// //   Switch,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View
// // } from 'react-native';

// // const EditSaleRecord: React.FC = () => {
// //   const params = useLocalSearchParams();
// //   const id = params.id as string | undefined;
// //   const router = useRouter();
// //   const { user } = useAuth();
// //   const { isProUser, loading } = useProUser();

// //   // 🔒 Auth check
// //   if (!user) {
// //     router.replace('./auth/login'); // send to login if not logged in
// //     return null;
// //   }

// //   // 🔒 Pro check
// //   if (loading) return <ActivityIndicator />;
// //   if (!isProUser) return <LockedScreen />;
  
// //   // 🚀 State Variables
// //   const [stockItemId, setStockItemId] = useState('');
// //   const [name, setName] = useState('');
// //   const [quantity, setQuantity] = useState('');
// //   const [originalQuantity, setOriginalQuantity] = useState(0);
// //   const [price, setPrice] = useState('');
// //   const [buyerName, setBuyerName] = useState('');
// //   const [paid, setPaid] = useState(false);
// //   const [stockQuantity, setStockQuantity] = useState(0);
// //   const [saleDate, setSaleDate] = useState('');



// //   // 🔄 Load the sale record and associated stock item
// //   useEffect(() => {
// //     const loadSaleRecord = async () => {
// //       if (id) {
// //         try {
// //           const sale = await getSaleItem(id as string);
// //           if (sale) {
// //             setName(sale.name);
// //             setStockItemId(sale.stockItemId);
// //             setQuantity(String(sale.quantity));
// //             setOriginalQuantity(sale.quantity);
// //             setPrice(String(sale.price));
// //             setBuyerName(sale.buyerName);
// //             setPaid(sale.paid);
// //             setSaleDate(new Date(sale.date).toLocaleDateString());

// //             // 🔍 Fetch the associated stock item
// //             const stockItem = await getStockItem(sale.stockItemId);
// //             if (stockItem) {
// //               setStockQuantity(stockItem.quantity);
// //             } else {
// //               Alert.alert("Error", "Stock item not found.");
// //             }
// //           }
// //         } catch (error: any) {
// //           console.error("❌ Error loading sale record:", error.message);
// //           Alert.alert("Error", "Failed to load sale record.");
// //         }
// //       }
// //     };

// //     loadSaleRecord();
// //   }, [id]);

// //   // ✅ Handle Save Logic
// //   const handleSave = async () => {
// //     if (!quantity || !price || !buyerName) {
// //       Alert.alert("Error", "Please fill all the fields.");
// //       return;
// //     }

// //     if (!/^[1-9]\d*$/.test(quantity)) {
// //       Alert.alert("Error", "Quantity must be a positive integer.");
// //       return;
// //     }

// //     try {
// //       const newQuantity = parseInt(quantity);
// //       const quantityDifference = newQuantity - originalQuantity;
// //       const adjustedStockQuantity = stockQuantity - quantityDifference;

// //       if (adjustedStockQuantity < 0) {
// //         Alert.alert("Error", `Not enough stock. Available: ${stockQuantity}`);
// //         return;
// //       }

// //       const stockUpdateSuccess = await updateStockQuantity(stockItemId, adjustedStockQuantity);

// //       if (!stockUpdateSuccess) {
// //         Alert.alert("Error", "Failed to update stock quantity.");
// //         return;
// //       }

// //       await updateSaleItem(id as string, {
// //         name,
// //         stockItemId,
// //         quantity: newQuantity,
// //         price: Number(price),
// //         buyerName,
// //         paid,
// //       });

// //       Alert.alert("Success", "Sale record updated successfully.");
// //       router.push("/screens/sales/saleList"); // go back to sale list
// //     } catch (error: any) {
// //       console.error("❌ Error during update:", error.message);
// //       Alert.alert("Error", "Failed to update sale record.");
// //     }
// //   };

// //   // 🗑️ Handle Delete
// //   const handleDelete = async () => {
// //     try {
// //       await deleteSaleItem(id as string);
// //       Alert.alert("Deleted", "Sale record deleted successfully.");
// //       router.push("/screens/sales/saleList");
// //     } catch (error: any) {
// //       console.error("❌ Error deleting sale record:", error.message);
// //       Alert.alert("Error", "Failed to delete sale record.");
// //     }
// //   };

// //   // 🧾 Handle Print Invoice with Company Branding
// //   const handlePrint = async () => {
// //     try {
// //       let profile = null;
// //       if (user) {
// //         profile = await getCompanyProfile(user.$id);
// //       }

// //       const companyName = profile?.companyName || "My Business";
// //       const address = profile?.address || "123 Default Street";
// //       const phone = profile?.phone || "000-000-0000";
// //       const logoUrl = profile?.logo
// //         ? `https://cloud.appwrite.io/v1/storage/buckets/${process.env.EXPO_PUBLIC_BUCKET_ID}/files/${profile.logo}/view?project=${process.env.EXPO_PUBLIC_PROJECT_ID}`
// //         : null;

// //       const html = `
// //         <html>
// //           <head>
// //             <style>
// //               body { font-family: Arial, sans-serif; padding: 20px; }
// //               h1 { text-align: center; }
// //               .details { margin-bottom: 20px; }
// //               .details p { margin: 5px 0; }
// //               table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
// //               th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
// //               th { background-color: #4CAF50; color: white; }
// //               .logo { text-align: center; margin-bottom: 20px; }
// //             </style>
// //           </head>
// //           <body>
// //             ${logoUrl ? `<div class="logo"><img src="${logoUrl}" width="120"/></div>` : ""}
// //             <h1>Sale Invoice</h1>
// //             <div class="details">
// //               <p><strong>Company:</strong> ${companyName}</p>
// //               <p><strong>Address:</strong> ${address}</p>
// //               <p><strong>Phone:</strong> ${phoneNumber}</p>
// //               <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
// //               <p><strong>Sale Date:</strong> ${saleDate}</p>
// //               <p><strong>Buyer:</strong> ${buyerName}</p>
// //             </div>
// //             <table>
// //               <tr>
// //                 <th>Item Name</th>
// //                 <th>Quantity</th>
// //                 <th>Unit Price (£)</th>
// //                 <th>Total (£)</th>
// //               </tr>
// //               <tr>
// //                 <td>${name}</td>
// //                 <td>${quantity}</td>
// //                 <td>£${parseFloat(price).toFixed(2)}</td>
// //                 <td>£${(parseFloat(price) * parseInt(quantity)).toFixed(2)}</td>
// //               </tr>
// //             </table>
// //             <h3>Total Amount: £${(parseFloat(price) * parseInt(quantity)).toFixed(2)}</h3>
// //           </body>
// //         </html>
// //       `;

// //       const { uri } = await Print.printToFileAsync({ html });
// //       await Sharing.shareAsync(uri);
// //     } catch (error) {
// //       console.error("❌ Error printing invoice:", error);
// //     }
// //   };

// //   return (
// //     <ScreenWrapper>
// //       <SafeAreaView>
// //         <ScrollView>
// //           <View style={styles.container}>
// //             <Text style={styles.label}>Item Name:</Text>
// //             <TextInput style={styles.input} value={name} editable={false} />

// //             <Text style={styles.label}>Quantity:</Text>
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Enter quantity"
// //               value={quantity}
// //               keyboardType="numeric"
// //               onChangeText={setQuantity}
// //             />

// //             <Text style={styles.label}>Price:</Text>
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Enter price"
// //               value={price}
// //               keyboardType="numeric"
// //               onChangeText={setPrice}
// //             />

// //             <Text style={styles.label}>Buyer Name:</Text>
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Enter buyer's name"
// //               value={buyerName}
// //               onChangeText={setBuyerName}
// //             />

// //             <View style={styles.switchContainer}>
// //               <Text style={styles.switchLabel}>Paid:</Text>
// //               <Switch value={paid} onValueChange={setPaid} />
// //             </View>

// //             <View style={styles.buttonContainer}>
// //               <TouchableOpacity style={styles.button} onPress={handleSave}>
// //                 <Text style={styles.buttonText}>Update Sale Record</Text>
// //               </TouchableOpacity>

// //               <View style={{ marginVertical: 10 }} />
// //               <Button title="Delete Sale Record" color="red" onPress={handleDelete} />
// //               <View style={{ marginVertical: 10 }} />
// //               <Button title="Print Invoice" color="#4CAF50" onPress={handlePrint} />
// //             </View>
// //           </View>
// //         </ScrollView>
// //       </SafeAreaView>
// //     </ScreenWrapper>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, padding: 20 },
// //   label: { fontSize: 16, marginBottom: 5, fontWeight: '500' },
// //   input: {
// //     height: 40,
// //     borderColor: '#ccc',
// //     borderWidth: 1,
// //     marginBottom: 15,
// //     paddingHorizontal: 10,
// //     borderRadius: 5,
// //   },
// //   switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
// //   switchLabel: { marginRight: 10, fontSize: 16 },
// //   buttonContainer: { width: '100%', marginTop: 20, gap: 15 },
// //   button: {
// //     backgroundColor: '#4CAF50',
// //     paddingVertical: 15,
// //     alignItems: 'center',
// //     borderRadius: 8,
// //   },
// //   buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// // });

// // export default EditSaleRecord;

// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import { useProUser } from '@/context/ProUserContext';
// import { getInvoiceLogoUri } from '@/lib/logo';
// import {
//   deleteSaleItem,
//   getCompanyProfile,
//   getSaleItem,
//   getStockItem,
//   updateSaleItem,
//   updateStockQuantity,
// } from '@/lib/storage';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Print from 'expo-print';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import * as Sharing from 'expo-sharing';
// import React, { useEffect, useState } from 'react';

// import {
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from 'react-native';

// const EditSaleRecord: React.FC = () => {
//   const params = useLocalSearchParams();
//   const id = params.id as string;
//   const router = useRouter();
//   const { user } = useAuth();
//   const { isProUser, loading } = useProUser();

//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';
//   const textColor = isDark ? '#fff' : '#333';
//   const bgColor = isDark ? '#1e1e1e' : '#f9f9f9';
//   const borderColor = isDark ? '#555' : '#ccc';

//   // State
//   const [stockItemId, setStockItemId] = useState('');
//   const [name, setName] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [originalQuantity, setOriginalQuantity] = useState(0);
//   const [price, setPrice] = useState('');
//   const [buyerName, setBuyerName] = useState('');
//   const [paid, setPaid] = useState(false);
//   const [stockQuantity, setStockQuantity] = useState(0);
//   const [saleDate, setSaleDate] = useState('');
//   const [taxRate, setTaxRate] = useState("5");
//   const [discount, setDiscount] = useState("0");

//   // 🔄 Load sale record
//   useEffect(() => {
//     const loadSale = async () => {
//       try {
//         const sale = await getSaleItem(id);
//         if (sale) {
//           setName(sale.name);
//           setStockItemId(sale.stockItemId);
//           setQuantity(String(sale.quantity));
//           setOriginalQuantity(sale.quantity);
//           setPrice(String(sale.price));
//           setBuyerName(sale.buyerName);
//           setPaid(sale.paid);
//           setSaleDate(new Date(sale.date).toLocaleDateString());
//           const stock = await getStockItem(sale.stockItemId);
//           if (stock) setStockQuantity(stock.quantity);
//         }
//       } catch (e) {
//         console.error(e);
//         Alert.alert('Error', 'Failed to load sale record.');
//       }
//     };
//     if (id) loadSale();
//   }, [id]);

//   // ✅ Update Sale
//   const handleSave = async () => {
//     if (!quantity || !price || !buyerName) {
//       Alert.alert('Error', 'Please fill all fields.');
//       return;
//     }
//     if (!/^[1-9]\d*$/.test(quantity)) {
//       Alert.alert('Error', 'Quantity must be a positive integer.');
//       return;
//     }

//     try {
//       const newQty = parseInt(quantity);
//       const diff = newQty - originalQuantity;
//       const adjusted = stockQuantity - diff;
//       if (adjusted < 0) {
//         Alert.alert('Error', `Not enough stock. Available: ${stockQuantity}`);
//         return;
//       }

//       await updateStockQuantity(stockItemId, adjusted);
//       await updateSaleItem(id, { name, stockItemId, quantity: newQty, price: Number(price), buyerName, paid });
//       Alert.alert('✅ Success', 'Sale record updated successfully.');
//       router.replace('/saleList');
//     } catch (e) {
//       console.error(e);
//       Alert.alert('Error', 'Failed to update sale record.');
//     }
//   };

//   // 🗑️ Delete
//   const handleDelete = async () => {
//     try {
//       await updateStockQuantity(stockItemId, stockQuantity + originalQuantity);
//       await deleteSaleItem(id);
//       Alert.alert('Deleted', 'Sale record deleted successfully.');
//       router.replace('/saleList');
//     } catch (e) {
//       console.error(e);
//       Alert.alert('Error', 'Failed to delete sale record.');
//     }
//   };

//   // 🧾 Invoice
//   // ✅ Helper: format currency by locale
// const formatCurrency = (value: number, currency: string = "GBP") =>
//   new Intl.NumberFormat("en-GB", {
//     style: "currency",
//     currency,
//     minimumFractionDigits: 2,
//   }).format(value);

// // ✅ Helper: generate and persist invoice number
// const generateInvoiceNumber = async (): Promise<string> => {
//   const year = new Date().getFullYear();
//   const stored = await AsyncStorage.getItem("invoice_counter");
//   const next = stored ? parseInt(stored) + 1 : 1;
//   await AsyncStorage.setItem("invoice_counter", next.toString());
//   return `INV-${year}-${String(next).padStart(3, "0")}`;
// };

// const handleInvoice = async (mode: "preview" | "print") => {
//   try {
//     const userId = user?.$id || "guest";
//     const profile = await getCompanyProfile(id);

//     // 🧩 Company Info (fallbacks for guests)
//     const companyName = profile?.companyName || (isProUser ? "My Business" : "StockTally Invoice");
//     const address = profile?.address || "";
//     const phone = profile?.phoneNumber || "";

//     // 🧾 Auto invoice number
//     const invoiceNumber = await generateInvoiceNumber();

//     // 💰 Invoice Calculations
//     const totalValue = parseFloat(price) * parseInt(quantity);
//     const total = formatCurrency(totalValue, "GBP");
//     const logoUri = await getInvoiceLogoUri(profile);

//     // 🧾 Professional Modern Template
//     const html = `
//       <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <style>
//           body {
//             font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//             color: #333;
//             padding: 24px;
//             margin: 0;
//             background-color: #fff;
//           }
//           .invoice-box {
//             max-width: 800px;
//             margin: auto;
//             border: 1px solid #eee;
//             box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
//             padding: 30px;
//             border-radius: 8px;
//           }
//           .header {
//             text-align: center;
//             margin-bottom: 20px;
//           }
//           .header img {
//             max-width: 100px;
//             border-radius: 8px;
//           }
//           h2 {
//             text-align: center;
//             margin-bottom: 10px;
//             color: #007AFF;
//           }
//           .company-info {
//             text-align: center;
//             font-size: 13px;
//             color: #555;
//             margin-bottom: 20px;
//           }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             margin-top: 20px;
//           }
//           th {
//             background: #007AFF;
//             color: #fff;
//             font-weight: 600;
//             text-align: left;
//             padding: 10px;
//           }
//           td {
//             border: 1px solid #ddd;
//             padding: 10px;
//             font-size: 14px;
//           }
//           .totals {
//             text-align: right;
//             font-size: 16px;
//             font-weight: bold;
//             padding-top: 10px;
//             color: #007AFF;
//           }
//           .footer {
//             text-align: center;
//             margin-top: 30px;
//             font-size: 12px;
//             color: #888;
//           }
//           .buyer {
//             margin-top: 15px;
//             font-size: 14px;
//             color: #444;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="invoice-box">
//           <div class="header">
//             ${
//               isProUser && logoUri
//                 ? `<img src="${logoUri}" alt="Company Logo" />`
//                 : `<div style="font-size:22px;font-weight:bold;color:#007AFF;">StockTally</div>`
//             }
//           </div>

//           <h2>Sale Invoice</h2>

//           <div class="company-info">
//             ${
//               isProUser
//                 ? `<strong>${companyName}</strong><br>${address}<br>${phone}`
//                 : `<em>Upgrade to Pro to add your company branding</em>`
//             }
//           </div>

//           <div class="buyer">
//             <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
//             <p><strong>Buyer:</strong> ${buyerName || "N/A"}</p>
//             <p><strong>Date:</strong> ${saleDate || new Date().toLocaleDateString()}</p>
//           </div>

//           <table>
//             <tr>
//               <th>Item</th>
//               <th>Qty</th>
//               <th>Price</th>
//               <th>Total</th>
//             </tr>
//             <tr>
//               <td>${name}</td>
//               <td>${quantity}</td>
//               <td>${formatCurrency(parseFloat(price), "GBP")}</td>
//               <td>${total}</td>
//             </tr>
//           </table>

//           <div class="totals">Grand Total: ${total}</div>

//           <div class="footer">
//             ${
//               isProUser
//                 ? "Thank you for your business!"
//                 : "Generated with StockTally — upgrade to Pro for custom invoices."
//             }
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     // 🖨️ Handle print or share
//     if (mode === "preview") {
//       await Print.printAsync({ html });
//     } else {
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri);
//     }
//   } catch (err) {
//     console.error("❌ Invoice generation failed:", err);
//     Alert.alert("Error", "Failed to generate invoice. Please try again.");
//   }
// };




//   if (loading) return <ActivityIndicator />;

//   return (
//     <ScreenWrapper>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.container}>
//           <Text style={[styles.label]}>Item Name</Text>
//           <TextInput value={name} editable={false} style={[styles.input]} />

//           <Text style={[styles.label]}>Quantity</Text>
//           <TextInput value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={[styles.input]} />

//           <Text style={[styles.label]}>Price</Text>
//           <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={[styles.input]} />

//           <Text style={[styles.label]}>Buyer Name</Text>
//           <TextInput value={buyerName} onChangeText={setBuyerName} style={[styles.input]} />

//           <View style={styles.switchContainer}>
//             <Text style={[styles.switchLabel]}>{paid ? "🟢 Paid" : "🔴 Not Paid"}</Text>
//             <Switch style={[styles.switch]} value={paid} onValueChange={setPaid}
//               thumbColor="#b8c2b1ed" trackColor={{ false: "#FF3B30", true: "#34C759" }} />
//           </View>
          

//           {/* Buttons */}
//           <View style={styles.buttonGroup}>
//             {/* Row: Update + Delete */}
//             <View style={styles.rowButtons}>
//               <TouchableOpacity style={[styles.halfButton, { flex: 1, marginRight: 8 }]} onPress={handleSave}>
//                 <LinearGradient
//                   colors={['#4CAF50', '#45A049']}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={styles.gradientButton}
//                 >
//                   <Text style={styles.buttonText}>Update Sale</Text>
//                 </LinearGradient>
//               </TouchableOpacity>

//               <TouchableOpacity style={[styles.halfButton, { flex: 1, marginLeft: 8 }]} onPress={handleDelete}>
//                 <LinearGradient
//                   colors={['#d9534f', '#c9302c']}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={styles.gradientButton}
//                 >
//                   <Text style={styles.buttonText}>Delete Sale</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>

//             {/* Print & Share Invoice */}
//             <TouchableOpacity style={styles.button} onPress={() => handleInvoice('print')}>
//               <LinearGradient
//                 colors={['#00b894', '#00997b']}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.gradientButton}
//               >
//                 <Text style={styles.buttonText}>Print & Share Invoice</Text>
//               </LinearGradient>
//             </TouchableOpacity>

//             {/* 👑 Company Branding Button */}
//             <TouchableOpacity
//               style={[styles.brandButton, { backgroundColor: '#FFD700', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
//               onPress={() =>
//                 isProUser
//                   ? router.push('/screens/CompanyProfileScreen')
//                   : router.push('/paywall')
//               }
//             >
//               <MaterialCommunityIcons name="crown" size={20} color="#000" style={{ marginRight: 8 }} />
//               <Text style={[styles.buttonText, { color: '#000', fontWeight: '700' }]}>
//                 {isProUser ? 'Add Company Branding' : 'Unlock Company Branding'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 20, gap: 10 },
//   label: { fontSize: 16, fontWeight: '600', marginTop: 10 },
//   input: {
//     height: 45,
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//   },
//   switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, },
//   switchLabel: { fontSize: 16, marginRight: 10 },
//   switch: {}, 
//   buttonGroup: { marginTop: 20, gap: 15 },
//     rowButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   button: {
//     borderRadius: 8,
//     overflow: 'hidden',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   halfButton: {
//     borderRadius: 8,
//     overflow: 'hidden',
//     elevation: 4,
//   },
//   gradientButton: {
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   brandButton: {
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 5,
//   },

// });

// export default EditSaleRecord;
// import ScreenWrapper from "@/components/ScreenWrapper";
// import { useAuth } from "@/context/AuthContext";
// import {
//   getSaleItems,
//   getStockItem,
//   getStockItems,
//   saveAllSales,
//   updateStockQuantity
// } from "@/lib/storage";
// import { LinearGradient } from "expo-linear-gradient";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";

// const EditSaleScreen = () => {
//   const router = useRouter();
//   const { user } = useAuth();
//   const { buyerName: paramBuyerName, date } = useLocalSearchParams();
//   const userId = user?.$id || "guest";

//   const [buyerName, setBuyerName] = useState(paramBuyerName || "");
//   const [saleItems, setSaleItems] = useState<any[]>([]);
//   const [selectedItemId, setSelectedItemId] = useState<string>("");
//   const [quantity, setQuantity] = useState<string>("");
//   const [price, setPrice] = useState<string>("");
//   const [allSales, setAllSales] = useState<any[]>([]);
//   const [stockList, setStockList] = useState<any[]>([]);
//   const [selectedStockItemId, setSelectedStockItemId] = useState<string>("");

//   // 🧩 Helper for day-level date comparison
//   const sameSaleDay = (a: any, b: any): boolean => {
//     try {
//       const d1 = new Date(a).toLocaleDateString();
//       const d2 = new Date(b).toLocaleDateString();
//       return d1 === d2;
//     } catch {
//       return false;
//     }
//   };

//   // 🧩 Load sale + stock data
//   useEffect(() => {
//     const loadData = async () => {
//       const all = await getSaleItems();
//       const stocks = await getStockItems();
//       setStockList(stocks);
//       setAllSales(all);

//       // ✅ Load all items from this buyer on the same sale day
//       const current = all.filter(
//         (s) => s.buyerName === paramBuyerName && sameSaleDay(s.date, date)
//       );
//       setSaleItems(current);
//     };
//     loadData();
//   }, []);

//   // 🔁 Selecting sale item
//   const handleSelectItem = (id: string) => {
//     setSelectedItemId(id);
//     if (id === "new") {
//       setQuantity("");
//       setPrice("");
//       setSelectedStockItemId("");
//     } else {
//       const selected = saleItems.find((i) => i.stockItemId === id);
//       if (selected) {
//         setQuantity(selected.quantity.toString());
//         setPrice(selected.price.toString());
//       }
//     }
//   };

//   // 💾 Save updates (buyer + items)
//   const handleSave = async () => {
//     try {
//       if (!buyerName.trim()) {
//         Alert.alert("Error", "Buyer name cannot be empty.");
//         return;
//       }

//       // ⚠️ Only update buyer name if no item selected
//       if (!selectedItemId) {
//         const updatedBuyerSales = allSales.map((s) =>
//           s.buyerName === paramBuyerName && sameSaleDay(s.date, date)
//             ? { ...s, buyerName }
//             : s
//         );
//         await saveAllSales(updatedBuyerSales);
//         Alert.alert("Updated", "Buyer name updated successfully.", [
//           { text: "OK", onPress: () => router.back() },
//         ]);
//         return;
//       }

//       if (!quantity || !price) {
//         Alert.alert("Error", "Please enter quantity and price.");
//         return;
//       }

//       const newQty = Number(quantity);
//       const newPrice = Number(price);
//       let updatedSales = [...allSales];

//       // ✅ Update buyer name across this sale
//       updatedSales = updatedSales.map((s) =>
//         s.buyerName === paramBuyerName && sameSaleDay(s.date, date)
//           ? { ...s, buyerName }
//           : s
//       );

//       // ✏️ Editing existing item
//       if (selectedItemId !== "new") {
//         const itemToUpdate = saleItems.find(
//           (i) => i.stockItemId === selectedItemId
//         );
//         if (itemToUpdate) {
//           const oldQty = itemToUpdate.quantity;
//           const stockItem = await getStockItem(selectedItemId);
//           if (!stockItem) {
//             Alert.alert("Error", "Stock item not found.");
//             return;
//           }
          
//           const stockAdjustment = oldQty - newQty;
//           const newStockQty = stockItem.quantity + stockAdjustment;
//           if (newStockQty < 0) {
//             Alert.alert(
//               "Insufficient Stock",
//               `Not enough stock for "${stockItem.name}".`
//             );
//             return;
//           }

//           updatedSales = updatedSales.map((s) =>
//             s.stockItemId === selectedItemId &&
//             s.buyerName === buyerName &&
//             sameSaleDay(s.date, date)
//               ? { ...s, quantity: newQty, price: newPrice }
//               : s
//           );

//           await updateStockQuantity(selectedItemId, newStockQty);
//         }
//       } else {

//         // 🆕 Add new item
//         const stockItem = await getStockItem(selectedStockItemId);
//         if (!stockItem) {
//           Alert.alert("Error", "Selected stock item not found.");
//           return;
//         }

//         // ⚙️ Check stock availability
//         if (stockItem.quantity < newQty) {
//           Alert.alert(
//             "Insufficient Stock",
//             `Only ${stockItem.quantity} units available for "${stockItem.name}".`
//           );
//           return;
//         }

        
//         const newItem = {
//             id: Date.now().toString(),
//             stockItemId: selectedStockItemId,
//             name: stockItem.name,
//             quantity: newQty,
//             price: newPrice,
//             buyerName,
//             date: new Date().toString(),
//             userId,
//             paid: false,
//             syncedAt: "",
//             synced: false,
//         };
//         updatedSales.push(newItem);

//         await updateStockQuantity(
//           selectedStockItemId,
//           stockItem.quantity - newQty
//         );

//         Alert.alert("Added", `Item "${stockItem.name}" added to sale.`);
//       }

//       // 💾 Save all
//       updatedSales = updatedSales.map((s) => ({
//         ...s,
//         date: s.date,
//       }));

//       await saveAllSales(updatedSales);
//       Alert.alert("Success", "Sale updated successfully.", [
//         { text: "OK", onPress: () => router.back() },
//       ]);
//     } catch (err) {
//       console.error("❌ Error saving sale:", err);
//       Alert.alert("Error", "Failed to update sale. Please try again.");
//     }
//   };

// return (
//   <ScreenWrapper>
//     <LinearGradient
//       colors={["#0d1b2a", "#1b263b", "#415a77"]}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//       style={styles.gradient}
//     >
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scroll}>
//           {/* 📍 Title Outside Form */}
//           {/* 🧊 Frosted Glass Form */}
//           <View style={styles.formCard}>
//             {/* Buyer */}
//             <Text style={styles.label}>Buyer Name</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter buyer name"
//               placeholderTextColor="#bbb"
//               value={buyerName}
//               onChangeText={setBuyerName}
//             />

//             {/* Existing Sale Item */}
//             <Text style={styles.label}>Select Item</Text>
//             <Dropdown
//               data={[
//                 ...saleItems.map((i) => ({
//                   label: i.name,
//                   value: i.stockItemId,
//                 })),
//                 { label: "+ Add New Item", value: "new" },
//               ]}
//               labelField="label"
//               valueField="value"
//               value={selectedItemId}
//               onChange={(item) => handleSelectItem(item.value)}
//               placeholder="Select item"
//               style={styles.dropdown}
//               placeholderStyle={styles.dropdownPlaceholder}
//               selectedTextStyle={styles.dropdownText}
//             />

//             {/* New Item Stock Dropdown */}
//             {selectedItemId === "new" && (
//               <>
//                 <Text style={styles.label}>Select Stock Item</Text>
//                 <Dropdown
//                   data={stockList
//                     .filter((s) => !saleItems.some((item) => item.stockItemId === s.id))
//                     .map((s) => ({
//                       label: `${s.name} (Available: ${s.quantity})`,
//                       value: s.id,
//                     }))}
//                   labelField="label"
//                   valueField="value"
//                   value={selectedStockItemId}
//                   onChange={(item) => setSelectedStockItemId(item.value)}
//                   placeholder="Choose from stock"
//                   style={styles.dropdown}
//                   placeholderStyle={styles.dropdownPlaceholder}
//                   selectedTextStyle={styles.dropdownText}
//                 />
//               </>
//             )}

//             {/* Quantity / Price */}
//             <Text style={styles.label}>Quantity</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               placeholder="Enter quantity"
//               placeholderTextColor="#bbb"
//               value={quantity}
//               onChangeText={setQuantity}
//             />

//             <Text style={styles.label}>Price (£)</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               placeholder="Enter price"
//               placeholderTextColor="#bbb"
//               value={price}
//               onChangeText={setPrice}
//             />

//             {/* Buttons */}
//             <View style={styles.buttonGroup}>
//               <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
//                 <Text style={styles.saveText}>💾 Save Changes</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 onPress={() => router.back()}
//                 activeOpacity={0.9}
//               >
//                 <Text style={styles.cancelText}>✖ Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   </ScreenWrapper>
// );
// };

// // 💅 Styles
// const styles = StyleSheet.create({
//   gradient: { flex: 1 },
//   scroll: {
//     flexGrow: 1,
//     paddingVertical: 30,
//     paddingHorizontal: 20,
//   },
//   title: {
//     color: "#fff",
//     fontSize: 30,
//     fontWeight: "800",
//     marginBottom: 20,
//     textAlign: "center",
//     letterSpacing: 0.5,
//   },
//   formCard: {
//     backgroundColor: "rgba(255, 255, 255, 0.08)",
//     borderRadius: 24,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOpacity: 0.35,
//     shadowRadius: 15,
//     shadowOffset: { width: 0, height: 6 },
//     borderWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.15)",
//   },
//   label: {
//     color: "#dbeafe",
//     fontSize: 16,
//     marginBottom: 8,
//     marginTop: 18,
//     fontWeight: "600",
//   },
//   input: {
//     backgroundColor: "rgba(255,255,255,0.18)",
//     borderRadius: 14,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     color: "#fff",
//     fontSize: 17,
//     fontWeight: "500",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.15)",
//   },
//   dropdown: {
//     backgroundColor: "rgba(255,255,255,0.18)",
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     height: 56,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.15)",
//   },
//   dropdownPlaceholder: {
//     color: "#bbb",
//     fontSize: 15,
//     fontWeight: "500",
//   },
//   dropdownText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   buttonGroup: {
//     marginTop: 40,
//     gap: 14,
//   },
//   saveButton: {
//     backgroundColor: "rgba(34,197,94,0.92)",
//     borderRadius: 14,
//     paddingVertical: 16,
//     alignItems: "center",
//     shadowColor: "#22c55e",
//     shadowOpacity: 0.4,
//     shadowOffset: { width: 0, height: 5 },
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   saveText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 18,
//     letterSpacing: 0.4,
//   },
//   cancelButton: {
//     backgroundColor: "rgba(239,68,68,0.9)",
//     borderRadius: 14,
//     paddingVertical: 16,
//     alignItems: "center",
//     shadowColor: "#ef4444",
//     shadowOpacity: 0.4,
//     shadowOffset: { width: 0, height: 5 },
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   cancelText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 18,
//     letterSpacing: 0.4,
//   },
// });
// export default EditSaleScreen;

import ScreenWrapper from '@/components/ScreenWrapper';
import {
  getSaleItems,
  getStockItems,
  saveAllSales,
  saveStockMovement,
  updateStockQuantity,
} from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const EditSaleScreen = () => {
  const router = useRouter();
  const { salesId } = useLocalSearchParams<{ salesId: string }>();

  const [stockItems, setStockItems] = useState<any[]>([]);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [originalSale, setOriginalSale] = useState<any[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [paidStatus, setPaidStatus] = useState(false);
  const [date, setDate] = useState('');
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const bgColor = colorScheme === "dark" ? "#121212" : "#f5f5f5";
  const cardColor = colorScheme === "dark" ? "#1e1e1e" : "#fff";
  const inputBg = colorScheme === "dark" ? "#1c1c1c" : "#fff";

  // 🔹 New item form
  const [selectedStockId, setSelectedStockId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');

  useEffect(() => {
    const loadData = async () => {
      const allSales = await getSaleItems();
      const stockList = await getStockItems();
      setStockItems(stockList);

      const thisSale = allSales.filter((s) => s.salesId === salesId);
      if (thisSale.length === 0) {
        Alert.alert('Error', 'Sale not found.');
        router.back();
        return;
      }

      setSaleItems(thisSale);
      setOriginalSale(thisSale); // keep copy for comparison
      setBuyerName(thisSale[0].buyerName);
      setPaidStatus(thisSale[0].paid ?? false);
      setDate(thisSale[0].date);
    };
    loadData();
  }, [salesId]);

  // 🧩 Add another item
  const handleAddItem = () => {
    if (!selectedStockId || quantity === '' || price === '') {
      Alert.alert('Error', 'Please select an item and enter quantity and price.');
      return;
    }

    const selectedStock = stockItems.find((s) => s.id === selectedStockId);
    if (!selectedStock) {
      Alert.alert('Error', 'Selected stock item not found.');
      return;
    }
    if (quantity > selectedStock.quantity) {
      Alert.alert('Error', 'Quantity exceeds available stock.');
      return;
    }

    const newItem = {
      salesId,
      stockItemId: selectedStockId,
      name: selectedStock.name,
      quantity,
      price,
      buyerName,
      paid: paidStatus,
      date,
    };

    setSaleItems((prev) => [...prev, newItem]);
    setSelectedStockId('');
    setQuantity('');
    setPrice('');

    Alert.alert('✅ Added', `${selectedStock.name} added to sale.`);
  };

  // 💾 Save updates (atomic + smart stock adjustment)
  // const handleSaveChanges = async () => {
  //   try {
  //     if (!buyerName) {
  //       Alert.alert('Error', 'Please enter buyer name.');
  //       return;
  //     }
  //     if (saleItems.length === 0) {
  //       Alert.alert('Error', 'Sale must include at least one item.');
  //       return;
  //     }

  //     // 🧮 Load all existing sales
  //     const allSales = await getSaleItems();
  //     const remainingSales = allSales.filter((s) => s.salesId !== salesId);

  //     // 🆕 Prepare updated sale items
  //     const updatedSaleItems = saleItems.map((item) => ({
  //       ...item,
  //       salesId,
  //       buyerName,
  //       paid: paidStatus,
  //       date,
  //     }));

  //     // 💾 Save all
  //     await saveAllSales([...remainingSales, ...updatedSaleItems]);

  //     // 🔧 Adjust stock based on delta
  //     for (const updatedItem of updatedSaleItems) {
  //       const stock = stockItems.find((s) => s.id === updatedItem.stockItemId);
  //       const oldItem = originalSale.find(
  //         (o) => o.stockItemId === updatedItem.stockItemId
  //       );

  //       if (stock) {
  //         let delta = 0;

  //         if (oldItem) {
  //           // Existing item edited
  //           delta = updatedItem.quantity - oldItem.quantity;
  //         } else {
  //           // New item added
  //           delta = updatedItem.quantity;
  //         }

  //         const newStockQty = stock.quantity - delta;
  //         await updateStockQuantity(updatedItem.stockItemId, newStockQty);
  //       }
  //     }

  //     // 🗑️ Restore stock for removed items
  //     for (const oldItem of originalSale) {
  //       const stillExists = updatedSaleItems.find(
  //         (i) => i.stockItemId === oldItem.stockItemId
  //       );
  //       if (!stillExists) {
  //         const stock = stockItems.find((s) => s.id === oldItem.stockItemId);
  //         if (stock) {
  //           const restoredQty = stock.quantity + oldItem.quantity;
  //           await updateStockQuantity(oldItem.stockItemId, restoredQty);
  //         }
  //       }
  //     }

  //     Alert.alert('✅ Success', 'Sale updated successfully.', [
  //       {
  //         text: 'OK',
  //         onPress: () =>
  //           router.replace({
  //             pathname: '/screens/sales/viewSaleScreen',
  //             params: { salesId },
  //           }),
  //       },
  //     ]);
  //   } catch (err) {
  //     console.error('❌ Error saving sale:', err);
  //     Alert.alert('Error', 'Failed to update sale.');
  //   }
  // };

  // const handleSaveChanges = async () => {
  //   try {
  //     if (!buyerName) {
  //       Alert.alert("Error", "Please enter buyer name.");
  //       return;
  //     }

  //     if (saleItems.length === 0) {
  //       Alert.alert("Error", "Sale must include at least one item.");
  //       return;
  //     }

  //     const allSales = await getSaleItems();
  //     const remainingSales = allSales.filter((s) => s.salesId !== salesId);

  //     const updatedSaleItems = saleItems.map((item) => ({
  //       ...item,
  //       salesId,
  //       buyerName,
  //       paid: paidStatus,
  //       date,
  //       quantity: Number(item.quantity),
  //       price: Number(item.price),
  //       synced: false,
  //       syncedAt: "",
  //     }));

  //     await saveAllSales([...remainingSales, ...updatedSaleItems]);

  //     // 🔧 Adjust stock based on updated / added sale items
  //     for (const updatedItem of updatedSaleItems) {
  //       const stock = stockItems.find((s) => s.id === updatedItem.stockItemId);
  //       const oldItem = originalSale.find(
  //         (o) => o.stockItemId === updatedItem.stockItemId
  //       );

  //       if (stock) {
  //         let delta = 0;

  //         if (oldItem) {
  //           delta = Number(updatedItem.quantity) - Number(oldItem.quantity);
  //         } else {
  //           delta = Number(updatedItem.quantity);
  //         }

  //         if (delta !== 0) {
  //           const newStockQty = Number(stock.quantity) - delta;

  //           await updateStockQuantity(updatedItem.stockItemId, newStockQty);

  //           await saveStockMovement({
  //             stockItemId: updatedItem.stockItemId,
  //             itemName: updatedItem.name || stock.name,
  //             type: delta > 0 ? "OUT" : "IN",
  //             quantity: Math.abs(delta),
  //             source: "QUICK_SALE",
  //             sourceLabel:
  //               delta > 0
  //                 ? "Quick sale updated - extra stock sold"
  //                 : "Quick sale updated - stock restored",
  //             balanceAfter: newStockQty,
  //             referenceId: salesId,
  //             referenceType: "SALE",
  //             note: `Sale updated for ${buyerName}`,
  //           });
  //         }
  //       }
  //     }

  //     // 🗑️ Restore stock for removed sale items
  //     for (const oldItem of originalSale) {
  //       const stillExists = updatedSaleItems.find(
  //         (i) => i.stockItemId === oldItem.stockItemId
  //       );

  //       if (!stillExists) {
  //         const stock = stockItems.find((s) => s.id === oldItem.stockItemId);

  //         if (stock) {
  //           const restoredQty =
  //             Number(stock.quantity) + Number(oldItem.quantity);

  //           await updateStockQuantity(oldItem.stockItemId, restoredQty);

  //           await saveStockMovement({
  //             stockItemId: oldItem.stockItemId,
  //             itemName: oldItem.name || stock.name,
  //             type: "IN",
  //             quantity: Number(oldItem.quantity),
  //             source: "QUICK_SALE",
  //             sourceLabel: "Quick sale item removed - stock restored",
  //             balanceAfter: restoredQty,
  //             referenceId: salesId,
  //             referenceType: "SALE",
  //             note: `Item removed from sale for ${buyerName}`,
  //           });
  //         }
  //       }
  //     }

  //     Alert.alert("✅ Success", "Sale updated successfully.", [
  //       {
  //         text: "OK",
  //         onPress: () =>
  //           router.replace({
  //             pathname: "/screens/sales/viewSaleScreen",
  //             params: { salesId },
  //           }),
  //       },
  //     ]);
  //   } catch (err) {
  //     console.error("❌ Error saving sale:", err);
  //     Alert.alert("Error", "Failed to update sale.");
  //   }
  // };

  const handleSaveChanges = async () => {
    try {
      if (!buyerName) {
        Alert.alert("Error", "Please enter buyer name.");
        return;
      }

      if (saleItems.length === 0) {
        Alert.alert("Error", "Sale must include at least one item.");
        return;
      }

      const allSales = await getSaleItems();
      const remainingSales = allSales.filter((s) => s.salesId !== salesId);

      const updatedSaleItems = saleItems.map((item) => ({
        ...item,
        salesId,
        buyerName,
        paid: paidStatus,
        date,
        quantity: Number(item.quantity),
        price: Number(item.price),
        synced: false,
        syncedAt: "",
      }));

      await saveAllSales([...remainingSales, ...updatedSaleItems]);

      // 🔧 Adjust stock based on updated / added sale items
      for (const updatedItem of updatedSaleItems) {
        const stock = stockItems.find((s) => s.id === updatedItem.stockItemId);
        const oldItem = originalSale.find(
          (o) => o.stockItemId === updatedItem.stockItemId
        );

        if (stock) {
          let delta = 0;

          if (oldItem) {
            delta = Number(updatedItem.quantity) - Number(oldItem.quantity);
          } else {
            delta = Number(updatedItem.quantity);
          }

          if (delta !== 0) {
            const newStockQty = Number(stock.quantity) - delta;

            await updateStockQuantity(updatedItem.stockItemId, newStockQty);

            await saveStockMovement({
              stockItemId: updatedItem.stockItemId,
              itemName: updatedItem.name || stock.name,
              type: delta > 0 ? "OUT" : "IN",
              quantity: Math.abs(delta),
              source: "QUICK_SALE",
              sourceLabel:
                delta > 0
                  ? "Quick sale updated - extra stock sold"
                  : "Quick sale updated - stock restored",
              balanceAfter: newStockQty,
              referenceId: salesId,
              referenceType: "SALE",
              note: `Sale updated for ${buyerName}`,
            });
          }
        }
      }

      // 🗑️ Restore stock for removed sale items
      for (const oldItem of originalSale) {
        const stillExists = updatedSaleItems.find(
          (i) => i.stockItemId === oldItem.stockItemId
        );

        if (!stillExists) {
          const stock = stockItems.find((s) => s.id === oldItem.stockItemId);

          if (stock) {
            const restoredQty =
              Number(stock.quantity) + Number(oldItem.quantity);

            await updateStockQuantity(oldItem.stockItemId, restoredQty);

            await saveStockMovement({
              stockItemId: oldItem.stockItemId,
              itemName: oldItem.name || stock.name,
              type: "IN",
              quantity: Number(oldItem.quantity),
              source: "QUICK_SALE",
              sourceLabel: "Quick sale item removed - stock restored",
              balanceAfter: restoredQty,
              referenceId: salesId,
              referenceType: "SALE",
              note: `Item removed from sale for ${buyerName}`,
            });
          }
        }
      }

      Alert.alert("✅ Success", "Sale updated successfully.", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/screens/sales/viewSaleScreen",
              params: { salesId },
            }),
        },
      ]);
    } catch (err) {
      console.error("❌ Error saving sale:", err);
      Alert.alert("Error", "Failed to update sale.");
    }
  };

  // 🗑️ Delete an item
  const handleDeleteItem = (stockItemId: string) => {
    Alert.alert('Confirm', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          setSaleItems((prev) => prev.filter((i) => i.stockItemId !== stockItemId)),
      },
    ]);
  };

  // 🧾 Build dropdown data with dynamic state (stable, sorted, reactive)
  const dropdownData = React.useMemo(() => {
    // 1️⃣ Map current stock items
    const baseList = stockItems.map((item) => {
      const isInSale = saleItems.some((s) => s.stockItemId === item.id);
      return {
        label: isInSale
          ? `${item.name} (Item already selected)`
          : `${item.name} (${item.quantity} in stock)`,
        value: item.id,
        disabled: isInSale,
      };
    });

    // 2️⃣ If the selected sold item isn’t in stock, add it back manually
    if (selectedStockId && !baseList.some((d) => d.value === selectedStockId)) {
      const soldItem = saleItems.find((s) => s.stockItemId === selectedStockId);
      if (soldItem) {
        baseList.push({
          label: `${soldItem.name} (Sold / Unavailable)`,
          value: soldItem.stockItemId,
          disabled: true,
        });
      }
    }

    // 3️⃣ Sort — available first, disabled last
    const sortedList = [
      ...baseList.filter((i) => !i.disabled),
      ...baseList.filter((i) => i.disabled),
    ];

    return sortedList;
  }, [stockItems, saleItems, selectedStockId]);


  // return (
  //   <ScreenWrapper>
  //     <LinearGradient colors={['#0d1b2a', '#1b263b', '#415a77']} style={styles.gradient}>
  //       <SafeAreaView style={{ flex: 1 }}>
  //         <ScrollView contentContainerStyle={styles.scrollContainer}>
  //           <View style={styles.form}>
  //             <Text style={styles.title}>Edit Sale</Text>

  //             {/* <Text style={styles.label}>Buyer Name</Text> */}
  //             <TextInput
  //               value={buyerName}
  //               onChangeText={setBuyerName}
  //               style={styles.input}
  //               placeholder="Enter buyer name"
  //               placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}

  //             />

  //             {/* 🧾 Stock Item Dropdown */}
  //             <Dropdown
  //               style={styles.dropdown}
  //               data={dropdownData}
  //               labelField="label"
  //               valueField="value"
  //               placeholder="Select Stock Item"
  //               value={selectedStockId}
  //               disable={false}
  //               renderItem={(item) => (
  //                 <View
  //                   style={{
  //                     paddingVertical: 10,
  //                     paddingHorizontal: 12,
  //                     opacity: item.disabled ? 0.5 : 1,
  //                     flexDirection: "row",
  //                     alignItems: "center",
  //                     justifyContent: "space-between",
  //                   }}
  //                 >
  //                   <Text style={{ color: "#000" }}>{item.label}</Text>
  //                   {item.disabled && (
  //                     <Text style={{ color: "#d9534f", fontSize: 12, fontWeight: "600" }}>
  //                       🚫
  //                     </Text>
  //                   )}
  //                 </View>
  //               )}
  //               onChange={(item) => {
  //                 if (item.disabled) {
  //                   Alert.alert(
  //                     "Item already selected",
  //                     "This stock item is already part of the current sale."
  //                   );
  //                   return;
  //                 }

  //                 setSelectedStockId(item.value);
  //                 const selected = stockItems.find((s) => s.id === item.value);
  //                 if (selected) {
  //                   setPrice(selected.price ?? "");
  //                 } else {
  //                   const soldItem = saleItems.find((s) => s.stockItemId === item.value);
  //                   if (soldItem) setPrice(soldItem.price);
  //                 }
  //               }}
  //             />
  //             {/* <Text style={styles.label}>Quantity</Text> */}
  //             <TextInput
  //               value={quantity === '' ? '' : String(quantity)}
  //               onChangeText={(val) => setQuantity(val === '' ? '' : parseInt(val))}
  //               keyboardType="numeric"
  //               style={styles.input}
  //               placeholder="Enter quantity"
  //               placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}

  //             />

  //             {/* <Text style={styles.label}>Price</Text> */}
  //             <TextInput
  //               value={price === '' ? '' : String(price)}
  //               onChangeText={(val) => setPrice(val === '' ? '' : parseFloat(val))}
  //               keyboardType="numeric"
  //               style={styles.input}
  //               placeholder="Enter price"
  //               placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}

  //             />

  //             <TouchableOpacity onPress={handleAddItem}>
  //               <LinearGradient colors={['#2196F3', '#0D47A1']} style={styles.gradientButton}>
  //                 <Text style={styles.buttonText}>+ Add Item</Text>
  //               </LinearGradient>
  //             </TouchableOpacity>

  //             <TouchableOpacity onPress={handleSaveChanges}>
  //               <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.gradientButton}>
  //                 <Text style={styles.buttonText}>💾 Save Changes</Text>
  //               </LinearGradient>
  //             </TouchableOpacity>

  //             {/* Preview items */}
  //             {saleItems.length > 0 && (
  //               <View style={{ marginTop: 20 }}>
  //                 <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 10, color: '#0d0c0cff' }}>
  //                   Current Sale Items:
  //                 </Text>
  //                 {saleItems.map((item, idx) => (
  //                   <View key={idx} style={styles.itemPreview}>
  //                     <Text style={{ color: '#fff' }}>
  //                       {idx + 1}. {item.name} — {item.quantity} × £{item.price.toFixed(2)}
  //                     </Text>
  //                     <TouchableOpacity onPress={() => handleDeleteItem(item.stockItemId)}>
  //                       <Text style={{ color: '#ff4d4d', fontWeight: '700' }}>✕</Text>
  //                     </TouchableOpacity>
  //                   </View>
  //                 ))}
  //               </View>
  //             )}
  //           </View>
  //         </ScrollView>
  //       </SafeAreaView>
  //     </LinearGradient>
  //   </ScreenWrapper>
  // );
  return (
    <ScreenWrapper scroll backgroundColor="#0d1b2a">
      <LinearGradient
        colors={['#0d1b2a', '#1b263b', '#415a77']}
        style={styles.gradient}
      >
        <View style={styles.scrollContainer}>
          <View style={styles.form}>
            <Text style={styles.title}>Edit Sale</Text>

            <TextInput
              value={buyerName}
              onChangeText={setBuyerName}
              style={styles.input}
              placeholder="Enter buyer name"
              placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
            />

            <Dropdown
              style={styles.dropdown}
              data={dropdownData}
              labelField="label"
              valueField="value"
              placeholder="Select Stock Item"
              value={selectedStockId}
              disable={false}
              renderItem={(item) => (
                <View
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    opacity: item.disabled ? 0.5 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#000' }}>{item.label}</Text>
                  {item.disabled && (
                    <Text style={{ color: '#d9534f', fontSize: 12, fontWeight: '600' }}>
                      🚫
                    </Text>
                  )}
                </View>
              )}
              onChange={(item) => {
                if (item.disabled) {
                  Alert.alert(
                    'Item already selected',
                    'This stock item is already part of the current sale.'
                  );
                  return;
                }

                setSelectedStockId(item.value);
                const selected = stockItems.find((s) => s.id === item.value);

                if (selected) {
                  setPrice(selected.price ?? '');
                } else {
                  const soldItem = saleItems.find((s) => s.stockItemId === item.value);
                  if (soldItem) setPrice(soldItem.price);
                }
              }}
            />

            <TextInput
              value={quantity === '' ? '' : String(quantity)}
              onChangeText={(val) => setQuantity(val === '' ? '' : parseInt(val))}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              style={styles.input}
              placeholder="Enter quantity"
              placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
            />

            <TextInput
              value={price === '' ? '' : String(price)}
              onChangeText={(val) => setPrice(val === '' ? '' : parseFloat(val))}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              style={styles.input}
              placeholder="Enter price"
              placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
            />

            <TouchableOpacity onPress={handleAddItem}>
              <LinearGradient
                colors={['#2196F3', '#0D47A1']}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>+ Add Item</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveChanges}>
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>💾 Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>

            {saleItems.length > 0 && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Current Sale Items:</Text>

                {saleItems.map((item, idx) => (
                  <View key={idx} style={styles.itemPreview}>
                    <Text style={{ color: '#fff' }}>
                      {idx + 1}. {item.name} — {item.quantity} × £{item.price.toFixed(2)}
                    </Text>

                    <TouchableOpacity onPress={() => handleDeleteItem(item.stockItemId)}>
                      <Text style={{ color: '#ff4d4d', fontWeight: '700' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: {
  flex: 1,
  minHeight: '100%',
},

scrollContainer: {
  padding: 20,
  paddingBottom: 150,
},

previewContainer: {
  marginTop: 20,
},

previewTitle: {
  fontWeight: '700',
  fontSize: 18,
  marginBottom: 10,
  color: '#fff',
},

scrollContainer: { padding: 30, paddingBottom: 120 },
  form: {
    backgroundColor: 'rgba(239, 230, 230, 1)',
    borderRadius: 16,
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#0f0f0fff', marginBottom: 10 },
  label: { color: '#0c0b0bff', fontSize: 16, marginTop: 10 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  gradientButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  itemPreview: {
    backgroundColor: '#45556e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default EditSaleScreen;
