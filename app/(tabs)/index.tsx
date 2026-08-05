// // export default HomeScreen;

// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import { useCompanyProfile } from '@/context/CompanyProfileContext';
// import { checkProEntitlement } from "@/lib/revenuecat";
// import { LinearGradient } from 'expo-linear-gradient';
// import { router } from 'expo-router';
// import React, { useEffect, useRef, useState } from 'react';
// import { Alert, Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// const HomeScreen: React.FC = () => {
//   const { user, logout } = useAuth();
//   const [isProUser, setIsProUser] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const slideAnim = useRef(new Animated.Value(-100)).current;
//   // const [isProUser, loading] = useProUser()
//   const { companyProfile } = useCompanyProfile();
//   const companyName = companyProfile?.companyName?.trim() || 'StockTally';
//   const companyLogo = companyProfile?.logoLocal;

//   // 🔍 Check RevenueCat entitlement on mount
//   useEffect(() => {
//     const checkEntitlement = async () => {
//       const proStatus = await checkProEntitlement();
//       setIsProUser(proStatus);
//       setLoading(false);
//     };
//     checkEntitlement();
//   }, []);

//   // const showProBanner = () => {
//   //   Animated.sequence([
//   //     Animated.timing(slideAnim, {
//   //       toValue: 0,
//   //       duration: 500,
//   //       useNativeDriver: true,
//   //     }),
//   //     Animated.delay(3000),
//   //     Animated.timing(slideAnim, {
//   //       toValue: -100,
//   //       duration: 500,
//   //       useNativeDriver: true,
//   //     }),
//   //   ]).start();
//   // };

//   // useEffect(() => {
//   //   if (isProUser) {
//   //     showProBanner();
//   //   }
//   // }, [isProUser]);

//   const handleLogout = async () => {
//     try {
//       await logout();
//       Alert.alert('Logout Successful');
//       router.replace('/(auth)/LoginScreen');
//     } catch (error: any) {
//       Alert.alert('Logout Failed', error.message);
//     }
//   };

//   const GradientButton = ({
//     title,
//     colors,
//     onPress,
//     icon,
//   }: {
//     title: string;
//     colors: string[];
//     onPress: () => void;
//     icon?: string;
//   }) => (
//     <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
//       <LinearGradient
//         colors={colors}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.gradientButton}
//       >
//         <Text style={styles.buttonText}>{title}</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );

//   return (
//     <ScreenWrapper scroll backgroundColor="#f4f6f9">
//       {/* 🎉 Animated Banner */}
//       {/* <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
//         <Text style={styles.bannerText}>✅ Pro Unlocked! Enjoy full access</Text>
//       </Animated.View> */}

//       <LinearGradient colors={['#f4f6f9', '#e9eef3']} style={styles.gradient}>        
//         <View style={styles.container}>
//           <View style={styles.stockTallyBrand}>
//             <Image
//               source={require('@/assets/icon3.png')}
//               style={styles.stockTallyLogo}
//             />
//             <Text style={styles.stockTallyText}>
//               StockTally
//             </Text>
//           </View>

//           {companyLogo ? (
//             <Image
//               source={{ uri: companyLogo }}
//               style={styles.companyLogo}
//             />
//           ) : (
//             <Image
//               source={require('@/assets/icon3.png')}
//               style={styles.companyLogo}
//             />
//           )}

//           <TouchableOpacity
//             onPress={() => router.push('/screens/CompanyProfileScreen')}
//           >
//             <Text style={styles.companyName}>
//               {companyName}
//             </Text>
//           </TouchableOpacity>

//           <View style={styles.buttonContainer}>
//              <GradientButton
//               title="Invoices"
//               colors={['#7f4caf', '#2e2f7d']}
//               onPress={() => router.push("/screens/invoices/invoiceHome")}
//             />

//             <GradientButton
//               title="Suppliers"
//               colors={['#7f4caf', '#2e2f7d']}
//               onPress={() => router.push("/screens/suppliers/supplierList")}
//             />

//             <GradientButton
//               title="📊 Dashboard"
//               colors={['#4CAF50', '#2E7D32']}
//               onPress={() => router.push('./dashboard')}
//             />
//             <GradientButton
//               title="📦 Stock List"
//               colors={['#8BC34A', '#558B2F']}
//               onPress={() => router.push('./stockList')}
//             />
//             <GradientButton
//               title="💰 Stock Move"
//               colors={['#43A047', '#2E7D32']}
//               onPress={() => router.push("/screens/StockMoveScreen")}
              
