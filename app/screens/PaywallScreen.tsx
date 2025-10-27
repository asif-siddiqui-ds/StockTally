// // app/screens/PaywallScreen.tsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
// import Purchases, { Package } from 'react-native-purchases';
// import { useRouter } from 'expo-router';

// const PaywallScreen: React.FC = () => {
//   const [packages, setPackages] = useState<Package[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchOfferings = async () => {
//       try {
//         const offerings = await Purchases.getOfferings();
//         if (offerings.current && offerings.current.availablePackages.length > 0) {
//           setPackages(offerings.current.availablePackages);
//         }
//       } catch (error) {
//         console.warn("⚠️ Could not fetch subscriptions", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOfferings();
//   }, []);

//   const handlePurchase = async (pkg: Package) => {
//     try {
//       await Purchases.purchasePackage(pkg);
//       router.replace('/(tabs)/'); // 🚀 Go Home after success
//     } catch (error: any) {
//       if (!error.userCancelled) {
//         console.error("Purchase failed", error);
//       }
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Cancel / Back button */}
//       <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
//         <Text style={styles.closeText}>✕</Text>
//       </TouchableOpacity>

//       {/* Branding */}
//       <Image source={require('../../assets/icon.png')} style={styles.logo} />
//       <Text style={styles.title}>🚀 Upgrade to Pro</Text>
//       <Text style={styles.subtitle}>Unlock advanced features:</Text>

//       {/* Feature list */}
//       <View style={styles.featureList}>
//         <Text style={styles.feature}>• Dashboard with insights</Text>
//         <Text style={styles.feature}>• Edit Sales Records</Text>
//         <Text style={styles.feature}>• Invoice Printing</Text>
//         <Text style={styles.feature}>• Priority Support</Text>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" />
//       ) : (
//         <View style={styles.packageContainer}>
//           {packages.map((pkg) => (
//             <TouchableOpacity
//               key={pkg.identifier}
//               style={styles.packageButton}
//               onPress={() => handlePurchase(pkg)}
//             >
//               <Text style={styles.packageTitle}>{pkg.product.title}</Text>
//               <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
//               <Text style={styles.packageDescription}>{pkg.product.description}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       {/* Continue free version */}
//       <TouchableOpacity
//         style={styles.freeButton}
//         onPress={() => router.replace('/(tabs)/')}
//       >
//         <Text style={styles.freeButtonText}>Continue using Free Version</Text>
//       </TouchableOpacity>

//       {/* Legal + Restore */}
//       <View style={styles.footer}>
//         <TouchableOpacity onPress={() => Purchases.restorePurchases()}>
//           <Text style={styles.footerLink}>Restore Purchases</Text>
//         </TouchableOpacity>
//         <Text style={styles.footerDivider}> | </Text>
//         <TouchableOpacity>
//           <Text style={styles.footerLink}>Terms</Text>
//         </TouchableOpacity>
//         <Text style={styles.footerDivider}> | </Text>
//         <TouchableOpacity>
//           <Text style={styles.footerLink}>Privacy</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
//   closeButton: { position: 'absolute', top: 50, right: 20 },
//   closeText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
//   logo: { width: 120, height: 120, marginBottom: 20 },
//   title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
//   subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 15, color: '#555' },
//   featureList: { marginBottom: 20 },
//   feature: { fontSize: 16, color: '#444', marginVertical: 3 },

//   packageContainer: { width: '100%', marginTop: 10 },
//   packageButton: {
//     padding: 15,
//     marginVertical: 10,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     alignItems: 'center',
//     backgroundColor: '#f9f9f9'
//   },
//   packageTitle: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
//   packagePrice: { fontSize: 16, color: '#333', marginBottom: 5 },
//   packageDescription: { fontSize: 14, color: '#666', textAlign: 'center' },

//   freeButton: { marginTop: 25, paddingVertical: 12, paddingHorizontal: 20 },
//   freeButtonText: { color: '#007AFF', fontSize: 16, textDecorationLine: 'underline' },

//   footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, flexWrap: 'wrap' },
//   footerLink: { color: '#007AFF', fontSize: 14 },
//   footerDivider: { color: '#999', marginHorizontal: 5 }
// });

