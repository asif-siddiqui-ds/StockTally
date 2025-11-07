import { account } from "@/appwrite";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = Linking.createURL("/reset");
      await account.createRecovery(email.trim(), redirectUrl);
      Alert.alert("✅ Password Reset", "A password reset link has been sent to your email.");
      router.replace("/screens/auth/LoginScreen");
    } catch (err: any) {
      console.error("Password recovery error:", err);
      Alert.alert("Error", err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your registered email to reset your password.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleForgotPassword} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#1b263b" },
  title: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 12 },
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
  backLink: { marginTop: 15 },
  backText: { color: "#80bfff", fontSize: 14 },
});

export default ForgotPasswordScreen;
