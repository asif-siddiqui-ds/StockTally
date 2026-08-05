// export default viewSaleScreen;

// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import { useCompanyProfile } from '@/context/CompanyProfileContext';
// import { useProUser } from '@/context/ProUserContext';
// import { getInvoiceLogoUri } from '@/lib/logo';
// import {
//   getCompanyProfile,
//   getSaleItems,
//   getStockItem,
//   saveAllSales,
//   updateStockQuantity,
// } from '@/lib/storage';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as FileSystem from 'expo-file-system';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Print from 'expo-print';
// import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
// import * as Sharing from 'expo-sharing';
// import React, { useCallback, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// const ViewSaleScreen = () => {
//   const router = useRouter();

//   const { salesId, batchId, type } = useLocalSearchParams<{
//     salesId?: string;
//     batchId?: string;
//     type?: string;
//   }>();

//   const { user } = useAuth();
//   const { isProUser } = useProUser();

//   const [saleItems, setSaleItems] = useState<any[]>([]);
//   const [buyerName, setBuyerName] = useState('');
//   const [paidStatus, setPaidStatus] = useState(false);
//   const [date, setDate] = useState('');
//   const [total, setTotal] = useState(0);
//   const [totalItems, setTotalItems] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const isBulkSale = type === 'bulk_sale' || !!batchId;

//   const saleGroupId = useMemo(() => {
//     return batchId || salesId;
//   }, [batchId, salesId]);

//   const matchesCurrentSale = (sale: any) => {
//     if (isBulkSale) {
//       return sale.batchId === saleGroupId || sale.salesId === saleGroupId;
//     }

//     return sale.salesId === salesId;
//   };

//   const recalcTotals = (items: any[]) => {
//     const newTotal = items.reduce(
//       (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
//       0
//     );

//     const newTotalItems = items.reduce(
//       (sum, i) => sum + Number(i.quantity || 0),
//       0
//     );

//     setTotal(newTotal);
//     setTotalItems(newTotalItems);
//   };

//   const loadSale = useCallback(async () => {
//     try {
//       setLoading(true);

//       const allSales = await getSaleItems();
//       const thisSale = allSales.filter(matchesCurrentSale);

//       if (thisSale.length === 0) {
//         Alert.alert('Error', 'Sale not found.');
//         router.back();
//         return;
//       }

//       setSaleItems(thisSale);
//       setBuyerName(
//         thisSale[0].buyerName ||
//           (isBulkSale ? 'Bulk Sale' : 'Quick Sale')
//       );
//       setPaidStatus(thisSale[0].paid ?? true);
//       setDate(thisSale[0].date);

//       recalcTotals(thisSale);
//     } catch (err) {
//       console.error('Error loading sale:', err);
//       Alert.alert('Error', 'Could not load sale.');
//     } finally {
//       setLoading(false);
//     }
//   }, [salesId, batchId, type]);

//   useFocusEffect(
//     useCallback(() => {
//       loadSale();
//     }, [loadSale])
//   );

//   const handleDeleteItem = async (itemToDelete: any) => {
//     Alert.alert('Confirm Delete', `Remove ${itemToDelete.name} from this stock out record?`, [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             const updatedItems = saleItems.filter(
//               (i) =>
//                 !(
//                   i.stockItemId === itemToDelete.stockItemId &&
//                   i.name === itemToDelete.name
//                 )
//             );

//             const allSales = await getSaleItems();

//             const remaining = allSales.filter((i) => {
//               const sameGroup = isBulkSale
//                 ? i.batchId === saleGroupId || i.salesId === saleGroupId
//                 : i.salesId === salesId;

//               const sameItem =
//                 i.stockItemId === itemToDelete.stockItemId &&
//                 i.name === itemToDelete.name;

//               return !(sameGroup && sameItem);
//             });

//             await saveAllSales(remaining);

//             const stock = await getStockItem(itemToDelete.stockItemId);
//             if (stock) {
//               await updateStockQuantity(
//                 itemToDelete.stockItemId,
//                 Number(stock.quantity) + Number(itemToDelete.quantity)
//               );
//             }

//             setSaleItems(updatedItems);
//             recalcTotals(updatedItems);

