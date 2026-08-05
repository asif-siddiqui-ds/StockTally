// // app/screens/invoices/view.tsx
// import ScreenWrapper from "@/components/ScreenWrapper";
// import { getCachedUserId } from "@/context/AuthContext";
// import { buildInvoiceA4Html } from "@/lib/invoicePdf";
// import {
//   getInvoiceById,
//   markInvoiceAsPaid,
//   markInvoiceAsSent,
// } from "@/lib/invoiceStorage";
// import {
//   CompanyProfile,
//   getCompanyProfile,
// } from "@/lib/storage";
// import type { Invoice } from "@/types/invoice";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import * as FileSystem from "expo-file-system/legacy";
// import * as Print from "expo-print";
// import { router, Stack, useLocalSearchParams } from "expo-router";
// import * as Sharing from "expo-sharing";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { WebView } from "react-native-webview";


// const getImageMimeType = (uri: string): string => {
//   const cleanUri = uri.split("?")[0].toLowerCase();

//   if (cleanUri.endsWith(".png")) return "image/png";
//   if (cleanUri.endsWith(".webp")) return "image/webp";
//   if (cleanUri.endsWith(".gif")) return "image/gif";

//   return "image/jpeg";
// };

// const resolveInvoiceLogoSource = async (
//   profile: CompanyProfile | null
// ): Promise<string> => {
//   const source = profile?.logoLocal?.trim();

//   if (!source) return "";

//   // Already usable by both WebView and the print engine.
//   if (
//     source.startsWith("data:image/") ||
//     source.startsWith("http://") ||
//     source.startsWith("https://")
//   ) {
//     return source;
//   }

//   // Local image paths cannot reliably be loaded inside generated HTML.
//   // Convert them to an embedded base64 data URI.
//   try {
//     const base64 = await FileSystem.readAsStringAsync(source, {
//       encoding: FileSystem.EncodingType.Base64,
//     });

//     return `data:${getImageMimeType(source)};base64,${base64}`;
//   } catch (error) {
//     console.warn("⚠️ Unable to prepare invoice logo:", error);
//     return "";
//   }
// };

// const InvoiceViewScreen = () => {
//   const insets = useSafeAreaInsets();
//   const params = useLocalSearchParams<{
//     id?: string;
//     preview?: string;
//   }>();

//   const invoiceId = Array.isArray(params.id)
//     ? params.id[0]
//     : params.id;

//   const [invoice, setInvoice] = useState<Invoice | null>(null);
//   const [companyProfile, setCompanyProfile] =
//     useState<CompanyProfile | null>(null);
//   const [logoSource, setLogoSource] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);

//   useEffect(() => {
//     loadData();
//   }, [invoiceId]);

//   const loadData = async () => {
//     try {
//       if (!invoiceId) {
//         Alert.alert(
//           "Invoice not found",
//           "No invoice ID was provided."
//         );
//         router.back();
//         return;
//       }

//       setLoading(true);

//       const userId = (await getCachedUserId()) || "guest";

//       const [invoiceRecord, profile] = await Promise.all([
//         getInvoiceById(invoiceId),
//         getCompanyProfile(userId),
//       ]);

//       if (!invoiceRecord) {
//         Alert.alert(
//           "Invoice not found",
//           "This invoice could not be loaded."
//         );
//         router.back();
//         return;
//       }

//       setInvoice(invoiceRecord);
//       setCompanyProfile(profile);

//       const resolvedLogo = await resolveInvoiceLogoSource(profile);
//       setLogoSource(resolvedLogo);
//     } catch (error) {
//       console.error("❌ Failed to open invoice:", error);
//       Alert.alert(
//         "Unable to open invoice",
//         "Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const html = useMemo(() => {
//     if (!invoice) return "";

//     return buildInvoiceA4Html({
//       invoice,
//       companyProfile,
//       logoSource,
//     });
//   }, [companyProfile, invoice, logoSource]);

//   const createPdf = async (): Promise<string> => {
//     if (!invoice) {
//       throw new Error("Invoice is not available.");
//     }

//     const result = await Print.printToFileAsync({
//       html,
//       base64: false,
//     });

//     return result.uri;
//   };

//   const handlePrint = async () => {
//     try {
//       setProcessing(true);

