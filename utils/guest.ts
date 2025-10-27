// utils/guest.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_KEY = 'isGuest';

export async function isGuest(): Promise<boolean> {
  const guestFlag = await AsyncStorage.getItem(GUEST_KEY);
  return guestFlag === 'true';
}