//             if (updatedItems.length === 0) {
//               Alert.alert('Deleted', 'All items removed. Returning to history.', [
//                 {
//                   text: 'OK',
//                   onPress: () => router.replace('/(tabs)/saleList'),
//                 },
//               ]);
//               return;
//             }

//             Alert.alert('Deleted', 'Item removed and stock restored.');
//           } catch (err) {
//             console.error('Failed to delete item:', err);
//             Alert.alert('Error', 'Could not delete the item.');
//           }
//         },
//       },
//     ]);
//   };

//   const handleDeleteSale = async () => {
//     Alert.alert(
//       'Confirm',
//       `Delete this ${isBulkSale ? 'bulk sale' : 'sale'} completely? Stock will be restored.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const allSales = await getSaleItems();

//               const thisSale = allSales.filter(matchesCurrentSale);
//               const remaining = allSales.filter((s) => !matchesCurrentSale(s));

//               await saveAllSales(remaining);

//               for (const item of thisSale) {
//                 const stock = await getStockItem(item.stockItemId);

//                 if (stock) {
//                   await updateStockQuantity(
//                     item.stockItemId,
//                     Number(stock.quantity) + Number(item.quantity)
//                   );
//                 }
//               }

//               Alert.alert('Deleted', 'Stock out record removed and stock restored.', [
//                 {
//                   text: 'OK',
//                   onPress: () => router.replace('/(tabs)/saleList'),
//                 },
//               ]);
//             } catch (err) {
//               console.error('Error deleting sale:', err);
//               Alert.alert('Error', 'Could not delete sale.');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleTogglePaid = async () => {
//     try {
//       const newStatus = !paidStatus;
//       setPaidStatus(newStatus);

//       const allSales = await getSaleItems();

//       const updated = allSales.map((s) =>
//         matchesCurrentSale(s) ? { ...s, paid: newStatus } : s
//       );

//       await saveAllSales(updated);

//       Alert.alert('Updated', `Marked as ${newStatus ? 'Paid' : 'Unpaid'}.`);
//     } catch (err) {
//       console.error('Error updating paid status:', err);
//       Alert.alert('Error', 'Could not update status.');
//     }
//   };

//   const formatCurrency = (val: number) =>
//     new Intl.NumberFormat('en-GB', {
//       style: 'currency',
//       currency: 'GBP',
//       minimumFractionDigits: 2,
//     }).format(val);

//   const generateInvoiceNumber = async (): Promise<string> => {
//     const year = new Date().getFullYear();
//     const stored = await AsyncStorage.getItem('invoice_counter');
//     const next = stored ? parseInt(stored) + 1 : 1;
//     await AsyncStorage.setItem('invoice_counter', next.toString());
//     return `INV-${year}-${String(next).padStart(3, '0')}`;
//   };

//   const handleInvoice = async (mode: 'preview' | 'print' | 'download') => {
//     try {
//       const userId = user?.$id || 'guest';
//       const profile = await getCompanyProfile(userId);

//       const companyName =
//         profile?.companyName || (isProUser ? 'My Business' : 'StockTally Invoice');

//       const address = profile?.address || '';
//       const phone = profile?.phoneNumber || '';
//       const logoUri = await getInvoiceLogoUri(profile);
//       const invoiceNumber = await generateInvoiceNumber();

//       let grandTotal = 0;

//       const itemRows = saleItems
//         .map((item) => {
//           const itemTotal = Number(item.price || 0) * Number(item.quantity || 0);
//           grandTotal += itemTotal;

//           return `
//             <tr>
//               <td>${item.name}</td>
//               <td>${item.quantity}</td>
//               <td>${formatCurrency(Number(item.price || 0))}</td>
//               <td>${formatCurrency(itemTotal)}</td>
//             </tr>
//           `;
//         })
//         .join('');

