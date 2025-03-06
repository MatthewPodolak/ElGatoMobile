import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { BlurView } from 'expo-blur';
import Svg, { Polygon, Text as SvgText, Circle, Line } from 'react-native-svg';

const HexagonalChart = ({ data, isActive, settedPeriod }) => {
  const [selectedScale, setSelectedScale] = useState(settedPeriod ?? "Week");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [muscleData] = useState(data ?? null);
  const [dataActive] = useState(isActive ?? false);

  const options = ["Week", "Month", "Year", "All"];
  const muscleGroups = ["Chest", "Legs", "Back", "Arms", "Core", "Shoulders"];

  const filteredUsageCounts = Array(6).fill(0);
  if (muscleData && muscleData.muscleUsage) {
    const now = new Date();
    let cutoff = null;
    if (selectedScale === "Week") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (selectedScale === "Month") {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (selectedScale === "Year") {
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
    muscleData.muscleUsage.forEach(item => {
      const type = item.muscleType;
      if (type > 0 && type <= 6 && item.dates) {
        const filteredDates = cutoff ? item.dates.filter(dateStr => new Date(dateStr) >= cutoff): item.dates;
        filteredUsageCounts[type - 1] = filteredDates.length;
      }
    });
  }
  const usageCounts = filteredUsageCounts;
  const maxUsage = Math.max(...usageCounts);

  const handleOptionSelect = (option) => {
    setSelectedScale(option);
    setDropdownVisible(false);
  };

  const labelSettings = [
    { offsetX: 0, offsetY: -15, textAnchor: "middle" },   // top
    { offsetX: 10, offsetY: -5, textAnchor: "start" },      // top-right
    { offsetX: 10, offsetY: 5, textAnchor: "start" },       // bottom-right
    { offsetX: 0, offsetY: 15, textAnchor: "middle" },      // bottom
    { offsetX: -10, offsetY: 5, textAnchor: "end" },        // bottom-left
    { offsetX: -5, offsetY: -5, textAnchor: "end" }        // top-left
  ];

  const screenWidth = Dimensions.get('window').width;
  const size = Math.min(screenWidth - 40, 300);

  const HexagonSVG = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = 100;
    const dataScaling = 0.9;
    const baselineFactor = 0.25;
    const extraFactor = dataScaling - baselineFactor;

    const vertices = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = -90 + i * 60;
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = centerX + outerRadius * Math.cos(angleRad);
      const y = centerY + outerRadius * Math.sin(angleRad);
      vertices.push({ x, y, angleRad });
    }
    const outerPoints = vertices.map(v => `${v.x},${v.y}`).join(' ');

    const gridRadii = [outerRadius * 0.75, outerRadius * 0.5, outerRadius * 0.25];
    const gridPolygons = gridRadii.map(radius => {
      const gridVertices = [];
      for (let i = 0; i < 6; i++) {
        const angleDeg = -90 + i * 60;
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY + radius * Math.sin(angleRad);
        gridVertices.push(`${x},${y}`);
      }
      return gridVertices.join(' ');
    });

    const dataPoints = vertices.map((v, i) => {
      const ratio = maxUsage > 0 ? usageCounts[i] / maxUsage : 0;
      const scaledRadius = outerRadius * (baselineFactor + extraFactor * ratio);
      const x = centerX + scaledRadius * Math.cos(v.angleRad);
      const y = centerY + scaledRadius * Math.sin(v.angleRad);
      return `${x},${y}`;
    }).join(' ');

    return (
      <Svg width={size} height={size}>
        <Polygon points={outerPoints} fill="none" stroke="black" strokeWidth="2" />
        {gridPolygons.map((points, index) => (
          <Polygon key={index} points={points} fill="none" stroke="grey" strokeWidth="1" strokeDasharray="4,2" />
        ))}
        {vertices.map((v, i) => (
          <Line key={`line-${i}`} x1={centerX} y1={centerY} x2={v.x} y2={v.y} stroke="lightgrey" strokeWidth="1" />
        ))}
        <Polygon points={dataPoints} fill="rgba(255,165,0,0.5)" stroke="orange" strokeWidth="2" />
        {vertices.map((v, i) => (
          <SvgText
            key={i}
            x={v.x + labelSettings[i].offsetX}
            y={v.y + labelSettings[i].offsetY}
            fill="black"
            fontSize="14"
            textAnchor={labelSettings[i].textAnchor}
            alignmentBaseline="middle"
          >
            {muscleGroups[i]}
          </SvgText>
        ))}
        <Circle cx={centerX} cy={centerY} r="3" fill="black" />
      </Svg>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <BlurView style={styles.glassEffect} intensity={125} tint="light">
        {dataActive ? (
          <>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={GlobalStyles.text20}>Muscle Usage</Text>
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
              <HexagonSVG />
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

export default HexagonalChart;
