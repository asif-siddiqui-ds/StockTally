// // app/_layout.tsx

// import ErrorBoundary from "@/components/ErrorBoundary";
// import Header from "@/components/Header";
// import LoadingScreen from "@/components/LoadingScreen";
// import {
//   AuthProvider,
//   useAuth,
// } from "@/context/AuthContext";
// import {
//   CompanyProfileProvider,
//   useCompanyProfile,
// } from "@/context/CompanyProfileContext";
// import {
//   ProUserProvider,
//   useProUser,
// } from "@/context/ProUserContext";
// import {
//   SubscriptionProvider,
// } from "@/context/SubscriptionContext";
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
// import { linkGuestCompanyProfileToUser } from "@/lib/storage";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Linking from "expo-linking";
// import {
//   Stack,
//   usePathname,
//   useRouter,
// } from "expo-router";
// import React, {
//   useCallback,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { MenuProvider } from "react-native-popup-menu";
// import { RootSiblingParent } from "react-native-root-siblings";

// const TRIAL_PROMPT_SEEN_KEY =
//   "trialLoginPromptSeen";

// function StartupInitializer() {
//   const {
//     user,
//     authLoading,
//     refreshSession,
//     handleSuccessOrFailure,
//   } = useAuth();

//   const { updateEntitlements } =
//     useProUser();

//   const {
//     companyProfile,
//     loading: loadingCompanyProfile,
//   } = useCompanyProfile();

//   const router = useRouter();
//   const pathname = usePathname();

//   const [showLoader, setShowLoader] =
//     useState(true);

//   const startupStartRef =
//     useRef(Date.now());
//   const notificationCheckedRef =
//     useRef(false);
//   const [
//     revenueCatConfigured,
//     setRevenueCatConfigured,
//   ] = useState(false);
//   const revenueCatLoggedInUserRef =
//     useRef<string | null>(null);
//   const oauthHandledRef =
//     useRef(false);
//   const profileCheckedRef =
//     useRef(false);
//   const trialPromptCheckedRef =
//     useRef(false);

//   const lowerPath =
//     pathname.toLowerCase();

//   const isProfileRoute =
//     lowerPath.includes(
//       "companyprofilescreen"
//     ) ||
//     lowerPath.includes(
//       "companyprofile"
//     );

//   const isAuthRoute =
//     lowerPath.includes("(auth)") ||
//     lowerPath.includes("loginscreen");

//   const isPaywallRoute =
//     lowerPath.includes("paywallscreen");

//   const isTrialWelcomeRoute =
//     lowerPath.includes(
//       "trialwelcomescreen"
//     );

//   const completeOAuthFromUrl =
//     useCallback(
//       async (
//         url: string,
//         source: string
//       ): Promise<void> => {
//         if (oauthHandledRef.current) {
//           return;
//         }

//         try {
//           const parsed =
//             Linking.parse(url);

//           const secretParam =
//             parsed.queryParams?.secret;

//           const userIdParam =
//             parsed.queryParams?.userId;

//           const secret =
//             Array.isArray(secretParam)
//               ? secretParam[0]
//               : secretParam;

//           const userId =
//             Array.isArray(userIdParam)
//               ? userIdParam[0]
//               : userIdParam;

//           oauthHandledRef.current = true;

//           if (secret && userId) {
//             await handleSuccessOrFailure(
//               String(secret),
//               String(userId)
//             );

//             /*
//              * Do not send a newly logged-in user to the paywall.
//              * Their 30-day trial starts automatically.
//              */
//             router.replace("/(tabs)");
//             return;
//           }

//           await refreshSession();
//           router.replace("/(tabs)");
//         } catch (error) {
//           oauthHandledRef.current = false;

//           console.warn(
//             "⚠️ OAuth deep link handling failed:",
//             error
//           );

//           router.replace(
//             "/(auth)/LoginScreen"
//           );
//         }
//       },
//       [
//         handleSuccessOrFailure,
//         refreshSession,
//         router,
//       ]
//     );

