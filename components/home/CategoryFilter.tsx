import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryFilterProps {
    selectedCategory: string | null;
    onSelectCategory: (categoryName: string | null) => void;
}

const allCategories = [
    { name: 'Pothole', icon: 'car-outline' },
    { name: 'Garbage', icon: 'trash-outline' },
    { name: 'Streetlight', icon: 'bulb-outline' },
    { name: 'Water Leak', icon: 'water-outline' },
    { name: 'Illegal Parking', icon: 'remove-circle-outline' },
    // Add more categories as needed
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {allCategories.map((category) => (
                    <TouchableOpacity
                        key={category.name}
                        style={[ styles.chip, selectedCategory === category.name && styles.selectedChip ]}
                        onPress={() => onSelectCategory(selectedCategory === category.name ? null : category.name)}
                    >
                        <Ionicons name={category.icon as any} size={18} color={selectedCategory === category.name ? '#FFFFFF' : '#495057'} />
                        <Text style={[ styles.chipText, selectedCategory === category.name && styles.selectedChipText ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: { marginBottom: 15 },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#212529' },
    categoryChips: { flexDirection: 'row' },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 10,
    },
    selectedChip: {
        backgroundColor: '#E53935',
    },
    chipText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
    selectedChipText: {
        color: '#FFFFFF',
    },
});

export default CategoryFilter;