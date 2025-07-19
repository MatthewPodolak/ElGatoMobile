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

import { muscles } from '../../../assets/Data/muscles.js';


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

            <ScrollView style={styles.contentContainer} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
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

                {exercise.desc && (
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
                )}

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
                        <View style={styles.muscleGrid}>
                            {exercise.musclesEngaged.reduce((unique, engaged) => {
                            if (!unique.find((e) => e.group.toLowerCase() === engaged.group.toLowerCase())) {
                                unique.push(engaged);
                            }
                            return unique;
                            }, []).map((engaged) => {
                            const matchedMuscle = muscles.find(
                                (m) => m.name.toLowerCase() === engaged.group.toLowerCase()
                            );
                            const Icon = matchedMuscle?.icon;

                            return (
                                <View key={engaged.id} style={styles.muscleCardUsed}>
                                {Icon && <Icon width={48} height={48} />}
                                <Text style={styles.muscleLabelUsed}>
                                    {engaged.group}
                                </Text>
                                </View>
                            );
                            })}
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
    backgroundColor: '#F0E3CA',
  },
  topContainer: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  topContIngBack: {
    width: 40,
    alignItems: 'center',
  },
  topContIngTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topContIngReport: {
    width: 40,
    alignItems: 'center',
  },
  topBack: {
    justifyContent: 'center',
  },
  topNameText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F0E3CA',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  gifContainer: {
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F7EEDD',
    borderColor: '#E5E5E5',
    borderWidth: 1,
    marginBottom: 16,
    elevation: 4,
  },
  image: {
    flex: 1,
  },
  svgDescCont: {
    backgroundColor: '#F7EEDD',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  svgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  descContainer: {
    marginBottom: 10,
    backgroundColor: '#F7EEDD',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expandTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandableContentNutri: {
    marginTop: 10,
    paddingHorizontal: 6,
  },
  bottomSpacing: {
    height: 80,
  },
  elGatoAddConfirm: {
    width: '90%',
    height: 50,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#FF8303',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  elGatoConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 10,
  },

   muscleCardUsed: {
    width: 80,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFF5E1',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
   },

   muscleLabelUsed: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Helvetica',
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },

});

export default InspectExercise;