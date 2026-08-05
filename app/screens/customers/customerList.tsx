// app/screens/customers/index.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import {
  archiveCustomer,
  getCustomers,
  restoreCustomer,
  searchCustomers,
} from "@/lib/customerStorage";
import { syncCustomers } from "@/lib/appwriteCustomerService";
import type { Customer } from "@/types/customer";
import {
  getCustomerDisplayName,
  getCustomerSecondaryLabel,
} from "@/types/customer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useFocusEffect } from "expo-router";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CustomerFilter = "active" | "archived" | "all";

const CustomerListScreen = () => {
  const insets = useSafeAreaInsets();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] =
    useState<CustomerFilter>("active");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const includeInactive = filter !== "active";

      const records = searchText.trim()
        ? await searchCustomers(
            searchText,
            includeInactive
          )
        : await getCustomers(includeInactive);

      const filtered = records.filter((customer) => {
        if (filter === "active") return customer.isActive;
        if (filter === "archived") return !customer.isActive;
        return true;
      });

      setCustomers(filtered);
    } catch (error) {
      console.error("❌ Failed to load customers:", error);
      Alert.alert(
        "Unable to load customers",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, searchText]);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomers();
  }, [loadCustomers]);

  const handleSync = async () => {
    try {
      setSyncing(true);

      // Replace this with your authenticated user ID getter if required.
      const { getCachedUserId } =
        await import("@/context/AuthContext");
      const userId = await getCachedUserId();

      if (!userId) {
        Alert.alert(
          "Sign in required",
          "Please sign in before syncing customers."
        );
        return;
      }

      const result = await syncCustomers(userId);

      await loadCustomers();

      Alert.alert(
        "Customers synced",
        `${result.upload.uploaded} uploaded and ${result.download.downloaded} downloaded.`
      );
    } catch (error) {
      console.error("❌ Customer sync failed:", error);
      Alert.alert(
        "Sync failed",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleArchiveToggle = (
    customer: Customer
  ) => {
    const isArchived = !customer.isActive;

    Alert.alert(
      isArchived
        ? "Restore customer?"
        : "Archive customer?",
      isArchived
        ? `${getCustomerDisplayName(
            customer
          )} will return to the active customer list.`
        : `${getCustomerDisplayName(
            customer
          )} will be hidden from the active list but kept for invoice history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isArchived ? "Restore" : "Archive",
          style: isArchived
            ? "default"
            : "destructive",
          onPress: async () => {
            try {
              if (isArchived) {
                await restoreCustomer(customer.id);
              } else {
                await archiveCustomer(customer.id);
              }

              await loadCustomers();
            } catch (error) {
              Alert.alert(
                "Unable to update customer",
                error instanceof Error
                  ? error.message
                  : "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const counts = useMemo(() => {
    const active = customers.filter(
      (customer) => customer.isActive
    ).length;
    const archived = customers.filter(
      (customer) => !customer.isActive
    ).length;

    return {
      total: customers.length,
      active,
      archived,
    };
  }, [customers]);

  const renderCustomer = ({
    item,
  }: {
    item: Customer;
  }) => {
    const primaryName = getCustomerDisplayName(item);
    const secondaryName =
      getCustomerSecondaryLabel(item);

    const location = [
      item.city,
      item.postcode,
      item.country,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() =>
          router.push({
            pathname:
              "/screens/customers/[id]",
            params: { id: item.id },
          })
        }
        style={[
          styles.customerCard,
          !item.isActive &&
            styles.customerCardArchived,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {primaryName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase() || "CU"}
          </Text>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.customerNameRow}>
            <Text
              style={styles.customerName}
              numberOfLines={1}
            >
              {primaryName}
            </Text>

            {!item.isActive && (
              <View style={styles.archivedBadge}>
                <Text style={styles.archivedBadgeText}>
                  Archived
                </Text>
              </View>
            )}
          </View>

          {!!secondaryName && (
            <Text
              style={styles.customerSecondary}
              numberOfLines={1}
            >
              {secondaryName}
            </Text>
          )}

          <View style={styles.metaRow}>
            {!!item.email && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="mail-outline"
                  size={13}
                  color="#94a3b8"
                />
                <Text
                  style={styles.metaText}
                  numberOfLines={1}
                >
                  {item.email}
                </Text>
              </View>
            )}

            {!!item.phone && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="call-outline"
                  size={13}
                  color="#94a3b8"
                />
                <Text
                  style={styles.metaText}
                  numberOfLines={1}
                >
                  {item.phone}
                </Text>
              </View>
            )}

            {!!location && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color="#94a3b8"
                />
                <Text
                  style={styles.metaText}
                  numberOfLines={1}
                >
                  {location}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.codeBlock}>
              <Text style={styles.codeLabel}>
                Customer code
              </Text>
              <Text style={styles.codeValue}>
                {item.customerCode || "—"}
              </Text>
            </View>

            <View style={styles.placeholderBalance}>
              <Text style={styles.balanceLabel}>
                Outstanding
              </Text>
              <Text style={styles.balanceValue}>
                £0.00
              </Text>
            </View>

            <View style={styles.syncStatus}>
              <Ionicons
                name={
                  item.synced
                    ? "cloud-done-outline"
                    : "cloud-upload-outline"
                }
                size={15}
                color={
                  item.synced
                    ? "#86efac"
                    : "#fcd34d"
                }
              />
              <Text
                style={[
                  styles.syncText,
                  item.synced
                    ? styles.syncTextDone
                    : styles.syncTextPending,
                ]}
              >
                {item.synced
                  ? "Synced"
                  : "Pending"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            handleArchiveToggle(item)
          }
          style={styles.moreButton}
        >
          <Ionicons
            name={
              item.isActive
                ? "archive-outline"
                : "refresh-outline"
            }
            size={19}
            color={
              item.isActive
                ? "#fca5a5"
                : "#86efac"
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false }}
      />

      <ScreenWrapper>
        <LinearGradient
          colors={[
            "#0d1b2a",
            "#1b263b",
            "#415a77",
          ]}
          style={styles.gradient}
        >
          <View
            style={[
              styles.container,
              {
                paddingTop: Math.max(
                  insets.top + 6,
                  14
                ),
                paddingBottom: Math.max(
                  insets.bottom + 8,
                  12
                ),
              },
            ]}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color="#e2e8f0"
                />
              </TouchableOpacity>

              <View style={styles.headerText}>
                <Text style={styles.title}>
                  Customers
                </Text>
                <Text style={styles.subtitle}>
                  Manage customer records and invoice
                  contacts
                </Text>
              </View>

              <TouchableOpacity
                disabled={syncing}
                onPress={handleSync}
                style={styles.headerButton}
              >
                {syncing ? (
                  <ActivityIndicator
                    size="small"
                    color="#bfdbfe"
                  />
                ) : (
                  <Ionicons
                    name="sync-outline"
                    size={22}
                    color="#bfdbfe"
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons
                  name="search-outline"
                  size={19}
                  color="#94a3b8"
                />

                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search customers..."
                  placeholderTextColor="#64748b"
                  style={styles.searchInput}
                  returnKeyType="search"
                />

                {!!searchText && (
                  <TouchableOpacity
                    onPress={() =>
                      setSearchText("")
                    }
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/screens/customers/create"
                  )
                }
                style={styles.addButton}
              >
                <Ionicons
                  name="add"
                  size={23}
                  color="#0f172a"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.filterRow}>
              {(
                [
                  ["active", "Active"],
                  ["archived", "Archived"],
                  ["all", "All"],
                ] as Array<
                  [CustomerFilter, string]
                >
              ).map(([value, label]) => {
                const selected = filter === value;

                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() =>
                      setFilter(value)
                    }
                    style={[
                      styles.filterButton,
                      selected &&
                        styles.filterButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selected &&
                          styles.filterTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.summaryStrip}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  Showing
                </Text>
                <Text style={styles.summaryValue}>
                  {counts.total}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  Active
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    styles.summaryValueActive,
                  ]}
                >
                  {counts.active}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  Archived
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    styles.summaryValueArchived,
                  ]}
                >
                  {counts.archived}
                </Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color="#bfdbfe"
                />
                <Text style={styles.loadingText}>
                  Loading customers...
                </Text>
              </View>
            ) : (
              <FlatList
                data={customers}
                keyExtractor={(item) => item.id}
                renderItem={renderCustomer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.listContent,
                  customers.length === 0 &&
                    styles.listEmptyContent,
                ]}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#bfdbfe"
                  />
                }
                ListEmptyComponent={
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIcon}>
                      <Ionicons
                        name="people-outline"
                        size={38}
                        color="#bfdbfe"
                      />
                    </View>

                    <Text style={styles.emptyTitle}>
                      {searchText.trim()
                        ? "No matching customers"
                        : filter === "archived"
                        ? "No archived customers"
                        : "No customers yet"}
                    </Text>

                    <Text style={styles.emptyText}>
                      {searchText.trim()
                        ? "Try another name, email, phone number or customer code."
                        : "Create your first customer to reuse their details across invoices."}
                    </Text>

                    {!searchText.trim() &&
                      filter !== "archived" && (
                        <TouchableOpacity
                          onPress={() =>
                            router.push(
                              "/screens/customers/create"
                            )
                          }
                          style={styles.emptyAddButton}
                        >
                          <Ionicons
                            name="person-add-outline"
                            size={20}
                            color="#0f172a"
                          />
                          <Text
                            style={
                              styles.emptyAddButtonText
                            }
                          >
                            Add first customer
                          </Text>
                        </TouchableOpacity>
                      )}
                  </View>
                }
              />
            )}
          </View>
        </LinearGradient>
      </ScreenWrapper>
    </>
  );
};

export default CustomerListScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.52)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  headerText: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 11,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15,23,42,0.58)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 13,
    paddingVertical: 11,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
  },
  filterRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.44)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  filterButtonSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  filterText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "700",
  },
  filterTextSelected: {
    color: "#0f172a",
  },
  summaryStrip: {
    minHeight: 62,
    borderRadius: 15,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.5)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.12)",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },
  summaryValueActive: {
    color: "#86efac",
  },
  summaryValueArchived: {
    color: "#fca5a5",
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 26,
  },
  listEmptyContent: {
    flexGrow: 1,
  },
  customerCard: {
    borderRadius: 17,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(15,23,42,0.54)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.12)",
  },
  customerCardArchived: {
    opacity: 0.72,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.18)",
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.2)",
  },
  avatarText: {
    color: "#dbeafe",
    fontSize: 15,
    fontWeight: "900",
  },
  customerInfo: {
    flex: 1,
    marginLeft: 11,
  },
  customerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  customerName: {
    flexShrink: 1,
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
  },
  archivedBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: "rgba(127,29,29,0.24)",
  },
  archivedBadgeText: {
    color: "#fca5a5",
    fontSize: 8,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  customerSecondary: {
    color: "#bfdbfe",
    fontSize: 11,
    marginTop: 2,
  },
  metaRow: {
    marginTop: 9,
    gap: 5,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    flexShrink: 1,
    color: "#94a3b8",
    fontSize: 10,
  },
  cardFooter: {
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.14)",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  codeBlock: {
    flex: 1,
  },
  codeLabel: {
    color: "#64748b",
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  codeValue: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  placeholderBalance: {
    alignItems: "flex-end",
  },
  balanceLabel: {
    color: "#64748b",
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  balanceValue: {
    color: "#fcd34d",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  syncStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  syncText: {
    fontSize: 8,
    fontWeight: "700",
  },
  syncTextDone: {
    color: "#86efac",
  },
  syncTextPending: {
    color: "#fcd34d",
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    backgroundColor: "rgba(15,23,42,0.42)",
  },
  emptyCard: {
    flex: 1,
    minHeight: 330,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "rgba(15,23,42,0.45)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.12)",
  },
  emptyIcon: {
    width: 74,
    height: 74,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 17,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },
  emptyAddButton: {
    minHeight: 46,
    borderRadius: 13,
    paddingHorizontal: 16,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#dbeafe",
  },
  emptyAddButtonText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800",
  },
});