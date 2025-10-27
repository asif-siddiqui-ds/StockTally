// import ScreenWrapper from "@/components/ScreenWrapper";
// import {
//   deleteReturnItem,
//   getReturnItems,
//   getStockItem,
//   updateReturnItem,
//   updateStockQuantity
// } from "@/lib/storage";
// import { useRouter } from "expo-router"; // ✅ Correct hook
// import { useSearchParams } from 'expo-router/build/hooks'; // ✅ Correct import path

// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Button,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";

// const EditReturnScreen: React.FC = () => {
//   // const { id } = useLocalSearchParams<{ id: string }>(); // ✅ Correct way
//   const searchParams = useSearchParams();
//   const id = searchParams.get('id'); // ✅ Correct way to get the ID
  
//   const router = useRouter();

//   const [name, setName] = useState("");
//   const [quantity, setQuantity] = useState<number>(0);
//   const [reason, setReason] = useState("");
//   const [date, setDate] = useState("");
//   const [stockItemId, setStockItemId] = useState("");
//   const [originalQuantity, setOriginalQuantity] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!id) return;

//     const loadItem = async () => {
//       const returnItems = await getReturnItems();
//       const returnItem = returnItems.find((i) => i.id === id);
//       if (returnItem) {
//         setName(returnItem.name);
//         setQuantity(returnItem.quantity);
//         setReason(returnItem.reason);
//         setDate(new Date(returnItem.date).toLocaleDateString());
//         setStockItemId(returnItem.stockItemId);
//         setOriginalQuantity(returnItem.quantity);
//       }
//       setLoading(false); // ✅ fix: stop spinner
//     };

//     loadItem();
//   }, [id]);

//   // ✅ Handle Save (with stock adjustment prompt)
//   const handleSave = async () => {
//     if (!reason.trim() || quantity <= 0) {
//       Alert.alert("Error", "Please fill all fields correctly.");
//       return;
//     }

//     const diff = quantity - originalQuantity;

//     Alert.alert(
//       "Adjust Stock?",
//       diff > 0
//         ? `Do you want to reduce stock by ${diff}?`
//         : diff < 0
//         ? `Do you want to increase stock by ${Math.abs(diff)}?`
//         : "No stock adjustment needed. Save anyway?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "No",
//           onPress: async () => {
//             await updateReturnItem(id!, {
//               name,
//               quantity,
//               reason,
//               stockItemId,
//             });
//             Alert.alert("Updated", "Return updated (stock unchanged).");
//             router.replace("/screens/returns/returnsList"); // ✅ correct path
//           },
//         },
//         {
//           text: "Yes",
//           onPress: async () => {
//             if (stockItemId) {
//               const stock = await getStockItem(stockItemId);
//               if (stock) {
//                 const newQty = stock.quantity - diff;
//                 if (newQty < 0) {
//                   Alert.alert("Error", "Not enough stock to adjust.");
//                   return;
//                 }
//                 await updateStockQuantity(stockItemId, newQty);
//               }
//             }
//             await updateReturnItem(id!, {
//               name,
//               quantity,
//               reason,
//               stockItemId,
//             });
//             Alert.alert("Updated", "Return updated and stock adjusted.");
//             router.replace("/screens/returns/returnsList"); // ✅ correct path
//           },
//         },
//       ]
//     );
//   };

//   // 🗑️ Handle Delete (prompt to restore stock)
//   const handleDelete = async () => {
//     Alert.alert("Delete Return", "Do you also want to restore stock?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete Only",
//         style: "destructive",
//         onPress: async () => {
//           await deleteReturnItem(id!);
//           Alert.alert("Deleted", "Return deleted (stock unchanged).");
//           router.replace("/screens/returns/returnsList"); // ✅ correct path
//         },
//       },
//       {
//         text: "Delete & Restore",
//         style: "destructive",
//         onPress: async () => {
//           if (stockItemId) {
//             const stock = await getStockItem(stockItemId);
//             if (stock) {
//               await updateStockQuantity(stockItemId, stock.quantity + originalQuantity);
//             }
//           }
//           await deleteReturnItem(id!);
//           Alert.alert("Deleted", "Return deleted and stock restored.");
//           router.replace("/screens/returns/returnsList"); // ✅ correct path
//         },
//       },
//     ]);
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" color="#007BFF" />;
//   }

//   return (
//     <ScreenWrapper>
//       <SafeAreaView>
//         <ScrollView style={styles.container}>
//           <Text style={styles.label}>Item Name:</Text>
//           <TextInput style={styles.input} value={name} editable={false} />

//           <Text style={styles.label}>Quantity:</Text>
//           <TextInput
//             style={styles.input}
//             value={String(quantity)}
//             keyboardType="numeric"
//             onChangeText={(val) => setQuantity(Number(val))}
//           />

