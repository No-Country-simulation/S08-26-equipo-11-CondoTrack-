import { useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { updateBuilding } from "@/modules/buildings/services/buildingsService";
import { apiErrorMessage } from "@/core/api/api";

// Edición de edificio (PATCH /api/buildings/:id, solo SUPER_ADMIN).
// El backend acepta únicamente name/address/numberOfFloors/numberOfUnits/
// isActive: ciudad, provincia, postal y descripción son de solo lectura acá.
export const EditBuildingModal = ({ building, show, onHide, onSaved }) => {
  const { refreshBuildings } = useBuildings();
  const [form, setForm] = useState(() => ({
    name: building?.name ?? "",
    address: building?.address ?? "",
    floors: building?.floors ?? "",
    units: building?.capacity ?? "",
    isActive: building?.isActive ?? true,
  }));
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!building) return null;

  const updateField = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFieldErrors({});
    setError("");
    onHide();
  };

  const validate = () => {
    const errors = {};
    if (!String(form.name ?? "").trim())
      errors.name = "El nombre es obligatorio.";
    if (!String(form.address ?? "").trim())
      errors.address = "La dirección es obligatoria.";
    if (
      form.floors === "" ||
      !Number.isInteger(Number(form.floors)) ||
      Number(form.floors) < 0
    )
      errors.floors = "Ingresá pisos válidos (0 o mayor).";
    if (
      form.units === "" ||
      !Number.isInteger(Number(form.units)) ||
      Number(form.units) < 0
    )
      errors.units = "Ingresá capacidad válida (0 o mayor).";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationErrors = validate();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      await updateBuilding(building.id, {
        name: String(form.name).trim(),
        address: String(form.address).trim(),
        numberOfFloors: Number(form.floors),
        numberOfUnits: Number(form.units),
        isActive: Boolean(form.isActive),
      });
      await refreshBuildings();
      onSaved?.();
      handleClose();
    } catch (err) {
      setError(
        apiErrorMessage(err, "No se pudo guardar el edificio."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>
          Editar edificio
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="py-2 small mb-3">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label
              className="ct-font-mono ct-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              Nombre
            </Form.Label>
            <Form.Control
              value={form.name}
              onChange={updateField("name")}
              isInvalid={!!fieldErrors.name}
              required
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label
              className="ct-font-mono ct-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              Dirección
            </Form.Label>
            <Form.Control
              value={form.address}
              onChange={updateField("address")}
              isInvalid={!!fieldErrors.address}
              required
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.address}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Pisos
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                step={1}
                value={form.floors}
                onChange={updateField("floors")}
                isInvalid={!!fieldErrors.floors}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.floors}
              </Form.Control.Feedback>
            </div>
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Unidades (capacidad)
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                step={1}
                value={form.units}
                onChange={updateField("units")}
                isInvalid={!!fieldErrors.units}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.units}
              </Form.Control.Feedback>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="building-is-active"
              label="Edificio activo"
              checked={Boolean(form.isActive)}
              onChange={updateField("isActive")}
            />
          </Form.Group>

          <p className="ct-font-mono ct-text-faint mb-0" style={{ fontSize: "0.6875rem" }}>
            Ciudad, provincia, postal y descripción no se editan por API.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleClose}
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
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

EditBuildingModal.propTypes = {
  building: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    address: PropTypes.string,
    floors: PropTypes.number,
    capacity: PropTypes.number,
    isActive: PropTypes.bool,
  }),
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};
