import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';
import FilterModal from '../../../Components/Meals/FilterModal.js';
import InspectMealModal from '../../../Components/Meals/InspectMealModal.js';

import ChevronDown from '../../../assets/main/Diet/chevron-down.svg';

import MealDisplay from '../../../Components/Meals/MealDisplay.js';
import MealDisplayBig from '../../../Components/Meals/MealDisplayBig.js';

import { AllRecepies } from '../../../Styles/Meals/AllRecepies.js';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import AuthService from '../../../Services/Auth/AuthService.js';

import config from '../../../Config.js';

const screenHeight = Dimensions.get('window').height;

function MealsHome({ navigation }) {
  const { setIsAuthenticated } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(true);
  const [isLoadingLikedAndSaved, setIsLoadingLikedAndSaved] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const [allMealsData, setAllMealsData] = useState(null);
  const [searchedMealsData, setSearchedMealsData] = useState([]);
  const [likedMealsData, setLikedMealsData] = useState([]);
  const [filteredLikedMealsData, setFilteredLikedMealsData] = useState([]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [inspectModalVisible, setInspectModalVisible] = useState(false);

  //inspect
  const [currentlyInspectedItem, setCurrentlyInspectedItem] = useState(null);

  //searching
  const [typingTimeout, setTypingTimeout] = useState(null);

  const [searchedPhrase, setSearchedPhrase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQty, setCurrentQty] = useState(100);
  const [currentSorting, setCurrentSorting] = useState(0);
  const [currentNutris, setCurrentNutris] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);

  const applyFilters = (filterModel) => {
    if (filterModel && filterModel.currentNutris) {
       setCurrentNutris(filterModel.currentNutris);
    }
    if (filterModel && filterModel.currentTime){
       setCurrentTime(filterModel.currentTime);
    }
    if(filterModel && filterModel.sorting){
      setCurrentSorting(filterModel.sorting);
    }
  };

  const inspectModal = (item) => {
    setCurrentlyInspectedItem(item);
    setInspectModalVisible(true);
  }

  const setLikedRecepieSearch = (phrase) => {
    setFilteredLikedMealsData(
      likedMealsData.filter((item) =>
        item.name.toLowerCase().includes(phrase.toLowerCase())
      )
    );
  };

  const getSearchedPhrase = (phrase) => {
    setSearchedPhrase(phrase);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(
      setTimeout(() => {
        setSearchedPhrase(phrase);
      }, 1000)
    );
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const closeInspectModal = () => {
    setInspectModalVisible(false);
  };

  const setActiveTabFun = async (tab) => {
    setActiveTab(tab);
    switch(tab){
      case "Search":
        await fetchSearchData();
        break;
      case "Favourites":
        await fetchUserLikedAndSavedMeals();
      break;
      case "Own":
        console.log("Own tab is active");
      break;
    }
  };

  const fetchUserLikedAndSavedMeals = async () => {
    setIsLoadingLikedAndSaved(true);
    try{
      const token = await AuthService.getToken();   
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return;
      }
 
      const res = await fetchWithTimeout(
        `${config.ipAddress}/api/Meal/GetLikedMeals`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        config.timeout
      );

      if(!res.ok){
        //return no
        console.log('error while fetching liked meals main page');
      }

      const data = await res.json();
      setLikedMealsData(data);
      setFilteredLikedMealsData(data);

    }catch(error){
      console.log('error');
    }finally{
      setIsLoadingLikedAndSaved(false);
    }
  };

  const fetchSearchData = async () => {
    setIsLoadingSearch(true);
    try{
      const token = await AuthService.getToken();
      
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return;
      }

      let requestBody = {
        qty: currentQty,
        pageNumber: currentPage,
        phrase: searchedPhrase ?? "",
        sortValue: currentSorting,
      };
  
      if (currentNutris) {
        requestBody.nutritions = {
          minimalCalories: currentNutris.minCalorie ?? 1,
          maximalCalories: currentNutris.maxCalorie ?? 9999,
          minimalProtein: currentNutris.minProtein ?? 1,
          maximalProtein: currentNutris.maxProtein ?? 9999,
          minimumCarbs: currentNutris.minCarbs ?? 1,
          maximalCarbs: currentNutris.maxCarbs ?? 9999,
          minimumFats: currentNutris.minFats ?? 1,
          maximalFats: currentNutris.maxFats ?? 9999,
        };
      }

      if (currentTime) {
        requestBody.searchTimeRange = {
          minimalTime: currentTime.minTime ?? 1,
          maximumTime: currentTime.maxTime ?? 999999,
        };
      }

      const res = await fetchWithTimeout(
        `${config.ipAddress}/api/Meal/Search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),       
        },
        config.timeout
      );

      if(!res.ok){
        //error
        console.log("search req error");
      }
      
      const data = await res.json();
      setSearchedMealsData(data);

    }catch(error){
      //error
      console.log('internal while fetching search ress');
    }finally{
      setIsLoadingSearch(false);
    }
  };

  const fetchAllMealsData = async () => {
    try {
      const token = await AuthService.getToken();
      
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return;
      }
 
      const res = await fetchWithTimeout(
        `${config.ipAddress}/api/Meal/GetStarters`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        config.timeout
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

  useEffect(() => {
    if (currentNutris || currentTime || currentSorting || searchedPhrase) {
      fetchSearchData();
    }
  }, [currentNutris, currentTime, currentSorting, searchedPhrase]);
  

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
                <TouchableOpacity
                  key={item.stringId}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplay meal={item} />
                </TouchableOpacity>
                
              ))}
            </ScrollView>
            
            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>All</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.all?.map((item, index) => (
                <TouchableOpacity
                  key={item.stringId}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplay key={item.stringId} meal={item} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Breakfast</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.breakfast?.map((item, index) => (
                <TouchableOpacity
                  key={item.stringId}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplay key={item.stringId} meal={item} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Side dish</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.sideDish?.map((item, index) => (
                <TouchableOpacity
                  key={item.stringId}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplay key={item.stringId} meal={item} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Main dish</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.mainDish?.map((item, index) => (
                <TouchableOpacity
                  key={item.stringId}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplay key={item.stringId} meal={item} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>High protein</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.highProtein?.map((item, index) => (
                <TouchableOpacity
                  key={item.stringId}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplay key={item.stringId} meal={item} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Low carbs</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.lowCarbs?.map((item, index) => (
                <TouchableOpacity
                  key={item.stringId}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplay key={item.stringId} meal={item} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>High carb</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.highCarb?.map((item, index) => (
                <TouchableOpacity
                  key={item.stringId}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplay key={item.stringId} meal={item} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[AllRecepies.rowTitle]}>
              <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Low fat</Text>
            </View>
            <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {allMealsData?.lowFats?.map((item, index) => (
                <TouchableOpacity
                  key={item.stringId}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplay key={item.stringId} meal={item} />
                </TouchableOpacity>
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

            {(!searchedMealsData || searchedMealsData.length === 0) && !isLoadingSearch ? (
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
                  <TouchableOpacity
                    style={styles.searchedRow} key={item.stringId ? item.stringId : `item-${index}`}
                    onPress={() => inspectModal(item)}
                  >
                    <View>
                      <MealDisplayBig meal={item} />
                    </View>
                  </TouchableOpacity>

                ))}
              </ScrollView>
            )}
          </View>
                  
          </>
        );
      case 'Favourites':
        return (
          <>
            <View style = {styles.container}>
            <View style = {styles.containerSearchBar}>
                <View style = {styles.searchBarContainer}>
                  <View style={styles.barContainer}>
                    <TextInput
                      style={styles.searchInput}
                      selectionColor="#FF8303"
                      placeholder="Search in liked ..."
                      placeholderTextColor="#999"
                      onChangeText={setLikedRecepieSearch}
                    />
                  </View>
                </View>
            </View>

            {(!filteredLikedMealsData || filteredLikedMealsData.length === 0) && !isLoadingLikedAndSaved ? (
              <View style={styles.emptySearchContainer}>
                <View style = {styles.emptySearchGatoLottie}>
                   {/*ELGATO*/}
                </View>
                <View style = {styles.emptySearchText}>
                  <Text style = {styles.emptySearchTxt}><Text style = {[GlobalStyles.orange, GlobalStyles.bold]}>Nothing? </Text>You need to keep up with liking all the good stuff out there.</Text>
                </View>
              </View>
              ) : isLoadingLikedAndSaved == true ? (
                <View style = {styles.loadingSearchContainer}>
                  <ActivityIndicator size="large" color="#FF8303" />
                </View>
              ) : (
              <ScrollView
                style={styles.searchedContentContainer}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                {filteredLikedMealsData?.map((item, index) => (
                  <TouchableOpacity 
                    style={styles.searchedRow}
                    key={`${item.stringId || 'item'}-${index}`}
                    onPress={() => inspectModal(item)}
                    >
                    <View>
                      <MealDisplayBig meal={item} />
                    </View>
                  </TouchableOpacity>
                  
                ))}

              </ScrollView>
            )}


            </View>
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
        applyFilters={applyFilters}
        currentNutris={currentNutris}
        currentTime={currentTime}
        currentSorting = {currentSorting}       
      >
      </FilterModal>
      <InspectMealModal
        visible={inspectModalVisible}
        closeInspectModal={closeInspectModal}
        item={currentlyInspectedItem}
      >
      </InspectMealModal>

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
