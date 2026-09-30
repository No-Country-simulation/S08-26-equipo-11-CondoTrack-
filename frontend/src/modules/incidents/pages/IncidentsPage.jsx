import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Alert, Button, Form } from "react-bootstrap";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Icon } from "@/shared/components/Icon";
import { useIncidents } from "@/modules/incidents/hooks/useIncidents";
import { listUnits } from "@/modules/units/services/unitsService";
import { INCIDENT_SEVERITIES } from "@/modules/incidents/services/incidentsService";
import { apiErrorMessage } from "@/core/api/api";

const EMPTY_FORM = {
  unitId: "",
  title: "",
  description: "",
  severity: "MEDIUM",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("es-AR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export const IncidentsPage = () => {
  const { building } = useOutletContext();
  const buildingId = building?.id ?? null;
  const { forBuilding, updateStatus, reportIncident, isLoading, getError } =
    useIncidents();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [units, setUnits] = useState([]);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const items = forBuilding(buildingId);
  const open = items.filter((i) => i.status === "open" || i.status === "OPEN");
  const inProgress = items.filter(
    (i) => i.status === "in_progress" || i.status === "IN_PROGRESS",
  );
  const resolved = items.filter(
    (i) => i.status === "resolved" || i.status === "RESOLVED",
  );
  const loading = isLoading(buildingId);
  const loadError = getError(buildingId);

  useEffect(() => {
    if (!buildingId) {
      return undefined;
    }
    let cancelled = false;
    listUnits(buildingId)
      .then(({ units: buildingUnits }) => {
        if (!cancelled) setUnits(buildingUnits);
      })
      .catch(() => {
        if (!cancelled) setUnits([]);
      });
    return () => {
      cancelled = true;
    };
  }, [buildingId]);

  const unitCodeOf = (unitId) =>
    units.find((unit) => unit.id === unitId)?.code ?? "";

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.unitId || !form.title.trim() || !form.description.trim()) {
      setFormError("Elegí unidad y completá título y descripción.");
      return;
    }

    setSaving(true);
    try {
      await reportIncident(buildingId, form.unitId, {
        title: form.title,
        description: form.description,
        severity: form.severity,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSuccessMessage("Incidente reportado correctamente.");
    } catch (err) {
      setFormError(apiErrorMessage(err, "No se pudo reportar el incidente."));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (incident) => async (event) => {
    setActionError("");
    try {
      await updateStatus(incident.id, event.target.value, incident.buildingId);
    } catch (err) {
      setActionError(
        apiErrorMessage(err, "No se pudo actualizar el incidente."),
      );
    }
  };

  return (
    <div className="ct-main-scroll">
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage("")}
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}
      {actionError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setActionError("")}
          className="mb-4"
        >
          {actionError}
        </Alert>
      )}
      {loadError && (
        <Alert variant="danger" className="mb-4">
          {loadError}
        </Alert>
      )}

      <div className="ct-grid-kpi-3 mb-4">
        <KpiCard
          label="Abiertos"
          value={open.length}
          sub="Requieren atención"
        />
        <KpiCard label="En investigación" value={inProgress.length} />
        <KpiCard label="Resueltos (mes)" value={resolved.length} />
      </div>

      <div className="d-flex justify-content-end mb-4">
        <button
          type="button"
          className="btn btn-sm text-white d-flex align-items-center gap-2"
          style={{ background: "var(--color-accent)" }}
          onClick={() => setShowForm((v) => !v)}
        >
          <Icon name="plus" size={14} />
          Reportar incidente
        </button>
      </div>

      {showForm && (
        <div className="ct-card p-4 mb-4">
          <p
            className="ct-font-mono text-uppercase ct-text-muted mb-3"
            style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
          >
            Nuevo incidente — {building?.name}
          </p>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Unidad
                </Form.Label>
                <Form.Select
                  value={form.unitId}
                  onChange={updateField("unitId")}
                  required
                >
                  <option value="">Seleccioná una unidad</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.code} · Piso {unit.floor}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-6">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Severidad
                </Form.Label>
                <Form.Select
                  value={form.severity}
                  onChange={updateField("severity")}
                  required
                >
                  {INCIDENT_SEVERITIES.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-12">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Título
                </Form.Label>
                <Form.Control
                  placeholder="Ej. Pérdida de agua en palier"
                  value={form.title}
                  onChange={updateField("title")}
                  required
                />
              </div>
              <div className="col-12">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Descripción
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Describí el incidente…"
                  value={form.description}
                  onChange={updateField("description")}
                  required
                />
              </div>
            </div>

            {formError && (
              <Alert variant="danger" className="py-2 small mb-3">
                {formError}
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                style={{
                  background: "var(--color-accent)",
                  borderColor: "var(--color-accent)",
                }}
              >
                {saving ? "Guardando..." : "Reportar"}
              </Button>
            </div>
          </Form>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {loading && <p className="ct-text-muted">Cargando incidentes...</p>}
        {!loading &&
          items.map((incident) => {
            const critical =
              (incident.status === "open" || incident.status === "OPEN") &&
              (incident.severity === "high" ||
                incident.severity === "HIGH" ||
                incident.severity === "CRITICAL");
            return (
              <div
                key={incident.id}
                className="ct-card ct-card-hoverable p-3"
                style={
                  critical
                    ? {
                        borderColor: "var(--color-red)",
                        boxShadow: "0 0 0 1px var(--color-red)",
                      }
                    : undefined
                }
              >
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <p
                      className="ct-font-mono text-uppercase ct-text-faint mb-1"
                      style={{ fontSize: "10px", letterSpacing: "0.05em" }}
                    >
                      {unitCodeOf(incident.unitId)
                        ? `Unidad ${unitCodeOf(incident.unitId)}`
                        : "General"}
                      {" · "}
                      {formatDateTime(incident.createdAt)}
                    </p>
                    <p
                      className="mb-0 fw-medium"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {incident.title}
                    </p>
                    {incident.description && (
                      <p
                        className="ct-text-muted mb-0 mt-1"
                        style={{ fontSize: "0.8125rem" }}
                      >
                        {incident.description}
                      </p>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <StatusBadge status={incident.severity} />
                    <Form.Select
                      size="sm"
                      value={incident.status}
                      onChange={handleStatusChange(incident)}
                      style={{ width: "auto", fontSize: "0.75rem" }}
                    >
                      <option value="OPEN">Abierto</option>
                      <option value="IN_PROGRESS">En progreso</option>
                      <option value="RESOLVED">Resuelto</option>
                      <option value="CLOSED">Cerrado</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
            );
          })}
        {!loading && items.length === 0 && (
          <div className="text-center py-4 ct-text-muted">
            Sin incidentes en este edificio.
          </div>
        )}
      </div>
    </div>
  );
};
