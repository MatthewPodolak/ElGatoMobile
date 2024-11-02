import { StyleSheet } from 'react-native';

export const MakroMenuStyles = StyleSheet.create({ 
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
    makroMenuItemLoad: {
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: '#038CFF',
    },
    blue: {
        backgroundColor: '#8BFF03',
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