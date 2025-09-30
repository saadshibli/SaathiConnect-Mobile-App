import 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { LocationProvider } from "../contexts/LocationContext";
import { ActivityIndicator, View } from "react-native";
// merged imports above
// import {
//   ensureAndroidChannel,
//   requestPushPermissions,
//   getNativePushToken,
//   registerFcmTokenWithServer,
//   addNotificationResponseListener,
//   navigateFromInitialNotification,
// } from "../services/notifications";

SplashScreen.preventAutoHideAsync();

// function PushBootstrapper({ children }: { children: React.ReactNode }) {
//   const { session } = useAuth()!;
//   const router = useRouter();

//   useEffect(() => {
//     ensureAndroidChannel();
//     navigateFromInitialNotification((reportId) => {
//       router.push(`/report/${reportId}`);
//     });

//     // Navigate on notification tap
//     const remove = addNotificationResponseListener((reportId) => {
//       router.push(`/report/${reportId}`);
//     });
//     return remove;
//   }, [router]);

//   useEffect(() => {
//     // Whenever user is signed in, register FCM token with backend
//     const syncToken = async () => {
//       if (!session?.accessToken) return;
//       const granted = await requestPushPermissions();
//       if (!granted) return;
//       const token = await getNativePushToken();
//       if (token) {
//         await registerFcmTokenWithServer(token);
//       }
//     };
//     syncToken();
//   }, [session?.accessToken]);

//   return <>{children}</>;
// }
function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  
  if (auth?.session.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }
  
  return <>{children}</>;
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <LocationProvider>
            <LoadingWrapper>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="splash" />
                <Stack.Screen name="language" />
                <Stack.Screen name="welcome" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="report-modal"
                  options={{ presentation: "fullScreenModal" }}
                />
                <Stack.Screen
                  name="location-picker-modal"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen
                  name="edit-profile-modal"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen
                  name="all-badges-modal"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen
                  name="settings"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="change-password-modal"
                  options={{ presentation: "modal" }}
                />
              </Stack>
            </LoadingWrapper>
          </LocationProvider>
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
