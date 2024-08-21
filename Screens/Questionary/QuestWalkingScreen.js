import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';


function QuestWalkingScreen({ navigation }) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    AsyncStorage.setItem('questWalking', answer);
    navigation.navigate('QuestJob');
  };

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('QuestTraining');
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
          <View style={[questStyles.progressBar, {width: '88%'}]}></View>
        </View>
      </View>
      <View style={styles.questionHeaderContainer}>
        <Text style={questStyles.questionaryText}>How much time daily do you spend on walking?</Text>
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
          <Text style={questStyles.optionTextLong}>0-1</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.optionLong,
            answer === '2' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('2')}
        >
          <View style={styles.optionImageContainer}></View>
          <Text style={questStyles.optionTextLong}>1-2</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.optionLong,
            answer === '3' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('3')}
        >
          <View style={styles.optionImageContainer}></View>
          <Text style={questStyles.optionTextLong}>2-3</Text>
        </Pressable>
        <Pressable
          style={[
            questStyles.optionLong,
            answer === '4' && questStyles.selectedOption,
          ]}
          onPress={() => handleOptionPress('4')}
        >
          <View style={styles.optionImageContainer}></View>
          <Text style={questStyles.optionTextLong}>4+</Text>
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

export default QuestWalkingScreen;
