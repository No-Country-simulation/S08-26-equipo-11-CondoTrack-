import { Link } from "react-router-dom";
import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { QRCode } from "@/modules/access/components/QRCode";
import { useAccessLogs } from "@/modules/access/hooks/useAccessLogs";
import { useNotifications } from "@/modules/resident/hooks/useNotifications";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

const SHORTCUTS = [
  {
    label: "Delivery pendiente",
    value: 1,
    icon: "deliveries",
    color: "var(--color-amber-light)",
    to: "/portal/deliveries",
  },
  {
    label: "Reserva próxima",
    value: 1,
    icon: "reservations",
    color: "var(--color-accent-light)",
    to: "/portal/reservas",
  },
  {
    label: "Solicitud activa",
    value: 1,
    icon: "maintenance",
    color: "var(--color-purple-light)",
    to: "/portal/solicitudes",
  },
];

export const ResidentHomePage = () => {
  const { forResident } = useAccessLogs();
  const { notifications, unreadCount, iconFor, markRead } = useNotifications();
  const current = useCurrentResident();
  const firstName = current.name.split(" ")[0];
  const myAccess = forResident(current);

  return (
    <div className="ct-main-scroll">
      <div className="mb-4">
        <p
          className="ct-font-mono ct-text-muted mb-1"
          style={{ fontSize: "0.75rem" }}
        >
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h2
          className="ct-font-display mb-0"
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--color-ink)",
          }}
        >
          Hola, {firstName}
        </h2>
        <p className="ct-text-muted mb-0 mt-1">
          Unidad {current.unit} · {current.building}
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4 d-flex flex-column gap-4">
          <div className="ct-card p-4 d-flex flex-column align-items-center gap-3">
            <p
              className="ct-font-mono text-uppercase ct-text-muted align-self-start mb-0"
              style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
            >
              Mi código QR
            </p>
            <QRCode size={100} />
            <Link
              to="/portal/visitas"
              className="btn w-100 text-white"
              style={{ background: "var(--color-accent)" }}
            >
              Ver código completo
            </Link>
          </div>

          <div className="d-flex flex-column gap-3">
            {SHORTCUTS.map((shortcut) => (
              <Link
                key={shortcut.label}
                to={shortcut.to}
                className="ct-card ct-card-hoverable p-3 d-flex align-items-center gap-3 text-decoration-none"
              >
                <div
                  className="ct-icon-tile"
                  style={{ background: shortcut.color }}
                >
                  <Icon
                    name={shortcut.icon}
                    size={15}
                    className="ct-text-muted"
                  />
                </div>
                <div>
                  <p
                    className="ct-font-display mb-0"
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "var(--color-ink)",
                    }}
                  >
                    {shortcut.value}
                  </p>
                  <p
                    className="ct-text-muted mb-0"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {shortcut.label}
                  </p>
                </div>
                <Icon
                  name="chevron"
                  size={15}
                  className="ms-auto ct-text-faint"
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="col-lg-8 d-flex flex-column gap-4">
          <div className="ct-card">
            <div className="ct-card-header">
              <div className="d-flex align-items-center gap-2">
                <h3 className="ct-card-title">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span
                    className="ct-font-mono text-white rounded-pill px-2"
                    style={{
                      fontSize: "10px",
                      background: "var(--color-amber)",
                    }}
                  >
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
            </div>
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`ct-row ct-row-hover ct-row-clickable d-flex align-items-start gap-3 ct-notification-row ${!notification.read ? "unread" : ""}`}
                  onClick={() => markRead(notification.id)}
                >
                  <div
                    className="ct-icon-tile mt-1"
                    style={{
                      borderRadius: "999px",
                      background: "var(--color-canvas)",
                    }}
                  >
                    <Icon
                      name={iconFor(notification.type)}
                      size={13}
                      className="ct-text-muted"
                    />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p
                      className="mb-0"
                      style={{
                        color: "var(--color-ink)",
                        fontWeight: notification.read ? 500 : 600,
                      }}
                    >
                      {notification.title}
                    </p>
                    <p className="ct-text-muted mb-0 mt-1">
                      {notification.body}
                    </p>
                  </div>
                  <span
                    className="ct-font-mono ct-text-faint flex-shrink-0"
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {notification.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="ct-card">
            <div className="ct-card-header">
              <h3 className="ct-card-title">
                Actividad reciente -Unidad {current.unit}
              </h3>
            </div>
            <div>
              {myAccess.map((log) => (
                <div
                  key={log.id}
                  className="ct-row ct-row-hover d-flex align-items-center gap-3"
                >
                  <span
                    className="ct-font-mono ct-text-muted"
                    style={{ fontSize: "0.75rem", width: 40, flexShrink: 0 }}
                  >
                    {log.time}
                  </span>
                  <div className="flex-grow-1 min-w-0">
                    <p
                      className="mb-0 fw-medium text-truncate"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {log.person}
                    </p>
                    <p
                      className="ct-text-muted mb-0"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {log.type} · {log.method}
                    </p>
                  </div>
                  <span
                    className="ct-font-mono flex-shrink-0"
                    style={{
                      fontSize: "0.75rem",
                      color:
                        log.direction === "Ingreso"
                          ? "var(--color-green)"
                          : "var(--color-ink-muted)",
                    }}
                  >
                    {log.direction}
                  </span>
                  <StatusBadge status={log.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