//   useEffect(() => {
//     const handleDeepLink = (
//       event: Linking.EventType
//     ) => {
//       if (
//         event.url?.startsWith(
//           "stocktally://"
//         )
//       ) {
//         void completeOAuthFromUrl(
//           event.url,
//           "event"
//         );
//       }
//     };

//     const subscription =
//       Linking.addEventListener(
//         "url",
//         handleDeepLink
//       );

//     void Linking.getInitialURL()
//       .then((initialUrl) => {
//         if (
//           initialUrl?.startsWith(
//             "stocktally://"
//           )
//         ) {
//           return completeOAuthFromUrl(
//             initialUrl,
//             "initialUrl"
//           );
//         }
//       })
//       .catch((error) => {
//         console.warn(
//           "⚠️ Failed to read initial URL:",
//           error
//         );
//       });

//     return () => {
//       subscription.remove();
//     };
//   }, [completeOAuthFromUrl]);

//   useEffect(() => {
//     if (
//       authLoading ||
//       revenueCatConfiguredRef.current
//     ) {
//       return;
//     }

//     void configureRevenueCat()
//       .then(() => {
//         revenueCatConfiguredRef.current =
//           true;
//       })
//       .catch((error) => {
//         console.warn(
//           "⚠️ RevenueCat configuration failed:",
//           error
//         );
//       });
//   }, [authLoading]);

//   useEffect(() => {
//     if (!__DEV__) return;

//     const resetTrialPrompt = async () => {
//       await AsyncStorage.removeItem(
//         "trialLoginPromptSeen"
//       );

//       console.log(
//         "🧪 Trial welcome reset for development"
//       );
//     };

//     resetTrialPrompt();
//   }, []);

//   useEffect(() => {
//     if (authLoading) return;

//     let cancelled = false;

//     const synchroniseUser =
//       async () => {
//         if (!user?.$id) {
//           revenueCatLoggedInUserRef.current =
//             null;
//           return;
//         }

//         if (
//           revenueCatLoggedInUserRef.current ===
//           user.$id
//         ) {
//           return;
//         }

//         try {
//           await linkGuestCompanyProfileToUser(
//             user.$id
//           );

//           const customerInfo =
//             await identifyRevenueCatUser(
//               user.$id
//             );

//           if (cancelled) return;

//           await updateEntitlements(
//             customerInfo
//           );

//           revenueCatLoggedInUserRef.current =
//             user.$id;
//         } catch (error) {
//           console.warn(
//             "⚠️ RevenueCat user sync failed:",
//             error
//           );
//         }
//       };

//     void synchroniseUser();

//     return () => {
//       cancelled = true;
//     };
//   }, [
//     authLoading,
//     updateEntitlements,
//     user?.$id,
//   ]);

//   useEffect(() => {
//     if (
//       authLoading ||
//       !user?.$id
//     ) {
//       return;
//     }

//     void registerAutoBackupTask()
//       .catch((error) => {
//         console.warn(
//           "⚠️ Auto-sync registration failed:",
//           error
//         );
//       });
//   }, [
//     authLoading,
//     user?.$id,
//   ]);

//   /*
//    * First stage:
//    * Guest opens StockTally and completes the company profile.
//    */
//   useEffect(() => {
//     if (
//       authLoading ||
//       loadingCompanyProfile ||
//       profileCheckedRef.current ||
//       isProfileRoute ||
//       isAuthRoute ||
//       isPaywallRoute ||
//       isTrialWelcomeRoute
//     ) {
//       return;
//     }

//     const hasRequiredProfile =
//       Boolean(
//         companyProfile?.companyName?.trim()
//       ) &&
//       Boolean(
//         companyProfile?.currencyCode?.trim()
//       ) &&
//       Boolean(
//         companyProfile?.currencySymbol?.trim()
//       );

//     if (!hasRequiredProfile) {
//       profileCheckedRef.current = true;

//       router.replace(
//         "/screens/CompanyProfileScreen"
//       );
//     }
//   }, [
//     authLoading,
//     companyProfile,
//     isAuthRoute,
//     isPaywallRoute,
//     isProfileRoute,
//     isTrialWelcomeRoute,
//     loadingCompanyProfile,
//     router,
//   ]);

