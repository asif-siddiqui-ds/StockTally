// // app/screens/quotes/create.tsx

// import ScreenWrapper from "@/components/ScreenWrapper";
// import { getCustomers } from "@/lib/customerStorage";
// import {
//   createQuote,
//   getNextQuoteNumber,
// } from "@/lib/quoteStorage";
// import type { Customer } from "@/types/customer";
// import type {
//   CreateQuoteInput,
//   QuoteItem,
// } from "@/types/quote";
// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React, {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// type EditableQuoteItem = {
//   id: string;
//   name: string;
//   customerName: string;
//   description: string;
//   quantity: string;
//   unitPrice: string;
//   taxRate: string;
//   discountType: "percentage" | "fixed";
//   discountValue: string;
// };

// const createLocalId = () =>
//   `item_${Date.now()}_${Math.random()
//     .toString(36)
//     .slice(2, 8)}`;

// const emptyItem = (): EditableQuoteItem => ({
//   id: createLocalId(),
//   name: "",
//   customerName: "",
//   description: "",
//   quantity: "1",
//   unitPrice: "",
//   taxRate: "0",
//   discountType: "percentage",
//   discountValue: "0",
// });

// const parseNumber = (value: string) => {
//   const parsed = Number(value.replace(",", "."));
//   return Number.isFinite(parsed) ? parsed : 0;
// };

// const toIsoDate = (date: Date) =>
//   date.toISOString().slice(0, 10);

// const formatDisplayDate = (date: Date) =>
//   date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const buildCustomerAddress = (customer: Customer): string =>
//   [
//     customer.addressLine1,
//     customer.addressLine2,
//     customer.city,
//     customer.county,
//     customer.postcode,
//     customer.country,
//   ]
//     .filter(Boolean)
//     .join("\n");

// const CreateQuoteScreen = () => {
//   const [quoteNumber, setQuoteNumber] = useState("");
//   const [reference, setReference] = useState("");

//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [customerModalVisible, setCustomerModalVisible] =
//     useState(false);
//   const [customerSearch, setCustomerSearch] = useState("");
//   const [selectedCustomerId, setSelectedCustomerId] =
//     useState<string | undefined>();

//   const [customerName, setCustomerName] = useState("");
//   const [customerCompany, setCustomerCompany] =
//     useState("");
//   const [customerEmail, setCustomerEmail] = useState("");
//   const [customerPhone, setCustomerPhone] = useState("");
//   const [customerAddress, setCustomerAddress] =
//     useState("");
  
//   const [quoteDate, setQuoteDate] = useState(new Date());
//   const [expiryDate, setExpiryDate] = useState(() => {
//     const date = new Date();
//     date.setDate(date.getDate() + 30);
//     return date;
//   });
//   const [datePicker, setDatePicker] = useState<
//     "quote" | "expiry" | null
//   >(null);

//   const [items, setItems] = useState<EditableQuoteItem[]>([
//     emptyItem(),
//   ]);
//   const [notes, setNotes] = useState("");
//   const [terms, setTerms] = useState(
//     "This quotation is valid until the expiry date shown above."
//   );
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const currencyCode = "GBP";
//   const currencySymbol = "£";
//   const locale = "en-GB";

//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         const [nextNumber, savedCustomers] =
//           await Promise.all([
//             getNextQuoteNumber(),
//             getCustomers(),
//           ]);

//         setQuoteNumber(nextNumber);
//         setCustomers(savedCustomers);
//       } catch (error) {
//         console.error("Failed to initialise quote:", error);
//         Alert.alert(
//           "Unable to start quote",
//           "Please try again."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadInitialData();
//   }, []);

//   const filteredCustomers = useMemo(() => {
//     const term = customerSearch.trim().toLowerCase();

//     if (!term) return customers;

//     return customers.filter((customer) =>
//       [
//         customer.contactName,
//         customer.companyName,
//         customer.email,
//         customer.phone,
//       ]
//         .filter(Boolean)
//         .some((value) =>
//           String(value).toLowerCase().includes(term)
//         )
//     );
//   }, [customers, customerSearch]);

//   const calculatedItems = useMemo(() => {
//     return items.map((item): QuoteItem => {
//       const quantity = parseNumber(item.quantity);
//       const unitPrice = parseNumber(item.unitPrice);
//       const taxRate = parseNumber(item.taxRate);
//       const discountValue = parseNumber(
//         item.discountValue
//       );

//       const lineSubtotal = quantity * unitPrice;

//       const lineDiscount =
//         item.discountType === "percentage"
//           ? lineSubtotal * (discountValue / 100)
//           : Math.min(discountValue, lineSubtotal);

//       const taxableAmount = Math.max(
//         0,
//         lineSubtotal - lineDiscount
//       );

//       const lineTax = taxableAmount * (taxRate / 100);
//       const lineTotal = taxableAmount + lineTax;
//       const now = new Date().toISOString();

//       return {
//         id: item.id,
//         itemType: "custom",
//         name: item.name.trim(),
//         customerName: item.customerName.trim(),
//         description: item.description.trim(),
//         quantity,
//         unitPrice,
//         taxRate,
//         discountType: item.discountType,
//         discountValue,
//         lineSubtotal,
//         lineDiscount,
//         lineTax,
//         lineTotal,
//         createdAt: now,
//         updatedAt: now,
//       };
//     });
//   }, [items]);

//   const totals = useMemo(() => {
//     return calculatedItems.reduce(
//       (result, item) => {
//         result.subtotal += item.lineSubtotal;
//         result.discountTotal += item.lineDiscount;
//         result.taxTotal += item.lineTax;
//         result.grandTotal += item.lineTotal;
//         return result;
//       },
//       {
//         subtotal: 0,
//         discountTotal: 0,
//         taxTotal: 0,
//         grandTotal: 0,
//       }
//     );
//   }, [calculatedItems]);

//   const formatMoney = (value: number) =>
//     new Intl.NumberFormat(locale, {
//       style: "currency",
//       currency: currencyCode,
//     }).format(value || 0);

//   const selectCustomer = (customer: Customer) => {
//     setSelectedCustomerId(customer.id);
//     setCustomerName(customer.contactName || "");
//     setCustomerCompany(customer.companyName || "");
//     setCustomerEmail(customer.email || "");
//     setCustomerPhone(customer.phone || "");
//     setCustomerAddress(buildCustomerAddress(customer));
//     setCustomerModalVisible(false);
//     setCustomerSearch("");
//   };

//   const clearCustomer = () => {
//     setSelectedCustomerId(undefined);
//     setCustomerName("");
//     setCustomerCompany("");
//     setCustomerEmail("");
//     setCustomerPhone("");
//     setCustomerAddress("");

