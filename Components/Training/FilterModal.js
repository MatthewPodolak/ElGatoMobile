import React, { useState, useEffect } from 'react';

import { Modal, View,StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, ScrollView, ImageBackground, TextInput } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles.js';

import Close from '../../assets/main/Diet/x-lg.svg';
import ChevUp from '../../assets/main/Diet/chevron-up.svg';
import ChevDown from '../../assets/main/Diet/chevron-down.svg';

const FilterModal = ({
  visible,
  closeFilterModal,
  activeFilters,
}) => {

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedMuscles, setSelectedMuscles] = useState([]);

  const handleApplyFilters = () => {
    let filterModel = {
      selectedOption: selectedOption,
      selectedEquipment: selectedEquipment,
      selectedDifficulties: selectedDifficulties,
      selectedMuscles: selectedMuscles,
    };

    closeFilterModal(filterModel);
  };

  const handleOptionPress = (id) => {
    setSelectedOption(id);
  };

    const sortingOptions = [
      { id: '1', label: 'A - Z' },
      { id: '2', label: 'Z - A' },
      { id: '3', label: 'Difficulty ++' },
      { id: '4', label: 'Difficulty --' },
    ];

    const difficultyOptions = [
        { id: '0', label: 'Easy'},
        { id: '1', label: 'Medium'},
        { id: '2', label: 'Hard'},
    ];

    const equipmentOptions = [
        { id: '0', label: 'None' },
        { id: '1', label: 'Body' },
        { id: '2', label: 'Cables' },
        { id: '3', label: 'Dumbbells' },
        { id: '4', label: 'Machine' },
        { id: '5', label: 'Barbel' },
        { id: '6', label: 'Other' },
    ];
    
    const handleEquipmentSelect = (id) => {
        setSelectedEquipment((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((item) => item !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    const handleDifficultiesSelect = (id) => {
        setSelectedDifficulties((prevSelected) => {
            if(prevSelected.includes(id)){
                return prevSelected.filter((item) => item !== id);
            }else{
                return [...prevSelected, id];
            }
        })
    }

    const renderLabelWithIcon = (label) => {
      if (label.includes('++')) {
        return (
          <View style={styles.labelContainer}>
            <Text style={GlobalStyles.text14}>{label.replace(' ++', '')}</Text>
            <ChevUp width={16} height={16} fill={"#000"} style={styles.chevron} />
          </View>
        );
      } else if (label.includes('--')) {
        return (
          <View style={styles.labelContainer}>
            <Text style={GlobalStyles.text14}>{label.replace(' --', '')}</Text>
            <ChevDown width={16} height={16} fill={"#000"} style={styles.chevron} />
          </View>
        );
      }
      return <Text style={GlobalStyles.text14}>{label}</Text>;
    };

    const handleAddMuscleGroup = (muscleGroup) => {
        setSelectedMuscles((prevSelected) => {
            if (prevSelected.includes(muscleGroup)) {
                return prevSelected.filter((item) => item !== muscleGroup);
            } else {
                return [...prevSelected, muscleGroup];
            }
        });
    };

  return (
    
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={closeFilterModal}
      transparent={true}
    >    
        <View style = {styles.elGatoAddOverlay}>
              <View style = {styles.content}>
                <TouchableWithoutFeedback onPress={() => closeFilterModal(activeFilters)}>
                    <View style = {styles.closingFeed}></View>
                </TouchableWithoutFeedback>
                <View style = {styles.contentCont}>
                    <ScrollView style = {styles.contentScrollable}>
                        <View style = {styles.topContainer}>
                            <Text style={[GlobalStyles.text18]}>Filters: </Text>
                            <TouchableOpacity onPress={() => closeFilterModal(activeFilters)}>
                                <Close width={18} height={18} fill={"#000"} />
                            </TouchableOpacity>
                        </View>
                        <View style={GlobalStyles.paddedHr}></View>  

                        <View style = {styles.filterNutritionCont}>
                            <View style = {styles.nutriTitle}> 
                                <Text style= {[GlobalStyles.text16, GlobalStyles.bold]}>Sorting</Text> 
                            </View>
                        </View>
                        <View style = {styles.sortingContainer}>
                        {sortingOptions.map((option) => (
                          <TouchableOpacity
                            key={option.id}
                            style={[
                              styles.option,
                              selectedOption === option.id && styles.selectedOption
                            ]}
                            onPress={() => handleOptionPress(option.id)}
                          >
                            {renderLabelWithIcon(option.label)}
                          </TouchableOpacity>
                        ))}
                        </View>  

                        <View style = {styles.filterNutritionCont}>
                            <View style = {styles.nutriTitle}> 
                                <Text style= {[GlobalStyles.text16, GlobalStyles.bold]}>Equipment</Text> 
                            </View>
                        </View>
                        <View style = {styles.sortingContainer}>
                        {equipmentOptions.map((option) => (
                          <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.option,
                                selectedEquipment.includes(option.id) && styles.selectedOption
                            ]}
                            onPress={() => handleEquipmentSelect(option.id)}
                          >
                            {<Text style={GlobalStyles.text14}>{option.label}</Text>}
                          </TouchableOpacity>
                        ))}
                        </View>

                        <View style = {styles.filterNutritionCont}>
                            <View style = {styles.nutriTitle}> 
                                <Text style= {[GlobalStyles.text16, GlobalStyles.bold]}>Difficulty</Text> 
                            </View>
                        <View style = {styles.sortingContainer}>
                        {difficultyOptions.map((option) => (
                          <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.option,
                                selectedDifficulties.includes(option.id) && styles.selectedOption
                            ]}
                            onPress={() => handleDifficultiesSelect(option.id)}
                          >
                            {<Text style={GlobalStyles.text14}>{option.label}</Text>}
                          </TouchableOpacity>
                        ))}
                        </View>
                      </View>  
                        
                       <View style = {styles.filterNutritionCont}>
                            <View style = {styles.nutriTitle}> 
                                <Text style= {[GlobalStyles.text16, GlobalStyles.bold]}>Muscles</Text> 
                            </View>
                            <View style={styles.muscleRow}>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Chest')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Chest') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('UpperChest')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('UpperChest') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.muscleRow}>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('LowerChest')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('LowerChest') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Back')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Back') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.muscleRow}>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Lats')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Lats') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Traps')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Traps') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.muscleRow}>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Biceps')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Biceps') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Triceps')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Triceps') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.muscleRow}>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Shoulders')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Shoulders') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Quads')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Quads') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.muscleRow}>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Hamstrings')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Hamstrings') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Glutes')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Glutes') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.muscleRow}>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Calves')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Calves') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleAddMuscleGroup('Abs')} style={[
                                    styles.muscleRectangle,
                                    selectedMuscles.includes('Abs') && styles.selectedMuscleRectangle
                                ]}>
                                    <ImageBackground style={styles.mainImg} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>
                       </View>

                       <View style={styles.bottomSpacing}></View>
                    </ScrollView>
                </View>

              </View>
              <TouchableOpacity onPress={handleApplyFilters}>
                <View style = {styles.elGatoAddConfirm}>
                  <Text style = {styles.elGatoConfirmText}>Apply filters</Text>
                </View>
              </TouchableOpacity>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({ 
    bottomSpacing: {
        height: 70,
    },
    elGatoAddOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'relative',
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
      closingFeed: {
        width: '100%',
        height: '20%',
      },
      content: {
        flex: 1,
      },
      contentCont: {
        position: 'absolute', 
        bottom: 0,             
        width: '100%',
        height: '80%',        
        backgroundColor: '#F0E3CA', 
      },
      contentScrollable: {
        flex: 1,               
        width: '100%',
      },
      topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%', 
        paddingHorizontal: 10,
        padding: 10,
      },
      filterNutritionCont: {
        marginTop: 15,
        marginBottom: 5,
        width: '100%',
        paddingHorizontal: 10,
      },
      nutriRow: {
        height: 50,
        flexDirection: 'row',
      },
      nutriText: {
        width: '30%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      },
      sortingContainer: {
        marginTop: 10,
        width: '100%',
        height: 'auto',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      option: {
        borderColor: '#1B1A17',
        borderWidth: 1,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        borderRadius: 15,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
      },
      selectedOption: {
        backgroundColor: '#FF8303',
        borderColor: '#1B1A17',
      },
      labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      chevron: {
        marginLeft: 5,
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
      }
});

export default FilterModal;
