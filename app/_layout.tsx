// import ErrorBoundary from "@/components/ErrorBoundary";
// import Header from "@/components/Header";
// import LoadingScreen from "@/components/LoadingScreen";
// import { AuthProvider, useAuth } from "@/context/AuthContext";
// import { ProUserProvider } from "@/context/ProUserContext";
// import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
// import {
//   notifyLowStockNow,
//   notifySupplierReturnsNow,
//   setupNotifications,
// } from "@/lib/notifications";
// import { configureRevenueCat } from "@/lib/revenuecat";
// import * as Linking from "expo-linking";
// import { Stack, useRouter } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import { MenuProvider } from "react-native-popup-menu";
// import { RootSiblingParent } from "react-native-root-siblings";

// function StartupInitializer() {
//   const { user, authLoading, refreshSession } = useAuth();
//   const [showLoader, setShowLoader] = useState(true);
//   const startupStart = useRef(Date.now()).current;
//   const notificationCheckedRef = useRef(false);
//   const router = useRouter();
//   const revenueCatConfiguredRef = useRef<string | null>(null);

//   // 🔗 Deep link handling for Apple/Google OAuth redirect
//   useEffect(() => {
//     const handleDeepLink = async (event: Linking.EventType) => {
//       const url = event.url;

//       if (url && url.startsWith("stocktally://")) {
//         console.log("📬 Deep link received:", url);

//         try {
//           await refreshSession();
//           console.log("🔄 Session refreshed after OAuth redirect.");
//           router.replace("/(tabs)/dashboard");
//         } catch (err) {
//           console.warn("⚠️ Deep link refresh failed:", err);
//         }
//       }
//     };

//     const subscription = Linking.addEventListener("url", handleDeepLink);

//     (async () => {
//       const initialUrl = await Linking.getInitialURL();

//       if (initialUrl && initialUrl.startsWith("stocktally://")) {
//         console.log("🚀 App launched from deep link:", initialUrl);

//         try {
//           await refreshSession();
//           console.log("🔄 Session refreshed after cold start redirect.");
//           router.replace("/(tabs)/dashboard");
//         } catch (err) {
//           console.warn("⚠️ Cold start refresh failed:", err);
//         }
//       }
//     })();

//     return () => subscription.remove();
//   }, [refreshSession, router]);

//   // ⚙️ Startup initialization
//   useEffect(() => {
//     if (authLoading) return;

//     let cancelled = false;
//     let loaderTimer: ReturnType<typeof setTimeout> | null = null;
//     let notificationTimer: ReturnType<typeof setTimeout> | null = null;

//     const initStartup = async () => {
//       try {
//         const elapsed = Date.now() - startupStart;

//         const currentRevenueCatUser = user?.$id || "guest";
//         if (revenueCatConfiguredRef.current !== currentRevenueCatUser) {
//           await configureRevenueCat(user?.$id);
//           revenueCatConfiguredRef.current = currentRevenueCatUser;
//           console.log("✅ RevenueCat configured:", currentRevenueCatUser);
//         }

//         // ✅ 2. Register auto-backup only for logged-in users
//         if (user?.$id) {
//           await registerAutoBackupTask();
//           console.log("✅ Auto-sync task registered");
//         } else {
//           console.log("🟡 Guest mode — auto-sync disabled");
//         }

//         // ✅ 3. Hide loader smoothly
//         const minDuration = 1200;
//         const delay = Math.max(0, minDuration - elapsed);

//         loaderTimer = setTimeout(() => {
//           if (!cancelled) setShowLoader(false);
//         }, delay);

//         // ✅ 4. Run notification checks shortly after RevenueCat setup
//         // This avoids competing with startup/RevenueCat while still feeling immediate.
//         if (!notificationCheckedRef.current) {
//           notificationCheckedRef.current = true;

//           notificationTimer = setTimeout(async () => {
//             if (cancelled) return;

//             try {
//               console.log("🔔 Checking startup notifications...");

//               await setupNotifications();
//               await notifyLowStockNow();
//               await notifySupplierReturnsNow();

