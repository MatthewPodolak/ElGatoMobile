import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Animated ,StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import CloseIcon from '../../assets/main/Diet/x-lg.svg';
import TrashIcon from '../../assets/main/Diet/trash3.svg';
import AddSquareIcon from '../../assets/main/Diet/plus-square.svg';
import HeartIcon from '../../assets/main/Diet/heart.svg';
import EmptyHeartIcon from '../../assets/main/Diet/heartEmpty.svg';
import ArrowUpIcon from '../../assets/main/Diet/arrow-up.svg';
import ArrowDownIcon from '../../assets/main/Diet/arrow-down.svg';

import { GlobalStyles } from '../../Styles/GlobalStyles';


const TrainingDayExerciseDisplay = ({ exercise, pastExerciseData, measureType, serieAddition, serieRemoval, removeExerciseFromTrainingDat, stopRemovalTimeout, likeExerciseRequest, updateSerie }) => {
  const [updateFlag, setUpdateFlag] = useState(false);

  const [pastTotalReps, setPastTotalReps] = useState(null);
  const [pastTotalSeries, setPastTotalSeries] = useState(null);
  const [pastTotalWeightKg, setPastTotalWeightKg] = useState(null);
  const [pastTotalWeightLbs, setPastTotalWeightLbs] = useState(null);
  const [currentTotalReps, setCurrentTotalReps] = useState(null);
  const [currentTotalSeries, setCurrentTotalSeries] = useState(null);
  const [currentTotalWeightKg, setCurrentTotalWeightKg] = useState(null);
  const [currentTotalWeightLbs, setCurrentTotalWeightLbs] = useState(null);

  const [editingSerieId, setEditingSerieId] = useState(null);
  const [editingRepsSerieId, setEditingRepsSerieId] = useState(null);
  const [editingWeightValue, setEditingWeightValue] = useState(null);
  const [editingRepsValue, setEditingRepsValue] = useState(null);

  const scaleValue = useRef(new Animated.Value(1)).current;

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

  const likeExercise = () => {
    animateHeart();
    exercise.isLiked = !exercise.isLiked;
    setUpdateFlag(prev => !prev);

    likeExerciseRequest(exercise.name);
  };

  const changeWeight = (seriePublicId) => {
    let newWeight = parseFloat(editingWeightValue);
    let oldWeightKg, oldWeightLbs, newRepetitions, newWeightKg, newWeightLbs = 0;
    let targetSerie = exercise.series.find(a=>a.publicId === seriePublicId);

    newRepetitions = targetSerie.repetitions;
    
    oldWeightKg = targetSerie.weightKg;
    oldWeightLbs = targetSerie.weightLbs;

    if (measureType === "metric") {
      targetSerie.weightKg = newWeight;
      targetSerie.weightLbs = newWeight * 2.20462;
      newWeightKg = newWeight;
    } else {
        targetSerie.weightLbs = newWeight;
        targetSerie.weightKg = newWeight / 2.20462;
        newWeightLbs = newWeight;
    }

    setEditingSerieId(null);
    setEditingWeightValue(null);
    setUpdateFlag(prev => !prev);

    let data = {
      exerciseId: exercise.publicId,
      serieId: seriePublicId,
      oldWeightKg: oldWeightKg,
      oldWeightLbs: oldWeightLbs,
      newWeightKg: newWeightKg,
      newWeightLbs: newWeightLbs,
      newRepetitions: newRepetitions,
      oldRepetitions: newRepetitions,
      exerciseName: exercise.name,
    };

    updateSerie(data);
  };

  const changeReps = (seriePublicId) => {
    let newReps = parseFloat(editingRepsValue);
    let oldWeightKg, oldWeightLbs, oldRepetitions, newWeightKg, newWeightLbs = 0;
    let targetSerie = exercise.series.find(a=>a.publicId === seriePublicId);

    oldRepetitions = targetSerie.repetitions;
    targetSerie.repetitions = newReps;
    oldWeightKg = targetSerie.weightKg;
    oldWeightLbs = targetSerie.weightLbs;
    newWeightKg = targetSerie.weightKg;
    newWeightLbs = targetSerie.weightLbs;

    setEditingRepsValue(null);
    setEditingRepsSerieId(null);
    setUpdateFlag(prev => !prev);

    let data = {
      exerciseId: exercise.publicId,
      serieId: seriePublicId,
      oldWeightKg: oldWeightKg,
      oldWeightLbs: oldWeightLbs,
      newWeightKg: newWeightKg,
      newWeightLbs: newWeightLbs,
      newRepetitions: newReps,
      oldRepetitions: oldRepetitions,
      exerciseName: exercise.name,
    };

    updateSerie(data);
  };
  
  const removeExercise = () => {
    removeExerciseFromTrainingDat(exercise, pastExerciseData);
  };

  const addSerieToAnExercise = (name, id) => {
    const maxPublicId = exercise?.series?.reduce(
      (max, ex) => Math.max(max, ex.publicId), 0
    ) || 0;    

    const newSerie = {
      publicId: maxPublicId + 1,
      higherId: id,
      repetitions: 0,
      weightKg: 0,
      weightLbs: 0,
      tempo: null,
      exerciseName: name,
    };

    exercise.series.push(newSerie);
    setUpdateFlag(prev => !prev);

    serieAddition(newSerie);
  };

  const removeSerieFromAnExercise = (name, serieId, exerciseId, weightKg, weightLbs, repetitions) => {
    exercise.series = exercise.series.filter(serie => serie.publicId !== serieId);
    if(exercise.series.length === 0){
      stopRemovalTimeout(exerciseId);
      removeExerciseFromTrainingDat(exercise, pastExerciseData);
    }
    setUpdateFlag(prev => !prev);

    let model = {
      exerciseName: name,
      exerciseId: exerciseId,
      serieId: serieId,
    };

    let tempModel = {
      exerciseName: name,
      exerciseId: exerciseId,
      serieId: serieId,
      exerciseData: {
        weightKg: weightKg,
        weightLbs: weightLbs,
        repetitions: repetitions,
        publicId: serieId
      }
    };

    serieRemoval(model, tempModel);
  };

  const calculateProgessPercentage = (past, current) => {
    if (past == null || past === 0) {
      return "--";
    } 

    const diff = current - past;
    const percentageChange = (diff / past) * 100;
    const isPositive = percentageChange >= 0;

    return (
      <Text style={isPositive ? GlobalStyles.green : GlobalStyles.red}>
        {isPositive ? `(+${percentageChange.toFixed()}%)` : `(${percentageChange.toFixed()}%)`}
      </Text>
    );
  };

  const calculateTotalProgress = () => {
    let totalWeight, pastTotalWeight, pastAvgWeightPerSet, currentAvgWeightPerSet;
  
    if (measureType === "metric") {
      totalWeight = currentTotalWeightKg;
      pastTotalWeight = pastTotalWeightKg;
      pastAvgWeightPerSet = (pastTotalWeightKg / (pastTotalSeries || 1));
      currentAvgWeightPerSet = (currentTotalWeightKg / (currentTotalSeries || 1));
    } else {
      totalWeight = currentTotalWeightLbs;
      pastTotalWeight = pastTotalWeightLbs;
      pastAvgWeightPerSet = (pastTotalWeightLbs / (pastTotalSeries || 1));
      currentAvgWeightPerSet = (currentTotalWeightLbs / (currentTotalSeries || 1));
    }
  
    let weightChange = ((totalWeight - pastTotalWeight) / (pastTotalWeight || 1)) * 100;
    let repsChange = ((currentTotalReps - pastTotalReps) / (pastTotalReps || 1)) * 100;
    let setsChange = ((currentTotalSeries - pastTotalSeries) / (pastTotalSeries || 1)) * 100;
    let avgWeightChange = ((currentAvgWeightPerSet - pastAvgWeightPerSet) / (pastAvgWeightPerSet || 1)) * 100;
  
    let score = (weightChange * 0.4) + (repsChange * 0.25) + (setsChange * 0.15) + (avgWeightChange * 0.2);
  
    if (score > 5) {
      return <ArrowUpIcon width={16} height={16} color={'#3E7B27'} />;
    } else if (score < -5) {
      return <ArrowDownIcon width={16} height={16} color={'#A91D3A'} />;
    } else {
      return "";
    }
  };
  

  const returnProgress = (past, current) => {
    if (past > current) {
      return <ArrowDownIcon width={16} height={16} color={'#A91D3A'} />;
    } else if (past < current) {
      return <ArrowUpIcon width={16} height={16} color={'#3E7B27'} />;
    } else {
      return current === 0 ? '' : null;
    }
  };
  

  useEffect(() => {
    if (pastExerciseData?.series) {
      setPastTotalReps(pastExerciseData.series.reduce((sum, set) => sum + (set.repetitions || 0), 0));
      setPastTotalSeries(pastExerciseData.series.length);
      setPastTotalWeightKg(pastExerciseData.series.reduce((sum, set) => sum + ((set.repetitions || 0) * (set.weightKg || 0)), 0));
      setPastTotalWeightLbs(pastExerciseData.series.reduce((sum, set) => sum + ((set.repetitions || 0) * (set.weightLbs || 0)), 0));
    }

    if (exercise?.series) {
      setCurrentTotalReps(exercise.series.reduce((sum, set) => sum + (set.repetitions || 0), 0));
      setCurrentTotalSeries(exercise.series.length);
      setCurrentTotalWeightKg(exercise.series.reduce((sum, set) => sum + ((set.repetitions || 0) * (set.weightKg || 0)), 0));
      setCurrentTotalWeightLbs(exercise.series.reduce((sum, set) => sum + ((set.repetitions || 0) * (set.weightLbs || 0)), 0));
    }
    
  }, [pastExerciseData, exercise, updateFlag]); 

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <BlurView style={styles.glassEffect} intensity={125} tint="light">
          <View style={styles.topRow}>
            <View style={styles.headerText}>
              <Text style={styles.mealText}>{exercise.name}</Text>
            </View>
            <View style={styles.headerClose}>
              <TouchableOpacity onPress={() => likeExercise()} style={{ marginRight: 5 }}>
                  <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    {exercise.isLiked ? (
                      <HeartIcon fill={'#FF8303'} width={24} height={26} />
                    ) : (
                      <EmptyHeartIcon fill={'#FF8303'} width={24} height={26} />
                    )}
                  </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeExercise()}>
                <TrashIcon fill={'#000'} width={22} height={26} />
              </TouchableOpacity>
            </View>
          </View>
          <View style = {styles.hrLine}></View>
          <View style={styles.contentRow}>
                {(exercise?.series?.length === 0) && (
                  <View style={styles.ingredientRow}>
                    <View style={[styles.countCont,GlobalStyles.center]}>
                      <Text style={[GlobalStyles.text22, GlobalStyles.orange]}>1</Text>
                    </View>
                    <View style={[styles.prevCont, GlobalStyles.center]}>
                      <Text style={[GlobalStyles.text16]}>{pastExerciseData?.series?.[0]?.repetitions ?? "--"} </Text>
                      <Text style={[GlobalStyles.text14]}>{calculateProgessPercentage(pastExerciseData?.series?.[0]?.repetitions ?? null, 0)}</Text>
                    </View>
                    <View style={[styles.centerDataCont, GlobalStyles.center]}>
                      <View style={styles.centerNum}><Text style={[GlobalStyles.text24]}>0</Text></View>
                      <View style={styles.centerSpace}><Text style={[GlobalStyles.text22]}>|</Text></View>
                      <View style={[styles.centerNum, { flex: 1, alignItems: 'flex-end' }]}><Text style={[GlobalStyles.text24, GlobalStyles.floatRight]}>0</Text></View>
                    </View>                 
                    <View style={[styles.prevCont, GlobalStyles.center]}>
                      {measureType === "metric" ? (
                        <>
                          <Text style={[GlobalStyles.text16]}>{pastExerciseData?.series?.[0]?.weightKg ?? "--"} </Text>
                          <Text style={[GlobalStyles.text14]}>{calculateProgessPercentage(pastExerciseData?.series?.[0]?.weightKg ?? null, 0)}</Text>
                        </>
                      ):(
                        <>
                          <Text style={[GlobalStyles.text16]}>{pastExerciseData?.series?.[0]?.weightLbs ?? "--"} </Text>
                          <Text style={[GlobalStyles.text14]}>{calculateProgessPercentage(pastExerciseData?.series?.[0]?.weightLbs ?? null, 0)}</Text>
                        </>
                      )}
                    </View>
                    <TouchableOpacity style={[styles.countCont, GlobalStyles.center]}>
                      <CloseIcon fill={'#000'} width={20} height={20} />
                    </TouchableOpacity>
                  </View>
                )}   
                {exercise?.series.map((serie, index) => (
                  <View style={styles.ingredientRow} key={index}>
                    <View style={[styles.countCont,GlobalStyles.center]}>
                      <Text style={[GlobalStyles.text22, GlobalStyles.orange]}>{index+1}</Text>
                    </View>
                    <View style={[styles.prevCont, GlobalStyles.center]}>
                      <Text style={[GlobalStyles.text16]}>{pastExerciseData?.series?.[index]?.repetitions ?? "--"} </Text>
                      <Text style={[GlobalStyles.text14]}>{calculateProgessPercentage(pastExerciseData?.series?.[index]?.repetitions ?? null, serie.repetitions)}</Text>
                    </View>
                    <View style={[styles.centerDataCont, GlobalStyles.center]}>
                      <TouchableOpacity onPress={() => setEditingRepsSerieId(serie.publicId)} style={styles.centerNum}>
                          {editingRepsSerieId === serie.publicId ? (
                            <>
                              <TextInput
                                  style={styles.input}
                                  value={editingRepsValue}
                                  onChangeText={setEditingRepsValue}
                                  keyboardType="numeric"
                                  onBlur={() => changeReps(serie.publicId)}
                                  autoFocus
                                />
                            </>
                          ):(
                            <>
                              <Text style={[GlobalStyles.text24]}>{serie.repetitions}</Text>
                            </>
                          )} 
                        </TouchableOpacity>
                      <View style={styles.centerSpace}><Text style={[GlobalStyles.text22]}>|</Text></View>
                      <TouchableOpacity onPress={() => setEditingSerieId(serie.publicId)} style={[styles.centerNum, { flex: 1, alignItems: 'flex-end' }]}>
                        {editingSerieId === serie.publicId ? (
                          <>
                            <TextInput
                              style={styles.input}
                              value={editingWeightValue}
                              onChangeText={setEditingWeightValue}
                              keyboardType="numeric"
                              onBlur={() => changeWeight(serie.publicId)}
                              autoFocus
                            />
                          </>
                        ):(
                          <>
                            {measureType === "metric" ? (
                              <Text style={[GlobalStyles.text24, GlobalStyles.floatRight]}>{serie.weightKg}</Text>
                            ): (
                              <Text style={[GlobalStyles.text24, GlobalStyles.floatRight]}>{serie.weightLbs}</Text>
                            )}
                          </>
                        )}                        
                      </TouchableOpacity>
                    </View>                 
                    <View style={[styles.prevCont, GlobalStyles.center]}>
                      {measureType === "metric" ? (
                        <>                      
                         <Text style={[GlobalStyles.text16]}>{pastExerciseData?.series?.[index]?.weightKg ?? "--"} </Text>
                         <Text style={[GlobalStyles.text14]}>{calculateProgessPercentage(pastExerciseData?.series?.[index]?.weightKg ?? null, serie.weightKg)}</Text>
                        </>
                      ):(
                        <>
                         <Text style={[GlobalStyles.text16]}>{pastExerciseData?.series?.[index]?.weightLbs ?? "--"} </Text>
                         <Text style={[GlobalStyles.text14]}>{calculateProgessPercentage(pastExerciseData?.series?.[index]?.weightLbs ?? null, serie.weightLbs)}</Text>
                        </>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => removeSerieFromAnExercise(exercise.name, serie.publicId, exercise.publicId, serie.weightKg, serie.weightLbs, serie.repetitions)} style={[styles.countCont, GlobalStyles.center]}>
                      <CloseIcon fill={'#000'} width={20} height={20} />
                    </TouchableOpacity>
                  </View>
                ))}
                                      
              <View style={styles.ingredientRow}>
                <TouchableOpacity onPress={() => addSerieToAnExercise(exercise.name, exercise.publicId)}>
                  <AddSquareIcon style={styles.addSquare} width={22} height={22}/>
                </TouchableOpacity>
              </View>
          </View>
          <View style = {styles.hrLine}></View>
          <View style={[styles.summaryRow, GlobalStyles.center]}>
            <View style={[styles.ingredientRow, GlobalStyles.center]}>
                <View style={styles.bottomSummaryData}>
                <View style={styles.statsRow}>
                  <Text style={[GlobalStyles.text16, GlobalStyles.bold]}>
                    Total: <Text></Text>
                    <Text style={[GlobalStyles.text16, { fontWeight: '500' }]}>
                      {measureType === 'metric' ? currentTotalWeightKg : currentTotalWeightLbs}{measureType === 'metric' ? 'kg' : 'lbs'} 
                      {returnProgress(measureType === 'metric' ? pastTotalWeightKg : pastTotalWeightLbs, measureType === 'metric' ? currentTotalWeightKg : currentTotalWeightLbs)}
                    </Text>
                  </Text>
                </View>                  
                <View style={styles.statsRowKlein}><Text style={[GlobalStyles.text16, GlobalStyles.bold]}> Reps: <Text style={[GlobalStyles.text16, { fontWeight: '500' }]}>{currentTotalReps} {returnProgress(pastTotalReps, currentTotalReps)}</Text></Text></View>
                <View style={styles.statsRowKlein}><Text style={[GlobalStyles.text16, GlobalStyles.bold]}> Series: <Text style={[GlobalStyles.text16, { fontWeight: '500' }]}>{currentTotalSeries} {returnProgress(pastTotalSeries, currentTotalSeries)}</Text></Text></View></View>
                <View style={styles.bottomSummaryEq}>
                  <Text >{calculateTotalProgress()}</Text>
                </View>
            </View>
          </View>
        </BlurView>
      </View>
      <View style={styles.spacing}></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ 
    safeArea: {
        flex: 1,
      },
      mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      glassEffect: {
        width: '90%',
        padding: 20,
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
      },
      topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
      },
      headerText: {
        flex: 1,
      },
      headerClose: {
        alignItems: 'flex-end',
        flexDirection: 'row',
      },
      contentRow: {
        marginBottom: 20,
      },
      ingredientRow: {
        flexDirection: 'row',
        marginBottom: 10,
      },
      ingNameCont: {
        width: '60%',
        
      },
      ingWeightCont: {
        width: '25%',
        
        justifyContent: 'center',
        alignItems: 'center',
      },
      ingOptionsCont: {
        width: '15%',
        
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    
    
      ingredientName: {
        color: '#000',
      },
      ingredientWeight: {
        color: '#000',  
      },
      ingredientEdit: {
        color: '#000',
      },
      ingredientClose: {
        color: '#000',
      },
      text: {
        color: '#000',
        fontSize: 18,
        fontFamily: 'Helvetica',
      },
      mealText: {
        color: '#000',
        fontWeight: '600',
        fontSize: 22,
        fontFamily: 'Helvetica',
      },
      input: {
        color: '#000',
        fontSize: 18,
        fontFamily: 'Helvetica',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
      },
      summaryRow: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 10,
      },
      kcal: {
        flex: 1,
      },
      macros: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 1,
        textAlign: 'right',
      },
      spacing: {
        height: 10,
      },
      hrLine: {
        borderBottomColor: 'black',
        opacity: 0.2,
        borderBottomWidth: 1,
        marginBottom: 10,
      },
      addIngridientText: {
        fontSize: 22,
      },
      addSquare: {
        marginTop: 10,
      },

      centerDataCont: {
        width: '30%',
        flexDirection: 'row',
      },
      countCont: {
        width: '5%',
      },
      prevCont: {
        width: '30%',
        flexDirection: 'row',
      },
      centerNum: {
        width: '45%',
      },
      centerSpace: {
        width: '10%',
      },
      bottomSummaryData: {
        flex: 0.95,
        flexDirection: 'row',
      },
      bottomSummaryEq: {
        flex: 0.05,
      },
      statsRow: {
        height: '100%',
      },
      statsRowKlein: {
        height: '100%',
      },
      input: {
        color: '#000',
        fontSize: 18,
        fontFamily: 'Helvetica',
        borderBottomWidth: 1,
        borderBottomColor: '#FF8303',
      },
 });

export default TrainingDayExerciseDisplay;
