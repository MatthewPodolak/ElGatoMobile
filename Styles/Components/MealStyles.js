import { StyleSheet } from 'react-native';

export const MealStyles = StyleSheet.create({ 
    safeArea: {
        flex: 1,
      },
      mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      glassEffect: {
        width: '90%',
        padding: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(000, 000, 000, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
      },
      topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
      },
      headerText: {
        flex: 1,
      },
      headerClose: {
        alignItems: 'flex-end',
        flexDirection: 'row',
      },
      contentRow: {
        marginBottom: 20,
      },
      ingredientRow: {
        flexDirection: 'row',
        marginBottom: 10,
      },
      ingNameCont: {
        width: '60%',
        
      },
      ingWeightCont: {
        width: '25%',
        
        justifyContent: 'center',
        alignItems: 'center',
      },
      ingOptionsCont: {
        width: '15%',
        
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    
    
      ingredientName: {
        color: '#000',
      },
      ingredientWeight: {
        color: '#000',  
      },
      ingredientEdit: {
        color: '#000',
      },
      ingredientClose: {
        color: '#000',
      },
      text: {
        color: '#000',
        fontSize: 18,
        fontFamily: 'Helvetica',
      },
      mealText: {
        color: '#000',
        fontWeight: '600',
        fontSize: 22,
        fontFamily: 'Helvetica',
      },
      input: {
        color: '#000',
        fontSize: 18,
        fontFamily: 'Helvetica',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
      },
      summaryRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      },
      kcal: {
        flex: 1,
      },
      macros: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 1,
        textAlign: 'right',
      },
      spacing: {
        height: 10,
      },
      hrLine: {
        borderBottomColor: 'black',
        opacity: 0.2,
        borderBottomWidth: 1,
        marginBottom: 10,
      },
      addIngridientText: {
        fontSize: 22,
      },
      addSquare: {
        marginTop: 10,
      },
 });