//               console.log("✅ Startup notifications checked");
//             } catch (notificationErr) {
//               console.warn("⚠️ Startup notification check failed:", notificationErr);
//             }
//           }, 2000);
//         }
//       } catch (err) {
//         console.warn("⚠️ Startup init error:", err);
//         if (!cancelled) setShowLoader(false);
//       }
//     };

//     initStartup();

//     return () => {
//       cancelled = true;

//       if (loaderTimer) clearTimeout(loaderTimer);
//       if (notificationTimer) clearTimeout(notificationTimer);
//     };
//   }, [user, authLoading, startupStart]);

//   return (
//     <>
//       <Stack
//         screenOptions={{
//           header: (props) => <Header {...props} />,
//           headerShown: true,
//         }}
//       >
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>

//       <LoadingScreen visible={showLoader} />
//     </>
//   );
// }
// /**
//  * Root app layout — wraps all providers in correct order.
//  */
// export default function RootLayout() {
//   return (
//     <MenuProvider>
//       <RootSiblingParent>
//         <ErrorBoundary>
//           <AuthProvider>
//             <ProUserProvider>
//               <StartupInitializer />
//             </ProUserProvider>
//           </AuthProvider>
//         </ErrorBoundary>
//       </RootSiblingParent>
//     </MenuProvider>
//   );
// }

// import ErrorBoundary from "@/components/ErrorBoundary";
// import Header from "@/components/Header";
// import LoadingScreen from "@/components/LoadingScreen";
// import { AuthProvider, useAuth } from "@/context/AuthContext";
// import { ProUserProvider } from "@/context/ProUserContext";
// import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
// import {
//   notifyLowStockNow,
//   notifySupplierReturnsNow,
//   setupNotifications,
// } from "@/lib/notifications";
// import {
//   configureRevenueCat,
//   identifyRevenueCatUser,
// } from "@/lib/revenuecat";
// import * as Linking from "expo-linking";
// import { Stack, useRouter } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import { MenuProvider } from "react-native-popup-menu";
// import { RootSiblingParent } from "react-native-root-siblings";
// import { useProUser } from "@/context/ProUserContext";

// function StartupInitializer() {
//   const { user, authLoading, refreshSession } = useAuth();

//   const [showLoader, setShowLoader] = useState(true);

//   const startupStart = useRef(Date.now()).current;
//   const notificationCheckedRef = useRef(false);
//   const revenueCatConfiguredRef = useRef(false);
//   const revenueCatLoggedInUserRef = useRef<string | null>(null);
  

//   const router = useRouter();

//   // 🔗 Deep link handling for OAuth redirect
//   useEffect(() => {
//     const handleDeepLink = async (event: Linking.EventType) => {
//       const url = event.url;

//       if (url && url.startsWith("stocktally://")) {
//         console.log("📬 Deep link received:", url);

//         try {
//           await refreshSession();
//           console.log("🔄 Session refreshed after OAuth redirect.");
//           router.replace("/(tabs)/dashboard");
//         } catch (err) {
//           console.warn("⚠️ Deep link refresh failed:", err);
//         }
//       }
//     };

//     const subscription = Linking.addEventListener("url", handleDeepLink);

//     (async () => {
//       const initialUrl = await Linking.getInitialURL();

//       if (initialUrl && initialUrl.startsWith("stocktally://")) {
//         console.log("🚀 App launched from deep link:", initialUrl);

//         try {
//           await refreshSession();
//           console.log("🔄 Session refreshed after cold start redirect.");
//           router.replace("/(tabs)/dashboard");
//         } catch (err) {
//           console.warn("⚠️ Cold start refresh failed:", err);
//         }
//       }
//     })();

//     return () => subscription.remove();
//   }, [refreshSession, router]);

//   // ⚙️ Startup initialization
//   useEffect(() => {
//     if (authLoading) return;

//     let cancelled = false;
//     let loaderTimer: ReturnType<typeof setTimeout> | null = null;
//     let notificationTimer: ReturnType<typeof setTimeout> | null = null;

//     const initStartup = async () => {
//       try {
//         const elapsed = Date.now() - startupStart;

//         // ✅ 1. Configure RevenueCat once as anonymous/guest
//         if (!revenueCatConfiguredRef.current) {
//           await configureRevenueCat();
//           revenueCatConfiguredRef.current = true;
//           console.log("✅ RevenueCat configured");
//         }

