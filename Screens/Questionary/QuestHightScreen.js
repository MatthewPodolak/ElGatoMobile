import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';

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

    const nextPress = () => {
        let height = answer;

        if (!isMetric) {
            height = `${feet}'${inches}"`;
        }

        AsyncStorage.setItem('questHight', height);
        navigation.navigate('QuestGoal');
    };

    const backPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('QuestWeight');
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
                <Text style={styles.questionaryText}>HOW MUCH IS YOUR HEIGHT?</Text>
            </View>
            <View style={styles.questionaryAnswerSection}>
                {isMetric ? (
                    <TextInput
                        style={styles.input}
                        placeholder="Height (cm)"
                        placeholderTextColor="#ccc"
                        onChangeText={(text) => setAnswer(text)}
                        value={answer}
                        keyboardType="numeric"
                    />
                ) : (
                    <View style={styles.imperialContainer}>
                        <TextInput
                            style={[styles.input, styles.feetInput]}
                            placeholder="Feet"
                            placeholderTextColor="#ccc"
                            onChangeText={(text) => setFeet(text)}
                            value={feet}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={[styles.input, styles.inchesInput]}
                            placeholder="Inches"
                            placeholderTextColor="#ccc"
                            onChangeText={(text) => setInches(text)}
                            value={inches}
                            keyboardType="numeric"
                        />
                    </View>
                )}
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
        width: '40%',
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
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
        color: 'white',
        borderColor: 'gray',
        backgroundColor: '#333',
        marginBottom: 20,
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

export default QuestHightScreen;
