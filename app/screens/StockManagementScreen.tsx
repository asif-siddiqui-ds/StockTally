// import ScreenWrapper from "@/components/ScreenWrapper";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React from "react";
// import {
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// type ManagementActionProps = {
//   title: string;
//   subtitle: string;
//   icon: string;
//   colors: [string, string];
//   onPress: () => void;
// };

// const StockManagementScreen: React.FC = () => {
//   const insets = useSafeAreaInsets();
//   const ManagementAction = ({
//     title,
//     subtitle,
//     icon,
//     colors,
//     onPress,
//   }: ManagementActionProps) => (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPress={onPress}
//       style={styles.actionTouchable}
//     >
//       <LinearGradient
//         colors={colors}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.actionCard}
//       >
//         <View style={styles.iconBox}>
//           <Text style={styles.icon}>{icon}</Text>
//         </View>

//         <View style={styles.textArea}>
//           <Text style={styles.actionTitle}>{title}</Text>
//           <Text style={styles.actionSubtitle}>{subtitle}</Text>
//         </View>

//         <Text style={styles.arrow}>›</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );

//   return (
//     <ScreenWrapper scroll backgroundColor="#eef3f8">
//       <LinearGradient
//         colors={["#eef3f8", "#dce8f2", "#eef3f8"]}
//         style={styles.pageGradient}
//       >
//         <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
//           <View style={styles.headerRow}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => router.back()}
//             >
//               <Text style={styles.backIcon}>‹</Text>
//             </TouchableOpacity>

//             <View style={styles.headerTextArea}>
//               <Text style={styles.title}>Stock Management</Text>
//               <Text style={styles.subtitle}>
//                 Control stock, movements, returns and suppliers
//               </Text>
//             </View>
//           </View>

//           <LinearGradient
//             colors={["#14532d", "#166534", "#15803d"]}
//             style={styles.heroCard}
//           >
//             <View style={styles.heroIconCircle}>
//               <Text style={styles.heroIcon}>📦</Text>
//             </View>

//             <View style={styles.heroTextArea}>
//               <Text style={styles.heroTitle}>
//                 Your inventory workspace
//               </Text>

//               <Text style={styles.heroText}>
//                 Add stock, record outgoing stock, manage suppliers and review business activity.
//               </Text>
//             </View>
//           </LinearGradient>

//           <Text style={styles.sectionTitle}>Stock operations</Text>

//           <View style={styles.actionsContainer}>
//             <ManagementAction
//               title="Add Stock"
//               subtitle="Create a new item or add another delivery"
//               icon="➕"
//               colors={["#15803d", "#166534"]}
//               onPress={() => router.push("/screens/stock/add")}
//             />

//             <ManagementAction
//               title="Move Stock"
//               subtitle="Record sales, consumption and other stock out"
//               icon="🔄"
//               colors={["#0369a1", "#075985"]}
//               onPress={() =>
//                 router.push("/screens/StockMoveScreen")
//               }
//             />

//             <ManagementAction
//               title="Returns"
//               subtitle="Manage customer and supplier return records"
//               icon="↩️"
//               colors={["#c2410c", "#9a3412"]}
//               onPress={() => router.push("/(tabs)/returnsList")}
//             />

//             <ManagementAction
//               title="Activity Log"
//               subtitle="Review every stock movement and adjustment"
//               icon="📒"
//               colors={["#0f766e", "#115e59"]}
//               onPress={() =>
//                 router.push("/screens/stockActivityLog")
//               }
//             />

//             <ManagementAction
//               title="Suppliers"
//               subtitle="Manage supplier accounts and outstanding balances"
//               icon="🏭"
//               colors={["#6d28d9", "#5b21b6"]}
//               onPress={() =>
//                 router.push("/screens/suppliers/supplierList")
//               }
//             />

//             <ManagementAction
//               title="Dashboard"
//               subtitle="View stock, sales and business performance"
//               icon="📊"
//               colors={["#1d4ed8", "#1e40af"]}
//               onPress={() => router.push("/(tabs)/dashboard")}
//             />
//           </View>

//           <View style={styles.secondaryLinks}>
//             <TouchableOpacity
//               style={styles.secondaryButton}
//               onPress={() => router.push("/(tabs)/stockList")}
//             >
//               <Text style={styles.secondaryIcon}>📋</Text>

//               <View style={{ flex: 1 }}>
//                 <Text style={styles.secondaryTitle}>
//                   View Stock List
//                 </Text>

//                 <Text style={styles.secondarySubtitle}>
//                   Browse, search and edit all products
//                 </Text>
//               </View>

//               <Text style={styles.secondaryArrow}>›</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.secondaryButton}
//               onPress={() =>
//                 router.push("/screens/ReorderListScreen")
//               }
//             >
//               <Text style={styles.secondaryIcon}>⚠️</Text>

//               <View style={{ flex: 1 }}>
//                 <Text style={styles.secondaryTitle}>
//                   Low Stock
//                 </Text>