//   /*
//    * Second stage:
//    * Once the guest profile exists, show a one-time choice:
//    * sign in to start the trial, or continue free as a guest.
//    */
//   useEffect(() => {
//     if (
//       authLoading ||
//       loadingCompanyProfile ||
//       trialPromptCheckedRef.current ||
//       user?.$id ||
//       isProfileRoute ||
//       isAuthRoute ||
//       isPaywallRoute ||
//       isTrialWelcomeRoute
//     ) {
//       return;
//     }

//     const hasRequiredProfile =
//       Boolean(
//         companyProfile?.companyName?.trim()
//       ) &&
//       Boolean(
//         companyProfile?.currencyCode?.trim()
//       ) &&
//       Boolean(
//         companyProfile?.currencySymbol?.trim()
//       );

//     if (!hasRequiredProfile) return;

//     trialPromptCheckedRef.current = true;

//     void AsyncStorage.getItem(
//       TRIAL_PROMPT_SEEN_KEY
//     ).then((seen) => {
//       if (seen !== "true") {
//         router.replace(
//           "/screens/TrialWelcomeScreen"
//         );
//       }
//     });
//   }, [
//     authLoading,
//     companyProfile,
//     isAuthRoute,
//     isPaywallRoute,
//     isProfileRoute,
//     isTrialWelcomeRoute,
//     loadingCompanyProfile,
//     router,
//     user?.$id,
//   ]);

//   useEffect(() => {
//     if (authLoading) return;

//     const elapsed =
//       Date.now() -
//       startupStartRef.current;

//     const timer = setTimeout(
//       () => setShowLoader(false),
//       Math.max(0, 1200 - elapsed)
//     );

//     return () => clearTimeout(timer);
//   }, [authLoading]);

//   useEffect(() => {
//     if (
//       authLoading ||
//       notificationCheckedRef.current
//     ) {
//       return;
//     }

//     notificationCheckedRef.current = true;

//     const timer = setTimeout(() => {
//       void (async () => {
//         try {
//           await setupNotifications();
//           await notifyLowStockNow();
//           await notifySupplierReturnsNow();
//         } catch (error) {
//           console.warn(
//             "⚠️ Startup notification check failed:",
//             error
//           );
//         }
//       })();
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, [authLoading]);

//   return (
//     <>
//       <Stack
//         screenOptions={{
//           header: (props) => (
//             <Header {...props} />
//           ),
//           headerShown: true,
//         }}
//       >
//         <Stack.Screen
//           name="(tabs)"
//           options={{
//             headerShown: false,
//           }}
//         />

//         <Stack.Screen
//           name="screens/TrialWelcomeScreen"
//           options={{
//             headerShown: false,
//           }}
//         />
//       </Stack>

//       <LoadingScreen
//         visible={showLoader}
//       />
//     </>
//   );
// }

// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView
//       style={{ flex: 1 }}
//     >
//       <RootSiblingParent>
//         <MenuProvider>
//           <ErrorBoundary>
//             <AuthProvider>
//               <ProUserProvider>
//                 <SubscriptionProvider>
//                   <CompanyProfileProvider>
//                     <StartupInitializer />
//                   </CompanyProfileProvider>
//                 </SubscriptionProvider>
//               </ProUserProvider>
//             </AuthProvider>
//           </ErrorBoundary>
//         </MenuProvider>
//       </RootSiblingParent>
//     </GestureHandlerRootView>
//   );
// }

// app/_layout.tsx

import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";

import {
  AuthProvider,
  useAuth,
} from "@/context/AuthContext";

import {
  CompanyProfileProvider,
  useCompanyProfile,
} from "@/context/CompanyProfileContext";

import {
  ProUserProvider,
  useProUser,
} from "@/context/ProUserContext";

import {
  SubscriptionProvider,
} from "@/context/SubscriptionContext";

import {
  registerAutoBackupTask,
} from "@/lib/background/autoBackupTask";

import {
  notifyLowStockNow,
  notifySupplierReturnsNow,
  setupNotifications,
} from "@/lib/notifications";

import {
  configureRevenueCat,
  identifyRevenueCatUser,
} from "@/lib/revenuecat";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

