import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAccessLogs } from "@/modules/access/hooks/useAccessLogs";
import { VISITOR_AUTHS } from "@/modules/access/data/visitors.data";
import { RegisterAccessModal } from "@/modules/access/components/RegisterAccessModal";

export const AccessPage = () => {
  const { logs, ingressCount, egressCount, deniedCount } = useAccessLogs();
  const [showRegister, setShowRegister] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div className="ct-main-scroll">
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")} className="mb-4">
          {successMessage}
        </Alert>
      )}

      <div className="ct-grid-kpi-3 mb-4">
        <KpiCard label="Ingresos hoy" value={ingressCount} sub="Torre Madero" />
        <KpiCard label="Egresos hoy" value={egressCount} sub="Torre Madero" />
        <KpiCard label="Accesos denegados" value={deniedCount} sub={`Último: ${logs.find((l) => l.status === "denied")?.time ?? "—"}`} />
      </div>

      <div className="ct-grid-main mb-4">
        <div className="ct-card overflow-hidden">
          <div className="ct-card-header">
            <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              Registro de accesos
            </p>
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-sm text-white d-flex align-items-center gap-2"
                style={{ background: "var(--color-accent)" }}
                onClick={() => setShowRegister(true)}
              >
                <Icon name="plus" size={13} />
                Registrar acceso
              </button>
              <button type="button" className="btn btn-sm ct-card-link d-flex align-items-center gap-2">
                <Icon name="export" size={12} />
                Exportar
              </button>
            </div>
          </div>
          <table className="ct-table mb-0">
            <thead>
              <tr>
                {["Hora", "Persona", "Tipo", "Unidad", "Método", "Dirección", "Estado"].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>{log.time}</td>
                  <td className="fw-medium" style={{ color: "var(--color-ink)" }}>{log.person}</td>
                  <td className="ct-text-muted">{log.type}</td>
                  <td className="ct-font-mono" style={{ fontSize: "0.75rem" }}>{log.unit}</td>
                  <td className="ct-text-muted" style={{ fontSize: "0.75rem" }}>{log.method}</td>
                  <td className="ct-font-mono" style={{ fontSize: "0.75rem", color: log.direction === "Ingreso" ? "var(--color-green)" : "var(--color-ink-muted)" }}>
                    {log.direction}
                  </td>
                  <td>
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ct-card">
          <div className="ct-card-header">
            <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              Visitantes autorizados
            </p>
          </div>
          <div>
            {VISITOR_AUTHS.length === 0 && <p className="ct-text-muted px-3 py-3 mb-0">Sin autorizaciones vigentes.</p>}
            {VISITOR_AUTHS.map((visitor) => (
              <div key={visitor.id} className="ct-row ct-row-hover">
                <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{visitor.name}</p>
                <p className="ct-font-mono ct-text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                  {visitor.relation} · válido hasta {visitor.validUntil}
                </p>
                <StatusBadge status={visitor.status === "expired" ? "resolved" : "active"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <RegisterAccessModal
        show={showRegister}
        onHide={() => setShowRegister(false)}
        onRegistered={() => setSuccessMessage("Acceso registrado correctamente.")}
      />
    </div>
  );
};
