import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, StatusBar } from 'react-native';

import { DietCalendarStyles } from '../../Styles/Components/DietCalendarStyles.js';


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
        <SafeAreaView style={DietCalendarStyles.mainCalendarContainer}>
            <StatusBar backgroundColor="#FF8303" barStyle="light-content" />          
            <View style={DietCalendarStyles.monthContainer}>
            </View>
            <View style={DietCalendarStyles.daysWrapper}>
                {days.map((dayItem, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            DietCalendarStyles.calendarItem,
                            dayItem.fullDate === selectedDate ? DietCalendarStyles.selectedBlock : null
                        ]}
                        onPress={() => handleDateSelect(dayItem)}
                    >
                        <View style={DietCalendarStyles.calendarDayCont}>
                            <Text
                                style={[
                                    DietCalendarStyles.boldText,
                                    dayItem.fullDate === selectedDate ? DietCalendarStyles.selectedText : null
                                ]}
                            >
                                {dayItem.day}
                            </Text>
                        </View>
                        <View style={DietCalendarStyles.calendarDayNumberCont}>
                            <Text
                                style={[
                                    dayItem.fullDate === selectedDate ? DietCalendarStyles.selectedText : null
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


export default DietCalendar;
