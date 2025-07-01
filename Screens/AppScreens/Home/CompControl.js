import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator ,Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'react-native';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';
import { Platform } from 'react-native';
import { acessReadPermissionHealthConnect, checkHealthConnectPermissionsStatus } from '../../../Services/Helpers/Activity/ActivityPermissionHelper.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';

function CompControl({ navigation }) {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);

    const { type = null, value = null, canAnimate = false} = route.params ?? {};
    const [isError, setIsError] = useState(false);
    const [isInitialLoaded, setIsIinitalLoaded] = useState(false);
    const [isActionRequired, setIsActionRequired] = useState(false);
    const [requiredActionType, setRequiredActionType] = useState(null);

    const [caloriePermissionGranted, setCaloriePermissionGranted] = useState(false);
    const [stepsPermissionGranted, setStepsPermissionsGranted] = useState(false);
    
    const [caloriesAnimationAvaliable, setCaloriesAnimationAvaliable] = useState(canAnimate ?? false);
    const [animationUpdateError, setAnimationUpdateError] = useState(false);

    const [inputValue, setInputValue] = useState('');
    const [inputErrorMsgVisible, setInputErrorMsgVisible] = useState(false);

    useEffect(() => {
        if (type === null) {
            setIsError(true);
        }
    }, [type]);

    const getPermissionsStatus = async (type) => {
        if (type !== "steps" && type !== "calories") return;

        if (Platform.OS === 'android') {
        let permissionsToCheck = [];

        switch(type){
            case "steps":
                permissionsToCheck = [{ type: "Steps", setter: setStepsPermissionsGranted }];
                break;
            case "calories":
                permissionsToCheck = [{ type: "ActiveCaloriesBurned", setter: setCaloriePermissionGranted }];
                break;
        }
            
        for (const { type, setter } of permissionsToCheck) {
            const granted = await checkHealthConnectPermissionsStatus(type);
            if (!granted) {
                const requested = await acessReadPermissionHealthConnect(type);
                setter(requested);
            } else {
                setter(true);
            }
        }
            
        } else if (Platform.OS === 'ios') {
            //TODO IOS impl. perm.
        }
    };

    const initialLoad = async () => {
        if(type === "steps" || type === "calories"){
            await getPermissionsStatus(type);
        }

        setIsIinitalLoaded(true);
    };
    
    useEffect(() => {
        initialLoad();
    }, []);

    const setNewGoalValue = async () => {
        setInputErrorMsgVisible(false);

        const normalized = inputValue.replace(',', '.').trim();
        if (normalized === '' || isNaN(normalized)) {
            setInputErrorMsgVisible(true);
            return;
        }

        const floatVal = parseFloat(normalized);
        const intVal = Math.floor(floatVal);
        if (intVal <= 0) {
            setInputErrorMsgVisible(true);
            return;
        }

        switch(type){
            case "steps":
                await UserDataService.setDailyStepsGoal(intVal);
                break;
            case "water":
                await UserDataService.setDailyWaterIntakeGoal(intVal);
                break;
        }

        navigateBack();
    };

    const setCaloriesSource = async (source) => {
        if(source !== "both" && source !== "app"){ return; }

        await UserDataService.setCaloriesSource(source);
         navigateBack();
    }

    const updateAnimationState = async () => {
        setCaloriesAnimationAvaliable(!caloriesAnimationAvaliable);
        setAnimationUpdateError(false);

        try{
            const res = await UserDataService.updateLayoutAnimationState(setIsAuthenticated, navigation, !caloriesAnimationAvaliable);
            if(res.ok){
                navigateBack();
                return;
            }
            setAnimationUpdateError(true);
        }catch(error){
            setAnimationUpdateError(true);
        }
    };

    const generateRequiredAction = () => {
        switch(requiredActionType){
            case "change goal":
                return (
                    <View style={[GlobalStyles.flex, {flexGrow: 1, alignItems: 'center'}]}>
                        <View style={styles.visibilityRow}>
                            <TextInput
                                value={inputValue}
                                onChangeText={setInputValue}
                                keyboardType="numeric"
                                style={styles.numericInput}
                                autoFocus
                                selectionColor="#FF6600"
                            />
                        </View>
                        {inputErrorMsgVisible && (
                            <Text style= {[GlobalStyles.red, GlobalStyles.text14]}>Invalid input.</Text>
                        )}

                        <TouchableOpacity onPress={() => setNewGoalValue()} style={[styles.optionButton, {position: 'absolute', bottom: 30}]}>
                            <Text style={[GlobalStyles.text16, GlobalStyles.white]}>set new goal</Text>
                        </TouchableOpacity>
                    </View>
                );
            case "change source":
                return (
                    <View style={[GlobalStyles.flex, {flexGrow: 1, alignItems: 'center'}]}>
                        <TouchableOpacity onPress={() => setCaloriesSource("both")} style={[styles.optionButton, {marginTop: 20}]}>
                            <Text style={[GlobalStyles.text16, GlobalStyles.white]}>From {Platform.OS === 'android' ? "Health Kit" : "Health Connect"} and El Gato</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCaloriesSource("app")} style={[styles.optionButton]}>
                            <Text style={[GlobalStyles.text16, GlobalStyles.white]}>Only from El Gato</Text>
                        </TouchableOpacity>
                    </View>
                );
            case "change animation":
                return (
                    <View style={[GlobalStyles.flex, {flexGrow: 1, alignItems: 'center'}]}>
                        <View style={styles.visibilityRow}>
                            <Text style={[GlobalStyles.text18]}>Animations avaliable </Text>
                            <Switch
                                value={caloriesAnimationAvaliable}
                                onValueChange={updateAnimationState}
                                trackColor={{ false: '#ccc', true: '#FF8303' }}
                                thumbColor={caloriesAnimationAvaliable ? '#FF8303' : '#FF8303'}
                            />
                        </View>
                        {animationUpdateError && (
                            <Text style={[GlobalStyles.text14, GlobalStyles.red]}>Something went wrong. Check your internet connection.</Text>
                        )}
                    </View>
                );
                break;
            default:
                setRequiredActionType(null);
                setIsActionRequired(false);
                break;
        }
    };

    const actionPressed = (action) => {
        if(!action) { return; }

        setIsActionRequired(true);
        setRequiredActionType(action);
    };

    const navigateBack = () => {
        navigation.goBack();
    };  

    const renderContent = () => {
        switch(type){
            case "steps":
                if(stepsPermissionGranted){
                   return (
                        <>
                            <ScrollView style={[GlobalStyles.flex]} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}> 
                                <TouchableOpacity onPress={() => actionPressed("change goal")} style={[styles.optionButton, {marginTop: 20}]}>
                                    <Text style={[GlobalStyles.text16, GlobalStyles.white]}>Change goal</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </>
                    );                 
                }else{
                    return (
                        <>
                            {/* GATO ERROR - NO STEPS PERMISSION. THROW -> WHY ITS NESS. */}
                            <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}> 
                                <View style={styles.emptyGatoContainer}>
                            
                                </View>
                                <View style={[GlobalStyles.center, GlobalStyles.padding15]}>
                                    <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Looks like you forbidded ElGato to acess steps data. <Text style={[GlobalStyles.orange]}>It is necessary to acess this feature</Text>. Go to your settings and change your permissions.</Text>
                                </View>
                            </ScrollView>
                        </>
                    );
                }

                break;
            case "calories":
                if(caloriePermissionGranted){
                   return (
                        <>
                            <ScrollView style={[GlobalStyles.flex]} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}> 
                                <TouchableOpacity onPress={() => actionPressed("change source")} style={[styles.optionButton, {marginTop: 20}]}>
                                    <Text style={[GlobalStyles.text16, GlobalStyles.white]}>Change source</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => actionPressed("change animation")} style={styles.optionButton}>
                                    <Text style={[GlobalStyles.text16, GlobalStyles.white]}>Change animation</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </>
                    );                 
                }else{
                    return (
                        <>
                            {/* GATO ERROR - NO CALORIES PERMISSION. THROW -> WHY ITS NESS. */}
                            <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}> 
                                <View style={styles.emptyGatoContainer}>
                            
                                </View>
                                <View style={[GlobalStyles.center, GlobalStyles.padding15]}>
                                    <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Looks like you forbidded ElGato to acess calories data. <Text style={[GlobalStyles.orange]}>It is necessary to acess this feature</Text>. Go to your settings and change your permissions.</Text>
                                </View>
                            </ScrollView>
                        </>
                    );
                }

                break;
            case "water":
                return (
                    <>
                        <ScrollView style={[GlobalStyles.flex]} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}> 
                            <TouchableOpacity onPress={() => actionPressed("change goal")} style={[styles.optionButton, {marginTop: 20}]}>
                                <Text style={[GlobalStyles.text16, GlobalStyles.white]}>Change goal</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </>
                ); 
                break;
        }
    };

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
                <Text style={[styles.topNameText]}>{type} settings</Text>
            </View>
            <View style={styles.topContIngReport}></View>
        </View>

        <View style={[GlobalStyles.flex]}>
            {isError ? (
                <>
                    {/* GATO ERROR - NO VALID OLD DATA PASSED. THROW. */}
                    <View style={styles.emptyGatoContainer}>
                    
                    </View>
                    <View style={[GlobalStyles.center, GlobalStyles.padding15]}>
                        <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Upsss... something went horribly <Text style={[GlobalStyles.orange]}>wrong</Text>. Try to restart the application.</Text>
                    </View>
                </>
            ):(
                <>
                   {!isInitialLoaded ? (
                    <View style={[GlobalStyles.flex, GlobalStyles.center, {height: 550}]}>
                        <ActivityIndicator size="large" color="#FF8303" />
                    </View>
                   ):(
                    <>
                        {isActionRequired ? (
                            <>
                                {generateRequiredAction()}
                            </>
                        ):(
                            <>{renderContent()}</>
                        )}
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

  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 3,
    width: '90%',
    backgroundColor: '#FF8303',
    marginBottom: 10,
  },
  visibilityRow:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 5,
    gap: 5,
  },
  numericInput: {
    width: '80%',
    height: 70,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingVertical: 8,
    fontSize: 32,
    textAlign: 'center',
    color: '#ff6600'
  },
});

export default CompControl;