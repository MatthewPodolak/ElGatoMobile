import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, StatusBar, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import ChevUp from '../../../assets/main/Diet/chevron-up.svg';
import ChevDown from '../../../assets/main/Diet/chevron-down.svg';
import HeartIcon from '../../../assets/main/Diet/heartEmpty.svg';
import HeartIconFull from '../../../assets/main/Diet/heartFull.svg';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import config from '../../../Config';
import TrainingDataService from '../../../Services/ApiCalls/TrainingData/TrainingDataService.js';


function InspectExercise({ navigation, route }) { 
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);
    const { exercise, isLiked } = route.params;
    const [currentImage, setCurrentImage] = useState(`${config.ipAddress}${exercise.image}`);
    const [isDescExpanded, setIsDescExpanded] = useState(true);
    const [isMuscleExpanded, setIsMuscleExpanded] = useState(true);
    const [isExerciseLiked, setIsExerciseLiked] = useState(false);
    const [startingState, setStartingState] = useState(null);

    const scaleValue = useRef(new Animated.Value(1)).current;

    const likeActionCount = useRef(0);
    const isLikeThrottleActive = useRef(false);
    const queLikeState = useRef(null);

    const MAX_LIKE_ST = 3;
    const THROTTLE_TIME_LIKES = 3000;

    const navigateBack = () => {    
        if(startingState != isExerciseLiked){
            let changedState = {
                own: false,
                name: exercise.name,
                id: exercise.id,
            }

            navigation.navigate('AddExercise', { changedState }); 
        }else{
            navigation.goBack();
        }
    };

    const addExercise = () => {
        if(startingState != isExerciseLiked){
            let changedState = {
                own: false,
                name: exercise.name,
                id: exercise.id,
            }
            navigation.navigate('AddExercise', { exercise, changedState }); 
        }else{
            navigation.navigate('AddExercise', { exercise }); 
        }
    };
    
    const likeExercise = () => {
        animateHeart();
        if(isLikeThrottleActive.current){
         queLikeState.current = !queLikeState.current;
         setIsExerciseLiked(!isExerciseLiked);
         return;
        }
 
        const newState = !isExerciseLiked;
        setIsExerciseLiked(newState);
        likeActionCount.current++;
        likeExerciseAsync(newState);

        if(likeActionCount.current >= MAX_LIKE_ST){
            isLikeThrottleActive.current = true;

            setTimeout(() =>{
                isLikeThrottleActive.current = false;
                likeActionCount.current = 0;

                if(queLikeState.current != null){
                    likeExerciseAsync(queLikeState.current);
                    setIsExerciseLiked(queLikeState.current);
                }
            }, THROTTLE_TIME_LIKES);
        }
     };
     
     const likeExerciseAsync = async (liked) => {
         try {
             let model = {
                 own: false,
                 name: exercise.name,
                 id: exercise.id,               
             };
 
             if (liked) {             
                 await TrainingDataService.addExerciseToLiked(setIsAuthenticated, navigation, model);
             } else {
                 let arrayModel = [
                     model
                 ];
                 await TrainingDataService.removeExercisesFromLiked(setIsAuthenticated, navigation, arrayModel);
             }
         } catch (error) {
             console.error("Error ", error);
         }
     };
    

    const animateHeart = () => {
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
    };

    useEffect(() => {
        console.log(isLiked);     
        setIsExerciseLiked(isLiked);
        setStartingState(isLiked);

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
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
            <StatusBar style="light"  backgroundColor="#fff" translucent={false} hidden={false} />

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
                <TouchableOpacity onPress={() => likeExercise()}>
                    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                        {isExerciseLiked ? (
                            <HeartIconFull width={28} height={28} fill={'#fff'} />
                        ):(
                            <HeartIcon width={28} height={28} fill={'#fff'} />
                        )}
                    </Animated.View>
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
                <View style = {[styles.elGatoAddConfirm, GlobalStyles.elevated]}>
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