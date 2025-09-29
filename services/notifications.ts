// import Constants from "expo-constants";
// import { Platform } from "react-native";
// import apiClient from "../api/client";
// // import * as Notifications from "expo-notifications"; // Removed to avoid conflict with dynamic import

// // Detect if running inside Expo Go. In Expo Go, remote push notifications are not supported.
// const isExpoGo = Constants.appOwnership === "expo";

// // Dynamically load expo-notifications only when supported, to avoid warnings/errors in Expo Go.
// let Notifications: typeof import("expo-notifications") | null = null;
// async function loadNotifications() {
//   if (!Notifications) {
//     Notifications = await import("expo-notifications");
//   }
//   return Notifications;
// }

// // Configure foreground handling only when supported
// if (!isExpoGo) {
//   // Best-effort setup; avoid crashing if something goes wrong
//   loadNotifications()
//     .then((N) => {
//       N.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowAlert: true,
//           shouldPlaySound: true,
//           shouldSetBadge: false,
//           // SDK 54: web-specific flags are ignored on native
//           shouldShowBanner: true as any,
//           shouldShowList: true as any,
//         }),
//       });
//     })
//     .catch(() => void 0);
// }

// export async function ensureAndroidChannel() {
//   if (isExpoGo) return; // no-op in Expo Go
//   if (Platform.OS === "android") {
//     const N = await loadNotifications();
//     await N.setNotificationChannelAsync("default", {
//       name: "Default",
//       importance: N.AndroidImportance.DEFAULT,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: "#FF231F7C",
//       sound: undefined,
//     });
//   }
// }

// export async function requestPushPermissions() {
//   if (isExpoGo) return false; // not supported in Expo Go
//   const N = await loadNotifications();
//   const settings = await N.getPermissionsAsync();
//   let finalStatus = settings.status;
//   if (finalStatus !== "granted") {
//     const { status } = await N.requestPermissionsAsync();
//     finalStatus = status;
//   }
//   return finalStatus === "granted";
// }

// export async function getNativePushToken() {
//   if (isExpoGo) return null; // not supported in Expo Go
//   const N = await loadNotifications();
//   // Returns FCM token on Android (when built with google-services.json)
//   const devicePushToken = await N.getDevicePushTokenAsync();
//   return devicePushToken?.data ?? null;
// }

// export async function registerFcmTokenWithServer(token: string) {
//   try {
//     await apiClient.post("/api/auth/fcm-token", { fcmToken: token });
//   } catch (err: any) {
//     const detail = err?.response?.data || err?.message || String(err);
//     console.warn("Failed to update FCM token on server:", detail);
//   }
// }

// export function addNotificationResponseListener(
//   onNavigate: (reportId: string) => void
// ) {
//   if (isExpoGo) {
//     // No-op unsubscriber in Expo Go
//     return () => {};
//   }

//   // Return an immediate unsubscriber, then set up the real listener async
//   let unsubscribe: () => void = () => {};
//   loadNotifications()
//     .then((N) => {
//       const sub = N.addNotificationResponseReceivedListener((response: any) => {
//         try {
//           const reportId = response?.notification?.request?.content?.data
//             ?.reportId as string | undefined;
//           if (reportId) onNavigate(reportId);
//         } catch {
//           // no-op
//         }
//       });
//       unsubscribe = () => sub.remove();
//     })
//     .catch(() => void 0);

//   return () => unsubscribe();
// }

// export async function navigateFromInitialNotification(
//   onNavigate: (reportId: string) => void
// ) {
//   if (isExpoGo) return; // not supported in Expo Go
//   const N = await loadNotifications();
//   const response = await N.getLastNotificationResponseAsync();
//   const reportId = response?.notification?.request?.content?.data?.reportId as
//     | string
//     | undefined;
//   if (reportId) onNavigate(reportId);
// }
