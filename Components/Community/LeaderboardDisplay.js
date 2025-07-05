import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlobalStyles } from '../../Styles/GlobalStyles';

const LeaderboardDisplay = ({ data, type, isMetric = true, navigation }) => {

  const userPfp = data?.userData?.pfp? {uri: `http://192.168.0.143:5094${data.userData.pfp}`} : require('../../assets/userPfpBase.png');
  const userNickname = data?.userData?.name ?? "Unknown";
  const leadValue = data?.value ?? 0;
  const position = data?.leaderboardPosition;

  let medalStyle = {};
  if (position === 1) {
    medalStyle = {
      borderColor: '#FFD700',
      backgroundColor: 'rgba(255,215,0,0.3)',
      width: '90%',
      minWidth: '95%',
      borderWidth: 2, 
      marginLeft: '2.5%',
    };
  } else if (position === 2) {
    medalStyle = {
      borderColor: '#B0B0B0',
      borderWidth: 2.5, 
      backgroundColor: 'rgba(192,192,192,0.5)',
      width: '90%',
      minWidth: '93%',
      marginLeft: '3.5%',
    };
  } else if (position === 3) {
    medalStyle = {
      borderColor: '#CD7F32',
      backgroundColor: 'rgba(205,127,50,0.3)',
      width: '90%',
      minWidth: '92%',
      marginLeft: '4%',
      borderWidth: 2, 
    };
  } else{
    medalStyle = {
      borderColor: 'rgba(0, 0, 0, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      width: '90%',
      minWidth: '90%',
      marginLeft: '5%',
    };
  }
  const labels = {
    0: 'Calories burnt',
    1: 'Activities',
    2: 'Steps',
  };
  const metricLabel = labels[type] || '';
  const isCardio = type === "Running" || type === "Swimming";
  const isGym = type === "Benchpress" || type === "Deadlift" || type === "Squats";

  const goToTheProfile = () => {
    if(data?.userData?.userId == null){
      return;
    }

    navigation?.navigate('ProfileDisplay', {
      userId: data?.userData?.userId ?? null
    });
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <TouchableOpacity activeOpacity={1} onPress={() => goToTheProfile()}>
            <BlurView style={[styles.glassEffect, medalStyle]} intensity={125} tint="light">
            
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
              <View style={styles.nameContainer}>
                <Text style={[GlobalStyles.text16, GlobalStyles.textShadow]} numberOfLines={1} ellipsizeMode="tail"> {userNickname} </Text>
                {/* {isCardio && (
                  <Text style={[{alignSelf: 'center', marginRight: 12},GlobalStyles.text14, GlobalStyles.bold, GlobalStyles.textShadow, GlobalStyles.orange]}>
                    {data?.cardioSpecific?.exerciseDate}
                  </Text>
                )} */}
              </View>
              <View style={styles.dataDisplayContainer}>
                {isCardio ? (
                  <View style={styles.cardioContainer}>
                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={GlobalStyles.text12}>Avg. speed</Text>
                        <Text style={[GlobalStyles.text16, GlobalStyles.bold, GlobalStyles.textShadow]}> {isMetric ? data?.cardioSpecific?.speedKmh : data?.cardioSpecific?.speedMph}{' '} <Text style={GlobalStyles.text12}>{isMetric ? 'km/h' : 'mph'}</Text></Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={GlobalStyles.text12}>Distance</Text>
                        <Text style={[GlobalStyles.text16, GlobalStyles.bold, GlobalStyles.textShadow]}> {(isMetric ? data?.cardioSpecific?.distanceKm : data?.cardioSpecific?.distanceMiles)?.toFixed(2)}{' '} <Text style={GlobalStyles.text12}>{isMetric ? 'km' : 'mi'}</Text></Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={GlobalStyles.text12}>Time</Text>
                        <Text style={[GlobalStyles.text16, GlobalStyles.bold, GlobalStyles.textShadow]}>
                          {(() => {
                            const t = data?.cardioSpecific?.time ?? ""
                            return t.startsWith("00:") ? t.slice(3) : t
                          })()}
                        </Text>
                      </View>
                    </View>            
                  </View>
                ) : isGym ? (
                  <>
                    <Text style={[GlobalStyles.text18, GlobalStyles.orange, GlobalStyles.textShadow]}>{(isMetric ? data?.gymSpecific?.weightKg : data?.gymSpecific?.weightLbs)?.toFixed(2)}{' '}<Text style={[GlobalStyles.black, GlobalStyles.text14]}>{isMetric ? 'kg' : 'lbs'} x </Text>{data?.gymSpecific?.repetitions}<Text style={[GlobalStyles.black, GlobalStyles.text14]}> reps</Text></Text>
                  </>
                ): (
                  <Text style={[GlobalStyles.text18, GlobalStyles.bold, GlobalStyles.textShadow, GlobalStyles.orange]} numberOfLines={1} ellipsizeMode="tail"> {leadValue} <Text style={[GlobalStyles.text14, GlobalStyles.black]}>{metricLabel}</Text></Text>
                )}
              </View>
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
    marginBottom: 10,
    padding: 10,
    borderRadius: 20,
    overflow: 'hidden',   
    borderWidth: 1,
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
    paddingLeft: 5,
  },

  nameContainer:{
    flex: 0.2,
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  dataDisplayContainer:{
    flex: 0.8,
  },

  cardioContainer: {
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  item: {
    flex: 0.48,
    alignItems: 'center',
  },
});

export default LeaderboardDisplay;