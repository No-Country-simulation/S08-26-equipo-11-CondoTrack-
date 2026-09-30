import PropTypes from "prop-types";

const STATUS_CONFIG = {
  active: { label: "Activo", tone: "green" },
  inactive: { label: "Inactivo", tone: "muted" },
  blocked: { label: "Bloqueado", tone: "red" },
  ok: { label: "OK", tone: "green" },
  denied: { label: "Denegado", tone: "red" },
  pending: { label: "Pendiente", tone: "amber" },
  notified: { label: "Notificado", tone: "accent" },
  delivered: { label: "Entregado", tone: "green" },
  confirmed: { label: "Confirmada", tone: "green" },
  RECEIVED: { label: "Recibido", tone: "amber" },
  NOTIFIED: { label: "Notificado", tone: "accent" },
  PICKED_UP: { label: "Entregado", tone: "green" },
  RETURNED: { label: "Devuelto", tone: "muted" },
  LOST: { label: "Perdido", tone: "red" },
  PENDING: { label: "Pendiente", tone: "amber" },
  CONFIRMED: { label: "Confirmada", tone: "green" },
  CANCELLED: { label: "Cancelada", tone: "muted" },
  COMPLETED: { label: "Completada", tone: "green" },
  REJECTED: { label: "Rechazada", tone: "red" },
  in_progress: { label: "En progreso", tone: "purple" },
  resolved: { label: "Resuelto", tone: "muted" },
  open: { label: "Abierto", tone: "red" },
  high: { label: "Alta", tone: "red" },
  medium: { label: "Media", tone: "amber" },
  low: { label: "Baja", tone: "green" },
  // Estados de incidentes.
  LOW: { label: "Baja", tone: "green" },
  MEDIUM: { label: "Media", tone: "amber" },
  HIGH: { label: "Alta", tone: "red" },
  CRITICAL: { label: "Crítica", tone: "red" },
  OPEN: { label: "Abierto", tone: "red" },
  IN_PROGRESS: { label: "En progreso", tone: "purple" },
  RESOLVED: { label: "Resuelto", tone: "muted" },
  CLOSED: { label: "Cerrado", tone: "muted" },
  READ: { label: "Leída", tone: "accent" },
};

export const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, tone: "muted" };
  return <span className={`ct-badge ct-badge-${cfg.tone}`}>{cfg.label}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};
