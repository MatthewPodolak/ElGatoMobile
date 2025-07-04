import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator ,Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';

function AddWeight({ navigation }) {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);
    const { system = "metric" } = route.params ?? {};

    const [inputValue, setInputValue] = useState('');
    const [inputErrorMsgVisible, setInputErrorMsgVisible] = useState(false);

    const [addWeightLoading, setAddWeightLoading] = useState(false);

    const addWeightValue = async () => {
        setAddWeightLoading(true);
        setInputErrorMsgVisible(false);

        const normalized = inputValue.replace(',', '.').trim();
        if (normalized === '' || isNaN(Number(normalized))) {
            setInputErrorMsgVisible(true);
            setAddWeightLoading(false);
            return;
        }

        const floatVal = parseFloat(normalized);
        if (floatVal <= 0) {
            setInputErrorMsgVisible(true);
            setAddWeightLoading(false);
            return;
        }

        let model;
        const now = new Date();
        const currentDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T00:00:00.000+00:00`;

        if(system === "metric"){
            model = {
                date: currentDate,
                weightMetric: normalized
            };
        }else{
            model = {
                date: currentDate,
                weightImperial: normalized
            }
        }

        if(!model){
            setInputErrorMsgVisible(true);
            setAddWeightLoading(false);
        }

        const res = await UserDataService.addWeightForToday(setIsAuthenticated, navigation, model);
        if(!res.ok){
            setInputErrorMsgVisible(true);
            setAddWeightLoading(false);
            return;
        }

        setAddWeightLoading(false);
        navigateBack();
    };


    const navigateBack = () => {
        navigation.goBack();
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
                <Text style={[styles.topNameText]}>add measurment</Text>
            </View>
            <View style={styles.topContIngReport}></View>
        </View>

        <View style={[GlobalStyles.flex, {flexGrow: 1, alignItems: 'center'}]}>
            <View style={styles.visibilityRow}>
                <TextInput
                    value={inputValue}
                    onChangeText={setInputValue}
                    keyboardType="numeric"
                    style={styles.numericInput}
                    autoFocus
                    selectionColor="#FF6600"
                />
                <Text style={[GlobalStyles.orange, GlobalStyles.text32, GlobalStyles.textShadow]}>{system === "metric" ? "Kg" : "Lbs"}</Text>
            </View>
            {inputErrorMsgVisible && (
                <Text style= {[GlobalStyles.red, GlobalStyles.text14]}>Invalid input.</Text>
            )}

            <TouchableOpacity onPress={() => addWeightValue()} style={[styles.optionButton, {position: 'absolute', bottom: 30}]}>
                {addWeightLoading ? (
                    <ActivityIndicator size="small" color="whitesmoke" />
                ):(
                    <Text style={[GlobalStyles.text16, GlobalStyles.white]}>add weight measurment</Text>
                )}
            </TouchableOpacity>
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
    minHeight: 650,
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

  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 3,
    width: '90%',
    backgroundColor: '#FF8303',
    marginBottom: 10,
  },
  visibilityRow:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 5,
    gap: 5,
  },
  numericInput: {
    width: '80%',
    height: 70,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingVertical: 8,
    fontSize: 32,
    textAlign: 'center',
    color: '#ff6600'
  },
});

export default AddWeight;