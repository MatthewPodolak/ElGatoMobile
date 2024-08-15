import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const logout = async (navigation) => {
  try {
    await AsyncStorage.removeItem('jwtToken');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Start' }],
    });
  } catch (error) {
    console.error('Error during logout', error);
  }
};

function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>MAIN APP!!!</Text>
        <Pressable onPress={() => logout(navigation)}>
          <Text>- - - - -</Text>
          <Text>LOG OUT</Text>
          <Text>- - - - -</Text>
        </Pressable>
      </View>
    </SafeAreaView>
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

export default HomeScreen;