//         // ✅ 2. If Appwrite user is logged in, identify user in RevenueCat
//         if (user?.$id && revenueCatLoggedInUserRef.current !== user.$id) {
//           await identifyRevenueCatUser(user.$id);
//           revenueCatLoggedInUserRef.current = user.$id;
//           console.log("✅ RevenueCat identified user:", user.$id);
//         }

//         // ✅ 3. Register auto-backup only for logged-in users
//         if (user?.$id) {
//           await registerAutoBackupTask();
//           console.log("✅ Auto-sync task registered");
//         } else {
//           revenueCatLoggedInUserRef.current = null;
//           console.log("🟡 Guest mode — auto-sync disabled");
//         }

//         // ✅ 4. Hide loader smoothly
//         const minDuration = 1200;
//         const delay = Math.max(0, minDuration - elapsed);

//         loaderTimer = setTimeout(() => {
//           if (!cancelled) setShowLoader(false);
//         }, delay);

//         // ✅ 5. Run notification checks once
//         if (!notificationCheckedRef.current) {
//           notificationCheckedRef.current = true;

//           notificationTimer = setTimeout(async () => {
//             if (cancelled) return;

//             try {
//               console.log("🔔 Checking startup notifications...");

//               await setupNotifications();
//               await notifyLowStockNow();
//               await notifySupplierReturnsNow();

//               console.log("✅ Startup notifications checked");
//             } catch (notificationErr) {
//               console.warn("⚠️ Startup notification check failed:", notificationErr);
//             }
//           }, 2000);
//         }
//       } catch (err) {
//         console.warn("⚠️ Startup init error:", err);
//         if (!cancelled) setShowLoader(false);
//       }
//     };

//     initStartup();

//     return () => {
//       cancelled = true;

//       if (loaderTimer) clearTimeout(loaderTimer);
//       if (notificationTimer) clearTimeout(notificationTimer);
//     };
//   }, [user, authLoading, startupStart]);

//   return (
//     <>
//       <Stack
//         screenOptions={{
//           header: (props) => <Header {...props} />,
//           headerShown: true,
//         }}
//       >
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>

//       <LoadingScreen visible={showLoader} />
//     </>
//   );
// }

// export default function RootLayout() {
//   return (
//     <MenuProvider>
//       <RootSiblingParent>
//         <ErrorBoundary>
//           <AuthProvider>
//             <ProUserProvider>
//               <StartupInitializer />
//             </ProUserProvider>
//           </AuthProvider>
//         </ErrorBoundary>
//       </RootSiblingParent>
//     </MenuProvider>
//   );
// }

// import ErrorBoundary from "@/components/ErrorBoundary";
// import Header from "@/components/Header";
// import LoadingScreen from "@/components/LoadingScreen";
// import { AuthProvider, useAuth } from "@/context/AuthContext";
// import { ProUserProvider, useProUser } from "@/context/ProUserContext";
// import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
// import {
//   notifyLowStockNow,
//   notifySupplierReturnsNow,
//   setupNotifications,
// } from "@/lib/notifications";
// import {
//   configureRevenueCat,
//   identifyRevenueCatUser,
// } from "@/lib/revenuecat";
// import * as Linking from "expo-linking";
// import { Stack, useRouter } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import { MenuProvider } from "react-native-popup-menu";
// import { RootSiblingParent } from "react-native-root-siblings";

// function StartupInitializer() {
//   const { user, authLoading, refreshSession } = useAuth();
//   const { updateEntitlements } = useProUser();

//   const [showLoader, setShowLoader] = useState(true);

//   const startupStart = useRef(Date.now()).current;
//   const notificationCheckedRef = useRef(false);
//   const revenueCatConfiguredRef = useRef(false);
//   const revenueCatLoggedInUserRef = useRef<string | null>(null);

//   const router = useRouter();

//   useEffect(() => {
//     const handleDeepLink = async (event: Linking.EventType) => {
//       const url = event.url;

//       if (url && url.startsWith("stocktally://")) {
//         console.log("📬 Deep link received:", url);

