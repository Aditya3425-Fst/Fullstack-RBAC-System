import '../../styles/global.css';

const Loader = ({ size = 'md', center = false, text = '' }) => {
  const spinnerClass = `spinner spinner-dark ${size === 'lg' ? 'spinner-lg' : ''}`;

  if (center) {
    return (
      <div className="loader-center" role="status" aria-label="Loading">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className={spinnerClass} />
          {text && <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{text}</p>}
        </div>
      </div>
    );
  }

  return <div className={spinnerClass} role="status" aria-label="Loading" />;
};

export default Loader;
