// // app/screens/invoices/index.tsx
// import ScreenWrapper from "@/components/ScreenWrapper";
// import {
//   getInvoices,
//   markInvoiceAsPaid,
//   markInvoiceAsSent,
// } from "@/lib/invoiceStorage";
// import { Invoice, InvoiceStatus } from "@/types/invoice";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { router, useFocusEffect } from "expo-router";
// import React, { useCallback, useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   RefreshControl,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// type FilterStatus = "all" | InvoiceStatus;

// const FILTERS: Array<{ label: string; value: FilterStatus }> = [
//   { label: "All", value: "all" },
//   { label: "Draft", value: "draft" },
//   { label: "Sent", value: "sent" },
//   { label: "Unpaid", value: "unpaid" },
//   { label: "Part Paid", value: "partially_paid" },
//   { label: "Paid", value: "paid" },
//   { label: "Overdue", value: "overdue" },
//   { label: "Cancelled", value: "cancelled" },
// ];

// const STATUS_CONFIG: Record<
//   InvoiceStatus,
//   { label: string; background: string; text: string }
// > = {
//   draft: {
//     label: "Draft",
//     background: "rgba(148, 163, 184, 0.18)",
//     text: "#cbd5e1",
//   },
//   sent: {
//     label: "Sent",
//     background: "rgba(59, 130, 246, 0.18)",
//     text: "#93c5fd",
//   },
//   unpaid: {
//     label: "Unpaid",
//     background: "rgba(245, 158, 11, 0.18)",
//     text: "#fcd34d",
//   },
//   partially_paid: {
//     label: "Part Paid",
//     background: "rgba(168, 85, 247, 0.18)",
//     text: "#d8b4fe",
//   },
//   paid: {
//     label: "Paid",
//     background: "rgba(34, 197, 94, 0.18)",
//     text: "#86efac",
//   },
//   overdue: {
//     label: "Overdue",
//     background: "rgba(239, 68, 68, 0.18)",
//     text: "#fca5a5",
//   },
//   cancelled: {
//     label: "Cancelled",
//     background: "rgba(100, 116, 139, 0.18)",
//     text: "#cbd5e1",
//   },
// };

// const formatDate = (value?: string): string => {
//   if (!value) return "—";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return value;
//   }

//   return date.toLocaleDateString(undefined, {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatMoney = (
//   amount: number,
//   currencyCode: string,
//   locale: string
// ): string => {
//   try {
//     return new Intl.NumberFormat(locale || "en-GB", {
//       style: "currency",
//       currency: currencyCode || "GBP",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(Number(amount || 0));
//   } catch {
//     return `${Number(amount || 0).toFixed(2)} ${currencyCode || ""}`.trim();
//   }
// };

// const InvoiceListScreen = () => {
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [filter, setFilter] = useState<FilterStatus>("all");
//   const [searchText, setSearchText] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [processingId, setProcessingId] = useState<string | null>(null);

//   const loadInvoices = useCallback(async (showLoader = true) => {
//     try {
//       if (showLoader) setLoading(true);

//       const records = await getInvoices();
//       setInvoices(records);
//     } catch (error) {
//       console.error("❌ Failed to load invoices:", error);
//       Alert.alert(
//         "Unable to load invoices",
//         "Please try again in a moment."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       loadInvoices();
//     }, [loadInvoices])
//   );

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     loadInvoices(false);
//   }, [loadInvoices]);

//   const filteredInvoices = useMemo(() => {
//     const query = searchText.trim().toLowerCase();

//     return invoices.filter((invoice) => {
//       const matchesFilter =
//         filter === "all" || invoice.status === filter;

//       if (!matchesFilter) return false;

//       if (!query) return true;

//       return [
//         invoice.invoiceNumber,
//         invoice.customerName,
//         invoice.customerCompany,
//         invoice.customerEmail,
//         invoice.purchaseOrderNumber,
//         invoice.reference,
//       ]
//         .filter(Boolean)
//         .some((value) =>
//           String(value).toLowerCase().includes(query)
//         );
//     });
//   }, [filter, invoices, searchText]);

//   const summary = useMemo(() => {
//     return invoices.reduce(
//       (result, invoice) => {
//         if (invoice.status !== "cancelled") {
//           result.totalInvoiced += Number(invoice.grandTotal || 0);
//           result.totalPaid += Number(invoice.amountPaid || 0);
//           result.outstanding += Number(invoice.balanceDue || 0);
//         }

//         if (
//           invoice.status === "overdue" &&
//           Number(invoice.balanceDue || 0) > 0
//         ) {
//           result.overdue += Number(invoice.balanceDue || 0);
//         }

//         return result;
//       },
//       {
//         totalInvoiced: 0,
//         totalPaid: 0,
//         outstanding: 0,
//         overdue: 0,
//       }
//     );
//   }, [invoices]);

