import { getCachedUserId } from "@/context/AuthContext";
import { getProUserStatus } from "@/context/ProUserContext";
import { syncAllData } from "@/lib/sync"; // ✅ use unified sync
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const TASK_NAME = "daily-auto-sync";

let TaskManager: any = null;
let BackgroundFetch: any = null;

// Dynamically load background libs (avoids Expo Go crash)
if (Platform.OS !== "web" && !global.ExpoGo) {
  try {
    TaskManager = require("expo-task-manager");
    BackgroundFetch = require("expo-background-fetch");
  } catch (e) {
    console.log("⚠️ Background tasks not supported in Expo Go");
  }
}

// ✅ Define the background sync task
if (TaskManager?.defineTask) {
  TaskManager.defineTask(TASK_NAME, async () => {
    const enabled = await AsyncStorage.getItem("autoSyncEnabled");
    if (enabled !== "true") {
      console.log("🟡 Skipping auto-sync: user turned it off");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    try {
      console.log("☁️ Running daily auto-sync task...");

      const isPro = await getProUserStatus();
      if (!isPro) {
        console.log("🟡 Skipping: user is not Pro");
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      const userId = await getCachedUserId();
      if (!userId) {
        console.log("🟡 Skipping: no logged-in user");
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // ✅ Run unified two-way sync
      await syncAllData(userId);

      const now = new Date().toISOString();
      await AsyncStorage.setItem("lastSync", now);
      console.log("✅ Auto-sync complete:", now);

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error("❌ Auto-sync failed:", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

/**
 * ✅ Call once (e.g., on app start) to register periodic background sync.
 */
export async function registerAutoBackupTask() {
  if (!TaskManager || !BackgroundFetch) {
    console.log("⚠️ Background fetch not available (likely Expo Go)");
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 24 * 60 * 60, // once per day
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  const status = await BackgroundFetch.getStatusAsync();
  console.log("🔄 Auto-sync background fetch status:", status);
}
