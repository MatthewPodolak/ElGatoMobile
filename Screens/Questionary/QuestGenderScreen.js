import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import ManImage from '../../assets/Questionary/man.png'; 
import FemaleImage from '../../assets/Questionary/woman.png';

function QuestGenderScreen({ navigation }) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    console.log('Answer saved:', answer);
    AsyncStorage.setItem('questGender', answer);
    navigation.navigate('QuestBody');
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
        <Text style={styles.questionaryText}>WHAT IS YOUR GENDER?</Text>
      </View>
      <View style={styles.questionaryAnswerSection}>
        <Pressable
          style={[
            styles.option,
            answer === '0' && styles.selectedOption,
          ]}
          onPress={() => handleOptionPress('0')}
        >
          <Image source={ManImage} style={styles.genderImage} />
          <Text style={styles.optionText}>Man</Text>
        </Pressable>
        <Pressable
          style={[
            styles.option,
            answer === '1' && styles.selectedOption,
          ]}
          onPress={() => handleOptionPress('1')}
        >
          <Image source={FemaleImage} style={styles.genderImage} />
          <Text style={styles.optionText}>Female</Text>
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
    width: '56%',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    position: 'absolute',
    bottom: 20,
    width: '90%',
    backgroundColor: '#FF8303',
    marginBottom: 10,
  },
  registerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuestGenderScreen;
