import { StyleSheet } from 'react-native';

export const AllRecepies = StyleSheet.create({ 
    container: {
        flex: 1,
        backgroundColor: 'whitesmoke',
      },
      content: {
        flex: 1,    
      },     
      rowTitle: {
        flex: 1,
        marginTop: 6,
        justifyContent: 'space-between',
        flexDirection: 'row',
      },
      item: {
        width: 300,                
        height: '100%',            
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,      
      },
      titleCont: {
        width: '100%',
        height: '9%',
        backgroundColor: '#FF8303',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      },
      titleLeft: {
        width: '12.5%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      titleRight: {
        width: '12.5%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      titleMid: {
        width: '75%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      topMenu: {
        marginTop: 15,
        width: '100%',
        flexDirection: 'row',
      },
      option: {
        marginLeft: 15,
      },
      optionText: {
        fontSize: 18,
        fontFamily: 'Helvetica',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        paddingBottom: 5,
      },
      activeTab: {
        borderBottomColor: '#FF8303', 
        color: '#FF8303',          
      },
});