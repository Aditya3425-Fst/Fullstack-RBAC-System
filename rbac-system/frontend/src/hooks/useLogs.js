import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as logService from '../services/logService';

export const useLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await logService.getLogs(params);
      setLogs(res.data?.logs || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch logs.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoginLogs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await logService.getLoginLogs(params);
      setLogs(res.data?.logs || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch login logs.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, pagination, loading, fetchLogs, fetchLoginLogs };
};
