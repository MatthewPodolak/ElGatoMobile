import React, { useState } from 'react';
import { View, StatusBar, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import CheckIcon from '../../../assets/main/Diet/check2.svg';
import ChevronDown from '../../../assets/main/Diet/chevron-down.svg';


function AddExercise({ navigation }) { 
    const [activeTab, setActiveTab] = useState('Search');

    const navigateBack = () => {
        navigation.goBack();
    };

    const setActiveTabFun = (tab) => {
        setActiveTab(tab);
        switch(tab){
            case "Search":
                console.log("abc");
                break;
            case "Favs":
                break;
            case "New":
                break;
        }
    };

    const renderContent = () => { 
        switch(activeTab){
            case "Search":
                return(
                    <View style={GlobalStyles.flex}>
                        <View style = {styles.containerSearchBar}>
                            <View style = {styles.searchBarContainer}>
                            <View style={styles.barContainer}>
                                <TextInput
                                style={styles.searchInput}
                                selectionColor="#FF8303"
                                placeholder="Search for ..."
                                placeholderTextColor="#999"
                                />
                            </View>
                            </View>

                            <View style = {styles.filterRow}>
                            <TouchableOpacity>
                                <View style = {styles.filterContainer}>
                                <Text style = {styles.filterText}>Filters </Text>
                                <ChevronDown style={{ marginTop: 3 , marginRight: 5}} width={17} height={17} fill={'whitesmoke'} />
                                </View>
                            </TouchableOpacity>
                            </View>

                        </View>

                        <View style={GlobalStyles.flex}>

                        </View>             
                    </View>
                );
            case "Favs":
                return(
                    <Text>fav</Text>
                );
            case "New":
                return(
                    <Text>new</Text>
                );
            default:
                //error
                break;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
            <View style={styles.topContainer}>
                <View style = {styles.topContIngBack}>
                <TouchableOpacity style={styles.topBack} onPress={navigateBack}>
                    <ChevronLeft width={28} height={28} />
                </TouchableOpacity>
                </View>
                <View style = {styles.topContIngTitle}>
                    <Text numberOfLines={2} ellipsizeMode="tail" style={styles.topNameText}>Exercises</Text>
                </View>
                <View style = {styles.topContIngReport}>
                <TouchableOpacity>
                    <CheckIcon width={37} height={37} fill={'#fff'} />
                </TouchableOpacity>
                </View>
            </View>

            <View style={styles.categoryContainer}>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Search")} ><Text style={[styles.optionText, activeTab === "Search" && styles.activeTab]}>Search</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Favs")} ><Text style={[styles.optionText, activeTab === "Favs" && styles.activeTab]}>Favs</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("New")} ><Text style={[styles.optionText, activeTab === "New" && styles.activeTab]}>New</Text></TouchableOpacity>
            </View>

            {renderContent()}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
      activeTab: {
        color: '#FF8303',
        borderBottomColor: '#FF8303', 
        borderBottomWidth: 2,
        paddingBottom: 5,
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
});

export default AddExercise;