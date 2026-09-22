import { Form } from "react-bootstrap";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useMaintenance } from "@/modules/maintenance/hooks/useMaintenance";

export const MaintenancePage = () => {
  const { items, pending, inProgress, resolved, updateStatus } = useMaintenance();

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-kpi-3 mb-4">
        <KpiCard label="Pendientes" value={pending.length} />
        <KpiCard label="En progreso" value={inProgress.length} />
        <KpiCard label="Resueltos (mes)" value={resolved.length} />
      </div>
      <div className="d-flex flex-column gap-3">
        {items.map((item) => (
          <div key={item.id} className="ct-card ct-card-hoverable p-3 d-flex align-items-start gap-3">
            <span className={`ct-priority-dot ${item.priority}`} />
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{item.title}</p>
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <StatusBadge status={item.priority} />
                  <Form.Select
                    size="sm"
                    value={item.status}
                    onChange={(event) => updateStatus(item.id, event.target.value)}
                    style={{ width: "auto", fontSize: "0.75rem" }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En progreso</option>
                    <option value="resolved">Resuelto</option>
                  </Form.Select>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 mt-2 ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>
                <span>{item.unit}</span>
                <span>·</span>
                <span>{item.resident}</span>
                <span>·</span>
                <span>{item.assigned}</span>
                <span>·</span>
                <span>{item.reported}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
