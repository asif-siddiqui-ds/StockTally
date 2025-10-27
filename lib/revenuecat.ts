// import Constants from 'expo-constants';
// import { Platform } from "react-native";
// import Purchases from 'react-native-purchases';

// export async function setupRevenueCat(appUserID: string) {
//   const apiKey = Constants.expoConfig?.extra?.revenuecatApiKey;

//   if (!apiKey) {
//     throw new Error("RevenueCat API key is missing in app.json → extra.revenuecatApiKey");
//   }

//   await Purchases.configure({
//     apiKey,
//     appUserID,
//   });
// }

// // ✅ Initialize RevenueCat as early as possible
// export const configureRevenueCat = async () => {
//   try {
//     if (Platform.OS === "ios") {
//       await Purchases.configure({
//         apiKey: "appl_baZiIBClpFlhCpNAJFYjduVfJxp",
//       });
//     } else {
//       await Purchases.configure({
//         apiKey: "goog_lxCaKWTctCguAXQGiZqRFVWSXez",
//       });
//     }
//     console.log("🟢 RevenueCat configured early");
//   } catch (err) {
//     console.warn("⚠️ RevenueCat early init failed:", err);
//   }
// };


// 🏷️ Replace with your entitlement identifier from RevenueCat Dashboard
// const ENTITLEMENT_ID = "Pro";  

// export async function checkProEntitlement(): Promise<boolean> {
//   try {
//     const customerInfo = await Purchases.getCustomerInfo();

//     if (
//       customerInfo.entitlements.active &&
//       customerInfo.entitlements.active[ENTITLEMENT_ID]
//     ) {
//       return true; // ✅ Pro subscription is active
//     }
//     return false; // 🚫 No active Pro entitlement
//   } catch (err) {
//     console.error("❌ Error checking entitlements:", err);
//     return false;
//   }
// }

// lib/revenuecatSetup.ts

// lib/revenuecat.ts
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
