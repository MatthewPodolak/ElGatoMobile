import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,Image, StatusBar, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';
import basePfp from '../../../assets/userPfpBase.png';

import MealDisplayBig from '../../../Components/Meals/MealDisplayBig.js';
import CardioTrainingDayDisplay from '../../../Components/Training/CardioTrainingDayDisplay.js';
import BestLiftDisplay from '../../../Components/Training/BestLiftDisplay.js';
import RecentLiftDisplay from '../../../Components/Training/RecentLiftDisplay.js';
import StatisticsDisplay from '../../../Components/Community/StatisticsDisplay.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import SettingsSvg from '../../../assets/main/Diet/settings.svg';
import DotsSvg from '../../../assets/main/Diet/dots.svg';
import LockedSvh from '../../../assets/main/Diet/lock.svg';

import CommunityDataService from '../../../Services/ApiCalls/CommunityData/CommunityDataService.js';
import MealDataService, { getUserRecipesData } from '../../../Services/ApiCalls/MealData/MealDataService.js';

function ProfileDisplay({ navigation }) {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);
    const { userId = null } = route.params ?? {};
    const [isOwn, setIsOwn] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isPrivate, setIsPrivated] = useState(false);
    const [isRequested, setIsRequested] = useState(false);
    const [userPfp, setUserPfp] = useState(basePfp);
    const [measureType, setMeasureType] = useState("metric");

    const [initialSynced, setInitialSynced] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [profileDataLoading, setProfileDataLoading] = useState(false);
    const [profileDataError, setProfileDataError] = useState(false);

    const [recipeData, setRecipeData] = useState(null);
    const [currentRecipeCount, setCurrentRecipeCount] = useState(15);
    const [recipeDataLoading, setRecipeDataLoading] = useState(false);
    const [recipeDataError, setRecipeDataError] = useState(false);

    const [activeTab, setActiveTab] = useState("Stats");
    const [statsTab, setStatsTab] = useState("Basic");
    const [liftsTab, setLiftsTab] = useState("Recent lifts");
    const [activitiesTab, setActivitiesTab] = useState("Recent activities");

    useEffect(() => {
      if(profileData && !initialSynced){
        setIsPrivated(profileData?.generalProfileData?.isPrivate);
        setIsFollowed(profileData?.generalProfileData?.isFollowed);
        setIsRequested(profileData?.generalProfileData?.isRequested);
        setIsOwn(profileData?.generalProfileData?.isOwn);

        if(profileData?.generalProfileData?.pfp){
          setUserPfp({uri: `http://192.168.0.143:5094${profileData.generalProfileData.pfp}`});
        }
        setInitialSynced(true);
      }
    }, [profileData]);

    useEffect(() => {
      getMeasureType();

      if(!profileData){
        getProfileData();
      }
    }, []);

    useEffect(() => {
      if(activeTab === "Recipes"){
        if(!recipeData){
          getRecipeData(25, 0);
        }
      }
    }, [activeTab]);

    const getProfileData = async () => {
      setProfileDataLoading(true);
      setProfileDataError(false);

      try{
        const res = await CommunityDataService.getProfileData(setIsAuthenticated, navigation, userId);
        if(!res.ok){
          setProfileDataError(true);
          return;
        }

        const data = await res.json();
        setProfileData(data);

      }catch(error){
        setProfileDataError(true);
      }finally{
        setProfileDataLoading(false);
      }
    };

    const getMeasureType = async () => {
      try{
        const res = await UserDataService.getUserWeightType(setIsAuthenticated, navigation);
        const data = await res.json();
        setMeasureType(data);
      }catch(error){
        setMeasureType("metric");
      }
    };

    const getRecipeData = async (count, skip) => {
      setRecipeDataLoading(true);
      setRecipeDataError(false);

      try{
        const res = await MealDataService.getUserRecipesData(setIsAuthenticated, navigation, userId??null, count, skip);
        if(!res.ok){
          setRecipeDataError(true);
          return;
        }

        const data = await res.json();
        setRecipeData(data);
      }catch(error){
        setRecipeDataError(true);
      }finally{
        setRecipeDataLoading(false);
      }
    };

    /*BUTTON BEHVS - TOP PROFILE */
    const updateFollowerCount = delta => {
      setProfileData(prev => ({
        ...prev,
        generalProfileData: {
          ...prev.generalProfileData,
          followersCounter: prev.generalProfileData.followersCounter + delta,
        },
      }));
    };

    const unfollowPressed = async () => {
      if(userId == null){ return; }

      setIsFollowed(false);
      updateFollowerCount(-1);

      try{
        const res = await CommunityDataService.unfollowUser(setIsAuthenticated, navigation, userId);
        if(!res.ok){
          setIsFollowed(true);
          updateFollowerCount(1);
          return;
        }
      }catch(error){
        setIsFollowed(true);
        updateFollowerCount(1);
      }
    };

    const followPressed = async () => {
      if(userId == null){ return; }

      if(isPrivate){
        setIsRequested(true);
      }else{
        updateFollowerCount(1);
        setIsFollowed(true);
      }

      try{
        const res = await CommunityDataService.followUser(setIsAuthenticated, navigation, userId);
        if(!res.ok){
          if(isPrivate){
            setIsRequested(false);
          }else{
            updateFollowerCount(-1);
            setIsFollowed(false);
          }
          return;
        }
      }catch(error){
        if(isPrivate){
          setIsRequested(false);
        }else{
          updateFollowerCount(-1);
          setIsFollowed(false);
        }
      }
    };

    const removeFollowRequest = async () => {
      if(userId == null){ return; }

      setIsRequested(false);
      try{
        const res = await CommunityDataService.withdrawFollowRequest(setIsAuthenticated, navigation, userId);
        if(!res.ok){
          setIsRequested(true);
          return;
        }
      }catch(error){
        setIsRequested(true);
      }
    }

    /* END OF BTN BEHVS */

    const navigateBack = () => {
        navigation.goBack();
    };

    const renderContent = () => {
      switch(activeTab){
        case "Stats":
          return (
            <>
              {statsTab === "Basic" ? (
                <>
                  {(!profileData?.privateProfileInformation?.statistics || Object.keys(profileData.privateProfileInformation.statistics).length === 0) ? (
                    <>
                      <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                        {/* GATO ERROR - 0 STATS */}
                        <View style={styles.emptyGatoContainerSmall}>
                                
                        </View>
                        <View style={GlobalStyles.center}>
                            <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Upsss... something went wrong while trying to get <Text style={[GlobalStyles.orange]}>{profileData?.generalProfileData?.name ?? "user"}</Text> statistics. Check your internet connection.</Text>
                        </View>
                      </View>
                    </>
                  ):(
                    <>
                      <View style={[GlobalStyles.flex, {marginTop: -15}]}>
                        {Object.entries(profileData?.privateProfileInformation?.statistics || {}).map(([key, item]) => (
                          <StatisticsDisplay key={key} statisticsData={item} measureType={measureType} basic={true} label={key} />
                        ))}
                      </View>
                    </>
                  )}
                </>
              ):(
                <>
                  {(!profileData?.privateProfileInformation?.cardioStatistics?.activities || profileData.privateProfileInformation.cardioStatistics.activities.length === 0) ? (
                    <>
                      <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                        {/* GATO ERROR - 0 STATS */}
                        <View style={styles.emptyGatoContainerSmall}>
                                
                        </View>
                        <View style={GlobalStyles.center}>
                            <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Upsss... something went wrong while trying to get <Text style={[GlobalStyles.orange]}>{profileData?.generalProfileData?.name ?? "user"}</Text> statistics. Check your internet connection.</Text>
                        </View>
                      </View>
                    </>
                  ):(
                    <>
                      <View style={[GlobalStyles.flex, {marginTop: -15}]}>
                        {profileData.privateProfileInformation.cardioStatistics.activities.map((item, key) => (
                          <StatisticsDisplay key={key} statisticsData={item} measureType={measureType} basic={false}/>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}
            </>
          );
          break;
        case "Activities":
          return (
            <>
              {activitiesTab === "Recent activities" ? (
                <>
                  {(profileData?.privateProfileInformation?.recentCardioActivities.length === 0 || !profileData?.privateProfileInformation?.recentCardioActivities) ? (
                    <>
                      <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                        {/* GATO EMPTY - 0 CARDIO ACTIVITIES */}
                        <View style={styles.emptyGatoContainerSmall}>
                                
                        </View>
                        <View style={GlobalStyles.center}>
                            <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Looks like <Text style={[GlobalStyles.orange]}>{profileData?.generalProfileData?.name ?? "user"}</Text> didn't accomplished any trainings yet. Which is kinda sad for sure.</Text>
                        </View>
                      </View>
                    </>
                  ):(
                    <>
                      <View style={[GlobalStyles.flex, {marginTop: -15}]}>
                        {profileData?.privateProfileInformation?.recentCardioActivities?.map((item, key) => (
                          <CardioTrainingDayDisplay key={key} exercise={{ exerciseData: item }} measureType={measureType} profile={true}/>
                        ))}
                      </View>
                    </>
                  )}
                </>
              ):(
                <>
                  {(profileData?.privateProfileInformation?.bestCardioActivities.length === 0 || !profileData?.privateProfileInformation?.bestCardioActivities) ? (
                    <>
                      <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                        {/* GATO NULL - 0 BEST CARDIO ACTIVITIES */}
                        <View style={styles.emptyGatoContainerSmall}>
                                
                        </View>
                        <View style={GlobalStyles.center}>
                            <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Looks like <Text style={[GlobalStyles.orange]}>{profileData?.generalProfileData?.name ?? "user"}</Text> didn't accomplished any trainings yet. Which is kinda sad for sure.</Text>
                        </View>
                      </View>
                    </>
                  ):(
                    <>
                      <View style={[GlobalStyles.flex, {marginTop: -15}]}>
                        {profileData?.privateProfileInformation?.bestCardioActivities?.map((item, key) => (
                          <CardioTrainingDayDisplay key={key} exercise={{ exerciseData: item }} measureType={"metric"} profile={true}/>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}             
            </>
          );
          break;
        case "Lifts":
          return (
            <>
              {liftsTab === "Best lifts" ? (
                <>
                  {(profileData?.privateProfileInformation?.bestLifts.length === 0 || !profileData?.privateProfileInformation?.bestLifts) ? (
                    <>
                      <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                        {/* GATO EMPTY - 0 BEST LIFTS */}
                        <View style={styles.emptyGatoContainerSmall}>
                                    
                        </View>
                        <View style={GlobalStyles.center}>
                          <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Looks like <Text style={[GlobalStyles.orange]}>{profileData?.generalProfileData?.name ?? "user"}</Text> does not lift. At least for now.</Text>
                        </View>
                      </View>
                    </>
                  ):(
                    <>
                      <View style={[GlobalStyles.flex, {marginTop: -15}]}>
                        {profileData?.privateProfileInformation?.bestLifts?.map((item, key) => (
                          <BestLiftDisplay key={key} liftData={item} measureType={measureType}/>
                        ))}
                      </View>
                    </>
                  )}
                </>
              ):(
                <>
                  {(profileData?.privateProfileInformation?.recentLiftActivities.length === 0 || !profileData?.privateProfileInformation?.recentLiftActivities) ? (
                    <>
                      <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                        {/* GATO EMPTY - 0 RECENT LIFTS */}
                        <View style={styles.emptyGatoContainerSmall}>
                                    
                        </View>
                        <View style={GlobalStyles.center}>
                          <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Looks like <Text style={[GlobalStyles.orange]}>{profileData?.generalProfileData?.name ?? "user"}</Text> does not lift. At least for now.</Text>
                        </View>
                      </View>
                    </>
                  ):(
                    <>
                      <View style={[GlobalStyles.flex, {marginTop: -15}]}>
                        {profileData?.privateProfileInformation?.recentLiftActivities?.map((item, key) => (
                          <RecentLiftDisplay key={key} liftData={item} measureType={measureType}/>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}
            </>
          );
          break;
        case "Recipes":
          return (
            <>
              {recipeDataLoading ? (
                <>
                  <View style={[GlobalStyles.flex, GlobalStyles.center, {height: 350}]}>
                    <ActivityIndicator size="large" color="#FF8303" />
                  </View>
                </>
              ):(
                <>
                  {recipeDataError ? (
                    <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                      {/* GATO ERROR - INTERNET RECIPES */}
                      <View style={styles.emptyGatoContainerSmall}>
                  
                      </View>
                      <View style={GlobalStyles.center}>
                        <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Something went wrong while trying to load <Text style={[GlobalStyles.orange]}>recipes</Text>. Check your internet connection.</Text>
                      </View>
                    </View>
                  ):(
                    <>
                      {(!recipeData || recipeData.length === 0) ? (
                        <>
                          <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                            {/* GATO EMPTY - 0 RECIPES */}
                            <View style={styles.emptyGatoContainerSmall}>
                        
                            </View>
                            <View style={GlobalStyles.center}>
                              <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Looks like <Text style={[GlobalStyles.orange]}>{profileData?.generalProfileData?.name ?? "user"}</Text> didn't post any recipes yet.</Text>
                            </View>
                          </View>
                        </>
                      ):(
                        <>
                          <View style={styles.recipesContentContainer}>
                            {recipeData?.map((item, key) => (
                              <TouchableOpacity style={styles.recipesItemRow} key={key}>
                                <MealDisplayBig meal={item} navigation={navigation} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          );
          break;
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

            </View>
            <View style={styles.topContIngReport}>
                {isOwn ? (
                    <SettingsSvg width={28} height={28} fill="#FFF" />
                ):(
                    <DotsSvg width={24} height={24} fill="#FFF" />
                )}
            </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
          {profileDataLoading ? (
            <>
              <View style={[GlobalStyles.flex, GlobalStyles.center, {height: 650}]}>
                <ActivityIndicator size="large" color="#FF8303" />
              </View>
            </>
          ):(
            <>
              {(profileDataError || !profileData) ? (
                <>
                  <View style={[GlobalStyles.center, GlobalStyles.flex]}>
                    {/**GATO - PROFILE DATA NOT LOADED -- ERROR */}
                    <View style={styles.emptyGatoContainer}>
                  
                    </View>
                    <View style={GlobalStyles.center}>
                      <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Something went wrong while trying to load <Text style={[GlobalStyles.orange]}>profile</Text>. Check your internet connection.</Text>
                    </View>
                  </View>
                </>
              ):(
                <>
                  <View style={styles.generalDataContainer}>
                    <View style={styles.topRow}>
                      <View style={styles.avatarContainer}>
                        <Image
                          source={userPfp}
                          style={styles.avatar}
                        />
                      </View>

                      <View style={styles.infoContainer}>
                        <Text style={styles.username}>{profileData?.generalProfileData?.name}</Text>

                        <View style={styles.countsContainer}>
                          <View style={styles.countItem}>
                            <Text style={styles.countNumber}>{profileData?.generalProfileData?.followersCounter}</Text>
                            <Text style={styles.countLabel}>Followers</Text>
                          </View>
                          <View style={styles.countItem}>
                            <Text style={styles.countNumber}>{profileData?.generalProfileData?.followedCounter}</Text>
                            <Text style={styles.countLabel}>Following</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.</Text>
                    </View>

                    <View style= {styles.followButtonContainer}>
                      {isOwn ? (
                        <TouchableOpacity>
                          <View style={[styles.editProfileButton, GlobalStyles.center]}><Text style={[GlobalStyles.text14, GlobalStyles.orange]}>Edit profile</Text></View>
                        </TouchableOpacity>
                      ):(
                        <>
                          {isFollowed ? (
                            <TouchableOpacity onPress={() => unfollowPressed()}>
                              <View style={[styles.editProfileButton, GlobalStyles.center]}><Text style={[GlobalStyles.text14, GlobalStyles.orange]}>Unfollow</Text></View>
                            </TouchableOpacity>
                          ):(
                            <>
                              {isRequested ? (
                                <TouchableOpacity onPress={() => removeFollowRequest()}>
                                  <View style={[styles.editProfileButton, GlobalStyles.center]}><Text style={[GlobalStyles.text14, GlobalStyles.orange]}>Remove follow request</Text></View>
                                </TouchableOpacity>
                              ):(
                                <>
                                  <TouchableOpacity onPress={() => followPressed()}>
                                    <View style={[styles.filledButton, GlobalStyles.center]}><Text style={[GlobalStyles.text14, GlobalStyles.white]}>Follow</Text></View>
                                  </TouchableOpacity>
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </View>

                  </View>
                </>
              )}
            </>
          )}           

          {(isPrivate && !isFollowed) ? (
            <>
              <View style={[GlobalStyles.center, GlobalStyles.flex,GlobalStyles.center]}>
                <LockedSvh width={256} height={256} fill="#999F" opacity={0.3} marginTop={50} marginBottom={75}/>
                <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>This user account is <Text style={[GlobalStyles.orange]}>private</Text>.</Text>
              </View>
            </>
          ):(
            <>
              <View style={styles.categoryContainer}>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTab("Stats")} ><Text style={[styles.optionText, activeTab === "Stats" && styles.activeTab]}>Stats</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTab("Activities")} ><Text style={[styles.optionText, activeTab === "Activities" && styles.activeTab]}>Activities</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTab("Lifts")} ><Text style={[styles.optionText, activeTab === "Lifts" && styles.activeTab]}>Lifts</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTab("Recipes")} ><Text style={[styles.optionText, activeTab === "Recipes" && styles.activeTab]}>Recipes</Text></TouchableOpacity>
              </View>
              {(activeTab === "Stats" || activeTab === "Lifts" || activeTab === "Activities") && (
                <>
                  {activeTab === "Stats" ? (
                    <>
                      <View style={styles.categoryContainerSecondary}>
                        <TouchableOpacity style={styles.option} onPress={() => setStatsTab("Basic")} ><Text style={[styles.optionTextSecondary, statsTab === "Basic" && styles.activeTabSecondary]}>Basic</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => setStatsTab("Activities")} ><Text style={[styles.optionTextSecondary, statsTab === "Activities" && styles.activeTabSecondary]}>Activities</Text></TouchableOpacity>
                      </View>
                    </>
                  ) : activeTab === "Lifts" ? (
                    <>
                      <View style={styles.categoryContainerSecondary}>
                        <TouchableOpacity style={styles.option} onPress={() => setLiftsTab("Recent lifts")} ><Text style={[styles.optionTextSecondary, liftsTab === "Recent lifts" && styles.activeTabSecondary]}>Recent lifts</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => setLiftsTab("Best lifts")} ><Text style={[styles.optionTextSecondary, liftsTab === "Best lifts" && styles.activeTabSecondary]}>Best lifts</Text></TouchableOpacity>
                      </View>
                    </>
                  ) : activeTab === "Activities" ? (
                    <>
                      <View style={styles.categoryContainerSecondary}>
                        <TouchableOpacity style={styles.option} onPress={() => setActivitiesTab("Recent activities")} ><Text style={[styles.optionTextSecondary, activitiesTab === "Recent activities" && styles.activeTabSecondary]}>Recent activities</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => setActivitiesTab("Best activities")} ><Text style={[styles.optionTextSecondary, activitiesTab === "Best activities" && styles.activeTabSecondary]}>Best activities</Text></TouchableOpacity>
                      </View>
                    </>
                  ) : null}
                </>
              )}

            </>
          )}

          <ScrollView style={{flex: 1, padding: 15}} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              {renderContent()}
          </ScrollView>

        </ScrollView>

        <NavigationMenu navigation={navigation} currentScreen="AccountHome" />
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
    minHeight: 600,
  },
  emptyGatoContainerSmall: {
    minHeight: 400,
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

  categoryContainer: {
    marginTop: 15,
    width: '100%',
    flexDirection: 'row',
  },
  categoryContainerSecondary:{
    marginTop: 5,
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
  optionTextSecondary: {
    fontSize: 14,
    fontFamily: 'Helvetica',
  },
  activeTab: {
    color: '#FF8303',
    borderBottomColor: '#FF8303', 
    borderBottomWidth: 2,
  },
  activeTabSecondary:{
    color: '#FF8303',
  },

  generalDataContainer: {
    flex: 1,
    padding: 18,
    borderBottomColor: '#999',
    borderBottomWidth: 0.4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginRight: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Helvetica',
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  countItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  countNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
  },
  countLabel: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Helvetica',
  },
  descriptionContainer: {
    paddingTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Helvetica',
  },
  editProfileButton: {
    marginTop: 10,
    height: 30,
    borderRadius: 15,
    backgroundColor: "whitesmoke",
    borderColor: '#FF8303',
    borderWidth: 1,
  },
  filledButton: {
    marginTop: 10,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF8303",
    borderColor: '#FF8303',
    borderWidth: 1,
  },

  recipesContentContainer: {
    flex: 1,
    marginTop: 5,
  },
  recipesItemRow: {
    height: 300,
    marginBottom: 5,
  },
  fetchMoreContainer: {
    minHeight: 100,
  },
});

export default ProfileDisplay;