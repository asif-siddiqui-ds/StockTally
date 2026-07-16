// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { createContext, useContext, useEffect, useState } from "react";
// import Purchases, { CustomerInfo } from "react-native-purchases";
// import { useAuth } from "./AuthContext";

// type ProUserContextType = {
//   isProUser: boolean;
//   setIsProUser: (value: boolean) => Promise<void>;
//   loading: boolean;
//   updateEntitlements: (customerInfo?: CustomerInfo) => Promise<void>;
//   refreshFromRevenueCat: () => Promise<void>;
// };

// const STORAGE_KEY = "isProUser_lastKnown";

// const ProUserContext = createContext<ProUserContextType | undefined>(undefined);

// let cachedIsPro: boolean | null = null;

// export const ProUserProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
//   }) => {
//   const { authLoading } = useAuth();

//   const [isProUser, setIsProUserState] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const setIsProUser = async (value: boolean) => {
//     setIsProUserState(value);
//     cachedIsPro = value;
//     await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
//   };

//   const updateEntitlements = async (customerInfo?: CustomerInfo) => {
//     try {
//       const info = customerInfo || (await Purchases.getCustomerInfo());

//       // const hasPro = !!info.entitlements.active["Pro"];
//       const hasPro =
//         !!info.entitlements.active["pro"] ||
//         !!info.entitlements.active["Pro"];
      
//         console.log("📦 Active entitlements:", Object.keys(info.entitlements.active));
//         console.log("👤 RevenueCat appUserID:", info.originalAppUserId);

//       await setIsProUser(hasPro);

//       console.log("🔄 Entitlements updated:", hasPro ? "Pro active" : "No Pro");
//     } catch (err) {
//       console.warn("⚠️ Failed to update entitlements:", err);
//     }
//   };

//   const refreshFromRevenueCat = async () => {
//     try {
//       setLoading(true);
//       console.log("🔁 Refreshing entitlements from RevenueCat...");
//       await updateEntitlements();
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     let unsubscribe: (() => void) | undefined;
//     let cancelled = false;

//     const initEntitlements = async () => {
//       try {
//         if (authLoading) {
//           console.log("⏳ Auth still loading — delaying Pro entitlement check...");
//           return;
//         }

//         setLoading(true);

//         console.log("🚀 Checking RevenueCat entitlements...");

//         const customerInfo = await Purchases.getCustomerInfo();

//         if (cancelled) return;

//         await updateEntitlements(customerInfo);

//         Purchases.addCustomerInfoUpdateListener(
//           async (customerInfo) => {
//             if (!cancelled) {
//               await updateEntitlements(customerInfo);
//             }
//           }
//         );
//         unsubscribe = () => {
//           // RevenueCat listener cleanup handled by cancelled flag
//         };
//       } catch (error: any) {
//         console.warn("⚠️ RevenueCat entitlement fetch failed:", error?.message);

//         const cached = await AsyncStorage.getItem(STORAGE_KEY);

//         if (cached !== null) {
//           const parsed = JSON.parse(cached);
//           await setIsProUser(parsed);
//           console.log("💾 Loaded Pro state from cache:", parsed);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     initEntitlements();

//     return () => {
//       cancelled = true;

//       if (unsubscribe) {
//         unsubscribe();
//       }
//     };
//   }, [authLoading]);

//   return (
//     <ProUserContext.Provider
//       value={{
//         isProUser,
//         setIsProUser,
//         loading,
//         updateEntitlements,
//         refreshFromRevenueCat,
//       }}
//     >
//       {children}
//     </ProUserContext.Provider>
//   );
// };

// export const useProUser = () => {
//   const ctx = useContext(ProUserContext);

//   if (!ctx) {
//     throw new Error("useProUser must be used within ProUserProvider");
//   }

//   return ctx;
// };

// export async function getProUserStatus(): Promise<boolean> {
//   try {
//     if (cachedIsPro !== null) return cachedIsPro;

//     const value = await AsyncStorage.getItem(STORAGE_KEY);

//     cachedIsPro = value ? JSON.parse(value) : false;

//     return cachedIsPro ?? false;
//   } catch {
//     return false;
//   }
// }
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { useAuth } from "./AuthContext";

