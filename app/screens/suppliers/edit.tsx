import ScreenWrapper from "@/components/ScreenWrapper";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { getSupplierById, updateSupplier } from "@/lib/supplierStorage";
import { DEFAULT_SUPPLIER_PAYMENT_TERMS, emptySupplierFormValues, Supplier, SupplierFormValues } from "@/types/supplier";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const money = (value: string) => Number.isFinite(Number(value)) ? Number(value) : 0;

const EditSupplierScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [values, setValues] = useState<SupplierFormValues>({ ...emptySupplierFormValues });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) { Alert.alert("Error", "Supplier ID is missing."); router.back(); return; }
      try {
        const record = await getSupplierById(id);
        if (!record) { Alert.alert("Not Found", "Supplier could not be found."); router.back(); return; }
        setSupplier(record);
        setValues({
          ...emptySupplierFormValues,

          userId: record.userId || "guest",
          type: record.type || "business",

          companyName: record.companyName || "",
          contactName: record.contactName || "",
          supplierCode: record.supplierCode || "",

          email: record.email || "",
          phone: record.phone || "",
          website: record.website || "",

          addressLine1: record.addressLine1 || "",
          addressLine2: record.addressLine2 || "",
          city: record.city || "",
          county: record.county || "",
          postcode: record.postcode || "",
          country: record.country || "",

          taxNumber: record.taxNumber || "",

          currencyCode: record.currencyCode || "GBP",
          currencySymbol: record.currencySymbol || "£",
          locale: record.locale || "en-GB",

          paymentTerms:
            record.paymentTerms ||
            DEFAULT_SUPPLIER_PAYMENT_TERMS,

          customPaymentTermDays: Number(
            record.customPaymentTermDays ?? 30,
          ),

          openingBalance: Number(
            record.openingBalance ?? 0,
          ),

          creditLimit: Number(
            record.creditLimit ?? 0,
          ),

          notes: record.notes || "",

          isActive:
            record.isActive === undefined
              ? true
              : record.isActive,
        });
      } catch (error: any) { Alert.alert("Error", error.message || "Could not load supplier."); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const onChange = <K extends keyof SupplierFormValues>(field: K, value: SupplierFormValues[K]) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSave = async () => {
    if (!supplier) return;
    if (!values.companyName.trim()) { Alert.alert("Company Name Required", "Please enter the supplier company name."); return; }
    try {
      setSaving(true);
      await updateSupplier(supplier.id, {
        companyName: values.companyName, contactName: values.contactName, supplierCode: values.supplierCode,
        email: values.email, phone: values.phone, addressLine1: values.addressLine1, addressLine2: values.addressLine2,
        city: values.city, county: values.county, postcode: values.postcode, country: values.country,
        paymentTerms: values.paymentTerms, openingBalance: values.openingBalance, creditLimit: values.creditLimit,
        currencyCode: values.currencyCode || "GBP", currencySymbol: values.currencySymbol || "£", website: values.website,
        notes: values.notes, isActive: values.isActive,
      });
      Alert.alert("Updated", "Supplier details were updated.", [{ text: "OK", onPress: () => router.replace({ pathname: "/screens/suppliers/view", params: { id: supplier.id } }) }]);
    } catch (error: any) { Alert.alert("Error", error.message || "Could not update supplier."); }
    finally { setSaving(false); }
  };

  if (loading) return <ScreenWrapper><View style={styles.center}><ActivityIndicator size="large" /><Text style={styles.loading}>Loading supplier...</Text></View></ScreenWrapper>;

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Edit Supplier</Text>
          <Text style={styles.subtitle}>Update contact, payment and account details.</Text>
          <SupplierForm values={values} onChange={onChange} disabled={saving} />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} disabled={saving} onPress={() => router.back()}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={{ flex: 2 }} disabled={saving} onPress={handleSave} activeOpacity={0.85}>
              <LinearGradient colors={saving ? ["#94a3b8", "#64748b"] : ["#2563eb", "#1d4ed8"]} style={styles.save}>
                <Text style={styles.saveText}>{saving ? "Saving..." : "Save Changes"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: { backgroundColor: "#f8fafc", padding: 18, paddingBottom: 140 },
  title: { fontSize: 28, fontWeight: "900", color: "#111827" },
  subtitle: { color: "#6b7280", marginTop: 4, marginBottom: 16 },
  actions: { flexDirection: "row", gap: 12 },
  cancel: { flex: 1, backgroundColor: "#e5e7eb", borderRadius: 13, paddingVertical: 14, alignItems: "center" },
  cancelText: { color: "#111827", fontWeight: "900" },
  save: { borderRadius: 13, paddingVertical: 14, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { color: "#6b7280", marginTop: 10 },
});

export default EditSupplierScreen;
