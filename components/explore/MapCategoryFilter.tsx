import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface MapCategoryFilterProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

const CATEGORIES = ["All", "Pothole", "Garbage", "Streetlight", "Other"];

export const MapCategoryFilter: React.FC<MapCategoryFilterProps> = ({ activeCategory, onCategoryChange }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
            {CATEGORIES.map(category => (
                <TouchableOpacity
                    key={category}
                    style={[
                        styles.chip,
                        activeCategory === (category === "All" ? "" : category) && styles.activeChip
                    ]}
                    onPress={() => onCategoryChange(category === "All" ? "" : category)}
                >
                    <Text style={[styles.chipText, activeCategory === (category === "All" ? "" : category) && styles.activeChipText]}>
                        {category}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    chip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    activeChip: {
        backgroundColor: '#212529',
        borderColor: '#212529',
    },
    chipText: {
        color: '#212529',
        fontWeight: '600',
    },
    activeChipText: {
        color: '#FFFFFF',
    },
});