export default function LabCard({ title, icon, status, children, id, onRedo }) {
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
        <div className="flex items-center gap-3">
          {(status === 'pass' || status === 'fail') && onRedo && (
            <button 
              onClick={onRedo}
              className="text-[10px] uppercase tracking-wider font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              Redo
            </button>
          )}
          <span className={s.className}>{s.label}</span>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
