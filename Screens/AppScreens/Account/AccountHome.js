import React, { useEffect, useState, useContext } from 'react';
import { View, Text,ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import AccountHeader from '../../../Components/Account/AccountHeader';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import Challange from '../../../Components/Account/Challange';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';

import CardioDataService from '../../../Services/ApiCalls/CardioData/CardioDataService';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';
import ActiveChallenge from '../../../Components/Account/ActiveChallenge';

function chunkArray(array, size) {
  const chunkedArr = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size));
  }
  return chunkedArr;
}

function AccountHome({ navigation }) {
  const { setIsAuthenticated } = useContext(AuthContext);
  const [systemType, setSystemType] = useState(null);
  const [activeTab, setActiveTab] = useState("Challenges");
  const [challActiveTab, setChallActiveTab] = useState("Browse");
  const [challengesList, setChallengesList] = useState(null);
  const [activeChallengesList, setActiveChallengesList] = useState(null);
  
  const setActiveTabFun = async (type) => {
    setActiveTab(type);
    switch(type){
      case "Challenges":
        if(challengesList?.length === 0){
          await getChallengesList();
        }
        break;
      case "Leaderboards":

        break;
      case "Friends":

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
      if(res.ok){
        setChallengesList((prevList) => [...prevList, { ...removedChallange }]);
        return;
      }
    }catch(error){
      setChallengesList((prevList) => [...prevList, { ...removedChallange }]);
    }
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
                          chunkArray(challengesList, 2).map((row, rowIndex) => (
                            <View style={[styles.challangeRow]} key={rowIndex}>
                              {row.map((challenge, challengeIndex) => (
                                <Challange
                                  key={challengeIndex}
                                  data={challenge}
                                  joinChallengeFunc={joinChallange}
                                />
                              ))}
                            </View>
                          ))
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
                
              </View>
            );
          break;
        case "Friends":
            return(
              <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                
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
    <SafeAreaView style={styles.container}>
      <AccountHeader />

      <ScrollView>
            <View style={styles.categoryContainer}>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Challenges")} ><Text style={[styles.optionText, activeTab === "Challenges" && styles.activeTab]}>Challenges</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Leaderboards")} ><Text style={[styles.optionText, activeTab === "Leaderboards" && styles.activeTab]}>Leaderboards</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Friends")} ><Text style={[styles.optionText, activeTab === "Friends" && styles.activeTab]}>Friends</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.content}>
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
  centerText: {
    textAlign: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
});

export default AccountHome;