import {
  Stack,
  usePathname,
  useRouter,
} from "expo-router";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import {
  MenuProvider,
} from "react-native-popup-menu";

import {
  RootSiblingParent,
} from "react-native-root-siblings";

const TRIAL_PROMPT_SEEN_KEY =
  "trialLoginPromptSeen";

function StartupInitializer() {
  const {
    user,
    authLoading,
    refreshSession,
    handleSuccessOrFailure,
  } = useAuth();

  const {
    updateEntitlements,
  } = useProUser();

  const {
    companyProfile,
    loadingCompanyProfile,
    refreshCompanyProfile,
  } = useCompanyProfile();

  const router = useRouter();
  const pathname = usePathname();

  const [showLoader, setShowLoader] =
    useState(true);

  const [
    revenueCatConfigured,
    setRevenueCatConfigured,
  ] = useState(false);

  const startupStartRef =
    useRef(Date.now());

  const notificationCheckedRef =
    useRef(false);

  const revenueCatLoggedInUserRef =
    useRef<string | null>(null);

  const oauthHandledRef =
    useRef(false);

  const profileCheckedRef =
    useRef(false);

  const trialPromptCheckedRef =
    useRef(false);

  const lowerPath =
    pathname.toLowerCase();

  const isProfileRoute =
    lowerPath.includes(
      "companyprofilescreen"
    ) ||
    lowerPath.includes(
      "companyprofile"
    );

  const isAuthRoute =
    lowerPath.includes("(auth)") ||
    lowerPath.includes(
      "loginscreen"
    ) ||
    lowerPath.includes(
      "register"
    );

  const isPaywallRoute =
    lowerPath.includes(
      "paywallscreen"
    );

  const isTrialWelcomeRoute =
    lowerPath.includes(
      "trialwelcomescreen"
    );

  // -------------------------------------------------------
  // OAUTH DEEP-LINK COMPLETION
  // -------------------------------------------------------

  const completeOAuthFromUrl =
    useCallback(
      async (
        url: string,
        source: string
      ): Promise<void> => {
        if (oauthHandledRef.current) {
          return;
        }

        try {
          console.log(
            `🔗 Processing OAuth URL from ${source}`
          );

          const parsed =
            Linking.parse(url);

          const secretParam =
            parsed.queryParams?.secret;

          const userIdParam =
            parsed.queryParams?.userId;

          const secret =
            Array.isArray(secretParam)
              ? secretParam[0]
              : secretParam;

          const userId =
            Array.isArray(userIdParam)
              ? userIdParam[0]
              : userIdParam;

          /*
           * Only mark OAuth as handled when the URL contains
           * the valid Appwrite OAuth credentials.
           */
          if (secret && userId) {
            oauthHandledRef.current =
              true;

            await handleSuccessOrFailure(
              String(secret),
              String(userId)
            );

            /*
             * Trial creation/restoration is handled by
             * SubscriptionContext after AuthContext updates
             * the authenticated user.
             */
            router.replace("/(tabs)");
            return;
          }

          /*
           * A stocktally:// URL may be a normal deep link
           * instead of an OAuth callback.
           *
           * Attempt to restore the existing Appwrite session
           * without permanently blocking a future OAuth URL.
           */
          await refreshSession();

          router.replace("/(tabs)");
        } catch (error) {
          oauthHandledRef.current =
            false;

          console.warn(
            "⚠️ OAuth deep-link handling failed:",
            error
          );

          router.replace(
            "/(auth)/LoginScreen"
          );
        }
      },
      [
        handleSuccessOrFailure,
        refreshSession,
        router,
      ]
    );

  useEffect(() => {
    const handleDeepLink = (
      event: Linking.EventType
    ) => {
      if (
        event.url?.startsWith(
          "stocktally://"
        )
      ) {
        void completeOAuthFromUrl(
          event.url,
          "event"
        );
      }
    };

    const subscription =
      Linking.addEventListener(
        "url",
        handleDeepLink
      );

    void Linking.getInitialURL()
      .then((initialUrl) => {
        if (
          initialUrl?.startsWith(
            "stocktally://"
          )
        ) {
          return completeOAuthFromUrl(
            initialUrl,
            "initialUrl"
          );
        }

        return undefined;
      })
      .catch((error) => {
        console.warn(
          "⚠️ Failed to read initial URL:",
          error
        );
      });

    return () => {
      subscription.remove();
    };
  }, [completeOAuthFromUrl]);

  // -------------------------------------------------------
  // REVENUECAT CONFIGURATION
  // -------------------------------------------------------

  useEffect(() => {
    if (
      authLoading ||
      revenueCatConfigured
    ) {
      return;
    }

    let cancelled = false;

    const initialiseRevenueCat =
      async (): Promise<void> => {
        try {
          await configureRevenueCat();

          if (!cancelled) {
            setRevenueCatConfigured(
              true
            );

            console.log(
              "✅ RevenueCat configured"
            );
          }
        } catch (error) {
          console.warn(
            "⚠️ RevenueCat configuration failed:",
            error
          );
        }
      };

    void initialiseRevenueCat();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    revenueCatConfigured,
  ]);

  // -------------------------------------------------------
  // REVENUECAT USER IDENTIFICATION
  // -------------------------------------------------------

  useEffect(() => {
    if (
      authLoading ||
      !revenueCatConfigured
    ) {
      return;
    }

    let cancelled = false;

    const synchroniseUser =
      async (): Promise<void> => {
        /*
         * Guest mode uses RevenueCat's anonymous customer.
         */
        if (!user?.$id) {
          revenueCatLoggedInUserRef.current =
            null;

          return;
        }

        /*
         * Do not repeatedly identify the same Appwrite user.
         */
        if (
          revenueCatLoggedInUserRef.current ===
          user.$id
        ) {
          return;
        }

        try {
          const customerInfo =
            await identifyRevenueCatUser(
              user.$id
            );

          if (cancelled) {
            return;
          }

          await updateEntitlements(
            customerInfo
          );

          revenueCatLoggedInUserRef.current =
            user.$id;

          console.log(
            "✅ RevenueCat user synchronised:",
            user.$id
          );
        } catch (error) {
          console.warn(
            "⚠️ RevenueCat user sync failed:",
            error
          );
        }
      };

    void synchroniseUser();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    revenueCatConfigured,
    updateEntitlements,
    user?.$id,
  ]);

  // -------------------------------------------------------
  // AUTO-BACKUP REGISTRATION
  // -------------------------------------------------------

  useEffect(() => {
    if (
      authLoading ||
      !user?.$id
    ) {
      return;
    }

    void registerAutoBackupTask()
      .catch((error) => {
        console.warn(
          "⚠️ Auto-sync registration failed:",
          error
        );
      });
  }, [
    authLoading,
    user?.$id,
  ]);

  // -------------------------------------------------------
  // STAGE 1: REQUIRE COMPANY PROFILE
  // -------------------------------------------------------

  useEffect(() => {
    if (
      authLoading ||
      loadingCompanyProfile ||
      profileCheckedRef.current ||
      isProfileRoute ||
      isAuthRoute ||
      isPaywallRoute ||
      isTrialWelcomeRoute
    ) {
      return;
    }

    const hasRequiredProfile =
      Boolean(
        companyProfile?.companyName?.trim()
      ) &&
      Boolean(
        companyProfile?.currencyCode?.trim()
      ) &&
      Boolean(
        companyProfile?.currencySymbol?.trim()
      );

    if (!hasRequiredProfile) {
      profileCheckedRef.current =
        true;

      router.replace(
        "/screens/CompanyProfileScreen"
      );
    }
  }, [
    authLoading,
    companyProfile,
    isAuthRoute,
    isPaywallRoute,
    isProfileRoute,
    isTrialWelcomeRoute,
    loadingCompanyProfile,
    router,
  ]);

  // -------------------------------------------------------
  // RESET PROFILE CHECK AFTER PROFILE COMPLETION
  // -------------------------------------------------------

  useEffect(() => {
    const hasRequiredProfile =
      Boolean(
        companyProfile?.companyName?.trim()
      ) &&
      Boolean(
        companyProfile?.currencyCode?.trim()
      ) &&
      Boolean(
        companyProfile?.currencySymbol?.trim()
      );

    if (hasRequiredProfile) {
      profileCheckedRef.current =
        false;
    }
  }, [companyProfile]);

  // -------------------------------------------------------
  // STAGE 2: SHOW ONE-TIME TRIAL WELCOME PROMPT
  // -------------------------------------------------------

  useEffect(() => {
    if (
      authLoading ||
      loadingCompanyProfile ||
      trialPromptCheckedRef.current ||
      user?.$id ||
      isProfileRoute ||
      isAuthRoute ||
      isPaywallRoute ||
      isTrialWelcomeRoute
    ) {
      return;
    }

    const hasRequiredProfile =
      Boolean(
        companyProfile?.companyName?.trim()
      ) &&
      Boolean(
        companyProfile?.currencyCode?.trim()
      ) &&
      Boolean(
        companyProfile?.currencySymbol?.trim()
      );

    if (!hasRequiredProfile) {
      return;
    }

    trialPromptCheckedRef.current =
      true;

    void AsyncStorage.getItem(
      TRIAL_PROMPT_SEEN_KEY
    )
      .then((seen) => {
        if (seen !== "true") {
          router.replace(
            "/screens/TrialWelcomeScreen"
          );
        }
      })
      .catch((error) => {
        console.warn(
          "⚠️ Trial welcome state could not be read:",
          error
        );
      });
  }, [
    authLoading,
    companyProfile,
    isAuthRoute,
    isPaywallRoute,
    isProfileRoute,
    isTrialWelcomeRoute,
    loadingCompanyProfile,
    router,
    user?.$id,
  ]);

  // -------------------------------------------------------
  // RESET TRIAL-PROMPT CHECK WHEN USER LOGS OUT
  // -------------------------------------------------------

  useEffect(() => {
    if (!user?.$id) {
      trialPromptCheckedRef.current =
        false;
    }
  }, [user?.$id]);

  /*
   * Development-only reset removed intentionally.
   *
   * Do not automatically delete trialLoginPromptSeen during
   * each development launch, because that makes the welcome
   * screen appear repeatedly and does not match production.
   */

  // -------------------------------------------------------
  // STARTUP LOADER
  // -------------------------------------------------------

  useEffect(() => {
    if (authLoading) {
      return;
    }
  // useEffect(() => {
  //   if (authLoading) return;

  //   void refreshCompanyProfile();
  // }, [user?.$id, authLoading]);

    const elapsed =
      Date.now() -
      startupStartRef.current;

    const timer =
      setTimeout(
        () => {
          setShowLoader(false);
        },
        Math.max(
          0,
          1200 - elapsed
        )
      );

    return () => {
      clearTimeout(timer);
    };
  }, [authLoading]);

  // -------------------------------------------------------
  // STARTUP NOTIFICATIONS
  // -------------------------------------------------------

  useEffect(() => {
    if (
      authLoading ||
      notificationCheckedRef.current
    ) {
      return;
    }

    notificationCheckedRef.current =
      true;

    const timer =
      setTimeout(() => {
        void (async () => {
          try {
            await setupNotifications();
            await notifyLowStockNow();
            await notifySupplierReturnsNow();
          } catch (error) {
            console.warn(
              "⚠️ Startup notification check failed:",
              error
            );
          }
        })();
      }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [authLoading]);

  return (
    <>
      <Stack
        screenOptions={{
          header: (props) => (
            <Header {...props} />
          ),
          headerShown: true,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="screens/TrialWelcomeScreen"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      <LoadingScreen
        visible={showLoader}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
    >
      <RootSiblingParent>
        <MenuProvider>
          <ErrorBoundary>
            <AuthProvider>
              <ProUserProvider>
                <SubscriptionProvider>
                  <CompanyProfileProvider>
                    <StartupInitializer />
                  </CompanyProfileProvider>
                </SubscriptionProvider>
              </ProUserProvider>
            </AuthProvider>
          </ErrorBoundary>
        </MenuProvider>
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
}