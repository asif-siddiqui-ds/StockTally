// // lib/revenuecat.ts
import { Platform } from "react-native";
import Purchases from "react-native-purchases";

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!;
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!;

// 👇 Persisted anonymous ID key

export const configureRevenueCat = async (appUserID?: string | null) => {
  try {
    // ✅ Fallback to anonymous user if not logged in
    const userIdentifier = appUserID || null;

    await Purchases.configure({
      apiKey: Platform.select({
        ios: REVENUECAT_API_KEY_IOS,
        android: REVENUECAT_API_KEY_ANDROID,
      })!,
      appUserID: userIdentifier,
    });

    if (userIdentifier) {
      console.log("🟢 RevenueCat configured for user:", userIdentifier);
    } else {
      console.log("🟡 RevenueCat configured in anonymous mode (guest user)");
    }

    // Optional: force entitlement refresh to ensure state accuracy
    await Purchases.syncPurchases();

  } catch (err) {
    console.error("❌ Error configuring RevenueCat:", err);
  }
};

// 👇 Get all offerings (used in PaywallScreen)
export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch (err) {
    console.warn("⚠️ Error fetching offerings:", err);
    return [];
  }
};

// 👇 Check if 'Pro' entitlement is active
export const checkProEntitlement = async (): Promise<boolean> => {
  try {
    const info = await Purchases.getCustomerInfo();
    const active = info.entitlements.active;
    const isPro = !!active["Pro"];
    console.log("🔄 Entitlement check:", isPro ? "Pro" : "Free");
    return isPro;
  } catch (err) {
    console.warn("⚠️ Failed to check entitlement:", err);
    return false;
  }
};

// import { Platform } from "react-native";
// import Purchases from "react-native-purchases";

// /**
//  * 🔑 Use build-time env vars (from app.config.js or eas.json)
//  * Make sure these are defined as:
//  * EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
//  * EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
//  */
// const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!;
// const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!;

// /**
//  * 🧩 Configure RevenueCat for the current user (Appwrite or guest)
//  */
// export const configureRevenueCat = async (appUserID?: string | null) => {
//   try {
//     // 🚀 Always identify with Appwrite userId if available, otherwise anonymous
//     const userIdentifier = appUserID || null;

//     await Purchases.configure({
//       apiKey: Platform.select({
//         ios: REVENUECAT_API_KEY_IOS,
//         android: REVENUECAT_API_KEY_ANDROID,
//       })!,
//       appUserID: userIdentifier,
//     });

//     // 🧠 Sync purchases (important after Apple sign-in or device restore)
//     await Purchases.syncPurchases();

//     console.log(
//       userIdentifier
//         ? `🟢 RevenueCat configured for user: ${userIdentifier}`
//         : "🟡 RevenueCat configured anonymously (guest mode)"
//     );
//   } catch (err) {
//     console.error("❌ Error configuring RevenueCat:", err);
//   }
// };

// /**
//  * 🛍️ Get all current offerings (used on PaywallScreen)
//  */
// export const getOfferings = async () => {
//   try {
//     const offerings = await Purchases.getOfferings();
//     return offerings.current?.availablePackages ?? [];
//   } catch (err) {
//     console.warn("⚠️ Error fetching offerings:", err);
//     return [];
//   }
// };

// /**
//  * 💎 Check if 'Pro' entitlement is active
//  */
// export const checkProEntitlement = async (): Promise<boolean> => {
//   try {
//     const info = await Purchases.getCustomerInfo();
//     const isPro = !!info.entitlements.active["Pro"];
//     console.log("🔄 Entitlement check:", isPro ? "Pro" : "Free");
//     return isPro;
//   } catch (err) {
//     console.warn("⚠️ Failed to check entitlement:", err);
//     return false;
//   }
// };
