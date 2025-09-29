import apiClient from './client';

// Add ': string' after each parameter to define its type.
export const loginUser = (email: string, password: string) => {
    return apiClient.post('/api/auth/login', { email, password });
};

export const registerUser = (name: string, email: string, password: string) => {
    return apiClient.post('/api/auth/register', { name, email, password });
};

// export const updateFcmToken = (fcmToken: string) => {
//     return apiClient.post('/api/auth/fcm-token', { fcmToken });
// };