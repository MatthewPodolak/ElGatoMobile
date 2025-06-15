import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

import { GlobalStyles } from '../../Styles/GlobalStyles';

const RecentLiftDisplay = ({ liftData, measureType }) => {
  const unit = measureType === 'metric' ? 'kg' : 'lbs';

  let totalVolume = 0;
  let totalReps = 0;

  return (
    <View style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <BlurView style={[styles.glassEffect]} intensity={125} tint="light">
          <Text style={GlobalStyles.text18}>{liftData.name} </Text>
          <View style = {styles.hrLine}></View>

          {liftData?.series?.map((item, key) => {
            const weight = measureType === 'metric' ? item.weightKg : item.weightLbs;
            const reps = item.repetitions;
            const volume = weight * reps;

            totalVolume += volume;
            totalReps += reps;

            const displayVolume = Number.isInteger(volume) ? volume : volume.toFixed(1);

            return (
              <View style={styles.rowBetween} key={key}>
                <Text style={[GlobalStyles.text16]}>
                  <Text style={GlobalStyles.orange}>{weight}</Text> {unit} x{' '}
                  <Text style={GlobalStyles.orange}>{reps}</Text> reps
                </Text>
                <Text style={[GlobalStyles.text16, GlobalStyles.orange]}>
                  {displayVolume} {unit}
                </Text>
              </View>
            );
          })}

          <View style = {styles.hrLine}></View>
          <View style={styles.totalsRow}>
            <Text style={GlobalStyles.text14}>
              <Text style={GlobalStyles.bold}>Total volume: </Text>
              {Number.isInteger(totalVolume) ? totalVolume : totalVolume.toFixed(1)}{' '}
              {unit}{'   '}
              <Text style={GlobalStyles.bold}>Total reps: </Text>
              {totalReps}
            </Text>
          </View>
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalsRow: {
    marginTop: 10,
  },
  hrLine: {
    borderBottomColor: 'black',
    opacity: 0.2,
    borderBottomWidth: 1,
    marginBottom: 10,
    marginTop: 10,
  },
});

export default RecentLiftDisplay;