//         try {
//           await refreshSession();
//           console.log("🔄 Session refreshed after OAuth redirect.");
//           router.replace("/(tabs)/dashboard");
//         } catch (err) {
//           console.warn("⚠️ Deep link refresh failed:", err);
//         }
//       }
//     };

//     const subscription = Linking.addEventListener("url", handleDeepLink);

//     (async () => {
//       const initialUrl = await Linking.getInitialURL();

//       if (initialUrl && initialUrl.startsWith("stocktally://")) {
//         console.log("🚀 App launched from deep link:", initialUrl);

//         try {
//           await refreshSession();
//           console.log("🔄 Session refreshed after cold start redirect.");
//           router.replace("/(tabs)/dashboard");
//         } catch (err) {
//           console.warn("⚠️ Cold start refresh failed:", err);
//         }
//       }
//     })();

//     return () => subscription.remove();
//   }, [refreshSession, router]);

//   useEffect(() => {
//     if (authLoading) return;

//     let cancelled = false;
//     let loaderTimer: ReturnType<typeof setTimeout> | null = null;
//     let notificationTimer: ReturnType<typeof setTimeout> | null = null;

//     const initStartup = async () => {
//       try {
//         const elapsed = Date.now() - startupStart;

//         if (!revenueCatConfiguredRef.current) {
//           await configureRevenueCat();
//           revenueCatConfiguredRef.current = true;
//           console.log("✅ RevenueCat configured");
//         }

//         if (user?.$id && revenueCatLoggedInUserRef.current !== user.$id) {
//           const customerInfo = await identifyRevenueCatUser(user.$id);

//           if (!cancelled) {
//             await updateEntitlements(customerInfo);
//           }

//           revenueCatLoggedInUserRef.current = user.$id;
//           console.log("✅ RevenueCat identified user:", user.$id);
//         }

//         if (user?.$id) {
//           await registerAutoBackupTask();
//           console.log("✅ Auto-sync task registered");
//         } else {
//           revenueCatLoggedInUserRef.current = null;
//           console.log("🟡 Guest mode — auto-sync disabled");
//         }

//         const minDuration = 1200;
//         const delay = Math.max(0, minDuration - elapsed);

//         loaderTimer = setTimeout(() => {
//           if (!cancelled) setShowLoader(false);
//         }, delay);

//         if (!notificationCheckedRef.current) {
//           notificationCheckedRef.current = true;

//           notificationTimer = setTimeout(async () => {
//             if (cancelled) return;

//             try {
//               console.log("🔔 Checking startup notifications...");

//               await setupNotifications();
//               await notifyLowStockNow();
//               await notifySupplierReturnsNow();

//               console.log("✅ Startup notifications checked");
//             } catch (notificationErr) {
//               console.warn("⚠️ Startup notification check failed:", notificationErr);
//             }
//           }, 2000);
//         }
//       } catch (err) {
//         console.warn("⚠️ Startup init error:", err);
//         if (!cancelled) setShowLoader(false);
//       }
//     };

//     initStartup();

//     return () => {
//       cancelled = true;

//       if (loaderTimer) clearTimeout(loaderTimer);
//       if (notificationTimer) clearTimeout(notificationTimer);
//     };
//   }, [user, authLoading, startupStart, updateEntitlements]);

//   return (
//     <>
//       <Stack
//         screenOptions={{
//           header: (props) => <Header {...props} />,
//           headerShown: true,
//         }}
//       >
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>

//       <LoadingScreen visible={showLoader} />
//     </>
//   );
// }

// export default function RootLayout() {
//   return (
//     <MenuProvider>
//       <RootSiblingParent>
//         <ErrorBoundary>
//           <AuthProvider>
//             <ProUserProvider>
//               <StartupInitializer />
//             </ProUserProvider>
//           </AuthProvider>
//         </ErrorBoundary>
//       </RootSiblingParent>
//     </MenuProvider>
//   );
// }

