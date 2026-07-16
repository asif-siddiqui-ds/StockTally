import ScreenWrapper from '@/components/ScreenWrapper';
import { getStockItems, StockItem, updateStockItem, saveStockMovement } from '@/lib/storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type StockTakeSessionItem = StockItem & {
  countedQuantity: string;
  difference: number;
  checked: boolean;
};

const StockTakeSessionScreen: React.FC = () => {
  const [items, setItems] = useState<StockTakeSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const [countModalVisible, setCountModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockTakeSessionItem | null>(null);
  const [countInput, setCountInput] = useState('');

  const loadSession = useCallback(async () => {
    try {
      const stock = await getStockItems();

      const prepared = stock
        .map((item) => ({
          ...item,
          countedQuantity: '',
          difference: 0,
          checked: false,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setItems(prepared);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not start stock take session.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const stats = useMemo(() => {
    const total = items.length;
    const checked = items.filter((item) => item.checked).length;
    const differences = items.filter((item) => item.checked && item.difference !== 0).length;

    return { total, checked, differences };
  }, [items]);

  const openCountModal = (item: StockTakeSessionItem) => {
    setSelectedItem(item);
    setCountInput(item.countedQuantity || String(item.quantity));
    setCountModalVisible(true);
  };

  const saveCount = () => {
    if (!selectedItem) return;

    const counted = Number(countInput);

    if (Number.isNaN(counted) || counted < 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid counted quantity.');
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              countedQuantity: String(counted),
              difference: counted - item.quantity,
              checked: true,
            }
          : item
      )
    );

    setCountModalVisible(false);
    setSelectedItem(null);
    setCountInput('');
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert('Camera Permission Required', 'Please allow camera access.');
        return;
      }
    }

    setScanned(false);
    setScannerVisible(true);
  };

  const handleBarcodeScanned = (barcode: string) => {
    setScanned(true);
    setScannerVisible(false);

    const matched = items.find(
      (item) => String(item.barcode || '').trim() === barcode.trim()
    );

    setTimeout(() => {
      if (!matched) {
        Alert.alert('No Match Found', `No stock item found for barcode:\n${barcode}`);
        setScanned(false);
        return;
      }

      openCountModal(matched);
      setScanned(false);
    }, 400);
  };

  const completeSession = async () => {
    const checkedItems = items.filter((item) => item.checked);

    if (checkedItems.length === 0) {
      Alert.alert('Nothing Checked', 'Please count at least one item before completing.');
      return;
    }

    const changedItems = checkedItems.filter((item) => item.difference !== 0);

    Alert.alert(
      "Complete Stock Take",
      `${checkedItems.length} item(s) checked.\n${changedItems.length} item(s) will be adjusted.\n\nDo you want to complete this stock take?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          style: "destructive",
          onPress: async () => {
            try {
              for (const item of changedItems) {
                const oldQty = Number(item.quantity || 0);
                const countedQty = Number(item.countedQuantity || 0);
                const difference = countedQty - oldQty;

                await updateStockItem(item.id, {
                  quantity: countedQty,
                  category: item.category,
                  barcode: item.barcode || "",
                  unit: item.unit || "pcs",
                  costPrice: item.costPrice,
                  lowStockAlert: item.lowStockAlert,
                  idealStockLevel: item.idealStockLevel,
                  supplierName: item.supplierName,
                });

                if (difference !== 0) {
                  await saveStockMovement({
                    stockItemId: item.id,
                    itemName: item.name,
                    type: difference > 0 ? "IN" : "OUT",
                    quantity: Math.abs(difference),
                    source: "MANUAL_CORRECTION",
                    sourceLabel:
                      difference > 0
                        ? "Stock count adjustment - extra stock found"
                        : "Stock count adjustment - missing stock",
                    balanceAfter: countedQty,
                    referenceId: item.id,
                    referenceType: "ADJUSTMENT",
                    note: `Manual stock count adjusted from ${oldQty} to ${countedQty}`,
                  });
                }
              }

              Alert.alert("Success", "Stock take session completed.");
              router.replace("/(tabs)/stockList");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Could not complete stock take."
              );
            }
          },
        },
      ]
    );
  };

  const shareSessionReport = async () => {
    const checkedItems = items.filter((item) => item.checked);

    if (checkedItems.length === 0) {
      Alert.alert('No Report', 'No items have been checked yet.');
      return;
    }

    const message = [
      'StockTally Stock Take Session Report',
      '',
      `Checked: ${stats.checked}/${stats.total}`,
      `Differences: ${stats.differences}`,
      '',
      ...checkedItems.map((item, index) => {
        const unit = item.unit || 'pcs';
        const sign = item.difference > 0 ? '+' : '';

        return `${index + 1}. ${item.name}
        Expected: ${item.quantity} ${unit}
        Counted: ${item.countedQuantity} ${unit}
        Difference: ${sign}${item.difference} ${unit}`;
      }),
    ].join('\n');

    await Share.share({ message });
  };

  const renderItem = ({ item }: { item: StockTakeSessionItem }) => {
    const unit = item.unit || 'pcs';
    const hasDifference = item.checked && item.difference !== 0;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          item.checked && styles.checkedCard,
          hasDifference && styles.differenceCard,
        ]}
        onPress={() => openCountModal(item)}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>

          <View style={[styles.badge, item.checked ? styles.checkedBadge : styles.pendingBadge]}>
            <Text style={styles.badgeText}>{item.checked ? 'CHECKED' : 'COUNT'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Expected</Text>
          <Text style={styles.rowValue}>
            {item.quantity} {unit}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Counted</Text>
          <Text style={styles.rowValue}>
            {item.checked ? `${item.countedQuantity} ${unit}` : 'Not counted'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Difference</Text>
          <Text
            style={[
              styles.diffValue,
              item.difference < 0 && styles.negative,
              item.difference > 0 && styles.positive,
            ]}
          >
            {item.checked
              ? `${item.difference > 0 ? '+' : ''}${item.difference} ${unit}`
              : '-'}
          </Text>
        </View>

        {item.barcode ? <Text style={styles.barcode}>Barcode: {item.barcode}</Text> : null}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Starting stock take session...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Stock Take Session</Text>
            <Text style={styles.subtitle}>
              {stats.checked}/{stats.total} checked • {stats.differences} differences
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
              <Text style={styles.actionText}>📷 Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={shareSessionReport}>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.completeButton} onPress={completeSession}>
              <Text style={styles.actionText}>Complete</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No stock items found</Text>
                <Text style={styles.emptyText}>Add stock items first before starting a session.</Text>
              </View>
            }
          />
        </View>

        <Modal visible={scannerVisible} animationType="slide">
          <View style={styles.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
              }}
              onBarcodeScanned={
                scanned ? undefined : ({ data }) => handleBarcodeScanned(data)
              }
            />

            <View style={styles.scannerOverlay}>
              <Text style={styles.scannerTitle}>Scan item barcode</Text>
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

        <Modal visible={countModalVisible} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalOverlay}
            >
              <View style={styles.countCard}>
                <Text style={styles.countTitle}>Enter Count</Text>

                <Text style={styles.countItemName}>{selectedItem?.name}</Text>

                <Text style={styles.countInfo}>
                  Expected: {selectedItem?.quantity} {selectedItem?.unit || 'pcs'}
                </Text>

                <TextInput
                  value={countInput}
                  onChangeText={setCountInput}
                  keyboardType="numeric"
                  style={styles.countInput}
                  placeholder="Counted quantity"
                  autoFocus
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setCountModalVisible(false);
                      setSelectedItem(null);
                      setCountInput('');
                    }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveButton} onPress={saveCount}>
                    <Text style={styles.saveText}>Save Count</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    color: '#6b7280',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '900',
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkedCard: {
    borderColor: '#bbf7d0',
  },
  differenceCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fbbf24',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  category: {
    color: '#6b7280',
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  checkedBadge: {
    backgroundColor: '#16a34a',
  },
  pendingBadge: {
    backgroundColor: '#9ca3af',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  rowLabel: {
    color: '#6b7280',
    fontWeight: '700',
  },
  rowValue: {
    color: '#111827',
    fontWeight: '800',
  },
  diffValue: {
    color: '#111827',
    fontWeight: '900',
  },
  negative: {
    color: '#dc2626',
  },
  positive: {
    color: '#16a34a',
  },
  barcode: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 12,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
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
  closeButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  countCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
  },
  countTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },
  countItemName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  countInfo: {
    color: '#6b7280',
    marginBottom: 14,
    fontWeight: '700',
  },
  countInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  cancelText: {
    color: '#111827',
    fontWeight: '900',
  },
  saveText: {
    color: '#fff',
    fontWeight: '900',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default StockTakeSessionScreen;