import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Modal, Alert } from 'react-native';
import { ScrollView,View, Text, TextInput, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, PermissionStatus } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';

import BarCodeIcon from '../../../assets/main/Diet/upc-scan.svg';
import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';

const AddIngredient = ({ route, navigation }) => {
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientWeight, setIngredientWeight] = useState('');
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const [ingModalVisible, setIngModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchedData, setSearchedData] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const { mealId } = route.params;
  const { mealName } = route.params;

  const handleItemPress = (item) => {
    setSelectedItem(item);
    console.log('SELECTED:', item);
    setIngModalVisible(true);
  };

  const closeModalIng = () => {
    //here get the data and set.
    setIngModalVisible(false);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setModalVisible(false);

    Alert.alert(`${type} \n \n ${data}`);
  };

  const openScanner = async () => {
    if (cameraPermission?.status !== PermissionStatus.GRANTED) {
      console.log("xd");
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Camera permission is required to use the barcode scanner.');
        return;
      }
    }

    setScanned(false);
    setModalVisible(true);
  };

  const handleAddIngredient = () => {
    const newIngredient = {
      name: ingredientName,
      weightValue: parseFloat(ingredientWeight),
    };

    navigation.navigate('DietHome', {
      mealId,
      newIngredient,
    });
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
        <TouchableOpacity style={styles.topBack} onPress={() => navigation.goBack()}>
          <ChevronLeft width={28} height={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>Search</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>Favs</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text style={styles.optionText}>Own</Text></TouchableOpacity>
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
                      selectedItem?.id === item.id ? styles.selectedRow : null,
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
          <View style={styles.ingModalContainer}>
              <TouchableOpacity onPress={closeModalIng}><Text>CLOSE N</Text></TouchableOpacity>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    borderBottomColor: 'black',
    marginTop: 2,
    borderBottomWidth: 1,
  },


  ingModalContainer: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
});

export default AddIngredient;