//       const html = `
//         <html>
//           <head>
//             <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//             <style>
//               body {
//                 font-family: Arial, sans-serif;
//                 padding: 24px;
//                 background-color: #fff;
//               }
//               .invoice-box {
//                 max-width: 800px;
//                 margin: auto;
//                 border: 1px solid #eee;
//                 padding: 30px;
//                 border-radius: 8px;
//               }
//               h2 { color: #007AFF; text-align: center; }
//               .company { text-align:center; margin-bottom: 16px; }
//               table {
//                 width: 100%;
//                 border-collapse: collapse;
//                 margin-top: 20px;
//               }
//               th, td {
//                 border: 1px solid #ddd;
//                 padding: 8px;
//                 text-align: left;
//               }
//               th {
//                 background-color: #007AFF;
//                 color: #fff;
//               }
//               .totals {
//                 text-align: right;
//                 font-weight: bold;
//                 padding-top: 10px;
//                 color: #007AFF;
//               }
//             </style>
//           </head>
//           <body>
//             <div class="invoice-box">
//               <div class="company">
//                 ${
//                   isProUser && logoUri
//                     ? `<img src="${logoUri}" style="max-width:100px"/>`
//                     : `<h2>${companyName}</h2>`
//                 }
//                 <p>${address}</p>
//                 <p>${phone}</p>
//               </div>

//               <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
//               <p><strong>Buyer:</strong> ${buyerName}</p>
//               <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-GB')}</p>
//               <p><strong>Status:</strong> ${paidStatus ? 'Paid' : 'Unpaid'}</p>
//               <p><strong>Type:</strong> ${isBulkSale ? 'Bulk Sale' : 'Quick Sale'}</p>

//               <table>
//                 <tr>
//                   <th>Item</th>
//                   <th>Qty</th>
//                   <th>Price</th>
//                   <th>Total</th>
//                 </tr>
//                 ${itemRows}
//               </table>

//               <div class="totals">Grand Total: ${formatCurrency(grandTotal)}</div>
//             </div>
//           </body>
//         </html>
//       `;

//       if (mode === 'preview') {
//         await Print.printAsync({ html });
//       } else if (mode === 'print') {
//         const { uri } = await Print.printToFileAsync({ html });
//         await Sharing.shareAsync(uri);
//       } else {
//         const { uri } = await Print.printToFileAsync({ html });
//         const filename = `Invoice_${invoiceNumber}.pdf`;
//         const dest = `${FileSystem.documentDirectory}${filename}`;

//         await FileSystem.copyAsync({ from: uri, to: dest });
//         Alert.alert('Saved', `Invoice downloaded as ${filename}`);
//       }
//     } catch (err) {
//       console.error('Invoice generation failed:', err);
//       Alert.alert('Error', 'Could not generate invoice.');
//     }
//   };

//   const handleAddBrand = () => {
//     if (!isProUser) {
//       Alert.alert(
//         'Pro Feature',
//         'Adding your company brand is available for Pro users only.',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Upgrade', onPress: () => router.push('/paywall') },
//         ]
//       );
//       return;
//     }

//     router.push('/screens/CompanyProfileScreen');
//   };

//   if (loading) {
//     return (
//       <ScreenWrapper>
//         <LinearGradient colors={['#0d1b2a', '#1b263b', '#415a77']} style={styles.gradient}>
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#fff" />
//             <Text style={styles.loadingText}>Loading stock out record...</Text>
//           </View>
//         </LinearGradient>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <LinearGradient colors={['#0d1b2a', '#1b263b', '#415a77']} style={styles.gradient}>
//         <SafeAreaView style={{ flex: 1 }}>
//           <ScrollView contentContainerStyle={styles.scroll}>
//             <View style={styles.header}>
//               <View style={styles.headerTop}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.buyerName}>{buyerName}</Text>
//                   <Text style={styles.date}>
//                     {date ? new Date(date).toLocaleDateString('en-GB') : ''}
//                   </Text>
//                 </View>

//                 <TouchableOpacity
//                   onPress={handleTogglePaid}
//                   style={[
//                     styles.badge,
//                     { backgroundColor: paidStatus ? '#4CAF50' : '#F44336' },
//                   ]}
//                 >
//                   <Text style={styles.badgeText}>
//                     {paidStatus ? 'Paid' : 'Unpaid'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.typeRow}>
//                 <Text style={[styles.typeBadge, isBulkSale ? styles.bulkBadge : styles.quickBadge]}>
//                   {isBulkSale ? 'Bulk Sale' : 'Quick Sale'}
//                 </Text>

