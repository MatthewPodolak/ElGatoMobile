import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import CloseIcon from '../../assets/main/Diet/x-lg.svg';
import EditIcon from '../../assets/main/Diet/pencil-square.svg';
import TrashIcon from '../../assets/main/Diet/trash3.svg';
import AddSquareIcon from '../../assets/main/Diet/plus-square.svg';
import HeartIcon from '../../assets/main/Diet/heart.svg';

import { MealStyles } from '../../Styles/Components/MealStyles.js';


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
    <SafeAreaView style={MealStyles.safeArea}>
      <View style={MealStyles.mainContainer}>
        <BlurView style={MealStyles.glassEffect} intensity={125} tint="light">
          <View style={MealStyles.topRow}>
            <View style={MealStyles.headerText}>
              {isEditing ? (
                <TextInput
                  style={MealStyles.input}
                  value={newMealName}
                  onChangeText={setNewMealName}
                  onBlur={handleNameSubmit}
                  onSubmitEditing={handleNameSubmit}
                  autoFocus
                />
              ) : (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={MealStyles.mealText}>{meal.name}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={MealStyles.headerClose}>
              <TouchableOpacity style={{ marginRight: 5 }}>
                <HeartIcon fill={'#FF8303'} width={24} height={26} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onRemoveMeal(meal.publicId)}>
                <TrashIcon fill={'#000'} width={22} height={26} />
              </TouchableOpacity>
            </View>
          </View>
          <View style = {MealStyles.hrLine}></View>
          <View style={MealStyles.contentRow}>
            {meal.ingridient.map((ingredient, index) => (
              <View key={index} style={MealStyles.ingredientRow}>
                <View style = {MealStyles.ingNameCont}>
                  <Text style={MealStyles.ingredientName}>{ingredient.name}</Text>
                </View>
                <View style = {MealStyles.ingWeightCont}>
                  {editingIngredientIndex === index ? (
                    <TextInput
                      style={MealStyles.input}
                      value={newWeightValue}
                      onChangeText={setNewWeightValue}
                      keyboardType="numeric"
                      onBlur={() => handleWeightSubmit(index, meal.publicId, ingredient.publicId, ingredient.name, ingredient.weightValue)}
                      autoFocus
                    />
                  ) : (
                    <Text style={MealStyles.ingredientName}>{ingredient.weightValue} g</Text>
                  )}
                </View>
                <View style = {MealStyles.ingOptionsCont}>
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
              <View style={MealStyles.ingredientRow}>
              <TouchableOpacity onPress={handleAddIngredient}>
                  <AddSquareIcon style={MealStyles.addSquare} width={24} height={24}/>
                </TouchableOpacity>
              </View>
          </View>
          <View style = {MealStyles.hrLine}></View>
          <View style={MealStyles.summaryRow}>
            <View style={MealStyles.kcal}>
                <Text>Kcal: {totalSummary.energyKcal.toFixed()} </Text>
            </View>
            <View style={MealStyles.macros}>
                <Text>P: {totalSummary.proteins.toFixed(2)}g </Text>
                <Text>F: {totalSummary.fats.toFixed(2)}g </Text>
                <Text>C: {totalSummary.carbs.toFixed(2)}g </Text>
            </View>
        </View>
        </BlurView>
      </View>
      <View style={MealStyles.spacing}></View>
          
    </SafeAreaView>
  );
};

export default Meal;
