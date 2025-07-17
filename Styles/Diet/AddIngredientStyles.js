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
      activeTab: {
        color: '#FF8303',
        borderBottomColor: '#FF8303', 
        borderBottomWidth: 2,
        paddingBottom: 5,
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
        fontWeight: '600',
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
        paddingLeft: 15,
        paddingRight: 15,
        marginBottom: 20,
        position: 'relative', 
      },
      scannedRowRight: {
        width: '10%',
        height: '100%',
        position: 'absolute', 
        right: 0, 
        top: 0, 
        alignItems: 'center',
        justifyContent: 'center',
      },
      contentRow: {
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10, 
        position: 'relative',
      },
    
      contentRow: {
        alignSelf: 'stretch',
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
      },

      contentRowListTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#FBFBFB',
      },

      ListContentRowLeft: {
        flex: 1,
        justifyContent: 'center',
      },

      ListContentRowRight: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
      },

      contentRowListBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FFFFFF',
      },

      brandName: {
        fontSize: 13,
        marginLeft: 6,
        color: '#666',
      },

      itemName: {
        fontSize: 17,
        marginLeft: 0,
        color: '#1B1A17',
      },

      nutrientText: {
        fontSize: 12,
        color: '#000',
        marginRight: 8,
        fontWeight: '500',
      },

      kcalText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
        marginRight: 8,
      },

      kcalContainer: {
        flex: 1,
        alignItems: 'flex-end',
      },

      ListCheckContainer: {
        width: 24,
        height: 24,
      },

      checkBox: {
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 4,
      },

      check: {
        position: 'absolute',
        zIndex: 99,
        bottom: -8,
        left: -10,
      },

      selectedRow: {
        backgroundColor: '#FFF8F0',
      },

      hr: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 8,
      },

    
    
      ingModalContainer: {
        flex: 1,
        backgroundColor: 'whitesmoke',
      },
      ingModalContentContainer: {
        flex: 1,
        paddingHorizontal: 16,
      },
      ingModalContentRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
      },
      ingContentRowContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
      },
      ingContentRowButton: {
        width: '12%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      ingContentRowGrams: {
        width: '18%',
        alignItems: 'center',
      },
      ingContentRowMakro: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
      },
      ingContentRowKcal: {
        width: '20%',
        alignItems: 'flex-end',
        flexDirection: 'row',
      },
      nutrientTextModal: {
        fontSize: 14,
        color: '#333',
        marginLeft: 4,
        fontFamily: 'Helvetica',
      },
      nutrientTextModalValue: {
        fontSize: 14,
        fontFamily: 'Helvetica',
        fontWeight: '600',
        color: '#000',
        marginLeft: 2,
      },
      gramsTextModal: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1B1A17',
        fontFamily: 'Helvetica',
      },
      inputBorder: {
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 6,
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 8,
      },
      ingModalContentSummaryRow: {
        marginTop: 32,
        paddingVertical: 16,
        backgroundColor: 'whitesmoke',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF8303',
      },
      summaryTopRow: {
        width: '100%',
      },
      summaryBottomRow: {
        width: '100%',
      },
      summaryText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FF8303',
        textAlign: 'center',
        fontFamily: 'Helvetica',
      },
      confirmButtonContainer: {
        position: 'absolute',
        bottom: 24,
        width: '60%',
        left: '20%',
      },
      confirmButton: {
        backgroundColor: '#1B1A17',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
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


    RestCont: {
      flex: 1,
    },

    /*FAV*/
    favContentContainer: {
      marginTop: 10,
      flex: 1,
    },
    searchedRow: {
      height: 300,
      marginBottom: 20,
    },
    underGatoEmptyContainer: {
      height: '85%',
    },

    /*Own*/
    fieldWrapper: {
      width: '90%',
      alignSelf: 'center',
      position: 'relative',
      marginVertical: 10,
    },
    ownLabelWrapper: {
      position: 'absolute',
      top: -10,
      left: 12,
      backgroundColor: 'whitesmoke',
      zIndex: 99,
      paddingHorizontal: 4,
    },
    ownLabel: {
      fontSize: 14,
      color: '#000',
      fontFamily: 'Helvetica',
      marginBottom: -6,
      backgroundColor: 'whitesmoke',
      alignSelf: 'flex-start',
      paddingHorizontal: 4,
      zIndex: 1,
    },
    ownInput: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#999',
      borderRadius: 4,
      paddingVertical: 12,
      paddingHorizontal: 12,
      fontSize: 16,
    },
    pair: {
      flex: 1,
    },
 });