import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationContextType {
    userLocation: Location.LocationObject | null;
    errorMsg: string | null;
    requestLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function useLocation() {
    return useContext(LocationContext);
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const requestLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }
        try {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);
        } catch (error) {
            Alert.alert("Error", "Could not fetch location.");
        }
    };

    useEffect(() => {
        requestLocation();
    }, []);

    return (
        <LocationContext.Provider value={{ userLocation, errorMsg, requestLocation }}>
            {children}
        </LocationContext.Provider>
    );
}