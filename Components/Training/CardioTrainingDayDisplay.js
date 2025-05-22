import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView  } from 'react-native';
import { VictoryChart, VictoryAxis, VictoryTheme, VictoryArea } from 'victory-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Polyline } from 'react-native-maps';
import { routeDecoder } from '../../Services/Helpers/Location/RouteDecoder.js';
import { Dimensions } from 'react-native';

import TrashIcon from '../../assets/main/Diet/trash3.svg';
import ChevronDown from '../../assets/main/Diet/chevron-down.svg';
import ChevronUp from '../../assets/main/Diet/chevron-up.svg';
import ArrowUpIcon from '../../assets/main/Diet/arrow-up.svg';
import ArrowDownIcon from '../../assets/main/Diet/arrow-down.svg';

import { GlobalStyles } from '../../Styles/GlobalStyles';

const CardioTrainingDayDisplay = ({ exercise, measureType, changeVisilibity, removeCardioExercise }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProgress, setIsProgess] = useState(true);
  const [isPublic, setIsPublic] = useState(false);

  const [sppedInTime, setSpeedInTime] = useState(exercise.exerciseData.speedInTime || []);
  const [hrInTime, setHrInTime] = useState(exercise.exerciseData.heartRateInTime || []);
  const [feeling, setFeeling] = useState(exercise.exerciseData.feelingPercentage || 0);
  const [encodedRoute, setRoute] = useState(exercise.exerciseData.route || null);
  const [routePoints, setRoutePoints] = useState([]);

  const screenWidth = Dimensions.get('window').width;
  const chartContainerWidth = screenWidth * 0.9;
  const chartWidth = chartContainerWidth * 1.8;
  
  const parseMinutes = (timestamp) => {
    const [hh, mm, ss] = timestamp.split(':').map(Number);
    return hh * 60 + mm + ss / 60;
  };

  const transformSpeedDataForStepChart = (data) => {
    const transformed = [];

    for (let i = 0; i < data.length; i++) {
      const curr = data[i];
      const time = parseMinutes(curr.timeStamp);
      const speed = curr.speedKmh;

      if (i > 0) {
        const prevSpeed = data[i - 1].speedKmh;

        transformed.push({ x: time, y: prevSpeed });
      }

      transformed.push({ x: time, y: speed });
    }

    return transformed;
  };

  const chartData = transformSpeedDataForStepChart(sppedInTime);
  const lastX = chartData.length > 0 ? chartData[chartData.length - 1].x : 0;
  const paddedMaxX = lastX + 0.1;

  const heartRateChartData = hrInTime.map(d => ({
    x: parseMinutes(d.timeStamp),
    y: Math.round(d.heartRate),
  }));

  const maxHrTime = heartRateChartData.length > 0
    ? Math.max(...heartRateChartData.map(d => d.x))
    : 1;

  useEffect(() => {
    if(encodedRoute){
      const points = routeDecoder(encodedRoute);
      setRoutePoints(points);
    }
  }, [encodedRoute]);

  useEffect(() => {
    calculateProgression();
    getVisilibityStatus();
  }, [exercise]);

  const getVisilibityStatus = () => {
    if(exercise.exerciseData.exerciseVisilibity === "Public"){
      setIsPublic(true);
      return;
    }

    setIsPublic(false);
  };

  const calculateProgression = () => {
    if(!exercise.exerciseData || exercise.pastData){ return; }

    let points = 0;

    if(exercise.exerciseData.distanceMeters > exercise.pastData.distanceMeters){
      points += 1;
    }

    if(exercise.exerciseData.speedKmH >= exercise.pastData.speedKmH){
      points += 1;
    }else{
      points -= 0.5;
    }

    if((exercise.exerciseData.duration >= exercise.pastData.duration) && (exercise.exerciseData.speedKmH >= exercise.pastData.speedKmH)){
      points += 0.5;
    }else{
      points -= 0.5;
    }

    if(points >= 1.5){
      setIsProgess(true);
      return;
    }

    setIsProgess(false);
  };

  const handleVisilibtyChange = () => {
    let newStatus;
    if(isPublic){
      newStatus = 0;
    }else{
      newStatus = 1;
    }
    setIsPublic(!isPublic);
    
    changeVisilibity(exercise.exerciseData.publicId, newStatus);
  };

  const handleRemoval = () => {
    removeCardioExercise(exercise.exerciseData);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <BlurView style={styles.glassEffect} intensity={125} tint="light">
          <View style={styles.topRow}>
            <View style={styles.headerText}>
              <Text style={styles.mealText}>{exercise.exerciseData.activityType}</Text>
            </View>

            <View style={styles.headerClose}>
              <TouchableOpacity style={{ marginRight: 5 }} onPress={() => setIsExpanded(prev => !prev)}>
                {isExpanded ? (
                  <ChevronUp fill="#FF8303" width={26} height={26} />
                ) : (
                  <ChevronDown fill="#FF8303" width={26} height={26}  />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleRemoval()}>
                <TrashIcon fill="#000" width={22} height={26}/>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.hrLine} />

          <View style={styles.alwaysExpanded}>
            <View style={styles.alwaysExpandedRow}>
              <View style={styles.valueWrapper}>
                <Text style={styles.valueLabel}>Time</Text>
                <Text style={styles.valueText}>{exercise.exerciseData.duration}</Text>
              </View>
              <View style={styles.valueWrapper}>
                <Text style={styles.valueLabel}>Distance</Text>
                {measureType === "metric" ? (
                  <Text style={styles.valueText}>{Number(exercise.exerciseData.distanceMeters).toFixed()} <Text style={[GlobalStyles.text14, GlobalStyles.bold]}>m</Text></Text>
                ):(
                  <Text style={styles.valueText}>{Number(exercise.exerciseData.distanceFeet).toFixed(2)} <Text style={[GlobalStyles.text14, GlobalStyles.bold]}>f</Text></Text>
                )}

              </View>
            </View>
            <View style={styles.alwaysExpandedRow}>
              <View style={styles.valueWrapper}>
                <Text style={styles.valueLabel}>Avg. Speed</Text>
                {measureType === "metric" ? (
                  <Text style={styles.valueText}>{exercise.exerciseData.speedKmH} <Text style={[GlobalStyles.text14, GlobalStyles.bold]}>km/h</Text></Text>
                ):(
                  <Text style={styles.valueText}>{Number(exercise.exerciseData.speedMph).toFixed(1)} <Text style={[GlobalStyles.text14, GlobalStyles.bold]}>mph</Text></Text>
                )}
              </View>
              <View style={styles.valueWrapper}>
                <Text style={styles.valueLabel}>Avg. Heart Rate</Text>
                {exercise.exerciseData.avgHeartRate === 0 ? (
                  <Text style={styles.valueText}>---</Text>
                ):(
                  <Text style={styles.valueText}>{exercise.exerciseData.avgHeartRate} <Text style={[GlobalStyles.text14, GlobalStyles.bold]}>bpm</Text></Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.hrLine} />
        
          {isExpanded && (
            <>
                <View style={styles.expandedContent}>
                    <View style={styles.expandedContainer}>
                        <View style={styles.expandedContainerTitle}><Text style={GlobalStyles.text18}>Map</Text></View>
                        <View style={styles.expandedContainerContentMap}>
                          {routePoints.length > 0 && routePoints && (
                            <MapView
                              style={{ flex: 1 }}
                              initialRegion={{
                                latitude: routePoints[Math.floor(routePoints.length / 2)].latitude,
                                longitude: routePoints[Math.floor(routePoints.length / 2)].longitude,
                                latitudeDelta:  0.01,
                                longitudeDelta: 0.01,
                              }}
                              scrollEnabled={false}
                              zoomEnabled={false}
                              rotateEnabled={false}
                              pitchEnabled={false}
                              toolbarEnabled={false}
                              cacheEnabled={true} 
                            >
                              <Polyline
                                coordinates={routePoints}
                                strokeColor="#FF8303"
                                strokeWidth={4}
                              />
                            </MapView>
                          )}
                        </View>
                    </View>

                    <View style={styles.expandedContainer}>
                        <View style={styles.expandedContainerTitle}><Text style={GlobalStyles.text18}>Details</Text></View>
                        <View style={[styles.expandedContainerContent, {padding: 10,}]}>

                            <View style={styles.detailsTitleRow}><Text style={[GlobalStyles.bold, {marginBottom: 10,}]}>Feeling: </Text></View>
                            <View style={{ alignItems: 'center' }}>
                              <View style={styles.feelingBarContainer}>
                                <LinearGradient
                                  colors={['#7CFC00', '#FF6600']}
                                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                  style={styles.feelingBarLine}
                                />
                                <View
                                  style={[
                                    styles.feelingArrow,
                                    { left: `${feeling}%`, transform: [{ translateX: -8 }] },
                                  ]}
                                >
                                  <ChevronDown width={18} height={18} />
                                </View>
                              </View>
                              <Text style={[GlobalStyles.text14, { marginTop: 2 }]}>
                                {feeling}
                              </Text>
                            </View>

                            <View style={styles.detailsTitleRow}><Text style={[GlobalStyles.bold, {marginBottom: 10,}]}>Description: </Text></View>
                            <View style={[styles.sectionCard, {marginBottom: 20,}]}>
                              <Text style={styles.sectionText}>
                                {exercise.exerciseData.desc}
                              </Text>
                            </View>

                            {exercise.exerciseData.privateNotes && (
                              <>
                                <View style={styles.detailsTitleRow}><Text style={[GlobalStyles.bold, {marginBottom: 10,}]}>Private notes: </Text></View>
                                <View style={styles.sectionCard}>
                                  <Text style={styles.sectionText}>
                                  {exercise.exerciseData.privateNotes}
                                  </Text>
                                </View>
                              </>
                            )}
                            
    
                        </View>

                    </View>
                    
                    <View style={styles.expandedContainer}>
                        <View style={styles.expandedContainerTitle}><Text style={GlobalStyles.text18}>Speed</Text></View>
                        <View style={styles.expandedContainerContentElevated}>
                            {!sppedInTime || sppedInTime.length === 0 ? (
                              <Text style={[GlobalStyles.text18, GlobalStyles.bold, GlobalStyles.orange]}>No data avaliable :c</Text>
                            ):(
                              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                                <VictoryChart
                                  theme={VictoryTheme.material}
                                  width={chartWidth}
                                  domain={{ x: [0, paddedMaxX] }}
                                  domainPadding={{ x: 30, y: 10 }}
                                >
                                  <VictoryAxis
                                    tickFormat={(t) => `${t} min`}
                                    style={{
                                      axis: { stroke: 'black' },
                                      tickLabels: { fill: '#000' },
                                      ticks: { stroke: 'black' },
                                    }}
                                  />
                                  <VictoryAxis
                                    dependentAxis
                                    label={measureType === 'metric' ? 'km/h' : 'mph'}
                                    style={{
                                      axis: { stroke: 'black' },
                                      tickLabels: { fill: '#000' },
                                      ticks: { stroke: 'black' },
                                      axisLabel: {
                                        padding: 37,
                                        fill: '#000'
                                      }
                                    }}
                                    tickFormat={(t) =>
                                      measureType === 'metric'
                                        ? `${t.toFixed(1)}`
                                        : `${(t * 0.621371).toFixed(1)}`
                                    }
                                  />
                                  <VictoryArea
                                    data={chartData.map(d => ({
                                      x: d.x,
                                      y: measureType === 'metric' ? parseFloat(d.y.toFixed(1)) : parseFloat((d.y * 0.621371).toFixed(1))
                                    }))}
                                    interpolation="stepAfter"
                                    style={{
                                      data: {
                                        fill: "rgba(255, 131, 3, 0.2)",
                                        stroke: "#FF8303",
                                        strokeWidth: 3
                                      }
                                    }}
                                  />
                                </VictoryChart>
                              </ScrollView>
                            )}
                        </View>
                    </View>

                    <View style={styles.expandedContainer}>
                        <View style={styles.expandedContainerTitle}><Text style={GlobalStyles.text18}>Heart rate</Text></View>
                        <View style={styles.expandedContainerContentElevated}>
                            {!hrInTime || hrInTime.length === 0 ? (
                              <Text style={[GlobalStyles.text18, GlobalStyles.bold, GlobalStyles.orange]}>No data avaliable :c</Text>
                            ):(
                              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                                <VictoryChart
                                  theme={VictoryTheme.material}
                                  width={chartWidth}
                                  domain={{ x: [0, maxHrTime] }}
                                  domainPadding={{ x: 30, y: 10 }}
                                >
                                  <VictoryAxis
                                    tickFormat={(t) => `${Number.isInteger(t) ? t : t.toFixed(1)} min`}
                                    style={{
                                      axis: { stroke: 'black' },
                                      tickLabels: { fill: '#000' },
                                      ticks: { stroke: 'black' },
                                    }}
                                  />
                                  <VictoryAxis
                                    dependentAxis
                                    label="bpm"
                                    style={{
                                      axis: { stroke: 'black' },
                                      tickLabels: { fill: '#000' },
                                      ticks: { stroke: 'black' },
                                      axisLabel: {
                                        padding: 35,
                                        fill: '#000'
                                      }
                                    }}
                                    tickFormat={(t) => Math.round(t)}
                                  />
                                  <VictoryArea
                                    data={heartRateChartData}
                                    interpolation="monotoneX"
                                    style={{
                                      data: {
                                        fill: "rgba(169, 29, 58, 0.2)",
                                        stroke: "#A91D3A",
                                        strokeWidth: 3
                                      }
                                    }}
                                  />
                                </VictoryChart>
                              </ScrollView>
                            )}
                        </View>
                    </View>

                    <View style={styles.expandedContainer}>
                        <View style={styles.expandedContainerTitle}><Text style={GlobalStyles.text18}>Visibility</Text></View>
                        <View style={styles.expandedContainerContent}>
                          <View style = {[styles.switchRow]}>
                            <Text style={[GlobalStyles.bold]}>Publicly visible: </Text>
                            <Switch
                                style={styles.switch}
                                onValueChange={() => handleVisilibtyChange()}
                                value={isPublic}
                                trackColor={{ false: '#ccc', true: '#FFA500' }}
                                thumbColor={isPublic ? '#FF8303' : '#FF8303'}
                            />
                          </View>
                        </View>
                    </View>

                </View>

                <View style={styles.hrLine} />
            </>
          )}

          <View style={[styles.summaryRow]}>
            <Text style={[GlobalStyles.text16]}> Burnt calories: <Text style={GlobalStyles.orange}>{exercise.exerciseData.caloriesBurnt}</Text></Text>
            {isProgress ? (
                <ArrowUpIcon width={16} height={16} color={'#3E7B27'} />
            ):(
                <ArrowDownIcon width={16} height={16} color={'#A91D3A'} />
            )}
          </View>

        </BlurView>
      </View>
      <View style={styles.spacing} />
    </View>
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
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
  },
  headerClose: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  mealText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 22,
    fontFamily: 'Helvetica',
  },
  hrLine: {
    borderBottomColor: 'black',
    opacity: 0.2,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  expandedText: {
    color: '#333',
    fontSize: 16,
    marginBottom: 10,
  },
  summaryRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  spacing: {
    height: 10,
  },

  alwaysExpanded: { marginBottom: 10 },
  alwaysExpandedRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  valueWrapper: { flex: 1, alignItems: 'center' },
  valueLabel: { fontSize: 14, color: '#555' },
  valueText: { fontSize: 18, fontWeight: '600' },

  expandedSection: { paddingVertical: 10 },
  expandedText: { color: '#333', fontSize: 16 },

  expandedContent: { paddingVertical: 10, },

  switchRow: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },


  feelingBarContainer: {
    position: 'relative',
    width: '100%',
    height: 35,
    justifyContent: 'center',
  },
  feelingBarLine: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  feelingArrow: {
    position: 'absolute',
    top: -6,
  },

  sectionCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8303',  
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF8303',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  expandedContainerContentMap: {
    paddingVertical: 10,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
  },
  expandedContainerContentElevated: {
  paddingVertical: 10,
  minHeight: 100,
  borderRadius: 15,
  margin: 10,
  overflow: 'hidden',
  textAlign: 'center',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
  elevation: 5,

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
}
});

export default CardioTrainingDayDisplay;