import { Modal, View, StyleSheet, Image} from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';

const IMAGE_SIZE = 300;

const PfpDisplayModal = ({ visible, onRequestClose, pfp }) => {
  const scale = useSharedValue(1);

  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      scale.value = event.scale;
    },
    onEnd: () => {
      scale.value = withTiming(1, { duration: 200 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={onRequestClose}
      transparent={true}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.modalBackground}>
          <PinchGestureHandler onGestureEvent={pinchHandler}>
            <Animated.View style={[styles.imageContainer, animatedStyle]}>
                <Image source={pfp} style={styles.image} />
            </Animated.View>
          </PinchGestureHandler>
          <View style={StyleSheet.absoluteFill} onTouchEnd={onRequestClose} />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    overflow: 'hidden',
    zIndex: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default PfpDisplayModal;