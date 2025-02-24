import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

const NutriCircleMini = ({ value, maxValue, color, gradientColor, textValue }) => {
  const fullPercent = value / maxValue;

  const firstPart = Math.min(fullPercent, 1);
  const secondPart = fullPercent > 1 ? Math.min(fullPercent - 1, 1) : 0;

  const size = 60;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset1 = circumference - circumference * firstPart;
  const strokeDashoffset2 = circumference - circumference * secondPart;
  const rotationOffset = -90 + 360 * firstPart;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={gradientColor} />
          </LinearGradient>
          <LinearGradient id="grad2" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#C7253E" />
            <Stop offset="100%" stopColor="#E85C0D" />
          </LinearGradient>
        </Defs>
        <Circle
          stroke="#e6e6e6"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="url(#grad)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset1}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
        {secondPart > 0 && (
          <Circle
            stroke="url(#grad2)"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset2}
            strokeLinecap="round"
            transform={`rotate(${rotationOffset}, ${size / 2}, ${size / 2})`}
          />
        )}
        <SvgText
          x={size / 2}
          y={size / 2}
          fill="whitesmoke"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          dx="0.05em"
          dy="0.1em"
        >
          {textValue}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});

export default NutriCircleMini;
