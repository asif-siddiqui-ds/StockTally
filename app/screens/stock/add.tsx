// import ScreenWrapper from "@/components/ScreenWrapper";
// import { useProUser } from "@/context/ProUserContext";
// import { getActiveSuppliers } from "@/lib/supplierStorage";
// import { saveSupplierStockIn } from "@/lib/supplierStockInStorage";
// import { Supplier } from "@/types/supplier";
// import { isGuest } from "@/utils/guest";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect } from "@react-navigation/native";
// import { CameraView, useCameraPermissions } from "expo-camera";
// import * as ImageManipulator from "expo-image-manipulator";
// import * as ImagePicker from "expo-image-picker";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React, {
//   useCallback,
//   useEffect,
//   useState,
// } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Keyboard,
//   Modal,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";
// import {
//   getStockItems,
//   saveStockItem,
//   saveStockMovement,
//   StockItem,
//   updateStockItem,
// } from "../../../lib/storage";


// type ExtractedInvoiceItem = {
//   name: string;
//   category?: string;
//   quantity: number;
//   unit?: string;
//   barcode?: string;
//   costPrice?: number;
//   lowStockAlert?: number;
//   idealStockLevel?: number;
//   supplierName?: string;
// };

// const unitOptions = [
//   { label: "Pieces", value: "pcs" },
//   { label: "Kg", value: "kg" },
//   { label: "Grams", value: "g" },
//   { label: "Litres", value: "ltr" },
//   { label: "ML", value: "ml" },
//   { label: "Boxes", value: "box" },
//   { label: "Packets", value: "packet" },
// ];

// const AI_FUNCTION_URL = "https://6a0118fd001370552715.fra.appwrite.run";

// const AddStockItem: React.FC = () => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";
//   const colors = {
//     screen: isDark ? "#080808" : "#f5f7fa",
//     card: isDark ? "#171717" : "#ffffff",
//     text: isDark ? "#f5f5f5" : "#111827",
//     secondaryText: isDark ? "#a3a3a3" : "#6b7280",
//     input: isDark ? "#222222" : "#ffffff",
//     border: isDark ? "#525252" : "#d1d5db",
//     dropdown: isDark ? "#262626" : "#ffffff",
//     activeDropdown: isDark ? "#363636" : "#eef2ff",
//   };

//   const themedInputStyle = [
//     styles.input,
//     {
//       color: colors.text,
//       backgroundColor: colors.input,
//       borderColor: colors.border,
//     },
//   ];

//   const [category, setCategory] = useState("");
//   const [name, setName] = useState("");
//   const [quantity, setQuantity] = useState(0);
//   const [barcode, setBarcode] = useState("");
//   const [unit, setUnit] = useState("pcs");
//   const [costPrice, setCostPrice] = useState("");
//   const [lowStockAlert, setLowStockAlert] = useState("");
//   const [idealStockLevel, setIdealStockLevel] = useState("");
//   const [supplierName, setSupplierName] = useState("");
  
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [selectedSupplierId, setSelectedSupplierId] = useState("");

//   const [stockItems, setStockItems] = useState<StockItem[]>([]);
//   const [selectedItemId, setSelectedItemId] = useState("");
//   const [selectedCategoryId, setSelectedCategoryId] = useState("");

//   const [scannerVisible, setScannerVisible] = useState(false);
//   const [scanned, setScanned] = useState(false);
//   const [permission, requestPermission] = useCameraPermissions();

//   const [barcodeActionVisible, setBarcodeActionVisible] = useState(false);
//   const [barcodeMatchedItem, setBarcodeMatchedItem] =
//     useState<StockItem | null>(null);

//   const [invoiceItems, setInvoiceItems] = useState<ExtractedInvoiceItem[]>([]);
//   const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
//   const [loadingAI, setLoadingAI] = useState(false);

//   const { isProUser, loading: proLoading } = useProUser();

//   const fetchStockItems = async () => {
//     const items = await getStockItems();
//     if (items) setStockItems(items);
//   };

//   const fetchSuppliers = useCallback(async () => {
//     try {
//       const supplierList = await getActiveSuppliers();

//       setSuppliers(supplierList);

//       /*
//       * Check whether a new supplier was created from
//       * this Add Stock screen.
//       */
//       const pendingSupplier = await AsyncStorage.getItem(
//         "stocktally_new_supplier_selection",
//       );

//       if (!pendingSupplier) {
//         return;
//       }

//       const parsedSupplier: {
//         id?: string;
//         companyName?: string;
//       } = JSON.parse(pendingSupplier);

//       const newlyCreatedSupplier = supplierList.find(
//         (supplier) => supplier.id === parsedSupplier.id,
//       );

//       if (newlyCreatedSupplier) {
//         setSelectedSupplierId(newlyCreatedSupplier.id);

//         setSupplierName(
//           newlyCreatedSupplier.companyName ?? undefined,
//         );
//       }

//       /*
//       * Remove the temporary value so it is only
//       * applied once.
//       */
//       await AsyncStorage.removeItem(
//         "stocktally_new_supplier_selection",
//       );
//     } catch (error) {
//       console.error("Failed to load suppliers:", error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStockItems();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       fetchSuppliers();
//     }, [fetchSuppliers]),
//   );

//   const getSupplierDisplayName = (supplier: {
//     companyName?: string;
//     contactName?: string;
//     email?: string;
//   }): string =>
//     supplier.companyName?.trim() ||
//     supplier.contactName?.trim() ||
//     supplier.email?.trim() ||
//     "Unnamed supplier";

//   const findSupplierByName = useCallback(
//     (value?: string): Supplier | undefined => {
//       const normalisedName = String(value || "")
//         .trim()
//         .toLowerCase();

//       if (!normalisedName) return undefined;

//       return suppliers.find(
//         (supplier) =>
//           getSupplierDisplayName(supplier).toLowerCase() === normalisedName,
//       );
//     },
//     [suppliers],
//   );

//   const applySupplierSelection = (
//     supplierId?: string,
//     existingSupplierName?: string,
//   ) => {
//     if (supplierId) {
//       const supplier = suppliers.find((entry) => entry.id === supplierId);

//       setSelectedSupplierId(supplierId);
//       setSupplierName(
//         getSupplierDisplayName(supplier) ?? existingSupplierName ?? "",
//       );
//       return;
//     }

//     const matchedSupplier = findSupplierByName(existingSupplierName);

//     if (matchedSupplier) {
//       setSelectedSupplierId(matchedSupplier.id);
//       setSupplierName(getSupplierDisplayName(matchedSupplier));
//       return;
//     }

//     setSelectedSupplierId("");
//     setSupplierName(getSupplierDisplayName({ companyName: existingSupplierName }));
//   };

//   const requireProForAI = () => {
//     if (proLoading) return false;

//     if (!isProUser) {
//       Alert.alert(
//         "Pro Feature",
//         "AI product and invoice scanning is available for Pro users only.",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Upgrade", onPress: () => router.push("/paywall") },
//         ],
//       );
//       return false;
//     }

//     return true;
//   };

//   const resetForm = () => {
//     setSelectedItemId("");
//     setSelectedCategoryId("");

//     setName("");
//     setCategory("");
//     setQuantity(0);
//     setBarcode("");
//     setUnit("pcs");

//     setCostPrice("");
//     setLowStockAlert("");
//     setIdealStockLevel("");

//     setSelectedSupplierId("");
//     setSupplierName("");

//     setBarcodeMatchedItem(null);
//   };

//   const openScanner = async () => {
//     if (!permission?.granted) {
//       const result = await requestPermission();

//       if (!result.granted) {
//         Alert.alert(
//           "Camera Permission Required",
//           "Please allow camera access to scan barcodes.",
//         );
//         return;
//       }
//     }

//     setScanned(false);
//     setScannerVisible(true);
//   };

//   const applyBarcode = (code: string) => {
//     setScanned(true);
//     setBarcode(code);

//     const matchedItem = stockItems.find(
//       (item) => String(item.barcode || "").trim() === code.trim(),
//     );

//     setScannerVisible(false);

//     setTimeout(() => {
//       if (matchedItem) {
//         setBarcodeMatchedItem(matchedItem);
//         setSelectedItemId(matchedItem.id);
//         setName(matchedItem.name);
//         setCategory(matchedItem.category);
//         setSelectedCategoryId(matchedItem.category);
//         setQuantity(1);
//         setUnit(matchedItem.unit || "pcs");

//         setCostPrice(
//           matchedItem.costPrice
//             ? String(matchedItem.costPrice)
//             : "",
//         );

//         setLowStockAlert(
//           matchedItem.lowStockAlert
//             ? String(matchedItem.lowStockAlert)
//             : "",
//         );

//         setIdealStockLevel(
//           matchedItem.idealStockLevel
//             ? String(matchedItem.idealStockLevel)
//             : "",
//         );

//         applySupplierSelection(
//           matchedItem.supplierId,
//           matchedItem.supplierName,
//         );
//       } else {
//         setBarcodeMatchedItem(null);
//         setSelectedItemId("new");
//         setName("");
//         setCategory("");
//         setSelectedCategoryId("");
//         setQuantity(1);
//         setUnit("pcs");
//         setCostPrice("");
//         setLowStockAlert("");
//         setIdealStockLevel("");

//         setSelectedSupplierId("");
//         setSupplierName("");
//       }

//       setBarcodeActionVisible(true);
//       setScanned(false);
//     }, 500);
//   };

//   const scanWithAI = async (mode: "product" | "invoice") => {
//     if (!requireProForAI()) return;
//     try {
//       Alert.alert("Select Image", "Choose image source", [
//         {
//           text: "📷 Camera",
//           onPress: async () => {
//             await handleAIImage(mode, "camera");
//           },
//         },
//         {
//           text: "🖼 Gallery",
//           onPress: async () => {
//             await handleAIImage(mode, "gallery");
//           },
//         },
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//       ]);
//     } catch (err: any) {
//       console.error(err);

//       Alert.alert("AI Scan Failed", err.message || "Something went wrong");
//     }
//   };

//   const handleAIImage = async (
//     mode: "product" | "invoice",
//     source: "camera" | "gallery",
//   ) => {
//     try {
//       let result: ImagePicker.ImagePickerResult;

//       if (source === "camera") {
//         const cameraPermission =
//           await ImagePicker.requestCameraPermissionsAsync();

//         if (!cameraPermission.granted) {
//           Alert.alert("Permission Required", "Please allow camera access.");
//           return;
//         }

//         result = await ImagePicker.launchCameraAsync({
//           mediaTypes: ImagePicker.MediaTypeOptions.Images,
//           quality: 0.5,
//         });
//       } else {
//         const galleryPermission =
//           await ImagePicker.requestMediaLibraryPermissionsAsync();

//         if (!galleryPermission.granted) {
//           Alert.alert("Permission Required", "Please allow gallery access.");
//           return;
//         }

//         result = await ImagePicker.launchImageLibraryAsync({
//           mediaTypes: ImagePicker.MediaTypeOptions.Images,
//           quality: 0.5,
//         });
//       }

//       if (result.canceled || !result.assets?.[0]?.uri) return;

