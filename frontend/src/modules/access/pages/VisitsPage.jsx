import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { QRCode } from "@/modules/access/components/QRCode";
import { useAccessLogs } from "@/modules/access/hooks/useAccessLogs";
import { useVisitorAuthorizations } from "@/modules/access/hooks/useVisitorAuthorizations";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

const initialsOf = (name) =>
  name.split(" ").map((part) => part[0]).join("").slice(0, 2);

export const VisitsPage = () => {
  const { forResident } = useAccessLogs();
  const { visitors, showForm, setShowForm, form, updateField, submit, cancel } = useVisitorAuthorizations();
  const current = useCurrentResident();
  const myAccess = forResident(current);

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-visits">
        <div className="ct-card d-flex flex-column align-items-center gap-4 p-4">
          <div className="text-center">
            <p className="ct-font-mono text-uppercase ct-text-muted mb-1" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              Código de acceso
            </p>
            <p className="ct-font-mono ct-text-faint mb-0" style={{ fontSize: "0.75rem" }}>
              Unidad {current.unit} · {current.building}
            </p>
          </div>
          <div className="p-2 rounded-3" style={{ border: "2px solid var(--color-border)" }}>
            <QRCode size={180} />
          </div>
          <div className="text-center">
            <p className="ct-font-display fw-semibold mb-0" style={{ color: "var(--color-ink)" }}>{current.name}</p>
            <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.75rem" }}>
              VR-{current.unit}-TM-2021
            </p>
          </div>
          <div className="ct-badge ct-badge-green" style={{ fontSize: "0.75rem" }}>
            Activo · Válido hoy
          </div>
          <p className="ct-font-mono ct-text-faint text-center mb-0" style={{ fontSize: "0.6875rem" }}>
            Presentá este código en recepción o escanealo en el lector de acceso
          </p>
        </div>

        <div className="d-flex flex-column gap-4">
          <div className="ct-card">
            <div className="ct-card-header">
              <h3 className="ct-card-title">Visitantes autorizados</h3>
              <button
                type="button"
                className="btn btn-sm text-white d-flex align-items-center gap-2"
                style={{ background: "var(--color-accent)" }}
                onClick={() => setShowForm((prev) => !prev)}
              >
                <Icon name="plus" size={13} />
                Autorizar visitante
              </button>
            </div>

            {showForm && (
              <div className="ct-row" style={{ background: "var(--color-canvas)" }}>
                <p className="ct-font-mono text-uppercase ct-text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                  Nueva autorización
                </p>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Nombre completo</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Ej. Juan García"
                      value={form.name}
                      onChange={updateField("name")}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Relación</label>
                    <select className="form-select form-select-sm" value={form.relation} onChange={updateField("relation")}>
                      <option value="">Seleccionar…</option>
                      <option>Familiar</option>
                      <option>Amigo/a</option>
                      <option>Proveedor</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Fecha de visita</label>
                    <input type="date" className="form-control form-control-sm" value={form.date} onChange={updateField("date")} />
                  </div>
                  <div className="col-6">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Nota (opcional)</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Motivo de la visita"
                      value={form.note}
                      onChange={updateField("note")}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-sm text-white" style={{ background: "var(--color-accent)" }} onClick={submit}>
                    Confirmar autorización
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={cancel}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div>
              {visitors.map((visitor) => (
                <div key={visitor.id} className="ct-row ct-row-hover d-flex align-items-center gap-3">
                  <div
                    className="ct-avatar"
                    style={{ width: 32, height: 32, fontSize: "0.75rem", background: visitor.status === "expired" ? "var(--color-ink-faint)" : "var(--color-accent)" }}
                  >
                    {initialsOf(visitor.name)}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{visitor.name}</p>
                    <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                      {visitor.relation} · válido hasta {visitor.validUntil}
                    </p>
                  </div>
                  <StatusBadge status={visitor.status === "expired" ? "resolved" : "active"} />
                </div>
              ))}
            </div>
          </div>

          <div className="ct-card">
            <div className="ct-card-header">
              <h3 className="ct-card-title">Historial de accesos — Unidad {current.unit}</h3>
            </div>
            <div>
              {myAccess.map((log) => (
                <div key={log.id} className="ct-row ct-row-hover d-flex align-items-center gap-3">
                  <span className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem", width: 40, flexShrink: 0 }}>{log.time}</span>
                  <div className="flex-grow-1">
                    <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{log.person}</p>
                    <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{log.type} · {log.method}</p>
                  </div>
                  <span className="ct-font-mono" style={{ fontSize: "0.75rem", color: log.direction === "Ingreso" ? "var(--color-green)" : "var(--color-ink-muted)" }}>
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
