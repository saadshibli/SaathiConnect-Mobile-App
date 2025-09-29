import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface DistanceSliderProps {
    distance: number;
    onValueChange: (value: number) => void;
}

export const DistanceSlider: React.FC<DistanceSliderProps> = ({ distance, onValueChange }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Distance: <Text style={styles.distanceValue}>{distance} km</Text></Text>
            <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={distance}
                onValueChange={onValueChange}
                minimumTrackTintColor="#E53935"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#E53935"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 15,
        paddingBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#212529',
    },
    distanceValue: {
        color: '#E53935',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    distanceLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        marginTop: -5, // Pulls labels closer to slider
    },
    label: {
        fontSize: 12,
        color: '#6C757D',
    },
});

export default DistanceSlider;