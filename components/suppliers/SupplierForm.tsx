import type { SupplierFormValues, SupplierPaymentTerms } from "@/types/supplier";
import React from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

interface SupplierFormProps {
  values: SupplierFormValues;

  onChange: <K extends keyof SupplierFormValues>(
    field: K,
    value: SupplierFormValues[K],
  ) => void;

  disabled?: boolean;

  showCommercialDetails?: boolean;
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;

  keyboardType?:
    | "default"
    | "email-address"
    | "phone-pad"
    | "decimal-pad";

  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";

  multiline?: boolean;
}

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
}: FieldProps) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
};

const SupplierForm = ({
  values,
  onChange,
  disabled = false,
  showCommercialDetails = true,
}: SupplierFormProps) => {
  return (
    <View pointerEvents={disabled ? "none" : "auto"}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Business details
        </Text>

        <Field
          label="Company name *"
          value={values.companyName}
          onChangeText={(value) =>
            onChange("companyName", value)
          }
          placeholder="Supplier company name"
          autoCapitalize="words"
        />

        <Field
          label="Contact name"
          value={values.contactName}
          onChangeText={(value) =>
            onChange("contactName", value)
          }
          placeholder="Main contact person"
          autoCapitalize="words"
        />

        <Field
          label="Supplier code"
          value={values.supplierCode}
          onChangeText={(value) =>
            onChange("supplierCode", value)
          }
          placeholder="Optional internal code"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>

        <Field
          label="Email"
          value={values.email}
          onChangeText={(value) =>
            onChange("email", value)
          }
          placeholder="supplier@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Field
          label="Phone"
          value={values.phone}
          onChangeText={(value) =>
            onChange("phone", value)
          }
          placeholder="Phone number"
          keyboardType="phone-pad"
        />

        <Field
          label="Website"
          value={values.website}
          onChangeText={(value) =>
            onChange("website", value)
          }
          placeholder="https://example.com"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>

        <Field
          label="Address line 1"
          value={values.addressLine1}
          onChangeText={(value) =>
            onChange("addressLine1", value)
          }
          placeholder="Street address"
        />

        <Field
          label="Address line 2"
          value={values.addressLine2}
          onChangeText={(value) =>
            onChange("addressLine2", value)
          }
          placeholder="Optional"
        />

        <Field
          label="City"
          value={values.city}
          onChangeText={(value) =>
            onChange("city", value)
          }
          placeholder="City"
          autoCapitalize="words"
        />

        <Field
          label="County / Region"
          value={values.county}
          onChangeText={(value) =>
            onChange("county", value)
          }
          placeholder="County or region"
          autoCapitalize="words"
        />

        <Field
          label="Postcode"
          value={values.postcode}
          onChangeText={(value) =>
            onChange("postcode", value)
          }
          placeholder="Postcode"
          autoCapitalize="characters"
        />

        <Field
          label="Country"
          value={values.country}
          onChangeText={(value) =>
            onChange("country", value)
          }
          placeholder="Country"
          autoCapitalize="words"
        />
      </View>

      {showCommercialDetails && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Commercial details
          </Text>

          <Field
            label="Payment terms"
            value={values.paymentTerms}
            onChangeText={(value) =>
              onChange(
                "paymentTerms",
                value as SupplierPaymentTerms,
              )
            }
            placeholder="For example: 30 days"
          />
          
          <Field
            label="Opening balance"
            value={String(values.openingBalance)}
            onChangeText={(value) => {
              const cleaned = value.replace(/[^0-9.-]/g, "");
              const parsed = Number(cleaned);

              onChange(
                "openingBalance",
                Number.isFinite(parsed) ? parsed : 0,
              );
            }}
          />
          <Field
            label="Credit limit"
            value={String(values.creditLimit)}
            onChangeText={(value) => {
              const cleaned = value.replace(/[^0-9.]/g, "");
              const parsed = Number(cleaned);

              onChange(
                "creditLimit",
                Number.isFinite(parsed) ? parsed : 0,
              );
            }}
          />

          <View style={styles.currencyRow}>
            <View style={styles.currencyCode}>
              <Field
                label="Currency code"
                value={values.currencyCode}
                onChangeText={(value) =>
                  onChange(
                    "currencyCode",
                    value.toUpperCase(),
                  )
                }
                placeholder="GBP"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.currencySymbol}>
              <Field
                label="Symbol"
                value={values.currencySymbol}
                onChangeText={(value) =>
                  onChange("currencySymbol", value)
                }
                placeholder="£"
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Notes and status
        </Text>

        <Field
          label="Notes"
          value={values.notes}
          onChangeText={(value) =>
            onChange("notes", value)
          }
          placeholder="Optional notes about this supplier"
          multiline
        />

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.label}>
              Active supplier
            </Text>

            <Text style={styles.switchHelp}>
              Inactive suppliers remain in history but are
              hidden from active selection lists.
            </Text>
          </View>

          <Switch
            value={values.isActive}
            onValueChange={(value) =>
              onChange("isActive", value)
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  fieldGroup: {
    marginBottom: 13,
  },

  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#111827",
    backgroundColor: "#ffffff",
    fontSize: 16,
  },

  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },

  currencyRow: {
    flexDirection: "row",
    gap: 12,
  },

  currencyCode: {
    flex: 2,
  },

  currencySymbol: {
    flex: 1,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  switchTextContainer: {
    flex: 1,
  },

  switchHelp: {
    color: "#6b7280",
    lineHeight: 18,
    marginTop: 2,
  },
});

export default SupplierForm;