import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const Localhost = () => {
    const params = useLocalSearchParams();
    const { handleSuccessOrFailure, session } = useAuth();
    const router = useRouter();

    const completeSignIn = useCallback(async () => {
        if (!params.secret || !params.userId) {
            router.replace("/(auth)/LoginScreen");
            return;
        }

        try {
            console.log("Handling success or failure...");
            await handleSuccessOrFailure(
                params.secret as string,
                params.userId as string
            );
        } catch (error) {
            console.error("OAuth error:", error);
            router.replace("/(auth)/LoginScreen");
        }
    }, [params.secret, params.userId, handleSuccessOrFailure]);

    useEffect(() => {
        if (session) {
            router.replace("/(tabs)");
            return;
        } else {
            completeSignIn();
        }
    }, [session, completeSignIn]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.text}>Completing Sign in...</Text>
        </View>
    );
};

export default Localhost;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    text: {
        marginTop: 16,
        color: "white",
    },
});
