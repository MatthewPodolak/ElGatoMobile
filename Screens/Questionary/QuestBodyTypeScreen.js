import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';


function QuestBodyTypeScreen({ navigation }) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    AsyncStorage.setItem('questBody', answer);
    navigation.navigate('QuestSleep');
  };

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('QuestGender');
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
          <View style={[questStyles.progressBar, {width: '64%'}]}></View>
        </View>
      </View>
      <View style={styles.questionHeaderContainer}>
        <Text style={questStyles.questionaryText}>What is your's body type?</Text>
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
          <Text style={questStyles.optionTextLong}>Ectomorphic</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.optionLong,
            answer === '2' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('2')}
        >
          <View style={styles.optionImageContainer}></View>
          <Text style={questStyles.optionTextLong}>Endomorphic</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.optionLong,
            answer === '3' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('3')}
        >
          <View style={styles.optionImageContainer}></View>
          <Text style={questStyles.optionTextLong}>Mesomorphic</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.optionLong,
            answer === '4' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('4')}
        >
          <View style={styles.optionImageContainer}></View>
          <Text style={questStyles.optionTextLong}>I don't know ;C</Text>
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
    height: '15%',
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

export default QuestBodyTypeScreen;
