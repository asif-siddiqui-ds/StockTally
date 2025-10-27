// // app/screens/Login.tsx
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
// import { account } from '../../appwrite';

// const LoginScreen: React.FC = () => {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');

//   const handleLogin = async () => {
//     try {
//       await account.createEmailPasswordSession(email.trim(), password);
//       Alert.alert("Login Successful");
//       router.push('../(tabs)');
//     } catch (error: any) {
//       Alert.alert("Login Failed", error.message);
//     }
//   };

//   return (
//     <ScreenWrapper>
//     <View style={styles.container}>
//       <Text style={styles.label}>Email:</Text>
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Enter your email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       <Text style={styles.label}>Password:</Text>
//       <TextInput
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         placeholder="Enter your password"
//         secureTextEntry
//         autoCapitalize="none"
//       />
//       <Button title="Login" onPress={handleLogin} />
//     </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   label: {
//     marginBottom: 5,
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
// });

// export default LoginScreen;

// import { account, ID } from '@/appwrite';
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import React, { useState } from 'react';
// import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

// const LoginScreen: React.FC = () => {
//   const { setUser } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');

//   const handleLogin = async () => {
//     try {
//       await account.createEmailPasswordSession(email.trim(), password);
//       const user = await account.get();
//       setUser(user);
//       Alert.alert('Login Successful');
//     } catch (error: any) {
//       Alert.alert('Login Failed', error.message);
//     }
//   };

//   const handleSignup = async () => {
//     try {
//       await account.create(ID.unique(), email.trim(), password);
//       await account.createEmailPasswordSession(email.trim(), password);
//       const user = await account.get();
//       setUser(user);
//       Alert.alert('Account Created & Logged In');
//     } catch (error: any) {
//       Alert.alert('Signup Failed', error.message);
//     }
//   };

//   const handleForgotPassword = async () => {
//     try {
//       // ⚠️ Replace with your Appwrite recovery URL
//       await account.createRecovery(email.trim(), 'https://your-app.com/reset');
//       Alert.alert('Password reset email sent!');
//       setMode('login');
//     } catch (error: any) {
//       Alert.alert('Failed to send reset email', error.message);
//     }
//   };

//   return (
//     <ScreenWrapper>
//       <View style={styles.container}>
//         <Text style={styles.title}>
//           {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Forgot Password'}
//         </Text>

//         <Text style={styles.label}>Email:</Text>
//         <TextInput
//           style={styles.input}
//           value={email}
//           onChangeText={setEmail}
//           placeholder="Enter your email"
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />

//         {mode !== 'forgot' && (
//           <>
//             <Text style={styles.label}>Password:</Text>
//             <TextInput
//               style={styles.input}
//               value={password}
//               onChangeText={setPassword}
//               placeholder="Enter your password"
//               secureTextEntry
//               autoCapitalize="none"
//             />
//           </>
//         )}

//         {mode === 'login' && <Button title="Login" onPress={handleLogin} />}
//         {mode === 'signup' && <Button title="Sign Up" onPress={handleSignup} />}
//         {mode === 'forgot' && <Button title="Send Reset Email" onPress={handleForgotPassword} />}

//         {/* Switch Modes */}
//         {mode === 'login' && (
//           <>
//             <Button title="Need an account? Sign Up" onPress={() => setMode('signup')} />
//             <Button title="Forgot Password?" onPress={() => setMode('forgot')} />
//           </>
//         )}
//         {mode === 'signup' && (
//           <Button title="Already have an account? Login" onPress={() => setMode('login')} />
//         )}
//         {mode === 'forgot' && (
//           <Button title="Back to Login" onPress={() => setMode('login')} />
//         )}
//       </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   label: { marginBottom: 5 },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
// });

// // export default LoginScreen;

// import { account, ID } from '@/appwrite';
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// const LoginScreen: React.FC = () => {
//   const { setUser, setMode } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');

