import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import ChevronDown from '../../assets/main/Diet/chevron-down.svg';
import AddIcon from '../../assets/main/Diet/plus-lg.svg';
import EditIcon from '../../assets/main/Diet/pencil-square.svg';
import CloseIcon from '../../assets/main/Diet/x-lg.svg';


import { GlobalStyles } from '../../Styles/GlobalStyles';

const SavedMeal = ({ meal, addMeal }) => {
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const contentAnimation = useRef(new Animated.Value(0)).current;
  const iconAnimation = useRef(new Animated.Value(0)).current;

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
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <BlurView style={styles.glassEffect} intensity={125} tint="light">
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
                                <Text style={styles.ingredientName}>{ing.weightValue / 100} s.</Text>
                            ) : (
                                <Text style={styles.ingredientName}>{ing.weightValue} g</Text>
                            )}
                        </View>
                        <View style = {styles.ingOptionsCont}>
                            <TouchableOpacity>
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
                    <Text>Kcal: {totalSummary.energyKcal.toFixed()} </Text>
                </View>
                <View style={styles.macros}>
                    <Text>P: {totalSummary.proteins.toFixed(2)}g </Text>
                    <Text>F: {totalSummary.fats.toFixed(2)}g </Text>
                    <Text>C: {totalSummary.carbs.toFixed(2)}g </Text>
                </View>
            </View>

          </Animated.View>
        </BlurView>
      </View>
    </SafeAreaView>
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
});

export default SavedMeal;
