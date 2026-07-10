import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ErrorPages.css';

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-code">404</div>
        <div className="error-icon">🔍</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-description">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
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

export default NotFound;
