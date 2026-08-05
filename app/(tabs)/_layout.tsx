// import { HapticTab } from "@/components/HapticTab";
// import Header from "@/components/Header";
// import {
//   Ionicons,
//   MaterialCommunityIcons,
// } from "@expo/vector-icons";
// import { Tabs } from "expo-router";
// import React from "react";
// import {
//   Platform,
//   StyleSheet,
//   View,
// } from "react-native";

// const ACTIVE_COLOR = "#1d4ed8";
// const INACTIVE_COLOR = "#64748b";

// type TabIconProps = {
//   focused: boolean;
//   color: string;
//   size: number;
//   children: React.ReactNode;
// };

// const TabIcon = ({
//   focused,
//   color,
//   size,
//   children,
// }: TabIconProps) => {
//   return (
//     <View
//       style={[
//         styles.iconContainer,
//         focused && styles.iconContainerActive,
//       ]}
//     >
//       {children}
//     </View>
//   );
// };

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         header: (props) => <Header {...props} />,
//         headerShown: true,

//         tabBarButton: HapticTab,
//         tabBarActiveTintColor: ACTIVE_COLOR,
//         tabBarInactiveTintColor: INACTIVE_COLOR,

//         tabBarShowLabel: true,
//         tabBarHideOnKeyboard: true,

//         tabBarLabelStyle: styles.tabBarLabel,
//         tabBarItemStyle: styles.tabBarItem,

//         tabBarStyle: [
//           styles.tabBar,
//           Platform.OS === "android"
//             ? styles.tabBarAndroid
//             : styles.tabBarIOS,
//         ],

//         tabBarBackground: () => (
//           <View style={styles.tabBarBackground} />
//         ),

//         sceneStyle: {
//           backgroundColor: "#eef3f8",
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           headerShown: false,
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <Ionicons
//                 name={
//                   focused
//                     ? "home"
//                     : "home-outline"
//                 }
//                 size={24}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="stock"
//         options={{
//           title: "Stock",
//           headerShown: false,
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <MaterialCommunityIcons
//                 name={
//                   focused
//                     ? "package-variant-closed"
//                     : "package-variant"
//                 }
//                 size={25}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="invoices"
//         options={{
//           title: "Invoices",
//           headerShown: false,
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <MaterialCommunityIcons
//                 name={
//                   focused
//                     ? "file-document"
//                     : "file-document-outline"
//                 }
//                 size={24}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="dashboard"
//         options={{
//           title: "Dashboard",
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <MaterialCommunityIcons
//                 name={
//                   focused
//                     ? "chart-box"
//                     : "chart-box-outline"
//                 }
//                 size={24}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="more"
//         options={{
//           title: "More",
//           headerShown: false,
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <Ionicons
//                 name={
//                   focused
//                     ? "grid"
//                     : "grid-outline"
//                 }
//                 size={23}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       {/*
//        * These screens still remain available through router.push(),
//        * but they no longer appear as bottom tabs.
//        */}
//       <Tabs.Screen
//         name="saleList"
//         options={{
//           href: null,
//           title: "Stock Out",
//         }}
//       />

//       <Tabs.Screen
//         name="stockList"
//         options={{
//           href: null,
//           title: "Stock List",
//         }}
//       />

//       <Tabs.Screen
//         name="returnsList"
//         options={{
//           href: null,
//           title: "Returns",
//         }}
//       />
//     </Tabs>
//   );
// }

// const styles = StyleSheet.create({
//   tabBar: {
//     position: "absolute",
//     left: 12,
//     right: 12,
//     bottom: 12,

//     height: 76,
//     paddingTop: 8,
//     paddingBottom:
//       Platform.OS === "ios" ? 10 : 8,

//     borderTopWidth: 0,
//     borderRadius: 24,

//     backgroundColor: "transparent",

//     shadowColor: "#0f172a",
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.16,
//     shadowRadius: 18,

//     elevation: 14,
//   },

//   tabBarIOS: {
//     position: "absolute",
//   },

//   tabBarAndroid: {
//     position: "absolute",
//   },

