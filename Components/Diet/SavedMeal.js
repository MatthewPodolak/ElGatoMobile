import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import ChevronDown from '../../assets/main/Diet/chevron-down.svg';
import AddIcon from '../../assets/main/Diet/plus-lg.svg';
import EditIcon from '../../assets/main/Diet/pencil-square.svg';
import CloseIcon from '../../assets/main/Diet/x-lg.svg';

import { GlobalStyles } from '../../Styles/GlobalStyles';

const SavedMeal = ({ meal, addMeal, updateIngridient, isSetted }) => {  
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const contentAnimation = useRef(new Animated.Value(0)).current;
  const iconAnimation = useRef(new Animated.Value(0)).current;

  const [editingIngridientIndex, setEditingIngridientIndex] = useState(null);
  const [newWeightValue, setNewWeightValue] = useState('');
  const [oldWeightValue , setOdlWeightValue] = useState('');

  const totalSummary = meal.ingridient.reduce(
    (totals, ingredient) => {
      const factor = ingredient.weightValue / 100;
      return {
        energyKcal: totals.energyKcal + (ingredient.energyKcal * factor),
        proteins: totals.proteins + (ingredient.proteins * factor),
        fats: totals.fats + (ingredient.fats * factor),
        carbs: totals.carbs + (ingredient.carbs * factor),
      };
    },
    { energyKcal: 0, proteins: 0, fats: 0, carbs: 0 }
  );
  const [summary, setSummary] = useState(totalSummary);

  const editIngridient = (index, currentWeight) => {
    setEditingIngridientIndex(index);
    setOdlWeightValue(currentWeight);
  };

  const handleWeightSubmit = (name, publicId, isServings) => {
    let newWeightForUpdate = 0;

    if(isServings){
      const weightRegex = /^\d+([.,]\d+)?$/;
      if (!weightRegex.test(newWeightValue)) {
        //error
        setEditingIngridientIndex(null);
        return;
      }

      const standardizedWeight = parseFloat(newWeightValue.replace(',', '.'));
      const kcalRef = standardizedWeight * 100;
      if(kcalRef === oldWeightValue) { setEditingIngridientIndex(null); return; }

      newWeightForUpdate = kcalRef;

    }else{
      const parsedNewWeight = parseInt(newWeightValue, 10);  
      if(parsedNewWeight === 0 || parsedNewWeight === undefined || isNaN(parsedNewWeight)|| parsedNewWeight === oldWeightValue){
        //handle double error
        setEditingIngridientIndex(null);
        return;
      } 
      newWeightForUpdate = parsedNewWeight;
    }
    setEditingIngridientIndex(null);
    updateTotalSummary(name,publicId,newWeightForUpdate);
    const updateModel = {
      mealName: meal.name,
      ingridientName: name,
      publicId: publicId,
      newWeight: newWeightForUpdate
    };
    updateIngridient(updateModel);
  };

  const updateTotalSummary = (name, publicId, newWeightForUpdate) => {

    const ingredientToUpdate = meal.ingridient.find(
      (ingredient) => ingredient.name === name && ingredient.publicId === publicId
    );
  
    if (!ingredientToUpdate) {
      //ERROR
      console.error("Ingredient not found");
      return;
    }
  
    const oldFactor = ingredientToUpdate.weightValue / 100;
    const newFactor = newWeightForUpdate / 100;
  
    const updatedSummary = {
      energyKcal:
        summary.energyKcal -
        ingredientToUpdate.energyKcal * oldFactor +
        ingredientToUpdate.energyKcal * newFactor,
      proteins:
        summary.proteins -
        ingredientToUpdate.proteins * oldFactor +
        ingredientToUpdate.proteins * newFactor,
      fats:
        summary.fats -
        ingredientToUpdate.fats * oldFactor +
        ingredientToUpdate.fats * newFactor,
      carbs:
        summary.carbs -
        ingredientToUpdate.carbs * oldFactor +
        ingredientToUpdate.carbs * newFactor,
    };
  
    ingredientToUpdate.weightValue = newWeightForUpdate;
  
    setSummary(updatedSummary);
  };
  
  

  const addMealButtonClicked = (meal) => {
    addMeal(meal);
  };

  const toggleExpand = () => {
    if (isContentExpanded) {
      Animated.parallel([
        Animated.timing(contentAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false, 
        }),
        Animated.timing(iconAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsContentExpanded(false));
    } else {
      setIsContentExpanded(true);
      Animated.parallel([
        Animated.timing(contentAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(iconAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
      <BlurView style={isSetted ? styles.pickedGlassEffect : styles.glassEffect} intensity={125} tint="light">
          <View style={styles.topRow}>
            <View style={styles.headerText}>
              <Text style={GlobalStyles.text16}>{meal.name}</Text>
            </View>
            <View style={styles.headerClose}>
              <TouchableOpacity onPress={() => addMealButtonClicked(meal)} style={{ marginRight: 5 }}>
                <AddIcon width={26} height={26} fill={'#FF8303'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleExpand}>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: iconAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      },
                    ],
                  }}
                >
                  <ChevronDown width={26} height={26} fill={'#000'} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View
            style={[
              styles.expandableContainer,
              {
                maxHeight: contentAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
                }),
              },
            ]}
          >
            <View style={[styles.hr, styles.margins]}></View>
            <View>
                {meal.ingridient.map((ing, index) => (      
                    <View key={index} style={styles.ingredientRow}>
                        <View style = {styles.ingNameCont}>
                            <Text style={styles.ingredientName}>{ing.name}</Text>
                        </View>
                        <View style={styles.ingWeightCont}>
                            {ing.servings ? (
                              <View>
                                {editingIngridientIndex == index ? (
                                  <TextInput
                                    style={styles.input}
                                    placeholder="1"
                                    value={newWeightValue}
                                    placeholderTextColor="#888"
                                    selectionColor="#FF8303"
                                    keyboardType="numeric"
                                    onChangeText={setNewWeightValue}
                                    onBlur={() => handleWeightSubmit(ing.name, ing.publicId, true)}
                                    autoFocus
                                  />
                                ): (
                                  <Text style={styles.ingredientName}>{ing.weightValue / 100} s.</Text>
                                )}                               
                              </View>
                            ) : (
                              <View>
                                {editingIngridientIndex == index ? (
                                  <TextInput
                                    style={styles.input}
                                    placeholder="100"
                                    value={newWeightValue}
                                    placeholderTextColor="#888"
                                    selectionColor="#FF8303"
                                    keyboardType="numeric"
                                    onChangeText={setNewWeightValue}
                                    onBlur={() => handleWeightSubmit(ing.name, ing.publicId, false)}
                                    autoFocus
                                  />
                                ): (
                                  <Text style={styles.ingredientName}>{ing.weightValue} g</Text>
                                )}                                
                              </View>
                            )}
                        </View>
                        <View style = {styles.ingOptionsCont}>
                            <TouchableOpacity onPress={() => editIngridient(index, ing.weightValue)}>
                                <EditIcon width={20} height={20} />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <CloseIcon fill={'#000'} width={20} height={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
            <View style={[styles.hr, styles.margins]}></View>
            <View style={styles.summaryRow}>
                <View style={styles.kcal}>
                    <Text>Kcal: {summary.energyKcal.toFixed()} </Text>
                </View>
                <View style={styles.macros}>
                    <Text>P: {summary.proteins.toFixed(2)}g </Text>
                    <Text>F: {summary.fats.toFixed(2)}g </Text>
                    <Text>C: {summary.carbs.toFixed(2)}g </Text>
                </View>
            </View>

          </Animated.View>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: 'whitesmoke',
  },
  margins: {
    marginTop: 10,
    marginBottom: 10,
  },
  hr:{
    borderBottomColor: 'black',
    opacity: 0.2,
    borderBottomWidth: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassEffect: {
    width: '90%',
    padding: 15,
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
  pickedGlassEffect:{
    width: '90%',
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: 'red',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  headerClose: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  expandableContainer: {
    overflow: 'hidden',
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
    ingredientRow: {
        flexDirection: 'row',
        marginBottom: 5,
        marginTop: 5,
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
      input: {
        color: '#000',
        fontSize: 18,
        fontFamily: 'Helvetica',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
      },
});

export default SavedMeal;
