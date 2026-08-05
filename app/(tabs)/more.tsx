import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MenuItemProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
};

const MoreScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const isGuest = !user || user.$id === "guest";

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    danger = false,
  }: MenuItemProps) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.menuItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconBox,
          danger && styles.iconBoxDanger,
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.menuText}>
        <Text
          style={[
            styles.menuTitle,
            danger && styles.dangerText,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert(
      "Log Out?",
      "You will need to sign in again to use cloud features.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace(
                "/(auth)/LoginScreen",
              );
            } catch (error: any) {
              Alert.alert(
                "Logout Failed",
                error.message ||
                  "Could not log out.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenWrapper
      scroll
      backgroundColor="#eef3f8"
    >
      <LinearGradient
        colors={[
          "#eef3f8",
          "#dce8f2",
          "#eef3f8",
        ]}
        style={styles.gradient}
      >
        <View style={[styles.container, { paddingTop: insets.top + 14 }]}>
          <Text style={styles.title}>More</Text>

          <Text style={styles.subtitle}>
            Account, customers, cloud and app
            settings
          </Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="🏢"
              title="Company Profile"
              subtitle="Business details, logo and currency"
              onPress={() =>
                router.push(
                  "/screens/CompanyProfileScreen",
                )
              }
            />

            <View style={styles.divider} />

            <MenuItem
              icon="👥"
              title="Customers"
              subtitle="Manage saved customer accounts"
              onPress={() =>
                router.push(
                  "/screens/customers/customerList",
                )
              }
            />

            <View style={styles.divider} />

            <MenuItem
              icon="🏭"
              title="Suppliers"
              subtitle="Purchases, returns and balances"
              onPress={() =>
                router.push(
                  "/screens/suppliers/supplierList",
                )
              }
            />

            <View style={styles.divider} />

            <MenuItem
              icon="☁️"
              title="Cloud Sync"
              subtitle="Back up and restore your business data"
              onPress={() =>
                router.push(
                  "/screens/CloudBackupScreen",
                )
              }
            />

            <View style={styles.divider} />

            <MenuItem
              icon="⭐"
              title="Subscription"
              subtitle="Review or upgrade your StockTally plan"
              onPress={() =>
                router.push("/paywall")
              }
            />
          </View>

          {!isGuest ? (
            <View style={styles.logoutCard}>
              <MenuItem
                icon="🚪"
                title="Log Out"
                subtitle="Sign out of your StockTally account"
                onPress={handleLogout}
                danger
              />
            </View>
          ) : null}

          <Text style={styles.versionText}>
            StockTally
          </Text>
        </View>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    minHeight: "100%",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 130,
  },

  title: {
    color: "#0f172a",
    fontSize: 29,
    fontWeight: "900",
  },

  subtitle: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 22,
  },

  menuCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dce4ec",
    overflow: "hidden",
  },

  logoutCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
    overflow: "hidden",
    marginTop: 16,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 82,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },

  iconBoxDanger: {
    backgroundColor: "#fee2e2",
  },

  icon: {
    fontSize: 21,
  },

  menuText: {
    flex: 1,
    marginLeft: 13,
  },

  menuTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "900",
  },

  menuSubtitle: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  arrow: {
    color: "#94a3b8",
    fontSize: 27,
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#edf2f7",
    marginLeft: 74,
  },

  dangerText: {
    color: "#b91c1c",
  },

  versionText: {
    color: "#94a3b8",
    fontSize: 11,
    textAlign: "center",
    marginTop: 24,
  },
});

export default MoreScreen;
