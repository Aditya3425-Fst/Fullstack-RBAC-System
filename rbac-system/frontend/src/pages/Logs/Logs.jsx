import { useEffect, useState, useCallback } from 'react';
import { useLogs } from '../../hooks/useLogs';
import './Logs.css';
import { ACTIONS } from '../../constants/actions';
import { formatDate } from '../../utils/formatters';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import './Logs.css';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  ...Object.values(ACTIONS).map((a) => ({ value: a, label: a })),
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILURE', label: 'Failure' },
];

const LOG_TYPE_OPTIONS = [
  { value: 'all', label: 'All Logs' },
  { value: 'login', label: 'Login Logs' },
];

const Logs = () => {
  const { logs, pagination, loading, fetchLogs, fetchLoginLogs } = useLogs();

  const [logType, setLogType] = useState('all');
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(() => {
    const params = { page, limit: 15, search, action, status, startDate, endDate, sortOrder };
    if (logType === 'login') {
      fetchLoginLogs(params);
    } else {
      fetchLogs(params);
    }
  }, [page, search, action, status, startDate, endDate, sortOrder, logType, fetchLogs, fetchLoginLogs]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(t);
  }, [search]);

  const clearFilters = () => {
    setSearch('');
    setAction('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || action || status || startDate || endDate;

  return (
    <div className="logs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Complete audit trail of system activity</p>
        </div>
        <div className="log-type-tabs">
          {LOG_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`tab-btn ${logType === opt.value ? 'active' : ''}`}
              onClick={() => { setLogType(opt.value); setPage(1); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card logs-filters">
        <div className="filters-row">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search mobile or message..."
          />
          <Select
            id="action-filter"
            options={ACTION_OPTIONS}
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            placeholder="All Actions"
            className="filter-select-md"
          />
          <Select
            id="status-filter"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            placeholder="All Status"
            className="filter-select-sm"
          />
        </div>
        <div className="filters-row">
          <div className="date-filters">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="start-date">From</label>
              <input
                id="start-date"
                type="date"
                className="form-input"
                style={{ width: 'auto' }}
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="end-date">To</label>
              <input
                id="end-date"
                type="date"
                className="form-input"
                style={{ width: 'auto' }}
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="filter-actions">
            <Select
              id="sort-order"
              options={[
                { value: 'desc', label: 'Newest First' },
                { value: 'asc', label: 'Oldest First' },
              ]}
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
              className="filter-select-sm"
            />
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <span className="results-count">
              {pagination.total} log{pagination.total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <Loader center text="Loading logs..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No logs found"
            description={hasActiveFilters ? 'Try adjusting your filters.' : 'No activity logs recorded yet.'}
            action={hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
            )}
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Mobile</th>
                    <th>User</th>
                    <th>Message</th>
                    <th>IP Address</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span className={`action-badge action-${log.action}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>
                          {log.mobile || '—'}
                        </span>
                      </td>
                      <td className="text-sm text-muted">
                        {log.userId?.name || '—'}
                      </td>
                      <td>
                        <span className="log-message" title={log.message}>
                          {log.message || '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {log.ipAddress || '—'}
                        </span>
                      </td>
                      <td className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;
