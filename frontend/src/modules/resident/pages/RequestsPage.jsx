import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useMaintenance } from "@/modules/maintenance/hooks/useMaintenance";
import { useIncidents } from "@/modules/incidents/hooks/useIncidents";
import { useRequestsTabs } from "@/modules/resident/hooks/useRequestsTabs";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

const MAINTENANCE_CATEGORIES = ["Plomería", "Electricidad", "Climatización", "Estructura", "Otro"];
const INCIDENT_CATEGORIES = ["Convivencia", "Seguridad", "Daños", "Limpieza", "Otro"];

export const RequestsPage = () => {
  const { forUnit } = useMaintenance();
  const { forResident } = useIncidents();
  const { tab, setTab, showForm, setShowForm, form, updateField, submit } = useRequestsTabs();
  const current = useCurrentResident();

  const myMaintenance = forUnit(current.unit);
  const myIncidents = forResident(current.name);
  const categories = tab === "mantenimiento" ? MAINTENANCE_CATEGORIES : INCIDENT_CATEGORIES;

  return (
    <div className="ct-main-scroll">
      <div className="d-inline-flex gap-1 mb-4 p-1 rounded-3" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        {["mantenimiento", "incidentes"].map((t) => (
          <button
            key={t}
            type="button"
            className="btn btn-sm text-capitalize"
            style={{
              background: tab === t ? "var(--color-accent)" : "transparent",
              color: tab === t ? "white" : "var(--color-ink-muted)",
            }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <p className="ct-font-mono ct-text-muted text-uppercase mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
          {tab === "mantenimiento" ? `${myMaintenance.length} solicitudes` : `${myIncidents.length} incidentes`}
        </p>
        <button
          type="button"
          className="btn btn-sm text-white d-flex align-items-center gap-2"
          style={{ background: "var(--color-accent)" }}
          onClick={() => setShowForm((v) => !v)}
        >
          <Icon name="plus" size={13} />
          Nueva solicitud
        </button>
      </div>

      {showForm && (
        <div className="ct-card p-4 mb-4">
          <p className="ct-font-mono text-uppercase ct-text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            Nueva solicitud de {tab}
          </p>
          <div className="row g-3 mb-3">
            <div className="col-12">
              <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Título</label>
              <input
                className="form-control form-control-sm"
                placeholder={tab === "mantenimiento" ? "Ej. Pérdida de agua en cocina" : "Ej. Ruidos molestos en unidad vecina"}
                value={form.title}
                onChange={updateField("title")}
              />
            </div>
            <div className="col-6">
              <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>
                {tab === "mantenimiento" ? "Área" : "Categoría"}
              </label>
              <select className="form-select form-select-sm" value={form.category} onChange={updateField("category")}>
                <option value="">Seleccionar…</option>
                {categories.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Prioridad</label>
              <select className="form-select form-select-sm" value={form.priority} onChange={updateField("priority")}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Descripción</label>
              <textarea
                rows={3}
                className="form-control form-control-sm"
                placeholder="Describí el problema con el mayor detalle posible…"
                value={form.description}
                onChange={updateField("description")}
              />
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-sm text-white" style={{ background: "var(--color-accent)" }} onClick={submit}>
              Enviar solicitud
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {tab === "mantenimiento"
          ? myMaintenance.map((item) => (
              <div key={item.id} className="ct-card p-3 d-flex align-items-start gap-3">
                <span className={`ct-priority-dot ${item.priority}`} />
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-start justify-content-between gap-3">
                    <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{item.title}</p>
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <StatusBadge status={item.priority} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                  <p className="ct-font-mono ct-text-muted mb-0 mt-2" style={{ fontSize: "0.75rem" }}>
                    Asignado a: {item.assigned} · {item.reported}
                  </p>
                </div>
              </div>
            ))
          : myIncidents.map((incident) => (
              <div key={incident.id} className="ct-card p-3">
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <p className="ct-font-mono text-uppercase ct-text-faint mb-1" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>
                      #{String(incident.id).padStart(3, "0")} · {incident.category}
                    </p>
                    <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{incident.title}</p>
                    <p className="ct-font-mono ct-text-muted mb-0 mt-2" style={{ fontSize: "0.75rem" }}>{incident.unit} · {incident.reported}</p>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <StatusBadge status={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                </div>
              </div>
            ))}

        {((tab === "mantenimiento" && myMaintenance.length === 0) || (tab === "incidentes" && myIncidents.length === 0)) && (
          <div className="ct-card text-center py-5 ct-text-muted">Sin {tab} registrados</div>
        )}
      </div>
    </div>
  );
};
