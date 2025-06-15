import React from 'react';
import { View, SafeAreaView, StyleSheet, StatusBar, Image, TouchableOpacity } from 'react-native';
import SearchSvg from '../../assets/main/Diet/search.svg';

function AccountHeader({ pfp, navigation }) {
    const userPfp = pfp  ? { uri: `http://192.168.0.143:5094${pfp}` } : require('../../assets/userPfpBase.png');

   const ownProfilePress = () => {
    navigation?.navigate('ProfileDisplay');
   };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
      <View style={styles.contentContainer}>
        <View style={styles.leftContainer}>
          <SearchSvg width={26} height={26} fill="#FFF" />
        </View>
        <View style={styles.rightContainer}>
          <TouchableOpacity style={styles.circle} onPress={() => ownProfilePress()}>
            <Image 
                source={userPfp}
              style={styles.image}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  container: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF8303',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  leftContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
});

export default AccountHeader;
