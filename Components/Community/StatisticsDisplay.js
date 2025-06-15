import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { activities } from '../../assets/Data/activities.js';

import { GlobalStyles } from '../../Styles/GlobalStyles';

const StatisticsDisplay = ({ statisticsData, measureType, basic = true, label = null, }) => {

  const labelMap = {
    weekly: 'This Week',
    yearToDay: 'Year to Date',
    allTime: 'All Time',
  };

  let title = labelMap[label] || label;

  if (!label && !basic && typeof statisticsData?.activityType === 'number') {
    const activity = activities.find(act => act.id === statisticsData.activityType);
    title = activity?.name ?? `Activity ${statisticsData.activityType}`;
  }

  if (!label && !basic && typeof statisticsData?.activityType === 'number') {
    const activity = activities.find(act => act.name.toLowerCase() === statisticsData?.activityType?.toString().toLowerCase() || act.id === statisticsData.activityType);
    title = activity?.name ?? `Activity ${statisticsData.activityType}`;
  }

  const formatDistance = (value) => {
    if (typeof value !== 'number') return value;

    const rounded = Math.round(value / 0.02) * 0.02;
    return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2).replace(/\.?0+$/, '');
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <BlurView style={[styles.glassEffect]} intensity={125} tint="light">

            <View style={[GlobalStyles.center]}><Text style={[GlobalStyles.text18]}>{title}</Text></View>
            <View style = {styles.hrLineBlack}></View>
            
            {basic ? (
              <>
                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Calories burnt:</Text>
                  </View>
                  <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{statisticsData?.caloriesBurnt ?? 0}</Text>
                </View>

                <View style = {styles.hrLine}></View>

                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Steps:</Text>
                  </View>
                  <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{statisticsData?.steps ?? 0}</Text>
                </View>

                <View style = {styles.hrLine}></View>

                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Weight lifted:</Text>
                  </View>
                  {measureType === "metric" ? (
                    <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{statisticsData?.weightKg ?? 0} kg</Text>
                  ):(
                    <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{statisticsData?.weightLbs ?? 0} lbs</Text>
                  )}
                </View>

                <View style = {styles.hrLine}></View>

                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Cardio trainings:</Text>
                  </View>
                  <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{statisticsData?.activitiesCount ?? 0}</Text>
                </View>

                <View style = {styles.hrLine}></View>

                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Time spent on cardio:</Text>
                  </View>
                  <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{statisticsData?.timeSpentOnActivites ?? "0:00"}</Text>
                </View>

                <View style = {styles.hrLine}></View>

                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Distance covered:</Text>
                  </View>
                  {measureType === "metric" ? (
                    <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{formatDistance(statisticsData?.totalDistanceKm ?? 0)} km</Text>
                  ):(
                    <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{formatDistance(statisticsData?.totalDistanceMiles ?? 0)} miles</Text>
                  )}
                </View>
                
                <View style = {styles.hrLine}></View>
              </>
            ):(
              <>
                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Trainings done:</Text>
                  </View>
                  <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{statisticsData?.totalActivities ?? 0}</Text>
                </View>

                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Calories burnt:</Text>
                  </View>
                  <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{statisticsData?.totalCaloriesBurnt ?? 0}</Text>
                </View>

                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Distance covered:</Text>
                  </View>
                  {measureType === "metric" ? (
                    <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{formatDistance(statisticsData?.totalDistanceKm ?? 0)} km</Text>
                  ):(
                    <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{formatDistance(statisticsData?.totalDistanceMiles ?? 0)} miles</Text>
                  )}
                </View>

                <View style={styles.rowBetween}>
                  <View style={styles.leftGroup}>
                    <Text style={[GlobalStyles.text14]}>Time spent:</Text>
                  </View>
                  <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>{statisticsData?.totalTimeSpent ?? 0}</Text>
                </View>
              </>
            )}

        </BlurView>
      </View>
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
    width: '98%',
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
  hrLine: {
    borderBottomColor: 'black',
    opacity: 0.2,
    borderBottomWidth: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  hrLineBlack: {
    borderBottomColor: 'black',
    opacity: 0.6,
    borderBottomWidth: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 2
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default StatisticsDisplay;