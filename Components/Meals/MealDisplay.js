import React, { useState, useEffect,useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles.js';

import Save from '../../assets/main/Diet/bookmark.svg';
import SaveFilled from '../../assets/main/Diet/bookmark-fill.svg';
import HeartEmpty from '../../assets/main/Diet/heartEmpty.svg';
import HeartFull from '../../assets/main/Diet/heartFull.svg'

import { AuthContext } from '../../Services/Auth/AuthContext.js';
import MealDataService from '../../Services/ApiCalls/MealData/MealDataService.js';

function MealDisplay({meal, navigation}) {
  const { setIsAuthenticated } = useContext(AuthContext);

  const imageSource = meal.img ? { uri: `http://192.168.0.143:5094${meal.img}` } : require('../../assets/recepieBaseImage.png');
  const userPfp = meal.creatorPfp? {uri: `http://192.168.0.143:5094${meal.creatorPfp}`} : require('../../assets/userPfpBase.png');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCounter, setLikeCounter] = useState(meal.likedCounter);

  const checkMealStatus = () => {
    if(meal.liked){ setIsLiked(true); }
    if(meal.saved){setIsSaved(true);}
  };

  const likeMeal = async (id) => {
    try{
      const res = await MealDataService.likeMeal(setIsAuthenticated, navigation, id);

      if(!res.ok){
        //return no
        console.log('error handle!!!!!');
        return;
      }

      if(isLiked){
        setLikeCounter((likeCounter - 1));
      }else{
        setLikeCounter((likeCounter + 1));
      }
      setIsLiked(!isLiked);
      
    }catch(error){
      console.log('xxxx handle!!!!!' + error);
    }
  };

  const saveMeal = async (id) => {
    try{
      const res = await MealDataService.saveMeal(setIsAuthenticated, navigation, id);

      if(!res.ok){
        //return no
        console.log('error handle!!!!!');
        return;
      }

      setIsSaved(!isSaved);
    }catch(error){
      console.log('xxxx handle!!!!!' + error);
    }
  };

  useEffect(() => {
    checkMealStatus();
  }, []);

  return (
    <View>
      <View style = {styles.itemContainer}>
        <ImageBackground 
          source={imageSource}
          style={styles.imgFill}
          imageStyle={{ borderRadius: 10 }}
        >
          <ImageBackground imageStyle={{ borderRadius: 25 }} source={userPfp} style = {styles.userPfpContainer}></ImageBackground>
          <TouchableOpacity style = {styles.save} onPress={() => saveMeal(meal.stringId)}>
          {isSaved ? (
            <SaveFilled width={32} height={32} fill={"#000"} />
          ) : (
            <Save width={32} height={32} fill={"#000"} />
          )}
          
          </TouchableOpacity>
          <View style = {styles.timeContainer}><Text>{meal.kcal} kcal / {meal.time}</Text></View>
        </ImageBackground>
      </View>
      <View style={styles.itemData}>
        <View style={[styles.itemDataLeft, { overflow: 'hidden' }]}>
          <Text style={[GlobalStyles.text18, {overflow: 'hidden'}]}>{meal.name.length > 40 ? `${meal.name.slice(0, 40)}...` : meal.name}</Text>
        </View>

        <View style={styles.itemDataRight}>
          <Text style={[GlobalStyles.text20, styles.marginRight]}>{likeCounter}</Text>
          <TouchableOpacity onPress={() => likeMeal(meal.stringId)}>
            {isLiked ? (
              <HeartFull width={26} height={26} fill={'red'} />
            ) : (
              <HeartEmpty width={26} height={26} fill={'#000'} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    width: 300,                
    height: '80%',            
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,   
    position: 'relative',
    overflow: 'hidden',
  },
  imgFill:{
    width: 300,                
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  itemData: {
    width: 300,
    height: '20%',
    overflow: 'hidden',
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
    minWidth: 150,
    width: 'auto',
    paddingLeft: 10,
    paddingRight: 10,
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