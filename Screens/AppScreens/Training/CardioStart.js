import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Modal, TouchableWithoutFeedback, ScrollView, Image, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { UrlTile, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { activities } from '../../../assets/Data/activities.js';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { checkAndRequestLocationPermission } from '../../../Services/Helpers/Location/LocationPermissionHelper.js';
import { BACKGROUND_LOCATION_TASK } from '../../../Services/Tasks/Location/BackgroundLocationTask.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import PulseIcon from '../../../assets/main/Diet/heart-pulse.svg';
import GlobeIcon from '../../../assets/main/Diet/globe.svg';
import StartIcon from '../../../assets/main/Diet/play-fill.svg';
import StopIcon from '../../../assets/main/Diet/stop-fill.svg';
import CloseIcon from '../../../assets/main/Diet/x-lg.svg';
import MapMarkerStatic from '../../../assets/main/Navigation/gps_icon.png';

function CardioStart({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [locationWarning, setLocationWarning] = useState(false);
  const [checkingLocationPermissions, setCheckingLocationPermissions] = useState(true);
  const [isLocationPermitted, setIsLocationPermitted] = useState(false);
  const [activityType, setActivityType] = useState("Running");
  const [activitySelectorModalVisible, setActivitySelectorModalVisible] = useState(false);
  const [trainingStartedHud, setTrainingStartedHud] = useState(false);
  const [trainingSessionActive, setTrainingSessionActive] = useState(false);
  const [trainingDataVisible, setTrainingDataVisible] = useState(false);

  //Timer
  const [startTime, setStartTime] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef(null);

  //Routes
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const timerActiveRef = useRef();
  const trainingSessionActiveRef = useRef(trainingSessionActive);
  useEffect(() => {
    timerActiveRef.current = timerActive;
  }, [timerActive]);
  useEffect(() => {
    trainingSessionActiveRef.current = trainingSessionActive;
  }, [trainingSessionActive]);

  //Dist
  const [distance, setDistance] = useState(0);
  

  const activeActivity = activities.find(activity => activity.name === activityType);
  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.Group]) {
      acc[activity.Group] = [];
    }
    acc[activity.Group].push(activity);
    return acc;
  }, {});

  useEffect(() => {
    let subscription;
    (async () => {
      try {
        const permitted = await checkAndRequestLocationPermission();
        setIsLocationPermitted(permitted);
        setCheckingLocationPermissions(false);
        if (permitted) {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
              maximumAge: 10000,
              timeout: 15000,
            });
            const { latitude, longitude, heading } = location.coords;
            setCurrentLocation({
              latitude,
              longitude,
              heading: heading || 0,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          } catch (error) {
            setCurrentLocation({
              latitude: 37.78825,
              longitude: -122.4324,
              heading: 0,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            setLocationError(true);
          }
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 1,
            },
            (newLocation) => {
              const { latitude, longitude, heading } = newLocation.coords;
              setCurrentLocation({
                latitude,
                longitude,
                heading: heading || 0,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
          
              if (trainingSessionActiveRef.current) {
                const locationRecord = {
                  latitude: latitude,
                  longitude: longitude,
                  break: !timerActiveRef.current,
                  timestamp: newLocation.timestamp,
                };
          
                setRouteCoordinates((prevCoords) => {
                  if (timerActiveRef.current) {
                    const lastActive = getLastActiveCoord(prevCoords);
                    if (lastActive) {
                      const d = haversineDistance(
                        lastActive.latitude,
                        lastActive.longitude,
                        latitude,
                        longitude
                      );
                      setDistance((prevDistance) => prevDistance + d);
                    }
                  }
                  return [...prevCoords, locationRecord];
                });
              }
            }
          );
        }
      } catch (error) {
        setCheckingLocationPermissions(false);
        setLocationError(true);
      }
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (timerActive && startTime !== null) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = accumulatedTime + (now - startTime) / 1000;
        setDisplayTime(Math.floor(elapsed));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerActive, startTime, accumulatedTime]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (nextAppState === "active" && timerActive && startTime) {
        const now = Date.now();
        const elapsed = accumulatedTime + (now - startTime) / 1000;
        setDisplayTime(Math.floor(elapsed));
      }
    });
    return () => subscription.remove();
  }, [timerActive, startTime, accumulatedTime]);

  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  //TODO background-location-task
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async nextAppState => {
      if (nextAppState === "active") {
        const stored = await AsyncStorage.getItem('routeLocations');
        if (stored) {
          const backgroundLocations = JSON.parse(stored);
          const newLocations = backgroundLocations.filter(bgLoc => {
            return !routeCoordinates.some(rc =>
              rc.timestamp === bgLoc.timestamp
            );
          });
          if (newLocations.length > 0) {
            setRouteCoordinates(prev => [...prev, ...newLocations]);
          }
          await AsyncStorage.removeItem('routeLocations');
        }
      }
    });
    return () => subscription.remove();
  }, [routeCoordinates]);
  

  const startTraining = async () => {
    console.log("Training started");
    setTrainingDataVisible(true);
    setTrainingStartedHud(true);
    setTrainingSessionActive(true);

    //timer
    if (!startTime) {
      setStartTime(Date.now());
    }
    setTimerActive(true);

    //TODO background-location-task
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 1,
      foregroundService: {
        notificationTitle: "Training in Progress",
        notificationBody: "Your location is being tracked in the background.",
        notificationColor: "#FF4500",
      },
    });
  };

  const pauseTraining = () => {
    console.log("Training paused");
    setTrainingStartedHud(false);
    
    //timer
    setTimerActive(false);
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000;
      setAccumulatedTime(prev => prev + elapsed);
      setStartTime(null);
    }

  };

  const endTraining = async () => {
    console.log("Training ended");
    setTrainingDataVisible(false);
    setTrainingSessionActive(false);
    setTrainingStartedHud(false);

    //timner -- final -> displayTime.
    setTimerActive(false);
    setStartTime(null);
    setAccumulatedTime(0);
    setDisplayTime(0);
    
    //TODO - background-location-task
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  const getRouteSegments = (coords) => {
    if (!coords.length) return [];
    const segments = [];
    let currentSegment = [coords[0]];

    for (let i = 1; i < coords.length; i++) {
      if (coords[i].break !== coords[i - 1].break) {
        segments.push({
          coordinates: currentSegment,
          color: coords[i - 1].break ? 'black' : '#FF4500'
        });
        currentSegment = [coords[i]];
      } else {
        currentSegment.push(coords[i]);
      }
    }
    segments.push({
      coordinates: currentSegment,
      color: currentSegment[0].break ? 'black' : '#FF6600'
    });
    return segments;
  };

  const segments = getRouteSegments(routeCoordinates);

  //DIST HELPERS
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) *  Math.cos(toRad(lat2)) *  Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  const getLastActiveCoord = (coords) => {
    for (let i = coords.length - 1; i >= 0; i--) {
      if (!coords[i].break) return coords[i];
    }
    return null;
  };
  

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
      <StatusBar style="light" backgroundColor="#fff" translucent={false} hidden={false} />

      <View style={styles.topAndMapContainer}>
        <View style={styles.topContainer}>
          <View style={styles.topContIngBack}>
            <TouchableOpacity style={styles.topBack} onPress={navigateBack}>
              <ChevronLeft width={28} height={28} />
            </TouchableOpacity>
          </View>
          <View style={styles.topContIngTitle}>
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.topNameText}>
              {activityType}
            </Text>
          </View>
          <View style={styles.topContIngReport}>

          </View>
        </View>

        <View style={styles.mapContainer}>
          {checkingLocationPermissions ? (
            <View style={[GlobalStyles.flex, GlobalStyles.center]}>
              <ActivityIndicator size="large" color="#FF8303" />
            </View>
          ) : (
            <>
              {isLocationPermitted ? (
                <>
                  {currentLocation ? (
                    <>
                      <MapView style={GlobalStyles.flex} initialRegion={currentLocation}>
                        <UrlTile
                          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          maximumZ={19}
                          flipY={false}
                        />
                        <Marker coordinate={currentLocation}>
                          <Image
                            source={MapMarkerStatic}
                            style={{
                              width: 30,
                              height: 30,
                              transform: [{ rotate: `${currentLocation.heading}deg` }],
                            }}
                          />
                        </Marker>
                        {segments.map((segment, index) => (
                          <Polyline key={index} coordinates={segment.coordinates} strokeColor={segment.color} strokeWidth={6} />
                        ))}
                      </MapView>
                      {locationError && (
                        <View style={[styles.mapInfoContainer, styles.errorBackground]}>
                          <Text style={[GlobalStyles.text16, { textAlign: 'center' }]}> Unable to fetch location. Check your internet connection. </Text>
                        </View>
                      )}
                      {locationWarning && (
                        <View style={[styles.mapInfoContainer, styles.warningBackground]}>
                          <Text style={[GlobalStyles.text16, { textAlign: 'center' }]}> GPS SIGNAL LOST </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                      <ActivityIndicator size="large" color="#FF8303" />
                    </View>
                  )}
                </>
              ) : (
                <View style={[GlobalStyles.flex, GlobalStyles.column]}>
                  <View style={{ flex: 0.8 }}>
                    {/*EL - GATO ERROR VIEW - LOCATION OFF.  --- musi byc wzmianka ze potrzeba allow all the time. TODO */}
                  </View>
                  <View style={[{ flex: 0.2, padding: 10 }, GlobalStyles.center]}>
                    <Text style={[GlobalStyles.text18, {textAlign: 'center'}]}>We won't be able to track your training without <Text style={[GlobalStyles.orange]}>location permissions</Text>.</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {trainingDataVisible && (
          <View style={styles.trainingDataContainer}>
            <View style={[styles.trainingDataRow, GlobalStyles.center]}>
              <Text style={[GlobalStyles.text16]}>TIME</Text>
              <Text style={[GlobalStyles.text48, GlobalStyles.bold]}>{formatTime(displayTime)}</Text>
            </View>

            <View style={[styles.trainingDataRow, GlobalStyles.center]}>
              <Text style={[GlobalStyles.text16]}>SPEED</Text>
              <Text style={[GlobalStyles.text72, GlobalStyles.bold]}>40</Text>
              <Text style={[GlobalStyles.text16]}>KM/H</Text>
            </View>

            <View style={[styles.trainingDataRow, GlobalStyles.center]}>
              <Text style={[GlobalStyles.text16]}>DISTANCE</Text>
              <Text style={[GlobalStyles.text48, GlobalStyles.bold]}>{Math.floor(distance)}</Text>
              <Text style={[GlobalStyles.text16]}>M</Text>
            </View>

            <View style={[styles.trainingDataRowDivided]}>
              <View style={[{flex: 0.5}, GlobalStyles.center]}>
                <Text style={[GlobalStyles.text16]}>CALORIES</Text>
                <Text style={[GlobalStyles.text32, GlobalStyles.bold]}>321</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={[{flex: 0.5}, GlobalStyles.center]}>
                <Text style={[GlobalStyles.text16]}>PULSE</Text>
                <Text style={[GlobalStyles.text32, GlobalStyles.bold]}>90</Text>
              </View>
            </View>

          </View>
        )}
      </View>

      <View style={styles.hudContainer}>
        {!trainingStartedHud && !trainingSessionActive && (
          <TouchableOpacity onPress={() => setActivitySelectorModalVisible(true)} style={styles.smallCircle}>
            {activeActivity && (
              <View style={styles.activityIconWrapper}>
                <activeActivity.Icon width={26} height={26} fill="#000" />
              </View>
            )}
          </TouchableOpacity>
        )}

        {!trainingStartedHud && trainingSessionActive && (
          <TouchableOpacity onPress={() => endTraining()} style={[styles.smallCircle, { backgroundColor: 'red' }]}>
            <View style={styles.activityIconWrapper}>
              <Text style={[GlobalStyles.bold, GlobalStyles.white, GlobalStyles.text18]}>END</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.largeCircle}>
          {!trainingStartedHud ? (
            <TouchableOpacity style={styles.iconWrapper} onPress={() => startTraining()}>
              <StartIcon width={64} height={64} fill="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => pauseTraining()}>
              <StopIcon width={64} height={64} fill="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {!trainingSessionActive ? (
          <TouchableOpacity style={[styles.smallCircleRight, GlobalStyles.center]}>
            <PulseIcon width={32} height={32} fill="#000" style={{ marginTop: 5 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.smallCircleRight, GlobalStyles.center]}
            onPress={() => setTrainingDataVisible(!trainingDataVisible)}
          >
            <GlobeIcon width={32} height={32} fill="#000" style={{ marginTop: -2 }} />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={activitySelectorModalVisible}
        onRequestClose={() => setActivitySelectorModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setActivitySelectorModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <ScrollView
                  style={GlobalStyles.flex}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                  <View style={styles.activityInfoContainer}>
                    <Text style={GlobalStyles.text16}>Select activity</Text>
                    <TouchableOpacity onPress={() => setActivitySelectorModalVisible(false)}>
                      <CloseIcon width={20} height={20} fill="#000" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.activitySelectContainer}>
                    {Object.entries(groupedActivities).map(([groupName, activitiesInGroup]) => (
                      <View key={groupName}>
                        <Text style={[GlobalStyles.text18, styles.groupHeader]}>{groupName}:</Text>
                        <View style={styles.activitySelectContainer}>
                          {activitiesInGroup.map((activity, index) => {
                            const IconComponent = activity.Icon;
                            return (
                              <TouchableOpacity key={index} style={styles.activityItem} onPress={() => setActivityType(activity.name)}>
                                <IconComponent width={24} height={24} fill={activityType === activity.name ? "#FF6600" : "#000"} />
                                <Text style={[ styles.activityText, GlobalStyles.text16, activityType === activity.name && { color: "#FF6600" }, ]}>
                                  {activity.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  topAndMapContainer: {
    flex: 0.8,
    position: 'relative',
  },
  topContainer: {
    width: '100%',
    height: '11%',
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topContIngBack: {
    width: '15%',
    height: '100%',
  },
  topContIngTitle: {
    width: '70%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContIngReport: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBack: {
    position: 'absolute',
    left: 10,
    height: '100%',
    justifyContent: 'center',
  },
  topNameText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  trainingDataContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'whitesmoke',
    zIndex: 1,
  },
  trainingDataRow: {
    flexDirection: 'column',
    borderBottomColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 25,
    borderBottomWidth: 0.8,
    marginTop: 5,
  },
  trainingDataRowDivided:{
    flexDirection: 'row',
    paddingVertical: 15,
  },
  hudContainer: {
    borderTopColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 1,
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  smallCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'whitesmoke',
    position: 'absolute',
    borderColor: 'black',
    borderWidth: 1,
    left: 40,
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  smallCircleRight: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'whitesmoke',
    position: 'absolute',
    borderColor: 'black',
    borderWidth: 1,
    right: 40,
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  largeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff4500',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  iconWrapper: {
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    height: '90%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  activityInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  activitySelectContainer: {
    flexDirection: 'column',
    paddingVertical: 5,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  activityText: {
    marginLeft: 10,
  },
  groupHeader: {
    fontSize: 18,
    fontFamily: 'Helvetica',
    marginTop: 10,
    marginBottom: 5,
  },
  mapInfoContainer: {
    minHeight: 50,
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    padding: 10,
  },
  errorBackground: {
    backgroundColor: 'red',
  },
  warningBackground: {
    backgroundColor: '#98D8EF',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'black',
    marginHorizontal: 10,
  },
});

export default CardioStart;
