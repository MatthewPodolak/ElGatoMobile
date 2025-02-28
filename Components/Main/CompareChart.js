import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { BlurView } from 'expo-blur';
import { VictoryChart, VictoryAxis, VictoryLine, VictoryScatter } from 'victory-native';
import SettingsSvg from '../../assets/main/Diet/gear.svg';

const { width: screenWidth } = Dimensions.get('window');

const CompareChart = ({ name, dataa, isActive, settedDataType, userSystem }) => {
  const [selectedDataType, setSelectedDataType] = useState(settedDataType ?? "Weight");
  const [system, setSystem] = useState(userSystem??"metric");
  const [dataDropdownVisible, setDataDropdownVisible] = useState(false);
  const [exerciseData] = useState(dataa ?? null);
  const [dataActive] = useState(isActive ?? false);
  const dataOptions = ["Repetitions", "Weight", "Volume"];

  const recentSessions = exerciseData && exerciseData.pastData ? [...exerciseData.pastData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 2) : [];

  const trainingData = recentSessions.map(session => {
    const points = session.series.map((serie, index) => {
      let value;
      if (selectedDataType === "Weight") {
        value = system !== "metric" ? serie.weightLbs : serie.weightKg;
      } else if (selectedDataType === "Volume") {
        const weight = system !== "metric" ? serie.weightLbs : serie.weightKg;
        value = weight * serie.repetitions;
      } else {
        value = serie.repetitions;
      }
      return {
        x: index + 1,
        y: value,
      };
    });
    if (points.length === 1) {
      points.push({ x: points[0].x + 0.1, y: points[0].y });
    }
    return points;
  });

  const allPoints = trainingData.flat();
  const yValues = allPoints.map(pt => pt.y);
  const minY = yValues.length ? Math.min(...yValues) : 0;
  const maxY = yValues.length ? Math.max(...yValues) : 1;
  const rangeY = maxY - minY;
  const marginY = rangeY ? rangeY * 0.1 : 10;
  const yDomain = [minY - marginY, maxY + marginY];

  const leftPadding = 50;

  return (
    <View style={styles.outerContainer}>
      <BlurView style={styles.glassEffect} intensity={125} tint="light">
        {dataActive ? (
          <>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={[GlobalStyles.text20]}>{name}</Text>
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
            <View style={styles.contentContainer}>
              {(!exerciseData ||
                !exerciseData.pastData ||
                exerciseData.pastData.length === 0) ? (
                <View style={[styles.emptyContainer, GlobalStyles.center]}>
                  <Text style={[GlobalStyles.text16]}>
                    There is currently no data for this exercise.
                  </Text>
                  <Text style={[GlobalStyles.text14]}>
                    Chart will appear when you start{' '}
                    <Text style={[GlobalStyles.orange]}>training</Text>.
                  </Text>
                </View>
              ) : (
                <VictoryChart
                  width={screenWidth * 0.9}
                  padding={{ top: 20, bottom: 80, left: leftPadding, right: 20 }}
                  domainPadding={{ x: 20, y: 20 }}
                  domain={{ y: yDomain }}
                  style={{ parent: { alignItems: 'center', justifyContent: 'center' } }}
                >
                  <VictoryAxis
                    style={{
                      axisLabel: { padding: 30, fontSize: 12 },
                      tickLabels: { fontSize: 12, padding: 5 },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axisLabel: { padding: 35, fontSize: 12 },
                      tickLabels: { fontSize: 12, padding: 5 },
                    }}
                  />
                      <VictoryLine
                        data={trainingData[0]}
                        style={{
                          data: {
                            stroke: "#FF6600",
                            strokeWidth: 2.4,
                          },
                        }}
                      />
                      <VictoryScatter
                        data={trainingData[0]}
                        size={4}
                        style={{
                          data: { fill: "#FF6600" },
                        }}
                      />
                      <VictoryLine
                        data={trainingData[1]}
                        style={{
                          data: {
                            stroke: "#000",
                            strokeWidth: 2.4,
                          },
                        }}
                      />
                      <VictoryScatter
                        data={trainingData[1]}
                        size={4}
                        style={{
                          data: { fill: "#000" },
                        }}
                      />
                </VictoryChart>
              )}
            </View>
          </>
        ) : (
          <View style={[GlobalStyles.flex, GlobalStyles.center]}>
            <Text style={[GlobalStyles.text16]}>something went wrong</Text>
          </View>
        )}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: 300,
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
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    zIndex: 5,
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
    shadowColor: '#000',
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
  contentContainer: {
    flex: 0.8,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
  },
});

export default CompareChart;