//       const asset = result.assets[0];

//       const resizeWidth = mode === "invoice" ? 1400 : 1000;

//       const manipulatedImage = await ImageManipulator.manipulateAsync(
//         asset.uri,
//         [
//           {
//             resize: {
//               width: resizeWidth,
//             },
//           },
//         ],
//         {
//           compress: mode === "invoice" ? 0.6 : 0.5,
//           format: ImageManipulator.SaveFormat.JPEG,
//           base64: true,
//         },
//       );

//       if (!manipulatedImage.base64) {
//         Alert.alert("Image Error", "Could not prepare image for AI scan.");
//         return;
//       }

//       setLoadingAI(true);

//       const response = await fetch(AI_FUNCTION_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-Appwrite-Project": "68215c9f00161f204345",
//         },
//         body: JSON.stringify({
//           mode,
//           imageBase64: manipulatedImage.base64,
//           mimeType: "image/jpeg",
//         }),
//       });

//       const raw = await response.text();
//       console.log("AI RAW RESPONSE:", raw);

//       let data;
//       try {
//         data = JSON.parse(raw);
//       } catch {
//         throw new Error(raw || "AI function returned empty response");
//       }

//       if (!data.success) {
//         Alert.alert("AI Error", data.message || "Failed to scan image.");
//         return;
//       }

//       if (!data.items || data.items.length === 0) {
//         Alert.alert("No Items Found", "AI could not identify products.");
//         return;
//       }

//       if (mode === "product") {
//         const item = data.items[0];

//         setSelectedItemId("new");
//         setSelectedCategoryId(item.category || "new");
//         setName(item.name || "");
//         setCategory(item.category || "");
//         setQuantity(item.quantity || 1);
//         setBarcode(item.barcode || "");
//         setUnit(item.unit || "pcs");
//         setCostPrice(item.costPrice ? String(item.costPrice) : "");
//         setLowStockAlert(item.lowStockAlert ? String(item.lowStockAlert) : "");
//         setIdealStockLevel(
//           item.idealStockLevel ? String(item.idealStockLevel) : "",
//         );
//         const recognisedSupplier = findSupplierByName(
//           item.supplierName,
//         );

//         if (recognisedSupplier) {
//           setSelectedSupplierId(recognisedSupplier.id);

//           setSupplierName(
//             getSupplierDisplayName(recognisedSupplier)
//           );
//         } else {
//           setSelectedSupplierId("");
//           setSupplierName("");
//         }

//         Alert.alert(
//           "Product Recognised",
//           `${item.name || "Product"} added automatically`,
//         );

//         return;
//       }

//       setInvoiceItems(data.items);
//       setInvoiceModalVisible(true);
//     } catch (err: any) {
//       console.error(err);
//       Alert.alert("AI Scan Failed", err.message || "Something went wrong");
//     } finally {
//       setLoadingAI(false);
//     }
//   };

//   // const handleSave = async () => {
//   //   if (await isGuest()) {
//   //     const stock = await getStockItems();

//   //     if (stock.length >= 10) {
//   //       Alert.alert(
//   //         "Limit Reached",
//   //         "Free plan allows up to 10 stock items. Upgrade to Pro for unlimited.",
//   //         [
//   //           { text: "Cancel", style: "cancel" },
//   //           { text: "Upgrade", onPress: () => router.push("/paywall") },
//   //         ]
//   //       );
//   //       return;
//   //     }
//   //   }

//   //   if (quantity <= 0) {
//   //     Alert.alert("Validation Error", "Quantity must be a positive number.");
//   //     return;
//   //   }

//   //   if (!name.trim()) {
//   //     Alert.alert("Validation Error", "Name cannot be empty.");
//   //     return;
//   //   }

//   //   if (!category.trim()) {
//   //     Alert.alert("Validation Error", "Category cannot be empty.");
//   //     return;
//   //   }

//   //   try {
//   //     if (selectedItemId && selectedItemId !== "new") {
//   //       const existingItem = stockItems.find(
//   //         (item) => item.id === selectedItemId
//   //       );

//   //       if (!existingItem) {
//   //         Alert.alert("Error", "Selected stock item not found.");
//   //         return;
//   //       }

//   //       const newBalance = Number(existingItem.quantity) + Number(quantity);

//   //       await updateStockItem(selectedItemId, {
//   //         quantity: newBalance,
//   //         category: existingItem.category,
//   //         barcode: barcode || existingItem.barcode || "",
//   //         unit,
//   //         costPrice: costPrice ? Number(costPrice) : existingItem.costPrice,
//   //         lowStockAlert: lowStockAlert
//   //           ? Number(lowStockAlert)
//   //           : existingItem.lowStockAlert || 0,
//   //         idealStockLevel: idealStockLevel
//   //           ? Number(idealStockLevel)
//   //           : existingItem.idealStockLevel || 0,
//   //         supplierName: supplierName || existingItem.supplierName || "",
//   //       });

//   //       await saveStockMovement({
//   //         stockItemId: existingItem.id,
//   //         itemName: existingItem.name,
//   //         type: "IN",
//   //         quantity: Number(quantity),
//   //         source: "NEW_STOCK",
//   //         sourceLabel: "Stock added to existing item",
//   //         balanceAfter: newBalance,
//   //         referenceId: existingItem.id,
//   //         referenceType: "STOCK",
//   //         note: "Quantity added from Stock Add screen",
//   //       });

//   //       Alert.alert("Success", "Stock item updated successfully.");
//   //     } else {
//   //       const newStockItem = await saveStockItem({
//   //         category,
//   //         name,
//   //         quantity,
//   //         barcode,
//   //         unit,
//   //         costPrice: costPrice ? Number(costPrice) : undefined,
//   //         lowStockAlert: lowStockAlert ? Number(lowStockAlert) : 0,
//   //         idealStockLevel: idealStockLevel ? Number(idealStockLevel) : 0,
//   //         supplierName,
//   //         date: new Date().toISOString(),
//   //       });

//   //       await saveStockMovement({
//   //         stockItemId: newStockItem.id,
//   //         itemName: newStockItem.name,
//   //         type: "IN",
//   //         quantity: Number(newStockItem.quantity),
//   //         source: "NEW_STOCK",
//   //         sourceLabel: "New stock item created",
//   //         balanceAfter: Number(newStockItem.quantity),
//   //         referenceId: newStockItem.id,
//   //         referenceType: "STOCK",
//   //         note: "New stock created from Stock Add screen",
//   //       });

//   //       Alert.alert("Success", "Stock item added successfully.");
//   //     }

//   //     await fetchStockItems();
//   //     resetForm();
//   //     router.replace("/(tabs)/stockList");
//   //   } catch (error: any) {
//   //     console.error("Failed to save Stock Item:", error.message);
//   //     Alert.alert(
//   //       "Failed to save Stock Item",
//   //       error.message || "Unknown error."
//   //     );
//   //   }
//   // };

//   const handleSave = async () => {
//     if (await isGuest()) {
//       const stock = await getStockItems();

//       if (stock.length >= 10) {
//         Alert.alert(
//           "Limit Reached",
//           "Free plan allows up to 10 stock items. Upgrade to Pro for unlimited.",
//           [
//             { text: "Cancel", style: "cancel" },
//             { text: "Upgrade", onPress: () => router.push("/paywall") },
//           ],
//         );
//         return;
//       }
//     }

//     if (quantity <= 0) {
//       Alert.alert("Validation Error", "Quantity must be a positive number.");
//       return;
//     }

//     if (!name.trim()) {
//       Alert.alert("Validation Error", "Name cannot be empty.");
//       return;
//     }

//     if (!category.trim()) {
//       Alert.alert("Validation Error", "Category cannot be empty.");
//       return;
//     }

//     Alert.alert(
//       "Supplier Payment Status",
//       "Has payment been made to the supplier?",
//       [
//         {
//           text: "Unpaid",
//           style: "destructive",
//           onPress: () => saveStock(false),
//         },
//         {
//           text: "Paid",
//           onPress: () => saveStock(true),
//         },
//       ],
//       { cancelable: false },
//     );
//   };

//   const saveStock = async (paidStatus: boolean) => {
//     try {
//       if (selectedItemId && selectedItemId !== "new") {
//         const existingItem = stockItems.find(
//           (item) => item.id === selectedItemId,
//         );

//         if (!existingItem) {
//           Alert.alert("Error", "Selected stock item not found.");
//           return;
//         }

//         const newBalance = Number(existingItem.quantity) + Number(quantity);

//         await updateStockItem(selectedItemId, {
//           quantity: newBalance,
//           category: existingItem.category,
//           barcode: barcode || existingItem.barcode || "",
//           unit,
//           costPrice: costPrice ? Number(costPrice) : existingItem.costPrice,
//           lowStockAlert: lowStockAlert
//             ? Number(lowStockAlert)
//             : existingItem.lowStockAlert || 0,
//           idealStockLevel: idealStockLevel
//             ? Number(idealStockLevel)
//             : existingItem.idealStockLevel || 0,
//           supplierId: selectedSupplierId || existingItem.supplierId || undefined,
//           supplierName: supplierName || existingItem.supplierName || "",

//         });

//         const deliverySupplierId =
//           selectedSupplierId ||
//           existingItem.supplierId ||
//           undefined;

//         const deliverySupplierName =
//           supplierName ||
//           existingItem.supplierName ||
//           "";

//         const deliveryUnitCost = costPrice
//           ? Number(costPrice)
//           : Number(existingItem.costPrice || 0);

//         if (deliverySupplierId || deliverySupplierName.trim()) {
//           await saveSupplierStockIn({
//             stockItemId: existingItem.id,
//             itemName: existingItem.name,
//             supplierId: deliverySupplierId,
//             supplierName: deliverySupplierName,
//             quantity: Number(quantity),
//             unit: unit || existingItem.unit || "pcs",
//             unitCost: deliveryUnitCost,
//             totalCost:
//               Number(quantity) * deliveryUnitCost,
//             paymentStatus: paidStatus ? "paid" : "unpaid",
//             date: new Date().toISOString(),
//             note: "Stock added to existing item",
//           });
//         }

//         await saveStockMovement({
//           stockItemId: existingItem.id,
//           itemName: existingItem.name,
//           type: "IN",
//           quantity: Number(quantity),
//           source: "NEW_STOCK",
//           sourceLabel: "Stock added to existing item",
//           balanceAfter: newBalance,
//           referenceId: existingItem.id,
//           referenceType: "STOCK",
//           note: paidStatus
//             ? `Paid stock added from supplier${supplierName ? `: ${supplierName}` : ""}`
//             : `Unpaid stock added from supplier${supplierName ? `: ${supplierName}` : ""}`,
//         });

//         Alert.alert(
//           "Success",
//           paidStatus
//             ? "Stock item updated as paid."
//             : "Stock item updated as unpaid.",
//         );
//       } else {
//         const newStockItem = await saveStockItem({
//           category,
//           name,
//           quantity,
//           barcode,
//           unit,
//           costPrice: costPrice ? Number(costPrice) : undefined,
//           lowStockAlert: lowStockAlert ? Number(lowStockAlert) : 0,
//           idealStockLevel: idealStockLevel ? Number(idealStockLevel) : 0,
//           supplierName,
//           supplierId: selectedSupplierId || undefined,

