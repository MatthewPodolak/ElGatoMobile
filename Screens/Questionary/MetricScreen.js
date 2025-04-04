import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import MetricImg from '../../assets/Questionary/metric.png'; 
import ImperialImg from '../../assets/Questionary/imperial.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';

function MetricScreen({ navigation }) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    if(answer){
      AsyncStorage.setItem('metric', answer);
      navigation.navigate('Register');
    }else{
      //notif
    }
  };

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Start');
    }
  };

  const handleOptionPress = (value) => {
    setAnswer(value);
  };

  return (
    <SafeAreaView style={questStyles.container}>
      <View style={questStyles.topContainer}>
        <Pressable onPress={backPress}>
          <Image source={BackArrow} style={questStyles.questionaryBackImg} />
        </Pressable>
        <View style={questStyles.progressBarContainer}>
          <View style={questStyles.progressBar}></View>
        </View>
      </View>
      <View style={questStyles.questionHeaderContainer}>
        <Text style={questStyles.questionaryText}>Which system do you prefer?</Text>
      </View>
      <View style={questStyles.questionaryAnswerSection}>
        <Pressable
          style={[
            questStyles.option,
            answer === '1' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('1')}
        >
          <Image source={MetricImg} style={questStyles.optionImage} />
          <Text style={questStyles.optionText}>Metric</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.option,
            answer === '0' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('0')}
        >
          <Image source={ImperialImg} style={questStyles.optionImage} />
          <Text style={questStyles.optionText}>Freedom</Text>
        </Pressable>
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

export default MetricScreen;
