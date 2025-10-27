// import ScreenWrapper from '@/components/ScreenWrapper';
// import { getSaleItems, getStockItems, SaleItem, StockItem } from '@/lib/storage';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { Picker } from '@react-native-picker/picker';
// import * as FileSystem from 'expo-file-system';
// import * as Print from 'expo-print';
// import React, { useEffect, useRef, useState } from 'react';
// import { ActivityIndicator, Button, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
// import { BarChart } from 'react-native-chart-kit';
// import ViewShot from 'react-native-view-shot';
// import LockedScreen from '../../components/LockedScreen';
// import { useProUser } from '../../lib/ProUserContext';

// // const screenWidth = Dimensions.get('window').width;
// const screenWidth = Dimensions.get('window').width || 400; // fallback to 400 if Dimensions fails

// interface TableRowData {
//   name: string;
//   stock: number;
//   sold: number;
//   income: number;
// }

// const Dashboard = () => {

//   const { isProUser, loading } = useProUser();

//   if (loading) return <ActivityIndicator />;

//   if (!isProUser) return <LockedScreen />;

//   const [stockItems, setStockItems] = useState<StockItem[]>([]);
//   const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
//   const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'custom'>('all');
//   const [tableData, setTableData] = useState<TableRowData[]>([]);
//   const [totalIncome, setTotalIncome] = useState<number>(0);
//   const [totalStock, setTotalStock] = useState<number>(0);

//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);
  

//   const barChartRef = useRef(null);
//   // const lineChartRef = useRef(null);

