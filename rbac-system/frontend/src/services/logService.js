import axiosInstance from '../api/axiosInstance';

/**
 * Get all audit logs.
 */
export const getLogs = async (params = {}) => {
  const response = await axiosInstance.get('/logs', { params });
  return response.data;
};

/**
 * Get login-related logs.
 */
export const getLoginLogs = async (params = {}) => {
  const response = await axiosInstance.get('/logs/login', { params });
  return response.data;
};
