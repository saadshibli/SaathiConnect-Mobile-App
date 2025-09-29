import apiClient from "./client";
export const getTransparencyStats = () =>
  apiClient.get("/api/transparency/stats");
export const getCategoryCounts = () =>
  apiClient.get("/api/transparency/categories");
export const getZoneLeaderboard = () =>
  apiClient.get("/api/transparency/zones");
export const getPublicTrends = (period: number = 30) =>
  apiClient.get("/api/transparency/trends", { params: { period } });