//   };

//   const updateItem = (
//     id: string,
//     key: keyof EditableQuoteItem,
//     value: string
//   ) => {
//     setItems((current) =>
//       current.map((item) =>
//         item.id === id ? { ...item, [key]: value } : item
//       )
//     );
//   };

//   const removeItem = (id: string) => {
//     if (items.length === 1) {
//       Alert.alert(
//         "At least one item required",
//         "A quote must contain at least one item."
//       );
//       return;
//     }

//     setItems((current) =>
//       current.filter((item) => item.id !== id)
//     );
//   };

//   const validate = () => {
//     if (!customerName.trim()) {
//       Alert.alert(
//         "Customer required",
//         "Enter or select a customer."
//       );
//       return false;
//     }

//     const invalidItem = calculatedItems.find(
//       (item) =>
//         !item.customerName ||
//         item.quantity <= 0 ||
//         item.unitPrice < 0
//     );

//     if (invalidItem) {
//       Alert.alert(
//         "Check quote items",
//         "Every item needs a name, quantity above zero and a valid price."
//       );
//       return false;
//     }

//     if (expiryDate < quoteDate) {
//       Alert.alert(
//         "Invalid expiry date",
//         "The expiry date cannot be before the quote date."
//       );
//       return false;
//     }

//     return true;
//   };

//   const handleSave = async () => {
//     if (!validate() || saving) return;

//     try {
//       setSaving(true);

//       const input: CreateQuoteInput = {
//         quoteNumber,
//         reference: reference.trim() || undefined,
//         status: "draft",
//         quoteDate: toIsoDate(quoteDate),
//         expiryDate: toIsoDate(expiryDate),

//         customerId: selectedCustomerId,
//         customerName: customerName.trim(),
//         customerCompany:
//           customerCompany.trim() || undefined,
//         customerEmail: customerEmail.trim() || undefined,
//         customerPhone: customerPhone.trim() || undefined,
//         customerAddress: customerAddress.trim() || undefined,

//         notes: notes.trim() || undefined,
//         terms: terms.trim() || undefined,

//         currencyCode,
//         currencySymbol,
//         locale,

//         subtotal: totals.subtotal,
//         discountTotal: totals.discountTotal,
//         taxTotal: totals.taxTotal,
//         grandTotal: totals.grandTotal,

//         items: calculatedItems,
//         synced: false,
//       };

//       const savedQuote = await createQuote(input);

//       router.replace({
//         pathname: "/screens/quotes/view",
//         params: { id: savedQuote.id },
//       });
//     } catch (error) {
//       console.error("Failed to save quote:", error);
//       Alert.alert(
//         "Save failed",
//         "The quote could not be saved."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <ScreenWrapper>
//         <LinearGradient
//           colors={["#0d1b2a", "#1b263b", "#415a77"]}
//           style={styles.gradient}
//         >
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator
//               size="large"
//               color="#bfdbfe"
//             />
//             <Text style={styles.loadingText}>
//               Preparing quote...
//             </Text>
//           </View>
//         </LinearGradient>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <LinearGradient
//         colors={["#0d1b2a", "#1b263b", "#415a77"]}
//         style={styles.gradient}
//       >
//         <SafeAreaView style={styles.safeArea}>
//           <KeyboardAvoidingView
//             style={styles.flex}
//             behavior={
//               Platform.OS === "ios" ? "padding" : undefined
//             }
//           >
//             <ScrollView
//               contentContainerStyle={styles.content}
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.header}>
//                 <TouchableOpacity
//                   onPress={() => router.back()}
//                   style={styles.iconButton}
//                 >
//                   <Ionicons
//                     name="arrow-back"
//                     size={21}
//                     color="#dbeafe"
//                   />
//                 </TouchableOpacity>

//                 <View style={styles.headerText}>
//                   <Text style={styles.title}>
//                     Create Quote
//                   </Text>
//                   <Text style={styles.subtitle}>
//                     {quoteNumber}
//                   </Text>
//                 </View>

//                 <TouchableOpacity
//                   onPress={handleSave}
//                   disabled={saving}
//                   style={styles.saveTopButton}
//                 >
//                   {saving ? (
//                     <ActivityIndicator
//                       size="small"
//                       color="#0f172a"
//                     />
//                   ) : (
//                     <Text style={styles.saveTopText}>
//                       Save
//                     </Text>
//                   )}
//                 </TouchableOpacity>
//               </View>

//               <Text style={styles.sectionTitle}>
//                 Customer
//               </Text>

//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 onPress={() =>
//                   setCustomerModalVisible(true)
//                 }
//                 style={styles.customerPicker}
//               >
//                 <View style={styles.customerPickerIcon}>
//                   <Ionicons
//                     name="person-outline"
//                     size={20}
//                     color="#bfdbfe"
//                   />
//                 </View>

//                 <View style={styles.flex}>
//                   <Text style={styles.customerPickerTitle}>
//                     {customerName ||
//                       "Select saved customer"}
//                   </Text>
//                   <Text style={styles.customerPickerSubtitle}>
//                     {selectedCustomerId
//                       ? customerEmail ||
//                         customerPhone ||
//                         "Saved customer selected"
//                       : "Or enter details manually below"}
//                   </Text>
//                 </View>

//                 <Ionicons
//                   name="chevron-forward"
//                   size={19}
//                   color="#94a3b8"
//                 />
//               </TouchableOpacity>

//               {selectedCustomerId ? (
//                 <TouchableOpacity
//                   onPress={clearCustomer}
//                   style={styles.clearCustomerButton}
//                 >
//                   <Text
//                     style={styles.clearCustomerButtonText}
//                   >
//                     Clear selected customer
//                   </Text>
//                 </TouchableOpacity>
//               ) : null}

//               <TextInput
//                 value={customerName}
//                 onChangeText={setCustomerName}
//                 placeholder="Customer name *"
//                 placeholderTextColor="#64748b"
//                 style={styles.input}
//               />
//               <TextInput
//                 value={customerCompany}
//                 onChangeText={setCustomerCompany}
//                 placeholder="Company name"
//                 placeholderTextColor="#64748b"
//                 style={styles.input}
//               />
//               <TextInput
//                 value={customerEmail}
//                 onChangeText={setCustomerEmail}
//                 placeholder="Email"
//                 placeholderTextColor="#64748b"
//                 style={styles.input}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//               />
//               <TextInput
//                 value={customerPhone}
//                 onChangeText={setCustomerPhone}
//                 placeholder="Phone"
//                 placeholderTextColor="#64748b"
//                 style={styles.input}
//                 keyboardType="phone-pad"
//               />
//               <TextInput
//                 value={customerAddress}
//                 onChangeText={setCustomerAddress}
//                 placeholder="Billing address"
//                 placeholderTextColor="#64748b"
//                 style={[styles.input, styles.multiline]}
//                 multiline
//               />