//   // 🔑 Login
//   const handleLogin = async () => {
//     try {
//       await account.createEmailPasswordSession(email.trim(), password);
//       const user = await account.get();
//       setUser(user);
//       setMode("pro"); // Logged in → Pro mode
//       Alert.alert('Login Successful');
//       router.replace('/(tabs)'); // Go to app
//     } catch (error: any) {
//       Alert.alert('Login Failed', error.message);
//     }
//   };

//   // 📝 Signup
//   const handleSignUp = async () => {
//     try {
//       await account.create(ID.unique(), email.trim(), password, name || "User");
//       await account.createEmailPasswordSession(email.trim(), password);
//       const newUser = await account.get();
//       setUser(newUser);
//       setMode("pro"); // Signup → Pro mode
//       Alert.alert('Account Created');
//       router.replace('/(tabs)');
//     } catch (error: any) {
//       Alert.alert('Sign Up Failed', error.message);
//     }
//   };

//   // 🚪 Guest Mode
//   const handleGuest = () => {
//     setUser(null);       // no Appwrite user
//     setMode("free");     // free mode
//     Alert.alert("Continuing as Guest");
//     router.replace('/(tabs)');
//   };

//   return (
//     <ScreenWrapper>
//       <View style={styles.container}>
//         <Text style={styles.title}>StockTally Login</Text>

//         <TextInput
//           style={styles.input}
//           value={name}
//           onChangeText={setName}
//           placeholder="Name (only for Sign Up)"
//         />

//         <TextInput
//           style={styles.input}
//           value={email}
//           onChangeText={setEmail}
//           placeholder="Email"
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />

//         <TextInput
//           style={styles.input}
//           value={password}
//           onChangeText={setPassword}
//           placeholder="Password"
//           secureTextEntry
//           autoCapitalize="none"
//         />

//         <View style={styles.buttonRow}>
//           <Button title="Login" onPress={handleLogin} />
//           <Button title="Sign Up" onPress={handleSignUp} />
//         </View>

//         <TouchableOpacity onPress={handleGuest} style={styles.guestButton}>
//           <Text style={styles.guestText}>Continue as Guest</Text>
//         </TouchableOpacity>
//       </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
//   input: {
//     height: 45,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   guestButton: {
//     marginTop: 10,
//     padding: 15,
//     backgroundColor: '#eee',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   guestText: { color: '#555', fontWeight: '600' },
// });

// // app/(auth)/LoginScreen.tsx
// import { account } from '@/appwrite';
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { clearActiveSession, useAuth } from '@/context/AuthContext';
// import { configureRevenueCat  } from '@/lib/revenuecat';
// import { backupDataToCloud } from '@/lib/storage'; // ✅ added import
// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import Purchases from 'react-native-purchases';

// const LoginScreen: React.FC = () => {
//   const { setUser } = useAuth(); // ✅ removed migrateToCloud — no longer needed
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [mode, setMode] = useState<'login' | 'signup'>('login');

//   // 🔐 Login
//   const handleLogin = async () => {
//     await clearActiveSession();
//     try {
//       // 1️⃣ Authenticate with Appwrite
//       await account.createEmailPasswordSession(email.trim(), password);

//       // 2️⃣ Fetch current user
//       const currentUser = await account.get();
//       setUser(currentUser);

//       // 3️⃣ Link with RevenueCat
//       await configureRevenueCat (currentUser.$id);

//       // 4️⃣ Get entitlement info
//       const customerInfo = await Purchases.getCustomerInfo();
//       const hasPro = !!customerInfo.entitlements.active["Pro"];

//       // 5️⃣ If Pro, migrate local guest data
//       if (hasPro) {
//         await backupDataToCloud(currentUser.$id);
//       }

//       Alert.alert("✅ Login Successful");
//       router.replace("/(tabs)");
//     } catch (err: any) {
//       Alert.alert("Login Failed", err.message);
//     }
//   };

//   // 📝 Signup
//   const handleSignup = async () => {
//     try {
//       // 1️⃣ Create new Appwrite account
//       await account.create('unique()', email.trim(), password);

