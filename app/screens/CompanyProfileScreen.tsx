// import { useAuth } from "@/context/AuthContext";
// import { getProUserStatus } from "@/context/ProUserContext";
// import { getCompanyProfile, saveCompanyProfile } from "@/lib/storage";
// import { isGuest } from "@/utils/guest";
// import * as FileSystem from "expo-file-system";
// import * as ImagePicker from "expo-image-picker";
// import { router } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const CompanyProfileScreen = () => {
//   const { user } = useAuth();
//   const [companyName, setCompanyName] = useState("");
//   const [address, setAddress] = useState("");
//   const [phoneNumber, setPhone] = useState("");
//   const [logo, setLogo] = useState<string | undefined>(undefined);

//   const [isGuestUser, setIsGuestUser] = useState(false);
//   const [isProUser, setIsProUser] = useState(false);
//   const [loading, setLoading] = useState(false);

//   /**
//    * ✅ Determine access level
//    */
//   useEffect(() => {
//     const initAccess = async () => {
//       const guest = await isGuest();
//       const pro = await getProUserStatus();
//       setIsGuestUser(guest);
//       setIsProUser(pro);
//     };
//     initAccess();
//   }, []);

//   /**
//    * ✅ Load profile
//    */
//   useEffect(() => {
//   const loadProfile = async () => {
//     try {
//       const id = user?.$id || "guest";
//       const profile = await getCompanyProfile(id);

//       if (profile) {
//         setCompanyName(profile.companyName || "");
//         setAddress(profile.address || "");
//         setPhone(profile.phoneNumber || "");
//         setLogo(profile.logoLocal); // always resolved (file:/// or preview URL)
//       }
//     } catch (err) {
//       console.error("❌ Failed to load profile:", err);
//     }
//   };

//   loadProfile();
// }, [user]);


//   /**
//    * ✅ Pick and convert logo to base64
//    */
//   const handlePickLogo = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.9,
//       });

//       if (!result.canceled) {
//         const pickedUri = result.assets[0].uri;
//         const fileName = pickedUri.split("/").pop();
//         const newPath = `${FileSystem.documentDirectory}${fileName}`;

//         // ✅ copy to permanent directory
//         await FileSystem.copyAsync({ from: pickedUri, to: newPath });
//         setLogo(newPath);
//         console.log("✅ Logo saved locally:", newPath);
//       }
//     } catch (err) {
//       console.error("❌ Error picking logo:", err);
//     }
//   };
//   /**
//    * ✅ Save profile
//    */
//   const handleSave = async () => {
//   try {
//     const guest = await isGuest();
//     const pro = await getProUserStatus();

//     // 🚫 Restrict guest users if not Pro
//     if (guest && !pro) {
//       Alert.alert(
//         "Upgrade Required",
//         "Saving your company profile is a Pro feature. Please subscribe to unlock this option."
//       );
//       return;
//     }

//     setLoading(true);

//     // 🧩 Build payload for saveCompanyProfile()
//     const updatedProfile = await saveCompanyProfile({
//       companyName,
//       address,
//       phoneNumber,
//       logoLocal: logo || "",
//       logoCloud: ""
//     });

//     if (updatedProfile) {
//       const message =
//         updatedProfile.synced === false && updatedProfile.syncedAt
//           ? "Company profile updated locally and will sync when online."
//           : "Company profile saved successfully!";

//       Alert.alert("✅ Success", message);
//       router.back();
//     } else {
//       Alert.alert("❌ Error", "Failed to save company profile.");
//     }
//   } catch (err) {
//     console.error("❌ Error saving profile:", err);
//     Alert.alert("❌ Error", "Something went wrong while saving.");
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* 🔙 Back */}
//       <TouchableOpacity
//         style={styles.closeButton}
//         onPress={() => router.push("/(tabs)")}
//       >
//         <Text style={styles.closeText}>✕</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>🏢 Company Profile</Text>

