import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, TextInput, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import FilterModal from '../../../Components/Meals/FilterModal.js';
import InspectMealModal from '../../../Components/Meals/InspectMealModal.js';

import ChevronDown from '../../../assets/main/Diet/chevron-down.svg';
import ChevronRight from '../../../assets/main/Diet/chevron-right.svg';
import PlusIcon from '../../../assets/main/Diet/plus-lg.svg';
import AddMeal from '../../../assets/main/Diet/addFile.svg';

import MealDisplay from '../../../Components/Meals/MealDisplay.js';
import MealDisplayBig from '../../../Components/Meals/MealDisplayBig.js';

import { AllRecepies } from '../../../Styles/Meals/AllRecepies.js';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import MealDataService from '../../../Services/ApiCalls/MealData/MealDataService.js';


function MealsHome({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated } = useContext(AuthContext);

  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshRef = useRef(0);
  const REFRESH_INTERVAL = 5000;

  const [allMealsDataError, setAllMealsDataError] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [favouritesError, setFavouritesError] = useState(false);
  const [ownError, setOwnError] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(true);
  const [isLoadingLikedAndSaved, setIsLoadingLikedAndSaved] = useState(true);
  const [isLoadingOwn, setIsLoadingOwn] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const [allMealsData, setAllMealsData] = useState(null);
  const [searchedMealsData, setSearchedMealsData] = useState([]);
  const [likedMealsData, setLikedMealsData] = useState([]);
  const [filteredLikedMealsData, setFilteredLikedMealsData] = useState([]);
  const [ownMealsData, setOwnMealsData] = useState([]);

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
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const onRefresh = useCallback(async () => {
      setRefreshing(true);
  
      const now = Date.now();
      const sinceLast = now - lastRefreshRef.current;
  
      if (sinceLast >= REFRESH_INTERVAL){
        lastRefreshRef.current = now;
        
        switch(activeTab){
          case "All":
            await fetchAllMealsData();
            break;
          case "Search":
            await fetchSearchData();
            break;
          case "Favourites":
            await fetchUserLikedAndSavedMeals();
            break;
          case "Own":
            await fetchOwnData();
            break;
        }
        
      }
  
      setRefreshing(false);
  }, [activeTab, fetchAllMealsData, fetchSearchData, fetchUserLikedAndSavedMeals, fetchOwnData]);

  const starterPress = (requestType) => {
    navigation.navigate('StartersDisplay', { requestType });
  };

  const addMealClicked = () => {
    navigation.navigate('AddMeal');
  };

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

  const handleScrollEnd = () => {
    if (!isFetchingMore) {
        console.log("here");
        const nextPage = currentPage + 1;
        setIsFetchingMore(true);
        setCurrentPage(nextPage);
        fetchMoreSearchedData(nextPage);
    }
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
        await fetchOwnData();
      break;
    }
  };

  const fetchOwnData = async () => {
    setIsLoadingOwn(true);
    setOwnError(false);

    try{
      const res = await MealDataService.getOwnRecipes(setIsAuthenticated, navigation);

      if(!res.ok){
        setOwnError(true);
        return;
      }

      const data = await res.json();
      setOwnMealsData(data);

    }catch(error){
      setOwnError(true);
    }finally{
      setIsLoadingOwn(false);
    }
  };

  const fetchUserLikedAndSavedMeals = async () => {
    setIsLoadingLikedAndSaved(true);
    setFavouritesError(false);

    try{
      const res = await MealDataService.getLikedMeals(setIsAuthenticated, navigation);

      if(!res.ok){
        //return no
        setFavouritesError(true);
        return;
      }

      const data = await res.json();
      setLikedMealsData(data);
      setFilteredLikedMealsData(data);

    }catch(error){
      setFavouritesError(true);
    }finally{
      setIsLoadingLikedAndSaved(false);
    }
  };

  const fetchMoreSearchedData = async (page) => {
    try{
      let requestBody = {
        qty: currentQty,
        pageNumber: page,
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

      const res = await MealDataService.Search(setIsAuthenticated, navigation, requestBody);    

      if(!res.ok){
        //error
        console.log("search pagination req error");
      }
      
      const data = await res.json();
      setSearchedMealsData((prevItems) => [...prevItems, ...data]);
      setIsFetchingMore(false);

    }catch(error){
      console.log(error);
    }
  };

  const fetchSearchData = async (page) => {
    setIsLoadingSearch(true);
    setSearchError(false);
    try{

      let requestBody = {
        qty: currentQty,
        pageNumber: page??currentPage,
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

      const res = await MealDataService.Search(setIsAuthenticated, navigation, requestBody);

      if(!res.ok){
        setSearchError(true);
        return;
      }
      
      const data = await res.json();
      setSearchedMealsData(data);

    }catch(error){
      setSearchError(true);
    }finally{
      setIsLoadingSearch(false);
    }
  };

  const fetchAllMealsData = async () => {
    try {
      setAllMealsDataError(false);
      const res = await MealDataService.GetStarters(setIsAuthenticated, navigation);

      if(!res.ok){
        setAllMealsDataError(true);
        return;
      }

      const data = await res.json();
      setAllMealsData(data);
    } catch (error) {
       setAllMealsDataError(true);
    }finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMealsData();
  }, []);

  useEffect(() => {
    if (currentNutris || currentTime || currentSorting || searchedPhrase) {
      setCurrentPage(1);
      fetchSearchData(1);
    }
  }, [currentNutris, currentTime, currentSorting, searchedPhrase]);
  

  const renderContent = () => {
    switch (activeTab) {
      case 'All':
        return (
          <>
            {allMealsDataError ? (
              <>
                <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                  {/**GATO - ERROR LOADING STR. */}
                  <View style={styles.emptyGatoContainer}>
                  
                  </View>
                  <View style={[styles.centerText, {marginTop: 25}]}>
                    <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Something looks <Text style={[GlobalStyles.orange]}>off</Text>. Check your internet connection.</Text>
                  </View>
                </View>
              </>
            ):(
              <>
                {allMealsData?.mostLiked && allMealsData?.mostLiked.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => starterPress("Most Liked")} style={[AllRecepies.rowTitle, { marginTop: 20 }]}>
                      <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Most liked</Text>
                      <ChevronRight style = {styles.chevronRight} width={26} height={26} fill={"#000"} />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                      {allMealsData?.mostLiked?.map((item, index) => (
                        <TouchableOpacity
                          key={item.stringId}
                          onPress={() => inspectModal(item)}
                        >
                          <MealDisplay meal={item} navigation={navigation} />
                        </TouchableOpacity>
                        
                      ))}
                    </ScrollView>
                  </>
                )}

                {allMealsData?.all && allMealsData?.all.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => starterPress("All")} style={[AllRecepies.rowTitle]}>
                      <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>All</Text>
                      <ChevronRight style = {styles.chevronRight} width={26} height={26} fill={"#000"} />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                      {allMealsData?.all?.map((item, index) => (
                        <TouchableOpacity
                          key={item.stringId}
                          onPress={() => inspectModal(item)}
                        >
                          <MealDisplay key={item.stringId} meal={item} navigation={navigation} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}
                               

                {allMealsData?.breakfast && allMealsData?.breakfast.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => starterPress("Breakfast")} style={[AllRecepies.rowTitle]}>
                      <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Breakfast</Text>
                      <ChevronRight style = {styles.chevronRight} width={26} height={26} fill={"#000"} />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                      {allMealsData?.breakfast?.map((item, index) => (
                        <TouchableOpacity
                          key={item.stringId}
                          onPress={() => inspectModal(item)}
                        >
                          <MealDisplay key={item.stringId} meal={item} navigation={navigation} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}


                {allMealsData?.sideDish && allMealsData?.sideDish.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => starterPress("Side Dish")} style={[AllRecepies.rowTitle]}>
                      <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Side dish</Text>
                      <ChevronRight style = {styles.chevronRight} width={26} height={26} fill={"#000"} />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                      {allMealsData?.sideDish?.map((item, index) => (
                        <TouchableOpacity
                          key={item.stringId}
                          onPress={() => inspectModal(item)}
                        >
                          <MealDisplay key={item.stringId} meal={item} navigation={navigation} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                {allMealsData?.mainDish && allMealsData?.mainDish.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => starterPress("Main Dish")} style={[AllRecepies.rowTitle]}>
                      <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Main dish</Text>
                      <ChevronRight style = {styles.chevronRight} width={26} height={26} fill={"#000"} />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                      {allMealsData?.mainDish?.map((item, index) => (
                        <TouchableOpacity
                          key={item.stringId}
                          onPress={() => inspectModal(item)}
                        >
                          <MealDisplay key={item.stringId} meal={item} navigation={navigation} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}


                {allMealsData?.highProtein && allMealsData?.highProtein.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => starterPress("High Protein")} style={[AllRecepies.rowTitle]}>
                      <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>High protein</Text>
                      <ChevronRight style = {styles.chevronRight} width={26} height={26} fill={"#000"} />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                      {allMealsData?.highProtein?.map((item, index) => (
                        <TouchableOpacity
                          key={item.stringId}
                          onPress={() => inspectModal(item)}
                        >
                          <MealDisplay key={item.stringId} meal={item} navigation={navigation} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}


                {allMealsData?.lowCarbs && allMealsData?.lowCarbs.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => starterPress("Low Carbs")} style={[AllRecepies.rowTitle]}>
                      <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Low carbs</Text>
                      <ChevronRight style = {styles.chevronRight} width={26} height={26} fill={"#000"} />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                      {allMealsData?.lowCarbs?.map((item, index) => (
                        <TouchableOpacity
                          key={item.stringId}
                          onPress={() => inspectModal(item)}
                        >
                          <MealDisplay key={item.stringId} meal={item} navigation={navigation} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}        

                {allMealsData?.highCarb && allMealsData?.highCarb.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => starterPress("High Carbs")} style={[AllRecepies.rowTitle]}>
                      <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>High carb</Text>
                      <ChevronRight style = {styles.chevronRight} width={26} height={26} fill={"#000"} />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                      {allMealsData?.highCarb?.map((item, index) => (
                        <TouchableOpacity
                          key={item.stringId}
                          onPress={() => inspectModal(item)}
                        >
                          <MealDisplay key={item.stringId} meal={item} navigation={navigation} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}


                {allMealsData?.lowFats && allMealsData?.lowFats.length > 0 && (
                  <>
                    <TouchableOpacity onPress={() => starterPress("Low Fat")} style={[AllRecepies.rowTitle]}>
                      <Text style = {[GlobalStyles.text22, GlobalStyles.centerLeft, GlobalStyles.bold]}>Low fat</Text>
                      <ChevronRight style = {styles.chevronRight} width={26} height={26} fill={"#000"} />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} style={styles.row} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                      {allMealsData?.lowFats?.map((item, index) => (
                        <TouchableOpacity
                          key={item.stringId}
                          onPress={() => inspectModal(item)}
                        >
                          <MealDisplay key={item.stringId} meal={item} navigation={navigation} />
                        </TouchableOpacity>
                      ))}              
                    </ScrollView> 
                  </>
                )}
          
              </>
            )}       
          </>    
        );
      case 'Search':
        return (
          <>
            {searchError ? (
              <>
                <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                  {/**GATO - ERROR SEARCH ERROR. */}
                  <View style={styles.emptyGatoContainer}>
                  
                  </View>
                  <View style={[styles.centerText, {marginTop: 25}]}>
                    <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Something looks <Text style={[GlobalStyles.orange]}>off</Text>. Check your internet connection.</Text>
                  </View>
                </View>
              </>
            ):(
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
                      <FlatList
                        style={styles.searchedContentContainer}
                        data={searchedMealsData}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.searchedRow]}
                                onPress={() => inspectModal(item)}
                            >
                                <MealDisplayBig meal={item} navigation={navigation} />
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.stringId}
                        onEndReached={() => handleScrollEnd()}
                        onEndReachedThreshold={0.7}
                        ListFooterComponent={isFetchingMore && (
                            <View style={[styles.fetchMoreContainer, GlobalStyles.center]}>
                                <ActivityIndicator size="small" color="#FF8303" />
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    />              
                  )}
                </View>
              </>
            )}                         
          </>
        );
      case 'Favourites':
        return (
          <>
            {favouritesError ? (
              <>
                <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                  {/**GATO - ERROR FAV ERROR. */}
                  <View style={styles.emptyGatoContainer}>
                  
                  </View>
                  <View style={[styles.centerText, {marginTop: 25}]}>
                    <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Something looks <Text style={[GlobalStyles.orange]}>off</Text>. Check your internet connection.</Text>
                  </View>
                </View>
              </>
            ):(
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
                            <MealDisplayBig meal={item} navigation={navigation} />
                          </View>
                        </TouchableOpacity>
                        
                      ))}

                    </ScrollView>
                  )}


                  </View>
              </>
            )}         
          </>
        );
      case 'Own':
        return (
          <>
            {ownError ? (
              <>
                <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                  {/**GATO - ERROR OWN ERROR. */}
                  <View style={styles.emptyGatoContainer}>
                  
                  </View>
                  <View style={[styles.centerText, {marginTop: 25}]}>
                    <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Something looks <Text style={[GlobalStyles.orange]}>off</Text>. Check your internet connection.</Text>
                  </View>
                </View>
              </>
            ):(
              <>
                <View style={styles.container}>
                  {isLoadingOwn ? (
                    <View style = {styles.loadingSearchContainer}>
                      <ActivityIndicator size="large" color="#FF8303" />
                    </View>
                  ) : (!ownMealsData || ownMealsData.length === 0) && isLoadingOwn == false ? (
                    <View>
                        <View style={styles.ownGatoCont}>

                        </View>
                        <View style={[styles.ownGatoTextCont, GlobalStyles.center]}>
                          <Text style={[GlobalStyles.text18]}><Text style={GlobalStyles.orange}>Oh no!</Text> There is nothing here!</Text>
                          <Text style={[GlobalStyles.text16]}>Show off ur cooking abilities, just saying.</Text>
                        </View>
                    </View>
                  ) : (
                    <View style={styles.ownTopCont}>
                      {ownMealsData?.map((item, index) => (
                        <TouchableOpacity 
                          style={styles.searchedRow}
                          key={`${item.stringId || 'item'}-${index}`}
                          onPress={() => inspectModal(item)}
                          >
                          <View>
                            <MealDisplayBig meal={item} navigation={navigation} />
                          </View>
                        </TouchableOpacity>         
                      ))}
                    </View>
                  )}

                </View>
              </>
            )}         
          </>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={AllRecepies.container} edges={['left', 'right', 'bottom']}>
        <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
        <StatusBar style="light"  backgroundColor="#fff" translucent={false} hidden={false} />
        
        <View style={AllRecepies.titleCont}>
          <View style = {AllRecepies.titleLeft}></View>
          <View style = {AllRecepies.titleMid}><Text style={[GlobalStyles.bold, GlobalStyles.text22]}>Recipes</Text></View>
          <TouchableOpacity style = {AllRecepies.titleRight} onPress={() => addMealClicked()}>
            <AddMeal width={28} height={28} fill={"#fff"} />
          </TouchableOpacity>
        </View>

        <View style={[AllRecepies.content, GlobalStyles.center]}>
          <ActivityIndicator size="large" color="#FF8303" />
        </View>

        <NavigationMenu navigation={navigation} currentScreen="MealsHome" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={AllRecepies.container} edges={['left', 'right', 'bottom']}>
      <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
      <StatusBar style="light"  backgroundColor="#fff" translucent={false} hidden={false} />

      <View style={AllRecepies.titleCont}>
        <View style = {AllRecepies.titleLeft}></View>
        <View style = {AllRecepies.titleMid}><Text style={[GlobalStyles.bold, GlobalStyles.text22]}>Recipes</Text></View>
        <TouchableOpacity style = {AllRecepies.titleRight} onPress={() => addMealClicked()}>
          <AddMeal width={28} height={28} fill={"#fff"} />
        </TouchableOpacity>
      </View>

      <FlatList
          style={AllRecepies.content}
          data={[]}
          ListHeaderComponent={() => (
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
          )}
          renderItem={null}
          ListEmptyComponent={renderContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF8303"
              colors={['#FF8303']}
              title={refreshing ? 'Refreshing...' : null}
            />
          }
      />


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
        navigation={navigation}
      >
      </InspectMealModal>

      {activeTab === "Own" && (
        <TouchableOpacity style={[styles.hoverButton, GlobalStyles.center]} onPress={() => addMealClicked()}>
          <PlusIcon style={styles.plusText} fill={'#fff'} width={27} height={27} />
        </TouchableOpacity>
      )}

      <NavigationMenu navigation={navigation} currentScreen="MealsHome" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    //minHeight: screenHeight * 0.32, ????
    minHeight: 229,
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
    fontSize: 18,
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
  },
  chevronRight: {
    marginRight: 5,
  },
  fetchMoreContainer: {
    minHeight: 100,
  },

  hoverButton: {
    width: 60,
    height: 60,
    bottom: 85,
    right: 5,
    position: 'absolute',
    borderRadius: 30,
    backgroundColor: '#FF8303',
  },

  ownTopCont: {
    marginTop: 20,
  },
  ownGatoCont: {
    height: '85%',
  },
  ownGatoTextCont: {

  },
  emptyGatoContainer: {
    minHeight: 500,
  },
});

export default MealsHome;
