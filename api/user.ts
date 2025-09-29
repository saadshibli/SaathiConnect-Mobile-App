import apiClient from './client';

export const getMyProfile = () => {
    return apiClient.get('/api/users/me');
};

export const updateUserProfile = (formData: FormData) => {
    return apiClient.patch('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const changePassword = (data: { currentPassword: string, newPassword: string }) => {
    return apiClient.patch('/api/users/me/password', data);
};