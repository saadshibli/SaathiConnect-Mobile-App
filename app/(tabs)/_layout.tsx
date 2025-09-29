import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

// This is the custom component for our floating action button.
const ReportButton = () => {
    const router = useRouter();
    return (
        // 🔧 FIX: Wrap the button in a container View for better positioning control.
        <View style={styles.fabWrapper}>
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => router.push('/report-modal')}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: '#6C757D',
        tabBarStyle: {
            height: 60 + insets.bottom, // Add bottom inset to the height
            paddingBottom: insets.bottom, // Add the actual padding
            position: 'absolute', // Often helps with custom button layouts
            borderTopWidth: 1,
            borderTopColor: '#E9ECEF',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="map-pin" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          tabBarButton: () => <ReportButton />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
    // 🔧 FIX: New wrapper style
    fabWrapper: {
        // position: 'absolute',
        bottom: 15, // Aligns it nicely with the tab bar icons
        left: '50%',
        marginLeft: -30, // Center the button (half of its width)
        width: 60,
        height: 60,
        zIndex: 1, // 🔧 FIX: High zIndex to ensure it's on top of everything
    },
    // 🔧 FIX: Renamed from fabContainer to fab
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E53935',
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
});