// import ErrorBoundary from "@/components/ErrorBoundary";
// import Header from "@/components/Header";
// import LoadingScreen from "@/components/LoadingScreen";
// import { AuthProvider, useAuth } from "@/context/AuthContext";
// import { ProUserProvider, useProUser } from "@/context/ProUserContext";
// import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
// import {
//   notifyLowStockNow,
//   notifySupplierReturnsNow,
//   setupNotifications,
// } from "@/lib/notifications";
// import {
//   configureRevenueCat,
//   identifyRevenueCatUser,
// } from "@/lib/revenuecat";
// import * as Linking from "expo-linking";
// import { Stack, useRouter } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import { MenuProvider } from "react-native-popup-menu";
// import { RootSiblingParent } from "react-native-root-siblings";

// function StartupInitializer() {
//   const {
//     user,
//     authLoading,
//     refreshSession,
//     handleSuccessOrFailure,
//   } = useAuth();

//   const { updateEntitlements } = useProUser();

//   const [showLoader, setShowLoader] = useState(true);

//   const startupStart = useRef(Date.now()).current;
//   const notificationCheckedRef = useRef(false);
//   const revenueCatConfiguredRef = useRef(false);
//   const revenueCatLoggedInUserRef = useRef<string | null>(null);
//   const oauthHandledRef = useRef(false);

//   const router = useRouter();

//   const completeOAuthFromUrl = async (url: string, source: string) => {
//     if (oauthHandledRef.current) {
//       console.log("ℹ️ OAuth already handled, skipping duplicate:", source);
//       return;
//     }

//     console.log(`📬 OAuth deep link received from ${source}:`, url);

//     try {
//       const parsed = Linking.parse(url);

//       const secretParam = parsed.queryParams?.secret;
//       const userIdParam = parsed.queryParams?.userId;

//       const secret = Array.isArray(secretParam) ? secretParam[0] : secretParam;
//       const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

//       console.log("🔐 Received OAuth params:", secret ? "secret-present" : null, userId);

//       oauthHandledRef.current = true;

//       if (secret && userId) {
//         await handleSuccessOrFailure(secret, userId);
//         router.replace("/screens/PaywallScreen");
//         return;
//       }

//       await refreshSession();
//       router.replace("/screens/PaywallScreen");
//     } catch (err) {
//       oauthHandledRef.current = false;
//       console.warn("⚠️ OAuth deep link handling failed:", err);
//       router.replace("/(auth)/LoginScreen");
//     }
//   };

//   useEffect(() => {
//     const handleDeepLink = async (event: Linking.EventType) => {
//       const url = event.url;

//       if (url && url.startsWith("stocktally://")) {
//         await completeOAuthFromUrl(url, "event");
//       }
//     };

//     const subscription = Linking.addEventListener("url", handleDeepLink);

//     (async () => {
//       const initialUrl = await Linking.getInitialURL();

//       if (initialUrl && initialUrl.startsWith("stocktally://")) {
//         await completeOAuthFromUrl(initialUrl, "initialUrl");
//       }
//     })();

//     return () => subscription.remove();
//   }, [refreshSession, handleSuccessOrFailure, router]);

//   useEffect(() => {
//     if (authLoading) return;

//     let cancelled = false;
//     let loaderTimer: ReturnType<typeof setTimeout> | null = null;
//     let notificationTimer: ReturnType<typeof setTimeout> | null = null;

//     const initStartup = async () => {
//       try {
//         const elapsed = Date.now() - startupStart;

//         if (!revenueCatConfiguredRef.current) {
//           await configureRevenueCat();
//           revenueCatConfiguredRef.current = true;
//           console.log("✅ RevenueCat configured");
//         }

//         if (user?.$id && revenueCatLoggedInUserRef.current !== user.$id) {
//           const customerInfo = await identifyRevenueCatUser(user.$id);

//           if (!cancelled) {
//             await updateEntitlements(customerInfo);
//           }

//           revenueCatLoggedInUserRef.current = user.$id;
//           console.log("✅ RevenueCat identified user:", user.$id);
//         }

//         if (user?.$id) {
//           await registerAutoBackupTask();
//           console.log("✅ Auto-sync task registered");
//         } else {
//           revenueCatLoggedInUserRef.current = null;
//           console.log("🟡 Guest mode — auto-sync disabled");
//         }

//         const minDuration = 1200;
//         const delay = Math.max(0, minDuration - elapsed);

