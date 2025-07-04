import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { BlurView } from 'expo-blur';
import { VictoryChart, VictoryAxis, VictoryArea, VictoryScatter } from 'victory-native';
import AddSvg from '../../assets/main/Diet/plus-lg.svg';

const { width: screenWidth } = Dimensions.get('window');

const formatNumber = num => {
  if (num >= 1000) {
    const thousands = num / 1000;
    return thousands % 1 === 0 ? `${thousands} k` : `${parseFloat(thousands.toFixed(1))} k`;
  }
  return num.toString();
};

const WeightChart = ({ name = 'Weight', dataa, isActive = true, settedPeriod = 'Week', navigation, system }) => {
  const [selectedScale, setSelectedScale] = useState(settedPeriod);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [chartData, setChartData] = useState([]);
  const options = ['Week', 'Month', 'Year', 'All'];

  useEffect(() => {
    if (dataa && Array.isArray(dataa.records)) setChartData(dataa.records);
    else setChartData([]);
  }, [dataa]);

  const handleOptionSelect = option => {
    setSelectedScale(option);
    setDropdownVisible(false);
  };

  const getFilteredData = () => {
    const now = new Date();
    let filtered = [...chartData];
    switch (selectedScale) {
      case 'Week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 6);
        filtered = filtered.filter(item => new Date(item.date) >= weekAgo);
        break;
      }
      case 'Month': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        filtered = filtered.filter(item => new Date(item.date) >= monthAgo);
        break;
      }
      case 'Year': {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        filtered = filtered.filter(item => new Date(item.date) >= yearAgo);
        break;
      }
      default:
        break;
    }
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const filteredData = getFilteredData();
  const plotData = filteredData.map(item => ({
    x: new Date(item.date),
    y: system === 'metric' ? item.weightMetric : item.weightImperial
  }));

  const yValues = plotData.map(d => d.y);
  const hasData = yValues.length > 0;
  const minY = hasData ? Math.min(...yValues) : 0;
  const maxY = hasData ? Math.max(...yValues) : 0;
  const padding = hasData ? (maxY - minY) * 0.1 : 5;
  const domainY = hasData
    ? [minY - padding, maxY + padding]
    : [0, 10];

  const getXAxisTicks = () => plotData.map(pt => pt.x);
  const tickFormatter = tick => new Date(tick).getDate();

  const formattedMax = formatNumber(maxY);
  let leftPadding = 45;
  if (formattedMax.length === 3) leftPadding = 50;
  if (formattedMax.length >= 4) leftPadding = 55;

  const addPressed = () => {
    navigation?.navigate('AddWeightScreen', { system });
  };

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
                  <Text style={[GlobalStyles.orange, GlobalStyles.text18]}>{selectedScale}</Text>
                  {dropdownVisible && (
                    <View style={styles.dropdownContainer}>
                      {options.filter(o => o !== selectedScale).map((option, index) => (
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
              <TouchableOpacity style={styles.settingsButton} onPress={addPressed}>
                <AddSvg width={22} height={22} fill="#000" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
            <View style={styles.contentContainer}>
              {plotData.length === 0 ? (
                <View style={[styles.emptyContainer, GlobalStyles.center]}>
                  <Text style={[GlobalStyles.text16]}>No weight data available.</Text>
                </View>
              ) : (
                <VictoryChart
                  height={240}
                  scale={{ x: 'time' }}
                  width={screenWidth * 0.9}
                  padding={{ top: 20, bottom: 50, left: leftPadding, right: 20 }}
                  domain={{ y: domainY }}
                >
                  <VictoryAxis
                    tickValues={getXAxisTicks()}
                    tickFormat={tickFormatter}
                    style={{ tickLabels: { fontSize: 12, padding: 5 } }}
                    fixLabelOverlap
                  />
                  <VictoryAxis dependentAxis tickFormat={tick => formatNumber(tick)} />
                  <VictoryArea
                    data={plotData}
                    style={{ data: { stroke: '#FF6600', fill: 'rgba(255,102,0,0.2)', strokeWidth: 2.4 } }}
                  />
                  <VictoryScatter data={plotData} size={4} style={{ data: { fill: '#FF6600' } }} />
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
  settingsButton: {
    padding: 5,
  },
});

export default WeightChart;