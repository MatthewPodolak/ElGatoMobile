import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator ,Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';
import basePfp from '../../../assets/userPfpBase.png';
import FollowerDisplay from '../../../Components/Community/FollowerDisplay.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import CommunityDataService from '../../../Services/ApiCalls/CommunityData/CommunityDataService.js';

function FollowerRequestsDisplay({ navigation }) {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);
    const { userId = null, initialRequests = null } = route.params ?? {};

    const [requestsData, setRequestsData] = useState(initialRequests);

    const onRequestDecission = async (decission = 0, requestId, requestingUserId) => {
        if(!requestId || !requestingUserId){
            return;
        }

        let model = {
            requestId: requestId,
            requestingUserId: requestingUserId,
            decision: decission
        };

        const request = requestsData.find(a=>a.requestId == requestId);
        setRequestsData(prev => prev.filter(req => req.requestId !== requestId));

        try{
            const res = await CommunityDataService.respondToFollowRequest(setIsAuthenticated, navigation, model);
            if(!res.ok){
                setRequestsData(prev => [...prev, request]);
                return;
            }
        }catch(error){
            setRequestsData(prev => [...prev, request]);
        }
    };

    const navigateBack = () => {
        navigation.navigate('ProfileDisplay', { shouldRefresh: true });
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
                <Text style={[styles.topNameText]}>Follow requests</Text>
            </View>
            <View style={styles.topContIngReport}></View>
        </View>

        <View style={[GlobalStyles.flex]}>
            {!requestsData || requestsData.length === 0 ? (
                <>
                    {/* EL GATO -- EMPTY NO REQUESTS */}
                    <View style={[styles.emptyGatoContainer]}>

                    </View>
                    <View style={[GlobalStyles.center, {flex: 0.15, paddingHorizontal: 15}]}>
                        <Text style={[GlobalStyles.text18, {textAlign: 'center'}]}>Looks like there are no pending <Text style={[GlobalStyles.orange]}>requests</Text> right now. Make some friends. Preferablly outside.</Text>
                    </View>
                </>
            ):(
                <>
                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20 }}>
                        {requestsData.map((data, index) => (
                            <FollowerDisplay 
                                key={data.requestId || index} 
                                data={{ 
                                    isFollowed: false, 
                                    pfpUrl: data.pfp, 
                                    userId: data.userId, 
                                    name: data.name 
                                }} 
                                setIsAuthenticated={setIsAuthenticated}
                                navigation={navigation}
                                isRequest={true}
                                onRequestDecission={onRequestDecission}
                                requestId={data.requestId}
                            />
                        ))}
                    </ScrollView>
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
  },

  
});

export default FollowerRequestsDisplay;