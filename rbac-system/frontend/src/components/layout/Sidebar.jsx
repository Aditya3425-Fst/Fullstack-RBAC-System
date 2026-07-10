import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'],
  },
  {
    path: '/profile',
    label: 'My Profile',
    icon: '👤',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'],
  },
  {
    path: '/users',
    label: 'Users',
    icon: '👥',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  {
    path: '/logs',
    label: 'Audit Logs',
    icon: '📋',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">🔐</span>
            <span className="sidebar-logo-text">RBAC System</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Application navigation">
          <ul>
            {filteredItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                  aria-label={item.label}
                >
                  <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-mobile">{user.mobile}</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