//           date: new Date().toISOString(),
//         });

//         if (selectedSupplierId || supplierName.trim()) {
//           const deliveryUnitCost = Number(
//             newStockItem.costPrice || 0,
//           );

//           await saveSupplierStockIn({
//             stockItemId: newStockItem.id,
//             itemName: newStockItem.name,
//             supplierId: selectedSupplierId || undefined,
//             supplierName,
//             quantity: Number(newStockItem.quantity),
//             unit: newStockItem.unit || "pcs",
//             unitCost: deliveryUnitCost,
//             totalCost:
//               Number(newStockItem.quantity) *
//               deliveryUnitCost,
//             paymentStatus: paidStatus ? "paid" : "unpaid",
//             date: new Date().toISOString(),
//             note: "New stock item created",
//           });
//         }

//         await saveStockMovement({
//           stockItemId: newStockItem.id,
//           itemName: newStockItem.name,
//           type: "IN",
//           quantity: Number(newStockItem.quantity),
//           source: "NEW_STOCK",
//           sourceLabel: "New stock item created",
//           balanceAfter: Number(newStockItem.quantity),
//           referenceId: newStockItem.id,
//           referenceType: "STOCK",
//           note: paidStatus
//             ? `Paid new stock created${supplierName ? ` from ${supplierName}` : ""}`
//             : `Unpaid new stock created${supplierName ? ` from ${supplierName}` : ""}`,
//         });

//         Alert.alert(
//           "Success",
//           paidStatus
//             ? "Stock item added as paid."
//             : "Stock item added as unpaid.",
//         );
//       }

//       await fetchStockItems();
//       resetForm();
//       router.replace("/(tabs)/stockList");
//     } catch (error: any) {
//       console.error("Failed to save Stock Item:", error.message);
//       Alert.alert(
//         "Failed to save Stock Item",
//         error.message || "Unknown error.",
//       );
//     }
//   };

//   const addInvoiceItemsToStock = async () => {
//     try {
//       for (const item of invoiceItems) {
//         if (!item.name || item.quantity <= 0) continue;

//         const existing = stockItems.find(
//           (s) => s.name.trim().toLowerCase() === item.name.trim().toLowerCase(),
//         );

//         const matchedSupplier = findSupplierByName(item.supplierName);

//         if (existing) {
//           await updateStockItem(existing.id, {
//             quantity: existing.quantity + item.quantity,
//             category: existing.category,
//             unit: item.unit || existing.unit || "pcs",
//             barcode: item.barcode || existing.barcode || "",
//             costPrice: item.costPrice || existing.costPrice,
//             lowStockAlert: existing.lowStockAlert || 0,
//             idealStockLevel: existing.idealStockLevel || 0,
//             supplierId:
//               existing.supplierId || matchedSupplier?.id || undefined,
//             supplierName:
//               existing.supplierName || matchedSupplier?.companyName || "",
//           });
//         } else {
//           await saveStockItem({
//             name: item.name,
//             category: item.category || "Uncategorised",
//             quantity: item.quantity,
//             unit: item.unit || "pcs",
//             barcode: item.barcode || "",
//             costPrice: item.costPrice,
//             lowStockAlert: item.lowStockAlert || 0,
//             idealStockLevel: item.idealStockLevel || 0,
//             supplierName: matchedSupplier?.companyName || "",
//             supplierId: matchedSupplier?.id || undefined,
//             date: new Date().toISOString(),
//           });
//         }
//       }

//       Alert.alert("Success", "Invoice items added to stock.");
//       setInvoiceModalVisible(false);
//       setInvoiceItems([]);
//       await fetchStockItems();
//       router.replace("/(tabs)/stockList");
//     } catch (err: any) {
//       Alert.alert(
//         "Save Failed",
//         err.message || "Could not save invoice items.",
//       );
//     }
//   };

//   return (
//     <ScreenWrapper scroll backgroundColor={colors.screen}>
//       <View style={styles.container}>
//         <View style={[styles.form, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Fast Add Stock
//           </Text>
//           <View style={styles.scanTopRow}>
//             <TouchableOpacity
//               style={styles.scanHalfButton}
//               onPress={openScanner}
//             >
//               <Text style={styles.scanButtonText}>📷 Scan Barcode</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.scanHalfButton}
//               onPress={() => scanWithAI("product")}
//               disabled={loadingAI}
//             >
//               <Text style={styles.scanButtonText}>📦 Scan Product with AI</Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={styles.invoiceButton}
//             onPress={() => scanWithAI("invoice")}
//             disabled={loadingAI}
//           >
//             <Text style={styles.scanButtonText}>🧾 Scan Invoice with AI</Text>
//           </TouchableOpacity>

//           {/* keep the rest of your existing form code from loadingAI onwards */}

//           {loadingAI && (
//             <View style={styles.loadingRow}>
//               <ActivityIndicator />
//               <Text style={[styles.loadingText, { color: colors.text }]}>
//                 AI is scanning image...
//               </Text>
//             </View>
//           )}

//           <Text style={[styles.label, { color: colors.text }]}>
//             Barcode / Code
//           </Text>
//           <TextInput
//             placeholder="Scan or enter barcode/code"
//             placeholderTextColor={colors.secondaryText}
//             value={barcode}
//             onChangeText={setBarcode}
//             style={themedInputStyle}
//           />

//           <Text style={[styles.label, { color: colors.text }]}>Item</Text>
//           <Dropdown
//             style={[
//               styles.dropdown,
//               {
//                 borderColor: colors.border,
//                 backgroundColor: colors.input,
//               },
//             ]}
//             containerStyle={{
//               backgroundColor: colors.dropdown,
//               borderColor: colors.border,
//             }}
//             selectedTextStyle={{ color: colors.text, fontSize: 15 }}
//             placeholderStyle={{ color: colors.secondaryText, fontSize: 15 }}
//             itemTextStyle={{ color: colors.text, fontSize: 15 }}
//             activeColor={colors.activeDropdown}
//             iconColor={colors.secondaryText}
//             data={[
//               { label: "➕ Add New Stock Item", value: "new" },
//               ...stockItems.map((item) => ({
//                 label: item.name,
//                 value: item.id,
//               })),
//             ]}
//             labelField="label"
//             valueField="value"
//             placeholder="Select Stock Item"
//             value={selectedItemId}
//             onChange={(item) => {
//               setSelectedItemId(item.value);

//               if (item.value !== "new" && item.value !== "") {
//                 const selectedItem = stockItems.find(
//                   (s) => s.id === item.value,
//                 );

//                 if (selectedItem) {
//                   setName(selectedItem.name);
//                   setCategory(selectedItem.category);
//                   setSelectedCategoryId(selectedItem.category);
//                   setBarcode(selectedItem.barcode || "");
//                   setUnit(selectedItem.unit || "pcs");
//                   setQuantity(0);
//                   setCostPrice(
//                     selectedItem.costPrice
//                       ? String(selectedItem.costPrice)
//                       : "",
//                   );
//                   setLowStockAlert(
//                     selectedItem.lowStockAlert
//                       ? String(selectedItem.lowStockAlert)
//                       : "",
//                   );
//                   setIdealStockLevel(
//                     selectedItem.idealStockLevel
//                       ? String(selectedItem.idealStockLevel)
//                       : "",
//                   );
//                   applySupplierSelection(
//                     selectedItem.supplierId,
//                     selectedItem.supplierName,
//                   );
//                 }
//               } else {
//                 setName("");
//                 setCategory("");
//                 setSelectedCategoryId("");
//                 setBarcode("");
//                 setUnit("pcs");
//                 setQuantity(0);
//                 setCostPrice("");
//                 setLowStockAlert("");
//                 setIdealStockLevel("");
//                 setSupplierName("");
//                 setSelectedSupplierId("");
//               }
//             }}
//           />

//           {selectedItemId === "new" && (
//             <TextInput
//               placeholder="Enter item name"
//               placeholderTextColor={colors.secondaryText}
//               value={name}
//               onChangeText={setName}
//               style={themedInputStyle}
//             />
//           )}

//           <Text style={[styles.label, { color: colors.text }]}>Category</Text>
//           <Dropdown
//             style={[
//               styles.dropdown,
//               {
//                 borderColor: colors.border,
//                 backgroundColor: colors.input,
//               },
//             ]}
//             containerStyle={{
//               backgroundColor: colors.dropdown,
//               borderColor: colors.border,
//             }}
//             selectedTextStyle={{ color: colors.text, fontSize: 15 }}
//             placeholderStyle={{ color: colors.secondaryText, fontSize: 15 }}
//             itemTextStyle={{ color: colors.text, fontSize: 15 }}
//             activeColor={colors.activeDropdown}
//             iconColor={colors.secondaryText}
//             data={[
//               { label: "➕ Add New Category", value: "new" },
//               ...Array.from(
//                 new Set(stockItems.map((item) => item.category)),
//               ).map((cat) => ({
//                 label: cat,
//                 value: cat,
//               })),
//             ]}
//             labelField="label"
//             valueField="value"
//             placeholder="Select Category"
//             value={selectedCategoryId}
//             onChange={(item) => {
//               setSelectedCategoryId(item.value);

//               if (item.value !== "new") {
//                 setCategory(item.value);
//               } else {
//                 setCategory("");
//               }
//             }}
//           />

//           {selectedCategoryId === "new" && (
//             <TextInput
//               placeholder="Enter new category"
//               placeholderTextColor={colors.secondaryText}
//               value={category}
//               onChangeText={setCategory}
//               style={themedInputStyle}
//             />
//           )}
          
//           <Text style={[styles.label, { color: colors.text }]}>
//                 Supplier
//           </Text>
//           <Dropdown
//             style={[
//               styles.dropdown,
//               {
//                 borderColor: colors.border,
//                 backgroundColor: colors.input,
//               },
//             ]}
//             containerStyle={{
//               backgroundColor: colors.dropdown,
//               borderColor: colors.border,
//             }}
//             selectedTextStyle={{
//               color: colors.text,
//               fontSize: 15,
//             }}
//             placeholderStyle={{
//               color: colors.secondaryText,
//               fontSize: 15,
//             }}
//             itemTextStyle={{
//               color: colors.text,
//               fontSize: 15,
//             }}
//             activeColor={colors.activeDropdown}
//             iconColor={colors.secondaryText}
//             data={[
//               {
//                 label: "No Supplier",
//                 value: "__none__",
//               },
//               ...suppliers.map((supplier) => ({
//                 label: supplier.companyName,
//                 value: supplier.id,
//               })),
//               {
//                 label: "➕ Add New Supplier",
//                 value: "__new_supplier__",
//               },
//             ]}
//             labelField="label"
//             valueField="value"
//             placeholder="Select Supplier"
//             value={selectedSupplierId}
//             onChange={(item) => {
//               if (item.value === "__new_supplier__") {
//                 router.push({
//                   pathname: "/screens/suppliers/create",
//                   params: {
//                     returnTo: "addStock",
//                   },
//                 });

//                 return;
//               }

