import React, { useState, useEffect } from 'react';

import { Modal, View,StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, ScrollView, Image, TextInput } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles.js';

import Close from '../../assets/main/Diet/x-lg.svg';
import ChevUp from '../../assets/main/Diet/chevron-up.svg';
import ChevDown from '../../assets/main/Diet/chevron-down.svg';

const FilterModal = ({
  visible,
  closeFilterModal
}) => {

  const [selectedOption, setSelectedOption] = useState(null);

  const sortingOptions = [
    { id: '1', label: 'A - Z' },
    { id: '2', label: 'Z - A' },
    { id: '3', label: 'Most Liked' },
    { id: '4', label: 'Kcal ++' },
    { id: '5', label: 'Kcal --' },
    { id: '6', label: 'Protein ++' },
    { id: '7', label: 'Protein --' },
    { id: '8', label: 'Fats ++' },
    { id: '9', label: 'Fats --' },
    { id: '10', label: 'Carbs ++' },
    { id: '11', label: 'Carbs --' },
  ];

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

  const handleOptionPress = (id) => {
    setSelectedOption(id);
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
                <TouchableWithoutFeedback onPress={closeFilterModal}>
                    <View style = {styles.closingFeed}></View>
                </TouchableWithoutFeedback>
                <View style = {styles.contentCont}>
                    <ScrollView style = {styles.contentScrollable}>
                      <View style = {styles.topContainer}>
                        <Text style={[GlobalStyles.text18]}>Filters: </Text>
                        <TouchableOpacity onPress={closeFilterModal}>
                          <Close width={18} height={18} fill={"#000"} />
                        </TouchableOpacity>
                      </View>
                      <View style={GlobalStyles.paddedHr}></View>

                      <View style = {styles.filterNutritionCont}>
                        <View style = {styles.nutriTitle}> 
                          <Text style= {[GlobalStyles.text16, GlobalStyles.bold]}>Sorting</Text> 
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
                      </View>

                      <View style={styles.filterNutritionCont}>
                        <View style = {styles.nutriTitle}> 
                          <Text style= {[GlobalStyles.text16, GlobalStyles.bold]}>Nutritions</Text> 
                        </View>
                        <View style = {styles.nutriRow}>
                          <View style = {styles.nutriText}>
                            <Text style = {[GlobalStyles.text18]}>Calories </Text>
                          </View>
                          <View style = {styles.nutriInput}>
                            <View style = {styles.nutriInputWrapper}>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                              <Text style = {[GlobalStyles.text20]}>-</Text>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                            </View>                         
                          </View>
                          <View style = {styles.nutriUnit}>
                            <Text style = {GlobalStyles.text16}>kcal</Text>
                          </View>
                        </View>

                        <View style = {styles.nutriRow}>
                          <View style = {styles.nutriText}>
                            <Text style = {[GlobalStyles.text18]}>Proteins </Text>
                          </View>
                          <View style = {styles.nutriInput}>
                            <View style = {styles.nutriInputWrapper}>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                              <Text style = {[GlobalStyles.text20]}>-</Text>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                            </View>                         
                          </View>
                          <View style = {styles.nutriUnit}>
                            <Text style = {GlobalStyles.text16}>g</Text>
                          </View>
                        </View>

                        <View style = {styles.nutriRow}>
                          <View style = {styles.nutriText}>
                            <Text style = {[GlobalStyles.text18]}>Fats </Text>
                          </View>
                          <View style = {styles.nutriInput}>
                            <View style = {styles.nutriInputWrapper}>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                              <Text style = {[GlobalStyles.text20]}>-</Text>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                            </View>                         
                          </View>
                          <View style = {styles.nutriUnit}>
                            <Text style = {GlobalStyles.text16}>g</Text>
                          </View>
                        </View>

                        <View style = {styles.nutriRow}>
                          <View style = {styles.nutriText}>
                            <Text style = {[GlobalStyles.text18]}>Carbs </Text>
                          </View>
                          <View style = {styles.nutriInput}>
                            <View style = {styles.nutriInputWrapper}>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                              <Text style = {[GlobalStyles.text20]}>-</Text>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                            </View>                         
                          </View>
                          <View style = {styles.nutriUnit}>
                            <Text style = {GlobalStyles.text16}>g</Text>
                          </View>
                        </View>
                      </View>

                      <View style = {[styles.filterNutritionCont]}>
                        <View style = {styles.nutriTitle}> 
                          <Text style= {[GlobalStyles.text16, GlobalStyles.bold]}>Preparation time</Text> 
                        </View>

                        <View style = {styles.nutriRow}>
                          <View style = {styles.nutriText}>
                            <Text style = {[GlobalStyles.text18]}>Min - Max </Text>
                          </View>
                          <View style = {styles.nutriInput}>
                            <View style = {styles.nutriInputWrapper}>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                              <Text style = {[GlobalStyles.text20]}>-</Text>
                              <TextInput 
                                style={styles.nInput} 
                                keyboardType="numeric"
                                selectionColor="#FF8303" 
                              />
                            </View>                         
                          </View>
                          <View style = {styles.nutriUnit}>
                            <Text style = {GlobalStyles.text16}>minutes</Text>
                          </View>
                        </View>
                      </View>

                      <View style = {styles.filterNutritionCont}>
                        <View style = {styles.nutriTitle}> 
                          <Text style= {[GlobalStyles.text16, GlobalStyles.bold]}>Popular categories</Text> 
                        </View>

                        {/*OPTIONSS!!!*/}

                      </View>

                    </ScrollView>
                </View>
              </View>
              <TouchableOpacity onPress={closeFilterModal}>
                <View style = {styles.elGatoAddConfirm}>
                  <Text style = {styles.elGatoConfirmText}>Apply filters</Text>
                </View>
              </TouchableOpacity>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({ 
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
      nutriInput: {
        width: '55%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      },
      nutriUnit: {
        width: '15%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      },

      nutriInputWrapper: {
        flexDirection: 'row',
      },
      nInput: {
        borderColor: '#1B1A17',
        borderWidth: 1,
        width: "35%",
        marginLeft: 10,
        marginRight: 10,
        paddingLeft: 10,
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
      }
});

export default FilterModal;
