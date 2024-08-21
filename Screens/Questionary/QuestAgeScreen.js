import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';

function QuestAgeScreen({navigation}) {
    const [answer, setAnswer] = useState('');

    const nextPress = () => {
      AsyncStorage.setItem('questAge', answer);
      navigation.navigate('QuestWeight');
    };

    const backPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Register');
          }       
      };

      return (
        <SafeAreaView style={questStyles.container}>
          <View style={questStyles.topContainer}>
            <Pressable onPress={backPress}>
              <Image source={BackArrow} style={questStyles.questionaryBackImg} />
            </Pressable>  
            <View style={questStyles.progressBarContainer}>
              <View style={[questStyles.progressBar, {width: '24%'}]}></View>
            </View>
          </View>
          <View style={questStyles.questionHeaderContainer}>
            <Text style={questStyles.questionaryText}>How old are you?</Text>
          </View>
          <View style={questStyles.questionaryAnswerSectionField}>
            <TextInput
              style={questStyles.input}
              placeholder="Age"
              keyboardType='numeric'
              selectionColor="#FF8303"
              placeholderTextColor="#999"
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
    
export default QuestAgeScreen;
