import React, { useContext, useState, useEffect, useRef } from 'react';
import Slider from '@react-native-community/slider';
import Svg, { Circle } from 'react-native-svg';
import { View, Text, StyleSheet, ScrollView, StatusBar, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline } from 'react-native-maps';
import { routeDecoder } from '../../../Services/Helpers/Location/RouteDecoder.js';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';

import PublicSVG from '../../../assets/main/Diet/globe.svg';
import PrivateSVG from '../../../assets/main/Diet/lock.svg';

function CardioSummary({ navigation, data, onSaveNotes }) {
  const { setIsAuthenticated } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);

  const [visibility, setVisibility] = useState('public');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [feelingValue, setFeelingValue] = useState(50);
  const tempRef = useRef(feelingValue);

  const elapsedTime = data?.elapsedTime || '00:45:32';
  const avgSpeed = data?.avgSpeed || '2.5';
  const avgHeartRate = data?.avgHeartRate || 120;
  const calories = data?.calories || 300;
  const encodedRoute = data?.route || "s}hcFzyzuO}@nHz@pGh@tE~@dDv@lCz@rCh@dBd@tBz@rCh@xCl@hBdArCn@pB";

  const [notes, setNotes] = useState(data?.description || '');
  const [routePoints, setRoutePoints] = useState([]);
  useEffect(() => {
      if(encodedRoute){
        const points = routeDecoder(encodedRoute);
        setRoutePoints(points);
      }
  }, [encodedRoute]);

  const getFeeling = (v) => {
    if (v <= 20)   return { label: 'Terrible',  color: '#D32F2F' };
    if (v <= 40)   return { label: 'Bad',       color: '#F57C00' };
    if (v <= 60)   return { label: 'Neutral',   color: '#757575' };
    if (v <= 80)   return { label: 'Good',      color: '#388E3C' };
                  return { label: 'Great',     color: '#2E7D32' };
  };

  const handleBlur = () => {
    if (onSaveNotes) {
      onSaveNotes(notes);
    }
  };

  const saveTrainingClicked = () => {
    setIsSaving(true);

    //API CALL
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: '#FF8303' }} />
      <StatusBar barStyle="light-content" backgroundColor="#FF8303" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Swimming</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.descriptionTitle}>Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.alwaysExpanded}>
            <View style={styles.alwaysExpandedRow}>
              <View style={styles.valueWrapper}>
                <Text style={styles.valueLabel}>Time</Text>
                <Text style={styles.valueText}>{elapsedTime}</Text>
              </View>
              <View style={styles.valueWrapper}>
                <Text style={styles.valueLabel}>Avg. Speed</Text>
                <Text style={styles.valueText}>
                  {avgSpeed} <Text style={[GlobalStyles.text14]}>km/h</Text>
                </Text>
              </View>
            </View>
            <View style={styles.alwaysExpandedRow}>
              <View style={styles.valueWrapper}>
                <Text style={styles.valueLabel}>Avg. HR</Text>
                <Text style={styles.valueText}>
                  {avgHeartRate} <Text style={[GlobalStyles.text14]}>bpm</Text>
                </Text>
              </View>
              <View style={styles.valueWrapper}>
                <Text style={styles.valueLabel}>Calories</Text>
                <Text style={[styles.valueText, GlobalStyles.orange]}>
                  {calories} <Text style={[GlobalStyles.text14, { color: 'black' }]}>kcal</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.descriptionTitle}>Session Notes</Text>
        <View style={[styles.blockContainer, {minHeight: 100}]}>
          <TextInput
            style={styles.textInput}
            value={notes}
            onChangeText={setNotes}
            selectionColor="#FF8303"
            onBlur={handleBlur}
            placeholder="Write your session notes here..."
            multiline
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.descriptionTitle}>Exercise route</Text>
        <View style={[styles.blockContainer, {minHeight: 250}]}>
          {routePoints.length > 0 && (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude:   routePoints[(routePoints.length / 2)].latitude,
                longitude:  routePoints[(routePoints.length / 2)].longitude,
                latitudeDelta:  0.01,
                longitudeDelta: 0.01,
              }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                toolbarEnabled={false}
                cacheEnabled={true} 
            >
              <Polyline
                coordinates={routePoints}
                strokeColor="#FF8303"
                strokeWidth={4}
              />
            </MapView>
          )}
        </View>

        <Text style={styles.descriptionTitle}>Feeling</Text>
        <View style={[styles.blockContainer]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 }}>
            <Text style={[styles.valueText, { fontSize: 18, color: getFeeling(feelingValue).color }]}>
              {getFeeling(feelingValue).label}
            </Text>
          </View>

          <View style={{ width: '100%', height: 40, position: 'relative' }}>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={feelingValue}
              onValueChange={v => { tempRef.current = v; }}
              onSlidingComplete={v => setFeelingValue(v)}
              minimumTrackTintColor={getFeeling(feelingValue).color}
              maximumTrackTintColor="#ccc"
              thumbTintColor="black"
            />

            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 15, right: 15,
                top: 12.5,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              {Array.from({ length: 11 }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 1,
                    height: 15,
                    backgroundColor: '#000',
                  }}
                />
              ))}
            </View>
          </View>

          <Text style={{ textAlign: 'center', marginTop: 4 }}>
            {feelingValue}
          </Text>
        </View>

        <Text style={styles.descriptionTitle}>Private Notes <PrivateSVG /></Text>
        <View style={[styles.blockContainer, {minHeight: 50}]}>
          <TextInput
            style={styles.textInputPriv}
            value={notes}
            onChangeText={setNotes}
            selectionColor="#FF8303"
            onBlur={handleBlur}
            placeholder="Write your private notes here :) They won't be visible to anybody."
            multiline
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.descriptionTitle}>Visibility</Text>
        <View style={[styles.blockContainer, { minHeight: 75 }]}>
          <TouchableOpacity
            style={styles.dropdownToggle}
            activeOpacity={0.7}
            onPress={() => setDropdownVisible(v => !v)}
          >
            {visibility === 'public' ? (
              <PublicSVG width={20} height={20} style={{ marginRight: 8 }} />
            ) : (
              <PrivateSVG width={20} height={20} style={{ marginRight: 8 }} />
            )}
            <Text style={styles.dropdownText}>
              {visibility === 'public' ? 'Public' : 'Private'}
            </Text>
            <Text style={styles.caret}>▾</Text>
          </TouchableOpacity>

          {dropdownVisible && (
            <View style={styles.dropdownMenu}>
              {visibility === 'public' ? (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setVisibility('private');
                    setDropdownVisible(false);
                  }}
                >
                  <PrivateSVG width={16} height={16} style={{ marginRight: 8 }} />
                  <Text style={styles.dropdownText}>Private</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setVisibility('public');
                    setDropdownVisible(false);
                  }}
                >
                  <PublicSVG width={16} height={16} style={{ marginRight: 8 }} />
                  <Text style={styles.dropdownText}>Public</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={[GlobalStyles.flex, GlobalStyles.center]}>
          <Text style={[GlobalStyles.orange, GlobalStyles.text16, {textAlign: 'center'}]}>Training details will be displayed in cardio section in trainings.</Text>
        </View>

        <View style={styles.buttonSpacing}></View>

      </ScrollView>
      <TouchableOpacity style={styles.elevatedButton} onPress={() => saveTrainingClicked()}>
        {isSaving ? (
          <ActivityIndicator size="small" color="#FFF" />
        ):(
          <Text style={[GlobalStyles.text16, GlobalStyles.white]}>Save training</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  headerContainer: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#FF8303',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alwaysExpanded: {
    marginBottom: 10,
  },
  alwaysExpandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  valueWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 14,
    color: '#555',
  },
  valueText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  blockContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 100,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    minHeight: 80,
  },
  textInputPriv: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    minHeight: 50,
  },

  dropdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  caret: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#555',
  },
  dropdownMenu: {
    marginTop: 4,

    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  buttonSpacing: {
    height: 75,
  },
  elevatedButton: {
    minHeight: 50,
    backgroundColor: "#FF8303",
    width: '80%',
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

export default CardioSummary;
