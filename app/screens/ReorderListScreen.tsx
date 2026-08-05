// import ScreenWrapper from '@/components/ScreenWrapper';
// import { getStockItems, StockItem } from '@/lib/storage';
// import { useFocusEffect } from "@react-navigation/native";
// import { router } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   RefreshControl,
//   Share,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// type ReorderItem = StockItem & {
//   reorderQty: number;
//   alertLevel: number;
//   idealLevel: number;
// }

// const ReorderListScreen: React.FC = () => {
//   const [items, setItems] = useState<ReorderItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   useFocusEffect(
//     useCallback(() => {
//       const loadItems = async () => { 
//         const stock = await getStockItems();
//         try {

//           const reorderItems: ReorderItem[] = stock
//           .map((item) => {
//             const alertLevel = item.lowStockAlert ?? 0;
//             const idealLevel = item.idealStockLevel ?? alertLevel;
//             const reorderQty = Math.max(idealLevel - item.quantity, 0);

//             return {
//               ...item,
//               alertLevel,
//               idealLevel,
//               reorderQty,
//             };
//           })
//           .filter((item) => item.lowStockAlert !== undefined && item.quantity <= item.alertLevel)
//           .sort((a, b) => a.quantity - b.quantity);

//           setItems(reorderItems);
//         } catch (error: any) {
//           console.error('Failed to load reorder items:', error);
//           Alert.alert('Error', error.message || 'Failed to load reorder list.');
//         } finally {
//           setLoading(false);
//           setRefreshing(false);
//         }
//       };
//       loadItems();
//     }, [])
//   );

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadReorderItems();
//   };

//   const handleEdit = (id: string) => {
//     router.push(`/screens/stock/${id}`);
//   };


//   const handleShare = async () => {
//     if (items.length === 0) {
//       Alert.alert('No Items', 'There are no low stock items to share.');
//       return;
//     }

//     const message = [
//       'StockTally Reorder List',
//       '',
//       ...items.map((item, index) => {
//         const unit = item.unit || 'pcs';
//         const supplier = item.supplierName ? ` | Supplier: ${item.supplierName}` : '';

//         return `${index + 1}. ${item.name} - Current: ${item.quantity} ${unit}, Alert: ${item.alertLevel} ${unit}, Reorder: ${item.reorderQty} ${unit}${supplier}`;
//       }),
//     ].join('\n');

//     await Share.share({ message });
//   };

//   const renderItem = ({ item }: { item: ReorderItem }) => {
//     const unit = item.unit || 'pcs';
//     const isOutOfStock = item.quantity <= 0;

//     return (
//       <View style={[styles.card, isOutOfStock && styles.outOfStockCard]}>
//         <View style={styles.cardTopRow}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.itemName}>{item.name}</Text>
//             <Text style={styles.category}>{item.category}</Text>
//           </View>

//           <View style={[styles.badge, isOutOfStock ? styles.redBadge : styles.orangeBadge]}>
//             <Text style={styles.badgeText}>{isOutOfStock ? 'OUT' : 'LOW'}</Text>
//           </View>
//         </View>

//         <View style={styles.statsRow}>
//           <View style={styles.statBox}>
//             <Text style={styles.statLabel}>Current</Text>
//             <Text style={styles.statValue}>
//               {item.quantity} {unit}
//             </Text>
//           </View>

//           <View style={styles.statBox}>
//             <Text style={styles.statLabel}>Alert</Text>
//             <Text style={styles.statValue}>
//               {item.alertLevel} {unit}
//             </Text>
//           </View>

//           <View style={styles.statBox}>
//             <Text style={styles.statLabel}>Order</Text>
//             <Text style={styles.reorderValue}>
//               {item.reorderQty} {unit}
//             </Text>
//           </View>
//         </View>

//         {item.supplierName ? (
//           <Text style={styles.supplier}>Supplier: {item.supplierName}</Text>
//         ) : (
//           <Text style={styles.noSupplier}>No supplier added</Text>
//         )}

//         <TouchableOpacity
//           style={styles.updateButton}
//           onPress={() => handleEdit(item.id)}
//         >
//           <Text style={styles.updateButtonText}>Update Stock</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <ScreenWrapper>
//         <View style={styles.center}>
//           <ActivityIndicator size="large" />
//           <Text style={styles.loadingText}>Loading reorder list...</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <View>
//             <Text style={styles.title}>Reorder List</Text>
//             <Text style={styles.subtitle}>
//               {items.length} item{items.length === 1 ? '' : 's'} need attention
//             </Text>
//           </View>