// export default PaywallScreen;

// // app/screens/PaywallScreen.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
// } from 'react-native';
// import Purchases, { Package } from 'react-native-purchases';
// import { useRouter } from 'expo-router';

// const PaywallScreen: React.FC = () => {
//   const [packages, setPackages] = useState<Package[]>([]);
//   const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchOfferings = async () => {
//       try {
//         const offerings = await Purchases.getOfferings();
//         if (offerings.current && offerings.current.availablePackages.length > 0) {
//           setPackages(offerings.current.availablePackages);
//           setSelectedPkg(offerings.current.availablePackages[0]); // Default to first
//         }
//       } catch (error) {
//         console.warn('⚠️ Could not fetch subscriptions', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOfferings();
//   }, []);

//   const handleContinue = async () => {
//     if (!selectedPkg) return;
//     try {
//       await Purchases.purchasePackage(selectedPkg);
//       router.replace('/(tabs)/'); // 🚀 Redirect after success
//     } catch (error: any) {
//       if (!error.userCancelled) {
//         console.error('Purchase failed', error);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Close Button */}
//       <TouchableOpacity style={styles.closeButton} onPress={() => router.push("/(tabs)")}>
//         <Text style={styles.closeText}>✕</Text>
//       </TouchableOpacity>

//       {/* Logo */}
//       <Image source={require('../../assets/icon.png')} style={styles.logo} />

//       {/* Title + Features */}
//       <Text style={styles.title}>Get access to all our Pro features</Text>
//       <Text style={styles.subtitle}>
//         Subscription unlocks Dashboard, Sale Editing, Invoice Printing, and more.
//       </Text>
//       <View style={styles.featureList}>
//           <Text style={styles.feature}>• Dashboard with insights</Text>
//           <Text style={styles.feature}>• Unlimited Stock/Sale Items</Text>
//           <Text style={styles.feature}>• Company Branding</Text>
//           <Text style={styles.feature}>• Cloud Storage of Data</Text>
//         <Text style={styles.feature}>• Priority Support</Text>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" />
//       ) : (
//         <View style={styles.options}>
//           {packages.map((pkg) => (
//             <TouchableOpacity
//               key={pkg.identifier}
//               style={[
//                 styles.option,
//                 selectedPkg?.identifier === pkg.identifier && styles.optionSelected,
//               ]}
//               onPress={() => setSelectedPkg(pkg)}
//             >
//               <View style={styles.radioRow}>
//                 <View
//                   style={[
//                     styles.radioOuter,
//                     selectedPkg?.identifier === pkg.identifier && styles.radioOuterSelected,
//                   ]}
//                 >
//                   {selectedPkg?.identifier === pkg.identifier && (
//                     <View style={styles.radioInner} />
//                   )}
//                 </View>
//                 <Text style={styles.optionText}>{pkg.product.title}</Text>
//               </View>
//               <Text style={styles.price}>{pkg.product.priceString}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       {/* Continue Button */}
//       <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
//         <Text style={styles.continueText}>Continue</Text>
//       </TouchableOpacity>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <TouchableOpacity onPress={() => Purchases.restorePurchases()}>
//           <Text style={styles.footerLink}>Restore Purchases</Text>
//         </TouchableOpacity>
//         <Text style={styles.footerDivider}> | </Text>
//         <TouchableOpacity>
//           <Text style={styles.footerLink}>Terms</Text>
//         </TouchableOpacity>
//         <Text style={styles.footerDivider}> | </Text>
//         <TouchableOpacity>
//           <Text style={styles.footerLink}>Privacy</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', padding: 20, alignItems: 'center' },
//   closeButton: { position: 'absolute', top: 50, right: 20 },
//   closeText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
//   logo: { width: 100, height: 100, marginTop: 60, marginBottom: 20 },
//   title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
//   subtitle: { fontSize: 15, textAlign: 'center', color: '#666', marginBottom: 20 },

