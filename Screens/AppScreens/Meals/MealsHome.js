import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FilterModal from '../../../Components/Meals/FilterModal.js';

import ChevronDown from '../../../assets/main/Diet/chevron-down.svg';

import MealDisplay from '../../../Components/Meals/MealDisplay.js';
import MealDisplayBig from '../../../Components/Meals/MealDisplayBig.js';

import { AllRecepies } from '../../../Styles/Meals/AllRecepies.js';

const screenHeight = Dimensions.get('window').height;

function MealsHome({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const [allMealsData, setAllMealsData] = useState(null);
  const [searchedMealsData, setSearchedMealsData] = useState([]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  //searching
  const [searchedPhrase, setSearchedPhrase] = useState(null);

  const getSearchedPhrase = (phrase) => {
    console.log('searched phrase::: -> :::: ' + phrase);
  };
  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const setActiveTabFun = async (tab) => {
    setActiveTab(tab);
    switch(tab){
      case "Search":
        console.log("Search call");
        await fetchSearchData();
        break;
      case "Favourites":
        console.log("Favourites tab is active");
      break;
      case "Own":
        console.log("Own tab is active");
      break;
    }
  };

  const fetchSearchData = async () => {
    try{
      const token = await AsyncStorage.getItem('jwtToken');


      const res = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Meal/Search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qty: 50,
            pageNumber: 1,
            phrase: "",
          }),
        },
        5000
      );

      if(!res.ok){
        //error
        console.log("search req error");
      }
      
      const data = await res.json();

      setSearchedMealsData(data);
      setIsLoadingSearch(false);
    }catch(error){
      //error
      console.log('internal while fetching search ress');
    }
  };

  const fetchAllMealsData = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const res = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Meal/GetStarters`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        5000
      );

      if(!res.ok){
        //return no
        console.log('error while fetching meal main page');
      }

      const data = await res.json();
      setAllMealsData(data);
      setIsLoading(false);
    } catch (error) {
       //error - display.
    } 
  };

  useEffect(() => {
    fetchAllMealsData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'All':
        return (
          <>
            <View style={[AllRecepies.rowTitle, { marginTop: 20 }]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Most liked</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.mostLiked?.map((item, index) => (
                <MealDisplay key={item.stringId} meal={item} />
              ))}
            </ScrollView>
            
            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>All</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.all?.map((item, index) => (
                <MealDisplay key={item.stringId} meal={item} />
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Breakfast</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.breakfast?.map((item, index) => (
                <MealDisplay key={item.stringId} meal={item} />
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Side dish</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.sideDish?.map((item, index) => (
                <MealDisplay key={item.stringId} meal={item} />
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Main dish</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.mainDish?.map((item, index) => (
                <MealDisplay key={item.stringId} meal={item} />
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>High protein</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.highProtein?.map((item, index) => (
                <MealDisplay key={item.stringId} meal={item} />
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Low carbs</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.lowCarbs?.map((item, index) => (
                <MealDisplay key={item.stringId} meal={item} />
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>High carb</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.highCarb?.map((item, index) => (
                <MealDisplay key={item.stringId} meal={item} />
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Low fat</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.lowFats?.map((item, index) => (
                <MealDisplay key={item.stringId} meal={item} />
              ))}
            </ScrollView>
          </>
        );
      case 'Search':
        return (
          <>
          <View style = {styles.container}>
            <View style = {styles.containerSearchBar}>
                <View style = {styles.searchBarContainer}>
                  <View style={styles.barContainer}>
                    <TextInput
                      style={styles.searchInput}
                      selectionColor="#FF8303"
                      placeholder="Search for ..."
                      placeholderTextColor="#999"
                      value={searchedPhrase}
                      onChangeText={getSearchedPhrase}
                    />
                  </View>
                </View>

                <View style = {styles.filterRow}>
                  <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
                    <View style = {styles.filterContainer}>
                      <Text style = {styles.filterText}>Filters </Text>
                      <ChevronDown style={{ marginTop: 3 , marginRight: 5}} width={17} height={17} fill={'whitesmoke'} />
                    </View>
                  </TouchableOpacity>
                </View>
            </View>

             {searchedMealsData == null && isLoadingSearch == false ? (
              <View style={styles.emptySearchContainer}>
                <View style = {styles.emptySearchGatoLottie}>
                   {/*ELGATO*/}
                </View>
                <View style = {styles.emptySearchText}>
                  <Text style = {styles.emptySearchTxt}><Text style = {[GlobalStyles.orange, GlobalStyles.bold]}>Upsss...</Text> looks like there is not much to show. Try changing your filters.</Text>
                </View>
              </View>
              ) : isLoadingSearch == true ? (
                <View style = {styles.loadingSearchContainer}>
                  <ActivityIndicator size="large" color="#FF8303" />
                </View>
              ) : (
              <ScrollView
                style={styles.searchedContentContainer}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                {searchedMealsData?.map((item, index) => (
                  <View style={styles.searchedRow} key={item.stringId ? item.stringId : `item-${index}`}>
                    <MealDisplayBig meal={item} />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

         
                    
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
      <SafeAreaView style={AllRecepies.container}>
        <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
        <View style={AllRecepies.titleCont}><Text style={[GlobalStyles.bold, GlobalStyles.text22]}>Recepies</Text></View>

        <View style={[AllRecepies.content, GlobalStyles.center]}>
          <ActivityIndicator size="large" color="#FF8303" />
        </View>

        <NavigationMenu navigation={navigation} currentScreen="MealsHome" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={AllRecepies.container}>
      <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
      <View style={AllRecepies.titleCont}><Text style={[GlobalStyles.bold, GlobalStyles.text22]}>Recepies</Text></View>

      <ScrollView style={AllRecepies.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <View style={AllRecepies.topMenu}>
          <TouchableOpacity onPress={() => setActiveTabFun('All')} style={AllRecepies.option}>
            <Text style={[AllRecepies.optionText, activeTab === 'All' && AllRecepies.activeTab]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTabFun('Search')} style={AllRecepies.option}>
            <Text style={[AllRecepies.optionText, activeTab === 'Search' && AllRecepies.activeTab]}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTabFun('Favourites')} style={AllRecepies.option}>
            <Text style={[AllRecepies.optionText, activeTab === 'Favourites' && AllRecepies.activeTab]}>Favourites</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTabFun('Own')} style={AllRecepies.option}>
            <Text style={[AllRecepies.optionText, activeTab === 'Own' && AllRecepies.activeTab]}>Own</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}

      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        closeFilterModal= {closeFilterModal}       
      >
      </FilterModal>

      <NavigationMenu navigation={navigation} currentScreen="MealsHome" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: screenHeight * 0.32,
    height: 'auto',
    marginVertical: 10,    
  },

  container: {
    minHeight: 600,
    height: 'auto',
  },
  containerSearchBar:{

  },
  searchBarContainer: {
    height: 50, 
    marginTop: 10,
  },
  barContainer: {
    width: '90%',
    height: '100%',
    marginLeft: '5%',
    marginVertical: 2,
  },
  searchInput: {
    height: '80%',
    backgroundColor: '#1B1A17',
    color: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchedContentContainer: {
    flex: 1,
    marginTop: 10,
  },
  filterRow: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#1B1A17',
    borderRadius: 15,
    height: '80%',
    minWidth: 80,
    marginRight: 10,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  filterText:{
    marginLeft: 10,
    color: 'whitesmoke',
    fontFamily: 'Helvetica',
  },


  /*SEARCH*/
  emptySearchContainer: {
    flex: 1,
  },
  emptySearchGatoLottie: {
    height: '80%',
    backgroundColor: 'orange',
  },
  emptySearchText: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 20,
  },
  emptySearchTxt: {
    fontSize: 20,
    fontFamily: 'Helvetica',
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingSearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
  },
  searchedRow: {
    height: 300,
    marginBottom: 20,
  }
});

export default MealsHome;