//               <Text style={styles.sectionTitle}>
//                 Quote details
//               </Text>

//               <TextInput
//                 value={reference}
//                 onChangeText={setReference}
//                 placeholder="Reference"
//                 placeholderTextColor="#64748b"
//                 style={styles.input}
//               />

//               <View style={styles.dateRow}>
//                 <TouchableOpacity
//                   onPress={() => setDatePicker("quote")}
//                   style={styles.dateCard}
//                 >
//                   <Text style={styles.fieldLabel}>
//                     Quote date
//                   </Text>
//                   <Text style={styles.dateValue}>
//                     {formatDisplayDate(quoteDate)}
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={() => setDatePicker("expiry")}
//                   style={styles.dateCard}
//                 >
//                   <Text style={styles.fieldLabel}>
//                     Expiry date
//                   </Text>
//                   <Text style={styles.dateValue}>
//                     {formatDisplayDate(expiryDate)}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>
//                   Quote items
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() =>
//                     setItems((current) => [
//                       ...current,
//                       emptyItem(),
//                     ])
//                   }
//                   style={styles.addItemButton}
//                 >
//                   <Ionicons
//                     name="add"
//                     size={17}
//                     color="#0f172a"
//                   />
//                   <Text style={styles.addItemText}>
//                     Add item
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {items.map((item, index) => (
//                 <View key={item.id} style={styles.itemCard}>
//                   <View style={styles.itemHeader}>
//                     <Text style={styles.itemTitle}>
//                       Item {index + 1}
//                     </Text>
//                     <TouchableOpacity
//                       onPress={() => removeItem(item.id)}
//                       hitSlop={8}
//                     >
//                       <Ionicons
//                         name="trash-outline"
//                         size={19}
//                         color="#fca5a5"
//                       />
//                     </TouchableOpacity>
//                   </View>

//                   <TextInput
//                     value={item.name}
//                     onChangeText={(value) =>
//                       updateItem(item.id, "name", value)
//                     }
//                     placeholder="Item name *"
//                     placeholderTextColor="#64748b"
//                     style={styles.input}
//                   />

//                   <TextInput
//                     value={item.description}
//                     onChangeText={(value) =>
//                       updateItem(
//                         item.id,
//                         "description",
//                         value
//                       )
//                     }
//                     placeholder="Description"
//                     placeholderTextColor="#64748b"
//                     style={[styles.input, styles.multiline]}
//                     multiline
//                   />

//                   <View style={styles.threeColumnRow}>
//                     <View style={styles.flex}>
//                       <Text style={styles.fieldLabel}>
//                         Quantity
//                       </Text>
//                       <TextInput
//                         value={item.quantity}
//                         onChangeText={(value) =>
//                           updateItem(
//                             item.id,
//                             "quantity",
//                             value
//                           )
//                         }
//                         keyboardType="decimal-pad"
//                         style={styles.input}
//                       />
//                     </View>

//                     <View style={styles.flex}>
//                       <Text style={styles.fieldLabel}>
//                         Unit price
//                       </Text>
//                       <TextInput
//                         value={item.unitPrice}
//                         onChangeText={(value) =>
//                           updateItem(
//                             item.id,
//                             "unitPrice",
//                             value
//                           )
//                         }
//                         keyboardType="decimal-pad"
//                         style={styles.input}
//                       />
//                     </View>

//                     <View style={styles.flex}>
//                       <Text style={styles.fieldLabel}>
//                         VAT %
//                       </Text>
//                       <TextInput
//                         value={item.taxRate}
//                         onChangeText={(value) =>
//                           updateItem(
//                             item.id,
//                             "taxRate",
//                             value
//                           )
//                         }
//                         keyboardType="decimal-pad"
//                         style={styles.input}
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.discountRow}>
//                     <TouchableOpacity
//                       onPress={() =>
//                         updateItem(
//                           item.id,
//                           "discountType",
//                           item.discountType === "percentage"
//                             ? "fixed"
//                             : "percentage"
//                         )
//                       }
//                       style={styles.discountTypeButton}
//                     >
//                       <Text style={styles.discountTypeText}>
//                         {item.discountType === "percentage"
//                           ? "Discount %"
//                           : `Discount ${currencySymbol}`}
//                       </Text>
//                     </TouchableOpacity>

//                     <TextInput
//                       value={item.discountValue}
//                       onChangeText={(value) =>
//                         updateItem(
//                           item.id,
//                           "discountValue",
//                           value
//                         )
//                       }
//                       keyboardType="decimal-pad"
//                       style={[
//                         styles.input,
//                         styles.discountInput,
//                       ]}
//                     />
//                   </View>

//                   <View style={styles.itemTotalRow}>
//                     <Text style={styles.itemTotalLabel}>
//                       Line total
//                     </Text>
//                     <Text style={styles.itemTotalValue}>
//                       {formatMoney(
//                         calculatedItems[index]?.lineTotal || 0
//                       )}
//                     </Text>
//                   </View>
//                 </View>
//               ))}

//               <Text style={styles.sectionTitle}>
//                 Notes and terms
//               </Text>

//               <TextInput
//                 value={notes}
//                 onChangeText={setNotes}
//                 placeholder="Customer notes"
//                 placeholderTextColor="#64748b"
//                 style={[styles.input, styles.multilineLarge]}
//                 multiline
//               />

//               <TextInput
//                 value={terms}
//                 onChangeText={setTerms}
//                 placeholder="Terms and conditions"
//                 placeholderTextColor="#64748b"
//                 style={[styles.input, styles.multilineLarge]}
//                 multiline
//               />

//               <View style={styles.totalsCard}>
//                 <View style={styles.totalRow}>
//                   <Text style={styles.totalLabel}>
//                     Subtotal
//                   </Text>
//                   <Text style={styles.totalValue}>
//                     {formatMoney(totals.subtotal)}
//                   </Text>
//                 </View>
//                 <View style={styles.totalRow}>
//                   <Text style={styles.totalLabel}>
//                     Discount
//                   </Text>
//                   <Text style={styles.totalValue}>
//                     -{formatMoney(totals.discountTotal)}
//                   </Text>
//                 </View>
//                 <View style={styles.totalRow}>
//                   <Text style={styles.totalLabel}>
//                     VAT
//                   </Text>
//                   <Text style={styles.totalValue}>
//                     {formatMoney(totals.taxTotal)}
//                   </Text>
//                 </View>
//                 <View style={styles.totalDivider} />
//                 <View style={styles.totalRow}>
//                   <Text style={styles.grandTotalLabel}>
//                     Quote total
//                   </Text>
//                   <Text style={styles.grandTotalValue}>
//                     {formatMoney(totals.grandTotal)}
//                   </Text>
//                 </View>
//               </View>

//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 disabled={saving}
//                 onPress={handleSave}
//                 style={styles.primaryButton}
//               >
//                 {saving ? (
//                   <ActivityIndicator color="#0f172a" />
//                 ) : (
//                   <>
//                     <Ionicons
//                       name="save-outline"
//                       size={20}
//                       color="#0f172a"
//                     />
//                     <Text style={styles.primaryButtonText}>
//                       Save Quote
//                     </Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </ScrollView>
//           </KeyboardAvoidingView>

//           <Modal
//             visible={customerModalVisible}
//             animationType="slide"
//             transparent
//             onRequestClose={() =>
//               setCustomerModalVisible(false)
//             }
//           >
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalSheet}>
//                 <View style={styles.modalHeader}>
//                   <Text style={styles.modalTitle}>
//                     Select customer
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() =>
//                       setCustomerModalVisible(false)
//                     }
//                   >
//                     <Ionicons
//                       name="close"
//                       size={24}
//                       color="#f8fafc"
//                     />
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.searchBox}>
//                   <Ionicons
//                     name="search-outline"
//                     size={18}
//                     color="#94a3b8"
//                   />
//                   <TextInput
//                     value={customerSearch}
//                     onChangeText={setCustomerSearch}
//                     placeholder="Search customers"
//                     placeholderTextColor="#64748b"
//                     style={styles.searchInput}
//                   />
//                 </View>

