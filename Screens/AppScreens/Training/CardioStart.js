import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Modal, TouchableWithoutFeedback, ScrollView, Image } from 'react-native';
import { activities } from '../../../assets/Data/activities.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { checkAndRequestLocationPermission } from '../../../Services/Helpers/Location/LocationPermissionHelper.js';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import StartIcon from '../../../assets/main/Activities/play-fill.svg';
import CloseIcon from '../../../assets/main/Diet/x-lg.svg';
import MapMarkerStatic from '../../../assets/main/Navigation/gps_icon.png';

function CardioStart({ navigation }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [locationWarning, setLocationWarining] = useState(false);
  const [checkingLocationPermissions, setCheckingLocationPermissions] = useState(true);
  const [isLocationPermitted, setIsLocationPermitted] = useState(false);
  const [activityType, setActivityType] = useState("Running");
  const [activitySelectorModalVisible, setActivitySelectorModalVisible] = useState(false);
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
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, maximumAge: 10000, timeout: 15000 });
            const { latitude, longitude, heading } = location.coords;

            setCurrentLocation({
              latitude,
              longitude,
              heading: heading || 0,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });

          } catch (error) {
            setCurrentLocation({latitude: 37.78825, longitude: -122.4324, heading: 0, latitudeDelta: 0.0922, longitudeDelta: 0.0421,});
            setLocationError(true);
          }

          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000, //per 5 sec -- CHECK!
              distanceInterval: 1, //per meter moved.
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
  
  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
        <View style={styles.topContainer}>
            <View style = {styles.topContIngBack}>
                <TouchableOpacity style={styles.topBack} onPress={navigateBack}>
                    <ChevronLeft width={28} height={28} />
                </TouchableOpacity>
            </View>
            <View style = {styles.topContIngTitle}>
                <Text numberOfLines={2} ellipsizeMode="tail" style={styles.topNameText}>{activityType}</Text>
            </View>
            <View style = {styles.topContIngReport}>
                
            </View>
        </View> 
        <View style={GlobalStyles.flex}>

            <View style={styles.mapContainer}>
              {checkingLocationPermissions ? (
                    <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                      <ActivityIndicator size="large" color="#FF8303" />
                    </View>
                  ):(
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
                              <Text style={[GlobalStyles.text16,{textAlign: 'center'}]}>Unable to fetch location. Check your internet connection.</Text>
                            </View>
                          )}
                          {locationWarning && (
                            <View style={[styles.mapInfoContainer, styles.warningBackground]}>
                              <Text style={[GlobalStyles.text16,{textAlign: 'center'}]}>GPS SIGNAL LOST</Text>
                            </View>
                          )}
                        </>
                      ):(
                        <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                            <ActivityIndicator size="large" color="#FF8303" />
                        </View>
                      )}
                    </>
                  ):(
                    <>
                      <View style={[GlobalStyles.flex, GlobalStyles.column]}>
                        <View style={[{flex: 0.8}]}>
                          {/*EL - GATO ERROR VIEW - LOCATION OFF. */}
                        </View>
                        <View style={[{flex: 0.2, padding: 10}, GlobalStyles.center]}>
                          <Text style={[GlobalStyles.text18, {textAlign: 'center'}]}>We won't be able to track your training without <Text style={[GlobalStyles.orange]}>location permissions</Text>.</Text>
                        </View>
                      </View>
                    </>
                  )}
                </>
              )}            
            </View>

            <View style={styles.hudContainer}>
                <TouchableOpacity onPress={() => setActivitySelectorModalVisible(true)} style={styles.smallCircle}>
                    {activeActivity && (
                        <View style={styles.activityIconWrapper}>
                            <activeActivity.Icon width={26} height={26} fill="#000" />
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.largeCircle}>
                    <View style={styles.iconWrapper}>
                        <StartIcon width={64} height={64} fill="#fff" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallCircleRight}>
                    
                </TouchableOpacity>
            </View>
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
                    <ScrollView style={GlobalStyles.flex} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                        <View style={styles.activityInfoContainer}>
                            <Text style={GlobalStyles.text16}>Select activity</Text>
                            <TouchableOpacity onPress={() => setActivitySelectorModalVisible(false)}><CloseIcon width={20} height={20} fill={"#000"}/></TouchableOpacity>
                        </View>
                        <View style={styles.activitySelectContainer}>
                        {Object.entries(groupedActivities).map(([groupName, activitiesInGroup]) => (
                        <View key={groupName}>
                          <Text style={[GlobalStyles.text18, styles.groupHeader]}>{groupName}:</Text>
                          <View style={styles.activitySelectContainer}>
                            {activitiesInGroup.map((activity, index) => {
                              const IconComponent = activity.Icon;
                              return (
                                <TouchableOpacity
                                  key={index}
                                  style={styles.activityItem}
                                  onPress={() => setActivityType(activity.name)}
                                >
                                  <IconComponent
                                    width={24}
                                    height={24}
                                    fill={activityType === activity.name ? "#FF6600" : "#000"}
                                  />
                                  <Text
                                    style={[
                                      styles.activityText,
                                      GlobalStyles.text16,
                                      activityType === activity.name && { color: "#FF6600" }
                                    ]}
                                  >
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
  topContainer: {
    width: '100%',
    height: '9%',
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
    textAlign: 'center',
    alignItems: 'center',
  },
  topContIngReport: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },
  topBack: {
    position: 'absolute',
    left: 10,
    height: '100%',
    justifyContent: 'center',
  },
  topName: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNameText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
 
  content: {
    flex: 1,
  },
  mapContainer: {
    flex: 0.8,
    position: 'relative',
  },
  hudContainer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  activityIconWrapper:{
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

  activityItem:{
    flexDirection: 'row',
    paddingVertical: 10,
  },
  activityText:{
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
    zIndex: 999,
    padding: 10,
  },
  errorBackground: {
    backgroundColor: 'red',
  },
  warningBackground: {
    backgroundColor: '#98D8EF',
  },
});

export default CardioStart;