//             />
//             <GradientButton
//               title="↩️ Returns"
//               colors={['#66BB6A', '#388E3C']}
//               onPress={() => router.push('./returnsList')}
//             />

//             <GradientButton
//               title="📒 Stock Activity Log"
//               colors={["#009688", "#00695C"]}
//               onPress={() => router.push("/screens/stockActivityLog")}
//             />
            
//             <GradientButton
//               title="☁️ Sync Data to Cloud"
//               colors={['#1976D2', '#0D47A1']}
//               onPress={() => router.push('/screens/CloudBackupScreen')}
//             />

//             {!loading && !isProUser && (
//               <GradientButton
//                 title="⭐ Upgrade to Pro"
//                 colors={['#FFC107', '#FFB300']}
//                 onPress={() => router.push('/paywall')}
//               />
//             )}

//             {isProUser && user && user.$id !== 'guest' && (
//               <GradientButton
//                 title="🚪 Logout"
//                 colors={['#ec413eff', '#dd7979ff']}
//                 onPress={handleLogout}
//               />
//             )}
//           </View>
//         </View>
//         {/* </ScrollView> */}
//       </LinearGradient>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: { flex: 1 },
//   container: {
//     flex: 1,
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 30,
//   },
//   stockTallyBrand: {
//     position: 'absolute',
//     top: 10,
//     left: 10,
//     alignItems: 'center',
//   },

//   stockTallyLogo: {
//     width: 40,
//     height: 40,
//     resizeMode: 'contain',
//   },

//   stockTallyText: {
//     fontSize: 11,
//     color: '#666',
//     fontWeight: '600',
//   },

//   companyLogo: {
//     width: 140,
//     height: 140,
//     resizeMode: 'contain',
//     marginTop: 30,
//     marginBottom: 15,
//   },

//   companyName: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#011102ff',
//     textAlign: 'center',
//     marginBottom: 35,
//   },
//   logo: {
//     width: 180,
//     height: 180,
//     resizeMode: 'contain',
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: '800',
//     marginBottom: 40,
//     color: '#011102ff',
//   },
//   buttonContainer: {
//     width: '85%',
//     gap: 15,
//   },
//   gradientButton: {
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   banner: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 60,
//     backgroundColor: '#4CAF50',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 999,
//     borderBottomLeftRadius: 10,
//     borderBottomRightRadius: 10,
//   },
//   bannerText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

// });

// export default HomeScreen;

// import ScreenWrapper from "@/components/ScreenWrapper";
// import { useAuth } from "@/context/AuthContext";
// import { useCompanyProfile } from "@/context/CompanyProfileContext";
// import { checkProEntitlement } from "@/lib/revenuecat";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// type HomeActionProps = {
//   title: string;
//   subtitle: string;
//   icon: string;
//   colors: [string, string];
//   onPress: () => void;
//   fullWidth?: boolean;
// };

// const HomeScreen: React.FC = () => {
//   const { user, logout } = useAuth();
//   const { companyProfile } = useCompanyProfile();

//   const [isProUser, setIsProUser] = useState(false);
//   const [loadingProStatus, setLoadingProStatus] = useState(true);

//   const companyName =
//     companyProfile?.companyName?.trim() || "StockTally";

//   const companyLogo =
//     companyProfile?.logoLocal || companyProfile?.logoCloud;

//   const isGuestUser = !user || user.$id === "guest";

//   const loadProStatus = useCallback(async () => {
//     try {
//       setLoadingProStatus(true);
//       const proStatus = await checkProEntitlement();
//       setIsProUser(proStatus);
//     } catch (error) {
//       console.error("Failed to check Pro entitlement:", error);
//       setIsProUser(false);
//     } finally {
//       setLoadingProStatus(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadProStatus();
//   }, [loadProStatus]);

//   const handleLogout = async () => {
//     Alert.alert(
//       "Log Out?",
//       "You will need to sign in again to access cloud features.",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Log Out",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await logout();
//               router.replace("/(auth)/LoginScreen");
//             } catch (error: any) {
//               Alert.alert(
//                 "Logout Failed",
//                 error.message || "Could not log out.",
//               );
//             }
//           },
//         },
//       ],
//     );
//   };

