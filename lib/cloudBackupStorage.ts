// lib/cloudBackupStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FullSyncResult, SyncModuleName } from "@/lib/sync";

export const AUTO_SYNC_KEY = "autoSyncEnabled";
export const LAST_SYNC_KEY = "lastSync";
export const LAST_SYNC_RESULT_KEY = "lastSyncResult";
export const BACKUP_HISTORY_KEY = "cloudBackupHistory";
export const PENDING_CLOUD_SYNC_KEY = "pendingCloudSync";

export const MAX_BACKUP_HISTORY_ITEMS = 20;

export type BackupSource = "manual" | "automatic";

export interface BackupHistoryItem {
  id: string;
  source: BackupSource;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  success: boolean;
  completed: number;
  failed: number;
  failedModules: SyncModuleName[];
}

export interface StoredBackupSummary {
  success: boolean;
  completed: number;
  failed: number;
  durationMs: number;
  failedModules: SyncModuleName[];
  source: BackupSource;
}

function createHistoryId(source: BackupSource, finishedAt: string): string {
  return `${source}-${finishedAt}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getAutoSyncEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(AUTO_SYNC_KEY);
  return value === "true";
}

export async function setAutoSyncEnabled(value: boolean): Promise<void> {
  await AsyncStorage.setItem(AUTO_SYNC_KEY, String(value));
}

export async function getBackupHistory(): Promise<BackupHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(BACKUP_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Could not read cloud backup history:", error);
    return [];
  }
}

export async function saveBackupResult(
  result: FullSyncResult,
  source: BackupSource
): Promise<BackupHistoryItem> {
  const failedModules = result.modules
    .filter((module) => !module.success)
    .map((module) => module.module);

  const summary: StoredBackupSummary = {
    success: result.success,
    completed: result.completed,
    failed: result.failed,
    durationMs: result.durationMs,
    failedModules,
    source,
  };

  const historyItem: BackupHistoryItem = {
    id: createHistoryId(source, result.finishedAt),
    source,
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    success: result.success,
    completed: result.completed,
    failed: result.failed,
    failedModules,
  };

  const existingHistory = await getBackupHistory();
  const nextHistory = [historyItem, ...existingHistory].slice(
    0,
    MAX_BACKUP_HISTORY_ITEMS
  );

  await AsyncStorage.multiSet([
    [LAST_SYNC_KEY, result.finishedAt],
    [LAST_SYNC_RESULT_KEY, JSON.stringify(summary)],
    [BACKUP_HISTORY_KEY, JSON.stringify(nextHistory)],
    [PENDING_CLOUD_SYNC_KEY, result.success ? "false" : "true"],
  ]);

  return historyItem;
}

export async function saveBackupFailure(
  source: BackupSource,
  startedAt: string,
  error?: unknown
): Promise<BackupHistoryItem> {
  const finishedAt = new Date().toISOString();
  const durationMs = Math.max(
    0,
    new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  );

  const historyItem: BackupHistoryItem = {
    id: createHistoryId(source, finishedAt),
    source,
    startedAt,
    finishedAt,
    durationMs,
    success: false,
    completed: 0,
    failed: 1,
    failedModules: [],
  };

  const existingHistory = await getBackupHistory();
  const nextHistory = [historyItem, ...existingHistory].slice(
    0,
    MAX_BACKUP_HISTORY_ITEMS
  );

  const errorText =
    error instanceof Error ? error.message : String(error || "Unknown error");

  await AsyncStorage.multiSet([
    [LAST_SYNC_KEY, finishedAt],
    [
      LAST_SYNC_RESULT_KEY,
      JSON.stringify({
        success: false,
        completed: 0,
        failed: 1,
        durationMs,
        failedModules: [],
        source,
        error: errorText,
      }),
    ],
    [BACKUP_HISTORY_KEY, JSON.stringify(nextHistory)],
    [PENDING_CLOUD_SYNC_KEY, "true"],
  ]);

  return historyItem;
}

export async function getLastBackupState(): Promise<{
  lastSync: string | null;
  summary: StoredBackupSummary | null;
  history: BackupHistoryItem[];
  pendingCloudSync: boolean;
}> {
  const [lastSync, rawSummary, history, pending] = await Promise.all([
    AsyncStorage.getItem(LAST_SYNC_KEY),
    AsyncStorage.getItem(LAST_SYNC_RESULT_KEY),
    getBackupHistory(),
    AsyncStorage.getItem(PENDING_CLOUD_SYNC_KEY),
  ]);

  let summary: StoredBackupSummary | null = null;

  if (rawSummary) {
    try {
      summary = JSON.parse(rawSummary);
    } catch (error) {
      console.warn("Could not parse last cloud backup result:", error);
    }
  }

  return {
    lastSync,
    summary,
    history,
    pendingCloudSync: pending === "true",
  };
}

export async function clearPendingCloudSync(): Promise<void> {
  await AsyncStorage.setItem(PENDING_CLOUD_SYNC_KEY, "false");
}
