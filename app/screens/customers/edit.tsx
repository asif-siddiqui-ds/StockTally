// app/screens/customers/edit.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import CustomerForm, {
  type CustomerFormValues,
} from "@/components/customers/CustomerForm";
import { getCachedUserId } from "@/context/AuthContext";
import { syncCustomerById } from "@/lib/appwriteCustomerService";
import {
  archiveCustomer,
  findPotentialDuplicateCustomer,
  getCustomerById,
  restoreCustomer,
  updateCustomer,
} from "@/lib/customerStorage";
import type { Customer } from "@/types/customer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  Stack,
  useLocalSearchParams,
} from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const customerToFormValues = (
  customer: Customer
): CustomerFormValues => ({
  type: customer.type,
  companyName: customer.companyName || "",
  contactName: customer.contactName || "",
  email: customer.email || "",
  phone: customer.phone || "",
  addressLine1: customer.addressLine1 || "",
  addressLine2: customer.addressLine2 || "",
  city: customer.city || "",
  county: customer.county || "",
  postcode: customer.postcode || "",
  country: customer.country || "",
  taxNumber: customer.taxNumber || "",
  currencyCode: customer.currencyCode || "GBP",
  currencySymbol: customer.currencySymbol || "£",
  locale: customer.locale || "en-GB",
  paymentTerms: customer.paymentTerms,
  customPaymentTermDays: customer.customPaymentTermDays,
  notes: customer.notes || "",
  customerCode: customer.customerCode || "",
  isActive: customer.isActive,
});

const EditCustomerScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const customerId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [customer, setCustomer] =
    useState<Customer | null>(null);
  const [values, setValues] =
    useState<CustomerFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (!customerId) {
          throw new Error("Customer ID is missing.");
        }

        const record = await getCustomerById(customerId);

        if (!record) {
          throw new Error("Customer could not be found.");
        }

        if (mounted) {
          setCustomer(record);
          setValues(customerToFormValues(record));
        }
      } catch (error) {
        Alert.alert(
          "Unable to open customer",
          error instanceof Error
            ? error.message
            : "Please try again.",
          [{ text: "Back", onPress: () => router.back() }]
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [customerId]);

  const performSave = async (
    allowPotentialDuplicate = false
  ) => {
    if (!customer || !values) return;

    setSaving(true);

    try {
      const updated = await updateCustomer(
        customer.id,
        values,
        { allowPotentialDuplicate }
      );

      if (!updated) {
        throw new Error("Customer could not be updated.");
      }

      setCustomer(updated);
      setValues(customerToFormValues(updated));

      const userId = await getCachedUserId();

      if (userId) {
        try {
          await syncCustomerById(updated.id, userId);
        } catch (syncError) {
          console.warn(
            "Customer updated locally but cloud sync failed:",
            syncError
          );
        }
      }

      Alert.alert(
        "Changes saved",
        "The customer record has been updated.",
        [{ text: "Done", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        "Unable to save changes",
        error instanceof Error
          ? error.message
          : "Please check the form and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!customer || !values || saving) return;

    if (
      values.type === "individual" &&
      !values.contactName?.trim()
    ) {
      Alert.alert(
        "Customer name required",
        "Enter the individual's full name."
      );
      return;
    }

    if (
      values.type === "business" &&
      !values.companyName?.trim() &&
      !values.contactName?.trim()
    ) {
      Alert.alert(
        "Customer details required",
        "Enter a company name or contact name."
      );
      return;
    }

    const duplicate = await findPotentialDuplicateCustomer(
      values,
      customer.id
    );

    if (duplicate) {
      const duplicateName =
        duplicate.customer.companyName ||
        duplicate.customer.contactName ||
        "Another customer";

      Alert.alert(
        "Possible duplicate",
        `${duplicateName} has matching ${duplicate.reason} details. Save these changes anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save anyway",
            onPress: () => performSave(true),
          },
        ]
      );
      return;
    }

    await performSave(false);
  };

  const handleStatusToggle = () => {
    if (!customer) return;

    const restoring = !customer.isActive;

    Alert.alert(
      restoring ? "Restore customer?" : "Archive customer?",
      restoring
        ? "This customer will return to the active list."
        : "The customer will be hidden from active lists but retained for invoice history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: restoring ? "Restore" : "Archive",
          style: restoring ? "default" : "destructive",
          onPress: async () => {
            try {
              const updated = restoring
                ? await restoreCustomer(customer.id)
                : await archiveCustomer(customer.id);

              if (!updated) {
                throw new Error("Customer could not be updated.");
              }

              setCustomer(updated);
              setValues(customerToFormValues(updated));
            } catch (error) {
              Alert.alert(
                "Unable to update status",
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

  const handleSync = async () => {
    if (!customer || syncing) return;

    setSyncing(true);

    try {
      const userId = await getCachedUserId();

      if (!userId) {
        Alert.alert(
          "Sign in required",
          "Please sign in before syncing this customer."
        );
        return;
      }

      const synced = await syncCustomerById(
        customer.id,
        userId
      );

      if (synced) {
        const refreshed = await getCustomerById(customer.id);
        if (refreshed) {
          setCustomer(refreshed);
          setValues(customerToFormValues(refreshed));
        }
      }

      Alert.alert(
        "Customer synced",
        "The customer is up to date in Appwrite."
      );
    } catch (error) {
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View
              style={[
                styles.container,
                {
                  paddingTop: Math.max(insets.top + 6, 14),
                  paddingBottom: Math.max(insets.bottom, 8),
                },
              ]}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  disabled={saving}
                  style={styles.headerButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={22}
                    color="#e2e8f0"
                  />
                </TouchableOpacity>

                <View style={styles.headerText}>
                  <Text style={styles.title}>Edit customer</Text>
                  <Text style={styles.subtitle}>
                    Update contact and invoice defaults.
                  </Text>
                </View>

                <TouchableOpacity
                  disabled={syncing || saving}
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

              {loading || !values ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color="#bfdbfe"
                  />
                  <Text style={styles.loadingText}>
                    Loading customer...
                  </Text>
                </View>
              ) : (
                <>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                  >
                    <View style={styles.statusCard}>
                      <View style={styles.statusLeft}>
                        <Ionicons
                          name={
                            customer?.synced
                              ? "cloud-done-outline"
                              : "cloud-upload-outline"
                          }
                          size={19}
                          color={
                            customer?.synced
                              ? "#86efac"
                              : "#fcd34d"
                          }
                        />
                        <View>
                          <Text style={styles.statusTitle}>
                            {customer?.synced
                              ? "Synced with Appwrite"
                              : "Local changes pending"}
                          </Text>
                          <Text style={styles.statusSubtitle}>
                            Customer code:{" "}
                            {customer?.customerCode || "Not assigned"}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={handleStatusToggle}
                        style={[
                          styles.statusAction,
                          customer?.isActive
                            ? styles.archiveAction
                            : styles.restoreAction,
                        ]}
                      >
                        <Ionicons
                          name={
                            customer?.isActive
                              ? "archive-outline"
                              : "refresh-outline"
                          }
                          size={16}
                          color={
                            customer?.isActive
                              ? "#fca5a5"
                              : "#86efac"
                          }
                        />
                        <Text
                          style={[
                            styles.statusActionText,
                            customer?.isActive
                              ? styles.archiveActionText
                              : styles.restoreActionText,
                          ]}
                        >
                          {customer?.isActive
                            ? "Archive"
                            : "Restore"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <CustomerForm
                      values={values}
                      onChange={setValues}
                      disabled={saving}
                      showActiveToggle
                    />
                  </ScrollView>

                  <View style={styles.footer}>
                    <TouchableOpacity
                      disabled={saving}
                      onPress={() => router.back()}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelText}>
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={saving}
                      onPress={handleSave}
                      style={[
                        styles.saveButton,
                        saving && styles.saveButtonDisabled,
                      ]}
                    >
                      {saving ? (
                        <ActivityIndicator
                          size="small"
                          color="#0f172a"
                        />
                      ) : (
                        <Ionicons
                          name="save-outline"
                          size={20}
                          color="#0f172a"
                        />
                      )}
                      <Text style={styles.saveText}>
                        {saving ? "Saving..." : "Save changes"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ScreenWrapper>
    </>
  );
};

export default EditCustomerScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
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
    fontSize: 21,
    fontWeight: "900",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 10,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  statusCard: {
    minHeight: 66,
    borderRadius: 16,
    paddingHorizontal: 13,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.54)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.12)",
  },
  statusLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  statusTitle: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "800",
  },
  statusSubtitle: {
    color: "#94a3b8",
    fontSize: 9,
    marginTop: 3,
  },
  statusAction: {
    minHeight: 36,
    borderRadius: 11,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  archiveAction: {
    backgroundColor: "rgba(127,29,29,0.2)",
  },
  restoreAction: {
    backgroundColor: "rgba(20,83,45,0.25)",
  },
  statusActionText: {
    fontSize: 9,
    fontWeight: "800",
  },
  archiveActionText: {
    color: "#fca5a5",
  },
  restoreActionText: {
    color: "#86efac",
  },
  footer: {
    paddingTop: 9,
    flexDirection: "row",
    gap: 9,
  },
  cancelButton: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.62)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  cancelText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800",
  },
  saveButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#dbeafe",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "900",
  },
});
