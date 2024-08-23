import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import ManImage from '../../assets/Questionary/man.png'; 
import FemaleImage from '../../assets/Questionary/woman.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';


function QuestTrainingDaysScreen({ navigation }) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    if(answer){
      AsyncStorage.setItem('questTrainingDays', answer);
      navigation.navigate('QuestWalking');
    }
  };

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('QuestSleep');
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
          <View style={[questStyles.progressBar, {width: '80%'}]}></View>
        </View>
      </View>
      <View style={questStyles.questionHeaderContainer}>
        <Text style={questStyles.questionaryText}>How many days per week do you train?</Text>
      </View>
      <View style={questStyles.questionaryAnswerSection}>
        <Pressable
          style={[
            questStyles.option,
            answer === '0' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('0')}
        >
          <Image source={ManImage} style={questStyles.optionImage} />
          <Text style={questStyles.optionText}>1-2</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.option,
            answer === '1' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('1')}
        >
          <Image source={FemaleImage} style={questStyles.optionImage} />
          <Text style={questStyles.optionText}>3-4</Text>
        </Pressable>
      </View>
      <View style={questStyles.questionaryAnswerSection}>
        <Pressable
          style={[
            questStyles.option,
            answer === '2' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('2')}
        >
          <Image source={ManImage} style={questStyles.optionImage} />
          <Text style={questStyles.optionText}>4-5</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.option,
            answer === '3' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('3')}
        >
          <Image source={FemaleImage} style={questStyles.optionImage} />
          <Text style={questStyles.optionText}>6-7</Text>
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

export default QuestTrainingDaysScreen;