//                 <FlatList
//                   data={filteredCustomers}
//                   keyExtractor={(item) => item.id}
//                   keyboardShouldPersistTaps="handled"
//                   renderItem={({ item }) => (
//                     <TouchableOpacity
//                       onPress={() => selectCustomer(item)}
//                       style={styles.customerRow}
//                     >
//                       <View style={styles.customerAvatar}>
//                         <Text style={styles.customerAvatarText}>
//                           {(item.companyName ||
//                             item.contactName ||
//                             "?")
//                             .charAt(0)
//                             .toUpperCase()}
//                         </Text>
//                       </View>
//                       <View style={styles.flex}>
//                         <Text
//                           style={styles.customerRowTitle}
//                         >
//                           {item.companyName ||
//                             item.contactName ||
//                             "Unnamed customer"}
//                         </Text>
//                         <Text
//                           style={styles.customerRowSubtitle}
//                         >
//                           {item.email ||
//                             item.phone ||
//                             "No contact details"}
//                         </Text>
//                       </View>
//                     </TouchableOpacity>
//                   )}
//                   ListEmptyComponent={
//                     <Text style={styles.emptyModalText}>
//                       No matching customers found.
//                     </Text>
//                   }
//                 />
//               </View>
//             </View>
//           </Modal>

//           {datePicker ? (
//             <DateTimePicker
//               value={
//                 datePicker === "quote"
//                   ? quoteDate
//                   : expiryDate
//               }
//               mode="date"
//               display={
//                 Platform.OS === "ios"
//                   ? "spinner"
//                   : "default"
//               }
//               onChange={(_, selectedDate) => {
//                 if (Platform.OS !== "ios") {
//                   setDatePicker(null);
//                 }

//                 if (!selectedDate) return;

//                 if (datePicker === "quote") {
//                   setQuoteDate(selectedDate);
//                 } else {
//                   setExpiryDate(selectedDate);
//                 }
//               }}
//             />
//           ) : null}
//         </SafeAreaView>
//       </LinearGradient>
//     </ScreenWrapper>
//   );
// };

// export default CreateQuoteScreen;

