import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';

function QuestHightScreen({ navigation }) {
    const [answer, setAnswer] = useState('');
    const [feet, setFeet] = useState('');
    const [inches, setInches] = useState('');
    const [isMetric, setIsMetric] = useState(true);

    useEffect(() => {
        const fetchMetricSetting = async () => {
            const metricValue = await AsyncStorage.getItem('metric');
            setIsMetric(metricValue !== '0');
        };

        fetchMetricSetting();
    }, []);

    let height = isMetric ? answer : `${feet}'${inches}"`;

    const nextPress = () => {
        if(height){
            AsyncStorage.setItem('questHeight', height);
            navigation.navigate('QuestGoal');
        }
    };

    const backPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('QuestWeight');
        }
    };

    const isDisabled = isMetric ? !answer : !feet || !inches;

    return (
        <SafeAreaView style={questStyles.container}>
            <View style={questStyles.topContainer}>
                <Pressable onPress={backPress}>
                    <Image source={BackArrow} style={questStyles.questionaryBackImg} />
                </Pressable>
                <View style={questStyles.progressBarContainer}>
                    <View style={[questStyles.progressBar, {width: '40%'}]}></View>
                </View>
            </View>
            <View style={questStyles.questionHeaderContainer}>
                <Text style={questStyles.questionaryText}>How tall are you?</Text>
            </View>
            <View style={styles.questionaryAnswerSection}>
                {isMetric ? (
                    <TextInput
                        style={questStyles.input}
                        placeholder="Height (cm)"
                        onChangeText={(text) => setAnswer(text)}
                        value={answer}
                        keyboardType='numeric'
                        selectionColor="#FF8303"
                        placeholderTextColor="#999"
                    />
                ) : (
                    <View style={styles.imperialContainer}>
                        <TextInput
                            style={[questStyles.input, styles.feetInput]}
                            placeholder="Feet"
                            keyboardType='numeric'
                            selectionColor="#FF8303"
                            placeholderTextColor="#999"
                            onChangeText={(text) => setFeet(text)}
                            value={feet}
                        />
                        <TextInput
                            style={[questStyles.input, styles.inchesInput]}
                            placeholder="Inches"
                            placeholderTextColor="#999"
                            keyboardType='numeric'
                            selectionColor="#FF8303"
                            onChangeText={(text) => setInches(text)}
                            value={inches}
                        />
                    </View>
                )}
            </View>
            <Pressable 
                style={[
                    questStyles.nextButton,
                    isDisabled && questStyles.disabledNextButton,
                ]}
                onPress={nextPress}
                disabled={isDisabled}
            >
                <Text style={questStyles.nextButtonText}>Next</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    questionaryAnswerSection: {
        width: '100%',
        paddingHorizontal: 20,
    },
    imperialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    feetInput: {
        flex: 1,
        marginRight: 10,
    },
    inchesInput: {
        flex: 1,
    },
});

export default QuestHightScreen;
