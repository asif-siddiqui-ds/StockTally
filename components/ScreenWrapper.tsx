// // export default ScreenWrapper;
// import React from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// interface ScreenWrapperProps {
//   children: React.ReactNode;
//   scroll?: boolean;
//   backgroundColor?: string;
// }

// const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
//   children,
//   scroll = false,
//   backgroundColor = "#f9f9f9",
// }) => {
//   return (
//     <SafeAreaView
//       style={[styles.safeArea, { backgroundColor }]}
//       edges={["left", "right"]}
//     >
//         <KeyboardAvoidingView
//           style={styles.flex}
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//         >
//           {scroll ? (
//             <ScrollView
//               style={styles.flex}
//               contentContainerStyle={styles.scrollContent}
//               showsVerticalScrollIndicator={false}
//               keyboardShouldPersistTaps="handled"
//             >
//               {children}
//             </ScrollView>
//           ) : (
//             <View style={styles.flex}>{children}</View>
//           )}
//         </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   flex: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingBottom: 40,
//   },
// });

// export default ScreenWrapper;

import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  backgroundColor?: string;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scroll = false,
  backgroundColor = "#f9f9f9",
}) => {
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {scroll ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.flex}>{children}</View>
          )}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
});

export default ScreenWrapper;