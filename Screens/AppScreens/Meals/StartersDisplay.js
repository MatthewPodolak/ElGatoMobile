import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import AuthService from '../../../Services/Auth/AuthService.js';

import config from '../../../Config.js';
import MealDisplayBig from '../../../Components/Meals/MealDisplayBig.js';
import InspectMealModal from '../../../Components/Meals/InspectMealModal.js';

function StartersDisplay({ navigation, route }) {
    const { requestType } = route.params || {};
    const { setIsAuthenticated } = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(true);
    const [mealData, setMealData] = useState([]);

    const [inspectModalVisible, setInspectModalVisible] = useState(false);
    const [currentlyInspectedItem, setCurrentlyInspectedItem] = useState(null);

    const NavigateBack = () => {
        navigation.goBack();
    };

    const inspectModal = (item) => {
        setCurrentlyInspectedItem(item);
        setInspectModalVisible(true);
    };

    const closeInspectModal = () => {
        setInspectModalVisible(false);
    };

    useEffect(() => {
        if (!requestType) {
            //throw error passed value not here.
            //navigate back with an error.
            return;
        }

        const fetchData = async () => {
        try{
            const token = await AuthService.getToken();
      
            if (!token || AuthService.isTokenExpired(token)) {
                await AuthService.logout(setIsAuthenticated, navigation);
                return;
            }

            let requestBody = {
                type: requestType,
                page: 1,
                pageSize: 50,
            };

            const res = await fetchWithTimeout(
                `${config.ipAddress}/api/Meal/GetExtendedStarters`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestBody),
                },
                config.timeout
              );
        
              if(!res.ok){
                //return no
                console.log('error while fetching meals data');
                return;
              }
              setMealData(await res.json());
              setIsLoading(false);
        }
        catch(error){
            //error
            console.log(error);
        }
    };

        fetchData();
    }, [requestType]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
            <View style={styles.titleCont}>
                <TouchableOpacity onPress={() => NavigateBack()} style = {styles.titleLeft}>
                    <ChevronLeft width={28} height={28} fill={"#fff"}/>
                </TouchableOpacity>
                <View style={styles.titleMid}>
                    <Text style={[GlobalStyles.bold, GlobalStyles.text22]}>
                        {requestType ?? "Error"}
                    </Text>
                </View>
                <TouchableOpacity style={styles.titleRight}>
                    
                </TouchableOpacity>
            </View>

            {isLoading ? (
            <View style={[styles.container, GlobalStyles.center]}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
            ) : (
            <ScrollView style = {styles.mainCont} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {mealData?.map((item) => (
                <TouchableOpacity
                  key={item.stringId}
                  style={styles.searchedRow}
                  onPress={() => inspectModal(item)}
                >
                  <MealDisplayBig meal={item} />
                </TouchableOpacity>
                
              ))}
            </ScrollView>
            )} 
            <InspectMealModal
                visible={inspectModalVisible}
                closeInspectModal={closeInspectModal}
                item={currentlyInspectedItem}
            >
            </InspectMealModal>        
            <NavigationMenu navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'whitesmoke',
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
      mainCont: {
        marginTop: 10,
        flex: 1,
      },
      searchedRow: {
        height: 300,
        marginBottom: 20,
      },
});

export default StartersDisplay;