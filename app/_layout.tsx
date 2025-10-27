
// app/_layout.tsx
// import ErrorBoundary from "@/components/ErrorBoundary";
// import { AuthProvider, getCachedUserId } from "@/context/AuthContext";
// import { ProUserProvider } from "@/context/ProUserContext";
// import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
// import { configureRevenueCat } from "@/lib/revenuecat";
// import { Slot } from "expo-router";
// import React, { useEffect } from "react";
// import { MenuProvider } from "react-native-popup-menu";
// import { RootSiblingParent } from "react-native-root-siblings";

// export default function RootLayout() {
//   useEffect(() => {
//     (async () => {
//       try {
//         const appUserID = await getCachedUserId();
//         await configureRevenueCat(appUserID);
//         await registerAutoBackupTask();
//         console.log("✅ RevenueCat + Auto Sync initialized on startup");
//       } catch (err) {
//         console.warn("⚠️ Initialization failed:", err);
//       }
//     })();
//   }, []);

//   return (
//     <MenuProvider>
//       <RootSiblingParent>
//         <ErrorBoundary>
//           {/* ✅ Correct Provider Nesting Order */}
//           <ProUserProvider>
//             <AuthProvider>
//               <Slot />
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
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { MenuProvider } from "react-native-popup-menu";
import { RootSiblingParent } from "react-native-root-siblings";

function StartupInitializer() {
  const { user } = useAuth();
  const [showLoader, setShowLoader] = useState(true);
  const [startupStart] = useState(Date.now());

  useEffect(() => {
    if (user === undefined) return; // still resolving AuthContext

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

        // 🧠 Adaptive fade timing:
        // - If Auth loads quickly (<1.5s), hold loader for a minimum 1.2s total
        // - If longer, fade out immediately after setup
        const minDuration = 1200; // minimum display time
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
