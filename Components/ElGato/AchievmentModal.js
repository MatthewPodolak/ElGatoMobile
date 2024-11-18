import React from 'react';
import { Modal, View, Text ,TouchableWithoutFeedback, ActivityIndicator,StyleSheet, ImageBackground } from 'react-native';
import { GlobalStyles } from '../../Styles/GlobalStyles.js';

const AchievmentModal = ({
  visible,
  onRequestClose,
  data
}) => {
  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
      transparent={true}
    >
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style = {styles.mainContainer}>
        <View style= {styles.upperSpacing}></View>
        {data ? (
          <View style = {styles.contentContainer}>
              <View style = {styles.imageContainer}>
                <ImageBackground style={styles.img} source={data.achievmentEarnedImage??"base"} />
              </View>
              <View style = {[styles.achievmentNameContainer, GlobalStyles.center]}>
                <Text style={[GlobalStyles.textAchievment, GlobalStyles.bold, GlobalStyles.white]}>{data.achievmentEarnedName??"Unknown"}</Text>
              </View>
              <View style = {[styles.generativeTextCont, GlobalStyles.center]}>
                <Text>{data.generativeText??"Unknown"}</Text>
              </View>
          </View>
           ) : (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color="#FF8303" />
          </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    upperSpacing: {
      height: '20%',
    },
    contentContainer: {
      flex: 1,
    },
    imageContainer: {
      height: '50%',
      backgroundColor: 'red',
    },
    generativeTextCont: {
      marginTop: 15,
      backgroundColor: 'red',
      textAlign: 'center',
      paddingLeft: 20,
      paddingRight: 20,
    },
});

export default AchievmentModal;
