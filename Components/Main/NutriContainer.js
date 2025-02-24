import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import NutriCircleExt from './NutriCircleExt';
import NutriCircleMini from './NutriCircleMini';

const NutriContainer = ({ intakeData, dailyMax, system = "metric" }) => {
  const [settedSystem] = useState(system);
  const [dailyData, setDailyData] = useState(intakeData ?? null);
  const [dailyMaxData, setDailyMaxData] = useState(dailyMax ?? null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentColor, setCurrentColor] = useState("#ff6600");
  const totalPages = 4;
  const swipeThreshold = 50;

  const onPanGestureEvent = (event) => {
    const { translationX, state } = event.nativeEvent;
    if (state === State.END) {
      if (translationX < -swipeThreshold) {
        setCurrentPage(currentPage === totalPages - 1 ? 0 : currentPage + 1);
      } else if (translationX > swipeThreshold) {
        setCurrentPage(currentPage === 0 ? totalPages - 1 : currentPage - 1);
      }
    }
  };
  
  useEffect(() => {
    switch (currentPage) {
      case 0:
        setCurrentColor("#FF8303");
        break;
      case 1:
        setCurrentColor("#09a357");
        break;
      case 2:
        setCurrentColor("#A35709");
        break;
      case 3:
        setCurrentColor("#030eff");
        break;
    }
  }, [currentPage]);

  const renderDots = () => {
    return (
      <View style={styles.dotContainer}>
        {[...Array(totalPages)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderMainNutriCircle = () => {
    switch (currentPage) {
      case 0:
        return <NutriCircleExt value={dailyData.calories} maxValue={dailyMaxData.calories} color={"#FF8303"} gradientColor={"#ffe600"} />;
      case 1:
        return <NutriCircleExt value={dailyData.protein} maxValue={dailyMaxData.protein} color={"#09a357"} gradientColor={"#0dff03"} />;
      case 2:
        return <NutriCircleExt value={dailyData.fat} maxValue={dailyMaxData.fat} color={"#A35709"} gradientColor={"#a2a309"} />;
      case 3:
        return <NutriCircleExt value={dailyData.carbs} maxValue={dailyMaxData.carbs} color={"#030eff"} gradientColor={"#038CFF"} />;
      default:
        return null;
    }
  };

  const renderMiniCircles = () => {
    switch (currentPage) {
      case 0:
        return (
          <>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.protein} maxValue={dailyMaxData.protein} color={"#09a357"} gradientColor={"#0dff03"} textValue={"P"} />
            </View>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.fat} maxValue={dailyMaxData.fat} color={"#A35709"} gradientColor={"#a2a309"} textValue={"F"} />
            </View>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.carbs} maxValue={dailyMaxData.carbs} color={"#030eff"} gradientColor={"#038CFF"} textValue={"C"} />
            </View>
          </>
        );
      case 1:
        return (
          <>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.calories} maxValue={dailyMaxData.calories} color={"#FF8303"} gradientColor={"#ffe600"} textValue={settedSystem === "metric" ? "K" : "C"} />
            </View>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.fat} maxValue={dailyMaxData.fat} color={"#A35709"} gradientColor={"#a2a309"} textValue={"F"} />
            </View>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.carbs} maxValue={dailyMaxData.carbs} color={"#030eff"} gradientColor={"#038CFF"} textValue={settedSystem === "metric" ? "K" : "C"} />
            </View>
          </>
        );
      case 2:
        return (
          <>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.calories} maxValue={dailyMaxData.calories} color={"#FF8303"} gradientColor={"#ffe600"} textValue={settedSystem === "metric" ? "K" : "C"} />
            </View>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.protein} maxValue={dailyMaxData.protein} color={"#09a357"} gradientColor={"#0dff03"} textValue={"P"} />
            </View>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.carbs} maxValue={dailyMaxData.carbs} color={"#030eff"} gradientColor={"#038CFF"} textValue={settedSystem === "metric" ? "K" : "C"} />
            </View>
          </>
        );
      case 3:
        return (
          <>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.calories} maxValue={dailyMaxData.calories} color={"#FF8303"} gradientColor={"#ffe600"} textValue={settedSystem === "metric" ? "K" : "C"} />
            </View>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.protein} maxValue={dailyMaxData.protein} color={"#09a357"} gradientColor={"#0dff03"} textValue={"P"} />
            </View>
            <View style={styles.smallCircleContainer}>
              <NutriCircleMini value={dailyData.fat} maxValue={dailyMaxData.fat} color={"#A35709"} gradientColor={"#a2a309"} textValue={"F"} />
            </View>
          </>
        );
      default:
        return null;
    }
  };

  const titleGen = () => {
    switch (currentPage) {
      case 0:
        return "Today's Calories";
      case 1:
        return "Today's Proteins";
      case 2:
        return "Today's Fats";
      case 3:
        return "Today's Carbs";
      default:
        return "";
    }
  };

  const currentValueGen = () => {
    switch (currentPage) {
      case 0:
        return `${dailyData.calories}`;
      case 1:
        return `${dailyData.protein}`;
      case 2:
        return `${dailyData.fat}`;
      case 3:
        return `${dailyData.carbs}`;
      default:
        return "";
    }
  };
  
  const totalValueGen = () => {
    switch (currentPage) {
      case 0:
        if(system === "metric"){
          return `${"/ " + dailyMaxData.calories + " kcal"}`;
        }else{
          return `${"/ " + dailyMaxData.calories + " cal"}`;
        }
      case 1:
        return `${"/ " + dailyMaxData.protein + " g"}`;
      case 2:
        return `${"/ " + dailyMaxData.fat + " g"}`;
      case 3:
        return `${"/ " + dailyMaxData.carbs + " g"}`;
      default:
        return "";
    }
  };

  return (
    <GestureHandlerRootView style={styles.outerContainer}>
      <PanGestureHandler onHandlerStateChange={onPanGestureEvent}>
        <LinearGradient
          colors={[currentColor, '#000']}
          start={[0, 0]}
          end={[0.5, 1]}
          style={styles.glassEffect}
        >
          <View style={styles.leftMainCont}>
            {renderMainNutriCircle()}
          </View>
          <View style={styles.rightMainCont}>
            <View style={styles.rightTop}>
              <View style={styles.headerTextCont}>
                <Text style={[GlobalStyles.text28, GlobalStyles.bold, GlobalStyles.orange, { color: currentColor }]}>
                  {titleGen()}
                </Text>
              </View>
              <View style={styles.mainTextCont}>
                <Text style={[GlobalStyles.text32, GlobalStyles.bold, GlobalStyles.textShadow, GlobalStyles.white]}>{currentValueGen()}</Text>
              </View>
              <View style={styles.secondaryTextCont}>
                <Text style={[GlobalStyles.text24, GlobalStyles.bold, GlobalStyles.textShadow, { color: currentColor }]}>{totalValueGen()}</Text>
              </View>
            </View>
            <View style={styles.rightBottom}>
              {renderMiniCircles()}
            </View>
          </View>
        </LinearGradient>
      </PanGestureHandler>
      <View style={styles.swipeContainer}>
        {renderDots()}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassEffect: {
    width: '100%',
    flex: 0.95,
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 5,
  },
  swipeContainer: {
    flex: 0.05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: 'black',
  },
  dotInactive: {
    backgroundColor: 'gray',
  },
  leftMainCont: {
    flex: 0.4,
  },
  rightMainCont: {
    flex: 0.6,
  },
  rightTop: {
    flex: 0.55,
    paddingVertical: 10,
  },
  rightBottom: {
    flex: 0.55,
    flexDirection: 'row',
  },
  smallCircleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTextCont: {
    flex: 0.3,
    justifyContent: 'center',
    paddingLeft: 15,
  },
  mainTextCont: {
    flex: 0.6,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingLeft: 20,
  },
  secondaryTextCont: {
    flex: 0.5,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 20,
  },
});

export default NutriContainer;
