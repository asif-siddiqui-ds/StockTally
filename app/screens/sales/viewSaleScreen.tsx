import ScreenWrapper from '@/components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProUser } from '@/context/ProUserContext';
import { getInvoiceLogoUri } from '@/lib/logo';
import {
  getCompanyProfile,
  getStockItem,
  updateStockQuantity, 
  getSaleItems,
  saveAllSales,
  normalizeDate,
} from '@/lib/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from "expo-file-system";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


const ViewSaleScreen = () => {
  const params = useLocalSearchParams();
  const buyerName = params.buyerName ?? "Unknown";
  const paid = params.paid === "true" || params.paid === true;
  const totalParam = Number(params.total ?? 0);
  // ✅ ensure date is always valid ISO string
  let dateParam = params.date;
  if (!dateParam || isNaN(new Date(dateParam).getTime())) {
    dateParam = new Date().toISOString(); // fallback to today
  }
  const date = dateParam;

  const router = useRouter();
  const { user } = useAuth();
  const { isProUser } = useProUser();
  const [total, setTotal] = useState(totalParam);
  const [totalItems, setTotalItems] = useState(0);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [paidStatus, setPaidStatus] = useState(
  paid === "true" || paid === true ? true : false
);
// normalize incoming param date
const paramDateISO = new Date(date).toISOString();

// 🧩 Load sale + stock data
  // useEffect(() => {
  //   const loadData = async () => {
  //     const all = await getSaleItems();
  //     const stocks = await getStockItems();
  //     setStockList(stocks);
  //     setAllSales(all);

  //     const current = all.filter(
  //       (s) =>
  //         s.buyerName === paramBuyerName &&
  //         new Date(s.date).toDateString() === new Date(paramDateISO).toDateString()
  //     );
  //     setSaleItems(current);
  //   };
  //   loadData();
  // }, []);

  // 🧩 Load sale items for this buyer & date
  //sales/screen/viewSaleSreen.tsx
  useFocusEffect(
    useCallback(() => {
      const loadSaleDetails = async () => {
        try {
          const allSales = await getSaleItems();
          const thisSale = allSales.filter(
            (s) =>
              s.buyerName === buyerName &&
            new Date(s.date).toDateString() === new Date(paramDateISO).toDateString()
          );

          setSaleItems(thisSale);

          // 🧮 Update totals dynamically
          const newTotal = thisSale.reduce(
            (sum, i) => sum + Number(i.price) * Number(i.quantity),
            0
          );
          const newTotalItems = thisSale.reduce(
            (sum, i) => sum + Number(i.quantity),
            0
          );

          setTotal(newTotal);
          setTotalItems(newTotalItems);
        } catch (err) {
          console.error("❌ Error loading sale:", err);
        }
      };

      loadSaleDetails();
    }, [buyerName, date])
  );

  // 🗑️ Delete individual item
  // 🗑️ Delete individual item & persist changes
  const handleDeleteItem = async (itemId: string) => {
  // Find the specific item to delete
  const itemToDelete = saleItems.find((i) => i.stockItemId === itemId);

  if (!itemToDelete) {
    Alert.alert("Error", "Item not found.");
    return;
  }
    if (saleItems.length <= 1) {
    Alert.alert("Action Not Allowed", "A sale must contain at least one item.");
    return;
  }

  Alert.alert("Confirm Delete", "Remove this item from sale?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          // 1️⃣ Remove item from local state
          const updatedItems = saleItems.filter((i) => i.stockItemId !== itemId);
          setSaleItems(updatedItems);

          // 2️⃣ Recalculate totals
          const newTotal = updatedItems.reduce(
            (sum, i) => sum + Number(i.price) * Number(i.quantity),
            0
          );
          const newTotalItems = updatedItems.reduce(
            (sum, i) => sum + Number(i.quantity),
            0
          );

          // 3️⃣ Load all sales from storage
          const allSales = await getSaleItems();

          // 4️⃣ Filter out the deleted sale item from all sales
          const remainingSales = allSales.filter(
            (i) =>
              !(
                i.stockItemId === itemToDelete.stockItemId &&
                i.buyerName === itemToDelete.buyerName &&
                new Date(i.date).toDateString() === new Date(itemToDelete.date).toDateString()

              )
          );

          // 5️⃣ Save updated sales list
          await saveAllSales(remainingSales); // 👈 use saveAllSales, not saveSaleItem

          // 6️⃣ Restore stock for the deleted item
          const stockItem = await getStockItem(itemToDelete.stockItemId);
          if (stockItem) {
            const restoredQty = stockItem.quantity + itemToDelete.quantity;
            await updateStockQuantity(itemToDelete.stockItemId, restoredQty);
            console.log(
              `✅ Restored ${itemToDelete.quantity} units to ${stockItem.name}. New stock: ${restoredQty}`
            );
          } else {
            console.warn(
              `⚠️ Stock item not found for ID: ${itemToDelete.stockItemId}`
            );
          }

          // 7️⃣ Update UI totals immediately
          setTotal(newTotal);
          setTotalItems(newTotalItems);

          Alert.alert("Deleted", "Item has been removed and stock updated.");
        } catch (error) {
          console.error("❌ Failed to delete item:", error);
          Alert.alert("Error", "Could not delete the item. Please try again.");
        }
      },
    },
  ]);
};


  // 🗑️ Delete entire sale (with data integrity + UI refresh)
      const handleDeleteSale = async (sale: any) => {
      try {
        // 🧩 Fetch all sale records
        const allSales = await getSaleItems();
    
        // 🧮 Find all items that belong to this sale (same buyer & date)
        const matchedSales = allSales.filter(
          (i) =>
            i.buyerName === sale.buyerName &&
            new Date(i.date).toDateString() === new Date(sale.date).toDateString()
        );
    
        if (matchedSales.length === 0) {
          Alert.alert("Not Found", "No sale items found to delete.");
          return;
        }
    
        console.log(`🧾 Found ${matchedSales.length} item(s) in this sale.`);
    
        // 🧮 Group by stockItemId (in case multiple records exist for the same item)
        const groupedByItem: Record<string, number> = {};
        for (const item of matchedSales) {
          groupedByItem[item.stockItemId] =
            (groupedByItem[item.stockItemId] || 0) + item.quantity;
        }
    
        // 🔁 Restore stock for each unique item
        for (const [stockItemId, totalSoldQty] of Object.entries(groupedByItem)) {
          try {
            const stockItem = await getStockItem(stockItemId);
            if (stockItem) {
              const newStockQty = stockItem.quantity + totalSoldQty;
              await updateStockQuantity(stockItemId, newStockQty);
              console.log(
                `✅ Restored ${totalSoldQty} units to ${stockItem.name}. New stock: ${newStockQty}`
              );
            } else {
              console.warn(`⚠️ Stock item not found for ID: ${stockItemId}`);
            }
          } catch (err) {
            console.error(`Error restoring stock for ${stockItemId}:`, err);
          }
        }
    
        // 🧹 Remove all sale records for this buyer/date
        const updatedSales = allSales.filter(
          (i) =>
            !(
              i.buyerName === sale.buyerName &&
              new Date(i.date).toDateString() === new Date(sale.date).toDateString()
            )
        );
    
        await saveAllSales(updatedSales);
    
        // 🪄 Update state in UI
        setFilteredSales((prev) =>
          prev.filter(
            (s) =>
              !(
                s.buyerName === sale.buyerName &&
                new Date(s.date).toDateString() === new Date(date).toDateString()

              )
          )
        );
    
        Alert.alert("Deleted", "Sale and all related items removed, stock restored.");
      } catch (err) {
        console.error("❌ Error deleting sale:", err);
        Alert.alert("Error", "Could not delete this sale.");
      }
    };


  // 🖨️ Print Invoice
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

    const handleInvoice = async (mode: "preview" | "print" | "download") => {
    try {
        const userId = user?.$id || "guest";
        const profile = await getCompanyProfile(userId);

        const companyName =
        profile?.companyName || (isProUser ? "My Business" : "StockTally Invoice");
        const address = profile?.address || "";
        const phone = profile?.phoneNumber || "";

        const invoiceNumber = await generateInvoiceNumber();
        const logoUri = await getInvoiceLogoUri(profile);

        let grandTotal = 0;
        const itemRows = saleItems
        .map((item) => {
            const itemTotal = Number(item.price) * Number(item.quantity);
            grandTotal += itemTotal;
            return `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(Number(item.price), "GBP")}</td>
                <td>${formatCurrency(itemTotal, "GBP")}</td>
            </tr>
            `;
        })
        .join("");

        const formattedTotal = formatCurrency(grandTotal, "GBP");

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
                <p><strong>Date:</strong> ${date || new Date().toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${paidStatus ? "Paid" : "Unpaid"}</p>
                </div>

                <table>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
                ${itemRows}
                </table>

                <div class="totals">Grand Total: ${formattedTotal}</div>

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

        // 🖨️ Print, Share or Download
        if (mode === "preview") {
        await Print.printAsync({ html });
        } else if (mode === "print") {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
        } else if (mode === "download") {
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        const fileName = `Invoice_${invoiceNumber}.pdf`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.copyAsync({
            from: uri,
            to: newPath,
        });

        Alert.alert("Downloaded", `Invoice saved to Documents as ${fileName}`);
        console.log(`📄 Invoice saved to: ${newPath}`);
        }
    } catch (err) {
        console.error("❌ Invoice generation failed:", err);
        Alert.alert("Error", "Failed to generate invoice. Please try again.");
    }
    };


  // 🏷️ Add Company Brand (Pro only)
  const handleAddBrand = () => {
    if (!isProUser) {
      Alert.alert(
        'Pro Feature',
        'Adding your company brand is available for Pro users only.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
        ]
      );
      return;
    }
    router.push('/screens/companyProfileScreen');
  };

  return (
    <ScreenWrapper>
      <LinearGradient colors={['#0d1b2a', '#1b263b', '#415a77']} style={styles.gradient}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* 📌 Header Info */}
            <View style={styles.header}>
                <Text style={styles.buyerName}>{buyerName}</Text>
                <Text style={styles.date}>{new Date(date).toLocaleDateString('en-GB')}</Text>

                <View style={styles.statusRow}>
                    <TouchableOpacity
                        onPress={async () => {
                            try {
                            const newStatus = !paidStatus;
                            setPaidStatus(newStatus);

                            // 🧠 Persist change in Appwrite/local storage
                            const allSales = await getSaleItems();
                            const updatedSales = allSales.map((s) =>
                                s.buyerName === buyerName &&
                                new Date(s.date).toDateString() === new Date(date).toDateString()
                                ? { ...s, paid: newStatus }
                                : s
                            );
                            await saveAllSales(updatedSales);

                            Alert.alert(
                                "Status Updated",
                                `Marked as ${newStatus ? "Paid" : "Unpaid"}.`
                            );
                            } catch (err) {
                            console.error("❌ Error updating paid status:", err);
                            Alert.alert("Error", "Could not update payment status. Please try again.");
                            }
                        }}
                        activeOpacity={0.8} // 🔹 subtle press feedback
                        style={[
                            styles.badge,
                            {
                            backgroundColor: paidStatus ? "#4CAF50" : "#F44336",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                            shadowColor: "#000",
                            shadowOpacity: 0.2,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 3,
                            elevation: 2, // Android drop shadow
                            },
                        ]}
                        >
                        <Text style={styles.badgeText}>{paidStatus ? "Paid" : "Unpaid"}</Text>
                        <Text style={{ color: "#fff", marginLeft: 6, opacity: 0.7 }}>↻</Text>
                        </TouchableOpacity>


                    <Text style={styles.total}>£{Number(total).toFixed(2)}</Text>
                </View>
            </View>

            {/* 🧾 Item Cards */}
            {saleItems.map((item, idx) => (
              <View key={idx} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item.stockItemId)}
                    style={styles.deleteIcon}
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.detailText}>Quantity: {item.quantity}</Text>
                  <Text style={styles.detailText}>Price: £{item.price.toFixed(2)}</Text>
                </View>
              </View>
            ))}

            {/* 🧭 Buttons */}
            {/* 🧭 Action Buttons */}
            <View style={styles.actionsContainer}>

                {/* ✏️ Edit + 🗑️ Delete (Side by Side) */}
                <View style={styles.rowButtons}>
                    <TouchableOpacity
                    style={[styles.halfButton, styles.editButton]}
                    onPress={() =>
                        router.push({
                        pathname: '/screens/sales/[id]',
                        params: { buyerName, date },
                        })
                    }
                    activeOpacity={0.8}
                    >
                    <Text style={styles.actionText}>Edit Sale</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    style={[styles.halfButton, styles.deleteButton]}
                    onPress={handleDeleteSale}
                    activeOpacity={0.8}
                    >
                    <Text style={styles.actionText}>Delete Sale</Text>
                    </TouchableOpacity>
                </View>

                {/* 🖨️ Print Invoice */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.printButton]}
                    onPress={() => handleInvoice("print")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionText}>Print Invoice</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.actionButton, styles.downloadButton]}
                    onPress={() => handleInvoice("download")}
                >
                    <Text style={styles.actionText}>Download PDF</Text>
                </TouchableOpacity>


                {/* 🏷️ Add Company Brand */}
                 <TouchableOpacity
                    style={[styles.brandButton, { backgroundColor: '#FFD700', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                    onPress={() => isProUser
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
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: { padding: 20, gap: 15 },
  header: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  buyerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  date: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  badge: {
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '600',
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  itemCard: {
    backgroundColor: '#45556e',
    borderRadius: 16,
    padding: 14,
    position: 'relative',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  deleteIcon: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: { color: '#ff4d4d', fontWeight: '700', fontSize: 14 },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  detailText: { color: '#eee', fontSize: 14 },
  actionsContainer: {
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 3,
  elevation: 3,
},

actionButton: {
  borderRadius: 10,
  paddingVertical: 12,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 3,
  elevation: 3,
},

// 💙 Edit Button
editButton: {
  backgroundColor: '#2196F3',
},

// ❤️ Delete Button
deleteButton: {
  backgroundColor: '#E53935',
},

// 💚 Print Button
printButton: {
  backgroundColor: '#43A047',
},


// 💛 Brand Button
downloadButton: {
  backgroundColor: '#0d6a7fff',
},

// 🩶 Disabled (non-Pro)
disabledButton: {
  backgroundColor: '#9E9E9E',
},

actionText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 16,
},
badge: {
  borderRadius: 12,
  paddingHorizontal: 10,
  paddingVertical: 4,
  alignItems: "center",
  justifyContent: "center",
},
badgeText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 16,
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

export default ViewSaleScreen;