//   const safeNumber = (val: any): number => {
//     const num = Number(val);
//     return isFinite(num) ? num : 0;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       const stock = await getStockItems();
//       const sales = await getSaleItems();
//       setStockItems(stock);
//       setSaleItems(sales);
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (stockItems.length && saleItems.length) {
//       updateTableData();
//     }
//   }, [stockItems, saleItems, filter, startDate, endDate]);

//   const updateTableData = () => {
//     let filteredSales = saleItems;

//     const today = new Date();
//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay());

//     if (filter === 'daily') {
//       filteredSales = saleItems.filter(s => new Date(s.date).toDateString() === today.toDateString());
//     } else if (filter === 'weekly') {
//       filteredSales = saleItems.filter(s => new Date(s.date) >= startOfWeek);
//     } else if (filter === 'monthly') {
//       filteredSales = saleItems.filter(s => new Date(s.date).getMonth() === today.getMonth());
//     } else if (filter === 'custom') {
//       filteredSales = saleItems.filter(s => {
//         const d = new Date(s.date);
//         return d >= startDate && d <= endDate;
//       });
//     }

//     const names = [...new Set([...stockItems.map(s => s.name), ...filteredSales.map(s => s.name)])];

//     const data: TableRowData[] = names.map(name => {
//       const stockQty = stockItems.find(s => s.name === name)?.quantity ?? 0;
//       const stock = safeNumber(stockQty);
//       const sales = filteredSales.filter(s => s.name === name);
//       const sold = sales.reduce((sum, s) => sum + safeNumber(s.quantity), 0);
//       const income = sales.reduce((sum, s) => sum + (safeNumber(s.price) * safeNumber(s.quantity)), 0);
//       return { name, stock, sold, income };
//     });

//     setTableData(data);
//     setTotalIncome(data.reduce((sum, row) => sum + row.income, 0));
//     setTotalStock(data.reduce((sum, row) => sum + row.stock, 0));
//   };

//   const chartConfig = {
//     backgroundGradientFrom: '#fff',
//     backgroundGradientTo: '#fff',
//     decimalPlaces: 2,
//     color: (opacity = 1) => `rgba(70, 130, 180, ${opacity})`,
//     labelColor: () => `#000`,
//   };

//   const exportReport = async () => {
//     const barUri = await barChartRef.current.capture();
//     // const lineUri = await lineChartRef.current.capture();

//     const html = `
//       <html>
//         <body>
//           <h1>Dashboard Report</h1>
//           <h2>Total Income: £${totalIncome.toFixed(2)}</h2>
//           <h2>Total Stock: ${totalStock}</h2>
//           <img src="${barUri}" style="width:100%;" />
//           <table border="1" cellspacing="0" cellpadding="4">
//             <tr><th>Item</th><th>Stock</th><th>Sold</th><th>Income (£)</th></tr>
//             ${tableData.map(r =>
//               `<tr><td>${r.name}</td><td>${r.stock}</td><td>${r.sold}</td><td>£${r.income.toFixed(2)}</td></tr>`
//             ).join('')}
//           </table>
//         </body>
//       </html>
//     `;

//     const { uri } = await Print.printToFileAsync({ html });
//     await FileSystem.moveAsync({
//       from: uri,
//       to: `${FileSystem.documentDirectory}DashboardReport.pdf`,
//     });
//   };

//   return (
//     <ScreenWrapper>
//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         <Text style={styles.title}>📊 Dashboard</Text>

//         <Picker selectedValue={filter} onValueChange={val => setFilter(val)} style={styles.picker}>
//           <Picker.Item label="All Time" value="all" />
//           <Picker.Item label="Today" value="daily" />
//           <Picker.Item label="This Week" value="weekly" />
//           <Picker.Item label="This Month" value="monthly" />
//           <Picker.Item label="Custom Range" value="custom" />
//         </Picker>

//         {filter === 'custom' && (
//           <View style={styles.datePickerContainer}>
//             <Button title="Select Start Date" onPress={() => setShowStartPicker(true)} />
//             <Button title="Select End Date" onPress={() => setShowEndPicker(true)} />
//             {showStartPicker && (
//               <DateTimePicker
//                 value={startDate}
//                 mode="date"
//                 display='default'
//                 style={{ alignSelf: 'center' }}
//                 onChange={(e, date) => {
//                   setShowStartPicker(false);
//                   if (date) setStartDate(date);
//                 }}
//               />
//             )}
//             {showEndPicker && (
//               <DateTimePicker
//                 value={endDate}
//                 mode="date"
//                 display='default'
//                 style={{ alignSelf: 'center' }}
//                 onChange={(e, date) => {
//                   setShowEndPicker(false);
//                   if (date) setEndDate(date);
//                 }}
//               />
//             )}
//           </View>
//         )}

//         <Text style={styles.summary}>Total Stock: {totalStock}</Text>
//         <Text style={styles.summary}>Total Income: £{totalIncome.toFixed(2)}</Text>

//         <View style={styles.table}>
//           <View style={styles.tableHeader}>
//             <Text style={styles.cell}>Item</Text>
//             <Text style={styles.cell}>Stock</Text>
//             <Text style={styles.cell}>Sold</Text>
//             <Text style={styles.cell}>Income</Text>
//           </View>
//           {tableData.map((row, index) => (
//             <View key={index} style={[styles.tableRow, index % 2 ? styles.odd : styles.even]}>
//               <Text style={styles.cell}>{row.name}</Text>
//               <Text style={styles.cell}>{row.stock}</Text>
//               <Text style={styles.cell}>{row.sold}</Text>
//               <Text style={styles.cell}>£{row.income.toFixed(2)}</Text>
//             </View>
//           ))}
//         </View>

//         <ViewShot ref={barChartRef} options={{ format: 'jpg', quality: 0.9 }}>
//           <Text style={styles.chartTitle}>Stock per Item</Text>
//           <BarChart
//             data={{
//               labels: tableData.map(d => d.name),
//               datasets: [{ data: tableData.map(d => safeNumber(d.stock)) }],
//             }}
//             width={screenWidth}
//             height={220}
//             chartConfig={chartConfig}
//             style={styles.chart}
//             verticalLabelRotation={30} yAxisLabel={''} yAxisSuffix={''}  />
            
//             <Text style={styles.chartTitle}>Income per Item</Text>
//           <BarChart
//             data={{
//               labels: tableData.map(d => d.name),
//               datasets: [{ data: tableData.map(d => safeNumber(d.income)) }],
//             }}
//             width={screenWidth}
//             height={220}
//             chartConfig={chartConfig}
//             style={styles.chart}
//             verticalLabelRotation={30} yAxisLabel={''} yAxisSuffix={''}  />
//         </ViewShot>


//         <Button title="Export PDF Report" onPress={exportReport} />
//       </ScrollView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
//   summary: { fontSize: 16, textAlign: 'center', marginVertical: 4 },
//   picker: { marginVertical: 10, backgroundColor: '#eee' },
//   chart: { marginVertical: 10, borderRadius: 8 },
//   table: { marginVertical: 10 },
//   tableHeader: { flexDirection: 'row', backgroundColor: '#4CAF50', padding: 6 },
//   tableRow: { flexDirection: 'row', padding: 6 },
//   cell: { flex: 1, textAlign: 'center' },
//   even: { backgroundColor: '#f9f9f9' },
//   odd: { backgroundColor: '#eee' },
//   datePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
//   chartTitle: {
//   fontSize: 16,
//   fontWeight: '600',
//   textAlign: 'center',
//   marginTop: 10,
//   marginBottom: 4,
// },
// });

// app/screens/Dashboard.tsx

// import * as FileSystem from "expo-file-system";
// import * as Print from "expo-print";
// import { useRouter } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Button,
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { BarChart } from "react-native-chart-kit";
// import ViewShot from "react-native-view-shot";

// import ScreenWrapper from "@/components/ScreenWrapper";
// // import { useProUser } from "@/context/ProUserContext";
// import {
//   getSaleItems,
//   getStockItems,
//   SaleItem,
//   StockItem,
// } from "@/lib/storage";

// import DateTimePickerModal from "react-native-modal-datetime-picker";


// const [showStart, setShowStart] = useState(false);
// const [showEnd, setShowEnd] = useState(false);

// // Helper function
// const formatDate = (date: Date) => {
//   return new Intl.DateTimeFormat('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   }).format(date);
// };

// const screenWidth = Dimensions.get("window").width || 400;

// interface TableRowData {
//   name: string;
//   stock: number;
//   sold: number;
//   income: number;
// }

// const Dashboard: React.FC = () => {
  // const { isProUser, loading } = useProUser();
  // const router = useRouter();

  // 🚀 Redirect non-Pro users
  // useEffect(() => {
  //   if (!loading && !isProUser) {
  //     router.replace("/paywall");
  //   }
  // }, [loading, isProUser, router]);

  // if (loading) {
  //   return (
  //     <ActivityIndicator
  //       size="large"
  //       style={{ flex: 1, justifyContent: "center" }}
  //     />
  //   );
  // }

  // if (!isProUser) {
  //   return null; // nothing shown while redirecting
  // }

//   // 🔽 Normal Dashboard logic
//   const [stockItems, setStockItems] = useState<StockItem[]>([]);
//   const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
//   const [filter, setFilter] = useState<
//     "all" | "daily" | "weekly" | "monthly" | "custom"
//   >("all");
//   const [tableData, setTableData] = useState<TableRowData[]>([]);
//   const [totalIncome, setTotalIncome] = useState<number>(0);
//   const [totalStock, setTotalStock] = useState<number>(0);

//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   const barChartRef = useRef<ViewShot>(null);

//   const safeNumber = (val: any): number => {
//     const num = Number(val);
//     return isFinite(num) ? num : 0;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       const stock = await getStockItems();
//       const sales = await getSaleItems();
//       setStockItems(stock);
//       setSaleItems(sales);
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     updateTableData();
//   }, [stockItems, saleItems, filter, startDate, endDate]);

//   const updateTableData = () => {
//     let filteredSales = saleItems;
//     const today = new Date();
//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay());

//     if (filter === "daily") {
//       filteredSales = saleItems.filter(
//         (s) => new Date(s.date).toDateString() === today.toDateString()
//       );
//     } else if (filter === "weekly") {
//       filteredSales = saleItems.filter(
//         (s) => new Date(s.date) >= startOfWeek
//       );
//     } else if (filter === "monthly") {
//       filteredSales = saleItems.filter(
//         (s) => new Date(s.date).getMonth() === today.getMonth()
//       );
//     } else if (filter === "custom") {
//       filteredSales = saleItems.filter((s) => {
//         const d = new Date(s.date);
//         return d >= startDate && d <= endDate;
//       });
//     }

//     const names = [
//       ...new Set([
//         ...stockItems.map((s) => s.name),
//         ...filteredSales.map((s) => s.name),
//       ]),
//     ];

//     const data: TableRowData[] = names.map((name) => {
//       const stockQty = stockItems.find((s) => s.name === name)?.quantity ?? 0;
//       const stock = safeNumber(stockQty);
//       const sales = filteredSales.filter((s) => s.name === name);
//       const sold = sales.reduce((sum, s) => sum + safeNumber(s.quantity), 0);
//       const income = sales.reduce((sum, s) => sum + safeNumber(s.price), 0);
//       return { name, stock, sold, income };
//     });

//     setTableData(data);
//     setTotalIncome(data.reduce((sum, row) => sum + row.income, 0));
//     setTotalStock(data.reduce((sum, row) => sum + row.stock, 0));
//   };

//   const chartConfig = {
//     backgroundGradientFrom: "#fff",
//     backgroundGradientTo: "#fff",
//     decimalPlaces: 2,
//     color: (opacity = 1) => `rgba(70, 130, 180, ${opacity})`,
//     labelColor: () => `#000`,
//   };

//   const exportReport = async () => {
//     if (!barChartRef.current) return;

//     const barUri = await barChartRef.current.capture();

//     const html = `
//       <html>
//         <body>
//           <h1>Dashboard Report</h1>
//           <h2>Total Income: £${totalIncome.toFixed(2)}</h2>
//           <h2>Total Stock: ${totalStock}</h2>
//           <img src="${barUri}" style="width:100%;" />
//           <table border="1" cellspacing="0" cellpadding="4">
//             <tr><th>Item</th><th>Stock</th><th>Sold</th><th>Income (£)</th></tr>
//             ${tableData
//               .map(
//                 (r) =>
//                   `<tr><td>${r.name}</td><td>${r.stock}</td><td>${r.sold}</td><td>£${r.income.toFixed(
//                     2
//                   )}</td></tr>`
//               )
//               .join("")}
//           </table>
//         </body>
//       </html>
//     `;

//     const { uri } = await Print.printToFileAsync({ html });
//     await FileSystem.moveAsync({
//       from: uri,
//       to: `${FileSystem.documentDirectory}DashboardReport.pdf`,
//     });
//   };

//   return (
//     <ScreenWrapper>
//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         <Text style={styles.title}>📊 Dashboard</Text>

//         {/* 🔽 Filter Buttons */}
//         <View style={styles.filterRow}>
//           {["all", "daily", "weekly", "monthly", "custom"].map((f) => (
//             <TouchableOpacity
//               key={f}
//               style={[styles.filterButton, filter === f && styles.filterButtonActive]}
//               onPress={() => setFilter(f as any)}
//             >
//               <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
//                 {f === "all"
//                   ? "All"
//                   : f === "daily"
//                   ? "Today"
//                   : f === "weekly"
//                   ? "Week"
//                   : f === "monthly"
//                   ? "Month"
//                   : "Custom"}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {filter === 'custom' && (
//   <View style={styles.dateRangeRow}>
//     {/* Start Date */}
//     <TouchableOpacity
//       style={[
//         styles.dateColumn,
//         startDate && styles.dateColumnSelected,
//       ]}
//       onPress={() => setShowStartPicker(true)}
//     >
//       <Text style={styles.dateBtn}>Select Start Date</Text>
//       <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
//     </TouchableOpacity>

//     <View style={styles.dateDivider} />

//     {/* End Date */}
//     <TouchableOpacity
//       style={[
//         styles.dateColumn,
//         endDate && styles.dateColumnSelected,
//       ]}
//       onPress={() => setShowEndPicker(true)}
//     >
//       <Text style={styles.dateBtn}>Select End Date</Text>
//       <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
//     </TouchableOpacity>

//     {/* Date Pickers (always mounted) */}
//     <DateTimePickerModal
//       isVisible={showStartPicker}
//       mode="date"
//       onConfirm={(date) => {
//         setShowStartPicker(false);
//         if (date) setStartDate(date);
//       }}
//       onCancel={() => setShowStartPicker(false)}
//     />

//     <DateTimePickerModal
//       isVisible={showEndPicker}
//       mode="date"
//       onConfirm={(date) => {
//         setShowEndPicker(false);
//         if (date) setEndDate(date);
//       }}
//       onCancel={() => setShowEndPicker(false)}
//     />
//   </View>
// )}




//         <Text style={styles.summary}>Total Stock: {totalStock}</Text>
//         <Text style={styles.summary}>
//           Total Income: £{totalIncome.toFixed(2)}
//         </Text>

//         {/* Table */}
//         <View style={styles.table}>
//           <View style={styles.tableHeader}>
//             <Text style={styles.cell}>Item</Text>
//             <Text style={styles.cell}>Stock</Text>
//             <Text style={styles.cell}>Sold</Text>
//             <Text style={styles.cell}>Income</Text>
//           </View>
//           {tableData.map((row, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.tableRow,
//                 index % 2 ? styles.odd : styles.even,
//               ]}
//             >
//               <Text style={styles.cell}>{row.name}</Text>
//               <Text style={styles.cell}>{row.stock}</Text>
//               <Text style={styles.cell}>{row.sold}</Text>
//               <Text style={styles.cell}>£{row.income.toFixed(2)}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Charts */}
//         <ViewShot ref={barChartRef} options={{ format: "jpg", quality: 0.9 }}>
//           <Text style={styles.chartTitle}>Stock per Item</Text>
//           <BarChart
//             data={{
//               labels: tableData.map((d) => d.name),
//               datasets: [{ data: tableData.map((d) => safeNumber(d.stock)) }],
//             }}
//             width={screenWidth}
//             height={220}
//             chartConfig={chartConfig}
//             style={styles.chart}
//             verticalLabelRotation={30}
//           />

//           <Text style={styles.chartTitle}>Income per Item</Text>
//           <BarChart
//             data={{
//               labels: tableData.map((d) => d.name),
//               datasets: [{ data: tableData.map((d) => safeNumber(d.income)) }],
//             }}
//             width={screenWidth}
//             height={220}
//             chartConfig={chartConfig}
//             style={styles.chart}
//             verticalLabelRotation={30}
//           />
//         </ViewShot>

//         <Button title="Export PDF Report" onPress={exportReport} />
//       </ScrollView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginVertical: 10,
//   },
//   summary: { fontSize: 16, textAlign: "center", marginVertical: 4 },
//   filterRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: 10,
//   },
//   filterButton: {
//     flex: 1,
//     marginHorizontal: 2,
//     padding: 10,
//     backgroundColor: "#eee",
//     borderRadius: 6,
//   },
//   filterButtonActive: {
//     backgroundColor: "#007AFF",
//   },
//   filterText: {
//     textAlign: "center",
//     fontSize: 14,
//     color: "#333",
//   },
//   filterTextActive: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   chart: { marginVertical: 10, borderRadius: 8 },
//   table: { marginVertical: 10 },
//   tableHeader: {
//     flexDirection: "row",
//     backgroundColor: "#4CAF50",
//     padding: 6,
//   },
//   tableRow: { flexDirection: "row", padding: 6 },
//   cell: { flex: 1, textAlign: "center" },
//   even: { backgroundColor: "#f9f9f9" },
//   odd: { backgroundColor: "#eee" },

//   chartTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 10,
//     textAlign: "center",
//   },


//   datePickerContainer: { 
//     flexDirection: 'column', 
//     alignItems: 'center', 
//     marginVertical: 10 
//   },

//   dateRangeRow: {
//   flexDirection: 'row',
//   marginVertical: 12,
//   borderWidth: 1,
//   borderColor: '#ddd',
//   borderRadius: 10,
//   overflow: 'hidden',
// },

// dateColumn: {
//   flex: 1,
//   alignItems: 'center',
//   paddingVertical: 12,
//   backgroundColor: '#fafafa',
// },

// dateColumnSelected: {
//   backgroundColor: '#e6f2ff', // light blue highlight
// },

// dateDivider: {
//   width: 1,
//   backgroundColor: '#ddd',
//   height: '100%',
// },

// dateBtn: {
//   color: '#007AFF',
//   fontSize: 16,
//   fontWeight: '500',
//   marginBottom: 4,
// },

// dateValue: {
//   fontSize: 14,
//   color: '#333',
// },


// });

// export default Dashboard;

// app/screens/Dashboard.tsx

import ScreenWrapper from '@/components/ScreenWrapper';
import { useProUser } from '@/context/ProUserContext';
// import { useProUser } from '@/lib/ProUserContext';
import { getReturnItems, getSaleItems, getStockItems, ReturnItem, SaleItem, StockItem } from '@/lib/storage';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import ViewShot from 'react-native-view-shot';


let DateTimePickerModal: any = null;
if (Platform.OS !== 'web') {
  try {
    DateTimePickerModal = require('react-native-modal-datetime-picker').default;
  } catch (error) {
    console.warn('⚠️ DateTimePickerModal not available on this platform');
  }
}
const screenWidth = Dimensions.get('window').width || 400;

interface TableRowData {
  name: string;
  stock: number;
  return: number;
  sold: number;
  income: number;
}

const Dashboard = () => {
  const { isProUser, loading } = useProUser();
  
  const router = useRouter();

  // 🚀 Redirect non-Pro users
  useEffect(() => {
    if (!loading && !isProUser) {
      router.replace('/paywall');
    }
  }, [loading, isProUser, router]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!isProUser) {
    return null; // nothing shown while redirecting
  }

  // 🔽 State
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'custom'>('all');
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalStock, setTotalStock] = useState<number>(0);
  const [totalReturn, setTotalReturn] = useState<number>(0);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const barChartRef = useRef<ViewShot>(null);
  const incomePieChartRef = useRef<ViewShot>(null);
  const returnPieChartRef = useRef<ViewShot>(null);

  const safeNumber = (val: any): number => {
    const num = Number(val);
    return isFinite(num) ? num : 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      const stock = await getStockItems();
      const sales = await getSaleItems();
      const returns = await getReturnItems();
      setStockItems(stock);
      setSaleItems(sales);
      setReturnItems(returns);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (stockItems.length | saleItems.length | returnItems.length) {
      updateTableData();
    }
  }, [stockItems, saleItems, filter, startDate, endDate]);

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay   = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const weekRange = (ref: Date) => {
    // Week starts Sunday; change `weekStartsOn = 1` for Monday-start
    const weekStartsOn = 1;
    const d = new Date(ref);
    const diff = (d.getDay() - weekStartsOn + 7) % 7;
    const start = startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff));
    const end   = endOfDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));
    return { start, end };
  };

  const monthRange = (ref: Date) => {
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
    const end   = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999); // last day of month
    return { start, end };
  };


  const updateTableData = () => {
    // 1) Decide the date window
    let from: Date | null = null;
    let to: Date | null = null;
    const today = new Date();

    switch (filter) {
      case 'daily': {
        from = startOfDay(today);
        to   = endOfDay(today);
        break;
      }
      case 'weekly': {
        const { start, end } = weekRange(today);
        from = start;
        to   = end;
        break;
      }
      case 'monthly': {
        const { start, end } = monthRange(today);
        from = start;
        to   = end;
        break;
      }
      case 'custom': {
        // Normalize custom to full days
        from = startOfDay(startDate);
        to   = endOfDay(endDate);
        break;
      }
      case 'all':
      default:
        // keep as nulls = no date filtering
        break;
    }

    // 2) Filter sales by the window (if any)
    let filteredSales = saleItems;
    if (from && to) {
      const fromTs = from.getTime();
      const toTs   = to.getTime();
      filteredSales = saleItems.filter((s) => {
        const ts = new Date(s.date).getTime(); // works for ISO strings
        return ts >= fromTs && ts <= toTs;
      });
    }

    // 3) Build table rows from stock + filtered sales
    const names = [...new Set([
      ...stockItems.map(s => s.name),
      ...returnItems.map(s => s.name),
      ...filteredSales.map(s => s.name),
    ])];

    const data: TableRowData[] = names.map((name) => {
      const stockQty = Number(stockItems.find(s => s.name === name)?.quantity ?? 0) || 0;
      const returnQty = Number(returnItems.find(s => s.name === name)?.quantity ?? 0) || 0;
      const salesForItem = filteredSales.filter(s => s.name === name);
      const sold   = salesForItem.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      const income = salesForItem.reduce((sum, s) => sum + ((Number(s.price) || 0) * (Number(s.quantity) || 0)), 0);
      return { name, stock: stockQty, return: returnQty, sold, income };
    });

    setTableData(data);
    setTotalIncome(data.reduce((sum, r) => sum + r.income, 0));
    setTotalStock(data.reduce((sum, r) => sum + r.stock, 0));
    setTotalReturn(data.reduce((sum, r) => sum + r.return, 0));
  };


  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(70, 130, 180, ${opacity})`,
    labelColor: () => `#000`,
  };

