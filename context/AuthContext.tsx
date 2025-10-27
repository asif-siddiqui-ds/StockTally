
// context/AuthContext.tsx
// import { account } from "@/appwrite";
// import { useProUser } from "@/context/ProUserContext"; // ✅ new import
// import { configureRevenueCat } from "@/lib/revenuecat";
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
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<any | null | undefined>(undefined);
//   const { refreshFromRevenueCat } = useProUser(); // ✅ to auto-refresh Pro state

//   // 🔄 Initialize on app launch
//   useEffect(() => {
//     const init = async () => {
//       try {
//         const guestFlag = await AsyncStorage.getItem(GUEST_KEY);

//         if (guestFlag === "true") {
//           // ✅ Guest mode
//           try {
//             await account.createAnonymousSession();
//           } catch (_) {}
//           await configureRevenueCat(); // anonymous init
//           setUser(null);
//           return;
//         }

//         // ✅ Check for existing session
//         const currentUser = await account.get();
//         setUser(currentUser);

//         await AsyncStorage.setItem(USER_ID_KEY, currentUser.$id);

//         // 🔗 Connect to RevenueCat
//         await configureRevenueCat(currentUser.$id);
//         await refreshFromRevenueCat(); // ✅ refresh Pro state instantly
//       } catch (err) {
//         // 🚫 No valid session → fallback to guest
//         await AsyncStorage.setItem(GUEST_KEY, "true");
//         try {
//           await account.createAnonymousSession();
//         } catch (_) {}
//         await configureRevenueCat();
//         setUser(null);
//       }
//     };

//     init();
//   }, []);

//   // 👤 Guest login
//   const loginAsGuest = async () => {
//     await AsyncStorage.setItem(GUEST_KEY, "true");
//     await AsyncStorage.removeItem(USER_ID_KEY);

//     try {
//       await account.createAnonymousSession();
//     } catch (_) {}

//     await configureRevenueCat(); // init in guest mode
//     setUser(null);
//     await refreshFromRevenueCat(); // ensure Pro is false
//   };

//   // 🧑‍💻 Real login (email/password)
//   const loginWithCredentials = async (email: string, password: string) => {
//     try {
//       const session = await account.createSession({ email, password });
//       const currentUser = await account.get();

//       await AsyncStorage.setItem(GUEST_KEY, "false");
//       await AsyncStorage.setItem(USER_ID_KEY, currentUser.$id);

//       // 🔗 Merge RevenueCat anonymous → real user
//       const { customerInfo, created } = await Purchases.logIn(currentUser.$id);
//       console.log(
//         created
//           ? "🟢 New RevenueCat user created"
//           : "🔁 Existing RevenueCat user restored"
//       );

//       // ✅ Update RevenueCat config & Pro status
//       await configureRevenueCat(currentUser.$id);
//       await refreshFromRevenueCat();

//       setUser(currentUser);
//     } catch (err) {
//       console.error("❌ Login failed:", err);
//       throw err;
//     }
//   };

//   // 🚪 Logout → back to guest
//   const logout = async () => {
//     await AsyncStorage.removeItem(GUEST_KEY);
//     await AsyncStorage.removeItem(USER_ID_KEY);

//     try {
//       await account.deleteSession("current");
//     } catch (_) {}

//     // 🧹 Reset RevenueCat → guest
//     try {
//       await Purchases.logOut();
//       console.log("🟡 RevenueCat logged out (guest mode resumed)");
//     } catch (err) {
//       console.warn("⚠️ RevenueCat logout error:", err);
//     }

//     await AsyncStorage.setItem(GUEST_KEY, "true");
//     try {
//       await account.createAnonymousSession();
//     } catch (_) {}

//     await configureRevenueCat(); // guest mode
//     setUser(null);
//     await refreshFromRevenueCat(); // reset Pro status to false
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, setUser, loginAsGuest, logout, loginWithCredentials }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ✅ Hook for React components
// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
//   return ctx;
// };

// // ✅ helper to fetch cached userId
// export const getCachedUserId = async (): Promise<string | null> => {
//   return await AsyncStorage.getItem(USER_ID_KEY);
// };

// // ✅ optional clear helper
// export const clearActiveSession = async () => {
//   try {
//     await account.deleteSession("current");
//   } catch (_) {}
// };

// context/AuthContext.tsx
import { account } from "@/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const USER_ID_KEY = "currentUserId";
const GUEST_KEY = "isGuest";

interface AuthContextType {
  user: any | null | undefined; // undefined = loading, null = guest, object = logged in
  setUser: React.Dispatch<React.SetStateAction<any | null | undefined>>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      try {
        const guestFlag = await AsyncStorage.getItem(GUEST_KEY);

        if (guestFlag === "true") {
          await account.createAnonymousSession().catch(() => {});
          setUser(null);
          return;
        }

        const currentUser = await account.get();
        setUser(currentUser);
        await AsyncStorage.setItem(USER_ID_KEY, currentUser.$id);
      } catch (err) {
        await AsyncStorage.setItem(GUEST_KEY, "true");
        await account.createAnonymousSession().catch(() => {});
        setUser(null);
      }
    };
    init();
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    const session = await account.createSession({ email, password });
    const currentUser = await account.get();
    setUser(currentUser);
    await AsyncStorage.setItem(GUEST_KEY, "false");
    await AsyncStorage.setItem(USER_ID_KEY, currentUser.$id);
  };

  const loginAsGuest = async () => {
    await AsyncStorage.setItem(GUEST_KEY, "true");
    await AsyncStorage.removeItem(USER_ID_KEY);
    await account.createAnonymousSession().catch(() => {});
    setUser(null);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(GUEST_KEY);
    await AsyncStorage.removeItem(USER_ID_KEY);
    await account.deleteSession("current").catch(() => {});
    await account.createAnonymousSession().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loginAsGuest, logout, loginWithCredentials }}
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

// ✅ helper to clear session
export const clearActiveSession = async () => {
  try {
    await account.deleteSession("current");
  } catch (_) {}
};