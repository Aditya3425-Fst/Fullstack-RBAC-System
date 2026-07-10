import axiosInstance from '../api/axiosInstance';

/**
 * Get logged-in user's profile.
 */
export const getProfile = async () => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};

/**
 * Get all users with pagination and filters.
 */
export const getUsers = async (params = {}) => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};

/**
 * Create a new user.
 */
export const createUser = async (userData) => {
  const response = await axiosInstance.post('/users', userData);
  return response.data;
};

/**
 * Update a user's role.
 */
export const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.patch(`/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Delete a user.
 */
export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};