//   options: { width: '100%' },
//   option: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   optionSelected: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
//   radioRow: { flexDirection: 'row', alignItems: 'center' },
//   radioOuter: {
//     width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#aaa', marginRight: 10,
//   },
//   radioOuterSelected: { borderColor: '#007AFF' },
//   radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF', alignSelf: 'center', marginTop: 3 },
//   optionText: { fontSize: 16, fontWeight: '500' },
//   price: { fontSize: 16, fontWeight: '600', color: '#333' },

//   continueButton: {
//     marginTop: 20,
//     backgroundColor: '#FF9500',
//     paddingVertical: 15,
//     paddingHorizontal: 50,
//     borderRadius: 12,
//   },
//   continueText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },

//   footer: { flexDirection: 'row', marginTop: 30 },
//   footerLink: { color: '#007AFF', fontSize: 14 },
//   footerDivider: { color: '#999', marginHorizontal: 5 },
// });

// export default PaywallScreen;

// // app/screens/PaywallScreen.tsx
// import { useRouter } from "expo-router";
// import * as WebBrowser from "expo-web-browser";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Image,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Purchases, { Package } from "react-native-purchases";


// const PaywallScreen: React.FC = () => {
//   const [packages, setPackages] = useState<Package[]>([]);
//   const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showFamilyPlans, setShowFamilyPlans] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchOfferings = async () => {
//       try {
//         const offerings = await Purchases.getOfferings();
//         if (offerings.current && offerings.current.availablePackages.length > 0) {
//           setPackages(offerings.current.availablePackages);
//           setSelectedPkg(offerings.current.availablePackages[0]); // Default
//         }
//       } catch (error) {
//         console.warn("⚠️ Could not fetch subscriptions", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOfferings();
//   }, []);

//   const handleContinue = async () => {
//     if (!selectedPkg) return;
//     try {
//       await Purchases.purchasePackage(selectedPkg);
//       router.replace("/(tabs)");
//     } catch (error: any) {
//       if (!error.userCancelled) {
//         console.error("Purchase failed", error);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Close Button */}
//       <TouchableOpacity
//         style={styles.closeButton}
//         onPress={() => router.push("/(tabs)")}
//       >
//         <Text style={styles.closeText}>✕</Text>
//       </TouchableOpacity>

//       {/* Logo */}
//       <Image source={require("../../assets/icon.png")} style={styles.logo} />

//       {/* Title */}
//       <Text style={styles.title}>
//         Get access to all our {"\n"}StockTally pro features
//       </Text>
//       <Text style={styles.subtitle}>
//         🔒 Subscription status unlocks the Dashboard and other Pro features.
//       </Text>

//       {/* Feature List */}
//       <View style={styles.featureList}>
//         <Text style={styles.feature}>• Dashboard with insights</Text>
//         <Text style={styles.feature}>• Unlimited Stock/Sale Items</Text>
//         <Text style={styles.feature}>• Company Branding</Text>
//         <Text style={styles.feature}>• Cloud Storage of Data</Text>
//         <Text style={styles.feature}>• Priority Support</Text>
//       </View>

//       {/* Toggle */}
//       <View style={styles.toggleRow}>
//         <Text style={styles.toggleLabel}>Show family plans</Text>
//         <Switch
//           value={showFamilyPlans}
//           onValueChange={setShowFamilyPlans}
//           trackColor={{ false: "#555", true: "#FF9500" }}
//           thumbColor={showFamilyPlans ? "#fff" : "#ccc"}
//         />
//       </View>

//       {/* Subscription Options */}
//       {loading ? (
//         <ActivityIndicator size="large" color="#fff" />
//       ) : (
//         <View style={styles.options}>
//           {packages.map((pkg) => (
//             <TouchableOpacity
//               key={pkg.identifier}
//               style={[
//                 styles.option,
//                 selectedPkg?.identifier === pkg.identifier &&
//                   styles.optionSelected,
//               ]}
//               onPress={() => setSelectedPkg(pkg)}
//             >
//               <View style={styles.radioRow}>
//                 <View
//                   style={[
//                     styles.radioOuter,
//                     selectedPkg?.identifier === pkg.identifier &&
//                       styles.radioOuterSelected,
//                   ]}
//                 >
//                   {selectedPkg?.identifier === pkg.identifier && (
//                     <View style={styles.radioInner} />
//                   )}
//                 </View>
//                 <Text style={styles.optionText}>{pkg.product.title}</Text>
//               </View>
//               <Text style={styles.price}>{pkg.product.priceString}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       {/* Continue Button */}
//       <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
//         <Text style={styles.continueText}>Continue</Text>
//       </TouchableOpacity>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <TouchableOpacity onPress={() => Purchases.restorePurchases()}>
//           <Text style={styles.footerLink}>Restore Purchases</Text>
//         </TouchableOpacity>
//         <Text style={styles.footerDivider}> | </Text>

