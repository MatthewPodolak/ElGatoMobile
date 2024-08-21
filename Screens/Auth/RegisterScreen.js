import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';


function RegisterScreen({navigation}) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    AsyncStorage.setItem('questName', answer);
    navigation.navigate('QuestAge');
    AsyncStorage.removeItem('finalQuestEmailError');
  };

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Start');
    }  
  };

  return (
    <SafeAreaView style={questStyles.container}>
      <View style={questStyles.topContainer}>
        <Pressable onPress={backPress}>
          <Image source={BackArrow} style={questStyles.questionaryBackImg} />
        </Pressable>  
        <View style={questStyles.progressBarContainer}>
        <View style={[questStyles.progressBar, {width: '16%'}]}></View>
        </View>
      </View>
      <View style={questStyles.questionHeaderContainer}>
        <Text style={questStyles.questionaryText}>What's your name?</Text>
      </View>
      <View style={questStyles.questionaryAnswerSectionField}>
        <TextInput
          style={questStyles.input}
          placeholder="Name"
          placeholderTextColor="#999"
          selectionColor="#FF8303"
          onChangeText={(text) => setAnswer(text)}
          value={answer}
        />
      </View>
      <Pressable style={questStyles.nextButton} onPress={nextPress}>
        <Text style={questStyles.nextButtonText}>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default RegisterScreen;
