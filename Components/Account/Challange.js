import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlobalStyles } from '../../Styles/GlobalStyles';

function Challange({ data }) {
  return (
    <BlurView style={styles.container} intensity={125} tint="light">
      <View style={[styles.titleContainer, GlobalStyles.centerLeft]}>
        <Text style={[GlobalStyles.text18, GlobalStyles.bold]}>
          March 10 K. 
        </Text>
      </View>

      <View style={[styles.pictureContainer, GlobalStyles.center]}>
        <Image
          style={{ width: 80, height: 80, resizeMode: 'contain' }}
          source={{ uri: 'http://192.168.0.143:5094/badges/sampleBadge.png' }}
        />
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={[GlobalStyles.text14]}>
          Run 10km! Will you accept the challenge? 
        </Text>
      </View>

      <View style={[styles.buttonContainer, GlobalStyles.center]}>
        <TouchableOpacity style={[styles.button, GlobalStyles.center]}>
          <Text style={[GlobalStyles.text16, GlobalStyles.bold, GlobalStyles.white]}>
            Roll in!
          </Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({ 
  container: {
    width: '45%',
    margin: 5,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'column',
  },
  titleContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  pictureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  descriptionContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  button: {
    width: '90%',
    height: 35,
    borderRadius: 25,
    backgroundColor: '#FF8303',
  },
});

export default Challange;