//           <Text style={styles.label}>Reason:</Text>
//           <TextInput
//             style={styles.input}
//             value={reason}
//             onChangeText={setReason}
//           />

//           <View style={styles.buttonRow}>
//             <Button title="Save" onPress={handleSave} />
//             <Button title="Delete" color="red" onPress={handleDelete} />
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   label: { fontSize: 16, fontWeight: "500", marginBottom: 5 },
//   input: {
//     borderColor: "#ccc",
//     borderWidth: 1,
//     marginBottom: 15,
//     padding: 10,
//     borderRadius: 6,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//   },
// });

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  deleteReturnItem,
  getReturnItems,
  getStockItem,
  updateReturnItem,
  updateStockQuantity,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const EditReturnScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [stockItemId, setStockItemId] = useState("");
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const bgColor = colorScheme === "dark" ? "#222" : "#fff";

  useEffect(() => {
    if (!id) return;

    const loadItem = async () => {
      const returnItems = await getReturnItems();
      const returnItem = returnItems.find((i) => String(i.id) === String(id));

      if (returnItem) {
        setName(returnItem.name ?? "");
        setQuantity(returnItem.quantity ?? 0);
        setReason(returnItem.reason ?? "");
        setDate(
          returnItem.date
            ? new Date(returnItem.date).toLocaleDateString()
            : ""
        );
        setStockItemId(returnItem.stockItemId ?? "");
        setOriginalQuantity(returnItem.quantity ?? 0);
      }
      setLoading(false);
    };

    loadItem();
  }, [id]);

  const handleSave = async () => {
    if (!reason.trim() || quantity <= 0) {
      Alert.alert("Error", "Please fill all fields correctly.");
      return;
    }

    const diff = quantity - originalQuantity;

    Alert.alert(
      "Adjust Stock?",
      diff > 0
        ? `Do you want to reduce stock by ${diff}?`
        : diff < 0
        ? `Do you want to increase stock by ${Math.abs(diff)}?`
        : "No stock adjustment needed. Save anyway?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "No",
          onPress: async () => {
            await updateReturnItem(id as string, {
              name,
              quantity,
              reason,
              stockItemId,
            });
            Alert.alert("Updated", "Return updated (stock unchanged).");
            router.back();
          },
        },
        {
          text: "Yes",
          onPress: async () => {
            if (stockItemId) {
              const stock = await getStockItem(stockItemId);
              if (stock) {
                const newQty = stock.quantity - diff;
                if (newQty < 0) {
                  Alert.alert("Error", "Not enough stock to adjust.");
                  return;
                }
                await updateStockQuantity(stockItemId, newQty);
              }
            }
            await updateReturnItem(id as string, {
              name,
              quantity,
              reason,
              stockItemId,
            });
            Alert.alert("Updated", "Return updated and stock adjusted.");
            router.back();
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert("Delete Return", "Do you also want to restore stock?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Only",
        style: "destructive",
        onPress: async () => {
          await deleteReturnItem(id as string);
          Alert.alert("Deleted", "Return deleted (stock unchanged).");
          router.back();
        },
      },
      {
        text: "Delete & Restore",
        style: "destructive",
        onPress: async () => {
          if (stockItemId) {
            const stock = await getStockItem(stockItemId);
            if (stock) {
              await updateStockQuantity(
                stockItemId,
                stock.quantity + originalQuantity
              );
            }
          }
          await deleteReturnItem(id as string);
          Alert.alert("Deleted", "Return deleted and stock restored.");
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" />;
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.label]}>Item Name</Text>
        <TextInput
          style={[styles.input]}
          value={name}
          editable={false}
          placeholder="Item name"
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
        />

        <Text style={[styles.label]}>Quantity</Text>
        <TextInput
          style={[styles.input]}
          value={String(quantity)}
          keyboardType="numeric"
          onChangeText={(val) => setQuantity(Number(val))}
          placeholder="Enter quantity"
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
        />

        <Text style={[styles.label]}>Reason</Text>
        <TextInput
          style={[
            styles.input,
            { height: 80 },
          ]}
          value={reason}
          onChangeText={setReason}
          placeholder="Enter reason"
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
          multiline
        />

        {/* ✅ Buttons Row */}
        <View style={styles.buttonRow}>
          {/* Update Button */}
          <TouchableOpacity
            style={[styles.buttonWrapper, { flex: 1, marginRight: 8 }]}
            activeOpacity={0.85}
            onPress={handleSave}
          >
            <LinearGradient
              colors={["#4CAF50", "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Update</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.buttonWrapper, { flex: 1, marginLeft: 8 }]}
            activeOpacity={0.85}
            onPress={handleDelete}
          >
            <LinearGradient
              colors={["#d9534f", "#c9302c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    gap: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonWrapper: { flex: 1 },
  gradientButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});

export default EditReturnScreen;
