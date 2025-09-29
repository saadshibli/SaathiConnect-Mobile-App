import apiClient from './client';
import { AxiosError } from 'axios';

// This function is for the Home Screen feed
export const getNearbyReports = (params: { latitude: number; longitude: number; maxDistance?: number; category?: string; sortBy?: string; }) => {
    return apiClient.get('/api/reports/feed', { params });
};

// 🔧 ADD THIS MISSING FUNCTION
// Gets all reports submitted by the logged-in user
export const getMyReports = () => {
    return apiClient.get('/api/reports/my-reports');
};

// This function sends a report for a logged-in user
export const submitReport = async (formData: FormData) => {
    try {
        const response = await apiClient.post('/api/reports', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Submit report error:', error);
        
        if (error instanceof AxiosError) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.status === 400) {
                throw new Error('Please check all required fields and try again.');
            } else if (error.response?.status && error.response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
        }
        throw new Error('Network error. Please check your connection.');
    }
};

// This function sends a report for a guest user
export const submitAnonymousReport = async (formData: FormData) => {
    try {
        console.log('Submitting anonymous report...');
        const response = await apiClient.post('/api/reports/anonymous', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Submit anonymous report error:', error);
        
        // Type-safe error handling
        if (error instanceof AxiosError) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.status === 400) {
                throw new Error('Please check all required fields and try again.');
            } else if (error.response?.status && error.response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
        }
        throw new Error('Network error. Please check your connection.');
    }
};

export const getReportById = (id: string) => {
    return apiClient.get(`/api/reports/${id}`);
};
// This function upvotes a report
export const upvoteReportApi = (id: string) => {
    return apiClient.post(`/api/reports/${id}/upvote`);
};

export const getMapReports = (params: { 
    swLat: number; swLng: number; neLat: number; neLng: number; category?: string; 
}) => {
    return apiClient.get('/api/reports/map', { params });
};