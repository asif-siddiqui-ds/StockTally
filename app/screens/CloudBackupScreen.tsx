import { useAuth } from "@/context/AuthContext";
import { useProUser } from "@/context/ProUserContext";
import { registerAutoBackupTask } from "@/lib/background/autoBackupTask";
import { syncAllData } from "@/lib/sync";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Toast from "react-native-root-toast";

const AUTO_SYNC_KEY = "autoSyncEnabled";
const LAST_SYNC_KEY = "lastSync";

const CloudBackupScreen = () => {
  const { user } = useAuth();
  const { isProUser } = useProUser();
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  // 🎨 Theme colors
  const bgColor = isDark ? "#121212" : "#F9FAFB";
  const cardColor = isDark ? "#1E1E1E" : "#FFFFFF";
  const textColor = isDark ? "#E5E7EB" : "#111827";
  const accentColor = "#007AFF";
  const mutedText = isDark ? "#9CA3AF" : "#6B7280";

  // 🚦 Navigation guard
  useEffect(() => {
    if (loading) return;
    if (!isProUser) {
      router.replace("/paywall");
      return;
    }
    if (!user || user === null) {
      router.replace("/(auth)/LoginScreen");
      return;
    }
  }, [isProUser, loading, user]);

  // Load saved settings
  useEffect(() => {
    (async () => {
      const savedToggle = await AsyncStorage.getItem(AUTO_SYNC_KEY);
      setAutoSyncEnabled(savedToggle === "true");
      const savedLast = await AsyncStorage.getItem(LAST_SYNC_KEY);
      setLastSync(savedLast);
    })();
  }, []);

  const GradientButton = ({
      title,
      colors,
      onPress,
      icon,
    }: {
      title: string;
      colors: string[];
      onPress: () => void;
      icon?: string;
    }) => (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );

  // Toggle auto sync
  const handleToggle = async (value: boolean) => {
    setAutoSyncEnabled(value);
    await AsyncStorage.setItem(AUTO_SYNC_KEY, JSON.stringify(value));

    if (value) {
      await registerAutoBackupTask();
      Toast.show("✅ Auto Sync Enabled", { duration: Toast.durations.SHORT });
    } else {
      Toast.show("🛑 Auto Sync Disabled", { duration: Toast.durations.SHORT });
    }
  };

  // Manual sync
  const handleSyncNow = async () => {
    if (!user?.$id) {
      Alert.alert("Error", "You must be logged in to sync data.");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Syncing data with the cloud...");
      await syncAllData(user.$id);

      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);
      setLastSync(now);

      Toast.show("✅ Sync complete!", { duration: Toast.durations.SHORT });
    } catch (err) {
      console.error(err);
      Toast.show("❌ Sync failed. Try again.", { duration: Toast.durations.LONG });
    } finally {
      setLoading(false);
    }
  };

  // Format date nicely
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
    <ScrollView
      contentContainerStyle={[styles.container]}
    >
    
      
      <Text style={[styles.title]}>☁️ Cloud Sync</Text>

      {/* 🕒 Last Sync Status Card */}
      <View style={[styles.statusCard, { backgroundColor: cardColor, borderColor: isDark ? "#333" : "#e5e7eb" }]}>
        <View style={styles.statusRow}>
          <Ionicons name="time-outline" size={20} color={accentColor} />
          <Text style={[styles.statusLabel, { color: textColor }]}>
            Last Sync:
          </Text>
          <Text style={[styles.statusValue, { color: mutedText }]}>
            {lastSync ? formatDate(lastSync) : "Not synced yet"}
          </Text>
        </View>
      </View>

      {/* Main Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardColor, borderColor: isDark ? "#333" : "#e5e7eb" },
        ]}
      >
        <Text style={[styles.subtitle, { color: textColor }]}>
          Keep your stock and sales safely stored in the cloud.
        </Text>

        <TouchableOpacity
          style={[styles.syncButton, { backgroundColor: accentColor }]}
          onPress={handleSyncNow}
          disabled={loading}
        >
          <Text style={styles.syncButtonText}>
            {loading ? "Syncing..." : "🔄 Sync Now"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toggle section */}
      {isProUser && (
        <View style={[styles.toggleCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.toggleLabel, { color: textColor }]}>
            Auto Sync (Pro)
          </Text>
          <Switch
            value={autoSyncEnabled}
            onValueChange={handleToggle}
            thumbColor={autoSyncEnabled ? accentColor : "#ccc"}
          />
        </View>
      )}

      <View>
        <GradientButton
          title="Home Page"
          colors={['#4CAF50', '#2E7D32']}
          onPress={() => router.push("/(tabs)")}
        />
      </View>

      {!isProUser && (
        <Text style={[styles.notice, { color: mutedText }]}>
          🔒 Auto Sync is available for Pro users only.
        </Text>
      )}

      {/* Loading overlay */}
      <Modal transparent animationType="fade" visible={loading}>
        <View style={styles.overlay}>
          <View style={[styles.loaderBox, { backgroundColor: cardColor }]}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={[styles.loaderText, { color: textColor }]}>
              {loadingMessage}
            </Text>
          </View>
        </View>
      </Modal>
      
    </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    padding: 20,
    minHeight: "100%",
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#64dd68ff",
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 6,
  },
  statusValue: {
    fontSize: 15,
    marginLeft: 6,
  },
  card: {
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  syncButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  notice: {
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderBox: {
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  loaderText: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 16,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CloudBackupScreen;
