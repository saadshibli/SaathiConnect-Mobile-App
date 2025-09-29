import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// Define the shape of the filters object
export interface Filters {
    maxDistance: number;
    category: string;
    sortBy: 'upvotes' | 'recent';
}

interface FilterBarProps {
    activeFilters: Filters;
    onFilterChange: (newFilters: Partial<Filters>) => void;
}

const CATEGORIES = ["All", "Pothole", "Garbage", "Streetlight", "Other"];

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilters, onFilterChange }) => {
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {CATEGORIES.map(category => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.chip,
                            activeFilters.category === (category === "All" ? "" : category) && styles.activeChip
                        ]}
                        onPress={() => onFilterChange({ category: category === "All" ? "" : category })}
                    >
                        <Text style={[styles.chipText, activeFilters.category === (category === "All" ? "" : category) && styles.activeChipText]}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.row}>
                {/* 🔧 FIX: This is the new slider section */}
                <View style={styles.sliderContainer}>
                    <Ionicons name="walk-outline" size={20} color="#6C757D" />
                    <Slider
                        style={{ flex: 1, height: 40 }}
                        minimumValue={500}
                        maximumValue={25000}
                        step={500}
                        value={activeFilters.maxDistance}
                        onSlidingComplete={(value) => onFilterChange({ maxDistance: value })}
                        minimumTrackTintColor="#E53935"
                        maximumTrackTintColor="#CED4DA"
                        thumbTintColor="#E53935"
                    />
                    <Ionicons name="car-outline" size={20} color="#6C757D" />
                </View>

                {/* This button toggles sorting */}
                <TouchableOpacity style={styles.sortButton} onPress={() => onFilterChange({ sortBy: activeFilters.sortBy === 'upvotes' ? 'recent' : 'upvotes' })}>
                    <Ionicons name={activeFilters.sortBy === 'upvotes' ? 'trending-up' : 'time-outline'} size={18} color="#495057" />
                    <Text style={styles.sortText}>
                        {activeFilters.sortBy === 'upvotes' ? 'Popular' : 'Recent'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.distanceLabel}>
                Range: {(activeFilters.maxDistance / 1000).toFixed(1)} km
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
        paddingHorizontal: 16,
    },
    scrollContainer: {
        paddingBottom: 16,
    },
    chip: {
        backgroundColor: '#F1F3F5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    activeChip: {
        backgroundColor: '#212529',
    },
    chipText: {
        color: '#495057',
        fontWeight: '600',
    },
    activeChipText: {
        color: '#FFFFFF',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    distanceContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F3F5',
        borderRadius: 8,
        padding: 4,
    },
    distanceChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    activeDistanceChip: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    distanceChipText: {
        color: '#495057',
        fontSize: 12,
        fontWeight: 'bold',
    },
    activeDistanceChipText: {
        color: '#E53935',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortText: {
        marginLeft: 6,
        color: '#495057',
        fontWeight: '600',
    },// 🔧 FIX: Added missing styles
    sliderContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    distanceLabel: {
        fontSize: 12,
        color: '#6C757D',
        textAlign: 'center',
        marginTop: -8, // Adjust to be closer to the slider
    },
});