import { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { useResidentsStore } from "@/modules/residents/context/ResidentsContext";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";

const emptyForm = (buildingId = "") => ({
  name: "",
  buildingId,
  unit: "",
  email: "",
  phone: "",
  type: "Inquilino",
});

export const CreateResidentModal = ({ show, onHide, onCreated, defaultBuildingId }) => {
  const { addResident } = useResidentsStore();
  const { buildings, getBuildingById } = useBuildings();
  const [form, setForm] = useState(emptyForm(defaultBuildingId ?? ""));
  const [error, setError] = useState("");

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleClose = () => {
    setForm(emptyForm(defaultBuildingId ?? ""));
    setError("");
    onHide();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const buildingId = Number(form.buildingId);
    const result = addResident({
      ...form,
      buildingId,
      buildingName: buildingId ? getBuildingById(buildingId).name : "",
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setForm(emptyForm(defaultBuildingId ?? ""));
    setError("");
    onCreated?.();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>Nuevo residente</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Nombre completo</Form.Label>
            <Form.Control placeholder="Ej. Valentina Rodríguez" value={form.name} onChange={updateField("name")} />
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-7">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Edificio</Form.Label>
              <Form.Select value={form.buildingId} onChange={updateField("buildingId")} disabled={!!defaultBuildingId}>
                <option value="">Seleccionar…</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-5">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Unidad</Form.Label>
              <Form.Control placeholder="Ej. 8B" value={form.unit} onChange={updateField("unit")} />
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Email</Form.Label>
            <Form.Control type="email" placeholder="residente@correo.com" value={form.email} onChange={updateField("email")} />
          </Form.Group>

          <div className="row g-3">
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Teléfono (opcional)</Form.Label>
              <Form.Control placeholder="+54 11 ..." value={form.phone} onChange={updateField("phone")} />
            </div>
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Condición</Form.Label>
              <Form.Select value={form.type} onChange={updateField("type")}>
                <option>Propietario</option>
                <option>Inquilino</option>
              </Form.Select>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="py-2 small mt-3 mb-0">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" style={{ background: "var(--color-accent)", borderColor: "var(--color-accent)" }}>
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

CreateResidentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
  defaultBuildingId: PropTypes.number,
};
