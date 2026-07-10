import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';
import { getUsers } from '../../services/userService';
import { getLogs } from '../../services/logService';
import { ROLE_LABELS, ROLE_COLORS, ROLES } from '../../constants/roles';
import { formatDate } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import './Dashboard.css';

const StatCard = ({ icon, label, value, color, linkTo, linkLabel }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
    {linkTo && (
      <Link to={linkTo} className="stat-link">{linkLabel} →</Link>
    )}
  </div>
);

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalLogs: 0, recentLogs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const promises = [];

        if (hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER)) {
          promises.push(getUsers({ limit: 1 }));
          promises.push(getUsers({ limit: 1, isActive: 'true' }));
        }

        if (hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN)) {
          promises.push(getLogs({ limit: 5 }));
        }

        const results = await Promise.allSettled(promises);
        let idx = 0;

        let totalUsers = 0, activeUsers = 0, totalLogs = 0, recentLogs = [];

        if (hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER)) {
          if (results[idx]?.status === 'fulfilled') totalUsers = results[idx].value.pagination?.total || 0;
          idx++;
          if (results[idx]?.status === 'fulfilled') activeUsers = results[idx].value.pagination?.total || 0;
          idx++;
        }

        if (hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN)) {
          if (results[idx]?.status === 'fulfilled') {
            totalLogs = results[idx].value.pagination?.total || 0;
            recentLogs = results[idx].value.data?.logs || [];
          }
        }

        setStats({ totalUsers, activeUsers, totalLogs, recentLogs });
      } catch {
        // Non-critical — silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [hasRole]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleCards = () => {
    const cards = [
      {
        icon: '👤',
        label: 'Your Role',
        value: ROLE_LABELS[user?.role] || user?.role,
        color: ROLE_COLORS[user?.role] || '#6366f1',
      },
    ];

    if (hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER)) {
      cards.push({
        icon: '👥',
        label: 'Total Users',
        value: loading ? '...' : stats.totalUsers,
        color: '#6366f1',
        linkTo: '/users',
        linkLabel: 'Manage Users',
      });
      cards.push({
        icon: '✅',
        label: 'Active Users',
        value: loading ? '...' : stats.activeUsers,
        color: '#22c55e',
      });
    }

    if (hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN)) {
      cards.push({
        icon: '📋',
        label: 'Total Logs',
        value: loading ? '...' : stats.totalLogs,
        color: '#f97316',
        linkTo: '/logs',
        linkLabel: 'View Logs',
      });
    }

    return cards;
  };

  return (
    <div className="dashboard-page">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div className="welcome-text">
          <h1 className="welcome-greeting">
            {getWelcomeMessage()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="welcome-subtitle">
            Here's what's happening in your RBAC system today.
          </p>
        </div>
        <div className="welcome-badge" style={{ background: `${ROLE_COLORS[user?.role]}18` }}>
          <span style={{ color: ROLE_COLORS[user?.role], fontWeight: 700 }}>
            {ROLE_LABELS[user?.role]}
          </span>
          <span className="welcome-mobile">📱 {user?.mobile}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {getRoleCards().map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <Link to="/profile" className="quick-action-item">
              <span className="qa-icon">👤</span>
              <div>
                <div className="qa-title">View Profile</div>
                <div className="qa-desc">See your account details</div>
              </div>
            </Link>

            {hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER) && (
              <Link to="/users" className="quick-action-item">
                <span className="qa-icon">👥</span>
                <div>
                  <div className="qa-title">Manage Users</div>
                  <div className="qa-desc">View and manage user accounts</div>
                </div>
              </Link>
            )}

            {hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN) && (
              <Link to="/logs" className="quick-action-item">
                <span className="qa-icon">📋</span>
                <div>
                  <div className="qa-title">Audit Logs</div>
                  <div className="qa-desc">Review system activity logs</div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Account Summary</h3>
          </div>
          <div className="profile-summary">
            <div className="profile-avatar-large">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <div className="profile-detail-row">
                <span className="detail-label">Name</span>
                <span className="detail-value">{user?.name}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Mobile</span>
                <span className="detail-value">{user?.mobile}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Role</span>
                <span
                  className={`role-badge role-${user?.role}`}
                >
                  {ROLE_LABELS[user?.role]}
                </span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Status</span>
                <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Logs - only for SUPER_ADMIN, ADMIN */}
        {hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN) && (
          <div className="card dashboard-logs-card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
              <Link to="/logs" className="card-action-link">View All →</Link>
            </div>
            {loading ? (
              <Loader center />
            ) : stats.recentLogs.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                <div className="empty-state-icon">📋</div>
                <p className="empty-state-title">No recent activity</p>
              </div>
            ) : (
              <div className="recent-logs">
                {stats.recentLogs.map((log) => (
                  <div key={log._id} className="recent-log-item">
                    <span className={`action-badge action-${log.action}`}>{log.action}</span>
                    <span className="log-mobile">{log.mobile || '—'}</span>
                    <span className="log-time">{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
