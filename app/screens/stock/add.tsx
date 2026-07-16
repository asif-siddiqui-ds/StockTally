// export default AddStockItem;
import ScreenWrapper from '@/components/ScreenWrapper';
import { useProUser } from "@/context/ProUserContext";
import { isGuest } from '@/utils/guest';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import {
  getStockItems,
  saveStockItem,
  saveStockMovement,
  StockItem,
  updateStockItem,
} from '../../../lib/storage';

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

const unitOptions = [
  { label: 'Pieces', value: 'pcs' },
  { label: 'Kg', value: 'kg' },
  { label: 'Grams', value: 'g' },
  { label: 'Litres', value: 'ltr' },
  { label: 'ML', value: 'ml' },
  { label: 'Boxes', value: 'box' },
  { label: 'Packets', value: 'packet' },
];

const AI_FUNCTION_URL = 'https://6a0118fd001370552715.fra.appwrite.run';

const AddStockItem: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const borderColor = isDark ? '#555' : '#ccc';

  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState('');
  const [lowStockAlert, setLowStockAlert] = useState('');
  const [idealStockLevel, setIdealStockLevel] = useState('');
  const [supplierName, setSupplierName] = useState('');


  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const [barcodeActionVisible, setBarcodeActionVisible] = useState(false);
  const [barcodeMatchedItem, setBarcodeMatchedItem] = useState<StockItem | null>(null);

  const [invoiceItems, setInvoiceItems] = useState<ExtractedInvoiceItem[]>([]);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const { isProUser, loading: proLoading } = useProUser();

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    const items = await getStockItems();
    if (items) setStockItems(items);
  };

  const requireProForAI = () => {
    if (proLoading) return false;

    if (!isProUser) {
      Alert.alert(
        "Pro Feature",
        "AI product and invoice scanning is available for Pro users only.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => router.push("/paywall") },
        ]
      );
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setSelectedItemId('');
    setSelectedCategoryId('');
    setName('');
    setCategory('');
    setQuantity(0);
    setBarcode('');
    setUnit('pcs');
    setCostPrice('');
    setBarcodeMatchedItem(null);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert('Camera Permission Required', 'Please allow camera access to scan barcodes.');
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
      (item) => String(item.barcode || '').trim() === code.trim()
    );

    setScannerVisible(false);

    setTimeout(() => {
      if (matchedItem) {
        setBarcodeMatchedItem(matchedItem);
        setSelectedItemId(matchedItem.id);
        setName(matchedItem.name);
        setCategory(matchedItem.category);
        setSelectedCategoryId(matchedItem.category);
        setQuantity(1);
        setUnit(matchedItem.unit || 'pcs');
        setCostPrice(matchedItem.costPrice ? String(matchedItem.costPrice) : '');
        setLowStockAlert(matchedItem.lowStockAlert ? String(matchedItem.lowStockAlert) : '');
        setIdealStockLevel(matchedItem.idealStockLevel ? String(matchedItem.idealStockLevel) : '');
        setSupplierName(matchedItem.supplierName || '');
      } else {
        setBarcodeMatchedItem(null);
        setSelectedItemId('new');
        setName('');
        setCategory('');
        setSelectedCategoryId('');
        setQuantity(1);
        setUnit('pcs');
        setCostPrice('');
        setLowStockAlert('');
        setIdealStockLevel('');
        setSupplierName('');
      }

      setBarcodeActionVisible(true);
      setScanned(false);
    }, 500);
  };

  const scanWithAI = async (mode: 'product' | 'invoice') => {
    if (!requireProForAI()) return;
    try {
      Alert.alert(
        'Select Image',
        'Choose image source',
        [
          {
            text: '📷 Camera',
            onPress: async () => {
              await handleAIImage(mode, 'camera');
            },
          },
          {
            text: '🖼 Gallery',
            onPress: async () => {
              await handleAIImage(mode, 'gallery');
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (err: any) {
      console.error(err);

      Alert.alert(
        'AI Scan Failed',
        err.message || 'Something went wrong'
      );
    }
  };

  const handleAIImage = async (
    mode: 'product' | 'invoice',
    source: 'camera' | 'gallery'
  ) => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

        if (!cameraPermission.granted) {
          Alert.alert('Permission Required', 'Please allow camera access.');
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.5,
        });
      } else {
        const galleryPermission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!galleryPermission.granted) {
          Alert.alert('Permission Required', 'Please allow gallery access.');
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.5,
        });
      }

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const asset = result.assets[0];

      const resizeWidth = mode === 'invoice' ? 1400 : 1000;

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [
          {
            resize: {
              width: resizeWidth,
            },
          },
        ],
        {
          compress: mode === 'invoice' ? 0.6 : 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!manipulatedImage.base64) {
        Alert.alert('Image Error', 'Could not prepare image for AI scan.');
        return;
      }

      setLoadingAI(true);

      const response = await fetch(AI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': '68215c9f00161f204345',
        },
        body: JSON.stringify({
          mode,
          imageBase64: manipulatedImage.base64,
          mimeType: 'image/jpeg',
        }),
      });

      const raw = await response.text();
      console.log('AI RAW RESPONSE:', raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(raw || 'AI function returned empty response');
      }

      if (!data.success) {
        Alert.alert('AI Error', data.message || 'Failed to scan image.');
        return;
      }

      if (!data.items || data.items.length === 0) {
        Alert.alert('No Items Found', 'AI could not identify products.');
        return;
      }

      if (mode === 'product') {
        const item = data.items[0];

        setSelectedItemId('new');
        setSelectedCategoryId(item.category || 'new');
        setName(item.name || '');
        setCategory(item.category || '');
        setQuantity(item.quantity || 1);
        setBarcode(item.barcode || '');
        setUnit(item.unit || 'pcs');
        setCostPrice(item.costPrice ? String(item.costPrice) : '');
        setLowStockAlert(item.lowStockAlert || 0);
        setIdealStockLevel(item.idealStockLevel || 0);
        setSupplierName(item.supplierName || '');

        Alert.alert(
          'Product Recognised',
          `${item.name || 'Product'} added automatically`
        );

        return;
      }

      setInvoiceItems(data.items);
      setInvoiceModalVisible(true);
    } catch (err: any) {
      console.error(err);
      Alert.alert('AI Scan Failed', err.message || 'Something went wrong');
    } finally {
      setLoadingAI(false);
    }
  };

  // const handleSave = async () => {
  //   if (await isGuest()) {
  //     const stock = await getStockItems();

  //     if (stock.length >= 10) {
  //       Alert.alert(
  //         "Limit Reached",
  //         "Free plan allows up to 10 stock items. Upgrade to Pro for unlimited.",
  //         [
  //           { text: "Cancel", style: "cancel" },
  //           { text: "Upgrade", onPress: () => router.push("/paywall") },
  //         ]
  //       );
  //       return;
  //     }
  //   }

  //   if (quantity <= 0) {
  //     Alert.alert("Validation Error", "Quantity must be a positive number.");
  //     return;
  //   }

  //   if (!name.trim()) {
  //     Alert.alert("Validation Error", "Name cannot be empty.");
  //     return;
  //   }

  //   if (!category.trim()) {
  //     Alert.alert("Validation Error", "Category cannot be empty.");
  //     return;
  //   }

  //   try {
  //     if (selectedItemId && selectedItemId !== "new") {
  //       const existingItem = stockItems.find(
  //         (item) => item.id === selectedItemId
  //       );

  //       if (!existingItem) {
  //         Alert.alert("Error", "Selected stock item not found.");
  //         return;
  //       }

  //       const newBalance = Number(existingItem.quantity) + Number(quantity);

  //       await updateStockItem(selectedItemId, {
  //         quantity: newBalance,
  //         category: existingItem.category,
  //         barcode: barcode || existingItem.barcode || "",
  //         unit,
  //         costPrice: costPrice ? Number(costPrice) : existingItem.costPrice,
  //         lowStockAlert: lowStockAlert
  //           ? Number(lowStockAlert)
  //           : existingItem.lowStockAlert || 0,
  //         idealStockLevel: idealStockLevel
  //           ? Number(idealStockLevel)
  //           : existingItem.idealStockLevel || 0,
  //         supplierName: supplierName || existingItem.supplierName || "",
  //       });

  //       await saveStockMovement({
  //         stockItemId: existingItem.id,
  //         itemName: existingItem.name,
  //         type: "IN",
  //         quantity: Number(quantity),
  //         source: "NEW_STOCK",
  //         sourceLabel: "Stock added to existing item",
  //         balanceAfter: newBalance,
  //         referenceId: existingItem.id,
  //         referenceType: "STOCK",
  //         note: "Quantity added from Stock Add screen",
  //       });

  //       Alert.alert("Success", "Stock item updated successfully.");
  //     } else {
  //       const newStockItem = await saveStockItem({
  //         category,
  //         name,
  //         quantity,
  //         barcode,
  //         unit,
  //         costPrice: costPrice ? Number(costPrice) : undefined,
  //         lowStockAlert: lowStockAlert ? Number(lowStockAlert) : 0,
  //         idealStockLevel: idealStockLevel ? Number(idealStockLevel) : 0,
  //         supplierName,
  //         date: new Date().toISOString(),
  //       });

  //       await saveStockMovement({
  //         stockItemId: newStockItem.id,
  //         itemName: newStockItem.name,
  //         type: "IN",
  //         quantity: Number(newStockItem.quantity),
  //         source: "NEW_STOCK",
  //         sourceLabel: "New stock item created",
  //         balanceAfter: Number(newStockItem.quantity),
  //         referenceId: newStockItem.id,
  //         referenceType: "STOCK",
  //         note: "New stock created from Stock Add screen",
  //       });

  //       Alert.alert("Success", "Stock item added successfully.");
  //     }

  //     await fetchStockItems();
  //     resetForm();
  //     router.replace("/(tabs)/stockList");
  //   } catch (error: any) {
  //     console.error("Failed to save Stock Item:", error.message);
  //     Alert.alert(
  //       "Failed to save Stock Item",
  //       error.message || "Unknown error."
  //     );
  //   }
  // };

  const handleSave = async () => {
    if (await isGuest()) {
      const stock = await getStockItems();

      if (stock.length >= 10) {
        Alert.alert(
          "Limit Reached",
          "Free plan allows up to 10 stock items. Upgrade to Pro for unlimited.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Upgrade", onPress: () => router.push("/paywall") },
          ]
        );
        return;
      }
    }

    if (quantity <= 0) {
      Alert.alert("Validation Error", "Quantity must be a positive number.");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Validation Error", "Name cannot be empty.");
      return;
    }

    if (!category.trim()) {
      Alert.alert("Validation Error", "Category cannot be empty.");
      return;
    }

    Alert.alert(
      "Supplier Payment Status",
      "Has payment been made to the supplier?",
      [
        {
          text: "Unpaid",
          style: "destructive",
          onPress: () => saveStock(false),
        },
        {
          text: "Paid",
          onPress: () => saveStock(true),
        },
      ],
      { cancelable: false }
    );
  };
  
  const saveStock = async (paidStatus: boolean) => {
    try {
      if (selectedItemId && selectedItemId !== "new") {
        const existingItem = stockItems.find(
          (item) => item.id === selectedItemId
        );

        if (!existingItem) {
          Alert.alert("Error", "Selected stock item not found.");
          return;
        }

        const newBalance = Number(existingItem.quantity) + Number(quantity);

        await updateStockItem(selectedItemId, {
          quantity: newBalance,
          category: existingItem.category,
          barcode: barcode || existingItem.barcode || "",
          unit,
          costPrice: costPrice ? Number(costPrice) : existingItem.costPrice,
          lowStockAlert: lowStockAlert
            ? Number(lowStockAlert)
            : existingItem.lowStockAlert || 0,
          idealStockLevel: idealStockLevel
            ? Number(idealStockLevel)
            : existingItem.idealStockLevel || 0,
          supplierName: supplierName || existingItem.supplierName || "",
          paid: paidStatus,
        });

        await saveStockMovement({
          stockItemId: existingItem.id,
          itemName: existingItem.name,
          type: "IN",
          quantity: Number(quantity),
          source: "NEW_STOCK",
          sourceLabel: "Stock added to existing item",
          balanceAfter: newBalance,
          referenceId: existingItem.id,
          referenceType: "STOCK",
          note: paidStatus
            ? `Paid stock added from supplier${supplierName ? `: ${supplierName}` : ""}`
            : `Unpaid stock added from supplier${supplierName ? `: ${supplierName}` : ""}`,
        });

        Alert.alert(
          "Success",
          paidStatus
            ? "Stock item updated as paid."
            : "Stock item updated as unpaid."
        );
      } else {
        const newStockItem = await saveStockItem({
          category,
          name,
          quantity,
          barcode,
          unit,
          costPrice: costPrice ? Number(costPrice) : undefined,
          lowStockAlert: lowStockAlert ? Number(lowStockAlert) : 0,
          idealStockLevel: idealStockLevel ? Number(idealStockLevel) : 0,
          supplierName,
          paid: paidStatus,
          date: new Date().toISOString(),
        });

        await saveStockMovement({
          stockItemId: newStockItem.id,
          itemName: newStockItem.name,
          type: "IN",
          quantity: Number(newStockItem.quantity),
          source: "NEW_STOCK",
          sourceLabel: "New stock item created",
          balanceAfter: Number(newStockItem.quantity),
          referenceId: newStockItem.id,
          referenceType: "STOCK",
          note: paidStatus
            ? `Paid new stock created${supplierName ? ` from ${supplierName}` : ""}`
            : `Unpaid new stock created${supplierName ? ` from ${supplierName}` : ""}`,
        });

        Alert.alert(
          "Success",
          paidStatus
            ? "Stock item added as paid."
            : "Stock item added as unpaid."
        );
      }

      await fetchStockItems();
      resetForm();
      router.replace("/(tabs)/stockList");
    } catch (error: any) {
      console.error("Failed to save Stock Item:", error.message);
      Alert.alert(
        "Failed to save Stock Item",
        error.message || "Unknown error."
      );
    }
  };

  const addInvoiceItemsToStock = async () => {
    try {
      for (const item of invoiceItems) {
        if (!item.name || item.quantity <= 0) continue;

        const existing = stockItems.find(
          (s) => s.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );

        if (existing) {
          await updateStockItem(existing.id, {
            quantity: existing.quantity + item.quantity,
            category: existing.category,
            unit: item.unit || existing.unit || 'pcs',
            barcode: item.barcode || existing.barcode || '',
            costPrice: item.costPrice || existing.costPrice,
            lowStockAlert: existing.lowStockAlert || 0,
            idealStockLevel: existing.idealStockLevel || 0,
            supplierName: existing.supplierName || '',
          });
        } else {
          await saveStockItem({
            name: item.name,
            category: item.category || 'Uncategorised',
            quantity: item.quantity,
            unit: item.unit || 'pcs',
            barcode: item.barcode || '',
            costPrice: item.costPrice,
            lowStockAlert: item.lowStockAlert || 0,
            idealStockLevel: item.idealStockLevel || 0,
            supplierName: item.supplierName || '',
            date: new Date().toISOString(),
          });
        }
      }

      Alert.alert('Success', 'Invoice items added to stock.');
      setInvoiceModalVisible(false);
      setInvoiceItems([]);
      await fetchStockItems();
      router.replace('/(tabs)/stockList');
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save invoice items.');
    }
  };

  return (
  <ScreenWrapper scroll backgroundColor={isDark ? '#0A0A0A' : '#fff'}>
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Fast Add Stock</Text>
        <View style={styles.scanTopRow}>
          <TouchableOpacity style={styles.scanHalfButton} onPress={openScanner}>
            <Text style={styles.scanButtonText}>📷 Scan Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanHalfButton}
            onPress={() => scanWithAI('product')}
            disabled={loadingAI}
          >
            <Text style={styles.scanButtonText}>📦 Scan Product with AI</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.invoiceButton}
          onPress={() => scanWithAI('invoice')}
          disabled={loadingAI}
        >
          <Text style={styles.scanButtonText}>🧾 Scan Invoice with AI</Text>
        </TouchableOpacity>

          {/* keep the rest of your existing form code from loadingAI onwards */}

        {loadingAI && (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>AI is scanning image...</Text>
          </View>
        )}

        <Text style={styles.label}>Barcode / Code</Text>
        <TextInput
          placeholder="Scan or enter barcode/code"
          placeholderTextColor="#999"
          value={barcode}
          onChangeText={setBarcode}
          style={styles.input}
        />

        <Text style={styles.label}>Item</Text>
        <Dropdown
          style={[styles.dropdown, { borderColor }]}
          data={[
            { label: '➕ Add New Stock Item', value: 'new' },
            ...stockItems.map((item) => ({
              label: item.name,
              value: item.id,
            })),
          ]}
          labelField="label"
          valueField="value"
          placeholder="Select Stock Item"
          value={selectedItemId}
          onChange={(item) => {
            setSelectedItemId(item.value);

            if (item.value !== 'new' && item.value !== '') {
              const selectedItem = stockItems.find((s) => s.id === item.value);

              if (selectedItem) {
                setName(selectedItem.name);
                setCategory(selectedItem.category);
                setSelectedCategoryId(selectedItem.category);
                setBarcode(selectedItem.barcode || '');
                setUnit(selectedItem.unit || 'pcs');
                setQuantity(0);
                setCostPrice(selectedItem.costPrice ? String(selectedItem.costPrice) : '');
                setLowStockAlert(selectedItem.lowStockAlert ? String(selectedItem.lowStockAlert) : '');
                setIdealStockLevel(selectedItem.idealStockLevel ? String(selectedItem.idealStockLevel) : '');
                setSupplierName(selectedItem.supplierName || '');
              }
            } else {
              setName('');
              setCategory('');
              setSelectedCategoryId('');
              setBarcode('');
              setUnit('pcs');
              setQuantity(0);
              setCostPrice('');
              setLowStockAlert('');
              setIdealStockLevel('');
              setSupplierName('');
            }
          }}
        />

        {selectedItemId === 'new' && (
          <TextInput
            placeholder="Enter item name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        )}

        <Text style={styles.label}>Category</Text>
        <Dropdown
          style={[styles.dropdown, { borderColor }]}
          data={[
            { label: '➕ Add New Category', value: 'new' },
            ...Array.from(new Set(stockItems.map((item) => item.category))).map((cat) => ({
              label: cat,
              value: cat,
            })),
          ]}
          labelField="label"
          valueField="value"
          placeholder="Select Category"
          value={selectedCategoryId}
          onChange={(item) => {
            setSelectedCategoryId(item.value);

            if (item.value !== 'new') {
              setCategory(item.value);
            } else {
              setCategory('');
            }
          }}
        />

        {selectedCategoryId === 'new' && (
          <TextInput
            placeholder="Enter new category"
            placeholderTextColor="#999"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />
        )}
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              placeholder="Quantity"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              value={String(quantity)}
              onChangeText={(text) => setQuantity(Number(text) || 0)}
              style={styles.input}
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.label}>Unit</Text>
            <Dropdown
              style={[styles.dropdown, { borderColor }]}
              data={unitOptions}
              labelField="label"
              valueField="value"
              placeholder="Unit"
              value={unit}
              onChange={(item) => setUnit(item.value)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Low Stock Alert</Text>
            <TextInput
              placeholder="Alert Level"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              value={String(lowStockAlert)}
              onChangeText={setLowStockAlert}
              style={styles.input}
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.label}>Ideal Stock Level</Text>
            <TextInput
              placeholder="Ideal Level"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              value={String(idealStockLevel)}
              onChangeText={setIdealStockLevel}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.customWidth}>
            <Text style={styles.label}>Cost Price</Text>
            <TextInput
              placeholder="Cost Price (optional)"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              value={costPrice}
              onChangeText={setCostPrice}
              style={styles.input}
            />
          </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Supplier Name</Text>
              <TextInput
                placeholder="Supplier name"
                value={supplierName}
                onChangeText={setSupplierName}
                style={styles.input}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <LinearGradient
              colors={
                selectedItemId && selectedItemId !== 'new'
                  ? ['#4CAF50', '#45A049']
                  : ['#0275d8', '#025aa5']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                {selectedItemId && selectedItemId !== 'new' ? 'Update Stock' : 'Add Stock'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Modal visible={scannerVisible} animationType="slide">
          <View style={styles.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
              }}
              onBarcodeScanned={scanned ? undefined : ({ data }) => applyBarcode(data)}
            />

            <View style={styles.scannerOverlay}>
              <Text style={styles.scannerTitle}>Scan product barcode</Text>
              <View style={styles.scanBox} />

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setScannerVisible(false);
                  setScanned(false);
                }}
              >
                <Text style={styles.closeButtonText}>Close Scanner</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={barcodeActionVisible} animationType="slide" transparent>
          <View style={styles.actionOverlay}>
            <View style={styles.actionCard}>
              <Text style={styles.actionTitle}>
                {barcodeMatchedItem ? 'Existing Item Found' : 'New Barcode Scanned'}
              </Text>

              <Text style={styles.actionSubText}>Barcode: {barcode}</Text>

              {barcodeMatchedItem ? (
                <Text style={styles.matchedName}>{barcodeMatchedItem.name}</Text>
              ) : (
                <>
                  <Text style={styles.actionLabel}>Item Name</Text>
                  <TextInput
                    placeholder="Enter item name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    style={styles.actionInput}
                  />

                  <Text style={styles.actionLabel}>Category</Text>
                  <TextInput
                    placeholder="Enter category"
                    placeholderTextColor="#999"
                    value={category}
                    onChangeText={setCategory}
                    style={styles.actionInput}
                  />
                </>
              )}

              <Text style={styles.actionLabel}>Quantity</Text>
              <TextInput
                placeholder="Enter quantity"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                value={String(quantity)}
                onChangeText={(text) => setQuantity(Number(text) || 0)}
                style={styles.actionInput}
              />

              <Text style={styles.actionLabel}>Cost Price</Text>
              <TextInput
                placeholder="Cost Price (optional)"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                value={costPrice}
                onChangeText={setCostPrice}
                style={styles.actionInput}
              />

              <Text style={styles.actionLabel}>Unit</Text>
              <Dropdown
                style={[styles.actionDropdown, { borderColor: '#ccc' }]}
                data={unitOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Unit"
                value={unit}
                onChange={(item) => setUnit(item.value)}
              />

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setBarcodeActionVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={async () => {
                    setBarcodeActionVisible(false);
                    await handleSave();
                  }}
                >
                  <Text style={styles.confirmText}>
                    {barcodeMatchedItem ? 'Update Stock' : 'Add Item'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={invoiceModalVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.actionTitle}>Review Invoice Items</Text>

              {invoiceItems.map((item, index) => (
                <View key={`${item.name}-${index}`} style={styles.invoiceItemCard}>
                  <TextInput
                    value={item.name}
                    onChangeText={(text) => {
                      const updated = [...invoiceItems];
                      updated[index].name = text;
                      setInvoiceItems(updated);
                    }}
                    style={styles.actionInput}
                    placeholder="Item name"
                  />

                  <TextInput
                    value={item.category || ''}
                    onChangeText={(text) => {
                      const updated = [...invoiceItems];
                      updated[index].category = text;
                      setInvoiceItems(updated);
                    }}
                    style={styles.actionInput}
                    placeholder="Category"
                  />

                  <TextInput
                    value={item.costPrice ? String(item.costPrice) : ''}
                    onChangeText={(text) => {
                      const updated = [...invoiceItems];
                      updated[index].costPrice = Number(text) || undefined;
                      setInvoiceItems(updated);
                    }}
                    style={styles.actionInput}
                    placeholder="Cost Price"
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
                    }}
                  >
                    <Text style={styles.cancelText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.confirmBtn} onPress={addInvoiceItemsToStock}>
                <Text style={styles.confirmText}>Add All to Stock</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelBtn, { marginTop: 12 }]}
                onPress={() => setInvoiceModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingBottom: 320,
    // flexGrow: 1,
    padding: 20,
  },

  form: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginTop: 0,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 0,
  },

  scanTopRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  scanHalfButton: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  invoiceButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  scanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 6, marginTop: 6 },
  dropdown: {
    height: 44,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    fontSize: 15,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  loadingText: { fontSize: 15, fontWeight: '600' },
  button: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    marginTop: 20,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  scanBox: {
    width: 260,
    height: 160,
    borderWidth: 3,
    borderColor: '#00e5ff',
    borderRadius: 18,
  },
  closeButton: {
    marginTop: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  closeButtonText: { color: '#111', fontSize: 16, fontWeight: '700' },
  actionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  actionSubText: { color: '#555', marginBottom: 10 },
  matchedName: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 10,
    color: '#111',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
    color: '#111',
  },
  actionInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 15,
    color: '#111',
  },
  actionDropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#0275d8',
    alignItems: 'center',
  },
  cancelText: { color: '#111', fontWeight: '700' },
  confirmText: { color: '#fff', fontWeight: '700' },
  invoiceItemCard: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },

  halfWidth: {
    flex: 1,
  },
  customWidth: {
    width: '30%',
  },
  
});

export default AddStockItem;