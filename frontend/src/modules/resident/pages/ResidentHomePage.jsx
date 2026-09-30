import { Link } from "react-router-dom";
import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { QRCode } from "@/modules/access/components/QRCode";
import { useAccessLogs } from "@/modules/access/hooks/useAccessLogs";
import { useNotifications } from "@/modules/resident/hooks/useNotifications";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";
import { useDeliveries } from "@/modules/deliveries/hooks/useDeliveries";
import { useReservations } from "@/modules/reservations/hooks/useReservations";
import { useIncidents } from "@/modules/incidents/hooks/useIncidents";
import { useMaintenance } from "@/modules/maintenance/hooks/useMaintenance";

const ACTIVE_RESERVATION_STATUSES = ["PENDING", "CONFIRMED", "pending", "confirmed"];

export const ResidentHomePage = () => {
  const { forResident } = useAccessLogs();
  const { notifications, unreadCount, iconFor, markRead } = useNotifications();
  const current = useCurrentResident();
  const { mine: myDeliveries } = useDeliveries();
  const { forMine } = useReservations();
  const { forResident: myIncidents } = useIncidents();
  const { forUnit: maintenanceForUnit } = useMaintenance();
  const firstName = current.name ? current.name.split(" ")[0] : "";
  const myAccess = forResident(current);

  // Los tres accesos contaban con valores fijos (siempre 1). Ahora salen del
  // backend: un resident sin nada pendiente ve 0, no un número inventado.
  // El aviso se arma con GET /deliveries/mine, no filtrando por código de
  // unidad: el backend ya resuelve las unidades del residente, así que le
  // aparece aunque entre desde otro navegador o en una sesión nueva.
  const waitingDeliveries = myDeliveries.filter(
    (delivery) =>
      delivery.status === "RECEIVED" ||
      delivery.status === "NOTIFIED" ||
      delivery.status === "pending" ||
      delivery.status === "notified",
  );

  const pendingDeliveries = waitingDeliveries.length;

  const upcomingReservations = forMine().filter((reservation) => {
    if (!ACTIVE_RESERVATION_STATUSES.includes(reservation.status)) return false;
    if (!reservation.endAt) return true;
    const end = new Date(reservation.endAt);
    return Number.isNaN(end.getTime()) || end >= new Date();
  }).length;

  const activeRequests =
    myIncidents().filter(
      (incident) =>
        incident.status === "OPEN" ||
        incident.status === "IN_PROGRESS" ||
        incident.status === "open" ||
        incident.status === "in_progress",
    ).length +
    maintenanceForUnit(current.unit).filter((item) => item.status !== "resolved")
      .length;

  const shortcuts = [
    {
      label: "Delivery pendiente",
      value: pendingDeliveries,
      icon: "deliveries",
      color: "var(--color-amber-light)",
      to: "/portal/deliveries",
    },
    {
      label: "Reserva próxima",
      value: upcomingReservations,
      icon: "reservations",
      color: "var(--color-accent-light)",
      to: "/portal/reservas",
    },
    {
      label: "Solicitud activa",
      value: activeRequests,
      icon: "maintenance",
      color: "var(--color-purple-light)",
      to: "/portal/solicitudes",
    },
  ];

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
          Hola{firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="ct-text-muted mb-0 mt-1">
          {current.hasUnit
            ? `Unidad ${current.unit} · ${current.buildingLabel}`
            : "No tenés una unidad asignada. Pedí al administrador que vincule tu cuenta."}
        </p>
      </div>

      {waitingDeliveries.length > 0 && (
        <div
          className="ct-card p-4 d-flex flex-column flex-sm-row align-items-sm-center gap-3 mb-4"
          style={{ background: "var(--color-amber-light)" }}
        >
          <div className="flex-grow-1">
            <p
              className="mb-0 fw-semibold"
              style={{ color: "var(--color-ink)" }}
            >
              {waitingDeliveries.length === 1
                ? "Tenés 1 paquete en portería"
                : `Tenés ${waitingDeliveries.length} paquetes en portería`}
            </p>
            <p className="ct-text-muted mb-0 mt-1" style={{ fontSize: "0.8125rem" }}>
              {waitingDeliveries
                .map((delivery) => delivery.carrier)
                .filter(Boolean)
                .join(" · ") || "Pasá a retirarlo cuando quieras."}
            </p>
          </div>
          <Link
            to="/portal/deliveries"
            className="btn text-white flex-shrink-0"
            style={{ background: "var(--color-amber)" }}
          >
            Pasá por portería
          </Link>
        </div>
      )}

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
            <p
              className="ct-text-faint mb-0 text-center"
              style={{ fontSize: "0.6875rem", lineHeight: 1.4 }}
            >
              Vista previa. El código de acceso real todavía no está
              disponible.
            </p>
            <Link
              to="/portal/visitas"
              className="btn w-100 text-white"
              style={{ background: "var(--color-accent)" }}
            >
              Ver código completo
            </Link>
          </div>

          <div className="d-flex flex-column gap-3">
            {shortcuts.map((shortcut) => (
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
                Actividad reciente
                {current.hasUnit ? ` — Unidad ${current.unit}` : ""}
              </h3>
            </div>
            <div>
              {myAccess.length === 0 ? (
                <p className="ct-text-muted mb-0 p-3">
                  {current.hasUnit
                    ? "Todavía no hay accesos registrados para tu unidad."
                    : "Necesitás una unidad asignada para ver tus accesos."}
                </p>
              ) : (
                myAccess.map((log) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
