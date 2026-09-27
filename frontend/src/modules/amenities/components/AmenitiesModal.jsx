import { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { useAmenities } from "@/modules/amenities/context/AmenitiesContext";

const EMPTY_FORM = { name: "", capacity: "", openTime: "", closeTime: "" };

export const AmenitiesModal = ({ building, show, onHide }) => {
  const { forBuilding, addAmenity } = useAmenities();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  if (!building) return null;

  const amenities = forBuilding(building.id);

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = addAmenity(building.id, form);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setError("");
    setForm(EMPTY_FORM);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>Amenidades — {building.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          {amenities.length === 0 && <p className="ct-text-muted mb-0">Todavía no hay amenidades cargadas.</p>}
          {amenities.map((amenity) => (
            <div key={amenity.id} className="ct-row ct-row-hover d-flex align-items-center justify-content-between">
              <div>
                <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{amenity.name}</p>
                <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                  Capacidad: {amenity.capacity} · {amenity.openTime}–{amenity.closeTime}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Nombre del espacio</Form.Label>
            <Form.Control placeholder="Ej. Gimnasio" value={form.name} onChange={updateField("name")} />
          </Form.Group>
          <div className="row g-2 mb-2">
            <div className="col-4">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Capacidad</Form.Label>
              <Form.Control type="number" min={1} value={form.capacity} onChange={updateField("capacity")} />
            </div>
            <div className="col-4">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Desde</Form.Label>
              <Form.Control type="time" value={form.openTime} onChange={updateField("openTime")} />
            </div>
            <div className="col-4">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Hasta</Form.Label>
              <Form.Control type="time" value={form.closeTime} onChange={updateField("closeTime")} />
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="py-2 small mb-3">
              {error}
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" size="sm" onClick={onHide}>
              Cerrar
            </Button>
            <Button type="submit" size="sm" style={{ background: "var(--color-accent)", borderColor: "var(--color-accent)" }}>
              Agregar espacio
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

AmenitiesModal.propTypes = {
  building: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};
