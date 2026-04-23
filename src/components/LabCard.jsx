export default function LabCard({ title, icon, status, children, id }) {
  const statusConfig = {
    pass: { label: 'Pass', className: 'status-pass' },
    fail: { label: 'Fail', className: 'status-fail' },
    running: { label: 'Testing...', className: 'status-running' },
    pending: { label: 'Pending', className: 'status-pending' },
    skipped: { label: 'Skipped', className: 'status-pending' },
    unsupported: { label: 'N/A', className: 'status-pending' },
  };

  const s = statusConfig[status] || statusConfig.pending;

  return (
    <div className="lab-card" id={id}>
      <div className="lab-card-header">
        <div className="lab-card-title">
          <span className="text-lg">{icon}</span>
          <span>{title}</span>
        </div>
        <span className={s.className}>{s.label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
