// types/subscriptionTrial.ts

export type SubscriptionTrialStatus =
  | "active"
  | "expired"
  | "converted";

export interface SubscriptionTrial {
  id: string;
  cloudId?: string;

  userId: string;

  startedAt: string;
  endsAt: string;

  status: SubscriptionTrialStatus;

  createdAt: string;
  updatedAt: string;
  syncedAt?: string | null;
}

export interface TrialStatusResult {
  exists: boolean;
  isActive: boolean;
  isExpired: boolean;

  startedAt: string | null;
  endsAt: string | null;

  daysRemaining: number;
  status: SubscriptionTrialStatus | null;
}