type ProUserContextType = {
  isProUser: boolean;
  setIsProUser: (value: boolean) => Promise<void>;
  loading: boolean;
  updateEntitlements: (customerInfo?: CustomerInfo) => Promise<void>;
  refreshFromRevenueCat: () => Promise<void>;
};

const BASE_STORAGE_KEY = "isProUser_lastKnown";
const ProUserContext = createContext<ProUserContextType | undefined>(undefined);

let cachedIsPro: boolean | null = null;

const hasProEntitlement = (info: CustomerInfo): boolean => {
  return !!info.entitlements.active["Pro"] || !!info.entitlements.active["pro"];
};

export const ProUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, authLoading } = useAuth();

  const [isProUser, setIsProUserState] = useState(false);
  const [loading, setLoading] = useState(true);

  const storageKey = useMemo(() => {
    return user?.$id
      ? `${BASE_STORAGE_KEY}_${user.$id}`
      : `${BASE_STORAGE_KEY}_guest`;
  }, [user?.$id]);

  const setIsProUser = async (value: boolean) => {
    setIsProUserState(value);
    cachedIsPro = value;
    await AsyncStorage.setItem(storageKey, JSON.stringify(value));
  };

  const updateEntitlements = async (customerInfo?: CustomerInfo) => {
    try {
      const info = customerInfo || (await Purchases.getCustomerInfo());

      const activeEntitlements = Object.keys(info.entitlements.active);
      const hasPro = hasProEntitlement(info);

      console.log("📦 Active entitlements:", activeEntitlements);
      console.log("👤 RevenueCat appUserID:", info.originalAppUserId);

      await setIsProUser(hasPro);

      console.log("🔄 Entitlements updated:", hasPro ? "Pro active" : "No Pro");
    } catch (err) {
      console.warn("⚠️ Failed to update entitlements:", err);
      await setIsProUser(false);
    }
  };

  const refreshFromRevenueCat = async () => {
    try {
      setLoading(true);
      console.log("🔁 Refreshing entitlements from RevenueCat...");
      await updateEntitlements();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      console.log("⏳ Auth still loading — delaying Pro entitlement check...");
      return;
    }

    let cancelled = false;

    const listener = async (customerInfo: CustomerInfo) => {
      if (!cancelled) {
        await updateEntitlements(customerInfo);
      }
    };

    const initEntitlements = async () => {
      try {
        setLoading(true);

        // ✅ Prevent old user's cached Pro state from leaking into new user
        setIsProUserState(false);
        cachedIsPro = false;

        console.log("🚀 Checking RevenueCat entitlements...");

        const customerInfo = await Purchases.getCustomerInfo();

        if (cancelled) return;

        await updateEntitlements(customerInfo);

        Purchases.addCustomerInfoUpdateListener(listener);
      } catch (error: any) {
        console.warn("⚠️ RevenueCat entitlement fetch failed:", error?.message);

        const cached = await AsyncStorage.getItem(storageKey);

        if (cached !== null) {
          const parsed = JSON.parse(cached);
          setIsProUserState(parsed);
          cachedIsPro = parsed;
          console.log("💾 Loaded Pro state from cache:", parsed);
        } else {
          setIsProUserState(false);
          cachedIsPro = false;
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initEntitlements();

    return () => {
      cancelled = true;

      try {
        Purchases.removeCustomerInfoUpdateListener(listener);
      } catch {
        console.warn("⚠️ RevenueCat listener cleanup skipped");
      }
    };
  }, [authLoading, user?.$id, storageKey]);

  return (
    <ProUserContext.Provider
      value={{
        isProUser,
        setIsProUser,
        loading,
        updateEntitlements,
        refreshFromRevenueCat,
      }}
    >
      {children}
    </ProUserContext.Provider>
  );
};

export const useProUser = () => {
  const ctx = useContext(ProUserContext);

  if (!ctx) {
    throw new Error("useProUser must be used within ProUserProvider");
  }

  return ctx;
};

export async function getProUserStatus(userId?: string | null): Promise<boolean> {
  try {
    if (cachedIsPro !== null) return cachedIsPro;

    const key = userId
      ? `${BASE_STORAGE_KEY}_${userId}`
      : `${BASE_STORAGE_KEY}_guest`;

    const value = await AsyncStorage.getItem(key);

    cachedIsPro = value ? JSON.parse(value) : false;

    return cachedIsPro ?? false;
  } catch {
    return false;
  }
}