//       // 2️⃣ Log in new user
//       await account.createEmailPasswordSession(email.trim(), password);

//       // 3️⃣ Fetch user
//       const newUser = await account.get();
//       setUser(newUser);

//       // 4️⃣ Connect RevenueCat
//       await configureRevenueCat(newUser.$id);

//       // 5️⃣ Check if already Pro (RevenueCat)
//       const customerInfo = await Purchases.getCustomerInfo();
//       const hasPro = !!customerInfo.entitlements.active["Pro"];

//       // 6️⃣ If Pro, migrate data
//       if (hasPro) {
//         await migrateDataToCloud(newUser.$id);
//       }

//       Alert.alert("✅ Account Created");
//       router.replace("/(tabs)");
//     } catch (err: any) {
//       Alert.alert("Sign Up Failed", err.message);
//     }
//   };

//   // 🔄 Forgot Password
//   const handleForgotPassword = async () => {
//     try {
//       await account.createRecovery(email.trim(), "https://yourwebsite.com/reset");
//       Alert.alert("Password reset link sent!");
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     }
//   };

//   return (
//     <ScreenWrapper>
//       <View style={styles.container}>
//         <Text style={styles.title}>{mode === 'login' ? 'Login' : 'Sign Up'}</Text>

//         <TextInput
//           style={styles.input}
//           value={email}
//           onChangeText={setEmail}
//           placeholder="Email"
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput
//           style={styles.input}
//           value={password}
//           onChangeText={setPassword}
//           placeholder="Password"
//           secureTextEntry
//           autoCapitalize="none"
//         />

//         {mode === 'login' ? (
//           <>
//             <Button title="Login" onPress={handleLogin} />
//             <TouchableOpacity onPress={() => setMode('signup')}>
//               <Text style={styles.link}>Don’t have an account? Sign Up</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={handleForgotPassword}>
//               <Text style={styles.link}>Forgot Password?</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             <Button title="Sign Up" onPress={handleSignup} />
//             <TouchableOpacity onPress={() => setMode('login')}>
//               <Text style={styles.link}>Already have an account? Login</Text>
//             </TouchableOpacity>
//           </>
//         )}

//         <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
//           <Text style={styles.cancel}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   link: { marginTop: 10, color: '#007BFF', textAlign: 'center' },
//   cancel: { marginTop: 20, color: 'red', textAlign: 'center' },
// });

// export default LoginScreen;
// function migrateDataToCloud($id: string) {
//   throw new Error('Function not implemented.');
// }

import { account } from "@/appwrite";
import { clearActiveSession, useAuth } from "@/context/AuthContext";
import { configureRevenueCat } from "@/lib/revenuecat";
import { syncAllData } from "@/lib/sync";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Purchases from "react-native-purchases";

