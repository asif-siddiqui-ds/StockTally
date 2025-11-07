import { account } from "@/appwrite";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const ResetPasswordScreen = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Extract deep link query parameters
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const { queryParams } = Linking.parse(event.url);
      setUserId(queryParams.userId || "");
      setSecret(queryParams.secret || "");
    };

    Linking.addEventListener("url", handleUrl);

    // Also handle the initial URL if app opened via link
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) handleUrl({ url: initialUrl });
    })();

    return () => {
      Linking.removeAllListeners("url");
    };
  }, []);

  const handleReset = async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }
    if (!userId || !secret) {
      Alert.alert("Error", "Invalid or missing recovery link.");
      return;
    }

    setLoading(true);
    try {
      await account.updateRecovery(userId, secret, password.trim());
      Alert.alert("✅ Success", "Password reset successfully! Please log in again.");
      router.replace("/screens/auth/LoginScreen");
    } catch (err: any) {
      console.error("Password reset failed:", err);
      Alert.alert("Error", err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password below.</Text>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1b263b", padding: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#ccc", textAlign: "center", marginBottom: 20 },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default ResetPasswordScreen;
