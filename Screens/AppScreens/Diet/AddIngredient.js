import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Modal, Alert } from 'react-native';
import { ScrollView,View, Text, TextInput, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, PermissionStatus } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';

import BarCodeIcon from '../../../assets/main/Diet/upc-scan.svg';
import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import AddIcon from '../../../assets/main/Diet/plus-circle-fill.svg';

const AddIngredient = ({ route, navigation }) => {
  const [ingredientName, setIngredientName] = useState('');
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const [ingModalVisible, setIngModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsData, setSelectedItemsData] = useState([]);
  const [searchedData, setSearchedData] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const [inputGrams, setInputGrams] = useState('');
  const [macros, setMacros] = useState({ proteins: 0, carbs: 0, fats: 0, kcal: 0 });
  const [gramsCounter, setGramsCounter] = useState(0);

  const { mealId } = route.params;
  const { mealName } = route.params;

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
  

  const handleItemPress = (item) => {
    setSelectedItem(item);
    console.log('SELECTED:', item);

    setSelectedItems(prevItems => {
      if (!prevItems.some(selected => selected.id === item.id)) {
        return [...prevItems, item];
      }
      return prevItems;
    });

    setIngModalVisible(true);
    setGramsCounter(0);
    setInputGrams('');
  };

  const handleAddIngredient = (selectedItem) => {
    if(gramsCounter === 0){
      console.log('zero');
      //przem err
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
    setSelectedItem(null);
    setIngModalVisible(false);
  };

  const addGrams = (grams) => {
    setGramsCounter(gramsCounter + grams);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setModalVisible(false);

    Alert.alert(`${type} \n \n ${data}`);
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
        <View style={styles.topName}>
          <Text style={styles.topNameText}>{mealName}</Text>
        </View>
        <TouchableOpacity style={styles.topBack} onPress={() => passSelectedIngredients()}>
          <ChevronLeft width={28} height={28} />
        </TouchableOpacity>
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
        {searchedData == null ? (
          <View style={styles.contentError}>
            <Text style={styles.specialText}>EL GATO LOTTIE HERE!</Text>
          </View>
        ) : (
          <ScrollView>
            {searchedData.map((item, index) => (
              <View key={item.id || index} style={styles.contentRow}>
                <TouchableOpacity
                  key={item.id || index}
                  style={[
                    selectedItems.some(selected => selected.id === item.id) ? styles.selectedRow : null,
                  ]}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.contentTopRow}>
                    <View style={styles.contentLeftName}>
                      <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                    <View style={styles.contentRightCheck}>
                      {/* Checkbox */}
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
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close Scanner</Text>
          </TouchableOpacity>
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
            <View style={styles.topContainer}>
              <View style={styles.topName}>
                <Text style={styles.topNameText}>{selectedItem.name}</Text>
              </View>
              <TouchableOpacity style={styles.topBack} onPress={closeModalIng}>
                <ChevronLeft width={28} height={28} />
              </TouchableOpacity>
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
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
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
  contentRow: {
    width: '100%',
    height: '15%',
    paddingLeft: 10,
    paddingRight: 10, 
  },
  contentTopRow: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default AddIngredient;
