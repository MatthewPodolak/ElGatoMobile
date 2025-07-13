import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { questStyles } from '../../Styles/QuestionaryStyles.js';
import { GlobalStyles } from '../../Styles/GlobalStyles.js';

import BackArrow from '../../assets/Questionary/arrow-left.png';
import MetricImg from '../../assets/Questionary/metric.png'; 
import ImperialImg from '../../assets/Questionary/imperial.png';
import ManImage from '../../assets/Questionary/man.png'; 
import FemaleImage from '../../assets/Questionary/woman.png';

function QuestionaryScreen({ navigation }) {
    const questData = [
        { id: 0, field: 'Metric', question: 'Which system do you prefer?' },
        { id: 1, field: 'Name', question: 'What is your name?' },
        { id: 2, field: 'Age', question: 'Your age?' },
        { id: 3, field: 'Weight', question: 'Your current weight?' },
        { id: 4, field: 'Height', question: 'Your height?' },
        { id: 5, field: 'Gender', question: 'Your gender?' },
        { id: 6, field: 'Goal', question: 'Main goal?' },
        { id: 7, field: 'Sleep', question: 'How much daily do you sleep?' },
        { id: 8, field: 'BodyType', question: 'Your gorgeous body type?' },
        { id: 9, field: 'WalkingDaily', question: 'Time spend on walking daily?' },
        { id: 10, field: 'TrainingDays', question: 'Training days per week?' },
        { id: 11, field: 'JobType', question: 'What is your job type?' },
    ];

    const [answers, setAnswers] = useState(questData.map(item => ({ id: item.id, ans: null })));
    const [currentProgress, setCurrentProgress] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [errorMsg, setErrorMsg] = useState(null);

    const [feet, setFeet] = useState(null);
    const [inches, setInches] = useState(null);

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    const backPress = () => {
        if(currentQuestion > 0){
            setCurrentQuestion((currentQuestion - 1));
            setCurrentProgress(currentProgress - 9);
            return;
        }

        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const nextPress = () => {
        if(!currentAnswer) { return; }
        if(currentQuestion === 11){
            const updated = [...answers];
            updated[currentQuestion] = {
                ...updated[currentQuestion],
                ans: currentAnswer
            };

            setAnswers(updated);

            navigation.navigate('QuestionaryFinalization', {
                questionaryData: updated
            });

            return;
        }

        setErrorMsg(null);

        if(currentQuestion === 1){
            if(!(/^[A-Za-z0-9_ ]+$/.test(currentAnswer))){
                setErrorMsg("Invalid name, only special char allowed is _");
                return;
            }
        }

        if(currentQuestion === 2){
            if (!/^\d+$/.test(currentAnswer)) {
                setErrorMsg("This ain't age. Numbers only.");
                return;
            }

            const age = parseInt(currentAnswer, 10);
            if (age < 16 || age > 90) {
                setErrorMsg("That does not fit our policy.");
                return;
            }
        }

        if (currentQuestion === 3) {
            if(!/^[\d]+([.,]\d+)?$/.test(currentAnswer)){
                setErrorMsg("Are you sure???");
                return;
            }
        }

        if (currentQuestion === 4) {
            if (!/^(\d+)'\s*(\d+)"$/.test(currentAnswer) && (answers[0].ans === "0")) {
                setErrorMsg("This won't do.");
                return;
            }

            if (!/^\d+$/.test(currentAnswer) && (answers[0].ans === "1")) {
                setErrorMsg("Must be a whole number.");
                return;
            }
        }

        setAnswers(prev => {
            const copy = [...prev];
            copy[currentQuestion] = { ...copy[currentQuestion], ans: currentAnswer };
            return copy;
        });
        setCurrentAnswer(null);
        setCurrentQuestion((currentQuestion + 1));
        setCurrentProgress(currentProgress + 9);
    };

    useEffect(() => {
        if(feet && inches){
            setCurrentAnswer(`${feet}'${inches}"`);
        }
    }, [feet, inches]);

    const generateQuestionContent = () => {
        switch(currentQuestion){
            case 0:
                return(
                    <>
                        <View style={{height: 150}}></View>
                        <View style={questStyles.questionaryAnswerSection}>
                            <TouchableOpacity
                              style={[
                                questStyles.option,
                                currentAnswer === '1' && questStyles.selectedOption,
                              ]}
                              onPress={() => setCurrentAnswer('1')}
                            >
                              <Image source={MetricImg} style={[questStyles.optionImage, {width: "70%"}]} />
                              <Text style={questStyles.optionText}>Normal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                questStyles.option,
                                currentAnswer === '0' && questStyles.selectedOption,
                              ]}
                              onPress={() => setCurrentAnswer('0')}
                            >
                              <Image source={ImperialImg} style={[questStyles.optionImage, {width: "70%"}]} />
                              <Text style={questStyles.optionText}>Gooofy</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );
            case 1:
                return (
                    <>
                        <View style={{height: 150}}></View>
                        <View style={questStyles.questionaryAnswerSectionField}>
                            <TextInput
                                style={questStyles.input}
                                placeholder="Name"
                                placeholderTextColor="#999"
                                selectionColor="#FF8303"
                                onChangeText={text => ( setErrorMsg(null), setCurrentAnswer(text) )}
                                value={currentAnswer}
                            />
                        </View>
                        {errorMsg && (
                            <Text style={[GlobalStyles.text14, GlobalStyles.red, {textAlign: 'center', marginTop: 20}]}>{errorMsg}</Text>
                        )}
                    </>
                );
            case 2:
                return(
                    <>
                        <View style={{height: 150}}></View>
                        <View style={questStyles.questionaryAnswerSectionField}>
                            <TextInput
                                style={questStyles.input}
                                placeholder="Age"
                                keyboardType='numeric'
                                placeholderTextColor="#999"
                                selectionColor="#FF8303"
                                onChangeText={text => ( setErrorMsg(null), setCurrentAnswer(text) )}
                                value={currentAnswer}
                            />
                        </View>
                        {errorMsg && (
                            <Text style={[GlobalStyles.text14, GlobalStyles.red, {textAlign: 'center', marginTop: 20}]}>{errorMsg}</Text>
                        )}
                    </>
                );
            case 3:
                return(
                    <>
                        <View style={{height: 150}}></View>
                        <View style={[questStyles.questionaryAnswerSectionField, {flexDirection: 'row'}, GlobalStyles.center]}>
                            <TextInput
                                style={[questStyles.input, {width: '90%'}]}
                                placeholder="Weight"
                                keyboardType='numeric'
                                placeholderTextColor="#999"
                                selectionColor="#FF8303"
                                onChangeText={text => ( setErrorMsg(null), setCurrentAnswer(text) )}
                                value={currentAnswer}
                            />
                            <Text style= {[GlobalStyles.text32, GlobalStyles.bold]}>{answers[0].ans === "0" ? "lbs" : "kg"}</Text>
                        </View>
                        {errorMsg && (
                            <Text style={[GlobalStyles.text14, GlobalStyles.red, {textAlign: 'center', marginTop: 20}]}>{errorMsg}</Text>
                        )}
                    </>
                );
            case 4:
                return (
                    <>
                        {(answers[0].ans === "1") ? (
                            <>
                                <View style={{height: 150}}></View>
                                <View style={[questStyles.questionaryAnswerSectionField, {flexDirection: 'row'}, GlobalStyles.center]}>
                                    <TextInput
                                        style={[questStyles.input, {width: '90%'}]}
                                        placeholder="Height"
                                        onChangeText={(text) => setCurrentAnswer(text)}
                                        value={currentAnswer}
                                        keyboardType='numeric'
                                        selectionColor="#FF8303"
                                        placeholderTextColor="#999"
                                    />
                                    <Text style= {[GlobalStyles.text32, GlobalStyles.bold]}>cm</Text>
                                </View>
                                {errorMsg && (
                                    <Text style={[GlobalStyles.text14, GlobalStyles.red, {textAlign: 'center', marginTop: 20}]}>{errorMsg}</Text>
                                )}
                            </>
                        ):(
                            <>
                                <View style={{height: 150}}></View>
                                <View style={[questStyles.questionaryAnswerSectionField, {flexDirection: 'row'}, GlobalStyles.center]}>
                                    <TextInput
                                        style={[questStyles.input, {width: '45%'}]}
                                        placeholder="Feet"
                                        keyboardType='numeric'
                                        selectionColor="#FF8303"
                                        placeholderTextColor="#999"
                                        onChangeText={(text) => setFeet(text)}
                                        value={feet}
                                    />
                                    <Text style= {[GlobalStyles.text32, GlobalStyles.bold]}>ft</Text>
                                    <TextInput
                                        style={[questStyles.input, {width: '45%'}]}
                                        placeholder="Inches"
                                        placeholderTextColor="#999"
                                        keyboardType='numeric'
                                        selectionColor="#FF8303"
                                        onChangeText={(text) => setInches(text)}
                                        value={inches}
                                    />
                                    <Text style= {[GlobalStyles.text32, GlobalStyles.bold]}>in</Text>
                                </View>
                                {errorMsg && (
                                    <Text style={[GlobalStyles.text14, GlobalStyles.red, {textAlign: 'center', marginTop: 20}]}>{errorMsg}</Text>
                                )}
                            </>
                        )}
                    </>
                );
            case 5:
                return(
                    <>
                            <View style={{height: 150}}></View>
                            <View style={questStyles.questionaryAnswerSection}>
                                <TouchableOpacity
                                  style={[
                                    questStyles.option,
                                    currentAnswer === '0' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('0')}
                                >
                                  <Image source={ManImage} style={[questStyles.genderImage, { width: 48, height: 48 }]} resizeMode="contain"/>
                                  <Text style={questStyles.optionText}>Man</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    questStyles.option,
                                    currentAnswer === '1' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('1')}
                                >
                                  <Image source={FemaleImage} style={questStyles.genderImage} />
                                  <Text style={questStyles.optionText}>Female</Text>
                                </TouchableOpacity>
                            </View>
                    </>
                );
            case 6:
                return(
                    <>
                        <View style={{height: 100}}></View>
                        <View style={[questStyles.questionaryAnswerSection, {flexDirection: 'column'}]}>
                            <TouchableOpacity
                                style={[
                                    questStyles.optionLong,
                                    currentAnswer === '1' && questStyles.selectedOption,
                                ]}
                                onPress={() => setCurrentAnswer('1')}
                            >
                            <View style={questStyles.optionImageContainer}></View>
                            <Text style={questStyles.optionTextLong}>Lose Weight</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    questStyles.optionLong,
                                    currentAnswer === '2' && questStyles.selectedOption,
                                ]}
                                onPress={() => setCurrentAnswer('2')}
                            >
                            <View style={questStyles.optionImageContainer}></View>
                            <Text style={questStyles.optionTextLong}>Build Muscle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    questStyles.optionLong,
                                    currentAnswer === '3' && questStyles.selectedOption,
                                ]}
                                onPress={() => setCurrentAnswer('3')}
                            >
                            <View style={questStyles.optionImageContainer}></View>
                            <Text style={questStyles.optionTextLong}>Maintain weight</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );
            case 7:
                return (
                    <>
                     <View style={{height: 150}}></View>
                        <View style={questStyles.questionaryAnswerSection}>
                            <ScrollPicker
                                dataSource={hours}
                                selectedIndex={parseInt(currentAnswer) - 1}
                                onValueChange={(data, index) => setCurrentAnswer(data)}
                                wrapperHeight={140}
                                itemHeight={100}
                                highlightColor="#000"
                                highlightBorderWidth={2}
                                wrapperBackground="transparent"
                                itemTextStyle={{ color: '#000', fontSize: 24 }}
                                activeItemTextStyle={{ color: '#FF8303', fontSize: 28, fontWeight: 'bold' }}
                            />
                        </View>
                    </>
                );
            case 8:
                return (
                    <>
                        <View style={[questStyles.questionaryAnswerSection, {flexDirection: 'column'}]}>
                            <TouchableOpacity
                                  style={[
                                    questStyles.optionLong,
                                    currentAnswer === '1' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('1')}
                            >
                                  <View style={questStyles.optionImageContainer}></View>
                                  <Text style={questStyles.optionTextLong}>Ectomorphic</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                  style={[
                                    questStyles.optionLong,
                                    currentAnswer === '2' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('2')}
                            >
                                  <View style={questStyles.optionImageContainer}></View>
                                  <Text style={questStyles.optionTextLong}>Endomorphic</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                  style={[
                                    questStyles.optionLong,
                                    currentAnswer === '3' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('3')}
                                >
                                  <View style={questStyles.optionImageContainer}></View>
                                  <Text style={questStyles.optionTextLong}>Mesomorphic</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                  style={[
                                    questStyles.optionLong,
                                    currentAnswer === '4' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('4')}
                            >
                                  <View style={questStyles.optionImageContainer}></View>
                                  <Text style={questStyles.optionTextLong}>I don't know ;C</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );
            case 9:
                return (
                    <>
                        <View style={[questStyles.questionaryAnswerSection, {flexDirection: 'column'}]}>
                            <TouchableOpacity
                                  style={[
                                    questStyles.optionLong,
                                    currentAnswer === '1' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('1')}
                            >
                                  <View style={questStyles.optionImageContainer}></View>
                                  <Text style={questStyles.optionTextLong}>0 - 1 hours daily</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                  style={[
                                    questStyles.optionLong,
                                    currentAnswer === '2' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('2')}
                            >
                                  <View style={questStyles.optionImageContainer}></View>
                                  <Text style={questStyles.optionTextLong}>1 - 2 hours daily</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                  style={[
                                    questStyles.optionLong,
                                    currentAnswer === '3' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('3')}
                            >
                                  <View style={questStyles.optionImageContainer}></View>
                                  <Text style={questStyles.optionTextLong}>2 - 3 hours daily</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                  style={[
                                    questStyles.optionLong,
                                    currentAnswer === '4' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('4')}
                                >
                                  <View style={questStyles.optionImageContainer}></View>
                                  <Text style={questStyles.optionTextLong}>4+ hours daily</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );
            case 10:
                return (
                    <>
                        <View style={[questStyles.questionaryAnswerSection, {flexDirection: 'column'}]}>
                            <TouchableOpacity
                                  style={[
                                    questStyles.option,
                                    currentAnswer === '0' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('0')}
                            >
                                  <Image source={ManImage} style={questStyles.optionImage} />
                                  <Text style={questStyles.optionText}>1 - 2 training days</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                  style={[
                                    questStyles.option,
                                    currentAnswer === '1' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('1')}
                            >
                                  <Image source={FemaleImage} style={questStyles.optionImage} />
                                  <Text style={questStyles.optionText}>3 - 4 training days</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                  style={[
                                    questStyles.option,
                                    currentAnswer === '2' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('2')}
                            >
                                  <Image source={ManImage} style={questStyles.optionImage} />
                                  <Text style={questStyles.optionText}>4 - 5 training days</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                  style={[
                                    questStyles.option,
                                    currentAnswer === '3' && questStyles.selectedOption,
                                  ]}
                                  onPress={() => setCurrentAnswer('3')}
                            >
                                  <Image source={FemaleImage} style={questStyles.optionImage} />
                                  <Text style={questStyles.optionText}>6 - 7 training days</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{height: 50}}></View>
                    </>
                );
            case 11:
                return (
                    <>
                        <View style={[questStyles.questionaryAnswerSection, {flexDirection: 'column'}]}>
                            <TouchableOpacity
                                    style={[
                                      questStyles.option,
                                      currentAnswer === '0' && questStyles.selectedOption,
                                    ]}
                                    onPress={() => setCurrentAnswer('0')}
                                >
                                    <Image source={ManImage} style={questStyles.optionImage} />
                                    <Text style={[questStyles.optionText, {textAlign: 'center'}]}>Light desk job</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                      questStyles.option,
                                      currentAnswer === '1' && questStyles.selectedOption,
                                    ]}
                                    onPress={() => setCurrentAnswer('1')}
                                >
                                    <Image source={FemaleImage} style={questStyles.optionImage} />
                                    <Text style={[questStyles.optionText, {textAlign: 'center'}]}>Moderate physical job</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                    style={[
                                      questStyles.option,
                                      currentAnswer === '2' && questStyles.selectedOption,
                                    ]}
                                    onPress={() => setCurrentAnswer('2')}
                                >
                                    <Image source={FemaleImage} style={questStyles.optionImage} />
                                    <Text style={[questStyles.optionText, {textAlign: 'center'}]}>Intense physical job</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                      questStyles.option,
                                      currentAnswer === '3' && questStyles.selectedOption,
                                    ]}
                                    onPress={() => setCurrentAnswer('3')}
                                >
                                    <Image source={FemaleImage} style={questStyles.optionImage} />
                                    <Text style={[questStyles.optionText, {textAlign: 'center'}]}>Remote work</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{height: 50}}></View>
                    </>
                );
        }
    };

    return (
        <SafeAreaView style={questStyles.container}>
            <View style={questStyles.topContainer}>
                <TouchableOpacity onPress={backPress}>
                    <Image source={BackArrow} style={questStyles.questionaryBackImg} />
                </TouchableOpacity>
                <View style={questStyles.progressBarContainer}>
                    <View style={[ questStyles.progressBar, { width: `${currentProgress}%` }]}/>
                </View>
            </View>

            <ScrollView style={[GlobalStyles.flex, { width: '100%' }]} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                <View style={questStyles.questionHeaderContainer}>
                    <Text style={questStyles.questionaryText}>{questData[currentQuestion].question}</Text>
                </View>

                {generateQuestionContent()}

            </ScrollView>

            <TouchableOpacity style={[questStyles.nextButton, !currentAnswer && questStyles.disabledNextButton]} onPress={nextPress}>
                    <Text style={questStyles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

export default QuestionaryScreen;