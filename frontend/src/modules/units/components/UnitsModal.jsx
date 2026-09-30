import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { useUnits } from "@/modules/units/context/UnitsContext";
import { apiErrorMessage } from "@/core/api/api";

const EMPTY_FORM = {
  code: "",
  floor: "",
  unitType: "DEPARTAMENTO",
  description: "",
};

const UNIT_TYPES = [
  "DEPARTAMENTO",
  "LOCAL",
  "OFICINA",
  "COCHERA",
  "BAULERA",
  "OTRO",
];

export const UnitsModal = ({ building, show, onHide }) => {
  const { forBuilding, fetchUnits, isUnitsLoading, unitsError, createUnit } =
    useUnits();
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show && building?.id) {
      fetchUnits(building.id);
    }
  }, [show, building, fetchUnits]);

  if (!building) return null;

  const units = forBuilding(building.id);
  const loading = isUnitsLoading(building.id);
  const error = unitsError(building.id);

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const validate = () => {
    const errors = {};
    if (!form.code.trim()) errors.code = "El código es obligatorio.";
    if (
      form.floor === "" ||
      Number(form.floor) < 0 ||
      !Number.isInteger(Number(form.floor))
    )
      errors.floor = "Ingresá un piso válido (0 o mayor).";
    if (!form.unitType.trim()) errors.unitType = "El tipo es obligatorio.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    setServerError("");

    try {
      await createUnit(building.id, form);
      setForm(EMPTY_FORM);
      setFieldErrors({});
    } catch (err) {
      const status = err?.response?.status;
      setServerError(
        apiErrorMessage(
          err,
          `No se pudo crear la unidad.${status ? ` (HTTP ${status})` : " Revisá tu conexión e intenta nuevamente."}`,
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>
          Unidades -{building.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <p className="ct-text-muted">Cargando unidades...</p>}
        {error && (
          <Alert variant="danger" className="py-2 small">
            {error}
          </Alert>
        )}
        {!loading && !error && (
          <div className="d-flex flex-wrap gap-2 mb-4">
            {units.length === 0 && (
              <span className="ct-text-muted">
                Todavía no hay unidades cargadas.
              </span>
            )}
            {units.map((unit) => (
              <Link
                key={unit.id}
                to={`/dashboard/edificios/${building.id}/unidades/${unit.id}`}
                onClick={onHide}
                className="badge bg-light text-dark border px-2 py-2 text-decoration-none"
                title={`${unit.unitType} · Piso ${unit.floor}`}
              >
                {unit.label}
              </Link>
            ))}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <p
            className="ct-font-mono text-uppercase ct-text-muted mb-3"
            style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
          >
            Nueva unidad
          </p>
          {serverError && (
            <Alert variant="danger" className="py-2 small mb-3">
              {serverError}
            </Alert>
          )}
          <div className="row g-3 mb-3">
            <div className="col-4">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Código
              </Form.Label>
              <Form.Control
                placeholder="Ej. 1A"
                value={form.code}
                onChange={updateField("code")}
                isInvalid={!!fieldErrors.code}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.code}
              </Form.Control.Feedback>
            </div>
            <div className="col-4">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Piso
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                step={1}
                value={form.floor}
                onChange={updateField("floor")}
                isInvalid={!!fieldErrors.floor}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.floor}
              </Form.Control.Feedback>
            </div>
            <div className="col-4">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Tipo
              </Form.Label>
              <Form.Select
                value={form.unitType}
                onChange={updateField("unitType")}
                isInvalid={!!fieldErrors.unitType}
              >
                {UNIT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.unitType}
              </Form.Control.Feedback>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onHide}
              disabled={saving}
            >
              Cerrar
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
              {saving ? "Guardando..." : "Agregar"}
            </Button>
          </div>
          <p
            className="ct-text-muted text-end mb-0 mt-2"
            style={{ fontSize: "0.6875rem" }}
          >
            El código se guarda en mayúsculas. Respetá la capacidad del
            edificio.
          </p>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

UnitsModal.propTypes = {
  building: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }),
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};