//         loaderTimer = setTimeout(() => {
//           if (!cancelled) setShowLoader(false);
//         }, delay);

//         if (!notificationCheckedRef.current) {
//           notificationCheckedRef.current = true;

//           notificationTimer = setTimeout(async () => {
//             if (cancelled) return;

//             try {
//               console.log("🔔 Checking startup notifications...");

//               await setupNotifications();
//               await notifyLowStockNow();
//               await notifySupplierReturnsNow();

//               console.log("✅ Startup notifications checked");
//             } catch (notificationErr) {
//               console.warn("⚠️ Startup notification check failed:", notificationErr);
//             }
//           }, 2000);
//         }
//       } catch (err) {
//         console.warn("⚠️ Startup init error:", err);
//         if (!cancelled) setShowLoader(false);
//       }
//     };

//     initStartup();

//     return () => {
//       cancelled = true;

//       if (loaderTimer) clearTimeout(loaderTimer);
//       if (notificationTimer) clearTimeout(notificationTimer);
//     };
//   }, [user, authLoading, startupStart, updateEntitlements]);

//   return (
//     <>
//       <Stack
//         screenOptions={{
//           header: (props) => <Header {...props} />,
//           headerShown: true,
//         }}
//       >
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>

//       <LoadingScreen visible={showLoader} />
//     </>
//   );
// }

// export default function RootLayout() {
//   return (
//     <MenuProvider>
//       <RootSiblingParent>
//         <ErrorBoundary>
//           <AuthProvider>
//             <ProUserProvider>
//               <StartupInitializer />
//             </ProUserProvider>
//           </AuthProvider>
//         </ErrorBoundary>
//       </RootSiblingParent>
//     </MenuProvider>
//   );
// }

import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CompanyProfileProvider, useCompanyProfile } from "@/context/CompanyProfileContext";
import { ProUserProvider, useProUser } from "@/context/ProUserContext";
import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
import {
  notifyLowStockNow,
  notifySupplierReturnsNow,
  setupNotifications,
} from "@/lib/notifications";
import {
  configureRevenueCat,
  identifyRevenueCatUser,
} from "@/lib/revenuecat";
import {
  linkGuestCompanyProfileToUser
} from "@/lib/storage";
import * as Linking from "expo-linking";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { MenuProvider } from "react-native-popup-menu";
import { RootSiblingParent } from "react-native-root-siblings";

