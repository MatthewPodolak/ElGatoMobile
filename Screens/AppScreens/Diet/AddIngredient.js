import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Modal, Alert, TouchableWithoutFeedback  } from 'react-native';
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

const AddIngredient = ({ route, navigation }) => {
  const [ingredientName, setIngredientName] = useState('');
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportedItem, setReportedItem] = useState(null);

  const [addProductModalVisible, setAddProductModalVisible] = useState(false);

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

  const { mealId } = route.params;
  const { mealName } = route.params;

  const addProduct = () => {
    console.log('add product form clicked.');
    setAddProductModalVisible(true);
  };

  const closeAddProductModal = () => {
    setAddProductModalVisible(false);
  };

  const sendReport = (sendingCase) => {
    console.log('report sended with ++=', sendingCase, "for item", reportedItem);

    //api call for reporting
    //
    //

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
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
      <View style={styles.topContainer}>
        <View style = {styles.topContIngBack}>
          <TouchableOpacity style={styles.topBack} onPress={() => passSelectedIngredients()}>
              <ChevronLeft width={28} height={28} />
          </TouchableOpacity>
        </View>
        <View style = {styles.topContIngTitle}>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.topNameText}>{mealName}</Text>
        </View>
        <View style = {styles.topContIngReport}>
          <TouchableOpacity onPress={() => passSelectedIngredients()}>
            <CheckIcon width={37} height={37} fill={'#fff'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>Search</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>Favs</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>Own</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>Meals</Text></TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.barContainer}>
          <TextInput
            style={styles.searchInput}
            selectionColor="#FF8303"
            placeholder="Enter ingredient name"
            placeholderTextColor="#999"
            value={ingredientName}
            onChangeText={setIngredientName}
          />
        </View>
        <View style={styles.codeContainer}>
          <TouchableOpacity onPress={openScanner}>
            <BarCodeIcon width={34} height={48} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {scannedData == null || scannedData.length === 0 ? (
          <Text></Text>
        ) : (
          scannedData.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.scannedContentRow}>
              <TouchableOpacity onPress={() => removeScannedItem(item)}>
                <View style = {styles.scannedRowLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <View style = {styles.scannedRowRight}>
                  <CloseIcon width={22} height={22} />
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}

        {searchedData == null ? (
          <View style={styles.contentError}>
            <View style = {styles.errorLottieContainer}>
              <Text>EL GATO LOTTIE HERE</Text>
            </View>
            <View style = {styles.errorAddingContainer}>
              <Text style = {styles.errorAddNormal}>Couldn't find what you are looking for?</Text>
              <TouchableOpacity onPress={() => addProduct()}>
                <Text style={styles.errorAddOrange}>Add product<Text style = {styles.errorAddNormal}>.</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView>
            {searchedData.map((item, index) => (
              <View key={item.id || index} style={styles.contentRow}>
                <TouchableOpacity
                  key={item.id || index}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.contentTopRow}>
                    <View style={styles.contentLeftName}>
                    <Text
                        style={[
                          styles.itemName,
                          selectedItems.some(selected => selected.id === item.id) ? { color: '#FF8303' } : null,
                        ]}
                        >
                      {item.name}
                    </Text>
                    </View>

                    <View style={styles.contentRightCheck}>
                      {selectedItems.some(selected => selected.id === item.id) && (
                        <CheckIcon style={styles.check} width={38} height={38} fill={'#FF8303'} />
                      )}
                      <View style = {styles.checkBox}></View>
                    </View>

                  </View>
                  <View style={styles.contentBottomRow}>
                    <Text style={styles.nutrientText}>P: {item.proteins}g</Text>
                    <Text style={styles.nutrientText}>C: {item.carbs}g</Text>
                    <Text style={styles.nutrientText}>F: {item.fats}g</Text>
                    <View style={styles.kcalContainer}>
                      <Text style={styles.kcalText}>Kcal: {item.kcal}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={styles.hr}></View>
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
        <View style={styles.modalContainer}>
          <CameraView
            style={{ width:'100%', height:'100%' }}
            barcodeScannerEnabled
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13"],
            }}
          />
          <View style={styles.grayCodeBorderContainer}>
            <View style={styles.croshair}>
              <View style={styles.cornerTopLeft}></View>
              <View style={styles.cornerTopRight}></View>
              <View style={styles.cornerBottomLeft}></View>
              <View style={styles.cornerBottomRight}></View>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close Scanner</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        visible={addProductModalVisible}
        onRequestClose={closeAddProductModal}
        transparent={true}
      >
        <View style = {styles.addProductModal}>

          <TouchableWithoutFeedback onPress={closeAddProductModal}>
            <View style={styles.reportModalClosingTransparent}></View>
          </TouchableWithoutFeedback>

          <View style={styles.reportModalContainer}>
            <View style={styles.reportTitleCont}>
              <Text style={styles.reportTitleText}>Add a product</Text>
            </View>
            <View style = {styles.reportHr}></View>
            <View style={styles.reportDescCont}>
              <Text style={styles.reportDescTextBold}>Please fill in the form below</Text>
              <Text style={styles.reportDescText}>After adding the product our team will review the given information, then product will apear in the database. Thank you for your xyz xyz xyz...</Text>
            </View>
            <View style={[styles.reportDescCont, { marginTop: 10 }]}>
              <View style = {styles.addProductRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Product name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter product name"
                    placeholderTextColor="#888"
                    selectionColor="#FF8303"
                  />
                </View>
              </View>
              <View style = {styles.addProductRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Ean</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter ean-13 code"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    selectionColor="#FF8303"
                  />
                </View>
              </View>
              <View style = {styles.addProductRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Brand name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter brand name"
                    placeholderTextColor="#888"
                    selectionColor="#FF8303"
                  />
                </View>
              </View>
              <View style = {styles.addProductRowShort}>
                <View style = {styles.addProductRowShortLeft}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Kcal</Text>
                    <TextInput
                    style={styles.input}
                    placeholder="Enter kcal"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    selectionColor="#FF8303"
                    />
                  </View>
                </View>
                <View style = {styles.addProductRowShortRight}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Protein</Text>
                    <TextInput
                    style={styles.input}
                    placeholder="Enter protein"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    selectionColor="#FF8303"
                    />
                  </View>
                </View>           
              </View>
              <View style = {styles.addProductRowShort}>
                <View style = {styles.addProductRowShortLeft}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Fat</Text>
                    <TextInput
                    style={styles.input}
                    placeholder="Enter fat"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    selectionColor="#FF8303"
                    />
                  </View>
                </View>
                <View style = {styles.addProductRowShortRight}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Carbs</Text>
                    <TextInput
                    style={styles.input}
                    placeholder="Enter carbs"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    selectionColor="#FF8303"
                    />
                  </View>
                </View>           
              </View>
              <View style = {styles.addProductRow}>
                <Text style = {styles.productRowNotify}>Please enter the given makro components per 100g.</Text>
              </View>
              <View style = {styles.addProductRow}>
                <TouchableOpacity>
                  <View style = {styles.addProductConfirmButton}>
                    <Text style={styles.addProductBtnText}>Add</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>

        </View>
      </Modal>

      <Modal
        animationType="slide"
        visible={reportModalVisible}
        onRequestClose={closeReportModal}
        transparent={true}
      >
        <View style={styles.reportModalOverlay}>
          <TouchableWithoutFeedback onPress={closeReportModal}>
            <View style={styles.reportModalClosingTransparent}></View>
          </TouchableWithoutFeedback>

          <View style={styles.reportModalContainer}>
            {/* Title Section */}
            <View style={styles.reportTitleCont}>
              <Text style={styles.reportTitleText}>Report</Text>
            </View>
            <View style = {styles.reportHr}></View>
            <View style={styles.reportDescCont}>
              <Text style={styles.reportDescTextBold}>Why are you reporting this?</Text>
              <Text style={styles.reportDescText}>Reporting offensive language will always be anonymus. blablabla.</Text>
            </View>

            <View style={styles.reportOptionsCont}>
              <TouchableOpacity onPress={() => sendReport(1)}>
                <Text style={styles.reportOptionText}>Incorrect product name</Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={() => sendReport(2)}>
                <Text style={styles.reportOptionText}>Incorrect/old calorie information</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(3)}>
                <Text style={styles.reportOptionText}>Offensive product name</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(4)}>
                <Text style={styles.reportOptionText}>Misleading information</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(5)}>
                <Text style={styles.reportOptionText}>Spam</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(6)}>
                <Text style={styles.reportOptionText}>Something else</Text>
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
          <View style={styles.ingModalContainer}>
            <View style = {styles.topContainer}>
              <View style = {styles.topContIngBack}>
                <TouchableOpacity style={styles.topBack} onPress={closeModalIng}>
                  <ChevronLeft width={28} height={28} />
                </TouchableOpacity>
              </View>
              <View style = {styles.topContIngTitle}>
                <Text numberOfLines={2} ellipsizeMode="tail" style={styles.topNameText}>{selectedItem.name}</Text>
              </View>
              <View style = {styles.topContIngReport}>
                <TouchableOpacity onPress={() => reportItem(selectedItem)}>
                  <ReportIcon width={26} height={26} fill={'#fff'} />
                </TouchableOpacity>
              </View>
            </View>           

            <View style={styles.ingModalContentContainer}>
              <View style = {styles.ingModalContentRow}>
                <View style = {styles.ingContentRowContent}>
                <View style = {styles.ingContentRowGrams}>
                  <Text style={styles.gramsTextModal}>10 g</Text>
                </View>
                <View style = {styles.ingContentRowMakro}>
                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 0.1) 
                    ? (selectedItem.proteins * 0.1).toFixed(0) 
                    : (selectedItem.proteins * 0.1).toFixed(1)}
                  </Text>

                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 0.1) 
                    ? (selectedItem.carbs * 0.1).toFixed(0) 
                    : (selectedItem.carbs * 0.1).toFixed(1)}
                  </Text>

                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 0.1) 
                    ? (selectedItem.fats * 0.1).toFixed(0) 
                    : (selectedItem.fats * 0.1).toFixed(1)}
                  </Text>
                </View>
                <View style = {styles.ingContentRowKcal}>
                  <Text style={styles.bold}>Kcal: </Text><Text>{(selectedItem.kcal * 0.1).toFixed(0)}</Text>
                </View>
                </View>
                <View style={styles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(10)}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.hr}></View>
              <View style = {styles.ingModalContentRow}>
                <View style = {styles.ingContentRowContent}>
                <View style = {styles.ingContentRowGrams}>
                  <Text style={styles.gramsTextModal}>50 g</Text>
                </View>
                <View style = {styles.ingContentRowMakro}>
                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 0.5) 
                    ? (selectedItem.proteins * 0.5).toFixed(0) 
                    : (selectedItem.proteins * 0.5).toFixed(1)}
                  </Text>

                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 0.5) 
                    ? (selectedItem.carbs * 0.5).toFixed(0) 
                    : (selectedItem.carbs * 0.5).toFixed(1)}
                  </Text>

                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 0.5) 
                    ? (selectedItem.fats * 0.5).toFixed(0) 
                    : (selectedItem.fats * 0.5).toFixed(1)}
                  </Text>
                </View>
                <View style = {styles.ingContentRowKcal}>
                  <Text style={styles.bold}>Kcal: </Text><Text>{(selectedItem.kcal * 0.5).toFixed(0)}</Text>
                </View>
                </View>
                <View style={styles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(50)} >
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.hr}></View>
              <View style = {styles.ingModalContentRow}>
                <View style = {styles.ingContentRowContent}>
                <View style = {styles.ingContentRowGrams}>
                  <Text style={styles.gramsTextModal}>100 g</Text>
                </View>
                <View style = {styles.ingContentRowMakro}>
                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 1) 
                    ? (selectedItem.proteins * 1).toFixed(0) 
                    : (selectedItem.proteins * 1).toFixed(1)}
                  </Text>

                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 1) 
                    ? (selectedItem.carbs * 1).toFixed(0) 
                    : (selectedItem.carbs * 1).toFixed(1)}
                  </Text>

                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 1) 
                    ? (selectedItem.fats * 1).toFixed(0) 
                    : (selectedItem.fats * 1).toFixed(1)}
                  </Text>
                </View>
                <View style = {styles.ingContentRowKcal}>
                  <Text style={styles.bold}>Kcal: </Text><Text>{(selectedItem.kcal ).toFixed(0)}</Text>
                </View>
                </View>
                <View style={styles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(100)}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.hr}></View>
              <View style = {styles.ingModalContentRow}>
                <View style = {styles.ingContentRowContent}>
                <View style = {styles.ingContentRowGrams}>
                  <Text style={styles.gramsTextModal}>150 g</Text>
                </View>
                <View style = {styles.ingContentRowMakro}>
                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 1.5) 
                    ? (selectedItem.proteins * 1.5).toFixed(0) 
                    : (selectedItem.proteins * 1.5).toFixed(1)}
                  </Text>

                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 1.5) 
                    ? (selectedItem.carbs * 1.5).toFixed(0) 
                    : (selectedItem.carbs * 1.5).toFixed(1)}
                  </Text>

                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 1.5) 
                    ? (selectedItem.fats * 1.5).toFixed(0) 
                    : (selectedItem.fats * 1.5).toFixed(1)}
                  </Text>
                </View>
                <View style = {styles.ingContentRowKcal}>
                  <Text style={styles.bold}>Kcal: </Text><Text>{(selectedItem.kcal * 1.5).toFixed(0)}</Text>
                </View>
                </View>
                <View style={styles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(150)}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.hr}></View>
              <View style = {styles.ingModalContentRow}>
                <View style = {styles.ingContentRowContent}>
                <View style = {styles.ingContentRowGrams}>
                  <Text style={styles.gramsTextModal}>200 g</Text>
                </View>
                <View style = {styles.ingContentRowMakro}>
                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>P:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.proteins * 2) 
                    ? (selectedItem.proteins * 2).toFixed(0) 
                    : (selectedItem.proteins * 2).toFixed(1)}
                  </Text>
                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>C:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.carbs * 2) 
                    ? (selectedItem.carbs * 2).toFixed(0) 
                    : (selectedItem.carbs * 2).toFixed(1)}
                  </Text>
                  <Text style={[styles.nutrientTextModal, {fontWeight: 'bold'}]}>F:</Text>
                  <Text style={styles.nutrientTextModalValue}> {Number.isInteger(selectedItem.fats * 2) 
                    ? (selectedItem.fats * 2).toFixed(0) 
                    : (selectedItem.fats * 2).toFixed(1)}
                  </Text>
                </View>
                <View style = {styles.ingContentRowKcal}>
                  <Text style={styles.bold}>Kcal: </Text><Text>{(selectedItem.kcal * 2).toFixed(0)}</Text>
                </View>
                </View>
                <View style={styles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(200)}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.hr}></View>
              <View style = {styles.ingModalContentRow}>
                <View style = {styles.ingContentRowContent}>
                <View style = {styles.ingContentRowGrams}>
                  <TextInput
                    style={styles.inputBorder}
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
                <View style={styles.ingContentRowMakro}>
                  <Text style={[styles.nutrientTextModal, { fontWeight: 'bold' }]}>P:</Text>
                  <Text style={styles.nutrientTextModalValue}>{macros.proteins}</Text>

                  <Text style={[styles.nutrientTextModal, { fontWeight: 'bold' }]}>C:</Text>
                  <Text style={styles.nutrientTextModalValue}>{macros.carbs}</Text>

                  <Text style={[styles.nutrientTextModal, { fontWeight: 'bold' }]}>F:</Text>
                  <Text style={styles.nutrientTextModalValue}>{macros.fats}</Text>
                </View>
                <View style={styles.ingContentRowKcal}>
                  <Text style={styles.bold}>Kcal: </Text>
                  <Text>{macros.kcal}</Text>
                </View>
                </View>
                <View style={styles.ingContentRowButton}>
                  <TouchableOpacity onPress={() => addGrams(parseFloat(inputGrams))}>
                    <AddIcon width={32} height={32}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.hr}></View>
              <View style={styles.ingModalContentSummaryRow}>
                  <View style = {styles.summaryTopRow}>
                      <Text style = {styles.summaryText}> {gramsCounter} g</Text>
                  </View>
                  <View style = {styles.summaryBottomRow}>
                      <Text style = { { textAlign: 'center' }}>P: {selectedItem.proteins * (gramsCounter / 100)} C: {selectedItem.carbs * (gramsCounter / 100)} F: {selectedItem.fats * (gramsCounter / 100)} KCAL: {selectedItem.kcal * (gramsCounter / 100)}</Text>
                  </View>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleAddIngredient(selectedItem)} style={styles.confirmButtonContainer}>
              <View style={styles.confirmButton}>
                <Text style = {{color: 'whitesmoke', fontSize: 26, fontWeight: '700', fontFamily: 'Helvetica'}}>+</Text>
              </View>
            </TouchableOpacity>

          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  topContainer: {
    width: '100%',
    height: '9%',
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topContIngBack: {
    width: '15%',
    height: '100%',
  },
  topContIngTitle: {
    width: '70%',
    height: '100%',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },
  topContIngReport: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },

  topBack: {
    position: 'absolute',
    left: 10,
    height: '100%',
    justifyContent: 'center',
  },
  topName: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNameText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },

  categoryContainer: {
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
  },

  searchContainer: {
    marginTop: 10,
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  barContainer: {
    height: '100%',
    width: '80%',
    justifyContent: 'center',
    marginLeft: 10,
  },
  searchInput: {
    height: '80%',
    backgroundColor: '#1B1A17',
    color: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  codeContainer: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#FF8303',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
    grayCodeBorderContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  croshair: {
    width: '70%',
    height: '20%',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: 'black',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderColor: 'black',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'black',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'black',
  },

  contentContainer: {
    marginTop: 20,
    flex: 1,
    flexDirection: 'column',
  },
  contentError:{
    width: '100%',
    height: '100%',
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  errorLottieContainer: {
    width: '100%',
    height: '70%',
  },
  errorAddingContainer: {
    width: '100%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  errorAddOrange: {
    color: '#FF8303',
    fontWeight: '600', //700?
    fontSize: 18,
    fontFamily: 'Helvetica',
  },
  errorAddNormal: {
    fontSize: 18,
    fontFamily: 'Helvetica',
    color: '#000',
  },

  scannedRowLeft: {
    borderBottomColor: '#FF8303',
    borderBottomWidth: 2,
    width: '85%',
  },
  scannedContentRow: {
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 20,
    position: 'relative', 
  },
  scannedRowRight: {
    width: '10%',
    height: '100%',
    backgroundColor: '#1B1A17',
    position: 'absolute', 
    right: 0, 
    top: 0, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    width: '100%',
    height: '15%',
    paddingLeft: 10,
    paddingRight: 10, 
    position: 'relative',
  },
  contentTopRow: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentRightCheck: {
    position: 'absolute',
    right: 20,

    height: '100%',
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBox: {
    width: '55%',
    height: '55%',
    borderWidth: 1,   
  },
  check: {
    position: 'absolute',
    bottom: 0,
    left: -1,
    zIndex: 99,
  },
  contentBottomRow: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 18,
    marginLeft: 5,
    fontFamily: 'Helvetica',
  },
  nutrientText: {
    marginLeft: 10,
  },
  kcalContainer: {
    flex: 1, 
    alignItems: 'flex-end',
  },
  kcalText: {
    marginRight: 10, 
  },
  selectedRow: {
    backgroundColor: '#FF8303',
  },

  hr: {
    borderBottomColor: 'lightgray',
    opacity: 0.6,
    marginTop: 2,
    borderBottomWidth: 1,
  },


  ingModalContainer: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  ingModalContentContainer: {
    flex: 1,
  },
  ingModalContentRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
  },
  ingContentRowContent: {
    width: '90%',
    flexDirection: 'row',
    paddingLeft: 15,
  },
  ingContentRowButton: {
    width: '10%',
    paddingRight: 15,
  },
  ingContentRowGrams: {
    width: '18%',
    alignItems: 'center',
  },
  ingContentRowMakro: {
    flexDirection: 'row',
    width: '60%',
    alignItems: 'center',
  },
  ingContentRowKcal:{
    width: '20%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutrientTextModal: {
    fontSize: 16,
    marginLeft: 12,
  },
  nutrientTextModalValue: {
    fontSize: 16,
    marginLeft: 5,
  },
  gramsTextModal: {
    fontSize: 22,
    fontFamily: 'Helvetica',
    fontWeight: '600',
  },
  inputBorder: {
    borderColor: 'black',
    borderWidth: 1,
    width: '100%',
    paddingLeft: 12,
  },
  ingModalContentSummaryRow: {
    marginTop: 25,
  },
  summaryTopRow: {
    width: '100%',
  },
  summaryBottomRow: {
    width: '100%',
  },
  summaryText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FF8303',
    fontFamily: 'Helvetica',
    alignItems: 'center',
    textAlign: 'center',
  },

  confirmButtonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '50%',
    marginLeft: '25%',
    alignItems: 'center',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#1B1A17',
    paddingVertical: 9,
    borderRadius: 50,
    alignItems: 'center',
    color: 'whitesmoke',
    justifyContent: 'center',
  },


  reportModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  reportModalClosingTransparent: {
    height: '15%',
    backgroundColor: 'transparent',
    width: '100%',
  },
  reportModalContainer: {
    height: '85%',
    backgroundColor: '#F0E3CA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  reportTitleCont: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  reportTitleText: {
    fontSize: 20,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    color: '#333',
  },
  reportDescCont: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  reportDescTextBold: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  reportDescText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  reportOptionsCont: {
    width: '100%',
    padding: 5,
    borderRadius: 10,
  },
  reportOptionText: {
    color: 'black',
    marginBottom: 15,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  reportHr: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'black',
    opacity: 0.2,
  },

  addProductModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  addProductModalClosingTransparent: {
    height: '15%',
    backgroundColor: 'transparent',
    width: '100%',
  },

  addProductRow: {
    width: '100%',
    marginBottom: 20,
  },
  productRowNotify: {
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  addProductRowShort: {
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addProductRowShortLeft: {
    width: '45%',
  },
  addProductRowShortRight: {
    width: '45%',
  },
  inputWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    paddingTop: 2,
    paddingHorizontal: 10,
    height: 50,
  },
  label: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: '#F0E3CA',
    paddingHorizontal: 5,
    fontSize: 14,
    color: '#000',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 5,
    fontSize: 16,
    color: '#000',
  },
  addProductConfirmButton: {     
    width: '100%', 
    height: 50,          
    backgroundColor: '#FF8303',
    justifyContent: 'center',
    alignItems: 'center',   
    borderRadius: 10,   
},
addProductBtnText: {
  fontSize: 18,
  fontFamily: 'Helvetica',
},

});

export default AddIngredient;
