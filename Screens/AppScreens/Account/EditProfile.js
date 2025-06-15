import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator ,Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'react-native';
import { GlobalStyles } from '../../../Styles/GlobalStyles';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import basePfp from '../../../assets/userPfpBase.png';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';

function EditProfile({ navigation }) {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = useContext(AuthContext);

    const { userId = null, oldPfp = basePfp, oldName = '', oldDesc = '', oldIsPrivate = null } = route.params ?? {};
    const [oldValuesMissing, setOldValuesMissing] = useState(false);

    const [currentlySelectedPfp, setCurrentlySelectedPfp] = useState(oldPfp);
    const [choosenImage, setChoosenImage] = useState(null);
    const [newName, setNewName] = useState(oldName);
    const [newDesc, setNewDesc] = useState(oldDesc);
    const [isPrivate, setIsPrivate] = useState(oldIsPrivate);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userId === null || oldPfp === null || oldName === null || oldIsPrivate === null) {
            setOldValuesMissing(true);
        }
    }, [userId, oldPfp, oldName, oldIsPrivate]);

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Gato needs permission to access your photos to proceed.');
            return;
        }
    
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 1,
        });
    
        if (!res.canceled) {
            const selectedUri = res.assets[0].uri;
            setChoosenImage(selectedUri);
            setCurrentlySelectedPfp({ uri: selectedUri });
        }
    };
    
    const updateProfileData = async () => {
        setIsSaving(true);
        const newPfpChanged = choosenImage !== null;
        const nameChanged = newName !== oldName;
        const descChanged = newDesc !== oldDesc;
        const privateChanged = isPrivate !== oldIsPrivate;

        const anyChanges = newPfpChanged || nameChanged || descChanged || privateChanged;
        if (!anyChanges) {
            navigation.goBack();
            return;
        }

        const model = {
            newName: nameChanged ? newName?.trim() : null,
            newDesc: descChanged ? newDesc?.trim() : null,
            isVisible: privateChanged ? isPrivate : oldIsPrivate,
            newImageUri: newPfpChanged ? choosenImage : null,
        };

        try{
            const res = await UserDataService.updateProfileData(setIsAuthenticated, navigation, model);
            if(!res.ok){
                setIsSaving(false);
                return;
            }

            const data = await res.text();
            if(data){
                await UserDataService.setNewProfilePictureForUser(data);
            }

            navigation.navigate('ProfileDisplay', { shouldRefresh: true });

        }catch(error){
            return;
        }
    };

    const navigateBack = () => {
        navigation.goBack();
    };  

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
        <StatusBar style="light"  backgroundColor="#FF8303" translucent={false} hidden={false} />
        
        <View style={styles.topContainer}>
            <View style={styles.topContIngBack}>
                <TouchableOpacity style={styles.topBack} onPress={navigateBack}>
                    <ChevronLeft width={28} height={28} />
                </TouchableOpacity>
            </View>
            <View style={styles.topContIngTitle}>
                <Text style={[styles.topNameText]}>Edit profile</Text>
            </View>
            <View style={styles.topContIngReport}></View>
        </View>

        {oldValuesMissing ? (
            <View style={[GlobalStyles.flex]}>
                {/* GATO ERROR - NO VALID OLD DATA PASSED. THROW. */}
                <View style={styles.emptyGatoContainer}>

                </View>
                <View style={[GlobalStyles.center, GlobalStyles.padding15]}>
                    <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Upsss... something went horribly <Text style={[GlobalStyles.orange]}>wrong</Text>. Try to restart the application.</Text>
                </View>
            </View>
        ):(
            <>
                <View style={[GlobalStyles.flex, GlobalStyles.padding15]}>
                    <View style={[GlobalStyles.center]}>
                        <View style={[styles.cirleImgContainer]}>
                            <Image source={currentlySelectedPfp} style={styles.avatar}/>
                        </View>
                        <TouchableOpacity onPress={() => handleImagePick()}>
                            <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.textShadow]}>change your profile picture</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[GlobalStyles.text16, GlobalStyles.bold, {marginTop: 30}]}>Details: </Text>
                    <View style={{ gap: 20, marginTop: 20, paddingHorizontal: 5 }}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your name"
                                defaultValue={oldName}
                                onChangeText={setNewName}
                                selectionColor="#FF8303"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                placeholder="Write something about yourself"
                                defaultValue={oldDesc}
                                onChangeText={setNewDesc}
                                multiline
                                selectionColor="#FF8303"
                            />
                        </View>
                    </View>

                    <Text style={[GlobalStyles.text16, GlobalStyles.bold, {marginTop: 20}]}>Profile visilibity: </Text>
                    <View style={styles.visibilityRow}>
                        <Text style={[GlobalStyles.text16]}>Private profile</Text>
                        <Switch
                            value={isPrivate}
                            onValueChange={setIsPrivate}
                            trackColor={{ false: '#ccc', true: '#FF8303' }}
                            thumbColor={isPrivate ? '#FF8303' : '#FF8303'}
                        />
                    </View>

                    <TouchableOpacity style={styles.elevatedButton} onPress={() => updateProfileData()} >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ):(
                            <Text style={[GlobalStyles.text16, GlobalStyles.white]}>Update profile</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </>
        )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'whitesmoke',
  },
  emptyGatoContainer: {
    minHeight: 650,
  },
  topContainer: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topContIngBack: {
    width: '15%',
    height: '100%',
  },
  topContIngTitle: {
    width: '70%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContIngReport: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBack: {
    position: 'absolute',
    left: 10,
    height: '100%',
    justifyContent: 'center',
  },
  topNameText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },

  cirleImgContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  inputWrapper: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
        paddingVertical: 2,
        paddingHorizontal: 10,
        backgroundColor: 'whitesmoke',
    },
    inputLabel: {
        position: 'absolute',
        top: -10,
        left: 12,
        backgroundColor: 'whitesmoke',
        paddingHorizontal: 4,
        fontSize: 12,
        color: '#000',
    },
    input: {
        fontSize: 16,
        fontFamily: "Helvetica",
        paddingVertical: 10,
        color: "#333",
        paddingHorizontal: 0,
        textAlignVertical: 'top',
    },
    visibilityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 5,
    },

      elevatedButton: {
        minHeight: 50,
        backgroundColor: "#FF8303",
        width: '90%',
        position: 'absolute',
        bottom: 25,
        left: '10%',
        borderRadius: 20,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default EditProfile;