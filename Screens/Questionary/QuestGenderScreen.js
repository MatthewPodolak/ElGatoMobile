import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import ManImage from '../../assets/Questionary/man.png'; 
import FemaleImage from '../../assets/Questionary/woman.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';


function QuestGenderScreen({ navigation }) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    if(answer){
      AsyncStorage.setItem('questGender', answer);
      navigation.navigate('QuestBody');
    }
    //NOTIF
  };

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('QuestGoal');
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
          <View style={[questStyles.progressBar, {width: '56%'}]}></View>
        </View>
      </View>
      <View style={questStyles.questionHeaderContainer}>
        <Text style={questStyles.questionaryText}>WHAT IS YOUR GENDER?</Text>
      </View>
      <View style={questStyles.questionaryAnswerSection}>
        <Pressable
          style={[
            questStyles.option,
            answer === '0' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('0')}
        >
          <Image source={ManImage} style={styles.genderImage} />
          <Text style={questStyles.optionText}>Man</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.option,
            answer === '1' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('1')}
        >
          <Image source={FemaleImage} style={styles.genderImage} />
          <Text style={questStyles.optionText}>Female</Text>
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

const styles = StyleSheet.create({
  genderImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
});

export default QuestGenderScreen;
