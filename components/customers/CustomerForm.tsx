// components/customers/CustomerForm.tsx
import type {
  CreateCustomerInput,
  CustomerPaymentTerms,
  CustomerType,
} from "@/types/customer";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type CustomerFormValues = Omit<CreateCustomerInput, "userId">;

interface CustomerFormProps {
  values: CustomerFormValues;
  onChange: (values: CustomerFormValues) => void;
  disabled?: boolean;
  showActiveToggle?: boolean;
  customerCodeReadOnly?: boolean;
}

const PAYMENT_TERMS: Array<{
  value: CustomerPaymentTerms;
  label: string;
}> = [
  { value: "due_on_receipt", label: "Due on receipt" },
  { value: "net_7", label: "7 days" },
  { value: "net_14", label: "14 days" },
  { value: "net_30", label: "30 days" },
  { value: "net_45", label: "45 days" },
  { value: "net_60", label: "60 days" },
  { value: "custom", label: "Custom" },
];

const CustomerForm = ({
  values,
  onChange,
  disabled = false,
  showActiveToggle = false,
  customerCodeReadOnly = false,
}: CustomerFormProps) => {
  const update = <K extends keyof CustomerFormValues>(
    key: K,
    value: CustomerFormValues[K]
  ) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  const type: CustomerType =
    values.type === "individual" ? "individual" : "business";

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer type</Text>

        <View style={styles.row}>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => update("type", "business")}
            style={[
              styles.typeButton,
              type === "business" && styles.typeButtonSelected,
            ]}
          >
            <Ionicons
              name="business-outline"
              size={19}
              color={type === "business" ? "#0f172a" : "#dbeafe"}
            />
            <Text
              style={[
                styles.typeText,
                type === "business" && styles.typeTextSelected,
              ]}
            >
              Business
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={disabled}
            onPress={() => update("type", "individual")}
            style={[
              styles.typeButton,
              type === "individual" && styles.typeButtonSelected,
            ]}
          >
            <Ionicons
              name="person-outline"
              size={19}
              color={type === "individual" ? "#0f172a" : "#dbeafe"}
            />
            <Text
              style={[
                styles.typeText,
                type === "individual" && styles.typeTextSelected,
              ]}
            >
              Individual
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer details</Text>

        {type === "business" ? (
          <FormInput
            label="Company name"
            value={values.companyName || ""}
            onChangeText={(text) => update("companyName", text)}
            placeholder="Company name"
            editable={!disabled}
          />
        ) : null}

        <FormInput
          label={type === "business" ? "Contact name" : "Customer name"}
          value={values.contactName || ""}
          onChangeText={(text) => update("contactName", text)}
          placeholder="Full name"
          editable={!disabled}
        />

        <FormInput
          label="Email"
          value={values.email || ""}
          onChangeText={(text) => update("email", text)}
          placeholder="customer@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!disabled}
        />

        <FormInput
          label="Phone"
          value={values.phone || ""}
          onChangeText={(text) => update("phone", text)}
          placeholder="Phone number"
          keyboardType="phone-pad"
          editable={!disabled}
        />

        <FormInput
          label="Customer code"
          value={values.customerCode || ""}
          onChangeText={(text) =>
            update("customerCode", text.toUpperCase())
          }
          placeholder="CUS-0001"
          autoCapitalize="characters"
          editable={!disabled && !customerCodeReadOnly}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Billing address</Text>

        <FormInput
          label="Address line 1"
          value={values.addressLine1 || ""}
          onChangeText={(text) => update("addressLine1", text)}
          placeholder="Street address"
          editable={!disabled}
        />

        <FormInput
          label="Address line 2"
          value={values.addressLine2 || ""}
          onChangeText={(text) => update("addressLine2", text)}
          placeholder="Area or building"
          editable={!disabled}
        />

        <FormInput
          label="City"
          value={values.city || ""}
          onChangeText={(text) => update("city", text)}
          placeholder="City"
          editable={!disabled}
        />

        <FormInput
          label="County / region"
          value={values.county || ""}
          onChangeText={(text) => update("county", text)}
          placeholder="County or region"
          editable={!disabled}
        />

        <FormInput
          label="Postcode"
          value={values.postcode || ""}
          onChangeText={(text) => update("postcode", text.toUpperCase())}
          placeholder="Postcode"
          autoCapitalize="characters"
          editable={!disabled}
        />

        <FormInput
          label="Country"
          value={values.country || ""}
          onChangeText={(text) => update("country", text)}
          placeholder="United Kingdom"
          editable={!disabled}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Invoice defaults</Text>

        <Text style={styles.label}>Payment terms</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.termsRow}
        >
          {PAYMENT_TERMS.map((option) => {
            const selected = values.paymentTerms === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                disabled={disabled}
                onPress={() => {
                  update("paymentTerms", option.value);

                  if (option.value !== "custom") {
                    update("customPaymentTermDays", undefined);
                  }
                }}
                style={[
                  styles.termButton,
                  selected && styles.termButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.termText,
                    selected && styles.termTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {values.paymentTerms === "custom" ? (
          <FormInput
            label="Custom payment days"
            value={
              values.customPaymentTermDays === undefined
                ? ""
                : String(values.customPaymentTermDays)
            }
            onChangeText={(text) => {
              const digits = text.replace(/[^0-9]/g, "");
              update(
                "customPaymentTermDays",
                digits ? Number(digits) : undefined
              );
            }}
            placeholder="Number of days"
            keyboardType="number-pad"
            editable={!disabled}
          />
        ) : null}

        <FormInput
          label="Currency code"
          value={values.currencyCode || ""}
          onChangeText={(text) =>
            update("currencyCode", text.toUpperCase())
          }
          placeholder="GBP"
          autoCapitalize="characters"
          editable={!disabled}
        />

        <FormInput
          label="Currency symbol"
          value={values.currencySymbol || ""}
          onChangeText={(text) => update("currencySymbol", text)}
          placeholder="£"
          editable={!disabled}
        />

        <FormInput
          label="VAT / tax number"
          value={values.taxNumber || ""}
          onChangeText={(text) => update("taxNumber", text)}
          placeholder="Optional"
          editable={!disabled}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notes</Text>

        <FormInput
          label="Internal notes"
          value={values.notes || ""}
          onChangeText={(text) => update("notes", text)}
          placeholder="Private notes about this customer"
          editable={!disabled}
          multiline
        />

        {showActiveToggle ? (
          <TouchableOpacity
            disabled={disabled}
            onPress={() =>
              update("isActive", values.isActive === false)
            }
            style={styles.activeRow}
          >
            <View style={styles.activeTextContainer}>
              <Text style={styles.activeTitle}>Active customer</Text>
              <Text style={styles.activeSubtitle}>
                Inactive customers remain available in invoice history.
              </Text>
            </View>

            <View
              style={[
                styles.checkbox,
                values.isActive !== false && styles.checkboxSelected,
              ]}
            >
              {values.isActive !== false ? (
                <Ionicons name="checkmark" size={16} color="#0f172a" />
              ) : null}
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  editable: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
}

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  editable,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
}: FormInputProps) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>

    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#64748b"
      editable={editable}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      style={[
        styles.input,
        multiline && styles.multilineInput,
        !editable && styles.inputDisabled,
      ]}
    />
  </View>
);

export default CustomerForm;

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 18,
    marginBottom: 13,
    backgroundColor: "rgba(15,23,42,0.56)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.13)",
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
  },
  typeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    backgroundColor: "rgba(30,41,59,0.75)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  typeButtonSelected: {
    backgroundColor: "#dbeafe",
  },
  typeText: {
    color: "#dbeafe",
    marginLeft: 7,
    fontSize: 12,
    fontWeight: "800",
  },
  typeTextSelected: {
    color: "#0f172a",
  },
  field: {
    marginBottom: 13,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 48,
    borderRadius: 13,
    paddingHorizontal: 12,
    color: "#f8fafc",
    backgroundColor: "rgba(2,6,23,0.42)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  multilineInput: {
    minHeight: 105,
    paddingTop: 12,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  termsRow: {
    paddingBottom: 13,
  },
  termButton: {
    minHeight: 38,
    borderRadius: 11,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    backgroundColor: "rgba(30,41,59,0.75)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  termButtonSelected: {
    backgroundColor: "#dbeafe",
  },
  termText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },
  termTextSelected: {
    color: "#0f172a",
  },
  activeRow: {
    minHeight: 60,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2,6,23,0.35)",
  },
  activeTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  activeTitle: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "800",
  },
  activeSubtitle: {
    color: "#94a3b8",
    fontSize: 9,
    marginTop: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#64748b",
  },
  checkboxSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
});