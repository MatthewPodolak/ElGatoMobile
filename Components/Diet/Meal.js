import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import CloseIcon from '../../assets/main/Diet/x-lg.svg';
import EditIcon from '../../assets/main/Diet/pencil-square.svg';
import TrashIcon from '../../assets/main/Diet/trash3.svg';
import AddSquareIcon from '../../assets/main/Diet/plus-square.svg';
import HeartIcon from '../../assets/main/Diet/heart.svg';


const Meal = ({ meal, onRemoveMeal, onChangeMealName,navigation, addIngredientToMeal, onRemoveIngredientFromMeal, onChangeIngredientWeightValue  }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);
  const [newMealName, setNewMealName] = useState(meal.name);
  const [newWeightValue, setNewWeightValue] = useState('');

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

  const handleAddIngredient = () => {
    navigation.navigate('AddIngredient', {
      mealId: meal.publicId,
      mealName: meal.name,
    });
  };
  

  const handleNameSubmit = () => {
    setIsEditing(false);
    onChangeMealName(meal.publicId, newMealName);
  };

  const handleWeightSubmit = (ingredientId, mealId, publicId, name, oldWeight) => {
    const parsedNewWeight = parseInt(newWeightValue, 10);

    if(parsedNewWeight === 0 || parsedNewWeight === undefined || isNaN(parsedNewWeight)|| parsedNewWeight === oldWeight){
      //handle double
      setEditingIngredientIndex(null);
      return;
    } 

    onChangeIngredientWeightValue(mealId, publicId, name, oldWeight, parsedNewWeight);
    setEditingIngredientIndex(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <BlurView style={styles.glassEffect} intensity={125} tint="light">
          <View style={styles.topRow}>
            <View style={styles.headerText}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={newMealName}
                  onChangeText={setNewMealName}
                  onBlur={handleNameSubmit}
                  onSubmitEditing={handleNameSubmit}
                  autoFocus
                />
              ) : (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.mealText}>{meal.name}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerClose}>
              <TouchableOpacity style={{ marginRight: 5 }}>
                <HeartIcon fill={'#FF8303'} width={24} height={26} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onRemoveMeal(meal.publicId)}>
                <TrashIcon fill={'#000'} width={22} height={26} />
              </TouchableOpacity>
            </View>
          </View>
          <View style = {styles.hrLine}></View>
          <View style={styles.contentRow}>
            {meal.ingridient.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style = {styles.ingNameCont}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                </View>
                <View style = {styles.ingWeightCont}>
                  {editingIngredientIndex === index ? (
                    <TextInput
                      style={styles.input}
                      value={newWeightValue}
                      onChangeText={setNewWeightValue}
                      keyboardType="numeric"
                      onBlur={() => handleWeightSubmit(index, meal.publicId, ingredient.publicId, ingredient.name, ingredient.weightValue)}
                      autoFocus
                    />
                  ) : (
                    <Text style={styles.ingredientName}>{ingredient.weightValue} g</Text>
                  )}
                </View>
                <View style = {styles.ingOptionsCont}>
                  <TouchableOpacity onPress={() => {
                    setEditingIngredientIndex(index);
                    setNewWeightValue(String(ingredient.weightValue));
                  }}>
                    <EditIcon width={20} height={20} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onRemoveIngredientFromMeal(meal.publicId, ingredient.publicId, ingredient.name, ingredient.weightValue)}>
                    <CloseIcon fill={'#000'} width={20} height={20} />
                  </TouchableOpacity>
                </View>

              </View>
            ))}
              <View style={styles.ingredientRow}>
              <TouchableOpacity onPress={handleAddIngredient}>
                  <AddSquareIcon style={styles.addSquare} width={24} height={24}/>
                </TouchableOpacity>
              </View>
          </View>
          <View style = {styles.hrLine}></View>
          <View style={styles.summaryRow}>
            <View style={styles.kcal}>
                <Text>Kcal: {totalSummary.energyKcal.toFixed()} </Text>
            </View>
            <View style={styles.macros}>
                <Text>P: {totalSummary.proteins.toFixed(2)}g </Text>
                <Text>F: {totalSummary.fats.toFixed(2)}g </Text>
                <Text>C: {totalSummary.carbs.toFixed(2)}g </Text>
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
});

export default Meal;
