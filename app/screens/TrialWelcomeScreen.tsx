// app/screens/TrialWelcomeScreen.tsx

import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TRIAL_PROMPT_SEEN_KEY =
  "trialLoginPromptSeen";

const TrialWelcomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { loginAsGuest } = useAuth();
  const [continuing, setContinuing] =
    useState(false);

  const startTrial = async () => {
    // await AsyncStorage.setItem(
    //   TRIAL_PROMPT_SEEN_KEY,
    //   "true"
    // );

    router.push("/(auth)/LoginScreen");
  };

  const continueFree = async () => {
    try {
      setContinuing(true);

      /*
      * First complete guest mode.
      */
      await loginAsGuest();

      /*
      * Only mark the prompt as seen after
      * guest mode completes successfully.
      */
      await AsyncStorage.setItem(
        TRIAL_PROMPT_SEEN_KEY,
        "true"
      );

      router.replace("/(tabs)");
    } catch (error) {
      console.error(
        "❌ Continue as guest failed:",
        error
      );

      Alert.alert(
        "Could not continue",
        "Please try again."
      );
    } finally {
      setContinuing(false);
    }
  };

  // const continueFree = async () => {
  //   try {
  //     setContinuing(true);

  //     await AsyncStorage.setItem(
  //       TRIAL_PROMPT_SEEN_KEY,
  //       "true"
  //     );

  //     await loginAsGuest();
  //     router.replace("/(tabs)");
  //   } catch (error) {
  //     Alert.alert(
  //       "Could not continue",
  //       "Please try again."
  //     );
  //   } finally {
  //     setContinuing(false);
  //   }
  // };

  return (
    <ScreenWrapper>
      <LinearGradient
        colors={["#07111f", "#0b223b", "#123a5a"]}
        style={[
          styles.screen,
          {
            paddingTop: Math.max(
              insets.top,
              18
            ),
            paddingBottom: Math.max(
              insets.bottom,
              20
            ),
          },
        ]}
      >
        <View style={styles.heroIcon}>
          <Ionicons
            name="sparkles"
            size={34}
            color="#ffffff"
          />
        </View>

        <Text style={styles.eyebrow}>
          STOCKTALLY PRO
        </Text>

        <Text style={styles.title}>
          Start your 30-day free trial
        </Text>

        <Text style={styles.subtitle}>
          Create or sign in to your account to
          unlock every Pro feature for 30 days.
          No trial is used while you remain a
          guest.
        </Text>

        <View style={styles.featureCard}>
          {[
            "Cloud backup and automatic sync",
            "Invoices, quotes and customers",
            "Suppliers and purchase history",
            "Advanced dashboard and reports",
            "Unlimited stock records",
          ].map((feature) => (
            <View
              key={feature}
              style={styles.featureRow}
            >
              <View style={styles.checkIcon}>
                <Ionicons
                  name="checkmark"
                  size={15}
                  color="#16a34a"
                />
              </View>
              <Text style={styles.featureText}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={startTrial}
          style={styles.primaryOuter}
        >
          <LinearGradient
            colors={["#0284c7", "#0369a1"]}
            style={styles.primaryButton}
          >
            <Ionicons
              name="person-add-outline"
              size={20}
              color="#ffffff"
            />
            <Text style={styles.primaryText}>
              Sign in and start trial
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={continueFree}
          disabled={continuing}
          style={styles.secondaryButton}
        >
          {continuing ? (
            <ActivityIndicator
              color="#dbeafe"
            />
          ) : (
            <>
              <Ionicons
                name="arrow-forward-outline"
                size={19}
                color="#dbeafe"
              />
              <Text style={styles.secondaryText}>
                Continue with free guest access
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Your trial begins only after a successful
          account login. You can upgrade at any time.
        </Text>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: "center",
  },
  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#0284c7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  eyebrow: {
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  title: {
    color: "#ffffff",
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "900",
    marginTop: 8,
  },
  subtitle: {
    color: "#b6c7d9",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
  },
  featureCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 17,
    marginTop: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 7,
  },
  checkIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  featureText: {
    flex: 1,
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryOuter: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
  },
  primaryButton: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#31526e",
    backgroundColor: "#0b223b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  secondaryText: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "700",
  },
  note: {
    color: "#7f9ab3",
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 16,
  },
});

export default TrialWelcomeScreen;
