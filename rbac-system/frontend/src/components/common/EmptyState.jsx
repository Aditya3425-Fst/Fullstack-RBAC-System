const EmptyState = ({ icon = '📭', title = 'No data found', description = '', action }) => {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div style={{ marginTop: 'var(--spacing-lg)' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
