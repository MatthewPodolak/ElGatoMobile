import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const NutriCircle = ({ value, label, color }) => {
    const radius = 35;
    const strokeWidth = 10;
    const circ = 2 * Math.PI * radius;
    const progress = (value / 100) * circ;

    const getTranslateX = () => {
        const length = value.toString().length;
        if (length === 1) return -5;
        if (length === 2) return -10;
        if (length == 3) return -15;
        if (length >= 4) return -20;
        return -10;
    };

    return (
        <View style={styles.nutrientContainer}>
            <Svg height={radius * 2 + strokeWidth} width={radius * 2 + strokeWidth}>
                <Circle
                    cx={radius + strokeWidth / 2}
                    cy={radius + strokeWidth / 2}
                    r={radius}
                    stroke="#E6E6E6"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={radius + strokeWidth / 2}
                    cy={radius + strokeWidth / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${progress}, ${circ}`}
                    fill="none"
                    rotation="-90"
                    origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}
                />
                <Text
                    style={[
                        styles.centeredValueText,
                        { transform: [{ translateX: getTranslateX() }, { translateY: 27 }] },
                    ]}
                >
                    {value}
                </Text>
            </Svg>
            <Text style={styles.labelText}>
                {label === "Kcal" ? label : `${label} (g)`}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    nutrientContainer: {
        alignItems: 'center',
    },
    centeredValueText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    labelText: {
        fontSize: 16,
        color: '#333',
        marginTop: 4,
    },
});

export default NutriCircle;
