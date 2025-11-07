import { account } from "@/appwrite";
import { clearActiveSession, useAuth } from "@/context/AuthContext";
import { configureRevenueCat } from "@/lib/revenuecat";
import { syncAllData } from "@/lib/sync";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Purchases from "react-native-purchases";



const LoginScreen: React.FC = () => {
  const { setUser, loginWithApple, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  /* ────────────────────────────────
     🔐 Email/Password Login
  ──────────────────────────────── */
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Credentials", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await clearActiveSession(); // 🧹 ensure Apple/Google sessions are cleared

      await account.createEmailPasswordSession(email.trim(), password);
      const currentUser = await account.get();
      setUser(currentUser);

      await configureRevenueCat(currentUser.$id);
      const info = await Purchases.getCustomerInfo();
      if (info.entitlements.active["Pro"]) await syncAllData(currentUser.$id);

      Alert.alert("✅ Login Successful");
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────
     📝 Email Sign-Up
  ──────────────────────────────── */
  const handleSignup = async () => {
    setLoading(true);
    try {
      await clearActiveSession();
      await account.create("unique()", email.trim(), password);
      await account.createEmailPasswordSession(email.trim(), password);
      const newUser = await account.get();
      setUser(newUser);

      await configureRevenueCat(newUser.$id);
      const info = await Purchases.getCustomerInfo();
      if (info.entitlements.active["Pro"]) await syncAllData(newUser.$id);

      Alert.alert("✅ Account Created");
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────
     🍎 Apple Sign-In (via AuthContext)
  ──────────────────────────────── */
  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      // 1️⃣ Generate nonce/state for Apple’s JWT signing
      const rawNonce = Math.random().toString(36).substring(2);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );
      const state = Math.random().toString(36).substring(2);

      // 2️⃣ Trigger Apple Sign-In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
        state,
      });

      console.log("🍎 Apple credentials received:", credential);

      if (!credential.identityToken) {
        throw new Error("Missing Apple identity token");
      }

      // 3️⃣ Prepare the Appwrite Function endpoint
      const FUNCTION_URL = "https://69093d66001f6733e9bb.fra.appwrite.run";
      const PROJECT_ID = "68215c9f00161f204345";

      console.log("🧾 Sending payload to Appwrite:", JSON.stringify({
        identityToken: credential.identityToken?.substring(0, 20) + "...",
        email: credential.email,
      }));

      // 4️⃣ Send token to your backend function
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "X-Appwrite-Project": PROJECT_ID, // ✅ required for Appwrite Functions
        },
        body: JSON.stringify({
          token: credential.identityToken,
          email: credential.email || null,
        }),
      });

      const data = await response.json();
      console.log("✅ Appwrite function response:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to create Appwrite session");
      }

      await loginWithApple(data.userId, data.secret);
      Alert.alert("✅ Signed in successfully!");
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("❌ Apple Sign-In error:", err);
      Alert.alert("Apple Sign-In Failed", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  WebBrowser.maybeCompleteAuthSession();

  

  const handleGoogleSignIn= async () => {
    setLoading(true);
    
    try {
      const GOOGLE_CLIENT_ID = "731010852145-n30maj98882un9rqferl9egdp8bchahs.apps.googleusercontent.com";
      const APPWRITE_PROJECT_ID = "68215c9f00161f204345";
      const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";

      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

      const authUrl = `${APPWRITE_ENDPOINT}/account/sessions/oauth2/google?project=${APPWRITE_PROJECT_ID}&success=${encodeURIComponent(
        redirectUri)}&failure=${encodeURIComponent(redirectUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success" && result.url) {
          
        const parsed = AuthSession.parse(result.url);
        console.log("✅ Returned URL:", result.url);
        // After redirect, Appwrite already created the session — just fetch it

        const currentUser = await account.get();
        const { setUser } = useAuth();
        setUser(currentUser);
        await configureRevenueCat(currentUser.$id);
        const info = await Purchases.getCustomerInfo();
        if (info.entitlements.active["Pro"]) await syncAllData(currentUser.$id);
        
        Alert.alert("✅ Google Sign-In", `Welcome ${currentUser.name || currentUser.email}!`);
        router.replace("/(tabs)/dashboard");
      } else {
        Alert.alert("Google Sign-In Cancelled");
      }
    } catch (err: any) {
      console.error("❌ Google Sign-In failed:", err);
      Alert.alert("Google Sign-In Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ────────────────────────────────
     🧭 Guest Access
  ──────────────────────────────── */
  const handleGuest = () => router.replace("/(tabs)/dashboard");

  /* ────────────────────────────────
     💅 UI
  ──────────────────────────────── */
  return (
    <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
      <View style={styles.container}>
        {/* 🏷️ Header */}
        <View style={styles.header}>
          <Image source={require("@/assets/icon.png")} style={{ width: 80, height: 80 }} />
          <Text style={styles.appTitle}>StockTally</Text>
          <Text style={styles.subtitle}>Smart Stock & Sales Tracker</Text>
        </View>

        {/* 📧 Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aab4c8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aab4c8"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.mainButton}
            onPress={mode === "login" ? handleLogin : handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainButtonText}>
                {mode === "login" ? "Login" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          {mode === "login" ? (
            <>
              <TouchableOpacity onPress={() => setMode("signup")}>
                <Text style={styles.link}>Don’t have an account? Sign Up</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setMode("login")}>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          )}

          {/* 🍎 Apple Sign-In */}
          {Platform.OS === "ios" && (
            <View style={styles.appleContainer}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={8}
                style={styles.appleButton}
                onPress={handleAppleLogin}
              />
            </View>
          )}
          {/* 🔵 Google Sign-In */}
          {Platform.OS === "android" ? (
            <TouchableOpacity  onPress={handleGoogleSignIn}>
            {/* <Image source={require("@/assets/google-icon.png")} style={{ width: 20, height: 20, marginRight: 8 }} /> */}
            <Text >Continue with Google</Text>
          </TouchableOpacity>
          ) : null}

          {/* 👤 Guest */}
          <TouchableOpacity onPress={handleGuest} style={styles.guestButton}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99,
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Please wait…</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, marginTop: 80, justifyContent: "flex-start", padding: 24 },
  header: { alignItems: "center", marginBottom: 30 },
  appTitle: { fontSize: 28, fontWeight: "700", color: "#f0f4f8" },
  subtitle: { fontSize: 14, color: "#aab4c8" },
  form: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 20 },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    marginBottom: 15,
    fontSize: 15,
  },
  mainButton: {
    backgroundColor: "#4cc9f0",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  mainButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#89c2d9", textAlign: "center", marginTop: 10 },
  appleContainer: { marginTop: 20, alignItems: "center" },
  appleButton: { width: "100%", height: 45 },
  guestButton: { marginTop: 20, alignItems: "center" },
  guestText: { color: "#f9b42d", fontSize: 15, fontWeight: "600" },
});

export default LoginScreen;
