// // lib/revenuecat.ts

// import { Platform } from "react-native";
// import Purchases, { CustomerInfo } from "react-native-purchases";

// const REVENUECAT_API_KEY_IOS =
//   process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!;

// const REVENUECAT_API_KEY_ANDROID =
//   process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!;

// export const isProEntitlementActive = (info: CustomerInfo): boolean => {
//   return (
//     !!info.entitlements.active["Pro"] ||
//     !!info.entitlements.active["pro"]
//   );
// };

// export const configureRevenueCat = async () => {
//   try {
//     await Purchases.configure({
//       apiKey: Platform.select({
//         ios: REVENUECAT_API_KEY_IOS,
//         android: REVENUECAT_API_KEY_ANDROID,
//       })!,
//     });

//     console.log("🟡 RevenueCat configured in anonymous mode");
//   } catch (err) {
//     console.error("❌ Error configuring RevenueCat:", err);
//   }
// };

// export const identifyRevenueCatUser = async (userId: string) => {
//   try {
//     const result = await Purchases.logIn(userId);

//     const activeEntitlements = Object.keys(
//       result.customerInfo.entitlements.active
//     );

//     console.log("🟢 RevenueCat logged in:", userId);
//     console.log("📦 Active entitlements after login:", activeEntitlements);

//     return result.customerInfo;
//   } catch (err) {
//     console.error("❌ RevenueCat login failed:", err);
//     throw err;
//   }
// };

// export const getOfferings = async () => {
//   try {
//     const offerings = await Purchases.getOfferings();
//     return offerings.current?.availablePackages ?? [];
//   } catch (err) {
//     console.warn("⚠️ Error fetching offerings:", err);
//     return [];
//   }
// };

// export const checkProEntitlement = async (): Promise<boolean> => {
//   try {
//     const info = await Purchases.getCustomerInfo();

//     const isPro = isProEntitlementActive(info);

//     console.log("📦 Active entitlements:", Object.keys(info.entitlements.active));
//     console.log("🔄 Entitlement check:", isPro ? "Pro" : "Free");

//     return isPro;
//   } catch (err) {
//     console.warn("⚠️ Failed to check entitlement:", err);
//     return false;
//   }
// };

// export const restoreRevenueCatPurchases = async () => {
//   try {
//     const customerInfo = await Purchases.restorePurchases();

//     console.log(
//       "📦 Active entitlements after restore:",
//       Object.keys(customerInfo.entitlements.active)
//     );

//     console.log("🔄 RevenueCat purchases restored");

//     return customerInfo;
//   } catch (err) {
//     console.error("❌ RevenueCat restore failed:", err);
//     throw err;
//   }
// };

import { Platform } from "react-native";
import Purchases, { CustomerInfo } from "react-native-purchases";

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!;
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!;

export const isProEntitlementActive = (info: CustomerInfo): boolean => {
  return !!info.entitlements.active["Pro"] || !!info.entitlements.active["pro"];
};

export const configureRevenueCat = async () => {
  await Purchases.configure({
    apiKey: Platform.select({
      ios: REVENUECAT_API_KEY_IOS,
      android: REVENUECAT_API_KEY_ANDROID,
    })!,
  });

  console.log("✅ RevenueCat configured");
};

export const identifyRevenueCatUser = async (userId: string) => {
  const result = await Purchases.logIn(userId);

  console.log("🟢 RevenueCat logged in:", userId);
  console.log(
    "📦 Active entitlements after login:",
    Object.keys(result.customerInfo.entitlements.active)
  );

  return result.customerInfo;
};

export const getOfferings = async () => {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
};

export const checkProEntitlement = async (): Promise<boolean> => {
  const info = await Purchases.getCustomerInfo();
  const isPro = isProEntitlementActive(info);

  console.log("🔄 Entitlement check:", isPro ? "Pro" : "Free");

  return isPro;
};

export const restoreRevenueCatPurchases = async () => {
  const customerInfo = await Purchases.restorePurchases();

  console.log(
    "📦 Active entitlements after restore:",
    Object.keys(customerInfo.entitlements.active)
  );

  return customerInfo;
};