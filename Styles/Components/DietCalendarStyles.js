import { StyleSheet } from 'react-native';

export const DietCalendarStyles = StyleSheet.create({ 
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