import React from 'react';
import { View, Pressable, StyleSheet, SafeAreaView, Text } from 'react-native';

import { GlobalStyles } from '../../Styles/GlobalStyles.js';

import Save from '../../assets/main/Diet/bookmark.svg';
import HeartEmpty from '../../assets/main/Diet/heartEmpty.svg';

import { TouchableOpacity } from 'react-native';


function MealDisplay({item}) {
  return (
    <View>
      <View style= {styles.itemContainer}>
        <View style = {styles.userPfpContainer}></View>
        <TouchableOpacity style = {styles.save}><Save width={32} height={32} fill={"#000"} /></TouchableOpacity>
        <View style = {styles.timeContainer}><Text>333 kcal / 42 min</Text></View>
      </View>
      <View style={styles.itemData}>
        <View style={styles.itemDataLeft}>
          <Text style={[GlobalStyles.text18]}>aaaa aaaaa aaaaaaaa aaa</Text>
        </View>

        <View style={styles.itemDataRight}>
          <Text style={[GlobalStyles.text20, styles.marginRight]}>45550</Text>
          <TouchableOpacity><HeartEmpty width={26} height={26} fill={'#000'}/></TouchableOpacity>
        </View>
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    width: 300,                
    height: '70%',            
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,   
    position: 'relative',
  },
  itemData: {
    width: 300,
    marginHorizontal: 5,  
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDataLeft: {
    width: '70%',
    justifyContent: 'center',
  },
  itemDataRight: {
    width: '27%',
    marginRight: '1%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center', 
  },
  userPfpContainer: {
    width: 50,                 
    height: 50,                
    backgroundColor: 'black',   
    borderRadius: 25,          
    position: 'absolute',     
    bottom: 8,                 
    left: 7,                
  },
  save: {
    position: 'absolute',     
    top: 15,                 
    right: 10,
  },
  timeContainer: {
    width: 150,
    height: 30,
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    borderRadius: 15,          
    backgroundColor: 'whitesmoke',
    position: 'absolute',
    right: 7,
    bottom: 10,
  },
  marginRight: {
    marginRight: 5,
  }
});

export default MealDisplay;
