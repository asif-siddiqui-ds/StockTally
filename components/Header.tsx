// app/components/Header.tsx
// import { Entypo } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import React from 'react';
// import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// const screenTitles: Record<string, string> = {
//   "index": "Home",
//   "+not-found": "Page Not Found",
//   "saleList": "Sale List",
//   "dashboard": "Dashboard",
//   "stockList": "Stock List",
//   "screens/sales/[id]": "Edit Sale",
//   "screens/sales/record": "Record Sale",
//   "screens/stock/[id]": "Edit Stock",
//   "screens/stock/add": "Add Stock",
//   "LoginScreen": "Login"
// };

// const Header = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const screenName = route.name;

//   const title = screenTitles[screenName] || "StockTally";

//   if (screenName === "index") {
//     return null;
//   }

//   return (
//     <View style={styles.header}>
//       {screenName !== "index" && (
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Entypo name="chevron-left" size={24} color="white" />
//         </TouchableOpacity>
//       )}
//       {screenName !== "index" && (
//         <Text style={styles.title}>{title}</Text> // ✅ Only show if not "index"
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     height: 60,
//     backgroundColor: '#007bff',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     paddingTop: 10,
//   },
//   backButton: {
//     marginRight: 10,
//   },
//   title: {
//     fontSize: 20,
//     color: 'white',
//     fontWeight: '600',
//   },
// });

// export default Header;

// app/components/Header.tsx
import { Entypo } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const screenTitles: Record<string, string> = {
  index: "Home",
  "(tabs)": "StockTally",
  "+not-found": "Page Not Found",
  saleList: "Sale List",
  dashboard: "Dashboard",
  stockList: "Stock List",
  returnsList: "Return List",
  "screens/sales/[id]": "Edit Sale",
  "screens/sales/record": "Record Sale",
  "screens/stock/[id]": "Edit Stock",
  "screens/stock/add": "Add Stock",
  "screens/returns/[id]": "Edit Return",
  "screens/returns/record": "Add Return",
  "screens/CompanyProfileScreen": "Company Profile",
  "screens/CloudBackupScreen": "Cloud Backup",
  LoginScreen: "Login",
};

const Header = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const screenName = route?.name ?? 'index';

  const title = screenTitles[screenName] || "StockTally";

  // ✅ Hide header on index or tab root
  if (screenName === "index" || screenName === "(tabs)") {
    return null;
  }

  return (
    <View style={styles.header}>
      {navigation.canGoBack() && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Entypo name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
  },
});

export default Header;
