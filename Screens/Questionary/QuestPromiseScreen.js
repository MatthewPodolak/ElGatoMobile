import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import ManImage from '../../assets/Questionary/man.png'; 
import FemaleImage from '../../assets/Questionary/woman.png';

function QuestPromiseScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.secondaryText}>GRATULUJE!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 10,
  },
  secondaryText: {
    fontSize: 22,
    color: 'whitesmoke',
  },
});

export default QuestPromiseScreen;
