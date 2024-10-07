import { StyleSheet } from 'react-native';

export const GatoRightModalStyles = StyleSheet.create({ 

elGatoAddOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  position: 'relative',
},
elGatoAddBubbleContainer: {
  width: '100%',
  height: '20%',
},
elGatoAddMainContainer: {
  width: '100%',
  height: '80%',
  backgroundColor: 'transparent',
},
elGatoAddConfirm: {
  width: '50%',
  position: 'absolute',
  height: 50,
  bottom: 20,
  borderRadius: 25,
  marginLeft: '25%',
  backgroundColor: '#FF8303',
  justifyContent: 'center',  
  alignItems: 'center',      
},
elGatoConfirmText: {
  color: 'white',          
  fontSize: 16,           
  fontWeight: '600',
  fontFamily: 'Helvetica', 
},
elGatoBubbleImage: {
  width: '90%',
  marginLeft: '5%',
  marginTop: '5%',
  height: '80%',
},

 });