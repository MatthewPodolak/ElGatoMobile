import React, { useState, useContext, useEffect } from 'react';
import { View, StatusBar, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView, LongPressGestureHandler } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import CheckIcon from '../../../assets/main/Diet/check2.svg';
import ChevronDown from '../../../assets/main/Diet/chevron-down.svg';
import DeleteIcon from '../../../assets/main/Diet/trash3.svg';
import { getMuscleIcon } from '../../../assets/Data/muscles.js';

import ExerciseDisplay from '../../../Components/Training/ExerciseDisplay.js';
import FilterModal from '../../../Components/Training/FilterModal.js';
import LikedExerciseDisplay from '../../../Components/Training/LikedExercise.js';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import TrainingDataService from '../../../Services/ApiCalls/TrainingData/TrainingDataService.js';

function AddExercise({ navigation, route }) { 
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);
    const currentDate = route.params?.selectedDate;
    const [selectedDatee, setSelectedDatee] = useState(currentDate);
    const [activeTab, setActiveTab] = useState('Search');
    const [exercisesList, setExercisesList] = useState(null);
    const [filteredExercisesList, setFilteredExercisesList] = useState(null);
    const [selectedExercises, setSelectedExercises] = useState([]);

    const [isFilterModalActive, setIsFilterModalActive] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isLikedListLoading, setIsLikedListLoading] = useState(true);
    const [likedExercisesList, setLikedExercisesList] = useState([]);
    const [likedExercisePicked, setLikedExercisePicked] = useState([]);
    const [likedExercisePickedIndex, setLikedExercisePickedIndex] = useState([]);
    const [likedExercisesIndexesHold, setLikedExercisesIndexesHold] = useState([]);
    const [likedExercisesToDelete, setLikedExercisesToDelete] = useState([]);

    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [newExerciseName, setNewExerciseName] = useState(null);
    const [showAddExerciseErrorText, setShowAddExerciseErrorText] = useState(false);
    const [showAddExerciseErrorMuscleType, setShowAddExerciseErrorMuscleType] = useState(false);
  
    const addNewExercise = async () => {
      if(!newExerciseName){
        setShowAddExerciseErrorText(true);
        return;
      }

      if(!selectedMuscle){
        setShowAddExerciseErrorMuscleType(true);
        return;
      };

      try{
        let mType = 0;
        switch(selectedMuscle){
          case "Chest":
            mType = 1;
            break;
          case "Shoulders":
            mType = 6;
            break;
          case "Arms":
            mType = 4;
            break;
          case "Back":
            mType = 3;
            break;
          case "Core":
            mType = 5;
            break;
          case "Legs":
            mType = 2;
            break;
        };

        let data = {
          exerciseName: newExerciseName,
          muscleType: mType
        };
        const res = await TrainingDataService.addNewPersonalExercise(setIsAuthenticated, navigation, data);
        if(!res.ok){
          //Error
          return;
        }
        let likedExerciseModel = {
          own: true,
          name: newExerciseName,
          muscleType: mType,
          id: 0,
        };
        setLikedExercisesList(prev => [...prev, likedExerciseModel]);
        setActiveTab("Favs");
      }catch(error){
        //error
        console.log("Error " + error);
      }finally{
        setNewExerciseName(null);
        setSelectedMuscle(null);
      }
    };

    useEffect(() => {
      if(showAddExerciseErrorText){
        setShowAddExerciseErrorText(false);
      };
    },[newExerciseName]);

    useEffect(() => {
      if(showAddExerciseErrorMuscleType){
        setShowAddExerciseErrorMuscleType(false);
      };
    },[selectedMuscle]);

    const addExercisesToTrainingDay = async () => {
      if(selectedExercises.length === 0 && likedExercisePicked.length === 0){
        navigation.goBack();
        return;
      }

      let exerciseNames = [];
      selectedExercises.forEach(element => {
          exerciseNames.push(element);
      });

      likedExercisePicked.forEach(element => {
          exerciseNames.push(element.name);
      });

      let model = {
        date: selectedDatee,
        name: exerciseNames
      };

      try{
        const res = await TrainingDataService.addExercisesToTrainingDay(setIsAuthenticated, navigation, model);
        if(res.ok){
          navigation.navigate('TrainingHome', { updatedExercises: model });
          return;
        }

        //error
        const errorData = await res.json();
        console.log(errorData);

      }catch(error){
        console.log(error);
      }

    };

    const removeExercisesFromLiked = async () => {
      setLikedExercisesList((prevList) => {
        const updatedList = prevList.filter(
          (exercise) =>
            !likedExercisesToDelete.some((deleteExercise) => 
              JSON.stringify(deleteExercise) === JSON.stringify(exercise)
            )
        );
    
        return updatedList;
      });   
  
      try{
        const res = await TrainingDataService.removeExercisesFromLiked(setIsAuthenticated, navigation, likedExercisesToDelete);
        if(res.ok){         
          setLikedExercisesToDelete([]);
          setLikedExercisesIndexesHold([]);
          return;
        }
        //error
        console.log("error");

      }catch(error){
        //ERROR
        console.log(error);
      }
    };

    const addLikedExercise = (indexx, exercise) => {
      setLikedExercisePicked((prev) => {
        if (prev?.includes(exercise)) {
          return prev.filter((i) => i !== exercise);
        } else {
          return [...(prev || []), exercise];
        }
      });
    
      setLikedExercisePickedIndex((prev) => {
        if (prev?.includes(indexx)) {
          return prev.filter((i) => i !== indexx);
        } else {
          return [...(prev || []), indexx];
        }
      });
    
      //Remove from del list
      setLikedExercisesIndexesHold((prev) => {
        if (prev?.includes(indexx)) {
          return prev.filter((i) => i !== indexx);
        } else {
          return prev || [];
        }
      });
    
      setLikedExercisesToDelete((prev) => {
        if (prev?.includes(exercise)) {
          return prev.filter((i) => i !== exercise);
        } else {
          return prev || [];
        }
      });
    };
    
    const handleLongPressLikedExercise = (index, exercise) => {
      setLikedExercisesIndexesHold((prev) => {
        if (prev?.includes(index)) {
          return prev.filter((i) => i !== index);
        } else {
          return [...(prev || []), index];
        }
      });
    
      setLikedExercisesToDelete((prev) => {
        if (prev?.includes(exercise)) {
          return prev.filter((i) => i !== exercise);
        } else {
          return [...(prev || []), exercise];
        }
      });
    
      //Remove from add listt
      setLikedExercisePicked((prev) => {
        if (prev?.includes(exercise)) {
          return prev.filter((i) => i !== exercise);
        } else {
          return prev || [];
        }
      });
    
      setLikedExercisePickedIndex((prev) => {
        if (prev?.includes(index)) {
          return prev.filter((i) => i !== index);
        } else {
          return prev || [];
        }
      });
    };
    

    const handleLongPressExercise = (id) => {
      setSelectedExercises((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        } else {
          return [...prev, id];
        }
      });
    };
    
    useEffect(() => {
      if (route.params?.exercise) {
          setSelectedExercises((prev) => [...prev, route.params.exercise.name]);
      }
      if (route.params?.changedState) {
        setLikedExercisesList((prev) => {
            const exists = prev.some((item) => item.id === route.params.changedState.id);
            if (exists) {
                return prev.filter((item) => item.id !== route.params.changedState.id);
            } else {
                return [...prev, route.params.changedState];
            }
        });
    }
    
    }, [route.params?.exercise, route.params?.changedState]);


    const closeFilterModal = (filters) => {
      setIsFilterModalActive(false);
      if (filters) {
        setActiveFilters(filters);
    
        const selectedEquipmentLabels = filters?.selectedEquipment?.map(
          (id) => equipmentOptions.find((option) => option.id === id)?.label
        );
    
        const selectedDifficultiesLabels = filters?.selectedDifficulties?.map(
          (id) => difficultyOptions.find((option) => option.id === id)?.label
        );
    
        const selectedMuscleFilters = filters?.selectedMuscles;
    
        let filteredList = exercisesList.filter((item) => {
          const matchesEquipment = selectedEquipmentLabels?.length
            ? selectedEquipmentLabels.some(
                (label) => label.toLowerCase() === item.equipment.toLowerCase()
              )
            : true;
    
          const matchesDifficulties = selectedDifficultiesLabels?.length
            ? selectedDifficultiesLabels.some((label) => label === item.difficulty)
            : true;
    
          const matchesMuscles = selectedMuscleFilters?.length
            ? selectedMuscleFilters.some((muscle) => muscle === item.specificBodyPart)
            : true;
    
          return matchesEquipment && matchesDifficulties && matchesMuscles;
        });
    
        filteredList = filteredList.sort((a, b) => {
          switch (filters.selectedOption) {
            case '1':
              return a.name.localeCompare(b.name);
            case '2':
              return b.name.localeCompare(a.name);
            case '3':
              return a.difficulty.localeCompare(b.difficulty);
            case '4':
              return b.difficulty.localeCompare(a.difficulty);
            default:
              return 0;
          }
        });
    
        setFilteredExercisesList(filteredList);
      }
    };
    
    const inspectExercise = (exercise) => {
        navigation.navigate('InspectExercise', { exercise, isLiked: likedExercisesList.some(liked => liked.id === exercise.id)  })
    };

    const navigateBack = () => {
        navigation.goBack();
    };

    useEffect(() => {
      getAllExercises();
      if(likedExercisesList?.length === 0){
        getLikedExercises();
      }
    }, []);

    const setActiveTabFun = async (tab) => {
        setActiveTab(tab);
        switch(tab){
            case "Search":
              await getAllExercises();
              if(likedExercisesList?.length === 0){
                await getLikedExercises();
              }
                break;
            case "Favs":
              await getLikedExercises();
                break;
            case "New":
                break;
        }
    };

    const getLikedExercises = async () => {
      try{
        const res = await TrainingDataService.getLikedExercises(setIsAuthenticated, navigation);
        if(res.ok){
          const data = await res.json();
          setLikedExercisesList(data);
          setIsLikedListLoading(false);
          return;
        }
        //error
        console.log("error");
      }catch(error){
        //Error
        console.log(error);
      }
    };

    const getAllExercises = async () => {
      try{
        const savedExercises = await AsyncStorage.getItem('allExercises');
        if (savedExercises) {
          setExercisesList(JSON.parse(savedExercises));
          setFilteredExercisesList(JSON.parse(savedExercises));
        }else{
          const res = await TrainingDataService.getAllExerciseData(setIsAuthenticated, navigation);
          if(res.ok){
            const data = await res.json();
            await AsyncStorage.setItem('allExercises', JSON.stringify(data));
            setExercisesList(data);
            setFilteredExercisesList(data);
            return;
          }
          
          //error
        }

      }catch(error){
        console.log(error);
      }
    };

    const equipmentOptions = [
      { id: '0', label: 'None' },
      { id: '1', label: 'Body' },
      { id: '2', label: 'Cables' },
      { id: '3', label: 'Dumbbells' },
      { id: '4', label: 'Machine' },
      { id: '5', label: 'Barbel' },
      { id: '6', label: 'Other' },
    ];

    const difficultyOptions = [
      { id: '0', label: 'Easy'},
      { id: '1', label: 'Medium'},
      { id: '2', label: 'Hard'},
  ];

    const handleSearch = (query) => {
      const selectedEquipmentLabels = activeFilters?.selectedEquipment?.map(
        (id) => equipmentOptions.find((option) => option.id === id)?.label
      );

      const selectedDifficultiesLabels = activeFilters?.selectedDifficulties?.map(
        (id) => difficultyOptions.find((option) => option.id === id)?.label
      );

      const selectedMuscleFilters = activeFilters?.selectedMuscles;

      if (
        query.trim() === '' &&
        !activeFilters?.selectedOption &&
        !activeFilters?.selectedEquipment?.length &&
        !activeFilters?.selectedDifficulties?.length &&
        !activeFilters?.selectedMuscles?.length
      ) {
        setFilteredExercisesList(exercisesList);
        return;
      }
    
      const res = exercisesList
        .filter((item) => {
          const matchesQuery = query
            ? item.name.toLowerCase().includes(query.toLowerCase())
            : true;
    
            const matchesEquipment = selectedEquipmentLabels?.length
            ? selectedEquipmentLabels.some(
                (label) => label.toLowerCase() === item.equipment.toLowerCase()
              )
            : true;

            const difficultiesMatch = selectedDifficultiesLabels?.length
            ? selectedDifficultiesLabels.some(
                (label) => label === item.difficulty
              )
            : true;

            const matchesMuscles = selectedMuscleFilters?.length
            ? selectedMuscleFilters.some((muscle) => muscle === item.specificBodyPart)
            : true;
          
          return (
            matchesQuery &&
            matchesEquipment && 
            difficultiesMatch &&
            matchesMuscles
          );
        })
        .sort((a, b) => {
          switch (activeFilters?.selectedOption) {
            case '1':
              return a.name.localeCompare(b.name);
            case '2':
              return b.name.localeCompare(a.name);
            case '3':
              return a.difficulty.localeCompare(b.difficulty);
            case '4':
              return b.difficulty.localeCompare(a.difficulty);
            default:
              return 0;
          }
        });
    
      setFilteredExercisesList(res);
    };

    const handleTextChange = (text) => {
      setSearchQuery(text);
  
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
  
      const timeout = setTimeout(() => {
        handleSearch(text);
      }, 500);
      setDebounceTimeout(timeout);
    };

    const renderContent = () => { 
        switch(activeTab){
            case "Search":
                return(
                    <View style={GlobalStyles.flex}>
                        <View style = {styles.containerSearchBar}>
                            <View style = {styles.searchBarContainer}>
                            <View style={styles.barContainer}>
                                <TextInput
                                style={styles.searchInput}
                                selectionColor="#FF8303"
                                placeholder="Search for ..."
                                placeholderTextColor="#999"
                                onChangeText={handleTextChange}
                                value={searchQuery}
                                />
                            </View>
                            </View>

                            <View style = {styles.filterRow}>
                            <TouchableOpacity onPress={() => setIsFilterModalActive()}>
                                <View style = {styles.filterContainer}>
                                <Text style = {styles.filterText}>Filters </Text>
                                <ChevronDown style={{ marginTop: 3 , marginRight: 5}} width={17} height={17} fill={'whitesmoke'} />
                                </View>
                            </TouchableOpacity>
                            </View>

                        </View>

                        <View style={GlobalStyles.flex}>
                          {filteredExercisesList === null ?(
                            <View style={[GlobalStyles.center, GlobalStyles.flex]}>
                                <ActivityIndicator size="large" color="#FF8303" />
                            </View>
                          ):(
                            <View style={[GlobalStyles.center, GlobalStyles.flex]}>
                                {filteredExercisesList.length === 0 ?(
                                  <View style={styles.contentError}>
                                    <View style = {styles.errorLottieContainer}>
                                      <Text>EL GATO LOTTIE HERE</Text>
                                    </View>
                                    <View style = {styles.errorAddingContainer}>
                                      <Text style = {styles.errorAddNormal}>Couldn't find what you are looking for?</Text>
                                      <View>
                                        <Text style={styles.errorAddOrange}>Try changing your filters<Text style = {styles.errorAddNormal}>.</Text></Text>
                                      </View>
                                    </View>
                                  </View>
                                ):(
                                  <ScrollView style={[GlobalStyles.wide, GlobalStyles.padding15]} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                                    {filteredExercisesList.map((exercise) => (
                                      <GestureHandlerRootView key={exercise.id}>
                                        <LongPressGestureHandler                            
                                          onHandlerStateChange={({ nativeEvent }) => {
                                          if (nativeEvent.state === 4) {
                                            handleLongPressExercise(exercise.name);
                                          }
                                          }}
                                          minDurationMs={200}
                                        >
                                        <TouchableOpacity activeOpacity={1} onPress={() => inspectExercise(exercise)}>
                                          <ExerciseDisplay
                                            exercise={exercise}
                                            navigation={navigation}
                                            selected={selectedExercises?.includes(exercise.name)}
                                          />
                                        </TouchableOpacity>
                                        </LongPressGestureHandler>
                                      </GestureHandlerRootView>                                     
                                    ))}
                                    <View style={GlobalStyles.minorSpacing}></View>
                                  </ScrollView>
                                )}
                            </View>
                          ) }
                        </View>             
                    </View>
                );
            case "Favs":
                return(
                    <View style={GlobalStyles.flex}>
                      {isLikedListLoading ?(
                        <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                          <ActivityIndicator size="large" color="#FF8303" />
                        </View>
                      ):(
                        <View style={[GlobalStyles.flex]}>
                          {likedExercisesList !== null && likedExercisesList.length > 0 ?(
                        <ScrollView style={GlobalStyles.flex} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                          {likedExercisesList.map((exercise, index) => (
                            <GestureHandlerRootView
                              key={index}
                            >
                              <LongPressGestureHandler                            
                                onHandlerStateChange={({ nativeEvent }) => {
                                if (nativeEvent.state === 4) {
                                  handleLongPressLikedExercise(index, exercise);
                                 }
                                }}
                                  minDurationMs={200}
                              >
                                <View><LikedExerciseDisplay indexx={index} exercise={exercise} pickExercise={addLikedExercise} isSetted={likedExercisesIndexesHold.includes(index)} isPicked={likedExercisePickedIndex.includes(index)} /></View>
                            </LongPressGestureHandler>
                          </GestureHandlerRootView>
                          ))}
                        </ScrollView>
                      ):(
                        <View style={styles.contentError}>
                          <View style = {styles.errorLottieContainer}>
                              <Text>EL GATO LOTTIE HERE</Text>
                          </View>
                          <View style = {styles.errorAddingContainer}>
                            <Text style = {styles.errorAddNormal}>There is nothing here yet!</Text>
                          <View>
                            <Text style={styles.errorAddOrange}>Your favourites will appear here<Text style = {styles.errorAddNormal}>.</Text></Text>
                          </View>
                          </View>
                        </View>
                      )}
                        </View>
                      )}                    
                    </View>
                );
            case "New":
                return(
                    <ScrollView style={GlobalStyles.flex} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

                      <View style={styles.topNewContainer}>
                        <View style={styles.barContainerNew}>
                          <TextInput
                            style={styles.searchInputNew}
                            selectionColor="#FF8303"
                            placeholder="Enter new exercise name"
                            placeholderTextColor="#999"
                            onChangeText={(text) => setNewExerciseName(text)}
                            value={newExerciseName}
                          />                         
                        </View>                      
                      </View>
                      {showAddExerciseErrorText ? (
                        <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                          <Text style={[GlobalStyles.text14, GlobalStyles.red]}>Please fill in new exercise name.</Text>
                        </View>
                      ):(
                        <></>
                      )}               
                      {showAddExerciseErrorMuscleType ? (
                        <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                          <Text style={[GlobalStyles.text14, GlobalStyles.red]}>Select primary muscle for new exercise.</Text>
                        </View>
                      ):(
                        <></>
                      )}

                      <View style={styles.bottomNewContainer}>

                        <View style={styles.muscleRow}>
                          <TouchableOpacity onPress={() => setSelectedMuscle('Chest')} style={[
                            styles.muscleRectangle,
                            selectedMuscle === "Chest" && styles.selectedMuscleRectangle
                            ]}>
                            {getMuscleIcon('Chest')}
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setSelectedMuscle('Legs')} style={[
                            styles.muscleRectangle,
                            selectedMuscle === "Legs" && styles.selectedMuscleRectangle
                            ]}>
                          {getMuscleIcon('Quadriceps')}
                          </TouchableOpacity>
                        </View>

                        <View style={styles.muscleRow}>
                          <TouchableOpacity onPress={() => setSelectedMuscle('Back')} style={[
                            styles.muscleRectangle,
                            selectedMuscle === "Back" && styles.selectedMuscleRectangle
                            ]}>
                            {getMuscleIcon('Back')}
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setSelectedMuscle('Arms')} style={[
                            styles.muscleRectangle,
                            selectedMuscle === "Arms" && styles.selectedMuscleRectangle
                            ]}>
                          {getMuscleIcon('Biceps')}
                          </TouchableOpacity>
                        </View>

                        <View style={styles.muscleRow}>
                          <TouchableOpacity onPress={() => setSelectedMuscle('Core')} style={[
                            styles.muscleRectangle,
                            selectedMuscle === "Core" && styles.selectedMuscleRectangle
                            ]}>
                            {getMuscleIcon('Abs')}
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setSelectedMuscle('Shoulders')} style={[
                            styles.muscleRectangle,
                            selectedMuscle === "Shoulders" && styles.selectedMuscleRectangle
                            ]}>
                          {getMuscleIcon('Shoulders')}
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={[styles.addNewButtonRow, GlobalStyles.center]}>
                        <TouchableOpacity onPress={() => addNewExercise()} style={[styles.addNewButton, GlobalStyles.elevated]}>
                          <Text style={[GlobalStyles.text16]}>Add new exercise</Text>
                        </TouchableOpacity>
                      </View>                   

                    </ScrollView>
                );
            default:
                //error
                break;
        }
    };

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
                    <Text numberOfLines={2} ellipsizeMode="tail" style={styles.topNameText}>Exercises</Text>
                </View>
                <View style = {styles.topContIngReport}>
                <View>
                    {likedExercisesToDelete !== null && likedExercisesToDelete.length > 0 ?(
                      <TouchableOpacity onPress={() => removeExercisesFromLiked()}>
                        <DeleteIcon width={26} height={26} fill={"#fff"} />
                      </TouchableOpacity>                
                    ):(
                      <TouchableOpacity onPress={() => addExercisesToTrainingDay()}>
                        <CheckIcon width={37} height={37} fill={'#fff'} />
                      </TouchableOpacity>
                    )}
                </View>
                </View>
            </View>

            <View style={styles.categoryContainer}>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Search")} ><Text style={[styles.optionText, activeTab === "Search" && styles.activeTab]}>Search</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Favs")} ><Text style={[styles.optionText, activeTab === "Favs" && styles.activeTab]}>Favs</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("New")} ><Text style={[styles.optionText, activeTab === "New" && styles.activeTab]}>New</Text></TouchableOpacity>
            </View>

            {renderContent()}

            <FilterModal  visible={isFilterModalActive} closeFilterModal={closeFilterModal} activeFilters={activeFilters}/>

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
      categoryContainer: {
        marginTop: 15,
        width: '100%',
        flexDirection: 'row',
      },
      option: {
        marginLeft: 15,
      },
      optionText: {
        fontSize: 18,
        fontFamily: 'Helvetica',
      },
      activeTab: {
        color: '#FF8303',
        borderBottomColor: '#FF8303', 
        borderBottomWidth: 2,
        paddingBottom: 5,
      },

      containerSearchBar:{

      },
      searchBarContainer: {
        height: 50, 
        marginTop: 10,
      },
      barContainer: {
        width: '90%',
        height: '100%',
        marginLeft: '5%',
        marginVertical: 2,
      },
      searchInput: {
        height: '80%',
        backgroundColor: '#1B1A17',
        color: 'white',
        borderRadius: 5,
        paddingHorizontal: 10,
      },
      searchedContentContainer: {
        flex: 1,
        marginTop: 10,
      },
      filterRow: {
        height: 30,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
      },
      filterContainer: {
        backgroundColor: '#1B1A17',
        borderRadius: 15,
        height: '80%',
        minWidth: 80,
        marginRight: 10,
        justifyContent: 'center',
        flexDirection: 'row',
      },
      filterText:{
        marginLeft: 10,
        color: 'whitesmoke',
        fontFamily: 'Helvetica',
      },
      contentError:{
        width: '100%',
        height: '100%',
        justifyContent: 'center', 
        alignItems: 'center', 
      },
      errorLottieContainer: {
        width: '100%',
        height: '70%',
      },
      errorAddingContainer: {
        width: '100%',
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      },
      errorAddOrange: {
        color: '#FF8303',
        fontWeight: '600',
        fontSize: 18,
        fontFamily: 'Helvetica',
      },
      errorAddNormal: {
        fontSize: 18,
        fontFamily: 'Helvetica',
        color: '#000',
      },      

      topNewContainer: {
        marginTop: 10,
        flex: 1,
        height: 50,
        alignItems: 'center',
      },
      barContainerNew: {
        height: '100%',
        width: '90%',
        justifyContent: 'center',
      },
      searchInputNew: {
        height: '80%',
        backgroundColor: '#1B1A17',
        color: 'white',
        borderRadius: 5,
        paddingHorizontal: 10,
      },


      bottomNewContainer: {
        padding: 10,
      },

      muscleRow: {
        marginTop: 5,
        marginBottom: 10,
        width: '100%',
        height: 150,
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      muscleRectangle: {
        width: '49%',
        height: '100%',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 25,
      },
      selectedMuscleRectangle:{
        width: '49%',
        height: '100%',
        borderColor: '#FF8303',
        borderWidth: 1,
        borderRadius: 25,
      },

      addNewButton: {
        height: 50,
        backgroundColor: '#FF8303',
        width: '60%',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
      },
      
});

export default AddExercise;