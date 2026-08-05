// export default LoginScreen;

import { account } from "@/appwrite";
import { useAuth } from "@/context/AuthContext";
import * as AppleAuthentication from "expo-apple-authentication";
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

WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const { loginWithCredentials, loginWithUser, loginAsGuest } = useAuth();
  // ------------------------------------------------------
  // 🔐 EMAIL LOGIN
  // ------------------------------------------------------
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing info", "Please enter email & password.");
      return;
    }

    try {
      setLoading(true);
      await loginWithCredentials(email.trim(), password);
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };
  // const handleLogin = async () => {
  //   if (!email.trim() || !password.trim()) {
  //     Alert.alert("Missing info", "Please enter email & password.");
  //     return;
  //   }
  //   try {
  //     setLoading(true);
  //     await account.deleteSession("current").catch(() => {});
  //     await account.createEmailPasswordSession(email.trim(), password);
  //     const user = await account.get();
  //     setUser(user);

  //     await configureRevenueCat(user.$id);
  //     const info = await Purchases.getCustomerInfo();
  //     if (info.entitlements.active["Pro"]) await syncAllData(user.$id);

  //     router.replace("/(tabs)/dashboard");
  //   } catch (err: any) {
  //     Alert.alert("Login Failed", err.message || "Unexpected error.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ------------------------------------------------------
  // 📝 EMAIL SIGN UP
  // ------------------------------------------------------
  // const handleSignup = async () => {
  //   try {
  //     setLoading(true);
  //     await account.create("unique()", email.trim(), password);
  //     await account.createEmailPasswordSession(email.trim(), password);
  //     const newUser = await account.get();
  //     setUser(newUser);

  //     await loginWithUser(newUser.$id, newUser.$id); // Using user ID as secret for simplicity
  //     router.replace("/(tabs)");
  //   } catch (err: any) {
  //     Alert.alert("Signup Failed", err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing info", "Please enter email & password.");
      return;
    }

    try {
      setLoading(true);

      await account.create("unique()", email.trim(), password);
      await loginWithCredentials(email.trim(), password);

      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Signup Failed", err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // 🍎 APPLE LOGIN (front-end -> backend function -> AuthContext)
  // ------------------------------------------------------
  const handleAppleLogin = async () => {
    try {
      setLoading(true);

      const rawNonce = Math.random().toString(36).substring(2);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
        nonce: hashedNonce,
        state: rawNonce,
      });

      if (!credential.identityToken) throw new Error("Missing Apple token");

      const FUNCTION_URL = "https://69093d66001f6733e9bb.fra.appwrite.run";
      const PROJECT_ID = "68215c9f00161f204345";

      const resp = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "X-Appwrite-Project": PROJECT_ID,
        },
        body: JSON.stringify({
          token: credential.identityToken,
          email: credential.email || null,
        }),
      });

      const data = await resp.json();
      if (!data.success) throw new Error(data.message);

      await loginWithUser(data.userId, data.secret);
      Alert.alert("Logged in with Apple");
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Apple Sign-In Failed", err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // const handleGoogleSignIn = async () => {
  //   try {

  //     setLoading(true);

  //     const APPWRITE_PROJECT_ID = "68215c9f00161f204345";
  //     const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";

  //     const redirectUri = "https://stocktally-redirect.vercel.app/redirect";

  //     console.log("Redirect URI:", redirectUri);

  //     const oauthUrl =
  //       `${APPWRITE_ENDPOINT}/account/tokens/oauth2/google` +
  //       `?project=${APPWRITE_PROJECT_ID}` +
  //       `&success=${encodeURIComponent(redirectUri)}` +
  //       `&failure=${encodeURIComponent(redirectUri)}`;

  //     console.log("OAuth URL:", oauthUrl);

  //     const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUri);

  //     if (result.type !== "success" || !result.url) {
  //       Alert.alert("Cancelled", "Google login was cancelled.");
  //       return;
  //     }

  //     console.log("Returned URL:", result.url);

  //     const url = new URL(result.url);
  //     const secret = url.searchParams.get("secret");
  //     const userId = url.searchParams.get("userId");

  //     if (!secret || !userId) {
  //       Alert.alert("Error", "Missing OAuth session data.");
  //       return;
  //     }

  //     // await loginWithUser(userId, secret);
  //     // Alert.alert("Logged in with Google");
  //     // router.replace("/screens/CloudBackupScreen");
  //     try {
  //       await loginWithUser(userId, secret);
  //       console.log("✅ Google login session created");
  //       router.replace("/screens/PaywallScreen");
  //     } catch (loginErr) {
  //       console.log("❌ loginWithUser failed:", loginErr);
  //       throw loginErr;
  //     }
  //   } catch (err: any) {
  //       Alert.alert("Google Sign-In Failed", err.message);
  //   } finally {
  //       setLoading(false);
  //   }
  // };
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const APPWRITE_PROJECT_ID = "68215c9f00161f204345";
      const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
      const redirectUri = "https://stocktally-redirect.vercel.app/redirect";

      const oauthUrl =
        `${APPWRITE_ENDPOINT}/account/tokens/oauth2/google` +
        `?project=${APPWRITE_PROJECT_ID}` +
        `&success=${encodeURIComponent(redirectUri)}` +
        `&failure=${encodeURIComponent(redirectUri)}`;

      console.log("OAuth URL:", oauthUrl);

      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUri);

      // if (result.type !== "success" || !result.url) {
      //   Alert.alert("Cancelled", "Google login was cancelled.");
      //   return;
      // }

      if (result.type !== "success" || !result.url) {
        console.log("ℹ️ Browser result:", result);
        console.log("ℹ️ OAuth may have completed via deep link handler.");
        return;
      }

      console.log("Returned URL:", result.url);

      const url = new URL(result.url);
      const secret = url.searchParams.get("secret");
      const userId = url.searchParams.get("userId");

      if (!secret || !userId) {
        // ✅ Sometimes Appwrite session is already created even if params are missing
        try {
          const current = await account.get();

          if (current?.$id) {
            console.log("✅ Google session already active:", current.$id);
            router.replace("/screens/PaywallScreen");
            return;
          }
        } catch {}

        Alert.alert("Google Login Failed", "Missing OAuth session data.");
        return;
      }

      await loginWithUser(userId, secret);

      console.log("✅ Google login session created");

      router.replace("/screens/PaywallScreen");
    } catch (err: any) {
      // ✅ Final safety check: if user is actually logged in, do not show failed message
      try {
        const current = await account.get();

        if (current?.$id) {
          console.log("✅ Google login completed despite caught error:", current.$id);
          router.replace("/screens/PaywallScreen");
          return;
        }
      } catch {}

      console.log("❌ Google Sign-In Failed:", err);
      Alert.alert("Google Sign-In Failed", err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };
  // ------------------------------------------------------
  // UI
  // ------------------------------------------------------
  return (
    <LinearGradient colors={["#0d1b2a", "#415a77"]} style={styles.gradient}>
      <View style={styles.container}>
        <Image
          source={require("@/assets/icon.png")}
          style={{ width: 80, height: 80 }}
        />
        <Text style={styles.header}>StockTally</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.mainButton}
            onPress={mode === "login" ? handleLogin : handleSignup}
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
            <TouchableOpacity onPress={() => setMode("signup")}>
              <Text style={styles.link}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setMode("login")}>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          )}

          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={8}
              style={styles.appleButton}
              onPress={handleAppleLogin}
            />
          )}

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={async () => {
              await loginAsGuest();
              router.replace("/(tabs)");
            }}
          >
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Please wait…</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
  },
  header: { color: "#fff", fontSize: 30, marginBottom: 20 },
  form: {
    width: "85%",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: "#fff",
  },
  mainButton: {
    backgroundColor: "#4CC9F0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: { textAlign: "center", color: "#89c2d9", marginTop: 10 },
  appleButton: { height: 45, marginTop: 20 },
  googleButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    borderRadius: 10,
  },
  googleText: { color: "#000", fontSize: 16, fontWeight: "600" },
  guestButton: { marginTop: 20, alignItems: "center" },
  guestText: { color: "#FFD166", fontSize: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
