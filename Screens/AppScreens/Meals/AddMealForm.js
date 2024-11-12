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

import { doubleValidator, intValidator } from '../../../Services/Conversion/NumberValidators.js';

function AddMealForm({ navigation }) {
    const [recipeName, setRecipeName] = useState(null);
    const [description, setDescription] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [proteins, setProteins] = useState(null);
    const [carbs, setCarbs] = useState(null);
    const [fats, setFats] = useState(null);
    const [servings, setServings] = useState(null);
    const [calories, setCalories] = useState(null);
    const [estTime, setEstTime] = useState(null);
    const breakfastTagObj = {
        id: 1, 
        label: 'Breakfast', 
        active: false 
    };
    const mainDishTagObj = {
        id: 2, 
        label: 'Side Dish', 
        active: false 
    };
    const sideDishTagObj = {
        id: 3, 
        label: 'Main Dish', 
        active: true,
    };

    const [tags, setTags] = useState([breakfastTagObj, mainDishTagObj,sideDishTagObj]);

    const [isSwitchOn, setIsSwitchOn] = useState(true);
    const [isMakroSwitchOn, setIsMakroSwitchOn] = useState(true);
    const [tagText, setTagText] = useState(null);

    const [nameError, setNameError] = useState(null);
    const [ingridientError, setIngridientError] = useState(null);
    const [stepsError, setStepsError] = useState(null);
    const calorieInformationErrorModel = {
        type: null,
        msg: null
    };
    const [calorieInformationError, setCalorieInformationError] = useState(calorieInformationErrorModel);
    const [estTimeError, setEstTimeError] = useState(null);

    const publish = async () => {
        let errorCounter = 0;

        if(recipeName == null){ setNameError("Please let us know the name!"); errorCounter++; }
        if(ingridientList == null){ setIngridientError("Please fill those up!"); errorCounter++; }
        if(ingridientList.length === 0 || !ingridientList[0].name){ setIngridientError("Please fill those."); errorCounter++; }
        if(isSwitchOn && ingridientList.some(item => !item.value)){ setIngridientError("Please fill in values"); }
        if(stepList.length === 0 || !stepList[0]){ setStepsError("Please fill those."); errorCounter++; }
        if(estTime == null){setEstTimeError("It is kinda important."); errorCounter++; }
        if(errorCounter != 0){ errorCounter = 0; return; }

        if(calories == null){ const error = {type: "kcal", msg: "please fill calories."}; setCalorieInformationError(error); return; }
        if(proteins == null){ const error = {type: "protein", msg: "please fill proteins."}; setCalorieInformationError(error); return; }
        if(fats == null){ const error = {type: "fats", msg: "please fill fats."}; setCalorieInformationError(error); return; }
        if(carbs == null){ const error = {type: "carbs", msg: "please fill carbs."}; setCalorieInformationError(error); return; }
        if(servings == null && !isMakroSwitchOn) { const error = {type: "servings", msg: "please fill servings."}; setCalorieInformationError(error); return; }

        const formData = new FormData();
        formData.append("Name", recipeName);
        formData.append("Desc", description??"");
        formData.append("Time", estTime);
    
        if (mainImage) {
            const response = await fetch(mainImage);
            const blob = await response.blob();
            formData.append("Image", {
                uri: mainImage,
                name: "meal-image.jpg",
                type: "image/jpeg"
            });
        } 

        if(isSwitchOn){
            formData.append("Ingridients", JSON.stringify(ingridientList.map(i=>i.value) + " " + ingridientList.map(i => i.name)));
        }else{
            formData.append("Ingridients", JSON.stringify(ingridientList.map(i => i.name)));
        }

        formData.append("Steps", JSON.stringify(stepList));

        const activeTags = tags.filter(tag => tag.active) .map(tag => tag.label);
        activeTags.forEach(label => {
            formData.append("Tags", label);
        });
        
        let makro = {
            kcal: calories,
            proteins: proteins,
            carbs: carbs,
            fats: fats,
            preperedPer: 0,
        };

        if(isMakroSwitchOn == true){
            //per 100g.
            makro.preperedPer = 100;
        }else{
            makro.servings = servings;
        }

        formData.append("Makro.Kcal", makro.kcal);
        formData.append("Makro.Protein", makro.proteins);
        formData.append("Makro.Carbs", makro.carbs);
        formData.append("Makro.Fats", makro.fats);
        formData.append("Makro.PreperedPer", makro.preperedPer);
        if (!isMakroSwitchOn) {
            formData.append("Makro.Servings", makro.servings);
        }

        const token = await AuthService.getToken();   
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return;
        }

        try{
            const res = await fetchWithTimeout(
                `${config.ipAddress}/api/meal/publishMeal`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                  body: formData
                },
                config.longTimeout
            );

            if(!res.ok){
                console.log(res);
            }

            //TODO
            //check for achievment too.
            //error handling

        }catch(error){
            console.log(error);
        }
    };

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
        setIngridientError(null);
    };

    const handleStepsChange = (value, key) => {
        const updatedList = [...stepList];
        updatedList[key] = value;
        setStepList(updatedList);
        setStepsError(null);
    };


    const handleMakroChange = (text, type) => {
        switch(type){
            case "kcal":
                const calorieValue = doubleValidator(text);
                setCalories(calorieValue);
                break;
            case "protein":
                const proteinValue = doubleValidator(text);
                setProteins(proteinValue);
                break;
            case "fats":
                const fatsValue = doubleValidator(text);
                setFats(fatsValue);
                break;
            case "carbs":
                const carbsValue = doubleValidator(text);
                setCarbs(carbsValue);
                break;
            case "servings":
                const servingsValue = intValidator(text);
                setServings(servingsValue);
                break;
            case "time":
                const timeValue = intValidator(text);
                setEstTimeError(null);
                setEstTime(timeValue);
                break;
        }
        setCalorieInformationError(calorieInformationErrorModel);    
    };

    const handleIngredientRemove = (index) => {
        if(index === 0 && ingridientList.length === 1){
            setIngridientError("Please don't remove all of them ;/");
            return;
        }

        setIngridientList(ingridientList.filter((_, i) => i !== index));
    };

    const handleStepRemove = (index) => {
        if(index === 0 && stepList.length === 1){
            setStepsError("Please let us know how to do it ;c");
            return;
        }

        setStepList(stepList.filter((_, i) => i !== index));
    };

    const handleIngidientValueChange = (value, key) =>{
        const updatedList = [...ingridientList];
        updatedList[key].value = value;
        setIngridientList(updatedList);
        setIngridientError(null);
    }

    const handleRecipeNameChange = (value) => {
        setRecipeName(value);
        setNameError(null);
    };

    const handleTagPress = (tagId) => {
        setTags(tags.map((tag) => 
          tag.id === tagId ? { ...tag, active: !tag.active } : tag
        ));
    };

    const handleOwnTagsAdding = (text) => {
        const firstSpaceIndex = text.indexOf(" ");
     
        if (firstSpaceIndex === -1) {
            setTagText(text);
        } else {
            let tagBeforeSpace = text.slice(0, firstSpaceIndex);
            tagBeforeSpace = tagBeforeSpace.replace(/[^a-zA-Z]/g, "");
            
            const newTag = {
                id: (tags.length + 1),
                label: tagBeforeSpace,
                active: true
            };
    
           setTags(prevTags => [...prevTags, newTag]);
           setTagText(null);
        }
    };
    

    const addNewIngridientField = () => {
        const newIngredient = {
            name: '',
            value: '',
            ingredientPlaceholder: getRndIngPlaceHolder(),
            valuePlaceholder: getRndIngVPlaceHolder(),
            fullPlaceholder: getRndIngPlaceHolderFull()
        };
        setIngridientList([...ingridientList, newIngredient]);
        setIngridientError(null);
    };
    
    const addNewStepField = () => {
        setStepList([...stepList, '']);
        setStepsError(null);
    };

    const handleIngSwitch = () => {
        setIngridientList([starterIng]);
        setIsSwitchOn(!isSwitchOn);
        setIngridientError(null);
    };

    const handleMakroSwitch = () => {
        setIsMakroSwitchOn(!isMakroSwitchOn);
        setCalorieInformationError(calorieInformationErrorModel);
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
                    <View style={nameError ? styles.errorWrapper :styles.inputWrapper}>
                    <Text style={styles.label}>Recipe name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter recipe name"
                        placeholderTextColor="#888"
                        selectionColor="#FF8303"
                        value={recipeName}
                        onChangeText={(text) => handleRecipeNameChange(text)}
                    />
                    </View>
                </View>
                {nameError != null &&
                <View style = {[styles.errorRow, GlobalStyles.center]}>
                    <Text style = {[GlobalStyles.red]}>{nameError}</Text>
                </View>
                }
                <View style = {[styles.row]}>
                    <View style={styles.largeWrapper}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter description"
                        placeholderTextColor="#888"
                        selectionColor="#FF8303"
                        multiline={true}
                        onChangeText={(text) => setDescription(text)} 
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
                            <View style={ingridientError? styles.errorInputWrapperIng : styles.inputWrapperIng}>
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
                            <View style = {ingridientError? styles.errorInputWrapperIngValue : styles.inputWrapperIngValue}>
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
                            <View style={ingridientError? styles.errorInputWrapperIngOn : styles.inputWrapperIngOn}>
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
                {ingridientError != null &&
                <View style = {[styles.errorRow, GlobalStyles.center]}>
                    <Text style = {[GlobalStyles.red]}>{ingridientError}</Text>
                </View>
                }             
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
                    <View style={stepsError? styles.errorInputWrapperStep : styles.inputWrapperStep}>
                        <Text style={styles.label}>Step {index + 1}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={item}
                            multiline={true}
                            onChangeText={(text) => handleStepsChange(text, index)}
                        />
                    </View>
                    <TouchableOpacity style = {styles.inpurtWrapperIngDel} onPress={() => handleStepRemove(index)}>
                        <TrashIcon fill={'red'} width={22} height={26} />
                    </TouchableOpacity>                       
                </View>
                ))}
                {stepsError != null &&
                <View style = {[styles.errorRow, GlobalStyles.center]}>
                    <Text style = {[GlobalStyles.red]}>{stepsError}</Text>
                </View>
                }    
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
                    <View style={calorieInformationError.type == "kcal" ? styles.errorMakroFieldCont : styles.makroFieldCont}>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={calories}
                            keyboardType='numeric'
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
                    <View style={calorieInformationError.type == "protein" ? styles.errorMakroFieldCont : styles.makroFieldCont}>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={proteins}
                            keyboardType='numeric'
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
                    <View style={calorieInformationError.type == "fats" ? styles.errorMakroFieldCont : styles.makroFieldCont}>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={fats}
                            keyboardType='numeric'
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
                    <View style={calorieInformationError.type == "carbs" ? styles.errorMakroFieldCont : styles.makroFieldCont}>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#888"
                            selectionColor="#FF8303"
                            value={carbs}
                            keyboardType='numeric'
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
                        <View style={calorieInformationError.type == "servings" ? styles.errorFieldCont : styles.fieldCont}>
                            <TextInput
                                style={styles.input}
                                placeholder="12"
                                keyboardType='numeric'
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
                {calorieInformationError.msg != null &&
                <View style = {[styles.errorRow, GlobalStyles.center]}>
                    <Text style = {[GlobalStyles.red]}>{calorieInformationError.msg}</Text>
                </View>
                }    
                
                <View style = {[styles.titleRow]}>
                    <Text style={[GlobalStyles.bold]}>Est time:</Text>
                </View>
                <View style = {[styles.makroRow, GlobalStyles.center]}>
                    <View style = {[styles.timeLeft, GlobalStyles.center]}><Text>How much time do we need to prepare this masterpiece? </Text></View>
                    <View style = {styles.timeMid}>
                        <View style={estTimeError != null ? styles.errorFieldCont : styles.fieldCont}>
                            <TextInput
                                style={styles.input}
                                placeholder="12"
                                keyboardType='numeric'
                                placeholderTextColor="#888"
                                selectionColor="#FF8303"
                                value={servings}
                                onChangeText={(text) => handleMakroChange(text, "time")}
                            />
                        </View>
                    </View>
                    <View style = {styles.timeRight}>
                        <Text>(minutes)</Text>
                    </View>
                </View>
                {estTimeError != null &&
                <View style = {[styles.errorRow, GlobalStyles.center]}>
                    <Text style = {[GlobalStyles.red]}>{estTimeError}</Text>
                </View>
                }

                <View style = {[styles.titleRow]}>
                    <Text style={[GlobalStyles.bold]}>Categories & tags:</Text>
                </View>
                <View style = {styles.sortingContainer}>
                        {tags.map((tag) => (
                          <TouchableOpacity
                            key={tag.id}
                            style={[
                                styles.option,
                                tag.active && styles.selectedOption,
                            ]}
                            onPress={() => handleTagPress(tag.id)}
                          >
                            <Text style={GlobalStyles.text14}>{tag.label}</Text>
                          </TouchableOpacity>
                        ))}
                </View>  
                <View style = {styles.ownTagContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="write ur own tags here :)"
                        placeholderTextColor="#888"
                        selectionColor="#FF8303"
                        value={tagText}
                        onChangeText={(text) => handleOwnTagsAdding(text)}
                    />
                </View>

                <View style={styles.essentialMargin}></View>
            </ScrollView>

            <TouchableOpacity onPress={() => publish()}>
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
      inputWrapperStep: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        width: '85%',
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 'auto',
        minHeight: 50,
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
      timeLeft: {
        width: '50%',
      },
      servMid: {
        width: '30%',     
      },
      timeMid: {
        width: '25%',
        marginLeft: '5%',
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
      timeRight: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '20%',
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
      },

      errorRow: {
        marginTop: 5,
      },
      errorWrapper: {
        position: 'relative',
        borderWidth: 2,
        borderColor: 'red',
        borderRadius: 10,
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      errorInputWrapperIngValue: {
        position: 'relative',
        borderWidth: 2,
        borderColor: 'red',
        borderRadius: 10,
        width: '25%',
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
        marginLeft: 10,
      },
      errorInputWrapperIng: {
        position: 'relative',
        borderWidth: 2,
        borderColor: 'red',
        borderRadius: 10,
        width: '60%',
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      errorInputWrapperIngOn: {
        position: 'relative',
        borderWidth: 2,
        borderColor: 'red',
        borderRadius: 10,
        width: '85%',
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      errorInputWrapperStep: {
        position: 'relative',
        borderWidth: 2,
        borderColor: 'red',
        borderRadius: 10,
        width: '85%',
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 'auto',
        minHeight: 50,
      },
      errorMakroFieldCont: {
        width: '50%',
        borderWidth: 2,
        borderColor: 'red',
        borderRadius: 10,
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },
      errorFieldCont: {
        width: '80%',
        borderWidth: 2,
        borderColor: 'red',
        borderRadius: 10,
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      },


      sortingContainer: {
        marginTop: 10,
        width: '100%',
        height: 'auto',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      option: {
        borderColor: '#1B1A17',
        borderWidth: 1,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        borderRadius: 15,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
      },
      selectedOption: {
        backgroundColor: '#FF8303',
        borderColor: '#1B1A17',
      },
      ownTagContainer: {
        marginTop: 10,
        position: 'relative',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        width: '100%',
        paddingTop: 10,
        paddingHorizontal: 10,
        height: 50,
      }
});

export default AddMealForm;