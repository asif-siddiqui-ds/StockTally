import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";

/**
 * Returns a valid redirect URI for all environments:
 * - Expo Go (uses Expo proxy, always valid)
 * - Standalone native builds (uses custom scheme)
 * - Web or hosted fallback (uses HTTPS redirect page)
 */
export const getRedirectUri = (): string => {
  const isExpoGo = Constants.appOwnership === "expo";
  const isStandalone = Constants.appOwnership === "standalone";
  const isWeb = Constants.platform?.web;

  if (isExpoGo) {
    // ✅ Works on Expo Go (uses auth.expo.io proxy)
    return makeRedirectUri({ useProxy: true });
  }

  if (isStandalone) {
    // ✅ Works on Android/iOS builds (deep link)
    return "stocktally://oauth";
  }

  // ✅ Fallback for web or external redirect pages
  return "https://stocktally-redirect.vercel.app/redirect";
};
