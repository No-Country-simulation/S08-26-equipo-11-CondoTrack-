import { useState } from "react";
import { Alert, Modal, Form, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { getApiErrorMessage } from "@/modules/buildings/services/buildingsService";

const EMPTY_FORM = {
  name: "",
  address: "",
  city: "",
  state: "",
  floors: "",
  units: "",
  zipCode: "",
  description: "",
};

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "El nombre es obligatorio.";
  if (!form.address.trim()) errors.address = "La dirección es obligatoria.";
  if (!form.city.trim()) errors.city = "La ciudad es obligatoria.";
  if (!form.state.trim()) errors.state = "La provincia/estado es obligatorio.";
  if (!form.floors || Number(form.floors) <= 0)
    errors.floors = "Ingresá una cantidad de pisos válida.";
  if (!form.units || Number(form.units) <= 0)
    errors.units = "Ingresá una cantidad de unidades válida.";
  return errors;
};

export const CreateBuildingModal = ({ show, onHide, onCreated }) => {
  const { addBuilding } = useBuildings();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setServerError("");
    onHide();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    setServerError("");

    try {
      await addBuilding(form);
      setForm(EMPTY_FORM);
      onCreated?.();
      onHide();
    } catch (err) {
      setServerError(
        getApiErrorMessage(
          err,
          "No se pudo crear el edificio. Intenta nuevamente.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>Nuevo edificio</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {serverError && (
            <Alert variant="danger" className="py-2 small">
              {serverError}
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
              placeholder="Ej. Torre Madero"
              value={form.name}
              onChange={updateField("name")}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
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
              placeholder="Ej. Av. Alicia M. de Justo 850"
              value={form.address}
              onChange={updateField("address")}
              isInvalid={!!errors.address}
            />
            <Form.Control.Feedback type="invalid">
              {errors.address}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Ciudad
              </Form.Label>
              <Form.Control
                placeholder="Ej. Buenos Aires"
                value={form.city}
                onChange={updateField("city")}
                isInvalid={!!errors.city}
              />
              <Form.Control.Feedback type="invalid">
                {errors.city}
              </Form.Control.Feedback>
            </div>
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Provincia / Estado
              </Form.Label>
              <Form.Control
                placeholder="Ej. CABA"
                value={form.state}
                onChange={updateField("state")}
                isInvalid={!!errors.state}
              />
              <Form.Control.Feedback type="invalid">
                {errors.state}
              </Form.Control.Feedback>
            </div>
          </div>

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
                min={1}
                value={form.floors}
                onChange={updateField("floors")}
                isInvalid={!!errors.floors}
              />
              <Form.Control.Feedback type="invalid">
                {errors.floors}
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
                min={1}
                value={form.units}
                onChange={updateField("units")}
                isInvalid={!!errors.units}
              />
              <Form.Control.Feedback type="invalid">
                {errors.units}
              </Form.Control.Feedback>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Código postal (opcional)
              </Form.Label>
              <Form.Control
                placeholder="Ej. C1107"
                value={form.zipCode}
                onChange={updateField("zipCode")}
              />
            </div>
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Descripción (opcional)
              </Form.Label>
              <Form.Control
                placeholder="Ej. Torre residencial"
                value={form.description}
                onChange={updateField("description")}
              />
            </div>
          </div>
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

CreateBuildingModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
};
