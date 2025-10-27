import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Header from './Header';

interface ScreenWrapperProps {
  children: React.ReactNode;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
});

export default ScreenWrapper;
