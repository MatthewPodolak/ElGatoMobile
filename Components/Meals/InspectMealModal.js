import React, { useState } from 'react';

import { Modal, View,StyleSheet, TouchableOpacity, Text, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles.js';
import NutriCircle from '../../Components/Main/NutriCircle.js';
import ReportMealModal from './ReportMealModal.js';

import ChevUp from '../../assets/main/Diet/chevron-up.svg';
import ChevDown from '../../assets/main/Diet/chevron-down.svg';
import ReportIcon from '../../assets/main/Diet/flag-fill.svg';
import ChevronLeft from '../../assets/main/Diet/chevron-left.svg';

const InspectMealModal = ({
    visible,
    closeInspectModal,
    item,
  }) => {

    const mainDishImage = item && item.img ? { uri: `http://192.168.0.143:5094${item.img}` } : require('../../assets/recepieBaseImage.png');
    const userPfp = item && item.creatorPfp ? { uri: `http://192.168.0.143:5094${item.creatorPfp}` } : require('../../assets/userPfpBase.png');

    const [isNutriExpanded, setIsNutriExpanded] = useState(true);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isStepsExpanded, setIsStepsExpanded] = useState(true);
    const [isIngridientsExpanded, setIsIngridientsExpanded] = useState(true);

    const [reportModalVisible, setReportModalVisible] = useState(false);

    const closeReportModal = () => {
        setReportModalVisible(false);
    };
    const openReportModal = () => {
        setReportModalVisible(true);
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
                        <TouchableOpacity style={styles.titleMid}>
                            <Text style={[GlobalStyles.bold, GlobalStyles.text22]}>
                                @{item.creatorName ?? "Unknown"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.titleRight} onPress={() => openReportModal()}>
                            <ReportIcon width={26} height={26} fill={"#fff"}/>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.mainContentContainer} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                        <View style={styles.imgContainer}>
                            <ImageBackground imageStyle={{ borderRadius: 25 }} source={mainDishImage} style={styles.mainImg} />
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={[GlobalStyles.text22, GlobalStyles.bold]}> {item.name} </Text>
                        </View>
                        <View style = {styles.svgDescCont}>
                            <View style = {styles.svgRow}>
                                <Text style={[GlobalStyles.text18]}>Portions: </Text>
                                <Text style={GlobalStyles.text18}>12</Text>
                            </View>
                            <View style = {styles.svgRow}>
                                <Text style={[GlobalStyles.text18]}>Est time: </Text>
                                <Text style={GlobalStyles.text18}>{item.time}</Text>
                            </View>
                            <View style = {styles.svgRow}>
                                <Text style={[GlobalStyles.text18]}>Difficulty: </Text>
                                <Text style={[GlobalStyles.text18, { color: item.difficulty === "Easy" ? "#8BFF03" : item.difficulty === "Medium" ? "#FF8303" : "red" }]}>
                                    {item.difficulty}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.nutriContainer}>
                            <TouchableOpacity style = {styles.expandTitle} onPress={() => setIsNutriExpanded(!isNutriExpanded)}>
                            <View>
                                <Text style={[GlobalStyles.text18]}>
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
                                <View><Text style = {[GlobalStyles.text18]}>Description </Text></View>
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
                                <View><Text style = {[GlobalStyles.text18]}>Ingredients </Text></View>
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
                                            <Text>{index + 1}.</Text> 
                                            <Text style={GlobalStyles.text16}>{ingredient}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style = {styles.stepsContainer}>
                            <TouchableOpacity style = {styles.expandTitle} onPress={() => setIsStepsExpanded(!isStepsExpanded)}>
                                <View><Text style = {[GlobalStyles.text18]}>Steps </Text></View>
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

                        <View style = {styles.expander}></View>
                    </ScrollView>                  
                </View>
                <ReportMealModal 
                    visible={reportModalVisible}
                    closeReportModal={closeReportModal}
                    item={item}
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
    expander: {
        height: 100,
    },
    container: {
        flex: 1,
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
    mainContentContainer: {
        flex: 1,
        backgroundColor: '#F0E3CA',
        padding: 10,
    },
    imgContainer: {
        height: 250,
        borderRadius: 25,
        backgroundColor: 'red',
    },
    mainImg: {
        height: '100%',
        width: '100%',
    },
    nameContainer: {
        padding: 5,
    },
    svgDescCont: {
        flexDirection: 'column',
        padding: 5,
    },
    svgRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        paddingHorizontal: 5,
        marginTop: 5,
    },
    nutriContainer: {
        flexDirection: 'column',
        paddingVertical: 10,
    },
    descContainer: {
        paddingVertical: 10,
    },
    ingredientContainer: {
        paddingVertical: 10,
    },
    stepsContainer:{
        paddingVertical: 10,
    },
    expandTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        paddingHorizontal: 5,
        marginTop: 5,
    },
    expandableContentNutri: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
    },
    expandableContentIng: {
        flexDirection: 'column',
        paddingVertical: 15,
        padding: 5,
    },
    ingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stepRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    marginLeft: {
        marginLeft: 10,
    }
});

export default InspectMealModal;
