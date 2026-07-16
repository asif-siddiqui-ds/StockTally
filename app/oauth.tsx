import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function OAuthScreen() {
  const { secret, userId } = useLocalSearchParams();
  const { handleSuccessOrFailure } = useAuth();

  useEffect(() => {
    if (secret && userId) {
      console.log("🔐 Received OAuth params:", secret, userId);
      handleSuccessOrFailure(String(secret), String(userId));
    } else {
      console.warn("⚠️ Missing OAuth parameters");
    }
  }, [secret, userId]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20 }}>Signing you in…</Text>
    </View>
  );
}
