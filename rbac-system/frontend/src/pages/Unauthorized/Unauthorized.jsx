import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ErrorPages.css';

const Unauthorized = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-code">403</div>
        <div className="error-icon">🚫</div>
        <h1 className="error-title">Access Denied</h1>
        <p className="error-description">
          You don&apos;t have permission to access this page.
          Contact your administrator if you think this is a mistake.
        </p>
        <div className="error-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              ← Back to Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
