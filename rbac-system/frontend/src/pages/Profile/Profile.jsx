import { useEffect, useState } from 'react';
import { getProfile } from '../../services/userService';
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/roles';
import { formatDateOnly } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import './Profile.css';

const ProfileRow = ({ label, value, children }) => (
  <div className="profile-row">
    <span className="profile-row-label">{label}</span>
    <span className="profile-row-value">{children || value}</span>
  </div>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await getProfile();
        setUser(res.data?.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Loader center size="lg" text="Loading profile..." />;

  if (error) {
    return (
      <div className="error-state">
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h3>Failed to Load Profile</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Your account information and role details</p>
      </div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="card profile-main-card">
          <div className="profile-header-section">
            <div
              className="profile-avatar-xl"
              style={{ background: ROLE_COLORS[user?.role] }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-header-info">
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-mobile">📱 {user?.mobile}</p>
              <div className="profile-badges">
                <span className={`role-badge role-${user?.role}`}>
                  {ROLE_LABELS[user?.role]}
                </span>
                <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {user?.isActive ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Account Details</h3>
          </div>
          <div className="profile-details-grid">
            <ProfileRow label="Full Name">{user?.name}</ProfileRow>
            <ProfileRow label="Mobile Number">
              <span style={{ fontFamily: 'monospace' }}>{user?.mobile}</span>
            </ProfileRow>
            <ProfileRow label="Role">
              <span className={`role-badge role-${user?.role}`}>
                {ROLE_LABELS[user?.role]}
              </span>
            </ProfileRow>
            <ProfileRow label="Account Status">
              <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </ProfileRow>
            <ProfileRow label="Member Since">
              {formatDateOnly(user?.createdAt)}
            </ProfileRow>
            <ProfileRow label="Last Updated">
              {formatDateOnly(user?.updatedAt)}
            </ProfileRow>
            <ProfileRow label="User ID">
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {user?._id}
              </span>
            </ProfileRow>
          </div>
        </div>

        {/* Permissions Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Permissions</h3>
          </div>
          <div className="permissions-grid">
            {getPermissions(user?.role).map((perm) => (
              <div key={perm.label} className={`permission-item ${perm.allowed ? 'allowed' : 'denied'}`}>
                <span className="perm-icon">{perm.allowed ? '✅' : '❌'}</span>
                <span className="perm-label">{perm.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getPermissions = (role) => [
  { label: 'View Own Profile', allowed: true },
  { label: 'View All Users', allowed: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role) },
  { label: 'Create Users', allowed: ['SUPER_ADMIN', 'ADMIN'].includes(role) },
  { label: 'Update User Roles', allowed: ['SUPER_ADMIN'].includes(role) },
  { label: 'Delete Users', allowed: ['SUPER_ADMIN'].includes(role) },
  { label: 'View Audit Logs', allowed: ['SUPER_ADMIN', 'ADMIN'].includes(role) },
];

export default Profile;
