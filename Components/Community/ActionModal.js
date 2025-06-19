import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GlobalStyles } from '../../Styles/GlobalStyles';

const ActionModal = ({ visible, onRequestClose, isFollowed, isPrivate, isRequested, onFollowRequest, onUnfollowRequest, onRemoveRequest, onBlockRequest, onReportRequest }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        if (visible) {
            setSelectedOption(null);
        }
    }, [visible]);

    const followPressed = () => {
        if(isFollowed){
            onUnfollowRequest();
        }else{
            onFollowRequest();
        }

        onRequestClose();
    };

    const removeRequestPressed = () => {
        onRemoveRequest();
        onRequestClose();
    };

    const requestFollowPressed = () => {
        onFollowRequest();
        onRequestClose();
    };

    const reportUserPressed = (reportCase) => {
        onReportRequest(reportCase);
        onRequestClose();
    }

    const blockUserPressed = () => {
        onBlockRequest();
        onRequestClose();
    };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
      transparent
    >
      <GestureHandlerRootView style={styles.wrapper}>
        <TouchableWithoutFeedback onPress={onRequestClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomContainer}>
            <View style={[GlobalStyles.center]}>
                {selectedOption === "Report" ? (
                    <Text style={[GlobalStyles.text16, GlobalStyles.bold]}>Why?</Text>
                ):(
                    <Text style={[GlobalStyles.text16, GlobalStyles.bold]}>What you wanna do?</Text>
                )}
            </View>
            <View style = {styles.hrLine}></View>

            {selectedOption ? (
                <>
                    {selectedOption === "Report" ? (
                        <>
                            <TouchableOpacity onPress={() => reportUserPressed(0)}>
                                <Text style={[GlobalStyles.text16]}>Spam</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => reportUserPressed(1)}>
                                <Text style={[GlobalStyles.text16]}>Underage person</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => reportUserPressed(2)}>
                                <Text style={[GlobalStyles.text16]}>Nudity</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => reportUserPressed(3)}>
                                <Text style={[GlobalStyles.text16]}>Harmfull</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => reportUserPressed(4)}>
                                <Text style={[GlobalStyles.text16]}>I just don't like it</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => reportUserPressed(5)}>
                                <Text style={[GlobalStyles.text16]}>Other</Text>
                            </TouchableOpacity>
                        </>
                    ) : (selectedOption === "Block") ? (
                        <>
                            <TouchableOpacity onPress={() => blockUserPressed()}>
                                <Text style={[GlobalStyles.text16, GlobalStyles.red]}>Block and report user</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => blockUserPressed()}>
                                <Text style={[GlobalStyles.text16, GlobalStyles.red]}>Just block</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                </>
            ):(
                <>
                    <TouchableOpacity onPress={() => setSelectedOption("Report")}>
                        <Text style={[GlobalStyles.text16, GlobalStyles.red]}>Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedOption("Block")}>
                        <Text style={[GlobalStyles.text16, GlobalStyles.red]}>Block</Text>
                    </TouchableOpacity>
                    {!isFollowed && isPrivate ? (
                        <>
                            {isRequested ? (
                                <TouchableOpacity onPress={() => removeRequestPressed()}>
                                    <Text style={[GlobalStyles.text16, GlobalStyles.black]}>Remove follow request</Text>
                                </TouchableOpacity>
                            ):(
                                <TouchableOpacity onPress={() => requestFollowPressed()}>
                                    <Text style={[GlobalStyles.text16, GlobalStyles.black]}>Follow</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ):(
                        <TouchableOpacity onPress={() => followPressed()}>
                            <Text style={[GlobalStyles.text16, GlobalStyles.black]}>{isFollowed ? "Unfollow" : "Follow"}</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}           
        </View>

      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomContainer: {
    minHeight: '25%',
    backgroundColor: 'whitesmoke',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: 'hidden',
    padding: 20,
    gap: 5,
  },
  hrLine: {
    borderBottomColor: 'black',
    opacity: 0.2,
    borderBottomWidth: 1,
    marginBottom: 10,
    marginTop: 10,
  },
});

export default ActionModal;
