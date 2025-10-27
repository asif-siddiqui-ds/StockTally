// app/components/GlobalHeader.tsx
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GlobalHeader = ({ options }: any) => {
  const navigation = useNavigation();
  const title = options?.title;

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Entypo name="chevron-left" size={24} color="white" />
      </TouchableOpacity>
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

export default GlobalHeader;