//         <TouchableOpacity
//           onPress={() =>
//             WebBrowser.openBrowserAsync("https://asif-siddiqui-ds.github.io/StockTally/privacy.html")
//           }
//         >
//           <Text style={styles.footerLink}>Privacy</Text>
//         </TouchableOpacity>
//         <Text style={styles.footerDivider}> | </Text>

//         <TouchableOpacity
//           onPress={() =>
//             WebBrowser.openBrowserAsync("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")
//           }
//         >
//           <Text style={styles.footerLink}>Terms</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#122017", padding: 20 },
//   closeButton: { position: "absolute", top: 50, right: 20 },
//   closeText: { fontSize: 26, fontWeight: "bold", color: "#fff" },
//   logo: {
//     width: 440,
//     height: 240,
//     alignSelf: "center",
//     // resizeMode: 'contain', 
//     marginTop: 60,
//     marginBottom: 25,
//   },
//   title: {
//     fontSize: 25,
//     fontWeight: "bold",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#ccc",
//     textAlign: "center",
//     marginBottom: 15,
//     paddingHorizontal: 15,
//   },
//   featureList: {
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
//   feature: {
//     fontSize: 14,
//     color: "#ddd",
//     marginBottom: 5,
//   },
//   toggleRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   toggleLabel: { color: "#fff", fontSize: 14 },

//   options: { width: "100%", marginTop: 10 },
//   option: {
//     borderWidth: 1,
//     borderColor: "#444",
//     borderRadius: 12,
//     padding: 15,
//     marginVertical: 8,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1c2a20",
//   },
//   optionSelected: { borderColor: "#FF9500", backgroundColor: "#233323" },
//   radioRow: { flexDirection: "row", alignItems: "center" },
//   radioOuter: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: "#aaa",
//     marginRight: 10,
//   },
//   radioOuterSelected: { borderColor: "#FF9500" },
//   radioInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#FF9500",
//     alignSelf: "center",
//     marginTop: 3,
//   },
//   optionText: { fontSize: 16, fontWeight: "500", color: "#fff" },
//   price: { fontSize: 16, fontWeight: "600", color: "#ccc" },

//   continueButton: {
//     marginTop: 20,
//     backgroundColor: "#FF9500",
//     paddingVertical: 15,
//     borderRadius: 12,
//   },
//   continueText: { fontSize: 18, color: "#fff", fontWeight: "bold", textAlign: "center" },

//   footer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 30,
//   },
//   footerLink: { color: "#FF9500", fontSize: 14 },
//   footerDivider: { color: "#777", marginHorizontal: 5 },
// });

// export default PaywallScreen;

// import { useProUser } from "@/context/ProUserContext";
// import { useRouter } from "expo-router";
// import * as WebBrowser from "expo-web-browser";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from "react-native";
// import Purchases, {
//   CustomerInfo,
//   PURCHASES_ERROR_CODE,
//   PurchasesPackage,
// } from "react-native-purchases";

// const PaywallScreen: React.FC = () => {
//   const [packages, setPackages] = useState<PurchasesPackage[]>([]);
//   const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showFamilyPlans, setShowFamilyPlans] = useState(false);

//   const router = useRouter();
//   const { updateEntitlements } = useProUser(); // ✅ from context

