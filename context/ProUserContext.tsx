import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";

type ProUserContextType = {
  isProUser: boolean;
  setIsProUser: (value: boolean) => void;
  loading: boolean;
  updateEntitlements: (customerInfo?: CustomerInfo) => Promise<void>;
  refreshFromRevenueCat: () => Promise<void>; // 👈 new helper for AuthContext
};

const STORAGE_KEY = "isProUser_lastKnown";
const ProUserContext = createContext<ProUserContextType | undefined>(undefined);

export const ProUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProUser, setIsProUser] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * ✅ Core function: fetch + update entitlement state
   */
  const updateEntitlements = async (customerInfo?: CustomerInfo) => {
    try {
      const info = customerInfo || (await Purchases.getCustomerInfo());
      const hasPro = !!info.entitlements.active["Pro"]; // case-sensitive key
      setIsProUser(hasPro);
      cachedIsPro = hasPro;

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(hasPro));
      console.log("🔄 Entitlements updated:", hasPro ? "Pro active" : "No Pro");
    } catch (err) {
      console.warn("⚠️ Failed to update entitlements:", err);
    }
  };

  /**
   * ✅ Manually force refresh (called from AuthContext after logIn/logOut)
   */
  const refreshFromRevenueCat = async () => {
    console.log("🔁 Manually refreshing entitlements after user change...");
    await updateEntitlements();
  };

  /**
   * ✅ Initialize listener & first load
   */
  useEffect(() => {
    const initEntitlements = async () => {
      try {
        console.log("🚀 Checking RevenueCat entitlements...");
        const customerInfo = await Purchases.getCustomerInfo();
        await updateEntitlements(customerInfo);

        // Auto-update whenever RevenueCat broadcasts customer info changes
        const unsubscribe = Purchases.addCustomerInfoUpdateListener(updateEntitlements);

        return () => unsubscribe();
      } catch (error: any) {
        console.warn("⚠️ RevenueCat entitlement fetch failed:", error?.message);

        // fallback to cached state
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          setIsProUser(parsed);
          cachedIsPro = parsed;
          console.log("💾 Loaded Pro state from cache:", parsed);
        }
      } finally {
        setLoading(false);
      }
    };

    initEntitlements();
  }, []);

  return (
    <ProUserContext.Provider
      value={{ isProUser, setIsProUser, loading, updateEntitlements, refreshFromRevenueCat }}
    >
      {children}
    </ProUserContext.Provider>
  );
};

/**
 * ✅ Hook for React components
 */
export const useProUser = () => {
  const ctx = useContext(ProUserContext);
  if (!ctx) throw new Error("useProUser must be used within ProUserProvider");
  return ctx;
};

/**
 * ✅ Helper for non-React files (reads cached Pro status)
 */
let cachedIsPro: boolean | null = null;
export async function getProUserStatus(): Promise<boolean> {
  try {
    if (cachedIsPro !== null) return cachedIsPro;
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    cachedIsPro = value ? JSON.parse(value) : false;
    return cachedIsPro ?? false;
  } catch {
    return false;
  }
}


// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { createContext, useContext, useEffect, useState } from "react";
// import Purchases, { CustomerInfo } from "react-native-purchases";

// type ProUserContextType = {
//   isProUser: boolean;
//   setIsProUser: (value: boolean) => void;
//   loading: boolean;
//   updateEntitlements: (customerInfo?: CustomerInfo) => Promise<void>;
// };

// const STORAGE_KEY = "isProUser_lastKnown";
// const ProUserContext = createContext<ProUserContextType | undefined>(undefined);

// export const ProUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isProUser, setIsProUser] = useState(false);
//   const [loading, setLoading] = useState(true);

//   /**
//    * ✅ Updates entitlement state after purchase or restore
//    */
//   const updateEntitlements = async (customerInfo?: CustomerInfo) => {
//     try {
//       const info = customerInfo || (await Purchases.getCustomerInfo());
//       const hasPro = !!info.entitlements.active["Pro"]; // 👈 Case-sensitive key
//       setIsProUser(hasPro);
//       cachedIsPro = hasPro;

//       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(hasPro));
//       console.log("🔄 Entitlements updated:", hasPro ? "Pro active" : "No Pro");
//     } catch (err) {
//       console.warn("⚠️ Failed to update entitlements:", err);
//     }
//   };

//   /**
//    * ✅ Initialize and sync entitlements after early RevenueCat config
//    */
//   useEffect(() => {
//     const initEntitlements = async () => {
//       try {
//         console.log("🚀 Checking RevenueCat entitlements...");
//         const customerInfo = await Purchases.getCustomerInfo();
//         await updateEntitlements(customerInfo);

//         const unsubscribe = Purchases.addCustomerInfoUpdateListener(updateEntitlements);
//         return () => unsubscribe();
//       } catch (error) {
//         console.warn("⚠️ RevenueCat entitlement fetch failed:", error?.message);

//         // fallback to cached state
//         const cached = await AsyncStorage.getItem(STORAGE_KEY);
//         if (cached !== null) {
//           setIsProUser(JSON.parse(cached));
//           console.log("💾 Loaded Pro state from cache:", cached);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     initEntitlements();
//   }, []);

//   return (
//     <ProUserContext.Provider value={{ isProUser, setIsProUser, loading, updateEntitlements }}>
//       {children}
//     </ProUserContext.Provider>
//   );
// };

// /**
//  * ✅ Hook for React components
//  */
// export const useProUser = () => {
//   const ctx = useContext(ProUserContext);
//   if (!ctx) throw new Error("useProUser must be used within ProUserProvider");
//   return ctx;
// };

// /**
//  * ✅ Helper for non-React files (reads cached Pro status)
//  */
// let cachedIsPro: boolean | null = null;
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

// import React, { createContext, useContext, useEffect, useState } from "react";
// import Purchases, { CustomerInfo } from "react-native-purchases";

// interface ProUserContextType {
//   isProUser: boolean;
//   updateEntitlements: (info?: CustomerInfo) => Promise<void>;
// }

// const ProUserContext = createContext<ProUserContextType>({
//   isProUser: false,
//   updateEntitlements: async () => {},
// });
// // const ProUserContext = createContext<ProUserContextType | undefined>(undefined);


// export const ProUserProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isProUser, setIsProUser] = useState(false);

//   const updateEntitlements = async (info?: CustomerInfo) => {
//     try {
//       const customerInfo = info ?? (await Purchases.getCustomerInfo());
//       const active = customerInfo.entitlements.active;
//       const pro = !!active["Pro"];
//       console.log("🔄 Entitlements:", pro ? "Pro User" : "Free User");
//       setIsProUser(pro);
//     } catch (err) {
//       console.warn("⚠️ Error updating entitlements:", err);
//     }
//   };

//   useEffect(() => {
//     let unsubscribe: (() => void) | undefined;

//     const init = async () => {
//       await updateEntitlements();

//       // 👇 Listen to RevenueCat updates
//       const listener = (info: CustomerInfo) => updateEntitlements(info);
//       unsubscribe = Purchases.addCustomerInfoUpdateListener(listener);
//     };

//     init();

//     // ✅ Clean-up safely
//     return () => {
//       if (typeof unsubscribe === "function") unsubscribe();
//     };
//   }, []);

//   return (
//     <ProUserContext.Provider value={{ isProUser, updateEntitlements }}>
//       {children}
//     </ProUserContext.Provider>
//   );
// };

// export const useProUser = () => useContext(ProUserContext);
