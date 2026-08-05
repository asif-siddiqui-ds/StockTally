// context/SubscriptionContext.tsx

import {
  getTrialStatus,
  markTrialConverted,
  startTrialForUser,
} from "@/lib/trialStorage";
import type { TrialStatusResult } from "@/types/subscriptionTrial";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useProUser } from "./ProUserContext";

export type SubscriptionState = "guest" | "free" | "trial" | "pro";

interface SubscriptionPermissions {
  cloudBackup: boolean;
  autoBackup: boolean;
  invoices: boolean;
  quotes: boolean;
  customers: boolean;
  suppliers: boolean;
  analytics: boolean;
  unlimitedStock: boolean;
}

interface SubscriptionContextType {
  subscriptionState: SubscriptionState;
  loading: boolean;
  isGuest: boolean;
  isFreeUser: boolean;
  isTrialUser: boolean;
  isProUser: boolean;
  canUseProFeatures: boolean;
  permissions: SubscriptionPermissions;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialDaysRemaining: number;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  refreshSubscription: () => Promise<void>;
}

const EMPTY_TRIAL: TrialStatusResult = {
  exists: false,
  isActive: false,
  isExpired: false,
  startedAt: null,
  endsAt: null,
  daysRemaining: 0,
  status: null,
};

const SubscriptionContext =
  createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, authLoading } = useAuth();
  const {
    isProUser: hasPaidPro,
    loading: proLoading,
    refreshFromRevenueCat,
  } = useProUser();

  const [trial, setTrial] = useState<TrialStatusResult>(EMPTY_TRIAL);
  const [trialLoading, setTrialLoading] = useState(true);

  const isRealAuthenticatedUser =
    Boolean(user?.$id) && user?.$id !== "guest";

  const loadExistingTrial = useCallback(async () => {
    if (!isRealAuthenticatedUser || !user?.$id) {
      setTrial(EMPTY_TRIAL);
      return;
    }

    const status = await getTrialStatus(user.$id);
    setTrial(status);
  }, [isRealAuthenticatedUser, user?.$id]);

  useEffect(() => {
    if (authLoading || proLoading) return;

    let cancelled = false;

    const initialiseSubscription = async () => {
      try {
        setTrialLoading(true);

        if (!isRealAuthenticatedUser || !user?.$id) {
          if (!cancelled) setTrial(EMPTY_TRIAL);
          return;
        }

        if (hasPaidPro) {
          await markTrialConverted(user.$id).catch((error) => {
            console.warn("⚠️ Could not mark trial as converted:", error);
          });

          if (!cancelled) setTrial(EMPTY_TRIAL);
          return;
        }

        const status = await startTrialForUser(user.$id);

        if (!cancelled) {
          setTrial(status);
        }
      } catch (error) {
        console.warn("⚠️ Subscription initialisation failed:", error);

        if (!cancelled) {
          try {
            const fallbackStatus = user?.$id
              ? await getTrialStatus(user.$id)
              : EMPTY_TRIAL;

            setTrial(fallbackStatus);
          } catch {
            setTrial(EMPTY_TRIAL);
          }
        }
      } finally {
        if (!cancelled) {
          setTrialLoading(false);
        }
      }
    };

    void initialiseSubscription();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    hasPaidPro,
    isRealAuthenticatedUser,
    proLoading,
    user?.$id,
  ]);

  const refreshSubscription = useCallback(async () => {
    try {
      setTrialLoading(true);
      await refreshFromRevenueCat();

      if (!isRealAuthenticatedUser || !user?.$id) {
        setTrial(EMPTY_TRIAL);
        return;
      }

      await loadExistingTrial();
    } catch (error) {
      console.warn("⚠️ Subscription refresh failed:", error);
    } finally {
      setTrialLoading(false);
    }
  }, [
    isRealAuthenticatedUser,
    loadExistingTrial,
    refreshFromRevenueCat,
    user?.$id,
  ]);

  const subscriptionState = useMemo<SubscriptionState>(() => {
    if (!isRealAuthenticatedUser) return "guest";
    if (hasPaidPro) return "pro";
    if (trial.isActive) return "trial";
    return "free";
  }, [hasPaidPro, isRealAuthenticatedUser, trial.isActive]);

  const canUseProFeatures =
    subscriptionState === "trial" || subscriptionState === "pro";

  const permissions = useMemo<SubscriptionPermissions>(
    () => ({
      cloudBackup: canUseProFeatures,
      autoBackup: canUseProFeatures,
      invoices: canUseProFeatures,
      quotes: canUseProFeatures,
      customers: canUseProFeatures,
      suppliers: canUseProFeatures,
      analytics: canUseProFeatures,
      unlimitedStock: canUseProFeatures,
    }),
    [canUseProFeatures]
  );

  const value = useMemo<SubscriptionContextType>(
    () => ({
      subscriptionState,
      loading: authLoading || proLoading || trialLoading,
      isGuest: subscriptionState === "guest",
      isFreeUser: subscriptionState === "free",
      isTrialUser: subscriptionState === "trial",
      isProUser: subscriptionState === "pro",
      canUseProFeatures,
      permissions,
      trialStartedAt: trial.startedAt,
      trialEndsAt: trial.endsAt,
      trialDaysRemaining: trial.daysRemaining,
      isTrialActive: trial.isActive,
      isTrialExpired: Boolean(trial.exists && trial.isExpired),
      refreshSubscription,
    }),
    [
      authLoading,
      canUseProFeatures,
      permissions,
      proLoading,
      refreshSubscription,
      subscriptionState,
      trial.daysRemaining,
      trial.endsAt,
      trial.exists,
      trial.isActive,
      trial.isExpired,
      trial.startedAt,
      trialLoading,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      "useSubscription must be used within SubscriptionProvider"
    );
  }

  return context;
};