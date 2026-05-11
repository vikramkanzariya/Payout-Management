const STATUS_CONFIG = {
  Draft: { class: 'status--draft', label: 'Draft' },
  Submitted: { class: 'status--submitted', label: 'Submitted' },
  Approved: { class: 'status--approved', label: 'Approved' },
  Rejected: { class: 'status--rejected', label: 'Rejected' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { class: '', label: status };
  return <span className={`status-badge ${config.class}`}>{config.label}</span>;
};

export default StatusBadge;
