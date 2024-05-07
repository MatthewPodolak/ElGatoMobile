import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text>Register Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default RegisterScreen;
