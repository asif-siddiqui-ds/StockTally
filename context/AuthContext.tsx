
// context/AuthContext.tsx
// import { account } from "@/appwrite";
// import { configureRevenueCat } from "@/lib/revenuecat";
// import { syncAllData } from "@/lib/sync";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { createContext, useContext, useEffect, useState } from "react";
// import Purchases from "react-native-purchases";




// const USER_ID_KEY = "currentUserId";
// const GUEST_KEY = "isGuest";

// interface AuthContextType {
//   user: any | null | undefined; // undefined = loading, null = guest, object = logged in
//   setUser: React.Dispatch<React.SetStateAction<any | null | undefined>>;
//   loginAsGuest: () => Promise<void>;
//   logout: () => Promise<void>;
//   loginWithCredentials: (email: string, password: string) => Promise<void>;
//   refreshSession: () => Promise<void>;
//   loginWithApple: (userId: string, secret: string) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<any | null | undefined>(undefined);

//   // ✅ Initialize and check session
//   useEffect(() => {
//     const init = async () => {
//       try {
//         const guestFlag = await AsyncStorage.getItem(GUEST_KEY);

//         if (guestFlag === "true") {
//           await account.createAnonymousSession().catch(() => {});
//           setUser(null);
//           return;
//         }

//         const currentUser = await account.get();
//         setUser(currentUser);
//         await AsyncStorage.setItem(USER_ID_KEY, currentUser.$id);
//       } catch (err) {
//         // Fallback to guest if no session found
//         await AsyncStorage.setItem(GUEST_KEY, "true");
//         await account.createAnonymousSession().catch(() => {});
//         setUser(null);
//       }
//     };
//     init();
//   }, []);

//   // ✅ Email/password login
//   const loginWithCredentials = async (email: string, password: string) => {
//     const session = await account.createSession({ email, password });
//     const currentUser = await account.get();
//     setUser(currentUser);
//     await AsyncStorage.setItem(GUEST_KEY, "false");
//     await AsyncStorage.setItem(USER_ID_KEY, currentUser.$id);
//   };

//   // ✅ Guest login
//   const loginAsGuest = async () => {
//     await AsyncStorage.setItem(GUEST_KEY, "true");
//     await AsyncStorage.removeItem(USER_ID_KEY);
//     await account.createAnonymousSession().catch(() => {});
//     setUser(null);
//   };
//   // ✅ Apple OAuth2 login via Appwrite

//   // 🆕  Apple sign-in session login
//   const loginWithApple = async (userId, secret) => {
//     try {
//       await account.deleteSession("current").catch(() => {});
//       await account.createSession(userId, secret);
      
//       const current = await account.get();
//       setUser(current);
//       await AsyncStorage.multiSet([
//         [GUEST_KEY, "false"],
//         [USER_ID_KEY, current.$id],
//       ]);

//       // 🧩 RevenueCat sync
//       await configureRevenueCat(current.$id);
//       const info = await Purchases.getCustomerInfo();
//       if (info.entitlements.active["Pro"]) await syncAllData(current.$id);

//       console.log("✅ Apple session stored:", current.email);
//     } catch (err) {
//       console.error("❌ Apple session restore failed:", err);
//       throw err;
//     }
//   };

  


//   // ✅ Logout (and fallback to guest)
//   const logout = async () => {
//     await AsyncStorage.removeItem(GUEST_KEY);
//     await AsyncStorage.removeItem(USER_ID_KEY);
//     await account.deleteSession("current").catch(() => {});
//     await account.createAnonymousSession().catch(() => {});
//     setUser(null);
//   };

//   // ✅ Refresh Appwrite session after OAuth redirect
// const refreshSession = async () => {
//   try {
//     const currentUser = await account.get();
//     setUser(currentUser);
//     await AsyncStorage.setItem(GUEST_KEY, "false");
//     await AsyncStorage.setItem(USER_ID_KEY, currentUser.$id);
//     console.log("🔄 Session refreshed after OAuth redirect.");
//   } catch (error) {
//     console.warn("⚠️ No active session after redirect:", error);
//     setUser(null);
//   }
// };


//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         setUser,
//         loginAsGuest,
//         logout,
//         loginWithCredentials,
//         loginWithApple,
//         refreshSession, // ✅ expose refreshSession
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
//   return ctx;
// };

// // ✅ Helper functions
// export const getCachedUserId = async (): Promise<string | null> =>
//   await AsyncStorage.getItem(USER_ID_KEY);

// export const clearActiveSession = async () => {
//   try {
//     await account.deleteSession("current");
//   } catch (_) {}
// };

import { account } from "@/appwrite";
import { configureRevenueCat } from "@/lib/revenuecat";
import { syncAllData } from "@/lib/sync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import Purchases from "react-native-purchases";

