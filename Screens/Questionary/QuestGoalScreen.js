import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.questionaryHeaderOptionsContainer}>
        <Pressable onPress={backPress}>
          <Image source={BackArrow} style={styles.questionaryBackImg} />
        </Pressable>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}></View>
        </View>
      </View>
      <View style={styles.questionHeaderContainer}>
        <Text style={styles.questionaryText}>WHAT IS YOUR GOAL?</Text>
      </View>
      <View style={styles.questionaryAnswerSection}>
        <Pressable
          style={[
            styles.option,
            answer === '1' && styles.selectedOption,
          ]}
          onPress={() => handleOptionPress('1')}
        >
          <Text style={styles.optionText}>Lose Weight</Text>
        </Pressable>
        <Pressable
          style={[
            styles.option,
            answer === '2' && styles.selectedOption,
          ]}
          onPress={() => handleOptionPress('2')}
        >
          <Text style={styles.optionText}>Build Muscle</Text>
        </Pressable>
        <Pressable
          style={[
            styles.option,
            answer === '3' && styles.selectedOption,
          ]}
          onPress={() => handleOptionPress('3')}
        >
          <Text style={styles.optionText}>Maintain weight</Text>
        </Pressable>
      </View>
      <Pressable style={styles.button} onPress={nextPress}>
        <Text style={styles.registerText}>Next</Text>
      </Pressable>
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
  questionaryHeaderOptionsContainer: {
    width: '100%',
    height: '10%',
    padding: 20,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionaryBackImg: {
    width: 32,
    height: 32,
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: 'whitesmoke',
    borderRadius: 5,
    marginLeft: 10,
  },
  progressBar: {
    width: '48%',
    height: '100%',
    backgroundColor: '#FF8303',
    borderRadius: 5,
  },
  questionHeaderContainer: {
    width: '100%',
    height: '30%',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  questionaryText: {
    fontSize: 32,
    fontWeight: '600',
    color: 'whitesmoke',
  },
  questionaryAnswerSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#333',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#FF8303',
  },
  optionText: {
    color: 'white',
    fontSize: 18,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    width: '90%',
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#FF8303',
    marginBottom: 10,
  },
  registerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuestGoalScreen;
