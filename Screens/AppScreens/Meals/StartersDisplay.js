import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator, FlatList  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import MealDataService from '../../../Services/ApiCalls/MealData/MealDataService.js';

import MealDisplayBig from '../../../Components/Meals/MealDisplayBig.js';
import InspectMealModal from '../../../Components/Meals/InspectMealModal.js';

function StartersDisplay({ navigation, route }) {
    const { requestType } = route.params || {};
    const { setIsAuthenticated } = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(true);
    const [mealData, setMealData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    const [inspectModalVisible, setInspectModalVisible] = useState(false);
    const [currentlyInspectedItem, setCurrentlyInspectedItem] = useState(null);

    const [isFetchingMore, setIsFetchingMore] = useState(false);

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

    const handleScrollEnd = () => {
        if (!isFetchingMore) {
            const nextPage = currentPage + 1;
            setIsFetchingMore(true);
            setCurrentPage(nextPage);
            fetchData(nextPage);
        }
    };
    

    const fetchData = async (nextPage) => {
        try{

            let requestBody = {
                type: requestType,
                page: nextPage,
                pageSize: pageSize,
            };

            const res = await MealDataService.GetExtendedStarters(setIsAuthenticated, navigation, requestBody);
        
              if(!res.ok){
                //return no
                console.log('error while fetching meals data');
                return;
              }
              
              const newItems = await res.json();
              setMealData((prevItems) => [...prevItems, ...newItems]);
              setIsLoading(false);
              setIsFetchingMore(false);
        }
        catch(error){
            //error
            console.log(error);
        }
    };

    useEffect(() => {
        if (!requestType) {
            //throw error passed value not here.
            //navigate back with an error.
            return;
        }    

        fetchData(1);
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
                <FlatList
                style={styles.mainCont}
                data={mealData}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={[styles.searchedRow, index === 0 && { marginTop: 10 }]}
                        onPress={() => inspectModal(item)}
                    >
                        <MealDisplayBig meal={item} navigation={navigation} />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.stringId}
                onEndReached={() => handleScrollEnd()}
                onEndReachedThreshold={0.7}
                ListFooterComponent={isFetchingMore && (
                    <View style={[styles.fetchMoreContainer, GlobalStyles.center]}>
                        <ActivityIndicator size="small" color="#FF8303" />
                    </View>
                )}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
            )} 
            <InspectMealModal
                visible={inspectModalVisible}
                closeInspectModal={closeInspectModal}
                item={currentlyInspectedItem}
                navigation={navigation}
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
        flex: 1,
      },
      searchedRow: {
        height: 300,
        marginBottom: 20,
      },
      fetchMoreContainer: {
        minHeight: 100,
      },
});

export default StartersDisplay;