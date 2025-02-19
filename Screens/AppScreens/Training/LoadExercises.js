import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { GestureHandlerRootView, LongPressGestureHandler } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import SavedTrainingDay from '../../../Components/Training/SavedTrainingDay.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import DeleteIcon from '../../../assets/main/Diet/trash3.svg';
import TrainingDataService from '../../../Services/ApiCalls/TrainingData/TrainingDataService.js';

function LoadExercises({ navigation }) {
const { setIsAuthenticated } = useContext(AuthContext);
const [isScreenLoading, setIsScreenLoading] = useState(false);
const [savedTrainingDayData, setSavedTrainingDayData] = useState([]);

const [trainingIndexHold, setTrainingIndexHold] = useState([]);
const [savedTrainingsToDelete, setSavedTrainingsToDelete] = useState([]);

const NavigateBack = () => {
    navigation.goBack();
};

const updateName = async (name, publicId, oldName) => {
  try{
    let data = {
      newName: name,
      publicId: publicId
    };

    const res = await TrainingDataService.updateSavedExerciseName(setIsAuthenticated, navigation, data);
    if(!res.ok){
      //error
      throwbackToOldName(publicId, oldName);
    }

  }catch(error){
    //error
    console.log(error);
    throwbackToOldName(publicId, oldName);
  }
}

const throwbackToOldName = (publicId, oldName) => {
  setSavedTrainingDayData(prevData =>
    prevData.map(training =>
      training.publicId === publicId ? { ...training, name: oldName } : training
    )
  );
};

const handleLongPress = (index, savedTraining) => {
    setTrainingIndexHold((prev) => {
    if (prev.includes(index)) {
      return prev.filter((i) => i !== index);
    } else {
      return [...prev, index];
    }
  });

  setSavedTrainingsToDelete((prev) =>{
    if(prev.includes(savedTraining.publicId)) {
      return prev.filter((i) => i !== savedTraining.publicId);
    }else{
      return [...prev, savedTraining.publicId];
    }
  });
};

const deleteSavedTrainingDays = async () => {
    try{
      let data = {
        savedTrainingIdsToRemove: savedTrainingsToDelete
      };

      const res = await TrainingDataService.removeSavedTrainings(setIsAuthenticated, navigation, data);
      if(!res.ok){
        //error
        console.log("ERRO");
        return;
      }

      setSavedTrainingDayData((prevData) => prevData.filter(training => !savedTrainingsToDelete.includes(training.publicId)));

    }catch(error){
      //error
      console.log("error");
    }finally{
      setSavedTrainingsToDelete([]);
      setTrainingIndexHold([]);
    }
};



useEffect(() => {
    const fetchSavedTrainings = async () => {
        try {
            setIsScreenLoading(true);

            const res = await TrainingDataService.getSavedTraining(setIsAuthenticated, navigation);
            if(!res.ok){
                //ERROR
                //return internet view
                return;
            }

            const data = await res.json();
            setSavedTrainingDayData(data.savedTrainings);

        } catch (error) {
            console.error("Error", error);
        } finally {
            setIsScreenLoading(false);
        }
    };

    fetchSavedTrainings();
}, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
        <View style={styles.titleCont}>
          <TouchableOpacity style = {styles.titleLeft} onPress={() => NavigateBack()}>
            <ChevronLeft width={28} height={28} fill={"#fff"} />
          </TouchableOpacity>
          <View style = {styles.titleMid}><Text style={[GlobalStyles.bold, GlobalStyles.text22]}>Saved trainings</Text></View>
          <View style = {styles.titleRight}>
            {savedTrainingsToDelete.length != 0 &&(
              <TouchableOpacity style={styles.titleRight} onPress={() => deleteSavedTrainingDays()}>
                <DeleteIcon width={26} height={26} fill={"#fff"} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isScreenLoading ? (
            <View style={[styles.container, GlobalStyles.center]}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
        ):(
            <View style={styles.mainContainer}>
                {savedTrainingDayData == null || savedTrainingDayData.length == 0 ? (
                    <View style={styles.mainContainer}>
                        <View style={styles.elGatoContainer}>
                            {/*EL GATO */}
                        </View>
                        <View style={styles.elGatoTextContainer}>
                            <Text style = {[GlobalStyles.text18]}>You didn't save any yet?</Text>
                            <Text style = {[GlobalStyles.text18]}>Save yourself some time and do so.</Text>
                            <Text>🧡🧡🧡</Text>
                        </View>
                    </View>
                ):(
                    <ScrollView style={styles.mainContainer}>
                        {savedTrainingDayData.map((savedTrainingDay, index) => (
                        <GestureHandlerRootView
                          key={index}
                        >
                          <LongPressGestureHandler                            
                            onHandlerStateChange={({ nativeEvent }) => {
                              if (nativeEvent.state === 4) {
                                handleLongPress(index, savedTrainingDay);
                              }
                            }}
                            minDurationMs={200}
                          >
                            <View>
                              <SavedTrainingDay 
                                data={savedTrainingDay}
                                isSetted={trainingIndexHold.includes(index)}
                                updateName={updateName}
                              />
                            </View>
                          </LongPressGestureHandler>
                          </GestureHandlerRootView>
                        ))}
                    </ScrollView>
                )}
            </View>
        )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  titleCont: {
    width: '100%',
    height: '9%',
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  titleLeft: {
    width: '12.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRight: {
    width: '12.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleMid: {
    width: '75%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainContainer: {
    flex: 1,
  },
  
  elGatoContainer: {
    height: '80%',
  },
  elGatoTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 20,
  }
});

export default LoadExercises;
