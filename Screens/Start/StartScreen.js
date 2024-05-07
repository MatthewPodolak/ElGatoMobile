import React from 'react';
import { View, Button, StyleSheet,ScrollView,Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';


function StartScreen({ navigation }) {
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.view}>
          <Image style={styles.mainImage} source={require('../../Constants/dieKatzeMain.png')} />
          <Text style={styles.textMain}>THAT'S WHERE YOUR JOURNEY STARTS.</Text>
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapperOrange}>
          <Button
            color="orange"
            title="Log In"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
        <View style={styles.buttonWrapperBorder}>
          <Button
            color="black"
            title="Go to Register"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 10,
  },
  view:{
    width: '100%;',
    marginTop: '20%',
    height: '80%',
    padding: 10,
  },
  mainImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  textMain: {
    marginTop: 30,
    fontSize: 32,
    textAlign: 'center',
    color: 'whitesmoke',
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'space-evenly',
    flexDirection: 'column',
    paddingBottom: 20,
  },
  buttonWrapperOrange: {
    backgroundColor: 'orange',
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
  },
  buttonWrapperBorder: {
    height: 50,
    marginBottom: 30,
    borderColor: 'orange', 
    borderWidth: 2, 
    justifyContent: 'center', 
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
  },
});

export default StartScreen;