//   const summaryCurrency = invoices[0] || null;

//   const money = useCallback(
//     (amount: number) =>
//       formatMoney(
//         amount,
//         summaryCurrency?.currencyCode || "GBP",
//         summaryCurrency?.locale || "en-GB"
//       ),
//     [summaryCurrency]
//   );

//   const openInvoice = (invoice: Invoice) => {
//     router.push({
//       pathname: "/screens/invoices/view",
//       params: { id: invoice.id },
//     });
//   };

//   const editInvoice = (invoice: Invoice) => {
//     router.push({
//       pathname: "/screens/invoices/edit",
//       params: { id: invoice.id },
//     });
//   };

//   const createInvoice = () => {
//     router.push("/screens/invoices/create");
//   };

//   const handleMarkAsSent = (invoice: Invoice) => {
//     Alert.alert(
//       "Mark invoice as sent?",
//       `This will change ${invoice.invoiceNumber} to Sent.${
//         invoice.stockReductionTrigger === "sent"
//           ? " Stock linked to this invoice will also be reduced."
//           : ""
//       }`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Mark as Sent",
//           onPress: async () => {
//             try {
//               setProcessingId(invoice.id);
//               await markInvoiceAsSent(invoice.id);
//               await loadInvoices(false);
//             } catch (error) {
//               console.error("❌ Failed to mark invoice as sent:", error);
//               Alert.alert(
//                 "Unable to update invoice",
//                 error instanceof Error
//                   ? error.message
//                   : "Please try again."
//               );
//             } finally {
//               setProcessingId(null);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleMarkAsPaid = (invoice: Invoice) => {
//     Alert.alert(
//       "Mark invoice as paid?",
//       `The full balance of ${formatMoney(
//         invoice.balanceDue,
//         invoice.currencyCode,
//         invoice.locale
//       )} will be recorded as paid.${
//         invoice.stockReductionTrigger === "paid"
//           ? " Stock linked to this invoice will also be reduced."
//           : ""
//       }`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Mark as Paid",
//           onPress: async () => {
//             try {
//               setProcessingId(invoice.id);
//               await markInvoiceAsPaid(invoice.id);
//               await loadInvoices(false);
//             } catch (error) {
//               console.error("❌ Failed to mark invoice as paid:", error);
//               Alert.alert(
//                 "Unable to update invoice",
//                 error instanceof Error
//                   ? error.message
//                   : "Please try again."
//               );
//             } finally {
//               setProcessingId(null);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const renderSummaryCard = (
//     label: string,
//     value: string,
//     icon: keyof typeof Ionicons.glyphMap
//   ) => (
//     <View style={styles.summaryCard}>
//       <View style={styles.summaryIcon}>
//         <Ionicons name={icon} size={18} color="#dbeafe" />
//       </View>
//       <Text style={styles.summaryLabel}>{label}</Text>
//       <Text style={styles.summaryValue} numberOfLines={1}>
//         {value}
//       </Text>
//     </View>
//   );

//   const renderInvoice = ({ item }: { item: Invoice }) => {
//     const status =
//       STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
//     const isProcessing = processingId === item.id;
//     const canMarkSent = item.status === "draft";
//     const canMarkPaid = ![
//       "paid",
//       "cancelled",
//       "draft",
//     ].includes(item.status);

//     return (
//       <TouchableOpacity
//         activeOpacity={0.92}
//         onPress={() => openInvoice(item)}
//         style={styles.invoiceCard}
//       >
//         <View style={styles.cardTopRow}>
//           <View style={styles.invoiceIdentity}>
//             <View style={styles.documentIcon}>
//               <Ionicons
//                 name="document-text-outline"
//                 size={20}
//                 color="#bfdbfe"
//               />
//             </View>

//             <View style={styles.invoiceTitleBlock}>
//               <Text style={styles.invoiceNumber}>
//                 {item.invoiceNumber}
//               </Text>
//               <Text style={styles.customerName} numberOfLines={1}>
//                 {item.customerName || "Unnamed customer"}
//               </Text>
//             </View>
//           </View>

//           <View
//             style={[
//               styles.statusBadge,
//               { backgroundColor: status.background },
//             ]}
//           >
//             <Text
//               style={[styles.statusText, { color: status.text }]}
//             >
//               {status.label}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.cardDivider} />

//         <View style={styles.detailsGrid}>
//           <View style={styles.detailCell}>
//             <Text style={styles.detailLabel}>Invoice date</Text>
//             <Text style={styles.detailValue}>
//               {formatDate(item.invoiceDate)}
//             </Text>
//           </View>

//           <View style={styles.detailCell}>
//             <Text style={styles.detailLabel}>Due date</Text>
//             <Text style={styles.detailValue}>
//               {formatDate(item.dueDate)}
//             </Text>
//           </View>

