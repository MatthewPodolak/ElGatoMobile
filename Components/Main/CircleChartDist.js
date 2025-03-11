import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { BlurView } from 'expo-blur';
import { VictoryPie } from 'victory-native';
import SettingsSvg from '../../assets/main/Diet/gear.svg';

const shadeColor = (color, percent) => {
  let num = parseInt(color.slice(1), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

const getShadeForIndex = (baseColor, index) => {
  const percent = -5 * index;
  return shadeColor(baseColor, percent);
};

const CircleChartDist = ({ name, data, isActive, userSystem, maxMakroData }) => {
  const [selectedDataType, setSelectedDataType] = useState("Calories");
  const [selectedChartOption, setSelectedChartOption] = useState("Meals");
  const [system, setSystem] = useState(userSystem ?? "metric");
  const [chartOptionsDropdownVisible, setChartOptionsDropdownVisible] = useState(false);
  const [dataDropdownVisible, setDataDropdownVisible] = useState(false);
  const [distMakroData] = useState(data ?? null);
  const [maxMakroIntake, setMaxMakroIntake] = useState(maxMakroData ?? null);
  const [dataActive] = useState(isActive ?? false);
  const [selectedSlice, setSelectedSlice] = useState(null);

  const dataOptions = ["Calories", "Proteins", "Fats", "Carbs"];
  const chartOptions = ["Meals", "Ingridients"];

  const getDistributionKey = (type) => {
    switch (type) {
      case 'Calories':
        return 'kcal';
      case 'Proteins':
        return 'protein';
      case 'Fats':
        return 'fats';
      case 'Carbs':
        return 'carbs';
      default:
        return 'kcal';
    }
  };

  const distributionKey = getDistributionKey(selectedDataType);

  let baseColor;
  switch (selectedDataType) {
    case "Calories":
      baseColor = "#FF6600";
      break;
    case "Proteins":
      baseColor = "#09a357";
      break;
    case "Fats":
      baseColor = "#A35709";
      break;
    case "Carbs":
      baseColor = "#030eff";
      break;
    default:
      baseColor = "#FF6600";
  }

  let pieData = [];
  let currentTotal = 0;
  if (distMakroData && distMakroData.meals) {
    if (selectedChartOption === "Ingridients") {
      const ingredientData = [];
      distMakroData.meals.forEach(meal => {
        if (meal.ingridients && meal.ingridients.length > 0) {
          meal.ingridients.forEach(ing => {
            ingredientData.push({
              x: ing.name,
              y: ing.distribution[distributionKey],
              ingIndex: ingredientData.length
            });
          });
        }
      });
      pieData = ingredientData.filter(item => item.y > 0);
      currentTotal = distMakroData.meals.reduce((sum, meal) => 
        sum + (meal.ingridients ? meal.ingridients.reduce((s, ing) => s + ing.distribution[distributionKey], 0): 0), 0);
    } else {
      pieData = distMakroData.meals
        .map((meal, i) => ({
          x: meal.name,
          y: meal.distribution[distributionKey],
          mealIndex: i,
        }))
        .filter(item => item.y > 0);
      currentTotal = distMakroData.meals.reduce((sum, meal) => sum + meal.distribution[distributionKey], 0);
    }
  }

  if (maxMakroIntake && typeof maxMakroIntake[distributionKey] === 'number') {
    const totalConsumed = pieData.reduce((sum, item) => sum + item.y, 0);
    const rawRemaining = maxMakroIntake[distributionKey] - totalConsumed;
    const remaining = parseFloat(rawRemaining.toFixed(1));
    if (remaining > 0) {
      pieData.push({
        x: 'Remaining',
        y: remaining,
      });
    }
  }

  const allowedTotal = maxMakroIntake && typeof maxMakroIntake[distributionKey] === 'number' ? Math.round(maxMakroIntake[distributionKey]) : Math.round(pieData.reduce((sum, item) => item.x !== 'Remaining' ? sum + item.y : sum, 0));
  const currentTextColor = currentTotal > allowedTotal ? 'red' : 'green';

  return (
    <View style={styles.outerContainer}>
      <BlurView style={styles.glassEffect} intensity={125} tint="light">
        {dataActive ? (
          <>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={[GlobalStyles.text20]}>{name}</Text>
                <TouchableOpacity
                  style={[styles.dropdownTextCont, { marginLeft: 7 }]}
                  onPress={() => setChartOptionsDropdownVisible(!chartOptionsDropdownVisible)}
                  activeOpacity={1}
                >
                  <Text style={[GlobalStyles.orange, GlobalStyles.text18]}>
                    {selectedChartOption}
                  </Text>
                  {chartOptionsDropdownVisible && (
                    <View style={styles.dropdownContainer}>
                      {chartOptions.filter(option => option !== selectedChartOption).map((option, index) => (
                        <TouchableOpacity 
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => { 
                            setSelectedChartOption(option); 
                            setChartOptionsDropdownVisible(false); 
                          }}
                        >
                          <Text style={GlobalStyles.text16}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.dataDropdownCont}>
                  <TouchableOpacity
                    onPress={() => setDataDropdownVisible(!dataDropdownVisible)}
                    activeOpacity={1}
                    style={styles.dataButton}
                  >
                    <Text style={[GlobalStyles.orange, GlobalStyles.text18]}>
                      {selectedDataType}
                    </Text>
                    <SettingsSvg width={22} height={22} fill="#000" style={{ marginLeft: 5 }} />
                  </TouchableOpacity>
                  {dataDropdownVisible && (
                    <View style={styles.dataDropdown}>
                      {dataOptions
                        .filter(option => option !== selectedDataType)
                        .map((option, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedDataType(option);
                              setDataDropdownVisible(false);
                            }}
                          >
                            <Text style={GlobalStyles.text16}>{option}</Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={[styles.labelContainer, GlobalStyles.center]}>
              <Text style={styles.totalLabel}>
                <Text style={[GlobalStyles.text18, { fontWeight: '600' }]}>Goal - </Text>
                {allowedTotal.toFixed()}
                <Text style={[GlobalStyles.text18, { fontWeight: '600' }]}>
                  {selectedDataType === 'Calories' ? ' kcal' : ' g'}
                </Text>
              </Text>
              <Text style={[styles.totalLabel, { marginLeft: 15 }]}>
                <Text style={[GlobalStyles.text18, { fontWeight: '600' }]}>Total - </Text>
                <Text style={{ color: currentTextColor }}>{currentTotal.toFixed()}</Text>
                <Text style={[GlobalStyles.text18, { fontWeight: '600' }]}>
                  {selectedDataType === 'Calories' ? ' kcal' : ' g'}
                </Text>
              </Text>
            </View>
            <View style={[styles.contentContainer, { position: 'relative' }]}>
              {distMakroData ? (
                pieData && pieData.length > 0 ? (
                  <View style={{ marginBottom: 25 }}>
                    <VictoryPie
                      data={pieData}
                      labels={({ datum }) => `${datum.y}`}
                      style={{
                        data: { 
                          fill: ({ datum }) =>
                            datum.x === "Remaining"
                              ? "#d3d3d3"
                              : selectedChartOption === "Ingridients"
                                ? getShadeForIndex(baseColor, datum.ingIndex)
                                : getShadeForIndex(baseColor, datum.mealIndex),
                        },
                        labels: { fontSize: 16, fill: "#000" }
                      }}
                      width={250}
                      height={250}
                      events={[
                        {
                          target: "data",
                          eventHandlers: {
                            onPressIn: () => {
                              return [{
                                target: "data",
                                mutation: (props) => {
                                  setSelectedSlice(props.datum);
                                  return null;
                                }
                              }];
                            }
                          }
                        }
                      ]}
                    />
                  </View>
                ) : (
                  <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                    <Text style={[GlobalStyles.text16]}>
                      No valid data available for {selectedDataType}
                    </Text>
                  </View>
                )
              ) : (
                <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                  <Text style={[GlobalStyles.text16]}>No valid data available</Text>
                </View>
              )}
              {selectedSlice && (
                <TouchableOpacity 
                  style={styles.overlayContainer}
                  onPress={() => setSelectedSlice(null)}
                  activeOpacity={1}
                >
                  <Text style={styles.overlayName}>{selectedSlice.x}</Text>
                  <Text style={styles.overlayValue}>
                    {selectedSlice.y}{selectedDataType === 'Calories' ? ' kcal' : ' g'}
                  </Text>
                  <Text style={styles.overlayClose}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <View style={[GlobalStyles.flex, GlobalStyles.center]}>
            <Text style={[GlobalStyles.text16]}>Something went wrong</Text>
          </View>
        )}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  glassEffect: {
    width: '100%',
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    overflow: 'hidden',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  titleContainer: {
    flex: 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    zIndex: 5,
  },
  dropdownTextCont: {
    position: 'relative',
    flex: 1,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    position: 'absolute',
    top: 40,
    left: -10,
    borderRadius: 5,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 99,
  },
  dataDropdownCont: {
    position: 'relative',
    marginLeft: 10,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataDropdown: {
    backgroundColor: '#fff',
    position: 'absolute',
    right: 0,
    top: 30,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  labelContainer: {
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  contentContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlayContainer: {
    position: 'absolute',
    top: 20,
    left: '10%',
    right: '10%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
  },
  overlayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  overlayValue: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  overlayClose: {
    color: '#FF6600',
    fontWeight: '600',
  },
});

export default CircleChartDist;
