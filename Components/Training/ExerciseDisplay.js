import React, { useState, useEffect,useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles.js';
import { BlurView } from 'expo-blur';
import config from '../../Config';


function ExerciseDisplay({exercise, navigation, selected}) {
  return (
    <View style={styles.container}>
        <BlurView style={[styles.glassEffect, selected ? styles.selectedStyle : styles.unselectedStyle]} intensity={125} tint="light">
            <View style={styles.topRow}>
                <ImageBackground style={styles.mainImg} resizeMode="contain" source={{ uri: config.ipAddress + exercise.image }} />
            </View>
            <View style={[styles.bottomRow, GlobalStyles.center]}>
                <Text style={[styles.centeredText, GlobalStyles.text20]}>{exercise.name}</Text>
            </View>
        </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 250,
        marginBottom: 10,
    },
    glassEffect: {
        flex: 1,
        padding: 20,
        paddingTop: 10,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
      },
      selectedStyle: {
        borderColor: '#FF8303',
        borderWidth: 2,
      },
      unselectedStyle:{
        borderColor: 'rgba(000, 000, 000, 0.2)',
        borderWidth: 1,
      },
      topRow: {
        height: '75%',
      },
      bottomRow: {
        height: '25%',
        borderTopColor: '#FF8303',
        borderTopWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
      },
      mainImg: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        marginLeft: -5,
        overflow: 'hidden',
      },
      centeredText: {
        textAlign: 'center',
        marginTop: 10,
      },
});

export default ExerciseDisplay;
