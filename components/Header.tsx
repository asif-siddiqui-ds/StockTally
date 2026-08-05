// // export default Header;
// import { Entypo } from "@expo/vector-icons";
// import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
// import { LinearGradient } from "expo-linear-gradient";
// import React from "react";
// import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// const screenTitles: Record<string, string> = {
//   index: "Home",
//   "(tabs)": "StockTally",
//   "+not-found": "Page Not Found",
//   saleList: "Sale List",
//   dashboard: "Dashboard",
//   stockList: "Stock List",
//   returnsList: "Return List",
//   "screens/sales/editSale": "Edit Sale",
//   "screens/sales/record": "Record Sale",
//   "screens/sales/viewSaleScreen": "View Sale",
//   "screens/stock/[id]": "Edit Stock",
//   "screens/stock/add": "Add Stock",
//   "screens/returns/[id]": "Edit Return",
//   "screens/returns/record": "Add Return",
//   "screens/CompanyProfileScreen": "Company Profile",
//   "screens/CloudBackupScreen": "Cloud Backup",
//   "screens/stockActivityLog": "Activity Log",
//   "screens/stockMoveScreen": "Stock Move",
//   "screens/BulkSaleScreen": "Bulk Sale",
//   "screens/ReorderListScreen": "Reorder List",
//   "screens/ReturnStockListScreen": "Return Stock List",
//   "screens/StockTakeScreen": "Stock Take",
//   "screens/StockTakeSessionScreen": "Stock Take Session",
//   LoginScreen: "Login",
//   Register: "Register",
// };

// const screenGradients: Record<string, string[]> = {
//   dashboard: ["#004e92", "#000428"],
//   saleList: ["#0f2027", "#203a43", "#2c5364"],
//   stockList: ["#283E51", "#485563"],
//   returnsList: ["#42275a", "#734b6d"],
//   "screens/sales/record": ["#1e3c72", "#2a5298"],
//   "screens/sales/editSale": ["#0f2027", "#2c5364"],
//   "screens/sales/ViewSaleScreen": ["#0d1b2a", "#1b263b", "#415a77"],
//   "screens/stock/[id]": ["#283048", "#859398"],
//   "screens/stock/add": ["#5C258D", "#4389A2"],
//   "screens/returns/[id]": ["#93291E", "#6f121dff"],
//   "screens/returns/record": ["#2C5364", "#203A43", "#0F2027"],
//   "screens/CompanyProfileScreen": ["#232526", "#414345"],
//   "screens/CloudBackupScreen": ["#141E30", "#243B55"],
//   "screens/stockActivityLog": ["#0f2027", "#203a43", "#2c5364"],
//   "screens/stockMoveScreen": ["#0d1b2a", "#1b263b", "#415a77"],
//   "screens/BulkSaleScreen": ["#0d1b2a", "#1b263b", "#415a77"],
//   "screens/ReorderListScreen": ["#0d1b2a", "#1b263b", "#415a77"],
//   "screens/ReturnStockListScreen": ["#0d1b2a", "#1b263b", "#415a77"],
//   "screens/StockTakeScreen": ["#0d1b2a", "#1b263b", "#415a77"],
//   "screens/StockTakeSessionScreen": ["#0d1b2a", "#1b263b", "#415a77"],
//   LoginScreen: ["#485563", "#29323c"],
//   Register: ["#373B44", "#4286f4"],
// };

// export default function Header(props: NativeStackHeaderProps) {
//   const { navigation, route, options } = props;

//   // ✅ Title from screen options or route
//   // const title = (options.title as string) ?? route.name;
//   const title = screenTitles[route.name] || "StockTally";

//   // ✅ Gradient colors based on route
//   const colors =
//     screenGradients[route.name] ?? ["#0d1b2a", "#1b263b", "#415a77"];

//   // ✅ Hide header for tabs root
//   if (route.name === "(tabs)") return null;

//   const handleBack = () => {
//     if (navigation.canGoBack()) navigation.goBack();
//     else navigation.navigate("(tabs)" as never);
//   };

//   return (
//     <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//             <Entypo name="chevron-left" size={28} color="#fff" />
//           </TouchableOpacity>

//           <Text style={styles.title} numberOfLines={1}>
//             {title}
//           </Text>

//           {/* spacer for alignment */}
//           <View style={{ width: 28 }} />
//         </View>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     backgroundColor: "transparent",
//   },
//   headerContent: {
//     height: 60,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//   },
//   backButton: {
//     paddingVertical: 4,
//     paddingRight: 10,
//   },
//   title: {
//     flex: 1,
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#fff",
//     textAlign: "center",
//   },
// });

