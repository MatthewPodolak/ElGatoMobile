import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, ImageBackground, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';
import * as ImagePicker from 'expo-image-picker';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import AddImage from '../../../assets/main/Photos/add-image.png';
import Plus from '../../../assets/main/Diet/plus-lg.svg';
import TrashIcon from '../../../assets/main/Diet/trash3.svg';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import AuthService from '../../../Services/Auth/AuthService.js';
import config from '../../../Config.js';



function AddMealForm({ navigation }) {
    const [recipeName, setRecipeName] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [proteins, setProteins] = useState(null);
    const [carbs, setCarbs] = useState(null);
    const [fats, setFats] = useState(null);
    const [servings, setServings] = useState(null);
    const [calories, setCalories] = useState(null);

    const [isSwitchOn, setIsSwitchOn] = useState(true);
    const [isMakroSwitchOn, setIsMakroSwitchOn] = useState(true);

    const ingPlaceHolders = [
        'Chicken breasts',
        'Potatoes',
        'Soft light brown sugar',
        'cornflour',
        'frozen soya beans'
    ];

    const ingValuePlaceHolders = [
        '210g',
        '1',
        '½ tbsp',
        '25g/1oz',
        'pinch'
    ];

    const ingPlaceHoldersFull = [
        '2 tbsp olive oil',
        '400g tin chopped tomatoes',
        '1 free-range egg',
        'small pinch dried red chilli flakes ',
        '432g tin pineapple chunks',
        '1½ tsp pimentón picante or paprika'
    ];

    const getRndIngPlaceHolder = () => {
        return ingPlaceHolders[Math.floor(Math.random() * ingPlaceHolders.length)];
    };

    const getRndIngVPlaceHolder = () => {
        return ingValuePlaceHolders[Math.floor(Math.random() * ingValuePlaceHolders.length)];
    };

    const getRndIngPlaceHolderFull = () => {
        return ingPlaceHoldersFull[Math.floor(Math.random() * ingPlaceHoldersFull.length)];
    }; 

    const starterIng = {
        name: '',
        value: '',
        ingredientPlaceholder: getRndIngPlaceHolder(),
        valuePlaceholder: getRndIngVPlaceHolder(),
        fullPlaceholder: getRndIngPlaceHolderFull()
    };
    const [ingridientList, setIngridientList] = useState([starterIng]);
    const [stepList, setStepList] = useState(['','']);

    const NavigateBack = () => {
        navigation.goBack();
    };

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission required', 'Gato needs permission to access your photos to proceed.');
            return;
        }

        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!res.canceled) {
            setMainImage(res.assets[0].uri);
        }
    };

    const handleIngridientChange = (value, key) => {
        const updatedList = [...ingridientList];
        updatedList[key].name = value;
        setIngridientList(updatedList);
    };

    const handleStepsChange = (value, key) => {
        const updatedList = [...stepList];
        updatedList[key] = value;
        setStepList(updatedList);
    };

    const handleMakroChange = (text, type) => {
        switch(type){
            case "kcal":

                break;
            case "protein":

                break;
            case "fats":

                break;
            case "carbs":

                break;
            case "servings":

                break;
        }
    };

    const handleIngredientRemove = (index) => {
        setIngridientList(ingridientList.filter((_, i) => i !== index));
    };

    const handleStepRemove = (index) => {
        setStepList(stepList.filter((_, i) => i !== index));
    };

    const handleIngidientValueChange = (value, key) =>{
        const updatedList = [...ingridientList];
        updatedList[key].value = value;
        setIngridientList(updatedList);
    }

    const addNewIngridientField = () => {
        const newIngredient = {
            name: '',
            value: '',
            ingredientPlaceholder: getRndIngPlaceHolder(),
            valuePlaceholder: getRndIngVPlaceHolder(),
            fullPlaceholder: getRndIngPlaceHolderFull()
        };
        setIngridientList([...ingridientList, newIngredient]);
    };
    
    const addNewStepField = () => {
        setStepList([...stepList, '']);
    };

    const handleIngSwitch = () => {
        setIngridientList([starterIng]);
        setIsSwitchOn(!isSwitchOn);
    };

    const handleMakroSwitch = () => {
        setIsMakroSwitchOn(!isMakroSwitchOn);
    };

    return (
        <SafeAreaView style={styles.cont}>
            <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
            <View style={styles.titleCont}>
                <TouchableOpacity onPress={() => NavigateBack()} style = {styles.titleLeft}>
                    <ChevronLeft width={28} height={28} fill={"#fff"}/>
                </TouchableOpacity>
                <View style={styles.titleMid}>
                    <Text style={[GlobalStyles.bold, GlobalStyles.text22]}>
                        {recipeName && recipeName.length > 10 
                        ? `${recipeName.substring(0, 10)} ...` 
                        : recipeName ?? "Add new recipe"}
                    </Text>
                </View>
                <TouchableOpacity style={styles.titleRight}>
                    
                </TouchableOpacity>
            </View>

            <ScrollView style = {styles.mainCont}>
                <TouchableOpacity onPress={handleImagePick} style = {[styles.photoCont, GlobalStyles.center, { overflow: 'hidden' }]}>
                    <ImageBackground style={mainImage ? styles.fullImg : styles.mainImg} source={mainImage ? { uri: mainImage } : AddImage} />
                </TouchableOpacity>

                <View style = {[styles.row]}>
                    <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Recipe name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter recipe name"
                        placeholderTextColor="#888"
                        selectionColor="#FF8303"
                        value={recipeName}
                        onChangeText={(text) => setRecipeName(text)}
                    />
                    </View>
                </View>
                <View style = {[styles.row]}>
                    <View style={styles.largeWrapper}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter description"
                        placeholderTextColor="#888"
                        selectionColor="#FF8303"
                        multiline={true} 
                    />
                    </View>
                </View>

                <View style = {[styles.switchRow]}>
                    <Text style={[GlobalStyles.bold]}>Ingridients:</Text>
                    <Switch
                        style={styles.switch}
                        onValueChange={() => handleIngSwitch()}
                        value={isSwitchOn}
                        trackColor={{ false: '#ccc', true: '#FFA500' }}
                        thumbColor={isSwitchOn ? '#FF8303' : '#FF8303'}
                    />
                </View>

                {isSwitchOn ? (
                    ingridientList.map((item, index) => (
                        <View key={index} style={[ index === 0 ? styles.ingRow : styles.row, styles.flexRow]}>
                            <View style={styles.inputWrapperIng}>
                                <Text style={styles.label}>Ingredient {index + 1}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={item.ingredientPlaceholder}
                                    placeholderTextColor="#888"
                                    selectionColor="#FF8303"
                                    value={item.name}
                                    onChangeText={(text) => handleIngridientChange(text, index)}
                                />
                            </View>
                            <View style = {styles.inputWrapperIngValue}>
                                <Text style={styles.label}>Value</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={item.valuePlaceholder}
                                    placeholderTextColor="#888"
                                    selectionColor="#FF8303"
                                    value={item.value}
                                    onChangeText={(text) => handleIngidientValueChange(text, index)}
                                />
                            </View>
                            <TouchableOpacity style = {styles.inpurtWrapperIngDelOn} onPress={() => handleIngredientRemove(index)}>
                                <TrashIcon fill={'red'} width={22} height={26} />
                            </TouchableOpacity>                       
                        </View>
                    ))
                ) : (
                    ingridientList.map((item, index) => (
                        <View key={index} style={[ index === 0 ? styles.ingRow : styles.row, styles.flexRow]}>
                            <View style={styles.inputWrapperIngOn}>
                                <Text style={styles.label}>Ingredient {index + 1}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={item.fullPlaceholder}
                                    placeholderTextColor="#888"
                                    selectionColor="#FF8303"
                                    value={item.name}
                                    onChangeText={(text) => handleIngridientChange(text, index)}
                                />
                            </View>
                            <TouchableOpacity style = {styles.inpurtWrapperIngDel} onPress={() => handleIngredientRemove(index)}>
                                <TrashIcon fill={'red'} width={22} height={26} />
                            </TouchableOpacity>                       
                        </View>
                    ))
                )}             
                <View style = {styles.row}>
                    <TouchableOpacity>
                        <Plus width = {28} height = {28} fill={"#FF8303"} onPress={() => addNewIngridientField()}/>
                    </TouchableOpacity>
                </View>

                <View style = {[styles.titleRow]}>
                    <Text style={[GlobalStyles.bold]}>Steps:</Text>
                </View>
                {stepList.map((item, index) => (
                <View key={index} style={[ index === 0 ? styles.ingRow : styles.row, styles.flexRow]}>
                    <View style={styles.inputWrapperIngOn}>
                        <Text style={styles.label}>Step {index + 1}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={item}
                            onChangeText={(text) => handleStepsChange(text, index)}
                        />
                    </View>
                    <TouchableOpacity style = {styles.inpurtWrapperIngDel} onPress={() => handleStepRemove(index)}>
                        <TrashIcon fill={'red'} width={22} height={26} />
                    </TouchableOpacity>                       
                </View>
                ))}
                <View style = {styles.row}>
                    <TouchableOpacity>
                        <Plus width = {28} height = {28} fill={"#FF8303"} onPress={() => addNewStepField()}/>
                    </TouchableOpacity>
                </View>

                <View style = {[styles.switchRow]}>
                    <Text style={[GlobalStyles.bold]}>Calorie information:</Text>
                    <View style={[GlobalStyles.center,{ flexDirection: 'row' }]}>
                        <Text>servings / grams</Text>
                        <Switch
                            style={styles.switch}
                            onValueChange={() => handleMakroSwitch()}
                            value={isMakroSwitchOn}
                            trackColor={{ false: '#ccc', true: '#FFA500' }}
                            thumbColor={isMakroSwitchOn ? '#FF8303' : '#FF8303'}
                        />
                    </View>
                </View>

                <View style={styles.makroRow}>
                    <View style={[styles.makroNameCont, GlobalStyles.center]}>
                        <Text>Calories</Text>
                    </View>
                    <View style={styles.makroFieldCont}>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={calories}
                            onChangeText={(text) => handleMakroChange(text, "kcal")}
                        />
                    </View>
                    <View style={[styles.makroHintCont]}>
                        <Text>{isMakroSwitchOn ? "per 100g" : "per serving"}</Text>
                    </View>
                </View>
                <View style={styles.makroRow}>
                    <View style={[styles.makroNameCont, GlobalStyles.center]}>
                        <Text>Proteins</Text>
                    </View>
                    <View style={styles.makroFieldCont}>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={calories}
                            onChangeText={(text) => handleMakroChange(text, "protein")}
                        />
                    </View>
                    <View style={[styles.makroHintCont]}>
                        <Text>{isMakroSwitchOn ? "per 100g" : "per serving"}</Text>
                    </View>
                </View>
                <View style={styles.makroRow}>
                    <View style={[styles.makroNameCont, GlobalStyles.center]}>
                        <Text>Fats</Text>
                    </View>
                    <View style={styles.makroFieldCont}>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={calories}
                            onChangeText={(text) => handleMakroChange(text, "fats")}
                        />
                    </View>
                    <View style={[styles.makroHintCont]}>
                        <Text>{isMakroSwitchOn ? "per 100g" : "per serving"}</Text>
                    </View>
                </View>
                <View style={styles.makroRow}>
                    <View style={[styles.makroNameCont, GlobalStyles.center]}>
                        <Text>Carbs</Text>
                    </View>
                    <View style={styles.makroFieldCont}>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={calories}
                            onChangeText={(text) => handleMakroChange(text, "carbs")}
                        />
                    </View>
                    <View style={[styles.makroHintCont]}>
                        <Text>{isMakroSwitchOn ? "per 100g" : "per serving"}</Text>
                    </View>
                </View>
                {!isMakroSwitchOn && (
                <View style = {[styles.makroRow, GlobalStyles.center]}>
                    <View style = {styles.servLeft}><Text>Recipe is prepered per </Text></View>
                    <View style = {styles.servMid}>
                        <View style = {styles.fieldCont}>
                            <TextInput
                                style={styles.input}
                                placeholder="12"
                                placeholderTextColor="#888"
                                selectionColor="#FF8303"
                                value={servings}
                                onChangeText={(text) => handleMakroChange(text, "servings")}
                            />
                        </View>
                    </View>
                    <View style = {styles.servRight}>
                        <Text>servings.</Text>
                    </View>
                </View>
                )}

                
                <View style={styles.essentialMargin}></View>
            </ScrollView>

            <TouchableOpacity>
                <View style={[styles.hoverButton, GlobalStyles.center]}>
                    <Text style = {[styles.hoverButtonText, GlobalStyles.text16]}>Publish</Text>
                </View>
            </TouchableOpacity>

            <NavigationMenu navigation={navigation} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    essentialMargin: {
        height: 80,
    },
    flexRow: {
        flexDirection: 'row',
    },
    cont: {
        flex: 1,
    },
    mainCont: {
        flex: 1,
        padding: 10,
        backgroundColor: '#F0E3CA'
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
      titleLeft: {
        width: '12.5%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      titleMid: {
        width: '75%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      titleRight: {
        width: '12.5%',
        alignItems: 'center',
        justifyContent: 'center',
      },

      photoCont: {
        height: 250,
        borderRadius: 25,
        borderColor: '#1B1A17',
        borderWidth: 1,
      },
      mainImg: {
        width: 100,
        height: 100,
        borderRadius: 25,
      },
      fullImg: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
      },
      row: {
        marginTop: 20,
      },
      switchRow: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      titleRow: {
        marginTop: 20,
        marginBottom: 15,
      },
      inputWrapper: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      largeWrapper: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 'auto',
        minHeight: 100,
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

      inputWrapperIng: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        width: '60%',
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      inputWrapperIngOn: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        width: '85%',
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      inputWrapperIngValue: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        width: '25%',
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
        marginLeft: 10,
      },
      inpurtWrapperIngDel: {
        width: '10%',
        marginLeft: 10,
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      inpurtWrapperIngDelOn:{
        width: '10%',
        marginLeft: 5,
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },

      makroRow: {
        flexDirection: 'row',
        marginBottom: 10,
      },
      makroNameCont: {
        width: '25%',
      },
      makroHintCont: {
        marginLeft: '4%',
        width: '20%',
        justifyContent: 'center',
        alignItems: 'flex-end',
      },
      makroFieldCont: {
        width: '50%',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      servLeft: {
        width: '42%',
        marginLeft: '7%',
      },
      servMid: {
        width: '30%',     
      },
      fieldCont: {
        width: '80%',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      servRight: {
        width: '20%',
        marginLeft: -5,
        justifyContent: 'center',
        alignItems: 'flex-end',
      },

      hoverButton: {
        width: '50%',
        height: 50,
        marginLeft: '25%',
        position: 'absolute',
        backgroundColor: '#FF8303',
        bottom: 0,
        borderRadius: 25,
        marginBottom: 10,
      },
      hoverButtonText: {
        color: '#fff',
      }
});

export default AddMealForm;