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
  buttonOptionContainer: {
    height: 80,
    position: 'absolute',
    paddingLeft: 15,
    paddingRight: 15,
    bottom: 215,
    right: 0,
    justifyContent: 'space-around',
    alignItems: 'flex-end',   
  },
  expOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8303',
    borderRadius: 15,
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 2,
    paddingBottom: 2,
  },
  iconSpacing: {
    marginLeft: 8,
  },
  rightMarginIcon: {
    marginRight: 2,
  },
  addMealButton: {
    position: 'absolute',
    bottom: 150,
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