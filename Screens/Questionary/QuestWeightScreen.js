import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';


function QuestWeightScreen({navigation}) {
    const [answer, setAnswer] = useState('');

    const nextPress = () => {
      if(answer){
        AsyncStorage.setItem('questWeight', answer);
        navigation.navigate('QuestHeight');
      }
      //notif
    };

    const backPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('QuestAge');
          }       
      };
   
      return (
        <SafeAreaView style={questStyles.container}>
          <View style={questStyles.topContainer}>
            <Pressable onPress={backPress}>
              <Image source={BackArrow} style={questStyles.questionaryBackImg} />
            </Pressable>  
            <View style={questStyles.progressBarContainer}>
            <View style={[questStyles.progressBar, {width: '32%'}]}></View>
            </View>
          </View>
          <View style={questStyles.questionHeaderContainer}>
            <Text style={questStyles.questionaryText}>How much do you currently weight?</Text>
          </View>
          <View style={questStyles.questionaryAnswerSectionField}>
            <TextInput
              style={questStyles.input}
              placeholder="Weight"
              keyboardType='numeric'
              selectionColor="#FF8303"
              placeholderTextColor="#999"
              onChangeText={(text) => setAnswer(text)}
              value={answer}
            />
          </View>
          <Pressable style={[
            questStyles.nextButton,
            !answer && questStyles.disabledNextButton,
          ]} onPress={nextPress}>
            <Text style={questStyles.nextButtonText}>Next</Text>
          </Pressable>
        </SafeAreaView>
      );
    }
    
export default QuestWeightScreen;