//       {isGuestUser && (
//         <Text style={styles.banner}>
//           {isProUser
//             ? "You’re using StockTally as a Guest (Pro access enabled). Your profile will be saved locally."
//             : "Guest users cannot save company profiles. Upgrade to Pro to enable this feature."}
//         </Text>
//       )}

//       {isProUser && !isGuestUser && (
//         <Text style={styles.proBadge}>⭐ Pro Account (Cloud Sync Enabled)</Text>
//       )}

//       {/* Logo */}
//       <TouchableOpacity onPress={handlePickLogo} style={styles.logoContainer}>
//         {logo ? (
//           <Image source={{ uri: logo }} style={styles.logo} />
//         ) : (
//           <Text style={styles.logoPlaceholder}>Upload Logo</Text>
//         )}
//       </TouchableOpacity>

//       {/* Form */}
//       <View style={styles.form}>
//         <TextInput
//           placeholder="Company Name"
//           value={companyName}
//           onChangeText={setCompanyName}
//           placeholderTextColor="#888"
//           style={styles.input}
//         />
//         <TextInput
//           placeholder="Address"
//           value={address}
//           onChangeText={setAddress}
//           placeholderTextColor="#888"
//           style={styles.input}
//         />
//         <TextInput
//           placeholder="phoneNumber"
//           value={phoneNumber}
//           onChangeText={setPhone}
//           placeholderTextColor="#888"
//           keyboardType="phone-pad"
//           style={styles.input}
//         />
//       </View>

