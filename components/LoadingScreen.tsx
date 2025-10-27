// components/LoadingScreen.tsx
import { AnimatePresence, MotiImage, MotiText, MotiView } from "moti";
import React from "react";
import { StyleSheet } from "react-native";

interface LoadingScreenProps {
  visible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.container}
        >
          {/* Logo */}
          <MotiImage
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 1000 }}
            source={require("@/assets/icon.png")}
            style={styles.logo}
          />

          {/* Title */}
          <MotiText
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, duration: 800 }}
            style={styles.title}
          >
            StockTally
          </MotiText>

          {/* Subtitle */}
          <MotiText
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 600, duration: 800 }}
            style={styles.subtitle}
          >
            Smart Stock & Sales Tracker
          </MotiText>

          {/* Pulsing dot */}
          <MotiView
            from={{ opacity: 0.3, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1.05 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
            style={styles.dot}
          />
        </MotiView>
      )}
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#B0B0B0",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 30,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#007AFF",
  },
});

export default LoadingScreen;