//                 <Text style={styles.total}>£{total.toFixed(2)}</Text>
//               </View>

//               <Text style={styles.summaryText}>{totalItems} units</Text>
//             </View>

//             {saleItems.map((item, idx) => (
//               <View key={`${item.stockItemId}-${idx}`} style={styles.itemCard}>
//                 <View style={styles.itemHeader}>
//                   <Text style={styles.itemName}>{item.name}</Text>

//                   <TouchableOpacity onPress={() => handleDeleteItem(item)}>
//                     <Text style={styles.deleteText}>✕</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.detailText}>
//                   {Number(item.quantity)} × £{Number(item.price || 0).toFixed(2)}
//                 </Text>

//                 <Text style={styles.itemTotal}>
//                   £{(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}
//                 </Text>
//               </View>
//             ))}

//             <View style={styles.actionsContainer}>
//               <View style={styles.rowButtons}>
//                 {!isBulkSale && (
//                   <TouchableOpacity
//                     style={[styles.halfButton, styles.editButton]}
//                     onPress={() =>
//                       router.push({
//                         pathname: '/screens/sales/editSale',
//                         params: { salesId },
//                       })
//                     }
//                     activeOpacity={0.8}
//                   >
//                     <Text style={styles.actionText}>Edit Sale</Text>
//                   </TouchableOpacity>
//                 )}

//                 <TouchableOpacity
//                   style={[
//                     styles.halfButton,
//                     styles.deleteButton,
//                     isBulkSale && { flex: 1 },
//                   ]}
//                   onPress={handleDeleteSale}
//                   activeOpacity={0.8}
//                 >
//                   <Text style={styles.actionText}>Delete Sale</Text>
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={[styles.actionButton, styles.printButton]}
//                 onPress={() => handleInvoice('print')}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.actionText}>Print Invoice</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.actionButton, styles.downloadButton]}
//                 onPress={() => handleInvoice('download')}
//               >
//                 <Text style={styles.actionText}>Download PDF</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.brandButton}
//                 onPress={handleAddBrand}
//               >
//                 <MaterialCommunityIcons
//                   name="crown"
//                   size={20}
//                   color="#000"
//                   style={{ marginRight: 8 }}
//                 />
//                 <Text style={[styles.buttonText, { color: '#000', fontWeight: '700' }]}>
//                   {isProUser ? 'Add Company Branding' : 'Unlock Company Branding'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </SafeAreaView>
//       </LinearGradient>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: { flex: 1 },
//   scroll: { padding: 20, paddingBottom: 50 },
//   loadingContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingText: {
//     color: '#fff',
//     marginTop: 10,
//     fontWeight: '700',
//   },
//   header: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 10,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   buyerName: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: '#fff',
//   },
//   date: {
//     color: '#ddd',
//     fontSize: 14,
//     marginTop: 4,
//   },
//   typeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 14,
//   },
//   typeBadge: {
//     color: '#fff',
//     fontWeight: '900',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 999,
//     overflow: 'hidden',
//     fontSize: 12,
//   },
//   quickBadge: {
//     backgroundColor: '#2563eb',
//   },
//   bulkBadge: {
//     backgroundColor: '#0f766e',
//   },
//   badge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 999,
//   },
//   badgeText: {
//     color: '#fff',
//     fontWeight: '800',
//   },
//   total: {
//     color: '#fff',
//     fontWeight: '900',
//     fontSize: 20,
//   },
//   summaryText: {
//     color: '#cbd5e1',
//     marginTop: 8,
//     fontWeight: '700',
//   },
//   itemCard: {
//     backgroundColor: '#45556e',
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 10,
//   },
//   itemHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   itemName: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//     flex: 1,
//   },
//   detailText: {
//     color: '#eee',
//     marginTop: 6,
//   },
//   itemTotal: {
//     color: '#fff',
//     fontWeight: '900',
//     marginTop: 6,
//   },
//   deleteText: {
//     color: '#ff4d4d',
//     fontWeight: '900',
//     fontSize: 18,
//     paddingLeft: 12,
//   },
//   actionsContainer: {
//     marginTop: 25,
//     gap: 12,
//   },
//   rowButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   halfButton: {
//     flex: 1,
//     borderRadius: 10,
//     paddingVertical: 12,
//     alignItems: 'center',
//     elevation: 3,
//   },
//   actionButton: {
//     borderRadius: 10,
//     paddingVertical: 12,
//     alignItems: 'center',
//     elevation: 3,
//   },
//   editButton: {
//     backgroundColor: '#2196F3',
//   },
//   deleteButton: {
//     backgroundColor: '#E53935',
//   },
//   printButton: {
//     backgroundColor: '#43A047',
//   },
//   downloadButton: {
//     backgroundColor: '#0d6a7f',
//   },
//   actionText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16,
//   },
//   brandButton: {
//     backgroundColor: '#FFD700',
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 5,
//     flexDirection: 'row',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16,
//   },
// });

