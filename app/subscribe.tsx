// app/subscribe.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

export default function SubscribeScreen() {
  const [offerings, setOfferings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        setOfferings(offerings);
      } catch (e) {
        Alert.alert('Error', 'Could not fetch offerings');
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, []);

  const handlePurchase = async (pack: PurchasesPackage) => {
    try {
      const { purchaserInfo } = await Purchases.purchasePackage(pack);
      if (purchaserInfo.entitlements.active['pro']) {
        Alert.alert('🎉 Subscribed!', 'You have access to premium features.');
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Error', 'Something went wrong during purchase.');
      }
    }
  };

  if (loading) return <ActivityIndicator />;

  const availablePackage = offerings?.current?.availablePackages;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Upgrade to Premium</Text>
      {availablePackage?.map((pack: PurchasesPackage) => (
        <View key={pack.identifier} style={{ marginBottom: 15 }}>
          <Text>{pack.product.title} - {pack.product.priceString}</Text>
          <Button title="Subscribe" onPress={() => handlePurchase(pack)} />
        </View>
      ))}
    </View>
  );
}
