import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, SafeAreaView, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';

function MakroMenu({ CalorieCounter }) {

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
        const fetchFromLiteSql = async () => {
            const db = await SQLite.openDatabaseAsync('ElGatoDbLite');
    
            try {
                const userCalories = await db.getFirstAsync('SELECT * FROM user');
                setKcal(userCalories.calories);
                setCarbs(userCalories.carbs);
                setFat(userCalories.fat);
                setProtein(userCalories.protein);
    
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(true);
                throw error;
            }
        };
    
        const fetchFromApi = async () => {
            //API CALL + SQL SAVE
        };
    
        const fetchData = async () => {
            try {
                await fetchFromLiteSql();
            } catch (error) {
                console.log('Failed from SQLite...');
                await fetchFromApi();
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
        <SafeAreaView style={styles.makroMenuContainer}>
            <View style={styles.makroMenuItem}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
            <View style={styles.makroMenuItem}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
            <View style={styles.makroMenuItem}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
            <View style={styles.makroMenuItem}>
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
        <SafeAreaView style={styles.makroMenuContainer}>     
            <View style={styles.makroMenuItem}>
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${kcalProgress}%` }, styles.orange]} />
                        {kcalOverflowProgress > 0 && (
                            <View style={[styles.progressBar, { width: `${kcalOverflowProgress}%` }, styles.red]} />
                        )}
                    </View>
                </View>
                <View style={styles.currentValueContainer}>
                    <Text style={styles.mainText} >Kcal: <Text style={styles.bold}>{currentKcal}</Text></Text>
                </View>
                <View style={styles.totalValueContainer}>
                    <Text style={styles.secondaryText}>/ {kcal} k.</Text>
                </View>
            </View>
            <View style={styles.makroMenuItem}>
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${proteinProgress}%` }, styles.blue]} />
                        {proteinOverflowProgress > 0 && (
                            <View style={[styles.progressBar, { width: `${proteinOverflowProgress}%` }, styles.red]} />
                        )}
                    </View>
                </View>
                <View style={styles.currentValueContainer}>
                    <Text style={styles.mainText}>Protein: <Text style={styles.bold}>{currentProtein}</Text></Text>
                </View>
                <View style={styles.totalValueContainer}>
                    <Text style={styles.secondaryText}>/ {protein} g</Text>
                </View>
            </View>
            <View style={styles.makroMenuItem}>
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${fatProgress}%` }, styles.darkorange]} />
                        {fatOverflowProgress > 0 && (
                            <View style={[styles.progressBar, { width: `${fatOverflowProgress}%` }, styles.red]} />
                        )}
                    </View>
                </View>
                <View style={styles.currentValueContainer}>
                    <Text style={styles.mainText}>Fat: <Text style={styles.bold}>{currentFat}</Text></Text>
                </View>
                <View style={styles.totalValueContainer}>
                    <Text style={styles.secondaryText}>/ {fat} g</Text>
                </View>
            </View>
            <View style={styles.makroMenuItem}>
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${carbsProgress}%` }, styles.purple]} />
                        {carbsOverflowProgress > 0 && (
                            <View style={[styles.progressBar, { width: `${carbsOverflowProgress}%` }, styles.red]} />
                        )}
                    </View>
                </View>
                <View style={styles.currentValueContainer}>
                    <Text style={styles.mainText}>Carbs: <Text style={styles.bold}>{currentCarbs}</Text></Text>
                </View>
                <View style={styles.totalValueContainer}>
                    <Text style={styles.secondaryText}>/ {carbs} g</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    makroMenuContainer: {
        flexDirection: 'row',
        borderTopRightRadius: 21,
        borderTopLeftRadius: 21,
        width: '100%',
        height: '8%',
        backgroundColor: '#DCDCDC',
    },
    makroMenuItem: {
        flex: 1,
    },
    progressBarContainer: {
        width: '80%',
        height: '60%',
        borderRadius: 20,
        marginTop: '5%',
        backgroundColor: 'whitesmoke',
        overflow: 'hidden',
        position: 'relative',
    },
    progressBarWrapper: {
        width: '100%',
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentValueContainer: {
        width: '95%',
        marginLeft: '2.5%',
        height: '30%',
    },
    totalValueContainer: {
        width: '90%',
        marginLeft: '5%',
        height: '30%',
    },
    progressBar: {
        height: '100%',
        borderRadius: 10,
        position: 'absolute',
    },
    purple: {
        backgroundColor: 'purple',
    },
    blue: {
        backgroundColor: 'darkblue',
    },
    orange: {
        backgroundColor: '#FF8303',
    },
    darkorange: {
        backgroundColor: '#A35709',
    },
    red: {
        backgroundColor: 'red',
    },
    mainText: {
        fontFamily: 'Helvetica',
        fontSize: 14,
        marginLeft: 7,
    },
    secondaryText: {
        fontFamily: 'Helvetica',
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        marginRight: 15,
    },
    bold: {
        fontWeight: '700',
    },
});

export default MakroMenu;
