import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import ManImage from '../../assets/Questionary/man.png'; 
import FemaleImage from '../../assets/Questionary/woman.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';


function QuestJobTypeScreen({ navigation }) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    AsyncStorage.setItem('questJob', answer);
    navigation.navigate('Credentials');
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
          <View style={[questStyles.progressBar, {width: '96%'}]}></View>
        </View>
      </View>
      <View style={styles.questionHeaderContainer}>
        <Text style={questStyles.questionaryText}>What's describing your daily job best?</Text>
      </View>
      <View style={styles.questionaryAnswerSection}>
        <View style={styles.row}>
          <Pressable
            style={[
              questStyles.option,
              answer === '0' && questStyles.selectedOption,
            ]}
            onPress={() => handleOptionPress('0')}
          >
            <Image source={ManImage} style={questStyles.optionImage} />
            <Text style={questStyles.optionText}>Lekka praca biurowa</Text>
          </Pressable>
          <Pressable
            style={[
              questStyles.option,
              answer === '1' && questStyles.selectedOption,
            ]}
            onPress={() => handleOptionPress('1')}
          >
            <Image source={FemaleImage} style={questStyles.optionImage} />
            <Text style={questStyles.optionText}>Srednio fizyczna</Text>
          </Pressable>
        </View>
        <View style={styles.row}>
          <Pressable
            style={[
              questStyles.option,
              answer === '2' && questStyles.selectedOption,
            ]}
            onPress={() => handleOptionPress('2')}
          >
            <Image source={FemaleImage} style={questStyles.optionImage} />
            <Text style={questStyles.optionText}>Ciezka fizolka</Text>
          </Pressable>
          <Pressable
            style={[
              questStyles.option,
              answer === '3' && questStyles.selectedOption,
            ]}
            onPress={() => handleOptionPress('3')}
          >
            <Image source={FemaleImage} style={questStyles.optionImage} />
            <Text style={questStyles.optionText}>Praca zdalna</Text>
          </Pressable>
        </View>
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
    height: '25%',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  questionaryAnswerSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  option: {
    backgroundColor: '#333',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: '#FF8303',
  },
  genderImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  optionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default QuestJobTypeScreen;
