// app/screens/CloudBackupScreen.tsx

import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  registerAutoBackupTask,
  unregisterAutoBackupTask,
} from "@/lib/background/autoBackupTask";
import {
  BackupHistoryItem,
  getAutoSyncEnabled,
  getLastBackupState,
  setAutoSyncEnabled as persistAutoSyncEnabled,
  saveBackupFailure,
  saveBackupResult,
  StoredBackupSummary,
} from "@/lib/cloudBackupStorage";
import {
  FullSyncResult,
  syncAllData,
  SyncModuleName,
} from "@/lib/sync";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MODULE_LABELS: Record<SyncModuleName, string> = {
  companyProfile: "Company profile",
  stock: "Stock",
  stockMovements: "Stock movements",
  customers: "Customers",
  suppliers: "Suppliers",
  supplierStockIn: "Supplier purchases",
  invoices: "Invoices",
  quotes: "Quotes",
  sales: "Sales",
  returns: "Returns",
};

const TOTAL_SYNC_MODULES = Object.keys(MODULE_LABELS).length;

const CloudBackupScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [initialising, setInitialising] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [lastSyncSummary, setLastSyncSummary] =
    useState<StoredBackupSummary | null>(null);
  const [history, setHistory] = useState<BackupHistoryItem[]>([]);
  const [pendingCloudSync, setPendingCloudSync] = useState(false);

  const [loading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] =
    useState<SyncModuleName | null>(null);
  const [completedModules, setCompletedModules] = useState(0);
  const [totalModules, setTotalModules] =
    useState(TOTAL_SYNC_MODULES);
  const [latestResult, setLatestResult] =
    useState<FullSyncResult | null>(null);
  const {
    permissions,
    loading: subscriptionLoading,
    subscriptionState,
    trialDaysRemaining,
  } = useSubscription();

  const loadBackupState = async () => {
    try {
      const [enabled, state] = await Promise.all([
        getAutoSyncEnabled(),
        getLastBackupState(),
      ]);

      setAutoSyncEnabled(enabled);
      setLastSync(state.lastSync);
      setLastSyncSummary(state.summary);
      setHistory(state.history);
      setPendingCloudSync(state.pendingCloudSync);
    } catch (error) {
      console.warn("Could not load cloud backup settings:", error);
    }
  };

  useEffect(() => {
    const initialise = async () => {
      await loadBackupState();
      setInitialising(false);
    };

    initialise();
  }, []);

  useEffect(() => {
    if (
      initialising ||
      loading ||
      subscriptionLoading
    ) {
      return;
    }

    if (!user?.$id) {
      router.replace("/(auth)/LoginScreen");
      return;
    }

    if (!permissions.cloudBackup) {
      router.replace("/paywall");
    }
  }, [
    initialising,
    loading,
    permissions.cloudBackup,
    subscriptionLoading,
    user?.$id,
  ]);

  const progress = useMemo(() => {
    if (!totalModules) return 0;

    return Math.min(
      100,
      Math.round((completedModules / totalModules) * 100)
    );
  }, [completedModules, totalModules]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) return "Unknown";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDuration = (durationMs: number) => {
    if (durationMs < 1000) return `${durationMs} ms`;
    return `${(durationMs / 1000).toFixed(1)} sec`;
  };

  const handleToggle = async (value: boolean) => {
    if (
      loading ||
      subscriptionLoading
    ) {
      return;
    }

    if (!permissions.autoBackup) {
      router.push("/paywall");
      return;
    }

    const previousValue = autoSyncEnabled;
    setAutoSyncEnabled(value);

    try {
      if (value) {
        const registered = await registerAutoBackupTask();

        if (!registered) {
          throw new Error(
            "Background backup is not supported in this build or on this device."
          );
        }

        await persistAutoSyncEnabled(true);

        Toast.show("Automatic backup enabled", {
          duration: Toast.durations.SHORT,
        });
      } else {
        await persistAutoSyncEnabled(false);
        await unregisterAutoBackupTask();

        Toast.show("Automatic backup disabled", {
          duration: Toast.durations.SHORT,
        });
      }
    } catch (error) {
      console.error("Could not update automatic backup:", error);

      setAutoSyncEnabled(previousValue);
      await persistAutoSyncEnabled(previousValue);

      Alert.alert(
        "Automatic backup unavailable",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    }
  };

  const handleSyncNow = async () => {
    if (!user?.$id || user.$id === "guest") {
      Alert.alert(
        "Sign in required",
        "Please sign in before backing up your data."
      );
      return;
    }

    if (!permissions.cloudBackup) {
      router.push("/paywall");
      return;
    }

    const startedAt = new Date().toISOString();

    try {
      setLoading(true);
      setLatestResult(null);
      setCurrentModule("companyProfile");
      setCompletedModules(0);
      setTotalModules(TOTAL_SYNC_MODULES);

      const result = await syncAllData(
        user.$id,
        (completed, total, moduleName) => {
          setCompletedModules(completed);
          setTotalModules(total);
          setCurrentModule(moduleName);
        }
      );

      await saveBackupResult(result, "manual");
      setLatestResult(result);
      await loadBackupState();

      if (result.success) {
        Toast.show("Cloud backup completed", {
          duration: Toast.durations.SHORT,
        });
      } else {
        Toast.show(
          `${result.failed} backup section${
            result.failed === 1 ? "" : "s"
          } could not sync`,
          { duration: Toast.durations.LONG }
        );
      }
    } catch (error) {
      console.error("Manual cloud backup failed:", error);

      await saveBackupFailure("manual", startedAt, error);
      await loadBackupState();

      Toast.show("Cloud backup failed. Please try again.", {
        duration: Toast.durations.LONG,
      });
    } finally {
      setLoading(false);
      setCurrentModule(null);
    }
  };

  const failedModules =
    latestResult?.modules.filter((module) => !module.success) || [];

  if (
    initialising ||
    subscriptionLoading
  ) {
    return (
      <LinearGradient
        colors={["#07111f", "#0b1f36", "#123a5a"]}
        style={styles.loadingScreen}
      >
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingScreenText}>
          Preparing cloud backup…
        </Text>
      </LinearGradient>
    );
  }

  return (
    <ScreenWrapper>
      <LinearGradient
        colors={["#07111f", "#0b1f36", "#123a5a"]}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.container,
            {
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: Math.max(insets.bottom + 30, 44),
            },
          ]}
        >
          <LinearGradient
            colors={["#0f3152", "#0b223b", "#071525"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroOrbOne} />
            <View style={styles.heroOrbTwo} />

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="#e2e8f0"
              />
            </TouchableOpacity>

            <View style={styles.cloudIcon}>
              <Ionicons
                name="cloud-done-outline"
                size={28}
                color="#ffffff"
              />
            </View>

            <Text style={styles.eyebrow}>STOCKTALLY CLOUD</Text>
            <Text style={styles.title}>
              Your business data, protected
            </Text>
            <Text style={styles.subtitle}>
              Back up stock, customers, suppliers, purchases,
              invoices, quotes and activity records to your account.
            </Text>

            <View style={styles.securityRow}>
              <View style={styles.securityItem}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color="#7dd3fc"
                />
                <Text style={styles.securityText}>
                  Account protected
                </Text>
              </View>

              <View style={styles.securityDivider} />

              <View style={styles.securityItem}>
                <Ionicons
                  name="sync-outline"
                  size={16}
                  color="#7dd3fc"
                />
                <Text style={styles.securityText}>
                  Two-way sync
                </Text>
              </View>
            </View>
          </LinearGradient>

          {subscriptionState === "trial" ? (
            <View style={styles.trialBanner}>
              <View style={styles.trialBannerIcon}>
                <Ionicons
                  name="sparkles-outline"
                  size={19}
                  color="#6d28d9"
                />
              </View>

              <View style={styles.trialBannerCopy}>
                <Text style={styles.trialBannerTitle}>
                  Pro trial active
                </Text>
                <Text style={styles.trialBannerText}>
                  {trialDaysRemaining} day
                  {trialDaysRemaining === 1 ? "" : "s"} remaining
                  with access to cloud backup and automatic sync.
                </Text>
              </View>
            </View>
          ) : null}

          {pendingCloudSync && !loading ? (
            <View style={styles.retryCard}>
              <View style={styles.retryIcon}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={22}
                  color="#d97706"
                />
              </View>

              <View style={styles.retryCopy}>
                <Text style={styles.retryTitle}>
                  A previous backup needs attention
                </Text>
                <Text style={styles.retryText}>
                  Some data may not be protected yet. Run the backup
                  again when your internet connection is stable.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleSyncNow}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusIcon,
                lastSyncSummary?.success
                  ? styles.successStatusIcon
                  : lastSync
                  ? styles.warningStatusIcon
                  : styles.neutralStatusIcon,
              ]}
            >
              <Ionicons
                name={
                  lastSyncSummary?.success
                    ? "checkmark-circle-outline"
                    : lastSync
                    ? "alert-circle-outline"
                    : "cloud-outline"
                }
                size={23}
                color={
                  lastSyncSummary?.success
                    ? "#22c55e"
                    : lastSync
                    ? "#f59e0b"
                    : "#38bdf8"
                }
              />
            </View>

            <View style={styles.statusCopy}>
              <Text style={styles.statusEyebrow}>LAST BACKUP</Text>
              <Text style={styles.statusTitle}>
                {lastSync
                  ? formatDate(lastSync)
                  : "No cloud backup yet"}
              </Text>
              <Text style={styles.statusSubtitle}>
                {!lastSync
                  ? "Run your first backup to protect your business records."
                  : lastSyncSummary?.success
                  ? `${lastSyncSummary.completed} sections backed up in ${formatDuration(
                      lastSyncSummary.durationMs
                    )}.`
                  : `${lastSyncSummary?.failed || 0} section${
                      lastSyncSummary?.failed === 1 ? "" : "s"
                    } need attention.`}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={21}
                  color="#0284c7"
                />
              </View>

              <View style={styles.cardHeaderCopy}>
                <Text style={styles.cardTitle}>
                  Manual cloud backup
                </Text>
                <Text style={styles.cardSubtitle}>
                  Upload local changes and retrieve the latest cloud data.
                </Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.progressPanel}>
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={styles.progressLabel}>
                      Backing up your data
                    </Text>
                    <Text style={styles.progressModule}>
                      {currentModule
                        ? MODULE_LABELS[currentModule]
                        : "Finishing backup"}
                    </Text>
                  </View>

                  <Text style={styles.progressPercent}>
                    {progress}%
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress}%` },
                    ]}
                  />
                </View>

                <Text style={styles.progressMeta}>
                  {completedModules} of {totalModules} sections processed
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={handleSyncNow}
              disabled={
                loading ||
                subscriptionLoading ||
                !permissions.cloudBackup
              }
              activeOpacity={0.9}
              style={[
                styles.backupButtonOuter,
                loading && styles.disabledButton,
              ]}
            >
              <LinearGradient
                colors={["#0284c7", "#0369a1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.backupButton}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.backupButtonText}>
                      Backup in progress
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sync" size={20} color="#ffffff" />
                    <Text style={styles.backupButtonText}>
                      Back up now
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.backupHint}>
              Keep StockTally open until the manual backup finishes.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.autoSyncHeader}>
              <View style={styles.autoSyncIcon}>
                <Ionicons
                  name="time-outline"
                  size={21}
                  color="#7c3aed"
                />
              </View>

              <View style={styles.autoSyncCopy}>
                <View style={styles.proTitleRow}>
                  <Text style={styles.cardTitle}>
                    Automatic backup
                  </Text>
                  <View style={styles.proBadge}>
                    <Ionicons name="star" size={11} color="#6d28d9" />
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                </View>

                <Text style={styles.cardSubtitle}>
                  Protect changes in the background when supported by
                  your device.
                </Text>
              </View>

              <Switch
                value={autoSyncEnabled}
                onValueChange={handleToggle}
                disabled={
                  loading ||
                  subscriptionLoading ||
                  !permissions.autoBackup
                }
                trackColor={{
                  false: "#cbd5e1",
                  true: "#c4b5fd",
                }}
                thumbColor={
                  autoSyncEnabled ? "#7c3aed" : "#f8fafc"
                }
              />
            </View>

            <View style={styles.autoInfoBox}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color="#7c3aed"
              />
              <Text style={styles.autoInfoText}>
                iOS and Android decide the exact background run time.
                Automatic backup is therefore periodic, not guaranteed at
                an exact hour.
              </Text>
            </View>

            <View style={styles.autoStatusRow}>
              <View
                style={[
                  styles.statusDot,
                  autoSyncEnabled && styles.statusDotEnabled,
                ]}
              />
              <Text style={styles.autoStatusText}>
                {autoSyncEnabled
                  ? "Automatic backup is active"
                  : "Automatic backup is switched off"}
              </Text>
            </View>
          </View>

          <View style={styles.coverageCard}>
            <Text style={styles.coverageTitle}>
              Included in your backup
            </Text>

            <View style={styles.coverageGrid}>
              {[
                ["cube-outline", "Stock"],
                ["people-outline", "Customers"],
                ["business-outline", "Suppliers"],
                ["receipt-outline", "Invoices"],
                ["document-text-outline", "Quotes"],
                ["swap-horizontal-outline", "Activity"],
              ].map(([icon, label]) => (
                <View style={styles.coverageItem} key={label}>
                  <View style={styles.coverageIcon}>
                    <Ionicons
                      name={icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color="#0284c7"
                    />
                  </View>
                  <Text style={styles.coverageText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {latestResult ? (
            <View
              style={[
                styles.resultCard,
                latestResult.success
                  ? styles.resultSuccess
                  : styles.resultWarning,
              ]}
            >
              <View style={styles.resultHeader}>
                <Ionicons
                  name={
                    latestResult.success
                      ? "checkmark-circle"
                      : "warning"
                  }
                  size={23}
                  color={
                    latestResult.success ? "#16a34a" : "#d97706"
                  }
                />

                <View style={styles.resultHeaderCopy}>
                  <Text style={styles.resultTitle}>
                    {latestResult.success
                      ? "Backup completed"
                      : "Backup completed with issues"}
                  </Text>
                  <Text style={styles.resultSubtitle}>
                    {latestResult.completed} successful ·{" "}
                    {latestResult.failed} failed ·{" "}
                    {formatDuration(latestResult.durationMs)}
                  </Text>
                </View>
              </View>

              {failedModules.map((module) => (
                <View
                  style={styles.failedModule}
                  key={module.module}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={17}
                    color="#dc2626"
                  />
                  <View style={styles.failedModuleCopy}>
                    <Text style={styles.failedModuleName}>
                      {MODULE_LABELS[module.module]}
                    </Text>
                    <Text
                      style={styles.failedModuleError}
                      numberOfLines={2}
                    >
                      {module.error || "Could not sync this section."}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {history.length > 0 ? (
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Backup history</Text>
                <Text style={styles.historyCount}>
                  Latest {Math.min(history.length, 5)}
                </Text>
              </View>

              {history.slice(0, 5).map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.historyRow,
                    index > 0 && styles.historyRowBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.historyResultIcon,
                      item.success
                        ? styles.historySuccessIcon
                        : styles.historyFailureIcon,
                    ]}
                  >
                    <Ionicons
                      name={
                        item.success
                          ? "checkmark"
                          : "alert-outline"
                      }
                      size={15}
                      color={item.success ? "#16a34a" : "#d97706"}
                    />
                  </View>

                  <View style={styles.historyCopy}>
                    <Text style={styles.historyDate}>
                      {formatDate(item.finishedAt)}
                    </Text>
                    <Text style={styles.historyMeta}>
                      {item.source === "automatic"
                        ? "Automatic"
                        : "Manual"}{" "}
                      · {item.completed} completed
                      {item.failed > 0
                        ? ` · ${item.failed} failed`
                        : ""}
                    </Text>
                  </View>

                  <Text style={styles.historyDuration}>
                    {formatDuration(item.durationMs)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.privacyCard}>
            <View style={styles.privacyIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#22c55e"
              />
            </View>

            <View style={styles.privacyCopy}>
              <Text style={styles.privacyTitle}>
                Private to your account
              </Text>
              <Text style={styles.privacySubtitle}>
                Your cloud records are linked to your signed-in
                StockTally account.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Ionicons
              name="home-outline"
              size={19}
              color="#dbeafe"
            />
            <Text style={styles.homeButtonText}>
              Return to workspace
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingScreenText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
  },
  container: {
    paddingHorizontal: 16,
  },
  hero: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.16)",
  },
  heroOrbOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -55,
    top: -75,
    backgroundColor: "rgba(14,165,233,0.14)",
  },
  heroOrbTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    left: -45,
    bottom: -55,
    backgroundColor: "rgba(56,189,248,0.08)",
  },
  backButton: {
    position: "absolute",
    right: 15,
    top: 15,
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  cloudIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: "#0284c7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  eyebrow: {
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  title: {
    color: "#ffffff",
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginTop: 7,
    maxWidth: 320,
  },
  subtitle: {
    color: "#b6c7d9",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
    maxWidth: 340,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.09)",
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  securityText: {
    color: "#dbeafe",
    fontSize: 11.5,
    fontWeight: "600",
  },
  securityDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginHorizontal: 15,
  },
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    borderRadius: 18,
    padding: 13,
    marginTop: 14,
  },
  trialBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  trialBannerCopy: {
    flex: 1,
  },
  trialBannerTitle: {
    color: "#5b21b6",
    fontSize: 12.5,
    fontWeight: "800",
  },
  trialBannerText: {
    color: "#6d28d9",
    fontSize: 10.8,
    lineHeight: 16,
    marginTop: 3,
  },
  retryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 18,
    padding: 13,
    marginTop: 14,
  },
  retryIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  retryCopy: {
    flex: 1,
  },
  retryTitle: {
    color: "#78350f",
    fontSize: 12,
    fontWeight: "800",
  },
  retryText: {
    color: "#92400e",
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 3,
  },
  retryButton: {
    backgroundColor: "#d97706",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginLeft: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
  },
  statusIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  successStatusIcon: { backgroundColor: "#dcfce7" },
  warningStatusIcon: { backgroundColor: "#fef3c7" },
  neutralStatusIcon: { backgroundColor: "#e0f2fe" },
  statusCopy: { flex: 1 },
  statusEyebrow: {
    color: "#94a3b8",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  statusTitle: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  statusSubtitle: {
    color: "#64748b",
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 3,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 17,
    marginTop: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardHeaderCopy: { flex: 1 },
  cardTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: "#64748b",
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 3,
  },
  progressPanel: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 16,
    padding: 14,
    marginTop: 17,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  progressLabel: {
    color: "#0f172a",
    fontSize: 12.5,
    fontWeight: "700",
  },
  progressModule: {
    color: "#0284c7",
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 3,
  },
  progressPercent: {
    color: "#0369a1",
    fontSize: 17,
    fontWeight: "800",
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#dbeafe",
    overflow: "hidden",
    marginTop: 13,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#0284c7",
  },
  progressMeta: {
    color: "#64748b",
    fontSize: 10.5,
    marginTop: 8,
  },
  backupButtonOuter: {
    marginTop: 18,
    borderRadius: 15,
    overflow: "hidden",
  },
  backupButton: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 18,
  },
  disabledButton: { opacity: 0.7 },
  backupButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  backupHint: {
    color: "#94a3b8",
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 10,
  },
  autoSyncHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  autoSyncIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  autoSyncCopy: {
    flex: 1,
    paddingRight: 10,
  },
  proTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ede9fe",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  proBadgeText: {
    color: "#6d28d9",
    fontSize: 9,
    fontWeight: "900",
  },
  autoInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f5f3ff",
    borderRadius: 13,
    padding: 12,
    marginTop: 16,
  },
  autoInfoText: {
    flex: 1,
    color: "#6b5c87",
    fontSize: 10.8,
    lineHeight: 16,
  },
  autoStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
    marginRight: 8,
  },
  statusDotEnabled: { backgroundColor: "#22c55e" },
  autoStatusText: {
    color: "#64748b",
    fontSize: 11.5,
    fontWeight: "600",
  },
  coverageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 17,
    marginTop: 14,
  },
  coverageTitle: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 13,
  },
  coverageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  coverageItem: {
    width: "31%",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  coverageIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  coverageText: {
    color: "#475569",
    fontSize: 10.5,
    fontWeight: "700",
    textAlign: "center",
  },
  resultCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  resultWarning: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultHeaderCopy: {
    flex: 1,
    marginLeft: 10,
  },
  resultTitle: {
    color: "#0f172a",
    fontSize: 13.5,
    fontWeight: "800",
  },
  resultSubtitle: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  failedModule: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.22)",
  },
  failedModuleCopy: {
    flex: 1,
    marginLeft: 8,
  },
  failedModuleName: {
    color: "#7f1d1d",
    fontSize: 11.5,
    fontWeight: "700",
  },
  failedModuleError: {
    color: "#991b1b",
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 2,
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 17,
    marginTop: 14,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  historyTitle: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
  historyCount: {
    color: "#94a3b8",
    fontSize: 10.5,
    fontWeight: "700",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
  },
  historyRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
  },
  historyResultIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  historySuccessIcon: { backgroundColor: "#dcfce7" },
  historyFailureIcon: { backgroundColor: "#fef3c7" },
  historyCopy: { flex: 1 },
  historyDate: {
    color: "#1e293b",
    fontSize: 11.5,
    fontWeight: "700",
  },
  historyMeta: {
    color: "#64748b",
    fontSize: 10.2,
    marginTop: 2,
  },
  historyDuration: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#0d211a",
    borderWidth: 1,
    borderColor: "#1b4935",
    padding: 14,
    marginTop: 14,
  },
  privacyIcon: {
    width: 41,
    height: 41,
    borderRadius: 14,
    backgroundColor: "#123b29",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  privacyCopy: { flex: 1 },
  privacyTitle: {
    color: "#dcfce7",
    fontSize: 12.5,
    fontWeight: "700",
  },
  privacySubtitle: {
    color: "#86a995",
    fontSize: 10.8,
    lineHeight: 16,
    marginTop: 3,
  },
  homeButton: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#244765",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: "#0b223b",
  },
  homeButtonText: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default CloudBackupScreen;