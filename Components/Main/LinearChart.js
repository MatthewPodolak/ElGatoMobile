import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { BlurView } from 'expo-blur';
import { VictoryChart, VictoryAxis, VictoryArea, VictoryScatter } from 'victory-native';
import SettingsSvg from '../../assets/main/Diet/gear.svg';

const { width: screenWidth } = Dimensions.get('window');

const formatNumber = (num) => {
  if (num >= 1000) {
    const thousands = num / 1000;
    if (thousands % 1 === 0) {
      return `${thousands} k`;
    } else {
      return `${parseFloat(thousands.toFixed(1))} k`;
    }
  }
  return num.toString();
};

const LinearChart = ({ name, dataa, isActive, settedPeriod, settedDataType }) => {
  const [selectedScale, setSelectedScale] = useState(settedPeriod ?? "Week");
  const [selectedDataType, setSelectedDataType] = useState(settedDataType ?? "Volume");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dataDropdownVisible, setDataDropdownVisible] = useState(false);
  const [exerciseData, setExerciseData] = useState(dataa ?? null);
  const [dataActive, setDataActive] = useState(isActive ?? false);
  
  const options = ["Week", "Month", "Year", "All", "Last 5", "Last 10", "Last 15"];
  const dataOptions = ["Repetitions", "Volume"];

  const handleOptionSelect = (option) => {
    setSelectedScale(option);
    setDropdownVisible(false);
  };

  const getFilteredData = () => {
    if (!exerciseData || !exerciseData.pastData) return [];
    
    const pastData = [...exerciseData.pastData];
    const now = new Date();
    let filtered = [];
    
    if (selectedScale === "Week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      filtered = pastData.filter(item => new Date(item.date) >= weekAgo);
    } else if (selectedScale === "Month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      filtered = pastData.filter(item => new Date(item.date) >= monthAgo);
    } else if (selectedScale === "Year") {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      filtered = pastData.filter(item => new Date(item.date) >= yearAgo);
    } else if (selectedScale === "All") {
      filtered = pastData;
    } else if (
      selectedScale === "Last 5" ||
      selectedScale === "Last 10" ||
      selectedScale === "Last 15"
    ) {
      filtered = pastData.sort((a, b) => new Date(a.date) - new Date(b.date));
      const count = selectedScale === "Last 5" ? 5 : selectedScale === "Last 10" ? 10 : 15;
      filtered = filtered.slice(-count);
    }
    
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    return filtered;
  };

  const filteredData = getFilteredData();

  const computeMetric = (item) => {
    if (item.series && item.series.length > 0) {
      return item.series.reduce((sum, seriesItem) => {
        if (selectedDataType === "Repetitions") {
          return sum + seriesItem.repetitions;
        } else {
          return sum + (seriesItem.weightKg * seriesItem.repetitions);
        }
      }, 0);
    }
    return 0;
  };

  let chartData;

  if (selectedScale === "Year") {
    const groups = {};
    filteredData.forEach(item => {
      const dateObj = new Date(item.date);
      const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
      const metric = computeMetric(item);
      groups[monthKey] = (groups[monthKey] || 0) + metric;
    });
    chartData = Object.keys(groups).map(key => {
      const [year, month] = key.split('-');
      return { x: new Date(parseInt(year), parseInt(month), 1), y: groups[key] };
    });
    chartData.sort((a, b) => a.x - b.x);
  } else if (selectedScale === "All") {
    if (!filteredData || filteredData.length === 0) {
      chartData = [];
    } else {
      const startDate = new Date(filteredData[0].date);
      const endDate = new Date(filteredData[filteredData.length - 1].date);
      const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        chartData = filteredData.map(item => {
          return { x: new Date(item.date), y: computeMetric(item) };
        });
      } else if (diffDays < 365) {
        const groups = {};
        filteredData.forEach(item => {
          const dateObj = new Date(item.date);
          const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
          const metric = computeMetric(item);
          groups[monthKey] = (groups[monthKey] || 0) + metric;
        });
        chartData = Object.keys(groups).map(key => {
          const [year, month] = key.split('-');
          return { x: new Date(parseInt(year), parseInt(month), 1), y: groups[key] };
        });
        chartData.sort((a, b) => a.x - b.x);
      } else {
        const groups = {};
        filteredData.forEach(item => {
          const dateObj = new Date(item.date);
          const yearKey = dateObj.getFullYear();
          const metric = computeMetric(item);
          groups[yearKey] = (groups[yearKey] || 0) + metric;
        });
        chartData = Object.keys(groups).map(key => {
          return { x: new Date(parseInt(key), 0, 1), y: groups[key] };
        });
        chartData.sort((a, b) => a.x - b.x);
      }
    }
  } else {
    chartData = filteredData.map(item => {
      return { x: new Date(item.date), y: computeMetric(item) };
    });
  }

  if (selectedScale === "Last 5" || selectedScale === "Last 10" || selectedScale === "Last 15") {
    chartData = chartData.map((item, index) => ({
      ...item,
      origDate: item.x,
      x: index
    }));
  }

  const getXAxisTicks = () => {
    const now = new Date();
    if (selectedScale === "Year") {
      return Array.from({ length: 12 }, (_, i) =>
        new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      );
    } else if (selectedScale === "Month") {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - 29 + i);
        return d;
      });
    } else if (selectedScale === "Week") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - 6 + i);
        return d;
      });
    } else if (selectedScale === "All") {
      if (!filteredData || filteredData.length === 0) return [];

      const startDate = new Date(filteredData[0].date);
      const endDate = new Date(filteredData[filteredData.length - 1].date);
      const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {

        let ticks = [];
        let current = new Date(startDate);
        while (current <= endDate) {
          ticks.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        return ticks;

      } else if (diffDays < 365) {

        let ticks = [];
        let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        let endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

        while (current <= endMonth) {
          ticks.push(new Date(current));
          current.setMonth(current.getMonth() + 1);
        }

        return ticks;

      } else {

        let ticks = [];
        let current = new Date(startDate.getFullYear(), 0, 1);
        let endYear = new Date(endDate.getFullYear(), 0, 1);

        while (current <= endYear) {
          ticks.push(new Date(current));
          current.setFullYear(current.getFullYear() + 1);
        }

        return ticks;
      }
    } else if (
      selectedScale === "Last 5" ||
      selectedScale === "Last 10" ||
      selectedScale === "Last 15"
    ) {
      if (!chartData || chartData.length === 0) return [];

      return Array.from({ length: chartData.length }, (_, i) => i);
    }
    return chartData.map(item => item.x);
  };

  const maxYValue = chartData.length > 0 ? Math.max(...chartData.map(item => item.y)) : 0;
  const formattedMaxStr = formatNumber(maxYValue);

  let leftPadding;

  if (selectedDataType === "Repetitions") {
    leftPadding = 50;
  } else {
    if (formattedMaxStr.length <= 2) {
      leftPadding = 35;
    } else if (formattedMaxStr.length === 3) {
      leftPadding = 40;
    } else if (formattedMaxStr.length === 4) {
      leftPadding = 45;
    } else {
      leftPadding = 50;
    }
  }


  const tickFormatter = (tick) => {
    if (selectedScale === "Year") {

      const dt = tick instanceof Date ? tick : new Date(tick);

      return dt.toLocaleString('default', { month: 'short' });
      
    } else if (selectedScale === "All") {
      if (!filteredData || filteredData.length === 0) return '';

      const startDate = new Date(filteredData[0].date);
      const endDate = new Date(filteredData[filteredData.length - 1].date);
      const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const dt = tick instanceof Date ? tick : new Date(tick);

      if (diffDays <= 30) {
        return dt.getDate();
      } else if (diffDays < 365) {
        return dt.toLocaleString('default', { month: 'short' });
      } else {
        return dt.getFullYear();
      }
    } else if (
      selectedScale === "Last 5" ||
      selectedScale === "Last 10" ||
      selectedScale === "Last 15"
    ) {
      
      const index = Math.round(tick);

      if (chartData && chartData[index] && chartData[index].origDate) {
        return new Date(chartData[index].origDate).getDate();
      }
      return tick;
    }

    const dt = tick instanceof Date ? tick : new Date(tick);
    return dt.getDate();
  };

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
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                  activeOpacity={1}
                >
                  <Text style={[GlobalStyles.orange, GlobalStyles.text18]}>{selectedScale}</Text>
                  {dropdownVisible && (
                    <View style={styles.dropdownContainer}>
                      {options
                        .filter(option => option !== selectedScale)
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
                <View style={styles.dataDropdownCont}>
                  <TouchableOpacity
                    onPress={() => setDataDropdownVisible(!dataDropdownVisible)}
                    activeOpacity={1}
                    style={styles.dataButton}
                  >
                    <Text style={[GlobalStyles.orange, GlobalStyles.text18]}>{selectedDataType}</Text>
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
              {(!exerciseData || !exerciseData.pastData || exerciseData.pastData.length === 0) ? (
                <View style={[styles.emptyContainer, GlobalStyles.center]}>
                  <Text style={[GlobalStyles.text16]}>
                    There is currently no data for this exercise.
                  </Text>
                  <Text style={[GlobalStyles.text14]}>
                    Chart will appear when you start <Text style={[GlobalStyles.orange]}>training</Text>.
                  </Text>
                </View>
              ) : (
                <VictoryChart
                  scale={{ x: (selectedScale === "Last 5" || selectedScale === "Last 10" || selectedScale === "Last 15") ? "linear" : "time" }}
                  width={screenWidth * 0.9}
                  padding={{ top: 20, bottom: 80, left: leftPadding, right: 20 }}
                  style={{ parent: { alignItems: 'center', justifyContent: 'center' } }}
                >
                  <VictoryAxis
                    tickValues={getXAxisTicks()}
                    tickFormat={tickFormatter}
                    style={{ tickLabels: { fontSize: 12, padding: 5 } }}
                    fixLabelOverlap
                  />
                  <VictoryAxis 
                    dependentAxis 
                    tickFormat={(tick) => formatNumber(tick)}
                  />
                  <VictoryArea
                    data={chartData}
                    style={{
                      data: { stroke: "#FF6600", fill: "rgba(255, 102, 0, 0.2)", strokeWidth: 2.4 },
                    }}
                  />
                  <VictoryScatter
                    data={chartData}
                    size={4}
                    style={{ data: { fill: "#FF6600" } }}
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
  contentContainer: {
    flex: 0.8,
  },
  emptyContainer: {
    flex: 1,
  },
});

export default LinearChart;