//   const HomeAction = ({
//     title,
//     subtitle,
//     icon,
//     colors,
//     onPress,
//     fullWidth = false,
//   }: HomeActionProps) => (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPress={onPress}
//       style={[
//         styles.actionTouchable,
//         fullWidth && styles.actionTouchableFull,
//       ]}
//     >
//       <LinearGradient
//         colors={colors}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.actionCard}
//       >
//         <View style={styles.actionIconCircle}>
//           <Text style={styles.actionIcon}>{icon}</Text>
//         </View>

//         <View style={styles.actionTextArea}>
//           <Text style={styles.actionTitle}>{title}</Text>
//           <Text style={styles.actionSubtitle}>{subtitle}</Text>
//         </View>

//         <Text style={styles.actionArrow}>›</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );

//   return (
//     <ScreenWrapper scroll backgroundColor="#eef3f8">
//       <LinearGradient
//         colors={["#eef3f8", "#dce8f2", "#eef3f8"]}
//         style={styles.pageGradient}
//       >
//         <View style={styles.container}>
//           <View style={styles.topBar}>
//             <View style={styles.brandBlock}>
//               <Image
//                 source={require("@/assets/icon3.png")}
//                 style={styles.brandLogo}
//               />

//               <View>
//                 <Text style={styles.brandName}>StockTally</Text>
//                 <Text style={styles.brandTagline}>
//                   Business control centre
//                 </Text>
//               </View>
//             </View>

//             <TouchableOpacity
//               style={styles.profileButton}
//               onPress={() =>
//                 router.push("/screens/CompanyProfileScreen")
//               }
//             >
//               <Text style={styles.profileButtonText}>Profile</Text>
//             </TouchableOpacity>
//           </View>

//           <LinearGradient
//             colors={["#0f172a", "#1e3a5f", "#28547f"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={styles.heroCard}
//           >
//             <View style={styles.heroTopRow}>
//               <View style={styles.companyLogoWrap}>
//                 {companyLogo ? (
//                   <Image
//                     source={{ uri: companyLogo }}
//                     style={styles.companyLogo}
//                   />
//                 ) : (
//                   <Image
//                     source={require("@/assets/icon3.png")}
//                     style={styles.companyLogo}
//                   />
//                 )}
//               </View>

//               <View
//                 style={[
//                   styles.planBadge,
//                   isProUser
//                     ? styles.planBadgePro
//                     : styles.planBadgeFree,
//                 ]}
//               >
//                 {loadingProStatus ? (
//                   <ActivityIndicator size="small" color="#ffffff" />
//                 ) : (
//                   <Text style={styles.planBadgeText}>
//                     {isProUser ? "PRO" : "FREE"}
//                   </Text>
//                 )}
//               </View>
//             </View>

//             <Text style={styles.welcomeText}>Welcome back</Text>

//             <TouchableOpacity
//               activeOpacity={0.85}
//               onPress={() =>
//                 router.push("/screens/CompanyProfileScreen")
//               }
//             >
//               <Text style={styles.companyName}>{companyName}</Text>
//             </TouchableOpacity>

//             <Text style={styles.heroDescription}>
//               Manage invoices, stock and cloud backup from one simple workspace.
//             </Text>

//             <View style={styles.heroStatusRow}>
//               <View style={styles.heroStatusItem}>
//                 <Text style={styles.heroStatusLabel}>Account</Text>
//                 <Text style={styles.heroStatusValue}>
//                   {isGuestUser ? "Guest" : "Signed in"}
//                 </Text>
//               </View>

//               <View style={styles.heroDivider} />

//               <View style={styles.heroStatusItem}>
//                 <Text style={styles.heroStatusLabel}>Plan</Text>
//                 <Text style={styles.heroStatusValue}>
//                   {isProUser ? "Pro active" : "Free plan"}
//                 </Text>
//               </View>
//             </View>
//           </LinearGradient>

//           <View style={styles.sectionHeader}>
//             <View>
//               <Text style={styles.sectionTitle}>Main workspace</Text>
//               <Text style={styles.sectionSubtitle}>
//                 Choose what you want to manage
//               </Text>
//             </View>
//           </View>

//           <View style={styles.actionGrid}>
//             <HomeAction
//               title="Invoices"
//               subtitle="Create, send and manage invoices"
//               icon="🧾"
//               colors={["#6d28d9", "#4338ca"]}
//               onPress={() =>
//                 router.push("/screens/invoices/invoiceHome")
//               }
//             />

