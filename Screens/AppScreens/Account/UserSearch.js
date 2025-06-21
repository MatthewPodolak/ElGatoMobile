import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, TextInput, ActivityIndicator, Image, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import CommunityDataService from '../../../Services/ApiCalls/CommunityData/CommunityDataService.js';

function UserSearch({ navigation }) {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);
    const { initialQuery = null, initialData = null } = route.params ?? {};
    const typingTimeoutRef = useRef(null);
    const [initialLoaded, setInitialLoaded] = useState(false);

    const [searchData, setSearchData] = useState(initialData);
    const [searchDataLoading, setSearchLoading] = useState(false);
    const [searchDataError, setSearchDataError] = useState(false);

    const [searchText, setSearchText] = useState(initialQuery??"");
    const [searchQuery, setSearchQuery] = useState(initialQuery??"");

    const [loadingMore, setIsLoadingMore] = useState(false);
    const [currentLimit, setCurrentLimit] = useState(5);

    useEffect(() => {
        if (initialQuery && initialData.users?.length === 5) {
            setCurrentLimit(10);
            onSearch(initialQuery, 10, true);
        }
    }, []);

    const onChangeSearchText = text => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        setSearchText(text);

        typingTimeoutRef.current = setTimeout(() => {
            onSearch(text, !initialLoaded);
        }, 500);
    };

    const onSearch = async (query, limit = 10, isInitial = false) => {
        if(!query || query === "") { setInitialLoaded(false); setSearchQuery(""); setSearchData(null); return; }      
        setSearchQuery(query);
        setSearchLoading(true);

        try{
            const res = await CommunityDataService.searchForUsers(setIsAuthenticated, navigation, query, limit);
            if(!res.ok){
                setSearchData(null);
                setSearchLoading(false);
                return;
            }

            const data = await res.json();
            setSearchData(data);          

        }catch(error){
            setSearchData(null);
        }finally{
            setSearchLoading(false);
            setIsLoadingMore(false);
            if(isInitial){ setInitialLoaded(true); }
        }
    };

    const loadMore = async () => {
      if(searchData.users?.length === currentLimit){
        setIsLoadingMore(true);
        setCurrentLimit(20);
        await onSearch(searchQuery, 20, false);
      }
    }

    const goToUserProfile = (userId) => {
        if(!userId) { return; }

        navigation?.push('ProfileDisplay', {
            userId: userId
        });
    };

    const navigateBack = () => {
        navigation.goBack();
    };  

   return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={{ height: insets.top, backgroundColor: "#FF8303", zIndex: 10 }} />
      <StatusBar backgroundColor="#FF8303" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.contentContainer}>
          <TouchableOpacity style={styles.leftContainer} onPress={navigateBack}>
            <ChevronLeft width={28} height={28} fill="#FFF" />
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={onChangeSearchText}
            placeholderTextColor="rgba(255,255,255,0.7)"
            autoFocus
            selectionColor="#FF8303"
          />

          <View style={styles.rightContainer}></View>
        </View>
      </View>

      <View style={GlobalStyles.flex}>
        {searchDataLoading ? (
            <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
        ) : (
            <>
               {!searchData || searchData?.users.length === 0 ? (
                    <>
                        {initialLoaded ? (
                            <>
                                <View style={[styles.emptyGatoContainer]}>

                                </View>
                                <View style={[styles.emptyGatoTextContainer, GlobalStyles.center, GlobalStyles.padding15]}>
                                    <Text style={[GlobalStyles.text18, {textAlign: 'center'}]}>Huh, we couldn’t find any results for{" "}<Text style={GlobalStyles.orange}>{searchQuery && searchQuery.trim().length > 0 ? searchQuery : "that phrase"}</Text>. Mind trying something else? </Text>
                                </View>
                            </>
                        ):(
                            <></>
                        )}
                    </>
                ):(
                    <>
                        <FlatList
                          data={searchData?.users || []}
                          keyExtractor={(user, idx) => user.userId + "_" + idx}
                          contentContainerStyle={{ gap: 10, paddingHorizontal: 15 }}
                          showsVerticalScrollIndicator={false}
                          showsHorizontalScrollIndicator={false}
                          renderItem={({ item }) => (
                            <TouchableOpacity style={styles.searchedUserContainer} onPress={() => goToUserProfile(item.userId)}>
                              <View style={styles.searchedUserPfpContainer}>
                                <Image
                                  source={item.pfp ? { uri: `http://192.168.0.143:5094${item.pfp}` } : require('../../../assets/userPfpBase.png')}
                                  style={styles.searchedUserPfp}
                                />
                              </View>
                              <Text style={[GlobalStyles.text16, GlobalStyles.bold]}>
                                {item.name ?? ""}
                              </Text>
                              <View style={styles.userHr} />
                            </TouchableOpacity>
                          )}
                          onEndReached={loadMore}
                          onEndReachedThreshold={0.5}
                          ListFooterComponent={
                            loadingMore ? <ActivityIndicator size="small" color="#FF8303" style={[{marginBottom: 20}]} /> : null
                          }
                        />
                    </>
                )}
            </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, 
  },
  header: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF8303',
    justifyContent: 'center',
    paddingHorizontal: 15,
    zIndex: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFF',
  },
  emptyGatoContainer: {
    flex: 0.85,
  },
  emptyGatoTextContainer: {
    flex: 0.15,
  },

   searchedUserContainer: {
    width: '100%',
    minHeight: 65,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  userHr: {
    borderBottomColor: 'black',
    opacity: 0.2,
    borderBottomWidth: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  searchedUserPfpContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10, 
    justifyContent: 'center',
  },
  searchedUserPfp: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
});


export default UserSearch;