//   tabBarBackground: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255,255,255,0.97)",
//     borderRadius: 24,
//     borderWidth: 1,
//     borderColor: "rgba(148,163,184,0.22)",
//   },

//   tabBarItem: {
//     paddingVertical: 1,
//   },

//   tabBarLabel: {
//     fontSize: 10,
//     fontWeight: "800",
//     marginTop: 2,
//   },

//   iconContainer: {
//     width: 40,
//     height: 32,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   iconContainerActive: {
//     backgroundColor: "#dbeafe",
//   },
// });

// import { HapticTab } from "@/components/HapticTab";
// import Header from "@/components/Header";
// import {
//   Ionicons,
//   MaterialCommunityIcons,
// } from "@expo/vector-icons";
// import { Tabs } from "expo-router";
// import React from "react";
// import {
//   Platform,
//   StyleSheet,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const ACTIVE_COLOR = "#1d4ed8";
// const INACTIVE_COLOR = "#64748b";

// type TabIconProps = {
//   focused: boolean;
//   color: string;
//   size: number;
//   children: React.ReactNode;
// };

// const TabIcon = ({
//   focused,
//   color,
//   size,
//   children,
// }: TabIconProps) => {
//   return (
//     <View
//       style={[
//         styles.iconContainer,
//         focused && styles.iconContainerActive,
//       ]}
//     >
//       {children}
//     </View>
//   );
// };

// export default function TabLayout() {
//   const insets = useSafeAreaInsets();

//   return (
//     <Tabs
//       screenOptions={{
//         header: (props) => <Header {...props} />,
//         headerShown: true,

//         tabBarButton: HapticTab,
//         tabBarActiveTintColor: ACTIVE_COLOR,
//         tabBarInactiveTintColor: INACTIVE_COLOR,

//         tabBarShowLabel: true,
//         tabBarHideOnKeyboard: true,

//         tabBarLabelStyle: styles.tabBarLabel,
//         tabBarItemStyle: styles.tabBarItem,

//         tabBarStyle: [
//           styles.tabBar,
//           { bottom: Math.max(insets.bottom, 10) },
//           Platform.OS === "android"
//             ? styles.tabBarAndroid
//             : styles.tabBarIOS,
//         ],

//         tabBarBackground: () => (
//           <View style={styles.tabBarBackground} />
//         ),

//         sceneStyle: {
//           backgroundColor: "#eef3f8",
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           headerShown: false,
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <Ionicons
//                 name={
//                   focused
//                     ? "home"
//                     : "home-outline"
//                 }
//                 size={24}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="stock"
//         options={{
//           title: "Stock",
//           headerShown: false,
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <MaterialCommunityIcons
//                 name={
//                   focused
//                     ? "package-variant-closed"
//                     : "package-variant"
//                 }
//                 size={25}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="invoices"
//         options={{
//           title: "Invoices",
//           headerShown: false,
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <MaterialCommunityIcons
//                 name={
//                   focused
//                     ? "file-document"
//                     : "file-document-outline"
//                 }
//                 size={24}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="dashboard"
//         options={{
//           title: "Dashboard",
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <MaterialCommunityIcons
//                 name={
//                   focused
//                     ? "chart-box"
//                     : "chart-box-outline"
//                 }
//                 size={24}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="more"
//         options={{
//           title: "More",
//           headerShown: false,
//           tabBarIcon: ({
//             focused,
//             color,
//             size,
//           }) => (
//             <TabIcon
//               focused={focused}
//               color={color}
//               size={size}
//             >
//               <Ionicons
//                 name={
//                   focused
//                     ? "grid"
//                     : "grid-outline"
//                 }
//                 size={23}
//                 color={color}
//               />
//             </TabIcon>
//           ),
//         }}
//       />

//       {/*
//        * These screens still remain available through router.push(),
//        * but they no longer appear as bottom tabs.
//        */}
//       <Tabs.Screen
//         name="saleList"
//         options={{
//           href: null,
//           title: "Stock Out",
//         }}
//       />