import { Entypo } from "@expo/vector-icons";
import type { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps;

type GradientColors = readonly [string, string, ...string[]];

const DEFAULT_GRADIENT: GradientColors = [
  "#0d1b2a",
  "#1b263b",
  "#415a77",
];

const screenTitles: Record<string, string> = {
  index: "Home",
  "(tabs)": "StockTally",
  "+not-found": "Page Not Found",

  dashboard: "Dashboard",
  saleList: "Stock Out",
  stockList: "Stock List",
  returnsList: "Return List",
  stockOutHistory: "Stock Out History",

  "screens/sales/editSale": "Edit Sale",
  "screens/sales/record": "Record Sale",
  "screens/sales/viewSaleScreen": "View Sale",
  "screens/sales/ViewSaleScreen": "View Sale",

  "screens/stock/[id]": "Edit Stock",
  "screens/stock/add": "Add Stock",

  "screens/returns/[id]": "Edit Return",
  "screens/returns/record": "Add Return",

  "screens/CompanyProfileScreen": "Company Profile",
  "screens/CloudBackupScreen": "Cloud Backup",
  "screens/stockActivityLog": "Activity Log",
  "screens/stockMoveScreen": "Stock Move",
  "screens/BulkSaleScreen": "Bulk Sale",
  "screens/ReorderListScreen": "Reorder List",
  "screens/ReturnStockListScreen": "Return Stock List",
  "screens/StockTakeScreen": "Stock Take",
  "screens/StockTakeSessionScreen": "Stock Take Session",

  LoginScreen: "Login",
  Register: "Register",
};

const screenGradients: Record<string, GradientColors> = {
  dashboard: ["#004e92", "#000428"],
  saleList: ["#0f2027", "#203a43", "#2c5364"],
  stockList: ["#283E51", "#485563"],
  returnsList: ["#42275a", "#734b6d"],

  "screens/sales/record": ["#1e3c72", "#2a5298"],
  "screens/sales/editSale": ["#0f2027", "#2c5364"],
  "screens/sales/viewSaleScreen": [
    "#0d1b2a",
    "#1b263b",
    "#415a77",
  ],
  "screens/sales/ViewSaleScreen": [
    "#0d1b2a",
    "#1b263b",
    "#415a77",
  ],

  "screens/stock/[id]": ["#283048", "#859398"],
  "screens/stock/add": ["#5C258D", "#4389A2"],

  "screens/returns/[id]": ["#93291E", "#6f121d"],
  "screens/returns/record": ["#2C5364", "#203A43", "#0F2027"],

  "screens/CompanyProfileScreen": ["#232526", "#414345"],
  "screens/CloudBackupScreen": ["#141E30", "#243B55"],
  "screens/stockActivityLog": ["#0f2027", "#203a43", "#2c5364"],

  "screens/stockMoveScreen": DEFAULT_GRADIENT,
  "screens/BulkSaleScreen": DEFAULT_GRADIENT,
  "screens/ReorderListScreen": DEFAULT_GRADIENT,
  "screens/ReturnStockListScreen": DEFAULT_GRADIENT,
  "screens/StockTakeScreen": DEFAULT_GRADIENT,
  "screens/StockTakeSessionScreen": DEFAULT_GRADIENT,

  LoginScreen: ["#485563", "#29323c"],
  Register: ["#373B44", "#4286f4"],
};

export default function Header({
  navigation,
  route,
  options,
}: HeaderProps) {
  const routeName = route.name;

  const optionTitle =
    typeof options.title === "string" ? options.title : undefined;

  const title =
    optionTitle ??
    screenTitles[routeName] ??
    formatRouteName(routeName);

  const colors = screenGradients[routeName] ?? DEFAULT_GRADIENT;

  // Do not display a header for the root tabs navigator.
  if (routeName === "(tabs)") {
    return null;
  }

  const canGoBack = navigation.canGoBack();

  const handleBack = () => {
    if (canGoBack) {
      navigation.goBack();
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContent}>
          <View style={styles.sideContainer}>
            {canGoBack ? (
              <TouchableOpacity
                onPress={handleBack}
                activeOpacity={0.7}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Entypo
                  name="chevron-left"
                  size={28}
                  color="#ffffff"
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.sideContainer} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const formatRouteName = (routeName: string): string => {
  const finalSegment = routeName.split("/").pop() ?? routeName;

  return finalSegment
    .replace(/\[|\]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
  },

  headerContent: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  sideContainer: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
});