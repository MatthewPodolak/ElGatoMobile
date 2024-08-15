import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import BackArrow from '../../assets/Questionary/arrow-left.png';

function QuestSleepScreen({ navigation }) {
  const [answer, setAnswer] = useState('');

  const nextPress = () => {
    AsyncStorage.setItem('questSleep', answer);
    navigation.navigate('QuestTraining');
  };

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('QuestBody');
    }
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
        <Text style={styles.questionaryText}>HOW MUCH DO YOU SLEEP?</Text>
      </View>
      <View style={styles.questionaryAnswerSection}>
        <Picker
          selectedValue={answer}
          style={styles.picker}
          onValueChange={(itemValue) => setAnswer(itemValue)}
        >
          <Picker.Item label="1 hour" value="1" />
          <Picker.Item label="2 hours" value="2" />
          <Picker.Item label="3 hours" value="3" />
          <Picker.Item label="4 hours" value="4" />
          <Picker.Item label="5 hours" value="5" />
          <Picker.Item label="6 hours" value="6" />
          <Picker.Item label="7 hours" value="7" />
          <Picker.Item label="8 hours" value="8" />
          <Picker.Item label="9 hours" value="9" />
          <Picker.Item label="10 hours" value="10" />
          <Picker.Item label="11 hours" value="11" />
          <Picker.Item label="12 hours" value="12" />
        </Picker>
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
    width: '72%',
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
  },
  picker: {
    height: 50,
    width: '100%',
    color: 'white',
    backgroundColor: '#333',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    width: '90%',
    backgroundColor: '#FF8303',
    marginBottom: 10,
    position: 'absolute',
    bottom: 20,
  },
  registerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuestSleepScreen;
