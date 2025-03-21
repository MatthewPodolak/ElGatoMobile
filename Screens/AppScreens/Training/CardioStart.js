import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { activities } from '../../../assets/Data/activities.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import StartIcon from '../../../assets/main/Activities/play-fill.svg';
import CloseIcon from '../../../assets/main/Diet/x-lg.svg';

function CardioStart({ navigation }) {
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
            <View style={styles.mapContainer}></View>
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
    backgroundColor: 'red',
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
  
});

export default CardioStart;