//           <View style={styles.detailCell}>
//             <Text style={styles.detailLabel}>Total</Text>
//             <Text style={styles.detailAmount}>
//               {formatMoney(
//                 item.grandTotal,
//                 item.currencyCode,
//                 item.locale
//               )}
//             </Text>
//           </View>

//           <View style={styles.detailCell}>
//             <Text style={styles.detailLabel}>Balance</Text>
//             <Text
//               style={[
//                 styles.detailAmount,
//                 Number(item.balanceDue || 0) > 0
//                   ? styles.balanceOutstanding
//                   : styles.balanceSettled,
//               ]}
//             >
//               {formatMoney(
//                 item.balanceDue,
//                 item.currencyCode,
//                 item.locale
//               )}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.actionRow}>
//           <TouchableOpacity
//             activeOpacity={0.8}
//             style={styles.actionButton}
//             onPress={() => editInvoice(item)}
//           >
//             <Ionicons
//               name="create-outline"
//               size={16}
//               color="#dbeafe"
//             />
//             <Text style={styles.actionText}>Edit</Text>
//           </TouchableOpacity>

//           {canMarkSent && (
//             <TouchableOpacity
//               activeOpacity={0.8}
//               disabled={isProcessing}
//               style={styles.actionButton}
//               onPress={() => handleMarkAsSent(item)}
//             >
//               {isProcessing ? (
//                 <ActivityIndicator size="small" color="#dbeafe" />
//               ) : (
//                 <Ionicons
//                   name="send-outline"
//                   size={16}
//                   color="#dbeafe"
//                 />
//               )}
//               <Text style={styles.actionText}>Mark sent</Text>
//             </TouchableOpacity>
//           )}

