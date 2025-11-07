
// // app/_layout.tsx
// // import ErrorBoundary from "@/components/ErrorBoundary";
// // import { AuthProvider, getCachedUserId } from "@/context/AuthContext";
// // import { ProUserProvider } from "@/context/ProUserContext";
// // import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
// // import { configureRevenueCat } from "@/lib/revenuecat";
// // import { Slot } from "expo-router";
// // import React, { useEffect } from "react";
// // import { MenuProvider } from "react-native-popup-menu";
// // import { RootSiblingParent } from "react-native-root-siblings";

// // export default function RootLayout() {
// //   useEffect(() => {
// //     (async () => {
// //       try {
// //         const appUserID = await getCachedUserId();
// //         await configureRevenueCat(appUserID);
// //         await registerAutoBackupTask();
// //         console.log("✅ RevenueCat + Auto Sync initialized on startup");
// //       } catch (err) {
// //         console.warn("⚠️ Initialization failed:", err);
// //       }
// //     })();
// //   }, []);

// //   return (
// //     <MenuProvider>
// //       <RootSiblingParent>
// //         <ErrorBoundary>
// //           {/* ✅ Correct Provider Nesting Order */}
// //           <ProUserProvider>
// //             <AuthProvider>
// //               <Slot />
// //             </AuthProvider>
// //           </ProUserProvider>
// //         </ErrorBoundary>
// //       </RootSiblingParent>
// //     </MenuProvider>
// //   );
// // }

// // app/_layout.tsx
// import ErrorBoundary from "@/components/ErrorBoundary";
// import LoadingScreen from "@/components/LoadingScreen";
// import { AuthProvider, useAuth } from "@/context/AuthContext";
// import { ProUserProvider } from "@/context/ProUserContext";
// import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
// import { configureRevenueCat } from "@/lib/revenuecat";
// import { Slot, useRouter} from "expo-router";
// import React, { useEffect, useState } from "react";
// import { MenuProvider } from "react-native-popup-menu";
// import { RootSiblingParent } from "react-native-root-siblings";
// import * as Linking from "expo-linking";

// function StartupInitializer() {
//   const { user } = useAuth();
//   const [showLoader, setShowLoader] = useState(true);
//   const [startupStart] = useState(Date.now());
//   const { refreshSession } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     // 🔗 Handle app deep link from Apple OAuth redirect
//     const handleDeepLink = async (event: Linking.EventType) => {
//       const url = event.url;
//       if (url && url.startsWith("stocktally:///")) {
//         console.log("📬 Deep link received:", url);
//         await refreshSession();

//         // ✅ Once user is refreshed, navigate to dashboard
//         router.replace("/(tabs)/dashboard");
//       }
//     };

//     // Listen for incoming URLs
//     const subscription = Linking.addEventListener("url", handleDeepLink);

//     // Also handle case where app is launched directly from a deep link
//     (async () => {
//       const initialUrl = await Linking.getInitialURL();
//       if (initialUrl && initialUrl.startsWith("stocktally:///")) {
//         console.log("🚀 Launched from deep link:", initialUrl);
//         await refreshSession();
//         router.replace("/(tabs)/dashboard");
//       }
//     })();

//     return () => subscription.remove();
//   }, []);


//   useEffect(() => {
//     if (user === undefined) return; // still resolving AuthContext

//     (async () => {
//       try {
//         const elapsed = Date.now() - startupStart;

//         await configureRevenueCat(user?.$id);
//         console.log("✅ RevenueCat configured:", user?.$id || "guest");

//         if (user?.$id) {
//           await registerAutoBackupTask();
//           console.log("✅ Auto-sync task registered");
//         } else {
//           console.log("🟡 Guest mode — auto-sync disabled");
//         }

//         // 🧠 Adaptive fade timing:
//         // - If Auth loads quickly (<1.5s), hold loader for a minimum 1.2s total
//         // - If longer, fade out immediately after setup
//         const minDuration = 1200; // minimum display time
//         const delay = Math.max(0, minDuration - elapsed);

