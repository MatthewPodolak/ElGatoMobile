import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationMenu from '../../Components/Navigation/NavigationMenu';

const logout = async (navigation) => {
  try {
    await AsyncStorage.removeItem('jwtToken');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Start' }],
    });
  } catch (error) {
    console.error('Error during logout', error);
    //show
  }
};

function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MAIN APP!!!</Text>
        <Pressable onPress={() => logout(navigation)}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </Pressable>
      </View>
      <NavigationMenu navigation={navigation} currentScreen="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'whitesmoke',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  logoutText: {
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
});

export default HomeScreen;
