// lib/notifications.ts

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
    getReturnStockItems,
    getStockItems,
} from "@/lib/storage";

/* ─────────────────────────────
   Notification Handler
───────────────────────────── */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* ─────────────────────────────
   Setup Permissions
───────────────────────────── */

export async function setupNotifications() {
  const current = await Notifications.getPermissionsAsync();

  let finalStatus = current.status;

  if (current.status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();

    finalStatus = requested.status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("stock-alerts", {
      name: "Stock Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return true;
}

/* ─────────────────────────────
   LOW STOCK ALERT
───────────────────────────── */

export async function notifyLowStockNow() {
  try {
    const allowed = await setupNotifications();

    if (!allowed) return;

    const stock = await getStockItems();

    if (!stock || stock.length === 0) return;

    const lowItems = stock.filter((item: any) => {
      const qty = Number(item.quantity || 0);
      const alertLevel = Number(item.lowStockAlert || 0);

      return alertLevel > 0 && qty <= alertLevel;
    });

    if (lowItems.length === 0) return;

    const itemNames = lowItems
      .slice(0, 3)
      .map((i: any) => i.name)
      .join(", ");

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Low Stock Alert",
        body:
          lowItems.length === 1
            ? `${itemNames} is low in stock`
            : `${lowItems.length} items are low in stock (${itemNames})`,
        sound: "default",
        data: {
          screen: "ReorderListScreen",
        },
      },
      trigger: null,
    });
  } catch (err) {
    console.log("notifyLowStockNow error:", err);
  }
}

/* ─────────────────────────────
   SUPPLIER RETURN ALERT
───────────────────────────── */

export async function notifySupplierReturnsNow() {
  try {
    const allowed = await setupNotifications();

    if (!allowed) return;

    const items = await getReturnStockItems();

    if (!items || items.length === 0) return;

    const pending = items.filter(
      (i: any) => i.status === "pending_return"
    );

    if (pending.length === 0) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📦 Supplier Returns Pending",
        body:
          pending.length === 1
            ? `${pending[0].name} waiting to return to supplier`
            : `${pending.length} items waiting to return to supplier`,
        sound: "default",
        data: {
          screen: "ReturnStockListScreen",
        },
      },
      trigger: null,
    });
  } catch (err) {
    console.log("notifySupplierReturnsNow error:", err);
  }
}

/* ─────────────────────────────
   DAILY STOCK COUNT REMINDER
───────────────────────────── */

export async function scheduleDailyStockCountReminder(
  hour = 20,
  minute = 0
) {
  try {
    const allowed = await setupNotifications();

    if (!allowed) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📋 Daily Stock Count",
        body: "Time to complete today's stock count.",
        sound: "default",
        data: {
          screen: "StockTakeSessionScreen",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (err) {
    console.log("scheduleDailyStockCountReminder error:", err);
  }
}

/* ─────────────────────────────
   WEEKLY STOCK COUNT REMINDER
───────────────────────────── */

export async function scheduleWeeklyStockCountReminder(
  weekday = 1, // Monday
  hour = 20,
  minute = 0
) {
  try {
    const allowed = await setupNotifications();

    if (!allowed) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📦 Weekly Stock Count",
        body: "Weekly stock count is due.",
        sound: "default",
        data: {
          screen: "StockTakeSessionScreen",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });
  } catch (err) {
    console.log("scheduleWeeklyStockCountReminder error:", err);
  }
}

/* ─────────────────────────────
   CANCEL ALL REMINDERS
───────────────────────────── */

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.log("cancelAllNotifications error:", err);
  }
}