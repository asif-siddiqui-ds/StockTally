// app/(tabs)/index.tsx
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import { router } from 'expo-router';
// import React from 'react';
// import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// const HomeScreen: React.FC = () => {
//   const { logout } = useAuth();

//   const handleLogout = async () => {
//     try {
//       await logout();
//       Alert.alert("Logout Successful");
//       router.replace('../LoginScreen');
//     } catch (error: any) {
//       Alert.alert("Logout Failed", error.message);
//     }
//   };
  

//   // const handleLogin = () => {
//   //   router.push('../screens/LoginScreen');
//   // };

//   return (
//     <ScreenWrapper>
//     <View style={styles.container}>
//       <Image
//         source={require('../../assets/icon.png')} // Replace with your logo path
//         style={styles.logo}
//       />
//       <Text style={styles.title}>StockTally</Text>

//       <View style={styles.buttonContainer}>
//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => router.push('./dashboard')}
//         >
//           <Text style={styles.buttonText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => router.push('./stockList')}
//         >
//           <Text style={styles.buttonText}>Stock</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => router.push('./saleList')}
//         >
//           <Text style={styles.buttonText}>Sale</Text>
//         </TouchableOpacity>

//           <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//             <Text style={styles.buttonText}>Logout</Text>
//           </TouchableOpacity>
//       </View>
//     </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 30,
//     color: '#333',
//   },
//   buttonContainer: {
//     width: '80%',
//     gap: 15,
//   },
//   button: {
//     backgroundColor: '#4CAF50',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   logoutButton: {
//     backgroundColor: '#d9534f',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default HomeScreen;

// app/(tabs)/index.tsx
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import { useProUser } from '@/lib/ProUserContext';
// import { router } from 'expo-router';
// import React from 'react';
// import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// const HomeScreen: React.FC = () => {
//   const { logout } = useAuth();
//   const { isProUser, loading } = useProUser();

//   const handleLogout = async () => {
//     try {
//       await logout();
//       Alert.alert("Logout Successful");
//       router.replace('../LoginScreen');
//     } catch (error: any) {
//       Alert.alert("Logout Failed", error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <ScreenWrapper>
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//           <Text>Checking subscription...</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <View style={styles.container}>
//         <Image
//           source={require('../../assets/icon.png')} // Replace with your logo path
//           style={styles.logo}
//         />
//         <Text style={styles.title}>StockTally</Text>

//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./dashboard')}
//           >
//             <Text style={styles.buttonText}>Dashboard</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./stockList')}
//           >
//             <Text style={styles.buttonText}>Stock</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./saleList')}
//           >
//             <Text style={styles.buttonText}>Sale</Text>
//           </TouchableOpacity>

//           {/* 🚀 Only show Upgrade button if NOT Pro */}
//           {!isProUser && (
//             <TouchableOpacity
//               style={styles.upgradeButton}
//               onPress={() => router.push('/paywall')}
//             >
//               <Text style={styles.upgradeButtonText}>⭐ Upgrade to Pro</Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//             <Text style={styles.buttonText}>Logout</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 30,
//     color: '#333',
//   },
//   buttonContainer: {
//     width: '80%',
//     gap: 15,
//   },
//   button: {
//     backgroundColor: '#4CAF50',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   logoutButton: {
//     backgroundColor: '#d9534f',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   upgradeButton: {
//     backgroundColor: '#f0ad4e',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   upgradeButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//   },
// });

// export default HomeScreen;

// // app/(tabs)/index.tsx
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import { useProUser } from '@/lib/ProUserContext';
// import { router } from 'expo-router';
// import React from 'react';
// import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// const HomeScreen: React.FC = () => {
//   const { user, logout } = useAuth();
//   const { isProUser, loading } = useProUser();

