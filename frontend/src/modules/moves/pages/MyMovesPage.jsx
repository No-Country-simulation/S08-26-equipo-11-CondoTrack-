import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useMoves } from "@/modules/moves/context/MovesContext";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

const EMPTY_FORM = { type: "Mudanza de entrada", date: "", time: "", notes: "" };

export const MyMovesPage = () => {
  const { forUnit, requestMove } = useMoves();
  const current = useCurrentResident();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const myMoves = forUnit(current.unit);

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = requestMove({
      buildingId: current.buildingId,
      unit: current.unit,
      resident: current.name,
      ...form,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setError("");
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSuccess("Solicitud de mudanza enviada. La administración la revisará en breve.");
  };

  return (
    <div className="ct-main-scroll">
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")} className="mb-4">
          {success}
        </Alert>
      )}

      <div className="d-flex align-items-center justify-content-between mb-4">
        <p className="ct-font-mono ct-text-muted text-uppercase mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
          {myMoves.length} solicitudes
        </p>
        <button
          type="button"
          className="btn btn-sm text-white d-flex align-items-center gap-2"
          style={{ background: "var(--color-accent)" }}
          onClick={() => setShowForm((v) => !v)}
        >
          <Icon name="plus" size={13} />
          Solicitar mudanza
        </button>
      </div>

      {showForm && (
        <div className="ct-card p-4 mb-4">
          <p className="ct-font-mono text-uppercase ct-text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            Nueva solicitud de mudanza
          </p>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Tipo</label>
                <select className="form-select form-select-sm" value={form.type} onChange={updateField("type")}>
                  <option>Mudanza de entrada</option>
                  <option>Mudanza de salida</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Fecha</label>
                <input type="date" className="form-control form-control-sm" value={form.date} onChange={updateField("date")} />
              </div>
              <div className="col-6">
                <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Horario</label>
                <input
                  type="text"
                  placeholder="Ej. 09:00 – 13:00"
                  className="form-control form-control-sm"
                  value={form.time}
                  onChange={updateField("time")}
                />
              </div>
              <div className="col-12">
                <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Notas (opcional)</label>
                <textarea
                  rows={2}
                  className="form-control form-control-sm"
                  placeholder="Ej. Camión mediano, requiere ascensor de servicio"
                  value={form.notes}
                  onChange={updateField("notes")}
                />
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="py-2 small mb-3">
                {error}
              </Alert>
            )}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-sm text-white" style={{ background: "var(--color-accent)" }}>
                Enviar solicitud
              </button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {myMoves.map((move) => (
          <div key={move.id} className="ct-card p-3 d-flex align-items-start justify-content-between gap-3">
            <div>
              <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{move.type}</p>
              <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.75rem" }}>{move.date} · {move.time}</p>
              {move.notes && <p className="ct-text-muted mb-0 mt-1" style={{ fontSize: "0.8125rem" }}>{move.notes}</p>}
            </div>
            <StatusBadge status={move.status === "confirmed" ? "confirmed" : move.status === "rejected" ? "denied" : "pending"} />
          </div>
        ))}
        {myMoves.length === 0 && (
          <div className="ct-card text-center py-5 ct-text-muted">Sin solicitudes de mudanza registradas.</div>
        )}
      </div>
    </div>
  );
};
