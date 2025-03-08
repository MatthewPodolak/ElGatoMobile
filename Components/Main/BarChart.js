import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { BlurView } from 'expo-blur';
import { VictoryChart, VictoryBar, VictoryTheme, VictoryAxis } from 'victory-native';

const BarChart = ({ data, isActive, settedPeriod, system, name, color }) => {
  const [chartName] = useState(name ?? "Bar");
  const [barColor] = useState(color ?? "#FF6600");
  const [selectedScale, setSelectedScale] = useState(settedPeriod ?? "Week");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [muscleData] = useState(data ?? null);
  const [dataActive] = useState(isActive ?? false);

  const options = ["Week", "Month", "Year", "All"];

  const handleOptionSelect = (option) => {
    setSelectedScale(option);
    setDropdownVisible(false);
  };

  const validData = muscleData ? muscleData.filter(item => item.date !== "0001-01-01T00:00:00Z") : [];
  const formattedData = validData.map(item => ({
    date: new Date(item.date),
    data: item.data
  }));

  let finalData = [];
  const now = new Date();
  let customDomain = undefined;

  if (selectedScale === "Week") {
    const weekDays = [];
    let start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      weekDays.push(day);
    }
    finalData = weekDays.map(day => {
      const found = formattedData.find(item => {
        const d = item.date;
        return d.getFullYear() === day.getFullYear() &&
               d.getMonth() === day.getMonth() &&
               d.getDate() === day.getDate();
      });
      return {
        date: day,
        data: found ? found.data : 0
      };
    });
  } else if (selectedScale === "Month") {
    const monthDays = [];
    let start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 29);
    for (let i = 0; i < 30; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      monthDays.push(day);
    }
    finalData = monthDays.map(day => {
      const found = formattedData.find(item => {
        const d = item.date;
        return d.getFullYear() === day.getFullYear() &&
               d.getMonth() === day.getMonth() &&
               d.getDate() === day.getDate();
      });
      return {
        date: day,
        data: found ? found.data : 0
      };
    });
  } else if (selectedScale === "Year") {
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const yearData = formattedData.filter(item => item.date >= oneYearAgo && item.date <= now);
    
    let monthlyAggregated = [];
    for (let i = 0; i < 12; i++) {
      let monthStart = new Date(oneYearAgo.getFullYear(), oneYearAgo.getMonth() + i, 1);
      monthlyAggregated.push({
        date: monthStart,
        data: 0
      });
    }
    yearData.forEach(item => {
      const itemMonth = item.date.getMonth();
      const itemYear = item.date.getFullYear();
      const found = monthlyAggregated.find(bar => 
        bar.date.getMonth() === itemMonth && bar.date.getFullYear() === itemYear
      );
      if (found) {
        found.data += item.data;
      }
    });
    finalData = monthlyAggregated;
  } else if (selectedScale === "All") {
    const yearlyDataMap = {};
    formattedData.forEach(item => {
      const year = item.date.getFullYear();
      if (!yearlyDataMap[year]) {
        yearlyDataMap[year] = 0;
      }
      yearlyDataMap[year] += item.data;
    });
    finalData = Object.keys(yearlyDataMap).map(year => ({
      date: new Date(parseInt(year), 0, 1),
      data: yearlyDataMap[year]
    })).sort((a, b) => a.date - b.date);

    if (finalData.length > 0) {
      const minDate = finalData[0].date;
      const maxDate = finalData[finalData.length - 1].date;
      const diff = maxDate.getTime() - minDate.getTime();
      const margin = diff * 0.5;
      customDomain = {
        x: [new Date(minDate.getTime() - margin), new Date(maxDate.getTime() + margin)]
      };
    }
  }

  const xTickFormat = (t) => {
    const date = t instanceof Date ? t : new Date(t);
    const pad = (n) => n < 10 ? `0${n}` : n;
    if (selectedScale === "Year") {
      return date.toLocaleString('default', { month: 'short' });
    } else if (selectedScale === "All") {
      return date.getFullYear();
    } else {
      return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
    }
  };

  const tickValues = (selectedScale === "Year" || selectedScale === "All")? finalData.map(item => item.date): undefined;

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth * 0.9;

  return (
    <View style={styles.outerContainer}>
      <BlurView style={styles.glassEffect} intensity={125} tint="light">
        {dataActive ? (
          <>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={GlobalStyles.text20}>{chartName}</Text>
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
                      {options.filter(option => option !== selectedScale).map((option, index) => (
                        <TouchableOpacity key={index} style={styles.dropdownItem} onPress={() => handleOptionSelect(option)}>
                          <Text style={GlobalStyles.text16}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.contentContainer}>
              {finalData.length > 0 ? (
                <VictoryChart
                  theme={VictoryTheme.material}
                  width={chartWidth}
                  height={200}
                  domainPadding={{ x: 20, y: 10 }}
                  padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
                  domain={selectedScale === "All" ? customDomain : undefined}
                >
                  <VictoryAxis 
                    tickValues={tickValues}
                    tickFormat={xTickFormat}
                    style={{
                      tickLabels: { fontSize: 10, padding: 5 }
                    }}
                    fixLabelOverlap
                  />
                  <VictoryAxis 
                    dependentAxis 
                    tickFormat={(x) => `${x}`}
                    style={{
                      tickLabels: { fontSize: 10, padding: 5 }
                    }}
                  />
                  <VictoryBar
                    data={finalData}
                    x="date"
                    y="data"
                    style={{
                      data: { fill: barColor, width: 16 }
                    }}
                  />
                </VictoryChart>
              ) : (
                <Text style={GlobalStyles.text16}>No valid data available</Text>
              )}
            </View>
          </>
        ) : (
          <View style={[GlobalStyles.flex, GlobalStyles.center]}>
            <Text style={GlobalStyles.text16}>Something went wrong</Text>
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
  dropdownItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  contentContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BarChart;
