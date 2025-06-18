import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';
import FollowerDisplay from '../../../Components/Community/FollowerDisplay.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import CommunityDataService from '../../../Services/ApiCalls/CommunityData/CommunityDataService.js';

function UserFollowersDisplay({ navigation }) {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);
    const { userId = null, userName = null } = route.params ?? {};  

    const [followeData, setFolloweData] = useState(null);
    const [followeDataLoading, setFolloweDataLoading] = useState(true);
    const [followeDataError, setFolloweDataError] = useState(false);

    const [activeTab, setActiveTab] = useState("Followers");

    useEffect(() => {
        getUserFollowes();
    }, []);

    const getUserFollowes = async () => {
        setFolloweDataLoading(true);
        if(!userId){ setFolloweDataLoading(false); setFolloweDataError(true); }

        try{
            const res = await CommunityDataService.getFollowedList(setIsAuthenticated, navigation, false);
            if(!res.ok){
                setFolloweDataError(true);
                return;
            }

            const data = await res.json();
            setFolloweData(data);

        }catch(error){
            setFolloweDataError(true);
        }finally{
            setFolloweDataLoading(false);
        }
    };

    const navigateBack = () => {
        navigation.goBack();
    };  

    const renderContent = () => {
        switch(activeTab){
            case "Followers":
                return (
                    <>
                        {!followeData.followers || followeData.followers.length === 0 ? (
                            <>
                                {/* EL GATO -- NO FOLLOWERS */}
                                <View style={[styles.emptyGatoContainer]}>

                                </View>
                                <View style={[GlobalStyles.center, {flex: 0.15, paddingHorizontal: 15}]}>
                                    <Text style={[GlobalStyles.text18, {textAlign: 'center'}]}><Text style={[GlobalStyles.orange]}>Goofy.</Text> There is nothing to show.</Text>
                                </View>
                            </>
                        ):(
                            <>
                                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20 }}>
                                    {followeData.followers.map((data, index) => (
                                        <FollowerDisplay 
                                            key={`${data.userId}-${index}`}
                                            data={{ 
                                                isFollowed: data.followedByAskingUser, 
                                                pfpUrl: data.pfp, 
                                                userId: data.userId, 
                                                name: data.name 
                                            }} 
                                            setIsAuthenticated={setIsAuthenticated}
                                            navigation={navigation}
                                            isPrivate={data.isPrivate}
                                            isFollowRequested={data.isRequested}
                                        />
                                    ))}
                                </ScrollView>
                            </>
                        )}
                    </>
                );
            case "Following":
                return (
                    <>
                        {!followeData.followed || followeData.followed.length === 0 ? (
                            <>
                                {/* EL GATO -- NO FOLLOWED */}
                                <View style={[styles.emptyGatoContainer]}>

                                </View>
                                <View style={[GlobalStyles.center, {flex: 0.15, paddingHorizontal: 15}]}>
                                    <Text style={[GlobalStyles.text18, {textAlign: 'center'}]}><Text style={[GlobalStyles.orange]}>Goofy.</Text> There is nothing to show.</Text>
                                </View>
                            </>
                        ):(
                            <>
                                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20 }}>
                                    {followeData.followed.map((data, index) => (
                                        <FollowerDisplay 
                                           key={`${data.userId}-${index}`}
                                            data={{ 
                                                isFollowed: data.followedByAskingUser, 
                                                pfpUrl: data.pfp, 
                                                userId: data.userId, 
                                                name: data.name 
                                            }} 
                                            setIsAuthenticated={setIsAuthenticated}
                                            navigation={navigation}
                                            isPrivate={data.isPrivate}
                                            isFollowRequested={data.isRequested}
                                        />
                                    ))}
                                </ScrollView>
                            </>
                        )}
                    </>
                );
        } 
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
        <StatusBar style="light"  backgroundColor="#FF8303" translucent={false} hidden={false} />
        
        <View style={styles.topContainer}>
            <View style={styles.topContIngBack}>
                <TouchableOpacity style={styles.topBack} onPress={navigateBack}>
                    <ChevronLeft width={28} height={28} />
                </TouchableOpacity>
            </View>
            <View style={styles.topContIngTitle}>
                <Text style={[styles.topNameText]} numberOfLines={1} ellipsizeMode="tail">{userName??""}</Text>
            </View>
            <View style={styles.topContIngReport}></View>
        </View>

        <View style={[GlobalStyles.flex]}>
           {followeDataLoading ? (
            <>
                <View style={[GlobalStyles.center, GlobalStyles.flex]}>
                    <ActivityIndicator size="large" color="#FF8303" />
                </View>
            </>
           ):(
            <>
                {followeDataError ? (
                    <>
                        {/* EL GATO -- ERROR DATA FAILED TO LOAD. */}
                        <View style={[styles.emptyGatoContainer]}>

                        </View>
                        <View style={[GlobalStyles.center, {flex: 0.15, paddingHorizontal: 15}]}>
                            <Text style={[GlobalStyles.text18, {textAlign: 'center'}]}>Something went wrong while trying to get <Text style={[GlobalStyles.orange]}>{userName ?? ""}</Text> followes. Check your internet connection.</Text>
                        </View>
                    </>
                ):(
                    <>
                        <View style={styles.categoryContainer}>
                            <TouchableOpacity style={styles.option} onPress={() => setActiveTab("Followers")} ><Text style={[styles.optionText, activeTab === "Followers" && styles.activeTab]}>Followers</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.option} onPress={() => setActiveTab("Following")} ><Text style={[styles.optionText, activeTab === "Following" && styles.activeTab]}>Following</Text></TouchableOpacity>
                        </View>

                        {renderContent()}
                    </>
                )}
            </>
           )}
        </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'whitesmoke',
  },
  emptyGatoContainer: {
    flex: 0.85,
  },
  topContainer: {
    width: '100%',
    height: 60,
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
    alignItems: 'center',
  },
  topContIngReport: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBack: {
    position: 'absolute',
    left: 10,
    height: '100%',
    justifyContent: 'center',
  },
  topNameText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    flexShrink: 1,
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
    fontSize: 16,
    fontFamily: 'Helvetica',
  },
  activeTab: {
    color: '#FF8303',
    borderBottomColor: '#FF8303', 
    borderBottomWidth: 2,
  },
});

export default UserFollowersDisplay;