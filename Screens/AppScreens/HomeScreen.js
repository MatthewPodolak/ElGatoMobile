import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationMenu from '../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../Styles/GlobalStyles';

import WaterContainer from '../../Components/Main/WaterContainer';

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
        <View style={[GlobalStyles.flex, styles.paddingBorder]}>

          <View style={styles.row}>
              <View style={styles.block}>
                <WaterContainer initialValue={40}/>
              </View>
          </View>

        </View>

      <NavigationMenu navigation={navigation} currentScreen="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  paddingBorder: {
    padding: 10,
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    height: '180',
    justifyContent: 'space-between',
  },
  block: {
    width: '49%',
    height: '100%',
  },


});

export default HomeScreen;
