import React, { useState } from 'react';

import { Modal, View,StyleSheet, TouchableOpacity, Text, ScrollView, TouchableWithoutFeedback, ImageBackground } from 'react-native';
import { AddIngredientStyles } from '../../Styles/Diet/AddIngredientStyles';

import { AuthContext } from '../../Services/Auth/AuthContext.js';
import AuthService from '../../Services/Auth/AuthService.js';
import config from '../../Config.js';

import { fetchWithTimeout } from '../../Services/ApiCalls/fetchWithTimeout';

const ReportMealModal = ({
    visible,
    closeReportModal,
    item,
  }) => {

    const { setIsAuthenticated } = useContext(AuthContext);

    const sendReport = async (reportCase) => {
      try{
        const token = await AuthService.getToken();
      
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return;
        }

        let requestBody = {
            mealId : item.stringId,
            mealName : item.name,
            cause : reportCase,
        };

        await fetchWithTimeout(
          `${config.ipAddress}/api/UserRequest/ReportMealRequest`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          },
          config.timeout
        );

      }catch(error){
        //error
        console.log(error);
      }

      closeReportModal();
    };

    return (

      <Modal
        animationType="slide"
        visible={visible}
        onRequestClose={closeReportModal}
        transparent={true}
      >
        <View style={AddIngredientStyles.reportModalOverlay}>
          <TouchableWithoutFeedback onPress={closeReportModal}>
            <View style={AddIngredientStyles.reportModalClosingTransparent}></View>
          </TouchableWithoutFeedback>

          <View style={AddIngredientStyles.reportModalContainer}>
            <View style={AddIngredientStyles.reportTitleCont}>
              <Text style={AddIngredientStyles.reportTitleText}>Report recipe</Text>
            </View>
            <View style = {AddIngredientStyles.reportHr}></View>
            <View style={AddIngredientStyles.reportDescCont}>
              <Text style={AddIngredientStyles.reportDescTextBold}>Why are you reporting this?</Text>
              <Text style={AddIngredientStyles.reportDescText}>Reporting offensive language will always be anonymus. blablabla.</Text>
            </View>

            <View style={AddIngredientStyles.reportOptionsCont}>
              <TouchableOpacity onPress={() => sendReport(1)}>
                <Text style={AddIngredientStyles.reportOptionText}>Offensive/Inappropriate recipe name</Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={() => sendReport(2)}>
                <Text style={AddIngredientStyles.reportOptionText}>Inappropriate revipe image</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(3)}>
                <Text style={AddIngredientStyles.reportOptionText}>Racism or offensive language</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(4)}>
                <Text style={AddIngredientStyles.reportOptionText}>Misleading information</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(5)}>
                <Text style={AddIngredientStyles.reportOptionText}>Incorrect recipe makro</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(6)}>
                <Text style={AddIngredientStyles.reportOptionText}>I just don't like it</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(7)}>
                <Text style={AddIngredientStyles.reportOptionText}>Spam</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sendReport(8)}>
                <Text style={AddIngredientStyles.reportOptionText}>Something else</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    );
  };

export default ReportMealModal;