import { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { useAccessLogs } from "@/modules/access/hooks/useAccessLogs";

const EMPTY_FORM = {
  person: "",
  unit: "",
  type: "Visitante",
  method: "Manual",
  direction: "Ingreso",
};

export const RegisterAccessModal = ({ show, onHide, onRegistered }) => {
  const { addLogEntry } = useAccessLogs();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError("");
    onHide();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = addLogEntry(form);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setForm(EMPTY_FORM);
    setError("");
    onRegistered?.();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>Registrar acceso</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Nombre</Form.Label>
            <Form.Control placeholder="Ej. Carlos Pereyra" value={form.person} onChange={updateField("person")} />
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Tipo</Form.Label>
              <Form.Select value={form.type} onChange={updateField("type")}>
                <option>Residente</option>
                <option>Visitante</option>
                <option>Proveedor</option>
                <option>Delivery</option>
              </Form.Select>
            </div>
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Unidad (opcional)</Form.Label>
              <Form.Control placeholder="Ej. 8B" value={form.unit} onChange={updateField("unit")} />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Método</Form.Label>
              <Form.Select value={form.method} onChange={updateField("method")}>
                <option>Manual</option>
                <option>QR</option>
              </Form.Select>
            </div>
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Dirección</Form.Label>
              <Form.Select value={form.direction} onChange={updateField("direction")}>
                <option>Ingreso</option>
                <option>Egreso</option>
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
            Registrar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

RegisterAccessModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onRegistered: PropTypes.func,
};
