import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/roles';
import './Navbar.css';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar" role="banner">
      <div className="navbar-left">
        <button
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div className="navbar-brand">
          <span className="brand-icon">🔐</span>
          <span className="brand-text">RBAC System</span>
        </div>
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <div className="user-info">
              <div className="user-avatar" aria-hidden="true">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span
                  className="user-role"
                  style={{ color: ROLE_COLORS[user.role] }}
                >
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
            </div>
            <button
              className="logout-btn"
              onClick={logout}
              aria-label="Logout"
            >
              <span>↪</span>
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