const USER_ID_KEY = "currentUserId";
const GUEST_KEY = "isGuest";

interface AuthContextType {
  user: any | null | undefined;
  setUser: React.Dispatch<React.SetStateAction<any | null | undefined>>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  loginWithApple: (userId: string, secret: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null | undefined>(undefined);

  /* ────────────────────────────────
     🧭 Initialize session on app start
  ──────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      try {
        const guestFlag = await AsyncStorage.getItem(GUEST_KEY);

        if (guestFlag === "true") {
          // Guest mode
          await account.createAnonymousSession().catch(() => {});
          setUser(null);
          return;
        }

        // Clear any stale OAuth cookie-based sessions first
        await account.deleteSession("current").catch(() => {});

        // Try to fetch current user
        const currentUser = await account.get();
        setUser(currentUser);
        await AsyncStorage.setItem(USER_ID_KEY, currentUser.$id);
      } catch {
        // Fallback to guest if session invalid
        await AsyncStorage.setItem(GUEST_KEY, "true");
        await account.createAnonymousSession().catch(() => {});
        setUser(null);
      }
    };
    init();
  }, []);

  /* ────────────────────────────────
     🔐 Email / Password Login
  ──────────────────────────────── */
  const loginWithCredentials = async (email: string, password: string) => {
    await account.deleteSession("current").catch(() => {});
    const session = await account.createEmailPasswordSession(email, password);
    const currentUser = await account.get();
    setUser(currentUser);

    await AsyncStorage.multiSet([
      [GUEST_KEY, "false"],
      [USER_ID_KEY, currentUser.$id],
    ]);

    // Keep RevenueCat active and sync Pro if any
    await configureRevenueCat(currentUser.$id);
    const info = await Purchases.getCustomerInfo();
    if (info.entitlements.active["Pro"]) await syncAllData(currentUser.$id);
  };

  /* ────────────────────────────────
     🍎 Apple Login (Session exchange)
  ──────────────────────────────── */
  const loginWithApple = async (userId: string, secret: string) => {
    await account.deleteSession("current").catch(() => {});
    await account.createSession(userId, secret);

    const current = await account.get();
    setUser(current);

    await AsyncStorage.multiSet([
      [GUEST_KEY, "false"],
      [USER_ID_KEY, current.$id],
    ]);

    // Keep RevenueCat active — do not log out
    await configureRevenueCat(current.$id);
    const info = await Purchases.getCustomerInfo();
    if (info.entitlements.active["Pro"]) await syncAllData(current.$id);

    console.log("✅ Apple session established:", current.email);
  };

  /* ────────────────────────────────
     👤 Guest Mode
  ──────────────────────────────── */
  const loginAsGuest = async () => {
    await AsyncStorage.setItem(GUEST_KEY, "true");
    await AsyncStorage.removeItem(USER_ID_KEY);
    await account.createAnonymousSession().catch(() => {});
    setUser(null);
  };

  /* ────────────────────────────────
     🚪 Logout (Appwrite only)
     → Retain RevenueCat & Pro local state
  ──────────────────────────────── */
  const logout = async () => {
    try {
      console.log("🚪 Logging out (Appwrite only)");

      // Remove cached IDs
      await AsyncStorage.removeItem(USER_ID_KEY);

      // Delete all Appwrite sessions
      try {
        const sessions = await account.listSessions();
        for (const s of sessions.sessions) {
          await account.deleteSession(s.$id).catch(() => {});
        }
      } catch {
        await account.deleteSession("current").catch(() => {});
      }

      // Recreate anonymous Appwrite session
      await account.createAnonymousSession().catch(() => {});
      await AsyncStorage.setItem(GUEST_KEY, "true");

      // ❌ DO NOT log out from RevenueCat — Pro stays valid locally
      setUser(null);

      console.log("✅ Logout complete (guest mode retained)");
    } catch (err) {
      console.error("❌ Logout failed:", err);
      setUser(null);
    }
  };

  /* ────────────────────────────────
     🔄 Refresh after OAuth Redirect
  ──────────────────────────────── */
  const refreshSession = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      await AsyncStorage.multiSet([
        [GUEST_KEY, "false"],
        [USER_ID_KEY, currentUser.$id],
      ]);
      console.log("🔄 Session refreshed successfully");
    } catch {
      console.warn("⚠️ No active Appwrite session");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loginAsGuest,
        logout,
        loginWithCredentials,
        loginWithApple,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const getCachedUserId = async (): Promise<string | null> =>
  await AsyncStorage.getItem(USER_ID_KEY);

export const clearActiveSession = async () => {
  try {
    await account.deleteSession("current");
  } catch (_) {}
};
