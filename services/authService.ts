// // services/authService.ts
// import { Router } from 'expo-router';
// import { Alert } from 'react-native';
// import { account, ID } from '../appwrite';

// // 🔄 **List All Active Sessions**
// export const listSessions = async (): Promise<any | undefined> => {
//   try {
//     const sessions = await account.listSessions();
//     console.log("Active Sessions:", sessions);
//     return sessions;
//   } catch (error: any) {
//     console.error("Error fetching sessions:", error.message);
//   }
// };

// // 🔄 **Login Function**
// export const handleLogin = async (
//   email: string,
//   password: string,
//   router: Router
// ): Promise<void> => {
//   try {
//     console.log(`🔄 Attempting to login with email: ${email} and password: ${password}`);

//     // ✅ Correctly create a session
//     const session = await account.createEmailPasswordSession(email.trim(), password);

//     // 🔎 Verify the user info
//     const user = await account.get();

//     console.log("User Info:", user);
//     Alert.alert("Login Successful");
//     router.push('../screens/DashboardScreen');
//   } catch (error: any) {
//     console.error("🚩 Login Error:", error.message);
//     Alert.alert("Login Failed", error.message);
//   }
// };

// // 🔄 **Sign Up Function**
// export const handleSignUp = async (
//   email: string,
//   password: string,
//   router: Router
// ): Promise<void> => {
//   try {
//     console.log(`Registering user: ${email}`);

//     // ✅ Generate a proper Appwrite unique ID
//     await account.create(ID.unique(), email.trim(), password);

//     Alert.alert("Account Created Successfully");
//     router.push('./screens/DashboardScreen');
//   } catch (error: any) {
//     Alert.alert("Sign Up Failed", error.message);
//   }
// };
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { account, ID } from '../appwrite';

/**
 * 🔄 List all active sessions
 */
export const listSessions = async () => {
  try {
    const sessions = await account.listSessions();
    console.log("✅ Active Sessions:", sessions);
    return sessions;
  } catch (error: any) {
    console.error("❌ Error fetching sessions:", error.message);
    return null;
  }
};

/**
 * 🔐 Login with email + password
 */
export const login = async (email: string, password: string) => {
  try {
    await account.createEmailPasswordSession(email.trim(), password);

    const user = await account.get(); // fetch user profile
    console.log("✅ Logged in user:", user);

    Alert.alert("Login Successful");
    router.replace('/(tabs)'); // go to main app
    return user;
  } catch (error: any) {
    console.error("🚩 Login Error:", error.message);
    Alert.alert("Login Failed", error.message || "Something went wrong");
    throw error;
  }
};

/**
 * 🆕 Register a new account
 */
export const register = async (name: string, email: string, password: string) => {
  try {
    await account.create(ID.unique(), email.trim(), password, name.trim());

    // Auto-login after registration
    await account.createEmailPasswordSession(email.trim(), password);

    const user = await account.get();
    console.log("✅ Registered user:", user);

    Alert.alert("Registration Successful");
    router.replace('/(tabs)');
    return user;
  } catch (error: any) {
    console.error("🚩 Registration Error:", error.message);
    Alert.alert("Registration Failed", error.message || "Something went wrong");
    throw error;
  }
};

/**
 * 🚪 Logout current session
 */
export const logout = async () => {
  try {
    await account.deleteSession('current');
    console.log("✅ Logged out");
    router.replace('/(auth)/LoginScreen'); // back to login screen
  } catch (error: any) {
    console.error("❌ Logout Error:", error.message);
    Alert.alert("Logout Failed", error.message || "Something went wrong");
    throw error;
  }
};
