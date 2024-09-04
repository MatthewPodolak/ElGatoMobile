import React, { useEffect,useState } from 'react';
import { ActivityIndicator, View, Pressable, StyleSheet, SafeAreaView, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';

function MakroMenu() {

    const [kcal, setKcal] = useState(0);
    const [protein, setProtein] = useState(0);
    const [fat, setFat] = useState(0);
    const [carbs, setCarbs] = useState(0);

    const [currentKcal, setCurrentKcal] = useState(12500);
    const [currentProtein, setCurrentProtein] = useState(500);
    const [currentFat, setCurrentFat] = useState(100);
    const [currentCarbs, setCurrentCarbs] = useState(1900);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFromLiteSql = async () => {
            const db = await SQLite.openDatabaseAsync('ElGatoDbLite');
            console.log(db);

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

        };

        const fetchData = async () => {
            try {
                await fetchFromLiteSql();
            } catch (error) {
                console.log('Failed from SQLite...');
                await fetchFromApi();
            }
        };

        fetchData();

    }, []);

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

    const kcalProgress = kcal > 0 ? (currentKcal / kcal) * 100 : 0;
    const proteinProgess = protein > 0 ? (currentProtein / protein) * 100 : 0;
    const fatProgress = fat > 0 ? (currentFat / fat) * 100 : 0;
    const carbsProgress = carbs > 0 ? (currentCarbs / carbs) * 100 : 0;


    return(
        <SafeAreaView style={styles.makroMenuContainer}>     
            <View style={styles.makroMenuItem}>
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${kcalProgress}%` }, styles.orange]} />
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
                        <View style={[styles.progressBar, { width: `${proteinProgess}%` }, styles.blue]} />
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
    },
    progressBarWrapper: {
        width: '100%',
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentValueContainer: {
        width: '90%',
        marginLeft: '5%',
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