import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import CheckSvg from '../../../assets/main/Diet/check2.svg';
import PersonalizeToggle from '../../../Animations/PersonalizeToggle.js';

import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';

function Personalize({ navigation }) {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);

    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [currentLayoutData, setCurrentLayoutData] = useState(null);
    const [newLayoutData, setNewLayoutData] = useState(null);
    const [userExercises, setUserExercises] = useState([]);

    const [addExericeChartVisible, setAddExerciseChartVisible] = useState(false);
    const [addExerciseChartInput, setAddExerciseChartInput] = useState('');
    const [addExerciseInputHints, setAddExerciseInputHints] = useState([]);
    const [addExercisePickedType, setAddExercisePickedType] = useState("Linear");
    const [addExercisePickedExercise, setAddExercisePickedExercise] = useState(null);
    const [addExerciseInputError, setAddExerciseInputError] = useState(null);


    const [staticCharts] = useState([
        { name: 'Calories', type: 'Bar', chartDataType: 'Calorie' },
        { name: 'Protein', type: 'Bar', chartDataType: 'Protein' },
        { name: 'Fat', type: 'Bar', chartDataType: 'Fat' },
        { name: 'Carbs', type: 'Bar', chartDataType: 'Carbs' },
        { name: 'Steps', type: 'Bar', chartDataType: 'Steps' },
        { name: 'Weight', type: 'Linear', chartDataType: 'Weight' },
        { name: 'MakroDist', type: 'Circle', chartDataType: 'MakroDist' },
    ]);

    const initialLoad = async () => {
        setIsLoading(true);
        try{
            const res = await UserDataService.getUserLayout(setIsAuthenticated, navigation);
            if(res === null){
                setIsError(true);
                return;
            }

            setCurrentLayoutData(res);
            setNewLayoutData(res);
        }catch(error){
            setIsError(true);
        }finally{
            setIsLoading(false);
        }
    };

    const getUserExercises = async () => {
        try{
            const res = await UserDataService.getUserExercisesNames(setIsAuthenticated, navigation);
            if(!res.ok){
                setIsError(true);
                return;
            }

            const data = await res.json();
            setUserExercises(data);
        }
        catch(error){
             setIsError(true);
        }
    }
    
    useEffect(() => {
        initialLoad();
        getUserExercises();
    }, []);

    const navigateBack = () => {
        navigation.goBack();
    };  

    const addExerciseInputChange = (input) => {
        setAddExerciseInputError(null);
        setAddExerciseChartInput(input);

        if (input.trim().length > 0) {
            const lc = input.toLowerCase();
            setAddExerciseInputHints(
            userExercises?.exerciseName.filter(name =>
                name.toLowerCase().includes(lc)
            )
            );
        } else {
            setAddExerciseInputHints([]);
        }
    }

    const setAddExerciseFromHints = (name) => {
        setAddExerciseInputHints([]);
        setAddExercisePickedExercise(name);
        setAddExerciseChartInput(name);       
    };

    const addNewExerciseChart = () => {
        if(!addExercisePickedExercise){
            setAddExerciseInputError("We couldn't find that exercise.");
            return;
        }

        const existing = newLayoutData?.chartStack.find(a=>a.chartType === addExercisePickedType && a.name === addExercisePickedExercise);
        if(existing){
            setAddExerciseInputError("You already have that chart.");
            return;
        }

        let newChart = {
            chartType: addExercisePickedType,
            chartDataType: "Exercise",
            period: "All",
            name: addExercisePickedExercise
        };

        setNewLayoutData((prev) => ({ ...prev, chartStack: [...prev.chartStack, newChart] }));

        setAddExerciseInputHints([]);
        setAddExercisePickedExercise(null);
        setAddExerciseChartInput("");
        setAddExerciseChartVisible(false);
    };

    const saveChangesPressed = async () => {
        if(currentLayoutData === newLayoutData){
            navigateBack();
            return;
        }

        try{
            const res = await UserDataService.updateUserLayoutData(setIsAuthenticated, navigation, newLayoutData);
            if(!res.ok){
                setIsError(true);
                return;
            }

            navigation.navigate('Home', { needsRefresh: true });

        }catch(error){
            setIsError(true);
        }
    };

    const removeChartFromLayout = (type, name) => {
        setNewLayoutData(prev => ({...prev, chartStack: prev.chartStack.filter(item => !(item.chartType === type && item.name === name)) }));
    }

    const addChartToLayout = (type, name, dataType) => {
        const existing = newLayoutData?.chartStack.find(a=>a.chartType === type && a.name === name);
        if(existing){
            return;
        }

        let newChart = {
            chartType: type,
            chartDataType: dataType,
            period: "All",
            name: name
        };

        setNewLayoutData((prev) => ({ ...prev, chartStack: [...prev.chartStack, newChart] }));
    }

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
        <StatusBar style="light"  backgroundColor="#FF8303" translucent={false} hidden={false} />
        
        <View style={styles.topContainer}>
            <View style={styles.topContIngBack}>
                <TouchableOpacity style={styles.topBack} onPress={navigateBack}>
                    <ChevronLeft width={28} height={28} />
                </TouchableOpacity>
            </View>
            <View style={styles.topContIngTitle}>
                <Text style={[styles.topNameText]}>Personalize</Text>
            </View>
            <View style={styles.topContIngReport}>
                {(currentLayoutData !== newLayoutData) && (
                   <TouchableOpacity onPress={() => saveChangesPressed()}>
                        <CheckSvg width={32} height={32} fill={"#fff"}/> 
                   </TouchableOpacity>
                )}
            </View>
        </View>

        <View style={[GlobalStyles.flex]}>
            {isLoading ? (
                <>
                    <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                        <ActivityIndicator size="large" color="#FF8303" />
                    </View>
                </>
            ):(
                <>
                    {isError ? (
                        <>
                            {/* GATO ERROR - NO VALID LAYOUT DATA. THROW. */}
                            <View style={styles.emptyGatoContainer}>
                                                
                            </View>
                            <View style={[GlobalStyles.center, GlobalStyles.padding15]}>
                                <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Upsss... something went horribly <Text style={[GlobalStyles.orange]}>wrong</Text>. Try to restart the application.</Text>
                            </View>
                        </>
                    ):(
                        <>
                        <KeyboardAvoidingView style={GlobalStyles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} >
                            <ScrollView style={[GlobalStyles.flex]} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}> 
                                {staticCharts.map((cfg, idx) => {
                                    const isPicked = newLayoutData.chartStack.some(item =>
                                        item.chartType === cfg.type &&
                                        item.chartDataType === cfg.chartDataType &&
                                        item.name === cfg.name
                                    );

                                    return (
                                    <BlurView
                                        key={cfg.name}
                                        intensity={125}
                                        tint="light"
                                        style={[ idx === 0 && {marginTop: 15}, isPicked ? styles.pickedChartComponent : styles.chartComponent ]}
                                    >
                                        <View style={styles.textContainer}>
                                                <Text style={[GlobalStyles.text16, GlobalStyles.textShadow, GlobalStyles.orange]}>{cfg.name}</Text>
                                                <Text style={[GlobalStyles.text16]}>{cfg.type}</Text>
                                        </View>
                                        <View style={styles.actionContainer}>
                                            <PersonalizeToggle
                                                initial={isPicked}
                                                onToggle={(newState) => {
                                                    if (newState) {
                                                        addChartToLayout(cfg.type, cfg.name, cfg.chartDataType);
                                                    } else {
                                                        removeChartFromLayout(cfg.type, cfg.name, cfg.chartDataType);
                                                    }
                                                }}
                                            />
                                        </View>
                                    </BlurView>
                                    );
                                })}
                                {newLayoutData?.chartStack
                                    .filter(item => item.chartDataType === 'Exercise')
                                    .map((item, idx) => (
                                        <BlurView
                                            key={`exercise-${idx}`}
                                            intensity={125}
                                            tint="light"
                                            style={[idx === 0 && styles.firstChart,styles.pickedChartComponent]}
                                        >
                                        <View style={styles.textContainer}>
                                            <Text style={[GlobalStyles.text16, GlobalStyles.textShadow, GlobalStyles.orange]}>
                                            {item.name}
                                            </Text>
                                            <Text style={[GlobalStyles.text16]}>
                                            {item.chartType}
                                            </Text>
                                        </View>

                                        <TouchableOpacity style={styles.actionContainer}>
                                            <PersonalizeToggle
                                                initial={true}
                                                onToggle={(newState) => {
                                                    if (newState) {
                                                        addChartToLayout(item.chartType, item.name, 'Exercise');
                                                    } else {
                                                        removeChartFromLayout(item.chartType, item.name, 'Exercise');
                                                    }
                                                }}
                                            />
                                        </TouchableOpacity>
                                        </BlurView>
                                    ))
                                }

                                {addExericeChartVisible ? (
                                    <>
                                        <BlurView intensity={125} tint="light" style={styles.addExerciseChartContainer}>
                                            <View style={[GlobalStyles.flex]}>
                                                {addExercisePickedExercise ? (
                                                    <TouchableOpacity onPress={() => setAddExercisePickedExercise(null)}>
                                                        <Text style={[GlobalStyles.text18, {marginTop: 5}, GlobalStyles.orange, GlobalStyles.textShadow]}>{addExercisePickedExercise}</Text>
                                                    </TouchableOpacity>
                                                ):(
                                                    <>
                                                        <TextInput
                                                            value={addExerciseChartInput}
                                                            onChangeText={addExerciseInputChange}
                                                            style={styles.addExChartInput}
                                                            autoFocus
                                                            selectionColor="#FF6600"
                                                        />
                                                        {(addExerciseInputHints && addExerciseInputHints.length > 0) && (
                                                            <View style={styles.addExerciseHintContainer}>
                                                                {addExerciseInputHints.map((name, idx) => (
                                                                    <TouchableOpacity onPress={() => setAddExerciseFromHints(name)} key={idx} style={styles.hintRow} >
                                                                        <Text>{name}</Text>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </>
                                                )}
                                            </View>
                                            <View style={styles.addExerciseTypesContainer}>
                                                <TouchableOpacity style={addExercisePickedType === "Linear" ? styles.addExerciseTypePicked : styles.addExerciseType} onPress={() => setAddExercisePickedType("Linear")}>
                                                    <Text style={[GlobalStyles.text14]}>Linear</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={addExercisePickedType === "Compare" ? styles.addExerciseTypePicked : styles.addExerciseType} onPress={() => setAddExercisePickedType("Compare")}>
                                                    <Text style={[GlobalStyles.text14]}>Compare</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <TouchableOpacity style={[styles.addExerciseChartButton]} onPress={() => addNewExerciseChart()}>
                                                <Text style={[GlobalStyles.text16]}>add new chart</Text>
                                            </TouchableOpacity>

                                            {(addExerciseInputError != null) && (
                                                <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                                                    <Text style={[GlobalStyles.red, GlobalStyles.text14]}>{addExerciseInputError}</Text>
                                                </View>
                                            )}
                                        </BlurView>
                                    </>
                                ): (
                                    <TouchableOpacity style={[{marginTop: 20}]} onPress={() => {setAddExerciseChartVisible(true); setAddExerciseInputHints([]); setAddExercisePickedExercise(null); setAddExerciseChartInput('');}}>
                                        <Text style={[GlobalStyles.text16, GlobalStyles.orange]}>add exercise chart</Text>
                                    </TouchableOpacity>
                                )}

                                <View style={[{marginBottom: 100}]}></View>
                            </ScrollView>
                            </KeyboardAvoidingView>
                        </>
                    )}
                </>
            )}
        </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'whitesmoke',
  },
  emptyGatoContainer: {
    minHeight: 650,
  },
  topContainer: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topContIngBack: {
    width: '15%',
    height: '100%',
  },
  topContIngTitle: {
    width: '70%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContIngReport: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBack: {
    position: 'absolute',
    left: 10,
    height: '100%',
    justifyContent: 'center',
  },
  topNameText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },

  emptyGatoContainer: {
    minHeight: 650,
  },

  chartComponent: {
    width: '90%',
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(000, 000, 000, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    flexDirection: 'row',
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10,
    alignItems: 'center', 
  },
  pickedChartComponent:{
    width: '90%',
    alignItems: 'center', 
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: 'green',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10,
  },
   textContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  actionContainer: {
    padding: 8,
  },

  addExerciseChartContainer: {
    width: '90%',
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(000, 000, 000, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10,
  },
  addExChartInput:{
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 8,
    fontSize: 16,
    color: '#ff6600'
  },
  addExerciseTypesContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  addExerciseType: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 10,
  },
  addExerciseTypePicked: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 10,
    backgroundColor: '#FF8303',
  },
  addExerciseChartButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 3,
    width: '100%',
    backgroundColor: '#FF8303',
    marginBottom: 10,
    marginTop: 20,
  },
  addExerciseHintContainer: {
      width: '100%',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 2,
  },
});

export default Personalize;