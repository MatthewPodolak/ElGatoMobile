import { StyleSheet } from 'react-native';

export const AddIngredientStyles = StyleSheet.create({ 

      bold: {
        fontWeight: '700',
      },
      container: {
        flex: 1,
        backgroundColor: 'whitesmoke',
      },
      topContainer: {
        width: '100%',
        height: '9%',
        backgroundColor: '#FF8303',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      },
      topContIngBack: {
        width: '15%',
        height: '100%',
      },
      topContIngTitle: {
        width: '70%',
        height: '100%',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
      },
      topContIngReport: {
        width: '15%',
        height: '100%',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
      },
    
      topBack: {
        position: 'absolute',
        left: 10,
        height: '100%',
        justifyContent: 'center',
      },
      topName: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      topNameText: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: 'Helvetica',
        textAlign: 'center',
      },
    
      categoryContainer: {
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
      },
    
      searchContainer: {
        marginTop: 10,
        width: '100%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
      },
      barContainer: {
        height: '100%',
        width: '80%',
        justifyContent: 'center',
        marginLeft: 10,
      },
      searchInput: {
        height: '80%',
        backgroundColor: '#1B1A17',
        color: 'white',
        borderRadius: 5,
        paddingHorizontal: 10,
      },
      codeContainer: {
        width: '15%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      closeButton: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: '#FF8303',
        padding: 10,
        borderRadius: 5,
      },
      closeButtonText: {
        color: '#fff',
        fontSize: 16,
      },
        grayCodeBorderContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      },
      croshair: {
        width: '70%',
        height: '20%',
        position: 'relative',
        borderWidth: 2,
        borderColor: 'transparent',
      },
      cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        borderLeftWidth: 3,
        borderTopWidth: 3,
        borderColor: 'black',
      },
      cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 30,
        height: 30,
        borderRightWidth: 3,
        borderTopWidth: 3,
        borderColor: 'black',
      },
      cornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 30,
        height: 30,
        borderLeftWidth: 3,
        borderBottomWidth: 3,
        borderColor: 'black',
      },
      cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderRightWidth: 3,
        borderBottomWidth: 3,
        borderColor: 'black',
      },
    
      contentContainer: {
        marginTop: 20,
        flex: 1,
        flexDirection: 'column',
      },
      contentError:{
        width: '100%',
        height: '100%',
        justifyContent: 'center', 
        alignItems: 'center', 
      },
      errorLottieContainer: {
        width: '100%',
        height: '70%',
      },
      errorAddingContainer: {
        width: '100%',
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      },
      errorAddOrange: {
        color: '#FF8303',
        fontWeight: '600', //700?
        fontSize: 18,
        fontFamily: 'Helvetica',
      },
      errorAddNormal: {
        fontSize: 18,
        fontFamily: 'Helvetica',
        color: '#000',
      },
    
      scannedRowLeft: {
        borderBottomColor: '#FF8303',
        borderBottomWidth: 2,
        width: '85%',
      },
      scannedContentRow: {
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 20,
        position: 'relative', 
      },
      scannedRowRight: {
        width: '10%',
        height: '100%',
        backgroundColor: '#1B1A17',
        position: 'absolute', 
        right: 0, 
        top: 0, 
        alignItems: 'center',
        justifyContent: 'center',
      },
      //xdd
      contentRow: {
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10, 
        position: 'relative',
      },
    
      contentRowListTop: {
        marginTop: 5,
        marginBottom: 2,
        width: '100%',
        flexDirection: 'row',
      },
      ListContentRowLeft: {
        width: '80%',
      },
      ListContentRowRight: {
        width: '20%',
        alignItems: 'center',
        justifyContent: 'center',   
      },
      contentRowListBottom: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
      },
      brandName: {
        fontSize: 14,
        marginLeft: 5,
        fontFamily: 'Helvetica',
      },
      ListCheckContainer:{
        width: 25,
        height: 25,
      },
      checkBox: {
        width: '100%',
        height: '100%',
        borderWidth: 1,   
      },
      check: {
        position: 'absolute',
        bottom: 0,
        left: -10,
        top: -15,
        zIndex: 99,
      },
      itemName: {
        fontSize: 18,
        marginLeft: 5,
        fontFamily: 'Helvetica',
      },
      
      nutrientText: {
        marginLeft: 10,
      },
      kcalContainer: {
        flex: 1, 
        alignItems: 'flex-end',
      },
      kcalText: {
        marginRight: 10, 
      },
      selectedRow: {
        backgroundColor: '#FF8303',
      },
    
      hr: {
        borderBottomColor: 'lightgray',
        opacity: 0.6,
        marginTop: 2,
        borderBottomWidth: 1,
      },
    
    
      ingModalContainer: {
        flex: 1,
        backgroundColor: 'whitesmoke',
      },
      ingModalContentContainer: {
        flex: 1,
      },
      ingModalContentRow: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
      },
      ingContentRowContent: {
        width: '90%',
        flexDirection: 'row',
        paddingLeft: 15,
      },
      ingContentRowButton: {
        width: '10%',
        paddingRight: 15,
      },
      ingContentRowGrams: {
        width: '18%',
        alignItems: 'center',
      },
      ingContentRowMakro: {
        flexDirection: 'row',
        width: '60%',
        alignItems: 'center',
      },
      ingContentRowKcal:{
        width: '20%',
        flexDirection: 'row',
        alignItems: 'center',
      },
      nutrientTextModal: {
        fontSize: 16,
        marginLeft: 12,
      },
      nutrientTextModalValue: {
        fontSize: 16,
        marginLeft: 5,
      },
      gramsTextModal: {
        fontSize: 22,
        fontFamily: 'Helvetica',
        fontWeight: '600',
      },
      inputBorder: {
        borderColor: 'black',
        borderWidth: 1,
        width: '100%',
        paddingLeft: 12,
      },
      ingModalContentSummaryRow: {
        marginTop: 25,
      },
      summaryTopRow: {
        width: '100%',
      },
      summaryBottomRow: {
        width: '100%',
      },
      summaryText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#FF8303',
        fontFamily: 'Helvetica',
        alignItems: 'center',
        textAlign: 'center',
      },
    
      confirmButtonContainer: {
        position: 'absolute',
        bottom: 20,
        width: '50%',
        marginLeft: '25%',
        alignItems: 'center',
      },
      confirmButton: {
        width: '100%',
        backgroundColor: '#1B1A17',
        paddingVertical: 9,
        borderRadius: 50,
        alignItems: 'center',
        color: 'whitesmoke',
        justifyContent: 'center',
      },
    
    
      reportModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
      },
      reportModalClosingTransparent: {
        height: '15%',
        backgroundColor: 'transparent',
        width: '100%',
      },
      reportModalContainer: {
        height: '85%',
        backgroundColor: '#F0E3CA',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
      },
      reportTitleCont: {
        width: '100%',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
      },
      reportTitleText: {
        fontSize: 20,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        color: '#333',
      },
      reportDescCont: {
        width: '100%',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
      },
      reportDescTextBold: {
        fontSize: 16,
        color: '#333',
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Helvetica',
      },
      reportDescText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        fontFamily: 'Helvetica',
      },
      reportOptionsCont: {
        width: '100%',
        padding: 5,
        borderRadius: 10,
      },
      reportOptionText: {
        color: 'black',
        marginBottom: 15,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Helvetica',
      },
      reportHr: {
        width: '100%',
        borderBottomWidth: 1,
        borderColor: 'black',
        opacity: 0.2,
      },
    
      addProductModal: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
      },
      addProductModalClosingTransparent: {
        height: '15%',
        backgroundColor: 'transparent',
        width: '100%',
      },
    
      addProductRow: {
        width: '100%',
        marginBottom: 20,
      },
      productRowNotify: {
        textAlign: 'center',
        fontFamily: 'Helvetica',
      },
      addProductRowShort: {
        width: '100%',
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      addProductRowShortLeft: {
        width: '45%',
      },
      addProductRowShortRight: {
        width: '45%',
      },
      inputWrapper: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        paddingTop: 2,
        paddingHorizontal: 10,
        height: 50,
      },
      label: {
        position: 'absolute',
        top: -10,
        left: 15,
        backgroundColor: '#F0E3CA',
        paddingHorizontal: 5,
        fontSize: 14,
        color: '#000',
      },
      input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 5,
        fontSize: 16,
        color: '#000',
      },
      addProductConfirmButton: {     
        width: '100%', 
        height: 50,          
        backgroundColor: '#FF8303',
        justifyContent: 'center',
        alignItems: 'center',   
        borderRadius: 10,   
    },
    addProductBtnText: {
      fontSize: 18,
      fontFamily: 'Helvetica',
    },

 });