//   // Fetch offerings
//   useEffect(() => {
//     const fetchOfferings = async () => {
//       try {
//         const offerings = await Purchases.getOfferings();
//         if (offerings.current && offerings.current.availablePackages.length > 0) {
//           setPackages(offerings.current.availablePackages);
//           setSelectedPkg(offerings.current.availablePackages[0]); // default selection
//         }
//       } catch (error) {
//         console.warn("⚠️ Could not fetch subscriptions", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOfferings();
//   }, []);

//   // Handle purchase
//   const handleContinue = async () => {
//     if (!selectedPkg) {
//       Alert.alert(
//         "Subscriptions Unavailable",
//         "Subscriptions are not currently available. Please try again later."
//       );
//       return;
//     }
//     try {
//       const { customerInfo } = await Purchases.purchasePackage(selectedPkg);
//       await updateEntitlements(customerInfo); // ✅ global entitlement update
//       router.replace("/(tabs)");
//     } catch (error: any) {
//       if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
//         console.log("🛑 Purchase was cancelled by the user");
//       } else {
//         console.error("❌ Purchase failed", error);
//       }
//     }
//   };

//   // Handle restore
//   const handleRestore = async () => {
//     try {
//       const customerInfo: CustomerInfo = await Purchases.restorePurchases();
//       await updateEntitlements(customerInfo); // ✅ global entitlement update
//       router.replace("/(tabs)");
//     } catch (error: any) {
//       console.error("❌ Restore failed", error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Close Button */}
//       <TouchableOpacity
//         style={styles.closeButton}
//         onPress={() => router.push("/(tabs)")}
//       >
//         <Text style={styles.closeText}>✕</Text>
//       </TouchableOpacity>

//       {/* Logo */}
//       <Image source={require("../../assets/icon.png")} style={styles.logo} />

//       {/* Title */}
//       <Text style={styles.title}>
//         Get access to all our {"\n"}StockTally Pro features
//       </Text>
//       <Text style={styles.subtitle}>
//         🔒 Subscription unlocks the Dashboard and other Pro features.
//       </Text>

//       {/* Feature List */}
//       <View style={styles.featureList}>
//         <Text style={styles.feature}>• Dashboard with insights</Text>
//         <Text style={styles.feature}>• Unlimited Stock/Sale Items</Text>
//         <Text style={styles.feature}>• Company Branding</Text>
//         <Text style={styles.feature}>• Cloud Storage of Data</Text>
//         <Text style={styles.feature}>• Priority Support</Text>
//       </View>

//       {/* Toggle */}
//       {/* <View style={styles.toggleRow}>
//         <Text style={styles.toggleLabel}>Show family plans</Text>
//         <Switch
//           value={showFamilyPlans}
//           onValueChange={setShowFamilyPlans}
//           trackColor={{ false: "#555", true: "#FF9500" }}
//           thumbColor={showFamilyPlans ? "#fff" : "#ccc"}
//         />
//       </View> */}

//       {/* Subscription Options */}
//       {loading ? (
//         <ActivityIndicator size="large" color="#fff" />
//       ) : (
//         <View style={styles.options}>
//           {packages.map((pkg) => (
//             <TouchableOpacity
//               key={pkg.identifier}
//               style={[
//                 styles.option,
//                 selectedPkg?.identifier === pkg.identifier &&
//                   styles.optionSelected,
//               ]}
//               onPress={() => setSelectedPkg(pkg)}
//             >
//               <View style={styles.radioRow}>
//                 <View
//                   style={[
//                     styles.radioOuter,
//                     selectedPkg?.identifier === pkg.identifier &&
//                       styles.radioOuterSelected,
//                   ]}
//                 >
//                   {selectedPkg?.identifier === pkg.identifier && (
//                     <View style={styles.radioInner} />
//                   )}
//                 </View>
//                 <Text style={styles.optionText}>{pkg.product.title}</Text>
//               </View>
//               <Text style={styles.price}>{pkg.product.priceString}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       {/* Continue Button */}
//       <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
//         <Text style={styles.continueText}>Continue</Text>
//       </TouchableOpacity>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <TouchableOpacity onPress={handleRestore}>
//           <Text style={styles.footerLink}>Restore Purchases</Text>
//         </TouchableOpacity>
//         <Text style={styles.footerDivider}> | </Text>

