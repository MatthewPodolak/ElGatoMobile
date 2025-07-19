import React, { useState, useContext } from 'react';

import { Alert, Modal, View,StyleSheet, TouchableOpacity, Text, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles.js';
import NutriCircle from '../../Components/Main/NutriCircle.js';
import ReportMealModal from './ReportMealModal.js';

import ChevUp from '../../assets/main/Diet/chevron-up.svg';
import ChevDown from '../../assets/main/Diet/chevron-down.svg';
import ReportIcon from '../../assets/main/Diet/flag-fill.svg';
import ChevronLeft from '../../assets/main/Diet/chevron-left.svg';
import Trash from '../../assets/main/Diet/trash3.svg'

import { AuthContext } from '../../Services/Auth/AuthContext.js';
import MealDataService from '../../Services/ApiCalls/MealData/MealDataService.js';

const InspectMealModal = ({ visible, closeInspectModal, item, specialClose, navigation }) => {

    const mainDishImage = item && item.img ? { uri: `http://192.168.0.143:5094${item.img}` } : require('../../assets/recepieBaseImage.png');
    const GATO_ID = "356df418-75f7-41f3-b59d-6b534e270e21";

    const [isNutriExpanded, setIsNutriExpanded] = useState(true);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isStepsExpanded, setIsStepsExpanded] = useState(true);
    const [isIngridientsExpanded, setIsIngridientsExpanded] = useState(true);
    const { setIsAuthenticated } = useContext(AuthContext);

    const [reportModalVisible, setReportModalVisible] = useState(false);

    const addToMeal = () => {
        specialClose(item);
    };

    const closeReportModal = () => {
        setReportModalVisible(false);
    };
    const openReportModal = () => {
        setReportModalVisible(true);
    };

    const goToCreatorProfile = () => {
        if(!item.creatorId || item.creatorId === GATO_ID) { return; }

        if(item.own){ navigation?.navigate('ProfileDisplay'); return; }

        navigation?.push('ProfileDisplay', {
            userId: item.creatorId
        });
    };

    const deleteRequest = () => {
        Alert.alert(
            "Are you sure you want to delete?",
            "We will lose access to this masterpiece :c",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            await sendDeleteRequest();
                        } catch (error) {
                            console.error("Error sending delete request:", error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };
    
    const sendDeleteRequest = async () => {
        try{
            const res = await MealDataService.deleteMeal(setIsAuthenticated, navigation, item.stringId);
            
            if(!res.ok){
                //error show 
                return;
            }

            closeInspectModal();
        }catch(error){
            console.log("Error" + error);
            //Error
        }
    };

    return (
        item != null ? (
            <Modal
                animationType="slide"
                visible={visible}
                onRequestClose={closeInspectModal}
                transparent={true}
            > 
                <View style={styles.container}>
                    <View style={styles.titleCont}>
                        <TouchableOpacity style = {styles.titleLeft} onPress={() => closeInspectModal()}>
                            <ChevronLeft width={28} height={28} fill={"#fff"}/>
                        </TouchableOpacity>
                        {item.creatorId === GATO_ID ? (
                            <View style={styles.titleMid}>
                                <Text style={[GlobalStyles.bold, GlobalStyles.text22]}>
                                    @{item.creatorName ?? "Unknown"}
                                </Text>
                            </View>
                        ):(
                            <TouchableOpacity style={styles.titleMid} onPress={() => goToCreatorProfile()}>
                                <Text style={[GlobalStyles.bold, GlobalStyles.text22]}>
                                    @{item.creatorName ?? "Unknown"}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {item.own ? (
                            <View style={[styles.titleRight, styles.columnFlex]}>
                                <TouchableOpacity style={styles.extRight} onPress={() => deleteRequest()}>
                                    <Trash width={26} height={26} fill={"#fff"}/>
                                </TouchableOpacity>
                            </View>
                        ):(
                        <TouchableOpacity style={styles.titleRight} onPress={() => openReportModal()}>
                            <ReportIcon width={26} height={26} fill={"#fff"}/>
                        </TouchableOpacity>
                        )}
                    </View>
                    <ScrollView style={styles.mainContentContainer} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                        <View style={styles.imgContainer}>
                            <ImageBackground imageStyle={{ borderRadius: 25 }} source={mainDishImage} style={styles.mainImg} />
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={[{textAlign: 'center'},GlobalStyles.text22, GlobalStyles.bold, GlobalStyles.textShadow]}> {item.name} </Text>
                        </View>
                        <View style = {styles.svgDescCont}>
                            <View style = {styles.svgRow}>
                                <Text style={[GlobalStyles.text18, GlobalStyles.textShadow]}>Portions: </Text>
                                <Text style={[GlobalStyles.text18, GlobalStyles.textShadow]}>12</Text>
                            </View>
                            <View style = {styles.svgRow}>
                                <Text style={[GlobalStyles.text18, GlobalStyles.textShadow]}>Est time: </Text>
                                <Text style={[GlobalStyles.text18, GlobalStyles.textShadow]}>{item.time}</Text>
                            </View>
                            <View style = {styles.svgRow}>
                                <Text style={[GlobalStyles.text18, GlobalStyles.textShadow]}>Difficulty: </Text>
                                <Text style={[GlobalStyles.text18, GlobalStyles.textShadow, { color: item.difficulty === "Easy" ? "#8BFF03" : item.difficulty === "Medium" ? "#FF8303" : "red" }]}>
                                    {item.difficulty}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.nutriContainer}>
                            <TouchableOpacity style = {styles.expandTitle} onPress={() => setIsNutriExpanded(!isNutriExpanded)}>
                            <View>
                                <Text style={[GlobalStyles.text18, GlobalStyles.textShadow]}>
                                    Nutritions <Text style={{ fontSize: 14 }}>{item.servings !== 0 ? "(per serving)" : "(per 100g)"}</Text>
                                </Text>
                            </View>
                                {isNutriExpanded ? (
                                    <View><ChevDown width = {24} height = {24} fill={"#000"}/></View>
                                ):(
                                    <View><ChevUp width = {24} height = {24} fill={"#000"}/></View>
                                )}                    
                            </TouchableOpacity>                                
                            {isNutriExpanded && (
                                <View style = {styles.expandableContentNutri}>
                                    <NutriCircle value={item.kcal} label="Kcal" color="#FF8303" />
                                    <NutriCircle value={item.protein} label="Proteins" color="#8BFF03" />
                                    <NutriCircle value={item.fats} label="Fats" color="#A35709" />
                                    <NutriCircle value={item.carbs} label="Carbs" color="#038CFF" />
                                </View>
                            )}
                        </View>

                        <View style = {styles.descContainer}>
                            <TouchableOpacity style = {styles.expandTitle} onPress={() => setIsDescExpanded(!isDescExpanded)}>
                                <View><Text style = {[GlobalStyles.text18, GlobalStyles.textShadow]}>Description </Text></View>
                                {isDescExpanded ? (
                                    <View><ChevDown width = {24} height = {24} fill={"#000"}/></View>
                                ):(
                                    <View><ChevUp width = {24} height = {24} fill={"#000"}/></View>
                                )}                    
                            </TouchableOpacity> 
                            {isDescExpanded && (
                                <View style = {styles.expandableContentNutri}>
                                    <Text style={GlobalStyles.text16}>{item.desc}</Text>
                                </View>
                            )}
                        </View>

                        <View style = {styles.ingredientContainer}>
                            <TouchableOpacity style = {styles.expandTitle} onPress={() => setIsIngridientsExpanded(!isIngridientsExpanded)}>
                                <View><Text style = {[GlobalStyles.text18, GlobalStyles.textShadow]}>Ingredients ({item.ingredients.length ?? 0})</Text></View>
                                {isIngridientsExpanded ? (
                                    <View><ChevDown width = {24} height = {24} fill={"#000"}/></View>
                                ):(
                                    <View><ChevUp width = {24} height = {24} fill={"#000"}/></View>
                                )}                    
                            </TouchableOpacity>
                            {isIngridientsExpanded && (
                                <View style = {styles.expandableContentIng}>
                                    {item.ingredients.map((ingredient, index) => (
                                        <View key={index} style={styles.ingRow}>
                                            <Text style={GlobalStyles.text16}>{ingredient}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style = {styles.stepsContainer}>
                            <TouchableOpacity style = {styles.expandTitle} onPress={() => setIsStepsExpanded(!isStepsExpanded)}>
                                <View><Text style = {[GlobalStyles.text18, GlobalStyles.textShadow]}>Steps ({item.steps.length ?? 0})</Text></View>
                                {isStepsExpanded ? (
                                    <View><ChevDown width = {24} height = {24} fill={"#000"}/></View>
                                ):(
                                    <View><ChevUp width = {24} height = {24} fill={"#000"}/></View>
                                )}                    
                            </TouchableOpacity>
                            {isStepsExpanded && (
                                <View style = {styles.expandableContentIng}>
                                    {item.steps.map((step, index) => (
                                        <View key={index} style={styles.stepRow}>
                                            <Text style={[GlobalStyles.text24, GlobalStyles.bold, GlobalStyles.orange]}>{index + 1}.</Text> 
                                            <Text style={[GlobalStyles.text16, styles.marginLeft]}>{step}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                            {specialClose ? (
                                <View>
                                    <View style = {styles.expander}></View>
                                    <TouchableOpacity style={[styles.hoverButton, GlobalStyles.elevated]} onPress={() => addToMeal()} >
                                        <Text style={[GlobalStyles.text16, GlobalStyles.white]}>Add to meal</Text>
                                    </TouchableOpacity>
                                </View>
                            ):(
                                <View style = {styles.expanderMini}></View>
                            )}
                    </ScrollView>                  
                </View>
                <ReportMealModal 
                    visible={reportModalVisible}
                    closeReportModal={closeReportModal}
                    item={item}
                    navigation={navigation}
                />
            </Modal>
        ) : (
            <Modal
                animationType="slide"
                visible={visible}
                onRequestClose={closeInspectModal}
                transparent={true}
            > 
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#FF8303" />
                </View>
            </Modal>
        )       
    );    
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0E3CA',
  },
  titleCont: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  titleLeft: {
    width: 40,
    alignItems: 'center',
  },
  titleMid: {
    flex: 1,
    alignItems: 'center',
  },
  titleRight: {
    width: 40,
    alignItems: 'center',
  },
  mainContentContainer: {
    flex: 1,
    backgroundColor: '#F0E3CA',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  imgContainer: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 4,
  },
  mainImg: {
    height: '100%',
    width: '100%',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  svgDescCont: {
    backgroundColor: '#F7EEDD',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  svgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  nutriContainer: {
    marginBottom: 10,
    backgroundColor: '#F7EEDD',
    borderRadius: 12,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  descContainer: {
    marginBottom: 10,
    backgroundColor: '#F7EEDD',
    borderRadius: 12,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  ingredientContainer: {
    marginBottom: 10,
    backgroundColor: '#F7EEDD',
    borderRadius: 12,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  stepsContainer: {
    marginBottom: 20,
    backgroundColor: '#F7EEDD',
    borderRadius: 12,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  expandTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandableContentNutri: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    textAlign: 'center',
    marginTop: 10,
  },
  expandableContentIng: {
    marginTop: 10,
  },
  ingRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  marginLeft: {
    marginLeft: 8,
    flex: 1,
  },
  hoverButton: {
    width: '90%',
    marginHorizontal: '5%',
    height: 50,
    backgroundColor: '#FF8303',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  expander: {
    height: 40,
  },
  expanderMini: {
    height: 40,
  },
});

export default InspectMealModal;