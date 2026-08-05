// lib/background/autoBackupTask.ts

import { getCachedUserId } from "@/context/AuthContext";
import {
  getAutoSyncEnabled,
  saveBackupFailure,
  saveBackupResult,
} from "@/lib/cloudBackupStorage";
import { getSubscriptionAccess } from "@/lib/subscriptionAccess";
import { syncAllData } from "@/lib/sync";
import { Platform } from "react-native";

const TASK_NAME = "daily-auto-sync";
const DAILY_SYNC_INTERVAL_SECONDS = 24 * 60 * 60;

let TaskManager: any = null;
let BackgroundFetch: any = null;

declare global {
  // Prevent duplicate definitions during Fast Refresh.
  // eslint-disable-next-line no-var
  var __stockTallyAutoBackupTaskDefined:
    | boolean
    | undefined;
}

function loadBackgroundLibraries(): void {
  const isExpoGo = Boolean(
    (globalThis as any).ExpoGo
  );

  if (
    Platform.OS === "web" ||
    isExpoGo
  ) {
    return;
  }

  try {
    TaskManager = require(
      "expo-task-manager"
    );

    BackgroundFetch = require(
      "expo-background-fetch"
    );
  } catch {
    console.log(
      "⚠️ Background tasks are unavailable in this build."
    );
  }
}

loadBackgroundLibraries();

if (
  TaskManager?.defineTask &&
  !globalThis.__stockTallyAutoBackupTaskDefined
) {
  globalThis.__stockTallyAutoBackupTaskDefined =
    true;

  TaskManager.defineTask(
    TASK_NAME,
    async () => {
      const startedAt =
        new Date().toISOString();

      try {
        const enabled =
          await getAutoSyncEnabled();

        if (!enabled) {
          console.log(
            "🟡 Automatic backup skipped: disabled by user."
          );

          return BackgroundFetch
            .BackgroundFetchResult.NoData;
        }

        const userId =
          await getCachedUserId();

        if (
          !userId ||
          userId === "guest"
        ) {
          console.log(
            "🟡 Automatic backup skipped: no signed-in user."
          );

          return BackgroundFetch
            .BackgroundFetchResult.NoData;
        }

        /**
         * Paid Pro and active trial users both have access.
         * This replaces the old paid-Pro-only check.
         */
        const access =
          await getSubscriptionAccess(
            userId
          );

        if (!access.canUseProFeatures) {
          console.log(
            `🟡 Automatic backup skipped: subscription state is ${access.state}.`
          );

          return BackgroundFetch
            .BackgroundFetchResult.NoData;
        }

        console.log(
          access.state === "pro"
            ? "☁️ Starting automatic Pro backup..."
            : `☁️ Starting automatic trial backup (${access.trialDaysRemaining} days remaining)...`
        );

        const result =
          await syncAllData(userId);

        await saveBackupResult(
          result,
          "automatic"
        );

        for (
          const moduleResult of
          result.modules
        ) {
          console.log(
            `${
              moduleResult.success
                ? "✅"
                : "❌"
            } ${moduleResult.module} ` +
              `(${moduleResult.durationMs}ms)`
          );
        }

        console.log(
          `☁️ Automatic backup finished in ${result.durationMs}ms. ` +
            `${result.completed} succeeded, ${result.failed} failed.`
        );

        return result.success
          ? BackgroundFetch
              .BackgroundFetchResult
              .NewData
          : BackgroundFetch
              .BackgroundFetchResult
              .Failed;
      } catch (error) {
        console.error(
          "❌ Automatic backup failed:",
          error
        );

        await saveBackupFailure(
          "automatic",
          startedAt,
          error
        );

        return BackgroundFetch
          .BackgroundFetchResult.Failed;
      }
    }
  );
}

export async function registerAutoBackupTask(): Promise<boolean> {
  if (
    !TaskManager ||
    !BackgroundFetch
  ) {
    console.log(
      "⚠️ Background fetch is unavailable in this build."
    );

    return false;
  }

  try {
    const isRegistered =
      await TaskManager
        .isTaskRegisteredAsync(
          TASK_NAME
        );

    if (!isRegistered) {
      await BackgroundFetch
        .registerTaskAsync(
          TASK_NAME,
          {
            minimumInterval:
              DAILY_SYNC_INTERVAL_SECONDS,
            stopOnTerminate: false,
            startOnBoot: true,
          }
        );
    }

    const status =
      await BackgroundFetch
        .getStatusAsync();

    console.log(
      "🔄 Automatic backup background status:",
      status
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Could not register automatic backup:",
      error
    );

    return false;
  }
}

export async function unregisterAutoBackupTask(): Promise<boolean> {
  if (
    !TaskManager ||
    !BackgroundFetch
  ) {
    return false;
  }

  try {
    const isRegistered =
      await TaskManager
        .isTaskRegisteredAsync(
          TASK_NAME
        );

    if (isRegistered) {
      await BackgroundFetch
        .unregisterTaskAsync(
          TASK_NAME
        );
    }

    console.log(
      "🛑 Automatic backup task unregistered."
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Could not unregister automatic backup:",
      error
    );

    return false;
  }
}

export async function isAutoBackupTaskRegistered(): Promise<boolean> {
  if (!TaskManager) {
    return false;
  }

  try {
    return await TaskManager
      .isTaskRegisteredAsync(
        TASK_NAME
      );
  } catch {
    return false;
  }
}
