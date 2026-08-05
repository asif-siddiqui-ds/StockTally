import ScreenWrapper from "@/components/ScreenWrapper";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { saveSupplier } from "@/lib/supplierStorage";
import {
  emptySupplierFormValues,
  SupplierFormValues,
} from "@/types/supplier";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CreateSupplierScreen = () => {
  const params = useLocalSearchParams<{
    returnTo?: string;
  }>();

  const [values, setValues] =
    useState<SupplierFormValues>({
      ...emptySupplierFormValues,
    });

  const [saving, setSaving] = useState(false);

  const onChange = <
    K extends keyof SupplierFormValues,
  >(
    field: K,
    value: SupplierFormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!values.companyName.trim()) {
      Alert.alert(
        "Company Name Required",
        "Please enter the supplier company name.",
      );
      return;
    }

    if (
      values.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.email.trim(),
      )
    ) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address.",
      );
      return;
    }

    try {
      setSaving(true);

      const supplier = await saveSupplier({
        userId: values.userId || "guest",
        type: values.type,

        companyName: values.companyName,
        contactName: values.contactName,
        supplierCode: values.supplierCode,

        email: values.email,
        phone: values.phone,
        website: values.website,

        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        city: values.city,
        county: values.county,
        postcode: values.postcode,
        country: values.country,

        taxNumber: values.taxNumber,

        currencyCode: values.currencyCode,
        currencySymbol: values.currencySymbol,
        locale: values.locale,

        paymentTerms: values.paymentTerms,
        customPaymentTermDays: values.customPaymentTermDays,

        openingBalance: values.openingBalance,
        creditLimit: values.creditLimit,

        notes: values.notes,
        isActive: values.isActive,
      });

      Alert.alert(
      "Supplier Added",
      `${supplier.companyName} was added successfully.`,
      [
        {
          text: "View Supplier",
          onPress: () => {
            router.replace({
              pathname: "/screens/suppliers/view",
              params: {
                id: supplier.id,
              },
            });
          },
        },
        {
          text: "Go Back",
          onPress: async () => {
            try {
              /*
              * When this screen was opened from Add Stock,
              * temporarily store the newly created supplier.
              *
              * Add Stock will read this value when it regains
              * focus and will automatically select the supplier.
              */
              if (params.returnTo === "addStock") {
                await AsyncStorage.setItem(
                  "stocktally_new_supplier_selection",
                  JSON.stringify({
                    id: supplier.id,
                    companyName: supplier.companyName,
                  }),
                );
              }

              router.back();
            } catch (error) {
              console.error(
                "Failed to prepare new supplier selection:",
                error,
              );

              router.back();
            }
          },
        },
      ],
      {
        cancelable: false,
      },
    );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ||
          "Could not save supplier.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            Add Supplier
          </Text>

          <Text style={styles.subtitle}>
            Store the supplier’s business and
            contact details.
          </Text>

          <SupplierForm
            values={values}
            onChange={onChange}
            disabled={saving}
            showCommercialDetails={false}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancel}
              disabled={saving}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveWrapper}
              disabled={saving}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  saving
                    ? ["#94a3b8", "#64748b"]
                    : ["#2563eb", "#1d4ed8"]
                }
                style={styles.save}
              >
                <Text style={styles.saveText}>
                  {saving
                    ? "Saving..."
                    : "Save Supplier"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  content: {
    backgroundColor: "#f8fafc",
    padding: 18,
    paddingBottom: 140,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 16,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  cancel: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelText: {
    color: "#111827",
    fontWeight: "900",
  },

  saveWrapper: {
    flex: 2,
  },

  save: {
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 16,
  },
});

export default CreateSupplierScreen;