//           <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
//             <Text style={styles.shareButtonText}>Share</Text>
//           </TouchableOpacity>
//         </View>

//         {items.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyIcon}>✅</Text>
//             <Text style={styles.emptyTitle}>All stock levels look good</Text>
//             <Text style={styles.emptyText}>
//               Items will appear here when their quantity reaches the low stock alert level.
//             </Text>
//             <TouchableOpacity
//               style={styles.primaryButton}
//               onPress={() => router.push('/screens/stock/add')}
//             >
//               <Text style={styles.primaryButtonText}>Add / Update Stock</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <FlatList
//             data={items}
//             keyExtractor={(item) => item.id}
//             renderItem={renderItem}
//             contentContainerStyle={styles.listContent}
//             refreshControl={
//               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//             }
//           />
//         )}
//       </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 18,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 18,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#111827',
//   },
//   subtitle: {
//     marginTop: 4,
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   shareButton: {
//     backgroundColor: '#111827',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 10,
//   },
//   shareButtonText: {
//     color: '#fff',
//     fontWeight: '700',
//   },
//   listContent: {
//     paddingBottom: 30,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   outOfStockCard: {
//     borderColor: '#fecaca',
//     backgroundColor: '#fff7f7',
//   },
//   cardTopRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   itemName: {
//     fontSize: 19,
//     fontWeight: '800',
//     color: '#111827',
//   },
//   category: {
//     marginTop: 3,
//     color: '#6b7280',
//     fontSize: 14,
//   },
//   badge: {
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 999,
//   },
//   redBadge: {
//     backgroundColor: '#dc2626',
//   },
//   orangeBadge: {
//     backgroundColor: '#f97316',
//   },
//   badgeText: {
//     color: '#fff',
//     fontWeight: '800',
//     fontSize: 12,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 12,
//   },
//   statBox: {
//     flex: 1,
//     backgroundColor: '#f3f4f6',
//     borderRadius: 12,
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#6b7280',
//     marginBottom: 4,
//   },
//   statValue: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: '#111827',
//   },
//   reorderValue: {
//     fontSize: 15,
//     fontWeight: '900',
//     color: '#2563eb',
//   },
//   supplier: {
//     marginTop: 2,
//     color: '#374151',
//     fontWeight: '600',
//   },
//   noSupplier: {
//     marginTop: 2,
//     color: '#9ca3af',
//     fontStyle: 'italic',
//   },
//   updateButton: {
//     marginTop: 14,
//     backgroundColor: '#2563eb',
//     borderRadius: 12,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   updateButtonText: {
//     color: '#fff',
//     fontWeight: '800',
//     fontSize: 15,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 22,
//   },
//   emptyIcon: {
//     fontSize: 48,
//     marginBottom: 14,
//   },
//   emptyTitle: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: '#111827',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptyText: {
//     color: '#6b7280',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   primaryButton: {
//     backgroundColor: '#111827',
//     paddingHorizontal: 20,
//     paddingVertical: 13,
//     borderRadius: 12,
//   },
//   primaryButtonText: {
//     color: '#fff',
//     fontWeight: '800',
//   },
//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#6b7280',
//   },
// });

// export default ReorderListScreen;

import ScreenWrapper from "@/components/ScreenWrapper";
import { getStockItems, StockItem } from "@/lib/storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ReorderItem = StockItem & {
  reorderQty: number;
  alertLevel: number;
  idealLevel: number;
};

