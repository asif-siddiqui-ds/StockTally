
// // context/AuthContext.tsx

// import { account } from "@/appwrite";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { router } from "expo-router";
// import React, { createContext, useContext, useEffect, useState } from "react";

// const USER_ID_KEY = "currentUserId";
// const GUEST_KEY = "isGuest";

// interface AuthContextType {
//   user: any | null;
//   authLoading: boolean;
//   setUser: (user: any | null) => void;
//   loginWithCredentials: (email: string, password: string) => Promise<void>;
//   loginAsGuest: () => Promise<void>;
//   logout: () => Promise<void>;
//   loginWithUser: (userId: string, secret: string) => Promise<void>;
//   refreshSession: () => Promise<void>;
//   handleSuccessOrFailure: (secret: string, userId: string) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<any | null>(null);
//   const [authLoading, setAuthLoading] = useState(true);

//   // ------------------------------------------------------
//   // 🔄 INITIAL SESSION CHECK
//   // ------------------------------------------------------
//   useEffect(() => {
//     const init = async () => {
//       try {
//         setAuthLoading(true);

//         const guest = await AsyncStorage.getItem(GUEST_KEY);

//         if (guest === "true") {
//           await account.createAnonymousSession().catch(() => {});
//           setUser(null);
//           return;
//         }

//         // ✅ Do NOT delete current session here
//         const currentUser = await account.get();

//         setUser(currentUser);

//         await AsyncStorage.multiSet([
//           [GUEST_KEY, "false"],
//           [USER_ID_KEY, currentUser.$id],
//         ]);
//       } catch {
//         await AsyncStorage.setItem(GUEST_KEY, "true");
//         await account.createAnonymousSession().catch(() => {});
//         setUser(null);
//       } finally {
//         setAuthLoading(false);
//       }
//     };

//     init();
//   }, []);

//   // ------------------------------------------------------
//   // 🔐 EMAIL + PASSWORD LOGIN
//   // ------------------------------------------------------
//   const loginWithCredentials = async (email: string, password: string) => {
//     await account.deleteSession("current").catch(() => {});
//     await account.createEmailPasswordSession(email, password);
//     const currentUser = await account.get();
//     setUser(currentUser);

//     await AsyncStorage.multiSet([
//       [GUEST_KEY, "false"],
//       [USER_ID_KEY, currentUser.$id],
//     ]);
//   };

//   // ------------------------------------------------------
//   // 🍎 APPLE SIGN-IN COMPLETION
//   // ------------------------------------------------------
//   const loginWithUser = async (userId: string, secret: string) => {
//     await account.deleteSession("current").catch(() => {});
//     await account.createSession(userId, secret);

//     const current = await account.get();
//     setUser(current);

//     await AsyncStorage.multiSet([
//       [GUEST_KEY, "false"],
//       [USER_ID_KEY, current.$id],
//     ]);
//   };

//   // ------------------------------------------------------
//   // 👤 GUEST LOGIN (ANONYMOUS)
//   // ------------------------------------------------------
//   const loginAsGuest = async () => {
//     await AsyncStorage.setItem(GUEST_KEY, "true");
//     await AsyncStorage.removeItem(USER_ID_KEY);

//     await account.createAnonymousSession().catch(() => {});
//     setUser(null);
//   };

//   // ------------------------------------------------------
//   // 🚪 LOGOUT (KEEP REVENUECAT STATE)
//   // ------------------------------------------------------
//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem(USER_ID_KEY);

//       try {
//         const sessions = await account.listSessions();
//         for (const s of sessions.sessions) {
//           await account.deleteSession(s.$id).catch(() => {});
//         }
//       } catch {
//         await account.deleteSession("current").catch(() => {});
//       }

//       await account.createAnonymousSession().catch(() => {});
//       await AsyncStorage.setItem(GUEST_KEY, "true");
//       setUser(null);
//     } catch (err) {
//       console.error("❌ Logout error:", err);
//       setUser(null);
//     }
//   };

//   // ------------------------------------------------------
//   // 🔄 REFRESH SESSION (AFTER REDIRECT)
//   // ------------------------------------------------------
//   const refreshSession = async () => {
//     try {
//       const current = await account.get();
//       setUser(current);

//       await AsyncStorage.multiSet([
//         [GUEST_KEY, "false"],
//         [USER_ID_KEY, current.$id],
//       ]);

//       console.log("🔄 Session refreshed");
//     } catch {
//       console.warn("⚠️ No active session to refresh");
//       setUser(null);
//     }
//   };

