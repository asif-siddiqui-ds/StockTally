// context/AuthContext.tsx

import { account, ID } from "@/appwrite";
import { logoutRevenueCatUser } from "@/lib/revenuecat";
import { linkGuestCompanyProfileToUser } from "@/lib/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const USER_ID_KEY = "currentUserId";
const GUEST_KEY = "isGuest";

interface AuthContextType {
  user: any | null;
  authLoading: boolean;

  setUser: (user: any | null) => void;

  signup: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>;

  loginWithCredentials: (
    email: string,
    password: string
  ) => Promise<void>;

  loginAsGuest: () => Promise<void>;

  logout: () => Promise<void>;

  loginWithUser: (
    userId: string,
    secret: string
  ) => Promise<void>;

  refreshSession: () => Promise<void>;

  handleSuccessOrFailure: (
    secret: string,
    userId: string
  ) => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] =
    useState<any | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  /**
   * Store the authenticated Appwrite user locally.
   *
   * SubscriptionContext reacts to `user.$id` and handles:
   * - starting a new trial
   * - restoring an existing trial
   * - checking trial expiry
   *
   * Trial logic must not be duplicated in AuthContext.
   */
  const persistAuthenticatedUser = async (
    currentUser: any
  ): Promise<void> => {
    await AsyncStorage.multiSet([
      [GUEST_KEY, "false"],
      [USER_ID_KEY, currentUser.$id],
    ]);
  };

  /**
   * Move the app into a clean guest state.
   *
   * This removes the cached real user ID and ensures the
   * Appwrite session is anonymous rather than authenticated.
   */
  const establishGuestSession =
    async (): Promise<void> => {
      await account
        .deleteSession("current")
        .catch(() => {
          // No active session is acceptable here.
        });

      await AsyncStorage.setItem(
        GUEST_KEY,
        "true"
      );

      await AsyncStorage.removeItem(
        USER_ID_KEY
      );

      await account
        .createAnonymousSession()
        .catch((error) => {
          console.warn(
            "⚠️ Anonymous Appwrite session could not be created:",
            error
          );
        });

      setUser(null);
    };

  /**
   * Link any company profile created as a guest to the
   * authenticated Appwrite account.
   *
   * A profile-linking failure should not cancel a successful
   * login. StartupInitializer also performs this check later.
   */
  const linkGuestProfileSafely = async (
    userId: string
  ): Promise<void> => {
    try {
      await linkGuestCompanyProfileToUser(
        userId
      );
    } catch (error) {
      console.warn(
        "⚠️ Guest company profile could not be linked:",
        error
      );
    }
  };

  // -------------------------------------------------------
  // INITIAL SESSION CHECK
  // -------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const initialiseAuth =
      async (): Promise<void> => {
        try {
          setAuthLoading(true);

          const guestFlag =
            await AsyncStorage.getItem(
              GUEST_KEY
            );

          /*
           * Guest mode is an explicit app state.
           *
           * If storage says guest, remove any authenticated
           * Appwrite session before restoring anonymity.
           */
          if (guestFlag === "true") {
            await account
              .deleteSession("current")
              .catch(() => {
                // There may already be no active session.
              });

            await AsyncStorage.removeItem(
              USER_ID_KEY
            );

            await account
              .createAnonymousSession()
              .catch((error) => {
                console.warn(
                  "⚠️ Guest session restoration failed:",
                  error
                );
              });

            if (!cancelled) {
              setUser(null);
            }

            return;
          }

          /*
           * No guest flag means we try to restore the
           * existing authenticated Appwrite session.
           */
          const currentUser =
            await account.get();

          await persistAuthenticatedUser(
            currentUser
          );

          if (!cancelled) {
            setUser(currentUser);
          }
        } catch (error) {
          console.warn(
            "⚠️ No authenticated Appwrite session found:",
            error
          );

          /*
           * Remove any stale cached user ID and continue as
           * a guest.
           */
          await AsyncStorage.setItem(
            GUEST_KEY,
            "true"
          );

          await AsyncStorage.removeItem(
            USER_ID_KEY
          );

          await account
            .deleteSession("current")
            .catch(() => {
              // Session may already be absent.
            });

          await account
            .createAnonymousSession()
            .catch((anonymousError) => {
              console.warn(
                "⚠️ Anonymous session creation failed:",
                anonymousError
              );
            });

          if (!cancelled) {
            setUser(null);
          }
        } finally {
          if (!cancelled) {
            setAuthLoading(false);
          }
        }
      };

    void initialiseAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const signup = async (
  email: string,
  password: string,
  name: string
): Promise<void> => {
  try {
    /*
     * Create Appwrite account
     */
    await account.create(
      ID.unique(),
      email.trim(),
      password,
      name.trim()
    );

    /*
     * Automatically sign in
     */
    await account.createEmailPasswordSession(
      email.trim(),
      password
    );

    const currentUser = await account.get();

    await persistAuthenticatedUser(
      currentUser
    );

    await linkGuestProfileSafely(
      currentUser.$id
    );

    /*
     * SubscriptionContext will now
     * start or restore the trial.
     */
    setUser(currentUser);

    console.log(
      "✅ Account created successfully"
    );
  } catch (error) {
    console.error(
      "❌ Signup failed:",
      error
    );

    throw error;
  }
};

  // -------------------------------------------------------
  // EMAIL AND PASSWORD LOGIN
  // -------------------------------------------------------

  const loginWithCredentials = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      /*
       * Remove the guest/anonymous session before creating
       * the authenticated session.
       */
      await account
        .deleteSession("current")
        .catch(() => {
          // No session is acceptable.
        });

      await account.createEmailPasswordSession(
        email.trim(),
        password
      );

      const currentUser =
        await account.get();

      await persistAuthenticatedUser(
        currentUser
      );

      await linkGuestProfileSafely(
        currentUser.$id
      );

      /*
       * Set the React user after local authentication state
       * has been stored.
       *
       * SubscriptionContext will now start or restore the
       * Appwrite-backed trial for this user.
       */
      setUser(currentUser);
    } catch (error) {
      console.error(
        "❌ Email login failed:",
        error
      );

      throw error;
    }
  };

  // -------------------------------------------------------
  // OAUTH / APPWRITE TOKEN SESSION COMPLETION
  // -------------------------------------------------------

  const loginWithUser = async (
    userId: string,
    secret: string
  ): Promise<void> => {
    try {
      await account
        .deleteSession("current")
        .catch(() => {
          // No active session is acceptable.
        });

      await account.createSession(
        userId,
        secret
      );

      const currentUser =
        await account.get();

      await persistAuthenticatedUser(
        currentUser
      );

      await linkGuestProfileSafely(
        currentUser.$id
      );

      /*
       * SubscriptionContext reacts to this change and
       * starts/restores the trial.
       */
      setUser(currentUser);
    } catch (error) {
      console.error(
        "❌ Appwrite token login failed:",
        error
      );

      throw error;
    }
  };

  // -------------------------------------------------------
  // GUEST ACCESS
  // -------------------------------------------------------

  const loginAsGuest =
    async (): Promise<void> => {
      try {
        /*
         * Do not call RevenueCat logOut here.
         *
         * A visitor choosing guest access is generally
         * already using a RevenueCat anonymous identity.
         */
        await establishGuestSession();

        console.log(
          "👤 Continuing with guest access"
        );
      } catch (error) {
        console.error(
          "❌ Guest access error:",
          error
        );

        throw error;
      }
    };

  // -------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------

  const logout =
    async (): Promise<void> => {
      try {
        /*
         * Detach the authenticated RevenueCat identity.
         *
         * RevenueCat will return to an anonymous customer.
         */
        await logoutRevenueCatUser().catch(
          (error) => {
            console.warn(
              "⚠️ RevenueCat logout failed:",
              error
            );
          }
        );

        await AsyncStorage.removeItem(
          USER_ID_KEY
        );

        /*
         * Attempt to remove all Appwrite sessions.
         *
         * If listing sessions fails, remove the current
         * session as a fallback.
         */
        try {
          const sessions =
            await account.listSessions();

          for (const session of sessions.sessions) {
            await account
              .deleteSession(session.$id)
              .catch(() => {
                // Continue deleting remaining sessions.
              });
          }
        } catch {
          await account
            .deleteSession("current")
            .catch(() => {
              // Session may already be deleted.
            });
        }

        /*
         * Create a fresh anonymous Appwrite session so guest
         * features can continue working after logout.
         */
        await account
          .createAnonymousSession()
          .catch((error) => {
            console.warn(
              "⚠️ Anonymous session after logout could not be created:",
              error
            );
          });

        await AsyncStorage.setItem(
          GUEST_KEY,
          "true"
        );

        setUser(null);

        console.log(
          "🚪 User logged out successfully"
        );
      } catch (error) {
        console.error(
          "❌ Logout error:",
          error
        );

        /*
         * Even if remote logout fails, prevent the current
         * UI from continuing as the authenticated user.
         */
        await AsyncStorage.setItem(
          GUEST_KEY,
          "true"
        );

        await AsyncStorage.removeItem(
          USER_ID_KEY
        );

        setUser(null);
      }
    };

  // -------------------------------------------------------
  // REFRESH SESSION
  // -------------------------------------------------------

  const refreshSession =
    async (): Promise<void> => {
      try {
        const currentUser =
          await account.get();

        await persistAuthenticatedUser(
          currentUser
        );

        setUser(currentUser);

        console.log(
          "🔄 Session refreshed"
        );
      } catch (error) {
        console.warn(
          "⚠️ No authenticated session to refresh:",
          error
        );

        /*
         * Clear stale authenticated-user information.
         */
        await AsyncStorage.setItem(
          GUEST_KEY,
          "true"
        );

        await AsyncStorage.removeItem(
          USER_ID_KEY
        );

        setUser(null);
      }
    };

  // -------------------------------------------------------
  // FINAL OAUTH COMPLETION
  // -------------------------------------------------------

  const handleSuccessOrFailure = async (
    secret: string,
    userId: string
  ): Promise<void> => {
    try {
      await loginWithUser(
        userId,
        secret
      );

      /*
       * Navigation is intentionally not performed here.
       *
       * app/_layout.tsx controls OAuth success and failure
       * navigation, preventing duplicate router.replace()
       * calls.
       */
    } catch (error) {
      console.error(
        "❌ OAuth completion error:",
        error
      );

      /*
       * Re-throw so app/_layout.tsx can handle navigation
       * to the login screen.
       */
      throw error;
    }
  };

  return (
    <AuthContext.Provider
        value={{
            user,
            authLoading,
            setUser,

            signup,

            loginWithCredentials,
            loginAsGuest,
            logout,
            loginWithUser,
            refreshSession,
            handleSuccessOrFailure,
        }}
      >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

/**
 * Returns the cached authenticated Appwrite user ID.
 *
 * Guest sessions return null because USER_ID_KEY is removed
 * whenever the app enters guest mode.
 */
export const getCachedUserId =
  async (): Promise<string | null> => {
    return AsyncStorage.getItem(
      USER_ID_KEY
    );
  };