//                 <Text style={styles.secondarySubtitle}>
//                   Review products that need reordering
//                 </Text>
//               </View>

//               <Text style={styles.secondaryArrow}>›</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </LinearGradient>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   pageGradient: {
//     flex: 1,
//     minHeight: "100%",
//   },

//   container: {
//     paddingHorizontal: 18,
//     paddingTop: 0,
//     paddingBottom: 130,
//   },

//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 18,
//   },

//   backButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 14,
//     backgroundColor: "#ffffff",
//     borderWidth: 1,
//     borderColor: "#dbe3eb",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },

//   backIcon: {
//     color: "#0f172a",
//     fontSize: 32,
//     fontWeight: "400",
//     marginTop: -3,
//   },

//   headerTextArea: {
//     flex: 1,
//   },

//   title: {
//     color: "#0f172a",
//     fontSize: 25,
//     fontWeight: "900",
//   },

//   subtitle: {
//     color: "#64748b",
//     fontSize: 12,
//     marginTop: 3,
//   },

//   heroCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 22,
//     padding: 18,
//     shadowColor: "#14532d",
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 7 },
//     shadowRadius: 14,
//     elevation: 6,
//   },

//   heroIconCircle: {
//     width: 62,
//     height: 62,
//     borderRadius: 19,
//     backgroundColor: "rgba(255,255,255,0.16)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   heroIcon: {
//     fontSize: 30,
//   },

//   heroTextArea: {
//     flex: 1,
//     marginLeft: 15,
//   },

//   heroTitle: {
//     color: "#ffffff",
//     fontSize: 18,
//     fontWeight: "900",
//   },

//   heroText: {
//     color: "#dcfce7",
//     fontSize: 12,
//     lineHeight: 18,
//     marginTop: 4,
//   },

//   sectionTitle: {
//     color: "#0f172a",
//     fontSize: 19,
//     fontWeight: "900",
//     marginTop: 24,
//     marginBottom: 12,
//   },

//   actionsContainer: {
//     gap: 12,
//   },

//   actionTouchable: {
//     width: "100%",
//   },

//   actionCard: {
//     minHeight: 92,
//     borderRadius: 18,
//     paddingHorizontal: 15,
//     paddingVertical: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#000000",
//     shadowOpacity: 0.13,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 9,
//     elevation: 4,
//   },

//   iconBox: {
//     width: 50,
//     height: 50,
//     borderRadius: 15,
//     backgroundColor: "rgba(255,255,255,0.17)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   icon: {
//     fontSize: 23,
//   },

//   textArea: {
//     flex: 1,
//     marginLeft: 14,
//   },

//   actionTitle: {
//     color: "#ffffff",
//     fontSize: 17,
//     fontWeight: "900",
//   },

//   actionSubtitle: {
//     color: "rgba(255,255,255,0.82)",
//     fontSize: 12,
//     lineHeight: 17,
//     marginTop: 4,
//   },

//   arrow: {
//     color: "#ffffff",
//     fontSize: 32,
//     marginLeft: 8,
//   },

//   secondaryLinks: {
//     gap: 10,
//     marginTop: 22,
//   },

//   secondaryButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#ffffff",
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#dce4ec",
//     padding: 14,
//   },

//   secondaryIcon: {
//     fontSize: 23,
//     marginRight: 12,
//   },

//   secondaryTitle: {
//     color: "#0f172a",
//     fontSize: 14,
//     fontWeight: "900",
//   },

//   secondarySubtitle: {
//     color: "#64748b",
//     fontSize: 11,
//     marginTop: 3,
//   },

//   secondaryArrow: {
//     color: "#64748b",
//     fontSize: 28,
//     marginLeft: 8,
//   },
// });

// export default StockManagementScreen;

import ScreenWrapper from "@/components/ScreenWrapper";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ManagementActionProps = {
  title: string;
  subtitle: string;
  icon: string;
  colors: [string, string];
  onPress: () => void;
};

const StockManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const ManagementAction = ({
    title,
    subtitle,
    icon,
    colors,
    onPress,
  }: ManagementActionProps) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.actionTouchable}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionCard}
      >
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.textArea}>
          <Text style={styles.actionTitle}>{title}</Text>

          <Text style={styles.actionSubtitle}>
            {subtitle}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

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
        style={styles.pageGradient}
      >
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + 12,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerTextArea}>
              <Text style={styles.title}>
                Stock Management
              </Text>

              <Text style={styles.subtitle}>
                Control stock, movements, returns and
                suppliers
              </Text>
            </View>
          </View>

          <LinearGradient
            colors={[
              "#14532d",
              "#166534",
              "#15803d",
            ]}
            style={styles.heroCard}
          >
            <View style={styles.heroIconCircle}>
              <Text style={styles.heroIcon}>📦</Text>
            </View>

            <View style={styles.heroTextArea}>
              <Text style={styles.heroTitle}>
                Your inventory workspace
              </Text>

              <Text style={styles.heroText}>
                Add stock, record outgoing stock, count
                inventory, manage suppliers and review
                business activity.
              </Text>
            </View>
          </LinearGradient>

          <Text style={styles.sectionTitle}>
            Stock operations
          </Text>

          <View style={styles.actionsContainer}>
            <ManagementAction
              title="Add Stock"
              subtitle="Create a new item or add another delivery"
              icon="➕"
              colors={["#15803d", "#166534"]}
              onPress={() =>
                router.push("/screens/stock/add")
              }
            />

            <ManagementAction
              title="Move Stock"
              subtitle="Record sales, consumption and other stock out"
              icon="🔄"
              colors={["#0369a1", "#075985"]}
              onPress={() =>
                router.push(
                  "/screens/StockMoveScreen",
                )
              }
            />

            <ManagementAction
              title="Stock Count"
              subtitle="Count physical stock and correct quantity differences"
              icon="🧮"
              colors={["#7c3aed", "#5b21b6"]}
              onPress={() =>
                router.push(
                  "/screens/StockTakeScreen",
                )
              }
            />

            <ManagementAction
              title="Low Stock"
              subtitle="Review products that have reached their reorder level"
              icon="⚠️"
              colors={["#d97706", "#b45309"]}
              onPress={() =>
                router.push(
                  "/screens/ReorderListScreen",
                )
              }
            />

            <ManagementAction
              title="Returns"
              subtitle="Manage customer and supplier return records"
              icon="↩️"
              colors={["#c2410c", "#9a3412"]}
              onPress={() =>
                router.push("/(tabs)/returnsList")
              }
            />

            <ManagementAction
              title="Activity Log"
              subtitle="Review every stock movement and adjustment"
              icon="📒"
              colors={["#0f766e", "#115e59"]}
              onPress={() =>
                router.push(
                  "/screens/stockActivityLog",
                )
              }
            />

            <ManagementAction
              title="Suppliers"
              subtitle="Manage supplier accounts and outstanding balances"
              icon="🏭"
              colors={["#6d28d9", "#5b21b6"]}
              onPress={() =>
                router.push(
                  "/screens/suppliers/supplierList",
                )
              }
            />

            <ManagementAction
              title="Dashboard"
              subtitle="View stock, sales and business performance"
              icon="📊"
              colors={["#1d4ed8", "#1e40af"]}
              onPress={() =>
                router.push("/(tabs)/dashboard")
              }
            />
          </View>

          <View style={styles.secondaryLinks}>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.85}
              onPress={() =>
                router.push("/(tabs)/stockList")
              }
            >
              <Text style={styles.secondaryIcon}>
                📋
              </Text>

              <View style={styles.secondaryTextArea}>
                <Text style={styles.secondaryTitle}>
                  View Stock List
                </Text>

                <Text
                  style={styles.secondarySubtitle}
                >
                  Browse, search and edit all products
                </Text>
              </View>

              <Text style={styles.secondaryArrow}>
                ›
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.85}
              onPress={() =>
                router.push(
                  "/screens/stock/stockOutHistory",
                )
              }
            >
              <Text style={styles.secondaryIcon}>
                📤
              </Text>

              <View style={styles.secondaryTextArea}>
                <Text style={styles.secondaryTitle}>
                  Stock Out History
                </Text>

                <Text
                  style={styles.secondarySubtitle}
                >
                  Review sales and stock consumed
                  in-house
                </Text>
              </View>

              <Text style={styles.secondaryArrow}>
                ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  pageGradient: {
    flex: 1,
    minHeight: "100%",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 130,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  backIcon: {
    color: "#0f172a",
    fontSize: 32,
    fontWeight: "400",
    marginTop: -3,
  },

  headerTextArea: {
    flex: 1,
  },

  title: {
    color: "#0f172a",
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 3,
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#14532d",
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowRadius: 14,
    elevation: 6,
  },

  heroIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },

  heroIcon: {
    fontSize: 30,
  },

  heroTextArea: {
    flex: 1,
    marginLeft: 15,
  },

  heroTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  heroText: {
    color: "#dcfce7",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  sectionTitle: {
    color: "#0f172a",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 12,
  },

  actionsContainer: {
    gap: 12,
  },

  actionTouchable: {
    width: "100%",
  },

  actionCard: {
    minHeight: 92,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.13,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 9,
    elevation: 4,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.17)",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 23,
  },

  textArea: {
    flex: 1,
    marginLeft: 14,
  },

  actionTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },

  actionSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  arrow: {
    color: "#ffffff",
    fontSize: 32,
    marginLeft: 8,
  },

  secondaryLinks: {
    gap: 10,
    marginTop: 22,
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dce4ec",
    padding: 14,
  },

  secondaryIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  secondaryTextArea: {
    flex: 1,
  },

  secondaryTitle: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "900",
  },

  secondarySubtitle: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },

  secondaryArrow: {
    color: "#64748b",
    fontSize: 28,
    marginLeft: 8,
  },
});

export default StockManagementScreen;