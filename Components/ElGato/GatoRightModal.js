import React from 'react';
import { Modal, View, TouchableOpacity, Text, TouchableWithoutFeedback, Image } from 'react-native';
import { GatoRightModalStyles } from '../../Styles/Components/GatoRightModalStyles.js';

const GatoRightModal = ({
  visible,
  onRequestClose,
  elGatoProceedAdding,
}) => {
  return (
    <Modal
      animationType="slide"
      visible={visible}
      statusBarTranslucent
      onRequestClose={onRequestClose}
      transparent={true}
    >
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style = {GatoRightModalStyles.elGatoAddOverlay}>
              <View style = {GatoRightModalStyles.elGatoAddBubbleContainer}>
                <Image source={require('../../assets/main/Gato/speechBubble.png')} style={GatoRightModalStyles.elGatoBubbleImage} />
              </View>
              <View style = {GatoRightModalStyles.elGatoAddMainContainer}>

              </View>
              <TouchableOpacity onPress={elGatoProceedAdding}>
                <View style = {GatoRightModalStyles.elGatoAddConfirm}>
                  <Text style = {GatoRightModalStyles.elGatoConfirmText}>Let's do it!</Text>
                </View>
              </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default GatoRightModal;