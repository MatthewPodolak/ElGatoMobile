import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Modal, TouchableWithoutFeedback, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { activities } from '../../../assets/Data/activities.js';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { checkAndRequestLocationPermission } from '../../../Services/Helpers/Location/LocationPermissionHelper.js';

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

  const startTraining = () => {
    console.log("Training started");
    setTrainingDataVisible(true);
    setTrainingStartedHud(true);
    setTrainingSessionActive(true);
  };

  const pauseTraining = () => {
    console.log("Training paused");
    setTrainingStartedHud(false);
  };

  const endTraining = () => {
    console.log("Training ended");
    setTrainingDataVisible(false);
    setTrainingSessionActive(false);
    setTrainingStartedHud(false);
  };

  const navigateBack = () => {
    navigation.goBack();
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
                    {/*EL - GATO ERROR VIEW - LOCATION OFF. */}
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
              <Text style={[GlobalStyles.text48, GlobalStyles.bold]}>00:00:21</Text>
            </View>

            <View style={[styles.trainingDataRow, GlobalStyles.center]}>
              <Text style={[GlobalStyles.text16]}>SPEED</Text>
              <Text style={[GlobalStyles.text72, GlobalStyles.bold]}>40</Text>
              <Text style={[GlobalStyles.text16]}>KM/H</Text>
            </View>

            <View style={[styles.trainingDataRow, GlobalStyles.center]}>
              <Text style={[GlobalStyles.text16]}>DISTANCE</Text>
              <Text style={[GlobalStyles.text48, GlobalStyles.bold]}>2040</Text>
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