const exportReport = async () => {
  try {
    if (!barChartRef.current || !incomePieChartRef.current || !returnPieChartRef.current) {
      Alert.alert("Error", "Charts not ready yet.");
      return;
    }
    // 🖼️ Capture chart image
    const incomePieUri = await incomePieChartRef.current.capture();
    if (!incomePieUri) throw new Error("Failed to capture chart.");

    // 🖼️ Capture chart image
    const returnPieUri = await returnPieChartRef.current.capture();
    if (!returnPieUri) throw new Error("Failed to capture chart.");

    // 🖼️ Capture chart image
    const barUri = await barChartRef.current.capture();
    if (!barUri) throw new Error("Failed to capture chart.");

    // 🧾 Generate HTML
    const html = `
      <html>
        <body style="font-family: Arial;">
          <h1>Dashboard Report</h1>
          <h2>Total Income: £${totalIncome.toFixed(2)}</h2>
          <h2>Total Stock: ${totalStock}</h2>
          <h2>Total Returns: ${totalReturn}</h2>
          <img src="${barUri}" style="width:100%;" />
          <table border="1" cellspacing="0" cellpadding="4" style="margin-top: 20px; width: 100%;">
            <tr><th>Item</th><th>Stock</th><th>Sold</th><th>Income (£)</th></tr>
            ${tableData
              .map(
                (r) =>
                  `<tr>
                    <td>${r.name}</td>
                    <td>${r.stock}</td>
                    <td>${r.sold}</td>
                    <td>£${r.income.toFixed(2)}</td>
                  </tr>`
              )
              .join("")}
          </table>
           <img src="${incomePieUri}" style="width:100%;" />
           <img src="${returnPieUri}" style="width:100%;" />
        </body>
      </html>
      
    `;

    // 📄 Create PDF file
    const { uri } = await Print.printToFileAsync({ html });
    if (!uri) throw new Error("Failed to create PDF.");

    const newPath = `${FileSystem.documentDirectory}DashboardReport.pdf`;
    await FileSystem.moveAsync({ from: uri, to: newPath });


    // 📤 Share the PDF (this opens iOS share sheet)
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newPath);
    } else {
      Alert.alert("File saved at:", newPath);
    }
  } catch (err: any) {
    console.error("❌ exportReport error:", err);
    Alert.alert("Export Failed", err.message || "Could not generate report.");
  }
};


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const filteredIncomeData = tableData.filter(row => row.sold !== 0);
  const filteredStockData = tableData.filter(row => row.stock !== 0);
  const filteredReturnData = tableData.filter(row => row.return !== 0);

  const chartColors = [
  '#4CAF50', // green
  '#FF9800', // orange
  '#2196F3', // blue
  '#9C27B0', // purple
  '#FF5722', // deep orange
  '#795548', // brown
  '#607D8B', // blue grey
  '#00BCD4', // cyan
  '#8BC34A', // light green
  '#E91E63', // pink
  '#3F51B5', // indigo
  '#FFC107', // amber
];

  return (
    
    <ScreenWrapper>
    <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>📊 Dashboard</Text>

        <Text style={styles.summary}>Total Stock: {totalStock} | Total Return: {totalReturn}</Text>
        {/* <Text style={styles.summary}>Total Return: {totalReturn}</Text> */}
         <Text style={styles.summary}>Total Income: £{totalIncome.toFixed(2)}</Text>

                {/* Filter Buttons */}
        <View style={styles.filterRow}>
          {[
            { label: "All", value: "all" },
            { label: "Today", value: "daily" },
            { label: "Week", value: "weekly" },
            { label: "Month", value: "monthly" },
            { label: "Custom", value: "custom" },
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                filter === option.value && styles.filterButtonActive
              ]}
              onPress={() => setFilter(option.value as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === option.value && styles.filterButtonTextActive
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Range Picker (only if Custom selected) */}
        {filter === 'custom' && DateTimePickerModal && (
          <View style={styles.dateRangeRow}>
            {/* Start Date */}
            <TouchableOpacity
              style={[styles.dateColumn, startDate && styles.dateColumnSelected]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateBtn}>Select Start Date</Text>
              <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <View style={styles.dateDivider} />

            {/* End Date */}
            <TouchableOpacity
              style={[styles.dateColumn, endDate && styles.dateColumnSelected]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateBtn}>Select End Date</Text>
              <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
            </TouchableOpacity>

            {/* Date Pickers */}
            <DateTimePickerModal
              isVisible={showStartPicker}
              mode="date"
              onConfirm={(date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
              onCancel={() => setShowStartPicker(false)}
            />
            <DateTimePickerModal
              isVisible={showEndPicker}
              mode="date"
              onConfirm={(date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
              onCancel={() => setShowEndPicker(false)}
            />
          </View>
        )}
        <Button title="Export PDF Report" onPress={exportReport} />

        <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.cell}>Item</Text>
          <Text style={styles.cell}>Sold</Text>
          <Text style={styles.cell}>Income</Text>
        </View>

        {filteredIncomeData.map((row, index) => (
          <View
            key={index}
            style={[styles.tableRow, index % 2 ? styles.odd : styles.even]}
          >
            <Text style={styles.cell}>{row.name}</Text>
            <Text style={styles.cell}>{row.sold}</Text>
            <Text style={styles.cell}>£{row.income.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <ViewShot ref={incomePieChartRef} options={{ format: 'jpg', quality: 0.9 }}>
        <Text style={styles.chartTitle}>Income per Item</Text>
        <PieChart
          data={filteredIncomeData.map((d, i) => ({
            name: d.name,
            population: d.income,
            color: chartColors[i % chartColors.length],
            legendFontColor: "#4484f3ff",
            legendFontSize: 12,
          }))}
          width={screenWidth - 16}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute={false} // ensures no raw values shown
          hasLegend={true}
          center={[0, 0]} // keep centered
        />
          
      </ViewShot>       
                
      <Text style={styles.chartTitle}>Stock per Item</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cell}>Item</Text>
            <Text style={styles.cell}>Stock</Text>
            <Text style={styles.cell}>Return</Text>
          </View>
          {filteredStockData.map((row, index) => (
            <View key={index} style={[styles.tableRow, index % 2 ? styles.odd : styles.even]}>
              <Text style={styles.cell}>{row.name}</Text>
              <Text style={styles.cell}>{row.stock}</Text>
              <Text style={styles.cell}>{row.return}</Text>
            </View>
          ))}
        </View>
        <ViewShot ref={barChartRef} options={{ format: 'jpg', quality: 0.9 }}>

        {/* Stock as Pie Chart */}
          {/* <Text style={styles.chartTitle}>Stock per Item</Text> */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: filteredStockData.map(d => d.name),
                datasets: [{ data: filteredStockData.map(d => safeNumber(d.stock)) }],
              }}
              width={Math.max(screenWidth, tableData.length * 80)} // 80px per item
              height={300}
              chartConfig={{
                backgroundGradientFrom: "#1b263b", 
                backgroundGradientTo: "#415a77",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.9})`,
                labelColor: () => "#f0f4f8",
              }}
              style={{ borderRadius: 8   }}
              verticalLabelRotation={45}
              yAxisLabel={""}
              yAxisSuffix={""}
            />
          </ScrollView>
        </ViewShot>

        <ViewShot ref={returnPieChartRef} options={{ format: 'jpg', quality: 0.9 }}>
          <Text style={styles.chartTitle}>Return per Item</Text>
          <PieChart
              data={filteredReturnData.map((d, i) => ({
                name: d.name,
                population: d.return,
                color: chartColors[i % chartColors.length],
                legendFontColor: "#4484f3ff",
                legendFontSize: 12,
              }))}
              width={screenWidth - 16}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute={false} // ensures no raw values shown
              hasLegend={true}
              center={[0, 0]} // keep centered
            />
          
        </ViewShot>  
      </ScrollView>
    </LinearGradient>
    </ScreenWrapper>
    
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  title: { color: "#f0f4f8",fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  summary: { color: "#f0f4f8",fontSize: 16, textAlign: 'center', marginVertical: 4 },
  picker: { marginVertical: 10, backgroundColor: '#eee' },
  chart: { marginVertical: 10, borderRadius: 8 },
  table: { marginVertical: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#4c9eafff', padding: 6 },
  tableRow: { flexDirection: 'row', padding: 6 },
  cell: { flex: 1, textAlign: 'center' },
  even: { backgroundColor: '#f9f9f9' },
  odd: { backgroundColor: '#eee' },

  // Custom Range Styles
  dateRangeRow: {
    flexDirection: 'row',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  dateColumnSelected: {
    backgroundColor: '#e6f2ff', // light blue highlight
  },
  dateDivider: {
    width: 1,
    backgroundColor: '#ddd',
    height: '100%',
  },
  dateBtn: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    color: "#4484f3ff"
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },

  filterButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },

  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  legendContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginVertical: 10,
},
legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 6,
  marginVertical: 4,
},
legendColor: {
  width: 14,
  height: 14,
  borderRadius: 3,
  marginRight: 6,
},
legendText: {
  fontSize: 13,
  color: '#333',
},


});

export default Dashboard;
