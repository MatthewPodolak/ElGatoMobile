import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlobalStyles } from '../../Styles/GlobalStyles';

const windowWidth = Dimensions.get('window').width;

function ActiveChallenge({ data, system }) {
  const [systemType, setSystemType] = useState(system ?? "metric");

  let typeValue;
  let current = 0;
  let total = 1;
  
  switch(data.challengeData.goalType){
    case "TotalDistanceKm":
      if(systemType === "metric"){
        if(data.challengeData.goalValue >= 100){
            typeValue = "km";
            current = data.currentProgess;
            total = data.challengeData.goalValue;
        }else{
            typeValue = "m";
            current = data.currentProgess * 1000;
            total = data.challengeData.goalValue * 1000;
        }
      }else{
        typeValue = "mi";
        current = (data.currentProgess * 0.621371).toFixed(1);
        total = (data.challengeData.goalValue * 0.621371).toFixed(1);
      }     
      break;
    case "TotalCalories":
      typeValue = systemType === "metric" ? "kcal" : "cal";
      current = data.currentProgess;
      total = data.challengeData.goalValue;
        break;
    case "TotalElevation":
      typeValue = "";
      current = data.currentProgess;
      total = data.challengeData.goalValue;
        break;
    case "TotalActivities":
      typeValue = "";
      current = data.currentProgess;
      total = data.challengeData.goalValue;
        break;
  }

  const progressPercent = (current / total) * 100;

  const endDate = new Date(data.challengeData.endDate);
  const diffTime = endDate - Date.now();
  const endsInValue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <BlurView style={styles.container} intensity={125} tint="light">
      <View style={[styles.left, GlobalStyles.center]}>
        <Image
          style={{ width: 80, height: 80, resizeMode: 'contain' }}
          source={{ uri: 'http://192.168.0.143:5094' + data.challengeData.badge }}
        />
      </View>
      <View style={styles.right}>
        <View style={styles.titleCont}><Text style={[GlobalStyles.text16, GlobalStyles.bold]}>{data.challengeData.name}</Text></View>
        <Text style={GlobalStyles.text12}>{data.challengeData.description}</Text>
        <View style={styles.dataCont}>
          <Text style={GlobalStyles.text13}>{current} / {total} {typeValue}</Text>          
          <Text style={GlobalStyles.text13}>Ends in {endsInValue} days</Text>
        </View>
        <View style={styles.progressBarCont}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({ 
  container: {
    width: windowWidth * 0.9, //this is somehow necessary. Idk, WHY it does not work while trying to set it normally.
    margin: 5,
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
  },

  left:{
    flex: 0.32,
  },
  right:{
    flex: 0.68,
    flexDirection: 'column',
  },
  titleCont:{
    marginTop: 10,
  },
  dataCont: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 10,
  },

  progressBarCont: {
    marginTop: 2,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    width: '95%',
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF8303',
  },
});

export default ActiveChallenge;