//           {canMarkPaid && (
//             <TouchableOpacity
//               activeOpacity={0.8}
//               disabled={isProcessing}
//               style={[styles.actionButton, styles.paidActionButton]}
//               onPress={() => handleMarkAsPaid(item)}
//             >
//               {isProcessing ? (
//                 <ActivityIndicator size="small" color="#dcfce7" />
//               ) : (
//                 <Ionicons
//                   name="checkmark-circle-outline"
//                   size={16}
//                   color="#dcfce7"
//                 />
//               )}
//               <Text
//                 style={[
//                   styles.actionText,
//                   styles.paidActionText,
//                 ]}
//               >
//                 Mark paid
//               </Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity
//             activeOpacity={0.8}
//             style={styles.iconActionButton}
//             onPress={() => openInvoice(item)}
//           >
//             <Ionicons
//               name="chevron-forward"
//               size={19}
//               color="#bfdbfe"
//             />
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const emptyState = (
//     <View style={styles.emptyState}>
//       <View style={styles.emptyIcon}>
//         <Ionicons
//           name="receipt-outline"
//           size={42}
//           color="#bfdbfe"
//         />
//       </View>

//       <Text style={styles.emptyTitle}>
//         {invoices.length === 0
//           ? "No invoices yet"
//           : "No matching invoices"}
//       </Text>

//       <Text style={styles.emptyText}>
//         {invoices.length === 0
//           ? "Create your first professional invoice using stock items, custom products or services."
//           : "Try changing the status filter or search term."}
//       </Text>

//       {invoices.length === 0 && (
//         <TouchableOpacity
//           activeOpacity={0.9}
//           onPress={createInvoice}
//           style={styles.emptyCreateButton}
//         >
//           <Ionicons name="add" size={20} color="#0f172a" />
//           <Text style={styles.emptyCreateText}>
//             Create first invoice
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   return (
//     <ScreenWrapper>
//       <LinearGradient
//         colors={["#0d1b2a", "#1b263b", "#415a77"]}
//         style={styles.gradient}
//       >
//         <SafeAreaView style={styles.safeArea}>
//           <View style={styles.container}>
//             <View style={styles.header}>
//               <View>
//                 <Text style={styles.title}>Invoices</Text>
//                 <Text style={styles.subtitle}>
//                   Create, send and track customer invoices
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 onPress={createInvoice}
//                 style={styles.createButton}
//               >
//                 <Ionicons name="add" size={22} color="#0f172a" />
//                 <Text style={styles.createButtonText}>New</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.summaryGrid}>
//               {renderSummaryCard(
//                 "Invoiced",
//                 money(summary.totalInvoiced),
//                 "receipt-outline"
//               )}
//               {renderSummaryCard(
//                 "Paid",
//                 money(summary.totalPaid),
//                 "checkmark-circle-outline"
//               )}
//               {renderSummaryCard(
//                 "Outstanding",
//                 money(summary.outstanding),
//                 "wallet-outline"
//               )}
//               {renderSummaryCard(
//                 "Overdue",
//                 money(summary.overdue),
//                 "alert-circle-outline"
//               )}
//             </View>

//             <View style={styles.searchBox}>
//               <Ionicons
//                 name="search-outline"
//                 size={19}
//                 color="#94a3b8"
//               />
//               <TextInput
//                 value={searchText}
//                 onChangeText={setSearchText}
//                 placeholder="Search invoice, customer or reference"
//                 placeholderTextColor="#94a3b8"
//                 style={styles.searchInput}
//                 autoCapitalize="none"
//                 autoCorrect={false}
//                 returnKeyType="search"
//               />

//               {!!searchText && (
//                 <TouchableOpacity
//                   onPress={() => setSearchText("")}
//                   hitSlop={10}
//                 >
//                   <Ionicons
//                     name="close-circle"
//                     size={19}
//                     color="#94a3b8"
//                   />
//                 </TouchableOpacity>
//               )}
//             </View>

//             <View style={styles.filterWrapper}>
//               <FlatList
//                 horizontal
//                 data={FILTERS}
//                 keyExtractor={(item) => item.value}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.filterContent}
//                 renderItem={({ item }) => {
//                   const selected = filter === item.value;

//                   return (
//                     <TouchableOpacity
//                       activeOpacity={0.85}
//                       onPress={() => setFilter(item.value)}
//                       style={[
//                         styles.filterChip,
//                         selected && styles.filterChipSelected,
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.filterText,
//                           selected && styles.filterTextSelected,
//                         ]}
//                       >
//                         {item.label}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 }}
//               />
//             </View>

//             <Text style={styles.resultCount}>
//               {filteredInvoices.length}{" "}
//               {filteredInvoices.length === 1
//                 ? "invoice"
//                 : "invoices"}
//             </Text>

//             {loading ? (
//               <View style={styles.loader}>
//                 <ActivityIndicator size="large" color="#bfdbfe" />
//                 <Text style={styles.loaderText}>
//                   Loading invoices...
//                 </Text>
//               </View>
//             ) : (
//               <FlatList
//                 data={filteredInvoices}
//                 keyExtractor={(item) => item.id}
//                 renderItem={renderInvoice}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={[
//                   styles.listContent,
//                   filteredInvoices.length === 0 &&
//                     styles.emptyListContent,
//                 ]}
//                 ListEmptyComponent={emptyState}
//                 refreshControl={
//                   <RefreshControl
//                     refreshing={refreshing}
//                     onRefresh={onRefresh}
//                     tintColor="#bfdbfe"
//                   />
//                 }
//               />
//             )}
//           </View>
//         </SafeAreaView>
//       </LinearGradient>
//     </ScreenWrapper>
//   );
// };

// export default InvoiceListScreen;

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   safeArea: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 8,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 14,
//     marginBottom: 18,
//   },
//   title: {
//     color: "#f8fafc",
//     fontSize: 28,
//     fontWeight: "800",
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     color: "#cbd5e1",
//     fontSize: 13,
//     marginTop: 3,
//   },
//   createButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     backgroundColor: "#e0f2fe",
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 14,
//   },
//   createButtonText: {
//     color: "#0f172a",
//     fontSize: 14,
//     fontWeight: "800",
//   },
//   summaryGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//     marginBottom: 15,
//   },
//   summaryCard: {
//     width: "48.4%",
//     minHeight: 92,
//     borderRadius: 16,
//     padding: 13,
//     backgroundColor: "rgba(15, 23, 42, 0.44)",
//     borderWidth: 1,
//     borderColor: "rgba(191, 219, 254, 0.13)",
//   },
//   summaryIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(59, 130, 246, 0.16)",
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     color: "#94a3b8",
//     fontSize: 11,
//     fontWeight: "700",
//     textTransform: "uppercase",
//     letterSpacing: 0.55,
//   },
//   summaryValue: {
//     color: "#f8fafc",
//     fontSize: 17,
//     fontWeight: "800",
//     marginTop: 3,
//   },
//   searchBox: {
//     minHeight: 48,
//     borderRadius: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingHorizontal: 14,
//     backgroundColor: "rgba(15, 23, 42, 0.5)",
//     borderWidth: 1,
//     borderColor: "rgba(148, 163, 184, 0.2)",
//   },
//   searchInput: {
//     flex: 1,
//     color: "#f8fafc",
//     fontSize: 14,
//     paddingVertical: 11,
//   },
//   filterWrapper: {
//     marginTop: 12,
//     marginHorizontal: -16,
//   },
//   filterContent: {
//     paddingHorizontal: 16,
//     paddingRight: 24,
//     gap: 8,
//   },
//   filterChip: {
//     borderRadius: 999,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     backgroundColor: "rgba(15, 23, 42, 0.42)",
//     borderWidth: 1,
//     borderColor: "rgba(148, 163, 184, 0.18)",
//   },
//   filterChipSelected: {
//     backgroundColor: "#dbeafe",
//     borderColor: "#dbeafe",
//   },
//   filterText: {
//     color: "#cbd5e1",
//     fontSize: 12,
//     fontWeight: "700",
//   },
//   filterTextSelected: {
//     color: "#0f172a",
//   },
//   resultCount: {
//     color: "#cbd5e1",
//     fontSize: 12,
//     fontWeight: "700",
//     marginTop: 14,
//     marginBottom: 8,
//   },
//   listContent: {
//     paddingBottom: 110,
//   },
//   emptyListContent: {
//     flexGrow: 1,
//   },
//   invoiceCard: {
//     borderRadius: 18,
//     padding: 15,
//     marginBottom: 12,
//     backgroundColor: "rgba(15, 23, 42, 0.56)",
//     borderWidth: 1,
//     borderColor: "rgba(191, 219, 254, 0.13)",
//   },
//   cardTopRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     gap: 12,
//   },
//   invoiceIdentity: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 11,
//   },
//   documentIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: "rgba(59, 130, 246, 0.17)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   invoiceTitleBlock: {
//     flex: 1,
//   },
//   invoiceNumber: {
//     color: "#f8fafc",
//     fontSize: 16,
//     fontWeight: "800",
//   },
//   customerName: {
//     color: "#cbd5e1",
//     fontSize: 13,
//     marginTop: 3,
//   },
//   statusBadge: {
//     borderRadius: 999,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: "800",
//   },
//   cardDivider: {
//     height: 1,
//     backgroundColor: "rgba(148, 163, 184, 0.14)",
//     marginVertical: 13,
//   },
//   detailsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     rowGap: 13,
//   },
//   detailCell: {
//     width: "50%",
//   },
//   detailLabel: {
//     color: "#94a3b8",
//     fontSize: 11,
//     fontWeight: "700",
//     textTransform: "uppercase",
//     letterSpacing: 0.45,
//   },
//   detailValue: {
//     color: "#e2e8f0",
//     fontSize: 13,
//     fontWeight: "600",
//     marginTop: 4,
//   },
//   detailAmount: {
//     color: "#f8fafc",
//     fontSize: 14,
//     fontWeight: "800",
//     marginTop: 4,
//   },
//   balanceOutstanding: {
//     color: "#fcd34d",
//   },
//   balanceSettled: {
//     color: "#86efac",
//   },
//   actionRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginTop: 15,
//   },
//   actionButton: {
//     minHeight: 36,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//     borderRadius: 11,
//     paddingHorizontal: 10,
//     backgroundColor: "rgba(59, 130, 246, 0.14)",
//   },
//   paidActionButton: {
//     backgroundColor: "rgba(34, 197, 94, 0.14)",
//   },
//   actionText: {
//     color: "#dbeafe",
//     fontSize: 11,
//     fontWeight: "800",
//   },
//   paidActionText: {
//     color: "#dcfce7",
//   },
//   iconActionButton: {
//     marginLeft: "auto",
//     width: 36,
//     height: 36,
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 11,
//     backgroundColor: "rgba(148, 163, 184, 0.12)",
//   },
//   loader: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 12,
//   },
//   loaderText: {
//     color: "#cbd5e1",
//     fontSize: 13,
//   },
//   emptyState: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 30,
//     paddingBottom: 80,
//   },
//   emptyIcon: {
//     width: 82,
//     height: 82,
//     borderRadius: 26,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(59, 130, 246, 0.16)",
//     marginBottom: 18,
//   },
//   emptyTitle: {
//     color: "#f8fafc",
//     fontSize: 20,
//     fontWeight: "800",
//     textAlign: "center",
//   },
//   emptyText: {
//     color: "#cbd5e1",
//     fontSize: 14,
//     lineHeight: 21,
//     textAlign: "center",
//     marginTop: 8,
//   },
//   emptyCreateButton: {
//     marginTop: 20,
//     borderRadius: 14,
//     paddingHorizontal: 17,
//     paddingVertical: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 7,
//     backgroundColor: "#e0f2fe",
//   },
//   emptyCreateText: {
//     color: "#0f172a",
//     fontSize: 14,
//     fontWeight: "800",
//   },
// });

// app/screens/invoices/invoiceList.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getInvoices,
  markInvoiceAsPaid,
  markInvoiceAsSent,
} from "@/lib/invoiceStorage";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  GestureResponderEvent,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FilterStatus = "all" | InvoiceStatus;

const FILTERS: Array<{ label: string; value: FilterStatus }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Part Paid", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; background: string; text: string }
> = {
  draft: {
    label: "Draft",
    background: "rgba(148, 163, 184, 0.18)",
    text: "#cbd5e1",
  },
  sent: {
    label: "Sent",
    background: "rgba(59, 130, 246, 0.18)",
    text: "#93c5fd",
  },
  unpaid: {
    label: "Unpaid",
    background: "rgba(245, 158, 11, 0.18)",
    text: "#fcd34d",
  },
  partially_paid: {
    label: "Part Paid",
    background: "rgba(168, 85, 247, 0.18)",
    text: "#d8b4fe",
  },
  paid: {
    label: "Paid",
    background: "rgba(34, 197, 94, 0.18)",
    text: "#86efac",
  },
  overdue: {
    label: "Overdue",
    background: "rgba(239, 68, 68, 0.18)",
    text: "#fca5a5",
  },
  cancelled: {
    label: "Cancelled",
    background: "rgba(100, 116, 139, 0.18)",
    text: "#cbd5e1",
  },
};

const formatDate = (value?: string): string => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (
  amount: number,
  currencyCode: string,
  locale: string
): string => {
  try {
    return new Intl.NumberFormat(locale || "en-GB", {
      style: "currency",
      currency: currencyCode || "GBP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${
      currencyCode || ""
    }`.trim();
  }
};

const getInvoiceCustomerLabel = (invoice: Invoice): string =>
  invoice.customerCompany?.trim() ||
  invoice.customerName?.trim() ||
  "Unnamed customer";

const InvoiceListScreen = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(
    null
  );

  const loadInvoices = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const records = await getInvoices();
      setInvoices(records);
    } catch (error) {
      console.error("❌ Failed to load invoices:", error);
      Alert.alert(
        "Unable to load invoices",
        "Please try again in a moment."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [loadInvoices])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInvoices(false);
  }, [loadInvoices]);

  const filteredInvoices = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesFilter =
        filter === "all" || invoice.status === filter;

      if (!matchesFilter) return false;
      if (!query) return true;

      return [
        invoice.invoiceNumber,
        invoice.customerName,
        invoice.customerCompany,
        invoice.customerEmail,
        invoice.customerPhone,
        invoice.customerId,
        invoice.purchaseOrderNumber,
        invoice.reference,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [filter, invoices, searchText]);

  const summary = useMemo(() => {
    return invoices.reduce(
      (result, invoice) => {
        if (invoice.status !== "cancelled") {
          result.totalInvoiced += Number(invoice.grandTotal || 0);
          result.totalPaid += Number(invoice.amountPaid || 0);
          result.outstanding += Number(invoice.balanceDue || 0);
        }

        if (
          invoice.status === "overdue" &&
          Number(invoice.balanceDue || 0) > 0
        ) {
          result.overdue += Number(invoice.balanceDue || 0);
        }

        return result;
      },
      {
        totalInvoiced: 0,
        totalPaid: 0,
        outstanding: 0,
        overdue: 0,
      }
    );
  }, [invoices]);

  const summaryCurrency = invoices[0] || null;

  const money = useCallback(
    (amount: number) =>
      formatMoney(
        amount,
        summaryCurrency?.currencyCode || "GBP",
        summaryCurrency?.locale || "en-GB"
      ),
    [summaryCurrency]
  );

  const openInvoice = (invoice: Invoice) => {
    router.push({
      pathname: "/screens/invoices/view",
      params: { id: invoice.id },
    });
  };

  const editInvoice = (invoice: Invoice) => {
    router.push({
      pathname: "/screens/invoices/edit",
      params: { id: invoice.id },
    });
  };

  const createInvoice = () => {
    router.push("/screens/invoices/create");
  };

  const openCustomer = (
    event: GestureResponderEvent,
    invoice: Invoice
  ) => {
    event.stopPropagation();

    if (!invoice.customerId) return;

    router.push({
      pathname: "/screens/customers/[id]",
      params: { id: invoice.customerId },
    });
  };

  const handleMarkAsSent = (invoice: Invoice) => {
    Alert.alert(
      "Mark invoice as sent?",
      `This will change ${invoice.invoiceNumber} to Sent.${
        invoice.stockReductionTrigger === "sent"
          ? " Stock linked to this invoice will also be reduced."
          : ""
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark as Sent",
          onPress: async () => {
            try {
              setProcessingId(invoice.id);
              await markInvoiceAsSent(invoice.id);
              await loadInvoices(false);
            } catch (error) {
              console.error(
                "❌ Failed to mark invoice as sent:",
                error
              );
              Alert.alert(
                "Unable to update invoice",
                error instanceof Error
                  ? error.message
                  : "Please try again."
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // const handleMarkAsPaid = (invoice: Invoice) => {
  //   Alert.alert(
  //     "Mark invoice as paid?",
  //     `The full balance of ${formatMoney(
  //       invoice.balanceDue,
  //       invoice.currencyCode,
  //       invoice.locale
  //     )} will be recorded as paid.${
  //       invoice.stockReductionTrigger === "paid"
  //         ? " Stock linked to this invoice will also be reduced."
  //         : ""
  //     }`,
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Mark as Paid",
  //         onPress: async () => {
  //           try {
  //             setProcessingId(invoice.id);
  //             await markInvoiceAsPaid(invoice.id);
  //             await loadInvoices(false);
  //           } catch (error) {
  //             console.error(
  //               "❌ Failed to mark invoice as paid:",
  //               error
  //             );
  //             Alert.alert(
  //               "Unable to update invoice",
  //               error instanceof Error
  //                 ? error.message
  //                 : "Please try again."
  //             );
  //           } finally {
  //             setProcessingId(null);
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  const renderSummaryCard = (
    label: string,
    value: string,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Ionicons name={icon} size={18} color="#dbeafe" />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  const renderInvoice = ({ item }: { item: Invoice }) => {
    const status =
      STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;

    const isProcessing = processingId === item.id;

    const canMarkSent = item.status === "draft";

    const canRecordPayment =
      item.status !== "cancelled" &&
      item.status !== "draft" &&
      Number(item.balanceDue || 0) > 0;

    const customerLabel = getInvoiceCustomerLabel(item);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => openInvoice(item)}
        style={styles.invoiceCard}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.invoiceIdentity}>
            <View style={styles.documentIcon}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#bfdbfe"
              />
            </View>

            <View style={styles.invoiceTitleBlock}>
              <Text style={styles.invoiceNumber}>
                {item.invoiceNumber}
              </Text>

              {item.customerId ? (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={(event) => openCustomer(event, item)}
                  style={styles.customerLinkRow}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={15}
                    color="#93c5fd"
                  />

                  <Text
                    style={styles.customerLink}
                    numberOfLines={1}
                  >
                    {customerLabel}
                  </Text>

                  <Ionicons
                    name="open-outline"
                    size={12}
                    color="#93c5fd"
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.customerManualRow}>
                  <Ionicons
                    name="person-outline"
                    size={14}
                    color="#94a3b8"
                  />

                  <Text
                    style={styles.customerName}
                    numberOfLines={1}
                  >
                    {customerLabel}
                  </Text>

                  <View style={styles.manualBadge}>
                    <Text style={styles.manualBadgeText}>
                      Manual
                    </Text>
                  </View>
                </View>
              )}

              {item.customerCompany &&
              item.customerName &&
              item.customerCompany.trim() !==
                item.customerName.trim() ? (
                <Text
                  style={styles.contactName}
                  numberOfLines={1}
                >
                  Contact: {item.customerName}
                </Text>
              ) : null}
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status.background },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: status.text },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>
              Invoice date
            </Text>

            <Text style={styles.detailValue}>
              {formatDate(item.invoiceDate)}
            </Text>
          </View>

          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>
              Due date
            </Text>

            <Text style={styles.detailValue}>
              {formatDate(item.dueDate)}
            </Text>
          </View>

          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>
              Total
            </Text>

            <Text style={styles.detailAmount}>
              {formatMoney(
                item.grandTotal,
                item.currencyCode,
                item.locale
              )}
            </Text>
          </View>

          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>
              Balance
            </Text>

            <Text
              style={[
                styles.detailAmount,
                Number(item.balanceDue || 0) > 0
                  ? styles.balanceOutstanding
                  : styles.balanceSettled,
              ]}
            >
              {formatMoney(
                item.balanceDue,
                item.currencyCode,
                item.locale
              )}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.actionButton}
            onPress={(event) => {
              event.stopPropagation();
              editInvoice(item);
            }}
          >
            <Ionicons
              name="create-outline"
              size={16}
              color="#dbeafe"
            />

            <Text style={styles.actionText}>
              Edit
            </Text>
          </TouchableOpacity>

          {canMarkSent ? (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isProcessing}
              style={styles.actionButton}
              onPress={(event) => {
                event.stopPropagation();
                handleMarkAsSent(item);
              }}
            >
              {isProcessing ? (
                <ActivityIndicator
                  size="small"
                  color="#dbeafe"
                />
              ) : (
                <Ionicons
                  name="send-outline"
                  size={16}
                  color="#dbeafe"
                />
              )}

              <Text style={styles.actionText}>
                Mark sent
              </Text>
            </TouchableOpacity>
          ) : null}

          {canRecordPayment ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.actionButton,
                styles.paidActionButton,
              ]}
              onPress={(event) => {
                event.stopPropagation();

                router.push({
                  pathname:
                    "/screens/invoices/recordPayment",
                  params: {
                    id: item.id,
                  },
                });
              }}
            >
              <Ionicons
                name="cash-outline"
                size={16}
                color="#dcfce7"
              />

              <Text
                style={[
                  styles.actionText,
                  styles.paidActionText,
                ]}
              >
                Record payment
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconActionButton}
            onPress={(event) => {
              event.stopPropagation();
              openInvoice(item);
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={19}
              color="#bfdbfe"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  const emptyState = (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="receipt-outline"
          size={42}
          color="#bfdbfe"
        />
      </View>

      <Text style={styles.emptyTitle}>
        {invoices.length === 0
          ? "No invoices yet"
          : "No matching invoices"}
      </Text>

      <Text style={styles.emptyText}>
        {invoices.length === 0
          ? "Create your first professional invoice using stock items, custom products or services."
          : "Try changing the status filter or search term."}
      </Text>

      {invoices.length === 0 ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={createInvoice}
          style={styles.emptyCreateButton}
        >
          <Ionicons name="add" size={20} color="#0f172a" />
          <Text style={styles.emptyCreateText}>
            Create first invoice
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <ScreenWrapper>
      <LinearGradient
        colors={["#0d1b2a", "#1b263b", "#415a77"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.title}>Invoices</Text>
                <Text style={styles.subtitle}>
                  Create, send and track customer invoices
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={createInvoice}
                style={styles.createButton}
              >
                <Ionicons name="add" size={22} color="#0f172a" />
                <Text style={styles.createButtonText}>New</Text>
              </TouchableOpacity>
            </View>

            {/* <View style={styles.summaryGrid}>
              {renderSummaryCard(
                "Invoiced",
                money(summary.totalInvoiced),
                "receipt-outline"
              )}
              {renderSummaryCard(
                "Paid",
                money(summary.totalPaid),
                "checkmark-circle-outline"
              )}
              {renderSummaryCard(
                "Outstanding",
                money(summary.outstanding),
                "wallet-outline"
              )}
              {renderSummaryCard(
                "Overdue",
                money(summary.overdue),
                "alert-circle-outline"
              )}
            </View> */}

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={19}
                color="#94a3b8"
              />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search invoice, customer or reference"
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {Boolean(searchText) ? (
                <TouchableOpacity
                  onPress={() => setSearchText("")}
                  hitSlop={10}
                >
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.filterWrapper}>
              <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={(item) => item.value}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContent}
                renderItem={({ item }) => {
                  const selected = filter === item.value;

                  return (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setFilter(item.value)}
                      style={[
                        styles.filterChip,
                        selected &&
                          styles.filterChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          selected &&
                            styles.filterTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            <Text style={styles.resultCount}>
              {filteredInvoices.length}{" "}
              {filteredInvoices.length === 1
                ? "invoice"
                : "invoices"}
            </Text>

            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator
                  size="large"
                  color="#bfdbfe"
                />
                <Text style={styles.loaderText}>
                  Loading invoices...
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredInvoices}
                keyExtractor={(item) => item.id}
                renderItem={renderInvoice}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.listContent,
                  filteredInvoices.length === 0 &&
                    styles.emptyListContent,
                ]}
                ListEmptyComponent={emptyState}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#bfdbfe"
                  />
                }
              />
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

export default InvoiceListScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 18,
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 3,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  createButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  summaryCard: {
    width: "48.4%",
    minHeight: 92,
    borderRadius: 16,
    padding: 13,
    backgroundColor: "rgba(15, 23, 42, 0.44)",
    borderWidth: 1,
    borderColor: "rgba(191, 219, 254, 0.13)",
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.16)",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.55,
  },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 3,
  },
  searchBox: {
    minHeight: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 14,
    paddingVertical: 11,
  },
  filterWrapper: {
    marginTop: 12,
    marginHorizontal: -16,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  filterChipSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  filterText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
  },
  filterTextSelected: {
    color: "#0f172a",
  },
  resultCount: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 110,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  invoiceCard: {
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "rgba(15, 23, 42, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(191, 219, 254, 0.13)",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  invoiceIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.17)",
    alignItems: "center",
    justifyContent: "center",
  },
  invoiceTitleBlock: {
    flex: 1,
  },
  invoiceNumber: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
  },
  customerLinkRow: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  customerLink: {
    flexShrink: 1,
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "700",
  },
  customerManualRow: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  customerName: {
    flexShrink: 1,
    color: "#cbd5e1",
    fontSize: 13,
  },
  manualBadge: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(148, 163, 184, 0.15)",
  },
  manualBadgeText: {
    color: "#94a3b8",
    fontSize: 8,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  contactName: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 3,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(148, 163, 184, 0.14)",
    marginVertical: 13,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 13,
  },
  detailCell: {
    width: "50%",
  },
  detailLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  detailValue: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  detailAmount: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  balanceOutstanding: {
    color: "#fcd34d",
  },
  balanceSettled: {
    color: "#86efac",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 15,
  },
  actionButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 11,
    paddingHorizontal: 10,
    backgroundColor: "rgba(59, 130, 246, 0.14)",
  },
  paidActionButton: {
    backgroundColor: "rgba(34, 197, 94, 0.14)",
  },
  actionText: {
    color: "#dbeafe",
    fontSize: 11,
    fontWeight: "800",
  },
  paidActionText: {
    color: "#dcfce7",
  },
  iconActionButton: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.16)",
    marginBottom: 18,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
  emptyCreateButton: {
    marginTop: 20,
    borderRadius: 14,
    paddingHorizontal: 17,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#e0f2fe",
  },
  emptyCreateText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
});