//       await Print.printAsync({
//         html,
//       });
//     } catch (error) {
//       console.error("❌ Print failed:", error);
//       Alert.alert(
//         "Unable to print",
//         "The invoice could not be sent to the printer."
//       );
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleShare = async () => {
//     try {
//       setProcessing(true);

//       const available = await Sharing.isAvailableAsync();

//       if (!available) {
//         Alert.alert(
//           "Sharing unavailable",
//           "Sharing is not available on this device."
//         );
//         return;
//       }

//       const uri = await createPdf();

//       await Sharing.shareAsync(uri, {
//         mimeType: "application/pdf",
//         dialogTitle: invoice
//           ? `Share ${invoice.invoiceNumber}`
//           : "Share invoice",
//         UTI: "com.adobe.pdf",
//       });
//     } catch (error) {
//       console.error("❌ Share invoice failed:", error);
//       Alert.alert(
//         "Unable to share",
//         "The PDF could not be created or shared."
//       );
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleDownloadPdf = async () => {
//     try {
//       setProcessing(true);

//       const uri = await createPdf();

//       if (Platform.OS === "web") {
//         Alert.alert(
//           "PDF created",
//           "The PDF has been generated."
//         );
//         return;
//       }

//       const available = await Sharing.isAvailableAsync();

//       if (available) {
//         await Sharing.shareAsync(uri, {
//           mimeType: "application/pdf",
//           dialogTitle: invoice
//             ? `Save ${invoice.invoiceNumber}`
//             : "Save invoice PDF",
//           UTI: "com.adobe.pdf",
//         });
//       } else {
//         Alert.alert(
//           "PDF created",
//           `Saved temporarily at:\n${uri}`
//         );
//       }
//     } catch (error) {
//       console.error("❌ PDF generation failed:", error);
//       Alert.alert(
//         "Unable to create PDF",
//         "Please try again."
//       );
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleEdit = () => {
//     if (!invoice) return;

//     router.push({
//       pathname: "/screens/invoices/edit",
//       params: { id: invoice.id },
//     });
//   };

//   const handleMarkSent = () => {
//     if (!invoice) return;

//     Alert.alert(
//       "Mark invoice as sent?",
//       invoice.stockReductionTrigger === "sent"
//         ? "This will mark the invoice as sent and reduce linked stock."
//         : "This will mark the invoice as sent.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Mark as sent",
//           onPress: async () => {
//             try {
//               setProcessing(true);
//               const updated = await markInvoiceAsSent(
//                 invoice.id
//               );
//               if (updated) setInvoice(updated);
//             } catch (error) {
//               Alert.alert(
//                 "Unable to update invoice",
//                 error instanceof Error
//                   ? error.message
//                   : "Please try again."
//               );
//             } finally {
//               setProcessing(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleMarkPaid = () => {
//     if (!invoice) return;

//     Alert.alert(
//       "Mark invoice as paid?",
//       invoice.stockReductionTrigger === "paid"
//         ? "This will mark the full balance as paid and reduce linked stock."
//         : "This will mark the full invoice balance as paid.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Mark as paid",
//           onPress: async () => {
//             try {
//               setProcessing(true);
//               const updated = await markInvoiceAsPaid(
//                 invoice.id
//               );
//               if (updated) setInvoice(updated);
//             } catch (error) {
//               Alert.alert(
//                 "Unable to update invoice",
//                 error instanceof Error
//                   ? error.message
//                   : "Please try again."
//               );
//             } finally {
//               setProcessing(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   if (loading) {
//     return (
//       <ScreenWrapper>
//         <LinearGradient
//           colors={["#0d1b2a", "#1b263b", "#415a77"]}
//           style={styles.gradient}
//         >
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#bfdbfe" />
//             <Text style={styles.loadingText}>
//               Preparing A4 invoice...
//             </Text>
//           </View>
//         </LinearGradient>
//       </ScreenWrapper>
//     );
//   }

//   if (!invoice) return null;

//   return (
//     <>
//       <Stack.Screen options={{ headerShown: false }} />

//       <ScreenWrapper>
//         <LinearGradient
//           colors={["#0d1b2a", "#1b263b", "#415a77"]}
//           style={styles.gradient}
//         >
//           <View
//             style={[
//               styles.container,
//               {
//                 paddingTop: Math.max(insets.top + 6, 14),
//                 paddingBottom: Math.max(insets.bottom + 8, 12),
//               },
//             ]}
//           >
//             <View style={styles.header}>
//               <TouchableOpacity
//                 onPress={() => router.back()}
//                 style={styles.headerIconButton}
//               >
//                 <Ionicons
//                   name="arrow-back"
//                   size={22}
//                   color="#e2e8f0"
//                 />
//               </TouchableOpacity>

//               <View style={styles.headerTextBlock}>
//                 <Text style={styles.title}>
//                   {invoice.invoiceNumber}
//                 </Text>
//                 <Text style={styles.subtitle}>
//                   Professional A4 invoice preview
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 onPress={handleEdit}
//                 style={styles.headerIconButton}
//               >
//                 <Ionicons
//                   name="create-outline"
//                   size={21}
//                   color="#e2e8f0"
//                 />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.previewCard}>
//               <WebView
//                 originWhitelist={["*"]}
//                 source={{ html }}
//                 style={styles.webView}
//                 scalesPageToFit
//                 showsVerticalScrollIndicator
//                 showsHorizontalScrollIndicator
//               />
//             </View>

//             <View style={styles.actionDock}>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.actionBar}
//                 style={styles.actionScroll}
//               >
//               <TouchableOpacity
//                 disabled={processing}
//                 onPress={handleDownloadPdf}
//                 style={styles.actionButton}
//               >
//                 <Ionicons
//                   name="download-outline"
//                   size={19}
//                   color="#dbeafe"
//                 />
//                 <Text style={styles.actionButtonText}>
//                   Save PDF
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 disabled={processing}
//                 onPress={handlePrint}
//                 style={styles.actionButton}
//               >
//                 <Ionicons
//                   name="print-outline"
//                   size={19}
//                   color="#dbeafe"
//                 />
//                 <Text style={styles.actionButtonText}>
//                   Print
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 disabled={processing}
//                 onPress={handleShare}
//                 style={styles.actionButton}
//               >
//                 <Ionicons
//                   name="share-social-outline"
//                   size={19}
//                   color="#dbeafe"
//                 />
//                 <Text style={styles.actionButtonText}>
//                   Share
//                 </Text>
//               </TouchableOpacity>

//               {invoice.status === "draft" && (
//                 <TouchableOpacity
//                   disabled={processing}
//                   onPress={handleMarkSent}
//                   style={[
//                     styles.actionButton,
//                     styles.sentButton,
//                   ]}
//                 >
//                   <Ionicons
//                     name="send-outline"
//                     size={19}
//                     color="#dbeafe"
//                   />
//                   <Text style={styles.actionButtonText}>
//                     Mark sent
//                   </Text>
//                 </TouchableOpacity>
//               )}

//               {![
//                 "paid",
//                 "cancelled",
//                 "draft",
//               ].includes(invoice.status) && (
//                 <TouchableOpacity
//                   disabled={processing}
//                   onPress={handleMarkPaid}
//                   style={[
//                     styles.actionButton,
//                     styles.paidButton,
//                   ]}
//                 >
//                   <Ionicons
//                     name="checkmark-circle-outline"
//                     size={19}
//                     color="#dcfce7"
//                   />
//                   <Text
//                     style={[
//                       styles.actionButtonText,
//                       styles.paidButtonText,
//                     ]}
//                   >
//                     Mark paid
//                   </Text>
//                 </TouchableOpacity>
//               )}
//               </ScrollView>
//             </View>

//             {processing && (
//               <View style={styles.processingOverlay}>
//                 <ActivityIndicator
//                   size="small"
//                   color="#0f172a"
//                 />
//                 <Text style={styles.processingText}>
//                   Processing...
//                 </Text>
//               </View>
//             )}
//           </View>
//         </LinearGradient>
//       </ScreenWrapper>
//     </>
//   );
// };

// export default InvoiceViewScreen;

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 12,
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 12,
//   },
//   loadingText: {
//     color: "#cbd5e1",
//     fontSize: 14,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   headerIconButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 13,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(15,23,42,0.5)",
//     borderWidth: 1,
//     borderColor: "rgba(148,163,184,0.18)",
//   },
//   headerTextBlock: {
//     flex: 1,
//     paddingHorizontal: 12,
//   },
//   title: {
//     color: "#f8fafc",
//     fontSize: 20,
//     fontWeight: "800",
//   },
//   subtitle: {
//     color: "#cbd5e1",
//     fontSize: 12,
//     marginTop: 2,
//   },
//   previewCard: {
//     flex: 1,
//     overflow: "hidden",
//     borderRadius: 14,
//     backgroundColor: "#d9e0e8",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.18)",
//   },
//   webView: {
//     flex: 1,
//     backgroundColor: "#d9e0e8",
//   },
//   actionDock: {
//     height: 66,
//     marginTop: 10,
//     borderRadius: 16,
//     backgroundColor: "rgba(15,23,42,0.42)",
//     borderWidth: 1,
//     borderColor: "rgba(191,219,254,0.14)",
//     overflow: "hidden",
//   },
//   actionScroll: {
//     flexGrow: 0,
//   },
//   actionBar: {
//     alignItems: "center",
//     gap: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//   },
//   actionButton: {
//     height: 48,
//     minWidth: 108,
//     borderRadius: 12,
//     paddingHorizontal: 13,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 7,
//     backgroundColor: "rgba(15,23,42,0.72)",
//     borderWidth: 1,
//     borderColor: "rgba(191,219,254,0.18)",
//   },
//   sentButton: {
//     backgroundColor: "rgba(59,130,246,0.22)",
//     borderColor: "rgba(147,197,253,0.28)",
//   },
//   paidButton: {
//     backgroundColor: "rgba(34,197,94,0.18)",
//     borderColor: "rgba(134,239,172,0.24)",
//   },
//   actionButtonText: {
//     color: "#dbeafe",
//     fontSize: 12,
//     fontWeight: "800",
//     letterSpacing: 0.1,
//   },
//   paidButtonText: {
//     color: "#dcfce7",
//   },
//   processingOverlay: {
//     position: "absolute",
//     right: 18,
//     top: 66,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 7,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 9,
//     backgroundColor: "#dbeafe",
//   },
//   processingText: {
//     color: "#0f172a",
//     fontSize: 12,
//     fontWeight: "800",
//   },
// });

// app/screens/invoices/view.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { getCachedUserId } from "@/context/AuthContext";
import { buildInvoiceA4Html } from "@/lib/invoicePdf";
import {
  addInvoicePayment,
  deleteInvoicePayment,
  getInvoiceById,
  getInvoicePayments,
  markInvoiceAsSent,
} from "@/lib/invoiceStorage";
import {
  CompanyProfile,
  getCompanyProfile,
} from "@/lib/storage";
import type {
  Invoice,
  InvoicePayment,
  InvoicePaymentMethod,
} from "@/types/invoice";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { router, Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

let DateTimePickerModal: any = null;

if (Platform.OS !== "web") {
  try {
    DateTimePickerModal =
      require("react-native-modal-datetime-picker").default;
  } catch {
    console.warn("DateTimePickerModal not available");
  }
}

const PAYMENT_METHODS: Array<{
  value: InvoicePaymentMethod;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { value: "cash", label: "Cash", icon: "cash-outline" },
  { value: "card", label: "Card", icon: "card-outline" },
  {
    value: "bank_transfer",
    label: "Bank transfer",
    icon: "swap-horizontal-outline",
  },
  { value: "cheque", label: "Cheque", icon: "document-text-outline" },
  { value: "online", label: "Online", icon: "globe-outline" },
  { value: "other", label: "Other", icon: "ellipsis-horizontal-outline" },
];

const getImageMimeType = (uri: string): string => {
  const cleanUri = uri.split("?")[0].toLowerCase();

  if (cleanUri.endsWith(".png")) return "image/png";
  if (cleanUri.endsWith(".webp")) return "image/webp";
  if (cleanUri.endsWith(".gif")) return "image/gif";

  return "image/jpeg";
};

const resolveInvoiceLogoSource = async (
  profile: CompanyProfile | null
): Promise<string> => {
  const source = profile?.logoLocal?.trim();

  if (!source) return "";

  if (
    source.startsWith("data:image/") ||
    source.startsWith("http://") ||
    source.startsWith("https://")
  ) {
    return source;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(source, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return `data:${getImageMimeType(source)};base64,${base64}`;
  } catch (error) {
    console.warn("⚠️ Unable to prepare invoice logo:", error);
    return "";
  }
};

const formatDate = (value?: string): string => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const methodLabel = (method: InvoicePaymentMethod): string =>
  PAYMENT_METHODS.find((item) => item.value === method)?.label || "Other";

const InvoiceViewScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    preview?: string;
  }>();

  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [companyProfile, setCompanyProfile] =
    useState<CompanyProfile | null>(null);
  const [logoSource, setLogoSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<InvoicePaymentMethod>("bank_transfer");
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  useEffect(() => {
    loadData();
  }, [invoiceId]);

  const loadData = async () => {
    try {
      if (!invoiceId) {
        Alert.alert("Invoice not found", "No invoice ID was provided.");
        router.back();
        return;
      }

      setLoading(true);

      const userId = (await getCachedUserId()) || "guest";

      const [invoiceRecord, profile] = await Promise.all([
        getInvoiceById(invoiceId),
        getCompanyProfile(userId),
      ]);

      if (!invoiceRecord) {
        Alert.alert(
          "Invoice not found",
          "This invoice could not be loaded."
        );
        router.back();
        return;
      }

      const paymentRecords = await getInvoicePayments(invoiceRecord.id);
      const refreshedInvoice = await getInvoiceById(invoiceRecord.id);

      setInvoice(
        refreshedInvoice
          ? { ...refreshedInvoice, payments: paymentRecords }
          : { ...invoiceRecord, payments: paymentRecords }
      );
      setPayments(paymentRecords);
      setCompanyProfile(profile);

      const resolvedLogo = await resolveInvoiceLogoSource(profile);
      setLogoSource(resolvedLogo);
    } catch (error) {
      console.error("❌ Failed to open invoice:", error);
      Alert.alert("Unable to open invoice", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const html = useMemo(() => {
    if (!invoice) return "";

    return buildInvoiceA4Html({
      invoice: { ...invoice, payments },
      companyProfile,
      logoSource,
    });
  }, [companyProfile, invoice, logoSource, payments]);

  const money = (amount: number): string => {
    if (!invoice) return `£${Number(amount || 0).toFixed(2)}`;

    try {
      return new Intl.NumberFormat(invoice.locale || "en-GB", {
        style: "currency",
        currency: invoice.currencyCode || "GBP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(amount || 0));
    } catch {
      return `${invoice.currencySymbol || "£"}${Number(amount || 0).toFixed(2)}`;
    }
  };

  const createPdf = async (): Promise<string> => {
    if (!invoice) {
      throw new Error("Invoice is not available.");
    }

    const result = await Print.printToFileAsync({
      html,
      base64: false,
    });

    return result.uri;
  };

  const handlePrint = async () => {
    try {
      setProcessing(true);
      await Print.printAsync({ html });
    } catch (error) {
      console.error("❌ Print failed:", error);
      Alert.alert(
        "Unable to print",
        "The invoice could not be sent to the printer."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleShare = async () => {
    try {
      setProcessing(true);

      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert(
          "Sharing unavailable",
          "Sharing is not available on this device."
        );
        return;
      }

      const uri = await createPdf();

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: invoice
          ? `Share ${invoice.invoiceNumber}`
          : "Share invoice",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("❌ Share invoice failed:", error);
      Alert.alert(
        "Unable to share",
        "The PDF could not be created or shared."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setProcessing(true);

      const uri = await createPdf();

      if (Platform.OS === "web") {
        Alert.alert("PDF created", "The PDF has been generated.");
        return;
      }

      const available = await Sharing.isAvailableAsync();

      if (available) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: invoice
            ? `Save ${invoice.invoiceNumber}`
            : "Save invoice PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("PDF created", `Saved temporarily at:\n${uri}`);
      }
    } catch (error) {
      console.error("❌ PDF generation failed:", error);
      Alert.alert("Unable to create PDF", "Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = () => {
    if (!invoice) return;

    router.push({
      pathname: "/screens/invoices/edit",
      params: { id: invoice.id },
    });
  };

  const handleMarkSent = () => {
    if (!invoice) return;

    Alert.alert(
      "Mark invoice as sent?",
      invoice.stockReductionTrigger === "sent"
        ? "This will mark the invoice as sent and reduce linked stock."
        : "This will mark the invoice as sent.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark as sent",
          onPress: async () => {
            try {
              setProcessing(true);
              const updated = await markInvoiceAsSent(invoice.id);
              if (updated) setInvoice(updated);
            } catch (error) {
              Alert.alert(
                "Unable to update invoice",
                error instanceof Error
                  ? error.message
                  : "Please try again."
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const openPaymentHistory = () => {
    if (!invoice) return;

    router.push({
      pathname: "/screens/invoices/paymentHistory",
      params: { id: invoice.id },
    });
  };

  const resetPaymentForm = () => {
    setPaymentAmount("");
    setPaymentMethod("bank_transfer");
    setPaymentDate(new Date());
    setPaymentReference("");
    setPaymentNotes("");
    setShowPaymentDatePicker(false);
  };

  const openPaymentModal = () => {
    if (!invoice || invoice.balanceDue <= 0) return;

    setPaymentAmount(Number(invoice.balanceDue || 0).toFixed(2));
    setPaymentMethod("bank_transfer");
    setPaymentDate(new Date());
    setPaymentReference("");
    setPaymentNotes("");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    if (processing) return;
    setShowPaymentModal(false);
    resetPaymentForm();
  };

  const handleAddPayment = async () => {
    if (!invoice) return;

    const amount = Number(paymentAmount.replace(",", "."));

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(
        "Invalid amount",
        "Enter a payment amount greater than zero."
      );
      return;
    }

    if (amount > Number(invoice.balanceDue || 0) + 0.001) {
      Alert.alert(
        "Payment too high",
        `The payment cannot exceed the outstanding balance of ${money(
          invoice.balanceDue
        )}.`
      );
      return;
    }

    try {
      setProcessing(true);

      const updated = await addInvoicePayment({
        invoiceId: invoice.id,
        amount,
        method: paymentMethod,
        paymentDate: paymentDate.toISOString(),
        reference: paymentReference.trim() || undefined,
        notes: paymentNotes.trim() || undefined,
      });

      const paymentRecords = await getInvoicePayments(invoice.id);

      setInvoice({ ...updated, payments: paymentRecords });
      setPayments(paymentRecords);
      setShowPaymentModal(false);
      resetPaymentForm();

      Alert.alert(
        "Payment recorded",
        `${money(amount)} has been added. The remaining balance is ${money(
          updated.balanceDue
        )}.`
      );
    } catch (error) {
      console.error("❌ Failed to add payment:", error);
      Alert.alert(
        "Unable to record payment",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePayment = (payment: InvoicePayment) => {
    if (!invoice) return;

    Alert.alert(
      "Delete payment?",
      `Remove the ${money(payment.amount)} payment recorded on ${formatDate(
        payment.paymentDate
      )}? The invoice balance and status will be recalculated.`,
      [
        { text: "Keep payment", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessing(true);

              const updated = await deleteInvoicePayment(
                invoice.id,
                payment.id
              );
              const paymentRecords = await getInvoicePayments(invoice.id);

              setInvoice({ ...updated, payments: paymentRecords });
              setPayments(paymentRecords);
            } catch (error) {
              console.error("❌ Failed to delete payment:", error);
              Alert.alert(
                "Unable to delete payment",
                error instanceof Error
                  ? error.message
                  : "Please try again."
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#bfdbfe" />
            <Text style={styles.loadingText}>Preparing A4 invoice...</Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  if (!invoice) return null;

  const canAddPayment =
    invoice.status !== "cancelled" &&
    invoice.status !== "draft" &&
    Number(invoice.balanceDue || 0) > 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <View
            style={[
              styles.container,
              {
                paddingTop: Math.max(insets.top + 6, 14),
                paddingBottom: Math.max(insets.bottom + 8, 12),
              },
            ]}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerIconButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color="#e2e8f0"
                />
              </TouchableOpacity>

              <View style={styles.headerTextBlock}>
                <Text style={styles.title}>{invoice.invoiceNumber}</Text>
                <Text style={styles.subtitle}>
                  Professional A4 invoice preview
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleEdit}
                style={styles.headerIconButton}
              >
                <Ionicons
                  name="create-outline"
                  size={21}
                  color="#e2e8f0"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.previewCard}>
              <WebView
                originWhitelist={["*"]}
                source={{ html }}
                style={styles.webView}
                scalesPageToFit
                showsVerticalScrollIndicator
                showsHorizontalScrollIndicator
              />
            </View>

            <View style={styles.paymentSummary}>
              <View style={styles.paymentSummaryItem}>
                <Text style={styles.paymentSummaryLabel}>Paid</Text>
                <Text style={styles.paymentSummaryPaid}>
                  {money(invoice.amountPaid)}
                </Text>
              </View>

              <View style={styles.paymentSummaryDivider} />

              <View style={styles.paymentSummaryItem}>
                <Text style={styles.paymentSummaryLabel}>Balance</Text>
                <Text
                  style={[
                    styles.paymentSummaryBalance,
                    invoice.balanceDue <= 0 && styles.paymentSummarySettled,
                  ]}
                >
                  {money(invoice.balanceDue)}
                </Text>
              </View>

              <TouchableOpacity
                disabled={!canAddPayment || processing}
                onPress={openPaymentModal}
                style={[
                  styles.addPaymentButton,
                  !canAddPayment && styles.disabledButton,
                ]}
              >
                <Ionicons
                  name={
                    invoice.balanceDue <= 0
                      ? "checkmark-circle-outline"
                      : "add-circle-outline"
                  }
                  size={19}
                  color={canAddPayment ? "#0f172a" : "#94a3b8"}
                />
                <Text
                  style={[
                    styles.addPaymentButtonText,
                    !canAddPayment && styles.disabledButtonText,
                  ]}
                >
                  {invoice.balanceDue <= 0 ? "Paid" : "Add payment"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={openPaymentHistory}
              style={styles.paymentHistoryLink}
            >
              <View style={styles.paymentHistoryLinkIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color="#bfdbfe"
                />
              </View>

              <View style={styles.paymentHistoryLinkText}>
                <Text style={styles.paymentHistoryLinkTitle}>
                  Payment history
                </Text>
                <Text style={styles.paymentHistoryLinkSubtitle}>
                  {payments.length === 0
                    ? "No payments recorded yet"
                    : `${payments.length} ${
                        payments.length === 1 ? "payment" : "payments"
                      } recorded`}
                </Text>
              </View>

              <Text style={styles.paymentHistoryLinkAmount}>
                {money(invoice.amountPaid)}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={19}
                color="#94a3b8"
              />
            </TouchableOpacity>

            <View style={styles.actionDock}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.actionBar}
                style={styles.actionScroll}
              >
                <TouchableOpacity
                  disabled={processing}
                  onPress={handleDownloadPdf}
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="download-outline"
                    size={19}
                    color="#dbeafe"
                  />
                  <Text style={styles.actionButtonText}>Save PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={processing}
                  onPress={handlePrint}
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="print-outline"
                    size={19}
                    color="#dbeafe"
                  />
                  <Text style={styles.actionButtonText}>Print</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={processing}
                  onPress={handleShare}
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={19}
                    color="#dbeafe"
                  />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>

                {invoice.status === "draft" && (
                  <TouchableOpacity
                    disabled={processing}
                    onPress={handleMarkSent}
                    style={[styles.actionButton, styles.sentButton]}
                  >
                    <Ionicons
                      name="send-outline"
                      size={19}
                      color="#dbeafe"
                    />
                    <Text style={styles.actionButtonText}>Mark sent</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            {processing && !showPaymentModal && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="small" color="#0f172a" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </ScreenWrapper>

      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={closePaymentModal}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalDismissArea}
            onPress={closePaymentModal}
          />

          <View
            style={[
              styles.paymentModal,
              { paddingBottom: Math.max(insets.bottom + 18, 24) },
            ]}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add payment</Text>
                <Text style={styles.modalSubtitle}>
                  Outstanding balance: {money(invoice.balanceDue)}
                </Text>
              </View>

              <TouchableOpacity
                disabled={processing}
                onPress={closePaymentModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={22} color="#e2e8f0" />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.fieldLabel}>Amount</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencyPrefix}>
                  {invoice.currencySymbol || "£"}
                </Text>
                <TextInput
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  style={styles.amountInput}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#64748b"
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() =>
                    setPaymentAmount(
                      Number(invoice.balanceDue || 0).toFixed(2)
                    )
                  }
                  style={styles.fullBalanceButton}
                >
                  <Text style={styles.fullBalanceText}>Full balance</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Payment method</Text>
              <View style={styles.methodGrid}>
                {PAYMENT_METHODS.map((method) => {
                  const selected = paymentMethod === method.value;

                  return (
                    <TouchableOpacity
                      key={method.value}
                      activeOpacity={0.85}
                      onPress={() => setPaymentMethod(method.value)}
                      style={[
                        styles.methodButton,
                        selected && styles.methodButtonSelected,
                      ]}
                    >
                      <Ionicons
                        name={method.icon}
                        size={18}
                        color={selected ? "#0f172a" : "#cbd5e1"}
                      />
                      <Text
                        style={[
                          styles.methodButtonText,
                          selected && styles.methodButtonTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Payment date</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShowPaymentDatePicker(true)}
                style={styles.dateButton}
              >
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#bfdbfe"
                />
                <Text style={styles.dateButtonText}>
                  {formatDate(paymentDate.toISOString())}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#94a3b8"
                />
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Reference (optional)</Text>
              <TextInput
                value={paymentReference}
                onChangeText={setPaymentReference}
                style={styles.textInput}
                placeholder="Transaction or cheque reference"
                placeholderTextColor="#64748b"
                autoCapitalize="sentences"
              />

              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput
                value={paymentNotes}
                onChangeText={setPaymentNotes}
                style={[styles.textInput, styles.notesInput]}
                placeholder="Add a note about this payment"
                placeholderTextColor="#64748b"
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={processing}
                onPress={handleAddPayment}
                style={[
                  styles.savePaymentButton,
                  processing && styles.disabledButton,
                ]}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#0f172a" />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#0f172a"
                  />
                )}
                <Text style={styles.savePaymentButtonText}>
                  {processing ? "Recording..." : "Record payment"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {DateTimePickerModal && (
        <DateTimePickerModal
          isVisible={showPaymentDatePicker}
          mode="date"
          date={paymentDate}
          maximumDate={new Date()}
          onConfirm={(date: Date) => {
            setPaymentDate(date);
            setShowPaymentDatePicker(false);
          }}
          onCancel={() => setShowPaymentDatePicker(false)}
        />
      )}
    </>
  );
};

export default InvoiceViewScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.5)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  headerTextBlock: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 2,
  },
  previewCard: {
    flex: 1,
    minHeight: 180,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#d9e0e8",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  webView: {
    flex: 1,
    backgroundColor: "#d9e0e8",
  },
  paymentSummary: {
    minHeight: 66,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.52)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.14)",
  },
  paymentSummaryItem: {
    minWidth: 76,
  },
  paymentSummaryLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentSummaryPaid: {
    color: "#86efac",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  paymentSummaryBalance: {
    color: "#fcd34d",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  paymentSummarySettled: {
    color: "#86efac",
  },
  paymentSummaryDivider: {
    width: 1,
    height: 34,
    marginHorizontal: 12,
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  addPaymentButton: {
    marginLeft: "auto",
    minHeight: 42,
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#dbeafe",
  },
  addPaymentButtonText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.55,
  },
  disabledButtonText: {
    color: "#94a3b8",
  },
  paymentHistoryCard: {
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(15,23,42,0.42)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.12)",
  },
  paymentHistoryHeader: {
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentHistoryTitle: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "800",
  },
  paymentHistoryCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#bfdbfe",
    fontSize: 11,
    fontWeight: "800",
    backgroundColor: "rgba(59,130,246,0.16)",
  },
  paymentHistoryContent: {
    gap: 8,
    paddingHorizontal: 10,
    paddingRight: 18,
  },
  paymentCard: {
    width: 150,
    minHeight: 116,
    borderRadius: 13,
    padding: 10,
    backgroundColor: "rgba(15,23,42,0.72)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.12)",
  },
  paymentCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentMethodIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
  },
  paymentCardAmount: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 9,
  },
  paymentCardMethod: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  paymentCardDate: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 3,
  },
  paymentCardReference: {
    color: "#93c5fd",
    fontSize: 9,
    marginTop: 5,
  },
  paymentHistoryLink: {
    minHeight: 64,
    marginTop: 10,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.46)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.12)",
  },
  paymentHistoryLinkIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
  },
  paymentHistoryLinkText: {
    flex: 1,
    marginLeft: 10,
  },
  paymentHistoryLinkTitle: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "800",
  },
  paymentHistoryLinkSubtitle: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 3,
  },
  paymentHistoryLinkAmount: {
    color: "#86efac",
    fontSize: 13,
    fontWeight: "800",
    marginRight: 8,
  },
  actionDock: {
    height: 66,
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.42)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.14)",
    overflow: "hidden",
  },
  actionScroll: {
    flexGrow: 0,
  },
  actionBar: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  actionButton: {
    height: 48,
    minWidth: 108,
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(15,23,42,0.72)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.18)",
  },
  sentButton: {
    backgroundColor: "rgba(59,130,246,0.22)",
    borderColor: "rgba(147,197,253,0.28)",
  },
  actionButtonText: {
    color: "#dbeafe",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  processingOverlay: {
    position: "absolute",
    right: 18,
    top: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#dbeafe",
  },
  processingText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,6,23,0.74)",
  },
  modalDismissArea: {
    flex: 1,
  },
  paymentModal: {
    maxHeight: "88%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: "#172337",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.14)",
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 13,
    backgroundColor: "rgba(148,163,184,0.48)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 3,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  fieldLabel: {
    color: "#dbeafe",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
    marginTop: 2,
  },
  amountInputWrapper: {
    minHeight: 54,
    borderRadius: 14,
    paddingHorizontal: 13,
    marginBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.62)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  currencyPrefix: {
    color: "#bfdbfe",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    paddingVertical: 12,
  },
  fullBalanceButton: {
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: "rgba(59,130,246,0.18)",
  },
  fullBalanceText: {
    color: "#bfdbfe",
    fontSize: 10,
    fontWeight: "800",
  },
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 17,
  },
  methodButton: {
    width: "31.5%",
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "rgba(15,23,42,0.5)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  methodButtonSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  methodButtonText: {
    flexShrink: 1,
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "800",
  },
  methodButtonTextSelected: {
    color: "#0f172a",
  },
  dateButton: {
    minHeight: 50,
    borderRadius: 13,
    paddingHorizontal: 13,
    marginBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(15,23,42,0.62)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  dateButtonText: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
  },
  textInput: {
    minHeight: 50,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 17,
    color: "#f8fafc",
    fontSize: 13,
    backgroundColor: "rgba(15,23,42,0.62)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  notesInput: {
    minHeight: 86,
  },
  savePaymentButton: {
    minHeight: 52,
    borderRadius: 14,
    marginTop: 2,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#dbeafe",
  },
  savePaymentButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
});
