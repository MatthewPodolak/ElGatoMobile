import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import MakroMenu from '../../../Components/Diet/MakroMenu';
import Calendar from '../../../Components/Diet/DietCalendar';

function DietHome({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const generateContentForDate = (date) => {
    return <Text>SELECTED DATE : {date}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Calendar onDateSelect={handleDateSelect} />
      <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
        {selectedDate ? generateContentForDate(selectedDate) : <Text>base load f</Text>}
      </ScrollView>
      <MakroMenu />
      <NavigationMenu navigation={navigation} currentScreen="DietHome" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'whitesmoke',
    alignItems: 'center',
  },
  scrollContainer: {
    width: '100%',
    backgroundColor: 'whitesmoke',
    flex: 1,
  },
});

export default DietHome;