//               if (item.value === "__none__") {
//                 setSelectedSupplierId("");
//                 setSupplierName("");
//                 return;
//               }

//               const selectedSupplier = suppliers.find(
//                 (supplier) =>
//                   supplier.id === item.value,
//               );

//               if (!selectedSupplier) {
//                 setSelectedSupplierId("");
//                 setSupplierName("");
//                 return;
//               }

//               setSelectedSupplierId(
//                 selectedSupplier.id,
//               );

//               setSupplierName(
//                 selectedSupplier.companyName,
//               );
//             }}
//           />
//           <View style={styles.row}>
//             <View style={styles.halfWidth}>
//               <Text style={[styles.label, { color: colors.text }]}>
//                 Quantity
//               </Text>
//               <TextInput
//                 placeholder="Quantity"
//                 placeholderTextColor={colors.secondaryText}
//                 keyboardType="number-pad"
//                 returnKeyType="done"
//                 value={String(quantity)}
//                 onChangeText={(text) => setQuantity(Number(text) || 0)}
//                 style={themedInputStyle}
//               />
//             </View>

//             <View style={styles.halfWidth}>
//               <Text style={[styles.label, { color: colors.text }]}>Unit</Text>
//               <Dropdown
//                 style={[
//                   styles.dropdown,
//                   {
//                     borderColor: colors.border,
//                     backgroundColor: colors.input,
//                   },
//                 ]}
//                 containerStyle={{
//                   backgroundColor: colors.dropdown,
//                   borderColor: colors.border,
//                 }}
//                 selectedTextStyle={{ color: colors.text, fontSize: 15 }}
//                 placeholderStyle={{ color: colors.secondaryText, fontSize: 15 }}
//                 itemTextStyle={{ color: colors.text, fontSize: 15 }}
//                 activeColor={colors.activeDropdown}
//                 iconColor={colors.secondaryText}
//                 data={unitOptions}
//                 labelField="label"
//                 valueField="value"
//                 placeholder="Unit"
//                 value={unit}
//                 onChange={(item) => setUnit(item.value)}
//               />
//             </View>
//           </View>

//           <View style={styles.row}>
//             <View style={styles.halfWidth}>
//               <Text style={[styles.label, { color: colors.text }]}>
//                 Low Stock Alert
//               </Text>
//               <TextInput
//                 placeholder="Alert Level"
//                 placeholderTextColor={colors.secondaryText}
//                 keyboardType="number-pad"
//                 returnKeyType="done"
//                 value={String(lowStockAlert)}
//                 onChangeText={setLowStockAlert}
//                 style={themedInputStyle}
//               />
//             </View>

//             <View style={styles.halfWidth}>
//               <Text style={[styles.label, { color: colors.text }]}>
//                 Ideal Stock Level
//               </Text>
//               <TextInput
//                 placeholder="Ideal Level"
//                 placeholderTextColor={colors.secondaryText}
//                 keyboardType="number-pad"
//                 returnKeyType="done"
//                 value={String(idealStockLevel)}
//                 onChangeText={setIdealStockLevel}
//                 style={themedInputStyle}
//               />
//             </View>
//           </View>
//           <Text style={[styles.label, { color: colors.text }]}>
//             Cost Price
//           </Text>
//           <TextInput
//             placeholder="Cost Price (optional)"
//             placeholderTextColor={colors.secondaryText}
//             keyboardType="decimal-pad"
//             returnKeyType="done"
//             value={costPrice}
//             onChangeText={setCostPrice}
//             style={themedInputStyle}
//           />

//           <TouchableOpacity style={styles.button} onPress={handleSave}>
//             <LinearGradient
//               colors={
//                 selectedItemId && selectedItemId !== "new"
//                   ? ["#4CAF50", "#45A049"]
//                   : ["#0275d8", "#025aa5"]
//               }
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.gradientButton}
//             >
//               <Text style={styles.buttonText}>
//                 {selectedItemId && selectedItemId !== "new"
//                   ? "Update Stock"
//                   : "Add Stock"}
//               </Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//         <Modal visible={scannerVisible} animationType="slide">
//           <View style={styles.scannerContainer}>
//             <CameraView
//               style={StyleSheet.absoluteFillObject}
//               facing="back"
//               barcodeScannerSettings={{
//                 barcodeTypes: [
//                   "ean13",
//                   "ean8",
//                   "upc_a",
//                   "upc_e",
//                   "code128",
//                   "code39",
//                   "qr",
//                 ],
//               }}
//               onBarcodeScanned={
//                 scanned ? undefined : ({ data }) => applyBarcode(data)
//               }
//             />

//             <View style={styles.scannerOverlay}>
//               <Text style={styles.scannerTitle}>Scan product barcode</Text>
//               <View style={styles.scanBox} />

//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => {
//                   setScannerVisible(false);
//                   setScanned(false);
//                 }}
//               >
//                 <Text style={styles.closeButtonText}>Close Scanner</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>

//         <Modal visible={barcodeActionVisible} animationType="slide" transparent>
//           <View style={styles.actionOverlay}>
//             <View style={styles.actionCard}>
//               <Text style={styles.actionTitle}>
//                 {barcodeMatchedItem
//                   ? "Existing Item Found"
//                   : "New Barcode Scanned"}
//               </Text>

//               <Text style={styles.actionSubText}>Barcode: {barcode}</Text>

//               {barcodeMatchedItem ? (
//                 <Text style={styles.matchedName}>
//                   {barcodeMatchedItem.name}
//                 </Text>
//               ) : (
//                 <>
//                   <Text style={styles.actionLabel}>Item Name</Text>
//                   <TextInput
//                     placeholder="Enter item name"
//                     placeholderTextColor="#999"
//                     value={name}
//                     onChangeText={setName}
//                     style={styles.actionInput}
//                   />

//                   <Text style={styles.actionLabel}>Category</Text>
//                   <TextInput
//                     placeholder="Enter category"
//                     placeholderTextColor="#999"
//                     value={category}
//                     onChangeText={setCategory}
//                     style={styles.actionInput}
//                   />
//                 </>
//               )}

//               <Text style={styles.actionLabel}>Quantity</Text>
//               <TextInput
//                 placeholder="Enter quantity"
//                 placeholderTextColor="#999"
//                 keyboardType="number-pad"
//                 returnKeyType="done"
//                 onSubmitEditing={Keyboard.dismiss}
//                 value={String(quantity)}
//                 onChangeText={(text) => setQuantity(Number(text) || 0)}
//                 style={styles.actionInput}
//               />

//               <Text style={styles.actionLabel}>Cost Price</Text>
//               <TextInput
//                 placeholder="Cost Price (optional)"
//                 placeholderTextColor="#999"
//                 keyboardType="number-pad"
//                 returnKeyType="done"
//                 onSubmitEditing={Keyboard.dismiss}
//                 value={costPrice}
//                 onChangeText={setCostPrice}
//                 style={styles.actionInput}
//               />

//               <Text style={styles.actionLabel}>Unit</Text>
//               <Dropdown
//                 style={[styles.actionDropdown, { borderColor: "#ccc" }]}
//                 data={unitOptions}
//                 labelField="label"
//                 valueField="value"
//                 placeholder="Select Unit"
//                 value={unit}
//                 onChange={(item) => setUnit(item.value)}
//               />

//               <View style={styles.actionRow}>
//                 <TouchableOpacity
//                   style={styles.cancelBtn}
//                   onPress={() => setBarcodeActionVisible(false)}
//                 >
//                   <Text style={styles.cancelText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.confirmBtn}
//                   onPress={async () => {
//                     setBarcodeActionVisible(false);
//                     await handleSave();
//                   }}
//                 >
//                   <Text style={styles.confirmText}>
//                     {barcodeMatchedItem ? "Update Stock" : "Add Item"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         <Modal visible={invoiceModalVisible} animationType="slide">
//           <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//             <ScrollView contentContainerStyle={{ padding: 20 }}>
//               <Text style={styles.actionTitle}>Review Invoice Items</Text>

//               {invoiceItems.map((item, index) => (
//                 <View
//                   key={`${item.name}-${index}`}
//                   style={styles.invoiceItemCard}
//                 >
//                   <TextInput
//                     value={item.name}
//                     onChangeText={(text) => {
//                       const updated = [...invoiceItems];
//                       updated[index].name = text;
//                       setInvoiceItems(updated);
//                     }}
//                     style={styles.actionInput}
//                     placeholder="Item name"
//                   />

//                   <TextInput
//                     value={item.category || ""}
//                     onChangeText={(text) => {
//                       const updated = [...invoiceItems];
//                       updated[index].category = text;
//                       setInvoiceItems(updated);
//                     }}
//                     style={styles.actionInput}
//                     placeholder="Category"
//                   />

//                   <TextInput
//                     value={item.costPrice ? String(item.costPrice) : ""}
//                     onChangeText={(text) => {
//                       const updated = [...invoiceItems];
//                       updated[index].costPrice = Number(text) || undefined;
//                       setInvoiceItems(updated);
//                     }}
//                     style={styles.actionInput}
//                     placeholder="Cost Price"
//                     keyboardType="number-pad"
//                     returnKeyType="done"
//                     onSubmitEditing={Keyboard.dismiss}
//                   />

//                   <TouchableOpacity
//                     style={styles.cancelBtn}
//                     onPress={() => {
//                       setInvoiceItems(
//                         invoiceItems.filter((_, i) => i !== index),
//                       );
//                     }}
//                   >
//                     <Text style={styles.cancelText}>Remove</Text>
//                   </TouchableOpacity>
//                 </View>
//               ))}

//               <TouchableOpacity
//                 style={styles.confirmBtn}
//                 onPress={addInvoiceItemsToStock}
//               >
//                 <Text style={styles.confirmText}>Add All to Stock</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.cancelBtn, { marginTop: 12 }]}
//                 onPress={() => setInvoiceModalVisible(false)}
//               >
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </SafeAreaView>
//         </Modal>
//       </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },

//   form: {
//     borderRadius: 16,
//     padding: 16,
//     marginTop: 0,
//   },

//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 14,
//     marginTop: 0,
//   },

//   scanTopRow: {
//     flexDirection: "row",
//     gap: 10,
//     marginBottom: 10,
//   },

