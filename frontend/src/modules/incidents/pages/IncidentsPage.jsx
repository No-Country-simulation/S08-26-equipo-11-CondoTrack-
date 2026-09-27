import { Form } from "react-bootstrap";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useIncidents } from "@/modules/incidents/hooks/useIncidents";

export const IncidentsPage = () => {
  const { items, open, inProgress, resolved, updateStatus } = useIncidents();

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-kpi-3 mb-4">
        <KpiCard label="Abiertos" value={open.length} sub="Requieren atención" />
        <KpiCard label="En investigación" value={inProgress.length} />
        <KpiCard label="Resueltos (mes)" value={resolved.length} />
      </div>
      <div className="d-flex flex-column gap-3">
        {items.map((incident) => {
          const critical = incident.status === "open" && incident.severity === "high";
          return (
            <div
              key={incident.id}
              className="ct-card ct-card-hoverable p-3"
              style={critical ? { borderColor: "var(--color-red)", boxShadow: "0 0 0 1px var(--color-red)" } : undefined}
            >
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <p className="ct-font-mono text-uppercase ct-text-faint mb-1" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>
                    #{String(incident.id).padStart(3, "0")} · {incident.category}
                  </p>
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{incident.title}</p>
                  <div className="d-flex align-items-center gap-2 mt-2 ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>
                    <span>{incident.unit}</span>
                    <span>·</span>
                    <span>{incident.resident}</span>
                    <span>·</span>
                    <span>{incident.reported}</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <StatusBadge status={incident.severity} />
                  <Form.Select
                    size="sm"
                    value={incident.status}
                    onChange={(event) => updateStatus(incident.id, event.target.value)}
                    style={{ width: "auto", fontSize: "0.75rem" }}
                  >
                    <option value="open">Abierto</option>
                    <option value="in_progress">En progreso</option>
                    <option value="resolved">Resuelto</option>
                  </Form.Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
