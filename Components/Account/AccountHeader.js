import React, { useEffect, useState, useRef } from 'react';
import { View, SafeAreaView, StyleSheet, StatusBar, Image, TouchableOpacity, TextInput } from 'react-native';
import UserDataService from '../../Services/ApiCalls/UserData/UserDataService';

import SearchSvg from '../../assets/main/Diet/search.svg';
import CloseSvg from '../../assets/main/Diet/x-lg.svg';

function AccountHeader({ pfp, navigation, setIsAuth, onSearchPress, searchState, onSearch }) {
   const [userPfp, setUserPfp] = useState(pfp ? { uri: `http://192.168.0.143:5094${pfp}` } : require('../../assets/userPfpBase.png'));

   const [searchText, setSearchText] = useState('');
   const typingTimeoutRef = useRef(null);

   const onChangeSearchText = text => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setSearchText(text);

    typingTimeoutRef.current = setTimeout(() => {
        onSearch(text);
    }, 500);
   };

   const ownProfilePress = () => {
    navigation?.navigate('ProfileDisplay');
   };

   useEffect(() => {
    getUserPfp();
   }, []);

   const getUserPfp = async () => {
    try{
      const res = await UserDataService.getUserProfilePicture(setIsAuth, navigation);
      if(!res){
        userPfp = require('../../assets/userPfpBase.png');
        return;
      }

      setUserPfp({ uri: `http://192.168.0.143:5094${res}` });

    }catch(error){
      userPfp = require('../../assets/userPfpBase.png');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
      <View style={styles.contentContainer}>
        {searchState ? (
          <TouchableOpacity style={styles.leftContainer} onPress={onSearchPress}>
            <CloseSvg width={24} height={24} fill="#FFF" />
          </TouchableOpacity>
        ):(
          <TouchableOpacity style={styles.leftContainer} onPress={onSearchPress}>
            <SearchSvg width={26} height={26} fill="#FFF" />
          </TouchableOpacity>
        )}

        {searchState && (
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={onChangeSearchText}
            placeholderTextColor="rgba(255,255,255,0.7)"
            autoFocus
            selectionColor="#FF8303"
          />
        )}

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
    position: 'relative',
    zIndex: 10,
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
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFF',
  },
});

export default AccountHeader;