//   scanHalfButton: {
//     flex: 1,
//     backgroundColor: "#111827",
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   invoiceButton: {
//     backgroundColor: "#2563eb",
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 18,
//   },

//   scanButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "700",
//     textAlign: "center",
//   },
//   label: { fontSize: 18, fontWeight: "600", marginBottom: 6, marginTop: 6 },
//   dropdown: {
//     height: 48,
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     marginBottom: 10,
//   },
//   input: {
//     height: 48,
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     marginBottom: 8,
//     fontSize: 15,
//   },
//   loadingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginBottom: 15,
//   },
//   loadingText: { fontSize: 15, fontWeight: "600" },
//   button: {
//     width: "100%",
//     borderRadius: 8,
//     overflow: "hidden",
//     elevation: 5,
//     marginTop: 20,
//   },
//   gradientButton: {
//     paddingVertical: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 8,
//   },
//   buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
//   scannerContainer: { flex: 1, backgroundColor: "#000" },
//   scannerOverlay: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 24,
//   },
//   scannerTitle: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 24,
//   },
//   scanBox: {
//     width: 260,
//     height: 160,
//     borderWidth: 3,
//     borderColor: "#00e5ff",
//     borderRadius: 18,
//   },
//   closeButton: {
//     marginTop: 40,
//     backgroundColor: "#fff",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   closeButtonText: { color: "#111", fontSize: 16, fontWeight: "700" },
//   actionOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     justifyContent: "center",
//     padding: 20,
//   },
//   actionCard: {
//     backgroundColor: "#fff",
//     borderRadius: 18,
//     padding: 20,
//   },
//   actionTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 8,
//     color: "#111",
//   },
//   actionSubText: { color: "#555", marginBottom: 10 },
//   matchedName: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginVertical: 10,
//     color: "#111",
//   },
//   actionLabel: {
//     fontSize: 15,
//     fontWeight: "700",
//     marginBottom: 6,
//     marginTop: 10,
//     color: "#111",
//   },
//   actionInput: {
//     height: 45,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     marginBottom: 10,
//     fontSize: 15,
//     color: "#111",
//   },
//   actionDropdown: {
//     height: 50,
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     marginBottom: 10,
//   },
//   actionRow: { flexDirection: "row", gap: 12, marginTop: 20 },
//   cancelBtn: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 10,
//     backgroundColor: "#e5e7eb",
//     alignItems: "center",
//   },
//   confirmBtn: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 10,
//     backgroundColor: "#0275d8",
//     alignItems: "center",
//   },
//   cancelText: { color: "#111", fontWeight: "700" },
//   confirmText: { color: "#fff", fontWeight: "700" },
//   invoiceItemCard: {
//     backgroundColor: "#f3f4f6",
//     padding: 14,
//     borderRadius: 12,
//     marginBottom: 14,
//   },
//   row: {
//     flexDirection: "row",
//     gap: 12,
//     marginBottom: 8,
//   },

//   halfWidth: {
//     flex: 1,
//   },
// });

// export default AddStockItem;

import ScreenWrapper from "@/components/ScreenWrapper";
import { useProUser } from "@/context/ProUserContext";
import { saveSupplierStockIn } from "@/lib/supplierStockInStorage";
import { getActiveSuppliers } from "@/lib/supplierStorage";
import { Supplier } from "@/types/supplier";
import { isGuest } from "@/utils/guest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import {
  getStockItems,
  saveStockItem,
  saveStockMovement,
  StockItem,
  updateStockItem,
} from "../../../lib/storage";

type ExtractedInvoiceItem = {
  name: string;
  category?: string;
  quantity: number;
  unit?: string;
  barcode?: string;
  costPrice?: number;
  lowStockAlert?: number;
  idealStockLevel?: number;
  supplierName?: string;
};

type DropdownOption = {
  label: string;
  value: string;
};

const unitOptions: DropdownOption[] = [
  { label: "Pieces", value: "pcs" },
  { label: "Kg", value: "kg" },
  { label: "Grams", value: "g" },
  { label: "Litres", value: "ltr" },
  { label: "ML", value: "ml" },
  { label: "Boxes", value: "box" },
  { label: "Packets", value: "packet" },
];

const AI_FUNCTION_URL =
  "https://6a0118fd001370552715.fra.appwrite.run";

const NEW_ITEM_VALUE = "new";
const NO_SUPPLIER_VALUE = "__none__";
const NEW_SUPPLIER_VALUE = "__new_supplier__";

const getSupplierDisplayName = (
  supplier?: Pick<
    Supplier,
    "companyName" | "contactName" | "email"
  >,
): string => {
  if (!supplier) return "";

  return (
    supplier.companyName?.trim() ||
    supplier.contactName?.trim() ||
    supplier.email?.trim() ||
    ""
  );
};

