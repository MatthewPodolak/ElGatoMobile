import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Animated ,StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import CloseIcon from '../../assets/main/Diet/x-lg.svg';
import TrashIcon from '../../assets/main/Diet/trash3.svg';
import AddSquareIcon from '../../assets/main/Diet/plus-square.svg';
import HeartIcon from '../../assets/main/Diet/heart.svg';
import EmptyHeartIcon from '../../assets/main/Diet/heartEmpty.svg';
import { GlobalStyles } from '../../Styles/GlobalStyles';


const TrainingDayExerciseDisplay = ({ exercise, pastExerciseData, measureType }) => {
  const [isLiked, setIsLiked] = useState(true);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <BlurView style={styles.glassEffect} intensity={125} tint="light">
          <View style={styles.topRow}>
            <View style={styles.headerText}>
              <Text style={styles.mealText}>{exercise.name}</Text>
            </View>
            <View style={styles.headerClose}>
              <TouchableOpacity style={{ marginRight: 5 }}>
                  {isLiked ? (
                    <HeartIcon fill={'#FF8303'} width={24} height={26} />
                  ) : (
                    <EmptyHeartIcon fill={'#FF8303'} width={24} height={26} />
                  )}
              </TouchableOpacity>
              <TouchableOpacity>
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
                      <View style={styles.centerNum}><Text style={[GlobalStyles.text24]}>{serie.repetitions}</Text></View>
                      <View style={styles.centerSpace}><Text style={[GlobalStyles.text22]}>|</Text></View>
                      <View style={[styles.centerNum, { flex: 1, alignItems: 'flex-end' }]}>
                        {measureType === "metric" ? (
                          <Text style={[GlobalStyles.text24, GlobalStyles.floatRight]}>{serie.weightKg}</Text>
                        ): (
                          <Text style={[GlobalStyles.text24, GlobalStyles.floatRight]}>{serie.weightLbs}</Text>
                        )}
                      </View>
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
                    <TouchableOpacity style={[styles.countCont, GlobalStyles.center]}>
                      <CloseIcon fill={'#000'} width={20} height={20} />
                    </TouchableOpacity>
                  </View>
                ))}
                                      
              <View style={styles.ingredientRow}>
                <TouchableOpacity>
                  <AddSquareIcon style={styles.addSquare} width={22} height={22}/>
                </TouchableOpacity>
              </View>
          </View>
          <View style = {styles.hrLine}></View>
          <View style={[styles.summaryRow, GlobalStyles.center]}>
            <View style={[styles.ingredientRow, GlobalStyles.center]}>
                
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
      justifyContent: 'space-between',
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
      }
 });

export default TrainingDayExerciseDisplay;
