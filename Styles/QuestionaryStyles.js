import { StyleSheet } from 'react-native';

export const questStyles = StyleSheet.create({
    option: {
    backgroundColor: '#ead9b6',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: '#FF8303',
  },
  nextButton: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    width: '90%',
    backgroundColor: '#FF8303',
    marginBottom: 10,
  },
  nextButtonText: {
    color: 'whitesmoke',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F0E3CA',
    padding: 10,
  },
  topContainer: {
    width: '100%',
    height: '10%',
    padding: 20,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionaryBackImg: {
    width: 36,
    height: 36,
  },
  progressBarContainer: {
    flex: 1,
    height: 15,
    backgroundColor: '#1B1A17',
    borderRadius: 10,
    marginLeft: 10,
  },
  progressBar: {
    width: '8%',
    height: '100%',
    backgroundColor: '#FF8303',
    borderRadius: 10,
  },
  questionHeaderContainer: {
    width: '100%',
    height: '30%',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  questionaryText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1B1A17',
    fontFamily: 'HelveticaBold',
    textAlign: 'left',
  },
  questionaryAnswerSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  optionText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Helvetica',
  },
  optionTextLong: {
    color: '#000',
    fontSize: 18,
    marginLeft: 20,
    fontFamily: 'Helvetica',
  },
  optionLong: {
    backgroundColor: '#ead9b6',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  //FIELDS
  input: {
    height: 100,
    padding: 10,
    fontSize: 32,
    textAlign: 'center',
    color: '#000',
    fontFamily: 'Helvetica',
    backgroundColor: '#F0E3CA',
    width: '100%',
    borderBottomWidth: 1,
  },
  questionaryAnswerSectionField: {
    width: '80%',
    paddingHorizontal: 20,
  },
  });