// const styles = StyleSheet.create({
//   flex: { flex: 1 },
//   gradient: { flex: 1 },
//   safeArea: { flex: 1 },
//   content: {
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     paddingBottom: 48,
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//   },
//   loadingText: { color: "#cbd5e1" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginBottom: 18,
//   },
//   headerText: { flex: 1 },
//   title: {
//     color: "#f8fafc",
//     fontSize: 25,
//     fontWeight: "900",
//   },
//   subtitle: {
//     color: "#94a3b8",
//     fontSize: 12,
//     marginTop: 2,
//   },
//   iconButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 13,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(15,23,42,0.55)",
//   },
//   saveTopButton: {
//     minWidth: 62,
//     height: 40,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#dbeafe",
//   },
//   saveTopText: {
//     color: "#0f172a",
//     fontSize: 12,
//     fontWeight: "900",
//   },
//   sectionTitle: {
//     color: "#f8fafc",
//     fontSize: 16,
//     fontWeight: "900",
//     marginTop: 18,
//     marginBottom: 10,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   customerPicker: {
//     minHeight: 72,
//     borderRadius: 16,
//     padding: 13,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 11,
//     backgroundColor: "rgba(15,23,42,0.55)",
//     borderWidth: 1,
//     borderColor: "rgba(191,219,254,0.13)",
//   },
//   customerPickerIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 13,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(59,130,246,0.16)",
//   },
//   customerPickerTitle: {
//     color: "#f8fafc",
//     fontSize: 13,
//     fontWeight: "800",
//   },
//   customerPickerSubtitle: {
//     color: "#94a3b8",
//     fontSize: 10,
//     marginTop: 4,
//   },
//   clearCustomerButton: {
//     alignSelf: "flex-end",
//     paddingVertical: 8,
//   },
//   clearCustomerButtonText: {
//     color: "#fca5a5",
//     fontSize: 10,
//     fontWeight: "800",
//   },
//   input: {
//     minHeight: 47,
//     borderRadius: 13,
//     paddingHorizontal: 13,
//     color: "#f8fafc",
//     fontSize: 13,
//     backgroundColor: "rgba(15,23,42,0.55)",
//     borderWidth: 1,
//     borderColor: "rgba(191,219,254,0.13)",
//     marginTop: 9,
//   },
//   multiline: {
//     minHeight: 74,
//     paddingTop: 13,
//     textAlignVertical: "top",
//   },
//   multilineLarge: {
//     minHeight: 96,
//     paddingTop: 13,
//     textAlignVertical: "top",
//   },
//   dateRow: {
//     flexDirection: "row",
//     gap: 10,
//     marginTop: 9,
//   },
//   dateCard: {
//     flex: 1,
//     borderRadius: 13,
//     padding: 13,
//     backgroundColor: "rgba(15,23,42,0.55)",
//     borderWidth: 1,
//     borderColor: "rgba(191,219,254,0.13)",
//   },
//   fieldLabel: {
//     color: "#94a3b8",
//     fontSize: 10,
//     fontWeight: "800",
//     marginBottom: 5,
//   },
//   dateValue: {
//     color: "#f8fafc",
//     fontSize: 12,
//     fontWeight: "800",
//   },
//   addItemButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     borderRadius: 11,
//     paddingHorizontal: 11,
//     paddingVertical: 8,
//     backgroundColor: "#dbeafe",
//   },
//   addItemText: {
//     color: "#0f172a",
//     fontSize: 10,
//     fontWeight: "900",
//   },
//   itemCard: {
//     borderRadius: 17,
//     padding: 13,
//     marginBottom: 11,
//     backgroundColor: "rgba(15,23,42,0.55)",
//     borderWidth: 1,
//     borderColor: "rgba(191,219,254,0.13)",
//   },
//   itemHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   itemTitle: {
//     color: "#dbeafe",
//     fontSize: 12,
//     fontWeight: "900",
//   },
//   threeColumnRow: {
//     flexDirection: "row",
//     gap: 8,
//     marginTop: 2,
//   },
//   discountRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 9,
//     marginTop: 2,
//   },
//   discountTypeButton: {
//     flex: 1,
//     minHeight: 47,
//     borderRadius: 13,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(59,130,246,0.15)",
//   },
//   discountTypeText: {
//     color: "#bfdbfe",
//     fontSize: 11,
//     fontWeight: "800",
//   },
//   discountInput: {
//     flex: 1,
//     marginTop: 0,
//   },
//   itemTotalRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 13,
//   },
//   itemTotalLabel: {
//     color: "#94a3b8",
//     fontSize: 11,
//     fontWeight: "800",
//   },
//   itemTotalValue: {
//     color: "#f8fafc",
//     fontSize: 13,
//     fontWeight: "900",
//   },
//   totalsCard: {
//     borderRadius: 17,
//     padding: 15,
//     marginTop: 17,
//     backgroundColor: "rgba(15,23,42,0.65)",
//   },
//   totalRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   totalLabel: {
//     color: "#94a3b8",
//     fontSize: 12,
//   },
//   totalValue: {
//     color: "#e2e8f0",
//     fontSize: 12,
//     fontWeight: "800",
//   },
//   totalDivider: {
//     height: 1,
//     backgroundColor: "rgba(148,163,184,0.17)",
//     marginBottom: 12,
//   },
//   grandTotalLabel: {
//     color: "#f8fafc",
//     fontSize: 15,
//     fontWeight: "900",
//   },
//   grandTotalValue: {
//     color: "#86efac",
//     fontSize: 17,
//     fontWeight: "900",
//   },
//   primaryButton: {
//     minHeight: 52,
//     borderRadius: 15,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     backgroundColor: "#dbeafe",
//     marginTop: 18,
//   },
//   primaryButtonText: {
//     color: "#0f172a",
//     fontSize: 14,
//     fontWeight: "900",
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(2,6,23,0.65)",
//   },
//   modalSheet: {
//     maxHeight: "78%",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 16,
//     backgroundColor: "#172033",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   modalTitle: {
//     color: "#f8fafc",
//     fontSize: 18,
//     fontWeight: "900",
//   },
//   searchBox: {
//     minHeight: 46,
//     borderRadius: 13,
//     paddingHorizontal: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: "rgba(15,23,42,0.7)",
//     marginVertical: 13,
//   },
//   searchInput: {
//     flex: 1,
//     color: "#f8fafc",
//     fontSize: 13,
//   },
//   customerRow: {
//     minHeight: 64,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 11,
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(148,163,184,0.1)",
//   },
//   customerAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(59,130,246,0.2)",
//   },
//   customerAvatarText: {
//     color: "#dbeafe",
//     fontWeight: "900",
//   },
//   customerRowTitle: {
//     color: "#f8fafc",
//     fontSize: 13,
//     fontWeight: "800",
//   },
//   customerRowSubtitle: {
//     color: "#94a3b8",
//     fontSize: 10,
//     marginTop: 4,
//   },
//   emptyModalText: {
//     color: "#94a3b8",
//     textAlign: "center",
//     paddingVertical: 32,
//   },
// });

// app/screens/quotes/create.tsx

import ScreenWrapper from "@/components/ScreenWrapper";
import { getCustomers } from "@/lib/customerStorage";
import {
  createQuote,
  getNextQuoteNumber,
} from "@/lib/quoteStorage";
import type { Customer } from "@/types/customer";
import type {
  CreateQuoteInput,
  QuoteItem,
} from "@/types/quote";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type EditableQuoteItem = {
  id: string;
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
};

