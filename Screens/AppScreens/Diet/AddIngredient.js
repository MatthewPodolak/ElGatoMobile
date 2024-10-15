import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Modal, Alert, TouchableWithoutFeedback, Image  } from 'react-native';
import { ScrollView,View, Text, TextInput, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, PermissionStatus } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';

import BarCodeIcon from '../../../assets/main/Diet/upc-scan.svg';
import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import AddIcon from '../../../assets/main/Diet/plus-circle-fill.svg';
import CloseIcon from '../../../assets/main/Diet/x-lg.svg';
import CheckIcon from '../../../assets/main/Diet/check2.svg';
import ReportIcon from '../../../assets/main/Diet/flag-fill.svg';

import GatoRightModal from '../../../Components/ElGato/GatoRightModal';
import { AddIngredientStyles } from '../../../Styles/Diet/AddIngredientStyles.js';


const AddIngredient = ({ route, navigation }) => {
  const [ingredientName, setIngredientName] = useState('');
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportedItem, setReportedItem] = useState(null);

  const [addProductModalVisible, setAddProductModalVisible] = useState(false);

  const [elGatoAddModalVisible, setElGatoAddModalVisible] = useState(false);
  const [elGatoCurrentEan, setElGatoCurrentEan] = useState(null);

  const [ingModalVisible, setIngModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsData, setSelectedItemsData] = useState([]);
  const [searchedData, setSearchedData] = useState(null);
  
  const [scannedData, setScannedData] = useState([]);

  const [typingTimeout, setTypingTimeout] = useState(null);

  const [inputGrams, setInputGrams] = useState('');
  const [macros, setMacros] = useState({ proteins: 0, carbs: 0, fats: 0, kcal: 0 });
  const [gramsCounter, setGramsCounter] = useState(0);

  //adding params
  const [productName, setProductName] = useState('');
  const [ean, setEan] = useState('');
  const [brandName, setBrandName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  const { mealId } = route.params;
  const { mealName } = route.params;

  const addProductRequest = async () => {
    if (productName == null || brandName  == null || ean  == null || kcal  == null || protein  == null || fat  == null || carbs  == null) {
      setAddProductModalVisible(false);
      return;
    }

    try{
      const token = await AsyncStorage.getItem('jwtToken');
      const requestAddProduct = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/UserRequest/AddIngredientRequest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              productName: productName,
              productBrand: brandName,
              productEan13: ean,
              proteins: protein,
              carbs: carbs,
              fats: fat,
              energyKcal: kcal 
          }),
        },
        5000
      );

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

  const sendReport = async (sendingCase) => {
    try{
      const token = await AsyncStorage.getItem('jwtToken');
      const requestReport = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/UserRequest/ReportIngredientRequest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
                ingredientId: reportedItem.id,
                ingredientName: reportedItem.name,
                cause: sendingCase
          }),
        },
        5000
      );

    }catch(error){
      //error handle
      console.log(error);
    }

    setReportedItem(null);
    setReportModalVisible(false);
  };

  const reportItem = (item) => {
    console.log('reported +++', item.name);
    setReportedItem(item);
    setReportModalVisible(true);
  };

  const closeReportModal = () => { 
    setReportModalVisible(false);
    setReportedItem(null);
  };

  const passSelectedIngredients = () => {
    console.log('backed');
  
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
    console.log('SELECTED:', item);
  
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
    console.log(selectedItem);
    if(gramsCounter === 0){
      console.log('zero');
      //error
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
      prep_for: selectedItem.prep_For
    };

    setSelectedItemsData((prevItems) => [...prevItems, newIngredient]);
    setIngModalVisible(false);
    console.log(selectedItemsData);
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
    //api call 
    try{
      const token = await AsyncStorage.getItem('jwtToken');

      const scannedIngredient = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Diet/GetIngridientByEan?ean=${data}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        5000
      );

      if(!scannedIngredient.ok){
        console.log('not ok');
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
    try{
      const token = await AsyncStorage.getItem('jwtToken');

      const ingredientListRes = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Diet/GetListOfCorrelatedItemByName?name=${ingredient}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        5000
      );

      if(!ingredientListRes.ok){
        //show none
        console.log('hitted error');
        setSearchedData(null);
        return;
      }

      const data = await ingredientListRes.json();    
      setSearchedData(data);

    }catch(error){
      //error internet prob.
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

  return (
    <SafeAreaView style={AddIngredientStyles.container}>
      <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
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
        <TouchableOpacity style={AddIngredientStyles.option}><Text style={AddIngredientStyles.optionText}>Search</Text></TouchableOpacity>
        <TouchableOpacity style={AddIngredientStyles.option}><Text style={AddIngredientStyles.optionText}>Favs</Text></TouchableOpacity>
        <TouchableOpacity style={AddIngredientStyles.option}><Text style={AddIngredientStyles.optionText}>Own</Text></TouchableOpacity>
        <TouchableOpacity style={AddIngredientStyles.option}><Text style={AddIngredientStyles.optionText}>Meals</Text></TouchableOpacity>
      </View>

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
                  <CloseIcon width={22} height={22} />
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}

        {searchedData == null ? (
          <View style={AddIngredientStyles.contentError}>
            <View style = {AddIngredientStyles.errorLottieContainer}>
              <Text>EL GATO LOTTIE HERE</Text>
            </View>
            <View style = {AddIngredientStyles.errorAddingContainer}>
              <Text style = {AddIngredientStyles.errorAddNormal}>Couldn't find what you are looking for?</Text>
              <TouchableOpacity onPress={() => addProduct()}>
                <Text style={AddIngredientStyles.errorAddOrange}>Add product<Text style = {AddIngredientStyles.errorAddNormal}>.</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          //xdd
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
            {searchedData.map((item, index) => (
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
                    <Text style={AddIngredientStyles.nutrientText}>P: {item.proteins}g</Text>
                    <Text style={AddIngredientStyles.nutrientText}>C: {item.carbs}g</Text>
                    <Text style={AddIngredientStyles.nutrientText}>F: {item.fats}g</Text>
                    <View style={AddIngredientStyles.kcalContainer}>
                      <Text style={AddIngredientStyles.kcalText}>Kcal: {item.kcal}</Text>
                    </View>
                </View>                  
                </TouchableOpacity>
                <View style={AddIngredientStyles.hr}></View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>


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
                  <View style={AddIngredientStyles.addProductConfirmButton}>
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
          onRequestClose={closeModalIng}
        >
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
                  <Text style={AddIngredientStyles.gramsTextModal}>10 g</Text>
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
                  <Text style={AddIngredientStyles.gramsTextModal}>50 g</Text>
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
                  <Text style={AddIngredientStyles.gramsTextModal}>100 g</Text>
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
                  <Text style={AddIngredientStyles.gramsTextModal}>150 g</Text>
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
                  <Text style={AddIngredientStyles.gramsTextModal}>200 g</Text>
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
                  <TouchableOpacity onPress={() => addGrams(parseFloat(inputGrams))}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={AddIngredientStyles.hr}></View>
              <View style={AddIngredientStyles.ingModalContentSummaryRow}>
                  <View style = {AddIngredientStyles.summaryTopRow}>
                      <Text style = {AddIngredientStyles.summaryText}> {gramsCounter} g</Text>
                  </View>
                  <View style = {AddIngredientStyles.summaryBottomRow}>
                      <Text style = { { textAlign: 'center' }}>P: {selectedItem.proteins * (gramsCounter / 100)} C: {selectedItem.carbs * (gramsCounter / 100)} F: {selectedItem.fats * (gramsCounter / 100)} KCAL: {selectedItem.kcal * (gramsCounter / 100)}</Text>
                  </View>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleAddIngredient(selectedItem)} style={AddIngredientStyles.confirmButtonContainer}>
              <View style={AddIngredientStyles.confirmButton}>
                <Text style = {{color: 'whitesmoke', fontSize: 26, fontWeight: '700', fontFamily: 'Helvetica'}}>+</Text>
              </View>
            </TouchableOpacity>

          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
};


export default AddIngredient;
