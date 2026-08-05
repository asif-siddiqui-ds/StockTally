// lib/subscriptionAccess.ts

import { getProUserStatus } from "@/context/ProUserContext";
import { getTrialStatus } from "@/lib/trialStorage";

export type BackgroundSubscriptionState =
  | "guest"
  | "free"
  | "trial"
  | "pro";

export interface BackgroundSubscriptionAccess {
  state: BackgroundSubscriptionState;
  hasPaidPro: boolean;
  hasActiveTrial: boolean;
  canUseProFeatures: boolean;
  trialDaysRemaining: number;
  trialEndsAt: string | null;
}

/**
 * Read subscription access outside React components.
 *
 * This is intended for background tasks, services and other code
 * that cannot call useSubscription().
 */
export async function getSubscriptionAccess(
  userId?: string | null
): Promise<BackgroundSubscriptionAccess> {
  if (!userId || userId === "guest") {
    return {
      state: "guest",
      hasPaidPro: false,
      hasActiveTrial: false,
      canUseProFeatures: false,
      trialDaysRemaining: 0,
      trialEndsAt: null,
    };
  }

  const [hasPaidPro, trial] = await Promise.all([
    getProUserStatus(userId),
    getTrialStatus(userId),
  ]);

  if (hasPaidPro) {
    return {
      state: "pro",
      hasPaidPro: true,
      hasActiveTrial: trial.isActive,
      canUseProFeatures: true,
      trialDaysRemaining: trial.daysRemaining,
      trialEndsAt: trial.endsAt,
    };
  }

  if (trial.isActive) {
    return {
      state: "trial",
      hasPaidPro: false,
      hasActiveTrial: true,
      canUseProFeatures: true,
      trialDaysRemaining: trial.daysRemaining,
      trialEndsAt: trial.endsAt,
    };
  }

  return {
    state: "free",
    hasPaidPro: false,
    hasActiveTrial: false,
    canUseProFeatures: false,
    trialDaysRemaining: 0,
    trialEndsAt: trial.endsAt,
  };
}
