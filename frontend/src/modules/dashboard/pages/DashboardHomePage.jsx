import { Link, useOutletContext } from "react-router-dom";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAccessLogs } from "@/modules/access/hooks/useAccessLogs";
import { useDeliveries } from "@/modules/deliveries/hooks/useDeliveries";
import { useIncidents } from "@/modules/incidents/hooks/useIncidents";
import { useMaintenance } from "@/modules/maintenance/hooks/useMaintenance";
import { useResidents } from "@/modules/residents/hooks/useResidents";
import { useStaffByRole } from "@/modules/staff/hooks/useStaffByRole";
import { useUnits } from "@/modules/units/context/UnitsContext";
import { kpiByUnits, kpiWithoutSource } from "@/shared/utils/kpi";

export const DashboardHomePage = () => {
  const { building } = useOutletContext();
  const buildingId = building?.id;
  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Todo vinculado al edificio seleccionado en el sidebar.
  const { forBuilding: residentsForBuilding } = useResidents();
  const { forBuilding: accessForBuilding } = useAccessLogs();
  const { pendingForBuilding, notifiedForBuilding } = useDeliveries();
  const { openForBuilding } = useIncidents();
  const { forBuilding: maintenanceForBuilding } = useMaintenance();
  const { forBuilding: unitsForBuilding } = useUnits();
  const { staff } = useStaffByRole(buildingId);

  // Todos los KPIs salvo el de personal cuelgan de las unidades del edificio:
  // sin unidades no hay nada que medir y mostrar 0 sería un dato falso.
  const hasUnits = unitsForBuilding(buildingId).length > 0;

  const residents = residentsForBuilding(buildingId);
  const logs = accessForBuilding(buildingId);
  // El backend devuelve los enums en mayúsculas (RECEIVED, OPEN, HIGH...);
  // la tolerancia a ambas variantes vive en los hooks.
  const pendingDeliveries = pendingForBuilding(buildingId);
  const notified = notifiedForBuilding(buildingId);
  const openIncidents = openForBuilding(buildingId);
  const criticalIncidents = openIncidents.filter(
    (i) => i.severity === "high" || i.severity === "HIGH" || i.severity === "CRITICAL",
  );
  const maintenanceItems = maintenanceForBuilding(buildingId);
  const inProgressMaintenance = maintenanceItems.filter((m) => m.status !== "resolved");
  // Accesos y mantenimientos siguen alimentados por mock. Solo se listan si el
  // edificio tiene unidades, para no presentar filas de otro edificio.
  const accessList = hasUnits ? logs : [];
  const maintenanceList = hasUnits ? inProgressMaintenance : [];

  // El vínculo al resident es lo que define si sigue vigente: `status` viene
  // hardcodeado en "active" desde el service, así que no sirve para contar.
  const activeResidents = residents.filter(
    (r) => !r.endDate || new Date(r.endDate) >= new Date(),
  );

  const residentsKpi = kpiByUnits(
    activeResidents.length,
    hasUnits,
    `${residents.length} totales`,
  );
  const deliveriesKpi = kpiByUnits(
    pendingDeliveries.length,
    hasUnits,
    `${notified.length} notificado(s)`,
  );
  const incidentsKpi = kpiByUnits(
    openIncidents.length,
    hasUnits,
    `${criticalIncidents.length} crítico(s)`,
  );
  // Accesos y mudanzas siguen alimentados por mock: no hay endpoint para
  // listar eventos de acceso ni carpeta de servicios en mudanzas.
  const accessKpi = kpiWithoutSource("El backend no expone un listado de accesos");
  const movesKpi = kpiWithoutSource("Módulo todavía sin conexión con el backend");

  return (
    <div className="ct-main-scroll">
      <p className="ct-font-mono ct-text-muted mb-4 text-capitalize" style={{ fontSize: "0.75rem" }}>{today}</p>

      <div className="ct-grid-kpi mb-4">
        <KpiCard label="Residentes activos" value={residentsKpi.value} sub={residentsKpi.sub} accent="var(--color-accent-light)" icon="residents" />
        <KpiCard label="Ingresos hoy" value={accessKpi.value} sub={accessKpi.sub} accent="var(--color-green-light)" icon="access" />
        <KpiCard label="Deliveries pendientes" value={deliveriesKpi.value} sub={deliveriesKpi.sub} accent="var(--color-amber-light)" icon="deliveries" />
        <KpiCard label="Incidentes abiertos" value={incidentsKpi.value} sub={incidentsKpi.sub} accent="var(--color-red-light)" icon="incidents" />
        <KpiCard label="Mudanzas pendientes" value={movesKpi.value} sub={movesKpi.sub} accent="var(--color-purple-light)" icon="move" />
        <KpiCard label="Personal registrado" value={staff.length} sub="Recepción, mantenimiento y administración" accent="var(--color-accent-light)" icon="person" />
      </div>

      <div className="ct-grid-main">
        <div className="ct-card">
          <div className="ct-card-header">
            <h2 className="ct-card-title">Últimos accesos</h2>
            <Link to="/dashboard/accesos" className="ct-card-link">Ver todos</Link>
          </div>
          <div>
            {accessList.length === 0 ? (
              <p className="ct-text-muted mb-0 py-3">{hasUnits ? "Sin accesos registrados" : "Sin unidades en este edificio"}</p>
            ) : accessList.slice(0, 5).map((log) => (
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
              ))
            )}
          </div>
        </div>

        <div className="d-flex flex-column gap-4">
          <div className="ct-card flex-grow-1">
            <div className="ct-card-header">
              <h2 className="ct-card-title">Deliveries pendientes</h2>
              <Link to="/dashboard/deliveries" className="ct-card-link">Ver todos</Link>
            </div>
            <div>
              {pendingDeliveries.length === 0 ? (
                <p className="ct-text-muted mb-0 py-3">{hasUnits ? "Sin deliveries pendientes" : "Sin unidades en este edificio"}</p>
              ) : pendingDeliveries.map((delivery) => (
                <div key={delivery.id} className="ct-row ct-row-hover">
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{delivery.carrier}</p>
                  <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{delivery.trackingNumber || delivery.resident || "Sin seguimiento"}</p>
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
              {openIncidents.length === 0 ? (
                <p className="ct-text-muted mb-0 py-3">{hasUnits ? "Sin incidentes abiertos" : "Sin unidades en este edificio"}</p>
              ) : openIncidents.map((incident) => (
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
          {maintenanceList.length === 0 ? (
            <p className="ct-text-muted mb-0 py-3">{hasUnits ? "Sin mantenimientos en curso" : "Sin unidades en este edificio"}</p>
          ) : maintenanceList.map((item) => (
            <div key={item.id} className="ct-row ct-row-hover">
              <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{item.title}</p>
                <StatusBadge status={item.priority} />
              </div>
              <p className="ct-font-mono ct-text-muted mb-2" style={{ fontSize: "0.75rem" }}>{item.unit} · {item.assigned}</p>
              <StatusBadge status={item.status} />
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
