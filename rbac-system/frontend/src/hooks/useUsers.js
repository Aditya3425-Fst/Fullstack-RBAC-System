import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as userService from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await userService.getUsers(params);
      setUsers(res.data?.users || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch users.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      const res = await userService.createUser(userData);
      toast.success('User created successfully!');
      return { success: true, user: res.data?.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user.';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  const updateRole = useCallback(async (userId, role) => {
    try {
      const res = await userService.updateUserRole(userId, role);
      toast.success('Role updated successfully!');
      return { success: true, user: res.data?.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update role.';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  const removeUser = useCallback(async (userId) => {
    try {
      await userService.deleteUser(userId);
      toast.success('User deleted successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user.';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  return { users, pagination, loading, fetchUsers, createUser, updateRole, removeUser };
};
