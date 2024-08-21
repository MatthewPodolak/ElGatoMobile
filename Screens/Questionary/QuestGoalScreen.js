import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';

function QuestGoalScreen({ navigation }) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    AsyncStorage.setItem('questGoal', answer);
    navigation.navigate('QuestGender');
  };

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('QuestHeight');
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
          <View style={[questStyles.progressBar, {width: '48%'}]}></View>
        </View>
      </View>
      <View style={styles.questionHeaderContainer}>
        <Text style={questStyles.questionaryText}>What is your goal?</Text>
      </View>
      <View style={styles.questionaryAnswerSection}>
        <Pressable
          style={[
            questStyles.optionLong,
            answer === '1' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('1')}
        >
          <View style={styles.optionImageContainer}></View>
          <Text style={questStyles.optionTextLong}>Lose Weight</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.optionLong,
            answer === '2' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('2')}
        >
          <View style={styles.optionImageContainer}></View>
          <Text style={questStyles.optionTextLong}>Build Muscle</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.optionLong,
            answer === '3' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('3')}
        >
          <View style={styles.optionImageContainer}></View>
          <Text style={questStyles.optionTextLong}>Maintain weight</Text>
        </Pressable>
      </View>
      <Pressable style={questStyles.nextButton} onPress={nextPress}>
        <Text style={questStyles.nextButtonText}>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  questionHeaderContainer: {
    width: '100%',
    height: '20%',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  questionaryAnswerSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  optionImageContainer: {
    width: 75,
    height: 75,
    backgroundColor: '#000',
  },
});

export default QuestGoalScreen;
