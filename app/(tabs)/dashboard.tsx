// // app/screens/Dashboard.tsx

// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useProUser } from '@/context/ProUserContext';
// // import { useProUser } from '@/lib/ProUserContext';
// import { getReturnItems, getSaleItems, getStockItems, ReturnItem, SaleItem, StockItem } from '@/lib/storage';
// import * as FileSystem from 'expo-file-system';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Print from 'expo-print';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useRef, useState } from 'react';
// import { ActivityIndicator, Button, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { BarChart, PieChart } from 'react-native-chart-kit';
// // import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import * as Sharing from "expo-sharing";
// import { Alert } from "react-native";
// import ViewShot from 'react-native-view-shot';


// let DateTimePickerModal: any = null;
// if (Platform.OS !== 'web') {
//   try {
//     DateTimePickerModal = require('react-native-modal-datetime-picker').default;
//   } catch (error) {
//     console.warn('⚠️ DateTimePickerModal not available on this platform');
//   }
// }
// const screenWidth = Dimensions.get('window').width || 400;

// interface TableRowData {
//   name: string;
//   stock: number;
//   return: number;
//   sold: number;
//   income: number;
// }

// const Dashboard = () => {
//   const { isProUser, loading } = useProUser();
  
//   const router = useRouter();

//   // 🚀 Redirect non-Pro users
//   useEffect(() => {
//     if (!loading && !isProUser) {
//       router.replace('/paywall');
//     }
//   }, [loading, isProUser, router]);

//   if (loading) {
//     return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
//   }

//   if (!isProUser) {
//     return null; // nothing shown while redirecting
//   }

//   // 🔽 State
//   const [stockItems, setStockItems] = useState<StockItem[]>([]);
//   const [saleItems, setSoldItems] = useState<SaleItem[]>([]);
//   const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
//   const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'custom'>('all');
//   const [tableData, setTableData] = useState<TableRowData[]>([]);
//   const [totalIncome, setTotalIncome] = useState<number>(0);
//   const [totalStock, setTotalStock] = useState<number>(0);
//   const [totalReturn, setTotalReturn] = useState<number>(0);

//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   const barChartRef = useRef<ViewShot>(null);
//   const incomePieChartRef = useRef<ViewShot>(null);
//   const returnPieChartRef = useRef<ViewShot>(null);