//       {/* Save */}
//       <TouchableOpacity
//         onPress={handleSave}
//         style={[
//           styles.saveButton,
//           (isGuestUser && !isProUser) && { backgroundColor: "#555" },
//         ]}
//         disabled={isGuestUser && !isProUser || loading}
//       >
//         <Text style={styles.saveText}>
//           {loading ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#0A0A0A",
//     padding: 20,
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 22,
//     color: "#fff",
//     fontWeight: "bold",
//     marginTop: 70,
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   banner: {
//     backgroundColor: "#222",
//     color: "#ccc",
//     fontSize: 14,
//     padding: 10,
//     borderRadius: 8,
//     textAlign: "center",
//     marginBottom: 15,
//     width: "100%",
//   },
//   proBadge: {
//     color: "#00C853",
//     fontWeight: "600",
//     marginBottom: 10,
//   },
//   logoContainer: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#1E1E1E",
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 20,
//     overflow: "hidden",
//   },
//   logo: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   logoPlaceholder: {
//     color: "#888",
//     fontSize: 14,
//   },
//   form: {
//     width: "100%",
//   },
//   input: {
//     backgroundColor: "#1E1E1E",
//     color: "#fff",
//     borderRadius: 8,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     fontSize: 15,
//     marginBottom: 15,
//   },
//   saveButton: {
//     backgroundColor: "#007AFF",
//     borderRadius: 8,
//     paddingVertical: 14,
//     paddingHorizontal: 30,
//     marginTop: 10,
//     width: "100%",
//     alignItems: "center",
//   },
//   saveText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   closeButton: { position: "absolute", top: 50, right: 20 },
//   closeText: { fontSize: 26, fontWeight: "bold", color: "#fff" },
// });

// export default CompanyProfileScreen;
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { useCompanyProfile } from "@/context/CompanyProfileContext";
import { getProUserStatus } from "@/context/ProUserContext";
import { isGuest } from "@/utils/guest";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const countryOptions = [
  { label: "United Kingdom", country: "GB", region: "United Kingdom", currencyCode: "GBP", currencySymbol: "£", locale: "en-GB" },
  { label: "Pakistan", country: "PK", region: "Pakistan", currencyCode: "PKR", currencySymbol: "₨", locale: "en-PK" },
  { label: "United Arab Emirates", country: "AE", region: "United Arab Emirates", currencyCode: "AED", currencySymbol: "د.إ", locale: "en-AE" },
  { label: "United States", country: "US", region: "United States", currencyCode: "USD", currencySymbol: "$", locale: "en-US" },
  { label: "Other / Custom", country: "CUSTOM", region: "", currencyCode: "", currencySymbol: "", locale: "en-US" },
];

const businessTypes = [
  "Retail",
  "Wholesale",
  "Restaurant / Food",
  "Mobile Shop",
  "Grocery",
  "Clothing",
  "Pharmacy",
  "Service Business",
  "Other",
];

const CompanyProfileScreen = () => {
  const { user } = useAuth();
  const { companyProfile, updateCompanyProfile, refreshCompanyProfile } =
    useCompanyProfile();

  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [logo, setLogo] = useState<string | undefined>(undefined);

  const [businessType, setBusinessType] = useState("Retail");
  const [country, setCountry] = useState("GB");
  const [region, setRegion] = useState("United Kingdom");
  const [currencyCode, setCurrencyCode] = useState("GBP");
  const [currencySymbol, setCurrencySymbol] = useState("£");
  const [locale, setLocale] = useState("en-GB");
  const [isCustomCountry, setIsCustomCountry] = useState(false);

  const [isGuestUser, setIsGuestUser] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAccess = async () => {
      const guest = await isGuest();
      const pro = await getProUserStatus();

      setIsGuestUser(guest);
      setIsProUser(pro);
    };

    initAccess();
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

    const knownCountry = countryOptions.some(
      (item) => item.country === companyProfile.country
    );

    setIsCustomCountry(!knownCountry);
  }, [companyProfile]);

  const handleSelectCountry = (item: (typeof countryOptions)[0]) => {
    if (item.country === "CUSTOM") {
      setIsCustomCountry(true);
      setCountry("");
      setRegion("");
      setCurrencyCode("");
      setCurrencySymbol("");
      setLocale("en-US");
      return;
    }

    setIsCustomCountry(false);
    setCountry(item.country);
    setRegion(item.region);
    setCurrencyCode(item.currencyCode);
    setCurrencySymbol(item.currencySymbol);
    setLocale(item.locale);
  };

  const handlePickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });

      if (!result.canceled) {
        const pickedUri = result.assets[0].uri;
        const fileName = pickedUri.split("/").pop() || `logo_${Date.now()}.jpg`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.copyAsync({ from: pickedUri, to: newPath });
        setLogo(newPath);
      }
    } catch (err) {
      console.error("❌ Error picking logo:", err);
      Alert.alert("Error", "Could not pick logo.");
    }
  };

  const handleSave = async () => {
    try {
      if (!companyName.trim()) {
        Alert.alert("Missing Company Name", "Please enter your company or business name.");
        return;
      }

      if (!region.trim()) {
        Alert.alert("Missing Region", "Please enter your country or region.");
        return;
      }

      if (!country.trim()) {
        Alert.alert("Missing Country Code", "Please enter a country code, for example GB, PK or AE.");
        return;
      }

      if (!currencyCode.trim()) {
        Alert.alert("Missing Currency", "Please enter a currency code, for example GBP, PKR or USD.");
        return;
      }

      if (!currencySymbol.trim()) {
        Alert.alert("Missing Currency Symbol", "Please enter a currency symbol, for example £, ₨ or $.");
        return;
      }

      setLoading(true);

      await updateCompanyProfile({
        companyName: companyName.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),

        businessType,
        country: country.trim().toUpperCase(),
        region: region.trim(),
        currencyCode: currencyCode.trim().toUpperCase(),
        currencySymbol: currencySymbol.trim(),
        locale: locale.trim() || "en-US",

        logoLocal: logo || "",
        logoCloud: companyProfile?.logoCloud || "",

        userId: user?.$id || "guest",
      });

      await refreshCompanyProfile();

      Alert.alert("✅ Success", "Company profile saved successfully.");
      router.replace("/(tabs)");
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      Alert.alert("❌ Error", "Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll backgroundColor="#0A0A0A">
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🏢 Company Profile</Text>

        <Text style={styles.subtitle}>
          Set your business details, country and currency for StockTally.
        </Text>

        {isGuestUser && (
          <Text style={styles.banner}>
            Guest mode: your profile will be saved locally. Login later to link it with your account.
          </Text>
        )}

        {isProUser && !isGuestUser && (
          <Text style={styles.proBadge}>⭐ Pro Account — cloud sync enabled</Text>
        )}

        <TouchableOpacity onPress={handlePickLogo} style={styles.logoContainer}>
          {logo ? (
            <Image source={{ uri: logo }} style={styles.logo} />
          ) : (
            <Text style={styles.logoPlaceholder}>Upload Logo</Text>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>Company / Business Name</Text>
          <TextInput
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            placeholderTextColor="#888"
            style={styles.input}
          />

          <Text style={styles.label}>Business Type</Text>
          <View style={styles.optionWrap}>
            {businessTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  businessType === type && styles.optionSelected,
                ]}
                onPress={() => setBusinessType(type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    businessType === type && styles.optionTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Country / Region</Text>
          <View style={styles.optionWrap}>
            {countryOptions.map((item) => (
              <TouchableOpacity
                key={item.country}
                style={[
                  styles.optionButton,
                  (country === item.country ||
                    (item.country === "CUSTOM" && isCustomCountry)) &&
                    styles.optionSelected,
                ]}
                onPress={() => handleSelectCountry(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    (country === item.country ||
                      (item.country === "CUSTOM" && isCustomCountry)) &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isCustomCountry && (
            <>
              <Text style={styles.label}>Custom Country / Region</Text>
              <TextInput
                placeholder="e.g. Saudi Arabia"
                value={region}
                onChangeText={setRegion}
                placeholderTextColor="#888"
                style={styles.input}
              />

              <Text style={styles.label}>Country Code</Text>
              <TextInput
                placeholder="e.g. SA"
                value={country}
                onChangeText={(text) => setCountry(text.toUpperCase())}
                placeholderTextColor="#888"
                autoCapitalize="characters"
                maxLength={2}
                style={styles.input}
              />

              <Text style={styles.label}>Currency Code</Text>
              <TextInput
                placeholder="e.g. SAR"
                value={currencyCode}
                onChangeText={(text) => setCurrencyCode(text.toUpperCase())}
                placeholderTextColor="#888"
                autoCapitalize="characters"
                maxLength={3}
                style={styles.input}
              />

              <Text style={styles.label}>Currency Symbol</Text>
              <TextInput
                placeholder="e.g. ﷼"
                value={currencySymbol}
                onChangeText={setCurrencySymbol}
                placeholderTextColor="#888"
                style={styles.input}
              />

              <Text style={styles.label}>Locale</Text>
              <TextInput
                placeholder="e.g. en-SA"
                value={locale}
                onChangeText={setLocale}
                placeholderTextColor="#888"
                autoCapitalize="none"
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencyBox}>
            <Text style={styles.currencyText}>
              {currencySymbol || "?"} {currencyCode || "Currency"}
            </Text>
            <Text style={styles.currencySubText}>
              {region || "No region selected"} • {locale || "en-US"}
            </Text>
          </View>

          <Text style={styles.label}>Address</Text>
          <TextInput
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#888"
            style={styles.input}
            multiline
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhone}
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, loading && { opacity: 0.7 }]}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Saving..." : "Save Profile"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0A0A0A",
    padding: 20,
    alignItems: "center",
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 70,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  banner: {
    backgroundColor: "#222",
    color: "#ccc",
    fontSize: 14,
    padding: 10,
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 15,
    width: "100%",
  },
  proBadge: {
    color: "#00C853",
    fontWeight: "600",
    marginBottom: 10,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoPlaceholder: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  optionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionText: {
    color: "#ccc",
    fontSize: 13,
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  currencyBox: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  currencyText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  currencySubText: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 3,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  closeText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default CompanyProfileScreen;