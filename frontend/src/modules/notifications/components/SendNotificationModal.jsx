import { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { useNotificationsStore } from "@/modules/notifications/context/NotificationsContext";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";

const EMPTY_FORM = { title: "", body: "", buildingId: "", unit: "" };

export const SendNotificationModal = ({ show, onHide, onSent }) => {
  const { notify } = useNotificationsStore();
  const { buildings } = useBuildings();
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
    if (!form.title.trim() || !form.body.trim()) {
      setError("Completá título y mensaje.");
      return;
    }

    notify({
      type: "announcement",
      title: form.title.trim(),
      body: form.body.trim(),
      buildingId: form.buildingId ? Number(form.buildingId) : null,
      unit: form.unit.trim() || null,
    });
    setForm(EMPTY_FORM);
    setError("");
    onSent?.();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>Nuevo aviso</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Título</Form.Label>
            <Form.Control placeholder="Ej. Corte de agua programado" value={form.title} onChange={updateField("title")} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Mensaje</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Detalle del aviso…" value={form.body} onChange={updateField("body")} />
          </Form.Group>

          <div className="row g-3">
            <div className="col-7">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Destinatarios</Form.Label>
              <Form.Select value={form.buildingId} onChange={updateField("buildingId")}>
                <option value="">Todos los edificios</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-5">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Unidad (opcional)</Form.Label>
              <Form.Control placeholder="Ej. 8B" value={form.unit} onChange={updateField("unit")} disabled={!form.buildingId} />
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
            Enviar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

SendNotificationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSent: PropTypes.func,
};
