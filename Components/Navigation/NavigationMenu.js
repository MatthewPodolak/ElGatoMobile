import React from 'react';
import { View, Pressable, StyleSheet, SafeAreaView, Text } from 'react-native';
import HomeIcon from '../../assets/main/Nav/home.svg';
import AccountIcon from '../../assets/main/Nav/account.svg';
import DietIcon from '../../assets/main/Nav/forks.svg';
import TrainingIcon from '../../assets/main/Nav/dumbell.svg';

function NavigationMenu({ navigation, currentScreen }) {
  return (
    <SafeAreaView style={styles.menuContainer}>
        <Pressable
        style={[
          styles.navButton,
          currentScreen === 'Home' ? styles.activeNavButton : null,
        ]}
        onPress={() => navigation.navigate('Home')}
      >
      <View style = {styles.navImgContainer}>
        <HomeIcon width={30} height={30} />
      </View>
      </Pressable>
      <Pressable
        style={[
          styles.navButton,
          currentScreen === 'DietHome' ? styles.activeNavButton : null,
        ]}
        onPress={() => navigation.navigate('DietHome')}
      >
      <View style = {styles.navImgContainer}>
        <DietIcon width={34} height={48} />
      </View>
      </Pressable>
      <Pressable
        style={[
          styles.navButton,
          currentScreen === 'TrainingHome' ? styles.activeNavButton : null,
        ]}
        onPress={() => navigation.navigate('TrainingHome')}
      >
      <View style = {styles.navImgContainer}>
        <TrainingIcon width={30} height={30} />
      </View>
      </Pressable>
      <Pressable
        style={[
          styles.navButton,
          currentScreen === 'AccountHome' ? styles.activeNavButton : null,
        ]}
        onPress={() => navigation.navigate('AccountHome')}
      >
      <View style = {styles.navImgContainer}>
        <AccountIcon width={46} height={34} />
      </View>
      </Pressable>     
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#FF8303',
    width: '100%',
    height: '7%',
    backgroundColor: '#000',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
  },
  activeNavButton: {
    borderBottomColor: '#FF8303',
    borderBottomWidth: 3,
    borderRadius: 5,
  },
  navImgContainer: {
    width: '60%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default NavigationMenu;
