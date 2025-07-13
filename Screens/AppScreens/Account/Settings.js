import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';
import AuthService from '../../../Services/Auth/AuthService.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import ChevronRight from '../../../assets/main/Diet/chevron-right.svg';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';

const sections = [
  {
    title: 'General',
    data: ['Preferred database', 'Calorie intake', 'Measurement system'],
  },
  {
    title: 'Data',
    data: ['Private information', 'Export data', 'Clear my data'],
  },,
  {
    title: 'Community',
    data: ['Blocked people'],
  },
  {
    title: 'Account',
    data: ['Change email', 'Change password', 'Delete account', 'Logout'],
  },
];

function Settings({ navigation }) {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated } = useContext(AuthContext);

  const [actionRequired, setActionRequired] = useState(false);
  const [actionType, setActionType] = useState(null);

  const navigateBack = () => navigation.goBack();

  const handlePress = async (item) => {
    if(item === "Logout") { await AuthService.logout(setIsAuthenticated); return; }

    setActionRequired(true);
    setActionType(item);
  };

  const renderActionContent = () => {
    switch(actionType){
        case "Preferred database":

            break;
        case "Calorie intake":

            break;
        case "Measurement system":

            break;
        case "Private information":

            break;
        case "Export data":

            break;
        case "Clear my data":

            break;
        case "Blocked people":

            break;
        case "Change email":

            break;
        case "Change password":

            break;
        case "Delete account":

            break;
        
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>  
      <View style={{ height: insets.top, backgroundColor: '#FF8303' }} />
      <StatusBar barStyle="light-content" backgroundColor="#FF8303" />

      <View style={styles.topContainer}>
        <TouchableOpacity style={styles.topBack} onPress={navigateBack}>
          <ChevronLeft width={28} height={28} />
        </TouchableOpacity>
        <Text style={styles.topNameText}>{actionType ? actionType : "Settings"}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {actionRequired ? (
            <>
                {renderActionContent()}
            </>
        ):(
            <>
                {sections.map(({ title, data }) => (
                <View key={title} style={styles.sectionContainer}>
                    <Text style={[styles.sectionHeader, GlobalStyles.bold]}>{title}</Text>
                    {data.map((item) => (
                    item === 'Logout' ? (
                        <TouchableOpacity
                        key={item}
                        style={[styles.item, styles.logoutItem, styles.logoutCentered]}
                        onPress={() => handlePress(item)}
                        >
                        <Text style={styles.logoutText}>Log out</Text>
                        </TouchableOpacity>
                    ) : (item === 'Clear my data' || item === 'Delete account') ? (
                        <TouchableOpacity
                        key={item}
                        style={styles.item}
                        onPress={() => handlePress(item)}
                        >
                        <Text style={[GlobalStyles.text16, GlobalStyles.red]}>{item}</Text>
                        <ChevronRight width={20} height={20} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                        key={item}
                        style={styles.item}
                        onPress={() => handlePress(item)}
                        >
                        <Text style={GlobalStyles.text16}>{item}</Text>
                        <ChevronRight width={20} height={20} />
                        </TouchableOpacity>
                    )
                    ))}
                </View>
                ))}
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  topContainer: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  topBack: {
    marginRight: 10,
  },
  topNameText: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginRight: 28,
  },
  listContent: {
    padding: 15,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Helvetica',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    fontFamily: 'Helvetica',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }
      : {
          elevation: 2,
        }),
  },
  logoutItem: {
    backgroundColor: '#FF8303',
  },
  logoutText: {
    color: '#000',
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  logoutCentered: {
    justifyContent: 'center',
  },
});

export default Settings;