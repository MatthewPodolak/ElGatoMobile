import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Polyline } from 'react-native-maps';
import { routeDecoder } from '../../Services/Helpers/Location/RouteDecoder.js';

import TrashIcon from '../../assets/main/Diet/trash3.svg';
import ChevronDown from '../../assets/main/Diet/chevron-down.svg';
import ChevronUp from '../../assets/main/Diet/chevron-up.svg';
import ArrowUpIcon from '../../assets/main/Diet/arrow-up.svg';
import ArrowDownIcon from '../../assets/main/Diet/arrow-down.svg';

import { GlobalStyles } from '../../Styles/GlobalStyles';

const CardioTrainingDayDisplay = ({ exercise, measureType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProgress, setIsProgess] = useState(true);
  const [isPrivate, setIsPrivate] = useState(true);

  const [feeling, setFeeling] = useState(exercise.exerciseData.feelingPercentage || 0);
  const [encodedRoute, setRoute] = useState(exercise.exerciseData.route || null);
  const [routePoints, setRoutePoints] = useState([]);

  useEffect(() => {
    if(encodedRoute){
      const points = routeDecoder(encodedRoute);
      setRoutePoints(points);
    }
  }, [encodedRoute]);

  useEffect(() => {
    calculateProgression();
  }, [exercise]);

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
    setIsPrivate(!isPrivate);
    //POST
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

              <TouchableOpacity>
                <TrashIcon fill="#000" width={22} height={26} />
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
                  <Text style={styles.valueText}>{exercise.exerciseData.distanceMeters} <Text style={[GlobalStyles.text14, GlobalStyles.bold]}>m</Text></Text>
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
                          {routePoints.length > 0 && (
                            <MapView
                              style={{ flex: 1 }}
                              initialRegion={{
                                latitude:   routePoints[(routePoints.length / 2)].latitude,
                                longitude:  routePoints[(routePoints.length / 2)].longitude,
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
                        <View style={styles.expandedContainerTitle}><Text style={GlobalStyles.text18}>Visibility</Text></View>
                        <View style={styles.expandedContainerContent}>
                          <View style = {[styles.switchRow]}>
                            <Text style={[GlobalStyles.bold]}>Publicly visible: </Text>
                            <Switch
                                style={styles.switch}
                                onValueChange={() => handleVisilibtyChange()}
                                value={isPrivate}
                                trackColor={{ false: '#ccc', true: '#FFA500' }}
                                thumbColor={isPrivate ? '#FF8303' : '#FF8303'}
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
});

export default CardioTrainingDayDisplay;