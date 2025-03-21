import { StyleSheet } from 'react-native';

export const GlobalStyles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    column: {
        flexDirection: 'column',
    },
    row:{
        flexDirection: 'row',
    },
    text12:{
        fontSize: 12,
        fontFamily: 'Helvetica',
    },
    text13: {
        fontSize: 13,
        fontFamily: 'Helvetica',
    },
    text14: {
        fontSize: 14,
        fontFamily: 'Helvetica',
    },
    text16: {
        fontSize: 16,
        fontFamily: 'Helvetica',
    },
    text18: {
        fontFamily: 'Helvetica',
        fontSize: 18,
    },
    text20: {
        fontFamily: 'Helvetica',
        fontSize: 20,
    },
    text22: {
        fontFamily: 'Helvetica',
        fontSize: 22,
    },
    text24: {
        fontFamily: 'Helvetica',
        fontSize: 24,
    },
    textAchievment: {
        fontFamily: 'Helvetica',
        fontSize: 32,
    },
    text32: {
        fontFamily: 'Helvetica',
        fontSize: 32,
    },
    bold: {
        fontWeight: '700',
    },

    hr: {
        borderBottomColor: 'black',
        opacity: 0.6,
        marginTop: 2,
        borderBottomWidth: 1,
    },
    paddedHr: {
        borderBottomColor: 'black',
        opacity: 0.2,
        marginTop: 2,
        borderBottomWidth: 1,
        width: '95%',
        marginLeft: '2.5%',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },   
    centerLeft: {
        justifyContent: 'center',
        alignItems: 'flex-start', 
        paddingLeft: 10,        
    },
    centeredText: {
        textAlign: 'center',
    },
    orange: {
        color: '#FF8303',
    },
    red: {
        color: "red",
    },
    green: {
        color: "#3E7B27",
    },
    white: {
        color: 'whitesmoke',
    },

    wide: {
        width: '100%',
    },
    padding15: {
        padding: 15,
    },
    minorSpacing: {
        height: 30,
    },
    floatRight: {
        textAlign: 'right',
    },
    textShadow: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    }
});