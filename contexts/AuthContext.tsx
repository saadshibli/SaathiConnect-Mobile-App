    import React, { createContext, useState, useContext, useEffect } from 'react';
    import * as SecureStore from 'expo-secure-store';

    // 🔧 FIX: Define a type for a single badge
    interface Badge {
        name: string;
        earnedAt: string;
    }

    // 🔧 FIX: Add the optional badges property to the User interface
    interface User {
        id: string;
        name: string;
        email: string;
        role: string;
        avatarUrl?: string;
        badges?: Badge[]; // This is the new property
    }

    interface AuthContextType {
        session: { 
            accessToken: string | null; 
            refreshToken: string | null;
            isLoading: boolean;
            user: User | null; 
        };
        signIn: (token: string, refreshToken: string, user: User) => void;
        signOut: () => void;
        setTokens: (accessToken: string, refreshToken: string) => void;
    }

    const AuthContext = createContext<AuthContextType | null>(null);

    export function useAuth() { return useContext(AuthContext); }

    export function AuthProvider({ children }: { children: React.ReactNode }) {
        const [session, setSession] = useState<AuthContextType['session']>({
            accessToken: null,
            refreshToken: null,
            isLoading: true,
            user: null,
        });

        useEffect(() => {
            const loadSession = async () => {
                const accessToken = await SecureStore.getItemAsync('accessToken');
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                const userString = await SecureStore.getItemAsync('user');
                const user = userString ? JSON.parse(userString) : null;
                setSession({ accessToken, refreshToken, user, isLoading: false });
            };
            loadSession();
        }, []);

        const setTokens = async (accessToken: string, refreshToken: string) => {
            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshToken);
            setSession(prev => ({ ...prev, accessToken, refreshToken }));
        };

        const authContextValue: AuthContextType = {
            signIn: async (accessToken, refreshToken, user) => {
                await setTokens(accessToken, refreshToken);
                await SecureStore.setItemAsync('user', JSON.stringify(user));
                setSession(prev => ({ ...prev, user, isLoading: false }));
            },
            signOut: async () => {
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                await SecureStore.deleteItemAsync('user');
                setSession({ accessToken: null, refreshToken: null, user: null, isLoading: false });
            },
            setTokens,
            session,
        };

        return (
            <AuthContext.Provider value={authContextValue}>
                {children}
            </AuthContext.Provider>
        );
    }