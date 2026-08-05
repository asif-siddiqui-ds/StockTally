// // lib/revenuecat.ts


// import { Platform } from "react-native";
// import Purchases, { CustomerInfo } from "react-native-purchases";

// const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!;
// const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!;

// export const isProEntitlementActive = (info: CustomerInfo): boolean => {
//   return !!info.entitlements.active["Pro"] || !!info.entitlements.active["pro"];
// };

// export const configureRevenueCat = async () => {
//   await Purchases.configure({
//     apiKey: Platform.select({
//       ios: REVENUECAT_API_KEY_IOS,
//       android: REVENUECAT_API_KEY_ANDROID,
//     })!,
//   });

//   console.log("✅ RevenueCat configured");
// };

// export const identifyRevenueCatUser = async (userId: string) => {
//   const result = await Purchases.logIn(userId);

//   console.log("🟢 RevenueCat logged in:", userId);
//   console.log(
//     "📦 Active entitlements after login:",
//     Object.keys(result.customerInfo.entitlements.active)
//   );

//   return result.customerInfo;
// };

// export const getOfferings = async () => {
//   const offerings = await Purchases.getOfferings();
//   return offerings.current?.availablePackages ?? [];
// };

// export const checkProEntitlement = async (): Promise<boolean> => {
//   const info = await Purchases.getCustomerInfo();
//   const isPro = isProEntitlementActive(info);

//   console.log("🔄 Entitlement check:", isPro ? "Pro" : "Free");

//   return isPro;
// };

// export const restoreRevenueCatPurchases = async () => {
//   const customerInfo = await Purchases.restorePurchases();

//   console.log(
//     "📦 Active entitlements after restore:",
//     Object.keys(customerInfo.entitlements.active)
//   );

//   return customerInfo;
// };

import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";

const REVENUECAT_API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;

const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

let configured = false;
let configurationPromise: Promise<void> | null = null;

export const isProEntitlementActive = (
  info: CustomerInfo
): boolean => {
  return Boolean(
    info.entitlements.active["Pro"] ||
      info.entitlements.active["pro"]
  );
};

export const configureRevenueCat = async (): Promise<void> => {
  if (configured) {
    return;
  }

  if (configurationPromise) {
    return configurationPromise;
  }

  configurationPromise = (async () => {
    const apiKey =
      Platform.OS === "ios"
        ? REVENUECAT_API_KEY_IOS
        : REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      throw new Error(
        `Missing RevenueCat API key for ${Platform.OS}`
      );
    }

    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey });

    configured = true;
    console.log("✅ RevenueCat configured");
  })();

  try {
    await configurationPromise;
  } catch (error) {
    configured = false;
    throw error;
  } finally {
    configurationPromise = null;
  }
};

export const identifyRevenueCatUser = async (
  userId: string
): Promise<CustomerInfo> => {
  await configureRevenueCat();

  const result = await Purchases.logIn(userId);

  console.log("🟢 RevenueCat logged in:", userId);
  console.log(
    "📦 Active entitlements after login:",
    Object.keys(result.customerInfo.entitlements.active)
  );

  return result.customerInfo;
};

export const logoutRevenueCatUser =
  async (): Promise<CustomerInfo> => {
    await configureRevenueCat();

    const customerInfo = await Purchases.logOut();

    console.log("🟡 RevenueCat returned to anonymous user");

    return customerInfo;
  };

export const getRevenueCatCustomerInfo =
  async (): Promise<CustomerInfo> => {
    await configureRevenueCat();
    return Purchases.getCustomerInfo();
  };

export const getOfferings = async () => {
  await configureRevenueCat();

  const offerings = await Purchases.getOfferings();

  return offerings.current?.availablePackages ?? [];
};

export const checkProEntitlement =
  async (): Promise<boolean> => {
    const info = await getRevenueCatCustomerInfo();

    return isProEntitlementActive(info);
  };

export const restoreRevenueCatPurchases =
  async (): Promise<CustomerInfo> => {
    await configureRevenueCat();

    const customerInfo = await Purchases.restorePurchases();

    console.log(
      "📦 Active entitlements after restore:",
      Object.keys(customerInfo.entitlements.active)
    );

    return customerInfo;
  };