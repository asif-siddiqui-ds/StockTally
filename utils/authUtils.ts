import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_KEY = "isGuest";

/**
 * ✅ Mark current session as guest
 */
export const setGuest = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(GUEST_KEY, "true");
  } catch (err) {
    console.error("❌ Error setting guest mode:", err);
  }
};

/**
 * ✅ Clear guest session (logout guest)
 */
export const clearGuest = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(GUEST_KEY);
  } catch (err) {
    console.error("❌ Error clearing guest mode:", err);
  }
};

/**
 * ✅ Check if user is guest
 */
export const isGuest = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(GUEST_KEY);
    return value === "true";
  } catch (err) {
    console.error("❌ Error checking guest mode:", err);
    return false;
  }
};
