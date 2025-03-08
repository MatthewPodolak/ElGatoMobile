import React, { useEffect, useState, useContext } from 'react';
import { ActivityIndicator, View, SafeAreaView, Text } from 'react-native';

import { MakroMenuStyles } from '../../Styles/Components/MakroMenuStyles.js';
import { AuthContext } from '../../Services/Auth/AuthContext.js';

import UserDataService from '../../Services/ApiCalls/UserData/UserDataService.js';

function MakroMenu({ CalorieCounter, navigation }) {
    const { setIsAuthenticated } = useContext(AuthContext);

    const [kcal, setKcal] = useState(0);
    const [protein, setProtein] = useState(0);
    const [fat, setFat] = useState(0);
    const [carbs, setCarbs] = useState(0);

    const [currentKcal, setCurrentKcal] = useState(0);
    const [currentProtein, setCurrentProtein] = useState(0);
    const [currentFat, setCurrentFat] = useState(0);
    const [currentCarbs, setCurrentCarbs] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {         
        const fetchFromApi = async () => {
            try{
                const calorieInfromation = await UserDataService.getUserCaloriesIntake(setIsAuthenticated, navigation);
                if(calorieInfromation){
                    const data = calorieInfromation;

                    setKcal(data.kcal);
                    setCarbs(data.carbs);
                    setFat(data.fats);
                    setProtein(data.protein);

                    setLoading(false);
                }else{
                    setLoading(true);
                    throw "Could'nt connect to the database, try again later.";
                }
            }catch(error){
                setLoading(true);
                throw "Could'nt connect to the database, try again later." + error;
            }
        };
    
        const fetchData = async () => {
            try {
                await fetchFromApi();
            } catch (error) {
                //error
                console.log('Failed ...' + error);
            }
        };
    
        const getEatenMakro = async () => {
            if (CalorieCounter != null) {
                setCurrentKcal(CalorieCounter.kcal !== undefined ? Number(CalorieCounter.kcal.toFixed(0)) : 0);
                setCurrentCarbs(CalorieCounter.carbs !== undefined ? Number(CalorieCounter.carbs.toFixed(0)) : 0);
                setCurrentFat(CalorieCounter.fats !== undefined ? Number(CalorieCounter.fats.toFixed(0)) : 0);
                setCurrentProtein(CalorieCounter.protein !== undefined ? Number(CalorieCounter.protein.toFixed(0)) : 0);
            } else {
                setCurrentKcal(0);
                setCurrentCarbs(0);
                setCurrentFat(0);
                setCurrentProtein(0);
            }
        };
    
        fetchData();
        getEatenMakro();
    
    }, [CalorieCounter]);
    

    if(loading){
        return (
        <SafeAreaView style={MakroMenuStyles.makroMenuContainer}>
            <View style={MakroMenuStyles.makroMenuItemLoad}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
            <View style={MakroMenuStyles.makroMenuItemLoad}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
            <View style={MakroMenuStyles.makroMenuItemLoad}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
            <View style={MakroMenuStyles.makroMenuItemLoad}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
        </SafeAreaView>
        );
    }

    const calculateProgress = (current, total) => {
        if (total === 0) return { progress: 0, overflowProgress: 0 };
        
        let progress = (current / total) * 100;
        let overflowProgress = 0;

        if (progress > 100) {
            overflowProgress = progress - 100;
            progress = 100;
            if (overflowProgress > 100) {
                overflowProgress = 100;
            }
        }
        
        return { progress, overflowProgress };
    };

    const { progress: kcalProgress, overflowProgress: kcalOverflowProgress } = calculateProgress(currentKcal, kcal);
    const { progress: proteinProgress, overflowProgress: proteinOverflowProgress } = calculateProgress(currentProtein, protein);
    const { progress: fatProgress, overflowProgress: fatOverflowProgress } = calculateProgress(currentFat, fat);
    const { progress: carbsProgress, overflowProgress: carbsOverflowProgress } = calculateProgress(currentCarbs, carbs);

    return(
        <SafeAreaView style={MakroMenuStyles.makroMenuContainer}>     
            <View style={MakroMenuStyles.makroMenuItem}>
                <View style={MakroMenuStyles.progressBarWrapper}>
                    <View style={MakroMenuStyles.progressBarContainer}>
                        <View style={[MakroMenuStyles.progressBar, { width: `${kcalProgress}%` }, MakroMenuStyles.orange]} />
                        {kcalOverflowProgress > 0 && (
                            <View style={[MakroMenuStyles.progressBar, { width: `${kcalOverflowProgress}%` }, MakroMenuStyles.red]} />
                        )}
                    </View>
                </View>
                <View style={MakroMenuStyles.currentValueContainer}>
                    <Text style={MakroMenuStyles.mainText} >Kcal: <Text style={MakroMenuStyles.bold}>{currentKcal}</Text></Text>
                </View>
                <View style={MakroMenuStyles.totalValueContainer}>
                    <Text style={MakroMenuStyles.secondaryText}>/ {kcal} k.</Text>
                </View>
            </View>
            <View style={MakroMenuStyles.makroMenuItem}>
                <View style={MakroMenuStyles.progressBarWrapper}>
                    <View style={MakroMenuStyles.progressBarContainer}>
                        <View style={[MakroMenuStyles.progressBar, { width: `${proteinProgress}%` }, MakroMenuStyles.blue]} />
                        {proteinOverflowProgress > 0 && (
                            <View style={[MakroMenuStyles.progressBar, { width: `${proteinOverflowProgress}%` }, MakroMenuStyles.red]} />
                        )}
                    </View>
                </View>
                <View style={MakroMenuStyles.currentValueContainer}>
                    <Text style={MakroMenuStyles.mainText}>Protein: <Text style={MakroMenuStyles.bold}>{currentProtein}</Text></Text>
                </View>
                <View style={MakroMenuStyles.totalValueContainer}>
                    <Text style={MakroMenuStyles.secondaryText}>/ {protein} g</Text>
                </View>
            </View>
            <View style={MakroMenuStyles.makroMenuItem}>
                <View style={MakroMenuStyles.progressBarWrapper}>
                    <View style={MakroMenuStyles.progressBarContainer}>
                        <View style={[MakroMenuStyles.progressBar, { width: `${fatProgress}%` }, MakroMenuStyles.darkorange]} />
                        {fatOverflowProgress > 0 && (
                            <View style={[MakroMenuStyles.progressBar, { width: `${fatOverflowProgress}%` }, MakroMenuStyles.red]} />
                        )}
                    </View>
                </View>
                <View style={MakroMenuStyles.currentValueContainer}>
                    <Text style={MakroMenuStyles.mainText}>Fat: <Text style={MakroMenuStyles.bold}>{currentFat}</Text></Text>
                </View>
                <View style={MakroMenuStyles.totalValueContainer}>
                    <Text style={MakroMenuStyles.secondaryText}>/ {fat} g</Text>
                </View>
            </View>
            <View style={MakroMenuStyles.makroMenuItem}>
                <View style={MakroMenuStyles.progressBarWrapper}>
                    <View style={MakroMenuStyles.progressBarContainer}>
                        <View style={[MakroMenuStyles.progressBar, { width: `${carbsProgress}%` }, MakroMenuStyles.purple]} />
                        {carbsOverflowProgress > 0 && (
                            <View style={[MakroMenuStyles.progressBar, { width: `${carbsOverflowProgress}%` }, MakroMenuStyles.red]} />
                        )}
                    </View>
                </View>
                <View style={MakroMenuStyles.currentValueContainer}>
                    <Text style={MakroMenuStyles.mainText}>Carbs: <Text style={MakroMenuStyles.bold}>{currentCarbs}</Text></Text>
                </View>
                <View style={MakroMenuStyles.totalValueContainer}>
                    <Text style={MakroMenuStyles.secondaryText}>/ {carbs} g</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default MakroMenu;