//             <HomeAction
//               title="Stock Management"
//               subtitle="Stock, sales, returns and suppliers"
//               icon="📦"
//               colors={["#15803d", "#166534"]}
//               onPress={() =>
//                 router.push("/screens/StockManagementScreen")
//               }
//             />

//             <HomeAction
//               title="Sync Data"
//               subtitle="Back up and restore cloud data"
//               icon="☁️"
//               colors={["#0369a1", "#1d4ed8"]}
//               onPress={() =>
//                 router.push("/screens/CloudBackupScreen")
//               }
//             />

//             {!loadingProStatus && !isProUser ? (
//               <HomeAction
//                 title="Upgrade to Pro"
//                 subtitle="Unlock unlimited business features"
//                 icon="⭐"
//                 colors={["#d97706", "#b45309"]}
//                 onPress={() => router.push("/paywall")}
//               />
//             ) : (
//               <HomeAction
//                 title="Pro Account"
//                 subtitle="Your premium features are active"
//                 icon="👑"
//                 colors={["#7c3aed", "#a21caf"]}
//                 onPress={() => router.push("/paywall")}
//               />
//             )}
//           </View>

//           <View style={styles.quickLinksCard}>
//             <Text style={styles.quickLinksTitle}>Quick access</Text>

//             <View style={styles.quickLinksRow}>
//               <TouchableOpacity
//                 style={styles.quickLink}
//                 onPress={() => router.push("./dashboard")}
//               >
//                 <Text style={styles.quickLinkIcon}>📊</Text>
//                 <Text style={styles.quickLinkText}>Dashboard</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.quickLink}
//                 onPress={() => router.push("./stockList")}
//               >
//                 <Text style={styles.quickLinkIcon}>📋</Text>
//                 <Text style={styles.quickLinkText}>Stock List</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.quickLink}
//                 onPress={() =>
//                   router.push("/screens/suppliers/supplierList")
//                 }
//               >
//                 <Text style={styles.quickLinkIcon}>🏭</Text>
//                 <Text style={styles.quickLinkText}>Suppliers</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {!isGuestUser ? (
//             <TouchableOpacity
//               style={styles.logoutButton}
//               onPress={handleLogout}
//             >
//               <Text style={styles.logoutIcon}>🚪</Text>
//               <Text style={styles.logoutText}>Log Out</Text>
//             </TouchableOpacity>
//           ) : null}

//           <Text style={styles.footerText}>
//             StockTally · Smarter stock. Simpler business.
//           </Text>
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
//     paddingTop: 16,
//     paddingBottom: 120,
//   },

//   topBar: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 18,
//   },

//   brandBlock: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },

//   brandLogo: {
//     width: 42,
//     height: 42,
//     resizeMode: "contain",
//   },

//   brandName: {
//     color: "#0f172a",
//     fontSize: 20,
//     fontWeight: "900",
//   },

//   brandTagline: {
//     color: "#64748b",
//     fontSize: 11,
//     marginTop: 1,
//   },

//   profileButton: {
//     backgroundColor: "#ffffff",
//     borderWidth: 1,
//     borderColor: "#dbe3eb",
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 9,
//   },

//   profileButtonText: {
//     color: "#1e3a5f",
//     fontSize: 13,
//     fontWeight: "800",
//   },

//   heroCard: {
//     borderRadius: 24,
//     padding: 20,
//     shadowColor: "#0f172a",
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 8 },
//     shadowRadius: 18,
//     elevation: 7,
//   },

//   heroTopRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },

//   companyLogoWrap: {
//     width: 68,
//     height: 68,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.25)",
//     justifyContent: "center",
//     alignItems: "center",
//     overflow: "hidden",
//   },

//   companyLogo: {
//     width: 58,
//     height: 58,
//     resizeMode: "contain",
//   },

//   planBadge: {
//     minWidth: 64,
//     minHeight: 30,
//     paddingHorizontal: 12,
//     borderRadius: 999,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   planBadgeFree: {
//     backgroundColor: "#d97706",
//   },

//   planBadgePro: {
//     backgroundColor: "#16a34a",
//   },

//   planBadgeText: {
//     color: "#ffffff",
//     fontSize: 11,
//     fontWeight: "900",
//     letterSpacing: 0.8,
//   },

//   welcomeText: {
//     color: "#bfdbfe",
//     fontSize: 13,
//     fontWeight: "700",
//     marginTop: 18,
//   },

//   companyName: {
//     color: "#ffffff",
//     fontSize: 28,
//     fontWeight: "900",
//     marginTop: 3,
//   },