//   const safeNumber = (val: any): number => {
//     const num = Number(val);
//     return isFinite(num) ? num : 0;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       const stock = await getStockItems();
//       const sales = await getSaleItems();
//       const returns = await getReturnItems();
//       setStockItems(stock);
//       setSoldItems(sales);
//       setReturnItems(returns);
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (stockItems.length | saleItems.length | returnItems.length) {
//       updateTableData();
//     }
//   }, [stockItems, saleItems, filter, startDate, endDate]);

//   const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
//   const endOfDay   = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

//   const weekRange = (ref: Date) => {
//     // Week starts Sunday; change `weekStartsOn = 1` for Monday-start
//     const weekStartsOn = 1;
//     const d = new Date(ref);
//     const diff = (d.getDay() - weekStartsOn + 7) % 7;
//     const start = startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff));
//     const end   = endOfDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));
//     return { start, end };
//   };

//   const monthRange = (ref: Date) => {
//     const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
//     const end   = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999); // last day of month
//     return { start, end };
//   };


//   const updateTableData = () => {
//     // 1) Decide the date window
//     let from: Date | null = null;
//     let to: Date | null = null;
//     const today = new Date();

//     switch (filter) {
//       case 'daily': {
//         from = startOfDay(today);
//         to   = endOfDay(today);
//         break;
//       }
//       case 'weekly': {
//         const { start, end } = weekRange(today);
//         from = start;
//         to   = end;
//         break;
//       }
//       case 'monthly': {
//         const { start, end } = monthRange(today);
//         from = start;
//         to   = end;
//         break;
//       }
//       case 'custom': {
//         // Normalize custom to full days
//         from = startOfDay(startDate);
//         to   = endOfDay(endDate);
//         break;
//       }
//       case 'all':
//       default:
//         // keep as nulls = no date filtering
//         break;
//     }

//     // 2) Filter sales by the window (if any)
//     let filteredSales = saleItems;
//     if (from && to) {
//       const fromTs = from.getTime();
//       const toTs   = to.getTime();
//       filteredSales = saleItems.filter((s) => {
//         const ts = new Date(s.date).getTime(); // works for ISO strings
//         return ts >= fromTs && ts <= toTs;
//       });
//     }

//     // 3) Build table rows from stock + filtered sales
//     const names = [...new Set([
//       ...stockItems.map(s => s.name),
//       ...returnItems.map(s => s.name),
//       ...filteredSales.map(s => s.name),
//     ])];

//     const data: TableRowData[] = names.map((name) => {
//       const stockQty = Number(stockItems.find(s => s.name === name)?.quantity ?? 0) || 0;
//       const returnQty = Number(returnItems.find(s => s.name === name)?.quantity ?? 0) || 0;
//       const salesForItem = filteredSales.filter(s => s.name === name);
//       const sold   = salesForItem.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
//       const income = salesForItem.reduce((sum, s) => sum + ((Number(s.price) || 0) * (Number(s.quantity) || 0)), 0);
//       return { name, stock: stockQty, return: returnQty, sold, income };
//     });

//     setTableData(data);
//     setTotalIncome(data.reduce((sum, r) => sum + r.income, 0));
//     setTotalStock(data.reduce((sum, r) => sum + r.stock, 0));
//     setTotalReturn(data.reduce((sum, r) => sum + r.return, 0));
//   };


//   const chartConfig = {
//     backgroundGradientFrom: '#fff',
//     backgroundGradientTo: '#fff',
//     decimalPlaces: 2,
//     color: (opacity = 1) => `rgba(70, 130, 180, ${opacity})`,
//     labelColor: () => `#000`,
//   };

// const exportReport = async () => {
//   try {
//     if (!barChartRef.current || !incomePieChartRef.current || !returnPieChartRef.current) {
//       Alert.alert("Error", "Charts not ready yet.");
//       return;
//     }
//     // 🖼️ Capture chart image
//     const incomePieUri = await incomePieChartRef.current.capture();
//     if (!incomePieUri) throw new Error("Failed to capture chart.");

//     // 🖼️ Capture chart image
//     const returnPieUri = await returnPieChartRef.current.capture();
//     if (!returnPieUri) throw new Error("Failed to capture chart.");

//     // 🖼️ Capture chart image
//     const barUri = await barChartRef.current.capture();
//     if (!barUri) throw new Error("Failed to capture chart.");

//     // 🧾 Generate HTML
//     const html = `
//       <html>
//         <body style="font-family: Arial;">
//           <h1>Dashboard Report</h1>
//           <h2>Total Income: £${totalIncome.toFixed(2)}</h2>
//           <h2>Total Stock: ${totalStock}</h2>
//           <h2>Total Returns: ${totalReturn}</h2>
//           <img src="${barUri}" style="width:100%;" />
//           <table border="1" cellspacing="0" cellpadding="4" style="margin-top: 20px; width: 100%;">
//             <tr><th>Item</th><th>Stock</th><th>Sold</th><th>Income (£)</th></tr>
//             ${tableData
//               .map(
//                 (r) =>
//                   `<tr>
//                     <td>${r.name}</td>
//                     <td>${r.stock}</td>
//                     <td>${r.sold}</td>
//                     <td>£${r.income.toFixed(2)}</td>
//                   </tr>`
//               )
//               .join("")}
//           </table>
//            <img src="${incomePieUri}" style="width:100%;" />
//            <img src="${returnPieUri}" style="width:100%;" />
//         </body>
//       </html>
      
//     `;

//     // 📄 Create PDF file
//     const { uri } = await Print.printToFileAsync({ html });
//     if (!uri) throw new Error("Failed to create PDF.");

//     const newPath = `${FileSystem.documentDirectory}DashboardReport.pdf`;
//     await FileSystem.moveAsync({ from: uri, to: newPath });


//     // 📤 Share the PDF (this opens iOS share sheet)
//     if (await Sharing.isAvailableAsync()) {
//       await Sharing.shareAsync(newPath);
//     } else {
//       Alert.alert("File saved at:", newPath);
//     }
//   } catch (err: any) {
//     console.error("❌ exportReport error:", err);
//     Alert.alert("Export Failed", err.message || "Could not generate report.");
//   }
// };


//   const formatDate = (date: Date) => {
//     return new Intl.DateTimeFormat('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     }).format(date);
//   };

//   const filteredIncomeData = tableData.filter(row => row.sold !== 0);
//   const filteredStockData = tableData.filter(row => row.stock !== 0);
//   const filteredReturnData = tableData.filter(row => row.return !== 0);

//   const chartColors = [
//   '#4CAF50', // green
//   '#FF9800', // orange
//   '#2196F3', // blue
//   '#9C27B0', // purple
//   '#FF5722', // deep orange
//   '#795548', // brown
//   '#607D8B', // blue grey
//   '#00BCD4', // cyan
//   '#8BC34A', // light green
//   '#E91E63', // pink
//   '#3F51B5', // indigo
//   '#FFC107', // amber
// ];

//   return (
    
//     <ScreenWrapper>
//     <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>

//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         <Text style={styles.title}>📊 Dashboard</Text>

//         <Text style={styles.summary}>Total Stock: {totalStock} | Total Return: {totalReturn}</Text>
//         {/* <Text style={styles.summary}>Total Return: {totalReturn}</Text> */}
//          <Text style={styles.summary}>Total Income: £{totalIncome.toFixed(2)}</Text>

//                 {/* Filter Buttons */}
//         <View style={styles.filterRow}>
//           {[
//             { label: "All", value: "all" },
//             { label: "Today", value: "daily" },
//             { label: "Week", value: "weekly" },
//             { label: "Month", value: "monthly" },
//             { label: "Custom", value: "custom" },
//           ].map(option => (
//             <TouchableOpacity
//               key={option.value}
//               style={[
//                 styles.filterButton,
//                 filter === option.value && styles.filterButtonActive
//               ]}
//               onPress={() => setFilter(option.value as any)}
//             >
//               <Text
//                 style={[
//                   styles.filterButtonText,
//                   filter === option.value && styles.filterButtonTextActive
//                 ]}
//               >
//                 {option.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Custom Range Picker (only if Custom selected) */}
//         {filter === 'custom' && DateTimePickerModal && (
//           <View style={styles.dateRangeRow}>
//             {/* Start Date */}
//             <TouchableOpacity
//               style={[styles.dateColumn, startDate && styles.dateColumnSelected]}
//               onPress={() => setShowStartPicker(true)}
//             >
//               <Text style={styles.dateBtn}>Select Start Date</Text>
//               <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
//             </TouchableOpacity>

//             <View style={styles.dateDivider} />

//             {/* End Date */}
//             <TouchableOpacity
//               style={[styles.dateColumn, endDate && styles.dateColumnSelected]}
//               onPress={() => setShowEndPicker(true)}
//             >
//               <Text style={styles.dateBtn}>Select End Date</Text>
//               <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
//             </TouchableOpacity>

//             {/* Date Pickers */}
//             <DateTimePickerModal
//               isVisible={showStartPicker}
//               mode="date"
//               onConfirm={(date) => {
//                 setShowStartPicker(false);
//                 if (date) setStartDate(date);
//               }}
//               onCancel={() => setShowStartPicker(false)}
//             />
//             <DateTimePickerModal
//               isVisible={showEndPicker}
//               mode="date"
//               onConfirm={(date) => {
//                 setShowEndPicker(false);
//                 if (date) setEndDate(date);
//               }}
//               onCancel={() => setShowEndPicker(false)}
//             />
//           </View>
//         )}
//         <Button title="Export PDF Report" onPress={exportReport} />

//         <View style={styles.table}>
//         <View style={styles.tableHeader}>
//           <Text style={styles.cell}>Item</Text>
//           <Text style={styles.cell}>Sold</Text>
//           <Text style={styles.cell}>Income</Text>
//         </View>

//         {filteredIncomeData.map((row, index) => (
//           <View
//             key={index}
//             style={[styles.tableRow, index % 2 ? styles.odd : styles.even]}
//           >
//             <Text style={styles.cell}>{row.name}</Text>
//             <Text style={styles.cell}>{row.sold}</Text>
//             <Text style={styles.cell}>£{row.income.toFixed(2)}</Text>
//           </View>
//         ))}
//       </View>
//       <ViewShot ref={incomePieChartRef} options={{ format: 'jpg', quality: 0.9 }}>
//         <Text style={styles.chartTitle}>Income per Item</Text>
//         <PieChart
//           data={filteredIncomeData.map((d, i) => ({
//             name: d.name,
//             population: d.income,
//             color: chartColors[i % chartColors.length],
//             legendFontColor: "#4484f3ff",
//             legendFontSize: 12,
//           }))}
//           width={screenWidth - 16}
//           height={220}
//           chartConfig={chartConfig}
//           accessor={"population"}
//           backgroundColor={"transparent"}
//           paddingLeft={"15"}
//           absolute={false} // ensures no raw values shown
//           hasLegend={true}
//           center={[0, 0]} // keep centered
//         />
          
//       </ViewShot>       
                
//       <Text style={styles.chartTitle}>Stock per Item</Text>

//         <View style={styles.table}>
//           <View style={styles.tableHeader}>
//             <Text style={styles.cell}>Item</Text>
//             <Text style={styles.cell}>Stock</Text>
//             <Text style={styles.cell}>Return</Text>
//           </View>
//           {filteredStockData.map((row, index) => (
//             <View key={index} style={[styles.tableRow, index % 2 ? styles.odd : styles.even]}>
//               <Text style={styles.cell}>{row.name}</Text>
//               <Text style={styles.cell}>{row.stock}</Text>
//               <Text style={styles.cell}>{row.return}</Text>
//             </View>
//           ))}
//         </View>
//         <ViewShot ref={barChartRef} options={{ format: 'jpg', quality: 0.9 }}>

//         {/* Stock as Pie Chart */}
//           {/* <Text style={styles.chartTitle}>Stock per Item</Text> */}
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             <BarChart
//               data={{
//                 labels: filteredStockData.map(d => d.name),
//                 datasets: [{ data: filteredStockData.map(d => safeNumber(d.stock)) }],
//               }}
//               width={Math.max(screenWidth, tableData.length * 80)} // 80px per item
//               height={300}
//               chartConfig={{
//                 backgroundGradientFrom: "#1b263b", 
//                 backgroundGradientTo: "#415a77",
//                 decimalPlaces: 0,
//                 color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.9})`,
//                 labelColor: () => "#f0f4f8",
//               }}
//               style={{ borderRadius: 8   }}
//               verticalLabelRotation={45}
//               yAxisLabel={""}
//               yAxisSuffix={""}
//             />
//           </ScrollView>
//         </ViewShot>

//         <ViewShot ref={returnPieChartRef} options={{ format: 'jpg', quality: 0.9 }}>
//           <Text style={styles.chartTitle}>Return per Item</Text>
//           <PieChart
//               data={filteredReturnData.map((d, i) => ({
//                 name: d.name,
//                 population: d.return,
//                 color: chartColors[i % chartColors.length],
//                 legendFontColor: "#4484f3ff",
//                 legendFontSize: 12,
//               }))}
//               width={screenWidth - 16}
//               height={220}
//               chartConfig={chartConfig}
//               accessor={"population"}
//               backgroundColor={"transparent"}
//               paddingLeft={"15"}
//               absolute={false} // ensures no raw values shown
//               hasLegend={true}
//               center={[0, 0]} // keep centered
//             />
          
//         </ViewShot>  
//       </ScrollView>
//     </LinearGradient>
//     </ScreenWrapper>
    
//   );
// };

// const styles = StyleSheet.create({
//   gradient: { flex: 1 },
//   title: { color: "#f0f4f8",fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
//   summary: { color: "#f0f4f8",fontSize: 16, textAlign: 'center', marginVertical: 4 },
//   picker: { marginVertical: 10, backgroundColor: '#eee' },
//   chart: { marginVertical: 10, borderRadius: 8 },
//   table: { marginVertical: 10 },
//   tableHeader: { flexDirection: 'row', backgroundColor: '#4c9eafff', padding: 6 },
//   tableRow: { flexDirection: 'row', padding: 6 },
//   cell: { flex: 1, textAlign: 'center' },
//   even: { backgroundColor: '#f9f9f9' },
//   odd: { backgroundColor: '#eee' },

//   // Custom Range Styles
//   dateRangeRow: {
//     flexDirection: 'row',
//     marginVertical: 12,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   dateColumn: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 12,
//     backgroundColor: '#fafafa',
//   },
//   dateColumnSelected: {
//     backgroundColor: '#e6f2ff', // light blue highlight
//   },
//   dateDivider: {
//     width: 1,
//     backgroundColor: '#ddd',
//     height: '100%',
//   },
//   dateBtn: {
//     color: '#007AFF',
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 4,
//   },
//   dateValue: {
//     fontSize: 14,
//     color: '#333',
//   },
//   chartTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     textAlign: 'center',
//     marginTop: 10,
//     color: "#4484f3ff"
//   },
//   filterRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 12,
//   },

//   filterButton: {
//     flex: 1,
//     marginHorizontal: 4,
//     paddingVertical: 8,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     backgroundColor: '#f9f9f9',
//     alignItems: 'center',
//   },

//   filterButtonActive: {
//     backgroundColor: '#007AFF',
//     borderColor: '#007AFF',
//   },

//   filterButtonText: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//   },

//   filterButtonTextActive: {
//     color: '#fff',
//     fontWeight: '600',
//   },

//   legendContainer: {
//   flexDirection: 'row',
//   flexWrap: 'wrap',
//   justifyContent: 'center',
//   marginVertical: 10,
// },
// legendItem: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   marginHorizontal: 6,
//   marginVertical: 4,
// },
// legendColor: {
//   width: 14,
//   height: 14,
//   borderRadius: 3,
//   marginRight: 6,
// },
// legendText: {
//   fontSize: 13,
//   color: '#333',
// },


// });

// export default Dashboard;

// app/screens/Dashboard.tsx

import ScreenWrapper from '@/components/ScreenWrapper';
import { useCompanyProfile } from '@/context/CompanyProfileContext';
import { useProUser } from '@/context/ProUserContext';
import { formatCurrencyFromProfile } from "@/lib/currency";
import {
  getReturnItems,
  getSaleItems,
  getStockItems,
  ReturnItem,
  SaleItem,
  StockItem,
} from '@/lib/storage';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';



let BarChart: any = null;
let PieChart: any = null;

try {
  const charts = require("react-native-chart-kit");
  BarChart = charts.BarChart;
  PieChart = charts.PieChart;
} catch (e) {
  console.warn("Chart kit failed to load:", e);
}
// let BarChart: any = null;
// let PieChart: any = null;

// if (Platform.OS === "ios") {
//   try {
//     const charts = require("react-native-chart-kit");
//     BarChart = charts.BarChart;
//     PieChart = charts.PieChart;
//   } catch (e) {
//     console.warn("Chart kit failed to load:", e);
//   }
// }

let DateTimePickerModal: any = null;

if (Platform.OS !== 'web') {
  try {
    DateTimePickerModal = require('react-native-modal-datetime-picker').default;
  } catch {
    console.warn('DateTimePickerModal not available');
  }
}

const screenWidth = Dimensions.get('window').width || 400;

type FilterType = 'all' | 'daily' | 'weekly' | 'monthly' | 'custom';

const Dashboard = () => {
  const { isProUser, loading } = useProUser();
  const router = useRouter();

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [soldItems, setSoldItems] = useState<SaleItem[]>([]);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

  const [filter, setFilter] = useState<FilterType>('all');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const { companyProfile } = useCompanyProfile();
  const [supplierCredit, setSupplierCredit] = useState(0);
  const [customerCredit, setCustomerCredit] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      const stock = await getStockItems();
      const sales = await getSaleItems();
      const returns = await getReturnItems();

      setStockItems(stock || []);
      setSoldItems(sales || []);
      setReturnItems(returns || []);
    };

    fetchData();
  }, []);

  const safeNumber = (value: any) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

  const endOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const weekRange = (ref: Date) => {
    const weekStartsOn = 1;
    const d = new Date(ref);
    const diff = (d.getDay() - weekStartsOn + 7) % 7;

    const from = startOfDay(
      new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff)
    );

    const to = endOfDay(
      new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6)
    );

    return { from, to };
  };

  const monthRange = (ref: Date) => {
    const from = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
    const to = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);

    return { from, to };
  };

  const getDateRange = () => {
    const today = new Date();

    if (filter === 'daily') return { from: startOfDay(today), to: endOfDay(today) };
    if (filter === 'weekly') return weekRange(today);
    if (filter === 'monthly') return monthRange(today);
    if (filter === 'custom') return { from: startOfDay(startDate), to: endOfDay(endDate) };

    return { from: null, to: null };
  };

  const filteredStockItems = useMemo(() => {
    const { from, to } = getDateRange();

    if (!from || !to) return stockItems;

    return stockItems.filter((item) => {
      const itemDate = new Date(item.date).getTime();
      return itemDate >= from.getTime() && itemDate <= to.getTime();
    });
  }, [stockItems, filter, startDate, endDate]);

  const filteredReturns = useMemo(() => {
    const { from, to } = getDateRange();

    if (!from || !to) return returnItems;

    return returnItems.filter((item) => {
      const itemDate = new Date(item.date).getTime();
      return itemDate >= from.getTime() && itemDate <= to.getTime();
    });
  }, [returnItems, filter, startDate, endDate]);

  const filteredSoldItems = useMemo(() => {
    const { from, to } = getDateRange();

    if (!from || !to) return soldItems;

    return soldItems.filter((item) => {
      const itemDate = new Date(item.date).getTime();
      return itemDate >= from.getTime() && itemDate <= to.getTime();
    });
  }, [soldItems, filter, startDate, endDate]);

  const dashboardStats = useMemo(() => {
    const totalStockItems = stockItems.length;

    const totalStockQuantity = stockItems.reduce(
      (sum, item) => sum + safeNumber(item.quantity),
      0
    );

    const totalStockValue = stockItems.reduce(
      (sum, item) =>
        sum + safeNumber(item.quantity) * safeNumber((item as any).costPrice),
      0
    );

    const lowStockItems = stockItems.filter(
      (item) =>
        item.lowStockAlert !== undefined &&
        safeNumber(item.quantity) > 0 &&
        safeNumber(item.quantity) <= safeNumber(item.lowStockAlert)
    );

    const outOfStockItems = stockItems.filter(
      (item) => safeNumber(item.quantity) <= 0
    );

    const totalReturns = filteredReturns.reduce(
      (sum, item) => sum + safeNumber(item.quantity),
      0
    );

    const totalSold = filteredSoldItems.reduce(
      (sum, item) => sum + safeNumber(item.quantity),
      0
    );

    const soldValue = filteredSoldItems.reduce(
      (sum, item) => sum + safeNumber(item.quantity) * safeNumber(item.price),
      0
    );

    const reorderQuantity = lowStockItems.reduce((sum, item) => {
      const ideal = safeNumber(item.idealStockLevel || item.lowStockAlert || 0);
      return sum + Math.max(ideal - safeNumber(item.quantity), 0);
    }, 0);

    const reorderValue = lowStockItems.reduce((sum, item) => {
      const ideal = safeNumber(item.idealStockLevel || item.lowStockAlert || 0);
      const qtyToOrder = Math.max(ideal - safeNumber(item.quantity), 0);
      return sum + qtyToOrder * safeNumber(item.costPrice);
    }, 0);

    const supplierCredit = stockItems
    .filter((item) => item.paid === false)
    .reduce(
      (sum, item) =>
        sum + Number(item.costPrice || 0) * Number(item.quantity || 0),
      0
    );

  const customerCredit = soldItems
    .filter((sale) => sale.paid === false)
    .reduce(
      (sum, sale) =>
        sum + Number(sale.price || 0) * Number(sale.quantity || 0),
      0
    );

    
    return {
      totalStockItems,
      totalStockQuantity,
      totalStockValue,
      lowStockItems,
      outOfStockItems,
      totalReturns,
      totalSold,
      soldValue,
      reorderQuantity,
      reorderValue,
      supplierCredit,
      customerCredit
    };
  }, [stockItems, returnItems, soldItems]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};

    stockItems.forEach((item) => {
      const category = item.category || 'Uncategorised';
      map[category] = (map[category] || 0) + safeNumber(item.quantity);
    });

    return Object.entries(map).map(([category, quantity]) => ({
      category,
      quantity,
    }));
  }, [stockItems]);

  const topStockValueItems = useMemo(() => {
    return [...stockItems]
      .map((item) => ({
        ...item,
        stockValue: safeNumber(item.quantity) * safeNumber(item.costPrice),
      }))
      .filter((item) => item.stockValue > 0)
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 8);
  }, [stockItems]);

  const recentStockItems = useMemo(() => {
    return [...filteredStockItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [filteredStockItems]);

  const chartColors = [
    '#22c55e',
    '#3b82f6',
    '#f97316',
    '#a855f7',
    '#ef4444',
    '#14b8a6',
    '#eab308',
    '#6366f1',
  ];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: () => '#111827',
  };

  // const formatCurrency = (value: number, currencyCode?: string, locale?: string) => {
  //   return new Intl.NumberFormat(locale, {
  //     style: 'currency',
  //     currency: currencyCode,
  //   }).format(value);
  // };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const exportReport = async () => {
    try {
      const html = `
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h1>StockTally Stock Dashboard Report</h1>
            <h2>Summary</h2>
            <p>Total Stock Items: ${dashboardStats.totalStockItems}</p>
            <p>Total Quantity: ${dashboardStats.totalStockQuantity}</p>
            <p>Total Stock Value: 
            ${formatCurrencyFromProfile(dashboardStats.totalStockValue, companyProfile)}</p>
            <p>Low Stock Items: ${dashboardStats.lowStockItems.length}</p>
            <p>Out of Stock Items: ${dashboardStats.outOfStockItems.length}</p>
            <p>Total Returns: ${dashboardStats.totalReturns}</p>
            <p>Estimated Reorder Value: 
            ${formatCurrencyFromProfile(dashboardStats.reorderValue, companyProfile)}</p>
            <p>Total Returns: ${dashboardStats.totalSold}</p>
            <p>Estimated Reorder Value: 
            ${formatCurrencyFromProfile(dashboardStats.soldValue, companyProfile)}</p>
            <p>Supplier Credit: 
            ${formatCurrencyFromProfile(dashboardStats.supplierCredit, companyProfile)}</p>
            <p>Customer Credit:
            ${formatCurrencyFromProfile(dashboardStats.customerCredit, companyProfile)}</p>


            <h2>Low Stock Items</h2>
            <table border="1" cellspacing="0" cellpadding="6" style="width:100%;">
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Alert</th>
                <th>Ideal</th>
              </tr>
              ${dashboardStats.lowStockItems
                .map(
                  (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity} ${item.unit || 'pcs'}</td>
                    <td>${item.lowStockAlert || '-'}</td>
                    <td>${item.idealStockLevel || '-'}</td>
                  </tr>
                `
                )
                .join('')}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const newPath = `${FileSystem.documentDirectory}StockDashboardReport.pdf`;

      await FileSystem.moveAsync({ from: uri, to: newPath });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath);
      } else {
        Alert.alert('Report saved', newPath);
      }
    } catch (error: any) {
      Alert.alert('Export Failed', error.message || 'Could not export report.');
    }
  };
  const safeStockValueChartData = topStockValueItems
  .map((item) => ({
    name: item.name || "Item",
    value: safeNumber(item.stockValue),
  }))
  .filter((item) => Number.isFinite(item.value) && item.value >= 0);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Text style={{ color: "#fff" }}>Loading dashboard...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!isProUser) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={['#0d1b2a', '#1b263b', '#415a77']}
          style={styles.gradient}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 24,
                fontWeight: '900',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Pro Feature
            </Text>

            <Text
              style={{
                color: '#cbd5e1',
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              Upgrade to Pro to access advanced dashboard analytics.
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: '#f97316',
                paddingVertical: 14,
                paddingHorizontal: 30,
                borderRadius: 14,
              }}
              onPress={() => router.push('/paywall')}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '900',
                  fontSize: 16,
                }}
              >
                Upgrade to Pro
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }
  return (
    
    <ScreenWrapper>
      <LinearGradient colors={['#0d1b2a', '#1b263b', '#415a77']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Stock Dashboard</Text>
          <Text style={styles.subtitle}>Inventory health, value and reorder insights</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/screens/stock/add')}
            >
              <Text style={styles.actionText}>+ Add Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.blueButton]}
              onPress={() => router.push('/screens/ReorderListScreen')}
            >
              <Text style={styles.actionText}>Low Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.tealButton]}
              onPress={() => router.push('/screens/StockTakeSessionScreen')}
            >
              <Text style={styles.actionText}>Stock Count</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            {[
              { label: 'All', value: 'all' },
              { label: 'Today', value: 'daily' },
              { label: 'Week', value: 'weekly' },
              { label: 'Month', value: 'monthly' },
              { label: 'Custom', value: 'custom' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterButton,
                  filter === option.value && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(option.value as FilterType)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === option.value && styles.filterButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filter === 'custom' && DateTimePickerModal && (
            <View style={styles.dateRangeRow}>
              <TouchableOpacity
                style={styles.dateColumn}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateBtn}>Start</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateColumn}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateBtn}>End</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={showStartPicker}
                mode="date"
                onConfirm={(date: Date) => {
                  setShowStartPicker(false);
                  setStartDate(date);
                }}
                onCancel={() => setShowStartPicker(false)}
              />

              <DateTimePickerModal
                isVisible={showEndPicker}
                mode="date"
                onConfirm={(date: Date) => {
                  setShowEndPicker(false);
                  setEndDate(date);
                }}
                onCancel={() => setShowEndPicker(false)}
              />
            </View>
          )}

          <View style={styles.kpiGrid}>
            <KpiCard title="Stock Items" value={String(dashboardStats.totalStockItems)} />
            <KpiCard title="Total Quantity" value={String(dashboardStats.totalStockQuantity)} />
            <KpiCard title="Stock Value" value={formatCurrencyFromProfile(dashboardStats.totalStockValue, companyProfile)} />
            <KpiCard title="Returns" value={String(dashboardStats.totalReturns)} />
            <KpiCard
              title="Low Stock"
              value={String(dashboardStats.lowStockItems.length)}
              danger={dashboardStats.lowStockItems.length > 0}
            />
            <KpiCard
              title="Out of Stock"
              value={String(dashboardStats.outOfStockItems.length)}
              danger={dashboardStats.outOfStockItems.length > 0}
            />
            <KpiCard title="Reorder Qty" value={String(dashboardStats.reorderQuantity)} />
            <KpiCard title="Reorder Value" value={formatCurrencyFromProfile(dashboardStats.reorderValue, companyProfile)} />
            <KpiCard title="Total Sold" value={String(dashboardStats.totalSold)} />
            <KpiCard title="Sold Value" value={formatCurrencyFromProfile(dashboardStats.soldValue, companyProfile)} />
            <KpiCard title="Supplier Credit" value={formatCurrencyFromProfile(dashboardStats.supplierCredit, companyProfile)} />
            <KpiCard title="Customer Credit" value={formatCurrencyFromProfile(dashboardStats.customerCredit, companyProfile)} />
          </View>

          <TouchableOpacity style={styles.exportButton} onPress={exportReport}>
            <Text style={styles.exportButtonText}>Export Stock Report PDF</Text>
          </TouchableOpacity>

          <Section title="Stock Value by Item">
            {topStockValueItems.length === 0 ? (
              <Text style={styles.emptyText}>Add cost prices to see stock value charts.</Text>
            ) : BarChart ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: topStockValueItems.map((item) =>
                      item.name.length > 8 ? `${item.name.slice(0, 8)}…` : item.name
                    ),
                    datasets: [
                      {
                        data: topStockValueItems.map((item) => safeNumber(item.stockValue)),
                      },
                    ],
                  }}
                  width={Math.max(screenWidth - 32, topStockValueItems.length * 80)}
                  height={260}
                  yAxisLabel="£"
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  style={styles.chart}
                  verticalLabelRotation={35}
                />
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>Chart unavailable on this device.</Text>
            )}
          </Section>

          <Section title="Stock by Category">
            {categoryData.length === 0 ? (
              <Text style={styles.emptyText}>No stock categories found.</Text>
            ) : (
              <PieChart
                data={categoryData.map((item, index) => ({
                  name: item.category,
                  population: item.quantity,
                  color: chartColors[index % chartColors.length],
                  legendFontColor: '#111827',
                  legendFontSize: 12,
                }))}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="12"
                absolute={false}
              />
            )}
          </Section>
          {/* <Section title="Stock by Category">
            {categoryData.length === 0 ? (
              <Text style={styles.emptyText}>No stock categories found.</Text>
            ) : Platform.OS === "android" ? (
              <View style={styles.simpleChartContainer}>
                {categoryData.map((item, index) => {
                  const totalQty = categoryData.reduce(
                    (sum, x) => sum + safeNumber(x.quantity),
                    0
                  );

                  const value = safeNumber(item.quantity);
                  const percentage =
                    totalQty > 0 ? Math.round((value / totalQty) * 100) : 0;

                  return (
                    <View key={`${item.category}-${index}`} style={styles.categoryRow}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: chartColors[index % chartColors.length] },
                        ]}
                      />

                      <Text style={styles.categoryLabel} numberOfLines={1}>
                        {item.category}
                      </Text>

                      <Text style={styles.categoryValue}>
                        {value} pcs
                      </Text>

                      <Text style={styles.categoryPercent}>
                        {percentage}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <PieChart
                data={categoryData.map((item, index) => ({
                  name: item.category,
                  population: item.quantity,
                  color: chartColors[index % chartColors.length],
                  legendFontColor: "#111827",
                  legendFontSize: 12,
                }))}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="12"
                absolute={false}
              />
            )}
          </Section> */}

          <Section title={`Recently Added Stock (${filter})`}>
            {recentStockItems.length === 0 ? (
              <Text style={styles.emptyText}>No stock added in this period.</Text>
            ) : (
              recentStockItems.map((item) => (
                <View key={item.id} style={styles.stockRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stockName}>{item.name}</Text>
                    <Text style={styles.stockMeta}>
                      {item.category} • {item.quantity} {item.unit || 'pcs'}
                    </Text>
                  </View>
                  <Text style={styles.stockValue}>
                    {formatCurrencyFromProfile(safeNumber(item.quantity) * safeNumber(item.costPrice), companyProfile)}
                  </Text>
                </View>
              ))
            )}
          </Section>
        </ScrollView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const KpiCard = ({
  title,
  value,
  danger,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) => (
  <View style={[styles.kpiCard, danger && styles.kpiDanger]}>
    <Text style={styles.kpiTitle}>{title}</Text>
    <Text style={[styles.kpiValue, danger && styles.kpiValueDanger]}>{value}</Text>
  </View>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  blueButton: {
    backgroundColor: '#2563eb',
  },
  tealButton: {
    backgroundColor: '#0f766e',
  },
  actionText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: '#111827',
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dateColumn: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dateBtn: {
    color: '#2563eb',
    fontWeight: '800',
  },
  dateValue: {
    color: '#111827',
    marginTop: 4,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    minHeight: 92,
  },
  kpiDanger: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  kpiTitle: {
    color: '#64748b',
    fontWeight: '800',
    fontSize: 13,
  },
  kpiValue: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
  },
  kpiValueDanger: {
    color: '#dc2626',
  },
  exportButton: {
    marginTop: 14,
    backgroundColor: '#f97316',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 12,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  alertName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  alertMeta: {
    color: '#64748b',
    marginTop: 2,
  },
  alertBadge: {
    backgroundColor: '#dc2626',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '900',
    fontSize: 11,
  },
  chart: {
    borderRadius: 12,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stockName: {
    fontWeight: '900',
    color: '#111827',
    fontSize: 15,
  },
  stockMeta: {
    color: '#64748b',
    marginTop: 2,
  },
  stockValue: {
    fontWeight: '900',
    color: '#2563eb',
  },
  simpleChartContainer: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  simpleBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  simpleBarLabel: {
    width: 80,
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  simpleBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    overflow: "hidden",
  },
  simpleBarFill: {
    height: "100%",
    backgroundColor: "#38bdf8",
    borderRadius: 999,
  },
  simpleBarValue: {
    width: 55,
    color: "#fff",
    textAlign: "right",
    fontWeight: "800",
    fontSize: 12,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },

  categoryLabel: {
    flex: 1,
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  categoryValue: {
    width: 70,
    color: "#fff",
    textAlign: "right",
    fontWeight: "700",
    fontSize: 12,
  },

  categoryPercent: {
    width: 50,
    color: "#38bdf8",
    textAlign: "right",
    fontWeight: "900",
    fontSize: 12,
  },
});

export default Dashboard;


// import a from "@/components/ScreenWrapper";
// import { useProUser } from "@/context/ProUserContext";
// import { getStockItems } from "@/lib/storage";
// import React, { useEffect } from "react";
// import { Text, View } from "react-native";

// export default function Dashboard() {
//   const { isProUser, loading } = useProUser();
  
//   useEffect(() => {
//     const fetchData = async () => {
//       const stock = await getStockItems();
//       console.log("stock loaded", stock.length);
//     };

//     fetchData();
//   }, []);
//   if (!isProUser) {
//     return (
//       <ScreenWrapper>
//         <View style={{ padding: 20 }}>
//           <Text>Dashboard is Pro only</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }
//   return (
//     <ScreenWrapper>
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <Text>Dashboard</Text>
//         <Text>{loading ? "Loading" : isProUser ? "Pro" : "Free"}</Text>
//       </View>
//     </ScreenWrapper>
//   );
// }