//         <TouchableOpacity
//           onPress={() =>
//             WebBrowser.openBrowserAsync(
//               "https://asif-siddiqui-ds.github.io/StockTally/privacy.html"
//             )
//           }
//         >
//           <Text style={styles.footerLink}>Privacy</Text>
//         </TouchableOpacity>
//         <Text style={styles.footerDivider}> | </Text>

//         <TouchableOpacity
//           onPress={() =>
//             WebBrowser.openBrowserAsync(
//               "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
//             )
//           }
//         >
//           <Text style={styles.footerLink}>Terms</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#122017", padding: 20 },
//   closeButton: { position: "absolute", top: 50, right: 20 },
//   closeText: { fontSize: 26, fontWeight: "bold", color: "#fff" },
//   logo: {
//     width: 440,
//     height: 240,
//     alignSelf: "center",
//     marginTop: 60,
//     marginBottom: 25,
//   },
//   title: {
//     fontSize: 25,
//     fontWeight: "bold",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#ccc",
//     textAlign: "center",
//     marginBottom: 15,
//     paddingHorizontal: 15,
//   },
//   featureList: { marginBottom: 20, paddingHorizontal: 10 },
//   feature: { fontSize: 14, color: "#ddd", marginBottom: 5 },
//   toggleRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   toggleLabel: { color: "#fff", fontSize: 14 },
//   options: { width: "100%", marginTop: 10 },
//   option: {
//     borderWidth: 1,
//     borderColor: "#444",
//     borderRadius: 12,
//     padding: 15,
//     marginVertical: 8,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1c2a20",
//   },
//   optionSelected: { borderColor: "#FF9500", backgroundColor: "#233323" },
//   radioRow: { flexDirection: "row", alignItems: "center" },
//   radioOuter: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: "#aaa",
//     marginRight: 10,
//   },
//   radioOuterSelected: { borderColor: "#FF9500" },
//   radioInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#FF9500",
//     alignSelf: "center",
//     marginTop: 3,
//   },
//   optionText: { fontSize: 16, fontWeight: "500", color: "#fff" },
//   price: { fontSize: 16, fontWeight: "600", color: "#ccc" },
//   continueButton: {
//     marginTop: 20,
//     backgroundColor: "#FF9500",
//     paddingVertical: 15,
//     borderRadius: 12,
//   },
//   continueText: {
//     fontSize: 18,
//     color: "#fff",
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
//   footerLink: { color: "#FF9500", fontSize: 14 },
//   footerDivider: { color: "#777", marginHorizontal: 5 },
// });

// export default PaywallScreen;

import { useProUser } from "@/context/ProUserContext";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Purchases, {
  CustomerInfo,
  PURCHASES_ERROR_CODE,
  PurchasesPackage,
} from "react-native-purchases";