const LoginScreen: React.FC = () => {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  // // 🔐 Login handler
  // const handleLogin = async () => {
  //   setLoading(true);
  //   await clearActiveSession();
  //   try {
  //     await account.createEmailPasswordSession(email.trim(), password);
  //     const currentUser = await account.get();
  //     setUser(currentUser);

  //     await configureRevenueCat(currentUser.$id);
  //     const customerInfo = await Purchases.getCustomerInfo();
  //     const hasPro = !!customerInfo.entitlements.active["Pro"];

  //     if (hasPro) await syncAllData(currentUser.$id);

  //     Alert.alert("✅ Login Successful");
  //     router.replace("/(tabs)");
  //   } catch (err: any) {
  //     Alert.alert("Login Failed", err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // 🔐 Login handler (final, production-safe)
  const handleLogin = async () => {
    // 1️⃣ Validation first
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Credentials", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    console.log("🔹 Login started");

    // 2️⃣ Small helper for timeout protection
    const timeout = (ms) =>
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms));

    try {
      // 🧹 Clear any old session safely
      await clearActiveSession().catch(() => {});

      // 3️⃣ Create Appwrite session (v12+ syntax)
      console.log("🔹 Creating Appwrite session...");
      const session = await Promise.race([
        account.createEmailPasswordSession(email.trim(), password),
        timeout(10000), // ⏱️ fail gracefully after 10s
      ]);
      console.log("✅ Session created:", session.$id);

      // 4️⃣ Fetch user
      const currentUser = await account.get();
      console.log("✅ User fetched:", currentUser.email);
      setUser(currentUser);

      // 5️⃣ Configure RevenueCat
      try {
        console.log("🔹 Configuring RevenueCat...");
        await configureRevenueCat(currentUser.$id);
        console.log("✅ RevenueCat configured");
      } catch (err) {
        console.warn("⚠️ RevenueCat init failed:", err.message);
      }

      // 6️⃣ Get entitlements
      let hasPro = false;
      try {
        const info = await Purchases.getCustomerInfo();
        hasPro = !!info.entitlements.active["Pro"];
        console.log("✅ hasPro:", hasPro);
      } catch (err) {
        console.warn("⚠️ Failed to fetch entitlements:", err.message);
      }

      // 7️⃣ Optional sync if Pro
      if (hasPro) {
        try {
          console.log("🔹 Running sync...");
          await syncAllData(currentUser.$id);
          console.log("✅ Sync complete");
        } catch (err) {
          console.warn("⚠️ Sync failed:", err.message);
        }
      }

      Alert.alert("✅ Login Successful", hasPro ? "Pro access restored!" : "Welcome back!");
      router.replace("/(tabs)");
    } catch (err: any) {
      // 🧠 Handle user-friendly error messages
      const msg =
        err.message?.includes("invalid credentials") || err.message?.includes("Invalid credentials")
          ? "Incorrect email or password."
          : err.message?.includes("Timeout")
          ? "Connection timed out. Please check your internet."
          : err.message || "An unexpected error occurred.";
      console.error("❌ Login failed:", msg);
      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
      console.log("🔹 Login finished (loading=false)");
    }
  };


  // 📝 Sign Up handler
  const handleSignup = async () => {
    setLoading(true);
    try {
      await account.create("unique()", email.trim(), password);
      await account.createEmailPasswordSession(email.trim(), password);

      const newUser = await account.get();
      setUser(newUser);

      await configureRevenueCat(newUser.$id);
      const customerInfo = await Purchases.getCustomerInfo();
      const hasPro = !!customerInfo.entitlements.active["Pro"];

      if (hasPro) await syncAllData(newUser.$id);

      Alert.alert("✅ Account Created");
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await account.createRecovery(email.trim(), "https://yourwebsite.com/reset");
      Alert.alert("Password reset link sent!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleGuest = () => {
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
      <View style={styles.container}>
        {/* 🏷️ App Logo + Title */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/icon.png")}
            style={{ width: 80, height: 80, marginBottom: 10 }}
          />
          <Text style={styles.appTitle}>StockTally</Text>
          <Text style={styles.subtitle}>Smart Stock & Sales Tracker</Text>
        </View>

        {/* 📧 Inputs */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#aab4c8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#aab4c8"
            secureTextEntry
            autoCapitalize="none"
          />

          {/* 🔘 Main Button */}
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

          {/* Toggle links */}
          {mode === "login" ? (
            <>
              <TouchableOpacity onPress={() => setMode("signup")}>
                <Text style={styles.link}>Don’t have an account? Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.link}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setMode("login")}>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          )}

          {/* 🧭 Continue as Guest */}
          <TouchableOpacity onPress={handleGuest} style={styles.guestButton}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    marginTop: 80,
    justifyContent: "flex-start",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f0f4f8",
  },
  subtitle: {
    fontSize: 14,
    color: "#aab4c8",
  },
  form: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
  },
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
  mainButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    color: "#89c2d9",
    textAlign: "center",
    marginTop: 10,
  },
  guestButton: {
    marginTop: 20,
    alignItems: "center",
  },
  guestText: {
    color: "#f9b42d",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default LoginScreen;