//   const handleLogout = async () => {
//     try {
//       await logout();
//       Alert.alert("Logout Successful");
//       router.replace('/(auth)/LoginScreen');
//     } catch (error: any) {
//       Alert.alert("Logout Failed", error.message);
//     }
//   };

//   return (
//     <ScreenWrapper>
//       <View style={styles.container}>
//         <Image
//           source={require('../../assets/icon.png')}
//           style={styles.logo}
//         />
//         <Text style={styles.title}>StockTally</Text>

//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./dashboard')}
//           >
//             <Text style={styles.buttonText}>Dashboard</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./stockList')}
//           >
//             <Text style={styles.buttonText}>Stock</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./saleList')}
//           >
//             <Text style={styles.buttonText}>Sale</Text>
//           </TouchableOpacity>

//           {/* ⭐ Show Upgrade button only for non-Pro users */}
//           {!loading && !isProUser && (
//             <TouchableOpacity
//               style={[styles.button, styles.upgradeButton]}
//               onPress={() => router.push('/paywall')}
//             >
//               <Text style={styles.buttonText}>⭐ Upgrade to Pro</Text>
//             </TouchableOpacity>
//           )}

//           {/* 🚪 Show Logout button only if not a guest */}
//           {user && user.$id !== "guest" && (
//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <Text style={styles.buttonText}>Logout</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 30,
//     color: '#333',
//   },
//   buttonContainer: {
//     width: '80%',
//     gap: 15,
//   },
//   button: {
//     backgroundColor: '#4CAF50',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     elevation: 5,
//   },
//   upgradeButton: {
//     backgroundColor: '#f0ad4e',
//   },
//   logoutButton: {
//     backgroundColor: '#d9534f',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     elevation: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default HomeScreen;

// app/(tabs)/index.tsx
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { useAuth } from '@/context/AuthContext';
// import { checkProEntitlement } from '@/lib/revenuecat';
// import { router } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// const HomeScreen: React.FC = () => {
//   const { user, logout } = useAuth();
//   const [isProUser, setIsProUser] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // 🔍 Check RevenueCat entitlement on mount
//   useEffect(() => {
//     const checkEntitlement = async () => {
//       const proStatus = await checkProEntitlement();
//       setIsProUser(proStatus);
//       setLoading(false);
//     };
//     checkEntitlement();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await logout();
//       Alert.alert('Logout Successful');
//       router.replace('/(auth)/LoginScreen');
//     } catch (error: any) {
//       Alert.alert('Logout Failed', error.message);
//     }
//   };

//   return (
//     <ScreenWrapper>
//       <View style={styles.container}>
//         <Image
//           source={require('@/assets/icon.png')}
//           style={{
//             width: 250,   // ⬆️ was 100, now bigger
//             height: 250,  // keep equal for square
//             resizeMode: 'contain',
//             marginBottom: 20,
//           }}
//         />
//         <Text style={styles.title}>StockTally</Text>

//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./dashboard')}
//           >
//             <Text style={styles.buttonText}>Dashboard</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./stockList')}
//           >
//             <Text style={styles.buttonText}>Stock</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./saleList')}
//           >
//             <Text style={styles.buttonText}>Sale</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push('./returnsList')}
//           >
//             <Text style={styles.buttonText}>Returns</Text>
//           </TouchableOpacity>

//           {/* ⭐ Show Upgrade button only for guests/non-Pro */}
//           {!loading && !isProUser && (
//             <TouchableOpacity
//               style={[styles.button, styles.upgradeButton]}
//               onPress={() => router.push('/paywall')}
//             >
//               <Text style={styles.buttonText}>⭐ Upgrade to Pro</Text>
//             </TouchableOpacity>
//           )}

//           {/* 🔄 Show Login to Sync only for Pro users who are still guest */}
//           {!loading && isProUser && user?.$id === 'guest' && (
//             <TouchableOpacity
//               style={[styles.button, styles.syncButton]}
//               onPress={() => router.push('/(auth)/LoginScreen')}
//             >
//               <Text style={styles.buttonText}>🔄 Login to Sync Data</Text>
//             </TouchableOpacity>
//           )}

