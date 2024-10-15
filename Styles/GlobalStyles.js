import { StyleSheet } from 'react-native';

export const GlobalStyles = StyleSheet.create({
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
    bold: {
        fontWeight: '700',
    },

    hr: {
        borderBottomColor: 'black',
        opacity: 0.6,
        marginTop: 2,
        borderBottomWidth: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerLeft: {
        justifyContent: 'center',
        alignItems: 'flex-start', 
        paddingLeft: 10,        
    }

});