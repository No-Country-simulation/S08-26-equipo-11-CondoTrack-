import { Link } from "react-router-dom";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAccessLogs } from "@/modules/access/hooks/useAccessLogs";
import { useDeliveries } from "@/modules/deliveries/hooks/useDeliveries";
import { useIncidents } from "@/modules/incidents/hooks/useIncidents";
import { useMaintenance } from "@/modules/maintenance/hooks/useMaintenance";
import { useResidents } from "@/modules/residents/hooks/useResidents";
import { useStaff } from "@/modules/staff/context/StaffContext";
import { useMoves } from "@/modules/moves/context/MovesContext";

export const DashboardHomePage = () => {
  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { residents } = useResidents();
  const { logs, deniedCount } = useAccessLogs();
  const { pending: pendingDeliveries, notified } = useDeliveries();
  const { open: openIncidents } = useIncidents();
  const { items: maintenanceItems } = useMaintenance();
  const inProgressMaintenance = maintenanceItems.filter((m) => m.status !== "resolved");
  const { staff } = useStaff();
  const { moves } = useMoves();
  const pendingMoves = moves.filter((m) => m.status === "pending");

  return (
    <div className="ct-main-scroll">
      <p className="ct-font-mono ct-text-muted mb-4 text-capitalize" style={{ fontSize: "0.75rem" }}>{today}</p>

      <div className="ct-grid-kpi mb-4">
        <KpiCard label="Residentes activos" value={residents.filter((r) => r.status === "active").length} sub={`${residents.length} totales`} accent="var(--color-accent-light)" icon="residents" />
        <KpiCard label="Ingresos hoy" value={logs.filter((l) => l.direction === "Ingreso").length} sub={`${deniedCount} denegados`} accent="var(--color-green-light)" icon="access" />
        <KpiCard label="Deliveries pendientes" value={pendingDeliveries.length} sub={`${pendingDeliveries.length - notified.length} sin notificar`} accent="var(--color-amber-light)" icon="deliveries" />
        <KpiCard label="Incidentes abiertos" value={openIncidents.length} sub={`${openIncidents.filter((i) => i.severity === "high").length} crítico(s)`} accent="var(--color-red-light)" icon="incidents" />
        <KpiCard label="Mudanzas pendientes" value={pendingMoves.length} sub={`${moves.length} totales`} accent="var(--color-purple-light)" icon="move" />
        <KpiCard label="Personal registrado" value={staff.length} sub="Recepción y mantenimiento" accent="var(--color-accent-light)" icon="person" />
      </div>

      <div className="ct-grid-main">
        <div className="ct-card">
          <div className="ct-card-header">
            <h2 className="ct-card-title">Últimos accesos</h2>
            <Link to="/dashboard/accesos" className="ct-card-link">Ver todos</Link>
          </div>
          <div>
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="ct-row ct-row-hover d-flex align-items-center gap-3">
                <span className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem", width: 40, flexShrink: 0 }}>{log.time}</span>
                <div className="flex-grow-1 min-w-0">
                  <p className="mb-0 fw-medium text-truncate" style={{ color: "var(--color-ink)" }}>{log.person}</p>
                  <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{log.type} · {log.unit !== "—" ? `Unidad ${log.unit}` : log.method}</p>
                </div>
                <span className="ct-font-mono flex-shrink-0" style={{ fontSize: "0.75rem", color: log.direction === "Ingreso" ? "var(--color-green)" : "var(--color-ink-muted)" }}>
                  {log.direction}
                </span>
                <StatusBadge status={log.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex flex-column gap-4">
          <div className="ct-card flex-grow-1">
            <div className="ct-card-header">
              <h2 className="ct-card-title">Deliveries pendientes</h2>
              <Link to="/dashboard/deliveries" className="ct-card-link">Ver todos</Link>
            </div>
            <div>
              {pendingDeliveries.map((delivery) => (
                <div key={delivery.id} className="ct-row ct-row-hover">
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{delivery.resident}</p>
                  <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{delivery.carrier} · {delivery.received}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ct-card">
            <div className="ct-card-header">
              <h2 className="ct-card-title">Incidentes abiertos</h2>
              <Link to="/dashboard/incidentes" className="ct-card-link">Ver todos</Link>
            </div>
            <div>
              {openIncidents.map((incident) => (
                <div key={incident.id} className="ct-row ct-row-hover">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{incident.title}</p>
                    <StatusBadge status={incident.severity} />
                  </div>
                  <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.75rem" }}>{incident.category} · {incident.unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ct-card mt-4 overflow-hidden">
        <div className="ct-card-header">
          <h2 className="ct-card-title">Mantenimiento en curso</h2>
          <Link to="/dashboard/mantenimiento" className="ct-card-link">Ver todos</Link>
        </div>
        <div className="ct-grid-maintenance">
          {inProgressMaintenance.map((item) => (
            <div key={item.id} className="ct-row ct-row-hover">
              <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{item.title}</p>
                <StatusBadge status={item.priority} />
              </div>
              <p className="ct-font-mono ct-text-muted mb-2" style={{ fontSize: "0.75rem" }}>{item.unit} · {item.assigned}</p>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
