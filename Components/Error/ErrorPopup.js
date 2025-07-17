import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView, StatusBar } from 'react-native';
import { errorTrim } from '../../Services/Errors/ErrorTrimer.js';

const ErrorPopup = ({ visible, message, onClose }) => {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      progress.setValue(0);

      Animated.timing(progress, {
        toValue: 1,
        duration: 7000,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        onClose();
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const progressBarWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.7)" barStyle="light-content" />
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity style={styles.popupContainer} activeOpacity={1}>
          <View style={styles.popupTopContainer}>
            <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
          </View>
          <View style={styles.popupErrorContainer}>
            <Text style={styles.errorText}>{errorTrim(message)}</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  popupContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  popupTopContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  progressBar: {
    height: 5,
    backgroundColor: '#FF8303',
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  popupErrorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: 'whitesmoke',
    fontFamily: 'Helvetica',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ErrorPopup;