//           {/* 🚪 Logout only for logged-in Pro users */}
//           {!loading && isProUser && user && user.$id !== 'guest' && (
//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <Text style={styles.buttonText}>Logout</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
//   logo: { width: 100, height: 100, marginBottom: 20 },
//   title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#333' },
//   buttonContainer: { width: '80%', gap: 15 },
//   button: {
//     backgroundColor: '#4CAF50',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     elevation: 5,
//   },
//   upgradeButton: { backgroundColor: '#f0ad4e' },
//   syncButton: { backgroundColor: '#0275d8' },
//   logoutButton: { backgroundColor: '#d9534f', paddingVertical: 15, alignItems: 'center', borderRadius: 8, elevation: 5 },
//   buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
// });

// export default HomeScreen;

import ScreenWrapper from '@/components/ScreenWrapper';
import { useAuth } from '@/context/AuthContext';
import { checkProEntitlement } from "@/lib/revenuecat";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProUser, setIsProUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  // const [isProUser, loading] = useProUser()

  // 🔍 Check RevenueCat entitlement on mount
  useEffect(() => {
    const checkEntitlement = async () => {
      const proStatus = await checkProEntitlement();
      setIsProUser(proStatus);
      setLoading(false);
    };
    checkEntitlement();
  }, []);

  // const showProBanner = () => {
  //   Animated.sequence([
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }),
  //     Animated.delay(3000),
  //     Animated.timing(slideAnim, {
  //       toValue: -100,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // };

  // useEffect(() => {
  //   if (isProUser) {
  //     showProBanner();
  //   }
  // }, [isProUser]);

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Logout Successful');
      router.replace('/(auth)/LoginScreen');
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  const GradientButton = ({
    title,
    colors,
    onPress,
    icon,
  }: {
    title: string;
    colors: string[];
    onPress: () => void;
    icon?: string;
  }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientButton}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      {/* 🎉 Animated Banner */}
      {/* <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.bannerText}>✅ Pro Unlocked! Enjoy full access</Text>
      </Animated.View> */}

      <LinearGradient colors={['#f4f6f9', '#e9eef3']} style={styles.gradient}>
        <View style={styles.container}>
          <Image source={require('@/assets/icon3.png')} style={styles.logo} />
          <Text style={styles.title}>StockTally</Text>

          <View style={styles.buttonContainer}>
            <GradientButton
              title="📊 Dashboard"
              colors={['#4CAF50', '#2E7D32']}
              onPress={() => router.push('./dashboard')}
            />
            <GradientButton
              title="📦 Stock"
              colors={['#8BC34A', '#558B2F']}
              onPress={() => router.push('./stockList')}
            />
            <GradientButton
              title="💰 Sale"
              colors={['#43A047', '#2E7D32']}
              onPress={() => router.push('./saleList')}
            />
            <GradientButton
              title="↩️ Returns"
              colors={['#66BB6A', '#388E3C']}
              onPress={() => router.push('./returnsList')}
            />
            <GradientButton
              title="☁️ Sync Data to Cloud"
              colors={['#1976D2', '#0D47A1']}
              onPress={() => router.push('/screens/CloudBackupScreen')}
            />

            {!loading && !isProUser && (
              <GradientButton
                title="⭐ Upgrade to Pro"
                colors={['#FFC107', '#FFB300']}
                onPress={() => router.push('/paywall')}
              />
            )}

            {isProUser && user && user.$id !== 'guest' && (
              <GradientButton
                title="🚪 Logout"
                colors={['#E53935', '#B71C1C']}
                onPress={handleLogout}
              />
            )}
          </View>
        </View>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 40,
    color: '#011102ff',
  },
  buttonContainer: {
    width: '85%',
    gap: 15,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  bannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;


