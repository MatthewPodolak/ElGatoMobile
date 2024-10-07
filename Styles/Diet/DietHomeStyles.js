import { StyleSheet } from 'react-native';

export const DietHomeStyles = StyleSheet.create({ 
 container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'whitesmoke',
    alignItems: 'center',
  },
  topMargin: {
    height: 15,
  },
  scrollContainer: {
    width: '100%',
    backgroundColor: 'whitesmoke',
    flex: 1,
  },
  addMealButton: {
    position: 'absolute',
    bottom: 130,
    right: 10,
    width: 60,
    height: 60,
    backgroundColor: '#FF8303',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  bottomSpacing: {
    flex: 1,
    height: 80,
  },

 });