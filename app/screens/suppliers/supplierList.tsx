import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getSupplierStockInRecords,
  migrateLegacySupplierStockInOnce,
} from "@/lib/supplierStockInStorage";
import {
  deactivateSupplier,
  getSuppliers,
  reactivateSupplier,
} from "@/lib/supplierStorage";
import { getSupplierDisplayName, type Supplier } from "@/types/supplier";

import { SupplierStockIn } from "@/types/supplierStockIn";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Filter = "active" | "inactive" | "all";

type SupplierOutstandingMap = Record<string, number>;

const SupplierListScreen = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockInRecords, setStockInRecords] = useState<
    SupplierStockIn[]
  >([]);
  const [filter, setFilter] = useState<Filter>("active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      /*
       * Creates opening supplier delivery records for old stock
       * only once. Future stock-in records are saved individually.
       */
      await migrateLegacySupplierStockInOnce();

      const [supplierList, purchases] = await Promise.all([
        getSuppliers(),
        getSupplierStockInRecords(),
      ]);

      setSuppliers(supplierList);
      setStockInRecords(purchases);
    } catch (error: any) {
      console.error("Could not load suppliers:", error);

      Alert.alert(
        "Error",
        error.message || "Could not load suppliers.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const outstandingBySupplier =
    useMemo<SupplierOutstandingMap>(() => {
      const totals: SupplierOutstandingMap = {};

      for (const supplier of suppliers) {
        const normalisedSupplierName =
          getSupplierDisplayName(supplier)
            .trim()
            .toLowerCase();

        totals[supplier.id] = stockInRecords
          .filter((record) => {
            if (record.paymentStatus !== "unpaid") {
              return false;
            }

            if (
              record.supplierId &&
              record.supplierId === supplier.id
            ) {
              return true;
            }

            return (
              !record.supplierId &&
              Boolean(record.supplierName) &&
              record.supplierName
                ?.trim()
                .toLowerCase() === normalisedSupplierName
            );
          })
          .reduce(
            (sum, record) =>
              sum + Number(record.totalCost || 0),
            0,
          );
      }

      return totals;
    }, [stockInRecords, suppliers]);

  const totalOutstanding = useMemo(
    () =>
      Object.values(outstandingBySupplier).reduce(
        (sum, value) => sum + Number(value || 0),
        0,
      ),
    [outstandingBySupplier],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const statusMatch =
        filter === "all" ||
        (filter === "active"
          ? supplier.isActive
          : !supplier.isActive);

      const searchMatch =
        !query ||
        [
          supplier.companyName,
          supplier.contactName,
          supplier.supplierCode,
          supplier.email,
          supplier.phone,
          supplier.city,
          supplier.postcode,
        ].some((value) =>
          value?.toLowerCase().includes(query),
        );

      return statusMatch && searchMatch;
    });
  }, [suppliers, filter, search]);

  const toggleStatus = (supplier: Supplier) => {
    Alert.alert(
      supplier.isActive
        ? "Deactivate Supplier?"
        : "Reactivate Supplier?",
      supplier.isActive
        ? "The supplier will remain in history but be hidden from active lists."
        : "The supplier will return to active lists.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: supplier.isActive
            ? "Deactivate"
            : "Reactivate",
          style: supplier.isActive
            ? "destructive"
            : "default",
          onPress: async () => {
            try {
              if (supplier.isActive) {
                await deactivateSupplier(supplier.id);
              } else {
                await reactivateSupplier(supplier.id);
              }

              await load();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message ||
                  "Could not update supplier.",
              );
            }
          },
        },
      ],
    );
  };

  const formatMoney = (
    value: number,
    supplier?: Supplier,
  ) => {
    const symbol = supplier?.currencySymbol || "£";

    return `${symbol}${Number(value || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loading}>
            Loading suppliers...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const activeCount = suppliers.filter(
    (item) => item.isActive,
  ).length;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Suppliers</Text>

            <Text style={styles.subtitle}>
              {activeCount} active ·{" "}
              {suppliers.length - activeCount} inactive
            </Text>

            <Text style={styles.totalOutstanding}>
              Total outstanding:{" "}
              {formatMoney(totalOutstanding)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.add}
            onPress={() =>
              router.push("/screens/suppliers/create")
            }
          >
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholder="Search suppliers..."
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.filters}>
          {(
            ["active", "inactive", "all"] as Filter[]
          ).map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filter,
                filter === item && styles.filterActive,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item &&
                    styles.filterTextActive,
                ]}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏭</Text>

            <Text style={styles.emptyTitle}>
              No suppliers found
            </Text>

            <Text style={styles.emptyText}>
              Add your first supplier or change the
              current search and filter.
            </Text>
          </View>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingBottom: 120,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  await load();
                }}
              />
            }
            renderItem={({ item }) => {
              const outstanding =
                outstandingBySupplier[item.id] || 0;

              return (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname:
                        "/screens/suppliers/view",
                      params: {
                        id: item.id,
                      },
                    })
                  }
                >
                  <View style={styles.cardTop}>
                    <View style={styles.companyArea}>
                      <Text style={styles.company}>
                        {item.companyName}
                      </Text>

                      {item.contactName ? (
                        <Text style={styles.contact}>
                          {item.contactName}
                        </Text>
                      ) : null}
                    </View>

                    <View
                      style={[
                        styles.outstandingBadge,
                        outstanding > 0
                          ? styles.outstandingDue
                          : styles.outstandingClear,
                      ]}
                    >
                      <Text
                        style={
                          styles.outstandingBadgeLabel
                        }
                      >
                        Outstanding
                      </Text>

                      <Text
                        style={
                          styles.outstandingBadgeValue
                        }
                      >
                        {formatMoney(
                          outstanding,
                          item,
                        )}
                      </Text>
                    </View>
                  </View>

                  {item.supplierCode ? (
                    <Text style={styles.detail}>
                      Code: {item.supplierCode}
                    </Text>
                  ) : null}

                  {item.phone ? (
                    <Text style={styles.detail}>
                      Phone: {item.phone}
                    </Text>
                  ) : null}

                  {item.email ? (
                    <Text style={styles.detail}>
                      Email: {item.email}
                    </Text>
                  ) : null}

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.edit}
                      onPress={(event) => {
                        event.stopPropagation();

                        router.push({
                          pathname:
                            "/screens/suppliers/edit",
                          params: {
                            id: item.id,
                          },
                        });
                      }}
                    >
                      <Text style={styles.editText}>
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusAction,
                        {
                          backgroundColor:
                            item.isActive
                              ? "#dc2626"
                              : "#16a34a",
                        },
                      ]}
                      onPress={(event) => {
                        event.stopPropagation();
                        toggleStatus(item);
                      }}
                    >
                      <Text style={styles.statusText}>
                        {item.isActive
                          ? "Deactivate"
                          : "Reactivate"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: 3,
  },

  totalOutstanding: {
    color: "#dc2626",
    fontWeight: "900",
    marginTop: 6,
  },

  add: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },

  addText: {
    color: "#fff",
    fontWeight: "900",
  },

  search: {
    minHeight: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
    color: "#111827",
  },

  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  filter: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },

  filterActive: {
    backgroundColor: "#111827",
  },

  filterText: {
    color: "#374151",
    fontWeight: "800",
  },

  filterTextActive: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 13,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },

  companyArea: {
    flex: 1,
  },

  company: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },

  contact: {
    color: "#6b7280",
    marginTop: 3,
  },

  outstandingBadge: {
    minWidth: 112,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
    alignItems: "flex-end",
  },

  outstandingDue: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  outstandingClear: {
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  outstandingBadgeLabel: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "800",
  },

  outstandingBadgeValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },

  detail: {
    color: "#4b5563",
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  edit: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },

  editText: {
    color: "#111827",
    fontWeight: "900",
  },

  statusAction: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },

  statusText: {
    color: "#fff",
    fontWeight: "900",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loading: {
    color: "#6b7280",
    marginTop: 10,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginTop: 10,
  },

  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 7,
  },
});

export default SupplierListScreen;