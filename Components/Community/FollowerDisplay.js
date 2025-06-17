import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import CommunityDataService from '../../Services/ApiCalls/CommunityData/CommunityDataService';
import { GlobalStyles } from '../../Styles/GlobalStyles';

const FollowerDisplay = ({ data, setIsAuthenticated, navigation, isRequest = false, onRequestDecission = null, requestId = null }) => {

  const [isFollowing, setIsFollowing] = useState(data.isFollowed??false);
  const userPfp = data.pfpUrl? {uri: `http://192.168.0.143:5094${data.pfpUrl}`} : require('../../assets/userPfpBase.png');

  const onToggleFollow = () => {
    setIsFollowing((prev) => !prev)
    if(isFollowing){
        try{
            CommunityDataService.unfollowUser(setIsAuthenticated, navigation, data.userId);
        }catch(error){
            setIsFollowing((prev) => !prev)
        }
    }else{
        try{
            CommunityDataService.followUser(setIsAuthenticated, navigation, data.userId);
        }catch(error){
            setIsFollowing((prev) => !prev)
        }
    }
  };

  const goToTheProfile = () => {
    if(data?.userId == null){
      return;
    }

    navigation?.push('ProfileDisplay', {
      userId: data?.userId
    });
   };

  return (
    <View style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <TouchableOpacity activeOpacity={1} onPress={() => goToTheProfile()}>
            <BlurView style={styles.glassEffect} intensity={125} tint="light">
            
            <View style={styles.profilePictureContainer}>
                <View style={styles.avatarWrapper}>
                <Image
                    source={userPfp}
                    style={styles.avatarImage}
                    resizeMode="cover"
                />
                </View>
            </View>

            <View style={styles.dataContainer}>
                <Text style={[GlobalStyles.text16, GlobalStyles.textShadow]} numberOfLines={1} ellipsizeMode="tail"> {data.name} </Text>
                {isRequest ? (
                  <>
                    <View style={[styles.requestButtonsContainer]}>
                        <TouchableOpacity style={[styles.requestButtonDecline]} onPress={() => onRequestDecission(0, requestId, data?.userId)}>
                          <Text style={[GlobalStyles.text14, GlobalStyles.orange]}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.requestButtonAccept]} onPress={() => onRequestDecission(1, requestId, data?.userId)}>
                          <Text style={[GlobalStyles.text14, GlobalStyles.white]}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                  </>
                ):(
                  <TouchableOpacity style={[styles.followButton, isFollowing && styles.followingButton]} onPress={onToggleFollow}>
                    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>{isFollowing ? 'Following' : 'Follow'}</Text>
                  </TouchableOpacity>
                )}
            </View>

            </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  glassEffect: {
    width: '90%',
    minWidth: '95%',
    marginLeft: '2.5%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePictureContainer: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  dataContainer: {
    flex: 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 5,
  },
  nameText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 10,
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FF8303',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF8303',
  },
  followingButtonText: {
    color: '#FF8303',
  },

  requestButtonsContainer: {
    flexDirection: 'column',
    gap: 5,
  },
  requestButtonAccept: {
    paddingVertical: 2,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#FF8303',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonDecline: {
    paddingVertical: 2,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderColor: '#FF8303',
    backgroundColor: 'whitesmoke',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FollowerDisplay;