const PaywallScreen: React.FC = () => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { updateEntitlements } = useProUser();

  // ✅ Fetch offerings from RevenueCat
  useEffect(() => {
    const init = async () => {
      try {
        console.log("🟢 RevenueCat configured early");
        const offerings = await Purchases.getOfferings();
        if (offerings.current?.availablePackages.length) {
          setPackages(offerings.current.availablePackages);
          setSelectedPkg(offerings.current.availablePackages[0]);
        } else {
          setError("No subscription packages available.");
        }
      } catch (err: any) {
        console.warn("⚠️ Error fetching offerings:", err);
        setError("Failed to fetch products. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    init();

    Purchases.addCustomerInfoUpdateListener((info) => {
      updateEntitlements(info);
    });

    // ✅ No manual cleanup required in v5
    return () => {};
  }, []);


  // ✅ Handle subscription purchase
  const handleContinue = async () => {
    if (!selectedPkg) return;

    try {
      setLoading(true);
      console.log(`INFO 💰 Purchasing Product '${selectedPkg.identifier}'`);

      const { customerInfo } = await Purchases.purchasePackage(selectedPkg);
      await updateEntitlements(customerInfo);
      console.log("✅ Subscription completed & entitlements synced");
      console.log(customerInfo);


      // Navigate to app home (or dashboard)
      router.replace("/(tabs)");
    } catch (err: any) {
      if (
        err.userCancelled ||
        err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
      ) {
        console.log("🟡 Purchase cancelled by user");
      } else {
        console.warn("❌ Purchase error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Restore purchases (for reinstall / test)
  const handleRestore = async () => {
    try {
      setLoading(true);
      const info = await Purchases.restorePurchases();
      await updateEntitlements(info);
      console.log("🔄 Restored purchases & updated entitlements");
    } catch (err) {
      console.warn("⚠️ Restore failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
    
  return (
    <View style={styles.container}>

      <Image source={require("../../assets/icon.png")} style={styles.logo} />

      <Text style={styles.title}>
        Unlock all{"\n"}StockTally Pro features
      </Text>
      <Text style={styles.subtitle}>
        🔒 Subscription unlocks dashboard analytics and unlimited access.
      </Text>

      {/* <View style={styles.featureList}>
        <Text style={styles.feature}>• Dashboard Insights</Text>
        <Text style={styles.feature}>• Unlimited Stock & Sales</Text>
        <Text style={styles.feature}>• Cloud Data Backup</Text>
      </View> */}

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <View style={styles.options}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.option,
                selectedPkg?.identifier === pkg.identifier && styles.optionSelected,
              ]}
              onPress={() => setSelectedPkg(pkg)}
            >
              <View style={styles.radioRow}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedPkg?.identifier === pkg.identifier &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {selectedPkg?.identifier === pkg.identifier && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.optionText}>
                  {pkg.product.title}
                </Text>
                

              </View>
              <Text style={styles.price}>{pkg.product.priceString}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Subscribe Now</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(tabs)")} style={{ marginTop: 20 }}>
        <Text style={styles.cancelText}>Maybe Later</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.footerLink}>Restore Purchases</Text>
        </TouchableOpacity>
        <Text style={styles.footerDivider}> | </Text>

        <TouchableOpacity
          onPress={() =>
            WebBrowser.openBrowserAsync(
              "https://asif-siddiqui-ds.github.io/StockTally/privacy.html"
            )
          }
        >
          <Text style={styles.footerLink}>Privacy</Text>
        </TouchableOpacity>
        <Text style={styles.footerDivider}> | </Text>

        <TouchableOpacity
          onPress={() =>
            WebBrowser.openBrowserAsync(
              Platform.OS === "ios"
                ? "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                : "https://play.google.com/about/play-terms/"
            )
          }
        >
          <Text style={styles.footerLink}>Terms</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#122017", padding: 20 },
  closeButton: { position: "absolute", top: 50, right: 20 },
  closeText: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  logo: {
    width: 440,
    height: 240,
    alignSelf: "center",
    marginTop: 60,
    marginBottom: 25,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  featureList: { marginBottom: 20, paddingHorizontal: 10 },
  feature: { fontSize: 14, color: "#ddd", marginBottom: 5 },
  options: { width: "100%", marginTop: 10 },
  option: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1c2a20",
  },
  optionSelected: { borderColor: "#FF9500", backgroundColor: "#233323" },
  radioRow: { flexDirection: "row", alignItems: "center" },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#aaa",
    marginRight: 10,
  },
  radioOuterSelected: { borderColor: "#FF9500" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF9500",
    alignSelf: "center",
    marginTop: 3,
  },
  optionText: { fontSize: 16, fontWeight: "500", color: "#fff" },
  price: { fontSize: 16, fontWeight: "600", color: "#ccc" },
  continueButton: {
    marginTop: 20,
    backgroundColor: "#FF9500",
    paddingVertical: 15,
    borderRadius: 12,
  },
  continueText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 50 },
  footerLink: { color: "#FF9500", fontSize: 14 },
  footerDivider: { color: "#777", marginHorizontal: 5 },
  
  optionDescription: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 4,
  },
  cancelText: { textAlign: "center", color: "#fff", fontSize: 16, marginTop: 10 },

});

export default PaywallScreen;

// import React, { useEffect, useState } from "react";
// import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import Purchases, { PurchasesPackage } from "react-native-purchases";
// import { useRouter } from "expo-router";
// import { useProUser } from "@/context/ProUserContext";
// import { getOfferings } from "@/lib/revenuecat";

// const PaywallScreen: React.FC = () => {
//   const [packages, setPackages] = useState<PurchasesPackage[]>([]);
//   const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const { updateEntitlements } = useProUser();

//   // ✅ Fetch offerings from RevenueCat
//   useEffect(() => {
//     const fetchOfferings = async () => {
//       try {
//         const availablePackages = await getOfferings();
//         setPackages(availablePackages);
//         if (availablePackages.length > 0) setSelectedPkg(availablePackages[0]);
//       } catch (err) {
//         console.warn("⚠️ Error fetching offerings:", err);
//         setError("Unable to load subscriptions. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOfferings();
//   }, []);

//   // ✅ Handle purchase flow
//   const handlePurchase = async () => {
//     if (!selectedPkg) return;

//     setLoading(true);
//     setError(null);
//     try {
//       const { customerInfo } = await Purchases.purchasePackage(selectedPkg);

//       await updateEntitlements(customerInfo); // update after purchase

//       if (customerInfo.entitlements.active["Pro"]) {
//         console.log("✅ Subscription completed & entitlements synced");
//         router.back();
//       } else {
//         console.log("⚠️ Purchase done but no Pro entitlement active");
//       }
//     } catch (err: any) {
//       if (err.userCancelled) {
//         console.log("🟡 Purchase cancelled by user");
//       } else {
//         console.error("❌ Purchase failed:", err);
//         setError("Purchase failed. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Simple UI
//   return (
//     <View style={styles.container}>
//       <Image source={require("@/assets/icon.png")} style={styles.logo} />
//       <Text style={styles.title}>Unlock StockTally Pro</Text>
//       <Text style={styles.subtitle}>Access premium features and remove limits.</Text>

//       {loading ? (
//         <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
//       ) : error ? (
//         <Text style={styles.error}>{error}</Text>
//       ) : packages.length === 0 ? (
//         <Text style={styles.subtitle}>No subscriptions available</Text>
//       ) : (
//         <>
//           {packages.map((pkg) => (
//             <TouchableOpacity
//               key={pkg.identifier}
//               style={[
//                 styles.packageButton,
//                 selectedPkg?.identifier === pkg.identifier && styles.packageButtonSelected,
//               ]}
//               onPress={() => setSelectedPkg(pkg)}
//             >
//               <Text
//                 style={[
//                   styles.packageText,
//                   selectedPkg?.identifier === pkg.identifier && styles.packageTextSelected,
//                 ]}
//               >
//                 {pkg.product.title} - {pkg.product.priceString}
//               </Text>
//             </TouchableOpacity>
//           ))}

//           <TouchableOpacity style={styles.subscribeButton} onPress={handlePurchase}>
//             <Text style={styles.subscribeText}>
//               Subscribe Now
//             </Text>
//           </TouchableOpacity>
//         </>
//       )}

//       <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
//         <Text style={styles.cancelText}>Maybe Later</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default PaywallScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingHorizontal: 20,
//   },
//   logo: { width: 100, height: 100, marginBottom: 20 },
//   title: { fontSize: 22, fontWeight: "700", color: "#111" },
//   subtitle: { fontSize: 16, textAlign: "center", color: "#555", marginTop: 10 },
//   packageButton: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 10,
//     padding: 12,
//     marginTop: 15,
//     width: "100%",
//     alignItems: "center",
//   },
//   packageButtonSelected: {
//     borderColor: "#007bff",
//     backgroundColor: "#e6f0ff",
//   },
//   packageText: { fontSize: 16, color: "#111" },
//   packageTextSelected: { color: "#007bff", fontWeight: "bold" },
//   subscribeButton: {
//     backgroundColor: "#007bff",
//     borderRadius: 12,
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     marginTop: 25,
//     width: "100%",
//   },
//   subscribeText: { color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "center" },
//   cancelText: { color: "#007bff", fontSize: 16, marginTop: 15 },
//   error: { color: "red", textAlign: "center", marginTop: 20 },
// });
