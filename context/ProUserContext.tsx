// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
// import Purchases, { CustomerInfo } from "react-native-purchases";
// import { useAuth } from "./AuthContext";

// type ProUserContextType = {
//   isProUser: boolean;
//   setIsProUser: (value: boolean) => Promise<void>;
//   loading: boolean;
//   updateEntitlements: (customerInfo?: CustomerInfo) => Promise<void>;
//   refreshFromRevenueCat: () => Promise<void>;
// };

// const BASE_STORAGE_KEY = "isProUser_lastKnown";
// const ProUserContext = createContext<ProUserContextType | undefined>(undefined);

// let cachedIsPro: boolean | null = null;

// const hasProEntitlement = (info: CustomerInfo): boolean => {
//   return !!info.entitlements.active["Pro"] || !!info.entitlements.active["pro"];
// };

// export const ProUserProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { user, authLoading } = useAuth();

//   const [isProUser, setIsProUserState] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const storageKey = useMemo(() => {
//     return user?.$id
//       ? `${BASE_STORAGE_KEY}_${user.$id}`
//       : `${BASE_STORAGE_KEY}_guest`;
//   }, [user?.$id]);

//   const setIsProUser = async (value: boolean) => {
//     setIsProUserState(value);
//     cachedIsPro = value;
//     await AsyncStorage.setItem(storageKey, JSON.stringify(value));
//   };

//   const updateEntitlements = async (customerInfo?: CustomerInfo) => {
//     try {
//       const info = customerInfo || (await Purchases.getCustomerInfo());

//       const activeEntitlements = Object.keys(info.entitlements.active);
//       const hasPro = hasProEntitlement(info);

//       console.log("📦 Active entitlements:", activeEntitlements);
//       console.log("👤 RevenueCat appUserID:", info.originalAppUserId);

//       await setIsProUser(hasPro);

//       console.log("🔄 Entitlements updated:", hasPro ? "Pro active" : "No Pro");
//     } catch (err) {
//       console.warn("⚠️ Failed to update entitlements:", err);
//       await setIsProUser(false);
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
//     if (authLoading) {
//       console.log("⏳ Auth still loading — delaying Pro entitlement check...");
//       return;
//     }

//     let cancelled = false;

//     const listener = async (customerInfo: CustomerInfo) => {
//       if (!cancelled) {
//         await updateEntitlements(customerInfo);
//       }
//     };

//     const initEntitlements = async () => {
//       try {
//         setLoading(true);

//         // ✅ Prevent old user's cached Pro state from leaking into new user
//         setIsProUserState(false);
//         cachedIsPro = false;

//         console.log("🚀 Checking RevenueCat entitlements...");

//         const customerInfo = await Purchases.getCustomerInfo();

//         if (cancelled) return;

//         await updateEntitlements(customerInfo);

//         Purchases.addCustomerInfoUpdateListener(listener);
//       } catch (error: any) {
//         console.warn("⚠️ RevenueCat entitlement fetch failed:", error?.message);

//         const cached = await AsyncStorage.getItem(storageKey);

//         if (cached !== null) {
//           const parsed = JSON.parse(cached);
//           setIsProUserState(parsed);
//           cachedIsPro = parsed;
//           console.log("💾 Loaded Pro state from cache:", parsed);
//         } else {
//           setIsProUserState(false);
//           cachedIsPro = false;
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

//       try {
//         Purchases.removeCustomerInfoUpdateListener(listener);
//       } catch {
//         console.warn("⚠️ RevenueCat listener cleanup skipped");
//       }
//     };
//   }, [authLoading, user?.$id, storageKey]);

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

// export async function getProUserStatus(userId?: string | null): Promise<boolean> {
//   try {
//     if (cachedIsPro !== null) return cachedIsPro;

//     const key = userId
//       ? `${BASE_STORAGE_KEY}_${userId}`
//       : `${BASE_STORAGE_KEY}_guest`;

//     const value = await AsyncStorage.getItem(key);

//     cachedIsPro = value ? JSON.parse(value) : false;

//     return cachedIsPro ?? false;
//   } catch {
//     return false;
//   }
// }

import {
  getRevenueCatCustomerInfo,
  isProEntitlementActive,
} from "@/lib/revenuecat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { useAuth } from "./AuthContext";