function StartupInitializer() {
  const {
    user,
    authLoading,
    refreshSession,
    handleSuccessOrFailure,
  } = useAuth();

  const { updateEntitlements } = useProUser();

  const [showLoader, setShowLoader] = useState(true);

  const startupStart = useRef(Date.now()).current;
  const notificationCheckedRef = useRef(false);
  const revenueCatConfiguredRef = useRef(false);
  const revenueCatLoggedInUserRef = useRef<string | null>(null);
  const oauthHandledRef = useRef(false);
  const profileCheckedRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();

  const isProfileRoute = pathname.includes("companyProfile");
  const isAuthRoute = pathname.includes("(auth)") || pathname.includes("LoginScreen");
  const isPaywallRoute = pathname.includes("PaywallScreen");
  const { companyProfile, loading: loadingCompanyProfile } = useCompanyProfile();

  const completeOAuthFromUrl = async (url: string, source: string) => {
    if (oauthHandledRef.current) {
      console.log("ℹ️ OAuth already handled, skipping duplicate:", source);
      return;
    }

    console.log(`📬 OAuth deep link received from ${source}:`, url);

    try {
      const parsed = Linking.parse(url);

      const secretParam = parsed.queryParams?.secret;
      const userIdParam = parsed.queryParams?.userId;

      const secret = Array.isArray(secretParam) ? secretParam[0] : secretParam;
      const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

      console.log("🔐 Received OAuth params:", secret ? "secret-present" : null, userId);

      oauthHandledRef.current = true;

      if (secret && userId) {
        await handleSuccessOrFailure(secret, userId);
        router.replace("/screens/PaywallScreen");
        return;
      }

      await refreshSession();
      router.replace("/screens/PaywallScreen");
    } catch (err) {
      oauthHandledRef.current = false;
      console.warn("⚠️ OAuth deep link handling failed:", err);
      router.replace("/(auth)/LoginScreen");
    }
  };

  useEffect(() => {
    const handleDeepLink = async (event: Linking.EventType) => {
      const url = event.url;

      if (url && url.startsWith("stocktally://")) {
        await completeOAuthFromUrl(url, "event");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    (async () => {
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl && initialUrl.startsWith("stocktally://")) {
        await completeOAuthFromUrl(initialUrl, "initialUrl");
      }
    })();

    return () => subscription.remove();
  }, [refreshSession, handleSuccessOrFailure, router]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    let loaderTimer: ReturnType<typeof setTimeout> | null = null;
    let notificationTimer: ReturnType<typeof setTimeout> | null = null;

    const initStartup = async () => {
      try {
        const elapsed = Date.now() - startupStart;

        if (!revenueCatConfiguredRef.current) {
          await configureRevenueCat();
          revenueCatConfiguredRef.current = true;
          console.log("✅ RevenueCat configured");
        }

        if (user?.$id && revenueCatLoggedInUserRef.current !== user.$id) {
          await linkGuestCompanyProfileToUser(user.$id);

          const customerInfo = await identifyRevenueCatUser(user.$id);

          if (!cancelled) {
            await updateEntitlements(customerInfo);
          }

          revenueCatLoggedInUserRef.current = user.$id;
          console.log("✅ RevenueCat identified user:", user.$id);
        }

        if (user?.$id) {
          await registerAutoBackupTask();
          console.log("✅ Auto-sync task registered");
        } else {
          revenueCatLoggedInUserRef.current = null;
          console.log("🟡 Guest mode — auto-sync disabled");
        }

        if (
          !profileCheckedRef.current &&
          !loadingCompanyProfile &&
          !isProfileRoute &&
          !isAuthRoute &&
          !isPaywallRoute
        ) {
          profileCheckedRef.current = true;

          const hasRequiredProfile =
            !!companyProfile?.companyName?.trim() &&
            !!companyProfile?.currencyCode?.trim() &&
            !!companyProfile?.currencySymbol?.trim();

          if (!hasRequiredProfile) {
            console.log("🏢 Company profile missing — redirecting to setup");
            router.replace("/screens/CompanyProfileScreen");
          } else {
            console.log("✅ Company profile found");
          }
        }

        const minDuration = 1200;
        const delay = Math.max(0, minDuration - elapsed);

        loaderTimer = setTimeout(() => {
          if (!cancelled) setShowLoader(false);
        }, delay);

        if (!notificationCheckedRef.current) {
          notificationCheckedRef.current = true;

          notificationTimer = setTimeout(async () => {
            if (cancelled) return;

            try {
              console.log("🔔 Checking startup notifications...");

              await setupNotifications();
              await notifyLowStockNow();
              await notifySupplierReturnsNow();

              console.log("✅ Startup notifications checked");
            } catch (notificationErr) {
              console.warn("⚠️ Startup notification check failed:", notificationErr);
            }
          }, 2000);
        }
      } catch (err) {
        console.warn("⚠️ Startup init error:", err);
        if (!cancelled) setShowLoader(false);
      }
    };

    initStartup();

    return () => {
      cancelled = true;

      if (loaderTimer) clearTimeout(loaderTimer);
      if (notificationTimer) clearTimeout(notificationTimer);
    };
  }, [
    user,
    authLoading,
    startupStart,
    updateEntitlements,
    isProfileRoute,
    isAuthRoute,
    isPaywallRoute,
    router,
  ]);

  return (
    <>
      <Stack
        screenOptions={{
          header: (props) => <Header {...props} />,
          headerShown: true,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      <LoadingScreen visible={showLoader} />
    </>
  );
}

export default function RootLayout() {
  return (
    <MenuProvider>
      <RootSiblingParent>
        <ErrorBoundary>
          <AuthProvider>
            <ProUserProvider>
              <CompanyProfileProvider>
                <StartupInitializer />
              </CompanyProfileProvider>   
            </ProUserProvider>
          </AuthProvider>
        </ErrorBoundary>
      </RootSiblingParent>
    </MenuProvider>
  );
}