//         setTimeout(() => setShowLoader(false), delay);
//       } catch (err) {
//         console.warn("⚠️ Startup init error:", err);
//         setShowLoader(false);
//       }
//     })();
//   }, [user]);

  

//   return (
//     <>
//       <Slot />
//       <LoadingScreen visible={showLoader} />
//     </>
//   );
// }

// export default function RootLayout() {
//   return (
//     <MenuProvider>
//       <RootSiblingParent>
//         <ErrorBoundary>
//           <ProUserProvider>
//             <AuthProvider>
//               <StartupInitializer />
//             </AuthProvider>
//           </ProUserProvider>
//         </ErrorBoundary>
//       </RootSiblingParent>
//     </MenuProvider>
//   );
// }

// app/_layout.tsx
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingScreen from "@/components/LoadingScreen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProUserProvider } from "@/context/ProUserContext";
import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
import { configureRevenueCat } from "@/lib/revenuecat";
import * as Linking from "expo-linking";
import { Slot, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { MenuProvider } from "react-native-popup-menu";
import { RootSiblingParent } from "react-native-root-siblings";

/**
 * Handles deep-link refresh, RevenueCat init, and backup setup.
 * Mounted only after AuthProvider is active.
 */
function StartupInitializer() {
  const { user, refreshSession } = useAuth();
  const [showLoader, setShowLoader] = useState(true);
  const [startupStart] = useState(Date.now());
  const router = useRouter();

  // 🔗 Deep link handling for Apple OAuth redirect
  useEffect(() => {
    const handleDeepLink = async (event: Linking.EventType) => {
      const url = event.url;
      if (url && url.startsWith("stocktally:///")) {
        console.log("📬 Deep link received:", url);
        try {
          await refreshSession();
          console.log("🔄 Session refreshed after OAuth redirect.");
          router.replace("/(tabs)/dashboard");
        } catch (err) {
          console.warn("⚠️ Deep link refresh failed:", err);
        }
      }
    };

    // Subscribe to deep link events
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Also handle when app *launches* from the deep link (cold start)
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && initialUrl.startsWith("stocktally:///")) {
        console.log("🚀 App launched from deep link:", initialUrl);
        try {
          await refreshSession();
          console.log("🔄 Session refreshed after cold start redirect.");
          router.replace("/(tabs)/dashboard");
        } catch (err) {
          console.warn("⚠️ Cold start refresh failed:", err);
        }
      }
    })();

    return () => subscription.remove();
  }, []);

  // ⚙️ App startup initialization (RevenueCat + AutoBackup + Loader)
  useEffect(() => {
    if (user === undefined) return; // still loading AuthContext

    (async () => {
      try {
        const elapsed = Date.now() - startupStart;

        await configureRevenueCat(user?.$id);
        console.log("✅ RevenueCat configured:", user?.$id || "guest");

        if (user?.$id) {
          await registerAutoBackupTask();
          console.log("✅ Auto-sync task registered");
        } else {
          console.log("🟡 Guest mode — auto-sync disabled");
        }

        // 🧠 Adaptive loader timing: ensure a smooth UX
        const minDuration = 1200;
        const delay = Math.max(0, minDuration - elapsed);
        setTimeout(() => setShowLoader(false), delay);
      } catch (err) {
        console.warn("⚠️ Startup init error:", err);
        setShowLoader(false);
      }
    })();
  }, [user]);

  return (
    <>
      <Slot />
      <LoadingScreen visible={showLoader} />
    </>
  );
}

/**
 * Root app layout — wraps all providers in correct order.
 */
export default function RootLayout() {
  return (
    <MenuProvider>
      <RootSiblingParent>
        <ErrorBoundary>
          <ProUserProvider>
            <AuthProvider>
              <StartupInitializer />
            </AuthProvider>
          </ProUserProvider>
        </ErrorBoundary>
      </RootSiblingParent>
    </MenuProvider>
  );
}