type ProUserContextType = {
  isProUser: boolean;
  setIsProUser: (value: boolean) => Promise<void>;
  loading: boolean;
  updateEntitlements: (
    customerInfo?: CustomerInfo
  ) => Promise<void>;
  refreshFromRevenueCat: () => Promise<void>;
};

const BASE_STORAGE_KEY = "isProUser_lastKnown";

const ProUserContext =
  createContext<ProUserContextType | undefined>(undefined);

/**
 * Store cached Pro status separately for each Appwrite user.
 * This prevents one user's status from being returned for another user.
 */
const proStatusCache = new Map<string, boolean>();

export const ProUserProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, authLoading } = useAuth();

  const [isProUser, setIsProUserState] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Each logged-in user has their own cache key.
   * Guest mode always uses a separate guest key.
   */
  const storageKey = useMemo(() => {
    return user?.$id
      ? `${BASE_STORAGE_KEY}_${user.$id}`
      : `${BASE_STORAGE_KEY}_guest`;
  }, [user?.$id]);

  /**
   * Save Pro status in React state, in-memory cache,
   * and AsyncStorage.
   */
  const setIsProUser = useCallback(
    async (value: boolean): Promise<void> => {
      setIsProUserState(value);
      proStatusCache.set(storageKey, value);

      try {
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(value)
        );
      } catch (error) {
        console.warn(
          "⚠️ Failed to save Pro status:",
          error
        );
      }
    },
    [storageKey]
  );

  /**
   * Apply RevenueCat customer information to local Pro state.
   */
  const applyCustomerInfo = useCallback(
    async (customerInfo: CustomerInfo): Promise<void> => {
      const activeEntitlements = Object.keys(
        customerInfo.entitlements.active
      );

      const hasPro =
        isProEntitlementActive(customerInfo);

      console.log(
        "📦 Active entitlements:",
        activeEntitlements
      );

      console.log(
        "👤 RevenueCat appUserID:",
        customerInfo.originalAppUserId
      );

      await setIsProUser(hasPro);

      console.log(
        "🔄 Entitlements updated:",
        hasPro ? "Pro active" : "No Pro"
      );
    },
    [setIsProUser]
  );

  /**
   * Refresh entitlement state.
   *
   * When customerInfo is supplied, such as immediately after
   * Purchases.logIn(), no additional RevenueCat request is needed.
   */
  const updateEntitlements = useCallback(
    async (
      customerInfo?: CustomerInfo
    ): Promise<void> => {
      const info =
        customerInfo ??
        (await getRevenueCatCustomerInfo());

      await applyCustomerInfo(info);
    },
    [applyCustomerInfo]
  );

  /**
   * Manually refresh RevenueCat entitlement information.
   * Used after purchases or restoring purchases.
   */
  const refreshFromRevenueCat =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);

        if (!user?.$id) {
          console.log(
            "🟡 Guest user — RevenueCat refresh skipped"
          );

          await setIsProUser(false);
          return;
        }

        console.log(
          "🔁 Refreshing entitlements from RevenueCat..."
        );

        await updateEntitlements();
      } catch (error) {
        console.warn(
          "⚠️ Failed to refresh RevenueCat entitlements:",
          error
        );

        /**
         * Do not overwrite cached Pro status with false
         * merely because RevenueCat or the network failed.
         */
        const cachedValue =
          await AsyncStorage.getItem(storageKey);

        const cachedStatus =
          cachedValue !== null
            ? Boolean(JSON.parse(cachedValue))
            : false;

        setIsProUserState(cachedStatus);
        proStatusCache.set(storageKey, cachedStatus);
      } finally {
        setLoading(false);
      }
    }, [
      setIsProUser,
      storageKey,
      updateEntitlements,
      user?.$id,
    ]);

  useEffect(() => {
    if (authLoading) {
      console.log(
        "⏳ Auth still loading — delaying Pro entitlement check..."
      );
      return;
    }

    let cancelled = false;
    let listenerAdded = false;

    const customerInfoListener = (
      customerInfo: CustomerInfo
    ) => {
      if (cancelled) {
        return;
      }

      void applyCustomerInfo(customerInfo).catch(
        (error) => {
          console.warn(
            "⚠️ RevenueCat listener update failed:",
            error
          );
        }
      );
    };

    const loadCachedStatus =
      async (): Promise<boolean> => {
        try {
          const memoryCached =
            proStatusCache.get(storageKey);

          if (memoryCached !== undefined) {
            return memoryCached;
          }

          const savedValue =
            await AsyncStorage.getItem(storageKey);

          const parsedValue =
            savedValue !== null
              ? Boolean(JSON.parse(savedValue))
              : false;

          proStatusCache.set(
            storageKey,
            parsedValue
          );

          return parsedValue;
        } catch (error) {
          console.warn(
            "⚠️ Failed to load cached Pro status:",
            error
          );

          return false;
        }
      };

    const initialiseEntitlements =
      async (): Promise<void> => {
        try {
          setLoading(true);

          /**
           * Immediately clear the previous user's visible state
           * while the current user's status is being checked.
           */
          setIsProUserState(false);

          /**
           * Guests cannot subscribe or use Pro features under
           * the current StockTally access rules.
           */
          if (!user?.$id) {
            proStatusCache.set(storageKey, false);

            await AsyncStorage.setItem(
              storageKey,
              JSON.stringify(false)
            );

            if (!cancelled) {
              setIsProUserState(false);
            }

            console.log(
              "🟡 Guest user — Pro disabled"
            );

            return;
          }

          /**
           * Show the current user's cached state while the
           * RevenueCat request is running.
           */
          const cachedStatus =
            await loadCachedStatus();

          if (!cancelled) {
            setIsProUserState(cachedStatus);
          }

          console.log(
            "🚀 Checking RevenueCat entitlements..."
          );

          /**
           * This safe helper configures RevenueCat first if it
           * has not yet been configured.
           */
          const customerInfo =
            await getRevenueCatCustomerInfo();

          if (cancelled) {
            return;
          }

          await applyCustomerInfo(customerInfo);

          if (cancelled) {
            return;
          }

          Purchases.addCustomerInfoUpdateListener(
            customerInfoListener
          );

          listenerAdded = true;
        } catch (error: any) {
          console.warn(
            "⚠️ RevenueCat entitlement fetch failed:",
            error?.message ?? error
          );

          /**
           * A RevenueCat or network failure must not permanently
           * change a genuine cached Pro user into a free user.
           */
          const cachedStatus =
            await loadCachedStatus();

          if (!cancelled) {
            setIsProUserState(cachedStatus);
            proStatusCache.set(
              storageKey,
              cachedStatus
            );
          }

          console.log(
            "💾 Loaded Pro state from cache:",
            cachedStatus
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void initialiseEntitlements();

    return () => {
      cancelled = true;

      if (listenerAdded) {
        try {
          Purchases.removeCustomerInfoUpdateListener(
            customerInfoListener
          );
        } catch (error) {
          console.warn(
            "⚠️ RevenueCat listener cleanup skipped:",
            error
          );
        }
      }
    };
  }, [
    applyCustomerInfo,
    authLoading,
    storageKey,
    user?.$id,
  ]);

  const contextValue =
    useMemo<ProUserContextType>(
      () => ({
        isProUser,
        setIsProUser,
        loading,
        updateEntitlements,
        refreshFromRevenueCat,
      }),
      [
        isProUser,
        setIsProUser,
        loading,
        updateEntitlements,
        refreshFromRevenueCat,
      ]
    );

  return (
    <ProUserContext.Provider value={contextValue}>
      {children}
    </ProUserContext.Provider>
  );
};

export const useProUser = (): ProUserContextType => {
  const context = useContext(ProUserContext);

  if (!context) {
    throw new Error(
      "useProUser must be used within ProUserProvider"
    );
  }

  return context;
};

/**
 * Read the last cached Pro status outside React components.
 *
 * Pass the current Appwrite user ID whenever available.
 * Guest state is deliberately stored separately.
 */
export async function getProUserStatus(
  userId?: string | null
): Promise<boolean> {
  try {
    const key = userId
      ? `${BASE_STORAGE_KEY}_${userId}`
      : `${BASE_STORAGE_KEY}_guest`;

    const memoryCached = proStatusCache.get(key);

    if (memoryCached !== undefined) {
      return memoryCached;
    }

    const storedValue =
      await AsyncStorage.getItem(key);

    const parsedValue =
      storedValue !== null
        ? Boolean(JSON.parse(storedValue))
        : false;

    proStatusCache.set(key, parsedValue);

    return parsedValue;
  } catch (error) {
    console.warn(
      "⚠️ Failed to read cached Pro status:",
      error
    );

    return false;
  }
}