//       <Tabs.Screen
//         name="stockList"
//         options={{
//           href: null,
//           title: "Stock List",
//         }}
//       />

//       <Tabs.Screen
//         name="returnsList"
//         options={{
//           href: null,
//           title: "Returns",
//         }}
//       />
//     </Tabs>
//   );
// }

// const styles = StyleSheet.create({
//   tabBar: {
//     position: "absolute",
//     left: 12,
//     right: 12,
//     height: 76,
//     paddingTop: 8,
//     paddingBottom:
//       Platform.OS === "ios" ? 10 : 8,

//     borderTopWidth: 0,
//     borderRadius: 24,

//     backgroundColor: "transparent",

//     shadowColor: "#0f172a",
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.16,
//     shadowRadius: 18,

//     elevation: 14,
//   },

//   tabBarIOS: {
//     position: "absolute",
//   },

//   tabBarAndroid: {
//     position: "absolute",
//   },

//   tabBarBackground: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255,255,255,0.97)",
//     borderRadius: 24,
//     borderWidth: 1,
//     borderColor: "rgba(148,163,184,0.22)",
//   },

//   tabBarItem: {
//     paddingVertical: 1,
//   },

//   tabBarLabel: {
//     fontSize: 10,
//     fontWeight: "800",
//     marginTop: 2,
//   },

//   iconContainer: {
//     width: 40,
//     height: 32,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   iconContainerActive: {
//     backgroundColor: "#dbeafe",
//   },
// });

import { HapticTab } from "@/components/HapticTab";
import Header from "@/components/Header";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import type { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE_COLOR = "#1d4ed8";
const INACTIVE_COLOR = "#64748b";

type TabIconProps = {
  focused: boolean;
  children: React.ReactNode;
};

const TabIcon = ({
  focused,
  children,
}: TabIconProps) => {
  return (
    <View
      style={[
        styles.iconContainer,
        focused && styles.iconContainerActive,
      ]}
    >
      {children}
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const renderHeader = (props: BottomTabHeaderProps) => (
    <Header {...props} />
  );

  return (
    <Tabs
      screenOptions={{
        header: renderHeader,
        headerShown: true,

        tabBarButton: HapticTab,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,

        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,

        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,

        tabBarStyle: [
          styles.tabBar,
          {
            bottom: Math.max(insets.bottom, 10),
          },
          Platform.OS === "android"
            ? styles.tabBarAndroid
            : styles.tabBarIOS,
        ],

        tabBarBackground: () => (
          <View style={styles.tabBarBackground} />
        ),

        sceneStyle: {
          backgroundColor: "#eef3f8",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="stock"
        options={{
          title: "Stock",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <MaterialCommunityIcons
                name={
                  focused
                    ? "package-variant-closed"
                    : "package-variant"
                }
                size={25}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <MaterialCommunityIcons
                name={
                  focused
                    ? "file-document"
                    : "file-document-outline"
                }
                size={24}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <MaterialCommunityIcons
                name={
                  focused
                    ? "chart-box"
                    : "chart-box-outline"
                }
                size={24}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={23}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      {/*
       * These screens remain accessible through router.push(),
       * but are hidden from the bottom tab bar.
       */}

      <Tabs.Screen
        name="saleList"
        options={{
          href: null,
          title: "Stock Out",
        }}
      />

      <Tabs.Screen
        name="stockList"
        options={{
          href: null,
          title: "Stock List",
        }}
      />

      <Tabs.Screen
        name="returnsList"
        options={{
          href: null,
          title: "Returns",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,

    height: 76,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,

    borderTopWidth: 0,
    borderRadius: 24,

    backgroundColor: "transparent",

    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,

    elevation: 14,
  },

  tabBarIOS: {
    position: "absolute",
  },

  tabBarAndroid: {
    position: "absolute",
  },

  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.22)",
  },

  tabBarItem: {
    paddingVertical: 1,
  },

  tabBarLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
  },

  iconContainer: {
    width: 40,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainerActive: {
    backgroundColor: "#dbeafe",
  },
});