import apiClient from './client';
export const getMyStats = () => apiClient.get('/api/gamification/my-stats');

export const getLeaderboard = () => apiClient.get('/api/gamification/leaderboard');
export const getMyRank = () => apiClient.get('/api/gamification/my-rank');
export const getAllBadges = () => apiClient.get('/api/gamification/badges');