//   // ------------------------------------------------------
//   // 🚀 FINAL OAUTH (Google & Apple) COMPLETION
//   // Called inside /oauth screen with: secret + userId
//   // ------------------------------------------------------
//   const handleSuccessOrFailure = async (secret: string, userId: string) => {
//     try {
//       console.log("🔐 Completing OAuth session...");

//       await account.deleteSession("current").catch(() => {});
//       await account.createSession(userId, secret);

//       const current = await account.get();
//       setUser(current);

//       await AsyncStorage.multiSet([
//         [GUEST_KEY, "false"],
//         [USER_ID_KEY, current.$id],
//       ]);
      
//       router.replace("/(tabs)");
//     } catch (err: any) {
//       console.error("❌ OAuth completion error:", err);
//       router.replace("/(auth)/LoginScreen");
//     }
//   };


//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         authLoading,
//         setUser,
//         loginWithCredentials,
//         loginAsGuest,
//         logout,
//         loginWithUser,
//         refreshSession,
//         handleSuccessOrFailure,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };

// export const getCachedUserId = async (): Promise<string | null> =>
//   await AsyncStorage.getItem(USER_ID_KEY);

import { account } from "@/appwrite";
import { linkGuestCompanyProfileToUser } from "@/lib/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

const USER_ID_KEY = "currentUserId";
const GUEST_KEY = "isGuest";

interface AuthContextType {
  user: any | null;
  authLoading: boolean;
  setUser: (user: any | null) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithUser: (userId: string, secret: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  handleSuccessOrFailure: (secret: string, userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setAuthLoading(true);

        const guest = await AsyncStorage.getItem(GUEST_KEY);

        if (guest === "true") {
          await account.createAnonymousSession().catch(() => {});
          setUser(null);
          return;
        }

        const currentUser = await account.get();
        setUser(currentUser);

        await AsyncStorage.multiSet([
          [GUEST_KEY, "false"],
          [USER_ID_KEY, currentUser.$id],
        ]);
      } catch {
        await AsyncStorage.setItem(GUEST_KEY, "true");
        await account.createAnonymousSession().catch(() => {});
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    init();
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    await account.deleteSession("current").catch(() => {});
    await account.createEmailPasswordSession(email, password);

    const currentUser = await account.get();
    setUser(currentUser);

    await AsyncStorage.multiSet([
      [GUEST_KEY, "false"],
      [USER_ID_KEY, currentUser.$id],
    ]);
  };

  const loginWithUser = async (userId: string, secret: string) => {
    await account.deleteSession("current").catch(() => {});
    await account.createSession(userId, secret);

    const currentUser = await account.get();
    setUser(currentUser);

    await AsyncStorage.multiSet([
      [GUEST_KEY, "false"],
      [USER_ID_KEY, currentUser.$id],
    ]);

    await linkGuestCompanyProfileToUser(currentUser.$id);
  };

  const loginAsGuest = async () => {
    await AsyncStorage.setItem(GUEST_KEY, "true");
    await AsyncStorage.removeItem(USER_ID_KEY);

    await account.createAnonymousSession().catch(() => {});
    setUser(null);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_ID_KEY);

      try {
        const sessions = await account.listSessions();

        for (const s of sessions.sessions) {
          await account.deleteSession(s.$id).catch(() => {});
        }
      } catch {
        await account.deleteSession("current").catch(() => {});
      }

      await account.createAnonymousSession().catch(() => {});
      await AsyncStorage.setItem(GUEST_KEY, "true");
      setUser(null);
    } catch (err) {
      console.error("❌ Logout error:", err);
      setUser(null);
    }
  };

  const refreshSession = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);

      await AsyncStorage.multiSet([
        [GUEST_KEY, "false"],
        [USER_ID_KEY, currentUser.$id],
      ]);

      console.log("🔄 Session refreshed");
    } catch {
      console.warn("⚠️ No active session to refresh");
      setUser(null);
    }
  };

  const handleSuccessOrFailure = async (secret: string, userId: string) => {
    try {
      await loginWithUser(userId, secret);
      router.replace("/(tabs)");
    } catch (err) {
      console.error("❌ OAuth completion error:", err);
      router.replace("/(auth)/LoginScreen");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        setUser,
        loginWithCredentials,
        loginAsGuest,
        logout,
        loginWithUser,
        refreshSession,
        handleSuccessOrFailure,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const getCachedUserId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(USER_ID_KEY);
};