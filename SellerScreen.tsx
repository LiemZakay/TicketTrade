import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SellerScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Welcome to the Seller Screen!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

