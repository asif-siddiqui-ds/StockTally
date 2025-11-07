import { account } from "@/appwrite";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

/**
 * Opens Appwrite OAuth flow for the given provider (Apple, Google, etc.)
 * Works in React Native / Expo environments (no window.location)
 */
export async function startOAuthSession(provider: "apple" | "google" | "github") {
  const projectId = "68215c9f00161f204345";
  const endpoint = "https://fra.cloud.appwrite.io/v1";
  const redirectServer = "https://stocktally-redirect.vercel.app";
  const deepLink = Linking.createURL("/"); // e.g., stocktally:///

  try {
    // Clean old session if exists
    await account.deleteSession("current").catch(() => {});

    const success = encodeURIComponent(
      `${redirectServer}/redirect?mode=session&target=${deepLink}`
    );
    const failure = encodeURIComponent(
      `${redirectServer}/redirect?mode=error&target=${deepLink}`
    );

    const authUrl = `${endpoint}/account/sessions/oauth2/${provider}?project=${projectId}&success=${success}&failure=${failure}`;
    console.log(`🔗 Opening ${provider} Auth URL:`, authUrl);

    // Open system browser for OAuth
    const result = await WebBrowser.openAuthSessionAsync(authUrl, deepLink);

    if (result.type === "success" && result.url) {
      console.log("✅ Returned to app:", result.url);
      const parsed = Linking.parse(result.url);
      const token = parsed.queryParams?.secret as string | undefined;
      if (!token) throw new Error("No Appwrite session token found");

      console.log("🔑 Creating Appwrite session...");
      await account.createSession(token);

      const user = await account.get();
      console.log(`✅ ${provider} Sign-In success:`, user.email);
      return user;
    } else {
      console.log(`⚠️ ${provider} Sign-In cancelled or failed redirect.`);
      return null;
    }
  } catch (error: any) {
    console.error(`❌ ${provider} Sign-In failed:`, error);
    throw error;
  }
}
