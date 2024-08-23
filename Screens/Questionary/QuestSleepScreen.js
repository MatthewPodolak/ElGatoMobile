import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';

function QuestSleepScreen({ navigation }) {
  const [answer, setAnswer] = useState('1');

  const nextPress = () => {
    if(answer){
      AsyncStorage.setItem('questSleep', answer);
      navigation.navigate('QuestTraining');
    }
  };

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('QuestBody');
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <SafeAreaView style={questStyles.container}>
      <View style={questStyles.topContainer}>
        <Pressable onPress={backPress}>
          <Image source={BackArrow} style={questStyles.questionaryBackImg} />
        </Pressable>
        <View style={questStyles.progressBarContainer}>
          <View style={[questStyles.progressBar, { width: '72%' }]}></View>
        </View>
      </View>
      <View style={questStyles.questionHeaderContainer}>
        <Text style={questStyles.questionaryText}>How much do you sleep daily?</Text>
      </View>
      <View style={questStyles.questionaryAnswerSection}>
        <ScrollPicker
          dataSource={hours}
          selectedIndex={parseInt(answer) - 1}
          onValueChange={(data, index) => setAnswer(data)}
          wrapperHeight={140}
          itemHeight={100}
          highlightColor="#000"
          highlightBorderWidth={2}
          wrapperBackground="transparent"
          itemTextStyle={{ color: '#000', fontSize: 24 }}  // Larger font size for items
          activeItemTextStyle={{ color: '#FF8303', fontSize: 28, fontWeight: 'bold' }}
        />
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

export default QuestSleepScreen;
