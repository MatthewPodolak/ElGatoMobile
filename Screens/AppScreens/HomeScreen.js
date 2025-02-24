import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationMenu from '../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../Styles/GlobalStyles';

import WaterContainer from '../../Components/Main/WaterContainer';
import NutriContainer from '../../Components/Main/NutriContainer';
import BurntCalorieContainer from '../../Components/Main/BurntCalorieContainer';

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
  let intakeData = {
    protein: 149,
    calories: 985,
    fat: 52,
    carbs: 112,
  };

  let dailyMaxData = {
    protein: 220,
    calories: 3005,
    fat: 129,
    carbs: 300,
  };

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={[GlobalStyles.flex, styles.paddingBorder]}>

          <View style={styles.row}>
            <View style={styles.wideBlockTop}>
              <NutriContainer intakeData={intakeData} dailyMax={dailyMaxData} system={"metric"}/>
            </View>
          </View>

          <View style={styles.row}>
              <View style={styles.block}>
                <BurntCalorieContainer totalBurnt={100} system={"metric"} />
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  block: {
    width: '49%',
    height: '180',
  },
  wideBlockTop: {
    width: '100%',
    height: '200',
  },
});

export default HomeScreen;