const normaliseText = (value?: string): string =>
  String(value ?? "").trim().toLowerCase();

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const AddStockItem: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    screen: isDark ? "#080808" : "#f5f7fa",
    card: isDark ? "#171717" : "#ffffff",
    text: isDark ? "#f5f5f5" : "#111827",
    secondaryText: isDark ? "#a3a3a3" : "#6b7280",
    input: isDark ? "#222222" : "#ffffff",
    border: isDark ? "#525252" : "#d1d5db",
    dropdown: isDark ? "#262626" : "#ffffff",
    activeDropdown: isDark ? "#363636" : "#eef2ff",
  };

  const themedInputStyle = [
    styles.input,
    {
      color: colors.text,
      backgroundColor: colors.input,
      borderColor: colors.border,
    },
  ];

  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [barcode, setBarcode] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [costPrice, setCostPrice] = useState("");
  const [lowStockAlert, setLowStockAlert] =
    useState("");
  const [idealStockLevel, setIdealStockLevel] =
    useState("");

  const [supplierName, setSupplierName] = useState("");
  const [suppliers, setSuppliers] = useState<
    Supplier[]
  >([]);
  const [
    selectedSupplierId,
    setSelectedSupplierId,
  ] = useState("");

  const [stockItems, setStockItems] = useState<
    StockItem[]
  >([]);
  const [selectedItemId, setSelectedItemId] =
    useState("");
  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState("");

  const [scannerVisible, setScannerVisible] =
    useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] =
    useCameraPermissions();

  const [
    barcodeActionVisible,
    setBarcodeActionVisible,
  ] = useState(false);

  const [
    barcodeMatchedItem,
    setBarcodeMatchedItem,
  ] = useState<StockItem | null>(null);

  const [invoiceItems, setInvoiceItems] = useState<
    ExtractedInvoiceItem[]
  >([]);

  const [
    invoiceModalVisible,
    setInvoiceModalVisible,
  ] = useState(false);

  const [loadingAI, setLoadingAI] = useState(false);

  const { isProUser, loading: proLoading } =
    useProUser();

  const fetchStockItems = useCallback(async () => {
    try {
      const items = await getStockItems();
      setStockItems(items ?? []);
    } catch (error) {
      console.error(
        "Failed to load stock items:",
        error,
      );
    }
  }, []);

  const findSupplierByName = useCallback(
    (value?: string): Supplier | undefined => {
      const normalisedName = normaliseText(value);

      if (!normalisedName) {
        return undefined;
      }

      return suppliers.find((supplier) => {
        const displayName =
          getSupplierDisplayName(supplier);

        return (
          normaliseText(displayName) === normalisedName
        );
      });
    },
    [suppliers],
  );

  const fetchSuppliers = useCallback(async () => {
    try {
      const supplierList =
        await getActiveSuppliers();

      setSuppliers(supplierList);

      const pendingSupplier =
        await AsyncStorage.getItem(
          "stocktally_new_supplier_selection",
        );

      if (!pendingSupplier) {
        return;
      }

      const parsedSupplier: {
        id?: string;
        companyName?: string;
      } = JSON.parse(pendingSupplier);

      const newlyCreatedSupplier =
        supplierList.find(
          (supplier) =>
            supplier.id === parsedSupplier.id,
        );

      if (newlyCreatedSupplier) {
        const displayName =
          getSupplierDisplayName(
            newlyCreatedSupplier,
          );

        setSelectedSupplierId(
          newlyCreatedSupplier.id,
        );
        setSupplierName(displayName);
      } else if (parsedSupplier.companyName) {
        setSelectedSupplierId(
          parsedSupplier.id ?? "",
        );
        setSupplierName(
          parsedSupplier.companyName.trim(),
        );
      }

      await AsyncStorage.removeItem(
        "stocktally_new_supplier_selection",
      );
    } catch (error) {
      console.error(
        "Failed to load suppliers:",
        error,
      );
    }
  }, []);

  useEffect(() => {
    void fetchStockItems();
  }, [fetchStockItems]);

  useFocusEffect(
    useCallback(() => {
      void fetchSuppliers();
    }, [fetchSuppliers]),
  );

  const applySupplierSelection = useCallback(
    (
      supplierId?: string,
      existingSupplierName?: string,
    ) => {
      if (supplierId) {
        const supplier = suppliers.find(
          (entry) => entry.id === supplierId,
        );

        if (supplier) {
          setSelectedSupplierId(supplier.id);
          setSupplierName(
            getSupplierDisplayName(supplier),
          );
          return;
        }

        setSelectedSupplierId(supplierId);
        setSupplierName(
          existingSupplierName?.trim() ?? "",
        );
        return;
      }

      const matchedSupplier =
        findSupplierByName(existingSupplierName);

      if (matchedSupplier) {
        setSelectedSupplierId(
          matchedSupplier.id,
        );
        setSupplierName(
          getSupplierDisplayName(
            matchedSupplier,
          ),
        );
        return;
      }

      setSelectedSupplierId("");
      setSupplierName(
        existingSupplierName?.trim() ?? "",
      );
    },
    [findSupplierByName, suppliers],
  );

  const requireProForAI = (): boolean => {
    if (proLoading) {
      return false;
    }

    if (!isProUser) {
      Alert.alert(
        "Pro Feature",
        "AI product and invoice scanning is available for Pro users only.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Upgrade",
            onPress: () =>
              router.push("/paywall"),
          },
        ],
      );

      return false;
    }

    return true;
  };

  const resetForm = () => {
    setSelectedItemId("");
    setSelectedCategoryId("");

    setName("");
    setCategory("");
    setQuantity(0);
    setBarcode("");
    setUnit("pcs");

    setCostPrice("");
    setLowStockAlert("");
    setIdealStockLevel("");

    setSelectedSupplierId("");
    setSupplierName("");

    setBarcodeMatchedItem(null);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to scan barcodes.",
        );
        return;
      }
    }

    setScanned(false);
    setScannerVisible(true);
  };

  const applyBarcode = (code: string) => {
    setScanned(true);
    setBarcode(code);

    const matchedItem = stockItems.find(
      (item) =>
        String(item.barcode ?? "").trim() ===
        code.trim(),
    );

    setScannerVisible(false);

    setTimeout(() => {
      if (matchedItem) {
        setBarcodeMatchedItem(matchedItem);
        setSelectedItemId(matchedItem.id);
        setName(matchedItem.name);
        setCategory(matchedItem.category);
        setSelectedCategoryId(
          matchedItem.category,
        );
        setQuantity(1);
        setUnit(matchedItem.unit || "pcs");

        setCostPrice(
          matchedItem.costPrice !== undefined
            ? String(matchedItem.costPrice)
            : "",
        );

        setLowStockAlert(
          matchedItem.lowStockAlert !== undefined
            ? String(matchedItem.lowStockAlert)
            : "",
        );

        setIdealStockLevel(
          matchedItem.idealStockLevel !==
            undefined
            ? String(
                matchedItem.idealStockLevel,
              )
            : "",
        );

        applySupplierSelection(
          matchedItem.supplierId,
          matchedItem.supplierName,
        );
      } else {
        setBarcodeMatchedItem(null);
        setSelectedItemId(NEW_ITEM_VALUE);
        setName("");
        setCategory("");
        setSelectedCategoryId("");
        setQuantity(1);
        setUnit("pcs");
        setCostPrice("");
        setLowStockAlert("");
        setIdealStockLevel("");
        setSelectedSupplierId("");
        setSupplierName("");
      }

      setBarcodeActionVisible(true);
      setScanned(false);
    }, 500);
  };

  const scanWithAI = async (
    mode: "product" | "invoice",
  ) => {
    if (!requireProForAI()) {
      return;
    }

    Alert.alert(
      "Select Image",
      "Choose image source",
      [
        {
          text: "📷 Camera",
          onPress: () => {
            void handleAIImage(mode, "camera");
          },
        },
        {
          text: "🖼 Gallery",
          onPress: () => {
            void handleAIImage(
              mode,
              "gallery",
            );
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  const handleAIImage = async (
    mode: "product" | "invoice",
    source: "camera" | "gallery",
  ) => {
    try {
      let result:
        ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const cameraPermission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!cameraPermission.granted) {
          Alert.alert(
            "Permission Required",
            "Please allow camera access.",
          );
          return;
        }

        result =
          await ImagePicker.launchCameraAsync({
            mediaTypes:
              ImagePicker.MediaTypeOptions
                .Images,
            quality: 0.5,
          });
      } else {
        const galleryPermission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!galleryPermission.granted) {
          Alert.alert(
            "Permission Required",
            "Please allow gallery access.",
          );
          return;
        }

        result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes:
                ImagePicker.MediaTypeOptions
                  .Images,
              quality: 0.5,
            },
          );
      }

      if (
        result.canceled ||
        !result.assets?.[0]?.uri
      ) {
        return;
      }

      const asset = result.assets[0];
      const resizeWidth =
        mode === "invoice" ? 1400 : 1000;

      const manipulatedImage =
        await ImageManipulator.manipulateAsync(
          asset.uri,
          [
            {
              resize: {
                width: resizeWidth,
              },
            },
          ],
          {
            compress:
              mode === "invoice" ? 0.6 : 0.5,
            format:
              ImageManipulator.SaveFormat.JPEG,
            base64: true,
          },
        );

      if (!manipulatedImage.base64) {
        Alert.alert(
          "Image Error",
          "Could not prepare image for AI scan.",
        );
        return;
      }

      setLoadingAI(true);

      const response = await fetch(
        AI_FUNCTION_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "X-Appwrite-Project":
              "68215c9f00161f204345",
          },
          body: JSON.stringify({
            mode,
            imageBase64:
              manipulatedImage.base64,
            mimeType: "image/jpeg",
          }),
        },
      );

      const raw = await response.text();

      console.log("AI RAW RESPONSE:", raw);

      let data: {
        success?: boolean;
        message?: string;
        items?: ExtractedInvoiceItem[];
      };

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          raw ||
            "AI function returned an empty response.",
        );
      }

      if (!data.success) {
        Alert.alert(
          "AI Error",
          data.message ||
            "Failed to scan image.",
        );
        return;
      }

      if (
        !Array.isArray(data.items) ||
        data.items.length === 0
      ) {
        Alert.alert(
          "No Items Found",
          "AI could not identify products.",
        );
        return;
      }

      if (mode === "product") {
        const item = data.items[0];

        setSelectedItemId(NEW_ITEM_VALUE);
        setSelectedCategoryId(
          item.category || NEW_ITEM_VALUE,
        );
        setName(item.name || "");
        setCategory(item.category || "");
        setQuantity(
          Number(item.quantity) > 0
            ? Number(item.quantity)
            : 1,
        );
        setBarcode(item.barcode || "");
        setUnit(item.unit || "pcs");

        setCostPrice(
          item.costPrice !== undefined
            ? String(item.costPrice)
            : "",
        );

        setLowStockAlert(
          item.lowStockAlert !== undefined
            ? String(item.lowStockAlert)
            : "",
        );

        setIdealStockLevel(
          item.idealStockLevel !== undefined
            ? String(
                item.idealStockLevel,
              )
            : "",
        );

        const recognisedSupplier =
          findSupplierByName(
            item.supplierName,
          );

        if (recognisedSupplier) {
          setSelectedSupplierId(
            recognisedSupplier.id,
          );
          setSupplierName(
            getSupplierDisplayName(
              recognisedSupplier,
            ),
          );
        } else {
          setSelectedSupplierId("");
          setSupplierName(
            item.supplierName?.trim() ?? "",
          );
        }

        Alert.alert(
          "Product Recognised",
          `${
            item.name || "Product"
          } added automatically`,
        );

        return;
      }

      setInvoiceItems(data.items);
      setInvoiceModalVisible(true);
    } catch (error) {
      console.error(error);

      Alert.alert(
        "AI Scan Failed",
        getErrorMessage(
          error,
          "Something went wrong.",
        ),
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSave = async () => {
    if (await isGuest()) {
      const stock = await getStockItems();

      if (
        selectedItemId === NEW_ITEM_VALUE &&
        stock.length >= 10
      ) {
        Alert.alert(
          "Limit Reached",
          "Free plan allows up to 10 stock items. Upgrade to Pro for unlimited.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Upgrade",
              onPress: () =>
                router.push("/paywall"),
            },
          ],
        );

        return;
      }
    }

    if (quantity <= 0) {
      Alert.alert(
        "Validation Error",
        "Quantity must be a positive number.",
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert(
        "Validation Error",
        "Name cannot be empty.",
      );
      return;
    }

    if (!category.trim()) {
      Alert.alert(
        "Validation Error",
        "Category cannot be empty.",
      );
      return;
    }

    Alert.alert(
      "Supplier Payment Status",
      "Has payment been made to the supplier?",
      [
        {
          text: "Unpaid",
          style: "destructive",
          onPress: () => {
            void saveStock(false);
          },
        },
        {
          text: "Paid",
          onPress: () => {
            void saveStock(true);
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  const saveStock = async (
    paidStatus: boolean,
  ) => {
    try {
      const cleanSupplierName =
        supplierName.trim();

      if (
        selectedItemId &&
        selectedItemId !== NEW_ITEM_VALUE
      ) {
        const existingItem =
          stockItems.find(
            (item) =>
              item.id === selectedItemId,
          );

        if (!existingItem) {
          Alert.alert(
            "Error",
            "Selected stock item not found.",
          );
          return;
        }

        const quantityAdded =
          Number(quantity);
        const newBalance =
          Number(existingItem.quantity) +
          quantityAdded;

        const resolvedSupplierId =
          selectedSupplierId ||
          existingItem.supplierId ||
          undefined;

        const resolvedSupplierName =
          cleanSupplierName ||
          existingItem.supplierName?.trim() ||
          "";

        const resolvedCostPrice =
          costPrice.trim()
            ? Number(costPrice)
            : existingItem.costPrice;

        await updateStockItem(
          selectedItemId,
          {
            quantity: newBalance,
            category:
              existingItem.category,
            barcode:
              barcode ||
              existingItem.barcode ||
              "",
            unit:
              unit ||
              existingItem.unit ||
              "pcs",
            costPrice:
              resolvedCostPrice,
            lowStockAlert:
              lowStockAlert.trim()
                ? Number(lowStockAlert)
                : existingItem.lowStockAlert ||
                  0,
            idealStockLevel:
              idealStockLevel.trim()
                ? Number(
                    idealStockLevel,
                  )
                : existingItem.idealStockLevel ||
                  0,
            supplierId:
              resolvedSupplierId,
            supplierName:
              resolvedSupplierName,
          },
        );

        const deliveryUnitCost =
          Number(resolvedCostPrice || 0);

        if (
          resolvedSupplierId ||
          resolvedSupplierName
        ) {
          await saveSupplierStockIn({
            stockItemId: existingItem.id,
            itemName: existingItem.name,
            supplierId:
              resolvedSupplierId,
            supplierName:
              resolvedSupplierName,
            quantity: quantityAdded,
            unit:
              unit ||
              existingItem.unit ||
              "pcs",
            unitCost:
              deliveryUnitCost,
            totalCost:
              quantityAdded *
              deliveryUnitCost,
            paymentStatus: paidStatus
              ? "paid"
              : "unpaid",
            note:
              "Stock added to existing item",
            date: new Date().toISOString(),
          });
        }

        await saveStockMovement({
          stockItemId: existingItem.id,
          itemName: existingItem.name,
          type: "IN",
          quantity: quantityAdded,
          source: "NEW_STOCK",
          sourceLabel:
            "Stock added to existing item",
          balanceAfter: newBalance,
          referenceId: existingItem.id,
          referenceType: "STOCK",
          note: paidStatus
            ? `Paid stock added${
                resolvedSupplierName
                  ? ` from ${resolvedSupplierName}`
                  : ""
              }`
            : `Unpaid stock added${
                resolvedSupplierName
                  ? ` from ${resolvedSupplierName}`
                  : ""
              }`,
        });

        Alert.alert(
          "Success",
          paidStatus
            ? "Stock item updated as paid."
            : "Stock item updated as unpaid.",
        );
      } else {
        const newStockItem =
          await saveStockItem({
            category: category.trim(),
            name: name.trim(),
            quantity: Number(quantity),
            barcode: barcode.trim(),
            unit: unit || "pcs",
            costPrice: costPrice.trim()
              ? Number(costPrice)
              : undefined,
            lowStockAlert:
              lowStockAlert.trim()
                ? Number(lowStockAlert)
                : 0,
            idealStockLevel:
              idealStockLevel.trim()
                ? Number(
                    idealStockLevel,
                  )
                : 0,
            supplierName:
              cleanSupplierName,
            supplierId:
              selectedSupplierId ||
              undefined,
          });

        if (
          selectedSupplierId ||
          cleanSupplierName
        ) {
          const deliveryUnitCost =
            Number(
              newStockItem.costPrice ||
                0,
            );

          await saveSupplierStockIn({
            stockItemId: newStockItem.id,
            itemName: newStockItem.name,
            supplierId:
              selectedSupplierId ||
              undefined,
            supplierName:
              cleanSupplierName,
            quantity: Number(
              newStockItem.quantity,
            ),
            unit:
              newStockItem.unit || "pcs",
            unitCost:
              deliveryUnitCost,
            totalCost:
              Number(
                newStockItem.quantity,
              ) * deliveryUnitCost,
            paymentStatus: paidStatus
              ? "paid"
              : "unpaid",
            date: new Date().toISOString(),
            note:
              "New stock item created",
          });
        }

        await saveStockMovement({
          stockItemId: newStockItem.id,
          itemName: newStockItem.name,
          type: "IN",
          quantity: Number(
            newStockItem.quantity,
          ),
          source: "NEW_STOCK",
          sourceLabel:
            "New stock item created",
          balanceAfter: Number(
            newStockItem.quantity,
          ),
          referenceId: newStockItem.id,
          referenceType: "STOCK",
          note: paidStatus
            ? `Paid new stock created${
                cleanSupplierName
                  ? ` from ${cleanSupplierName}`
                  : ""
              }`
            : `Unpaid new stock created${
                cleanSupplierName
                  ? ` from ${cleanSupplierName}`
                  : ""
              }`,
        });

        Alert.alert(
          "Success",
          paidStatus
            ? "Stock item added as paid."
            : "Stock item added as unpaid.",
        );
      }

      await fetchStockItems();
      resetForm();

      router.replace(
        "/(tabs)/stockList",
      );
    } catch (error) {
      console.error(
        "Failed to save Stock Item:",
        error,
      );

      Alert.alert(
        "Failed to save Stock Item",
        getErrorMessage(
          error,
          "Unknown error.",
        ),
      );
    }
  };

  const addInvoiceItemsToStock =
    async () => {
      try {
        for (const item of invoiceItems) {
          const itemName =
            item.name?.trim() ?? "";
          const itemQuantity =
            Number(item.quantity);

          if (
            !itemName ||
            itemQuantity <= 0
          ) {
            continue;
          }

          const existing =
            stockItems.find(
              (stockItem) =>
                normaliseText(
                  stockItem.name,
                ) ===
                normaliseText(itemName),
            );

          const matchedSupplier =
            findSupplierByName(
              item.supplierName,
            );

          const recognisedSupplierName =
            matchedSupplier
              ? getSupplierDisplayName(
                  matchedSupplier,
                )
              : item.supplierName?.trim() ??
                "";

          if (existing) {
            const resolvedSupplierId =
              existing.supplierId ||
              matchedSupplier?.id ||
              undefined;

            const resolvedSupplierName =
              existing.supplierName?.trim() ||
              recognisedSupplierName;

            await updateStockItem(
              existing.id,
              {
                quantity:
                  Number(
                    existing.quantity,
                  ) + itemQuantity,
                category:
                  existing.category,
                unit:
                  item.unit ||
                  existing.unit ||
                  "pcs",
                barcode:
                  item.barcode ||
                  existing.barcode ||
                  "",
                costPrice:
                  item.costPrice ??
                  existing.costPrice,
                lowStockAlert:
                  existing.lowStockAlert ||
                  item.lowStockAlert ||
                  0,
                idealStockLevel:
                  existing.idealStockLevel ||
                  item.idealStockLevel ||
                  0,
                supplierId:
                  resolvedSupplierId,
                supplierName:
                  resolvedSupplierName,
              },
            );
          } else {
            await saveStockItem({
              name: itemName,
              category:
                item.category?.trim() ||
                "Uncategorised",
              quantity: itemQuantity,
              unit: item.unit || "pcs",
              barcode:
                item.barcode?.trim() ||
                "",
              costPrice:
                item.costPrice,
              lowStockAlert:
                item.lowStockAlert || 0,
              idealStockLevel:
                item.idealStockLevel ||
                0,
              supplierName:
                recognisedSupplierName,
              supplierId:
                matchedSupplier?.id ||
                undefined,
            });
          }
        }

        Alert.alert(
          "Success",
          "Invoice items added to stock.",
        );

        setInvoiceModalVisible(false);
        setInvoiceItems([]);

        await fetchStockItems();

        router.replace(
          "/(tabs)/stockList",
        );
      } catch (error) {
        Alert.alert(
          "Save Failed",
          getErrorMessage(
            error,
            "Could not save invoice items.",
          ),
        );
      }
    };

  const supplierOptions: DropdownOption[] = [
    {
      label: "No Supplier",
      value: NO_SUPPLIER_VALUE,
    },
    ...suppliers.map((supplier) => ({
      label:
        getSupplierDisplayName(supplier) ||
        "Unnamed supplier",
      value: supplier.id,
    })),
    {
      label: "➕ Add New Supplier",
      value: NEW_SUPPLIER_VALUE,
    },
  ];

  const stockOptions: DropdownOption[] = [
    {
      label: "➕ Add New Stock Item",
      value: NEW_ITEM_VALUE,
    },
    ...stockItems.map((item) => ({
      label: item.name,
      value: item.id,
    })),
  ];

  const categoryOptions: DropdownOption[] = [
    {
      label: "➕ Add New Category",
      value: NEW_ITEM_VALUE,
    },
    ...Array.from(
      new Set(
        stockItems
          .map((item) =>
            item.category?.trim(),
          )
          .filter(
            (value): value is string =>
              Boolean(value),
          ),
      ),
    ).map((categoryName) => ({
      label: categoryName,
      value: categoryName,
    })),
  ];

  return (
    <ScreenWrapper
      scroll
      backgroundColor={colors.screen}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.form,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Fast Add Stock
          </Text>

          <View style={styles.scanTopRow}>
            <TouchableOpacity
              style={
                styles.scanHalfButton
              }
              onPress={openScanner}
            >
              <Text
                style={
                  styles.scanButtonText
                }
              >
                📷 Scan Barcode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.scanHalfButton
              }
              onPress={() =>
                void scanWithAI(
                  "product",
                )
              }
              disabled={loadingAI}
            >
              <Text
                style={
                  styles.scanButtonText
                }
              >
                📦 Scan Product with AI
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.invoiceButton}
            onPress={() =>
              void scanWithAI("invoice")
            }
            disabled={loadingAI}
          >
            <Text
              style={
                styles.scanButtonText
              }
            >
              🧾 Scan Invoice with AI
            </Text>
          </TouchableOpacity>

          {loadingAI ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator />

              <Text
                style={[
                  styles.loadingText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                AI is scanning image...
              </Text>
            </View>
          ) : null}

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Barcode / Code
          </Text>

          <TextInput
            placeholder="Scan or enter barcode/code"
            placeholderTextColor={
              colors.secondaryText
            }
            value={barcode}
            onChangeText={setBarcode}
            style={themedInputStyle}
          />

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Item
          </Text>

          <Dropdown
            style={[
              styles.dropdown,
              {
                borderColor:
                  colors.border,
                backgroundColor:
                  colors.input,
              },
            ]}
            containerStyle={{
              backgroundColor:
                colors.dropdown,
              borderColor:
                colors.border,
            }}
            selectedTextStyle={{
              color: colors.text,
              fontSize: 15,
            }}
            placeholderStyle={{
              color:
                colors.secondaryText,
              fontSize: 15,
            }}
            itemTextStyle={{
              color: colors.text,
              fontSize: 15,
            }}
            activeColor={
              colors.activeDropdown
            }
            iconColor={
              colors.secondaryText
            }
            data={stockOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Stock Item"
            value={selectedItemId}
            onChange={(item) => {
              setSelectedItemId(
                item.value,
              );

              if (
                item.value !==
                  NEW_ITEM_VALUE &&
                item.value !== ""
              ) {
                const selectedItem =
                  stockItems.find(
                    (stockItem) =>
                      stockItem.id ===
                      item.value,
                  );

                if (!selectedItem) {
                  return;
                }

                setName(
                  selectedItem.name,
                );
                setCategory(
                  selectedItem.category,
                );
                setSelectedCategoryId(
                  selectedItem.category,
                );
                setBarcode(
                  selectedItem.barcode ||
                    "",
                );
                setUnit(
                  selectedItem.unit ||
                    "pcs",
                );
                setQuantity(0);

                setCostPrice(
                  selectedItem.costPrice !==
                    undefined
                    ? String(
                        selectedItem.costPrice,
                      )
                    : "",
                );

                setLowStockAlert(
                  selectedItem.lowStockAlert !==
                    undefined
                    ? String(
                        selectedItem.lowStockAlert,
                      )
                    : "",
                );

                setIdealStockLevel(
                  selectedItem.idealStockLevel !==
                    undefined
                    ? String(
                        selectedItem.idealStockLevel,
                      )
                    : "",
                );

                applySupplierSelection(
                  selectedItem.supplierId,
                  selectedItem.supplierName,
                );
              } else {
                setName("");
                setCategory("");
                setSelectedCategoryId(
                  "",
                );
                setBarcode("");
                setUnit("pcs");
                setQuantity(0);
                setCostPrice("");
                setLowStockAlert("");
                setIdealStockLevel("");
                setSupplierName("");
                setSelectedSupplierId(
                  "",
                );
              }
            }}
          />

          {selectedItemId ===
          NEW_ITEM_VALUE ? (
            <TextInput
              placeholder="Enter item name"
              placeholderTextColor={
                colors.secondaryText
              }
              value={name}
              onChangeText={setName}
              style={themedInputStyle}
            />
          ) : null}

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Category
          </Text>

          <Dropdown
            style={[
              styles.dropdown,
              {
                borderColor:
                  colors.border,
                backgroundColor:
                  colors.input,
              },
            ]}
            containerStyle={{
              backgroundColor:
                colors.dropdown,
              borderColor:
                colors.border,
            }}
            selectedTextStyle={{
              color: colors.text,
              fontSize: 15,
            }}
            placeholderStyle={{
              color:
                colors.secondaryText,
              fontSize: 15,
            }}
            itemTextStyle={{
              color: colors.text,
              fontSize: 15,
            }}
            activeColor={
              colors.activeDropdown
            }
            iconColor={
              colors.secondaryText
            }
            data={categoryOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Category"
            value={selectedCategoryId}
            onChange={(item) => {
              setSelectedCategoryId(
                item.value,
              );

              if (
                item.value !==
                NEW_ITEM_VALUE
              ) {
                setCategory(item.value);
              } else {
                setCategory("");
              }
            }}
          />

          {selectedCategoryId ===
          NEW_ITEM_VALUE ? (
            <TextInput
              placeholder="Enter new category"
              placeholderTextColor={
                colors.secondaryText
              }
              value={category}
              onChangeText={setCategory}
              style={themedInputStyle}
            />
          ) : null}

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Supplier
          </Text>

          <Dropdown
            style={[
              styles.dropdown,
              {
                borderColor:
                  colors.border,
                backgroundColor:
                  colors.input,
              },
            ]}
            containerStyle={{
              backgroundColor:
                colors.dropdown,
              borderColor:
                colors.border,
            }}
            selectedTextStyle={{
              color: colors.text,
              fontSize: 15,
            }}
            placeholderStyle={{
              color:
                colors.secondaryText,
              fontSize: 15,
            }}
            itemTextStyle={{
              color: colors.text,
              fontSize: 15,
            }}
            activeColor={
              colors.activeDropdown
            }
            iconColor={
              colors.secondaryText
            }
            data={supplierOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Supplier"
            value={
              selectedSupplierId ||
              NO_SUPPLIER_VALUE
            }
            onChange={(item) => {
              if (
                item.value ===
                NEW_SUPPLIER_VALUE
              ) {
                router.push({
                  pathname:
                    "/screens/suppliers/create",
                  params: {
                    returnTo:
                      "addStock",
                  },
                });

                return;
              }

              if (
                item.value ===
                NO_SUPPLIER_VALUE
              ) {
                setSelectedSupplierId(
                  "",
                );
                setSupplierName("");
                return;
              }

              const selectedSupplier =
                suppliers.find(
                  (supplier) =>
                    supplier.id ===
                    item.value,
                );

              if (!selectedSupplier) {
                setSelectedSupplierId(
                  "",
                );
                setSupplierName("");
                return;
              }

              setSelectedSupplierId(
                selectedSupplier.id,
              );

              setSupplierName(
                getSupplierDisplayName(
                  selectedSupplier,
                ),
              );
            }}
          />

          <View style={styles.row}>
            <View
              style={styles.halfWidth}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Quantity
              </Text>

              <TextInput
                placeholder="Quantity"
                placeholderTextColor={
                  colors.secondaryText
                }
                keyboardType="number-pad"
                returnKeyType="done"
                value={String(quantity)}
                onChangeText={(text) =>
                  setQuantity(
                    Number(text) || 0,
                  )
                }
                style={themedInputStyle}
              />
            </View>

            <View
              style={styles.halfWidth}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Unit
              </Text>

              <Dropdown
                style={[
                  styles.dropdown,
                  {
                    borderColor:
                      colors.border,
                    backgroundColor:
                      colors.input,
                  },
                ]}
                containerStyle={{
                  backgroundColor:
                    colors.dropdown,
                  borderColor:
                    colors.border,
                }}
                selectedTextStyle={{
                  color: colors.text,
                  fontSize: 15,
                }}
                placeholderStyle={{
                  color:
                    colors.secondaryText,
                  fontSize: 15,
                }}
                itemTextStyle={{
                  color: colors.text,
                  fontSize: 15,
                }}
                activeColor={
                  colors.activeDropdown
                }
                iconColor={
                  colors.secondaryText
                }
                data={unitOptions}
                labelField="label"
                valueField="value"
                placeholder="Unit"
                value={unit}
                onChange={(item) =>
                  setUnit(item.value)
                }
              />
            </View>
          </View>

          <View style={styles.row}>
            <View
              style={styles.halfWidth}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Low Stock Alert
              </Text>

              <TextInput
                placeholder="Alert Level"
                placeholderTextColor={
                  colors.secondaryText
                }
                keyboardType="number-pad"
                returnKeyType="done"
                value={lowStockAlert}
                onChangeText={
                  setLowStockAlert
                }
                style={themedInputStyle}
              />
            </View>

            <View
              style={styles.halfWidth}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Ideal Stock Level
              </Text>

              <TextInput
                placeholder="Ideal Level"
                placeholderTextColor={
                  colors.secondaryText
                }
                keyboardType="number-pad"
                returnKeyType="done"
                value={idealStockLevel}
                onChangeText={
                  setIdealStockLevel
                }
                style={themedInputStyle}
              />
            </View>
          </View>

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Cost Price
          </Text>

          <TextInput
            placeholder="Cost Price (optional)"
            placeholderTextColor={
              colors.secondaryText
            }
            keyboardType="decimal-pad"
            returnKeyType="done"
            value={costPrice}
            onChangeText={setCostPrice}
            style={themedInputStyle}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
          >
            <LinearGradient
              colors={
                selectedItemId &&
                selectedItemId !==
                  NEW_ITEM_VALUE
                  ? [
                      "#4CAF50",
                      "#45A049",
                    ]
                  : [
                      "#0275d8",
                      "#025aa5",
                    ]
              }
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={
                styles.gradientButton
              }
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                {selectedItemId &&
                selectedItemId !==
                  NEW_ITEM_VALUE
                  ? "Update Stock"
                  : "Add Stock"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Modal
          visible={scannerVisible}
          animationType="slide"
        >
          <View
            style={
              styles.scannerContainer
            }
          >
            <CameraView
              style={
                StyleSheet.absoluteFillObject
              }
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: [
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "code128",
                  "code39",
                  "qr",
                ],
              }}
              onBarcodeScanned={
                scanned
                  ? undefined
                  : ({ data }) =>
                      applyBarcode(data)
              }
            />

            <View
              style={
                styles.scannerOverlay
              }
            >
              <Text
                style={
                  styles.scannerTitle
                }
              >
                Scan product barcode
              </Text>

              <View
                style={styles.scanBox}
              />

              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={() => {
                  setScannerVisible(
                    false,
                  );
                  setScanned(false);
                }}
              >
                <Text
                  style={
                    styles.closeButtonText
                  }
                >
                  Close Scanner
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={
            barcodeActionVisible
          }
          animationType="slide"
          transparent
        >
          <View
            style={
              styles.actionOverlay
            }
          >
            <View
              style={
                styles.actionCard
              }
            >
              <Text
                style={
                  styles.actionTitle
                }
              >
                {barcodeMatchedItem
                  ? "Existing Item Found"
                  : "New Barcode Scanned"}
              </Text>

              <Text
                style={
                  styles.actionSubText
                }
              >
                Barcode: {barcode}
              </Text>

              {barcodeMatchedItem ? (
                <Text
                  style={
                    styles.matchedName
                  }
                >
                  {
                    barcodeMatchedItem.name
                  }
                </Text>
              ) : (
                <>
                  <Text
                    style={
                      styles.actionLabel
                    }
                  >
                    Item Name
                  </Text>

                  <TextInput
                    placeholder="Enter item name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    style={
                      styles.actionInput
                    }
                  />

                  <Text
                    style={
                      styles.actionLabel
                    }
                  >
                    Category
                  </Text>

                  <TextInput
                    placeholder="Enter category"
                    placeholderTextColor="#999"
                    value={category}
                    onChangeText={
                      setCategory
                    }
                    style={
                      styles.actionInput
                    }
                  />
                </>
              )}

              <Text
                style={
                  styles.actionLabel
                }
              >
                Quantity
              </Text>

              <TextInput
                placeholder="Enter quantity"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={
                  Keyboard.dismiss
                }
                value={String(quantity)}
                onChangeText={(text) =>
                  setQuantity(
                    Number(text) || 0,
                  )
                }
                style={
                  styles.actionInput
                }
              />

              <Text
                style={
                  styles.actionLabel
                }
              >
                Cost Price
              </Text>

              <TextInput
                placeholder="Cost Price (optional)"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={
                  Keyboard.dismiss
                }
                value={costPrice}
                onChangeText={setCostPrice}
                style={
                  styles.actionInput
                }
              />

              <Text
                style={
                  styles.actionLabel
                }
              >
                Unit
              </Text>

              <Dropdown
                style={[
                  styles.actionDropdown,
                  {
                    borderColor: "#ccc",
                  },
                ]}
                data={unitOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Unit"
                value={unit}
                onChange={(item) =>
                  setUnit(item.value)
                }
              />

              <View
                style={
                  styles.actionRow
                }
              >
                <TouchableOpacity
                  style={
                    styles.cancelBtn
                  }
                  onPress={() =>
                    setBarcodeActionVisible(
                      false,
                    )
                  }
                >
                  <Text
                    style={
                      styles.cancelText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.confirmBtn
                  }
                  onPress={async () => {
                    setBarcodeActionVisible(
                      false,
                    );
                    await handleSave();
                  }}
                >
                  <Text
                    style={
                      styles.confirmText
                    }
                  >
                    {barcodeMatchedItem
                      ? "Update Stock"
                      : "Add Item"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={
            invoiceModalVisible
          }
          animationType="slide"
        >
          <SafeAreaView
            style={
              styles.invoiceSafeArea
            }
          >
            <ScrollView
              contentContainerStyle={
                styles.invoiceScrollContent
              }
            >
              <Text
                style={
                  styles.actionTitle
                }
              >
                Review Invoice Items
              </Text>

              {invoiceItems.map(
                (item, index) => (
                  <View
                    key={`${item.name}-${index}`}
                    style={
                      styles.invoiceItemCard
                    }
                  >
                    <TextInput
                      value={item.name}
                      onChangeText={(text) => {
                        setInvoiceItems(
                          (currentItems) =>
                            currentItems.map(
                              (
                                currentItem,
                                itemIndex,
                              ) =>
                                itemIndex ===
                                index
                                  ? {
                                      ...currentItem,
                                      name: text,
                                    }
                                  : currentItem,
                            ),
                        );
                      }}
                      style={
                        styles.actionInput
                      }
                      placeholder="Item name"
                    />

                    <TextInput
                      value={
                        item.category ||
                        ""
                      }
                      onChangeText={(text) => {
                        setInvoiceItems(
                          (currentItems) =>
                            currentItems.map(
                              (
                                currentItem,
                                itemIndex,
                              ) =>
                                itemIndex ===
                                index
                                  ? {
                                      ...currentItem,
                                      category:
                                        text,
                                    }
                                  : currentItem,
                            ),
                        );
                      }}
                      style={
                        styles.actionInput
                      }
                      placeholder="Category"
                    />

                    <TextInput
                      value={
                        item.costPrice !==
                        undefined
                          ? String(
                              item.costPrice,
                            )
                          : ""
                      }
                      onChangeText={(text) => {
                        setInvoiceItems(
                          (currentItems) =>
                            currentItems.map(
                              (
                                currentItem,
                                itemIndex,
                              ) =>
                                itemIndex ===
                                index
                                  ? {
                                      ...currentItem,
                                      costPrice:
                                        text.trim()
                                          ? Number(
                                              text,
                                            ) ||
                                            undefined
                                          : undefined,
                                    }
                                  : currentItem,
                            ),
                        );
                      }}
                      style={
                        styles.actionInput
                      }
                      placeholder="Cost Price"
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      onSubmitEditing={
                        Keyboard.dismiss
                      }
                    />

                    <TouchableOpacity
                      style={
                        styles.cancelBtn
                      }
                      onPress={() => {
                        setInvoiceItems(
                          (currentItems) =>
                            currentItems.filter(
                              (
                                _,
                                itemIndex,
                              ) =>
                                itemIndex !==
                                index,
                            ),
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.cancelText
                        }
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                ),
              )}

              <TouchableOpacity
                style={
                  styles.confirmBtn
                }
                onPress={() =>
                  void addInvoiceItemsToStock()
                }
              >
                <Text
                  style={
                    styles.confirmText
                  }
                >
                  Add All to Stock
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    marginTop: 12,
                  },
                ]}
                onPress={() =>
                  setInvoiceModalVisible(
                    false,
                  )
                }
              >
                <Text
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  form: {
    borderRadius: 16,
    padding: 16,
    marginTop: 0,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
    marginTop: 0,
  },

  scanTopRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  scanHalfButton: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  invoiceButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  scanButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 6,
  },

  dropdown: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontSize: 15,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },

  loadingText: {
    fontSize: 15,
    fontWeight: "600",
  },

  button: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 5,
    marginTop: 20,
  },

  gradientButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },

  scannerContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  scannerOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  scannerTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },

  scanBox: {
    width: 260,
    height: 160,
    borderWidth: 3,
    borderColor: "#00e5ff",
    borderRadius: 18,
  },

  closeButton: {
    marginTop: 40,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  closeButtonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },

  actionOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
  },

  actionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111111",
  },

  actionSubText: {
    color: "#555555",
    marginBottom: 10,
  },

  matchedName: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 10,
    color: "#111111",
  },

  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 10,
    color: "#111111",
  },

  actionInput: {
    height: 45,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 15,
    color: "#111111",
  },

  actionDropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },

  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#0275d8",
    alignItems: "center",
  },

  cancelText: {
    color: "#111111",
    fontWeight: "700",
  },

  confirmText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  invoiceSafeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  invoiceScrollContent: {
    padding: 20,
  },

  invoiceItemCard: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },

  halfWidth: {
    flex: 1,
  },
});

export default AddStockItem;
