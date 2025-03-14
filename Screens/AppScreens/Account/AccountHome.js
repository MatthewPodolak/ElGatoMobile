import React, { useEffect, useState } from 'react';
import { View, Text,ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import AccountHeader from '../../../Components/Account/AccountHeader';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import Challange from '../../../Components/Account/Challange';

import CardioDataService from '../../../Services/ApiCalls/CardioData/CardioDataService';

function chunkArray(array, size) {
  const chunkedArr = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size));
  }
  return chunkedArr;
}

function AccountHome({ navigation }) {
  const [activeTab, setActiveTab] = useState("Challenges");
  const [challengesList, setChallengesList] = useState(null);
  
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

  useEffect(() => {
      if(!challengesList){
        getChallengesList();
      }
  }, []);

  const getChallengesList = async () => {
    try{
      const res = await CardioDataService.getActiveChallenges();
      if(!res.ok){
        setChallengesList([]);
      }

      const data = await res.json();
      setChallengesList(data);

    }catch(error){
      setChallengesList([]);
    }
  };

  const renderContent = () => { 
    switch(activeTab){
        case "Challenges":
            return(
              <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                {challengesList ? (
                  <>
                    {challengesList?.length === 0 ? (
                      <>
                        <View style={[styles.challangeRow]}>

                        </View>
                      </>
                    ):(
                      chunkArray(challengesList, 2).map((row, rowIndex) => (
                        <View style={[styles.challangeRow]} key={rowIndex}>
                          {row.map((challenge, challengeIndex) => (
                            <Challange
                              key={challengeIndex}
                              data={challenge}
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
  
});

export default AccountHome;