// export default ViewSaleScreen;

import ScreenWrapper from '@/components/ScreenWrapper';
import { useCompanyProfile } from '@/context/CompanyProfileContext';
import { formatCurrencyFromProfile } from '@/lib/currency';
import { getInvoiceLogoUri } from '@/lib/logo';
import {
  getSaleItems,
  getStockItem,
  saveAllSales,
  updateStockQuantity,
} from '@/lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ViewSaleScreen = () => {
  const router = useRouter();
  const { companyProfile } = useCompanyProfile();

  const { salesId, batchId, type } = useLocalSearchParams<{
    salesId?: string;
    batchId?: string;
    type?: string;
  }>();

  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [paidStatus, setPaidStatus] = useState(false);
  const [date, setDate] = useState('');
  const [total, setTotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const currencyCode = companyProfile?.currencyCode || 'GBP';
  const locale = companyProfile?.locale || 'en-GB';

  const money = (amount: number) =>
    formatCurrencyFromProfile(amount, companyProfile ?? undefined);

  const isBulkSale = type === 'bulk_sale' || !!batchId;

  const saleGroupId = useMemo(() => {
    return batchId || salesId;
  }, [batchId, salesId]);

  const matchesCurrentSale = (sale: any) => {
    if (isBulkSale) {
      return sale.batchId === saleGroupId || sale.salesId === saleGroupId;
    }

    return sale.salesId === salesId;
  };

  const recalcTotals = (items: any[]) => {
    const newTotal = items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );

    const newTotalItems = items.reduce(
      (sum, i) => sum + Number(i.quantity || 0),
      0
    );

    setTotal(newTotal);
    setTotalItems(newTotalItems);
  };

  const loadSale = useCallback(async () => {
    try {
      setLoading(true);

      const allSales = await getSaleItems();
      const thisSale = allSales.filter(matchesCurrentSale);

      if (thisSale.length === 0) {
        Alert.alert('Error', 'Sale not found.');
        router.back();
        return;
      }

      setSaleItems(thisSale);
      setBuyerName(
        thisSale[0].buyerName || (isBulkSale ? 'Bulk Sale' : 'Quick Sale')
      );
      setPaidStatus(thisSale[0].paid ?? true);
      setDate(thisSale[0].date);

      recalcTotals(thisSale);
    } catch (err) {
      console.error('Error loading sale:', err);
      Alert.alert('Error', 'Could not load sale.');
    } finally {
      setLoading(false);
    }
  }, [salesId, batchId, type]);

  useFocusEffect(
    useCallback(() => {
      loadSale();
    }, [loadSale])
  );

  const handleDeleteItem = async (itemToDelete: any) => {
    Alert.alert('Confirm Delete', `Remove ${itemToDelete.name} from this stock out record?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedItems = saleItems.filter(
              (i) =>
                !(
                  i.stockItemId === itemToDelete.stockItemId &&
                  i.name === itemToDelete.name
                )
            );

            const allSales = await getSaleItems();

            const remaining = allSales.filter((i) => {
              const sameGroup = isBulkSale
                ? i.batchId === saleGroupId || i.salesId === saleGroupId
                : i.salesId === salesId;

              const sameItem =
                i.stockItemId === itemToDelete.stockItemId &&
                i.name === itemToDelete.name;

              return !(sameGroup && sameItem);
            });

            await saveAllSales(remaining);

            const stock = await getStockItem(itemToDelete.stockItemId);
            if (stock) {
              await updateStockQuantity(
                itemToDelete.stockItemId,
                Number(stock.quantity) + Number(itemToDelete.quantity)
              );
            }

            setSaleItems(updatedItems);
            recalcTotals(updatedItems);

            if (updatedItems.length === 0) {
              Alert.alert('Deleted', 'All items removed. Returning to history.', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(tabs)/saleList'),
                },
              ]);
              return;
            }

            Alert.alert('Deleted', 'Item removed and stock restored.');
          } catch (err) {
            console.error('Failed to delete item:', err);
            Alert.alert('Error', 'Could not delete the item.');
          }
        },
      },
    ]);
  };

  const handleDeleteSale = async () => {
    Alert.alert(
      'Confirm',
      `Delete this ${isBulkSale ? 'bulk sale' : 'sale'} completely? Stock will be restored.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const allSales = await getSaleItems();

              const thisSale = allSales.filter(matchesCurrentSale);
              const remaining = allSales.filter((s) => !matchesCurrentSale(s));

              await saveAllSales(remaining);

              for (const item of thisSale) {
                const stock = await getStockItem(item.stockItemId);

                if (stock) {
                  await updateStockQuantity(
                    item.stockItemId,
                    Number(stock.quantity) + Number(item.quantity)
                  );
                }
              }

              Alert.alert('Deleted', 'Stock out record removed and stock restored.', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(tabs)/saleList'),
                },
              ]);
            } catch (err) {
              console.error('Error deleting sale:', err);
              Alert.alert('Error', 'Could not delete sale.');
            }
          },
        },
      ]
    );
  };

  const handleTogglePaid = async () => {
    try {
      const newStatus = !paidStatus;
      setPaidStatus(newStatus);

      const allSales = await getSaleItems();

      const updated = allSales.map((s) =>
        matchesCurrentSale(s) ? { ...s, paid: newStatus } : s
      );

      await saveAllSales(updated);

      Alert.alert('Updated', `Marked as ${newStatus ? 'Paid' : 'Unpaid'}.`);
    } catch (err) {
      console.error('Error updating paid status:', err);
      Alert.alert('Error', 'Could not update status.');
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const stored = await AsyncStorage.getItem('invoice_counter');
    const next = stored ? parseInt(stored, 10) + 1 : 1;
    await AsyncStorage.setItem('invoice_counter', next.toString());
    return `INV-${year}-${String(next).padStart(3, '0')}`;
  };

  const handleInvoice = async (mode: 'preview' | 'print' | 'download') => {
    try {
      const profile = companyProfile;

      const companyName = profile?.companyName || 'StockTally Invoice';
      const address = profile?.address || '';
      const phone = profile?.phoneNumber || '';
      const logoUri = await getInvoiceLogoUri(profile);
      const invoiceNumber = await generateInvoiceNumber();

      let grandTotal = 0;

      const itemRows = saleItems
        .map((item) => {
          const itemTotal = Number(item.price || 0) * Number(item.quantity || 0);
          grandTotal += itemTotal;

          return `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${money(Number(item.price || 0))}</td>
              <td>${money(itemTotal)}</td>
            </tr>
          `;
        })
        .join('');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 24px;
                background-color: #fff;
              }
              .invoice-box {
                max-width: 800px;
                margin: auto;
                border: 1px solid #eee;
                padding: 30px;
                border-radius: 8px;
              }
              h2 { color: #007AFF; text-align: center; }
              .company { text-align:center; margin-bottom: 16px; }
              .company img {
                max-width: 110px;
                max-height: 110px;
                object-fit: contain;
                margin-bottom: 8px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #007AFF;
                color: #fff;
              }
              .totals {
                text-align: right;
                font-weight: bold;
                padding-top: 10px;
                color: #007AFF;
              }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="company">
                ${logoUri ? `<img src="${logoUri}" />` : ''}
                <h2>${companyName}</h2>
                ${address ? `<p>${address}</p>` : ''}
                ${phone ? `<p>${phone}</p>` : ''}
              </div>

              <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
              <p><strong>Buyer:</strong> ${buyerName}</p>
              <p><strong>Date:</strong> ${date ? new Date(date).toLocaleDateString(locale) : ''}</p>
              <p><strong>Status:</strong> ${paidStatus ? 'Paid' : 'Unpaid'}</p>
              <p><strong>Type:</strong> ${isBulkSale ? 'Bulk Sale' : 'Quick Sale'}</p>

              <table>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
                ${itemRows}
              </table>

              <div class="totals">Grand Total: ${money(grandTotal)}</div>
            </div>
          </body>
        </html>
      `;

      if (mode === 'preview') {
        await Print.printAsync({ html });
      } else if (mode === 'print') {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        const filename = `Invoice_${invoiceNumber}.pdf`;
        const dest = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.copyAsync({ from: uri, to: dest });
        Alert.alert('Saved', `Invoice downloaded as ${filename}`);
      }
    } catch (err) {
      console.error('Invoice generation failed:', err);
      Alert.alert('Error', 'Could not generate invoice.');
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient colors={['#0d1b2a', '#1b263b', '#415a77']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading stock out record...</Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <LinearGradient colors={['#0d1b2a', '#1b263b', '#415a77']} style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.buyerName}>{buyerName}</Text>
                  <Text style={styles.date}>
                    {date ? new Date(date).toLocaleDateString(locale) : ''}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleTogglePaid}
                  style={[
                    styles.badge,
                    { backgroundColor: paidStatus ? '#4CAF50' : '#F44336' },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {paidStatus ? 'Paid' : 'Unpaid'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.typeRow}>
                <Text style={[styles.typeBadge, isBulkSale ? styles.bulkBadge : styles.quickBadge]}>
                  {isBulkSale ? 'Bulk Sale' : 'Quick Sale'}
                </Text>

                <Text style={styles.total}>{money(total)}</Text>
              </View>

              <Text style={styles.summaryText}>{totalItems} units</Text>
            </View>

            {saleItems.map((item, idx) => (
              <View key={`${item.stockItemId}-${idx}`} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>

                  <TouchableOpacity onPress={() => handleDeleteItem(item)}>
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.detailText}>
                  {Number(item.quantity)} × {money(Number(item.price || 0))}
                </Text>

                <Text style={styles.itemTotal}>
                  {money(Number(item.quantity || 0) * Number(item.price || 0))}
                </Text>
              </View>
            ))}

            <View style={styles.actionsContainer}>
              <View style={styles.rowButtons}>
                {!isBulkSale && (
                  <TouchableOpacity
                    style={[styles.halfButton, styles.editButton]}
                    onPress={() =>
                      router.push({
                        pathname: '/screens/sales/editSale',
                        params: { salesId },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionText}>Edit Sale</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.halfButton,
                    styles.deleteButton,
                    isBulkSale && { flex: 1 },
                  ]}
                  onPress={handleDeleteSale}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionText}>Delete Sale</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, styles.printButton]}
                onPress={() => handleInvoice('print')}
                activeOpacity={0.8}
              >
                <Text style={styles.actionText}>Print Invoice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={() => handleInvoice('download')}
              >
                <Text style={styles.actionText}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 50 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: '700',
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  buyerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  date: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  typeBadge: {
    color: '#fff',
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
  },
  quickBadge: {
    backgroundColor: '#2563eb',
  },
  bulkBadge: {
    backgroundColor: '#0f766e',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '800',
  },
  total: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
  },
  summaryText: {
    color: '#cbd5e1',
    marginTop: 8,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: '#45556e',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  detailText: {
    color: '#eee',
    marginTop: 6,
  },
  itemTotal: {
    color: '#fff',
    fontWeight: '900',
    marginTop: 6,
  },
  deleteText: {
    color: '#ff4d4d',
    fontWeight: '900',
    fontSize: 18,
    paddingLeft: 12,
  },
  actionsContainer: {
    marginTop: 25,
    gap: 12,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 3,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#E53935',
  },
  printButton: {
    backgroundColor: '#43A047',
  },
  downloadButton: {
    backgroundColor: '#0d6a7f',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ViewSaleScreen;