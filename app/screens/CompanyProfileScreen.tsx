import { useAuth } from "@/context/AuthContext";
import { getProUserStatus } from "@/context/ProUserContext";
import { getCompanyProfile, saveCompanyProfile } from "@/lib/storage";
import { isGuest } from "@/utils/guest";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CompanyProfileScreen = () => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [logo, setLogo] = useState<string | undefined>(undefined);

  const [isGuestUser, setIsGuestUser] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * ✅ Determine access level
   */
  useEffect(() => {
    const initAccess = async () => {
      const guest = await isGuest();
      const pro = await getProUserStatus();
      setIsGuestUser(guest);
      setIsProUser(pro);
    };
    initAccess();
  }, []);

  /**
   * ✅ Load profile
   */
  useEffect(() => {
  const loadProfile = async () => {
    try {
      const id = user?.$id || "guest";
      const profile = await getCompanyProfile(id);

      if (profile) {
        setCompanyName(profile.companyName || "");
        setAddress(profile.address || "");
        setPhone(profile.phoneNumber || "");
        setLogo(profile.logoLocal); // always resolved (file:/// or preview URL)
      }
    } catch (err) {
      console.error("❌ Failed to load profile:", err);
    }
  };

  loadProfile();
}, [user]);


  /**
   * ✅ Pick and convert logo to base64
   */
  const handlePickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });

      if (!result.canceled) {
        const pickedUri = result.assets[0].uri;
        const fileName = pickedUri.split("/").pop();
        const newPath = `${FileSystem.documentDirectory}${fileName}`;

        // ✅ copy to permanent directory
        await FileSystem.copyAsync({ from: pickedUri, to: newPath });
        setLogo(newPath);
        console.log("✅ Logo saved locally:", newPath);
      }
    } catch (err) {
      console.error("❌ Error picking logo:", err);
    }
  };
  /**
   * ✅ Save profile
   */
  const handleSave = async () => {
  try {
    const guest = await isGuest();
    const pro = await getProUserStatus();

    // 🚫 Restrict guest users if not Pro
    if (guest && !pro) {
      Alert.alert(
        "Upgrade Required",
        "Saving your company profile is a Pro feature. Please subscribe to unlock this option."
      );
      return;
    }

    setLoading(true);

    // 🧩 Build payload for saveCompanyProfile()
    const updatedProfile = await saveCompanyProfile({
      companyName,
      address,
      phoneNumber,
      logoLocal: logo || "",
      logoCloud: ""
    });

    if (updatedProfile) {
      const message =
        updatedProfile.synced === false && updatedProfile.syncedAt
          ? "Company profile updated locally and will sync when online."
          : "Company profile saved successfully!";

      Alert.alert("✅ Success", message);
      router.back();
    } else {
      Alert.alert("❌ Error", "Failed to save company profile.");
    }
  } catch (err) {
    console.error("❌ Error saving profile:", err);
    Alert.alert("❌ Error", "Something went wrong while saving.");
  } finally {
    setLoading(false);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔙 Back */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push("/(tabs)")}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🏢 Company Profile</Text>

      {isGuestUser && (
        <Text style={styles.banner}>
          {isProUser
            ? "You’re using StockTally as a Guest (Pro access enabled). Your profile will be saved locally."
            : "Guest users cannot save company profiles. Upgrade to Pro to enable this feature."}
        </Text>
      )}

      {isProUser && !isGuestUser && (
        <Text style={styles.proBadge}>⭐ Pro Account (Cloud Sync Enabled)</Text>
      )}

      {/* Logo */}
      <TouchableOpacity onPress={handlePickLogo} style={styles.logoContainer}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.logo} />
        ) : (
          <Text style={styles.logoPlaceholder}>Upload Logo</Text>
        )}
      </TouchableOpacity>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          placeholder="Company Name"
          value={companyName}
          onChangeText={setCompanyName}
          placeholderTextColor="#888"
          style={styles.input}
        />
        <TextInput
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#888"
          style={styles.input}
        />
        <TextInput
          placeholder="phoneNumber"
          value={phoneNumber}
          onChangeText={setPhone}
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      {/* Save */}
      <TouchableOpacity
        onPress={handleSave}
        style={[
          styles.saveButton,
          (isGuestUser && !isProUser) && { backgroundColor: "#555" },
        ]}
        disabled={isGuestUser && !isProUser || loading}
      >
        <Text style={styles.saveText}>
          {loading ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0A0A0A",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 70,
    marginBottom: 15,
    textAlign: "center",
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
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoPlaceholder: {
    color: "#888",
    fontSize: 14,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 15,
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
  closeButton: { position: "absolute", top: 50, right: 20 },
  closeText: { fontSize: 26, fontWeight: "bold", color: "#fff" },
});

export default CompanyProfileScreen;
