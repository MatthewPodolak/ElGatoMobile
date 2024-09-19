import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, StatusBar } from 'react-native';

function DietCalendar({ onDateSelect }) {
    const [days, setDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        generateDays();
    }, []);

    const generateDays = () => {
        const today = new Date();
        let daysArray = [];

        for (let i = 3; i > 0; i--) {
            const pastDay = new Date(today);
            pastDay.setDate(today.getDate() - i);
            daysArray.push({ 
                day: pastDay.toLocaleDateString('en-US', { weekday: 'short' }), 
                date: pastDay.getDate(), 
                fullDate: pastDay.toISOString().split('T')[0]
            });
        }

        daysArray.push({ 
            day: today.toLocaleDateString('en-US', { weekday: 'short' }), 
            date: today.getDate(), 
            today: true, 
            fullDate: today.toISOString().split('T')[0]
        });

        for (let i = 1; i <= 3; i++) {
            const futureDay = new Date(today);
            futureDay.setDate(today.getDate() + i);
            daysArray.push({ 
                day: futureDay.toLocaleDateString('en-US', { weekday: 'short' }), 
                date: futureDay.getDate(), 
                fullDate: futureDay.toISOString().split('T')[0]
            });
        }

        setDays(daysArray);
        setSelectedDate(today.toISOString().split('T')[0]);
        onDateSelect(today.toISOString().split('T')[0]);
    };

    const handleDateSelect = (day) => {
        setSelectedDate(day.fullDate);
        onDateSelect(day.fullDate);
    };

    return (
        <SafeAreaView style={styles.mainCalendarContainer}>
            <StatusBar backgroundColor="#FF8303" barStyle="light-content" />          
            <View style={styles.monthContainer}>
            </View>
            <View style={styles.daysWrapper}>
                {days.map((dayItem, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.calendarItem,
                            dayItem.fullDate === selectedDate ? styles.selectedBlock : null
                        ]}
                        onPress={() => handleDateSelect(dayItem)}
                    >
                        <View style={styles.calendarDayCont}>
                            <Text
                                style={[
                                    styles.boldText,
                                    dayItem.fullDate === selectedDate ? styles.selectedText : null
                                ]}
                            >
                                {dayItem.day}
                            </Text>
                        </View>
                        <View style={styles.calendarDayNumberCont}>
                            <Text
                                style={[
                                    dayItem.fullDate === selectedDate ? styles.selectedText : null
                                ]}
                            >
                                {dayItem.date < 10 ? `0${dayItem.date}` : dayItem.date}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>           
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    mainCalendarContainer: {
        flexDirection: 'column',
        width: '100%',
        height: '9%',
        backgroundColor: '#FF8303',
    },
    monthContainer:{
        marginTop: 15,
    },
    daysWrapper: {
        flexDirection: 'row',
        height: '65%',
    },
    calendarItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    selectedBlock: {
        backgroundColor: '#1B1A17',
        borderRadius: 5,
    },
    calendarDayCont: {
        marginBottom: 5,
    },
    calendarDayNumberCont: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    selectedText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    boldText: {
        fontWeight: 'bold',
    },
});

export default DietCalendar;
