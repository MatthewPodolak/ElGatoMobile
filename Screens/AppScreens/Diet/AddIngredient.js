import React, { useState, useEffect,useContext } from 'react';
import { TouchableOpacity, Modal, Alert, TouchableWithoutFeedback  } from 'react-native';
import { ScrollView,View, Text, TextInput, StatusBar, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, PermissionStatus } from 'expo-camera';

import DietDataService from '../../../Services/ApiCalls/DietData/DietDataService.js';
import MealDataService from '../../../Services/ApiCalls/MealData/MealDataService.js';
import UserRequestService from '../../../Services/ApiCalls/RequestData/UserRequestService.js';

import BarCodeIcon from '../../../assets/main/Diet/upc-scan.svg';
import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import AddIcon from '../../../assets/main/Diet/plus-circle-fill.svg';
import CloseIcon from '../../../assets/main/Diet/x-lg.svg';
import CheckIcon from '../../../assets/main/Diet/check2.svg';
import ReportIcon from '../../../assets/main/Diet/flag-fill.svg';

import GatoRightModal from '../../../Components/ElGato/GatoRightModal';
import InspectMealModal from '../../../Components/Meals/InspectMealModal.js';
import { AddIngredientStyles } from '../../../Styles/Diet/AddIngredientStyles.js';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';

import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import MealDisplayBig from '../../../Components/Meals/MealDisplayBig.js';

