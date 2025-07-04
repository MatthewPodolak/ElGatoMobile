import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { BlurView } from 'expo-blur';
import { VictoryChart, VictoryAxis, VictoryBar, VictoryLine } from 'victory-native';

const { width: screenWidth } = Dimensions.get('window');

const formatNumber = num => {
  if (num >= 1000) {
    const thousands = num / 1000;
    return thousands % 1 === 0
      ? `${thousands} k`
      : `${parseFloat(thousands.toFixed(1))} k`;
  }
  return num.toString();
};

const StepsChart = ({ name = 'Steps', dataa, isActive = true, settedPeriod = 'Week', stepsGoalDaily = 2000 }) => {
  const [selectedScale, setSelectedScale] = useState(settedPeriod);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [chartData, setChartData] = useState([]);
  const options = ['Week', 'Month', 'Year'];

  useEffect(() => {
    if (dataa && Array.isArray(dataa.records)) {
      setChartData(dataa.records);
    } else {
      setChartData([]);
    }
  }, [dataa]);

  const handleOptionSelect = option => {
    setSelectedScale(option);
    setDropdownVisible(false);
  };

  const generatePlotData = () => {
    const now = new Date();

    if (selectedScale === 'Week') {
      return [...Array(7)].map((_, i) => {
        const day = new Date(now);
        day.setDate(now.getDate() - (6 - i));
        const record = chartData.find(
          r => new Date(r.date).toDateString() === day.toDateString()
        );
        return { x: day, y: record ? record.value : 0 };
      });
    }

    if (selectedScale === 'Month') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return [...Array(daysInMonth)].map((_, i) => {
        const day = new Date(year, month, i + 1);
        const record = chartData.find(
          r => new Date(r.date).toDateString() === day.toDateString()
        );
        return { x: day, y: record ? record.value : 0 };
      });
    }

    if (selectedScale === 'Year') {
      const year = now.getFullYear();
      return [...Array(12)].map((_, i) => {
        const monthStart = new Date(year, i, 1);
        const monthEnd = new Date(year, i + 1, 0);
        const monthlyRecords = chartData.filter(r => {
          const d = new Date(r.date);
          return d >= monthStart && d <= monthEnd;
        });
        const total = monthlyRecords.reduce((sum, r) => sum + r.value, 0);
        return { x: monthStart, y: total };
      });
    }

    return [];
  };

  const plotData = generatePlotData();
  const yValues = plotData.map(d => d.y);
  const maxY = yValues.length ? Math.max(...yValues, stepsGoalDaily) : stepsGoalDaily;
  const padding = maxY * 0.1;
  const domainY = [0, maxY + padding];

  const getXAxisTicks = () => {
    if (selectedScale === 'Month') {
      const total = plotData.length;
      const interval = Math.ceil(total / 5);
      return plotData
        .filter((_, idx) => idx % interval === 0)
        .map(pt => pt.x);
    }
    return plotData.map(pt => pt.x);
  };

  const tickFormatter = date => {
    if (selectedScale === 'Year') {
      return date.toLocaleString('default', { month: 'short' });
    }
    return date.getDate();
  };

  const formattedMax = formatNumber(maxY);
  let leftPadding = 45;
  if (formattedMax.length === 3) leftPadding = 50;
  if (formattedMax.length >= 4) leftPadding = 55;

  return (
    <View style={styles.outerContainer}>
      <BlurView style={styles.glassEffect} intensity={125} tint="light">
        {isActive ? (
          <>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={[GlobalStyles.text20]}>{name}</Text>
                <TouchableOpacity
                  style={[styles.dropdownTextCont, { marginLeft: 7 }]}
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                  activeOpacity={1}
                >
                  <Text style={[GlobalStyles.orange, GlobalStyles.text18]}>
                    {selectedScale}
                  </Text>
                  {dropdownVisible && (
                    <View style={styles.dropdownContainer}>
                      {options
                        .filter(o => o !== selectedScale)
                        .map((option, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => handleOptionSelect(option)}
                          >
                            <Text style={GlobalStyles.text16}>{option}</Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.contentContainer}>
              {plotData.length === 0 ? (
                <View style={[styles.emptyContainer, GlobalStyles.center]}>
                  <Text style={[GlobalStyles.text16]}> No step data available. </Text>
                </View>
              ) : (
                <VictoryChart
                  height={240}
                  scale={{ x: 'time' }}
                  width={screenWidth * 0.9}
                  padding={{ top: 20, bottom: 50, left: leftPadding, right: 20 }}
                  domain={{ y: domainY }}
                  domainPadding={{ x: 20 }}
                >
                  <VictoryAxis
                    tickValues={getXAxisTicks()}
                    tickFormat={tickFormatter}
                    style={{
                      tickLabels: {
                        fontSize: 12,
                        padding: 8,
                        angle: -45,
                        textAnchor: 'end',
                      },
                    }}
                  />

                  <VictoryAxis
                    dependentAxis
                    tickFormat={tick => formatNumber(tick)}
                  />

                  {selectedScale !== 'Year' && (
                    <VictoryLine
                        data={plotData}
                        y={() => stepsGoalDaily}
                        style={{
                        data: {
                            stroke: '#000',
                            strokeDasharray: '7',
                            strokeWidth: 1,
                        },
                        }}
                    />
                    )}

                  <VictoryBar
                    data={plotData}
                    barRatio={0.6}
                    style={{ data: { fill: '#FF6600' } }}
                  />
                </VictoryChart>
              )}
            </View>
          </>
        ) : (
          <View style={[GlobalStyles.flex, GlobalStyles.center]}>
            <Text style={[GlobalStyles.text16]}>Chart inactive</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dropdownTextCont: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    position: 'absolute',
    top: '100%',
    left: 0,
    borderRadius: 5,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 99,
  },
  dropdownItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  contentContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
});

export default StepsChart;