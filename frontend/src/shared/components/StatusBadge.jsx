import PropTypes from "prop-types";

const STATUS_CONFIG = {
  active: { label: "Activo", tone: "green" },
  inactive: { label: "Inactivo", tone: "muted" },
  ok: { label: "OK", tone: "green" },
  denied: { label: "Denegado", tone: "red" },
  pending: { label: "Pendiente", tone: "amber" },
  notified: { label: "Notificado", tone: "accent" },
  delivered: { label: "Entregado", tone: "green" },
  confirmed: { label: "Confirmada", tone: "green" },
  in_progress: { label: "En progreso", tone: "purple" },
  resolved: { label: "Resuelto", tone: "muted" },
  open: { label: "Abierto", tone: "red" },
  high: { label: "Alta", tone: "red" },
  medium: { label: "Media", tone: "amber" },
  low: { label: "Baja", tone: "green" },
};

export const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, tone: "muted" };
  return <span className={`ct-badge ct-badge-${cfg.tone}`}>{cfg.label}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};