const ReorderListScreen: React.FC = () => {
  const [items, setItems] = useState<ReorderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReorderItems = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const stock = await getStockItems();

        const reorderItems: ReorderItem[] = stock
          .map((item) => {
            const quantity = Number(item.quantity ?? 0);
            const alertLevel = Number(item.lowStockAlert ?? 0);

            const idealLevel = Number(
              item.idealStockLevel ?? alertLevel
            );

            const reorderQty = Math.max(
              idealLevel - quantity,
              0
            );

            return {
              ...item,
              quantity,
              alertLevel,
              idealLevel,
              reorderQty,
            };
          })
          .filter((item) => {
            return (
              item.lowStockAlert !== undefined &&
              item.quantity <= item.alertLevel
            );
          })
          .sort((a, b) => a.quantity - b.quantity);

        setItems(reorderItems);
      } catch (error: unknown) {
        console.error(
          "Failed to load reorder items:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load reorder list.";

        Alert.alert("Error", message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      void loadReorderItems(true);
    }, [loadReorderItems])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReorderItems();
  }, [loadReorderItems]);

  const handleEdit = (id: string) => {
    router.push(`/screens/stock/${id}`);
  };

  const handleShare = async () => {
    if (items.length === 0) {
      Alert.alert(
        "No Items",
        "There are no low stock items to share."
      );
      return;
    }

    try {
      const message = [
        "StockTally Reorder List",
        "",
        ...items.map((item, index) => {
          const unit = item.unit?.trim() || "pcs";

          const supplier = item.supplierName
            ? ` | Supplier: ${item.supplierName}`
            : "";

          return [
            `${index + 1}. ${item.name}`,
            `Current: ${item.quantity} ${unit}`,
            `Alert: ${item.alertLevel} ${unit}`,
            `Reorder: ${item.reorderQty} ${unit}${supplier}`,
          ].join(" - ");
        }),
      ].join("\n");

      await Share.share({ message });
    } catch (error) {
      console.error(
        "Failed to share reorder list:",
        error
      );

      Alert.alert(
        "Share Failed",
        "The reorder list could not be shared."
      );
    }
  };

  const renderItem = ({
    item,
  }: {
    item: ReorderItem;
  }) => {
    const unit = item.unit?.trim() || "pcs";
    const isOutOfStock = item.quantity <= 0;

    return (
      <View
        style={[
          styles.card,
          isOutOfStock && styles.outOfStockCard,
        ]}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.itemDetails}>
            <Text
              style={styles.itemName}
              numberOfLines={2}
            >
              {item.name}
            </Text>

            {item.category ? (
              <Text
                style={styles.category}
                numberOfLines={1}
              >
                {item.category}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.badge,
              isOutOfStock
                ? styles.redBadge
                : styles.orangeBadge,
            ]}
          >
            <Text style={styles.badgeText}>
              {isOutOfStock ? "OUT" : "LOW"}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>
              Current
            </Text>

            <Text style={styles.statValue}>
              {item.quantity} {unit}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>
              Alert
            </Text>

            <Text style={styles.statValue}>
              {item.alertLevel} {unit}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>
              Order
            </Text>

            <Text style={styles.reorderValue}>
              {item.reorderQty} {unit}
            </Text>
          </View>
        </View>

        {item.supplierName ? (
          <Text
            style={styles.supplier}
            numberOfLines={2}
          >
            Supplier: {item.supplierName}
          </Text>
        ) : (
          <Text style={styles.noSupplier}>
            No supplier added
          </Text>
        )}

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => handleEdit(item.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.updateButtonText}>
            Update Stock
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Loading reorder list...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Reorder List
            </Text>

            <Text style={styles.subtitle}>
              {items.length} item
              {items.length === 1 ? "" : "s"} need
              attention
            </Text>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={styles.shareButtonText}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              ✅
            </Text>

            <Text style={styles.emptyTitle}>
              All stock levels look good
            </Text>

            <Text style={styles.emptyText}>
              Items will appear here when their
              quantity reaches the low stock alert
              level.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push("/screens/stock/add")
              }
              activeOpacity={0.85}
            >
              <Text
                style={styles.primaryButtonText}
              >
                Add / Update Stock
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={
              styles.listContent
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },

  shareButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  shareButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  listContent: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  outOfStockCard: {
    borderColor: "#fecaca",
    backgroundColor: "#fff7f7",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  itemDetails: {
    flex: 1,
    paddingRight: 10,
  },

  itemName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },

  category: {
    marginTop: 3,
    color: "#6b7280",
    fontSize: 14,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  redBadge: {
    backgroundColor: "#dc2626",
  },

  orangeBadge: {
    backgroundColor: "#f97316",
  },

  badgeText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },

  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },

  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  reorderValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#2563eb",
  },

  supplier: {
    marginTop: 2,
    color: "#374151",
    fontWeight: "600",
  },

  noSupplier: {
    marginTop: 2,
    color: "#9ca3af",
    fontStyle: "italic",
  },

  updateButton: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  updateButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },
});

export default ReorderListScreen;