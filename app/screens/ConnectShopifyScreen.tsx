import { Colors } from "@/constants/Colors"; // optional if you use a color theme
import { useAuth } from "@/context/AuthContext"; // your existing auth hook
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AUTH_FUNCTION_URL = "https://690f7dac0018d682fede.fra.appwrite.run"; // 🔗 your shopify-auth-handler domain

export default function ConnectShopifyScreen() {
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleConnect = async () => {
    if (!storeName) {
      Alert.alert("Missing Store Name", "Please enter your Shopify store name.");
      return;
    }

    // Ensure domain format
    const shopDomain = storeName.includes(".myshopify.com")
      ? storeName.trim()
      : `${storeName.trim()}.myshopify.com`;

    try {
      setLoading(true);
      const url = `${AUTH_FUNCTION_URL}?install&shop=${encodeURIComponent(
        shopDomain
      )}`;

      // Add Appwrite user ID header so token is linked correctly
      await WebBrowser.openBrowserAsync(url, {
        headers: { "x-stocktally-user-id": user?.$id ?? "" },
      } as any);

      Alert.alert(
        "Shopify Connection",
        "Once you approve in Shopify, your store will be connected to StockTally."
      );
    } catch (err: any) {
      console.error("Shopify Connect error:", err);
      Alert.alert("Error", "Failed to connect with Shopify.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Your Shopify Store</Text>
      <Text style={styles.subtitle}>
        Enter your store name (e.g. <Text style={{ fontWeight: "600" }}>mystore</Text>)
      </Text>

      <TextInput
        placeholder="Enter Shopify store name"
        value={storeName}
        onChangeText={setStoreName}
        autoCapitalize="none"
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleConnect}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Connect Shopify</Text>
        )}
      </TouchableOpacity>

      <GradientButton
          title="Home Page"
          colors={['#4CAF50', '#2E7D32']}
          onPress={() => router.push("/(tabs)")}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary ?? "#0066cc",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
