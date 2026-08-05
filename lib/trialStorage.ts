// lib/trialStorage.ts

import {
  createCloudTrial,
  getCloudTrialForUser,
  updateCloudTrialStatus,
} from "@/lib/appwriteSubscriptionTrialService";
import type {
  SubscriptionTrial,
  SubscriptionTrialStatus,
  TrialStatusResult,
} from "@/types/subscriptionTrial";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TRIAL_DURATION_DAYS = 30;
const TRIAL_STORAGE_PREFIX = "stocktally_trial_";

function getTrialStorageKey(userId: string): string {
  return `${TRIAL_STORAGE_PREFIX}${userId}`;
}

function isValidUserId(
  userId?: string | null
): userId is string {
  return Boolean(userId && userId !== "guest");
}

function addDays(
  isoString: string,
  days: number
): string {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid trial date supplied: ${isoString}`
    );
  }

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function calculateDaysRemaining(
  endsAt: string
): number {
  const endTime = new Date(endsAt).getTime();

  if (Number.isNaN(endTime)) {
    return 0;
  }

  const remainingMs = endTime - Date.now();

  if (remainingMs <= 0) {
    return 0;
  }

  return Math.ceil(
    remainingMs / (24 * 60 * 60 * 1000)
  );
}

async function saveLocalTrial(
  trial: SubscriptionTrial
): Promise<void> {
  await AsyncStorage.setItem(
    getTrialStorageKey(trial.userId),
    JSON.stringify(trial)
  );
}

async function getLocalTrial(
  userId: string
): Promise<SubscriptionTrial | null> {
  const raw = await AsyncStorage.getItem(
    getTrialStorageKey(userId)
  );

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      raw
    ) as SubscriptionTrial;

    if (
      !parsed ||
      parsed.userId !== userId ||
      !parsed.startedAt ||
      !parsed.endsAt ||
      !parsed.status
    ) {
      throw new Error(
        "Invalid locally cached trial"
      );
    }

    return parsed;
  } catch {
    await AsyncStorage.removeItem(
      getTrialStorageKey(userId)
    );

    return null;
  }
}

function toStatusResult(
  trial: SubscriptionTrial | null
): TrialStatusResult {
  if (!trial) {
    return {
      exists: false,
      isActive: false,
      isExpired: false,
      startedAt: null,
      endsAt: null,
      daysRemaining: 0,
      status: null,
    };
  }

  const daysRemaining =
    calculateDaysRemaining(trial.endsAt);

  const isExpired =
    trial.status === "expired" ||
    (
      trial.status === "active" &&
      daysRemaining <= 0
    );

  const isActive =
    trial.status === "active" &&
    !isExpired;

  return {
    exists: true,
    isActive,
    isExpired,
    startedAt: trial.startedAt,
    endsAt: trial.endsAt,
    daysRemaining:
      isActive ? daysRemaining : 0,
    status:
      isExpired &&
      trial.status === "active"
        ? "expired"
        : trial.status,
  };
}

/**
 * Ensures that an offline-created local trial is restored to
 * Appwrite using its original startedAt and endsAt values.
 *
 * This prevents reconnecting from granting a fresh 30 days.
 */
async function reconcileLocalTrialWithCloud(
  localTrial: SubscriptionTrial
): Promise<SubscriptionTrial> {
  const existingCloudTrial =
    await getCloudTrialForUser(
      localTrial.userId
    );

  if (existingCloudTrial) {
    await saveLocalTrial(
      existingCloudTrial
    );

    return existingCloudTrial;
  }

  let cloudTrial = await createCloudTrial(
    localTrial.userId,
    localTrial.startedAt,
    localTrial.endsAt
  );

  /*
   * createCloudTrial creates an active record. Preserve a
   * locally cached terminal state when syncing it later.
   */
  if (
    localTrial.status !== "active" &&
    cloudTrial.cloudId
  ) {
    cloudTrial =
      await updateCloudTrialStatus(
        cloudTrial.cloudId,
        localTrial.userId,
        localTrial.status
      );
  }

  await saveLocalTrial(cloudTrial);

  return cloudTrial;
}

async function normaliseExpiredTrial(
  trial: SubscriptionTrial
): Promise<TrialStatusResult> {
  const result = toStatusResult(trial);

  if (
    result.isExpired &&
    trial.status === "active"
  ) {
    const locallyExpired: SubscriptionTrial = {
      ...trial,
      status: "expired",
      updatedAt: new Date().toISOString(),
    };

    await saveLocalTrial(locallyExpired);

    if (trial.cloudId) {
      try {
        const expiredTrial =
          await updateCloudTrialStatus(
            trial.cloudId,
            trial.userId,
            "expired"
          );

        await saveLocalTrial(expiredTrial);
        return toStatusResult(expiredTrial);
      } catch (error) {
        console.warn(
          "Could not mark cloud trial as expired:",
          error
        );
      }
    }

    return toStatusResult(locallyExpired);
  }

  return result;
}

/**
 * Starts a trial only for a real Appwrite account.
 *
 * Order of operations:
 * 1. Restore an existing Appwrite trial.
 * 2. Sync an offline-created local trial using its original dates.
 * 3. Create a new 30-day trial only when neither record exists.
 */
export async function startTrialForUser(
  userId?: string | null
): Promise<TrialStatusResult> {
  if (!isValidUserId(userId)) {
    return toStatusResult(null);
  }

  const existingLocal =
    await getLocalTrial(userId);

  try {
    const existingCloudTrial =
      await getCloudTrialForUser(userId);

    if (existingCloudTrial) {
      await saveLocalTrial(
        existingCloudTrial
      );

      return normaliseExpiredTrial(
        existingCloudTrial
      );
    }

    if (existingLocal) {
      const syncedTrial =
        await reconcileLocalTrialWithCloud(
          existingLocal
        );

      return normaliseExpiredTrial(
        syncedTrial
      );
    }

    const startedAt =
      new Date().toISOString();

    const endsAt = addDays(
      startedAt,
      TRIAL_DURATION_DAYS
    );

    const cloudTrial =
      await createCloudTrial(
        userId,
        startedAt,
        endsAt
      );

    await saveLocalTrial(cloudTrial);

    return normaliseExpiredTrial(
      cloudTrial
    );
  } catch (error) {
    console.warn(
      "Cloud trial start unavailable; using local fallback:",
      error
    );

    if (existingLocal) {
      return normaliseExpiredTrial(
        existingLocal
      );
    }

    const now = new Date().toISOString();

    const localTrial: SubscriptionTrial = {
      id: `local-${userId}`,
      userId,
      startedAt: now,
      endsAt: addDays(
        now,
        TRIAL_DURATION_DAYS
      ),
      status: "active",
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
    };

    await saveLocalTrial(localTrial);

    return toStatusResult(localTrial);
  }
}

/**
 * Reads Appwrite first and falls back to AsyncStorage.
 *
 * When a local-only trial is found and Appwrite is available,
 * it is uploaded with its original dates.
 */
export async function getTrialStatus(
  userId?: string | null
): Promise<TrialStatusResult> {
  if (!isValidUserId(userId)) {
    return toStatusResult(null);
  }

  const localTrial =
    await getLocalTrial(userId);

  try {
    const cloudTrial =
      await getCloudTrialForUser(userId);

    if (cloudTrial) {
      await saveLocalTrial(cloudTrial);

      return normaliseExpiredTrial(
        cloudTrial
      );
    }

    if (localTrial) {
      const syncedTrial =
        await reconcileLocalTrialWithCloud(
          localTrial
        );

      return normaliseExpiredTrial(
        syncedTrial
      );
    }

    /*
     * Reading status must never silently start a new trial.
     */
    return toStatusResult(null);
  } catch (error) {
    console.warn(
      "Could not read cloud trial; using local cache:",
      error
    );

    if (!localTrial) {
      return toStatusResult(null);
    }

    return normaliseExpiredTrial(
      localTrial
    );
  }
}

/**
 * Marks the account's trial as converted after RevenueCat
 * confirms a paid Pro entitlement.
 */
export async function markTrialConverted(
  userId?: string | null
): Promise<void> {
  if (!isValidUserId(userId)) {
    return;
  }

  const localTrial =
    await getLocalTrial(userId);

  try {
    let trial =
      await getCloudTrialForUser(userId);

    if (!trial && localTrial) {
      trial =
        await reconcileLocalTrialWithCloud(
          localTrial
        );
    }

    /*
     * A paid user may have subscribed before ever receiving
     * a trial. In that case there is no trial record to update.
     */
    if (!trial) {
      return;
    }

    if (trial.status === "converted") {
      await saveLocalTrial(trial);
      return;
    }

    if (!trial.cloudId) {
      return;
    }

    const converted =
      await updateCloudTrialStatus(
        trial.cloudId,
        userId,
        "converted"
      );

    await saveLocalTrial(converted);
  } catch (error) {
    console.warn(
      "Could not mark trial as converted:",
      error
    );

    /*
     * Preserve the converted state locally so it can be synced
     * on a later successful Appwrite request.
     */
    if (localTrial) {
      const convertedLocal: SubscriptionTrial = {
        ...localTrial,
        status:
          "converted" as SubscriptionTrialStatus,
        updatedAt: new Date().toISOString(),
      };

      await saveLocalTrial(
        convertedLocal
      );
    }
  }
}

/**
 * Development helper: clears only the local cache.
 * The Appwrite trial record remains unchanged.
 */
export async function clearLocalTrialCache(
  userId: string
): Promise<void> {
  await AsyncStorage.removeItem(
    getTrialStorageKey(userId)
  );
}