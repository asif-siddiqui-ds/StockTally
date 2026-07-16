import ScreenWrapper from '@/components/ScreenWrapper';
import { getStockItems, StockItem, updateStockItem } from '@/lib/storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type StockTakeRow = StockItem & {
  countedQuantity: string;
  difference: number;
  checked: boolean;
};

const StockTakeScreen: React.FC = () => {
  const [rows, setRows] = useState<StockTakeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const loadStock = useCallback(async () => {
    try {
      const stock = await getStockItems();

      const prepared: StockTakeRow[] = stock
        .map((item) => ({
          ...item,
          countedQuantity: String(item.quantity),
          difference: 0,
          checked: false,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setRows(prepared);
    } catch (error: any) {
      console.error('Failed to load stock take:', error);
      Alert.alert('Error', error.message || 'Could not load stock items.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const stats = useMemo(() => {
    const total = rows.length;
    const checked = rows.filter((item) => item.checked).length;
    const discrepancies = rows.filter((item) => item.difference !== 0).length;

    return { total, checked, discrepancies };
  }, [rows]);

  const updateCountedQuantity = (id: string, text: string) => {
    setRows((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const counted = Number(text) || 0;

        return {
          ...item,
          countedQuantity: text,
          difference: counted - item.quantity,
          checked: true,
        };
      })
    );
  };

  const markAsChecked = (id: string) => {
    setRows((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const counted = Number(item.countedQuantity) || 0;

        return {
          ...item,
          difference: counted - item.quantity,
          checked: true,
        };
      })
    );
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

  const handleBarcodeScanned = (code: string) => {
    setScanned(true);
    setScannerVisible(false);

    const matched = rows.find(
      (item) => String(item.barcode || '').trim() === code.trim()
    );

    setTimeout(() => {
      if (!matched) {
        Alert.alert('No Match Found', `No stock item found for barcode: ${code}`);
        setScanned(false);
        return;
      }

      Alert.prompt(
        'Stock Count',
        `${matched.name}\nExpected: ${matched.quantity} ${matched.unit || 'pcs'}\nEnter counted quantity:`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Count',
            onPress: (value) => {
              updateCountedQuantity(matched.id, value || String(matched.quantity));
            },
          },
        ],
        'plain-text',
        String(matched.quantity),
        'number-pad'
      );

      setScanned(false);
    }, 400);
  };

  const completeStockTake = async () => {
    const changedItems = rows.filter((item) => item.checked && item.difference !== 0);

    if (changedItems.length === 0) {
      Alert.alert('No Adjustments', 'No stock differences found.');
      return;
    }

    Alert.alert(
      'Complete Stock Take',
      `${changedItems.length} item(s) will be adjusted to the counted quantity. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const item of changedItems) {
                await updateStockItem(item.id, {
                  quantity: Number(item.countedQuantity) || 0,
                  category: item.category,
                  barcode: item.barcode || '',
                  unit: item.unit || 'pcs',
                  costPrice: item.costPrice,
                  lowStockAlert: item.lowStockAlert,
                  idealStockLevel: item.idealStockLevel,
                  supplierName: item.supplierName,
                });
              }

              Alert.alert('Success', 'Stock take completed and stock updated.');
              router.replace('/(tabs)/stockList');
            } catch (error: any) {
              console.error('Stock take completion failed:', error);
              Alert.alert('Error', error.message || 'Could not complete stock take.');
            }
          },
        },
      ]
    );
  };

  const shareReport = async () => {
    const discrepancies = rows.filter((item) => item.difference !== 0);

    if (discrepancies.length === 0) {
      Alert.alert('No Differences', 'There are no differences to share.');
      return;
    }

    const message = [
      'StockTally Stock Take Report',
      '',
      ...discrepancies.map((item, index) => {
        const unit = item.unit || 'pcs';
        const sign = item.difference > 0 ? '+' : '';

        return `${index + 1}. ${item.name} | Expected: ${item.quantity} ${unit} | Counted: ${item.countedQuantity} ${unit} | Difference: ${sign}${item.difference} ${unit}`;
      }),
    ].join('\n');

    await Share.share({ message });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStock();
  };

  const renderItem = ({ item }: { item: StockTakeRow }) => {
    const unit = item.unit || 'pcs';
    const hasDifference = item.difference !== 0;

    return (
      <View style={[styles.card, hasDifference && styles.diffCard]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.checked ? styles.checkedBadge : styles.pendingBadge,
            ]}
          >
            <Text style={styles.statusText}>{item.checked ? 'CHECKED' : 'PENDING'}</Text>
          </View>
        </View>

        <View style={styles.expectedRow}>
          <Text style={styles.expectedText}>
            Expected: <Text style={styles.bold}>{item.quantity} {unit}</Text>
          </Text>

          {item.barcode ? <Text style={styles.barcodeText}>Barcode: {item.barcode}</Text> : null}
        </View>

        <Text style={styles.label}>Counted Quantity</Text>
        <TextInput
          value={item.countedQuantity}
          onChangeText={(text) => updateCountedQuantity(item.id, text)}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Actual count"
        />

        <View style={styles.resultRow}>
          <Text style={styles.diffLabel}>Difference</Text>
          <Text
            style={[
              styles.diffValue,
              item.difference < 0 && styles.negative,
              item.difference > 0 && styles.positive,
            ]}
          >
            {item.difference > 0 ? '+' : ''}
            {item.difference} {unit}
          </Text>
        </View>

        <TouchableOpacity style={styles.markButton} onPress={() => markAsChecked(item.id)}>
          <Text style={styles.markButtonText}>Mark Checked</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading stock take...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Stock Take</Text>
              <Text style={styles.subtitle}>
                {stats.checked}/{stats.total} checked • {stats.discrepancies} differences
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
              <Text style={styles.actionText}>📷 Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={shareReport}>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.completeButton} onPress={completeStockTake}>
              <Text style={styles.actionText}>Complete</Text>
            </TouchableOpacity>
          </View>

          {rows.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No stock items found</Text>
              <Text style={styles.emptyText}>
                Add stock items first before starting a stock take.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/screens/AddStockItem')}
              >
                <Text style={styles.primaryButtonText}>Add Stock Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          )}
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
                scanned
                  ? undefined
                  : ({ data }) => {
                      handleBarcodeScanned(data);
                    }
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
    fontWeight: '800',
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
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  diffCard: {
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  statusBadge: {
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
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  expectedRow: {
    marginBottom: 10,
  },
  expectedText: {
    color: '#374151',
    fontSize: 15,
  },
  bold: {
    fontWeight: '900',
  },
  barcodeText: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
  },
  label: {
    fontWeight: '800',
    marginBottom: 6,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  diffLabel: {
    fontWeight: '800',
    color: '#374151',
  },
  diffValue: {
    fontWeight: '900',
    color: '#111827',
  },
  negative: {
    color: '#dc2626',
  },
  positive: {
    color: '#16a34a',
  },
  markButton: {
    backgroundColor: '#111827',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  markButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
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
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  primaryButtonText: {
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
});

export default StockTakeScreen;