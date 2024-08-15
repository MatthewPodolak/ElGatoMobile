import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../assets/Questionary/arrow-left.png';

function CredentialsScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const finalPress = async () => {
        try {
            await AsyncStorage.setItem('userEmail', email);
            await AsyncStorage.setItem('userPassword', password);
            navigation.navigate('Final');
        } catch (error) {
            //throw error
        }
    };

    const backPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('QuestJobType');
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
            </View>
            <Pressable style={styles.button} onPress={finalPress}>
                <Text style={styles.registerText}>Let's get in shape!</Text>
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
        width: '100%', // Set to 24% of the container width
        height: '100%',
        backgroundColor: '#FF8303',
        borderRadius: 5,
    },
    questionaryAnswerSection: {
        width: '100%',
        paddingHorizontal: 20,
    },
    label: {
        color: 'whitesmoke',
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

export default CredentialsScreen;
