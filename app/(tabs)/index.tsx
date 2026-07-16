// export default HomeScreen;

import ScreenWrapper from '@/components/ScreenWrapper';
import { useAuth } from '@/context/AuthContext';
import { useCompanyProfile } from '@/context/CompanyProfileContext';
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
  const { companyProfile } = useCompanyProfile();
  const companyName = companyProfile?.companyName?.trim() || 'StockTally';
  const companyLogo = companyProfile?.logoLocal;

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
    <ScreenWrapper scroll backgroundColor="#f4f6f9">
      {/* 🎉 Animated Banner */}
      {/* <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.bannerText}>✅ Pro Unlocked! Enjoy full access</Text>
      </Animated.View> */}

      <LinearGradient colors={['#f4f6f9', '#e9eef3']} style={styles.gradient}>        
        <View style={styles.container}>
          <View style={styles.stockTallyBrand}>
            <Image
              source={require('@/assets/icon3.png')}
              style={styles.stockTallyLogo}
            />
            <Text style={styles.stockTallyText}>
              StockTally
            </Text>
          </View>

          {companyLogo ? (
            <Image
              source={{ uri: companyLogo }}
              style={styles.companyLogo}
            />
          ) : (
            <Image
              source={require('@/assets/icon3.png')}
              style={styles.companyLogo}
            />
          )}

          <TouchableOpacity
            onPress={() => router.push('/screens/CompanyProfileScreen')}
          >
            <Text style={styles.companyName}>
              {companyName}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <GradientButton
              title="📊 Dashboard"
              colors={['#4CAF50', '#2E7D32']}
              onPress={() => router.push('./dashboard')}
            />
            <GradientButton
              title="📦 Stock List"
              colors={['#8BC34A', '#558B2F']}
              onPress={() => router.push('./stockList')}
            />
            <GradientButton
              title="💰 Stock Move"
              colors={['#43A047', '#2E7D32']}
              onPress={() => router.push("/screens/StockMoveScreen")}
              
            />
            <GradientButton
              title="↩️ Returns"
              colors={['#66BB6A', '#388E3C']}
              onPress={() => router.push('./returnsList')}
            />

            <GradientButton
              title="📒 Stock Activity Log"
              colors={["#009688", "#00695C"]}
              onPress={() => router.push("/screens/stockActivityLog")}
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
                colors={['#ec413eff', '#dd7979ff']}
                onPress={handleLogout}
              />
            )}
          </View>
        </View>
        {/* </ScrollView> */}
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
  stockTallyBrand: {
    position: 'absolute',
    top: 10,
    left: 10,
    alignItems: 'center',
  },

  stockTallyLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  stockTallyText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },

  companyLogo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginTop: 30,
    marginBottom: 15,
  },

  companyName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#011102ff',
    textAlign: 'center',
    marginBottom: 35,
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


