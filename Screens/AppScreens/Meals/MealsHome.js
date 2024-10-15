import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';

import MealDisplay from '../../../Components/Meals/MealDisplay.js';

const screenHeight = Dimensions.get('window').height;

function MealsHome({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');



  const renderContent = () => {
    switch (activeTab) {
      case 'All':
        return (
          <>
            <View style={styles.rowTitle}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft]}>Most liked</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              <MealDisplay />
              <MealDisplay />
              <MealDisplay />
              <MealDisplay />
            </ScrollView>

          </>
        );
      case 'Search':
        return (
          <>

          </>
        );
      case 'Favourites':
        return (
          <>

          </>
        );
      case 'Own':
        return (
          <>

          </>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
        <View style={styles.titleCont}><Text style={[GlobalStyles.bold, GlobalStyles.text22]}>Recepies</Text></View>

        <View style={[styles.content, GlobalStyles.center]}>
          <ActivityIndicator size="large" color="#FF8303" />
        </View>

        <NavigationMenu navigation={navigation} currentScreen="MealsHome" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
      <View style={styles.titleCont}><Text style={[GlobalStyles.bold, GlobalStyles.text22]}>Recepies</Text></View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <View style={styles.topMenu}>
          <TouchableOpacity onPress={() => setActiveTab('All')} style={styles.option}>
            <Text style={[styles.optionText, activeTab === 'All' && styles.activeTab]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Search')} style={styles.option}>
            <Text style={[styles.optionText, activeTab === 'Search' && styles.activeTab]}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Favourites')} style={styles.option}>
            <Text style={[styles.optionText, activeTab === 'Favourites' && styles.activeTab]}>Favourites</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Own')} style={styles.option}>
            <Text style={[styles.optionText, activeTab === 'Own' && styles.activeTab]}>Own</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}

      </ScrollView>

      <NavigationMenu navigation={navigation} currentScreen="MealsHome" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  content: {
    flex: 1,    
  },
  row: {
    height: screenHeight * 0.35, 
    marginVertical: 10,     
  },
  rowTitle: {
    marginTop: 20,
    flex: 1,
  },
  item: {
    width: 300,                
    height: '100%',            
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,      
  },
  titleCont: {
    width: '100%',
    height: '9%',
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topMenu: {
    marginTop: 15,
    width: '100%',
    flexDirection: 'row',
  },
  option: {
    marginLeft: 15,
  },
  optionText: {
    fontSize: 18,
    fontFamily: 'Helvetica',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingBottom: 5,
  },
  activeTab: {
    borderBottomColor: '#FF8303', 
    color: '#FF8303',          
  },
});

export default MealsHome;
