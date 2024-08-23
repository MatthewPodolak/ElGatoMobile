import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import BackArrow from '../../assets/Questionary/arrow-left.png';
import { questStyles } from '../../Styles/QuestionaryStyles.js';


function CredentialsScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [creedError, setCreedError] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            const getCreedError = async () => {
                setCreedError(await AsyncStorage.getItem('finalQuestEmailError'));
            };
            getCreedError();
        }, [])
    );
    

    const finalPress = async () => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);
    
        if (email && password) {
            if (!hasUpperCase) {
                setCreedError('Password must contain at least one uppercase letter.');
            } else if (!hasNumber) {
                setCreedError('Password must contain at least one number.');
            } else if (!hasSpecialChar) {
                setCreedError('Password must contain at least one special character.');
            } else {
                try {
                    await AsyncStorage.setItem('userEmail', email);
                    await AsyncStorage.setItem('userPassword', password);
                    await AsyncStorage.removeItem('finalQuestEmailError');
                    navigation.navigate('Final');
                } catch (error) {
                    //error
                }
            }
        }
        //notif
    };
    

    const backPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('QuestJobType');
        }
    };

    return (
        <SafeAreaView style={questStyles.container}>
            <View style={questStyles.topContainer}>
                <Pressable onPress={backPress}>
                    <Image source={BackArrow} style={questStyles.questionaryBackImg} />
                </Pressable>
                <View style={questStyles.progressBarContainer}>
                    <View style={[questStyles.progressBar, {width: '100%'}]}></View>
                </View>
            </View>
            <View style={styles.questionaryAnswerSection}>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#ccc"
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Password:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#ccc"
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry
                />
                {creedError ? <Text style={styles.errorText}>{JSON.stringify(creedError)}</Text>
                : null}
            </View>
            <Pressable style={[
                questStyles.nextButton,
                (!email || !password) && questStyles.disabledNextButton,
            ]} onPress={finalPress}>
                <Text style={questStyles.nextButtonText}>Let's get in shape!</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    questionaryAnswerSection: {
        width: '100%',
        paddingHorizontal: 20,
    },
    label: {
        color: '#1B1A17',
        fontSize: 18,
        marginBottom: 5,
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
    errorText: {
        color: 'red',
        fontSize: 22,
        textAlign: 'center',
    },
});

export default CredentialsScreen;
