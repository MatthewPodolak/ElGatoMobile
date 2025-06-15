import React, { useEffect, useState, useContext } from 'react';
import { View, Text,ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import AccountHeader from '../../../Components/Account/AccountHeader';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import Challange from '../../../Components/Account/Challange';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import FollowerDisplay from '../../../Components/Community/FollowerDisplay.js'
import LeaderboardDisplay from '../../../Components/Community/LeaderboardDisplay.js';

import CardioDataService from '../../../Services/ApiCalls/CardioData/CardioDataService';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';
import ActiveChallenge from '../../../Components/Account/ActiveChallenge';

import ChevronDown from '../../../assets/main/Diet/chevron-down.svg';
import ChevronUp from '../../../assets/main/Diet/chevron-up.svg';
import CommunityDataService from '../../../Services/ApiCalls/CommunityData/CommunityDataService.js';

function chunkArray(array, size) {
  const chunkedArr = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size));
  }
  return chunkedArr;
}

function AccountHome({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [systemType, setSystemType] = useState(null);
  const [activeTab, setActiveTab] = useState("Challenges");
  const [challActiveTab, setChallActiveTab] = useState("Browse");
  const [leaderboardsActiveTab, setLeaderboardsActiveTab] = useState("Friends");
  const [challengesList, setChallengesList] = useState(null);
  const [activeChallengesList, setActiveChallengesList] = useState(null);

  const [followedLoading, setFollowedLoading] = useState(false);
  const [followedList, setFollowedList] = useState(null);
  const [followedError, setFollowedError] = useState(null);

  const [achievmentTypeDropdownVisible, setAchievmentTypeDropdownVisible] = useState(false);
  const [selectedAchievmentType, setSelectedAchievmentType] = useState("Calories");
  const [achievmentPeriodDropdownVisible, setAchievmentPeriodDropdownVisible] = useState(false);
  const [selectedAchievmentPeriod, setSelectedAchievmentPeriod] = useState("All"); 

  const [leaderboardList, setLeaderboardList] = useState(null);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [isLeaderboardDataLoading, setIsLeaderboardDataLoading] = useState(false);

  const setActiveTabFun = async (type) => {
    setActiveTab(type);
    switch(type){
      case "Challenges":
        if(challengesList?.length === 0){
          await getChallengesList();
        }
        break;
      case "Leaderboards":
        if(leaderboardList?.length === 0 || !leaderboardList){
          await getLeaderboardList();
        }
        break;
      case "Friends":
        if(followedList?.length === 0 || !followedList){
          await getFollowedList();
        }
        break;
    }
  };

  const setChallActiveTabFun = async (type) => {
    setChallActiveTab(type);
    switch(type){
      case "Browse":
        if(challengesList?.length === 0){
          await getChallengesList();
        }
        break;
      case "Active":
        if(!activeChallengesList){
          await getActiveChallenges();
        }
        break;
    }
  };

  useEffect(() => {
      if(!challengesList){
        getChallengesList();
      }

      getUserSystemType();
  }, []);

  const getUserSystemType = async () => {
    try{
      const res = await UserDataService.getUserWeightType(setIsAuthenticated, navigation);
      if (typeof res === "string") {
        setSystemType(res);
      } else if (res && res.ok) {
        const data = await res.json();
        setSystemType(data);
      } else {
        setSystemType("metric");
      }
    }catch(error){
      setSystemType("metric");
    }
  }

  const getLeaderboardList = async () => {
    try{
      setIsLeaderboardDataLoading(true);

      const res = await CommunityDataService.getFriendsLeaderboard(setIsAuthenticated, navigation);
      if(!res.ok){
        setLeaderboardError(true);
        setLeaderboardList(null);
        return;
      }

      const data = await res.json();
      setLeaderboardList(data);

    }catch(error){
      setLeaderboardError(true);
    }finally{
      setIsLeaderboardDataLoading(false);
    }
  };

  const getFollowedList = async () => {
    try{
      setFollowedLoading(true);
      const res = await CommunityDataService.getFollowedList(setIsAuthenticated, navigation);
      if(!res.ok){
        console.log("Error while trying to get followed list.");
        setFollowedError(true);
        return;
      }

      const data = await res.json();
      setFollowedList(data);

    }catch(error){
      setFollowedError(true);
    }finally{
      setFollowedLoading(false);
    }
  };

  const getChallengesList = async () => {
    try{
      const res = await CardioDataService.getActiveChallenges(setIsAuthenticated, navigation);
      if(!res.ok){
        setChallengesList([]);
      }

      const data = await res.json();
      setChallengesList(data);

    }catch(error){
      setChallengesList([]);
    }
  };

  const getActiveChallenges = async () => {
    try{
      const res = await CardioDataService.getCurrentlyActiveChallanges(setIsAuthenticated, navigation);
      if(!res.ok){
        setActiveChallengesList([]);
        return;
      }

      const data = await res.json();
      setActiveChallengesList(data);

    }catch(error){
      setActiveChallengesList([]);
    }
  };

  const joinChallange = async (challengeId) => {
    let removedChallange = challengesList.find(a=>a.id === challengeId);
    setChallengesList((prevList) => prevList.filter(a => a.id !== challengeId));

    try{
      const res = await CardioDataService.joinChallenge(setIsAuthenticated, navigation, challengeId);
      if(!res.ok){
        setChallengesList((prevList) => [...prevList, { ...removedChallange }]);
        return;
      }

      await getActiveChallenges();
    }catch(error){
      setChallengesList((prevList) => [...prevList, { ...removedChallange }]);
    }
  };

  const setAchievmentDropdownVisible = (type) => {
    switch(type){
      case "period":
        setAchievmentPeriodDropdownVisible(v => !v);
        setAchievmentTypeDropdownVisible(false);
        return;
       case "type":
        setAchievmentTypeDropdownVisible(v => !v);
        setAchievmentPeriodDropdownVisible(false);
        return;
    };
  };

  const leaderboardErrorGen = () => {
    return (
      <>
        <View style={styles.emptyGatoContainer}>

        </View>
        <View style={[styles.centerText, {marginTop: -50}]}>
          <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Looks like nothing here! Step up your game and do your <Text style={[GlobalStyles.orange]}>work</Text>. You might also need to invite some friends...</Text>
        </View>
      </>
    );
  };

  const getSelectedFriendsLeaderboard = () => {
    const boards = leaderboardList?.leaderboards;
    if (!boards) {
      return leaderboardErrorGen();
    }

    let periodKey = selectedAchievmentPeriod.toLowerCase(); 

    switch(selectedAchievmentType){
      case "Calories":
        const calorieBoards = boards.find(b => b.type === 0);
        if (!calorieBoards) {
          return leaderboardErrorGen();
        }

        periodKey = selectedAchievmentPeriod.toLowerCase(); 
        const calorieItems = calorieBoards[periodKey] || [];
        if (calorieItems.length === 0) {
          return leaderboardErrorGen();
        }

        return calorieItems.map((entry, idx) => (
          <View key={entry.leaderboardPosition}  style={{ marginTop: idx === 0 ? 12 : 0 }}>
            <LeaderboardDisplay 
              data={entry}
              type={calorieBoards.type}
              isMetric={systemType === "metric"}
              navigation={navigation} 
            />
          </View>
        ));

      case "Activity":
        const activityBoards = boards.find(b => b.type === 1);
        if (!activityBoards) {
          return leaderboardErrorGen();
        }

        periodKey = selectedAchievmentPeriod.toLowerCase(); 
        const activityBoardItems = activityBoards[periodKey] || [];
        if (activityBoardItems.length === 0) {
          return leaderboardErrorGen();
        }

        return activityBoardItems.map((entry, idx) => (
          <View key={entry.leaderboardPosition}  style={{ marginTop: idx === 0 ? 12 : 0 }}>
            <LeaderboardDisplay 
              data={entry}
              type={activityBoards.type}
              isMetric={systemType === "metric"} 
              navigation={navigation}
            />
          </View>        
        ));

        break;
      case "Steps":
        const stepsBoards = boards.find(b => b.type === 2);
        if (!stepsBoards) {
          return leaderboardErrorGen();
        }

        periodKey = selectedAchievmentPeriod.toLowerCase(); 
        const stepsBoardsItems = stepsBoards[periodKey] || [];
        if (stepsBoardsItems.length === 0) {
          return leaderboardErrorGen();
        }

        return stepsBoardsItems.map((entry, idx) => (
          <View key={entry.leaderboardPosition}  style={{ marginTop: idx === 0 ? 12 : 0 }}>
            <LeaderboardDisplay 
              data={entry}
              type={stepsBoards.type}
              isMetric={systemType === "metric"} 
              navigation={navigation}
            />
          </View>
        ));

        break;
      case "Running":
        const runningBoards = boards.find(b => b.type === 3);
        if (!runningBoards) {
          return leaderboardErrorGen();
        }

        periodKey = selectedAchievmentPeriod.toLowerCase(); 
        const runningBoardsItems = runningBoards[periodKey] || [];
        if (runningBoardsItems.length === 0) {
          return leaderboardErrorGen();
        }

        return runningBoardsItems.map((entry, idx) => (
          <View key={entry.leaderboardPosition}  style={{ marginTop: idx === 0 ? 12 : 0 }}>
            <LeaderboardDisplay 
              data={entry}
              type={runningBoards.type}
              isMetric={systemType === "metric"} 
              navigation={navigation}
            />
          </View>
        ));

        break;
      case "Swimming":
        const swimmingBoards = boards.find(b => b.type === 4);
        if (!swimmingBoards) {
          return leaderboardErrorGen();
        }

        periodKey = selectedAchievmentPeriod.toLowerCase(); 
        const swimmingBoardsItems = swimmingBoards[periodKey] || [];
        if (swimmingBoardsItems.length === 0) {
          return leaderboardErrorGen();
        }

        return swimmingBoardsItems.map((entry, idx) => (
          <View key={entry.leaderboardPosition}  style={{ marginTop: idx === 0 ? 12 : 0 }}>
            <LeaderboardDisplay 
              data={entry}
              type={swimmingBoards.type}
              isMetric={systemType === "metric"} 
              navigation={navigation}
            />
          </View>
        ));

        break;
    };    
  };

  const renderContent = () => { 
    switch(activeTab){
        case "Challenges":
            return(
              <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                <View style={styles.categoryContainer}>
                  <TouchableOpacity style={styles.option} onPress={() => setChallActiveTabFun("Browse")} ><Text style={[styles.optionTextSecondary, challActiveTab === "Browse" && styles.activeTab]}>Browse</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.option} onPress={() => setChallActiveTabFun("Active")} ><Text style={[styles.optionTextSecondary, challActiveTab === "Active" && styles.activeTab]}>Active</Text></TouchableOpacity>
                </View>
                {challActiveTab === "Browse" ? (
                  <>
                    {challengesList ? (
                      <>
                        {challengesList?.length === 0 ? (
                          <>
                          {/**GATO - EMPTY */}
                          <View style={styles.emptyGatoContainer}>

                          </View>
                          <View style={styles.centerText}>
                            <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>There are currently no new <Text style={[GlobalStyles.orange]}>challenges.</Text> Come back later!</Text>
                          </View>
                        </>
                        ):(
                          <>
                            {chunkArray(challengesList, 2).map((row, rowIndex) => (
                              <View style={[styles.challangeRow]} key={rowIndex}>
                                {row.map((challenge, challengeIndex) => (
                                  <Challange
                                    key={challengeIndex}
                                    data={challenge}
                                    joinChallengeFunc={joinChallange}
                                  />
                                ))}
                              </View>
                            ))}
                            <View style={[{height: 30}]}></View>
                          </>
                        )}                
                      </>
                    ):(
                      <>
                        <View style={[GlobalStyles.flex, GlobalStyles.center, {height: 550}]}>
                          <ActivityIndicator size="large" color="#FF8303" />
                        </View>
                      </>
                    )}
                  </>
                ):(
                  <>
                    {activeChallengesList && systemType ? (
                      <>
                        <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                          {activeChallengesList.length === 0 ? (
                            <>
                              {/**GATO - EMPTY */}
                              <View style={styles.emptyGatoContainer}>

                              </View>
                              <View style={styles.centerText}>
                                <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>You are not participiting in any <Text style={[GlobalStyles.orange]}>challenges</Text> yet!</Text>
                              </View>
                            </>
                          ):(
                            <>
                              <View style={[GlobalStyles.flex, {flexDirection: 'column', marginTop: 10, marginBottom: 20}]}>
                                {activeChallengesList.map((challenge, challengeIndex) => (
                                  <ActiveChallenge key={challengeIndex} data={challenge} system={systemType}/>
                                ))}
                              </View>
                            </>
                          )}
                        </View>
                      </>
                    ):(
                      <>
                        <View style={[GlobalStyles.flex, GlobalStyles.center, {height: 550}]}>
                          <ActivityIndicator size="large" color="#FF8303" />
                        </View>
                      </>
                    )}
                  </>
                )}
              </View>
            );
          break;
        case "Leaderboards":
            return(
              <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                <View style={styles.categoryContainer}>
                  <TouchableOpacity style={styles.option} onPress={() => setLeaderboardsActiveTab("Friends")} ><Text style={[styles.optionTextSecondary, leaderboardsActiveTab === "Friends" && styles.activeTab]}>Friends</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.option} onPress={() => setLeaderboardsActiveTab("Global")} ><Text style={[styles.optionTextSecondary, leaderboardsActiveTab === "Global" && styles.activeTab]}>Global</Text></TouchableOpacity>
                </View>
                {leaderboardsActiveTab  === "Friends" ? (
                  <>
                    <View style={styles.leaderboardsDropdownContainer}>
                      <TouchableOpacity style={styles.dropdownContainer} onPress={() => setAchievmentDropdownVisible("type")}>
                        <Text style={[GlobalStyles.text14]}>Type</Text>
                        {achievmentTypeDropdownVisible ? (
                          <ChevronUp width={16} height={16} fill={'#000'} />
                        ):(
                          <ChevronDown width={16} height={16} fill={'#000'} />
                        )}
                      </TouchableOpacity>   
                      <TouchableOpacity style={styles.dropdownContainer} onPress={() => setAchievmentDropdownVisible("period")}>
                        <Text style={[GlobalStyles.text14]}>Period</Text>
                        {achievmentPeriodDropdownVisible ? (
                          <ChevronUp width={16} height={16} fill={'#000'} />
                        ):(
                          <ChevronDown width={16} height={16} fill={'#000'} />
                        )}
                      </TouchableOpacity>                      
                    </View>
                    {achievmentTypeDropdownVisible && (
                      <View style={styles.dropdownMenu}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 15 }}>
                          {['Calories', 'Activity', 'Steps', 'Running', 'Swimming'].map(option => {
                            const isSelected = option === selectedAchievmentType;
                            return (
                              <TouchableOpacity
                                key={option}
                                onPress={() => {setAchievmentDropdownVisible("type"), setSelectedAchievmentType(option)}}
                                style={[styles.dropdownOption, isSelected]}
                              >
                                <Text style={[GlobalStyles.text14, isSelected && { color: '#FF8303', fontWeight: 'bold' }]}>
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                    {achievmentPeriodDropdownVisible && (
                      <View style={styles.dropdownMenu}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 15 }}>
                          {['All', 'Year', 'Month', 'Week'].map(option => {
                            const isSelected = option === selectedAchievmentPeriod;
                            return (
                              <TouchableOpacity
                                key={option}
                                onPress={() => {setAchievmentDropdownVisible("period"), setSelectedAchievmentPeriod(option)}}
                                style={[styles.dropdownOption, isSelected]}
                              >
                                <Text style={[GlobalStyles.text14, isSelected && { color: '#FF8303', fontWeight: 'bold' }]}>
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}

                    <View style={[GlobalStyles.flex]}>
                      {isLeaderboardDataLoading ? (
                        <View style={[GlobalStyles.flex, GlobalStyles.center, {height: 550}]}>
                          <ActivityIndicator size="large" color="#FF8303" />
                        </View>
                      ):(
                        <>
                          {leaderboardError ? (
                            <View style={[GlobalStyles.center, GlobalStyles.flex]}>
                                {/**GATO - leaderboards DATA LIST ERROR. */}
                                <View style={styles.emptyGatoContainerShort}>

                                </View>
                                <View style={styles.centerText}>
                                  <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Something went wrong while trying to retrive leaderboards <Text style={[GlobalStyles.orange]}>data</Text>. Check your internet connection.</Text>
                                </View>
                                {achievmentPeriodDropdownVisible || achievmentTypeDropdownVisible && (
                                  <View style={[{height: 20}]}></View>
                                )}
                            </View>
                          ):(
                            <>
                              {(!leaderboardList || leaderboardList.length === 0) ? (
                                <View style={[GlobalStyles.center, GlobalStyles.flex]}>
                                  {/**GATO - leaderboard DATA LIST EMPTYYY. */}
                                  <View style={styles.emptyGatoContainerShort}>

                                  </View>
                                  <View style={styles.centerText}>
                                    <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Unfortunately there is not much to show. Invite some <Text style={[GlobalStyles.orange]}>friends</Text> and check again later.</Text>
                                  </View>
                                  {achievmentPeriodDropdownVisible || achievmentTypeDropdownVisible && (
                                    <View style={[{height: 20}]}></View>
                                  )}
                                </View>
                              ):(
                                <>
                                  <ScrollView style={[GlobalStyles.flex]} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                                    {getSelectedFriendsLeaderboard()}
                                  </ScrollView>
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </View>
                  </>
                ):(
                  <>
                    <View style={[GlobalStyles.center, GlobalStyles.flex]}>
                      <>
                        {/**GATO - FEATURE NOT AVB. (yet(never)) */}
                        <View style={styles.emptyGatoContainer}>

                        </View>
                        <View style={styles.centerText}>
                          <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>This feature is currently not <Text style={[GlobalStyles.orange]}>avaliable</Text>. It will come back as soon as possible.</Text>
                        </View>
                      </>
                    </View>
                  </>
                )}
              </View>
            );
          break;
        case "Friends":
            return(
              <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                {followedLoading ? (
                  <>
                    <View style={[GlobalStyles.flex, GlobalStyles.center, {height: 550}]}>
                        <ActivityIndicator size="large" color="#FF8303" />
                    </View>
                  </>
                ):(
                  <>
                    {followedError ? (
                      <>
                        {/**GATO - FRIENDS DATA LIST ERROR. */}
                        <View style={styles.emptyGatoContainer}>

                        </View>
                        <View style={[styles.centerText, {marginTop: 25}]}>
                            <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Something went wrong while trying to retrive <Text style={[GlobalStyles.orange]}>friends</Text>. Check your internet connection.</Text>
                        </View>
                      </>
                    ):(
                      <>
                      {(!followedList || followedList.length === 0) ? (
                        <>
                          {/**GATO - FRIENDS DATA LIST ERROR. */}
                          <View style={styles.emptyGatoContainer}>

                          </View>
                          <View style={[styles.centerText, {marginTop: 25}]}>
                              <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>You are not following anyone currently. Invite some <Text style={[GlobalStyles.orange]}>friends</Text> and make your journey better.</Text>
                          </View>
                        </>
                      ):(
                         <>
                          <ScrollView style={[GlobalStyles.flex]} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                            {followedList.followed.map((user, index) => (
                              <View key={user.userId} style={{ marginTop: index === 0 ? 10 : 0 }}>
                                <FollowerDisplay
                                  data={{
                                    name: user.name,
                                    pfpUrl: user.pfpUrl,
                                    isFollowed: user.isFollowed,
                                    userId: user.userId,
                                  }}
                                  setIsAuthenticated={setIsAuthenticated}
                                  navigation={navigation}
                                />
                              </View>
                            ))}
                          </ScrollView>
                        </>
                      )}
                      </>
                    )}
                  </>
                )}
              </View>
            );
          break;
        default:
          return(
            <View style={[styles.errorView, GlobalStyles.center]}>
              {/**EL GATO ERROR VIEW - TODO */}
              <Text>EL GATO ERROR VIEW</Text>
            </View>
          );
          break;
    }
};

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
      <StatusBar style="light"  backgroundColor="#FF8303" translucent={false} hidden={false} />

      <AccountHeader navigation={navigation}/>

      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryContainer}>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Challenges")} ><Text style={[styles.optionText, activeTab === "Challenges" && styles.activeTab]}>Challenges</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Leaderboards")} ><Text style={[styles.optionText, activeTab === "Leaderboards" && styles.activeTab]}>Leaderboards</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Friends")} ><Text style={[styles.optionText, activeTab === "Friends" && styles.activeTab]}>Friends</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
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
  content: {
    flex: 1,
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
  optionTextSecondary: {
    fontSize: 14,
    fontFamily: 'Helvetica',
  },
  activeTab: {
    color: '#FF8303',
    borderBottomColor: '#FF8303', 
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  errorView: {
    minHeight: 600,
    width: '100%',
  },

  challangeRow: {
    flexDirection: 'row',
    marginTop: 10,
    flex: 1,
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'stretch', 
  },
  emptyGatoContainer: {
    minHeight: 500,
  },
  emptyGatoContainerShort: {
    minHeight: 470,
  },
  centerText: {
    textAlign: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },

  leaderboardsDropdownContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  dropdownContainer: {
    marginTop: 15,
    marginLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    position: 'relative',
  },

  dropdownMenu: {
    backgroundColor: 'whitesmoke',
    width: '100%',
    flexDirection: 'row',
    marginTop: 10,
  },
  dropdownOption: {

  },
});

export default AccountHome;