const createLocalId = (): string =>
  `item_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const emptyItem = (): EditableQuoteItem => ({
  id: createLocalId(),
  name: "",
  description: "",
  quantity: "1",
  unitPrice: "",
  taxRate: "0",
  discountType: "percentage",
  discountValue: "0",
});

const parseNumber = (value: string): number => {
  const parsed = Number(value.replace(",", "."));

  return Number.isFinite(parsed) ? parsed : 0;
};

const toIsoDate = (date: Date): string =>
  date.toISOString().slice(0, 10);

const formatDisplayDate = (date: Date): string =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const buildCustomerAddress = (
  customer: Customer,
): string =>
  [
    customer.addressLine1,
    customer.addressLine2,
    customer.city,
    customer.county,
    customer.postcode,
    customer.country,
  ]
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    )
    .map((value) => value.trim())
    .join("\n");

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const CreateQuoteScreen: React.FC = () => {
  const [quoteNumber, setQuoteNumber] = useState("");
  const [reference, setReference] = useState("");

  const [customers, setCustomers] = useState<Customer[]>(
    [],
  );
  const [
    customerModalVisible,
    setCustomerModalVisible,
  ] = useState(false);
  const [customerSearch, setCustomerSearch] =
    useState("");
  const [
    selectedCustomerId,
    setSelectedCustomerId,
  ] = useState<string | undefined>();

  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] =
    useState("");
  const [customerEmail, setCustomerEmail] =
    useState("");
  const [customerPhone, setCustomerPhone] =
    useState("");
  const [customerAddress, setCustomerAddress] =
    useState("");

  const [quoteDate, setQuoteDate] = useState(
    new Date(),
  );

  const [expiryDate, setExpiryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });

  const [datePicker, setDatePicker] = useState<
    "quote" | "expiry" | null
  >(null);

  const [items, setItems] = useState<
    EditableQuoteItem[]
  >([emptyItem()]);

  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(
    "This quotation is valid until the expiry date shown above.",
  );

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const currencyCode = "GBP";
  const currencySymbol = "£";
  const locale = "en-GB";

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [nextNumber, savedCustomers] =
          await Promise.all([
            getNextQuoteNumber(),
            getCustomers(),
          ]);

        setQuoteNumber(nextNumber);
        setCustomers(savedCustomers ?? []);
      } catch (error) {
        console.error(
          "Failed to initialise quote:",
          error,
        );

        Alert.alert(
          "Unable to start quote",
          "Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInitialData();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch
      .trim()
      .toLowerCase();

    if (!term) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.contactName,
        customer.companyName,
        customer.email,
        customer.phone,
      ]
        .filter(
          (value): value is string =>
            typeof value === "string",
        )
        .some((value) =>
          value.toLowerCase().includes(term),
        ),
    );
  }, [customers, customerSearch]);

  const calculatedItems = useMemo<QuoteItem[]>(
    () =>
      items.map((item) => {
        const quantity = parseNumber(item.quantity);
        const unitPrice = parseNumber(
          item.unitPrice,
        );
        const taxRate = parseNumber(item.taxRate);
        const discountValue = parseNumber(
          item.discountValue,
        );

        const lineSubtotal = quantity * unitPrice;

        const rawLineDiscount =
          item.discountType === "percentage"
            ? lineSubtotal *
              (Math.max(discountValue, 0) / 100)
            : Math.max(discountValue, 0);

        const lineDiscount = Math.min(
          rawLineDiscount,
          lineSubtotal,
        );

        const taxableAmount = Math.max(
          lineSubtotal - lineDiscount,
          0,
        );

        const lineTax =
          taxableAmount *
          (Math.max(taxRate, 0) / 100);

        const lineTotal = taxableAmount + lineTax;
        const now = new Date().toISOString();

        return {
          id: item.id,
          itemType: "custom",
          name: item.name.trim(),
          description:
            item.description.trim() || undefined,
          quantity,
          unitPrice,
          taxRate,
          discountType: item.discountType,
          discountValue,
          lineSubtotal,
          lineDiscount,
          lineTax,
          lineTotal,
          createdAt: now,
          updatedAt: now,
        };
      }),
    [items],
  );

  const totals = useMemo(
    () =>
      calculatedItems.reduce(
        (result, item) => ({
          subtotal:
            result.subtotal + item.lineSubtotal,
          discountTotal:
            result.discountTotal +
            item.lineDiscount,
          taxTotal:
            result.taxTotal + item.lineTax,
          grandTotal:
            result.grandTotal + item.lineTotal,
        }),
        {
          subtotal: 0,
          discountTotal: 0,
          taxTotal: 0,
          grandTotal: 0,
        },
      ),
    [calculatedItems],
  );

  const formatMoney = (value: number): string =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(Number(value) || 0);

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerName(
      customer.contactName?.trim() ||
        customer.companyName?.trim() ||
        "",
    );
    setCustomerCompany(
      customer.companyName?.trim() || "",
    );
    setCustomerEmail(
      customer.email?.trim() || "",
    );
    setCustomerPhone(
      customer.phone?.trim() || "",
    );
    setCustomerAddress(
      buildCustomerAddress(customer),
    );

    setCustomerModalVisible(false);
    setCustomerSearch("");
  };

  const clearCustomer = () => {
    setSelectedCustomerId(undefined);
    setCustomerName("");
    setCustomerCompany("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
  };

  const updateItem = <
    Key extends keyof EditableQuoteItem,
  >(
    id: string,
    key: Key,
    value: EditableQuoteItem[Key],
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      emptyItem(),
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      Alert.alert(
        "At least one item required",
        "A quote must contain at least one item.",
      );
      return;
    }

    setItems((current) =>
      current.filter((item) => item.id !== id),
    );
  };

  const validate = (): boolean => {
    if (!quoteNumber.trim()) {
      Alert.alert(
        "Quote number required",
        "A quote number could not be generated.",
      );
      return false;
    }

    if (!customerName.trim()) {
      Alert.alert(
        "Customer required",
        "Enter or select a customer.",
      );
      return false;
    }

    const invalidItem = calculatedItems.find(
      (item) =>
        !item.name.trim() ||
        item.quantity <= 0 ||
        item.unitPrice < 0 ||
        item.taxRate < 0 ||
        Number(item.discountValue ?? 0) < 0,
    );

    if (invalidItem) {
      Alert.alert(
        "Check quote items",
        "Every item needs a name, a quantity above zero, and valid non-negative price, VAT and discount values.",
      );
      return false;
    }

    const quoteDateOnly = new Date(quoteDate);
    quoteDateOnly.setHours(0, 0, 0, 0);

    const expiryDateOnly = new Date(expiryDate);
    expiryDateOnly.setHours(0, 0, 0, 0);

    if (
      expiryDateOnly.getTime() <
      quoteDateOnly.getTime()
    ) {
      Alert.alert(
        "Invalid expiry date",
        "The expiry date cannot be before the quote date.",
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (saving || !validate()) {
      return;
    }

    try {
      setSaving(true);

      const input: CreateQuoteInput = {
        quoteNumber: quoteNumber.trim(),
        reference:
          reference.trim() || undefined,
        status: "draft",

        quoteDate: toIsoDate(quoteDate),
        expiryDate: toIsoDate(expiryDate),

        customerId: selectedCustomerId,
        customerName: customerName.trim(),
        customerCompany:
          customerCompany.trim() || undefined,
        customerEmail:
          customerEmail.trim() || undefined,
        customerPhone:
          customerPhone.trim() || undefined,
        customerAddress:
          customerAddress.trim() || undefined,

        notes: notes.trim() || undefined,
        terms: terms.trim() || undefined,

        currencyCode,
        currencySymbol,
        locale,

        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        grandTotal: totals.grandTotal,

        items: calculatedItems,
        synced: false,
      };

      const savedQuote = await createQuote(input);

      router.replace({
        pathname: "/screens/quotes/view",
        params: {
          id: savedQuote.id,
        },
      });
    } catch (error) {
      console.error(
        "Failed to save quote:",
        error,
      );

      Alert.alert(
        "Save failed",
        getErrorMessage(
          error,
          "The quote could not be saved.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={[
            "#0d1b2a",
            "#1b263b",
            "#415a77",
          ]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#bfdbfe"
            />

            <Text style={styles.loadingText}>
              Preparing quote...
            </Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <LinearGradient
        colors={[
          "#0d1b2a",
          "#1b263b",
          "#415a77",
        ]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
          >
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <Ionicons
                    name="arrow-back"
                    size={21}
                    color="#dbeafe"
                  />
                </TouchableOpacity>

                <View style={styles.headerText}>
                  <Text style={styles.title}>
                    Create Quote
                  </Text>

                  <Text style={styles.subtitle}>
                    {quoteNumber}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    void handleSave();
                  }}
                  disabled={saving}
                  style={[
                    styles.saveTopButton,
                    saving &&
                      styles.disabledButton,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color="#0f172a"
                    />
                  ) : (
                    <Text style={styles.saveTopText}>
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>
                Customer
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  setCustomerModalVisible(true)
                }
                style={styles.customerPicker}
              >
                <View
                  style={styles.customerPickerIcon}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#bfdbfe"
                  />
                </View>

                <View style={styles.flex}>
                  <Text
                    style={
                      styles.customerPickerTitle
                    }
                  >
                    {customerName ||
                      "Select saved customer"}
                  </Text>

                  <Text
                    style={
                      styles.customerPickerSubtitle
                    }
                  >
                    {selectedCustomerId
                      ? customerEmail ||
                        customerPhone ||
                        "Saved customer selected"
                      : "Or enter details manually below"}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#94a3b8"
                />
              </TouchableOpacity>

              {selectedCustomerId ? (
                <TouchableOpacity
                  onPress={clearCustomer}
                  style={
                    styles.clearCustomerButton
                  }
                >
                  <Text
                    style={
                      styles.clearCustomerButtonText
                    }
                  >
                    Clear selected customer
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TextInput
                value={customerName}
                onChangeText={(value) => {
                  setCustomerName(value);

                  if (selectedCustomerId) {
                    setSelectedCustomerId(undefined);
                  }
                }}
                placeholder="Customer name *"
                placeholderTextColor="#64748b"
                style={styles.input}
              />

              <TextInput
                value={customerCompany}
                onChangeText={setCustomerCompany}
                placeholder="Company name"
                placeholderTextColor="#64748b"
                style={styles.input}
              />

              <TextInput
                value={customerEmail}
                onChangeText={setCustomerEmail}
                placeholder="Email"
                placeholderTextColor="#64748b"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="Phone"
                placeholderTextColor="#64748b"
                style={styles.input}
                keyboardType="phone-pad"
              />

              <TextInput
                value={customerAddress}
                onChangeText={setCustomerAddress}
                placeholder="Billing address"
                placeholderTextColor="#64748b"
                style={[
                  styles.input,
                  styles.multiline,
                ]}
                multiline
              />

              <Text style={styles.sectionTitle}>
                Quote details
              </Text>

              <TextInput
                value={reference}
                onChangeText={setReference}
                placeholder="Reference"
                placeholderTextColor="#64748b"
                style={styles.input}
              />

              <View style={styles.dateRow}>
                <TouchableOpacity
                  onPress={() =>
                    setDatePicker("quote")
                  }
                  style={styles.dateCard}
                >
                  <Text style={styles.fieldLabel}>
                    Quote date
                  </Text>

                  <Text style={styles.dateValue}>
                    {formatDisplayDate(quoteDate)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setDatePicker("expiry")
                  }
                  style={styles.dateCard}
                >
                  <Text style={styles.fieldLabel}>
                    Expiry date
                  </Text>

                  <Text style={styles.dateValue}>
                    {formatDisplayDate(expiryDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Quote items
                </Text>

                <TouchableOpacity
                  onPress={addItem}
                  style={styles.addItemButton}
                >
                  <Ionicons
                    name="add"
                    size={17}
                    color="#0f172a"
                  />

                  <Text style={styles.addItemText}>
                    Add item
                  </Text>
                </TouchableOpacity>
              </View>

              {items.map((item, index) => (
                <View
                  key={item.id}
                  style={styles.itemCard}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>
                      Item {index + 1}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        removeItem(item.id)
                      }
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove item ${
                        index + 1
                      }`}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color="#fca5a5"
                      />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    value={item.name}
                    onChangeText={(value) =>
                      updateItem(
                        item.id,
                        "name",
                        value,
                      )
                    }
                    placeholder="Item name *"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                  />

                  <TextInput
                    value={item.description}
                    onChangeText={(value) =>
                      updateItem(
                        item.id,
                        "description",
                        value,
                      )
                    }
                    placeholder="Description"
                    placeholderTextColor="#64748b"
                    style={[
                      styles.input,
                      styles.multiline,
                    ]}
                    multiline
                  />

                  <View
                    style={styles.threeColumnRow}
                  >
                    <View style={styles.flex}>
                      <Text
                        style={styles.fieldLabel}
                      >
                        Quantity
                      </Text>

                      <TextInput
                        value={item.quantity}
                        onChangeText={(value) =>
                          updateItem(
                            item.id,
                            "quantity",
                            value,
                          )
                        }
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor="#64748b"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.flex}>
                      <Text
                        style={styles.fieldLabel}
                      >
                        Unit price
                      </Text>

                      <TextInput
                        value={item.unitPrice}
                        onChangeText={(value) =>
                          updateItem(
                            item.id,
                            "unitPrice",
                            value,
                          )
                        }
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor="#64748b"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.flex}>
                      <Text
                        style={styles.fieldLabel}
                      >
                        VAT %
                      </Text>

                      <TextInput
                        value={item.taxRate}
                        onChangeText={(value) =>
                          updateItem(
                            item.id,
                            "taxRate",
                            value,
                          )
                        }
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor="#64748b"
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <View style={styles.discountRow}>
                    <TouchableOpacity
                      onPress={() =>
                        updateItem(
                          item.id,
                          "discountType",
                          item.discountType ===
                            "percentage"
                            ? "fixed"
                            : "percentage",
                        )
                      }
                      style={
                        styles.discountTypeButton
                      }
                    >
                      <Text
                        style={
                          styles.discountTypeText
                        }
                      >
                        {item.discountType ===
                        "percentage"
                          ? "Discount %"
                          : `Discount ${currencySymbol}`}
                      </Text>
                    </TouchableOpacity>

                    <TextInput
                      value={item.discountValue}
                      onChangeText={(value) =>
                        updateItem(
                          item.id,
                          "discountValue",
                          value,
                        )
                      }
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor="#64748b"
                      style={[
                        styles.input,
                        styles.discountInput,
                      ]}
                    />
                  </View>

                  <View
                    style={styles.itemTotalRow}
                  >
                    <Text
                      style={styles.itemTotalLabel}
                    >
                      Line total
                    </Text>

                    <Text
                      style={styles.itemTotalValue}
                    >
                      {formatMoney(
                        calculatedItems[index]
                          ?.lineTotal ?? 0,
                      )}
                    </Text>
                  </View>
                </View>
              ))}

              <Text style={styles.sectionTitle}>
                Notes and terms
              </Text>

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Customer notes"
                placeholderTextColor="#64748b"
                style={[
                  styles.input,
                  styles.multilineLarge,
                ]}
                multiline
              />

              <TextInput
                value={terms}
                onChangeText={setTerms}
                placeholder="Terms and conditions"
                placeholderTextColor="#64748b"
                style={[
                  styles.input,
                  styles.multilineLarge,
                ]}
                multiline
              />

              <View style={styles.totalsCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    Subtotal
                  </Text>

                  <Text style={styles.totalValue}>
                    {formatMoney(totals.subtotal)}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    Discount
                  </Text>

                  <Text style={styles.totalValue}>
                    -
                    {formatMoney(
                      totals.discountTotal,
                    )}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    VAT
                  </Text>

                  <Text style={styles.totalValue}>
                    {formatMoney(totals.taxTotal)}
                  </Text>
                </View>

                <View style={styles.totalDivider} />

                <View style={styles.totalRow}>
                  <Text
                    style={styles.grandTotalLabel}
                  >
                    Quote total
                  </Text>

                  <Text
                    style={styles.grandTotalValue}
                  >
                    {formatMoney(
                      totals.grandTotal,
                    )}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={saving}
                onPress={() => {
                  void handleSave();
                }}
                style={[
                  styles.primaryButton,
                  saving &&
                    styles.disabledButton,
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <>
                    <Ionicons
                      name="save-outline"
                      size={20}
                      color="#0f172a"
                    />

                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Save Quote
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>

          <Modal
            visible={customerModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() =>
              setCustomerModalVisible(false)
            }
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Select customer
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setCustomerModalVisible(false)
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Close customer list"
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color="#f8fafc"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchBox}>
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color="#94a3b8"
                  />

                  <TextInput
                    value={customerSearch}
                    onChangeText={
                      setCustomerSearch
                    }
                    placeholder="Search customers"
                    placeholderTextColor="#64748b"
                    style={styles.searchInput}
                  />
                </View>

                <FlatList
                  data={filteredCustomers}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const customerTitle =
                      item.companyName?.trim() ||
                      item.contactName?.trim() ||
                      "Unnamed customer";

                    const customerSubtitle =
                      item.email?.trim() ||
                      item.phone?.trim() ||
                      "No contact details";

                    return (
                      <TouchableOpacity
                        onPress={() =>
                          selectCustomer(item)
                        }
                        style={styles.customerRow}
                      >
                        <View
                          style={
                            styles.customerAvatar
                          }
                        >
                          <Text
                            style={
                              styles.customerAvatarText
                            }
                          >
                            {customerTitle
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>

                        <View style={styles.flex}>
                          <Text
                            style={
                              styles.customerRowTitle
                            }
                          >
                            {customerTitle}
                          </Text>

                          <Text
                            style={
                              styles.customerRowSubtitle
                            }
                          >
                            {customerSubtitle}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <Text
                      style={
                        styles.emptyModalText
                      }
                    >
                      No matching customers found.
                    </Text>
                  }
                />
              </View>
            </View>
          </Modal>

          {datePicker ? (
            <DateTimePicker
              value={
                datePicker === "quote"
                  ? quoteDate
                  : expiryDate
              }
              mode="date"
              display={
                Platform.OS === "ios"
                  ? "spinner"
                  : "default"
              }
              onChange={(_, selectedDate) => {
                if (Platform.OS !== "ios") {
                  setDatePicker(null);
                }

                if (!selectedDate) {
                  return;
                }

                if (datePicker === "quote") {
                  setQuoteDate(selectedDate);
                } else {
                  setExpiryDate(selectedDate);
                }
              }}
            />
          ) : null}
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

export default CreateQuoteScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 48,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    color: "#cbd5e1",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#f8fafc",
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.55)",
  },

  saveTopButton: {
    minWidth: 62,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
  },

  saveTopText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.65,
  },

  sectionTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 18,
    marginBottom: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  customerPicker: {
    minHeight: 72,
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.13)",
  },

  customerPickerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
  },

  customerPickerTitle: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "800",
  },

  customerPickerSubtitle: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 4,
  },

  clearCustomerButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
  },

  clearCustomerButtonText: {
    color: "#fca5a5",
    fontSize: 10,
    fontWeight: "800",
  },

  input: {
    minHeight: 47,
    borderRadius: 13,
    paddingHorizontal: 13,
    color: "#f8fafc",
    fontSize: 13,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.13)",
    marginTop: 9,
  },

  multiline: {
    minHeight: 74,
    paddingTop: 13,
    textAlignVertical: "top",
  },

  multilineLarge: {
    minHeight: 96,
    paddingTop: 13,
    textAlignVertical: "top",
  },

  dateRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 9,
  },

  dateCard: {
    flex: 1,
    borderRadius: 13,
    padding: 13,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.13)",
  },

  fieldLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 5,
  },

  dateValue: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "800",
  },

  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: "#dbeafe",
  },

  addItemText: {
    color: "#0f172a",
    fontSize: 10,
    fontWeight: "900",
  },

  itemCard: {
    borderRadius: 17,
    padding: 13,
    marginBottom: 11,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.13)",
  },

  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  itemTitle: {
    color: "#dbeafe",
    fontSize: 12,
    fontWeight: "900",
  },

  threeColumnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },

  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 2,
  },

  discountTypeButton: {
    flex: 1,
    minHeight: 47,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.15)",
  },

  discountTypeText: {
    color: "#bfdbfe",
    fontSize: 11,
    fontWeight: "800",
  },

  discountInput: {
    flex: 1,
    marginTop: 0,
  },

  itemTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
  },

  itemTotalLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
  },

  itemTotalValue: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "900",
  },

  totalsCard: {
    borderRadius: 17,
    padding: 15,
    marginTop: 17,
    backgroundColor: "rgba(15,23,42,0.65)",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  totalLabel: {
    color: "#94a3b8",
    fontSize: 12,
  },

  totalValue: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "800",
  },

  totalDivider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.17)",
    marginBottom: 12,
  },

  grandTotalLabel: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
  },

  grandTotalValue: {
    color: "#86efac",
    fontSize: 17,
    fontWeight: "900",
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#dbeafe",
    marginTop: 18,
  },

  primaryButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,6,23,0.65)",
  },

  modalSheet: {
    maxHeight: "78%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    backgroundColor: "#172033",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },

  searchBox: {
    minHeight: 46,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15,23,42,0.7)",
    marginVertical: 13,
  },

  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 13,
  },

  customerRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.1)",
  },

  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.2)",
  },

  customerAvatarText: {
    color: "#dbeafe",
    fontWeight: "900",
  },

  customerRowTitle: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "800",
  },

  customerRowSubtitle: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 4,
  },

  emptyModalText: {
    color: "#94a3b8",
    textAlign: "center",
    paddingVertical: 32,
  },
});
