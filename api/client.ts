import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// This is the "street address" of your backend server running on your laptop.
// To find this, open a new terminal and type `ipconfig` (Windows) or `ifconfig` (Mac).
// Look for the "IPv4 Address".
const LOCAL_DEV_URL = 'http://Saathi-connect-app-env.eba-4j2pkbeb.ap-south-1.elasticbeanstalk.com/';

const apiClient = axios.create({
    baseURL: LOCAL_DEV_URL
});

// Request Interceptor: Automatically attach the access token to every request
apiClient.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: This is where the magic happens
apiClient.interceptors.response.use(
    // If the response is successful, just return it
    (response) => response,
    // If the response is an error...
    async (error) => {
        const originalRequest = error.config;
        
        // Check if it's a 401 error and we haven't already tried to refresh
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark that we've tried to refresh

            try {
                // Get the refresh token from secure storage
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (!refreshToken) return Promise.reject(error); // No refresh token, fail normally

                // Make the request to the refresh-token endpoint
                const { data } = await apiClient.post('/api/auth/refresh-token', { token: refreshToken });
                const newAccessToken = data.accessToken;

                // Save the new access token
                await SecureStore.setItemAsync('accessToken', newAccessToken);

                // Update the header of the original failed request with the new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If the refresh token is also invalid, we must log the user out.
                // In a real app, you would call your signOut function from the AuthContext here.
                console.error("Session expired. Please log in again.");
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                await SecureStore.deleteItemAsync('user');
                // You might want to navigate the user to the login screen here.
                return Promise.reject(refreshError);
            }
        }
        
        // For any other error, just return the error
        return Promise.reject(error);
    }
);

export default apiClient;

