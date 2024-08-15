import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

function QuestWeightScreen({navigation}) {

      return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.secondaryText}>LOADING TYPE SHI</Text>
        </SafeAreaView>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 10,
      },
      secondaryText: {
        fontSize: 36,
        color: 'whitesmoke',
      },
    });

export default QuestWeightScreen;