//   heroDescription: {
//     color: "#dbeafe",
//     fontSize: 13,
//     lineHeight: 20,
//     marginTop: 8,
//     maxWidth: "92%",
//   },

//   heroStatusRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 20,
//     backgroundColor: "rgba(255,255,255,0.09)",
//     borderRadius: 14,
//     padding: 12,
//   },

//   heroStatusItem: {
//     flex: 1,
//   },

//   heroStatusLabel: {
//     color: "#93c5fd",
//     fontSize: 10,
//     fontWeight: "800",
//     textTransform: "uppercase",
//   },

//   heroStatusValue: {
//     color: "#ffffff",
//     fontSize: 13,
//     fontWeight: "800",
//     marginTop: 3,
//   },

//   heroDivider: {
//     width: 1,
//     height: 30,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     marginHorizontal: 16,
//   },

//   sectionHeader: {
//     marginTop: 26,
//     marginBottom: 12,
//   },

//   sectionTitle: {
//     color: "#0f172a",
//     fontSize: 21,
//     fontWeight: "900",
//   },

//   sectionSubtitle: {
//     color: "#64748b",
//     fontSize: 12,
//     marginTop: 3,
//   },

//   actionGrid: {
//     gap: 12,
//   },

//   actionTouchable: {
//     width: "100%",
//   },

//   actionTouchableFull: {
//     width: "100%",
//   },

//   actionCard: {
//     minHeight: 96,
//     borderRadius: 19,
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#000000",
//     shadowOpacity: 0.14,
//     shadowOffset: { width: 0, height: 5 },
//     shadowRadius: 10,
//     elevation: 5,
//   },

//   actionIconCircle: {
//     width: 52,
//     height: 52,
//     borderRadius: 16,
//     backgroundColor: "rgba(255,255,255,0.18)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   actionIcon: {
//     fontSize: 25,
//   },

//   actionTextArea: {
//     flex: 1,
//     marginLeft: 14,
//   },

//   actionTitle: {
//     color: "#ffffff",
//     fontSize: 18,
//     fontWeight: "900",
//   },

//   actionSubtitle: {
//     color: "rgba(255,255,255,0.82)",
//     fontSize: 12,
//     lineHeight: 17,
//     marginTop: 4,
//   },

//   actionArrow: {
//     color: "#ffffff",
//     fontSize: 34,
//     fontWeight: "300",
//     marginLeft: 8,
//   },

//   quickLinksCard: {
//     backgroundColor: "#ffffff",
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#dde5ed",
//     padding: 16,
//     marginTop: 22,
//   },

//   quickLinksTitle: {
//     color: "#0f172a",
//     fontSize: 15,
//     fontWeight: "900",
//     marginBottom: 14,
//   },

//   quickLinksRow: {
//     flexDirection: "row",
//     gap: 10,
//   },

//   quickLink: {
//     flex: 1,
//     minHeight: 82,
//     backgroundColor: "#f8fafc",
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 7,
//   },

//   quickLinkIcon: {
//     fontSize: 22,
//   },

//   quickLinkText: {
//     color: "#334155",
//     fontSize: 11,
//     fontWeight: "800",
//     textAlign: "center",
//     marginTop: 7,
//   },

//   logoutButton: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: "#ffffff",
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#fecaca",
//     paddingVertical: 13,
//     marginTop: 20,
//   },

//   logoutIcon: {
//     fontSize: 16,
//   },

//   logoutText: {
//     color: "#b91c1c",
//     fontSize: 14,
//     fontWeight: "900",
//   },

//   footerText: {
//     color: "#94a3b8",
//     fontSize: 11,
//     textAlign: "center",
//     marginTop: 22,
//   },
// });

// export default HomeScreen;

