import React, { useState, useContext, useEffect } from 'react';
import { View, StatusBar, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import ChevUp from '../../../assets/main/Diet/chevron-up.svg';
import ChevDown from '../../../assets/main/Diet/chevron-down.svg';
import HeartIcon from '../../../assets/main/Diet/heartEmpty.svg';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import config from '../../../Config';
import TrainingDataService from '../../../Services/ApiCalls/TrainingData/TrainingDataService.js';


function InspectExercise({ navigation, route }) { 
    const { setIsAuthenticated } = useContext(AuthContext);
    const { exercise } = route.params;
    const [currentImage, setCurrentImage] = useState(`${config.ipAddress}${exercise.image}`);
    const [isDescExpanded, setIsDescExpanded] = useState(true);
    const [isMuscleExpanded, setIsMuscleExpanded] = useState(true);
    
    const navigateBack = () => {
        navigation.goBack();
    };

    const addExercise = () => {
        navigation.navigate('AddExercise', { exercise }); 
    };
     

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) =>
                prev === `${config.ipAddress}${exercise.image}`
                    ? `${config.ipAddress}${exercise.imgGifPart}`
                    : `${config.ipAddress}${exercise.image}`
            );
        }, 1000);
        return () => clearInterval(interval);
    }, [exercise.image, exercise.imgGifPart]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
            <View style={styles.topContainer}>
                <View style = {styles.topContIngBack}>
                <TouchableOpacity style={styles.topBack} onPress={navigateBack}>
                    <ChevronLeft width={28} height={28} />
                </TouchableOpacity>
                </View>
                <View style = {styles.topContIngTitle}>
                    <Text numberOfLines={2} ellipsizeMode="tail" style={styles.topNameText}>{exercise.name}</Text>
                </View>
                <View style = {styles.topContIngReport}>
                <TouchableOpacity>
                    <HeartIcon width={28} height={28} fill={'#fff'} />
                </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.contentContainer}>
                <View style={styles.gifContainer}>
                    <ImageBackground resizeMode='contain' source={{ uri: currentImage }} style={styles.image} />
                </View>
                <View style = {styles.svgDescCont}>
                    <View style = {styles.svgRow}>
                        <Text style={[GlobalStyles.text18]}>Equipment: </Text>
                        <Text style={GlobalStyles.text18}>{exercise.equipment}</Text>
                    </View>
                    <View style = {styles.svgRow}>
                        <Text style={[GlobalStyles.text18]}>Difficulty: </Text>
                        <Text style={[GlobalStyles.text18, { color: exercise.difficulty === "Easy" ? "#8BFF03" : exercise.difficulty === "Medium" ? "#FF8303" : "red" }]}>
                            {exercise.difficulty}
                        </Text>
                    </View>
                </View>

                <View style = {styles.descContainer}>
                    <TouchableOpacity style = {styles.expandTitle} onPress={() => setIsDescExpanded(!isDescExpanded)}>
                    <View><Text style = {[GlobalStyles.text18]}>Description </Text></View>
                        {isDescExpanded ? (
                            <View><ChevDown width = {24} height = {24} fill={"#000"}/></View>
                        ):(
                            <View><ChevUp width = {24} height = {24} fill={"#000"}/></View>
                        )}                    
                    </TouchableOpacity> 
                    {isDescExpanded && (
                        <View style = {styles.expandableContentNutri}>
                            <Text style={GlobalStyles.text16}>{exercise.desc}</Text>
                        </View>
                    )}
                </View>

                <View style = {styles.descContainer}>
                    <TouchableOpacity style = {styles.expandTitle} onPress={() => setIsMuscleExpanded(!isMuscleExpanded)}>
                    <View><Text style = {[GlobalStyles.text18]}>Muscles </Text></View>
                        {isMuscleExpanded ? (
                            <View><ChevDown width = {24} height = {24} fill={"#000"}/></View>
                        ):(
                            <View><ChevUp width = {24} height = {24} fill={"#000"}/></View>
                        )}                    
                    </TouchableOpacity> 
                    {isMuscleExpanded && (
                        <View style = {styles.expandableContentNutri}>
                            <Text style={GlobalStyles.text16}>muscle circles TODO</Text>
                        </View>
                    )}
                </View> 

                <View style={styles.bottomSpacing}></View>                

            </ScrollView>
            <TouchableOpacity onPress={() => addExercise()}>
                <View style = {styles.elGatoAddConfirm}>
                    <Text style = {styles.elGatoConfirmText}>Add exercise</Text>
                </View>
            </TouchableOpacity>        
        </SafeAreaView>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topContainer: {
        width: '100%',
        height: '9%',
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
        textAlign: 'center',
        alignItems: 'center',
      },
      topContIngReport: {
        width: '15%',
        height: '100%',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
      },
      topBack: {
        position: 'absolute',
        left: 10,
        height: '100%',
        justifyContent: 'center',
      },
      topName: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      topNameText: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: 'Helvetica',
        textAlign: 'center',
      },
      contentContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: '#F0E3CA',
      },
      gifContainer: {
        width: '100%',
        height: 300,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'black',
      },
      image: {
        flex: 1,
        marginLeft: -5,
      },
      svgDescCont: {
        flexDirection: 'column',
        padding: 5,
    },
    svgRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        paddingHorizontal: 5,
        marginTop: 5,
    },
    descContainer: {
        paddingVertical: 10,
    },
    expandableContentNutri: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
    },
    expandTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        paddingHorizontal: 5,
        marginTop: 5,
    },
    bottomSpacing: {
        height: 70,
    },
    elGatoAddConfirm: {
        width: '50%',
        position: 'absolute',
        height: 50,
        bottom: 20,
        borderRadius: 25,
        marginLeft: '25%',
        backgroundColor: '#FF8303',
        justifyContent: 'center',  
        alignItems: 'center',      
      },
      elGatoConfirmText: {
        color: 'white',          
        fontSize: 16,           
        fontWeight: '600',
        fontFamily: 'Helvetica', 
      },
});

export default InspectExercise;