// app/screens/companyProfile.tsx

import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { useCompanyProfile } from "@/context/CompanyProfileContext";
import { getProUserStatus } from "@/context/ProUserContext";
import { isGuest } from "@/utils/guest";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CountryOption = {
  label: string;
  country: string;
  region: string;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  flag: string;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  {
    label: "United Kingdom",
    country: "GB",
    region: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    flag: "🇬🇧",
  },
  {
    label: "Pakistan",
    country: "PK",
    region: "Pakistan",
    currencyCode: "PKR",
    currencySymbol: "₨",
    locale: "en-PK",
    flag: "🇵🇰",
  },
  {
    label: "United Arab Emirates",
    country: "AE",
    region: "United Arab Emirates",
    currencyCode: "AED",
    currencySymbol: "د.إ",
    locale: "en-AE",
    flag: "🇦🇪",
  },
  {
    label: "United States",
    country: "US",
    region: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
    locale: "en-US",
    flag: "🇺🇸",
  },
  {
    label: "Other",
    country: "CUSTOM",
    region: "",
    currencyCode: "",
    currencySymbol: "",
    locale: "en-US",
    flag: "🌍",
  },
];

const BUSINESS_TYPES = [
  { label: "Retail", icon: "storefront-outline" },
  { label: "Wholesale", icon: "cube-outline" },
  { label: "Restaurant / Food", icon: "restaurant-outline" },
  { label: "Mobile Shop", icon: "phone-portrait-outline" },
  { label: "Grocery", icon: "basket-outline" },
  { label: "Clothing", icon: "shirt-outline" },
  { label: "Pharmacy", icon: "medical-outline" },
  { label: "Service Business", icon: "construct-outline" },
  { label: "Other", icon: "ellipsis-horizontal-outline" },
] as const;

type FieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
};

const FieldLabel = ({ label, required, hint }: FieldProps) => (
  <View style={styles.fieldLabelRow}>
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
    {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
  </View>
);

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon} size={20} color="#38bdf8" />
    </View>
    <View style={styles.sectionHeaderText}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

const CompanyProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    companyProfile,
    updateCompanyProfile,
    refreshCompanyProfile,
  } = useCompanyProfile();

  const profile = companyProfile as any;
  const isFirstSetup = !companyProfile?.companyName?.trim();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [taxRegistrationNumber, setTaxRegistrationNumber] =
    useState("");
  const [logo, setLogo] = useState<string | undefined>();

  const [businessType, setBusinessType] = useState("Retail");
  const [country, setCountry] = useState("GB");
  const [region, setRegion] = useState("United Kingdom");
  const [currencyCode, setCurrencyCode] = useState("GBP");
  const [currencySymbol, setCurrencySymbol] = useState("£");
  const [locale, setLocale] = useState("en-GB");
  const [isCustomCountry, setIsCustomCountry] = useState(false);

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxLabel, setTaxLabel] = useState("VAT");
  const [defaultTaxRate, setDefaultTaxRate] = useState("20");
  const [pricesIncludeTax, setPricesIncludeTax] = useState(false);

  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankSortCode, setBankSortCode] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankSwiftCode, setBankSwiftCode] = useState("");

  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(
    "Payment due within 30 days."
  );
  const [defaultInvoiceNotes, setDefaultInvoiceNotes] = useState("");
  const [defaultPaymentInstructions, setDefaultPaymentInstructions] =
    useState("");
  const [defaultTermsAndConditions, setDefaultTermsAndConditions] =
    useState("");
  const [invoiceFooterMessage, setInvoiceFooterMessage] = useState(
    "Thank you for your business."
  );

  const [isGuestUser, setIsGuestUser] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<
    "tax" | "bank" | "invoice" | null
  >("tax");

  useEffect(() => {
    const initialiseAccess = async () => {
      const [guest, pro] = await Promise.all([
        isGuest(),
        getProUserStatus(),
      ]);
      setIsGuestUser(guest);
      setIsProUser(pro);
    };

    initialiseAccess();
  }, []);

  useEffect(() => {
    if (!companyProfile) return;

    setCompanyName(companyProfile.companyName || "");
    setAddress(companyProfile.address || "");
    setPhone(companyProfile.phoneNumber || "");
    setLogo(companyProfile.logoLocal || undefined);
    setBusinessType(companyProfile.businessType || "Retail");
    setCountry(companyProfile.country || "GB");
    setRegion(companyProfile.region || "United Kingdom");
    setCurrencyCode(companyProfile.currencyCode || "GBP");
    setCurrencySymbol(companyProfile.currencySymbol || "£");
    setLocale(companyProfile.locale || "en-GB");

    setCompanyEmail(profile?.companyEmail || "");
    setWebsite(profile?.website || "");
    setTaxRegistrationNumber(profile?.taxRegistrationNumber || "");
    setTaxEnabled(Boolean(profile?.taxEnabled));
    setTaxLabel(
      profile?.taxLabel ||
        (companyProfile.country === "GB" ? "VAT" : "Tax")
    );
    setDefaultTaxRate(
      String(Number(profile?.defaultTaxRate ?? 0))
    );
    setPricesIncludeTax(Boolean(profile?.pricesIncludeTax));

    setBankName(profile?.bankName || "");
    setBankAccountName(profile?.bankAccountName || "");
    setBankAccountNumber(profile?.bankAccountNumber || "");
    setBankSortCode(profile?.bankSortCode || "");
    setBankIban(profile?.bankIban || "");
    setBankSwiftCode(profile?.bankSwiftCode || "");

    setDefaultPaymentTerms(
      profile?.defaultPaymentTerms || "Payment due within 30 days."
    );
    setDefaultInvoiceNotes(profile?.defaultInvoiceNotes || "");
    setDefaultPaymentInstructions(
      profile?.defaultPaymentInstructions || ""
    );
    setDefaultTermsAndConditions(
      profile?.defaultTermsAndConditions || ""
    );
    setInvoiceFooterMessage(
      profile?.invoiceFooterMessage ||
        "Thank you for your business."
    );

    const knownCountry = COUNTRY_OPTIONS.some(
      (item) => item.country === companyProfile.country
    );
    setIsCustomCountry(!knownCountry);
  }, [companyProfile]);

  const completion = useMemo(() => {
    const essentials = [
      companyName,
      businessType,
      region,
      country,
      currencyCode,
      currencySymbol,
    ];

    const useful = [
      logo,
      address,
      phoneNumber,
      companyEmail,
      website,
      taxEnabled ? taxRegistrationNumber : "not-required",
    ];

    const completed =
      essentials.filter((value) => String(value || "").trim()).length * 2 +
      useful.filter((value) => String(value || "").trim()).length;

    return Math.min(100, Math.round((completed / 18) * 100));
  }, [
    address,
    businessType,
    companyEmail,
    companyName,
    country,
    currencyCode,
    currencySymbol,
    logo,
    phoneNumber,
    region,
    taxEnabled,
    taxRegistrationNumber,
    website,
  ]);

  const handleSelectCountry = (item: CountryOption) => {
    if (item.country === "CUSTOM") {
      setIsCustomCountry(true);
      setCountry("");
      setRegion("");
      setCurrencyCode("");
      setCurrencySymbol("");
      setLocale("en-US");
      setTaxLabel("Tax");
      setDefaultTaxRate("0");
      return;
    }

    setIsCustomCountry(false);
    setCountry(item.country);
    setRegion(item.region);
    setCurrencyCode(item.currencyCode);
    setCurrencySymbol(item.currencySymbol);
    setLocale(item.locale);

    if (item.country === "GB") {
      setTaxLabel("VAT");
      if (!profile?.defaultTaxRate) setDefaultTaxRate("20");
    } else {
      setTaxLabel("Tax");
      if (!profile?.defaultTaxRate) setDefaultTaxRate("0");
    }
  };

  const handlePickLogo = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo access required",
          "Allow photo access to choose your business logo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]?.uri) return;

      const pickedUri = result.assets[0].uri;
      const extension =
        pickedUri.split(".").pop()?.split("?")[0] || "jpg";
      const fileName = `company_logo_${Date.now()}.${extension}`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: pickedUri,
        to: newPath,
      });

      setLogo(newPath);
    } catch (error) {
      console.error("❌ Error picking logo:", error);
      Alert.alert("Unable to select logo", "Please try another image.");
    }
  };

  const validate = (): boolean => {
    if (!companyName.trim()) {
      Alert.alert(
        "Business name required",
        "Enter the name that should appear throughout StockTally."
      );
      return false;
    }

    if (!region.trim() || !country.trim()) {
      Alert.alert(
        "Country required",
        "Select your country or enter a custom country and two-letter code."
      );
      return false;
    }

    if (!currencyCode.trim() || !currencySymbol.trim()) {
      Alert.alert(
        "Currency required",
        "Enter your currency code and symbol."
      );
      return false;
    }

    const parsedTaxRate = Number(defaultTaxRate || 0);
    if (
      taxEnabled &&
      (!Number.isFinite(parsedTaxRate) ||
        parsedTaxRate < 0 ||
        parsedTaxRate > 100)
    ) {
      Alert.alert(
        "Check tax rate",
        "Enter a tax rate between 0 and 100."
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      await updateCompanyProfile({
        companyName: companyName.trim(),
        companyEmail: companyEmail.trim(),
        phoneNumber: phoneNumber.trim(),
        website: website.trim(),
        address: address.trim(),
        taxRegistrationNumber: taxRegistrationNumber.trim(),

        businessType,
        country: country.trim().toUpperCase(),
        region: region.trim(),
        currencyCode: currencyCode.trim().toUpperCase(),
        currencySymbol: currencySymbol.trim(),
        locale: locale.trim() || "en-GB",

        taxEnabled,
        taxLabel: taxLabel.trim() || "Tax",
        defaultTaxRate: Number(defaultTaxRate || 0),
        pricesIncludeTax,

        bankName: bankName.trim(),
        bankAccountName: bankAccountName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankSortCode: bankSortCode.trim(),
        bankIban: bankIban.trim(),
        bankSwiftCode: bankSwiftCode.trim(),

        defaultPaymentTerms: defaultPaymentTerms.trim(),
        defaultInvoiceNotes: defaultInvoiceNotes.trim(),
        defaultPaymentInstructions:
          defaultPaymentInstructions.trim(),
        defaultTermsAndConditions:
          defaultTermsAndConditions.trim(),
        invoiceFooterMessage: invoiceFooterMessage.trim(),

        logoLocal: logo || "",
        logoCloud: companyProfile?.logoCloud || "",
        userId: user?.$id || "guest",
      } as any);

      await refreshCompanyProfile();

      Alert.alert(
        isFirstSetup ? "You're ready to go" : "Profile updated",
        isFirstSetup
          ? "Your StockTally workspace is ready."
          : "Your business details have been saved.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch (error) {
      console.error("❌ Error saving company profile:", error);
      Alert.alert(
        "Unable to save",
        "Your changes could not be saved. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (
    section: "tax" | "bank" | "invoice"
  ) => {
    setExpandedSection((current) =>
      current === section ? null : section
    );
  };

  return (
    <ScreenWrapper scroll backgroundColor="#07111f">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View
          style={[
            styles.container,
            { paddingTop: Math.max(insets.top, 12) },
          ]}
        >
          <LinearGradient
            colors={["#0f2f4f", "#0b1f36", "#071525"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            {!isFirstSetup ? (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
                accessibilityLabel="Close company profile"
              >
                <Ionicons name="close" size={22} color="#e2e8f0" />
              </TouchableOpacity>
            ) : null}

            <View style={styles.brandMark}>
              <Ionicons name="layers" size={24} color="#ffffff" />
            </View>

            <Text style={styles.eyebrow}>
              {isFirstSetup ? "WELCOME TO STOCKTALLY" : "BUSINESS SETTINGS"}
            </Text>
            <Text style={styles.title}>
              {isFirstSetup
                ? "Let's set up your business"
                : "Company profile"}
            </Text>
            <Text style={styles.subtitle}>
              These details personalise your workspace and appear on
              invoices, quotes and reports.
            </Text>

            <View style={styles.progressCard}>
              <View style={styles.progressTopRow}>
                <Text style={styles.progressLabel}>Profile completion</Text>
                <Text style={styles.progressValue}>{completion}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${completion}%` },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>

          <View
            style={[
              styles.accountBanner,
              isGuestUser
                ? styles.guestBanner
                : styles.cloudBanner,
            ]}
          >
            <View
              style={[
                styles.accountIcon,
                isGuestUser
                  ? styles.guestIcon
                  : styles.cloudIcon,
              ]}
            >
              <Ionicons
                name={
                  isGuestUser
                    ? "phone-portrait-outline"
                    : isProUser
                    ? "cloud-done-outline"
                    : "person-circle-outline"
                }
                size={20}
                color={isGuestUser ? "#f59e0b" : "#22c55e"}
              />
            </View>
            <View style={styles.accountCopy}>
              <Text style={styles.accountTitle}>
                {isGuestUser
                  ? "Saved on this device"
                  : isProUser
                  ? "Pro cloud sync enabled"
                  : "Linked to your account"}
              </Text>
              <Text style={styles.accountSubtitle}>
                {isGuestUser
                  ? "Sign in later to link and back up your business data."
                  : "Your profile will stay connected to your StockTally account."}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <SectionHeader
              icon="business-outline"
              title="Business identity"
              subtitle="The details customers will recognise"
            />

            <View style={styles.logoRow}>
              <TouchableOpacity
                onPress={handlePickLogo}
                style={styles.logoContainer}
                activeOpacity={0.85}
              >
                {logo ? (
                  <Image source={{ uri: logo }} style={styles.logo} />
                ) : (
                  <LinearGradient
                    colors={["#163a5f", "#102944"]}
                    style={styles.logoPlaceholder}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={28}
                      color="#7dd3fc"
                    />
                  </LinearGradient>
                )}
                <View style={styles.logoEditBadge}>
                  <Ionicons name="pencil" size={13} color="#07111f" />
                </View>
              </TouchableOpacity>

              <View style={styles.logoCopy}>
                <Text style={styles.logoTitle}>Business logo</Text>
                <Text style={styles.logoSubtitle}>
                  Add a square logo for professional invoices and quotes.
                </Text>
                <TouchableOpacity onPress={handlePickLogo}>
                  <Text style={styles.logoAction}>
                    {logo ? "Change logo" : "Choose logo"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <FieldLabel label="Business name" required />
            <View style={styles.inputShell}>
              <Ionicons
                name="storefront-outline"
                size={19}
                color="#64748b"
              />
              <TextInput
                value={companyName}
                onChangeText={setCompanyName}
                style={styles.input}
                placeholder="e.g. Siddiqui Trading"
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
              />
            </View>

            <FieldLabel label="Business type" />
            <View style={styles.optionWrap}>
              {BUSINESS_TYPES.map((type) => {
                const selected = businessType === type.label;
                return (
                  <TouchableOpacity
                    key={type.label}
                    style={[
                      styles.businessOption,
                      selected && styles.businessOptionSelected,
                    ]}
                    onPress={() => setBusinessType(type.label)}
                  >
                    <Ionicons
                      name={type.icon}
                      size={16}
                      color={selected ? "#e0f2fe" : "#64748b"}
                    />
                    <Text
                      style={[
                        styles.businessOptionText,
                        selected &&
                          styles.businessOptionTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <FieldLabel label="Email" />
                <View style={styles.inputShell}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#64748b"
                  />
                  <TextInput
                    value={companyEmail}
                    onChangeText={setCompanyEmail}
                    style={styles.input}
                    placeholder="hello@business.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.column}>
                <FieldLabel label="Phone" />
                <View style={styles.inputShell}>
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color="#64748b"
                  />
                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhone}
                    style={styles.input}
                    placeholder="+44..."
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            <FieldLabel label="Website" />
            <View style={styles.inputShell}>
              <Ionicons
                name="globe-outline"
                size={18}
                color="#64748b"
              />
              <TextInput
                value={website}
                onChangeText={setWebsite}
                style={styles.input}
                placeholder="www.yourbusiness.com"
                placeholderTextColor="#94a3b8"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <FieldLabel label="Business address" />
            <View style={[styles.inputShell, styles.multilineShell]}>
              <Ionicons
                name="location-outline"
                size={19}
                color="#64748b"
                style={styles.multilineIcon}
              />
              <TextInput
                value={address}
                onChangeText={setAddress}
                style={[styles.input, styles.multilineInput]}
                placeholder={"Street address\nTown / City\nPostcode"}
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.card}>
            <SectionHeader
              icon="earth-outline"
              title="Country & currency"
              subtitle="Used throughout totals, reports and documents"
            />

            <FieldLabel label="Country or region" required />
            <View style={styles.countryGrid}>
              {COUNTRY_OPTIONS.map((item) => {
                const selected =
                  country === item.country ||
                  (item.country === "CUSTOM" && isCustomCountry);

                return (
                  <TouchableOpacity
                    key={item.country}
                    style={[
                      styles.countryOption,
                      selected && styles.countryOptionSelected,
                    ]}
                    onPress={() => handleSelectCountry(item)}
                  >
                    <Text style={styles.flag}>{item.flag}</Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.countryText,
                        selected && styles.countryTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#38bdf8"
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {isCustomCountry ? (
              <View style={styles.customCountryBox}>
                <FieldLabel label="Country / region name" required />
                <View style={styles.inputShell}>
                  <TextInput
                    value={region}
                    onChangeText={setRegion}
                    style={styles.input}
                    placeholder="e.g. Saudi Arabia"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.threeColumns}>
                  <View style={styles.smallColumn}>
                    <FieldLabel label="Country" required />
                    <View style={styles.inputShell}>
                      <TextInput
                        value={country}
                        onChangeText={(text) =>
                          setCountry(text.toUpperCase())
                        }
                        style={styles.input}
                        placeholder="SA"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="characters"
                        maxLength={2}
                      />
                    </View>
                  </View>

                  <View style={styles.smallColumn}>
                    <FieldLabel label="Currency" required />
                    <View style={styles.inputShell}>
                      <TextInput
                        value={currencyCode}
                        onChangeText={(text) =>
                          setCurrencyCode(text.toUpperCase())
                        }
                        style={styles.input}
                        placeholder="SAR"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="characters"
                        maxLength={3}
                      />
                    </View>
                  </View>

                  <View style={styles.smallColumn}>
                    <FieldLabel label="Symbol" required />
                    <View style={styles.inputShell}>
                      <TextInput
                        value={currencySymbol}
                        onChangeText={setCurrencySymbol}
                        style={styles.input}
                        placeholder="﷼"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>
                </View>

                <FieldLabel label="Locale" hint="Formatting code" />
                <View style={styles.inputShell}>
                  <TextInput
                    value={locale}
                    onChangeText={setLocale}
                    style={styles.input}
                    placeholder="e.g. en-SA"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ) : null}

            <LinearGradient
              colors={["#eff6ff", "#f0f9ff"]}
              style={styles.currencyPreview}
            >
              <View style={styles.currencyPreviewIcon}>
                <Text style={styles.currencySymbol}>
                  {currencySymbol || "?"}
                </Text>
              </View>
              <View style={styles.currencyPreviewCopy}>
                <Text style={styles.currencyPreviewLabel}>
                  Currency preview
                </Text>
                <Text style={styles.currencyPreviewValue}>
                  {currencySymbol || ""}
                  {new Intl.NumberFormat(locale || "en-GB", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(1234.5)}{" "}
                  {currencyCode || ""}
                </Text>
                <Text style={styles.currencyPreviewMeta}>
                  {region || "No region selected"} · {locale || "en-GB"}
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection("tax")}
            >
              <SectionHeader
                icon="receipt-outline"
                title="Tax settings"
                subtitle="Defaults used on invoices and quotes"
              />
              <Ionicons
                name={
                  expandedSection === "tax"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={21}
                color="#64748b"
              />
            </TouchableOpacity>

            {expandedSection === "tax" ? (
              <View style={styles.accordionBody}>
                <View style={styles.switchRow}>
                  <View style={styles.switchCopy}>
                    <Text style={styles.switchTitle}>
                      Enable tax calculations
                    </Text>
                    <Text style={styles.switchSubtitle}>
                      Add VAT, GST or sales tax to documents.
                    </Text>
                  </View>
                  <Switch
                    value={taxEnabled}
                    onValueChange={setTaxEnabled}
                    trackColor={{
                      false: "#cbd5e1",
                      true: "#7dd3fc",
                    }}
                    thumbColor={taxEnabled ? "#0284c7" : "#f8fafc"}
                  />
                </View>

                {taxEnabled ? (
                  <>
                    <View style={styles.twoColumns}>
                      <View style={styles.column}>
                        <FieldLabel label="Tax label" />
                        <View style={styles.inputShell}>
                          <TextInput
                            value={taxLabel}
                            onChangeText={setTaxLabel}
                            style={styles.input}
                            placeholder="VAT"
                            placeholderTextColor="#94a3b8"
                          />
                        </View>
                      </View>
                      <View style={styles.column}>
                        <FieldLabel label="Default rate" />
                        <View style={styles.inputShell}>
                          <TextInput
                            value={defaultTaxRate}
                            onChangeText={setDefaultTaxRate}
                            style={styles.input}
                            placeholder="20"
                            placeholderTextColor="#94a3b8"
                            keyboardType="decimal-pad"
                          />
                          <Text style={styles.inputSuffix}>%</Text>
                        </View>
                      </View>
                    </View>

                    <FieldLabel label="Tax registration number" />
                    <View style={styles.inputShell}>
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color="#64748b"
                      />
                      <TextInput
                        value={taxRegistrationNumber}
                        onChangeText={setTaxRegistrationNumber}
                        style={styles.input}
                        placeholder="e.g. GB123456789"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="characters"
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <View style={styles.switchCopy}>
                        <Text style={styles.switchTitle}>
                          Prices include tax
                        </Text>
                        <Text style={styles.switchSubtitle}>
                          Treat entered prices as tax-inclusive.
                        </Text>
                      </View>
                      <Switch
                        value={pricesIncludeTax}
                        onValueChange={setPricesIncludeTax}
                        trackColor={{
                          false: "#cbd5e1",
                          true: "#7dd3fc",
                        }}
                        thumbColor={
                          pricesIncludeTax ? "#0284c7" : "#f8fafc"
                        }
                      />
                    </View>
                  </>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection("bank")}
            >
              <SectionHeader
                icon="card-outline"
                title="Payment details"
                subtitle="Optional bank information for invoices"
              />
              <Ionicons
                name={
                  expandedSection === "bank"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={21}
                color="#64748b"
              />
            </TouchableOpacity>

            {expandedSection === "bank" ? (
              <View style={styles.accordionBody}>
                <FieldLabel label="Bank name" />
                <View style={styles.inputShell}>
                  <TextInput
                    value={bankName}
                    onChangeText={setBankName}
                    style={styles.input}
                    placeholder="Your bank"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <FieldLabel label="Account name" />
                <View style={styles.inputShell}>
                  <TextInput
                    value={bankAccountName}
                    onChangeText={setBankAccountName}
                    style={styles.input}
                    placeholder="Account holder name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.twoColumns}>
                  <View style={styles.column}>
                    <FieldLabel label="Account number" />
                    <View style={styles.inputShell}>
                      <TextInput
                        value={bankAccountNumber}
                        onChangeText={setBankAccountNumber}
                        style={styles.input}
                        placeholder="12345678"
                        placeholderTextColor="#94a3b8"
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.column}>
                    <FieldLabel label="Sort code" />
                    <View style={styles.inputShell}>
                      <TextInput
                        value={bankSortCode}
                        onChangeText={setBankSortCode}
                        style={styles.input}
                        placeholder="00-00-00"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>
                </View>

                <FieldLabel label="IBAN" />
                <View style={styles.inputShell}>
                  <TextInput
                    value={bankIban}
                    onChangeText={(text) =>
                      setBankIban(text.toUpperCase())
                    }
                    style={styles.input}
                    placeholder="International bank account number"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                  />
                </View>

                <FieldLabel label="SWIFT / BIC" />
                <View style={styles.inputShell}>
                  <TextInput
                    value={bankSwiftCode}
                    onChangeText={(text) =>
                      setBankSwiftCode(text.toUpperCase())
                    }
                    style={styles.input}
                    placeholder="SWIFT code"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection("invoice")}
            >
              <SectionHeader
                icon="document-text-outline"
                title="Document defaults"
                subtitle="Save time when creating invoices and quotes"
              />
              <Ionicons
                name={
                  expandedSection === "invoice"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={21}
                color="#64748b"
              />
            </TouchableOpacity>

            {expandedSection === "invoice" ? (
              <View style={styles.accordionBody}>
                <FieldLabel label="Default payment terms" />
                <View style={[styles.inputShell, styles.multilineShell]}>
                  <TextInput
                    value={defaultPaymentTerms}
                    onChangeText={setDefaultPaymentTerms}
                    style={[styles.input, styles.shortMultiline]}
                    placeholder="Payment due within 30 days."
                    placeholderTextColor="#94a3b8"
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <FieldLabel label="Default invoice notes" />
                <View style={[styles.inputShell, styles.multilineShell]}>
                  <TextInput
                    value={defaultInvoiceNotes}
                    onChangeText={setDefaultInvoiceNotes}
                    style={[styles.input, styles.shortMultiline]}
                    placeholder="Optional note shown on invoices"
                    placeholderTextColor="#94a3b8"
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <FieldLabel label="Payment instructions" />
                <View style={[styles.inputShell, styles.multilineShell]}>
                  <TextInput
                    value={defaultPaymentInstructions}
                    onChangeText={setDefaultPaymentInstructions}
                    style={[styles.input, styles.shortMultiline]}
                    placeholder="How customers should pay"
                    placeholderTextColor="#94a3b8"
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <FieldLabel label="Terms and conditions" />
                <View style={[styles.inputShell, styles.multilineShell]}>
                  <TextInput
                    value={defaultTermsAndConditions}
                    onChangeText={setDefaultTermsAndConditions}
                    style={[styles.input, styles.longMultiline]}
                    placeholder="Default business terms"
                    placeholderTextColor="#94a3b8"
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <FieldLabel label="Invoice footer message" />
                <View style={styles.inputShell}>
                  <TextInput
                    value={invoiceFooterMessage}
                    onChangeText={setInvoiceFooterMessage}
                    style={styles.input}
                    placeholder="Thank you for your business."
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.readyCard}>
            <View style={styles.readyIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#22c55e" />
            </View>
            <View style={styles.readyCopy}>
              <Text style={styles.readyTitle}>
                Your details stay under your control
              </Text>
              <Text style={styles.readySubtitle}>
                Guest profiles remain on this device. Signed-in profiles
                can be linked to your account.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.9}
            style={[
              styles.saveButtonOuter,
              loading && styles.disabledButton,
            ]}
          >
            <LinearGradient
              colors={["#0284c7", "#0369a1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.saveText}>
                    {isFirstSetup
                      ? "Create my workspace"
                      : "Save company profile"}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#ffffff"
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            You can update these details at any time from More → Company
            Profile.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 52,
  },
  hero: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.18)",
  },
  heroGlowOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(14,165,233,0.13)",
    right: -45,
    top: -70,
  },
  heroGlowTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(56,189,248,0.08)",
    left: -35,
    bottom: -50,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#0284c7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  eyebrow: {
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 8,
  },
  title: {
    color: "#ffffff",
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  subtitle: {
    color: "#b6c7d9",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
    maxWidth: 330,
  },
  progressCard: {
    marginTop: 22,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  progressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  progressLabel: {
    color: "#dbeafe",
    fontSize: 12,
    fontWeight: "600",
  },
  progressValue: {
    color: "#7dd3fc",
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#38bdf8",
  },
  accountBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
  },
  guestBanner: {
    backgroundColor: "#211b10",
    borderColor: "#47371a",
  },
  cloudBanner: {
    backgroundColor: "#0d211a",
    borderColor: "#1b4935",
  },
  accountIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  guestIcon: { backgroundColor: "#382a10" },
  cloudIcon: { backgroundColor: "#123b29" },
  accountCopy: { flex: 1 },
  accountTitle: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
  },
  accountSubtitle: {
    color: "#94a3b8",
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 3,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 23,
    padding: 17,
    marginTop: 14,
    shadowColor: "#020617",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  sectionHeaderText: { flex: 1 },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#64748b",
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 21,
    marginBottom: 22,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 25,
    overflow: "visible",
    marginRight: 16,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 25,
    resizeMode: "cover",
    backgroundColor: "#e2e8f0",
  },
  logoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEditBadge: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#7dd3fc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  logoCopy: { flex: 1 },
  logoTitle: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },
  logoSubtitle: {
    color: "#64748b",
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 4,
  },
  logoAction: {
    color: "#0284c7",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 7,
  },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 15,
    marginBottom: 7,
  },
  label: {
    color: "#334155",
    fontSize: 12.5,
    fontWeight: "700",
  },
  required: { color: "#e11d48" },
  fieldHint: {
    color: "#94a3b8",
    fontSize: 10.5,
  },
  inputShell: {
    minHeight: 49,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe4ef",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#0f172a",
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  inputSuffix: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "700",
  },
  multilineShell: {
    alignItems: "flex-start",
    minHeight: 104,
  },
  multilineIcon: { marginTop: 14 },
  multilineInput: {
    minHeight: 102,
    paddingTop: 13,
  },
  shortMultiline: {
    minHeight: 76,
    paddingHorizontal: 0,
  },
  longMultiline: {
    minHeight: 110,
    paddingHorizontal: 0,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  businessOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  businessOptionSelected: {
    backgroundColor: "#0c4a6e",
    borderColor: "#0c4a6e",
  },
  businessOptionText: {
    color: "#475569",
    fontSize: 11.5,
    fontWeight: "600",
  },
  businessOptionTextSelected: {
    color: "#f0f9ff",
    fontWeight: "700",
  },
  twoColumns: {
    flexDirection: "row",
    gap: 10,
  },
  column: { flex: 1 },
  threeColumns: {
    flexDirection: "row",
    gap: 8,
  },
  smallColumn: { flex: 1 },
  countryGrid: {
    gap: 8,
  },
  countryOption: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 13,
  },
  countryOptionSelected: {
    borderColor: "#38bdf8",
    backgroundColor: "#f0f9ff",
  },
  flag: { fontSize: 21, marginRight: 11 },
  countryText: {
    flex: 1,
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  countryTextSelected: {
    color: "#075985",
    fontWeight: "800",
  },
  customCountryBox: {
    marginTop: 13,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    padding: 13,
  },
  currencyPreview: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    padding: 14,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  currencyPreviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  currencySymbol: {
    color: "#0369a1",
    fontSize: 18,
    fontWeight: "800",
  },
  currencyPreviewCopy: { flex: 1 },
  currencyPreviewLabel: {
    color: "#64748b",
    fontSize: 10.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  currencyPreviewValue: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 2,
  },
  currencyPreviewMeta: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  accordionBody: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
    paddingTop: 3,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
  },
  switchCopy: {
    flex: 1,
    paddingRight: 15,
  },
  switchTitle: {
    color: "#1e293b",
    fontSize: 13,
    fontWeight: "700",
  },
  switchSubtitle: {
    color: "#64748b",
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 3,
  },
  readyCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    backgroundColor: "#0d211a",
    borderWidth: 1,
    borderColor: "#1b4935",
    padding: 14,
    marginTop: 14,
  },
  readyIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#123b29",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  readyCopy: { flex: 1 },
  readyTitle: {
    color: "#dcfce7",
    fontSize: 13,
    fontWeight: "700",
  },
  readySubtitle: {
    color: "#86a995",
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 3,
  },
  saveButtonOuter: {
    marginTop: 18,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.28,
    shadowRadius: 15,
    elevation: 7,
  },
  saveButton: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  disabledButton: { opacity: 0.65 },
  saveText: {
    color: "#ffffff",
    fontSize: 15.5,
    fontWeight: "800",
  },
  footerText: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 15,
    paddingHorizontal: 20,
  },
});

export default CompanyProfileScreen;