import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { useCompanyProfile } from "@/context/CompanyProfileContext";
import { checkProEntitlement } from "@/lib/revenuecat";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HomeActionProps = {
  title: string;
  subtitle: string;
  icon: string;
  colors: [string, string];
  onPress: () => void;
  fullWidth?: boolean;
};

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { companyProfile } = useCompanyProfile();

  const [isProUser, setIsProUser] = useState(false);
  const [loadingProStatus, setLoadingProStatus] = useState(true);

  const companyName =
    companyProfile?.companyName?.trim() || "StockTally";

  const companyLogo =
    companyProfile?.logoLocal || companyProfile?.logoCloud;

  const isGuestUser = !user || user.$id === "guest";

  const loadProStatus = useCallback(async () => {
    try {
      setLoadingProStatus(true);
      const proStatus = await checkProEntitlement();
      setIsProUser(proStatus);
    } catch (error) {
      console.error("Failed to check Pro entitlement:", error);
      setIsProUser(false);
    } finally {
      setLoadingProStatus(false);
    }
  }, []);

  useEffect(() => {
    loadProStatus();
  }, [loadProStatus]);

  const handleLogout = async () => {
    Alert.alert(
      "Log Out?",
      "You will need to sign in again to access cloud features.",
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
              router.replace("/(auth)/LoginScreen");
            } catch (error: any) {
              Alert.alert(
                "Logout Failed",
                error.message || "Could not log out.",
              );
            }
          },
        },
      ],
    );
  };

  const HomeAction = ({
    title,
    subtitle,
    icon,
    colors,
    onPress,
    fullWidth = false,
  }: HomeActionProps) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.actionTouchable,
        fullWidth && styles.actionTouchableFull,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionCard}
      >
        <View style={styles.actionIconCircle}>
          <Text style={styles.actionIcon}>{icon}</Text>
        </View>

        <View style={styles.actionTextArea}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>

        <Text style={styles.actionArrow}>›</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper scroll backgroundColor="#eef3f8">
      <LinearGradient
        colors={["#eef3f8", "#dce8f2", "#eef3f8"]}
        style={styles.pageGradient}
      >
        <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
          <View style={styles.topBar}>
            <View style={styles.brandBlock}>
              <Image
                source={require("@/assets/icon3.png")}
                style={styles.brandLogo}
              />

              <View>
                <Text style={styles.brandName}>StockTally</Text>
                <Text style={styles.brandTagline}>
                  Business control centre
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() =>
                router.push("/screens/CompanyProfileScreen")
              }
            >
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={["#0f172a", "#1e3a5f", "#28547f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.companyLogoWrap}>
                {companyLogo ? (
                  <Image
                    source={{ uri: companyLogo }}
                    style={styles.companyLogo}
                  />
                ) : (
                  <Image
                    source={require("@/assets/icon3.png")}
                    style={styles.companyLogo}
                  />
                )}
              </View>

              <View
                style={[
                  styles.planBadge,
                  isProUser
                    ? styles.planBadgePro
                    : styles.planBadgeFree,
                ]}
              >
                {loadingProStatus ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.planBadgeText}>
                    {isProUser ? "PRO" : "FREE"}
                  </Text>
                )}
              </View>
            </View>

            <Text style={styles.welcomeText}>Welcome back</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push("/screens/CompanyProfileScreen")
              }
            >
              <Text style={styles.companyName}>{companyName}</Text>
            </TouchableOpacity>

            <Text style={styles.heroDescription}>
              Manage invoices, stock and cloud backup from one simple workspace.
            </Text>

            <View style={styles.heroStatusRow}>
              <View style={styles.heroStatusItem}>
                <Text style={styles.heroStatusLabel}>Account</Text>
                <Text style={styles.heroStatusValue}>
                  {isGuestUser ? "Guest" : "Signed in"}
                </Text>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroStatusItem}>
                <Text style={styles.heroStatusLabel}>Plan</Text>
                <Text style={styles.heroStatusValue}>
                  {isProUser ? "Pro active" : "Free plan"}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Main workspace</Text>
              <Text style={styles.sectionSubtitle}>
                Choose what you want to manage
              </Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <HomeAction
              title="Invoices"
              subtitle="Create, send and manage invoices"
              icon="🧾"
              colors={["#6d28d9", "#4338ca"]}
              onPress={() =>
                router.push("/screens/invoices/invoiceHome")
              }
            />

            <HomeAction
              title="Stock Management"
              subtitle="Stock, sales, returns and suppliers"
              icon="📦"
              colors={["#15803d", "#166534"]}
              onPress={() =>
                router.push("/screens/StockManagementScreen")
              }
            />

            <HomeAction
              title="Sync Data"
              subtitle="Back up and restore cloud data"
              icon="☁️"
              colors={["#0369a1", "#1d4ed8"]}
              onPress={() =>
                router.push("/screens/CloudBackupScreen")
              }
            />

            {!loadingProStatus && !isProUser ? (
              <HomeAction
                title="Upgrade to Pro"
                subtitle="Unlock unlimited business features"
                icon="⭐"
                colors={["#d97706", "#b45309"]}
                onPress={() => router.push("/paywall")}
              />
            ) : (
              <HomeAction
                title="Pro Account"
                subtitle="Your premium features are active"
                icon="👑"
                colors={["#7c3aed", "#a21caf"]}
                onPress={() => router.push("/paywall")}
              />
            )}
          </View>

          <View style={styles.quickLinksCard}>
            <Text style={styles.quickLinksTitle}>Quick access</Text>

            <View style={styles.quickLinksRow}>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => router.push("./dashboard")}
              >
                <Text style={styles.quickLinkIcon}>📊</Text>
                <Text style={styles.quickLinkText}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => router.push("./stockList")}
              >
                <Text style={styles.quickLinkIcon}>📋</Text>
                <Text style={styles.quickLinkText}>Stock List</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickLink}
                onPress={() =>
                  router.push("/screens/suppliers/supplierList")
                }
              >
                <Text style={styles.quickLinkIcon}>🏭</Text>
                <Text style={styles.quickLinkText}>Suppliers</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!isGuestUser ? (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.helpLink}
            onPress={() =>
              router.push("/screens/HelpFeedbackScreen")
            }
          >
            <View style={styles.helpLinkIcon}>
              <Text style={styles.helpLinkIconText}>?</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.helpLinkTitle}>
                Help & Feedback
              </Text>
              <Text style={styles.helpLinkSubtitle}>
                Get support, report a problem or suggest an improvement
              </Text>
            </View>

            <Text style={styles.helpLinkArrow}>›</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            StockTally · Smarter stock. Simpler business.
          </Text>
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
    paddingBottom: 120,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  brandLogo: {
    width: 42,
    height: 42,
    resizeMode: "contain",
  },

  brandName: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "900",
  },

  brandTagline: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 1,
  },

  profileButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  profileButtonText: {
    color: "#1e3a5f",
    fontSize: 13,
    fontWeight: "800",
  },

  heroCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 7,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  companyLogoWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  companyLogo: {
    width: 58,
    height: 58,
    resizeMode: "contain",
  },

  planBadge: {
    minWidth: 64,
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  planBadgeFree: {
    backgroundColor: "#d97706",
  },

  planBadgePro: {
    backgroundColor: "#16a34a",
  },

  planBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  welcomeText: {
    color: "#bfdbfe",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 18,
  },

  companyName: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 3,
  },

  heroDescription: {
    color: "#dbeafe",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: "92%",
  },

  heroStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 14,
    padding: 12,
  },

  heroStatusItem: {
    flex: 1,
  },

  heroStatusLabel: {
    color: "#93c5fd",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  heroStatusValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },

  heroDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 16,
  },

  sectionHeader: {
    marginTop: 26,
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#0f172a",
    fontSize: 21,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 3,
  },

  actionGrid: {
    gap: 12,
  },

  actionTouchable: {
    width: "100%",
  },

  actionTouchableFull: {
    width: "100%",
  },

  actionCard: {
    minHeight: 96,
    borderRadius: 19,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },

  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  actionIcon: {
    fontSize: 25,
  },

  actionTextArea: {
    flex: 1,
    marginLeft: 14,
  },

  actionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  actionSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  actionArrow: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "300",
    marginLeft: 8,
  },

  quickLinksCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dde5ed",
    padding: 16,
    marginTop: 22,
  },

  quickLinksTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 14,
  },

  quickLinksRow: {
    flexDirection: "row",
    gap: 10,
  },

  quickLink: {
    flex: 1,
    minHeight: 82,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 7,
  },

  quickLinkIcon: {
    fontSize: 22,
  },

  quickLinkText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 7,
  },

  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingVertical: 13,
    marginTop: 20,
  },

  logoutIcon: {
    fontSize: 16,
  },

  logoutText: {
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "900",
  },

  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dce4ec",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 18,
  },

  helpLinkIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  helpLinkIconText: {
    color: "#1d4ed8",
    fontSize: 20,
    fontWeight: "900",
  },

  helpLinkTitle: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "900",
  },

  helpLinkSubtitle: {
    color: "#64748b",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  helpLinkArrow: {
    color: "#94a3b8",
    fontSize: 27,
    marginLeft: 8,
  },

  footerText: {
    color: "#94a3b8",
    fontSize: 11,
    textAlign: "center",
    marginTop: 22,
  },
});

export default HomeScreen;