const AddIngredient = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Search');
  const [initialSearchPerformed, setInitialSearchPerformed] = useState(false);

  const [isFavLoading, setIsFavLoading] = useState(false);
  const [isOwnLoading, setIsOwnLoading] = useState(false);
  const [isMealLoading, setIsMealLoading] = useState(false);

  const [favError, setFavError] = useState(null);
  const [ownError, setOwnError] = useState(null);
  
  const [likedMealsData, setLikedMealsData] = useState([]);
  const [ownMealsData, setOwnMealsData] = useState([]);

  const [ingredientName, setIngredientName] = useState('');
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportedItem, setReportedItem] = useState(null);

  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  const [currentlyInspectedItem, setCurrentlyInspectedItem] = useState(null);

  const [addProductModalVisible, setAddProductModalVisible] = useState(false);

  const [elGatoAddModalVisible, setElGatoAddModalVisible] = useState(false);
  const [elGatoCurrentEan, setElGatoCurrentEan] = useState(null);

  const [ingModalVisible, setIngModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsData, setSelectedItemsData] = useState([]);
  const [searchedData, setSearchedData] = useState(null);
  const [searchCount, setSearchCount] = useState(20);
  const [searchQuery, setSearchQuery] = useState(null);
  const [isSearchingMore, setIsSearchingMore] = useState(false);
  
  const [scannedData, setScannedData] = useState([]);

  const [typingTimeout, setTypingTimeout] = useState(null);

  const [inputGrams, setInputGrams] = useState('');
  const [macros, setMacros] = useState({ proteins: 0, carbs: 0, fats: 0, kcal: 0 });
  const [gramsCounter, setGramsCounter] = useState(0);

  const [productName, setProductName] = useState('');
  const [ean, setEan] = useState('');
  const [brandName, setBrandName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  const [addNewError, setAddNewError] = useState(null);
  const [addNewName, setAddNewName] = useState(null);
  const [addNewWeight, setAddNewWeight] = useState(null);
  const [addNewKcals, setAddNewKcals] = useState(null);
  const [addNewProteins, setAddNewProteins] = useState(null);
  const [addNewFats, setAddNewFats] = useState(null);
  const [addNewCarbs, setAddNewCarbs] = useState(null);

  const { mealId } = route.params;
  const { mealName } = route.params;

  const generateRandomId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  };
  const closeInspectModalAndAddMeal = (data) => {
    setInspectModalVisible(false);
    if(data.servings != 0){
      const ingModel = {
        id: generateRandomId(),
        name: data.name,
        prep_For: 0,
        weightValue: 0,
        kcal: data.kcal,
        energyKj: 2,
        proteins: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        servings: true,
      };
      setSelectedItem(ingModel);
      setIngModalVisible(true);
    }else{
      const ingModel = {
        id: generateRandomId(),
        name: data.name,
        prep_For: 100,
        weightValue: 0,
        kcal: data.kcal,
        energyKj: 2,
        proteins: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        servings: false,
      };
      setSelectedItem(ingModel);
      setIngModalVisible(true);
    }
  };

  const setActiveTabFun = async (tab) => {
    setActiveTab(tab);
    switch(tab){
      case "Search":
        break;
      case "Favs":
        await fetchUserLikedAndSavedMeals();
        break;
      case "Own":
        await fetchOwnMeals();
        break;
      case "New":
        break;
    }
  };

  const fetchOwnMeals = async () => {
    setIsOwnLoading(true);
    setOwnError(null);
    try{
      const res = await MealDataService.getOwnRecipes(setIsAuthenticated, navigation);
      if(!res.ok){
        //Error
        setOwnError("Error");
        return;
      }

      const data = await res.json();
      setOwnMealsData(data ?? []);

    }catch(error){
      //error
      setOwnError("Error");
    }finally{
      setIsOwnLoading(false);
    }
  };

  const fetchUserLikedAndSavedMeals = async () => {
    setIsFavLoading(true);
    setFavError(null);

    try{
      const res = await MealDataService.getLikedMeals(setIsAuthenticated, navigation);
      if(!res.ok){
        setFavError("error");
        return;
      }

      const data = await res.json();
      setLikedMealsData(data ?? []);

    }catch(error){
      setFavError("error");
    }finally{
      setIsFavLoading(false);
    }
  };

  const addProductRequest = async () => {
    if (productName == null || brandName  == null || ean  == null || kcal  == null || protein  == null || fat  == null || carbs  == null) {
      setAddProductModalVisible(false);
      return;
    }

    try{

      let requestBody = {
        productName: productName,
        productBrand: brandName,
        productEan13: ean,
        proteins: protein,
        carbs: carbs,
        fats: fat,
        energyKcal: kcal 
      };

      const res = await UserRequestService.addIngredientRequest(setIsAuthenticated, navigation, requestBody);
      if(!res.ok){
        //ERROR
        return;
      }

    }catch(error){
      //error
      //prob do none.
    }

    setProductName(null);
    setEan(null);
    setBrandName(null);
    setKcal(null);
    setProtein(null);
    setFat(null);
    setCarbs(null);

    setAddProductModalVisible(false);
  };

  const addProduct = () => {
    setAddProductModalVisible(true);
  };

  const closeAddProductModal = () => {
    setElGatoCurrentEan(null);
    setAddProductModalVisible(false);
  };

  const elGatoProceedAdding = () => {
    setElGatoAddModalVisible(false);
    setAddProductModalVisible(true);
  };

  const closeElGatoAddModal = () => {
    setElGatoCurrentEan(null);
    setElGatoAddModalVisible(false);
  };

  const inspectModal = (item) => {
    setCurrentlyInspectedItem(item);
    setInspectModalVisible(true);
  }

  const closeInspectModal = () => {
    setInspectModalVisible(false);
  };

  const sendReport = async (sendingCase) => {
    try{

      let requestBody = {
        ingredientId: reportedItem.id,
        ingredientName: reportedItem.name,
        cause: sendingCase
      };

      const res = await UserRequestService.reportIngredientRequest(setIsAuthenticated, navigation, requestBody);
      if(!res.ok){
        //ERROR
        return;
      };

    }catch(error){
      //error handle
    }

    setReportedItem(null);
    setReportModalVisible(false);
  };

  const reportItem = (item) => {
    setReportedItem(item);
    setReportModalVisible(true);
  };

  const closeReportModal = () => { 
    setReportModalVisible(false);
    setReportedItem(null);
  };

  const passSelectedIngredients = () => {  
    if (!selectedItemsData || selectedItemsData.length === 0) {
      navigation.navigate('DietHome');
    } else {
      navigation.navigate('DietHome', {
        mealId,
        selectedItemsData,
      });
    }
  };
  
  const removeScannedItem = (item) => {  
    const scannedItemIndex = scannedData.findIndex(scannedItem => scannedItem.id === item.id);
    if (scannedItemIndex > -1) {
      const updatedScannedData = [...scannedData];
      updatedScannedData.splice(scannedItemIndex, 1);
      setScannedData(updatedScannedData);
    }
  
    const selectedItemIndex = selectedItemsData.findIndex(selectedItem => selectedItem.id === item.id);
    if (selectedItemIndex > -1) {
      const updatedSelectedItemsData = [...selectedItemsData];
      updatedSelectedItemsData.splice(selectedItemIndex, 1);
      setSelectedItemsData(updatedSelectedItemsData);
    }
  };
  

  const handleItemPress = (item) => {
    setSelectedItem(item);
  
    setSelectedItems(prevItems => {
      const itemExists = prevItems.some(selected => selected.id === item.id);
  
      if (itemExists) {
        setIngModalVisible(false);
        setSelectedItemsData(prevData => prevData.filter(selected => selected.id !== item.id));
        return prevItems.filter(selected => selected.id !== item.id);
      } else {
        setIngModalVisible(true);
        return [...prevItems, item];
      }
    });
  
    setGramsCounter(0);
    setInputGrams('');
  };
  

  const handleAddIngredient = (selectedItem) => {
    if(gramsCounter === 0){
      return;
    }

    const newIngredient = {
      name: selectedItem.name,
      weightValue: gramsCounter,
      proteins: selectedItem.proteins,
      energyKcal: selectedItem.kcal,
      fats: selectedItem.fats,
      carbs: selectedItem.carbs,
      id: selectedItem.id,
      prep_for: selectedItem.prep_For,
      servings: selectedItem.servings,
    };

    setSelectedItemsData((prevItems) => [...prevItems, newIngredient]);
    setIngModalVisible(false);
  };

  const addNewIngriedientFromForm = () => {
    setAddNewError(null);

    if(!addNewName) { setAddNewError("I would suggest aasbfasjfaj as a name for that."); return; }
    if(!addNewWeight) { setAddNewError("Leaving weight empty is pointless. I won't bother adding that."); return; }

    if (!/^[1-9]\d*$/.test(addNewWeight)) {
      setAddNewError("WEIGHT AS A WHOLE NUMBER!");
      return;
    }

    const macroFields = [
      { value: addNewProteins,   label: "proteins"   },
      { value: addNewCarbs,      label: "carbs"      },
      { value: addNewFats,       label: "fats"       },
      { value: addNewKcals,      label: "calories"   },
    ];
    for (let {value, label} of macroFields) {
      if (!value.trim()) {
        setAddNewError(`Just fill makro's up. You left ${label} empty for what?`);
        return;
      }
      if (!/^\d+(\.\d+)?$/.test(value)) {
        setAddNewError(`${label.charAt(0).toUpperCase() + label.slice(1)} must be a number (e.g. 21 or 6.9).`);
        return;
      }
    }

    const newIngredient = {
      name: addNewName.trim(),
      weightValue: parseInt(addNewWeight, 10),
      proteins: parseFloat(addNewProteins),
      carbs: parseFloat(addNewCarbs),
      fats: parseFloat(addNewFats),
      energyKcal: parseFloat(addNewKcals),
      id: Math.floor(Math.random() * 1_000_000 + 1).toString(),
      prep_for: 100,
      servings: false,
    };

    setSelectedItemsData((prevItems) => [...prevItems, newIngredient]);
  };

  const closeModalIng = () => {
    if (gramsCounter === 0 && selectedItem) {  
      const selectedItemDataIndex = selectedItemsData.findIndex(item => item.id === selectedItem.id);
      if (selectedItemDataIndex > -1) {
        const updatedSelectedItemsData = [...selectedItemsData];
        updatedSelectedItemsData.splice(selectedItemDataIndex, 1);
        setSelectedItemsData(updatedSelectedItemsData);
      }
  
      const scannedItemIndex = scannedData.findIndex(item => item.id === selectedItem.id);
      if (scannedItemIndex > -1) {
        const updatedScannedData = [...scannedData];
        updatedScannedData.splice(scannedItemIndex, 1);
        setScannedData(updatedScannedData);
      }
  
      const selectedItemIndex = selectedItems.findIndex(item => item.id === selectedItem.id);
      if (selectedItemIndex > -1) {
        const updatedSelectedItems = [...selectedItems];
        updatedSelectedItems.splice(selectedItemIndex, 1);
        setSelectedItems(updatedSelectedItems);
      }
    }
  
    setSelectedItem(null);
    setIngModalVisible(false);
  };
  

  const addGrams = (grams) => {
    setGramsCounter(gramsCounter + grams);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true); 
    try{
      const scannedIngredient = await DietDataService.getIngridientByEan(setIsAuthenticated, navigation, data);

      if(!scannedIngredient.ok){
        setElGatoCurrentEan(data);
        setElGatoAddModalVisible(true);
        //error return info to user that the ean is invalid and perform adding options pr.
      }else{
        const responseBody = await scannedIngredient.json();
        setSelectedItem(responseBody);
        setIngModalVisible(true);
        setScannedData((prevItems) => [...prevItems, responseBody]);
      }
    }catch(error){
      //error getting
      console.log(error);
    }

    setModalVisible(false);
    setGramsCounter(0);
    setInputGrams('');
  };

  const openScanner = async () => {
    if (cameraPermission?.status !== PermissionStatus.GRANTED) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Camera permission is required to use the barcode scanner.');
        return;
      }
    }

    setScanned(false);
    setModalVisible(true);
  };

  const fetchIngredientData = async (ingredient) => {
    setSearchQuery(ingredient);
    setSearchCount(20);
    try{
      setInitialSearchPerformed(true);
      const ingredientListRes = await DietDataService.getListOfCorrelatedItemByName(setIsAuthenticated, navigation, ingredient, searchCount, null);

      if(!ingredientListRes.ok){
        setSearchedData(null);
        return;
      }

      const data = await ingredientListRes.json();    
      setSearchedData(data);

    }catch(error){
      setSearchedData(null);
    }
  };

  const loadMoreSearchItems = async () => {
      if (isSearchingMore) return;
      setIsSearchingMore(true);

      const lastItem = searchedData[ searchedData.length - 1 ];
      try{
        const res = await DietDataService.getListOfCorrelatedItemByName(setIsAuthenticated, navigation, searchQuery, searchCount, lastItem.id);
        if(res.ok){
          const data = await res.json();
          setSearchedData(prev => [...prev, ...data]);
        }
      }catch(error){

      }finally{
        setIsSearchingMore(false);
      }

  };

  useEffect(() => {
    if (ingredientName.trim() === '') return;

    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      fetchIngredientData(ingredientName);
    }, 500);

    setTypingTimeout(newTimeout);

    return () => clearTimeout(newTimeout);
  }, [ingredientName]);

  const formatAmount = (value) => {
    const rounded = parseFloat(value.toFixed(1));
    return Number.isInteger(rounded) ? rounded.toString() : rounded.toString();
  };

  const renderContent = () => {
    switch (activeTab) {
        case 'Search':
          return (
            <View style={AddIngredientStyles.RestCont}>
            <View style={AddIngredientStyles.searchContainer}>
              <View style={AddIngredientStyles.barContainer}>
                <TextInput
                  style={AddIngredientStyles.searchInput}
                  selectionColor="#FF8303"
                  placeholder="Enter ingredient name"
                  placeholderTextColor="#999"
                  value={ingredientName}
                  onChangeText={setIngredientName}
                />
              </View>
              <View style={AddIngredientStyles.codeContainer}>
                <TouchableOpacity onPress={openScanner}>
                  <BarCodeIcon width={34} height={48} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={AddIngredientStyles.contentContainer}>
              {scannedData == null || scannedData.length === 0 ? (
                <Text></Text>
              ) : (
                scannedData.map((item, index) => (
                  <View key={`${item.id}-${index}`} style={AddIngredientStyles.scannedContentRow}>
                    <TouchableOpacity onPress={() => removeScannedItem(item)}>
                      <View style = {AddIngredientStyles.scannedRowLeft}>
                          <Text style={AddIngredientStyles.itemName}>{item.name}</Text>
                      </View>
                      <View style = {AddIngredientStyles.scannedRowRight}>
                        <CloseIcon width={20} height={20} fill={"#000"} />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {searchedData == null && initialSearchPerformed ? (
                <View style={AddIngredientStyles.contentError}>
                  <View style = {[AddIngredientStyles.errorLottieContainer, GlobalStyles.center]}>
                    <Text>EL GATO LOTTIE HERE</Text>
                  </View>
                  <View style = {AddIngredientStyles.errorAddingContainer}>
                    <Text style = {AddIngredientStyles.errorAddNormal}>Couldn't find what you are looking for?</Text>
                    <TouchableOpacity onPress={() => addProduct()}>
                      <Text style={AddIngredientStyles.errorAddOrange}>Add product<Text style = {AddIngredientStyles.errorAddNormal}>.</Text></Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (searchedData == null && !initialSearchPerformed) ? (
                <>

                </>
              ) : (
                <FlatList
                  data={searchedData}
                  keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString() }
                  renderItem={({ item }) => ( 
                  <>
                    <View key={item.id || index} style={AddIngredientStyles.contentRow}>
                      <TouchableOpacity
                        key={item.id || index}
                        onPress={() => handleItemPress(item)}
                      >
                      <View style = {AddIngredientStyles.contentRowListTop}>
                        <View style = {AddIngredientStyles.ListContentRowLeft}>
                          <View style = {AddIngredientStyles.ListLeftNameRow}>
                            <Text
                                style={[
                                  AddIngredientStyles.itemName,
                                  selectedItems.some(selected => selected.id === item.id) ? { color: '#FF8303' } : null,
                                ]}
                                >
                              {item.name}
                            </Text>
                          </View>
                          <View style = {AddIngredientStyles.ListLeftBrandRow}>
                            <Text style = {AddIngredientStyles.brandName}>{item.brand}</Text>
                          </View>
                        </View>
                        <View style = {AddIngredientStyles.ListContentRowRight}>
                          <View style = {AddIngredientStyles.ListCheckContainer}>
                            {selectedItems.some(selected => selected.id === item.id) && (
                              <CheckIcon style={AddIngredientStyles.check} width={46} height={46} fill={'#FF8303'} />
                            )}    
                            <View style = {AddIngredientStyles.checkBox}></View>
                          </View>
                        </View>
                      </View>
                      <View style = {AddIngredientStyles.contentRowListBottom}>
                          <Text style={AddIngredientStyles.nutrientText}>P: {item.proteins.toFixed(2)}g</Text>
                          <Text style={AddIngredientStyles.nutrientText}>C: {item.carbs.toFixed(2)}g</Text>
                          <Text style={AddIngredientStyles.nutrientText}>F: {item.fats.toFixed(2)}g</Text>
                          <View style={AddIngredientStyles.kcalContainer}>
                            <Text style={AddIngredientStyles.kcalText}>Kcal: {item.kcal.toFixed(2)}</Text>
                          </View>
                      </View>                  
                      </TouchableOpacity>
                      <View style={AddIngredientStyles.hr}></View>
                    </View>
                  </> 
                )}
                  showsVerticalScrollIndicator={false}
                  onEndReached={loadMoreSearchItems}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={isSearchingMore ? <View style={[GlobalStyles.center, {height: 50}]}><ActivityIndicator size="small" color="#FF8303"/></View> : null}
                />
              )}
              </View>
            </View>

          );
        case 'Favs':
          return (
            <View style={AddIngredientStyles.RestCont}>
              {isFavLoading ? (
                <View style={[AddIngredientStyles.RestCont, GlobalStyles.center]}>
                  <ActivityIndicator size="large" color="#FF8303" />
                </View> 
              ): !isFavLoading && favError == null && (likedMealsData.length != 0) ? (
                <ScrollView
                    style={AddIngredientStyles.favContentContainer}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                  >
                  {likedMealsData?.map((item, index) => (
                      <TouchableOpacity 
                        style={AddIngredientStyles.searchedRow}
                        key={`${item.stringId || 'item'}-${index}`}
                        onPress={() => inspectModal(item)}
                      >
                      <MealDisplayBig meal={item} navigation={navigation} />
                      </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (!likedMealsData || likedMealsData.length === 0) && !isFavLoading && favError == null ? (
                <View style={[AddIngredientStyles.RestCont]}>
                  <View style={[AddIngredientStyles.underGatoEmptyContainer]}>
                    {/*ELGATO*/}
                  </View>
                  <View style={[AddIngredientStyles.underGatoEmptyContainerText, GlobalStyles.center]}>
                    <Text style={[GlobalStyles.text18]}><Text style={GlobalStyles.orange}>Oh no!</Text> Looks like there is nothing here!</Text>
                    <Text style={[GlobalStyles.text16]}>You should appreciate some more!</Text>
                  </View>
                </View>
              ):(
                <View style={[AddIngredientStyles.RestCont]}>
                  <View style={[AddIngredientStyles.underGatoEmptyContainer]}>
                    {/*ELGATO*/}
                  </View>
                  <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                    <Text style={[GlobalStyles.text18, {textAlign: 'center', paddingHorizontal: 20}]}>Upsss... Something went <Text style={[GlobalStyles.orange]}>horribly</Text> wrong. Try to restart the application.</Text>
                  </View>
                </View>
              )}
            </View>
          );
        case 'Own':
          return (
            <View style={AddIngredientStyles.RestCont}>
            {isOwnLoading ? (
              <View style={[AddIngredientStyles.RestCont, GlobalStyles.center]}>
                <ActivityIndicator size="large" color="#FF8303" />
              </View> 
            ): !isOwnLoading && ownError == null && (ownMealsData.length != 0) ? (
              <ScrollView
                  style={AddIngredientStyles.favContentContainer}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                {ownMealsData?.map((item, index) => (
                    <TouchableOpacity 
                      style={AddIngredientStyles.searchedRow}
                      key={`${item.stringId || 'item'}-${index}`}
                      onPress={() => inspectModal(item)}
                    >
                    <MealDisplayBig meal={item} navigation={navigation} />
                    </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (!ownMealsData || ownMealsData.length === 0) && !isOwnLoading && ownError == null ? (
              <View style={[AddIngredientStyles.RestCont]}>
                <View style={[AddIngredientStyles.underGatoEmptyContainer]}>
                  {/*ELGATO*/}
                </View>
                <View style={[AddIngredientStyles.underGatoEmptyContainerText, GlobalStyles.center]}>
                  <Text style={[GlobalStyles.text18]}><Text style={GlobalStyles.orange}>Oh no!</Text> Looks like there is nothing here!</Text>
                  <Text style={[GlobalStyles.text16]}>Show off those recipes ❤️</Text>
                </View>
              </View>
            ): (
              <View style={[AddIngredientStyles.RestCont]}>
                <View style={[AddIngredientStyles.underGatoEmptyContainer]}>
                  {/*ELGATO*/}
                </View>
                <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                  <Text style={[GlobalStyles.text18, {textAlign: 'center', paddingHorizontal: 20}]}>Upsss... Something went <Text style={[GlobalStyles.orange]}>horribly</Text> wrong. Try to restart the application.</Text>
                </View>
              </View>
            )}
          </View>
          );
          case "New":
            return(
              <View style={AddIngredientStyles.RestCont}>
                <View style={[AddIngredientStyles.fieldWrapper, {marginTop: 20}]}>
                  <View style={AddIngredientStyles.ownLabelWrapper}>
                    <Text style={AddIngredientStyles.ownLabel}>Name</Text>
                  </View>
                  <TextInput
                    style={AddIngredientStyles.ownInput}
                    selectionColor="#FF8303"
                    value={addNewName}
                    onChangeText={(text) => setAddNewName(text)}
                  />
                </View>
                <View style={AddIngredientStyles.fieldWrapper}>
                  <View style={AddIngredientStyles.ownLabelWrapper}>
                    <Text style={AddIngredientStyles.ownLabel}>Weight</Text>
                  </View>
                  <TextInput
                    style={AddIngredientStyles.ownInput}
                    selectionColor="#FF8303"
                    keyboardType="numeric"
                    value={addNewWeight}
                    onChangeText={(text) => setAddNewWeight(text)}
                  />
                </View>

                <View style={[{paddingHorizontal: 20, marginTop: 10}]}>
                  <Text style={[GlobalStyles.text16, GlobalStyles.textShadow]}>Per 100g:</Text>
                </View>

                <View style={[AddIngredientStyles.fieldWrapper, { flexDirection: 'row' }]}>
                  <View style={[AddIngredientStyles.pair, { marginRight: 8 }]}>
                    <Text style={[AddIngredientStyles.ownLabel, {marginLeft: 10}]}>Protein</Text>
                    <TextInput
                      style={AddIngredientStyles.ownInput}
                      selectionColor="#FF8303"
                      keyboardType="numeric"
                      value={addNewProteins}
                      onChangeText={(text) => setAddNewProteins(text)}
                    />
                  </View>

                  <View style={AddIngredientStyles.pair}>
                    <Text style={[AddIngredientStyles.ownLabel, {marginLeft: 10}]}>Carbs</Text>
                    <TextInput
                      style={AddIngredientStyles.ownInput}
                      selectionColor="#FF8303"
                      keyboardType="numeric"
                      value={addNewCarbs}
                      onChangeText={(text) => setAddNewCarbs(text)}
                    />
                  </View>
                </View>

                <View style={[AddIngredientStyles.fieldWrapper, { flexDirection: 'row' }]}>
                  <View style={[AddIngredientStyles.pair, { marginRight: 8 }]}>
                    <Text style={[AddIngredientStyles.ownLabel, {marginLeft: 10}]}>Fats</Text>
                    <TextInput
                      style={AddIngredientStyles.ownInput}
                      selectionColor="#FF8303"
                      keyboardType="numeric"
                      value={addNewFats}
                      onChangeText={(text) => setAddNewFats(text)}
                    />
                  </View>

                  <View style={AddIngredientStyles.pair}>
                    <Text style={[AddIngredientStyles.ownLabel, {marginLeft: 10}]}>Kcal</Text>
                    <TextInput
                      style={AddIngredientStyles.ownInput}
                      selectionColor="#FF8303"
                      keyboardType="numeric"
                      value={addNewKcals}
                      onChangeText={(text) => setAddNewKcals(text)}
                    />
                  </View>
                </View>

                {addNewError && (
                  <View style={[{paddingHorizontal: 20, marginTop: 10}]}>
                    <Text style={[GlobalStyles.text16, GlobalStyles.red, {textAlign: 'center'}]}>{addNewError}</Text>
                  </View>
                )}

                <View style={[GlobalStyles.center, GlobalStyles.bottomAbs]}>
                  <TouchableOpacity style={[GlobalStyles.elevatedButtonOrange, GlobalStyles.rounded]} onPress={() => addNewIngriedientFromForm()}>
                    <Text style={[GlobalStyles.text16, GlobalStyles.white]}>Add new</Text>
                  </TouchableOpacity>
                </View>

              </View>
            );
        
          default:
            return null;
        }
    };


  return (
    <SafeAreaView style={AddIngredientStyles.container} edges={['left', 'right', 'bottom']}>
      <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
      <StatusBar style="light"  backgroundColor="#fff" translucent={false} hidden={false} />

      <View style={AddIngredientStyles.topContainer}>
        <View style = {AddIngredientStyles.topContIngBack}>
          <TouchableOpacity style={AddIngredientStyles.topBack} onPress={() => passSelectedIngredients()}>
              <ChevronLeft width={28} height={28} />
          </TouchableOpacity>
        </View>
        <View style = {AddIngredientStyles.topContIngTitle}>
          <Text numberOfLines={2} ellipsizeMode="tail" style={AddIngredientStyles.topNameText}>{mealName}</Text>
        </View>
        <View style = {AddIngredientStyles.topContIngReport}>
          <TouchableOpacity onPress={() => passSelectedIngredients()}>
            <CheckIcon width={37} height={37} fill={'#fff'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={AddIngredientStyles.categoryContainer}>
        <TouchableOpacity style={AddIngredientStyles.option} onPress={() => setActiveTabFun("Search")} ><Text style={[AddIngredientStyles.optionText, activeTab === "Search" && AddIngredientStyles.activeTab]}>Search</Text></TouchableOpacity>
        <TouchableOpacity style={AddIngredientStyles.option} onPress={() => setActiveTabFun("Favs")} ><Text style={[AddIngredientStyles.optionText, activeTab === "Favs" && AddIngredientStyles.activeTab]}>Favs</Text></TouchableOpacity>
        <TouchableOpacity style={AddIngredientStyles.option} onPress={() => setActiveTabFun("Own")} ><Text style={[AddIngredientStyles.optionText, activeTab === "Own" && AddIngredientStyles.activeTab]}>Own</Text></TouchableOpacity>
        <TouchableOpacity style={AddIngredientStyles.option} onPress={() => setActiveTabFun("New")} ><Text style={[AddIngredientStyles.optionText, activeTab === "New" && AddIngredientStyles.activeTab]}>New</Text></TouchableOpacity>
      </View>

      {renderContent()}

      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="slide"
      >
        <View style={AddIngredientStyles.modalContainer}>
          <CameraView
            style={{ width:'100%', height:'100%' }}
            barcodeScannerEnabled
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13"],
            }}
          />
          <View style={AddIngredientStyles.grayCodeBorderContainer}>
            <View style={AddIngredientStyles.croshair}>
              <View style={AddIngredientStyles.cornerTopLeft}></View>
              <View style={AddIngredientStyles.cornerTopRight}></View>
              <View style={AddIngredientStyles.cornerBottomLeft}></View>
              <View style={AddIngredientStyles.cornerBottomRight}></View>
            </View>
          </View>

          <TouchableOpacity style={AddIngredientStyles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={AddIngredientStyles.closeButtonText}>Close Scanner</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        visible={addProductModalVisible}
        onRequestClose={closeAddProductModal}
        transparent={true}
      >
        <View style={AddIngredientStyles.addProductModal}>

          <TouchableWithoutFeedback onPress={closeAddProductModal}>
            <View style={AddIngredientStyles.reportModalClosingTransparent}></View>
          </TouchableWithoutFeedback>

          <View style={AddIngredientStyles.reportModalContainer}>
            <View style={AddIngredientStyles.reportTitleCont}>
              <Text style={AddIngredientStyles.reportTitleText}>Add a product</Text>
            </View>
            <View style={AddIngredientStyles.reportHr}></View>
            <View style={AddIngredientStyles.reportDescCont}>
              <Text style={AddIngredientStyles.reportDescTextBold}>Please fill in the form below</Text>
              <Text style={AddIngredientStyles.reportDescText}>After adding the product our team will review the given information, then product will appear in the database.</Text>
            </View>
            <View style={[AddIngredientStyles.reportDescCont, { marginTop: 10 }]}>
              <View style={AddIngredientStyles.addProductRow}>
                <View style={AddIngredientStyles.inputWrapper}>
                  <Text style={AddIngredientStyles.label}>Product name</Text>
                  <TextInput
                    style={AddIngredientStyles.input}
                    placeholder="Enter product name"
                    placeholderTextColor="#888"
                    selectionColor="#FF8303"
                    value={productName}
                    onChangeText={(text) => setProductName(text)}
                  />
                </View>
              </View>

              <View style={AddIngredientStyles.addProductRow}>
                <View style={AddIngredientStyles.inputWrapper}>
                  <Text style={AddIngredientStyles.label}>Ean</Text>
                  <TextInput
                    style={AddIngredientStyles.input}
                    placeholder="Enter ean-13 code"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    selectionColor="#FF8303"
                    value={ean}
                    onChangeText={(text) => setEan(text)}
                  />
                </View>
              </View>

              <View style={AddIngredientStyles.addProductRow}>
                <View style={AddIngredientStyles.inputWrapper}>
                  <Text style={AddIngredientStyles.label}>Brand name</Text>
                  <TextInput
                    style={AddIngredientStyles.input}
                    placeholder="Enter brand name"
                    placeholderTextColor="#888"
                    selectionColor="#FF8303"
                    value={brandName}
                    onChangeText={(text) => setBrandName(text)}
                  />
                </View>
              </View>

              <View style={AddIngredientStyles.addProductRowShort}>
                <View style={AddIngredientStyles.addProductRowShortLeft}>
                  <View style={AddIngredientStyles.inputWrapper}>
                    <Text style={AddIngredientStyles.label}>Kcal</Text>
                    <TextInput
                      style={AddIngredientStyles.input}
                      placeholder="Enter kcal"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      selectionColor="#FF8303"
                      value={kcal}
                      onChangeText={(text) => setKcal(text)}
                    />
                  </View>
                </View>
                <View style={AddIngredientStyles.addProductRowShortRight}>
                  <View style={AddIngredientStyles.inputWrapper}>
                    <Text style={AddIngredientStyles.label}>Protein</Text>
                    <TextInput
                      style={AddIngredientStyles.input}
                      placeholder="Enter protein"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      selectionColor="#FF8303"
                      value={protein}
                      onChangeText={(text) => setProtein(text)}
                    />
                  </View>
                </View>
              </View>

              <View style={AddIngredientStyles.addProductRowShort}>
                <View style={AddIngredientStyles.addProductRowShortLeft}>
                  <View style={AddIngredientStyles.inputWrapper}>
                    <Text style={AddIngredientStyles.label}>Fat</Text>
                    <TextInput
                      style={AddIngredientStyles.input}
                      placeholder="Enter fat"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      selectionColor="#FF8303"
                      value={fat}
                      onChangeText={(text) => setFat(text)}
                    />
                  </View>
                </View>
                <View style={AddIngredientStyles.addProductRowShortRight}>
                  <View style={AddIngredientStyles.inputWrapper}>
                    <Text style={AddIngredientStyles.label}>Carbs</Text>
                    <TextInput
                      style={AddIngredientStyles.input}
                      placeholder="Enter carbs"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      selectionColor="#FF8303"
                      value={carbs}
                      onChangeText={(text) => setCarbs(text)}
                    />
                  </View>
                </View>
              </View>

              <View style={AddIngredientStyles.addProductRow}>
                <Text style={AddIngredientStyles.productRowNotify}>Please enter the given macro components per 100g.</Text>
              </View>
              <View style={AddIngredientStyles.addProductRow}>
                <TouchableOpacity onPress={addProductRequest}>
                  <View style={[AddIngredientStyles.addProductConfirmButton, GlobalStyles.elevated]}>
                    <Text style={AddIngredientStyles.addProductBtnText}>Add</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>


      <GatoRightModal
        visible={elGatoAddModalVisible}
        onRequestClose={closeElGatoAddModal}
        elGatoProceedAdding={elGatoProceedAdding}>
      </GatoRightModal>

      <Modal
        animationType="slide"
        visible={reportModalVisible}
        onRequestClose={closeReportModal}
        statusBarTranslucent
        transparent={true}
      >
        <View style={AddIngredientStyles.reportModalOverlay}>
          <TouchableWithoutFeedback onPress={closeReportModal}>
            <View style={AddIngredientStyles.reportModalClosingTransparent}></View>
          </TouchableWithoutFeedback>

          <View style={AddIngredientStyles.reportModalContainer}>
            <View style={AddIngredientStyles.reportTitleCont}>
              <Text style={AddIngredientStyles.reportTitleText}>Report</Text>
            </View>
            <View style = {AddIngredientStyles.reportHr}></View>
            <View style={AddIngredientStyles.reportDescCont}>
              <Text style={AddIngredientStyles.reportDescTextBold}>Why are you reporting this?</Text>
              <Text style={AddIngredientStyles.reportDescText}>Reporting offensive language will always be anonymus. blablabla.</Text>
            </View>

            <View style={AddIngredientStyles.reportOptionsCont}>
              <TouchableOpacity onPress={() => sendReport(1)}>
                <Text style={AddIngredientStyles.reportOptionText}>Incorrect product name</Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={() => sendReport(2)}>
                <Text style={AddIngredientStyles.reportOptionText}>Incorrect/old calorie information</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(3)}>
                <Text style={AddIngredientStyles.reportOptionText}>Offensive product name</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(4)}>
                <Text style={AddIngredientStyles.reportOptionText}>Misleading information</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(5)}>
                <Text style={AddIngredientStyles.reportOptionText}>Spam</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(6)}>
                <Text style={AddIngredientStyles.reportOptionText}>Something else</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>




      {selectedItem && (
        <Modal
          animationType="slide"
          visible={ingModalVisible}
          statusBarTranslucent
          onRequestClose={closeModalIng}
        >
        <SafeAreaView edges={['left', 'right', 'bottom', 'top']} style={{ backgroundColor: '#FF8303', flex: 1 }}>
        <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
          <View style={AddIngredientStyles.ingModalContainer}>
            <View style = {AddIngredientStyles.topContainer}>
              <View style = {AddIngredientStyles.topContIngBack}>
                <TouchableOpacity style={AddIngredientStyles.topBack} onPress={closeModalIng}>
                  <ChevronLeft width={28} height={28} />
                </TouchableOpacity>
              </View>
              <View style = {AddIngredientStyles.topContIngTitle}>
                <Text numberOfLines={2} ellipsizeMode="tail" style={AddIngredientStyles.topNameText}>{selectedItem.name}</Text>
              </View>
              <View style = {AddIngredientStyles.topContIngReport}>
                <TouchableOpacity onPress={() => reportItem(selectedItem)}>
                  <ReportIcon width={26} height={26} fill={'#fff'} />
                </TouchableOpacity>
              </View>
            </View>           

            <View style={AddIngredientStyles.ingModalContentContainer}>
              <View style = {AddIngredientStyles.ingModalContentRow}>
                <View style = {AddIngredientStyles.ingContentRowContent}>
                <View style = {AddIngredientStyles.ingContentRowGrams}>
                  {selectedItem.servings ? (
                    <Text style={AddIngredientStyles.gramsTextModal}>0.1 s</Text>
                  ): (
                    <Text style={AddIngredientStyles.gramsTextModal}>10 g</Text>
                  )}
                </View>
                <View style = {AddIngredientStyles.ingContentRowMakro}>
                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 0.1) 
                    ? (selectedItem.proteins * 0.1).toFixed(0) 
                    : (selectedItem.proteins * 0.1).toFixed(1)}
                  </Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 0.1) 
                    ? (selectedItem.carbs * 0.1).toFixed(0) 
                    : (selectedItem.carbs * 0.1).toFixed(1)}
                  </Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 0.1) 
                    ? (selectedItem.fats * 0.1).toFixed(0) 
                    : (selectedItem.fats * 0.1).toFixed(1)}
                  </Text>
                </View>
                <View style = {AddIngredientStyles.ingContentRowKcal}>
                  <Text style={AddIngredientStyles.bold}>Kcal: </Text><Text>{(selectedItem.kcal * 0.1).toFixed(0)}</Text>
                </View>
                </View>
                <View style={AddIngredientStyles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(10)}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={AddIngredientStyles.hr}></View>
              <View style = {AddIngredientStyles.ingModalContentRow}>
                <View style = {AddIngredientStyles.ingContentRowContent}>
                <View style = {AddIngredientStyles.ingContentRowGrams}>
                {selectedItem.servings ? (
                    <Text style={AddIngredientStyles.gramsTextModal}>0.5 s</Text>
                  ): (
                    <Text style={AddIngredientStyles.gramsTextModal}>50 g</Text>
                  )}
                </View>
                <View style = {AddIngredientStyles.ingContentRowMakro}>
                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 0.5) 
                    ? (selectedItem.proteins * 0.5).toFixed(0) 
                    : (selectedItem.proteins * 0.5).toFixed(1)}
                  </Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 0.5) 
                    ? (selectedItem.carbs * 0.5).toFixed(0) 
                    : (selectedItem.carbs * 0.5).toFixed(1)}
                  </Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 0.5) 
                    ? (selectedItem.fats * 0.5).toFixed(0) 
                    : (selectedItem.fats * 0.5).toFixed(1)}
                  </Text>
                </View>
                <View style = {AddIngredientStyles.ingContentRowKcal}>
                  <Text style={AddIngredientStyles.bold}>Kcal: </Text><Text>{(selectedItem.kcal * 0.5).toFixed(0)}</Text>
                </View>
                </View>
                <View style={AddIngredientStyles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(50)} >
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={AddIngredientStyles.hr}></View>
              <View style = {AddIngredientStyles.ingModalContentRow}>
                <View style = {AddIngredientStyles.ingContentRowContent}>
                <View style = {AddIngredientStyles.ingContentRowGrams}>
                {selectedItem.servings ? (
                    <Text style={AddIngredientStyles.gramsTextModal}>1 s</Text>
                  ): (
                    <Text style={AddIngredientStyles.gramsTextModal}>100 g</Text>
                  )}
                </View>
                <View style = {AddIngredientStyles.ingContentRowMakro}>
                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 1) 
                    ? (selectedItem.proteins * 1).toFixed(0) 
                    : (selectedItem.proteins * 1).toFixed(1)}
                  </Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 1) 
                    ? (selectedItem.carbs * 1).toFixed(0) 
                    : (selectedItem.carbs * 1).toFixed(1)}
                  </Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 1) 
                    ? (selectedItem.fats * 1).toFixed(0) 
                    : (selectedItem.fats * 1).toFixed(1)}
                  </Text>
                </View>
                <View style = {AddIngredientStyles.ingContentRowKcal}>
                  <Text style={AddIngredientStyles.bold}>Kcal: </Text><Text>{(selectedItem.kcal ).toFixed(0)}</Text>
                </View>
                </View>
                <View style={AddIngredientStyles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(100)}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={AddIngredientStyles.hr}></View>
              <View style = {AddIngredientStyles.ingModalContentRow}>
                <View style = {AddIngredientStyles.ingContentRowContent}>
                <View style = {AddIngredientStyles.ingContentRowGrams}>
                  {selectedItem.servings ? (
                    <Text style={AddIngredientStyles.gramsTextModal}>1.5 s</Text>
                  ): (
                    <Text style={AddIngredientStyles.gramsTextModal}>150 g</Text>
                  )}
                </View>
                <View style = {AddIngredientStyles.ingContentRowMakro}>
                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 1.5) 
                    ? (selectedItem.proteins * 1.5).toFixed(0) 
                    : (selectedItem.proteins * 1.5).toFixed(1)}
                  </Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 1.5) 
                    ? (selectedItem.carbs * 1.5).toFixed(0) 
                    : (selectedItem.carbs * 1.5).toFixed(1)}
                  </Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 1.5) 
                    ? (selectedItem.fats * 1.5).toFixed(0) 
                    : (selectedItem.fats * 1.5).toFixed(1)}
                  </Text>
                </View>
                <View style = {AddIngredientStyles.ingContentRowKcal}>
                  <Text style={AddIngredientStyles.bold}>Kcal: </Text><Text>{(selectedItem.kcal * 1.5).toFixed(0)}</Text>
                </View>
                </View>
                <View style={AddIngredientStyles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(150)}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={AddIngredientStyles.hr}></View>
              <View style = {AddIngredientStyles.ingModalContentRow}>
                <View style = {AddIngredientStyles.ingContentRowContent}>
                <View style = {AddIngredientStyles.ingContentRowGrams}>
                  {selectedItem.servings ? (
                    <Text style={AddIngredientStyles.gramsTextModal}>2 s</Text>
                  ): (
                    <Text style={AddIngredientStyles.gramsTextModal}>200 g</Text>
                  )}
                </View>
                <View style = {AddIngredientStyles.ingContentRowMakro}>
                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 2) 
                    ? (selectedItem.proteins * 2).toFixed(0) 
                    : (selectedItem.proteins * 2).toFixed(1)}
                  </Text>
                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 2) 
                    ? (selectedItem.carbs * 2).toFixed(0) 
                    : (selectedItem.carbs * 2).toFixed(1)}
                  </Text>
                  <Text style={[AddIngredientStyles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 2) 
                    ? (selectedItem.fats * 2).toFixed(0) 
                    : (selectedItem.fats * 2).toFixed(1)}
                  </Text>
                </View>
                <View style = {AddIngredientStyles.ingContentRowKcal}>
                  <Text style={AddIngredientStyles.bold}>Kcal: </Text><Text>{(selectedItem.kcal * 2).toFixed(0)}</Text>
                </View>
                </View>
                <View style={AddIngredientStyles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(200)}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={AddIngredientStyles.hr}></View>
              {selectedItem.servings ? (
                    <View></View>
              ): (
                <View style = {AddIngredientStyles.ingModalContentRow}>
                <View style = {AddIngredientStyles.ingContentRowContent}>

                <View style = {AddIngredientStyles.ingContentRowGrams}>
                  <TextInput
                    style={AddIngredientStyles.inputBorder}
                    placeholder="0 g"
                    keyboardType="numeric"
                    value={inputGrams}
                    onChangeText={(value) => {
                      const validInput = value.replace(/[^0-9]/g, '');
                      setInputGrams(validInput);

                      const grams = parseFloat(validInput);
                      if (grams > 0) {
                        setMacros({
                          proteins: (selectedItem.proteins * (grams / 100)).toFixed(1),
                          carbs: (selectedItem.carbs * (grams / 100)).toFixed(1),
                          fats: (selectedItem.fats * (grams / 100)).toFixed(1),
                          kcal: (selectedItem.kcal * (grams / 100)).toFixed(0)
                        });
                      } else {
                        setMacros({ proteins: 0, carbs: 0, fats: 0, kcal: 0 });
                      }
                    }}
                  />
                </View>
                <View style={AddIngredientStyles.ingContentRowMakro}>
                  <Text style={[AddIngredientStyles.nutrientTextModal, { fontWeight: 'bold' }]}>P:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}>{macros.proteins}</Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, { fontWeight: 'bold' }]}>C:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}>{macros.carbs}</Text>

                  <Text style={[AddIngredientStyles.nutrientTextModal, { fontWeight: 'bold' }]}>F:</Text>
                  <Text style={AddIngredientStyles.nutrientTextModalValue}>{macros.fats}</Text>
                </View>
                <View style={AddIngredientStyles.ingContentRowKcal}>
                  <Text style={AddIngredientStyles.bold}>Kcal: </Text>
                  <Text>{macros.kcal}</Text>
                </View>
                </View>
                <View style={AddIngredientStyles.ingContentRowButton}>
                  <TouchableOpacity
                    onPress={() => {
                      const grams = parseFloat(inputGrams);
                      if (!isNaN(grams)) {
                        addGrams(grams);
                      }
                    }}
                  >
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              )}
              {selectedItem.servings ? (
                  <View></View>
              ): (
                <View style={AddIngredientStyles.hr}></View>
              )}              
              <View style={AddIngredientStyles.ingModalContentSummaryRow}>
                  <View style = {AddIngredientStyles.summaryTopRow}>
                  {selectedItem.servings ? (
                      <Text style = {AddIngredientStyles.summaryText}> {gramsCounter/100} servings</Text>
                    ): (
                      <Text style = {AddIngredientStyles.summaryText}> {gramsCounter} g</Text>
                    )}                   
                  </View>
                  <View style={AddIngredientStyles.summaryBottomRow}>
                    <Text style={{ textAlign: 'center' }}>
                      P: {formatAmount(selectedItem.proteins * (gramsCounter / 100))} {' '}
                      C: {formatAmount(selectedItem.carbs    * (gramsCounter / 100))} {' '}
                      F: {formatAmount(selectedItem.fats     * (gramsCounter / 100))} {' '}
                      KCAL: {formatAmount(selectedItem.kcal  * (gramsCounter / 100))}
                    </Text>
                  </View>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleAddIngredient(selectedItem)} style={[AddIngredientStyles.confirmButtonContainer, GlobalStyles.elevated]}>
              <View style={AddIngredientStyles.confirmButton}>
                <Text style = {{color: 'whitesmoke', fontSize: 26, fontWeight: '700', fontFamily: 'Helvetica'}}>+</Text>
              </View>
            </TouchableOpacity>

          </View>
          </SafeAreaView>
        </Modal>
      )}
      <InspectMealModal
        visible={inspectModalVisible}
        closeInspectModal={closeInspectModal}
        item={currentlyInspectedItem}
        specialClose={closeInspectModalAndAddMeal}
        navigation={navigation}
      >
      </InspectMealModal>
    </SafeAreaView>
  );
};


export default AddIngredient;