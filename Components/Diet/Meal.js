import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const Meal = ({ meal, onRemoveMeal }) => {
  console.log(meal);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <BlurView style={styles.glassEffect} intensity={125} tint="light">
          <View style={styles.topRow}>
            <View style={styles.headerText}>
              <Text style={styles.text}>{meal.name}</Text>
            </View>
            <View style={styles.headerClose}>
              <TouchableOpacity onPress={() => onRemoveMeal(meal.publicId)}>
                <Text style={styles.text}>X</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.contentRow}>
            {meal.ingridient.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientName}>{ingredient.weightValue} g</Text>
                <TouchableOpacity>
                  <Text style={styles.ingredientEdit}>E </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.ingredientClose}> X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.kcal}><Text>Kcal: {totalSummary.energyKcal.toFixed(2)} </Text></View>
            <View style={styles.prot}><Text>P: {totalSummary.proteins.toFixed(2)}g </Text></View>
            <View style={styles.fat}><Text>F: {totalSummary.fats.toFixed(2)}g </Text></View>
            <View style={styles.carbs}><Text>C: {totalSummary.carbs.toFixed(2)}g </Text></View>
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
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  headerClose: {
    alignItems: 'flex-end',
  },
  contentRow: {
    marginBottom: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ingredientName: {
    flex: 2,
    color: '#000',
  },
  ingredientWeight: {
    flex: 1,
    color: '#000',
  },
  ingredientEdit: {
    flex: 0.5,
    color: '#000',
  },
  ingredientClose: {
    flex: 0.5,
    color: '#000',
  },
  text: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Helvetica',
  },
  summaryRow: {
    width: '100%',
    flexDirection: 'row',
  },
  kcal: {
    marginBottom: 5,
  },
  prot: {
    marginBottom: 5,
  },
  fat: {
    marginBottom: 5,
  },
  carbs: {
    marginBottom: 5,
  },
  spacing: {
    height: 10,
  },
});

export default Meal;
