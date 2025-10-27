// app/screens/EditStockItem.tsx
import ScreenWrapper from '@/components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks'; // ✅ Correct import path
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { deleteStockItem, getStockItems, updateStockItem } from '../../../lib/storage';


const EditStockItem: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // ✅ Correct way to get the ID

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [category, setCategory] = useState('');

  const colorScheme = useColorScheme(); // ✅ detect dark/light mode
  const textColor = colorScheme === 'dark' ? '#fff' : '#000'; // ✅ adapt text
  const bgColor = colorScheme === 'dark' ? '#222' : '#fff'; // ✅ adapt field background


  useEffect(() => {
    if (!id) return;
    
    const loadItem = async () => {
      const items = await getStockItems();
      const item = items.find((i) => i.id === id);
      if (item) {
        setName(item.name);
        setQuantity(item.quantity);
        setCategory(item.category);
      }
    };
    loadItem();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) {
      Alert.alert("Error", "Item ID is missing.");
      return;
    }

    const response = await updateStockItem(id as string, {
      name,
      quantity,
      category,
    });

    // const response = await updateStockItem(updatedItem);
    if (response) {
      Alert.alert("Stock Item Updated Successfully");
      router.back();
    } else {
      Alert.alert("Failed to Update Stock Item");
    }
  };

  const handleDelete = async () => {
    await deleteStockItem(id!);
    Alert.alert("Deleted", "Stock deleted.");
    router.replace("/(tabs)/stockList"); // ✅ correct path
  }

  return (
    <ScreenWrapper>
    <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
      <View style={styles.container}>
        {/* Category */}
        <Text style={[styles.label]}>Category</Text>
        <TextInput
          placeholder="Enter category"
          value={category}
          onChangeText={setCategory}
          style={[styles.input]}
        />

        {/* Item Name */}
        <Text style={[styles.label]}>Item Name</Text>
        <TextInput
          placeholder="Enter item name"
          value={name}
          onChangeText={setName}
          style={[styles.input]}
        />

        {/* Quantity */}
        <Text style={[styles.label]}>Quantity</Text>
        <TextInput
          placeholder="Enter quantity"
          value={String(quantity)}
          keyboardType="numeric"
          onChangeText={(text) => setQuantity(Number(text))}
          style={[styles.input]}
        />

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Update</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleDelete}>
            <LinearGradient
              colors={['#d9534f', '#c9302c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    padding: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
    color: '#ccc',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderColor: '#ccc',
    color: '#ccc',
    fontSize: 16,
  },
  buttonGroup: {
    marginTop: 25,
    gap: 15,
  },
  gradientButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden', // ensures gradient stays within rounded corners
    elevation: 5, // subtle shadow (Android)
    shadowColor: '#000', // subtle shadow (iOS)
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

});

export default EditStockItem;
