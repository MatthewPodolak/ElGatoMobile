import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

import { GlobalStyles } from '../../Styles/GlobalStyles';

const BestLiftDisplay = ({ liftData, measureType }) => {
  const rawVolume = measureType === 'metric'? liftData.weightKg * liftData.repetitions : liftData.weightLbs * liftData.repetitions;
  const displayVolume = Number.isInteger(rawVolume) ? rawVolume : rawVolume.toFixed(1);
  const unit = measureType === 'metric' ? 'kg' : 'lbs';

  return (
    <View style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <BlurView style={[styles.glassEffect]} intensity={125} tint="light">
          <Text style={[GlobalStyles.text18]}>
            {liftData.name}
          </Text>

          <View style={styles.rowBetween}>
            <Text style={[GlobalStyles.text16]}>
              <Text style={GlobalStyles.orange}>
                {measureType === 'metric' ? liftData.weightKg : liftData.weightLbs}</Text>{' '}{unit} x{' '}
              <Text style={GlobalStyles.orange}>{liftData.repetitions}</Text>{' '}reps
            </Text>
            <Text style={[GlobalStyles.text16, GlobalStyles.orange]}>
              {displayVolume} {unit}
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
});

export default BestLiftDisplay;