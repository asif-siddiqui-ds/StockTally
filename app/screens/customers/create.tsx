// app/screens/customers/create.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import CustomerForm, {
  type CustomerFormValues,
} from "@/components/customers/CustomerForm";
import { getCachedUserId } from "@/context/AuthContext";
import { syncCustomerById } from "@/lib/appwriteCustomerService";
import {
  findPotentialDuplicateCustomer,
  getNextCustomerCode,
  saveCustomer,
} from "@/lib/customerStorage";
import { DEFAULT_CUSTOMER_PAYMENT_TERMS } from "@/types/customer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
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

const initialValues: CustomerFormValues = {
  type: "business",
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  county: "",
  postcode: "",
  country: "United Kingdom",
  taxNumber: "",
  currencyCode: "GBP",
  currencySymbol: "£",
  locale: "en-GB",
  paymentTerms: DEFAULT_CUSTOMER_PAYMENT_TERMS,
  customPaymentTermDays: undefined,
  notes: "",
  customerCode: "",
  isActive: true,
};

const CreateCustomerScreen = () => {
  const insets = useSafeAreaInsets();
  const [values, setValues] =
    useState<CustomerFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [loadingCode, setLoadingCode] = useState(true);

  useEffect(() => {
    let mounted = true;

    const prepareCode = async () => {
      try {
        const code = await getNextCustomerCode();
        if (mounted) {
          setValues((current) => ({
            ...current,
            customerCode: code,
          }));
        }
      } finally {
        if (mounted) setLoadingCode(false);
      }
    };

    prepareCode();

    return () => {
      mounted = false;
    };
  }, []);

  const performSave = async (
    allowPotentialDuplicate = false
  ) => {
    setSaving(true);

    try {
      const userId = (await getCachedUserId()) || "guest";

      const customer = await saveCustomer(
        {
          ...values,
          userId,
        },
        {
          allowPotentialDuplicate,
          generateCustomerCode: true,
        }
      );

      if (userId !== "guest") {
        try {
          await syncCustomerById(customer.id, userId);
        } catch (syncError) {
          console.warn(
            "Customer saved locally but cloud sync failed:",
            syncError
          );
        }
      }

      Alert.alert(
        "Customer created",
        "The customer has been saved successfully.",
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Unable to create customer",
        error instanceof Error
          ? error.message
          : "Please check the form and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

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

    if (
      values.paymentTerms === "custom" &&
      Number(values.customPaymentTermDays || 0) < 0
    ) {
      Alert.alert(
        "Invalid payment terms",
        "Custom payment days cannot be negative."
      );
      return;
    }

    const duplicate =
      await findPotentialDuplicateCustomer(values);

    if (duplicate) {
      const duplicateName =
        duplicate.customer.companyName ||
        duplicate.customer.contactName ||
        "This customer";

      Alert.alert(
        "Possible duplicate",
        `${duplicateName} may already exist because the ${duplicate.reason} matches. Save another customer anyway?`,
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
                  <Text style={styles.title}>Add customer</Text>
                  <Text style={styles.subtitle}>
                    Create a reusable customer profile for invoices.
                  </Text>
                </View>

                <View style={styles.headerButtonPlaceholder} />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {loadingCode ? (
                  <View style={styles.codeLoading}>
                    <ActivityIndicator
                      size="small"
                      color="#bfdbfe"
                    />
                    <Text style={styles.codeLoadingText}>
                      Preparing customer code...
                    </Text>
                  </View>
                ) : null}

                <CustomerForm
                  values={values}
                  onChange={setValues}
                  disabled={saving}
                />
              </ScrollView>


              <View style={styles.footer}>
                <TouchableOpacity
                  disabled={saving}
                  onPress={() => router.back()}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={saving || loadingCode}
                  onPress={handleSave}
                  style={[
                    styles.saveButton,
                    (saving || loadingCode) &&
                      styles.saveButtonDisabled,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color="#0f172a"
                    />
                  ) : (
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#0f172a"
                    />
                  )}
                  <Text style={styles.saveText}>
                    {saving ? "Saving..." : "Save customer"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ScreenWrapper>
    </>
  );
};

export default CreateCustomerScreen;

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
  headerButtonPlaceholder: {
    width: 42,
    height: 42,
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
  scrollContent: {
    paddingBottom: 10,
  },
  codeLoading: {
    minHeight: 42,
    borderRadius: 13,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15,23,42,0.48)",
  },
  codeLoadingText: {
    color: "#cbd5e1",
    fontSize: 10,
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


// import {
//   Text,
//   View
// } from "react-native";
// export default function CreateCustomer() {
//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text>Create Customer</Text>
//     </View>
//   );
// }