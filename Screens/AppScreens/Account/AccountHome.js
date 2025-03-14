import React, { useState } from 'react';
import { View, Text,ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import AccountHeader from '../../../Components/Account/AccountHeader';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import Challange from '../../../Components/Account/Challange';


function AccountHome({ navigation }) {
  const [activeTab, setActiveTab] = useState("Challanges");
  
  const setActiveTabFun = (type) => {


    setActiveTab(type);
  };

  const renderContent = () => { 
    switch(activeTab){
        case "Challanges":
            return(
              <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                <View style={[styles.challangeRow]}>
                  <Challange />
                  <Challange />
                </View>
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
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Challanges")} ><Text style={[styles.optionText, activeTab === "Challanges" && styles.activeTab]}>Challanges</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Leaderboards")} ><Text style={[styles.optionText, activeTab === "Leaderboards" && styles.activeTab]}>Leaderboards</Text></TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => setActiveTabFun("Friends")} ><Text style={[styles.optionText, activeTab === "Friends" && styles.activeTab]}>Friends</Text></TouchableOpacity>
            </View>
            <View style={styles.content}>
              {renderContent()}
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
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
